import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModelTags } from './ModelTags';
import { CheckCircle2, UserPlus, Star, Zap } from 'lucide-react';

export const CreatorProfile: React.FC = () => {
  const {
    creators,
    models,
    workshopItems,
    posts,
    selectedCreatorId,
    followedCreatorIds,
    toggleFollowCreator,
    setSelectedModelId,
    setView
  } = useApp();

  const [activeTab, setActiveTab] = useState<'models' | 'workshop' | 'posts'>('models');

  const creator = creators.find((c) => c.id === selectedCreatorId) || creators[0];
  const isFollowing = followedCreatorIds.includes(creator.id);

  // Filter items published by this creator
  const creatorModels = models.filter((m) => m.creatorId === creator.id);
  const creatorWorkshop = workshopItems.filter((w) => w.author === creator.name);
  const creatorPosts = posts.filter((p) => p.author === creator.name);

  const handleModelClick = (id: string) => {
    setSelectedModelId(id);
    setView('model-detail');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in text-left select-none">
      {/* 1. BRANDING BANNER */}
      <section className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-tr from-indigo-950 via-slate-900 to-[#0b0c10]">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        {/* Abstract pattern */}
        <div className="absolute right-12 top-6 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
      </section>

      {/* 2. CREATOR PROFILE CARD OVERLAY */}
      <section className="relative -mt-16 px-6 md:px-12 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
          {/* Avatar */}
          <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border-4 border-slate-950 flex items-center justify-center font-display font-black text-2xl text-cyan-300 shadow-xl tracking-wider select-none">
            {creator.avatar}
          </div>
          
          <div className="flex flex-col gap-1.5 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl md:text-3xl font-black text-white">{creator.name}</h1>
              {creator.verified && (
                <CheckCircle2 className="text-cyan-400 shrink-0" size={20} fill="rgba(6,182,212,0.1)" />
              )}
            </div>
            <p className="font-sans text-xs text-slate-400 max-w-md">{creator.bio}</p>
          </div>
        </div>

        {/* Follow CTA */}
        <button
          onClick={() => toggleFollowCreator(creator.id)}
          className={`px-6 py-3 rounded-xl font-display text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg uppercase ${
            isFollowing
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-cyan-500/5'
              : 'bg-white text-slate-950 hover:bg-slate-200'
          }`}
        >
          <UserPlus size={14} />
          {isFollowing ? 'Following Creator' : 'Follow Creator'}
        </button>
      </section>

      {/* 3. KEY METRICS STATS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10">
        <div className="rounded-xl glass-panel p-5">
          <span className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Followers</span>
          <span className="font-display text-2xl font-black text-white block mt-1">
            {(creator.followers / 1000).toFixed(1)}K
          </span>
        </div>
        <div className="rounded-xl glass-panel p-5">
          <span className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Installs</span>
          <span className="font-display text-2xl font-black text-white block mt-1">
            {(creator.installs / 1000000).toFixed(1)}M
          </span>
        </div>
        <div className="rounded-xl glass-panel p-5">
          <span className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Models Released</span>
          <span className="font-display text-2xl font-black text-white block mt-1">{creator.modelCount}</span>
        </div>
        <div className="rounded-xl glass-panel p-5 border-cyan-500/10 bg-cyan-500/[0.01]">
          <span className="font-sans text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Total Earnings</span>
          <span className="font-display text-2xl font-black text-cyan-400 block mt-1">{creator.earnings}</span>
        </div>
      </section>

      {/* 4. TABS */}
      <section className="mb-6 border-b border-white/5">
        <div className="flex gap-2">
          {(['models', 'workshop', 'posts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 font-display text-sm font-semibold capitalize border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {tab === 'posts' ? 'Publisher Logs' : tab}
            </button>
          ))}
        </div>
      </section>

      {/* 5. PORTFOLIO GRID CONTENT */}
      <div>
        {activeTab === 'models' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creatorModels.length === 0 ? (
              <div className="col-span-4 rounded-xl border border-white/5 py-12 text-center text-slate-500 text-xs">No models published yet.</div>
            ) : (
              creatorModels.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleModelClick(m.id)}
                  className="group flex flex-col rounded-2xl glass-panel p-3 border border-white/5 hover:border-cyan-500/20 cursor-pointer steam-card"
                >
                  <div className={`w-full aspect-[4/3] rounded-xl bg-gradient-to-br ${m.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase">
                      {m.category}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-sm text-white group-hover:text-cyan-400 transition-colors mb-0.5">
                    {m.name}
                  </h3>
                  <ModelTags tags={m.tags} limit={2} className="mb-2" />
                  <p className="font-sans text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {m.description}
                  </p>

                  <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
                      <Zap size={11} />
                      {(m.apiCallsCount / 1000000).toFixed(1)}M queries
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-400 font-bold">
                      <Star size={12} fill="currentColor" />
                      {m.rating}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'workshop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creatorWorkshop.length === 0 ? (
              <div className="col-span-4 rounded-xl border border-white/5 py-12 text-center text-slate-500 text-xs">No workshop items created.</div>
            ) : (
              creatorWorkshop.map((w) => (
                <div
                  key={w.id}
                  className="group bg-[#0b0c10]/40 rounded-2xl p-4 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${w.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                      <span className="rounded bg-black/40 px-1.5 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase">
                        {w.category}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-sm text-white mb-0.5">
                      {w.title}
                    </h3>
                    <span className="font-sans text-[10px] text-slate-500 hover:text-cyan-400 cursor-pointer block mb-2" onClick={() => handleModelClick(w.modelId)}>
                      For {w.modelName}
                    </span>
                    <p className="font-sans text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {w.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-500 font-semibold">
                      {(w.subscribers / 1000).toFixed(0)}k subs
                    </span>
                    <div className="flex items-center gap-0.5 text-xs text-yellow-400 font-bold shrink-0">
                      <Star size={10} fill="currentColor" />
                      {w.rating}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creatorPosts.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-white/5 py-12 text-center text-slate-500 text-xs">No posts authored by this creator.</div>
            ) : (
              creatorPosts.map((post) => (
                <div key={post.id} className="rounded-2xl glass-panel p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 font-display text-[9px] font-bold text-slate-400 uppercase">
                        {post.category}
                      </span>
                      <span className="font-sans text-[10px] text-slate-500">{post.timeAgo}</span>
                    </div>

                    <h3 className="font-display font-black text-sm text-white mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="font-sans text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                    <span className="font-sans text-[10px] text-slate-500" onClick={() => handleModelClick(post.modelId)}>
                      Posted in {post.modelName} Hub
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>{post.likes} likes</span>
                      <span>{post.replies} replies</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
