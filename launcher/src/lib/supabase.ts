import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://orqgfywqxnvpvoecbgde.supabase.co';

const rawKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycWdmeXdxeG52cHZvZWNiZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjM3OTYsImV4cCI6MjEwMjg5OTc5Nn0.Hw7EVR08ptNggZ7VYPqwgJ6hZC5Q7X9JMhWIH4LmxMo';

export const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');
export const supabaseAnonKey = rawKey.trim();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return 'Please check your email and confirm your account before signing in.';
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Password must be at least 6 characters long.';
  }
  return error.message || 'Authentication failed. Please try again.';
}
