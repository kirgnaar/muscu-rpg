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

// iOS PWA ajouté à l'écran d'accueil
function isIOSStandalone() {
  return window.navigator.standalone === true;
}

export var Auth = {
  user: null,

  init: function() {
    var self = this;
    var statusEl = document.getElementById('sync-status');

    // 1. Affichage immédiat depuis le cache local (évite le flash de déconnexion)
    var cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      this.user = cachedUser;
      this.updateUI(cachedUser);
      if (statusEl) statusEl.textContent = "⏳ Vérification...";
    }

    // 2. Résultat du redirect OAuth (iOS standalone uniquement)
    // Avec indexedDBLocalPersistence, l'état survive aux navigations cross-origin.
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        // La connexion via redirect vient de réussir — onAuthStateChanged s'en charge
        console.log('[Auth] Redirect réussi:', result.user.uid);
      }
    }).catch(function(error) {
      // missing-initial-state ne peut plus arriver avec IndexedDB
      if (error.code !== 'auth/no-current-user') {
        console.warn('[Auth] Redirect error:', error.code);
      }
    });

    // 3. Écouteur d'état (source de vérité)
    onAuthStateChanged(auth, function(user) {
      if (user) {
        if (statusEl) statusEl.textContent = "✅ Connecté";
        var userData = {
          uid: user.uid,
          displayName: user.displayName || "Guerrier",
          photoURL: user.photoURL || ""
        };
        localStorage.setItem('mrpg_auth_cache', JSON.stringify(userData));
        self.user = user;
        self.updateUI(user);
        syncData(user.uid);
      } else {
        if (statusEl) statusEl.textContent = "🌐 Hors ligne";
      }
    });
  },

  login: function() {
    var loginBtn = document.getElementById('auth-login-btn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Connexion...";
    }

    if (isIOSStandalone()) {
      // iOS standalone : signInWithPopup échoue (réseau bloqué dans le WebView).
      // signInWithRedirect navigue vers Google dans le même WebView.
      // Avec indexedDBLocalPersistence, l'état OAuth survit à la navigation
      // cross-origin → plus d'erreur missing-initial-state.
      signInWithRedirect(auth, googleProvider);
      return;
    }

    // Safari normal, Chrome, desktop : popup directe
    signInWithPopup(auth, googleProvider).catch(function(error) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        alert("Erreur Login : " + error.code);
      }
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Connexion Google";
      }
    });
  },

  logout: function() {
    if (confirm("Se déconnecter ?")) {
      signOut(auth).then(function() {
        localStorage.removeItem('mrpg_auth_cache');
        location.reload();
      });
    }
  },

  updateUI: function(user) {
    var loginBtn = document.getElementById('auth-login-btn');
    var userProfile = document.getElementById('auth-user-profile');

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'flex';
        var nameEl = document.getElementById('auth-user-name');
        if (nameEl) nameEl.textContent = (user.displayName || "Guerrier").split(' ')[0];
        var photoEl = document.getElementById('auth-user-photo');
        if (photoEl && user.photoURL) photoEl.src = user.photoURL;
      }
    } else {
      if (loginBtn) {
        loginBtn.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Connexion Google";
      }
      if (userProfile) userProfile.style.display = 'none';
    }
  }
};
