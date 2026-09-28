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
  const getBadgeStyle = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';
      case 'negative':
        return 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60';
      case 'warning':
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
      default:
        return 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60';
    }
  };

  const getIconGlow = () => {
    switch (trendType) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'negative':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-xs">
      {/* Subtle decorative ambient corner glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          <div className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${getIconGlow()}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums font-mono-nums truncate" title={value}>
            {value}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {trendText && (
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold shrink-0 ${getBadgeStyle()}`}>
              {trendText}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
              {subtitle}
            </span>
          )}
        </div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline shrink-0"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
