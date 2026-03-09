const firebaseConfig = {
apiKey: "YOUR_KEY",
authDomain: "YOUR_DOMAIN",
projectId: "YOUR_PROJECT",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();


// تسجيل عادي
document.getElementById("registerForm").addEventListener("submit", function(e){

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

auth.createUserWithEmailAndPassword(email,password)
.then(()=>{
alert("Compte créé avec succès !");
window.location.href="index.html";
})
.catch((error)=>{
alert(error.message);
});

});


// تسجيل Google
document.getElementById("googleRegister").onclick = function(){

const provider = new firebase.auth.GoogleAuthProvider();

auth.signInWithPopup(provider)
.then(()=>{
window.location.href="index.html";
});

};
