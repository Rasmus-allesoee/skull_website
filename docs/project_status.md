# Project status

**Snapshot date:** 2026-08-20

**Current phase:** Phase 3 — implementation and complete local technical/visual gate pass; owner review pending

**Overall state:** Local implementation and acceptance evidence pass on `agent/phase-3-museum-shell-catalog`; no Phase 3 commit, push, PR, remote CI, or owner product approval yet

**Next phase:** Phase 4 — not started and not authorized; first resolve Phase 3 owner review

## 1. Current objective

Present the complete Phase 3 museum shell, catalog, taxonomy routes, and class-aware measurement system for owner inspection. Apply bounded Phase 3 feedback or record explicit approval before committing/publishing the checkpoint or beginning Phase 4 search/faceted discovery.

## 2. Phase 3 implementation

### Repository and phase boundary

- Verified GitHub draft PR #4 was merged and local `main` already matched merge commit `8c2413467f9d68ab29009fe9513c134e7226f2e7` before implementation.
- Created `agent/phase-3-museum-shell-catalog` from that exact base. Phase 3 changes remain local and unstaged because this task did not explicitly authorize commit, push, PR creation, or remote writes.
- Phase 4 search/facets, Phase 5 MapLibre/editorial work, Phase 6 row/media ingestion, and Phase 7 production remain unstarted.

### Museum shell and Home

- Replaced the temporary phase entrance with the final static museum shell: central site configuration, skip link, responsive header/active navigation, native mobile menu, context-aware footer, and one consistent shell across Home, catalog, taxonomy, guide, taxon, specimen, and not-found pages.
- Home now uses the reviewed lateral skull as the visual lead and derives published taxon/specimen/class counts from canonical records. It provides a real catalog entry, class entry cards, featured display, an honest non-interactive geographic record preview, and only real or clearly unavailable editorial destinations.
- Added central page-metadata helpers, absolute canonical/Open Graph metadata based on `NEXT_PUBLIC_SITE_URL`, default social imagery, static sitemap, robots, and a useful record-not-found route. No false loading skeleton or runtime error surface was added because the route family is static and has no genuine latency.

### Catalog, taxonomy, and discovery foundation

- Added pure catalog queries for published records, deterministic common/scientific sorting, class entries, rank nodes/lineages, taxonomy landings, taxon/specimen card modes, current/previous slug resolution, public route paths, coordinate-bearing specimen summaries, and bounded related suggestions.
- `/species` now renders live counts, class entries, a compact class/order/family/genus index, and a responsive species gallery. Specimen-card mode is implemented and tested as the Phase 4 view-mode foundation without prematurely adding interactive controls.
- One shared `/taxonomy/[rank]/[slug]` template statically generates class, order, family, and genus pages with parent breadcrumbs, immediate children, scoped descendant index, and scoped gallery. The compiler now rejects conflicting repeated hierarchy name/slug/parent declarations before those URLs are generated.
- Taxon and exact-specimen pages use the shared shell, link every breadcrumb rank, preserve canonical default/exact semantics, redirect explicit previous slugs, and render related results only when deterministic non-current records exist. The one-record live collection therefore shows no empty suggestion placeholder.

### Class-aware measurement architecture

- Kept the canonical two-table architecture. `specimens.csv` now contains the reviewed mammal and bird measurement value/status pairs; no parallel bird specimen table was introduced.
- Advanced `CompiledCollection` to schema version 4. Mammal, bird, and conservative `other` profiles are derived from the linked taxon's class and control applicability, primary/additional table rows, and measurement-definition guidance.
- Validation now requires applicable blank fields to remain `not_recorded`, requires out-of-profile fields to be blank/`not_applicable`, and reports profile mismatches actionably. The published raccoon-dog row was migrated without changing any known measurement value.
- The comparison difference engine now selects six mammal rows, nine bird rows, six bidirectional bird/mammal mappings, or four shared fallback rows. Cross-class width and height name both landmarks and display a limitation note; they are not presented as homologous dimensions.
- Comparison-reference declaration schema version 2 now records its measurement profile. The adult-human record remains a mammal reference with its existing six approximate values; non-applicable bird fields compile explicitly.
- `agent_context/metadata_csv/` is ignored migration evidence. Its partial rows were not ingested because legacy IDs, taxonomy, dates, notes, rights, and media still need the Phase 6 review workflow.

### Phase 3 acceptance result

