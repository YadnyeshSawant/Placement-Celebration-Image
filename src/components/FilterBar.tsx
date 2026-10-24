import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { DEPARTMENTS, FilterState } from '../types/student';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  activeCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  activeCount,
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.department !== 'ALL' ||
    filters.division !== 'ALL' ||
    filters.currentYear !== 'ALL' ||
    filters.photoFilter !== 'all';

  return (
    <div className="bg-white border-b border-slate-200 sticky top-[57px] sm:top-[69px] z-30 shadow-xs">
      <div className="w-full ultra-wide-container px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        
        {/* Single Line Compact Grid for All Filter Controls */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center">
          
          {/* 1. Search Box */}
          <div className="col-span-12 sm:col-span-4 lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search PRN, Name, Email..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Department Dropdown (Directly Next to Search Bar) */}
          <div className="col-span-6 sm:col-span-2 lg:col-span-2">
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className="w-full py-1.5 px-2 bg-blue-50/80 hover:bg-blue-100/80 focus:bg-white text-blue-900 border border-blue-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer truncate"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.id === 'ALL' ? '🎓 All Depts' : `🎓 ${dept.label}`}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Division Filter */}
          <div className="col-span-3 sm:col-span-1 lg:col-span-1">
            <select
              value={filters.division}
              onChange={(e) => onFilterChange({ division: e.target.value })}
              className="w-full py-1.5 px-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 truncate"
            >
              <option value="ALL">Div: All</option>
              <option value="A">Div A</option>
              <option value="B">Div B</option>
              <option value="C">Div C</option>
              <option value="D">Div D</option>
              <option value="E">Div E</option>
              <option value="NA">Div NA</option>
            </select>
          </div>

          {/* 4. Year Filter */}
          <div className="col-span-3 sm:col-span-1 lg:col-span-1">
            <select
              value={filters.currentYear}
              onChange={(e) => onFilterChange({ currentYear: e.target.value })}
              className="w-full py-1.5 px-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 truncate"
            >
              <option value="ALL">Year: All</option>
              <option value="SY">SY</option>
              <option value="FY">FY</option>
              <option value="TY">TY</option>
              <option value="NA">NA</option>
            </select>
          </div>

          {/* 5. Photos Status Filter (In Same Line) */}
          <div className="col-span-6 sm:col-span-2 lg:col-span-2">
            <select
              value={filters.photoFilter}
              onChange={(e) => onFilterChange({ photoFilter: e.target.value as any })}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 truncate"
            >
              <option value="all">📷 All Photos</option>
              <option value="both_available">✓ Both Available</option>
              <option value="blazer_only">🧥 Creative Only</option>
              <option value="passport_only">👤 Passport Only</option>
              <option value="missing_any">⚠️ Missing Any</option>
            </select>
          </div>

          {/* 6. Sort By (PRN) & Reset Button (Directly next to Photos) */}
          <div className="col-span-6 sm:col-span-2 lg:col-span-2 flex items-center justify-start gap-1">
            <div className="flex items-center text-xs font-semibold text-slate-500 gap-1 flex-1 min-w-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="bg-slate-100 border border-slate-200 rounded-xl text-xs py-1.5 px-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full truncate"
              >
                <option value="prn_asc">PRN (Low-High)</option>
                <option value="prn_desc">PRN (High-Low)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="timestamp_desc">Latest First</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-red-200 shrink-0"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Reset</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
