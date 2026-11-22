import { HeistGame } from './game.js';
import { createAudio } from './audio.js';
import { readMovementInput } from './player.js';
import { renderWorld } from './renderWorld.js';
import { renderHud } from './renderHud.js';
import { renderScreens } from './renderScreens.js';
import { WORLD } from './levels.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedText = params.get('seed') ?? '20261122';
const seed = Number(seedText) || seedText;
const audio = createAudio();
const game = new HeistGame({ seed, shot, audio });
const keys = new Set();
const mouse = { x: game.player.x + 100, y: game.player.y };
const edges = { interact: false, useDecoy: false, useVeil: false };
const STEP = 1 / 60;

const handledCodes = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space',
  'ShiftLeft', 'ShiftRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'KeyE', 'KeyQ', 'KeyP', 'KeyR', 'Enter',
]);

function setMouse(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * WORLD.width;
  mouse.y = ((event.clientY - rect.top) / rect.height) * WORLD.height;
}

window.addEventListener('keydown', (event) => {
  if (handledCodes.has(event.code)) event.preventDefault();
  audio.ensure();
  if (!event.repeat) {
    if (event.code === 'Enter') game.start();
    if (event.code === 'KeyR') game.retry();
    if (event.code === 'KeyP') game.togglePause();
    if (event.code === 'Space') edges.interact = true;
    if (event.code === 'KeyE') edges.useDecoy = true;
    if (event.code === 'KeyQ') edges.useVeil = true;
  }
  keys.add(event.code);
});

window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());
canvas.addEventListener('mousemove', setMouse);
canvas.addEventListener('mousedown', (event) => {
  setMouse(event);
  audio.ensure();
  if (game.mode === 'playing') edges.useDecoy = true;
});

function consumeInput() {
  const input = {
    ...readMovementInput(keys),
    aim: mouse,
    interact: edges.interact,
    useDecoy: edges.useDecoy,
    useVeil: edges.useVeil,
  };
  edges.interact = false;
  edges.useDecoy = false;
  edges.useVeil = false;
  return input;
}

function render() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  renderWorld(ctx, game);
  renderHud(ctx, game);
  renderScreens(ctx, game);
}

render();

let previous = performance.now();
let accumulator = 0;
function frame(now) {
  const elapsed = Math.min(0.1, (now - previous) / 1000);
  previous = now;
  accumulator += elapsed;
  while (accumulator >= STEP) {
    game.update(STEP, consumeInput());
    accumulator -= STEP;
  }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
