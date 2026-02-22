import { Request, Response } from 'express';
import FeatureFlags from '../models/FeatureFlags';

/**
 * Controller for configuration endpoints.
 * Reads/writes feature flags from MongoDB for runtime toggleability.
 */
export class ConfigController {
    /**
     * GET /api/config/features
     * Returns current feature flag configuration from the database.
     */
    public getFeatureFlags = async (_req: Request, res: Response): Promise<void> => {
        try {
            let flags = await FeatureFlags.findOne({ configId: 'global' });

            if (!flags) {
                // Seed defaults if not yet initialized
                flags = await FeatureFlags.create({ configId: 'global' });
            }

            res.json({
                status: 'success',
                data: {
                    driverFeedback: flags.driverFeedback,
                    tripFeedback: flags.tripFeedback,
                    appFeedback: flags.appFeedback,
                    marshalFeedback: flags.marshalFeedback,
                },
            });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    /**
     * PUT /api/config/features
     * Updates feature flags at runtime — no code changes or restarts needed.
     * Accepts partial updates: { "appFeedback": true }
     * Protected by JWT auth middleware.
     */
    public updateFeatureFlags = async (req: Request, res: Response): Promise<void> => {
        try {
            const allowedKeys = ['driverFeedback', 'tripFeedback', 'appFeedback', 'marshalFeedback'];
            const updates: Record<string, boolean> = {};

            for (const key of allowedKeys) {
                if (typeof req.body[key] === 'boolean') {
                    updates[key] = req.body[key];
                }
            }

            if (Object.keys(updates).length === 0) {
                res.status(400).json({
                    status: 'error',
                    message: 'No valid feature flags provided. Accepted keys: ' + allowedKeys.join(', '),
                });
                return;
            }

            const flags = await FeatureFlags.findOneAndUpdate(
                { configId: 'global' },
                { $set: updates },
                { new: true, upsert: true }
            );

            console.log(`[ConfigController] Feature flags updated:`, updates);

            res.json({
                status: 'success',
                data: {
                    driverFeedback: flags!.driverFeedback,
                    tripFeedback: flags!.tripFeedback,
                    appFeedback: flags!.appFeedback,
                    marshalFeedback: flags!.marshalFeedback,
                },
            });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };
}
