// Authored scene direction lives here, away from menus and rendering code.
// A scene's duration describes an unhurried visit. Actions are short holds,
// separated by looking, moving a hand, or crossing a few steps of the room.
export const STORY_VERSION = 1;
const positions = {
  leash: [-.64, 1.25, 5.1], cups: [-3.35, 1.02, 5.37], calendar: [-1.3, 1.6, .12],
  pillow: [3.83, .85, 4.22], clothes: [4.5, 1.45, .65], model: [-4.8, 1, -2.8],
  letter: [-3.6, .85, -4.6], phone: [-3.98, .85, -4.5], bowl: [-.72, .1, -6.8],
};
const A = (id, label, task, duration, position, gesture, line, completionLine) => ({ id, label, task, duration, position, gesture, line, completionLine });
const B = (...lines) => lines.map((line, i) => ({ at: lines.length === 1 ? 0 : i / (lines.length - 1), line }));
const scene = (day, objectId, title, line, task, actions, beats, completionLine, aftermath, notes, duration = 80) => ({
  id: `${day}:${objectId}`, day, objectId, title, line, task, actions,
  actionLabel: actions[0].label, actionDuration: actions[0].duration, duration,
  beats, completionLine, aftermath, notes,
});

export const CHAPTERS = [
  {
    day: 1, title: 'Before the light changes',
    opening: 'I left the latch loose. Ellis always had too much in their hands.',
    required: ['leash', 'cups'], sceneKeys: ['1:leash', '1:cups'],
    restLine: 'The kettle is cold now.', restHint: 'I could leave the rest until morning.',
    environmental: ['The front latch has not clicked fully shut.', 'Two cups wait inside two old rings.', 'The second chair is pulled back by a few inches.'],
    sound: 'A radiator cools. Once, its click resembles a key.',
    purpose: 'Teach touching, remembering and setting down. The player performs an intact routine before noticing the missing answer.',
  },
  {
    day: 2, title: 'The space beside you',
    opening: 'I woke on my own side again.',
    required: ['pillow', 'clothes', 'calendar'], sceneKeys: ['2:pillow', '2:clothes', '2:calendar'],
    restLine: 'The clean case can stay folded tonight.', restHint: 'There is room to lie down.',
    environmental: ['An opened window moves one cuff, not the whole wardrobe.', 'A clean pillowcase lies within reach.', 'The calendar lifts enough to show another month.'],
    sound: 'Cloth rubbing against cloth; the wardrobe door settles without latching.',
    purpose: 'Replace an abstract absence with mismatched habits: two sides of a bed, one caught cuff and a date with no plan written down.',
  },
  {
    day: 3, title: 'An ordinary morning',
    opening: 'I had been annoyed about the table.',
    required: ['cups', 'letter', 'leash'], sceneKeys: ['3:cups', '3:letter', '3:leash'],
    restLine: 'That was the whole morning. Nothing had warned us.', restHint: 'The table does not need clearing tonight.',
    environmental: ['A cup turns to reveal a repaired chip.', 'The letter underneath the plans is a shopping list.', 'A shoe has a flattened heel where Ellis stepped into it.'],
    sound: 'A chair briefly scrapes in the remembered room. Nobody is revealed behind it.',
    purpose: 'Let irritation and affection coexist. The final exchange stays mundane; no blame, premonition or concealed cruel confession.',
  },
  {
    day: 4, title: 'Small enough to carry',
    opening: 'The little house has our crooked door.',
    required: ['calendar', 'clothes', 'model'], sceneKeys: ['4:calendar', '4:clothes', '4:model'],
    restLine: 'I found the piece. I can try tomorrow.', restHint: 'Leave the plans somewhere the light can reach.',
    environmental: ['The calendar page becomes a paper roof pattern.', 'Sawdust is caught in a shirt cuff.', 'The miniature door catches in exactly the same place as the real one.'],
    sound: 'A loose model door taps against its frame, answered much later by the real door.',
    purpose: 'Reveal that the project was a way to bring the current home into a possible future, not a test the survivor must pass.',
  },
  {
    day: 5, title: 'Hold this end',
    opening: 'I thought finishing it would change the room.',
    required: ['letter', 'model', 'pillow'], sceneKeys: ['5:letter', '5:model', '5:pillow'],
    restLine: 'The roof can rest against the frame.', restHint: 'You do not have to keep holding it.',
    environmental: ['The roof beam is balanced, then deliberately rested.', 'A pin rolls only a short way; it is never lost.', 'The mattress takes the weight of a seated person.'],
    sound: 'The single remembered phrase stops halfway through its second repetition. Then room tone returns.',
    purpose: 'The climax is a failed repetition of companionship, not a difficult construction puzzle. Nothing shatters and progress is not punished.',
  },
  {
    day: 6, title: 'One small thing',
    opening: 'Mara asked what she could bring. I finally knew.',
    required: ['model', 'bowl', 'cups'], sceneKeys: ['6:model', '6:bowl', '6:cups'],
    restLine: 'Tomorrow. After the light reaches the door.', restHint: 'Leave the phone face up.',
    environmental: ['A folded scrap supports the beam while the player writes.', 'The bowl moves out of the doorway.', 'Two cups are prepared deliberately for two living people.'],
    sound: 'One actual phone vibration, recognisably different from a remembered key.',
    purpose: 'Make asking specific and practical. Mara is allowed to help without becoming a replacement for Ellis or a cure for grief.',
  },
  {
    day: 7, title: 'The other side',
    opening: 'There is someone at the door. They have knocked only once.',
    required: ['pillow', 'leash', 'bowl'], sceneKeys: ['7:pillow', '7:leash', '7:bowl'],
    restLine: 'This afternoon can become evening.', restHint: 'The key is yours to turn.',
    environmental: ['The bed is left imperfectly made.', 'The player takes one key, leaving the others on their dish.', 'A second shadow stops outside the threshold; no character is shown.'],
    sound: 'An ordinary outside breath, a cloth bag lowered onto boards, then the latch.',
    purpose: 'Invert the first day: instead of leaving the latch loose for the dead, hold the door for someone who has arrived.',
  },
];

