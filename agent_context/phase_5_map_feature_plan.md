# Phase 5 map feature plan

**Status:** Owner-authored implementation brief; review this document before implementation

**Route:** `/map`

**Scope:** A map-only Phase 5. The map, its search/filter workflow, its synchronized result list, the specimen-page `View on map` entry point, and all map-specific resilience/accessibility work are in scope. The previously planned editorial/supporting pages are deliberately deferred and must not be implemented as part of this phase.

**Product direction:** Build the most useful, functional, and trustworthy geographic view of the skull collection. The map is not a decorative background. It is one visual view of the canonical specimen records, paired with a complete text-based record list.

## 1. Why this feature exists

The map should let a visitor understand where the physical skulls in the collection come from, narrow the collection to records of interest, inspect the spatial meaning of each record, and move directly to the exact specimen page.

The experience should answer these questions quickly:

1. Which published specimens have public location data?
2. Where are those records located relative to one another?
3. Is a point exact or approximate, and what does that mean?
4. Which individual specimens are represented when points overlap or form a cluster?
5. How do I get from a map record to the complete specimen exhibit?

The map must remain useful as the collection grows. It should not be designed only around the current 15 taxa and 18 specimens, but it should feel light and immediate at the current scale.

## 2. Scope and boundaries

### Included in this Phase 5 map milestone

- A real `/map` route with a map visible immediately on entry.
- MapLibre GL JS loaded only by the `/map` route.
- OpenFreeMap as the initial vector-tile provider through a replaceable provider/style adapter.
- A compact map search surface that can select taxa, higher taxonomic ranks, and exact specimens.
- Reuse of the existing canonical search, taxonomy, filter, URL-state, media, and specimen-link rules.
- A deterministic GeoJSON projection of published specimens with usable coordinates.
- Exact and approximate specimen markers, class-aware marker shapes, selected state, and marker clustering.
- An anchored, scrollable cluster popup listing every physical specimen in the selected cluster.
- An individual specimen popup with a lateral image, identity, location/precision, and an exact specimen link.
- An uncertainty-area toggle and automatic selected-record uncertainty display.
- A base-map style selector containing only styles actually supported by the configured provider.
- A complete synchronized semantic result list, including a clear treatment of published records that cannot be plotted.
- `/map?specimen={id}` deep links from specimen pages and direct external links.
- Responsive desktop, tablet, mobile, keyboard, touch, reduced-motion, no-WebGL, no-JavaScript, and provider-failure behavior.
- A nearby `View on map` action in the specimen Collection record when that specimen has a public coordinate pair.

### Explicitly deferred

- About, Guides, Methodology, Rights, Privacy, Accessibility, and Contribution page authoring.
- A second map on Home or any specimen page.
- A runtime database, CMS, upload flow, account system, analytics, cookies, or tracking.
- Address search, reverse geocoding, browser geolocation, or a visitor-location feature.
- Satellite imagery, a satellite/road hybrid, elevation terrain, 3D terrain, or a proprietary map service unless a later provider decision supplies a suitable licensed source.
- The Phase 3.3 comprehensive interactive taxonomic tree.
- Heatmaps, drawing tools, route planning, time animation, or other map visualizations that do not directly serve the specimen collection.

Do not use the map phase as an excuse to complete unrelated editorial work. If a supporting page is required only as a navigation target, keep the link honest and use the existing route shell or a clearly deferred state according to the canonical documentation.

## 3. Experience philosophy

The map page should follow the same catalog-first direction as `/species`:

- The map is visible immediately and occupies most of the viewport.
- Search and filtering are close to the map and remain available without a long editorial preamble.
- The result list is a first-class interface, not an afterthought or a hidden accessibility concession.
- Progressive disclosure keeps advanced controls available without making every option permanently visible.
- The visitor always knows how many records are shown, how many are not mappable, what a marker means, and where an exact record link leads.
- Photography remains part of the collection experience: list rows and popups use the canonical lateral image where available.
- Map position, color, hover, animation, and marker shape never carry meaning alone. Text and semantic controls must communicate the same information.
- The page should feel like a compact museum instrument: calm, precise, responsive, and information-dense without becoming crowded.

The central interaction model is:

```text
search/filter canonical specimens
             ↓
map markers + clusters  ↔  complete semantic result list
             ↓                         ↓
       popup/selection       exact specimen page
```

There is one canonical collection state. The map, list, marker selection, popup content, counts, and deep links are projections of that state rather than separate implementations.

## 4. Canonical location truth

The map must respect the location policy in `docs/content_data_model.md` exactly.

### Which records are plotted

