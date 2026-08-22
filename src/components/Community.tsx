import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CommunityPost } from '../data/mockData';
import {
  Users,
  Search,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  PlusCircle,
  Send,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircle
} from 'lucide-react';

export const Community: React.FC = () => {
  const {
    posts,
    models,
    addCommunityPost,
    voteCommunityPost,
    addPostComment,
    votePostComment,
    addToast,
    setSelectedModelId,
    setView
  } = useApp();

  const [activeModelFilter, setActiveModelFilter] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchVal, setSearchVal] = useState<string>('');

  // Post creation form state
  const [showForm, setShowForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('Discussions');
  const [postModelId, setPostModelId] = useState<string>(models[0]?.id || 'deepseek-r1');

  // Expanded comments accordion state per post ID
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-1': true // Expand first post's comments by default for great discoverability
  });

  // Comment input per post ID
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

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

  const handlePostVote = (postId: string, voteType: 'like' | 'dislike') => {
    voteCommunityPost(postId, voteType);
  };

  const handleCommentVote = (postId: string, commentId: string, voteType: 'like' | 'dislike') => {
    votePostComment(postId, commentId, voteType);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = (postId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = (commentInputs[postId] || '').trim();
    if (!text) {
      addToast('Please enter a comment message.', 'warning');
      return;
    }
    addPostComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    // Ensure comments section is open
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      addToast('Please fill out both title and content fields', 'warning');
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
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-teal-950/25 via-slate-900/60 to-cyan-950/20 p-6 md:p-10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded bg-teal-500/10 border border-teal-500/25 px-2.5 py-0.5 font-display text-[10px] font-extrabold tracking-wider text-teal-400 uppercase">
            <Users size={12} /> GLOBAL COMMUNITY HUB
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white mt-1.5">
            Agora Developer Community
          </h1>
          <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed mt-2">
            Share benchmarks, exchange deployment guides, post model architecture reviews, and join discussions with real-time comments, likes, and feedback.
          </p>
        </div>
        <div className="relative w-36 h-36 hidden md:flex items-center justify-center shrink-0">
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-teal-500/20 to-cyan-500/10 blur-xl animate-float"></div>
          <Users size={58} className="text-teal-400/50 relative z-10" />
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
                  ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-sm shadow-teal-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Side: Model Filter + Search + Post Trigger */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          {/* Model Filter */}
          <select
            value={activeModelFilter}
            onChange={(e) => setActiveModelFilter(e.target.value)}
            className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 font-display text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
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
              placeholder="Search posts or topics..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-xl glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* New Post Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 font-display text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shrink-0 uppercase shadow-lg shadow-teal-500/20"
          >
            <PlusCircle size={14} />
            Write Post
          </button>
        </div>
      </section>

      {/* 3. CREATE POST FORM */}
      {showForm && (
        <form onSubmit={handleCreatePost} className="mb-10 rounded-2xl glass-panel p-6 flex flex-col gap-4 border border-teal-500/30 animate-slide-up shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle size={16} className="text-teal-400" /> Create a Developer Community Post
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-slate-400 font-semibold">Post Title</label>
              <input
                type="text"
                placeholder="E.g., vLLM Token Latency on RTX 4090..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="rounded-xl glass-input px-3.5 py-2 text-xs text-white focus:border-teal-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-slate-400 font-semibold">Category</label>
              <select
                value={postCategory}
                onChange={(e: any) => setPostCategory(e.target.value)}
                className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Discussions">Discussions / Q&A</option>
                <option value="Creations">Creations & Prompts</option>
                <option value="Guides">Guides & Tutorials</option>
                <option value="Screenshots">Visual Galleries</option>
                <option value="Reviews">Reviews & Benchmarks</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-slate-400 font-semibold">Linked AI Model</label>
              <select
                value={postModelId}
                onChange={(e) => setPostModelId(e.target.value)}
                className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs text-slate-400 font-semibold">Post Content</label>
            <textarea
              placeholder="Share architectural details, benchmark numbers, prompt configurations, or reproduction steps..."
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="rounded-xl glass-input p-3.5 text-xs text-white leading-relaxed focus:border-teal-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-display text-xs font-bold px-4 py-2 cursor-pointer transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-display text-xs font-black px-6 py-2 cursor-pointer transition-all shadow-md shadow-teal-500/20"
            >
              Publish Post
            </button>
          </div>
        </form>
      )}

      {/* 4. POSTS DISPLAY LIST */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/5 py-16 text-center text-slate-500 text-sm">
            No threads located matching your filters.
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = !!expandedComments[post.id];
            const postComments = post.comments || [];
            const commentCount = postComments.length;

            return (
              <div
                key={post.id}
                className="rounded-2xl glass-panel p-6 flex flex-col border border-white/5 hover:border-white/10 transition-all shadow-lg"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 font-display text-[9px] font-bold text-teal-300 uppercase tracking-wide">
                      {post.category}
                    </span>
                    <button
                      onClick={() => handlePostModelClick(post.modelId)}
                      className="font-sans text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded"
                    >
                      <BookOpen size={11} className="text-teal-400/70" /> {post.modelName}
                    </button>
                  </div>
                  <span className="font-sans text-[11px] text-slate-500">{post.timeAgo}</span>
                </div>

                {/* Post Title & Content */}
                <h3 className="font-display font-black text-base md:text-lg text-white mb-2 leading-snug">
                  {post.title}
                </h3>
                <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Optional Image */}
                {post.imageUrl && (
                  <div className="w-full max-h-80 rounded-xl overflow-hidden mb-4 border border-white/5">
                    <img src={post.imageUrl} alt="creation print" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Post Author & Interactive Actions Bar */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2 flex-wrap gap-3">
                  {/* Author Profile */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-300 ring-1 ring-white/10">
                      {post.authorAvatar}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-xs font-bold text-slate-200">{post.author}</span>
                      <span className="font-sans text-[10px] text-slate-500">Verified Agora Member</span>
                    </div>
                  </div>

                  {/* Actions: Likes, Dislikes, Comment Toggle */}
                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button
                      onClick={() => handlePostVote(post.id, 'like')}
                      title="Like this post"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold border transition-all cursor-pointer ${
                        post.userVote === 'like'
                          ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-sm shadow-teal-500/20'
                          : 'bg-white/[0.04] border-white/5 text-slate-400 hover:text-teal-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <ThumbsUp size={13} className={post.userVote === 'like' ? 'fill-teal-400 text-teal-400' : ''} />
                      <span>{post.likes}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      onClick={() => handlePostVote(post.id, 'dislike')}
                      title="Dislike this post"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold border transition-all cursor-pointer ${
                        post.userVote === 'dislike'
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-500/20'
                          : 'bg-white/[0.04] border-white/5 text-slate-400 hover:text-rose-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <ThumbsDown size={13} className={post.userVote === 'dislike' ? 'fill-rose-400 text-rose-400' : ''} />
                      <span>{post.dislikes || 0}</span>
                    </button>

                    {/* Toggle Comments Section Button */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold border transition-all cursor-pointer ${
                        isCommentsOpen
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/[0.04] border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <MessageSquare size={13} />
                      <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
                      {isCommentsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* 5. EXPANDABLE COMMENTS SECTION */}
                {isCommentsOpen && (
                  <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <MessageCircle size={14} className="text-teal-400" />
                        Discussion Thread ({commentCount})
                      </h4>
                      <span className="font-sans text-[10px] text-slate-500">
                        Join the community conversation
                      </span>
                    </div>

                    {/* Add Comment Input Form */}
                    <form
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                      className="flex items-center gap-2 bg-slate-900/80 rounded-xl p-1.5 border border-white/10 focus-within:border-teal-500/50 transition-all"
                    >
                      <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs shrink-0 font-bold ml-1">
                        💬
                      </div>
                      <input
                        type="text"
                        placeholder="Write a comment or share your findings... (Press Enter to send)"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))
                        }
                        className="flex-grow bg-transparent border-none px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!(commentInputs[post.id] || '').trim()}
                        className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-sm shadow-teal-500/20"
                      >
                        <Send size={12} />
                        Comment
                      </button>
                    </form>

                    {/* Comments List */}
                    <div className="flex flex-col gap-3 mt-1">
                      {postComments.length === 0 ? (
                        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center text-slate-500 text-xs">
                          No comments on this post yet. Be the first to start the discussion!
                        </div>
                      ) : (
                        postComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-3.5 flex flex-col gap-2 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] ring-1 ring-white/10">
                                  {comment.authorAvatar}
                                </div>
                                <span className="font-sans text-xs font-bold text-slate-200">{comment.author}</span>
                              </div>
                              <span className="font-sans text-[10px] text-slate-500">{comment.timeAgo}</span>
                            </div>

                            <p className="font-sans text-xs text-slate-300 leading-relaxed pl-7">
                              {comment.content}
                            </p>

                            {/* Comment Votes */}
                            <div className="flex items-center gap-2 pl-7 pt-1">
                              <button
                                onClick={() => handleCommentVote(post.id, comment.id, 'like')}
                                title="Like this comment"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-sans text-[11px] font-semibold border transition-all cursor-pointer ${
                                  comment.userVote === 'like'
                                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                                    : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-teal-300 hover:bg-white/[0.06]'
                                }`}
                              >
                                <ThumbsUp size={11} className={comment.userVote === 'like' ? 'fill-teal-400 text-teal-400' : ''} />
                                <span>{comment.likes}</span>
                              </button>

                              <button
                                onClick={() => handleCommentVote(post.id, comment.id, 'dislike')}
                                title="Dislike this comment"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-sans text-[11px] font-semibold border transition-all cursor-pointer ${
                                  comment.userVote === 'dislike'
                                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                                    : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-rose-300 hover:bg-white/[0.06]'
                                }`}
                              >
                                <ThumbsDown size={11} className={comment.userVote === 'dislike' ? 'fill-rose-400 text-rose-400' : ''} />
                                <span>{comment.dislikes || 0}</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

