# Competitive audit

**Status:** Approved planning evidence; Phase 3.1 multi-record catalog application checked

**Reviewed:** 2026-08-12

**Implementation check:** 2026-08-21

**Scope:** Public browsing, catalog structure, specimen presentation, search, map, and forward-looking media patterns

## 1. Purpose and limits

This audit examines the three major skull-reference sites named in the project brief. Its purpose is not to copy their branding or content. It identifies interaction patterns worth retaining, recurring friction to avoid, and opportunities for Skull Collection to combine photographic quality with systematic, accessible navigation.

The findings are a dated snapshot. External sites can change independently. Before implementing a feature whose details depend on a live reference, re-check that page and record any material change here or in an architecture decision record.

## 2. Evaluation criteria

Each site was reviewed through the following questions:

- Can a visitor understand the collection and find a known species quickly?
- Is taxonomy visible without overwhelming the image gallery?
- Are names, specimens, and records modelled consistently?
- How clearly are measurements, provenance, images, and uncertainty presented?
- Does search support realistic scientific and common-name lookup?
- Does the experience work on mobile and with keyboard/assistive technology?
- Is the map or other advanced media useful beyond visual novelty?
- Does the interface feel fast, trustworthy, and maintainable?

This is a product/interaction audit rather than an authorization to reproduce copyrighted assets or text.

## 3. Skull Index

Reference: <https://www.skull-index.com/species>

### Strong patterns

- High-quality skull photography on a black background creates a coherent, museum-like atmosphere.
- Family headings divide a long species gallery into recognizable systematic groups while cards retain a consistent multi-column rhythm.
- Image consistency makes visual comparison possible before a visitor reads the metadata.
- Multiple individuals help communicate that a species is not represented by one idealized specimen.
- The dark visual direction suits pale bone without becoming a conventional white database interface.

### Friction and risks

- The long order/family index and paginated mammal pages mix classification and browsing into a dense structure.
- Taxonomic position is difficult to scan when labels, gallery items, and pagination compete for attention.
- A visitor looking for one species must understand the site's organization before receiving strong search support.
- Repeated long lists make mobile navigation and orientation harder.
- Visual quality is not consistently matched by equally clear filtering, URL state, or progressive disclosure.

### Adopt for Skull Collection

- Large, consistently framed skull imagery on a deep neutral background.
- Representative images at every useful browsing level.
- Multiple specimens exposed through a compact selector and exact links.
- Family-labelled card groups at broad catalog scopes, without subdividing already small family scopes into sparse genus sections.

### Improve or reject

- Keep the taxonomy index structurally separate from the gallery while synchronizing their scope.
- Replace long page-number sequences with stable rank pages and URL-backed filters.
- Make multilingual search and mobile navigation first-class rather than secondary entry routes.

## 4. Skull Base

References: <https://www.skullbase.info/> and <https://www.skullbase.info/map.php>

### Strong patterns

- Pages are lightweight, predictable, and quick to navigate.
- A systematic recurring layout reduces the learning cost between specimens.
- Family-separated multi-column galleries make broad catalog pages easier to scan than one undifferentiated grid.
- Datasheet-like presentation makes record fields easy to find.
- Related records and direct links support practical reference use.
- The map connects physical specimens to geography in a way a text catalog alone cannot.
- 360° sequences demonstrate the value of controlled capture for understanding three-dimensional form.

### Friction and risks

- Fixed-width and older visual conventions do not adapt gracefully to modern mobile use.
- Dense static name lists scale poorly and provide limited assistance for spelling variants or aliases.
- Search and navigation expose the implementation's age rather than guiding a visitor through uncertainty.
- Tabular completeness can dominate the photography and make unknown values feel like data-entry failures.
- Map popups and controls need accessible list equivalents and modern touch/keyboard behavior.

### Adopt for Skull Collection

- Fast, consistent, specimen-oriented information structure.
- Related records and a geographic entry point.
- 360° as a future capture discipline, not a simulated effect from six photographs.

### Improve or reject

- Preserve speed through static generation and small client islands while using responsive layouts.
- Replace static lists with indexed search, rank landing pages, facets, and stable query parameters.
- Design every map interaction alongside a synchronized semantic list.

## 5. Skullsite

References: <https://skullsite.com/>, <https://skullsite.com/skull-orders-and-families/>, <https://skullsite.com/custom-search/>, and <https://skullsite.com/3d-models/>

### Strong patterns

- Size-based search recognizes that visitors may identify an unknown skull through physical properties rather than a known name.
- Order/family pages expose systematic classification.
- 3D experiments point toward useful future morphology tools when accurate source models exist.

### Friction and risks

- Navigation is fragmented across page types and does not establish one predictable primary catalog.
- Verbose hierarchy labels and long pages obscure current location and next action.
- Visual and information hierarchy is inconsistent, which lowers trust and increases scanning effort.
- Search modes feel like separate utilities instead of views of one coherent collection model.
- Experimental media is not enough to compensate for weak core navigation.

