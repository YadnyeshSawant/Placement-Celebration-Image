import React from 'react';
import { FileText, ShieldCheck, Download, X, CheckCircle2 } from 'lucide-react';

interface PdfExportLoadingModalProps {
  studentName?: string;
  prn?: string;
  progress: number;
  isReady: boolean;
  onDownload: () => void;
  onCancel: () => void;
}

export const PdfExportLoadingModal: React.FC<PdfExportLoadingModalProps> = ({
  studentName = 'Candidate Record',
  prn = '1272250051',
  progress,
  isReady,
  onDownload,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full flex flex-col items-center justify-center px-4 backdrop-blur-xl bg-slate-100/70 font-sans select-none animate-fade-in overflow-hidden">
      
      {/* Background Ambient Light Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-blue-100/60 rounded-full blur-[110px] pointer-events-none" />

      {/* Central Pristine White Frosted Glass Card */}
      <div className="relative flex flex-col items-center justify-center px-8 py-10 sm:px-12 sm:py-11 rounded-3xl bg-white/95 border border-white/90 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.18),0_4px_16px_rgba(15,23,42,0.06)] backdrop-blur-2xl max-w-md w-full text-center z-10 transition-all">
        
        {/* Top Status Pill */}
        {!isReady ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold tracking-wide uppercase mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            <span>Secure Document Engine</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-6 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Document Compiled & Sealed</span>
          </div>
        )}

        {/* Circular Loader / Ready Badge */}
        {!isReady ? (
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            {/* Outer Ambient Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-300/30 via-blue-400/20 to-indigo-300/30 blur-lg" />
            
            {/* DotsRing Animated Component */}
            <div className="relative w-32 h-32 flex items-center justify-center animate-[spin_3s_linear_infinite]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="12" r="4.5" fill="#2563eb" className="animate-pulse" style={{ animationDelay: '0s' }} />
                <circle cx="69" cy="17" r="4.2" fill="#2563eb" className="animate-pulse" style={{ animationDelay: '0.12s', opacity: 0.92 }} />
                <circle cx="84" cy="31" r="3.9" fill="#3b82f6" className="animate-pulse" style={{ animationDelay: '0.24s', opacity: 0.82 }} />
                <circle cx="88" cy="50" r="3.6" fill="#3b82f6" className="animate-pulse" style={{ animationDelay: '0.36s', opacity: 0.72 }} />
                <circle cx="84" cy="69" r="3.3" fill="#60a5fa" className="animate-pulse" style={{ animationDelay: '0.48s', opacity: 0.62 }} />
                <circle cx="69" cy="83" r="3" fill="#60a5fa" className="animate-pulse" style={{ animationDelay: '0.6s', opacity: 0.52 }} />
                <circle cx="50" cy="88" r="2.8" fill="#93c5fd" className="animate-pulse" style={{ animationDelay: '0.72s', opacity: 0.42 }} />
                <circle cx="31" cy="83" r="2.6" fill="#93c5fd" className="animate-pulse" style={{ animationDelay: '0.84s', opacity: 0.35 }} />
                <circle cx="16" cy="69" r="2.5" fill="#bfdbfe" className="animate-pulse" style={{ animationDelay: '0.96s', opacity: 0.28 }} />
                <circle cx="12" cy="50" r="2.4" fill="#bfdbfe" className="animate-pulse" style={{ animationDelay: '1.08s', opacity: 0.22 }} />
                <circle cx="16" cy="31" r="2.5" fill="#dbeafe" className="animate-pulse" style={{ animationDelay: '1.2s', opacity: 0.18 }} />
                <circle cx="31" cy="17" r="3.2" fill="#60a5fa" className="animate-pulse" style={{ animationDelay: '1.32s', opacity: 0.3 }} />
              </svg>
            </div>

            {/* Inner Frosted Glass Disc with Document Icon */}
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-sky-50 to-white border border-sky-100 shadow-[0_4px_12px_rgba(37,99,235,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center backdrop-blur-md">
              <FileText className="w-7 h-7 text-blue-600 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="relative w-28 h-28 flex items-center justify-center my-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
        )}

        {/* Typography & Status */}
        <div className="mt-4 space-y-1.5">
          {!isReady ? (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-1">
                <span>Assembling Dossier</span>
                <span className="inline-flex overflow-hidden text-blue-600 animate-pulse">...</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed mx-auto">
                Processing verified credentials and photo assets into high-resolution PDF dossier.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Dossier Ready for Download
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed mx-auto">
                PDF compiled successfully for <strong>{studentName}</strong>. Click below to save or cancel.
              </p>
            </>
          )}
        </div>

        {/* Progress Meter Indicator */}
        <div className="w-full mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
            <span className={isReady ? "text-emerald-700" : "text-blue-600"}>
              {isReady ? "100% Ready" : "Rendering Assets"}
            </span>
            <span className="text-slate-800 font-mono">{progress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isReady
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
            <span className="truncate max-w-[200px]" title={`PRN: ${prn}`}>
              PRN: {prn}
            </span>
            <span className="font-mono font-medium">A4 High-Res</span>
          </div>
        </div>

        {/* Action Buttons: Shown when ready OR processing */}
        {!isReady ? (
          <div className="mt-5 w-full">
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-semibold underline underline-offset-4 decoration-slate-300 hover:decoration-slate-600"
            >
              Cancel Export
            </button>
          </div>
        ) : (
          <div className="mt-6 w-full flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              onClick={onDownload}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        )}

      </div>

      {/* Security Footer Branding */}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs text-slate-700 backdrop-blur-md z-10">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium text-[11px]">
          256-Bit Cryptographic Ledger Verification • Official Dossier Service
        </span>
      </div>

    </div>
  );
};
