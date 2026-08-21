import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { ViewType } from '../context/AppContext';
import {
  Search,
  Heart,
  Bell,
  Compass,
  Library as LibIcon,
  Wrench,
  Users,
  Flame,
  Cloud,
  Tag,
  LogIn,
  User,
  LogOut,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setView,
    models,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationsRead
  } = useApp();

  const {
    user,
    profile,
    isAuthenticated,
    openAuthModal,
    signOut
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const wishlistedCount = models.filter((m) => m.wishlisted).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const discountedCount = models.filter((m) => m.isDiscounted).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'discover' && currentView !== 'launch') {
      setView('discover');
    }
  };

  const navItems: Array<{ label: string; view: ViewType; icon: any; badge?: string; protected?: boolean }> = [
    { label: 'Store', view: 'store', icon: Flame },
    { label: 'Discover', view: 'discover', icon: Compass },
    { label: 'Discounts', view: 'discounts', icon: Tag, badge: `${discountedCount} Deals` },
    { label: 'Library', view: 'library', icon: LibIcon, protected: true },
    { label: 'Deployments', view: 'deployments', icon: Cloud, protected: true },
    { label: 'Workshop', view: 'workshop', icon: Wrench },
    { label: 'Community', view: 'community', icon: Users }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.protected && !isAuthenticated) {
      openAuthModal('login', item.view);
      return;
    }
    setView(item.view);
  };

  const handleSignOut = async () => {
    setShowUserDropdown(false);
    await signOut();
    if (currentView === 'library' || currentView === 'deployments' || currentView === 'deployment-wizard' || currentView === 'deployment-detail') {
      setView('store');
    }
  };

  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || '🛸';
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'AI Geek';
  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'geek';
  const isCreator = Boolean(profile?.is_creator || user?.user_metadata?.is_creator);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-md px-6 py-3 select-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left Side: Brand Logo & Slogan */}
          <div
            onClick={() => setView('store')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 font-display text-lg font-black text-white shadow-lg group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all duration-300">
              A
              <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-widest bg-gradient-to-r from-white via-cyan-200 to-indigo-200 bg-clip-text text-transparent group-hover:to-white transition-all">
                AGORA
              </span>
              <span className="font-sans text-[10px] font-medium text-cyan-400/80 -mt-1 tracking-tight">
                Gathering Place for Ai Geeks
              </span>
            </div>
          </div>

          {/* Center: Main Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              const isDiscount = item.view === 'discounts';
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg font-display text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? isDiscount
                        ? 'text-amber-300 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'text-cyan-400 bg-cyan-500/5'
                      : isDiscount
                      ? 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={isDiscount ? 'text-amber-400 animate-pulse' : ''} />
                  {item.label}
                  {item.badge && (
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${
                        isDiscount
                          ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side: Search, Wishlist, Notification, Profile / Auth */}
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative hidden sm:block w-44 lg:w-60">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-lg glass-input pl-9 pr-4 py-2 font-sans text-xs text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs font-semibold px-1 rounded hover:bg-white/5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setView('discover')}
              className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Search size={18} />
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => setView('wishlist')}
              className={`relative p-2 rounded-lg transition-all ${
                currentView === 'wishlist'
                  ? 'text-pink-500 bg-pink-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Wishlist"
            >
              <Heart size={18} fill={currentView === 'wishlist' ? 'currentColor' : 'none'} />
              {wishlistedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 font-sans text-[10px] font-bold text-white ring-2 ring-[#0b0c10]">
                  {wishlistedCount}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadNotifications > 0) {
                    markNotificationsRead();
                  }
                }}
                className={`p-2 rounded-lg transition-all ${
                  showNotifications
                    ? 'text-cyan-400 bg-cyan-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 font-sans text-[10px] font-bold text-white ring-2 ring-[#0b0c10] animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-xl glass-panel-heavy p-2 shadow-2xl animate-fade-in z-50">
                  <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                    <span className="font-display text-sm font-semibold text-white">Notifications</span>
                    {unreadNotifications > 0 && (
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-cyan-400">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  <div className="mt-1 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-500 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex flex-col gap-1 border-b border-white/5 p-3 last:border-none hover:bg-white/5 rounded-lg transition-all cursor-pointer ${
                            !n.read ? 'bg-cyan-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-display text-xs font-bold text-slate-200">{n.title}</span>
                            <span className="font-sans text-[9px] text-slate-500 shrink-0">{n.time}</span>
                          </div>
                          <p className="font-sans text-[10px] text-slate-400 leading-relaxed">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication / User Profile Section */}
            {isAuthenticated ? (
              <div className="relative border-l border-white/10 pl-3">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center font-display text-xs font-extrabold text-white ring-2 ring-white/10 group-hover:ring-cyan-400 transition-all shrink-0">
                    {avatar}
                    <div
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#0b0c10]"
                      title="Online"
                    ></div>
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-sans text-xs font-bold text-slate-200 max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <ChevronDown size={12} className="text-slate-400" />
                    </div>
                    <span className="font-sans text-[9px] text-slate-500 flex items-center gap-1">
                      {isCreator && <Sparkles size={10} className="text-cyan-400" />}
                      {isCreator ? 'Creator' : `@${username}`}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-2xl glass-panel-heavy p-2 shadow-2xl animate-fade-in z-50 border border-white/10 text-left">
                    <div className="p-3 border-b border-white/5 mb-1 bg-white/[0.02] rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{avatar}</span>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-display text-xs font-bold text-white truncate">{displayName}</span>
                          <span className="font-sans text-[10px] text-slate-400 truncate">{user?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowProfileModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer w-full text-left"
                      >
                        <User size={14} className="text-cyan-400" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setView('library');
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer w-full text-left"
                      >
                        <LibIcon size={14} className="text-violet-400" />
                        <span>My AI Library</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setView('deployments');
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer w-full text-left"
                      >
                        <Cloud size={14} className="text-indigo-400" />
                        <span>Deployments & APIs</span>
                      </button>

                      <div className="h-px bg-white/5 my-1"></div>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer w-full text-left font-semibold"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out: Sign In & Register Buttons */
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-display text-xs font-bold transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-display text-xs font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
