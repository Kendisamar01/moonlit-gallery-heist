import { clamp } from './geometry.js';
import { createRng, hashSeed } from './rng.js';
import { LEVELS } from './levels.js';
import { createPlayer, updatePlayer } from './player.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras, readCameras } from './cameras.js';
import { createAlarm, updateAlarm } from './alarm.js';
import { createLoot, pickupLoot, animateLoot, allLootTaken, lootValue, reachedExit, remainingLoot } from './loot.js';
import { createTools, throwDecoy, dropVeil, updateTools } from './tools.js';
import { concealmentAt } from './sensors.js';
import { createAudio } from './audio.js';

export const GAME_MODES = ['title', 'playing', 'paused', 'caught', 'win'];

const round = (value) => Math.round(value * 1000) / 1000;

export class HeistGame {
  constructor(options = {}) {
    this.seed = options.seed ?? 20261122;
    this.rng = createRng(hashSeed(this.seed));
    this.audio = options.audio ?? createAudio();
    this.mode = 'title';
    this.levelIndex = 0;
    this.time = 0;
    this.totalScore = 0;
    this.attempts = 0;
    this.runComplete = false;
    this.shotName = null;
    this.message = '';
    this.messageTimer = 0;
    this.detectCooldown = 0;
    this.loadLevel(0);
    if (options.shot) this.applyShot(options.shot);
  }

