import mongoose, { Schema, Document } from 'mongoose';

export type EducationExpenseType = 'Tuition Fee' | 'Books & Materials' | 'Hostel & Mess' | 'Exam Fee' | 'Lab Supplies' | 'Tech & Equipment' | 'Other';

export interface IEducationExpense extends Document {
  userId: string;
  title: string;
  amount: number;
  type: EducationExpenseType;
  academicYear: string; // e.g. "Year 2, Semester 4"
  dueDate?: Date;
  paidDate?: Date;
  isPaid: boolean;
  institution: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationExpenseSchema = new Schema<IEducationExpense>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['Tuition Fee', 'Books & Materials', 'Hostel & Mess', 'Exam Fee', 'Lab Supplies', 'Tech & Equipment', 'Other'],
      default: 'Tuition Fee',
    },
    academicYear: { type: String, default: 'Year 2, Semester 4' },
    dueDate: { type: Date },
    paidDate: { type: Date },
    isPaid: { type: Boolean, default: false },
    institution: { type: String, default: 'National Institute of Technology' },
    receiptNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const EducationExpenseModel = mongoose.models.EducationExpense || mongoose.model<IEducationExpense>('EducationExpense', EducationExpenseSchema);
