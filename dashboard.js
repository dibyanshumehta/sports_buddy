import { auth, db } from './firebase-config.js';
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Logout Logic
document.getElementById('logoutBtn').onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// Protect route - only logged in users can access
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadSportsEvents();
  }
});

// Load Sports Events from Firestore
async function loadSportsEvents() {
  const sportsList = document.getElementById('sportsList');
  sportsList.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "sports"));

    querySnapshot.forEach((doc) => {
      const sport = doc.data();
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${sport.name}</h3>
        <p>${sport.description}</p>
        <p><strong>Date:</strong> ${sport.date}</p>
        <p><strong>Location:</strong> ${sport.location}</p>
        <button onclick="location.href='sports.html?id=${doc.id}'">View Details</button>
      `;

      sportsList.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to fetch sports:", error);
    sportsList.innerHTML = "<p>Unable to load events. Please try again later.</p>";
  }
}
