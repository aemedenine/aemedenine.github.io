/* ==========================================
   LOGIN POPUP
========================================== */

const loginBtn = document.querySelector(".login-btn");

loginBtn.addEventListener("click", () => {

alert("Login system coming soon 😎");

});


/* ==========================================
   SCROLL ANIMATION
========================================== */

const cards = document.querySelectorAll(".card");

window.addEventListener("scroll", () => {

let triggerBottom = window.innerHeight * 0.85;

cards.forEach(card => {

let cardTop = card.getBoundingClientRect().top;

if(cardTop < triggerBottom){

card.style.opacity = "1";
card.style.transform = "translateY(0)";

}else{

card.style.opacity = "0";
card.style.transform = "translateY(40px)";

}

});

});


/* ==========================================
   SMOOTH SCROLL
========================================== */

document.querySelectorAll("a[href^='#']").forEach(anchor => {

anchor.addEventListener("click", function(e){

e.preventDefault();

document.querySelector(this.getAttribute("href"))
.scrollIntoView({

behavior: "smooth"

});

});

});

/* ================= LOGIN POPUP ================= */

const loginButton = document.querySelector(".login-btn");
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");

loginButton.onclick = () => {

loginPopup.style.display = "flex";

}

closeLogin.onclick = () => {

loginPopup.style.display = "none";

}


/* ================= FAKE LOGIN ================= */

const loginSubmit = document.querySelector(".login-submit");
const userBox = document.getElementById("userBox");

loginSubmit.onclick = () => {

loginPopup.style.display = "none";

userBox.style.display = "flex";

}
/* ================= PARTICLES ================= */

particlesJS("particles-js", {
  particles: {
    number: {
      value: 80
    },
    color: {
      value: "#38bdf8"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.5
    },
    size: {
      value: 3
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#38bdf8",
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 2
    }
  },
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      }
    }
  }
});
/* ==========================================
   HERO TEXT ANIMATION
========================================== */

const heroTitle = document.querySelector(".hero h2");

setTimeout(()=>{

heroTitle.style.opacity="1";
heroTitle.style.transform="translateY(0)";

},300);
