import React from 'react';
import { useCandidates } from '../context/CandidateContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { metrics, activeTab } = useCandidates();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-space-lg pt-space-lg pb-space-md">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => onNavigate('candidates')}>
            <img
              alt="GCCX Candidate Intelligence Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UxJw10w_3xAz_2R8fyq-xzyhRndiC5pEWZ5vHMSyc04mm06IrIZOczf_GdDw8yVE-jOzNlYMzBgeZZA3faLigqgz5665DuHtEBpJ3LNgKbDDKwlKIHdx52y7E-ncXcQOL3kaADdbvYJpXk5wEXdR4WBoWT2s0krhvtV2yUIvx1oekbwH4E4h1ke898PISpDCCbvocyaqV2pNbeDn2emqds-WHN09BdSFuOXtqzvTdylU2zfCBGIf9gc0JE"
              onError={(e) => {
                // Fallback to stylized SVG icon
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div
              className="w-8 h-8 rounded-lg bg-black text-white items-center justify-center font-bold text-xs relative hidden"
              style={{ display: 'none' }}
            >
              <span className="text-white">KI</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#316bf3]"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-text-primary tracking-tight font-semibold">
                GCCX
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary tracking-widest uppercase -mt-0.5">
                Candidate Intel
              </span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary mt-space-xs pl-0.5">
            AI-powered candidate triage
          </p>
        </div>

        {/* Section Label */}
        <div className="px-space-md pt-space-xs">
          <span className="px-space-sm font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
            Navigation
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-space-md mt-space-xs">
          <button
            onClick={() => onNavigate('overview')}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg font-body-md text-body-md transition-colors w-full text-left ${
              currentView === 'overview'
                ? 'bg-primary text-on-primary font-title font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('candidates')}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors w-full text-left ${
              currentView === 'candidates'
                ? 'bg-primary text-on-primary font-title font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>Candidates</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                currentView === 'candidates'
                  ? 'bg-surface-container text-text-primary'
                  : 'bg-surface-container text-text-primary'
              }`}
            >
              {metrics.total}
            </span>
          </button>

          <button
            onClick={() => onNavigate('review-queue')}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors w-full text-left ${
              currentView === 'review-queue'
                ? 'bg-primary text-on-primary font-title font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
              <span>Review Queue</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-accent-tint text-secondary font-semibold">
              {metrics.inReview}
            </span>
          </button>

          <button
            onClick={() => onNavigate('shortlist')}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors w-full text-left ${
              currentView === 'shortlist'
                ? 'bg-primary text-on-primary font-title font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">bookmark</span>
              <span>Shortlist</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-text-primary font-semibold">
              {metrics.shortlisted}
            </span>
          </button>

          <button
            onClick={() => onNavigate('insights')}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors w-full text-left ${
              currentView === 'insights'
                ? 'bg-primary text-on-primary font-title font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
              <span>Insights</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('saved-views')}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors w-full text-left ${
              currentView === 'saved-views'
                ? 'bg-primary text-on-primary font-title font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">folder</span>
              <span>Saved Views</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="flex flex-col gap-space-xs px-space-md pb-space-lg">
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-body-md text-body-md transition-colors w-full text-left ${
              currentView === 'settings'
                ? 'bg-primary text-on-primary font-title'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </button>

          <button
            onClick={() => onNavigate('help-and-docs')}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-body-md text-body-md transition-colors w-full text-left ${
              currentView === 'help-and-docs'
                ? 'bg-primary text-on-primary font-title'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>Help & Docs</span>
          </button>
        </nav>

        {/* Current Requisition Selector */}
        <div className="mt-space-sm p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
          <div className="flex flex-col min-w-0 pr-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary truncate font-semibold">
              GCCX Global Tech Search
            </span>
            <span className="font-title text-title text-text-primary truncate font-semibold">
              Production
            </span>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-[18px]">
            unfold_more
          </span>
        </div>
      </div>
    </aside>
  );
};
