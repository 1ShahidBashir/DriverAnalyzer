import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton class for MongoDB connection.
 * Ensures only one connection pool exists per process.
 */
export class Database {
    private static instance: Database;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('[Database] Already connected to MongoDB');
            return;
        }

        try {
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-sentiment';
            await mongoose.connect(uri);
            this.isConnected = true;
            console.log('[Database] Successfully connected to MongoDB');
        } catch (error) {
            console.error('[Database] Connection error:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) return;
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('[Database] Disconnected from MongoDB');
    }
}
