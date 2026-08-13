# Project status

**Snapshot date:** 2026-08-13

**Current phase:** Phase 2 — implementation and technical verification complete; owner review open

**Overall state:** Technical acceptance requirements pass locally; the phase gate remains open for the owner's explicit visual/content approval

**Next phase:** Phase 3 — not started and not authorized

## 1. Current objective

Hold the validated raccoon-dog vertical slice stable while the owner reviews its real visual direction, information density, interactions, and public credit wording. Do not scale the catalog or begin any Phase 3 feature until that approval is recorded.

## 2. Completed in Phase 2

- Curated one representative taxon (`TAX-0001`) and physical specimen (`SPEC-0001`) from only staging metadata source row `ID = 1` and the six explicitly selected raccoon-dog PNGs.
- Added the canonical linked UTF-8 CSV sources, cited MDX profile, reviewed GBIF snapshot, media declarations, strict Zod schemas, typed domain records, compiler, deterministic ignored artifacts, and actionable diagnostics.
- Implemented explicit taxonomy refresh that writes a pending snapshot without changing curated identification; ordinary builds remain fully local.
- Implemented an explicit staging map and Sharp pipeline for orientation, sRGB, metadata stripping, alpha/edge checks, dimensions, file budgets, transparent subject bounds, and canonical WebP naming.
- Committed six curated public derivatives (1.48 MiB total) while keeping all selected PNGs, working metadata, `.staging/`, and `.generated/` outside Git.
- Added statically generated `/species/raccoon-dog` and `/species/raccoon-dog/specimens/SPEC-0001` routes with distinct canonical metadata and default/exact specimen semantics.
- Built the real dark museum exhibit: six-view gallery, direct selection, previous/next, keyboard and swipe control, native zoom dialog, focus return, reduced motion, taxonomic breadcrumb, confidence labels, selector, cited profile, measurement diagram/data, provenance, preparation, rights, missing values, and incomplete-media handling.
- Self-hosted Newsreader and IBM Plex Sans with retained SIL OFL notices and no runtime font service.
- Expanded unit, component, axe, invalid-fixture, browser, responsive, performance, reduced-motion, third-party-request, and no-JavaScript coverage.
- Added real content/media/fixture steps to CI and documented all executable authoring/quality commands.

## 3. Phase 2 acceptance gate

| Requirement | State | Evidence |
|---|---|---|
| Complete source → validation → generated data/media → static route journey in a clean build | Pass locally; clean-checkpoint evidence recorded before closing technical work | Canonical sources compile to one taxon, one specimen, six assets, one profile; both route forms prerender |
| Invalid representative fixtures fail actionably | Pass | Four deliberate relationship/date/rights/media failures are detected with source, key/field, rule, and correction guidance |
| No EXIF/GPS or archival source reaches public output | Pass | Six WebPs pass metadata inspection; Git/ignore audit excludes selected PNGs, draft CSV, `.staging/`, `.generated/`, and archival formats |
| Owner approves visual direction, density, interactions, and content/credit wording | **Pending** | Must be provided explicitly after reviewing the real slice |

**Gate conclusion:** the technical acceptance gate passes. The full Phase 2 gate does **not** close until the owner explicitly approves the rendered slice. Phase 3 remains blocked on that single review step, not on unfinished implementation.

## 4. Representative slice and decisions

| Decision | Phase 2 answer | Reason/evidence |
|---|---|---|
| Stable identity | `TAX-0001`; `SPEC-0001`; slug `raccoon-dog` | Explicit local IDs, never derived from the source row or mutable scientific name |
| Taxonomy | *Nyctereutes procyonoides*; Mammalia → Carnivora → Canidae → *Nyctereutes* | Reviewed exact accepted GBIF species match, key `2434552`, confidence `99`; corroborated by Mammal Diversity Database |
| Canonical views | `lateral`, `oblique`, `frontal`, `dorsal`, `ventral`, `mandible-dorsal` | Direct mapping of the six approved staging images |
| Legacy date | `2025-11` with month precision | Day `01` is used repeatedly as a legacy placeholder; no fabricated exact day |
| Location | entered coordinates retained as approximate with 25,000 m uncertainty; public label “Wadden Sea region, Denmark” | Precision and locality come from the selected source row/narrative; names and anecdotal/private detail were omitted |
| Source/biology | hunting; sex and body mass not recorded; adult (legacy stage 4); damaged anterior nasal tip | Direct canonical translation of `Shot`, `X`, age `4`, and `Ødelagt næsetip` |
| Preparation | maceration; dish soap + ammonia for 7 days; hydrogen peroxide whitening for 168 hours; final concentration not recorded | A diluted commercial 12% hair product does not establish final peroxide percentage |
| Rights/credit | all rights reserved; “Private collection of Rasmus”; “Photography by Rasmus” | User context establishes ownership/original photography; exact display strings remain reviewable at this gate |
| Rendering | static App Router/RSC with one client gallery island | Matches accepted architecture and preserves useful no-JavaScript content |
| Production compiler | `next build --webpack` | Pinned Turbopack production build did not terminate reliably locally; supported webpack build is deterministic and verified |

The detailed field mapping is preserved in `docs/content_data_model.md`; compiled JSON and media manifests remain replaceable ignored outputs.

## 5. Verification evidence

