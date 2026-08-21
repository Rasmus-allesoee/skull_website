# Project overview

**Status:** Approved product specification

**Working title:** Skull Collection

**Interface language:** English

**Last reviewed:** 2026-08-20

## 1. Vision

Skull Collection will be a fast, visually led online natural-history museum built around consistent, high-quality photographs of real animal skulls. It should feel calm, precise, and contemporary: visitors encounter the skull first, then reveal taxonomy, measurements, preparation, provenance, and cited natural-history information according to their interest.

The site begins with the collector's own Danish specimens but is designed for a larger, carefully curated reference collection. It must be credible enough for identification and comparison, accessible enough for curious non-specialists, and structured enough to remain maintainable as specimens, contributors, countries, and media types grow.

The shared museum shell, Home, static catalog, and class/order/family/genus browsing are implemented through Phase 3.1 with a review-quality 15-taxon/18-specimen collection. Search/facets, the comprehensive interactive tree, the interactive map, supporting editorial routes, the complete audited collection migration, and production remain owned by later phases.

## 2. Product principles

1. **The specimen is the focus.** Large, consistent photography is the primary interface, not decoration around a database.
2. **Structure without clutter.** Taxonomy, filters, metadata, and citations should be systematic while using progressive disclosure.
3. **Species-first, specimen-precise.** Visitors browse taxa; individual physical skulls remain independently addressable and comparable.
4. **Truthful uncertainty.** Missing values, partial dates, approximate locations, and uncertain identifications are explicitly labelled.
5. **Fast by default.** Core pages are statically generated, responsive, indexable, and useful before client JavaScript completes.
6. **Accessible alternatives.** Every map, gallery, and visual measurement aid has a keyboard-operable and text-based equivalent.
7. **Durable sources.** Human-edited source data is validated and compiled; generated outputs are never manually maintained.
8. **Curated growth.** Contributions expand the collection only through documented photography, metadata, rights, and review standards.

## 3. Audience and use cases

### Curious visitors

- Browse striking skull photography.
- Learn what animal a skull belongs to and how it differs from related taxa.
- Understand how a found animal becomes a prepared specimen.

### Naturalists, collectors, students, and educators

- Navigate systematically through classes, orders, families, genera, and taxa.
- Search scientific, English, or Danish names.
- Compare measurements and view a consistent set of anatomical angles.
- Link directly to a particular specimen or cited identification note.

### Potential contributors

- Understand the exact photography and metadata protocol.
- Learn which rights and attribution information are required.
- Contact the curator with a structured proposed contribution.

### Curator and maintainers

- Add or correct records through reviewable CSV/MDX changes.
- Preserve stable IDs and public URLs through taxonomy changes.
- Detect invalid taxonomy, missing required media, or unsafe data before deployment.

## 4. Release scope

### Included in the first public release

- English interface with scientific, English, and Danish search aliases.
- Home, Species, taxonomy landing pages, Map, Guides, Contribution, About, Methodology, Rights, Privacy, and Accessibility.
- Class → order → family → genus → taxon navigation where those ranks exist.
- Search across taxa, taxonomic ranks, aliases, and specimen IDs.
- Species and specimen result modes with skull-length and skull-weight filters.
- A canonical taxon page selecting one default specimen.
- Stable nested pages for each published physical specimen.
- Six-view galleries where available, with lateral view mandatory.
- Measurements, specimen biology, provenance, preparation, rights, and citations.
- A Denmark-first interactive map with an equivalent result list.
- Contribution requirements and a contact action, without public uploads.
- Static metadata, sitemap, Open Graph imagery, and structured data.

### Explicitly excluded from v1

- Accounts, authentication, saved collections, or user profiles.
- Direct uploads, moderation dashboards, or a public submission database.
- Runtime database or headless CMS.
- Analytics, advertising, cookies, or behavioral tracking.
- 360° turntables, 3D models, and animal-around-skull illustrations.
- Full Danish interface translation.
- A public API or licensed dataset download.
- E-commerce or monetization.

Exclusion from v1 does not mean rejection. Each feature remains in the deferred backlog with prerequisites in [implementation_plan.md](implementation_plan.md).

## 5. Information architecture

