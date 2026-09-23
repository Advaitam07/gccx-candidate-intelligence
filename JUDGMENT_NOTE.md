# Judgment Note — GCCX Candidate Intelligence

## Scenario

Assume the product needs to support approximately 3,000 candidates per week, with one additional engineer and two weeks available for development.

## What I Would Build First

I would prioritize the core recruiter workflow rather than adding more advanced features.

First, I would make candidate ingestion, search, filtering, sorting, and persistence highly reliable. Recruiters should be able to quickly find relevant candidates, review their profiles, shortlist them, and add notes without losing state.

Second, I would keep the AI feature focused on decision support rather than automated decision-making. A concise AI-generated candidate summary or skill-fit explanation can reduce the time spent reading profiles while still keeping the recruiter responsible for the final decision.

Third, I would improve reliability around the existing workflow: API validation, error handling, logging, test coverage, and clear AI output/evidence. With only two weeks and one additional engineer, reliability and usability provide more practical value than adding many new features.

## What I Would Explicitly Not Build Yet

I would not build semantic/vector search, a complex recommendation engine, automated hiring decisions, advanced analytics, a large multi-role permission system, or integrations with multiple external ATS platforms.

I would also avoid building a highly distributed search infrastructure at this stage. The product should first prove that the core triage workflow is useful before introducing infrastructure complexity.

These features can be evaluated later based on actual recruiter usage and performance requirements.

## Main Risk

The biggest risk is over-reliance on AI-generated recommendations. An AI summary can be incomplete, incorrect, or influenced by patterns in the input data. Therefore, AI should remain a decision-support layer rather than the final decision-maker.

I would mitigate this by showing AI output transparently, keeping the original candidate information accessible, logging AI-generated results, and keeping a recruiter in the loop for every shortlist or hiring decision.

## Conclusion

With limited engineering capacity and a two-week window, I would optimize for a reliable candidate-triage workflow rather than feature breadth. The goal would be to make recruiters faster at finding and reviewing candidates while keeping important decisions transparent and human-controlled.
