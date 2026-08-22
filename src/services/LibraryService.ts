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

    const localItems = getLocalLibraryItems(userId);

    if (isSupabaseConfigured && userId !== 'demo_user') {
      try {
        const { data, error } = await supabase
          .from('library')
          .select('*')
          .eq('user_id', userId)
          .order('added_at', { ascending: false });

        if (!error && data && Array.isArray(data)) {
          // Attach model objects
          const joined = data.map((item: any) => {
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

          // Sync to local cache
          saveLocalLibraryItems(userId, joined);
          return joined;
        }

        if (error) {
          console.warn('Supabase library fetch notice (using local cache):', error.message);
        }
      } catch (err) {
        console.warn('Exception querying Supabase library (using local cache):', err);
      }
    }

    // Fallback to local storage persistence
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
    const targetUserId = userId || 'demo_user';

    const foundModel =
      allModels.find((m) => m.id === modelId) ||
      mockModels.find((m) => m.id === modelId);

    const now = new Date().toISOString();

    // 1. Always update local storage first so UI has zero latency and guaranteed persistence
    const local = getLocalLibraryItems(targetUserId);
    const existingIndex = local.findIndex((i) => i.model_id === modelId);
    let newItem: LibraryItem;

    if (existingIndex >= 0) {
      newItem = local[existingIndex];
    } else {
      newItem = {
        id: `lib-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: targetUserId,
        model_id: modelId,
        added_at: now,
        installed: false,
        installed_version: null,
        deployment_status: 'not_deployed',
        model: foundModel
      };
      const updated = [newItem, ...local];
      saveLocalLibraryItems(targetUserId, updated);
    }

    if (isSupabaseConfigured && targetUserId !== 'demo_user') {
      try {
        // Check if existing record exists in database
        const { data: existingRows } = await supabase
          .from('library')
          .select('id, user_id, model_id, added_at, installed, installed_version, deployment_status')
          .eq('user_id', targetUserId)
          .eq('model_id', modelId);

        if (existingRows && existingRows.length > 0) {
          const existing = existingRows[0];
          newItem = {
            id: existing.id,
            user_id: existing.user_id,
            model_id: existing.model_id,
            added_at: existing.added_at,
            installed: Boolean(existing.installed),
            installed_version: existing.installed_version,
            deployment_status: (existing.deployment_status || 'not_deployed') as DeploymentStatus,
            model: foundModel
          };
          return { success: true, item: newItem, alreadyInLibrary: true };
        }

        // Insert new record directly
        const { data: insertedData, error: insertError } = await supabase
          .from('library')
          .insert({
            user_id: targetUserId,
            model_id: modelId,
            added_at: now,
            installed: false,
            installed_version: null,
            deployment_status: 'not_deployed'
          })
          .select()
          .maybeSingle();

        if (insertError) {
          if (insertError.code === '23505' || insertError.message.includes('unique') || insertError.message.includes('duplicate')) {
            return { success: true, alreadyInLibrary: true, item: newItem };
          }
          console.warn('Supabase insert library warning (cached locally):', insertError.message);
        } else if (insertedData) {
          newItem = {
            id: insertedData.id,
            user_id: insertedData.user_id,
            model_id: insertedData.model_id,
            added_at: insertedData.added_at,
            installed: Boolean(insertedData.installed),
            installed_version: insertedData.installed_version,
            deployment_status: insertedData.deployment_status as DeploymentStatus,
            model: foundModel
          };
        }
      } catch (err: any) {
        console.warn('Supabase addToLibrary exception (cached locally):', err);
      }
    }

    return { success: true, item: newItem, alreadyInLibrary: existingIndex >= 0 };
  },

  /**
   * Remove a model from the authenticated user's library.
   * Only deletes the relationship row in `library`, does NOT delete the model from `models`.
   */
  async removeFromLibrary(userId: string, modelId: string): Promise<{ success: boolean; error?: string }> {
    const targetUserId = userId || 'demo_user';

    // Update local storage
    const local = getLocalLibraryItems(targetUserId);
    const filtered = local.filter((i) => i.model_id !== modelId);
    saveLocalLibraryItems(targetUserId, filtered);

    if (isSupabaseConfigured && targetUserId !== 'demo_user') {
      try {
        const { error } = await supabase
          .from('library')
          .delete()
          .eq('user_id', targetUserId)
          .eq('model_id', modelId);

        if (error) {
          console.warn('Supabase removeFromLibrary error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase removeFromLibrary exception:', err);
      }
    }

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
    const targetUserId = userId || 'demo_user';

    // Update local storage
    const local = getLocalLibraryItems(targetUserId);
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
    saveLocalLibraryItems(targetUserId, updated);

    if (isSupabaseConfigured && targetUserId !== 'demo_user') {
      try {
        const { error } = await supabase
          .from('library')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId)
          .eq('model_id', modelId);

        if (error) {
          console.warn('Supabase update status error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase update status exception:', err);
      }
    }

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