| Route | Purpose | Primary content and actions |
|---|---|---|
| `/` | Museum entrance | Featured skull, collection summary, class entry points, search entry, map preview, guide and contribution prompts |
| `/species` | Main catalog | Search, filters, class tiles, compact taxonomy index, sorting, species/specimen view switch |
| `/taxonomy/{rank}/{slug}` | Rank landing page | Breadcrumb, rank summary, child index, filtered image gallery |
| `/species/{taxon-slug}` | Canonical taxon display | Default specimen gallery, specimen selector, taxonomy, measurements, collection record, preparation, and reviewed editorial content when available |
| `/species/{taxon-slug}/specimens/{specimen-id}` | Exact specimen display | Same composition focused on one physical specimen, with unique metadata and canonical relationship |
| `/map` | Geographic exploration | Clustered map, filters, selected-specimen popup, synchronized accessible result list |
| `/guides` | Editorial guide hub | Guide cards and introductions |
| `/guides/skull-preparation` | Preparation guide | A Phase 2.1 route/outline shell; later reviewed defleshing, maceration/alternatives, degreasing, whitening, safety, and documentation |
| `/contribute` | Contribution protocol | Required views, capture setup, files, metadata, rights, review process, contact CTA |
| `/about` | Collector and project story | Purpose, collection, photography, preparation workflow, site method |
| `/methodology` | Data transparency | Measurement definitions, identification confidence, taxonomy, missing data, coordinates, updates |
| `/rights` | Rights summary | Code/content/media distinctions, credits, reuse/contact route |
| `/privacy` | Privacy statement | No-tracking baseline, hosting logs, contact-data handling |
| `/accessibility` | Accessibility statement | Supported behavior, known issues, feedback route |

“Guides” replaces the ambiguous working label “Other Stuff.”

## 6. Core visitor journeys

### Known-species lookup

1. Start search from Home or Species.
2. Enter a scientific, English, or Danish name.
3. Select an exact taxon result.
4. Arrive at the taxon page with its default specimen.

Target: no more than three meaningful interactions from entry to a specimen display.

### Systematic browsing

1. Choose a class such as Mammalia or Aves.
2. Follow the class → order → family tree foundation or use its ordinary rank-list alternative.
3. Narrow through a stable rank landing and its family-grouped gallery.
4. Select a taxon card or, when needed, open its compact physical-specimen chooser.

The hierarchy, ordinary list, and gallery remain separate but synchronized through the same canonical records and routes: structure supports orientation; images support recognition.

### Measurement-led discovery

1. Open the Species catalog.
2. Select species or specimen mode.
3. Set skull-length and/or skull-weight ranges.
4. Review only records that contain applicable measurements.
5. Clear filters to restore records with unknown values.

Species mode groups physical matches by taxon and reports count/range. Specimen mode shows every matching skull and links directly to it.

### Map exploration

1. Open the Map and filter or move within the Denmark-first extent.
2. Select a cluster or marker, or select the corresponding list row.
3. Review a concise preview with names, specimen ID, locality, image, and precision.
4. Follow the exact specimen link.

The list provides the complete journey when the map cannot be used.

### Contribution inquiry

1. Review the required six views, background, scale, focus, filenames, and metadata.
2. Review rights and attribution expectations.
3. Contact the curator using the supplied structure.
4. Receive manual review and transfer instructions outside the public site.

## 7. Page specifications

### Home

The home page should establish the collection as a museum, not a generic application dashboard.

- Full-width featured transparent skull on a dark, subtly lit field.
- Working title, one-sentence purpose, and primary “Explore the collection” action.
- An honest catalog entry using scientific/English/Danish-name language; the interactive name search begins in Phase 4.
- Representative cards for available classes with live taxon/specimen counts.
- Six concise live statistics derived from published records: species-level taxa, physical specimens, represented classes, orders, families, and genera. Genus-level identifications remain visible in catalog totals/copy rather than being miscounted as species.
- A compact class → order → family hierarchy using the same stable routes as the catalog; the comprehensive interactive tree is Phase 3.2.
- Compact geographic preview using only reviewed public coordinate records and never loading MapLibre. It remains non-interactive until `/map` exists in Phase 5, avoiding a dead link.
- Teasers only for real destinations; Phase 3 links the preparation outline and labels later methodology honestly instead of linking unpublished Contribution/About routes.
- No invented statistics; empty counts are hidden or explicitly marked as pending.

### Species catalog

Phase 3.1 provides the static catalog, class tiles, compact hierarchy, ordinary taxonomy-list alternative, deterministic common-name order, family-grouped galleries, and reusable taxon/specimen card modes. A prominent discovery entry links to the published results honestly; it does not imitate a functioning input. The following interactive discovery controls remain Phase 4 work:

