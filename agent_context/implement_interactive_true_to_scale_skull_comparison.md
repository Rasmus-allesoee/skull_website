Redesign the current **Relative length / A sense of scale** component into an interactive, true-to-scale skull comparison tool.

The previous 10 cm scale-bar implementation should be removed completely.

# Core idea

The component should answer:

**“How large is this skull compared with something familiar or with another skull in the collection?”**

By default, the current specimen should be compared against a **normal adult human skull**.

However, add a **Compare** control that allows the user to replace the human skull with **any other skull available in the website database**.

This makes the component useful both as an intuitive human-scale reference and as an exploratory scientific/collection comparison tool.

---

# Default state

When the specimen page first loads, show:

```text
A sense of scale

[current specimen]
[true-to-scale lateral specimen image]

compared with

Adult human skull
[true-to-scale lateral human skull image]

[ Compare ]
```

The **human skull is the default comparison**.

Use the human skull PNG I placed in:

`/agent_context/skull_images_clean/`

Treat this as a staging/reference source. Process it once into an appropriate validated public/reference asset and deterministic metadata rather than serving directly from `agent_context` at runtime.

For the current specimen, use the specimen page's existing validated **lateral `MediaAsset` / transparent public derivative** from the canonical media pipeline. Do not load specimen images directly from staging at runtime.

Do not hard-code the raccoon dog or `SPEC-0001`.

---

# Interactive Compare control

Add a clearly discoverable but visually restrained **Compare** button/control.

When clicked, it should open a searchable selector.

The user should be able to:

1. click **Compare**
2. get a search field
3. type a species/common/scientific/specimen name
4. see matching skulls from the site's existing data
5. select one
6. immediately replace the human reference with that skull

For example:

```text
Compare with...

[ Search skulls...              ]

Red fox
Vulpes vulpes

European badger
Meles meles

Raccoon dog
Nyctereutes procyonoides

...
```

Use an accessible searchable **combobox/listbox** pattern rather than building an ad-hoc dropdown.

Keyboard navigation should work.

The current page specimen should remain fixed as the primary skull. Only the comparison skull changes.

Provide an easy way to return to:

**Adult human skull — default**

The human reference should therefore appear as the default/top comparison option as well.

---

# What records are eligible for comparison

Only offer skulls for which the system has enough information to produce a **valid physical comparison**.

At minimum, a comparison skull must have:

* a usable lateral skull image
* a recorded maximum skull length

Do not show or select records for which true-to-scale rendering cannot be performed reliably.

Use the existing canonical content/data model rather than creating a parallel hard-coded skull list.

If multiple specimens exist for one species and specimen-level measurements/images differ, use the page default specimen. Inspect the current data model and select the appropriate record level rather than guessing.

---

# Critical physical scaling rule

Every displayed skull must use the **same physical scale**.

If skull A has a maximum skull length of:

```text
116 mm
```

and skull B has:

```text
180 mm
```

then their rendered anatomical lengths must satisfy:

```text
rendered_length_A / rendered_length_B
=
116 / 180
```

This ratio must remain true at every responsive size.

For example:

```text
pixels_per_mm = shared_scale

rendered_length_A = 116 × shared_scale
rendered_length_B = 180 × shared_scale
```

The responsive layout is allowed to change `shared_scale`, but it must change it **once for the pair**, never independently per image.

---

# Transparent images and anatomical bounds

The specimen lateral images and the human skull reference have **transparent backgrounds**, which makes accurate scale calculation straightforward.

All canonical specimen lateral images are standardized **true lateral views** and are not rotated relative to the horizontal skull-length axis. Therefore, for these lateral images, the horizontal width of the visible skull can be used as the image-space representation of maximum skull length.

Do **not** use the complete image canvas width, because transparent margins around the skull are irrelevant.

The existing media pipeline already calculates deterministic `subjectBounds` from the alpha channel. Reuse these existing bounds for specimen images rather than rescanning images in the browser.

Conceptually:

```text
transparent image canvas
┌──────────────────────────────────┐
│                                  │
│      ┌────────────────────┐      │
│      │   visible skull    │      │
│      └────────────────────┘      │
│                                  │
└──────────────────────────────────┘
       ← subjectBounds.width →
```

For a canonical lateral specimen:

