# Skull Collection

Skull Collection is a visual-first online natural-history museum for animal skulls. It will combine consistent multi-angle photography with taxonomy, measurements, specimen provenance, preparation records, maps, and cited identification notes.

**The illustrated Measurements milestone is implemented locally and ready for owner review:** `/methodology` now presents 21 canonical definitions through five real-skull reference views, 24 registered programmatic SVG occurrences, accessible detail interactions, a complete semantic table, and static/no-JavaScript fallback. The focused Phase 5 map remains merged in `main`; this measurement-page checkpoint has not been pushed, opened as a pull request, or merged.

Start at `/`, browse the catalog at `/species`, explore public specimen locations at `/map`, inspect the measurement reference at `/methodology`, or follow the static taxonomy from `/taxonomy/class/mammals` or `/taxonomy/class/birds`. Published taxon displays include `/species/raccoon-dog` and `/species/razorbill`; exact physical records use nested URLs such as `/species/harbour-seal/specimens/SPEC-0013`. A non-procedural preparation-guide foundation is available at `/guides/skull-preparation`.

## Project principles

- Photography leads; specialist information is progressively disclosed.
- Species are the primary browsing unit, while every physical specimen receives a stable nested URL.
- Scientific, English, and Danish names are searchable even though the interface is English.
- Primary collection content stays human-editable in two linked CSV files; reviewed MDX and media/reference declarations compile with it into validated typed build artifacts.
- Mammal, bird, and fallback measurement profiles share the canonical specimen CSV while rendering only applicable rows and class-aware comparison matrices.
- Measurement methodology uses a separate validated definition/overlay reference model and never becomes a parallel specimen-value table.
- Known content is statically prerendered and remains useful before interactive JavaScript loads.
- Missing, uncertain, and genus-level data is represented honestly.
- Archival image masters and private working data never enter the public repository.

The approved scope and experience are specified in [docs/project_overview.md](docs/project_overview.md). The implementation sequence lives in [docs/implementation_plan.md](docs/implementation_plan.md), and the current checkpoint is in [docs/project_status.md](docs/project_status.md).

## Technology baseline

- Node.js `24.18.0` LTS
- pnpm `11.21.0`
- Next.js `16.2.12` with the App Router
- React `19.2.8`
- strict TypeScript
- Orama `3.1.18` for the build-generated, browser-side catalog index
- MapLibre GL JS `5.7.3` with OpenFreeMap vector styles, loaded only on `/map`
- Tailwind CSS 4 with semantic CSS variables
- Zod, csv-parse, gray-matter, and Sharp for the build-time content/media pipeline
- self-hosted Newsreader and IBM Plex Sans
- Vitest, Testing Library, axe, and Playwright
- GitHub Actions CI and a later Vercel deployment

Versions are exact where reproducibility or framework compatibility matters. Dependency updates are reviewed through pull requests rather than silently floating.

## Getting started

### Prerequisites

Install the exact Node version declared in `.nvmrc` or `.node-version`. Then enable the package manager declared in `package.json`:

```bash
corepack enable
corepack install
```

Verify the toolchain:

```bash
node --version
pnpm --version
```

Expected output begins with `v24.18.0` and `11.21.0`.

### Install and run

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:3000>.

### Test on another device

For a phone or tablet on the same network, expose the development server:

```bash
pnpm dev:network
```

On macOS, find the computer's active LAN IPv4 address (commonly with `ipconfig getifaddr en0`) and open `http://<mac-lan-ip>:3000` on the device. `0.0.0.0` is the server bind address, not a client URL. The development configuration permits only loopback plus the host's currently detected private IPv4 addresses so Next.js hot reload does not enter a cross-origin reload loop. For the most production-like device check, use `pnpm preview:network` instead.

### Quality commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the local development server |
| `pnpm dev:network` | Start development on the local network for phone/tablet testing |
| `pnpm preview:network` | Build and serve the production app on the local network |
| `pnpm build` | Compile content and create the production Next.js build |
| `pnpm start` | Serve the production build |
| `pnpm content:build` | Validate and compile canonical sources into ignored `.generated/` artifacts |
| `pnpm validate:content` | Validate CSV, MDX, links, taxonomy evidence, rights, and publication invariants |
| `pnpm validate:media` | Validate declared public WebP files, metadata, alpha, dimensions, naming, and bounds |
| `pnpm test:fixtures` | Confirm intentionally invalid representative records fail actionably |
| `pnpm media:stage:phase2` | Copy only the approved six local Phase 2 PNGs into ignored canonical staging names |
| `pnpm media:stage:phase3.1` | Copy the explicit 104-image Phase 3.1 review map from ignored local sources into ignored canonical staging names |
| `pnpm media:process` | Build and validate public sRGB WebP derivatives from canonical staged PNGs |
| `pnpm media:process:reference` | Rebuild a declared public comparison-reference WebP from its ignored local source |
| `pnpm media:verify:methodology-sources` | Verify all five annotated/raw measurement pairs, identity registration, and encoded overlay positions |
| `pnpm media:process:methodology` | Rebuild and validate the five metadata-stripped measurement-reference WebPs from ignored raw sources |
| `pnpm taxonomy:refresh -- --taxon-id TAX-0001 --dry-run` | Query GBIF explicitly without changing curated taxonomy or writing a snapshot |
| `pnpm lint` | Run ESLint with the Next.js and repository rules |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm format:check` | Verify formatting without modifying files |
| `pnpm test` | Run unit and component tests once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:e2e` | Run static-route, gallery, responsive, no-JS, performance, and accessibility journeys |
| `pnpm check` | Run the local non-browser CI checks |

