import { clamp } from './geometry.js';
import { WORLD } from './levels.js';
import { remainingLoot } from './loot.js';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function alarmColor(state) {
  if (state === 'LOCKDOWN') return '#ff6a70';
  if (state === 'ALERT') return '#ff9b58';
  if (state === 'SUSPICIOUS') return '#ffd170';
  if (state === 'UNEASY') return '#d9e58a';
  return '#7ee7cd';
}

function drawAlarmMeter(ctx, game) {
  const x = 366;
  const y = 21;
  const width = 400;
  const height = 19;
  const segments = 25;
  const fraction = clamp(game.alarm.value / 100, 0, 1);
  const color = alarmColor(game.alarm.state);
  ctx.fillStyle = 'rgba(138, 177, 204, 0.12)';
  ctx.fillRect(x, y, width, height);
  const lit = Math.round(fraction * segments);
  for (let index = 0; index < segments; index++) {
    const on = index < lit;
    ctx.fillStyle = on ? color : 'rgba(158, 191, 216, 0.12)';
    ctx.fillRect(x + index * (width / segments) + 1, y + 2, width / segments - 3, height - 4);
  }
  if (game.alarm.exposure > 0) {
    ctx.strokeStyle = '#ffd6a3';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
  }
  ctx.fillStyle = color;
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`ALARM ${Math.round(game.alarm.value)}%`, x, y - 6);
  ctx.textAlign = 'right';
  ctx.font = '11px monospace';
  ctx.fillText(game.alarm.state, x + width, y - 6);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(182, 208, 226, 0.55)';
  ctx.font = '10px monospace';
  ctx.fillText(game.alarm.witnesses > 0 ? `${game.alarm.witnesses} WITNESS${game.alarm.witnesses > 1 ? 'ES' : ''}` : 'HIDDEN', x, y + height + 13);
}

function drawDiamond(ctx, x, y, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = filled ? '#ffdf86' : 'rgba(255, 223, 134, 0.16)';
  ctx.strokeStyle = '#ffdf86';
  ctx.lineWidth = 1;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.strokeRect(-5, -5, 10, 10);
  ctx.restore();
}

function drawRightStats(ctx, game) {
  const taken = game.loot.length - remainingLoot(game.loot);
  ctx.fillStyle = '#d7ecff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`FLOOR ${game.levelIndex + 1}/${3}`, 814, 25);
  ctx.fillStyle = 'rgba(190, 216, 234, 0.62)';
  ctx.font = '10px monospace';
  ctx.fillText('LOOT', 814, 47);
  for (let index = 0; index < game.loot.length; index++) {
    drawDiamond(ctx, 852 + index * 16, 43, index < taken);
  }
  ctx.fillStyle = 'rgba(190, 216, 234, 0.62)';
  ctx.font = '10px monospace';
  ctx.fillText('TOOLS', 924, 25);
  ctx.fillStyle = '#ffd38a';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`DECOY ${game.tools.decoys}`, 924, 45);
  ctx.fillStyle = '#b8c8ff';
  ctx.fillText(`VEIL  ${game.tools.veils}`, 1028, 45);
  ctx.fillStyle = 'rgba(190, 216, 234, 0.62)';
  ctx.font = '10px monospace';
  ctx.fillText('SCORE', 1110, 25);
  ctx.fillStyle = '#e8f4ff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(String(game.totalScore).padStart(4, '0'), 1110, 45);
}

export function renderHud(ctx, game) {
  const bar = ctx.createLinearGradient(0, 0, 0, WORLD.hud);
  bar.addColorStop(0, 'rgba(10, 20, 36, 0.98)');
  bar.addColorStop(1, 'rgba(8, 15, 28, 0.92)');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, WORLD.width, WORLD.hud);
  ctx.strokeStyle = 'rgba(122, 174, 205, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.hud - 1);
  ctx.lineTo(WORLD.width, WORLD.hud - 1);
  ctx.stroke();

  ctx.fillStyle = '#9ff3dc';
  ctx.font = `bold 16px ${FONT}`;
  ctx.fillText('MOONLIT GALLERY', 22, 27);
  ctx.fillStyle = 'rgba(190, 216, 234, 0.62)';
  ctx.font = '10px monospace';
  ctx.fillText(game.level.subtitle, 22, 48);
  drawAlarmMeter(ctx, game);
  drawRightStats(ctx, game);

  if (game.messageTimer > 0 && game.message) {
    const width = Math.max(240, game.message.length * 7.4 + 32);
    ctx.fillStyle = 'rgba(8, 18, 30, 0.82)';
    ctx.fillRect(WORLD.width / 2 - width / 2, 84, width, 26);
    ctx.strokeStyle = 'rgba(142, 231, 210, 0.35)';
    ctx.strokeRect(WORLD.width / 2 - width / 2, 84, width, 26);
    ctx.fillStyle = '#c9f9e9';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(game.message, WORLD.width / 2, 101);
    ctx.textAlign = 'left';
  }

  ctx.fillStyle = 'rgba(168, 195, 214, 0.5)';
  ctx.font = '10px monospace';
  ctx.fillText('WASD MOVE   SHIFT SNEAK   SPACE TAKE   E / CLICK DECOY   Q VEIL   P PAUSE   R RETRY', 24, 684);
  if (game.player.sneaking) {
    ctx.fillStyle = '#cda8ff';
    ctx.textAlign = 'right';
    ctx.fillText('SNEAKING', WORLD.width - 24, 684);
    ctx.textAlign = 'left';
  }
}
