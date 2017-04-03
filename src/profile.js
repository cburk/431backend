const loggedInProfile = {
	username: 'Christian Hardcoded',
	headline: 'Logged in headline',
	email: 'logged@in.com',
	zipcode: 12345,
	avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
}

let hLines = {headlines: [{username: 'uname', headline: 'headline'}, {username: 'p2', headline: 'stuff'}, {username: 'Christian Hardcoded', headline: 'Logged in headline'}]}
let avatars = {avatars: [{username: 'uname', avatar: 'avatar'}, {username: 'p2', avatar: 'avatar2'}, {username: 'Christian Hardcoded', avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'}]}
let zips = [{username: 'a', zipcode: 23456}, {username: 'p2', zipcode: 78901}, {username: 'Christian Hardcoded', zipcode: 12345}]
let emails = [{username: 'a', email: 'b'}, {username: 'p2', email: '12345'},  {username: 'Christian Hardcoded', email: 'logged@in.com'}]

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
	//console.log("this stuff")
	//console.log(req)
	//console.log(req.body)
	//console.log(req.body.headline)
	//console.log(req.params)

	// Update local profile
	console.log("Setting headline, before: ", loggedInProfile)
	loggedInProfile.headline = req.body.headline
	console.log("Setting headline, after: ", loggedInProfile)

	// Update headlines list
	let newHeadline = req.body
	newHeadline.username = loggedInProfile.username
	console.log("New headlin: ", newHeadline)
	console.log("All headlines before: ", hLines)
	hLines.headlines = hLines.headlines.filter((x)=>{return x.username != loggedInProfile.username})
	hLines.headlines.push(newHeadline)
	console.log("All headlines before: ", hLines)
	res.send(newHeadline)
}

const getEmail = (req, res) => {
	if(req.params.user==undefined){
                res.send(emails[0])
        }else{
                res.send(emails.filter((a) => {return a.username == req.params.user})[0])
        }
}

const putEmail = (req, res) => {
	let newHeadline = req.body
	newHeadline.username = 'stuff'
	emails.push(newHeadline)
	res.send(newHeadline)
}
const getZip = (req, res) => {
	if(req.params.user==undefined){
		console.log('step 1')
                res.send(zips[0])
        }else{
		console.log('step 2')
		console.log(req.params.user)
		zips.map((a)=>console.log(a.username))
		console.log(zips.filter((a) => {return a.username == req.params.user}))
                res.send(zips.filter((a) => {return a.username == req.params.user})[0])
        }
}

const putZip = (req, res) => {
	let newHeadline = req.body
	newHeadline.username = 'stuff'
	zips.push(newHeadline)
	res.send(newHeadline)
}

const avatarsF = (req, res) => {
	if(req.params.user==undefined)
		res.send(avatars)
	else{
		res.send({avatars: avatars.avatars.filter((hL)=>{return hL.username == req.params.user})})
	}
}

const avatarF = (req, res) => {
	let newHeadline = req.body
	newHeadline.username = 'stuff'
	hLines.headlines.push(newHeadline)
	res.send(newHeadline)
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
