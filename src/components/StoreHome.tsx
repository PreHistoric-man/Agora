import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, Download, Heart, ArrowRight, Sparkles, Terminal, Flame, Tag, Zap, Clock } from 'lucide-react';
import { ModelTags } from './ModelTags';

export const StoreHome: React.FC = () => {
  const {
    models,
    creators,
    setView,
    setSelectedModelId,
    toggleWishlist,
    openGetModelModal,
    setSelectedCategory
  } = useApp();

  // Find NeuralVision 4 model
  const featuredModel = models.find((m) => m.id === 'neuralvision-4') || models[0];

  // Specific Trending Models requested by prompt
  const trendingIds = ['codeforge-7b', 'pixelforge-xl', 'audionova', 'reasonx-32b', 'vidcraft'];
  const trendingModels = models.filter((m) => trendingIds.includes(m.id));

  // Discounted models for Flash Deals section
  const discountedModels = models.filter((m) => m.isDiscounted || (m.originalPrice && m.originalPrice > m.price));

  // "Because you use CodeForge..." recommendations
  const recommendationIds = ['devopscopilot', 'codeforge-lite', 'scribeai', 'taskagent-v2'];
  const recommendedModels = models.filter((m) => recommendationIds.includes(m.id));

  // Categories list with emojis/icons
  const categoriesList = [
    { name: 'Reasoning', icon: '🧠', color: 'from-red-500/10 to-rose-500/5 hover:border-red-500/30' },
    { name: 'Coding', icon: '💻', color: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-500/30' },
    { name: 'Image', icon: '🎨', color: 'from-purple-500/10 to-fuchsia-500/5 hover:border-purple-500/30' },
    { name: 'Video', icon: '🎬', color: 'from-pink-500/10 to-rose-500/5 hover:border-pink-500/30' },
    { name: 'Audio', icon: '🎵', color: 'from-yellow-500/10 to-orange-500/5 hover:border-yellow-500/30' },
    { name: 'Vision', icon: '👁️', color: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30' },
    { name: 'Writing', icon: '✍️', color: 'from-teal-500/10 to-cyan-500/5 hover:border-teal-500/30' },
    { name: 'Agents', icon: '🤖', color: 'from-cyan-500/10 to-sky-500/5 hover:border-cyan-500/30' },
    { name: 'Speech', icon: '🔊', color: 'from-amber-500/10 to-yellow-500/5 hover:border-amber-500/30' },
    { name: 'Science', icon: '🧬', color: 'from-green-500/10 to-emerald-500/5 hover:border-green-500/30' }
  ];

  // New releases grid (last 4 models)
  const newReleases = models.slice(12, 17);

  const formatPrice = (price: number, pricingType: string) => {
    if (pricingType === 'free') return 'Free';
    if (pricingType === 'cloud-only') return 'Cloud API';
    if (pricingType === 'subscription') return 'Pro Sub';
    return `₹${price}`;
  };

  const handleCardClick = (id: string) => {
    setSelectedModelId(id);
    setView('model-detail');
  };

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    setView('discover');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in">
      {/* 0. BRAND GREETING & SLOGAN BANNER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-indigo-950/20 to-purple-950/30 p-4 px-6 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 font-display font-black text-white shadow-md">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-black text-white tracking-wide">AGORA</h2>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                Hub v2.5
              </span>
            </div>
            <p className="font-sans text-xs text-cyan-300/90 font-medium">
              Gathering Place for Ai Geeks — Discover weights, test in sandbox, run locally.
            </p>
          </div>
        </div>

        <button
          onClick={() => setView('discounts')}
          className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-pink-400 transition-all cursor-pointer"
        >
          <Zap size={14} className="animate-pulse" />
          <span>⚡ Agora Geek Discounts (Up to 70% Off)</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-[#0b0c10] shadow-2xl">
        {/* Background glow and graphic */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12] via-[#0d0e12]/90 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-35 md:opacity-85 z-0">
          <div className="h-full w-full bg-gradient-to-br from-emerald-600/20 via-teal-900/30 to-violet-950/20 flex items-center justify-center p-8 select-none">
            {/* Visual placeholder representing abstract AI visual */}
            <div className="relative w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-500/30 to-teal-500/10 blur-xl animate-float"></div>
            <div className="absolute w-60 h-60 rounded-full border border-emerald-400/20 animate-spin [animation-duration:10s]"></div>
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-teal-300/30 animate-spin [animation-duration:20s] reverse"></div>
            <div className="absolute font-display text-[150px] font-black opacity-10 select-none">VISION</div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-2xl px-6 py-12 md:p-16 flex flex-col justify-center min-h-[420px]">
          <span className="mb-2 self-start rounded bg-emerald-500/10 px-2.5 py-0.5 font-display text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase ring-1 ring-emerald-500/25">
            FEATURED MODEL
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            {featuredModel.name}
          </h1>
          <p className="font-sans text-sm md:text-base text-slate-300 leading-relaxed mb-6">
            {featuredModel.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {featuredModel.tags.map((tag) => (
              <span key={tag} className="rounded bg-white/5 border border-white/5 px-2 py-0.5 font-display text-[9px] font-bold text-slate-400 tracking-wide">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-8 border-y border-white/5 py-4">
            <div className="flex items-center gap-1.5">
              <Star size={16} fill="#fbbf24" className="text-yellow-400" />
              <span className="font-display text-sm font-bold text-slate-200">{featuredModel.rating}</span>
              <span className="font-sans text-xs text-slate-500">({(featuredModel.reviewCount / 1000).toFixed(1)}k reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-6">
              <Download size={16} className="text-cyan-400" />
              <span className="font-display text-sm font-bold text-slate-200">{(featuredModel.installCount / 1000).toFixed(0)}K</span>
              <span className="font-sans text-xs text-slate-500">installs</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedModelId(featuredModel.id);
                setView('try');
              }}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-6 py-3 font-display text-sm font-black text-slate-950 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              Try Now
            </button>
            <button
              onClick={() => openGetModelModal(featuredModel.id)}
              className="rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 px-6 py-3 font-display text-sm font-black text-white transition-all cursor-pointer"
            >
              Get Model
            </button>
            <button
              onClick={() => toggleWishlist(featuredModel.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                featuredModel.wishlisted
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={featuredModel.wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED AGORA FLASH DEALS & DISCOUNTS SECTION */}
      <section className="mb-12 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 via-[#11131a] to-[#0c0d12] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-wide mb-1.5">
              <Zap size={12} className="text-amber-400 animate-pulse" />
              <span>Agora AI Geeks Special Discounts</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Tag size={24} className="text-amber-400" />
              Flash Deals & Discounts
            </h2>
            <p className="font-sans text-xs text-slate-300 mt-1">
              Save up to 70% on premium reasoning, diffusion, video, and audio models
            </p>
          </div>

          <button
            onClick={() => setView('discounts')}
            className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/40 px-4 py-2 font-display text-xs font-bold text-amber-300 hover:bg-amber-500/25 hover:text-amber-200 transition-all group cursor-pointer"
          >
            <span>View All {discountedModels.length} Deals</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Discount Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {discountedModels.slice(0, 4).map((m) => {
            const creator = creators.find((c) => c.id === m.creatorId);
            const discountPct = m.discountPercent || (m.originalPrice ? Math.round(((m.originalPrice - m.price) / m.originalPrice) * 100) : 0);
            return (
              <div
                key={m.id}
                onClick={() => handleCardClick(m.id)}
                className="group flex flex-col rounded-2xl bg-[#161722]/90 p-4 border border-amber-500/20 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {/* Artwork with discount badge */}
                <div className={`w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${m.artwork} p-3 flex flex-col justify-between relative overflow-hidden mb-3 shadow-inner`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-amber-500 px-2 py-0.5 font-display text-[10px] font-black text-black uppercase shadow-md">
                      -{discountPct}% OFF
                    </span>
                    <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-300 backdrop-blur-sm flex items-center gap-1">
                      <Clock size={10} />
                      {m.discountEndsIn || 'Flash'}
                    </span>
                  </div>
                  <div className="font-display text-xl text-right opacity-20 font-black uppercase text-white tracking-wider">
                    {m.category}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                    {m.name}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 shrink-0">
                    <Star size={10} fill="currentColor" />
                    {m.rating}
                  </div>
                </div>
                <span className="font-sans text-[10px] text-slate-500 mb-2">by {creator?.name}</span>
                <p className="font-sans text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-grow">
                  {m.description}
                </p>

                {/* Price & Savings */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-black text-base text-amber-300">
                        ₹{m.price}
                      </span>
                      {m.originalPrice && (
                        <span className="font-sans text-xs text-slate-500 line-through">
                          ₹{m.originalPrice}
                        </span>
                      )}
                    </div>
                    {m.originalPrice && (
                      <span className="text-[9px] font-bold text-emerald-400 block">
                        Save ₹{m.originalPrice - m.price}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openGetModelModal(m.id);
                    }}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 px-3 py-1.5 font-display text-[11px] font-bold text-white shadow transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={11} />
                    Get Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TRENDING MODELS (CAROUSEL) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
              <Flame size={20} className="text-orange-500 animate-pulse" />
              Trending Models
            </h2>
            <p className="font-sans text-xs text-slate-400 mt-0.5">Most active downloads and usage spikes this week</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setView('discover');
            }}
            className="flex items-center gap-1.5 font-display text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all group cursor-pointer"
          >
            Browse All Storefront
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Cards Row (Carousel-style layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {trendingModels.map((m) => {
            const creator = creators.find((c) => c.id === m.creatorId);
            return (
              <div
                key={m.id}
                onClick={() => handleCardClick(m.id)}
                className="group flex flex-col rounded-2xl glass-panel p-3 border border-white/5 hover:border-cyan-500/20 cursor-pointer steam-card"
              >
                {/* Artwork Placeholder */}
                <div className={`w-full aspect-[4/3] rounded-xl bg-gradient-to-br ${m.artwork} p-4 flex flex-col justify-between relative overflow-hidden mb-3`}>
                  <div className="absolute -inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="rounded bg-black/40 px-2 py-0.5 font-display text-[9px] font-bold text-slate-200 self-start uppercase backdrop-blur-sm">
                    {m.category}
                  </span>
                  <div className="font-display text-2xl text-right opacity-15 font-black uppercase tracking-widest pointer-events-none">
                    {m.category.substring(0, 4)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-display font-black text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
                      {m.name}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0 text-[10px] font-bold text-yellow-400">
                      <Star size={10} fill="currentColor" />
                      {m.rating}
                    </div>
                  </div>
                  <span className="font-sans text-[10px] text-slate-500 mb-2">by {creator?.name}</span>
                  <ModelTags tags={m.tags} limit={2} className="mb-2" />
                  <p className="font-sans text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-grow">
                    {m.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Download size={10} />
                      {(m.installCount / 1000).toFixed(0)}k
                    </div>
                    <div>
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
                          {formatPrice(m.price, m.pricingType)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PERSONALIZED RECOMMENDATION SECTION */}
      <section className="mb-12 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-blue-500/10 rounded-3xl p-6 md:p-8 relative">
        <div className="absolute right-8 top-8 opacity-10 select-none">
          <Terminal size={120} className="text-blue-400" />
        </div>
        
        <div className="mb-6 relative z-10">
          <span className="font-display text-[9px] font-black tracking-wider text-blue-400 uppercase rounded bg-blue-500/10 px-2 py-0.5 border border-blue-500/20">
            DEDICATED RADAR
          </span>
          <h2 className="font-display text-xl md:text-2xl font-black text-white mt-2">
            “Because you use <span className="text-blue-400">CodeForge 7B</span>…”
          </h2>
          <p className="font-sans text-xs text-slate-400 mt-1">Recommended dev engines, coding tools, and sandbox workflows</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {recommendedModels.map((m) => {
            const creator = creators.find((c) => c.id === m.creatorId);
            return (
              <div
                key={m.id}
                onClick={() => handleCardClick(m.id)}
                className="group bg-[#0b0c10]/80 rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 cursor-pointer steam-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 font-display text-[9px] font-bold text-blue-300 uppercase">
                    {m.category}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400">
                    <Star size={10} fill="currentColor" />
                    {m.rating}
                  </div>
                </div>

                <h3 className="font-display font-black text-sm text-white group-hover:text-blue-400 transition-colors mb-0.5">
                  {m.name}
                </h3>
                <ModelTags tags={m.tags} limit={2} className="mb-2" />
                <span className="font-sans text-[10px] text-slate-500 mb-3 block">by {creator?.name}</span>
                
                <p className="font-sans text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {m.description}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                  <span className="font-sans text-[9px] text-slate-500">
                    {m.pricingType === 'free' ? 'Runs Locally' : 'Cloud Inference'}
                  </span>
                  <span className="font-display font-extrabold text-xs text-blue-400">
                    {formatPrice(m.price, m.pricingType)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CATEGORIES SECTION */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-black text-white mb-6">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {categoriesList.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-gradient-to-b ${cat.color} cursor-pointer transition-all hover:-translate-y-1`}
            >
              <span className="text-2xl mb-2">{cat.icon}</span>
              <span className="font-display text-xs font-bold text-slate-300 text-center">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. NEW & NOTEWORTHY GRID */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
              <Sparkles size={20} className="text-cyan-400" />
              New & Noteworthy
            </h2>
            <p className="font-sans text-xs text-slate-400 mt-0.5">Recently released models and community fine-tunes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {newReleases.map((m) => {
            const creator = creators.find((c) => c.id === m.creatorId);
            return (
              <div
                key={m.id}
                onClick={() => handleCardClick(m.id)}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl glass-panel border border-white/5 hover:border-cyan-500/20 cursor-pointer steam-card"
              >
                {/* Left: Thumbnail artwork */}
                <div className={`w-full sm:w-36 h-28 rounded-xl bg-gradient-to-br ${m.artwork} p-3 flex flex-col justify-between shrink-0`}>
                  <span className="rounded bg-black/40 px-1.5 py-0.5 font-display text-[8px] font-extrabold text-slate-200 uppercase self-start">
                    NEW
                  </span>
                  <span className="font-sans text-[9px] text-white/50">{m.releaseDate}</span>
                </div>

                {/* Right: Info */}
                <div className="flex flex-col flex-grow justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-display font-black text-base text-white group-hover:text-cyan-400 transition-colors">
                          {m.name}
                        </h3>
                        <ModelTags tags={m.tags} limit={2} className="mt-1 mb-1" />
                        <span className="font-sans text-[10px] text-slate-500">by {creator?.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-yellow-400">
                        <Star size={12} fill="currentColor" />
                        {m.rating}
                      </div>
                    </div>
                    <p className="font-sans text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {m.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[9px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-white/5">
                        {m.category}
                      </span>
                      <span className="font-sans text-[10px] text-slate-500">
                        {(m.installCount / 1000).toFixed(0)}K downloads
                      </span>
                    </div>
                    <span className="font-display font-extrabold text-sm text-white">
                      {formatPrice(m.price, m.pricingType)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
