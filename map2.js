// LANTERNRISE: the second map, for the critters of slots 152-251. North is -z. All numbers are metres.
// Terrain calls are documented in terrain.js; the first map (map.js) explains the three rings, which this one keeps
// so that the round plays by the same rules: a hub in a bowl, eight inner habitats, eight outer ones.
//
// An old hill country in autumn, and nothing in it is level. Where Crossway is a plate with landmarks stood on it,
// this is high ground and low ground: every inner habitat rolls in terraces a ball can climb a step at a time, the
// outer ring stands a storey above it, and three pilgrim roads leave the Square and climb, by a pass and then a
// great stair, to the three things you can see from anywhere: the snow peak, the tower hill and the standing stones.
// Whoever holds the high ground sees the whole map, and can roll down off it in any direction.
//
//                      N   Kiteflower Downs  ->  Mount Hushpeak (stair)
//      NW  Applewind Orchard -> Cloudstep Moor        NE  Paddy Steps -> Thunderstep Crags
//   W   Whispering Canes -> Tolling Hill (stair)   LANTERN SQUARE   E   Maplefall Wood -> the Slumbering Stones (stair)
//      SW  Stillmere Fen -> Dragonspine Ravine         SE  Redclay Hollows -> Emberkiln Ridge
//                      S   Whirlshell Strand  ->  the shallows, Spiral Bay and the Spiral Isles
//
// A river runs off the moor, down through the orchard and the canes into Lake Stillmere, and out through the ravine,
// whose floor is a road for a small ball between walls a big one can jump down from.
import { vnoise, hash2 } from './terrain.js';
import * as hubSet from './habitats/hub.js';
import * as northSet from './habitats/north.js';
import * as eastSet from './habitats/east.js';
import * as southSet from './habitats/south.js';
import * as westSet from './habitats/west.js';
import * as lanternSet from './habitats/lanternrise.js';

export const ID = 'lanternrise', NAME = 'Lanternrise';
export const ROSTER = [152, 251];                          // the slots that live here
export const BOUNDS = { x1: -240, x2: 240, z1: -240, z2: 240 };
export const STARTS = [[-21, 21], [21, 21], [21, -21], [-21, -21]];      // team 0 (the player) first; all 30 m from the feast
export const START = { x: STARTS[0][0], z: STARTS[0][1] };
export const R_HUB = 50, R_INNER = 122, LIP = 0.35;
const FLOOR = 1.55;                                        // the outer ring's lowest ground: a storey above the inner ring's

export const BIOMES = [
  { id: 'ocean',     name: 'the open ocean',        hab: null },
  { id: 'hub',       name: 'Lantern Square',        hab: 'town' },
  { id: 'downs',     name: 'Kiteflower Downs',      hab: 'plain' },
  { id: 'peak',      name: 'Mount Hushpeak',        hab: 'summit' },
  { id: 'paddies',   name: 'the Paddy Steps',       hab: 'farm' },
  { id: 'crags',     name: 'Thunderstep Crags',     hab: 'mountain' },
  { id: 'wood',      name: 'Maplefall Wood',        hab: 'forest' },
  { id: 'stones',    name: 'the Slumbering Stones', hab: 'ruins' },
  { id: 'hollows',   name: 'Redclay Hollows',       hab: 'canyon' },
  { id: 'kiln',      name: 'Emberkiln Ridge',       hab: 'volcano' },
  { id: 'strand',    name: 'Whirlshell Strand',     hab: 'beach' },
  { id: 'tidepool',  name: 'the Shallows',          hab: 'tidepool' },
  { id: 'sea',       name: 'Spiral Bay',            hab: 'sea' },
  { id: 'islet',     name: 'the Spiral Isles',      hab: 'islet' },
  { id: 'fen',       name: 'Stillmere Fen',         hab: 'marsh' },
  { id: 'ravine',    name: 'Dragonspine Ravine',    hab: 'gorge' },
  { id: 'canes',     name: 'the Whispering Canes',  hab: 'forest' },
  { id: 'towerhill', name: 'Tolling Hill',          hab: 'ruins' },
  { id: 'orchard',   name: 'Applewind Orchard',     hab: 'farm' },
  { id: 'moor',      name: 'Cloudstep Moor',        hab: 'plain' },
];
export const B = Object.fromEntries(BIOMES.map((b, i) => [b.id, i]));
const INNER = ['downs', 'paddies', 'wood', 'hollows', 'strand', 'fen', 'canes', 'orchard'];        // by wedge: N, NE, E, SE, S, SW, W, NW
const OUTER = ['peak', 'crags', 'stones', 'kiln', 'tidepool', 'ravine', 'towerhill', 'moor'];

