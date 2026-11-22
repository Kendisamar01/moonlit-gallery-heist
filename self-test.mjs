import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { HeistGame } from './game/src/game.js';
import { LEVELS, WORLD } from './game/src/levels.js';
import { createRng, hashSeed } from './game/src/rng.js';
import { pointInCone, lineClear } from './game/src/geometry.js';
import { concealmentAt, observerSees } from './game/src/sensors.js';
import { createCameras, updateCameras } from './game/src/cameras.js';
import { createAlarm, updateAlarm } from './game/src/alarm.js';

const results = [];

function check(name, run) {
  try {
    run();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({ name, status: 'FAIL', detail: error.message });
  }
}

check('seeded RNG repeats and separates streams', () => {
  const first = createRng(hashSeed('gallery'));
  const second = createRng(hashSeed('gallery'));
  const third = createRng(hashSeed('vault'));
  const a = Array.from({ length: 12 }, () => first.next());
  const b = Array.from({ length: 12 }, () => second.next());
  const c = Array.from({ length: 12 }, () => third.next());
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

check('three floors carry guards, lenses, loot and cover', () => {
  assert.equal(LEVELS.length, 3);
  for (const level of LEVELS) {
    assert.ok(level.guards.length > 0);
    assert.ok(level.cameras.length > 0);
    assert.ok(level.loot.length >= 2);
    assert.ok(level.covers.length >= 2);
    assert.ok(level.obstacles.length >= 4);
    for (const point of [level.start, level.exit]) {
      assert.ok(point.x > WORLD.bounds.left && point.x < WORLD.bounds.right);
      assert.ok(point.y > WORLD.bounds.top && point.y < WORLD.bounds.bottom);
    }
  }
});

check('vision cones honor angle, range and walls', () => {
  assert.equal(pointInCone(200, 200, 100, 200, 0, 300, 0.4), true);
  assert.equal(pointInCone(200, 120, 100, 200, 0, 300, 0.4), false);
  assert.equal(pointInCone(500, 200, 100, 200, 0, 300, 0.4), false);
  const observer = { x: 100, y: 200, facing: 0, range: 400, fov: 0.8 };
  const target = { x: 320, y: 200 };
  const wall = { x: 190, y: 170, w: 26, h: 60 };
  assert.equal(lineClear(observer.x, observer.y, target.x, target.y, [wall]), false);
  assert.equal(observerSees(observer, target, [wall], [], null, false), 0);
  assert.ok(observerSees(observer, target, [], [], null, false) > 0);
});

check('camera sweep is bounded and repeatable', () => {
  const spec = LEVELS[0];
  const first = createCameras(spec, createRng(1));
  const second = createCameras(spec, createRng(1));
  updateCameras(first, 7.25);
  updateCameras(second, 7.25);
  for (let index = 0; index < first.length; index++) {
    const camera = first[index];
    assert.equal(camera.facing, second[index].facing);
    assert.ok(camera.facing >= camera.center - camera.sweep - 1e-9);
    assert.ok(camera.facing <= camera.center + camera.sweep + 1e-9);
  }
  updateCameras(first, 9.5);
  assert.notEqual(first[0].facing, second[0].facing);
});

check('alarm fills under observation and decays in shadow', () => {
  const alarm = createAlarm();
  for (let index = 0; index < 60; index++) updateAlarm(alarm, 1 / 60, 1, 1);
  const lit = alarm.value;
  assert.ok(lit > 30 && lit < 42);
  assert.equal(alarm.state, 'SUSPICIOUS');
  for (let index = 0; index < 130; index++) updateAlarm(alarm, 1 / 60, 0, 0);
  assert.ok(alarm.value < lit - 15);
  assert.equal(alarm.state, 'CALM');
});

check('loot pickup unlocks the exit and finishes the floor', () => {
  const game = new HeistGame({ seed: 9 });
  game.start();
  for (const item of game.loot) {
    game.player.x = item.x;
    game.player.y = item.y;
    game.update(1 / 60, { interact: true });
    assert.equal(item.taken, true);
  }
  assert.equal(game.exitUnlocked, true);
  game.player.x = game.level.exit.x;
  game.player.y = game.level.exit.y;
  game.update(1 / 60, {});
  assert.equal(game.mode, 'win');
  assert.ok(game.totalScore > 0);
});

check('capture and retry restore a playable frame', () => {
  const game = new HeistGame({ seed: 5 });
  game.start();
  game.expose(2, 2);
  assert.equal(game.mode, 'caught');
  assert.equal(game.alarm.value, 100);
  assert.ok(game.captureReason.length > 0);
  game.retry();
  assert.equal(game.mode, 'playing');
  assert.equal(game.alarm.value, 0);
  assert.equal(game.loot.every((item) => !item.taken), true);
});

check('tools cost charges and veil hides the thief', () => {
  const game = new HeistGame({ seed: 11 });
  game.start();
  game.useDecoy();
  game.useVeil();
  assert.equal(game.tools.decoys, 1);
  assert.equal(game.tools.veils, 0);
  assert.ok(game.tools.decoy && game.tools.smoke);
  assert.equal(concealmentAt(game.player.x, game.player.y, [], game.tools.smoke, false), 0);
  game.useVeil();
  assert.equal(game.tools.veils, 0);
  assert.equal(game.message, 'NO VEILS LEFT');
});

check('shot presets show each required frame state', () => {
  const expected = {
    cover: { mode: 'playing', level: 'atrium' },
    play: { mode: 'playing', level: 'glassbone' },
    tension: { mode: 'playing', level: 'nocturne' },
    win: { mode: 'win', level: 'atrium' },
  };
  for (const [name, want] of Object.entries(expected)) {
    const game = new HeistGame({ seed: 20261122, shot: name });
    const report = game.diagnostic();
    assert.equal(report.mode, want.mode, name);
    assert.equal(report.level, want.level, name);
    assert.ok(report.guards >= 3, name);
    assert.ok(report.cameras >= 1, name);
    assert.ok(report.loot >= 2, name);
    assert.deepEqual(JSON.parse(JSON.stringify(game.diagnostic())), report, name);
  }
});

check('a fixed seed replays the same hundred-frame run', () => {
  const first = new HeistGame({ seed: 4242 });
  const second = new HeistGame({ seed: 4242 });
  first.start();
  second.start();
  for (let frame = 0; frame < 180; frame++) {
    const input = {
      x: frame % 120 < 62 ? 1 : -1,
      y: frame % 180 < 90 ? 0 : -1,
      sneak: frame % 40 < 12,
      interact: frame % 71 === 0,
      useDecoy: frame === 48,
      useVeil: frame === 96,
      aim: { x: 620 + (frame % 30), y: 340 },
    };
    first.update(1 / 60, input);
    second.update(1 / 60, input);
  }
  assert.equal(first.snapshot(), second.snapshot());
  const frozen = new HeistGame({ seed: 1, shot: 'cover' });
  const before = frozen.snapshot();
  frozen.update(1 / 60, { x: 1 });
  assert.equal(frozen.snapshot(), before);
});

const lines = results.map((result) => `${result.status} ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
const passed = results.filter((result) => result.status === 'PASS').length;
lines.push(`${passed}/${results.length} checks passed`);
mkdirSync('/workspace/.makefun', { recursive: true });
writeFileSync('/workspace/.makefun/heist-test.log', `${lines.join('\n')}\n`);
for (const line of lines) console.log(line);
if (passed !== results.length) process.exitCode = 1;
