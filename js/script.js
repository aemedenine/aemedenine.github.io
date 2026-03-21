// ==========================================================
// 2026 FULL JS - Atelier Électronique Médenine (ALL FIXED)
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

// ================= ELEMENTS =================
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");
const loginButton = document.querySelector(".login-btn");
const userBox = document.getElementById("userBox");
const logoutBtn = document.getElementById("logoutBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const stars = document.querySelectorAll('.stars-horizontal span');
const ratingMessage = document.getElementById('rating-message');

let currentUser = null;
let currentUserRating = 0;

// ================= HELPER FUNCTIONS =================
function createUserIfNotExists(user) {
  const ref = usersRef.child(user.uid);
  ref.once("value").then(snap => {
    if (!snap.exists()) {
      ref.set({
        nick: user.displayName || "User",
        niveau: "Member",
        createdAt: Date.now(),
        visits: 1,
        rank: "Member"
      });
    }
  });
}

function showUserInterface(user) {
  if (userBox) {
    userBox.style.display = "flex";
    const avatar = document.getElementById("userAvatar");
    if (avatar) avatar.src = user.photoURL || "https://via.placeholder.com/40?text=User";
  }
  if (loginButton) loginButton.style.display = "none";
}

function hideUserInterface() {
  if (userBox) userBox.style.display = "none";
  if (loginButton) loginButton.style.display = "inline-block";
}

function updateUserVisits(user) {
  const userRef = usersRef.child(user.uid);
  userRef.transaction(current => {
    const data = current || { visits: 0, rank: "Member" };
    data.visits = (data.visits || 0) + 1;
    if (data.visits >= 50) data.rank = "VIP";
    else if (data.visits >= 20) data.rank = "Pro";
    else if (data.visits >= 5) data.rank = "Active";
    else data.rank = "Member";
    return data;
  }, (err, committed, snap) => {
    if (err || !committed || !snap) return;
    const data = snap.val();
    const visitEl = document.getElementById("profileVisits");
    if (visitEl) visitEl.innerText = data.visits;
    const rankEl = document.querySelector(".user-rank");
    if (rankEl) {
      const starsCount = { Member:1, Active:2, Pro:3, VIP:5 }[data.rank] || 1;
      rankEl.innerText = "⭐".repeat(starsCount) + " " + data.rank;
    }
  });
}

function updateOnlineUsers(user) {
  const userOnlineRef = onlineRef.child(user.uid);
  userOnlineRef.set({
    avatar: user.photoURL || "",
    name: user.displayName || "Anonyme",
    lastActive: firebase.database.ServerValue.TIMESTAMP
  });
  userOnlineRef.onDisconnect().remove();
}

function updateOnlineMini() {
  const container = document.getElementById("onlineMini");
  if (!container) return;
  onlineRef.on("value", snap => {
    container.innerHTML = "";
    snap.forEach(child => {
      const data = child.val();
      if (!data?.avatar) return;
      container.innerHTML += `<img src="${data.avatar}" alt="online" class="online-avatar" title="${data.name||'?'}" />`;
    });
  });
}

function loadUserRating() {
  if (!currentUser) return;
  userRatingsRef.child(currentUser.uid).once('value')
    .then(snap => {
      const data = snap.val();
      if (data?.rating) {
        currentUserRating = data.rating;
        updateStars(currentUserRating);
        ratingMessage.textContent = `Vous avez déjà noté ${currentUserRating} étoiles 🌟`;
        ratingMessage.classList.add('show');
      }
    })
    .catch(console.error);
  updateAverageStars();
}

function updateStars(rating) {
  stars.forEach(star => {
    const val = Number(star.dataset.value);
    star.classList.toggle('selected', val <= rating);
  });
}

function updateAverageStars() {
  ratingsRef.once('value').then(snap => {
    const data = snap.val() || {};
    const avg = data.count > 0 ? (data.sum / data.count).toFixed(1) : "0.0";
    document.getElementById('avg-stars').textContent = avg;
    document.getElementById('vote-count').textContent = data.count || 0;
    const rounded = Math.round(Number(avg));
    stars.forEach((star, i) => {
      star.classList.toggle('average-highlight', (5 - i) <= rounded);
    });
  });
}

// ================= INIT & EVENT LISTENERS =================
document.addEventListener("DOMContentLoaded", () => {

  // Google Login
  loginButton?.addEventListener("click", () => {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        showUserInterface(user);
        updateOnlineUsers(user);
      })
      .catch(err => {
        console.error("Erreur connexion :", err);
        alert("Erreur connexion: " + err.message);
      });
  });

  // Logout
  logoutBtn?.addEventListener("click", e => {
    e.stopPropagation();
    auth.signOut()
      .then(() => {
        hideUserInterface();
        alert("🔓 Déconnecté !");
      })
      .catch(err => console.error("Erreur logout :", err));
  });

  // Profile modal
  userBox?.addEventListener("click", () => {
    if (!profileModal || !currentUser) return;
    profileModal.style.display = "flex";

    const profAvatar = profileModal.querySelector("#profileAvatar");
    if (profAvatar) profAvatar.src = currentUser.photoURL || "https://via.placeholder.com/90?text=User";

    const profName = profileModal.querySelector("#profileName");
    if (profName) profName.innerText = currentUser.displayName || "Utilisateur";

    const profRank = profileModal.querySelector("#profileRank");
    if (profRank) profRank.innerText = "⭐ Member";

    const profVisits = profileModal.querySelector("#profileVisits");
    usersRef.child(currentUser.uid).once('value')
      .then(snap => {
        const data = snap.val();
        if (profVisits) profVisits.innerText = data?.visits || 0;
      });
  });

  // Close profile/login
  closeProfile?.addEventListener("click", () => profileModal.style.display = "none");
  closeLogin?.addEventListener("click", () => loginPopup.style.display = "none");

  // Stars click
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
      }, (err, committed) => { if (committed) updateAverageStars(); });
      currentUserRating = val;
      updateStars(val);
      ratingMessage.textContent = `Merci ${currentUser.displayName || "bro"}, votre note (${val} étoiles) a été enregistrée 🌟`;
      ratingMessage.classList.add('show');
      setTimeout(() => ratingMessage.classList.remove('show'), 6000);
    });
  });

});

