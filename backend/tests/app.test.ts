import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app';
import { Response } from 'chai-http';

const expect = chai.expect;

chai.use(chaiHttp);

/**
 * Test the / route
 */
describe('Call root', () => {
    it('should call root and return status 200', async () => {
        const res = await chai.request(app).get('/');
        expect(res).to.have.status(200);
        console.log(res.body);
    });
}); 