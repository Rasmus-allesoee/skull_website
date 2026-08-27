## Phase 3.1 — multi-species review expansion and bounded Phase 3 feedback

Phase 3.0 is implemented locally. Before modifying it, inspect the current worktree and create a separate committed checkpoint containing the Phase 3.0 implementation. Then implement this bounded Phase 3.1 refinement.

I have now reviewed the website after the phase 3 implementation. Overall, I approve of most of the added stuff. However, there still are some areas and weakpoints that can be improved. Let's call this phase 3.1.

Below is a structured feedback on the Phase 3.0 with suggested solutions to weakpoints and also new features to implement. Please read everything carefully. Be thorough and meticulous; don't be lazy. Then fix every problem and weakpoint, and take care of the new features I suggested. Remember to document everything in the documentation. Also read `agent_context/interactive_taxonomic_tree_plan.md` as the product direction for a future comprehensive Systematic browsing experience.

Do not begin Phase 4 yet.

### Multi-species review expansion

Reviewing the implementation with only one published species is difficult. I cannot properly judge how the following parts of the website work with real content:

- Browse by class;
- Systematic browsing;
- Published species displays;
- Taxonomy landing pages;
- Multiple species and specimens;
- Home-page collection statistics and pathways; and
- The overall visual density and balance of the museum.

The current Phase 3 implementation uses typed fixtures to verify birds, long names, uncertain taxa, missing media, and multiple specimens. That verifies the architecture, but it does not give me a realistic collection to explore visually.

I have already supplied cleaned image sets for the collection in `agent_context/skull_images_clean/`, together with matching partial metadata exports in `agent_context/metadata_csv/`. Most specimens already have the important practical information needed for a useful review, including species names, coordinates, measurements, and images.

The metadata and measurements are not completely finished. That should not automatically prevent useful pages from being created. Optional information such as age class, detailed preparation, and other observations can be added later using the canonical missing-data semantics. You may normalize known public-safe information where appropriate, but must not invent biological facts, measurements, or public claims.

Please inventory the available image sets and matching migration evidence, reconcile the actual number of species/specimens, and process all records that can be safely normalized for this review. Publish records that meet the current publication contract. Keep records with unresolved identity, taxonomy, rights, essential media, or other blocking issues as drafts or blocked, and report them clearly.

This is a review-quality multi-species expansion, not the final Phase 6 collection migration. Phase 6 will later perform the complete audited migration, including final stable-ID mapping, taxonomy review, rights/public-note review, complete media review, citations, and publication decisions.

### HOME

#### Purpose

The Home page should introduce visitors to the collection: what the website is, what it contains, and how they can explore it. It is the first page visitors see, so it should be appealing, clear, and easy to navigate.

It should provide a condensed overview of the website without becoming crowded or forcing visitors to scroll through many large sections before understanding the collection. It mostly does all of this nicely already from the phase 3.0 implementation - I just wanted to state this clearly as I hadn't specified it before.

#### Title, introduction, and featured image

Keep:
- The site title;
- A short welcome/introduction explaining what the website is;
- A prominent featured skull image, currently using the raccoon dog as the visual lead.

#### Collection overview and statistics

Show useful live information about the current collection, such as:
- Number of species;
- Number of physical specimens;
- Number of represented classes;
- Number of represented orders, families, genera, or other useful ranks.

The statistics should be accurate, visually concise, and derived from the actual published collection. It currently only shows Published taxon, Physical specimen, and Represented class.

#### Find a skull

Keep the prominent search/discovery entry near the top of the Home page. It should make it obvious how a visitor can find a particular animal or skull. I approve of the current version!

The Species page should also have a similarly prominent and elegant search entry near the top. Follow the current canonical phase boundaries for the underlying search behavior, but do not leave the Species page without a clear search pathway.

#### Browse by class

Firstly, the top of the raccoon dog inside the Mammalia class card has zero gap to the image border. Please don't cut/crop the image so close. Always leave at least a little gap on top and bottom. Please fix this and avoid this mistake for future specimens.

Secondly, as described in `agent_context/interactive_taxonomic_tree_plan.md`, we should also add a compact version if the interactive tree. The Home version should stop at useful broad ranks such as class, order, and family, without showing every genus and species. Each visible group should link into the corresponding location in the Species catalog.

