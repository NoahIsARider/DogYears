import {STORY_MESSAGES,getStoryMessages} from './story.js';
import {normalizeInterlude} from './forest/journal.js';
// The counter measures the pull of waiting, not the worth of a decision.
export const SAVE_KEY = 'dogyears.save.v2';
export const CHOICES = Object.freeze({
  keep: { label: 'Leave it here', delta: 2 },
  release: { label: 'Make room', delta: -1 },
  carry: { label: 'Take it with me', delta: 1 },
});

export const OBJECTS = [
  {
    id: 'leash', room: 'hall', title: 'The old strap', prompt: 'Remember', kind: 'keepsake',
    position: [-0.64, 1.25, 5.1], meshPrefixes: ['Old leash'],
    line: 'You hung it where a hand could find it in the dark.',
    memory: { line: '“The boxes can wait. Come outside.”', task: 'Follow the strap to the hook.', actionLabel: 'Lift the loop', completionLine: 'For a moment, the hook is warm.', duration: 8 },
    decision: 'It has kept the shape of your hand.',
    outcomes: { keep: 'The loop settles against the wall.', release: 'The hook is still there.', carry: 'You wind it loosely around your fingers.' },
  },
  {
    id: 'cups', room: 'kitchen', title: 'The second cup', prompt: 'Remember', kind: 'keepsake',
    position: [-3.35, 1.02, 5.37], meshPrefixes: ['Cup |', 'Cold coffee', 'Coffee stain'],
    line: 'You still put the handle on the left.',
    memory: { line: 'The kettle stops. You reach for two cups.', task: 'Turn the handle toward the empty place.', actionLabel: 'Turn the cup', completionLine: 'The cup makes a small sound on the counter.', duration: 9 },
    decision: 'There is a ring beneath the cup.',
    outcomes: { keep: 'You put it back inside the ring.', release: 'You wash it. The ring takes longer.', carry: 'You choose the chipped one.' },
  },
  {
    id: 'calendar', room: 'kitchen', title: 'The circled date', prompt: 'Remember', kind: 'keepsake',
    position: [-1.3, 1.6, 0.12], meshPrefixes: ['Calendar |'],
    line: 'Nothing was written inside the circle.',
    memory: { line: '“Keep that Saturday free.”', task: 'Trace the circle once.', actionLabel: 'Touch the date', completionLine: 'The pencil has pressed through to the next page.', duration: 7 },
    decision: 'The next month is underneath.',
    outcomes: { keep: 'October stays on the wall.', release: 'You turn the page. The mark is still faintly visible.', carry: 'You fold the page along the circle.' },
  },
  {
    id: 'pillow', room: 'bedroom', title: 'The other pillow', prompt: 'Remember', kind: 'keepsake',
    position: [3.83, 0.85, 4.22], meshPrefixes: ['Pillow | old hollow'],
    line: 'You have stopped sleeping in the middle.',
    memory: { line: 'The alarm has not rung yet.', task: 'Rest your hand in the hollow.', actionLabel: 'Smooth the pillow', completionLine: 'The cloth rises slowly after your hand.', duration: 10 },
    decision: 'It no longer smells the way you remember.',
    outcomes: { keep: 'You leave the hollow facing up.', release: 'You change the pillowcase.', carry: 'The clean case folds smaller than you expected.' },
  },
  {
    id: 'clothes', room: 'bedroom', title: 'The blue shirt', prompt: 'Remember', kind: 'keepsake',
    position: [4.5, 1.45, 0.65], meshPrefixes: ['Wardrobe | hanging shirt | blue keepsake'],
    line: 'One sleeve is caught behind the others.',
    memory: { line: '“Does this look all right?” You do not look up.', task: 'Straighten the caught sleeve.', actionLabel: 'Unfold the sleeve', completionLine: 'There is a loose thread at the cuff.', duration: 8 },
    decision: 'The shirt is ordinary. That is the difficult part.',
    outcomes: { keep: 'You give it a little more space on the rail.', release: 'You fold the sleeves inward.', carry: 'The cuff reaches past your wrist.' },
  },
  {
    id: 'model', room: 'study', title: 'The unfinished house', prompt: 'Remember', kind: 'keepsake',
    position: [-4.8, 1.0, -2.8], meshPrefixes: ['Unfinished promise |', 'Model |', 'Workshop | loose timber'],
    line: 'The last piece was cut already.',
    memory: { line: '“Hold this end. Just for a second.”', task: 'Hold the loose beam against the frame.', actionLabel: 'Lift the beam', completionLine: 'You wait for the other hand to let go.', duration: 10 },
    decision: 'You could finish it. You could leave it unfinished.',
    outcomes: { keep: 'The loose piece lies beside the house.', release: 'You put the pieces in a box together.', carry: 'You keep the frame, including the missing part.' },
  },
  {
    id: 'letter', room: 'study', title: 'The unfinished letter', prompt: 'Remember', kind: 'keepsake',
    position: [-3.6, 0.85, -4.6], meshPrefixes: ['Unfinished letters', 'Letter |'],
    line: 'The last sentence ends with a comma.',
    memory: { line: 'A pen rolls toward your side of the table.', task: 'Unfold the page without flattening the crease.', actionLabel: 'Open the page', completionLine: 'The next line is empty.', duration: 8 },
    decision: 'You do not have to supply the missing words.',
    outcomes: { keep: 'You fold it along the old crease.', release: 'You set it with the letters you can put away.', carry: 'The paper rests against your chest.' },
  },
  {
    id: 'phone', room: 'study', title: 'The old phone', prompt: 'Read', kind: 'phone',
    position: [-3.98, 0.85, -4.5], meshPrefixes: ['Phone |'],
    line: 'The screen still wakes.',
    memory: { line: 'There is a draft you never sent.', task: 'Read the last line.', actionLabel: 'Wake the screen', completionLine: 'No new message from them.', duration: 6 },
  },
  {
    id: 'bowl', room: 'porch', title: 'The bowl by the door', prompt: 'Remember', kind: 'keepsake',
    position: [-0.72, 0.1, -6.8], meshPrefixes: ['Water bowl |'],
    line: 'You used to call it a plant saucer.',
    memory: { line: 'Water trembles when the key turns.', task: 'Rest the bowl on the worn circle.', actionLabel: 'Set down the bowl', completionLine: 'The water becomes still before you do.', duration: 10 },
    decision: 'There is a pale circle where it stood.',
    outcomes: { keep: 'You add a little water.', release: 'You dry the bowl and leave the circle bare.', carry: 'It is lighter without the water.' },
  },
];

