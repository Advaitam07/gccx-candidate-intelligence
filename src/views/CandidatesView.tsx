import React, { useState, useRef, useEffect } from 'react';
import { useCandidates, SortOption } from '../context/CandidateContext';
import { CandidateDossier } from '../components/CandidateDossier';
import { ReviewStatus } from '../types/candidate';

export const CandidatesView: React.FC = () => {
  const {
    candidates,
    filteredCandidates,
    selectedCandidateId,
    setSelectedCandidateId,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    activeChips,
    removeChip,
    clearAllFilters,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    selectedCandidateIds,
    toggleCandidateSelection,
    selectAllVisible,
    clearSelection,
    toggleShortlist,
    setCandidateStatus,
    bulkShortlist,
    bulkChangeStatus,
    metrics,
    exportPipelineCSV,
    batchAiTriage,
    setCompareCandidateIds,
    setIsCompareModalOpen,
    showToast,
  } = useCandidates();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dropdown visibility states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, activeTab, sortBy]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllVisibleSelected =
    paginatedCandidates.length > 0 &&
    paginatedCandidates.every((c) => selectedCandidateIds.has(c.id));

  const handleToggleSelectAll = () => {
    const visibleIds = paginatedCandidates.map((c) => c.id);
    selectAllVisible(visibleIds);
  };

  const handleOpenCompare = () => {
    const selectedList = Array.from(selectedCandidateIds);
    if (selectedList.length < 2) {
      showToast('Please select at least 2 candidates to compare');
      return;
    }
    if (selectedList.length > 3) {
      showToast('Maximum 3 candidates can be compared simultaneously');
      return;
    }
    setCompareCandidateIds(selectedList);
    setIsCompareModalOpen(true);
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
    <div className="flex flex-col w-full">
      {/* Top Breadcrumb & Executive Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            <span>Candidates</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Active Pipeline</span>
            <span className="text-outline-variant">/</span>
            <span className="text-text-primary font-medium">GCCX Tech Search</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
              Candidate Intelligence Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-tint text-secondary font-label-sm text-label-sm font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              AI v4.8 Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary max-w-3xl mt-0.5 leading-relaxed">
            AI-powered candidate triage for modern recruiting. Move from raw candidate volume to confident,
            rubric-backed hiring decisions in seconds.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
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
            onClick={batchAiTriage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-title text-title font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
              auto_awesome
            </span>
            <span>Batch AI Triage</span>
          </button>
        </div>
      </div>

      {/* Telemetry Bar (4 High-Impact KPI Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        {/* Metric 1 */}
        <div
          onClick={() => setActiveTab('all')}
          className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Total Candidates
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
              Across 4 live tech requisitions
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-primary">
            <span className="material-symbols-outlined text-[22px]">groups</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/10 group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActiveTab('review-queue')}
          className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              In Review
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
              Avg turnaround: 2.8 hrs
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-tint text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">schedule</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-container/20 group-hover:bg-secondary transition-colors"></div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActiveTab('shortlist')}
          className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              Shortlisted
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
              Ready for Hiring Manager
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-primary">
            <span className="material-symbols-outlined text-[22px]">bookmark_added</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/10 group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Metric 4 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-medium">
              AI Analyzed
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
              Calibrated with VP Engineering rubric
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary group-hover:bg-accent-hover transition-colors"></div>
        </div>
      </div>

      {/* Pipeline View Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-surface-container-high pb-px mb-space-md">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-4 py-2.5 font-title text-title flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'font-semibold text-text-primary border-primary'
                : 'font-medium text-text-secondary hover:text-text-primary border-transparent'
            }`}
          >
            <span>All Candidates</span>
            <span
              className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                activeTab === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-text-secondary'
              }`}
            >
              {metrics.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('review-queue')}
            className={`relative px-4 py-2.5 font-title text-title flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'review-queue'
                ? 'font-semibold text-text-primary border-primary'
                : 'font-medium text-text-secondary hover:text-text-primary border-transparent'
            }`}
          >
            <span>Review Queue</span>
            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-accent-tint text-secondary font-semibold">
              {metrics.inReview}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shortlist')}
            className={`relative px-4 py-2.5 font-title text-title flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'shortlist'
                ? 'font-semibold text-text-primary border-primary'
                : 'font-medium text-text-secondary hover:text-text-primary border-transparent'
            }`}
          >
            <span>Shortlist</span>
            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-text-primary font-semibold">
              {metrics.shortlisted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`relative px-4 py-2.5 font-title text-title flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'font-semibold text-text-primary border-primary'
                : 'font-medium text-text-secondary hover:text-text-primary border-transparent'
            }`}
          >
            <span>Archived & Dropped</span>
            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-text-secondary font-medium">
              {candidates.filter((c) => c.reviewStatus === 'REJECTED').length}
            </span>
          </button>
        </div>

        {/* Active Filters Reset / Match Summary */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="font-body-sm text-body-sm text-text-secondary">
            Showing{' '}
            <strong className="text-text-primary font-semibold">
              {filteredCandidates.length}
            </strong>{' '}
            of {candidates.length} candidates
          </span>
          <button
            onClick={clearAllFilters}
            className="text-secondary hover:underline font-label-md text-label-md font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Command & Multi-Dimensional Filter Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          {/* Search Candidate / Skills */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
              search
            </span>
            <input
              className="w-full h-11 pl-10 pr-20 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-text-primary placeholder:text-text-secondary/60 focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
              placeholder="Search by name, skills (Python, AWS, React), company, or role..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-text-secondary">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Dimension Dropdowns */}
          <div className="flex flex-wrap items-center gap-2" ref={dropdownRef}>
            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'role' ? null : 'role')}
                className="h-10 px-3.5 rounded-lg bg-surface-container-low text-text-primary hover:bg-surface-container font-body-sm text-body-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-text-secondary">Role:</span>
                <span className="font-medium">{filters.role}</span>
                <span className="material-symbols-outlined text-[16px] text-text-secondary">
                  expand_more
                </span>
              </button>
              {openDropdown === 'role' && (
                <div className="absolute left-0 mt-1 w-52 bg-surface-container-lowest rounded-lg shadow-xl py-1 z-30 font-body-sm text-body-sm border border-surface-container-high animate-in fade-in duration-100">
                  {[
                    'All Roles',
                    'Backend Engineer',
                    'Senior Distributed Backend',
                    'Python API Specialist',
                    'DevOps / Platform',
                    'Full Stack',
                    'Frontend Engineer',
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setFilter('role', role);
                        setOpenDropdown(null);
                        showToast(`Role filter: ${role}`);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-surface-container-low cursor-pointer ${
                        filters.role === role
                          ? 'text-text-primary font-semibold bg-surface-container-low'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'exp' ? null : 'exp')}
                className="h-10 px-3.5 rounded-lg bg-surface-container-low text-text-primary hover:bg-surface-container font-body-sm text-body-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-text-secondary">Exp:</span>
                <span className="font-medium">{filters.exp}</span>
                <span className="material-symbols-outlined text-[16px] text-text-secondary">
                  expand_more
                </span>
              </button>
              {openDropdown === 'exp' && (
                <div className="absolute left-0 mt-1 w-44 bg-surface-container-lowest rounded-lg shadow-xl py-1 z-30 font-body-sm text-body-sm border border-surface-container-high animate-in fade-in duration-100">
                  {['Any Experience', '0-2 Years', '3-5 Years', '6-9 Years', '10+ Years'].map(
                    (exp) => (
                      <button
                        key={exp}
                        onClick={() => {
                          setFilter('exp', exp);
                          setOpenDropdown(null);
                          showToast(`Experience filter: ${exp}`);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-surface-container-low cursor-pointer ${
                          filters.exp === exp
                            ? 'text-text-primary font-semibold bg-surface-container-low'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {exp}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Source Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'source' ? null : 'source')}
                className="h-10 px-3.5 rounded-lg bg-surface-container-low text-text-primary hover:bg-surface-container font-body-sm text-body-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-text-secondary">Source:</span>
                <span className="font-medium">{filters.source}</span>
                <span className="material-symbols-outlined text-[16px] text-text-secondary">
                  expand_more
                </span>
              </button>
              {openDropdown === 'source' && (
                <div className="absolute left-0 mt-1 w-48 bg-surface-container-lowest rounded-lg shadow-xl py-1 z-30 font-body-sm text-body-sm border border-surface-container-high animate-in fade-in duration-100">
                  {['All Sources', 'LinkedIn', 'Referral', 'Direct Application', 'Agency'].map(
                    (src) => (
                      <button
                        key={src}
                        onClick={() => {
                          setFilter('source', src);
                          setOpenDropdown(null);
                          showToast(`Source filter: ${src}`);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-surface-container-low cursor-pointer ${
                          filters.source === src
                            ? 'text-text-primary font-semibold bg-surface-container-low'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {src}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className="h-10 px-3.5 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container-low font-body-sm text-body-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-[16px] text-text-secondary">
                  swap_vert
                </span>
                <span className="font-medium">
                  {sortBy === 'match-desc'
                    ? 'Highest AI Match'
                    : sortBy === 'match-asc'
                    ? 'Lowest AI Match'
                    : sortBy === 'exp-desc'
                    ? 'Experience (High to Low)'
                    : sortBy === 'exp-asc'
                    ? 'Experience (Low to High)'
                    : sortBy === 'alphabetical'
                    ? 'Candidate Name (A-Z)'
                    : 'Newest Submissions'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-text-secondary">
                  expand_more
                </span>
              </button>
              {openDropdown === 'sort' && (
                <div className="absolute right-0 mt-1 w-56 bg-surface-container-lowest rounded-lg shadow-xl py-1 z-30 font-body-sm text-body-sm border border-surface-container-high animate-in fade-in duration-100">
                  {[
                    { id: 'match-desc', label: 'Highest AI Match' },
                    { id: 'match-asc', label: 'Lowest AI Match' },
                    { id: 'exp-desc', label: 'Experience (High to Low)' },
                    { id: 'exp-asc', label: 'Experience (Low to High)' },
                    { id: 'recent', label: 'Newest Submissions' },
                    { id: 'alphabetical', label: 'Candidate Name (A-Z)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSortBy(s.id as SortOption);
                        setOpenDropdown(null);
                        showToast(`Sorted: ${s.label}`);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-surface-container-low cursor-pointer ${
                        sortBy === s.id
                          ? 'text-text-primary font-semibold bg-surface-container-low'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Tag Chips Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-container-high">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary mr-1 font-medium">
            Active Criteria:
          </span>
          {activeChips.length === 0 && (
            <span className="text-text-secondary text-[12px] italic mr-2">
              None (Showing all active pipeline candidates)
            </span>
          )}
          {activeChips.map((chip) => (
            <div
              key={chip.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-md text-label-md ${
                chip.type === 'exp'
                  ? 'bg-accent-tint text-secondary font-semibold'
                  : 'bg-surface-container text-text-primary'
              }`}
            >
              <span>{chip.label}</span>
              <button
                onClick={() => removeChip(chip.id)}
                className="hover:text-semantic-danger flex items-center cursor-pointer"
                title={`Remove ${chip.label}`}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
          {activeChips.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-text-secondary hover:text-text-primary font-label-sm text-label-sm ml-2 underline cursor-pointer"
            >
              Clear all criteria
            </button>
          )}

          {/* Quick Skill Filters */}
          <div className="ml-auto hidden md:flex items-center gap-1.5 text-[12px] text-text-secondary">
            <span>Filter by skill:</span>
            {['Python', 'FastAPI', 'AWS', 'Go', 'Kubernetes'].map((skill) => {
              const isActive = activeChips.some(
                (c) => c.type === 'skill' && c.value.toLowerCase() === skill.toLowerCase()
              );
              return (
                <button
                  key={skill}
                  onClick={() => {
                    if (isActive) {
                      const chip = activeChips.find(
                        (c) => c.type === 'skill' && c.value.toLowerCase() === skill.toLowerCase()
                      );
                      if (chip) removeChip(chip.id);
                    } else {
                      setFilter('role', filters.role); // trigger sync
                      // Add skill filter
                      setSearchQuery(skill);
                      showToast(`Filtering by ${skill}`);
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isActive || searchQuery.toLowerCase() === skill.toLowerCase()
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-text-primary'
                  }`}
                >
                  +{skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when any candidate is selected via checkboxes) */}
      {selectedCandidateIds.size > 0 && (
        <div className="mb-4 px-4 py-2.5 bg-primary text-on-primary rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="font-title text-title font-semibold">
              {selectedCandidateIds.size} Candidate
              {selectedCandidateIds.size > 1 ? 's' : ''} Selected
            </span>
            <button
              onClick={clearSelection}
              className="text-surface-variant hover:text-white font-label-sm text-label-sm underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={bulkShortlist}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-title text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                bookmark_added
              </span>
              <span>Bulk Shortlist</span>
            </button>

            <button
              onClick={() => bulkChangeStatus('IN_REVIEW')}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-title text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-semantic-warning">
                schedule
              </span>
              <span>Move to Review</span>
            </button>

            {selectedCandidateIds.size >= 2 && selectedCandidateIds.size <= 3 && (
              <button
                onClick={handleOpenCompare}
                className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-accent-hover font-title text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                <span>Compare Selected ({selectedCandidateIds.size})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Workspace: Split Layout (Candidate Table & Live AI Dossier Pane) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT / MAIN: Candidate Table (7 cols on XL) */}
        <div className="xl:col-span-7 flex flex-col gap-space-md">
          {/* Table Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Column Headers */}
            <div className="grid grid-cols-12 gap-3 px-space-md py-3 bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-text-secondary select-none font-medium">
              <div className="col-span-5 flex items-center gap-2">
                <input
                  checked={isAllVisibleSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded w-3.5 h-3.5 text-primary accent-primary cursor-pointer"
                  title="Select all visible candidates"
                  type="checkbox"
                />
                <span>Candidate & Seniority</span>
              </div>
              <div className="col-span-3">Role & Experience</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">AI Fit Score</div>
            </div>

            {/* Table Body Rows */}
            <div className="flex flex-col divide-y divide-surface-container-high/60">
              {paginatedCandidates.length === 0 ? (
                <div className="p-8 text-center text-text-secondary flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-text-secondary/40">
                    search_off
                  </span>
                  <p className="font-title text-title font-medium text-text-primary">
                    No candidates found matching criteria
                  </p>
                  <p className="font-body-sm text-body-sm">
                    Try adjusting search terms or resetting filter criteria.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-title text-[13px] font-semibold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                paginatedCandidates.map((cand) => {
                  const isSelected = selectedCandidateId === cand.id;
                  const isChecked = selectedCandidateIds.has(cand.id);

                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`group grid grid-cols-12 gap-3 px-space-md py-3.5 items-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-accent-tint/30 border-l-4 border-secondary'
                          : 'hover:bg-surface-container-low border-l-4 border-transparent'
                      }`}
                    >
                      {/* Col 1: Candidate & Seniority */}
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <input
                          checked={isChecked}
                          onChange={() => toggleCandidateSelection(cand.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                          type="checkbox"
                        />
                        <div className="relative shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full font-title text-title font-semibold flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-text-primary'
                            }`}
                          >
                            {cand.initials}
                          </div>
                          {cand.shortlisted && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-semantic-success ring-2 ring-surface-container-lowest"></span>
                          )}
                          {!cand.shortlisted && (cand.aiFit ?? 0) >= 90 && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest"></span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-title text-title text-text-primary font-semibold truncate group-hover:text-secondary transition-colors">
                              {cand.name}
                            </span>
                            {(cand.aiFit ?? 0) >= 90 && (
                              <span
                                className="material-symbols-outlined text-[14px] text-secondary shrink-0"
                                title="AI High Recommendation"
                              >
                                verified
                              </span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-text-secondary truncate">
                            {cand.location} • {cand.availability}
                          </span>
                        </div>
                      </div>

                      {/* Col 2: Role & Experience */}
                      <div className="col-span-3 flex flex-col min-w-0">
                        <span className="font-body-md text-body-md text-text-primary font-medium truncate">
                          {cand.targetRole}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-label-sm text-label-sm text-text-secondary">
                            {cand.yearsExperience} yrs exp
                          </span>
                          <span className="text-outline-variant">•</span>
                          <span className="px-1 rounded bg-surface-container font-label-sm text-label-sm text-text-secondary">
                            {cand.source}
                          </span>
                        </div>
                      </div>

                      {/* Col 3: Review Status */}
                      <div className="col-span-2 flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${getStatusBadge(
                            cand.reviewStatus
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cand.reviewStatus === 'SHORTLISTED'
                                ? 'bg-semantic-success'
                                : cand.reviewStatus === 'IN_REVIEW'
                                ? 'bg-semantic-warning'
                                : cand.reviewStatus === 'REJECTED'
                                ? 'bg-semantic-danger'
                                : 'bg-secondary'
                            }`}
                          ></span>
                          {formatStatus(cand.reviewStatus)}
                        </span>
                      </div>

                      {/* Col 4: AI Fit Score & Shortlist Icon */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-title text-title font-bold ${
                                (cand.aiFit ?? 0) >= 90
                                  ? 'text-secondary'
                                  : 'text-text-primary'
                              }`}
                            >
                              {cand.aiFit ?? 80}%
                            </span>
                            <span
                              className={`material-symbols-outlined text-[14px] ${
                                (cand.aiFit ?? 0) >= 90
                                  ? 'text-secondary'
                                  : 'text-text-secondary'
                              }`}
                            >
                              auto_awesome
                            </span>
                          </div>
                          <span
                            className={`font-label-sm text-label-sm font-medium ${
                              (cand.aiFit ?? 0) >= 90
                                ? 'text-semantic-success'
                                : 'text-text-secondary'
                            }`}
                          >
                            {(cand.aiFit ?? 0) >= 90
                              ? 'Top 5% Fit'
                              : (cand.aiFit ?? 0) >= 80
                              ? 'Strong Match'
                              : 'Viable'}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist(cand.id);
                          }}
                          className={`p-1 rounded hover:bg-surface-container shrink-0 transition-colors cursor-pointer ${
                            cand.shortlisted ? 'text-secondary' : 'text-text-secondary hover:text-secondary'
                          }`}
                          title={cand.shortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {cand.shortlisted ? 'bookmark' : 'bookmark_border'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Footer Pagination */}
            <div className="p-space-md bg-surface-container-low flex items-center justify-between font-body-sm text-body-sm text-text-secondary border-t border-surface-container-high">
              <span>
                Displaying {paginatedCandidates.length} priority candidates of{' '}
                {filteredCandidates.length} total
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-surface-container-lowest text-text-secondary hover:text-text-primary shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 rounded shadow-sm cursor-pointer ${
                      currentPage === page
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'bg-surface-container-lowest text-text-primary hover:bg-surface-container'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 5 && <span className="px-1 text-text-secondary">...</span>}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Quick Triage Tip banner */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-3 border border-surface-container-high/50">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="flex flex-col">
              <span className="font-title text-title text-text-primary font-semibold">
                Calibrated against Production Rubric: Backend Seniority
              </span>
              <p className="font-body-sm text-body-sm text-text-secondary mt-0.5 leading-relaxed">
                Weights assigned: Async Python & FastAPI (35%), Cloud IaC & AWS Architecture (30%),
                System Scalability (20%), Code Rigor & Testing (15%). Candidates above 90% auto-routed to Tech
                Lead review.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Dossier Inspection Pane (5 cols on XL) */}
        <div className="xl:col-span-5 flex flex-col gap-space-md sticky top-20">
          <CandidateDossier />
        </div>
      </div>
    </div>
  );
};
