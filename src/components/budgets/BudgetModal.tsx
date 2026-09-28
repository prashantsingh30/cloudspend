import React, { useState } from 'react';
import { X, Sliders, DollarSign } from 'lucide-react';
import { CurrencyCode } from '../../types';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: number;
  month: number;
  year: number;
  currency: CurrencyCode;
  onSave: (amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentAmount,
  month,
  year,
  currency,
  onSave,
}) => {
  const [amountStr, setAmountStr] = useState<string>(currentAmount > 0 ? currentAmount.toString() : '');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1] || 'Current Month';
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid budget amount greater than zero.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSave(val);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update monthly budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#10172A]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white dark:bg-[#111A2E] rounded-2xl border border-[#E7EAF2] dark:border-[#26334D] shadow-2xl overflow-hidden z-10 transition-colors my-auto">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E7EAF2] dark:border-[#26334D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF] truncate">
                {currentAmount > 0 ? 'Adjust Monthly Budget' : 'Set Monthly Budget'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#A3AEC7] truncate">
                {monthName} {year} · {currency}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#17223A] shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
              Monthly Spending Target ({currencySymbol})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#A3AEC7] font-semibold text-sm">
                {currencySymbol}
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                placeholder="e.g. 1500.00"
                className="w-full pl-8 pr-4 py-2.5 text-sm font-semibold rounded-xl bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent tabular-nums"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7] mt-1.5 leading-relaxed">
              CloudSpend will track your daily expense velocity and notify you at 80% caution and 100% threshold caps.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#A3AEC7] block mb-1.5">
              Quick Suggestions
            </span>
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountStr(preset.toString())}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#E7EAF2] dark:border-[#26334D] bg-[#F7F8FC] dark:bg-[#17223A] text-[#64748B] dark:text-[#A3AEC7] hover:text-[#5145E5] dark:hover:text-[#A5A0FF] hover:border-[#5145E5] transition-colors"
                >
                  {currencySymbol}{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7EAF2] dark:border-[#26334D] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#64748B] dark:text-[#A3AEC7] hover:text-[#151A2D] dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
