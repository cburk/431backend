const express = require('express')
const bodyParser = require('body-parser')
const md5 = require('md5')
const randomstring = require("randomstring")

//Sample POST for testing:
//curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"memes"}' http://localhost:3000/register
//curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"memes"}' http://localhost:3000/login -i

let uRecords = {}

const register = (req, res) => {
     console.log('register, Payload received', req.body)
     const password = req.body.password
     const username = req.body.username
	console.log("Username: ", username)
     const salt = randomstring.generate(4)
     const hash = md5(password + salt)
     uRecords[username] = {salt, hash}
     console.log("added user record: ", uRecords)

     res.send('ok\n')
}

const login = (req, res) => {
     console.log("login w/ object: ", req.body)
	const username = req.body.username
	const password = req.body.password
	if(!password || !username){
		res.sendStatus(400)
		return
	}
	const userObj = uRecords[username]
	console.log("Found record for user? ", userObj)
	if(!userObj){
		res.sendStatus(400)
		return
	}
	hashWithSent = md5(password + userObj.salt)
	if(hashWithSent != userObj.hash){
		console.log("Bad hash found, erase for prod")
		res.sendStatus(400)
		return
	}

	//Success, set cookie and respond
	//TODO: Unsure if a good idea (probs not from sec standpoint, but sid is just hash
	res.cookie('cookieName', userObj.hash, {maxAge: 3600*1000})
	res.send({username, result: 'success'})
}

const password = (req, res) => {
     res.send({username: 'Christian Hardcoded', status: 'will not change'})
}

module.exports = app => {
	app.post('/register', register),
	app.post('/login', login)
	app.put('/password', password)
}