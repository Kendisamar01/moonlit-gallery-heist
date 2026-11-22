import { clamp, distance } from './geometry.js';
import { WORLD } from './levels.js';

export function createTools() {
  return {
    decoys: 2,
    veils: 1,
    decoy: null,
    smoke: null,
    flash: 0,
  };
}

export function throwDecoy(tools, x, y) {
  if (tools.decoys <= 0) return false;
  tools.decoys -= 1;
  tools.decoy = {
    x: clamp(x, WORLD.bounds.left, WORLD.bounds.right),
    y: clamp(y, WORLD.bounds.top, WORLD.bounds.bottom),
    life: 5.2,
    age: 0,
  };
  tools.flash = 1;
  return true;
}

export function dropVeil(tools, player) {
  if (tools.veils <= 0) return false;
  tools.veils -= 1;
  tools.smoke = { x: player.x, y: player.y, r: 64, life: 4.6, age: 0 };
  tools.flash = 1;
  return true;
}

export function updateTools(tools, dt) {
  if (tools.decoy) {
    tools.decoy.life -= dt;
    tools.decoy.age += dt;
    if (tools.decoy.life <= 0) tools.decoy = null;
  }
  if (tools.smoke) {
    tools.smoke.life -= dt;
    tools.smoke.age += dt;
    if (tools.smoke.life <= 0) tools.smoke = null;
  }
  tools.flash = Math.max(0, tools.flash - dt * 2.4);
}

export function decoyHeard(tools, x, y, radius) {
  return Boolean(tools.decoy && distance(tools.decoy.x, tools.decoy.y, x, y) < radius);
}
