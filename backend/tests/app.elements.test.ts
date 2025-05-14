import request from 'supertest';
import app from '../src/app';
import { connect, disconnect } from '../src/db';

describe('Element API', () => {
    // Setup database connection before all tests
    beforeAll(async () => {
        await connect();
    });

    // Close database connection after all tests
    afterAll(async () => {
        await disconnect();
    });

    describe('GET /elements', () => {
        it('should retrieve a list of elements', async () => {
            const response = await request(app)
                .get('/elements')
                .expect(200);
            
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.elements).toBeInstanceOf(Array);
        });
    });

    describe('POST /elements', () => {
        it('should create a new resource', async () => {
            const newElement = {
                title: 'New Resource',
                description: 'Example description',
                kpiValue: '95%',
                type: 'percentage',
                children: [],
                parent: null
            };

            const response = await request(app)
                .post('/elements')
                .send(newElement)
                .expect(201);
            
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.title).toBe(newElement.title);
            expect(response.body.description).toBe(newElement.description);
            expect(response.body.kpiValue).toBe(newElement.kpiValue);
        });
    });
}); 