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

const googleProvider = new GoogleAuthProvider();

export const Auth = {
  user: null,

  init: function() {
    onAuthStateChanged(auth, function(user) {
      Auth.user = user;
      Auth.updateUI(user);
      if (user) {
        syncData(user.uid);
      }
    });

    // Gérer le retour de redirection
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        console.log("Connecté après redirection:", result.user);
      }
    }).catch(function(error) {
      console.error("Erreur redirection:", error);
    });
  },

  login: async function() {
    try {
      // Sur mobile, la redirection est plus stable que le popup
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      if (window.toast) window.toast("Erreur de connexion", "err");
    }
  },

  logout: async function() {
    if (confirm("Se déconnecter ? Les données resteront sur cet appareil.")) {
      await signOut(auth);
      location.reload();
    }
  },

  updateUI: function(user) {
    const loginBtn = document.getElementById('auth-login-btn');
    const userProfile = document.getElementById('auth-user-profile');
    
    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'flex';
        const nameEl = document.getElementById('auth-user-name');
        if (nameEl) nameEl.textContent = user.displayName.split(' ')[0];
        const photoEl = document.getElementById('auth-user-photo');
        if (photoEl) photoEl.src = user.photoURL;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (userProfile) userProfile.style.display = 'none';
    }
  }
};
