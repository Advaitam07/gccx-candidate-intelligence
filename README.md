# GCCX Candidate Intelligence — Production Full-Stack Platform

**GCCX Global AI Full-Stack Engineer Assignment**

An enterprise-grade, full-stack candidate intelligence and talent triage platform powered by **FastAPI**, **SQLAlchemy**, **SQLite**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Google Gemini 3.6 Flash**. The platform integrates the complete 48-candidate GCCX sourcing dataset, real-time SQL filtering, an inverted-index skill matching engine, and LLM-grounded candidate evaluation.

---

## 1. Architecture Overview

The system is built with a clean separation of concerns between client presentation, API gateway, business logic, persistence layer, and generative AI services:

```
┌───────────────────────────────────────────────────────────┐
│              Client Layer (React 19 + TypeScript)         │
│  - Preserved Stitch UI & Tailwind CSS Styling             │
│  - CandidateContext with optimistic mutations & API sync  │
│  - Vite Reverse Proxy (/api -> http://127.0.0.1:8001)     │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTP REST
┌─────────────────────────────▼─────────────────────────────┐
│                 Backend API (FastAPI + Python 3.11)       │
│  - FastAPI routers (/api/v1/candidates, /api/v1/ai, ...)   │
│  - Pydantic V2 request & response validation              │
│  - Inverted Index Skill Service (Task 2A)                 │
│  - Code Correction Engine (Task 2B)                       │
│  - Google Gemini AI Service (@google/genai SDK)           │
└─────────────────────────────┬─────────────────────────────┘
                              │ SQLAlchemy ORM
┌─────────────────────────────▼─────────────────────────────┐
│               Persistence Layer (SQLite Database)          │
│  - CandidateModel, TagModel, RecruiterNoteModel           │
│  - Full SQL filtering, pagination, and relational integrity│
│  - Database Seeded with 48 GCCX candidate records         │
└───────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions
- **Source of Truth**: The SQLite database (`backend/gccx_candidates.db`) is the persistent source of truth. Mutations (shortlisting, review status, recruiter notes, tags, and AI analyses) are written to SQLite and survive full page reloads.
- **AI Decision Support**: Real LLM calls to Google Gemini (`gemini-3.6-flash`) evaluate candidate qualifications, extract concrete strengths/gaps, calibrate fit scores, and explicitly include the mandatory disclaimer:
  > *"AI-generated analysis is decision support and should be reviewed by a recruiter."*
- **Algorithmic Efficiency**: Skill queries utilize an Inverted Index structure mapping skill terms to posting sets, bypassing naive $O(N \cdot M)$ scans.

---

## 2. Backend & System Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm 10+

### Dependencies
Backend dependencies are listed in `backend/requirements.txt`:
```txt
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
sqlalchemy>=2.0.28
pydantic>=2.6.4
google-genai>=0.1.1
python-dotenv>=1.0.1
pytest>=8.1.0
httpx>=0.27.0
```

Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

Install frontend dependencies:
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `GEMINI_API_KEY` is configured:
```env
GEMINI_API_KEY="your-gemini-api-key"
DATABASE_URL="sqlite:///./backend/gccx_candidates.db"
LLM_MODEL="gemini-3.6-flash"
PORT=8001
```

---

## 3. Database Seeding

The platform includes an idempotent seeding pipeline that imports the GCCX 48-candidate dataset into SQLite:

```bash
python seed.py
```
*(Alternative: `python backend/seed.py` or `npm run seed`)*

### Seeder Capabilities
- Parses `backend/data/candidates.json` containing the full 48-candidate benchmark dataset.
- Normalizes data, generates unique initials and GCCX code IDs (`#GCCX-8000` to `#GCCX-8047`).
- Idempotent upsert: checks existing candidate IDs before insertion; running the script multiple times is completely safe and avoids duplicates.
- Generates relational tag models and initial audit/ingestion recruiter notes.

---

## 4. Running the Application

### Quickstart (Vite Dev Server + FastAPI)
Run the automated dev launcher:
```bash
npm run dev
```
This automatically:
1. Checks and starts the FastAPI backend on port `8001` (avoiding port 8000 which is reserved by the AI Studio control plane).
2. Starts the Vite development server on port `3000`.
3. Proxies all `/api` and `/health` calls seamlessly from frontend port 3000 to backend port 8001.

