import React from 'react';

export const HelpView: React.FC = () => {
  return (
    <div className="flex flex-col w-full max-w-4xl">
      {/* Header */}
      <div className="mb-space-lg">
        <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
          <span>Documentation</span>
          <span className="text-outline-variant">/</span>
          <span className="text-secondary font-semibold">Triage Guide</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold mt-1">
          Help & Operational Documentation
        </h1>
        <p className="font-body-md text-body-md text-text-secondary mt-0.5">
          Standard operating procedures for AI-assisted candidate evaluation and hiring rubric standards.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
          <h3 className="font-title text-title font-semibold text-text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">psychology</span>
            How the AI Candidate Fit Score Works
          </h3>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed mb-3">
            The GCCX Candidate Intelligence platform parses structured experience, production tech stack depth,
            and scale history against calibration rubrics configured by engineering leadership. Scores are banded into:
          </p>
          <ul className="space-y-2 text-body-sm text-text-primary">
            <li className="flex items-start gap-2">
              <span className="text-semantic-success font-bold mt-0.5">•</span>
              <span><strong>90% - 100% (Top 5% Fit):</strong> Exceeds all mandatory technical benchmarks with verified high concurrency experience. Candidate is marked as "Interview Ready".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-bold mt-0.5">•</span>
              <span><strong>80% - 89% (Strong Match):</strong> Meets core framework requirements with minor gaps flagged in the Potential Gaps section. Recommended for standard technical screen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-text-secondary font-bold mt-0.5">•</span>
              <span><strong>Below 80% (Viable / Passive):</strong> Lacks high-throughput or cloud infra depth. Suitable for mid-tier or junior engineering cohorts.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
          <h3 className="font-title text-title font-semibold text-text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">keyboard</span>
            Keyboard Shortcuts & Efficiency
          </h3>
          <div className="grid grid-cols-2 gap-3 text-body-sm">
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-container-low">
              <span className="text-text-secondary">Open Command Palette</span>
              <kbd className="px-2 py-0.5 rounded bg-surface-container font-mono text-label-sm font-semibold">⌘K or Ctrl+K</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-container-low">
              <span className="text-text-secondary">Quick Shortlist</span>
              <span className="text-text-primary font-medium">Click bookmark on any row</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-container-low">
              <span className="text-text-secondary">Compare Candidates</span>
              <span className="text-text-primary font-medium">Select 2-3 checkboxes</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-container-low">
              <span className="text-text-secondary">Save Recruiter Note</span>
              <kbd className="px-2 py-0.5 rounded bg-surface-container font-mono text-label-sm font-semibold">⌘ + Enter</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
