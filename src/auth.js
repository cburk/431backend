const express = require('express')
const bodyParser = require('body-parser')
const md5 = require('md5')
const randomstring = require("randomstring")

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const config = require('./oath_config')
const session = require('express-session')
const jwt = require('jsonwebtoken')
//TODO: Probably not how secret should work, generate randomly each time?
const secret = 'LongSecretIDKWhatThisIs'

if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = 'redis://h:p95b741787cbc4e51ee4dc7e954ace749586ef80db996c801d7557ab814d1fc99@ec2-34-206-56-140.compute-1.amazonaws.com:34789'
}
const redis = require('redis').createClient(process.env.REDIS_URL)

//Sample POST for testing:
//curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"memes"}' http://localhost:3000/register
//curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"memes"}' http://localhost:3000/login -i

//curl -H "Content-Type: application/json" -X POST -d '{"text":"article 1 text"}' http://localhost:3000/add

//curl -H "Content-Type: application/json" -X PUT -d '{"headline":"headline now"}' http://localhost:3000/add

//TODO: Needs to be in final version
//cjb6test	minerals-related-business
// curl -H "Content-Type: application/json" -X POST -d '{"username":"cjb6test","password":"minerals-related-business"}' http://localhost:3000/register

let users = []
passport.serializeUser((user, done) => {
    /*
    console.log("Called ser?  User? ", user)
    console.log("Email alone?: ", user.email)
    console.log("Provider? ", user.provider)
    //Now just getting token instead, idk...
    */
    const session = user.id
    const email = user.emails[0].value
    const username = email
    
    users[session] = username
    //This route: If it's acceptable just to send them a cookie (inclass),
    //let's just do it like we did for normal login.  Would need to change strategy back
    
    // TODO In order to work: If email as username + auth=provider constitutes a new pair in database, add user entries for this person

    
    done(null, session)
})
passport.deserializeUser((id, done) => {
    // I think we should fetch user info from database, done sets req.user
    console.log("Called deser?  id? ", id)
    //TODO: Fetch from users db, not users (or not, since we don't use full obj anyways...)
    const user = users[id]
    console.log("Actual user? ")
    done(null, user)
})
passport.use(new FacebookStrategy(config, (token, refreshToken, profile, done) => {
    console.log("Strategy being used?")
    process.nextTick(() => {
        console.log("In strategy func, profile? ", profile)
        /*
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 1)
        const jsonToken = jwt.sign({
            token: token,
            profile: profile,
            exp: parseInt(expiry.getTime() / 1000)
        }, secret)
        return done(null, jsonToken)
        */
        return done(null, profile)
    })
}))

var UsersInfo = require('./db/db_model.js').UsersInfo
var UsersPasswordInfo = require('./db/db_model.js').UsersPass
var Following = require('./db/db_model.js').Following
var Article = require('./db/db_model.js').Article
const dropAllTables = (req, res) => {
    UsersInfo.remove({}, () => {console.log("Drop call received")})
    UsersPasswordInfo.remove({}, () => {console.log("Drop call received")})
    Following.remove({}, () => {console.log("Drop call received")})
    Article.remove({}, () => {console.log("Drop call received")})
    res.send("Dropped user info tables")
}

