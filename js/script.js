// ================= FIREBASE CONFIG =================
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

// ================= ELEMENTS =================
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");
const loginSubmit = document.querySelector(".login-submit");
const userBox = document.getElementById("userBox");
const logoutBtn = document.getElementById("logoutBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const onlineUsersList = document.getElementById("onlineUsersList");
const onlineCount = document.getElementById("onlineCount");

// ================= DATABASE REFS =================
const usersRef = db.ref("users");
const onlineRef = db.ref("onlineUsers");

let currentUser = null;

// ================= LOGIN POPUP =================
document.querySelector(".login-btn")?.addEventListener("click", () => {
  loginPopup.style.display = "flex";
});
closeLogin?.addEventListener("click", () => {
  loginPopup.style.display = "none";
});

// ================= GOOGLE LOGIN =================
loginSubmit?.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      currentUser = user;
      showUserBox(user);
      loginPopup.style.display = "none";
      updateUserVisits(user);
      updateOnlineUsers(user);
      listenOnlineUsers();
    })
    .catch(err => alert("Erreur: " + err.message));
});

// ================= KEEP LOGIN =================
auth.onAuthStateChanged(user => {
  if(user){
    currentUser = user;
    showUserBox(user);
    updateUserVisits(user);
    updateOnlineUsers(user);
    listenOnlineUsers();
  } else {
    currentUser = null;
    userBox.style.display = "none";
  }
});

// ================= FUNCTIONS =================
function showUserBox(user){
  if(!userBox) return;
  userBox.style.display = "flex";
  document.getElementById("username").innerText = user.displayName || "Anonyme";
  document.getElementById("userAvatar").src = user.photoURL || "https://via.placeholder.com/40";
}

function updateUserVisits(user){
  if(!user?.uid) return;
  usersRef.child(user.uid).transaction(current => {
    const data = current || {visits:0, rank:"Member"};
    data.visits++;
    if(data.visits >= 50) data.rank="VIP";
    else if(data.visits >= 20) data.rank="Pro";
    else if(data.visits >= 5) data.rank="Active";
    return data;
  }, (err, committed, snapshot) => {
    if(committed && snapshot){
      const data = snapshot.val();
      document.getElementById("visitCount").innerText = data.visits;
      const rankEl = document.querySelector(".user-rank");
      if(rankEl){
        const stars = "⭐".repeat(data.rank==="Member"?1:data.rank==="Active"?2:data.rank==="Pro"?3:5);
        rankEl.innerText = stars + " " + data.rank;
      }
    }
  });
}

function updateOnlineUsers(user){
  if(!user?.uid) return;
  const ref = onlineRef.child(user.uid);
  ref.set({name:user.displayName, avatar:user.photoURL, lastActive:firebase.database.ServerValue.TIMESTAMP});
  ref.onDisconnect().remove();
}

function listenOnlineUsers(){
  onlineRef.on("value", snap => {
    onlineUsersList.innerHTML="";
    let count=0;
    snap.forEach(child=>{
      const data = child.val();
      if(data){
        count++;
        const li = document.createElement("li");
        li.innerHTML=`<img src="${data.avatar}" width="24" height="24" style="border-radius:50%; margin-right:8px;"> ${data.name}`;
        onlineUsersList.appendChild(li);
      }
    });
    onlineCount.innerText = count;
  });
}

// ================= LOGOUT =================
logoutBtn?.addEventListener("click", e=>{
  e.stopPropagation();
  auth.signOut().then(()=> userBox.style.display="none");
});

// ================= PROFILE MODAL =================
userBox?.addEventListener("click", () => {
  profileModal.style.display = "flex";
  document.getElementById("profileName").innerText = document.getElementById("username").innerText;
  document.getElementById("profileAvatar").src = document.getElementById("userAvatar").src;
  document.getElementById("profileRank").innerText = document.querySelector(".user-rank").innerText;
  document.getElementById("profileVisits").innerText = document.getElementById("visitCount").innerText;
});

closeProfile?.addEventListener("click", () => {
  profileModal.style.display = "none";
});
// ================= RATE / STARS =================
const stars = document.querySelectorAll('.stars-horizontal span');
const ratingMessage = document.getElementById('rating-message');
let currentUser = null;
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
