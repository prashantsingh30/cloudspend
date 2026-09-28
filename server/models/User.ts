import mongoose, { Schema, Document } from 'mongoose';

export interface IUserCategory {
  name: string;
  type: 'expense' | 'income';
  color?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  dateFormat?: string;
  themePreference?: string;
  customCategories?: IUserCategory[];
  googleId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCategorySchema = new Schema<IUserCategory>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    color: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: false },
    currency: { type: String, default: 'USD', uppercase: true, enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD'] },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    themePreference: { type: String, default: 'system' },
    customCategories: [UserCategorySchema],
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