```text
subjectBounds.width
=
pixel representation of maximum skull length
```

The scaling relationship is therefore:

```text
recorded skull length in mm
↕
subjectBounds.width in source-image pixels
```

For example, if a specimen has:

```text
skull_length_mm = 116
subjectBounds.width = 1850 source pixels
```

then those 1850 source pixels represent 116 mm of real anatomical length.

The rendered image must then be transformed so that the **visible subject width**, not the full transparent canvas width, occupies:

```text
116 × shared_pixels_per_mm
```

CSS/layout calculations must account for the transparent margins around the subject. Do not simply set the complete image element width equal to the required anatomical rendered width, because that would incorrectly include transparent canvas space.

Preserve the complete image and its aspect ratio while positioning/scaling it so that its `subjectBounds.width` corresponds to the intended rendered anatomical length.

The existing subject bounds are already calculated during media processing using an alpha threshold. Prefer this deterministic build-time metadata over repeated client-side image analysis.

For the adult human skull reference, process its transparent PNG through an equivalent deterministic bounds calculation once and store the resulting dimensions/subject bounds alongside the reference configuration. Its visible lateral skull width should likewise represent its approximate reference maximum skull length of:

```text
180 mm
```

The same physical relationship must therefore apply to **every** comparison item:

```text
rendered_subject_width_px
=
skull_length_mm × shared_pixels_per_mm
```

The transparent canvas size may differ substantially between source images and must have no effect on the physical comparison.

---

# Preserve anatomy and morphology

This is essential.

Do not resize the skulls independently to fill their containers.

Do not use:

```text
width: 100%
```

on both images in a way that normalizes their apparent size.

Do not stretch width and height independently.

Do not crop off anatomical endpoints.

Do not use `object-fit: cover` if it changes what part of the skull is visible.

Each image must be scaled **uniformly**, preserving its natural aspect ratio.

A long, low fox skull must remain long and low.

A human skull must remain much taller and more rounded.

The radically different morphology is part of what makes the comparison useful.

---

# Orientation

For direct visual comparison, both skulls should face the **same direction**.

Prefer the orientation of the current specimen image.

If the comparison image points in the opposite direction, horizontally flip its presentation as needed.

Do this non-destructively in presentation/CSS; do not rewrite source files merely to change orientation.

Do not infer orientation heuristically at runtime.

The current `MediaAsset` model does not encode whether a lateral skull faces left or right. Add the smallest appropriate explicit orientation metadata/configuration needed by the reusable comparison system, or establish an equally deterministic canonical-orientation rule in the media pipeline.

The comparison renderer may then use this metadata to flip one image non-destructively when necessary so both skulls face the same direction.

The comparison should remain anatomically faithful.

---

# Adult human reference

Use the human skull PNG in:

`/agent_context/skull_images_clean/`

Treat its reference maximum skull length as approximately:

```text
180 mm
```

Keep this reference value in an explicit reusable configuration/data structure rather than burying it as an unexplained magic number inside rendering code.

Label it approximately:

```text
Adult human skull
~180 mm
```

Do not imply that 180 mm is a universal exact adult-human value.

---

# Layout

Retain the existing dark museum/editorial visual language.

The component should feel like a polished collection/reference interface rather than a technical debugging tool.

Preferred default arrangement:

```text
RELATIVE LENGTH

A sense of scale


SPEC-0001
116 mm

        [specimen skull]


        [comparison skull]

Adult human skull
~180 mm


[ Compare ]
```

A stacked vertical arrangement is preferred because it gives each skull enough room while making their relative physical dimensions easy to perceive.

A subtle divider between the two is acceptable.

Keep the skull images visually dominant.

Keep IDs, names, and measurements secondary.

Do **not** add a redundant bottom sentence such as:

“SPEC-0001 is about two-thirds the length of an average adult human skull.”

The comparison should communicate that visually.

---

# When the user chooses another skull

For example, if the page specimen is:

```text
Raccoon dog
116 mm
```

and the user selects:

```text
Red fox
142 mm
```

the component should become conceptually:

```text
Raccoon dog
116 mm

[true-to-scale raccoon dog skull]


Red fox
142 mm

[true-to-scale red fox skull]


[ Compare ]
```

Both must use the same `pixels_per_mm`.

The fox should therefore have a rendered anatomical length:

