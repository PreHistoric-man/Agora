import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRuntime } from '../../context/RuntimeContext';
import {
  Home,
  Layers,
  Rocket,
  ShoppingBag,
  Settings,
  Cpu,
  LogOut,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import type { LauncherViewType } from '../../types/launcher';

interface LauncherSidebarProps {
  activeView: LauncherViewType;
  onSelectView: (view: LauncherViewType) => void;
  libraryCount: number;
  deploymentsCount: number;
  runningCount: number;
  isNativeTauri?: boolean;
}

export const LauncherSidebar: React.FC<LauncherSidebarProps> = ({
  activeView,
  onSelectView,
  libraryCount,
  deploymentsCount,
  runningCount,
  isNativeTauri = false
}) => {
  const { user, profile, isAuthenticated, signOut, openAuthModal } = useAuth();
  const { runtimeStatus, installedModels, runningModels, isDetecting } = useRuntime();

  const navItems = [
    {
      id: 'home' as LauncherViewType,
      label: 'Home',
      icon: Home,
      badge: null
    },
    {
      id: 'library' as LauncherViewType,
      label: 'Library',
      icon: Layers,
      badge: libraryCount > 0 ? libraryCount : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'deployments' as LauncherViewType,
      label: 'Deployments',
      icon: Rocket,
      badge: deploymentsCount > 0 ? deploymentsCount : null,
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    },
    {
      id: 'store' as LauncherViewType,
      label: 'Store',
      icon: ShoppingBag,
      badge: null
    },
    {
      id: 'settings' as LauncherViewType,
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const totalRunningCount = runningModels.length > 0 ? runningModels.length : runningCount;

  return (
    <aside className="w-60 bg-[#0d0f14] border-r border-white/5 flex flex-col justify-between select-none z-20 shrink-0 h-full">
      {/* Top Nav List */}
      <div className="p-3 space-y-6">
        {/* Navigation items */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Launcher Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Runtime Status Card */}
        <div
          onClick={() => onSelectView('settings')}
          className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 cursor-pointer hover:border-white/10 transition-colors"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Ollama Runtime
            </span>
            {isDetecting ? (
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
                <RotateCw className="w-2.5 h-2.5 animate-spin" />
                Checking
              </span>
            ) : runtimeStatus?.available ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                Offline
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-400 pt-1">
            <div className="flex justify-between items-center">
              <span>Running Models:</span>
              <span className={`font-semibold ${totalRunningCount > 0 ? 'text-emerald-400 font-mono' : 'text-slate-300'}`}>
                {totalRunningCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Local Weights:</span>
              <span className="text-slate-300 font-semibold">{installedModels.length} models</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Engine Status:</span>
              <span className="text-slate-300 font-mono text-[9px]">
                {runtimeStatus?.available ? `v${runtimeStatus.version || '0.5'}` : 'Not Running'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-white/5 bg-[#0a0c10]">
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/50 border border-white/5">
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
              onClick={() => onSelectView('settings')}
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-300 font-bold shrink-0">
                {profile?.avatar_url || (profile?.display_name ? profile.display_name[0].toUpperCase() : 'U')}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {profile?.display_name || profile?.username || user?.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user?.email || 'Local User'}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-2 text-center space-y-2">
            <p className="text-[11px] text-slate-400">Sign in to sync your models & deployments across devices.</p>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-1.5 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-500/20"
            >
              <span>Sign In to Agora</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
