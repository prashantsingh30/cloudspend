import mongoose, { Schema, Document } from 'mongoose';

export type WalletType = 'cash' | 'bank' | 'upi' | 'credit' | 'savings' | 'other';

export interface IWallet extends Document {
  userId: string;
  name: string;
  type: WalletType;
  openingBalance: number;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    type: {
      type: String,
      required: true,
      enum: ['cash', 'bank', 'upi', 'credit', 'savings', 'other'],
      default: 'cash',
    },
    openingBalance: { type: Number, required: true, default: 0 },
    color: { type: String, default: '#5145E5' },
    icon: { type: String, default: 'Wallet' },
  },
  { timestamps: true }
);

WalletSchema.index({ userId: 1, name: 1 });

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
