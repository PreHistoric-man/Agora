import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { CartItem } from '../context/AppContext';
import { ModelLogo } from './ModelLogo';
import {
  ShoppingCart,
  Trash2,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Info,
  ExternalLink,
  ChevronRight,
  Loader2,
  LogIn,
  UserCheck
} from 'lucide-react';

export const Cart: React.FC = () => {
  const {
    cart,
    models,
    removeFromCart,
    updateCartItem,
    clearCart,
    confirmApiAccessCheckout,
    setView,
    setSelectedModelId
  } = useApp();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Checkout modal / step state
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'review'>('cart');
  const [orgName, setOrgName] = useState('My Developer Studio');
  const [rateTier, setRateTier] = useState('Standard (500 RPM / 100K TPM)');
  const [region] = useState('us-east-1 (N. Virginia)');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expanded config item id
  const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);

  const cartModels = cart.map((item) => {
    const model = models.find((m) => m.id === item.modelId);
    return { item, model };
  }).filter((entry) => Boolean(entry.model));

  const totalEstimatedMonthlyCost = cart.reduce((sum, item) => sum + item.estimatedMonthlyCost, 0);

  const handleSliderChange = (modelId: string, tokens: number) => {
    updateCartItem(modelId, { monthlyTokenBudget: tokens });
  };

  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms || isProcessing) return;

    setIsProcessing(true);
    try {
      // Simulate short network latency for realism
      await new Promise((resolve) => setTimeout(resolve, 800));

      await confirmApiAccessCheckout({
        orgName: orgName.trim() || (user ? `${user.email?.split('@')[0]}'s Studio` : 'Demo Developer Studio'),
        rateTier,
        region
      });
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 mb-6 text-slate-400">
          <ShoppingCart size={36} />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-3">
          Your AI API Cart is Empty
        </h2>
        <p className="font-sans text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          Browse our AI API catalog to discover, benchmark, and select high-performance reasoning, coding, and multimodal model endpoints for your applications.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setView('discover')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-display text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            Explore AI APIs Catalog
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => setView('compare')}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-display text-xs font-bold cursor-pointer"
          >
            Compare AI Models
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left">
      {/* Top Banner & Title */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShoppingCart size={18} />
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
                Your AI API Cart
              </h1>
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-display text-xs font-bold text-cyan-300 border border-cyan-500/30">
                {cart.length} API {cart.length === 1 ? 'Selection' : 'Selections'}
              </span>
            </div>
            <p className="font-sans text-xs text-slate-400">
              Configure token budgets, data residency regions, and rate limit SLAs for your selected AI model API access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('discover')}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              + Add More Models
            </button>
            <button
              onClick={clearCart}
              className="text-xs text-rose-400/80 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} /> Clear Cart
            </button>
          </div>
        </div>

        {/* Concept Clarification Notice */}
        <div className="mt-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-3.5 flex items-start gap-3 text-xs text-slate-300">
          <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-sans">
            <strong className="text-white font-semibold">Demo AI API Marketplace: </strong>
            You are selecting API access endpoints to AI models (not purchasing weights or hardware). In this demo sandbox, all provisioned keys include $50 in free simulation credit.
          </div>
        </div>
      </div>

      {checkoutStep === 'cart' ? (
        /* ================= STEP 1: CART ITEMS & BUDGET CONFIGURATION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cartModels.map(({ item, model }) => {
              if (!model) return null;
              const isExpanded = expandedConfigId === model.id;

              return (
                <div
                  key={model.id}
                  className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 p-5 shadow-lg relative overflow-hidden backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    {/* Model Info Header */}
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner shrink-0">
                        <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={24} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-slate-300">
                            {model.provider}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="font-sans text-[10px] text-cyan-400 uppercase font-semibold">
                            {item.accessTier.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <h3
                          onClick={() => {
                            setSelectedModelId(model.id);
                            setView('model-detail');
                          }}
                          className="font-display text-base font-black text-white hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {model.name}
                          <ExternalLink size={13} className="text-slate-500" />
                        </h3>
                      </div>
                    </div>

                    {/* Cost Preview & Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex flex-col sm:text-right">
                        <span className="font-sans text-[10px] text-slate-400">Est. Usage Cost</span>
                        <span className="font-display text-lg font-black text-cyan-300">
                          ${item.estimatedMonthlyCost.toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(model.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove API from cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Pricing and Parameters Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 py-2 px-3 bg-black/30 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Input Pricing</span>
                      <span className="font-display font-bold text-white">
                        ${model.inputPricePerMillion.toFixed(2)}{' '}
                        <span className="text-[9px] text-slate-500">/ 1M tok</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Output Pricing</span>
                      <span className="font-display font-bold text-cyan-300">
                        ${model.outputPricePerMillion.toFixed(2)}{' '}
                        <span className="text-[9px] text-slate-500">/ 1M tok</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Context Window</span>
                      <span className="font-display font-bold text-slate-200">{model.contextWindow}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">License</span>
                      <span className="font-display font-bold text-slate-200 truncate block">
                        {model.isOpenSource ? 'Open Weights' : 'Commercial'}
                      </span>
                    </div>
                  </div>

                  {/* Token Budget Slider & Config Trigger */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-sans text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                        <Sliders size={13} className="text-cyan-400" />
                        Estimated Monthly Token Volume:
                      </span>
                      <span className="font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded border border-white/10 text-xs">
                        {(item.monthlyTokenBudget / 1000000).toFixed(1)}M Tokens
                      </span>
                    </div>

                    <input
                      type="range"
                      min={500000}
                      max={50000000}
                      step={500000}
                      value={item.monthlyTokenBudget}
                      onChange={(e) => handleSliderChange(model.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>0.5M tokens ($0.25+)</span>
                      <span>10M tokens</span>
                      <span>50M tokens (Enterprise)</span>
                    </div>
                  </div>

                  {/* Expandable Advanced Configuration Toggle */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedConfigId(isExpanded ? null : model.id)}
                      className="text-xs text-slate-400 hover:text-cyan-300 font-sans flex items-center gap-1 cursor-pointer"
                    >
                      <Layers size={13} />
                      {isExpanded ? 'Hide API Configuration' : 'Configure Region & Access Tier'}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setView('model-detail');
                      }}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View API Spec & SDKs <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* Expanded Configuration Drawer */}
                  {isExpanded && (
                    <div className="mt-3 p-3.5 bg-black/40 rounded-xl border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-slide-up">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-300">Data Residency Region</label>
                        <select
                          value={item.region}
                          onChange={(e) => updateCartItem(model.id, { region: e.target.value })}
                          className="rounded-lg glass-input p-2 font-sans text-xs text-white"
                        >
                          <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                          <option value="eu-west-1 (Frankfurt)">eu-west-1 (Frankfurt - GDPR)</option>
                          <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-300">Access Tier</label>
                        <select
                          value={item.accessTier}
                          onChange={(e) =>
                            updateCartItem(model.id, {
                              accessTier: e.target.value as CartItem['accessTier']
                            })
                          }
                          className="rounded-lg glass-input p-2 font-sans text-xs text-white"
                        >
                          <option value="pay-as-you-go">Pay-As-You-Go (Shared Standard)</option>
                          <option value="provisioned-throughput">Provisioned Throughput (Dedicated TPS)</option>
                          <option value="enterprise-sla">Enterprise SLA (99.99% Guaranteed)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary & Checkout CTA */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl glass-panel-heavy p-6 border border-white/10 shadow-2xl flex flex-col gap-5">
              <h2 className="font-display text-lg font-black text-white border-b border-white/10 pb-3 flex items-center justify-between">
                <span>API Usage Summary</span>
                <span className="text-xs font-sans font-normal text-slate-400">Monthly Est.</span>
              </h2>

              {/* Summary Items */}
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Selected Model APIs</span>
                  <span className="font-bold text-white">{cart.length} Models</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Est. Token Volume</span>
                  <span className="font-mono font-bold text-white">
                    {(cart.reduce((s, i) => s + i.monthlyTokenBudget, 0) / 1000000).toFixed(1)}M Tokens
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Monthly Usage</span>
                  <span className="font-mono font-bold text-white">
                    ${totalEstimatedMonthlyCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} /> Demo Sandbox Credits
                  </span>
                  <span className="font-mono font-bold">-$50.00</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-bold text-white">Due at Setup</span>
                    <span className="font-sans text-[10px] text-slate-400">Demo Hackathon Mode</span>
                  </div>
                  <span className="font-display text-2xl font-black text-cyan-300">
                    $0.00
                  </span>
                </div>
              </div>

              {/* Proceed to Review Button */}
              <button
                type="button"
                onClick={() => setCheckoutStep('review')}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-3.5 font-display text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Proceed to Review & Checkout
                <ArrowRight size={15} />
              </button>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck size={14} className="text-cyan-400" /> Automatic Library & API Activation
                </span>
                <p className="leading-relaxed">
                  Upon checkout confirmation, all selected models are automatically added to your Steam-style <strong className="text-white">Model Library</strong> and your developer API keys are instantly provisioned.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: REVIEW API ACCESS & SIMULATED CHECKOUT ================= */
        <form onSubmit={handleConfirmCheckout} className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="rounded-2xl glass-panel-heavy p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-black text-white">Review API Access Setup</h2>
                <p className="font-sans text-xs text-slate-400">
                  Verify your developer profile, rate limit tiers, and confirm simulated provisioning.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="text-xs text-cyan-400 hover:underline font-sans cursor-pointer"
              >
                ← Back to Cart
              </button>
            </div>

            {/* Selected Models Pill List */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs font-semibold text-slate-300">
                Selected AI Model APIs ({cart.length}):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cartModels.map(({ item, model }) => {
                  if (!model) return null;
                  return (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{model.providerLogo}</span>
                        <div>
                          <span className="font-display text-xs font-bold text-white block">
                            {model.name}
                          </span>
                          <span className="font-sans text-[10px] text-slate-400">
                            {model.provider} • {model.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-display text-xs font-bold text-cyan-400">
                        ${item.estimatedMonthlyCost.toFixed(2)}/mo
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Developer Org & Rate Limit Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-semibold text-slate-300">
                  Developer Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme AI Labs"
                  className="rounded-xl glass-input px-3.5 py-2.5 font-sans text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-semibold text-slate-300">
                  Rate Limit SLA Tier
                </label>
                <select
                  value={rateTier}
                  onChange={(e) => setRateTier(e.target.value)}
                  className="rounded-xl glass-input px-3.5 py-2.5 font-sans text-xs text-white"
                >
                  <option value="Standard (500 RPM / 100K TPM)">Standard (500 RPM / 100K TPM)</option>
                  <option value="Pro High-Throughput (1,000 RPM / 250K TPM)">Pro (1,000 RPM / 250K TPM)</option>
                  <option value="Enterprise Dedicated (2,000+ RPM / 500K TPM)">Enterprise (2,000+ RPM / 500K TPM)</option>
                </select>
              </div>
            </div>

            {/* Estimated Usage Breakdown Table */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Access Type:</span>
                <span className="font-semibold text-slate-200">Pay-as-you-go API</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Monthly Consumption:</span>
                <span className="font-mono font-bold text-white">
                  ${totalEstimatedMonthlyCost.toFixed(2)} / month
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Simulated Sandbox Credits Applied:</span>
                <span className="font-mono font-bold text-emerald-400">-$50.00 Free Trial Credit</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                <span>Total Due Today:</span>
                <span className="text-cyan-300 font-display text-sm">$0.00 (Demo Hackathon Mode)</span>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="rounded accent-cyan-400 mt-1 h-4 w-4"
              />
              <span className="font-sans text-xs text-slate-400 leading-relaxed">
                I agree to the <span className="text-cyan-400">API Terms of Service</span>, data privacy policy, and understand that this is a simulated demo marketplace providing sandbox credentials.
              </span>
            </label>

            {/* Confirm API Access Button */}
            <button
              type="submit"
              disabled={isProcessing || !acceptedTerms}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-4 font-display text-sm font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Provisioning API Access & Keys...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirm API Access
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
