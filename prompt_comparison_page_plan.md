# prompt_comparison_page_plan
Overall, I agree with most of your recommendations for the new comparison page. I have commented with feedback on some of your suggestions below – please read this. If I haven't commented on one of your ideas, then it means that I'm OK with it.

I have also come up with 2 new ideas that expands the number of skulls in the viewport. Please be thorough and metuculously evaluate if these ideas are feasible for the page, and figure out how they most efficiently can be implemented to the page design and architecture.

Before we start implementing, please write a comprehensive markdown plan for this new comparison page, where you describe the layout, design system, features, functions, architecture, and so on, so that another implementer agent (or yourself) knows exactly how we want the page to look and work. Be thorough and metuculous; don't be lazy.

Remember to also give me a concise overview of the most important parts/decisions of the plan in chat so that I can confirm.

## 2. A genuinely free comparison field:
You wrote: "Add a separate viewport zoom control. Clearly label it as “view zoom”; it must not imply that the skull measurements changed."
	• Not quite sure that you mean by a separate viewport zoom control. I want the user to be able to "zoom in/out" on the field, causing all skulls in the field to become smaller and larger, instead of the skulls always being a static size. This feature will also be important for the two suggested new ideas further down in this prompt!

## 4. A real semantic measurement table:
You wrote: " The table heading should make the calculation direction explicit: Difference = Skull 1 minus Skull 2 · ratio = Skull 1 / Skull 2"
	• Yes, but with a tooltip. No need to waste space with a long table header.

You wrote: "Measurement names could link to the relevant /methodology definition. That would make the comparison page useful as a reference tool rather than just a visual toy."
	• Yes, great idea!

## 5. Optional visual aids:
You wrote: "A Show only comparable measurements option, while keeping all rows visible by default."
	• Yes

You wrote: "A compact Approximate source values note."
	• No, we don't need that.

## High-value creative features:
### Quick pairing suggestions:
Good idea!

### Shareable comparisons:
Good idea!

### Entry points throughout the site:
This is an excellent idea! Let's implement this.

### Print-friendly mode:
Not sure on this feature. But it doesn't harm to include.

## One data rule to reconcile before implementation::
I fully agree with your suggestion: "For the standalone page, I recommend allowing every published specimen that passes the calibrated-media requirements, then updating the canonical documentation to match."

## New ideas:
### Multiple skull views:
We currently only support the lateral skull images. But the page would become much stronger if we allowed the user to select the other angles as well (except for the oblique angle). That way, we could allow the user to enter multiple views from skull 1 and 2 on the same time! They can then move them around to create a layout they like. So they could both have e.g. the mandibles and the lateral skulls from both species (4 images total) in the same field!

Since we have all the measurements, this should be possible right? For the frontal view we could use either skull width or height. For the dorsal and ventral views we could use either skull width or length. For the mandibles we could use mandible length, but here we should be aware that the length was measured along one mandible while the image shows the mandible assembled together causing the right and left mandibles to be at an angle.

We could then have a dropdown called "view" or "angle" or some clever icon that illustrates the action, where the user can select lateral, frontal, mandible, and so on. I am not sure how to implement this feature in the most efficient way.

If the user wants to remove a skull view from the field, they can simple click on it which exposes a small "x" symbol that they can click on to remove it. If there are two views of the same specimen on the field and the user removes one, then that species will still be compared to the other. But if they remove the only view of a species on the field, the species will automatically be deselected from the selected card.

### More than 2 skull species:
Similar to different skull views, we could also allow the user to select up to 5 skulls to enter the field. That way they could e.g. compare all species within a genus instead of only two at a time. Or all specimens for a single species.

In the measurement table, we could then add extra columns so we get all 5 skulls. The difference column will then by default be skull 1 vs skull 2, but the user can click on a button/dropdown in the difference column header to select the skulls to compare. Or another clever solution if you have one.

If it becomes too much with both 2+ skulls and multiple views, we can decide to only keep one. But keeping both feature is the post powerful option.
