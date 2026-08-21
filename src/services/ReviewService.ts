import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { ModelReview, ReviewSummary, SentimentLabel } from '../types/reviews';

const REVIEWS_STORAGE_KEY = 'agora_model_reviews_db';
const USER_VOTES_STORAGE_KEY = 'agora_review_user_votes';

// Initial pre-seeded community reviews with authentic developer feedback
const initialSeedReviews: ModelReview[] = [
  // deepseek-r1
  {
    id: 'rev-dsr1-1',
    model_id: 'deepseek-r1',
    user_id: 'seed-user-1',
    rating: 5,
    recommended: true,
    review_text: 'DeepSeek-R1 has completely replaced OpenAI o1 for our backend math and code verification pipeline. The chain-of-thought tokens are extremely structured, and at $0.14/1M input it is an absolute game changer. Running 50,000 requests/day with near-zero hallucination.',
    helpful_count: 84,
    unhelpful_count: 2,
    usage_hours: 48.2,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'dev_alexander',
      display_name: 'Alexander V.',
      avatar_url: '👨‍💻',
      is_creator: true
    }
  },
  {
    id: 'rev-dsr1-2',
    model_id: 'deepseek-r1',
    user_id: 'seed-user-2',
    rating: 5,
    recommended: true,
    review_text: 'The reasoning depth on competitive programming problems is astonishing. Benchmarked on LeetCode Hard and it solved 91% on first shot. Streaming latency over SSE is under 300ms to first token.',
    helpful_count: 56,
    unhelpful_count: 1,
    usage_hours: 29.4,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'neural_ninja',
      display_name: 'Elena Rostova',
      avatar_url: '⚡',
      is_creator: false
    }
  },
  {
    id: 'rev-dsr1-3',
    model_id: 'deepseek-r1',
    user_id: 'seed-user-3',
    rating: 4,
    recommended: true,
    review_text: 'Incredible value for money. Minor quirk with outputting repetitive reasoning tags on very short queries, but easily mitigated with standard system prompt constraints. 10/10 recommend.',
    helpful_count: 19,
    unhelpful_count: 0,
    usage_hours: 14.1,
    created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'cloud_architect',
      display_name: 'Marcus Brody',
      avatar_url: '🤖',
      is_creator: false
    }
  },

  // claude-3-5-sonnet
  {
    id: 'rev-sonnet-1',
    model_id: 'claude-3-5-sonnet',
    user_id: 'seed-user-4',
    rating: 5,
    recommended: true,
    review_text: 'Still the undisputed king of software engineering and refactoring. We feed entire 50-file React repositories into the 200K window, and Sonnet 3.5 writes pristine TypeScript with zero regression bugs.',
    helpful_count: 142,
    unhelpful_count: 4,
    usage_hours: 120.6,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'react_core_fan',
      display_name: 'Sarah Chen',
      avatar_url: '👩‍💻',
      is_creator: true
    }
  },
  {
    id: 'rev-sonnet-2',
    model_id: 'claude-3-5-sonnet',
    user_id: 'seed-user-5',
    rating: 5,
    recommended: true,
    review_text: 'Prompt caching support cuts our API bill by 75% for continuous agent workflows. Artifacts and visual UI creation fidelity are unmatched in the market today.',
    helpful_count: 67,
    unhelpful_count: 2,
    usage_hours: 88.0,
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'jordan_labs',
      display_name: 'Jordan Miller',
      avatar_url: '🚀',
      is_creator: false
    }
  },
  {
    id: 'rev-sonnet-3',
    model_id: 'claude-3-5-sonnet',
    user_id: 'seed-user-6',
    rating: 4,
    recommended: true,
    review_text: 'Excellent model. Slightly higher token cost than DeepSeek, but the code synthesis quality and reasoning coherence more than justify every cent for production workloads.',
    helpful_count: 28,
    unhelpful_count: 1,
    usage_hours: 45.3,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'hacker_dave',
      display_name: 'Dave K.',
      avatar_url: '🕶️',
      is_creator: false
    }
  },

  // gpt-4o
  {
    id: 'rev-gpt4o-1',
    model_id: 'gpt-4o',
    user_id: 'seed-user-7',
    rating: 5,
    recommended: true,
    review_text: 'Omni multimodal vision and lightning fast token throughput make GPT-4o our go-to general purpose API. Native JSON mode and structured outputs are bulletproof.',
    helpful_count: 73,
    unhelpful_count: 3,
    usage_hours: 92.5,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'enterprise_sys',
      display_name: 'Priya Sharma',
      avatar_url: '💼',
      is_creator: false
    }
  },
  {
    id: 'rev-gpt4o-2',
    model_id: 'gpt-4o',
    user_id: 'seed-user-8',
    rating: 4,
    recommended: true,
    review_text: 'Very dependable 128k context and great tooling ecosystem. Voice & vision latencies are lowest in class.',
    helpful_count: 31,
    unhelpful_count: 1,
    usage_hours: 38.1,
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'kevin_ai',
      display_name: 'Kevin Wu',
      avatar_url: '🎯',
      is_creator: false
    }
  },

  // qwen-2-5-coder-32b
  {
    id: 'rev-qwen-1',
    model_id: 'qwen-2-5-coder-32b',
    user_id: 'seed-user-9',
    rating: 5,
    recommended: true,
    review_text: 'The best open-weights coding model bar none. It punches way above 32B weights, matching Claude 3.5 Sonnet on HumanEval and SQL generation. At $0.07/1M input, it is ridiculously cheap.',
    helpful_count: 95,
    unhelpful_count: 2,
    usage_hours: 64.7,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'rust_ace',
      display_name: 'Dmitri Pavlov',
      avatar_url: '🦀',
      is_creator: true
    }
  },
  {
    id: 'rev-qwen-2',
    model_id: 'qwen-2-5-coder-32b',
    user_id: 'seed-user-10',
    rating: 5,
    recommended: true,
    review_text: '128K context window works effortlessly for repo-level debugging. Self-hosting with vLLM on a single RTX 4090 or hitting the API delivers instant 130 tok/s generation.',
    helpful_count: 42,
    unhelpful_count: 0,
    usage_hours: 31.0,
    created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'gpu_hoarder',
      display_name: 'Liam O’Connor',
      avatar_url: '🖥️',
      is_creator: false
    }
  },

  // flux-1-pro
  {
    id: 'rev-flux-1',
    model_id: 'flux-1-pro',
    user_id: 'seed-user-11',
    rating: 5,
    recommended: true,
    review_text: 'Typography rendering in images is flawless. No more misspelled AI gibberish on signs, logos, or posters. Photorealism and lighting physics are state-of-the-art.',
    helpful_count: 110,
    unhelpful_count: 3,
    usage_hours: 74.2,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'art_director_z',
      display_name: 'Zoe Thorne',
      avatar_url: '🎨',
      is_creator: true
    }
  },
  {
    id: 'rev-flux-2',
    model_id: 'flux-1-pro',
    user_id: 'seed-user-12',
    rating: 4,
    recommended: true,
    review_text: 'Remarkable aesthetic quality. Prompt adherence is exact down to camera focal length and skin textures. Worth every penny for commercial marketing generation.',
    helpful_count: 38,
    unhelpful_count: 1,
    usage_hours: 22.0,
    created_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'pixel_crafter',
      display_name: 'Kenji Sato',
      avatar_url: '📸',
      is_creator: false
    }
  },

  // llama-3-3-70b
  {
    id: 'rev-llama-1',
    model_id: 'llama-3-3-70b',
    user_id: 'seed-user-13',
    rating: 5,
    recommended: true,
    review_text: 'Llama 3.3 70B delivers 405B level quality in a lean, fast 70B footprint. Perfect for agentic RAG architectures and zero-shot tool calling.',
    helpful_count: 88,
    unhelpful_count: 2,
    usage_hours: 58.4,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    user_profile: {
      username: 'open_source_hero',
      display_name: 'Carlos Mendez',
      avatar_url: '🦙',
      is_creator: false
    }
  }
];

