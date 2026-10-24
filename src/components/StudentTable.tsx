import React from 'react';
import { StudentRecord } from '../types/student';
import { getDisplayImageUrl, getDriveViewUrl } from '../services/driveUtils';
import { Download, ExternalLink, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentTableProps {
  students: StudentRecord[];
  onPreview: (student: StudentRecord, defaultPhoto: 'passport' | 'blazer') => void;
  onExportPdf: (student: StudentRecord) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onPreview,
  onExportPdf,
}) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
        <p className="text-slate-500 font-medium text-sm">
          No records matching active search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">PRN</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Dept / Branch</th>
              <th className="py-3 px-4 text-center">Div</th>
              <th className="py-3 px-4 text-center">Year</th>
              <th className="py-3 px-4 text-center">Passport Photo</th>
              <th className="py-3 px-4 text-center">Blazer Uniform Photo</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {students.map((student, idx) => {
              const passportThumb = getDisplayImageUrl(student.passportPhotoUrl);
              const blazerThumb = getDisplayImageUrl(student.blazerPhotoUrl);

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>

                  <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {student.prn}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {student.fullName}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded border border-indigo-100">
                      {student.department}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {student.division}
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-slate-600">
                    {student.currentYear}
                  </td>

                  {/* Passport Thumbnail */}
                  <td className="py-3 px-4 text-center">
                    {student.passportPhotoUrl ? (
                      <div
                        onClick={() => onPreview(student, 'passport')}
                        className="inline-flex items-center gap-1.5 cursor-pointer group/thumb"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                          <img
                            src={passportThumb}
                            alt=""
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <a
                          href={getDriveViewUrl(student.passportPhotoUrl)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Missing</span>
                    )}
                  </td>

                  {/* Blazer Thumbnail */}
                  <td className="py-3 px-4 text-center">
                    {student.blazerPhotoUrl ? (
                      <div
                        onClick={() => onPreview(student, 'blazer')}
                        className="inline-flex items-center gap-1.5 cursor-pointer group/thumb"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                          <img
                            src={blazerThumb}
                            alt=""
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <a
                          href={getDriveViewUrl(student.blazerPhotoUrl)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Missing</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-medium truncate max-w-[160px]" title={student.email}>
                    {student.email}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => onPreview(student, 'passport')}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center"
                      title="Preview Photos"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onExportPdf(student)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors inline-flex items-center"
                      title="Export PDF Dossier"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
