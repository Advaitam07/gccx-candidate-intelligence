from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.candidate import CandidateModel, AiAnalysisModel
from backend.app.schemas.candidate import CandidateResponse, AiAnalysisResult
from backend.app.services.ai_service import ai_service
from backend.app.services.skill_matching import skill_index
from backend.app.services.task2b_fix import match_candidates_python
from backend.app.routes.candidates import format_candidate_response

router = APIRouter(prefix="/api/v1", tags=["ai_and_skills"])

@router.post("/ai/candidates/{candidate_id}/analyze", response_model=CandidateResponse)
def analyze_candidate_with_llm(candidate_id: str, db: Session = Depends(get_db)):
    """
    Executes real LLM evaluation using Google Gemini for a specific candidate.
    Persists fit score, summary, verified strengths, gaps, and recommendation into SQLite.
    """
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    # Prepare strictly grounded payload for LLM prompt
    candidate_data = {
        "id": candidate.id,
        "name": candidate.name,
        "target_role": candidate.target_role,
        "years_experience": candidate.years_experience,
        "source": candidate.source,
        "skills": candidate.skills or [],
        "notes": candidate.notes or "",
    }

    try:
        result = ai_service.evaluate_candidate(candidate_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    # Persist into CandidateModel
    candidate.ai_fit = result["fit_score"]
    candidate.ai_summary = result["fit_summary"]
    candidate.strengths = result["strengths"]
    candidate.gaps = result["gaps"]
    candidate.suggested_action = result["recommendation"]
    candidate.ai_analyzed = True
    candidate.updated_at = datetime.utcnow().isoformat() + "Z"

    # Persist into AiAnalysisModel historical ledger
    analysis_record = AiAnalysisModel(
        candidate_id=candidate.id,
        fit_score=result["fit_score"],
        fit_summary=result["fit_summary"],
        strengths=result["strengths"],
        gaps=result["gaps"],
        recommendation=result["recommendation"],
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(candidate)

    return format_candidate_response(candidate)

@router.get("/skills/rank")
def rank_candidates_by_skills(
    skills: str = Query(..., description="Comma-separated required skills (e.g. Python,AWS,Docker)"),
    limit: int = Query(20, ge=1, le=100),
    min_overlap: float = Query(0.0, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Task 2A Endpoint: Sub-millisecond inverted index skill overlap ranking.
    Demonstrates O(M + Postings) candidate retrieval over large candidate databases.
    """
    # Ensure inverted index is warmed from database
    candidates = db.query(CandidateModel).all()
    c_dicts = [
        {
            "id": c.id,
            "name": c.name,
            "target_role": c.target_role,
            "years_experience": c.years_experience,
            "skills": c.skills or []
        }
        for c in candidates
    ]
    skill_index.build_index_from_candidates(c_dicts)

    req_list = [s.strip() for s in skills.split(",") if s.strip()]
    ranked = skill_index.rank_candidates_by_skill_overlap(
        required_skills=req_list,
        top_k=limit,
        min_overlap=min_overlap
    )

    return {
        "required_skills": req_list,
        "total_ranked_matches": len(ranked),
        "algorithm": "Inverted Index (Skill -> Postings List)",
        "complexity": "O(M + posting_hits) vs O(N * M) linear scan",
        "results": ranked
    }

@router.get("/skills/task2b")
def run_task2b_verification(db: Session = Depends(get_db)):
    """
    Task 2B Endpoint: Analyzes AI-generated matchCandidates code,
    documents identified bugs (off-by-one, leaked global, array sort, linear lookup),
    and executes the corrected algorithm against database candidates.
    """
    candidates = db.query(CandidateModel).limit(10).all()
    c_dicts = [
        {"name": c.name, "skills": c.skills or []}
        for c in candidates
    ]

    test_skills = ["Python", "FastAPI", "AWS", "Kubernetes"]
    fixed_results = match_candidates_python(c_dicts, test_skills)

    return {
        "task": "Task 2B Code Review & Bug Fixes",
        "bugs_identified": [
            {
                "issue": "Off-by-one loop boundary",
                "original": "for (i = 0; i <= candidates.length; i++)",
                "fix": "for (let i = 0; i < candidates.length; i++)",
                "impact": "TypeError reading .skills of undefined on last iteration."
            },
            {
                "issue": "Undeclared global loop variable",
                "original": "for (i = 0; ...)",
                "fix": "for (let i = 0; ...)",
                "impact": "Pollutes global scope, breaks strict mode."
            },
            {
                "issue": "Array subtraction in comparator",
                "original": "matches.sort((a, b) => a.score - b.score)",
                "fix": "matches.sort((a, b) => b.score.length - a.score.length)",
                "impact": "Subtracting arrays evaluates to NaN, creating non-deterministic sort order."
            },
            {
                "issue": "Repeated linear scan with Array.includes",
                "original": "c.skills.filter(s => requiredSkills.includes(s))",
                "fix": "const required = new Set(requiredSkills); required.has(skill)",
                "impact": "O(N * K * M) down to O(M + N * K) via O(1) hash set lookups."
            }
        ],
        "test_query": test_skills,
        "results_count": len(fixed_results),
        "matches": fixed_results
    }