// A hundred species here against the first map's hundred and fifty: each turns up half as often again, so the land
// is as full. (main.js multiplies its critter density by this.)
export const DENSITY = 1.5;
export const REHOME = {};
// The Square's guests are this map's smallest critters, the ones a new 60 cm ball can roll up: the species that live
// in town here are mostly too big for the opening scramble.
export const GUESTS = {
  town: ['pipnod', 'sparklet', 'twinklet', 'kernlet', 'puffseed', 'plipmouse', 'mudlet', 'tuftsnout', 'chillip', 'petalance', 'emberquill', 'threadling', 'glimfin', 'trunklet'],
  summit: ['gritlet'],
  mountain: ['conelet'],
  ruins: ['threadling'],
  islet: ['plipmouse', 'reefsprig'],
  sea: ['squirtfin'],
};

// Named places. The habitat file builds on these, the CPU teams steer by them and events happen at them.
// (`pier` and `islets` are the names the Cold Snap event looks for.)
export const PLACES = {
  feast: [0, 0],
  kiteField: [0, -88], peak: [0, -186], peakStair: [0, -128],
  paddyHouse: [62, -62], crag: [133, -133],
  mapleHeart: [88, 4], stones: [182, 6], stonesStair: [140, 6],
  clayPits: [62, 64], kiln: [136, 134],
  pier: [0, 118], lighthouse: [36, 152], islets: [[-30, 196], [18, 204], [62, 188], [-74, 182]],
  lake: [-62, 62], ravineMouth: [-92, 100], ravineHead: [-138, 150],
  caneGate: [-88, -2], towerHill: [-184, -4], towerStair: [-124, -4],
  ciderPress: [-62, -64], moorCairn: [-134, -134],
};
// Where a ball should be heading for its size, by wedge from north clockwise: [inner place, outer place, ball size
// needed for the outer one]. The three with a pilgrim road can be climbed sooner than the rest.
export const ROUTES = [
  [PLACES.kiteField, [0, -140], 2.2], [PLACES.paddyHouse, [106, -106], 3.4], [PLACES.mapleHeart, [146, 6], 2.2], [PLACES.clayPits, [108, 106], 3.4],
  [[0, 96], [30, 140], 2.8], [PLACES.lake, [-112, 124], 3], [PLACES.caneGate, [-134, -4], 2.2], [PLACES.ciderPress, [-110, -110], 3.4],
];
// What the events are told about this map: names for banners, the hearts of the inner habitats, the landmarks.
export const EVENT = {
  HUB: ['Square', 'Lantern Square'],
  SURGE: ['downs', 'paddies', 'wood', 'hollows', 'strand', 'fen', 'canes', 'orchard'],
  PLACE_INFO: {
    kiteField: ['Kite Field', 'the Kite Field'], paddyHouse: ['Paddy House', 'the house on the Paddy Steps'], mapleHeart: ['Maple Heart', 'the heart of Maplefall Wood'],
    clayPits: ['Clay Pits', 'the Clay Pits'], pier: ['Pier', 'the Pier'], lake: ['Lake', 'Lake Stillmere'], caneGate: ['Cane Gate', 'the gate in the Canes'], ciderPress: ['Cider Press', 'the Cider Press'],
    stonesStair: ['Stones', 'the foot of the Slumbering Stones'], towerStair: ['Tolling Hill', 'the foot of Tolling Hill'], peakStair: ['Hushpeak', 'the foot of Mount Hushpeak'],
    lighthouse: ['Lighthouse', 'the Lighthouse'], moorCairn: ['Cairn', 'the cairn on Cloudstep Moor'], ravineMouth: ['Ravine', 'the mouth of Dragonspine Ravine'],
    kilnFoot: ['Kiln', 'the foot of Emberkiln Ridge'], cragFoot: ['Crags', 'the foot of Thunderstep Crags'],
  },
  EXTRA_PLACES: { kilnFoot: [104, 100], cragFoot: [100, -100] },
  INNER_PLACES: ['kiteField', 'paddyHouse', 'mapleHeart', 'clayPits', 'pier', 'lake', 'caneGate', 'ciderPress'],
  OUTER_PLACES: ['stonesStair', 'towerStair', 'peakStair', 'lighthouse', 'moorCairn', 'ravineMouth', 'kilnFoot', 'cragFoot'],
};

