import React from 'react';
import { DashboardSummary, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Lightbulb, TrendingUp, AlertTriangle, Trophy, Calendar } from 'lucide-react';

interface RuleBasedInsightsProps {
  summary: DashboardSummary;
  currency: CurrencyCode;
}

export const RuleBasedInsights: React.FC<RuleBasedInsightsProps> = ({ summary, currency }) => {
  const insights: Array<{
    id: string;
    title: string;
    description: string;
    icon: any;
    tone: 'info' | 'warning' | 'positive';
  }> = [];

  // 1. Highest Spending Category
  if (summary.highestCategory && summary.highestCategory.amount > 0) {
    insights.push({
      id: 'highest-cat',
      title: `${summary.highestCategory.category} leads spending`,
      description: `Accounts for ${summary.highestCategory.percentage}% of this month's expenses (${formatCurrency(summary.highestCategory.amount, currency)}).`,
      icon: Trophy,
      tone: 'info',
    });
  }

  // 2. Budget Pace / Overspending
  if (summary.monthlyBudget > 0) {
    if (summary.budgetUsedPercentage >= 100) {
      insights.push({
        id: 'budget-exceeded',
        title: 'Monthly budget ceiling exceeded',
        description: `You have consumed ${summary.budgetUsedPercentage}% of your planned budget. Review upcoming discretionary purchases.`,
        icon: AlertTriangle,
        tone: 'warning',
      });
    } else if (summary.budgetUsedPercentage >= 80) {
      insights.push({
        id: 'budget-warning',
        title: 'Approaching monthly budget threshold',
        description: `Currently at ${summary.budgetUsedPercentage}% utilization with ${formatCurrency(summary.remainingBudget, currency)} remaining.`,
        icon: AlertTriangle,
        tone: 'warning',
      });
    }
  }

  // 3. Month over Month Change
  if (summary.percentageChangeFromLastMonth !== undefined) {
    const isHigher = summary.percentageChangeFromLastMonth > 0;
    insights.push({
      id: 'mom-trend',
      title: isHigher ? 'Spending higher than last cycle' : 'Spending lower than last cycle',
      description: `${Math.abs(summary.percentageChangeFromLastMonth)}% ${
        isHigher ? 'increase' : 'decrease'
      } compared to total spending at this stage last month.`,
      icon: TrendingUp,
      tone: isHigher ? 'warning' : 'positive',
    });
  }

  // 4. Largest Transaction
  if (summary.largestTransaction) {
    insights.push({
      id: 'largest-tx',
      title: 'Peak single expense',
      description: `"${summary.largestTransaction.description}" was your highest single transaction at ${formatCurrency(summary.largestTransaction.amount, currency)}.`,
      icon: Calendar,
      tone: 'info',
    });
  }

  if (insights.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#111A2E] border border-dashed border-[#E7EAF2] dark:border-[#26334D] text-xs text-[#64748B] dark:text-[#A3AEC7] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold text-[#151A2D] dark:text-[#F4F6FF]">More Transactions Needed for Insights</p>
          <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7] mt-0.5">
            Log at least 2 transactions this month to generate smart spending velocity calculations and category alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {insights.map((item) => {
        const Icon = item.icon;
        const isWarning = item.tone === 'warning';
        const isPositive = item.tone === 'positive';

        return (
          <div
            key={item.id}
            className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
              isWarning
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                : isPositive
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-[#F7F8FC] dark:bg-[#17223A] border-[#E7EAF2] dark:border-[#26334D] text-[#151A2D] dark:text-[#F4F6FF]'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                isWarning
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                  : isPositive
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p
                className={`mt-0.5 leading-relaxed text-[11px] ${
                  isWarning
                    ? 'text-amber-800 dark:text-amber-300/80'
                    : isPositive
                    ? 'text-emerald-800 dark:text-emerald-300/80'
                    : 'text-[#64748B] dark:text-[#A3AEC7]'
                }`}
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
