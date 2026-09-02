# implementation-plan.md — SIH26091

## Phase 0 — Setup
- Confirm exact official PS text against the live SIH portal.
- Pick the one demo district.

## Phase 1 — Data verification gate (BLOCKING — do not proceed to Phase 2 until this passes)
- Download the SHRUG extract for the candidate state/district. Confirm it actually has
  village-level (not just block/town-level) Economic Census establishment counts.
- Download the Census 2011 Village Directory file for the district. Confirm it parses
  cleanly and the village-ID format matches SHRUG's for a join.
- Confirm which planned categories (Dairy, Retail, Textiles) have distinguishable NIC-code
  counts at the available granularity — some may collapse into one "trade" bucket.
- If any check fails: switch districts now, before Phase 2 starts. Log the decision in
  decisions.md as a new entry.
- Write down which fields came back clean vs. patchy — this becomes the real
  Verified/Insufficient-Data map for schema.md `village_metrics`, not a guess.

## Phase 2 — Data collection
- Download the confirmed Census 2011 + SHRUG extracts for the chosen district.
- Transcribe and cross-check NSFDC/NBCFDC/socialjustice.gov.in scheme terms AND eligibility
  criteria (income ceilings, domicile rules per corporation) — one dedicated member,
  zero-tolerance accuracy, record `source_verified_date` per schema.md §1.2/1.3.

## Phase 3 — Data processing
- Clean, filter to the chosen district, join Census + SHRUG on the shared geo-ID into one
  flat `village_metrics` table (schema.md §1.1).
- Spot-check the join for at least 5 villages against the raw source files.

## Phase 4 — Database
- Load `village_metrics`, `scheme_terms`, `eligibility_rules` into Postgres or finalize
  flat-file loading, per decisions.md (flexible scope).

## Phase 5 — Backend: Eligibility module
- Build `POST /api/eligibility` (tech-spec.md §2.1) against `eligibility_rules`.
- Unit-test pass and fail paths for each corporation.

## Phase 6 — Backend: Financial module
- Build `POST /api/calculate` (tech-spec.md §2.2).
- Unit-test against the PS's own worked example plus 3+ additional hand-computed scenarios
  spanning both tiers and the tier boundary.
- Add the affordability-flag logic once Phase 8's revenue estimate is available.

## Phase 7 — Backend: Local-metrics module
- Build the deterministic lookup (tech-spec.md §2.3): market reach, competitor density,
  price point. Confirm "insufficient" is returned correctly for any null field.

## Phase 8 — AI/ML: Feasibility module
- Design and test the structured, source-tagged prompt (tech-spec.md §2.4) across multiple
  village/category combinations.
- Implement the post-processing tag-validation step (default untagged sentences to
  AI-Estimated, never Verified).

## Phase 9 — Frontend
- Build all five screens (app-flow.md) against the real API contract (schema.md).
- Source-tag chips and affordability flag rendered explicitly, per design.md.

## Phase 10 — Integration
- End-to-end wiring, bug fixing, confirm the eligibility-fail path correctly skips the
  Financial Card without breaking the Feasibility Card.

## Phase 11 — Testing
- Full matrix per tech-spec.md §6 edge cases, plus the bilingual pass and offline-fallback
  check.

## Phase 12 — Deployment
- Deploy frontend + backend, smoke-test.

## Phase 13 — Demo preparation
- Choose 2-3 demo personas, pre-run and cache results.
- Rehearse the live flow at least 3 times within the target time window.
- Prepare the PPT (see the merged master plan, Part XV, for the slide order).

## Dependency notes
Phase 1 blocks everything — it is a real go/no-go gate, not a formality. Phase 5/6/7 can run
in parallel once Phase 4 is done. Phase 8 should start as early as Phase 6/7 (highest-effort
single task). Phase 9 is blocked on the API contract (schema.md) being agreed, which should
happen Day 1, not after backend is "done."
