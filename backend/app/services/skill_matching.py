"""
Task 2A: High-Efficiency Candidate Skill Overlap Matching via Inverted Index
===========================================================================

Problem Statement:
"How would you rank candidates by skill overlap efficiently over 100,000 candidates?"

Naive Linear Scan Approach:
Iterating over all N = 100,000 candidates, and checking M required skills against
each candidate's K skills costs O(N * M * K) or O(N * (M + K)) with hash sets.
For 100,000 candidates and frequent recruiter queries, scanning 100,000 records
on every keystroke or search introduces unacceptable CPU and memory latency.

Inverted Index Architecture (skill -> candidate_ids):
Instead of scanning every candidate profile, we pre-index candidates by skill:
  "Python"     -> { "candidate-1", "candidate-5", "candidate-9", ... }
  "FastAPI"    -> { "candidate-1", "candidate-4", "candidate-10", ... }
  "AWS"        -> { "candidate-1", "candidate-2", "candidate-5", ... }
  "Kubernetes" -> { "candidate-2", "candidate-8", "candidate-15", ... }

Query Execution Steps:
1. Normalize query required skills into a deduplicated set R (size M).
2. For each skill r in R, look up its posting list (candidate IDs) from the index.
   Candidates without any of the required skills are never touched.
3. Accumulate hit counts (matching required skills count) using a hash map:
   candidate_id -> matching_skills_count.
4. Compute overlap score:
   score = matching_required_skills / total_required_skills.
5. Rank top K candidates using a min-heap or partial sort.

Complexity Analysis:
--------------------
1. Preprocessing / Indexing Cost:
   - Time Complexity: O(N * K_avg), where N is candidate count (100,000) and
     K_avg is average skills per candidate (~6-10). Total operations ~600,000,
     completing in < 100ms in memory.
   - Space Complexity: O(N * K_avg) to store posting lists. For 100k candidates,
     this uses only ~15MB of RAM.

2. Query Time Complexity:
   - Postings Lookup: O(M), where M is number of required skills (typically 2-6).
   - Intersection / Accumulation: O(Sum of |posting_list(s)| for s in R).
     If only 8% of candidates have each skill, we inspect ~8,000 candidates instead
     of 100,000 (a >90% reduction in candidate evaluations).
   - Ranking: O(C log K) where C is candidate match count and K is requested top
     results (e.g. top 50), using `heapq.nlargest`.
   - Total Query Cost: < 2-5 milliseconds over 100,000 records.

3. Why Preferable to Scanning:
   - Sub-linear query time relative to total candidate pool.
   - Zero work performed on irrelevant candidates who possess none of the required skills.
   - Fully incremental: when a candidate updates their skills, only their specific
     postings list entries are updated in O(K).
"""

from typing import Dict, List, Set, Tuple, Optional
from collections import defaultdict
import heapq

class SkillInvertedIndex:
    """
    In-memory Inverted Index mapping normalized skills to candidate IDs,
    with fast scoring and ranking.
    """

    def __init__(self):
        # skill (normalized lowercase) -> set of candidate_ids
        self._index: Dict[str, Set[str]] = defaultdict(set)
        # candidate_id -> metadata dictionary (name, role, skills, etc.)
        self._candidate_store: Dict[str, dict] = {}

    def normalize_skill(self, skill: str) -> str:
        """Normalizes skill text for robust case-insensitive and whitespace-invariant matching."""
        return skill.strip().lower()

    def index_candidate(self, candidate_id: str, skills: List[str], metadata: Optional[dict] = None) -> None:
        """
        Indexes or re-indexes a single candidate in O(K) time.
        """
        if candidate_id in self._candidate_store:
            self.remove_candidate(candidate_id)

        clean_skills = [self.normalize_skill(s) for s in skills if s.strip()]
        for skill in clean_skills:
            self._index[skill].add(candidate_id)

        self._candidate_store[candidate_id] = {
            "id": candidate_id,
            "skills": skills,
            "normalized_skills": set(clean_skills),
            "metadata": metadata or {}
        }

    def remove_candidate(self, candidate_id: str) -> None:
        """Removes candidate from index postings."""
        if candidate_id not in self._candidate_store:
            return
        c_data = self._candidate_store[candidate_id]
        for skill in c_data["normalized_skills"]:
            self._index[skill].discard(candidate_id)
            if not self._index[skill]:
                del self._index[skill]
        del self._candidate_store[candidate_id]

    def build_index_from_candidates(self, candidates: List[dict]) -> None:
        """Populates the inverted index from a batch of candidate dictionaries."""
        self._index.clear()
        self._candidate_store.clear()
        for c in candidates:
            self.index_candidate(
                candidate_id=c["id"],
                skills=c.get("skills", []),
                metadata={
                    "name": c.get("name"),
                    "target_role": c.get("target_role"),
                    "years_experience": c.get("years_experience"),
                }
            )

    def rank_candidates_by_skill_overlap(
        self,
        required_skills: List[str],
        top_k: int = 50,
        min_overlap: float = 0.0
    ) -> List[dict]:
        """
        Queries the inverted index to rank candidates by skill overlap score.
        score = matching_required_skills / total_required_skills

        Returns ranked list of candidate matches with overlap percentage,
        matching skills, and missing skills.
        """
        if not required_skills:
            return []

        # Deduplicate & normalize query skills
        norm_required = {self.normalize_skill(s): s for s in required_skills if s.strip()}
        total_required = len(norm_required)
        if total_required == 0:
            return []

        # Step 1: Accumulate match counts across relevant postings lists
        # candidate_id -> list of matched normalized skills
        candidate_matches: Dict[str, List[str]] = defaultdict(list)

        for norm_skill, orig_skill in norm_required.items():
            candidate_ids = self._index.get(norm_skill, set())
            for cid in candidate_ids:
                candidate_matches[cid].append(orig_skill)

        # Step 2: Score candidates and select top K
        results = []
        for cid, matched_list in candidate_matches.items():
            matching_count = len(matched_list)
            overlap_score = matching_count / total_required

            if overlap_score < min_overlap:
                continue

            c_info = self._candidate_store[cid]
            meta = c_info["metadata"]

            # Calculate missing skills
            missing = [
                orig_skill
                for norm_s, orig_skill in norm_required.items()
                if norm_s not in c_info["normalized_skills"]
            ]

            match_entry = {
                "candidate_id": cid,
                "name": meta.get("name", cid),
                "target_role": meta.get("target_role", ""),
                "years_experience": meta.get("years_experience", 0),
                "overlap_score": round(overlap_score, 3),
                "overlap_percentage": round(overlap_score * 100, 1),
                "matching_skills": matched_list,
                "missing_skills": missing,
                "candidate_all_skills": c_info["skills"]
            }
            results.append(match_entry)

        # Step 3: Top-K ranking by overlap_score desc, then years_experience desc
        ranked = heapq.nlargest(
            top_k,
            results,
            key=lambda x: (x["overlap_score"], x["years_experience"])
        )

        return ranked

# Global singleton instance ready for service consumption
skill_index = SkillInvertedIndex()
