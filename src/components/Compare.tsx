import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Model } from '../data/mockData';
import { ModelLogo } from './ModelLogo';
import {
  Scale,
  Plus,
  Trash2,
  ShoppingCart,
  Check,
  Zap,
  Code,
  Brain,
  Layers,
  Coins,
  Cpu,
  Globe,
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Compare: React.FC = () => {
  const {
    models,
    comparisonModelIds,
    addToCompare,
    removeFromCompare,
    clearCompare,
    addToCart,
    isInCart,
    setSelectedModelId,
    setView
  } = useApp();

  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Selected models for comparison
  const comparedModels: Model[] = comparisonModelIds
    .map((id) => models.find((m) => m.id === id))
    .filter(Boolean) as Model[];

  // Models available to add
  const availableToAdd = models.filter((m) => !comparisonModelIds.includes(m.id));
  const filteredPickerModels = availableToAdd.filter(
    (m) =>
      m.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const getBestScoreKey = (key: 'overallScore' | 'codingScore' | 'reasoningScore' | 'mathScore' | 'visionScore' | 'speedTokensPerSec') => {
    if (comparedModels.length === 0) return null;
    let max = -1;
    let bestId = '';
    comparedModels.forEach((m) => {
      const val = m[key] || 0;
      if (val > max) {
        max = val;
        bestId = m.id;
      }
    });
    return bestId;
  };

  const getCheapestInputId = () => {
    if (comparedModels.length === 0) return null;
    let min = 99999;
    let bestId = '';
    comparedModels.forEach((m) => {
      if (m.inputPricePerMillion < min) {
        min = m.inputPricePerMillion;
        bestId = m.id;
      }
    });
    return bestId;
  };

  const bestOverallId = getBestScoreKey('overallScore');
  const bestCodingId = getBestScoreKey('codingScore');
  const bestReasoningId = getBestScoreKey('reasoningScore');
  const bestSpeedId = getBestScoreKey('speedTokensPerSec');
  const cheapestInputId = getCheapestInputId();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Scale size={18} />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
              AI Model API Comparison
            </h1>
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 font-display text-xs font-bold text-indigo-300 border border-indigo-500/30">
              {comparedModels.length} of 4 Selected
            </span>
          </div>
          <p className="font-sans text-xs text-slate-400">
            Compare benchmark scores, token pricing, context lengths, and latency to choose the perfect AI model API for your project.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparedModels.length < 4 && (
            <button
              onClick={() => setShowModelPicker(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Plus size={14} /> Add Model to Compare
            </button>
          )}

          {comparedModels.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/10 text-xs font-sans transition-colors cursor-pointer"
            >
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      {/* Model Picker Modal */}
      {showModelPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-panel-heavy border border-cyan-500/30 p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Scale size={16} className="text-cyan-400" /> Select AI Model to Compare
              </h3>
              <button
                onClick={() => setShowModelPicker(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by model name, provider, or category..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="w-full rounded-xl glass-input px-3.5 py-2.5 font-sans text-xs text-white"
              autoFocus
            />

            <div className="flex flex-col gap-2 overflow-y-auto max-h-96 pr-1">
              {filteredPickerModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => {
                    addToCompare(model.id);
                    setShowModelPicker(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                      <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={15} />
                    </span>
                    <div>
                      <span className="font-display text-xs font-bold text-white group-hover:text-cyan-300 block">
                        {model.name}
                      </span>
                      <span className="font-sans text-[10px] text-slate-400">
                        {model.provider} • {model.category} • ${model.inputPricePerMillion}/1M tokens
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-white/10 group-hover:bg-cyan-500 text-white font-display text-[10px] font-bold uppercase transition-colors">
                    Add
                  </span>
                </div>
              ))}

              {filteredPickerModels.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-400">
                  No additional models found matching "{pickerSearch}".
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Comparison Matrix or Empty State */}
      {comparedModels.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center flex flex-col items-center gap-4 border border-white/10">
          <Scale size={48} className="text-slate-500" />
          <h2 className="font-display text-xl font-bold text-white">No Models Selected for Comparison</h2>
          <p className="font-sans text-xs text-slate-400 max-w-md leading-relaxed">
            Select 2 to 4 AI models to evaluate their coding, reasoning, latency benchmarks, and token pricing side-by-side.
          </p>
          <button
            onClick={() => {
              addToCompare('deepseek-r1');
              addToCompare('claude-3-5-sonnet');
              addToCompare('gpt-4o');
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-display text-xs font-bold uppercase text-white shadow-md cursor-pointer"
          >
            Load Top 3 Models Example
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr>
                <th className="p-4 w-1/5 bg-white/[0.02] border-b border-white/10 rounded-tl-2xl">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                    Feature / Metric
                  </span>
                </th>
                {comparedModels.map((model) => {
                  const inCart = isInCart(model.id);
                  return (
                    <th
                      key={model.id}
                      className="p-4 w-1/4 bg-white/[0.03] border-b border-l border-white/10 relative"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCompare(model.id)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                            <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={15} />
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block font-display">
                              {model.provider}
                            </span>
                            <h3
                              onClick={() => {
                                setSelectedModelId(model.id);
                                setView('model-detail');
                              }}
                              className="font-display text-sm font-black text-white hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                            >
                              {model.name}
                              <ExternalLink size={11} className="text-slate-500" />
                            </h3>
                          </div>
                        </div>

                        {/* Add to Cart CTA */}
                        <button
                          onClick={() => (inCart ? setView('cart') : addToCart(model.id))}
                          className={`w-full py-2 px-3 rounded-xl font-display text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            inCart
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          {inCart ? (
                            <>
                              <Check size={12} /> In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={12} /> Add API to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {/* SECTION: PERFORMANCE SCORES */}
              <tr className="bg-black/30">
                <td colSpan={comparedModels.length + 1} className="py-2.5 px-4 font-display text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  ⚡ Benchmark & Performance Scores
                </td>
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" /> Overall Score
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className={`p-4 border-l border-white/5 ${bestOverallId === m.id ? 'bg-cyan-500/5' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-white">{m.overallScore}</span>
                      {bestOverallId === m.id && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Highest
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Code size={13} className="text-cyan-400" /> Coding (HumanEval / SWE)
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className={`p-4 border-l border-white/5 ${bestCodingId === m.id ? 'bg-indigo-500/5' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-slate-200">
                        {m.codingScore > 0 ? `${m.codingScore}` : 'N/A'}
                      </span>
                      {bestCodingId === m.id && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Top Coder
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Brain size={13} className="text-indigo-400" /> Reasoning (GPQA / Math)
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className={`p-4 border-l border-white/5 ${bestReasoningId === m.id ? 'bg-indigo-500/5' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-slate-200">
                        {m.reasoningScore > 0 ? `${m.reasoningScore}` : 'N/A'}
                      </span>
                      {bestReasoningId === m.id && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Top Logic
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" /> Speed & Latency
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className={`p-4 border-l border-white/5 ${bestSpeedId === m.id ? 'bg-amber-500/5' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-amber-300">
                        {m.speedTokensPerSec} tok/s
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        ~{m.latencyMs}ms TTFT
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* SECTION: CONTEXT & PRICING */}
              <tr className="bg-black/30">
                <td colSpan={comparedModels.length + 1} className="py-2.5 px-4 font-display text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  💰 API Token Pricing & Architecture
                </td>
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" /> Context Window
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="p-4 border-l border-white/5 font-display font-bold text-white">
                    {m.contextWindow}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Coins size={13} className="text-emerald-400" /> Input Price / 1M Tokens
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className={`p-4 border-l border-white/5 ${cheapestInputId === m.id ? 'bg-emerald-500/5' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        ${m.inputPricePerMillion.toFixed(2)}
                      </span>
                      {cheapestInputId === m.id && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Cheapest
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Coins size={13} className="text-cyan-400" /> Output Price / 1M Tokens
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="p-4 border-l border-white/5 font-mono font-bold text-cyan-300">
                    ${m.outputPricePerMillion.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* SECTION: LICENSING & HOSTING */}
              <tr className="bg-black/30">
                <td colSpan={comparedModels.length + 1} className="py-2.5 px-4 font-display text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  📜 License & Hosting Modality
                </td>
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300">Status & License</td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="p-4 border-l border-white/5">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold mb-1 ${
                        m.isOpenSource
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {m.isOpenSource ? <Globe size={10} /> : <Lock size={10} />}
                      {m.isOpenSource ? 'Open Weights' : 'Proprietary API'}
                    </span>
                    <span className="block text-[10px] text-slate-400">{m.license}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  <Cpu size={13} className="text-slate-400" /> Self-Host Hardware (If Open)
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="p-4 border-l border-white/5 text-[11px] text-slate-300">
                    {m.hardwareRequirements ? (
                      <div>
                        <span className="font-semibold text-slate-200 block">{m.hardwareRequirements.gpu}</span>
                        <span className="text-[10px] text-slate-400">{m.hardwareRequirements.vram} VRAM</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Cloud API Exclusive</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300">API Access Protocols</td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="p-4 border-l border-white/5">
                    <div className="flex flex-wrap gap-1">
                      {m.accessMethods.slice(0, 3).map((method) => (
                        <span key={method} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-300">
                          {method}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-slate-300">Best Suited Use-Case</td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="p-4 border-l border-white/5 text-[11px] text-slate-300 leading-relaxed">
                    {m.bestFor}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
