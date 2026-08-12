# Skull Collection

Skull Collection is a visual-first online natural-history museum for animal skulls. It will combine consistent multi-angle photography with taxonomy, measurements, specimen provenance, preparation records, maps, and cited identification notes.

The project is currently at the end of **Phase 0/1: documentation and repository foundation**. The application is intentionally a small foundation page; catalog features and real specimen ingestion begin in later, separately approved phases.

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
| `pnpm build` | Create the production Next.js build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint with the Next.js and repository rules |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm format:check` | Verify formatting without modifying files |
| `pnpm test` | Run unit and component tests once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:e2e` | Run Playwright smoke and accessibility tests |
| `pnpm check` | Run the local non-browser CI checks |

Content and media validation commands are deliberately scheduled for Phase 2, when their schemas and first representative specimen are implemented. CI must not claim to validate contracts that do not yet exist.

## Repository map

```text
src/                 Next.js routes, components, domain and query code
content/             future source CSV, MDX profiles, and guides
public/media/        future generated, web-ready public specimen assets
scripts/             future content, taxonomy, and image tooling
tests/e2e/           browser and accessibility journeys
docs/                canonical product, design, architecture, and status docs
.github/              CI, issue forms, PR template, and dependency updates
agent_context/        planning context and local-only source/staging material
```

Empty content and media directories contain `.gitkeep` files so the intended structure survives a clean clone.

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

`agent_context/skulls_meta.csv` is an incomplete illustrative draft. `agent_context/skull_images_clean/` contains local source/staging images. Both paths are ignored and must not be published or treated as production data.

Future public content will use:

- `content/taxa/taxa.csv` for taxonomic identities, names, hierarchy, and publication state;
- `content/specimens/specimens.csv` for physical specimens, provenance, measurements, preparation, and rights;
- cited MDX for editorial profiles and guides; and
- `public/media/specimens/` for validated derivatives named `{specimen-id}__{view}.webp`.

See [docs/content_data_model.md](docs/content_data_model.md) before editing any future content source.

## Git and GitHub workflow

The initial foundation is bootstrapped on `main`. Subsequent work uses focused branches named `agent/<short-description>`, conventional commit prefixes, and draft pull requests. Every phase ends with its acceptance gate verified and a checkpoint recorded in `docs/project_status.md`.

Do not commit secrets, raw workbooks, archival Affinity/PSD files, private notes, EXIF/GPS-bearing masters, generated build output, or dependency folders.

## Deployment

Vercel is the planned hosting target, connected to GitHub after the release-hardening phase. Pull requests will receive preview deployments and `main` will become the only production source. No production project, domain, analytics, or runtime service is configured in Phase 0/1.

## Rights and licence

Source code is licensed under the [MIT License](LICENSE). Photographs, written content, specimen metadata, and other collection material are not covered by MIT; see [RIGHTS.md](RIGHTS.md). Do not assume that public repository access grants reuse rights to collection material.

## Contributing

Repository development guidance is in [CONTRIBUTING.md](CONTRIBUTING.md). Public specimen contributions are a later product workflow and will initially use a requirements guide plus direct contact—not anonymous uploads.
