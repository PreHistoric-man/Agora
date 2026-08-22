import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLauncher } from '../context/LauncherContext';
import {
  Settings,
  User,
  Palette,
  HardDrive,
  Cpu,
  Info,
  LogOut,
  LogIn,
  CheckCircle2,
  ExternalLink,
  Shield,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { showToast } = useLauncher();
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'storage' | 'runtime' | 'about'>('account');

  // Settings State
  const [darkMode] = useState<boolean>(true);
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [cacheDirectory, setCacheDirectory] = useState<string>('~/.agora/models');
  const [maxDiskUsageGb, setMaxDiskUsageGb] = useState<number>(64);

  const tabs: { id: 'account' | 'appearance' | 'storage' | 'runtime' | 'about'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'runtime', label: 'Runtime', icon: Cpu },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Settings & Preferences
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure your Agora account, desktop workspace, cache storage, and future runtime preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-6">
        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Supabase Authentication</h3>
                <p className="text-xs text-slate-400">
                  Shared cloud credentials with the Agora Web Application.
                </p>
              </div>

              {user ? (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Email</span>
                  <p className="text-slate-200 font-medium mt-0.5">{user.email}</p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">User ID</span>
                  <p className="text-slate-400 font-mono text-[11px] truncate mt-0.5">{user.id}</p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Display Name</span>
                  <p className="text-slate-200 font-medium mt-0.5">{profile?.display_name || 'Standard User'}</p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Role</span>
                  <p className="text-cyan-400 font-medium mt-0.5 capitalize">{profile?.role || 'Developer'}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 space-y-2">
                <p>
                  You are currently using the desktop launcher in <span className="text-cyan-300 font-semibold">Guest Mode</span>.
                  Your library modifications will only be saved locally on this machine until you log in.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Theme & Display</h3>
              <p className="text-xs text-slate-400">
                Customize desktop window aesthetics and accent themes.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="font-semibold text-slate-200">Dark Mode</div>
                  <div className="text-slate-500 text-[11px]">Steam-inspired deep slate color palette.</div>
                </div>
                <span className="text-cyan-400 font-semibold px-2 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/20">
                  Always Dark
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="font-semibold text-slate-200">Hardware Acceleration</div>
                  <div className="text-slate-500 text-[11px]">Use GPU rasterization for smooth desktop animations.</div>
                </div>
                <input
                  type="checkbox"
                  checked={hardwareAcceleration}
                  onChange={(e) => {
                    setHardwareAcceleration(e.target.checked);
                    showToast('Preference updated', 'info');
                  }}
                  className="rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Storage & Weight Catalog</h3>
              <p className="text-xs text-slate-400">
                Configure directories and local cache quotas for future weight downloads.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <div className="font-semibold text-slate-200">Default Models Directory</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cacheDirectory}
                    onChange={(e) => setCacheDirectory(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                  />
                  <button
                    onClick={() => showToast('Directory path updated', 'success')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-200">Max Disk Allocation Quota</span>
                  <span className="font-mono text-cyan-300">{maxDiskUsageGb} GB</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={256}
                  step={8}
                  value={maxDiskUsageGb}
                  onChange={(e) => setMaxDiskUsageGb(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Runtime Tab */}
        {activeTab === 'runtime' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Local Runtime Engine</h3>
              <p className="text-xs text-slate-400">
                Local runtime integration (Ollama, vLLM, Docker) will be enabled in the upcoming update.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <Cpu className="w-4 h-4" />
                <span>Runtime Engine Architecture</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The Agora Launcher is built on Tauri 2 with secure native Rust command bindings. Local weight execution, automatic model quantization, and GPU memory management will be activated in Phase 2.
              </p>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">About Agora Launcher</h3>
              <p className="text-xs text-slate-400">
                Universal AI Model Hub & Orchestration Platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-white/5 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase text-[10px]">App Name</span>
                <p className="text-slate-200 mt-0.5">Agora Launcher</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Version</span>
                <p className="text-cyan-400 mt-0.5">0.1.0 (Tauri 2 Native)</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Identifier</span>
                <p className="text-slate-200 mt-0.5">com.agora.launcher</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Framework</span>
                <p className="text-slate-200 mt-0.5">React 19 + Vite 6 + Rust</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>© 2026 Agora AI. All rights reserved.</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Encrypted Supabase Session</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
