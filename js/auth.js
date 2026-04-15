import { auth } from './firebase-config.js';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { syncData } from './sync.js';

var googleProvider = new GoogleAuthProvider();

export var Auth = {
  user: null,

  init: function() {
    var self = this;
    
    // 1. Vérification immédiate du cache pour l'UI
    var cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      this.user = cachedUser;
      this.updateUI(cachedUser);
    }

    // 2. Configuration de la persistance
    setPersistence(auth, browserLocalPersistence).then(function() {
      
      // 3. Écouteur d'état (la source de vérité)
      onAuthStateChanged(auth, function(user) {
        if (user) {
          var userData = {
            uid: user.uid,
            displayName: user.displayName || "Guerrier",
            photoURL: user.photoURL || ""
          };
          localStorage.setItem('mrpg_auth_cache', JSON.stringify(userData));
          self.user = user;
          self.updateUI(user);
          syncData(user.uid);
        }
      });

    });

    // 4. Gestion du retour de Google (le moment critique sur iPhone)
    // On attend un tout petit peu que l'app "reprenne ses esprits"
    setTimeout(function() {
      getRedirectResult(auth).then(function(result) {
        if (result && result.user) {
          alert("Gagné ! Bienvenue " + (result.user.displayName || ""));
          self.user = result.user;
          self.updateUI(result.user);
        }
      }).catch(function(error) {
        if (error.code !== 'auth/no-current-user') {
          alert("Erreur retour : " + error.code);
        }
      });
    }, 1500);
  },

  login: function() {
    var self = this;
    var loginBtn = document.getElementById('auth-login-btn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Connexion...";
    }

    // Sur iPhone Standalone, signInWithRedirect est plus fiable que Popup, 
    // mais Google peut bloquer la redirection cross-domain. 
    // On essaie Redirect par défaut pour les PWA.
    signInWithRedirect(auth, googleProvider).catch(function(error) {
      alert("Erreur Login : " + error.code + " - " + error.message);
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
