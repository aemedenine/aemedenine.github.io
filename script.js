// =======================
// Firebase config
// =======================
const firebaseConfig = {
apiKey: "AIzaSyCtbEWdm7CAC25ROslGlVeLOvfxdi2exVo",
authDomain: "atelier-electronique-mednine.firebaseapp.com",
projectId: "atelier-electronique-mednine",
storageBucket: "atelier-electronique-mednine.firebasestorage.app",
messagingSenderId: "547430908384",
appId: "1:547430908384:web:4caa4cf3869491bd14eb85",
databaseURL: "https://atelier-electronique-mednine-default-rtdb.europe-west1.firebasedatabase.app"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const provider = new firebase.auth.GoogleAuthProvider();


// =======================
// LOGIN
// =======================
document.addEventListener("click", function(e){

if(e.target && e.target.id === "googleLogin"){

auth.signInWithPopup(provider)
.then(()=>{
console.log("login success");
})
.catch((error)=>{
console.log(error);
});

}

});


// =======================
// USER DETECTION
// =======================
auth.onAuthStateChanged((user)=>{

const authArea = document.getElementById("authArea");

if(!authArea) return;

if(user){

authArea.innerHTML = `

<div class="user-box">

<img class="user-photo" src="${user.photoURL}">

<span>${user.displayName}</span>

<button class="logout-btn" id="logoutBtn">Logout</button>

</div>

`;

document.getElementById("logoutBtn").onclick = () => {
auth.signOut();
};

}else{

authArea.innerHTML = `

<a class="btn login" id="googleLogin">Se connecter</a>

<a href="https://wa.me/21698192103" class="btn download">
WhatsApp
</a>

`;

}

});


// =======================
// SMOOTH SCROLL
// =======================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

anchor.addEventListener("click", function(e){

const target = document.querySelector(this.getAttribute("href"));

if(target){
e.preventDefault();
target.scrollIntoView({
behavior:"smooth"
});
}

});

});


// =======================
// FAQ TOGGLE
// =======================
document.addEventListener("DOMContentLoaded", function () {

document.querySelectorAll(".faq-item").forEach(item => {

item.addEventListener("click", () => {

document.querySelectorAll(".faq-item").forEach(i=>{
if(i !== item){
i.classList.remove("active");
}
});

item.classList.toggle("active");

});

});

});
// Carousel pour photos/vidéos
const track = document.getElementById('carouselTrack');
const cards = document.querySelectorAll('.gallery-card');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let currentIndex = 0;

function updateCarousel() {
  const cardWidth = cards[0].offsetWidth + 30; // + gap
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

nextBtn.addEventListener('click', () => {
  if (currentIndex < cards.length - 2) { // -2 car 2 visibles
    currentIndex++;
    updateCarousel();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
});

// Recalculer au resize
window.addEventListener('resize', updateCarousel);
