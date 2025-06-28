import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  getDoc,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// === Get sport ID from URL ===
const urlParams = new URLSearchParams(window.location.search);
const sportId = urlParams.get('id');

// === DOM References ===
const sportInfo = document.getElementById('sportInfo');
const applyBtn = document.getElementById('applyBtn');
const previewBtn = document.getElementById('previewBtn');
const seeMembersBtn = document.getElementById('seeMembersBtn');
const dashboardBtn = document.getElementById('dashboardBtn');

const formModal = document.getElementById('formModal');
const closeForm = document.getElementById('closeForm');
const applicationForm = document.getElementById('applicationForm');

const nameInput = document.getElementById('applicantName');
const emailInput = document.getElementById('applicantEmail');
const dobInput = document.getElementById('applicantDOB');
const phoneInput = document.getElementById('applicantPhone');

// Preview modal references
const previewModal = document.getElementById('previewModal');
const closePreview = document.getElementById('closePreview');
const previewName = document.getElementById('previewName');
const previewEmail = document.getElementById('previewEmail');
const previewDOB = document.getElementById('previewDOB');
const previewPhone = document.getElementById('previewPhone');

let currentUser = null;

// === Load sport details ===
async function loadSportDetails() {
  const docRef = doc(db, "sports", sportId);
  const sportDoc = await getDoc(docRef);

  if (sportDoc.exists()) {
    const data = sportDoc.data();
    sportInfo.innerHTML = `
      <h2>${data.name}</h2>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p>${data.description}</p>
    `;
  } else {
    sportInfo.innerHTML = "<p>Sport not found.</p>";
  }
}

// === Check if user already applied ===
async function checkApplication(userId) {
  const appRef = doc(db, "applications", `${userId}_${sportId}`);
  const appDoc = await getDoc(appRef);

  if (appDoc.exists()) {
    previewBtn.style.display = 'inline-block';
    seeMembersBtn.style.display = 'inline-block';
    applyBtn.disabled = true;
    applyBtn.textContent = "Already Applied";
  }
}

// === Submit Application ===
applicationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const dob = dobInput.value;
  const phone = phoneInput.value.trim();

  if (!name || !email || !dob || !phone) {
    alert("Please fill in all the fields.");
    return;
  }

  if (currentUser && sportId) {
    const appRef = doc(db, "applications", `${currentUser.uid}_${sportId}`);
    try {
      await setDoc(appRef, {
        uid: currentUser.uid,
        name,
        email,
        dob,
        phone,
        sport: sportId,
        timestamp: new Date()
      });

      formModal.style.display = 'none';
      applyBtn.disabled = true;
      applyBtn.textContent = "Applied";
      previewBtn.style.display = 'inline-block';
      seeMembersBtn.style.display = 'inline-block';
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Failed to submit. Please try again.");
    }
  }
});

// === Preview Application in Modal ===
previewBtn.addEventListener('click', async () => {
  const appRef = doc(db, "applications", `${currentUser.uid}_${sportId}`);
  const docSnap = await getDoc(appRef);
  if (docSnap.exists()) {
    const data = docSnap.data();

    previewName.value = data.name || "";
    previewEmail.value = data.email || "";
    previewDOB.value = data.dob || "";
    previewPhone.value = data.phone || "";

    previewModal.style.display = 'flex';
  }
});

// === See Members Button ===
seeMembersBtn.addEventListener('click', () => {
  window.location.href = `members.html?id=${sportId}`;
});

// === Modal Controls ===
applyBtn.addEventListener('click', () => {
  formModal.style.display = 'flex';
});
closeForm.addEventListener('click', () => {
  formModal.style.display = 'none';
});
closePreview.addEventListener('click', () => {
  previewModal.style.display = 'none';
});

// === Go to Dashboard ===
dashboardBtn.addEventListener('click', () => {
  window.location.href = "dashboard.html";
});

// === Auth Check ===
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    loadSportDetails();
    checkApplication(user.uid);
  }
});