| Requirement | State | Evidence |
|---|---|---|
| Home → class → family → taxon → exact specimen keyboard/mobile journey | Pass locally | Production Chromium journey at 390 × 844 activates every link with keyboard Enter and reaches `/species/raccoon-dog/specimens/SPEC-0001` |
| Correct static names, links, metadata, defaults, redirects, and draft exclusion | Pass locally | Pure query/component tests plus a 14-output static build; sitemap/robots and not-found are browser-tested; canonical URLs are absolute and route-correct |
| Mammal, bird, long-name, uncertain, missing-media, and multiple-specimen states | Pass locally | Live mammal route plus typed unit/component fixtures verify bird profile/matrix, resilient wrapping, explicit uncertainty, missing lateral placeholder, draft exclusion, and exact multi-specimen links |
| Responsive/accessibility/no-JavaScript behavior | Pass locally | 13/13 Playwright journeys, axe violations `[]`, static no-JavaScript catalog/taxonomy/specimen content, and manual 1440 × 900/390 × 844 review with no horizontal overflow |
| Owner approves scaled museum/catalog direction | Pending | This handoff is the first owner inspection of Phase 3 |

**Gate conclusion:** The Phase 3 implementation and complete local technical/visual acceptance gate pass. The product gate remains open for owner review. Phase 4 must not begin yet.

## 3. Phase 2.3 implementation

### Comparison copy and uncertainty

- Removed the low-value sentence explaining shared physical scale and transparent margins from the `A sense of scale` heading.
- Confirmed and regression-tested that the adult-human description comes from the selected reference record. Selecting a measured specimen with no note removes that text.
- Confirmed and regression-tested that the difference-level approximation explanation appears only when at least one available displayed difference uses an approximate source value; measured specimen pairs do not inherit it.

### Mobile gestures

- Changed the ordinary gallery stage from restrictive `pan-y` to full browser `manipulation` (`pan-x pan-y pinch-zoom`). Pinch can now translate while scaling, and a zoomed visual viewport can pan horizontally, vertically, or diagonally inside the large image frame.
- Moved gallery swipe/double-tap recognition to single-touch completion at approximately 100% page scale. Zoomed-page pans and multi-touch gestures remain browser-owned and cannot become stray view switches or inspection opens.
- Added horizontal touch swipe between inspection views at 100% zoom. Once the image is enlarged, one finger continues to pan; two fingers continue to zoom the image.
- Updated the inspection hint and added production-browser coverage for native page pinch, two-dimensional page pan after zoom, 100%-scale gallery swipe, and inspection swipe.

### Deferred specimen map

- Kept MapLibre out of Phase 2. Phase 5 now explicitly adds a `View on map` action near Collection record location data, targeting `/map?specimen={id}` so the central map route owns marker/list selection and the textual record remains the accessible equivalent.

## 4. Phase 2.2 implementation

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

## 5. Phase 2.1 implementation (retained foundation)

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

## 6. Phase 2 acceptance gate

| Requirement | State | Evidence |
|---|---|---|
| Complete source → validation → generated data/media → static route journey | Pass locally | One published taxon, one specimen, six specimen assets, one comparison reference, zero reviewed profiles; taxon, exact-specimen, and preparation-guide routes prerender |
| Invalid representative fixtures fail actionably | Pass locally | Five deliberate relationship/date/rights/media/observation failures report source, key/field, rule, and correction guidance |
| No EXIF/GPS or archival source reaches public output | Pass locally | All six specimen WebPs plus the human reference pass EXIF/IPTC/XMP inspection; both source PNG sets remain ignored |
| Refined desktop/mobile/landscape interactions and presentation pass | Pass locally | Ten Playwright journeys plus final desktop/mobile visual review; real-touch coverage includes 100%-scale gallery swipe, pinch scaling with two-finger translation, post-zoom horizontal/vertical/diagonal pan, and inspection swipe |
| Canonical docs, Git scope, branch, and remote CI agree | Pass | Canonical Phase 2.3 docs and scope are reconciled; implementation commit `83d577b` passed GitHub Actions run `32063339841`; PR #4 later merged through its protected path |
| Owner approves refined visual direction, density, interactions, and wording | Pass | Owner answered `YES I APPROVE!` on 2026-08-17 after reviewing Phase 2.3 |

**Gate conclusion:** The complete Phase 2 technical, visual, and owner-approval gate passed. Phase 2 closed before the separately authorized Phase 3 work recorded above.

