import React, { useState } from 'react';
import { useLauncher } from '../context/LauncherContext';
import { useAuth } from '../context/AuthContext';
import { useRuntime } from '../context/RuntimeContext';
import { resolveModelRuntime } from '../lib/modelCompatibility';
import { ModelLogo } from './ModelLogo';
import {
  Layers,
  Search,
  ExternalLink,
  Trash2,
  Filter,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Download,
  Play,
  Square,
  RotateCw,
  XCircle,
  Terminal,
  Cpu,
  Check,
  AlertCircle,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const {
    libraryItems,
    libraryLoading,
    removeFromLibrary,
    openModelDetail,
    setActiveView,
    showToast,
  } = useLauncher();

  const {
    runtimeStatus,
    installedModels,
    runningModels,
    pullProgress,
    isPulling,
    isModelInstalled,
    isModelRunning,
    installModel,
    cancelInstall,
    startModel,
    stopModel,
    deleteModel,
    startingTags,
    stoppingTags,
    setActiveModelTag,
    refreshRuntime,
  } = useRuntime();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState<string>('');

  const categories = ['All', 'Reasoning', 'Coding', 'Image', 'Vision', 'Speech', 'Agents'];

  const filteredItems = libraryItems.filter((item) => {
    const model = item.model;
    if (!model) return false;
    const matchesCategory =
      selectedCategory === 'All' || model.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      localSearch.trim() === '' ||
      model.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      model.provider.toLowerCase().includes(localSearch.toLowerCase()) ||
      model.description.toLowerCase().includes(localSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunchAndPlay = async (modelTag: string) => {
    setActiveModelTag(modelTag);
    if (!isModelRunning(modelTag)) {
      showToast(`Loading model ${modelTag} into memory...`, 'info');
      const started = await startModel(modelTag);
      if (!started) {
        showToast(`Failed to launch model ${modelTag}. Check Ollama server.`, 'error');
        return;
      }
    }
    setActiveView('playground');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              My AI Model Library
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse registered models, download local open weights, and launch real-time inference on Ollama.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Runtime Status Pill */}
          <div
            onClick={() => setActiveView('settings')}
            className={`cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              runtimeStatus.state === 'online'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : runtimeStatus.state === 'stopped'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
            }`}
            title="Configure Local Runtime in Settings"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                runtimeStatus.state === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : runtimeStatus.state === 'stopped'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span>
              Ollama:{' '}
              <strong className="capitalize">{runtimeStatus.state}</strong>
              {runtimeStatus.version ? ` (${runtimeStatus.version})` : ''}
            </span>
          </div>

          <button
            onClick={() => setActiveView('store')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Store</span>
          </button>
        </div>
      </div>

      {/* Guest Notice */}
      {!user && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Guest mode active:</span> Library items are saved locally on this machine. Sign in to synchronize across devices.
          </div>
          <button
            onClick={() => openAuthModal('signin')}
            className="text-xs font-semibold text-cyan-400 hover:underline shrink-0"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Local Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter library..."
            className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Library Grid */}
      {libraryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">
              {libraryItems.length === 0 ? 'No models in your library' : 'No matching models found'}
            </h3>
            <p className="text-xs text-slate-400">
              {libraryItems.length === 0
                ? 'Discover frontier open-weights models in the Store to install and run locally.'
                : 'Try adjusting your search query or category filters.'}
            </p>
          </div>
          {libraryItems.length === 0 && (
            <button
              onClick={() => setActiveView('store')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Model Store</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredItems.map(({ id, model_id, model, added_at }) => {
            if (!model) return null;

            const runtimeComp = resolveModelRuntime(model);
            const ollamaTag = runtimeComp.ollamaTag;
            const isInstalled = runtimeComp.supported && isModelInstalled(ollamaTag);
            const isRunning = runtimeComp.supported && isModelRunning(ollamaTag);
            const pulling = runtimeComp.supported && isPulling(ollamaTag);
            const progress = pulling ? pullProgress[ollamaTag.toLowerCase()] : undefined;
            const isStarting = startingTags.has(ollamaTag);
            const isStopping = stoppingTags.has(ollamaTag);

            // Find matching local model details if installed
            const localDetails = installedModels.find(
              (m) => m.name.toLowerCase().startsWith(ollamaTag.toLowerCase().split(':')[0])
            );

            return (
              <div
                key={id || model_id}
                onClick={() => openModelDetail(model.id)}
                className="group relative rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {model.category}
                    </span>

                    {/* Local Status Indicator */}
                    {runtimeComp.supported ? (
                      isRunning ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Running
                        </span>
                      ) : isInstalled ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Installed
                        </span>
                      ) : pulling ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          Downloading
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                          Not Installed
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Hosted API
                      </span>
                    )}
                  </div>

                  {/* Identity */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <ModelLogo logo={model.providerLogo} name={model.name} />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {model.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{model.provider}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {model.description}
                  </p>

                  {/* Runtime Spec Pill */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-white/5">
                      {model.parameters || 'Weights'}
                    </span>
                    {runtimeComp.supported ? (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                        Ollama: {ollamaTag}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-white/5">
                        Cloud API Only
                      </span>
                    )}
                    {localDetails?.sizeFormatted && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-white/5">
                        {localDetails.sizeFormatted}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Installation Progress or Action Buttons */}
                <div className="pt-3 mt-3 border-t border-white/5 space-y-2.5">
                  {/* Active Download Progress Bar */}
                  {pulling && progress && (
                    <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="truncate max-w-[170px] text-amber-300 font-mono">
                          {progress.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">
                            {progress.percent !== undefined ? `${progress.percent}%` : '...'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelInstall(ollamaTag);
                            }}
                            className="text-slate-400 hover:text-rose-400 p-0.5"
                            title="Cancel Download"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress.percent || 10}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromLibrary(model.id);
                        }}
                        title="Remove from Library"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {isInstalled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Uninstall ${ollamaTag} from local storage?`)) {
                              deleteModel(ollamaTag);
                            }
                          }}
                          title="Delete local weights"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-[10px]"
                        >
                          Uninstall
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {runtimeComp.supported ? (
                        isRunning ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                stopModel(ollamaTag);
                              }}
                              disabled={isStopping}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Square className="w-3 h-3" />
                              <span>Stop</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchAndPlay(ollamaTag);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              <span>Playground</span>
                            </button>
                          </>
                        ) : isInstalled ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchAndPlay(ollamaTag);
                            }}
                            disabled={isStarting}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                          >
                            {isStarting ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Starting...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Launch</span>
                              </>
                            )}
                          </button>
                        ) : pulling ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-wait"
                          >
                            <RotateCw className="w-3 h-3 animate-spin" />
                            <span>Installing...</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!runtimeStatus.available) {
                                showToast('Please start Ollama before downloading models.', 'error');
                                return;
                              }
                              installModel(ollamaTag);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Install</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModelDetail(model.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>View API</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