const populateWSample = (req, res) => {
    const resStub = {send: () => {}}
    
    //Register 3 users, including cjb6test as required
    register({body: {username: 'cjb6test', avatar: '', password: 'minerals-related-business', dob: Date(), zipcode: 12345, email: 'test@mail.com', headline: 'GEneric test headline'}}, resStub)
    
    register({body: {username: 'cjb6', avatar: '', password: 'someone-task-concerned', dob: Date(), zipcode: 12321, email: 'cjb6@mail.com', headline: 'GEneric cjb headline'}}, resStub)
    
    register({body: {username: 'another-user', avatar: '',  password: 'a-pass-word', dob: Date(), zipcode: 81293, email: 'another@mail.com', headline: 'GEneric other headline'}}, resStub)
    
    //Add 10 articles, w/ 3 comments
    new Article({_id: 1, author: 'cjb6', img: '', date: Date(), text: 'article 1 text', comments: [  ]}).save()
    new Article({_id: 2, author: 'cjb6', img: '', date: Date(), text: 'article 2 text', comments: [  ]}).save()
    new Article({_id: 3, author: 'cjb6test', img: '', date: Date(), text: 'article 3 text', comments: [  ]}).save()
    new Article({_id: 4, author: 'cjb6', img: '', date: Date(), text: 'article 4 text', comments: [ 
        {commentId: 1, author: 'another-user', date: Date(), text: 'comment 1 text'},
        {commentId: 2, author: 'another-user', date: Date(), text: 'comment 2 text'}
    ]}).save()
    
    //Set up follower relationships for cjb6test
    const putFollowing = require('./following').putFollowing
    //Just link these manually
    
    //putFollowing({user: 'cjb6test', params: {user: 'cjb6'}}, resStub)
    //putFollowing({user: 'cjb6test', params: {user: 'another-user'}}, resStub)
    
    res.send("Populated tables w/ sample data")
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
     new Following({username, following: []}).save()
     new UsersPasswordInfo({username, salt, hash, auth: ''}).save()
     new UsersInfo({username, avatar: req.body.avatar, dob: req.body.dob, zipcode: req.body.zipcode, email: req.body.email, headline: 'Default Headline'}).save()
     
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
        //sessionUser[sessId] = username
        //TODO: Decide if we want to store full user object here or not
        redis.hmset(sessId, {username: username})
        res.cookie('sessionId', sessId, {maxAge: 3600*1000, httpOnly: true})
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
    console.log("Did we make it to isloggedin?", req.user)
    console.log("---", req._passport)
    if(req.isAuthenticated()){
        console.log("User authenticated!")
        console.log("In not profile, req.user: ", req.user)
        //const decoded = jwt.verify(req.user, secret)
        //const token = decoded.token
        //const profile = decoded.profile
        console.log("Req.user? ", profile)
        next()
        return
    }
    
    console.log(req.cookies)
    const sessionId = req.cookies['sessionId']
    if(!sessionId){
        console.log("Error: User not logged in")
        res.sendStatus(401)
        return
    }
    //Try to find user based off of sessionId, stored in redis
    //req.user = sessionUser[sessionId]
    redis.hgetall(sessionId, function(err, userObj) {
        console.log("In redis get callback...\n")
        console.log(sessionId + ' is mapped to ' + userObj)

        //If no valid mapping, this isn't a valid sessionid
        if(!userObj){
            console.log("Error: Sessionid invalid")
            res.sendStatus(401)
            return
        }
        //Otherwise, it is, set req.user
        req.user = userObj.username
        console.log("From sessid, mapping, found user: ", req.user)
        return next()
    })
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
    // Remove sessId if exists
    if(req.cookies["sessionId"]){
        //delete sessionUser[req.cookies["sessionId"]]
        redis.del(req.cookies["sessionId"], (err, reply) => {
            console.log("Deleting sessionid from redis mapping gave reply: ", reply)
        })
        res.clearCookie("sessionId")
        res.sendStatus(200)
    }
}

const successMessage = (req, res) => {
    console.log("Got to success")
    res.send({success: 'message'})
}
const failMessage = (req, res) => {
    console.log("Got to fail")
    res.send({fail: 'message'})
}


module.exports = {
    reg: (app) => {
        app.use(session({secret}))
        app.use(passport.initialize())
        app.use(passport.session())
        
        app.post('/register', register),
        app.post('/login', login),
        app.put('/password', isLoggedIn, password),
        app.put('/logout', isLoggedIn, logout),
        app.put('/dropall', dropAllTables),
        app.put('/addSample', populateWSample),
        app.get('/successMessage', isLoggedIn, successMessage)
        app.get('/failMessage', failMessage)
        app.use('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }))
        app.get('/fb/callback', passport.authenticate('facebook', { failureRedirect: '/failMessage', successRedirect: '/successMessage' }))
    },
    isLoggedIn: isLoggedIn
}