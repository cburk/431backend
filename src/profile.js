const loggedInProfile = {
	username: 'Christian Hardcoded',
	headline: 'Logged in headline',
	email: 'logged@in.com',
	zipcode: 12345,
	avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
}

let hLines = {headlines: [{username: 'uname', headline: 'headline'}, {username: 'p2', headline: 'stuff'}, {username: 'Christian Hardcoded', headline: 'Logged in headline'}]}
let avatars = [{username: 'uname', avatar: 'avatar'}, {username: 'p2', avatar: 'avatar2'}, {username: 'Christian Hardcoded', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'}]
let zips = [{username: 'uname', zipcode: 23456}, {username: 'p2', zipcode: 78901}, {username: 'Christian Hardcoded', zipcode: 12345}]
let emails = [{username: 'uname', email: 'b@c.com'}, {username: 'p2', email: 'p@2.c'},  {username: 'Christian Hardcoded', email: 'logged@in.com'}]

const headlines = (req, res) => {
	// Correct behavior: W/ no arguments, return headline of logged in user, otherwise return for all users mentioned
	// If no users specified, just return headlines for logged in
	const users = req.params.user ? req.params.user.split(',') : [loggedInProfile.username]
	//If some of the people weren't in headlines originally, null results, filter these out
	const usersFiltered = users.filter((usr)=>{return hLines.headlines.filter(hline=>{return hline.username==usr}).length>0})
	const userHeadlines = usersFiltered.map((usr) => {return hLines.headlines.filter(hLine=>{return hLine.username==usr})[0]}, [])

	console.log(userHeadlines)
	res.send({headlines: userHeadlines})
}
const headline = (req, res) => {
	// Update local profile
	loggedInProfile.headline = req.body.headline

	// Update headlines list
	let newHeadline = req.body
	newHeadline.username = loggedInProfile.username
	hLines.headlines = hLines.headlines.filter((x)=>{return x.username != loggedInProfile.username})
	hLines.headlines.push(newHeadline)
	res.send(newHeadline)
}

const getEmail = (req, res) => {
	//If not mentioned, return email for logged in user
	if(req.params.user==undefined){
                res.send({username: loggedInProfile.username, email: loggedInProfile.email})
        }else{
                res.send(emails.filter((a) => {return a.username == req.params.user})[0])
        }
}

const putEmail = (req, res) => {
	let newEmail = req.body
	newEmail.username = loggedInProfile.username
	loggedInProfile.email = newEmail.email

        emails = emails.filter((x)=>{return x.username != loggedInProfile.username})
	emails.push(newEmail)
	res.send(newEmail)
}
const getZip = (req, res) => {
        if(req.params.user==undefined){
                res.send({username: loggedInProfile.username, zipcode: loggedInProfile.zipcode})
        }else{
                res.send(zips.filter((a) => {return a.username == req.params.user})[0])
        }
}

const putZip = (req, res) => {
        let newZip = req.body
        newZip.username = loggedInProfile.username
        loggedInProfile.zipcode = newZip.zipcode

        zips = zips.filter((x)=>{return x.username != loggedInProfile.username})
        zips.push(newZip)
        res.send(newZip)
}

const avatarsF = (req, res) => {
        if(req.params.user==undefined){
                res.send({username: loggedInProfile.username, avatar: loggedInProfile.avatar})
        }else{
                res.send(avatars.filter((a) => {return a.username == req.params.user})[0])
        }
}

const avatarF = (req, res) => {
        let newAvatar = req.body
        newAvatar.username = loggedInProfile.username
        loggedInProfile.avatar = newAvatar.avatar

        avatars = avatars.filter((x)=>{return x.username != loggedInProfile.username})
        avatars.push(newAvatar)
        res.send(newAvatar)
}

module.exports = app => {
	app.get('/headlines/:user?', headlines),
	app.put('/headline', headline),
	app.put('/email', putEmail),
	app.get('/email/:user?', getEmail),
	app.get('/zipcode/:user?', getZip),
	app.put('/zipcode', putZip),
	app.get('/avatars/:user?', avatarsF),
	app.put('/avatar', avatarF)
}