- Search field remains prominent and keyboard accessible.
- Query, filters, sort, taxonomic scope, and result mode serialize to URL parameters.
- Class tiles precede a compact order/family index when no filters are active.
- Results use a responsive gallery led by the lateral image, common name, italic scientific name, Danish name where useful, and specimen count.
- Wide galleries use three columns when a family group contains enough taxa, then two and one as width narrows. The all-species catalog and class/order landings separate grids with family headings; family/genus landings use one unsegmented grid.
- Specimen mode adds stable specimen ID and key measurements without making cards table-dense.
- A species with multiple specimens keeps the card's main link pointed at its default display and adds a compact native chooser. The chooser shows thumbnail, immutable specimen ID/default state, age, sex, and maximum length only, and each option links to the exact nested specimen URL.
- Applied filters are individually removable and have a clear-all action.
- Empty results explain which conditions removed records and offer recovery actions.
- Pagination or virtualization is introduced only when measured catalog size warrants it; v1 prefers static, linkable pages.

### Taxonomy landing pages

- Support class, order, family, and genus using one shared template.
- Display the rank and accepted scientific name clearly.
- Preserve breadcrumbs to the catalog and parent ranks.
- Show child-rank links separately from the image gallery.
- Explain uncertain or incomplete hierarchy rather than manufacturing missing ranks.
- Generate stable, indexable metadata for useful rank pages.
- Group class/order scoped galleries by family; do not subdivide family landings into sparse genus sections.

### Taxon and specimen displays

- Lead with common English name, italic scientific identification, Danish name, and rank/confidence labels.
- Use clickable taxonomy breadcrumbs.
- Feature a large, uncropped gallery image with previous/next/inspection controls visible when the stage reaches the viewport top. Treat a normal wide Chrome viewport around 1440 × 696 as the primary desktop composition target while keeping 1440 × 900, narrower desktop, mobile portrait, and mobile landscape responsive. Use a taller main frame and matching, independently scrollable thumbnail rail on the right at desktop and mobile landscape widths; stack thumbnails below the image in mobile portrait.
- Render the active view from the validated full-resolution WebP through its compiled transparent subject bounds so the skull fills the frame without cropping anatomy or enlarging a low-resolution responsive derivative. Thumbnails remain lightweight responsive variants; inspection loads the original validated master directly.
- Support direct thumbnail selection, previous/next controls, focused left/right/Home/End keys, horizontal one-finger swipe, desktop double-click, and touch double-tap. The ordinary gallery uses full native browser manipulation: two-finger pinch can translate while scaling, and a zoomed page can pan horizontally, vertically, or diagonally inside the frame. Recognize gallery swipe/double-tap only at 100% page scale, while keeping a visible `Inspect image` fallback and concise desktop/touch instructions.
- Use a symmetric full-viewport inspection dialog with wheel/trackpad zoom, desktop pinch gestures, native touch pinch, pointer/touch drag, double-click zoom/reset, a range control, keyboard `+`/`-`/`0`, view navigation at every zoom level, Escape, focus restoration, and reduced-motion behavior. At 100% zoom, horizontal touch swipe changes view; once enlarged, the same one-finger gesture pans instead. Zoom gestures over the inspector must prevent background page scroll/page zoom; users do not need to hold Command/Ctrl.
- Place the specimen selector near the gallery and keep the default specimen explicit.
- Put the measurement section immediately below the gallery/selector, followed by the collection and preparation records. A concise cited profile and skull-identification section return only after useful, reviewed, source-backed prose exists; draft profile infrastructure remains build-valid but is not rendered.
- Present the specimen measurement table directly below the heading/note and retain progressive disclosure for additional recorded measurements. Derive a `mammal`, `bird`, or fallback `other` profile from the linked taxon's class and render only that profile's meaningful rows; class-specific non-applicable fields must not become visible clutter. Link a profile-specific measurement-definition dialog. At wide widths, pair the compact table with the reusable `A sense of scale` card; stack them on narrow screens.
- The scale card compares canonical lateral views using recorded maximum length, compiled alpha subject bounds, explicit orientation, and one responsive pixels-per-millimetre factor shared by both skulls. Default to the reviewed adult-human reference, allow selection only from eligible default specimens/references, align both skulls to the primary orientation without rewriting assets, and label approximate reference values honestly. Descriptive notes belong to the selected comparison record and disappear when that record has no note. This is a mathematically true relative-size comparison inside the card, not a claim that CSS pixels equal physical millimetres on the visitor's monitor.
- Include a searchable keyboard-operable comparison selector and a class-aware difference table. Mammal/mammal uses six rows; bird/bird uses nine; bird/mammal uses six explicitly labelled functional mappings, including orbital width ↔ maximum width and cranium height ↔ skull height. Cross-class mappings are descriptive comparisons between different landmarks, not claims of anatomical homology. Difference wording and ratio always describe the current page specimen relative to the selected comparison; wording, not color alone, communicates direction. Show the approximation explanation only when at least one displayed difference is actually derived from an approximate source value.
- Put owner, sex, age class, condition, source, date, location, and coordinate precision in the collection record under the `Metadata` kicker. Age and five-level condition definitions open in accessible dialogs; pathology, trauma, teeth-set completeness, and skeleton completeness live under `Show additional recorded data`.
- In Phase 5, place a `View on map` action near the Collection record for specimens with public coordinates. It focuses the specimen through `/map?specimen={id}`; do not embed MapLibre in the specimen page during Phase 2.
- Describe preparation as `Skull preparation` and link to the permanent guide route. The guide stays an explicit outline—not procedural or safety advice—until cited content review.
- Keep photography credit concise as `Photo: {name}`. Reserve collection/media/data reuse through the global `© {year} Rasmus. All rights reserved.` footer rather than a large rights panel; detailed legal scope remains in `RIGHTS.md` and the later Rights page.
- Hide an entirely empty optional section. Within a populated group, render missing values as “Not recorded” and non-applicable values as “Not applicable.”
- Give exact specimen URLs unique titles/descriptions and an appropriate relationship to the taxon canonical page.
- The Phase 3 suggestion query supports at most three same-family suggestions and three deterministic collection-wide suggestions. Exclude the current taxon, deduplicate the two sets, and omit empty sections rather than displaying placeholders.

