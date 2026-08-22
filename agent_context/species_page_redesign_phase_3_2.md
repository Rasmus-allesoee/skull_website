# Species Catalog Redesign - Phase 3.2

**Status:** Owner-approved product and interaction specification for the next bounded catalog redesign

**Scope:** Information architecture, layout, responsive behavior, and interaction boundaries for `/species`

**Related input:** `agent_context/prompt_species_page_redesign_suggestions.md`

**Canonical implementation sources:** `docs/project_overview.md`, `docs/architecture.md`, `docs/design_system.md`, `docs/implementation_plan.md`, and `docs/project_status.md`

## 1. Purpose

The Species page is the collection catalog. Its primary job is to let visitors scan the collection visually, narrow it efficiently, and open the exact taxon or physical specimen they are interested in.

The current page has a strong museum atmosphere, but its information architecture is too editorial and vertically expansive for a working catalog. The title, discovery introduction, class cards, taxonomy foundation, taxonomy-list disclosure, and result gallery are presented as large consecutive sections. The visitor must scroll through several presentation layers before reaching the main collection surface: the lateral skull grid.

Phase 3.2 should restructure the page around this principle:

> The catalog controls stay close to the top and remain available while the visitor browses. The lateral-image grid is the primary page surface. Taxonomy, filters, sorting, and alternate browsing tools are compact controls or optional panels rather than full-height sections competing with the grid.

This is a substantial information-architecture and layout change, not a small spacing refinement.

## 2. Design philosophy

### 2.1 Catalog first, editorial second

The Species page is not a second Home page and is not a long introduction to the museum. It should be calm and visually distinctive, but it must behave like an efficient collection browser.

Keep the established visual language:

- dark natural-history museum palette;
- Newsreader display typography and IBM Plex Sans interface typography;
- restrained brass/green data accents;
- consistent lateral specimen photography on dark fields;
- deliberate borders, labels, and scientific naming;
- progressive disclosure for information that is useful but not always needed.

Change the spatial priority:

- reduce the title/introduction to a compact catalog heading;
- place the discovery controls immediately below it;
- move the result grid much higher on the page;
- put taxonomy in the closed-by-default drawer/sidebar and put filters/sorting details in compact popovers;
- avoid large stacked modules that repeat the same navigation purpose.

### 2.2 One catalog, several ways to query it

Search, class selection, taxonomy selection, feature filters, sorting, species/specimen mode, and the lateral grid are not seven unrelated browsing experiences. They are different controls and views over the same published catalog.

The page should communicate one simple mental model:

1. Choose what to look for or how to narrow the collection.
2. Inspect the matching lateral-image cards.
3. Open the taxon display or exact specimen display.

The taxonomy tree and static taxonomy list are orientation tools. They should support the main catalog rather than delay access to it.

### 2.3 Efficiency without database-like ugliness

Efficiency does not mean turning the page into a dense spreadsheet. Photography remains the main visual content. The goal is to put compact, well-labelled controls around the photography, not to expose every field at once.

Use popovers, drawers, segmented controls, chips, and collapsible panels for secondary choices. Keep labels explicit and accessible. Do not replace meaningful words with unexplained icons.

## 3. Goals

The redesigned page must:

- show the catalog grid near the top of the page;
- make the primary search/discovery control prominent and persistent while browsing;
- make class narrowing quick without using large class hero cards;
- provide one clear place for filters and sorting;
- support both species-level and physical-specimen result modes;
- allow taxonomy navigation without forcing a long sequence of rank pages;
- preserve the lateral-image-first visual experience;
- retain exact links to taxon and specimen pages;
- remain useful with JavaScript disabled through server-rendered links and cards;
- work at desktop, tablet, mobile portrait, mobile landscape, 200% zoom, keyboard-only, reduced-motion, and forced-colors conditions; and
- provide the actual interaction surface that Phase 4 search/facets will use, so the catalog does not need a second layout redesign later; and
- leave a clean extension point for the full interactive taxonomic tree.

## 4. Non-goals and boundaries

