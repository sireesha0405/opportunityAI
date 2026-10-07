import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else if (mode === 'register') {
        await register(email, password, fullName);
        navigate('/profile');
      } else {
        const res = await api.forgotPassword(email);
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const demoEmail = 'demo.student@opportunityai.local';
      const demoPassword = 'DemoStudent2026!';
      try {
        await login(demoEmail, demoPassword);
      } catch {
        // Register demo student if not yet registered
        await register(demoEmail, demoPassword, 'Aarav Sharma');
      }
      navigate('/');
    } catch (err: any) {
      setErrorMsg('Could not initialize demo login. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-800 shadow-2xl p-8 space-y-6 animate-in fade-in duration-200">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Opportunity<span className="text-blue-500">AI</span>
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Welcome back! Sign in to access your matched career feed.'
              : mode === 'register'
              ? 'Create your student profile and unlock AI-powered opportunity discovery.'
              : 'Enter your registered email to reset your access credentials.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium p-2 rounded-lg bg-rose-950/30 border border-rose-500/20">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 font-medium p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Dashboard'
                : mode === 'register'
                ? 'Create Student Account'
                : 'Send Password Reset'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {mode === 'forgot' && (
          <div className="text-center">
            <button
              onClick={() => setMode('login')}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Demo Login Button */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-3">
          <p className="text-[11px] text-slate-500">Hackathon Reviewer or Testing?</p>
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Demo Student Sign-In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