export const SCENES = {
  '1:leash': scene(1, 'leash', 'The loose latch',
    'Ellis could find this hook without switching on the light.',
    'Lift the loop, then feel the latch.', [
      A('loop', 'Lift the loop', 'Follow the worn part with your thumb.', 7, positions.leash, 'lift', 'The leather is smooth only here.', 'A pale patch remains beneath it.'),
      A('latch', 'Touch the latch', 'Let it settle without closing the door.', 7, [0, 1.05, 5.9], 'place', 'I left it loose that morning.', 'It almost sounds like a key.'),
    ], B('“Leave it. I have the boxes.”', 'Ellis said this about one bag of groceries.', 'They always counted the awkward things as boxes.', 'I kept the door with my heel.', 'I expected their hand on the other side.', 'I still leave the latch like that.'),
    'The hook is cool where the strap was.',
    'The front latch gives one quiet click; there is no approaching footstep.',
    'Keep the remembered delivery warm and unimportant. The last beat lands in present tense only after the latch fails to answer.', 70),

  '1:cups': scene(1, 'cups', 'Two circles',
    'The kettle has enough water for both of us.',
    'Set out the cups in their old places.', [
      A('first-cup', 'Turn the handle', 'Put the handle where Ellis reached for it.', 7, positions.cups, 'turn', 'Left hand. Every time.', 'The handle faces the empty place.'),
      A('second-cup', 'Set down the second cup', 'Place your cup beside the first.', 8, [-3.06, 1.02, 5.5], 'place', 'Mine had the small chip.', 'Neither cup is steaming.'),
    ], B('I used to fill mine first.', 'Ellis said that was because I never waited for the kettle.', 'Then they drank theirs colder than I did.', 'There are two circles in the wood.', 'I can find them without looking.', 'The kettle has stopped. It has been stopped for days.'),
    'You hear the base of the cup touch the counter.',
    'The remembered kettle disappears beneath the real radiator. Keep the second chair slightly out.',
    'The scene teaches the difference between hearing a memory and waiting for an actual answer. Do not add a ghost, face or explanatory death line.', 76),

  '2:pillow': scene(2, 'pillow', 'Your side',
    'I woke on the edge. The rest of the bed was empty.',
    'Feel the hollow, then unfold the clean case.', [
      A('hollow', 'Rest your hand', 'Let the pillow take the shape of your palm.', 8, positions.pillow, 'smooth', 'This hollow is not a face.', 'It rises more slowly than you expect.'),
      A('case', 'Unfold the spare case', 'Smooth one fold and leave the other.', 7, [3.35, .86, 2.7], 'fold', 'The clean one has been here since Monday.', 'You do not put it on yet.'),
    ], B('Ellis folded the cold side underneath.', 'I shook the whole pillow until they complained.', 'On winter mornings we argued about the window.', 'They won. I borrowed their sleeve.', 'I have been keeping my hand here.', 'The cloth has warmed. That is my hand doing it.'),
    'The hollow remains, a little less exact.',
    'A window breathes against the curtains. Leave the spare case folded, not magically applied.',
    'The last beat does not invalidate comfort. It gently distinguishes a physical present sensation from the presence the player longs for.', 82),

  '2:clothes': scene(2, 'clothes', 'The caught sleeve',
    'One sleeve has been trapped behind the others.',
    'Free the cuff and straighten the hanger.', [
      A('cuff', 'Free the sleeve', 'Draw the cuff out slowly.', 8, [4.5, 1.25, .65], 'fold', 'There is a thread around the button.', 'The sleeve hangs on its own.'),
      A('hanger', 'Straighten the hanger', 'Give the shirt room on the rail.', 6, [4.5, 1.94, .65], 'place', 'Ellis called this the good shirt.', 'The hanger stops against another one.'),
    ], B('It was never quite dry at the cuffs.', 'They wore it anyway.', '“Does this look all right?”', 'I said yes from the next room.', 'I knew which shirt they meant.', 'I wish I had looked. I did know, though.'),
    'The button is an ordinary, slightly different blue.',
    'A weak movement of air lifts only the freed cuff. No silhouette fills the shirt.',
    'Do not turn an ordinary distracted reply into guilt. The final qualification is essential: intimacy also means knowing without looking.', 74),

  '2:calendar': scene(2, 'calendar', 'Saturday',
    'There is no plan written inside the circle.',
    'Trace the date and lift the page.', [
      A('circle', 'Trace the pencil mark', 'Follow the point where the circle does not quite meet.', 7, positions.calendar, 'trace', 'Ellis always left a gap.', 'The pencil has dented the paper underneath.'),
      A('page', 'Lift the corner', 'Look at the next month without turning over.', 7, [-1.33, 1.45, .12], 'fold', 'November is waiting underneath.', 'The page drops back into October.'),
    ], B('“Keep that Saturday free.”', '“For what?”', '“You will see.”', 'I put the circle there myself.', 'It is tempting to call every empty space an answer.', 'Perhaps we had only meant to go somewhere.'),
    'The date remains a date.',
    'Light catches the impression in the next sheet before the old page falls.',
    'This is an invitation to wonder, not a mystery with a hidden solution. No later reveal should convert the Saturday into a prediction.', 72),

  '3:cups': scene(3, 'cups', 'The table',
    'I had wanted the plans off the table.',
    'Turn the chipped cup, then pull the chair clear.', [
      A('chip', 'Turn the chipped rim', 'Find the old repair beneath your finger.', 7, positions.cups, 'turn', 'They fixed this long before the little house.', 'The repair has held.'),
      A('place', 'Set down the cup', 'Leave a place clear on the table.', 8, [-3.10, .85, 2.5], 'place', '“Can we have the table back?”', 'The cup finds a level place.'),
    ], B('The plans had been there for three weeks.', 'I could not put a plate down flat.', 'Ellis said, “After this piece.”', 'I said, “You said that yesterday.”', 'Then they moved the plans and poured the coffee.', 'That was our argument. Neither of us stormed out.'),
    'The cup sits flat now. The room has not changed.',
    'Use one small remembered chair scrape. Do not swell music around the argument.',
    'The player is allowed to have been annoyed. A credible relationship has practical friction that does not need forgiveness manufactured by a death.', 86),

  '3:letter': scene(3, 'letter', 'Milk',
    'The unfinished letter was underneath a shopping list.',
    'Unfold the page and move the list into the light.', [
      A('fold', 'Unfold the page', 'Keep the old crease between your fingers.', 8, positions.letter, 'fold', 'I thought there might be an explanation.', 'There is a comma. Then nothing.'),
      A('list', 'Move the loose slip', 'Lay the small page where you can read it.', 6, [-3.45, .86, -4.6], 'place', 'Milk. Lamp bulb. Little brass pins.', 'The last item has been crossed out.'),
    ], B('I keep looking for a final sentence.', 'Something that knew what was coming.', 'Ellis had been making a list.', 'I added milk while they found their coat.', 'The letter could have waited until evening.', 'We both thought there would be an evening.'),
    'You leave the list beside the letter.',
    'The loose page has everyday pencil marks, not a long readable exposition panel.',
    'A possible letter to a supplier, friend or relative remains unfinished. Do not invent a farewell from Ellis or make the shopping list ominous.', 84),

  '3:leash': scene(3, 'leash', 'The last ordinary thing',
    'There is a crease in the back of one shoe.',
    'Set the shoe upright, then turn the loose key.', [
      A('shoe', 'Set the heel upright', 'Ease the folded leather back into shape.', 7, [-.57, .17, 5.4], 'smooth', 'Ellis never stopped to undo the laces.', 'The heel will not quite straighten.'),
      A('key', 'Turn the spare key', 'Let it turn once in your palm.', 8, [.55, .85, 5.13], 'turn', '“Did you take your keys?”', '“In my pocket.”'),
    ], B('They came back once for the small bag.', 'I was already looking at the kettle.', '“Milk, if you remember.”', '“If I remember.”', 'I laughed at that.', 'The last thing I gave them was a laugh.'),
    'You do not have to search for a better last line.',
    'Let the remembered laugh be a breath, not a recorded performance that tells the player how to feel.',
    'This revises the player’s imagined last conversation without a twist. The morning contained affection; it also contained dishes and a mildly irritating table.', 90),

  '4:calendar': scene(4, 'calendar', 'The pattern',
    'The roof pattern is on the back of an old calendar page.',
    'Turn the scrap over and unfold its pencilled edge.', [
      A('back', 'Turn the loose page', 'Find the pencil line on the unprinted side.', 7, positions.calendar, 'turn', 'Ellis never used a new sheet if an old one had a back.', 'The outline is a roof.'),
      A('pattern', 'Open the folded edge', 'Match the two pencil marks.', 8, [-1.3, 1.48, .12], 'fold', 'The line goes wrong here.', 'They drew another line beside it.'),
    ], B('We had talked about moving.', 'Not because we hated the house.', 'Because the kitchen was small. Because we might.', 'I said I would miss the crooked door.', 'Ellis began measuring it that afternoon.', 'I had thought they were finally going to fix it.'),
    'The miniature has the same crooked door.',
    'Connect this paper to the already visible model; do not replace the calendar in a way that contradicts a prior release decision.',
    'If the calendar is gone, let the player find the detached pattern beneath it or in a drawer. Ownership and access to a memory are separate.', 88),

  '4:clothes': scene(4, 'clothes', 'Sawdust',
    'Something pale is caught in the cuff.',
    'Open the cuff and brush the small shaving onto your palm.', [
      A('button', 'Undo the cuff', 'Turn the button through its worn hole.', 7, [4.5, 1.25, .65], 'turn', 'This button has been sewn on twice.', 'A little curl of wood falls free.'),
      A('shaving', 'Catch the shaving', 'Cup your hand beneath the open sleeve.', 7, [4.5, 1.18, .65], 'lift', 'It is lighter than a fingernail.', 'You can still smell the cut wood.'),
    ], B('They worked with their sleeves rolled up.', 'Then forgot to roll them down.', 'I found shavings in the washing.', 'Ellis said the house was shedding.', 'There had been a door hidden in the cuff.', 'Not a message. Just a piece of what they were doing.'),
    'The shaving uncurls when you let it go.',
    'A small real piece of wood is a better reveal than a glowing letter. If the shirt has gone, use a shaving caught on the shelf beneath it.',
    'The moment connects intimacy and craft through touch. It gives the model emotional history without pretending every leftover object was deliberately left for the player.', 78),

  '4:model': scene(4, 'model', 'Our crooked door',
    'Ellis measured the part that never closed properly.',
    'Open the miniature door and lift the loose roof beam.', [
      A('door', 'Open the little door', 'Let it catch against its frame.', 8, [-4.8, .94, -2.55], 'door', 'It catches here too.', 'They made it like that on purpose.'),
      A('beam', 'Lift the loose beam', 'Find the two small pin holes.', 8, positions.model, 'lift', 'The piece is already cut.', 'It fits. It needs holding.'),
    ], B('“Why keep the part that is wrong?”', '“It is our door.”', 'I had forgotten saying I would miss it.', 'Ellis had not.', 'A house small enough to carry, if we went.', 'The roof comes off. They wanted the light to get in.'),
    'You put the beam down beside the open house.',
    'Open the roof enough that window light reaches the miniature floor. Avoid a magical full-size room transformation.',
    'This is the recontextualisation, not the climax. The object is affectionate and imperfect. Completion remains optional after the story’s essential physical gesture.', 98),

  '5:letter': scene(5, 'letter', 'No instructions',
    'The pencilled measurements stop halfway down the page.',
    'Flatten the plan and place the pin beside its mark.', [
      A('plan', 'Flatten the plan', 'Hold the crease until you can see both measurements.', 8, positions.letter, 'smooth', 'I know what this number means now.', 'The second number is not written down.'),
      A('pin', 'Place the brass pin', 'Leave it beside the roof outline.', 7, [-3.3, .86, -4.6], 'place', 'The pins are smaller than I remembered.', 'One is enough to start.'),
    ], B('I wanted a list of things to do.', 'A clear order. A final step.', 'Ellis did not leave one.', 'They had expected to be here for the next measurement.', 'I have been reading the unfinished parts as instructions.', 'They were only unfinished.'),
    'You take the loose plan to the model.',
    'The next action is an invitation across the study, not a locked puzzle that requires finding a tiny item.',
    'Acknowledge the impulse to turn grief into a task list. Do not have the narrator ridicule it. The player still has the small, practical task available.', 84),

  '5:model': scene(5, 'model', 'The other end',
    'I know where the beam goes.',
    'Hold the beam, try the pin, then let the wood rest.', [
      A('hold', 'Hold this end', 'Keep the beam against the far notch.', 9, [-4.8, 1.1, -2.8], 'lift', '“Hold this end.”', 'The two holes almost meet.'),
      A('pin', 'Try the pin', 'Ease the pin toward the nearer hole.', 10, [-4.65, 1.13, -2.8], 'brace', 'Your other hand is still holding the beam.', 'The far end slips a little.'),
      A('rest', 'Let it rest', 'Lower the beam onto the folded plan.', 8, [-4.8, .88, -2.8], 'release', 'There is no need to catch it in the air.', 'Nothing has broken.'),
    ], B('“Hold this end.”', 'I have held it here before.', 'There was a small pause before Ellis said, “Got it.”', 'I keep leaving room for that pause.', 'The timber needs a clamp. I know that.', 'I could make a support.', 'I wanted them to say, “Got it.”'),
    'You lower the beam. The room continues around you.',
    'The pin rolls a few centimetres and stops in sight. The task completes when the player rests the beam, not when they prove they can endure holding.',
    'This is the principal climax. Do not make carpentry logically impossible: a brace would work. The failure is trying to reproduce the exact two-person gesture. No object breaks, no progress is lost, and no choice is marked wrong.', 112),

  '5:pillow': scene(5, 'pillow', 'Sitting down',
    'The bedroom is the nearest place to sit.',
    'Set the clean case down and let the bed take your weight.', [
      A('case', 'Set the folded case down', 'Leave it within reach.', 6, [3.35, .86, 2.7], 'place', 'I brought this in yesterday.', 'It can wait.'),
      A('edge', 'Rest your hand on the bed', 'Stay until the mattress stops moving.', 9, [3.7, .76, 3.7], 'smooth', 'There is enough room to sit.', 'The room does not ask anything else of you.'),
    ], B('I thought I would feel better when it was finished.', 'Then I could put it somewhere.', 'Then I could clear the table.', 'Then perhaps I could stop expecting something.', 'The pillow is cool again.', 'I sit until that stops being the thing I am measuring.'),
    'For a little while, there is only the house settling.',
    'Reduce the music to room tone before the last line. Give the player a genuine quiet interval rather than an immediate notification.',
    'This is the release after the climax, not a motivational speech. Mara’s offer should arrive later, once the player has had space to stop performing a task.', 92),

  '6:model': scene(6, 'model', 'One small thing',
    'Mara asked what she could bring.',
    'Prop the beam, photograph the opening, and send a small request.', [
      A('support', 'Fold a little support', 'Put the paper beneath the loose beam.', 8, [-4.8, .89, -2.8], 'brace', 'It stays without either of us.', 'There. A support.'),
      A('photograph', 'Frame the open roof', 'Include the two small pin holes.', 7, [-4.8, 1.04, -2.8], 'trace', 'I do not need to explain the whole house.', 'The picture is a little crooked.'),
      A('request', 'Send the photograph', 'Send: “Could you hold this while I fit the pin?”', 8, positions.phone, 'send', 'Not “I am fine.” Not this time.', 'Sent. You leave the screen facing up.'),
    ], B('The clamp would work.', 'Mara has one. So do the neighbours.', 'This is not really about the clamp.', 'I take the photograph before I can tidy the table.', '“Could you hold this while I fit the pin?”', 'It is a small enough thing to ask.', 'It is not a small thing to me.'),
    'The roof is still open. The message has left the phone.',
    'Do not immediately repair the roof by magic or imply that asking for help replaces Ellis. The useful change is the sent message and a beam that can now rest.',
    'The authored outgoing message is triggered by the final action, independently of optional free-text phone replies. Mara’s accepting reply unlocks after this scene key.', 102),

  '6:bowl': scene(6, 'bowl', 'A clear doorway',
    'The bowl is exactly where a foot would go.',
    'Empty the last water and move the bowl beside the threshold.', [
      A('water', 'Tip the old water', 'Pour it into the pot beside the door.', 8, positions.bowl, 'turn', 'The surface moves before you do.', 'A little water reaches the dry soil.'),
      A('space', 'Make a clear space', 'Set the bowl where nobody will step on it.', 8, [-.9, .12, -7.15], 'place', 'Someone will come through here.', 'The worn circle is still visible.'),
    ], B('I thought it was a saucer.', 'Perhaps that is what we used it for.', 'I kept filling it after the soil was wet.', 'There was always something to keep ready.', 'Today I move it out of the way.', 'The circle does not move with it.'),
    'There is room for another pair of shoes.',
    'Preserve the ambiguity of the dog motif. Never add a bark, canine shadow, pet photograph or explanatory collar.',
    'The player makes practical room for a visitor without erasing the trace. If the bowl was released, use its remaining circle and a small saucer from the shelf.', 82),

  '6:cups': scene(6, 'cups', 'Two people',
    'I take down two cups on purpose.',
    'Rinse the good cup and leave the other place clear.', [
      A('rinse', 'Rinse the good cup', 'Turn the rim under the tap.', 8, [-4.12, 1.04, 5.48], 'turn', 'Mara takes hers without sugar.', 'You remembered.'),
      A('place', 'Set a place for Mara', 'Put the cup where a hand can reach it.', 8, [-3.1, .85, 2.5], 'place', 'This cup is for tomorrow.', 'The chair has room to move.'),
    ], B('For days, two cups meant the same impossible thing.', 'This one is for Mara.', 'This one is for me.', 'I know which one Ellis would have taken.', 'I can know that too.', 'I leave the milk where someone else can find it.'),
    'You do not pour the coffee yet.',
    'If a cup was carried or released, show a plain spare from the shelf. Do not restore the disposed keepsake; intention is expressed through a different cup.',
    'This scene is the small positive turn after the climax. Preserve the specific domestic act. Avoid a sweeping line about moving on or finally choosing life.', 90),

  '7:pillow': scene(7, 'pillow', 'Leave it imperfect',
    'The light reaches the bed before I get up.',
    'Smooth one side and leave the folded case at the foot.', [
      A('side', 'Smooth your side', 'Draw the cover toward the edge.', 8, [2.88, .78, 3.9], 'smooth', 'I do not have to make both sides the same.', 'One corner is still crooked.'),
      A('case', 'Set the clean case down', 'Leave it where you can find it tonight.', 7, [3.35, .76, 2.7], 'place', 'Tonight is a useful word.', 'You leave the room before it is perfect.'),
    ], B('The clean case is still here.', 'Some things have taken a week.', 'Some things will take longer.', 'I do not put a date on those.', 'I will need somewhere to sleep tonight.', 'I leave the bed ready for that.'),
    'The other pillow is allowed to keep its shape.',
    'Do not make a pristine, symmetric bed or replace all grief objects with empty space. Evening and sleep have become possible future actions.',
    'If the pillow is already packed, the bare mattress seam provides the same anchor. A memory does not require possession of the original object.', 78),

  '7:leash': scene(7, 'leash', 'My key',
    'The latch no longer needs to be left loose.',
    'Take your key and let the front latch close.', [
      A('key', 'Take one key', 'Leave the others on the dish.', 8, [.55, .85, 5.13], 'lift', 'This is the one I keep losing.', 'It is warm before you pocket it.'),
      A('latch', 'Let the latch settle', 'Hold the door until it clicks shut.', 8, [0, 1.05, 5.9], 'release', 'I can open it when I come back.', 'The click is only a click.'),
    ], B('I have listened to this lock all week.', 'I could hear the key before it turned.', 'Sometimes before there was a key.', 'Today it is in my pocket.', 'I do not need to leave the door waiting.', 'Ellis knew how to get home. So do I.'),
    'You take your hand away from the latch.',
    'The strap may stay, be packed or be absent. The action belongs to the actual key and latch now, so no prior keepsake decision blocks it.',
    'Use the sound established on the first day, with the same recording and no sting. Its meaning changes because the player causes it.', 86),

  '7:bowl': scene(7, 'bowl', 'Hold the door',
    'Mara has stopped on the other side of the threshold.',
    'Notice the old circle, then hold the door for someone living.', [
      A('circle', 'Touch the worn board', 'Follow the edge of the pale circle once.', 7, [-.65, .04, -7.4], 'trace', 'Something has rested here for a long time.', 'The grain continues through the mark.'),
      A('door', 'Hold the door', 'Keep the door open while the bag is set down.', 10, [0, 1.05, -6.05], 'door', '“Which end?”', '“This one.”'),
    ], B('The boards sound different under another weight.', 'Mara sets the bag down instead of handing it to me.', 'She has brought the clamp anyway.', 'I begin to explain.', 'She says, “Show me.”', '“Could you hold this end?”', '“Got it.”'),
    'For a moment, neither of you moves. Then the afternoon continues.',
    'Keep Mara outside the frame: a grounded bag sound, a second still shadow and the door’s resistance are enough. The roof need not be shown finished.',
    'This is the final role reversal and the answer to day five. Let the player keep holding the door after completion. Ending choices follow only after they release it, with no forced triumphant exit.', 108),
};

