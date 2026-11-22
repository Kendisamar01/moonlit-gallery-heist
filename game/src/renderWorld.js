import { TAU, castRay, clamp, pointInRect } from './geometry.js';
import { WORLD } from './levels.js';
import { alarmFraction } from './alarm.js';

const INK = '#e8f4ff';

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawBackdrop(ctx, game) {
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, '#0b1425');
  gradient.addColorStop(0.55, '#08111f');
  gradient.addColorStop(1, '#050b16');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = 'rgba(112, 176, 208, 0.055)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 40; x < WORLD.width; x += 40) {
    ctx.moveTo(x, WORLD.hud);
    ctx.lineTo(x, WORLD.height);
  }
  for (let y = WORLD.hud + 20; y < WORLD.height; y += 40) {
    ctx.moveTo(24, y);
    ctx.lineTo(WORLD.width - 24, y);
  }
  ctx.stroke();

  for (const pool of game.decor.pools) {
    ctx.save();
    ctx.translate(pool.x, pool.y);
    ctx.rotate(pool.tilt);
    ctx.scale(pool.rx, pool.ry);
    const moon = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    moon.addColorStop(0, 'rgba(128, 206, 228, 0.105)');
    moon.addColorStop(1, 'rgba(128, 206, 228, 0)');
    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(126, 174, 208, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, WORLD.hud + 16, WORLD.width - 48, WORLD.height - WORLD.hud - 34);
}

function drawRooms(ctx, game) {
  for (const room of game.level.rooms) {
    roundRect(ctx, room.x, room.y, room.w, room.h, 16);
    ctx.fillStyle = 'rgba(22, 38, 62, 0.38)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(116, 167, 201, 0.13)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(166, 204, 222, 0.25)';
    ctx.font = '11px "Trebuchet MS", sans-serif';
    ctx.fillText(room.label, room.x + 14, room.y + 22);
  }
}

function drawCovers(ctx, game) {
  for (const cover of game.level.covers) {
    const occupied = pointInRect(game.player.x, game.player.y, cover);
    roundRect(ctx, cover.x, cover.y, cover.w, cover.h, 14);
    ctx.fillStyle = occupied ? 'rgba(151, 106, 226, 0.3)' : 'rgba(113, 78, 176, 0.18)';
    ctx.fill();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = occupied ? 'rgba(201, 163, 255, 0.8)' : 'rgba(169, 130, 224, 0.42)';
    ctx.lineWidth = occupied ? 2 : 1.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, cover.x, cover.y, cover.w, cover.h, 14);
    ctx.clip();
    ctx.strokeStyle = 'rgba(184, 148, 232, 0.11)';
    ctx.lineWidth = 8;
    for (let offset = 12; offset < cover.w; offset += 24) {
      ctx.beginPath();
      ctx.moveTo(cover.x + offset, cover.y);
      ctx.lineTo(cover.x + offset + 10, cover.y + cover.h);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(210, 180, 255, 0.62)';
    ctx.font = '10px monospace';
    ctx.fillText(cover.label, cover.x + 8, cover.y + cover.h - 8);
  }
}

function coneColors(alert, camera) {
  if (camera) return ['rgba(120, 225, 244, 0.34)', 'rgba(86, 168, 255, 0.06)', 'rgba(142, 230, 255, 0.62)'];
  if (alert > 0.6) return ['rgba(255, 92, 92, 0.42)', 'rgba(255, 92, 92, 0.07)', 'rgba(255, 142, 132, 0.8)'];
  if (alert > 0.2) return ['rgba(255, 186, 92, 0.36)', 'rgba(255, 186, 92, 0.06)', 'rgba(255, 211, 137, 0.7)'];
  return ['rgba(255, 139, 111, 0.3)', 'rgba(255, 139, 111, 0.045)', 'rgba(255, 172, 145, 0.55)'];
}