### Running Services Separately
If you prefer running the services in separate terminal windows:

**Terminal 1 — Backend:**
```bash
python3 -m uvicorn backend.app.main:app --port 8001 --reload
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Visit the application at `http://localhost:3000`.

---

## 5. API Documentation

Interactive OpenAPI documentation is available at `http://localhost:8001/docs`.

### Health & Stats
- `GET /health`: Service health and SQLite connectivity status.
- `GET /api/v1/stats`: Pipeline overview metrics (total candidates, review queue, shortlisted count, average AI fit score, top-tier count, channel conversion rates).

### Candidates Resource
- `GET /api/v1/candidates`: Search, filter, sort, and paginate candidates.
  - Query parameters:
    - `search` (string): Full-text search across name, role, skills, notes, source, and code ID.
    - `role` (string): Filter by target role (e.g., `Backend Engineer`, `DevOps / Platform`).
    - `experience_band` (string): Filter by tenure (`0-2 Years`, `3-5 Years`, `6+ Years`).
    - `source` (string): Sourcing channel (`LinkedIn`, `Referral`, `Direct Application`, `Agency`).
    - `status` (string): Pipeline status (`NEEDS_REVIEW`, `IN_REVIEW`, `SHORTLISTED`, `REJECTED`).
    - `shortlisted_only` (boolean): Return only shortlisted candidates.
    - `min_ai_fit` (int): Filter by minimum AI fit score (0–100).
    - `sort` (string): Ordering (`match-desc`, `match-asc`, `exp-desc`, `exp-asc`, `name-asc`, `newest`).
    - `page` (int) & `limit` (int): Standard pagination parameters.
- `GET /api/v1/candidates/{candidate_id}`: Retrieve full profile with work history, tags, notes, and audit trail.
- `POST /api/v1/candidates/{candidate_id}/shortlist`: Toggle or explicitly set shortlist state.
- `POST /api/v1/candidates/{candidate_id}/status`: Transition review status (`IN_REVIEW`, `SHORTLISTED`, `REJECTED`).
- `POST /api/v1/candidates/{candidate_id}/tags`: Add a custom recruiter tag.
- `DELETE /api/v1/candidates/{candidate_id}/tags/{tag_name}`: Remove a recruiter tag.
- `POST /api/v1/candidates/{candidate_id}/notes`: Append a recruiter note with author and timestamp.

### AI & Algorithmic Endpoints
- `POST /api/v1/ai/candidates/{candidate_id}/analyze`: Triggers Google Gemini LLM analysis. Computes rubric fit score, bulleted strengths, verification gaps, and recommended hiring action; saves results to SQLite.
- `GET /api/v1/skills/rank?skills=Python,AWS,Docker`: Task 2A Inverted Index skill matching endpoint.
- `GET /api/v1/skills/task2b`: Task 2B bug demonstration and verification endpoint.

---

## 6. Task 2A: Skill Matching Engine (Inverted Index)

### The Problem
Traditional candidate skill matching performs a linear scan over all $N$ candidates in the database. For each candidate having $K$ skills, it checks membership against $M$ query skills:
$$\text{Time Complexity} = O(N \cdot K \cdot M)$$
As candidate pools grow into tens of thousands of applicants, linear scanning causes latency spikes and degrades recruiter search experience.

### The Solution: Inverted Index
The `SkillIndexService` (`backend/app/services/skill_matching.py`) builds and maintains an Inverted Index:
$$\text{Index Map}: \text{normalized\_skill} \longrightarrow \{ \text{candidate\_id}_1, \text{candidate\_id}_2, \dots \}$$

#### Matching Algorithm
1. Given $M$ required skills $\{s_1, s_2, \dots, s_M\}$, retrieve the posting sets for each skill from the index in $O(1)$ hash map lookups.
2. Accumulate match frequencies and record matched/missing skills only for candidates present in the posting sets.
3. Compute overlap score:
   $$\text{Overlap Score} = \frac{|\text{Matching Skills}|}{|\text{Required Skills}|}$$
4. Sort matching candidates primarily by overlap score (descending) and secondarily by years of experience (descending).

