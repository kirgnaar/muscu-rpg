import { auth } from './firebase-config.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
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
    
    // 1. Persistance forcée en LOCAL pour iOS
    setPersistence(auth, browserLocalPersistence);

    // 2. Charger le cache immédiatement pour l'UI
    var cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      this.user = cachedUser;
      this.updateUI(cachedUser);
    }

    // 3. Écouteur global (Source de vérité)
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

    // 4. Gestion du retour (Spécifique iOS PWA)
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        self.user = result.user;
        self.updateUI(result.user);
      }
    }).catch(function(error) {
      // Si l'erreur de "state" arrive, on ne bloque pas, l'écouteur onAuthStateChanged prendra le relais
      console.log("Info redirection:", error.code);
    });
  },

  login: function() {
    var self = this;
    var loginBtn = document.getElementById('auth-login-btn');
    
    // Détection iPhone Standalone
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Connexion...";
    }

    if (isIOS && isStandalone) {
      // Sur iPhone PWA, le Popup est paradoxalement plus stable car il ne quitte pas l'app
      signInWithPopup(auth, googleProvider).then(function(result) {
        if (result.user) {
          self.user = result.user;
          self.updateUI(result.user);
        }
      }).catch(function(error) {
        // Si le popup est bloqué, on tente quand même la redirection en dernier recours
        console.warn("Popup bloqué, tentative redirection...");
        signInWithRedirect(auth, googleProvider);
      });
    } else {
      signInWithRedirect(auth, googleProvider);
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
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:16px"> Connexion Google';
      }
      if (userProfile) userProfile.style.display = 'none';
    }
  }
};
