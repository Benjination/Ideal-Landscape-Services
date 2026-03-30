/* ═══════════════════════════════════════════════════════════════
   Firebase initialisation — shared ES module
   Imported by contact-form.js and any future Firebase features.
   ═══════════════════════════════════════════════════════════════ */

import { initializeApp }                              from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore }                              from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword,
         signOut, onAuthStateChanged }               from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getStorage }                               from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDvtzjI5RCjkfVwLVZuP87S5BxQUNNovFc",
  authDomain:        "ideal-landscapes-services.firebaseapp.com",
  projectId:         "ideal-landscapes-services",
  storageBucket:     "ideal-landscapes-services.firebasestorage.app",
  messagingSenderId: "405135052623",
  appId:             "1:405135052623:web:cd1b8a4ea4c39e23663f3a"
};

const app = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
