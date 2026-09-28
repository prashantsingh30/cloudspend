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
    <div className="divide-y divide-[#E7EAF2]/80 dark:divide-[#26334D]/80">
      {expenses.slice(0, 5).map((expense) => {
        const IconComponent = getCategoryIcon(expense.category);
        const catColor = CATEGORY_COLORS[expense.category] || '#5145E5';

        return (
          <div
            key={expense.id}
            className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:bg-[#F1F4F9]/60 dark:hover:bg-[#17223A]/50 px-2 rounded-xl transition-colors"
          >
            {/* Left: Icon & Description */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: `${catColor}15`, color: catColor }}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#A3AEC7] mt-0.5">
                  <span>{formatDate(expense.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{expense.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="hidden sm:inline text-[#64748B]/70 dark:text-[#A3AEC7]/70 font-mono text-[10px]">
                    {expense.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Amount & Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs sm:text-sm font-bold text-[#151A2D] dark:text-[#F4F6FF] tabular-nums font-mono-nums">
                -{formatCurrency(expense.amount, currency)}
              </span>

              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5145E5] dark:text-[#A3AEC7] dark:hover:text-[#A5A0FF] hover:bg-[#F1F4F9] dark:hover:bg-[#17223A] transition-colors"
                  title="Edit expense"
                  aria-label="Edit expense"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(expense.id, expense.description)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 dark:text-[#A3AEC7] dark:hover:text-rose-400 hover:bg-[#F1F4F9] dark:hover:bg-[#17223A] transition-colors"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5145E5] dark:text-[#A5A0FF] hover:text-[#4338CA] transition-colors"
        >
          <span>View all expenses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
