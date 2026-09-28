import React from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { AlertCircle, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  currency: CurrencyCode;
  onEditBudget?: () => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  spent,
  budget,
  currency,
  onEditBudget,
}) => {
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOverspent = percentage >= 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const remaining = Math.max(0, budget - spent);
  const overspentAmount = Math.max(0, spent - budget);

  if (budget <= 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-[#E7EAF2] dark:border-[#26334D] bg-[#F7F8FC]/60 dark:bg-[#111A2E]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
              No Monthly Budget Configured
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7] mt-0.5">
              Set a monthly spending limit to activate real-time budget pace warnings and health indicators.
            </p>
          </div>
        </div>
        {onEditBudget && (
          <button
            type="button"
            onClick={onEditBudget}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
          >
            Set Budget
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOverspent ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Budget Exceeded ({percentage}%)</span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Approaching Budget Limit ({percentage}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>On Track ({percentage}%)</span>
            </div>
          )}
        </div>

        {onEditBudget && (
          <button
            type="button"
            onClick={onEditBudget}
            className="text-xs font-medium text-[#64748B] dark:text-[#A3AEC7] hover:text-[#5145E5] dark:hover:text-[#A5A0FF] transition-colors"
          >
            Adjust Budget
          </button>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-[#E7EAF2] dark:bg-[#26334D] rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverspent
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-[#5145E5]'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {/* Numeric Meta Breakdown */}
      <div className="flex items-center justify-between text-xs tabular-nums font-mono-nums text-[#64748B] dark:text-[#A3AEC7]">
        <div>
          <span className="text-[#64748B] dark:text-[#A3AEC7] text-[11px] block">Spent</span>
          <span className="font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
            {formatCurrency(spent, currency)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[#64748B] dark:text-[#A3AEC7] text-[11px] block">
            {isOverspent ? 'Over by' : 'Remaining'}
          </span>
          <span
            className={`font-semibold ${
              isOverspent
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isOverspent
              ? `+${formatCurrency(overspentAmount, currency)}`
              : formatCurrency(remaining, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
