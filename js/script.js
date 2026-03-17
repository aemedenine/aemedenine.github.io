// ==========================================================
// 2026 FULL JS FOR ATELIER ELECTRONIQUE MEDENINE - MSA7A7 & OPTIMIZED
// ==========================================================

// ================= FIREBASE CONFIG & INIT =================
const firebaseConfig = {
  apiKey: "AIzaSyCtbEWdm7CAC25ROslGlVeLOvfxdi2exVo",
  authDomain: "atelier-electronique-mednine.firebaseapp.com",
  projectId: "atelier-electronique-mednine",
  storageBucket: "atelier-electronique-mednine.firebasestorage.app",
  messagingSenderId: "547430908384",
  appId: "1:547430908384:web:4caa4cf3869491bd14eb85",
  databaseURL: "https://atelier-electronique-mednine-default-rtdb.europe-west1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');

// ================= REFERENCES =================
const usersRef = db.ref("users");
const onlineRef = db.ref("onlineUsers");
const ratingsRef = db.ref("ratings");
const userRatingsRef = db.ref("userRatings");

// ================= GLOBAL VARS =================
let currentUser = null;
let currentUserRating = 0;

// ================= ELEMENTS =================
const loginButton = document.querySelector(".login-btn");
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");
const loginSubmit = document.querySelector(".login-submit");
const userBox = document.getElementById("userBox");
const logoutBtn = document.getElementById("logoutBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const stars = document.querySelectorAll('.stars-horizontal span');
const ratingMessage = document.getElementById('rating-message');

// ================= PAGE READY - ALL EVENTS HERE =================
document.addEventListener("DOMContentLoaded", () => {
  // Login popup open
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      if (loginPopup) loginPopup.style.display = "flex";
    });
  }

  // Close popup
  if (closeLogin) {
    closeLogin.addEventListener("click", () => {
      if (loginPopup) loginPopup.style.display = "none";
    });
  }

  // Google Login
  if (loginSubmit) {
    loginSubmit.addEventListener("click", () => {
      auth.signInWithPopup(provider)
        .then(result => {
          const user = result.user;
          showUserBox(user);
          if (loginPopup) loginPopup.style.display = "none";
          updateUserVisits(user);
          updateOnlineUsers(user);
        })
        .catch(error => {
          console.error("Login error:", error);
          alert("Erreur connexion: " + error.message);
        });
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.stopPropagation();
      auth.signOut()
        .then(() => {
          if (userBox) userBox.style.display = "none";
          if (loginButton) loginButton.style.display = "inline-block";
          alert("🔓 Déconnecté !");
        })
        .catch(err => console.error("Logout error:", err));
    });
  }

  // User Box → Profile Modal
  if (userBox) {
    userBox.addEventListener("click", () => {
      if (profileModal) {
        profileModal.style.display = "flex";
        profileModal.querySelector("#profileName").innerText = document.getElementById("username")?.innerText || "";
        profileModal.querySelector("#profileAvatar").src = document.getElementById("userAvatar")?.src || "";
        profileModal.querySelector("#profileRank").innerText = document.querySelector(".user-rank")?.innerText || "";
        profileModal.querySelector("#profileVisits").innerText = document.getElementById("visitCount")?.innerText || "0";
      }
    });
  }

  // Close profile
  if (closeProfile) {
    closeProfile.addEventListener("click", () => {
      if (profileModal) profileModal.style.display = "none";
    });
  }

  // Stars rating
  if (stars.length > 0) {
    stars.forEach(star => {
      star.addEventListener('click', () => {
        if (!currentUser) return alert("🔒 Connectez-vous pour noter !");
        if (currentUserRating > 0) return alert("Vous avez déjà noté !");
        const val = Number(star.dataset.value);
        saveRating(val);
      });
    });
  }
});

// ================= AUTH STATE CHANGE =================
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    if (userBox) userBox.style.display = "flex";
    if (loginButton) loginButton.style.display = "none";
    showUserBox(user);
    updateUserVisits(user);
    updateOnlineUsers(user);
    listenOnlineUsers();
    loadUserRating();
  } else {
    if (userBox) userBox.style.display = "none";
    if (loginButton) loginButton.style.display = "inline-block";
    currentUserRating = 0;
    updateStars(0);
  }
});

// ================= FUNCTIONS =================
function showUserBox(user) {
  if (userBox) {
    document.getElementById("username").innerText = user.displayName || "Anonyme";
    document.getElementById("userAvatar").src = user.photoURL || "https://via.placeholder.com/48";
  }
}

