/**
 * CONFIGURATION FIREBASE
 * Remplacez les valeurs ci-dessous par celles de votre console Firebase
 * (Paramètres du projet > Vos applications > App Web)
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "muscu-rpg.firebaseapp.com",
  projectId: "muscu-rpg",
  storageBucket: "muscu-rpg.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
