import dotenv from 'dotenv';
import app from './app';
import { connect, disconnect } from './db';
import { WebSocketServer } from 'ws';
import { Server } from 'http';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev';

// Create WebSocket server instance
let wss: WebSocketServer;

// MongoDB connection and server startup
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connect(MONGODB_URI);

        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Initialize WebSocket server
        wss = new WebSocketServer({ server });
        
        // Store WebSocket server in app.locals for access in other parts of the application
        app.locals.wss = wss;

        // WebSocket connection handler
        wss.on('connection', (ws) => {
            console.log('New WebSocket connection established');

            ws.on('error', console.error);

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });

        // Initialize ExternalConnectionService after WebSocket server is set up
        app.locals.initializeExternalConnectionService();

        // Handle graceful shutdown
        const gracefulShutdown = async () => {
            console.log('Shutdown signal received: closing HTTP server');
            server.close(async () => {
                console.log('HTTP server closed');
                await disconnect();
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer(); 