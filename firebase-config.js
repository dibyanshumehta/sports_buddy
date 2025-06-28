import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";
  // TODO: Add SDKs for Firebase products that you want to use
  

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyASdYLDrjH6so2VfS7lhF2kWujsahrtsxI",
    authDomain: "sports-buddy20.firebaseapp.com",
    projectId: "sports-buddy20",
    storageBucket: "sports-buddy20.firebasestorage.app",
    messagingSenderId: "167007539535",
    appId: "1:167007539535:web:9fbbd9dc9b90a6900bf53a",
    measurementId: "G-CNMN8Z939X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };