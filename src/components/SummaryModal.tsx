import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart2,
  Building2,
  Calendar,
  Layers,
  Users,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { StudentRecord, getDepartmentDisplayName } from '../types/student';

interface SummaryModalProps {
  students: StudentRecord[];
  filteredStudents: StudentRecord[];
  onClose: () => void;
  isInline?: boolean;
}

export const SY_DEPARTMENT_TARGETS: Record<string, number> = {
  MCA: 323,
  'MSC DSBSA': 87,
  'MSC CS': 77,
  'MSC BT': 32,
};
export const TOTAL_SY_EXPECTED = 519;

type TabType = 'department' | 'division' | 'year' | 'combined';

export const SummaryModal: React.FC<SummaryModalProps> = ({
  students,
  filteredStudents,
  onClose,
  isInline = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('department');
  const [useFilteredData, setUseFilteredData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const targetStudents = useFilteredData ? filteredStudents : students;

  // Breakdown by Department with SY Target Tracking
  const deptSummary = useMemo(() => {
    const map = new Map<
      string,
      { total: number; bothPhotos: number; missingPhotos: number; syCount: number }
    >();

    // Pre-populate with official SY target departments
    Object.keys(SY_DEPARTMENT_TARGETS).forEach((dept) => {
      map.set(dept, { total: 0, bothPhotos: 0, missingPhotos: 0, syCount: 0 });
    });

    targetStudents.forEach((s) => {
      const dept = s.department || 'Unspecified';
      const cur = map.get(dept) || { total: 0, bothPhotos: 0, missingPhotos: 0, syCount: 0 };
      cur.total += 1;
      if (s.currentYear && s.currentYear.toUpperCase() === 'SY') {
        cur.syCount += 1;
      }
      if (s.passportPhotoUrl && s.blazerPhotoUrl) {
        cur.bothPhotos += 1;
      } else {
        cur.missingPhotos += 1;
      }
      map.set(dept, cur);
    });

    return Array.from(map.entries())
      .map(([name, data]) => {
        const target = SY_DEPARTMENT_TARGETS[name] || 0;
        const pendingFormSubmissions = target > 0 ? Math.max(0, target - data.total) : 0;
        const targetReachedPct = target > 0 ? Math.round((data.total / target) * 100) : null;
        return {
          name,
          ...data,
          target,
          pendingFormSubmissions,
          targetReachedPct,
        };
      })
      .sort((a, b) => {
        if (a.target > 0 && b.target > 0) return b.target - a.target;
        if (a.target > 0) return -1;
        if (b.target > 0) return 1;
        return b.total - a.total;
      });
  }, [targetStudents]);

  // Breakdown by Division
  const divisionSummary = useMemo(() => {
    const map = new Map<string, { total: number; bothPhotos: number; missingPhotos: number }>();
    targetStudents.forEach((s) => {
      const div = s.division ? `Division ${s.division}` : 'Division NA';
      const cur = map.get(div) || { total: 0, bothPhotos: 0, missingPhotos: 0 };
      cur.total += 1;
      if (s.passportPhotoUrl && s.blazerPhotoUrl) {
        cur.bothPhotos += 1;
      } else {
        cur.missingPhotos += 1;
      }
      map.set(div, cur);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [targetStudents]);

  // Breakdown by Year with SY Target Tracking
  const yearSummary = useMemo(() => {
    const map = new Map<string, { total: number; bothPhotos: number; missingPhotos: number }>();

    // Pre-populate core academic years FY and SY so they always appear
    ['FY', 'SY'].forEach((yr) => {
      map.set(yr, { total: 0, bothPhotos: 0, missingPhotos: 0 });
    });

    targetStudents.forEach((s) => {
      const year = s.currentYear || 'NA';
      const cur = map.get(year) || { total: 0, bothPhotos: 0, missingPhotos: 0 };
      cur.total += 1;
      if (s.passportPhotoUrl && s.blazerPhotoUrl) {
        cur.bothPhotos += 1;
      } else {
        cur.missingPhotos += 1;
      }
      map.set(year, cur);
    });

    const yearOrder: Record<string, number> = { FY: 1, SY: 2, TY: 3, Honors: 4, NA: 5 };

    return Array.from(map.entries())
      .map(([name, data]) => {
        const isSY = name.toUpperCase() === 'SY';
        const isFY = name.toUpperCase() === 'FY';
        const target = isSY ? TOTAL_SY_EXPECTED : 0;
        const pendingForms = isSY ? Math.max(0, TOTAL_SY_EXPECTED - data.total) : null;
        const targetProgress = isSY ? Math.round((data.total / TOTAL_SY_EXPECTED) * 100) : null;

        return {
          name,
          ...data,
          isSY,
          isFY,
          target,
          pendingForms,
          targetProgress,
        };
      })
      .sort((a, b) => (yearOrder[a.name] ?? 99) - (yearOrder[b.name] ?? 99));
  }, [targetStudents]);

  // Combined Breakdown: Department x Year x Division
  const combinedSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        department: string;
        year: string;
        division: string;
        total: number;
        bothPhotos: number;
        missingPhotos: number;
      }
    >();

    targetStudents.forEach((s) => {
      const dept = s.department || 'Unspecified';
      const year = s.currentYear || 'NA';
      const div = s.division || 'NA';
      const key = `${dept}__${year}__${div}`;

      const cur = map.get(key) || {
        department: dept,
        year,
        division: div,
        total: 0,
        bothPhotos: 0,
        missingPhotos: 0,
      };

      cur.total += 1;
      if (s.passportPhotoUrl && s.blazerPhotoUrl) {
        cur.bothPhotos += 1;
      } else {
        cur.missingPhotos += 1;
      }
      map.set(key, cur);
    });

    const yearOrder: Record<string, number> = { FY: 1, SY: 2, TY: 3, Honors: 4, NA: 5 };

    return Array.from(map.values()).sort((a, b) => {
      const deptCmp = a.department.localeCompare(b.department);
      if (deptCmp !== 0) return deptCmp;
      const yrA = yearOrder[a.year] ?? 99;
      const yrB = yearOrder[b.year] ?? 99;
      if (yrA !== yrB) return yrA - yrB;
      return a.division.localeCompare(b.division);
    });
  }, [targetStudents]);

  const filteredCombined = useMemo(() => {
    if (!searchQuery.trim()) return combinedSummary;
    const q = searchQuery.toLowerCase().trim();
    return combinedSummary.filter(
      (c) =>
        c.department.toLowerCase().includes(q) ||
        c.year.toLowerCase().includes(q) ||
        c.division.toLowerCase().includes(q)
    );
  }, [combinedSummary, searchQuery]);

  const EXPECTED_COHORT_TOTAL = 519;
  const pendingFormSubmissions = Math.max(0, EXPECTED_COHORT_TOTAL - students.length);

  // Overall totals
  const totalCount = targetStudents.length;
  const completePhotosCount = targetStudents.filter(
    (s) => s.passportPhotoUrl && s.blazerPhotoUrl
  ).length;
  const missingPhotosCount = totalCount - completePhotosCount;
  const completionPercentage = totalCount ? Math.round((completePhotosCount / totalCount) * 100) : 0;

  // Copy textual summary to clipboard
  const handleCopySummary = () => {
    let text = `=== STUDENT RECORDS SUMMARY ===\n`;
    text += `Scope: ${useFilteredData ? 'Filtered Records' : 'All Records'}\n`;
    text += `Expected Target Cohort: ${EXPECTED_COHORT_TOTAL} Students\n`;
    text += `Received Submissions: ${totalCount} (${Math.round((totalCount / EXPECTED_COHORT_TOTAL) * 100)}% of target)\n`;
    text += `Pending Form Submissions: ${pendingFormSubmissions} students yet to submit\n`;
    text += `Complete Verified Photos: ${completePhotosCount} (${completionPercentage}% of received)\n`;
    text += `Pending / Incomplete Photos: ${missingPhotosCount} submitted students\n\n`;

    text += `--- BY DEPARTMENT (SY COHORT TARGETS: MCA: 323, DSBSA: 87, CS: 77, BT: 32 = 519 TOTAL) ---\n`;
    deptSummary.forEach((d) => {
      const deptName = getDepartmentDisplayName(d.name);
      if (d.target > 0) {
        text += `${deptName}: Target ${d.target} | Submitted ${d.total} | Pending Forms: ${d.pendingFormSubmissions} | Complete Photos: ${d.bothPhotos} (${d.missingPhotos} pending photos) [${d.targetReachedPct}% of SY target]\n`;
      } else {
        text += `${deptName}: Submitted ${d.total} | Complete Photos: ${d.bothPhotos} (${d.missingPhotos} pending photos)\n`;
      }
    });

    text += `\n--- BY YEAR (SY TARGET: 519, FY TARGET: TBD) ---\n`;
    yearSummary.forEach((y) => {
      if (y.target > 0) {
        text += `${y.name}: Target ${y.target} | Submitted ${y.total} | Pending Forms: ${y.pendingForms} | Complete Photos: ${y.bothPhotos} (${y.missingPhotos} pending photos) [${y.targetProgress}% of SY target]\n`;
      } else if (y.isFY) {
        text += `${y.name}: Target TBD | Submitted ${y.total} | Complete Photos: ${y.bothPhotos} (${y.missingPhotos} pending photos)\n`;
      } else {
        text += `${y.name}: Submitted ${y.total} | Complete Photos: ${y.bothPhotos} (${y.missingPhotos} pending photos)\n`;
      }
    });

    text += `\n--- BY DIVISION ---\n`;
    divisionSummary.forEach((div) => {
      text += `${div.name}: ${div.total} students (${div.bothPhotos} complete, ${div.missingPhotos} pending photos)\n`;
    });

    text += `\n--- DEPARTMENT x YEAR x DIVISION BREAKDOWN ---\n`;
    combinedSummary.forEach((c) => {
      text += `${c.department} | Year ${c.year} | Div ${c.division}: ${c.total} students (${c.bothPhotos} complete, ${c.missingPhotos} pending photos)\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const modalContent = (
    <div
      className={`bg-white rounded-3xl border border-slate-200 w-full flex flex-col overflow-hidden ${
        isInline
          ? 'shadow-lg ring-1 ring-slate-900/5'
          : 'shadow-2xl max-w-6xl 2xl:max-w-7xl h-[94vh] max-h-[96vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
            <BarChart2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Records Summary & Statistics
              </h3>
              {isInline && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Live View
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Aggregated records count &amp; pending submissions categorized per Department, Division, and Year
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopySummary}
            className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-2xs"
            title="Copy text report to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-200 shadow-2xs group"
            title="Close Records Summary"
          >
            <X className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
            <span>Close</span>
          </button>
        </div>
      </div>

        {/* Top Metric Cards: 5 Cards Grid */}
        <div className="p-4 sm:p-6 bg-slate-50/80 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 shrink-0">
          
          {/* Card 1: Total Received */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitted</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</div>
            <div className="text-[11px] text-blue-700 font-semibold mt-0.5">Target: 519 SY Students</div>
          </div>

          {/* Card 2: Pending Form Submissions */}
          <div className="bg-amber-50/80 p-3.5 sm:p-4 rounded-2xl border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending Forms</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">{pendingFormSubmissions}</div>
            <div className="text-[11px] text-amber-700 font-bold mt-0.5">519 Target − {students.length} Submitted</div>
          </div>

          {/* Card 3: Complete Photos */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Both Photos</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{completePhotosCount}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{completionPercentage}% Verified</div>
          </div>

          {/* Card 4: Pending / Incomplete Photos */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Photos</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-700">{missingPhotosCount}</div>
            <div className="text-[11px] text-rose-600 font-bold mt-0.5">Missing 1 or Both Photos</div>
          </div>

          {/* Card 5: Scope Filter Toggle */}
          <div className="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Data Scope</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setUseFilteredData(false)}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  !useFilteredData ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setUseFilteredData(true)}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  useFilteredData ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Filtered ({filteredStudents.length})
              </button>
            </div>
          </div>

        </div>

        {/* Pending Submissions Alert Banner */}
        <div className="mx-4 sm:mx-6 mt-3.5 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-amber-950 block text-xs sm:text-sm">
                SY Cohort Targets: MCA (323) • MSC DSBSA (87) • MSC CS (77) • MSC BT (32) = 519 Total
              </span>
              <p className="text-amber-800 text-[11px] sm:text-xs font-medium mt-0.5">
                Total expected: <strong>519 SY students</strong>. Submitted so far: <strong>{students.length} students</strong> ({Math.round((students.length / EXPECTED_COHORT_TOTAL) * 100)}%). A total of <strong>{pendingFormSubmissions} students</strong> have yet to submit the form.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 bg-amber-200 text-amber-950 font-extrabold rounded-lg text-xs font-mono">
              {pendingFormSubmissions} Pending Forms
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('department')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'department'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Per Department ({deptSummary.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('division')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'division'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Per Division ({divisionSummary.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('year')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'year'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Per Year ({yearSummary.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'combined'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Combined Matrix (Dept × Year × Div)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className={`p-4 sm:p-6 overflow-y-auto space-y-4 ${isInline ? 'max-h-[640px]' : 'flex-1'}`}>
          
          {/* TAB 1: PER DEPARTMENT */}
          {activeTab === 'department' && (
            <div className="space-y-3">
              
              {/* Department Target Sub-header banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-md">
                    SY Breakdown Targets
                  </span>
                  <span className="font-semibold text-slate-700">
                    MCA: <strong>323</strong> • MSC DSBSA: <strong>87</strong> • MSC CS: <strong>77</strong> • MSC BT: <strong>32</strong> = <strong>519 Total</strong>
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-500">
                  Total Pending Forms: <strong className="text-amber-700 font-mono text-xs">{pendingFormSubmissions}</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3.5">Department</th>
                      <th className="py-2.5 px-3.5 text-center">SY Target</th>
                      <th className="py-2.5 px-3.5 text-center">Submitted</th>
                      <th className="py-2.5 px-3.5 text-center text-amber-800">Pending Forms</th>
                      <th className="py-2.5 px-3.5 text-center hidden md:table-cell text-emerald-700">Complete Photos</th>
                      <th className="py-2.5 px-3.5 text-center hidden md:table-cell text-rose-700">Pending Photos</th>
                      <th className="py-2.5 px-3.5 text-right">Target Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptSummary.map((d) => {
                      const targetPct = d.target > 0 ? Math.round((d.total / d.target) * 100) : null;
                      return (
                        <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold mr-2 border border-blue-200">
                              {getDepartmentDisplayName(d.name)}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center font-extrabold text-slate-700 font-mono">
                            {d.target > 0 ? (
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-800 font-bold">
                                {d.target}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center font-extrabold text-blue-900 font-mono">
                            {d.total}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {d.target > 0 ? (
                              d.pendingFormSubmissions > 0 ? (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-xs">
                                  {d.pendingFormSubmissions} pending
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-xs">
                                  ✓ Target Met
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center text-emerald-700 font-bold hidden md:table-cell font-mono">
                            {d.bothPhotos}
                          </td>
                          <td className="py-3 px-3.5 text-center text-rose-600 font-bold hidden md:table-cell">
                            {d.missingPhotos > 0 ? (
                              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-bold">
                                {d.missingPhotos} pending
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            {targetPct !== null ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-bold text-slate-700 w-11 text-right font-mono text-xs">{targetPct}%</span>
                                <div className="w-16 sm:w-20 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      targetPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${Math.min(100, targetPct)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                      <td className="py-3 px-3.5">Total (SY Cohort Target)</td>
                      <td className="py-3 px-3.5 text-center font-extrabold font-mono text-sm">519</td>
                      <td className="py-3 px-3.5 text-center font-extrabold font-mono text-sm text-blue-900">{totalCount}</td>
                      <td className="py-3 px-3.5 text-center text-amber-800 font-bold text-xs">{pendingFormSubmissions} pending forms</td>
                      <td className="py-3 px-3.5 text-center text-emerald-700 hidden md:table-cell font-mono">{completePhotosCount}</td>
                      <td className="py-3 px-3.5 text-center text-rose-600 font-bold hidden md:table-cell text-xs">{missingPhotosCount}</td>
                      <td className="py-3 px-3.5 text-right font-mono text-xs">{Math.round((totalCount / 519) * 100)}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PER DIVISION */}
          {activeTab === 'division' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3.5">Division</th>
                      <th className="py-2.5 px-3.5 text-center">Registered</th>
                      <th className="py-2.5 px-3.5 text-center hidden sm:table-cell">Complete Photos</th>
                      <th className="py-2.5 px-3.5 text-center hidden sm:table-cell text-rose-700">Pending Photos</th>
                      <th className="py-2.5 px-3.5 text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {divisionSummary.map((div) => {
                      const pct = div.total ? Math.round((div.bothPhotos / div.total) * 100) : 0;
                      return (
                        <tr key={div.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold text-slate-900">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                              {div.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center font-extrabold text-slate-800 font-mono text-sm">
                            {div.total}
                          </td>
                          <td className="py-2.5 px-3.5 text-center text-emerald-700 font-bold hidden sm:table-cell">
                            {div.bothPhotos}
                          </td>
                          <td className="py-2.5 px-3.5 text-center text-rose-600 font-bold hidden sm:table-cell">
                            {div.missingPhotos > 0 ? (
                              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                                {div.missingPhotos} pending
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-slate-700 w-9 text-right font-mono">{pct}%</span>
                              <div className="w-16 sm:w-24 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                      <td className="py-2.5 px-3.5">Total across all divisions</td>
                      <td className="py-2.5 px-3.5 text-center font-extrabold font-mono text-sm">{totalCount}</td>
                      <td className="py-2.5 px-3.5 text-center text-emerald-700 hidden sm:table-cell">{completePhotosCount}</td>
                      <td className="py-2.5 px-3.5 text-center text-rose-600 font-bold hidden sm:table-cell">{missingPhotosCount}</td>
                      <td className="py-2.5 px-3.5 text-right font-mono">{completionPercentage}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PER YEAR */}
          {activeTab === 'year' && (
            <div className="space-y-3">
              {/* Year Target Sub-header banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    Academic Year Targets
                  </span>
                  <span className="font-semibold text-slate-700">
                    SY Expected Cohort: <strong className="text-emerald-900 font-bold">519 Students</strong> • FY Cohort: <span className="italic text-slate-500 font-medium">Target pending (TBD)</span>
                  </span>
                </div>
                {(() => {
                  const syItem = yearSummary.find((y) => y.name === 'SY');
                  const syPending = syItem ? Math.max(0, TOTAL_SY_EXPECTED - syItem.total) : TOTAL_SY_EXPECTED;
                  return (
                    <div className="text-[11px] font-bold text-slate-500">
                      SY Pending Forms: <strong className="text-amber-700 font-mono text-xs">{syPending}</strong>
                    </div>
                  );
                })()}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3.5">Academic Year</th>
                      <th className="py-2.5 px-3.5 text-center">Cohort Target</th>
                      <th className="py-2.5 px-3.5 text-center">Submitted</th>
                      <th className="py-2.5 px-3.5 text-center text-amber-800">Pending Forms</th>
                      <th className="py-2.5 px-3.5 text-center hidden md:table-cell text-emerald-700">Complete Photos</th>
                      <th className="py-2.5 px-3.5 text-center hidden md:table-cell text-rose-700">Pending Photos</th>
                      <th className="py-2.5 px-3.5 text-right">Target Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {yearSummary.map((yr) => {
                      const photoPct = yr.total ? Math.round((yr.bothPhotos / yr.total) * 100) : 0;
                      return (
                        <tr key={yr.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200">
                              {yr.name === 'Honors' ? 'Honors Year' : yr.name === 'NA' ? 'Unspecified (NA)' : `Year ${yr.name}`}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center font-extrabold text-slate-700 font-mono">
                            {yr.isSY ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-xs">
                                519
                              </span>
                            ) : yr.isFY ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-semibold text-[11px]" title="FY target to be configured later">
                                TBD
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center font-extrabold text-blue-900 font-mono">
                            {yr.total}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {yr.isSY ? (
                              yr.pendingForms && yr.pendingForms > 0 ? (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-xs">
                                  {yr.pendingForms} pending
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-xs">
                                  ✓ Target Met
                                </span>
                              )
                            ) : yr.isFY ? (
                              <span className="text-slate-400 text-xs italic">Awaiting FY total</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center text-emerald-700 font-bold hidden md:table-cell font-mono">
                            {yr.bothPhotos}
                          </td>
                          <td className="py-3 px-3.5 text-center text-rose-600 font-bold hidden md:table-cell">
                            {yr.missingPhotos > 0 ? (
                              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-bold">
                                {yr.missingPhotos} pending
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            {yr.isSY && yr.targetProgress !== null ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-bold text-emerald-800 w-11 text-right font-mono text-xs">
                                  {yr.targetProgress}%
                                </span>
                                <div className="w-16 sm:w-20 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      yr.targetProgress >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'
                                    }`}
                                    style={{ width: `${Math.min(100, yr.targetProgress)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold text-slate-500 w-11 text-right font-mono text-xs" title="Photo completion percentage">
                                  {photoPct}% <span className="text-[10px] text-slate-400">photos</span>
                                </span>
                                <div className="w-16 sm:w-20 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${photoPct}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                      <td className="py-3 px-3.5">Total across all years</td>
                      <td className="py-3 px-3.5 text-center font-mono text-slate-600 text-xs">SY: 519 (FY: TBD)</td>
                      <td className="py-3 px-3.5 text-center font-extrabold font-mono text-sm text-blue-900">{totalCount}</td>
                      <td className="py-3 px-3.5 text-center text-amber-800 font-bold text-xs">
                        {(() => {
                          const syItem = yearSummary.find((y) => y.name === 'SY');
                          const syP = syItem ? Math.max(0, TOTAL_SY_EXPECTED - syItem.total) : TOTAL_SY_EXPECTED;
                          return `${syP} pending (SY)`;
                        })()}
                      </td>
                      <td className="py-3 px-3.5 text-center text-emerald-700 hidden md:table-cell font-mono">{completePhotosCount}</td>
                      <td className="py-3 px-3.5 text-center text-rose-600 font-bold hidden md:table-cell text-xs">{missingPhotosCount}</td>
                      <td className="py-3 px-3.5 text-right font-mono text-xs">{completionPercentage}% photos verified</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COMBINED CROSS-BREAKDOWN */}
          {activeTab === 'combined' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Department, Year, or Division..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  Showing <strong>{filteredCombined.length}</strong> combinations
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-[520px] 2xl:max-h-[640px] overflow-y-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr className="text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3 text-center">Year</th>
                      <th className="py-2 px-3 text-center">Division</th>
                      <th className="py-2 px-3 text-center font-bold">Count</th>
                      <th className="py-2 px-3 text-right">Photo Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCombined.map((c, i) => (
                      <tr key={`${c.department}_${c.year}_${c.division}`} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{getDepartmentDisplayName(c.department)}</td>
                        <td className="py-2 px-3 text-center font-semibold text-slate-700">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                            {c.year}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-slate-700">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold">
                            Div {c.division}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-extrabold text-blue-700 font-mono text-sm">
                          {c.total}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-emerald-700 font-bold">{c.bothPhotos} ✓</span>
                          {c.missingPhotos > 0 && (
                            <span className="text-amber-700 font-medium ml-1.5">({c.missingPhotos} missing)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Data source: <strong>Google Sheets / CSV Records</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>Close Summary</span>
          </button>
        </div>

      </div>
  );

  if (isInline) {
    return <div className="w-full animate-fade-in">{modalContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      {modalContent}
    </div>
  );
};
