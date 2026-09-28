import React from 'react';
import { Link } from 'react-router-dom';
import { Expense, CurrencyCode } from '../../types';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../../utils/formatters';
import { 
  ArrowRight, 
  Edit3, 
  Trash2, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Zap, 
  HeartPulse, 
  GraduationCap, 
  Tv, 
  Home, 
  Plane, 
  Smile, 
  HelpCircle,
  Receipt,
  Plus
} from 'lucide-react';

interface RecentTransactionsProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string, description: string) => void;
  onAddExpense?: () => void;
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case 'Food':
      return Utensils;
    case 'Groceries':
      return ShoppingBag;
    case 'Transportation':
      return Car;
    case 'Bills & Utilities':
      return Zap;
    case 'Healthcare':
      return HeartPulse;
    case 'Education':
      return GraduationCap;
    case 'Entertainment':
      return Tv;
    case 'Rent':
      return Home;
    case 'Travel':
      return Plane;
    case 'Personal Care':
      return Smile;
    case 'Shopping':
      return ShoppingBag;
    default:
      return HelpCircle;
  }
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  expenses,
  currency,
  onEdit,
  onDelete,
  onAddExpense,
}) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-[#E7EAF2] dark:border-[#26334D] rounded-2xl bg-[#F7F8FC]/50 dark:bg-[#111A2E]/50">
        <Receipt className="w-8 h-8 mx-auto text-[#64748B]/50 dark:text-[#A3AEC7]/50 mb-2" />
        <p className="text-xs font-heading font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
          No Transactions Logged Yet
        </p>
        <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7] mt-1 max-w-xs mx-auto">
          Start recording daily expenses to track your spending activity and itemized statements here.
        </p>
        {onAddExpense && (
          <button
            type="button"
            onClick={onAddExpense}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Expense</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
      {expenses.slice(0, 5).map((expense) => {
        const IconComponent = getCategoryIcon(expense.category);
        const catColor = CATEGORY_COLORS[expense.category] || '#6366F1';

        return (
          <div
            key={expense.id}
            className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-all duration-200"
          >
            {/* Left: Icon & Description */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border border-white/20 dark:border-white/5 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: `${catColor}15`, color: catColor }}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-mono text-[10px]">{formatDate(expense.date)}</span>
                  <span className="opacity-40" aria-hidden="true">·</span>
                  <span className="truncate px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                    {expense.category}
                  </span>
                  <span className="opacity-40 hidden sm:inline" aria-hidden="true">·</span>
                  <span className="hidden sm:inline font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    {expense.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Amount & Actions */}
            <div className="flex items-center gap-3.5 shrink-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tabular-nums font-mono-nums">
                -{formatCurrency(expense.amount, currency)}
              </span>

              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit expense"
                  aria-label="Edit expense"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(expense.id, expense.description)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete expense"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-3 text-center">
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
        >
          <span>View all itemized transactions</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
