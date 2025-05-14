import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import elementRoute from './routes/element';
import elementRecordRoute from './routes/element-records';
import graphRoute from './routes/graph';
import { ExternalConnectionService } from './services/external-connection-service';
import { ConfigurationService } from './services/config-service';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize configuration
const configService = ConfigurationService.getInstance();
const configPath = path.resolve(__dirname, '..', process.env.EXTERNAL_CONNECTIONS_CONFIG_PATH || './config/external-connections.json');

// Initialize services
const externalConnectionService = new ExternalConnectionService();

// Load configurations and start services
configService.loadExternalConnectionsConfig(configPath)
    .then(config => {
        if (config) {
            externalConnectionService.start().catch(error => {
                console.error('Failed to start external connection service:', error);
            });
        }
    });

// Routes
app.use('/elements', elementRoute);
app.use('/element-records', elementRecordRoute);
app.use('/graphs', graphRoute);

// Health check endpoint
app.get('/', (_req, res) => {
    res.status(200).send({ currentTime: new Date().toISOString() });
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