# Project status

**Snapshot date:** 2026-08-29

**Current phase:** Focused map-only Phase 5 — implementation complete locally; owner review pending

**Overall state:** The combined Phase 3.2/4 work is merged into `main` at `9a0e1d0`. The complete focused map milestone and the first owner-feedback refinement batch are verified on `agent/phase-5-map`; no Phase 5 push, pull request, merge, or remote CI is authorized.

**Next phase:** Not authorized. First obtain owner product review of `/map`; supporting editorial pages, the optional Phase 3.3 comprehensive tree, and Phase 6 remain separately gated.

## 1. Current objective

Present the verified map-first `/map` workspace for owner inspection. Keep the checkpoint local; do not push, open a pull request, merge, or begin supporting editorial pages, Phase 3.3, Phase 6, or another task without explicit authorization.

## 2. Focused Phase 5 collection map

### Canonical projection and route isolation

- Added a deterministic schema-v1 map projection generated from the same compiled published collection as routes and search. It retains all 18 published specimens as semantic map records and emits 18 valid point features; unknown-coordinate records remain supported as list-only records and are never geocoded.
- Added a statically generated `/map` shell. MapLibre GL JS and its CSS load only below the map route, while the complete semantic result list and exact specimen links remain useful without JavaScript.
- Added a replaceable OpenFreeMap provider adapter with only the supported Fiord, Dark, Positron, Liberty, and Bright vector styles. Unsupported satellite, hybrid, and terrain options were not fabricated.
- Added a route-specific content-security policy limited to same-origin assets, blob workers/images, and the selected OpenFreeMap origin; no analytics, cookies, tracking, runtime database, or other provider was introduced.

### Discovery, location semantics, and synchronization

- Reused the established specimen search, higher-rank scopes, class filter, controlled facets, numeric ranges, and missing-data semantics. Map results are specimen-based even when a higher taxon such as Carnivora supplies the scope.
- URL state preserves query, taxonomic scope, class/facets/ranges, selected specimen, supported style, and the explicit uncertainty toggle. Camera position remains transient; invalid or unavailable IDs recover with an honest status and the full filtered list.
- Exact and approximate coordinates use distinct marker treatment and text. Approximate specimens can display geodesic uncertainty areas from canonical metre radii; zero uncertainty produces no circle, and missing coordinates never become inferred points.
- Added class-specific mammal, bird, and fallback marker shapes generated locally. Marker, precision, selected, uncertainty, and cluster states never depend on color alone.

### Clustering, popups, list, and responsive behavior

- Added deterministic clustering with count-scaled markers and synchronized keyboard-operable DOM controls. Activating a cluster opens one anchored, viewport-aware, internally scrollable popup containing every physical specimen in the cluster exactly once.
- Added individual specimen popups with lateral image, names, immutable ID, location/date, explicit precision/uncertainty, and an exact record link. `/map?specimen={id}` selects, focuses, and exposes the same specimen in the semantic list.
- Desktop uses a viewport-dominant map beside an independently scrolling result rail. Narrow screens retain the map as the primary surface and expose the complete results in a bounded drawer/sheet without horizontal overflow.
- Added no-WebGL, MapLibre-load, and provider-style failure states that preserve search, filters, location meaning, and every exact list link. Reduced-motion, forced-color, keyboard, no-JavaScript, mobile portrait/landscape, and effective reflow behavior are covered.
- Added `View on map` beside valid specimen locations without embedding MapLibre on specimen routes. Home's lightweight geographic preview now links to the functioning central map.

### Owner-directed map interaction refinement (2026-08-28)

- Individual map popups now display the lateral subject from its compiled alpha bounds with preserved aspect ratio, centering the skull in the bounded image stage instead of allowing transparent margins to push it below the metadata.
- Search submission closes the autocomplete surface on Enter, including the mobile keyboard action; an active highlighted suggestion is still selected before the surface closes.
- Clustering uses a marker-scale screen-space radius so points remain separate until they are close to physical contact. Keyboard cluster controls are mounted inside MapLibre's interactive canvas container, so wheel input over a marker or cluster continues to zoom the map.
- Desktop popups remain on the left side of their marker and are clamped to the map viewport when a marker is near an edge. Popup wheel/touch handling prevents page scrolling while preserving scrolling inside a cluster's specimen list; narrow layouts retain the centered mobile fit.
- Basemap style changes preserve the current camera. Closing an unfiltered popup preserves manual exploration and closing a filtered popup returns to the current filtered collection fit; semantic result-list selection follows the same rule.

