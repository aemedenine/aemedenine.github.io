// ==========================================================
// 2026 FULL JS FOR ATELIER ELECTRONIQUE MEDENINE
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

// 🔥 نطلبو access للصورة
provider.addScope('profile');
provider.addScope('email');

// ================= REFERENCES =================
const usersRef = db.ref("users");
const onlineRef = db.ref("onlineUsers");
const ratingsRef = db.ref("ratings");
const userRatingsRef = db.ref("userRatings");

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

let currentUser = null;
let currentUserRating = 0;

// ================= PAGE READY =================
document.addEventListener("DOMContentLoaded", () => {

  // -------- Login Popup Open --------
  loginButton?.addEventListener("click", () => {
    loginPopup.style.display = "flex";
  });

  // -------- Close Login Popup --------
  closeLogin?.addEventListener("click", () => {
    loginPopup.style.display = "none";
  });

  // -------- Google Login --------
  loginSubmit?.addEventListener("click", () => {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
       // ❌ showUserBox(user); (تم تعطيله)

// نخليو غير logo
if(userBox) userBox.style.display = "none";
if(loginButton) loginButton.style.display = "inline-block";
        loginPopup.style.display = "none";
        updateUserVisits(user);
        updateOnlineUsers(user);
      })
      .catch(err => alert("Erreur connexion: " + err.message));
  });

  // -------- Logout --------
  logoutBtn?.addEventListener("click", e => {
    e.stopPropagation();
    auth.signOut().then(() => {
      userBox.style.display = "none";
      loginButton.style.display = "inline-block";
      alert("🔓 Déconnecté !");
    });
  });

  // -------- User Box Click → Profile Modal --------
  userBox?.addEventListener("click", () => {
    if (profileModal) {
      profileModal.style.display = "flex";
      profileModal.querySelector("#profileName").innerText = document.getElementById("username")?.innerText || "";
      profileModal.querySelector("#profileAvatar").src = document.getElementById("userAvatar")?.src || "";
      profileModal.querySelector("#profileRank").innerText = document.querySelector(".user-rank")?.innerText || "";
      profileModal.querySelector("#profileVisits").innerText = document.getElementById("visitCount")?.innerText || "0";
    }
  });

  // -------- Close Profile Modal --------
  closeProfile?.addEventListener("click", () => {
    profileModal.style.display = "none";
  });

});

// ================= AUTH STATE CHANGE =================
auth.onAuthStateChanged(user => {
  currentUser = user;
 if (user) {

  // ❌ ما نظهروش userBox
  if(userBox) userBox.style.display = "none";

  // ✅ نخليو غير logo
  if(loginButton) loginButton.style.display = "flex";

  // ✅ نخدمو الباقي عادي (firebase)
  updateUserVisits(user);
  updateOnlineUsers(user);
  updateOnlineMini();
  loadUserRating();
}
 else {
    userBox.style.display = "none";
    loginButton.style.display = "inline-block";
    currentUserRating = 0;
    updateStars(0);
  }
});

// ================= FUNCTIONS =================

// -------- Show User Box --------
function showUserBox(user) {
  // ❌ ما نظهروش userBox
  if(userBox) userBox.style.display = "none";

  // ✅ نخليو غير زر Google ظاهر
  if(loginButton) loginButton.style.display = "flex";
}

// -------- Update Visits & Rank --------
function updateUserVisits(user) {
  const userRef = usersRef.child(user.uid);
  userRef.transaction(current => {
    const data = current || { visits: 0, rank: "Member" };
    data.visits++;
    if (data.visits >= 50) data.rank = "VIP";
    else if (data.visits >= 20) data.rank = "Pro";
    else if (data.visits >= 5) data.rank = "Active";
    else data.rank = "Member";
    return data;
  }, (err, committed, snap) => {
    if (!err && committed && snap) {
      const data = snap.val();
      document.getElementById("visitCount").innerText = data.visits;
      const rankEl = document.querySelector(".user-rank");
      if (rankEl) {
        const stars = "⭐".repeat(data.rank === "Member" ? 1 : data.rank === "Active" ? 2 : data.rank === "Pro" ? 3 : 5);
        rankEl.innerText = stars + " " + data.rank;
      }
    }
  });
}

