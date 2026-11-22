import { clamp, distance, moveCircle, wrapAngle, TAU } from './geometry.js';
import { WORLD } from './levels.js';

const KEY_AXES = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
};

export function readMovementInput(keys) {
  return {
    x: Number(KEY_AXES.right.some((code) => keys.has(code))) - Number(KEY_AXES.left.some((code) => keys.has(code))),
    y: Number(KEY_AXES.down.some((code) => keys.has(code))) - Number(KEY_AXES.up.some((code) => keys.has(code))),
    sneak: keys.has('ShiftLeft') || keys.has('ShiftRight'),
  };
}

export function createPlayer(level) {
  return {
    x: level.start.x,
    y: level.start.y,
    r: 13,
    bodyAngle: -Math.PI / 2,
    speed: 182,
    sneakSpeed: 96,
    sneaking: false,
    moving: false,
    stepClock: 0,
    steps: 0,
    concealed: 1,
    decoyAim: { x: level.start.x + 140, y: level.start.y },
  };
}

export function updatePlayer(player, input, dt, obstacles) {
  let dx = input.x ?? 0;
  let dy = input.y ?? 0;
  player.sneaking = Boolean(input.sneak);
  const length = Math.hypot(dx, dy);
  if (length > 0) {
    dx /= length;
    dy /= length;
  }
  const speed = player.sneaking ? player.sneakSpeed : player.speed;
  const beforeX = player.x;
  const beforeY = player.y;
  moveCircle(player, dx * speed * dt, dy * speed * dt, obstacles, WORLD.bounds);
  player.moving = distance(beforeX, beforeY, player.x, player.y) > 0.01;
  if (player.moving) player.bodyAngle = wrapAngle(Math.atan2(player.y - beforeY, player.x - beforeX));
  player.stepClock += player.moving ? dt * (player.sneaking ? 4.2 : 8.5) : 0;
  let stepped = false;
  if (player.stepClock >= 1) {
    player.stepClock -= 1;
    player.steps += 1;
    stepped = true;
  }
  if (input.aim) {
    player.decoyAim.x = clamp(input.aim.x, WORLD.bounds.left, WORLD.bounds.right);
    player.decoyAim.y = clamp(input.aim.y, WORLD.bounds.top, WORLD.bounds.bottom);
  }
  return { moved: player.moving, stepped, stepAngle: player.bodyAngle + (player.steps % 2 === 0 ? 1 : -1) * 0.8 };
}

export function playerFootprint(player) {
  return {
    x: player.x + Math.cos(player.bodyAngle + TAU / 4) * 7,
    y: player.y + Math.sin(player.bodyAngle + TAU / 4) * 7,
  };
}
