import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Star, Trash2, Tag, ShoppingCart } from 'lucide-react';
import { ModelTags } from './ModelTags';

export const Wishlist: React.FC = () => {
  const {
    models,
    creators,
    toggleWishlist,
    setView,
    setSelectedModelId,
    openGetModelModal
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
      <section className="mb-8">
        <h1 className="font-display text-3xl font-black text-white mb-2">Your Wishlist</h1>
        <p className="font-sans text-xs text-slate-400">Keep track of models you want to buy, install, or try in the sandbox.</p>
      </section>

      {/* 30% OFF BANNER MOCKED */}
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/20 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 shrink-0">
            <Tag size={22} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-extrabold text-pink-400">PixelForge XL is 30% off!</span>
            <p className="font-sans text-xs text-slate-300 mt-0.5 leading-relaxed">
              Special promotional offer: managed cloud generations reduced to ₹0.05 / generation for a limited time.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedModelId('pixelforge-xl');
            setView('model-detail');
          }}
          className="rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-display text-xs font-black px-5 py-3 cursor-pointer shrink-0 transition-all uppercase flex items-center gap-1.5 shadow-lg shadow-pink-500/10"
        >
          <ShoppingCart size={14} />
          View Promotion
        </button>
      </section>

      {/* WISHLIST ROWS LIST */}
      <section className="flex flex-col gap-4">
        {wishlistedModels.length === 0 ? (
          <div className="rounded-2xl border border-white/5 py-24 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-4">
            <Heart size={44} className="text-slate-600 border border-dashed border-slate-600 rounded-full p-2.5" />
            <div>
              <span className="font-display font-bold text-slate-400 text-base">Your Wishlist is empty</span>
              <p className="font-sans text-xs text-slate-500 mt-0.5">Explore model hubs and save items here for quick reference.</p>
            </div>
            <button
              onClick={() => setView('store')}
              className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2 text-xs font-display font-bold text-slate-200 cursor-pointer transition-all mt-2"
            >
              Browse Trending Models
            </button>
          </div>
        ) : (
          wishlistedModels.map((m) => {
            const creator = creators.find((c) => c.id === m.creatorId);
            return (
              <div
                key={m.id}
                onClick={() => handleRowClick(m.id)}
                className="group flex flex-col md:flex-row gap-5 items-center justify-between rounded-2xl glass-panel p-4 border border-white/5 hover:border-pink-500/20 cursor-pointer steam-card"
              >
                {/* Left side: Thumbnail + Name */}
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                  {/* Thumbnail art */}
                  <div className={`h-16 w-24 rounded-lg bg-gradient-to-br ${m.artwork} shrink-0 p-2 flex flex-col justify-between`}>
                    <span className="rounded bg-black/40 px-1 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase">
                      {m.category}
                    </span>
                  </div>

                  <div className="text-center sm:text-left">
                    <h3 className="font-display font-black text-base text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight">
                      {m.name}
                    </h3>
                    <ModelTags tags={m.tags} limit={3} className="mt-1.5" />
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="font-sans text-[10px] text-slate-500">by {creator?.name}</span>
                      <span className="h-2 w-px bg-white/10"></span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400">
                        <Star size={10} fill="currentColor" />
                        {m.rating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Price / status / actions */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 w-full md:w-auto mt-4 md:mt-0">
                  {/* Price */}
                  <div className="text-center md:text-right shrink-0">
                    <span className="font-sans text-[9px] text-slate-500 block">PRICE</span>
                    <span className="font-display font-extrabold text-sm text-slate-200">
                      {m.price === 0 ? 'Free' : `₹${m.price}`}
                    </span>
                  </div>

                  {/* VRAM requirements */}
                  <div className="text-center md:text-right shrink-0 hidden sm:block">
                    <span className="font-sans text-[9px] text-slate-500 block">VRAM REQUIREMENT</span>
                    <span className="font-display text-xs font-bold text-slate-300">
                      {m.systemRequirements.minimum.vram}
                    </span>
                  </div>

                  {/* Installed Status */}
                  <div className="text-center md:text-right shrink-0">
                    <span className="font-sans text-[9px] text-slate-500 block">STATUS</span>
                    <span className={`font-display text-xs font-bold ${m.installed ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {m.installed ? 'Installed ✓' : 'Not Installed'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openGetModelModal(m.id);
                      }}
                      className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 font-display text-[10px] font-black text-slate-200 cursor-pointer uppercase transition-all"
                    >
                      {m.installed ? 'Launch' : 'Get Model'}
                    </button>
                    <button
                      onClick={(e) => handleRemove(e, m.id)}
                      className="p-2.5 rounded-xl border border-white/5 hover:border-red-500/25 hover:bg-red-500/5 text-slate-500 hover:text-red-400 cursor-pointer transition-all"
                      title="Remove from wishlist"
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
