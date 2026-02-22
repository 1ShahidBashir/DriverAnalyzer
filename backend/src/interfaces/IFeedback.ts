import { Document } from 'mongoose';

export interface IFeedback {
    driverId: string;
    feedbackType: 'driver' | 'trip' | 'app' | 'marshal';
    text: string;
    rating: number;
    sentimentScore?: number;
    timestamp: Date;
}

export interface IFeedbackDocument extends IFeedback, Document { }