This specification defines the Species catalog redesign and should be implemented together with the Phase 4 catalog-discovery functionality as one user-facing milestone. The work may still be implemented through internal commits/checkpoints, but Codex should not stop after building a visually complete toolbar whose search, filters, sorting, and result modes are still fake or disconnected.

The combined catalog milestone does not authorize the following work:

- MapLibre or location browsing on the Species page;
- a runtime database, CMS, live spreadsheet, or client-side filesystem access;
- deletion of existing canonical taxonomy routes;
- invented taxon characteristics, divergence estimates, clades, or biological claims;
- a full canvas-only phylogenetic visualization;
- replacing the accessible taxonomy list with drag interaction;
- changing stable taxon/specimen IDs, slugs, or published URL semantics.

The combined catalog milestone includes the Phase 4 work needed to make the catalog control bar functional: multilingual search and suggestions, aliases, facets, numeric filters, sorting, species/specimen modes, active state, and URL-backed query state. It should reuse the existing canonical collection and query boundaries rather than inventing a second data model.

The redesign must still remain honest during incremental implementation. If Codex creates an internal layout checkpoint before the complete discovery behavior is finished, that checkpoint is for development only and must not be presented as the finished Phase 3.2 acceptance result.

The comprehensive interactive tree remains a separate feature boundary. This redesign must provide a natural place for it, but the primary catalog must remain useful if the tree is collapsed.

## 5. New page anatomy

The default `/species` page should have the following order.

```text
Site header
  Compact catalog heading
  Catalog control bar
    Search/discovery field
    Species/specimens mode
    Class presets
    Filters
    Sort
    Taxonomy panel control
    Result count and active state
  Taxonomy drawer/sidebar, closed by default and opened on request
  Published lateral-image results
    Family headings where appropriate
    Species or specimen cards
Site footer
```

The result grid must not be placed after several full-height sections. With the taxonomy drawer closed, a normal wide desktop viewport should show the compact heading, the primary controls, and the beginning of the first result row without requiring a long introductory scroll. The drawer's visibility is optional for the visitor; the drawer itself is a required part of the catalog design.

### 5.1 Compact catalog heading

Replace the current exhibition-sized `Species` introduction with a compact heading band.

It should contain:

- a small `Collection catalog` kicker;
- the `Species` page title;
- one concise sentence explaining that visitors can browse photographed taxa and physical specimens;
- the live published taxon/specimen count;
- an optional compact link or button for a short catalog help message.

The heading must not occupy most of the first viewport. Do not use the Home page's large editorial spacing here. The title should remain visually elegant, but its job is orientation, not spectacle.

Avoid repeating technical details that belong on individual specimen pages. The heading should not explain permanent URLs, every data field, or the complete taxonomy model.

### 5.2 Catalog control bar

The control bar is the operational center of the page. It should be a clearly bounded, visually coherent toolbar or control panel immediately below the compact heading.

At minimum, reserve space for these controls:

- a labelled name/specimen search field;
- a species/specimens result-mode control;
- a class control for Mammalia, Aves, and future represented classes;
- a `Filters` control for skull features and measurements;
- a `Sort` control;
- a `Taxonomy` or `Browse taxonomy` control;
- a result count;
- active-filter/taxonomic-scope state; and
- a clear/reset action whenever state is active.

The controls should not all be expanded into large blocks. The normal state should show the search field, mode, class presets, and compact action buttons. Filters, sorting details, and taxonomy should open as popovers, drawers, or panels.

Use visible text labels such as `Filters`, `Sort`, and `Browse taxonomy`. Icons may supplement these labels but must not replace them.

The control bar should become sticky after the page header has scrolled away. Use `position: sticky` or an equivalent accessible pattern rather than an always-fixed overlay that hides content. The sticky state must respect the site header, focus rings, browser zoom, and mobile safe areas.

### 5.3 Search/discovery field

The search field is the primary control because it can eventually locate a species, genus, higher taxon, Danish name, English name, scientific name, alias, or specimen ID.

