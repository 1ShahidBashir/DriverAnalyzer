import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import { FeedbackService } from '../services/FeedbackService';
import { QueueManager } from '../queue/QueueManager';

const router = Router();

// Dependency Injection chain
const queueManager = QueueManager.getInstance();
const feedbackService = new FeedbackService(queueManager);
const feedbackController = new FeedbackController(feedbackService);

router.post('/', feedbackController.submitFeedback);

export default router;
