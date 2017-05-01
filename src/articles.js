const express = require('express')
const bodyParser = require('body-parser')

Article = require('./db/db_model').Article
const uploadImage = require('./cloudinary_ex')
const postArticle = (req, res) => {
    //If an image was included, upload it
    const imgUrl = req.fileurl
    console.log("Got here? image? ", imgUrl)
    
    //Get number of articles to find new id
    Article.find({}).exec((err, articles) => {
        const contents = {_id: articles.length + 1, author: req.user, img: imgUrl ? imgUrl : '', date: Date(), text: req.body.text, comments: []}
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

var Following = require('./db/db_model.js').Following
const getArticles = (req, res) => {
    const callback = (err, articles) => {
        console.log("Errors? ", err)
        console.log("Found any articles? ", articles)
        res.send({articles: articles})
    }

    if(req.params.id){
        //If ID specified, find if it's giving an art id or author
        const query = (parseInt(req.params.id) ? {_id: req.params.id} : {author: req.params.id})
        console.log("Query: ", query)
        console.log("Req.p.id: ", req.params.id)
        Article.
            find(query).
            exec(callback)
        return
    }
    
    
    //Otherwise, get username + people being followed
    Following.
        find({username: req.user}).
        exec((err, items) => {
            console.log("following: ", items)
            const users = [req.user].concat(items[0].following)
            console.log("Full user list: ", users)
            
            // Find the first 10 articles, send back
            Article.
                find({
                    author: { $in: users } 
                }).
                limit(10).
                sort({ date: -1 }).
                exec(callback)
        })
}

const isLoggedIn = require('./auth').isLoggedIn
module.exports = app => {
	app.post('/article', isLoggedIn, uploadImage('article'), postArticle),
    app.put('/articles/:id', isLoggedIn, putArticle),
	app.get('/articles/:id?', isLoggedIn, getArticles)
}