### Owner-directed marker icon refinement (2026-08-29)

- Added generated transparent `128 × 128` WebP marker assets at `public/media/map/mammal-marker.webp` and `public/media/map/bird-marker.webp`. The mammal is a front-facing head with ears, eye sockets, muzzle, and nose; the bird is a right-facing head with crest, eye, and pointed beak.
- MapLibre loads the reviewed local icons before creating the specimen layers, with the previous procedural shapes retained as per-icon fallbacks. The map key reuses the same assets rather than approximating them with a circle and diamond.
- Measured visible alpha bounds are `110 × 112` for the mammal and `106 × 93` for the bird. The bird layer uses a `0.675` optical icon scale against the mammal's `0.56`, equalizing visible marker height without distorting the generated profile; the key applies the same `1.2×` correction.
- `CI=true corepack pnpm check` passes. The rebuilt `CI=true PLAYWRIGHT_PORT=3102 corepack pnpm test:e2e tests/e2e/map.spec.ts` run passes `19/19`; headed desktop and `390 × 844` visual checks show equal marker scale, and both local marker assets return HTTP 200.

### Scope result

- The focused map-only acceptance gate and the first owner-feedback refinement batch pass locally. Supporting/editorial pages were deliberately removed from this milestone and remain unstarted; Phase 3.3, complete migration, uploads, tracking, and unrelated changes were not implemented.

## 3. Combined Phase 3.2 catalog redesign and Phase 4 discovery

### Owner-review taxonomy drawer correction (2026-08-25)

- Moved the wide-screen sticky taxonomy panel below the full sticky catalog control region so its heading remains visible while the page scrolls.
- Added a visible `Reset` action that collapses every expanded taxonomy branch without changing the selected catalog scope or closing the panel.
- Re-anchored the narrow-screen drawer to the left edge and mirrored its shadow treatment to match the new placement.
- Verified the focused source checks, rebuilt the 75 static routes, and passed all 12 catalog Playwright journeys at desktop/mobile sizes, including sticky clearance, reset behavior, left-edge placement, accessibility, and no-JavaScript route access.

### Owner-directed compact card redesign (2026-08-25)

- Replaced variable-height catalog image regions and oversized copy blocks with one bounded, equal-height lateral-image stage and a compact two-column fact grid. The stage remains capped so cards do not become taller merely to make the image fill more space.
- Species cards now always show skull length and skull mass from the largest recorded specimen, or from the largest specimen still matching the active query/feature filters. The metric specimen may differ from the curated default lateral image; multi-specimen cards identify it as `Largest recorded` or `Largest matching`.
- Removed the separate confirmation/confidence line from species cards. Genus-level records retain the explicit scientific `sp.` label, which communicates their identification level without redundant copy.
- Specimen cards now share the same image/name hierarchy and show immutable ID, skull length, skull mass, age, sex, condition, and location/date in a dense, divided fact grid with explicit missing-value semantics.
- Added regression coverage for the new card facts, largest-specimen selection, equal image-stage heights, image-dominant card proportions, and the search-surface mode-switch focus handoff.

### Owner-directed card affordance refinement (2026-08-25)

- Restored brass/gold emphasis to the class/family context and the specimen-count or immutable-ID metadata on both card modes.
- Removed long specimen locations from specimen cards; the compact fact grid now retains only the acquisition date alongside the requested specimen facts.
- Replaced the multi-specimen `Largest recorded` line with independent hover/focus tooltips on the skull-length and skull-mass facts. Each tooltip names the actual record supplying that measurement, including when the two maxima differ or filters are active.
- Moved the multi-specimen chooser to the compact count affordance in the card's upper-right metadata line. A responsive mouse/tap cue communicates that the count opens the chooser without adding a full-width action row.
- Expanded each chooser row to show age, sex, length, mass, condition, and date while retaining the thumbnail, default marker, and exact specimen link. Dense mobile labels use `N/A`, abbreviated month/year, and `Ex.` to keep every fact on one line.

### Owner-directed responsive card image-fit correction (2026-08-25)

- Preserved each compiled subject frame's aspect ratio when the catalog transitions from three to two columns and from two to one column. The frame now fits both available card-image dimensions instead of retaining a wide width while its height is capped.
- Added responsive regression coverage for the raccoon-dog and European-hare cards at the exact 1024px and 768px breakpoints, including the raw canvas ratio used by the subject-bound crop.

