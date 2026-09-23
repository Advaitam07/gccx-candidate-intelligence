import React from 'react';
import { useCandidates } from '../context/CandidateContext';

interface ShortlistViewProps {
  onNavigate: (view: string) => void;
}

export const ShortlistView: React.FC<ShortlistViewProps> = ({ onNavigate }) => {
  const {
    candidates,
    setSelectedCandidateId,
    toggleShortlist,
    setCompareCandidateIds,
    setIsCompareModalOpen,
    showToast,
  } = useCandidates();

  const shortlistedCandidates = candidates.filter(
    (c) => c.shortlisted || c.reviewStatus === 'SHORTLISTED'
  );

  const handleCompareAll = () => {
    if (shortlistedCandidates.length < 2) {
      showToast('Need at least 2 shortlisted candidates to compare');
      return;
    }
    const top3 = shortlistedCandidates.slice(0, 3).map((c) => c.id);
    setCompareCandidateIds(top3);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            <span>Candidates</span>
            <span className="text-outline-variant">/</span>
            <span className="text-semantic-success font-semibold">Shortlist</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
              Interview Ready Shortlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-semantic-success/15 text-semantic-success font-label-sm text-label-sm font-semibold">
              {shortlistedCandidates.length} Interview Ready
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-0.5">
            Vetted candidates approved for engineering hiring manager presentation and technical rounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {shortlistedCandidates.length >= 2 && (
            <button
              onClick={handleCompareAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary font-title text-title font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              <span>Compare Top Candidates</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {shortlistedCandidates.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface-container-lowest rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-4xl text-text-secondary/50">
              bookmark_border
            </span>
            <h3 className="font-title text-title font-semibold text-text-primary mt-2">
              No candidates shortlisted yet
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary mt-1">
              Browse candidates and click the Shortlist bookmark to populate this view.
            </p>
            <button
              onClick={() => onNavigate('candidates')}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold cursor-pointer"
            >
              Go to Candidate Directory
            </button>
          </div>
        ) : (
          shortlistedCandidates.map((cand) => (
            <div
              key={cand.id}
              className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-title text-title font-semibold flex items-center justify-center">
                      {cand.initials}
                    </div>
                    <div>
                      <h4
                        onClick={() => {
                          setSelectedCandidateId(cand.id);
                          onNavigate('candidates');
                        }}
                        className="font-title text-title font-semibold text-text-primary hover:text-secondary cursor-pointer transition-colors"
                      >
                        {cand.name}
                      </h4>
                      <p className="font-body-sm text-[12px] text-text-secondary">
                        {cand.targetRole} • {cand.yearsExperience} yrs exp
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-accent-tint px-2 py-0.5 rounded-lg text-secondary font-title font-bold text-body-sm">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    <span>{cand.aiFit}%</span>
                  </div>
                </div>

                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-semantic-success/15 text-semantic-success font-label-sm text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-semantic-success"></span>
                    Interview Ready
                  </span>
                </div>

                <p className="font-body-sm text-[13px] text-text-secondary line-clamp-3 leading-relaxed mt-1">
                  {cand.summary}
                </p>

                <div className="flex flex-wrap gap-1 mt-1">
                  {cand.skills.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] text-text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-container-high">
                <button
                  onClick={() => {
                    setSelectedCandidateId(cand.id);
                    onNavigate('candidates');
                  }}
                  className="h-8 rounded bg-primary text-on-primary font-title text-[12px] font-semibold flex items-center justify-center gap-1 hover:bg-surface-tint transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  Open Dossier
                </button>

                <button
                  onClick={() => toggleShortlist(cand.id)}
                  className="h-8 rounded bg-surface-container-low text-text-secondary hover:text-semantic-danger font-title text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-error-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">bookmark_remove</span>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
