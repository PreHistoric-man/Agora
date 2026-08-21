import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Model } from '../data/mockData';
import { ModelLogo } from './ModelLogo';
import { CommunityReviews } from './CommunityReviews';
import {
  Sparkles,
  Zap,
  Brain,
  Layers,
  Check,
  ShoppingCart,
  Scale,
  ArrowLeft,
  Copy,
  Coins,
  Cpu,
  Globe,
  Lock,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Heart,
  MessageSquare,
  BarChart3,
  Code2,
  Star,
  ThumbsUp,
  Key
} from 'lucide-react';

export const ModelDetail: React.FC = () => {
  const {
    selectedModelId,
    models,
    setView,
    setSelectedModelId,
    addToCart,
    isInCart,
    toggleCompare,
    isInCompare,
    toggleWishlist,
    addToast,
    isModelInLibrary
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reviews' | 'specs' | 'code' | 'all'>('reviews');
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'node'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  const model = models.find((m) => m.id === selectedModelId) || models[0];
  const inCart = isInCart(model.id);
  const inCompare = isInCompare(model.id);
  const inLibrary = isModelInLibrary(model.id);
  const isFreeModel = model.inputPricePerMillion === 0 && model.outputPricePerMillion === 0;

  const handleCartAction = () => {
    if (inCart) {
      setView('cart');
    } else {
      addToCart(model.id);
      addToast(
        isFreeModel
          ? `Added ${model.name} ($0.00 free license) to cart. Proceed to checkout to add to your Library!`
          : `Added ${model.name} to cart. Proceed to checkout to add to your Library!`,
        'success'
      );
    }
  };

  const recPercentage = Math.min(99, Math.max(70, Math.round(model.rating * 19.5)));

  const alternativeModels = model.alternatives
    ?.map((altId) => models.find((m) => m.id === altId))
    .filter(Boolean) as Model[] || [];

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    addToast('Code snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getActiveSnippet = () => {
    if (activeCodeTab === 'python') return model.samplePython;
    if (activeCodeTab === 'node') return model.sampleNode;
    return model.sampleCurl;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left">
      {/* Back Button & Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setView('discover')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to API Marketplace
        </button>

        <div className="flex items-center gap-2">
          {/* Library / Cart Shortcut */}
          {inLibrary ? (
            <button
              onClick={() => setView('library')}
              className="px-3 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 text-xs font-display font-bold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-cyan-500/30"
            >
              <CheckCircle2 size={13} className="text-cyan-400" />
              In Library
            </button>
          ) : (
            <button
              onClick={handleCartAction}
              className={`px-3 py-2 rounded-xl border text-xs font-display font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                inCart
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/30'
              }`}
            >
              {inCart ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={13} className="text-cyan-400" />
                  {isFreeModel ? 'Claim Free License' : 'Add to Cart'}
                </>
              )}
            </button>
          )}

          <button
            onClick={() => toggleWishlist(model.id)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              model.wishlisted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={14} className={model.wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
            {model.wishlisted ? 'Saved' : 'Save API'}
          </button>

          <button
            onClick={() => toggleCompare(model.id)}
            className={`px-3 py-2 rounded-xl border text-xs font-display font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              inCompare
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Scale size={14} className={inCompare ? 'text-indigo-400' : ''} />
            {inCompare ? 'Comparing' : 'Add to Compare'}
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-black to-slate-900 border border-white/10 p-6 md:p-10 shadow-2xl mb-8">
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br ${model.artwork} rounded-full blur-3xl opacity-20 pointer-events-none`}
        ></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner shrink-0">
              <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={32} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-display text-xs font-bold text-slate-300 flex items-center gap-1">
                  {model.creator || model.provider}
                  {model.verified && (
                    <span title="Verified Creator & Model">
                      <ShieldCheck size={12} className="text-cyan-400 shrink-0" />
                    </span>
                  )}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-sans text-xs text-cyan-400 font-semibold">
                  {model.category} Model API {model.version ? `• ${model.version}` : ''}
                </span>
                <span className="text-slate-600">•</span>
                <span
                  className={`rounded-md px-2 py-0.5 font-display text-[10px] font-bold border flex items-center gap-1 ${
                    model.isOpenSource
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {model.isOpenSource ? <Globe size={10} /> : <Lock size={10} />}
                  {model.isOpenSource ? 'Open Weights' : 'Proprietary Commercial'}
                </span>
                {model.deployable && (
                  <span className="rounded-md px-2 py-0.5 font-display text-[10px] font-bold border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    Deployable
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight text-white mb-2">
                {model.name}
              </h1>

              <p className="font-sans text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed mb-3">
                {model.longDescription}
              </p>

              {/* Steam Community Rating Header Snapshot */}
              <div
                onClick={() => setActiveTab('reviews')}
                className="inline-flex flex-wrap items-center gap-3 bg-black/60 hover:bg-black/80 px-3.5 py-2 rounded-xl border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                  <Star size={13} className="fill-amber-400" />
                  <span>{model.rating.toFixed(1)}</span>
                </div>

                <span className="text-slate-600">•</span>

                <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
                  <ThumbsUp size={12} className="fill-cyan-400/20" />
                  <span>{recPercentage}% Recommended</span>
                </div>

                <span className="text-slate-600">•</span>

                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                  Very Positive
                </span>

                <span className="text-[11px] text-slate-400 font-mono group-hover:text-cyan-300 transition-colors">
                  ({model.reviewCount > 1000 ? `${(model.reviewCount / 1000).toFixed(1)}K` : model.reviewCount} Reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Box & Add to Cart Callout */}
          <div className="flex flex-col gap-3 rounded-2xl bg-black/60 border border-white/10 p-5 min-w-[280px] shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] text-slate-400 flex items-center gap-1">
                <Coins size={12} className="text-cyan-400" /> Usage Pricing
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Pay-as-you-go
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-white">
                ${model.inputPricePerMillion.toFixed(2)}
              </span>
              <span className="font-sans text-xs text-slate-400">/ 1M in</span>
              <span className="text-slate-600">•</span>
              <span className="font-display text-2xl font-black text-cyan-300">
                ${model.outputPricePerMillion.toFixed(2)}
              </span>
              <span className="font-sans text-xs text-slate-400">/ 1M out</span>
            </div>

            {model.cachedInputPricePerMillion && (
              <span className="text-[10px] text-emerald-300 font-sans">
                ⚡ Cached prompt read: ${model.cachedInputPricePerMillion.toFixed(2)} / 1M tokens
              </span>
            )}

            {/* Actions: In Library vs Checkout to Add to Library */}
            {inLibrary ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setView('library')}
                  className="w-full py-3.5 px-4 rounded-xl font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/10"
                >
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  ✓ In Your Library (View)
                </button>
                <button
                  type="button"
                  onClick={() => setView('my-apis')}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <Key size={13} className="text-emerald-400" /> Manage API Keys & SLA
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCartAction}
                  className={`w-full py-3.5 px-4 rounded-xl font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inCart
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      In Cart (Proceed to Checkout)
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      {isFreeModel ? 'Claim Free License (Add to Cart)' : 'Add API Access to Cart'}
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 text-center font-sans">
                  {isFreeModel
                    ? 'Free $0.00 license • Checkout to add this model to your Library'
                    : 'Instant key provisioning • Checkout to add this model to your Library'}
                </span>
              </div>
            )}

            <button
              onClick={() => setView('try')}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={13} className="text-amber-400" /> Test in Interactive Playground
            </button>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS (Reviews in front by default!) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <MessageSquare size={14} /> Community Reviews & Ratings (Front)
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <BarChart3 size={14} /> Benchmarks & Capabilities
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'code'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <Code2 size={14} /> API Code & Integration
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <Layers size={14} /> All Model Details
        </button>
      </div>

      {/* SECTION: COMMUNITY REVIEWS IN THE FRONT */}
      {(activeTab === 'reviews' || activeTab === 'all') && (
        <div className="mb-10">
          <CommunityReviews model={model} />
        </div>
      )}

      {/* SECTION: BENCHMARKS & CAPABILITIES */}
      {(activeTab === 'specs' || activeTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Left 8 Cols: Overview, Capabilities, Performance */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* SECTION 1: OVERVIEW & BEST FOR */}
            <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col gap-4">
              <h2 className="font-display text-base font-black text-white flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" /> Model Overview & Key Highlights
              </h2>

              <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed font-sans">
                <strong className="text-cyan-300 font-semibold block mb-1">What this model is best at:</strong>
                {model.bestFor}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Overall Benchmark</span>
                  <span className="font-display text-base font-black text-cyan-300">{model.overallScore} / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Context Window</span>
                  <span className="font-display text-base font-black text-white">{model.contextWindow}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Inference Speed</span>
                  <span className="font-display text-base font-black text-amber-300">{model.speedTokensPerSec} tok/s</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Time to First Token</span>
                  <span className="font-display text-base font-black text-slate-200">~{model.latencyMs} ms</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: CAPABILITIES */}
            <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col gap-4">
              <h2 className="font-display text-base font-black text-white flex items-center gap-2">
                <Layers size={16} className="text-cyan-400" /> Supported Model Capabilities
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {model.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: PERFORMANCE BENCHMARKS */}
            <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col gap-4">
              <h2 className="font-display text-base font-black text-white flex items-center gap-2">
                <Brain size={16} className="text-indigo-400" /> Performance & Benchmark Scores
              </h2>

              <div className="flex flex-col gap-4">
                {model.benchmarks.map((bm) => (
                  <div key={bm.name} className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>{bm.name}</span>
                      <span className="font-mono font-bold text-cyan-300">{bm.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, bm.score)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: License, Hardware, Alternatives & Pricing */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* SECTION 5: PRICING BREAKDOWN */}
            <div className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col gap-3.5">
              <h3 className="font-display text-sm font-black text-white flex items-center gap-2">
                <Coins size={14} className="text-cyan-400" /> API Token Pricing Details
              </h3>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">Prompt Input</span>
                  <span className="font-mono font-bold text-white">${model.inputPricePerMillion.toFixed(2)} / 1M</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">Output Completion</span>
                  <span className="font-mono font-bold text-cyan-300">${model.outputPricePerMillion.toFixed(2)} / 1M</span>
                </div>
                {model.cachedInputPricePerMillion && (
                  <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-400">Cached Prompt Read</span>
                    <span className="font-mono font-bold text-emerald-400">${model.cachedInputPricePerMillion.toFixed(2)} / 1M</span>
                  </div>
                )}
                {model.batchDiscountPercent && (
                  <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-400">Batch API Discount</span>
                    <span className="font-mono font-bold text-amber-300">{model.batchDiscountPercent}% Off</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 6: LICENSE & GOVERNANCE */}
            <div className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col gap-3">
              <h3 className="font-display text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" /> Licensing & Model Details
              </h3>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">Creator / Provider</span>
                  <span className="font-semibold text-slate-200">{model.creator || model.provider}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">Parameters / Size</span>
                  <span className="font-mono font-bold text-cyan-300">{model.model_size || model.parameters}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">Inference Runtime</span>
                  <span className="font-semibold text-slate-200">{model.runtime}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">Version Release</span>
                  <span className="font-mono text-slate-300">{model.version}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-slate-400">License</span>
                  <span className="font-semibold text-emerald-400">{model.license}</span>
                </div>
              </div>
            </div>

            {/* SECTION 7: HARDWARE REQUIREMENTS (IF SELF-HOSTING) */}
            <div className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col gap-3">
              <h3 className="font-display text-sm font-black text-white flex items-center gap-2">
                <Cpu size={14} className="text-indigo-400" /> Self-Hosting Hardware Specs
              </h3>

              {model.hardwareRequirements ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">GPU</span>
                    <span className="font-semibold text-slate-200 truncate block">{model.hardwareRequirements.gpu}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">VRAM</span>
                    <span className="font-semibold text-slate-200">{model.hardwareRequirements.vram}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">System RAM</span>
                    <span className="font-semibold text-slate-200">{model.hardwareRequirements.ram}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Storage</span>
                    <span className="font-semibold text-slate-200">{model.hardwareRequirements.storage}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  This foundation model is served exclusively through high-throughput cloud API gateways.
                </p>
              )}
            </div>

            {/* SECTION 8: SIMILAR ALTERNATIVE MODELS */}
            {alternativeModels.length > 0 && (
              <div className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col gap-3">
                <h3 className="font-display text-sm font-black text-white flex items-center gap-2">
                  <Scale size={14} className="text-cyan-400" /> Similar Alternative Models
                </h3>

                <div className="flex flex-col gap-2">
                  {alternativeModels.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        setSelectedModelId(alt.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{alt.providerLogo}</span>
                        <div>
                          <span className="font-display text-xs font-bold text-white group-hover:text-cyan-300 block">
                            {alt.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {alt.provider} • Score: {alt.overallScore}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-cyan-400 font-mono">
                        ${alt.inputPricePerMillion}/1M
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: API ACCESS & CODE EXAMPLES */}
      {(activeTab === 'code' || activeTab === 'all') && (
        <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col gap-4 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-black text-white flex items-center gap-2">
              <Terminal size={16} className="text-cyan-400" /> API Access & Integration Quickstart
            </h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OpenAI SDK Compatible
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-mono text-slate-300 truncate">
              <strong className="text-slate-500 font-normal">POST </strong>
              {model.endpoint}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              Model: "{model.modelEndpointId}"
            </span>
          </div>

          {/* Code Tabs */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between bg-black/60 px-4 py-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    activeCodeTab === 'python'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeTab('node')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    activeCodeTab === 'node'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Node.js / TS
                </button>
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    activeCodeTab === 'curl'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  cURL
                </button>
              </div>

              <button
                onClick={() => handleCopySnippet(getActiveSnippet())}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 bg-black/90 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-80">
              <pre>{getActiveSnippet()}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

