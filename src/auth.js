const express = require('express')
const bodyParser = require('body-parser')
const md5 = require('md5')
const randomstring = require("randomstring")

//Sample POST for testing:
//curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"memes"}' http://localhost:3000/register
//curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"memes"}' http://localhost:3000/login -i

//curl -H "Content-Type: application/json" -X POST -d '{"text":"article 1 text"}' http://localhost:3000/add

//curl -H "Content-Type: application/json" -X PUT -d '{"headline":"headline now"}' http://localhost:3000/add

const sessionUser = {}

var UsersInfo = require('./db/db_model.js').UsersInfo
var UsersPasswordInfo = require('./db/db_model.js').UsersPass

const dropUserInfo = (req, res) => {
    UsersInfo.remove({}, () => {console.log("Drop call received")})
    UsersPasswordInfo.remove({}, () => {console.log("Drop call received")})
    res.send("Dropped user info tables")
}

/* TODO: Need to return error if user already exists */
const register = (req, res) => {
     console.log('register, Payload received', req.body)
     const password = req.body.password
     const username = req.body.username
     console.log("Username: ", username)
     const salt = randomstring.generate(4)
     const hash = md5(password + salt)
     
     // TODO: Are there already records for this user?
     //.find({username: loggedInProfile.username}).exec

     //Store user info in db
     new UsersPasswordInfo({username, salt, hash}).save()
     new UsersInfo({username, dob: req.body.dob, zipcode: req.body.zipcode, email: req.body.email, headline: ''}).save()
     
     res.send('ok\n')
}

const verifyUser = (username, password, res) => {
    UsersPasswordInfo.find({username: username}, (error, items) => {
        console.log("Users password query returned: ", items)
        const userObj = items[0]
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

        //Success, set/store cookie and respond
        const sessId = md5(userObj.hash + new Date().getTime())
        sessionUser[sessId] = username
        res.cookie('sessionId', sessId, {maxAge: 3600*1000})
        res.send({username, result: 'success'})
    })
}

const login = (req, res) => {
     console.log("login w/ object: ", req.body)
	const username = req.body.username
	const password = req.body.password
	if(!password || !username){
		res.sendStatus(400)
		return
	}
	//const userObj = uRecords[username]
	verifyUser(username, password, res)
}

const isLoggedIn = (req, res, next) => {
    console.log(req.cookies)
    const sessionId = req.cookies['sessionId']
    if(!sessionId){
        console.log("Error: User not logged in")
        res.sendStatus(401)
        return
    }
    req.user = sessionUser[sessionId]
    if(!req.user){
        console.log("Error: Sessionid invalid")
        res.sendStatus(401)
        return
    }
    console.log("From sessid, mapping, found user: ", req.user)
    return next()
}

const password = (req, res) => {
    if(!req.body.password){
        console.log("Bad password reqest, no password included")
        res.sendStatus(400)
        return
    }
    const salt = randomstring.generate(4)
    const hash = md5(req.body.password + salt)
    
    //Update the change in the db
    UsersPasswordInfo.findOneAndUpdate({username: req.user}, {salt: salt, hash: hash}).exec(() => {
        
    })
    
    res.send({username: req.user, status: 'updated'})
}

const logout = (req, res) => {
    // Remove cookie
    res.clearCookie("sessionId")
    res.sendStatus(200)
}

module.exports = {
    reg: (app) => {
        app.post('/register', register),
        app.post('/login', login),
        app.put('/password', isLoggedIn, password),
        app.put('/logout', isLoggedIn, logout),
        app.put('/dropusers', dropUserInfo)
    },
    isLoggedIn: isLoggedIn
}