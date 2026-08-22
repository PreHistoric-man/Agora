import React from 'react';
import { useLauncher } from '../context/LauncherContext';
import { useAuth } from '../context/AuthContext';
import type { LauncherView } from '../types';
import {
  Home,
  Layers,
  Rocket,
  ShoppingBag,
  Settings,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, libraryItems, deployments, models } = useLauncher();
  const { user, signOut, openAuthModal } = useAuth();

  const activeDeploymentsCount = deployments.filter(
    (d) => d.status === 'running' || d.status === 'deploying'
  ).length;

  const navItems: { id: LauncherView; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: Layers, badge: libraryItems.length > 0 ? libraryItems.length : undefined },
    { id: 'deployments', label: 'Deployments', icon: Rocket, badge: activeDeploymentsCount > 0 ? activeDeploymentsCount : undefined },
    { id: 'store', label: 'Store', icon: ShoppingBag, badge: models.length > 0 ? models.length : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-slate-950/80 border-r border-white/10 flex flex-col justify-between p-3 select-none shrink-0">
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
                      isActive
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

      {/* Footer Info / Auth status */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="px-3 py-2 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Agora Desktop v0.1.0</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Universal AI model management & native desktop bridge.
          </p>
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
