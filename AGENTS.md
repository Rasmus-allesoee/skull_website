# AGENTS.md — Skull Collection repository index

This file is the mandatory entrypoint for every coding agent or maintainer working in this repository. Read it before editing. Keep it current whenever important rules, plans, Markdown documents, commands, or context sources are added or changed.

## 0. RASMUS INFORMATION TO AGENT (DON'T DELETE)

### Ask when my preference matters

When a decision is subjective, has meaningful tradeoffs, or depends on my preferences, ask me before choosing. Present the main options with a brief explanation of the tradeoffs, clearly indicate your recommended option, and let me select.

Do not ask about routine implementation details, obvious best practices, or choices that are easily reversible and do not meaningfully affect the result.

When uncertain whether my opinion matters, prefer asking rather than assuming.

### GitHub authentication

GitHub authentication is verified valid in the user’s regular Terminal; if Codex’s sandbox reports an invalid token, treat it as an environment mismatch, and use the available authenticated GitHub integration for remote operations.

## 1. Mission and current boundary

Build a fast, visually led online natural-history museum for animal skulls. Photography leads; taxonomy, measurements, specimen provenance, preparation, rights, and citations are progressively disclosed.

Current phase: **the owner-authorized Home redesign is implemented and verified locally on `agent/next-additions`; `/` is ready for owner review, but it has not been pushed or published**. The same branch retains the locally verified Measurements milestone and its bounded feedback refinements. The focused map-only Phase 5 implementation remains merged into `main` at `f098caf`, and the combined Phase 3.2/4 work remains merged at `9a0e1d0`. Age/condition methodology, other supporting/editorial pages, the optional Phase 3.3 comprehensive tree, and Phase 6 remain deferred. Consult `docs/project_status.md` for exact evidence and the next action. Do not publish this milestone or begin another scope without explicit owner authorization.

Use the neutral working title **Skull Collection** from central site configuration until the final name is selected.

## 2. Mandatory reading order

1. `AGENTS.md` — repository rules and source hierarchy.
2. `docs/project_status.md` — current phase, completed work, blockers, evidence, exact next action.
3. The active task/issue and relevant section of `docs/implementation_plan.md`.
4. `docs/project_overview.md` — product scope, routes, journeys, and feature requirements.
5. `docs/architecture.md` — technical boundaries, rendering, data flow, and integration rules.
6. `docs/content_data_model.md` for any content, taxonomy, ID, CSV, citation, measurement, location, or media change.
7. `docs/design_system.md` for any UI, content presentation, interaction, responsive, motion, or accessibility change.
8. Relevant accepted records in `docs/decisions/`.
9. `docs/competitive_audit.md` only when working from reference-site patterns.

The historical approved master plan is `agent_context/website_plan_from_planmode.md`. Canonical working guidance now lives in `docs/`; do not create a competing plan. If documents conflict, stop, identify the conflict, update the canonical sources deliberately, and record material decisions as an ADR.

## 3. Non-negotiable product rules

- English interface; scientific, English, and Danish names/aliases searchable.
- Species/taxa are the primary browsing experience; every physical skull has a stable nested specimen URL.
- Taxon/specimen identity, public slugs, and published URLs are never silently regenerated.
- Uncertain and genus-level identifications are permitted only with explicit rank/qualifier/confidence labels.
- Missing data never becomes zero or a fabricated date. Use “Not recorded” and “Not applicable” semantics.
- Exact public coordinates are used when explicitly known; approximate and unknown precision remain explicit. Never infer points from locality text or image EXIF.
- v1 has no accounts, direct uploads, runtime database/CMS, analytics/cookies, 360°, 3D, or AI animal overlays.
- Contribution v1 is requirements guidance plus contact only.
- The public repository contains curated public assets only.
- Code is MIT; photographs, written content, and collection data remain separately reserved under `RIGHTS.md`.
- Prioritize technically appropriate, extensible solutions. Do not weaken architecture merely because the owner is new to web development; explain choices clearly instead.

## 4. Architecture invariants

