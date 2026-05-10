/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — auth.js
   Authentification Google via Firebase Auth — Compatible iOS PWA / Android / Desktop
   ══════════════════════════════════════════════════════════════════════════

   STRATÉGIE : Popup par défaut, Redirect sur iOS PWA standalone.
   ───────────────────────────────────────────────────────────────
   • signInWithPopup : utilisé sur desktop, Android, Safari normal.
     Plus fiable depuis 2024 — signInWithRedirect est cassé sur Chrome avec la
     dépréciation des cookies tiers (erreur "missing initial state").
   • signInWithRedirect : UNIQUEMENT sur iOS PWA standalone (navigator.standalone)
     car WKWebView bloque les popups.
   • getRedirectResult() est appelé à chaque init pour récupérer l'user après
     un redirect iOS. Sur desktop il renvoie null sans erreur → ignoré.
   • onAuthStateChanged (via authStateReady) est la source de vérité finale.

   PERSISTANCE : browserLocalPersistence (déclarée dans firebase-config.js).
   ───────────────────────────────────────────────────────────────────────────
   • localStorage persiste entre navigations et survit aux redirects cross-origin.
   • authStateReady() garantit que le token est lu avant le premier emit de null.

   PRÉREQUIS FIREBASE CONSOLE (une seule fois, manuel) :
   ──────────────────────────────────────────────────────
   https://console.firebase.google.com/project/muscu-rpg/authentication/settings
   → "Domaines autorisés" → Ajouter : kirgnaar.github.io
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
// Force le prompt de sélection de compte Google à chaque connexion
googleProvider.setCustomParameters({ prompt: 'select_account' });

export var Auth = {
  user: null,
  _syncPending: false,

  init: function() {
    var self = this;

    // ── 1. Cache UI immédiat (évite le flash "non connecté" au démarrage) ──
    var cachedUser = null;
    try {
      cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    } catch(e) {}
    if (cachedUser && cachedUser.uid) {
      self.user = cachedUser;
      self._updateUI(cachedUser);
    }

    // ── 2. Résultat du redirect OAuth (si on revient d'une auth Google) ────
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        console.log('[Auth] Redirect result OK :', result.user.displayName);
      }
    }).catch(function(err) {
      // Codes normaux quand aucun redirect n'est en cours — ignorer
      var silent = ['auth/no-auth-event', 'auth/null-user', 'auth/operation-not-supported-in-this-environment'];
      if (silent.indexOf(err.code) === -1) {
        console.warn('[Auth] getRedirectResult :', err.code, err.message);
      }
    });

    // ── 3. Source de vérité ───────────────────────────────────────────────────
    // authStateReady() attend que Firebase ait lu le token persisté en localStorage
    // avant le premier emit de onAuthStateChanged — évite le flash "déconnecté".
    // Le .catch() est OBLIGATOIRE : sans lui, si authStateReady() rejette (erreur
    // réseau, SDK bug), onAuthStateChanged n'est jamais enregistré et la session
    // est perdue pour toujours sur cet onglet.
    function _listen() {
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
    }
    auth.authStateReady().then(_listen).catch(function(err) {
      // authStateReady() a rejeté (rare mais possible) — on s'abonne directement.
      // Sans authStateReady, onAuthStateChanged peut émettre null puis user en 2 temps
      // → flash du bouton connexion, mais la session est quand même restaurée.
      console.warn('[Auth] authStateReady failed, fallback direct listener:', err.code || err);
      _listen();
    });
  },

  // ── Connexion ─────────────────────────────────────────────────────────────
  // Popup sur desktop/Android/Safari (plus fiable, pas de cross-origin state).
  // Redirect seulement sur iOS PWA standalone où les popups sont bloqués.
  login: function() {
    var self = this;
    var btn = document.getElementById('auth-login-btn');
    if (btn) {
      btn.disabled  = true;
      btn.innerHTML = '🔄 Connexion...';
    }

    // iOS PWA standalone : navigator.standalone === true → popup bloqué par WKWebView
    var isIOSStandalone = (typeof window.navigator.standalone !== 'undefined') && window.navigator.standalone;

    if (isIOSStandalone) {
      // ⚠️ PAS de setTimeout : iOS Safari bloque les redirects non-synchrones au geste
      signInWithRedirect(auth, googleProvider).catch(function(err) {
        console.error('[Auth] signInWithRedirect error:', err.code, err.message);
        self._showError('Connexion échouée (' + err.code + '). Réessaie.');
      });
    } else {
      signInWithPopup(auth, googleProvider).then(function(result) {
        // onAuthStateChanged prend le relais — rien à faire ici
        console.log('[Auth] Popup OK :', result.user.displayName);
      }).catch(function(err) {
        if (err.code === 'auth/popup-blocked') {
          // Le popup a été bloqué par le navigateur. NE PAS tomber sur signInWithRedirect :
          // la redirection échoue silencieusement sur Chrome (missing initial state).
          // On demande à l'utilisateur d'autoriser les popups pour ce site.
          self._showError('Popup bloqué — autorise les popups pour ce site dans ton navigateur, puis réessaie.');
        } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
          // L'utilisateur a fermé le popup — remettre le bouton silencieusement
          self._updateUI(null);
        } else {
          console.error('[Auth] signInWithPopup error:', err.code, err.message);
          self._showError('Connexion échouée (' + err.code + '). Réessaie.');
        }
      });
    }
  },

  logout: function() {
    // Pas de confirm() natif — on utilise une confirmation inline (voir index.html)
    var self = this;
    signOut(auth).then(function() {
      try { localStorage.removeItem('mrpg_auth_cache'); } catch(e) {}
      self._updateUI(null);
      self._setSyncStatus('offline');
      if (typeof toast === 'function') toast('Déconnecté ✓');
    }).catch(function(err) {
      console.warn('[Auth] Logout error :', err);
    });
  },

  // ── Mise à jour de l'UI du menu latéral ───────────────────────────────
  _updateUI: function(user) {
    var loginBtn     = document.getElementById('auth-login-btn');
    var userProfile  = document.getElementById('auth-user-profile');

    if (user) {
      if (loginBtn)    loginBtn.style.display    = 'none';
      if (userProfile) userProfile.style.display = 'flex';
      var nameEl  = document.getElementById('auth-user-name');
      var photoEl = document.getElementById('auth-user-photo');
      if (nameEl) {
        var name = user.displayName || 'Guerrier';
        nameEl.textContent = name.split(' ')[0];
      }
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
    var el     = document.getElementById('sync-status');
    var labels = {
      syncing: '🔄 Synchronisation...',
      synced:  '☁️ Synchronisé',
      offline: '🌐 Hors ligne',
      error:   '⚠️ Erreur sync'
    };
    if (el) {
      el.textContent  = labels[status] || status;
      el.style.color  = status === 'synced' ? 'var(--green)' : 'inherit';
    }
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
