# Implementation plan

**Status:** Approved phased roadmap

**Current phase:** Owner-authorized Home redesign complete locally; owner review pending

**Last reviewed:** 2026-09-01

## 1. How to use this plan

This is the canonical delivery sequence. Each phase produces one reviewable capability and ends at an evidence-based gate. Do not begin the next phase merely because code exists; close the current gate, update [project_status.md](project_status.md), commit a coherent checkpoint, and receive user approval where the phase calls for it.

Checkboxes track phase deliverables, not every implementation commit. Detailed active tasks belong in GitHub issues/milestones once the remote exists. `docs/project_status.md` is the only narrative ledger of what is currently true.

Status legend:

- `[ ]` not complete;
- `[x]` verified complete;
- `Deferred` intentionally outside the active release; and
- `Blocked` cannot proceed without a stated decision or external condition.

## 2. Delivery principles

- Build one representative vertical slice before scaling the catalog.
- Define and validate source contracts before rendering many records.
- Prefer static/server output; add client state only for interaction.
- Treat accessibility, rights, privacy, and missing-data behavior as product requirements.
- Do not call live taxonomy services during ordinary builds.
- Do not publish staging data or archival image masters.
- Use exact dependency pins and frozen-lockfile CI.
- Keep generated artifacts replaceable and source data reviewable.
- Keep phases narrow: deferred ideas do not enter an active phase without a plan revision.

## 3. Critical path

```text
Phase 0/1 foundation
        ↓
Phase 2 validated real-data vertical slice and visual approval
        ↓
Phase 3 shared museum shell and taxonomy catalog
        ↓
Phase 3.1 review-quality catalog expansion and refinement
        ↓
Phase 3.2 catalog-first redesign + Phase 4 search/faceted discovery
        ↓
Phase 5 focused collection map
        ↓
Phase 6 complete audited collection migration
        ↓
Phase 7 release hardening, production, and v1.0.0
```

Supporting/editorial content remains required before release but is now a separately authorized milestone whose exact placement after the focused map gate is an owner scheduling decision.

Phase 2 is deliberately the strongest early gate: it tests data, media, URL, design, accessibility, and build decisions with one real specimen before repetition makes change costly.

## 4. Phase 0/1 — documentation and repository foundation

### Objective

Turn the approved conversational plan into durable sources of truth and create a clean, reproducible Next.js/GitHub baseline—without implementing catalog features.

### Documentation

- [x] Add `README.md` with setup, commands, workflow, repository map, deployment overview, and rights boundary.
- [x] Add `docs/project_overview.md` with vision, audience, scope, routes, page behavior, journeys, and acceptance criteria.
- [x] Add `docs/competitive_audit.md` with findings from Skull Index, Skull Base, and Skullsite.
- [x] Add `docs/architecture.md` with stack, boundaries, rendering, source flow, search, map, media, security, deployment, and testing.
- [x] Add `docs/content_data_model.md` with planned CSV fields, identities, controlled values, missing semantics, taxonomy, MDX/citations, media, and validation.
- [x] Add `docs/design_system.md` with visual tokens, type, grid, components, interaction states, photography, motion, accessibility, and voice.
- [x] Add this implementation plan with dependencies, gates, and deferred work.
- [x] Add `docs/project_status.md` as the current-state ledger.
- [x] Record material decisions in `docs/decisions/`.
- [x] Convert `AGENTS.md` into the mandatory project index and source hierarchy.

### Repository and policy

- [x] Initialize Git with `main` as the default branch.
- [x] Add `.gitignore`, `.gitattributes`, `.editorconfig`, and safe environment example.
- [x] Ignore incomplete metadata, local source images, archival formats, secrets, dependencies, generated data, builds, and test output.
- [x] Add MIT `LICENSE` for source code and a separate `RIGHTS.md` reserving content/media/data.
- [x] Add `CONTRIBUTING.md`, pull-request template, structured issue forms, and Dependabot configuration.
- [x] Audit the exact first-commit scope so no staging/private assets enter Git.

### Application and toolchain

- [x] Pin Node.js 24.18.0 and pnpm 11.21.0.
- [x] Pin Next.js 16.2.12, React 19.2.8, strict TypeScript, Tailwind 4, ESLint, Prettier, and test dependencies.
- [x] Add a minimal App Router application with the working title in central configuration.
- [x] Establish semantic base tokens and accessible page landmarks without implementing the final museum shell.
- [x] Add a small unit test, a Playwright home smoke/accessibility test, and deterministic scripts.
- [x] Add GitHub Actions for frozen install, formatting, lint, typecheck, unit tests, production build, and Chromium browser test.
- [x] Avoid placeholder content/media validation scripts; add real versions in Phase 2.

### GitHub and checkpoint

