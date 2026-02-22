import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { MetricsService } from '../services/MetricsService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Dependency Injection
const metricsService = new MetricsService();
const adminController = new AdminController(metricsService);

// Public route — login
router.post('/login', adminController.login);

// Protected routes — require JWT
router.get('/analytics', authMiddleware, adminController.getAnalytics);
router.get('/drivers/:driverId', authMiddleware, adminController.getDriverDetail);

export default router;
