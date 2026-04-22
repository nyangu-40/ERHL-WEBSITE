import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi331eWJQ8K4WnJNNA1hy97GRUQJyeCP0",
  authDomain: "ulunji-banana-farms.firebaseapp.com",
  projectId: "ulunji-banana-farms",
  storageBucket: "ulunji-banana-farms.appspot.com",
  messagingSenderId: "926962033734",
  appId: "1:926962033734:web:44dd6a7f679bedf502d647"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);