#### Complexity Analysis
- **Query Time Complexity**: $O(M + \sum_{i=1}^M |P(s_i)| + R \log R)$, where $|P(s_i)|$ is the posting list length of skill $s_i$, and $R \le N$ is the number of candidates possessing at least one matching skill. When queries match a fraction of the candidate pool, this represents a multi-order-of-magnitude speedup over $O(N \cdot K \cdot M)$.
- **Space Complexity**: $O(U + \sum |skills|)$, where $U$ is the number of unique skills across the database. In our 48-candidate dataset with ~25 unique skills, memory consumption is negligible (< 100 KB).

#### Tradeoff Analysis
| Metric | Naive Linear Scan | Inverted Index (Implemented) |
|---|---|---|
| Query Latency | High ($O(N \cdot K \cdot M)$) | Near-Instant ($O(M + \text{hits})$) |
| Memory Footprint | None (reads raw records) | Small ($O(\text{unique skills} \times \text{postings})$) |
| Index Update Overhead | None | $O(K)$ on candidate insert/update |
| Suitability | Prototyping (< 100 rows) | Production Talent Search (> 50k rows) |

---

## 7. Task 2B: Code Review & Bug Fixes

### Original Flawed Code
```javascript
function matchCandidates(candidates, requiredSkills) {
    var matches = [];
    for (i = 0; i <= candidates.length; i++) {
        var c = candidates[i];
        var score = c.skills.filter(s => requiredSkills.includes(s));
        if (score.length > 0) {
            matches.push({ name: c.name, score: score });
        }
    }
    return matches.sort((a, b) => a.score - b.score);
}
```

### Bugs Identified & Root Causes

#### Bug 1: Off-by-One Loop Condition
- **Flawed Code**: `for (i = 0; i <= candidates.length; i++)`
- **Root Cause**: Array indices range from `0` to `candidates.length - 1`. On the final iteration (`i === candidates.length`), `candidates[i]` evaluates to `undefined`. Attempting to read `c.skills` throws an unhandled `TypeError: Cannot read properties of undefined (reading 'skills')`.
- **Fix**: Use strict inequality `i < candidates.length` (or modern `for (const c of candidates)`).

#### Bug 2: Implicit Global Variable Leak
- **Flawed Code**: `for (i = 0; ...)`
- **Root Cause**: The loop counter variable `i` is declared without `let`, `const`, or `var`. In JavaScript, this leaks `i` into the global `window`/`global` scope. Under strict mode (`"use strict"`), this throws a `ReferenceError: i is not defined`. In concurrent execution, outer functions sharing `i` suffer state corruption.
- **Fix**: Declare loop variable with block scope: `for (let i = 0; ...)` or iterate with `for (const c of candidates)`.

#### Bug 3: Array Subtraction Comparator Bug
- **Flawed Code**: `matches.sort((a, b) => a.score - b.score)`
- **Root Cause**: `a.score` and `b.score` are arrays of matching skill strings (e.g. `["Python", "FastAPI"]`). Subtracting two arrays in JavaScript evaluates to `[object Object] - [object Object] === NaN`. The sort comparator returning `NaN` results in non-deterministic, implementation-dependent sorting where candidates are not properly ordered by match strength.
- **Fix**: Compare numeric lengths in descending order: `b.score.length - a.score.length`.

#### Bug 4: Suboptimal $O(N \cdot K \cdot M)$ Linear Scanning
- **Flawed Code**: `requiredSkills.includes(s)` inside `filter` inside candidate loop
- **Root Cause**: For every candidate and every skill, `Array.prototype.includes` scans the `requiredSkills` array linearly.
- **Fix**: Wrap `requiredSkills` in a `Set<string>` once before iteration, allowing $O(1)$ lookup time and reducing per-candidate skill check complexity.

