# Project status

**Snapshot date:** 2026-08-16

**Current phase:** Phase 2.2 — second owner-feedback refinement implemented; checkpoint verification and owner re-review open

**Overall state:** Phase 2.2 code, content, media, automated coverage, and manual browser evidence are locally complete; the branch checkpoint/remote CI and explicit owner approval remain before Phase 2 can close

**Next phase:** Phase 3 — not started and not authorized

## 1. Current objective

Finish the verified checkpoint for the owner's second raccoon-dog refinement, then hold the branch stable for visual/content re-review. Do not scale the catalog or begin Phase 3 search, map, shell, taxonomy-index, or full-ingestion work until the owner approves the Phase 2.2 slice.

## 2. Phase 2.2 implementation

### Photography, inspection, and real-device behavior

- Retuned the desktop gallery around the owner's common normal-Chrome shape (approximately 1440 × 696): the main stage is 10–20% taller, the skull is materially larger, the rail matches the stage/control depth, thumbnail frames share the new proportion, and the stage remains complete and uncropped at both 1440 × 696 and 1440 × 900.
- Corrected the lateral hero's optical vertical alignment at desktop-height layouts by shifting that view downward: top and bottom negative space are now visually balanced without changing the source asset, alpha bounds, comparison scale, thumbnails, inspection, other angles, or short mobile-landscape layout.
- Replaced the active responsive derivative with a direct validated master rendered through an SVG view box calculated from compiled alpha `subjectBounds`. Transparent canvas margins no longer create side dead space or blur; thumbnails remain lightweight derivatives and inspection still uses the original master.
- Added a non-passive, inspector-scoped wheel handler for wheel/trackpad and browser-reported desktop pinch gestures. It prevents background page scroll/page zoom, retains centered zoom, and leaves Arrow/Home/End view changes available even above 100% zoom.
- Reproduced the reported local-network mobile failure as a Next.js HMR cross-origin rejection/reload loop rather than broken touch handlers. `allowedDevOrigins` now includes loopback and currently detected private LAN IPv4 values; `dev:network` and production-like `preview:network` are documented. Fresh loopback and LAN sessions retained state after taps with zero console errors.
- Kept mobile portrait thumbnails below, mobile landscape rail beside the image, real tap/swipe/double-tap/pinch/drag interactions, dialog focus restoration, and reduced-motion behavior.

### Measurements and reusable calibrated comparison

- Removed the 10 cm reference entirely. Measurements now place the compact specimen table/extra-value disclosure below the heading and the larger `A sense of scale` card beside it on desktop, stacking cleanly on narrow screens.
- Added route-independent comparison records, eligibility queries, scaling calculations, alpha-bounded image primitives, selector, pair layout, and differences renderer. No comparison behavior is hard-coded to `SPEC-0001`.
- Added `content/references/adult-human-skull.json` plus a deterministic reference-media processor. The reviewed transparent WebP is sRGB, alpha-bounded, metadata-free, explicitly right-facing, and stores six fixed approximate dimensions with a non-universal-reference note.
- The primary and comparison images use one responsive pixels-per-millimetre factor derived from the larger maximum length. `subjectBounds.width`, not canvas width, maps to physical length; aspect ratio/anatomy remain intact and a comparison may be horizontally flipped only from explicit orientation metadata.
- The accessible scoped selector puts the adult-human default first, searches eligible reference/specimen names and IDs, excludes the current specimen, and announces selection changes. With only one collection specimen, the human reference is currently the only honest option; synthetic component fixtures verify dynamic specimen replacement.
- The six-row difference table calculates maximum length/width/height, prepared mass, cranium width, and maximum mandible length from the current selection. It keeps the page specimen as numerator, uses measurement-specific wording, sensible ratios, approximation markers, and text in addition to restrained directional color.
- Advanced `CompiledCollection` to schema version 3, added explicit lateral orientation and typed comparison references, validates exactly one default reference, and emits a separate replaceable comparison-reference manifest.

### Record language and dialogs

- Changed the collection kicker from `Provenance` to `Metadata`.
- Left-aligned age/condition guide notes and headings. The desktop `Specimen-condition guide` title remains on one line; narrow layouts may wrap naturally.

## 3. Phase 2.1 implementation (retained foundation)

### Photography and navigation

- Phase 2.1 retained the six validated 3200 px WebP masters and raised responsive quality; Phase 2.2 supersedes the active-image delivery path with the alpha-bounded master while keeping lightweight thumbnails.
- Rebuilt the desktop gallery as a complete main image plus compact, independently scrollable right-hand view rail. Mobile portrait keeps thumbnails below; mobile landscape uses the side rail.
- Kept previous/next and direct-thumbnail controls, and added visible desktop/touch instructions, focused Arrow/Home/End keys, horizontal swipe, desktop double-click, and touch double-tap.
- Rebuilt high-resolution inspection as a symmetric full-viewport native dialog that loads the original WebP directly. It supports wheel/trackpad and pinch zoom, constrained mouse/touch drag, double-click zoom/reset, slider/buttons, `+`/`-`/`0`, view switching, Escape, reduced motion, and focus return.
- Fixed the previously inert mobile controls and verified real touch input rather than relying only on mouse-like synthetic events.

