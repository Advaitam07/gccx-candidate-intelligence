import { Candidate, ReviewStatus } from '../types/candidate';

export interface CandidatesQueryParams {
  search?: string;
  role?: string;
  min_experience?: number;
  max_experience?: number;
  experience_band?: string;
  source?: string;
  status?: string;
  shortlisted_only?: boolean;
  min_ai_fit?: number;
  skill?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CandidateListApiResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStatsApiResponse {
  totalCandidates: number;
  needsReview: number;
  inReview: number;
  shortlisted: number;
  rejected: number;
  aiAnalyzed: number;
  avgFitScore: number;
  topTierCount: number;
  channelConversion: Array<{
    source: string;
    volume: number;
    shortlisted: number;
    conversionRate: string;
  }>;
}

export interface Task2ARankResult {
  candidate_id: string;
  name: string;
  target_role: string;
  years_experience: number;
  overlap_score: number;
  overlap_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  candidate_all_skills: string[];
}

export interface Task2AResponse {
  required_skills: string[];
  total_ranked_matches: number;
  algorithm: string;
  complexity: string;
  results: Task2ARankResult[];
}

export interface Task2BResponse {
  task: string;
  bugs_identified: Array<{
    issue: string;
    original: string;
    fix: string;
    impact: string;
  }>;
  test_query: string[];
  results_count: number;
  matches: Array<{
    name: string;
    score: string[];
    match_count: number;
  }>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // In browser, relative URLs like /api/v1/... go through Vite's proxy directly to FastAPI
    this.baseUrl = '';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `API Error ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = errorData.detail;
        }
      } catch {
        // use fallback text
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  async getHealth(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>('/health');
  }

  async getStats(): Promise<DashboardStatsApiResponse> {
    return this.request<DashboardStatsApiResponse>('/api/v1/stats');
  }

  async getCandidates(params: CandidatesQueryParams = {}): Promise<CandidateListApiResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.role && params.role !== 'All Roles') query.set('role', params.role);
    if (params.experience_band && params.experience_band !== 'Any Experience') {
      query.set('experience_band', params.experience_band);
    }
    if (params.source && params.source !== 'All Sources') query.set('source', params.source);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.shortlisted_only) query.set('shortlisted_only', 'true');
    if (params.min_ai_fit !== undefined && params.min_ai_fit !== null) {
      query.set('min_ai_fit', params.min_ai_fit.toString());
    }
    if (params.skill) query.set('skill', params.skill);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const qs = query.toString();
    return this.request<CandidateListApiResponse>(`/api/v1/candidates${qs ? `?${qs}` : ''}`);
  }

  async getCandidate(candidateId: string): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/candidates/${candidateId}`);
  }

  async toggleShortlist(candidateId: string, shortlisted?: boolean): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/candidates/${candidateId}/shortlist`, {
      method: 'POST',
      body: JSON.stringify(shortlisted !== undefined ? { shortlisted } : {}),
    });
  }

  async updateStatus(candidateId: string, status: ReviewStatus): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/candidates/${candidateId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async addTag(candidateId: string, tagName: string): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/candidates/${candidateId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ name: tagName }),
    });
  }

  async removeTag(candidateId: string, tagName: string): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/candidates/${candidateId}/tags/${encodeURIComponent(tagName)}`, {
      method: 'DELETE',
    });
  }

  async addNote(
    candidateId: string,
    text: string,
    author: string = 'Recruiter',
    authorRole: string = 'Technical Recruiter'
  ): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/candidates/${candidateId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text, author, author_role: authorRole }),
    });
  }

  async analyzeCandidate(candidateId: string): Promise<Candidate> {
    return this.request<Candidate>(`/api/v1/ai/candidates/${candidateId}/analyze`, {
      method: 'POST',
    });
  }

  async rankSkills(skills: string[], limit: number = 20): Promise<Task2AResponse> {
    const qs = encodeURIComponent(skills.join(','));
    return this.request<Task2AResponse>(`/api/v1/skills/rank?skills=${qs}&limit=${limit}`);
  }

  async getTask2bVerification(): Promise<Task2BResponse> {
    return this.request<Task2BResponse>('/api/v1/skills/task2b');
  }
}

export const apiClient = new ApiClient();