- [x] Verify GitHub CLI authentication for `Rasmus-allesoee`.
- [x] Create public `Rasmus-allesoee/skull_website` with the local repository as source.
- [x] Commit the reviewed foundation on `main` using a conventional commit.
- [x] Push and verify the remote/default branch and GitHub Actions run.
- [x] Record commit, remote, command evidence, and remaining environment notes in `project_status.md`.

### Acceptance gate

- A fresh clone on the pinned Node version installs with `pnpm install --frozen-lockfile`.
- Formatting, lint, typecheck, unit tests, production build, and Chromium smoke/accessibility test pass.
- `git status` is clean after the checkpoint.
- The GitHub repository is public and points to the intended initial commit.
- Ignored local draft metadata and staged images are absent from the remote.
- All canonical documents and `AGENTS.md` agree that Phase 2 is next and no Phase 2 feature is presented as complete.

**Gate result:** Passed on 2026-08-12. Phase 2 remains unstarted until the user explicitly continues.

## 5. Phase 2 — validated vertical slice

### Dependencies

- Phase 0/1 gate complete.
- One approved representative taxon and exact physical specimen selected from local staging.
- Stable specimen/taxon IDs and public rights/credits confirmed for that slice.

### Data and compiler

- [x] Add header-only/representative `taxa.csv` and `specimens.csv` sources matching the approved model.
- [x] Implement pure domain types and executable input schemas.
- [x] Implement CSV parsing with row/field diagnostics and missing-value semantics.
- [x] Implement relationship, publication, partial-date, coordinate, default-specimen, and measurement validation.
- [x] Define deterministic generated-artifact locations and build command.
- [x] Add real `validate:content` and tests for both valid and invalid fixtures.
- [x] Define MDX profile frontmatter, allowed components, and citation validation.

### Taxonomy

- [x] Implement explicit GBIF/Catalogue of Life refresh command with cached dated snapshot.
- [x] Prevent normal builds from making network requests.
- [x] Require review for fuzzy, synonym, conflicting, or higher-rank matches.
- [x] Validate the representative taxon's scientific/common/Danish names and hierarchy.

### Media

- [x] Finalize canonical view names against the real six-view set.
- [x] Implement Sharp processing: sRGB, orientation, metadata stripping, alpha/dimension/file checks, subject bounds, WebP output.
- [x] Add `validate:media` with actionable diagnostics.
- [x] Rename representative inputs by immutable specimen ID and generate curated public derivatives.
- [x] Confirm repository/media size and visual alpha quality.

### Representative exhibit

- [x] Add static taxon and nested specimen routes with correct default selection and metadata.
- [x] Build the responsive six-view gallery with keyboard, swipe, zoom/fullscreen, and reduced-motion support.
- [x] Build taxonomic breadcrumb, identification/confidence labels, specimen selector, measurement/record/preparation panels, review-gated profile/citation infrastructure, and concise rights/credit presentation.
- [x] Implement missing/unknown/not-applicable semantics and optional-media presentation without treating missing optional views as a visitor-facing error.
- [x] Self-host Newsreader and IBM Plex Sans with licence files.
- [x] Validate real-image performance and responsive treatment.

### Automated and manual verification

- [x] Unit-test parser, identifiers, links, dates, missing values, taxonomy outcomes, rights, and media naming.
- [x] Component-test gallery, selector, data groups, timeline, focus, and axe output.
- [x] Browser-test taxon/default and exact-specimen deep links at desktop and 360–390 px.
- [x] Manually inspect all six views, focus paths, zoom, reduced motion, and no-JavaScript core content.

### Acceptance gate

- One complete source → validation → generated data/media → static taxon/specimen journey works in a clean build.
- Invalid representative fixtures fail with actionable messages.
- No EXIF/GPS or archival source reaches public output.
- The user explicitly approves the real vertical slice's visual direction, information density, and interactions before Phase 3 scales it.

### Phase 2.1 — owner-feedback refinement

- [x] Correct blurry page delivery with quality-90 responsive variants and a direct original-WebP inspection path.
- [x] Recompose the desktop gallery around a complete image plus right-hand scrollable view rail, while retaining portrait-mobile thumbnails below and a landscape-mobile side rail.
- [x] Make all mobile controls, thumbnail selection, horizontal swipe, double-tap inspection, pinch zoom, and touch drag work; retain complete keyboard and reduced-motion behavior.
- [x] Replace the asymmetric button-heavy inspector with a symmetric full-viewport native dialog supporting wheel/trackpad/pinch zoom, direct dragging, compact controls, view switching, and focus return.
- [x] Add discoverable desktop and touch navigation hints; use concise `Photo:` and `display` wording.
- [x] Move measurements immediately below photography, retain additional-measurement disclosure, remove the ambiguous skull diagram, and add a definition dialog plus honest proportional 10 cm reference.
- [x] Move owner into the collection record; introduce reviewed age/condition vocabularies and dialogs plus pathology, trauma, teeth-set, and skeleton fields with explicit missing semantics.
- [x] Rename preparation copy, add a real `/guides/skull-preparation` outline route, and keep uncited procedural/safety content unpublished.
- [x] Remove the premature public cited-profile and large rights panel while preserving profile/citation compilation and structured rights fields; add the global copyright footer.
- [x] Extend unit, fixture, accessibility, responsive, no-JavaScript, desktop-fit, image-delivery, real-touch, swipe, double-tap, pinch, drag, dialog, and guide-route coverage.
- [x] Record dedicated future methodology imagery/pages and bounded related/random discovery behavior without beginning Phase 3.

