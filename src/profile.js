const loggedInProfile = {
	username: 'Christian-Hardcoded',
	headline: 'Logged in headline',
	email: 'logged@in.com',
	zipcode: 12345,
	dob: 687610808426.5197,
	avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
}


//Test register json, no dob
//{"username": "new-user", "password": "pwd", "zipcode": 12312, "email": "e@mai.l"}


//curl -H "Content-Type: application/json" -X PUT -d '{"headline":"headline now"}' http://localhost:3000/headline
//curl -H "Content-Type: application/json" -X POST -d '{"username": "Christian-Hardcoded", "password": "p1", "email": "asdf@asd.f", "zipcode": 12345, "dob": "Mon Apr 17 2017 21:40:37 GMT-0500 (CDT)"}' http://localhost:3000/register
//curl -H "Content-Type: application/json" http://localhost:3000/headlines
var mongoose = require('mongoose')
var UsersInfo = require('./db/db_model.js').UsersInfo
const headlines = (req, res) => {
	// Correct behavior: W/ no arguments, return headline of logged in user, otherwise return for all users mentioned
	// If no users specified, just return headlines for logged in
	const users = req.params.user ? req.params.user.split(',') : [req.user]
    if(users[users.length - 1]==''){
        users.pop()
    }
    
    UsersInfo.find({
    }).exec((err, items) => {
        console.log("Hopefully all user records: ", items)
    })
    
    UsersInfo.find({
        username: { $in: users }
    }).exec((err, items) => {
        res.send({headlines: items.map((userInfo) => {return {username: userInfo.username, headline: userInfo.headline}})})
    })
	
    //Current correct behavior: If user not logged in user, return a generic response
    //Otherwise, return current user's headline
    /*
    const userHeadlines = users.map((usr) => {return usr==loggedInProfile.username ? {username: usr, headline: loggedInProfile.headline}
    : {username: usr, headline: 'Generic Headline'}})

	console.log(userHeadlines)
	res.send({headlines: userHeadlines})
    */
}
const headline = (req, res) => {
	// Update local profile
    //loggedInProfile.headline = req.body.headline

	// Update headlines list
    let newHeadline = req.body
	newHeadline.username = req.user
    console.log('trying to update w/ value: ', newHeadline.headline)
    UsersInfo.findOneAndUpdate({username: newHeadline.username}, {headline: newHeadline.headline}, (err, items) => {
        //TODO: Maybe some error checking?  items isn't useful, just gives us matching pre-update userinfo
        //console.log("Update correctly? ", items)
    })

	res.send(newHeadline)
}

/* Given a parameter to search for, returns a function for mongoose find that sends res that required user info (parameter) */
const getParameterizedReturnFunction = (res, parameter) => (err, uiList) => {
        if(uiList.length == 0){
            res.send('Error: user info not found')
            return
        }
        const thisUserInfo = uiList[0]
        console.log("Found items: ", uiList)
        console.log(parameter)
        res.send({username: thisUserInfo.username, [parameter]: thisUserInfo[parameter]})
    }

const getEmail = (req, res) => {
	//If not mentioned, return email for logged in user
	if(req.params.user==undefined){
        UsersInfo.find({username: req.user}).exec(getParameterizedReturnFunction(res, 'email'))            
    }else{
        UsersInfo.find({username: req.params.user}).exec(getParameterizedReturnFunction(res, 'email'))
    }
}

const putEmail = (req, res) => {
	let newEmail = req.body
	newEmail.username = req.user
    UsersInfo.findOneAndUpdate({username: newEmail.username}, {email: newEmail.email}, (err, items) => {
    })
    
    res.send(newEmail)
}

const getZip = (req, res) => {
    UsersInfo.find({username: req.params.user ? req.params.user : req.user}).exec(getParameterizedReturnFunction(res, 'zipcode'))    
}

const putZip = (req, res) => {
    let newZip = req.body
    newZip.username = req.user
    UsersInfo.findOneAndUpdate({username: newZip.username}, {zipcode: newZip.zipcode}, (err, items) => {
    })
    res.send(newZip)
}

const avatarsF = (req, res) => {
	const users = req.params.user ? req.params.user.split(',') : [req.user]
    console.log("Users before: ", users)
	if(users[users.length - 1]==''){
        users.pop()
    }
    console.log("Users after: ", users)
    
    //Current correct behavior: If user not logged in user, return a generic response
    //Otherwise, return current user's headline
    const usersAvatars = users.map((usr) => {return usr==req.user ? {username: usr, avatar: 'Generic Avatar'} 
    : {username: usr, avatar: 'Generic Avatar'}})

	//console.log(usersAvatars)
	//res.send({avatars: usersAvatars})
    //TODO: Fix later, for now, just returns this stub:
    res.send({avatars: users.map((usr) => {return {username: usr, avatar: ''}})})
}

const avatarF = (req, res) => {
    const users = req.params.user ? req.params.user.split(',') : [req.user]
	if(users[users.length - 1]==''){
        users.pop()
    }
    
    UsersInfo.find({
        username: { $in: users }
    }).exec((err, items) => {
        res.send({headlines: items.map((userInfo) => {return {username: userInfo.username, headline: userInfo.headline}})})
    })    
    
    let newAvatar = req.body
    newAvatar.username = req.user
    
    //TODO: Actually do this later
    //loggedInProfile.avatar = newAvatar.avatar
    res.send(newAvatar)
}

const dob = (req, res) => {
    UsersInfo.find({username: req.user}).exec(getParameterizedReturnFunction(res, 'dob'))
}

const isLoggedIn = require('./auth').isLoggedIn
module.exports = (app) => {
	app.get('/headlines/:user?', isLoggedIn, headlines),
	app.put('/headline', isLoggedIn, headline),
	app.put('/email', isLoggedIn, putEmail),
	app.get('/email/:user?', isLoggedIn, getEmail),
	app.get('/zipcode/:user?', isLoggedIn, getZip),
	app.put('/zipcode', isLoggedIn, putZip),
	app.get('/avatars/:user?', isLoggedIn, avatarsF),
	app.put('/avatar', isLoggedIn, avatarF),
	app.get('/dob', isLoggedIn, dob)
}
