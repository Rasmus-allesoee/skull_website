# PROMPT - measurement_page_feedback_v1
I have just inspected and reviewed the new measurement page on desktop and mobile. Overall, it's an OK first version, but there are a lot of bugs that we must fix. Below is an extensive list of bounded feedback, including errors/bug, weakpoints, and improvements.

Please read and investigate all the feedback below, evaluate my suggestions, and find + implement the best solution to each problem. There are a lot of things to fix, so this is a big task. Be thorough and meticulous; don't be lazy!

## Reference data – Measurements section:
Remove this first title section completely – including the text: "These numbered diagrams define the collection’s current measurement vocabulary. Select any number to see the matching anatomical landmarks and method note." It just takes up unecessary space and adds no value/function. Instead we start with the "Illustrated reference" section.

## Measurement diagrams "how to use":
Remove this text "Brass and bright outlines show interaction state only; they do not encode anatomical data."

## Numbers:
The numbers are too close to the surrounding gold ring – especially when the numbers are two digits and when the screen is narrow. Please leave more room so that the numbers never touch the ring. See the screenshot `numbers_too_close_to_ring.png`

When clicking on the number, the measurement lines correctly get highlighted. However, to unselect the specific measurement the user has to scroll up to click on "Clear selection X". This is not ideal. Instead, unselection should work by simply clicking or tapping anywhere on the screen outside that specific measurement number. There's not any need for this "Clear selection X" button due to its inefficiency.

## Dashed lines:
There are a few errors where the dashed lines doesn't match the reference PNGs 100%, which we must fix.

### Lateral skull (refer to ms_vulpes_lateral_5.png):
#1 meas: The posterior dashed line does not extend all the way down to the landmark! See the PNG for how it should look!

#2 meas: I forgot to extend the arrow all the way to the vertical dashed line in the PNG, which caused you to generate a new dashed line for #2. However, #1 and #2 shares the same anterior landmark, so there should only be ONE anterior dashed line (i.e. the line for #1). I have corrected lateral PNG file, but it may be quicker if you just extend the #2 arrow to the #1 dashed line and then delete the #2 dashed anterior line. Also, the posterior dashed line does not extend all the way down to the landmark! See the PNG for how it should look!

### Lateral mandible (refer to ms_vulpes_mandible_lateral_5.png):
#11 meas: Similar to #2, I forgot to extend the arrow all the way to the vertical dashed line in the PNG, which caused you to generate a new dashed line for #11. But #11 and #10 shares the same posterior landmark so they should share the vertical dashed lines for #10.

## Arrows:
The arrowheads are not placed on the tip of the lines, but instead further down into the line, causing them to kinda disappear – this is wrong. Please fix this so that the line connects to the base of the arrow head instead. Another bug is that when making the webpage tab more narrow or on mobile, the arrowheads become too small relative to the line they are attached to, causing them to disappear even more into the line. See screenshot `arrowhead_design_error_wide_screen.png` and `arrowhead_design_error_narrow_screen.png` for examples of this problem on wide and narrow screen.

## Horizontal scroll in diagrams:
When zooming in on webpage via the browsers build in zoom feature, it for some reason is not possible to scroll/pan horizontally when the cursor or finger is inside the diagrams. Please fix this.

## Description pop-up:
The window is a perfects example of aestetics at the expense of functionality, which is bad! The sole purpose of the window is to quickly provide the user with a description of the measurement at the same time as they are looking at the diagram.

Therefore, the window should be small, compact, and only contain the name, number, and description. Don't include the text "Measurement X" on top. The current name and number can be written much smaller so they take up less space. Overall, the window design should be much more space-efficient.

Also, when opening the window, it should not blur and darken the webpage behind, because this defeats the purpose of the user having the description open and still being able to see the diagram! The user may want to read the description and then at the same time look at the diagram to better understand the landmarks and such.

Also, when the user zooms in on the webpage and clicks on a number, the pop-up window is currently hard-coded/static to the top left corner. A more ideal design is to let the sizing of the window follow the built-in browser zooming. So if one zooms in, the pop-up window should remain the same size instead of also being zoomed in on, and it should stay in the corner of the zoomed in viewport (i..e when the user is zoomed in and scrolls to the right, it should not disappear but instead follow the horizontal scroll so that it is locked in the e.g. corner).

## One tap tooltip on MOBILE:
On mobile, when tapping 1 time on a number, it shows the tooltip below the skull as an extended part of the diagram. The tooltip includes the measurement name + a "view details" button. This is a good solution to combat the limited space.

However, the design of this mobile version tooltip is not pretty! The design should look similar to the desktop version – i.e. a gold/brass outline around the dark grey fill with white text. Also, the "view details" button should be on the right side and the measurement name should remain on the left side. Also, as you can see in `mobile_diagram_measurement_name_bad_design.png`, the number in front of the name is placed way too close to the left side border of the diagram/tooltip – please leave a tiny bit more space.

## Two tap details on MOBILE:
When tapping two times on the number to open the detailed description window and then closing the window again, the desktop version tooltip now pops up at the top of the diagram, while the mobile version tooltip below the skull disappears. You must remove this bugged desktop tooltip on mobile – it should not appear! See `mobile_diagram_desktop_tooltip_error.png` for this error.

## Diagrams design:
Remove the box below the skull diagram with the text "Reference image supplied by Rasmus". It just wastes space. Additionally, reduce the amount of black empty space in the diagrams. For example:

* Lateral skull: large empty space below the skull. Remove this by making the aspect ratio more wide (crop in from the bottom).
* Dorsal and ventral skull: large empty space to the sides of the skulls. Remove this by making the aspect ratio more tall (crop in from the sides).
* Canine teeth: large empty space to the sides of the teeth. Remove this by making the aspect ratio more tall (crop in from the sides).

## Diagrams layout:
The dorsal skull diagram is the most important diagram, yet it is the smallest together with the ventral diagram when viewed on wide desktop (i.e. where they are both on the same row).

One solution could be to rotate the dorsal and ventral skull by 90 degrees counter-clockwise, so they become horizontally like the lateral mandible and skull diagrams. You just have to make sure to also rotate the numbers back individually so that they are oriented correctly while still being matched to correct measurement lines.

Another quick solution: after making the diagrams more narrow by removing the empty space to the sides, you now have room to increase the size of the diagrams – just make sure that the skull diagram still can be viewed fully in the viewport.

Additionally, please move the dorsal and ventral diagrams to the first row, because they are more informative than the lateral skull image. The lateral skull image will be in the second row after these two.

### Mandibles and canines:
To save some of the vertical space, we should place the mandible and canine diagrams on the same row when there's room for this on the wide desktop view. To give more room for the mandibles, please crop in on the sides of the canine diagram (as mentioned earlier) so you remove some of the empty space, making the diagram aspect more narrow/tall. Please see the mockup in `mandible_canine_same_row_layout.png`.

## Measurement definitions table:
When clicking on the measurement number in the table, it just shows the same pop-up window as when clicking the numbers on the diagrams. This makes no sense because the exact same description is already in the table column 3!

A much better feature would be to make the skull diagram with the measurement pop up, where only the specific measurement is shown (i.e. all the other measurements are removed or greyed out). For measurement 1 and 2 that are repeated on two diagrams, please use the lateral skull diagram. Not sure if this is too much work, but it's definitely a better feature than the current redundant pop-up window.
