/* ==========================================
   LOGIN POPUP
========================================== */

const loginButton = document.querySelector(".login-btn");
const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");

loginButton.onclick = () => {
  loginPopup.style.display = "flex";
}

closeLogin.onclick = () => {
  loginPopup.style.display = "none";
}


/* ==========================================
   FAKE LOGIN
========================================== */

const loginSubmit = document.querySelector(".login-submit");
const userBox = document.getElementById("userBox");

loginSubmit.onclick = () => {

  loginPopup.style.display = "none";
  userBox.style.display = "flex";

}


/* ==========================================
   SCROLL ANIMATION (Hero + Cards)
========================================== */

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


/* ==========================================
   SMOOTH SCROLL
========================================== */

document.querySelectorAll("a[href^='#']").forEach(anchor => {

  anchor.addEventListener("click", function(e){

    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });

  });

});
