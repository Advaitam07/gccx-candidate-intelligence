import React from 'react';
import { useCandidates } from '../context/CandidateContext';
import { ReviewStatus } from '../types/candidate';

export const CompareModal: React.FC = () => {
  const {
    candidates,
    compareCandidateIds,
    setCompareCandidateIds,
    isCompareModalOpen,
    setIsCompareModalOpen,
    toggleShortlist,
    setCandidateStatus,
    setSelectedCandidateId,
  } = useCandidates();

  if (!isCompareModalOpen) return null;

  const compareCandidates = candidates.filter((c) =>
    compareCandidateIds.includes(c.id)
  );

  const handleRemoveCandidate = (id: string) => {
    const updated = compareCandidateIds.filter((cid) => cid !== id);
    setCompareCandidateIds(updated);
    if (updated.length < 2) {
      setIsCompareModalOpen(false);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'SHORTLISTED':
        return 'bg-semantic-success/15 text-semantic-success';
      case 'IN_REVIEW':
        return 'bg-semantic-warning/15 text-semantic-warning';
      case 'REJECTED':
        return 'bg-error-container text-semantic-danger';
      case 'NEEDS_REVIEW':
      default:
        return 'bg-accent-tint text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-5xl rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              compare_arrows
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary">
                Candidate Head-to-Head Comparison
              </h2>
              <p className="font-body-sm text-[12px] text-text-secondary">
                Comparing {compareCandidates.length} candidate profiles side-by-side against the VP
                Engineering rubric.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCompareModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Comparison Table / Grid */}
        <div className="p-6 overflow-y-auto">
          <div
            className={`grid gap-4 ${
              compareCandidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}
          >
            {compareCandidates.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  {/* Top Row with remove */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-headline-sm font-semibold flex items-center justify-center">
                        {cand.initials}
                      </div>
                      <div>
                        <h3 className="font-title text-title font-bold text-text-primary">
                          {cand.name}
                        </h3>
                        <p className="font-body-sm text-[12px] text-text-secondary">
                          {cand.codeId} • {cand.source}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveCandidate(cand.id)}
                      className="text-text-secondary hover:text-semantic-danger p-1"
                      title="Remove from comparison"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* AI Fit Score Banner */}
                  <div className="p-3 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-between">
                    <span className="font-label-sm uppercase tracking-wider text-text-secondary font-semibold">
                      AI Fit Score
                    </span>
                    <div className="flex items-center gap-1.5 text-secondary font-bold font-title">
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span className="text-headline-sm">{cand.aiFit}%</span>
                    </div>
                  </div>

                  {/* Criteria rows */}
                  <div className="space-y-2 text-body-sm">
                    <div className="p-2 rounded bg-surface-container-lowest">
                      <span className="font-label-sm text-text-secondary uppercase block font-semibold">
                        Role & Seniority
                      </span>
                      <span className="font-medium text-text-primary">{cand.targetRole}</span>
                      <span className="text-text-secondary block font-mono text-[12px]">
                        {cand.yearsExperience} Years Experience
                      </span>
                    </div>

                    <div className="p-2 rounded bg-surface-container-lowest">
                      <span className="font-label-sm text-text-secondary uppercase block font-semibold">
                        Location & Availability
                      </span>
                      <span className="text-text-primary">
                        {cand.location} ({cand.availability})
                      </span>
                    </div>

                    <div className="p-2 rounded bg-surface-container-lowest">
                      <span className="font-label-sm text-text-secondary uppercase block font-semibold">
                        Review Status
                      </span>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-label-sm font-semibold ${getStatusBadge(
                          cand.reviewStatus
                        )}`}
                      >
                        {cand.reviewStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-surface-container-lowest">
                      <span className="font-label-sm text-text-secondary uppercase block font-semibold">
                        Evaluated Tech Stack
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cand.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] text-text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-surface-container-lowest">
                      <span className="font-label-sm text-semantic-success uppercase block font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified Strengths
                      </span>
                      <ul className="text-[12px] text-text-secondary list-disc pl-4 mt-1 space-y-1">
                        {(cand.strengths || ['Strong technical proficiency']).map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-surface-container-lowest">
                      <span className="font-label-sm text-semantic-warning uppercase block font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Potential Gaps
                      </span>
                      <ul className="text-[12px] text-text-secondary list-disc pl-4 mt-1 space-y-1">
                        {(cand.gaps || ['Verify tooling breadth']).map((gp, idx) => (
                          <li key={idx}>{gp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-surface-container-high flex gap-2">
                  <button
                    onClick={() => toggleShortlist(cand.id)}
                    className={`flex-1 py-1.5 rounded-lg font-title text-[12px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      cand.shortlisted
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-primary text-on-primary hover:bg-surface-tint'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {cand.shortlisted ? 'bookmark_added' : 'bookmark_add'}
                    </span>
                    <span>{cand.shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCandidateId(cand.id);
                      setIsCompareModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-text-primary font-title text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-surface-container-high bg-surface-container-low/50 flex justify-end">
          <button
            onClick={() => setIsCompareModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold hover:bg-surface-tint transition-colors cursor-pointer"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
};
