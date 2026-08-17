# Prompt - phase_2.1_raccoon_dog_slice_feedback (new phase 2.2)
I have reviewed and inspected the refined Phase 2.1 raccoon-dog vertical slice. Overall, it's now much better than phase 2.0. However, there still are a bunch of errors and aspects that can be improved.

Below is an extensive and structured feedback on the Phase 2.1 raccoon-dog vertical slice with suggested solutions to problems and weakpoints, and also new features to implement. Please read everything carefully. Be thorough and meticulous; don't be lazy. Then fix every problem and weakpoint, and implement the new features I suggested. Remember to document everything in the documentation.

Do not begin Phase 3 yet, as we first need to complete phase two, which now has been extended even more due to my further feedback. You should call this new phase for "Phase 2.2".

## Specimen photography:
### Picture frames (desktop):
I suspect that you optimized the website for the full screen window ratio. Please optimize the desktop layout primarily for a normal Chrome window, where my webpage viewport is approximately 2.07:1, rather than for macOS full-screen Chrome, where the viewport is approximately the Mac display aspect ratio of 16:10 (1.6:1). Both should remain responsive and look good, but the normal Chrome window should be the primary desktop design target. Since the webpage viewport will differ based on browswer and computer, 2.07:1 is not the only true aspect – since chrome has quite a large top bar, 2.07:1 is probably going to be one of the widest cases but also a very common one.

The problem on the webpage viewed in 2.07:1 in my normal chrome window, is that the aspect ratio of the main frame (big skull image) and angle thumbnail frames are too wide. It looks good in full screen mode, but most people will view the website in a normal chrome window.

This wide image frame aspect ratio causes too much dead-space on the sides (i.e. the skull doesn't fill out the frame enough). To solve this minor issue, make the frames taller (~10-20%) but still make sure that the "previous", "next", and "insepect image" buttons can be seen when the user has scrolled down enough so the top boarder of the main image is the very top of the website. See the screenshot `main_image_frame_narrow.png` for how much the main image frame should be approx extended in height.

By making the main frame aspect ratio taller, the skull image inside should of course also be made larger so that it fills out the frame. By doing this, the large empty space on the sides will automatically be filled more out which is good. See the screenshot `gallery_ideal_look.png` for how the main image idealy should look with the taller image frame aspect ratio.

You of course also need to extend the right-hand thumbnail rail the same amount down, so that it becomes in line with the now further down "next" button. And the angle thumbnail should get the same aspect ratio as the main skull image.

## High-resolution inspection:
Overall, the high-resolution inspection window is now much better on desktop. However, there still are some errors that need to be fixed.

### ZOOM (desktop):
The zooming is now much better, but there still are some problems:
		1. Pinch-to-zoom triggers the whole window zoom rather than the image zoom. Instead zooming on desktop works only by dragging two fingers up. This is fine, but the small note guide is now misleading: "Scroll or pinch to zoom; drag to move. Double-click to zoom or reset". It should not say pinch to zoom if it doesn't work. Either fix pinch-to-zoom so that it works, or simply remove the text saying it works.

	2. In addition, when you zoom by either using the scroll-wheel or two-finger drag, you simultaneusly scroll up and down on the main page. This should not happen, please fix this. The zooming should not affect the scrolling on the main page.

	3. Further, user cannot navigate with arrow keys between images when zoomed in – only when zoomed out to 100%. This is a minor problem, but should still be fixed if possible without breaking anything.

Note: You wrote that zoom gestures do not require Command/Ctrl because those combinations conflict with browser page zoom. I don't think this is true. Holding command and scrolling with the mouse-wheel does nothing unique? So the previous idea I proposed with using `command + mousewheel scroll` and `command + Pinch-To-Zoom` or `command + two-fingers up and down on mouse pad` for zoom and drag by `command+click+hold+move` could work fine on the main page skull image once the user has single-clicked on it? We still keep the insepction window though.

### DRAG (desktop):
When zoomed in and click+hold on the image to drag, the whole transparent image "pops out of frame" – like the image now overlays all UI elements like the top "lateral view" bar and the bottom "zoom" bar. Not sure if this was intentional. It looks pretty cool and maximizes the view so we can keep it.

### ON MOBILE:
Previous, next, inspect image, double-tap, thumbnail tap, open measurement guide, how age is estimated, view condition scale: nothing happens when tapping on ANY of these on mobile, so none are working. Not sure if this is a problem with me viewing the website through Network: http://0.0.0.0:3000 on my android mobile. Please investigate and fix this problem, because this hinders me in testing if the zoom and draf featurs work on mobile.

## Measurements:
### Relative length box:
This new relative length box is very bad! I have uploaded an extensive, detailed markdown description/guide on exactly what you need to replace it with. This new replacement is much more complex and requires careful and meticulous engineering by you. See the file `implement_interactive_true_to_scale_skull_comparison.md` for this extensive guide and see `measurements_new_design.png` for a mockup of the design of the new measurement section.

In order to get more space for the new "sense of scale" comparison box, we should move the  measurement table below the "Measurements" title and "Values describe SPEC-0001; they are not a species range" note. This leaves 2/3 of the section area free instead of only the middle 25%.

The skull comparisons will leave more empty space to the right. Therefore, we should also add a compact "measurement difference" table to the right of the two vertically compared skulls, but still within the overall comparison box, that shows the difference of the major measurements: Max length, Max width, Max height, Skull mass, Cranium width, Max Mandible length. This is also described in great details in the markdown guide.

Note: the design shown in the .png mockup and described in the .md guide is based on desktop and landsacape mobile (i.e. wide format).

## Collection record:
The word "provenance" is still not the correct word, because it doesn't describe all the table shows. Use "Metadata".

### Age:
The note "Age classes are estimates based primarily on tooth development and wear, supported by cranial fusion and morphology. The timing and expression of these characteristics vary between species and individuals" inside the age accessible dialog (modal) is formatted as "align to right" – it should be align to left. See age_accessible_dialog_fix.png.

### Condition:
Exactly like the age accessible dialog (modal), the bottom note is "align to right", but it should be align to left. Fix this.

In addition, the modal title: "Specimen-condition guide" is also align to right and it is broken into two lines. It should be align to left and the text should be on one line. See condition_accessible_dialog_fix.png.
