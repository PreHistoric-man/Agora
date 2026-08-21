import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Tag,
  Flame,
  Clock,
  Percent,
  Search,
  Download,
  ShieldCheck,
  Star,
  Play,
  Heart,
  SlidersHorizontal,
  PackageCheck,
  Zap,
  TrendingDown
} from 'lucide-react';
import { ModelTags } from './ModelTags';

export const Discounts: React.FC = () => {
  const {
    models,
    setView,
    setSelectedModelId,
    openGetModelModal,
    toggleWishlist,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMinDiscount, setSelectedMinDiscount] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<'discount-desc' | 'price-asc' | 'price-desc' | 'rating-desc'>('discount-desc');

  // Filter models that are discounted
  const discountedModels = useMemo(() => {
    return models.filter((m) => m.isDiscounted || (m.originalPrice && m.originalPrice > m.price));
  }, [models]);

  // Categories list with count of discounted models
  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: discountedModels.length };
    discountedModels.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return Object.keys(counts).map((cat) => ({
      name: cat,
      count: counts[cat]
    }));
  }, [discountedModels]);

  // Filtered and sorted discounted models
  const filteredModels = useMemo(() => {
    return discountedModels
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = m.name.toLowerCase().includes(q);
          const matchesDesc = m.description.toLowerCase().includes(q);
          const matchesTags = m.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesTags) return false;
        }

        // Category
        if (selectedCategory !== 'All' && m.category !== selectedCategory) {
          return false;
        }

        // Min Discount
        const discountPct = m.discountPercent || (m.originalPrice ? Math.round(((m.originalPrice - m.price) / m.originalPrice) * 100) : 0);
        if (discountPct < selectedMinDiscount) {
          return false;
        }

        // Max price
        if (m.price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const discA = a.discountPercent || (a.originalPrice ? Math.round(((a.originalPrice - a.price) / a.originalPrice) * 100) : 0);
        const discB = b.discountPercent || (b.originalPrice ? Math.round(((b.originalPrice - b.price) / b.originalPrice) * 100) : 0);

        if (sortBy === 'discount-desc') {
          return discB - discA;
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        if (sortBy === 'rating-desc') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [discountedModels, searchQuery, selectedCategory, selectedMinDiscount, maxPrice, sortBy]);

  // Top super featured deal (highest discount percentage)
  const heroDeal = useMemo(() => {
    return [...discountedModels].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))[0];
  }, [discountedModels]);

  const handleClaimBundle = (bundleName: string, price: number) => {
    addToast(`Bundle "${bundleName}" claimed at ₹${price}! Adding licenses to your Agora account...`, 'success');
  };

  return (
    <div className="w-full pb-24 text-slate-100">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-950/40 via-[#0b0c10] to-[#0b0c10] px-6 py-12 lg:py-16">
        {/* Glow ambient spots */}
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-sm backdrop-blur-sm mb-4">
                <Flame size={14} className="text-amber-400 animate-pulse" />
                <span>AGORA GEEK FEST DISCOUNTS</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span className="text-amber-200">UP TO 70% OFF</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Special Deals & Discounts for{' '}
                <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Geeks
                </span>
              </h1>

              <p className="mt-4 font-sans text-base sm:text-lg text-slate-300 leading-relaxed">
                Agora is the gathering place for AI geeks. Access state-of-the-art weights, reasoning engines, and creative transformers at exclusive community discounted rates.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 border border-white/10">
                  <Clock size={14} className="text-amber-400" />
                  <span>Limited Time Flash Sale: <strong className="text-amber-300">23h 48m left</strong></span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 border border-white/10">
                  <Percent size={14} className="text-emerald-400" />
                  <span>{discountedModels.length} Models on Sale</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 border border-white/10">
                  <ShieldCheck size={14} className="text-cyan-400" />
                  <span>100% Weight Verified</span>
                </div>
              </div>
            </div>

            {/* Featured Hero Deal Card */}
            {heroDeal && (
              <div className="lg:max-w-md w-full rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#16141a] via-[#12131a] to-[#0f121e] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-l from-amber-500 to-rose-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  {heroDeal.discountBadge || `SAVE ${heroDeal.discountPercent}%`}
                </div>

                <div className="flex items-start gap-4">
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${heroDeal.artwork} flex items-center justify-center text-2xl shadow-inner border border-white/10 shrink-0`}>
                    ⚡
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">Spotlight Mega Deal</span>
                    <h3 className="font-display text-xl font-black text-white">{heroDeal.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center text-amber-400 text-xs">
                        <Star size={12} fill="currentColor" />
                        <span className="ml-1 font-bold">{heroDeal.rating}</span>
                      </div>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-slate-400 text-xs">{heroDeal.category}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {heroDeal.description}
                </p>

                <div className="mt-4 flex items-baseline gap-3 rounded-xl bg-black/40 p-3 border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Deal Price</span>
                    <span className="font-display text-2xl font-black text-amber-300">₹{heroDeal.price}</span>
                  </div>
                  {heroDeal.originalPrice && (
                    <div className="text-slate-500 text-xs">
                      <span className="line-through block">₹{heroDeal.originalPrice}</span>
                      <span className="text-emerald-400 font-bold text-[10px]">
                        Save ₹{heroDeal.originalPrice - heroDeal.price} ({heroDeal.discountPercent}%)
                      </span>
                    </div>
                  )}
                  <div className="ml-auto text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Expires in</span>
                    <span className="text-xs font-mono font-bold text-rose-400">{heroDeal.discountEndsIn || '14h 20m'}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openGetModelModal(heroDeal.id)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 px-4 py-2.5 font-display text-xs font-bold text-white shadow-lg hover:from-amber-400 hover:to-pink-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={14} />
                    Get Deal Now
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModelId(heroDeal.id);
                      setView('model-detail');
                    }}
                    className="rounded-lg bg-white/10 px-3 py-2.5 font-display text-xs font-bold text-slate-200 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Special AI Geeks Curated Bundles */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PackageCheck size={20} className="text-amber-400" />
            <h2 className="font-display text-xl font-extrabold text-white">Agora Geek Bundles</h2>
          </div>
          <span className="text-xs text-amber-400 font-semibold">Extra 20% Stacked Discount</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bundle 1: Creator Suite */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-purple-950/40 via-[#13141f] to-[#16131c] p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-xl bg-purple-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
              65% OFF BUNDLE
            </div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Creative Trio</span>
                <h3 className="font-display text-lg font-bold text-white">Ultimate Media Gen Stack</h3>
                <p className="text-xs text-slate-400 mt-1">Includes PixelForge XL + VidCraft + SynthFlow Studio</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-black text-amber-300">₹899</span>
                  <span className="text-xs text-slate-500 line-through">₹2,697</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">You save ₹1,798</span>
              </div>
              <button
                onClick={() => handleClaimBundle('Ultimate Media Gen Stack', 899)}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Zap size={13} />
                Claim Bundle
              </button>
            </div>
          </div>

          {/* Bundle 2: Dev & Reasoning Stack */}
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-[#111624] to-[#12161f] p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-xl bg-cyan-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
              60% OFF BUNDLE
            </div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">Deep Intellect Trio</span>
                <h3 className="font-display text-lg font-bold text-white">Agora Deep Tech & Dev Stack</h3>
                <p className="text-xs text-slate-400 mt-1">Includes ReasonX 32B + DevOpsCopilot + TaskAgent v2</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-black text-cyan-300">₹999</span>
                  <span className="text-xs text-slate-500 line-through">₹2,497</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">You save ₹1,498</span>
              </div>
              <button
                onClick={() => handleClaimBundle('Agora Deep Tech & Dev Stack', 999)}
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Zap size={13} />
                Claim Bundle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discount Marketplace Controls & Grid */}
      <main className="mx-auto max-w-7xl px-6 pt-4">
        {/* Search, Filter & Sort Bar */}
        <div className="rounded-2xl border border-white/10 bg-[#12131a]/80 p-4 backdrop-blur-md shadow-lg flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8">
          {/* Search within discounts */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search discounted models by name, tag, or use case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Min Discount Dropdown */}
            <div className="flex items-center gap-1.5 bg-black/40 rounded-xl px-3 py-1.5 border border-white/10 text-xs">
              <TrendingDown size={14} className="text-amber-400" />
              <span className="text-slate-400">Discount:</span>
              <select
                value={selectedMinDiscount}
                onChange={(e) => setSelectedMinDiscount(Number(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-[#12131a] text-white">All Deals</option>
                <option value={40} className="bg-[#12131a] text-white">40%+ OFF</option>
                <option value={50} className="bg-[#12131a] text-white">50%+ OFF</option>
                <option value={60} className="bg-[#12131a] text-white">60%+ OFF</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-black/40 rounded-xl px-3 py-1.5 border border-white/10 text-xs">
              <SlidersHorizontal size={14} className="text-cyan-400" />
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="discount-desc" className="bg-[#12131a] text-white">Biggest Discount %</option>
                <option value="price-asc" className="bg-[#12131a] text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-[#12131a] text-white">Price: High to Low</option>
                <option value="rating-desc" className="bg-[#12131a] text-white">Top Rated</option>
              </select>
            </div>

            {/* Max Price quick filter */}
            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1.5 border border-white/10 text-xs">
              <span className="text-slate-400">Max:</span>
              <span className="font-bold text-amber-300">₹{maxPrice}</span>
              <input
                type="range"
                min={200}
                max={3000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-display text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                    : 'bg-[#15161f] text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.name}
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header with results count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
              <span>All Discounted AI Models</span>
              <span className="rounded-full bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 border border-amber-500/30">
                {filteredModels.length} models available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Direct weight downloads, sandbox access, and verified trust scores included</p>
          </div>
        </div>

        {/* Empty state if nothing matches filter */}
        {filteredModels.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#12131a] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
              <Tag size={32} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">No discounted models match your filters</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your category selection, reducing the minimum discount threshold, or clearing the search term.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedMinDiscount(0);
              }}
              className="mt-5 rounded-xl bg-amber-500 px-4 py-2 font-display text-xs font-bold text-black hover:bg-amber-400 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Grid of Discounted Models */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => {
              const discountPct =
                model.discountPercent ||
                (model.originalPrice ? Math.round(((model.originalPrice - model.price) / model.originalPrice) * 100) : 0);
              const savings = model.originalPrice ? model.originalPrice - model.price : 0;

              return (
                <div
                  key={model.id}
                  className="group relative flex flex-col rounded-2xl border border-white/10 bg-[#13141d] p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5"
                >
                  {/* Top Badge: Discount percentage */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-1 text-[11px] font-black text-white shadow-sm">
                        -{discountPct}% OFF
                      </span>
                      {model.discountBadge && (
                        <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          {model.discountBadge}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleWishlist(model.id)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        model.wishlisted
                          ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={model.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={14} fill={model.wishlisted ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Model Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${model.artwork} flex items-center justify-center font-display text-lg font-black text-white shadow-inner shrink-0 cursor-pointer`}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setView('model-detail');
                      }}
                    >
                      {model.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => {
                          setSelectedModelId(model.id);
                          setView('model-detail');
                        }}
                        className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate cursor-pointer"
                      >
                        {model.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center text-amber-400 text-xs">
                          <Star size={12} fill="currentColor" />
                          <span className="ml-1 font-bold">{model.rating}</span>
                        </div>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-slate-400 text-xs truncate">{model.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
                    {model.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3">
                    <ModelTags tags={model.tags.slice(0, 3)} limit={3} />
                  </div>

                  {/* Hardware & Deal Expiry */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500">Min GPU:</span> {model.systemRequirements.minimum.vram}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-rose-300 font-semibold">
                      <Clock size={11} />
                      {model.discountEndsIn || 'Ends soon'}
                    </span>
                  </div>

                  {/* Pricing Box & Action Buttons */}
                  <div className="mt-3 rounded-xl bg-black/40 p-3 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-black text-amber-300">₹{model.price}</span>
                        {model.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">₹{model.originalPrice}</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 block">
                          Save ₹{savings}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedModelId(model.id);
                          setView('try');
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-all border border-white/5 cursor-pointer"
                        title="Try in Sandbox"
                      >
                        <Play size={13} />
                      </button>
                      <button
                        onClick={() => openGetModelModal(model.id)}
                        className="rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 font-display text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-rose-400 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={13} />
                        Get Deal
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