// Optional discoveries never unlock a chapter or award counter points.
// A single sentence is presented at the object, then the player keeps walking.
export const DISCOVERIES = [
  { id: 'glasses', day: 1, title: 'Reading glasses', position: [4.77, .69, 4.12], meshPrefixes: ['Reading glasses'], line: 'One arm has been tightened with a different screw.' },
  { id: 'alarm', day: 1, title: 'Two alarms', position: [1.75, .75, 4.04], meshPrefixes: ['Alarm |'], line: 'Mine was seven. Ellis always asked for five more minutes.' },
  { id: 'shoes', day: 1, title: 'The shoes', position: [-.57, .12, 5.4], meshPrefixes: ['Leather shoes', 'Shoes |'], line: 'The left heel has been stepped on more often.' },
  { id: 'dish', day: 1, title: 'The key dish', position: [.55, .84, 5.13], meshPrefixes: ['Key dish'], line: 'We bought it for olives. It never held an olive.' },
  { id: 'jar', day: 1, title: 'The tea jar', position: [-4.8, 1.81, 5.8], meshPrefixes: ['Shelf | lidded'], line: 'There is a second label beneath the one that says TEA.' },
  { id: 'sill', day: 2, title: 'The window ledge', position: [-5.39, .94, 3.5], meshPrefixes: ['Window | deep oak sill'], line: 'Ellis marked the pot’s place so its shadow would miss the chair.' },
  { id: 'book', day: 2, title: 'The folded corner', position: [4.84, .71, 3.99], meshPrefixes: ['Book | cloth cover'], line: 'They stopped at the beginning of a sentence, not the end of a chapter.' },
  { id: 'drawer', day: 2, title: 'The drawer', position: [.57, .65, 5.2], meshPrefixes: ['Console drawer'], line: 'It opens if you lift the right side first.' },
  { id: 'hem', day: 2, title: 'The blanket hem', position: [3.35, .76, 2.51], meshPrefixes: ['Throw | knotted fringe'], line: 'The short fringe is where I cut a knot instead of unpicking it.' },
  { id: 'chair', day: 3, title: 'The kitchen chair', position: [-3.35, .55, 3.4], meshPrefixes: ['Chair |'], line: 'A felt pad is missing. We knew that sound before we knew who was sitting down.' },
  { id: 'board', day: 3, title: 'The cutting board', position: [-1.83, .97, 5.46], meshPrefixes: ['Cutting board'], line: 'One corner is dark from the time we used it under a hot pan.' },
  { id: 'cup-repair', day: 3, title: 'The repaired rim', position: [-3.06, 1.04, 5.5], meshPrefixes: ['Cup |'], line: 'The glue has lasted longer than either of us expected.' },
  { id: 'list', day: 3, title: 'The crossed-out item', position: [-3.45, .87, -4.6], meshPrefixes: ['Letter |'], line: 'The pins were already in the small drawer.' },
  { id: 'window', day: 4, title: 'The loose window', position: [5.35, 1.65, 3.5], meshPrefixes: ['Window | mullion'], line: 'The folded paper in the frame is a receipt from a place that has closed.' },
  { id: 'tools', day: 4, title: 'The pencil stub', position: [-2.55, .95, -4.51], meshPrefixes: ['Pencil |'], line: 'Ellis kept sharpening this after it had become difficult to hold.' },
  { id: 'photograph', day: 4, title: 'The empty landscape', position: [3.35, 1.92, 5.94], meshPrefixes: ['Bedroom | empty landscape'], line: 'The rain arrived just after this. We only talk about the rain.' },
  { id: 'pattern', day: 4, title: 'The small measurements', position: [-3.6, .87, -4.6], meshPrefixes: ['Unfinished letters'], line: 'The width of the crooked door has been measured three times.' },
  { id: 'pin', day: 5, title: 'The brass pin', position: [-4.65, .9, -2.85], meshPrefixes: ['Workshop | loose timber'], line: 'It has not rolled far. You do not have to search the whole room.' },
  { id: 'lamp', day: 5, title: 'The shade', position: [-4.45, 1.15, -4.8], meshPrefixes: ['Lamp | pleated'], line: 'A pale rectangle remains where the old price tag shielded it from the sun.' },
  { id: 'scuff', day: 5, title: 'The floor mark', position: [-3.5, .04, -3.8], meshPrefixes: [], line: 'The chair has found this place thousands of times.' },
  { id: 'pot', day: 6, title: 'The dry pot', position: [1.5, .18, -7.4], meshPrefixes: ['Terracotta pot'], line: 'The soil darkens unevenly. It has needed this for a while.' },
  { id: 'spare-cup', day: 6, title: 'A plain cup', position: [-3.1, .86, 2.5], meshPrefixes: ['Plate |'], line: 'Mara will not know which cups used to be the good ones.' },
  { id: 'support', day: 6, title: 'The paper support', position: [-4.8, .91, -2.8], meshPrefixes: ['Model |'], line: 'A temporary support is still a support.' },
  { id: 'threshold', day: 7, title: 'The threshold', position: [0, .04, -6.2], meshPrefixes: ['Porch | floor'], line: 'The board is worn on both sides of the door.' },
];

