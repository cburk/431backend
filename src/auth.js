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
const mainUrl = 'http://localhost:8080'

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
var UsersInfo = require('./db/db_model.js').UsersInfo
var UsersPasswordInfo = require('./db/db_model.js').UsersPass
var Following = require('./db/db_model.js').Following
var Article = require('./db/db_model.js').Article

passport.serializeUser((user, done) => {
    const session = user.id
    const email = user.emails[0].value
    const username = email
    //users[session] = username
    redis.hmset(session, {username: username, sessionId: session})
    redis.hmset(username, {sessionId: session})
    console.log("Session in serialize: ", session)
    
    UsersPasswordInfo.find({username: username}, (error, items) => {
        console.log("Is fb/dob in here somewhere?", user)
        if(items.length==0){
            console.log("New oauth sign in")
            // In order to work: If email as username + auth=provider constitutes a new pair in database, add user entries for this person
            new UsersPasswordInfo({username, salt: null, hash: null, auth: 'facebook'}).save()
            new Following({username, following: []}).save()
            new UsersInfo({username, avatar: null, dob: null, zipcode: null, email: username, headline: 'Default Headline'}).save()
        }
        done(null, session)
    })
})
passport.deserializeUser((id, done) => {
    console.log("Called deser?  id? ", id)
    redis.hgetall(id, function(err, userObj) {
        done(null, userObj.username)
    })
})

passport.use(new FacebookStrategy(config, (token, refreshToken, profile, done) => {
    console.log("Strategy being used?")
    process.nextTick(() => {
        return done(null, profile)
    })
}))

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
    register({body: {username: 'cjb6test', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg', password: 'minerals-related-business', dob: Date(), zipcode: 12345, email: 'test@mail.com', headline: 'GEneric test headline'}}, resStub)
    
    register({body: {username: 'cjb6', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg', password: 'someone-task-concerned', dob: Date(), zipcode: 12321, email: 'cjb6@mail.com', headline: 'GEneric cjb headline'}}, resStub)
    
    register({body: {username: 'another-user', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg',  password: 'a-pass-word', dob: Date(), zipcode: 81293, email: 'another@mail.com', headline: 'GEneric other headline'}}, resStub)
    
    //Add 10 articles, w/ 3 comments
    new Article({_id: 1, author: 'cjb6', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg', date: Date(), text: 'article 1 text', comments: [  ]}).save()
    new Article({_id: 2, author: 'cjb6', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg', date: Date(), text: 'article 2 text', comments: [  ]}).save()
    new Article({_id: 3, author: 'cjb6test', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg', date: Date(), text: 'article 3 text', comments: [  ]}).save()
    new Article({_id: 4, author: 'cjb6', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg', date: Date(), text: 'article 4 text', comments: [ 
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
        //console.log("Req.user? ", profile)
        return next()
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
    console.log("Tried logging out")
    // Remove sessId if exists
    if(req.cookies["sessionId"]){
        //delete sessionUser[req.cookies["sessionId"]]
        redis.del(req.cookies["sessionId"], (err, reply) => {
            console.log("Deleting sessionid from redis mapping gave reply: ", reply)
        })
        //Also delete the mapping from uid=>session, only exists for oauth people
        redis.del(req.user, (err, reply) => {
            console.log("Deleting sessionid from redis mapping gave reply: ", reply)
        })
        res.clearCookie("sessionId")
        res.sendStatus(200)
    }else{
        console.log("Oauth logout")
        console.log(req.session)
        req.session.destroy(() => {
            res.sendStatus(200)
        })
        //res.redirect(mainUrl)
    }
}

const successMessage = (req, res) => {
    console.log("\n\nGot to success, session id?\n\n", req.user)
    console.log("Success still, what's req.session?", req.session)
    console.log(req.session.passport)
    console.log(req.passport)
    redis.hgetall(req.user, function(err, userObj) {
        console.log("Setting cookie for new oath user: ", req.user, " as: ", userObj.sessionId)
        
        //res.cookie('sessionId', userObj.sessionId, {maxAge: 3600*1000, httpOnly: true})
        //res.send(req.user)
        //res.send(req.session)
        res.redirect(mainUrl)
    })
    //Set req.user to 
}
const failMessage = (req, res) => {
    console.log("Got to fail")
    res.send({fail: 'message'})
}


module.exports = {
    reg: (app) => {        
        app.post('/register', register),
        app.post('/login', login),
        app.put('/password', isLoggedIn, password),
        app.put('/logout', isLoggedIn, logout),
        app.put('/dropall', dropAllTables),
        app.put('/addSample', populateWSample),
        app.get('/successMessage', successMessage)
        app.get('/failMessage', failMessage)
        app.use('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }))
        app.get('/fb/callback', passport.authenticate('facebook', { failureRedirect: '/failMessage', successRedirect: '/successMessage' }))
    },
    isLoggedIn: isLoggedIn,
    mainUrl: mainUrl
}