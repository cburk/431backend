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
            let origHeadline
            //Get the original headline
            fetch(url("/headlines"))
            .then(res => {
                return res.text()
            })
            .then(body => {
                expect(JSON.parse(body).headlines[0].headline).to.not.eql(null)
            })
            //Change the headline
            .then(() => {
                return fetch(url("/headline"), {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newHeadline)
                })
            })
            .then((res) => {
                return res.text()
            })
            .then(body => {
                //Verify the put response was correct
                expect(JSON.parse(body).headline).to.eql(newHeadline.headline)
            })
            .then(() => {
                // Verify headline was updated with a final get request
                return fetch(url("/headlines"))
            })
			.then(res => {
                return res.text()
			})
			.then(body => {
				const relevantHeadlines = JSON.parse(body).headlines
				expect(relevantHeadlines[0].headline).to.eql(newHeadline.headline)
			}).then(done)
            .catch(done)
        }, 200)

});
