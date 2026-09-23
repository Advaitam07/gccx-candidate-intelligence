import React from 'react';
import { useCandidates } from '../context/CandidateContext';
import { ReviewStatus } from '../types/candidate';

interface ReviewQueueViewProps {
  onNavigate: (view: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({ onNavigate }) => {
  const {
    candidates,
    setSelectedCandidateId,
    toggleShortlist,
    setCandidateStatus,
    showToast,
  } = useCandidates();

  const queueCandidates = candidates.filter(
    (c) => c.reviewStatus === 'IN_REVIEW' || c.reviewStatus === 'NEEDS_REVIEW'
  );

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            <span>Candidates</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Triage</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
              Recruiter Review Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-tint text-secondary font-label-sm text-label-sm font-semibold">
              {queueCandidates.length} Active Records
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-0.5">
            Candidates flagged for manual screening and rubric alignment. Average review turnaround: 2.8 hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('candidates')}
            className="px-3 py-2 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-title text-title font-medium shadow-sm transition-all cursor-pointer"
          >
            Switch to Split View
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {queueCandidates.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface-container-lowest rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-4xl text-semantic-success">
              task_alt
            </span>
            <h3 className="font-title text-title font-semibold text-text-primary mt-2">
              Review Queue Cleared!
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary mt-1">
              All candidates have been triaged or shortlisted.
            </p>
          </div>
        ) : (
          queueCandidates.map((cand) => (
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

                  <div className="flex flex-col items-end">
                    <span className="font-headline-sm text-[16px] font-bold text-secondary">
                      {cand.aiFit}%
                    </span>
                    <span className="font-label-sm text-[10px] text-text-secondary uppercase">
                      AI Match
                    </span>
                  </div>
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

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-surface-container-high">
                <button
                  onClick={() => toggleShortlist(cand.id)}
                  className="h-8 rounded bg-primary text-on-primary font-title text-[12px] font-semibold flex items-center justify-center gap-1 hover:bg-surface-tint transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">bookmark_add</span>
                  Shortlist
                </button>

                <button
                  onClick={() => {
                    setSelectedCandidateId(cand.id);
                    onNavigate('candidates');
                  }}
                  className="h-8 rounded bg-surface-container-low text-text-primary font-title text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  Dossier
                </button>

                <button
                  onClick={() => setCandidateStatus(cand.id, 'REJECTED')}
                  className="h-8 rounded bg-surface-container-low text-semantic-danger font-title text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-error-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
