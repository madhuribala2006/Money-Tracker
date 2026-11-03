import mongoose, { Schema, Document } from 'mongoose';

export type BillFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';

export interface IBill extends Document {
  userId: string;
  title: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  category: string;
  isPaid: boolean;
  paidAt?: Date;
  dueDay?: number;
  lastPaymentMethod?: 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking';
  reminderDaysBefore: number; // e.g. 2 days before
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true, index: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'one-time'],
      default: 'monthly',
    },
    category: { type: String, default: 'Bills & Utilities' },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    dueDay: { type: Number, min: 1, max: 31 },
    lastPaymentMethod: {
      type: String,
      enum: ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking'],
    },
    reminderDaysBefore: { type: Number, default: 3 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BillModel = mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
