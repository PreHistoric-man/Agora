import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModelCard } from './ModelCard';
import {
  Sparkles,
  Zap,
  Brain,
  Scale,
  ArrowRight,
  Coins,
  Server,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  PlusCircle,
  BookOpen
} from 'lucide-react';

export const StoreHome: React.FC = () => {
  const {
    models,
    modelsLoading,
    posts,
    setView,
    setSelectedModelId,
    openOnboarding,
    voteCommunityPost
  } = useApp();
  const [activePostCategory, setActivePostCategory] = useState<string>('All');

  // Filtered Community Posts for the home section
  const displayedPosts = useMemo(() => {
    let list = posts;
    if (activePostCategory !== 'All') {
      list = list.filter((p) => p.category === activePostCategory);
    }
    return list.slice(0, 4);
  }, [posts, activePostCategory]);

  const postCategories = ['All', 'Discussions', 'Guides', 'Creations', 'Reviews'];

  // Highlighted Top Models from database (filter featured & trending)
  const featuredModels = useMemo(() => {
    const featured = models.filter((m) => m.featured);
    return featured.length > 0 ? featured : models;
  }, [models]);

  const trendingModels = useMemo(() => {
    const trending = models.filter((m) => m.trending);
    return trending.length > 0 ? trending.slice(0, 6) : models.slice(0, 6);
  }, [models]);

  const reasoningLeader = useMemo(() => {
    return (
      featuredModels.find((m) => m.category.toLowerCase() === 'reasoning' || m.id.includes('deepseek') || m.id.includes('o3') || m.id.includes('r1')) ||
      featuredModels[0] ||
      models[0]
    );
  }, [featuredModels, models]);

  const codingLeader = useMemo(() => {
    return (
      featuredModels.find((m) => m.category.toLowerCase() === 'coding' || m.id.includes('claude') || m.id.includes('coder') || m.id.includes('sonnet')) ||
      featuredModels[1] ||
      models[1] ||
      models[0]
    );
  }, [featuredModels, models]);

  const visionLeader = useMemo(() => {
    return (
      featuredModels.find((m) => m.category.toLowerCase() === 'vision' || m.category.toLowerCase() === 'multimodal' || m.id.includes('gemini') || m.id.includes('gpt-4o')) ||
      featuredModels[2] ||
      models[2] ||
      models[0]
    );
  }, [featuredModels, models]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-left flex flex-col gap-14">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-black to-slate-950 border border-white/10 p-8 md:p-14 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-start max-w-3xl gap-5">
          <div className="flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-xs font-display font-bold text-cyan-300">
            <Sparkles size={14} className="text-cyan-400" />
            Next-Gen AI API Marketplace • Hackathon Sandbox
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Discover, Compare & Integrate{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
              Leading AI Model APIs
            </span>
          </h1>

          <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Evaluate benchmark performance, compare token pricing, and configure instant API access to top reasoning, coding, and vision models through a unified developer interface.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setView('discover')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-display text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Explore AI Model APIs
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => setView('compare')}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-display text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Scale size={15} className="text-indigo-400" />
              Compare Models Side-by-Side
            </button>

            <button
              onClick={openOnboarding}
              className="px-5 py-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-display text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <HelpCircle size={15} className="text-cyan-400" />
              How Agora Works
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 w-full mt-2">
            <div>
              <span className="font-display text-xl md:text-2xl font-black text-white">10+</span>
              <span className="font-sans text-[11px] text-slate-400 block">Frontier Providers</span>
            </div>
            <div>
              <span className="font-display text-xl md:text-2xl font-black text-cyan-300">100%</span>
              <span className="font-sans text-[11px] text-slate-400 block">OpenAI SDK Compatible</span>
            </div>
            <div>
              <span className="font-display text-xl md:text-2xl font-black text-amber-300">$0.14</span>
              <span className="font-sans text-[11px] text-slate-400 block">Starting / 1M Tokens</span>
            </div>
            <div>
              <span className="font-display text-xl md:text-2xl font-black text-emerald-400">$50.00</span>
              <span className="font-sans text-[11px] text-slate-400 block">Free Demo Sandbox Credit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Leaderboards Spotlight */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
              <Brain size={20} className="text-cyan-400" /> SOTA Category Leaders
            </h2>
            <p className="font-sans text-xs text-slate-400">
              Top-performing foundation model APIs across core software and research domains.
            </p>
          </div>

          <button
            onClick={() => setView('discover')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
          >
            View All Models <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Reasoning Spotlight */}
          <div
            onClick={() => {
              setSelectedModelId(reasoningLeader.id);
              setView('model-detail');
            }}
            className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  #1 Reasoning Leader
                </span>
                <span className="font-display text-xs font-black text-white">
                  {reasoningLeader.overallScore} Score
                </span>
              </div>
              <h3 className="font-display text-lg font-black text-white group-hover:text-cyan-300 mb-1">
                {reasoningLeader.name}
              </h3>
              <p className="font-sans text-xs text-slate-400 line-clamp-2 mb-4">
                {reasoningLeader.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs">
              <span className="font-mono text-cyan-400 font-bold">
                ${reasoningLeader.inputPricePerMillion} / 1M in
              </span>
              <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-semibold">
                Configure API →
              </span>
            </div>
          </div>

          {/* Coding Spotlight */}
          <div
            onClick={() => {
              setSelectedModelId(codingLeader.id);
              setView('model-detail');
            }}
            className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/40 border border-indigo-500/30 hover:border-indigo-400/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  #1 Coding & Agents
                </span>
                <span className="font-display text-xs font-black text-white">
                  {codingLeader.overallScore} Score
                </span>
              </div>
              <h3 className="font-display text-lg font-black text-white group-hover:text-indigo-300 mb-1">
                {codingLeader.name}
              </h3>
              <p className="font-sans text-xs text-slate-400 line-clamp-2 mb-4">
                {codingLeader.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs">
              <span className="font-mono text-indigo-400 font-bold">
                ${codingLeader.inputPricePerMillion} / 1M in
              </span>
              <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-semibold">
                Configure API →
              </span>
            </div>
          </div>

          {/* Long Context & Vision Spotlight */}
          <div
            onClick={() => {
              setSelectedModelId(visionLeader.id);
              setView('model-detail');
            }}
            className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/40 border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  #1 Long Context (2M)
                </span>
                <span className="font-display text-xs font-black text-white">
                  {visionLeader.overallScore} Score
                </span>
              </div>
              <h3 className="font-display text-lg font-black text-white group-hover:text-emerald-300 mb-1">
                {visionLeader.name}
              </h3>
              <p className="font-sans text-xs text-slate-400 line-clamp-2 mb-4">
                {visionLeader.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs">
              <span className="font-mono text-emerald-400 font-bold">
                ${visionLeader.inputPricePerMillion} / 1M in
              </span>
              <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-semibold">
                Configure API →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending AI Model APIs Grid */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
              <Zap size={20} className="text-amber-400" /> Trending AI Model APIs
            </h2>
            <p className="font-sans text-xs text-slate-400">
              Add API access to your cart or compare specifications side-by-side.
            </p>
          </div>

          <button
            onClick={() => setView('discover')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
          >
            Explore All 20+ Models <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelsLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
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
            ))
          ) : (
            trendingModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))
          )}
        </div>
      </div>

      {/* Community Posts Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-display font-extrabold uppercase tracking-wider mb-1.5">
              <MessageSquare size={11} /> Community Posts & Discussions
            </div>
            <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
              Agora Developer Community
            </h2>
            <p className="font-sans text-xs text-slate-400">
              Explore benchmark findings, integration guides, prompt configurations, and architecture reviews shared by AI engineers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setView('community')}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-sans font-semibold transition-colors"
            >
              View All Hub Posts <ArrowRight size={13} />
            </button>
            <button
              onClick={() => setView('community')}
              className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-display text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={14} /> Write Post
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {postCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActivePostCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-display text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                activePostCategory === cat
                  ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-sm shadow-teal-500/10'
                  : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              className="group rounded-2xl glass-panel p-5 flex flex-col justify-between border border-white/5 hover:border-teal-500/30 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 font-display text-[9px] font-bold text-teal-300 uppercase tracking-wide">
                      {post.category}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedModelId(post.modelId);
                        setView('model-detail');
                      }}
                      className="font-sans text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen size={11} className="text-teal-400/60" /> {post.modelName}
                    </button>
                  </div>
                  <span className="font-sans text-[10px] text-slate-500 shrink-0">{post.timeAgo}</span>
                </div>

                <h3
                  onClick={() => setView('community')}
                  className="font-display font-black text-sm text-white mb-2 leading-snug group-hover:text-teal-300 transition-colors cursor-pointer"
                >
                  {post.title}
                </h3>
                <p className="font-sans text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {post.content}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs ring-1 ring-white/10">
                    {post.authorAvatar}
                  </div>
                  <span className="font-sans text-xs font-semibold text-slate-300">{post.author}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {/* Like */}
                  <button
                    onClick={() => voteCommunityPost(post.id, 'like')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      post.userVote === 'like'
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                        : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-teal-300'
                    }`}
                  >
                    <ThumbsUp size={11} className={post.userVote === 'like' ? 'fill-teal-400 text-teal-400' : ''} />
                    <span>{post.likes}</span>
                  </button>

                  {/* Dislike */}
                  <button
                    onClick={() => voteCommunityPost(post.id, 'dislike')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      post.userVote === 'dislike'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    <ThumbsDown size={11} className={post.userVote === 'dislike' ? 'fill-rose-400 text-rose-400' : ''} />
                    <span>{post.dislikes || 0}</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={() => setView('community')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageSquare size={11} />
                    <span>{post.comments?.length || post.replies}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Value Props */}
      <div className="rounded-3xl glass-panel p-8 md:p-12 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Server size={22} />
          </div>
          <h3 className="font-display text-base font-bold text-white">Unified API Gateway</h3>
          <p className="font-sans text-xs text-slate-400 leading-relaxed">
            One OpenAI-compatible SDK endpoint to query models from OpenAI, Anthropic, DeepSeek, Google, and open-weights clusters seamlessly.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Scale size={22} />
          </div>
          <h3 className="font-display text-base font-bold text-white">Side-by-Side Comparison</h3>
          <p className="font-sans text-xs text-slate-400 leading-relaxed">
            Directly benchmark HumanEval coding, GPQA logic reasoning, time-to-first-token latency, and token pricing matrices side-by-side.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coins size={22} />
          </div>
          <h3 className="font-display text-base font-bold text-white">Transparent Token Economics</h3>
          <p className="font-sans text-xs text-slate-400 leading-relaxed">
            Accurately project monthly API costs using token budget sliders before provisioning keys. Free $50 sandbox credit included.
          </p>
        </div>
      </div>
    </div>
  );
};
