import React from 'react';
import { Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { StudentRecord } from '../types/student';

interface StatsOverviewProps {
  students: StudentRecord[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ students }) => {
  const totalStudents = students.length;
  
  const withBothPhotos = students.filter(
    (s) => s.blazerPhotoUrl && s.passportPhotoUrl
  ).length;

  const expectedTotalStudents = 519;
  const pendingSubmissions = Math.max(0, expectedTotalStudents - totalStudents);

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-5 mb-6 shadow-xs border border-slate-200/90">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Metric Cards Grid - Bright Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
          
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800/80">Total Records</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-950">{totalStudents}</div>
            <div className="text-[11px] text-blue-700/80 font-medium mt-0.5">Students Registered (Target: 519)</div>
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

          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800/80">Pending Submissions</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-950">{pendingSubmissions}</div>
            <div className="text-[11px] text-amber-700/80 font-medium mt-0.5">519 − {totalStudents} Sheet Submissions</div>
          </div>

        </div>

      </div>

    </div>
  );
};
