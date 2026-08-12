# Implementation plan

**Status:** Approved phased roadmap

**Current phase:** Phase 0/1 — documentation and repository foundation

**Last reviewed:** 2026-08-12

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
Phase 4 search and faceted discovery
        ↓
Phase 5 map and required editorial/supporting pages
        ↓
Phase 6 full reviewed collection ingestion
        ↓
Phase 7 release hardening, production, and v1.0.0
```

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

- [ ] Verify GitHub CLI authentication for `Rasmus-allesoee`.
- [ ] Create public `Rasmus-allesoee/skull_website` with the local repository as source.
- [ ] Commit the reviewed foundation on `main` using a conventional commit.
- [ ] Push and verify the remote/default branch and GitHub Actions run.
- [ ] Record commit, remote, command evidence, and remaining environment notes in `project_status.md`.

### Acceptance gate

- A fresh clone on the pinned Node version installs with `pnpm install --frozen-lockfile`.
- Formatting, lint, typecheck, unit tests, production build, and Chromium smoke/accessibility test pass.
- `git status` is clean after the checkpoint.
- The GitHub repository is public and points to the intended initial commit.
- Ignored local draft metadata and staged images are absent from the remote.
- All canonical documents and `AGENTS.md` agree that Phase 2 is next and no Phase 2 feature is presented as complete.

## 5. Phase 2 — validated vertical slice

### Dependencies

- Phase 0/1 gate complete.
- One approved representative taxon and exact physical specimen selected from local staging.
- Stable specimen/taxon IDs and public rights/credits confirmed for that slice.

### Data and compiler

- [ ] Add header-only/representative `taxa.csv` and `specimens.csv` sources matching the approved model.
- [ ] Implement pure domain types and executable input schemas.
- [ ] Implement CSV parsing with row/field diagnostics and missing-value semantics.
- [ ] Implement relationship, publication, partial-date, coordinate, default-specimen, and measurement validation.
- [ ] Define deterministic generated-artifact locations and build command.
- [ ] Add real `validate:content` and tests for both valid and invalid fixtures.
- [ ] Define MDX profile frontmatter, allowed components, and citation validation.

### Taxonomy

- [ ] Implement explicit GBIF/Catalogue of Life refresh command with cached dated snapshot.
- [ ] Prevent normal builds from making network requests.
- [ ] Require review for fuzzy, synonym, conflicting, or higher-rank matches.
- [ ] Validate the representative taxon's scientific/common/Danish names and hierarchy.

### Media

- [ ] Finalize canonical view names against the real six-view set.
- [ ] Implement Sharp processing: sRGB, orientation, metadata stripping, alpha/dimension/file checks, subject bounds, WebP output.
- [ ] Add `validate:media` with actionable diagnostics.
- [ ] Rename representative inputs by immutable specimen ID and generate curated public derivatives.
- [ ] Confirm repository/media size and visual alpha quality.

### Representative exhibit

- [ ] Add static taxon and nested specimen routes with correct default selection and metadata.
- [ ] Build the responsive six-view gallery with keyboard, swipe, zoom/fullscreen, and reduced-motion support.
- [ ] Build taxonomic breadcrumb, identification/confidence labels, specimen selector, cited profile, measurement panel/diagram, provenance, preparation timeline, rights, and citations.
- [ ] Implement missing/unknown/not-applicable and incomplete-media states.
- [ ] Self-host Newsreader and IBM Plex Sans with licence files.
- [ ] Validate real-image performance and responsive treatment.

### Automated and manual verification

- [ ] Unit-test parser, identifiers, links, dates, missing values, taxonomy outcomes, rights, and media naming.
- [ ] Component-test gallery, selector, data groups, timeline, focus, and axe output.
- [ ] Browser-test taxon/default and exact-specimen deep links at desktop and 360–390 px.
- [ ] Manually inspect all six views, focus paths, zoom, reduced motion, and no-JavaScript core content.

### Acceptance gate

- One complete source → validation → generated data/media → static taxon/specimen journey works in a clean build.
- Invalid representative fixtures fail with actionable messages.
- No EXIF/GPS or archival source reaches public output.
- The user explicitly approves the real vertical slice's visual direction, information density, and interactions before Phase 3 scales it.

## 6. Phase 3 — museum shell and catalog

### Dependencies

- Phase 2 vertical slice and visual direction approved.
- Shared exhibit components stable enough to repeat.

### Shell and foundational routes

- [ ] Implement final responsive header, mobile navigation, skip link, footer, and central site configuration.
- [ ] Implement Home with featured exhibit, real collection counts, class entries, search entry, map preview, and editorial prompts.
- [ ] Add route-level not-found/error/loading states only where real latency exists.
- [ ] Add supporting SEO metadata helpers and default Open Graph treatment.

### Taxonomy and catalog

- [ ] Generate class/order/family/genus route params from canonical records.
- [ ] Implement shared rank landing template, breadcrumbs, child index, and scoped gallery.
- [ ] Implement `/species` default catalog, representative class cards, taxonomy index, sorting foundation, and responsive cards.
- [ ] Implement species and specimen card modes using canonical queries.
- [ ] Add related taxa and default-specimen routing/redirect tests.
- [ ] Add sitemap/robots coverage for current published routes.

### Acceptance gate

- A complete keyboard/mobile journey works from Home → class → family → taxon → exact specimen without search or map.
- Static output contains correct names, links, metadata, default specimens, and no drafts.
- Visual states are consistent across mammals, birds, long names, uncertain taxa, missing optional angles, and multiple specimens.

## 7. Phase 4 — search and faceted exploration

### Dependencies

- Canonical catalog routes and query functions complete.
- Sufficient representative records/fixtures for meaningful ranking and grouping tests.

### Index and query model

- [ ] Generate deterministic Orama rank, taxon, and specimen documents.
- [ ] Add normalized scientific/English/Danish/alias/ID fields without changing display values.
- [ ] Implement exact → prefix → alias/synonym → fuzzy → profile-text ranking.
- [ ] Add class/order/family/genus facets and skull-length/skull-weight numeric facets.
- [ ] Define species-mode grouping/count/range and specimen-mode matching behavior.

### Interface and URLs

- [ ] Build accessible global suggestions grouped by result type.
- [ ] Build catalog search, filter, sort, active-filter, clear, no-result, and mode controls.
- [ ] Serialize all meaningful state to stable query parameters.
- [ ] Restore state on direct load, refresh, and browser back/forward.
- [ ] Lazy-load index code/data only where search is available and measure shared bundle impact.

### Acceptance gate

Automated and manual scenarios pass for:

- scientific, English, Danish, diacritic-insensitive, and specimen-ID queries;
- exact, prefix, alias, and credible misspelling ranking;
- class/order/family/genus result navigation;
- length/weight filtering in both result modes;
- unknown/not-applicable measurement exclusion and reset recovery;
- share/reload/back/forward state; and
- no-result recovery and full keyboard operation.

## 8. Phase 5 — map and editorial/supporting pages

### Dependencies

- Canonical specimen query/filter state is stable.
- Public location/precision data exists for representative exact, approximate, and unknown cases.
- Required editorial claims have sources or explicit draft states.

### Map

- [ ] Generate deterministic GeoJSON from valid published specimen coordinates.
- [ ] Add route-only MapLibre dynamic import and provider configuration adapter.
- [ ] Add clustered exact/approximate markers, selected state, popups, controls, attribution, and fit/reset behavior.
- [ ] Synchronize map and complete searchable/filterable result list.
- [ ] Implement `/map?specimen={id}` focus and recovery for unavailable IDs.
- [ ] Test no-WebGL, keyboard, mobile, reduced-motion, provider failure, and unknown-coordinate behavior.

### Editorial/supporting routes

- [ ] Add Guides hub and cited preparation-guide shell/content.
- [ ] Add Contribution photography/metadata/rights protocol and reviewed contact link.
- [ ] Add About and Methodology.
- [ ] Add accurate Rights, Privacy, and Accessibility statements.
- [ ] Add article table of contents, figures, citations, callouts, and responsive prose components.

### Acceptance gate

- Every mapped record has equivalent list access and an exact specimen link.
- Exact/approximate/unknown precision is understandable without color.
- MapLibre is absent from non-map route bundles.
- Editorial pages have reviewed structure, links, citations/safety states, and mobile/keyboard behavior.
- No upload backend, cookie, or tracking behavior has been introduced.

## 9. Phase 6 — full collection ingestion

### Dependencies

- User supplies replacement completed metadata exports and cleaned images with specimen IDs.
- Rights/credits and public-note decisions are available.
- Phase 2 compiler/media contract is stable.

### Ingestion

- [ ] Back up private originals outside Git.
- [ ] Map replacement data into `taxa.csv`/`specimens.csv` without treating legacy rows as identity.
- [ ] Assign and review immutable IDs, slugs, hierarchy, default specimens, and publication states.
- [ ] Separate private working notes from public prose.
- [ ] Verify taxonomy and resolve all blocking match flags.
- [ ] Validate dates, units, measurements, coordinates/precision, preparation, rights, and credits.
- [ ] Rename/process every accepted media set and review alpha/framing.
- [ ] Add concise cited profiles for publishable taxa or transparent pending states.
- [ ] Keep incomplete records as drafts.
- [ ] Review repository size against the media-storage threshold.

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

Requires calibrated scale, consistent lateral orientation, generated subject bounds, and honest handling of non-calibrated records. Then consider overlay, split-slider, and opacity modes with keyboard equivalents.

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