- Include only `published` specimens with a valid latitude/longitude pair and a valid coordinate precision.
- `coordinate_precision = exact` produces an exact-location point.
- `coordinate_precision = approximate` produces a point marked as approximate and may produce an uncertainty area when a positive `coordinate_uncertainty_m` value exists.
- `coordinate_precision = unknown`, a missing coordinate pair, or an invalid coordinate never produces a point.
- Never infer a point from `location_label`, a country, a locality phrase, image EXIF, or the visual appearance of a map.
- Never silently downgrade or upgrade the supplied precision.
- Preserve the curator-supplied coordinate and uncertainty semantics in the generated projection.

The existing owner-approved policy permits exact public coordinates when they are known. Approximation represents uncertainty in the source location; it is not an invented privacy mask and must not be described as a statistical confidence interval unless the source data explicitly supports that claim.

### Records without a plotted point

A filtered result must not disappear silently merely because it has no public coordinate. The synchronized list should therefore distinguish:

- **Mapped specimens:** records with a plotted point.
- **Not mapped:** published records matching the current search/filter state but lacking a usable public point, with a concise `No public coordinates` explanation and an exact specimen-page link.

The headline count should make the distinction clear, for example: `12 mapped specimens · 3 without public coordinates`. A record in the second group cannot be focused on the map, but it remains discoverable and navigable.

### Uncertainty areas

The `coordinate_uncertainty_m` value is a radius in metres supplied by the curator. When rendered, it must represent a geographic radius rather than a fixed screen-pixel circle:

- Generate or render a geodesically appropriate circle/polygon around the coordinate in map coordinates.
- The area should scale naturally as the visitor zooms; it must not pretend that a 20-pixel ring represents the same physical distance at every zoom level.
- Display a concise explanation such as `Approximate location · uncertainty radius 25 km` in the selected popup/list context.
- Do not describe the perimeter as a guaranteed boundary or as a probability distribution.
- If the uncertainty value is absent or `0`, show no uncertainty area.
- Exact points with no uncertainty do not show a circle.

The global `Show uncertainty areas` control should be off by default to avoid turning a dense map into overlapping translucent disks. Selecting an approximate specimen is the exception: its own uncertainty area should appear automatically so the visitor immediately understands the selected record. When the control is off, other unselected uncertainty areas remain hidden; when it is on, all eligible areas are shown.

The same precision meaning must be available in text and in the map key. Exact versus approximate must never rely only on color, transparency, or the presence of a circle.

## 5. Provider and map-rendering decisions

### Library

Use MapLibre GL JS. Load it dynamically and only on `/map`, preserving the existing route-lazy bundle boundary. The provider is a source of basemap tiles/styles only; it never owns specimen records, search state, URLs, or canonical location data.

### Initial provider

Use the public OpenFreeMap vector-tile instance initially, behind a small provider adapter that owns:

- style URL resolution;
- provider attribution;
- allowed tile, glyph, sprite, and asset origins;
- provider-load error reporting; and
- a future replacement point for a paid provider or self-hosted style/tiles.

OpenFreeMap is a sensible initial provider because its public instance is designed for custom maps, does not require an API key or cookies, permits commercial usage, and is based on OpenStreetMap data. Attribution remains required. The public service does not provide an SLA, so the map must fail gracefully to the semantic list if its style or tiles cannot load.

### Base-map style selector

The selector must show user-facing labels that communicate the visual difference and must contain only working configured styles. For the OpenFreeMap launch configuration, use these options:

1. **Museum dark** — `Fiord`; recommended default because it fits the dark natural-history museum interface.
2. **Dark** — `Dark`; an explicit dark alternative.
3. **Light** — `Positron`; a restrained light alternative.
4. **Standard** — `Liberty`; the general-purpose colorful vector map.
5. **Bright** — `Bright`; an optional vivid alternative if it remains visually legible with the specimen overlays.

The exact internal names and URLs may be handled by the provider adapter, but the selector must not expose a style that has not loaded successfully in the chosen provider configuration.

Do not expose `Satellite`, `Hybrid`, or `Terrain` in the initial OpenFreeMap selector. OpenFreeMap’s current official styles are vector styles; they are not satellite imagery or an elevation source. MapLibre can support other raster/elevation sources, but adding those options would require a separate provider, terms/attribution review, possible API credentials, and additional failure/performance handling. The architecture should make those future additions possible without changing `specimens.csv` or map record identity.

Do not present OpenFreeMap’s experimental/3D style as terrain. It should remain out of the launch selector unless a separately reviewed elevation source and a clear 3D product requirement are approved.

The selected style may be URL-backed as `style={key}` so a shared URL reproduces the visual choice. If implementation evidence shows that style belongs to transient presentation state instead, preserve it locally without allowing it to contaminate specimen identity or filter state. The choice must survive at least a style change without resetting search, filters, selected specimen, or map data.

### Attribution and provider failure

