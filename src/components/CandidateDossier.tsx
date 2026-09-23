import React, { useState } from 'react';
import { useCandidates } from '../context/CandidateContext';
import { ReviewStatus } from '../types/candidate';

export const CandidateDossier: React.FC = () => {
  const {
    selectedCandidate,
    toggleShortlist,
    setCandidateStatus,
    addCandidateNote,
    addCandidateTag,
    removeCandidateTag,
    runAiAnalysis,
    isAiAnalyzing,
    aiPhaseText,
    showToast,
  } = useCandidates();

  const [noteInput, setNoteInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  if (!selectedCandidate) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 text-center text-text-secondary">
        Select a candidate to view their dossier.
      </div>
    );
  }

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    addCandidateNote(selectedCandidate.id, noteInput.trim());
    setNoteInput('');
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    addCandidateTag(selectedCandidate.id, newTagInput.trim());
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(`Dossier link copied for ${selectedCandidate.name}`);
  };

  const handleDownloadPDF = () => {
    showToast(`Compiling executive dossier PDF for ${selectedCandidate.name}...`);
    setTimeout(() => {
      showToast(`Downloaded: GCCX-Dossier-${selectedCandidate.id}.pdf`);
    }, 1000);
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

  const formatStatus = (status: ReviewStatus) => {
    switch (status) {
      case 'IN_REVIEW':
        return 'In Review';
      case 'NEEDS_REVIEW':
        return 'Needs Review';
      case 'SHORTLISTED':
        return 'Shortlisted';
      case 'REJECTED':
        return 'Rejected';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Dossier Header & Control Bar */}
      <div className="p-space-md border-b border-surface-container-high flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Candidate Intelligence Dossier
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-text-primary font-mono font-medium">
              {selectedCandidate.codeId}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Copy shareable link"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Export Candidate Summary PDF"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </div>

        {/* Selected Candidate Hero Header */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center shrink-0 font-semibold">
              {selectedCandidate.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm text-text-primary truncate font-semibold">
                  {selectedCandidate.name}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold shrink-0 ${getStatusBadge(
                    selectedCandidate.reviewStatus
                  )}`}
                >
                  {formatStatus(selectedCandidate.reviewStatus)}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary mt-0.5 truncate">
                {selectedCandidate.targetRole} • {selectedCandidate.yearsExperience} Years Exp •{' '}
                {selectedCandidate.location}
              </p>
            </div>
          </div>

          {/* AI Score Badge */}
          <div className="flex flex-col items-end shrink-0 pl-2">
            <div className="px-2.5 py-1 rounded-lg bg-accent-tint flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                auto_awesome
              </span>
              <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                {selectedCandidate.aiFit ?? 85}%
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary mt-1 font-medium">
              {(selectedCandidate.aiFit ?? 85) >= 90
                ? 'High Fit'
                : (selectedCandidate.aiFit ?? 85) >= 80
                ? 'Strong Match'
                : 'Viable'}
            </span>
          </div>
        </div>

        {/* Quick Action Button Row */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          <button
            onClick={() => toggleShortlist(selectedCandidate.id)}
            className={`h-9 rounded-lg font-title text-title font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              selectedCandidate.shortlisted
                ? 'bg-secondary text-on-secondary hover:bg-accent-hover'
                : 'bg-primary text-on-primary hover:bg-surface-tint'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {selectedCandidate.shortlisted ? 'bookmark_added' : 'bookmark_add'}
            </span>
            <span>{selectedCandidate.shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>

          <button
            onClick={() => {
              setCandidateStatus(selectedCandidate.id, 'IN_REVIEW');
              showToast(`Screening interview requested for ${selectedCandidate.name}`);
            }}
            className="h-9 rounded-lg bg-surface-container-low text-text-primary hover:bg-surface-container font-title text-title font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-text-secondary">
              calendar_today
            </span>
            <span>Schedule</span>
          </button>

          <button
            onClick={() => setCandidateStatus(selectedCandidate.id, 'REJECTED')}
            className="h-9 rounded-lg bg-surface-container-low text-semantic-danger hover:bg-error-container font-title text-title font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Dossier Scrollable Body */}
      <div className="p-space-md flex flex-col gap-space-md max-h-[calc(100vh-320px)] overflow-y-auto">
        {/* Crown Jewel: AI-Assisted Candidate Fit Analysis */}
        <div className="p-space-md rounded-xl bg-accent-tint/40 relative overflow-hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span className="font-title text-title font-semibold">
                AI-Assisted Candidate Fit Analysis
              </span>
            </div>
            <button
              disabled={isAiAnalyzing}
              onClick={() => runAiAnalysis(selectedCandidate.id)}
              className="px-2.5 py-1 rounded bg-surface-container-lowest text-secondary hover:bg-accent-tint font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[14px] ${
                  isAiAnalyzing ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              <span>{isAiAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}</span>
            </button>
          </div>

          {/* Shimmer loader during AI analysis */}
          {isAiAnalyzing && (
            <div className="py-2.5 px-3 rounded-lg bg-surface-container-lowest flex items-center gap-3 animate-pulse">
              <span className="w-3 h-3 rounded-full bg-secondary animate-ping"></span>
              <span className="font-body-sm text-body-sm text-secondary font-medium">
                {aiPhaseText}
              </span>
            </div>
          )}

          <div
            className={`flex flex-col gap-3 transition-opacity duration-200 ${
              isAiAnalyzing ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Fit Summary Text */}
            <p className="font-body-md text-body-md text-text-primary leading-relaxed">
              {selectedCandidate.aiSummary || selectedCandidate.summary}
            </p>

            {/* Strengths Section */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-semantic-success font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Verified Strengths & Edge
              </span>
              <ul className="flex flex-col gap-1 text-text-primary font-body-sm text-body-sm">
                {(selectedCandidate.strengths || [
                  'Strong async API development track record with minimal latency overhead.',
                  'Demonstrated proficiency in cloud architecture and relational schemas.',
                  'High velocity contributor with automated CI/CD discipline.',
                ]).map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-semantic-success font-bold mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Gaps Section */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-semantic-warning font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Potential Gaps & Probes
              </span>
              <ul className="flex flex-col gap-1 text-text-primary font-body-sm text-body-sm">
                {(selectedCandidate.gaps || [
                  'Containerized with Docker; probe high-density Kubernetes cluster operations.',
                  'Experience primarily with polyrepo setups; verify build tooling breadth.',
                ]).map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-semantic-warning font-bold mt-0.5">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Next Step */}
            <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-start gap-2.5 shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                forward
              </span>
              <div className="flex flex-col">
                <span className="font-title text-title text-text-primary font-semibold">
                  Suggested Next Step:
                </span>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  {selectedCandidate.suggestedAction ||
                    'Schedule 45-min Technical System Screening focusing on distributed database caching, API latency spikes, and async worker queuing.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1 border-t border-outline/10 text-outline text-[11px]">
            <div className="flex items-center justify-between">
              <span>✦ Calibrated with Engineering Hiring Rubric v4.8</span>
              <span className="font-medium text-text-secondary">Human in the loop</span>
            </div>
            <p className="text-[11px] text-text-secondary italic">
              AI-generated analysis is decision support and should be reviewed by a recruiter.
            </p>
          </div>
        </div>

        {/* Evaluated Tech Stack & Tags */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Evaluated Tech Stack & Tags
            </span>
            <button
              onClick={() => setIsAddingTag(!isAddingTag)}
              className="text-secondary hover:underline font-label-sm text-label-sm font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Tag
            </button>
          </div>

          {isAddingTag && (
            <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg">
              <input
                type="text"
                placeholder="Enter tag name..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="w-full h-8 px-2 rounded bg-surface-container-lowest text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleAddTag}
                className="px-2.5 py-1 bg-primary text-on-primary rounded text-label-sm font-semibold cursor-pointer"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingTag(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {selectedCandidate.skills.map((skill, i) => (
              <span
                key={`skill-${i}`}
                className="px-2.5 py-1 rounded bg-surface-container text-text-primary font-body-sm text-body-sm font-medium"
              >
                {skill}
              </span>
            ))}
            {selectedCandidate.tags.map((tag, i) => (
              <span
                key={`tag-${i}`}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-tint text-secondary font-body-sm text-body-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeCandidateTag(selectedCandidate.id, tag)}
                  className="hover:text-semantic-danger flex items-center opacity-60 hover:opacity-100 cursor-pointer"
                  title="Remove tag"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="flex flex-col gap-2.5">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
            Work History & Production Depth
          </span>
          <div className="flex flex-col gap-3 pl-2 border-l-2 border-surface-container-high">
            {(selectedCandidate.workHistory || []).map((work, idx) => (
              <div key={work.id || idx} className="relative pl-3">
                <span
                  className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest ${
                    idx === 0 ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                ></span>
                <span className="font-title text-title text-text-primary font-semibold">
                  {work.title}
                </span>
                <div className="flex items-center gap-2 font-body-sm text-body-sm text-text-secondary mt-0.5">
                  <span className="font-medium text-text-primary">{work.company}</span>
                  <span>•</span>
                  <span>{work.period}</span>
                </div>
                <p className="font-body-sm text-body-sm text-text-secondary mt-1 leading-relaxed">
                  {work.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiter Notes Section */}
        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-title text-title text-text-primary font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-text-secondary">
                note_alt
              </span>
              Recruiter Evaluation Log
            </span>
            <span className="font-label-sm text-label-sm text-text-secondary">
              {(selectedCandidate.notesList?.length ?? 0) === 1
                ? '1 Note'
                : `${selectedCandidate.notesList?.length ?? 0} Notes`}
            </span>
          </div>

          {/* Note Input Field */}
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full p-2.5 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none shadow-sm"
              placeholder="Add confidential screening notes, compensation signals, or interviewer debrief..."
              rows={2}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSaveNote();
                }
              }}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold hover:bg-surface-tint transition-colors cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex flex-col gap-2 pt-1">
            {(selectedCandidate.notesList || []).map((note) => (
              <div
                key={note.id}
                className="p-2.5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-1"
              >
                <div className="flex items-center justify-between font-label-sm text-label-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {note.author} ({note.authorRole})
                  </span>
                  <span>{note.date}</span>
                </div>
                <p className="font-body-sm text-body-sm text-text-primary leading-relaxed">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Audit Log */}
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
            Audit Trail
          </span>
          <div className="space-y-1 font-body-sm text-body-sm text-text-secondary">
            {(selectedCandidate.auditTrail || []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1 border-b border-surface-container-high/40 last:border-0"
              >
                <span>{item.action}</span>
                <span className="font-mono text-[11px]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
