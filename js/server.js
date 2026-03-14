const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")

const app = express()

app.use(bodyParser.json())
app.use(express.static(__dirname + "/.."))

function calcRenault(precode){

let x = precode.charCodeAt(1) + precode.charCodeAt(0)*10 - 698
let y = precode.charCodeAt(3) + precode.charCodeAt(2)*10 + x - 528
let z = (y * 7) % 100

if(z < 0) z += 100

let codeNum = Math.floor(z/10) + (z%10)*10 + ((259 % Math.abs(x)) % 100)*100

return codeNum.toString().padStart(4,"0")

}

app.post("/send",(req,res)=>{

const {name,phone,brand,precode} = req.body

if(!name || !phone || !brand || !precode){
return res.status(400).send("Missing data")
}

const code = calcRenault(precode)

const request = {
name,
phone,
brand,
precode,
code,
date: new Date()
}

let data = JSON.parse(fs.readFileSync("database/requests.json"))

data.push(request)

fs.writeFileSync("database/requests.json",JSON.stringify(data,null,2))

const message =
`Demande Code Radio

Nom: ${name}
Téléphone: ${phone}
Voiture: ${brand}
Précode: ${precode}
Code: ${code}

Prix: 10DT`

const whatsapp =
`https://wa.me/21698192103?text=${encodeURIComponent(message)}`

res.json({url:whatsapp})

})

app.listen(3000,()=>console.log("Server running on port 3000"))
