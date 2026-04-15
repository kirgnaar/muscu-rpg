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
    var statusEl = document.getElementById('sync-status');
    
    // 1. Affichage immédiat depuis le cache
    var cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      this.user = cachedUser;
      this.updateUI(cachedUser);
      if (statusEl) statusEl.textContent = "⏳ Vérification...";
    }

    // 2. Écouteur global (Source de vérité)
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
        // On ne vide pas le cache ici pour éviter le clignotement
      }
    });

    // 3. Récupérer le résultat de la redirection
    getRedirectResult(auth).catch(function(error) {
      // Sur iPhone, on ignore l'erreur d'état initial manquant qui est un bug d'Apple
      if (error.code === 'auth/missing-initial-state') {
        console.warn("iOS State Bug détecté — On attend l'écouteur...");
      } else if (error.code !== 'auth/no-current-user') {
        console.error("Auth error:", error.code);
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

    // On s'assure que la persistance est bien sur LOCAL pour l'iPhone
    setPersistence(auth, browserLocalPersistence).then(function() {
      return signInWithRedirect(auth, googleProvider);
    }).catch(function(error) {
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
