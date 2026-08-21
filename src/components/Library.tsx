import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { DeploymentStatus } from '../types/library';
import { ModelLogo } from './ModelLogo';
import {
  HardDrive,
  Download,
  CheckCircle2,
  Trash2,
  Zap,
  Play,
  Cloud,
  Layers,
  Sparkles,
  Search,
  Plus,
  Box,
  Cpu,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const Library: React.FC = () => {
  const {
    libraryItems,
    libraryLoading,
    removeFromLibrary,
    updateLibraryItemStatus,
    setView,
    setSelectedModelId,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'installed' | 'available' | 'deployments'>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Derived categories in user library
  const categories = useMemo(() => {
    const set = new Set<string>();
    libraryItems.forEach((item) => {
      if (item.model?.category) set.add(item.model.category);
    });
    return ['All', ...Array.from(set)];
  }, [libraryItems]);

  // Filtered library items based on tab, search, and category
  const filteredItems = useMemo(() => {
    let result = [...libraryItems];

    // Tab filter
    if (activeTab === 'recent') {
      // Sort by added_at descending
      result.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    } else if (activeTab === 'installed') {
      result = result.filter((item) => item.installed);
    } else if (activeTab === 'available') {
      result = result.filter((item) => !item.installed);
    } else if (activeTab === 'deployments') {
      result = result.filter((item) => item.deployment_status && item.deployment_status !== 'not_deployed');
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.model?.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query filter
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      result = result.filter((item) => {
        const name = item.model?.name?.toLowerCase() || '';
        const provider = item.model?.provider?.toLowerCase() || '';
        const category = item.model?.category?.toLowerCase() || '';
        const desc = item.model?.description?.toLowerCase() || '';
        return (
          name.includes(q) ||
          provider.includes(q) ||
          category.includes(q) ||
          desc.includes(q) ||
          item.model_id.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [libraryItems, activeTab, selectedCategory, librarySearch]);

  const handleOpenModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setView('model-detail');
  };

  const handleRemove = async (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setActionLoadingId(`remove-${modelId}`);
    try {
      await removeFromLibrary(modelId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleInstall = async (e: React.MouseEvent, item: (typeof libraryItems)[0]) => {
    e.stopPropagation();
    setActionLoadingId(`install-${item.model_id}`);
    try {
      const nextInstalled = !item.installed;
      const nextVersion = nextInstalled ? item.model?.version || 'v1.0' : null;
      await updateLibraryItemStatus(item.model_id, {
        installed: nextInstalled,
        installed_version: nextVersion
      });
      addToast(
        nextInstalled
          ? `Marked ${item.model?.name || item.model_id} as Installed locally.`
          : `Uninstalled ${item.model?.name || item.model_id} local weights.`,
        'success'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleDeployment = async (e: React.MouseEvent, item: (typeof libraryItems)[0]) => {
    e.stopPropagation();
    setActionLoadingId(`deploy-${item.model_id}`);
    try {
      const nextStatus: DeploymentStatus =
        item.deployment_status === 'running'
          ? 'stopped'
          : item.deployment_status === 'stopped' || item.deployment_status === 'not_deployed'
          ? 'running'
          : 'not_deployed';

      await updateLibraryItemStatus(item.model_id, {
        deployment_status: nextStatus
      });
      addToast(
        `Updated cloud endpoint status for ${item.model?.name || item.model_id} to ${nextStatus}.`,
        'success'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const installedCount = libraryItems.filter((i) => i.installed).length;
  const deployedCount = libraryItems.filter((i) => i.deployment_status === 'running' || i.deployment_status === 'deploying').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left">
      {/* Top Banner & Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
              <Box size={20} />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
              My Model Library
            </h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-display text-xs font-bold text-cyan-300 border border-cyan-500/30">
              {libraryItems.length} {libraryItems.length === 1 ? 'Model' : 'Models'} Owned
            </span>
          </div>
          <p className="font-sans text-xs text-slate-400">
            Your personal collection of foundation models, weights, and cloud runtime endpoints synced to your Supabase account.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setView('discover')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
          >
            <Plus size={14} /> Browse Marketplace
          </button>
        </div>
      </div>

      {/* Launcher Compatibility & Info Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black to-indigo-950/40 border border-cyan-500/20 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-slate-300">
          <Sparkles size={18} className="text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">Steam-Style Desktop Launcher Ready: </strong>
            All models added here will sync seamlessly to the ModalHub Desktop Launcher for 1-click local GGUF/Safetensors execution.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('try')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-display text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Zap size={13} /> Interactive Playground
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <Box size={13} className="text-cyan-400" /> Total Library Models
          </span>
          <span className="font-display text-2xl font-black text-white">{libraryItems.length}</span>
          <span className="text-[10px] text-cyan-300 font-medium">Ready for Inference</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <HardDrive size={13} className="text-emerald-400" /> Installed Locally
          </span>
          <span className="font-display text-2xl font-black text-emerald-300">{installedCount}</span>
          <span className="text-[10px] text-slate-400 font-sans">Weights downloaded to launcher</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <Cloud size={13} className="text-indigo-400" /> Active Cloud Deployments
          </span>
          <span className="font-display text-2xl font-black text-indigo-300">{deployedCount}</span>
          <span className="text-[10px] text-slate-400 font-sans">Endpoints provisioned</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-amber-400" /> Supabase RLS Synced
          </span>
          <span className="font-display text-2xl font-black text-amber-300">Active</span>
          <span className="text-[10px] text-emerald-400 font-medium">Authenticated & Isolated</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Models ({libraryItems.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'recent'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Recently Added
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'installed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Installed ({installedCount})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'available'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Available ({libraryItems.length - installedCount})
          </button>
          <button
            onClick={() => setActiveTab('deployments')}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deployments'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Deployments ({deployedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          {/* Category dropdown if multiple */}
          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          )}

          {/* Search bar inside library */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search library..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="w-full rounded-xl bg-black/60 border border-white/10 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Library Models Grid */}
      {libraryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 animate-pulse flex flex-col justify-between h-72"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-5 w-16 bg-white/10 rounded"></div>
                </div>
                <div className="h-5 w-40 bg-white/10 rounded mb-2"></div>
                <div className="h-3 w-full bg-white/10 rounded mb-4"></div>
              </div>
              <div className="h-10 w-full bg-white/10 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty Library State per Requirement 15 */
        <div className="rounded-3xl glass-panel p-12 text-center flex flex-col items-center gap-4 border border-white/10 my-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Box size={32} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Your Library is Empty</h2>
            <p className="font-sans text-xs text-slate-400 max-w-md mx-auto">
              Discover AI models in the marketplace and add them to your library for instant API access, playground testing, and desktop launcher syncing.
            </p>
          </div>
          <button
            onClick={() => setView('discover')}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all cursor-pointer flex items-center gap-2 mt-2"
          >
            <Compass size={15} /> Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const m = item.model;
            if (!m) return null;

            const isActionBusy = actionLoadingId === `install-${item.model_id}` || actionLoadingId === `deploy-${item.model_id}` || actionLoadingId === `remove-${item.model_id}`;

            return (
              <div
                key={item.id || item.model_id}
                onClick={() => handleOpenModel(item.model_id)}
                className="group relative flex flex-col justify-between rounded-2xl glass-panel p-5 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 steam-card cursor-pointer shadow-lg hover:shadow-cyan-500/10"
              >
                <div>
                  {/* Top Header: Provider, Category & Installed Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/10 shadow-inner">
                        <ModelLogo modelId={m.id} provider={m.provider} category={m.category} size={16} />
                      </span>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-display text-xs font-bold text-slate-300 tracking-wide block">
                            {m.creator || m.provider}
                          </span>
                          {m.verified && (
                            <ShieldCheck size={12} className="text-cyan-400 shrink-0" />
                          )}
                        </div>
                        <span className="font-sans text-[10px] text-slate-400 block -mt-0.5">
                          {m.category} • {m.version || 'v1.0'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* Installed Status Badge */}
                      {item.installed ? (
                        <span className="rounded-md px-2 py-0.5 font-display text-[10px] font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          Installed
                        </span>
                      ) : (
                        <span className="rounded-md px-2 py-0.5 font-display text-[10px] font-bold border bg-white/5 text-slate-400 border-white/10 flex items-center gap-1">
                          Available
                        </span>
                      )}

                      {/* Deployment Status Badge */}
                      {item.deployment_status && item.deployment_status !== 'not_deployed' && (
                        <span
                          className={`rounded-md px-2 py-0.5 font-display text-[10px] font-bold border flex items-center gap-1 ${
                            item.deployment_status === 'running'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          <Cloud size={10} />
                          {item.deployment_status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="font-display text-base font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
                    {m.name}
                  </h3>

                  <p className="font-sans text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {m.description}
                  </p>

                  {/* Specs Pill List (Context, Parameters, Runtime, License) */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[10px]">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/5 flex items-center gap-1">
                      <Layers size={10} className="text-cyan-400" /> {m.contextWindow}
                    </span>
                    {(m.model_size || m.parameters) && (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/5 flex items-center gap-1 truncate max-w-[120px]">
                        <Cpu size={10} className="text-indigo-400" /> {m.model_size || m.parameters}
                      </span>
                    )}
                    <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/5 truncate max-w-[110px]">
                      {m.license}
                    </span>
                  </div>
                </div>

                {/* Footer Controls & Steam-Style Action Row */}
                <div className="border-t border-white/10 pt-3 flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Launch in Playground */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModelId(item.model_id);
                        setView('try');
                      }}
                      className="w-full py-2 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play size={12} className="text-cyan-400 fill-cyan-400" />
                      Playground
                    </button>

                    {/* Toggle Install State */}
                    <button
                      type="button"
                      disabled={isActionBusy}
                      onClick={(e) => handleToggleInstall(e, item)}
                      className={`w-full py-2 px-2.5 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        item.installed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                      }`}
                    >
                      {item.installed ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          Installed
                        </>
                      ) : (
                        <>
                          <Download size={12} className="text-slate-400" />
                          Install Weights
                        </>
                      )}
                    </button>
                  </div>

                  {/* Secondary Utility Row (Deploy Toggle & Remove) */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      disabled={isActionBusy}
                      onClick={(e) => handleToggleDeployment(e, item)}
                      className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Cloud size={12} />
                      {item.deployment_status === 'running' ? 'Stop Endpoint' : 'Deploy Endpoint'}
                    </button>

                    <button
                      type="button"
                      disabled={isActionBusy}
                      onClick={(e) => handleRemove(e, item.model_id)}
                      className="text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Remove model from your library"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
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
