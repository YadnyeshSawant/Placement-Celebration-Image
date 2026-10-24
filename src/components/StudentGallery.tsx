import React from 'react';
import { StudentRecord } from '../types/student';
import { Eye, FileSearch } from 'lucide-react';
import { getDisplayImageUrl } from '../services/driveUtils';

interface StudentGalleryProps {
  students: StudentRecord[];
  onPreview: (student: StudentRecord, defaultPhoto: 'passport' | 'blazer') => void;
}

export const StudentGallery: React.FC<StudentGalleryProps> = ({
  students,
  onPreview,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
      {students.map((student) => {
        const passportUrl = student.passportPhotoUrl
          ? getDisplayImageUrl(student.passportPhotoUrl)
          : null;
        const blazerUrl = student.blazerPhotoUrl
          ? getDisplayImageUrl(student.blazerPhotoUrl)
          : null;

        return (
          <div
            key={student.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
          >
            {/* Header info */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                  {student.fullName}
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 font-mono">
                  PRN: <span className="text-blue-600 font-bold">{student.prn}</span> • {student.division}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md shrink-0">
                {student.department}
              </span>
            </div>

            {/* Side by side photo slots */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-100/50 flex-1 min-h-[160px] sm:min-h-[180px]">
              
              {/* Passport Slot */}
              <div
                onClick={() => passportUrl && onPreview(student, 'passport')}
                className={`relative rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all ${
                  passportUrl
                    ? 'border-slate-200 bg-white hover:border-blue-400 cursor-pointer group/pass'
                    : 'border-dashed border-slate-300 bg-slate-100 text-slate-400'
                }`}
              >
                {passportUrl ? (
                  <>
                    <img
                      src={passportUrl}
                      alt={`Passport - ${student.fullName}`}
                      className="max-h-32 sm:max-h-36 w-auto object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] opacity-0 group-hover/pass:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Passport</span>
                    </div>
                  </>
                ) : (
                  <div className="p-2 text-center">
                    <FileSearch className="w-5 h-5 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] font-medium block">Passport Missing</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  1. Passport
                </span>
              </div>

              {/* Blazer Slot */}
              <div
                onClick={() => blazerUrl && onPreview(student, 'blazer')}
                className={`relative rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all ${
                  blazerUrl
                    ? 'border-slate-200 bg-white hover:border-blue-400 cursor-pointer group/blazer'
                    : 'border-dashed border-slate-300 bg-slate-100 text-slate-400'
                }`}
              >
                {blazerUrl ? (
                  <>
                    <img
                      src={blazerUrl}
                      alt={`Blazer - ${student.fullName}`}
                      className="max-h-32 sm:max-h-36 w-auto object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[1px] opacity-0 group-hover/blazer:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Creative</span>
                    </div>
                  </>
                ) : (
                  <div className="p-2 text-center">
                    <FileSearch className="w-5 h-5 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] font-medium block">Creative Missing</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  2. Creative
                </span>
              </div>

            </div>

            {/* Bottom Card Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px]">
                {student.email}
              </span>
              <button
                onClick={() => onPreview(student, 'passport')}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] transition-colors"
              >
                View Lightbox
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};
