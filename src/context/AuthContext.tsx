import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, formatAuthError, isSupabaseConfigured } from '../lib/supabaseClient';
import type { UserProfile, AuthMode, AuthErrorState } from '../types/auth';

export interface SignUpParams {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
  isCreator?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  showAuthModal: boolean;
  authModalMode: AuthMode;
  authReturnView: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthErrorState }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: AuthErrorState }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  openAuthModal: (mode?: AuthMode, returnView?: string) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthMode) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key for fallback demo mock session if Supabase is unconfigured
const DEMO_AUTH_STORAGE_KEY = 'modalhub_demo_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [authReturnView, setAuthReturnView] = useState<string | null>(null);

  // Fetch or create profile record in public.profiles table
  const fetchUserProfile = useCallback(async (userId: string, authUser?: User) => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback demo profile
        const savedDemo = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo);
          setProfile(parsed.profile);
        }
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not fetch user profile from Supabase:', error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else if (authUser) {
        // Profile record does not exist yet (e.g. trigger not installed). Create it gracefully.
        const defaultProfile: Partial<UserProfile> = {
          id: authUser.id,
          username:
            (authUser.user_metadata?.username as string) ||
            authUser.email?.split('@')[0] ||
            'ai_geek',
          display_name:
            (authUser.user_metadata?.display_name as string) ||
            (authUser.user_metadata?.full_name as string) ||
            authUser.email?.split('@')[0] ||
            'AI Explorer',
          avatar_url: (authUser.user_metadata?.avatar_url as string) || '🛸',
          is_creator: Boolean(authUser.user_metadata?.is_creator) || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (!insertError && inserted) {
          setProfile(inserted as UserProfile);
        } else {
          // If table is not created yet, set local profile representation
          setProfile(defaultProfile as UserProfile);
        }
      }
    } catch (err) {
      console.warn('Profile initialization warning:', err);
    }
  }, []);

  // Initialize and listen to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured) {
          // Check for demo session
          const savedDemo = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
          if (savedDemo) {
            const parsed = JSON.parse(savedDemo);
            setUser(parsed.user);
            setSession(parsed.session);
            setProfile(parsed.profile);
          }
          setIsLoading(false);
          return;
        }

        // 1. Get initial active session from Supabase
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching Supabase session:', error.message);
        }

        if (isMounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchUserProfile(initialSession.user.id, initialSession.user);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase auth:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // 2. Set up real-time listener for Auth State changes
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          if (!isMounted) return;

          setSession(currentSession);
          if (currentSession?.user) {
            setUser(currentSession.user);
            await fetchUserProfile(currentSession.user.id, currentSession.user);
          } else {
            setUser(null);
            setProfile(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [fetchUserProfile]);

  // Sign In with Email & Password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: AuthErrorState }> => {
    try {
      if (!email.trim() || !password) {
        return {
          success: false,
          error: { message: 'Please provide both email and password.' }
        };
      }

      if (!isSupabaseConfigured) {
        // Fallback for development demo if Supabase keys are not yet entered
        const demoUser: any = {
          id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: email.trim(),
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {
            username: email.split('@')[0],
            display_name: email.split('@')[0],
            avatar_url: '🛸',
            is_creator: false
          },
          aud: 'authenticated',
          role: 'authenticated'
        };
        const demoProfile: UserProfile = {
          id: demoUser.id,
          username: email.split('@')[0],
          display_name: email.split('@')[0],
          avatar_url: '🛸',
          is_creator: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const demoSession: any = {
          access_token: 'demo-access-token',
          token_type: 'bearer',
          user: demoUser
        };

        setUser(demoUser);
        setSession(demoSession);
        setProfile(demoProfile);
        localStorage.setItem(
          DEMO_AUTH_STORAGE_KEY,
          JSON.stringify({ user: demoUser, session: demoSession, profile: demoProfile })
        );
        setShowAuthModal(false);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        const friendlyMessage = formatAuthError(error);
        const isUnconfirmed = error.message.toLowerCase().includes('not confirmed');
        return {
          success: false,
          error: {
            message: friendlyMessage,
            isUnconfirmedEmail: isUnconfirmed
          }
        };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchUserProfile(data.user.id, data.user);
        setShowAuthModal(false);
        return { success: true };
      }

      return {
        success: false,
        error: { message: 'Unable to sign in. Please check your credentials.' }
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: formatAuthError(err) }
      };
    }
  };

  // Sign Up with Email, Password, Username & Metadata
  const signUp = async (params: SignUpParams): Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: AuthErrorState }> => {
    try {
      const { email, password, username, displayName, isCreator } = params;

      if (!email.trim()) {
        return { success: false, error: { message: 'Please enter a valid email address.', field: 'email' } };
      }
      if (!password || password.length < 6) {
        return { success: false, error: { message: 'Password must be at least 6 characters.', field: 'password' } };
      }

      const cleanedUsername = (username || email.split('@')[0]).trim();
      const cleanedDisplayName = (displayName || cleanedUsername).trim();

      if (!isSupabaseConfigured) {
        // Fallback for development demo
        const demoUser: any = {
          id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: email.trim(),
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {
            username: cleanedUsername,
            display_name: cleanedDisplayName,
            avatar_url: '🛸',
            is_creator: Boolean(isCreator)
          },
          aud: 'authenticated',
          role: 'authenticated'
        };
        const demoProfile: UserProfile = {
          id: demoUser.id,
          username: cleanedUsername,
          display_name: cleanedDisplayName,
          avatar_url: '🛸',
          is_creator: Boolean(isCreator),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const demoSession: any = {
          access_token: 'demo-access-token',
          token_type: 'bearer',
          user: demoUser
        };

        setUser(demoUser);
        setSession(demoSession);
        setProfile(demoProfile);
        localStorage.setItem(
          DEMO_AUTH_STORAGE_KEY,
          JSON.stringify({ user: demoUser, session: demoSession, profile: demoProfile })
        );
        setShowAuthModal(false);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanedUsername,
            display_name: cleanedDisplayName,
            avatar_url: '🛸',
            is_creator: Boolean(isCreator)
          }
        }
      });

      if (error) {
        return {
          success: false,
          error: { message: formatAuthError(error) }
        };
      }

      // If email confirmation is enabled in Supabase, user session will be null
      if (data.user && !data.session) {
        return {
          success: true,
          needsEmailConfirmation: true
        };
      }

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        await fetchUserProfile(data.user.id, data.user);
        setShowAuthModal(false);
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: { message: formatAuthError(err) }
      };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.warn('Sign out error:', err);
      // Ensure local state is cleared anyway
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User is not authenticated.' };
      }

      const updatedData = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) {
          return { success: false, error: formatAuthError(error) };
        }
      }

      setProfile(updatedData as UserProfile);

      // Also update demo cache if in demo mode
      if (!isSupabaseConfigured) {
        const savedDemo = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo);
          parsed.profile = updatedData;
          localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify(parsed));
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user);
    }
  };

  const openAuthModal = (mode: AuthMode = 'login', returnView?: string) => {
    setAuthModalMode(mode);
    if (returnView) setAuthReturnView(returnView);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthReturnView(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    isSupabaseConfigured,
    showAuthModal,
    authModalMode,
    authReturnView,
    signIn,
    signUp,
    signOut,
    updateProfile,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
