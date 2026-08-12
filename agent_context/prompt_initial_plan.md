## BACKGROUND
I want to expand my skills in programming and the skills of utilizing coding agents and AI tools much more effectively and to their maximum capabilities. I think that knowing how to use AI effectivily is widely underregarded and one of the most powerful things to learn – most people are quickly falling behind!

I will soon be out in the job market, so I want to master how to create and actively maintain a Github repo. The best way to learn is by doing a project that one is genuinely interested in. Therefore, I want to make a techincal, feature-rich, and visually pleasing Animal Skull Website, first based on my own collected skulls, including their measurements and metadata.

I collect dead animals (mainly road kills and each wash-ups), whereafter I macerate, degrease, and whiten the skulls all myself. I measure various parts of the skulls, mandibles, and teeth, and  note this down in a sheet file.

I also take high quality photographs of each skull from specific angles: lateral, dorsal, ventral, frontal, lateral-frontal, and dorsal of mandibles. I try to make the angles almost identical for all skulls. The photographs are high quality: taken with a DSLR and speedlite with nicely diffused lighting on a black background and surface. Most images are also photostacked to get the whole skull in focus. I'm also in the process of using photoshop to remove the background of all images, so that I end up with a collection of clean skull images. Such clean images maximizes the design flexibilities on how the skulls can be shown.

## TODO
As you can see, I already have a rough plan for the structure of the website. But I have no idea/plan on the technical aspects (framework, image handling, search architecture, deployment, etc), and my rough design plan is still far from complete. Let's begin to plan out the website in plan mode! Think long and extensively, and be thorough and meticulous.

After we've developed and refined the overall plan in planning mode, I will switch to normal mode where you will create all the markdown planning files for the implementation and development of the website.

The implementation .md plan should break it down into optimized, actionable phases, so that you and other AI agents can build the website in logical and managable steps. We should also have a markdown file that describes the whole website structure, including all the pages, their design, features, and so on – this is the description of what we try to make.

These .md files could for example be (these are just examples, you know and decide exactly what .md files are needed to map out the project and optimize implementation):
* implementation_plan.md
* architecture.md
* project_status.md or project_log.md
* project_overview.md
* design_system.md
* content_data_model.md

## Repository structure:
Make sure to build a professionally, structured, organized, and well-documented repository for the website. This helps both you and other AI agents keep track of things and not getting lost. We should create a GitHub repository (skull_website) that we actively commit and push to, so that we keep track of all changes.

## SKULL IMAGES:
My images are currently in .af format, so need to save them as .png files. I have uploaded a set of cleaned images for a single species, just so you can see examples of what they look like. See `agent_context/skull_images_clean`.

## SKULL META DATA:
`agent_context/skulls_meta.csv`: incomplete .csv file of all the metadata i've measured so far on some of my skulls. I'm in the process of adding more metadata for all my remaining skulls so we get complete metadata. I will also make sure to add an ID to the cleaned images matching the specific skull row (because I have multiple skulls from the same species).

## Website Inspiration:
There seems to be only 3 major skull database-like websites currently. Please investigate those websites extensively for inspiration. They are all very different in their design and ease of use. Our website should of course be much better than them.

* https://www.skull-index.com/species: visually pleasing but the structured indexed list of all orders and families is a bit messy. Very high quality images similar to mine on black background.
* https://www.skullbase.info/: very simple design, but super fast and lightweight. Very easy and to navigate. Very systematic and consistent theme. Really enjoyable to visit. 360 degree view images is an insanely good feature that I may have to do myself!
* https://skullsite.com/: worst of the three website. Bad navigation system. Messy overall.

## Main pages:
    1. HOME
    2. SPECIES
    3. MAP
    4. CONTRIBUTION
    5. ABOUT ME
    6. OTHER STUFF (this page could include subpages like "HOW TO PREPARE SKULLS").

These pages are just my initial ideas. We will most likely come up with new ideas and features in the future.

### HOW TO PREPARE SKULLS:
Guide on how to go from a road kill to a finished skull. So it should include sections like: defleshing (boiling/simmering or macerating or beetles), degreasing (soap/acetone/ammonia), whitening (hydrogenperoxide). We will write this later but we need a page for this.

### SPECIES:
#### Finding species – Taxonomic grouping of skulls:
This is the main page where the user can find and navigate through all the species in a structured manner.

We should create a highly structured grouping of skulls based on taxonomy. User can select one of the major classes (e.g. mammals, reptiles, birds). This opens up a structured indexed list of all orders and families. User can then click on a family, which moves the user down to a structured grid-like gallery for all species within that taxonomic rank. There will be a single lateral-view image per skull and the latin + english species name. The user can then click on that species, which opens up the specific species page where we have all the detailed images, information, and other features.

Please see https://www.skull-index.com/species/mammals-page-1 and https://www.skullbase.info/skulls/mammals.php for inspiration on how the other websites did it. They both have strengths and weaknesses. My website should be a much better version of these.

We should also have an option to search for specific species which directly opens the individual species subpage. And also searching for a specific genera, families, and orders to show all the species within (accepting both latin, english, and danish).

We should also categorize species skulls by length and weight. User can then select an interval to see the grid gallery of all skulls in that specific length or weight interval.

#### Individual Species subpages:
This is the main subpage that contain all the detailed images and the measurement and metadata information for each species. This page should include information like:
    • Skull measurements: length, width, height, weight, cranium width, mandible length, maxilla canine length, mandible canine length.
    • Specimen: Sex, age, body weight.
    • Other data: owner, collecting date, collecting location, uploaded to site date
    • Taxonomy: class, order, family, genus
    • Cleaning: defleshing (e.g. maceration, beetles, boiling), decreasing (soap, ammonia etc.), whitening (yes, no, hydrogenperoxide %)
    • Source: e.g. roadkill, beach wash-up, hunting.

##### IDEA:
For each specific species, the user can click a button to show the animal around the skull. We generate consistently styled/themed, realistic images of each of the species (on black background, lateral view), where the head is replaced with my skull image once clicking the button. That way the user can elegantly see the whole animal in a visual cool way, instead of just a static image. If this turns out to be too hard or not convinient, we can just make it a popup once clicking a button (i.e. not directly taking the main skull image, but a separate instance).

### MAP:
Map plot of where all my skulls are found. User can click on a map icon to open a Denmark map (I have no skulls from other countries as of yet), where one can see small icons on exactly where each skull was found. User can zoom in and move around. User can click on icon to see small info box with species and location information, small lateral view of skull, and a link that jumps to that skull page.

This website has such map feature: https://www.skullbase.info/map.php

### CONTRIBUTION:
I want to allow people to contribute photos of species that I don't have. This could be through a page with a clear guide on exact picture requirements (i.e. background, angles etc), and also a place where they can uploade the files directly to me.

By doing this, the skull database can increase, and overtime become a genuinely usefull site to look up all sorts of skulls, as opposed to just be my small, localized collection of 15-20 species.

## Features Brainstorm:
These are just some ideas that came to my mind. They are not first priority, but just something we can think about implementing once the main website is finished. Include a section in the .md files where we actively can put future ideas down, because I will likely come up with new ideas as we are building.

* Place where user can select skulls to compare. We can implement cool slider animations to compare morphology of different species in a visually fun way: skulls are perfectly aligned, and when sliding, one species becomes more transparent, or some other cool idea. This is just explorative fun stuff, not a main purpose of the website.
* Statistics about how many visited the site, from what country, etc.
