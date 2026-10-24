import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Link as LinkIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SheetSyncModalProps {
  onClose: () => void;
  onSyncGoogleSheetUrl: (sheetUrl: string) => Promise<boolean>;
  onUploadCsvFile: (file: File) => Promise<boolean>;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  onClose,
  onSyncGoogleSheetUrl,
  onUploadCsvFile,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const success = await onSyncGoogleSheetUrl(sheetUrl.trim());
    setLoading(false);

    if (success) {
      setSuccessMsg('Google Sheet successfully synchronized and parsed!');
      setTimeout(() => onClose(), 1500);
    } else {
      setErrorMsg('Failed to sync Google Sheet. Make sure the sheet sharing setting is set to "Anyone with the link can view".');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const success = await onUploadCsvFile(files[0]);
    setLoading(false);

    if (success) {
      setSuccessMsg('CSV file uploaded and parsed successfully!');
      setTimeout(() => onClose(), 1500);
    } else {
      setErrorMsg('Failed to parse uploaded CSV file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Google Sheet & Data Sync</h3>
              <p className="text-xs text-slate-400 mt-0.5">Connect live Google Sheet URL or upload custom CSV</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Option 1: Live Google Sheet Link */}
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Option 1: Paste Google Sheet Link
            </label>
            <p className="text-xs text-slate-500">
              Paste your published Google Sheet link or public spreadsheet URL.
            </p>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/12345/edit"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !sheetUrl.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Sync Google Sheet</span>
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Option 2: Upload CSV File */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Option 2: Upload CSV Response Export
            </label>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">Click to upload CSV File</span>
              <span className="text-[11px] text-slate-400 mt-1">Accepts Google Forms CSV exports</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

        </div>

      </div>
    </div>
  );
};
