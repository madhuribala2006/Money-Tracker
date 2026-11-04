import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  university?: string;
  studentId?: string;
  course?: string;
  currency: string;
  dailySpendingLimit: number;
  monthlyAllowance: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    university: { type: String, default: '' },
    studentId: { type: String, default: '' },
    course: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    dailySpendingLimit: { type: Number, default: 400 },
    monthlyAllowance: { type: Number, default: 0 },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
