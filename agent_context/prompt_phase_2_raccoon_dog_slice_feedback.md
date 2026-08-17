I have reviewed the Phase 2 raccoon-dog vertical slice. Overall, the design is very good! However, there still are a bunch of things that can be improved.

Below is an extensive and structured feedback on the Phase 2 raccoon-dog vertical slice with suggested solutions to problems and weakpoints, and also new features to implement. Please read everything carefully. Be thorough and meticulous; don't be lazy. Then fix every problem and weakpoint, and implement all the new features I suggested. Remember to document everything in the documentation.

Do not begin Phase 3 yet, as we first need to complete phase two, which now has been extended due to my feedback. Either keep it phase 2, or call it phase 2.1.

## Random:
Note that all the feedback and suggestions below are by default based on my inspection of the website on DESKTOP in CHROME! Feedback is only based on mobile when I explicitely mention "MOBILE". Therefore, some of the feedback may not be applicable to the mobile version. Please try your best identify if the various feedbacks are relevant for the mobile version.

### GBIF:
I love how you used the GBIF database. Keep using it for the content!

## Pictures:
### Quality:
I inspected the .webp files under `/public/media/specimens/SPEC-0001` and here the quality is OK. However, on the actual webpage, the images are too low quality causing them to look blurry and even the pixels are getting a bit blocky. You need to solve this problem.

### Page Zoom:
The main big skull image cannot be viewed without being cut off when chrome tab is set to 100% zoom (the default). Either the layout of the page is too much zoomed in / too wide, or the main skull image needs to be shrunken down a bit.

It would be ideal if the user could both see the main big image, the "previous" and "next" buttons, and the other angle image thumbnails. This is much better than having them to scroll down to see/select a new image. I'm aware that they can just click the main image and use the arrow keys on keyboard, but this is still not ideal.

Potential solutions:
1. One solution could be to increase the margin of the page? This is quick, but maybe not very clean.

2. Another solution is to keep the margin but make the big main image smaller, move it to the left, and add the angle thumbnails stacked on the now empty right part of the page. The downside of this is that it becomes harder to structure the thumbnail layouts if we for some species have so many that they take up more space than the height of the main image. A solution to this could be to make them scrollable, so that in cases where there are too many, user can simply scroll down. This is probably the most complete and elegant solution.

#### ON MOBILE:
Here it looks good as it is with the angle thumbnails below the main image. Moving the thumbnails to the right of the main image will not work on the common narrow orientation format of the mobile. However, when viewing in landscape, the website becomes very wide and here having the thumnails on the right side would be ideal. But if this is too hard to implement this variation, then you don't have to do it, but it's definitely the best design.

### Picture navigation:
Add a small note that tells the user that if they click on the big image, they can switch between all images by pressing the arrow keys on their keyboard. This can otherwise not be known, and causing them to use the more tedious method of clicking "previous" or "next" or directly on the images. Not a big problem, but a tiny improvement.

#### ON MOBILE:
Navigation on mobile does not work at all! You must fix this.
* Clicking on Next, Previous, or Inspect full view does nothing.
* Swiping does nothing.
* Pinching does nothing.
* Clicking on the angle thumbnails does nothing.

### High-resolution inspection + image zoom (desktop):
This closer inspection feature is a nice idea, but the execution is not ideal and should be heavily improved.

Firstly, it's not optimal having to click on "Inspect full view". Instead, simply double-clicking on the big main image is much more smooth and quick.

Secondly, inside "High-resolution inspection", the image is actually much smaller than the main image out on the main specimen page. This defeats the purpose of the "inspect full view", making it kinda useless. Also, the inspection window is not 100% symmetrical; there is an empty gap on the right side but no empty gap on the left side. Similarly, there's an empty gap in the bottom, but no empty gap on the top.

Thirdly, in the inspection window, the user then has to tediously zoom in by clicking "Zoom in" multiple times, which is not an ideal, smooth design. We need to come up with a much more smooth and elegant design for zooming and dragging around when zoomed in.

A solution to the non-optimal zoom design, could be to allow the user to zoom directly by clicking `command + mousewheel scroll` and `command + Pinch-To-Zoom` or `command + two-fingers up and down on mouse pad`. Of course using ctrl instead of command on windows. When zoomed in, the user can drag around by clicking and moving the mouse or by using two fingers on the mouse bad and move around. Not sure if it's technically necessary/optimal to also press command/ctrl – you decide if we should use command or not.

Another solution could be to entirely remove the "inspect window" since the elegant zoom and drag design could be added directly to the main big image on the page. This will be quicker and more clean if it can work. We could also keep both the zoom design on the main image and still have he inspection window if you can figure out how to improve the current problems of inspection window.

#### ON MOBILE:
As mentioned before, the "inspect full view" button does not work on mobile. Thus I can't check if the zoom and drag ability work. The obvious design is to zoom by pinching with two fingers and drag by moving one finger (or two finger).