```text
142 / 116 ≈ 1.224
```

times that of the raccoon dog skull.

Do not merely make it “look somewhat larger.”

The visual ratio must derive mathematically from the recorded measurements.

---

# Responsive scaling

The card must remain responsive without corrupting the comparison.

Determine the shared scale from the available display area and the **larger physical skull**.

Conceptually:

```text
largest_length_mm = max(primary_length_mm, comparison_length_mm)

shared_pixels_per_mm =
available_visual_width / largest_length_mm
```

Then:

```text
primary_rendered_length =
primary_length_mm × shared_pixels_per_mm

comparison_rendered_length =
comparison_length_mm × shared_pixels_per_mm
```

Apply the same principle if another layout constraint such as available height becomes limiting.

The key invariant is:

**one shared physical scale for both skulls.**

Never give the two images independent responsive `max-width` behavior that changes their relative scale.

---

# Search behavior

Search should be useful across the collection.

Where supported by the existing data model, match relevant fields such as:

* common name
* scientific name
* specimen ID
* taxon/species name

Present results concisely, for example:

```text
Red fox
Vulpes vulpes
SPEC-0014
```

Do not overload the selector with irrelevant metadata.

The currently displayed specimen should either be excluded as a comparison option or clearly disabled, because comparing a specimen against itself adds no value.

Keep this selector search deliberately scoped to comparison selection. Do not prematurely implement or duplicate the broader Phase 4 global-search architecture just for this control.

---

# Empty and unavailable states

If the current specimen lacks:

* maximum skull length, or
* a valid lateral image

do not fabricate a comparison.

Gracefully disable the true-scale tool and communicate the unavailable state in the existing site style.

Likewise, only allow selection of comparison records that can be scaled correctly.

---

# Reusable comparison architecture

This specimen-page comparison should be implemented as a specialized use of a **general reusable skull-comparison system**.

Do **not** build the dedicated public comparison page or route yet. We will design and refine that page separately once the collection contains enough specimens for it to be genuinely useful (after phase 3 or 4).

However, implement the underlying comparison architecture now as page-independent reusable primitives rather than embedding the scaling logic directly into the specimen page.

The reusable system should conceptually support:

```text
ScaleComparison(
    primarySkull,
    comparisonSkull
)
```

where both arguments can ultimately represent any eligible skull.

The specimen page should simply configure that general system as:

```text
primarySkull = current specimen
comparisonSkull = adult human reference by default
```

and allow the visitor to replace `comparisonSkull` through the Compare selector.

Build the following as reusable functionality now:

* the true physical scaling/calculation engine
* the scaled-skull image primitive
* the comparison-pair component
* the comparison record/view-model type
* the query that returns records eligible for calibrated comparison
* the searchable comparison selector
* human-reference handling
* orientation handling
* responsive shared-scale behavior
* tests for the physical scaling invariants

Do not make these depend unnecessarily on the specimen-page route or on the assumption that the primary skull is fixed.

The future dedicated comparison page will allow:

```text
Skull A ↔ Skull B
```

with **both sides independently selectable**. It should be able to compose the same components and calculations without duplicating or rewriting the scaling implementation.

Also inspect the existing media pipeline before adding new alpha-bound analysis. The current media model already contains generated `subjectBounds` for specimen images. Reuse those deterministic bounds for the standardized true-lateral specimen images rather than rescanning specimen images at runtime.

Process/configure the adult-human reference through an equivalent deterministic bounds mechanism.

---

# Accuracy requirements

The implementation is incorrect if any of the following occur:

* both skulls are independently fitted to similarly sized boxes
* transparent canvas margins affect scale
* raw image width is treated as skull length
* skulls are stretched
* one skull hits an independent `max-width`
* responsive behavior changes their physical ratio
* comparison records without valid measurements are offered
* the human skull is arbitrarily sized by eye
* the correct measurements are displayed as text but the images themselves are not proportionally correct
* the component is hard-coded specifically to SPEC-0001 or raccoon dog
* runtime page code loads specimen staging assets directly instead of using the canonical media pipeline
* specimen images are rescanned in the browser even though deterministic subject bounds already exist

The visual result must be based on:

**real recorded maximum skull length + visible alpha-bounded skull dimensions + one shared pixels-per-mm scale**

