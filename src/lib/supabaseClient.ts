import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalizes and validates Supabase Project URL.
 * Handles common accidental inputs like copying the Supabase Dashboard URL
 * (https://supabase.com/dashboard/project/<ref>) instead of the API URL (https://<ref>.supabase.co).
 */
function sanitizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return 'https://orqgfywqxnvpvoecbgde.supabase.co';
  let url = rawUrl.trim();

  // If dashboard URL was accidentally pasted: https://supabase.com/dashboard/project/<project-ref>
  if (url.includes('supabase.com/dashboard/project/')) {
    const parts = url.split('supabase.com/dashboard/project/');
    const projectRef = parts[1]?.split('/')[0]?.trim();
    if (projectRef) {
      return `https://${projectRef}.supabase.co`;
    }
  }

  // Ensure https prefix
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slash
  return url.replace(/\/+$/, '');
}

function sanitizeSupabaseKey(rawKey: string | undefined): string {
  if (!rawKey) return '';
  return rawKey.trim();
}

const rawEnvUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.SUPABASE_URL as string | undefined);

const rawEnvKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.SUPABASE_ANON_KEY as string | undefined);

const supabaseUrl = sanitizeSupabaseUrl(
  rawEnvUrl || 'https://orqgfywqxnvpvoecbgde.supabase.co'
);

const supabaseAnonKey = sanitizeSupabaseKey(
  rawEnvKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycWdmeXdxeG52cHZvZWNiZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjM3OTYsImV4cCI6MjEwMjg5OTc5Nn0.Hw7EVR08ptNggZ7VYPqwgJ6hZC5Q7X9JMhWIH4LmxMo'
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://demo-modalhub.supabase.co' &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('dummy')
);

// Create single Supabase client instance
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

/**
 * Format raw Supabase authentication errors into friendly, safe messages.
 * Never expose sensitive internals.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = (error.message || '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (message.includes('email not confirmed') || message.includes('not confirmed')) {
    return 'Please check your inbox and confirm your email before signing in.';
  }
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (message.includes('password should be at least') || message.includes('weak password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('valid email') || message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'Unable to connect to the authentication server. Please check your internet connection.';
  }

  return error.message || 'Authentication request failed. Please try again.';
}
