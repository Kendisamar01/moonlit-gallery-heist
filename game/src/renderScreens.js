import { WORLD } from './levels.js';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function panel(ctx, x, y, width, height, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + width - 18, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + 18);
  ctx.lineTo(x + width, y + height - 18);
  ctx.quadraticCurveTo(x + width, y + height, x + width - 18, y + height);
  ctx.lineTo(x + 18, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - 18);
  ctx.lineTo(x, y + 18);
  ctx.quadraticCurveTo(x, y, x + 18, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function scrim(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
}

export function renderScreens(ctx, game) {
  if (game.mode === 'playing') return;
  if (game.mode === 'paused') {
    scrim(ctx, 'rgba(4, 9, 18, 0.62)');
    panel(ctx, 430, 268, 340, 150, 'rgba(12, 27, 43, 0.96)', 'rgba(143, 226, 209, 0.7)');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a8f5dc';
    ctx.font = `bold 30px ${FONT}`;
    ctx.fillText('PAUSED', WORLD.width / 2, 325);
    ctx.fillStyle = 'rgba(213, 235, 246, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText('P TO RESUME', WORLD.width / 2, 360);
    ctx.textAlign = 'left';
    return;
  }
  if (game.mode === 'title') {
    scrim(ctx, 'rgba(4, 9, 18, 0.72)');
    panel(ctx, 285, 142, 630, 410, 'rgba(10, 23, 38, 0.95)', 'rgba(142, 231, 210, 0.55)');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9ff3dc';
    ctx.font = `bold 48px ${FONT}`;
    ctx.fillText('MOONLIT GALLERY', WORLD.width / 2, 232);
    ctx.fillStyle = 'rgba(202, 228, 240, 0.75)';
    ctx.font = '16px monospace';
    ctx.fillText('A ONE-FRAME NOCTURNE HEIST', WORLD.width / 2, 266);
    ctx.fillStyle = '#ffd98a';
    ctx.font = '13px monospace';
    ctx.fillText('THREE WINGS. SIX EXHIBITS. ONE WAY OUT.', WORLD.width / 2, 318);
    ctx.fillStyle = 'rgba(202, 228, 240, 0.68)';
    ctx.font = '12px monospace';
    ctx.fillText('Read the cones. Cross the velvet. Take everything.', WORLD.width / 2, 352);
    ctx.fillText('WASD move · Shift sneak · Space take · E / click decoy · Q veil', WORLD.width / 2, 382);
    ctx.fillStyle = '#baffea';
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText('PRESS ENTER TO SLIP IN', WORLD.width / 2, 442);
    ctx.textAlign = 'left';
    return;
  }
  if (game.mode === 'caught') {
    scrim(ctx, 'rgba(46, 6, 15, 0.55)');
    panel(ctx, 350, 214, 500, 268, 'rgba(31, 10, 20, 0.95)', 'rgba(255, 126, 118, 0.75)');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff8b85';
    ctx.font = `bold 52px ${FONT}`;
    ctx.fillText('CAUGHT', WORLD.width / 2, 303);
    ctx.fillStyle = 'rgba(255, 213, 206, 0.82)';
    ctx.font = '14px monospace';
    ctx.fillText(game.captureReason, WORLD.width / 2, 342);
    ctx.fillStyle = 'rgba(255, 213, 206, 0.6)';
    ctx.font = '12px monospace';
    ctx.fillText(`Floor ${game.levelIndex + 1} · alarm ${Math.round(game.alarm.value)}% · retries ${game.attempts}`, WORLD.width / 2, 379);
    ctx.fillStyle = '#ffb4ad';
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText('PRESS R TO TRY AGAIN', WORLD.width / 2, 432);
    ctx.textAlign = 'left';
    return;
  }
  if (game.mode === 'win') {
    scrim(ctx, 'rgba(4, 16, 20, 0.5)');
    panel(ctx, 330, 178, 540, 330, 'rgba(9, 30, 34, 0.95)', 'rgba(255, 220, 140, 0.7)');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe19a';
    ctx.font = `bold 46px ${FONT}`;
    ctx.fillText('CLEAN GETAWAY', WORLD.width / 2, 260);
    ctx.fillStyle = 'rgba(215, 245, 236, 0.84)';
    ctx.font = '14px monospace';
    ctx.fillText(game.runComplete ? 'THE WHOLE GALLERY IS YOURS' : `${game.level.name} CLEARED`, WORLD.width / 2, 300);
    ctx.fillStyle = '#a8f5dc';
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText(`${game.totalScore} POINTS`, WORLD.width / 2, 350);
    ctx.fillStyle = 'rgba(215, 245, 236, 0.6)';
    ctx.font = '12px monospace';
    ctx.fillText(`Time ${game.levelTime.toFixed(1)}s · peak alarm ${Math.round(game.alarm.peak)}%`, WORLD.width / 2, 386);
    ctx.fillStyle = '#ffe19a';
    ctx.font = `bold 15px ${FONT}`;
    ctx.fillText(game.runComplete ? 'ENTER TO START A NEW RUN' : 'ENTER FOR THE NEXT WING', WORLD.width / 2, 452);
    ctx.textAlign = 'left';
  }
}
