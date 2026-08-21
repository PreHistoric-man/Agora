import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MODEL_TAG_GROUPS } from '../data/mockData';
import { ModelTags } from './ModelTags';
import { Search, Star, Download, Heart, SlidersHorizontal, RefreshCw, Cpu } from 'lucide-react';

export const Discover: React.FC = () => {
  const {
    models,
    creators,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    toggleWishlist,
    setSelectedModelId,
    setView
  } = useApp();

  // Filters state
  const [pricingFilter, setPricingFilter] = useState<string>('All');
  const [maxVram, setMaxVram] = useState<number>(80);
  const [minRating, setMinRating] = useState<number>(0);
  const [runsLocally, setRunsLocally] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('installed');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Categories list
  const categories = ['All', 'Reasoning', 'Coding', 'Image', 'Video', 'Audio', 'Vision', 'Writing', 'Agents', 'Speech', 'Science'];

  // Handle example suggestion click
  const handleSuggestionClick = () => {
    setSearchQuery('fast coding model');
    setSelectedCategory('Coding');
    setMaxVram(8);
    setRunsLocally(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPricingFilter('All');
    setMaxVram(80);
    setMinRating(0);
    setRunsLocally(false);
    setSortBy('installed');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag) ? currentTags.filter((currentTag) => currentTag !== tag) : [...currentTags, tag]
    );
  };

  // Filter models list
  const filteredModels = models
    .filter((m) => {
      // Category filter
      return selectedCategory === 'All' || m.category === selectedCategory;
    })
    .filter((m) => {
      // Search query
      const matchText = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(matchText) ||
        m.description.toLowerCase().includes(matchText) ||
        m.category.toLowerCase().includes(matchText) ||
        m.tags.some((t) => t.toLowerCase().includes(matchText))
      );
    })
    .filter((m) => {
      // Capability tags filter
      return selectedTags.length === 0 || selectedTags.some((selectedTag) =>
        m.tags.some((modelTag) => modelTag.toLowerCase() === selectedTag.toLowerCase())
      );
    })
    .filter((m) => {
      // Pricing filter
      if (pricingFilter === 'Free') return m.price === 0;
      if (pricingFilter === 'Paid') return m.price > 0;
      if (pricingFilter === 'Discounted') return m.isDiscounted || (m.originalPrice && m.originalPrice > m.price);
      if (pricingFilter === 'Subscription') return m.pricingType === 'subscription';
      return true;
    })
    .filter((m) => {
      // VRAM filter
      const parseVram = (v: string) => {
        const parsed = parseInt(v.split(' ')[0]);
        return isNaN(parsed) ? 0 : parsed;
      };
      const vramNum = parseVram(m.systemRequirements.minimum.vram);
      return vramNum <= maxVram;
    })
    .filter((m) => {
      // Rating filter
      return m.rating >= minRating;
    })
    .filter((m) => {
      // Runs locally
      if (runsLocally) return m.pricingType !== 'cloud-only';
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'new') return b.releaseDate.localeCompare(a.releaseDate);
      if (sortBy === 'trending') return b.installCount * b.rating - a.installCount * a.rating;
      return b.installCount - a.installCount; // default 'installed'
    });

  const handleCardClick = (id: string) => {
    setSelectedModelId(id);
    setView('model-detail');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in text-left select-none">
      {/* HEADER SECTION */}
      <section className="mb-10">
        <h1 className="font-display text-3xl font-black text-white mb-2">Discover AI</h1>
        <p className="font-sans text-xs text-slate-400">Search and filter models based on category, parameters, and pricing.</p>
      </section>

      {/* DISCOVER SEARCH BANNER */}
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none select-none">
          <Cpu size={200} className="text-cyan-400 rotate-12 translate-x-12 translate-y-6" />
        </div>

        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <h2 className="font-display text-lg font-black text-white">What do you want to build?</h2>
          
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="E.g., Find a photorealistic image model, speech cloner, reasoning agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl glass-input pl-11 pr-4 py-3.5 font-sans text-sm text-white placeholder-slate-500 shadow-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap font-sans text-xs text-slate-400">
            <span>Suggestion:</span>
            <button
              onClick={handleSuggestionClick}
              className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline text-left cursor-pointer"
            >
              “Find me a fast coding model that runs on 8GB VRAM.”
            </button>
          </div>
        </div>
      </section>

      {/* MAIN DISCOVER LAYOUT (SIDEBAR FILTER + RESULTS GRID) */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDEBAR FILTERS PANEL */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6 rounded-2xl glass-panel p-5 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-display text-xs font-black text-white flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-cyan-400" />
              Advanced Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="font-sans text-[10px] text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw size={10} /> Reset
            </button>
          </div>

          {/* Categories select */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Model Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg bg-slate-950 border border-white/10 px-3 py-2 font-display text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer w-full"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Capability tags */}
          <details className="group border-t border-white/5 pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white">
              <span>Capability Tags{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}</span>
              <span className="text-cyan-400 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-3 max-h-72 overflow-y-auto pr-1">
              {Object.entries(MODEL_TAG_GROUPS).map(([group, tags]) => (
                <div key={group} className="mb-3 last:mb-0">
                  <p className="mb-1.5 font-sans text-[9px] font-semibold text-slate-600">{group}</p>
                  <div className="flex flex-col gap-1.5">
                    {tags.map((tag) => (
                      <label key={tag} className="flex cursor-pointer items-start gap-2 font-sans text-[10px] leading-tight text-slate-400 hover:text-white">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="mt-0.5 accent-cyan-400"
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>

          {/* Pricing tiers */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pricing Model</label>
            <div className="flex flex-col gap-2 font-sans text-xs text-slate-400">
              {['All', 'Discounted', 'Free', 'Paid', 'Subscription'].map((tier) => (
                <label key={tier} className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="pricing"
                    checked={pricingFilter === tier}
                    onChange={() => setPricingFilter(tier)}
                    className="accent-cyan-400"
                  />
                  <span className={tier === 'Discounted' ? 'text-amber-400 font-bold flex items-center gap-1' : ''}>
                    {tier === 'Discounted' ? '⚡ On Discount' : tier}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Hardware slider (Max VRAM) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Max VRAM draw</span>
              <span className="font-display font-bold text-cyan-400">{maxVram} GB limit</span>
            </div>
            <input
              type="range"
              min={4}
              max={80}
              step={4}
              value={maxVram}
              onChange={(e) => setMaxVram(Number(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="font-sans text-[9px] text-slate-500 leading-normal mt-0.5">
              Filters models based on local hardware VRAM requirements.
            </p>
          </div>

          {/* Ratings filter */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Min User Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="rounded-lg bg-slate-950 border border-white/10 px-3 py-2 font-sans text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">★ 4.5 & up</option>
              <option value="4.7">★ 4.7 & up</option>
              <option value="4.8">★ 4.8 & up</option>
            </select>
          </div>

          {/* Local checkboxes */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
            <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-slate-400 hover:text-white">
              <input
                type="checkbox"
                checked={runsLocally}
                onChange={() => setRunsLocally(!runsLocally)}
                className="accent-cyan-400 rounded"
              />
              <span>Supports Local Inference</span>
            </label>
          </div>
        </div>

        {/* RIGHT CONTENT RESULTS */}
        <div className="flex-grow flex flex-col gap-5">
          {/* Result count & sorting */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-sans text-xs text-slate-500">
              Showing <strong className="text-slate-300">{filteredModels.length}</strong> models matching parameters
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 font-bold border-none focus:outline-none cursor-pointer text-xs"
              >
                <option value="installed">Most Installed</option>
                <option value="trending">Trending Today</option>
                <option value="rating">Highest Rated</option>
                <option value="new">Recently Released</option>
              </select>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModels.length === 0 ? (
              <div className="col-span-3 rounded-2xl border border-white/5 py-24 text-center text-slate-500 text-sm">
                No models discovered matching active configurations. Try resetting filters.
              </div>
            ) : (
              filteredModels.map((m) => {
                const creator = creators.find((c) => c.id === m.creatorId);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleCardClick(m.id)}
                    className="group flex flex-col justify-between rounded-2xl glass-panel p-3.5 border border-white/5 hover:border-cyan-500/20 cursor-pointer steam-card"
                  >
                    <div>
                      {/* Artwork thumbnail */}
                      <div className={`w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${m.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-black/45 px-2 py-0.5 font-display text-[8px] font-black text-slate-200 uppercase backdrop-blur-sm leading-none">
                            {m.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(m.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              m.wishlisted
                                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                                : 'bg-black/40 border-transparent text-slate-400 hover:text-white'
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart size={12} fill={m.wishlisted ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between font-sans text-[9px] text-white/50">
                          <span>VRAM: {m.systemRequirements.minimum.vram}</span>
                          <span>{m.version}</span>
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <h3 className="font-display font-black text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
                          {m.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 shrink-0">
                          <Star size={10} fill="currentColor" />
                          {m.rating}
                        </div>
                      </div>
                      <span className="font-sans text-[9px] text-slate-500 block mb-2 leading-none">by {creator?.name}</span>
                      <ModelTags tags={m.tags} limit={3} className="mb-3" />
                      
                      <p className="font-sans text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {m.description}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-none">
                        <Download size={10} />
                        {(m.installCount / 1000).toFixed(0)}k downloads
                      </div>
                      {m.isDiscounted && m.originalPrice ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-display font-extrabold text-xs text-amber-300">
                            ₹{m.price}
                          </span>
                          <span className="font-sans text-[10px] text-slate-500 line-through">
                            ₹{m.originalPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="font-display font-extrabold text-xs text-white">
                          {m.price === 0 ? 'Free' : `₹${m.price}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
