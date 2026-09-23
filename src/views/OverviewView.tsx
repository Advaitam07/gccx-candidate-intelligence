import React from 'react';
import { useCandidates } from '../context/CandidateContext';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const {
    candidates,
    metrics,
    setSelectedCandidateId,
    toggleShortlist,
    setCandidateStatus,
    batchAiTriage,
    exportPipelineCSV,
    setIsAddModalOpen,
  } = useCandidates();

  const priorityCandidates = candidates
    .filter((c) => c.reviewStatus === 'IN_REVIEW' || c.reviewStatus === 'NEEDS_REVIEW')
    .sort((a, b) => (b.aiFit ?? 0) - (a.aiFit ?? 0))
    .slice(0, 5);

  const highFitCandidates = candidates
    .filter((c) => (c.aiFit ?? 0) >= 90)
    .sort((a, b) => (b.aiFit ?? 0) - (a.aiFit ?? 0))
    .slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            <span>Executive Dashboard</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Live Intelligence</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold mt-1">
            Pipeline Executive Overview
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-0.5">
            Real-time candidate intelligence, rubric calibration health, and recruiter triage throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportPipelineCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-title text-title font-medium shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-text-secondary">
              file_download
            </span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-title text-title font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        <div
          onClick={() => onNavigate('candidates')}
          className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Total Pipeline Pool
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg text-text-primary font-semibold">
                {metrics.total}
              </span>
              <span className="inline-flex items-center text-semantic-success font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>14%
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-text-secondary mt-1">
              4 active tech requisitions
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-primary">
            <span className="material-symbols-outlined text-[22px]">groups</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('review-queue')}
          className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Needs Immediate Review
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg text-text-primary font-semibold">
                {metrics.inReview}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-error-container text-semantic-danger font-label-sm text-label-sm font-semibold">
                {metrics.urgentReview} Urgent
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-text-secondary mt-1">
              Average response time: 2.8 hrs
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-tint text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">schedule</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('shortlist')}
          className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Shortlisted Candidates
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg text-text-primary font-semibold">
                {metrics.shortlisted}
              </span>
              <span className="inline-flex items-center text-secondary font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[14px]">bolt</span>Interview Ready
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-text-secondary mt-1">
              Awaiting manager interview schedule
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-primary">
            <span className="material-symbols-outlined text-[22px]">bookmark_added</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              AI Calibration Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg text-text-primary font-semibold">
                {metrics.aiAnalyzed}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-accent-tint text-secondary font-label-sm text-label-sm font-semibold">
                94% Confidence
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-text-secondary mt-1">
              VP Engineering Rubric v4.8
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
          </div>
        </div>
      </div>

      {/* Grid: Priority Review Table & Top Fit Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Priority Triage Queue (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-surface-container-high/60">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-semantic-warning text-[20px]">
                  inbox
                </span>
                <h3 className="font-title text-title font-semibold text-text-primary">
                  Urgent Recruiter Triage Queue
                </h3>
              </div>
              <button
                onClick={() => onNavigate('review-queue')}
                className="text-secondary hover:underline font-label-sm text-label-sm font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Queue ({metrics.inReview})</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="divide-y divide-surface-container-high/60">
              {priorityCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="py-3.5 flex items-center justify-between gap-3 group hover:bg-surface-container-low px-2 rounded-lg transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCandidateId(cand.id);
                    onNavigate('candidates');
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-title text-title font-semibold flex items-center justify-center shrink-0">
                      {cand.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title text-body-md text-text-primary font-semibold truncate group-hover:text-secondary">
                          {cand.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container font-mono text-[11px] text-text-secondary">
                          {cand.codeId}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-text-secondary truncate">
                        {cand.targetRole} • {cand.yearsExperience} yrs exp • {cand.source}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="font-title text-title font-bold text-secondary">
                        {cand.aiFit}%
                      </span>
                      <span className="font-label-sm text-[10px] text-text-secondary uppercase">
                        Fit Score
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShortlist(cand.id);
                      }}
                      className="px-2.5 py-1 rounded bg-surface-container text-text-primary hover:bg-secondary hover:text-white font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                    >
                      {cand.shortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sourcing Channel Effectiveness Card */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
            <h3 className="font-title text-title font-semibold text-text-primary">
              Channel Quality & Conversion Benchmarks
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase font-semibold">
                  Referrals
                </span>
                <span className="font-headline-sm text-headline-sm text-text-primary font-bold mt-0.5">
                  94.2%
                </span>
                <span className="font-body-sm text-[12px] text-semantic-success mt-0.5 font-medium">
                  Highest Fit Tier
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase font-semibold">
                  LinkedIn Outbound
                </span>
                <span className="font-headline-sm text-headline-sm text-text-primary font-bold mt-0.5">
                  88.6%
                </span>
                <span className="font-body-sm text-[12px] text-text-secondary mt-0.5 font-medium">
                  High Volume (24 cand)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase font-semibold">
                  Direct Inbound
                </span>
                <span className="font-headline-sm text-headline-sm text-text-primary font-bold mt-0.5">
                  85.1%
                </span>
                <span className="font-body-sm text-[12px] text-text-secondary mt-0.5 font-medium">
                  18 Submissions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Fit Candidates Spotlight (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-surface-container-high/60">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  auto_awesome
                </span>
                <h3 className="font-title text-title font-semibold text-text-primary">
                  Top 5% High-Fit Talent
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-accent-tint text-secondary font-label-sm text-label-sm font-semibold">
                Score &gt; 90%
              </span>
            </div>

            <div className="flex flex-col gap-3 pt-3">
              {highFitCandidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => {
                    setSelectedCandidateId(cand.id);
                    onNavigate('candidates');
                  }}
                  className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-title text-body-sm font-semibold flex items-center justify-center">
                        {cand.initials}
                      </div>
                      <div>
                        <p className="font-title text-body-md font-semibold text-text-primary">
                          {cand.name}
                        </p>
                        <p className="font-body-sm text-[12px] text-text-secondary">
                          {cand.targetRole} • {cand.yearsExperience} yrs exp
                        </p>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-accent-tint text-secondary font-title text-body-sm font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      <span>{cand.aiFit}%</span>
                    </div>
                  </div>

                  <p className="font-body-sm text-[12px] text-text-secondary line-clamp-2 leading-relaxed">
                    {cand.summary}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {cand.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-surface-container-lowest text-text-primary font-label-sm text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-space-md rounded-xl bg-accent-tint/30 border border-secondary/20 flex flex-col gap-2.5">
            <span className="font-title text-title font-semibold text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Fast-Track Triage Commands
            </span>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Accelerate pipeline evaluation with automated rubric calibration and queue synchronization.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={batchAiTriage}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold hover:bg-surface-tint transition-colors cursor-pointer"
              >
                Run Batch AI Triage
              </button>
              <button
                onClick={() => onNavigate('shortlist')}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-title text-[13px] font-medium transition-colors cursor-pointer"
              >
                View Shortlist ({metrics.shortlisted})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