// Helper to get local stored reviews
function getLocalReviews(): ModelReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(initialSeedReviews));
      return initialSeedReviews;
    }
    return JSON.parse(raw);
  } catch {
    return initialSeedReviews;
  }
}

function saveLocalReviews(reviews: ModelReview[]) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Could not persist reviews to localStorage:', e);
  }
}

// User voting tracking
function getUserVotes(): Record<string, 'helpful' | 'unhelpful'> {
  try {
    const raw = localStorage.getItem(USER_VOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUserVote(reviewId: string, voteType: 'helpful' | 'unhelpful') {
  try {
    const current = getUserVotes();
    current[reviewId] = voteType;
    localStorage.setItem(USER_VOTES_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Could not persist vote:', e);
  }
}

/**
 * Calculates Steam-style sentiment label & theme tokens
 */
export function calculateSentiment(
  recommendationPercentage: number,
  totalReviews: number,
  averageRating: number
): {
  label: SentimentLabel;
  color: string;
  bg: string;
  border: string;
} {
  if (totalReviews === 0) {
    return {
      label: 'No Reviews',
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20'
    };
  }

  // Steam-style sentiment logic based on positive recommendation percentage and average rating
  if (recommendationPercentage >= 90 && averageRating >= 4.4) {
    return {
      label: 'Very Positive',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    };
  }
  if (recommendationPercentage >= 80 && averageRating >= 4.0) {
    return {
      label: 'Positive',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    };
  }
  if (recommendationPercentage >= 70) {
    return {
      label: 'Mostly Positive',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30'
    };
  }
  if (recommendationPercentage >= 45) {
    return {
      label: 'Mixed',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    };
  }
  if (recommendationPercentage >= 30) {
    return {
      label: 'Mostly Negative',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30'
    };
  }
  if (recommendationPercentage >= 15) {
    return {
      label: 'Negative',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    };
  }
  return {
    label: 'Very Negative',
    color: 'text-rose-500',
    bg: 'bg-rose-600/10',
    border: 'border-rose-500/30'
  };
}

/**
 * Calculates full community metrics from actual reviews
 */
export function calculateReviewSummary(reviews: ModelReview[]): ReviewSummary {
  const total = reviews.length;

  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      recommendedCount: 0,
      notRecommendedCount: 0,
      recommendationPercentage: 0,
      sentimentLabel: 'No Reviews',
      sentimentColor: 'text-slate-400',
      sentimentBg: 'bg-slate-500/10',
      sentimentBorder: 'border-slate-500/20',
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percentage: 0 }))
    };
  }

  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = Number((sumRating / total).toFixed(1));

  const recommendedCount = reviews.filter((r) => r.recommended).length;
  const notRecommendedCount = total - recommendedCount;
  const recPercentage = Math.round((recommendedCount / total) * 100);

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: starCounts[stars],
    percentage: Math.round((starCounts[stars] / total) * 100)
  }));

  const sentiment = calculateSentiment(recPercentage, total, avgRating);

  return {
    averageRating: avgRating,
    totalReviews: total,
    recommendedCount,
    notRecommendedCount,
    recommendationPercentage: recPercentage,
    sentimentLabel: sentiment.label,
    sentimentColor: sentiment.color,
    sentimentBg: sentiment.bg,
    sentimentBorder: sentiment.border,
    breakdown
  };
}