### Information hierarchy and specimen records

- Removed the public cited-profile block for now. `TAX-0001.mdx` remains a valid draft and the parser, schema, citation validation, reviewed-profile query, and rendering component remain available for later curated prose.
- Moved measurements immediately below photography/selection. Retained the additional-measurement disclosure, removed the unclear generic diagram, and added an accessible definition dialog. The interim 116 mm versus 100 mm reference was subsequently removed and replaced by the Phase 2.2 calibrated skull comparison.
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

## 4. Phase 2 acceptance gate

| Requirement | State | Evidence |
|---|---|---|
| Complete source → validation → generated data/media → static route journey | Pass locally | One published taxon, one specimen, six specimen assets, one comparison reference, zero reviewed profiles; taxon, exact-specimen, and preparation-guide routes prerender |
| Invalid representative fixtures fail actionably | Pass locally | Five deliberate relationship/date/rights/media/observation failures report source, key/field, rule, and correction guidance |
| No EXIF/GPS or archival source reaches public output | Pass locally | All six specimen WebPs plus the human reference pass EXIF/IPTC/XMP inspection; both source PNG sets remain ignored |
| Refined desktop/mobile/landscape interactions and presentation pass | Pass locally | Nine Playwright journeys plus manual 1440 × 696, 1440 × 900, 390 × 844, and 844 × 390 review; desktop and touch pinch paths included |
| Canonical docs, Git scope, branch, and remote CI agree | **Checkpoint pending** | Canonical docs are reconciled and staging/generated/browser output remains ignored; only curated public derivatives are in checkpoint scope; remote CI awaits the Phase 2.2 push |
| Owner approves refined visual direction, density, interactions, and wording | **Pending** | Requires explicit approval after reviewing the Phase 2.2 result |

**Gate conclusion:** The refined Phase 2.2 technical/product requirements pass locally. The checkpoint/remote-CI item and explicit owner approval remain open, so the full Phase 2 gate is not yet closed and Phase 3 remains blocked.

## 5. Representative record decisions

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
| Comparison reference | `adult-human-skull`; right-facing; six approximate values; default | Owner supplied the staged image and functional specification; the declaration makes measurement uncertainty, orientation, credit, and rights explicit |
| Rendering | static App Router/RSC plus gallery, comparison, selector, and guide-dialog client islands | Preserves useful static/no-JavaScript content while isolating genuine interaction |
| Production compiler | `next build --webpack` | Pinned Turbopack production build did not terminate reliably in Phase 2; webpack remains deterministic and verified |

## 6. Verification evidence in this refinement

