# ui-spec.md — SIH26091 UI Specification (scoped to approved product)

Companion to PRD.md, app-flow.md, schema.md, design.md, rules.md. This file is the UI
build spec — screens, components, states, content, design system — for exactly the
product defined in those files. No feature below exists outside that scope.

## 1. Information Architecture

```
Home (single CTA)
  -> Language & Basic Info (Screen 1)
  -> Village/Capital/Category + Eligibility Input (Screen 2)
  -> Eligibility Gate Result (Screen 3)
      -> [PASS] -> Results: Financial Card + Feasibility Card (Screen 4)
      -> [FAIL] -> Results: Feasibility Card only, with explanation (Screen 4b)
  -> Share/Export (Screen 5)
```
Five screens total, linear, no persistent multi-tab navigation. This is a short guided
assessment, not a multi-section app — the architecture should read as "a form that
produces one report," not "a platform with several destinations."

## 2. User Flow

```
User opens app
  -> selects language (2 languages minimum)
  -> enters village/block/district (dropdown, pre-loaded villages only),
     available capital, business category, and eligibility fields
     (category/community, family income, state, prior-default)
  -> Eligibility Gate runs (deterministic, see tech-spec.md 2.1)
     PASS -> proceeds to full Results screen (Financial + Feasibility cards)
     FAIL -> proceeds to Feasibility-only Results, with the specific unmet
             criterion shown in plain language, and a note that they can still
             see the local feasibility analysis
  -> Results screen renders both cards, each line item tagged
     (Verified / Derived / AI-Estimated / Insufficient Data)
  -> Affordability Risk-Flag shown if Financial Card is present
  -> User taps Share/Export -> single-page PDF generated combining both cards,
     a document checklist, and a plain-language "why this scheme" note
```

## 3. Screen-by-Screen UI

### Screen 0 — Home
- Product name/logo, language toggle in header.
- One-line value proposition: "Check if your business idea works here, and how
  much you can borrow — before you apply."
- Single primary CTA: "Start My Assessment." No secondary CTA, no feature-card
  grid (there is only one journey, not several to choose between).
- Small trust line: "Uses official Census, government scheme, and district data
  — every figure is labeled by source."

### Screen 1 — Language & Basic Info
- "Choose your language" — 2 options minimum (e.g. English + Hindi/regional).
- No separate "new business vs. expanding" branch — out of scope; the product
  only supports the new-business assessment flow defined in PRD.md.

### Screen 2 — Input Form
Single screen, four field groups (not a multi-step wizard — keep it to one
screen with clear section headers, since the field count is small):
- **Location:** State (fixed to Bihar) -> District (Muzaffarpur / Gaya) ->
  Block (pre-loaded list only) -> Village (dropdown, pre-loaded only — never
  free text, per app-flow.md).
- **Capital:** Available margin capital (numeric, auto-formatted in lakhs).
- **Category:** Business category (fixed list: Dairy, Retail, Textiles).
- **Eligibility:** Category/community status, annual family income, state
  domicile (pre-filled from location), prior-default (yes/no toggle).
- Primary CTA: "Check My Eligibility & Feasibility."
- Voice input is optional/nice-to-have for this screen only if time allows —
  not a blocking requirement.

### Screen 3 — Eligibility Gate Result
- **PASS state:** short green confirmation banner — "You may qualify for the
  [Scheme Name] under [Corporation]." Auto-continues to Screen 4 (or a single
  tap to continue).
