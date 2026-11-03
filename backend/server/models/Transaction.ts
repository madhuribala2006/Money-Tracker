import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking';
export type TransactionType = 'expense' | 'income';

export interface ITransaction extends Document {
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
  merchant?: string;
  isEducational?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['expense', 'income'], required: true },
    category: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking'],
      default: 'UPI',
    },
    notes: { type: String, default: '' },
    merchant: { type: String, default: '' },
    isEducational: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
