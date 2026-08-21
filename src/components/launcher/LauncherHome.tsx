import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useRuntime } from '../../context/RuntimeContext';
import type { Model } from '../../data/mockData';
import type { LauncherViewType } from '../../types/launcher';
import { ModelLogo } from '../ModelLogo';
import {
  Play,
  Rocket,
  Layers,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HardDrive,
  Cpu,
  Clock,
  Server,
  RotateCw,
  AlertTriangle
} from 'lucide-react';

interface LauncherHomeProps {
  onSelectView: (view: LauncherViewType) => void;
  onSelectModel: (modelId: string) => void;
  onOpenDeployWizard: (modelId: string) => void;
}

export const LauncherHome: React.FC<LauncherHomeProps> = ({
  onSelectView,
  onSelectModel,
  onOpenDeployWizard
}) => {
  const { user, profile, isAuthenticated } = useAuth();
  const {
    models,
    modelsLoading,
    libraryItems,
    libraryLoading,
    deployments,
    deploymentsLoading,
    addToast
  } = useApp();

  const {
    runtimeStatus,
    getModelRuntimeInfo,
    startModel,
    installModel
  } = useRuntime();

  const userName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'AI Engineer';

  // Library models joined with real runtime status
  const userLibraryModels = libraryItems
    .filter((item) => item.model)
    .map((item) => {
      const rt = getModelRuntimeInfo(item.model);
      return {
        model: item.model!,
        runtime: rt,
        addedAt: item.added_at
      };
    });

  // Recently used models (from library, sorted by most recent)
  const recentlyUsed = userLibraryModels.slice(0, 4);

  // Active deployments
  const activeDeployments = deployments.filter(
    (d) => d.status === 'running' || d.status === 'deploying'
  );

  // Recommended models from Supabase models table that are NOT yet in the library
  const libraryModelIdSet = new Set(libraryItems.map((item) => item.model_id));
  const recommendedModels = models
    .filter((m) => !libraryModelIdSet.has(m.id))
    .slice(0, 4);

  const handleQuickAction = async (e: React.MouseEvent, model: Model) => {
    e.stopPropagation();
    const rt = getModelRuntimeInfo(model);

    if (rt.running) {
      onSelectView('library');
    } else if (rt.installed) {
      addToast(`Starting ${model.name}...`, 'info');
      await startModel(model);
      onSelectView('library');
    } else if (rt.supported) {
      addToast(`Pulling ${model.name}...`, 'info');
      await installModel(model);
      onSelectView('library');
    } else {
      onSelectModel(model.id);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto">
      {/* Hero Welcome Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Cpu className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agora Desktop Hub</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{userName}</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Manage your AI model library, control local Ollama weights, and orchestrate dedicated cloud inference endpoints seamlessly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectView('library')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Go to My Library ({libraryItems.length})</span>
            </button>

            <button
              onClick={() => onSelectView('store')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Model Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Runtime Quick Status Alert if Offline */}
      {!runtimeStatus?.available && (
        <div
          onClick={() => onSelectView('settings')}
          className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-950/40 transition-colors"
        >
          <div className="flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-200">Ollama Local Inference Service Offline</div>
              <div className="text-slate-400 text-[11px]">
                To run open-weights models locally without internet or GPU costs, start Ollama on <code>http://127.0.0.1:11434</code>.
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 underline whitespace-nowrap">Configure Runtime</span>
        </div>
      )}

      {/* Section 1: Recently Used / Library Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Recently Used</h2>
          </div>
          {userLibraryModels.length > 0 && (
            <button
              onClick={() => onSelectView('library')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group"
            >
              <span>View All Library</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {libraryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-900/60 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : recentlyUsed.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-white/5 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">Your library is currently empty</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Browse top foundation models from DeepSeek, Qwen, Meta, Mistral, and more in the Store and add them to your desktop library.
            </p>
            <button
              onClick={() => onSelectView('store')}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse Store</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyUsed.map(({ model, runtime }) => (
              <div
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className="group relative rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {model.category}
                    </span>
                    {runtime.running ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Running
                      </span>
                    ) : runtime.state === 'installing' ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <RotateCw className="w-2.5 h-2.5 animate-spin" />
                        {runtime.progress?.percent || 0}%
                      </span>
                    ) : runtime.installed ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Installed
                      </span>
                    ) : runtime.supported ? (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Not Installed
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-medium">
                        Cloud API
                      </span>
                    )}
                  </div>

                  {/* Logo + Name */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-lg shrink-0">
                      <ModelLogo logo={model.providerLogo} name={model.name} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {model.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{model.provider}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {model.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {runtime.sizeFormatted || model.parameters || 'Multi-param'}
                  </span>
                  <button
                    onClick={(e) => handleQuickAction(e, model)}
                    className="px-2.5 py-1 rounded bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{runtime.running ? 'Manage' : runtime.installed ? 'Launch' : runtime.supported ? 'Pull' : 'View'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Active Deployments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Active Deployments</h2>
          </div>
          <button
            onClick={() => onSelectView('deployments')}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 group"
          >
            <span>All Deployments ({deployments.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {deploymentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-900/60 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : activeDeployments.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/30 border border-white/5 flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-300">No active cloud or local deployment endpoints</div>
              <p className="text-xs text-slate-400">Launch a local runtime instance or deploy onto dedicated AWS GPU instances.</p>
            </div>
            <button
              onClick={() => onSelectView('deployments')}
              className="px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Deploy a Model</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeployments.map((dep) => (
              <div
                key={dep.id}
                onClick={() => onSelectView('deployments')}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">
                      {dep.model?.name || dep.model_id}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {dep.provider}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Instance:</span>
                    <span className="text-slate-200">{dep.instance_type || 'Local Host'}</span>
                  </div>
                  {dep.region && (
                    <div className="flex justify-between">
                      <span>Region:</span>
                      <span className="text-slate-200">{dep.region}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Recommended Store Discovery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Featured in Marketplace</h2>
          </div>
          <button
            onClick={() => onSelectView('store')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group"
          >
            <span>Explore All ({models.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {modelsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-900/60 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedModels.map((model) => (
              <div
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className="group relative rounded-xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {model.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">★ {model.rating.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-lg shrink-0">
                      <ModelLogo logo={model.providerLogo} name={model.name} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {model.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{model.provider}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {model.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {model.parameters || 'Weights'}
                  </span>
                  <span className="text-xs font-semibold text-cyan-400 group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
