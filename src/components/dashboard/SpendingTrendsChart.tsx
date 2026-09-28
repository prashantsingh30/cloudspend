import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyCode } from '../../types';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SpendingTrendsChartProps {
  data: Array<{ day: number; date: string; amount: number }>;
  currency: CurrencyCode;
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ data, currency }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0 || data.every((d) => d.amount === 0)) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#E7EAF2] dark:border-[#26334D] rounded-2xl bg-[#F7F8FC]/50 dark:bg-[#111A2E]/50">
        <div className="w-12 h-12 rounded-2xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] flex items-center justify-center mb-3">
          <BarChart2 className="w-6 h-6" />
        </div>
        <p className="text-sm font-heading font-semibold text-[#151A2D] dark:text-[#F4F6FF]">
          No Daily Spending Data Yet
        </p>
        <p className="text-xs text-[#64748B] dark:text-[#A3AEC7] mt-1 max-w-sm">
          Once you record expenses for this month, a continuous daily spending velocity curve will chart here automatically.
        </p>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    label: `Day ${d.day}`,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#10172A] text-white p-3 rounded-xl shadow-xl text-xs border border-[#26334D]">
          <p className="text-[#A3AEC7] text-[11px] mb-1">{payload[0].payload.date}</p>
          <p className="font-heading font-bold text-sm tabular-nums font-mono-nums text-[#A5A0FF]">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5145E5" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#5145E5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDark ? '#26334D' : '#E7EAF2'}
            opacity={0.8}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: isDark ? '#A3AEC7' : '#64748B' }}
            interval={2}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: isDark ? '#A3AEC7' : '#64748B' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#5145E5"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
