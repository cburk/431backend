const express = require('express')
const bodyParser = require('body-parser')

Article = require('./db/db_model').Article
const postArticle = (req, res) => {
    //Get number of articles to find new id
    Article.find({}).exec((err, articles) => {
        const contents = {_id: articles.length + 1, author: req.user, img: '', date: Date(), text: req.body.text, comments: []}
        new Article(contents).save()
        res.send({articles: [contents]})
    })
}

const putArticle = (req, res) => {
    if(!req.body.text){
        console.log("Error: no text passed")
        res.sendStatus(400)
        return
    }
    
    Article.findOne({_id: req.params.id}, (err, article) => {
        console.log("Found article? ", article)
        if(!req.body.commentId){
            // Update article content if owned
            if(article.author == req.user){
                article.update({text: req.body.text}, {}, (err, raw) => {
                    console.log("After update: ", raw)
                    // Update local version of article to reflect change, return
                    article.text = req.body.text
                    res.send({articles: [article]})
                    return
                })
            }else{
                res.sendStatus(401)
                return
            }
        }else{
            // Post new comment
            if(req.body.commentId == -1){
                const new_id = article.comments.length + 1
                article.update({ $push: { comments: {commentId: new_id, author: req.user, date: Date(), text: req.body.text} } }, {}, (err, raw) => {
                    console.log("After comment creation: ", raw)
                    // Update local version of article to reflect change, return
                    article.comments.push({commentId: new_id, author: req.user, date: Date(), text: req.body.text})
                    res.send({articles: [article]})
                    return
                })
            // Otherwise, update comment if owned
            }else{
                const editComment = article.comments.filter((comment) => {return comment.commentId==req.body.commentId})[0]
                console.log("Found comment: ", editComment)
                if(editComment.author==req.user){
                    editComment.text = req.body.text
                    article.save()
                    res.send({articles: [article]})
                    //editComment.save()
                }else{
                    res.sendStatus(401)
                    return
                }
            }
        }
    })    
}

const getArticles = (req, res) => {
    /* As per spec:
    There is NO requirement on the authors of the articles returned to the frontend. I.e., GET /articles can return all the articles in the database for this assignment.
    
    As a result, just returning all articles
    */
    
    Article.find({}).exec((err, articles) => {
        res.send({articles: articles})
    })
}

const isLoggedIn = require('./auth').isLoggedIn
module.exports = app => {
	app.post('/article', isLoggedIn, postArticle),
    app.put('/articles/:id', isLoggedIn, putArticle),
	app.get('/articles/:id?', isLoggedIn, getArticles)
}
