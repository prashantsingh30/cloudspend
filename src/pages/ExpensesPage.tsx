import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Expense, FilterParams } from '../types';
import { AppSidebar } from '../components/common/AppSidebar';
import { AppHeader } from '../components/common/AppHeader';
import { ExpenseFilterBar } from '../components/expenses/ExpenseFilterBar';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { PdfReportModal } from '../components/reports/PdfReportModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Download, FileDown, Plus } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const defaultFilters: FilterParams = {
    search: '',
    category: 'all',
    paymentMethod: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date-desc',
  };
  const [filters, setFilters] = useState<FilterParams>(defaultFilters);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; desc: string }>({
    isOpen: false,
    id: '',
    desc: '',
  });

  const loadExpenses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.getExpenses(filters);
      setExpenses(data);
    } catch (err: any) {
      console.warn('Load expenses notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleFilterChange = (updated: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredTotal = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const handleSaveExpense = async (data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, data);
        showToast('Expense updated successfully.', 'success');
      } else {
        await api.createExpense(data);
        showToast('Expense recorded successfully.', 'success');
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      await loadExpenses();
    } catch (err: any) {
      showToast(err.message || 'Error saving expense.', 'error');
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await api.deleteExpense(deleteConfirm.id);
      showToast('Expense deleted successfully.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', desc: '' });
      await loadExpenses();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense.', 'error');
    }
  };

  const handleExportCsv = () => {
    if (expenses.length === 0) {
      showToast('No expenses to export.', 'warning');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount', 'Notes'];
    const rows = expenses.map((e) => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.paymentMethod,
      e.amount.toFixed(2),
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CloudSpend_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV statement downloaded.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] flex transition-colors duration-200">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AppHeader
          title="Expense Ledger"
          subtitle="Search, filter, categorize, and export your personal transactions."
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenPdfReport={() => setIsPdfModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5">
          {/* Action buttons bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                All Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed record of all debits and categorized outflows
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 glass-card hover:bg-slate-100/80 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all shadow-xs active:scale-[0.98]"
                title="Download CSV table"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 rounded-xl hover:bg-indigo-100/70 dark:hover:bg-indigo-500/25 transition-all shadow-xs active:scale-[0.98]"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF Statement</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <ExpenseFilterBar
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            filteredCount={expenses.length}
            filteredTotal={filteredTotal}
            currency={user?.currency || 'USD'}
          />

          {/* Expense Table */}
          <ExpenseTable
            expenses={expenses}
            currency={user?.currency || 'USD'}
            onEdit={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDelete={(id, desc) => {
              setDeleteConfirm({ isOpen: true, id, desc });
            }}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
        currency={user?.currency || 'USD'}
      />

      {/* PDF Export Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        expenses={expenses}
        currency={user?.currency || 'USD'}
        userName={user?.name || 'Account Holder'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', desc: '' })}
        onConfirm={handleDeleteExpense}
        title="Delete Transaction Record"
        message={`Are you sure you want to delete "${deleteConfirm.desc}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger={true}
      />
    </div>
  );
};
