const loggedInProfile = {
	username: 'Christian-Hardcoded',
	headline: 'Logged in headline',
	email: 'logged@in.com',
	zipcode: 12345,
	dob: 687610808426.5197,
	avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
}

//let hLines = {headlines: [{username: 'uname', headline: 'headline'}, {username: 'p2', headline: 'stuff'}, {username: 'Christian Hardcoded', headline: 'Logged in headline'}]}
//let avatars = [{username: 'uname', avatar: 'avatar'}, {username: 'p2', avatar: 'avatar2'}, {username: 'Christian Hardcoded', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'}]
//let zips = [{username: 'uname', zipcode: 23456}, {username: 'p2', zipcode: 78901}, {username: 'Christian Hardcoded', zipcode: 12345}]
//let emails = [{username: 'uname', email: 'b@c.com'}, {username: 'p2', email: 'p@2.c'},  {username: 'Christian Hardcoded', email: 'logged@in.com'}]

const headlines = (req, res) => {
	// Correct behavior: W/ no arguments, return headline of logged in user, otherwise return for all users mentioned
	// If no users specified, just return headlines for logged in
	const users = req.params.user ? req.params.user.split(',') : [loggedInProfile.username]
	
    //Current correct behavior: If user not logged in user, return a generic response
    //Otherwise, return current user's headline
    const userHeadlines = users.map((usr) => {return usr==loggedInProfile.username ? {username: usr, headline: loggedInProfile.headline} 
    : {username: usr, headline: 'Generic Headline'}})

	console.log(userHeadlines)
	res.send({headlines: userHeadlines})
}
const headline = (req, res) => {
	// Update local profile
	loggedInProfile.headline = req.body.headline

	// Update headlines list
	let newHeadline = req.body
	newHeadline.username = loggedInProfile.username
	res.send(newHeadline)
}

const getEmail = (req, res) => {
	//If not mentioned, return email for logged in user
	if(req.params.user==undefined){
                res.send({username: loggedInProfile.username, email: loggedInProfile.email})
        }else{
                res.send({username: req.params.user, email: 'stubbed@email.com'})
        }
}

const putEmail = (req, res) => {
	let newEmail = req.body
	newEmail.username = loggedInProfile.username
	loggedInProfile.email = newEmail.email
	res.send(newEmail)
}

const getZip = (req, res) => {
        if(req.params.user==undefined){
                res.send({username: loggedInProfile.username, zipcode: loggedInProfile.zipcode})
        }else{
                res.send({username: req.params.user, zipcode: '12345'})
        }
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
	res.send({username: loggedInProfile.username, dob: loggedInProfile.dob})
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
