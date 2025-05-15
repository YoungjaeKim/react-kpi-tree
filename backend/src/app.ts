import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import elementRoute from './routes/element';
import elementRecordRoute from './routes/element-records';
import graphRoute from './routes/graph';
import { ExternalConnectionService } from './services/external-connection-service';
import { ConfigurationService } from './services/config-service';
import { ElementService } from './services/element-service';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Services
const configService = ConfigurationService.getInstance();
const elementService = new ElementService();

// Make ElementService available to controllers (e.g., via app.locals or if routes are class-based)
// Example for app.locals, which is simpler for function-based controllers:
app.locals.elementService = elementService;

// This will hold the active ExternalConnectionService instance
let activeExternalConnectionService: ExternalConnectionService;

const configPath = path.resolve(__dirname, '..', process.env.EXTERNAL_CONNECTIONS_CONFIG_PATH || './config/external-connections.json');

// Initialize a default (potentially non-functional or minimally functional) ExternalConnectionService
// This ensures activeExternalConnectionService is always assigned.
activeExternalConnectionService = new ExternalConnectionService(elementService); 

// Load configurations and start services
configService.loadExternalConnectionsConfig(configPath)
    .then(config => {
        if (config) {
            // Create and start the fully configured service
            const configuredService = new ExternalConnectionService(elementService, config);
            app.locals.externalConnectionService = configuredService; // Store for potential access if needed
            activeExternalConnectionService = configuredService; // This is the one we want to stop
            activeExternalConnectionService.start().catch(error => {
                console.error('Failed to start configured external connection service:', error);
            });
        } else {
            console.log('External connection service not started as no external_connections.json configuration was loaded.');
            // The default activeExternalConnectionService (without specific config) can be started if it has a meaningful default behavior
            // activeExternalConnectionService.start().catch(e => console.error("Error starting default external service", e));
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
    if (activeExternalConnectionService) {
        activeExternalConnectionService.stop();
    }
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app; 