// ---- the shape of the land ----
const TAU = Math.PI * 2, WEDGE = Math.PI / 4;
const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const angOf = (x, z) => Math.atan2(x, -z);                     // 0 = north, clockwise
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
// The coast: about 214 m out, wobbling, with a wide bay bitten out of the south and a cape either side of it.
function coastR(a) {
  const base = 212 + (vnoise(Math.cos(a) * 3 + 80, Math.sin(a) * 3 + 80) - 0.5) * 22 + (vnoise(Math.cos(a) * 8 + 30, Math.sin(a) * 8 + 30) - 0.5) * 9;
  const s = Math.abs(angDiff(a, Math.PI));
  return base - 62 * (1 - sm(0.3, 0.64, s)) + 8 * Math.exp(-((s - 0.86) ** 2) / 0.012);
}
export function biomeOf(x, z) {
  const r = Math.hypot(x, z), a = angOf(x, z);
  const aw = a + (vnoise(x / 45 + 71, z / 45 + 57) - 0.5) * 0.3, rw = r + (vnoise(x / 28 + 45, z / 28 + 49) - 0.5) * 12;
  const wedge = ((Math.round(aw / WEDGE) % 8) + 8) % 8, cr = coastR(a);
  if (r < R_HUB - 4 || rw < R_HUB) return { b: B.hub, r, rw, a, wedge, cr };
  if (r > cr) return { b: Math.abs(angDiff(a, Math.PI)) < 0.72 ? (r < cr + 15 ? B.tidepool : B.sea) : B.ocean, r, rw, a, wedge, cr };
  return { b: B[(rw < R_INNER ? INNER : OUTER)[wedge]], r, rw, a, wedge, cr };
}
// River: off the moor, through the orchard and the canes, into the lake, out by the ravine to the sea.
export const RIVER = [[-128, -152], [-116, -122], [-104, -88], [-94, -44], [-82, 8], [-70, 44], [-62, 62], [-82, 90], [-110, 116], [-136, 146], [-150, 184], [-156, 228]];
function riverDist(x, z) {
  let best = 1e9;
  for (let s = 0; s < RIVER.length - 1; s++) {
    const [ax, az] = RIVER[s], [bx, bz] = RIVER[s + 1], dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < best) best = d;
  }
  return best + (vnoise(x / 9 + 13, z / 9 + 18) - 0.5) * 3;
}
const dist = (x, z, p) => Math.hypot(x - p[0], z - p[1]);
const mix = (c1, c2, t) => { const r = (c1 >> 16 & 255) * (1 - t) + (c2 >> 16 & 255) * t, g = (c1 >> 8 & 255) * (1 - t) + (c2 >> 8 & 255) * t, b = (c1 & 255) * (1 - t) + (c2 & 255) * t; return (r << 16) | (g << 8) | b; };
const n1 = (x, z, s, o = 0) => vnoise(x / s + o, z / s + o * 1.7);
const cone = (d, rings, base) => { let h = base; for (const [rad, hh] of rings) if (d < rad) h = hh; return h; };
// The hills: one slow swell under everything, so a rise carries on across a habitat's edge. 0 to 1.
const swell = (x, z) => n1(x, z, 58, 200) * 0.5 + n1(x, z, 27, 210) * 0.32 + n1(x, z, 12, 220) * 0.18;
// ...cut into terraces `step` high: nothing above `from` of the swell rises at all, the top of it rises by `amp`.
const terraces = (v, from, amp, step) => Math.round(Math.max(0, v - from) / (1 - from) * amp / step) * step;

