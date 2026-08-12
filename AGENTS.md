# AGENTS.md — Skull Collection repository index

This file is the mandatory entrypoint for every coding agent or maintainer working in this repository. Read it before editing. Keep it current whenever important rules, plans, Markdown documents, commands, or context sources are added or changed.

## 1. Mission and current boundary

Build a fast, visually led online natural-history museum for animal skulls. Photography leads; taxonomy, measurements, specimen provenance, preparation, rights, and citations are progressively disclosed.

Current phase: **Phase 0/1 — documentation and repository foundation**. Consult `docs/project_status.md` for the exact current state and evidence. Do not begin Phase 2 or implement catalog/search/map/full-ingestion features without explicit user continuation after the Phase 0/1 gate.

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
- Next.js App Router and React Server Components by default; client islands only for search/filters, gallery controls, and MapLibre.
- Known public routes are statically generated and useful before interactive JavaScript finishes.
- Canonical structured sources are two UTF-8 linked CSVs (`taxa.csv`, `specimens.csv`) plus cited MDX.
- Normal builds never call a live spreadsheet, GBIF, map API, or runtime database.
- Taxonomy refresh is explicit, reviewed, snapshotted, and never silently rewrites identifications.
- Generated JSON/search/GeoJSON is replaceable, ignored build output—not hand-edited source.
- MapLibre loads only on `/map`; every map record has an equivalent semantic list path.
- Page code consumes typed records and `MediaAsset` interfaces, not constructed filenames or raw CSV rows.
- Accessibility targets WCAG 2.2 AA and is part of component/API design, not a later overlay.

## 5. Content and media safety

Local context paths:

- `agent_context/skulls_meta.csv` — incomplete illustrative draft; ignored by Git; never production input.
- `agent_context/skull_images_clean/` — local high-resolution staging images; ignored by Git; never publish directly.
- `agent_context/species_list.md` — rough inventory; not verified taxonomy.
- `agent_context/prompt_initial_plan.md` — original user brief.
- `agent_context/prompt_begin_phase_1.md` — Phase 0/1 authorization.
- `agent_context/website_plan_from_planmode.md` — approved historical master plan.

Archival `.af`, PSD, camera originals, TIFF/PNG masters, raw workbooks, private notes, and EXIF/GPS-bearing media stay outside Git. Future public derivatives use immutable specimen IDs and canonical views after the Phase 2 media pipeline validates and strips metadata.

Before any content/media edit, read `docs/content_data_model.md`. Do not invent stable IDs, taxonomy, measurements, rights, credits, dates, or public-safe notes. Drafts may be incomplete but must remain build-safe and unpublished.

## 6. Repository map

```text
src/                 application routes, components, domain/query code
content/             future canonical CSV and MDX sources
public/media/        future curated web-ready derivatives only
scripts/             future validation, taxonomy, and media tooling
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

Available focused commands are documented in `README.md`. Content/media validation commands do not exist until Phase 2 implements real schemas/pipelines; never add misleading no-op checks.

Before a checkpoint:

- run the checks proportionate to the change;
- inspect staged paths/diff and ignored-file behavior;
- ensure private/staging/generated/unrelated files are absent;
- update canonical docs and this file when rules/commands/context changed; and
- add exact verification evidence and next action to `docs/project_status.md`.

## 8. Git and GitHub workflow

- Initial repository bootstrap occurs on `main` as explicitly approved.
- After bootstrap, branch from current `main` using `agent/<short-description>` and use focused draft pull requests.
- Use conventional commit prefixes such as `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, and `ci:`.
- Never stage unrelated user files silently. Audit the complete scope before commit/push.
- One coherent verified checkpoint closes each phase; do not mark status complete on code presence alone.
- GitHub issues/milestones are the active implementation tracker. Do not add a second competing tracker.
- Production later deploys only from `main`; no production/Vercel configuration belongs to Phase 0/1.

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
| `docs/decisions/*.md` | Historical material architecture decisions |
| `CONTRIBUTING.md` | Contributor branch/PR and quality workflow |
| `RIGHTS.md` | Code versus content/media/data rights boundary |

Update documents in the same change as behavior. Do not leave important decisions only in chat, issue comments, or code.

## 10. Definition of done

Work is done only when it matches active scope, handles relevant mobile/keyboard/missing/error/reduced-motion states, respects rights/privacy/security, passes appropriate checks, updates documentation, preserves source boundaries, contains no unrelated/private files, and leaves `docs/project_status.md` accurate.

If blocked by credentials, missing content decisions, rights, or external state, complete all safe local work, record exact evidence and the smallest required user action, then stop without claiming the phase gate passed.
