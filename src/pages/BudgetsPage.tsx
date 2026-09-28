import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Budget, Expense } from '../types';
import { AppSidebar } from '../components/common/AppSidebar';
import { AppHeader } from '../components/common/AppHeader';
import { BudgetManager } from '../components/budgets/BudgetManager';
import { PdfReportModal } from '../components/reports/PdfReportModal';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgetData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [budgetResult, expResult] = await Promise.allSettled([
        api.getBudget(selectedMonth, selectedYear),
        api.getExpenses(),
      ]);

      if (budgetResult.status === 'fulfilled') {
        setCurrentBudget(budgetResult.value);
      }
      if (expResult.status === 'fulfilled') {
        setExpenses(expResult.value);
      }
    } catch (err: any) {
      console.warn('Budgets load notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  const handleSaveBudget = async (amount: number) => {
    try {
      const updated = await api.setBudget(selectedMonth, selectedYear, amount);
      setCurrentBudget(updated);
      showToast('Monthly budget successfully updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update budget.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-[#151A2D] dark:text-[#F4F6FF] flex transition-colors">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AppHeader
          title="Budget Planning"
          subtitle="Configure monthly ceilings and monitor threshold limits."
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenPdfReport={() => setIsPdfModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 bg-[#E7EAF2] dark:bg-[#17223A] rounded-xl animate-pulse" />
              <div className="h-64 bg-[#E7EAF2] dark:bg-[#17223A] rounded-xl animate-pulse" />
            </div>
          ) : (
            <BudgetManager
              currentBudget={currentBudget}
              expenses={expenses}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
              onSaveBudget={handleSaveBudget}
              currency={user?.currency || 'USD'}
            />
          )}
        </main>
      </div>

      {user && (
        <PdfReportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          user={user}
          expenses={expenses}
          currentBudget={currentBudget}
        />
      )}
    </div>
  );
};
