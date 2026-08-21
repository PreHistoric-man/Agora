import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wrench, Search, Star, Sparkles } from 'lucide-react';

export const Workshop: React.FC = () => {
  const { workshopItems, toggleSubscribeWorkshop, setView, setSelectedModelId } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchVal, setSearchVal] = useState<string>('');

  const categories = ['All', 'LoRAs', 'Fine-tunes', 'Prompts', 'Workflows', 'Agents', 'Presets', 'Extensions'];

  // Filter items
  const filteredItems = workshopItems
    .filter((item) => selectedCat === 'All' || item.category === selectedCat)
    .filter((item) =>
      item.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.modelName.toLowerCase().includes(searchVal.toLowerCase())
    );

  // Sorting segments
  const trendingItems = filteredItems.slice(0, 4);
  const mostSubscribed = [...filteredItems].sort((a, b) => b.subscribers - a.subscribers).slice(0, 4);
  const newAndPopular = [...filteredItems].reverse().slice(0, 4);

  const handleModelClick = (modelId: string) => {
    setSelectedModelId(modelId);
    setView('model-detail');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in text-left select-none">
      {/* 1. WORKSHOP HERO */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-violet-950/20 to-fuchsia-950/15 p-6 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-0.5 font-display text-[10px] font-extrabold tracking-wider text-fuchsia-400 uppercase">
            <Wrench size={12} /> COMMUNITY WORKSHOP
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white mt-2">
            ModelVerse Workshop
          </h1>
          <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed mt-2.5">
            Extend your AI models with community-created content. Discover customized LoRAs, system prompts, presets, pipeline workflows, and custom node configurations.
          </p>
        </div>

        {/* Dynamic artwork layout */}
        <div className="relative w-44 h-44 hidden md:flex items-center justify-center shrink-0">
          <div className="absolute w-36 h-36 rounded-2xl bg-gradient-to-tr from-fuchsia-600/20 to-violet-600/10 blur-xl animate-float"></div>
          <Wrench size={72} className="text-fuchsia-400/40 relative z-10" />
        </div>
      </section>

      {/* 2. SEARCH & FILTER HUB */}
      <section className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category chips */}
        <div className="flex overflow-x-auto gap-1.5 w-full md:w-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg font-display text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCat === cat
                  ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search workshop mods or models..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-lg glass-input pl-9 pr-4 py-2 font-sans text-xs text-white placeholder-slate-500"
          />
        </div>
      </section>

      {/* 3. TRENDING WORKSHOP ITEMS */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-black text-white mb-6 flex items-center gap-1.5">
          <Sparkles size={18} className="text-fuchsia-400" />
          Trending Workshop Items
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trendingItems.length === 0 ? (
            <div className="col-span-4 rounded-xl border border-white/5 py-12 text-center text-slate-500 text-xs">No items discovered.</div>
          ) : (
            trendingItems.map((w) => (
              <div key={w.id} className="group bg-[#0b0c10]/40 rounded-2xl p-4 border border-white/5 hover:border-fuchsia-500/20 transition-all flex flex-col justify-between steam-card">
                <div>
                  {/* card artwork */}
                  <div className={`w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${w.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase backdrop-blur-sm">
                      {w.category}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-sm text-white mb-0.5 group-hover:text-fuchsia-400 transition-all truncate">
                    {w.title}
                  </h3>
                  <div
                    onClick={() => handleModelClick(w.modelId)}
                    className="font-sans text-[10px] text-slate-500 hover:text-cyan-400 cursor-pointer mb-2 inline-block transition-colors"
                  >
                    For {w.modelName}
                  </div>
                  <p className="font-sans text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {w.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-xs text-yellow-400 font-bold shrink-0">
                    <Star size={10} fill="currentColor" />
                    {w.rating}
                  </div>
                  <button
                    onClick={() => toggleSubscribeWorkshop(w.id)}
                    className={`px-3 py-1.5 rounded-lg font-display text-[10px] font-bold cursor-pointer transition-all border ${
                      w.subscribed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    {w.subscribed ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. MOST SUBSCRIBED */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-black text-white mb-6">
          Most Subscribed
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mostSubscribed.length === 0 ? (
            <div className="col-span-4 rounded-xl border border-white/5 py-12 text-center text-slate-500 text-xs">No items discovered.</div>
          ) : (
            mostSubscribed.map((w) => (
              <div key={w.id} className="group bg-[#0b0c10]/40 rounded-2xl p-4 border border-white/5 hover:border-fuchsia-500/20 transition-all flex flex-col justify-between steam-card">
                <div>
                  <div className={`w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${w.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase backdrop-blur-sm">
                      {w.category}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-sm text-white mb-0.5 group-hover:text-fuchsia-400 transition-all truncate">
                    {w.title}
                  </h3>
                  <div
                    onClick={() => handleModelClick(w.modelId)}
                    className="font-sans text-[10px] text-slate-500 hover:text-cyan-400 cursor-pointer mb-2 inline-block transition-colors"
                  >
                    For {w.modelName}
                  </div>
                  <p className="font-sans text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {w.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between">
                  <span className="font-sans text-[10px] text-slate-500 font-semibold">
                    {(w.subscribers / 1000).toFixed(0)}K subs
                  </span>
                  <button
                    onClick={() => toggleSubscribeWorkshop(w.id)}
                    className={`px-3 py-1.5 rounded-lg font-display text-[10px] font-bold cursor-pointer transition-all border ${
                      w.subscribed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    {w.subscribed ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. NEW & POPULAR */}
      <section>
        <h2 className="font-display text-lg font-black text-white mb-6">
          New & Popular
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {newAndPopular.length === 0 ? (
            <div className="col-span-4 rounded-xl border border-white/5 py-12 text-center text-slate-500 text-xs">No items discovered.</div>
          ) : (
            newAndPopular.map((w) => (
              <div key={w.id} className="group bg-[#0b0c10]/40 rounded-2xl p-4 border border-white/5 hover:border-fuchsia-500/20 transition-all flex flex-col justify-between steam-card">
                <div>
                  <div className={`w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${w.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase backdrop-blur-sm">
                      {w.category}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-sm text-white mb-0.5 group-hover:text-fuchsia-400 transition-all truncate">
                    {w.title}
                  </h3>
                  <div
                    onClick={() => handleModelClick(w.modelId)}
                    className="font-sans text-[10px] text-slate-500 hover:text-cyan-400 cursor-pointer mb-2 inline-block transition-colors"
                  >
                    For {w.modelName}
                  </div>
                  <p className="font-sans text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {w.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-xs text-yellow-400 font-bold shrink-0">
                    <Star size={10} fill="currentColor" />
                    {w.rating}
                  </div>
                  <button
                    onClick={() => toggleSubscribeWorkshop(w.id)}
                    className={`px-3 py-1.5 rounded-lg font-display text-[10px] font-bold cursor-pointer transition-all border ${
                      w.subscribed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    {w.subscribed ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
