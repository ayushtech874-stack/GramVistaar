# app-flow.md — SIH26091

Note: this file merges what would otherwise be a separate "flow.md" — one file per concern,
per rules.md R1, so there is only ever one place describing the user journey.

## 1. Screen-by-screen flow

### Screen 1 — Language select
2-3 languages. Selection persists for the rest of the session.

### Screen 2 — Input form
Fields: Village/Block dropdown (populated ONLY from the chosen district's pre-loaded
villages via `GET /api/villages` — never free text), Available capital (number input),
Business category (fixed list: Dairy, Retail, Textiles, etc.), plus the eligibility fields:
category/community status, family income, state (pre-filled from district), prior-default
self-declaration (yes/no).

### Screen 3 — Eligibility gate result
Calls `POST /api/eligibility`.
- PASS -> continue to Screen 4 with the matched scheme carried forward.
- FAIL -> show which specific criterion wasn't met, in plain language, AND still offer to
  continue to the Feasibility Card only (financial card is skipped, not the whole flow).

### Screen 4 — Results (only reached with either a PASS from Screen 3, or explicitly
choosing "see feasibility only" after a FAIL)
Two cards side by side (stacked on mobile):
- **LEFT — Financial Card** (only if eligibility passed): Project cost, Loan eligibility,
  Matched scheme name + interest/tenure/moratorium (each tagged "Verified: [source],
  [date]"), EMI schedule table, Affordability Risk-Flag.
- **RIGHT — Feasibility Card**: Market reach, Competitor density, SWOT, Pricing guidance,
  Threats — every line item tagged Verified / Derived / AI-Estimated / Insufficient Data.

### Screen 5 — Download/Share
Single-page PDF or shareable summary combining both cards, a document checklist, and a
plain-language "why this scheme" explanation (see design.md for PDF layout). This is the
hand-off artifact the user carries to the SCA/bank — see decisions.md D9 for why this is a
deliberate human-in-the-loop step, not a gap to fill with more automation.

## 2. End-to-end task — Rekha persona
```
1. Opens app -> selects language
2. Enters: Village/Block/District, Available margin capital (Rs 1,00,000),
   Business category (Dairy), category/income/domicile for the eligibility gate
3. Eligibility gate checks category-matched corporation, income ceiling, domicile,
   prior-default status -> PASS -> Term Loan Scheme not applicable here since
   project cost is Rs 10,00,000 which is within Term Loan range (Rs 1.40L-Rs 50L)
   -> scheme = Term Loan Scheme, 8%, 7yr, 6mo moratorium
4. App shows: Project cost ceiling (Rs 10,00,000) -> Loan eligibility (Rs 9,00,000)
   -> Scheme match, rate shown with "Verified: NSFDC, [date]" tag
5. App generates local feasibility report: market reach, competitor density estimate,
   2-3 opportunity gaps, SWOT, pricing guidance -- each item tagged
6. App shows EMI schedule against realistic revenue estimate from step 5
   -> displays the affordability risk-flag if EMI is high relative to estimated revenue
7. Rekha gets a single shareable summary (PDF/screen) including a document checklist
   and a plain-language "why this scheme" note, to take to the SCA/bank
```

## 3. Feature-wise workflow: Financial module
**User action** -> submits capital + category + eligibility fields.
**Frontend** -> sends inputs to `POST /api/eligibility`, then on PASS to `POST /api/calculate`.
**Backend** -> eligibility rule check (tech-spec.md §2.1); on pass, looks up the hardcoded
`scheme_terms` table, applies the margin-money rule, routes to the correct tier, computes
EMI/moratorium schedule — pure deterministic arithmetic, no AI.
**Output** -> Financial Card with source-tagged rate and the affordability flag (computed
once the feasibility module's revenue estimate is available).
**Edge case** -> capital resulting in a project cost outside any defined tier -> show the
closest tier and what would need to change, never a silent default (tech-spec.md §6).

## 4. Feature-wise workflow: Feasibility module
**User action** -> same submission triggers this in parallel with the financial module.
**Backend** -> looks up the pre-joined Census+SHRUG row for the selected village, computes
market reach / competitor density / price point deterministically.
**AI layer** -> those real numbers (or explicit "insufficient" markers) are embedded in a
structured prompt asking for SWOT/opportunity/threats/pricing guidance, each sentence
tagged by source (tech-spec.md §2.4).
**Output** -> Feasibility Card with source-tag chips.
**Edge case** -> no local knowledge-base entry for that village/category -> state plainly
that this is general guidance, tagged Insufficient Data, not hyper-local data.

## 5. Navigation rules
- No back-button data loss — Screen 2 inputs persist if the user navigates back from
  Screen 3 or 4.
- A FAIL at Screen 3 must never silently proceed to show a Financial Card.
- Screen 5's PDF export must be reachable even if the LLM feasibility call failed (export
  whatever rendered, with a note on what's missing — never block export entirely).
