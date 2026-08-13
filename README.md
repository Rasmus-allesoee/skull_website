# Skull Collection

Skull Collection is a visual-first online natural-history museum for animal skulls. It will combine consistent multi-angle photography with taxonomy, measurements, specimen provenance, preparation records, maps, and cited identification notes.

**Phase 2: the validated raccoon-dog vertical slice is implemented and technically verified.** The remaining gate item is the owner's explicit approval of its visual direction, information density, and interactions. Phase 3 must not start before that review is recorded.

The current exhibit is available at `/species/raccoon-dog`; the exact physical record is `/species/raccoon-dog/specimens/SPEC-0001`.

## Project principles

- Photography leads; specialist information is progressively disclosed.
- Species are the primary browsing unit, while every physical specimen receives a stable nested URL.
- Scientific, English, and Danish names are searchable even though the interface is English.
- Structured content stays human-editable in two linked CSV files and is compiled into validated typed build artifacts.
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

### Quality commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the local development server |
| `pnpm build` | Compile content and create the production Next.js build |
| `pnpm start` | Serve the production build |
| `pnpm content:build` | Validate and compile canonical sources into ignored `.generated/` artifacts |
| `pnpm validate:content` | Validate CSV, MDX, links, taxonomy evidence, rights, and publication invariants |
| `pnpm validate:media` | Validate declared public WebP files, metadata, alpha, dimensions, naming, and bounds |
| `pnpm test:fixtures` | Confirm intentionally invalid representative records fail actionably |
| `pnpm media:stage:phase2` | Copy only the approved six local Phase 2 PNGs into ignored canonical staging names |
| `pnpm media:process` | Build and validate public sRGB WebP derivatives from canonical staged PNGs |
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
src/                 Next.js routes, exhibit UI, domain/compiler, and data loading
content/             canonical CSV, cited MDX, media declarations, taxonomy snapshots
public/media/        curated validated WebP specimen derivatives
scripts/             content, taxonomy, fixture, staging, and image tooling
tests/e2e/           browser and accessibility journeys
docs/                canonical product, design, architecture, and status docs
.github/              CI, issue forms, PR template, and dependency updates
agent_context/        planning context and local-only source/staging material
```

Generated `.generated/`, local `.staging/`, browser artifacts, dependencies, and private source material are ignored and replaceable.

## Documentation reading order

1. [AGENTS.md](AGENTS.md) — mandatory repository entrypoint and working rules
2. [docs/project_status.md](docs/project_status.md) — current phase and exact next action
3. [docs/project_overview.md](docs/project_overview.md) — product and page specification
4. [docs/architecture.md](docs/architecture.md) — technical boundaries and data flow
5. [docs/content_data_model.md](docs/content_data_model.md) — content, taxonomy, and media contracts
6. [docs/design_system.md](docs/design_system.md) — visual and interaction rules
7. [docs/implementation_plan.md](docs/implementation_plan.md) — phased delivery plan and gates
8. [docs/competitive_audit.md](docs/competitive_audit.md) — reference-site evidence
9. [docs/decisions/](docs/decisions/) — accepted architecture decisions

The original approved plan remains in `agent_context/website_plan_from_planmode.md` as historical source context. Canonical implementation guidance belongs in `docs/`; contradictory guidance must be resolved and recorded rather than guessed.

## Content and image safety

`agent_context/skulls_meta.csv` is an incomplete illustrative draft. `agent_context/skull_images_clean/` contains local source/staging images. Both paths are ignored and must not be published or read by a normal application build.

Phase 2 established:

- `content/taxa/taxa.csv` for taxonomic identities, names, hierarchy, and publication state;
- `content/specimens/specimens.csv` for physical specimens, provenance, measurements, preparation, and rights;
- cited MDX for editorial profiles and guides; and
- `public/media/specimens/` for validated derivatives named `{specimen-id}__{view}.webp`.

The first canonical records (`TAX-0001`, `SPEC-0001`) were curated from only the explicitly selected staging row `ID = 1` and six matching raccoon-dog PNGs. Staging values remain evidence rather than a production source of truth.

See [docs/content_data_model.md](docs/content_data_model.md) before editing any future content source.

## Git and GitHub workflow

The initial foundation is bootstrapped on `main`. Subsequent work uses focused branches named `agent/<short-description>`, conventional commit prefixes, and draft pull requests. Every phase ends with its acceptance gate verified and a checkpoint recorded in `docs/project_status.md`.

Do not commit secrets, raw workbooks, archival Affinity/PSD files, private notes, EXIF/GPS-bearing masters, generated build output, or dependency folders.

## Deployment

Vercel is the planned hosting target, connected to GitHub after the release-hardening phase. Pull requests will later receive preview deployments and `main` will become the only production source. No production project, domain, analytics, or runtime service is configured in Phase 2.

## Rights and licence

Source code is licensed under the [MIT License](LICENSE). Photographs, written content, specimen metadata, and other collection material are not covered by MIT; see [RIGHTS.md](RIGHTS.md). Do not assume that public repository access grants reuse rights to collection material.

## Contributing

Repository development guidance is in [CONTRIBUTING.md](CONTRIBUTING.md). Public specimen contributions are a later product workflow and will initially use a requirements guide plus direct contact—not anonymous uploads.
