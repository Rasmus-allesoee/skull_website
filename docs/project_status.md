# Project status

**Snapshot date:** 2026-08-24

**Current phase:** Combined Phase 3.2 Species-catalog redesign and Phase 4 search/faceted discovery — complete local technical/visual gate pass; owner review pending

**Overall state:** The owner approved Phase 3.1 at `ce7dbc3`; the combined Phase 3.2/4 implementation is preserved as a separate verified local checkpoint on `agent/phase-3-museum-shell-catalog`, with no push/PR or remote CI authorized

**Next phase:** Not authorized. First obtain owner review of the combined catalog/discovery checkpoint. The comprehensive interactive tree is reclassified as optional Phase 3.3; Phase 5 remains the next critical-path milestone unless the owner separately prioritizes Phase 3.3.

## 1. Current objective

Present the verified catalog-first `/species` redesign, complete Phase 4 discovery behavior, right-facing SPEC-0003/0013/0018 media correction, and reconciled documentation for owner inspection. Keep the checkpoint local and do not begin Phase 3.3 or Phase 5.

## 2. Combined Phase 3.2 catalog redesign and Phase 4 discovery

### Catalog-first information architecture

- Replaced the large editorial `/species` sequence with a short Collection catalog heading, sticky operational controls, and immediate published results. At 1440 × 900 the first card begins within the first viewport; the default grid remains three/two/one columns without horizontal overflow.
- One control region now owns the labelled search combobox, Species/Specimens radio mode, compact All classes/Aves/Mammalia presets, Filters, Sort, Browse taxonomy, result count, active chips, and Clear all. The Home discovery action targets this real control instead of an honest future-search placeholder.
- Default species browsing remains family-grouped. A query or explicit common/scientific/numeric sort flattens results into one global order; numeric sorts are available only for physical specimens and place unknown measurements last.
- Species cards remain one per taxon, preserve default-display links and the compact exact-specimen chooser, and report matched specimen count/length/mass range while feature filters are active. Specimen cards expose immutable ID, maximum length, prepared mass, and concise location/date wording.

### Complete search, facets, and URL behavior

- Pinned `@orama/orama` 3.1.18 and added a deterministic schema-v1 artifact with 67 documents: 34 canonical rank nodes, 15 published taxa, and 18 published specimens. Draft/blocked records and the draft profile remain absent.
- Search normalizes case, punctuation, whitespace, and Danish diacritics without changing display text; deterministic reranking covers exact, prefix, alias, credible fuzzy, and optional reviewed-profile tiers. Scientific, English, Danish/ASCII, aliases, taxonomy, and specimen IDs are tested.
- Suggestions group ranks, taxa, and physical specimens and show canonical lateral thumbnails, display names, scientific/Danish context, and result type. Arrow/Enter/Escape, live status, touch/click, exact specimen navigation, rank filtering, and explicit rank-page links are implemented. The autocomplete surface is constrained to the available viewport height and hands boundary wheel scrolling back to the page immediately while retaining native touch scroll chaining.
- Feature facets cover sex, age, condition, and defleshing method with live canonical counts. Maximum-length and prepared-mass ranges exclude `not_recorded`/`not_applicable` rather than treating them as zero. Empty states explain exclusion and offer clear/switch-mode recovery.
- URL state includes query, mode, class, taxonomic scope, controlled-value filters, numeric bounds, and sort. Invalid tokens/ranges are rejected; direct load, reload, back, and forward restore the same result state. Filter/taxonomy-panel open state is deliberately transient.
- Orama code and `/generated/catalog-search-v1.json` load only after a non-empty query. The default static catalog, cards, and complete no-JavaScript taxonomy links remain useful without the index or client JavaScript.

### One taxonomy source and deferred comprehensive tree

- The required class → order → family → genus → terminal-taxon taxonomy surface is one responsive component: sticky alongside-grid sidebar on wide screens, labelled focus-trapped drawer on narrow screens, and a native `<details>` nested-list fallback without JavaScript.
- Every rank has separate expand/collapse, Filter catalog, and Open rank page actions; exact node/count/route data comes from the same canonical view model as rank pages, cards, and search documents.
- The richer branching/pan/zoom/group-preview experience is reclassified as Phase 3.3. It must enhance, not replace, the current drawer/list and cannot introduce unsupported group characteristics, clades, or divergence claims.

