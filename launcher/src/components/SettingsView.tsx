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
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { showToast, setActiveView } = useLauncher();
  const {
    endpoint,
    setEndpoint,
    runtimeMode,
    setRuntimeMode,
    runtimeStatus,
    installedModels,
    runningModels,
    refreshRuntime,
    resetDemo,
    isChecking,
    startModel,
    stopModel,
    deleteModel,
    startingTags,
    stoppingTags,
  } = useRuntime();

  const [activeTab, setActiveTab] = useState<'runtime' | 'account' | 'storage' | 'appearance' | 'about'>('runtime');

  // Settings State
  const [tempEndpoint, setTempEndpoint] = useState<string>(endpoint);
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [cacheDirectory, setCacheDirectory] = useState<string>('~/.ollama/models');
  const [maxDiskUsageGb, setMaxDiskUsageGb] = useState<number>(64);

  const tabs: { id: 'runtime' | 'account' | 'storage' | 'appearance' | 'about'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'runtime', label: 'Local Runtime', icon: Cpu },
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
          Configure local AI runtimes (Ollama or Demo Runtime), monitor GPU models, manage storage, and sync your Agora account.
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
              <h3 className="text-sm font-bold text-white">Local AI Runtime Engine</h3>
              <p className="text-xs text-slate-400">
                Select your preferred runtime provider or toggle Demo Mode for hackathons and offline presentations.
              </p>
            </div>

            {/* Runtime Mode Selector Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="text-xs font-bold text-slate-200">Active Runtime Selection</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Ollama Option */}
                <button
                  onClick={() => {
                    setRuntimeMode('ollama');
                    showToast('Switched to Ollama Runtime', 'info');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    runtimeMode === 'ollama'
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Ollama (Real AI)
                    </span>
                    {runtimeMode === 'ollama' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Connects to your local Ollama server for real GPU/CPU quantized model execution. Requires local Ollama installation.
                  </p>
                </button>

                {/* Demo Runtime Option */}
                <button
                  onClick={() => {
                    setRuntimeMode('demo');
                    showToast('Switched to Demo Runtime', 'info');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    runtimeMode === 'demo'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Demo Runtime
                    </span>
                    {runtimeMode === 'demo' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Built-in deterministic local simulation engine for hackathon evaluations. No Ollama or external API keys needed.
                  </p>
                </button>
              </div>
            </div>

            {/* Ollama Server Endpoint Configuration (shown when in Ollama mode or as reference) */}
            {runtimeMode === 'ollama' && (
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
            )}

            {/* Live Telemetry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Installed Models
                </span>
                <p className="text-base font-bold text-white font-mono">{installedModels.length}</p>
                <p className="text-[10px] text-slate-400">
                  {runtimeMode === 'demo' ? 'Simulated storage' : `${(totalLocalSize / (1024 * 1024 * 1024)).toFixed(2)} GB on disk`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Loaded in Memory
                </span>
                <p className="text-base font-bold text-emerald-400 font-mono">
                  {runningModels.length} Active
                </p>
                <p className="text-[10px] text-slate-400 truncate">
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

            {/* Demo Reset Banner / Action */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-200">Demo Runtime Reset</h4>
                <p className="text-[11px] text-slate-400">
                  Clear simulated downloads and running state to demo a fresh model installation flow from scratch.
                </p>
              </div>
              <button
                onClick={() => {
                  resetDemo();
                  showToast('Demo models and state reset to clean installation state', 'info');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>

            {/* Installed Local Models Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Available Local Models ({installedModels.length})
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
                  <p>No model weights detected in local storage.</p>
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
                                🟢 Loaded in Memory
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                Stopped
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>Size: <strong className="text-slate-200">{m.sizeFormatted || '1.8 GB'}</strong></span>
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
                  Synchronize your registered models, starred repositories, and cloud API keys across Web & Desktop.
                </p>
              </div>
            </div>

            {user ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{user.email}</div>
                      <div className="text-[11px] text-slate-400">
                        UID: <span className="font-mono text-slate-300">{user.id.slice(0, 16)}...</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Connected
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Active Desktop Session</span>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-white/5 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Not Signed In</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                    Sign in with your ModalHub account to enable bidirectional library synchronization with the website.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-white/10"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Storage & Weight Management</h3>
              <p className="text-xs text-slate-400">
                Inspect local cache directory and configure disk quotas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Ollama Models Root Directory
                </label>
                <input
                  type="text"
                  value={cacheDirectory}
                  onChange={(e) => setCacheDirectory(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-bold">Max Storage Allocation</span>
                  <span className="text-cyan-400 font-mono">{maxDiskUsageGb} GB</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="512"
                  step="16"
                  value={maxDiskUsageGb}
                  onChange={(e) => setMaxDiskUsageGb(parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Interface Customization</h3>
              <p className="text-xs text-slate-400">
                Theme and visual density settings for Agora Launcher.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Theme Palette</div>
                  <div className="text-slate-400 text-[11px]">Agora Deep Space Dark (Default)</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  Active
                </span>
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
                Open-source cross-platform desktop client for AI model discovery, local deployment, and serverless execution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Version</span>
                <span className="text-white font-mono font-bold">v1.2.0-demo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Framework</span>
                <span className="text-white font-mono">React 18 + TailwindCSS + Vite</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Local Runtimes</span>
                <span className="text-white font-mono">Ollama + Agora Demo Runtime</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Serverless Backend</span>
                <span className="text-white font-mono">Modal Infrastructure</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
