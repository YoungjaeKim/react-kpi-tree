import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import elementRoute from './routes/element';
import elementRecordRoute from './routes/element-records';
import graphRoute from './routes/graph';
import externalConnectionsRoute from './routes/external-connections';
import { ExternalConnectionService } from './services/external-connection-service';
import { ElementService } from './services/element-service';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Services
const elementService = new ElementService();
app.locals.elementService = elementService;

// This will hold the active ExternalConnectionService instance
let activeExternalConnectionService: ExternalConnectionService | null = null;
app.locals.activeExternalConnectionService = null;

// Initialize ExternalConnectionService
app.locals.initializeExternalConnectionService = () => {
    console.log('Initializing ExternalConnectionService...');
    activeExternalConnectionService = new ExternalConnectionService(elementService);
    // Set the WebSocket server instance
    if (app.locals.wss) {
        console.log('WebSocket server found, setting it in ExternalConnectionService');
        activeExternalConnectionService.setWebSocketServer(app.locals.wss);
    } else {
        console.warn('WebSocket server not initialized yet - real-time updates will not work');
    }
    app.locals.activeExternalConnectionService = activeExternalConnectionService;
    activeExternalConnectionService.startAllEnabled();
};

// Routes
app.use('/elements', elementRoute);
app.use('/element-records', elementRecordRoute);
app.use('/graphs', graphRoute);
app.use('/connections', externalConnectionsRoute);

// Health check endpoint
app.get('/', (_req, res) => {
    res.status(200).send({ currentTime: new Date().toISOString() });
});

// Expose a method to start/stop ExternalConnectionService on demand
app.locals.startExternalConnectionService = async (elementId: string) => {
    if (activeExternalConnectionService) {
        activeExternalConnectionService.stop();
    }
    activeExternalConnectionService = new ExternalConnectionService(elementService);
    await activeExternalConnectionService.startForElement(elementId);
};

app.locals.stopExternalConnectionService = () => {
    if (activeExternalConnectionService) {
        activeExternalConnectionService.stop();
        activeExternalConnectionService = null;
    }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
    console.log('Shutdown signal received: closing HTTP server');
    if (activeExternalConnectionService) {
        activeExternalConnectionService.stop();
    }
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;