import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ModelCard } from './ModelCard';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Scale,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const Discover: React.FC = () => {
  const {
    models,
    modelsLoading,
    modelsError,
    refreshModels,
    categories,
    searchQuery,
    setSearchQuery,
    comparisonModelIds,
    setView,
    clearCompare
  } = useApp();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedLicenseType, setSelectedLicenseType] = useState<'All' | 'Open' | 'Proprietary'>('All');
  const [selectedPriceTier, setSelectedPriceTier] = useState<'All' | 'budget' | 'standard' | 'premium'>('All');
  const [selectedContextLength, setSelectedContextLength] = useState<'All' | '128k' | '200k' | '1m'>('All');
  const [sortBy, setSortBy] = useState<'overall' | 'cheapest' | 'fastest' | 'coding' | 'reasoning' | 'popular'>('overall');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Providers list derived dynamically
  const providers = useMemo(() => {
    const list = Array.from(new Set(models.map((m) => m.provider || m.creator).filter(Boolean)));
    return ['All', ...list];
  }, [models]);

  // Filtered & Sorted Models
  const filteredModels = useMemo(() => {
    let result = [...models];

    // 1. Search Query across name, description, category, tags, creator, provider, license, parameters
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          (m.creator && m.creator.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.parameters && m.parameters.toLowerCase().includes(q)) ||
          (m.license && m.license.toLowerCase().includes(q)) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Category
    if (selectedCategory !== 'All') {
      result = result.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Provider
    if (selectedProvider !== 'All') {
      result = result.filter((m) => (m.provider === selectedProvider || m.creator === selectedProvider));
    }

    // 4. Open-Source vs Proprietary
    if (selectedLicenseType === 'Open') {
      result = result.filter((m) => m.isOpenSource);
    } else if (selectedLicenseType === 'Proprietary') {
      result = result.filter((m) => !m.isOpenSource);
    }

    // 5. Price Tier
    if (selectedPriceTier === 'budget') {
      result = result.filter((m) => m.inputPricePerMillion <= 0.50);
    } else if (selectedPriceTier === 'standard') {
      result = result.filter((m) => m.inputPricePerMillion > 0.50 && m.inputPricePerMillion <= 2.50);
    } else if (selectedPriceTier === 'premium') {
      result = result.filter((m) => m.inputPricePerMillion > 2.50);
    }

    // 6. Context Window
    if (selectedContextLength === '128k') {
      result = result.filter((m) => m.contextWindowTokens >= 128000);
    } else if (selectedContextLength === '200k') {
      result = result.filter((m) => m.contextWindowTokens >= 200000);
    } else if (selectedContextLength === '1m') {
      result = result.filter((m) => m.contextWindowTokens >= 1000000);
    }

    // 7. Sorting
    result.sort((a, b) => {
      if (sortBy === 'cheapest') return a.inputPricePerMillion - b.inputPricePerMillion;
      if (sortBy === 'fastest') return b.speedTokensPerSec - a.speedTokensPerSec;
      if (sortBy === 'coding') return b.codingScore - a.codingScore;
      if (sortBy === 'reasoning') return b.reasoningScore - a.reasoningScore;
      if (sortBy === 'popular') return b.apiCallsCount - a.apiCallsCount;
      return b.overallScore - a.overallScore; // Default: Best Overall
    });

    return result;
  }, [
    models,
    searchQuery,
    selectedCategory,
    selectedProvider,
    selectedLicenseType,
    selectedPriceTier,
    selectedContextLength,
    sortBy
  ]);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedProvider('All');
    setSelectedLicenseType('All');
    setSelectedPriceTier('All');
    setSelectedContextLength('All');
    setSortBy('overall');
    setSearchQuery('');
  };

  const isFiltered =
    selectedCategory !== 'All' ||
    selectedProvider !== 'All' ||
    selectedLicenseType !== 'All' ||
    selectedPriceTier !== 'All' ||
    selectedContextLength !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left">
      {/* Top Marketplace Hero Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles size={18} />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
              AI Models & API Marketplace
            </h1>
          </div>
          <p className="font-sans text-xs text-slate-400 max-w-xl">
            Discover, compare benchmarks, and configure API access for leading reasoning, coding, and vision foundation models.
          </p>
        </div>

        {/* Quick Compare Indicator Button */}
        {comparisonModelIds.length > 0 && (
          <button
            onClick={() => setView('compare')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-display text-xs font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Scale size={15} className="text-indigo-400 animate-pulse" />
            Compare ({comparisonModelIds.length} Models)
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Search Bar & Primary Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by model name, provider (e.g. OpenAI, DeepSeek, Anthropic), or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl glass-input pl-10 pr-10 py-3 font-sans text-xs text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-sans text-slate-400 shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-48 rounded-2xl glass-input px-3 py-3 font-sans text-xs text-white"
            >
              <option value="overall">Best Overall Score</option>
              <option value="cheapest">Cheapest Token Price</option>
              <option value="fastest">Fastest (Tokens/Sec)</option>
              <option value="coding">Best for Coding</option>
              <option value="reasoning">Best for Reasoning</option>
              <option value="popular">Most Popular</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-3 rounded-2xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                showAdvancedFilters || isFiltered
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-display text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-5 rounded-2xl bg-black/50 border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs animate-slide-up">
            {/* Provider Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="rounded-xl glass-input p-2 font-sans text-xs text-white"
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* License Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Model Type / License</label>
              <select
                value={selectedLicenseType}
                onChange={(e) => setSelectedLicenseType(e.target.value as any)}
                className="rounded-xl glass-input p-2 font-sans text-xs text-white"
              >
                <option value="All">All Licenses</option>
                <option value="Open">Open Weights (Self-Hostable)</option>
                <option value="Proprietary">Proprietary API Only</option>
              </select>
            </div>

            {/* Price Tier */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Token Pricing Tier</label>
              <select
                value={selectedPriceTier}
                onChange={(e) => setSelectedPriceTier(e.target.value as any)}
                className="rounded-xl glass-input p-2 font-sans text-xs text-white"
              >
                <option value="All">All Prices</option>
                <option value="budget">Budget (&lt; $0.50 / 1M)</option>
                <option value="standard">Standard ($0.50 - $2.50 / 1M)</option>
                <option value="premium">Frontier Premium (&gt; $2.50 / 1M)</option>
              </select>
            </div>

            {/* Context Window */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Context Window</label>
              <select
                value={selectedContextLength}
                onChange={(e) => setSelectedContextLength(e.target.value as any)}
                className="rounded-xl glass-input p-2 font-sans text-xs text-white"
              >
                <option value="All">Any Context Length</option>
                <option value="128k">128K+ Tokens</option>
                <option value="200k">200K+ Tokens</option>
                <option value="1m">1M+ Tokens (Ultra Long)</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter State Bar */}
        {isFiltered && (
          <div className="flex items-center justify-between text-xs text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
            <span>
              Showing <strong className="text-white font-semibold">{filteredModels.length}</strong> of {models.length} AI model APIs
            </span>
            <button
              onClick={resetAllFilters}
              className="text-cyan-400 hover:underline text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Database Error Banner (if any) */}
        {modelsError && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-400 shrink-0" />
              <span>Could not sync live models: {modelsError}. Showing cached foundation models.</span>
            </div>
            <button
              onClick={() => refreshModels()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}
      </div>

      {/* Model Cards Grid */}
      {modelsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 animate-pulse flex flex-col justify-between h-80"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10"></div>
                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-5 w-16 bg-white/10 rounded"></div>
                </div>
                <div className="h-5 w-40 bg-white/10 rounded mb-2"></div>
                <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
                <div className="h-3 w-3/4 bg-white/10 rounded mb-4"></div>
                <div className="h-12 w-full bg-white/5 rounded-xl mb-4"></div>
              </div>
              <div className="h-10 w-full bg-white/10 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center flex flex-col items-center gap-4 border border-white/10">
          <Search size={44} className="text-slate-600" />
          <h2 className="font-display text-xl font-bold text-white">No AI Models Found</h2>
          <p className="font-sans text-xs text-slate-400 max-w-md leading-relaxed">
            No AI models matched your current filter criteria. Try clearing your search filters or resetting your parameters.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-display text-xs font-bold uppercase"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}

      {/* Floating Bottom Comparison Tray (When 1+ Models are in comparison) */}
      {comparisonModelIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl rounded-2xl glass-panel-heavy border border-cyan-500/40 p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
              <Scale size={18} />
            </div>
            <div>
              <span className="font-display text-xs font-black text-white block">
                {comparisonModelIds.length} Model{comparisonModelIds.length > 1 ? 's' : ''} in Comparison
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                Side-by-side benchmark & pricing evaluation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setView('compare')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Compare Now
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
