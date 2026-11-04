import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistItem extends Document {
  userId: string;
  title: string;
  estimatedPrice: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  savedSoFar: number;
  targetMonth?: string;
  productUrl?: string;
  notes?: string;
  isPurchased: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlistItem>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    estimatedPrice: { type: Number, required: true, min: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'Tech & Gadgets' },
    savedSoFar: { type: Number, default: 0 },
    targetMonth: { type: String, default: '' },
    productUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    isPurchased: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlistItem>('Wishlist', WishlistSchema);
