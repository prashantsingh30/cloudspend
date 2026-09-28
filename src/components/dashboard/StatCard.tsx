import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trendText,
  trendType = 'neutral',
  action,
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'negative':
        return 'text-rose-600 dark:text-rose-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-[#64748B] dark:text-[#A3AEC7]';
    }
  };

  return (
    <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-5 shadow-xs transition-colors duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#64748B] dark:text-[#A3AEC7]">
            {title}
          </span>
          <div className="p-2 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF]">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold tracking-tight text-[#151A2D] dark:text-[#F4F6FF] tabular-nums font-mono-nums truncate" title={value}>
            {value}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#E7EAF2]/60 dark:border-[#26334D]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          {trendText && (
            <span className={`font-semibold shrink-0 ${getTrendColor()}`}>
              {trendText}
            </span>
          )}
          {trendText && subtitle && <span className="text-[#64748B] dark:text-[#A3AEC7]" aria-hidden="true">·</span>}
          {subtitle && (
            <span className="text-[#64748B] dark:text-[#A3AEC7] truncate">
              {subtitle}
            </span>
          )}
        </div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-[11px] font-semibold text-[#5145E5] dark:text-[#A5A0FF] hover:underline shrink-0"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