- **FAIL state:** amber banner naming the specific unmet criterion in plain
  language (e.g. "Declared family income exceeds the eligibility ceiling for
  this scheme"), plus a clear secondary action: "See local business feasibility
  anyway" -> Screen 4b.

### Screen 4 — Results (eligibility passed)
Two cards, stacked on mobile, side by side on desktop:

**LEFT — Financial Card**
```
YOUR FINANCIAL PLAN
Project Cost: Rs X,XX,XXX          [Derived]
Loan Eligibility: Rs XX,XXX        [Derived]
Scheme: [Scheme Name]              [Verified - NSFDC, date]
Interest Rate: X% p.a.             [Verified - source, date]
Tenure: X years, X-month moratorium [Verified]
[View EMI Schedule] (expandable table)
Affordability: [Low/Moderate/High risk] — plain-language flag
```

**RIGHT — Feasibility Card**
```
YOUR LOCAL BUSINESS SNAPSHOT
[Village], [Block], [District]
Population: X,XXX                  [Verified - Census 2011]
Households: XXX                    [Verified - Census 2011]
[Category] establishments nearby: X [Verified - SHRUG] or [Insufficient Data]
Market reach estimate: X people    [Derived]

SWOT / Opportunity Gaps / Threats / Pricing Guidance
(each line individually tagged Verified/Derived/AI-Estimated/Insufficient Data)
```
Every numeric or narrative claim on both cards carries a visible tag — this is
non-negotiable per design.md and schema.md's four-tier system.

### Screen 4b — Results (eligibility failed)
Same Feasibility Card as Screen 4, Financial Card replaced with a plain
explanation card: "You do not currently meet [criterion] for [Scheme Name].
Local business feasibility is shown below regardless — this can still help
you plan." No financial numbers are shown in this state (tech-spec.md 6).

### Screen 5 — Share/Export
- "Download Your Plan" primary action -> single-page PDF containing:
  Financial summary, Feasibility summary (with tags preserved), a plain-
  language "why this scheme" paragraph, and a document checklist (Aadhaar,
  PAN, bank account, address proof, business/project report, category
  certificate, income certificate — scheme-specific per schema.md
  eligibility_rules).
- Secondary action: "Share" (native share sheet / copy link, whichever
  Antigravity's platform supports fastest).
- Footer note on the exported PDF: data source list + vintage note ("Based on
  Census 2011 and SHRUG data — historical baseline, not real-time").

## 4. Components Required
- LanguageSelector
- VillageDropdown (pre-loaded list only, per district/block)
- CapitalInput (numeric, lakh-formatted)
- CategorySelector (fixed list, icon per category)
- EligibilityForm (category/income/domicile/prior-default fields)
- EligibilityResultBanner (pass=green / fail=amber, with explanation text)
- FinancialCard (with expandable EMI schedule table)
- FeasibilityCard
- DataTag (reusable 4-state badge: Verified / Derived / AI-Estimated /
  Insufficient Data — single implementation, used on both cards)
- AffordabilityFlag (Low/Moderate/High risk banner)
- DocumentChecklist (static list, scheme-driven)
- ShareExportButton
- ErrorState / EmptyState components (Section 6)
- ProgressIndicator (5-step, top of screen, not a bottom tab bar)

## 5. Navigation Structure
**Mobile:** single linear flow, top progress indicator (Step 1 of 5 style), a
persistent back action, no bottom tab bar — there are no separate destinations
(Explore/My Plan/Schemes/Profile) to navigate between, since those features
don't exist in this build.
**Desktop:** same linear flow in a centered column (~900px max width); Screen 4
uses the two-column card layout; no separate multi-page dashboard/sidebar nav.

## 6. Empty / Error States
| Situation | UI response |
|---|---|
| No establishment data for selected village/category | Show "Insufficient Data" tag inline on that specific line — never a blank field, never a fabricated number |
| Eligibility gate fails | Screen 4b — feasibility-only, explanation shown (never a blank/dead-end screen) |
| Project cost outside any defined tier | Explicit message with the nearest tier and what would need to change — never a silently wrong default |
| LLM/translation API times out | Financial Card still renders fully; Feasibility Card shows a retry state, not a blank card |
| Network unavailable | Simple offline message; for the live demo, a pre-cached persona result should be available as fallback |
| Village has no pre-loaded data at all | Should not be reachable — the dropdown (Screen 2) only lists villages with data; if it happens, treat as a bug, not a normal state |

## 7. Mobile Layout
- Single column, cards stacked vertically.
- Large tap targets throughout (this is a low-literacy, first-smartphone-use
  context — avoid dense, small controls).
- Primary CTA fixed near the bottom of the viewport on form screens.
- Progress indicator pinned at the top.

## 8. Desktop Layout
- Centered content column, roughly 900px max width (matches the visual system
  already used in the project's other docs).
- Screen 4 only: two-column layout (Financial Card left, Feasibility Card
  right). Every other screen stays single-column even on desktop — this is a
  short guided flow, not a dashboard that needs to fill a wide viewport.

## 9. Accessibility Considerations
- Icon + text pairing on every major label (rupee symbol for financial
  figures, map-pin for location, checkmark/cross for eligibility) so meaning
  doesn't depend on reading fluency alone.
- Color is never the only signal on a DataTag — pair every tag color with an
  icon and a text label.
- Both supported languages verified end-to-end, including dynamic content
  (feasibility narrative, scheme names), not just interface chrome.
- **Assisted Mode** (optional, low build cost): a toggle that slightly slows
  pacing and simplifies copy further, intended for a CSC/SHG field worker
  operating the tool on a beneficiary's behalf (see PS-Understanding.html
  Section 3 — this is a real, low-cost way to serve the facilitator-operated
  use case without building a separate interface).

## 10. SIH 2-3 Minute Demo Flow
```
1. Home -> "Start My Assessment"
2. Language: English (or regional) -> continue
3. Input form: Bihar -> Muzaffarpur -> Aurai -> Saghari Rampur
   Capital: Rs 1,00,000 | Category: Dairy
   Eligibility fields filled for the Rekha persona
4. Eligibility gate: PASS -> "You may qualify for the Term Loan Scheme
   under NSFDC"
5. Results screen: Financial Card (Rs 10,00,000 project cost, Rs 9,00,000
   loan eligibility, 8% / 7yr / 6mo moratorium, all tagged Verified) sits
   beside the Feasibility Card for Saghari Rampur (population 3,026,
   [Verified], establishment count [Insufficient Data — pending SHRUG
   download] or real figure if collected by demo day)
6. Affordability flag shown
7. Tap "Download Your Plan" -> PDF preview with document checklist
Total: under 3 minutes, narrated live, not pre-recorded.
```

## 11. Sample Content (real data, not placeholders)
```
Village: Saghari Rampur, Aurai, Muzaffarpur
Population: 3,026                          [Verified - Census 2011]
Households: (pending DCHB PCA pull)        [Insufficient Data]
Dairy establishments: (pending SHRUG pull) [Insufficient Data]

Village: Khandail, Sherghati, Gaya
Population: 3,040                          [Verified - Census 2011]
Households: 484                            [Verified - Census 2011]
Literacy: 73.91%                           [Verified - Census 2011]
Dairy establishments: (pending SHRUG pull) [Insufficient Data]

Scheme: Term Loan Scheme, NSFDC
Interest: 8% p.a.                          [Verified - nsfdc.nic.in]
Tenure: 7 years, 6-month moratorium        [Verified - nsfdc.nic.in]
Income ceiling: Rs 3,00,000/year           [Verified - nsfdc.nic.in]
```
Use these exact values in Antigravity's mock data while real establishment
data is still being collected (see PS-Understanding.html Section 14 on
building against mock data matching schema.md first).

## 12. Data/Source Transparency Design
Use the existing four-tier system only — do not introduce a second labeling
scheme:
```
[Verified]        - direct from a cited government source, unmodified
[Derived]         - calculated deterministically from Verified fields
[AI-Estimated]    - LLM reasoning on top of real figures
[Insufficient Data] - no usable underlying data; short reason shown, never
                       filled with an invented number
```
Every DataTag should be tappable/expandable to show its exact source and
verification date (schema.md's `data_source_*` and `last_verified_date`
fields feed this directly).

## 13. Design System
- Palette: deep green/gold ledger tones (already established in design.md) —
  reads as "serious financial tool," not generic consumer app. Avoid blue-
  heavy generic SaaS palettes and avoid flashy gradients.
- Typography: one clean, highly legible sans-serif for all in-product UI text
  (this is a low-literacy context — no decorative or condensed fonts in the
  actual product, even if this spec document itself uses a serif for
  readability).
- DataTag badge colors: green (Verified), olive (Derived), amber (AI-
  Estimated), muted red/grey (Insufficient Data) — see design.md Section 3
  for the full treatment table.
- Rounded cards, clear hierarchy, generous spacing for large tap targets.

## 14. Recommended Charts/Visualizations
Keep this minimal — the underlying data is a small number of figures per
village, not a large dataset that needs a dashboard:
- A simple horizontal bar or gauge for the Affordability Risk-Flag
  (Low/Moderate/High), not a complex chart.
- Optionally, a simple two-bar comparison (population vs. households) on the
  Feasibility Card if it aids quick scanning — skip anything requiring a
  charting library beyond what's already available in the stack.
- No dashboards, no multi-panel analytics views — this is out of scope and
  would take time away from the core loop working correctly.
