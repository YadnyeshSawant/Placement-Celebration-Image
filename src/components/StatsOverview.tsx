import React, { useState, useMemo } from 'react';
import { Users, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, BarChart2, Calendar, CheckCircle2 } from 'lucide-react';
import { StudentRecord, getDepartmentDisplayName } from '../types/student';

interface StatsOverviewProps {
  students: StudentRecord[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

export const SY_DEPARTMENT_TARGETS: Record<string, number> = {
  MCA: 323,
  'MSC DSBSA': 87,
  'MSC CS': 77,
  'MSC BT': 32,
};
export const TOTAL_SY_EXPECTED = 519;

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  students,
  selectedYear = 'ALL',
  onYearChange,
}) => {
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

  const normalizedSelectedYear = (selectedYear || 'ALL').trim().toUpperCase();

  // All SY students for SY-specific targets
  const allSyStudents = useMemo(() => {
    return students.filter(
      (s) => (s.currentYear || '').trim().toUpperCase() === 'SY'
    );
  }, [students]);

  // All FY students
  const allFyStudents = useMemo(() => {
    return students.filter(
      (s) => (s.currentYear || '').trim().toUpperCase() === 'FY'
    );
  }, [students]);

  // Year-scoped students depending on selectedYear filter
  const scopedStudents = useMemo(() => {
    if (normalizedSelectedYear === 'ALL') {
      return students;
    }
    return students.filter(
      (s) => (s.currentYear || '').trim().toUpperCase() === normalizedSelectedYear
    );
  }, [students, normalizedSelectedYear]);

  const totalScoped = scopedStudents.length;

  const scopedWithBothPhotos = useMemo(() => {
    return scopedStudents.filter(
      (s) => s.blazerPhotoUrl && s.passportPhotoUrl
    ).length;
  }, [scopedStudents]);

  // Department counter helper for arbitrary student array
  const countInDept = (studentList: StudentRecord[], deptKey: string) => {
    return studentList.filter((s) => {
      const d = (s.department || '').trim().toUpperCase();
      if (deptKey === 'MCA') return d === 'MCA' || d.includes('MCA');
      if (deptKey === 'MSC DSBSA') return d.includes('DSBSA') || d.includes('BUSINESS ANALYTICS');
      if (deptKey === 'MSC CS') {
        return (
          d === 'MSC CS' ||
          d.includes('MSC CS') ||
          d.includes('M.SC. CS') ||
          (d.includes('CS') && !d.includes('BSC') && !d.includes('BACHELOR'))
        );
      }
      if (deptKey === 'MSC BT') return d.includes('BT') || d.includes('BIOTECH');
      if (deptKey === 'BSC CC') return d === 'BSC CC' || d.includes('BSC CC') || d.includes('CLOUD');
      return false;
    }).length;
  };

  // SY Department counts (always computed from SY students)
  const syMcaCount = countInDept(allSyStudents, 'MCA');
  const syDsbsaCount = countInDept(allSyStudents, 'MSC DSBSA');
  const syCsCount = countInDept(allSyStudents, 'MSC CS');
  const syBtCount = countInDept(allSyStudents, 'MSC BT');
  const sySubmittedTotal = allSyStudents.length;
  const syPendingSubmissions = Math.max(0, TOTAL_SY_EXPECTED - sySubmittedTotal);

  // FY Department counts for FY breakdown
  const fyDeptBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    allFyStudents.forEach((s) => {
      const dept = s.department || 'Unspecified';
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allFyStudents]);

  // Academic year label formatting
  const getYearLabel = (yr: string) => {
    switch (yr) {
      case 'SY':
        return 'Second Year (SY)';
      case 'FY':
        return 'First Year (FY)';
      case 'TY':
        return 'Third Year (TY)';
      case 'HONORS':
        return 'Honors';
      case 'ALL':
      default:
        return 'All Academic Years';
    }
  };

  // -------------------------------------------------------------
  // Dynamic metrics depending on selected year
  // -------------------------------------------------------------
  const isSY = normalizedSelectedYear === 'SY';
  const isFY = normalizedSelectedYear === 'FY';
  const isALL = normalizedSelectedYear === 'ALL';

  let card1Label = 'Submitted Records';
  let card1Value = totalScoped;
  let card1Subtext = '';

  let card2Label = 'Pending Submissions';
  let card2Value: React.ReactNode = 0;
  let card2Subtext = '';

  let card3Label = 'Complete Photos';
  let card3Value = scopedWithBothPhotos;
  let card3Subtext = '';

  if (isSY) {
    card1Label = 'SY Submitted Records';
    card1Value = sySubmittedTotal;
    const syPct = Math.min(100, Math.round((sySubmittedTotal / TOTAL_SY_EXPECTED) * 100));
    card1Subtext = `SY Target: ${TOTAL_SY_EXPECTED} Students (${syPct}% Reached)`;

    card2Label = 'SY Pending Submissions';
    card2Value = syPendingSubmissions;
    card2Subtext = `${TOTAL_SY_EXPECTED} Target − ${sySubmittedTotal} Submitted`;

    card3Label = 'SY Complete Photos';
    card3Value = scopedWithBothPhotos;
    const photoPct = sySubmittedTotal ? Math.round((scopedWithBothPhotos / sySubmittedTotal) * 100) : 0;
    card3Subtext = `${photoPct}% Verified Compliant (${sySubmittedTotal - scopedWithBothPhotos} Pending Photos)`;
  } else if (isFY) {
    card1Label = 'FY Submitted Records';
    card1Value = totalScoped;
    card1Subtext = `First Year Submissions Recorded`;

    card2Label = 'FY Cohort Target';
    card2Value = <span className="text-xl sm:text-2xl font-bold text-amber-900">Awaiting Total</span>;
    card2Subtext = `Target figure will be configured soon`;

    card3Label = 'FY Complete Photos';
    card3Value = scopedWithBothPhotos;
    const photoPct = totalScoped ? Math.round((scopedWithBothPhotos / totalScoped) * 100) : 0;
    card3Subtext = `${photoPct}% Verified Compliant (${totalScoped - scopedWithBothPhotos} Pending Photos)`;
  } else if (isALL) {
    card1Label = 'Total Submitted (All Years)';
    card1Value = totalScoped;
    card1Subtext = `Includes FY, SY, TY & Honors`;

    card2Label = 'SY Pending Submissions';
    card2Value = syPendingSubmissions;
    card2Subtext = `Based on 519 SY Target (${sySubmittedTotal} SY Submitted)`;

    card3Label = 'Complete Photos (All)';
    card3Value = scopedWithBothPhotos;
    const photoPct = totalScoped ? Math.round((scopedWithBothPhotos / totalScoped) * 100) : 0;
    card3Subtext = `${photoPct}% Verified Compliant (${totalScoped - scopedWithBothPhotos} Missing Photos)`;
  } else {
    // TY / Honors / Other
    card1Label = `${normalizedSelectedYear} Submitted Records`;
    card1Value = totalScoped;
    card1Subtext = `${getYearLabel(normalizedSelectedYear)} Submissions`;

    card2Label = `${normalizedSelectedYear} Cohort Target`;
    card2Value = <span className="text-xl sm:text-2xl font-bold text-slate-700">TBD</span>;
    card2Subtext = `Target figure not yet specified`;

    card3Label = `${normalizedSelectedYear} Complete Photos`;
    card3Value = scopedWithBothPhotos;
    const photoPct = totalScoped ? Math.round((scopedWithBothPhotos / totalScoped) * 100) : 0;
    card3Subtext = `${photoPct}% Verified Compliant`;
  }

  // -------------------------------------------------------------
  // Render: Collapsed State
  // -------------------------------------------------------------
  if (isCollapsed) {
    return (
      <div className="bg-white text-slate-900 rounded-2xl px-4 py-3 mb-6 shadow-xs border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-slate-800 whitespace-nowrap">
              Statistics Overview
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-md text-[11px]">
              {getYearLabel(normalizedSelectedYear)}
            </span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px]">
              {isSY ? `${sySubmittedTotal} / ${TOTAL_SY_EXPECTED} Submitted` : `${totalScoped} Submitted`}
            </span>
            {isSY && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-md text-[11px]">
                {syPendingSubmissions} Pending
              </span>
            )}
            {isALL && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-md text-[11px]">
                {syPendingSubmissions} SY Pending
              </span>
            )}
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[11px] hidden xs:inline">
              {scopedWithBothPhotos} Photos Verified
            </span>
          </div>
        </div>

        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          title="Open Statistics Overview"
        >
          <span>Show Stats</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Expanded State
  // -------------------------------------------------------------
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs border border-slate-200/90 transition-all">
      {/* Header bar with Year indicator & Quick Year filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                Cohort Statistics Overview
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-extrabold rounded-md text-[11px] tracking-wide">
                Year: {normalizedSelectedYear}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reflecting live data for <strong>{getYearLabel(normalizedSelectedYear)}</strong>
            </p>
          </div>
        </div>

        {/* Quick Year Switcher & Collapse Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {onYearChange && (
            <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px]">
              {(['ALL', 'FY', 'SY', 'TY', 'Honors'] as const).map((yr) => {
                const isActive = normalizedSelectedYear === yr.toUpperCase();
                return (
                  <button
                    key={yr}
                    onClick={() => onYearChange(yr)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {yr === 'ALL' ? 'All Years' : yr}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Collapse Statistics Overview"
          >
            <span>Collapse</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Submitted Records */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800/80">
              {card1Label}
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-950">{card1Value}</div>
          <div className="text-[11px] text-blue-700/80 font-medium mt-0.5">
            {card1Subtext}
          </div>
        </div>

        {/* Card 2: Pending Submissions / Targets */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800/80">
              {card2Label}
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950">{card2Value}</div>
          <div className="text-[11px] text-amber-700/80 font-semibold mt-0.5">
            {card2Subtext}
          </div>
        </div>

        {/* Card 3: Complete Photos */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800/80">
              {card3Label}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">{card3Value}</div>
          <div className="text-[11px] text-emerald-700/80 font-medium mt-0.5">
            {card3Subtext}
          </div>
        </div>
      </div>

      {/* Conditional Breakdown Strip based on Selected Year */}
      {/* 1. If SY or ALL selected: Show SY Target Breakdown Strip (519 Total) */}
      {(isSY || isALL) && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100/90 text-blue-900 font-extrabold text-[11px] tracking-wide uppercase">
              SY Cohort Targets
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Breakdown for 519 SY Students:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
              MCA:{' '}
              <strong className="text-blue-900 font-bold font-mono">{syMcaCount}</strong>
              <span className="text-slate-400 font-normal"> / 323</span>
              {323 - syMcaCount > 0 ? (
                <span className="ml-1 text-amber-700 font-semibold">
                  ({323 - syMcaCount} pending)
                </span>
              ) : (
                <span className="ml-1 text-emerald-600 font-semibold flex-inline items-center">
                  ✓ Reached
                </span>
              )}
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
              MSC DSBSA:{' '}
              <strong className="text-blue-900 font-bold font-mono">{syDsbsaCount}</strong>
              <span className="text-slate-400 font-normal"> / 87</span>
              {87 - syDsbsaCount > 0 ? (
                <span className="ml-1 text-amber-700 font-semibold">
                  ({87 - syDsbsaCount} pending)
                </span>
              ) : (
                <span className="ml-1 text-emerald-600 font-semibold">✓ Reached</span>
              )}
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
              MSC CS:{' '}
              <strong className="text-blue-900 font-bold font-mono">{syCsCount}</strong>
              <span className="text-slate-400 font-normal"> / 77</span>
              {77 - syCsCount > 0 ? (
                <span className="ml-1 text-amber-700 font-semibold">
                  ({77 - syCsCount} pending)
                </span>
              ) : (
                <span className="ml-1 text-emerald-600 font-semibold">✓ Reached</span>
              )}
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium">
              MSC BT:{' '}
              <strong className="text-blue-900 font-bold font-mono">{syBtCount}</strong>
              <span className="text-slate-400 font-normal"> / 32</span>
              {32 - syBtCount > 0 ? (
                <span className="ml-1 text-amber-700 font-semibold">
                  ({32 - syBtCount} pending)
                </span>
              ) : (
                <span className="ml-1 text-emerald-600 font-semibold">✓ Reached</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* 2. If FY selected: Show FY Department Breakdown Strip */}
      {isFY && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[11px] tracking-wide uppercase">
              FY Submissions
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              First Year Departments ({allFyStudents.length} total, official target TBD):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {fyDeptBreakdown.length > 0 ? (
              fyDeptBreakdown.map((d) => (
                <span
                  key={d.name}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium"
                >
                  {getDepartmentDisplayName(d.name)}:{' '}
                  <strong className="text-blue-900 font-bold font-mono">{d.count}</strong>
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[11px]">
                No First Year (FY) records submitted yet.
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. If TY or Honors selected: Show their breakdown */}
      {!isSY && !isFY && !isALL && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[11px] tracking-wide uppercase">
              {normalizedSelectedYear} Breakdown
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Department counts for {normalizedSelectedYear} ({totalScoped} records):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scopedStudents.length > 0 ? (
              Array.from(
                scopedStudents.reduce((acc, s) => {
                  const dept = s.department || 'Other';
                  acc.set(dept, (acc.get(dept) || 0) + 1);
                  return acc;
                }, new Map<string, number>())
              ).map(([name, count]) => (
                <span
                  key={name}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium"
                >
                  {getDepartmentDisplayName(name)}: <strong className="text-blue-900 font-bold font-mono">{count}</strong>
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[11px]">
                No records found for {normalizedSelectedYear}.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