const KEEPSAKES = OBJECTS.filter(object => object.kind === 'keepsake');
const INDEX = new Map(OBJECTS.map(object => [object.id, object]));
const COPY = state => ({ ...state });
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const safeRecord = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function newGame() {
  return {
    version: 3, day: 1, time: 0, years: 0, feltDays: 0, phase: 'house',
    decisions: {}, history: [], seenMemories: [], memoryActions: {},
    phoneRead: [], replies: [], waits: 0, inventory: [], ending: null,
    chapterVisits: [], sceneProgress: {}, discoveries: [], helped: false,
    pendingInterlude: null, seenInterludes: [],
  };
}

export function canChoose(state, id) {
  const object = INDEX.get(id);
  if (!object || object.kind !== 'keepsake' || state.phase !== 'house' || state.years >= 49 || state.time >= 1) return false;
  const previous = state.decisions[id];
  return !previous || previous.choice === 'keep' && previous.day < state.day;
}

export function markMemory(state, id, completed = false) {
  if (!INDEX.has(id) || state.phase !== 'house') return state;
  const seenMemories = state.seenMemories.includes(id) ? state.seenMemories : [...state.seenMemories, id];
  const memoryActions = completed ? { ...state.memoryActions, [id]: true } : state.memoryActions;
  return { ...state, seenMemories, memoryActions };
}

export function recordScene(state, key, completed = false, action = 0) {
  if (state.phase !== 'house' || !/^([1-7]):[a-z]+$/.test(key)) return state;
  const previous = state.sceneProgress?.[key];
  return { ...state, chapterVisits: [...new Set([...(state.chapterVisits || []), key])],
    sceneProgress: { ...(state.sceneProgress || {}), [key]: { action: Math.max(0, action, previous?.action || 0), completed: Boolean(completed || previous?.completed) } } };
}

export function discover(state, id) {
  if (state.phase !== 'house' || typeof id !== 'string' || (state.discoveries || []).includes(id)) return state;
  return { ...state, discoveries: [...(state.discoveries || []), id] };
}

