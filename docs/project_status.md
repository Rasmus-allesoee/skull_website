# Project status

**Snapshot date:** 2026-08-12

**Current phase:** Phase 0/1 — documentation and repository foundation

**Overall state:** Local foundation verified; GitHub publication in progress

**Next phase:** Phase 2 — validated vertical slice (not started; requires Phase 0/1 gate and user continuation)

## 1. Current objective

Encode the approved master plan as canonical repository documentation, establish the reproducible Next.js/TypeScript baseline, initialize and publish the public GitHub repository, and verify a clean install/build/test checkpoint. No catalog, data compiler, specimen page, search, or map feature is in scope for this checkpoint.

## 2. Completed in this checkpoint

- Approved master plan read from `agent_context/website_plan_from_planmode.md`.
- Current source context inspected: incomplete draft metadata, species notes, and local cleaned-image staging.
- Complete documentation suite created under `docs/` plus root README, contribution, licence, and rights guidance.
- Material baseline decisions recorded as ADRs.
- `AGENTS.md` converted into the mandatory project index.
- Repository policies, safe ignore boundaries, contribution workflow, issue forms, pull-request template, Dependabot, and CI skeleton created.
- Node.js 24.18.0 and pnpm 11.21.0 pinned; dependency graph locked with explicit pnpm 11 build-script allowlisting and no peer issues.
- Minimal accessible App Router foundation page, semantic design tokens, central site configuration, static icon, unit test, and browser/axe test implemented.
- Git initialized on `main`; ignored staging/private/generated paths checked explicitly.
- Local quality, build, browser, accessibility, desktop, and 390 px visual checks pass.

## 3. In progress

- Exact first-commit staged-file audit and commit.
- Clean-clone installation/build verification.
- GitHub CLI re-authentication, public repository creation, push, and Actions verification.

## 4. Not started

- Phase 2 executable CSV schemas and compiler.
- Taxonomy refresh/snapshot tooling.
- Sharp media pipeline and representative processed assets.
- Real taxon/specimen routes and gallery.
- Catalog, taxonomy landing routes, search, map, full ingestion, and deployment.

These are deliberately not partially implemented in Phase 0/1.

## 5. Locked decisions

| Decision | Current answer | Source |
|---|---|---|
| Product | Visual-first online natural-history museum | `project_overview.md` |
| Working title | Skull Collection, centrally configured | `project_overview.md` |
| Interface/search | English UI; scientific, English, Danish aliases | `project_overview.md` |
| Page identity | Species-first taxon page plus nested exact specimen pages | ADR 0005 |
| Content source | Two linked CSVs plus cited MDX | ADR 0002 |
| Rendering | Static-first Next.js App Router/RSC | ADR 0001 |
| Media | Private masters; curated validated public WebP derivatives in Git | ADR 0003 |
| Search/map | Generated Orama index; route-lazy MapLibre with list fallback | ADR 0004 |
| Hosting | Vercel later, production from `main` | `architecture.md` |
| Rights | MIT code; content/media/data reserved separately | `RIGHTS.md` |
| Coordinates | Exact when known; explicit approximate/unknown semantics | `content_data_model.md` |
| Contributions v1 | Requirements guide plus contact; no direct upload | `project_overview.md` |

## 6. Environment and external state

| Check | Observed | Impact/action |
|---|---|---|
| Local repository | Git repository on unborn `main` | Initialized; first commit pending exact staged-file audit |
| Local default Node | `v22.20.0` | Does not satisfy pin; all recorded checks used verified isolated Node `v24.18.0` |
| Local default pnpm | Not installed | Checks used Corepack-managed pnpm `11.21.0`; repository declares exact version |
| GitHub CLI | `gh 2.81.0` installed | Suitable for repository creation |
| GitHub account entry | `Rasmus-allesoee` present but token invalid at preflight | Re-authentication required before remote creation/push |

The user requested use of the authenticated account, but `gh auth status` returned an invalid token during implementation preflight. Local work can continue; remote publication cannot be marked complete until authentication succeeds.

## 7. Context/data readiness

- `agent_context/skulls_meta.csv` is incomplete and illustrative. It is ignored by Git and must not feed production.
- `agent_context/skull_images_clean/` contains high-resolution transparent staging images with inconsistent current names. It is ignored by Git and must not be published unprocessed.
- `agent_context/species_list.md` is a rough inventory, not verified taxonomy.
- Production ingestion waits for replacement metadata, stable IDs, rights/credits, public-note review, and image renaming.
- Phase 2 may use one explicitly selected representative specimen after its ID and publication rights are confirmed.