**Gate result:** The owner approved the initial direction but requested the bounded refinements above on 2026-08-14. The refined implementation passed the complete local and GitHub Actions technical gate at commit `1fcf7c6`. The owner must still approve the rendered result; Phase 3 remains unauthorized until that decision is recorded in `project_status.md`.

### Phase 2.2 — second owner-feedback refinement

- [x] Retune the desktop gallery for a common wide browser viewport around 1440 × 696 while retaining the 1440 × 900 and mobile layouts: taller main frame, matching thumbnail proportions, larger perceived skull, aligned scrollable rail, visible controls, and no anatomy crop.
- [x] Render the active gallery from the validated full-resolution WebP through compiled transparent subject bounds; retain lightweight optimized thumbnails and the original master in inspection.
- [x] Stop inspector wheel/trackpad/pinch gestures from scrolling or zooming the page, keep image navigation available at every inspection zoom level, and preserve drag, focus return, Escape, and reduced-motion behavior.
- [x] Diagnose the local-network mobile reload loop and add explicit loopback/private-LAN Next.js development origins plus documented `dev:network` and production-like `preview:network` workflows.
- [x] Replace the 10 cm visual with a reusable true-to-scale lateral-skull comparison driven by maximum skull length, compiled subject bounds, and explicit orientation.
- [x] Add a reviewed adult-human-skull reference with a deterministic processing path, fixed approximate measurements, source/rights metadata, and the same alpha/metadata validation contract as specimen media.
- [x] Add an accessible searchable comparison selector, exclude the current specimen, put references first, announce changes, and render a dynamic six-row measurement-difference table with magnitude, direction, and ratio.
- [x] Recompose Measurements as the compact specimen table on the left and comparison card on the right at wide widths, with coherent tablet/portrait stacking and calibrated ratios in desktop, portrait, and landscape tests.
- [x] Rename the collection kicker from `Provenance` to `Metadata`; left-align guide-dialog titles and notes and keep the condition title on one desktop line.
- [x] Advance the generated collection contract to schema version 3, validate exactly one default comparison reference, and extend domain, component, fixture, media, browser, responsive, touch, geometry, and accessibility coverage.
- [x] Update all canonical documentation, context-source guidance, network-device instructions, and deferred comparison scope without beginning Phase 3.

**Gate status:** The Phase 2.2 implementation passes the complete local and GitHub Actions technical gate at implementation commit `b1de049` and Actions run `31916200967`. Explicit owner approval of the rendered result remains the only product gate before Phase 3 may be authorized.

### Phase 2.3 — final owner-feedback refinement

- [x] Remove the low-value scale-mechanics sentence from `A sense of scale` while retaining the concise heading and comparison controls.
- [x] Keep the selected comparison record's descriptive note data-driven and render approximation guidance only when a displayed difference actually uses an approximate source value.
- [x] Restore full native browser manipulation over the ordinary mobile gallery: two-finger pinch may translate freely, and a zoomed page may pan horizontally, vertically, or diagonally inside the frame. Preserve one-finger view swipe/double-tap only at 100% page scale and keep multi-touch cancellation safe.
- [x] Add horizontal touch swipe between inspection views at 100% zoom while retaining one-finger pan when enlarged and two-finger image pinch zoom.
- [x] Defer the specimen-page location-map action to Phase 5 beside the Collection record, using `/map?specimen={id}` and the route-only MapLibre architecture rather than loading a second map implementation early.
- [x] Extend component/browser coverage and reconcile canonical documentation without beginning Phase 3.

**Gate status:** Passed. The complete Phase 2.3 local gate passes, including real-touch pinch translation and two-dimensional post-zoom pan. Implementation commit `83d577b` passed GitHub Actions run `32063339841`; documentation checkpoint `a89b723` passed run `32064897700`. The owner explicitly approved the rendered Phase 2.3 result on 2026-08-17, closing the Phase 2 product gate.

## 6. Phase 3 — museum shell and catalog

### Dependencies

- Phase 2 vertical slice and visual direction approved.
- Shared exhibit components stable enough to repeat.

