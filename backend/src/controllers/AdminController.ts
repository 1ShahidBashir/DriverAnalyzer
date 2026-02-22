import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MetricsService } from '../services/MetricsService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Controller for admin endpoints.
 * Handles mock JWT login and cached analytics.
 */
export class AdminController {
    private metricsService: MetricsService;
    private readonly JWT_SECRET: string;

    // Mock admin credentials
    private readonly ADMIN_USERNAME = 'admin';
    private readonly ADMIN_PASSWORD = 'admin123';

    constructor(metricsService: MetricsService) {
        this.metricsService = metricsService;
        this.JWT_SECRET = process.env.JWT_SECRET || 'moveinsync_secret_key_2024';
    }

    /**
     * POST /api/admin/login
     * Mock JWT authentication.
     */
    public login = (req: Request, res: Response): void => {
        const { username, password } = req.body;

        if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { username, role: 'admin' },
                this.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                status: 'success',
                data: { token, username, role: 'admin' },
            });
        } else {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
        }
    };

    /**
     * GET /api/admin/analytics
     * Returns driver performance data with 60s in-memory cache.
     */
    public getAnalytics = async (_req: Request, res: Response): Promise<void> => {
        try {
            const metrics = await this.metricsService.getAnalytics();
            const alerts = await this.metricsService.getAlerts();

            res.json({
                status: 'success',
                data: {
                    metrics,
                    alerts,
                    generatedAt: new Date().toISOString(),
                },
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: error.message,
            });
        }
    };
    /**
     * GET /api/admin/drivers/:driverId
     * Returns detailed stats for a single driver.
     */
    public getDriverDetail = async (req: Request, res: Response): Promise<void> => {
        try {
            const driverId = req.params.driverId as string;
            const detail = await this.metricsService.getDriverDetail(driverId);

            if (!detail.metrics) {
                res.status(404).json({ status: 'error', message: `Driver ${driverId} not found` });
                return;
            }

            res.json({ status: 'success', data: detail });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };
}
