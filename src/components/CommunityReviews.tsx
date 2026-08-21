import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { Model } from '../data/mockData';
import type { ModelReview } from '../types/reviews';
import { ReviewService, calculateReviewSummary } from '../services/ReviewService';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  LogIn,
  AlertCircle
} from 'lucide-react';

interface CommunityReviewsProps {
  model: Model;
}

type SortOption = 'most-helpful' | 'most-recent' | 'positive' | 'negative';
type FilterOption = 'all' | 'positive' | 'negative' | '5-star' | '4-star' | '3-star' | '2-star' | '1-star';

export const CommunityReviews: React.FC<CommunityReviewsProps> = ({ model }) => {
  const { user, profile, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useApp();

  const [reviews, setReviews] = useState<ModelReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'helpful' | 'unhelpful'>>({});

  // Review Form State
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formRecommended, setFormRecommended] = useState<boolean>(true);
  const [formText, setFormText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortOption>('most-helpful');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Load reviews for this model
  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ReviewService.getReviewsForModel(model.id);
      setReviews(data);

      // Load user votes
      const votes: Record<string, 'helpful' | 'unhelpful'> = {};
      data.forEach((r) => {
        const v = ReviewService.getUserVote(r.id);
        if (v) votes[r.id] = v;
      });
      setUserVotes(votes);
    } catch (e) {
      console.warn('Error loading reviews:', e);
    } finally {
      setIsLoading(false);
    }
  }, [model.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Identify current user's review if it exists
  const userReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => r.user_id === user.id) || null;
  }, [reviews, user]);

  // Pre-fill form if editing
  const handleStartEdit = () => {
    if (!userReview) return;
    setFormRating(userReview.rating);
    setFormRecommended(userReview.recommended);
    setFormText(userReview.review_text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormRating(5);
    setFormRecommended(true);
    setFormText('');
  };

  // Submit new review or update existing
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      openAuthModal('login');
      return;
    }

    if (!formText.trim()) {
      addToast('Please write a few words about your experience with this model.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && userReview) {
        // Update existing review
        const result = await ReviewService.updateReview({
          reviewId: userReview.id,
          userId: user.id,
          rating: formRating,
          recommended: formRecommended,
          reviewText: formText
        });

        if (result.success) {
          addToast('Your review has been updated!', 'success');
          setIsEditing(false);
          await loadReviews();
        } else {
          addToast(result.error || 'Failed to update review.', 'error');
        }
      } else {
        // Create new review
        const result = await ReviewService.createReview({
          modelId: model.id,
          userId: user.id,
          rating: formRating,
          recommended: formRecommended,
          reviewText: formText,
          userProfile: {
            username: profile?.username || user.email?.split('@')[0] || 'developer',
            display_name: profile?.display_name || user.email?.split('@')[0] || 'Developer',
            avatar_url: profile?.avatar_url || '🤖',
            is_creator: profile?.is_creator || false
          }
        });

        if (result.success) {
          addToast('Thank you! Your Steam-style review is now live.', 'success');
          setFormText('');
          setFormRating(5);
          setFormRecommended(true);
          await loadReviews();
        } else {
          addToast(result.error || 'Failed to post review.', 'error');
        }
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async () => {
    if (!user || !userReview) return;
    setIsSubmitting(true);
    try {
      const result = await ReviewService.deleteReview(userReview.id, user.id);
      if (result.success) {
        addToast('Your review has been deleted.', 'info');
        setShowDeleteConfirm(false);
        setIsEditing(false);
        await loadReviews();
      } else {
        addToast(result.error || 'Failed to delete review.', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Could not delete review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpful vote
  const handleVote = async (reviewId: string, voteType: 'helpful' | 'unhelpful') => {
    if (!isAuthenticated) {
      addToast('Please sign in to vote on reviews.', 'info');
      openAuthModal('login');
      return;
    }

    try {
      const res = await ReviewService.voteHelpful(reviewId, voteType);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpful_count: res.helpfulCount,
                  unhelpful_count: res.unhelpfulCount
                }
              : r
          )
        );

        setUserVotes((prev) => {
          const next = { ...prev };
          if (res.userVote) {
            next[reviewId] = res.userVote;
          } else {
            delete next[reviewId];
          }
          return next;
        });
      }
    } catch (err) {
      console.warn('Error voting:', err);
    }
  };

  // Calculate live summary from actual review list
  const summary = useMemo(() => {
    return calculateReviewSummary(reviews);
  }, [reviews]);

  // Filter & Sort reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter
    if (filterBy === 'positive') {
      result = result.filter((r) => r.recommended);
    } else if (filterBy === 'negative') {
      result = result.filter((r) => !r.recommended);
    } else if (filterBy === '5-star') {
      result = result.filter((r) => Math.round(r.rating) === 5);
    } else if (filterBy === '4-star') {
      result = result.filter((r) => Math.round(r.rating) === 4);
    } else if (filterBy === '3-star') {
      result = result.filter((r) => Math.round(r.rating) === 3);
    } else if (filterBy === '2-star') {
      result = result.filter((r) => Math.round(r.rating) === 2);
    } else if (filterBy === '1-star') {
      result = result.filter((r) => Math.round(r.rating) === 1);
    }

    // Sort
    if (sortBy === 'most-helpful') {
      result.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
    } else if (sortBy === 'most-recent') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'positive') {
      result.sort((a, b) => (b.recommended === a.recommended ? 0 : b.recommended ? 1 : -1));
    } else if (sortBy === 'negative') {
      result.sort((a, b) => (b.recommended === a.recommended ? 0 : !b.recommended ? 1 : -1));
    }

    return result;
  }, [reviews, filterBy, sortBy]);

  // Render Stars helper
  const renderStars = (rating: number, max = 5, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const isFilled = i < Math.floor(rating);
          const isHalf = !isFilled && i < rating;
          return (
            <Star
              key={i}
              size={size}
              className={
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-600'
              }
            />
          );
        })}
      </div>
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="mt-2 rounded-3xl bg-[#0e121a]/90 border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl text-left">
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <MessageSquare size={20} />
          </span>
          <div>
            <h2 className="font-display text-2xl font-black text-white tracking-wide flex items-center gap-2">
              Community Reviews
            </h2>
            <p className="font-sans text-xs text-slate-400">
              Real developer feedback, benchmark impressions, and recommendation telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono font-medium text-slate-300 border border-white/10">
            {summary.totalReviews} Verified {summary.totalReviews === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
      </div>

      {/* 1. STEAM-STYLE COMMUNITY RATING HERO & BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Left 6 Cols: Overall Community Rating & Steam Recommendation Percentage */}
        <div className="lg:col-span-6 rounded-2xl bg-black/40 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400">
                Overall Community Rating
              </span>
              <span
                className={`rounded-lg px-2.5 py-0.5 text-xs font-display font-black border uppercase tracking-wider ${summary.sentimentColor} ${summary.sentimentBg} ${summary.sentimentBorder}`}
              >
                {summary.sentimentLabel}
              </span>
            </div>

            {/* Stars & Big Rating Number */}
            <div className="flex items-baseline gap-4 my-1">
              <span className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">
                {summary.totalReviews > 0 ? summary.averageRating.toFixed(1) : '—'}
              </span>
              <div className="flex flex-col">
                {renderStars(summary.averageRating, 5, 20)}
                <span className="text-[11px] font-sans text-slate-400 mt-1">
                  out of 5.0 stars ({summary.totalReviews.toLocaleString()} {summary.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>

          {/* Primary Steam-style Recommendation Banner */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <ThumbsUp size={20} className="fill-cyan-400/20" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-black text-white">
                    {summary.totalReviews > 0 ? `${summary.recommendationPercentage}%` : '0%'}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">of developers recommend this model</span>
                </div>
                <span className="text-[10px] font-sans text-slate-500 block">
                  {summary.recommendedCount} positive recommendations vs {summary.notRecommendedCount} negative
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Visual Rating Distribution Breakdown */}
        <div className="lg:col-span-6 rounded-2xl bg-black/40 border border-white/10 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400">
                Rating Breakdown
              </span>
              <span className="text-[10px] text-slate-500">Click bar to filter</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {summary.breakdown.map((item) => {
                const isSelected = filterBy === `${item.stars}-star`;
                return (
                  <button
                    key={item.stars}
                    onClick={() => setFilterBy(isSelected ? 'all' : (`${item.stars}-star` as FilterOption))}
                    className={`flex items-center gap-3 text-xs w-full p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                      isSelected ? 'bg-cyan-500/15 border border-cyan-500/30' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="font-mono font-bold text-slate-300 w-7 shrink-0 flex items-center gap-1">
                      {item.stars} <Star size={11} className="text-amber-400 fill-amber-400" />
                    </span>

                    {/* Progress Track */}
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden border border-white/5 relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.stars >= 4
                            ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                            : item.stars === 3
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-rose-500 to-red-600'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>

                    <span className="font-mono text-[11px] text-slate-400 w-16 text-right shrink-0">
                      {item.percentage}% ({item.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. USER'S OWN REVIEW OR WRITE REVIEW SECTION */}
      <div className="mb-10">
        {/* If Authenticated and Has Written a Review and not editing */}
        {isAuthenticated && userReview && !isEditing ? (
          <div className="rounded-2xl bg-gradient-to-b from-cyan-950/20 to-black border border-cyan-500/30 p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                  <CheckCircle2 size={15} />
                </span>
                <span className="font-display text-sm font-black text-white">Your Community Review</span>
                <span className="text-[10px] text-slate-400">• Posted {formatDate(userReview.created_at)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartEdit}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <Edit3 size={13} /> Edit Review
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            {/* User Review Content */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-display font-bold flex items-center gap-1.5 border ${
                    userReview.recommended
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {userReview.recommended ? (
                    <>
                      <ThumbsUp size={13} /> Recommended
                    </>
                  ) : (
                    <>
                      <ThumbsDown size={13} /> Not Recommended
                    </>
                  )}
                </span>

                {renderStars(userReview.rating, 5, 14)}
              </div>

              <p className="font-sans text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-black/40 p-4 rounded-xl border border-white/5">
                {userReview.review_text}
              </p>
            </div>

            {/* Delete Confirmation Modal Overlay */}
            {showDeleteConfirm && (
              <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle size={16} />
                  <span>Are you sure you want to permanently delete your review for {model.name}?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 text-xs hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={isSubmitting}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {isSubmitting ? 'Deleting...' : 'Yes, Delete Review'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isAuthenticated ? (
          /* Review Form (New or Editing) */
          <form
            onSubmit={handleSubmitReview}
            className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 p-6 flex flex-col gap-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="font-display text-base font-black text-white">
                  {isEditing ? 'Edit Your Review' : `Rate and Review ${model.name}`}
                </h3>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Star Rating Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-slate-300">
                  Rate this model
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/60 p-2 rounded-xl border border-white/10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        className="p-1 text-slate-600 hover:text-amber-400 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={22}
                          className={
                            (formHoverRating || formRating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="font-display text-sm font-bold text-slate-200">
                    {formHoverRating || formRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Steam-Style Recommendation Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-slate-300">
                  Would you recommend this model?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormRecommended(true)}
                    className={`py-2.5 px-4 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formRecommended
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-black/40 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <ThumbsUp size={15} className={formRecommended ? 'fill-emerald-400/20' : ''} />
                    👍 Yes (Recommend)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRecommended(false)}
                    className={`py-2.5 px-4 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      !formRecommended
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
                        : 'bg-black/40 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <ThumbsDown size={15} className={!formRecommended ? 'fill-rose-400/20' : ''} />
                    👎 No (Not Recommend)
                  </button>
                </div>
              </div>
            </div>

            {/* Review Text Area */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-slate-300">
                Share your experience with the community
              </label>
              <textarea
                rows={4}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Write your review... Describe inference speed, benchmark accuracy, pricing value, code generation fidelity, or latency."
                className="w-full rounded-xl bg-black/60 border border-white/10 p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : isEditing ? 'Update Review' : 'Post Review'}
              </button>
            </div>
          </form>
        ) : (
          /* Unauthenticated Callout */
          <div className="rounded-2xl bg-gradient-to-r from-cyan-950/30 via-black to-indigo-950/30 border border-cyan-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <LogIn size={20} />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-white">
                  Have you tested {model.name}?
                </h3>
                <p className="font-sans text-xs text-slate-400">
                  Sign in to leave a Steam-style recommendation and help developers choose the best API.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider shrink-0 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Sign In to Review
            </button>
          </div>
        )}
      </div>

      {/* 3. REVIEWS FILTERING & SORTING TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-sans text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => setFilterBy('all')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer ${
              filterBy === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            All ({reviews.length})
          </button>

          <button
            onClick={() => setFilterBy('positive')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterBy === 'positive'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <ThumbsUp size={11} /> Positive ({summary.recommendedCount})
          </button>

          <button
            onClick={() => setFilterBy('negative')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterBy === 'negative'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <ThumbsDown size={11} /> Negative ({summary.notRecommendedCount})
          </button>
        </div>

        {/* Sorts */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1">
            <ArrowUpDown size={12} /> Sort By:
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg bg-black/60 border border-white/10 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
          >
            <option value="most-helpful">Most Helpful</option>
            <option value="most-recent">Most Recent</option>
            <option value="positive">Positive First</option>
            <option value="negative">Negative First</option>
          </select>
        </div>
      </div>

      {/* 4. REVIEWS LIST */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading community reviews...
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-black/30 p-12 text-center flex flex-col items-center gap-3">
            <MessageSquare size={36} className="text-slate-600" />
            <h3 className="font-display text-base font-bold text-white">No community reviews yet.</h3>
            <p className="font-sans text-xs text-slate-400 max-w-sm">
              Be the first to review this model and share your API experience with the community.
            </p>
          </div>
        ) : (
          displayedReviews.map((review) => {
            const hasVotedHelpful = userVotes[review.id] === 'helpful';
            const hasVotedUnhelpful = userVotes[review.id] === 'unhelpful';

            return (
              <div
                key={review.id}
                className="rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 p-5 md:p-6 shadow-lg flex flex-col gap-4 text-left transition-all hover:border-white/20"
              >
                {/* Header: User Profile & Recommendation Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl border border-white/10 shrink-0 shadow-inner">
                      {review.user_profile?.avatar_url || '🤖'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-white">
                          {review.user_profile?.display_name || 'AI Developer'}
                        </span>
                        {review.user_profile?.is_creator && (
                          <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                            Creator
                          </span>
                        )}
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @{review.user_profile?.username || 'developer'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-400/90 font-medium">
                          <Clock size={11} /> {review.usage_hours || 12.4} hrs API usage
                        </span>
                        <span>•</span>
                        <span>Posted {formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Badge (Steam-style) */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-xl px-3 py-1 text-xs font-display font-black flex items-center gap-1.5 border shadow-sm ${
                        review.recommended
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {review.recommended ? (
                        <>
                          <ThumbsUp size={13} className="fill-emerald-400/20" /> Recommended
                        </>
                      ) : (
                        <>
                          <ThumbsDown size={13} className="fill-rose-400/20" /> Not Recommended
                        </>
                      )}
                    </span>

                    {renderStars(review.rating, 5, 13)}
                  </div>
                </div>

                {/* Body: Review Text */}
                <p className="font-sans text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {review.review_text}
                </p>

                {/* Footer: Helpful voting */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-sans">Was this review helpful?</span>

                    <button
                      onClick={() => handleVote(review.id, 'helpful')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                        hasVotedHelpful
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                      }`}
                    >
                      <ThumbsUp size={12} className={hasVotedHelpful ? 'fill-cyan-400' : ''} />
                      Yes ({review.helpful_count || 0})
                    </button>

                    <button
                      onClick={() => handleVote(review.id, 'unhelpful')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                        hasVotedUnhelpful
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                      }`}
                    >
                      <ThumbsDown size={12} className={hasVotedUnhelpful ? 'fill-rose-400' : ''} />
                      No ({review.unhelpful_count || 0})
                    </button>
                  </div>

                  {review.helpful_count > 10 && (
                    <span className="text-[10px] text-amber-400/80 font-medium">
                      ★ Community Highlighted Review
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