### Shell and foundational routes

- [x] Implement final responsive header, mobile navigation, skip link, footer, and central site configuration.
- [x] Implement Home with featured display, real collection counts, class entries, an honest catalog/search entry, non-interactive geographic preview, and editorial prompts.
- [x] Add a route-level not-found state; omit false loading/error surfaces because all current routes are static and have no genuine route latency.
- [x] Add supporting SEO metadata helpers and default Open Graph treatment.

### Taxonomy and catalog

- [x] Generate class/order/family/genus route params from canonical records.
- [x] Implement shared rank landing template, breadcrumbs, child index, and scoped gallery.
- [x] Implement `/species` default catalog, representative class cards, taxonomy index, common-name sorting foundation, and responsive cards.
- [x] Implement species and specimen card modes using canonical queries.
- [x] Add default-specimen and previous-slug routing/redirect tests.
- [x] Implement up to three same-family suggestions and three deterministic collection-wide suggestions with current/duplicate exclusion and stable output tests; omit the entire section while the one-record collection has no eligible suggestion.
- [x] Add sitemap/robots coverage for current published routes.

### Class-aware measurements added in Phase 3

- [x] Keep collection data in the two canonical linked CSVs and expand `specimens.csv` with bird-specific and missing mammal measurement/value-status pairs rather than creating a parallel bird-specimen table.
- [x] Advance `CompiledCollection` to schema version 4 and derive `mammal`, `bird`, or fallback `other` measurement profiles from the linked taxon's class.
- [x] Validate that profile-specific fields are `not_applicable` outside their class and that applicable fields never use `not_applicable` as a substitute for missing data.
- [x] Render profile-specific specimen measurement tables and definition guidance.
- [x] Render mammal/mammal (6), bird/bird (9), and bidirectional bird/mammal (6) difference matrices, with the cross-class landmark mismatch stated in text.
- [x] Treat `agent_context/metadata_csv/` as ignored migration evidence only; defer normalization, stable-ID assignment, taxonomy/media/rights review, and row ingestion to Phase 6.

### Acceptance gate

- A complete keyboard/mobile journey works from Home → class → family → taxon → exact specimen without search or map.
- Static output contains correct names, links, metadata, default specimens, and no drafts.
- Visual states are consistent across mammals, birds, long names, uncertain taxa, missing optional angles, and multiple specimens.

**Phase 3.0 checkpoint:** The complete local technical gate passed on 2026-08-20: schema/content/media/fixture validation, formatting, lint, typecheck, 25 unit/component tests, a 14-output static production build, 13 Chromium journeys with axe/no-JavaScript/mobile-keyboard coverage, and manual 1440 × 900 plus 390 × 844 review. The owner then approved most of the direction and authorized the bounded Phase 3.1 refinement below. Phase 3.0 is preserved in local commit `9a1d996`; no remote write was authorized.

### Phase 3.1 — review-quality catalog expansion and owner-feedback refinement

- [x] Inventory 22 legacy taxon rows, 51 legacy specimen rows, and 104 cleaned PNGs; reconcile 18 physical image sets representing 15 taxon identities.
- [x] Normalize and publish the 15 identities/18 specimens that meet the current contract, including 13 species-level and two explicit genus-level `sp.` identifications; retain a durable migration audit and keep raw exports/masters ignored.
- [x] Refresh, review, and snapshot taxonomy for the 14 new canonical taxon records; preserve stable new taxon/specimen IDs and exact nested routes.
- [x] Process and validate 104 specimen WebPs; keep four missing optional frontal views explicit rather than fabricating completeness.
- [x] Expand Home to six concise live statistics, preserve hero/search/map/editorial pathways, remove the duplicate Featured specimen section, and improve class-card image breathing room.
- [x] Add a prominent honest `/species` discovery entry without beginning Phase 4 search behavior.
- [x] Add a shared server-rendered class → order → family tree foundation on Home and `/species`, while retaining the ordinary taxonomy list as its accessible data-equivalent alternative.
- [x] Group the all-species and class/order scoped galleries by family; retain a plain responsive grid on family/genus landings.
- [x] Use a three/two/one-column card grid where content/viewport supports it and verify mammals, birds, genus-level uncertainty, long names, optional-view gaps, and multiple specimens with live records.
- [x] Add a compact native specimen chooser to multi-specimen species cards, showing only specimen ID/default state, thumbnail, age, sex, and maximum length, with exact stable links, Escape, and focus restoration.
- [x] Document the complete source/migration boundary and create a dedicated implementation guide for the comprehensive interactive tree, now reclassified as Phase 3.3.
- [x] Pass the complete sequential local quality/build/browser/manual visual gate and create the separate verified Phase 3.1 commit.
- [x] Receive owner approval of the rendered Phase 3.1 result.

