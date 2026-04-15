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
    
    // Alerte de debug pour vérifier que le fichier est chargé
    // alert("DEBUG: Auth.init lancé");

    // Persistance locale
    setPersistence(auth, browserLocalPersistence).then(function() {
      // Observer l'état de connexion
      onAuthStateChanged(auth, function(user) {
        if (user) {
          var userData = {
            uid: user.uid,
            displayName: user.displayName || "Utilisateur",
            photoURL: user.photoURL || ""
          };
          localStorage.setItem('mrpg_auth_cache', JSON.stringify(userData));
          self.user = user;
          self.updateUI(user);
          syncData(user.uid);
        } else {
          // On ne vide le cache que si on est déconnecté manuellement
          // localStorage.removeItem('mrpg_auth_cache');
        }
      });
    }).catch(function(err) {
      console.error("Persistence error:", err);
    });

    // Gérer le retour de redirection
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        alert("Succès ! Connecté : " + (result.user.displayName || "Guerrier"));
        self.user = result.user;
        self.updateUI(result.user);
      }
    }).catch(function(error) {
      if (error.code !== 'auth/no-current-user') {
        alert("Erreur retour Google : " + error.code + " - " + error.message);
      }
    });
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