- Pinned Node.js 24.18.0, pnpm 11.21.0, Next.js 16.2.12, React 19.2.8, strict TypeScript.
- Next.js App Router and React Server Components by default; client islands only for search/filters, gallery, calibrated comparison, guidance/specimen-chooser dialogs, a future interactive tree, and MapLibre.
- Known public routes are statically generated and useful before interactive JavaScript finishes.
- Canonical structured sources are two UTF-8 linked CSVs (`taxa.csv`, `specimens.csv`), cited MDX, and reviewed media/reference declarations.
- Normal builds never call a live spreadsheet, GBIF, map API, or runtime database.
- Taxonomy refresh is explicit, reviewed, snapshotted, and never silently rewrites identifications.
- Generated JSON/search/GeoJSON is replaceable, ignored build output—not hand-edited source.
- MapLibre loads only on `/map`; every map record has an equivalent semantic list path.
- The `/methodology` measurement reference compiles 21 reviewed definitions and 24 registered SVG occurrences across five curated raw-image derivatives. Annotated positional sources remain ignored evidence; the production page uses only metadata-stripped WebPs plus programmatic SVG geometry, non-destructive registered presentation viewports, adaptive viewport-aware tooltips/previews, and a complete semantic table.
- Home server-renders one complete ten-slot field state and progressively enhances only that field. Three bounded arrangements expose every one of the 18 published physical specimens across the cycle, with deliberate overlap between states and a lateral-dominant mix of canonical alternate views; each image retains its canonical `MediaAsset` identity and exact specimen route. Stable link hitboxes remain fixed while only the visual image responds to focus/parallax. Home never loads MapLibre or the catalog search index.
- Page code consumes typed records and `MediaAsset` interfaces, not constructed filenames or raw CSV rows.
- True-to-scale comparison uses a canonical lateral-view maximum length, compiled transparent subject bounds, and explicit lateral orientation. Approximate reference measurements must remain labelled as approximate.
- The schema-version-4 measurement model stays unified in `specimens.csv`: mammal, bird, and fallback profiles control applicability and presentation without parallel specimen tables. Class-specific fields require explicit `not_applicable` status outside their profile.
- The catalog taxonomy drawer, no-JavaScript nested list, rank pages, search rank documents, and cards are projections of the same published class → order → family → genus → taxon hierarchy. Any comprehensive Phase 3.3 tree must preserve tree/list route parity and cannot invent group characteristics or divergence claims.
- Catalog query state is URL-backed on `/species`: `q`, `mode`, `class`, `scope`, controlled-value filters, length/mass bounds, and `sort` restore on direct load, reload, and browser history. The generated Orama artifact is replaceable ignored output and loads only after a query is entered.
- Accessibility targets WCAG 2.2 AA and is part of component/API design, not a later overlay.

## 5. Content and media safety

Local context paths:

- `agent_context/skulls_meta.csv` — incomplete illustrative draft; ignored by Git; never production input.
- `agent_context/skull_images_clean/` — local high-resolution staging images; ignored by Git; never publish directly.
- `agent_context/species_list.md` — rough inventory; not verified taxonomy.
- `agent_context/prompt_initial_plan.md` — original user brief.
- `agent_context/prompt_begin_phase_1.md` — Phase 0/1 authorization.
- `agent_context/website_plan_from_planmode.md` — approved historical master plan.
- `agent_context/prompt_phase_2_raccoon_dog_slice_feedback.md` — owner review that defines the Phase 2.1 refinement scope.
- `agent_context/prompt_phase_2.1_raccoon_dog_slice_feedback.md` — owner review that defines the Phase 2.2 refinement scope.
- `agent_context/implement_interactive_true_to_scale_skull_comparison.md` — owner-approved functional specification for the Phase 2.2 comparison component.
- `agent_context/website_screenshots/` — owner-supplied visual targets and defect evidence for Phase 2.2; context only, never runtime assets.
- `agent_context/class_aware_dynamic_measurement_architecture.md` — Phase 3 design input for the implemented class-aware measurement profiles and comparison matrices; canonical rules live in `docs/` and executable schemas.
- `agent_context/prompt_phase_3_feedback.md` — owner feedback defining the bounded Phase 3.1 catalog/migration/refinement scope.
- `agent_context/interactive_taxonomic_tree_plan.md` — owner product direction for the Phase 3.1 tree foundation and future comprehensive Phase 3.3 experience; canonical guidance lives in `docs/interactive_taxonomic_tree.md`.
- `agent_context/interactive_tree_sketch.png` and the Phase 3.1 reference-site screenshots — local visual context only, never runtime assets.
- `agent_context/metadata_csv/` — ignored partial spreadsheet exports supplied during Phase 3; migration evidence only, never runtime or canonical input.
- `agent_context/prompt_species_page_redesign_suggestions.md` and `agent_context/species_page_redesign_phase_3_2.md` — owner-approved input and binding Phase 3.2/Phase 4 catalog specification; canonical implemented behavior lives in `docs/`.
- `agent_context/phase_5_map_feature_plan.md` — owner-authored map-only Phase 5 implementation brief; supporting/editorial pages remain deferred.
- `agent_context/home_page_plan.md` — owner-authored Home-page redesign implementation brief covering the interactive specimen-field entrance, live collection statistics, destination hub cards, static map preview, and current-route boundaries.
- `agent_context/home_page/interactive_parallax_specimen_field_plan.md` — owner-authored Home hero specification for the interactive parallax specimen field, including its visual intent, interaction, responsive behavior, source boundaries, and acceptance criteria.
- `agent_context/home_page/interactive_parallax_specimen_field_mockup_v1.png` — visual concept reference for the Home hero; context only, never a runtime asset.
- `agent_context/measurement_page_plan.md` — owner-authored measurement-page product specification covering the `/methodology` reference page, programmatic SVG overlays, supplied measurement definitions, interaction, and acceptance criteria.
- `agent_context/measurement_page_feedback_v1.md` — bounded owner review of the first `/methodology` implementation; owns the refined geometry, compact detail surface, diagram order/cropping, mobile preview, and table-linking requirements.
- `agent_context/mobile_tooltip_too_large_hide_skull.png` — owner visual evidence for the v3 mobile preview refinement; context only, never a runtime asset.
- `agent_context/measurement_page/` — local measurement-page staging context: annotated positional references, the supplied measurement-description CSV, and the source prompt; these inputs are not runtime assets until explicitly promoted through the canonical content/media pipeline.
- `agent_context/website_screenshots/localhost_3000_species.png` — ignored before-state visual evidence only, never a runtime asset.

Phase 2 uses only staging metadata row `ID = 1` and the six `mårhund_*_1.png` files as migration evidence for `TAX-0001` / `SPEC-0001`. The reviewed canonical values live in `content/`; never make a normal build depend on the ignored staging sources. Owner feedback supersedes the initial slice's display wording and condition classification, but it does not authorize inventing unrecorded pathology, trauma, teeth-set, skeleton, age-evidence, or reuse facts. The Phase 2.2 adult-human comparison source is also ignored staging input; only its reviewed declaration and processed public WebP derivative belong in Git.

Phase 3.0 expanded the one canonical `specimens.csv` header with reviewed mammal/bird measurement fields and explicit statuses. Phase 3.1 later normalized only the 15-taxon/18-specimen review slice that could be reconciled to 104 cleaned images and satisfy the current publication contract. Raw exports/masters remain ignored, 33 legacy specimen rows remain blocked migration candidates, and Phase 6 must complete the full row/rights/note/media/publication audit recorded in `docs/phase_3_1_migration_audit.md`.

Archival `.af`, PSD, camera originals, TIFF/PNG masters, raw workbooks, private notes, and EXIF/GPS-bearing media stay outside Git. Public specimen derivatives use immutable specimen IDs and canonical views only after `pnpm media:process` and `pnpm validate:media` confirm metadata stripping and the rest of the media contract. Public comparison references use stable reference IDs and the separate `pnpm media:process:reference` maintenance command.

Before any content/media edit, read `docs/content_data_model.md`. Do not invent stable IDs, taxonomy, measurements, rights, credits, dates, or public-safe notes. Drafts may be incomplete but must remain build-safe and unpublished.

## 6. Repository map

```text
src/                 application routes, features, typed domain/compiler and data loading
content/             canonical CSV, reviewed MDX, media declarations, taxonomy snapshots
public/media/        curated validated WebP derivatives only
scripts/             content, taxonomy, fixture and media tooling
tests/e2e/           Playwright journeys and accessibility smoke tests
docs/                canonical specifications, status, and ADRs
.github/              CI, issue forms, PR template, dependency updates
agent_context/        planning context plus ignored local source/staging data
```

