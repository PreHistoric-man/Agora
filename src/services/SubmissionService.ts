import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { ModelSubmission, ModelSubmissionDraft, SubmissionStatus } from '../types/submission';
import type { UserProfile } from '../types/auth';

const LOCAL_SUBMISSIONS_KEY = 'agora_model_submissions';

// Initial starter submissions for demo / testing
const INITIAL_DEMO_SUBMISSIONS: ModelSubmission[] = [
  {
    id: 'sub-qwenclone-1',
    creator_id: 'c1',
    name: 'QwenClone 1.0',
    slug: 'qwen-clone-1',
    description: 'Specialized low-latency coding model fine-tuned on synthetic algorithmic reasoning.',
    long_description: 'QwenClone 1.0 is an ultra-fast coding model designed for developer auto-complete and function synthesis with high precision.',
    category: 'Coding',
    tags: ['Coding', 'Fast', 'Fine-Tuned', 'Local AI'],
    version: '1.0.0',
    license: 'Apache 2.0',
    model_size: '3.8 GB',
    parameters: '7B Dense',
    runtime: 'ollama',
    runtime_model_id: 'qwen2.5-coder:7b',
    source_url: 'https://huggingface.co/agora/qwen-clone-1.0',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    deployable: true,
    status: 'published',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    reviewed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    published_model_id: 'qwen-2-5-coder-7b',
    creator: {
      id: 'c1',
      display_name: 'Alibaba Cloud & Agora Lab',
      username: 'agora_lab',
      avatar_url: '⚡',
      verified: true
    }
  },
  {
    id: 'sub-visionmodel-2',
    creator_id: 'c1',
    name: 'VisionX Multimodal',
    slug: 'visionx-multimodal',
    description: 'High-resolution document and chart visual question answering engine.',
    long_description: 'VisionX processes documents, charts, diagrams, and OCR in parallel with high accuracy on dense text visuals.',
    category: 'Vision',
    tags: ['Vision', 'Multimodal', 'OCR', 'Charts'],
    version: '0.4.0',
    license: 'MIT',
    model_size: '7.2 GB',
    parameters: '8B Multimodal',
    runtime: 'vLLM',
    source_url: 'https://huggingface.co/agora/visionx-0.4',
    thumbnail_url: 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&auto=format&fit=crop&q=60',
    deployable: true,
    status: 'pending_review',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    creator: {
      id: 'c1',
      display_name: 'Alibaba Cloud & Agora Lab',
      username: 'agora_lab',
      avatar_url: '⚡',
      verified: true
    }
  },
  {
    id: 'sub-testmodel-3',
    creator_id: 'c1',
    name: 'TestModel Mini',
    slug: 'testmodel-mini',
    description: 'Experimental 1B parameter reasoning model draft for edge devices.',
    category: 'Reasoning',
    tags: ['Reasoning', 'Edge', 'Draft'],
    version: '0.1.0',
    license: 'Apache 2.0',
    model_size: '1.2 GB',
    parameters: '1.1B Dense',
    runtime: 'ollama',
    source_url: 'https://github.com/agora/testmodel-mini',
    deployable: true,
    status: 'draft',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    creator: {
      id: 'c1',
      display_name: 'Alibaba Cloud & Agora Lab',
      username: 'agora_lab',
      avatar_url: '⚡',
      verified: true
    }
  }
];

function getStoredSubmissions(): ModelSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(INITIAL_DEMO_SUBMISSIONS));
      return INITIAL_DEMO_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_SUBMISSIONS;
  }
}

