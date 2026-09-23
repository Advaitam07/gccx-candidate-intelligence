import React, { useState } from 'react';
import { useCandidates } from '../context/CandidateContext';
import { ReviewStatus } from '../types/candidate';

export const AddCandidateModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addCandidate } = useCandidates();

  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Backend Engineer');
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [location, setLocation] = useState('Bengaluru, IN');
  const [availability, setAvailability] = useState('Available in 30d');
  const [source, setSource] = useState('LinkedIn');
  const [skills, setSkills] = useState('Python 3.11, FastAPI, AWS ECS, Docker, PostgreSQL');
  const [summary, setSummary] = useState('');
  const [initialNote, setInitialNote] = useState('');

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedSkills = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addCandidate({
      name: name.trim(),
      targetRole,
      yearsExperience: Number(yearsExperience) || 3,
      location: location.trim(),
      availability: availability.trim(),
      source,
      skills: parsedSkills,
      summary:
        summary.trim() ||
        `Experienced ${targetRole} with ${yearsExperience} years building production services.`,
      notes: initialNote.trim(),
      tags: [targetRole.split(' ')[0], `${yearsExperience} yrs exp`],
      shortlisted: false,
      reviewStatus: 'NEEDS_REVIEW' as ReviewStatus,
      aiFit: 88,
      aiSummary: `Initial scoring indicates strong alignment with ${targetRole} requirements.`,
      matchingSkills: parsedSkills.slice(0, 3),
      missingSkills: ['Kubernetes cluster ops'],
      aiAnalyzed: false,
    });

    // Reset and close
    setName('');
    setSummary('');
    setInitialNote('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              person_add
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary">
                Add New Candidate
              </h2>
              <p className="font-body-sm text-[12px] text-text-secondary">
                Index candidate into the active GCCX pipeline for automated rubric evaluation.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
                Candidate Full Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Rohan Gupta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
              />
            </div>

            <div>
              <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
              >
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Senior Distributed Backend">Senior Distributed Backend</option>
                <option value="Python API Specialist">Python API Specialist</option>
                <option value="Backend Infrastructure">Backend Infrastructure</option>
                <option value="DevOps / Platform">DevOps / Platform</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Staff Core Systems">Staff Core Systems</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
                Years Exp
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
              />
            </div>

            <div>
              <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
                Source Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Direct Application">Direct Application</option>
                <option value="Agency">Agency</option>
              </select>
            </div>

            <div>
              <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              placeholder="Python, FastAPI, AWS, Docker, PostgreSQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
            />
          </div>

          <div>
            <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
              Executive Summary / Highlights
            </label>
            <textarea
              rows={2}
              placeholder="Key achievements, scale handled, systems built..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high resize-none"
            />
          </div>

          <div>
            <label className="font-label-sm uppercase tracking-wider text-text-secondary block font-semibold mb-1">
              Initial Recruiter Screening Note
            </label>
            <textarea
              rows={2}
              placeholder="Screening notes, salary expectations, interview availability..."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-surface-container-low text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-surface-container-high flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg text-body-sm text-text-secondary hover:text-text-primary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold hover:bg-surface-tint transition-colors cursor-pointer"
            >
              Add Candidate to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
