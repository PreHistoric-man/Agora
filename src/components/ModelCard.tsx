import React from 'react';
import { useApp } from '../context/AppContext';
import type { Model } from '../data/mockData';
import { ModelLogo } from './ModelLogo';
import {
  Sparkles,
  Zap,
  Code,
  Brain,
  Layers,
  Check,
  ShoppingCart,
  Scale,
  ArrowRight,
  Lock,
  Globe,
  Coins,
  Star,
  ThumbsUp,
  ShieldCheck,
  Cpu,
  Box
} from 'lucide-react';

interface ModelCardProps {
  model: Model;
  onSelect?: () => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect }) => {
  const {
    setSelectedModelId,
    setView,
    addToCart,
    isInCart,
    toggleCompare,
    isInCompare,
    isModelInLibrary
  } = useApp();

  const inCart = isInCart(model.id);
  const inCompare = isInCompare(model.id);
  const inLibrary = isModelInLibrary(model.id);

  const isFreeModel = model.inputPricePerMillion === 0 && model.outputPricePerMillion === 0;

  const handleCardClick = () => {
    setSelectedModelId(model.id);
    if (onSelect) {
      onSelect();
    } else {
      setView('model-detail');
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inLibrary) {
      setView('library');
    } else if (inCart) {
      setView('cart');
    } else {
      addToCart(model.id);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(model.id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 90) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 80) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    return 'text-slate-400 border-slate-700 bg-slate-800/40';
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-cyan-500/40 p-5 shadow-xl transition-all duration-300 hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
    >
      {/* Top Background Gradient Glow */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br ${model.artwork} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}
      ></div>

      <div>
        {/* Top Header: Provider, Creator, Verified & Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-sm border border-white/10 shadow-inner">
              <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={15} />
            </span>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-display text-xs font-bold text-slate-300 tracking-wide block">
                  {model.creator || model.provider}
                </span>
                {model.verified && (
                  <span title="Verified Model">
                    <ShieldCheck size={12} className="text-cyan-400 shrink-0" />
                  </span>
                )}
              </div>
              <span className="font-sans text-[10px] text-slate-400 block -mt-0.5">
                {model.category} API {model.version ? `• ${model.version}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* In Library Badge */}
            {inLibrary && (
              <span className="rounded-md px-2 py-0.5 font-display text-[10px] font-bold border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center gap-1 shadow-sm">
                <Box size={10} className="text-cyan-400" /> In Library
              </span>
            )}

            {/* Open Source vs Proprietary Badge */}
            <span
              className={`rounded-md px-2 py-0.5 font-display text-[10px] font-bold border flex items-center gap-1 ${
                model.isOpenSource
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {model.isOpenSource ? (
                <>
                  <Globe size={10} /> Open Weights
                </>
              ) : (
                <>
                  <Lock size={10} /> Proprietary
                </>
              )}
            </span>

            {/* Overall Score */}
            <span
              className={`rounded-md px-2 py-0.5 font-display text-[10px] font-black border flex items-center gap-1 ${getScoreColor(
                model.overallScore
              )}`}
            >
              <Sparkles size={11} />
              {model.overallScore}
            </span>
          </div>
        </div>

        {/* Model Title & Description */}
        <h3 className="font-display text-base font-black text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between mb-1.5">
          <span>{model.name}</span>
          <ArrowRight
            size={14}
            className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100"
          />
        </h3>

        <p className="font-sans text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {model.description}
        </p>

        {/* Compact Rating & Recommendation Summary */}
        <div className="flex items-center justify-between text-[11px] bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 mb-3.5 font-sans">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center text-amber-400 font-bold">
              <Star size={12} className="fill-amber-400 mr-0.5" />
              {model.rating.toFixed(1)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 font-semibold flex items-center gap-1">
              <ThumbsUp size={11} className="fill-cyan-400/20" />
              {Math.min(99, Math.max(70, Math.round(model.rating * 19.5)))}% Recommended
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {model.reviewCount > 1000 ? `${(model.reviewCount / 1000).toFixed(1)}K` : model.reviewCount} Reviews
          </span>
        </div>

        {/* Core Benchmark & Hardware Metric Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-black/40 p-2.5 rounded-xl border border-white/5">
          {/* Coding / Reasoning */}
          <div className="flex flex-col">
            <span className="font-sans text-[10px] text-slate-400 flex items-center gap-1">
              <Code size={11} className="text-cyan-400" /> Coding
            </span>
            <span className="font-display text-xs font-bold text-slate-200">
              {model.codingScore > 0 ? `${model.codingScore}` : 'N/A'}
            </span>
          </div>

          {/* Reasoning */}
          <div className="flex flex-col border-x border-white/5 px-2">
            <span className="font-sans text-[10px] text-slate-400 flex items-center gap-1">
              <Brain size={11} className="text-indigo-400" /> Reasoning
            </span>
            <span className="font-display text-xs font-bold text-slate-200">
              {model.reasoningScore > 0 ? `${model.reasoningScore}` : 'N/A'}
            </span>
          </div>

          {/* Speed / Latency */}
          <div className="flex flex-col pl-1">
            <span className="font-sans text-[10px] text-slate-400 flex items-center gap-1">
              <Zap size={11} className="text-amber-400" /> Speed
            </span>
            <span className="font-display text-xs font-bold text-amber-300">
              {model.speedTokensPerSec} <span className="text-[9px] font-normal text-slate-400">tok/s</span>
            </span>
          </div>
        </div>

        {/* Specs Pill List (Context, License, Parameters/Model Size, Deployable) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[10px]">
          <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/5 flex items-center gap-1">
            <Layers size={10} className="text-cyan-400" /> {model.contextWindow}
          </span>
          {(model.model_size || model.parameters) && (
            <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/5 flex items-center gap-1 truncate max-w-[120px]">
              <Cpu size={10} className="text-indigo-400" /> {model.model_size || model.parameters}
            </span>
          )}
          <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/5 truncate max-w-[110px]">
            {model.license}
          </span>
          {model.deployable && (
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-300 border border-emerald-500/20">
              Deployable
            </span>
          )}
        </div>
      </div>

      {/* Footer: API Pricing & Action Buttons */}
      <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
        {/* Token Pricing Breakdown */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="font-sans text-[10px] text-slate-400 flex items-center gap-1">
              <Coins size={11} className="text-cyan-400" /> API Token Pricing (per 1M)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-black text-white">
                ${model.inputPricePerMillion.toFixed(2)} <span className="text-[9px] font-normal text-slate-400">in</span>
              </span>
              <span className="text-slate-600">/</span>
              <span className="font-display text-xs font-black text-cyan-300">
                ${model.outputPricePerMillion.toFixed(2)} <span className="text-[9px] font-normal text-slate-400">out</span>
              </span>
            </div>
          </div>

          <span className="font-sans text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            Pay-as-you-go
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Main Action Button */}
          <button
            type="button"
            onClick={handleActionClick}
            className={`w-full py-2.5 px-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              inLibrary
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                : inCart
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20'
            }`}
          >
            {inLibrary ? (
              <>
                <Box size={13} className="text-cyan-400" />
                In Library
              </>
            ) : inCart ? (
              <>
                <Check size={14} className="text-emerald-400" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart size={13} />
                {isFreeModel ? 'Claim Free' : 'Add to Cart'}
              </>
            )}
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={handleToggleCompare}
            className={`w-full py-2.5 px-3 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              inCompare
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            <Scale size={13} className={inCompare ? 'text-indigo-400' : 'text-slate-400'} />
            {inCompare ? 'Comparing' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};
