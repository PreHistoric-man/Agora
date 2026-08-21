import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ViewType } from '../context/AppContext';
import { Search, Heart, Bell, Compass, Library as LibIcon, Wrench, Users, Flame, Cloud } from 'lucide-react';

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

  const [showNotifications, setShowNotifications] = useState(false);

  const wishlistedCount = models.filter((m) => m.wishlisted).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'discover' && currentView !== 'launch') {
      setView('discover');
    }
  };

  const navItems = [
    { label: 'Store', view: 'store' as ViewType, icon: Flame },
    { label: 'Discover', view: 'discover' as ViewType, icon: Compass },
    { label: 'Library', view: 'library' as ViewType, icon: LibIcon },
    { label: 'Deployments', view: 'deployments' as ViewType, icon: Cloud },
    { label: 'Workshop', view: 'workshop' as ViewType, icon: Wrench },
    { label: 'Community', view: 'community' as ViewType, icon: Users }
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-md px-6 py-3 select-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left Side: Brand Logo */}
        <div
          onClick={() => setView('store')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 font-display text-lg font-black text-white shadow-lg group-hover:from-cyan-400 group-hover:to-violet-500 transition-all duration-300">
            M
            <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="font-display text-xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all">
            MODELVERSE
          </span>
        </div>

        {/* Center: Main Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => setView(item.view)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Search, Wishlist, Notification, Profile */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative hidden sm:block w-48 lg:w-64">
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

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <div className="relative h-8 w-8 cursor-pointer rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center font-display text-xs font-extrabold text-white ring-2 ring-white/10 hover:ring-cyan-400 transition-all">
              🛸
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#0b0c10]" title="Online"></div>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-sans text-xs font-bold text-slate-200">Gamer_AI_Explorer</span>
              <span className="font-sans text-[9px] text-slate-500">Level 24 Creator</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
