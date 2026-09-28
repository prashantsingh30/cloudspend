import mongoose, { Schema, Document } from 'mongoose';

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecurringStatus = 'active' | 'paused';

export interface IRecurringPayment extends Document {
  userId: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  paymentMethod: string;
  wallet?: string;
  frequency: RecurringFrequency;
  nextDueDate: string; // YYYY-MM-DD
  status: RecurringStatus;
  notes?: string;
  lastPaidDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringPaymentSchema = new Schema<IRecurringPayment>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than zero'] },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    category: { type: String, required: true, trim: true },
    paymentMethod: { type: String, default: 'Cash', trim: true },
    wallet: { type: String, default: 'Cash', trim: true },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    nextDueDate: { type: String, required: true, index: true },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
    notes: { type: String, trim: true, maxlength: 300 },
    lastPaidDate: { type: String },
  },
  { timestamps: true }
);

RecurringPaymentSchema.index({ userId: 1, nextDueDate: 1 });

export const RecurringPayment =
  mongoose.models.RecurringPayment ||
  mongoose.model<IRecurringPayment>('RecurringPayment', RecurringPaymentSchema);