Phase 3.1 is a review slice, not the final Phase 6 audit. It establishes public URL identity for the accepted 15/18 records, but Phase 6 still reconciles every legacy row, unresolved media/identity/rights/public-note decision, and field transformation. See [phase_3_1_migration_audit.md](phase_3_1_migration_audit.md).

### Phase 3.2 — catalog-first Species redesign with integrated Phase 4 discovery

**Scheduling:** Owner-authorized replacement for the earlier Phase 3.2-versus-Phase 4 choice. The complete current Phase 4 scope is delivered inside the redesigned `/species` catalog as one acceptance milestone.

- [x] Replace the vertically stacked editorial catalog with a compact heading, sticky operational controls, and the lateral-image grid in the first normal desktop viewport.
- [x] Implement one species/specimen catalog over the existing canonical query model, with compact class presets, family grouping in browse mode, and global flattening for explicit sort/search states.
- [x] Add the single required responsive taxonomy drawer/sidebar through class → order → family → genus → taxon, with explicit filter and stable-route actions, nested-list semantics, Escape/focus handling, and a no-JavaScript alternative.
- [x] Preserve the compact multi-specimen chooser and exact taxon/specimen URLs.
- [x] Integrate every Phase 4 index, query, interface, URL, progressive-enhancement, performance, and acceptance requirement listed below.
- [x] Refine autocomplete suggestions into a mode-dependent hybrid: unique taxon parents with progressive exact-specimen disclosure in Species mode, direct physical-specimen results in Specimens mode, and exact-ID subsection prioritization without pre-grouping truncation.
- [x] Rebuild the six SPEC-0003/0013/0018 lateral/oblique derivatives from their right-facing clean masters through the canonical staging/processing/bounds validation pipeline.
- [x] Verify the combined layout/discovery gate across desktop, mobile, effective 200% reflow, keyboard, touch, reduced motion, forced colors, axe, no-JavaScript, and browser-history scenarios.

### Phase 3.3 — comprehensive interactive systematic browsing (dedicated future feature)

**Scheduling:** Deferred. This richer tree is optional to the catalog workflow and does not block Phase 5. It begins only after owner review and separate authorization.

- [ ] Reuse one canonical published hierarchy for the visual tree and ordinary nested-list alternative; never create a second classification source.
- [ ] Enhance the implemented drawer/list hierarchy with comprehensive visual branching, keyboard traversal, touch, pan/zoom/reset, and shareable focus/expansion only where useful.
- [ ] Add compact group previews only with deterministic published imagery and list/route equivalents.
- [ ] Add group-identification characteristics only after claim-level sources and review.
- [ ] Add evolutionary divergence estimates only after sources, definitions, uncertainty wording, and owner approval; otherwise omit them.
- [ ] Verify tree/list node parity, draft exclusion, performance/bundle isolation, 200% zoom, forced colors, screen reader, axe, and responsive behavior.

Detailed implementation constraints and prerequisites live in [interactive_taxonomic_tree.md](interactive_taxonomic_tree.md). The implemented Phase 3.2 drawer/list is the foundation; Phase 3.3 must not replace the working catalog or route-equivalent semantic list.

## 7. Phase 4 — search and faceted exploration (integrated into Phase 3.2)

### Dependencies

- Canonical catalog routes and query functions complete.
- Sufficient representative records/fixtures for meaningful ranking and grouping tests.

### Index and query model

- [x] Generate deterministic Orama rank, taxon, and specimen documents.
- [x] Add normalized scientific/English/Danish/alias/ID fields without changing display values.
- [x] Implement exact → prefix → alias/synonym → fuzzy → profile-text ranking.
- [x] Add class/order/family/genus facets and skull-length/skull-weight numeric facets.
- [x] Define species-mode grouping/count/range and specimen-mode matching behavior.

### Interface and URLs

- [x] Build accessible catalog suggestions grouped by rank, taxon, and specimen type.
- [x] Build catalog search, filter, sort, active-filter, clear, no-result, and mode controls.
- [x] Make family grouping and bidirectional name/measurement sorting truthful in both modes; species numeric sorts use the largest matching measured specimen as their visible representative and sort key.
- [x] Serialize all meaningful state to stable query parameters.
- [x] Restore state on direct load, refresh, and browser back/forward.
- [x] Lazy-load index code/data only after a query is entered and keep it out of unrelated route behavior.

### Acceptance gate

Automated and manual scenarios pass for:

- scientific, English, Danish, diacritic-insensitive, and specimen-ID queries;
- exact, prefix, alias, and credible misspelling ranking;
- class/order/family/genus result navigation;
- length/weight filtering in both result modes;
- unknown/not-applicable measurement exclusion and reset recovery;
- bidirectional family/name/measurement sorting in both result modes, including stable mode switches and largest-specimen species representatives;
- share/reload/back/forward state; and
- no-result recovery and full keyboard operation.