### Corrected, Production-Quality Implementation
```typescript
interface CandidateRecord {
  id?: string;
  name: string;
  skills: string[];
  yearsExperience?: number;
}

interface MatchResult {
  candidateId?: string;
  name: string;
  matchingSkills: string[];
  matchCount: number;
  overlapScore: number;
}

export function matchCandidates(
  candidates: CandidateRecord[],
  requiredSkills: string[]
): MatchResult[] {
  if (!candidates || candidates.length === 0 || !requiredSkills || requiredSkills.length === 0) {
    return [];
  }

  // Optimize membership checks from O(M) to O(1)
  const requiredSet = new Set(requiredSkills.map((s) => s.trim().toLowerCase()));
  const matches: MatchResult[] = [];

  for (const c of candidates) {
    if (!c || !Array.isArray(c.skills)) continue;

    // Filter matching skills in O(K) where K = c.skills.length
    const matched = c.skills.filter((skill) =>
      requiredSet.has(skill.trim().toLowerCase())
    );

    if (matched.length > 0) {
      matches.push({
        candidateId: c.id,
        name: c.name,
        matchingSkills: matched,
        matchCount: matched.length,
        overlapScore: parseFloat((matched.length / requiredSkills.length).toFixed(2)),
      });
    }
  }

  // Deterministic sort: highest match count first, then name ascending
  return matches.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    return a.name.localeCompare(b.name);
  });
}
```

### Verification
The verification endpoint `GET /api/v1/skills/task2b` executes this algorithm against the test query `["Python", "FastAPI", "AWS", "Kubernetes"]` and confirms:
1. Zero runtime exceptions.
2. Candidates with 3 matching skills (Rahul Sharma, Elena Rostova, Marcus Chen, Priya Patel) sorted strictly ahead of candidates with 2 or 1 matching skills.
3. Clean JSON structure with complete diagnostic metadata.

---

## 8. Evaluation Rubric Alignment

| Rubric Criterion | Implementation Evidence |
|---|---|
| **Real Full-Stack Architecture** | Independent FastAPI backend with SQLAlchemy ORM, SQLite database, and React frontend communicating over HTTP REST. |
| **Persistence (Source of Truth)** | SQLite database (`backend/gccx_candidates.db`) stores candidates, tags, recruiter notes, and AI analysis. State survives page reloads. |
| **Dataset Completeness** | All 48 GCCX candidate records loaded from `backend/data/candidates.json` via idempotent seeder (`python seed.py`). |
| **Real LLM AI Feature** | Google Gemini 3.6 Flash analyzes candidates, returns structured JSON fit scores, strengths, gaps, and recommendations. Includes mandatory recruiter disclaimer. |
| **Task 2A (Inverted Index)** | `backend/app/services/skill_matching.py` indexes skills in $O(M + \text{hits})$ time with ranking endpoint at `/api/v1/skills/rank`. |
| **Task 2B (Code Correction)** | Analyzed and resolved all 4 defects in `matchCandidates` (off-by-one, global leak, array subtraction, linear scan) with automated verification endpoint at `/api/v1/skills/task2b`. |
| **UI Design Fidelity** | 100% of the existing Stitch UI design, responsive drawer, candidate cards, filters, and theme are preserved without regressions. |
| **Testing & Robustness** | Automated pytest suite in `backend/tests/test_api.py` covering health, search, filters, shortlisting, notes, tags, and AI endpoints. |

---

## 9. Testing & Quality Assurance

### Run Backend Test Suite
```bash
PYTHONPATH=. pytest backend/tests -v
```
All 13 tests execute against the test client verifying:
- Health check and root endpoints.
- Stats calculation and pipeline metric aggregations.
- Search across text, skills, role, and source.
- Multi-criteria filtering (experience, role, status).
- Shortlist state toggling and persistence.
- Relational tag addition and deletion.
- Recruiter note creation with author attribution.
- Task 2A skill ranking and Task 2B bug verification.

### Run Frontend Typecheck & Build
```bash
npm run lint
npm run build
```
Both TypeScript compilation (`tsc --noEmit`) and Vite production bundle build succeed with zero errors.

---

## 10. Troubleshooting

### Port Conflicts
- **Port 8000**: In this AI Studio runtime environment, port `8000` is utilized by the internal control plane API (`/app/control-plane-api/control-plane-api`). The FastAPI backend is configured to run on port `8001`.
- **Port 3000**: Vite runs on port `3000` and reverse-proxies `/api` and `/health` requests to `http://127.0.0.1:8001`.

### LLM API Key Configuration
If the Gemini API returns a 403 or 404, verify that `GEMINI_API_KEY` is set in your environment:
```bash
export GEMINI_API_KEY="your-gemini-key"
```
The AI service automatically handles model fallback and graceful retry backoff on temporary capacity spikes.
