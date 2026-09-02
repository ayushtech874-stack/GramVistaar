# tech-spec.md — SIH26091

Companion to PRD.md. Data contracts (request/response shapes, DB tables) live in schema.md —
this file is the authority on architecture, algorithms, and behavior; schema.md is the
authority on exact field names/types. If they ever disagree, schema.md wins (rules.md R1).

## 1. Architecture overview

User -> Frontend (React) -> Backend API (Node/Express or FastAPI) ->
  [Eligibility Module (deterministic)] ->
  [Financial Module (deterministic)] + [Local-Metrics Module (deterministic)] ->
  [LLM Feasibility Module, grounded on the deterministic outputs above] ->
  Combined Results (Financial Card + Feasibility Card + Affordability Flag) ->
  PDF Export -> User

Three of the four backend modules are pure deterministic logic (Eligibility, Financial,
Local-Metrics). Only the Feasibility narrative touches an LLM, and only after the
deterministic numbers exist — the LLM is never the source of a number, only the narrator
around numbers it's given (see §5, the no-invention rule).

## 2. Modules

### 2.1 Eligibility Module (deterministic)
Input: category/community, family income, state, prior-default flag.
Logic:
1. Map category to corporation (SC -> NSFDC, ST -> NSTFDC, OBC -> NBCFDC, Minority -> NMDFC,
   Safai Karamchari -> NSKFDC). See schema.md `eligibility_rules`.
2. Check family income against that corporation's ceiling (e.g. Double Poverty Line for
   NSFDC — confirm exact figure per corporation before hardcoding).
3. Check state has an active SCA for that corporation.
4. Check prior-default self-declaration.
5. Output: PASS with matched corporation+scheme-tier-eligibility, or FAIL with the specific
   unmet criterion, in plain language.
On FAIL, the pipeline still runs the Local-Metrics + Feasibility modules (§2.3/2.4) — the
Financial Module (§2.2) is skipped, and the UI explains why (see app-flow.md Screen 3).

### 2.2 Financial Module (deterministic, zero-tolerance accuracy)
Input: available margin capital, matched scheme tier from §2.1.
```
project_cost = available_capital / 0.10
loan_eligibility = project_cost * 0.90

if project_cost <= 140000:
    scheme = "Micro Finance Scheme"
    rate = 0.065          # per annum
    tenure_years = 3
    moratorium_months = 3
    max_loan = 125000
elif project_cost <= 5000000:
    scheme = "Term Loan Scheme"
    rate = 0.08
    tenure_years = 7
    moratorium_months = 6
    max_loan = 4500000
else:
    # outside any defined tier — do not silently clamp or default
    return EdgeCaseResponse(
      message="Project cost exceeds the Term Loan Scheme ceiling.",
      nearest_tier="Term Loan Scheme",
      what_would_change="Reduce available capital or apply for a different scheme category."
    )

loan_eligibility = min(loan_eligibility, max_loan)
emi_schedule = compute_emi(loan_eligibility, rate, tenure_years, moratorium_months)
```
`compute_emi` must implement standard reducing-balance EMI math with the moratorium period
excluded from principal repayment (interest-only or capitalized during moratorium — confirm
which the scheme actually specifies before hardcoding; NSFDC/NBCFDC pages should state this).

Unit tests required: the PS's own worked example (₹1,00,000 capital -> ₹10,00,000 project
cost -> ₹9,00,000 loan, Term Loan Scheme) plus 3+ additional hand-computed cases spanning
both tiers and the tier-boundary edge case (project cost exactly ₹1.40 lakh).

### 2.3 Local-Metrics Module (deterministic)
Input: village_id, business category.
Looks up the pre-joined `village_metrics` row (schema.md). Computes:
```
market_reach = sum(population of villages within radius R of selected village)
competitor_density = establishment_count[category] / population
price_point_estimate = f(avg_monthly_consumption, category)   # simple ratio/lookup, not ML
```
If the row or the specific category field is missing/null for the selected village: return
`data_status = "insufficient"` for that field — do not estimate a substitute number here (a
substitute number, if wanted, is generated later by the LLM and tagged AI-Estimated, never
silently swapped in by this module).

