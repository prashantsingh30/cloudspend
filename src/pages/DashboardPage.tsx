import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Expense, Budget, DashboardSummary } from '../types';
import { AppSidebar } from '../components/common/AppSidebar';
import { AppHeader } from '../components/common/AppHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { SpendingTrendsChart } from '../components/dashboard/SpendingTrendsChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { RuleBasedInsights } from '../components/dashboard/RuleBasedInsights';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { PdfReportModal } from '../components/reports/PdfReportModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { formatCurrency } from '../utils/formatters';
import { 
  DollarSign, 
  Receipt, 
  Target, 
  TrendingUp, 
  Plus, 
  Sliders,
  Wallet
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; desc: string }>({
    isOpen: false,
    id: '',
    desc: '',
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [sumResult, expResult, budResult] = await Promise.allSettled([
        api.getDashboardSummary(currentMonth, currentYear),
        api.getExpenses({ sortBy: 'date-desc' }),
        api.getBudget(currentMonth, currentYear),
      ]);

      const expList = expResult.status === 'fulfilled' ? expResult.value : [];
      const budData = budResult.status === 'fulfilled' ? budResult.value : null;

      if (expResult.status === 'fulfilled') {
        setAllExpenses(expList);
      }
      if (budResult.status === 'fulfilled') {
        setCurrentBudget(budData);
      }

      if (sumResult.status === 'fulfilled' && sumResult.value) {
        setSummary(sumResult.value);
      } else {
        // Synthesize summary locally from expList and budData
        const mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
        const prefix = `${currentYear}-${mStr}`;
        const curExps = expList.filter((e) => e.date.startsWith(prefix));
        const total = curExps.reduce((acc, curr) => acc + curr.amount, 0);
        const budgetAmt = budData?.amount || 0;
        const remaining = Math.max(0, budgetAmt - total);
        const usedPct = budgetAmt > 0 ? Math.round((total / budgetAmt) * 100) : 0;

        setSummary({
          totalMonthExpenses: Number(total.toFixed(2)),
          totalMonthIncome: 0,
          netBalance: -Number(total.toFixed(2)),
          monthlyBudget: budgetAmt,
          remainingBudget: Number(remaining.toFixed(2)),
          budgetUsedPercentage: usedPct,
          transactionCount: curExps.length,
          averageDailySpend: Number((total / Math.max(1, new Date().getDate())).toFixed(2)),
          previousMonthTotal: 0,
          spendingByCategory: [],
          dailySpendingTrend: [],
        });
      }
    } catch (err: any) {
      console.warn('Dashboard load notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentMonth, currentYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
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
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save expense.', 'error');
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await api.deleteExpense(deleteConfirm.id);
      showToast('Expense deleted successfully.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', desc: '' });
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense.', 'error');
    }
  };

  const handleSaveBudget = async (newAmount: number) => {
    try {
      const updated = await api.setBudget(currentMonth, currentYear, newAmount);
      setCurrentBudget(updated);
      showToast('Monthly budget target updated.', 'success');
      await loadData();
    } catch (err: any) {
      showToast('Failed to update budget target.', 'error');
      throw err;
    }
  };

  const isBrandNewUser = !isLoading && allExpenses.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] flex transition-colors duration-200">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AppHeader
          title="Financial Dashboard"
          subtitle={`Overview for ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}`}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenPdfReport={() => setIsPdfModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner for Zero-Data Users */}
          {isBrandNewUser && (
            <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] flex items-center justify-center shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                      Welcome to CloudSpend, {user?.name}!
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-[#A3AEC7] max-w-xl leading-relaxed">
                      Your database is ready. Begin by adding your first daily expense or setting a monthly spending ceiling to unlock automated pacing and charts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpense(null);
                      setIsExpenseModalOpen(true);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Expense</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#151A2D] dark:text-[#F4F6FF] bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] hover:bg-slate-100 dark:hover:bg-[#26334D] rounded-xl transition-all whitespace-nowrap"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Set Monthly Budget</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4 Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Month Expenses"
              value={formatCurrency(summary?.totalMonthExpenses || 0, user?.currency)}
              subtitle={
                (summary?.transactionCount || 0) > 0
                  ? summary?.percentageChangeFromLastMonth !== undefined
                    ? `${Math.abs(summary.percentageChangeFromLastMonth)}% ${
                        summary.percentageChangeFromLastMonth > 0 ? 'higher' : 'lower'
                      } vs last month`
                    : 'Current active cycle'
                  : 'No expenses logged this month'
              }
              trendText={
                summary?.percentageChangeFromLastMonth !== undefined
                  ? summary.percentageChangeFromLastMonth > 0
                    ? '+ MoM'
                    : '- MoM'
                  : undefined
              }
              trendType={
                summary?.percentageChangeFromLastMonth !== undefined
                  ? summary.percentageChangeFromLastMonth > 0
                    ? 'warning'
                    : 'positive'
                  : 'neutral'
              }
              icon={DollarSign}
            />

            <StatCard
              title="Monthly Budget"
              value={
                (summary?.monthlyBudget || 0) > 0
                  ? formatCurrency(summary?.monthlyBudget || 0, user?.currency)
                  : 'Not Set'
              }
              subtitle={
                (summary?.monthlyBudget || 0) > 0
                  ? `${summary?.budgetUsedPercentage}% utilized`
                  : 'Set limit to track pacing'
              }
              trendType={
                (summary?.budgetUsedPercentage || 0) >= 100
                  ? 'negative'
                  : (summary?.budgetUsedPercentage || 0) >= 80
                  ? 'warning'
                  : 'positive'
              }
              action={
                (summary?.monthlyBudget || 0) <= 0
                  ? {
                      label: 'Set Target',
                      onClick: () => setIsBudgetModalOpen(true),
                    }
                  : {
                      label: 'Adjust',
                      onClick: () => setIsBudgetModalOpen(true),
                    }
              }
              icon={Target}
            />

            <StatCard
              title="Remaining Budget"
              value={
                (summary?.monthlyBudget || 0) > 0
                  ? formatCurrency(summary?.remainingBudget || 0, user?.currency)
                  : formatCurrency(0, user?.currency)
              }
              subtitle={
                (summary?.monthlyBudget || 0) > 0
                  ? (summary?.budgetUsedPercentage || 0) >= 100
                    ? 'Budget cap exceeded'
                    : 'Available to spend'
                  : 'Requires budget target'
              }
              trendType={
                (summary?.monthlyBudget || 0) > 0 && (summary?.budgetUsedPercentage || 0) >= 100
                  ? 'negative'
                  : 'positive'
              }
              icon={Wallet}
            />

            <StatCard
              title="Transactions Logged"
              value={`${summary?.transactionCount || 0}`}
              subtitle={
                (summary?.transactionCount || 0) > 0
                  ? 'Verified entries this cycle'
                  : 'Awaiting first transaction'
              }
              icon={Receipt}
            />
          </div>

          {/* Budget Progress Card */}
          <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                  Monthly Budget Pacing
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                  Real-time consumption against your monthly spending ceiling
                </p>
              </div>
            </div>

            <BudgetProgressBar
              spent={summary?.totalMonthExpenses || 0}
              budget={summary?.monthlyBudget || 0}
              currency={user?.currency || 'USD'}
              onEditBudget={() => setIsBudgetModalOpen(true)}
            />
          </div>

          {/* Charts 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trends Area Chart */}
            <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                  Daily Spending Velocity
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                  Day-by-day transaction pattern for this month
                </p>
              </div>
              <SpendingTrendsChart
                data={summary?.dailySpendingTrend || []}
                currency={user?.currency || 'USD'}
              />
            </div>

            {/* Category Donut Chart */}
            <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                  Category Allocation
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                  Distribution across expense types
                </p>
              </div>
              <CategoryDonutChart
                data={summary?.spendingByCategory || []}
                currency={user?.currency || 'USD'}
              />
            </div>
          </div>

          {/* Bottom Row: Recent Transactions & Rule-Based Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions List (2 Cols on lg) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                    Recent Transactions
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                    Latest itemized spending records
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5145E5] dark:text-[#A5A0FF] hover:text-[#4338CA] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>

              <RecentTransactions
                expenses={allExpenses}
                currency={user?.currency || 'USD'}
                onEdit={(exp) => {
                  setEditingExpense(exp);
                  setIsExpenseModalOpen(true);
                }}
                onDelete={(id, desc) => {
                  setDeleteConfirm({ isOpen: true, id, desc });
                }}
                onAddExpense={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
              />
            </div>

            {/* Smart Rule-Based Insights (1 Col on lg) */}
            <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                  Spending Insights
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                  Rule-based alerts & financial habit metrics
                </p>
              </div>

              {summary && (
                <RuleBasedInsights summary={summary} currency={user?.currency || 'USD'} />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Expense Modal (Add / Edit) */}
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

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentAmount={currentBudget?.amount || summary?.monthlyBudget || 0}
        month={currentMonth}
        year={currentYear}
        currency={user?.currency || 'USD'}
        onSave={handleSaveBudget}
      />

      {/* PDF Export Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        expenses={allExpenses}
        budget={currentBudget}
        currency={user?.currency || 'USD'}
        userName={user?.name || 'Account Holder'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Expense"
        message={`Are you sure you want to permanently delete "${deleteConfirm.desc}"? This cannot be undone.`}
        confirmLabel="Delete Expense"
        cancelLabel="Keep Expense"
        isDanger={true}
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', desc: '' })}
      />
    </div>
  );
};