  loadLevel(index) {
    this.levelIndex = clamp(index, 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    this.player = createPlayer(this.level);
    this.guards = createGuards(this.level, this.rng);
    this.cameras = createCameras(this.level, this.rng);
    this.loot = createLoot(this.level);
    this.alarm = createAlarm();
    this.tools = createTools();
    this.decor = this.makeDecor();
    this.levelTime = 0;
    this.exitUnlocked = false;
    this.captureReason = '';
    this.detectCooldown = 0;
    this.message = '';
    this.messageTimer = 0;
  }

  makeDecor() {
    const motes = [];
    const pools = [];
    for (let index = 0; index < 30; index++) {
      motes.push({
        x: this.rng.range(48, 1152),
        y: this.rng.range(100, 664),
        r: this.rng.range(0.7, 2.1),
        phase: this.rng.range(0, Math.PI * 2),
      });
    }
    for (let index = 0; index < 4; index++) {
      pools.push({
        x: this.rng.range(180, 1020),
        y: this.rng.range(160, 600),
        rx: this.rng.range(90, 190),
        ry: this.rng.range(46, 96),
        tilt: this.rng.range(-0.5, 0.5),
      });
    }
    return { motes, pools };
  }

  start() {
    if (this.mode === 'title') {
      this.mode = 'playing';
      return;
    }
    if (this.mode === 'win') {
      if (this.runComplete) {
        this.totalScore = 0;
        this.loadLevel(0);
      } else {
        this.loadLevel(this.levelIndex + 1);
      }
      this.mode = 'playing';
    }
  }

  retry() {
    if (this.mode !== 'caught' && this.mode !== 'playing') return;
    this.loadLevel(this.levelIndex);
    this.mode = 'playing';
  }

  togglePause() {
    if (this.mode === 'playing') this.mode = 'paused';
    else if (this.mode === 'paused') this.mode = 'playing';
  }

  say(text, seconds = 2.4) {
    this.message = text;
    this.messageTimer = seconds;
  }

  update(dt, input = {}) {
    if (this.shotName) return;
    if (this.mode !== 'playing') {
      this.time += dt;
      return;
    }
    this.time += dt;
    this.levelTime += dt;
    this.messageTimer = Math.max(0, this.messageTimer - dt);
    this.detectCooldown = Math.max(0, this.detectCooldown - dt);
    updateTools(this.tools, dt);
    const movement = updatePlayer(this.player, input, dt, this.level.obstacles);
    if (movement.stepped) this.audio.step();
    if (input.useDecoy) this.useDecoy();
    if (input.useVeil) this.useVeil();
    const collected = pickupLoot(this.loot, this.player, input.interact);
    for (const item of collected) {
      this.audio.grab();
      this.say(`${item.name} SECURED  +${item.value}`);
    }
    animateLoot(this.loot, dt);
    updateCameras(this.cameras, this.time);
    const context = {
      player: this.player,
      obstacles: this.level.obstacles,
      covers: this.level.covers,
      smoke: this.tools.smoke,
      decoy: this.tools.decoy,
      alarm: this.alarm.value,
      time: this.time,
    };
    const guardReport = updateGuards(this.guards, dt, context);
    const cameraReport = readCameras(this.cameras, context);
    const exposure = Math.min(2.5, guardReport.exposure + cameraReport.exposure);
    const witnesses = guardReport.witnesses + cameraReport.witnesses;
    if (witnesses > 0 && this.detectCooldown === 0) {
      this.audio.spotted();
      this.detectCooldown = 1.1;
      this.say(witnesses > 1 ? 'TWO SETS OF EYES ON YOU' : 'YOU ARE BEING SEEN', 1.5);
    }
    const triggered = updateAlarm(this.alarm, dt, exposure, witnesses);
    this.player.concealment = concealmentAt(this.player.x, this.player.y, this.level.covers, this.tools.smoke, this.player.sneaking);
    this.exitUnlocked = allLootTaken(this.loot);
    if (triggered) {
      this.capture('ALARM REACHED LOCKDOWN');
      return;
    }
    if (reachedExit(this.level.exit, this.player, this.loot)) this.completeLevel();
  }

  useDecoy() {
    if (throwDecoy(this.tools, this.player.decoyAim.x, this.player.decoyAim.y)) {
      this.alarm.value = clamp(this.alarm.value + 7, 0, 99);
      this.audio.decoy();
      this.say('CHALK DECOY THROWN  +7 ALARM');
    } else {
      this.audio.deny();
      this.say('NO DECOYS LEFT');
    }
  }

  useVeil() {
    if (dropVeil(this.tools, this.player)) {
      this.alarm.value = clamp(this.alarm.value + 5, 0, 99);
      this.audio.veil();
      this.say('SMOKE VEIL OPEN  +5 ALARM');
    } else {
      this.audio.deny();
      this.say('NO VEILS LEFT');
    }
  }

  capture(reason) {
    this.mode = 'caught';
    this.captureReason = reason;
    this.attempts += 1;
    this.audio.caught();
  }

  expose(seconds, strength = 1) {
    if (this.mode !== 'playing') return;
    const triggered = updateAlarm(this.alarm, seconds, strength, 1);
    if (triggered) this.capture('EXPOSURE TEST');
  }

  completeLevel() {
    const lootScore = lootValue(this.loot);
    const quietBonus = Math.round(Math.max(0, 1200 - this.alarm.peak * 9 - this.levelTime * 5));
    this.totalScore += lootScore + quietBonus;
    this.runComplete = this.levelIndex === LEVELS.length - 1;
    this.mode = 'win';
    this.audio.win();
  }

  applyShot(name) {
    this.shotName = name;
    this.mode = 'playing';
    this.loadLevel(0);
    this.time = 8.6;
    this.levelTime = 42;
    this.player.x = 496;
    this.player.y = 476;
    this.player.bodyAngle = -0.42;
    this.alarm.value = 36;
    this.alarm.peak = 52;
    this.alarm.state = 'SUSPICIOUS';
    this.guards[0].x = 232;
    this.guards[0].y = 392;
    this.guards[0].facing = -0.5;
    this.guards[1].x = 704;
    this.guards[1].y = 248;
    this.guards[1].facing = 2.0;
    this.guards[2].x = 1092;
    this.guards[2].y = 414;
    this.guards[2].facing = 3.0;
    updateCameras(this.cameras, this.time);
    this.message = 'TAKE THE LARK. KEEP TO THE VELVET.';
    this.messageTimer = 9;

    if (name === 'play') {
      this.loadLevel(1);
      this.time = 19.4;
      this.levelTime = 67;
      this.player.x = 690;
      this.player.y = 366;
      this.player.bodyAngle = -1.2;
      this.loot[0].taken = true;
      this.tools.decoys = 1;
      this.tools.smoke = { x: 648, y: 330, r: 64, life: 3.1, age: 1.5 };
      this.tools.decoy = { x: 826, y: 486, life: 3.4, age: 1.6 };
      this.alarm.value = 57;
      this.alarm.peak = 64;
      this.alarm.state = 'ALERT';
      this.guards[0].x = 190;
      this.guards[0].y = 480;
      this.guards[1].x = 500;
      this.guards[1].y = 250;
      this.guards[2].x = 862;
      this.guards[2].y = 560;
      for (const guard of this.guards) guard.alert = 0.55;
      updateCameras(this.cameras, this.time);
      this.message = 'VEIL IS OPEN. MOVE ON THE GLASS.';
    }
    if (name === 'tension') {
      this.loadLevel(2);
      this.time = 31.2;
      this.levelTime = 96;
      this.player.x = 790;
      this.player.y = 476;
      this.player.bodyAngle = 0.4;
      this.player.sneaking = true;
      this.loot[0].taken = true;
      this.loot[2].taken = true;
      this.alarm.value = 91;
      this.alarm.peak = 94;
      this.alarm.state = 'LOCKDOWN';
      this.guards[0].x = 284;
      this.guards[0].y = 310;
      this.guards[1].x = 500;
      this.guards[1].y = 330;
      this.guards[2].x = 840;
      this.guards[2].y = 316;
      this.guards[3].x = 1010;
      this.guards[3].y = 470;
      for (const guard of this.guards) {
        guard.alert = 1;
        guard.mode = 'chase';
        guard.facing = Math.atan2(this.player.y - guard.y, this.player.x - guard.x);
        guard.bodyAngle = guard.facing;
        guard.lastSeen = { x: this.player.x, y: this.player.y };
      }
      updateCameras(this.cameras, this.time);
      this.message = 'LOCKDOWN IN THREE SECONDS. RUN.';
    }
    if (name === 'caught') {
      this.mode = 'caught';
      this.captureReason = 'A LENS HELD YOU IN THE LIGHT';
      this.alarm.value = 100;
    }
    if (name === 'win') {
      this.loadLevel(0);
      this.player.x = this.level.exit.x;
      this.player.y = this.level.exit.y;
      for (const item of this.loot) item.taken = true;
      this.exitUnlocked = true;
      this.totalScore = 4850;
      this.levelTime = 54;
      this.alarm.peak = 27;
      this.runComplete = false;
      this.mode = 'win';
    }
  }

  diagnostic() {
    return {
      mode: this.mode,
      level: this.level.id,
      guards: this.guards.length,
      cameras: this.cameras.length,
      loot: this.loot.length,
      lootRemaining: remainingLoot(this.loot),
      alarm: round(this.alarm.value),
      exitUnlocked: this.exitUnlocked,
      tools: [this.tools.decoys, this.tools.veils],
      player: [round(this.player.x), round(this.player.y)],
    };
  }

  snapshot() {
    const parts = [
      this.mode,
      this.level.id,
      round(this.time),
      round(this.player.x),
      round(this.player.y),
      round(this.player.bodyAngle),
      round(this.alarm.value),
      this.tools.decoys,
      this.tools.veils,
      this.loot.map((item) => Number(item.taken)).join(''),
      this.guards.map((guard) => [round(guard.x), round(guard.y), round(guard.facing), guard.mode].join(':')).join('|'),
      this.cameras.map((camera) => round(camera.facing)).join(','),
    ];
    return parts.join(';');
  }
}
