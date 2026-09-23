# GCCX Candidate Intelligence

A full-stack candidate triage platform built for the GCCX Global AI Full-Stack Engineer assignment.

The goal is to help recruiters quickly search, filter, evaluate, shortlist, and organize candidates while using AI as decision support rather than as a replacement for recruiter judgment.

## Live Demo

Frontend:
https://advaitam07.github.io/gccx-candidate-intelligence/

Backend:
https://gccx-candidate-intelligence.onrender.com

API Health:
https://gccx-candidate-intelligence.onrender.com/health

API Documentation:
https://gccx-candidate-intelligence.onrender.com/docs

---

## What I Built

The application provides:

- Candidate directory with search, filtering, sorting, and pagination
- Candidate profile/dossier view
- Recruiter shortlist management
- Review status management
- Recruiter tags
- Recruiter notes
- Dashboard statistics
- AI-powered candidate analysis using Google Gemini
- Skill-based candidate ranking
- Efficient inverted-index skill matching
- Task 2B bug analysis and corrected implementation
- Persistent SQLite database
- REST API using FastAPI
- Responsive React frontend

The supplied GCCX dataset contains 48 candidate records, which are loaded into the application database.

---

## Architecture

```text
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │ React + TypeScript      │
                    │ Tailwind CSS + Vite     │
                    └────────────┬────────────┘
                                 │ HTTPS / REST
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend    │
                    │ Python + Pydantic       │
                    │ SQLAlchemy              │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
           ┌────────────┐ ┌────────────┐ ┌─────────────┐
           │   SQLite   │ │ Skill Index│ │ Gemini API  │
           │ Candidates │ │  Task 2A   │ │ AI Analysis │
           └────────────┘ └────────────┘ └─────────────┘
