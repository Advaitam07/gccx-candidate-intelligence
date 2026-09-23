import React, { useState } from 'react';
import { useCandidates } from '../context/CandidateContext';
import { SavedView } from '../types/candidate';

interface SavedViewsViewProps {
  onNavigate: (view: string) => void;
}

export const SavedViewsView: React.FC<SavedViewsViewProps> = ({ onNavigate }) => {
  const { savedViews, applySavedView, showToast } = useCandidates();
  const [customViews, setCustomViews] = useState<SavedView[]>(savedViews);
  const [newViewName, setNewViewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleApply = (view: SavedView) => {
    applySavedView(view);
    onNavigate('candidates');
  };

  const handleCreateView = () => {
    if (!newViewName.trim()) return;
    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name: newViewName.trim(),
      description: 'Custom recruiter filter criteria view',
      icon: 'star',
      filters: { role: 'Backend Engineer', exp: '3-5 Years' },
    };
    setCustomViews((prev) => [...prev, newView]);
    setNewViewName('');
    setIsCreating(false);
    showToast(`Saved new view: ${newView.name}`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            <span>Workspace</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Saved Views</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold mt-1">
            Saved Pipeline Views
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-0.5">
            Pre-configured filter combinations for targeted candidate triage and requisition segmentation.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-title text-title font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Save Current Filters as View</span>
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-md max-w-md flex flex-col gap-3">
          <h4 className="font-title text-title font-semibold text-text-primary">
            Create New Saved View
          </h4>
          <input
            type="text"
            placeholder="View Name (e.g., Senior Distributed Go Engineers)..."
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-body-sm text-text-secondary hover:text-text-primary cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateView}
              className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold cursor-pointer"
            >
              Save View
            </button>
          </div>
        </div>
      )}

      {/* Grid of Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {customViews.map((view) => (
          <div
            key={view.id}
            className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high hover:border-secondary hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-primary group-hover:bg-accent-tint group-hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">{view.icon}</span>
                </div>
                <div>
                  <h3 className="font-title text-title font-semibold text-text-primary group-hover:text-secondary transition-colors">
                    {view.name}
                  </h3>
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                    Preset View
                  </span>
                </div>
              </div>

              <p className="font-body-sm text-body-sm text-text-secondary mt-1 leading-relaxed">
                {view.description}
              </p>

              {/* Filter Criteria Pill Summary */}
              <div className="flex flex-wrap gap-1 mt-2">
                {view.filters.role && (
                  <span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-label-sm text-[11px]">
                    Role: {view.filters.role}
                  </span>
                )}
                {view.filters.exp && (
                  <span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-label-sm text-[11px]">
                    Exp: {view.filters.exp}
                  </span>
                )}
                {view.filters.minAiFit && (
                  <span className="px-2 py-0.5 rounded bg-accent-tint text-secondary font-label-sm text-[11px] font-semibold">
                    Fit &gt;= {view.filters.minAiFit}%
                  </span>
                )}
                {view.filters.status && (
                  <span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-label-sm text-[11px]">
                    Status: {view.filters.status}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleApply(view)}
              className="mt-4 w-full py-2 rounded-lg bg-surface-container text-text-primary group-hover:bg-primary group-hover:text-on-primary font-title text-[13px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Apply & Open Pipeline</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
