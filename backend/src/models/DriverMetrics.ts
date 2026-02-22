import mongoose, { Schema } from 'mongoose';
import { IDriverMetricsDocument } from '../interfaces/IDriverMetrics';

const DriverMetricsSchema: Schema = new Schema(
    {
        driverId: { type: String, required: true, unique: true, index: true },
        emaScore: { type: Number, required: true, default: 3.0 },
        totalFeedbackCount: { type: Number, required: true, default: 0 },
        lastAlertTimestamp: { type: Date, default: null },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model<IDriverMetricsDocument>('DriverMetrics', DriverMetricsSchema);
