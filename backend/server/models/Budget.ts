import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  category: string; // Category name or 'Overall'
  amount: number; // Allocated budget limit in INR
  period: 'monthly' | 'weekly';
  month: string; // e.g. '2026-10'
  alertThreshold: number; // e.g. 80 for 80%
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
    month: { type: String, default: () => new Date().toISOString().slice(0, 7) },
    alertThreshold: { type: Number, default: 80 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BudgetModel = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