export const STORY_MESSAGES = [
  { id: 'ellis-keys-you', day: 1, from: 'You', time: 'Friday · 08:12', kind: 'old', text: 'Did you take your keys?' },
  { id: 'ellis-keys', day: 1, from: 'Ellis', time: 'Friday · 08:14', kind: 'old', text: 'In my pocket. Back before the light changes.' },
  { id: 'mara-1', day: 1, from: 'Mara', time: 'Monday', kind: 'living', text: 'I left bread on the step. You do not need to answer.' },
  { id: 'ellis-window', day: 2, from: 'Ellis', time: 'October 11', kind: 'old', text: 'Leave the window a little open. My shirt is still damp.' },
  { id: 'mara-2', day: 2, from: 'Mara', time: 'Tuesday', kind: 'living', text: 'The plate under the bread is yours. Keep it there if you want more tomorrow.' },
  { id: 'ellis-saturday', day: 3, from: 'Ellis', time: 'October 12', kind: 'old', text: 'Keep Saturday free. Nothing grand. Bring a coat.' },
  { id: 'ellis-milk', day: 3, from: 'You', time: 'Friday · Draft', kind: 'old', text: 'Milk, if you remember.' },
  { id: 'mara-3', day: 3, from: 'Mara', time: 'Wednesday', kind: 'living', text: 'I found the lid to the blue tin. I will put it with the bread, not ring.' },
  { id: 'ellis-model', day: 4, from: 'You', time: 'October 15', kind: 'old', text: 'You even kept the bit of door that catches.' },
  { id: 'ellis-door', day: 4, from: 'Ellis', time: 'October 15', kind: 'old', text: 'Otherwise how would we know it was ours?' },
  { id: 'mara-4', day: 4, from: 'Mara', time: 'Thursday', kind: 'living', text: 'I still have the little clamp you lent me. Say if you need it. Or anything else.' },
  { id: 'mara-5', day: 5, from: 'Mara', time: 'Friday', kind: 'living', text: 'I can come by tomorrow. We can do one ordinary thing, if that would help.' },
  { id: 'you-help', day: 6, requires: '6:model', from: 'You', time: 'Sent', kind: 'living', text: 'Could you hold this while I fit the pin? Tomorrow is all right.' },
  { id: 'mara-help', day: 6, requires: '6:model', from: 'Mara', time: 'Saturday', kind: 'living', text: 'Yes. Tell me which end. I will bring the clamp anyway.' },
  { id: 'mara-arrival', day: 7, from: 'Mara', time: 'Now', kind: 'living', text: 'I am at the back door. No hurry.' },
  { id: 'mara-after', day: 7, requires: '7:bowl', from: 'Mara', time: 'Now', kind: 'living', text: 'I can put the kettle on while you find the pin.' },
];