Do not move responsibilities across these boundaries casually. Material source-of-truth, URL, identity, deployment, rights, or cross-cutting technology changes require an ADR.

## 7. Commands and quality gate

Use the pinned toolchain and frozen lockfile:

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Available focused commands are documented in `README.md`. `validate:content`, `validate:media`, and `test:fixtures` are real blocking checks; `content:build` emits replaceable ignored artifacts. Taxonomy refresh and media staging/processing are explicit maintainer commands, never implicit build steps.

Before a checkpoint:

- run the checks proportionate to the change;
- inspect staged paths/diff and ignored-file behavior;
- ensure private/staging/generated/unrelated files are absent;
- update canonical docs and this file when rules/commands/context changed; and
- add exact verification evidence and next action to `docs/project_status.md`.

## 8. Git and GitHub workflow

- Initial repository bootstrap occurs on `main` as explicitly approved.
- `main` is the stable, deployable integration branch. For this solo project, do not create a permanent `dev` branch; use short-lived task branches instead.
- After bootstrap, branch from the latest `main` using `agent/<short-description>` and use focused draft pull requests.
- Keep each branch and pull request focused on one phase, coherent feature, or independent fix. If an unrelated bug or improvement is discovered during a phase, record it separately, create a new branch from the latest `main`, and merge that fix into `main` before merging the updated `main` back into the phase branch. A change may remain in the phase branch when it is genuinely required for that phase.
- Use conventional commit prefixes such as `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, and `ci:`.
- Never stage unrelated user files silently. Audit the complete scope before commit/push.
- One coherent verified checkpoint closes each phase; do not mark status complete on code presence alone.
- Stage and commit each coherent implementation or fix as its own checkpoint; do not accumulate unrelated changes into one giant commit.
- Preserve meaningful commit history. Merge completed pull requests with GitHub's `Create a merge commit` / a normal non-squash merge so individual coherent commits remain visible; do not squash or rewrite them unless the owner explicitly requests it.
- After a merge, update local `main` and create the next task branch from the updated `main` rather than from a stale feature branch. Preserve merged feature branches locally and remotely by default; delete one only when the owner explicitly requests deletion. Avoid rebasing or force-pushing branches that have been published for review.
- GitHub issues/milestones are the active implementation tracker. Do not add a second competing tracker.
- Production later deploys only from `main`; no production/Vercel configuration belongs to Phase 3.

## 9. Documentation ownership

| Document | Owns |
|---|---|
| `README.md` | Setup, commands, high-level repository orientation |
| `docs/project_overview.md` | Product vision, scope, routes, page/feature behavior |
| `docs/competitive_audit.md` | Dated reference-site evidence and adopted/rejected patterns |
| `docs/architecture.md` | Technical system, boundaries, integrations, deployment/testing strategy |
| `docs/content_data_model.md` | IDs, fields, controlled values, taxonomy, citations, media, validation |
| `docs/design_system.md` | Visual tokens, components, interaction, content voice, accessibility |
| `docs/implementation_plan.md` | Phase order, deliverables, dependencies, gates, deferred backlog |
| `docs/project_status.md` | Current truth, verification, blockers, next actions, checkpoint log |
| `docs/phase_3_1_migration_audit.md` | Accepted/blocked review-slice records, normalization decisions, Phase 6 obligations |
| `docs/interactive_taxonomic_tree.md` | Phase 3.1/tree-drawer foundations and comprehensive Phase 3.3 requirements |
| `docs/decisions/*.md` | Historical material architecture decisions |
| `CONTRIBUTING.md` | Contributor branch/PR and quality workflow |
| `RIGHTS.md` | Code versus content/media/data rights boundary |

Update documents in the same change as behavior. Do not leave important decisions only in chat, issue comments, or code.

## 10. Definition of done

Work is done only when it matches active scope, handles relevant mobile/keyboard/missing/error/reduced-motion states, respects rights/privacy/security, passes appropriate checks, updates documentation, preserves source boundaries, contains no unrelated/private files, and leaves `docs/project_status.md` accurate.

If blocked by credentials, missing content decisions, rights, or external state, complete all safe local work, record exact evidence and the smallest required user action, then stop without claiming the phase gate passed.
