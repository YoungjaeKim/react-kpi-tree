const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Assuming your Express.js app is in app.js
const expect = chai.expect;

chai.use(chaiHttp);

/**
 * Test the /elements route
 */
describe('Element API', () => {
    it('should retrieve a list of elements', (done) => {
        chai.request(app)
            .get('/elements')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.elements).to.be.an('array');
                done();
            });
    });

    it('should create a new resource', (done) => {
        chai.request(app)
            .post('/elements')
            .send({ title: 'New Resource', description: 'Example description' })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body.title).to.equal('New Resource');
                done();
            });
    });

    // Add more test cases for other endpoints and scenarios
});
