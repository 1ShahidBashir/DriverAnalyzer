import { Request, Response } from 'express';
import { FeedbackService } from '../services/FeedbackService';

/**
 * Controller for feedback endpoints.
 * Separates HTTP concerns from business logic.
 */
export class FeedbackController {
    private feedbackService: FeedbackService;

    constructor(feedbackService: FeedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * POST /api/feedback
     * Validates payload, pushes to queue, returns 202 Accepted.
     */
    public submitFeedback = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.feedbackService.submitFeedback(req.body);
            res.status(202).json({
                status: 'accepted',
                message: 'Feedback received and queued for processing',
            });
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                message: error.message,
            });
        }
    };
}
