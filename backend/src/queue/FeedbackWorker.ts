import { Worker, Job } from 'bullmq';
import { ISentimentAnalyzer } from '../strategies/ISentimentAnalyzer';
import { MetricsService } from '../services/MetricsService';
import Feedback from '../models/Feedback';
import { IFeedback } from '../interfaces/IFeedback';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Background worker that processes feedback from the BullMQ queue.
 * Uses Dependency Injection for the SentimentAnalyzer and MetricsService.
 */
export class FeedbackWorker {
    private worker: Worker;
    private sentimentAnalyzer: ISentimentAnalyzer;
    private metricsService: MetricsService;

    constructor(sentimentAnalyzer: ISentimentAnalyzer, metricsService: MetricsService) {
        this.sentimentAnalyzer = sentimentAnalyzer;
        this.metricsService = metricsService;

        const connection = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: null,
        };

        this.worker = new Worker(
            'feedback-processing',
            async (job: Job) => {
                await this.processJob(job);
            },
            {
                connection,
                concurrency: 5,
            }
        );

        this.worker.on('completed', (job: Job) => {
            console.log(`[FeedbackWorker] ✅ Job ${job.id} completed`);
        });

        this.worker.on('failed', (job: Job | undefined, error: Error) => {
            console.error(`[FeedbackWorker] ❌ Job ${job?.id} failed:`, error.message);
        });

        console.log('[FeedbackWorker] Started and listening for jobs');
    }

    /**
     * Processes a single feedback job:
     * 1. Analyze sentiment via Strategy pattern
     * 2. Save feedback document
     * 3. Update driver EMA metrics
     */
    private async processJob(job: Job): Promise<void> {
        const data: IFeedback = job.data;
        console.log(`[FeedbackWorker] Processing feedback for driver ${data.driverId}`);

        // Step 1: Analyze sentiment
        const sentimentScore = this.sentimentAnalyzer.analyze(data.text);
        console.log(`[FeedbackWorker] Sentiment score: ${sentimentScore} for text: "${data.text.substring(0, 50)}..."`);

        // Step 2: Save feedback with sentiment score
        const feedback = new Feedback({
            ...data,
            sentimentScore,
            timestamp: data.timestamp || new Date(),
        });
        await feedback.save();

        // Step 3: Update driver metrics with EMA
        await this.metricsService.updateDriverMetrics(data.driverId, sentimentScore);
    }

    public async shutdown(): Promise<void> {
        await this.worker.close();
        console.log('[FeedbackWorker] Shut down');
    }
}
