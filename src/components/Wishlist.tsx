import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Star, Trash2, ShoppingCart, Check } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const {
    models,
    toggleWishlist,
    setView,
    setSelectedModelId,
    addToCart,
    isInCart
  } = useApp();

  const wishlistedModels = models.filter((m) => m.wishlisted);

  const handleRowClick = (id: string) => {
    setSelectedModelId(id);
    setView('model-detail');
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in text-left select-none">
      {/* HEADER */}
      <section className="mb-8 border-b border-white/10 pb-5">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white mb-2">Saved AI Model APIs</h1>
        <p className="font-sans text-xs text-slate-400">
          Keep track of foundation model APIs you are benchmarking or planning to integrate into your application.
        </p>
      </section>

      {/* WISHLIST ROWS LIST */}
      <section className="flex flex-col gap-4">
        {wishlistedModels.length === 0 ? (
          <div className="rounded-2xl border border-white/5 py-24 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-4 glass-panel">
            <Heart size={44} className="text-slate-600 border border-dashed border-slate-600 rounded-full p-2.5" />
            <div>
              <span className="font-display font-bold text-slate-400 text-base">No Saved APIs</span>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                Browse our AI model catalog and save APIs here for quick reference and benchmarking.
              </p>
            </div>
            <button
              onClick={() => setView('discover')}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-display font-bold uppercase text-white shadow-md cursor-pointer transition-all mt-2"
            >
              Browse AI API Marketplace
            </button>
          </div>
        ) : (
          wishlistedModels.map((m) => {
            const inCart = isInCart(m.id);
            return (
              <div
                key={m.id}
                onClick={() => handleRowClick(m.id)}
                className="group flex flex-col md:flex-row gap-5 items-center justify-between rounded-2xl glass-panel p-4 border border-white/5 hover:border-cyan-500/30 cursor-pointer steam-card"
              >
                {/* Left side: Thumbnail + Name */}
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                  {/* Thumbnail art */}
                  <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shrink-0 shadow-inner">
                    {m.providerLogo}
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-slate-400">{m.provider}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] font-sans text-cyan-400 font-semibold">{m.category} API</span>
                    </div>
                    <h3 className="font-display font-black text-base text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight">
                      {m.name}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400">
                        <Star size={10} fill="currentColor" />
                        {m.rating} ({m.reviewCount.toLocaleString()} reviews)
                      </div>
                      <span className="h-2 w-px bg-white/10"></span>
                      <span className="text-[10px] text-slate-400">{m.contextWindow}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Price / status / actions */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 w-full md:w-auto mt-4 md:mt-0">
                  {/* Token Price */}
                  <div className="text-center md:text-right shrink-0">
                    <span className="font-sans text-[9px] text-slate-500 block">TOKEN PRICING (1M)</span>
                    <span className="font-display font-extrabold text-sm text-cyan-300">
                      ${m.inputPricePerMillion} in / ${m.outputPricePerMillion} out
                    </span>
                  </div>

                  {/* Overall Score */}
                  <div className="text-center md:text-right shrink-0 hidden sm:block">
                    <span className="font-sans text-[9px] text-slate-500 block">OVERALL SCORE</span>
                    <span className="font-display text-xs font-bold text-white">
                      {m.overallScore} / 100
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inCart) {
                          setView('cart');
                        } else {
                          addToCart(m.id);
                        }
                      }}
                      className={`rounded-xl px-4 py-2 font-display text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        inCart
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20'
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

                    <button
                      onClick={(e) => handleRemove(e, m.id)}
                      className="p-2 rounded-xl border border-white/5 hover:border-red-500/25 hover:bg-red-500/5 text-slate-500 hover:text-red-400 cursor-pointer transition-all"
                      title="Remove from saved APIs"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