### Corrected media orientation

- Reconciled the six left-facing committed derivatives for SPEC-0003, SPEC-0013, and SPEC-0018 with their already right-facing reviewed clean masters. Restaging all 104 approved PNGs and running the ordinary processor changed only each named specimen's lateral and oblique WebPs.
- The pipeline—not a manual public-file edit or display-time CSS exception—recomputed alpha subject bounds, converted to sRGB, stripped metadata, and validated the complete 104-asset collection plus comparison reference. Cards, suggestions, specimen galleries, and calibrated presentation therefore share the corrected assets and framing.

## 3. Phase 3.1 refinement

### Review-quality collection expansion

- Inventoried 22 legacy taxon rows, 51 specimen rows, and 104 cleaned PNGs. The images resolve to 18 physical specimens representing 15 taxon identities: 13 species-level records and two deliberate genus-level identifications (`Gavia sp.` and `Larus sp.`).
- Published 15 canonical taxa and 18 canonical specimens that meet the current contract. The three multi-specimen taxa are European badger (2), harbour seal (3), and the remaining taxa with one specimen each. All 15/18 are public; there are zero canonical draft taxon/specimen rows and one retained draft editorial profile.
- Left 33 legacy specimen rows as blocked migration candidates rather than manufacturing canonical drafts. Seven raw taxon rows remain outside the slice: unsupported family-level `Cervidae`, plus *Cervus elaphus*, *Martes martes*, *Oryctolagus cuniculus*, *Ovis aries*, *Phocoena phocoena*, and *Sorex araneus* without accepted matching essential-media sets.
- Assigned stable `TAX-0002`–`TAX-0015` and `SPEC-0002`–`SPEC-0018` identities independent of raw row numbers. These IDs now own public URL semantics and must be preserved in Phase 6.
- Refreshed and manually accepted dated GBIF snapshots for the 14 new taxa. Species matches are exact/accepted; the two genus records retain explicit `sp.`/unassessed labels instead of pretending to species precision.
- Added 17 media declarations and a reproducible 104-entry local staging map. The existing processor generated 104 validated WebPs (24.80 MiB total specimen media); every lateral asset is explicitly right-facing and alpha-bounded. `SPEC-0002`, `SPEC-0005`, `SPEC-0011`, and `SPEC-0017` honestly warn that the optional frontal view is absent.
- Normalized dates/coordinates/controlled tokens conservatively and copied only compatible measurements. Ambiguous body mass, raw numeric tooth counts, private-style notes, and unreviewed preparation durations were not converted into public claims. Details are durable in `phase_3_1_migration_audit.md`.

### Home, catalog, and taxonomy refinement

- Home now reports six live published-collection statistics (13 species, 18 specimens, 2 classes, 6 orders, 11 families, 15 genera), retains hero/search/geographic/editorial pathways, and removes the redundant standalone Featured specimen section.
- Class cards now give every alpha-bounded skull deliberate top/bottom breathing room. The rule also applies to taxonomy-tree and compact specimen thumbnails.
- Home and `/species` now share a server-rendered class → order → family tree foundation built from the same canonical rank nodes/routes as the ordinary taxonomy-list alternative. No group traits, clades, or divergence estimates were invented.
- Phase 3.1 gave `/species` a prominent honest discovery pathway above class browsing; the approved Phase 3.2/4 checkpoint has now replaced it with the functioning catalog control region.
- Published galleries use a three/two/one-column responsive grid. All-species and class/order scopes are separated by family headings and family-route links; family/genus landings retain one unsegmented grid.
- Multi-specimen taxon cards keep the card's main link pointed at the reviewed default display and add a compact native chooser. It exposes thumbnail, immutable ID/default state, age, sex, maximum length, and exact nested links without repeating species names.
- Scientific labels render genus records as italicized genus plus roman `sp.`. Static metadata no longer falsely promises six views for the four five-view records.

### Future comprehensive tree boundary

- Added `interactive_taxonomic_tree.md`; the owner later reclassified its comprehensive visualization from Phase 3.2 to Phase 3.3. It owns richer branching, keyboard/pan/zoom/reset, optional group previews, tree/list parity, and any sourced characteristics/divergence content.
- Phase 3.1 remains the original compact linked foundation. The combined Phase 3.2/4 work now supplies the complete genus/taxon semantic drawer/list required before any optional Phase 3.3 visual enhancement.

