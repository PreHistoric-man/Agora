import React, { useState } from 'react';
import { useLauncher } from '../context/LauncherContext';
import { ModelLogo } from './ModelLogo';
import {
  ShoppingBag,
  Search,
  Plus,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Flame,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const StoreView: React.FC = () => {
  const {
    models,
    modelsLoading,
    addToLibrary,
    isInLibrary,
    openModelDetail,
  } = useLauncher();

  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'all' | 'recent'>('featured');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const categories = ['All', 'Reasoning', 'Coding', 'Image', 'Vision', 'Speech', 'Agents'];

  // Categorize models
  const featuredModels = models.filter((m) => m.overallScore >= 95 || m.rating >= 4.8);
  const trendingModels = [...models].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
  const recentModels = [...models].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  const getActiveList = () => {
    switch (activeTab) {
      case 'featured':
        return featuredModels;
      case 'trending':
        return trendingModels;
      case 'recent':
        return recentModels;
      case 'all':
      default:
        return models;
    }
  };

  const filteredModels = getActiveList().filter((model) => {
    const matchesCategory =
      selectedCategory === 'All' || model.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      search.trim() === '' ||
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.provider.toLowerCase().includes(search.toLowerCase()) ||
      model.description.toLowerCase().includes(search.toLowerCase()) ||
      model.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Agora Model Store
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover frontier open-weights and enterprise models across reasoning, vision, code, and multimodal.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-white/10 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'featured'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured</span>
          </button>

          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'trending'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>All Models</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'recent'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recent</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models in store..."
            className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {modelsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-3 max-w-md mx-auto my-8">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-slate-200">No models match your filter</div>
          <p className="text-xs text-slate-400">Try changing the category filter or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModels.map((model) => {
            const inLibrary = isInLibrary(model.id);

            return (
              <div
                key={model.id}
                onClick={() => openModelDetail(model.id)}
                className="group relative rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Category & Score */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {model.category}
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      ★ {model.rating.toFixed(1)}
                      <span className="text-[9px] text-slate-500 font-normal">({model.reviewsCount})</span>
                    </span>
                  </div>

                  {/* Logo + Title */}
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

                  {/* Specs */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5">
                      {model.parameters || 'Weights'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5">
                      {model.isOpenSource ? 'Open Weights' : 'API Service'}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-300">
                    {model.inputPricePerMillion === 0
                      ? 'Free / Self-Host'
                      : `$${model.inputPricePerMillion}/M`}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModelDetail(model.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Inspect Model"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {inLibrary ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        In Library
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToLibrary(model.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
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
  );
};
