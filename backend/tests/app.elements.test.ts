import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app';

const expect = chai.expect;

chai.use(chaiHttp);

/**
 * Test the /elements route
 */
describe('Element API', () => {
    it('should retrieve a list of elements', async () => {
        const res = await chai.request(app).get('/elements');
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.elements).to.be.an('array');
    });

    it('should create a new resource', async () => {
        const res = await chai.request(app)
            .post('/elements')
            .send({ title: 'New Resource', description: 'Example description' });
        
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.title).to.equal('New Resource');
    });
}); 