
````markdown
# Task 2 — Two Code Problems

## 2a. Ranking at Scale

### Approach

I used an **inverted index** for skill-based candidate ranking.

The index maps each skill to the candidate IDs that have that skill.

For example:

```text
Python → Candidate 1, Candidate 4, Candidate 10
AWS    → Candidate 2, Candidate 4
Docker → Candidate 1, Candidate 4
````

When a recruiter searches for required skills such as Python, AWS, and Docker, the system retrieves the candidate IDs associated with each skill and counts the number of required skills matched by each candidate.

Candidates are then ranked by their skill overlap, with years of experience used as a secondary ranking factor.

### Overlap Score

```text
Overlap Score =
Number of Matching Required Skills
-----------------------------------
Total Number of Required Skills
```

For example, if a candidate matches 3 out of 4 required skills:

```text
Overlap Score = 3 / 4 = 0.75
```

### Implementation

```python
from collections import defaultdict


def rank_candidates(candidates, required_skills):
    if not candidates or not required_skills:
        return []

    # Build inverted index:
    # skill -> set of candidate IDs
    skill_index = defaultdict(set)

    for candidate in candidates:
        candidate_id = candidate["id"]

        for skill in candidate.get("skills", []):
            normalized_skill = skill.strip().lower()
            skill_index[normalized_skill].add(candidate_id)

    # Normalize required skills
    required = {
        skill.strip().lower()
        for skill in required_skills
        if skill.strip()
    }

    if not required:
        return []

    # Count matching skills for each candidate
    match_counts = defaultdict(int)

    for skill in required:
        for candidate_id in skill_index.get(skill, set()):
            match_counts[candidate_id] += 1

    # Map candidate IDs to candidate records
    candidate_map = {
        candidate["id"]: candidate
        for candidate in candidates
    }

    ranked = []

    # Calculate overlap score
    for candidate_id, match_count in match_counts.items():
        candidate = candidate_map[candidate_id]

        overlap_score = match_count / len(required)

        ranked.append({
            "candidate": candidate,
            "match_count": match_count,
            "overlap_score": overlap_score
        })

    # Highest overlap first,
    # then highest experience
    ranked.sort(
        key=lambda item: (
            -item["overlap_score"],
            -item["candidate"].get("years_experience", 0)
        )
    )

    return ranked
```

### Complexity

Let:

* `T` = total number of candidate-skill relationships
* `M` = number of required skills
* `R` = number of candidates matching at least one required skill

Index construction:

```text
O(T)
```

Query and ranking:

```text
O(M + Σ posting-list sizes + R log R)
```

Space complexity:

```text
O(T)
```

### Why I Chose This Approach

A simpler approach would scan all 100,000 candidates for every search and compare their skills with the required skills. This becomes expensive as the candidate pool grows because candidates with no relevant skills are also scanned. The inverted index allows the system to directly retrieve candidates associated with the requested skills instead of scanning the complete candidate pool. The trade-off is additional memory usage and the need to update the index when candidate skills change.

---

# 2b. Review the AI's Work

## Original AI-Generated Code

```javascript
function matchCandidates(candidates, requiredSkills) {
  let matches = [];

  for (i = 0; i <= candidates.length; i++) {
    const c = candidates[i];

    const score = c.skills.filter(
      s => requiredSkills.includes(s)
    );

    if (score.length > 0) {
      matches.push({
        name: c.name,
        score: score
      });
    }
  }

  return matches.sort(
    (a, b) => a.score - b.score
  );
}
```

## Problems Identified

### 1. Off-by-One Error

The loop uses:

```javascript
i <= candidates.length
```

The valid array indexes range from `0` to `candidates.length - 1`.

When `i` becomes equal to `candidates.length`, `candidates[i]` is `undefined`, and accessing `c.skills` causes a runtime error.

The fix is:

```javascript
for (let i = 0; i < candidates.length; i++)
```

---

### 2. Undeclared Loop Variable

The original code uses:

```javascript
for (i = 0; ...)
```

without declaring `i`.

This can create an unintended global variable and can also cause a `ReferenceError` in strict mode.

The fix is:

```javascript
for (let i = 0; ...)
```

---

### 3. Incorrect Sort Comparator

The original code uses:

```javascript
(a, b) => a.score - b.score
```

However, `score` is an array containing the matching skill names, not a number.

The comparator should compare the number of matching skills:

```javascript
(a, b) => b.score.length - a.score.length
```

This places candidates with more matching skills first.

---

### 4. Design / Performance Smell

The code repeatedly uses:

```javascript
requiredSkills.includes(s)
```

inside the nested candidate and skill loops.

`includes()` performs a linear search through the required skills. Converting the required skills to a `Set` provides approximately constant-time average membership checks.

For example:

```javascript
const required = new Set(requiredSkills);
```

Then:

```javascript
required.has(skill)
```

can be used for membership checks.

---

## Corrected Implementation

```javascript
function matchCandidates(candidates, requiredSkills) {
  const required = new Set(requiredSkills);
  const matches = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    const score = c.skills.filter(skill =>
      required.has(skill)
    );

    if (score.length > 0) {
      matches.push({
        name: c.name,
        score: score
      });
    }
  }

  return matches.sort(
    (a, b) => b.score.length - a.score.length
  );
}
```

## Developer Review

The AI-generated code looks reasonable at first glance, but it contains an off-by-one error and an undeclared loop variable. The sorting logic is also incorrect because it subtracts arrays instead of comparing the number of matching skills. In addition, repeated `includes()` calls create unnecessary linear membership checks. A developer who accepted the AI output without reviewing and testing it could therefore ship code that crashes on valid input and produces incorrect candidate rankings.

---

## Final Summary

For Task 2A, the inverted index provides an efficient way to retrieve and rank candidates based on skill overlap without scanning the entire candidate pool for every search.

For Task 2B, the AI-generated function was reviewed for correctness, runtime behavior, and performance. The identified issues were fixed and the corrected implementation produces the intended skill-overlap ranking.

```
```
