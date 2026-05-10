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

   PERSISTANCE : browserLocalPersistence (défaut de getAuth()).
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

    // ── 1. Cache UI immédiat — évite le flash "non connecté" ─────────────
    var cachedUser = null;
    try { cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null'); } catch(e) {}
    if (cachedUser && cachedUser.uid) {
      self.user = cachedUser;
      self._updateUI(cachedUser);
    }

    // ── 2. getRedirectResult — UNIQUEMENT sur iOS PWA standalone ─────────
    // Sur desktop/Android, signInWithPopup ne génère pas de redirect.
    // Appeler getRedirectResult inutilement peut consommer un état redirect
    // périmé (laissé par l'ancien code) et perturber onAuthStateChanged.
    var isIOSStandalone = (typeof navigator.standalone !== 'undefined') && !!navigator.standalone;
    if (isIOSStandalone) {
      getRedirectResult(auth).then(function(result) {
        if (result && result.user) console.log('[Auth] iOS redirect OK:', result.user.displayName);
      }).catch(function(err) {
        if (err.code !== 'auth/no-auth-event' && err.code !== 'auth/null-user') {
          console.warn('[Auth] getRedirectResult:', err.code, err.message);
        }
      });
    }

    // ── 3. Source de vérité ───────────────────────────────────────────────
    // onAuthStateChanged bufferise le premier emit jusqu'à avoir lu localStorage.
    // Pas besoin de authStateReady() avec getAuth() — le comportement est garanti.
    onAuthStateChanged(auth, function(user) {
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
    var btn = document.getElementById('auth-login-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '🔄 Connexion...'; }

    var isIOSStandalone = (typeof navigator.standalone !== 'undefined') && !!navigator.standalone;

    if (isIOSStandalone) {
      signInWithRedirect(auth, googleProvider).catch(function(err) {
        console.error('[Auth] signInWithRedirect error:', err.code, err.message);
        self._showError('Connexion échouée (' + err.code + '). Réessaie.');
      });
    } else {
      signInWithPopup(auth, googleProvider).then(function(result) {
        console.log('[Auth] Popup OK:', result.user.displayName);
      }).catch(function(err) {
        if (err.code === 'auth/popup-blocked') {
          self._showError('Popup bloqué — autorise les popups pour ce site dans ton navigateur.');
        } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
          self._updateUI(null);
        } else {
          console.error('[Auth] signInWithPopup error:', err.code, err.message);
          self._showError('Connexion échouée (' + err.code + '). Réessaie.');
        }
      });
    }
  },

  logout: function() {
    var self = this;
    signOut(auth).then(function() {
      try { localStorage.removeItem('mrpg_auth_cache'); } catch(e) {}
      self._updateUI(null);
      self._setSyncStatus('offline');
      if (typeof toast === 'function') toast('Déconnecté ✓');
    }).catch(function(err) {
      console.warn('[Auth] Logout error:', err);
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
