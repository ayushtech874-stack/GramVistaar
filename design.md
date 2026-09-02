# design.md — SIH26091

## 1. Design principles
- **Trust through transparency, not decoration.** The single biggest credibility feature is
  the four-tier data tag — it must be visually unmissable on every claim, not a small
  footnote.
- **Low-literacy first.** Large tap targets, dropdown/selection inputs over free text
  wherever possible, short sentences, icons alongside text labels, minimal nested navigation.
- **One screen, two cards.** Resist the urge to spread the result across multiple tabs/pages
  — the Financial Card and Feasibility Card belong on one results screen (app-flow.md
  Screen 4), stacked on mobile.
- **Honesty over polish.** If data is missing, say so plainly (Insufficient Data badge) —
  never smooth over a gap with confident-looking placeholder content.

## 2. Visual language (suggested — flexible scope, tune freely)
- Palette: an earthy, trustworthy tone rather than a generic SaaS blue — deep green/gold
  ledger-style accents read as "serious financial tool," not "consumer app."
- Typography: a clean, highly legible sans-serif for all UI text (this is a low-literacy
  context — avoid decorative or condensed fonts entirely in the product itself).
- Iconography: pair every major label with a simple icon (rupee symbol for financial figures,
  a small map-pin for location data, a checkmark/cross for eligibility) so meaning doesn't
  depend on reading fluency alone.

## 3. The four-tier data tag — required visual treatment
| Tag | Suggested treatment |
|---|---|
| Verified | Solid green badge/chip, small checkmark icon |
| Derived | Muted green/olive badge, small calculator icon |
| AI-Estimated | Amber/gold badge, small "AI" or sparkle icon — clearly distinct from Verified |
| Insufficient Data | Muted red/grey badge, explicit short reason text next to it, never hidden or collapsed by default |

These four must be visually distinct enough that a user skimming the screen can tell
Verified from AI-Estimated at a glance, without reading the label text.

## 4. Component list
- **LanguageSelector** — Screen 1.
- **VillageDropdown** — populated from `GET /api/villages`, never free text (app-flow.md).
- **CapitalInput** — numeric, with inline formatting (e.g. auto-comma for lakhs).
- **CategorySelector** — fixed list, icon per category.
- **EligibilityForm** — category/income/domicile/prior-default fields, Screen 2.
- **EligibilityResultBanner** — Screen 3, pass (green) or fail (amber, with explanation +
  "see feasibility anyway" link).
- **FinancialCard** — project cost, loan eligibility, scheme name, rate/tenure/moratorium
  (each with a DataTag), EMI table, AffordabilityFlag.
- **FeasibilityCard** — market reach, competitor density, SWOT, pricing, threats, each line
  wrapped with a DataTag.
- **AffordabilityFlag** — plain-language risk banner (Low/Moderate/High), tech-spec.md §2.5.
- **DataTag** — the reusable four-state badge component described in §3.
- **ShareExportButton** — triggers `POST /api/export`, Screen 5.

## 5. PDF export layout (Screen 5 artifact)
1. Header: user's village/block/district, date generated.
2. Financial summary block — project cost, loan eligibility, scheme, rate/tenure/moratorium,
   EMI schedule (condensed table), affordability flag.
3. Feasibility summary block — market reach, competitor density, top 2-3 opportunity gaps,
   key threats, pricing guidance — each with its data tag preserved in the PDF, not stripped.
4. "Why this scheme" plain-language paragraph.
5. Document checklist for the SCA/bank application (informed by Haqdarshak research in the
   merged master plan — this is the human-hand-off step, decisions.md D9).
6. Footer: data source list and vintage note ("Based on Census 2011 and [SHRUG round] data —
   historical/derived baseline, not real-time").

## 6. Accessibility requirements
- Minimum tap target size suitable for a first-time smartphone user (avoid dense
  desktop-style controls).
- Color must never be the only signal — pair every DataTag color with an icon and a text
  label.
- Both supported languages must be verified end-to-end, not just the interface chrome —
  check that dynamic content (feasibility narrative, scheme names) also renders correctly.

## 7. Production-vs-hackathon note (do not build, just document)
A real deployment would need: explicit consent flows before collecting income/category data,
defined data-retention limits, and DPDP Act compliance review. None of this is built for the
hackathon (PRD.md §7, rules.md R7) — this section exists so the PPT can honestly say "here's
what we've thought about but deliberately deferred," not "we didn't think about it."