`pnpm build` currently requests Next.js's supported webpack compiler explicitly. The Phase 2 Turbopack production build did not terminate reliably in the pinned local environment; the deterministic webpack build passed locally and is the CI contract until a focused toolchain update proves that workaround unnecessary.

## Repository map

```text
src/                 Next.js routes, museum/catalog/exhibit/methodology UI, domain/compiler, and data loading
content/             canonical CSV, cited MDX, media/reference/methodology declarations, taxonomy snapshots
public/media/        curated validated WebP specimen, comparison, and methodology derivatives
scripts/             content, taxonomy, fixture, staging, and image tooling
tests/e2e/           browser and accessibility journeys
docs/                canonical product, design, architecture, and status docs
.github/              CI, issue forms, PR template, and dependency updates
agent_context/        planning context and local-only source/staging material
```

Generated `.generated/` collection/search/map output and `public/generated/` search output, local `.staging/`, browser artifacts, dependencies, and private source material are ignored and replaceable.

## Documentation reading order

1. [AGENTS.md](AGENTS.md) — mandatory repository entrypoint and working rules
2. [docs/project_status.md](docs/project_status.md) — current phase and exact next action
3. [docs/project_overview.md](docs/project_overview.md) — product and page specification
4. [docs/architecture.md](docs/architecture.md) — technical boundaries and data flow
5. [docs/content_data_model.md](docs/content_data_model.md) — content, taxonomy, and media contracts
6. [docs/design_system.md](docs/design_system.md) — visual and interaction rules
7. [docs/implementation_plan.md](docs/implementation_plan.md) — phased delivery plan and gates
8. [docs/competitive_audit.md](docs/competitive_audit.md) — reference-site evidence
9. [docs/phase_3_1_migration_audit.md](docs/phase_3_1_migration_audit.md) — accepted/blocked review-slice records and transformations
10. [docs/interactive_taxonomic_tree.md](docs/interactive_taxonomic_tree.md) — current taxonomy foundations and dedicated Phase 3.3 plan
11. [docs/decisions/](docs/decisions/) — accepted architecture decisions

The original approved plan remains in `agent_context/website_plan_from_planmode.md` as historical source context. Canonical implementation guidance belongs in `docs/`; contradictory guidance must be resolved and recorded rather than guessed.

## Content and image safety

`agent_context/skulls_meta.csv` is an incomplete illustrative draft. `agent_context/skull_images_clean/` contains local source/staging images. `agent_context/metadata_csv/` contains partial spreadsheet exports supplied while designing the class-aware measurement model. `agent_context/measurement_page/` contains raw and annotated methodology sources plus migration wording. These paths are ignored and must not be published or read by a normal application build.

Phase 2 established:

- `content/taxa/taxa.csv` for taxonomic identities, names, hierarchy, and publication state;
- `content/specimens/specimens.csv` for physical specimens, provenance, measurements, condition, observation fields, preparation, and rights;
- `content/references/*.json` for reviewed comparison-reference identity, measurements, orientation, asset metadata, and approximate-value semantics;
- `content/methodology/measurement-definitions.csv` and `measurement-reference.json` for the 21 definition rows and registered five-view overlay/media model;
- review-gated MDX for future cited editorial profiles and guides; and
- `public/media/specimens/` for validated derivatives named `{specimen-id}__{view}.webp`, `public/media/references/` for validated comparison assets, and `public/media/methodology/` for the five unannotated reference derivatives.

The first canonical records (`TAX-0001`, `SPEC-0001`) were curated from only the explicitly selected staging row `ID = 1` and six matching raccoon-dog PNGs. Phase 2.2 added a processed adult-human-skull reference and fixed approximate dimensions for the calibrated specimen-page comparison. Phase 3.0 advanced the compiled contract to schema version 4 and expanded the single specimen CSV with explicit mammal/bird measurement applicability. Phase 3.1 then normalized only the 15-taxon/18-specimen subset that could be matched to 104 cleaned images and satisfy the current publication contract; the raw exports/PNG masters remain ignored and the complete Phase 6 audit remains mandatory. Phase 3.2/4 compiles those published records into an ignored 67-document rank/taxon/specimen search artifact. Phase 5 compiles the same published records into an ignored deterministic map projection; neither search nor map reads raw exports or masters. See the [migration audit](docs/phase_3_1_migration_audit.md). The current raccoon-dog profile remains deliberately `draft` and omitted from the public page until useful, cited prose is curated.

See [docs/content_data_model.md](docs/content_data_model.md) before editing any future content source.

## Git and GitHub workflow

The initial foundation is bootstrapped on `main`. Subsequent work uses focused branches named `agent/<short-description>`, conventional commit prefixes, and draft pull requests. Every phase ends with its acceptance gate verified and a checkpoint recorded in `docs/project_status.md`.

Do not commit secrets, raw workbooks, archival Affinity/PSD files, private notes, EXIF/GPS-bearing masters, generated build output, or dependency folders.

## Deployment

Vercel is the planned hosting target, connected to GitHub after the release-hardening phase. Pull requests will later receive preview deployments and `main` will become the only production source. No production project, domain, analytics, or runtime service is configured through the current local Measurements checkpoint.

## Rights and licence

Source code is licensed under the [MIT License](LICENSE). Photographs, written content, specimen metadata, and other collection material are not covered by MIT; see [RIGHTS.md](RIGHTS.md). Do not assume that public repository access grants reuse rights to collection material.

## Contributing

Repository development guidance is in [CONTRIBUTING.md](CONTRIBUTING.md). Public specimen contributions are a later product workflow and will initially use a requirements guide plus direct contact—not anonymous uploads.
