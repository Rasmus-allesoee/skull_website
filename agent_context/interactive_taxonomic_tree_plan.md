# Interactive taxonomic tree — product concept

**Status:** Owner-requested concept for a future Systematic browsing experience

**Primary location:** The Species catalog page

**Related location:** A compact, simplified version may appear on Home as a gateway into the Species catalog

**Reference sketch:** `agent_context/interactive_tree_sketch.png`

## 1. Purpose

Systematic browsing should let visitors understand the structure of the collection while moving naturally from broad taxonomic groups to individual species and specimens.

The experience should feel like an interactive museum display rather than a technical database diagram. It should answer two questions at once:

1. Where does this species sit among the other animals in the collection?
2. What can I explore next from this group?

The tree is an additional discovery mode. It must not replace search, ordinary taxonomy links, or the accessible nested list. Visitors should be able to use the feature even if they do not understand formal taxonomy.

## 2. Where it appears

### Species catalog

The full interactive tree belongs in the `Systematic browsing` area of the Species page. It should show the available collection from the highest useful shared group down to the published species.

The existing systematic list should remain available as a clear list/tree alternative. The tree and the list must represent the same canonical records and lead to the same URLs.

### Home

Home may contain a compact version as a visual gateway. The Home version should stop at useful broad ranks such as class, order, and family, without showing every genus and species. Each visible group should link into the corresponding location in the Species catalog.

Home must remain a concise introduction to the collection. The compact tree must not make the first page crowded or force visitors to understand a large diagram before they can explore.

## 3. Tree content and hierarchy

The full tree should support, when represented by the collection:

- the collection root or shared biological root;
- class;
- order;
- family;
- genus; and
- species or other published terminal taxon ranks supported by the canonical model.

The initial structure must come from the canonical taxonomic relationships in the repository. Higher clades such as Amniota, Synapsida, Laurasiatheria, or Sauropsida may be shown only when they have an explicit reviewed source and a deliberate place in the data model. They must not be inferred merely because the diagram looks biologically plausible.

The tree should make parent/child relationships visually obvious. A group node represents a taxon; it is not a separate specimen record. Terminal species nodes should clearly distinguish the species name from its higher-rank parents.

The tree may support expanding and collapsing branches so that a visitor can focus on one part of the collection. The complete collection should remain discoverable, and the current branch/context should be clear after navigation.

## 4. Node presentation

Every useful group node may show:

- the taxon name;
- its rank where that is not obvious;
- a small lateral skull thumbnail representing the group; and
- an indication of how much collection content lies below it.

For a group such as Canidae, the thumbnail should be a typical representative from that group when an appropriate reviewed specimen exists. The fox example in the sketch describes the intended curatorial effect: the image should help visitors recognize the group visually, not merely decorate the node.

Representative selection should be deterministic and reviewable. A suitable published descendant specimen may be used as a fallback, but a curator-approved representative should be possible later. Missing images must produce a quiet labelled placeholder, never a broken-image impression.

The tree should use the current dark natural-history museum design language: strong bone-coloured typography, restrained lines and dividers, dark surfaces, and calm accent colours. Clade or class distinctions may use subtle colour differences, but colour must never be the only way to communicate hierarchy or state.

## 5. Navigation behavior

The node's taxon label or primary link should open the corresponding taxonomic page. Examples include:

- a class node opening the class landing page;
- a family node opening its family landing page; and
- a species node opening the canonical species page.

The thumbnail should have a distinct, discoverable preview action. Opening a preview must not make it ambiguous whether the visitor is navigating away or inspecting the group in place.

The preview must include a clear route link such as `View {taxon}` or `Open taxon page`.

## 6. Group preview panel

Selecting a group's thumbnail opens a focused information panel or dialog styled as part of the museum interface.

The panel should contain:

### A. Lateral image carousel

- An enlarged lateral skull image.
- A card label with the species' common name, scientific name, and enough context to identify the record.
- Previous and next controls.
- Swipe support on touch devices.
- Left/right keyboard controls when the carousel is focused.
- A visible position indicator such as `2 of 6`.
- A link to the selected species page.

The carousel contains the published species represented below that group, not arbitrary images from unrelated records. Where a species has multiple specimens, use the canonical/default specimen for the group preview unless a different representative has been explicitly selected.

