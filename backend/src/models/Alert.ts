import mongoose, { Schema } from 'mongoose';
import { IAlertDocument } from '../interfaces/IAlert';

const AlertSchema: Schema = new Schema(
    {
        driverId: { type: String, required: true, index: true },
        emaScore: { type: Number, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model<IAlertDocument>('Alert', AlertSchema);
