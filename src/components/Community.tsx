import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CommunityPost } from '../data/mockData';
import { Users, Search, MessageSquare, ThumbsUp, PlusCircle } from 'lucide-react';

export const Community: React.FC = () => {
  const {
    posts,
    models,
    addCommunityPost,
    addToast,
    setSelectedModelId,
    setView
  } = useApp();

  const [activeModelFilter, setActiveModelFilter] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchVal, setSearchVal] = useState<string>('');

  // Post form states
  const [showForm, setShowForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('Discussions');
  const [postModelId, setPostModelId] = useState<string>(models[0]?.id || 'pixelforge-xl');

  const categories = ['All', 'Discussions', 'Creations', 'Guides', 'Screenshots', 'Reviews'];

  // Filter posts
  const filteredPosts = posts
    .filter((p) => activeModelFilter === 'All' || p.modelId === activeModelFilter)
    .filter((p) => activeCategory === 'All' || p.category === activeCategory)
    .filter((p) =>
      p.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.content.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.modelName.toLowerCase().includes(searchVal.toLowerCase())
    );

  const handlePostModelClick = (mId: string) => {
    setSelectedModelId(mId);
    setView('model-detail');
  };

  const handleLike = (_id: string) => {
    addToast('Post liked!', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      addToast('Please fill out all fields', 'warning');
      return;
    }
    const modelName = models.find((m) => m.id === postModelId)?.name || 'Model';
    addCommunityPost(postModelId, modelName, postCategory, postTitle, postContent);
    setPostTitle('');
    setPostContent('');
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in text-left select-none">
      {/* 1. COMMUNITY HERO */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-teal-950/20 to-cyan-950/15 p-6 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded bg-teal-500/10 border border-teal-500/25 px-2.5 py-0.5 font-display text-[10px] font-extrabold tracking-wider text-teal-400 uppercase">
            <Users size={12} /> GLOBAL COMMUNITY HUB
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white mt-2">
            ModelVerse Hubs
          </h1>
          <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed mt-2.5">
            Discuss architectures, share visual creations, post fine-tuning configurations, write helper guides, and review model parameters with global developers.
          </p>
        </div>
        <div className="relative w-40 h-40 hidden md:flex items-center justify-center shrink-0">
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-teal-600/20 to-cyan-600/10 blur-xl animate-float"></div>
          <Users size={64} className="text-teal-400/40 relative z-10" />
        </div>
      </section>

      {/* 2. CONTROLS HUB */}
      <section className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Left Side: Category Filter Chips */}
        <div className="flex overflow-x-auto gap-1.5 w-full lg:w-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg font-display text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Side: Model Filter + Search + Post Trigger */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          {/* Model Filter */}
          <select
            value={activeModelFilter}
            onChange={(e) => setActiveModelFilter(e.target.value)}
            className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 font-display text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="All">All Model Hubs</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} Hub
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search community posts..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-lg glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* New Post Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 font-display text-xs font-black flex items-center gap-1 cursor-pointer transition-all shrink-0 uppercase"
          >
            <PlusCircle size={14} />
            Write Post
          </button>
        </div>
      </section>

      {/* 3. POST FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl glass-panel p-6 flex flex-col gap-4 animate-slide-up">
          <h2 className="font-display text-sm font-bold text-white">Create a Community Post</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs text-slate-400 font-semibold">Post Title</label>
              <input
                type="text"
                placeholder="E.g., Fine-tuning checkpoints issue..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="rounded-lg glass-input px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs text-slate-400 font-semibold">Category Type</label>
              <select
                value={postCategory}
                onChange={(e: any) => setPostCategory(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Discussions">Discussion / Q&A</option>
                <option value="Creations">Community Creations</option>
                <option value="Guides">Guide / Documentation</option>
                <option value="Screenshots">Visual Galleries</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs text-slate-400 font-semibold">Linked AI Model</label>
              <select
                value={postModelId}
                onChange={(e) => setPostModelId(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-sans text-xs text-slate-400 font-semibold">Content Text</label>
            <textarea
              placeholder="What details would you like to share with the model hub?..."
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="rounded-lg glass-input p-3 text-xs text-white leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-display text-xs font-black px-5 py-2 self-end cursor-pointer transition-all"
          >
            Submit
          </button>
        </form>
      )}

      {/* 4. POSTS DISPLAY LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-white/5 py-16 text-center text-slate-500 text-sm">
            No threads located matching search configurations.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group rounded-2xl glass-panel p-5 flex flex-col justify-between hover:border-white/10 transition-all steam-card"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-500/10 px-2 py-0.5 font-display text-[9px] font-bold text-teal-400 uppercase tracking-wide">
                      {post.category}
                    </span>
                    <span
                      onClick={() => handlePostModelClick(post.modelId)}
                      className="font-sans text-[10px] text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      For {post.modelName}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] text-slate-500 shrink-0">{post.timeAgo}</span>
                </div>

                <h3 className="font-display font-black text-sm text-white mb-2 leading-snug group-hover:text-teal-400 transition-colors">
                  {post.title}
                </h3>
                <p className="font-sans text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-white/5">
                    <img src={post.imageUrl} alt="creation print" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#252836] flex items-center justify-center text-xs text-slate-300 ring-1 ring-white/10">
                    {post.authorAvatar}
                  </div>
                  <span className="font-sans text-xs font-bold text-slate-300">{post.author}</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-teal-400 cursor-pointer transition-all"
                  >
                    <ThumbsUp size={12} />
                    {post.likes}
                  </button>
                  <span className="flex items-center gap-1 text-[11px]">
                    <MessageSquare size={12} />
                    {post.replies} replies
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