The combined catalog milestone must implement the field as a real search/discovery control. A layout-only internal checkpoint may temporarily use an honest link or placeholder, but that checkpoint is not the finished acceptance result and must not be presented as the completed redesign.

The implemented field must use the following behavior:

- suggestions open in an accessible combobox/listbox-style surface;
- each result row has the English name on the left;
- the scientific/Latin name appears smaller below it;
- the Danish name appears in parentheses when there is room;
- a small lateral skull thumbnail appears on the right;
- rows expose the result type, such as taxon, rank, or specimen;
- selecting a species/taxon result narrows or opens the species-level catalog behavior defined below;
- selecting a specimen result opens the exact nested specimen page;
- selecting a higher rank offers a filtered catalog view and an explicit route link where appropriate;
- the search surface is keyboard navigable and touch friendly; and
- the current query and meaningful selection state can be represented in the URL.

Search thumbnails must use the same canonical lateral media declarations and subject-bounds treatment as catalog cards. Do not construct filenames in the client or use unreviewed staging images.

### 5.4 Species/specimens mode

Provide an explicit, labelled control that chooses between:

- `Species`: one row per published taxon, normally represented by its reviewed default specimen;
- `Specimens`: one row per published physical specimen.

The control may be a segmented radio group or another equivalent control. It must not be an unlabeled icon toggle.

In Species mode:

- each taxon appears once;
- the default lateral image represents the taxon display;
- the card shows the species/common name, scientific identification, and specimen count;
- a taxon with multiple specimens has an expand/chooser action;
- expanding the chooser reveals the other physical specimens without repeating the species name in every row; and
- each specimen option links to its exact stable specimen URL.

In Specimens mode:

- every physical specimen has its own result row/card;
- the immutable specimen ID is visible;
- the lateral image remains primary;
- relevant recorded measurements and concise metadata may be shown; and
- each result links directly to the exact nested specimen page.

The mode must change the visible result set, not merely change a label. The combined catalog milestone owns the query/state implementation, and the layout must reserve enough space for both modes.

### 5.5 Class presets

Keep class selection because Mammalia and Aves are meaningfully different collections. Do not repeat the current large two-card class section on the catalog page.

Use compact class presets near the control bar. A preset may include:

- class name;
- representative thumbnail or small visual cue;
- taxon/specimen count; and
- selected state.

The class control should look like a filter/preset row rather than a pair of promotional cards. The current large class cards may remain useful on Home and on focused class landing pages, but they should not delay the main `/species` grid.

Selecting a class should narrow the catalog to that class while keeping the visitor in the catalog workflow. The corresponding class landing remains available as an explicit route action.

### 5.6 Filters panel

Place skull-feature and measurement discovery inside one `Filters` panel. The panel should open from the control bar and close without losing the user's place in the grid.

The implemented filter panel may contain:

- class and taxonomic scope;
- sex;
- age class;
- condition;
- preparation or record-status filters when meaningful;
- skull maximum-length range;
- skull mass/weight range;
- other reviewed numeric or controlled fields added later; and
- clear-all/reset.

The filter panel must distinguish:

- a record that does not match;
- a record with an unknown value; and
- a field that is not applicable to that animal class.

Unknown values must never be treated as zero. Applying a measurement range should include only records with applicable recorded values, and the interface should explain why records disappear when that matters.

Applied filters should appear as removable chips or a compact summary in the sticky control bar. The visitor should not need to reopen the panel to understand the active catalog state.

### 5.7 Sort control

Provide a compact sort control near the result count. Initial choices should be clear and limited, for example:

- Common name;
- Scientific name;
- Skull length, when the selected mode supports it;
- Skull weight/mass, when the selected mode supports it.

Unknown numeric values must remain explicit and must not be silently converted to zero. The chosen sort and meaningful catalog state belong in the URL in the combined catalog milestone.

### 5.8 Taxonomy access: the chosen drawer/sidebar

Taxonomy should be available at all times without taking over the default page. The single chosen architecture is a taxonomy drawer/sidebar. Do not implement a second competing systematic-browsing panel below the control bar.