export function choose(state, id, choice) {
  if (!canChoose(state, id) || !Object.hasOwn(CHOICES, choice)) return state;
  const record = { choice, day: state.day, remembered: state.seenMemories.includes(id), completed: Boolean(state.memoryActions[id]) };
  return {
    ...state,
    time: clamp(state.time + 0.18, 0, 1),
    years: clamp(state.years + CHOICES[choice].delta, 0, 49),
    decisions: { ...state.decisions, [id]: record },
    history: [...state.history, { id, ...record }],
    inventory: choice === 'carry' ? [...new Set([...state.inventory, id])] : state.inventory,
  };
}

export function advanceTime(state, delta) {
  if (state.phase !== 'house' || state.years >= 49 || !Number.isFinite(delta) || delta <= 0) return state;
  return { ...state, time: clamp(state.time + delta, 0, 1) };
}

export function wait(state) {
  if (state.phase !== 'house' || state.years >= 49 || state.time >= 1) return state;
  return { ...state, time: clamp(state.time + 0.22, 0, 1), years: clamp(state.years + 3, 0, 49), waits: state.waits + 1 };
}

export function sleep(state) {
  if (state.phase !== 'house' || state.years >= 49 || state.day >= 7) return state;
  // Calendar time is a day. Subjective time also carries the accumulated waiting.
  return { ...state, day: state.day + 1, time: 0, feltDays: state.feltDays + 7 + state.years };
}

export function getRoomPressure(state, room) {
  const objects = KEEPSAKES.filter(object => object.room === room);
  if (!objects.length) return 0;
  const untouched = objects.filter(object => !state.decisions[object.id]).length / objects.length;
  return clamp(untouched * (state.day - 1) / 6 + state.years / 98, 0, 1);
}

const MESSAGES = [
  { id: 'before-1', day: 1, from: 'You', text: 'Did you take your keys?', kind: 'old', time: '08:12' },
  { id: 'before-2', day: 1, from: 'Them', text: 'In my pocket. Back soon.', kind: 'old', time: '08:14' },
  { id: 'before-3', day: 2, from: 'Them', text: 'There is coffee left. The good cup is yours.', kind: 'old', time: 'Yesterday' },
  { id: 'before-4', day: 3, from: 'Them', text: 'Keep Saturday free. I found somewhere.', kind: 'old', time: 'October 12' },
  { id: 'before-5', day: 4, from: 'You', text: 'I can help with the roof tonight.', kind: 'old', time: 'October 15' },
  { id: 'before-6', day: 5, from: 'Them', text: 'No hurry. It will still be here.', kind: 'old', time: 'October 15' },
  { id: 'before-7', day: 6, from: 'You', text: 'Can you get milk on the way?', kind: 'old', time: 'Unsent' },
  { id: 'living', day: 7, from: 'Mara', text: 'I am outside. We do not have to talk.', kind: 'living', time: 'Now' },
];

export function getMessages(state) {
  return getStoryMessages(state).map(message => ({
    ...message,
    read: state.phoneRead.includes(message.id),
    replied: state.replies.some(reply => reply.to === message.from && reply.delivered),
  }));
}

export function markMessagesRead(state) {
  const ids = getMessages(state).map(message => message.id);
  return { ...state, phoneRead: [...new Set([...state.phoneRead, ...ids])] };
}

export function reply(state, text, recipient = 'Ellis') {
  if (typeof text !== 'string') return state;
  const message = text.trim().slice(0, 180);
  if (!message) return state;
  const delivered = recipient === 'Mara' && getMessages(state).some(item => item.from === 'Mara');
  return { ...state, replies: [...state.replies, { id: `reply-${state.replies.length + 1}`, day: state.day, text: message, to: delivered ? 'Mara' : 'Ellis', delivered }] };
}

export const ENDINGS = Object.freeze({
  afternoon: {
    id: 'afternoon', title: 'The endless afternoon',
    line: 'The light stops at the same board. You listen for the key.',
    after: 'Everything remains where you left it.', outside: false,
  },
  porch: {
    id: 'porch', title: 'The mark on the porch',
    line: 'Today, you sit on the other side of the door.',
    after: 'It is enough to be outside for a little while.', outside: false,
  },
  keys: {
    id: 'keys', title: 'The turn of a key',
    line: 'You check your pocket. This time, the key is yours.',
    after: 'The kettle sounds different with someone else in the kitchen.', outside: true,
  },
  seven: {
    id: 'seven', title: 'Seven years later',
    line: 'For once, evening takes as long as it takes.',
    after: 'The house is behind you. It is still part of your way home.', outside: true,
  },
  laika: {
    id: 'laika', title: 'Laika',
    line: 'You go before the familiar sound can call you back.',
    after: 'No one has sent you away. You open the door yourself.', outside: true,
  },
});

