import { Request, Response } from 'express';
import { IFeatureFlags } from '../interfaces/IFeatureFlags';

/**
 * Controller for configuration endpoints.
 */
export class ConfigController {
    private featureFlags: IFeatureFlags;

    constructor() {
        // Feature flags — easily configurable
        this.featureFlags = {
            driverFeedback: true,
            tripFeedback: true,
            appFeedback: false,
            marshalFeedback: true,
        };
    }

    /**
     * GET /api/config/features
     * Returns current feature flag configuration.
     */
    public getFeatureFlags = (_req: Request, res: Response): void => {
        res.json({
            status: 'success',
            data: this.featureFlags,
        });
    };
}
