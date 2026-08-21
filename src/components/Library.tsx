import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModelTags } from './ModelTags';
import {
  Search,
  Play,
  Download,
  Trash2,
  SlidersHorizontal,
  Cpu,
  Clock,
  HardDrive
} from 'lucide-react';

export const Library: React.FC = () => {
  const {
    models,
    launchModel,
    startInstall,
    uninstallModel,
    downloadingModelId,
    downloadProgress,
    downloadStep,
    setSelectedModelId,
    setView,
    isModelOwned,
    startDeployment,
    deployments,
    openGetModelModal,
    setSelectedDeploymentId
  } = useApp();

  const [selectedLibModelId, setSelectedLibModelId] = useState<string>('codeforge-7b');
  const [filterTab, setFilterTab] = useState<'all' | 'installed' | 'owned' | 'deployed' | 'wishlist'>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size' | 'updated'>('recent');

  const selectedModel = models.find((m) => m.id === selectedLibModelId) || models[0];

  // Dynamic counts
  const totalOwned = models.filter((m) => isModelOwned(m.id)).length;
  const installedCount = models.filter((m) => m.installed).length;
  const updatingCount = deployments.length;

  // Filter list
  const filteredModels = models
    .filter((m) => {
      // Tab filters
      if (filterTab === 'installed' && !m.installed) return false;
      if (filterTab === 'owned' && !isModelOwned(m.id)) return false;
      if (filterTab === 'deployed' && !deployments.some((deployment) => deployment.modelId === m.id)) return false;
      if (filterTab === 'wishlist' && !m.wishlisted) return false;
      return true;
    })
    .filter((m) => {
      // Search filter
      return m.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
             m.category.toLowerCase().includes(librarySearch.toLowerCase());
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') {
        const parseSize = (s: string) => parseFloat(s.split(' ')[0]);
        return parseSize(b.sizeOnDisk) - parseSize(a.sizeOnDisk);
      }
      if (sortBy === 'updated') return b.updatedDate.localeCompare(a.updatedDate);
      return b.releaseDate.localeCompare(a.releaseDate); // Default 'recent'
    });

  const handleLaunchClick = (mId: string) => {
    launchModel(mId);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in flex flex-col h-[calc(100vh-80px)] select-none">
      {/* LIBRARY HERO HEADER STATS */}
      <section className="mb-6 rounded-2xl glass-panel p-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display text-xl font-black text-white">My AI Library</h1>
          <p className="font-sans text-[10px] text-slate-500">Configure, update and execute localized neural pipelines.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="font-display text-lg font-black text-slate-300">{totalOwned}</span>
            <span className="font-sans text-[10px] text-slate-500 block">Models Owned</span>
          </div>
          <span className="h-6 w-px bg-white/10"></span>
          <div className="text-center">
            <span className="font-display text-lg font-black text-emerald-400">{installedCount}</span>
            <span className="font-sans text-[10px] text-slate-500 block">Installed</span>
          </div>
          <span className="h-6 w-px bg-white/10"></span>
          <div className="text-center">
            <span className="font-display text-lg font-black text-cyan-400">{updatingCount}</span>
            <span className="font-sans text-[10px] text-slate-500 block">Deployed</span>
          </div>
        </div>
      </section>

      {/* DUAL PANE CONTAINER */}
      <div className="flex flex-grow gap-6 overflow-hidden min-h-0">
        {/* LEFT SIDEBAR: Games vertical list */}
        <div className="w-full md:w-80 flex flex-col gap-3 shrink-0 overflow-y-auto">
          {/* Filters, search and sort */}
          <div className="rounded-xl glass-panel p-3 flex flex-col gap-3 shrink-0">
            {/* Tabs */}
            <div className="grid grid-cols-5 gap-1 border-b border-white/5 pb-2">
              {(['all', 'installed', 'owned', 'deployed', 'wishlist'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`py-1 rounded text-[10px] font-display font-bold uppercase transition-all cursor-pointer ${
                    filterTab === tab
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search library..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full rounded-lg bg-black/40 pl-8 pr-3 py-1.5 font-sans text-xs text-white placeholder-slate-500 border border-white/5 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 flex items-center gap-1">
                <SlidersHorizontal size={10} /> Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 font-bold border-none focus:outline-none cursor-pointer"
              >
                <option value="recent">Recently Used</option>
                <option value="name">Alphabetical</option>
                <option value="size">Disk Size</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Model list */}
          <div className="flex-grow overflow-y-auto rounded-xl glass-panel p-1.5 flex flex-col gap-1">
            {filteredModels.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-xs">No models match criteria.</div>
            ) : (
              filteredModels.map((m) => {
                const isSelected = selectedLibModelId === m.id;
                const isDownloading = downloadingModelId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedLibModelId(m.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-white shadow'
                        : 'border border-transparent hover:bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {/* Tiny visual card artwork */}
                    <div className={`h-8 w-10 rounded bg-gradient-to-br ${m.artwork} shrink-0`}></div>
                    
                    <div className="flex-grow text-left truncate">
                      <div className="font-display font-bold text-xs leading-none mb-1 text-slate-200">
                        {m.name}
                      </div>
                      <ModelTags tags={m.tags} limit={2} className="mb-1" />
                      <div className="font-sans text-[9px] text-slate-500 flex items-center gap-1.5 leading-none">
                        {isDownloading ? (
                          <span className="text-cyan-400 animate-pulse">Installing {downloadProgress}%</span>
                        ) : (
                          <>
                            <span className={m.installed ? 'text-emerald-400' : 'text-slate-500'}>
                              {m.installed ? 'Installed' : 'Not Installed'}
                            </span>
                            <span>·</span>
                            <span>{m.sizeOnDisk}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT DASHBOARD PANE: Selected model details & launch workflow */}
        <div className="hidden md:flex flex-grow flex-col rounded-2xl glass-panel overflow-hidden border border-white/5 min-w-0">
          {/* Top Banner Artwork */}
          <div className={`w-full h-40 bg-gradient-to-r ${selectedModel.artwork} p-6 flex flex-col justify-between shrink-0 relative overflow-hidden`}>
            {/* Ambient pattern overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="relative z-10 flex items-start justify-between">
              <span className="rounded bg-black/50 px-2 py-0.5 font-display text-[9px] font-black text-cyan-400 border border-cyan-500/20 uppercase">
                {selectedModel.category}
              </span>
              <span className="font-mono text-[10px] text-white/60">Local Version: {selectedModel.version}</span>
            </div>

            <div className="relative z-10 text-left">
              <h2 className="font-display text-2xl font-black text-white">{selectedModel.name}</h2>
              <ModelTags tags={selectedModel.tags} className="mt-1 mb-1" />
              <span className="font-sans text-xs text-slate-300">by NeuralForge and community publishers</span>
            </div>
          </div>

          {/* Core Action Command Bar */}
          <div className="border-b border-white/5 px-6 py-4 bg-white/[0.01] flex items-center justify-between shrink-0 gap-4">
            {/* Green Launch / Blue Download button */}
            <div className="flex items-center gap-4 flex-grow sm:flex-grow-0">
              {downloadingModelId === selectedModel.id ? (
                /* Installing status bar */
                <div className="flex flex-col text-left gap-1 min-w-[200px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-bold text-cyan-400">Installing weights...</span>
                    <span className="font-mono font-bold text-cyan-400">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${downloadProgress}%` }}></div>
                  </div>
                  <span className="font-sans text-[9px] text-slate-500">{downloadStep}</span>
                </div>
              ) : selectedModel.installed ? (
                /* Launch Button */
                <button
                  onClick={() => handleLaunchClick(selectedModel.id)}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 px-8 font-display text-sm font-black text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 uppercase"
                >
                  <Play size={16} fill="currentColor" />
                  Launch Model
                </button>
              ) : (
                /* Install Button */
                <button
                  onClick={() => isModelOwned(selectedModel.id) ? startInstall(selectedModel.id) : openGetModelModal(selectedModel.id)}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 px-8 font-display text-sm font-black text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 uppercase"
                >
                  <Download size={16} />
                  {isModelOwned(selectedModel.id) ? 'Install Model' : 'Get Model'}
                </button>
              )}

              {isModelOwned(selectedModel.id) && !downloadingModelId && (
                <button
                  onClick={() => {
                    const existingDeployment = deployments.find((deployment) => deployment.modelId === selectedModel.id);
                    if (existingDeployment) {
                      setSelectedDeploymentId(existingDeployment.id);
                      setView('deployment-detail');
                    } else {
                      startDeployment(selectedModel.id);
                    }
                  }}
                  className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 py-3 px-5 font-display text-xs font-black text-cyan-300 transition-all hover:bg-cyan-500/20 uppercase"
                >
                  {deployments.some((deployment) => deployment.modelId === selectedModel.id) ? 'Manage Deployment' : 'Deploy'}
                </button>
              )}

              {/* Uninstall button for installed models */}
              {selectedModel.installed && !downloadingModelId && (
                <button
                  onClick={() => uninstallModel(selectedModel.id)}
                  className="p-3 rounded-xl border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                  title="Uninstall model weights"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Quick stats columns */}
            <div className="hidden lg:flex items-center gap-6 text-left">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                <div>
                  <span className="font-sans text-[9px] text-slate-500 block leading-none">Last Played</span>
                  <span className="font-display text-xs font-bold text-slate-300">
                    {selectedModel.installed ? '2 hours ago' : 'Never run'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-slate-500" />
                <div>
                  <span className="font-sans text-[9px] text-slate-500 block leading-none">Disk Space</span>
                  <span className="font-display text-xs font-bold text-slate-300">{selectedModel.sizeOnDisk}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-slate-500" />
                <div>
                  <span className="font-sans text-[9px] text-slate-500 block leading-none">Inference Mode</span>
                  <span className="font-display text-xs font-bold text-slate-300">
                    {selectedModel.pricingType === 'cloud-only' ? 'Managed Cloud' : 'Local GPU'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Tabs / Content */}
          <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-6 text-left">
            {/* Specs & Hardware config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4">
                <h3 className="font-display text-xs font-bold text-white mb-3">Model Configurations</h3>
                <ul className="flex flex-col gap-2 font-sans text-xs text-slate-400">
                  <li className="flex justify-between">
                    <span>Precision quantization</span>
                    <span className="font-bold text-slate-200">INT4 (Ultra-compressed)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Context limits</span>
                    <span className="font-bold text-slate-200">32k tokens</span>
                  </li>
                  <li className="flex justify-between">
                    <span>SafeTensor verified</span>
                    <span className="font-bold text-emerald-400">Verified ✓</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xs font-bold text-white mb-2">Hardware Telemetry</h3>
                  <p className="font-sans text-[11px] text-slate-500">Predicted memory usage parameters for your machine.</p>
                </div>
                <div className="flex items-center justify-between text-xs font-sans text-slate-300 border-t border-white/5 pt-3">
                  <span>Estimated VRAM draw:</span>
                  <span className="font-mono font-bold text-cyan-400">~6.4 GB / 8.0 GB</span>
                </div>
              </div>
            </div>

            {/* Overview / About */}
            <div>
              <h3 className="font-display text-sm font-bold text-white mb-2">Product Description</h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                {selectedModel.longDescription}
              </p>
            </div>

            {/* Quick Actions links */}
            <div className="border-t border-white/5 pt-5 flex items-center gap-4 mt-auto">
              <button
                onClick={() => {
                  setSelectedModelId(selectedModel.id);
                  setView('model-detail');
                }}
                className="rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 font-display text-xs font-bold text-slate-300 cursor-pointer"
              >
                View Store Page
              </button>
              <button
                onClick={() => {
                  setSelectedModelId(selectedModel.id);
                  setView('try');
                }}
                className="rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 font-display text-xs font-bold text-slate-300 cursor-pointer"
              >
                Try in Sandbox
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
