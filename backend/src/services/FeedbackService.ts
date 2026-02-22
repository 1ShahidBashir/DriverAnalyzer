import { IFeedback } from '../interfaces/IFeedback';
import { QueueManager } from '../queue/QueueManager';

/**
 * Service responsible for feedback ingestion.
 * Uses Dependency Injection — receives QueueManager through constructor.
 */
export class FeedbackService {
    private queueManager: QueueManager;

    constructor(queueManager: QueueManager) {
        this.queueManager = queueManager;
    }

    /**
     * Validates feedback payload and enqueues it for async processing.
     * Does NOT process sentiment synchronously — returns immediately.
     */
    public async submitFeedback(data: Partial<IFeedback>): Promise<void> {
        // Validation
        if (!data.driverId || !data.driverId.trim()) {
            throw new Error('driverId is required');
        }
        if (!data.text || !data.text.trim()) {
            throw new Error('text is required');
        }
        if (!data.feedbackType || !['driver', 'trip', 'app', 'marshal'].includes(data.feedbackType)) {
            throw new Error('feedbackType must be one of: driver, trip, app, marshal');
        }
        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
            throw new Error('rating must be between 1 and 5');
        }

        const feedbackPayload: IFeedback = {
            driverId: data.driverId.trim(),
            feedbackType: data.feedbackType,
            text: data.text.trim(),
            rating: data.rating || 3,
            timestamp: new Date(),
        };

        await this.queueManager.addToQueue('process-feedback', feedbackPayload);
    }
}
