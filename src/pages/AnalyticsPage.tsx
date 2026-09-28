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
              <div className="h-28 glass-card rounded-2xl animate-pulse" />
              <div className="h-80 glass-card rounded-2xl animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 glass-card rounded-2xl animate-pulse" />
                <div className="h-80 glass-card rounded-2xl animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              {/* Analytics Metric Highlights Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Analyzed</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">Current Cycle</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono-nums mt-2">
                    {formatCurrency(summary?.totalMonthExpenses || 0, user?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {expenses.length} transaction entries aggregated
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Average Spend</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">Pacing</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono-nums mt-2">
                    {formatCurrency(summary?.averageDailySpend || 0, user?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Estimated across active calendar days
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment Channels</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30">Instruments</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono-nums mt-2">
                    {paymentMethodData.length} Channels
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {paymentMethodData[0]?.method ? `Top instrument: ${paymentMethodData[0].method}` : 'No payment data logged'}
                  </p>
                </div>
              </div>

              {/* Daily Timeline Trend */}
              <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                        Daily Spending Curve (Current Month)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Track day-to-day expenditure to identify peak spending intervals and spikes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 pt-2">
                  <SpendingTrendsChart
                    data={summary?.dailySpendingTrend || []}
                    currency={user?.currency || 'USD'}
                  />
                </div>
              </div>

              {/* 2-Column Grid: Category Breakdown and Payment Methods */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Donut */}
                <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                        Category Distribution
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Proportional breakdown across all recorded spending types.
                      </p>
                    </div>
                  </div>
                  <CategoryDonutChart
                    data={summary?.spendingByCategory || []}
                    currency={user?.currency || 'USD'}
                  />
                </div>

                {/* Payment Method Distribution */}
                <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                        Spending by Payment Instrument
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Compare volume across UPI, Credit Card, Debit Card, Net Banking, and Cash.
                      </p>
                    </div>
                  </div>

                  {paymentMethodData.length === 0 ? (
                    <div className="h-56 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
                      No payment method data recorded yet.
                    </div>
                  ) : (
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={paymentMethodData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.6} />
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
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#fff',
                              fontSize: '12px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                            }}
                            formatter={(value: any) => [
                              formatCurrency(value, user?.currency || 'USD'),
                              'Amount',
                            ]}
                          />
                          <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} />
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