const WATER = 0x6fc3ee, SHALLOW = 0x8fd9ea, LAVA = 0xff7a26, MURK = 0x6fa494, PADDY = 0x9fd8d0;
// The landmarks' rings: [radius, height] outermost first (see cone). The stairs in scenery() climb the same rings.
const PEAK = [[58, 3.35], [48, 5.75], [38, 8.75], [28, 13.25], [19, 18.65], [10, 25.85]];
const TOWER = [[60, 2.75], [47, 4.55], [35, 6.95], [24, 9.35], [13, 11.75]];
const STONE = [[30, 2.15], [23, 3.35], [16, 4.55], [9, 6.35]];          // square, not round: a stepped platform
const KILN = [[56, 2.75], [44, 4.55], [33, 7.55], [23, 10.55], [12, 8.15]];
const CRAGS = [[[133, -133], [[44, 3.95], [31, 6.95], [20, 10.55], [10, 15.35]]], [[168, -92], [[26, 3.95], [16, 6.35], [8, 9.35]]], [[96, -168], [[24, 3.35], [14, 5.75], [7, 8.15]]]];

function colourOf(b, x, z, h) {
  const n = n1(x, z, 13, 3), f = n1(x, z, 5, 9);
  switch (BIOMES[b].id) {
    case 'hub': return n > 0.55 ? 0xa3d68a : 0xaedc92;
    case 'downs': return f > 0.9 ? 0xe9a8c4 : n > 0.6 ? 0xc6d07a : 0xb4d27c;
    case 'peak': return h > 12 ? 0xffffff : h > 5 ? 0xe8eef4 : n > 0.6 ? 0xa9b6a0 : 0xb9c2b4;
    case 'paddies': { const k = hash2(Math.round(h * 10), 7); return k < 0.34 ? 0x9bd070 : k < 0.67 ? 0xcfd070 : 0x8ecf80; }
    case 'crags': return h > 9 ? 0xb4b0a8 : n > 0.58 ? 0x7f9f72 : f > 0.8 ? 0x8a867c : 0x9a968c;
    case 'wood': return n > 0.62 ? 0xb8663a : f > 0.8 ? 0xd9903a : 0x8a9a4a;
    case 'stones': return n > 0.6 ? 0xbfc79a : f > 0.8 ? 0xc9bb94 : 0xd0c8a8;
    case 'hollows': return n > 0.62 ? 0xc9744a : f > 0.84 ? 0xd98a5a : 0xe3b58a;
    case 'kiln': return h > 9 ? 0x3a3432 : n > 0.6 ? 0x5a463c : 0x4a4240;
    case 'strand': return n > 0.66 ? 0xe6d397 : 0xf0e0a8;
    case 'tidepool': return n > 0.55 ? 0xb8ad98 : f > 0.78 ? 0x9fa39a : 0xd9cc9c;
    case 'sea': case 'ocean': return 0xcdbf8a;
    case 'islet': return 0xeedfa6;
    case 'fen': return n > 0.6 ? 0x8a7a55 : f > 0.8 ? 0x6f9458 : 0x7fa064;
    case 'ravine': return n > 0.6 ? 0x8f8a76 : 0x74a362;
    case 'canes': return n > 0.62 ? 0x6aa84a : f > 0.82 ? 0xa8d46a : 0x7fb85a;
    case 'towerhill': return h > 9 ? 0xd8cdb4 : n > 0.6 ? 0xa9b97a : 0xb7c98a;
    case 'orchard': { const row = ((x - z + 600) % 9) < 1.4; return row ? 0x86c46a : n > 0.6 ? 0xa9d97a : 0x9bd070; }
    case 'moor': return n > 0.6 ? 0xa98ab8 : f > 0.8 ? 0x8aa870 : 0x9ab87a;
  }
  return 0x8ed27a;
}

