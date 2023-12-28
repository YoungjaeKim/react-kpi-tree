const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Assuming your Express.js app is in app.js
const expect = chai.expect;

chai.use(chaiHttp);

/**
 * Test the / route
 */
describe('Call root', () => {
    it('should call root and return status 200', () => {
        return chai.request(app)
            .get('/')
            .then((res) => {
                expect(res).to.have.status(200);
                console.log(res.body);
            });
    });
});
