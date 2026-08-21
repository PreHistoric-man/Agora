export interface ModelReview {
  id: string;
  model_id: string;
  user_id: string;
  rating: number; // 1 to 5
  recommended: boolean; // true: Recommended, false: Not Recommended
  review_text: string;
  helpful_count: number;
  unhelpful_count?: number;
  usage_hours?: number; // e.g. 14.5 hrs of API usage
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_creator?: boolean;
  };
}

export type SentimentLabel =
  | 'Very Positive'
  | 'Positive'
  | 'Mostly Positive'
  | 'Mixed'
  | 'Mostly Negative'
  | 'Negative'
  | 'Very Negative'
  | 'No Reviews';

export interface RatingBreakdownItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  recommendedCount: number;
  notRecommendedCount: number;
  recommendationPercentage: number;
  sentimentLabel: SentimentLabel;
  sentimentColor: string;
  sentimentBg: string;
  sentimentBorder: string;
  breakdown: RatingBreakdownItem[];
}
