# rules.md — SIH26091, agent operating rules

Read this file first in every session. These rules exist to keep a multi-file, multi-person,
AI-assisted build internally consistent. When in doubt, re-read this file before making a
judgment call.

## R1 — Single source of truth per concern
- Data contracts (DB tables, API shapes): schema.md is authoritative. tech-spec.md may
  describe them narratively but must never introduce a field/endpoint that isn't in
  schema.md.
- User journey: app-flow.md is authoritative (it also covers what would otherwise be a
  separate "flow.md" — do not create a second flow file).
- Product intent/scope: PRD.md + decisions.md are authoritative. If a build task seems to
  contradict either, stop and flag it rather than silently reinterpreting scope.
- Do not duplicate content across files "for convenience" — link/reference instead. Drift
  between two copies of the same fact is a bug.

## R2 — The no-invention rule (non-negotiable)
The LLM is never the source of a number. It only narrates numbers it was given.
- Any local-data field that's null/missing must surface as "Insufficient Data" in the UI,
  enforced in code (a null check before the prompt is even sent) — never left to the LLM's
  discretion, never silently defaulted to a plausible-sounding figure.
- Financial/eligibility figures (money, rates, tenure, income ceilings) are hardcoded from
  cited sources, computed by pure deterministic functions — never generated or paraphrased
  by an LLM.
- Post-processing must validate that every feasibility sentence carries one of the four tags;
  an untagged sentence defaults to AI-Estimated, never Verified.

## R3 — Naming conventions
- Files: kebab-case for docs (`tech-spec.md`), snake_case for DB fields (`village_id`),
  camelCase for JS/TS variables, PascalCase for React components.
- API routes: `/api/<resource>`, plural nouns for collections (`/api/villages`), verbs only
  where no clean noun exists (`/api/calculate` is an accepted exception — a "calculation" is
  awkward as a resource name).
- Branch naming: `feature/<phase-number>-<short-desc>` (e.g. `feature/05-eligibility-gate`),
  matching implementation-plan.md phase numbers so history stays traceable to the plan.

## R4 — API design consistency
- Every POST endpoint accepts and returns JSON matching schema.md exactly — no ad-hoc fields
  added without updating schema.md first.
- Error responses use a consistent shape: `{ "error": true, "message": "...", "code": "..." }`.
- No endpoint should require authentication for this build (PRD.md §7) — do not add a login
  flow "just in case."

## R5 — Testing discipline
- The Financial module (tech-spec.md §2.2) is not "done" until its unit tests pass against
  the PS's own worked example plus 3+ additional hand-computed cases. This is a hard
  acceptance criterion, not a nice-to-have.
- Any change to `scheme_terms` or `eligibility_rules` values requires re-running the
  financial/eligibility unit tests before merge.

## R6 — Scope discipline
- Do not build anything listed as Non-goal in PRD.md §4 or Future Scope in the merged master
  plan (business-idea recommendation, voice, national coverage, SCA integration, user
  accounts) without a new decisions.md entry explicitly reversing that call.
- If a feature idea comes up mid-build that isn't in PRD.md, log it in decisions.md's "not
  yet decided" section rather than building it speculatively.

## R7 — Privacy & data handling
- No real personal financial data in code, tests, fixtures, or demo data — synthetic
  personas only (e.g. "Rekha" from app-flow.md).
- Session data (schema.md `sessions`) is not linked to any user identity and is not
  persisted beyond what's needed for the export step.
- Any TODO comment referencing "production" security/consent/DPDP-Act requirements should
  stay a comment, not a half-built feature — see design.md's production-vs-hackathon note.

## R8 — Commit/PR hygiene
- One phase (implementation-plan.md) roughly maps to one PR where practical.
- PR description should reference the phase number and, if relevant, the schema.md section
  it touches.
- Update tracker.md's phase checklist in the same PR that completes a phase — don't let the
  tracker drift from actual state.

## R9 — When rules and a file disagree
If any generated code or any other file in this pack seems to contradict a rule here, this
file wins. Flag the contradiction rather than silently resolving it in either direction.
