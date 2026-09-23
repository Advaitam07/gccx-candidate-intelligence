from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, String

from backend.app.database import get_db
from backend.app.models.candidate import CandidateModel, TagModel, RecruiterNoteModel
from backend.app.schemas.candidate import (
    CandidateResponse,
    CandidateListResponse,
    DashboardStats,
    CandidateUpdate,
    TagCreate,
    NoteCreate,
    ShortlistToggleRequest,
    StatusUpdateRequest,
    NoteResponse,
)

router = APIRouter(prefix="/api/v1", tags=["candidates"])

def format_candidate_response(candidate: CandidateModel) -> CandidateResponse:
    """Transforms database model into frontend-ready schema."""
    tags_list = [t.name for t in candidate.tags]
    notes_list = [
        NoteResponse(
            id=str(n.id),
            author=n.author,
            authorRole=n.author_role,
            date=n.date or (n.created_at[:10] if n.created_at else "Recently"),
            text=n.text,
        )
        for n in candidate.recruiter_notes
    ]

    return CandidateResponse(
        id=candidate.id,
        codeId=candidate.code_id or f"#GCCX-{candidate.id[:4]}",
        name=candidate.name,
        initials=candidate.initials or "".join(part[0].upper() for part in candidate.name.split()[:2]),
        targetRole=candidate.target_role,
        yearsExperience=candidate.years_experience,
        location=candidate.location or "Remote",
        availability=candidate.availability or "Immediate",
        source=candidate.source,
        skills=candidate.skills or [],
        notes=candidate.notes or "",
        appliedDate=candidate.applied_date,
        reviewStatus=candidate.review_status,
        shortlisted=bool(candidate.shortlisted),
        aiFit=candidate.ai_fit,
        aiSummary=candidate.ai_summary,
        matchingSkills=candidate.matching_skills or [],
        missingSkills=candidate.missing_skills or [],
        aiAnalyzed=bool(candidate.ai_analyzed),
        strengths=candidate.strengths or [],
        gaps=candidate.gaps or [],
        suggestedAction=candidate.suggested_action,
        workHistory=candidate.work_history or [],
        tags=tags_list,
        notesList=notes_list,
        createdAt=candidate.created_at or datetime.utcnow().isoformat() + "Z",
        updatedAt=candidate.updated_at or datetime.utcnow().isoformat() + "Z",
    )

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes real dynamic telemetry metrics from SQLite."""
    all_candidates = db.query(CandidateModel).all()
    total = len(all_candidates)

    if total == 0:
        return DashboardStats(
            totalCandidates=0,
            needsReview=0,
            inReview=0,
            shortlisted=0,
            rejected=0,
            aiAnalyzed=0,
            avgFitScore=0.0,
            topTierCount=0,
            channelConversion=[]
        )

    needs_review = sum(1 for c in all_candidates if c.review_status == "NEEDS_REVIEW")
    in_review = sum(1 for c in all_candidates if c.review_status == "IN_REVIEW")
    shortlisted = sum(1 for c in all_candidates if c.shortlisted or c.review_status == "SHORTLISTED")
    rejected = sum(1 for c in all_candidates if c.review_status == "REJECTED")
    ai_analyzed = sum(1 for c in all_candidates if c.ai_analyzed)

    scored = [c.ai_fit for c in all_candidates if c.ai_fit is not None]
    avg_fit = sum(scored) / len(scored) if scored else 0.0
    top_tier = sum(1 for s in scored if s >= 90)

    # Compute channel conversion
    sources = {}
    for c in all_candidates:
        src = c.source or "Other"
        if src not in sources:
            sources[src] = {"total": 0, "shortlisted": 0}
        sources[src]["total"] += 1
        if c.shortlisted or c.review_status == "SHORTLISTED":
            sources[src]["shortlisted"] += 1

    channel_list = []
    for src, counts in sources.items():
        rate = round((counts["shortlisted"] / counts["total"]) * 100) if counts["total"] > 0 else 0
        channel_list.append({
            "source": src,
            "volume": counts["total"],
            "shortlisted": counts["shortlisted"],
            "conversionRate": f"{rate}%"
        })

    return DashboardStats(
        totalCandidates=total,
        needsReview=needs_review,
        inReview=in_review,
        shortlisted=shortlisted,
        rejected=rejected,
        aiAnalyzed=ai_analyzed,
        avgFitScore=round(avg_fit, 1),
        topTierCount=top_tier,
        channelConversion=channel_list
    )

@router.get("/candidates", response_model=CandidateListResponse)
def get_candidates(
    search: Optional[str] = Query(None, description="Search across name, role, skills, notes, source"),
    role: Optional[str] = Query(None, description="Filter by target role"),
    min_experience: Optional[int] = Query(None, ge=0),
    max_experience: Optional[int] = Query(None, ge=0),
    experience_band: Optional[str] = Query(None, description="e.g. 1-2 Years, 3-5 Years, 6+ Years"),
    source: Optional[str] = Query(None, description="e.g. LinkedIn, Referral, Direct Application, Agency"),
    status: Optional[str] = Query(None, description="NEEDS_REVIEW, IN_REVIEW, SHORTLISTED, REJECTED"),
    shortlisted_only: Optional[bool] = Query(None),
    min_ai_fit: Optional[int] = Query(None, ge=0, le=100),
    skill: Optional[str] = Query(None),
    sort: Optional[str] = Query("match-desc", description="match-desc, match-asc, exp-desc, exp-asc, name-asc, newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search, filter, sort, and paginate candidates with SQL-backed query execution.
    """
    query = db.query(CandidateModel)

    # Search filter across name, role, notes, source, code_id
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                CandidateModel.name.ilike(term),
                CandidateModel.target_role.ilike(term),
                CandidateModel.source.ilike(term),
                CandidateModel.notes.ilike(term),
                CandidateModel.code_id.ilike(term),
                CandidateModel.skills.cast(String).ilike(term) if hasattr(CandidateModel.skills, "cast") else CandidateModel.name.ilike(term)
            )
        )

    # Role filter
    if role and role not in ["All Roles", "all"]:
        query = query.filter(CandidateModel.target_role.ilike(f"%{role}%"))

    # Experience band filter
    if experience_band and experience_band != "Any Experience":
        if "1-2" in experience_band:
            query = query.filter(CandidateModel.years_experience <= 2)
        elif "3-5" in experience_band:
            query = query.filter(CandidateModel.years_experience >= 3, CandidateModel.years_experience <= 5)
        elif "6+" in experience_band:
            query = query.filter(CandidateModel.years_experience >= 6)

    if min_experience is not None:
        query = query.filter(CandidateModel.years_experience >= min_experience)
    if max_experience is not None:
        query = query.filter(CandidateModel.years_experience <= max_experience)

    # Source filter
    if source and source not in ["All Sources", "all"]:
        query = query.filter(CandidateModel.source.ilike(f"%{source}%"))

    # Review status filter
    if status and status.upper() not in ["ALL", ""]:
        query = query.filter(CandidateModel.review_status == status.upper())

    # Shortlisted filter
    if shortlisted_only is True:
        query = query.filter(or_(CandidateModel.shortlisted == True, CandidateModel.review_status == "SHORTLISTED"))

    # AI Fit filter
    if min_ai_fit is not None:
        query = query.filter(CandidateModel.ai_fit >= min_ai_fit)

    # Skill filter
    if skill and skill.strip():
        skill_term = f"%{skill.strip()}%"
        query = query.join(CandidateModel.tags, isouter=True).filter(
            or_(
                TagModel.name.ilike(skill_term),
                CandidateModel.skills.contains(skill.strip())
            )
        ).distinct()

    # Total count after filters
    total = query.count()

    # Sorting
    if sort == "match-desc":
        query = query.order_by(desc(CandidateModel.ai_fit.is_(None)), desc(CandidateModel.ai_fit), desc(CandidateModel.years_experience))
    elif sort == "match-asc":
        query = query.order_by(desc(CandidateModel.ai_fit.is_(None)), asc(CandidateModel.ai_fit))
    elif sort == "exp-desc":
        query = query.order_by(desc(CandidateModel.years_experience))
    elif sort == "exp-asc":
        query = query.order_by(asc(CandidateModel.years_experience))
    elif sort == "name-asc":
        query = query.order_by(asc(CandidateModel.name))
    elif sort == "newest":
        query = query.order_by(desc(CandidateModel.applied_date), desc(CandidateModel.created_at))
    else:
        query = query.order_by(desc(CandidateModel.ai_fit))

    # Pagination
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()
    total_pages = max(1, (total + limit - 1) // limit)

    return CandidateListResponse(
        candidates=[format_candidate_response(c) for c in results],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
def get_candidate_detail(candidate_id: str, db: Session = Depends(get_db)):
    """Fetches full candidate details including tags, notes, and AI analysis."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )
    return format_candidate_response(candidate)

@router.patch("/candidates/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: str, payload: CandidateUpdate, db: Session = Depends(get_db)):
    """Updates candidate attributes and updates modification timestamp."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    data = payload.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(candidate, key, val)

    candidate.updated_at = datetime.utcnow().isoformat() + "Z"
    db.commit()
    db.refresh(candidate)
    return format_candidate_response(candidate)

@router.post("/candidates/{candidate_id}/shortlist", response_model=CandidateResponse)
def toggle_candidate_shortlist(
    candidate_id: str,
    payload: Optional[ShortlistToggleRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Persistently toggles or sets shortlist state in SQLite.
    Synchronizes review_status accordingly.
    """
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    if payload and payload.shortlisted is not None:
        candidate.shortlisted = payload.shortlisted
    else:
        candidate.shortlisted = not candidate.shortlisted

    if candidate.shortlisted and candidate.review_status != "SHORTLISTED":
        candidate.review_status = "SHORTLISTED"
    elif not candidate.shortlisted and candidate.review_status == "SHORTLISTED":
        candidate.review_status = "IN_REVIEW"

    candidate.updated_at = datetime.utcnow().isoformat() + "Z"
    db.commit()
    db.refresh(candidate)
    return format_candidate_response(candidate)

@router.post("/candidates/{candidate_id}/status", response_model=CandidateResponse)
def update_candidate_status(
    candidate_id: str,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Persistently updates candidate review status.
    (NEEDS_REVIEW, IN_REVIEW, SHORTLISTED, REJECTED)
    """
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    valid_statuses = {"NEEDS_REVIEW", "IN_REVIEW", "SHORTLISTED", "REJECTED"}
    norm_status = payload.status.upper()
    if norm_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid review status '{payload.status}'. Must be one of: {', '.join(valid_statuses)}"
        )

    candidate.review_status = norm_status
    if norm_status == "SHORTLISTED":
        candidate.shortlisted = True
    elif norm_status == "REJECTED":
        candidate.shortlisted = False

    candidate.updated_at = datetime.utcnow().isoformat() + "Z"
    db.commit()
    db.refresh(candidate)
    return format_candidate_response(candidate)

@router.post("/candidates/{candidate_id}/tags", response_model=CandidateResponse)
def add_candidate_tag(candidate_id: str, payload: TagCreate, db: Session = Depends(get_db)):
    """Persistently associates a tag with a candidate in SQLite."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    clean_name = payload.name.strip()
    if not clean_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag name cannot be empty.")

    # Prevent duplicate tag for same candidate
    existing = db.query(TagModel).filter(
        TagModel.candidate_id == candidate_id,
        TagModel.name == clean_name
    ).first()

    if not existing:
        new_tag = TagModel(candidate_id=candidate_id, name=clean_name)
        db.add(new_tag)
        candidate.updated_at = datetime.utcnow().isoformat() + "Z"
        db.commit()
        db.refresh(candidate)

    return format_candidate_response(candidate)

@router.delete("/candidates/{candidate_id}/tags/{tag_name}", response_model=CandidateResponse)
def remove_candidate_tag(candidate_id: str, tag_name: str, db: Session = Depends(get_db)):
    """Removes a tag from a candidate."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    existing = db.query(TagModel).filter(
        TagModel.candidate_id == candidate_id,
        TagModel.name == tag_name
    ).first()

    if existing:
        db.delete(existing)
        candidate.updated_at = datetime.utcnow().isoformat() + "Z"
        db.commit()
        db.refresh(candidate)

    return format_candidate_response(candidate)

@router.post("/candidates/{candidate_id}/notes", response_model=CandidateResponse)
def add_recruiter_note(candidate_id: str, payload: NoteCreate, db: Session = Depends(get_db)):
    """Persists a confidential recruiter note on the candidate profile."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )

    clean_text = payload.text.strip()
    if not clean_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Note text cannot be empty.")

    now_str = datetime.utcnow().strftime("%b %d, %I:%M %p")
    note = RecruiterNoteModel(
        candidate_id=candidate_id,
        author=payload.author or "Recruiter",
        author_role=payload.author_role or "Technical Recruiter",
        date=f"Today, {datetime.utcnow().strftime('%I:%M %p')}",
        text=clean_text
    )
    db.add(note)
    candidate.updated_at = datetime.utcnow().isoformat() + "Z"
    db.commit()
    db.refresh(candidate)
    return format_candidate_response(candidate)
