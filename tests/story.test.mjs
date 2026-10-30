import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, SCENES, DISCOVERIES, STORY_MESSAGES, TASKS, getScene, chapterReady, hasSceneVisit, getStoryMessages } from '../src/story.js';
import { OBJECTS, SAVE_KEY, newGame, choose, sleep, recordScene, discover, getMessages, markMessagesRead, saveGame, loadGame } from '../src/game.js';

const storage = () => {
  const map = new Map();
  return { getItem: key => map.get(key), setItem: (key, value) => map.set(key, value) };
};

test('replaying a completed scene cannot revoke its narrative progress',()=>{
 let state=recordScene(newGame(),'1:cups',true,2);
 state=recordScene(state,'1:cups',false,1);
 assert.deepEqual(state.sceneProgress['1:cups'],{action:2,completed:true});
});

test('seven chapters reference twenty distinct authored scenes and existing keepsakes', () => {
  const ids = new Set(OBJECTS.filter(object => object.kind === 'keepsake').map(object => object.id));
  const keys = CHAPTERS.flatMap(chapter => chapter.sceneKeys);
  assert.equal(CHAPTERS.length, 7); assert.equal(Object.keys(SCENES).length, 20);
  assert.equal(new Set(keys).size, 20);
  assert.deepEqual(CHAPTERS.map(chapter => chapter.day), [1, 2, 3, 4, 5, 6, 7]);
  for (const chapter of CHAPTERS) {
    assert.deepEqual(chapter.sceneKeys, chapter.required.map(id => `${chapter.day}:${id}`));
    assert.ok(chapter.opening && chapter.restHint);
    for (const key of chapter.sceneKeys) {
      const scene = SCENES[key]; assert.ok(scene, `Missing ${key}`);
      assert.equal(scene.id, key); assert.equal(scene.day, chapter.day); assert.ok(ids.has(scene.objectId));
      assert.equal(getScene(chapter.day, scene.objectId), scene);
      assert.equal(TASKS[key], scene.actions);
    }
  }
});

test('memory text remains short, with two or three meaningful short actions rather than a long hold', () => {
  for (const scene of Object.values(SCENES)) {
    assert.ok(scene.actions.length >= 2 && scene.actions.length <= 3, scene.id);
    assert.ok(scene.duration >= 60 && scene.duration <= 120, scene.id);
    assert.equal(new Set(scene.actions.map(action => action.id)).size, scene.actions.length);
    for (const action of scene.actions) {
      assert.ok(action.duration >= 6 && action.duration <= 10, `${scene.id}:${action.id}`);
      assert.equal(action.position.length, 3); assert.ok(action.position.every(Number.isFinite));
      assert.ok(action.label && action.task && action.gesture && action.completionLine);
    }
    let previous = -1;
    for (const beat of scene.beats) {
      assert.ok(beat.at >= 0 && beat.at <= 1 && beat.at >= previous, scene.id);
      assert.ok(beat.line.trim().split(/\s+/).length <= 20, `${scene.id}: ${beat.line}`);
      previous = beat.at;
    }
  }
});

test('optional early visits do not borrow future revelations', () => {
  const earlyModel = getScene(1, 'model');
  assert.equal(earlyModel.optional, true); assert.equal(earlyModel.day, 1); assert.equal(earlyModel.id, '1:model');
  assert.equal(earlyModel.title, 'The unfinished house');
  assert.equal(earlyModel.beats.some(beat => /moving|crooked door|Got it|clamp|Mara/i.test(beat.line)), false);
  const earlyLetter = getScene(1, 'letter');
  assert.equal(earlyLetter.optional, true);
  assert.equal(earlyLetter.beats.some(beat => /shopping|instructions|measurement|milk/i.test(beat.line)), false);
  const previous = getScene(3, 'clothes');
  assert.equal(previous.optional, true); assert.equal(previous.line, SCENES['2:clothes'].line);
  assert.notEqual(previous.line, SCENES['4:clothes'].line);
  assert.equal(getScene(1, 'phone'), null); assert.equal(getScene(1, 'not-an-object'), null);
});

test('chapter readiness depends on this day’s meaningful visits, never ownership', () => {
  let state = choose(choose(newGame(), 'cups', 'release'), 'leash', 'carry');
  assert.equal(chapterReady(state), false);
  state = recordScene(state, '1:leash', false, 1);
  assert.equal(chapterReady(state), false);
  state = recordScene(state, '1:cups', false, 1);
  assert.equal(chapterReady(state), true);
  assert.equal(state.decisions.cups.choice, 'release'); assert.equal(state.decisions.leash.choice, 'carry');
  state = sleep(state); assert.equal(chapterReady(state), false);
  for (const key of CHAPTERS[1].sceneKeys) state = recordScene(state, key, true, 2);
  assert.equal(chapterReady(state), true);
});