**Gate result:** Passed locally on 2026-08-22 as part of the combined Phase 3.2 milestone. The 67-document artifact contains 34 rank, 15 taxon, and 18 specimen documents compiled from published canonical records. Owner visual/product review remains open; no push/PR or remote CI was authorized.

## 8. Phase 5 — focused collection map

The owner deliberately narrowed this milestone to the geographic collection experience. The supporting/editorial routes previously grouped here remain a separately authorized future milestone and do not block the Phase 5 map gate.

### Dependencies

- Canonical specimen query/filter state is stable.
- Public location/precision data exists for representative exact and approximate cases; the retained list-only path covers unknown coordinates without inventing points.

### Map

- [x] Generate a deterministic schema-v2 map projection from every published specimen and point GeoJSON only from valid canonical coordinates, with display-only disambiguation for coincident approximate points.
- [x] Add route-only MapLibre dynamic import and an OpenFreeMap adapter with the supported Fiord, Dark, Positron, Liberty, and Bright vector styles.
- [x] Add class-specific exact/approximate markers, selected state, geodesic uncertainty areas, complete clustering, anchored specimen/cluster popups, attribution, key, and fit/reset behavior.
- [x] Keep marker-scale clustering near physical point contact, lock desktop popup placement to the left with viewport clamping, contain popup page scrolling, and preserve the camera across style changes and popup close according to filtered/unfiltered state.
- [x] Keep the desktop published-record rail open by default with an explicit hide/show control; use compact bilingual rows with enlarged lateral thumbnails, date/link footer ordering, and no redundant exact/approximate row labels.
- [x] Reuse the actual class marker assets in the map key, represent approximate markers and uncertainty areas with their rendered circular forms, and keep the key disclosure usable on mobile.
- [x] Synchronize specimen-based search, higher-rank scope, class/facets/ranges, map selection, URL state, and the complete semantic result list.
- [x] Implement `/map?specimen={id}` focus and honest recovery for unavailable IDs.
- [x] Add a nearby `View on map` action to specimen Collection records with valid public points while retaining the textual location/precision record as the non-map equivalent.
- [x] Verify no-JavaScript, no-WebGL, provider failure, keyboard clusters, mobile/landscape/reflow, reduced-motion, forced-color, route-bundle isolation, and unknown-coordinate fixture behavior.

### Deferred editorial/supporting routes

These items were explicitly removed from the focused map milestone. They require a separate owner authorization and their own content/citation review.

- [ ] Promote the existing preparation route shell into the Guides hub and complete cited/safety-reviewed preparation content.
- [x] Add the separately owner-authorized illustrated Measurements page at `/methodology` using five reviewed real-skull reference pairs, 21 canonical definitions, 24 registered SVG occurrences, a semantic table, responsive interaction, accessibility, and static fallback. Completed on 2026-08-30; the bounded owner-feedback v1/v2/v3 geometry/layout/detail/table/tooltip refinements and the latest table-row/map-menu follow-up were completed locally on 2026-08-31. Publication remains separate.
- [ ] Add age-estimation and specimen-condition methodology using owner-supplied/reviewed real-skull imagery and appropriate citations/species caveats.
- [ ] Add Contribution photography/metadata/rights protocol and reviewed contact link.
- [ ] Add About and Methodology.
- [ ] Add accurate Rights, Privacy, and Accessibility statements.
- [ ] Add article table of contents, figures, citations, callouts, and responsive prose components.

### Map acceptance gate

- [x] Every mapped record has equivalent list access and an exact specimen link.
- [x] Exact/approximate/unknown precision is understandable without color.
- [x] MapLibre is absent from non-map route bundles.
- [x] Search/filter/list/map/deep-link state remains synchronized and recoverable.
- [x] WebGL/provider failures retain the complete semantic experience.
- [x] No upload backend, cookie, tracking behavior, unsupported imagery style, or unrelated editorial scope has been introduced.

**Gate result:** Passed locally on 2026-08-28 on `agent/phase-5-map` and was published through PR #10 with passing remote CI, then merged into `main` with normal merge commit `f098caf` on 2026-08-29. The owner later authorized only the bounded Measurements supporting-page item above; all remaining items stay separately gated.

## 8.1 Owner-authorized Home redesign milestone

