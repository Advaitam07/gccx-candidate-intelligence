from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, index=True)
    code_id = Column(String, index=True, nullable=True)
    name = Column(String, index=True, nullable=False)
    initials = Column(String, nullable=True)
    target_role = Column(String, index=True, nullable=False)
    years_experience = Column(Integer, index=True, nullable=False)
    location = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    source = Column(String, index=True, nullable=False)
    skills = Column(JSON, nullable=False, default=list)
    notes = Column(Text, nullable=True, default="")
    applied_date = Column(String, nullable=True)
    review_status = Column(String, index=True, default="NEEDS_REVIEW", nullable=False)
    shortlisted = Column(Boolean, index=True, default=False, nullable=False)
    ai_fit = Column(Integer, index=True, nullable=True)
    ai_summary = Column(Text, nullable=True)
    matching_skills = Column(JSON, nullable=True, default=list)
    missing_skills = Column(JSON, nullable=True, default=list)
    ai_analyzed = Column(Boolean, index=True, default=False, nullable=False)
    strengths = Column(JSON, nullable=True, default=list)
    gaps = Column(JSON, nullable=True, default=list)
    suggested_action = Column(Text, nullable=True)
    work_history = Column(JSON, nullable=True, default=list)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")

    tags = relationship("TagModel", back_populates="candidate", cascade="all, delete-orphan")
    recruiter_notes = relationship(
        "RecruiterNoteModel",
        back_populates="candidate",
        cascade="all, delete-orphan",
        order_by="desc(RecruiterNoteModel.id)",
    )
    ai_analyses = relationship(
        "AiAnalysisModel",
        back_populates="candidate",
        cascade="all, delete-orphan",
        order_by="desc(AiAnalysisModel.id)",
    )

class TagModel(Base):
    __tablename__ = "candidate_tags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(String, ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String, index=True, nullable=False)

    candidate = relationship("CandidateModel", back_populates="tags")

class RecruiterNoteModel(Base):
    __tablename__ = "recruiter_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(String, ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False)
    author = Column(String, nullable=False, default="Recruiter")
    author_role = Column(String, nullable=True, default="Technical Recruiter")
    date = Column(String, nullable=True)
    text = Column(Text, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")

    candidate = relationship("CandidateModel", back_populates="recruiter_notes")

class AiAnalysisModel(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(String, ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False)
    fit_score = Column(Integer, nullable=False)
    fit_summary = Column(Text, nullable=False)
    strengths = Column(JSON, nullable=False, default=list)
    gaps = Column(JSON, nullable=False, default=list)
    recommendation = Column(Text, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")

    candidate = relationship("CandidateModel", back_populates="ai_analyses")
