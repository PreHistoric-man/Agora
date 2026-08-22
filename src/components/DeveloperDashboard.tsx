import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SubmissionService, generateSlug } from '../services/SubmissionService';
import { CreatorService } from '../services/CreatorService';
import type { ModelSubmission, ModelSubmissionDraft, SubmissionStatus } from '../types/submission';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Save,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Globe,
  Github,
  Tag,
  FileCode,
  Box,
  Rocket,
  Search,
  Filter,
  Check,
  RefreshCw,
  User,
  ArrowRight,
  Eye
} from 'lucide-react';

export const DeveloperDashboard: React.FC = () => {
  const { user, profile, isAuthenticated, openAuthModal, refreshProfile, switchRole } = useAuth();
  const {
    creatorSubmissions,
    submissionsLoading,
    refreshSubmissions,
    developerTab,
    setDeveloperTab,
    editingSubmissionId,
    setEditingSubmissionId,
    openBecomeCreatorModal,
    addToast,
    setView,
    setSelectedModelId,
    setSelectedCreatorId,
    handleSubmissionPublished
  } = useApp();

  const isCreator = profile?.role === 'creator' || profile?.role === 'admin' || profile?.creator_status === 'approved' || profile?.is_creator;
  const isPending = profile?.creator_status === 'pending';

  // Submissions Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Model Form State
  const [formData, setFormData] = useState<Partial<ModelSubmissionDraft>>({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    category: 'Reasoning',
    tags: ['AI', 'Open Weights'],
    version: '1.0.0',
    license: 'Apache 2.0',
    model_size: '',
    parameters: '',
    runtime: 'ollama',
    runtime_model_id: '',
    source_url: '',
    thumbnail_url: '',
    banner_url: '',
    deployable: true
  });

  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [activeSubmissionDetails, setActiveSubmissionDetails] = useState<ModelSubmission | null>(null);

  // Profile Settings Form
  const [profileDisplayName, setProfileDisplayName] = useState(profile?.display_name || '');
  const [profileBio, setProfileBio] = useState(profile?.bio || '');
  const [profileWebsite, setProfileWebsite] = useState(profile?.website_url || '');
  const [profileGithub, setProfileGithub] = useState(profile?.github_url || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync edit form data when editingSubmissionId changes
  useEffect(() => {
    if (editingSubmissionId) {
      const sub = creatorSubmissions.find((s) => s.id === editingSubmissionId);
      if (sub) {
        setFormData({
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          long_description: sub.long_description || '',
          category: sub.category,
          tags: sub.tags || ['AI'],
          version: sub.version,
          license: sub.license,
          model_size: sub.model_size || '',
          parameters: sub.parameters || '',
          runtime: sub.runtime || 'ollama',
          runtime_model_id: sub.runtime_model_id || '',
          source_url: sub.source_url,
          thumbnail_url: sub.thumbnail_url || '',
          banner_url: sub.banner_url || '',
          deployable: sub.deployable !== undefined ? sub.deployable : true
        });
      }
    } else if (developerTab === 'new-model') {
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        long_description: '',
        category: 'Reasoning',
        tags: ['AI', 'Open Weights'],
        version: '1.0.0',
        license: 'Apache 2.0',
        model_size: '',
        parameters: '',
        runtime: 'ollama',
        runtime_model_id: '',
        source_url: '',
        thumbnail_url: '',
        banner_url: '',
        deployable: true
      });
      setFormErrors({});
    }
  }, [editingSubmissionId, developerTab, creatorSubmissions]);

  // Overview stats calculation
  const stats = useMemo(() => {
    const published = creatorSubmissions.filter((s) => s.status === 'published').length;
    const pending = creatorSubmissions.filter((s) => s.status === 'pending_review').length;
    const drafts = creatorSubmissions.filter((s) => s.status === 'draft').length;
    const rejected = creatorSubmissions.filter((s) => s.status === 'rejected').length;
    const approved = creatorSubmissions.filter((s) => s.status === 'approved').length;
    return {
      published,
      pending,
      drafts,
      rejected,
      approved,
      total: creatorSubmissions.length
    };
  }, [creatorSubmissions]);

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return creatorSubmissions.filter((s) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [creatorSubmissions, searchQuery, statusFilter]);

  // Name change handler with auto-slug
  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug && prev.slug !== generateSlug(prev.name || '') ? prev.slug : generateSlug(val)
    }));
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !(formData.tags || []).includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove)
    }));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!formData.name?.trim()) {
      setFormErrors({ name: 'Model name is required to save a draft.' });
      addToast('Please provide a name for your draft model.', 'warning');
      return;
    }

    setIsSaving(true);
    const creatorId = user ? user.id : 'c1';

    if (editingSubmissionId) {
      const res = await SubmissionService.updateSubmission(editingSubmissionId, creatorId, formData);
      setIsSaving(false);
      if (res.success) {
        addToast('Draft updated successfully!', 'success');
        await refreshSubmissions();
      } else {
        addToast(res.error || 'Failed to save draft.', 'error');
      }
    } else {
      const res = await SubmissionService.createDraft(creatorId, profile || ({} as any), formData);
      setIsSaving(false);
      if (res.success && res.data) {
        addToast('New draft saved successfully!', 'success');
        setEditingSubmissionId(res.data.id);
        await refreshSubmissions();
      } else {
        addToast(res.error || 'Failed to create draft.', 'error');
      }
    }
  };

  // Submit For Review
  const handleSubmitForReview = async () => {
    const validation = SubmissionService.validateSubmission(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      addToast(firstError || 'Please complete all required fields.', 'error');
      return;
    }

    setShowSubmitConfirmModal(true);
  };

  const confirmSubmitForReview = async () => {
    setShowSubmitConfirmModal(false);
    setIsSaving(true);
    const creatorId = user ? user.id : 'c1';

    let targetSubmissionId = editingSubmissionId;

    if (!targetSubmissionId) {
      // First save draft
      const createRes = await SubmissionService.createDraft(creatorId, profile || ({} as any), formData);
      if (!createRes.success || !createRes.data) {
        setIsSaving(false);
        addToast(createRes.error || 'Failed to prepare submission.', 'error');
        return;
      }
      targetSubmissionId = createRes.data.id;
    } else {
      // Update fields first
      await SubmissionService.updateSubmission(targetSubmissionId, creatorId, formData);
    }

    // Submit for review
    const submitRes = await SubmissionService.submitForReview(targetSubmissionId, creatorId);
    setIsSaving(false);

    if (submitRes.success) {
      addToast('Model submitted for admin review! You can track its status in the dashboard.', 'success');
      await refreshSubmissions();
      setDeveloperTab('submissions');
      setEditingSubmissionId(null);
    } else {
      addToast(submitRes.error || 'Failed to submit model.', 'error');
    }
  };

  // Publish Approved Model
  const handlePublishModel = async (submissionId: string) => {
    const creatorId = user ? user.id : 'c1';
    setIsSaving(true);
    const res = await SubmissionService.publishModel(submissionId, creatorId);
    setIsSaving(false);

    if (res.success && res.data) {
      await handleSubmissionPublished(res.data);
    } else {
      addToast(res.error || 'Failed to publish model.', 'error');
    }
  };

  // Unpublish Model
  const handleUnpublishModel = async (submissionId: string) => {
    const creatorId = user ? user.id : 'c1';
    setIsSaving(true);
    const res = await SubmissionService.unpublishModel(submissionId, creatorId);
    setIsSaving(false);

    if (res.success) {
      addToast('Model unpublished from public marketplace.', 'info');
      await refreshSubmissions();
    } else {
      addToast(res.error || 'Failed to unpublish model.', 'error');
    }
  };

  // Delete Draft
  const handleDeleteDraft = async (submissionId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft submission?')) return;
    const creatorId = user ? user.id : 'c1';
    const res = await SubmissionService.deleteDraft(submissionId, creatorId);
    if (res.success) {
      addToast('Draft deleted.', 'info');
      if (editingSubmissionId === submissionId) {
        setEditingSubmissionId(null);
        setDeveloperTab('models');
      }
      await refreshSubmissions();
    } else {
      addToast(res.error || 'Could not delete draft.', 'error');
    }
  };

  // Save Creator Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const { updateProfile } = useAuth();
    const res = await updateProfile({
      display_name: profileDisplayName.trim(),
      bio: profileBio.trim(),
      website_url: profileWebsite.trim(),
      github_url: profileGithub.trim()
    });
    setIsSavingProfile(false);
    if (res.success) {
      addToast('Creator profile updated successfully!', 'success');
      await refreshProfile();
    } else {
      addToast(res.error || 'Failed to update profile.', 'error');
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-display bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Published
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-display bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 size={12} />
            Approved (Ready)
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-display bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock size={12} className="animate-spin" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-display bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-display bg-slate-500/10 text-slate-400 border border-slate-700">
            <Edit3 size={12} />
            Draft
          </span>
        );
    }
  };

  // If user is not logged in or not a creator, show friendly state
  if (!isAuthenticated && !isCreator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-950/40">
          <Rocket size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-4">
          Agora Developer & Creator Platform
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Publish, version, and distribute your AI models to developers worldwide. Provide local runtime weights for Ollama and vLLM or deploy on Agora cloud infrastructure.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => openAuthModal('login', 'developer')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Sign In to Developer Portal
          </button>
          <button
            onClick={() => {
              switchRole('creator');
              addToast('Activated demo Creator privileges!', 'success');
            }}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-200 font-display font-bold text-sm transition-colors cursor-pointer"
          >
            Explore as Demo Creator
          </button>
        </div>
      </div>
    );
  }

  if (!isCreator && isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl">
          <Clock size={40} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-3">
          Creator Application Under Review
        </h1>
        <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6">
          Your request to become an Agora Creator is currently being reviewed by the administration team. You will be notified once approved.
        </p>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 max-w-md mx-auto mb-6 text-left">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-cyan-300">Evaluating Agora features?</p>
              <p className="text-[11px] text-slate-400">Instantly activate creator role to test the model publishing workflow.</p>
            </div>
            <button
              onClick={() => {
                switchRole('creator');
                addToast('Creator permissions granted! You can now publish models.', 'success');
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-display font-bold cursor-pointer shrink-0"
            >
              Instant Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-950/40">
          <Rocket size={40} />
        </div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-3">
          Become an Agora Creator
        </h1>
        <p className="text-slate-300 text-sm max-w-lg mx-auto mb-8">
          Join leading AI researchers and model developers on Agora. Publish open weights, distribute to the Agora Desktop Launcher, and manage your models.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={openBecomeCreatorModal}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            Apply for Creator Access <ArrowRight size={16} />
          </button>
          <button
            onClick={() => {
              switchRole('creator');
              addToast('Creator access activated (Instant Test Mode)!', 'success');
            }}
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white font-display text-sm font-bold transition-colors cursor-pointer"
          >
            Instant Demo Creator
          </button>
        </div>
      </div>
    );
  }

  const currentEditingSub = editingSubmissionId ? creatorSubmissions.find((s) => s.id === editingSubmissionId) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-10 animate-fade-in text-left">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d131f] to-slate-900 border border-cyan-500/20 p-6 md:p-8 shadow-2xl mb-8">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-2xl shadow-inner shrink-0">
              {profile?.avatar_url || '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                  Developer Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold font-display flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified Creator
                </span>
                {profile?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold font-display">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-slate-200 font-semibold">{profile?.display_name || profile?.username || 'Creator'}</span> • Manage AI model drafts, submissions, and marketplace releases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingSubmissionId(null);
                setDeveloperTab('new-model');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-xs hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <PlusCircle size={15} /> Add New Model
            </button>

            <button
              onClick={() => {
                setSelectedCreatorId(user?.id || 'c1');
                setView('creator');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white font-display text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe size={14} className="text-cyan-400" /> Public Page
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setDeveloperTab('dashboard');
              setEditingSubmissionId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              developerTab === 'dashboard'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={14} /> Overview
          </button>

          <button
            onClick={() => {
              setDeveloperTab('models');
              setEditingSubmissionId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              developerTab === 'models'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} /> My Models ({stats.total})
          </button>

          <button
            onClick={() => {
              setDeveloperTab('new-model');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              developerTab === 'new-model'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle size={14} /> {editingSubmissionId ? 'Edit Model' : 'New Model Submission'}
          </button>

          <button
            onClick={() => {
              setDeveloperTab('submissions');
              setEditingSubmissionId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              developerTab === 'submissions'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={14} /> Submissions History
          </button>

          <button
            onClick={() => {
              setDeveloperTab('profile');
              setEditingSubmissionId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              developerTab === 'profile'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={14} /> Creator Profile
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: OVERVIEW / DASHBOARD */}
      {/* ========================================================== */}
      {developerTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-bold text-slate-400">Published</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <div className="text-2xl font-black font-display text-white">{stats.published}</div>
              <p className="text-[11px] text-slate-400 mt-1">Live in marketplace</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-bold text-slate-400">Pending Review</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock size={16} />
                </span>
              </div>
              <div className="text-2xl font-black font-display text-white">{stats.pending}</div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting review</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-bold text-slate-400">Approved</span>
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Rocket size={16} />
                </span>
              </div>
              <div className="text-2xl font-black font-display text-white">{stats.approved}</div>
              <p className="text-[11px] text-slate-400 mt-1">Ready to publish</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-slate-500/40 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-bold text-slate-400">Drafts</span>
                <span className="p-1.5 rounded-lg bg-slate-500/10 text-slate-300">
                  <Edit3 size={16} />
                </span>
              </div>
              <div className="text-2xl font-black font-display text-white">{stats.drafts}</div>
              <p className="text-[11px] text-slate-400 mt-1">Incomplete drafts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-rose-500/40 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-bold text-slate-400">Rejected</span>
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <XCircle size={16} />
                </span>
              </div>
              <div className="text-2xl font-black font-display text-white">{stats.rejected}</div>
              <p className="text-[11px] text-slate-400 mt-1">Requires edits</p>
            </div>
          </div>

          {/* Quick Action / CTA Banner if empty */}
          {creatorSubmissions.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white/[0.02] border border-dashed border-white/15 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <Box size={32} />
              </div>
              <h3 className="text-lg font-bold font-display text-white mb-2">You haven't published any models yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Start sharing your foundation models, fine-tuned weights, and AI inference runtimes with developers worldwide.
              </p>
              <button
                onClick={() => {
                  setEditingSubmissionId(null);
                  setDeveloperTab('new-model');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
              >
                <PlusCircle size={15} /> Create Your First Model
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-base font-bold font-display text-white">Recent Models & Submissions</h3>
                <button
                  onClick={() => setDeveloperTab('models')}
                  className="text-xs font-display font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  View All Models →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creatorSubmissions.slice(0, 6).map((sub) => (
                  <div
                    key={sub.id}
                    className="group relative rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 p-5 shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                            {sub.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {sub.category} • v{sub.version}
                          </span>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                        {sub.description}
                      </p>

                      {sub.status === 'rejected' && sub.admin_notes && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] mb-4">
                          <strong className="block text-rose-400 font-bold mb-0.5">Admin Feedback:</strong>
                          {sub.admin_notes}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">
                        Updated {new Date(sub.updated_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {sub.status === 'draft' && (
                          <button
                            onClick={() => {
                              setEditingSubmissionId(sub.id);
                              setDeveloperTab('new-model');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-display font-bold transition-colors cursor-pointer"
                          >
                            Edit Draft
                          </button>
                        )}

                        {sub.status === 'approved' && (
                          <button
                            onClick={() => handlePublishModel(sub.id)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-display font-bold transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                          >
                            Publish 🚀
                          </button>
                        )}

                        {sub.status === 'rejected' && (
                          <button
                            onClick={() => {
                              setEditingSubmissionId(sub.id);
                              setDeveloperTab('new-model');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-display font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                          >
                            Fix & Resubmit
                          </button>
                        )}

                        {sub.status === 'published' && (
                          <button
                            onClick={() => {
                              setSelectedModelId(sub.published_model_id || sub.slug);
                              setView('model-detail');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-display font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye size={12} /> View Live
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: MY MODELS */}
      {/* ========================================================== */}
      {developerTab === 'models' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models by name or category..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
              {['all', 'published', 'approved', 'pending_review', 'draft', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
              <p className="text-sm text-slate-400 mb-4">No models match your current filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-display font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.01]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 font-display uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4">Model</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Runtime</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{sub.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{sub.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                          {sub.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-400">v{sub.version}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono">
                          {sub.runtime}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(sub.status)}</td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(sub.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === 'draft' && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingSubmissionId(sub.id);
                                  setDeveloperTab('new-model');
                                }}
                                title="Edit Draft"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDraft(sub.id)}
                                title="Delete Draft"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}

                          {sub.status === 'approved' && (
                            <button
                              onClick={() => handlePublishModel(sub.id)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
                            >
                              <Rocket size={12} /> Publish
                            </button>
                          )}

                          {sub.status === 'published' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedModelId(sub.published_model_id || sub.slug);
                                  setView('model-detail');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-display font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                onClick={() => handleUnpublishModel(sub.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-display font-bold transition-colors cursor-pointer"
                              >
                                Unpublish
                              </button>
                            </>
                          )}

                          {sub.status === 'rejected' && (
                            <button
                              onClick={() => {
                                setEditingSubmissionId(sub.id);
                                setDeveloperTab('new-model');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-display font-bold hover:bg-rose-500/30 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 size={12} /> Edit & Resubmit
                            </button>
                          )}

                          {sub.status === 'pending_review' && (
                            <span className="text-[11px] text-amber-400 font-semibold italic">
                              In Review
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: ADD / EDIT MODEL SUBMISSION FORM */}
      {/* ========================================================== */}
      {developerTab === 'new-model' && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                {editingSubmissionId ? `Editing Model: ${formData.name || 'Draft'}` : 'Submit New AI Model'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in model metadata, runtime compatibility, and source repository information.
              </p>
            </div>

            {currentEditingSub && getStatusBadge(currentEditingSub.status)}
          </div>

          {/* Rejected feedback notification */}
          {currentEditingSub?.status === 'rejected' && currentEditingSub.admin_notes && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-300 font-display mb-1">
                    Rejection Feedback from Agora Review Team:
                  </h4>
                  <p className="leading-relaxed">{currentEditingSub.admin_notes}</p>
                  <p className="text-[11px] text-rose-400 mt-2 font-semibold">
                    Please make the necessary updates below and click "Submit for Review".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Under Review Notice */}
          {currentEditingSub?.status === 'pending_review' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
              <Clock size={20} className="shrink-0 animate-spin" />
              <div>
                <h4 className="font-bold font-display">This model is currently in review.</h4>
                <p className="text-[11px] text-amber-400/80">
                  Agora administrators are reviewing your submission. You will be able to edit once a decision is made.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
              <h3 className="text-sm font-bold font-display text-cyan-300 flex items-center gap-2">
                <Box size={16} /> 1. Basic Model Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Model Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Mistral-7B-Reasoning-v2"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder:text-slate-500 focus:outline-none ${
                      formErrors.name ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    URL Slug <span className="text-slate-500">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    placeholder="mistral-7b-reasoning-v2"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                  Short Description <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  placeholder="One sentence summary of the model capabilities..."
                  disabled={currentEditingSub?.status === 'pending_review'}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder:text-slate-500 focus:outline-none ${
                    formErrors.description ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                  Detailed Documentation & Architecture
                </label>
                <textarea
                  value={formData.long_description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, long_description: e.target.value }))}
                  rows={4}
                  placeholder="Extended description, training data, benchmarks, use cases, prompt format..."
                  disabled={currentEditingSub?.status === 'pending_review'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Category <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as any }))}
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14161f] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {['Reasoning', 'Coding', 'Image', 'Video', 'Audio', 'Vision', 'Writing', 'Agents', 'Speech', 'Science'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Version <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.version || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                  Tags & Badges
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {(formData.tags || []).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1"
                    >
                      <Tag size={10} /> {t}
                      {currentEditingSub?.status !== 'pending_review' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400 ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {currentEditingSub?.status !== 'pending_review' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a tag (e.g. Local AI, Quantized, Math)..."
                      className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-display font-bold text-slate-200 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Technical Specifications & Runtime */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
              <h3 className="text-sm font-bold font-display text-cyan-300 flex items-center gap-2">
                <Cpu size={16} /> 2. Technical Specifications & Runtime
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Parameters Count / Architecture
                  </label>
                  <input
                    type="text"
                    value={formData.parameters || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parameters: e.target.value }))}
                    placeholder="e.g. 7B Dense, 671B MoE (37B active)"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Model Weights Size
                  </label>
                  <input
                    type="text"
                    value={formData.model_size || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, model_size: e.target.value }))}
                    placeholder="e.g. 4.2 GB GGUF, 14.8 GB FP16"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Supported Runtime <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={formData.runtime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, runtime: e.target.value }))}
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14161f] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="ollama">Ollama (Local Desktop & Server)</option>
                    <option value="vLLM">vLLM (High-Throughput GPU)</option>
                    <option value="TGI">TGI (Hugging Face Text Gen)</option>
                    <option value="ONNX">ONNX / WebGPU</option>
                    <option value="Custom">Custom Container Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Runtime Model Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.runtime_model_id || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, runtime_model_id: e.target.value }))}
                    placeholder="e.g. mistral:7b-instruct-q4_K_M"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    License <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.license || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, license: e.target.value }))}
                    placeholder="e.g. Apache 2.0, MIT, Llama 3.3 Community"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Source Repository / Weights URL <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.source_url || ''}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, source_url: e.target.value }));
                      if (formErrors.source_url) setFormErrors((prev) => ({ ...prev, source_url: '' }));
                    }}
                    placeholder="https://huggingface.co/your-org/model-name"
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder:text-slate-500 focus:outline-none ${
                      formErrors.source_url ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                    }`}
                  />
                  {formErrors.source_url && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.source_url}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Media & Presentation */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
              <h3 className="text-sm font-bold font-display text-cyan-300 flex items-center gap-2">
                <Globe size={16} /> 3. Media & Presentation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                    Banner Background URL
                  </label>
                  <input
                    type="url"
                    value={formData.banner_url || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, banner_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    disabled={currentEditingSub?.status === 'pending_review'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {currentEditingSub?.status !== 'pending_review' && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div>
                  {editingSubmissionId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(editingSubmissionId)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-display text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Delete Draft
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-display font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <Send size={14} /> Submit for Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: SUBMISSIONS HISTORY */}
      {/* ========================================================== */}
      {developerTab === 'submissions' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-white">Submissions History</h2>
              <p className="text-xs text-slate-400">Track review dates, admin feedback, and approval lifecycle.</p>
            </div>
            <button
              onClick={refreshSubmissions}
              disabled={submissionsLoading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} className={submissionsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {creatorSubmissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
              <Clock size={32} className="mx-auto text-slate-500 mb-3" />
              <p className="text-sm text-slate-400">No submissions found in your history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {creatorSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base text-white">{sub.name}</h4>
                      {getStatusBadge(sub.status)}
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl line-clamp-1">{sub.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Created: {new Date(sub.created_at).toLocaleDateString()}</span>
                      {sub.submitted_at && (
                        <span>Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</span>
                      )}
                      {sub.reviewed_at && (
                        <span>Reviewed: {new Date(sub.reviewed_at).toLocaleDateString()}</span>
                      )}
                      {sub.published_at && (
                        <span className="text-emerald-400 font-semibold">
                          Published: {new Date(sub.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {sub.admin_notes && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                        <strong className="block text-rose-400 font-bold mb-0.5">Admin Review Feedback:</strong>
                        {sub.admin_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sub.status === 'approved' && (
                      <button
                        onClick={() => handlePublishModel(sub.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20"
                      >
                        Publish Live 🚀
                      </button>
                    )}

                    {sub.status === 'rejected' && (
                      <button
                        onClick={() => {
                          setEditingSubmissionId(sub.id);
                          setDeveloperTab('new-model');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-display font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                      >
                        Edit & Resubmit
                      </button>
                    )}

                    {sub.status === 'published' && (
                      <button
                        onClick={() => {
                          setSelectedModelId(sub.published_model_id || sub.slug);
                          setView('model-detail');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-display font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye size={13} /> View on Marketplace
                      </button>
                    )}

                    {sub.status === 'draft' && (
                      <button
                        onClick={() => {
                          setEditingSubmissionId(sub.id);
                          setDeveloperTab('new-model');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-display font-bold transition-colors cursor-pointer"
                      >
                        Resume Draft
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 5: CREATOR PROFILE SETTINGS */}
      {/* ========================================================== */}
      {developerTab === 'profile' && (
        <div className="space-y-6 animate-fade-in max-w-2xl">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Public Creator Profile</h2>
            <p className="text-xs text-slate-400">
              Customize your public creator page, bio, and social repository links.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <div>
              <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                Display Name or Organization
              </label>
              <input
                type="text"
                value={profileDisplayName}
                onChange={(e) => setProfileDisplayName(e.target.value)}
                placeholder="e.g. Agora Research Lab"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-display text-slate-300 mb-1.5">
                Creator Bio
              </label>
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                rows={3}
                placeholder="Tell developers about your models, research focus, and quantization work..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-display text-slate-300 mb-1.5 flex items-center gap-1">
                  <Globe size={13} className="text-slate-400" /> Website URL
                </label>
                <input
                  type="url"
                  value={profileWebsite}
                  onChange={(e) => setProfileWebsite(e.target.value)}
                  placeholder="https://yourdomain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-display text-slate-300 mb-1.5 flex items-center gap-1">
                  <Github size={13} className="text-slate-400" /> GitHub / HF URL
                </label>
                <input
                  type="url"
                  value={profileGithub}
                  onChange={(e) => setProfileGithub(e.target.value)}
                  placeholder="https://github.com/your-org"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCreatorId(user?.id || 'c1');
                  setView('creator');
                }}
                className="text-xs font-display font-bold text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <ExternalLink size={13} /> View Public Creator Page
              </button>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal: Submit for Review */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1017] border border-cyan-500/30 p-6 shadow-2xl text-left">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <Send size={22} />
            </div>
            <h3 className="text-lg font-bold font-display text-white mb-2">Submit Model for Review?</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Your model "<span className="text-cyan-300 font-semibold">{formData.name}</span>" will be sent to the Agora administration team for verification. Once approved, you will be able to publish it directly to the Agora Marketplace and Desktop Launcher.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-display font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitForReview}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {isSaving ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