- [x] Replace the single featured-skull entrance with a server-rendered six-specimen field and a route-local progressive enhancement for bounded pointer depth, focus/touch identity, and explicit arrangement changes.
- [x] Derive three deterministic arrangements from canonical published records so all 18 physical specimens appear exactly once per cycle with exact stable specimen links; keep only one bounded state rendered at a time.
- [x] Preserve the canonical six-rank statistic strip.
- [x] Replace the retired Find a skull, Browse by class, Home Collection tree, Geographic records, and Behind the collection sections with one compact destination hub.
- [x] Add complete Species, static Map, Measurements, and Preparation cards plus a non-navigating `Coming soon` Skull Comparison preview based on the existing comparison engine.
- [x] Process the owner-authorized Preparation JPEG through a reproducible Home-media path that strips EXIF/GPS and validates the committed WebP during normal content/media checks.
- [x] Keep the route statically useful with no JavaScript and preserve MapLibre/search-index bundle isolation.
- [x] Verify desktop/tablet/360–390 px reflow, touch and keyboard navigation, reduced motion, forced colors, image failure, axe, no-JavaScript, build output, and zero horizontal overflow.

**Gate result:** Passed locally on 2026-09-01 on `agent/next-additions`. The coherent Home implementation is committed locally for owner review; no push, pull request, merge, deployment, or later phase is authorized.

## 9. Phase 6 — complete audited collection migration

### Dependencies

- User supplies completed/corrected metadata for unresolved rows and any missing accepted image sets.
- Rights/credits and public-note decisions are available.
- Phase 2 compiler/media contract is stable.
- The Phase 3.1 ID/URL map and [migration audit](phase_3_1_migration_audit.md) are treated as the starting checkpoint, not discarded.

### Ingestion

- [ ] Back up private originals outside Git.
- [ ] Reconcile all 22 legacy taxon rows and 51 specimen rows against the Phase 3.1 accepted/blocked ledger.
- [ ] Map replacement data into `taxa.csv`/`specimens.csv` without treating legacy row numbers as identity.
- [ ] Preserve and review Phase 3.1 immutable IDs/URLs; assign new IDs only to genuinely unmapped physical records.
- [ ] Review slugs, hierarchy, default specimens, and publication states.
- [ ] Separate private working notes from public prose.
- [ ] Verify taxonomy and resolve all blocking match flags.
- [ ] Validate dates, units, measurements, coordinates/precision, preparation, rights, and credits.
- [ ] Rename/process every accepted media set and review alpha/framing.
- [ ] Add concise cited profiles only where useful reviewed overview/identification content exists; otherwise keep the optional profile absent or draft without public placeholder prose.
- [ ] Keep incomplete records as drafts.
- [ ] Review repository size against the media-storage threshold.
- [ ] Normalize the partial exports currently retained under ignored `agent_context/metadata_csv/`; do not reuse their row-number IDs or extra spreadsheet-only helper columns as canonical identity.

### Acceptance gate

- Every published record passes executable content/media validation.
- Every published taxon has one valid default and every specimen URL resolves.
- Drafts are build-safe and absent from search, pages, sitemap, and map.
- Migration report explains transformations/rejections.
- Curator reviews a generated inventory of public locations, rights, credits, notes, and media before release hardening.

## 10. Phase 7 — release hardening and production

### Product and content completion

- [ ] Select final name, domain, central metadata, public email, and brand mark.
- [ ] Complete/review all in-scope editorial and policy pages.
- [ ] Resolve known issues or explicitly remove affected records/features from release scope.
- [ ] Verify rights for every public asset and data source.

### Quality and security

- [ ] Run Chromium/Firefox/WebKit journeys and visual snapshots.
- [ ] Complete manual keyboard, screen-reader, 200% zoom, forced-colors spot check, reduced-motion, mobile/tablet/desktop review.
- [ ] Meet Lighthouse and Core Web Vitals lab budgets.
- [ ] Scan broken links/media, drafts, unexpected console errors, and third-party requests.
- [ ] Validate titles/descriptions, canonical links, Open Graph, sitemap, robots, and JSON-LD.
- [ ] Add and verify least-privilege CSP, HSTS, content-type, permissions, and referrer headers.
- [ ] Review dependencies and remediate security findings.

### Deployment and release

- [ ] Create/configure Vercel project and GitHub preview deployments.
- [ ] Confirm plan terms are appropriate before any commercial use or material traffic.
- [ ] Configure production only from `main` and attach custom domain.
- [ ] Verify production independently, including map provider attribution and headers.
- [ ] Test rollback to the prior Vercel deployment and Git checkpoint.
- [ ] Tag `v1.0.0`, publish release notes, and record release evidence/status.

### Acceptance gate

All product acceptance criteria in [project_overview.md](project_overview.md) and automated/manual release checks pass. Rollback is tested. Production matches the tagged commit with no private/staging content.

## 11. Cross-cutting test matrix

