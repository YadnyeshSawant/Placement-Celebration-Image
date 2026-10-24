import React, { useEffect, useState } from 'react';
import { GraduationCap, ShieldCheck, Loader2, Lock } from 'lucide-react';

interface LoadingScreenProps {
  onFinishLoading: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinishLoading }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Student Image & Document Portal...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(40);
      setStatusText('Validating Environment & Security Tokens...');
    }, 500);

    const timer2 = setTimeout(() => {
      setProgress(80);
      setStatusText('Preparing Administrative Authentication Page...');
    }, 1100);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Redirecting to Login Page...');
    }, 1700);

    const timer4 = setTimeout(() => {
      onFinishLoading();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinishLoading]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 selection:bg-blue-600 selection:text-white font-sans overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 shadow-xl text-center space-y-6 relative z-10 animate-fade-in">
        
        {/* Animated Brand Logo Icon */}
        <div className="relative inline-block mx-auto">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl shadow-lg shadow-blue-500/20 text-white animate-bounce">
            <GraduationCap className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-xs">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Branding Title */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Student Image & Document Portal
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            MIT-WPU Placement Celebration System
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{statusText}</span>
            </span>
            <span className="text-slate-800 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Security Badge Footnote */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Secured with Environment Variable Credentials</span>
        </div>

      </div>

    </div>
  );
};
