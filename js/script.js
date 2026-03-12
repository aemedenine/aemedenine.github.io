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
