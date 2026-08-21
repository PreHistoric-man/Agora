export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_creator: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthErrorState {
  message: string;
  field?: 'email' | 'password' | 'general';
  isUnconfirmedEmail?: boolean;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';
