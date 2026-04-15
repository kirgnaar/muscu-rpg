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

export var Auth = {
  user: null,

  init: function() {
    var self = this;
    var statusEl = document.getElementById('sync-status');
    if (statusEl) statusEl.textContent = "⏳ Initialisation...";

    // 1. Écouteur global IMMÉDIAT
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
        // On ne vide pas le cache ici pour garder l'UI si le réseau est lent
      }
    });

    // 2. Vérification du retour de Google (sans délai)
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        if (statusEl) statusEl.textContent = "✨ Bienvenue !";
        self.user = result.user;
        self.updateUI(result.user);
      }
    }).catch(function(error) {
      if (error.code !== 'auth/no-current-user') {
        if (statusEl) statusEl.textContent = "❌ Erreur Auth";
        alert("Erreur retour : " + error.code);
      }
    });
  },

  login: function() {
    var loginBtn = document.getElementById('auth-login-btn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Direction Google...";
    }
    signInWithRedirect(auth, googleProvider).catch(function(error) {
      alert("Erreur Login : " + error.code);
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
