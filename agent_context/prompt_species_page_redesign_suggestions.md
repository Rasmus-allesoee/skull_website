# prompt
## Design needs a major restructure:
Codex has now implemented phase 3.1. Honestly, I don't like the whole design structure/system of the Species page (collection catalog). It focuses too much on being aesthetically pleasing which comes at the expense of functionality and efficiency.

Like when opening the species catalog page, it's not efficient that the title and small info below takes up the whole chrome window when viewed at 100% on desktop. The same for the search bar (Find a skull). Ideally, most of the functionality should be imediately accessible without having to scroll down a bunch just to get to the functional stuff.

Look at websites like spotify. The user doesn't have to scroll at all to access 90% of al functionality. They utilize sidebars and buttons (menu, dropdown, popover etc.) to keep all features in one view.

We should make the species catalog page much more lean and functional! We need to remember that the main purpose of the page is to provide a visual overview of all the skulls in the catalog through lateral image thumbnails, instead of letting the user only view one skull at a time in the specimen pages.

### Too many exposed browsing options on page:
We currently have quite a lot of different browsing options. This is fine, but we should avoid having too many that overlap in their purpose/functionality, and they should not all be fully exposed on the page as this makes the page crowded and confuses the user on what to do.

We currently have, or at least intent to have:

	1. Browse by searching (this is by far the most important as it can do everything)
	2. Browse by class (this allows to quickly narrow the catalog down, as these two class of skulls are widely different).
	3. Browse by interactive taxonomic tree (this allows the user to navigate the skulls based on evolutionary relatedness, which is a powerful extra feature).
	4. Browse by static taxonomic list (the ordinary taxonomy list, allows the user to quickly see all major taxa in a compact, nested list)
	5. Browse by species lateral image thumbnail cards (this is one of the most import ones, as this is the only place that visually shows all skulls in one place, allowing the user to scroll through and select based on visuals)
	6. Browse by location (this is not really a feature intented for browsing, but it technically still is a way to access the specimens).
	7. Browse by skull feature (age, sex, condition, measurements. This is a feature we have to implement, but should allow the user to filter the skulls (emphasis on the visual grid) based on skull features as opposed to just taxonomy like all the other browsing options are based on).

Be aware that I think the current species catalog page shows a placeholder for the interactive taxonomic under the section "Systematic browsing (Explore the collection hierarchy)". At least I think this is a placeholder since I never asked for these two class boxes with order and families. In their current state they are kinda redundant to the horribly structured (non-nested, taking up way too much space) "ordinary taxonomy list". When it becomes the full taxonomic tree, it no longer is redundant.

### The most simple design:
If fully optimizing for functionality, the specimen page would only need a search bar and the visual skull grid. If the user search and selects a higher taxon group, the visual grid then becomes filtered to only show skulls within that group. The search bar is fixed to the top, so that when scrolling through the visual grid, the user can quickly search for a different taxon if needed. If the user search and selects a species/specimen, then this directly opens the default or specific specimen page.

In the search bar section, the user can always apply filters to only see skulls based on specific features/measurements. And the user should be able to sort the visual grid based on skull measurements like length and weight.

This design keeps all the core functionality in one place and optimizes for exactly the main purpose of the Specimen catalog page: to see all skulls in one place and select the specific skull of interest to enter the specific specimen page with all the details.

### Balanced design:
All other browsing options are thus just extra features. This doesn't mean they don't deserve to be included, as they can help the user navigate the skull collection in unique ways. But they should be either collapsed by default if taking up much space or made rather small to give full focus on the main search bar and visual grid.

We could add a sidebar that can be hidden/unhidden and shows a vertically indented, collapsible hierarchical list of taxonomic ranks down to genera or species. This list will then move along when the user scrolls, allowing them to now have to scroll all the way up to select a different taxonomic group – they can just open the sidebar. The current ordinary taxonomy list becomes the compact, nested list in the sidebar.

