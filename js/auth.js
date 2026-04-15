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

const googleProvider = new GoogleAuthProvider();

export const Auth = {
  user: null,

  init: function() {
    // Forcer la persistance locale
    setPersistence(auth, browserLocalPersistence);

    onAuthStateChanged(auth, function(user) {
      console.log("État Auth changé :", user ? "Connecté" : "Déconnecté");
      Auth.user = user;
      Auth.updateUI(user);
      if (user) {
        syncData(user.uid);
      }
    });

    // Gérer le retour de redirection
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        alert("Connexion réussie : " + result.user.displayName);
      }
    }).catch(function(error) {
      if (error.code !== 'auth/no-current-user') {
        alert("Erreur Firebase (" + error.code + ") : " + error.message);
      }
    });
  },

  login: async function() {
    try {
      // Sur mobile, la redirection est plus stable que le popup
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      alert("Erreur Login : " + error.code + "\n" + error.message);
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
