"""
Task 2B: Analysis and Fix of AI-Generated Candidate Skill Matcher
================================================================

Original AI-Generated Code:
---------------------------
function matchCandidates(candidates, requiredSkills) {
  let matches = [];
  for (i = 0; i <= candidates.length; i++) {
    const c = candidates[i];
    const score = c.skills.filter(s => requiredSkills.includes(s));
    if (score.length > 0) {
      matches.push({ name: c.name, score: score });
    }
  }
  return matches.sort((a, b) => a.score - b.score);
}

Identified Bugs & Code Smells:
------------------------------
1. Off-By-One Index Error:
   - Issue: `for (i = 0; i <= candidates.length; i++)`
   - Cause: The `<=` condition causes the loop to run at index `candidates.length`,
     accessing `candidates[candidates.length]`, which evaluates to `undefined`.
   - Consequence: On the final iteration, attempting `c.skills` throws:
     `TypeError: Cannot read properties of undefined (reading 'skills')` in runtime,
     crashing the application before returning any matches.

2. Undeclared Global Variable (Leaked Global):
   - Issue: `for (i = 0; ...)` is missing `let` or `const` on `i`.
   - Consequence: `i` leaks into global/window scope (or throws `ReferenceError: i is not defined`
     under ES module or JavaScript strict mode `'use strict'`).

3. Broken Sorting Comparator:
   - Issue: `matches.sort((a, b) => a.score - b.score)`
   - Cause: `score` is an array of matched skill strings (e.g. `['Python', 'FastAPI']`),
     not a number.
   - Consequence: Subtracting two arrays `['Python'] - ['AWS']` produces `NaN`.
     In JavaScript, sorting with a comparator returning `NaN` results in non-deterministic,
     unstable order (candidates are not properly ranked).
   - Fix: Compare the length of the matched skills arrays: `b.score.length - a.score.length`
     (descending for highest matches first) or numerical ratio.

4. Performance Smell (Repeated Linear Membership Checks):
   - Issue: `c.skills.filter(s => requiredSkills.includes(s))` performs an O(M) array scan
     for every skill of every candidate, leading to O(N * K * M) total complexity.
   - Fix: Pre-construct a `Set` from `requiredSkills`: `const required = new Set(requiredSkills)`.
     Then `required.has(skill)` runs in O(1) average time, reducing complexity to O(M + N * K).

Corrected JavaScript / TypeScript Implementation:
-------------------------------------------------
function matchCandidates(candidates, requiredSkills) {
  if (!candidates || !requiredSkills || requiredSkills.length === 0) {
    return [];
  }

  const required = new Set(requiredSkills);
  const matches = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (!c || !Array.isArray(c.skills)) continue;

    const score = c.skills.filter(skill => required.has(skill));

    if (score.length > 0) {
      matches.push({
        name: c.name,
        score: score
      });
    }
  }

  // Sort descending by match count (highest overlap first)
  return matches.sort((a, b) => b.score.length - a.score.length);
}
"""

from typing import List, Dict, Any, Set

def match_candidates_python(candidates: List[Dict[str, Any]], required_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Python equivalent of the fixed matchCandidates function,
    guaranteeing correct bounds, set lookup O(1), and descending sorting.
    """
    if not candidates or not required_skills:
        return []

    required: Set[str] = set(required_skills)
    matches: List[Dict[str, Any]] = []

    for c in candidates:
        candidate_skills = c.get("skills", [])
        matched = [s for s in candidate_skills if s in required]
        if matched:
            matches.append({
                "name": c.get("name", "Unknown"),
                "score": matched,
                "match_count": len(matched)
            })

    # Sort descending by match count
    matches.sort(key=lambda x: len(x["score"]), reverse=True)
    return matches
