import React, { useState } from 'react';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import { StudentRecord } from '../types/student';
import { generateBatchCatalogPdf, generateStudentPdf } from '../services/pdfExporter';

interface BatchPdfModalProps {
  students: StudentRecord[];
  activeFilterTitle: string;
  onClose: () => void;
  onStartExportWithLoading?: (studentName: string, prn: string, task: () => Promise<void>) => void;
}

export const BatchPdfModal: React.FC<BatchPdfModalProps> = ({
  students,
  activeFilterTitle,
  onClose,
  onStartExportWithLoading,
}) => {
  const [exportType, setExportType] = useState<'catalog' | 'individual_all'>('catalog');
  const [isExporting, setIsExporting] = useState(false);
  const [progressCount, setProgressCount] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgressCount(0);

    try {
      if (exportType === 'catalog') {
        if (onStartExportWithLoading) {
          onClose();
          onStartExportWithLoading(activeFilterTitle, 'BATCH_CATALOG', async () => {
            await generateBatchCatalogPdf(students, activeFilterTitle);
          });
          return;
        } else {
          await generateBatchCatalogPdf(students, activeFilterTitle);
        }
      } else {
        // Individual PDF for each student
        if (onStartExportWithLoading && students.length > 0) {
          onClose();
          const target = students[0];
          onStartExportWithLoading(target.fullName, target.prn, async () => {
            for (let i = 0; i < Math.min(students.length, 10); i++) {
              await generateStudentPdf(students[i]);
            }
          });
          return;
        } else {
          for (let i = 0; i < Math.min(students.length, 10); i++) {
            await generateStudentPdf(students[i]);
            setProgressCount(i + 1);
          }
        }
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header - Bright Theme */}
        <div className="bg-white text-slate-900 p-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 shadow-2xs">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Batch Export to PDF</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Filtered selection: <strong>{students.length} Students</strong> ({activeFilterTitle})
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

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select PDF Export Format
            </label>

            {/* Catalog Option */}
            <div
              onClick={() => setExportType('catalog')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                exportType === 'catalog'
                  ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Summary Verification Catalog PDF</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Single consolidated document listing all active filtered students, PRN, branch, and submission status.
                </p>
              </div>
            </div>

            {/* Individual Option */}
            <div
              onClick={() => setExportType('individual_all')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                exportType === 'individual_all'
                  ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Individual Student Dossier PDFs</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Generates full-page verification PDFs for each student with high-resolution photos (up to first 10 selected).
                </p>
              </div>
            </div>
          </div>

          {isExporting && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-blue-900">Generating PDF Document...</p>
              {exportType === 'individual_all' && (
                <p className="text-[11px] text-blue-700">Processed {progressCount} of 10 students</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || students.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Generate & Download PDF</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
