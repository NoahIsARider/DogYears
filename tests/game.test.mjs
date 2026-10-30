import test from 'node:test';
import assert from 'node:assert/strict';
import { OBJECTS, SAVE_KEY, newGame, canChoose, choose, markMemory, wait, sleep, advanceTime, ending, finish, getMessages, markMessagesRead, reply, saveGame, loadGame, getRoomPressure } from '../src/game.js';

const keepsakes = OBJECTS.filter(object => object.kind === 'keepsake');
const days = (state, target) => { while (state.day < target) state = sleep(state); return state; };
const reach49 = state => {
  while (state.years < 49) {
    if (state.time >= 1) state = sleep(state);
    const next = wait(state);
    assert.notEqual(next, state, 'Waiting path must keep progressing before day seven');
    state = next;
  }
  return state;
};

test('new saves and mutations do not alter their input', () => {
  const a = newGame(), b = newGame();
  const remembered = markMemory(a, 'cups', true);
  const next = choose(remembered, 'cups', 'carry');
  assert.equal(a.years, 0); assert.deepEqual(a.decisions, {}); assert.equal(b.inventory.length, 0);
  assert.equal(next.years, 1); assert.deepEqual(next.inventory, ['cups']);
  assert.equal(next.decisions.cups.completed, true); assert.equal(next.time, .18);
});

test('a kept object can be revisited tomorrow, resolved objects cannot', () => {
  let state = choose(newGame(), 'cups', 'keep');
  assert.equal(canChoose(state, 'cups'), false); assert.equal(choose(state, 'cups', 'release'), state);
  state = sleep(state); assert.equal(canChoose(state, 'cups'), true);
  state = choose(state, 'cups', 'release'); state = sleep(state);
  assert.equal(canChoose(state, 'cups'), false);
  assert.equal(choose(state, 'phone', 'keep'), state);
  assert.equal(choose(state, 'cups', '__proto__'), state);
});

test('waiting has finite daylight, bounded counter, and seven-day sleep limit', () => {
  let state = newGame();
  for (let i = 0; i < 5; i++) state = wait(state);
  assert.equal(state.time, 1); assert.equal(state.years, 15); assert.equal(wait(state), state);
  state = sleep(state); assert.equal(state.day, 2); assert.equal(state.feltDays, 22); assert.equal(state.time, 0);
  state = days(state, 7); assert.equal(sleep(state), state);
  assert.equal(advanceTime(state, -1), state); assert.equal(advanceTime(state, Infinity), state);
  assert.equal(advanceTime(state, 7).time, 1);
});

test('the endless afternoon: wait to 49 without resolving keepsakes', () => {
  const state = reach49(newGame());
  assert.equal(state.years, 49); assert.equal(ending(state).id, 'afternoon');
});

test('the mark on the porch: high waiting with one object carried', () => {
  const state = reach49(choose(newGame(), 'cups', 'carry'));
  assert.equal(ending(state).id, 'porch');
});

test('the turn of a key: a mixed seven-day relationship to the house', () => {
  let state = choose(newGame(), 'cups', 'carry');
  state = choose(state, 'letter', 'release'); state = days(state, 7);
  assert.equal(ending(state).id, 'keys');
});

test('seven years later: all eight keepsakes put away across the week', () => {
  let state = newGame();
  for (const object of keepsakes) { if (!canChoose(state, object.id)) state = sleep(state); state = choose(state, object.id, 'release'); }
  state = days(state, 7);
  assert.equal(ending(state).id, 'seven');
  assert.equal(Object.keys(state.decisions).length, 8);
});

test('Laika: choose the back door at the highest waiting threshold', () => {
  const state = reach49(newGame());
  assert.equal(ending(state, true).id, 'laika');
  const result = finish(state, true);
  assert.equal(result.phase, 'ending'); assert.equal(result.ending, 'laika');
  assert.equal(choose(result, 'cups', 'keep'), result);
  assert.equal(finish(newGame()).phase, 'house');
});

test('archived messages and the living conversation stay separate', () => {
  let state = newGame();
  assert.equal(getMessages(state).length, 3);
  assert.equal(getMessages(state).some(message => message.from === 'Ellis' && message.kind === 'old'), true);
  assert.equal(getMessages(state).some(message => message.from === 'Mara' && message.kind === 'living'), true);
  state = reply(state, 'I kept the cup.'); assert.equal(state.replies[0].delivered, false);
  assert.equal(state.replies[0].to, 'Ellis');
  state = reply(state, 'Thank you for the bread.', 'Mara');
  assert.equal(state.replies.at(-1).delivered, true);
  state = days(state, 7);
  assert.equal(getMessages(state).at(-1).from, 'Mara');
  state = markMessagesRead(state); assert.equal(getMessages(state).every(message => message.read), true);
  state = reply(state, 'I am coming.', 'Mara'); assert.equal(state.replies.at(-1).delivered, true);
  assert.equal(state.replies.at(-1).to, 'Mara'); assert.equal(reply(state, '  '), state);
  state = reply(state, 'I still put the handle on the left.', 'Ellis');
  assert.equal(state.replies.at(-1).delivered, false);
  assert.equal(state.replies.at(-1).to, 'Ellis');
  const earlyEnd = finish(reach49(newGame()));
  assert.equal(getMessages(earlyEnd).at(-1).from, 'Mara');
});

test('room avoidance increases pressure without punishing every action', () => {
  let state = days(newGame(), 6);
  assert.ok(getRoomPressure(state, 'bedroom') > getRoomPressure(newGame(), 'bedroom'));
  state = choose(choose(state, 'pillow', 'release'), 'clothes', 'release');
  assert.equal(getRoomPressure(state, 'bedroom'), 0);
});

test('save round trip, malformed storage, and normalization', () => {
  const map = new Map(), storage = { getItem: key => map.get(key), setItem: (key, value) => map.set(key, value) };
  const state = reply(choose(markMemory(newGame(), 'cups', true), 'cups', 'carry'), 'See you soon.');
  assert.equal(saveGame(state, storage), true); assert.deepEqual(loadGame(storage), state);
  map.set(SAVE_KEY, '{bad json'); assert.deepEqual(loadGame(storage), newGame());
  map.set(SAVE_KEY, JSON.stringify({ day: 99, years: -100, time: 2, decisions: { cups: { choice: 'carry', day: 1 }, garbage: { choice: 'keep' } } }));
  const normalized = loadGame(storage);
  assert.equal(normalized.day, 7); assert.equal(normalized.years, 0); assert.equal(normalized.time, 1); assert.deepEqual(normalized.inventory, ['cups']);
  assert.equal(saveGame(state, { setItem() { throw Error('storage unavailable'); } }), false);
});
