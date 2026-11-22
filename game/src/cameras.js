import { TAU, wrapAngle } from './geometry.js';
import { observerSees } from './sensors.js';

export function createCameras(level, rng) {
  return level.cameras.map((spec) => ({
    ...spec,
    facing: spec.center,
    glint: rng.range(0, TAU),
    seeing: 0,
  }));
}

export function updateCameras(cameras, time) {
  for (const camera of cameras) {
    camera.facing = wrapAngle(camera.center + Math.sin(time * camera.speed + camera.phase) * camera.sweep);
  }
}

export function readCameras(cameras, context) {
  let exposure = 0;
  let witnesses = 0;
  for (const camera of cameras) {
    const seen = observerSees(camera, context.player, context.obstacles, context.covers, context.smoke, context.player.sneaking);
    camera.seeing = seen;
    if (seen > 0) {
      exposure += seen * 0.86;
      witnesses += 1;
    }
  }
  return { exposure, witnesses };
}
