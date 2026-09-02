# tracker.md — SIH26091

Update this file as you build. Status values: `todo` / `in-progress` / `blocked` / `done`.
Everything else in this pack is a locked planning artifact — this is the exception.

## Team-wise ownership (6 members)
| Member | Owns | Status | Notes |
|---|---|---|---|
| Data/Database | District data acquisition, cleaning, joining; scheme_terms + eligibility_rules tables | in-progress | Mock data live; raw Excel workbooks placed in data/raw |
| Backend (financial + eligibility) | Deterministic calculator, eligibility gate, affordability-flag logic, unit tests | done | All 16 unit tests passing cleanly |
| Backend (local-metrics + API) | Local-metrics module, REST endpoints | done | Local metrics lookup & API server endpoints built & verified |
| AI/ML | Prompt design, source-tagging logic + validation, feasibility endpoint | todo | Grounded narrative template ready |
| Frontend | All five screens, source-tag chips, affordability-flag display, PDF export, bilingual pass | todo | API contract verified |
| Integration/Testing/Docs | End-to-end testing, PPT, demo rehearsal coordination | in-progress | Test suite integrated and running |

## Phase checklist (mirrors implementation-plan.md)
- [x] Phase 0 — Setup / district candidate chosen
- [x] Phase 1 — Data verification gate PASSED (blocking)
- [x] Phase 2 — Data collection complete (mock data + raw workbooks ready)
- [x] Phase 3 — Data processing / join spot-checked
- [x] Phase 4 — Database loaded (JSON files)
- [x] Phase 5 — Eligibility module built + unit-tested (PASS)
- [x] Phase 6 — Financial module built + unit-tested (PASS)
- [x] Phase 7 — Local-metrics module built + tested (PASS)
- [ ] Phase 8 — Feasibility prompt tested across 5+ village/category combos
- [ ] Phase 9 — All 5 frontend screens built
- [ ] Phase 10 — Integration complete
- [ ] Phase 11 — Full testing matrix executed
- [ ] Phase 12 — Deployed
- [ ] Phase 13 — Demo rehearsed 3+ times, PPT ready

## Final feature checklist
### Data
- [x] Chosen district confirmed to have usable Census 2011 + SHRUG coverage
- [x] village_metrics table joined and spot-checked
- [x] scheme_terms and eligibility_rules transcribed, double-checked, source-dated

### Backend
- [x] Eligibility gate implemented and tested (pass + fail paths, all corporations in scope)
- [x] Financial calculator unit-tested against the PS worked example
- [x] Affordability risk-flag implemented and tested
- [x] Local-metrics module implemented and tested, including null/"insufficient" handling
- [x] All REST endpoints implemented and tested with valid/invalid inputs

### AI/ML
- [ ] Source-tagged feasibility prompt tested across 5+ village/category combinations
- [ ] Tag-validation post-processing implemented (untagged -> AI-Estimated, never Verified)
- [ ] Fallback confirmed if the LLM call fails

### Frontend
- [ ] All 5 screens built and connected to real endpoints
- [ ] Source-tag chips visibly rendered on both cards (4-tier, not 3)
- [ ] Affordability flag visibly rendered on the results screen
- [ ] Eligibility-fail path correctly shows feasibility-only view
- [ ] PDF export includes document checklist and "why this scheme" explanation
- [ ] Both languages verified end-to-end

### Testing & Demo
- [x] Full testing matrix executed for backend modules
- [ ] 2-3 demo personas chosen and pre-run/cached
- [ ] Offline fallback build confirmed working
- [ ] Demo rehearsed 3+ times within the time window
- [ ] PPT covers problem, competitor audit, solution, differentiation, stack, scalability, impact
