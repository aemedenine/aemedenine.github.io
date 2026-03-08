// Firebase config
const firebaseConfig = {
apiKey: "AIzaSyCtbEWdm7CAC25ROslGlVeLOvfxdi2exVo",
authDomain: "atelier-electronique-mednine.firebaseapp.com",
projectId: "atelier-electronique-mednine",
storageBucket: "atelier-electronique-mednine.firebasestorage.app",
messagingSenderId: "547430908384",
appId: "1:547430908384:web:4caa4cf3869491bd14eb85",
databaseURL: "https://atelier-electronique-mednine-default-rtdb.europe-west1.firebasedatabase.app"
};

// Init
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// session persist
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Google provider
const provider = new firebase.auth.GoogleAuthProvider();


// login
document.getElementById("googleLogin").addEventListener("click", () => {

auth.signInWithPopup(provider)

.then((result)=>{

console.log("login success");

})

.catch((error)=>{

console.log(error);

});

});


// detect user
auth.onAuthStateChanged((user)=>{

const authArea = document.getElementById("authArea");

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

document.getElementById("googleLogin").onclick = () => {

auth.signInWithPopup(provider);

};

}

});


// smooth scroll
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
// FAQ toggle
document.querySelectorAll(".faq-item").forEach(item => {
  item.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});
