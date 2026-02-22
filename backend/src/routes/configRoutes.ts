import { Router } from 'express';
import { ConfigController } from '../controllers/ConfigController';

const router = Router();
const configController = new ConfigController();

router.get('/features', configController.getFeatureFlags);

export default router;