| Layer | Required coverage |
|---|---|
| Domain | CSV parsing, missing semantics, dates, coordinates, units, IDs, links, defaults, publication, taxonomy review |
| Queries | hierarchy, default specimen, grouping/ranges, filters, sorting, related taxa, route generation |
| Media | naming, view completeness, alpha, dimensions, metadata stripping, deterministic bounds/output |
| Search | ranking, aliases, diacritics, ranks, IDs, fuzzy fallback, filters, URL state |
| Components | names/roles, focus, gallery, selector, filters, dialogs, measurement/timeline display, axe |
| Browser | primary journeys, deep links, reload/history, 404/empty, keyboard, reduced motion, responsive layouts |
| Release | browser matrix, visual diffs, links/media, metadata/JSON-LD, budgets, headers, third parties, rights |

Unit tests should target meaningful invariants rather than implementation line coverage. Browser tests cover user journeys, not every styling branch.

## 12. Performance budgets

- Lighthouse mobile: Performance ≥90; Accessibility, Best Practices, and SEO ≥95.
- LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms under the documented CI lab profile.
- Shared initial JavaScript ≤170 KB gzip, excluding lazy `/map` code.
- Above-the-fold mobile image ≤250 KB where visual credibility permits.
- MapLibre never loads outside `/map`.
- Only the active above-fold gallery image is eager.
- Material budget regressions fail CI after the Lighthouse gate is introduced.

## 13. Definition of done for any task

A task is done only when:

- behavior and non-goals match the active issue/phase;
- types and domain boundaries remain explicit;
- keyboard, mobile, missing/error, and reduced-motion states were considered;
- rights/privacy/security implications were considered;
- appropriate tests pass and new risk has coverage;
- documentation and `AGENTS.md` are updated when sources/rules/commands change;
- no generated/private/unrelated files are staged; and
- `docs/project_status.md` records material phase evidence or a blocker.

## 14. GitHub issue and milestone structure

After Phase 0/1:

- Create one milestone per active phase, not all speculative work at once.
- Create issues for bounded deliverables with dependency, acceptance, test, and documentation notes.
- Use labels such as `area:data`, `area:media`, `area:ui`, `area:a11y`, `area:docs`, `type:feature`, `type:bug`, and `status:blocked` only when useful.
- Branch from updated `main` using `agent/<short-description>`.
- Prefer focused draft pull requests that close one coherent issue or vertical sub-slice.
- Keep future ideas in this document's deferred backlog until promoted through planning.

## 15. Deferred backlog and prerequisites

### Skull comparison

Phase 2.2 completed the reusable calibrated foundation on the specimen page: explicit lateral orientation, generated transparent subject bounds, one shared maximum-length scale, a reference/specimen selector, approximate-value labels, and semantic measurement differences. A dedicated public comparison route with two independent selectors, overlays, split-slider, opacity controls, shareable state, and non-calibrated-record handling remains deferred until enough reviewed specimens exist and keyboard-equivalent behavior is designed.

### Specimen-location map action

Phase 5 completed the concise `View on map` action beside Collection record location data when a valid public point exists. It opens the accessible `/map?specimen={id}` route with the corresponding marker, popup, and list row selected. An embedded specimen-page modal remains deliberately deferred; it must not duplicate map state or violate the route-only MapLibre bundle boundary without an explicit architecture revision.

### 360° rotation

Requires dedicated turntable capture, angle naming/order, consistent center/scale/lighting, efficient sequence delivery, touch/keyboard controls, and static fallback. Six standard views cannot be interpolated and presented as documentary 360° evidence.

### 3D models

Requires accurate source models, rights, file-size/LOD strategy, accessible fallback, viewer performance, and `MediaAsset` extension.

### Animal-around-skull illustration

Requires separate labelled illustration assets, species-consistent art direction, alignment review, rights/provenance, and clear separation from documentary photography.

### Direct contributions

Requires object storage, signed uploads, submission state, structured consent/right grant, malware scanning, moderation, notifications, rate/abuse controls, data retention/deletion, privacy policy, and secure administration.

### Database/admin interface

Consider only when CSV/Git review measurably fails for collection scale or curator workflow. Requires migration/rollback, authentication, authorization, audit log, backups, preview/publication states, and new operational ownership.

### Analytics

Requires explicit questions, minimal event design, provider/privacy assessment, consent decision, retention, policy update, and measurable benefit. Hosting/synthetic checks remain enough for v1.

### Full Danish interface

Requires route/locale strategy, translated UI/editorial content, search language behavior, hreflang/canonical design, and ongoing parity ownership.

### Dataset export/API

Requires a deliberate data licence, field-level privacy/rights review, versioning, provenance, citation format, and support expectations.

## 16. Plan change control

Update this plan when scope, order, gates, or deferred prerequisites change. Also update:

- `project_overview.md` for product behavior;
- `architecture.md` and an ADR for material technical changes;
- `content_data_model.md` for source contracts;
- `design_system.md` for cross-component design rules;
- `project_status.md` for current truth; and
- `AGENTS.md` whenever agents need a new rule, command, document, or context source.

Do not overwrite historical ADRs. Supersede them with a new record and links.