## 4. Phase 3.0 implementation

### Repository and phase boundary

- Verified GitHub draft PR #4 was merged and local `main` already matched merge commit `8c2413467f9d68ab29009fe9513c134e7226f2e7` before implementation.
- Created `agent/phase-3-museum-shell-catalog` from that exact base. After the owner authorized a separate pre-refinement checkpoint, Phase 3.0 was committed locally as `9a1d996` before any Phase 3.1 edit. It has not been pushed and has no remote PR/CI.
- At the Phase 3.0 checkpoint, Phase 4 search/facets, Phase 5 MapLibre/editorial work, Phase 6 row/media ingestion, and Phase 7 production were unstarted.

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
| Owner approves scaled museum/catalog direction | Passed into refinement | Owner approved most of Phase 3.0 and supplied the bounded Phase 3.1 corrections/features on 2026-08-21 |

**Gate conclusion:** Phase 3.0's complete local technical/visual gate passed and the owner review opened Phase 3.1. Phase 3.0 is preserved separately; Phase 4 did not begin.

## 5. Phase 2.3 implementation

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

## 6. Phase 2.2 implementation

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

## 7. Phase 2.1 implementation (retained foundation)

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

## 8. Phase 2 acceptance gate

| Requirement | State | Evidence |
|---|---|---|
| Complete source → validation → generated data/media → static route journey | Pass locally | One published taxon, one specimen, six specimen assets, one comparison reference, zero reviewed profiles; taxon, exact-specimen, and preparation-guide routes prerender |
| Invalid representative fixtures fail actionably | Pass locally | Five deliberate relationship/date/rights/media/observation failures report source, key/field, rule, and correction guidance |
| No EXIF/GPS or archival source reaches public output | Pass locally | All six specimen WebPs plus the human reference pass EXIF/IPTC/XMP inspection; both source PNG sets remain ignored |
| Refined desktop/mobile/landscape interactions and presentation pass | Pass locally | Ten Playwright journeys plus final desktop/mobile visual review; real-touch coverage includes 100%-scale gallery swipe, pinch scaling with two-finger translation, post-zoom horizontal/vertical/diagonal pan, and inspection swipe |
| Canonical docs, Git scope, branch, and remote CI agree | Pass | Canonical Phase 2.3 docs and scope are reconciled; implementation commit `83d577b` passed GitHub Actions run `32063339841`; PR #4 later merged through its protected path |
| Owner approves refined visual direction, density, interactions, and wording | Pass | Owner answered `YES I APPROVE!` on 2026-08-17 after reviewing Phase 2.3 |

**Gate conclusion:** The complete Phase 2 technical, visual, and owner-approval gate passed. Phase 2 closed before the separately authorized Phase 3 work recorded above.

## 9. Representative record decisions

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

## 10. Verification evidence

