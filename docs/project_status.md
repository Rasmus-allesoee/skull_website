# Project status

**Snapshot date:** 2026-08-14

**Current phase:** Phase 2.1 — owner-feedback refinement technically complete; owner re-review open

**Overall state:** The complete local, manual, Git, and GitHub Actions gate passes; explicit owner approval remains before Phase 2 can close

**Next phase:** Phase 3 — not started and not authorized

## 1. Current objective

Finish the verified checkpoint for the owner-requested raccoon-dog refinements, then hold the branch stable for visual/content re-review. Do not scale the catalog or begin Phase 3 search, map, shell, taxonomy-index, or full-ingestion work until the owner approves the refined slice.

## 2. Phase 2.1 implementation

### Photography and navigation

- Retained the six validated 3200 px WebP masters and increased the active responsive Next/Image request to quality 90 with more accurate viewport sizing; thumbnails use separate lighter variants.
- Rebuilt the desktop gallery as a complete main image plus compact, independently scrollable right-hand view rail. Mobile portrait keeps thumbnails below; mobile landscape uses the side rail.
- Kept previous/next and direct-thumbnail controls, and added visible desktop/touch instructions, focused Arrow/Home/End keys, horizontal swipe, desktop double-click, and touch double-tap.
- Rebuilt high-resolution inspection as a symmetric full-viewport native dialog that loads the original WebP directly. It supports wheel/trackpad and pinch zoom, constrained mouse/touch drag, double-click zoom/reset, slider/buttons, `+`/`-`/`0`, view switching, Escape, reduced motion, and focus return.
- Fixed the previously inert mobile controls and verified real touch input rather than relying only on mouse-like synthetic events.

### Information hierarchy and specimen records

- Removed the public cited-profile block for now. `TAX-0001.mdx` remains a valid draft and the parser, schema, citation validation, reviewed-profile query, and rendering component remain available for later curated prose.
- Moved measurements immediately below photography/selection. Retained the additional-measurement disclosure, removed the unclear generic diagram, added an accessible definition dialog, and added a proportional 116 mm versus 100 mm size reference that explicitly is not physical screen scale.
- Advanced compiled content to schema version 2 and added controlled fields for five-level condition, expanded age classes, pathology, trauma, teeth-set completeness, and retained-skeleton completeness.
- Added owner to the Collection record; changed `SPEC-0001` from the overly broad `damaged` state to `good` with the reviewed note `Small chip at the anterior nasal tip.`; retained `adult` without exposing unsupported `legacy stage 4` wording.
- Added complete age-class and condition-scale guidance dialogs. Pathology, trauma, teeth set, and skeleton appear in `Show additional recorded data`; all four remain `Not recorded` for `SPEC-0001` because the staging evidence does not support inferred `No`, `Complete`, or `None` values.
- Renamed the preparation presentation to `Skull preparation` and linked it to a real static `/guides/skull-preparation` outline. The route is explicitly not procedural/safety guidance until its claims and citations are reviewed.
- Removed the large rights/credit panel. Gallery captions now use `Photo: Rasmus`, owner appears in the record, and every current page ends with the central `© 2026 Rasmus. All rights reserved.` notice. Structured rights remain blocking publication data and `RIGHTS.md` remains authoritative.
- Replaced public `exhibit` wording with `display` where it appeared in the rendered UI; removed `Six-view study` and `From specimen to exhibit` copy.

### Documentation and future scope

- Recorded future dedicated measurement, age-estimation, and condition methodology content. It requires owner-supplied/reviewed real-skull illustrations/reference images and appropriate citations/species caveats.
- Kept GBIF taxonomy evidence and the explicit reviewed refresh workflow unchanged; normal builds remain offline and never query GBIF.
- Specified Phase 3 discovery sections as at most three same-family cards plus three deterministic collection-wide cards, excluding the current taxon and duplicates and omitting empty groups. They are not rendered with only one taxon.
- Kept all section kickers for now, including the explicitly preferred `Mammalia · Carnivora` and `Physical specimen`; canonical design guidance marks the remaining kickers for reconsideration after the stable release.

## 3. Phase 2 acceptance gate

