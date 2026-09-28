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
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Budget Period:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{months[selectedMonth - 1]} {selectedYear}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set spending limits and receive automatic warnings as you near the threshold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <select
            value={selectedMonth}
            onChange={(e) => {
              const m = parseInt(e.target.value, 10);
              onMonthChange(m, selectedYear);
            }}
            className="px-3.5 py-2 text-xs bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 font-medium transition-all"
          >
            {months.map((name, idx) => (
              <option key={name} value={idx + 1} className="dark:bg-[#0B1020]">
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
            className="px-3.5 py-2 text-xs bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 font-medium transition-all"
          >
            {[2025, 2026, 2027, 2028].map((yr) => (
              <option key={yr} value={yr} className="dark:bg-[#0B1020]">
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Budget Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Target className="w-3 h-3" />
              <span>Monthly Ceiling</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono-nums tracking-tight">
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
              className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Target className="w-4 h-4 mr-2" />
              <span>{currentBudgetAmount > 0 ? 'Modify Target' : 'Set Monthly Budget'}</span>
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="p-4 bg-slate-50/80 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-3 relative z-10 backdrop-blur-sm">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white">
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
                className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-[#0B1020] border border-slate-200/80 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 font-mono-nums text-slate-900 dark:text-white transition-all"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Apply'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
          </form>
        )}

        {/* Visual Progress Bar */}
        <div className="relative z-10">
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
      </div>

      {/* Category Consumption Breakdown */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
              Category Consumption Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed tracking of how discretionary capital is distributed across categories for {months[selectedMonth - 1]}.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            {ALL_CATEGORIES.length} Categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ALL_CATEGORIES.map((cat) => {
            const spentInCat = categorySpendingMap[cat] || 0;
            const percentageOfTotal = totalSpent > 0 ? Math.round((spentInCat / totalSpent) * 100) : 0;
            const percentageOfBudget = currentBudgetAmount > 0 ? Math.round((spentInCat / currentBudgetAmount) * 100) : 0;
            const catColor = CATEGORY_COLORS[cat] || '#64748B';

            return (
              <div
                key={cat}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.05] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums font-mono-nums text-slate-900 dark:text-white">
                    {formatCurrency(spentInCat, currency)}
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, percentageOfBudget)}%`,
                      backgroundColor: catColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2.5">
                  <span>{percentageOfTotal}% of total spend</span>
                  {currentBudgetAmount > 0 && <span className="font-medium">{percentageOfBudget}% of budget</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
