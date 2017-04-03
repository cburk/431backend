const express = require('express')
const bodyParser = require('body-parser')

const index = (req, res) => {
     res.send({ hello: 'world' })
}

const app = express()
app.use(bodyParser.json())
app.get('/', index)
require('./profile')(app)
require('./auth')(app)
require('./articles')(app)

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