### Owner-directed compact mobile control region (2026-08-26)

- Replaced the tall narrow-screen mode buttons and class presets with labelled native selects, while preserving the existing segmented controls on wider screens. Filters, sort direction, and taxonomy now use familiar labelled icons with accessible names and browser tooltips; the full sort choice remains visible because its current value matters.
- Consolidated the narrow control region into a search row, two compact control rows, and one non-wrapping active-state row. Applied chips scroll horizontally instead of increasing the sticky region's height, and the compact reset action remains directly available.
- At the 390 × 844 review viewport the complete control region measures 200.8 px, or 23.8% of the viewport, leaving 76.2% for the published displays. Controls retain 44 px touch targets and the page has no horizontal overflow. The region remains sticky at short narrow viewports so the control bar and listbox retain their intended stacking behavior.
- Added Playwright coverage for the height budget, narrow-mode controls, icon/dropdown tooltips, URL-backed mode/class changes, compact active state, sticky behavior at short heights, listbox stacking, two-column alignment, and horizontal overflow. The final repository-wide check/build and browser-suite results are recorded in the checkpoint evidence below.

### Owner-directed specimen and comparison refinements (2026-08-27)

- Matched the multi-specimen catalog count trigger to the brass uppercase overline style used by single-specimen cards, while retaining its labelled chooser behavior.
- Made `Physical specimen` route transitions preserve the current scroll position, so selecting another specimen does not unexpectedly return the visitor to the top of the page.
- Removed the public incomplete-media warning banner. Optional view availability remains represented by the actual gallery controls and the existing authoring/validation rules; missing optional views are not presented as a visitor-facing error.
- Made a selected collection specimen in `A sense of scale` a semantic exact-record link that opens on double-click (and remains keyboard accessible). Non-collection references such as the adult-human skull remain non-navigable.

### Catalog-first information architecture

- Replaced the large editorial `/species` sequence with a short Collection catalog heading, sticky operational controls, and immediate published results. At 1440 × 900 the first card begins within the first viewport; the default grid remains three/two/one columns without horizontal overflow.
- One control region now owns the labelled search combobox, Species/Specimens radio mode, compact All classes/Aves/Mammalia presets, Filters, Sort, Browse taxonomy, result count, active chips, and Clear all. The Home discovery action targets this real control instead of an honest future-search placeholder.
- Family groups is now a truthful grouped sort in both Species and Specimens modes and survives mode changes. Explicit common/scientific/numeric sorts flatten results into one global order, and one URL-backed direction toggle reverses family, name, or measurement ordering.
- Species cards remain one per taxon and report matched specimen count/length/mass range while feature filters are active. They always show skull length and skull mass from the largest recorded or largest matching specimen, independently of the curated default lateral image; numeric sorts still use the largest matching sort specimen as their visual representative and exact card link, while missing measurements remain explicit and sort last in either direction. Specimen cards expose immutable ID, skull length, skull mass, age, sex, condition, and concise location/date facts.

### Complete search, facets, and URL behavior

- Pinned `@orama/orama` 3.1.18 and added a deterministic schema-v1 artifact with 67 documents: 34 canonical rank nodes, 15 published taxa, and 18 published specimens. Draft/blocked records and the draft profile remain absent.
- Search normalizes case, punctuation, whitespace, and Danish letters without changing display text; explicit `æ`/`ø` transliteration prevents words such as `ræv` from collapsing into single-letter fragments. Orama now supplies broad candidates to a shared deterministic acceptance policy covering exact, prefix, alias, bounded credible fuzzy, and optional reviewed-profile tiers. Ordinary names permit at most one edit, long tokens at most two, multi-word queries cannot match on one unrelated token, and `SPEC-`/`TAX-` inputs use strict identifier-prefix matching. Regression coverage confirms that `Canidae` excludes Laridae/Gull, fox/Danish/typo queries resolve only Red fox, and exact `SPEC-0013` resolves only that physical record while `Racoon dog` remains supported.
- Suggestions group ranks, taxa, and physical specimens and show canonical lateral thumbnails, display names, scientific/Danish context, and result type. Species mode now presents one row per matching taxon with progressive disclosure for non-default specimens; Specimens mode presents physical specimens directly. Exact specimen-ID searches auto-open the relevant Species-mode subsection and restrict Specimens-mode suggestions and published results to that exact record. Arrow/Enter/Escape, live status, touch/click, exact specimen navigation, rank filtering, and explicit rank-page links are implemented. Grouping precedes presentation, so the UI no longer hides current records behind a global top-10 slice. The autocomplete surface is constrained to the available viewport height and hands boundary wheel scrolling back to the page immediately while retaining native touch scroll chaining.
- Feature facets cover sex, age, condition, and defleshing method with live canonical counts. Maximum-length and prepared-mass ranges exclude `not_recorded`/`not_applicable` rather than treating them as zero. Empty states explain exclusion and offer clear/switch-mode recovery.
- URL state includes query, mode, class, taxonomic scope, controlled-value filters, numeric bounds, sort, and direction. Invalid tokens/ranges are rejected; direct load, reload, back, and forward restore the same result state. Filter/taxonomy-panel open state is deliberately transient.
- Orama code and `/generated/catalog-search-v1.json` load only after a non-empty query. The default static catalog, cards, and complete no-JavaScript taxonomy links remain useful without the index or client JavaScript.

