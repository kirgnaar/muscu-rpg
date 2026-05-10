/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — auth.js
   Authentification Google via Firebase Auth
   ══════════════════════════════════════════════════════════════════════════

   STRATÉGIE : Popup par défaut, Redirect sur iOS PWA standalone.
   ───────────────────────────────────────────────────────────────
   • signInWithPopup  : desktop / Android / Safari normal.
   • signInWithRedirect : iOS PWA standalone (navigator.standalone === true)
     car WKWebView bloque les popups.
   • getRedirectResult : appelé UNIQUEMENT après un redirect (iOS).
   • onAuthStateChanged : source de vérité. Firebase SDK bufferise le premier
     emit jusqu'à avoir lu localStorage → pas de double-emit null/user.

   PERSISTANCE : browserLocalPersistence (localStorage), déclaré
   explicitement dans firebase-config.js via initializeAuth().
   ══════════════════════════════════════════════════════════════════════════ */

import { auth } from './firebase-config.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { syncData } from './sync.js';

var googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export var Auth = {
  user: null,

  init: function() {
    var self = this;
    console.log('[Auth] init() — démarrage');

    // ── 1. Cache UI immédiat — évite le flash "non connecté" ─────────────
    var cachedUser = null;
    try { cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null'); } catch(e) {}
    if (cachedUser && cachedUser.uid) {
      console.log('[Auth] cache localStorage trouvé :', cachedUser.displayName);
      self.user = cachedUser;
      self._updateUI(cachedUser);
    } else {
      console.log('[Auth] aucun cache localStorage (mrpg_auth_cache)');
    }

    // ── 2. Vérification des clés Firebase dans localStorage ───────────────
    var fbKeys = Object.keys(localStorage).filter(function(k) { return k.indexOf('firebase:authUser:') === 0; });
    console.log('[Auth] clés Firebase dans localStorage :', fbKeys.length ? fbKeys : 'aucune');

    // ── 3. getRedirectResult — UNIQUEMENT sur iOS PWA standalone ─────────
    var isIOSStandalone = (typeof navigator.standalone !== 'undefined') && !!navigator.standalone;
    console.log('[Auth] isIOSStandalone :', isIOSStandalone);
    if (isIOSStandalone) {
      getRedirectResult(auth).then(function(result) {
        if (result && result.user) {
          console.log('[Auth] iOS redirect OK :', result.user.displayName);
        } else {
          console.log('[Auth] iOS getRedirectResult : aucun résultat');
        }
      }).catch(function(err) {
        if (err.code !== 'auth/no-auth-event' && err.code !== 'auth/null-user') {
          console.warn('[Auth] getRedirectResult :', err.code, err.message);
        }
      });
    }

    // ── 4. Source de vérité ───────────────────────────────────────────────
    onAuthStateChanged(auth, function(user) {
      console.log('[Auth] onAuthStateChanged :', user ? ('connecté → ' + user.email) : 'null (déconnecté)');
      if (user) {
        var userData = {
          uid:         user.uid,
          displayName: user.displayName || 'Guerrier',
          photoURL:    user.photoURL    || ''
        };
        try { localStorage.setItem('mrpg_auth_cache', JSON.stringify(userData)); } catch(e) {}
        self.user = user;
        self._updateUI(user);
        self._setSyncStatus('syncing');
        setTimeout(function() { syncData(user.uid); }, 300);
      } else {
        self.user = null;
        try { localStorage.removeItem('mrpg_auth_cache'); } catch(e) {}
        self._updateUI(null);
        self._setSyncStatus('offline');
      }
    });
  },

  // ── Connexion ─────────────────────────────────────────────────────────
  login: function() {
    var self = this;
    console.log('[Auth] login() appelé');
    var btn = document.getElementById('auth-login-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '🔄 Connexion...'; }

    var isIOSStandalone = (typeof navigator.standalone !== 'undefined') && !!navigator.standalone;

    if (isIOSStandalone) {
      console.log('[Auth] → signInWithRedirect (iOS standalone)');
      signInWithRedirect(auth, googleProvider).catch(function(err) {
        console.error('[Auth] signInWithRedirect error :', err.code, err.message);
        self._showError('Connexion échouée (' + err.code + '). Réessaie.');
      });
    } else {
      console.log('[Auth] → signInWithPopup');
      signInWithPopup(auth, googleProvider).then(function(result) {
        console.log('[Auth] signInWithPopup OK :', result.user.email);
      }).catch(function(err) {
        console.error('[Auth] signInWithPopup error :', err.code, err.message);
        if (err.code === 'auth/popup-blocked') {
          self._showError('Popup bloqué — autorise les popups pour ce site dans ton navigateur, puis réessaie.');
        } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
          self._updateUI(null);
        } else {
          self._showError('Connexion échouée (' + err.code + '). Réessaie.');
        }
      });
    }
  },

  logout: function() {
    var self = this;
    console.log('[Auth] logout() appelé');
    signOut(auth).then(function() {
      try { localStorage.removeItem('mrpg_auth_cache'); } catch(e) {}
      self._updateUI(null);
      self._setSyncStatus('offline');
      if (typeof toast === 'function') toast('Déconnecté ✓');
    }).catch(function(err) {
      console.warn('[Auth] Logout error :', err);
    });
  },

  _updateUI: function(user) {
    var loginBtn    = document.getElementById('auth-login-btn');
    var userProfile = document.getElementById('auth-user-profile');
    if (user) {
      if (loginBtn)    loginBtn.style.display    = 'none';
      if (userProfile) userProfile.style.display = 'flex';
      var nameEl  = document.getElementById('auth-user-name');
      var photoEl = document.getElementById('auth-user-photo');
      if (nameEl)  nameEl.textContent = (user.displayName || 'Guerrier').split(' ')[0];
      if (photoEl && user.photoURL) photoEl.src = user.photoURL;
    } else {
      if (loginBtn) {
        loginBtn.style.display = 'flex';
        loginBtn.disabled      = false;
        loginBtn.innerHTML     = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:16px;flex-shrink:0"> Se connecter avec Google';
      }
      if (userProfile) userProfile.style.display = 'none';
    }
  },

  _setSyncStatus: function(status) {
    var el = document.getElementById('sync-status');
    var labels = { syncing: '🔄 Synchronisation...', synced: '☁️ Synchronisé', offline: '🌐 Hors ligne', error: '⚠️ Erreur sync' };
    if (el) { el.textContent = labels[status] || status; el.style.color = status === 'synced' ? 'var(--green)' : 'inherit'; }
  },

  _showError: function(msg) {
    if (typeof toast === 'function') toast(msg, 'err');
    var btn = document.getElementById('auth-login-btn');
    if (btn) {
      btn.disabled  = false;
      btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:16px;flex-shrink:0"> Se connecter avec Google';
    }
  }
};
