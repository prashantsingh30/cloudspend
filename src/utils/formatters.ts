import { ExpenseCategory, IncomeCategory, CurrencyCode, PaymentMethod, Transaction } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
};

export const ALL_EXPENSE_CATEGORIES: string[] = [
  'Food',
  'Groceries',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Entertainment',
  'Rent',
  'Travel',
  'Personal Care',
  'Other',
];

// Backwards compatibility alias
export const ALL_CATEGORIES = ALL_EXPENSE_CATEGORIES;

export const ALL_INCOME_CATEGORIES: string[] = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Rental Income',
  'Gifts',
  'Other Income',
];

export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other',
];

export const DEFAULT_WALLETS = [
  'Cash',
  'Main Bank Account',
  'UPI',
  'Credit Card',
  'Savings Account',
];

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const num = Math.abs(amount);

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getCurrentMonthRange(): { startDate: string; endDate: string; month: number; year: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const lastDay = new Date(year, month, 0).getDate();

  const mStr = month < 10 ? `0${month}` : `${month}`;
  const startDate = `${year}-${mStr}-01`;
  const endDate = `${year}-${mStr}-${lastDay < 10 ? `0${lastDay}` : lastDay}`;

  return { startDate, endDate, month, year };
}

export function getPreviousMonthRange(): { startDate: string; endDate: string; month: number; year: number } {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  const lastDay = new Date(year, month, 0).getDate();
  const mStr = month < 10 ? `0${month}` : `${month}`;
  const startDate = `${year}-${mStr}-01`;
  const endDate = `${year}-${mStr}-${lastDay < 10 ? `0${lastDay}` : lastDay}`;

  return { startDate, endDate, month, year };
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B',
  Groceries: '#10B981',
  Transportation: '#3B82F6',
  Shopping: '#EC4899',
  'Bills & Utilities': '#6366F1',
  Healthcare: '#EF4444',
  Education: '#8B5CF6',
  Entertainment: '#14B8A6',
  Rent: '#F97316',
  Travel: '#06B6D4',
  'Personal Care': '#D946EF',
  Other: '#64748B',
  Salary: '#10B981',
  Freelance: '#3B82F6',
  Investment: '#8B5CF6',
  Business: '#F59E0B',
  'Rental Income': '#06B6D4',
  Gifts: '#EC4899',
  'Other Income': '#64748B',
};

// CSV Export Helper
export function exportToCsv(transactions: Transaction[], filename: string = 'CloudSpend_Transactions.csv'): void {
  const headers = ['Date', 'Type', 'Description', 'Category', 'Payment Method', 'Wallet', 'Amount', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    t.type || 'expense',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.paymentMethod || 'Cash').replace(/"/g, '""')}"`,
    `"${(t.wallet || 'Cash').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// CSV Parsing Helper
export interface ParsedCsvRow {
  date: string;
  type: 'expense' | 'income';
  description: string;
  category: string;
  paymentMethod: string;
  wallet: string;
  amount: number;
  notes?: string;
  isValid: boolean;
  error?: string;
}

export function parseCsvContent(text: string): ParsedCsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('title') || h.includes('item'));
  const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('price') || h.includes('cost'));
  const catIdx = headers.findIndex((h) => h.includes('cat'));
  const typeIdx = headers.findIndex((h) => h.includes('type'));
  const methodIdx = headers.findIndex((h) => h.includes('method') || h.includes('pay'));
  const walletIdx = headers.findIndex((h) => h.includes('wallet') || h.includes('account'));
  const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('comment'));

  const results: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split with quote awareness
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawLine))) {
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      matches.push(val.trim());
      if (regex.lastIndex >= rawLine.length) break;
    }

    if (matches.length === 0) continue;

    const rawDate = dateIdx >= 0 ? matches[dateIdx] : '';
    const rawDesc = descIdx >= 0 ? matches[descIdx] : '';
    const rawAmount = amountIdx >= 0 ? matches[amountIdx] : '';
    const rawCat = catIdx >= 0 ? matches[catIdx] : 'Other';
    const rawType = typeIdx >= 0 ? matches[typeIdx]?.toLowerCase() : 'expense';
    const rawMethod = methodIdx >= 0 ? matches[methodIdx] : 'Cash';
    const rawWallet = walletIdx >= 0 ? matches[walletIdx] : 'Cash';
    const rawNotes = notesIdx >= 0 ? matches[notesIdx] : '';

    const numAmount = parseFloat(rawAmount.replace(/[^0-9.-]/g, ''));
    let isValid = true;
    let error: string | undefined;

    if (!rawDate || isNaN(new Date(rawDate).getTime())) {
      isValid = false;
      error = 'Invalid date format';
    } else if (!rawDesc) {
      isValid = false;
      error = 'Missing description';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      isValid = false;
      error = 'Invalid positive amount';
    }

    // Standardize date to YYYY-MM-DD
    let standardizedDate = rawDate;
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        standardizedDate = d.toISOString().slice(0, 10);
      }
    } catch {
      // keep raw
    }

    results.push({
      date: standardizedDate,
      type: rawType.includes('inc') ? 'income' : 'expense',
      description: rawDesc || 'Imported Transaction',
      category: rawCat || 'Other',
      paymentMethod: rawMethod || 'Cash',
      wallet: rawWallet || 'Cash',
      amount: isNaN(numAmount) ? 0 : Number(numAmount.toFixed(2)),
      notes: rawNotes,
      isValid,
      error,
    });
  }

  return results;
}