// ================= AUTH STATE LISTENER =================
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    showUserInterface(user);
    createUserIfNotExists(user);
    updateUserVisits(user);
    updateOnlineUsers(user);
    updateOnlineMini();
    loadUserRating();
  } else {
    hideUserInterface();
    currentUserRating = 0;
    updateStars(0);
  }
});

// ================= ONLINE USERS FULL LIST =================
onlineRef.on("value", snap => {
  const container = document.getElementById("onlineUsers");
  if (!container) return;
  container.innerHTML = "";
  snap.forEach(child => {
    const data = child.val();
    if (!data) return;
    container.innerHTML += `<div class="online-user">
      <img src="${data.avatar || 'default-avatar.png'}" alt="" />
      <span>${data.name || "Anonyme"}</span>
    </div>`;
  });
});

// ================= HERO 3 PHOTOS SLIDESHOW =================
const heroPhotos = [
  ["images/hero-left-1.png","images/hero-left-2.jpg","images/hero-left-3.jpg","images/hero-left-4.jpg","images/hero-left-5.jpg","images/hero-left-6.jpg"],
  ["images/hero-right-1.png","images/hero-right-2.jpg","images/hero-right-3.jpg","images/hero-right-4.jpg","images/hero-right-5.jpg","images/hero-right-6.jpg"],
  ["images/hero-left-11.jpg","images/hero-left-12.jpg","images/hero-left-13.jpg","images/hero-left-14.jpg","images/hero-left-15.jpg","images/hero-left-16.jpg"]
];

const heroImgElements = [
  document.getElementById("heroImg1"),
  document.getElementById("heroImg2"),
  document.getElementById("heroImg3")
];

const currentIndices = [0,0,0];

function changeHeroPhoto(pos) {
  if (!heroImgElements[pos]) return;
  currentIndices[pos] = (currentIndices[pos]+1)%heroPhotos[pos].length;
  const img = heroImgElements[pos];
  img.classList.add("fade-out");
  setTimeout(()=>{ img.src = heroPhotos[pos][currentIndices[pos]]; img.classList.remove("fade-out"); },500);
}

// lancer slideshow
setInterval(()=>changeHeroPhoto(0),5000);
setInterval(()=>changeHeroPhoto(1),5000);
setInterval(()=>changeHeroPhoto(2),5000);
setTimeout(()=>setInterval(()=>changeHeroPhoto(1),5000),1500);
setTimeout(()=>setInterval(()=>changeHeroPhoto(2),5000),3000);


// ================= LIVE CLOCK =================
function updateLiveClock() {
  const now = new Date();
  
  const daysFr = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const dayName = daysFr[now.getDay()];
  
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const clockHTML = `${dayName} ${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  
  const clockEl = document.getElementById('live-clock');
  if (clockEl) clockEl.innerHTML = clockHTML;
}

// تحديث كل ثانية + تشغيل فوري
setInterval(updateLiveClock, 1000);
updateLiveClock();   // أول مرة
// ================= ANIMATIONS & SMOOTH SCROLL =================
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add("show"); });
});

document.querySelectorAll(".service-card, .calc-card, .atelier-cards .card").forEach(el=>observer.observe(el));

function revealOnScroll(){
  const trigger = window.innerHeight*0.85;
  const heroTitle = document.querySelector(".hero h2");
  const cards = document.querySelectorAll(".card");
  if(heroTitle?.getBoundingClientRect().top<trigger) heroTitle.classList.add("show");
  cards.forEach(card=>{ if(card.getBoundingClientRect().top<trigger) card.classList.add("show"); });
}

window.addEventListener("scroll",revealOnScroll);
window.addEventListener("load",revealOnScroll);

document.querySelectorAll("a[href^='#']").forEach(link=>{
  link.addEventListener("click", e=>{
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target?.scrollIntoView({ behavior:"smooth" });
  });
});
// ================= SIMPLE VISITS COUNTER (just icon + number) =================
const visitsRef = db.ref("stats/totalVisits");

// زيادة الزيارة مرة واحدة فقط لكل جلسة
if (!sessionStorage.getItem("visitCounted")) {
    visitsRef.transaction(current => (current || 0) + 1);
    sessionStorage.setItem("visitCounted", "true");
}

// عرض الرقم في الوقت الفعلي
visitsRef.on("value", snapshot => {
    const count = snapshot.val() || 0;
    const el = document.getElementById("total-visits");
    if (el) {
        el.textContent = count.toLocaleString('fr-TN');  // 1 234 بدل 1234
    }
});