// -------- Update Online Users --------
function updateOnlineUsers(user) {
  const userOnlineRef = onlineRef.child(user.uid);
  userOnlineRef.set({ avatar: user.photoURL || "", lastActive: firebase.database.ServerValue.TIMESTAMP });
  userOnlineRef.onDisconnect().remove();
}

// -------- Online Mini List --------
function updateOnlineMini() {
  const container = document.getElementById("onlineMini");
  if (!container) return;
  onlineRef.on("value", snap => {
    container.innerHTML = "";
    snap.forEach(child => {
      const data = child.val();
      if (data && data.avatar) container.innerHTML += `<div><img src="${data.avatar}" alt="User"></div>`;
    });
  });
}

// -------- Load User Rating --------
function loadUserRating() {
  if (!currentUser) return;
  userRatingsRef.child(currentUser.uid).once('value').then(snap => {
    const data = snap.val();
    if (data?.rating) {
      currentUserRating = data.rating;
      updateStars(currentUserRating);
      ratingMessage.textContent = `Vous avez déjà noté ${currentUserRating} étoiles 🌟`;
      ratingMessage.classList.add('show');
    }
  }).catch(console.error);
  updateAverageStars();
}

// -------- Update Stars UI --------
function updateStars(r) {
  stars.forEach(star => {
    const val = Number(star.dataset.value);
    star.classList.toggle('selected', val <= r);
  });
}

// -------- Click on Stars --------
stars.forEach(star => {
  star.addEventListener('click', () => {
    if (!currentUser) return alert("🔒 Connectez-vous pour noter !");
    if (currentUserRating > 0) return alert("Vous avez déjà noté !");

    const val = Number(star.dataset.value);

    userRatingsRef.child(currentUser.uid).set({
      rating: val,
      name: currentUser.displayName || "Anonyme",
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    ratingsRef.transaction(current => {
      const data = current || { sum: 0, count: 0, breakdown: {1:0,2:0,3:0,4:0,5:0} };
      data.sum += val;
      data.count++;
      data.breakdown[val] = (data.breakdown[val] || 0) + 1;
      return data;
    }, (err, committed, snap) => { if(committed) updateAverageStars(); });

    currentUserRating = val;
    updateStars(val);
    ratingMessage.textContent = `Merci ${currentUser.displayName || "bro"}, votre note (${val} étoiles) a été enregistrée 🌟`;
    ratingMessage.classList.add('show');
    setTimeout(()=>ratingMessage.classList.remove('show'), 6000);
  });
});

// -------- Update Average Stars --------
function updateAverageStars() {
  ratingsRef.once('value').then(snap => {
    const data = snap.val();
    const avg = data?.count > 0 ? (data.sum / data.count).toFixed(1) : "0.0";
    document.getElementById('avg-stars').textContent = avg;
    document.getElementById('vote-count').textContent = data?.count || 0;
    stars.forEach((star, i) => star.classList.toggle('average-highlight', (5-i) <= Math.round(avg)));
  });
}

// Listen realtime rating changes
ratingsRef.on('value', updateAverageStars);

// ================= ONLINE USERS DISPLAY =================
onlineRef.on("value", snap => {
  const container = document.getElementById("onlineUsers");
  if (!container) return;
  container.innerHTML = "";
  snap.forEach(child => {
    const data = child.val();
    container.innerHTML += `<div style="display:flex;align-items:center"><img src="${data.avatar}" style="width:25px;border-radius:50%;margin-right:5px;"><span>${data.name||""}</span></div>`;
  });
});

// ================= ANIMATIONS =================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add("show"); });
});
document.querySelectorAll(".service-card, .calc-card, .atelier-cards .card").forEach(el => observer.observe(el));

// Scroll reveal
const heroTitle = document.querySelector(".hero h2");
const cards = document.querySelectorAll(".card");
function revealElements(){
  const trigger = window.innerHeight * 0.85;
  if(heroTitle.getBoundingClientRect().top < trigger) heroTitle.classList.add("show");
  cards.forEach(card => { if(card.getBoundingClientRect().top < trigger) card.classList.add("show"); });
}
window.addEventListener("scroll", revealElements);
window.addEventListener("load", revealElements);

// ================= SMOOTH SCROLL =================
document.querySelectorAll("a[href^='#']").forEach(a=>{
  a.addEventListener("click", e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({behavior:"smooth"});
  });
});
