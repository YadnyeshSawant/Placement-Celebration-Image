import React, { useState } from 'react';
import {
  ExternalLink,
  Download,
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Mail,
  GraduationCap
} from 'lucide-react';
import { StudentRecord } from '../types/student';
import {
  getDisplayImageUrl,
  getDriveViewUrl,
  getDriveDownloadUrl,
  isPdfUrl
} from '../services/driveUtils';

interface StudentCardProps {
  student: StudentRecord;
  onPreview: (student: StudentRecord, defaultPhoto: 'passport' | 'blazer') => void;
  onExportPdf: (student: StudentRecord) => void;
  onEdit?: (student: StudentRecord) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onPreview,
  onExportPdf,
}) => {
  const [passportError, setPassportError] = useState(false);
  const [blazerError, setBlazerError] = useState(false);

  const passportDisplayUrl = getDisplayImageUrl(student.passportPhotoUrl);
  const blazerDisplayUrl = getDisplayImageUrl(student.blazerPhotoUrl);

  const passportIsPdf = isPdfUrl(student.passportPhotoUrl);
  const blazerIsPdf = isPdfUrl(student.blazerPhotoUrl);

  const hasBoth = Boolean(student.passportPhotoUrl && student.blazerPhotoUrl);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Top Banner Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/80 text-slate-900 relative">
        <div className="flex items-start justify-between gap-2">
          
          <div className="w-full">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-base font-extrabold text-blue-700 tracking-wider">
                {student.prn}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-indigo-100/80 text-indigo-800 border border-indigo-200/80 rounded-md shadow-2xs">
                {student.department}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
              {student.fullName}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Div: <strong className="text-slate-900 font-extrabold">{student.division}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">
                Year: <strong className="text-slate-900 font-extrabold">{student.currentYear}</strong>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Two Photos Grid Container */}
      <div className="p-3 bg-slate-50/80 grid grid-cols-2 gap-2.5 flex-1">
        
        {/* Photo 1: Passport Size Photo */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col items-center justify-between shadow-2xs group/photo relative">
          <div className="w-full text-center pb-1 mb-1 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              1. Passport
              {passportIsPdf && (
                <span className="text-[9px] px-1 bg-indigo-100 text-indigo-700 font-bold rounded">PDF</span>
              )}
            </span>
            {student.passportPhotoUrl && (
              <a
                href={getDriveViewUrl(student.passportPhotoUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div
            onClick={() => student.passportPhotoUrl && onPreview(student, 'passport')}
            className={`w-full h-36 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer group/img ${
              !student.passportPhotoUrl ? 'cursor-default' : ''
            }`}
          >
            {student.passportPhotoUrl && !passportError ? (
              <>
                <img
                  src={passportDisplayUrl}
                  alt={`Passport - ${student.fullName}`}
                  onError={() => setPassportError(true)}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {passportIsPdf && (
                  <div className="absolute top-1 right-1 bg-indigo-600/90 text-white p-1 rounded text-[9px] font-bold flex items-center gap-0.5 shadow">
                    <FileText className="w-3 h-3" /> PDF
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Click To View</span>
                </div>
              </>
            ) : passportIsPdf ? (
              <div className="flex flex-col items-center justify-center text-center p-2 text-indigo-600">
                <FileText className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-bold">PDF Document</span>
                <span className="text-[9px] text-slate-500">Click to View</span>
              </div>
            ) : (
              <div className="text-center p-2 text-slate-400">
                <UserCheck className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <span className="text-[10px] block font-medium">No Passport Photo</span>
              </div>
            )}
          </div>

          {student.passportPhotoUrl && (
            <div className="w-full pt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
              <a
                href={getDriveDownloadUrl(student.passportPhotoUrl)}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                title="Download Photo or PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Photo 2: Blazer & Uniform Photo */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col items-center justify-between shadow-2xs group/photo relative">
          <div className="w-full text-center pb-1 mb-1 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              2. Creative
              {blazerIsPdf && (
                <span className="text-[9px] px-1 bg-indigo-100 text-indigo-700 font-bold rounded">PDF</span>
              )}
            </span>
            {student.blazerPhotoUrl && (
              <a
                href={getDriveViewUrl(student.blazerPhotoUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div
            onClick={() => student.blazerPhotoUrl && onPreview(student, 'blazer')}
            className={`w-full h-36 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer group/img ${
              !student.blazerPhotoUrl ? 'cursor-default' : ''
            }`}
          >
            {student.blazerPhotoUrl && !blazerError ? (
              <>
                <img
                  src={blazerDisplayUrl}
                  alt={`Blazer Uniform - ${student.fullName}`}
                  onError={() => setBlazerError(true)}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {blazerIsPdf && (
                  <div className="absolute top-1 right-1 bg-indigo-600/90 text-white p-1 rounded text-[9px] font-bold flex items-center gap-0.5 shadow">
                    <FileText className="w-3 h-3" /> PDF
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Click To View</span>
                </div>
              </>
            ) : blazerIsPdf ? (
              <div className="flex flex-col items-center justify-center text-center p-2 text-indigo-600">
                <FileText className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-bold">PDF Document</span>
                <span className="text-[9px] text-slate-500">Click to View</span>
              </div>
            ) : (
              <div className="text-center p-2 text-slate-400">
                <UserCheck className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <span className="text-[10px] block font-medium">No Blazer Photo</span>
              </div>
            )}
          </div>

          {student.blazerPhotoUrl && (
            <div className="w-full pt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-[10px] font-medium text-blue-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
              <a
                href={getDriveDownloadUrl(student.blazerPhotoUrl)}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                title="Download Photo or PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Card Footer Info & PDF Export Button */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center text-slate-500 truncate max-w-[65%]">
          <Mail className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]" title={student.email}>
            {student.email}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onExportPdf(student)}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors flex items-center gap-1 text-[11px]"
            title="Download PDF Dossier for this student"
          >
            <Download className="w-3 h-3 text-blue-600" />
            <span>PDF Dossier</span>
          </button>
        </div>
      </div>

    </div>
  );
};
