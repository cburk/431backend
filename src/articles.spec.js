/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate Article functionality', () => {
	it('should give me three or more articles', (done) => {
		// IMPLEMENT ME
		fetch(url("/articles"))
		.then(res => {
			expect(res.status).to.eql(200)	
			return res.text()
		})
		.then(body => {
			expect(JSON.parse(body).articles.length).above(2)
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should add two articles with successive article ids, and return the article each time', (done) => {
		// add a new article
		// verify you get the article back with an id
		// verify the content of the article
		const thisBody = {author: 'authName1', text: 'text1'}
		const thisBody2 = {author: 'authName2', text: 'text2'}
		let firstId = -1
		fetch(url("/article"), {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(thisBody)
		})
        .then(res => {
                expect(res.status).to.eql(200)
                return res.text()
        })
        .then(body => {
                const arts = JSON.parse(body).articles
                expect(arts[arts.length - 1].text).to.eql(thisBody.text)
                firstId = arts[arts.length - 1]._id
        }).then(body => {
            //Post 2
            // add a second article
            // verify the article id increases by one
            // verify the second artice has the correct content
            fetch(url("/article"), {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(thisBody2)
            })
            .then(res => {
                    expect(res.status).to.eql(200)
                    return res.text()
            })
            .then(body => {
                    const secondArts = JSON.parse(body).articles
                    expect(secondArts[secondArts.length - 1].text).to.eql(thisBody2.text)
                    expect(secondArts[secondArts.length - 1]._id).to.eql(firstId + 1)
            })
        })
        .then(done)
        .catch(done)

 	}, 200)

	it('should return an article with a specified id', (done) => {
		let anId
        fetch(url("/articles"))
        .then(res => {
                expect(res.status).to.eql(200)
                return res.text()
        })
        .then(body => {
                anId = JSON.parse(body).articles[0]._id
        }).then(body => {
            //Try to get the actual id
            fetch(url("/articles", anId))
            .then(res => {
                expect(res.status).to.eql(200)
                return res.text()
            })
            .then(body => {
                expect(JSON.parse(body).articles[0]._id).to.eql(anId)
            })
            .then(done)
            .catch(done)
        })
	}, 200)

	it('should return nothing for an invalid id', (done) => {
		// call GET /articles/id where id is not a valid article id, perhaps 0
		// confirm that you get no results
		fetch(url("/articles/10000"))
        .then(res => {
                expect(res.status).to.eql(200)
                return res.text()
        })
        .then(body => {
			expect(JSON.parse(body).articles.length).to.eql(0)
                })
		.then(done)
        .catch(done)
	}, 200)
});
