const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("../"))

function calcCode(precode){

precode = precode.toUpperCase()

let x = precode.charCodeAt(1) + precode.charCodeAt(0)*10 - 698
let y = precode.charCodeAt(3) + precode.charCodeAt(2)*10 + x - 528
let z = (y*7)%100

if(z<0) z+=100

let codeNum =
Math.floor(z/10) +
(z%10)*10 +
((259 % Math.abs(x))%100)*100

return codeNum.toString().padStart(4,'0')

}

app.post("/send",(req,res)=>{

const name=req.body.name
const phone=req.body.phone
const brand=req.body.brand
const precode=req.body.precode

const code=calcCode(precode)

const message=
`Demande Code Radio

Nom: ${name}
Téléphone: ${phone}
Voiture: ${brand}
Précode: ${precode}
Code: ${code}

Prix: 10DT`

const url=
`https://wa.me/21698192103?text=${encodeURIComponent(message)}`

res.redirect(url)

})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})