function updateUserVisits(user) {
  if (!user || !user.uid) return;
  const userRef = usersRef.child(user.uid);
  userRef.transaction(current => {
    let data = current || { visits: 0, rank: "Member" };
    data.visits = (data.visits || 0) + 1;

    if (data.visits >= 50) data.rank = "VIP";
    else if (data.visits >= 20) data.rank = "Pro";
    else if (data.visits >= 5) data.rank = "Active";
    else data.rank = "Member";

    return data;
  }, (error, committed, snapshot) => {
    if (error) console.error("Erreur visits:", error);
    else if (committed && snapshot) {
      const data = snapshot.val();
      document.getElementById("visitCount").innerText = data.visits;
      const rankEl = document.querySelector(".user-rank");
      if (rankEl) {
        const stars = "⭐".repeat(data.rank === "Member" ? 1 : data.rank === "Active" ? 2 : data.rank === "Pro" ? 3 : 5);
        rankEl.innerText = stars + " " + data.rank;
      }
    }
  });
}

function updateOnlineUsers(user) {
  if (!user || !user.uid) return;
  const userOnlineRef = onlineRef.child(user.uid);
  userOnlineRef.set({
    name: user.displayName || "Anonyme",
    avatar: user.photoURL || "",
    lastActive: firebase.database.ServerValue.TIMESTAMP
  });
  userOnlineRef.onDisconnect().remove();
}

function listenOnlineUsers() {
  const onlineList = document.getElementById("onlineUsersList");
  if (!onlineList) return;

  onlineRef.on("value", snap => {
    onlineList.innerHTML = "";
    let count = 0;
    snap.forEach(child => {
      const data = child.val();
      if (data) {
        count++;
        const li = document.createElement("li");
        li.innerHTML = `<img src="${data.avatar}" width="24" height="24" style="border-radius:50%; margin-right:8px;"> ${data.name}`;
        onlineList.appendChild(li);
      }
    });
    document.getElementById("onlineCount").innerText = count || 0;
  });
}

// ================= RATING FUNCTIONS =================
function loadUserRating() {
  if (!currentUser) return;
  userRatingsRef.child(currentUser.uid).once('value').then(snap => {
    const data = snap.val();
    if (data?.rating) {
      currentUserRating = data.rating;
      updateStars(currentUserRating);
      ratingMessage.textContent = `Vous avez déjà noté ${currentUserRating} étoiles 🌟`;
      ratingMessage.classList.add('show');
      setTimeout(() => ratingMessage.classList.remove('show'), 6000);
    }
  }).catch(console.error);
  updateAverageStars();
}

function updateStars(r) {
  stars.forEach(star => {
    const val = Number(star.dataset.value);
    star.classList.toggle('selected', val <= r);
  });
}

function saveRating(val) {
  userRatingsRef.child(currentUser.uid).set({
    rating: val,
    name: currentUser.displayName || "Anonyme",
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    ratingsRef.transaction(current => {
      const data = current || { sum: 0, count: 0, breakdown: {1:0,2:0,3:0,4:0,5:0} };
      data.sum += val;
      data.count++;
      data.breakdown[val] = (data.breakdown[val] || 0) + 1;
      return data;
    }, (err, committed) => {
      if (committed) updateAverageStars();
    });
    currentUserRating = val;
    updateStars(val);
    ratingMessage.textContent = `Merci ${currentUser.displayName || "bro"}, votre note (${val} étoiles) a été enregistrée 🌟`;
    ratingMessage.classList.add('show');
    setTimeout(() => ratingMessage.classList.remove('show'), 6000);
  }).catch(err => console.error("Erreur save rating:", err));
}

function updateAverageStars() {
  ratingsRef.once('value').then(snap => {
    const data = snap.val();
    const avg = data?.count > 0 ? (data.sum / data.count).toFixed(1) : "0.0";
    document.getElementById('avg-stars').textContent = avg;
    document.getElementById('vote-count').textContent = data?.count || 0;
    stars.forEach((star, i) => star.classList.toggle('average-highlight', (5-i) <= Math.round(avg)));
  }).catch(console.error);
}

// ================= ANIMATIONS & SMOOTH SCROLL =================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
});

document.querySelectorAll(".service-card, .calc-card, .atelier-cards .card").forEach(el => observer.observe(el));

const revealElements = () => {
  const trigger = window.innerHeight * 0.85;
  const heroTitle = document.querySelector(".hero h2");
  const cards = document.querySelectorAll(".card");
  if (heroTitle?.getBoundingClientRect().top < trigger) heroTitle.classList.add("show");
  cards.forEach(card => {
    if (card.getBoundingClientRect().top < trigger) card.classList.add("show");
  });
};

window.addEventListener("scroll", revealElements);
window.addEventListener("load", revealElements);

document.querySelectorAll("a[href^='#']").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  });
});
