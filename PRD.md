# PRD.md — SIH26091 AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant

## 1. Overview
Ministry: Ministry of Social Justice & Empowerment (MoSJE). Track: Software, Miscellaneous.
We are building a single-flow web app that takes a rural entrepreneur's location, available
margin capital, and business category, and returns one combined result: (a) an exact,
scheme-correct financing plan, and (b) a locally-grounded business feasibility report — with
an eligibility check run first, and every claim visibly labeled by data quality.

This is a **hackathon prototype for one district**, not a national platform. See decisions.md
(D1) for why, and implementation-plan.md for the build sequence.

## 2. Problem Statement (restated)
A rural entrepreneur with, say, ₹1,00,000 in savings has no way to know how much she is
eligible to borrow under government concessional schemes, which scheme tier applies, or
whether her business idea will actually survive in her specific village's market. She picks a
business off anecdote, banks lend against a project cost she never validated, and a large
share of these funded micro-enterprises stagnate post-disbursement.

**Who:** first-time rural/semi-urban micro-entrepreneurs eligible for NSFDC/NBCFDC-style
concessional, SCA-routed credit — often low financial literacy, more comfortable in a
regional language than English.

**What fails today:** business choice driven by anecdote not data; inability to calculate
exact eligible loan amount or correct scheme tier; no visibility into local competition or
realistic pricing before committing capital; no eligibility check before a number is shown.

**Success looks like:** in one guided session, the user gets (a) a specific loan amount and
scheme name with correct interest/tenure — only after confirming they actually qualify — and
(b) at least one concrete, locally-grounded reason to proceed or reconsider their business
choice, with every number traceable to a real source or explicitly marked as insufficient.

## 3. Goals
- G1. Give an exact, scheme-correct financial structuring plan (project cost, loan
  eligibility, matched scheme, EMI/moratorium schedule) with zero tolerance for calculation
  error.
- G2. Gate that plan behind a real eligibility check (category, income ceiling, domicile,
  prior-default) so we never show a loan number to someone who cannot actually get it.
- G3. Give a locally-grounded feasibility report (market reach, competitor density, SWOT,
  pricing, threats) for one real district, honestly labeled by data quality.
- G4. Close the loop: the loan ceiling constrains what business scale gets evaluated, and the
  feasibility module's revenue estimate stress-tests EMI affordability (visible flag).
- G5. Be usable, self-service, by a low-literacy rural user in at least 2 languages, with a
  human-hand-off (shareable PDF) as the completion step, not a replacement for AI.

## 4. Non-goals (explicitly out of scope for this build)
- National or multi-district coverage (see decisions.md D1).
- Business-idea recommendation ("what should I start") — the PS's own inputs assume the user
  already knows the category; see decisions.md D7.
- Voice input/output — deferred, see decisions.md D8.
- Real SCA/bank system integration or loan submission.
- User accounts, login, saved history.
- AI scheme-matching / eligibility discovery as our differentiator — that space is already
  well served by Haqdarshak and myScheme (see decisions.md D5); our eligibility gate exists
  for correctness, not as the pitch.

## 5. Target user / persona
**Rekha, 29** — Gram Panchayat resident in a semi-urban block. Has ₹1,00,000 saved, wants to
start a small dairy or retail unit. Has heard about government loan schemes from neighbors
but doesn't know which applies to her or how much she can borrow. Comfortable with a
smartphone, moderate literacy, more comfortable in her regional language than English.

## 6. Functional requirements

### FR1 — Eligibility Gate (must run before FR2)
Inputs: category/community status, family income, state/domicile, prior-default
self-declaration. Output: pass/fail per applicable corporation (NSFDC/NSTFDC/NBCFDC/NMDFC/
NSKFDC — see schema.md `eligibility_rules`). On fail: do NOT block the user entirely — still
offer the feasibility report (FR3), and state plainly which criterion wasn't met.

### FR2 — Financial Structuring Module
Deterministic, no AI. Inputs: available margin capital, matched scheme (from FR1).
Computes: project cost (capital ÷ 0.10), loan eligibility (90% of project cost), tier
routing (Micro Finance ≤ ₹1.40L vs Term Loan ₹1.40L–₹50L), EMI schedule with the correct
moratorium period. Interest rate and tenure are auto-filled from the matched scheme, never
user-entered. Every figure carries a "Verified: [source], [date]" tag.

### FR3 — Feasibility Module
Inputs: village/block, business category. Looks up the pre-joined local-metrics table
(schema.md `village_metrics`) for population, establishment counts, consumption estimate.
Computes market reach and competitor density deterministically. Passes those real numbers
into a structured LLM prompt to generate SWOT, opportunity gaps, threats, and pricing
guidance. Every sentence in the output is tagged with one of: Verified, Derived,
AI-Estimated, or Insufficient Data (see tech-spec.md §5 for the enforcement rule — the LLM
must never be allowed to silently invent a number when the table has no row).

### FR4 — Affordability Risk-Flag
Compares the EMI from FR2 against the estimated local revenue implied by FR3's pricing
guidance. Deterministic threshold logic (tune exact thresholds during testing — see
decisions.md, flexible scope). Renders as a plain-language flag, e.g. "EMI is ~38% of
estimated monthly business revenue — moderate risk."

### FR5 — Source-Tagged Output
Every number/claim on both the Financial Card and Feasibility Card carries a visible tag
from the four-tier system. This is the single biggest credibility feature — see design.md
for exact badge treatment.

### FR6 — Multilingual UI
Minimum 2 languages end-to-end (interface labels; financial figures don't need translation).
Bhashini or Google Translate API for interface text only — not for the LLM feasibility
narrative, which is generated once per language if both are demoed.

### FR7 — Shareable Output
Single-page PDF or shareable screen combining both cards, a document checklist, and a
plain-language "why this scheme" explanation — meant to literally be carried to the SCA/bank
(human-hand-off, see decisions.md D9).

## 7. Non-functional requirements
- **Accuracy over polish:** FR2 and FR1 must be exactly correct — this is the credibility
  anchor of the whole pitch. No approximation tolerated on scheme terms.
- **Performance:** combined calculate + feasibility round trip target under 3–5 seconds.
- **Resilience:** if the LLM/translation API is unavailable, the Financial Card must still
  render fully; fall back to a cached persona result for the live demo if needed.
- **Privacy:** no real personal financial data in testing; session-scoped only; no login.
  See rules.md R7 and design.md for what a production version would additionally need.
- **Accessibility:** large tap targets, minimal free-text entry, dropdown-first inputs.

## 8. Success metrics (for the hackathon, not production KPIs)
- Calculator output exactly matches the PS's own worked example plus 3+ hand-computed test
  cases across both tiers (see tech-spec.md testing notes).
- Feasibility narrative reviewed correct/labeled-correctly across 5+ village/category
  combinations.
- Full demo (Rekha persona) completes end-to-end, live, in under 3 minutes, in 2 languages.
- Judges can be shown the exact NSFDC/NBCFDC source page for any figure on request.

## 9. Open questions / assumptions to confirm before build
- Exact district chosen — must pass the data-verification checklist in
  implementation-plan.md Phase 1 before committing.
- Second demo language — pick based on the chosen district's dominant regional language.
- Exact affordability-flag thresholds — tune during testing, not fixed here (flexible scope,
  decisions.md).
