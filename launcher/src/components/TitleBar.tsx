import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLauncher } from '../context/LauncherContext';
import { Sparkles, Search, User, LogIn, RefreshCw } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const { searchQuery, setSearchQuery, refreshAll, modelsLoading, libraryLoading, setActiveView } = useLauncher();

  const isSyncing = modelsLoading || libraryLoading;

  return (
    <header className="h-12 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Agora
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
              Launcher
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-[11px] font-medium text-slate-300">Supabase Connected</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI models, tags, providers..."
            className="w-full bg-slate-900/90 border border-white/10 focus:border-cyan-500/60 rounded-full pl-9 pr-4 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right User & Utility Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => refreshAll()}
          title="Refresh Data"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {user ? (
          <div
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center border border-cyan-500/30">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate hidden sm:inline">
              {profile?.display_name || user.email?.split('@')[0]}
            </span>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('signin')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-cyan-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
