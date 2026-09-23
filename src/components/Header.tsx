import React, { useState, useRef, useEffect } from 'react';
import { useCandidates } from '../context/CandidateContext';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsAddModalOpen,
    setIsCommandPaletteOpen,
    notifications,
  } = useCandidates();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-space-lg flex items-center justify-between">
      {/* Search Input with ⌘K */}
      <div className="flex items-center gap-space-lg flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
            search
          </span>
          <input
            className="w-full h-10 pl-9 pr-14 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
            placeholder="Search candidates, skills, roles..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              // optional: can let user type directly or trigger palette
            }}
          />
          <div
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center cursor-pointer"
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Open Command Palette (⌘K)"
          >
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-low font-label-sm text-label-sm text-text-secondary font-mono hover:bg-surface-container">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        {/* AI Engine Online Status */}
        <div className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-accent-tint text-secondary font-label-md text-label-md font-semibold select-none">
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
          <span>AI Engine Online</span>
        </div>

        {/* Add Candidate Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-space-md py-2 rounded-lg bg-primary text-on-primary font-title text-title font-semibold hover:bg-surface-tint transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Candidate</span>
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container-high py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-surface-container-high flex items-center justify-between">
                <span className="font-title text-title font-semibold text-text-primary">
                  Activity & Alerts
                </span>
                <span className="font-label-sm text-label-sm text-text-secondary">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-surface-container-high/40">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-title text-[13px] font-semibold text-text-primary">
                        {n.title}
                      </span>
                      <span className="font-label-sm text-[10px] text-text-secondary">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="font-body-sm text-[12px] text-text-secondary mt-0.5">
                      {n.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-surface-container-high"></div>

        {/* User Identity Profile */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-title text-title text-text-primary font-semibold leading-tight">
                Marcus Vance
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary leading-tight">
                Principal Recruiter
              </span>
            </div>
            <span className="material-symbols-outlined text-text-secondary text-[18px]">
              expand_more
            </span>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-2 z-50">
              <div className="px-4 py-2 border-b border-surface-container-high">
                <p className="font-title text-body-sm font-semibold text-text-primary">Marcus Vance</p>
                <p className="font-label-sm text-label-sm text-text-secondary">
                  marcus.vance@gccx-intel.com
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-low text-text-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">
                    tune
                  </span>
                  Recruiter Preferences
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-low text-text-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">
                    badge
                  </span>
                  Rubric Calibration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
