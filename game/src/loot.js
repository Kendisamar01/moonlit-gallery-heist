import { distance } from './geometry.js';

export function createLoot(level) {
  return level.loot.map((item) => ({ ...item, taken: false, spin: 0 }));
}

export function pickupLoot(items, player, interact) {
  if (!interact) return [];
  const collected = [];
  for (const item of items) {
    if (item.taken) continue;
    if (distance(player.x, player.y, item.x, item.y) <= player.r + item.r + 14) {
      item.taken = true;
      collected.push(item);
    }
  }
  return collected;
}

export function remainingLoot(items) {
  return items.filter((item) => !item.taken).length;
}

export function allLootTaken(items) {
  return remainingLoot(items) === 0;
}

export function lootValue(items) {
  return items.reduce((sum, item) => sum + (item.taken ? item.value : 0), 0);
}

export function animateLoot(items, dt) {
  for (const item of items) item.spin += dt * 1.6;
}

export function reachedExit(exit, player, items) {
  return allLootTaken(items) && distance(player.x, player.y, exit.x, exit.y) <= exit.r + player.r;
}