The carousel should preserve complete anatomy and use the validated lateral media contract. It should not imply that ordinary group-preview images share a physical scale.

### B. Shared identification characteristics

Show a concise group-level explanation of useful skull-identification characteristics shared by, or commonly useful for distinguishing, the group.

This content must be curated and cited. It must not be automatically invented from the taxon name, generated from a generic template, or presented as universally true when variation matters.

If useful reviewed content does not exist, omit the section or show an honest unavailable state. Do not fill it with low-value placeholder prose.

### C. Divergence information

Show when the group is estimated to have diverged from the relevant sister branch only when a suitable authoritative source exists.

The display must:

- use an estimate or range rather than implying a falsely exact year;
- label the result as an evolutionary divergence estimate;
- show uncertainty or approximation clearly;
- identify or link the source; and
- distinguish a phylogenetic estimate from the taxonomic rank itself.

If no reviewed estimate exists, omit the section or state that it is not yet available. A taxonomy provider or a branch drawn in the interface is not, by itself, evidence for a divergence date.

### D. Descendant counts

Show counts of lower published taxa represented in this collection. Depending on the selected rank, useful rows may include:

- orders;
- families;
- genera;
- species; and
- specimens where that count helps the visitor understand the collection.

These must be labelled as collection counts, for example `Species in this collection`, not as the total number of species in nature. Empty ranks should be omitted rather than shown as misleading zeroes.

## 7. Interaction and responsive behavior

The tree should support:

- pointer and touch panning where the layout is larger than the viewport;
- zoom controls or an equally understandable way to inspect a dense branch;
- branch expansion/collapse where useful;
- a reset or return-to-overview action;
- focused keyboard navigation;
- visible focus and selected states;
- Escape and an explicit close control for the preview panel; and
- reliable focus restoration after the panel closes.

On narrow screens, the tree may become a horizontally scrollable/pannable display or use a deliberately simplified layout. It must not become a tiny unreadable poster. The list/tree alternative remains available and should be the primary semantic fallback. Could prompt the user to turn their phone in landscape mode to better view the tree.

The feature must work without hover, must not depend on colour alone, and must support reduced motion. Touch gestures must not accidentally trigger page navigation or open the wrong node.

## 8. Data and editorial requirements

The tree consumes published canonical taxon/specimen records only. Draft and blocked records remain excluded from public tree nodes, counts, thumbnails, and carousels.

The feature needs the following kinds of data:

- stable taxon identity and route;
- reviewed parent/child relationships;
- publication state;
- a published/default specimen relationship where a representative image is shown;
- validated lateral media;
- collection-derived descendant counts;
- optional reviewed group-characteristics content; and
- optional reviewed divergence estimates with sources and uncertainty.

The tree should not create a second taxonomy model. It should use the same compiled records, route helpers, media declarations, and publication filters as the rest of the site.

## 9. Scope sequence

The desired end state is the complete experience described above, but it should be delivered in sensible content-dependent steps:

1. Make the expanded real collection produce correct canonical hierarchy, counts, route links, and representative lateral media.
2. Build the interactive taxonomy-tree view with the accessible list alternative, navigation, thumbnails, collection counts, and group image carousel.
3. Add curated/cited identification characteristics when useful content exists.
4. Add sourced divergence estimates when the data model and references support them.

The tree feature should not delay the multi-species content expansion, and the content expansion should not require inventing the educational sections before they are properly sourced.

## 10. Acceptance criteria

The finished feature should satisfy all of the following:

- Visitors can move from the tree to class, order, family, genus, and species pages through real stable links.
- The tree and nested list expose the same published canonical records.
- Group thumbnails and carousel cards use real validated lateral images or honest placeholders.
- A group preview can be opened, navigated with mouse/touch/keyboard, closed, and revisited without losing context.
- Counts are deterministic and explicitly describe the collection rather than total natural diversity.
- Shared identification text and divergence information are absent, approximate, or cited according to their evidence state.
- The tree remains understandable and usable on desktop and mobile, including keyboard and reduced-motion use.
- No draft, private, unsupported, or unreviewed content appears publicly.
- The existing search, list browsing, taxonomy pages, and specimen routes remain useful if the tree is disabled or unavailable.
