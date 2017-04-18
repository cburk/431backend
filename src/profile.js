const loggedInProfile = {
	username: 'Christian-Hardcoded',
	headline: 'Logged in headline',
	email: 'logged@in.com',
	zipcode: 12345,
	dob: 687610808426.5197,
	avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
}

//let hLines = {headlines: [{username: 'uname', headline: 'headline'}, {username: 'p2', headline: 'stuff'}, {username: 'Christian Hardcoded', headline: 'Logged in headline'}]}
//let avatars = [{username: 'uname', avatar: 'avatar'}, {username: 'p2', avatar: 'avatar2'}, {username: 'Christian-Hardcoded', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'}]
//let zips = [{username: 'uname', zipcode: 23456}, {username: 'p2', zipcode: 78901}, {username: 'Christian Hardcoded', zipcode: 12345}]
//let emails = [{username: 'uname', email: 'b@c.com'}, {username: 'p2', email: 'p@2.c'},  {username: 'Christian Hardcoded', email: 'logged@in.com'}]

//curl -H "Content-Type: application/json" -X PUT -d '{"headline":"headline now"}' http://localhost:3000/headline
//curl -H "Content-Type: application/json" -X POST -d '{"username": "Christian-Hardcoded", "password": "p1", "email": "asdf@asd.f", "zipcode": 12345, "dob": "Mon Apr 17 2017 21:40:37 GMT-0500 (CDT)"}' http://localhost:3000/register
//curl -H "Content-Type: application/json" http://localhost:3000/headlines
var mongoose = require('mongoose')
var UsersInfo = require('./db/db_model.js').UsersInfo
const headlines = (req, res) => {
	// Correct behavior: W/ no arguments, return headline of logged in user, otherwise return for all users mentioned
	// If no users specified, just return headlines for logged in
    //TODO: Get loggedInProfile.username by parsing session token, still hardcoded for now
	const users = req.params.user ? req.params.user.split(',') : [loggedInProfile.username]
    
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
    //TODO: Get loggedInProfile.username by parsing session token, still hardcoded for now
	newHeadline.username = loggedInProfile.username
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
        res.send({username: thisUserInfo.username, [parameter]: thisUserInfo[parameter]})
    }

const getEmail = (req, res) => {
	//If not mentioned, return email for logged in user
	if(req.params.user==undefined){
        UsersInfo.find({username: loggedInProfile.username}).exec(getParameterizedReturnFunction(res, 'email'))
            //TODO: Get loggedInProfile.username by parsing session token, still hardcoded for now
            //res.send({username: loggedInProfile.username, email: loggedInProfile.email})
            
    }else{
        UsersInfo.find({username: req.params.user}).exec(getParameterizedReturnFunction(res, 'email'))
    }
}

const putEmail = (req, res) => {
	let newEmail = req.body
	newEmail.username = loggedInProfile.username
	loggedInProfile.email = newEmail.email
	res.send(newEmail)
}

const getZip = (req, res) => {
        //TODO: Replace loggedInProfile.username w/ username parsed from session token
        UsersInfo.find({username: req.params.user ? req.params.user : loggedInProfile.username}).exec(getParameterizedReturnFunction(res, 'zipcode'))    
}

const putZip = (req, res) => {
        let newZip = req.body
        newZip.username = loggedInProfile.username
        loggedInProfile.zipcode = newZip.zipcode
        res.send(newZip)
}

const avatarsF = (req, res) => {
	const users = req.params.user ? req.params.user.split(',') : [loggedInProfile.username]
	
    //Current correct behavior: If user not logged in user, return a generic response
    //Otherwise, return current user's headline
    const usersAvatars = users.map((usr) => {return usr==loggedInProfile.username ? {username: usr, avatar: loggedInProfile.avatar} 
    : {username: usr, avatar: 'Generic Avatar'}})

	console.log(usersAvatars)
	res.send({avatars: usersAvatars})
}

const avatarF = (req, res) => {
        let newAvatar = req.body
        newAvatar.username = loggedInProfile.username
        loggedInProfile.avatar = newAvatar.avatar
        res.send(newAvatar)
}

const dob = (req, res) => {
    //TODO: Replace loggedInProfile.username w/ username parsed from session token
    UsersInfo.find({username: loggedInProfile.username}).exec(getParameterizedReturnFunction(res, 'dob'))
}
module.exports = app => {
	app.get('/headlines/:user?', headlines),
	app.put('/headline', headline),
	app.put('/email', putEmail),
	app.get('/email/:user?', getEmail),
	app.get('/zipcode/:user?', getZip),
	app.put('/zipcode', putZip),
	app.get('/avatars/:user?', avatarsF),
	app.put('/avatar', avatarF),
	app.get('/dob', dob)
}
