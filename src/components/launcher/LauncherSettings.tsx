import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useRuntime } from '../../context/RuntimeContext';
import { TauriService, DEFAULT_LOCAL_RUNTIME_CONFIG } from '../../services/TauriService';
import type { TauriAppInfo, LocalRuntimeConfig } from '../../services/TauriService';
import {
  User,
  Palette,
  HardDrive,
  Cpu,
  Info,
  LogOut,
  Terminal,
  RefreshCw,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  Play,
  Square,
  Trash2,
  ExternalLink,
  RotateCw,
  HelpCircle
} from 'lucide-react';

export const LauncherSettings: React.FC = () => {
  const { user, profile, isAuthenticated, signOut, openAuthModal } = useAuth();
  const { addToast, openOnboarding } = useApp();
  const {
    runtimeStatus,
    installedModels,
    runningModels,
    isDetecting,
    refreshRuntime,
    setOllamaEndpoint,
    stopModel,
    removeModel
  } = useRuntime();

  const [activeTab, setActiveTab] = useState<'account' | 'runtime' | 'models' | 'storage' | 'appearance' | 'bridge' | 'about'>('runtime');

  // Tauri Rust App Info State
  const [appInfo, setAppInfo] = useState<TauriAppInfo | null>(null);
  const [appInfoLoading, setAppInfoLoading] = useState<boolean>(false);

  // Runtime settings state
  const [runtimeConfig, setRuntimeConfig] = useState<LocalRuntimeConfig>(DEFAULT_LOCAL_RUNTIME_CONFIG);
  const [modelsDir, setModelsDir] = useState<string>('~/.agora/models');
  const [endpointInput, setEndpointInput] = useState<string>(runtimeStatus?.endpoint || 'http://127.0.0.1:11434');

  // Appearance settings
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [enableAnimations, setEnableAnimations] = useState<boolean>(true);

  // Load Tauri App Info
  const fetchTauriInfo = async () => {
    setAppInfoLoading(true);
    try {
      const info = await TauriService.getAppInfo();
      setAppInfo(info);
    } catch (e) {
      console.warn('Tauri info error:', e);
    } finally {
      setAppInfoLoading(false);
    }
  };

  useEffect(() => {
    fetchTauriInfo();
    const config = TauriService.getLocalRuntimeConfig();
    setRuntimeConfig(config);
    setModelsDir(config.modelsDirectory);
    if (runtimeStatus?.endpoint) {
      setEndpointInput(runtimeStatus.endpoint);
    }
  }, [runtimeStatus?.endpoint]);

  const handleSaveRuntimeSettings = () => {
    TauriService.saveLocalRuntimeConfig({
      ...runtimeConfig,
      modelsDirectory: modelsDir
    });
    setOllamaEndpoint(endpointInput);
    addToast('Launcher runtime settings and endpoint saved.', 'success');
    refreshRuntime();
  };

  const handleTestConnection = async () => {
    setOllamaEndpoint(endpointInput);
    addToast(`Testing connection to ${endpointInput}...`, 'info');
    await refreshRuntime();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Launcher Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your Agora desktop environment, local Ollama runtime, storage paths, and native Tauri bridge.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('runtime')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'runtime' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Local Runtime (Ollama)</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'models' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Model Storage & Weights ({installedModels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'account' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account & Supabase</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'storage' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Directories</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'appearance' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab('bridge')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'bridge' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Tauri IPC Bridge</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'about' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* Tab: Local Runtime */}
      {activeTab === 'runtime' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            runtimeStatus?.available
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'bg-amber-950/20 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                runtimeStatus?.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>Ollama Local Daemon</span>
                  {runtimeStatus?.available ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Connected (v{runtimeStatus.version || '0.5'})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Offline / Not Responding
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {runtimeStatus?.available
                    ? `Ready to execute local LLMs. Active on ${runtimeStatus.endpoint}.`
                    : `Could not connect to Ollama at ${endpointInput}. Verify Ollama is running on this machine.`}
                </p>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isDetecting}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isDetecting ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          {/* Endpoint Configuration */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ollama Endpoint Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-semibold">Ollama Host URL / IP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={handleSaveRuntimeSettings}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Default local daemon address is <code>http://127.0.0.1:11434</code>. Remote servers or LAN nodes are also supported.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Engine Type</label>
                <select
                  value={runtimeConfig.engineType}
                  onChange={(e) => setRuntimeConfig({ ...runtimeConfig, engineType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="ollama">Ollama (Default)</option>
                  <option value="vllm" disabled>vLLM (Phase 3)</option>
                  <option value="llamacpp" disabled>llama.cpp (Future)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions if Offline */}
          {!runtimeStatus?.available && (
            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 space-y-3 text-xs">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                How to start Ollama locally:
              </h3>
              <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-cyan-300 space-y-2">
                <div># 1. Install Ollama if not yet installed:</div>
                <div className="text-slate-300">curl -fsSL https://ollama.com/install.sh | sh</div>
                <div className="pt-2"># 2. Start the Ollama background daemon:</div>
                <div className="text-emerald-400">ollama serve</div>
              </div>
              <p className="text-slate-400 text-[11px]">
                Once running, click <strong>"Check Status"</strong> above to link the Agora Desktop Launcher to your local inference engine.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Models & Weights */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Running Models Section */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Memory Instances</h3>
                <p className="text-xs text-slate-400">Models currently loaded into local VRAM/RAM for inference.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {runningModels.length} Active
              </span>
            </div>

            {runningModels.length === 0 ? (
              <div className="p-6 rounded-lg bg-black/20 border border-white/5 text-center text-xs text-slate-500">
                No local models currently loaded into memory.
              </div>
            ) : (
              <div className="space-y-2">
                {runningModels.map((m) => (
                  <div
                    key={m.name}
                    className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <div>
                        <div className="font-bold text-white font-mono">{m.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {m.size ? `Size: ${(m.size / 1024 / 1024 / 1024).toFixed(2)} GB` : ''}
                          {m.sizeVram ? ` • VRAM: ${(m.sizeVram / 1024 / 1024 / 1024).toFixed(2)} GB` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => stopModel(m.name)}
                      className="px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Unload from VRAM</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Local Installed Weights Section */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Local Ollama Weights Disk Catalog</h3>
                <p className="text-xs text-slate-400">Models pulled and available on your local hard drive.</p>
              </div>
              <button
                onClick={() => refreshRuntime()}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rescan Disk</span>
              </button>
            </div>

            {installedModels.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
                <div>No local weights installed yet.</div>
                <p className="text-[11px] text-slate-600">
                  Browse your Library or Marketplace to pull DeepSeek, Llama, Qwen, or Mistral models.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {installedModels.map((m) => (
                  <div
                    key={m.name}
                    className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white font-mono">{m.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Size: <span className="text-cyan-300 font-mono">{(m.size / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                        {m.details?.parameter_size ? ` • Parameters: ${m.details.parameter_size}` : ''}
                        {m.details?.quantization_level ? ` • Quant: ${m.details.quantization_level}` : ''}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete local weights for '${m.name}'?`)) {
                          removeModel(m.name);
                        }
                      }}
                      className="p-2 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs transition-colors"
                      title="Delete weights"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Account */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Credentials</h3>
              {isAuthenticated ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Supabase Authenticated
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Guest Session
                </span>
              )}
            </div>

            {isAuthenticated ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-lg">
                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-white">{profile?.username || 'Agora User'}</div>
                    <div className="text-slate-400">{user?.email}</div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => signOut()}
                    className="px-3.5 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400">
                  Sign in with your Agora account to synchronize your model library, ratings, and cloud deployments.
                </p>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
                >
                  Sign In with Supabase
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Storage Directories */}
      {activeTab === 'storage' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Storage & Local Directory Paths</h3>
          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Models Directory Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modelsDir}
                  onChange={(e) => setModelsDir(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                  placeholder="~/.agora/models"
                />
                <button
                  onClick={handleSaveRuntimeSettings}
                  className="px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Path</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Appearance */}
      {activeTab === 'appearance' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Appearance & Window Styling</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <div className="font-semibold text-white">High-Contrast Dark Theme</div>
                <div className="text-slate-400 text-[11px]">Optimized for deep OLED displays and low ambient light</div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tauri IPC Bridge */}
      {activeTab === 'bridge' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tauri 2 Rust IPC Verification</h3>
            <button
              onClick={fetchTauriInfo}
              disabled={appInfoLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${appInfoLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Invoke get_app_info</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 space-y-2">
            <div className="text-slate-500 pb-1 border-b border-white/5 flex items-center justify-between">
              <span>// Rust Command: fn get_app_info() -&gt; AppInfo</span>
              <span className="text-emerald-400 font-bold">STATUS: OK</span>
            </div>
            {appInfoLoading ? (
              <div className="py-4 text-center text-slate-500 animate-pulse">
                Calling invoke('get_app_info')...
              </div>
            ) : (
              <pre className="text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(appInfo, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Tab: About */}
      {activeTab === 'about' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xl font-extrabold text-white">
              A
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Agora Desktop Launcher</h2>
              <p className="text-slate-400">Version 0.2.0 (Phase 2 Local AI Runtime - Ollama)</p>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Agora Launcher connects the cloud-based Agora model marketplace directly to your local workstation. With native Ollama integration, you can install, run, inspect, and manage open-weights LLMs directly on your hardware.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="text-slate-500 text-[10px]">Tauri Version</div>
              <div className="font-bold text-white mt-0.5">2.x</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="text-slate-500 text-[10px]">Local Runtime</div>
              <div className="font-bold text-cyan-400 mt-0.5">Ollama (11434)</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="text-slate-500 text-[10px]">Database</div>
              <div className="font-bold text-white mt-0.5">Supabase Shared</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="text-slate-500 text-[10px]">Identifier</div>
              <div className="font-bold text-cyan-400 mt-0.5 font-mono text-[10px]">com.agora.launcher</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={openOnboarding}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle size={14} />
              How Agora Works (Interactive Tour)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