function drawCone(ctx, observer, obstacles, alert, camera) {
  const half = observer.fov / 2;
  const steps = 26;
  const [inner, outer, edge] = coneColors(alert, camera);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  ctx.moveTo(observer.x, observer.y);
  for (let step = 0; step <= steps; step++) {
    const angle = observer.facing - half + (observer.fov * step) / steps;
    const reach = castRay(observer.x, observer.y, angle, observer.range, obstacles);
    ctx.lineTo(observer.x + Math.cos(angle) * reach, observer.y + Math.sin(angle) * reach);
  }
  ctx.closePath();
  const gradient = ctx.createRadialGradient(observer.x, observer.y, 8, observer.x, observer.y, observer.range);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

function drawSightCones(ctx, game) {
  for (const guard of game.guards) drawCone(ctx, guard, game.level.obstacles, guard.alert, false);
  for (const camera of game.cameras) drawCone(ctx, camera, game.level.obstacles, 0, true);
}

function drawObstacles(ctx, game) {
  for (const obstacle of game.level.obstacles) {
    const { x, y, w, h } = obstacle;
    if (obstacle.kind === 'plinth') {
      ctx.fillStyle = 'rgba(5, 10, 20, 0.55)';
      roundRect(ctx, x + 5, y + 7, w, h, 7);
      ctx.fill();
      roundRect(ctx, x, y, w, h, 7);
      ctx.fillStyle = '#1c2b42';
      ctx.fill();
      ctx.strokeStyle = 'rgba(226, 186, 111, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = obstacle.art;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 13);
      ctx.lineTo(x + w - 13, y + h / 2);
      ctx.lineTo(x + w / 2, y + h - 13);
      ctx.lineTo(x + 13, y + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '9px monospace';
      ctx.fillText('EXHIBIT', x + 9, y + h - 9);
    } else {
      ctx.fillStyle = 'rgba(4, 8, 16, 0.48)';
      roundRect(ctx, x + 4, y + 5, w, h, 4);
      ctx.fill();
      roundRect(ctx, x, y, w, h, 4);
      ctx.fillStyle = '#1a2940';
      ctx.fill();
      ctx.strokeStyle = 'rgba(106, 150, 184, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(158, 199, 222, 0.18)';
      if (w > h) ctx.fillRect(x + 4, y + 3, w - 8, 3);
      else ctx.fillRect(x + 3, y + 4, 3, h - 8);
    }
  }
}

function drawExit(ctx, game) {
  const exit = game.level.exit;
  const pulse = 0.5 + 0.5 * Math.sin(game.time * 3.1);
  const open = game.exitUnlocked;
  ctx.save();
  ctx.translate(exit.x, exit.y);
  roundRect(ctx, -31, -41, 62, 82, 10);
  ctx.fillStyle = open ? 'rgba(26, 96, 78, 0.75)' : 'rgba(57, 44, 39, 0.75)';
  ctx.fill();
  ctx.strokeStyle = open ? `rgba(118, 255, 205, ${0.55 + pulse * 0.4})` : 'rgba(228, 171, 105, 0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = open ? '#a9ffe2' : '#e8b45d';
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillText(open ? 'EXIT' : 'SEAL', 0, -9);
  ctx.font = '10px monospace';
  ctx.fillText(open ? 'OPEN' : 'LOCKED', 0, 9);
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(-8, 30);
  ctx.lineTo(8, 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawLoot(ctx, game) {
  for (const item of game.loot) {
    if (item.taken) continue;
    const bob = Math.sin(item.spin * 2.2) * 4;
    const glow = ctx.createRadialGradient(item.x, item.y + bob, 2, item.x, item.y + bob, 42);
    glow.addColorStop(0, 'rgba(255, 223, 134, 0.5)');
    glow.addColorStop(1, 'rgba(255, 223, 134, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(item.x, item.y + bob, 42, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(item.x, item.y + bob);
    ctx.rotate(Math.PI / 4 + Math.sin(item.spin) * 0.12);
    ctx.fillStyle = '#ffdf86';
    ctx.shadowColor = '#ffd06a';
    ctx.shadowBlur = 14;
    ctx.fillRect(-9, -9, 18, 18);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff8df';
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
    ctx.fillStyle = '#ffe9ad';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y + bob + 34);
    ctx.textAlign = 'left';
  }
}

function drawTools(ctx, game) {
  const { decoy, smoke } = game.tools;
  if (decoy) {
    const pulse = 0.5 + 0.5 * Math.sin(decoy.age * 9);
    ctx.strokeStyle = `rgba(255, 214, 124, ${0.35 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      ctx.arc(decoy.x, decoy.y, 8 + ring * 9 + pulse * 5, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffe0a0';
    ctx.beginPath();
    ctx.arc(decoy.x, decoy.y, 4, 0, TAU);
    ctx.fill();
  }
  if (smoke) {
    const fade = clamp(smoke.life / 1.4, 0, 1);
    const puffs = [
      [-28, -8, 26], [-10, -25, 29], [16, -18, 27], [30, 6, 25],
      [12, 25, 28], [-16, 24, 26], [0, 0, 34],
    ];
    for (let index = 0; index < puffs.length; index++) {
      const [ox, oy, radius] = puffs[index];
      const drift = Math.sin(smoke.age * 1.4 + index) * 6;
      ctx.fillStyle = `rgba(184, 207, 238, ${0.13 * fade})`;
      ctx.beginPath();
      ctx.arc(smoke.x + ox + drift, smoke.y + oy, radius + smoke.age * 2, 0, TAU);
      ctx.fill();
    }
  }
}

function drawGuards(ctx, game) {
  for (const guard of game.guards) {
    ctx.save();
    ctx.translate(guard.x, guard.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(2, 5, 16, 9, 0, 0, TAU);
    ctx.fill();
    ctx.rotate(guard.bodyAngle);
    ctx.fillStyle = guard.mode === 'chase' ? '#672f3c' : '#34465f';
    ctx.strokeStyle = guard.mode === 'chase' ? '#ff8b83' : '#ffae91';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffcfac';
    ctx.beginPath();
    ctx.arc(5, 0, 4.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 230, 210, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 214, 190, 0.85)';
    ctx.font = '10px monospace';
    ctx.fillText(guard.id, guard.x, guard.y - 20);
    if (guard.alert > 0.15) {
      ctx.fillStyle = guard.alert > 0.6 ? '#ff726f' : '#ffca78';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(guard.alert > 0.6 ? '!' : '?', guard.x + 17, guard.y - 18);
    }
    ctx.textAlign = 'left';
  }
}

function drawCameras(ctx, game) {
  for (const camera of game.cameras) {
    ctx.strokeStyle = 'rgba(146, 191, 224, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y - 28);
    ctx.lineTo(camera.x, camera.y);
    ctx.stroke();
    ctx.save();
    ctx.translate(camera.x, camera.y);
    roundRect(ctx, -16, -11, 32, 22, 6);
    ctx.fillStyle = '#263a57';
    ctx.fill();
    ctx.strokeStyle = camera.seeing > 0 ? '#ff8c86' : '#8ee6ff';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.rotate(camera.facing);
    ctx.fillStyle = camera.seeing > 0 ? '#ff9a92' : '#9fefff';
    ctx.beginPath();
    ctx.arc(11, 0, 5.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(174, 232, 255, 0.75)';
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(170, 226, 255, 0.82)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(camera.id, camera.x, camera.y - 34);
    ctx.textAlign = 'left';
  }
}

function drawPlayer(ctx, game) {
  const player = game.player;
  const scale = player.sneaking ? 0.82 : 1;
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.concealment === 0) {
    ctx.strokeStyle = 'rgba(199, 158, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, TAU);
    ctx.stroke();
  }
  ctx.rotate(player.bodyAngle + Math.PI / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(2, 6, 16, 9, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#0c2c35';
  ctx.strokeStyle = '#84f2d3';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(13, -4, 12, 13);
  ctx.lineTo(0, 8);
  ctx.lineTo(-12, 13);
  ctx.quadraticCurveTo(-13, -4, 0, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#a6fff0';
  ctx.beginPath();
  ctx.arc(0, -5, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THIEF', player.x, player.y + 30);
  ctx.textAlign = 'left';
}

function drawMotes(ctx, game) {
  for (const mote of game.decor.motes) {
    const shimmer = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(game.time * 1.7 + mote.phase));
    ctx.fillStyle = `rgba(184, 226, 255, ${shimmer * 0.5})`;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y + Math.sin(game.time * 0.6 + mote.phase) * 4, mote.r, 0, TAU);
    ctx.fill();
  }
}

export function renderWorld(ctx, game) {
  drawBackdrop(ctx, game);
  drawRooms(ctx, game);
  drawCovers(ctx, game);
  drawSightCones(ctx, game);
  drawObstacles(ctx, game);
  drawExit(ctx, game);
  drawLoot(ctx, game);
  drawTools(ctx, game);
  drawGuards(ctx, game);
  drawCameras(ctx, game);
  drawPlayer(ctx, game);
  drawMotes(ctx, game);
  if (game.alarm.value > 70) {
    ctx.strokeStyle = `rgba(255, 86, 86, ${0.1 + alarmFraction(game.alarm) * 0.16})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(6, WORLD.hud + 8, WORLD.width - 12, WORLD.height - WORLD.hud - 20);
  }
}
