/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — auth.js
   Authentification Google via Firebase Auth — Compatible iOS PWA / Android / Desktop
   ══════════════════════════════════════════════════════════════════════════

   STRATÉGIE UNIQUE : signInWithRedirect partout.
   ─────────────────────────────────────────────
   • signInWithPopup est bloqué sur iOS PWA (WKWebView interdit les popups).
   • signInWithRedirect fonctionne partout : Android, desktop, iOS Safari, iOS PWA.
   • getRedirectResult() est appelé à chaque init — si un redirect vient de se
     terminer, il récupère le user immédiatement. Sinon, il renvoie null sans erreur.
   • onAuthStateChanged est le filet de sécurité : il reste la source de vérité.

   PERSISTANCE : indexedDBLocalPersistence (déclarée dans firebase-config.js).
   ────────────────────────────────────────
   • sessionStorage est effacé lors du redirect cross-origin → token perdu sur iOS.
   • IndexedDB persiste entre navigations → token récupéré après redirect.

   PRÉREQUIS FIREBASE CONSOLE (une seule fois, manuel) :
   ──────────────────────────────────────────────────────
   https://console.firebase.google.com/project/muscu-rpg/authentication/settings
   → "Domaines autorisés" → Ajouter : kirgnaar.github.io
   ══════════════════════════════════════════════════════════════════════════ */

import { auth } from './firebase-config.js';
import {
  GoogleAuthProvider,
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

    // ── 2. Résultat du redirect OAuth (si on revient d'une auth Google) ───
    // Appelé à CHAQUE chargement de page. Sur iOS PWA après redirect, c'est
    // ici que le user est récupéré depuis IndexedDB.
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        // Auth fraîche après redirect — onAuthStateChanged va aussi se déclencher
        console.log('[Auth] Redirect result OK :', result.user.displayName);
      }
    }).catch(function(err) {
      // auth/no-auth-event est normal (pas de redirect en cours) — ignorer silencieusement
      if (err.code !== 'auth/no-auth-event') {
        console.warn('[Auth] getRedirectResult error :', err.code, err.message);
        self._showError('Connexion échouée (' + err.code + '). Réessaie.');
      }
    });

    // ── 3. Source de vérité — écoute tous les changements d'état ──────────
    onAuthStateChanged(auth, function(user) {
      if (user) {
        var userData = {
          uid:         user.uid,
          displayName: user.displayName || 'Guerrier',
          photoURL:    user.photoURL    || ''
        };
        try {
          localStorage.setItem('mrpg_auth_cache', JSON.stringify(userData));
        } catch(e) {}
        self.user   = user;
        self._updateUI(user);
        self._setSyncStatus('syncing');
        // Sync différée (ne bloque pas l'UI)
        setTimeout(function() { syncData(user.uid); }, 300);
      } else {
        self.user = null;
        try { localStorage.removeItem('mrpg_auth_cache'); } catch(e) {}
        self._updateUI(null);
        self._setSyncStatus('offline');
      }
    });
  },

  // ── Connexion : redirect uniquement (compatible iOS PWA + tout le reste) ──
  login: function() {
    var btn = document.getElementById('auth-login-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '🔄 Connexion...';
    }
    // Petit délai pour que l'UI se mette à jour avant la navigation
    setTimeout(function() {
      signInWithRedirect(auth, googleProvider);
    }, 100);
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
