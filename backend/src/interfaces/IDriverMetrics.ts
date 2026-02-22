import { Document } from 'mongoose';

export interface IDriverMetrics {
    driverId: string;
    emaScore: number;
    totalFeedbackCount: number;
    lastAlertTimestamp: Date | null;
    updatedAt: Date;
}

export interface IDriverMetricsDocument extends IDriverMetrics, Document { }
