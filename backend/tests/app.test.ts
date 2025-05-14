import request from 'supertest';
import app from '../src/app';

describe('API Endpoints', () => {
    describe('GET /', () => {
        it('should return status 200 and current time', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);
            
            expect(response.body).toHaveProperty('currentTime');
            expect(new Date(response.body.currentTime)).toBeInstanceOf(Date);
        });
    });
}); 