## 7. Representative record decisions

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
| Measurement profiles | Mammal, bird, conservative `other`; unified specimen CSV; schema version 4 | The linked taxon's class owns applicability; separate class-specific specimen tables would duplicate identity and provenance |
| Rendering | static App Router/RSC plus gallery, comparison, selector, and guide-dialog client islands | Preserves useful static/no-JavaScript content while isolating genuine interaction |
| Production compiler | `next build --webpack` | Pinned Turbopack production build did not terminate reliably in Phase 2; webpack remains deterministic and verified |

## 8. Phase 3 verification evidence

| Gate | Most recent evidence | Status |
|---|---|---|
| Exact toolchain/install | Node `v24.18.0`; pnpm `11.21.0`; `CI=true pnpm install --frozen-lockfile` restored all 470 pinned packages from the verified lockfile/store | Pass |
| Content build | `pnpm content:build`: 1 taxon, 1 specimen, 6 specimen media assets, 1 comparison reference, 0 reviewed profiles (1 profile source) | Pass |
| Media | `pnpm validate:media`: 6 specimen assets plus 1 reference, sRGB/alpha/bounds valid, no EXIF/IPTC/XMP | Pass |
| Invalid fixtures | `pnpm test:fixtures`: 6 expected failures detected, including class-profile mismatch | Pass |
| Types/lint/tests | `pnpm typecheck`; `pnpm lint`; `CI=true pnpm test`: 6 files / 25 tests covering compiler schema 4, hierarchy/catalog queries, drafts, stable suggestions, card variants, bird measurement presentation, comparison matrices, long/uncertain/missing/multiple states, and retained Phase 2 behavior | Pass |
| Production build | `CI=true pnpm build`: 14 static outputs; Home, not-found, guide, robots, sitemap, catalog, taxon, exact specimen, and four taxonomy ranks all prerender | Pass |
| Browser/accessibility | `CI=true PLAYWRIGHT_PORT=3102 pnpm test:e2e`: 13/13 Chromium journeys in 20.8 s; axe violations `[]`; Home/catalog, mobile keyboard taxonomy journey, no-JavaScript routes, SEO outputs/404, deep links, gallery/inspection/gesture/geometry, comparison, reduced motion, and third-party boundary covered | Pass |
| Manual visual/responsive | Playwright CLI at 1440 × 900 and 390 × 844 reviewed Home, catalog, family landing, mobile menu, exact specimen, and lazy-loaded comparison. No horizontal overflow or console errors; one normal Next image-preload timing warning only | Pass |
| Git/base audit | GitHub PR #4 verified merged; local Phase 3 branch created from matching merge commit `8c2413467f9d68ab29009fe9513c134e7226f2e7`; generated/raw/private paths remain ignored | Pass |
| Remote Phase 3 CI | No Phase 3 commit, push, or PR was authorized in this task | Not run; not a local implementation blocker |
| Complete local gate | `CI=true pnpm check`, `CI=true pnpm build`, and complete Playwright pass after final documentation/code reconciliation | Pass after the final commands recorded in this section |

Package-manager gates must run sequentially with `CI=true` in non-interactive environments; concurrent pnpm commands can reconcile `node_modules` against different lifecycle states and are not a valid speed optimization.

## 9. Known limitations and controls

- Only one reviewed taxon/specimen exists. The museum shell/catalog and all four rank routes are real, but related suggestions intentionally remain absent and visual variety is fixture-tested rather than publicly inspectable.
- Search/facets/result-mode controls (Phase 4), interactive map/editorial routes (Phase 5), full ingestion (Phase 6), deployment/release checks (Phase 7), analytics, 360°, 3D, uploads, and AI overlays have not started.
- Home's search-looking entry is a clearly labelled catalog link, not a fake text input. Home's geographic preview is explicitly non-interactive and non-cartographic; the specimen `View on map` action remains deferred until the accessible `/map?specimen={id}` route exists.
- The partial `metadata_csv` exports are ignored and unreviewed. Their bird values validate the schema design but are not public records, and no raw row-number identity is accepted.
- The calibrated card is a true relative comparison between visible skull subjects; it does not calibrate the visitor's monitor so displayed CSS pixels are not literal real-world millimetres.
- Only one collection specimen is published, so the live selector currently offers only the adult-human default. Its reusable dynamic-specimen path is covered with synthetic test records and will gain real options as reviewed default specimens are ingested.
- The adult-human dimensions are explicitly approximate representative values and not a universal adult average. A future source-methodology review may refine the reference without changing the comparison architecture.
- Measurement definitions are a quick field guide, not a reproducible anatomical protocol. Dedicated illustrated methodology remains future content.
- The age and condition dialogs are general collection criteria. Future methodology must cite them, explain species variation, and add reviewed real-skull examples.
- The preparation route is a labelled shell, not actionable chemical, biological, legal, or safety guidance.
- The current editorial profile is intentionally absent from the public page; GBIF taxonomy evidence remains available in structured data but is not expanded into low-value prose.
- Footer copyright starts at 2026 because no repository evidence supports a 2023 publication start; the start year can change only with owner-supplied evidence/preference.
- Chrome/Chromium is the current phase browser target. Firefox/WebKit and formal 200%/forced-colors/screen-reader release checks remain Phase 7 gates.
- `NEXT_PUBLIC_SITE_URL` still defaults to `http://localhost:3000`; the final domain is a Phase 7 decision. Canonical/Open Graph/sitemap URLs are structurally complete but intentionally use that default locally.
- The Phase 3 branch has no local commit or remote PR yet. That is intentional authorization scope, not a code/test blocker.

