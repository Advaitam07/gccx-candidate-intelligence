#!/usr/bin/env python3
"""
GCCX Candidate Intelligence Database Seeder
===========================================
Reads candidates.json and seeds the SQLite database safely without duplicates.
Safe to execute repeatedly (idempotent).
"""

import os
import sys
import json
from datetime import datetime

# Add project root to sys.path so imports work whether run from root or backend/
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.database import engine, SessionLocal, Base
from backend.app.models.candidate import CandidateModel, TagModel, RecruiterNoteModel, AiAnalysisModel

def get_candidates_json_path():
    possible_paths = [
        os.path.join(CURRENT_DIR, "data", "candidates.json"),
        os.path.join(PROJECT_ROOT, "backend", "data", "candidates.json"),
        os.path.join(PROJECT_ROOT, "data", "candidates.json"),
        "candidates.json",
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("Could not locate candidates.json in any expected path.")

def seed_database():
    json_path = get_candidates_json_path()
    print(f"[*] Reading dataset from: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        candidates_data = json.load(f)

    total_records = len(candidates_data)
    print(f"[*] Loaded {total_records} candidate records from JSON.")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    inserted_count = 0
    updated_count = 0

    try:
        for idx, item in enumerate(candidates_data):
            cid = item.get("id")
            if not cid:
                continue

            existing = db.query(CandidateModel).filter(CandidateModel.id == cid).first()

            skills = item.get("skills", [])
            target_role = item.get("target_role", "Software Engineer")
            years_exp = int(item.get("years_experience", 3))
            source = item.get("source", "LinkedIn")
            name = item.get("name", "Unknown Candidate")
            initials = "".join(part[0].upper() for part in name.split()[:2])
            code_id = f"#GCCX-{8000 + idx * 37 % 1999}"

            # Compute initial baseline evaluation
            baseline_fit = min(98, max(72, 75 + (years_exp * 3) % 22))
            is_shortlisted = idx in [1, 3, 6, 8, 10, 11, 13, 21, 26, 30]
            review_status = (
                "SHORTLISTED" if is_shortlisted
                else "IN_REVIEW" if idx % 3 == 0
                else "REJECTED" if idx in [15, 34]
                else "NEEDS_REVIEW"
            )

            work_history = [
                {
                    "id": f"wh-{cid}-1",
                    "title": f"{'Senior ' if years_exp >= 5 else ''}{target_role}",
                    "company": f"Enterprise Systems {idx + 1}",
                    "period": f"{2024 - min(years_exp, 3)} — Present",
                    "description": f"Engineered core backend services and microservice endpoints with {skills[0] if skills else 'Python'}."
                }
            ]

            if not existing:
                candidate = CandidateModel(
                    id=cid,
                    code_id=code_id,
                    name=name,
                    initials=initials,
                    target_role=target_role,
                    years_experience=years_exp,
                    location="Bengaluru, IN" if "Sharma" in name or "Iyer" in name
                    else "London, UK" if "Patel" in name
                    else "Dublin, IE" if "O'Connor" in name
                    else "Berlin, DE" if "Vance" in name
                    else "Paris, FR" if "Dupont" in name
                    else "Tokyo, JP" if "Sato" in name or "Tanaka" in name
                    else "Remote / Hybrid",
                    availability="Immediate" if idx % 2 == 0 else "Available in 30d",
                    source=source,
                    skills=skills,
                    notes=item.get("notes", ""),
                    applied_date=item.get("applied_date", datetime.utcnow().isoformat() + "Z"),
                    review_status=review_status,
                    shortlisted=is_shortlisted,
                    ai_fit=baseline_fit,
                    ai_summary=f"Strong engineering background in {target_role} with {years_exp} years proven experience.",
                    matching_skills=skills[:4],
                    missing_skills=["Advanced Distributed Caching"] if years_exp < 4 else ["Kubernetes Operator Development"],
                    ai_analyzed=idx % 2 == 0,
                    strengths=[
                        f"Demonstrated proficiency in {', '.join(skills[:3]) if skills else 'core stack'}.",
                        f"{years_exp} years of direct industry experience in {target_role}."
                    ],
                    gaps=[
                        "Verify specific cloud architecture and observability tooling depth during technical interview."
                    ],
                    suggested_action="Schedule initial technical screen" if review_status == "NEEDS_REVIEW" else "Advance to hiring manager interview",
                    work_history=work_history,
                )
                db.add(candidate)
                db.flush()

                # Add initial tags
                tag_names = set([target_role.split()[0], source, f"{years_exp}y Exp"] + skills[:2])
                for tname in tag_names:
                    db.add(TagModel(candidate_id=cid, name=tname))

                # Add initial note if available
                if item.get("notes"):
                    db.add(
                        RecruiterNoteModel(
                            candidate_id=cid,
                            author="System Ingest",
                            author_role="GCCX Sourcing Pipeline",
                            date="At Ingestion",
                            text=item.get("notes")
                        )
                    )

                inserted_count += 1
            else:
                updated_count += 1

        db.commit()
        print(f"[✓] Seeding completed: {inserted_count} inserted, {updated_count} existing verified.")
        print(f"[✓] Database currently has {db.query(CandidateModel).count()} total candidates.")

    except Exception as e:
        db.rollback()
        print(f"[!] Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
