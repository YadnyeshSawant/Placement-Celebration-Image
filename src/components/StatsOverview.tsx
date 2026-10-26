import React, { useState } from 'react';
import { Users, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { StudentRecord } from '../types/student';

interface StatsOverviewProps {
  students: StudentRecord[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ students }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('stats_overview_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('stats_overview_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const totalStudents = students.length;
  
  const withBothPhotos = students.filter(
    (s) => s.blazerPhotoUrl && s.passportPhotoUrl
  ).length;

  const expectedTotalStudents = 519;
  const pendingSubmissions = Math.max(0, expectedTotalStudents - totalStudents);

  const getDeptCount = (deptKey: string) => {
    return students.filter((s) => {
      const d = (s.department || '').toUpperCase();
      if (deptKey === 'MCA') return d === 'MCA' || d.includes('MCA');
      if (deptKey === 'MSC DSBSA') return d.includes('DSBSA') || d.includes('BUSINESS ANALYTICS');
      if (deptKey === 'MSC CS') return d === 'MSC CS' || d.includes('MSC CS') || d.includes('M.SC. CS') || (d.includes('CS') && !d.includes('BSC'));
      if (deptKey === 'MSC BT') return d.includes('BT') || d.includes('BIOTECH');
      return false;
    }).length;
  };

  const mcaCount = getDeptCount('MCA');
  const dsbsaCount = getDeptCount('MSC DSBSA');
  const csCount = getDeptCount('MSC CS');
  const btCount = getDeptCount('MSC BT');

  if (isCollapsed) {
    return (
      <div className="bg-white text-slate-900 rounded-2xl px-4 py-3 mb-6 shadow-xs border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-800 whitespace-nowrap">
            Statistics &amp; SY Targets
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px]">
              {totalStudents} / 519 Submitted
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-md text-[11px]">
              {pendingSubmissions} Pending
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[11px] hidden xs:inline">
              {withBothPhotos} Photos Verified
            </span>
          </div>
        </div>

        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          title="Open Statistics & Targets Overview"
        >
          <span>Show Stats</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs border border-slate-200/90 transition-all">
      {/* Header bar with collapse button */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            Cohort Statistics &amp; SY Targets
          </h3>
        </div>

        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          title="Collapse Statistics Overview"
        >
          <span>Collapse</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800/80">Submitted Records</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-950">{totalStudents}</div>
          <div className="text-[11px] text-blue-700/80 font-medium mt-0.5">SY Target: 519 Students ({Math.min(100, Math.round((totalStudents / 519) * 100))}%)</div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800/80">Pending Submissions</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950">{pendingSubmissions}</div>
          <div className="text-[11px] text-amber-700/80 font-semibold mt-0.5">519 Target − {totalStudents} Submitted</div>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800/80">Complete Photos</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">{withBothPhotos}</div>
          <div className="text-[11px] text-emerald-700/80 font-medium mt-0.5">
            {totalStudents ? Math.round((withBothPhotos / totalStudents) * 100) : 0}% Verified Compliant
          </div>
        </div>

      </div>

      {/* SY Target Breakdown Strip */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-900 font-extrabold text-[11px] tracking-wide uppercase">
            SY Cohort Targets
          </span>
          <span className="text-slate-500 font-medium text-[11px]">
            Target Breakdown (519 Total):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
            MCA: <strong className="text-blue-900 font-bold font-mono">{mcaCount}</strong><span className="text-slate-400 font-normal"> / 323</span>
            {323 - mcaCount > 0 && <span className="ml-1 text-amber-700 font-semibold">({323 - mcaCount} pending)</span>}
          </span>
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
            MSC DSBSA: <strong className="text-blue-900 font-bold font-mono">{dsbsaCount}</strong><span className="text-slate-400 font-normal"> / 87</span>
            {87 - dsbsaCount > 0 && <span className="ml-1 text-amber-700 font-semibold">({87 - dsbsaCount} pending)</span>}
          </span>
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
            MSC CS: <strong className="text-blue-900 font-bold font-mono">{csCount}</strong><span className="text-slate-400 font-normal"> / 77</span>
            {77 - csCount > 0 && <span className="ml-1 text-amber-700 font-semibold">({77 - csCount} pending)</span>}
          </span>
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
            MSC BT: <strong className="text-blue-900 font-bold font-mono">{btCount}</strong><span className="text-slate-400 font-normal"> / 32</span>
            {32 - btCount > 0 && <span className="ml-1 text-amber-700 font-semibold">({32 - btCount} pending)</span>}
          </span>
        </div>
      </div>

    </div>
  );
};
