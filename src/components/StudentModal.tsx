import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  CheckCircle2,
  GraduationCap,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  FileSearch
} from 'lucide-react';
import { StudentRecord } from '../types/student';
import {
  getDisplayImageUrl,
  getDriveViewUrl,
  getDriveDownloadUrl,
  getDriveEmbedPreviewUrl,
  isPdfUrl
} from '../services/driveUtils';

interface StudentModalProps {
  student: StudentRecord | null;
  defaultPhoto: 'passport' | 'blazer';
  onClose: () => void;
  onExportPdf: (student: StudentRecord) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  student,
  defaultPhoto,
  onClose,
  onExportPdf,
}) => {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<'passport' | 'blazer'>(defaultPhoto);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'image' | 'pdf_embed'>('pdf_embed');

  const currentUrl = activeTab === 'passport' ? student.passportPhotoUrl : student.blazerPhotoUrl;
  const currentDisplayUrl = getDisplayImageUrl(currentUrl);
  const currentEmbedUrl = getDriveEmbedPreviewUrl(currentUrl);
  const currentIsPdf = isPdfUrl(currentUrl);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 p-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-extrabold text-slate-900">{student.fullName}</h3>
                <span className="text-slate-300 font-normal text-base">•</span>
                <span className="font-mono text-lg font-extrabold text-blue-600">
                  {student.prn}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {student.department} • Div {student.division} • Year {student.currentYear}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50">
          
          {/* Left Column: Image / PDF Interactive Viewer */}
          <div className="md:col-span-8 flex flex-col space-y-3">
            
            {/* Selection Tabs & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200 gap-2">
              <div className="flex space-x-1 w-full sm:w-auto">
                <button
                  onClick={() => { setActiveTab('passport'); handleResetZoom(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'passport'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>1. Passport Photo</span>
                  {student.passportPhotoUrl && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>

                <button
                  onClick={() => { setActiveTab('blazer'); handleResetZoom(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'blazer'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>2. Creative Photo</span>
                  {student.blazerPhotoUrl && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>
              </div>

              {/* Display Mode Switcher (PDF Embed vs Image Zoom) */}
              {currentUrl && (
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  {currentEmbedUrl && (
                    <button
                      onClick={() => setViewMode('pdf_embed')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        viewMode === 'pdf_embed' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                      }`}
                      title="Render interactive PDF / Document viewer frame"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Document / PDF Reader</span>
                    </button>
                  )}

                  <button
                    onClick={() => setViewMode('image')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      viewMode === 'image' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                    }`}
                    title="Render image thumbnail"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Image Preview</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main Interactive Screen */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 h-[420px] flex items-center justify-center overflow-hidden relative group">
              {currentUrl ? (
                viewMode === 'pdf_embed' && currentEmbedUrl ? (
                  <iframe
                    src={currentEmbedUrl}
                    title="Document PDF Viewer"
                    className="w-full h-full border-0 bg-white"
                    allow="autoplay"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
                    <img
                      src={currentDisplayUrl}
                      alt={`${activeTab} - ${student.fullName}`}
                      style={{ transform: `scale(${zoomLevel})` }}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                    />
                  </div>
                )
              ) : (
                <div className="text-center text-slate-500 p-6">
                  <p className="text-sm font-semibold">No file or photo uploaded for this slot.</p>
                </div>
              )}
            </div>

            {/* Zoom Controls for Image View */}
            {currentUrl && viewMode === 'image' && (
              <div className="flex items-center justify-between bg-white p-2 px-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold">Image Zoom Control:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-slate-700 w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Photo & Document Action Bar */}
            {currentUrl && (
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <FileSearch className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Drive Attachment Link</span>
                </span>
                <div className="flex items-center space-x-2">
                  <a
                    href={getDriveViewUrl(currentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Drive</span>
                  </a>
                  <a
                    href={getDriveDownloadUrl(currentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Source File</span>
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Detailed Info & Dossier Actions */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Student Profile Metadata</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">VERIFIED</span>
              </h4>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">Full Name</span>
                  <span className="text-base font-extrabold text-slate-900">{student.fullName}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">Permanent Registration No. (PRN)</span>
                  <span className="font-mono text-base font-extrabold text-blue-600">{student.prn}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">Department & Branch</span>
                  <span className="text-sm font-bold text-slate-900">{student.department}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Division</span>
                    <span className="text-sm font-extrabold text-slate-900">{student.division}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Current Year</span>
                    <span className="text-sm font-extrabold text-slate-900">{student.currentYear}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">Email Address</span>
                  <span className="text-xs font-semibold text-slate-800 break-all">{student.email}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">Form Submission Timestamp</span>
                  <span className="text-xs font-mono font-semibold text-slate-600">{student.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Generate Student PDF Dossier Button */}
            <div className="bg-blue-50/80 border border-blue-200 text-slate-900 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center space-x-2 text-blue-900">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Verification Dossier</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Generate an official formatted A4 PDF verification document containing student details and both submitted files.
              </p>
              <button
                onClick={() => onExportPdf(student)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Official Student PDF</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