Provide one clear `Browse taxonomy` control. On wide screens it opens a collapsible sticky sidebar alongside the grid. On narrow screens the same control opens a labelled drawer or native dialog. The default closed state leaves the result grid wide and immediately visible.

Here, `optional` means that the panel is closed by default and only occupies space when the visitor requests it. It does not mean that Codex may choose whether to build it. The taxonomy access component is required; its open/closed state is optional.

On wide desktop, the open state should present a compact sticky sidebar alongside the grid. On mobile, the same component should become a drawer or native dialog. It is one responsive component with one source of truth, not separate desktop and mobile taxonomies.

The taxonomy surface should contain a vertically indented, collapsible hierarchy:

```text
Class
  Order
    Family
      Genus
        Published taxon
```

Requirements:

- use the same canonical published hierarchy as rank pages, breadcrumbs, cards, and future search;
- show counts where useful but do not make every count visually dominant;
- make the current class/taxonomic scope obvious;
- provide explicit expand/collapse controls with `aria-expanded`;
- let a selected node narrow the catalog grid;
- provide an explicit `Open taxonomy page` or equivalent action when the visitor wants group context;
- preserve exact rank/taxon URLs;
- keep the complete semantic nested-list structure as the underlying/fallback representation;
- omit drafts and blocked migration candidates; and
- never require dragging or pan/zoom merely to reach a taxon.

The taxonomy drawer/sidebar described here is a compact navigational hierarchy, not the comprehensive interactive taxonomic tree. It should initially expose the current canonical class -> order -> family -> genus -> published-taxon hierarchy as an indented, collapsible list. The later comprehensive tree may add richer visual branching, representative previews, pan/zoom, and sourced group content, but it must use the same hierarchy and must not replace the semantic list.

### 5.9 Systematic browsing and the future interactive tree

There is no second `Explore taxonomy` section in the default page flow. The taxonomy drawer/sidebar is the one catalog entry point for the compact hierarchy and its list equivalent. Do not render the current large class/order/family panels and the ordinary taxonomy list as two consecutive exposed sections.

The full interactive taxonomic tree is a separate later enhancement. It may eventually be opened from the taxonomy surface or from a clearly labelled secondary action, but it is not part of the default Phase 3.2/combined Phase 4 catalog layout. Neither the drawer nor the future tree should be required to reach the visual grid.

The semantic nested list is not another visual feature. It means that the taxonomy is represented as real nested HTML lists with labelled links/buttons, so keyboard users, screen readers, no-JavaScript visitors, and users who cannot operate pan/zoom can traverse every published node. A future SVG/canvas/tree-graphic layer may enhance that list, but it cannot be the only representation.

## 6. Results and lateral-image grid

The result grid is the main visual experience of `/species`.

### 6.1 Placement and density

The grid should begin immediately after the control bar in the default state. Optional taxonomy panels, filter panels, and help content must not be permanently inserted between the controls and the grid.

Retain the established responsive rhythm:

- three columns where a wide viewport and content support it;
- two columns at intermediate widths;
- one comfortable column on small screens.

The grid should have enough image area for visual comparison but should not use specimen-page-sized cards. The visitor should see several lateral skulls in one viewport or short scroll segment.

Do not make every card's metadata block as tall as its image. Show the information needed for recognition and selection first; keep secondary details compact or inside the specimen chooser.

### 6.2 Family grouping

Family headings may remain at broad catalog scopes because they help orient systematic browsing. They must be compact and must not introduce excessive whitespace between groups.

- All-species and class/order scopes may group cards by family.
- Family/genus scopes should keep a single unsegmented result grid when further headings would create sparse sections.
- The active filter/scope should be obvious above the grid.
- A family heading should not force the visitor to open a separate family page just to see the matching cards.

The family grouping is the default browse presentation, not a rule that applies to every result state. When the visitor activates any explicit global sort, especially skull length or skull weight, flatten all matching cards into one globally ordered grid and remove the family headings. The result header should state the active global sort, for example `Sorted across all results by maximum length`.

