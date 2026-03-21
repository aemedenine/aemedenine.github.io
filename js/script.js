// ==========================================================
//  2026 FULL JS - Atelier Électronique Médenine (FIXED)
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
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");
const loginButton   = document.querySelector(".login-btn");
const userBox       = document.getElementById("userBox");
const logoutBtn     = document.getElementById("logoutBtn");
const profileModal  = document.getElementById("profileModal");
const closeProfile  = document.getElementById("closeProfile");

const stars         = document.querySelectorAll('.stars-horizontal span');
const ratingMessage = document.getElementById('rating-message');

let currentUser = null;
let currentUserRating = 0;

// ================= FIX (خارج event) =================
function createUserIfNotExists(user) {
  const ref = usersRef.child(user.uid);

  ref.once("value").then(snap => {
    if (!snap.exists()) {
      ref.set({
        nick: user.displayName || "User",
        niveau: "Member",
        createdAt: Date.now(),
        visits: 0,
        rank: "Member"
      });
    }
  });
}

// ================= INIT =================
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

// Open profile modal
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

// Close profile
closeProfile?.addEventListener("click", () => {
  profileModal.style.display = "none";
});

// Close login popup
closeLogin?.addEventListener("click", () => {
  loginPopup.style.display = "none";
});

});

// ================= AUTH =================
auth.onAuthStateChanged(user => {
  currentUser = user;

  if (user) {
    showUserInterface(user);
    createUserIfNotExists(user); // ✅ FIX
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
  if (userBox) userBox.style.display = "none";
  if (loginButton) loginButton.style.display = "inline-block";
}

// ================= FIX VISITS =================
function updateUserVisits(user) {
  const userRef = usersRef.child(user.uid);

  userRef.transaction(current => {

    if (!current) {
      return {
        nick: user.displayName || "User",
        niveau: "Member",
        createdAt: Date.now(),
        visits: 1,
        rank: "Member"
      };
    }

    current.visits = (current.visits || 0) + 1;

    if (current.visits >= 50) current.rank = "VIP";
    else if (current.visits >= 20) current.rank = "Pro";
    else if (current.visits >= 5) current.rank = "Active";
    else current.rank = "Member";

    return current;

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

// ================= REST (بدون تغيير) =================
function updateOnlineUsers(user) {
  const userOnlineRef = onlineRef.child(user.uid);
  userOnlineRef.set({
    avatar: user.photoURL || "",
    name: user.displayName || "Anonyme",
    lastActive: firebase.database.ServerValue.TIMESTAMP
  });
  userOnlineRef.onDisconnect().remove();
}
