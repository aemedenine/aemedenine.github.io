const express = require("express")
const fs = require("fs")

const app = express()

app.use(express.json())

// calculate code
function calculate(precode){

let x = precode.charCodeAt(1) + precode.charCodeAt(0)*10 - 698
let y = precode.charCodeAt(3) + precode.charCodeAt(2)*10 + x - 528
let z = (y*7)%100
if(z<0) z+=100

let codeNum = Math.floor(z/10) + (z%10)*10 + ((259 % Math.abs(x))%100)*100

return codeNum.toString().padStart(4,'0')

}

// create order
app.post("/create-order",(req,res)=>{

const precode = req.body.precode

const code = calculate(precode)

const order = {
id:Date.now(),
precode:precode,
code:code,
paid:false
}

const db = JSON.parse(fs.readFileSync("../database/codes.json"))

db.orders.push(order)

fs.writeFileSync("../database/codes.json",JSON.stringify(db,null,2))

res.json({
payment:"https://paymee.tn/pay/XXXX",
orderId:order.id
})

})

// check payment
app.get("/get-code/:id",(req,res)=>{

const db = JSON.parse(fs.readFileSync("../database/codes.json"))

const order = db.orders.find(o=>o.id==req.params.id)

if(!order) return res.json({error:"not found"})

if(!order.paid) return res.json({error:"not paid"})

res.json({code:order.code})

})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})
