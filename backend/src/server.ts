import dotenv from 'dotenv';
import app from './app';
import { connect, disconnect } from './db';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import elementRoutes from './routes/element';
import elementRecordRoutes from './routes/element-records';
import graphRoutes from './routes/graph';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/elements', elementRoutes);
app.use('/element-records', elementRecordRoutes);
app.use('/graphs', graphRoutes);

// MongoDB connection and server startup
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connect();
        console.log('Connected to MongoDB');

        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

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