import { TAU, clamp, distance, moveCircle, turnToward, wrapAngle } from './geometry.js';
import { WORLD } from './levels.js';
import { observerSees } from './sensors.js';

function startingAngle(route) {
  const first = route[0];
  const second = route[1] ?? route[0];
  return Math.atan2(second[1] - first[1], second[0] - first[0]);
}

export function createGuards(level, rng) {
  return level.guards.map((spec) => ({
    ...spec,
    route: spec.route.map((point) => ({ x: point[0], y: point[1] })),
    waypoint: 1 % spec.route.length,
    bodyAngle: startingAngle(spec.route),
    facing: startingAngle(spec.route),
    scanPhase: rng.range(0, TAU),
    alert: 0,
    lastSeen: null,
    wait: 0,
    mode: 'patrol',
    seeing: 0,
  }));
}

function guardTarget(guard, context) {
  if (guard.alert > 0.18 && guard.lastSeen) {
    return { ...guard.lastSeen, mode: guard.alert > 0.58 || context.alarm >= 68 ? 'chase' : 'sweep' };
  }
  if (context.decoy && distance(guard.x, guard.y, context.decoy.x, context.decoy.y) < 280) {
    return { x: context.decoy.x, y: context.decoy.y, mode: 'investigate' };
  }
  return { ...guard.route[guard.waypoint], mode: 'patrol' };
}

export function updateGuards(guards, dt, context) {
  let totalExposure = 0;
  let witnesses = 0;
  for (const guard of guards) {
    guard.alert = clamp(guard.alert - dt * (guard.mode === 'chase' ? 0.12 : 0.34), 0, 1);
    const seen = observerSees(guard, context.player, context.obstacles, context.covers, context.smoke, context.player.sneaking);
    guard.seeing = seen;
    if (seen > 0) {
      witnesses += 1;
      totalExposure += seen;
      guard.alert = clamp(guard.alert + dt * (0.95 + seen * 0.9), 0, 1);
      guard.lastSeen = { x: context.player.x, y: context.player.y };
      guard.wait = 0;
    }
    const target = guardTarget(guard, context);
    guard.mode = target.mode;
    const dx = target.x - guard.x;
    const dy = target.y - guard.y;
    const remaining = Math.hypot(dx, dy);
    const speedMultiplier = guard.mode === 'chase' ? 1.55 : guard.mode === 'sweep' || guard.mode === 'investigate' ? 1.18 : 1;
    if (remaining < 12) {
      if (guard.mode === 'patrol') guard.waypoint = (guard.waypoint + 1) % guard.route.length;
      if (guard.mode !== 'patrol') {
        guard.wait += dt;
        if (guard.wait > (guard.mode === 'chase' ? 2.2 : 1.3)) {
          guard.lastSeen = null;
          guard.wait = 0;
        }
      }
    } else {
      const travel = Math.min(remaining, guard.speed * speedMultiplier * dt);
      moveCircle(guard, (dx / remaining) * travel, (dy / remaining) * travel, context.obstacles, WORLD.bounds);
      guard.bodyAngle = turnToward(guard.bodyAngle, Math.atan2(dy, dx), dt * 5.5);
    }
    const wobble = guard.mode === 'patrol' ? Math.sin(context.time * 1.55 + guard.scanPhase) * guard.scan : 0;
    guard.facing = wrapAngle(guard.bodyAngle + wobble);
  }
  return { exposure: totalExposure, witnesses };
}
