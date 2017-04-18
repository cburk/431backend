const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const index = (req, res) => {
     res.send({ hello: 'world' })
}

const app = express()
console.log("On bp")
app.use(bodyParser.json())
console.log("Yep")
app.use(cookieParser())
console.log("No?")
app.get('/', index)
require('./src/profile')(app)
require('./src/auth').reg(app)
require('./src/articles')(app)
require('./src/following')(app)

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
