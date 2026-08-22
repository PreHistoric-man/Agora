import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLauncher } from '../context/LauncherContext';
import { ModelLogo } from './ModelLogo';
import {
  Layers,
  ShoppingBag,
  Rocket,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const {
    models,
    modelsLoading,
    libraryItems,
    libraryLoading,
    deployments,
    deploymentsLoading,
    setActiveView,
    openModelDetail,
    addToLibrary,
    isInLibrary,
  } = useLauncher();

  const userName = profile?.display_name || user?.email?.split('@')[0] || 'AI Engineer';

  // Recently used / Library shelf models
  const userLibraryModels = libraryItems
    .filter((item) => item.model)
    .slice(0, 4);

  // Active deployments
  const activeDeployments = deployments.filter(
    (d) => d.status === 'running' || d.status === 'deploying'
  );

  // Featured models in store
  const featuredModels = models.slice(0, 4);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto h-full">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agora Desktop Hub</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{userName}</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Manage your AI model library, control unified cloud deployments, and discover frontier foundation models.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('library')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Go to My Library ({libraryItems.length})</span>
            </button>

            <button
              onClick={() => setActiveView('store')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Model Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Notice if Not Signed In */}
      {!user && (
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-4">
          <div className="text-xs">
            <div className="font-bold text-cyan-200">Sign in to sync your cloud library & deployments</div>
            <div className="text-slate-400 text-[11px]">
              Access the same models and active cloud endpoints you configured on the Agora web app.
            </div>
          </div>
          <button
            onClick={() => openAuthModal('signin')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold whitespace-nowrap transition-colors"
          >
            Sign In to Agora
          </button>
        </div>
      )}

      {/* Section 1: Your Library / Recently Added */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Your Library</h2>
          </div>
          {userLibraryModels.length > 0 && (
            <button
              onClick={() => setActiveView('library')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group"
            >
              <span>View All ({libraryItems.length})</span>
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
        ) : userLibraryModels.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-white/5 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">Your library is currently empty</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Browse top foundation models from DeepSeek, Qwen, Meta, Mistral, and more in the Store and add them to your desktop library.
            </p>
            <button
              onClick={() => setActiveView('store')}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse Store</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userLibraryModels.map(({ model }) => {
              if (!model) return null;
              return (
                <div
                  key={model.id}
                  onClick={() => openModelDetail(model.id)}
                  className="group relative rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {model.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        In Library
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <ModelLogo logo={model.providerLogo} name={model.name} />
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
                      {model.parameters || 'Multi-param'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModelDetail(model.id);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
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
            onClick={() => setActiveView('deployments')}
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
              <div className="text-xs font-bold text-slate-300">No active deployments registered</div>
              <p className="text-xs text-slate-400">Deploy model endpoints via Agora web or configure custom cloud instances.</p>
            </div>
            <button
              onClick={() => setActiveView('deployments')}
              className="px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>View Deployments</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeployments.map((dep) => (
              <div
                key={dep.id}
                onClick={() => setActiveView('deployments')}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                    <span className="text-slate-200">{dep.instance_type || 'Cloud Instance'}</span>
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

      {/* Section 3: Featured Models */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Featured in Store</h2>
          </div>
          <button
            onClick={() => setActiveView('store')}
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
            {featuredModels.map((model) => {
              const inLib = isInLibrary(model.id);
              return (
                <div
                  key={model.id}
                  onClick={() => openModelDetail(model.id)}
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
                      <ModelLogo logo={model.providerLogo} name={model.name} />
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
                    {inLib ? (
                      <span className="text-[11px] font-semibold text-cyan-400">
                        ✓ In Library
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToLibrary(model.id);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
