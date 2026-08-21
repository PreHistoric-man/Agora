import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useRuntime } from '../../context/RuntimeContext';
import { ModelLogo } from '../ModelLogo';
import {
  Search,
  CheckCircle2,
  HardDrive,
  Download,
  Play,
  Square,
  Rocket,
  Trash2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Tag,
  ThumbsUp,
  Star,
  Activity,
  AlertTriangle,
  RotateCw,
  Terminal,
  Server,
  XCircle
} from 'lucide-react';

interface LauncherLibraryProps {
  onOpenDeployWizard: (modelId: string) => void;
  onOpenPlayground: (modelId: string) => void;
  onBrowseStore: () => void;
}

export const LauncherLibrary: React.FC<LauncherLibraryProps> = ({
  onOpenDeployWizard,
  onOpenPlayground,
  onBrowseStore
}) => {
  const {
    models,
    libraryItems,
    libraryLoading,
    removeFromLibrary,
    addToast
  } = useApp();

  const {
    runtimeStatus,
    isDetecting,
    refreshRuntime,
    installModel,
    cancelInstall,
    startModel,
    stopModel,
    removeModel,
    getModelRuntimeInfo
  } = useRuntime();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'installed' | 'not_installed' | 'running'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Compute enriched library model items with real local runtime states from Ollama
  const enrichedItems = useMemo(() => {
    return libraryItems.map((item) => {
      const model = item.model || models.find((m) => m.id === item.model_id);
      const runtimeInfo = getModelRuntimeInfo(model);

      return {
        ...item,
        model,
        runtimeInfo
      };
    });
  }, [libraryItems, models, getModelRuntimeInfo]);

  // Extract categories present in library
  const categories = useMemo(() => {
    const set = new Set<string>();
    enrichedItems.forEach((item) => {
      if (item.model?.category) set.add(item.model.category);
    });
    return ['All', ...Array.from(set)];
  }, [enrichedItems]);

  // Filter items based on active tab, search query, and category
  const filteredItems = useMemo(() => {
    let result = [...enrichedItems];

    // Filter by tab
    if (filterTab === 'installed') {
      result = result.filter((item) => item.runtimeInfo.installed);
    } else if (filterTab === 'not_installed') {
      result = result.filter((item) => !item.runtimeInfo.installed && !item.runtimeInfo.running);
    } else if (filterTab === 'running') {
      result = result.filter((item) => item.runtimeInfo.running);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.model?.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = item.model?.name?.toLowerCase() || '';
        const provider = item.model?.provider?.toLowerCase() || '';
        const category = item.model?.category?.toLowerCase() || '';
        const desc = item.model?.description?.toLowerCase() || '';
        const tag = item.runtimeInfo?.ollamaTag?.toLowerCase() || '';
        return (
          name.includes(q) ||
          provider.includes(q) ||
          category.includes(q) ||
          desc.includes(q) ||
          tag.includes(q) ||
          item.model_id.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [enrichedItems, filterTab, selectedCategory, searchQuery]);

  // Default select first item if none selected
  const activeSelectedModelId = selectedModelId || (filteredItems.length > 0 ? filteredItems[0].model_id : null);
  const activeItem = enrichedItems.find((item) => item.model_id === activeSelectedModelId) || filteredItems[0];
  const activeModel = activeItem?.model;
  const activeRuntime = activeItem?.runtimeInfo;

  // Real local runtime action handlers
  const handleInstall = async () => {
    if (!activeModel) return;
    if (!runtimeStatus?.available) {
      addToast('Ollama service is not running. Please start Ollama on your machine first.', 'error');
      return;
    }

    addToast(`Pulling '${activeRuntime?.ollamaTag}' from Ollama registry...`, 'info');
    const res = await installModel(activeModel);
    if (res.success) {
      addToast(`Successfully installed ${activeModel.name} into Ollama!`, 'success');
    } else {
      addToast(res.message || 'Installation failed', 'error');
    }
  };

  const handleStart = async () => {
    if (!activeModel) return;
    if (!runtimeStatus?.available) {
      addToast('Ollama service is not running. Please start Ollama first.', 'error');
      return;
    }

    addToast(`Loading ${activeModel.name} into Ollama runtime...`, 'info');
    const res = await startModel(activeModel);
    if (res.success) {
      addToast(`${activeModel.name} is now running on ${runtimeStatus.endpoint}!`, 'success');
    } else {
      addToast(res.message || 'Failed to start model', 'error');
    }
  };

  const handleStop = async () => {
    if (!activeModel) return;
    addToast(`Stopping ${activeModel.name}...`, 'info');
    const res = await stopModel(activeModel);
    if (res.success) {
      addToast(`${activeModel.name} unloaded from memory.`, 'info');
    } else {
      addToast(res.message || 'Failed to stop model', 'error');
    }
  };

  const handleRemoveWeights = async () => {
    if (!activeModel) return;
    if (!confirm(`Are you sure you want to delete local weights for '${activeRuntime?.ollamaTag}' from disk?`)) return;

    addToast(`Deleting local weights for ${activeModel.name}...`, 'info');
    const res = await removeModel(activeModel);
    if (res.success) {
      addToast(`Deleted ${activeModel.name} weights from local storage.`, 'success');
    } else {
      addToast(res.message || 'Failed to delete weights', 'error');
    }
  };

  const handleRemoveFromLibrary = async (modelId: string) => {
    if (!confirm(`Remove ${activeModel?.name || modelId} from your Agora library?`)) return;
    const res = await removeFromLibrary(modelId);
    if (res.success) {
      addToast('Model removed from library.', 'info');
      setSelectedModelId(null);
    } else {
      addToast(res.error || 'Could not remove model.', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#0a0c10]">
      {/* Left Column: Master Library Shelf / Search & List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col shrink-0 bg-[#0d0f15]">
        {/* Header / Search Controls */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                My Library ({enrichedItems.length})
              </h1>
            </div>
            <button
              onClick={onBrowseStore}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              + Store
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                filterTab === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({enrichedItems.length})
            </button>
            <button
              onClick={() => setFilterTab('installed')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                filterTab === 'installed'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              Installed ({enrichedItems.filter((i) => i.runtimeInfo?.installed).length})
            </button>
            <button
              onClick={() => setFilterTab('not_installed')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                filterTab === 'not_installed'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              Not Installed ({enrichedItems.filter((i) => !i.runtimeInfo?.installed && !i.runtimeInfo?.running).length})
            </button>
            <button
              onClick={() => setFilterTab('running')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                filterTab === 'running'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              Running ({enrichedItems.filter((i) => i.runtimeInfo?.running).length})
            </button>
          </div>
        </div>

        {/* Model Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {libraryLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-slate-900/60 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">No models match your filter</div>
              <p className="text-[11px] text-slate-500">Try adjusting your search terms or filter tab.</p>
              {enrichedItems.length === 0 && (
                <button
                  onClick={onBrowseStore}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
                >
                  Browse Store
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = item.model_id === activeItem?.model_id;
              const m = item.model;
              const rt = item.runtimeInfo;

              return (
                <div
                  key={item.id || item.model_id}
                  onClick={() => setSelectedModelId(item.model_id)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center text-sm shrink-0">
                      <ModelLogo logo={m?.providerLogo} name={m?.name || item.model_id} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {m?.name || item.model_id}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                        <span>{m?.provider || 'Provider'}</span>
                        <span>•</span>
                        <span className="text-slate-500">{m?.category || 'LLM'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real Runtime Status Indicator */}
                  <div className="shrink-0 flex items-center">
                    {rt?.running ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        RUNNING
                      </span>
                    ) : rt?.state === 'installing' ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                        <RotateCw className="w-2.5 h-2.5 animate-spin" />
                        {rt.progress?.percent || 0}%
                      </span>
                    ) : rt?.installed ? (
                      <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium" title={rt.sizeFormatted}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono text-slate-400">{rt.sizeFormatted}</span>
                      </span>
                    ) : !rt?.supported ? (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-slate-500">Cloud API</span>
                    ) : (
                      <span className="text-[9px] text-slate-500">Not Installed</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Master Cinematic Model Inspector */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#090a0e]">
        {activeModel ? (
          <div className="flex-1 flex flex-col">
            {/* Hero Artwork Banner */}
            <div className="relative h-64 md:h-72 w-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border-b border-white/10 overflow-hidden flex flex-col justify-end p-6 md:p-8">
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0e] via-black/40 to-transparent z-10" />
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none z-0">
                <Cpu className="w-64 h-64 text-cyan-500" />
              </div>

              {/* Top status bar in banner */}
              <div className="relative z-20 flex items-center justify-between mb-auto pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-white/10">
                    {activeModel.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-300 border border-white/10">
                    v{activeModel.version || '1.0.0'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-400 border border-white/10">
                    {activeModel.license}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{activeModel.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-[10px]">({activeModel.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Creator */}
              <div className="relative z-20 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-xl">
                    <ModelLogo logo={activeModel.providerLogo} name={activeModel.name} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {activeModel.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Engineered by <span className="text-slate-200 font-semibold">{activeModel.provider}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Ollama Warning Banner if relevant */}
            {!runtimeStatus?.available && activeRuntime?.supported && (
              <div className="bg-amber-950/40 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between gap-4 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Ollama daemon not detected on <code>{runtimeStatus?.endpoint || 'http://127.0.0.1:11434'}</code>. Start Ollama locally to install or run weights.
                  </span>
                </div>
                <button
                  onClick={() => refreshRuntime()}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* Installation Progress Bar if active */}
            {activeRuntime?.state === 'installing' && activeRuntime.progress && (
              <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-6 py-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    {activeRuntime.progress.status || 'Downloading model weights...'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-200 font-bold">
                      {activeRuntime.progress.percent !== undefined ? `${activeRuntime.progress.percent}%` : 'Pulling'}
                    </span>
                    <button
                      onClick={() => cancelInstall(activeRuntime.ollamaTag)}
                      className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${Math.max(5, activeRuntime.progress.percent || 10)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Bar (Steam-style Master Controls) */}
            <div className="bg-[#0e1017] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Primary Action Button */}
                {activeRuntime?.running ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStop}
                      disabled={activeRuntime.isLoading}
                      className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop Instance</span>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Active on {runtimeStatus?.endpoint}</span>
                    </div>
                  </div>
                ) : activeRuntime?.state === 'installing' ? (
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 cursor-wait"
                  >
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Installing Weights ({activeRuntime.progress?.percent || 0}%)...</span>
                  </button>
                ) : activeRuntime?.installed ? (
                  <button
                    onClick={handleStart}
                    disabled={activeRuntime.isLoading || !runtimeStatus?.available}
                    className={`px-5 py-2.5 rounded-lg font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                      runtimeStatus?.available
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeRuntime.isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>Launch Local Instance</span>
                  </button>
                ) : activeRuntime?.supported ? (
                  <button
                    onClick={handleInstall}
                    disabled={activeRuntime.isLoading || !runtimeStatus?.available}
                    className={`px-5 py-2.5 rounded-lg font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg ${
                      runtimeStatus?.available
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                    title={
                      runtimeStatus?.available
                        ? `Pull '${activeRuntime.ollamaTag}' from Ollama registry`
                        : 'Ollama offline'
                    }
                  >
                    {activeRuntime.isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Install Ollama Weights ({activeRuntime.ollamaTag})</span>
                  </button>
                ) : (
                  <div className="px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-500" />
                    <span>Hosted Cloud API (No Local Weights)</span>
                  </div>
                )}

                {/* Cloud Deploy Button */}
                <button
                  onClick={() => onOpenDeployWizard(activeModel.id)}
                  className="px-4 py-2.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Deploy to AWS GPU</span>
                </button>

                {/* Open API Playground */}
                <button
                  onClick={() => onOpenPlayground(activeModel.id)}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sandbox Test</span>
                </button>
              </div>

              {/* Secondary Options */}
              <div className="flex items-center gap-2">
                {activeRuntime?.installed && (
                  <button
                    onClick={handleRemoveWeights}
                    disabled={activeRuntime.isLoading}
                    className="px-3 py-1.5 rounded bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-slate-300 text-xs font-medium transition-colors"
                    title="Delete local model weights from Ollama disk"
                  >
                    Delete Weights
                  </button>
                )}

                <button
                  onClick={() => handleRemoveFromLibrary(activeModel.id)}
                  className="p-2 rounded bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs transition-colors"
                  title="Remove from Library"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Model Specs & Deep Details Content */}
            <div className="p-6 md:p-8 space-y-8 max-w-5xl">
              {/* Local Runtime Information Panel */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    Local Runtime Architecture (Ollama)
                  </span>
                  <span className="font-mono text-[11px] text-cyan-400">
                    Tag: {activeRuntime?.ollamaTag || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400">Local Status:</span>
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      {activeRuntime?.running ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Running in VRAM
                        </span>
                      ) : activeRuntime?.installed ? (
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          Installed ({activeRuntime.sizeFormatted || 'Ready'})
                        </span>
                      ) : activeRuntime?.supported ? (
                        <span className="text-slate-400">Available to Pull</span>
                      ) : (
                        <span className="text-slate-500">Closed Cloud API</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400">Target Endpoint:</span>
                    <div className="font-mono text-slate-200 text-[11px]">
                      {runtimeStatus?.endpoint || 'http://127.0.0.1:11434'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400">Ollama Model Tag:</span>
                    <div className="font-mono text-cyan-300 text-[11px]">
                      {activeRuntime?.ollamaTag || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h3>
                <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
                  {activeModel.description}
                </p>
              </div>

              {/* Specifications Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Parameters</div>
                  <div className="text-sm font-bold text-white font-mono">{activeModel.parameters || 'Dense / MoE'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Model Weight Size</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">
                    {activeRuntime?.sizeFormatted || activeModel.modelSize || '7.8 GB'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Context Window</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {activeModel.contextWindow || '128k tokens'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Recommendation</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>96% Positive</span>
                  </div>
                </div>
              </div>

              {/* Hardware & Runtime Requirements */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Hardware & Runtime Requirements</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-400">Recommended VRAM:</div>
                    <div className="text-slate-200 font-semibold">{activeModel.hardwareRequirements?.vram || '8 GB (Q4_K_M)'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400">Runtime Support:</div>
                    <div className="text-slate-200 font-semibold">
                      {activeRuntime?.supported ? 'Ollama (Native Local)' : 'Cloud API Only'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400">Weight Format:</div>
                    <div className="text-slate-200 font-semibold">GGUF / Safetensors</div>
                  </div>
                </div>
              </div>

              {/* Tags & Capabilities */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags & Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {activeModel.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="space-y-3 max-w-sm">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-base font-bold text-white">Select a model from your library</div>
              <p className="text-xs text-slate-400">
                Choose any AI model on the left to inspect parameters, launch local instances, or deploy to AWS cloud.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
