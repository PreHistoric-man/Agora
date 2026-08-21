import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRuntime } from '../../context/RuntimeContext';
import {
  Globe,
  Minus,
  Square,
  X,
  LogIn,
  Settings,
  CheckCircle2,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import type { LauncherViewType } from '../../types/launcher';

interface LauncherTitleBarProps {
  activeView: LauncherViewType;
  onSelectView: (view: LauncherViewType) => void;
  onToggleWebMode: () => void;
  isNativeTauri?: boolean;
}

export const LauncherTitleBar: React.FC<LauncherTitleBarProps> = ({
  onSelectView,
  onToggleWebMode,
  isNativeTauri = false
}) => {
  const { user, profile, isAuthenticated, openAuthModal } = useAuth();
  const { runtimeStatus, isDetecting, refreshRuntime } = useRuntime();

  return (
    <header className="h-11 bg-[#0e1017] border-b border-white/5 px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Branding & Native Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center font-black text-[10px] text-white shadow-sm shadow-cyan-500/20">
            A
          </div>
          <span className="font-extrabold tracking-wider text-xs uppercase bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            Agora
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/5">
            Launcher
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/10 mx-1 hidden sm:block" />

        {/* Ollama Runtime Status Indicator */}
        <button
          onClick={() => onSelectView('settings')}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
            runtimeStatus?.available
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title={
            runtimeStatus?.available
              ? `Ollama v${runtimeStatus.version || '0.5+'} Ready at ${runtimeStatus.endpoint} (${runtimeStatus.models_count} local models)`
              : 'Ollama local runtime not detected. Click to view setup and diagnostics.'
          }
        >
          {isDetecting ? (
            <RotateCw className="w-3 h-3 animate-spin text-cyan-400" />
          ) : runtimeStatus?.available ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          )}
          <span className="font-mono">
            {isDetecting
              ? 'Detecting Ollama...'
              : runtimeStatus?.available
              ? `Ollama v${runtimeStatus.version || '0.5'} 🟢`
              : 'Ollama Offline 🔴'}
          </span>
        </button>
      </div>

      {/* Center / Right tools */}
      <div className="flex items-center gap-2">
        {/* Switch to Web Application Toggle */}
        <button
          onClick={onToggleWebMode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-sm"
          title="Switch to Agora Full Web Marketplace & Playground"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Open Web App</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => onSelectView('settings')}
          className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          title="Launcher Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile / Auth Button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onSelectView('settings')}>
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px] text-cyan-300 font-bold">
              {profile?.avatar_url || (profile?.display_name ? profile.display_name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U')}
            </div>
            <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate hidden sm:inline">
              {profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'User'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <div className="h-3.5 w-px bg-white/10 mx-0.5" />

        {/* Window controls (Steam/Desktop style) */}
        <div className="flex items-center gap-0.5 text-slate-400">
          <button
            onClick={() => {}}
            className="w-7 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {}}
            className="w-7 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            title="Maximize / Restore"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {}}
            className="w-7 h-6 flex items-center justify-center hover:bg-rose-500 hover:text-white rounded transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
