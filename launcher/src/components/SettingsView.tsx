import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLauncher } from '../context/LauncherContext';
import { useRuntime } from '../context/RuntimeContext';
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
  RotateCw,
  Play,
  Square,
  Trash2,
  Terminal,
  AlertTriangle,
  Server,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { showToast, setActiveView } = useLauncher();
  const {
    endpoint,
    setEndpoint,
    runtimeStatus,
    installedModels,
    runningModels,
    refreshRuntime,
    isChecking,
    startModel,
    stopModel,
    deleteModel,
    startingTags,
    stoppingTags,
  } = useRuntime();

  const [activeTab, setActiveTab] = useState<'account' | 'runtime' | 'storage' | 'appearance' | 'about'>('runtime');

  // Settings State
  const [tempEndpoint, setTempEndpoint] = useState<string>(endpoint);
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [cacheDirectory, setCacheDirectory] = useState<string>('~/.ollama/models');
  const [maxDiskUsageGb, setMaxDiskUsageGb] = useState<number>(64);

  const tabs: { id: 'runtime' | 'account' | 'storage' | 'appearance' | 'about'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'runtime', label: 'Local Runtime (Ollama)', icon: Cpu },
    { id: 'account', label: 'Account', icon: User },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleSaveEndpoint = async () => {
    setEndpoint(tempEndpoint);
    showToast('Ollama endpoint updated', 'success');
    await refreshRuntime();
  };

  const totalLocalSize = installedModels.reduce((acc, m) => acc + (m.size || 0), 0);

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
          Configure local Ollama runtime endpoints, monitor GPU model execution, manage storage, and sync your Agora account.
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
        {/* Runtime Tab */}
        {activeTab === 'runtime' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Local Ollama Runtime Engine</h3>
              <p className="text-xs text-slate-400">
                Manage your local inference server connection and inspect active GPU/VRAM models.
              </p>
            </div>

            {/* Server Endpoint Configuration */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-200">Ollama API Host Endpoint</div>
                  <div className="text-[11px] text-slate-400">
                    Default is <code className="font-mono text-cyan-300">http://127.0.0.1:11434</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      runtimeStatus.state === 'online'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : runtimeStatus.state === 'stopped'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        runtimeStatus.state === 'online'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="capitalize">{runtimeStatus.state}</span>
                    {runtimeStatus.version && <span>(v{runtimeStatus.version})</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={tempEndpoint}
                  onChange={(e) => setTempEndpoint(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="flex-1 bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                />
                <button
                  onClick={handleSaveEndpoint}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shrink-0"
                >
                  Save Endpoint
                </button>
                <button
                  onClick={() => refreshRuntime()}
                  disabled={isChecking}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                  title="Test Connection"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Live Telemetry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Installed Models
                </span>
                <p className="text-base font-bold text-white font-mono">{installedModels.length}</p>
                <p className="text-[10px] text-slate-400">
                  {(totalLocalSize / (1024 * 1024 * 1024)).toFixed(2)} GB on disk
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Loaded in VRAM / RAM
                </span>
                <p className="text-base font-bold text-emerald-400 font-mono">
                  {runningModels.length} Active
                </p>
                <p className="text-[10px] text-slate-400">
                  {runningModels.length > 0 ? runningModels.map((r) => r.name).join(', ') : 'No model loaded'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Playground Status
                </span>
                <p className="text-base font-bold text-cyan-300 font-mono">
                  {runningModels.length > 0 ? 'Ready to Chat' : 'Standby'}
                </p>
                <button
                  onClick={() => setActiveView('playground')}
                  className="text-[10px] text-cyan-400 hover:underline font-semibold"
                >
                  Go to Playground →
                </button>
              </div>
            </div>

            {/* Installed Local Models Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Locally Stored Weights ({installedModels.length})
                </h4>
                <button
                  onClick={() => setActiveView('library')}
                  className="text-xs text-cyan-400 hover:underline font-semibold"
                >
                  + Add from Library
                </button>
              </div>

              {installedModels.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/40 border border-white/5 text-center text-xs text-slate-400 space-y-2">
                  <p>No model weights detected in your local Ollama storage.</p>
                  <button
                    onClick={() => setActiveView('library')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                  >
                    Install Open Models
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {installedModels.map((m) => {
                    const isRunning = runningModels.some(
                      (r) =>
                        r.name.toLowerCase() === m.name.toLowerCase() ||
                        r.model.toLowerCase() === m.model.toLowerCase()
                    );
                    const isStarting = startingTags.has(m.name);
                    const isStopping = stoppingTags.has(m.name);

                    return (
                      <div
                        key={m.name}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">{m.name}</span>
                            {isRunning ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🟢 Loaded in VRAM
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                Stopped
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>Size: <strong className="text-slate-200">{m.sizeFormatted}</strong></span>
                            {m.details?.parameter_size && (
                              <>
                                <span>•</span>
                                <span>Params: {m.details.parameter_size}</span>
                              </>
                            )}
                            {m.details?.quantization_level && (
                              <>
                                <span>•</span>
                                <span>Quant: {m.details.quantization_level}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isRunning ? (
                            <button
                              onClick={() => stopModel(m.name)}
                              disabled={isStopping}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Square className="w-3 h-3" />
                              <span>Stop</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => startModel(m.name)}
                              disabled={isStarting}
                              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Load</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete local weights for ${m.name}?`)) {
                                deleteModel(m.name);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete model from disk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Terminal Guide */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-2">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Ollama Quick Reference</span>
              </div>
              <p className="text-slate-400">
                To start or pull models directly via terminal:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-cyan-300 space-y-1">
                <div>ollama run qwen2.5-coder:7b</div>
                <div>ollama run deepseek-r1:8b</div>
                <div>ollama ps</div>
              </div>
            </div>
          </div>
        )}

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

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Storage & Weight Catalog</h3>
              <p className="text-xs text-slate-400">
                Configure directories and local cache quotas for weight storage.
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
                <span className="text-slate-500 uppercase text-[10px]">Runtime Engine</span>
                <p className="text-slate-200 mt-0.5">Ollama Native Bridge</p>
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
