export type UserRole = 'user' | 'creator' | 'admin';
export type CreatorStatus = 'not_creator' | 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: UserRole;
  creator_status: CreatorStatus;
  is_creator: boolean;
  bio?: string;
  website_url?: string;
  github_url?: string;
  verified?: boolean;
  creator_applied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthErrorState {
  message: string;
  field?: 'email' | 'password' | 'general';
  isUnconfirmedEmail?: boolean;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface ResetPasswordOtpResult {
  success: boolean;
  error?: string;
  isDemo?: boolean;
  demoOtp?: string;
}
