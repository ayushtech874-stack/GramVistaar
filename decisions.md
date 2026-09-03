# decisions.md — SIH26091

Format: Context -> Decision -> Consequences -> Status. New decisions get appended, never
edited in place — if a decision changes, add a new entry that supersedes the old one and
note the supersession in both.

---
## D1 — Single-district scope, not national
**Context:** SHRUG/Census coverage and quality vary by state; national coverage isn't
possible to build or verify in a hackathon window.
**Decision:** Build for one real district (1-2 blocks deep), with an architecture that
proves the pattern generalizes (a data-drop, not a rebuild) rather than proving breadth.
**Consequences:** PPT must include an explicit scalability-roadmap slide rather than
claiming national coverage. Demo is deep, not wide.
**Status:** Decided. See implementation-plan.md Phase 1 for the verification gate.

---
## D2 — Financial/eligibility math is fully deterministic, never LLM-generated
**Context:** Money and eligibility figures are the credibility anchor; an LLM can
paraphrase or drift on numbers even when instructed not to.
**Decision:** Calculator (tech-spec.md §2.2) and eligibility gate (§2.1) are pure functions
against hardcoded, sourced values. The LLM is used only for the feasibility narrative.
**Consequences:** Two clearly separated code paths; testing standards differ (unit-test
exactness for §2.1/2.2, spot-review for §2.4).
**Status:** Decided, locked.

---
## D3 — Four-tier data label, including explicit "Insufficient Data"
**Context:** The original drafting brief used a 2-3 tier system ("Verified"/"Estimated" or
similar); this under-specifies the case where local data genuinely doesn't exist.
**Decision:** Adopt four tiers — Verified, Derived, AI-Estimated, Insufficient Data — and
enforce the no-invention rule (rules.md R2) in code, not just in prompt wording.
**Consequences:** UI needs a fourth distinct badge state (design.md §3); backend needs an
explicit null-handling path (tech-spec.md §2.3/§5) rather than a fallback estimate.
**Status:** Decided — supersedes the simpler tagging language in the earlier merged master
plan draft.

---
## D4 — Eligibility gate runs before any financial number is shown
**Context:** Showing a loan figure to someone who doesn't actually qualify (wrong category,
over the income ceiling, wrong state) undermines trust immediately and wasn't in the
original master plan's flow.
**Decision:** Add `POST /api/eligibility` as a required first step (tech-spec.md §2.1,
app-flow.md Screen 3), gating the Financial Card but not the Feasibility Card.
**Consequences:** New DB table (`eligibility_rules`), new screen, new team-verification task
(confirm exact ceilings per corporation before hardcoding).
**Status:** Decided, added after the master plan merge — not yet reflected in the uploaded
master-plan HTML; this pack is the current source of truth going forward.

---
## D5 — Differentiator is the feasibility<->finance loop, not AI scheme-matching
**Context:** The team's own competitor audit (merged master plan, Part III) confirms
Haqdarshak and myScheme already do rule-based/eligibility-screening scheme matching well,
at scale.
**Decision:** Do not pitch "AI matches you to a scheme" as the innovation. The eligibility
gate (D4) is necessary infrastructure, not the differentiator. The pitch is the closed
feasibility<->finance loop (Mechanism 1) plus honest four-tier data confidence.
**Consequences:** PPT slide 4 language must explicitly rule this out, not just avoid
mentioning it (see the merged master plan's PPT structure, adjusted).
**Status:** Decided, locked.

---
## D6 — Self-service first, human-hand-off second
**Context:** Haqdarshak's audit shows human/agent assistance is genuinely valued by this
user segment, not a fallback to avoid.
**Decision:** AI does the first pass for free and instantly (financial + feasibility); a
human channel (SCA/bank, via the exported PDF) is the deliberate second step.
**Consequences:** PDF export (design.md §5) must include a document checklist and a
plain-language "why this scheme" explanation, not just raw numbers.
**Status:** Decided, locked.

---
## D7 — Business-idea recommendation engine: deferred
**Context:** Three independent research sources (e-Shakti, myScheme, SVEP audits) flag
"recommend a business to the user" as a real market gap.
**Decision:** Not built. The PS's own stated inputs (location, capital, category) assume
the user already knows their category — building a recommendation engine would change that
core input assumption and roughly double AI/prompt-design surface area.
**Consequences:** Logged as Future Scope with strong evidence, not silently dropped.
**Status:** Decided, deferred (not rejected).

---
## D8 — Voice input/output: deferred
**Context:** Valuable for the target low-literacy user but adds real build-time risk.
**Decision:** Not built for MVP. Confirmed relevant by both the original brief and platform
testing; kept on the roadmap.
**Status:** Decided, deferred.

---
## D9 — No SCA/bank system integration, no user accounts
**Context:** Out of scope for a demo-stage prototype; would require real institutional
integration and auth infrastructure.
**Decision:** The PDF export is the integration point — a human carries it to the SCA/bank
manually (see D6).
**Status:** Decided, locked for this build.

---
## D10 — Tech stack: React + Node/FastAPI + Postgres-or-flat-files
**Context:** Team is comfortable with these; hackathon time window rules out anything
requiring significant new-tool ramp-up.
**Decision:** React (web-first) frontend; Node/Express or Python/FastAPI backend;
PostgreSQL or flat JSON/CSV for the small, single-district dataset; Bhashini or Google
Translate for interface text.
**Consequences:** See design.md/tech-spec.md for the concrete module split.
**Status:** Decided, but the exact DB choice (Postgres vs. flat files) is flexible scope —
pick based on whichever the Data/Database owner is fastest with.

---
## D15 — Voice/text free-input, deferred, with implementation constraint if built later
**Context:** Rural, low-literacy users may find typed dropdown search harder than speaking. Genuine accessibility motivation, not scope creep.
**Decision:** Deferred past this build. If added later: speech-to-text (external API) transcribes to plain text, which is then matched against the existing closed lists (202 village names, fixed categories, amount regex) via fuzzy matching — the same mechanism the type-ahead dropdown already uses. This must NOT become a chatbot, NER pipeline, or trained intent classifier — it still resolves to the same fixed form fields, just via a second input method. No conversation state, no memory.
**Status:** Decided, deferred. Revisit only after Screens 1-5 are fully working.
