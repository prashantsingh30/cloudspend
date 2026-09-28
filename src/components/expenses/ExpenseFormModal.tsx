import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Expense, ExpenseCategory, PaymentMethod, CurrencyCode } from '../../types';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS, CURRENCY_SYMBOLS } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onSave?: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Expense | null;
  currency?: CurrencyCode;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSave,
  initialData,
  currency,
}) => {
  const { user } = useAuth();
  const activeCurrency = currency || user?.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] || '$';

  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod);
      setNotes(initialData.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setCategory('Food');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Cash');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid positive amount greater than 0';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length > 100) {
      errs.description = 'Description cannot exceed 100 characters';
    }

    if (!date) {
      errs.date = 'Date is required';
    } else {
      const selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        errs.date = 'Please enter a valid date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const action = onSave || onSubmit;
    if (!action) return;

    setIsSubmitting(true);
    try {
      await action({
        type: (initialData?.type || 'expense') as 'expense' | 'income',
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        description: description.trim(),
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch {
      // Handled via toast in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense Record' : 'Record New Expense'}
      description="Enter transaction details to track spending against your monthly budget."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount with Currency Prefix */}
        <div>
          <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
            Amount ({activeCurrency}) *
          </label>
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#A3AEC7] font-mono-nums font-semibold text-sm">
              {currencySymbol}
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] font-mono-nums focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.amount}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
            Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Grocery Restock, Metro Card, Internet Bill"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
          />
          {errors.description && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.description}</p>
          )}
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
            >
              {ALL_PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
            Transaction Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
          />
          {errors.date && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.date}</p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
            Notes <span className="text-[#64748B] dark:text-[#A3AEC7] font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Add context, store details, or tags..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent resize-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF2] dark:border-[#26334D]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving...'
              : initialData
              ? 'Update Expense'
              : 'Record Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
