import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCjsXZ7jvxD5RsuAfI19DvDpaACFpmUnPg",
  authDomain:        "muscu-rpg.firebaseapp.com",
  databaseURL:       "https://muscu-rpg-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "muscu-rpg",
  storageBucket:     "muscu-rpg.firebasestorage.app",
  messagingSenderId: "137574537693",
  appId:             "1:137574537693:web:d225d84034efbd7d617e34"
};

const app = initializeApp(firebaseConfig);

// initializeAuth avec persistence et resolver explicites.
// browserLocalPersistence = stockage dans localStorage (clé firebase:authUser:...).
// browserPopupRedirectResolver requis pour signInWithPopup.
export const auth = initializeAuth(app, {
  persistence:          browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});
export const db = getFirestore(app);
