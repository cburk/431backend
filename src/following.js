const user = "Christian Hardcoded"
let usersFollowings = ['uname', 'p2']
const othersFollowings = ['Christian Hardcoded']

var mongoose = require('mongoose')
var Following = require('./db/db_model.js').Following
const deleteFollowing = (req, res) => {
    //console.log(usersFollowings)
    console.log(req.params.user)
    
    Following.findOneAndUpdate({ username: req.user }, { $pullAll: {following: [req.params.user] } }, (err, items) => { })
    
    //usersFollowings = usersFollowings.filter(r=>{return r != req.params.user})
    console.log(usersFollowings)
    Following.find({ username: req.user }).exec((err, items) => {
        res.send({username: req.user, following: items[0].following})
    })
    //res.send({username: user, following: usersFollowings})
}

const putFollowing = (req, res) => {
    /*
    usersFollowings.push(req.params.user)
    res.send({username: user, following: usersFollowings})
    */
    console.log("Request for user: ", req.params.user, " added to: ", req.user)
    //Add user to list of logged in's followers
    Following.findOneAndUpdate(
        { username: req.user },
        { $push: { following: req.params.user } },
        (err, out) => {
            console.log("also in, ", err)
            console.log("In here, found out: ", out)
        }
    )
    
    //Return new list
    Following.find({ username: req.user }).exec((err, items) => {
        res.send({username: req.user, following: items[0].following})
    })
}

const getFollowing = (req, res) => {
    console.log("A: ", req.params.user)
    console.log("B: ", req.user)
    const query = { username: (req.params.user ? req.params.user : req.user) }
    Following.find(query).exec((err, items) => {    
        console.log("items: ", items)
        console.log("Following: ", items.following)
        res.send({username: req.params.user, following: items[0].following})
    })
}

const isLoggedIn = require('./auth').isLoggedIn
module.exports = {
    reg: (app) => {
        app.get('/following/:user?', isLoggedIn, getFollowing),
        app.put('/following/:user', isLoggedIn, putFollowing),
        app.delete('/following/:user', isLoggedIn, deleteFollowing)
    },
    putFollowing: putFollowing
}
