import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface PriceAlertDocument extends Document {
    userId: string;
    symbol: string;
    company: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    active: boolean;
    createdAt: Date;
}

const PriceAlertSchema = new Schema<PriceAlertDocument>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
        alertName: { type: String, required: true, trim: true },
        alertType: { type: String, enum: ['upper', 'lower'], required: true },
        threshold: { type: Number, required: true, min: 0.01 },
        active: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const PriceAlert: Model<PriceAlertDocument> =
    (models?.PriceAlert as Model<PriceAlertDocument>) ||
    model<PriceAlertDocument>('PriceAlert', PriceAlertSchema);
