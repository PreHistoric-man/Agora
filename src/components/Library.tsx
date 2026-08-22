import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Deployment, DeploymentStatus as SysDeploymentStatus } from '../types/deployment';
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
  Compass,
  Server,
  StopCircle,
  XCircle,
  Globe,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const Library: React.FC = () => {
  const {
    libraryItems,
    libraryLoading,
    removeFromLibrary,
    updateLibraryItemStatus,
    setView,
    setSelectedModelId,
    addToast,
    deployments,
    deploymentsLoading,
    openDeploymentWizard,
    openDeploymentDetails,
    stopDeployment,
    terminateDeployment,
    awsConnection
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
      result.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    } else if (activeTab === 'installed') {
      result = result.filter((item) => item.installed);
    } else if (activeTab === 'available') {
      result = result.filter((item) => !item.installed);
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

  // Filtered deployments list for the Deployments tab
  const filteredDeployments = useMemo(() => {
    if (!librarySearch.trim()) return deployments;
    const q = librarySearch.toLowerCase();
    return deployments.filter((d) => {
      const modelName = d.model?.name?.toLowerCase() || '';
      const modelId = d.model_id.toLowerCase();
      const provider = d.provider.toLowerCase();
      const region = (d.region || '').toLowerCase();
      const instance = (d.instance_type || '').toLowerCase();
      return (
        modelName.includes(q) ||
        modelId.includes(q) ||
        provider.includes(q) ||
        region.includes(q) ||
        instance.includes(q)
      );
    });
  }, [deployments, librarySearch]);

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

  const handleLaunchDeployWizard = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    openDeploymentWizard(modelId);
  };

  const handleStopDeploymentAction = async (e: React.MouseEvent, dep: Deployment) => {
    e.stopPropagation();
    setActionLoadingId(`stop-${dep.id}`);
    try {
      const res = await stopDeployment(dep.id);
      if (res.success) {
        addToast(`Stopped deployment for ${dep.model?.name || dep.model_id}.`, 'warning');
      } else {
        addToast(res.error || 'Failed to stop deployment.', 'error');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTerminateDeploymentAction = async (e: React.MouseEvent, dep: Deployment) => {
    e.stopPropagation();
    setActionLoadingId(`term-${dep.id}`);
    try {
      const res = await terminateDeployment(dep.id);
      if (res.success) {
        addToast(`Terminated deployment for ${dep.model?.name || dep.model_id}.`, 'warning');
      } else {
        addToast(res.error || 'Failed to terminate deployment.', 'error');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const installedCount = libraryItems.filter((i) => i.installed).length;
  const deployedCount = deployments.length;

  const renderStatusBadge = (status: SysDeploymentStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="rounded-md px-2.5 py-0.5 font-display text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Running
          </span>
        );
      case 'deploying':
        return (
          <span className="rounded-md px-2.5 py-0.5 font-display text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
            <div className="w-2.5 h-2.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            Deploying
          </span>
        );
      case 'stopped':
        return (
          <span className="rounded-md px-2.5 py-0.5 font-display text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 flex items-center gap-1.5">
            <StopCircle size={11} className="text-slate-400" />
            Stopped
          </span>
        );
      case 'failed':
        return (
          <span className="rounded-md px-2.5 py-0.5 font-display text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <AlertTriangle size={11} className="text-rose-400" />
            Failed
          </span>
        );
      case 'terminated':
        return (
          <span className="rounded-md px-2.5 py-0.5 font-display text-[11px] font-bold bg-zinc-800 text-slate-400 border border-white/10 flex items-center gap-1.5 line-through">
            <XCircle size={11} className="text-slate-500" />
            Terminated
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="rounded-md px-2.5 py-0.5 font-display text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Pending
          </span>
        );
    }
  };

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
            Your personal collection of foundation models, weights, and real cloud runtime endpoints synced to your Supabase account.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setView('launcher')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-cyan-500/40 font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            title="Download or open ModalHub Desktop Launcher"
          >
            <HardDrive size={14} className="text-cyan-400" /> Desktop Launcher
          </button>

          {libraryItems.length > 0 && (
            <button
              onClick={() => {
                if (libraryItems[0]) {
                  openDeploymentWizard(libraryItems[0].model_id);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <Server size={14} /> Deploy Model
            </button>
          )}

          <button
            onClick={() => setView('discover')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
          >
            <Plus size={14} /> Browse Marketplace
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black to-indigo-950/40 border border-cyan-500/20 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-slate-300">
          <Sparkles size={18} className="text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">Phase 1 Deployment System Active: </strong>
            Deploy models to Local or AWS runtimes with real Supabase records, strict RLS isolation, and library verification.
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
          <span className="text-[10px] text-cyan-300 font-medium">Ready for Inference & Deployment</span>
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
            <Server size={13} className="text-indigo-400" /> Supabase Deployments
          </span>
          <span className="font-display text-2xl font-black text-indigo-300">{deployedCount}</span>
          <span className="text-[10px] text-slate-400 font-sans">Local & AWS endpoints</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-amber-400" /> Supabase RLS Synced
          </span>
          <span className="font-display text-2xl font-black text-amber-300">Active</span>
          <span className="text-[10px] text-emerald-400 font-medium">Isolated by auth.uid()</span>
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
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deployments'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Server size={12} />
            Deployments ({deployedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          {activeTab !== 'deployments' && categories.length > 2 && (
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
              placeholder={activeTab === 'deployments' ? 'Search deployments...' : 'Search library...'}
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="w-full rounded-xl bg-black/60 border border-white/10 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DEPLOYMENTS TAB VIEW (Section 13) */}
      {/* ========================================================== */}
      {activeTab === 'deployments' ? (
        <div className="space-y-4">
          {/* AWS Account Connection Status Banner */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  awsConnection && awsConnection.status === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                }`}
              >
                <Cloud size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold text-white">
                    AWS Cloud Infrastructure
                  </span>
                  {awsConnection && awsConnection.status === 'connected' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      ✓ Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="font-sans text-[11px] text-slate-400">
                  {awsConnection && awsConnection.status === 'connected' ? (
                    <span>
                      Account: <code className="font-mono text-emerald-300 font-bold">{awsConnection.account_id}</code> • Region: <span className="text-white">{awsConnection.region || 'us-east-1'}</span> • STS Cross-Account Active
                    </span>
                  ) : (
                    <span>Connect your AWS account via IAM Cross-Account Role to enable cloud deployments.</span>
                  )}
                </p>
              </div>
            </div>

            {libraryItems.length > 0 && (
              <button
                type="button"
                onClick={() => openDeploymentWizard(libraryItems[0].model_id)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 font-display text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Server size={12} />
                Deploy Model
              </button>
            )}
          </div>

          {deploymentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse"></div>
            ))}
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="rounded-3xl glass-panel p-12 text-center flex flex-col items-center gap-4 border border-white/10 my-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Server size={32} />
            </div>
            <div className="max-w-md">
              <h3 className="font-display text-lg font-black text-white mb-1.5">
                No Active Deployments Found
              </h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                You haven't provisioned any deployments yet. Select any model in your library to start the 4-step deployment wizard for Local or AWS execution.
              </p>
            </div>
            {libraryItems.length > 0 && (
              <button
                type="button"
                onClick={() => openDeploymentWizard(libraryItems[0].model_id)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
              >
                <Server size={14} /> Deploy a Library Model
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDeployments.map((dep) => {
              const model = dep.model;
              const isActionBusy = actionLoadingId === `stop-${dep.id}` || actionLoadingId === `term-${dep.id}`;

              return (
                <div
                  key={dep.id}
                  onClick={() => openDeploymentDetails(dep.id)}
                  className="group rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-indigo-500/40 p-5 shadow-xl transition-all duration-300 hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between gap-4 backdrop-blur-md"
                >
                  <div>
                    {/* Header: Model Logo, Name & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 shadow-inner shrink-0">
                          {model ? (
                            <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={20} />
                          ) : (
                            <Server size={18} className="text-cyan-400" />
                          )}
                        </span>
                        <div>
                          <h3 className="font-display text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                            {model?.name || dep.model_id}
                          </h3>
                          <span className="font-sans text-[11px] text-slate-400">
                            {model?.provider || 'AI Model'} • {model?.category || 'General'}
                          </span>
                        </div>
                      </div>

                      {renderStatusBadge(dep.status)}
                    </div>

                    {/* Infrastructure Specs Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] mb-3">
                      <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                        <span className="text-[9px] text-slate-500 block">Provider</span>
                        <span className="font-display font-bold text-white uppercase flex items-center gap-1">
                          {dep.provider === 'aws' ? <Cloud size={11} className="text-indigo-400" /> : <HardDrive size={11} className="text-cyan-400" />}
                          {dep.provider}
                        </span>
                      </div>

                      <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                        <span className="text-[9px] text-slate-500 block">Region</span>
                        <span className="font-display font-bold text-slate-200 truncate">
                          {dep.region || 'Local'}
                        </span>
                      </div>

                      <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                        <span className="text-[9px] text-slate-500 block">Instance / Hardware</span>
                        <span className="font-display font-bold text-slate-200 truncate">
                          {dep.instance_type || 'Local Host'}
                        </span>
                      </div>
                    </div>

                    {/* Endpoint Status Line */}
                    <div className="rounded-xl bg-black/50 border border-white/5 px-3 py-2 text-[11px] font-mono flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5 truncate">
                        <Globe size={12} className="text-cyan-400 shrink-0" />
                        {dep.endpoint ? dep.endpoint : 'Pending deployment'}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {dep.endpoint ? 'Active' : 'No endpoint provisioned'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeploymentDetails(dep.id);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-display text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Manage & Details <ChevronRight size={13} />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {dep.status === 'running' && (
                        <button
                          type="button"
                          disabled={isActionBusy}
                          onClick={(e) => handleStopDeploymentAction(e, dep)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-display font-bold transition-all cursor-pointer"
                        >
                          Stop
                        </button>
                      )}

                      {dep.status !== 'terminated' && (
                        <button
                          type="button"
                          disabled={isActionBusy}
                          onClick={(e) => handleTerminateDeploymentAction(e, dep)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 border border-white/10 text-[11px] font-display font-bold transition-all cursor-pointer"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      ) : (
        /* ========================================================== */
        /* STANDARD LIBRARY MODELS GRID */
        /* ========================================================== */
        libraryLoading ? (
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
          /* Empty Library State */
          <div className="rounded-3xl glass-panel p-12 text-center flex flex-col items-center gap-4 border border-white/10 my-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Box size={32} />
            </div>
            <div className="max-w-md">
              <h3 className="font-display text-lg font-black text-white mb-1.5">
                {librarySearch.trim() || selectedCategory !== 'All'
                  ? 'No Matching Library Models'
                  : 'Your Library is Empty'}
              </h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                {librarySearch.trim() || selectedCategory !== 'All'
                  ? 'Try clearing your search query or selecting a different category filter.'
                  : 'Explore the Agora marketplace to acquire open-weight foundation models or enterprise commercial APIs.'}
              </p>
            </div>
            <button
              onClick={() => setView('discover')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Compass size={14} /> Explore AI Models
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const m = item.model;
              if (!m) return null;

              const isActionBusy =
                actionLoadingId === `install-${item.model_id}` ||
                actionLoadingId === `deploy-${item.model_id}` ||
                actionLoadingId === `remove-${item.model_id}`;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenModel(item.model_id)}
                  className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-cyan-500/40 p-5 shadow-xl transition-all duration-300 hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                >
                  {/* Top Header Row */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm border border-white/10 shadow-inner">
                          <ModelLogo modelId={m.id} provider={m.provider} category={m.category} size={16} />
                        </span>
                        <div>
                          <span className="font-display text-xs font-bold text-slate-300 block">
                            {m.creator || m.provider}
                          </span>
                          <span className="font-sans text-[10px] text-cyan-400 font-medium">
                            {m.category}
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
                            <Server size={10} />
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
                      {/* Launch Deployment Wizard */}
                      <button
                        type="button"
                        onClick={(e) => handleLaunchDeployWizard(e, item.model_id)}
                        className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Server size={12} className="text-cyan-400" />
                        Deploy Model
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

                    {/* Secondary Utility Row (Playground & Remove) */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModelId(item.model_id);
                          setView('try');
                        }}
                        className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play size={11} className="text-cyan-400 fill-cyan-400" />
                        Playground
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
        )
      )}
    </div>
  );
};