| Gate | Command/evidence | Status |
|---|---|---|
| Exact toolchain | Node `v24.18.0`; pnpm `11.21.0` | Pass |
| Frozen install | `CI=true pnpm install --frozen-lockfile` | Pass |
| Content validation | `pnpm validate:content`: 1 taxon, 1 specimen, 0 warnings | Pass |
| Media validation | `pnpm validate:media`: 6 WebPs, 1.48 MiB; sRGB, alpha, dimensions, bounds, naming, no EXIF/IPTC/XMP | Pass |
| Invalid fixtures | `pnpm test:fixtures`: all four expected failures detected | Pass |
| Formatting/lint/types/tests | `CI=true pnpm check`; Vitest 3 files / 10 tests | Pass |
| Production build | `pnpm build`: `/`, `/_not-found`, `/icon.svg`, both taxon/specimen paths static | Pass |
| Browser/accessibility | `pnpm test:e2e`: 6 Chromium journeys; axe violations `[]` | Pass |
| Responsive/performance | Browser tests at 390 px; hero transfer ≤ 250 KiB; manual 360 px `scrollWidth = clientWidth = 360` and zero failed images | Pass |
| Manual visual/interaction | Playwright CLI at 1440, 390, and 360 px; all six labels/alt texts, controls, zoom/focus, reduced motion, and no-JS fallback checked | Pass |
| Network boundary | Browser requests only `http://127.0.0.1:3000`; normal build uses no GBIF/font/map/runtime data call | Pass |
| Clean committed clone | Commit `2b17568a1216a3858d8f1f3caf3193ecc7e098fb`; offline frozen install restored 470 packages; full check, build, 6 browser journeys; Git stayed clean | Pass |
| Remote branch / CI | Branch pushed; draft [PR #4](https://github.com/Rasmus-allesoee/skull_website/pull/4) open | CI run pending |

Remote CI evidence is filled only after GitHub Actions finishes. Local and clean-clone passes do not substitute for that external gate.

## 6. Known limitations and controls

- Only the representative taxon/specimen exists; the Home page is still a phase entrance, not the Phase 3 museum shell or catalog.
- No class/order/family/genus landing pages, catalog, search, map, full ingestion, deployment, analytics, 360°, 3D, upload, or AI overlay has been started.
- The diagram is an accessible orientation guide, not a calibrated overlay or formal methodology publication.
- Taxonomy and profile facts are reviewed for this slice only; bulk taxonomy remains Phase 6 work.
- Public credit strings and visual/content preference remain intentionally open to owner correction before scaling.
- The Next/Image preload warning seen only after repeated cached Playwright CLI navigation had no failed request or console error; cold browser acceptance and image delivery passed.
- The connected GitHub app can read the repository but returned `403 Resource not accessible by integration` for issue/PR writes on 2026-08-13. The repository's existing authenticated `gh` session successfully created milestone `Phase 2 — validated vertical slice`, issues [#5–#8](https://github.com/Rasmus-allesoee/skull_website/milestone/1), and draft PR #4; no re-authentication or manual push was required.

## 7. Exact next action

1. Finish GitHub Actions verification for draft PR #4 without merging it automatically.
2. The owner reviews `/species/raccoon-dog` at desktop and mobile widths, including all six views and the exact specimen link.
3. The owner either requests bounded Phase 2 refinements or explicitly approves:
   - visual direction and density;
   - gallery/zoom/mobile interactions;
   - measurement/provenance/preparation presentation; and
   - the two public credit strings.
4. Record that decision here and in `docs/design_system.md`.
5. Only after approval, authorize Phase 3 and create its focused milestone/issues/branch.

No additional images or metadata are required merely to approve Phase 2. Phase 3 scope should be re-read from `docs/implementation_plan.md`; do not silently pull search, map, or full ingestion forward.

## 8. Decision/blocker protocol

- A failing test or lint rule is implementation work, not automatically a blocker.
- A decision that changes public identity, rights, data publication, scope, or external account state is surfaced to the owner.
- Blockers record what was tried, exact evidence, safe work completed, and the smallest required owner action.
- When resolved, retain a short resolution in the checkpoint log rather than deleting history.

## 9. Checkpoint log

### 2026-08-12 — Phase 0/1 completed

- Foundation and canonical documentation were published in public `Rasmus-allesoee/skull_website`.
- Foundation commit `07eea359cd4a4daf302639af52a0762ab53690f0` and phase-closing commit `e8d322dd12dab2bbbd4873c153cab867afe2c1b7` passed GitHub Actions.
- Phase 2 remained unstarted until explicit user authorization.

### 2026-08-13 — Phase 2 implemented locally

- User explicitly selected *Nyctereutes procyonoides*, staging metadata `ID = 1`, and the six matching `mårhund_*_1.png` files, and authorized Phase 2 only.
- Source contracts, taxonomy evidence, media pipeline, six derivatives, static taxon/specimen exhibit, tests, CI steps, and canonical documentation were implemented on `agent/phase-2-raccoon-dog-slice`.
- Local content/media/fixture, type, unit/component/axe, production build, Chromium/no-JS/accessibility, real-image performance, and desktop/mobile visual checks passed.
- Commit `2b17568a1216a3858d8f1f3caf3193ecc7e098fb` passed the complete gate again in a clean clone and was pushed; milestone 1, issues #5–#8, and draft PR #4 were created. Issues #5–#7 are complete; #8 owns remote evidence and owner approval.
- Work stopped at the required owner visual-approval boundary; no Phase 3 feature was introduced.

Future entries stay concise and evidence-based. Git history owns file-level chronology; this ledger owns phase outcomes, decisions, blockers, and next action.
