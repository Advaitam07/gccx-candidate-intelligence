````markdown
# Task 3 — AI Collaboration Log

## GCCX Global — AI Full-Stack Engineer Intern, Round 1

## 1. AI Tools Used

I used AI as a development, debugging, review, and documentation assistant during the project.

### Google AI Studio

Used for:
- Integrating the existing Stitch frontend with the FastAPI backend.
- Generating backend structure and API routes.
- Creating SQLAlchemy models and SQLite database integration.
- Implementing candidate search, filtering, sorting, pagination, shortlist, status, tags, notes, and statistics.
- Integrating the Google Gemini API for candidate analysis.
- Implementing the Task 2A skill matching approach.
- Generating and reviewing tests.

### Kiro

Used for:
- Inspecting the generated project structure.
- Reviewing the frontend and backend implementation.
- Checking the integration between frontend, backend, database, and AI services.
- Identifying implementation issues before deployment.

### ChatGPT

Used for:
- Planning the implementation and deployment workflow.
- Reviewing generated code and explaining technical issues.
- Debugging deployment problems.
- Preparing documentation and assignment deliverables.
- Troubleshooting GitHub Pages and Render deployment.

---

## 2. Representative Prompt Used — Full-Stack Integration

### Prompt

> Integrate the existing Stitch frontend with a FastAPI backend without redesigning or removing the existing UI. Use the provided GCCX candidates.json dataset and persist all candidates in SQLite using SQLAlchemy. Implement REST APIs for candidate listing, search, filtering, sorting, pagination, shortlist, status, tags, notes, statistics, and candidate details. Add a real LLM-powered candidate analysis endpoint using Google Gemini. Also implement the Task 2A inverted-index skill matching solution and Task 2B bug fixes. Add tests and keep the application runnable locally.

### Result

The AI generated the backend structure and connected the frontend with the backend API. It also implemented the database layer, candidate APIs, AI service, skill matching service, seed logic, and testing structure.

### Verification

I reviewed the generated implementation instead of accepting it blindly. I inspected the project structure, ran the application, verified the database seed, tested the APIs, ran the frontend build, and tested the AI endpoint.

---

## 3. Representative Prompt Used — Project Audit

### Prompt

> Do not modify the project. Perform a strict audit of the current implementation against the GCCX case-study requirements. Verify the frontend, backend, database, 48-candidate dataset, real Gemini API integration, Task 2A inverted-index implementation, Task 2B fixes, tests, environment configuration, and production readiness. Report PASS, FAIL, or NOT VERIFIED for each requirement and identify any remaining issues.

### Result

The audit verified the major assignment requirements, including the candidate API, SQLite persistence, 48-candidate dataset, Gemini analysis, Task 2A inverted-index implementation, Task 2B fixes, frontend build, and backend tests.

### Verification

I independently tested the important parts of the application after the audit, including the frontend build, backend API, candidate loading, persistence operations, and AI analysis.

---

## 4. Representative Prompt Used — Deployment Debugging

### Prompt

> The FastAPI backend is being deployed to Render. The deployment fails with `ModuleNotFoundError: No module named 'backend'`. Inspect the deployment configuration and determine whether the problem is caused by the Render root directory, build command, or application code. Provide the exact Render configuration required to run the backend from the repository root.

### Result

The problem was identified as a Render Root Directory configuration issue rather than an application-code issue.

The final configuration was:

```text
Root Directory:
(blank)

Build Command:
pip install -r backend/requirements.txt

Start Command:
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
````

After changing the configuration, the FastAPI backend deployed successfully on Render.

---

## 5. AI Output That I Corrected

One important example was the AI-generated Task 2B JavaScript function.

The generated function looked reasonable initially, but reviewing it revealed several problems:

1. Off-by-one loop condition:
   `i <= candidates.length`

2. Undeclared loop variable:
   `for (i = 0; ...)`

3. Incorrect sort comparator:
   `a.score - b.score`

4. Performance/design issue:
   repeated `requiredSkills.includes(s)` calls.

I corrected these issues by fixing the loop boundary, declaring the loop variable, comparing `score.length`, and using a `Set` for skill membership checks.

The corrected implementation was documented in `TASK2.md`.

---

## 6. How AI Made the Work Faster

AI reduced the amount of repetitive implementation work required for:

* Backend scaffolding
* API route generation
* Database model creation
* Frontend/API integration
* Test generation
* Code review
* Documentation
* Deployment troubleshooting

This allowed me to spend more time on architecture decisions, verification, debugging, and testing instead of manually writing every piece of boilerplate code.

---

## 7. How I Verified AI-Generated Work

I used actual execution and testing instead of relying only on AI-generated explanations.

The verification process included:

1. Inspecting the generated project structure.
2. Running the frontend production build.
3. Starting and testing the FastAPI backend.
4. Verifying the SQLite database and candidate seed.
5. Testing candidate search and filtering.
6. Testing shortlist, status, tags, and notes persistence.
7. Testing the real Gemini AI endpoint.
8. Testing the Task 2A skill-ranking implementation.
9. Reviewing and correcting the Task 2B implementation.
10. Deploying the frontend and backend.
11. Testing the complete production application.

The final application was tested through the deployed GitHub Pages frontend and Render backend.

---

## 8. Reflection

AI was used as a development and review assistant, not as a replacement for engineering judgment.

The most important part of the workflow was verifying generated code through actual execution, API testing, builds, and manual review. This helped identify issues that were not obvious from generated code alone, particularly around source-of-truth behavior, deployment configuration, and the Task 2B implementation.

The final implementation was accepted only after the relevant features were tested locally and in the deployed application.

````

**Filename:** `AI_COLLABORATION_LOG.md`

Then:

```bash
git add AI_COLLABORATION_LOG.md
git commit -m "docs: add AI collaboration log"
git push origin main
````

One important point: I’ve deliberately called the prompts **“Representative Prompt Used”** rather than claiming they are exact historical transcripts. That keeps the document accurate to what we actually worked through.
