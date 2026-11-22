export const TAU = Math.PI * 2;

export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export const lerp = (from, to, amount) => from + (to - from) * amount;

export function wrapAngle(angle) {
  return ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
}

export function angleDifference(from, to) {
  return wrapAngle(to - from);
}

export function turnToward(from, to, maxStep) {
  return wrapAngle(from + clamp(angleDifference(from, to), -maxStep, maxStep));
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

export function pointInRect(x, y, rect, padding = 0) {
  return x >= rect.x - padding && x <= rect.x + rect.w + padding &&
    y >= rect.y - padding && y <= rect.y + rect.h + padding;
}

export function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function segmentHitsRect(x1, y1, x2, y2, rect) {
  let start = 0;
  let end = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const minX = rect.x;
  const maxX = rect.x + rect.w;
  const minY = rect.y;
  const maxY = rect.y + rect.h;
  for (const [origin, delta, low, high] of [[x1, dx, minX, maxX], [y1, dy, minY, maxY]]) {
    if (Math.abs(delta) < 1e-9) {
      if (origin < low || origin > high) return false;
      continue;
    }
    let near = (low - origin) / delta;
    let far = (high - origin) / delta;
    if (near > far) [near, far] = [far, near];
    start = Math.max(start, near);
    end = Math.min(end, far);
    if (start > end) return false;
  }
  return true;
}

export function lineClear(x1, y1, x2, y2, obstacles) {
  for (const obstacle of obstacles) {
    if (segmentHitsRect(x1, y1, x2, y2, obstacle)) return false;
  }
  return true;
}

export function pointInCone(x, y, originX, originY, facing, range, halfFov) {
  const dx = x - originX;
  const dy = y - originY;
  const d2 = dx * dx + dy * dy;
  if (d2 > range * range) return false;
  if (d2 < 1) return true;
  return Math.abs(angleDifference(facing, Math.atan2(dy, dx))) <= halfFov;
}

export function castRay(originX, originY, angle, maxDistance, obstacles) {
  const step = 6;
  for (let travelled = step; travelled <= maxDistance; travelled += step) {
    const x = originX + Math.cos(angle) * travelled;
    const y = originY + Math.sin(angle) * travelled;
    for (const obstacle of obstacles) {
      if (pointInRect(x, y, obstacle)) return travelled - step * 0.5;
    }
  }
  return maxDistance;
}

export function moveCircle(circle, dx, dy, obstacles, bounds) {
  const nextX = clamp(circle.x + dx, bounds.left, bounds.right);
  if (!obstacles.some((rect) => circleHitsRect(nextX, circle.y, circle.r, rect))) circle.x = nextX;
  const nextY = clamp(circle.y + dy, bounds.top, bounds.bottom);
  if (!obstacles.some((rect) => circleHitsRect(circle.x, nextY, circle.r, rect))) circle.y = nextY;
}

export function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length2 = dx * dx + dy * dy;
  if (length2 === 0) return distance(px, py, x1, y1);
  const amount = clamp(((px - x1) * dx + (py - y1) * dy) / length2, 0, 1);
  return distance(px, py, x1 + dx * amount, y1 + dy * amount);
}
