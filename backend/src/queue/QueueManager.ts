import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton class managing BullMQ Queue and Redis connection.
 */
export class QueueManager {
    private static instance: QueueManager;
    private feedbackQueue: Queue;
    private connectionConfig: { host: string; port: number; maxRetriesPerRequest: null };

    private constructor() {
        this.connectionConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: null,
        };

        this.feedbackQueue = new Queue('feedback-processing', {
            connection: this.connectionConfig,
        });

        console.log('[QueueManager] Initialized with Redis connection');
    }

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    public getQueue(): Queue {
        return this.feedbackQueue;
    }

    public getConnectionConfig(): { host: string; port: number; maxRetriesPerRequest: null } {
        return this.connectionConfig;
    }

    public async addToQueue(jobName: string, data: any): Promise<void> {
        await this.feedbackQueue.add(jobName, data, {
            removeOnComplete: 100,
            removeOnFail: 50,
        });
        console.log(`[QueueManager] Job "${jobName}" added to queue`);
    }

    public async shutdown(): Promise<void> {
        await this.feedbackQueue.close();
        console.log('[QueueManager] Shut down');
    }
}
