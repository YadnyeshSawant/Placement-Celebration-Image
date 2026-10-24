import React from 'react';
import { X, ExternalLink, FileText, Sparkles } from 'lucide-react';

interface GoogleFormModalProps {
  formUrl: string;
  onClose: () => void;
}

export const GoogleFormModal: React.FC<GoogleFormModalProps> = ({ formUrl, onClose }) => {
  const handleOpenTab = () => {
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/30 rounded-xl border border-purple-500/30 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Google Form Submission</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-400/30 font-mono">
                  ENV Configured
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill in student details directly into Google Form</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenTab}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              title="Open Google Form in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={formUrl}
            title="Google Form Student Entry"
            className="w-full h-full border-0"
            allow="autoplay"
          />
        </div>

      </div>
    </div>
  );
};