### One taxonomy source and deferred comprehensive tree

- The required class → order → family → genus → terminal-taxon taxonomy surface is one responsive component: sticky alongside-grid sidebar on wide screens, labelled focus-trapped drawer on narrow screens, and a native `<details>` nested-list fallback without JavaScript.
- Every rank has separate expand/collapse, Filter catalog, and Open rank page actions; exact node/count/route data comes from the same canonical view model as rank pages, cards, and search documents.
- The richer branching/pan/zoom/group-preview experience is reclassified as Phase 3.3. It must enhance, not replace, the current drawer/list and cannot introduce unsupported group characteristics, clades, or divergence claims.

### Corrected media orientation

- Reconciled the six left-facing committed derivatives for SPEC-0003, SPEC-0013, and SPEC-0018 with their already right-facing reviewed clean masters. Restaging all 104 approved PNGs and running the ordinary processor changed only each named specimen's lateral and oblique WebPs.
- The pipeline—not a manual public-file edit or display-time CSS exception—recomputed alpha subject bounds, converted to sRGB, stripped metadata, and validated the complete 104-asset collection plus comparison reference. Cards, suggestions, specimen galleries, and calibrated presentation therefore share the corrected assets and framing.

## 4. Phase 3.1 refinement

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

## 5. Phase 3.0 implementation

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

## 6. Phase 2.3 implementation

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

## 7. Phase 2.2 implementation

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

## 8. Phase 2.1 implementation (retained foundation)

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

## 9. Phase 2 acceptance gate

| Requirement | State | Evidence |
|---|---|---|
| Complete source → validation → generated data/media → static route journey | Pass locally | One published taxon, one specimen, six specimen assets, one comparison reference, zero reviewed profiles; taxon, exact-specimen, and preparation-guide routes prerender |
| Invalid representative fixtures fail actionably | Pass locally | Five deliberate relationship/date/rights/media/observation failures report source, key/field, rule, and correction guidance |
| No EXIF/GPS or archival source reaches public output | Pass locally | All six specimen WebPs plus the human reference pass EXIF/IPTC/XMP inspection; both source PNG sets remain ignored |
| Refined desktop/mobile/landscape interactions and presentation pass | Pass locally | Ten Playwright journeys plus final desktop/mobile visual review; real-touch coverage includes 100%-scale gallery swipe, pinch scaling with two-finger translation, post-zoom horizontal/vertical/diagonal pan, and inspection swipe |
| Canonical docs, Git scope, branch, and remote CI agree | Pass | Canonical Phase 2.3 docs and scope are reconciled; implementation commit `83d577b` passed GitHub Actions run `32063339841`; PR #4 later merged through its protected path |
| Owner approves refined visual direction, density, interactions, and wording | Pass | Owner answered `YES I APPROVE!` on 2026-08-17 after reviewing Phase 2.3 |

**Gate conclusion:** The complete Phase 2 technical, visual, and owner-approval gate passed. Phase 2 closed before the separately authorized Phase 3 work recorded above.

## 10. Representative record decisions

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

## 11. Verification evidence