- Use MapLibre’s attribution control or an equivalent always-visible attribution treatment.
- Include the required OpenFreeMap/OpenMapTiles/OpenStreetMap attribution for the active style/provider.
- Do not hide attribution in a tooltip or behind a control that is unavailable on mobile.
- If a style, font, sprite, or tile request fails, show a concise map-status message with a retry action while retaining the complete result list.
- A provider failure must not erase selected state, search state, or exact specimen links.
- Do not silently switch to a provider with different terms or data semantics.

Relevant provider references: [OpenFreeMap](https://openfreemap.org/), [OpenFreeMap Quick Start](https://openfreemap.org/quick_start/), and the [OpenFreeMap styles repository](https://github.com/hyperknot/openfreemap-styles).

## 6. Route, state, and deep links

### Route

The page is `/map`. It should use the existing museum shell and navigation, but the map workspace begins immediately below the shell header. Do not place a long introduction, a large hero, or the supporting editorial pages before the map.

### URL-backed collection state

Reuse the existing canonical query/filter vocabulary wherever possible. The map state should support:

- a free-text query `q`;
- taxonomy scope for a selected class, order, family, genus, or taxon;
- controlled-value filters already supported by the catalog (`class`, sex, age, condition, preparation);
- length and prepared-mass bounds where applicable;
- selected exact specimen `specimen=SPEC-xxxx`;
- selected basemap style `style={key}` if style sharing is retained; and
- uncertainty visibility `uncertainty=1` or an equivalent explicit boolean if the implementation chooses to share this presentation state.

Invalid values must be rejected using the same honest state parsing rules used by the catalog. Direct load, reload, back, and forward must restore meaningful search/filter/selection state. Transient popup open state need not be serialized separately.

The map camera center and zoom do not need to be URL-backed by default. A specimen deep link and the current collection query are more valuable for sharing than a fragile pixel-specific camera position. If camera state is serialized later, it must not make ordinary navigation noisy or produce repeated animation on reload.

### Search is collection search, not place search

The map search bar must search the same canonical taxonomic and specimen index as the Species catalog. It must not geocode arbitrary addresses or call a place-search service.

- Searching a class/order/family/genus/taxon filters the map and list to all matching physical specimens with usable coordinates, while keeping matching unplotted records in the `Not mapped` list group.
- Searching an exact specimen ID selects that specimen, focuses it when mappable, opens its individual popup, and shows an honest unavailable-coordinate message when it is not mappable.
- Searching common, scientific, Danish, or reviewed alias terms follows the existing normalization and strict fuzzy-acceptance rules.
- A taxon or rank suggestion filters the map; it does not unexpectedly navigate away to the taxonomy page. If an explicit stable taxonomy page link is useful, present it as a secondary action rather than changing the primary search behavior.

The map is inherently specimen-based: each plotted point represents a physical specimen. Do not add a Species/Specimens result-mode toggle to the map unless implementation evidence later shows a real need. Taxonomic searches are scopes that resolve to physical map records, which keeps marker counts and cluster contents truthful.

## 7. Exact page anatomy and responsive layout

### Shared page structure

Use this order:

1. Existing global museum header/navigation.
2. A compact map toolbar containing the page title, live result summary, search, and map actions.
3. A map workspace containing the MapLibre canvas and the synchronized result list.
4. No long editorial block before the workspace. Supporting explanatory prose belongs in a later editorial phase; only concise map instructions/key text belongs here.

The map workspace should occupy the available viewport height using the small-viewport-safe viewport units where supported. It must not require the visitor to scroll through a long page before seeing the map. Result lists and popups scroll internally rather than creating accidental document-level scrolling.

### Compact toolbar

The toolbar is operational, not a hero section. It should contain:

- a short heading such as `Explore the collection map`;
- a live summary such as `18 mapped specimens · 2 without public coordinates`;
- one prominent full-width-or-flexible search combobox;
- a Filters action using the established filter icon and accessible label;
- a Base map action using a layers/map-style icon and accessible label;
- a `Show uncertainty areas` switch or labelled icon toggle;
- a `Reset view` action that resets the camera to the current results, not the search/filter state;
- a mobile `Results`/list toggle when the list is collapsed; and
- a compact `Map key` disclosure if the legend is not permanently visible.

Use the existing compact icon language on narrow screens. Every icon control must retain a useful accessible name and a visible tooltip on pointer hover/focus where appropriate. On touch screens, the same information must be available through the control label or a tap-open help surface; hover must never be the only explanation.

The toolbar must not become a tall stack of full-text buttons on mobile. Search remains the primary wide control; secondary actions collapse into compact labelled controls or a popover while preserving 44 px touch targets.

### Desktop and wide screens

At wide desktop widths:

- Keep the map and result list visible together in one workspace.
- Let the map dominate approximately two-thirds to three-quarters of the available width.
- Use a right-side result rail of a comfortable reading width, approximately 320–400 CSS px depending on available space.
- Keep the result rail independently scrollable; scrolling it must not move the document or unexpectedly pan the map.
- Keep the toolbar above or within the workspace without consuming a full editorial viewport.
- Keep map controls in a compact vertical stack inside a clear corner of the canvas.
- Treat the result rail as part of the map page, not as a secondary page below the map.

When a cluster popup is opened, calculate its available space against both the map canvas and the result rail. Do not allow the popup to be hidden beneath the rail or clipped by the browser viewport.

### Medium widths and narrow desktop tabs

At widths where a permanent result rail would make the map or toolbar cramped:

- Let the map use the full workspace width.
- Convert the result rail into a collapsible side drawer or bottom sheet according to available height/width.
- Keep the search field usable and keep all important controls on one compact row or two deliberately designed rows; never allow arbitrary button wrapping to create a broken third row.
- Ensure the map remains the dominant visible element.

### Mobile and narrow screens

At 360–390 px widths:

- Show the map immediately below a compact toolbar.
- Keep the initial map view large enough that it is the primary attraction and not reduced to a small preview.
- Collapse the full result list by default into a clearly labelled `N results`/`View records` control or a bottom-sheet handle.
- When opened, show a bottom sheet with a maximum height that leaves a visible map context. The sheet has its own vertical scroll and does not force the document to scroll.
- Keep the search field at the top of the map controls; use compact labelled icon actions for filters, styles, uncertainty, and reset.
- Make popups fit inside the viewport with a small safe margin. If an anchored popup cannot fit beside its marker, clamp or reposition it rather than allowing horizontal overflow.
- Keep the map key and precision explanation accessible through a disclosure rather than permanently consuming map height.
- Preserve map/list selection when the result sheet opens, closes, or changes height.

The page must remain usable in portrait and landscape, at browser text zoom/effective 200% reflow, with forced colors where practical, and with no horizontal overflow.

## 8. Search and filter surface

### Search combobox

Reuse the Species catalog search behavior and visual language, adapted to the map page:

- Search suggestions may include taxonomic ranks, taxa, and physical specimens.
- Each suggestion can show the English name, scientific name, Danish name where useful, stable ID/context, and a mini lateral thumbnail when a canonical lateral image exists.
- Selecting a rank or taxon applies a map scope; selecting a specimen focuses an exact physical record.
- Arrow-key navigation, Enter, Escape, pointer selection, touch selection, live status, and focus restoration must match the catalog’s accessible behavior.
- The listbox must stay above the map and controls, remain internally scrollable, and hand boundary scrolling back to the intended page/sheet behavior without lag.
- A failed lazy search-index load should show an honest recoverable search error; it must not break the static result list or map shell.

### Filters

The Filters action should reuse the existing canonical filter dialog and controlled values rather than creating map-only definitions. Include, where applicable:

- class;
- sex;
- age;
- condition;
- preparation/defleshing method;
- skull length bounds; and
- prepared skull mass bounds.

Unknown and non-applicable measurements are excluded from numeric ranges according to the existing catalog rules. Active filters appear as removable chips or a compact summary, and `Clear all` restores the unfiltered map/list without resetting the selected basemap style unless the visitor explicitly resets it.

Every filter update should update the map, clusters, result list, counts, and selected-state recovery together. If the selected specimen is removed by a new filter, close its popup and announce the state change without unexpectedly navigating away.

## 9. Marker system

### Individual markers

Use class-aware marker shapes where this remains legible and maintainable:

- a simple, recognizable mammal silhouette/icon for Mammalia;
- a simple, recognizable bird silhouette/icon for Aves; and
- a neutral fallback marker for any future class not covered by the icon set.

The icons should be simple enough to remain clear at normal map zoom and high-contrast modes. They are location markers, not detailed animal illustrations.

Use color as supporting emphasis, not as the only semantic channel. A robust encoding is:

- class: icon/shape first, restrained color second;
- precision: solid/standard marker treatment for exact, visibly outlined/dashed or otherwise distinct treatment for approximate, plus text in the popup/list;
- selection: a high-contrast selected ring/outline and an explicit selected state; and
- unavailable coordinate: represented in the semantic list, never as a misleading marker.

Do not use marker size to represent skull length, mass, age, or any other biological measurement. Those values are too easy to confuse with geographic scale and would overload the map.

### Clusters

Use MapLibre’s GeoJSON clustering for overlapping/nearby specimen points. The exact radius and zoom thresholds should be tuned against the real collection and verified responsively, but the behavior must be:

- every cluster shows the number of physical specimens it contains;
- cluster size increases in clear steps as the count increases;
- the count is prominent and remains readable in light/dark styles and forced-color conditions;
- a mixed-class cluster uses a neutral cluster treatment rather than pretending to be a single class;
- a cluster is never mistaken for one specimen; and
- the cluster’s accessible name states the count and invites inspection.

MapLibre’s cluster source APIs can provide cluster expansion and leaves. Use them to retrieve the complete cluster membership, not a fixed top-ten slice. Current and future collection sizes must not cause valid cluster members to disappear from the cluster popup.

Relevant reference: [MapLibre create and style clusters](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/) and [GeoJSONSource cluster APIs](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/).

### Selected marker

The selected marker must be visibly distinct without relying only on color. It may use a high-contrast halo, outline, or modest scale change. Selection must also be reflected in:

- the individual popup or cluster context;
- the corresponding semantic list row;
- the live status where a concise announcement is useful; and
- the exact `specimen` URL state when the selection is shareable.

## 10. Anchored cluster popup

Clicking/tapping/activating a cluster opens an anchored cluster popup beside that cluster marker. Do not make the only behavior “zoom in”; the visitor must be able to inspect the records represented by the cluster immediately.

### Popup geometry

- The popup has a compact fixed-width design on desktop and a viewport-safe width on mobile.
- It has a bounded height and an internal vertical scroll region.
- It is positioned automatically on the left or right of the marker according to available map-canvas space.
- It must account for the fixed toolbar, map controls, result rail, browser viewport, and mobile safe areas.
- If neither side has enough room, clamp it to the largest safe position or use a centered anchored placement while retaining the marker relationship.
- The popup must never be clipped, push the document layout, or make the entire page scroll to reach hidden rows.
- A clear close control and Escape behavior are required.

### Popup content

The header states the total, for example `7 specimens in this area`. The scrollable list contains every specimen in the cluster, one row per physical specimen. Every row includes:

- common/English species name;
- scientific name below or beside it;
- immutable specimen ID;
- canonical lateral thumbnail aligned on the right;
- concise exact/approximate precision indicator in text; and
- an accessible action to select/focus the exact specimen and an obvious route to view its complete specimen page.

Do not repeat one row for a taxon display and a default specimen. Cluster membership is physical-specimen-based, so each row is a real specimen.

Clicking a row should select that specimen, highlight/focus its exact marker when possible, and update the single selected state. A separate exact link/action should open the nested specimen page so the visitor can inspect the full exhibit without accidental navigation from ordinary selection. If a selected record is at the same coordinate as other records, keep the exact specimen identity visible and allow the visitor to choose another cluster member.

The popup list must support keyboard navigation and a screen-reader-readable count. Internal scrolling must be smooth and must not steal or trap focus unexpectedly.

## 11. Individual specimen popup

Activating an unclustered specimen marker opens an individual popup or equivalent anchored card. It should contain, in compact order:

1. lateral image thumbnail;
2. English/common name and scientific name;
3. immutable specimen ID;
4. location label;
5. date in the existing concise display format when recorded;
6. `Exact location` or `Approximate location` text;
7. uncertainty radius text when applicable; and
8. a clear `View specimen` link to the exact nested specimen route.

The popup may include a compact taxon link as a secondary action, but the exact specimen link is primary. Do not fill missing data with guesses. Use the existing `Not recorded`, `Not applicable`, and `Approximate location` semantics.

Selecting a marker from the semantic list and selecting it from the map must produce the same popup/card state. A pointer selection should not unexpectedly move the document to the top of the page.

## 12. Semantic result list

The result list is the complete non-map equivalent required by the project contract. It should be visible on desktop and available through a labelled drawer/sheet on narrow screens.

### List header

Show:

- the number of matching published records;
- the number plotted versus not plotted;
- the active search/scope summary; and
- a clear action for returning to the unfiltered result set.

### Mapped row anatomy

Each mapped row should contain:

- lateral thumbnail on the right or in a consistent compact media column;
- English/common name;
- scientific name;
- immutable specimen ID;
- concise location label;
- date if recorded;
- exact/approximate precision text; and
- a clear exact specimen link or row action.

Clicking/activating a row selects the marker and brings it into the map view. Selection should not steal focus from a keyboard user unless the user explicitly activates a map-focus action; update the row’s selected semantics and provide a concise status instead.

### Not-mapped row anatomy

Keep the same identity and exact specimen link, but show `No public coordinates` rather than a map-focus control. This group may be collapsed by default when it is large, but its count and expand control must be visible. Do not render a fake marker at a country center or a random fallback point.

### Ordering and grouping

Use deterministic ordering based on the existing catalog query model. Do not add a complex second list-sorting system unless it directly improves map use and can share the catalog’s semantics. If grouping by family or class is useful, it must be a presentation grouping only and must not hide or duplicate physical records.

## 13. Viewport and camera behavior

### Initial view

- Fit all currently mapped published results with sensible padding.
- Use a Denmark-first view when the data has no useful bounds or when an empty result state needs a stable geographic context.
- Do not hard-code a Denmark-only projection; future international records must fit automatically.
- Keep the first map view stable enough that a visitor can understand the collection without an aggressive animation.

### Reset view

`Reset view` fits the current filtered mapped results. It must not silently clear search, filters, or selected style. If there are no mapped results, retain a sensible Denmark-first fallback and explain that no matching public coordinates are available.

### Selection and focus

- `/map?specimen=SPEC-xxxx` focuses the exact mapped specimen, opens its popup, selects its list row, and shows its uncertainty area when applicable.
- If the ID is published but has no public coordinate, retain the exact specimen link and show an honest `This specimen has no public coordinates to plot` state in the list/map status area.
- If the ID is unknown, draft, or not available in the generated collection, show a recoverable not-found selection message and keep the map/list usable.
- Do not repeatedly fly/animate to the same specimen on harmless rerenders or browser-history restoration.
- Under reduced motion, use an immediate camera change or a very restrained transition.

## 14. Map controls and key

### Required controls

- zoom in and zoom out;
- reset/fit current results;
- search;
- filters;
- base-map style;
- show/hide uncertainty areas;
- result-list open/close on narrow layouts; and
- a visible provider attribution control.

A fullscreen control may be included if it works consistently and remains accessible, but it is secondary to the required controls. Do not add browser geolocation, rotation, pitch, or decorative 3D controls unless they solve a demonstrated collection task.

### Map key

The key should explain, in text and icon form:

- mammal marker;
- bird marker;
- exact location;
- approximate location;
- uncertainty area; and
- cluster count.

It may be a compact disclosure on mobile and a small visible panel on desktop. It must remain readable against every supported basemap style and in forced colors.

## 15. Data and architecture expectations

### Build-time projection

Generate a deterministic, versioned map projection from the compiled published collection. The generated output is replaceable build output, never a hand-maintained source. It should contain enough data for map/list/popup rendering without making the client parse CSV rows.

At minimum, each mapped `MapRecord` needs:

| Data | Purpose |
|---|---|
| `specimenId` | Exact identity and stable route |
| `taxonId` and taxon slug | Taxon relationship and optional secondary link |
| English, scientific, and Danish names/aliases as available | Display and search context |
| canonical class and hierarchy labels | Marker icon and context |
| latitude/longitude | Point geometry |
| `coordinatePrecision` | Exact/approximate semantics |
| `coordinateUncertaintyM` | Geographic uncertainty area |
| `locationLabel` | Human-readable popup/list locality |
| acquisition date/precision | Concise record context |
| canonical lateral `MediaAsset` path and alt text | Popup/list photography |
| exact specimen href | Non-map equivalent and navigation |

The generated projection should be deterministically sorted and should exclude drafts, invalid rows, unknown-coordinate points, private staging data, raw image paths, EXIF, and unreviewed notes. Unknown-coordinate published records may be represented in a separate list projection so they remain discoverable, but they must not enter the point GeoJSON.

### One source, one query model

- Reuse compiled `TaxonRecord`, `Specimen`, `MediaAsset`, and catalog query/filter models.
- Do not construct media filenames from IDs in page code.
- Do not make the map read `skulls_meta.csv`, `metadata_csv/`, a live spreadsheet, GBIF, a runtime database, or a geocoder.
- Do not create a second taxonomy hierarchy or a second definition of precision.
- Keep all map-only transformations pure and testable outside React where practical.

### Client boundary

MapLibre and map interaction code are client-only. The route shell, headings, counts, semantic list, links, metadata, and no-JavaScript fallback should remain server-renderable. A client island may receive serialized typed records/projections and own the MapLibre lifecycle, selection, popup, map camera, and transient controls.

The implementation may serialize the generated projection into the route or load a validated ignored browser artifact, depending on measured payload and existing repository conventions. Either way, there must be one generated source and no runtime CSV/compiler dependency.

### Security and bundle isolation

- MapLibre must not load on Home, Species, taxonomy, specimen, guide, or not-found routes.
- CSP and related headers must allow only the specific MapLibre worker/style/tile/glyph/sprite origins required by the configured provider.
- Do not use broad wildcard network permissions.
- No tracking, cookies, account state, or map-provider user profiling may be introduced.

## 16. Accessibility and resilience

### Keyboard and assistive technology

- The complete specimen list is the primary keyboard-equivalent path; visitors must not need to operate a canvas to reach a record.
- Every mapped list row has a keyboard-accessible exact specimen link.
- Cluster and specimen popups have labelled close controls, sensible focus entry/return, Escape handling, and readable headings.
- Search, filters, style selection, uncertainty, reset, and list controls use semantic buttons, switches, selects, dialogs, and listboxes.
- Map selection is reflected in the list through selected/current semantics and concise status text.
- Expose precision and coordinate availability as text, not only marker styling.
- Avoid noisy announcements for every camera movement; announce meaningful result/selection changes only.
- Maintain WCAG 2.2 AA contrast, visible focus, and approximately 44 × 44 px touch targets.

### No JavaScript

Without JavaScript, the page should still provide:

- a clear map-page heading and explanation that the interactive map requires JavaScript;
- a complete server-rendered list of published matching specimens with location/precision text;
- exact links to every specimen page; and
- a no-map message that does not pretend a static image is an interactive map.

The no-JavaScript list is not a top-ten preview. It is the complete equivalent for the current published collection.

### No WebGL or browser capability failure

If WebGL, MapLibre, a required worker, or a provider style is unavailable:

- keep the page layout intact;
- show a concise recoverable message in the map region;
- retain search/filter controls and the complete semantic list;
- retain exact specimen links; and
- offer retry where retry can plausibly help.

Do not replace an unavailable map with a misleading static point image or blank space.

### Reduced motion and touch

- Respect `prefers-reduced-motion` for fit, focus, popup, and style transitions.
- Do not use animated map movement as the only way to reveal selection.
- Map drag and pinch should remain native and predictable on touch devices.
- The result sheet and popup have bounded internal scrolling and must not create the kind of scroll chaining or page-jank previously fixed in the catalog search surface.
- The user must be able to close every sheet, popup, and disclosure with a visible control and Escape where applicable.

## 17. Visual and content direction

The map should belong to the existing dark natural-history museum system without copying the tall editorial layout that the Species catalog intentionally moved away from.

- Use the existing near-black/charcoal canvas, bone-white text, restrained brass/gold accents, and established typography.
- Let geographic context remain legible. Do not place dense museum decoration over roads, coastlines, labels, or marker clusters.
- Keep marker overlays visually calm and high contrast across dark and light basemaps.
- Use compact uppercase metadata only for short labels such as `18 MAPPED` or `SPEC-0013`; do not turn every map fact into a large title.
- Preserve lateral skull photography as a recognizable miniature, with consistent aspect-ratio handling and no stretching.
- Keep popup/list facts dense but readable. Prefer a small number of useful facts to a large card with redundant prose.
- Use honest wording: `Exact location`, `Approximate location`, `No public coordinates`, `Not recorded`, and `N/A` only where the existing product contract permits the abbreviation.

## 18. Core interaction scenarios

The implementation and browser tests should cover these journeys:

### Open the map

The visitor opens `/map`, sees the map immediately, sees a truthful result summary, and can identify the result-list control and map key without scrolling through editorial content.

### Search a higher taxon

The visitor searches `Carnivora`, selects the rank/taxon suggestion, and sees every matching physical specimen represented in the mapped points and list. The summary distinguishes plotted and unplotted records. No duplicate “taxon display” rows are created.

### Search an exact specimen

The visitor searches `SPEC-0013` or opens `/map?specimen=SPEC-0013`. The exact marker/list row is selected, the individual popup opens, and the visitor can follow the exact specimen link. If the record is unmappable, the page explains why without inventing a point.

### Inspect a cluster

The visitor zooms or filters until points overlap, activates a cluster, and sees an anchored fixed-size popup. Every contained specimen appears exactly once with species name, ID, and right-aligned lateral thumbnail. The popup scrolls internally and never requires document scrolling to reveal the last row.

### Inspect uncertainty

The visitor activates an approximate point. Its uncertainty area appears automatically and the popup/list states that the location is approximate. The visitor enables `Show uncertainty areas` and sees all eligible areas; disabling it hides unselected areas while preserving the selected record explanation.

### Change basemap

The visitor opens the Base map selector, switches between Museum dark, Dark, Light, Standard, and Bright where configured, and retains the same search/filter/selection state. Attribution remains visible. No unsupported Satellite/Hybrid/Terrain option appears.

### Use the list instead of the map

The visitor opens the result list on mobile or uses it on desktop, selects a record, and follows an exact specimen link without needing to pan, zoom, or operate a WebGL canvas.

### Recover from failure

The visitor disables WebGL or simulates provider failure. The page retains the complete list, exact links, search/filter state, and a clear map-unavailable explanation.

## 19. Acceptance gate

Phase 5 map work is complete only when all of the following are true:

### Data and correctness

- GeoJSON is generated deterministically from the compiled published collection.
- Exact, approximate, and unknown coordinate semantics are correct and visibly distinct in text and UI.
- Unknown coordinates never become fabricated points.
- Positive uncertainty radii render as geographic areas; zero/missing uncertainty renders no area.
- Every plotted point and every cluster leaf has a stable exact specimen ID, canonical lateral media reference, and exact route.
- Filtered published records without coordinates remain visible in the `Not mapped` list group.
- Search/rank/taxon/specimen selection uses the same canonical records and URL semantics as the catalog.

### Layout and interaction

- The map is the immediate primary content and occupies most of the available viewport.
- Desktop shows map and result list together; mobile provides an intentional map-first result sheet/drawer.
- Search, filters, style, uncertainty, reset, list, popup, and attribution controls are discoverable and usable at 360 px and wider.
- Cluster popups are anchored, viewport-aware, internally scrollable, and never truncate their membership.
- Individual popups and list rows expose the required specimen facts and exact links.
- `/map?specimen={id}` focuses available records and recovers honestly for unavailable/unknown IDs.
- Map/list selection stays synchronized without unexpected document scrolling or focus loss.

### Accessibility and resilience

- Keyboard-only use reaches every record through the semantic list and operates search, filters, popups, styles, uncertainty, and reset.
- No-JavaScript output contains complete equivalent list access.
- No-WebGL and provider-failure states preserve the list and exact links.
- Reduced-motion, touch, narrow-height, landscape, effective 200% reflow, and forced-color states remain usable.
- Color is never the sole carrier of class, precision, selection, or cluster meaning.
- There are no horizontal-overflow, console-error, or uncaught map-lifecycle failures in the supported test matrix.

### Architecture and performance

- MapLibre is absent from non-map route bundles and does not load until the map route needs it.
- Normal builds do not call a live map API, geocoder, spreadsheet, database, or taxonomy service.
- Provider origins are narrowly represented in CSP/security configuration.
- The map projection and client payload are measured against the existing route/performance budgets.
- The map does not introduce uploads, cookies, analytics, tracking, or private/staging assets.

### Verification evidence

At minimum, run the repository’s pinned quality/build checks and targeted browser coverage for:

- 1440 × 900 desktop;
- a two-pane/medium-width layout;
- 1024 px and 768 px transition widths;
- 390 × 844 and 360 px mobile;
- mobile landscape and short viewport heights;
- keyboard-only search/list/popup journeys;
- exact and approximate markers;
- zero/missing uncertainty;
- dense clusters and same-coordinate specimens;
- every basemap style;
- deep links, reload, back, and forward;
- no JavaScript;
- no WebGL/provider failure;
- reduced motion and forced colors; and
- no MapLibre requests on non-map routes.

The implementation report must state what was built, the generated-record counts, all automated/manual verification results, visual checks at the above layouts, provider/style decisions, limitations, and the precise next action. Update `docs/implementation_plan.md`, `docs/architecture.md`, `docs/project_overview.md`, `docs/design_system.md`, and `docs/project_status.md` where the implemented map behavior changes their current truth. Keep the full supporting-page work deferred.

## 20. Suggested implementation order

This is an execution aid, not permission to expand the scope:

1. Confirm the canonical location projection and validation rules; add focused fixtures for exact, approximate, unknown, and invalid records.
2. Generate and test the deterministic map projection and the server-rendered list/fallback.
3. Add the route-only MapLibre/provider adapter and initial fit/reset behavior.
4. Add the compact responsive toolbar, search/filter state, and synchronized list.
5. Add individual markers, class/precision semantics, selection, and individual popups.
6. Add clustering and the complete anchored cluster popup.
7. Add geodesic uncertainty areas, the toggle, automatic selected approximate display, and the map key.
8. Add style switching, deep-link recovery, provider failure, no-WebGL, reduced-motion, keyboard, touch, and no-JavaScript behavior.
9. Complete visual/accessibility/performance verification, reconcile canonical docs, create one coherent verified checkpoint, and stop at the map acceptance gate.

## 21. External capability notes

The provider recommendation in this brief is based on the current official material checked on 2026-08-27:

- OpenFreeMap documents its public vector-map instance, no API-key/cookie baseline, required attribution, and current default styles in its [homepage](https://openfreemap.org/) and [Quick Start](https://openfreemap.org/quick_start/).
- The maintained [OpenFreeMap styles repository](https://github.com/hyperknot/openfreemap-styles) documents the Liberty, Bright, Positron, Dark, and Fiord style families and their style endpoints.
- MapLibre documents GeoJSON clustering and cluster-leaf retrieval in its [cluster example](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/) and [GeoJSONSource API](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/).

These links support the provider/library choice; they do not replace repository validation, legal/terms review, visual QA, or the project’s canonical source-of-truth rules.
