import { auth, db } from './firebase-config.js';
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// === Logout Button ===
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

// === Tab Switching ===
const tabButtons = document.querySelectorAll('.tab-btn');
const tabSections = document.querySelectorAll('.admin-tab');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabSections.forEach(sec => sec.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.dataset.tab;
    document.getElementById(targetId).classList.add('active');
  });
});

// === Add Sport ===
const addSportForm = document.getElementById('addSportForm');
const sportsList = document.getElementById('sportsList');

addSportForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('sportName').value;
  const description = document.getElementById('sportDescription').value;
  const date = document.getElementById('sportDate').value;
  const location = document.getElementById('sportLocation').value;

  try {
    await addDoc(collection(db, "sports"), {
      name,
      description,
      date,
      location,
      createdAt: new Date()
    });

    addSportForm.reset();
    loadSports();
  } catch (error) {
    console.error("Error adding sport:", error);
  }
});

// === Load Sports ===
async function loadSports() {
  const sportsSnapshot = await getDocs(collection(db, "sports"));
  sportsList.innerHTML = "";

  sportsSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p>${data.description}</p>
      <button data-id="${docSnap.id}" class="delete-sport">Delete Sport</button>
    `;

    sportsList.appendChild(card);
  });

  // Attach delete listeners
  document.querySelectorAll('.delete-sport').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await deleteDoc(doc(db, "sports", id));
      loadSports();
    });
  });
}

// === Load Participants ===
async function loadParticipants() {
  const usersRef = query(collection(db, "users"), where("role", "==", "user"));
  const userSnapshot = await getDocs(usersRef);
  const container = document.getElementById("participantsList");

  container.innerHTML = "";

  userSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>Email: ${data.email}</p>
      <button data-id="${docSnap.id}" class="delete-user">Delete</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.delete-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await deleteDoc(doc(db, "users", id));
      loadParticipants();
    });
  });
}

// === Load Applications ===
async function loadApplications() {
  const applicationsRef = await getDocs(collection(db, "applications"));
  const container = document.getElementById("applicationsList");

  container.innerHTML = "";

  applicationsRef.forEach(async docSnap => {
    const data = docSnap.data();
    const sportRef = doc(db, "sports", data.sport);
    const sportSnap = await getDoc(sportRef);
    const sportName = sportSnap.exists() ? sportSnap.data().name : data.sport;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>Sport:</strong> ${sportName}</p>
      <button class="preview-btn">Preview</button>
      <button class="delete-application" data-id="${docSnap.id}">Delete</button>
    `;

    container.appendChild(div);

    const previewBtn = div.querySelector(".preview-btn");
    previewBtn.addEventListener('click', () => {
      showPreviewModal({
        name: data.name,
        email: data.email,
        sport: sportName,
        phone: data.phone,
        dob: data.dob
      });
    });

    div.querySelector(".delete-application").addEventListener('click', async () => {
      await deleteDoc(doc(db, "applications", docSnap.id));
      loadApplications();
    });
  });
}

function showPreviewModal(data) {
  let modal = document.getElementById("previewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "previewModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-box">
        <h3>Application Preview</h3>
        <p><strong>Name:</strong> <span id="modalName"></span></p>
        <p><strong>Email:</strong> <span id="modalEmail"></span></p>
        <p><strong>Sport:</strong> <span id="modalSport"></span></p>
        <p><strong>Phone:</strong> <span id="modalPhone"></span></p>
        <p><strong>DOB:</strong> <span id="modalDob"></span></p>
        <div class="modal-buttons">
          <button onclick="document.getElementById('previewModal').style.display='none'">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById("modalName").innerText = data.name;
  document.getElementById("modalEmail").innerText = data.email;
  document.getElementById("modalSport").innerText = data.sport;
  document.getElementById("modalPhone").innerText = data.phone;
  document.getElementById("modalDob").innerText = data.dob;

  modal.style.display = "flex";
}

// === Auth Check & Initial Load ===
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadSports();
    loadParticipants();
    loadApplications();
  }
});