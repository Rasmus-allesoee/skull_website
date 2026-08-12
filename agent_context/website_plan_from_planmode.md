# Animal Skull Website — Master Plan

## 1. Product definition

Build a fast, visually led online natural-history museum backed by rigorous specimen data. Photography leads the experience; taxonomy, measurements, preparation, provenance, and citations are progressively disclosed underneath.

### First public release

- English interface with scientific, English, and Danish names searchable everywhere.
- Home, Species, Map, Guides, Contribution, and About.
- Taxonomic browsing from class → order → family → species.
- Search across taxa, ranks, aliases, and specimen IDs.
- Species and specimen gallery modes with length and weight filters.
- One primary page per taxon, showing its designated default specimen.
- Stable nested URLs for individual physical skulls.
- Interactive Denmark-first map with exact coordinates by default and clearly labelled approximate locations where exact coordinates are unknown.
- Concise, cited natural-history and skull-identification profiles.
- Contribution photography/metadata guide and contact link, without direct uploads.
- No accounts, database, public upload backend, analytics, 360°, 3D, or AI animal overlays in the initial release.

### Reference-site lessons

| Reference | Retain | Improve |
|---|---|---|
| [Skull Index species hierarchy](https://www.skull-index.com/species/mammals-page-1) | Dark photographic atmosphere, consistent views, multiple individuals | Separate taxonomy from galleries, remove long paginated pages, make search and mobile layouts first-class |
| [Skull Base specimen page](https://skullbase.info/skulls/mammals/red_fox.php) and [map](https://www.skullbase.info/map.php) | Clear datasheets, systematic navigation, related records, map, 360° concept | Replace fixed-width styling, static name lists, and dated search with responsive faceted exploration |
| [Skullsite taxonomy](https://skullsite.com/skull-orders-and-families/), [size search](https://skullsite.com/custom-search/), and [3D experiments](https://skullsite.com/3d-models/) | Size filtering, order/family browsing, future-facing media | Reduce verbose hierarchy labels and fragmented navigation |

### Success criteria

- A visitor can reach a known taxon through search or taxonomy in at most three meaningful interactions.
- Every record marked `published` has valid taxonomy, a stable specimen ID, one lateral hero image, ownership/rights information, and no invalid linked data.
- Missing data is shown honestly as “Not recorded” or “Not applicable”; it is never converted to zero or a fabricated date.
- The complete catalog works at 360 px width, by keyboard, and without relying on color, hover, animation, or the map alone.
- Core pages remain statically prerendered, indexable, and usable before interactive JavaScript finishes loading.

## 2. Information architecture and experience

### Routes

- `/` — visual home page, collection statistics, class entry points, featured skull, map preview, guide/contribution links.
- `/species` — primary catalog, global search, filters, class tiles, taxonomy index, and species/specimen view switcher.
- `/taxonomy/{rank}/{slug}` — stable class, order, family, and genus landing pages with breadcrumbs and filtered galleries.
- `/species/{taxon-slug}` — canonical taxon page with the default skull selected.
- `/species/{taxon-slug}/specimens/{specimen-id}` — the same museum experience with an exact physical specimen selected.
- `/map` — interactive map plus synchronized accessible result list.
- `/guides` and `/guides/preparing-skulls` — editorial guide hub and preparation guide.
- `/contribute` — image protocol, metadata requirements, rights expectations, and contact CTA.
- `/about` — collector story, collection purpose, photography and preparation workflow.
- `/methodology`, `/rights`, `/privacy`, and `/accessibility` — supporting reference/footer pages.

“Other Stuff” becomes the clearer top-level label “Guides.”

### Catalog behavior

- The class landing view uses large representative skull cards with live taxon/specimen counts.
- Class, order, family, and genus pages show a compact systematic index above a responsive image gallery.
- Search understands scientific, English, and Danish names; synonyms; class/order/family/genus names; and specimen IDs.
- Exact and prefix name matches rank above fuzzy matches. A taxonomic-rank result opens its filtered taxonomy page; a taxon result opens its taxon page.
- All search/filter state is represented in URL query parameters for sharing, browser history, and reload persistence.
- Numeric filters use millimetres and grams internally:
  - Species mode groups matches by taxon and shows the count/range of matching individuals.
  - Specimen mode shows each matching physical skull and links to its exact URL.
  - Records without a measurement are excluded from that numeric condition but remain discoverable when the filter is cleared.
- Genus-level or uncertain records such as *Larus* sp. are publishable with visible rank/confidence labels and are never presented as confirmed species.

### Taxon and specimen pages

- Lead with common English name, italic scientific identification, Danish name, confidence/rank badge, and clickable taxonomy breadcrumb.
- Use a large six-view gallery supporting thumbnails, swipe, arrow keys, fullscreen, zoom, captions, and reduced-motion behavior.
- Keep a compact specimen selector near the gallery. Other individuals do not become a long repeated page.
- Organize information into:
  - concise cited species profile;
  - skull-identification characteristics;
  - measurements with a consistent accessible anatomical SVG reference diagram;
  - specimen sex, age, body mass, condition, and distinguishing features;
  - acquisition source, date, locality, owner, and collection history;
  - preparation timeline: defleshing → degreasing → whitening → photography/upload;
  - citations and related taxa.
- Hide wholly empty optional sections, but show missing values explicitly inside otherwise populated data groups.
- Give every exact specimen URL its own title, description, Open Graph image, and canonical relationship to the taxon page.

### Map

- Use MapLibre GL JS, loaded only on `/map`, with a provider-independent style URL. MapLibre supplies vector rendering, markers, popups, controls, and clustering without coupling the site to Google Maps. [MapLibre documentation](https://maplibre.org/maplibre-gl-js/docs)
- Launch with an attributed OpenFreeMap dark/Fiord-style basemap; retain a configuration adapter so a paid provider or self-hosted PMTiles can replace it without changing specimen records. [OpenFreeMap quick start](https://openfreemap.org/quick_start/)
- Exact coordinates are published when known. Approximate coordinates use a visually distinct marker and an explicit precision label; unknown locations receive no fabricated point.
- Cluster overlapping specimens and expose popups containing image, taxon names, specimen ID, locality, and exact specimen link.
- Provide equivalent searchable/filterable results in a list below or beside the map.
- Deep links such as `/map?specimen=SPEC-001` open and focus the corresponding record.
- Start fitted to Denmark but calculate bounds from the available data so later international records require no redesign.

### Visual system

- Direction: contemporary dark natural-history museum, not gothic or horror-themed.
- Initial palette:
  - background `#0B0D0C`;
  - surface `#141816`;
  - elevated surface `#1C211E`;
  - bone text `#E8E1D3`;
  - muted text `#A6A299`;
  - brass accent `#B79A68`;
  - verdigris/data accent `#71958A`.
- Use Newsreader for editorial/display typography and IBM Plex Sans for navigation, controls, labels, and tabular measurements; self-host licensed WOFF2 files.
- Use large areas of calm negative space, restrained archival labels, fine dividers, and subtle radial lighting behind transparent skull cutouts.
- Motion is limited to 150–300 ms opacity/transform transitions and disabled or simplified under `prefers-reduced-motion`.
- Dark-only presentation for v1; contrast, focus states, and data legibility must meet WCAG 2.2 AA.

## 3. Technical architecture and data contracts

### Stack

- Node.js 24 LTS, pnpm with an exact `packageManager` version, Next.js 16.2.x, React 19.2.x, and strict TypeScript; pin current security-patched versions in the lockfile. [Node release status](https://nodejs.org/en/about/previous-releases), [Next.js 16.2](https://nextjs.org/blog), [React releases](https://react.dev/versions)
- Next.js App Router with React Server Components by default and small client islands only for search, filters, gallery controls, and MapLibre.
- Statically generate known taxon, taxonomy, specimen, and editorial routes with `generateStaticParams`; use local MDX for guides and cited profiles. [Static route generation](https://nextjs.org/docs/app/api-reference/functions/generate-static-params), [MDX support](https://nextjs.org/docs/app/guides/mdx)
- Tailwind CSS 4 backed by semantic CSS variables; custom museum components rather than a generic UI kit. Use accessible Radix primitives only where native HTML is insufficient.
- Orama JS for a build-generated browser search index: weighted fields, exact/prefix/fuzzy matching, facets, and separate taxon/specimen document types. [Orama search capabilities](https://docs.orama.com/docs/orama-js/search)
- Vitest, Testing Library, axe, Playwright, and Lighthouse CI.
- Vercel deployment connected to GitHub, with static prerendering and controlled `next/image` transformations. Next.js/Vercel can serve responsive WebP/AVIF variants and cache them near visitors. [Image component](https://nextjs.org/docs/app/api-reference/components/image), [Vercel image optimization](https://vercel.com/docs/image-optimization)

### Content flow

```text
taxa.csv + specimens.csv + profile/guide MDX + specimen images
                              ↓
                 validation and media compiler
                              ↓
typed taxon/specimen model + media manifest + search index + map GeoJSON
                              ↓
static pages              client search/gallery/map islands
```

The website must never read the spreadsheet directly at runtime and must not require GBIF, a map API, or another database during a normal build.

### Public domain types

- `TaxonRecord`
  - immutable local ID and public slug;
  - scientific identification, rank, qualifier, confidence/status;
  - English/Danish names and searchable aliases;
  - class/order/family/genus hierarchy;
  - Catalogue of Life/GBIF identifiers;
  - default specimen ID and publication state.
- `Specimen`
  - immutable specimen ID and linked taxon ID;
  - sex, age, condition, body mass;
  - source, owner/credit, acquisition date with precision;
  - location label, coordinates, and coordinate precision;
  - preparation methods and durations;
  - typed measurements;
  - public notes and publication state.
- `Measurement`
  - numeric value, canonical unit, and status: measured, approximate, not recorded, or not applicable.
- `MediaAsset`
  - specimen ID, canonical view, dimensions, sort order, alt text, credit, rights, and web path.
- `TaxonProfile`
  - concise overview, skull-identification features, and structured citations.
- `SearchDocument`
  - discriminated union for taxon, taxonomic-rank, and specimen results.

IDs and published slugs are never silently regenerated. A scientific-name change updates display data while preserving the old URL through a redirect.

### Spreadsheet contract

Use two UTF-8, Git-diffable CSV files:

- `taxa.csv`: IDs, slug, rank/status, scientific and vernacular names, aliases, hierarchy, external taxonomy IDs, default specimen, publication status.
- `specimens.csv`: specimen/taxon IDs, provenance, partial date, location/coordinate precision, biological metadata, preparation, measurements, credit/rights, public notes, publication status.

Rules:

- Dates use ISO partial dates: `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; no fake January 1 dates.
- Measurements use decimal points and fixed canonical units in column names, such as `_mm` and `_g`.
- `X` or blank imports as not recorded; `N/A` imports as not applicable; neither becomes a numeric value.
- Multi-value controlled fields use semicolon-separated values.
- Every published taxon has exactly one valid default specimen.
- Every published specimen has a unique ASCII ID, linked taxon, lateral hero image, attribution, and rights state.
- Draft records may remain incomplete and are excluded from production pages.
- Editorial prose and citations live in MDX keyed by taxon ID, rather than being forced into spreadsheet cells.

### Taxonomy verification

- Verify scientific names against the current Catalogue of Life Extended Release through GBIF’s match service. [GBIF Species API](https://techdocs.gbif.org/en/openapi/v1/species)
- Run taxonomy refresh as an explicit maintenance command, review its diff, and commit a dated local snapshot.
- Never call GBIF during the ordinary site build.
- Exact accepted matches can update verification metadata; fuzzy, synonym, conflicting, or higher-rank matches fail review and never silently rewrite the supplied identification.
- Danish names are curated, not machine-translated.

### Image pipeline

- Keep `.af`, PSD, archival PNG, and other masters in a backed-up private local archive outside Git.
- Production filenames use ASCII only: `{specimen-id}__{view}.png`, with canonical views `lateral`, `oblique`, `frontal`, `dorsal`, `ventral`, and `mandible-dorsal`.
- A Sharp-based command:
  - converts to sRGB;
  - normalizes orientation;
  - strips EXIF/GPS and unnecessary metadata;
  - validates alpha edges, dimensions, IDs, expected views, and file size;
  - calculates transparent subject bounds for future comparison alignment;
  - produces one transparent WebP web master up to 3200 px, quality 90/alpha 100.
- Commit these curated web masters, not the archival sources.
- Let `next/image` create controlled responsive variants using an allowlist of widths and qualities; serve the web master only for explicit high-resolution zoom.
- A missing non-lateral angle produces a visible completeness warning during authoring, but only the lateral image is mandatory for publication.
- Revisit external object storage when committed public media approaches roughly 500 MB; the `MediaAsset` interface prevents that migration from changing page code.

### Search and generated outputs

- Build separate taxon and specimen indexes from canonical records.
- Ranking order: exact scientific/common/ID → prefix → alias/synonym → fuzzy → profile text.
- Normalize case, punctuation, Danish diacritics, and whitespace while retaining original display text.
- Generate map GeoJSON from specimens with usable coordinates.
- Generated JSON, search indexes, and GeoJSON are build artifacts, not manually edited or committed.

### SEO and security

- Generate sitemap, robots file, canonical metadata, Open Graph imagery, and sanitized JSON-LD.
- Use Schema.org `Taxon` for taxon pages and `Dataset` for the catalog where valid. [Schema.org Taxon](https://schema.org/Taxon), [Next.js JSON-LD guidance](https://nextjs.org/docs/app/guides/json-ld)
- Add CSP compatible with MapLibre workers and the selected tile/image sources, plus HSTS, `X-Content-Type-Options`, restrictive `Permissions-Policy`, and `Referrer-Policy`.
- No public forms, authentication, cookies, raw notes, or runtime content mutations in v1.

## 4. Repository, documentation, and implementation phases

### Repository layout

```text
src/                 application routes, components, domain/query code
content/             two source CSVs, taxon profiles, and guides
public/media/        generated web-ready specimen assets
scripts/             content, taxonomy, and image validation tools
docs/                durable product, design, architecture, and status documents
.github/              CI, issue templates, PR template, and dependency updates
agent_context/        local source/staging material; private parts ignored by Git
```

### Documentation created before feature implementation

- `README.md` — setup, commands, contribution workflow, deployment overview.
- `docs/project_overview.md` — vision, audience, scope, routes, page and feature specification.
- `docs/competitive_audit.md` — reference-site findings and adopted/rejected patterns.
- `docs/architecture.md` — stack, rendering, data flow, search, map, media, deployment, and ADR links.
- `docs/content_data_model.md` — CSV templates, field dictionary, controlled vocabularies, IDs, validation, taxonomy, citations, and image naming.
- `docs/design_system.md` — tokens, typography, grids, components, image treatment, states, motion, and accessibility.
- `docs/implementation_plan.md` — phase checklist, dependencies, acceptance gates, and deferred backlog.
- `docs/project_status.md` — current phase, completed work, decisions, blockers, verification evidence, and next actions.
- `docs/decisions/` — short architecture decision records only for choices that materially change the system.

`AGENTS.md` becomes the mandatory agent entrypoint and lists the reading order, canonical documents, commands, invariants, current phase, and content locations. It is updated whenever important rules, plans, Markdown files, or context sources are added.

### Git/GitHub workflow

The folder is not currently a Git repository, and the configured GitHub CLI credential is invalid. Phase 0 therefore begins by re-authenticating, initializing `main`, and creating the public `Rasmus-allesoee/skull_website` remote.

- Commit code, plans, normalized public CSV data, MDX, and web-ready media.
- Ignore raw workbooks, archival masters, Affinity/PSD files, `.DS_Store`, secrets, and generated build products.
- License code under MIT; add a separate rights document reserving photographs, written content, and collection data.
- Bootstrap on `main`; afterward use focused feature branches and draft pull requests to practise professional review.
- Use conventional commit prefixes and create one verified checkpoint per phase.
- Require CI on pull requests: install from lockfile, content/media validation, lint, typecheck, unit/component tests, build, Playwright smoke tests, and accessibility checks.
- Maintain GitHub issues/milestones from the implementation phases; avoid a second competing task tracker.

### Phases

1. **Documentation and repository foundation**
   - Create the documentation suite, `.gitignore`, rights files, GitHub repository, CI skeleton, Node/pnpm pins, and Next.js application.
   - Convert `AGENTS.md` into the project index.
   - Gate: clean clone installs and builds; documentation and current status agree.

2. **Validated vertical slice**
   - Define CSV schemas, domain types, import/validation commands, media naming, and MDX citation structure.
   - Process the supplied raccoon-dog image set as one representative taxon/specimen.
   - Build a responsive taxon page, nested specimen URL, gallery, measurement panel, and preparation timeline using real sample assets.
   - Gate: user approves the visual direction and the entire source → validation → page path works before scaling.

3. **Museum shell and catalog**
   - Build navigation, footer, home page, taxonomy routes, species catalog, cards, breadcrumbs, empty/error states, and responsive layouts.
   - Implement static metadata, sitemap, related taxa, and default-specimen routing.
   - Gate: complete keyboard/mobile journey from home to exact specimen with no search or map dependency.

4. **Search and faceted exploration**
   - Generate Orama indexes, global search, rank suggestions, fuzzy fallback, URL-backed filters, class/order/family/genus navigation, numeric ranges, sorting, and species/specimen modes.
   - Gate: automated scenarios pass for Latin, English, Danish, rank, specimen-ID, misspelling, unknown measurement, and browser-history behavior.

5. **Map and editorial pages**
   - Add MapLibre clustering, exact/approximate markers, deep links, list fallback, and responsive map behavior.
   - Add About, Guides, preparation-guide shell, Methodology, Contribution guide/contact, Rights, Privacy, and Accessibility.
   - Gate: every map record has equivalent non-map access; no direct upload or tracking is introduced.

6. **Full collection ingestion**
   - Import the user’s replacement CSVs and cleaned images, not the current illustrative draft.
   - Resolve taxonomy review flags, assign stable IDs/default specimens, curate public notes, and add concise cited profiles.
   - Gate: all published records pass content/media validation; drafts remain build-safe and hidden.

7. **Release hardening**
   - Run full accessibility, responsive, performance, cross-browser, broken-link, metadata, structured-data, security-header, and rights audits.
   - Choose the final name/domain through central site configuration, add the final contact email, configure Vercel, and connect the custom domain.
   - Tag `v1.0.0`, deploy only from `main`, and verify production independently.
   - Gate: documented rollback to the previous Vercel deployment and Git tag is tested.

## 5. Test and release plan

### Automated coverage

- Unit tests:
  - CSV parsing and missing-value semantics;
  - partial dates and coordinate precision;
  - unique IDs, linked taxa, one default specimen;
  - controlled units and numeric ranges;
  - taxonomy review outcomes;
  - species/specimen filter grouping;
  - search ranking, aliases, diacritics, and rank results.
- Component/accessibility tests:
  - gallery, thumbnails, zoom dialog, specimen selector;
  - measurement and preparation displays;
  - filters, result-mode switcher, mobile navigation;
  - focus management, names/roles, and axe checks.
- Playwright journeys:
  - home → class → family → taxon → exact specimen;
  - Latin/English/Danish and fuzzy searches;
  - length/weight filtering in both modes;
  - map marker/list → exact specimen;
  - deep links, reload, back/forward, 404, and empty results;
  - keyboard-only and reduced-motion operation;
  - desktop, tablet, and 360–390 px mobile layouts.
- Release checks:
  - Chromium on each PR; WebKit and Firefox at phase/release gates;
  - visual snapshots for home, catalog, taxon, specimen, map, and guide pages;
  - broken-link and missing-media scan;
  - JSON-LD, canonical, Open Graph, sitemap, and robots validation;
  - no unexpected console errors or third-party requests.

### Performance budgets

- Lighthouse mobile targets: Performance ≥90; Accessibility, Best Practices, and SEO ≥95.
- LCP ≤2.5 s, CLS ≤0.1, and INP ≤200 ms under the agreed lab profile.
- Do not load MapLibre outside `/map`.
- Load only the active gallery image eagerly; lazy-load remaining angles and related cards.
- Initial shared JavaScript target: ≤170 KB gzip excluding route-lazy map code.
- Above-the-fold mobile image target: ≤250 KB where visually acceptable.
- CI fails on material budget regressions rather than merely reporting them.

### Release and monitoring

- Use Vercel preview deployments for pull requests and production deployment from `main`. The free Hobby tier is appropriate only while the project remains personal/non-commercial and within its current terms; re-evaluate before monetization or large traffic. [Vercel plans](https://vercel.com/docs/plans/hobby)
- Start without visitor analytics or cookies. Use CI and synthetic Lighthouse checks for v1.
- Review dependencies weekly through Dependabot and promptly apply security patches.
- Record every release, known issue, and next task in `docs/project_status.md`.

## 6. Locked assumptions and deferred features

### Locked assumptions

- The current `skulls_meta.csv` is illustrative and will not define or populate production data.
- The site uses the neutral working title “Skull Collection” from one central configuration until final naming.
- English is the interface language; scientific, English, and Danish names are search aliases.
- Exact public coordinates are preferred; approximation reflects uncertainty, not privacy masking.
- The public repository contains curated public assets only.
- Code is MIT; media, prose, and collection data remain all-rights-reserved.
- Structured metadata is maintained through two linked CSVs; editorial text uses cited MDX.
- The primary audience is broad and layered, with visuals leading and specialist data available underneath.
- Species pages remain the main experience and display a default specimen; individual specimen URLs exist for precision.
- The Contribution page is guide + contact only.
- Uncertain and genus-level identifications are permitted with transparent labelling.

### Deferred backlog and prerequisites

- **Skull comparison:** requires calibrated scale, consistent lateral orientation, and normalized subject bounds; then add overlay, split-slider, and opacity modes.
- **360° rotation:** requires a dedicated turntable sequence or photogrammetry capture, not the six standard views.
- **3D models:** add through the existing `MediaAsset` abstraction when accurate models exist.
- **Animal-around-skull illustration:** keep separate from documentary imagery, label it as an illustration, and require species-consistent art direction and review.
- **Direct contributions:** requires object storage, signed uploads, submission records, rights consent, malware scanning, moderation, notifications, retention policy, and abuse controls.
- **Database/admin UI:** introduce only when spreadsheet import and Git review cease to be practical.
- **Visitor analytics:** add later after selecting a privacy policy and deciding which questions genuinely justify tracking.
- **Full Danish interface:** the route/content model permits later localization, but v1 avoids duplicated editorial maintenance.
- **Public dataset export/API:** consider after a deliberate data licence is chosen.