export const TASKS = Object.fromEntries(Object.entries(SCENES).map(([key, item]) => [key, item.actions]));
const BASELINES = {
  leash: ['The old strap', 'The worn loop is the length of your hand.', 'Lift the loop', 'The hook remains where it was.'],
  cups: ['The second cup', 'The handles used to face different ways.', 'Turn the handle', 'There is a clean place beneath the cup.'],
  calendar: ['The circled date', 'The pencil line does not quite meet itself.', 'Trace the circle', 'The next page holds a faint impression.'],
  pillow: ['The other pillow', 'The cloth takes a little while to rise.', 'Rest your hand', 'The warmth beneath your hand is yours.'],
  clothes: ['The blue shirt', 'A cuff is caught behind the other sleeves.', 'Free the cuff', 'The sleeve is ordinary and empty.'],
  model: ['The unfinished house', 'The roof has been left open.', 'Lift the loose beam', 'You put it down in the same place.'],
  letter: ['The unfinished page', 'The last line ends at a comma.', 'Unfold the page', 'There is no writing on the next line.'],
  bowl: ['The bowl by the door', 'There is a pale circle underneath.', 'Touch the rim', 'The water settles before you do.'],
};

export function getScene(day, objectId) {
  const safeDay = Math.max(1, Math.min(7, Math.trunc(Number(day) || 1)));
  const exact = SCENES[`${safeDay}:${objectId}`];
  if (exact) return exact;
  const previous = Object.values(SCENES).filter(item => item.objectId === objectId && item.day < safeDay).at(-1);
  if (previous) return { ...previous, id: `${safeDay}:${objectId}`, day: safeDay, optional: true };
  const baseline = BASELINES[objectId];
  if (!baseline) return null;
  const [title, line, actionLabel, completionLine] = baseline;
  return { id: `${safeDay}:${objectId}`, day: safeDay, objectId, title, line, task: actionLabel, actionLabel, actionDuration: 7, duration: 45, beats: B(line, completionLine), completionLine, aftermath: '', notes: 'An optional early visit. Do not reveal later chapter information.', optional: true, actions: [A('touch', actionLabel, actionLabel, 7, positions[objectId], 'lift', line, completionLine)] };
}

export function hasSceneVisit(state, key) {
  const [day, id] = key.split(':');
  return [state.chapterVisits, state.sceneVisits].some(visits => {
    if (!visits) return false;
    if (Array.isArray(visits)) return visits.includes(key) || visits.some(value => value?.key === key || value?.id === key);
    if (visits instanceof Set) return visits.has(key);
    if (visits[key]) return true;
    return Array.isArray(visits[day]) && (visits[day].includes(id) || visits[day].includes(key));
  });
}

export function chapterReady(state) {
  const chapter = CHAPTERS[Math.max(0, Math.min(6, Math.trunc(Number(state.day) || 1) - 1))];
  return chapter.sceneKeys.every(key => hasSceneVisit(state, key));
}

export function getStoryMessages(state) {
  return STORY_MESSAGES.filter(message => message.day <= state.day && (!message.requires || (
    message.requires === '6:model' ? state.helped === true :
    message.requires === '7:bowl' ? state.sceneProgress?.['7:bowl']?.completed === true :
    hasSceneVisit(state, message.requires)
  )));
}
