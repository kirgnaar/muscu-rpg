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

export var Auth = {
  user: null,

  init: function() {
    var self = this;
    var statusEl = document.getElementById('sync-status');
    
    // 1. Charger le cache immédiatement
    var cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      this.user = cachedUser;
      this.updateUI(cachedUser);
    }

    // 2. Écouteur global
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

    // 3. Tenter de récupérer un résultat de redirection (si existant)
    getRedirectResult(auth).catch(function(error) {
      // On ignore l'erreur "missing initial state" qui est buggée sur iOS
      if (error.code !== 'auth/missing-initial-state' && error.code !== 'auth/no-current-user') {
        console.error("Redirect error:", error.code);
      }
    });
  },

  login: function() {
    var self = this;
    var loginBtn = document.getElementById('auth-login-btn');
    var statusEl = document.getElementById('sync-status');

    // Détection iPhone Standalone (PWA)
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Connexion...";
    }

    if (isIOS && isStandalone) {
      // SOLUTION IPHONE PWA : Utiliser Popup au lieu de Redirect
      if (statusEl) statusEl.textContent = "📱 Mode iPhone PWA...";
      signInWithPopup(auth, googleProvider).then(function(result) {
        if (result.user) {
          if (statusEl) statusEl.textContent = "✨ Connecté !";
          self.user = result.user;
          self.updateUI(result.user);
        }
      }).catch(function(error) {
        alert("Erreur Connexion iPhone : " + error.code + "\n\nAstuce : Si rien ne se passe, essayez d'ouvrir le site dans Safari normal (pas en mode App) pour la première connexion.");
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = "Connexion Google";
        }
      });
    } else {
      // Mode normal (Android ou Safari classique)
      signInWithRedirect(auth, googleProvider).catch(function(error) {
        alert("Erreur Login : " + error.code);
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
