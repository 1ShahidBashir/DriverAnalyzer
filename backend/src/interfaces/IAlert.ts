import { Document } from 'mongoose';

export interface IAlert {
    driverId: string;
    emaScore: number;
    message: string;
    timestamp: Date;
}

export interface IAlertDocument extends IAlert, Document { }
