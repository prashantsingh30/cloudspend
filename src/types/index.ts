export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Food'
  | 'Groceries'
  | 'Transportation'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Healthcare'
  | 'Education'
  | 'Entertainment'
  | 'Rent'
  | 'Travel'
  | 'Personal Care'
  | 'Other'
  | string;

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Business'
  | 'Rental Income'
  | 'Gifts'
  | 'Other Income'
  | string;

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Other'
  | string;

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  dateFormat?: string;
  themePreference?: string;
  avatar?: string;
  googleId?: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

// Backwards compatibility alias
export type Expense = Transaction;

export interface CategoryBudgetLimit {
  category: string;
  amount: number;
}

export interface Budget {
  id: string;
  userId: string;
  month: number; // 1 - 12
  year: number; // e.g. 2026
  amount: number;
  categoryLimits?: CategoryBudgetLimit[];
  createdAt?: string;
  updatedAt?: string;
}

export type WalletType = 'cash' | 'bank' | 'upi' | 'credit' | 'savings' | 'other';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  openingBalance: number;
  balance: number;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecurringStatus = 'active' | 'paused';

export interface RecurringPayment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: string;
  wallet?: string;
  frequency: RecurringFrequency;
  nextDueDate: string; // YYYY-MM-DD
  status: RecurringStatus;
  notes?: string;
  lastPaidDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totalMonthExpenses: number;
  totalMonthIncome: number;
  netBalance: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  transactionCount: number;
  averageDailySpend: number;
  previousMonthTotal?: number;
  percentageChangeFromLastMonth?: number;
  highestCategory?: {
    category: string;
    amount: number;
    percentage: number;
  };
  largestTransaction?: Transaction;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  incomeByCategory?: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  dailySpendingTrend: Array<{
    date: string;
    day: number;
    amount: number;
    income?: number;
  }>;
  upcomingRecurring?: Array<{
    id: string;
    name: string;
    amount: number;
    type: TransactionType;
    category: string;
    frequency: RecurringFrequency;
    nextDueDate: string;
    wallet?: string;
  }>;
}

export interface FilterParams {
  search: string;
  type?: 'all' | 'expense' | 'income';
  category: string;
  paymentMethod: string;
  wallet?: string;
  startDate: string;
  endDate: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}
