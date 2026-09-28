import React from 'react';
import { Menu, Plus, Sun, Moon, Download, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onOpenAddExpense?: () => void;
  onOpenPdfReport?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  onOpenAddExpense,
  onOpenPdfReport,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currencySymbol = CURRENCY_SYMBOLS[user?.currency || 'USD'] || '$';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#070B14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Currency Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium shadow-2xs">
          <Coins className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>{user?.currency || 'USD'} ({currencySymbol})</span>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" /> : <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />}
        </button>

        {/* Quick PDF Report Button */}
        {onOpenPdfReport && (
          <button
            type="button"
            onClick={onOpenPdfReport}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-500/40 transition-all shadow-2xs group"
          >
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            <span>PDF Export</span>
          </button>
        )}

        {/* Primary Add Expense Action */}
        {onOpenAddExpense && (
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        )}
      </div>
    </header>
  );
};
