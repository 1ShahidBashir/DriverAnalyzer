import DriverMetrics from '../models/DriverMetrics';
import Alert from '../models/Alert';
import Feedback from '../models/Feedback';
import { IDriverMetricsDocument } from '../interfaces/IDriverMetrics';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service for managing driver metrics with EMA calculations.
 * Implements O(1) time/space updates and alert throttling.
 */
export class MetricsService {
    private readonly alpha: number;
    private readonly alertThreshold: number;
    private readonly alertCooldownMs: number;

    // In-memory cache for analytics endpoint (60s TTL)
    private analyticsCache: { data: IDriverMetricsDocument[] | null; timestamp: number } = {
        data: null,
        timestamp: 0,
    };
    private readonly CACHE_TTL_MS = 60_000; // 60 seconds

    constructor() {
        this.alpha = parseFloat(process.env.EMA_ALPHA || '0.2');
        this.alertThreshold = parseFloat(process.env.ALERT_THRESHOLD || '2.5');
        this.alertCooldownMs = parseInt(process.env.ALERT_COOLDOWN_MS || '3600000');
    }

    /**
     * Updates driver metrics using Exponential Moving Average.
     * EMA_new = (Score_new × α) + (EMA_current × (1 − α))
     * O(1) time and space — only stores current EMA and count.
     */
    public async updateDriverMetrics(driverId: string, newScore: number): Promise<IDriverMetricsDocument> {
        let metrics = await DriverMetrics.findOne({ driverId });

        if (!metrics) {
            // First feedback for this driver — EMA starts at the first score
            metrics = new DriverMetrics({
                driverId,
                emaScore: newScore,
                totalFeedbackCount: 1,
                lastAlertTimestamp: null,
            });
        } else {
            // Apply EMA formula: EMA_new = (Score_new × 0.2) + (EMA_current × 0.8)
            metrics.emaScore = (newScore * this.alpha) + (metrics.emaScore * (1 - this.alpha));
            metrics.totalFeedbackCount += 1;
            metrics.updatedAt = new Date();
        }

        await metrics.save();

        // Check alerting
        await this.checkAndAlert(driverId, metrics.emaScore, metrics);

        // Invalidate analytics cache
        this.analyticsCache.data = null;

        console.log(
            `[MetricsService] Driver ${driverId}: EMA=${metrics.emaScore.toFixed(2)}, ` +
            `Count=${metrics.totalFeedbackCount}`
        );

        return metrics;
    }

    /**
     * Checks if an alert should fire based on EMA threshold and cooldown.
     * Only triggers if EMA < 2.5 AND 1 hour has passed since last alert.
     */
    private async checkAndAlert(
        driverId: string,
        newEma: number,
        metrics: IDriverMetricsDocument
    ): Promise<void> {
        if (newEma >= this.alertThreshold) return;

        const now = new Date();
        const lastAlert = metrics.lastAlertTimestamp;

        if (lastAlert && (now.getTime() - lastAlert.getTime()) < this.alertCooldownMs) {
            console.log(
                `[MetricsService] Alert suppressed for ${driverId} ` +
                `(cooldown: ${Math.round((this.alertCooldownMs - (now.getTime() - lastAlert.getTime())) / 60000)}min remaining)`
            );
            return;
        }

        // Fire alert
        const alert = new Alert({
            driverId,
            emaScore: Math.round(newEma * 100) / 100,
            message: `⚠️ ALERT: Driver ${driverId} EMA dropped to ${newEma.toFixed(2)} (threshold: ${this.alertThreshold})`,
            timestamp: now,
        });

        await alert.save();

        // Update last alert timestamp on driver metrics
        metrics.lastAlertTimestamp = now;
        await metrics.save();

        console.log(`[MetricsService] 🚨 ALERT FIRED for driver ${driverId}: EMA=${newEma.toFixed(2)}`);
    }

    /**
     * Returns all driver metrics for the admin dashboard.
     * Cached in-memory for 60 seconds to reduce DB load.
     */
    public async getAnalytics(): Promise<IDriverMetricsDocument[]> {
        const now = Date.now();

        if (this.analyticsCache.data && (now - this.analyticsCache.timestamp) < this.CACHE_TTL_MS) {
            console.log('[MetricsService] Serving analytics from cache');
            return this.analyticsCache.data;
        }

        const data = await DriverMetrics.find({}).sort({ driverId: 1 });
        this.analyticsCache = { data, timestamp: now };
        console.log('[MetricsService] Analytics cache refreshed');
        return data;
    }

    /**
     * Returns recent alerts for the dashboard.
     */
    public async getAlerts(limit: number = 20): Promise<any[]> {
        return Alert.find({}).sort({ timestamp: -1 }).limit(limit);
    }

    /**
     * Returns detailed data for a single driver:
     * metrics, all feedbacks, and alerts.
     */
    public async getDriverDetail(driverId: string): Promise<{
        metrics: IDriverMetricsDocument | null;
        feedbacks: any[];
        alerts: any[];
    }> {
        const [metrics, feedbacks, alerts] = await Promise.all([
            DriverMetrics.findOne({ driverId }),
            Feedback.find({ driverId }).sort({ timestamp: -1 }).limit(50),
            Alert.find({ driverId }).sort({ timestamp: -1 }).limit(20),
        ]);

        return { metrics, feedbacks, alerts };
    }
}