export function ending(state, forcedExit = false) {
  if (state.phase === 'ending' && state.ending) return ENDINGS[state.ending] || null;
  if (!forcedExit && state.day < 7 && state.years < 49) return null;
  const records = Object.values(state.decisions);
  const released = records.filter(record => record.choice === 'release').length;
  const resolved = records.filter(record => record.choice !== 'keep').length;
  if (forcedExit && state.years >= 49) return ENDINGS.laika;
  if (state.years >= 49 && resolved === 0) return ENDINGS.afternoon;
  if (state.years >= 28 && resolved <= 2) return ENDINGS.porch;
  if (released === KEEPSAKES.length && state.years <= 14) return ENDINGS.seven;
  return ENDINGS.keys;
}

export function finish(state, forcedExit = false) {
  const result = ending(state, forcedExit);
  return result ? { ...state, phase: 'ending', ending: result.id } : state;
}

export function saveGame(state, storage = globalThis.localStorage) {
  try { storage?.setItem(SAVE_KEY, JSON.stringify(state)); return Boolean(storage); }
  catch { return false; }
}

export function loadGame(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (!raw) return newGame();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return newGame();
    const clean = newGame();
    clean.day = clamp(Math.trunc(finite(parsed.day, 1)), 1, 7);
    clean.time = clamp(finite(parsed.time), 0, 1);
    clean.years = clamp(finite(parsed.years), 0, 49);
    clean.feltDays = Math.max(0, finite(parsed.feltDays));
    clean.waits = Math.max(0, Math.trunc(finite(parsed.waits)));
    clean.decisions = Object.fromEntries(Object.entries(safeRecord(parsed.decisions)).filter(([id, record]) => INDEX.get(id)?.kind === 'keepsake' && record && Object.hasOwn(CHOICES, record.choice)).map(([id, record]) => [id, { choice: record.choice, day: clamp(Math.trunc(finite(record.day, 1)), 1, 7), remembered: Boolean(record.remembered), completed: Boolean(record.completed) }]));
    clean.history = Array.isArray(parsed.history) ? parsed.history.filter(item => item && INDEX.has(item.id) && Object.hasOwn(CHOICES, item.choice)).slice(-100) : [];
    clean.seenMemories = Array.isArray(parsed.seenMemories) ? [...new Set(parsed.seenMemories.filter(id => INDEX.has(id)))] : [];
    clean.memoryActions = Object.fromEntries(Object.entries(safeRecord(parsed.memoryActions)).filter(([id, value]) => INDEX.has(id) && value === true));
    clean.phoneRead = Array.isArray(parsed.phoneRead) ? parsed.phoneRead.filter(id => STORY_MESSAGES.some(message => message.id === id)) : [];
    clean.replies = Array.isArray(parsed.replies) ? parsed.replies.filter(item => item && typeof item.text === 'string' && typeof item.to === 'string').slice(-50).map(item => ({ ...item, text: item.text.slice(0, 180), delivered: Boolean(item.delivered) })) : [];
    clean.inventory = Object.keys(clean.decisions).filter(id => clean.decisions[id].choice === 'carry');
    clean.chapterVisits = Array.isArray(parsed.chapterVisits) ? [...new Set(parsed.chapterVisits.filter(key => typeof key === 'string' && /^([1-7]):[a-z]+$/.test(key)))] : [];
    clean.sceneProgress = Object.fromEntries(Object.entries(safeRecord(parsed.sceneProgress)).filter(([key, value]) => /^([1-7]):[a-z]+$/.test(key) && value && typeof value === 'object').map(([key, value]) => [key, { action: clamp(Math.trunc(finite(value.action)), 0, 10), completed: value.completed === true }]));
    clean.discoveries = Array.isArray(parsed.discoveries) ? [...new Set(parsed.discoveries.filter(id => typeof id === 'string').slice(0, 100))] : [];
    clean.helped = parsed.helped === true;
    if (parsed.phase === 'ending' && Object.hasOwn(ENDINGS, parsed.ending)) { clean.phase = 'ending'; clean.ending = parsed.ending; }
    clean.seenInterludes=Array.isArray(parsed.seenInterludes)?[...new Set(parsed.seenInterludes.filter(id=>Number.isInteger(id)&&id>=1&&id<=7))]:[];
    clean.pendingInterlude=normalizeInterlude(parsed.pendingInterlude,clean);
    return clean;
  } catch { return newGame(); }
}
