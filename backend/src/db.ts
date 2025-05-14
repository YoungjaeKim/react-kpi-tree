import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connect = async (uri: string): Promise<void> => {
    try {
        await mongoose.connect(uri);
        console.log(`Connected to MongoDB at ${uri}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const disconnect = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        process.exit(1);
    }
}; 