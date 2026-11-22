import { pointInRect, distance, lineClear, pointInCone } from './geometry.js';

export function concealmentAt(x, y, covers, smoke, sneaking) {
  if (smoke && distance(x, y, smoke.x, smoke.y) < smoke.r) return 0;
  for (const cover of covers) {
    if (pointInRect(x, y, cover)) return sneaking ? 0 : 0.32;
  }
  return 1;
}

export function observerSees(observer, target, obstacles, covers, smoke, sneaking) {
  const exposure = concealmentAt(target.x, target.y, covers, smoke, sneaking);
  if (exposure === 0) return 0;
  if (!pointInCone(target.x, target.y, observer.x, observer.y, observer.facing, observer.range, observer.fov / 2)) return 0;
  if (!lineClear(observer.x, observer.y, target.x, target.y, obstacles)) return 0;
  const proximity = 1 - 0.28 * (distance(observer.x, observer.y, target.x, target.y) / observer.range);
  return exposure * proximity;
}
