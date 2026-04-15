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
    // Vérifier si on a un utilisateur en cache pour un affichage instantané
    const cachedUser = JSON.parse(localStorage.getItem('mrpg_auth_cache') || 'null');
    if (cachedUser) {
      Auth.user = cachedUser;
      Auth.updateUI(cachedUser);
    }

    // Forcer la persistance locale
    setPersistence(auth, browserLocalPersistence);

    onAuthStateChanged(auth, function(user) {
      console.log("État Auth changé :", user ? "Connecté" : "Déconnecté");
      if (user) {
        // Sauvegarder en cache pour le prochain démarrage
        const userData = {
          uid: user.uid,
          displayName: user.displayName || "Utilisateur",
          photoURL: user.photoURL || ""
        };
        localStorage.setItem('mrpg_auth_cache', JSON.stringify(userData));
        
        Auth.user = user;
        Auth.updateUI(user);
        syncData(user.uid);
      } else {
        // On ne supprime le cache que si on est sûr d'être déconnecté
        // (parfois user est null temporairement au chargement)
      }
    });

    // Gérer le retour de redirection
    console.log("Vérification du résultat de redirection...");
    getRedirectResult(auth).then(function(result) {
      if (result && result.user) {
        alert("Succès ! Connecté en tant que : " + (result.user.displayName || "Guerrier"));
        Auth.user = result.user;
        Auth.updateUI(result.user);
      }
    }).catch(function(error) {
      alert("Erreur retour Google : " + error.code);
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
        if (nameEl) {
          const fullName = user.displayName || "Guerrier";
          nameEl.textContent = fullName.split(' ')[0];
        }
        const photoEl = document.getElementById('auth-user-photo');
        if (photoEl && user.photoURL) photoEl.src = user.photoURL;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (userProfile) userProfile.style.display = 'none';
    }
  }
};
