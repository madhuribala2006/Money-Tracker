import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'daily_limit' | 'budget_warning' | 'bill_due' | 'savings_milestone' | 'subscription' | 'system';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'urgent';
  relatedEntityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['daily_limit', 'budget_warning', 'bill_due', 'savings_milestone', 'subscription', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'normal', 'urgent'], default: 'normal' },
    relatedEntityId: { type: String, default: '' },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