## 10. Exact next action

1. The owner runs the local site and inspects Home, `/species`, at least one taxonomy landing, the taxon page, and the exact specimen page at desktop and mobile widths.
2. The owner either supplies one bounded Phase 3 feedback task or explicitly approves Phase 3.
3. After approval and explicit Git authorization, create the coherent commit, push the Phase 3 branch, open/update the draft PR, and verify remote CI. Only then close the Phase 3 gate and plan Phase 4.

No new metadata, measurements, or images are required to review/approve Phase 3. To make a later public bird route or real multi-record search/suggestion review possible, Phase 6 will need completed/reviewed canonical identity, taxonomy, media, rights, dates, and publication decisions—not merely the current partial exports. Illustrated methodology still requires owner-created/reviewed landmark imagery and cited content.

## 11. Decision/blocker protocol

- A failing test or lint rule is implementation work, not automatically a blocker.
- A decision that changes public identity, rights, data publication, scope, or external account state is surfaced to the owner.
- Blockers record what was tried, exact evidence, safe work completed, and the smallest required owner action.
- When resolved, retain a short resolution in the checkpoint log rather than deleting history.

## 12. Checkpoint log

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
- Local automated and manual evidence passes. Implementation commit `b1de049` passed GitHub Actions run `31916200967`; owner visual approval is the only remaining Phase 2 gate item.

### 2026-08-16 — lateral hero optical alignment correction

- Owner review found that the lateral skull's visible mass sat too close to the top frame edge. A desktop-height, lateral-only optical offset now balances top/bottom negative space without affecting the underlying asset, calibrated comparison, inspection, thumbnails, other views, or short mobile landscape.
- The normal-window browser gate now asserts the deliberate inset so this framing correction cannot silently regress.

### 2026-08-17 — Phase 2.3 completed and owner-approved

- The owner approved the Phase 2.2 direction subject to three small corrections: remove redundant scale copy and verify conditional uncertainty wording; restore native page pinch over the main mobile image; and add mobile swipe navigation inside inspection.
- The owner also deferred a specimen-location map action to Phase 5. Canonical plans now connect Collection record locations to `/map?specimen={id}` without introducing MapLibre on specimen routes.
- The complete local gate passes: quality checks, 7-route production build, real-touch mobile coverage, five-run desktop isolation stress check, 10/10 final browser journeys, responsive visual review, and zero console errors. Implementation commit `83d577b` passed GitHub Actions run `32063339841`; documentation checkpoint `a89b723` passed run `32064897700`.
- The owner explicitly answered `YES I APPROVE!` on 2026-08-17. This closed the Phase 2 product gate; PR #4 was subsequently merged as commit `8c2413467f9d68ab29009fe9513c134e7226f2e7` before Phase 3 began.

### 2026-08-20 — Phase 3 implemented locally; owner review pending

- The owner explicitly authorized all of Phase 3 and supplied a class-aware mammal/bird measurement design plus partial spreadsheet exports for future migration.
- `agent/phase-3-museum-shell-catalog` now contains the static museum shell/Home/catalog/rank routes, shared query/card architecture, SEO routes, schema-version-4 measurement profiles, and class-aware comparison matrices. Phase 4 and bulk ingestion were not started.
- The complete local quality/build/browser gate and manual desktop/mobile review pass. The change remains uncommitted/unpublished pending owner inspection and explicit Git authorization; owner product approval is the only current Phase 3 gate item.

Future entries stay concise and evidence-based. Git history owns file-level chronology; this ledger owns phase outcomes, decisions, blockers, and next action.