| Gate | Most recent evidence | Status |
|---|---|---|
| Exact toolchain/install | Node `v24.18.0`; pnpm `11.21.0`; `CI=true pnpm install --frozen-lockfile` passes from the exact lockfile with pinned Orama 3.1.18 | Pass |
| Content/search build | `pnpm content:build`: 15 taxa, 18 specimens, 104 specimen assets, 67 search documents, 1 comparison reference, 0 reviewed profiles (1 profile source); only four expected optional-frontal warnings | Pass |
| Media | Full restage/process plus `pnpm validate:media`: 104 specimen assets plus 1 reference, 24.83 MiB, sRGB/alpha/bounds valid, no EXIF/IPTC/XMP; Git shows only the six requested right-facing derivative changes | Pass |
| Invalid fixtures | `pnpm test:fixtures`: 6 expected failures detected, including class-profile mismatch | Pass |
| Types/lint/tests | Final `CI=true pnpm check`: formatting, ESLint, content/media/type checks, 10 files / 40 tests, and 6 invalid fixtures pass; search ranking, artifact determinism, state parsing, filtering/sorting/missing semantics, taxonomy/cards, class-aware measurements, and retained behavior are covered | Pass |
| Production build | Final `CI=true pnpm build`: 75 static outputs; Home, not-found, guide, robots, sitemap, catalog, 15 taxon paths, 18 exact specimen paths, and 34 rank paths prerender | Pass |
| Browser/accessibility | Final `PLAYWRIGHT_PORT=3102 pnpm test:e2e`: 25/25 Chromium journeys; includes multilingual/alias/fuzzy/ID/rank search, viewport-constrained autocomplete suggestions with page-scroll handoff, facets, numeric missing semantics, modes/sorts, URL reload/history, taxonomy drawer/fallback, desktop/mobile/reflow, reduced motion, forced colors, keyboard, exact links, all six corrected lateral/oblique gallery frames, and axe `[]` under normal-color evaluation | Pass |
| Post-fix focused checks | Prettier, ESLint, TypeScript, catalog Vitest suite (15 tests), fresh `pnpm build`, and the new autocomplete regression all pass | Pass |
| Manual visual/responsive | Production Playwright review at 1440 × 900 and 390 × 844 covers default catalog density, search suggestions, filters, wide sidebar/mobile drawer, no-result recovery, and corrected SPEC-0003/0013/0018 gallery framing. First result begins within the desktop viewport; horizontal overflow is `0`; regenerated lateral/oblique pixels all face right | Pass |
| Git/base/scope audit | Phase 3.1 base is `ce7dbc3`; the separate checkpoint contains only owner specification, catalog/search/media/test/docs/dependency changes. Raw metadata/PNG masters, supplied before-state screenshot, generated artifacts, dependency state, and browser/test output remain ignored | Pass |
| Remote Phase 3.2/4 CI | No push, PR, or remote CI was authorized | Not run; not a local implementation blocker |
| Complete local gate | The prior combined gate passed; post-fix focused formatting/lint/type checks, fresh `pnpm build`, and complete Playwright pass succeeded. The wrapper `CI=true pnpm check` was attempted but could not complete because its nested pnpm reconciliation required unavailable registry access; direct post-fix checks passed | Pass with wrapper-environment limitation |

Package-manager gates must run sequentially with `CI=true` in non-interactive environments; concurrent pnpm commands can reconcile `node_modules` against different lifecycle states and are not a valid speed optimization.

## 11. Known limitations and controls

- The 15/18 Phase 3.1 review slice is public and inspectable, but 33 raw specimen rows remain blocked migration candidates. Phase 6 still owns the complete audited migration, not a blind append of the remaining rows.
- The comprehensive interactive tree (Phase 3.3), interactive map/editorial routes (Phase 5), complete migration (Phase 6), deployment/release checks (Phase 7), analytics, 360°, 3D, uploads, and AI overlays have not started. The current semantic taxonomy drawer/list is complete for the combined catalog scope.
- Home links directly to the functioning Species search control but does not duplicate the index/combobox on Home. Its geographic preview is explicitly non-interactive and non-cartographic; the specimen `View on map` action remains deferred until `/map?specimen={id}` exists.
- Search is intentionally client-side and catalog-scoped. The 67-document artifact is adequate for the current 15/18 collection; pagination, virtualization, a hosted search service, and a global-header search remain unjustified until measured scale/use requires them.
- The partial `metadata_csv` exports and PNG masters remain ignored migration evidence and are not runtime/public files. Only the transformations explicitly recorded in the Phase 3.1 migration audit became canonical records; no raw row-number identity was accepted.
- The calibrated card is a true relative comparison between visible skull subjects; it does not calibrate the visitor's monitor so displayed CSS pixels are not literal real-world millimetres.
- The calibrated comparison selector now has real mammal and bird defaults but still excludes published specimens without a usable default lateral/maximum-length combination. `SPEC-0016` has no recorded maximum length and is correctly ineligible.
- The adult-human dimensions are explicitly approximate representative values and not a universal adult average. A future source-methodology review may refine the reference without changing the comparison architecture.
- Measurement definitions are a quick field guide, not a reproducible anatomical protocol. Dedicated illustrated methodology remains future content.
- The age and condition dialogs are general collection criteria. Future methodology must cite them, explain species variation, and add reviewed real-skull examples.
- The preparation route is a labelled shell, not actionable chemical, biological, legal, or safety guidance.
- The current editorial profile is intentionally absent from the public page; GBIF taxonomy evidence remains available in structured data but is not expanded into low-value prose.
- Footer copyright starts at 2026 because no repository evidence supports a 2023 publication start; the start year can change only with owner-supplied evidence/preference.
- Chrome/Chromium is the current phase browser target. Effective 200% reflow, reduced motion, forced colors, keyboard, and automated axe checks pass; Firefox/WebKit and a manual screen-reader release audit remain Phase 7 gates.
- `NEXT_PUBLIC_SITE_URL` still defaults to `http://localhost:3000`; the final domain is a Phase 7 decision. Canonical/Open Graph/sitemap URLs are structurally complete but intentionally use that default locally.
- Phase 3.0, Phase 3.1 (`ce7dbc3`), and the separately gated combined Phase 3.2/4 checkpoint are local. No Phase 3 branch push, PR, or remote CI is authorized.

