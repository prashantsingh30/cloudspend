import React from 'react';
import { Expense, CurrencyCode } from '../../types';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../../utils/formatters';
import { getCategoryIcon } from '../dashboard/RecentTransactions';
import { Edit3, Trash2, Receipt } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string, description: string) => void;
  isLoading?: boolean;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  currency,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-[#F7F8FC] dark:bg-[#17223A] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 flex items-center justify-center mx-auto text-[#5145E5] dark:text-[#A5A0FF] mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-heading font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
          No Expenses Found
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#A3AEC7] mt-1 max-w-sm mx-auto">
          No records match your active search filters or date range. Try clearing filters or record a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 dark:border-slate-800/90 transition-colors">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-900 dark:text-slate-100">
          <thead className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <tr>
              <th scope="col" className="px-5 py-3.5">Date</th>
              <th scope="col" className="px-5 py-3.5">Description</th>
              <th scope="col" className="px-5 py-3.5">Category</th>
              <th scope="col" className="px-5 py-3.5">Payment</th>
              <th scope="col" className="px-5 py-3.5 text-right">Amount</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {expenses.map((expense) => {
              const Icon = getCategoryIcon(expense.category);
              const catColor = CATEGORY_COLORS[expense.category] || '#6366F1';

              return (
                <tr
                  key={expense.id}
                  className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-150 group"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-5 py-3.5 font-medium max-w-xs">
                    <p className="truncate text-slate-900 dark:text-white font-semibold">{expense.description}</p>
                    {expense.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {expense.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border" style={{ borderColor: `${catColor}30`, backgroundColor: `${catColor}12`, color: catColor }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: catColor }}
                      />
                      <span>{expense.category}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right font-extrabold tabular-nums font-mono-nums text-slate-900 dark:text-white">
                    -{formatCurrency(expense.amount, currency)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit entry"
                        aria-label="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(expense.id, expense.description)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 dark:text-[#A3AEC7] dark:hover:text-rose-400 hover:bg-[#F1F4F9] dark:hover:bg-[#17223A] transition-colors"
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-[#E7EAF2] dark:divide-[#26334D]">
        {expenses.map((expense) => {
          const Icon = getCategoryIcon(expense.category);
          const catColor = CATEGORY_COLORS[expense.category] || '#5145E5';

          return (
            <div key={expense.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${catColor}15`, color: catColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[#151A2D] dark:text-[#F4F6FF]">
                      {expense.description}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7]">
                      {formatDate(expense.date)} · {expense.category}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#151A2D] dark:text-[#F4F6FF] font-mono-nums">
                  {formatCurrency(expense.amount, currency)}
                </span>
              </div>

              {expense.notes && (
                <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7] bg-[#F7F8FC] dark:bg-[#17223A] p-2 rounded-lg">
                  {expense.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#E7EAF2]/60 dark:border-[#26334D]/60 text-xs text-[#64748B] dark:text-[#A3AEC7]">
                <span>Payment: {expense.paymentMethod}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="p-1 rounded text-[#5145E5] dark:text-[#A5A0FF]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(expense.id, expense.description)}
                    className="p-1 rounded text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
