import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  category: string;
  nextBillingDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  serviceUrl?: string;
  planName?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    category: { type: String, default: 'Entertainment' },
    nextBillingDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
    },
    serviceUrl: { type: String, default: '' },
    planName: { type: String, default: 'Monthly plan' },
    paymentMethod: { type: String, default: 'UPI Autopay' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
