import React, { useState, useEffect } from 'react';
import { useCandidates } from '../context/CandidateContext';

interface CommandPaletteProps {
  onNavigate: (view: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    candidates,
    setSelectedCandidateId,
    setIsAddModalOpen,
    exportPipelineCSV,
    batchAiTriage,
  } = useCandidates();

  const [query, setQuery] = useState('');

  // Global keydown listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredCandidates = candidates
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.targetRole.toLowerCase().includes(query.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
        c.codeId.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6);

  const navigationCommands = [
    { label: 'Go to Candidate Directory', view: 'candidates', icon: 'group' },
    { label: 'Go to Review Queue', view: 'review-queue', icon: 'inbox' },
    { label: 'Go to Shortlist', view: 'shortlist', icon: 'bookmark' },
    { label: 'Go to Overview Dashboard', view: 'overview', icon: 'dashboard' },
    { label: 'Go to Rubric Insights', view: 'insights', icon: 'trending_up' },
    { label: 'Go to Saved Views', view: 'saved-views', icon: 'folder' },
  ].filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidateId(id);
    onNavigate('candidates');
    setIsCommandPaletteOpen(false);
  };

  const handleSelectNav = (view: string) => {
    onNavigate(view);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
        {/* Search Header */}
        <div className="p-3 px-4 border-b border-surface-container-high flex items-center gap-3">
          <span className="material-symbols-outlined text-text-secondary text-[22px]">
            search
          </span>
          <input
            autoFocus
            type="text"
            placeholder="Type a command, candidate name, or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 bg-transparent text-body-md text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-low font-label-sm text-label-sm text-text-secondary font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto divide-y divide-surface-container-high/40">
          {/* Quick Actions */}
          <div className="py-2">
            <span className="px-3 text-label-sm uppercase font-semibold text-text-secondary block mb-1">
              Quick Actions
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-sm text-text-primary text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  person_add
                </span>
                <span>Add Candidate to Pipeline</span>
              </button>

              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  batchAiTriage();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-sm text-text-primary text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  auto_awesome
                </span>
                <span>Run Batch AI Triage</span>
              </button>

              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  exportPipelineCSV();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-sm text-text-primary text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-text-secondary">
                  file_download
                </span>
                <span>Export Pipeline to CSV</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          {navigationCommands.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-label-sm uppercase font-semibold text-text-secondary block mb-1">
                Navigation
              </span>
              <div className="space-y-1">
                {navigationCommands.map((nav) => (
                  <button
                    key={nav.view}
                    onClick={() => handleSelectNav(nav.view)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-sm text-text-primary text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-text-secondary">
                        {nav.icon}
                      </span>
                      <span>{nav.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Candidates */}
          {filteredCandidates.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-label-sm uppercase font-semibold text-text-secondary block mb-1">
                Candidates
              </span>
              <div className="space-y-1">
                {filteredCandidates.map((cand) => (
                  <button
                    key={cand.id}
                    onClick={() => handleSelectCandidate(cand.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-sm text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm font-semibold flex items-center justify-center shrink-0">
                        {cand.initials}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-text-primary group-hover:text-secondary">
                          {cand.name}
                        </span>
                        <span className="text-text-secondary ml-2 font-mono text-[11px]">
                          {cand.codeId}
                        </span>
                        <span className="text-text-secondary text-[12px] block">
                          {cand.targetRole} • {cand.yearsExperience} yrs exp
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-secondary font-bold text-body-sm shrink-0">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      <span>{cand.aiFit}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
