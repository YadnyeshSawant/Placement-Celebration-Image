import React from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  PlusCircle,
  Download,
  GraduationCap,
  Layers,
  Database,
  Lock,
  LogOut,
  BarChart2
} from 'lucide-react';
import { ViewMode } from '../types/student';

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onOpenSheetSync: () => void;
  onOpenAddModal: () => void;
  onOpenBatchPdf: () => void;
  onOpenSummary: () => void;
  onExportCsv: () => void;
  isLoading: boolean;
  onRefreshData: () => void;
  isLoggedIn: boolean;
  loggedInUser: string;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  filteredCount,
  currentView,
  onViewChange,
  onOpenSheetSync,
  onOpenAddModal,
  onOpenBatchPdf,
  onOpenSummary,
  onExportCsv,
  isLoading,
  onRefreshData,
  isLoggedIn,
  loggedInUser,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="bg-white/95 border-b border-slate-200/90 text-slate-900 sticky top-0 z-40 shadow-xs backdrop-blur-md">
      <div className="w-full ultra-wide-container px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          
          {/* Title & Brand */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 truncate text-fluid-title">
                  Student Image & Document Portal
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                  <span>Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> Records</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="text-slate-400 hidden xs:inline">Google Sheets Live Data</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-2.5">
            
            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 flex items-center h-9 sm:h-10">
              <button
                onClick={() => onViewChange('grid')}
                className={`px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 ${
                  currentView === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Grid Card View"
              >
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => onViewChange('gallery')}
                className={`px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 ${
                  currentView === 'gallery'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Photo Comparison Gallery View"
              >
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Gallery</span>
              </button>

              <button
                onClick={() => onViewChange('table')}
                className={`px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 ${
                  currentView === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Spreadsheet Table View"
              >
                <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenSheetSync}
              className="px-2.5 sm:px-3 h-9 sm:h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 shadow-2xs"
              title="Connect Live Google Sheet or Upload CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Sync Sheet</span>
            </button>

            <button
              onClick={onOpenBatchPdf}
              className="px-2.5 sm:px-3 h-9 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 sm:gap-1.5 shadow-xs"
              title="Export Catalog or Selected Records as PDF"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onOpenSummary}
              className="px-2.5 sm:px-3 h-9 sm:h-10 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 sm:gap-1.5 shadow-2xs"
              title="View Summary counts of records per Department, Division, and Year"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Summary</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-2.5 sm:px-3 h-9 sm:h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors border border-slate-200 flex items-center justify-center gap-1 shadow-2xs"
              title="Add New Student Record via Google Form"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Add Student</span>
            </button>

            <button
              onClick={onRefreshData}
              disabled={isLoading}
              className="px-2.5 sm:px-3 h-9 sm:h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors border border-slate-200 disabled:opacity-50 flex items-center justify-center shadow-2xs"
              title="Reload Original Dataset"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Login / Auth Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 border-l border-slate-200 h-9 sm:h-10">
                <button
                  onClick={onLogout}
                  className="px-2.5 sm:px-3 h-9 sm:h-10 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors border border-slate-200 hover:border-red-200 flex items-center justify-center shadow-2xs"
                  title={`Signed in as ${loggedInUser} • Click to Sign Out`}
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-2.5 sm:px-3 h-9 sm:h-10 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 sm:gap-1.5 shadow-2xs ml-0.5"
                title="Sign In with Confidential ENV App ID & Password"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Admin Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
