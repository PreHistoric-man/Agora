import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  Heart,
  Share2,
  UserPlus,
  Shield,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { TryModel } from './TryModel'; // sandbox import
import { ModelTags } from './ModelTags';

export type ReviewVerdict =
  | 'Overwhelmingly Positive'
  | 'Positive'
  | 'Mixed'
  | 'Negative'
  | 'Very Negative'
  | 'Overwhelmingly Negative';

/** Steam-style review ranking from star rating + response volume. */
export function getReviewRanking(rating: number, reviewCount: number): {
  label: ReviewVerdict;
  positivePercent: number;
  tone: 'positive' | 'mixed' | 'negative';
} {
  const positivePercent = Math.min(100, Math.max(0, Math.round((rating / 5) * 100)));

  // Positive overall sentiment
  if (positivePercent >= 70) {
    // >500 responses → Overwhelmingly Positive; otherwise Positive
    if (reviewCount > 500) {
      return { label: 'Overwhelmingly Positive', positivePercent, tone: 'positive' };
    }
    return { label: 'Positive', positivePercent, tone: 'positive' };
  }

  // Mixed (neither clearly positive nor negative)
  if (positivePercent >= 40) {
    return { label: 'Mixed', positivePercent, tone: 'mixed' };
  }

  // Negative side — more volume escalates severity
  if (positivePercent < 20 && reviewCount > 500) {
    return { label: 'Overwhelmingly Negative', positivePercent, tone: 'negative' };
  }
  if (positivePercent < 30 && reviewCount > 100) {
    return { label: 'Very Negative', positivePercent, tone: 'negative' };
  }
  return { label: 'Negative', positivePercent, tone: 'negative' };
}

function verdictStyles(tone: 'positive' | 'mixed' | 'negative') {
  switch (tone) {
    case 'positive':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        bar: 'from-emerald-500 to-teal-400'
      };
    case 'mixed':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/25',
        bar: 'from-amber-500 to-yellow-400'
      };
    case 'negative':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/25',
        bar: 'from-rose-500 to-red-500'
      };
  }
}

function reviewCountLabel(count: number) {
  if (count > 500) return 'High volume (>500 responses)';
  if (count > 100) return 'Solid sample size';
  if (count > 20) return 'Growing review base';
  return 'Limited reviews';
}

