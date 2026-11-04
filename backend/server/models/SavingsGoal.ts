import mongoose, { Schema, Document } from 'mongoose';

export interface ISavingsGoal extends Document {
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  icon?: string;
  color?: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: true },
    category: { type: String, default: 'General' },
    icon: { type: String, default: 'Target' },
    color: { type: String, default: '#10b981' },
    isCompleted: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SavingsGoalModel = mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);