Before implementing, inspect the existing data model, specimen-image handling, media manifest, measurement fields, and current component architecture so this integrates cleanly with the site rather than introducing a parallel system.

# LOCATION ON MEASUREMENT SECTION

In order to get more space for the new "sense of scale" comparison, we should move the  measurement table below the "Measurements" title and "Values describe SPEC-0001; they are not a species range" note. This leaves 2/3 of the section area free instead of only the middle 25%. See `measurements_new_design.png` for a mockup of the new measurement section.

# Measurement differences table

Inside the **A sense of scale** comparison card, add a compact **Measurement differences** table in the available space to the right of the two skull images, following the supplied visual mockup.

This table should complement the visual true-to-scale comparison by showing how the two skulls differ across the six major measurements:

* Maximum skull length
* Maximum skull width
* Skull height
* Prepared skull mass
* Cranium width
* Maximum mandible length

The table should visually resemble the main Measurements table, but be **more compact** so it works as a secondary information panel within the comparison card.

Conceptually:

```text
MEASUREMENT DIFFERENCES

SPEC-0001 vs Adult human skull

Max length             ~66 mm shorter   (0.64×)
Max width              ~56 mm narrower  (0.55×)
Max height             ~88 mm lower     (0.34×)
Skull mass             ~724 g lighter   (0.10×)
Cranium width          ~97 mm narrower  (0.30×)
Max mandible length    ~28 mm shorter   (0.76×)
```

Do not hard-code these displayed differences or ratios. Calculate them from the measurement values belonging to the two currently compared skulls.

For example:

```text
difference =
primaryMeasurement - comparisonMeasurement
```

and:

```text
ratio =
primaryMeasurement / comparisonMeasurement
```

The **primary measurement is always the skull belonging to the current specimen page**.

The comparison measurement is the currently selected comparison skull.

This gives the ratio a consistent meaning everywhere:

```text
ratio > 1
= page specimen is larger

ratio < 1
= page specimen is smaller

ratio = 1
= same size
```

For example:

```text
primary skull length = 116 mm
comparison skull length = 182 mm

difference = 116 - 182 = -66 mm
ratio = 116 / 182 ≈ 0.64

display:
~66 mm shorter   (0.64×)
```

If the page specimen were 364 mm long and the comparison skull were 182 mm:

```text
ratio = 364 / 182 = 2

display:
182 mm longer   (2×)
```

This ratio should always use the same direction rather than sometimes inverting the calculation to say things such as “2× smaller.” A value below `1×` already communicates that the page specimen is smaller.

Format the ratio with sensible precision:

```text
0.10×
0.34×
0.64×
0.95×
1×
1.2×
2×
2.35×
10×
```

Avoid excessive decimal precision.

The ratio can be visually secondary to the absolute difference, for example:

```text
~66 mm shorter   (0.64×)
```

The absolute measurement difference remains the primary text, while the multiplier provides a second, quickly interpretable way to understand the magnitude.

---

## Directional color coding

Use subtle color coding to make the table faster to scan.

The color represents whether the **current page specimen** is larger or smaller than the selected comparison skull for that measurement:

```text
primary > comparison
→ larger
→ green / positive comparison state

primary < comparison
→ smaller
→ red / negative comparison state

primary = comparison
→ equal
→ neutral text state
```

For example:

```text
Max length     +72 mm longer     (1.62×)   ← green
Max width      -56 mm narrower   (0.55×)   ← red
```

The exact `+` / `-` signs do not need to be shown if the natural-language wording already communicates the direction.

Keep the colors restrained and consistent with the existing museum design. Do not use bright saturated traffic-light colors.

Prefer semantic design tokens rather than hard-coded raw colors.

Color must **not be the only indication of meaning**. The wording must always explicitly communicate the difference:

* longer / shorter
* wider / narrower
* higher / lower
* heavier / lighter

This ensures the comparison remains understandable for color-blind users, forced-colors mode, and assistive technologies.

If two values are effectively equal after normal measurement/display precision, use a neutral state such as:

```text
Same length   (1×)
```

rather than arbitrarily assigning green or red because of insignificant floating-point differences.

---

## Difference wording

Format the result semantically according to the measurement:

```text
length:
shorter / longer

width:
narrower / wider

height:
lower / higher

mass:
lighter / heavier

cranium width:
narrower / wider

mandible length:
shorter / longer
```

