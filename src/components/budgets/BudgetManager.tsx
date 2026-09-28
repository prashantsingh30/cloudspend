import React, { useState } from 'react';
import { Budget, Expense, CurrencyCode, ExpenseCategory } from '../../types';
import { formatCurrency, ALL_CATEGORIES, CATEGORY_COLORS } from '../../utils/formatters';
import { BudgetProgressBar } from '../dashboard/BudgetProgressBar';
import { Target, Calendar, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BudgetManagerProps {
  currentBudget: Budget | null;
  expenses: Expense[];
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  onSaveBudget: (amount: number) => Promise<void>;
  currency: CurrencyCode;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  currentBudget,
  expenses,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onSaveBudget,
  currency,
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(
    currentBudget ? currentBudget.amount.toString() : ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate month expenses
  const mStr = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
  const prefix = `${selectedYear}-${mStr}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(prefix));
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBudgetAmount = currentBudget?.amount || 0;

  // Category breakdown for this month
  const categorySpendingMap: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categorySpendingMap[e.category] = (categorySpendingMap[e.category] || 0) + e.amount;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budgetInput);
    if (isNaN(num) || num <= 0) {
      setError('Please specify a positive budget target greater than 0.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSaveBudget(parseFloat(num.toFixed(2)));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Month & Year Selection Bar */}
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
              Budget Period: {months[selectedMonth - 1]} {selectedYear}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
              Set spending limits and receive automatic warnings as you near the threshold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => {
              const m = parseInt(e.target.value, 10);
              onMonthChange(m, selectedYear);
            }}
            className="px-3 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden"
          >
            {months.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              const y = parseInt(e.target.value, 10);
              onMonthChange(selectedMonth, y);
            }}
            className="px-3 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden"
          >
            {[2025, 2026, 2027, 2028].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Budget Card */}
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5145E5] dark:text-[#A5A0FF]">
              Monthly Ceiling
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-[#151A2D] dark:text-[#F4F6FF] tabular-nums font-mono-nums mt-1">
              {currentBudgetAmount > 0
                ? formatCurrency(currentBudgetAmount, currency)
                : 'Not Set'}
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setBudgetInput(currentBudgetAmount > 0 ? currentBudgetAmount.toString() : '');
                setIsEditing(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all"
            >
              <Target className="w-4 h-4 mr-1.5" />
              <span>{currentBudgetAmount > 0 ? 'Modify Budget' : 'Set Monthly Budget'}</span>
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="p-4 bg-[#F7F8FC] dark:bg-[#17223A] rounded-xl border border-[#E7EAF2] dark:border-[#26334D] space-y-3">
            <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
              Enter target budget for {months[selectedMonth - 1]} {selectedYear} ({currency})
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 1200"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] font-mono-nums text-[#151A2D] dark:text-[#F4F6FF]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Apply'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#64748B] dark:text-[#A3AEC7] hover:bg-slate-200 dark:hover:bg-[#26334D] rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            {error && <p className="text-[11px] text-rose-500">{error}</p>}
          </form>
        )}

        {/* Visual Progress Bar */}
        <BudgetProgressBar
          spent={totalSpent}
          budget={currentBudgetAmount}
          currency={currency}
          onEditBudget={() => {
            setBudgetInput(currentBudgetAmount > 0 ? currentBudgetAmount.toString() : '');
            setIsEditing(true);
          }}
        />
      </div>

      {/* Category Consumption Breakdown */}
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
            Category Consumption Overview
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
            See which categories are consuming your {months[selectedMonth - 1]} allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_CATEGORIES.map((cat) => {
            const spentInCat = categorySpendingMap[cat] || 0;
            const percentageOfTotal = totalSpent > 0 ? Math.round((spentInCat / totalSpent) * 100) : 0;
            const percentageOfBudget = currentBudgetAmount > 0 ? Math.round((spentInCat / currentBudgetAmount) * 100) : 0;
            const catColor = CATEGORY_COLORS[cat] || '#64748B';

            return (
              <div
                key={cat}
                className="p-3 rounded-xl border border-[#E7EAF2] dark:border-[#26334D] bg-[#F7F8FC]/50 dark:bg-[#17223A]/30 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
                      {cat}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums font-mono-nums text-[#151A2D] dark:text-[#F4F6FF]">
                    {formatCurrency(spentInCat, currency)}
                  </span>
                </div>

                <div className="w-full bg-[#E7EAF2] dark:bg-[#26334D] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, percentageOfBudget)}%`,
                      backgroundColor: catColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#A3AEC7] mt-2">
                  <span>{percentageOfTotal}% of total spend</span>
                  {currentBudgetAmount > 0 && <span>{percentageOfBudget}% of budget</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
