import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { StudentRecord } from '../types/student';

interface AiAssistantProps {
  students: StudentRecord[];
  onClose: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ students, onClose }) => {
  const [prompt, setPrompt] = useState('Audit the photo submissions for all MCA students and list any with missing blazer or passport photos.');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async (customPrompt?: string) => {
    const queryPrompt = customPrompt || prompt;
    if (!queryPrompt.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryPrompt,
          studentData: students.map((s) => ({
            prn: s.prn,
            name: s.fullName,
            dept: s.department,
            div: s.division,
            year: s.currentYear,
            hasBlazer: Boolean(s.blazerPhotoUrl),
            hasPassport: Boolean(s.passportPhotoUrl),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI response');
      }

      setAiResponse(data.text || 'No response returned');
    } catch (err: any) {
      setErrorMsg(err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-950 text-white p-5 flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-800/80 rounded-xl border border-indigo-700/60 text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">AI Compliance Auditor & Query Assistant</h3>
              <p className="text-xs text-indigo-300 mt-0.5">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* Quick Preset Queries */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick AI Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const q = 'List all students who have missing blazer photos.';
                  setPrompt(q);
                  handleAnalyze(q);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
              >
                🧥 Missing Blazer Photos
              </button>

              <button
                onClick={() => {
                  const q = 'Give a department-wise statistical summary of photo compliance percentages.';
                  setPrompt(q);
                  handleAnalyze(q);
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition-colors"
              >
                📊 Department Compliance Summary
              </button>

              <button
                onClick={() => {
                  const q = 'Identify duplicate PRNs or missing email addresses in the dataset.';
                  setPrompt(q);
                  handleAnalyze(q);
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200 transition-colors"
              >
                ⚠️ Audit Missing Data
              </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Custom Query Prompt</label>
            </div>
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Gemini anything about student photos, missing records, or department stats..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Run AI Audit Analysis</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Response Container */}
          {aiResponse && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs border-b border-slate-800 pb-2">
                <Bot className="w-4 h-4" />
                <span>Gemini Analysis Result</span>
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                {aiResponse}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
