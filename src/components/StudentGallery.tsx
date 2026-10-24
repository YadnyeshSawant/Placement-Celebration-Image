import React, { useState } from 'react';
import { StudentRecord } from '../types/student';
import { getDisplayImageUrl, getDriveViewUrl } from '../services/driveUtils';
import { Eye, Download, FileText, CheckCircle2 } from 'lucide-react';

interface StudentGalleryProps {
  students: StudentRecord[];
  onPreview: (student: StudentRecord, defaultPhoto: 'passport' | 'blazer') => void;
}

export const StudentGallery: React.FC<StudentGalleryProps> = ({
  students,
  onPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'blazer' | 'passport'>('both');

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
        <p className="text-slate-500 font-medium text-sm">
          No student records found matching your active filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Tab Switcher */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="text-sm font-bold text-slate-800">
          Photo Gallery ({students.length} Students)
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'both' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('blazer')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'blazer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Creative Only
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'passport' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Passport Only
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {students.map((student) => {
          const passportUrl = getDisplayImageUrl(student.passportPhotoUrl);
          const blazerUrl = getDisplayImageUrl(student.blazerPhotoUrl);

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{student.fullName}</h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    PRN: {student.prn} • {student.department} ({student.division})
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-md border border-blue-200">
                  {student.currentYear}
                </span>
              </div>

              {/* Photo Display Area */}
              <div className={`grid gap-2 mb-3 ${activeTab === 'both' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                
                {/* Passport Image */}
                {(activeTab === 'both' || activeTab === 'passport') && (
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Passport
                    </div>
                    <div
                      onClick={() => student.passportPhotoUrl && onPreview(student, 'passport')}
                      className="w-full h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer group"
                    >
                      {student.passportPhotoUrl ? (
                        <>
                          <img
                            src={passportUrl}
                            alt={`Passport - ${student.fullName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                          No Passport Photo
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blazer Image */}
                {(activeTab === 'both' || activeTab === 'blazer') && (
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Creative Photo
                    </div>
                    <div
                      onClick={() => student.blazerPhotoUrl && onPreview(student, 'blazer')}
                      className="w-full h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer group"
                    >
                      {student.blazerPhotoUrl ? (
                        <>
                          <img
                            src={blazerUrl}
                            alt={`Blazer - ${student.fullName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                          No Blazer Photo
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Action Links */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <span className="truncate max-w-[180px]">{student.email}</span>
                <button
                  onClick={() => onPreview(student, 'passport')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