| Gate | Most recent evidence | Status |
|---|---|---|
| Exact toolchain/install | Node `v24.18.0`; pnpm `11.21.0`; `pnpm install --frozen-lockfile` passes from the exact lockfile with pinned Orama 3.1.18 | Pass |
| Content/search/map build | `pnpm content:build`: 15 taxa, 18 specimens, 104 specimen assets, 67 search documents, 18 map records / 18 valid points, 1 comparison reference, 0 reviewed profiles (1 profile source); only four expected optional-frontal warnings | Pass |
| Media | Full restage/process plus `pnpm validate:media`: 104 specimen assets plus 1 reference, 24.83 MiB, sRGB/alpha/bounds valid, no EXIF/IPTC/XMP; Git shows only the six requested right-facing derivative changes | Pass |
| Invalid fixtures | `pnpm test:fixtures`: 6 expected failures detected, including class-profile mismatch | Pass |
| Types/lint/tests | Sequential formatting, lint, content/media validation, TypeScript, 14 Vitest files / 62 tests, and 6 actionable invalid fixtures pass. Phase 5 adds deterministic projection/uncertainty, URL-state, and specimen filter coverage without regressing the catalog, measurement, media, or exhibit suites | Pass |
| Production build | `next build --webpack` completes successfully with 76 static outputs; `/map` and the existing Home, guide, sitemap, catalog, 15 taxon, 18 exact-specimen, and 34 rank outputs prerender | Pass |
| Browser/accessibility | Full `PLAYWRIGHT_PORT=3113 node_modules/.bin/playwright test`: 52/52 Chromium journeys. The 19 map journeys cover provider rendering, Enter-dismissed search, rank/specimen search, centered popup subject crops, deep links, uncertainty, marker-scale clusters, cluster wheel zoom, left-locked/clamped popups, popup gesture containment, camera-preserving styles and close behavior, all supported styles, route-bundle isolation, responsive/reflow/accessibility media states, no JavaScript, no WebGL/provider failure, and zero axe violations | Pass |
| Manual visual/responsive | Production-browser inspection covers `/map` at 1440 × 900, 1024 × 900, 768 × 900, 390 × 844, 360 × 800, narrow landscape, effective 200% reflow, reduced motion, and forced colors. The updated desktop/mobile individual popup shows a centered uncropped subject; left-locked cluster placement remains within the map viewport; map/list hierarchy, bounded sheets/popups, marker/key meaning, camera preservation, and horizontal overflow remain correct; browser console is clean under every supported style | Pass |
| Git/base/scope audit | Branch `agent/phase-5-map` is based on merged `main` checkpoint `9a0e1d0`. The intended diff is limited to the approved map plan, dependency/lockfile, projection/provider/map UI, exact map links, focused tests, and matching canonical documentation; unrelated owner context files remain unstaged | Pass |
| Remote Phase 5 CI | No push, pull request, merge, or remote CI was authorized | Not run; not a local implementation blocker |
| Complete local map gate | The final sequential check/build/browser gate, owner-feedback regression suite, resilience checks, visual matrix, route-bundle audit, and explicit staging audit pass. Remote publication remains a separate owner action | Pass locally |

Package-manager gates must run sequentially with `CI=true` in non-interactive environments; concurrent pnpm commands can reconcile `node_modules` against different lifecycle states and are not a valid speed optimization.

## 12. Known limitations and controls

- The 15/18 Phase 3.1 review slice is public and inspectable, but 33 raw specimen rows remain blocked migration candidates. Phase 6 still owns the complete audited migration, not a blind append of the remaining rows.
- The focused interactive map is complete. The comprehensive tree (Phase 3.3), supporting/editorial routes removed from Phase 5, complete migration (Phase 6), deployment/release checks (Phase 7), analytics, 360°, 3D, uploads, and AI overlays remain unstarted.
- Home keeps a lightweight non-cartographic geographic preview and links to `/map`; it deliberately does not duplicate MapLibre or the map control surface. Coordinate-bearing specimen records expose `View on map` deep links.
- OpenFreeMap is a public vector-style dependency without a project-owned uptime guarantee. Provider or WebGL failure therefore preserves the full semantic list and all exact record links. Satellite, Hybrid, and Terrain are absent because the selected provider integration does not support them under the approved contract.
- All 18 records in the current public slice have valid points. The list-only `Not mapped` path is projection- and browser-tested with fixtures so future unknown-coordinate records remain publishable without fabricated coordinates.
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
- Combined Phase 3.2/4 is merged into `main` at `9a0e1d0`. Phase 5 is local on `agent/phase-5-map`; no Phase 5 push, pull request, merge, or remote CI is authorized.