test('visit helper accepts supported record and array forms without mixing up repeated days', () => {
  assert.equal(hasSceneVisit({ chapterVisits: ['1:cups'] }, '1:cups'), true);
  assert.equal(hasSceneVisit({ chapterVisits: ['1:cups'] }, '3:cups'), false);
  assert.equal(hasSceneVisit({ sceneVisits: { '1:cups': true } }, '1:cups'), true);
  assert.equal(hasSceneVisit({ sceneVisits: { 1: ['cups'] } }, '1:cups'), true);
  assert.equal(hasSceneVisit({ sceneVisits: new Set(['1:cups']) }, '1:cups'), true);
  assert.equal(hasSceneVisit({}, '1:cups'), false);
});

test('the authored help exchange appears only after sending, not entering or propping the model', () => {
  let state = { ...newGame(), day: 6 };
  assert.equal(getStoryMessages(state).some(message => message.id === 'mara-help'), false);
  state = recordScene(state, '6:model', false, 1);
  assert.equal(getStoryMessages(state).some(message => message.id === 'you-help'), false);
  assert.equal(getStoryMessages(state).some(message => message.id === 'mara-help'), false);
  state = { ...state, helped: true };
  assert.equal(getStoryMessages(state).some(message => message.id === 'you-help'), true);
  assert.equal(getStoryMessages(state).some(message => message.id === 'mara-help'), true);
  assert.equal(getStoryMessages({ ...state, day: 5 }).some(message => message.id === 'mara-help'), false);
});

test('Mara’s kettle message waits for the door action, not merely touching the circle', () => {
  let state = { ...newGame(), day: 7, helped: true };
  state = recordScene(state, '7:bowl', false, 1);
  assert.equal(getStoryMessages(state).some(message => message.id === 'mara-arrival'), true);
  assert.equal(getStoryMessages(state).some(message => message.id === 'mara-after'), false);
  state = recordScene(state, '7:bowl', true, 2);
  assert.equal(getStoryMessages(state).some(message => message.id === 'mara-after'), true);
});

test('story messages retain sender, calendar and archive boundaries', () => {
  assert.equal(new Set(STORY_MESSAGES.map(message => message.id)).size, STORY_MESSAGES.length);
  for (const message of STORY_MESSAGES) {
    assert.ok(message.day >= 1 && message.day <= 7);
    assert.equal(message.from === 'Ellis' && message.kind !== 'old', false);
  }
  const first = getMessages(newGame());
  assert.equal(first.length, 3);
  assert.equal(first.some(message => message.id === 'mara-arrival'), false);
  const read = markMessagesRead(newGame());
  assert.equal(getMessages(read).every(message => message.read), true);
});

test('partial actions, completed scenes, discoveries and help survive saving', () => {
  const store = storage();
  let state = { ...newGame(), day: 6 };
  state = recordScene(state, '5:model', true, 3);
  state = recordScene(state, '6:model', false, 2);
  state = discover(state, 'support'); state = { ...state, helped: true };
  assert.equal(saveGame(state, store), true);
  const loaded = loadGame(store);
  assert.deepEqual(loaded, state);
  assert.deepEqual(loaded.sceneProgress['6:model'], { action: 2, completed: false });
  assert.deepEqual(loaded.sceneProgress['5:model'], { action: 3, completed: true });
  assert.equal(getStoryMessages(loaded).some(message => message.id === 'mara-help'), true);
  assert.equal(chapterReady(loaded), false);
});

test('legacy save migration starts new chapter records without losing existing keepsakes', () => {
  const store = storage();
  const old = choose(newGame(), 'cups', 'carry');
  delete old.chapterVisits; delete old.sceneProgress; delete old.discoveries; delete old.helped;
  old.version = 2; store.setItem(SAVE_KEY, JSON.stringify(old));
  const loaded = loadGame(store);
  assert.equal(loaded.version, 3); assert.equal(loaded.decisions.cups.choice, 'carry');
  assert.deepEqual(loaded.chapterVisits, []); assert.deepEqual(loaded.sceneProgress, {});
  assert.deepEqual(loaded.discoveries, []); assert.equal(loaded.helped, false);
});

test('optional discoveries are distinct, located and do not silently grant story progress', () => {
  assert.equal(DISCOVERIES.length, 24); assert.equal(new Set(DISCOVERIES.map(item => item.id)).size, 24);
  for (const item of DISCOVERIES) {
    assert.ok(item.day >= 1 && item.day <= 7); assert.equal(item.position.length, 3);
    assert.ok(item.position.every(Number.isFinite)); assert.ok(item.title && item.line);
  }
  const state = DISCOVERIES.reduce((current, item) => discover(current, item.id), newGame());
  assert.equal(state.discoveries.length, 24); assert.equal(chapterReady(state), false); assert.equal(state.years, 0);
});
