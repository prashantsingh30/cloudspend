import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Expense, DashboardSummary } from '../types';
import { AppSidebar } from '../components/common/AppSidebar';
import { AppHeader } from '../components/common/AppHeader';
import { SpendingTrendsChart } from '../components/dashboard/SpendingTrendsChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { formatCurrency, ALL_PAYMENT_METHODS } from '../utils/formatters';
import { PdfReportModal } from '../components/reports/PdfReportModal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { TrendingUp, CreditCard, PieChart } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [sumResult, expResult] = await Promise.allSettled([
        api.getDashboardSummary(currentMonth, currentYear),
        api.getExpenses(),
      ]);

      const expList = expResult.status === 'fulfilled' ? expResult.value : [];
      setExpenses(expList);

      if (sumResult.status === 'fulfilled' && sumResult.value) {
        setSummary(sumResult.value);
      } else {
        const mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
        const prefix = `${currentYear}-${mStr}`;
        const curExps = expList.filter((e) => e.date.startsWith(prefix));
        const total = curExps.reduce((acc, curr) => acc + curr.amount, 0);

        setSummary({
          totalMonthExpenses: Number(total.toFixed(2)),
          totalMonthIncome: 0,
          netBalance: -Number(total.toFixed(2)),
          monthlyBudget: 0,
          remainingBudget: 0,
          budgetUsedPercentage: 0,
          transactionCount: curExps.length,
          averageDailySpend: Number((total / Math.max(1, new Date().getDate())).toFixed(2)),
          previousMonthTotal: 0,
          spendingByCategory: [],
          dailySpendingTrend: [],
        });
      }
    } catch (err: any) {
      console.warn('Analytics load notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentMonth, currentYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Payment method aggregation
  const paymentMethodData = React.useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.paymentMethod] = (map[e.paymentMethod] || 0) + e.amount;
    });

    return Object.entries(map).map(([method, amount]) => ({
      method,
      amount: Number(amount.toFixed(2)),
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-[#151A2D] dark:text-[#F4F6FF] flex transition-colors">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AppHeader
          title="Expense Analytics"
          subtitle="Visualize patterns across time, categories, and payment channels."
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenPdfReport={() => setIsPdfModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-64 bg-[#E7EAF2] dark:bg-[#17223A] rounded-2xl animate-pulse" />
              <div className="h-64 bg-[#E7EAF2] dark:bg-[#17223A] rounded-2xl animate-pulse" />
            </div>
          ) : (
            <>
              {/* Daily Timeline Trend */}
              <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#5145E5] dark:text-[#A5A0FF]" />
                  <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                    Daily Spending Curve (Current Month)
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                  Track day-to-day expenditure to identify peak spending intervals.
                </p>
                <SpendingTrendsChart
                  data={summary?.dailySpendingTrend || []}
                  currency={user?.currency || 'USD'}
                />
              </div>

              {/* 2-Column Grid: Category Breakdown and Payment Methods */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Donut */}
                <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#5145E5] dark:text-[#A5A0FF]" />
                    <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                      Category Distribution
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                    Proportional breakdown across all recorded spending types.
                  </p>
                  <CategoryDonutChart
                    data={summary?.spendingByCategory || []}
                    currency={user?.currency || 'USD'}
                  />
                </div>

                {/* Payment Method Distribution */}
                <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#5145E5] dark:text-[#A5A0FF]" />
                    <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
                      Spending by Payment Instrument
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
                    Compare volume across UPI, Credit Card, Debit Card, and Cash.
                  </p>

                  {paymentMethodData.length === 0 ? (
                    <div className="h-56 flex items-center justify-center text-xs text-[#64748B] dark:text-[#A3AEC7] border border-dashed border-[#E7EAF2] dark:border-[#26334D] rounded-xl bg-[#F7F8FC]/50 dark:bg-[#17223A]/30">
                      No payment method data recorded yet.
                    </div>
                  ) : (
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={paymentMethodData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF2" opacity={0.6} />
                          <XAxis
                            dataKey="method"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                          />
                          <Tooltip
                            formatter={(value: any) => [
                              formatCurrency(value, user?.currency || 'USD'),
                              'Amount',
                            ]}
                          />
                          <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {user && (
        <PdfReportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          user={user}
          expenses={expenses}
        />
      )}
    </div>
  );
};
