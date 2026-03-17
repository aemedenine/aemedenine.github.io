// ==========================================
// FIREBASE CONFIG & INIT
// ==========================================
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

// Refs
const usersRef = db.ref("users");
const onlineRef = db.ref("onlineUsers");

// Elements
const loginButton = document.querySelector(".login-btn");
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");
const loginSubmit = document.querySelector(".login-submit");
const userBox = document.getElementById("userBox");
const logoutBtn = document.getElementById("logoutBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");

// ==========================================
// PAGE READY - All events here
// ==========================================
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

  // Google Login submit
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
      auth.signOut().then(() => {
        if (userBox) userBox.style.display = "none";
        alert("🔓 Déconnecté !");
      }).catch(err => console.error("Logout error:", err));
    });
  }

  // User box click → open profile modal
  if (userBox) {
    userBox.addEventListener("click", () => {
      if (profileModal) {
        profileModal.style.display = "flex";
        // Update modal content
        profileModal.querySelector("#profileName").innerText = document.getElementById("username")?.innerText || "";
        profileModal.querySelector("#profileAvatar").src = document.getElementById("userAvatar")?.src || "";
        profileModal.querySelector("#profileRank").innerText = document.querySelector(".user-rank")?.innerText || "";
        profileModal.querySelector("#profileVisits").innerText = document.getElementById("visitCount")?.innerText || "0";
      }
    });
  }

  // Close profile modal
  if (closeProfile) {
    closeProfile.addEventListener("click", () => {
      if (profileModal) profileModal.style.display = "none";
    });
  }
});

// ==========================================
// AUTH STATE CHANGE
// ==========================================
let currentUser = null;
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    showUserBox(user);
    updateUserVisits(user);
    updateOnlineUsers(user);
    listenOnlineUsers(); // realtime online list
  } else {
    currentUser = null;
    if (userBox) userBox.style.display = "none";
  }
});

// ==========================================
// FUNCTIONS
// ==========================================
function showUserBox(user) {
  if (userBox) {
    userBox.style.display = "flex";
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
    avatar: user.photoURL || "",
    lastActive: firebase.database.ServerValue.TIMESTAMP
  });
  userOnlineRef.onDisconnect().remove();
}

function listenOnlineUsersMini() {
  const onlineMiniContainer = document.getElementById("onlineMini");
  if (!onlineMiniContainer) return;

  onlineRef.on("value", snap => {
    onlineMiniContainer.innerHTML = "";
    snap.forEach(child => {
      const data = child.val();
      if (data && data.avatar) {
        const div = document.createElement("div");
        div.innerHTML = `<img src="${data.avatar}" alt="Online User">`;
        onlineMiniContainer.appendChild(div);
      }
    });
  });
}

// === CALL THE FUNCTION AFTER LOGIN ===
auth.onAuthStateChanged(user => {
  if(user){
    updateOnlineUsers(user);
    listenOnlineUsersMini();
  }
});
// ================= RATE / STARS =================
const stars = document.querySelectorAll('.stars-horizontal span');
const ratingMessage = document.getElementById('rating-message');
let currentUserRating = 0;

// Firebase References
const ratingsRef = firebase.database().ref("ratings");
const userRatingsRef = firebase.database().ref("userRatings");

// Auth change + load user rating
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (currentUser) {
    userRatingsRef.child(currentUser.uid).once('value').then(snapshot => {
      const data = snapshot.val();
      if (data && data.rating) {
        currentUserRating = data.rating;
        updateStars(currentUserRating);
        ratingMessage.textContent = `Vous avez déjà noté ${currentUserRating} étoiles 🌟`;
        ratingMessage.classList.add('show');
      }
    }).catch(err => console.error("Erreur load user rating:", err));
  } else {
    currentUserRating = 0;
    updateStars(0);
  }
  // Update average après login (pour refresh)
  updateAverageStars();
});

// Update stars UI
function updateStars(r) {
  stars.forEach(star => {
    const val = Number(star.dataset.value);
    star.classList.toggle('selected', val <= r);
  });
}