### Map

- Load MapLibre only on this route.
- Fit available coordinates with a sensible Denmark-first default.
- Cluster overlapping points and distinguish exact from approximate markers without relying on color alone.
- Include navigation, zoom, keyboard instructions, attribution, and a reset-view control.
- Synchronize selection between markers and a searchable/filterable result list.
- Support `/map?specimen={id}` deep links.
- Do not plot unknown coordinates or infer coordinates from a text locality.

### Guides and preparation guide

- Guides use editorial long-form layouts with stable headings and a table of contents.
- The Phase 2.1 preparation link resolves to a static route shell so navigation is real even before guide content is publishable.
- The preparation guide will cover intake and legal/safety caveats, defleshing methods, maceration, beetles or careful heat alternatives, degreasing with suitable agents, hydrogen-peroxide whitening, drying, assembly, photography, troubleshooting, and record keeping.
- Methodology will later include dedicated illustrated measurement, age-estimation, and specimen-condition sections. The owner must supply/review real-skull landmark and reference imagery; age claims require species-aware citations and caveats.
- Specific chemical or biological safety claims require source review before publication.
- Images, diagrams, warnings, and comparisons should carry information that prose cannot convey as clearly.

### Contribution

- Specify background/surface, lighting, focus stacking, camera alignment, scale/calibration, minimum resolution, color profile, file format, canonical views, and naming.
- Request taxonomy guess, locality/date precision, measurements, preparation, owner/credit, rights grant, and public notes.
- Explain acceptance, requested corrections, attribution, edits, takedown contact, and non-guaranteed publication.
- Use a contact link in v1. Do not imply that attaching large source files to email is the final transfer method.

### About and supporting pages

- About remains personal and factual: collection purpose, acquisition sources, ethical/legal context, preparation, photography, and project development.
- Methodology separates observations from external species facts and explains confidence, taxonomy, measurement, date, and coordinate semantics.
- Rights, Privacy, and Accessibility must reflect actual behavior at release time and are release-blocking content, not boilerplate placeholders.

## 8. Cross-cutting behavior

### Search

- Index taxon, taxonomic-rank, and specimen documents separately.
- Rank exact scientific/common/specimen-ID matches above prefix, curated alias or synonym, fuzzy match, and profile text.
- Normalize case, punctuation, whitespace, and diacritics for matching while preserving original display text.
- Selecting a rank opens its taxonomy landing page; selecting a taxon or specimen opens its exact display.

