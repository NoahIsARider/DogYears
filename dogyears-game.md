# DogYears playable implementation

Authorized scope: refine the existing house and outdoor surroundings; correct chairs, cloth and material scale; replace model viewer with an English-only immersive first-person narrative game. Add seven-day object/memory/decision/sleep loop, phone, light changes, persistent saves and endings.

## Work

1. Asset pass in Blender: flatten repetitive bedding waves, remove displaced chair legs, build complete chairs, refine material texture scale, add lived-in decoration and layered garden. Export a new GLB without overwriting the previous source asset until validated.
2. Narrative module: deterministic, testable seven-day state, object-specific memories, three decisions, phone messages, save migration and five ending conditions.
3. Audio module: sparse procedural wind, room tone, footsteps, key/phone/cup cues, memory music; audio unlock and mute support.
4. Main integration: comfortable first-person navigation, raycast interactions, physical object inspection, playable memory actions, no website panels, small contextual hints, pause/settings, phone and sleep transitions. Daytime lighting follows narrative time.
5. Verification: state/endings unit tests, route collision checks, actual browser pointer lock and interaction tests, screenshots from each room and actual full-loop completion.

Deliverable is an original playable narrative game built around the existing DogYears concept, inspired by the environmental storytelling and quiet UI of narrative walking simulators. Do not claim equivalence to a studio production or a 4–5-hour finished commercial release.

## Narrative revision requested after the first playable loop

The user found the first loop emotionally thin and requested multiple script iterations, cinematic accumulation and better typography, followed by full player-view testing before delivery. Add seven authored daily chapters, twenty staged physical memories with evolving context, optional household discoveries, a concrete day-five failure / day-six request for help / day-seven act of holding the door, and a fuller phone thread. Daily progression must follow meaningful scene visits, not arbitrary waiting or repeated text. Resolved objects must remain playable as absence-memory anchors, so no prior object choice can soft-lock the narrative. Fonts will be bundled Cormorant Garamond and Mansalva with OFL licenses, not system UI text. The handwriting face replaced an earlier Caveat setting after the same line was rendered in each candidate inside the room.

Verification must rerun the expanded actual player path, test chapter progression and absence anchors, and inspect memory text legibility and scene pacing. The earlier eleven unit tests and full seven-day browser tests are baseline evidence, not validation of the new chapter implementation.

## Art and presentation overhaul

The user explicitly rejected the procedural-looking environment and fixed webpage-like narrative text. Replace foreground furniture/decor and material foundations with a cohesive curated set of artist-authored Poly Haven CC0 models and scanned PBR maps. Preserve original source files and story anchor coordinates. Deliver an immutable ArtPass GLB and matching Blender source, credit third-party art accurately. Real HDRI is for image-based lighting only, not a substituted background: the yard and distant landscape remain modeled.

Narrative text is now placed in three-dimensional space with parallax and depth occlusion; fixed mission paragraphs and the screen progress bar are removed. Settings and the phone retain functional menus. Validate the spatial text's readability and affordances, not only DOM content. Test any art substitution for scale, normals, contact shadows and interactions, then rebuild standalone output.
