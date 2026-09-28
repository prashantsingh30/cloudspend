import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ExpenseCategory, CurrencyCode } from '../../types';
import { CATEGORY_COLORS, formatCurrency } from '../../utils/formatters';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryDonutChartProps {
  data: Array<{
    category: ExpenseCategory;
    amount: number;
    count: number;
    percentage: number;
  }>;
  currency: CurrencyCode;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, currency }) => {
  if (!data || data.length === 0 || data.every((d) => d.amount === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#E7EAF2] dark:border-[#26334D] rounded-2xl bg-[#F7F8FC]/50 dark:bg-[#111A2E]/50">
        <div className="w-12 h-12 rounded-2xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] flex items-center justify-center mb-3">
          <PieIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-heading font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
          No Category Breakdown Yet
        </p>
        <p className="text-xs text-[#64748B] dark:text-[#A3AEC7] mt-1 max-w-sm">
          Expenses will automatically categorize into Groceries, Bills, Food, Transportation, and more upon logging.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#10172A] text-white p-3 rounded-xl shadow-xl text-xs border border-[#26334D]">
          <p className="font-heading font-semibold text-[#F4F6FF] mb-1">{item.category}</p>
          <p className="tabular-nums font-mono-nums font-bold text-[#A5A0FF]">
            {formatCurrency(item.amount, currency)} ({item.percentage}%)
          </p>
          <p className="text-[#A3AEC7] text-[10px] mt-0.5">
            {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Chart container */}
      <div className="h-56 w-56 shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || '#64748B'}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Category Legend */}
      <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-56 pr-2">
        {data.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between text-xs py-1.5 border-b border-[#E7EAF2]/60 dark:border-[#26334D]/60 last:border-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748B' }}
              />
              <span className="text-[#151A2D] dark:text-[#F4F6FF] font-medium truncate">
                {item.category}
              </span>
            </div>
            <div className="flex items-center gap-3 tabular-nums font-mono-nums shrink-0">
              <span className="text-[#64748B] dark:text-[#A3AEC7] text-[11px]">
                {item.percentage}%
              </span>
              <span className="font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