Resetting the explicit global sort returns to the normal family-grouped browse presentation when the current scope supports family grouping. Search and filter results must not be trapped inside independently sorted family sections when the visitor has requested a global order.

Measurement sorting is most meaningful in Specimens mode, where every physical skull is an individual result. In Species mode, do not silently choose one hidden specimen or invent an aggregate ordering. Keep name-based sorting available in Species mode; enable individual length/mass sorting in Specimens mode. Measurement filters may still be used in Species mode, with the taxon card reporting how many specimens matched and the relevant range.

### 6.3 Species card (the default)

Species mode cards should prioritize:

1. lateral image;
2. English/common name;
3. scientific identification;
4. Danish name when available and useful;
5. taxonomic class/family context in a compact label;
6. specimen count; and
7. uncertainty/confidence when it is not confirmed/high.

The complete card or a clearly labelled primary link opens the taxon's canonical default display. The card must not make the visitor decipher whether it represents a species or a physical skull.

For multi-specimen taxa, keep the compact specimen chooser as a secondary action. It should expose thumbnail, immutable specimen ID/default state, age, sex, and maximum length, with exact nested links and correct focus restoration. Just like the current version - no change needed!

### 6.4 Specimen card

Specimen mode cards should prioritize:

1. lateral image;
2. English/common name and scientific identification;
3. immutable specimen ID;
4. maximum length and prepared mass when recorded;
5. concise location/date summary when public and useful; and
6. explicit missing-data wording when a displayed field is unavailable.

Each card opens the exact specimen URL. Do not make specimen cards table-dense.

### 6.5 Missing and empty states

The page must distinguish:

- no published records at all;
- no records matching the current search/filter state;
- a record without a lateral image; and
- a taxon with optional views missing.

No-result states must offer recovery actions such as clearing filters, changing mode, or returning to all published displays. They must not create fake cards or generic broken-image styling.

## 7. Selection and routing behavior

The catalog should become more efficient without destroying the existing canonical route architecture.

### 7.1 Taxonomic selection

When a visitor selects a class, order, family, or genus from the catalog control surface, the catalog's primary behavior is to narrow the visible grid to that scope. The visitor should not be forced through a separate page and then required to scroll to find the same filtered cards.

The interaction must make the two outcomes explicit rather than guessing from one ambiguous click:

- `Filter catalog` applies the selected rank as the current catalog scope and keeps the visitor on `/species`.
- `Open family page`, `Open order page`, or the equivalent rank-specific action opens the canonical higher-rank route.

The corresponding rank page remains useful even when its current visible content overlaps with a filtered catalog. It provides a stable, shareable, indexable URL; a canonical breadcrumb and parent/child context; a destination for future reviewed group-specific prose, characteristics, citations, and editorial material; a no-JavaScript route; and a predictable landing page for external links and search engines. It is a secondary information/context destination, not a mandatory step in the main browsing workflow.

Do not remove the existing higher-rank routes merely because the first version mostly shows the same scoped gallery. Make the catalog filter the fast path and the rank page the explicit context path. If a future content audit establishes that a rank page has no distinct value, that can be considered as a separate route/SEO decision rather than being silently changed during this layout work.

### 7.2 Species selection

Selecting a species/taxon result or species card opens the canonical taxon page with its reviewed default specimen. This is the correct transition from collection browsing to the detailed exhibit.

### 7.3 Specimen selection

Selecting a specimen result or specimen chooser option opens the exact nested specimen page. Stable specimen IDs and URLs must never be regenerated.

### 7.4 Browser history and URLs

The combined catalog milestone owns URL-backed search state. Meaningful state should be restorable through reload and browser back/forward, including:

- query;
- species/specimens mode;
- taxonomic scope;
- class;
- filters;
- sorting; and
- any state that changes the visible result set.

Transient UI state, such as whether a drawer is open, should not be serialized unless it produces a genuinely useful shareable state.

## 8. Responsive behavior