Use the absolute magnitude in the displayed difference value, with the wording describing the direction.

For example:

```text
primary skull length = 116 mm
comparison skull length = 182 mm

difference = 116 - 182 = -66 mm
ratio = 116 / 182 ≈ 0.64

display:
~66 mm shorter   (0.64×)
```

When comparing two database specimens, calculate the table directly from their canonical measurement records.

If either skull lacks a particular measurement, do **not** infer or fabricate it. Show the appropriate existing missing-data state, such as `Not recorded`, or otherwise use the site's established missing-value presentation.

Do not calculate a ratio when either measurement is missing or when the denominator is zero/invalid.

If either contributing measurement is approximate, the resulting comparison should also be presented as approximate.

---

## Adult human reference measurements

The adult human skull is not a specimen in the collection database, so define its measurements in the same reusable human-reference configuration that stores its image and scaling information.

Use the following **fixed approximate adult-human reference profile**:

```text
Adult human skull reference

skull_length_mm:      182
skull_width_mm:       124
skull_height_mm:      133
skull_mass_g:         800
cranium_width_mm:     138
mandible_length_mm:   117
```

These values are intentionally a **representative reference**, not claims that every adult human skull has these exact dimensions.

Treat all human-reference measurements as approximate.

The intended anatomical interpretation is:

```text
skull_length_mm
≈ maximum cranial length
(glabella → opisthocranion)

skull_width_mm
≈ bizygomatic breadth
(maximum breadth across the zygomatic arches)

skull_height_mm
≈ basion → bregma height

skull_mass_g
≈ complete dry skull including mandible

cranium_width_mm
≈ maximum cranial breadth
(euryon → euryon)

mandible_length_mm
≈ condylion → gnathion / equivalent maximum mandibular length
```

Keep these values together in an explicit reusable reference object/configuration rather than scattering human-specific constants through the rendering code.

Conceptually:

```ts
adultHumanSkullReference = {
  label: "Adult human skull",
  measurements: {
    skullLength: { value: 182, status: "approximate", unit: "mm" },
    skullWidth: { value: 124, status: "approximate", unit: "mm" },
    skullHeight: { value: 133, status: "approximate", unit: "mm" },
    skullMass: { value: 800, status: "approximate", unit: "g" },
    craniumWidth: { value: 138, status: "approximate", unit: "mm" },
    mandibleLength: { value: 117, status: "approximate", unit: "mm" },
  }
}
```

Use the actual project's existing measurement/domain types rather than copying this example literally if its shape differs.

The human reference should therefore behave as much as possible like another comparison record even though it does not originate from `specimens.csv`.

---

## Dynamic behavior

The difference table must update immediately when the visitor changes the comparison skull using **Compare**.

For example:

```text
Current specimen
      ↓
Measurement differences
      ↑
Selected comparison
```

Changing:

```text
Adult human skull
```

to:

```text
Red fox
```

must automatically change:

1. the true-to-scale comparison image;
2. all applicable absolute measurement differences;
3. all applicable `×` ratios; and
4. the larger/smaller color state for every row.

The scaling comparison and measurement table must therefore use the **same primary and comparison records** rather than maintaining separate state.

---

## Design

Follow the supplied mockup closely.

The table should:

* sit on the **right side inside the A sense of scale card** on wider desktop layouts
* have a subtle vertical separation from the image comparison area
* use the existing typography, colors, spacing, borders, and semantic design tokens
* use a small heading such as **MEASUREMENT DIFFERENCES**
* optionally show a concise context label such as `SPEC-0001 vs Adult human skull`
* use subtle horizontal rules between rows
* align measurement names left and the absolute difference + ratio right
* use restrained green/red directional emphasis
* keep the multiplier visually secondary to the absolute difference
* remain visually secondary to the two skull images
* collapse/reflow appropriately on narrower layouts rather than squeezing the skull comparison

A row should read approximately like:

```text
Max length      ~66 mm shorter  (0.64×)
```

rather than splitting the difference and ratio into separate dashboard widgets.

Do not turn the section into a dashboard of icons, charts, or redundant summary statistics. The purpose of this area is specifically to show the **major dimensional differences and relative magnitude between the two currently compared skulls**.