| Requirement | State | Evidence |
|---|---|---|
| Complete source → validation → generated data/media → static route journey | Pass locally | One published taxon, one specimen, six media assets, zero reviewed profiles; taxon, exact-specimen, and preparation-guide routes prerender |
| Invalid representative fixtures fail actionably | Pass locally | Five deliberate relationship/date/rights/media/observation failures report source, key/field, rule, and correction guidance |
| No EXIF/GPS or archival source reaches public output | Pass locally | Six WebPs total 1.48 MiB and pass EXIF/IPTC/XMP inspection; staging sources remain ignored |
| Refined desktop/mobile/landscape interactions and presentation pass | Pass locally | Nine Playwright journeys plus manual 1440 × 900, 390 × 844, and 844 × 390 review; CDP two-finger pinch included |
| Canonical docs, Git scope, branch, and remote CI agree | Pass | Staging/generated/browser output remains ignored; only curated public derivatives are tracked; commit `1fcf7c6`; Actions run `31850640194` passed |
| Owner approves refined visual direction, density, interactions, and wording | **Pending** | Requires explicit approval after reviewing the Phase 2.1 result |

**Gate conclusion:** The refined technical acceptance gate passes locally and remotely. The full Phase 2 gate remains open only for the owner's explicit approval, so Phase 3 remains blocked.

## 4. Representative record decisions

| Decision | Current answer | Reason/evidence |
|---|---|---|
| Stable identity | `TAX-0001`; `SPEC-0001`; slug `raccoon-dog` | Explicit local IDs, never derived from source row or mutable scientific name |
| Taxonomy | *Nyctereutes procyonoides*; Mammalia → Carnivora → Canidae → *Nyctereutes* | Reviewed exact accepted GBIF match, key `2434552`, confidence `99`; snapshot remains canonical build evidence |
| Canonical views | `lateral`, `oblique`, `frontal`, `dorsal`, `ventral`, `mandible-dorsal` | Direct mapping of the six owner-selected staging images |
| Legacy date | `2025-11`, precision `month` | Repeated day `01` behaves as a placeholder; an exact day was not fabricated |
| Location | entered point retained as approximate with 25,000 m uncertainty; `Wadden Sea region, Denmark` | Direct reviewed source evidence; private anecdotal detail omitted |
| Biology/source | hunting; adult; sex/body mass not recorded | Curated from `Shot`, age `4`, and explicit missing markers; unexplained legacy-age detail hidden |
| Condition/observations | good; small anterior nasal-tip chip; pathology/trauma/teeth/skeleton not recorded | Owner clarified that the minor chip is not general damage; no other observation is inferred |
| Preparation | maceration; dish soap + ammonia for 7 days; hydrogen peroxide whitening for 168 hours; final concentration not recorded | A diluted commercial 12% hair product does not establish final peroxide concentration |
| Rights/credit | `Rasmus`; all rights reserved | Owner context supports ownership/original photography; concise display wording is separated from structured rights enforcement |
| Profile | draft, not public; zero reviewed profiles | Owner deferred species overview/identification until it can be useful, curated, and cited |
| Rendering | static App Router/RSC plus gallery and guide-dialog client islands | Preserves useful static/no-JavaScript content while isolating genuine interaction |
| Production compiler | `next build --webpack` | Pinned Turbopack production build did not terminate reliably in Phase 2; webpack remains deterministic and verified |

## 5. Verification evidence in this refinement

