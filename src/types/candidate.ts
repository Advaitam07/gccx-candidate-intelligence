export type ReviewStatus = 'NEEDS_REVIEW' | 'IN_REVIEW' | 'SHORTLISTED' | 'REJECTED';

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface RecruiterNote {
  id: string;
  author: string;
  authorRole: string;
  date: string;
  text: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  time: string;
}

export interface Candidate {
  id: string;
  codeId: string; // e.g. '#GCCX-8841'
  name: string;
  initials: string;
  targetRole: string;
  yearsExperience: number;
  location?: string;
  availability?: string;
  source: string;
  skills: string[];
  summary: string;
  notes: string;
  tags: string[];
  shortlisted: boolean;
  reviewStatus: ReviewStatus;
  aiFit?: number;
  aiSummary?: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  aiAnalyzed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  strengths?: string[];
  gaps?: string[];
  suggestedAction?: string;
  workHistory?: WorkExperience[];
  notesList?: RecruiterNote[];
  auditTrail?: AuditLogItem[];
}

export interface CandidateAnalysis {
  fitScore: number;
  fitSummary: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export type AiAnalysisState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
export type AiAnalysisPhase =
  | 'ANALYZING PROFILE'
  | 'CHECKING EXPERIENCE'
  | 'MATCHING SKILLS'
  | 'GENERATING INSIGHT';

export interface SavedView {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: {
    role?: string;
    exp?: string;
    source?: string;
    status?: ReviewStatus | 'ALL';
    minAiFit?: number;
    skillQuery?: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'shortlist' | 'status' | 'ai' | 'note' | 'system';
}