### Taxonomy and uncertainty

- Taxon rank and identification qualifier are independent fields.
- Accepted species, subspecies, genus-only records, and uncertain identifications may be published when labelled correctly.
- Scientific-name updates must preserve immutable local IDs and old public URLs through redirects.
- External identifiers support verification; they never replace local identity.
- Repeated hierarchy name/slug pairs must agree across canonical rows so one generated rank URL never acquires conflicting labels or parents.

### Class-aware measurements

- `taxa.csv` and `specimens.csv` remain the only canonical collection tables; bird measurements do not create a second specimen source.
- Mammal and bird profiles control applicability, table order, definition guidance, and comparison rows. Unknown future classes use the conservative shared-field fallback until a reviewed profile is added.
- `not_recorded` means an applicable measurement was not supplied; `not_applicable` is reserved for fields outside the specimen's class profile.
- The partial exports under `agent_context/metadata_csv/` are migration evidence, not runtime/public files. Phase 3.1 normalized only the accepted 15-taxon/18-specimen review slice and recorded every boundary in `phase_3_1_migration_audit.md`; Phase 6 still performs the complete source-row, rights, note, taxonomy, and publication audit.

### Photography and gallery

- Canonical views are lateral, oblique, frontal, dorsal, ventral, and mandible-dorsal.
- Lateral is required for publication; absent optional views produce author warnings.
- Images retain transparent backgrounds and consistent framing. Ordinary galleries do not imply common scale; the dedicated calibrated comparison may share scale only for eligible lateral images with recorded maximum length, compiled subject bounds, and explicit orientation.
- Rights and credit attach to every asset/record.
- Public captions use `Photo:` plus the stored credit. The public footer carries the concise all-rights-reserved notice; structured rights fields continue to enforce publication safety even when no dedicated rights panel is rendered.

### Accessibility

- Meet WCAG 2.2 AA for the v1 scope.
- All functionality is keyboard operable at 360 px and larger.
- Focus is always visible; target sizes and control labels remain usable on touch.
- Color, hover, motion, or map position is never the sole carrier of meaning.
- Motion respects `prefers-reduced-motion`; zoom/fullscreen preserve focus and expose an escape path.

### Performance and resilience

- Core pages are statically prerendered.
- Lighthouse mobile targets: Performance at least 90; Accessibility, Best Practices, and SEO at least 95.
- LCP at most 2.5 s, CLS at most 0.1, and INP at most 200 ms under the agreed lab profile.
- Shared initial JavaScript targets at most 170 KB gzip, excluding route-lazy map code.
- Above-the-fold mobile imagery targets at most 250 KB where the photograph remains credible.
- Builds do not depend on GBIF, a map service, or another runtime database.

## 9. Content success and publication rules

A record may be marked `published` only when it has:

- a unique stable local ID and valid link to its taxon;
- an identification rank/status and reviewed taxonomy state;
- a public slug or stable nested URL;
- a lateral hero image with alt text, credit, and rights state;
- no invalid cross-record references;
- public-safe provenance and notes; and
- a valid default-specimen relationship when it is a taxon.

Draft records may be incomplete but must remain build-safe and invisible in production output.

## 10. Product acceptance criteria

The first public release is complete only when:

- known taxa are reachable through search or taxonomy in at most three meaningful interactions;
- all routes in the release scope have reviewed content and responsive states;
- every published taxon/specimen passes schema, relationship, media, rights, and taxonomy validation;
- a complete keyboard journey works from Home to an exact specimen;
- map content has equivalent non-map access;
- automated and manual release checks in [implementation_plan.md](implementation_plan.md) pass;
- no draft/private files or unexpected third-party requests are present in production; and
- production rollback to the previous Vercel deployment and Git tag has been tested.

## 11. Naming and future change

“Skull Collection” is a neutral working title stored in one central configuration. The final title, domain, public email, and brand mark are release-hardening decisions. Product structure must not depend on the temporary name.

The Phase 2.2 specimen-page scale card establishes reusable calibrated comparison primitives. A dedicated public two-select comparison route, overlays/split sliders, 360°, 3D, illustrations, direct contributions, database administration, analytics, localization, and data export remain deferred work. They require their documented prerequisites and a new scope decision; they are not to be smuggled into an earlier phase.
