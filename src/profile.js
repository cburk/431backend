let hLines = {headlines: [{username: 'uname', headline: 'headline'}, {username: 'me', headline: 'stuff'}]}
let avatars = {avatars: [{username: 'uname', avatar: 'avatar'}, {username: 'me', avatar: 'avatar2'}]}

let zips = [{username: 'a', zipcode: 'b'}, {username: 'me', zipcode: '12345'}]
let emails = [{username: 'a', email: 'b'}, {username: 'me', email: '12345'}]

const headlines = (req, res) => {
	console.log('headline params')
	console.log(req.params)
	if(req.params.user==undefined)
		res.send(hLines)
	else{
		res.send({headlines: hLines.headlines.filter((hL)=>{return hL.username == req.params.user})})
	}
	console.log("Finished")
}
const headline = (req, res) => {
	console.log("this stuff")
	console.log(req)
	console.log(req.body)
	console.log(req.body.headline)
	console.log(req.params)
	let newHeadline = req.body
	newHeadline.username = 'stuff'
	hLines.headlines.push(newHeadline)
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