### 2.4 Feasibility Module (LLM, grounded)
Input: the real numbers from §2.3 (or their "insufficient" markers), category, capital.
Constructs a structured prompt of the form:
```
"Local data for {village}, {district}:
 - Population: {population} [Verified, Census 2011]
 - {category} establishments: {count} [Verified, SHRUG] OR [Insufficient Data]
 - Avg monthly consumption: {consumption} [Derived, SHRUG-based estimate]

 Using ONLY the figures above as ground truth, and clearly distinguishing your own
 reasoning from those figures, generate: (1) a SWOT analysis, (2) 2-3 opportunity gaps,
 (3) local threats, (4) pricing guidance, for a {category} business at this location.
 Tag every sentence with [Verified], [Derived], [AI-Estimated], or [Insufficient Data —
 general guidance only]. Do not state any specific number that was not given to you above."
```
Post-processing must parse and re-render these tags as UI badges (design.md) rather than
trusting the LLM's inline text formatting alone — validate tag presence per sentence and
default to [AI-Estimated] if a sentence is untagged, never default to [Verified].

### 2.5 Affordability Risk-Flag (deterministic)
```
emi_ratio = monthly_emi / estimated_monthly_revenue
if emi_ratio < 0.25: flag = "Low risk"
elif emi_ratio < 0.40: flag = "Moderate risk"
else: flag = "High risk — reconsider loan size or business scale"
```
Exact thresholds are flexible scope — tune against realistic numbers during testing
(decisions.md).

## 3. API surface (see schema.md for full request/response JSON)
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/eligibility` | POST | Run §2.1, return pass/fail + matched scheme |
| `/api/calculate` | POST | Run §2.2 (requires eligibility pass), return financial card data |
| `/api/feasibility` | POST | Run §2.3 + §2.4, return feasibility card data with tags |
| `/api/assess` | POST | Convenience endpoint chaining all of the above for the main flow |
| `/api/export` | POST | Generate the shareable PDF from a completed assessment |
| `/api/villages` | GET | Return the dropdown list of pre-loaded villages for the chosen district |

## 4. Data sources -> module mapping
| Data | Source | Feeds |
|---|---|---|
| Village population, households | Census 2011 Village Directory (data.gov.in) | §2.3 market_reach |
| Establishment counts by sector | SHRUG (devdatalab.org/shrug) | §2.3 competitor_density |
| Consumption estimates | SHRUG | §2.3 price_point_estimate |
| District/state GSDP, sector growth | MOSPI Socio-Economic OGD catalog | §2.4 macro context |
| Scheme terms + eligibility ceilings | NSFDC, NBCFDC, socialjustice.gov.in | §2.1, §2.2 (hardcoded) |

All of the above are historical/derived baselines (Census 2011, latest available Economic
Census round), not real-time feeds — this must be stated in the UI, not just this doc (see
design.md source-tag copy).

## 5. Hard rule: no invented local data
Enforced at three layers, not just prompt instructions:
1. §2.3 returns `null`/`"insufficient"` explicitly rather than a fallback guess.
2. The §2.4 prompt only ever receives real numbers or explicit "insufficient" markers — never
   a number the module itself made up to fill a gap.
3. Post-processing (§2.4) defaults any untagged LLM sentence to AI-Estimated, never Verified,
   and flags for review any sentence that states a specific number not present in the input.

## 6. Error handling & edge cases
- Project cost outside any tier (§2.2) — explicit message, never a silent default tier.
- Zero-competitor village — valid state, feasibility narrative should say so plainly, not
  treat it as missing data.
- LLM or translation API timeout — Financial Card renders fully regardless; Feasibility Card
  shows a retry state, never a blank/broken card.
- No `village_metrics` row for a selected village — should not be reachable if `/api/villages`
  only lists pre-loaded villages; treat as a bug if it occurs, not a normal edge case.

## 7. Performance targets
Combined `/api/assess` round trip: under 3-5 seconds. If the LLM call is the bottleneck,
consider running §2.1-§2.3 synchronously and streaming §2.4's narrative into the UI.

## 8. Deployment
Frontend: Vercel/Render or similar static/SSR host. Backend: same platform or a small
container. No auth, no persistent user data beyond a session — see PRD.md §7 and design.md
for the production-vs-hackathon security note.