### 8.1 Wide desktop

- Keep the site header compact.
- Show the catalog heading and control bar as a short top region.
- Keep the control bar sticky below the header after scroll.
- Use a three-column lateral-image grid where space permits.
- Open the taxonomy as a collapsible sticky sidebar only when requested.
- Do not permanently sacrifice a grid column to a closed taxonomy panel.
- Keep active filters and result count visible in the sticky region.

### 8.2 Tablet and narrow desktop

- Let the control bar wrap into two compact rows without creating a large hero section.
- Keep search prominent.
- Move filters and taxonomy into full-width popovers/drawers when the available width becomes constrained.
- Use two result columns where cards remain visually useful.

### 8.3 Mobile portrait

- Use a compact heading with no oversized title spacing.
- Keep the search field full width.
- Use a horizontally scrollable or wrapping class-preset row only if it remains keyboard and touch accessible.
- Put `Filters`, `Sort`, `Taxonomy`, and result mode into clearly labelled controls.
- Use a one-column image grid with compact but readable cards.
- Use a drawer or native dialog for taxonomy rather than a permanently visible sidebar.
- Keep the sticky control region short enough that it does not cover most of the first card.
- Preserve browser page scroll and focus visibility.

### 8.4 Mobile landscape and zoom

- Do not assume the visitor has a tall viewport.
- Avoid fixed overlays that obscure result cards at 200% zoom.
- Allow controls to wrap or open panels rather than forcing horizontal page overflow.
- Test touch targets, keyboard focus, text resizing, reduced motion, and forced colors.

## 9. Accessibility and progressive enhancement

The catalog must remain a semantic collection even when enhanced interaction is unavailable.

- Server-render the heading, result count, taxonomy fallback, and published result links.
- Use semantic lists for taxonomy and results where appropriate.
- Use buttons for opening panels and links for navigation.
- Use labelled fieldsets for mode, filters, and sorting.
- Expose current scope, selected mode, expanded taxonomy branches, and result count to assistive technology.
- Keep focus inside a modal/drawer when appropriate and return focus to the opening control.
- Ensure Escape closes transient panels where expected.
- Do not make hover the only way to discover a control.
- Keep keyboard navigation independent of drag/pan behavior.
- Preserve visible focus at all responsive widths and zoom levels.
- Provide a no-JavaScript path to published taxon/specimen pages and the ordinary taxonomy list.
- Do not use false loading skeletons for static catalog content.

## 10. Performance and architecture

Preserve the existing architecture boundaries:

- canonical CSV/MDX/media declarations remain the source of truth;
- catalog view models continue to come from `src/domain/catalog/queries.ts`;
- page code consumes typed records and `MediaAsset` interfaces;
- normal builds remain static and network-independent;
- the result grid remains server-rendered;
- client islands are limited to search, filters, mode/sort controls, taxonomy branch state, and future tree behavior;
- search index code/data is lazy-loaded only when Phase 4 needs it;
- future tree code is isolated from the initial catalog bundle where practical; and
- staging images, generated output, raw spreadsheets, and private notes never become runtime inputs.

Do not introduce a second taxonomy model for the sidebar or future tree. The visual taxonomy surface, ordinary list, rank pages, breadcrumbs, search results, and catalog scopes must all derive from the same canonical published hierarchy.

## 11. Phase 4 search result details

The redesign must leave room for the following Phase 4 behavior.

### 11.1 Search row layout

Each suggestion/result row should contain:

- left side: English species/common name;
- below it: smaller scientific/Latin name;
- Danish name in parentheses when space permits;
- right side: small lateral skull thumbnail;
- result-type/state information where necessary; and
- an obvious selected/focused state.

Rows should visually relate to the existing `Compare with...` search control while remaining appropriate for taxon, rank, and specimen results.

### 11.2 Species mode search results

Species mode returns one row per unique species/taxon. A taxon with multiple physical specimens gets an explicit expand button. Expanding reveals the additional specimen rows below the species result, with exact specimen IDs and links. The species name should not be redundantly repeated in every expanded row unless required for clarity or assistive technology.

