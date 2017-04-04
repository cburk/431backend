/*
 * Test suite for profile.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`
const testUsername = "Christian Hardcoded"

describe('Validate Profile functionality', () => {
        it('should updates default users headline', (done) => {
		const newHeadline = {headline: 'this is a new headline'}
                fetch(url("/headline"), {
                        method: "PUT",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newHeadline)
                })
                .then(res => {
                        expect(res.status).to.eql(200)
                        return res.text()
                })
                .then(body => {
			expect(JSON.parse(body).username).to.eql(testUsername)
			expect(JSON.parse(body).headline).to.eql(newHeadline.headline)
                })
		.then(body => {
			// Verify headline was updated with a get request
			fetch(url("/headlines"))
			.then(res => {
	                        expect(res.status).to.eql(200)
	                        return res.text()
			})
			.then(body => {
				const relevantHeadlines = JSON.parse(body).headlines.filter((x)=>{return x.username == testUsername})
				console.log("Mostly through, did we get headlines? ", relevantHeadlines)
				expect(relevantHeadlines[0].headline).to.eql(newHeadline.headline)
			}).then(done)
		})
        }, 200)

});
