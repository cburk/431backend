var Headline = require('./db_model.js').Headline

function drop_headlines(req, res) {
    Headline.remove({}, () => {console.log("Drop call received")})
    res.send('headlines dropped')
}

function find(req, res) {
     findByAuthor(req.params.user, function(items) {
          res.send({items})
     })
}

function add(req, res) {
    new Article({id: i, author: 'loggedinuser', img: null, date: new Date().getTime(), text: req.body.text}).save()
    i += 1
    res.send('ok')
}

module.exports = (app) => {
    app.get('/find/:user', find),
    app.post('/add/', add),
    app.post('/drop/', drop_articles)
}


function findByAuthor(author, callback) {
	Article.find({ author: author }).exec(function(err, items) {
		console.log('There are ' + items.length + ' entries for ' + author)
		var totalLength = 0
		items.forEach(function(article) {
			totalLength += article.text.length
		})
		console.log('average length', totalLength / items.length)		
		callback(items)
	})
}

