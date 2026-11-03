import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  userId: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  monthlyBudget?: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    icon: { type: String, default: 'Receipt' },
    color: { type: String, default: '#6366f1' },
    monthlyBudget: { type: Number, default: 0 },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
