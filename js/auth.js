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

// iOS PWA standalone bloque les popups → on détecte le mode d'affichage
function isStandalonePWA() {
  return window.navigator.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;
}

export var Auth = {
  user: null,

  init: function() {
    var self = this;
    var statusEl = document.getElementById('sync-status');

    // 1. Affichage immédiat depuis le cache
    var cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      this.user = cachedUser;
      this.updateUI(cachedUser);
      if (statusEl) statusEl.textContent = "⏳ Vérification...";
    }

    // 2. Écouteur global (Source de vérité)
    // Fonctionne dans tous les cas : popup ET redirect (session stockée en IndexedDB)
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

    // 3. Résultat de redirection (iOS standalone uniquement)
    // missing-initial-state est ignoré : onAuthStateChanged prend le relais via IndexedDB
    if (isStandalonePWA()) {
      getRedirectResult(auth).catch(function(error) {
        if (error.code !== 'auth/missing-initial-state' && error.code !== 'auth/no-current-user') {
          console.error("Auth redirect error:", error.code);
        }
      });
    }
  },

  login: function() {
    var loginBtn = document.getElementById('auth-login-btn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Connexion...";
    }

    if (isStandalonePWA()) {
      // iOS standalone : les popups sont bloquées → redirect obligatoire
      signInWithRedirect(auth, googleProvider);
    } else {
      // Safari normal et autres navigateurs : popup (évite missing-initial-state)
      signInWithPopup(auth, googleProvider).catch(function(error) {
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          alert("Erreur Login : " + error.code);
        }
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = "Connexion Google";
        }
      });
    }
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
        if (nameEl) {
          var fullName = user.displayName || "Guerrier";
          nameEl.textContent = fullName.split(' ')[0];
        }
        var photoEl = document.getElementById('auth-user-photo');
        if (photoEl && user.photoURL) photoEl.src = user.photoURL;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (userProfile) userProfile.style.display = 'none';
    }
  }
};
