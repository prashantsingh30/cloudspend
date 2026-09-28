import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryLimit {
  category: string;
  amount: number;
}

export interface IBudget extends Document {
  userId: string;
  month: number;
  year: number;
  amount: number;
  categoryLimits?: ICategoryLimit[];
  createdAt: Date;
  updatedAt: Date;
}

const CategoryLimitSchema = new Schema<ICategoryLimit>(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, 'Limit cannot be negative'] },
  },
  { _id: false }
);

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020, max: 2100 },
    amount: { type: Number, required: true, min: [0.01, 'Budget must be greater than zero'] },
    categoryLimits: [CategoryLimitSchema],
  },
  { timestamps: true }
);

// Enforce single budget per month per user
BudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
