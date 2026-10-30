# DogYears art and presentation review

The target is a lived-in house where afternoon light almost enters, interrupted by blinds, curtains and deep window reveals. Wear should suggest years of ordinary handling. It should not turn the house into a ruined or haunted building.

## Review rounds

1. Replaced foreground chairs, dining table, bedside furniture, reading sofa, cabinet, articulated lamp, books, kettle, clock, framed pictures and plants with a coordinated selection of artist-authored CC0 assets. Introduced scanned floor, plaster, linen, furniture timber and paint. First material renders exposed overly distressed plaster, incorrectly oriented throw pillows and furniture using floor-like texture scale.
2. Reduced plaster contrast and normal strength. Restored fitted bed pillows, used throw cushions on the sofa, separated furniture walnut and joinery oak from floor boards, and kept grain beneath cabinet paint restrained. Rebuilt the blue shirt with a hollow collar, collar points, cuffs, sleeves, pocket, placket, buttons, stitches and woven cloth. Only this garment belongs to the interactive keepsake; taking it leaves the surrounding clothes intact.
3. Replaced the waiting motif's thick circular geometry with a faint, irregular, transparent wear mark. The mark remains when the bowl is put away and casts no square shadow. Replaced the continuous ridge walls, rectangular stepping stones and synthetic near vegetation with rolling ground, irregular stone contours, artist tree geometry and distant woodland LODs. Removed the remaining pointed placeholder grass. Added a faded lake watercolor to the existing bedroom frame.
4. Reviewed the running game separately from Blender renders. Corrected texture export bindings, complete-page manuscript UVs, exterior batch bounds, leaf shadow cost and furniture collision footprints. Hero textures retain their detail while small props use smaller maps. Every exported texture is checked for a valid image binding.
5. The full playthrough exposed a weak hero prop: the unfinished miniature was only a skeletal outline. Rebuilt it as a detailed small replica, with timber framing, partial plaster, window casements, floor boards, skirting and a partly fitted roof. The central light opening and missing beam remain. Its animated door now follows packing and unpacking, including absence memories.

## Typography

Narrative lines use Mansalva, a dense crowded hand, in dark charcoal. A very restrained warm edge preserves the strokes against dark timber and foliage. Lines occupy world space near the current object or action, with depth occlusion and parallax. They are brief and replace one another. Chapter cards finish fading before the opening thought appears. No task paragraph or progress bar sits over the scene.

The pause/settings screens and phone retain functional interfaces. Their contents, like the rest of the game, are English. Font files and OFL licenses ship with the game.

## Inspection evidence

- `deliverables/art_kitchen_review1.png` and `art_kitchen_review2.png` document the material correction.
- `deliverables/art_bedroom_review2.png`, `art_shirt_review.png` and `art_pressure_mark_detail.png` document close object work.
- `deliverables/art_landscape_final_review.png` documents the revised terrain and path composition; the running-game garden screenshot supersedes it for delivery.
- `deliverables/art-checks/` contains actual gameplay room and handwriting screenshots, plus asset/interaction checks.
- `deliverables/story-checks/` contains the actual keyboard-walking, twenty-scene chapter playthrough.
- `deliverables/game-checks/performance.json` records the machine and frame-time samples. These are measurements on the development machine rather than a minimum-spec guarantee.

`THIRD_PARTY_ART.md` records model and material sources. Earlier review files remain preserved for comparison. The current runtime asset is the immutable `DogYears_ArtPass_Hero.glb`.