// Click on star
stars.forEach(star => {
  star.addEventListener('click', () => {
    if (!currentUser) {
      alert("🔒 Connectez-vous pour noter !");
      return;
    }
    if (currentUserRating > 0) {
      alert("Vous avez déjà noté ! Vous ne pouvez pas modifier pour l'instant.");
      return;
    }

    const val = Number(star.dataset.value);

    // 1. Save user rating (unique per user)
    userRatingsRef.child(currentUser.uid).set({
      rating: val,
      name: currentUser.displayName || "Anonyme",
      timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      console.log("User rating saved:", val);
    }).catch(err => {
      console.error("Erreur save user rating:", err);
      alert("Erreur lors de l'enregistrement de votre note.");
    });

    // 2. Update global ratings (transaction safe)
    ratingsRef.transaction(current => {
      // Si null ou undefined → init
      const data = current || { sum: 0, count: 0, breakdown: {1:0, 2:0, 3:0, 4:0, 5:0} };

      data.sum += val;
      data.count += 1;
      data.breakdown[val] = (data.breakdown[val] || 0) + 1;

      return data;
    }, (error, committed, snapshot) => {
      if (error) {
        console.error("Transaction failed:", error);
        alert("Erreur lors de la mise à jour du rating global.");
      } else if (committed) {
        console.log("Global rating updated");
        updateAverageStars();
      }
    });

    // 3. UI feedback
    currentUserRating = val;
    updateStars(val);
    ratingMessage.textContent = `Merci ${currentUser.displayName || "bro"}, votre note (${val} étoiles) a été enregistrée 🌟`;
    ratingMessage.classList.add('show');
    setTimeout(() => ratingMessage.classList.remove('show'), 6000);
  });
});

// Update average display
function updateAverageStars() {
  ratingsRef.once('value').then(snapshot => {
    const data = snapshot.val();
    if (data && data.count > 0) {
      const avg = (data.sum / data.count).toFixed(1);
      document.getElementById('avg-stars').textContent = avg;
      document.getElementById('vote-count').textContent = data.count;

      // Highlight stars based on average
      const starsElements = document.querySelectorAll('.stars-horizontal span');
      starsElements.forEach((star, index) => {
        const starValue = 5 - index;
        star.classList.toggle('average-highlight', starValue <= Math.round(avg));
      });
    } else {
      document.getElementById('avg-stars').textContent = "0.0";
      document.getElementById('vote-count').textContent = "0";
    }
  }).catch(err => {
    console.error("Erreur load average:", err);
  });
}

// Listen realtime changes (pour multi-users)
ratingsRef.on('value', () => {
  updateAverageStars();
});

// Initial load
updateAverageStars();
// ================= ONLINE USERS DISPLAY
onlineRef.on("value", snapshot=>{
  const container = document.getElementById("onlineUsers");
  container.innerHTML="";
  snapshot.forEach(child=>{
    const data = child.val();
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.innerHTML=`<img src="${data.avatar}" style="width:25px;border-radius:50%;margin-right:5px;"><span>${data.name}</span>`;
    container.appendChild(div);
  });
});
// ================= animation nos services
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {

    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }

  });
});

document.querySelectorAll(".service-card, .calc-card, .atelier-cards .card")
.forEach(el => observer.observe(el));
// ================= SCROLL ANIMATION
const heroTitle = document.querySelector(".hero h2");
const cards = document.querySelectorAll(".card");
function revealElements(){
  const triggerBottom = window.innerHeight*0.85;
  if(heroTitle.getBoundingClientRect().top<triggerBottom) heroTitle.classList.add("show");
  cards.forEach(card=>{
    if(card.getBoundingClientRect().top<triggerBottom) card.classList.add("show");
  });
}
window.addEventListener("scroll", revealElements);
window.addEventListener("load", revealElements);

// ================= SMOOTH SCROLL
document.querySelectorAll("a[href^='#']").forEach(anchor=>{
  anchor.addEventListener("click",function(e){
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({behavior:"smooth"});
  });
});
