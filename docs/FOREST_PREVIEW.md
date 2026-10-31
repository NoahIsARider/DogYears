# DogYears: the complete forest interludes

Seven wordless pixel films now accompany the seven household chapters. Episodes one to six play after Sleep, before the next morning; episode seven plays before the ending. Their total running time is 8 minutes 54 seconds. The approved first fragment and its manual walking preview remain available at /forest.html. The complete review player is /interludes.html?chapter=2&reel=1.

## Seven movements

1. The trail (94 seconds): walking after rain, brushing wet leaves, examining old bootprints, calling into the forest and continuing without an answer.
2. The second place (72 seconds): an empty shelter, a familiar cup lifted and returned, another cup still on its side, a wait and departure.
3. An answer made of air (68 seconds): the familiar whistle disappears into a mist basin; rustling and reflected sound send the hunter back a few steps.
4. The same mark (68 seconds): the old tree and familiar tracks reappear. He checks the ground and leaves a small cloth mark rather than finding a companion.
5. Hold this end (78 seconds): he lifts the unsupported end of a loose board twice. Each time, withdrawing his hand lets it fall. He rests with his hand near the ground.
6. One small thing (76 seconds): he retrieves cord, raises the board and secures its end to the shelter post. On releasing it, the board remains. He turns the second cup upright before leaving.
7. The other side (78 seconds): he opens a woodland gate, waits, then walks beyond it. A grazing deer raises its head. They see each other, and the entire image freezes for the final six seconds. All house endings share this forest image; the house ending follows afterwards.

The episodes repeat objects and gestures with different outcomes. There is no explanatory dialogue, subtitle, chapter card or narrative paragraph in a film. A proposed active rifle animation was rejected by the image tool; no such asset or action is included. Signalling is carried by the approved whistle gesture and local sound design.

## In the game

The house fades to the forest directly, then returns to the next morning or ending. No chapter picker, title, sound button, replay button, cursor, counter or instructions appear during playback. Esc pauses; the only paused affordance is a small play icon. Holding Space for 1.2 seconds skips the current film, with a small line shown only while held. Keyboard input is captured so E, R and phone keys cannot affect the house underneath.

The player follows the house volume and mute settings. Wind, rain, cloth, cup contact, board impact, cord handling and gate movement are local synthesized sounds. The forest owns its own audio context, which pauses with the film; household sound is muted and the 3D renderer rests until return.

A transition is saved before playback starts. Its episode, target and elapsed time are saved approximately once per second. Reopening the game resumes the pending film before advancing the day. Completion clears the pending record, appends the episode to the seen list and advances the house in one saved state. Legacy saves gain empty optional interlude fields; their memories and decisions remain intact.

## Art and coordinates

Native frame: 480×270. Shared palette: 48 colours. Walking floor: y=216 everywhere. Integer nearest-neighbour display scaling preserves the pixels. The approved hunter uses forty frames registered in 48×64 cells: walking, idle, reaching, looking back, crouching, studying, rising and calling. Cup and cord props follow the corresponding hand gestures.

Three original long forest environments are 1584×270 each. Independent tree, shelter, post, gate, bench, cup, tin, cloth and timber sprites provide overlap and distinct landmarks. All rooted objects and the painted ground use exactly the same camera translation; only mist, falling water and actively handled objects move relative to the ground. A small gate leaf opens at a fixed hinge; the posts remain planted.

The board is sized for the hunter's reach. Its far end rests at a post, its near end meets the hand, and dropping accelerates into a short impact. In the sixth film the cord remains attached after the hand withdraws. Earlier oversized supporting stones were removed during the visual review. The tin was moved inside the bench edge, and a CSS hidden-state issue that left the pause icon over playing footage was corrected.

Small birds and rabbits appear quietly in the backgrounds, with their feet registered to the same world coordinates as the scenery. The final deer uses four registered full-body poses. The final still freezes the camera, hunter, deer, rain and mist together, without explanatory text. Wildlife sources and prompts are in reference/forest/wildlife, processed by tools/build_wildlife.mjs. The transparent desktop icon reuses the final left-facing full-body deer directly; tools/build_game_icon.mjs builds six ICO sizes without a rectangular background.

Original sources live under reference/forest/v2, reference/forest/v3 and reference/forest/saga. The new panorama and prop prompt set is reference/forest/saga/prompts.json. These assets were generated using built-in image_gen, then alpha-cleaned, extracted and palette-mapped by tools/build_forest_saga.mjs. Runtime assets are under public/forest/saga. Earlier source art and review recordings remain separate.

INDIKA was studied as a reference for deliberate pixel shapes, quiet tonal layers and readable small figures. No INDIKA asset is shipped:

- [Official Steam screenshots](https://store.steampowered.com/app/1373960/INDIKA/).
- [Official Nintendo screenshots](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/INDIKA-2943310.html).
- [Dmitry Svetlov interview](https://www.gamedeveloper.com/design/inside-indika-s-powerful-bleak-exploration-of-religion).

## Verification and recordings

- node --test tests/*.test.mjs covers the household story plus all seven forest timelines, continuous floor contact, valid poses, rooted coordinates, both board attempts, the successful tie, the final deer freeze, transparent ICO structure and transition save normalization.
- node tools/verify/verify_interludes.mjs captures twenty-three selected moments across all seven films and tests pause, skip, absence of visible text and root stability by comparing actual rendered pixels after a camera shift.
- node tools/verify/verify_interlude_flow.mjs exercises the real bed UI, all seven film transitions, muted playback, pause, skipping, reloading during a film, reloading after completion and the final ending. Its isolated fixture starts with household memories completed; it is an integration test, not a claim of replaying the unchanged twenty house memories.
- node tools/build/record_interludes.mjs records all seven running films at actual speed with audio. Individual MP4s and the complete reel are under deliverables/forest-saga. The export uses integer 4× scaling and entry/exit fades matching the game presentation.
- node tools/build/record_interludes.mjs --only 2 can replace the second episode recording after a visual refinement and rebuild the combined reel without replaying unrelated films.

node tools/build/record_wildlife_saga.mjs updates the six films containing wildlife at actual speed and retains the unchanged fifth film. It compares the last film's canvas pixels at seconds 72 and 77 to verify the freeze. node tools/verify/verify_wildlife_icon.mjs checks the visible deer, the wordless final image and icon transparency in the browser.

The current built game is under dist; tools/build/package_game.mjs includes all forest assets, transparent deer icons and both preview pages in release/DogYears.