## 8. Verification evidence

| Gate | Command/evidence | Status |
|---|---|---|
| Exact toolchain | verified Node `v24.18.0`; pnpm `11.21.0`; `.nvmrc`, `.node-version`, `packageManager` agree | Pass |
| Frozen install | `CI=true pnpm install --frozen-lockfile --offline` against generated lockfile | Pass |
| Dependency peers | `pnpm peers check` | Pass; no issues |
| Formatting | `pnpm format:check` via `pnpm check` | Pass |
| Lint | `pnpm lint` via `pnpm check` | Pass; zero warnings |
| Strict typecheck | `next typegen && tsc --noEmit` via `pnpm check` | Pass |
| Unit/component tests | Vitest: 1 file, 1 test | Pass |
| Production build | Next.js 16.2.12: `/`, `/_not-found`, and `/icon.svg` statically prerendered | Pass |
| Browser/accessibility smoke | Playwright Chromium: 1 test; axe violations equal `[]` | Pass |
| Visual/browser console | Playwright CLI desktop and 390 px inspection; favicon 404 fixed and rechecked | Pass |
| Ignore boundary | `git check-ignore -v` for draft CSV, 194 MB staged images, build/test/browser output, and OS files | Pass |
| Clean Git scope | 61 staged paths inspected; no draft CSV, staged images, dependencies, build, OS, test, or browser-QA output | Pass |
| Public remote | GitHub repository URL and default branch | Blocked on valid `gh` authentication at preflight |
| CI | GitHub Actions run for pushed checkpoint | Pending remote |

Evidence is filled with exact results before Phase 0/1 is marked complete. A local pass does not substitute for remote/CI verification where the gate explicitly requires it.

## 9. Known risks and controls

| Risk | Control |
|---|---|
| Raw/private draft accidentally published | Explicit `.gitignore`, staged-file audit, public-source schema |
| Schema grows from legacy spreadsheet accidents | Approved normalized contract; representative vertical slice first |
| Taxonomy corrections break URLs | Immutable local IDs, curated slugs, redirects, reviewed snapshot |
| Large imagery harms speed/repository | Private masters, Sharp derivatives, budgets, 500 MB review trigger |
| Museum aesthetics obscure usability | WCAG rules, semantic controls, keyboard/mobile gate, visual approval |
| Search/map duplicate data logic | Both compile from canonical records and use stable URLs |
| New-feature enthusiasm expands phase | Phase gates and explicit deferred prerequisites |
| Invalid GitHub credential stalls publication | Re-authenticate only at external checkpoint; preserve verified local commit |

## 10. Exact next actions

1. Stage and audit every first-commit path; commit the verified foundation.
2. Verify installation/build from a clean local clone on Node 24.18.0.
3. Re-authenticate `gh`, create public `Rasmus-allesoee/skull_website`, and push `main`.
4. Verify the GitHub Actions run and update this status with commit/remote evidence.
5. Stop. Await explicit continuation before Phase 2.

## 11. Decision/blocker protocol

- A failing test or lint rule is implementation work, not automatically a blocker.
- A decision that changes public identity, rights, data publication, scope, or external account state is surfaced to the user.
- Blockers record what was tried, exact evidence, safe work completed, and the smallest required user action.
- When resolved, retain a short resolution in the checkpoint log rather than deleting history.

## 12. Checkpoint log

### 2026-08-12 — Phase 0/1 started

- User explicitly approved the master plan and authorized Phase 0/1 only.
- Source/context and GitHub/toolchain preflight completed.
- Canonical documentation created before application feature work.
- GitHub token was found invalid despite a configured active account; remote work remains pending re-authentication.
- Current framework releases were pinned, then compatibility-tested: TypeScript 7 and ESLint 10 were replaced by supported TypeScript 6.0.3 and ESLint 9.39.5 after the Next.js lint graph rejected the newer majors.
- Pinned local install, peer check, formatting, lint, strict typecheck, unit test, static build, Chromium/axe smoke test, and visual desktop/mobile inspection passed.

Future entries should be concise and evidence-based. Git history owns file-level chronology; this log owns phase outcomes, decisions, blockers, and next action.
