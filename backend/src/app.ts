import express from 'express';
import cors from 'cors';
import elementRoute from './routes/element';
import elementRecordRoute from './routes/element-records';
import graphRoute from './routes/graph';
import { ExternalConnectionService } from './services/external-connection-service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize ExternalConnectionService
const externalConnectionService = new ExternalConnectionService();

// Routes
app.use('/elements', elementRoute);
app.use('/element-records', elementRecordRoute);
app.use('/graphs', graphRoute);

// Health check endpoint
app.get('/', (_req, res) => {
    res.status(200).send({ currentTime: new Date().toISOString() });
});

// Start the external connection service
externalConnectionService.start().catch(error => {
    console.error('Failed to start external connection service:', error);
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
    console.log('Shutdown signal received: closing HTTP server');
    externalConnectionService.stop();
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app; 