### 11.3 Specimen mode search results

Specimen mode returns one unique row per physical specimen. Each row must clearly expose the specimen ID and link to the exact nested specimen page.

### 11.4 Search accessibility

The suggestion surface must support keyboard navigation, touch selection, screen-reader result announcements, Escape to close, focus restoration, and a clear no-result/recovery state. Thumbnail imagery is supplementary; names and result types must remain fully usable if images fail.

## 12. Visual decisions to retain and change

### Retain

- dark natural-history museum visual direction;
- display/sans type hierarchy;
- lateral skull photography as the dominant card content;
- family grouping at broad catalog scopes;
- three/two/one-column responsive grid;
- explicit scientific-name formatting and identification uncertainty;
- compact multi-specimen chooser;
- canonical rank and specimen links;
- semantic taxonomy fallback;
- WCAG 2.2 AA and no-JavaScript core behavior.

### Change

- replace the oversized page intro with a compact catalog heading;
- replace the large fake discovery section with a compact operational control bar;
- replace large class cards on `/species` with small class presets;
- remove the large exposed tree section from the default flow;
- keep taxonomy in the closed-by-default drawer/sidebar;
- put the result grid directly after the control bar;
- keep secondary fields in filters or specimen chooser surfaces;
- make catalog scope selection filter the grid by default rather than forcing rank-page navigation;
- keep rank pages as explicit secondary destinations, not mandatory browsing steps.

## 13. Acceptance criteria for the redesign

The Phase 3.2 redesign is ready for owner review when:

- the default `/species` view presents a compact heading and operational control bar before the result grid;
- the first result row begins within the first normal wide desktop viewport or a short, clearly justified scroll distance;
- no large introductory, class, tree, and list sections appear consecutively before the grid;
- the grid is visibly the primary content of the page;
- class selection is compact and clearly behaves as a catalog scope/preset;
- taxonomy is available through one coherent drawer/sidebar/disclosure rather than multiple overlapping exposed sections;
- the ordinary taxonomy list remains a complete semantic fallback;
- species and specimen card modes have distinct, understandable purposes;
- multi-specimen taxa retain exact specimen links and a compact chooser;
- the layout works with long names, genus-level records, missing optional views, multiple specimens, and no-result states;
- the page does not introduce horizontal overflow at mobile widths or 200% zoom;
- focus, keyboard, Escape, touch targets, reduced motion, forced colors, and screen-reader semantics are verified;
- no search control falsely suggests functionality that has not been implemented;
- no canonical IDs, slugs, routes, rights, media declarations, or data-source boundaries are changed;
- the implemented search, facets, sorting, result modes, and URL state are integrated into the new layout rather than deferred to a second redesign; and
- the owner can visually review the collection grid without scrolling through the current stacked presentation sections.

## 14. Recommended implementation sequence

1. Read this specification and the canonical `docs/` sources before editing.
2. Audit the existing `/species` route, catalog components, styles, queries, tests, and current Phase 3.1 behavior.
3. Implement the compact page shell/control-bar/result-grid information architecture while preserving the existing records and routes.
4. Implement the functional Phase 4 search, suggestions, filters, sorting, species/specimen modes, active state, and URL-backed query state inside that layout.
5. Move class selection and the single chosen taxonomy drawer/sidebar into compact controls without inventing new taxonomy data.
6. Retain a complete no-JavaScript/server-rendered result and semantic taxonomy path.
7. Verify desktop, tablet, mobile portrait, mobile landscape, keyboard, 200% zoom, reduced motion, forced colors, long/missing/multi-specimen states, global sorting, and browser history/reload state.
8. Stop at the combined catalog redesign/search acceptance gate and report visual checks, structural decisions, tests, and remaining issues.
9. Do not begin the full interactive tree, MapLibre, or unrelated later-phase work unless explicitly authorized as a separate bounded task.

The result should feel like a fast visual collection browser with a museum identity, not a long editorial landing page that happens to contain a catalog at the bottom.
