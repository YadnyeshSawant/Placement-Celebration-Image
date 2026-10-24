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
  ShieldCheck
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Student Image & Document Portal
                </h1>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> Records</span>
                <span>•</span>
                <span className="text-slate-400">Google Sheets Live Data</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar with Bright Theme Button Styling */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center h-10">
              <button
                onClick={() => onViewChange('grid')}
                className={`px-3 h-8 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  currentView === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Grid Card View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Grid Cards</span>
              </button>

              <button
                onClick={() => onViewChange('gallery')}
                className={`px-3 h-8 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  currentView === 'gallery'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Photo Comparison Gallery View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Photo Gallery</span>
              </button>

              <button
                onClick={() => onViewChange('table')}
                className={`px-3 h-8 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  currentView === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Spreadsheet Table View"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Spreadsheet</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenSheetSync}
              className="px-3 h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Connect Live Google Sheet or Upload CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sync Sheet</span>
            </button>

            <button
              onClick={onOpenBatchPdf}
              className="px-3 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Export Catalog or Selected Records as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-3 h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 flex items-center justify-center gap-1 shadow-2xs"
              title="Add New Student Record via Google Form"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Add Student</span>
            </button>

            <button
              onClick={onRefreshData}
              disabled={isLoading}
              className="px-3 h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 disabled:opacity-50 flex items-center justify-center shadow-2xs"
              title="Reload Original Dataset"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Login / Auth Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 h-10">
                <span className="inline-flex items-center gap-1 px-2.5 h-10 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl" title={`Signed in as ${loggedInUser}`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{loggedInUser.split('@')[0]}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="px-3 h-10 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold transition-colors border border-slate-200 hover:border-red-200 flex items-center justify-center shadow-2xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 h-10 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs ml-1"
                title="Sign In with Confidential ENV App ID & Password"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
