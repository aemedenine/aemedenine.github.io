// ==========================================================
//  2026 FULL JS - Atelier Électronique Médenine
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
const usersRef     = db.ref("users");
const onlineRef    = db.ref("onlineUsers");
const ratingsRef   = db.ref("ratings");
const userRatingsRef = db.ref("userRatings");

// ================= ELEMENTS =================
const loginButton   = document.querySelector(".login-btn");
const userBox       = document.getElementById("userBox");
const logoutBtn     = document.getElementById("logoutBtn");
const profileModal  = document.getElementById("profileModal");
const closeProfile  = document.getElementById("closeProfile");

const stars         = document.querySelectorAll('.stars-horizontal span');
const ratingMessage = document.getElementById('rating-message');

let currentUser = null;
let currentUserRating = 0;

// ================= INIT & EVENT LISTENERS =================
document.addEventListener("DOMContentLoaded", () => {

// Google Login
loginButton?.addEventListener("click", () => {
    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            showUserInterface(user);
            loginPopup.style.display = "none"; // Fermer la fenêtre de login
            updateUserVisits(user);
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

  // Open profile modal
userBox?.addEventListener("click", () => {
  if (!profileModal || !currentUser) return;
  
  profileModal.style.display = "flex";
  
  // taswira
  const profAvatar = profileModal.querySelector("#profileAvatar");
  if (profAvatar) profAvatar.src = currentUser.photoURL || "https://via.placeholder.com/90?text=User";
  
  // nom
  const profName = profileModal.querySelector("#profileName");
  if (profName) profName.innerText = currentUser.displayName || "Utilisateur";
  
  // rank w visites (t9ader t7ot default "Member" w "0" lken ma3andeksh data)
  const profRank = profileModal.querySelector("#profileRank");
  if (profRank) profRank.innerText = "⭐ Member"; // update ba3d men DB lken houni simple
  
  const profVisits = profileModal.querySelector("#profileVisits");
  if (profVisits) profVisits.innerText = "0"; // update ba3d men DB
});

  // Close profile
  closeProfile?.addEventListener("click", () => {
    profileModal.style.display = "none";
  });

  // Close login popup (si tu as un bouton close)
  closeLogin?.addEventListener("click", () => {
    loginPopup.style.display = "none";
  });
});

// Auth state listener (le plus important)
auth.onAuthStateChanged(user => {
  currentUser = user;

  if (user) {
    showUserInterface(user);
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

// ================= HELPER FUNCTIONS =================

function showUserInterface(user) {
  if (userBox) {
    userBox.style.display = "flex";
    const avatar = document.getElementById("userAvatar");
    if (avatar) {
      avatar.src = user.photoURL || "https://via.placeholder.com/40?text=User";
    }
  }
  if (loginButton) loginButton.style.display = "none";
}


function hideUserInterface() {
  if (userBox)    userBox.style.display = "none";
  if (loginButton) loginButton.style.display = "inline-block";
}

function updateUserVisits(user) {
  const userRef = usersRef.child(user.uid);

  userRef.transaction(current => {
    const data = current || { visits: 0, rank: "Member" };
    data.visits = (data.visits || 0) + 1;

    if      (data.visits >= 50) data.rank = "VIP";
    else if (data.visits >= 20) data.rank = "Pro";
    else if (data.visits >= 5)  data.rank = "Active";
    else                        data.rank = "Member";

    return data;
  }, (err, committed, snap) => {
    if (err || !committed || !snap) return;

    const data = snap.val();
    document.getElementById("visitCount").innerText = data.visits;

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
      container.innerHTML += `
        <img src="${data.avatar}" alt="online" class="online-avatar" title="${data.name||'?'}" />
      `;
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

// Rating click handler
stars.forEach(star => {
  star.addEventListener('click', () => {
    if (!currentUser) return alert("🔒 Connectez-vous pour noter !");
    if (currentUserRating > 0) return alert("Vous avez déjà noté !");

    const val = Number(star.dataset.value);

    // Save personal rating
    userRatingsRef.child(currentUser.uid).set({
      rating: val,
      name: currentUser.displayName || "Anonyme",
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // Update global ratings
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
  });
});

function updateAverageStars() {
  ratingsRef.once('value').then(snap => {
    const data = snap.val() || {};
    const avg = data.count > 0 ? (data.sum / data.count).toFixed(1) : "0.0";

    document.getElementById('avg-stars').textContent = avg;
    document.getElementById('vote-count').textContent = data.count || 0;

    // Highlight average (approximatif)
    const rounded = Math.round(Number(avg));
    stars.forEach((star, i) => {
      star.classList.toggle('average-highlight', (5 - i) <= rounded);
    });
  });
}

// Real-time average update
ratingsRef.on('value', updateAverageStars);

// ================= ONLINE USERS FULL LIST =================
onlineRef.on("value", snap => {
  const container = document.getElementById("onlineUsers");
  if (!container) return;

  container.innerHTML = "";
  snap.forEach(child => {
    const data = child.val();
    if (!data) return;
    container.innerHTML += `
      <div class="online-user">
        <img src="${data.avatar || 'default-avatar.png'}" alt="" />
        <span>${data.name || "Anonyme"}</span>
      </div>
    `;
  });
});
// ========================
// HERO 3 PHOTOS SLIDESHOW
// ========================

const photos = [
    // Photo 1 (gauche)
    [
        "images/hero-left-1.png",
        "images/hero-left-2.jpg",
        "images/hero-left-3.jpg",
        "images/hero-left-4.jpg",
        "images/hero-left-5.jpg",
        "images/hero-left-6.jpg",
        // zed photos eli 3andek lel position 1
    ],
    
    // Photo 2 (milieu)
    [
        "images/hero-right-1.png",
        "images/hero-right-2.jpg",
        "images/hero-right-3.jpg",
       "images/hero-right-4.jpg",
       "images/hero-right-5.jpg",
       "images/hero-right-6.jpg",
        // zed photos lel milieu
    ],
    
    // Photo 3 (droite)
    [
        "images/hero-left-11.jpg",
        "images/hero-left-12.jpg",
        "images/hero-left-13.jpg",
       "images/hero-left-14.jpg",
       "images/hero-left-15.jpg",
       "images/hero-left-16.jpg",
        // zed photos lel position 3
    ]
];

const imgElements = [
    document.getElementById("heroImg1"),
    document.getElementById("heroImg2"),
    document.getElementById("heroImg3")
];

const indices = [0, 0, 0];  // index courant pour chaque photo

function changePhoto(position) {
    const idx = (indices[position] + 1) % photos[position].length;
    indices[position] = idx;
    
    const img = imgElements[position];
    img.style.opacity = 0;
    
    setTimeout(() => {
        img.src = photos[position][idx];
        img.style.opacity = 1;
    }, 500);  // temps du fade out
}

// Démarrer les 3 slideshows (tous les 10 secondes)
setInterval(() => changePhoto(0), 10000);
setInterval(() => changePhoto(1), 10000);
setInterval(() => changePhoto(2), 10000);

// Optionnel : décalage pour que ça change pas tous en même temps (plus vivant)
setTimeout(() => setInterval(() => changePhoto(1), 10000), 3000);
setTimeout(() => setInterval(() => changePhoto(2), 10000), 6000);
// ================= ANIMATIONS & SMOOTH SCROLL =================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
});

document.querySelectorAll(".service-card, .calc-card, .atelier-cards .card")
  .forEach(el => observer.observe(el));

// Simple scroll reveal
function revealOnScroll() {
  const trigger = window.innerHeight * 0.85;
  const heroTitle = document.querySelector(".hero h2");
  const cards = document.querySelectorAll(".card");

  if (heroTitle?.getBoundingClientRect().top < trigger) {
    heroTitle.classList.add("show");
  }

  cards.forEach(card => {
    if (card.getBoundingClientRect().top < trigger) {
      card.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// Smooth scroll for anchors
document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target?.scrollIntoView({ behavior: "smooth" });
  });
});
