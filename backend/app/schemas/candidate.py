from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict

class TagCreate(BaseModel):
    name: str

class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str

class NoteCreate(BaseModel):
    text: str
    author: Optional[str] = "Recruiter"
    author_role: Optional[str] = "Technical Recruiter"

class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    author: str
    authorRole: Optional[str] = None
    date: str
    text: str

class WorkHistoryItem(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    period: str
    description: str

class AiAnalysisResult(BaseModel):
    fit_score: int = Field(..., ge=0, le=100)
    fit_summary: str
    strengths: List[str]
    gaps: List[str]
    recommendation: str

class ShortlistToggleRequest(BaseModel):
    shortlisted: Optional[bool] = None

class StatusUpdateRequest(BaseModel):
    status: str

class CandidateCreate(BaseModel):
    id: str
    name: str
    target_role: str
    years_experience: int
    source: str
    skills: List[str]
    notes: Optional[str] = ""
    applied_date: Optional[str] = None
    location: Optional[str] = "Remote"
    availability: Optional[str] = "Immediate"

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None
    years_experience: Optional[int] = None
    source: Optional[str] = None
    skills: Optional[List[str]] = None
    notes: Optional[str] = None
    review_status: Optional[str] = None
    shortlisted: Optional[bool] = None
    location: Optional[str] = None
    availability: Optional[str] = None

class CandidateResponse(BaseModel):
    id: str
    codeId: str
    name: str
    initials: str
    targetRole: str
    yearsExperience: int
    location: str
    availability: str
    source: str
    skills: List[str]
    notes: str
    appliedDate: Optional[str] = None
    reviewStatus: str
    shortlisted: bool
    aiFit: Optional[int] = None
    aiSummary: Optional[str] = None
    matchingSkills: List[str] = []
    missingSkills: List[str] = []
    aiAnalyzed: bool = False
    strengths: List[str] = []
    gaps: List[str] = []
    suggestedAction: Optional[str] = None
    workHistory: List[dict] = []
    tags: List[str] = []
    notesList: List[NoteResponse] = []
    createdAt: str
    updatedAt: str

    model_config = ConfigDict(from_attributes=True)

class CandidateListResponse(BaseModel):
    candidates: List[CandidateResponse]
    total: int
    page: int
    limit: int
    totalPages: int

class DashboardStats(BaseModel):
    totalCandidates: int
    needsReview: int
    inReview: int
    shortlisted: int
    rejected: int
    aiAnalyzed: int
    avgFitScore: float
    topTierCount: int
    channelConversion: List[dict] = []
