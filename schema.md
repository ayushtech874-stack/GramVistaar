# schema.md — SIH26091

Canonical source of truth for all data shapes. See rules.md R1: if any other file's
description of a field/endpoint disagrees with this file, this file wins.

## 1. Database tables

### 1.1 `village_metrics` (one row per pre-loaded village)
| Field | Type | Notes |
|---|---|---|
| village_id | string (PK) | matches the Census/SHRUG shared geo-ID for the join |
| village_name | string | |
| block | string | |
| district | string | fixed to the one chosen district for this build |
| population | integer, nullable | Census 2011; null if genuinely unavailable |
| households | integer, nullable | Census 2011 |
| establishments_dairy | integer, nullable | SHRUG Economic Census, per category |
| establishments_retail | integer, nullable | SHRUG |
| establishments_textiles | integer, nullable | SHRUG |
| avg_monthly_consumption | numeric, nullable | SHRUG-derived estimate |
| data_source_population | string | e.g. "Census 2011 Village Directory" |
| data_source_establishments | string | e.g. "SHRUG Economic Census [round]" |
| last_verified_date | date | when the team last cross-checked this row |

Any nullable field being null means the corresponding module must return an explicit
"insufficient" status for that field — never silently substitute a value (tech-spec.md §5).

### 1.2 `scheme_terms`
| Field | Type | Notes |
|---|---|---|
| scheme_id | string (PK) | e.g. "micro_finance", "term_loan" |
| scheme_name | string | |
| corporation | string | NSFDC / NSTFDC / NBCFDC / NMDFC / NSKFDC |
| min_project_cost | numeric | |
| max_project_cost | numeric | |
| max_loan_amount | numeric | |
| interest_rate | numeric | as a decimal, e.g. 0.065 |
| tenure_years | integer | |
| moratorium_months | integer | |
| source_url | string | exact page cited |
| source_verified_date | date | |

### 1.3 `eligibility_rules`
| Field | Type | Notes |
|---|---|---|
| corporation | string (PK) | NSFDC / NSTFDC / NBCFDC / NMDFC / NSKFDC |
| category_match | string | which user-declared category maps here (SC, ST, OBC, ...) |
| income_ceiling | numeric | confirm exact figure/definition (e.g. Double Poverty Line) per corp before hardcoding |
| domicile_requirement | string | states/UTs where an active SCA exists for this corp |
| source_url | string | |
| source_verified_date | date | |

### 1.4 `sessions` (optional — MVP may skip persistence entirely, see PRD.md §7)
| Field | Type | Notes |
|---|---|---|
| session_id | uuid (PK) | |
| created_at | timestamp | |
| inputs | jsonb | raw form submission, session-scoped only, not linked to any user identity |
| result | jsonb | full assessment output, for the export step |

## 2. API request/response shapes

### `POST /api/eligibility`
Request:
```json
{
  "category": "SC",
  "family_income_annual": 60000,
  "state": "Bihar",
  "prior_default": false
}
```
Response (pass):
```json
{
  "status": "pass",
  "corporation": "NSFDC",
  "matched_criteria": ["category", "income", "domicile", "no_prior_default"]
}
```
Response (fail):
```json
{
  "status": "fail",
  "corporation": "NSFDC",
  "unmet_criterion": "income_ceiling",
  "explanation": "Declared family income exceeds the NSFDC income ceiling for this scheme.",
  "can_still_see_feasibility": true
}
```

### `POST /api/calculate` (only called after an eligibility pass)
Request:
```json
{ "available_capital": 100000, "corporation": "NSFDC" }
```
Response:
```json
{
  "project_cost": 1000000,
  "loan_eligibility": 900000,
  "scheme_name": "Term Loan Scheme",
  "interest_rate": 0.08,
  "interest_rate_tag": { "label": "Verified", "source": "NSFDC", "date": "2026-08-01" },
  "tenure_years": 7,
  "moratorium_months": 6,
  "emi_schedule": [ { "period": 1, "emi": 0, "note": "moratorium" } ],
  "affordability_flag": null
}
```

### `POST /api/feasibility`
Request:
```json
{ "village_id": "12345", "category": "dairy" }
```
Response:
```json
{
  "village_name": "Rampur",
  "market_reach": { "value": 3200, "tag": "Verified", "source": "Census 2011" },
  "competitor_density": { "value": 0.00125, "tag": "Verified", "source": "SHRUG" },
  "swot": [
    { "text": "...", "tag": "AI-Estimated" },
    { "text": "...", "tag": "Insufficient Data — general guidance only" }
  ],
  "pricing_guidance": { "text": "...", "tag": "Derived" },
  "opportunity_gaps": ["..."],
  "threats": ["..."]
}
```

### `POST /api/assess` (convenience wrapper chaining the three above)
Request: union of the eligibility + calculate + feasibility request bodies.
Response: `{ eligibility: {...}, financial: {...} | null, feasibility: {...} }`

### `POST /api/export`
Request: `{ session_id: "..." }` or the full assessment object directly.
Response: a PDF binary or a signed URL to one, per your chosen backend's file-serving setup.

### `GET /api/villages`
Response:
```json
{ "district": "...", "villages": [ { "village_id": "12345", "village_name": "Rampur" } ] }
```

## 3. The four-tier data-quality tag (used throughout §2 above)
One of exactly four string values, always paired with a source when not "Insufficient Data":
- `"Verified"` — direct from a cited government source, unmodified.
- `"Derived"` — calculated deterministically from Verified fields.
- `"AI-Estimated"` — LLM reasoning on top of real figures; a judgment call, not a fact.
- `"Insufficient Data"` — no usable underlying data; must include a short reason string.
