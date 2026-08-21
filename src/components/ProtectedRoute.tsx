import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  title: string;
  description: string;
  targetViewName: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  title,
  description,
  targetViewName
}) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
        <span className="font-sans text-xs text-slate-400">Verifying Supabase authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 animate-fade-in">
        <div className="rounded-3xl glass-panel-heavy p-8 md:p-12 border border-white/10 relative overflow-hidden text-center flex flex-col items-center shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10 mb-6">
            <Lock size={32} />
          </div>

          <div className="relative z-10 max-w-md">
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 font-display text-[10px] font-bold text-cyan-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
              <ShieldCheck size={13} /> Authentication Required
            </span>

            <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-2">
              Access {title}
            </h2>

            <p className="font-sans text-xs md:text-sm text-slate-400 leading-relaxed mb-8">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => openAuthModal('login', targetViewName)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-display text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn size={15} />
                Sign In With Supabase
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('register', targetViewName)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-display text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-cyan-400" />
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
