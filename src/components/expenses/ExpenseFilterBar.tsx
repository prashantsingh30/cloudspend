import React from 'react';
import { FilterParams, CurrencyCode } from '../../types';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS, formatCurrency } from '../../utils/formatters';
import { Search, RotateCcw } from 'lucide-react';

interface ExpenseFilterBarProps {
  filters: FilterParams;
  onChange: (updated: Partial<FilterParams>) => void;
  onClear: () => void;
  filteredCount: number;
  filteredTotal: number;
  currency: CurrencyCode;
}

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  filters,
  onChange,
  onClear,
  filteredCount,
  filteredTotal,
  currency,
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.category !== 'all' ||
    filters.paymentMethod !== 'all' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    filters.sortBy !== 'date-desc';

  return (
    <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3AEC7]" />
          <input
            type="text"
            placeholder="Search descriptions, merchants, notes..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] text-[#151A2D] dark:text-[#F4F6FF] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] text-[#151A2D] dark:text-[#F4F6FF] transition-colors"
          >
            <option value="date-desc">Newest Date First</option>
            <option value="date-asc">Oldest Date First</option>
            <option value="amount-desc">Highest Amount First</option>
            <option value="amount-asc">Lowest Amount First</option>
          </select>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#E7EAF2]/80 dark:border-[#26334D]/80">
        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#A3AEC7] mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value as any })}
            className="w-full px-3 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF]"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#A3AEC7] mb-1">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => onChange({ paymentMethod: e.target.value as any })}
            className="w-full px-3 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF]"
          >
            <option value="all">All Methods</option>
            {ALL_PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#A3AEC7] mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#A3AEC7] mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF]"
          />
        </div>
      </div>

      {/* Results and Reset Bar */}
      <div className="flex items-center justify-between pt-2 text-xs text-[#64748B] dark:text-[#A3AEC7]">
        <div className="flex items-center gap-2">
          <span>Showing <strong className="text-[#151A2D] dark:text-[#F4F6FF]">{filteredCount}</strong> entries</span>
          <span aria-hidden="true">·</span>
          <span>Sum: <strong className="text-[#5145E5] dark:text-[#A5A0FF] font-mono">{formatCurrency(filteredTotal, currency)}</strong></span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-[#5145E5] dark:text-[#A5A0FF] hover:underline font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