function tile(x, z) {
  const q = biomeOf(x, z), id = BIOMES[q.b].id, { r, rw, cr } = q;
  const sw = swell(x, z), ease = sm(54, 68, rw);            // level ground for the first few metres out of the Square
  const low = (from, amp) => LIP + terraces(sw, from, amp, 0.3) * (ease > 0.5 ? 1 : 0);
  const high = (from, amp, base = FLOOR) => base + terraces(sw, from, amp, 0.6);
  let h = LIP, w = 0, c = null;
  switch (id) {
    case 'hub': h = 0; break;
    case 'ocean': case 'sea': h = r < cr + 7 ? -0.2 : -1.3; w = h > -0.3 ? 1 : 0; if (w) c = SHALLOW; break;
    case 'tidepool':
      if (r > cr) { h = -0.2; w = 1; c = SHALLOW; }
      else { h = 0; if (n1(x, z, 7, 21) > 0.68) { h = -0.15; w = 1; c = SHALLOW; } }
      break;
    case 'strand': h = rw < 76 ? LIP : rw < 100 ? 0.2 : 0.05; if (rw > 60 && rw < 98 && n1(x, z, 9, 33) > 0.72) { h += 0.3; c = 0xf6e8b8; } break;       // dunes
    case 'downs': h = low(0.36, 1.5); break;
    case 'paddies': {                                       // steps climbing away from the Square, some of them flooded
      const k = Math.min(4, Math.floor(Math.max(0, rw - 64) / 11));
      h = LIP + k * 0.3;
      if (k > 0 && hash2(k, q.wedge * 13 + Math.floor((q.a + 9) * 6)) > 0.62 && (rw - 64) % 11 > 2.5) { h -= 0.08; w = 1; c = PADDY; }
      break;
    }
    case 'wood': h = low(0.4, 1.2); break;
    case 'hollows': { const m = n1(x, z, 17, 170) * 0.75 + n1(x, z, 7, 175) * 0.25; h = m > 0.68 && rw > 64 && rw < 116 ? (m > 0.76 ? 5.15 : 3.05) : low(0.55, 0.6); if (h > 2) c = m > 0.76 ? 0xb8663a : 0xc9744a; break; }
    case 'fen': if (rw > 58 && n1(x, z, 10, 190) > 0.63) { h = 0.2; w = 1; c = MURK; } break;
    case 'canes': h = low(0.42, 0.9); break;
    case 'orchard': h = low(0.36, 1.5); break;
    case 'peak': h = cone(dist(x, z, PLACES.peak), PEAK, high(0.45, 1.8)); break;
    case 'crags': { h = high(0.4, 2.4); for (const [p, rings] of CRAGS) h = Math.max(h, cone(dist(x, z, p), rings, 0)); break; }
    case 'stones': { const t = PLACES.stones, d = Math.max(Math.abs(x - t[0]), Math.abs(z - t[1])); h = cone(d, STONE, high(0.5, 1.2)); if (d < 30) c = d < 9 ? 0xf0e6c4 : 0xe0d6b4; break; }
    case 'kiln': {
      const d = dist(x, z, PLACES.kiln), d2 = dist(x, z, [182, 96]);
      h = Math.max(cone(d, KILN, high(0.5, 1.2)), cone(d2, [[22, 3.35], [14, 5.75], [7, 4.55]], 0));
      if (d < 12 || d2 < 7) c = LAVA; else if (Math.abs(n1(x, z, 15, 160) - 0.5) < 0.02) c = LAVA;
      break;
    }
    case 'ravine': h = high(0.45, 1.8, FLOOR + 1.2); break;
    case 'towerhill': h = cone(dist(x, z, PLACES.towerHill), TOWER, high(0.5, 1.2)); break;
    case 'moor': h = high(0.3, 3, FLOOR + 0.6); break;
  }
  if (c === null) {
    const jx = x + (hash2(Math.floor(x) * 3 + 1, Math.floor(z) * 3 + 2) - 0.5) * 13, jz = z + (hash2(Math.floor(x) * 3 + 7, Math.floor(z) * 3 + 5) - 0.5) * 13;
    const jb = biomeOf(jx, jz).b, land = (bb) => bb !== B.ocean && bb !== B.sea;
    c = colourOf(land(jb) && land(q.b) && id !== 'paddies' ? jb : q.b, x, z, h);
  }
  // the river
  if (q.b !== B.ocean && q.b !== B.sea && q.b !== B.hub) {
    const rd = riverDist(x, z), gorge = id === 'ravine';
    if (rd < 3.6) { h = gorge ? 0.25 : Math.max(-0.2, h - 0.2); w = 1; c = id === 'fen' ? MURK : WATER; }
    else if (gorge && rd < 11) { h = 0.45; c = n1(x, z, 6, 130) > 0.5 ? 0xb8ad98 : 0xcdbf9a; }                      // the ravine floor, either side of the water
    else if (!gorge && rd < 5.5) c = mix(c, 0xcdbf8a, 0.55);
  }
  return { h, c, w, b: q.b };
}

