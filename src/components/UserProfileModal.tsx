import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  Shield,
  LogOut,
  Sparkles,
  CheckCircle2,
  Copy,
  Calendar,
  Mail,
  Loader2,
  HelpCircle
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🛸', '🤖', '⚡', '🌌', '🚀', '🧠', '🔮', '💎', '👾', '🎯', '🔥', '🛡️'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { addToast, setView, openOnboarding } = useApp();

  const [displayName, setDisplayName] = useState(() => profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '');
  const [username, setUsername] = useState(() => profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || '');
  const [avatarUrl, setAvatarUrl] = useState(() => profile?.avatar_url || user?.user_metadata?.avatar_url || '🛸');
  const [isCreator, setIsCreator] = useState(() => Boolean(profile?.is_creator || user?.user_metadata?.is_creator));
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync state if profile is updated from remote
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '🛸');
      setIsCreator(Boolean(profile.is_creator));
    }
  }, [profile]);

  if (!isOpen || !user) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    addToast('User UUID copied to clipboard.', 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateProfile({
      display_name: displayName.trim() || username,
      username: username.trim(),
      avatar_url: avatarUrl,
      is_creator: isCreator
    });
    setIsSaving(false);

    if (res.success) {
      addToast('Profile updated successfully!', 'success');
      onClose();
    } else {
      addToast(res.error || 'Failed to update profile.', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut();
    addToast('Signed out of Agora.', 'info');
    onClose();
    setView('store');
  };

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080b]/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl glass-panel-heavy p-6 md:p-8 shadow-2xl border border-white/10 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-lg">
            {avatarUrl}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-black text-white">{displayName || 'AI Geek'}</h2>
              {isCreator && (
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 font-display text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                  Creator
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-slate-400">@{username || 'user'}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Avatar Selector */}
          <div>
            <label className="font-sans text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                    avatarUrl === emoji
                      ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-105 shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[11px] font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-xl glass-input px-3 py-2 font-sans text-xs text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[11px] font-semibold text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl glass-input px-3 py-2 font-sans text-xs text-white"
              />
            </div>
          </div>

          {/* Creator status toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
            <input
              type="checkbox"
              checked={isCreator}
              onChange={(e) => setIsCreator(e.target.checked)}
              className="rounded accent-cyan-400 h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="font-display text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={13} className="text-cyan-400" />
                Publisher & Model Creator Status
              </span>
              <span className="font-sans text-[10px] text-slate-400">
                Grants access to model publishing and deployment royalties.
              </span>
            </div>
          </label>

          {/* Metadata Card */}
          <div className="rounded-xl bg-black/40 border border-white/5 p-3 flex flex-col gap-2 text-xs text-slate-400 font-sans">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Mail size={13} /> Email:
              </span>
              <span className="text-slate-200 font-mono text-[11px]">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Shield size={13} /> User ID:
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[10px]"
              >
                {user.id.substring(0, 8)}...{user.id.substring(user.id.length - 4)}
                {copiedId ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar size={13} /> Joined:
              </span>
              <span className="text-slate-300">{createdDate}</span>
            </div>
          </div>

          {/* How Agora Works Interactive Tour Link */}
          <button
            type="button"
            onClick={() => {
              onClose();
              openOnboarding();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-xs font-medium text-cyan-300 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={15} className="text-cyan-400" />
              <span>How Agora Works (Onboarding Tour)</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              Reopen Tour →
            </span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-display text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-display text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