export const ModelDetail: React.FC = () => {
  const {
    models,
    creators,
    posts,
    workshopItems,
    selectedModelId,
    setView,
    toggleWishlist,
    toggleFollowCreator,
    toggleSubscribeWorkshop,
    openGetModelModal,
    addToast,
    addCommunityPost,
    followedCreatorIds,
    isModelOwned,
    startDeployment,
    deployments,
    setSelectedDeploymentId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'try' | 'reviews' | 'community' | 'workshop' | 'changelog'>('overview');

  // Community post creation form states
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'Discussions' | 'Creations' | 'Guides' | 'Screenshots'>('Discussions');

  const model = models.find((m) => m.id === selectedModelId) || models[0];
  const creator = creators.find((c) => c.id === model.creatorId) || creators[0];
  const isFollowingCreator = followedCreatorIds.includes(creator.id);
  const reviewRanking = getReviewRanking(model.rating, model.reviewCount);
  const rankingStyle = verdictStyles(reviewRanking.tone);
  const positiveReviews = Math.round((reviewRanking.positivePercent / 100) * model.reviewCount);
  const negativeReviews = Math.max(0, model.reviewCount - positiveReviews);

  // Filter items for this specific model
  const modelPosts = posts.filter((p) => p.modelId === model.id);
  const modelReviews = posts.filter((p) => p.modelId === model.id && p.category === 'Reviews');
  const modelWorkshop = workshopItems.filter((w) => w.modelId === model.id);

  const mockChangelogs = [
    {
      version: model.version,
      date: model.updatedDate,
      changes: [
        'Improved text embedding layer for rendering long English phrases.',
        'Speed optimization by 14% on NVIDIA ADA Lovelace architecture.',
        'Resolved memory leakage in heavy batch operations.',
        'Refined lighting and shadow refractions in photorealistic presets.'
      ]
    },
    {
      version: 'v2.2.0',
      date: '2026-03-14',
      changes: [
        'Added Image-to-Image blending pipelines.',
        'Enabled multi-GPU scaling configs in backend configurations.',
        'Upgraded documentation guides for local hosting.'
      ]
    },
    {
      version: 'v2.0.0',
      date: model.releaseDate,
      changes: [
        'Initial marketplace release on ModelVerse.',
        'Core latent diffusion weights compiled with safety guards.'
      ]
    }
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Model link copied to clipboard!', 'success');
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      addToast('Please fill out all fields', 'warning');
      return;
    }
    addCommunityPost(model.id, model.name, newPostCategory, newPostTitle, newPostContent);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in">
      {/* HEADER SECTION */}
      <section className="mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 font-display text-[10px] font-extrabold text-cyan-400 uppercase">
                {model.category}
              </span>
              <span className="font-sans text-xs text-slate-500">Released {model.releaseDate}</span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-black text-white">{model.name}</h1>
            <ModelTags tags={model.tags} className="mt-1 max-w-2xl" />
            
            {/* Creator & Trust Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
              <div
                onClick={() => {
                  setView('creator');
                }}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="h-6 w-6 rounded bg-[#252836] flex items-center justify-center text-xs">
                  {creator.avatar}
                </div>
                <span className="font-sans text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">
                  {creator.name}
                </span>
                {creator.verified && (
                  <CheckCircle size={12} className="text-cyan-400" fill="rgba(6,182,212,0.1)" />
                )}
              </div>
              <span className="h-3 w-px bg-white/10 hidden sm:block"></span>
              
              <div className="flex items-center gap-1 text-xs">
                <span className={`rounded px-2 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wide ${rankingStyle.bg} ${rankingStyle.border} border ${rankingStyle.text}`}>
                  {reviewRanking.label}
                </span>
                <span className="font-sans text-slate-500">({model.reviewCount.toLocaleString()} reviews)</span>
              </div>
              <span className="h-3 w-px bg-white/10 hidden sm:block"></span>
              
              <div className="flex items-center gap-1 text-xs">
                <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                <span className="font-display font-bold text-slate-200">{model.rating}</span>
              </div>
              <span className="h-3 w-px bg-white/10 hidden sm:block"></span>
              
              <div className="font-sans text-xs text-slate-400">
                <span className="font-bold text-slate-200">{(model.installCount / 1000).toFixed(0)}k</span> installs
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('try')}
              className="flex-grow sm:flex-grow-0 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-5 py-3 font-display text-xs font-black text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 uppercase"
            >
              Try Model
            </button>
            <button
              onClick={() => openGetModelModal(model.id)}
              className="flex-grow sm:flex-grow-0 rounded-xl bg-white/10 hover:bg-white/15 px-5 py-3 font-display text-xs font-black text-white transition-all cursor-pointer uppercase border border-white/5"
            >
              {model.installed ? 'Launch Model' : 'Get Model'}
            </button>
            <button
              onClick={() => {
                const existingDeployment = deployments.find((deployment) => deployment.modelId === model.id);
                if (existingDeployment) {
                  setSelectedDeploymentId(existingDeployment.id);
                  setView('deployment-detail');
                } else {
                  startDeployment(model.id);
                }
              }}
              className={`flex-grow sm:flex-grow-0 rounded-xl px-5 py-3 font-display text-xs font-black transition-all cursor-pointer uppercase border ${
                isModelOwned(model.id)
                  ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {deployments.some((deployment) => deployment.modelId === model.id) ? 'Manage Deployment' : isModelOwned(model.id) ? 'Deploy Model' : 'Get Model First'}
            </button>
            <button
              onClick={() => toggleWishlist(model.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                model.wishlisted
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={16} fill={model.wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-xl border bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Share"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => toggleFollowCreator(creator.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isFollowingCreator
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserPlus size={14} />
              {isFollowingCreator ? 'Following' : 'Follow Creator'}
            </button>
          </div>
        </div>
      </section>

      {/* TABS CONTAINER */}
      <section className="mb-6 border-b border-white/5">
        <div className="flex overflow-x-auto gap-2 no-scrollbar">
          {(['overview', 'try', 'reviews', 'community', 'workshop', 'changelog'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-display text-sm font-semibold capitalize border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {tab === 'try' ? 'Try Sandbox' : tab}
            </button>
          ))}
        </div>
      </section>

      {/* TAB CONTENT GRID */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Middle: User scores first, then technical specs */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* USER SCORES (above technical specs) */}
            <div className="rounded-2xl glass-panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-black text-white mb-1">User Scores</h2>
                  <p className="font-sans text-xs text-slate-500">
                    Overall ranking from {model.reviewCount.toLocaleString()} community responses
                  </p>
                </div>
                <div className={`rounded-xl border px-4 py-3 text-center min-w-[180px] ${rankingStyle.bg} ${rankingStyle.border}`}>
                  <span className={`font-display text-sm font-black uppercase tracking-wide ${rankingStyle.text}`}>
                    {reviewRanking.label}
                  </span>
                  <p className="font-sans text-[10px] text-slate-400 mt-1">
                    {reviewRanking.positivePercent}% of {model.reviewCount.toLocaleString()} reviews
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <span className="font-display text-[9px] font-black uppercase tracking-wider text-slate-500">Average Rating</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-display text-3xl font-black text-white">{model.rating}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < Math.round(model.rating) ? 'currentColor' : 'none'}
                            className={i < Math.round(model.rating) ? '' : 'text-slate-600'}
                          />
                        ))}
                      </div>
                      <span className="font-sans text-[10px] text-slate-500 mt-0.5">out of 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <span className="font-display text-[9px] font-black uppercase tracking-wider text-slate-500">Positive</span>
                  <div className="flex items-center gap-2 mt-2">
                    <ThumbsUp size={18} className="text-emerald-400" />
                    <div>
                      <span className="font-display text-2xl font-black text-emerald-400">{reviewRanking.positivePercent}%</span>
                      <p className="font-sans text-[10px] text-slate-500">{positiveReviews.toLocaleString()} reviews</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <span className="font-display text-[9px] font-black uppercase tracking-wider text-slate-500">Negative</span>
                  <div className="flex items-center gap-2 mt-2">
                    <ThumbsDown size={18} className="text-rose-400" />
                    <div>
                      <span className="font-display text-2xl font-black text-rose-400">{100 - reviewRanking.positivePercent}%</span>
                      <p className="font-sans text-[10px] text-slate-500">{negativeReviews.toLocaleString()} reviews</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-[10px] font-sans text-slate-500 mb-1.5">
                  <span>Review sentiment</span>
                  <span>
                    {reviewCountLabel(model.reviewCount)} · {reviewRanking.label}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                  <div
                    className={`h-full bg-gradient-to-r ${rankingStyle.bar}`}
                    style={{ width: `${reviewRanking.positivePercent}%` }}
                  />
                  <div
                    className="h-full bg-rose-500/70"
                    style={{ width: `${100 - reviewRanking.positivePercent}%` }}
                  />
                </div>
              </div>

              {/* Trust / score breakdown */}
              <div className="border-t border-white/5 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-xs font-black text-white flex items-center gap-1.5">
                    <Shield size={14} className="text-cyan-400" />
                    Score Breakdown
                  </span>
                  <span className="font-display font-extrabold text-sm text-cyan-400">{model.trustScore} / 100</span>
                </div>
                <div className="flex flex-col gap-3">
                  {([
                    ['Community ratings', model.trustBreakdown.community],
                    ['Performance', model.trustBreakdown.performance],
                    ['Documentation', model.trustBreakdown.documentation],
                    ['Reliability', model.trustBreakdown.reliability],
                    ['Creator reputation', model.trustBreakdown.creator]
                  ] as const).map(([label, score]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-sans text-slate-400">{label}</span>
                        <span className="font-display font-bold text-slate-200">{score}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl glass-panel p-6">
              <h2 className="font-display text-lg font-black text-white mb-4">About this model</h2>
              <p className="font-sans text-sm text-slate-300 leading-relaxed mb-6">
                {model.longDescription}
              </p>
              
              <h3 className="font-display text-sm font-bold text-white mb-3">Model Core Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-sans text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> High-fidelity output templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Low VRAM budget configurations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Verified safety guards scanned
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Active Community Workshop support
                </li>
              </ul>
            </div>

            {/* TECHNICAL SPECS (below user scores) */}
            <div className="rounded-2xl glass-panel p-6">
              <h2 className="font-display text-lg font-black text-white mb-1">Technical Specs</h2>
              <p className="font-sans text-xs text-slate-500 mb-5">Benchmarks and hardware requirements</p>

              <h3 className="font-display text-sm font-bold text-white mb-4">Performance Metrics</h3>
              <div className="flex flex-col gap-4 mb-8">
                {model.benchmarks.map((bench) => (
                  <div key={bench.name}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-sans font-bold text-slate-300">{bench.name}</span>
                      <span className="font-display font-extrabold text-cyan-400">{bench.score} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                        style={{ width: `${bench.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-3 mb-8">
                <span className="font-display text-[9px] font-black text-slate-500 uppercase">Competitive Standings</span>
                <h4 className="font-display text-xs font-bold text-white">Fidelity Comparison vs Competing Models</h4>
                
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="text-slate-300">{model.name} (Current)</span>
                    <span className="font-bold text-cyan-400">92.4% Average</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="text-slate-500">Industry baseline 70B</span>
                    <span className="font-bold text-slate-500">89.1% Average</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="text-slate-500">Alternative Diffusion Fast</span>
                    <span className="font-bold text-slate-500">81.6% Average</span>
                  </div>
                </div>
              </div>

              <h3 className="font-display text-sm font-bold text-white mb-4">System Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-display text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">MINIMUM SPECIFICATIONS</h4>
                  <ul className="flex flex-col gap-2 text-xs font-sans text-slate-300">
                    <li><strong className="text-slate-500">GPU:</strong> {model.systemRequirements.minimum.gpu}</li>
                    <li><strong className="text-slate-500">VRAM:</strong> {model.systemRequirements.minimum.vram}</li>
                    <li><strong className="text-slate-500">RAM:</strong> {model.systemRequirements.minimum.ram}</li>
                    <li><strong className="text-slate-500">Disk Space:</strong> {model.systemRequirements.minimum.storage}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">RECOMMENDED SPECIFICATIONS</h4>
                  <ul className="flex flex-col gap-2 text-xs font-sans text-slate-300">
                    <li><strong className="text-slate-500">GPU:</strong> {model.systemRequirements.recommended.gpu}</li>
                    <li><strong className="text-slate-500">VRAM:</strong> {model.systemRequirements.recommended.vram}</li>
                    <li><strong className="text-slate-500">RAM:</strong> {model.systemRequirements.recommended.ram}</li>
                    <li><strong className="text-slate-500">Disk Space:</strong> {model.systemRequirements.recommended.storage}</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                <CheckCircle className="text-emerald-400 shrink-0" size={18} />
                <div className="flex flex-col text-left">
                  <span className="font-display text-xs font-bold text-slate-200">Your system can run this model</span>
                  <p className="font-sans text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Detected: Nvidia RTX 3070 with 8 GB VRAM. Compiles comfortably for local hardware.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar purchase / details panels */}
          <div className="flex flex-col gap-6">
            {/* Pricing Panel */}
            <div className="rounded-2xl glass-panel border-cyan-500/10 p-6 flex flex-col gap-4 shadow-xl">
              <span className="font-display text-[9px] font-black tracking-wider text-cyan-400 uppercase">PRICING TIERS</span>
              
              {/* Local */}
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-1.5 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-white">Local Integration</span>
                  <span className="font-display text-xs font-black text-cyan-400">{model.pricingDetails.local}</span>
                </div>
                <p className="font-sans text-[10px] text-slate-400 leading-relaxed">
                  Download weights to your local hardware. Compile offline, zero host rates.
                </p>
                {model.installed ? (
                  <span className="font-sans text-[9px] text-emerald-400 mt-2 font-bold flex items-center gap-1">
                    ✓ Installed on Disk ({model.sizeOnDisk})
                  </span>
                ) : (
                  <button
                    onClick={() => openGetModelModal(model.id)}
                    className="mt-3 w-full rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 py-1.5 font-display text-[10px] font-black text-slate-200 uppercase cursor-pointer"
                  >
                    Install Locally
                  </button>
                )}
              </div>

              {/* Cloud */}
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-1.5 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-white">Cloud Hosting</span>
                  <span className="font-display text-xs font-black text-white">{model.pricingDetails.cloud}</span>
                </div>
                <p className="font-sans text-[10px] text-slate-400 leading-relaxed">
                  Utilize ModelVerse server farms. API endpoints active, zero GPU overhead.
                </p>
                <button
                  onClick={() => addToast('API active. Client headers keys refreshed.', 'success')}
                  className="mt-3 w-full rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 py-1.5 font-display text-[10px] font-black text-slate-200 uppercase cursor-pointer"
                >
                  Generate API Keys
                </button>
              </div>

              {/* Pro */}
              {model.pricingDetails.pro && (
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-1.5 hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-white">Pro Membership</span>
                    <span className="font-display text-xs font-black text-white">{model.pricingDetails.pro}</span>
                  </div>
                  <p className="font-sans text-[10px] text-slate-400 leading-relaxed">
                    Unlimited API generation blocks, priority server routing.
                  </p>
                  <button
                    onClick={() => openGetModelModal(model.id)}
                    className="mt-3 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 py-2 font-display text-[10px] font-black text-slate-950 uppercase cursor-pointer"
                  >
                    Subscribe Pro
                  </button>
                </div>
              )}
            </div>

            {/* Compact review ranking card in sidebar */}
            <div className={`rounded-2xl border p-5 ${rankingStyle.bg} ${rankingStyle.border}`}>
              <span className="font-display text-[9px] font-black uppercase tracking-wider text-slate-500">Overall Reviews</span>
              <p className={`font-display text-xl font-black mt-1 ${rankingStyle.text}`}>{reviewRanking.label}</p>
              <p className="font-sans text-xs text-slate-400 mt-1">
                {reviewRanking.positivePercent}% of the {model.reviewCount.toLocaleString()} user reviews for this model are positive
              </p>
              <button
                onClick={() => setActiveTab('reviews')}
                className="mt-4 w-full rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 py-2 font-display text-[10px] font-black text-slate-200 uppercase cursor-pointer transition-all"
              >
                Read Reviews
              </button>
            </div>

            {/* Trust badges */}
            <div className="rounded-2xl glass-panel p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-display text-xs font-black text-white flex items-center gap-1.5">
                  <Shield size={16} className="text-cyan-400" />
                  Model Trust Score
                </span>
                <span className="font-display font-extrabold text-sm text-cyan-400">{model.trustScore} / 100</span>
              </div>

              <div className="border-t-0 flex flex-col gap-2 text-xs font-sans text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle size={14} /> Creator Verified
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle size={14} /> Reproducible Benchmarks
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle size={14} /> Security Scanned
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle size={14} /> Community Tested
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRY SANDBOX TAB */}
      {activeTab === 'try' && (
        <div className="rounded-2xl glass-panel p-1">
          <TryModel embedMode={true} presetModelId={model.id} />
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main reviews list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-display text-lg font-black text-white mb-2">User Reviews</h2>
            {modelReviews.length === 0 ? (
              <div className="rounded-2xl glass-panel p-8 text-center text-slate-500 text-sm">
                No reviews yet. Share your experience under the Community tab!
              </div>
            ) : (
              modelReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl glass-panel p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#252836] flex items-center justify-center text-sm">
                        {rev.authorAvatar}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-sans text-xs font-bold text-slate-200">{rev.author}</span>
                        <span className="font-sans text-[9px] text-slate-500">{rev.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      <ThumbsUp size={12} fill="currentColor" />
                      Recommended
                    </div>
                  </div>
                  <p className="font-sans text-xs text-slate-300 leading-relaxed">
                    {rev.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* review summary bar */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl glass-panel p-6">
              <h3 className="font-display text-sm font-black mb-4 uppercase tracking-wider text-slate-400">Review Summary</h3>

              <div className={`rounded-xl border px-4 py-3 mb-5 ${rankingStyle.bg} ${rankingStyle.border}`}>
                <span className={`font-display text-base font-black ${rankingStyle.text}`}>
                  {reviewRanking.label}
                </span>
                <p className="font-sans text-[11px] text-slate-400 mt-1">
                  {reviewRanking.positivePercent}% of the {model.reviewCount.toLocaleString()} user reviews for this model are positive
                </p>
                <p className="font-sans text-[10px] text-slate-500 mt-1">
                  {model.reviewCount > 500
                    ? 'More than 500 responses — high-confidence ranking'
                    : 'Under 500 responses — standard ranking'}
                </p>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="font-display text-4xl font-black text-white">{model.rating}</span>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.round(model.rating) ? 'currentColor' : 'none'}
                        className={i < Math.round(model.rating) ? '' : 'text-slate-600'}
                      />
                    ))}
                  </div>
                  <span className="font-sans text-xs text-slate-400 mt-1">Based on {model.reviewCount.toLocaleString()} users</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 font-sans text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5"><ThumbsUp size={12} className="text-emerald-400" /> Positive</span>
                  <span className="font-bold text-emerald-400">{reviewRanking.positivePercent}% ({positiveReviews.toLocaleString()})</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5"><ThumbsDown size={12} className="text-rose-400" /> Negative</span>
                  <span className="font-bold text-rose-400">{100 - reviewRanking.positivePercent}% ({negativeReviews.toLocaleString()})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex mt-1">
                  <div className={`h-full bg-gradient-to-r ${rankingStyle.bar}`} style={{ width: `${reviewRanking.positivePercent}%` }} />
                  <div className="h-full bg-rose-500/70" style={{ width: `${100 - reviewRanking.positivePercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMUNITY TAB */}
      {activeTab === 'community' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-white">Discussions & Guide Board</h2>
            <button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 font-display text-xs font-black text-slate-950 cursor-pointer transition-all"
            >
              {showNewPostForm ? 'Cancel Post' : 'New Community Post'}
            </button>
          </div>

          {/* Add Post Form */}
          {showNewPostForm && (
            <form onSubmit={handlePostSubmit} className="rounded-2xl glass-panel p-6 flex flex-col gap-4 animate-slide-up">
              <h3 className="font-display text-sm font-bold text-white">Publish to {model.name} Community Hub</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-slate-400 font-semibold">Post Title</label>
                  <input
                    type="text"
                    placeholder="E.g., Troubleshooting local RTX cards..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="rounded-lg glass-input px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-slate-400 font-semibold">Category</label>
                  <select
                    value={newPostCategory}
                    onChange={(e: any) => setNewPostCategory(e.target.value)}
                    className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Discussions">Discussion / Q&A</option>
                    <option value="Creations">Art & creations</option>
                    <option value="Guides">Guide / Tutorial</option>
                    <option value="Screenshots">Visual Showcase</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs text-slate-400 font-semibold">Description / Post Content</label>
                <textarea
                  placeholder="Share details, code snippets, or configuration parameters..."
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="rounded-lg glass-input px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 font-display text-xs font-black self-end cursor-pointer"
              >
                Submit Post
              </button>
            </form>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modelPosts.length === 0 ? (
              <div className="rounded-2xl glass-panel p-8 text-center text-slate-500 text-sm col-span-2">
                No discussion threads found. Click New Community Post to create one!
              </div>
            ) : (
              modelPosts.map((post) => (
                <div key={post.id} className="rounded-2xl glass-panel p-5 flex flex-col justify-between hover:border-white/10 transition-all">
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

                    {post.imageUrl && (
                      <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
                        <img src={post.imageUrl} alt="post visual" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-[#252836] flex items-center justify-center text-[10px]">
                        {post.authorAvatar}
                      </div>
                      <span className="font-sans text-[10px] text-slate-300 font-bold">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} /> {post.replies} replies
                      </span>
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* WORKSHOP TAB */}
      {activeTab === 'workshop' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-lg font-black text-white">Community Addons & Fine-tunes</h2>
            <p className="font-sans text-xs text-slate-400 mt-1">Download LoRAs, prompts, presets, and pipelines created for {model.name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modelWorkshop.length === 0 ? (
              <div className="rounded-2xl glass-panel p-8 text-center text-slate-500 text-sm col-span-4">
                No workshop items discovered for this model yet.
              </div>
            ) : (
              modelWorkshop.map((w) => (
                <div key={w.id} className="group bg-[#0b0c10]/40 rounded-2xl p-4 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between">
                  <div>
                    {/* card artwork */}
                    <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${w.artwork} p-3 flex flex-col justify-between mb-3 relative overflow-hidden`}>
                      <span className="rounded bg-black/40 px-1.5 py-0.5 font-display text-[8px] font-bold text-slate-200 self-start uppercase backdrop-blur-sm">
                        {w.category}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-sm text-white mb-0.5 group-hover:text-cyan-400 transition-colors">
                      {w.title}
                    </h3>
                    <span className="font-sans text-[9px] text-slate-500 block mb-2">by {w.author}</span>
                    <p className="font-sans text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {w.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-500 font-semibold">
                      {(w.subscribers / 1000).toFixed(0)}k subs
                    </span>
                    <button
                      onClick={() => toggleSubscribeWorkshop(w.id)}
                      className={`px-3 py-1.5 rounded-lg font-display text-[10px] font-bold cursor-pointer transition-all ${
                        w.subscribed
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {w.subscribed ? 'Subscribed ✓' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CHANGELOG TAB */}
      {activeTab === 'changelog' && (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <h2 className="font-display text-lg font-black text-white">Changelog & Version History</h2>
          
          <div className="relative border-l-2 border-white/5 pl-6 ml-2 flex flex-col gap-8">
            {mockChangelogs.map((log) => (
              <div key={log.version} className="relative">
                {/* pulsing timeline node */}
                <span className="absolute -left-[33px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0b0c10] border-2 border-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                </span>
                
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display text-base font-black text-white">{log.version}</span>
                  <span className="font-sans text-[10px] text-slate-500">{log.date}</span>
                </div>
                
                <ul className="flex flex-col gap-1.5 list-disc pl-4 text-xs font-sans text-slate-400">
                  {log.changes.map((change, cIdx) => (
                    <li key={cIdx}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
