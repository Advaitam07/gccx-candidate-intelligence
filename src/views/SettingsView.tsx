import React, { useState } from 'react';
import { useCandidates } from '../context/CandidateContext';

export const SettingsView: React.FC = () => {
  const { showToast } = useCandidates();
  const [rubricVersion, setRubricVersion] = useState('v4.8');
  const [autoShortlistThreshold, setAutoShortlistThreshold] = useState(90);
  const [asyncPythonWeight, setAsyncPythonWeight] = useState(35);
  const [cloudIacWeight, setCloudIacWeight] = useState(30);
  const [concurrencyWeight, setConcurrencyWeight] = useState(20);
  const [codeRigorWeight, setCodeRigorWeight] = useState(15);

  const handleSave = () => {
    showToast('Engineering rubric & pipeline settings updated');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl">
      {/* Header */}
      <div className="mb-space-lg">
        <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
          <span>Settings</span>
          <span className="text-outline-variant">/</span>
          <span className="text-secondary font-semibold">Rubric Calibration</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold mt-1">
          Recruiter & Calibration Settings
        </h1>
        <p className="font-body-md text-body-md text-text-secondary mt-0.5">
          Tune scoring thresholds, rubric dimension weights, and automated candidate routing rules.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Rubric Parameters */}
        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <h3 className="font-title text-title font-semibold text-text-primary">
            AI Triage Rubric Calibration (Active: {rubricVersion})
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-body-sm font-medium mb-1.5">
                <span>Async Python 3.11 & FastAPI Mastery</span>
                <span className="font-bold text-secondary">{asyncPythonWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={asyncPythonWeight}
                onChange={(e) => setAsyncPythonWeight(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-body-sm font-medium mb-1.5">
                <span>Cloud IaC & AWS Architecture (ECS, RDS, S3)</span>
                <span className="font-bold text-secondary">{cloudIacWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={cloudIacWeight}
                onChange={(e) => setCloudIacWeight(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-body-sm font-medium mb-1.5">
                <span>Distributed Concurrency & System Scalability</span>
                <span className="font-bold text-secondary">{concurrencyWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={concurrencyWeight}
                onChange={(e) => setConcurrencyWeight(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-body-sm font-medium mb-1.5">
                <span>Code Rigor, Test Coverage & Reliability SLA</span>
                <span className="font-bold text-secondary">{codeRigorWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={codeRigorWeight}
                onChange={(e) => setCodeRigorWeight(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Routing Thresholds */}
        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <h3 className="font-title text-title font-semibold text-text-primary">
            Automated Triage Thresholds
          </h3>

          <div>
            <div className="flex justify-between text-body-sm font-medium mb-1.5">
              <span>Auto-Route to Tech Lead Review (Minimum Fit Score)</span>
              <span className="font-bold text-semantic-success">{autoShortlistThreshold}%</span>
            </div>
            <input
              type="range"
              min="75"
              max="98"
              value={autoShortlistThreshold}
              onChange={(e) => setAutoShortlistThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <span className="font-body-sm text-[12px] text-text-secondary mt-1 block">
              Candidates scoring above {autoShortlistThreshold}% will be flagged with the verified
              high recommendation badge.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-primary text-on-primary font-title text-[14px] font-semibold hover:bg-surface-tint transition-colors cursor-pointer"
          >
            Save Calibration Changes
          </button>
        </div>
      </div>
    </div>
  );
};
