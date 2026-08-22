import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SubmissionService } from '../services/SubmissionService';
import { CreatorService } from '../services/CreatorService';
import type { ModelSubmission, CreatorApplication } from '../types/submission';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Layers,
  Users,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  RefreshCw,
  Rocket,
  Globe,
  Github,
  Cpu,
  FileCode,
  Tag,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, profile, switchRole } = useAuth();
  const { addToast, refreshModels, refreshSubmissions, setView, setSelectedModelId } = useApp();

  const [activeTab, setActiveTab] = useState<'submissions' | 'creators'>('submissions');
  const [submissions, setSubmissions] = useState<ModelSubmission[]>([]);
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Submissions filter
  const [subStatusFilter, setSubStatusFilter] = useState<string>('pending_review');
  const [subSearch, setSubSearch] = useState('');

  // Creators filter
  const [appStatusFilter, setAppStatusFilter] = useState<string>('pending');

  // Modals
  const [selectedSubForReview, setSelectedSubForReview] = useState<ModelSubmission | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const [rejectAppModalOpen, setRejectAppModalOpen] = useState(false);
  const [rejectAppNotes, setRejectAppNotes] = useState('');
  const [rejectAppTargetId, setRejectAppTargetId] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [subs, apps] = await Promise.all([
        SubmissionService.getAllSubmissionsForAdmin(),
        CreatorService.getAllApplications()
      ]);
      setSubmissions(subs);
      setApplications(apps);
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleApproveSubmission = async (submissionId: string) => {
    const adminId = user?.id || 'admin_1';
    const res = await SubmissionService.approveSubmission(submissionId, adminId);
    if (res.success) {
      addToast('Model submission approved!', 'success');
      await loadAllData();
      await refreshSubmissions();
    } else {
      addToast(res.error || 'Failed to approve submission.', 'error');
    }
  };

  const handleOpenRejectModal = (submissionId: string) => {
    setRejectTargetId(submissionId);
    setRejectNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmRejectSubmission = async () => {
    if (!rejectTargetId) return;
    if (!rejectNotes.trim()) {
      addToast('Please provide a feedback reason for rejection.', 'warning');
      return;
    }

    const adminId = user?.id || 'admin_1';
    const res = await SubmissionService.rejectSubmission(rejectTargetId, adminId, rejectNotes.trim());
    setRejectModalOpen(false);

    if (res.success) {
      addToast('Submission rejected and creator notified with feedback.', 'info');
      await loadAllData();
      await refreshSubmissions();
    } else {
      addToast(res.error || 'Failed to reject submission.', 'error');
    }
  };

  const handlePublishSubmission = async (submissionId: string, creatorId: string) => {
    const res = await SubmissionService.publishModel(submissionId, creatorId);
    if (res.success) {
      addToast('Model published live to Agora marketplace!', 'success');
      await loadAllData();
      await refreshModels();
      await refreshSubmissions();
    } else {
      addToast(res.error || 'Failed to publish model.', 'error');
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    const adminId = user?.id || 'admin_1';
    const res = await CreatorService.approveApplication(applicationId, adminId);
    if (res.success) {
      addToast('Creator application approved! User granted creator privileges.', 'success');
      await loadAllData();
    } else {
      addToast(res.error || 'Failed to approve application.', 'error');
    }
  };

  const handleOpenRejectAppModal = (applicationId: string) => {
    setRejectAppTargetId(applicationId);
    setRejectAppNotes('');
    setRejectAppModalOpen(true);
  };

  const handleConfirmRejectApp = async () => {
    if (!rejectAppTargetId) return;
    const adminId = user?.id || 'admin_1';
    const res = await CreatorService.rejectApplication(rejectAppTargetId, adminId, rejectAppNotes.trim());
    setRejectAppModalOpen(false);

    if (res.success) {
      addToast('Creator application rejected.', 'info');
      await loadAllData();
    } else {
      addToast(res.error || 'Failed to reject application.', 'error');
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchStatus = subStatusFilter === 'all' || s.status === subStatusFilter;
    const matchSearch =
      subSearch.trim() === '' ||
      s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.creator_name.toLowerCase().includes(subSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredApplications = applications.filter((a) => {
    return appStatusFilter === 'all' || a.status === appStatusFilter;
  });

  const pendingSubCount = submissions.filter((s) => s.status === 'pending_review').length;
  const pendingAppCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-10 animate-fade-in text-left">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 p-6 md:p-8 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-2xl shadow-inner shrink-0">
              <ShieldAlert size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                  Agora Admin Review Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold font-display">
                  Phase 1 Moderation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review model weights submissions, verify creator access requests, and maintain marketplace quality standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white font-display text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => setView('developer')}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-display text-xs font-bold transition-colors cursor-pointer"
            >
              Creator Portal →
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} /> Model Submissions
            {pendingSubCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-extrabold font-mono">
                {pendingSubCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('creators')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'creators'
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} /> Creator Applications
            {pendingAppCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold font-mono">
                {pendingAppCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: MODEL SUBMISSIONS */}
      {/* ========================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Search submission or creator..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
              {['pending_review', 'approved', 'published', 'rejected', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSubStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                    subStatusFilter === st
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
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
              <CheckCircle2 size={32} className="mx-auto text-slate-500 mb-3" />
              <p className="text-sm text-slate-400">No model submissions match this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold font-display text-white">{sub.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
                        {sub.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-mono">
                        {sub.runtime}
                      </span>
                      {sub.status === 'pending_review' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-display">
                          Pending Review
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold font-display">
                          Approved
                        </span>
                      )}
                      {sub.status === 'published' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-display">
                          Live on Marketplace
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold font-display">
                          Rejected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{sub.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Creator: <strong className="text-white">{sub.creator_name}</strong></span>
                      <span>Version: <strong className="text-slate-200">v{sub.version}</strong></span>
                      <span>License: <strong className="text-slate-200">{sub.license}</strong></span>
                      {sub.parameters && <span>Params: <strong className="text-slate-200">{sub.parameters}</strong></span>}
                      {sub.source_url && (
                        <a
                          href={sub.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={11} /> Source Repo
                        </a>
                      )}
                    </div>

                    {sub.admin_notes && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                        <strong>Reviewer Feedback:</strong> {sub.admin_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedSubForReview(sub)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-display text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye size={13} /> View Specs
                    </button>

                    {sub.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleOpenRejectModal(sub.id)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-display text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <X size={13} /> Reject
                        </button>
                        <button
                          onClick={() => handleApproveSubmission(sub.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1"
                        >
                          <Check size={14} /> Approve
                        </button>
                      </>
                    )}

                    {sub.status === 'approved' && (
                      <button
                        onClick={() => handlePublishSubmission(sub.id, sub.creator_id)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
                      >
                        <Rocket size={13} /> Publish to Store
                      </button>
                    )}

                    {sub.status === 'published' && (
                      <button
                        onClick={() => {
                          setSelectedModelId(sub.published_model_id || sub.slug);
                          setView('model-detail');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-display font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={13} /> View Live
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
      {/* TAB 2: CREATOR APPLICATIONS */}
      {/* ========================================================== */}
      {activeTab === 'creators' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setAppStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold capitalize transition-colors cursor-pointer ${
                  appStatusFilter === st
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
              <Users size={32} className="mx-auto text-slate-500 mb-3" />
              <p className="text-sm text-slate-400">No creator applications match this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold font-display text-white">{app.display_name}</h4>
                        <span className="text-xs text-slate-400">{app.email}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-display uppercase tracking-wider ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-300 leading-relaxed">
                      {app.bio}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {app.website_url && (
                        <a
                          href={app.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Globe size={12} /> Website
                        </a>
                      )}
                      {app.github_url && (
                        <a
                          href={app.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Github size={12} /> GitHub / HF
                        </a>
                      )}
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleOpenRejectAppModal(app.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-display font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveApplication(app.id)}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-display font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        Approve Creator
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Full Specs Inspector */}
      {selectedSubForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e1017] border border-purple-500/30 p-6 md:p-8 shadow-2xl text-left">
            <button
              onClick={() => setSelectedSubForReview(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                <Box size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">{selectedSubForReview.name}</h3>
                <p className="text-xs text-slate-400">By {selectedSubForReview.creator_name} • v{selectedSubForReview.version}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-white/5">
                <strong className="block text-slate-400 mb-1">Description:</strong>
                {selectedSubForReview.description}
              </div>

              {selectedSubForReview.long_description && (
                <div className="p-3 rounded-xl bg-white/5">
                  <strong className="block text-slate-400 mb-1">Documentation & Details:</strong>
                  <p className="whitespace-pre-wrap">{selectedSubForReview.long_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block">Category</span>
                  <strong className="text-white">{selectedSubForReview.category}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block">License</span>
                  <strong className="text-white">{selectedSubForReview.license}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block">Runtime Target</span>
                  <strong className="text-indigo-300 font-mono">{selectedSubForReview.runtime}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block">Parameters</span>
                  <strong className="text-white">{selectedSubForReview.parameters || 'N/A'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block">Model Size</span>
                  <strong className="text-white">{selectedSubForReview.model_size || 'N/A'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 block">Runtime Identifier</span>
                  <strong className="text-white font-mono">{selectedSubForReview.runtime_model_id || 'N/A'}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">Source Repository</span>
                  <span className="text-cyan-400 truncate block max-w-sm">{selectedSubForReview.source_url}</span>
                </div>
                {selectedSubForReview.source_url && (
                  <a
                    href={selectedSubForReview.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submission Rejection with Feedback Notes */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1017] border border-rose-500/30 p-6 shadow-2xl text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
              <XCircle size={24} />
            </div>
            <h3 className="text-lg font-bold font-display text-white mb-2">Reject Model Submission</h3>
            <p className="text-xs text-slate-300 mb-4">
              Provide feedback for the creator explaining what needs to be revised before approval.
            </p>

            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Please clarify runtime model identifier and include benchmark references in the documentation..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 resize-none mb-4"
              required
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-display font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectSubmission}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs transition-colors cursor-pointer"
              >
                Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Application Rejection */}
      {rejectAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1017] border border-rose-500/30 p-6 shadow-2xl text-left">
            <h3 className="text-lg font-bold font-display text-white mb-2">Reject Creator Application</h3>
            <p className="text-xs text-slate-300 mb-4">
              Optional feedback reason for why the creator application is being declined.
            </p>

            <textarea
              value={rejectAppNotes}
              onChange={(e) => setRejectAppNotes(e.target.value)}
              rows={3}
              placeholder="Reason for declining application..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 resize-none mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectAppModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-display font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectApp}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs transition-colors cursor-pointer"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