#### Featured specimen section

Remove the separate Featured specimen section. It currently provides little additional value because the main hero image already introduces a specimen.

#### Geographic records

Keep the geographic-record preview. It provides an attractive visual gateway into the collection’s geographical dimension and should link toward the future dedicated map experience.

#### Behind the collection

Keep the Behind the collection preview. It provides useful context and encourages visitors to explore the future miscellaneous/editorial pages.

### SPECIES PAGE

#### Browse by class

Same comment as mentioned in the home page about the lacking image gap. Use the expanded real collection to confirm that the class section has no errors.

#### Search entry

Add a prominent, elegant search entry near the top of the Species page (above "browse by class"), visually consistent with the Home search entry. The visitor should immediately understand that the Species page is the main place to search and browse the collection.

#### Systematic browsing

The existing systematic browsing list is a useful foundation, but with many species (phase 3.0 only has one) it should become more visually engaging and easier to explore.

Keep the ordinary nested taxonomy/list representation available as a clear, accessible alternative. It must continue to use the same canonical records and stable routes as any future visual tree.

Read `agent_context/interactive_taxonomic_tree_plan.md` for the intended comprehensive interactive tree concept that should be implemented!

The full tree concept should be treated as a future dedicated feature unless a small, clearly bounded foundation is required for this Phase 3.1. Do not invent group identification characteristics or evolutionary divergence estimates. Those sections require reviewed sources and citations. You should update the docs with a new dedicated Phase X for implenting this full tree.

If updating the current docs is not enough to document the interactive taxonomic tree, then write a detailed markdown guide on the implementation of the new interative taxonomic tree that will assist you and help you remmeber later on.

#### Published displays

With multiple species, the species gallery (i.e. Scoped gallery and Published displays) should no longer present one enormous species card (currently raccoon dog) across the full page width.

Use a responsive card grid:

- Three columns at wide desktop widths where the content supports it;
- Fewer columns at narrower widths;
- A single comfortable column on small screens where necessary.

Each card should remain visually led by the lateral skull image and clearly show the relevant common name, scientific name, and available collection information without becoming table-dense.

The layout should work with:

- Mammals and birds;
- Short and long scientific names;
- Different image availability;
- Multiple specimens;
- Different measurement profiles; and
- Uncertain or qualified identifications.

The Published displays and Scoped gallery (classes, orders) should not just list all species in one large grid. It should have family subheaders that divides the grid into familiy groups for easier navigation. For the family Scoped galleries we can just show one large grid, as I think it may become too much to devide into genera due to my limited numbers of displays. See `skullindex_web_species_gallery.png` and `skullbase_web_species_gallery.png` for examples of how these two websites made their species catalog galleries.

##### Handling species with multiple specimens
For species with multiple specimens, clicking on the species card should open the default specimen page. However, there should also be a link/button that opens a COMPACT pop-up window showing a thumbnail gallery of the specimens for that species. Here the user can then click on the exact specimen they want to open the specimen tab for. The compact gallery should not take up the whole view of the page.

Since this is for specimens within one species, there's no reason to show the latin or common species name. Instead we should use the space to show the most important information to differentiate between the specimens: age, sex, length.

Alternatively, clicking on the button opens a new dedicated subpage showing the gallery for all specimens within that species. The downside is that we may start to make the website confusing with too many nested pages. Thus a simple quick pop-up window may be more elegant and simple.

### Checkpoint and report

Commit the current Phase 3.0 implementation before making Phase 3.1 changes. Then create a separate commit for the verified Phase 3.1 implementation and refinements.

Do not push or open/update a remote pull request unless separately authorized.

Stop at the Phase 3.1 review checkpoint and report:

- What was implemented;
- The actual number of species and specimens discovered;
- Which records are published, draft, or blocked;
- Migration decisions;
- Any unresolved content or publication decisions;
- Verification and visual/mobile results;
- Remaining blockers; and
- The exact next step, including anything I need to prepare before the next task.

### Architecture proposal publication decision:
INCLUDE agent_context/class_aware_dynamic_measurement_architecture.md

Keep agent_context/metadata_csv/, generated artifacts, test output, private data, and unrelated files out of the commit.