## Other page text:
* Six-view study: This text is not needed.
* Instead of "Photography by X" be more concise with "Photo: X"
* The word "Exhibit": I am not a fan of using this word. It's just a website, not a true museum. The word "Display" sounds a bit better. This is just a minor nuisance.

## Cited profile:
I love how you created the reference system with in-text citation! However, none of the current written information adds any value to the page. The measurements and other metadata tables are more important and should thus take the top place of this section.

I like the idea of having a quick description of the species (e.g. overview with fun facts) and a quick guide to identify the skull based on unique characteristics (skull identification). However, I think we should wait with adding this information until the website is mostly done, so that we can specifically focus on adding, interesting, correct, curated information instead os quick slop!

Therefore, we should remove this cited profile section for now, and later we can later add it back. This, even though we remove this section, you should still keep the reference/citation system and that stuff you've developed, so that we have it for later.

* Overview: Current information is not important. Its should be implicit that taxonomy agrees with GBIF. If we mention it, then it definitely should not be given so much space. It should be some extra info hidden somewhere.
* Skull identification: Curreny information has nothing to do with identification of the species. This is not important.
* Comparison notes: I don't see the purpose of this text at all. The info on the damaged nasal region belongs under condition.

## Reference data (Measurements):
This is the second most important information after the pictures. Therefore, it should be right below the pictures, replacing the Cited profile for now. I really like the "Show additional recorded measurements" feature you added – it allows us to pack in extra information without cluttering the page!

### Skull measurement illustration:
I appreciate the idea of having an illustration that shows the measurements. However, the illustration is very unclear and thus not helpful. Can be improved a lot.

We should remove it and instead add a dedicated subpage to the supporting pages, where we create much more detailed descriptions on the measurements and I myself create an illustration using real skulls on where the measurements are. We can then add a link to the measurement table that takes the user to the detailed subpage.

However, if we still want to add the helpful measurement guide directly to the specimen page (very useful), we can add a button/place to click that opens up a Pop-up or modal window (or whatever is optimal) showing a quick, detailed measurement guide. I will still myself need to create the illustrations, but we can still add the foundation for this feature for now!

Note down the subpage and illustrations as future additions in the plans.

By removing this illustration, we now get a chuck of empty space on the desktop version (this is not a problem on the vertical mobile orientation). We could either:
1. Move "Provenance (Collection record)" up besides the measurements table (not applicable on vertical mobile). This collects the two most important information tables towards the top, and leaves less important information like "Preparation record" further down. This however leaves "Preparation record" alone, resulting in a new chuck of empty space down there.
2. Fill in the empty space with something else. This could be a size comparison to a human skull or some other thing that lets the user easily get an idea of the size. Because simply reading X mm can make it hard to truly grasp the size. Visual comparisons are much stronger. I lean towards this second option!

## Provenance (Collection record):
We should add "Owner" to this table instead of having the owner down in "Rights and credit".

### Age:
I don't think we need to write the small footnote "Adult (legacy stage 4)". I still however think it's important to include criteria/characteristics on how the age-group is estimated.

Therefore, we should add a table that describes the chatacteristics for each age group. Instead of adding this table directly on the page, we should add a button that opens either an accordion, On-Click Pop-up, or modal window (or whatever is optimal), which then displays this table. We can then later build a more detailed subpage under the the supporting pages, which shows specific illustrations and reference images for each characteristics (note this down as future addition in the plans).

Age group	Typical skull & tooth characteristics
Juvenile	Deciduous teeth present and/or permanent teeth unerupted or erupting. Cranial sutures are wide and clearly open; in very young animals, some skull elements may remain poorly fused or separate. Bone is relatively thin and delicate, and muscle-attachment ridges and crests are weakly developed.
Subadult	Permanent teeth are replacing the deciduous dentition or have recently erupted and show essentially no wear. Skull is near adult size but some sutures and synchondroses remain conspicuous. Muscle attachments become stronger and crests, such as sagittal or nuchal crests where present in the species, begin to develop.
Young adult	Complete permanent dentition with sharp cusps and little or no wear. Skull has essentially reached adult proportions and most developmental fusion is complete. Muscle-attachment areas and cranial crests are well defined but may continue to become more robust.
Adult	Complete permanent dentition with clear but moderate wear; cusps are becoming rounded or flattened. Skull is fully developed and robust, with strong muscle-attachment scars, ridges and crests. Cranial sutures may become less distinct or partially fused.
Old adult	Heavy dental wear with strongly flattened or lost cusps, exposed dentine, and sometimes broken or ante-mortem missing teeth. Long-standing tooth loss may leave partially or completely resorbed/healed alveoli. Sutures may be extensively fused or difficult to distinguish, although complete fusion is not universal.
Indeterminate	Dental development, wear or cranial maturation cannot support a confident classification, or different indicators give conflicting results.
Then add a small note below the table: "Age classes are estimates based primarily on tooth development and wear, supported by cranial fusion and morphology. The timing and expression of these characteristics vary between species and individuals."

