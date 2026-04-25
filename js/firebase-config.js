/**
 * CONFIGURATION FIREBASE
 * Mis à jour le 16/04/2026
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjsXZ7jvxD5RsuAfI19DvDpaACFpmUnPg",
  // authDomain = domaine Firebase Hosting qui héberge /__/auth/handler
  // ⚠️  NE PAS mettre kirgnaar.github.io ici — GitHub Pages ne sert pas ce handler.
  // kirgnaar.github.io doit être dans "Domaines autorisés" de la console Firebase (✅ fait).
  authDomain: "muscu-rpg.firebaseapp.com",
  databaseURL: "https://muscu-rpg-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "muscu-rpg",
  storageBucket: "muscu-rpg.firebasestorage.app",
  messagingSenderId: "137574537693",
  appId: "1:137574537693:web:d225d84034efbd7d617e34",
  measurementId: "G-BWF8H627RE"
};

const app = initializeApp(firebaseConfig);

// indexedDBLocalPersistence : survit aux redirects cross-origin (iOS PWA)
// browserPopupRedirectResolver : OBLIGATOIRE avec initializeAuth() manuel —
//   sans lui, signInWithRedirect() et getRedirectResult() lèvent auth/argument-error
export const auth = initializeAuth(app, {
  persistence:           indexedDBLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});
export const db = getFirestore(app);