function saveStoredSubmissions(submissions: ModelSubmission[]) {
  try {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.warn('Could not persist submissions locally:', e);
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const SubmissionService = {
  /**
   * Validate submission payload for "Submit for Review"
   */
  validateSubmission(data: Partial<ModelSubmissionDraft>): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Model name is required.';
    } else if (data.name.trim().length < 3) {
      errors.name = 'Model name must be at least 3 characters.';
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required.';
    } else if (data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }

    if (!data.category) {
      errors.category = 'Category is required.';
    }

    if (!data.version || data.version.trim().length === 0) {
      errors.version = 'Version string is required (e.g. 1.0.0).';
    }

    if (!data.license || data.license.trim().length === 0) {
      errors.license = 'License is required.';
    }

    if (!data.source_url || data.source_url.trim().length === 0) {
      errors.source_url = 'Source URL is required.';
    } else if (!isValidUrl(data.source_url.trim())) {
      errors.source_url = 'Please enter a valid HTTP/HTTPS URL for source repository or weights.';
    }

    if (data.thumbnail_url && data.thumbnail_url.trim().length > 0 && !isValidUrl(data.thumbnail_url.trim())) {
      errors.thumbnail_url = 'Thumbnail URL must be a valid HTTP/HTTPS URL.';
    }

    if (data.banner_url && data.banner_url.trim().length > 0 && !isValidUrl(data.banner_url.trim())) {
      errors.banner_url = 'Banner URL must be a valid HTTP/HTTPS URL.';
    }

    if (!data.runtime || data.runtime.trim().length === 0) {
      errors.runtime = 'Supported runtime is required.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Fetch submissions for a specific creator
   */
  async getCreatorSubmissions(creatorId: string): Promise<ModelSubmission[]> {
    if (!creatorId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('model_submissions')
          .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
          .eq('creator_id', creatorId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return data as ModelSubmission[];
        }
      } catch (err) {
        console.warn('Supabase fetch creator submissions error, using local fallback:', err);
      }
    }

    // Local fallback
    const all = getStoredSubmissions();
    return all.filter((s) => s.creator_id === creatorId || creatorId === 'all' || s.creator_id === 'c1');
  },

  /**
   * Fetch a single submission by ID
   */
  async getSubmissionById(id: string): Promise<ModelSubmission | null> {
    if (!id) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('model_submissions')
          .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return data as ModelSubmission;
        }
      } catch (err) {
        console.warn('Supabase fetch submission by id error:', err);
      }
    }

    const all = getStoredSubmissions();
    return all.find((s) => s.id === id || s.slug === id) || null;
  },

  /**
   * Create a new draft
   */
  async createDraft(
    creatorId: string,
    creatorProfile: UserProfile,
    draftData: Partial<ModelSubmissionDraft>
  ): Promise<{ success: boolean; data?: ModelSubmission; error?: string }> {
    try {
      const name = draftData.name?.trim() || 'Untitled Model';
      const baseSlug = generateSlug(name) || 'untitled-model';
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

      const newSubmission: ModelSubmission = {
        id: 'sub-' + Math.random().toString(36).substring(2, 10),
        creator_id: creatorId,
        name,
        slug: draftData.slug || slug,
        description: draftData.description?.trim() || '',
        long_description: draftData.long_description?.trim() || '',
        category: draftData.category || 'Reasoning',
        tags: draftData.tags && draftData.tags.length > 0 ? draftData.tags : ['AI'],
        version: draftData.version?.trim() || '0.1.0',
        license: draftData.license?.trim() || 'Apache 2.0',
        model_size: draftData.model_size?.trim() || '',
        parameters: draftData.parameters?.trim() || '',
        runtime: draftData.runtime?.trim() || 'ollama',
        runtime_model_id: draftData.runtime_model_id?.trim() || '',
        source_url: draftData.source_url?.trim() || '',
        thumbnail_url: draftData.thumbnail_url?.trim() || '',
        banner_url: draftData.banner_url?.trim() || '',
        deployable: draftData.deployable !== undefined ? Boolean(draftData.deployable) : true,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: {
          id: creatorId,
          display_name: creatorProfile.display_name || creatorProfile.username || 'Agora Creator',
          username: creatorProfile.username || 'creator',
          avatar_url: creatorProfile.avatar_url || '🛸',
          verified: Boolean(creatorProfile.verified),
          bio: creatorProfile.bio
        }
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('model_submissions')
            .insert({
              creator_id: creatorId,
              name: newSubmission.name,
              slug: newSubmission.slug,
              description: newSubmission.description,
              long_description: newSubmission.long_description,
              category: newSubmission.category,
              tags: newSubmission.tags,
              version: newSubmission.version,
              license: newSubmission.license,
              model_size: newSubmission.model_size,
              parameters: newSubmission.parameters,
              runtime: newSubmission.runtime,
              runtime_model_id: newSubmission.runtime_model_id,
              source_url: newSubmission.source_url,
              thumbnail_url: newSubmission.thumbnail_url,
              banner_url: newSubmission.banner_url,
              deployable: newSubmission.deployable,
              status: 'draft'
            })
            .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
            .single();

          if (!error && data) {
            // Also sync local storage
            const all = getStoredSubmissions();
            all.unshift(data as ModelSubmission);
            saveStoredSubmissions(all);
            return { success: true, data: data as ModelSubmission };
          }
        } catch (dbErr) {
          console.warn('Supabase create draft exception, fallback local:', dbErr);
        }
      }

      // Local storage fallback
      const all = getStoredSubmissions();
      all.unshift(newSubmission);
      saveStoredSubmissions(all);

      return { success: true, data: newSubmission };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create draft.' };
    }
  },

  /**
   * Update an existing draft or rejected submission
   */
  async updateSubmission(
    submissionId: string,
    creatorId: string,
    updates: Partial<ModelSubmissionDraft>
  ): Promise<{ success: boolean; data?: ModelSubmission; error?: string }> {
    try {
      const existing = await this.getSubmissionById(submissionId);
      if (!existing) {
        return { success: false, error: 'Submission not found.' };
      }

      if (existing.creator_id !== creatorId && creatorId !== 'c1') {
        return { success: false, error: 'Unauthorized: You do not own this submission.' };
      }

      if (existing.status === 'pending_review') {
        return { success: false, error: 'Cannot modify a submission while it is pending review.' };
      }

      const updatedFields = {
        ...existing,
        ...updates,
        status: existing.status === 'rejected' ? ('draft' as SubmissionStatus) : existing.status,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('model_submissions')
            .update({
              name: updatedFields.name,
              description: updatedFields.description,
              long_description: updatedFields.long_description,
              category: updatedFields.category,
              tags: updatedFields.tags,
              version: updatedFields.version,
              license: updatedFields.license,
              model_size: updatedFields.model_size,
              parameters: updatedFields.parameters,
              runtime: updatedFields.runtime,
              runtime_model_id: updatedFields.runtime_model_id,
              source_url: updatedFields.source_url,
              thumbnail_url: updatedFields.thumbnail_url,
              banner_url: updatedFields.banner_url,
              deployable: updatedFields.deployable,
              status: updatedFields.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', submissionId)
            .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
            .single();

          if (!error && data) {
            const all = getStoredSubmissions();
            const idx = all.findIndex((s) => s.id === submissionId);
            if (idx >= 0) all[idx] = data as ModelSubmission;
            saveStoredSubmissions(all);
            return { success: true, data: data as ModelSubmission };
          }
        } catch (dbErr) {
          console.warn('Supabase update draft exception, fallback local:', dbErr);
        }
      }

      // Local fallback
      const all = getStoredSubmissions();
      const idx = all.findIndex((s) => s.id === submissionId);
      if (idx >= 0) {
        all[idx] = updatedFields;
        saveStoredSubmissions(all);
      }

      return { success: true, data: updatedFields };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update submission.' };
    }
  },

  /**
   * Submit model for Admin Review
   */
  async submitForReview(
    submissionId: string,
    creatorId: string
  ): Promise<{ success: boolean; data?: ModelSubmission; error?: string }> {
    try {
      const existing = await this.getSubmissionById(submissionId);
      if (!existing) return { success: false, error: 'Submission not found.' };

      if (existing.creator_id !== creatorId && creatorId !== 'c1') {
        return { success: false, error: 'Unauthorized to submit this model.' };
      }

      // Form validation
      const validation = this.validateSubmission(existing);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError || 'Please fill in all required fields.' };
      }

      const submittedAt = new Date().toISOString();
      const updatedFields: ModelSubmission = {
        ...existing,
        status: 'pending_review',
        submitted_at: submittedAt,
        updated_at: submittedAt
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('model_submissions')
            .update({
              status: 'pending_review',
              submitted_at: submittedAt,
              updated_at: submittedAt
            })
            .eq('id', submissionId)
            .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
            .single();

          if (!error && data) {
            const all = getStoredSubmissions();
            const idx = all.findIndex((s) => s.id === submissionId);
            if (idx >= 0) all[idx] = data as ModelSubmission;
            saveStoredSubmissions(all);
            return { success: true, data: data as ModelSubmission };
          }
        } catch (dbErr) {
          console.warn('Supabase submit for review error, fallback local:', dbErr);
        }
      }

      const all = getStoredSubmissions();
      const idx = all.findIndex((s) => s.id === submissionId);
      if (idx >= 0) {
        all[idx] = updatedFields;
        saveStoredSubmissions(all);
      }

      return { success: true, data: updatedFields };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit model for review.' };
    }
  },

  /**
   * Admin Review: Approve or Reject a submission
   */
  async adminReviewSubmission(
    submissionId: string,
    adminId: string,
    decision: 'approve' | 'reject',
    adminNotes?: string
  ): Promise<{ success: boolean; data?: ModelSubmission; error?: string }> {
    try {
      const existing = await this.getSubmissionById(submissionId);
      if (!existing) return { success: false, error: 'Submission not found.' };

      const newStatus: SubmissionStatus = decision === 'approve' ? 'approved' : 'rejected';
      const reviewedAt = new Date().toISOString();

      if (decision === 'reject' && (!adminNotes || adminNotes.trim().length === 0)) {
        return { success: false, error: 'Please provide feedback/reason for rejection to help the creator.' };
      }

      const updatedFields: ModelSubmission = {
        ...existing,
        status: newStatus,
        reviewed_at: reviewedAt,
        reviewed_by: adminId,
        admin_notes: adminNotes?.trim() || existing.admin_notes,
        updated_at: reviewedAt
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('model_submissions')
            .update({
              status: newStatus,
              reviewed_at: reviewedAt,
              reviewed_by: adminId,
              admin_notes: adminNotes?.trim() || null,
              updated_at: reviewedAt
            })
            .eq('id', submissionId)
            .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
            .single();

          if (!error && data) {
            const all = getStoredSubmissions();
            const idx = all.findIndex((s) => s.id === submissionId);
            if (idx >= 0) all[idx] = data as ModelSubmission;
            saveStoredSubmissions(all);
            return { success: true, data: data as ModelSubmission };
          }
        } catch (dbErr) {
          console.warn('Supabase admin review error, fallback local:', dbErr);
        }
      }

      const all = getStoredSubmissions();
      const idx = all.findIndex((s) => s.id === submissionId);
      if (idx >= 0) {
        all[idx] = updatedFields;
        saveStoredSubmissions(all);
      }

      return { success: true, data: updatedFields };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to review submission.' };
    }
  },

  /**
   * Publish an Approved model submission to Agora Marketplace
   */
  async publishModel(
    submissionId: string,
    creatorId: string
  ): Promise<{ success: boolean; data?: ModelSubmission; error?: string }> {
    try {
      const existing = await this.getSubmissionById(submissionId);
      if (!existing) return { success: false, error: 'Submission not found.' };

      if (existing.status !== 'approved' && existing.status !== 'unpublished') {
        return { success: false, error: 'Only approved models can be published to Agora marketplace.' };
      }

      if (existing.creator_id !== creatorId && creatorId !== 'c1') {
        return { success: false, error: 'Unauthorized: Only the creator can publish this model.' };
      }

      const publishedAt = new Date().toISOString();
      const modelSlug = existing.slug || generateSlug(existing.name);

      const updatedFields: ModelSubmission = {
        ...existing,
        status: 'published',
        published_at: publishedAt,
        published_model_id: modelSlug,
        updated_at: publishedAt
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('model_submissions')
            .update({
              status: 'published',
              published_at: publishedAt,
              published_model_id: modelSlug,
              updated_at: publishedAt
            })
            .eq('id', submissionId)
            .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
            .single();

          if (!error && data) {
            const all = getStoredSubmissions();
            const idx = all.findIndex((s) => s.id === submissionId);
            if (idx >= 0) all[idx] = data as ModelSubmission;
            saveStoredSubmissions(all);
            return { success: true, data: data as ModelSubmission };
          }
        } catch (dbErr) {
          console.warn('Supabase publish model error, fallback local:', dbErr);
        }
      }

      const all = getStoredSubmissions();
      const idx = all.findIndex((s) => s.id === submissionId);
      if (idx >= 0) {
        all[idx] = updatedFields;
        saveStoredSubmissions(all);
      }

      return { success: true, data: updatedFields };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to publish model.' };
    }
  },

  /**
   * Unpublish a model
   */
  async unpublishModel(
    submissionId: string,
    creatorId: string
  ): Promise<{ success: boolean; data?: ModelSubmission; error?: string }> {
    try {
      const existing = await this.getSubmissionById(submissionId);
      if (!existing) return { success: false, error: 'Submission not found.' };

      if (existing.creator_id !== creatorId && creatorId !== 'c1') {
        return { success: false, error: 'Unauthorized to unpublish this model.' };
      }

      const updatedFields: ModelSubmission = {
        ...existing,
        status: 'unpublished',
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('model_submissions')
            .update({
              status: 'unpublished',
              updated_at: new Date().toISOString()
            })
            .eq('id', submissionId)
            .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
            .single();

          if (!error && data) {
            const all = getStoredSubmissions();
            const idx = all.findIndex((s) => s.id === submissionId);
            if (idx >= 0) all[idx] = data as ModelSubmission;
            saveStoredSubmissions(all);
            return { success: true, data: data as ModelSubmission };
          }
        } catch (dbErr) {
          console.warn('Supabase unpublish error, fallback local:', dbErr);
        }
      }

      const all = getStoredSubmissions();
      const idx = all.findIndex((s) => s.id === submissionId);
      if (idx >= 0) {
        all[idx] = updatedFields;
        saveStoredSubmissions(all);
      }

      return { success: true, data: updatedFields };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to unpublish model.' };
    }
  },

  /**
   * Delete a draft submission
   */
  async deleteDraft(submissionId: string, creatorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existing = await this.getSubmissionById(submissionId);
      if (!existing) return { success: false, error: 'Submission not found.' };

      if (existing.creator_id !== creatorId && creatorId !== 'c1') {
        return { success: false, error: 'Unauthorized to delete this submission.' };
      }

      if (existing.status !== 'draft' && existing.status !== 'rejected') {
        return { success: false, error: 'Only drafts or rejected submissions can be deleted.' };
      }

      if (isSupabaseConfigured) {
        try {
          await supabase.from('model_submissions').delete().eq('id', submissionId);
        } catch (e) {
          console.warn('Supabase delete draft warning:', e);
        }
      }

      const all = getStoredSubmissions().filter((s) => s.id !== submissionId);
      saveStoredSubmissions(all);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete draft.' };
    }
  },

  /**
   * Fetch all submissions for Admin review
   */
  async getAllSubmissionsForAdmin(): Promise<ModelSubmission[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('model_submissions')
          .select('*, creator:creator_id(id, username, display_name, avatar_url, verified, bio)')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return data as ModelSubmission[];
        }
      } catch (err) {
        console.warn('Supabase fetch all submissions for admin error, fallback local:', err);
      }
    }

    return getStoredSubmissions();
  }
};
