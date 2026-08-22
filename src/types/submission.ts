import type { UserProfile } from './auth';

export type SubmissionStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'unpublished';

export interface ModelSubmission {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  category: 'Reasoning' | 'Coding' | 'Image' | 'Video' | 'Audio' | 'Vision' | 'Writing' | 'Agents' | 'Speech' | 'Science';
  tags: string[];
  version: string;
  license: string;
  model_size?: string;
  parameters?: string;
  runtime: string;
  runtime_model_id?: string;
  source_url: string;
  thumbnail_url?: string;
  banner_url?: string;
  deployable: boolean;
  status: SubmissionStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  published_at?: string;
  
  // Public models integration
  published_model_id?: string;

  // Joined / computed creator preview
  creator?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    verified: boolean;
    bio?: string;
  };
}

export interface ModelSubmissionDraft {
  name: string;
  slug?: string;
  description: string;
  long_description?: string;
  category: 'Reasoning' | 'Coding' | 'Image' | 'Video' | 'Audio' | 'Vision' | 'Writing' | 'Agents' | 'Speech' | 'Science';
  tags: string[];
  version: string;
  license: string;
  model_size?: string;
  parameters?: string;
  runtime: string;
  runtime_model_id?: string;
  source_url: string;
  thumbnail_url?: string;
  banner_url?: string;
  deployable: boolean;
}

export interface CreatorApplication {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  portfolio_url?: string;
  github_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface CreatorOverviewStats {
  publishedCount: number;
  pendingReviewCount: number;
  draftsCount: number;
  rejectedCount: number;
  totalSubmissions: number;
}