export function scenery(m) {
  m.tiles(tile);
  const P = PLACES, ROAD = 0xe0cf9c, STEP = 0xe6dcc0;
  // ---- Lantern Square: a round plaza, a ring road, four spoke roads
  for (let a = 0; a < 720; a++) { const t = a / 720 * TAU; m.paint(Math.cos(t) * 36 - 2, Math.sin(t) * 36 - 2, Math.cos(t) * 36 + 2, Math.sin(t) * 36 + 2, ROAD); }
  for (const [x, z] of STARTS) m.path([[x * 0.5, z * 0.5], [x, z]], 3, ROAD);
  m.ellipse(0, 0, 10, 10, 0, 0xd8cdb4);
  for (let i = 0; i < 12; i++) { const t = i / 12 * TAU; m.ellipse(Math.cos(t) * 7.5, Math.sin(t) * 7.5, 1.2, 1.2, 0, i & 1 ? 0xc94f40 : 0xf2d24a); }      // a ring of painted discs round the feast
  for (const [x, z] of STARTS) m.ellipse(x, z, 3, 3, 0, 0xf3ead7);
  m.pool(-30, -8, 5, 0.06, WATER); m.pool(30, 8, 5, 0.06, WATER);

  // ---- the three pilgrim roads. Each: a level road cut out of the Square through the hills, a pass (one long ramp up
  // to the outer ring's floor), a level approach, and a stair of ramps up the landmark's own rings. Any ball can climb
  // them; what waits at the top is another matter.
  m.ellipse(P.towerHill[0], P.towerHill[1], 11, 11, 11.75, 0xd8cdb4);                          // the tower's paved top, and the stones' (before the stairs, which cut into them)
  m.ellipse(P.stones[0], P.stones[1], 8, 8, 6.35, 0xf0e6c4);
  // north, to Mount Hushpeak
  m.trench([[0, -50], [0, -106]], 7, LIP, ROAD);
  m.ramp(-3.5, -128, 3.5, -106, 'n', LIP, FLOOR, STEP);
  { let z = -128, h = FLOOR; for (const [rad, hh] of PEAK) { const top = P.peak[1] + rad; if (top < z) m.fill(-3.5, top, 3.5, z, h, ROAD); m.ramp(-3.5, top - 7, 3.5, top, 'n', h, hh, STEP); z = top - 7; h = hh; } }
  // east, to the Slumbering Stones (a square platform: the stair runs straight up its west face)
  m.trench([[50, 6], [108, 6]], 7, LIP, ROAD);
  m.ramp(108, 2.5, 130, 9.5, 'e', LIP, FLOOR, STEP);
  { let x = 130, h = FLOOR; for (const [rad, hh] of STONE) { const foot = P.stones[0] - rad; if (foot > x) m.fill(x, 2.5, foot, 9.5, h, ROAD); m.ramp(foot, 2.5, foot + 6, 9.5, 'e', h, hh, STEP); x = foot + 6; h = hh; } }
  // west, to Tolling Hill
  m.trench([[-50, -4], [-102, -4]], 7, LIP, ROAD);
  m.ramp(-122, -7.5, -102, -0.5, 'w', LIP, FLOOR, STEP);
  { let x = -122, h = FLOOR; for (const [rad, hh] of TOWER) { const foot = P.towerHill[0] + rad; if (foot < x) m.fill(foot, -7.5, x, -0.5, h, ROAD); m.ramp(foot - 7, -7.5, foot, -0.5, 'w', h, hh, STEP); x = foot - 7; h = hh; } }

  // ---- north: the kite field, a mown circle on the downs
  m.ellipse(P.kiteField[0] + 22, P.kiteField[1], 13, 11, LIP + 0.3, 0xc9e08a, 2);
  // ---- north-east: the house terrace on the Paddy Steps, and a pond for the ducks
  m.fill(P.paddyHouse[0] - 8, P.paddyHouse[1] - 7, P.paddyHouse[0] + 8, P.paddyHouse[1] + 7, LIP + 0.3, 0xcdb78a);
  m.pool(84, -40, 5, 0.1, WATER);
  // ---- east: a clearing in the wood
  m.ellipse(P.mapleHeart[0], P.mapleHeart[1] - 14, 11, 9, LIP, 0xd9a05a, 2.5);
  // ---- south-east: the clay pits, dug below the hollows
  for (const [dx, dz, rr] of [[0, 0, 8], [12, 7, 5], [-9, 9, 4.5]]) m.pool(P.clayPits[0] + dx, P.clayPits[1] + dz, rr, 0.12, 0xd99a72);
  // ---- south: the pier, and the Spiral Isles, each a little hill of its own
  m.trench([[0, 50], [0, 104]], 5, LIP, 0xd9c28a);
  m.fill(P.pier[0] - 2, 104, P.pier[0] + 2, 172, 0.5, 0xb08a5a);
  P.islets.forEach(([x, z], i) => {
    m.ellipse(x, z, 13, 10, 0.3, 0xeedfa6, 2.5); m.ellipse(x, z, 7.5, 6, 0.9, 0x9cc462, 1.2); m.ellipse(x, z, 3.5, 3, i & 1 ? 2.1 : 1.5, 0x86b85a, 0.6);
    m.biome(x, z, 15, 12, B.islet);
  });
  // ---- south-west: Lake Stillmere, with an island in it, and the way down into the ravine
  m.pool(P.lake[0], P.lake[1], 16, 0.15, 0x7fb4c4); m.ellipse(P.lake[0] + 3, P.lake[1] - 2, 4.5, 3.5, LIP + 0.3, 0x7fa064, 1);
  m.trench([[-76, 84], [P.ravineMouth[0], P.ravineMouth[1]]], 9, 0.45, 0xcdbf9a);
  // ---- west: the gate clearing in the canes
  m.ellipse(P.caneGate[0], P.caneGate[1] + 16, 10, 9, LIP, 0xa8d46a, 2);
  // ---- north-west: the cider press yard; the cairn knoll on the moor
  m.fill(P.ciderPress[0] - 9, P.ciderPress[1] - 8, P.ciderPress[0] + 9, P.ciderPress[1] + 8, LIP + 0.3, 0xcdb78a);
  m.ellipse(P.moorCairn[0], P.moorCairn[1], 15, 15, FLOOR + 3, 0xa98ab8, 2); m.ellipse(P.moorCairn[0], P.moorCairn[1], 7, 7, FLOOR + 3.6, 0xb89ac4, 1);
  // ---- trails to the hearts of the other inner habitats (colour only: these follow the ground up and down)
  const trail = (pts, wd, col) => m.path(pts, wd, col);
  trail([[42, -42], [P.paddyHouse[0] - 8, P.paddyHouse[1] + 7]], 3, 0xcdb78a);
  trail([[42, 42], [P.clayPits[0] - 8, P.clayPits[1] - 8]], 3, 0xd9a07a);
  trail([[-42, 42], [P.lake[0] + 13, P.lake[1] - 13]], 3, 0x8a7a55);
  trail([[-42, -42], [P.ciderPress[0] + 9, P.ciderPress[1] + 8]], 3, 0xcdb78a);
  trail([[0, -88], [22, -88]], 3, ROAD);
}

// ---- things: every prop the first map has is on hand here too, plus this map's own ----
export const ITEMS = [...hubSet.ITEMS, ...northSet.ITEMS, ...eastSet.ITEMS, ...southSet.ITEMS, ...westSet.ITEMS, ...lanternSet.ITEMS];
export const SHAPES = Object.assign({}, hubSet.SHAPES, northSet.SHAPES, eastSet.SHAPES, southSet.SHAPES, westSet.SHAPES, lanternSet.SHAPES);
export function layout(m) { lanternSet.dress(m, { PLACES, B, BIOMES }); }
