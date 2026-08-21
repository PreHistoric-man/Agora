import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModelLogo } from './ModelLogo';
import {
  Server,
  Key,
  Copy,
  Check,
  Zap,
  Activity,
  Trash2,
  RefreshCw,
  Code,
  ExternalLink,
  Plus,
  Sliders,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const MyApis: React.FC = () => {
  const {
    activeApis,
    models,
    revokeApiAccess,
    regenerateApiKey,
    setView,
    setSelectedModelId,
    addToast
  } = useApp();

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<string[]>([]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    addToast('Demo API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeyIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalTokensConsumed = activeApis.reduce((sum, api) => sum + api.tokensUsed, 0);
  const totalSpend = activeApis.reduce((sum, api) => sum + api.spendUsd, 0);
  const totalRequests = activeApis.reduce((sum, api) => sum + api.totalRequests, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left">
      {/* Top Banner & Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server size={18} />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
              My APIs Dashboard
            </h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-display text-xs font-bold text-cyan-300 border border-cyan-500/30">
              {activeApis.length} Active {activeApis.length === 1 ? 'Endpoint' : 'Endpoints'}
            </span>
          </div>
          <p className="font-sans text-xs text-slate-400">
            Manage your provisioned AI model API keys, monitor simulated sandbox token usage, and inspect SDK connection snippets.
          </p>
        </div>

        <button
          onClick={() => setView('discover')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <Plus size={14} /> Add New API Access
        </button>
      </div>

      {/* Demo Notice Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black to-indigo-950/40 border border-cyan-500/20 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-slate-300">
          <Sparkles size={18} className="text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">Demo Sandbox Environment: </strong>
            All endpoints are authenticated with mock developer keys. You can test live streaming queries directly in our Playground.
          </span>
        </div>
        <button
          onClick={() => setView('try')}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-display text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Zap size={13} /> Launch Playground
        </button>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <Activity size={13} className="text-cyan-400" /> Active API Subscriptions
          </span>
          <span className="font-display text-2xl font-black text-white">{activeApis.length}</span>
          <span className="text-[10px] text-emerald-400 font-medium">100% Endpoints Healthy</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" /> Total Demo Requests
          </span>
          <span className="font-display text-2xl font-black text-amber-300">{totalRequests.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 font-sans">Avg. Latency: 28ms</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <Sliders size={13} className="text-indigo-400" /> Tokens Consumed
          </span>
          <span className="font-display text-2xl font-black text-indigo-300">
            {(totalTokensConsumed / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Across all provisioned models</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-1">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" /> Sandbox Spend / Balance
          </span>
          <span className="font-display text-2xl font-black text-emerald-400">
            ${totalSpend.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">/ $50.00 Credit</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-sans">$44.38 remaining</span>
        </div>
      </div>

      {/* Active APIs List */}
      {activeApis.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center flex flex-col items-center gap-4 border border-white/10">
          <Server size={48} className="text-slate-600" />
          <h2 className="font-display text-xl font-bold text-white">No Active AI Model APIs</h2>
          <p className="font-sans text-xs text-slate-400 max-w-md leading-relaxed">
            You currently have no active AI model API subscriptions. Browse the model catalog and select models to provision demo keys.
          </p>
          <button
            onClick={() => setView('discover')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-display text-xs font-bold uppercase text-white shadow-md cursor-pointer"
          >
            Explore API Marketplace
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-base font-black text-white flex items-center gap-2">
            <Key size={16} className="text-cyan-400" /> Active API Subscriptions ({activeApis.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {activeApis.map((api) => {
              const model = models.find((m) => m.id === api.modelId);
              if (!model) return null;

              const isRevealed = revealedKeyIds.includes(api.id);
              const isCopied = copiedKeyId === api.id;
              const maskedKey = isRevealed
                ? api.apiKey
                : `${api.apiKey.substring(0, 14)}••••••••••••••••••••••••`;

              return (
                <div
                  key={api.id}
                  className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 p-6 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col gap-5"
                >
                  {/* Top Row: Provider Logo & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner shrink-0">
                        <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={24} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xs font-bold text-slate-300">
                            {model.provider}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="font-sans text-[10px] text-cyan-400 uppercase font-semibold">
                            {api.accessType}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="font-sans text-[10px] text-slate-400">
                            Region: {api.region}
                          </span>
                        </div>
                        <h3
                          onClick={() => {
                            setSelectedModelId(model.id);
                            setView('model-detail');
                          }}
                          className="font-display text-lg font-black text-white hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {model.name}
                          <ExternalLink size={14} className="text-slate-500" />
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Status: Active
                      </span>

                      <button
                        onClick={() => {
                          setSelectedModelId(model.id);
                          setView('try');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-display font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap size={13} /> Test
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: API Endpoint & Demo Key */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Endpoint */}
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-[11px] font-semibold text-slate-300">API Endpoint URL</span>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-slate-200">
                        <span className="truncate">{api.endpoint}</span>
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-sans font-bold uppercase">
                          POST
                        </span>
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <Key size={12} className="text-amber-400" /> Demo API Key
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-mono font-medium">
                          [Placeholder Sandbox Key]
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-amber-300">
                        <span className="truncate">{maskedKey}</span>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={() => toggleRevealKey(api.id)}
                            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title={isRevealed ? 'Hide Key' : 'Reveal Key'}
                          >
                            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleCopy(api.apiKey, api.id)}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} className="text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Metrics & Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rate Limit SLA</span>
                      <span className="font-display font-bold text-white">{api.rateLimitRpm} RPM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tokens Processed</span>
                      <span className="font-display font-bold text-indigo-300">
                        {(api.tokensUsed / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Requests</span>
                      <span className="font-display font-bold text-slate-200">{api.totalRequests.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pricing Tier</span>
                      <span className="font-display font-bold text-cyan-300">
                        ${model.inputPricePerMillion} in / ${model.outputPricePerMillion} out
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedModelId(model.id);
                          setView('model-detail');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-sans text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Code size={13} /> View API Specs & SDK
                      </button>

                      <button
                        onClick={() => regenerateApiKey(api.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-sans text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={13} /> Rotate Demo Key
                      </button>
                    </div>

                    <button
                      onClick={() => revokeApiAccess(api.id)}
                      className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Revoke API Access
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
