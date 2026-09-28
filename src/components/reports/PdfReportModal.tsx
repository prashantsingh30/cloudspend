import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Expense, Budget, User, CurrencyCode } from '../../types';
import { formatCurrency, getCurrentMonthRange, getPreviousMonthRange } from '../../utils/formatters';
import { generateExpensePdfReport } from '../../services/pdfGenerator';
import { useToast } from '../../context/ToastContext';
import { FileDown, Calendar, AlertCircle, FileText } from 'lucide-react';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  userName?: string;
  currency?: CurrencyCode;
  expenses: Expense[];
  currentBudget?: Budget | null;
  budget?: Budget | null;
}

type PeriodOption = 'current-month' | 'previous-month' | 'custom' | 'all';

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  user,
  userName,
  currency,
  expenses,
  currentBudget,
  budget,
}) => {
  const [period, setPeriod] = useState<PeriodOption>('current-month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const finalUserName = userName || user?.name || 'Account Holder';
  const finalCurrency = currency || user?.currency || 'USD';
  const finalBudget = currentBudget ?? budget ?? null;

  const currentMonth = getCurrentMonthRange();
  const prevMonth = getPreviousMonthRange();

  // Filter expenses according to choice
  let filteredExpenses: Expense[] = [];
  let periodLabel = '';

  if (period === 'current-month') {
    filteredExpenses = expenses.filter(
      (e) => e.date >= currentMonth.startDate && e.date <= currentMonth.endDate
    );
    periodLabel = `Month ${currentMonth.month}/${currentMonth.year}`;
  } else if (period === 'previous-month') {
    filteredExpenses = expenses.filter(
      (e) => e.date >= prevMonth.startDate && e.date <= prevMonth.endDate
    );
    periodLabel = `Month ${prevMonth.month}/${prevMonth.year}`;
  } else if (period === 'custom') {
    filteredExpenses = expenses.filter((e) => {
      if (customStart && e.date < customStart) return false;
      if (customEnd && e.date > customEnd) return false;
      return true;
    });
    periodLabel = `${customStart || 'Start'} to ${customEnd || 'Present'}`;
  } else {
    filteredExpenses = [...expenses];
    periodLabel = 'Complete Expense History';
  }

  // Sort descending by date
  filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDownload = async () => {
    if (filteredExpenses.length === 0) {
      showToast('No matching transactions found for this period to generate a statement.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      generateExpensePdfReport({
        userName: finalUserName,
        currency: finalCurrency,
        period: periodLabel,
        expenses: filteredExpenses,
        budget: period === 'current-month' ? finalBudget : null,
      });
      showToast('Verified PDF report generated successfully.', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate PDF report.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download PDF Expense Statement"
      description="Compile itemized expenses and categorical summaries into a formal PDF report."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Date Filter Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-2">
            Select Statement Range
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'current-month', label: 'Current Month' },
              { id: 'previous-month', label: 'Previous Month' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom Range' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id as PeriodOption)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                  period === opt.id
                    ? 'border-[#5145E5] bg-[#5145E5]/10 text-[#5145E5] dark:text-[#A5A0FF] font-semibold'
                    : 'border-[#E7EAF2] dark:border-[#26334D] bg-[#F7F8FC] dark:bg-[#17223A] text-[#64748B] dark:text-[#A3AEC7] hover:border-[#5145E5]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers */}
        {period === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F7F8FC] dark:bg-[#17223A] rounded-xl border border-[#E7EAF2] dark:border-[#26334D]">
            <div>
              <label className="block text-[11px] font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-lg text-[#151A2D] dark:text-[#F4F6FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-lg text-[#151A2D] dark:text-[#F4F6FF]"
              />
            </div>
          </div>
        )}

        {/* Summary Preview Box */}
        <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] dark:text-[#A3AEC7]">Included Transactions:</span>
            <span className="font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
              {filteredExpenses.length} entries
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] dark:text-[#A3AEC7]">Total Statement Sum:</span>
            <span className="font-bold font-mono text-[#5145E5] dark:text-[#A5A0FF] text-sm">
              {formatCurrency(totalAmount, finalCurrency)}
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/15 border border-[#5145E5]/20 text-xs text-[#5145E5] dark:text-[#A5A0FF] flex items-start gap-2.5">
          <FileText className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Report is rendered client-side directly in your browser. No financial records are transmitted or stored on third-party servers.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF2] dark:border-[#26334D]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating || filteredExpenses.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Compiling PDF...' : 'Download Statement'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
