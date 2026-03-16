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

// ================= COMMENTS
commentSubmit.onclick = () => {
  const text = commentInput.value.trim();
  if(!text) return;
  const user = auth.currentUser;
  if(!user) return alert("Login first!");

  commentsRef.push({
    user: user.displayName,
    avatar: user.photoURL,
    text: text,
    timestamp: Date.now()
  }, ()=> commentInput.value = "");
}

// Display comments
commentsRef.on("value", snapshot=>{
  commentsList.innerHTML="";
  snapshot.forEach(child=>{
    const data = child.val();
    const div = document.createElement("div");
    div.classList.add("comment-item");
    div.innerHTML = `<img src="${data.avatar}" style="width:25px;border-radius:50%;margin-right:5px;"> <b>${data.user}:</b> ${data.text}`;
    commentsList.appendChild(div);
  });
});

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
