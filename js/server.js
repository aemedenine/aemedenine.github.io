const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'..'))) // Serve site

app.post('/send', (req,res)=>{
  const { name, phone, brand, precode, code } = req.body
  if(!name || !phone || !brand || !precode || !code){
    return res.status(400).send('Informations manquantes!')
  }

  const message = `Demande Code Radio\n\nNom: ${name}\nTéléphone: ${phone}\nVoiture: ${brand}\nPrécode: ${precode}\nCode: ${code}\nPrix: 10DT`
  const whatsappUrl = `https://wa.me/21698192103?text=${encodeURIComponent(message)}`

  console.log('Client:', name, phone, brand, precode, code)
  console.log('WhatsApp URL:', whatsappUrl)

  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${whatsappUrl}" />
      </head>
      <body>
        <p>Redirection vers WhatsApp...</p>
        <a href="${whatsappUrl}">Clique ici si ça ne marche pas</a>
      </body>
    </html>
  `)
})

app.listen(3000, ()=>console.log('Server running on http://localhost:3000'))
