import mongoose, { Schema } from 'mongoose';
import { IFeedbackDocument } from '../interfaces/IFeedback';

const FeedbackSchema: Schema = new Schema(
    {
        driverId: { type: String, required: true, index: true },
        feedbackType: {
            type: String,
            required: true,
            enum: ['driver', 'trip', 'app', 'marshal'],
        },
        text: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        sentimentScore: { type: Number, min: 1, max: 5 },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model<IFeedbackDocument>('Feedback', FeedbackSchema);
