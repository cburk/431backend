const user = "Christian Hardcoded"
let usersFollowings = ['uname', 'p2']
const othersFollowings = ['Christian Hardcoded']

const deleteFollowing = (req, res) => {
    console.log(usersFollowings)
    console.log(req.params.user)
    usersFollowings = usersFollowings.filter(r=>{return r != req.params.user})
    console.log(usersFollowings)
    res.send({username: user, following: usersFollowings})
}

const putFollowing = (req, res) => {
    usersFollowings.push(req.params.user)
    res.send({username: user, following: usersFollowings})
}

const getFollowing = (req, res) => {
    console.log(req.params.user)
    console.log(req.params)
	if(!req.params.user || req.params.user == user){
        res.send({username: user, following: usersFollowings})
    }else{
        res.send({username: req.params.user, following: othersFollowings})
    }
}

module.exports = app => {
	app.get('/following/:user?', getFollowing),
	app.put('/following/:user', putFollowing),
	app.delete('/following/:user', deleteFollowing)
}