| Gate | Most recent evidence | Status |
|---|---|---|
| Exact toolchain/install | Node `v24.18.0`; pnpm `11.21.0`; `CI=true pnpm install --frozen-lockfile` restored all 470 pinned packages from the verified lockfile/store | Pass |
| Content build | `pnpm content:build`: 1 taxon, 1 specimen, 6 specimen media assets, 1 comparison reference, 0 reviewed profiles (1 profile source) | Pass |
| Media | `pnpm validate:media`: 6 specimen assets plus 1 reference, sRGB/alpha/bounds valid, no EXIF/IPTC/XMP | Pass |
| Invalid fixtures | `pnpm test:fixtures`: 5 expected failures detected | Pass |
| Types/lint/tests | `pnpm typecheck`; `pnpm lint`; `CI=true pnpm test`: 4 files / 16 tests, including scaling invariants, bounds offsets, orientation, ratio wording, dynamic selection, and profile-citation state | Pass |
| Production build | `CI=true pnpm build`: 7 static routes including both specimen forms and `/guides/skull-preparation` | Pass |
| Browser/accessibility | `CI=true PLAYWRIGHT_PORT=3102 pnpm test:e2e`: 9 Chromium journeys in 17.4 s; axe violations `[]`; desktop geometry/optical inset, unchanged alternate views, master delivery, inspector gesture isolation/navigation, all mobile controls/gestures/dialogs, true-scale ratios, selector, guide route, reduced motion, third-party boundary, and no-JavaScript covered | Pass |
| Manual visual/responsive | Playwright CLI at 1440 × 696, 1440 × 900, 390 × 844, and 844 × 390: no horizontal overflow; complete larger anatomy; lateral visible-subject gaps approximately 50 px top/53 px bottom at the primary viewport; visible controls; aligned scrollable rail; coherent comparison/difference layouts; exact 116/182 visual ratio; corrected dialogs; portrait/short-landscape framing unchanged | Pass |
| Local-network regression | Fresh `dev:network` sessions at loopback and the Mac LAN IPv4: zero console errors and `Next` remained on `2 / 6 · Oblique` instead of resetting through HMR reload | Pass |
| Remote CI | Phase 2.2 checkpoint not pushed yet; prior Phase 2.1 commit [`1fcf7c6`](https://github.com/Rasmus-allesoee/skull_website/commit/1fcf7c6777530a8443f32d109b4b9de28107a3bc) and run [31850640194](https://github.com/Rasmus-allesoee/skull_website/actions/runs/31850640194) remain the latest remote evidence on draft [PR #4](https://github.com/Rasmus-allesoee/skull_website/pull/4) | Pending |

Package-manager gates must run sequentially with `CI=true` in non-interactive environments; concurrent pnpm commands can reconcile `node_modules` against different lifecycle states and are not a valid speed optimization.

## 7. Known limitations and controls

- Only one taxon/specimen exists. Home remains a phase entrance, not the Phase 3 museum shell/catalog; related-family and random discovery sections therefore have no honest content yet.
- No class/order/family/genus landings, catalog, search, map, full ingestion, deployment, analytics, 360°, 3D, upload, or AI overlay has started.
- The calibrated card is a true relative comparison between visible skull subjects; it does not calibrate the visitor's monitor so displayed CSS pixels are not literal real-world millimetres.
- Only one collection specimen is published, so the live selector currently offers only the adult-human default. Its reusable dynamic-specimen path is covered with synthetic test records and will gain real options as reviewed default specimens are ingested.
- The adult-human dimensions are explicitly approximate representative values and not a universal adult average. A future source-methodology review may refine the reference without changing the comparison architecture.
- Measurement definitions are a quick field guide, not a reproducible anatomical protocol. Dedicated illustrated methodology remains future content.
- The age and condition dialogs are general collection criteria. Future methodology must cite them, explain species variation, and add reviewed real-skull examples.
- The preparation route is a labelled shell, not actionable chemical, biological, legal, or safety guidance.
- The current editorial profile is intentionally absent from the public page; GBIF taxonomy evidence remains available in structured data but is not expanded into low-value prose.
- Footer copyright starts at 2026 because no repository evidence supports a 2023 publication start; the start year can change only with owner-supplied evidence/preference.
- Chrome/Chromium is the Phase 2 browser target. Firefox/WebKit and formal 200%/forced-colors/screen-reader release checks remain Phase 7 gates.
- The connected GitHub app previously returned `403 Resource not accessible by integration` for issue/PR writes; the authenticated local `gh` session remains the established remote-write path.

## 8. Exact next action

1. Complete/publish the Phase 2.2 checkpoint and verify its GitHub Actions run.
2. The owner reviews `/species/raccoon-dog` at desktop Chrome 100% zoom, mobile portrait, and mobile landscape, including the taller gallery, all six views, inspection gestures, comparison selector/table, measurement/age/condition dialogs, additional data, preparation link, and footer wording. For real-device development, run `pnpm dev:network` and open the Mac's LAN-IP URL—not `0.0.0.0`; `pnpm preview:network` is the production-like alternative.
3. The owner either requests another bounded Phase 2 correction or explicitly approves the refined visual direction, density, interactions, record vocabulary, and public wording.
4. Record approval here, close the Phase 2 issue/milestone, and merge/checkpoint only as directed.
5. Begin Phase 3 only after separate authorization.

No new metadata, source measurements, or images are required merely to review/approve Phase 2.2. The later illustrated methodology requires owner-created/reviewed assets; real collection choices in the comparison selector and related/random sections require additional reviewed taxa/specimens and belong to later authorized work.

## 9. Decision/blocker protocol

- A failing test or lint rule is implementation work, not automatically a blocker.
- A decision that changes public identity, rights, data publication, scope, or external account state is surfaced to the owner.
- Blockers record what was tried, exact evidence, safe work completed, and the smallest required owner action.
- When resolved, retain a short resolution in the checkpoint log rather than deleting history.

## 10. Checkpoint log

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

### 2026-08-15 — Phase 2.2 second owner-feedback refinement in progress

- The owner supplied exact gallery/inspector/mobile/dialog corrections plus a detailed reusable true-to-scale comparison specification, adult-human staging reference, and visual mockups.
- The gallery, inspector, LAN-device workflow, measurement layout, comparison pipeline/UI, schema version 3, dialog alignment, automated coverage, and canonical documents were updated without starting Phase 3.
- Local automated and manual evidence passes. The Phase 2.2 Git checkpoint, GitHub Actions result, and owner visual approval are deliberately left as the remaining gate items until their evidence exists.

### 2026-08-16 — lateral hero optical alignment correction

- Owner review found that the lateral skull's visible mass sat too close to the top frame edge. A desktop-height, lateral-only optical offset now balances top/bottom negative space without affecting the underlying asset, calibrated comparison, inspection, thumbnails, other views, or short mobile landscape.
- The normal-window browser gate now asserts the deliberate inset so this framing correction cannot silently regress.

Future entries stay concise and evidence-based. Git history owns file-level chronology; this ledger owns phase outcomes, decisions, blockers, and next action.