### Condition:
I think we should have more, finer options for condition. Because calling this "damaged" is maybe a bit of a stretch as it is only missing a tiny bit of bone on the nose.

Therefore, we should add a table that describes the criteria/chatacteristics for each condition group from 1-5. Instead of adding this table directly on the page, we should add a button that opens either an accordion, On-Click Pop-up, or modal window (or whatever is optimal), which then displays this table. We can then later build a more detailed subpage under the the supporting pages, which shows specific illustrations and reference images for each characteristics (note this down as future addition in the plans).

In the start, a table is sufficient, but later we can expand it by also attaching skull reference image for each group. But this is a potential later task that you should note down as future addition.

Condition	Typical characteristics
Excellent	Skull essentially complete and intact. All or nearly all teeth are present, with no significant fractures, cracks, missing processes, or surface damage. Delicate structures such as zygomatic arches, nasal bones, and auditory bullae are intact.
Good	Mostly complete and well preserved. May have a few missing teeth, small chips, minor cracks, or slight damage to delicate structures, but the overall skull morphology is intact and unaffected.
Fair	Noticeable damage or incompleteness. Several teeth may be missing, and one or more processes, arches, nasal elements, or other structures may be broken or absent. Cracks or moderate surface deterioration may be present, but most of the skull remains intact.
Poor	Substantial damage or loss of bone. Major structures may be broken or missing, with extensive cracking, fragmentation, weathering, erosion, or numerous missing teeth. Important anatomical features may no longer be fully represented.
Fragmentary	Only part of the skull remains, or the specimen consists of multiple incomplete fragments. Large portions of the cranium or facial skeleton are absent and the original skull morphology cannot be reconstructed reliably.
Then add a small note below the table: "Condition describes the physical preservation and completeness of the specimen. Natural abnormalities, age-related tooth loss, and developmental features are not considered damage."

Also, the current "Pathological" option should be made into its own row in the table, with the data type being: No or Yes. If Yes, then a short description of the patahology should be written – either as a pop-up/expansion or directly written on page.

### Other data:
* Trauma: e.g. if the skull has sign of trauma like bite-marks or bullet holes.
* Pathology: e.g. if the skull has sign of any sort og pathology
* Teeth set: Complete (e.g. all teeth), partially complete (e.g. only missing 1-2 tiny teeth), incomplete (e.g. missing many teeth). This data field overlaps a bit with condition, but still adds value i think because teeth are so distinct.
* Skeleton: Full, Partial, No. This tracks if other bones are available for this specimen. 95% of the times this is no, but I have a few skulls with complete skeletons. This information could be placed inside a "Show additional recorded data" similar to the one we have for measurements.

## Preparation record (From specimen to exhibit):
This section is mostly good as is. However, we should add a link/button that takes the user to the skull preparation guide.

In addition, I am not fan of the phrase "From specimen to exhibit", as this sounds like AI slop. We should just state it clearly as "Skull preparation", but the problem with this phrase is that it overlaps with the "Preparation record" text above.

### Gold/brass text above the big section titles:
This makes me wonder why we even have these gold/brass colored texts above the big section title. Like it looks nice, but it's kinda redundant and sometimes it doesn't even fit the section. For example, for "Collection record" we call it "Provenance" but condition, age, sex, Coordinates, Location, etc has nothing to do with provenance.

We can keep them for now, but make a note in the docs that these may be removed later. However, I still want to keep these two brass text: "Mammalia · Carnivora" and "Physical specimen". But the rest are a bit redundant.

## Rights and credit:
This whole section can be removed. The only important information is the "All rights reserved". But this information is normally something that is mentioned at the very bottom of a page as a tiny footnote like: "© 2023-2026 All rights reserved;…". If you agree, we do this.

* The text "Documented, not released for reuse" sounds like AI slop cringe.
* "Specimen: Private collection of Rasmus". This information should be moved to the collection record table as called "owner" = Rasmus.
* "Photography: Photography by Rasmus" is not important. This is already directly shown on each picture.
* "Media and collection data: All rights reserved". This information should not be mentioned here. This information is something that is mentioned at the botton as a footnote on every page. Like they've done for the skullbase and skull-index websites.

## Ideas to consider implementing soon or after first stable release:
### More skull(s) from family X:
The website "skullbase" has a section towards the botton of the speciment page, that shows a thumbnail gallery of up to six random species from the same family as the main page. This is nice as it motivates the user to keep looking around and check out species that they didn't plan to look at.

## Random skulls:
The website "skullbase" also has a section identical to the "More skull(s) from family X" but where the skulls are random from the whole collection. We could also add this if you think it doesn't ruin the design. If showing 6 skulls for both random and family becomes too much, we could reduce it to only 3 skulls. You decide what's best!
