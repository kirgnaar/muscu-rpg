/**
 * CONFIGURATION FIREBASE
 * Mis à jour le 16/04/2026
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeAuth, indexedDBLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjsXZ7jvxD5RsuAfI19DvDpaACFpmUnPg",
  authDomain: "muscu-rpg.firebaseapp.com",
  databaseURL: "https://muscu-rpg-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "muscu-rpg",
  storageBucket: "muscu-rpg.firebasestorage.app",
  messagingSenderId: "137574537693",
  appId: "1:137574537693:web:d225d84034efbd7d617e34",
  measurementId: "G-BWF8H627RE"
};

const app = initializeApp(firebaseConfig);

// indexedDBLocalPersistence au lieu de sessionStorage (défaut) :
// sessionStorage est vidé lors des navigations cross-origin (ex: redirect OAuth sur iOS).
// IndexedDB persiste entre les navigations dans le même WebView → signInWithRedirect fonctionne.
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence
});
export const db = getFirestore(app);

