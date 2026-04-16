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

    // 3. Ouvert depuis l'app standalone (paramètre ?login=1)
    // NE PAS auto-déclencher signInWithPopup : Safari bloque les popups
    // qui ne viennent pas d'un geste utilisateur direct (clic).
    // On affiche à la place un écran de connexion dédié.
    var params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1' && !isIOSStandalone()) {
      history.replaceState(null, '', window.location.pathname);
      self._fromStandalone = true;
      self._showLoginScreen();
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
      // iOS standalone : SFSafariViewController (window.open) a un stockage isolé.
      // navigator.share() ouvre la feuille de partage iOS → l'utilisateur peut
      // choisir "Ouvrir dans Safari" → vrai Safari, stockage partagé avec standalone.
      var loginUrl = window.location.origin + window.location.pathname + '?login=1';

      if (navigator.share) {
        navigator.share({ title: 'Muscu RPG — Connexion', url: loginUrl })
          .catch(function() {});
      } else {
        // Fallback : copier dans le presse-papier
        navigator.clipboard.writeText(loginUrl).then(function() {
          toast("Lien copié ! Collez-le dans Safari pour vous connecter", "info");
        }).catch(function() {
          toast("Ouvrez ce lien dans Safari : " + loginUrl, "info");
        });
      }

      if (loginBtn) loginBtn.innerHTML = "Revenez après connexion";
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

  // Affiche un écran plein écran de connexion (utilisé depuis Safari via ?login=1)
  // Le clic utilisateur sur le bouton garantit que Safari autorise le popup Google
  _showLoginScreen: function() {
    var self = this;
    var overlay = document.createElement('div');
    overlay.id = 'ios-login-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#0a0f1e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:9999;padding:32px';
    overlay.innerHTML =
      '<div style="font-size:48px">⚔️</div>' +
      '<div style="font-size:22px;font-weight:800;color:#fff;text-align:center">Muscu RPG</div>' +
      '<div style="font-size:14px;color:rgba(255,255,255,0.6);text-align:center">Connectez-vous pour synchroniser vos données</div>' +
      '<button id="ios-login-btn" style="display:flex;align-items:center;gap:10px;background:#fff;color:#000;border:none;border-radius:10px;padding:14px 24px;font-size:16px;font-weight:700;cursor:pointer;width:100%;max-width:300px;justify-content:center">' +
        '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:20px">' +
        'Se connecter avec Google' +
      '</button>';
    document.body.appendChild(overlay);

    document.getElementById('ios-login-btn').addEventListener('click', function() {
      this.disabled = true;
      this.textContent = '🔄 Connexion...';
      signInWithPopup(auth, googleProvider)
        .then(function() {
          // Auth réussie : remplacer le bouton par le message de retour
          overlay.innerHTML =
            '<div style="font-size:48px">✅</div>' +
            '<div style="font-size:20px;font-weight:800;color:#fff;text-align:center">Connecté !</div>' +
            '<div style="font-size:15px;color:rgba(255,255,255,0.7);text-align:center">Fermez cet onglet et revenez sur votre app.</div>';
        })
        .catch(function(error) {
          if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
            alert("Erreur : " + error.code);
          }
          var btn = document.getElementById('ios-login-btn');
          if (btn) { btn.disabled = false; btn.textContent = 'Se connecter avec Google'; }
        });
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
