import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'expense' | 'income';

export interface IExpense extends Document {
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: string;
  wallet?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['expense', 'income'],
      default: 'expense',
      index: true,
    },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
    description: { type: String, required: true, trim: true, maxlength: 150 },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    date: { type: String, required: true, index: true },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
      default: 'Cash',
    },
    wallet: {
      type: String,
      trim: true,
      default: 'Cash',
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 500 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Compound indexes for user query performance
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, type: 1, date: -1 });

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
