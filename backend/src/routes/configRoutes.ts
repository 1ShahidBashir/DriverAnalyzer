import { Router } from 'express';
import { ConfigController } from '../controllers/ConfigController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const configController = new ConfigController();

// Public — anyone can read feature flags
router.get('/features', configController.getFeatureFlags);

// Protected — only admin can toggle feature flags
router.put('/features', authMiddleware, configController.updateFeatureFlags);

export default router;