### Adopt for Skull Collection

- Numeric length and weight discovery.
- Future 3D support behind a media abstraction.

### Improve or reject

- One `/species` catalog owns search, filters, and result-mode changes.
- One shared taxonomy template owns class/order/family/genus browsing.
- Defer advanced media until core routes, rights, accuracy, performance, and accessible fallbacks are proven.

## 6. Comparative summary

| Dimension | Skull Index | Skull Base | Skullsite | Skull Collection response |
|---|---|---|---|---|
| Photographic impact | Strong | Functional | Inconsistent | Museum-scale, consistently framed transparent imagery |
| Speed/predictability | Moderate | Strong | Mixed | Static-first routes and small client islands |
| Taxonomy | Visible but dense | Systematic lists | Fragmented hierarchy | Dedicated rank pages plus compact synchronized index |
| Search | Secondary | Basic/static | Separate utility modes | One multilingual weighted index across ranks, taxa, and specimens |
| Multiple specimens | Visible | Record-oriented | Mixed | Default specimen on taxon page plus stable nested specimen URLs |
| Numeric discovery | Limited | Limited | Useful idea | URL-backed length/weight filters in species and specimen modes |
| Map | Not defining | Valuable | Not defining | Clustered MapLibre view plus equivalent results list |
| Advanced media | Standard images | 360° strength | 3D experiments | 360°/3D deferred until capture and accuracy requirements are met |
| Mobile/accessibility | Uneven | Dated | Uneven | WCAG 2.2 AA, 360 px layouts, keyboard and reduced-motion requirements |
| Content transparency | Varies | Datasheet-like | Varies | Explicit missing values, confidence, partial dates, precision, citations, and rights |

## 7. Adopted design decisions

The combined response is deliberately not a visual average of the three sites:

1. Pair Skull Index's photographic atmosphere with Skull Base's systematic predictability.
2. Separate taxonomic orientation from the image gallery instead of merging them into one long list.
3. Use one search/catalog architecture for names, ranks, IDs, numeric filters, and both result modes.
4. Represent a species and a physical specimen as different but linked entities.
5. Treat the map as one accessible view of canonical specimen data, not a second data source.
6. Require controlled capture and accessible fallbacks before adding 360° or 3D.
7. Make honest uncertainty, citations, rights, and performance part of the exhibit's credibility.

## 8. Patterns explicitly rejected

- Long undifferentiated taxonomy pages with gallery items embedded between rank headings.
- Page-number navigation as the primary way through a modest catalog.
- Fixed-width desktop layouts.
- Search that requires exact spelling or only one naming language.
- Measurement filters that silently treat unknown values as zero.
- Separate, inconsistent record templates for different animal classes.
- Map-only access to location records.
- Decorative 3D/AI effects presented as documentary evidence.
- Direct uploads before storage, consent, security, moderation, and retention are designed.

## 9. Phase 3.1 and combined Phase 3.2/4 implementation application

Phase 3.1 applies the audited patterns without re-copying any reference site's content or branding:

- the shared dark museum shell and large lateral imagery retain the photographic emphasis;
- `/species` keeps class entries, a compact linked hierarchy, its ordinary rank-list alternative, and the image gallery structurally separate;
- one class/order/family/genus template creates predictable, breadcrumbed rank pages rather than long mixed hierarchy pages;
- all-species and class/order galleries use family headings plus responsive three/two/one-column grids, while family/genus pages avoid unnecessary sub-grouping;
- taxon cards retain the accepted species-first URL model and add a compact physical-specimen chooser with exact nested links when more than one skull exists;
- all routes remain static and useful without JavaScript; and
- the Home geographic preview is a semantic record summary, not a premature or decorative map implementation.

The combined Phase 3.2/4 milestone applies the catalog findings directly: the image grid moves above the former stacked presentation modules; one compact sticky control region owns search, mode, class, facets, sort, active state, and clear; higher-rank suggestions and the taxonomy drawer distinguish fast in-catalog filtering from explicit stable rank routes; and species/specimen results share one URL-backed query model. Scientific/English/Danish/ASCII/alias/specimen-ID fields, credible fuzzy fallback, numeric missing-value semantics, no-result recovery, and browser-history restoration are implemented without a hosted service or second taxonomy source.

The 15-taxon/18-specimen catalog remains too small to justify pagination or virtualization. The comprehensive interactive systematic tree is separately planned as Phase 3.3; the implemented class → order → family → genus → taxon drawer/list makes no unsupported identification-characteristic or evolutionary-timescale claims.

## 10. Revalidation triggers

Revisit this audit when:

- a reference site materially redesigns its catalog, search, map, or media experience;
- an implemented phase exposes a conflict between the approved experience and these assumptions;
- catalog scale makes the current paging/virtualization decision measurable;
- comparison, 360°, 3D, or direct contributions enter active planning; or
- usability testing shows that a rejected pattern solves a real visitor problem better than the current design.
