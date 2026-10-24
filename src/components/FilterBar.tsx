import React from 'react';
import { Search, Filter, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
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
    <div className="bg-white border-b border-slate-200 sticky top-[69px] z-30 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        
        {/* Top Row: Search input + Select Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* PRN & Name Search Box */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search by PRN (e.g. 1272250088), Student Name, or Email..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Division Filter */}
          <div className="md:col-span-2">
            <select
              value={filters.division}
              onChange={(e) => onFilterChange({ division: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">All Divisions</option>
              <option value="A">Division A</option>
              <option value="B">Division B</option>
              <option value="C">Division C</option>
              <option value="D">Division D</option>
              <option value="E">Division E</option>
              <option value="NA">Division NA</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="md:col-span-2">
            <select
              value={filters.currentYear}
              onChange={(e) => onFilterChange({ currentYear: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">All Years</option>
              <option value="SY">Second Year (SY)</option>
              <option value="FY">First Year (FY)</option>
              <option value="TY">Third Year (TY)</option>
              <option value="NA">Unspecified (NA)</option>
            </select>
          </div>

          {/* Photo Availability Filter */}
          <div className="md:col-span-3">
            <select
              value={filters.photoFilter}
              onChange={(e) => onFilterChange({ photoFilter: e.target.value as any })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">📷 All Photo Statuses</option>
              <option value="both_available">✓ Has Both Photos</option>
              <option value="blazer_only">🧥 Has Blazer Photo Only</option>
              <option value="passport_only">👤 Has Passport Photo Only</option>
              <option value="missing_any">⚠️ Missing Any Photo</option>
            </select>
          </div>

        </div>

        {/* Bottom Row: Department Pills */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-1.5 min-w-max">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-500" />
              Dept:
            </span>

            {DEPARTMENTS.map((dept) => {
              const isSelected = filters.department === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => onFilterChange({ department: dept.id })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{dept.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center space-x-2 min-w-max ml-auto">
            <div className="flex items-center text-xs font-semibold text-slate-500 gap-1.5">
              <span>Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="bg-slate-100 border border-slate-200 rounded-lg text-xs py-1 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="prn_asc">PRN (Low to High)</option>
                <option value="prn_desc">PRN (High to Low)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="timestamp_desc">Latest Submission</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 border border-red-200"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
