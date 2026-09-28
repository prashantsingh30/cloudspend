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
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111A2E]/90 backdrop-blur-md border-b border-[#E7EAF2] dark:border-[#26334D] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#151A2D] hover:bg-[#F1F4F9] dark:text-[#A3AEC7] dark:hover:text-white dark:hover:bg-[#17223A] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-[#64748B] dark:text-[#A3AEC7]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] text-[#151A2D] dark:text-[#F4F6FF] text-xs font-mono font-medium">
          <Coins className="w-3.5 h-3.5 text-[#5145E5] dark:text-[#A5A0FF]" />
          <span>{user?.currency || 'USD'} ({currencySymbol})</span>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white hover:bg-[#F1F4F9] dark:hover:bg-[#17223A] transition-colors border border-transparent hover:border-[#E7EAF2] dark:hover:border-[#26334D]"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Quick PDF Report Button */}
        {onOpenPdfReport && (
          <button
            type="button"
            onClick={onOpenPdfReport}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#151A2D] dark:text-[#F4F6FF] bg-white dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-lg hover:bg-[#F1F4F9] dark:hover:bg-[#26334D] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B] dark:text-[#A3AEC7]" />
            <span>PDF Report</span>
          </button>
        )}

        {/* Primary Add Expense Action */}
        {onOpenAddExpense && (
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-lg shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        )}
      </div>
    </header>
  );
};
