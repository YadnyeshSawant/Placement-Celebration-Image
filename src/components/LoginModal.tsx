import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldCheck, AlertCircle, LogIn, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string, appId: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [appId, setAppId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      onLoginSuccess(data.token, data.user.appId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-500/30 text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Confidential Portal Sign-In</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enter App ID & Password stored in ENV</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Secure Authentication</span>
              <span className="text-blue-700/90 text-[11px] block mt-0.5">
                Credentials are saved confidentially in environment variables (<code className="font-mono bg-blue-100 px-1 rounded">ADMIN_USER</code> & <code className="font-mono bg-blue-100 px-1 rounded">ADMIN_PASSWORD</code>).
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              App ID / Admin User
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g. admin@mitwpu.edu.in"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Confidential Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !appId || !password}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
          </button>

          <div className="text-center pt-1">
            <span className="text-[11px] text-slate-400">
              Default ENV credentials: <code className="font-mono text-slate-600">admin@mitwpu.edu.in</code> / <code className="font-mono text-slate-600">AdminPassword123!</code>
            </span>
          </div>

        </form>

      </div>
    </div>
  );
};
