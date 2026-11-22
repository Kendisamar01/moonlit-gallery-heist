export const WORLD = {
  width: 1200,
  height: 700,
  hud: 72,
  bounds: { left: 34, right: 1166, top: 92, bottom: 668 },
};

const atrium = {
  id: 'atrium',
  name: 'THE MOONLIT ATRIUM',
  subtitle: 'Wing I — glass, shadow and a narrow window',
  start: { x: 118, y: 572 },
  exit: { x: 1108, y: 596, r: 38 },
  rooms: [
    { x: 40, y: 96, w: 250, h: 250, label: 'WEST GALLERY' },
    { x: 318, y: 96, w: 420, h: 240, label: 'MOON COURT' },
    { x: 770, y: 96, w: 388, h: 210, label: 'EAST WING' },
    { x: 560, y: 384, w: 600, h: 274, label: 'NIGHT CORRIDOR' },
  ],
  obstacles: [
    { x: 290, y: 128, w: 30, h: 242, kind: 'wall' },
    { x: 290, y: 342, w: 230, h: 26, kind: 'wall' },
    { x: 760, y: 116, w: 30, h: 194, kind: 'wall' },
    { x: 760, y: 288, w: 240, h: 26, kind: 'wall' },
    { x: 522, y: 442, w: 28, h: 214, kind: 'wall' },
    { x: 900, y: 620, w: 190, h: 24, kind: 'wall' },
    { x: 606, y: 404, w: 98, h: 66, kind: 'plinth', art: '#e8b45d' },
    { x: 980, y: 196, w: 108, h: 66, kind: 'plinth', art: '#77d7d1' },
  ],
  covers: [
    { x: 150, y: 418, w: 124, h: 94, label: 'VELVET' },
    { x: 566, y: 176, w: 128, h: 88, label: 'SHADOW' },
    { x: 1004, y: 394, w: 118, h: 90, label: 'SHADOW' },
  ],
  loot: [
    { id: 'glass-lark', name: 'GLASS LARK', x: 626, y: 158, r: 15, value: 600 },
    { id: 'amber-lens', name: 'AMBER LENS', x: 944, y: 454, r: 15, value: 850 },
  ],
  guards: [
    { id: 'A1', x: 152, y: 152, route: [[152, 152], [152, 392], [232, 392], [232, 152]], speed: 78, range: 212, fov: 0.78, scan: 0.28 },
    { id: 'B4', x: 578, y: 140, route: [[578, 140], [704, 140], [704, 366], [578, 366]], speed: 84, range: 224, fov: 0.74, scan: 0.24 },
    { id: 'C2', x: 866, y: 588, route: [[866, 588], [1092, 588], [1092, 414], [872, 414]], speed: 80, range: 218, fov: 0.76, scan: 0.3 },
  ],
  cameras: [
    { id: 'LENS-7', x: 1148, y: 116, center: 2.42, sweep: 0.52, speed: 0.72, phase: 0.4, range: 268, fov: 0.66 },
  ],
};

const glassbone = {
  id: 'glassbone',
  name: 'THE GLASSBONE WING',
  subtitle: 'Wing II — the curators changed the patrols',
  start: { x: 104, y: 614 },
  exit: { x: 1090, y: 126, r: 38 },
  rooms: [
    { x: 40, y: 96, w: 180, h: 550, label: 'SERVICE WALK' },
    { x: 278, y: 150, w: 280, h: 380, label: 'BONE HALL' },
    { x: 600, y: 96, w: 280, h: 150, label: 'NORTH VAULT' },
    { x: 610, y: 310, w: 270, h: 340, label: 'GLASS COURT' },
    { x: 940, y: 96, w: 226, h: 550, label: 'CURATOR ROW' },
  ],
  obstacles: [
    { x: 230, y: 90, w: 30, h: 302, kind: 'wall' },
    { x: 230, y: 90, w: 302, h: 30, kind: 'wall' },
    { x: 560, y: 250, w: 30, h: 330, kind: 'wall' },
    { x: 560, y: 250, w: 252, h: 30, kind: 'wall' },
    { x: 900, y: 90, w: 30, h: 282, kind: 'wall' },
    { x: 900, y: 360, w: 230, h: 30, kind: 'wall' },
    { x: 320, y: 558, w: 220, h: 30, kind: 'wall' },
    { x: 700, y: 520, w: 108, h: 70, kind: 'plinth', art: '#c58ce8' },
    { x: 1042, y: 424, w: 88, h: 86, kind: 'plinth', art: '#e8b45d' },
  ],
  covers: [
    { x: 112, y: 382, w: 108, h: 92, label: 'VELVET' },
    { x: 446, y: 418, w: 100, h: 96, label: 'SHADOW' },
    { x: 762, y: 174, w: 122, h: 72, label: 'SHADOW' },
    { x: 1066, y: 558, w: 92, h: 84, label: 'VELVET' },
  ],
  loot: [
    { id: 'ivory-codex', name: 'IVORY CODEX', x: 392, y: 194, r: 15, value: 700 },
    { id: 'night-bell', name: 'NIGHT BELL', x: 792, y: 452, r: 15, value: 900 },
    { id: 'tide-crown', name: 'TIDE CROWN', x: 1026, y: 268, r: 15, value: 1100 },
  ],
  guards: [
    { id: 'D8', x: 118, y: 168, route: [[118, 168], [118, 526], [190, 526], [190, 168]], speed: 86, range: 220, fov: 0.76, scan: 0.3 },
    { id: 'E1', x: 388, y: 174, route: [[388, 174], [502, 174], [502, 330], [388, 330]], speed: 90, range: 226, fov: 0.72, scan: 0.26 },
    { id: 'F5', x: 640, y: 412, route: [[640, 412], [862, 412], [862, 620], [640, 620]], speed: 88, range: 230, fov: 0.75, scan: 0.32 },
  ],
  cameras: [
    { id: 'LENS-2', x: 1136, y: 82, center: 2.36, sweep: 0.56, speed: 0.82, phase: 1.1, range: 276, fov: 0.64 },
    { id: 'LENS-9', x: 588, y: 656, center: -1.35, sweep: 0.5, speed: 0.66, phase: 2.2, range: 250, fov: 0.68 },
  ],
};

