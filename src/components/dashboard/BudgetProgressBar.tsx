import React from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { AlertCircle, AlertTriangle, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';

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
      <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              No Monthly Budget Configured
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Set a monthly spending limit to activate real-time budget pace warnings and safe-to-spend metrics.
            </p>
          </div>
        </div>
        {onEditBudget && (
          <button
            type="button"
            onClick={onEditBudget}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-xs transition-all shrink-0 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
          >
            Configure Budget
          </button>
        )}
      </div>
    );
  }

  const getGradientFill = () => {
    if (isOverspent) {
      return 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
    }
    if (isWarning) {
      return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    }
    return 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
  };

  const getStatusBadge = () => {
    if (isOverspent) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Ceiling Exceeded ({percentage}%)</span>
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cautionary Pace ({percentage}%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Healthy Pacing ({percentage}%)</span>
      </span>
    );
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {onEditBudget && (
          <button
            type="button"
            onClick={onEditBudget}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span>Adjust Ceiling</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress Bar Container with 80% warning threshold tick */}
      <div className="relative w-full h-3.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
        {/* 80% Threshold Notch Indicator */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-slate-400 dark:bg-slate-600 z-10 opacity-70"
          style={{ left: '80%' }}
          title="80% Cautionary Threshold Marker"
        />

        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getGradientFill()}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {/* Numeric Breakdown */}
      <div className="flex items-center justify-between text-xs tabular-nums font-mono-nums text-slate-500 dark:text-slate-400 pt-0.5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Spent This Month</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(spent, currency)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
            {isOverspent ? 'Over Ceiling by' : 'Remaining Room'}
          </span>
          <span
            className={`text-sm font-extrabold ${
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
