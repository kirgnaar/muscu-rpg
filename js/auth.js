import { auth } from './firebase-config.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { syncData } from './sync.js';

var googleProvider = new GoogleAuthProvider();

function isIOSStandalone() {
  return window.navigator.standalone === true;
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

    // 2. Écouteur global — Firebase partage l'état auth via localStorage entre
    //    Safari et le standalone app (même origine), donc la connexion faite
    //    dans Safari est automatiquement détectée ici.
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

        // Si on vient du flux ?login=1 (Safari ouvert depuis standalone),
        // indiquer à l'utilisateur de revenir sur l'app
        if (self._fromStandalone) {
          self._fromStandalone = false;
          var msg = document.getElementById('auth-safari-msg');
          if (msg) msg.style.display = 'block';
        }
      } else {
        if (statusEl) statusEl.textContent = "🌐 Hors ligne";
      }
    });

    // 3. Auto-login si ouvert depuis l'app standalone (paramètre ?login=1)
    var params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1' && !isIOSStandalone()) {
      history.replaceState(null, '', window.location.pathname);
      self._fromStandalone = true;
      self.login();
    }

    // 4. Quand l'app standalone reprend le focus, forcer Firebase à re-vérifier
    //    l'état auth (la session a pu être créée dans Safari entre-temps)
    if (isIOSStandalone()) {
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          auth.currentUser; // accès suffit à déclencher la réévaluation interne
        }
      });
    }
  },

  login: function() {
    var loginBtn = document.getElementById('auth-login-btn');

    if (isIOSStandalone()) {
      // iOS standalone : popup et redirect sont tous les deux cassés dans ce contexte.
      // Solution : ouvrir l'app dans Safari régulier avec ?login=1
      // Safari fait la connexion Google normalement, puis Firebase propage
      // la session via localStorage partagé → onAuthStateChanged se déclenche
      // automatiquement dans l'app standalone quand l'utilisateur revient.
      var loginUrl = window.location.origin + window.location.pathname + '?login=1';
      window.open(loginUrl, '_blank');

      // Informer l'utilisateur
      if (loginBtn) loginBtn.innerHTML = "Revenez après connexion";
      toast("Connectez-vous dans Safari puis revenez ici", "info");
      return;
    }

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = "🔄 Connexion...";
    }

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
        if (nameEl) {
          var fullName = user.displayName || "Guerrier";
          nameEl.textContent = fullName.split(' ')[0];
        }
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