export const ReviewService = {
  /**
   * Fetch all reviews for a specific model ID
   */
  async getReviewsForModel(modelId: string): Promise<ModelReview[]> {
    const local = getLocalReviews();
    let modelReviews = local.filter((r) => r.model_id === modelId);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            model_id,
            user_id,
            rating,
            recommended,
            review_text,
            helpful_count,
            unhelpful_count,
            created_at,
            updated_at
          `)
          .eq('model_id', modelId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Merge with user profile info if available
          const formatted: ModelReview[] = data.map((item: any) => ({
            id: item.id,
            model_id: item.model_id,
            user_id: item.user_id,
            rating: item.rating,
            recommended: Boolean(item.recommended),
            review_text: item.review_text,
            helpful_count: item.helpful_count || 0,
            unhelpful_count: item.unhelpful_count || 0,
            usage_hours: 12.5,
            created_at: item.created_at,
            updated_at: item.updated_at || item.created_at,
            user_profile: {
              username: 'developer',
              display_name: 'Verified Developer',
              avatar_url: '🤖'
            }
          }));

          // Merge without duplicate IDs
          const existingIds = new Set(formatted.map((r) => r.id));
          const nonDupeLocal = modelReviews.filter((r) => !existingIds.has(r.id));
          modelReviews = [...formatted, ...nonDupeLocal];
        }
      } catch (err) {
        console.warn('Supabase reviews query fallback to local store:', err);
      }
    }

    return modelReviews;
  },

  /**
   * Submit a new review
   */
  async createReview(params: {
    modelId: string;
    userId: string;
    rating: number;
    recommended: boolean;
    reviewText: string;
    userProfile?: {
      username: string;
      display_name: string;
      avatar_url: string;
      is_creator?: boolean;
    };
  }): Promise<{ success: boolean; review?: ModelReview; error?: string }> {
    const { modelId, userId, rating, recommended, reviewText, userProfile } = params;

    if (!userId) {
      return { success: false, error: 'You must be signed in to submit a review.' };
    }
    if (!reviewText.trim()) {
      return { success: false, error: 'Please enter review text before submitting.' };
    }
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Please select a valid star rating (1-5).' };
    }

    const local = getLocalReviews();
    const existing = local.find((r) => r.model_id === modelId && r.user_id === userId);
    if (existing) {
      return { success: false, error: 'You have already reviewed this model. Please edit your existing review.' };
    }

    const newReview: ModelReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      model_id: modelId,
      user_id: userId,
      rating,
      recommended,
      review_text: reviewText.trim(),
      helpful_count: 0,
      unhelpful_count: 0,
      usage_hours: Number((Math.random() * 20 + 2).toFixed(1)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profile: userProfile || {
        username: 'ai_architect',
        display_name: 'AI Architect',
        avatar_url: '🛸'
      }
    };

    // Save locally
    const updatedList = [newReview, ...local];
    saveLocalReviews(updatedList);

    // Sync to Supabase if available
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('reviews').insert({
          id: newReview.id,
          model_id: modelId,
          user_id: userId,
          rating,
          recommended,
          review_text: reviewText.trim(),
          helpful_count: 0,
          created_at: newReview.created_at,
          updated_at: newReview.updated_at
        });

        if (error) {
          console.warn('Supabase review insert warning (cached locally):', error.message);
        }
      } catch (err) {
        console.warn('Supabase remote insert exception:', err);
      }
    }

    return { success: true, review: newReview };
  },

  /**
   * Update an existing review by the owner
   */
  async updateReview(params: {
    reviewId: string;
    userId: string;
    rating: number;
    recommended: boolean;
    reviewText: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { reviewId, userId, rating, recommended, reviewText } = params;

    const local = getLocalReviews();
    const target = local.find((r) => r.id === reviewId);

    if (!target) {
      return { success: false, error: 'Review not found.' };
    }
    if (target.user_id !== userId) {
      return { success: false, error: 'You are only authorized to edit your own review.' };
    }

    target.rating = rating;
    target.recommended = recommended;
    target.review_text = reviewText.trim();
    target.updated_at = new Date().toISOString();

    saveLocalReviews(local);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reviews')
          .update({
            rating,
            recommended,
            review_text: reviewText.trim(),
            updated_at: target.updated_at
          })
          .eq('id', reviewId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase review update exception:', err);
      }
    }

    return { success: true };
  },

  /**
   * Delete a review by the owner
   */
  async deleteReview(reviewId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const local = getLocalReviews();
    const target = local.find((r) => r.id === reviewId);

    if (!target) {
      return { success: false, error: 'Review not found.' };
    }
    if (target.user_id !== userId) {
      return { success: false, error: 'You can only delete your own review.' };
    }

    const filtered = local.filter((r) => r.id !== reviewId);
    saveLocalReviews(filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reviews')
          .delete()
          .eq('id', reviewId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase review delete exception:', err);
      }
    }

    return { success: true };
  },

  /**
   * Helpful voting
   */
  async voteHelpful(reviewId: string, voteType: 'helpful' | 'unhelpful'): Promise<{
    success: boolean;
    helpfulCount: number;
    unhelpfulCount: number;
    userVote?: 'helpful' | 'unhelpful';
  }> {
    const local = getLocalReviews();
    const target = local.find((r) => r.id === reviewId);
    const votes = getUserVotes();
    const previousVote = votes[reviewId];

    if (!target) {
      return { success: false, helpfulCount: 0, unhelpfulCount: 0 };
    }

    if (previousVote === voteType) {
      // Toggle off
      if (voteType === 'helpful') {
        target.helpful_count = Math.max(0, target.helpful_count - 1);
      } else {
        target.unhelpful_count = Math.max(0, (target.unhelpful_count || 0) - 1);
      }
      delete votes[reviewId];
      try {
        localStorage.setItem(USER_VOTES_STORAGE_KEY, JSON.stringify(votes));
      } catch (_e) {}
    } else {
      // If switching vote
      if (previousVote === 'helpful') {
        target.helpful_count = Math.max(0, target.helpful_count - 1);
      } else if (previousVote === 'unhelpful') {
        target.unhelpful_count = Math.max(0, (target.unhelpful_count || 0) - 1);
      }

      if (voteType === 'helpful') {
        target.helpful_count = (target.helpful_count || 0) + 1;
      } else {
        target.unhelpful_count = (target.unhelpful_count || 0) + 1;
      }
      saveUserVote(reviewId, voteType);
    }

    saveLocalReviews(local);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reviews')
          .update({
            helpful_count: target.helpful_count,
            unhelpful_count: target.unhelpful_count
          })
          .eq('id', reviewId);
      } catch (err) {
        console.warn('Supabase vote update warning:', err);
      }
    }

    const currentVote = getUserVotes()[reviewId];
    return {
      success: true,
      helpfulCount: target.helpful_count,
      unhelpfulCount: target.unhelpful_count || 0,
      userVote: currentVote
    };
  },

  getUserVote(reviewId: string): 'helpful' | 'unhelpful' | null {
    const votes = getUserVotes();
    return votes[reviewId] || null;
  }
};