## 13. Exact next action

1. The owner runs the local site and inspects `/map` at desktop and mobile widths: specimen/higher-rank search, facets, style changes, uncertainty toggle, exact and clustered popups, semantic results, `/map?specimen=SPEC-0013`, and one specimen-page `View on map` action.
2. The owner either supplies one bounded map-feedback task or explicitly approves the focused Phase 5 map checkpoint.
3. After approval, remote push/PR/merge is still a separate authorization. The next product milestone must also be chosen explicitly; supporting editorial pages, optional Phase 3.3, and Phase 6 remain independent scopes.

No new content or owner decision is required for the current map review. Phase 6 still requires completed/corrected metadata, missing accepted image sets, and final rights/public-note/publication decisions for blocked rows. Supporting editorial content requires its own source/contact review if later authorized.

## 14. Decision/blocker protocol

- A failing test or lint rule is implementation work, not automatically a blocker.
- A decision that changes public identity, rights, data publication, scope, or external account state is surfaced to the owner.
- Blockers record what was tried, exact evidence, safe work completed, and the smallest required owner action.
- When resolved, retain a short resolution in the checkpoint log rather than deleting history.

## 15. Checkpoint log

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

### 2026-08-26 — compact mobile catalog controls verified locally

- Owner review identified that the narrow-screen sticky controls left too little room for the primary published displays and that the prior compact fallback broke stickiness and listbox stacking. Mobile now uses compact labelled mode/class selects, familiar action icons, the full sort selector, and a single scrollable active-state row; medium widths use a compact class select and keep all actions on one row; wide controls use the same icon language.
- At 390 × 844 the controls occupy 23.8% of the viewport and leave 76.2% for results. The control region remains sticky at short heights, the listbox stays above published content, and the complete local check, 75-route production build, and 31/31 Chromium journeys pass; the coherent fix remains local with no push or PR authorized.

### 2026-08-27 — specimen navigation and comparison refinements verified locally

- Matched the clickable multi-specimen card count to the existing uppercase, bold brass overline treatment.
- Made same-taxonomy specimen-selector links preserve scroll position, removed the visitor-facing optional-media warning, and retained the underlying authoring/validation warnings for genuinely incomplete staging records.
- Added exact routes to collection comparison records. The selected comparison specimen is now a keyboard-accessible link whose pointer navigation is activated by double-click; reference records, including the adult-human skull, remain non-navigable.
- The focused and full local checks pass: 55/55 Vitest tests, strict TypeScript/lint/format/content/media/fixture validation, the 75-route production build, dedicated scroll/comparison browser checks, and 33/33 Chromium journeys. The checkpoint remains local with no push or PR authorized.

### 2026-08-28 — focused Phase 5 collection map verified locally

- The owner explicitly replaced the earlier combined map/editorial milestone with the binding map-only specification in `agent_context/phase_5_map_feature_plan.md`.
- `/map` now combines the deterministic 18-record projection, route-lazy MapLibre/OpenFreeMap canvas, specimen-based discovery, exact/approximate/unknown semantics, geodesic uncertainty, complete clusters and anchored popups, synchronized semantic records, deep links, responsive layouts, and resilient non-map fallbacks.
- The complete sequential quality/build/browser gate, responsive/forced-color/reduced-motion visual matrix, bundle-isolation audit, and staging/scope review pass. The implementation is committed locally on `agent/phase-5-map`; no push, pull request, merge, remote CI, supporting-content work, or next phase is authorized.

### 2026-08-28 — first owner-feedback map refinement verified locally

- Implemented centered subject-bounds popup imagery, Enter/mobile-keyboard autocomplete dismissal, marker-scale clustering, reliable keyboard cluster controls inside MapLibre's interactive layer, map zoom over marker/cluster targets, left-locked and viewport-clamped desktop popups, contained popup gestures, and filtered/unfiltered camera-preservation rules for styles, popup close, and result-list selection.
- The final exact-head check/build passed with 62/62 unit tests and 6 expected invalid-fixture failures; the full Chromium suite passed 52/52, including 19 map journeys and the repeated 9/9 cluster/popup gesture stress run. Desktop/mobile production screenshots show the centered uncropped popup subject; no push, pull request, merge, or remote CI was performed.

Future entries stay concise and evidence-based. Git history owns file-level chronology; this ledger owns phase outcomes, decisions, blockers, and next action.
