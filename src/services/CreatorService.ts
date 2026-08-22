import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { CreatorApplication } from '../types/submission';
import type { UserProfile, CreatorStatus } from '../types/auth';

const LOCAL_CREATOR_APPS_KEY = 'agora_creator_applications';

const INITIAL_DEMO_APPLICATIONS: CreatorApplication[] = [
  {
    id: 'app-demo-1',
    user_id: 'c1',
    username: 'agora_lab',
    display_name: 'Agora Research Lab',
    email: 'lab@agora.ai',
    avatar_url: '⚡',
    bio: 'Pioneering open-weights quantized models and low-latency inference runtimes.',
    portfolio_url: 'https://agora.ai/research',
    github_url: 'https://github.com/agora-lab',
    status: 'approved',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    reviewed_at: new Date(Date.now() - 13 * 86400000).toISOString()
  },
  {
    id: 'app-demo-2',
    user_id: 'user-openmind',
    username: 'open_mind',
    display_name: 'OpenMind AI Team',
    email: 'creator@openmind.ai',
    avatar_url: '🧠',
    bio: 'Building specialized clinical and legal reasoning distillations.',
    portfolio_url: 'https://openmind.ai',
    github_url: 'https://github.com/openmind-ai',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

function getStoredApplications(): CreatorApplication[] {
  try {
    const raw = localStorage.getItem(LOCAL_CREATOR_APPS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CREATOR_APPS_KEY, JSON.stringify(INITIAL_DEMO_APPLICATIONS));
      return INITIAL_DEMO_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_APPLICATIONS;
  }
}

function saveStoredApplications(apps: CreatorApplication[]) {
  try {
    localStorage.setItem(LOCAL_CREATOR_APPS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.warn('Could not persist creator applications:', e);
  }
}

export const CreatorService = {
  /**
   * Submit an application to become an Agora Creator
   */
  async applyForCreator(
    user: { id: string; email?: string },
    profile: UserProfile,
    formData: {
      displayName: string;
      bio: string;
      portfolioUrl?: string;
      githubUrl?: string;
    }
  ): Promise<{ success: boolean; application?: CreatorApplication; error?: string }> {
    try {
      if (!formData.displayName.trim()) {
        return { success: false, error: 'Creator / Organization display name is required.' };
      }
      if (!formData.bio.trim() || formData.bio.trim().length < 10) {
        return { success: false, error: 'Please enter a brief bio describing your model projects (at least 10 characters).' };
      }

      const now = new Date().toISOString();
      const newApp: CreatorApplication = {
        id: 'app-' + Math.random().toString(36).substring(2, 9),
        user_id: user.id,
        username: profile.username || user.email?.split('@')[0] || 'user',
        display_name: formData.displayName.trim(),
        email: user.email || 'user@agora.ai',
        avatar_url: profile.avatar_url || '🛸',
        bio: formData.bio.trim(),
        portfolio_url: formData.portfolioUrl?.trim() || '',
        github_url: formData.githubUrl?.trim() || '',
        status: 'pending',
        created_at: now
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('creator_applications').insert({
            user_id: user.id,
            username: newApp.username,
            display_name: newApp.display_name,
            email: newApp.email,
            avatar_url: newApp.avatar_url,
            bio: newApp.bio,
            portfolio_url: newApp.portfolio_url,
            github_url: newApp.github_url,
            status: 'pending'
          });

          // Update profiles table creator status
          await supabase
            .from('profiles')
            .update({
              creator_status: 'pending',
              bio: newApp.bio,
              website_url: newApp.portfolio_url,
              github_url: newApp.github_url,
              creator_applied_at: now
            })
            .eq('id', user.id);
        } catch (dbErr) {
          console.warn('Supabase creator apply error, fallback to local storage:', dbErr);
        }
      }

      const apps = getStoredApplications();
      const existingIdx = apps.findIndex((a) => a.user_id === user.id);
      if (existingIdx >= 0) {
        apps[existingIdx] = newApp;
      } else {
        apps.unshift(newApp);
      }
      saveStoredApplications(apps);

      return { success: true, application: newApp };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit creator application.' };
    }
  },

  /**
   * Fast-approve creator access (for testing & demo flow)
   */
  async quickApproveCreator(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const apps = getStoredApplications();
      const app = apps.find((a) => a.user_id === userId);
      if (app) {
        app.status = 'approved';
        app.reviewed_at = new Date().toISOString();
        saveStoredApplications(apps);
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('profiles')
            .update({
              role: 'creator',
              creator_status: 'approved',
              is_creator: true,
              verified: true
            })
            .eq('id', userId);
        } catch (e) {
          console.warn('Supabase quick approve warning:', e);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch all creator applications (for Admin Portal)
   */
  async getAllApplications(): Promise<CreatorApplication[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as CreatorApplication[];
        }
      } catch (err) {
        console.warn('Supabase fetch applications error:', err);
      }
    }

    return getStoredApplications();
  },

  /**
   * Admin reviews creator application (Approve / Reject)
   */
  async adminReviewApplication(
    applicationId: string,
    adminId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const apps = getStoredApplications();
      const app = apps.find((a) => a.id === applicationId);
      if (!app) return { success: false, error: 'Application not found.' };

      const newStatus: CreatorStatus = decision === 'approve' ? 'approved' : 'rejected';
      const reviewedAt = new Date().toISOString();

      app.status = newStatus;
      app.reviewed_at = reviewedAt;
      app.reviewed_by = adminId;
      app.admin_notes = notes;
      saveStoredApplications(apps);

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('creator_applications')
            .update({
              status: newStatus,
              reviewed_at: reviewedAt,
              reviewed_by: adminId,
              admin_notes: notes || null
            })
            .eq('id', applicationId);

          if (decision === 'approve') {
            await supabase
              .from('profiles')
              .update({
                role: 'creator',
                creator_status: 'approved',
                is_creator: true,
                verified: true
              })
              .eq('id', app.user_id);
          } else {
            await supabase
              .from('profiles')
              .update({
                creator_status: 'rejected'
              })
              .eq('id', app.user_id);
          }
        } catch (dbErr) {
          console.warn('Supabase update application error:', dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to review application.' };
    }
  },

  /**
   * Fetch public creator profile by ID
   */
  async getCreatorProfileById(creatorId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', creatorId)
          .maybeSingle();

        if (!error && data) {
          return data as UserProfile;
        }
      } catch (err) {
        console.warn('Supabase fetch creator profile error:', err);
      }
    }

    return null;
  }
};
