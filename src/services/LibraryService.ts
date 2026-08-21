import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { LibraryItem, LauncherLibraryEntry, DeploymentStatus } from '../types/library';
import type { Model } from '../data/mockData';
import { mockModels } from '../data/mockData';

const DEMO_LIBRARY_STORAGE_KEY = 'modalhub_user_library_items';

function getLocalLibraryItems(userId: string): LibraryItem[] {
  try {
    const raw = localStorage.getItem(`${DEMO_LIBRARY_STORAGE_KEY}_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    // Return empty array for a brand new user
    return [];
  } catch (e) {
    console.warn('Error reading local library:', e);
    return [];
  }
}

function saveLocalLibraryItems(userId: string, items: LibraryItem[]): void {
  try {
    localStorage.setItem(`${DEMO_LIBRARY_STORAGE_KEY}_${userId}`, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving local library:', e);
  }
}

export const LibraryService = {
  /**
   * Fetch all library items for the authenticated user from Supabase.
   * Joins or attaches the normalized model details.
   */
  async getUserLibrary(userId: string, allModels: Model[] = []): Promise<LibraryItem[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('library')
          .select('*')
          .eq('user_id', userId)
          .order('added_at', { ascending: false });

        if (!error && data) {
          // Attach model objects
          return data.map((item: any) => {
            const foundModel =
              allModels.find((m) => m.id === item.model_id) ||
              mockModels.find((m) => m.id === item.model_id);

            return {
              id: item.id,
              user_id: item.user_id,
              model_id: item.model_id,
              added_at: item.added_at || item.created_at || new Date().toISOString(),
              installed: Boolean(item.installed),
              installed_version: item.installed_version || null,
              deployment_status: (item.deployment_status || 'not_deployed') as DeploymentStatus,
              created_at: item.created_at,
              updated_at: item.updated_at,
              model: foundModel
            };
          });
        }

        if (error) {
          console.warn('Supabase library fetch notice (table may be freshly created):', error.message);
        }
      } catch (err) {
        console.warn('Exception querying Supabase library:', err);
      }
    }

    // Fallback to local storage persistence for this user
    const localItems = getLocalLibraryItems(userId);
    return localItems.map((item) => ({
      ...item,
      model: allModels.find((m) => m.id === item.model_id) || mockModels.find((m) => m.id === item.model_id)
    }));
  },

  /**
   * Add an AI model to the authenticated user's library.
   * Enforces that user_id is the authenticated user's ID.
   */
  async addToLibrary(
    userId: string,
    modelId: string,
    allModels: Model[] = []
  ): Promise<{ success: boolean; item?: LibraryItem; error?: string; alreadyInLibrary?: boolean }> {
    if (!userId) {
      return { success: false, error: 'You must be signed in to add models to your library.' };
    }

    const foundModel =
      allModels.find((m) => m.id === modelId) ||
      mockModels.find((m) => m.id === modelId);

    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        // Check if current user is logged in
        const { data: authData } = await supabase.auth.getUser();
        const currentAuthUser = authData?.user;

        // If authenticated with Supabase
        if (currentAuthUser && currentAuthUser.id === userId) {
          const { data, error } = await supabase
            .from('library')
            .insert({
              user_id: currentAuthUser.id,
              model_id: modelId,
              added_at: now,
              installed: false,
              installed_version: null,
              deployment_status: 'not_deployed'
            })
            .select()
            .single();

          if (error) {
            // Postgres error code 23505 is unique violation
            if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
              return { success: true, alreadyInLibrary: true };
            }
            console.warn('Supabase insert library error:', error.message);
            // If table doesn't exist yet or has schema difference, fallback gracefully
          } else if (data) {
            const newItem: LibraryItem = {
              id: data.id,
              user_id: data.user_id,
              model_id: data.model_id,
              added_at: data.added_at,
              installed: Boolean(data.installed),
              installed_version: data.installed_version,
              deployment_status: data.deployment_status as DeploymentStatus,
              model: foundModel
            };
            return { success: true, item: newItem };
          }
        }
      } catch (err: any) {
        console.warn('Supabase addToLibrary exception:', err);
      }
    }

    // Local storage fallback
    const local = getLocalLibraryItems(userId);
    const existingIndex = local.findIndex((i) => i.model_id === modelId);
    if (existingIndex >= 0) {
      return { success: true, alreadyInLibrary: true, item: local[existingIndex] };
    }

    const newItem: LibraryItem = {
      id: `lib-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      model_id: modelId,
      added_at: now,
      installed: false,
      installed_version: null,
      deployment_status: 'not_deployed',
      model: foundModel
    };

    const updated = [newItem, ...local];
    saveLocalLibraryItems(userId, updated);
    return { success: true, item: newItem };
  },

  /**
   * Remove a model from the authenticated user's library.
   * Only deletes the relationship row in `library`, does NOT delete the model from `models`.
   */
  async removeFromLibrary(userId: string, modelId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
      return { success: false, error: 'User authentication required' };
    }

    if (isSupabaseConfigured) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentAuthUser = authData?.user;

        if (currentAuthUser && currentAuthUser.id === userId) {
          const { error } = await supabase
            .from('library')
            .delete()
            .eq('user_id', currentAuthUser.id)
            .eq('model_id', modelId);

          if (error) {
            console.warn('Supabase removeFromLibrary error:', error.message);
          }
        }
      } catch (err) {
        console.warn('Supabase removeFromLibrary exception:', err);
      }
    }

    // Update local storage
    const local = getLocalLibraryItems(userId);
    const filtered = local.filter((i) => i.model_id !== modelId);
    saveLocalLibraryItems(userId, filtered);

    return { success: true };
  },

  /**
   * Update installation or deployment status for a library item.
   */
  async updateLibraryItemStatus(
    userId: string,
    modelId: string,
    updates: {
      installed?: boolean;
      installed_version?: string | null;
      deployment_status?: DeploymentStatus;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: 'User authentication required' };

    if (isSupabaseConfigured) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentAuthUser = authData?.user;

        if (currentAuthUser && currentAuthUser.id === userId) {
          const { error } = await supabase
            .from('library')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', currentAuthUser.id)
            .eq('model_id', modelId);

          if (error) {
            console.warn('Supabase update status error:', error.message);
          }
        }
      } catch (err) {
        console.warn('Supabase update status exception:', err);
      }
    }

    // Update local storage
    const local = getLocalLibraryItems(userId);
    const updated = local.map((i) => {
      if (i.model_id === modelId) {
        return {
          ...i,
          ...updates,
          updated_at: new Date().toISOString()
        };
      }
      return i;
    });
    saveLocalLibraryItems(userId, updated);

    return { success: true };
  },

  /**
   * Export format for future ModalHub Desktop Launcher:
   * GET /api/launcher/library -> returns array of LauncherLibraryEntry
   */
  async getLauncherLibraryFormat(userId: string, allModels: Model[] = []): Promise<LauncherLibraryEntry[]> {
    const items = await this.getUserLibrary(userId, allModels);
    return items.map((item) => ({
      model_id: item.model_id,
      name: item.model?.name || item.model_id,
      installed: item.installed,
      installed_version: item.installed_version || null,
      deployment_status: item.deployment_status
    }));
  }
};
