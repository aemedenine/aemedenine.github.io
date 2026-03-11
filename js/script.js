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


/* ==========================================
   HERO TEXT ANIMATION
========================================== */

const heroTitle = document.querySelector(".hero h2");

setTimeout(()=>{

heroTitle.style.opacity="1";
heroTitle.style.transform="translateY(0)";

},300);
