// ==========================================
// LOGIN POPUP
// ==========================================

const loginButton = document.querySelector(".login-btn");
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");

loginButton.onclick = () => {
  loginPopup.style.display = "flex";
}

closeLogin.onclick = () => {
  loginPopup.style.display = "none";
}


// ==========================================
// FIREBASE CONFIG & GOOGLE LOGIN
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCtbEWdm7CAC25ROslGlVeLOvfxdi2exVo",
    authDomain: "atelier-electronique-mednine.firebaseapp.com",
    projectId: "atelier-electronique-mednine",
    storageBucket: "atelier-electronique-mednine.firebasestorage.app",
    messagingSenderId: "547430908384",
    appId: "1:547430908384:web:4caa4cf3869491bd14eb85"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const loginSubmit = document.querySelector(".login-submit");
const userBox = document.getElementById("userBox");

// Firebase Google Login
loginSubmit.onclick = () => {

  auth.signInWithPopup(provider)
  .then((result) => {

    const user = result.user;

    document.getElementById("username").innerText = user.displayName;
    document.getElementById("userAvatar").src = user.photoURL;

    loginPopup.style.display = "none";
    userBox.style.display = "flex";

  })
  .catch((error) => {
    console.error("Login error:", error);
  });

}

// Keep user logged in after refresh
auth.onAuthStateChanged((user) => {
  if(user){
    userBox.style.display = "flex";
    document.getElementById("username").innerText = user.displayName;
    document.getElementById("userAvatar").src = user.photoURL;
  }
});

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
.then(() => console.log("🔒 Session persistente activée"))
.catch(error => console.error("Erreur persistence:", error));

/* ==========================================
   USER VISITS & RANK
========================================== */

auth.onAuthStateChanged((user) => {
  if(user){
    userBox.style.display="flex";
    document.getElementById("username").innerText = user.displayName;
    document.getElementById("userAvatar").src = user.photoURL;

    const userRef = firebase.database().ref('users/' + user.uid);

    // Update visits
    userRef.once('value').then(snapshot => {
      let data = snapshot.val();
      if(!data){
        // جديد
        userRef.set({ visits: 1, rank: "Member" });
        document.getElementById("visitCount").innerText = 1;
        document.querySelector(".user-rank").innerText = "⭐ Member";
      } else {
        // زيد الزيارة
        const newVisits = data.visits + 1;
        userRef.update({ visits: newVisits });
        document.getElementById("visitCount").innerText = newVisits;
        document.querySelector(".user-rank").innerText = "⭐ " + data.rank;
      }
    });
  }
});
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    userBox.style.display = "none";
    alert("🔓 Logged out!");
  });
}
/* ==========================================
   AUTO UPDATE RANK BASED ON VISITS
========================================== */

userRef.once('value').then(snapshot => {
  let data = snapshot.val();
  let visits, rank;

  if(!data){
    visits = 1;
    rank = "Member";
    userRef.set({ visits, rank });
  } else {
    visits = data.visits + 1;

    // تحديد الرتبة
    if(visits >= 15){
      rank = "Admin";
    } else if(visits >= 5){
      rank = "Pro";
    } else {
      rank = "Member";
    }

    userRef.update({ visits, rank });
  }

  // تحديث العرض في User Box
  document.getElementById("visitCount").innerText = visits;
  document.querySelector(".user-rank").innerText = "⭐".repeat(rank === "Member" ? 1 : rank === "Pro" ? 2 : 3) + " " + rank;
});
// PROFILE MODAL
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");

userBox.onclick = () => {
  profileModal.style.display = "flex";
  // Fill profile info
  profileModal.querySelector("#profileName").innerText = document.getElementById("username").innerText;
  profileModal.querySelector("#profileAvatar").src = document.getElementById("userAvatar").src;
  profileModal.querySelector("#profileRank").innerText = document.querySelector(".user-rank").innerText;
  profileModal.querySelector("#profileVisits").innerText = document.getElementById("visitCount").innerText;
}

closeProfile.onclick = () => {
  profileModal.style.display = "none";
}
// ONLINE USERS
const onlineRef = firebase.database().ref("onlineUsers");

auth.onAuthStateChanged((user)=>{
  if(user){
    // Add to online users
    onlineRef.child(user.uid).set({
      name: user.displayName,
      avatar: user.photoURL
    });
    // Remove when disconnect
    onlineRef.child(user.uid).onDisconnect().remove();
  }
});
// Display online users
onlineRef.on("value", snapshot=>{
  const container = document.getElementById("onlineUsers");
  container.innerHTML = "";
  snapshot.forEach(child=>{
    const data = child.val();
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.innerHTML = `<img src="${data.avatar}"><span>${data.name}</span>`;
    container.appendChild(div);
  });
});
// COMMENTS SYSTEM
const commentsRef = firebase.database().ref("comments");

const commentInput = document.getElementById("commentInput");
const commentSubmit = document.getElementById("commentSubmit");
const commentsList = document.getElementById("commentsList");

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
  });

  commentInput.value = "";
}

// Display comments
commentsRef.on("value", snapshot=>{
  commentsList.innerHTML = "";
  snapshot.forEach(child=>{
    const data = child.val();
    const div = document.createElement("div");
    div.classList.add("comment-item");
    div.innerHTML = `<img src="${data.avatar}" style="width:25px;border-radius:50%;margin-right:5px;"> <b>${data.user}:</b> ${data.text}`;
    commentsList.appendChild(div);
  });
});
// ==========================================
// SCROLL ANIMATION (Hero + Cards)
// ==========================================

const heroTitle = document.querySelector(".hero h2");
const cards = document.querySelectorAll(".card");

function revealElements(){

  const triggerBottom = window.innerHeight * 0.85;

  // HERO
  const heroTop = heroTitle.getBoundingClientRect().top;
  if(heroTop < triggerBottom){
    heroTitle.classList.add("show");
  }

  // CARDS
  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    if(cardTop < triggerBottom){
      card.classList.add("show");
    }
  });

}

window.addEventListener("scroll", revealElements);
window.addEventListener("load", revealElements);


// ==========================================
// SMOOTH SCROLL
// ==========================================

document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function(e){
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

