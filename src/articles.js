const express = require('express')
const bodyParser = require('body-parser')

let articles = [{id: 1, author: 'Dude', text: 'stuff'},{id: 2, author: 'Dude2', text: 'stuff2'},{id: 3, author: 'Dude3', text: 'stuff3'}]

const currentUser = 'Christian Hardcoded'
const allArticles = [{_id: 5, author: currentUser, text: 'art 5', date: new Date(), comments: []},
                    {_id: 6, author: currentUser, text: 'art 6!', date: new Date(), comments: []},
                    {_id: 7, author: currentUser, text: 'art 7', date: new Date(), comments: []},
                    {_id: 2, author: 'someone else', text: 'A different art', date: new Date(), comments: []}]
const userArticles = [{_id: 5, author: currentUser, text: 'art 5', date: new Date(), comments: []},
                    {_id: 6, author: currentUser, text: 'art 6!', date: new Date(), comments: []},
                    {_id: 7, author: currentUser, text: 'art 7', date: new Date(), comments: []}]
let nextArticleNum = 8

const postArticle = (req, res) => {
    //TODO at a later assignment: Add image if there
    console.log("Should be new?")
    const newArticle = {author: currentUser, _id: nextArticleNum, text: req.body.text, date: new Date(), comments: []}
    nextArticleNum += 1
    userArticles.push(newArticle)
    allArticles.push(newArticle)
    res.send({articles: userArticles})
}

const putArticle = (req, res) => {
    res.send({articles: [{_id: -1, author: 'PUT IS STUBBED', text: 'PUT IS STUBBED', date: new Date(), comments: []}]})
}

const getArticles = (req, res) => {
	if(req.params.id==undefined){
	     res.send({articles: userArticles})
	}
	else{
		res.send({articles: allArticles.filter((art) => {return art._id == req.params.id || art.author == req.params.id})})
	}
}

module.exports = app => {
	app.post('/article', postArticle),
    app.put('/articles/:id', putArticle),
	app.get('/articles/:id?', getArticles)
}
