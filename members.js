import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// DOM Elements
const membersList = document.getElementById('membersList');
const chatBox = document.getElementById('chatBox');
const chatHeader = document.getElementById('chatHeader');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const backToSportsBtn = document.getElementById('backToSportsBtn');

let currentUser = null;
let selectedMember = null;
let unsubscribe = null;

// Create unique chat ID
function getChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

// Load Members List
async function loadMembers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  membersList.innerHTML = '<h3>Members</h3>';

  usersSnapshot.forEach(docSnap => {
    const user = docSnap.data();
    user.uid = docSnap.id; // ✅ Add UID from doc ID

    if (user.uid !== currentUser.uid) {
      const div = document.createElement('div');
      div.classList.add('member-item');
      div.textContent = user.name || user.email;
      div.addEventListener('click', () => openChat(user));
      membersList.appendChild(div);
    }
  });
}

// Open Chat View
function openChat(member) {
  selectedMember = member;
  chatBox.style.display = 'flex';
  chatHeader.textContent = `Chat with ${member.name || member.email}`;
  chatMessages.innerHTML = '';

  if (unsubscribe) unsubscribe();

  const chatId = getChatId(currentUser.uid, member.uid);
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp'));

  unsubscribe = onSnapshot(q, snapshot => {
    chatMessages.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('chat-message', msg.sender === currentUser.uid ? 'sent' : 'received');
      msgDiv.textContent = msg.text;
      chatMessages.appendChild(msgDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Send Message
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !selectedMember) return;

  const chatId = getChatId(currentUser.uid, selectedMember.uid);
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text,
    sender: currentUser.uid,
    receiver: selectedMember.uid,
    timestamp: serverTimestamp()
  });

  chatInput.value = '';
  chatInput.focus();
}

// Handle form submit (button click or Enter)
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await sendMessage();
});

// Optional: separate Enter key listener
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

// Back button
backToSportsBtn.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Auth Check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  } else {
    currentUser = user;
    loadMembers();
  }
});
