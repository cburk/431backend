var mongoose = require('mongoose')
require('./db.js')

var commentSchema = new mongoose.Schema({
	commentId: Number, author: String, date: Date, text: String
})
var articleSchema = new mongoose.Schema({
	id: Number, author: String, img: String, date: Date, text: String,
	comments: [ commentSchema ]
})
var followingsSchema = new mongoose.Schema({
    username: String, following: [ Number ]
})
var userInfoSchema = new mongoose.Schema({
    username: String, password: String, dob: Date, email: String, zipcode: Number, headline: String
})

exports.Article = mongoose.model('article', articleSchema)
exports.UsersInfo = mongoose.model('UsersInfo', userInfoSchema)
exports.Following = mongoose.model('following', followingsSchema)

