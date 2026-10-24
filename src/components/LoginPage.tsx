import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Shield
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, appId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
}) => {
  const [appId, setAppId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: appId.trim(), password: password.trim() }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Server Error (${response.status}): ${responseText.slice(0, 120)}`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Please verify your App ID and Password.');
      }

      onLoginSuccess(data.token, data.user.appId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Logo */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-md shadow-blue-500/20 text-white">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 block">
              Student Image & Document Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              MIT-WPU Placement Celebration Records
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-2xs rounded-xl text-xs text-emerald-700 font-bold">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Restricted Portal Access</span>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-200/60 space-y-6">
          
          {/* Title Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 bg-blue-50 border border-blue-200/80 rounded-2xl text-blue-600 mb-1 shadow-2xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Administrative Sign-In
            </h2>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2.5 animate-fade-in font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* App ID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                App ID / Admin User
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="e.g. admin@mitwpu.edu.in"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Confidential Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !appId || !password}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all mt-2"
            >
              <span>{loading ? 'Authenticating JWT...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Security Rules Summary Footer */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Session Security Rules</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[10.5px]">
              <li>5-minute inactivity auto-logout</li>
              <li>Auto-logout upon closing tab or window</li>
              <li>Protected JWT token signature verification</li>
            </ul>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 z-10 border-t border-slate-200 bg-white">
        Student Image & Document Management System • Confidential & Protected
      </footer>

    </div>
  );
};