| Gate | Most recent evidence | Status |
|---|---|---|
| Exact toolchain/install | Node `v24.18.0`; pnpm `11.21.0`; `CI=true pnpm install --frozen-lockfile` restored 470 store packages after an accidental concurrent pnpm invocation | Pass |
| Content build | `pnpm content:build`: 1 taxon, 1 specimen, 6 media assets, 0 reviewed profiles (1 profile source) | Pass |
| Media | `pnpm validate:media`: 6 assets, 1.48 MiB, no EXIF/IPTC/XMP | Pass |
| Invalid fixtures | `pnpm test:fixtures`: 5 expected failures detected | Pass |
| Types/lint/tests | `pnpm typecheck`; `pnpm lint`; `CI=true pnpm test`: 3 files / 11 tests, including draft/reviewed profile-citation state | Pass |
| Production build | `CI=true pnpm build`: 7 static routes including both specimen forms and `/guides/skull-preparation` | Pass |
| Browser/accessibility | `CI=true pnpm test:e2e`: 9 Chromium journeys in 14.5 s with no retries/flakes; axe violations `[]`; desktop geometry, q90 delivery, original 3200 px inspection, mobile controls/swipe/double-tap/pinch/drag, dialogs, guide route, reduced motion, third-party boundary, and no-JavaScript pass | Pass |
| Manual visual/responsive | Playwright CLI at 1440 × 900, 390 × 844, and 844 × 390: no horizontal overflow; complete anatomy; desktop controls/all six thumbnails together; portrait stack; landscape side rail; symmetric full-viewport inspector; mobile age-table reflow/scroll | Pass |
| Remote CI | Commit [`1fcf7c6`](https://github.com/Rasmus-allesoee/skull_website/commit/1fcf7c6777530a8443f32d109b4b9de28107a3bc); [Actions run 31850640194](https://github.com/Rasmus-allesoee/skull_website/actions/runs/31850640194); draft [PR #4](https://github.com/Rasmus-allesoee/skull_website/pull/4) updated for Phase 2.1 | Pass |

Package-manager gates must run sequentially with `CI=true` in non-interactive environments; concurrent pnpm commands can reconcile `node_modules` against different lifecycle states and are not a valid speed optimization.

## 6. Known limitations and controls

- Only one taxon/specimen exists. Home remains a phase entrance, not the Phase 3 museum shell/catalog; related-family and random discovery sections therefore have no honest content yet.
- No class/order/family/genus landings, catalog, search, map, full ingestion, deployment, analytics, 360°, 3D, upload, or AI overlay has started.
- The size reference communicates proportion against 10 cm, not a human-skull comparison or calibrated physical screen size. A human-skull silhouette would require a reviewed reference asset and explicit comparison basis.
- Measurement definitions are a quick field guide, not a reproducible anatomical protocol. Dedicated illustrated methodology remains future content.
- The age and condition dialogs are general collection criteria. Future methodology must cite them, explain species variation, and add reviewed real-skull examples.
- The preparation route is a labelled shell, not actionable chemical, biological, legal, or safety guidance.
- The current editorial profile is intentionally absent from the public page; GBIF taxonomy evidence remains available in structured data but is not expanded into low-value prose.
- Footer copyright starts at 2026 because no repository evidence supports a 2023 publication start; the start year can change only with owner-supplied evidence/preference.
- Chrome/Chromium is the Phase 2 browser target. Firefox/WebKit and formal 200%/forced-colors/screen-reader release checks remain Phase 7 gates.
- The connected GitHub app previously returned `403 Resource not accessible by integration` for issue/PR writes; the authenticated local `gh` session remains the established remote-write path.

## 7. Exact next action

1. The owner reviews `/species/raccoon-dog` at desktop Chrome 100% zoom, mobile portrait, and mobile landscape, including all six views, inspection gestures, measurement/age/condition dialogs, additional data, preparation link, and footer wording.
2. The owner either requests another bounded Phase 2 correction or explicitly approves the refined visual direction, density, interactions, record vocabulary, and public wording.
3. Record approval here, close the Phase 2 issue/milestone, and merge/checkpoint only as directed.
4. Begin Phase 3 only after separate authorization.

No new metadata or images are required merely to review/approve Phase 2.1. The later illustrated methodology requires owner-created/reviewed assets; related/random sections require additional published taxa and belong to Phase 3.

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

### 2026-08-13 — initial Phase 2 slice checkpointed

- The user selected *Nyctereutes procyonoides*, staging metadata `ID = 1`, and the six matching `mårhund_*_1.png` files, and authorized Phase 2 only.
- The pipeline, six derivatives, static routes, first display, tests, and canonical documentation were implemented on `agent/phase-2-raccoon-dog-slice`.
- Commit `2b17568a1216a3858d8f1f3caf3193ecc7e098fb` passed the complete clean-clone gate. Documentation checkpoint `ed1852c` passed GitHub Actions run `31743399720`; draft PR #4 and Phase 2 issues/milestone remained open for owner review.

### 2026-08-14 — Phase 2.1 owner-feedback refinement in progress

- The owner approved the overall direction and supplied detailed gallery, mobile, inspection, hierarchy, data-model, guidance, wording, and future-scope feedback.
- The bounded implementation is complete without beginning Phase 3. Manual review caught intrinsic image boxes overflowing both viewports; absolute constrained image boxes plus new geometry assertions fixed that final crop.
- `CI=true pnpm check`, `CI=true pnpm build`, and all 9 Playwright journeys pass after the fix. Manual desktop, portrait, landscape, inspection, and long-dialog checks pass with zero horizontal overflow.
- Commit `1fcf7c6777530a8443f32d109b4b9de28107a3bc` passed [GitHub Actions run 31850640194](https://github.com/Rasmus-allesoee/skull_website/actions/runs/31850640194). Draft PR #4 and issue #8 were updated with the Phase 2.1 evidence.
- The only remaining gate item is explicit owner approval; the issue, milestone, and PR intentionally remain open/draft.

Future entries stay concise and evidence-based. Git history owns file-level chronology; this ledger owns phase outcomes, decisions, blockers, and next action.
