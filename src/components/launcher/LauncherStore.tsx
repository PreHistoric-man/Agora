import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ModelLogo } from '../ModelLogo';
import {
  Search,
  ShoppingBag,
  Plus,
  Check,
  Star,
  ThumbsUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LauncherStoreProps {
  onSelectModel: (modelId: string) => void;
  onGoToLibrary: () => void;
}

export const LauncherStore: React.FC<LauncherStoreProps> = ({
  onSelectModel,
  onGoToLibrary
}) => {
  const {
    models,
    modelsLoading,
    libraryModelIds,
    addToLibrary,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [storeTab, setStoreTab] = useState<'all' | 'featured' | 'trending' | 'recent'>('all');
  const [addingId, setAddingId] = useState<string | null>(null);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['All', ...Array.from(set)];
  }, [models]);

  // Filtered models
  const filteredModels = useMemo(() => {
    let result = [...models];

    // Tab filter
    if (storeTab === 'featured') {
      result = result.filter((m) => m.featured || m.rating >= 4.7);
    } else if (storeTab === 'trending') {
      result = result.filter((m) => m.trending || m.reviewCount > 100);
    } else if (storeTab === 'recent') {
      result = result.slice().reverse();
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((m) => m.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => {
        const name = m.name?.toLowerCase() || '';
        const provider = m.provider?.toLowerCase() || '';
        const category = m.category?.toLowerCase() || '';
        const desc = m.description?.toLowerCase() || '';
        const tags = m.tags?.join(' ').toLowerCase() || '';
        return name.includes(q) || provider.includes(q) || category.includes(q) || desc.includes(q) || tags.includes(q);
      });
    }

    return result;
  }, [models, storeTab, selectedCategory, searchQuery]);

  const featuredSpotlight = models.find((m) => m.featured) || models[0];

  const handleAddModelToLibrary = async (e: React.MouseEvent, modelId: string, modelName: string) => {
    e.stopPropagation();
    setAddingId(modelId);
    try {
      const res = await addToLibrary(modelId);
      if (res.success) {
        addToast(`Added ${modelName} to your library.`, 'success');
      } else if (res.alreadyInLibrary) {
        addToast(`${modelName} is already in your library.`, 'info');
      } else {
        addToast(res.error || 'Failed to add model to library.', 'error');
      }
    } catch {
      addToast('An error occurred.', 'error');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto">
      {/* Spotlight Banner */}
      {featuredSpotlight && (
        <div className="relative rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20 p-6 md:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 text-cyan-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Model of the Week</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl">
                  <ModelLogo logo={featuredSpotlight.providerLogo} name={featuredSpotlight.name} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{featuredSpotlight.name}</h2>
                  <p className="text-xs text-slate-400">By {featuredSpotlight.provider}</p>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-2">
                {featuredSpotlight.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {featuredSpotlight.rating.toFixed(1)} Rating
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  98% Recommended
                </span>
                <span className="text-slate-400 font-mono">
                  {featuredSpotlight.parameters}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              {libraryModelIds.has(featuredSpotlight.id) ? (
                <button
                  onClick={onGoToLibrary}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>In Your Library</span>
                </button>
              ) : (
                <button
                  onClick={(e) => handleAddModelToLibrary(e, featuredSpotlight.id, featuredSpotlight.name)}
                  disabled={addingId === featuredSpotlight.id}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Library</span>
                </button>
              )}

              <button
                onClick={() => onSelectModel(featuredSpotlight.id)}
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Store Navigation Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foundation models, creators, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Section tabs */}
            <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10">
              <button
                onClick={() => setStoreTab('all')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  storeTab === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Models
              </button>
              <button
                onClick={() => setStoreTab('featured')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  storeTab === 'featured' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setStoreTab('trending')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  storeTab === 'trending' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setStoreTab('recent')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  storeTab === 'recent' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recently Added
              </button>
            </div>

            {/* Category selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Cards Grid */}
        {modelsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-slate-900/60 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-white/5 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No models found</h3>
            <p className="text-xs text-slate-400">Try changing your search terms or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((m) => {
              const inLibrary = libraryModelIds.has(m.id);
              const isAdding = addingId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className="group p-5 rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Category, Rating */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {m.category}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          ★ {m.rating.toFixed(1)}
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          👍 96%
                        </span>
                      </div>
                    </div>

                    {/* Logo + Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-lg shrink-0">
                        <ModelLogo logo={m.providerLogo} name={m.name} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {m.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{m.provider}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-slate-400 border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      {m.parameters || 'Open-Weight'}
                    </span>

                    <div className="flex items-center gap-2">
                      {inLibrary ? (
                        <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>In Library</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleAddModelToLibrary(e, m.id, m.name)}
                          disabled={isAdding}
                          className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm shadow-cyan-500/10"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAdding ? 'Adding...' : 'Add to Library'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectModel(m.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
