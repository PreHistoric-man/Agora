import React from 'react';
import { useLauncher } from '../context/LauncherContext';
import { useAuth } from '../context/AuthContext';
import { useRuntime } from '../context/RuntimeContext';
import type { LauncherView } from '../types';
import {
  Home,
  Layers,
  Terminal,
  Rocket,
  ShoppingBag,
  Settings,
  LogIn,
  LogOut,
  Sparkles,
  Cpu,
  RotateCw,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, libraryItems, deployments, models } = useLauncher();
  const { user, signOut, openAuthModal } = useAuth();
  const { runtimeStatus, runningModels, installedModels, refreshRuntime, isChecking } = useRuntime();

  const activeDeploymentsCount = deployments.filter(
    (d) => d.status === 'running' || d.status === 'deploying'
  ).length;

  const runningLocalCount = runningModels.length;

  const navItems: {
    id: LauncherView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    {
      id: 'library',
      label: 'Library',
      icon: Layers,
      badge: libraryItems.length > 0 ? libraryItems.length : undefined,
    },
    {
      id: 'playground',
      label: 'Playground',
      icon: Terminal,
      badge: runningLocalCount > 0 ? `${runningLocalCount} Active` : installedModels.length > 0 ? `${installedModels.length}` : undefined,
      badgeColor: runningLocalCount > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : undefined,
    },
    {
      id: 'deployments',
      label: 'Deployments',
      icon: Rocket,
      badge: activeDeploymentsCount > 0 ? activeDeploymentsCount : undefined,
    },
    {
      id: 'store',
      label: 'Store',
      icon: ShoppingBag,
      badge: models.length > 0 ? models.length : undefined,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-slate-950/90 border-r border-white/10 flex flex-col justify-between p-3 select-none shrink-0">
      {/* Navigation Group */}
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-cyan-500/30 text-cyan-200'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Ollama status & Auth status */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        {/* Ollama Engine Status Pill */}
        <div
          onClick={() => setActiveView('settings')}
          className="px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer space-y-1 group"
          title="Click to manage Ollama configuration in Settings"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ollama Engine</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshRuntime();
              }}
              className="text-slate-500 hover:text-cyan-400 p-0.5"
              title="Refresh connection"
            >
              <RotateCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                runtimeStatus.state === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : runtimeStatus.state === 'stopped'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span
              className={
                runtimeStatus.state === 'online'
                  ? 'text-emerald-300 font-semibold'
                  : runtimeStatus.state === 'stopped'
                  ? 'text-amber-300'
                  : 'text-rose-300'
              }
            >
              {runtimeStatus.state === 'online'
                ? `Online (${runtimeStatus.version || 'v0.5'})`
                : 'Offline / Stopped'}
            </span>
          </div>
        </div>

        {user ? (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Sync</span>
          </button>
        )}
      </div>
    </aside>
  );
};