Below the search bar we will then have the "Browse by class". We keep this because most users are likely interested in only one of these. Clicking on a specific class will quickly thin down the skulls of interest, and these taxonomic class subpages (mammalia and aves) will also have less crowded and more focused taxonomic trees, lists and visual grids.

The comprehensive interactive taxonomic tree which should be below the "Browse by class", but it should be collapsed by default to not move the main visual grid too much down.

The key thing of this new balanced design is that we heavily reduce the number of nested taxonomic rank subpages, because all these subpages males the process of navigating the catalog slow, repetitive and confusing. It's not optimal to open a subpage for a lower rank like order, family, genus, and then have to scroll down the page to finally see the now filtered visual grid.

The main thing we are loosing is that we no longer have a specific taxon group page where we can add information about that group, but I think this is worth the increased efficiency and ease of use!

## TO DO:
Please share your opinion on the current design based on the attached website screenshot and the repo code, and if my design concerns are valid. Evaluate my suggested ideas for a new optimized design. Should we ask codex to do a major design overhaul, focusing on functionality and efficiency? Or should I keep it as is and move on to the next phases?


# GPT answer
Your concerns are valid. I recommend a major `/species` catalog restructure before Phase 4. Do not build search and facets into the current layout.

The screenshot and code show that the page currently prioritizes editorial presentation over catalog efficiency:

- The large page introduction uses very generous vertical padding.
- The discovery section is visually prominent but currently only a placeholder.
- The class cards are large, standalone sections.
- The class/order/family tree occupies another large section.
- The taxonomy list appears afterward.
- Only then does the actual visual species grid begin.

This directly conflicts with the catalog’s main purpose: quickly scanning skull images and narrowing the collection. The CSS confirms the spacing is intentional: `--section-space` reaches 5–10rem, the page intro reaches 9rem of padding, and class cards have an 18rem minimum height. See [species/page.tsx](</Users/rasmusallesoeenielsen/Documents/skull_website/src/app/species/page.tsx>) and [globals.css](</Users/rasmusallesoeenielsen/Documents/skull_website/src/app/globals.css>).

Your categorization is also correct, with one refinement:

- Search, filters, sorting, and result modes should be the primary catalog interface.
- The visual skull grid is the main result surface, not a separate browsing mode.
- Class selection should be a compact preset/filter, not a large section.
- The interactive tree and ordinary taxonomy list are alternative taxonomy-navigation tools; they should not both occupy major space.
- Location belongs primarily to the Map page.
- Age, sex, condition, and measurements belong inside the filter system.

The best layout is therefore:

1. A compact catalog heading with count.
2. A sticky catalog toolbar containing search, species/specimen mode, class shortcuts, filters, sorting, and taxonomy access.
3. The visual lateral-image grid immediately below.
4. A collapsible taxonomy drawer or sticky desktop sidebar.
5. The ordinary nested taxonomy list as the accessible fallback/equivalent.
6. Taxon pages retained as direct, canonical pages—but no longer forced as navigation steps for every lower taxonomic rank.

I would make the taxonomy sidebar collapsible on desktop and a drawer on mobile. A permanently visible sidebar could unnecessarily reduce the image grid width.

Do not delete the existing taxonomy routes. They remain useful for direct links, SEO, breadcrumbs, and group information. The improvement is to make them secondary rather than forcing visitors through `class → order → family → genus` pages before reaching the images.

The comprehensive interactive tree should be treated as an optional advanced feature after the core catalog/search interface works. It should not determine the primary page layout.

Recommended sequence:

- First: a bounded Species catalog information-architecture/layout redesign.
- Then: Phase 4 search, facets, sorting, and URL-backed state inside that new layout.
- Later: the full interactive taxonomy tree.

So yes: ask Codex for a substantial Species-page redesign now, while preserving the current visual language, data model, canonical routes, and accessibility requirements. The current implementation is a valid Phase 3.1 foundation, but it should not become the foundation for the final catalog workflow.