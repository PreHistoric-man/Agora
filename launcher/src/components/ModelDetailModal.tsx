import React, { useState } from 'react';
import { useLauncher } from '../context/LauncherContext';
import { useRuntime } from '../context/RuntimeContext';
import { resolveModelRuntime } from '../lib/modelCompatibility';
import { ModelLogo } from './ModelLogo';
import {
  X,
  Plus,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  Download,
  RotateCw,
  Cpu,
  HardDrive,
} from 'lucide-react';

export const ModelDetailModal: React.FC = () => {
  const {
    selectedModel,
    isDetailOpen,
    closeModelDetail,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    setActiveView,
    showToast,
  } = useLauncher();

  const {
    runtimeStatus,
    isModelInstalled,
    isModelRunning,
    isPulling,
    pullProgress,
    installModel,
    startModel,
    setActiveModelTag,
  } = useRuntime();

  const [activeTab, setActiveTab] = useState<'overview' | 'runtime' | 'api' | 'benchmarks'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isDetailOpen || !selectedModel) return null;

  const inLibrary = isInLibrary(selectedModel.id);
  const runtimeComp = resolveModelRuntime(selectedModel);
  const ollamaTag = runtimeComp.ollamaTag;
  const isInstalled = runtimeComp.supported && isModelInstalled(ollamaTag);
  const isRunning = runtimeComp.supported && isModelRunning(ollamaTag);
  const pulling = runtimeComp.supported && isPulling(ollamaTag);
  const progress = pulling ? pullProgress[ollamaTag.toLowerCase()] : undefined;

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLaunchAndPlay = async () => {
    setActiveModelTag(ollamaTag);
    if (!isRunning) {
      showToast(`Loading ${ollamaTag} into memory...`, 'info');
      const started = await startModel(ollamaTag);
      if (!started) {
        showToast(`Failed to launch ${ollamaTag}`, 'error');
        return;
      }
    }
    closeModelDetail();
    setActiveView('playground');
  };

  const curlExample =
    selectedModel.sampleCurl ||
    `curl http://127.0.0.1:11434/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${ollamaTag || selectedModel.id}",
    "messages": [{"role": "user", "content": "Explain quantum computing in simple terms."}]
  }'`;

  const pythonExample =
    selectedModel.samplePython ||
    `import requests

response = requests.post(
    "http://127.0.0.1:11434/api/generate",
    json={"model": "${ollamaTag || selectedModel.id}", "prompt": "Hello world!"}
)
print(response.json())`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-4">
            <ModelLogo logo={selectedModel.providerLogo} name={selectedModel.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{selectedModel.name}</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedModel.category}
                </span>
                {selectedModel.isOpenSource && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Open Weights
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                By <span className="text-slate-200 font-semibold">{selectedModel.provider}</span> • License: <span className="font-mono text-slate-300">{selectedModel.license}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModelDetail()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          {runtimeComp.supported && (
            <button
              onClick={() => setActiveTab('runtime')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'runtime'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Local Execution (Ollama)
            </button>
          )}
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            API Integration
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'benchmarks'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmarks
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedModel.longDescription || selectedModel.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-white/5 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px]">Parameters</span>
                    <p className="text-slate-200 font-bold mt-0.5">{selectedModel.parameters || 'Multi-param'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Context Window</span>
                    <p className="text-slate-200 font-bold mt-0.5">{selectedModel.contextWindow}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Token Pricing</span>
                    <p className="text-cyan-300 font-bold mt-0.5">
                      {selectedModel.inputPricePerMillion === 0
                        ? 'Free / Self-Host'
                        : `$${selectedModel.inputPricePerMillion}/M`}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Community Score</span>
                    <p className="text-amber-400 font-bold mt-0.5">★ {selectedModel.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedModel.tags && selectedModel.tags.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModel.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5 font-medium text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'runtime' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">Ollama Local Deployment</span>
                  </div>
                  {isRunning ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🟢 Running on GPU
                    </span>
                  ) : isInstalled ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      ✓ Installed Locally
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Available for Download
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Ollama Tag</span>
                    <span className="text-cyan-300 font-bold">{ollamaTag}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Recommended VRAM</span>
                    <span className="text-slate-200">{runtimeComp.defaultVramRequirement || '8 GB'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-500 text-[10px] block">System RAM</span>
                    <span className="text-slate-200">{runtimeComp.defaultRamRequirement || '16 GB'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  {isRunning ? (
                    <button
                      onClick={handleLaunchAndPlay}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Open AI Playground</span>
                    </button>
                  ) : isInstalled ? (
                    <button
                      onClick={handleLaunchAndPlay}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launch Model & Chat</span>
                    </button>
                  ) : pulling ? (
                    <div className="flex items-center gap-2 text-amber-300 font-medium">
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Downloading model ({progress?.percent || 0}%)...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => installModel(ollamaTag)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Model ({ollamaTag})</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> CLI Command
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-cyan-300">
                  ollama run {ollamaTag}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" /> cURL Request
                  </span>
                  <button
                    onClick={() => copyCode(curlExample, 'curl')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copiedKey === 'curl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'curl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {curlExample}
                </pre>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-violet-400" /> Python Request
                  </span>
                  <button
                    onClick={() => copyCode(pythonExample, 'python')}
                    className="flex items-center gap-1 text-[11px] text-violet-400 hover:underline"
                  >
                    {copiedKey === 'python' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'python' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {pythonExample}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Overall Capability</span>
                    <span className="font-bold text-cyan-400">{selectedModel.overallScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${selectedModel.overallScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Coding / Logic</span>
                    <span className="font-bold text-violet-400">{selectedModel.codingScore || 92}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${selectedModel.codingScore || 92}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Status:{' '}
            <span className={inLibrary ? 'text-cyan-400 font-semibold' : 'text-slate-300'}>
              {inLibrary ? '✓ Registered in your Agora library' : 'Not added to library'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {inLibrary ? (
              <button
                onClick={() => removeFromLibrary(selectedModel.id)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 font-semibold text-xs transition-colors"
              >
                Remove from Library
              </button>
            ) : (
              <button
                onClick={() => addToLibrary(selectedModel.id)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add to My Library</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
