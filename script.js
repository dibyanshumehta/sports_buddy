import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  setDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Toggle Login/Register Mode
const toggleForm = document.getElementById('toggleForm');
const formTitle = document.getElementById('formTitle');
const nameGroup = document.getElementById('nameGroup');
const loginBtn = document.getElementById('emailLoginBtn');
const signupBtn = document.getElementById('emailSignupBtn');

let isLogin = true;

toggleForm.onclick = () => {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? "Login" : "Register";
  toggleForm.textContent = isLogin ? "Don't have an account? Register" : "Already have an account? Login";
  nameGroup.style.display = isLogin ? "none" : "block";
  loginBtn.style.display = isLogin ? "inline-block" : "none";
  signupBtn.style.display = isLogin ? "none" : "inline-block";
};

// Email/Password Sign-Up
signupBtn.onclick = async () => {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: "user"
    });

    redirectUser(user);
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
};

// Email/Password Login
loginBtn.onclick = async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    redirectUser(userCredential.user);
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
};

// Google Login
document.getElementById('googleLogin').onclick = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "Google User",
      email: user.email,
      role: "user"
    }, { merge: true });

    redirectUser(user);
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
};

/*// Facebook Login
document.getElementById('facebookLogin').onclick = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "Facebook User",
      email: user.email,
      role: "user"
    }, { merge: true });

    redirectUser(user);
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}; */

// Redirect User Based on Role
async function redirectUser(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error("Redirect failed:", error);
    alert("Something went wrong. Try again.");
  }
}