## 12. Exact next action

1. The owner inspects `/species` at desktop and mobile widths: multilingual suggestions, class/taxonomy scopes, Filters, both result modes, name/numeric sorts, active chips/clear, reload/back/forward, no-result recovery, and the compact multi-specimen chooser. Also inspect SPEC-0003, SPEC-0013, and SPEC-0018 lateral/oblique galleries for right-facing orientation and comfortable framing.
2. The owner either supplies one bounded catalog feedback task or explicitly approves the combined Phase 3.2/4 checkpoint.
3. After approval, the recommended critical-path next task is Phase 5 map plus required editorial/supporting pages. The owner may instead separately authorize optional Phase 3.3 comprehensive tree work, but must then decide its sourced-content/clade/preview boundaries. Remote publishing remains a separate authorization.

No new content is required for the current visual/product review. Phase 5 will require an owner decision on map tile/style/provider configuration and reviewed content/contact details for the supporting pages identified in the plan. If Phase 3.3 is selected first, the outstanding inputs are listed in `interactive_taxonomic_tree.md`. Phase 6 still needs completed/corrected metadata, missing accepted image sets, and final rights/public-note/publication decisions for blocked rows.

## 13. Decision/blocker protocol

- A failing test or lint rule is implementation work, not automatically a blocker.
- A decision that changes public identity, rights, data publication, scope, or external account state is surfaced to the owner.
- Blockers record what was tried, exact evidence, safe work completed, and the smallest required owner action.
- When resolved, retain a short resolution in the checkpoint log rather than deleting history.

## 14. Checkpoint log

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

### 2026-08-21 — Phase 3.0 checkpoint preserved

- Before any feedback edit, the complete Phase 3.0 worktree was rechecked with `CI=true pnpm check` and committed locally as `9a1d996 feat: complete phase 3 museum shell and catalog`.
- The checkpoint contains the approved class-aware architecture proposal but excludes all new Phase 3.1 context/raw/generated/test/unrelated files. It has not been pushed and no PR was opened.

### 2026-08-21 — Phase 3.1 review expansion/refinement checkpointed locally

- The owner authorized a bounded multi-record review expansion, Home/catalog refinements, family-group galleries, a compact multi-specimen chooser, and a static foundation plus future dedicated plan for comprehensive systematic browsing.
- The canonical collection now contains 15 published taxon identities and 18 specimens backed by 104 validated media assets and 14 new reviewed GBIF snapshots. Thirty-three legacy specimen rows remain blocked migration candidates.
- UI, tests, migration audit, tree guide, and canonical documentation are implemented. The final sequential quality/build/browser gate, desktop/mobile visual review, and scope audit pass; the work is preserved in a separate local Phase 3.1 commit and awaits owner visual review.

### 2026-08-22 — combined Phase 3.2 catalog redesign and Phase 4 discovery checkpointed locally

- The owner approved Phase 3.1 at `ce7dbc3` and supplied `species_page_redesign_phase_3_2.md` as the replacement specification for the earlier tree-versus-search sequencing choice.
- `/species` now delivers the catalog-first layout plus the complete current Phase 4 indexed search, suggestions, facets, sorting, modes, active state, URL/history behavior, one responsive semantic taxonomy drawer/list, and no-JavaScript path. The comprehensive tree is reclassified as Phase 3.3.
- SPEC-0003, SPEC-0013, and SPEC-0018 lateral/oblique WebPs were regenerated from their right-facing clean masters through the full media pipeline. The final sequential quality/build/browser/manual/scope gate passes; no push, PR, or remote CI was authorized.

Future entries stay concise and evidence-based. Git history owns file-level chronology; this ledger owns phase outcomes, decisions, blockers, and next action.
