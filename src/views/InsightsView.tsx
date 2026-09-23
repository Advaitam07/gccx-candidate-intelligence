import React from 'react';
import { useCandidates } from '../context/CandidateContext';

export const InsightsView: React.FC = () => {
  const { candidates, metrics } = useCandidates();

  // Role distribution
  const roles = candidates.reduce((acc, c) => {
    acc[c.targetRole] = (acc[c.targetRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fit score tiers
  const tier90 = candidates.filter((c) => (c.aiFit ?? 0) >= 90).length;
  const tier80 = candidates.filter((c) => (c.aiFit ?? 0) >= 80 && (c.aiFit ?? 0) < 90).length;
  const tier70 = candidates.filter((c) => (c.aiFit ?? 0) < 80).length;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            <span>Intelligence</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Calibration</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold mt-1">
            Rubric Calibration & Requisition Insights
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-0.5">
            VP of Engineering hiring rubric v4.8 weights, score distributions, and sourcing throughput.
          </p>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Rubric Weights (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-surface-container-high">
            <h3 className="font-title text-title font-semibold text-text-primary mb-1">
              Active Calibration Rubric: Backend Seniority (v4.8)
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary mb-4">
              Rubric parameters dynamically evaluate candidates and auto-route profiles scoring &gt;90%
              directly to Principal/Lead interview rounds.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Async Python & FastAPI Framework Mastery</span>
                  <span className="font-bold text-secondary">35% Weight</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Cloud IaC & AWS Architecture (ECS, RDS, S3)</span>
                  <span className="font-bold text-secondary">30% Weight</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Distributed Concurrency & System Scalability</span>
                  <span className="font-bold text-secondary">20% Weight</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#316bf3] rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Code Rigor, Test Coverage & Reliability</span>
                  <span className="font-bold text-secondary">15% Weight</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-semantic-success rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Channel Performance */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-surface-container-high">
            <h3 className="font-title text-title font-semibold text-text-primary mb-3">
              Candidate Pool by Sourcing Channel
            </h3>
            <div className="space-y-3">
              {[
                { name: 'LinkedIn Recruiter', count: 24, percent: 43, color: 'bg-primary' },
                { name: 'Direct Careers Portal', count: 16, percent: 29, color: 'bg-secondary' },
                { name: 'Employee Referrals', count: 11, percent: 20, color: 'bg-semantic-success' },
                { name: 'Specialist Agency', count: 5, percent: 8, color: 'bg-surface-tint' },
              ].map((src) => (
                <div key={src.name} className="flex flex-col gap-1">
                  <div className="flex justify-between font-body-sm text-[13px]">
                    <span className="font-medium text-text-primary">{src.name}</span>
                    <span className="text-text-secondary">
                      {src.count} candidates ({src.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full ${src.color} rounded-full`}
                      style={{ width: `${src.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fit Score Tier Distribution (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-surface-container-high">
            <h3 className="font-title text-title font-semibold text-text-primary mb-1">
              AI Fit Score Tier Breakdown
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary mb-4">
              Calibrated distribution across total {metrics.total} candidates.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-3 rounded-lg bg-accent-tint/40 border border-secondary/20">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Top 5% Fit (&gt;90%)
                </span>
                <span className="block font-headline-lg text-headline-lg font-bold text-secondary mt-1">
                  {tier90}
                </span>
                <span className="font-body-sm text-[12px] text-text-secondary">Auto-routed</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase font-semibold">
                  Strong Match (80-89%)
                </span>
                <span className="block font-headline-lg text-headline-lg font-bold text-text-primary mt-1">
                  {tier80}
                </span>
                <span className="font-body-sm text-[12px] text-text-secondary">Recruiter review</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase font-semibold">
                  Moderate (&lt;80%)
                </span>
                <span className="block font-headline-lg text-headline-lg font-bold text-text-secondary mt-1">
                  {tier70}
                </span>
                <span className="font-body-sm text-[12px] text-text-secondary">Passive talent pool</span>
              </div>
            </div>

            <h4 className="font-title text-body-md font-semibold text-text-primary mb-2">
              Role Requisition Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(roles).slice(0, 6).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-2 rounded bg-surface-container-low text-body-sm"
                >
                  <span className="font-medium text-text-primary">{role}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[12px] text-text-secondary">
                    {count} records
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
