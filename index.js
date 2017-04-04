const express = require('express')
const bodyParser = require('body-parser')

const index = (req, res) => {
     res.send({ hello: 'world' })
}

const app = express()
app.use(bodyParser.json())
app.get('/', index)
require('./src/profile')(app)
require('./src/auth')(app)
require('./src/articles')(app)
require('./src/following')(app)

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
