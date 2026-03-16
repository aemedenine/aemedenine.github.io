// ==========================================
// LOGIN POPUP
// ==========================================
const loginButton = document.querySelector(".login-btn");
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");

loginButton.onclick = () => loginPopup.style.display = "flex";
closeLogin.onclick = () => loginPopup.style.display = "none";

// ==========================================
// FIREBASE CONFIG & GOOGLE LOGIN
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
const provider = new firebase.auth.GoogleAuthProvider();

const userBox = document.getElementById("userBox");
const logoutBtn = document.getElementById("logoutBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");

const commentInput = document.getElementById("commentInput");
const commentSubmit = document.getElementById("commentSubmit");
const commentsList = document.getElementById("commentsList");

const onlineRef = firebase.database().ref("onlineUsers");
const commentsRef = firebase.database().ref("comments");

// ================= LOGIN GOOGLE
document.querySelector(".login-submit").onclick = () => {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      showUserBox(user);
      loginPopup.style.display = "none";
      updateUserVisits(user);
      updateOnlineUsers(user);
    })
    .catch(error => console.error(error));
};

// ================= KEEP LOGIN
auth.onAuthStateChanged(user=>{
  if(user){
    showUserBox(user);
    updateUserVisits(user);
    updateOnlineUsers(user);
  }
});

// ================= FUNCTIONS
function showUserBox(user){
  userBox.style.display = "flex";
  document.getElementById("username").innerText = user.displayName;
  document.getElementById("userAvatar").src = user.photoURL;
}

function updateUserVisits(user){
  const userRef = firebase.database().ref("users/" + user.uid);
  userRef.once('value').then(snapshot=>{
    let data = snapshot.val();
    let visits = data ? data.visits + 1 : 1;
    let rank = "Member";

    // Rank logic
    if(visits >= 15) rank = "Admin";
    else if(visits >= 5) rank = "Pro";

    userRef.set({visits, rank});
    document.getElementById("visitCount").innerText = visits;
    document.querySelector(".user-rank").innerText = "⭐".repeat(rank==="Member"?1:rank==="Pro"?2:3)+" "+rank;
  });
}

function updateOnlineUsers(user){
  onlineRef.child(user.uid).set({name:user.displayName, avatar:user.photoURL});
  onlineRef.child(user.uid).onDisconnect().remove();
}

// ================= LOGOUT
logoutBtn.onclick = e=>{
  e.stopPropagation();
  auth.signOut().then(()=>{
    userBox.style.display="none";
    alert("🔓 Logged out!");
  });
};

// ================= PROFILE MODAL
userBox.onclick = ()=>{
  profileModal.style.display = "flex";
  profileModal.querySelector("#profileName").innerText = document.getElementById("username").innerText;
  profileModal.querySelector("#profileAvatar").src = document.getElementById("userAvatar").src;
  profileModal.querySelector("#profileRank").innerText = document.querySelector(".user-rank").innerText;
  profileModal.querySelector("#profileVisits").innerText = document.getElementById("visitCount").innerText;
};
closeProfile.onclick = ()=>profileModal.style.display = "none";

// ================= COMMENTS + RATING + VIEWS =================

// 1. Views Counter (zid 1 view marra wa7da lel user)
function incrementViews() {
  const viewsRef = db.ref("views");
  viewsRef.transaction(currentViews => {
    return (currentViews || 0) + 1;
  });
}

// Listen views count realtime
db.ref("views").on("value", snap => {
  document.getElementById("viewsCount").textContent = snap.val() || 0;
});

// Appel l'increment lamma page t7mel (w zid check ida deja vu ida t7ebb – simple hné)
incrementViews();

// 2. Rating (5 stars)
const ratingStars = document.getElementById("ratingStars");
let userRating = 0;

ratingStars.innerHTML = "★★★★★".split("").map((star, i) => 
  `<span data-value="${5-i}" style="cursor:pointer; color:#94a3b8;">${star}</span>`
).join("");

ratingStars.addEventListener("click", e => {
  if (!currentUser) return alert("Login awla bach ta9yim!");
  if (e.target.tagName === "SPAN") {
    userRating = parseInt(e.target.dataset.value);
    saveRating(userRating);
  }
});

function saveRating(rating) {
  const ratingRef = db.ref(`ratings/${currentUser.uid}`);
  ratingRef.set(rating).then(() => {
    updateAverageRating();
  });
}

function updateAverageRating() {
  db.ref("ratings").once("value", snap => {
    const ratings = snap.val() || {};
    const values = Object.values(ratings);
    const avg = values.length ? (values.reduce((a,b)=>a+b,0) / values.length).toFixed(1) : 0;
    document.getElementById("avgRating").textContent = avg;
    document.getElementById("ratingCount").textContent = values.length;

    // Highlight stars selon moyenne
    const stars = ratingStars.querySelectorAll("span");
    stars.forEach((s, i) => {
      s.style.color = (5 - i) <= Math.round(avg) ? "#fbbf24" : "#94a3b8";
    });
  });
}

// 3. Comments
const commentsList = document.getElementById("commentsList");
const commentInput = document.getElementById("commentInput");
const commentSubmit = document.getElementById("commentSubmit");

commentSubmit.addEventListener("click", postComment);
commentInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    postComment();
  }
});

function postComment() {
  if (!currentUser) return alert("Login awla bach tcommenti!");
  const text = commentInput.value.trim();
  if (!text) return;

  db.ref("comments").push({
    text,
    uid: currentUser.uid,
    name: currentUser.displayName || "Anonyme",
    time: Date.now()
  }).then(() => {
    commentInput.value = "";
  }).catch(err => alert("Erreur: " + err.message));
}

// Listen comments realtime
db.ref("comments").orderByChild("time").on("child_added", snap => {
  const comment = snap.val();
  const div = document.createElement("div");
  div.style.padding = "12px";
  div.style.background = "rgba(30,41,59,0.5)";
  div.style.borderRadius = "12px";
  div.style.marginBottom = "10px";
  div.innerHTML = `
    <strong style="color:#38bdf8;">${comment.name}</strong>
    <small style="color:#94a3b8; margin-left:8px;">${new Date(comment.time).toLocaleString()}</small>
    <p style="margin-top:6px;">${comment.text}</p>
  `;
  commentsList.appendChild(div);
  commentsList.scrollTop = commentsList.scrollHeight;
});

// Init rating au chargement
updateAverageRating();

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
