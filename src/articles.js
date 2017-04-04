const express = require('express')
const bodyParser = require('body-parser')

let articles = [{id: 1, author: 'Dude', text: 'stuff'},{id: 2, author: 'Dude2', text: 'stuff2'},{id: 3, author: 'Dude3', text: 'stuff3'}]

const currentUser = 'Christian Hardcoded'
const userArticles = [{_id: 5, author: currentUser, text: 'art 5', date: new Date(), comments: []},
                    {_id: 6, author: currentUser, text: 'art 6!', date: new Date(), comments: []},
                    {_id: 7, author: currentUser, text: 'art 7', date: new Date(), comments: []}]
let nextArticleNum = 8

const postArticle = (req, res) => {
    //TODO: Add image if there
    console.log("Should be new?")
    const newArticle = {author: currentUser, _id: nextArticleNum, text: req.body.text, date: new Date(), comments: []}
    nextArticleNum += 1
    userArticles.push(newArticle)
    res.send({articles: userArticles})
}

const putArticle = (req, res) => {

}

const getArticles = (req, res) => {
     console.log('Payload received', req.body)
	console.log(req.params)
	if(req.params.id==undefined){
	     res.send(articles)
		console.log("empty case")
	}
	else{
		//console.log()
		res.send(articles.filter((art) => {return art.id == req.params.id}))
	}
}

module.exports = app => {
	app.post('/article', postArticle),
    app.put('/articles/:id', putArticle),
	app.get('/articles/:id?', getArticles)
}
/*
const app = express()
app.use(bodyParser.json())
app.post('/article', addArticle)
app.get('/articles/:id?', getArticles)

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
*/
