import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatureFlagsDocument extends Document {
    configId: string;
    driverFeedback: boolean;
    tripFeedback: boolean;
    appFeedback: boolean;
    marshalFeedback: boolean;
    updatedAt: Date;
}

/**
 * Singleton document pattern — only one document with configId: 'global'.
 * Stores feature flags in MongoDB so they can be toggled at runtime
 * without code changes or server restarts.
 */
const featureFlagsSchema = new Schema<IFeatureFlagsDocument>(
    {
        configId: { type: String, default: 'global', unique: true },
        driverFeedback: { type: Boolean, default: true },
        tripFeedback: { type: Boolean, default: true },
        appFeedback: { type: Boolean, default: false },
        marshalFeedback: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IFeatureFlagsDocument>('FeatureFlags', featureFlagsSchema);
