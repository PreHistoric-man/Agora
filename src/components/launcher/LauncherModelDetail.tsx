import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRuntime } from '../../context/RuntimeContext';
import { ModelLogo } from '../ModelLogo';
import {
  X,
  Plus,
  Check,
  Download,
  Play,
  Square,
  Rocket,
  Zap,
  Star,
  Cpu,
  RotateCw,
  AlertTriangle,
  Server,
  CheckCircle2,
  Terminal
} from 'lucide-react';

interface LauncherModelDetailModalProps {
  modelId: string | null;
  onClose: () => void;
  onOpenDeployWizard: (modelId: string) => void;
  onOpenPlayground: (modelId: string) => void;
  onGoToLibrary: () => void;
}

export const LauncherModelDetailModal: React.FC<LauncherModelDetailModalProps> = ({
  modelId,
  onClose,
  onOpenDeployWizard,
  onOpenPlayground,
  onGoToLibrary
}) => {
  const {
    models,
    libraryModelIds,
    addToLibrary,
    addToast
  } = useApp();

  const {
    runtimeStatus,
    getModelRuntimeInfo,
    installModel,
    cancelInstall,
    startModel,
    stopModel,
    removeModel
  } = useRuntime();

  const [isAdding, setIsAdding] = useState<boolean>(false);

  if (!modelId) return null;

  const model = models.find((m) => m.id === modelId);
  if (!model) return null;

  const inLibrary = libraryModelIds.has(model.id);
  const runtimeInfo = getModelRuntimeInfo(model);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const res = await addToLibrary(model.id);
      if (res.success) {
        addToast(`Added ${model.name} to your library.`, 'success');
      } else if (res.alreadyInLibrary) {
        addToast(`${model.name} is already in your library.`, 'info');
      } else {
        addToast(res.error || 'Failed to add model to library.', 'error');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleInstall = async () => {
    if (!inLibrary) {
      await addToLibrary(model.id);
    }
    if (!runtimeStatus?.available) {
      addToast('Ollama is not running. Please start Ollama locally.', 'error');
      return;
    }
    addToast(`Installing '${runtimeInfo.ollamaTag}' in Ollama...`, 'info');
    const res = await installModel(model);
    if (res.success) {
      addToast(`Successfully installed ${model.name}!`, 'success');
    } else {
      addToast(res.message || 'Installation failed', 'error');
    }
  };

  const handleStart = async () => {
    if (!runtimeStatus?.available) {
      addToast('Ollama is not running.', 'error');
      return;
    }
    addToast(`Starting ${model.name}...`, 'info');
    const res = await startModel(model);
    if (res.success) {
      addToast(`${model.name} is running!`, 'success');
    } else {
      addToast(res.message || 'Failed to start', 'error');
    }
  };

  const handleStop = async () => {
    addToast(`Stopping ${model.name}...`, 'info');
    const res = await stopModel(model);
    if (res.success) {
      addToast(`${model.name} stopped.`, 'info');
    } else {
      addToast(res.message || 'Failed to stop', 'error');
    }
  };

  const handleRemoveWeights = async () => {
    if (!confirm(`Delete local weights for ${model.name} from disk?`)) return;
    const res = await removeModel(model);
    if (res.success) {
      addToast(`Deleted ${model.name} local weights.`, 'success');
    } else {
      addToast(res.message || 'Failed to delete weights', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#0e1017] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Banner */}
        <div className="relative p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-center text-3xl shrink-0">
              <ModelLogo logo={model.providerLogo} name={model.name} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] uppercase font-bold text-cyan-300">
                  {model.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v{model.version || '1.0.0'}</span>
                <span className="text-[10px] text-slate-400 font-mono">{model.license}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">{model.name}</h2>
              <p className="text-xs text-slate-400">By {model.provider}</p>
            </div>
          </div>
        </div>

        {/* Pulling Progress Banner if active */}
        {runtimeInfo.state === 'installing' && runtimeInfo.progress && (
          <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-6 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                {runtimeInfo.progress.status || 'Downloading model weights...'}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-200 font-bold">
                  {runtimeInfo.progress.percent !== undefined ? `${runtimeInfo.progress.percent}%` : 'Pulling'}
                </span>
                <button
                  onClick={() => cancelInstall(runtimeInfo.ollamaTag)}
                  className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
                style={{ width: `${Math.max(5, runtimeInfo.progress.percent || 10)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Local Runtime Status Callout */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <span>Local AI Runtime (Ollama)</span>
                  {runtimeInfo.running ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      🟢 Running
                    </span>
                  ) : runtimeInfo.installed ? (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      ✓ Installed ({runtimeInfo.sizeFormatted || 'Ready'})
                    </span>
                  ) : runtimeInfo.supported ? (
                    <span className="text-[10px] text-slate-400">Ready to Pull</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Cloud Only</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {runtimeInfo.supported ? `Target Tag: ${runtimeInfo.ollamaTag}` : 'Proprietary Cloud API'}
                </div>
              </div>
            </div>

            {runtimeInfo.supported && (
              <div className="text-right text-[11px] text-slate-400">
                <div>Engine: <span className="text-slate-200">Ollama</span></div>
                <div className="text-slate-500">{runtimeStatus?.available ? 'Runtime Ready' : 'Daemon Offline'}</div>
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Description</h3>
            <p className="text-slate-200 leading-relaxed text-sm">{model.description}</p>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Parameters</div>
              <div className="font-bold text-white font-mono">{model.parameters || 'Dense / MoE'}</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Weight Size</div>
              <div className="font-bold text-cyan-400 font-mono">
                {runtimeInfo.sizeFormatted || model.modelSize || '7.8 GB'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Recommended VRAM</div>
              <div className="font-bold text-white truncate">{model.hardwareRequirements?.vram || '8 GB (Q4)'}</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Rating</div>
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{model.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {model.tags?.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-slate-300 text-[11px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0a0c10] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {inLibrary ? (
              <button
                onClick={onGoToLibrary}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>In Library (Open)</span>
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>{isAdding ? 'Adding...' : 'Add to Library'}</span>
              </button>
            )}

            {/* Local Runtime Controls */}
            {runtimeInfo.running ? (
              <button
                onClick={handleStop}
                disabled={runtimeInfo.isLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Running</span>
              </button>
            ) : runtimeInfo.installed ? (
              <button
                onClick={handleStart}
                disabled={runtimeInfo.isLoading || !runtimeStatus?.available}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Locally</span>
              </button>
            ) : runtimeInfo.supported ? (
              <button
                onClick={handleInstall}
                disabled={runtimeInfo.isLoading || !runtimeStatus?.available}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
                title={runtimeStatus?.available ? `Pull ${runtimeInfo.ollamaTag}` : 'Ollama Offline'}
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Install Ollama Weights</span>
              </button>
            ) : null}

            {runtimeInfo.installed && (
              <button
                onClick={handleRemoveWeights}
                disabled={runtimeInfo.isLoading}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenDeployWizard(model.id);
              }}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              <span>Deploy to AWS</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPlayground(model.id);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test API</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
