import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { ViewType } from '../context/AppContext';
import {
  Search,
  Heart,
  Bell,
  Compass,
  Flame,
  LogIn,
  User,
  LogOut,
  Scale,
  ShoppingCart,
  Server,
  Zap,
  ChevronDown
} from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setView,
    models,
    cart,
    activeApis,
    comparisonModelIds,
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
  const cartCount = cart.length;
  const activeApisCount = activeApis.length;
  const compareCount = comparisonModelIds.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'discover') {
      setView('discover');
    }
  };

  // Nav Items per user request: Home, Models, Compare, API Marketplace, My APIs, Cart
  const navItems: Array<{
    label: string;
    view: ViewType;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { label: 'Home', view: 'store', icon: Flame },
    { label: 'Models', view: 'discover', icon: Compass },
    {
      label: 'Compare',
      view: 'compare',
      icon: Scale,
      badge: compareCount > 0 ? compareCount : undefined,
      badgeColor: 'bg-indigo-500'
    },
    { label: 'API Playground', view: 'try', icon: Zap },
    {
      label: 'My APIs',
      view: 'my-apis',
      icon: Server,
      badge: activeApisCount > 0 ? `${activeApisCount} Active` : undefined,
      badgeColor: 'bg-emerald-500'
    }
  ];

  const handleNavClick = (view: ViewType) => {
    setView(view);
  };

  const handleSignOut = async () => {
    setShowUserDropdown(false);
    await signOut();
    setView('store');
  };

  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || '🛸';
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'AI Developer';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-md px-4 sm:px-6 py-3 select-none text-left">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 md:gap-4">
          {/* Left Side: Brand Logo */}
          <div
            onClick={() => setView('store')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 font-display text-lg font-black text-white shadow-lg group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all duration-300">
              A
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-indigo-200 bg-clip-text text-transparent group-hover:to-white transition-all">
                  AGORA
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-black uppercase text-cyan-300 border border-cyan-500/30">
                  AI APIs
                </span>
              </div>
              <span className="font-sans text-[10px] font-medium text-cyan-400/80 -mt-1 tracking-tight">
                AI Model API Marketplace
              </span>
            </div>
          </div>

          {/* Center: Main Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.view)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl font-display text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.15)] border border-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  {item.label}
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full ${item.badgeColor || 'bg-cyan-500'} px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar Input */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs mx-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search AI APIs..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-xl glass-input pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Right Side: Cart, Wishlist, Notifications & User */}
          <div className="flex items-center gap-2 shrink-0">
            {/* API Access Cart Button */}
            <button
              onClick={() => setView('cart')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer border ${
                currentView === 'cart'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10'
              }`}
            >
              <ShoppingCart size={15} className="text-cyan-400" />
              <span>Cart</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  cartCount > 0
                    ? 'bg-cyan-500 text-black font-black animate-pulse'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {cartCount}
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setView('wishlist')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Saved APIs"
            >
              <Heart size={16} />
              {wishlistedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {wishlistedCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadNotifications > 0) markNotificationsRead();
                }}
                className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Bell size={16} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-black animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-heavy border border-cyan-500/30 p-4 shadow-2xl z-50 animate-slide-up">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <span className="font-display text-xs font-bold text-white">Platform Updates</span>
                    <span className="text-[10px] text-cyan-400">Sandbox Feed</span>
                  </div>
                  <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                        <span className="font-semibold text-white block mb-0.5">{n.title}</span>
                        <span className="text-slate-400 text-[11px] block leading-relaxed">{n.content}</span>
                        <span className="text-[9px] text-slate-500 block mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  <span className="text-sm">{avatar}</span>
                  <span className="hidden sm:inline font-display text-xs font-bold text-white max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel-heavy border border-white/10 p-2 shadow-2xl z-50 animate-slide-up text-xs">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setView('my-apis');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Server size={14} className="text-cyan-400" />
                      My APIs Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <User size={14} className="text-indigo-400" />
                      Developer Settings
                    </button>
                    <div className="my-1 border-t border-white/5"></div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <LogIn size={13} />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden items-center justify-between overflow-x-auto gap-1 pt-2.5 mt-2 border-t border-white/5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.view)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-display font-medium whitespace-nowrap ${
                  isActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400'
                }`}
              >
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {showProfileModal && (
        <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};