const nocturne = {
  id: 'nocturne',
  name: 'THE NOCTURNE VAULT',
  subtitle: 'Wing III — every lens is awake',
  start: { x: 98, y: 138 },
  exit: { x: 1100, y: 604, r: 38 },
  rooms: [
    { x: 38, y: 94, w: 170, h: 260, label: 'NORTH ENTRY' },
    { x: 268, y: 94, w: 260, h: 272, label: 'RELIC HALL' },
    { x: 580, y: 180, w: 300, h: 190, label: 'SILVER ROOM' },
    { x: 268, y: 420, w: 270, h: 238, label: 'LOWER VAULT' },
    { x: 582, y: 420, w: 430, h: 238, label: 'NIGHT SAFE' },
  ],
  obstacles: [
    { x: 220, y: 202, w: 30, h: 458, kind: 'wall' },
    { x: 220, y: 202, w: 320, h: 28, kind: 'wall' },
    { x: 540, y: 382, w: 30, h: 278, kind: 'wall' },
    { x: 540, y: 382, w: 268, h: 28, kind: 'wall' },
    { x: 880, y: 120, w: 30, h: 320, kind: 'wall' },
    { x: 700, y: 120, w: 210, h: 28, kind: 'wall' },
    { x: 1030, y: 440, w: 30, h: 190, kind: 'wall' },
    { x: 354, y: 552, w: 110, h: 64, kind: 'plinth', art: '#77d7d1' },
    { x: 694, y: 520, w: 112, h: 64, kind: 'plinth', art: '#e8b45d' },
    { x: 978, y: 258, w: 92, h: 70, kind: 'plinth', art: '#c58ce8' },
  ],
  covers: [
    { x: 108, y: 400, w: 104, h: 92, label: 'VELVET' },
    { x: 292, y: 320, w: 106, h: 78, label: 'SHADOW' },
    { x: 596, y: 300, w: 90, h: 72, label: 'SHADOW' },
    { x: 824, y: 500, w: 104, h: 82, label: 'VELVET' },
  ],
  loot: [
    { id: 'moon-harp', name: 'MOON HARP', x: 380, y: 304, r: 15, value: 800 },
    { id: 'salt-diary', name: 'SALT DIARY', x: 762, y: 292, r: 15, value: 950 },
    { id: 'ember-orb', name: 'EMBER ORB', x: 960, y: 210, r: 15, value: 1150 },
    { id: 'quartz-key', name: 'QUARTZ KEY', x: 660, y: 610, r: 15, value: 1300 },
  ],
  guards: [
    { id: 'G3', x: 112, y: 208, route: [[112, 208], [112, 650], [188, 650], [188, 208]], speed: 92, range: 232, fov: 0.78, scan: 0.32 },
    { id: 'H6', x: 284, y: 292, route: [[284, 292], [500, 292], [500, 348], [284, 348]], speed: 96, range: 236, fov: 0.74, scan: 0.28 },
    { id: 'J2', x: 620, y: 300, route: [[620, 300], [840, 300], [840, 352], [620, 352]], speed: 94, range: 238, fov: 0.76, scan: 0.3 },
    { id: 'K9', x: 950, y: 468, route: [[950, 468], [1010, 468], [1010, 648], [950, 648]], speed: 98, range: 240, fov: 0.8, scan: 0.34 },
  ],
  cameras: [
    { id: 'LENS-1', x: 1164, y: 100, center: 2.48, sweep: 0.58, speed: 0.88, phase: 0.2, range: 286, fov: 0.66 },
    { id: 'LENS-4', x: 566, y: 668, center: -1.32, sweep: 0.56, speed: 0.74, phase: 1.7, range: 268, fov: 0.68 },
    { id: 'LENS-6', x: 34, y: 668, center: -0.92, sweep: 0.52, speed: 0.8, phase: 2.9, range: 262, fov: 0.68 },
  ],
};

export const LEVELS = [atrium, glassbone, nocturne];
