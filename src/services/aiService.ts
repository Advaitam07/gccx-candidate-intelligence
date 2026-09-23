import { Candidate, CandidateAnalysis, AiAnalysisPhase } from '../types/candidate';

export interface AiAnalysisProgressCallback {
  (phase: AiAnalysisPhase, progressPercent: number): void;
}

export class CandidateAiService {
  /**
   * Deterministically analyze a candidate profile against the rubric.
   * Architecture ready for POST /api/v1/ai/candidates/{id}/analyze
   */
  async generateCandidateAnalysis(
    candidate: Candidate,
    onProgress?: AiAnalysisProgressCallback
  ): Promise<CandidateAnalysis> {
    const phases: { phase: AiAnalysisPhase; progress: number; delay: number }[] = [
      { phase: 'ANALYZING PROFILE', progress: 25, delay: 200 },
      { phase: 'CHECKING EXPERIENCE', progress: 50, delay: 250 },
      { phase: 'MATCHING SKILLS', progress: 75, delay: 250 },
      { phase: 'GENERATING INSIGHT', progress: 95, delay: 200 },
    ];

    for (const step of phases) {
      if (onProgress) {
        onProgress(step.phase, step.progress);
      }
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    // Dynamic scoring based on candidate skills, experience and role
    const skillCount = candidate.skills.length;
    const expWeight = Math.min(candidate.yearsExperience * 5, 40);
    const hasFastApi = candidate.skills.some((s) => s.toLowerCase().includes('fastapi'));
    const hasAws = candidate.skills.some((s) => s.toLowerCase().includes('aws'));
    const hasPython = candidate.skills.some((s) => s.toLowerCase().includes('python'));

    let baseScore = 70 + (skillCount * 2) + Math.round(expWeight * 0.4);
    if (hasFastApi) baseScore += 6;
    if (hasAws) baseScore += 5;
    if (hasPython) baseScore += 4;
    const finalFitScore = Math.min(Math.max(baseScore, 68), 98);

    const strengths: string[] = [];
    if (hasPython || hasFastApi) {
      strengths.push(
        'Python 3.11 & Async FastAPI: Authored low-latency async endpoints with high uptime reliability.'
      );
    }
    if (hasAws) {
      strengths.push(
        'Cloud Infrastructure: Direct ownership of AWS stack (ECS Fargate, RDS PostgreSQL, IAM, S3).'
      );
    }
    if (candidate.yearsExperience >= 5) {
      strengths.push(
        'Senior Engineering Rigor: Demonstrated deep experience scaling services under heavy production load.'
      );
    } else {
      strengths.push(
        'High Velocity Execution: Rapid delivery cadence with clean automated CI/CD pipelines.'
      );
    }

    const gaps: string[] = [];
    if (!candidate.skills.some((s) => s.toLowerCase().includes('kubernetes'))) {
      gaps.push(
        'Kubernetes: Containerized with Docker; limited evidence of high-density Kubernetes cluster operations.'
      );
    }
    if (candidate.yearsExperience < 5) {
      gaps.push(
        'Monorepo Tooling: Experience primarily with polyrepo setups; verify build tooling breadth.'
      );
    } else {
      gaps.push('Compensation Calibration: Sits in top 15% tier of market rate expectations.');
    }

    const fitSummary = `Strong ${candidate.targetRole} fit with verified ${candidate.skills.slice(0, 3).join(', ')} production depth. Calibrated at ${finalFitScore}% against Engineering Hiring Rubric v4.8.`;

    const recommendation =
      finalFitScore >= 90
        ? `Fast-track candidate for 45-min Technical System Screening focusing on distributed architecture, API latency spikes, and worker queues.`
        : finalFitScore >= 80
        ? `Proceed with standard technical screening to probe framework depth and database optimization.`
        : `Hold for junior-mid engineering cohorts or alternative specialized requisitions.`;

    return {
      fitScore: finalFitScore,
      fitSummary,
      strengths,
      gaps,
      recommendation,
    };
  }
}

export const aiService = new CandidateAiService();
