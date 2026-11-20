// CROSSWAY CONTINENT: the map for the four-team round. North is -z. All numbers are metres.
// Terrain calls are documented in terrain.js. (Earlier maps are kept in the old/ folder.)
//
// One continent with many climates, laid out like a compass rose round a shallow bowl:
//
//                      N   Frostfall Tundra  ->  Rimepeak (summit)
//      NW  Honeyfield Farms -> Windmill Prairie        NE  Stormworks -> Thunder Crags
//   W   Whisperwood -> Echo Gorge        CROSSWAY GREEN        E   Cinder Flats -> Mount Kiln
//      SW  Mirewater Marsh -> Gloomrest                SE  Sunscar Canyon -> Temple of Echoes
//                      S   Shellsand Beach  ->  Tide Pools, Pearl Bay and the Islets
//
// Three rings: the Green (0-50 m from the centre) sits in a bowl with a 35 cm lip, so nobody leaves until their
// ball is about 90 cm; the inner habitats (50-122 m) are gentle; the outer ones (122 m to the coast) are guarded
// by whatever fits the place: terraces, a river gorge, the sea. A river runs from the Rimepeak glacier down the
// west side to the sea. All four teams start on pads round the middle of the Green and race for the feast there.
//
// Each habitat is dressed by a file in habitats/ (its own props, built from simple shapes, and where they go).
import { vnoise, hash2 } from './terrain.js';
import * as hubSet from './habitats/hub.js';
import * as northSet from './habitats/north.js';
import * as eastSet from './habitats/east.js';
import * as southSet from './habitats/south.js';
import * as westSet from './habitats/west.js';

export const BOUNDS = { x1: -240, x2: 240, z1: -240, z2: 240 };
export const STARTS = [[-21, 21], [21, 21], [21, -21], [-21, -21]];      // team 0 (the player) first; all 30 m from the feast
export const START = { x: STARTS[0][0], z: STARTS[0][1] };
export const R_HUB = 50, R_INNER = 122, LIP = 0.35;

// Biome numbers are stored per tile (terrain tB). `hab` is the critter habitat that lives there.
export const BIOMES = [
  { id: 'ocean',     name: 'the open ocean',    hab: null },
  { id: 'hub',       name: 'Crossway Green',    hab: 'town' },
  { id: 'tundra',    name: 'Frostfall Tundra',  hab: 'tundra' },
  { id: 'summit',    name: 'Rimepeak',          hab: 'summit' },
  { id: 'works',     name: 'Stormworks',        hab: 'works' },
  { id: 'mountain',  name: 'Thunder Crags',     hab: 'mountain' },
  { id: 'ashflats',  name: 'Cinder Flats',      hab: 'volcano' },
  { id: 'caldera',   name: 'Mount Kiln',        hab: 'volcano' },
  { id: 'canyon',    name: 'Sunscar Canyon',    hab: 'canyon' },
  { id: 'ruins',     name: 'Temple of Echoes',  hab: 'ruins' },
  { id: 'beach',     name: 'Shellsand Beach',   hab: 'beach' },
  { id: 'tidepool',  name: 'the Tide Pools',    hab: 'tidepool' },
  { id: 'sea',       name: 'Pearl Bay',         hab: 'sea' },
  { id: 'islet',     name: 'the Islets',        hab: 'islet' },
  { id: 'marsh',     name: 'Mirewater Marsh',   hab: 'marsh' },
  { id: 'graveyard', name: 'Gloomrest',         hab: 'graveyard' },
  { id: 'forest',    name: 'Whisperwood',       hab: 'forest' },
  { id: 'gorge',     name: 'Echo Gorge',        hab: 'gorge' },
  { id: 'farm',      name: 'Honeyfield Farms',  hab: 'farm' },
  { id: 'plain',     name: 'Windmill Prairie',  hab: 'plain' },
];
export const B = Object.fromEntries(BIOMES.map((b, i) => [b.id, i]));
const INNER = ['tundra', 'works', 'ashflats', 'canyon', 'beach', 'marsh', 'forest', 'farm'];        // by wedge: N, NE, E, SE, S, SW, W, NW
const OUTER = ['summit', 'mountain', 'caldera', 'ruins', 'tidepool', 'graveyard', 'gorge', 'plain'];

// Critters that move house on this map (the three habitats the critter files do not know about, and a few better fits),
// and guests: species that also turn up, in small numbers, somewhere other than home.
export const REHOME = {
  tikka: 'tundra', surfcub: 'tundra', glacimane: 'tundra', rimegape: 'tundra', bergluga: 'tundra', nivolle: 'tundra',
  lodeling: 'works', ferrospine: 'works', staticurl: 'works', zumbrel: 'works', numbray: 'works', coilbound: 'works', screenip: 'works', springvolt: 'works', tikzap: 'works', dregslug: 'works',
  fenwisp: 'graveyard', gloamlamp: 'graveyard', umbrastalk: 'graveyard', downlo: 'graveyard', carrivane: 'graveyard', rustflap: 'graveyard', blightwing: 'graveyard', lunaveil: 'graveyard',
  kilnwing: 'volcano',
};
export const GUESTS = {
  town: ['inchlet', 'fuzzlet', 'snuffstar', 'mycopill', 'nibbin', 'tikka', 'lodeling', 'fanlet', 'springvolt', 'quillet'],
  tundra: ['dormlet', 'fanpip', 'cairnlet', 'fanlet'],
  works: ['dormlet', 'patchameo'],
  graveyard: ['puffunk', 'mycopill'],
  summit: ['cairnlet'],
  mountain: ['cairnlet', 'claypip'],
  sea: ['glimfry', 'brinkle'],
  islet: ['nibbin', 'pindle', 'sandflip'],
  ruins: ['claypip', 'pindle'],
};

// Named places. Habitat files build on these, the CPU teams steer by them and events happen at them.
export const PLACES = {
  feast: [0, 0],
  frozenLake: [-18, -92], peak: [0, -186], glacier: [-44, -158],
  yard: [62, -62], dam: [96, -70], crag: [133, -133],
  hotSprings: [88, 6], crater: [186, 0],
  oasis: [60, 64], temple: [133, 133],
  pier: [0, 118], lighthouse: [34, 150], islets: [[-30, 196], [18, 204], [62, 188], [-74, 182]],
  bog: [-62, 62], crypt: [-133, 133],
  grove: [-86, 4], falls: [-166, -18], gorgeMouth: [-124, 0],
  barnyard: [-62, -64], windmillHill: [-134, -134],
};

// ---- the shape of the land ----
const TAU = Math.PI * 2, WEDGE = Math.PI / 4;
const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const angOf = (x, z) => Math.atan2(x, -z);                     // 0 = north, clockwise
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
// The coast: about 214 m out, wobbling, with a wide bay bitten out of the south.
function coastR(a) {
  const base = 213 + (vnoise(Math.cos(a) * 3 + 50, Math.sin(a) * 3 + 50) - 0.5) * 20 + (vnoise(Math.cos(a) * 9 + 20, Math.sin(a) * 9 + 20) - 0.5) * 8;
  const s = Math.abs(angDiff(a, Math.PI));
  return base - 60 * (1 - sm(0.3, 0.66, s));
}
// Which biome is at (x,z). The borders between wedges and rings wander, so no habitat has a ruler-straight edge.
export function biomeOf(x, z) {
  const r = Math.hypot(x, z), a = angOf(x, z);
  const aw = a + (vnoise(x / 45 + 31, z / 45 + 17) - 0.5) * 0.3, rw = r + (vnoise(x / 28 + 5, z / 28 + 9) - 0.5) * 12;
  const wedge = ((Math.round(aw / WEDGE) % 8) + 8) % 8, cr = coastR(a);
  if (r < R_HUB - 4 || rw < R_HUB) return { b: B.hub, r, rw, a, wedge, cr };
  if (r > cr) return { b: Math.abs(angDiff(a, Math.PI)) < 0.72 ? (r < cr + 15 ? B.tidepool : B.sea) : B.ocean, r, rw, a, wedge, cr };
  return { b: B[(rw < R_INNER ? INNER : OUTER)[wedge]], r, rw, a, wedge, cr };
}
// River: from the Rimepeak glacier, west round the prairie, through Echo Gorge, out through the marsh to the sea.
export const RIVER = [[-44, -158], [-78, -134], [-116, -100], [-150, -56], [-168, -18], [-166, 22], [-150, 56], [-124, 90], [-96, 116], [-66, 150], [-52, 184], [-48, 226]];
function riverDist(x, z) {
  let best = 1e9;
  for (let s = 0; s < RIVER.length - 1; s++) {
    const [ax, az] = RIVER[s], [bx, bz] = RIVER[s + 1], dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < best) best = d;
  }
  return best + (vnoise(x / 9 + 3, z / 9 + 8) - 0.5) * 3;
}
const dist = (x, z, p) => Math.hypot(x - p[0], z - p[1]);
const mix = (c1, c2, t) => { const r = (c1 >> 16 & 255) * (1 - t) + (c2 >> 16 & 255) * t, g = (c1 >> 8 & 255) * (1 - t) + (c2 >> 8 & 255) * t, b = (c1 & 255) * (1 - t) + (c2 & 255) * t; return (r << 16) | (g << 8) | b; };
const n1 = (x, z, s, o = 0) => vnoise(x / s + o, z / s + o * 1.7);
// Stepped cone: picks the height for the innermost ring the point is inside. rings = [[radius, height], ...] outermost first.
const cone = (d, rings, base) => { let h = base; for (const [rad, hh] of rings) if (d < rad) h = hh; return h; };

// Ground colour of each biome (also used, jittered, to speckle one habitat into the next along their border).
const WATER = 0x6fc3ee, SHALLOW = 0x8fd9ea, ICE = 0xc4e9f4, LAVA = 0xff7a26, MURK = 0x6fa494;
function colourOf(b, x, z, h) {
  const n = n1(x, z, 13, 3), f = n1(x, z, 5, 9);
  switch (BIOMES[b].id) {
    case 'hub': return n > 0.55 ? 0x9bd884 : 0xa5dc8c;
    case 'tundra': return n > 0.62 ? 0xdfeaf2 : f > 0.8 ? 0xcfdde8 : 0xf3f7fb;
    case 'summit': return h > 12 ? 0xffffff : n > 0.6 ? 0xb9c2cc : 0xe8eef4;
    case 'works': return n > 0.66 ? 0x8f9499 : f > 0.84 ? 0xa39a86 : 0xb9bcc0;
    case 'mountain': return n > 0.58 ? 0x86a877 : f > 0.8 ? 0x8a867c : 0x9a968c;
    case 'ashflats': return n > 0.64 ? 0x7a6a52 : f > 0.86 ? 0x3e3a38 : 0x5a5450;
    case 'caldera': return h > 9 ? 0x3a3432 : n > 0.6 ? 0x54433c : 0x48413e;
    case 'canyon': return n > 0.62 ? 0xd39a62 : f > 0.84 ? 0xc98a5a : 0xe3c58a;
    case 'ruins': return n > 0.6 ? 0xe0cf9c : f > 0.8 ? 0xc9bb94 : 0xd9cfae;
    case 'beach': return n > 0.66 ? 0xe6d397 : 0xf0e0a8;
    case 'tidepool': return n > 0.55 ? 0xb8ad98 : f > 0.78 ? 0x9fa39a : 0xd9cc9c;
    case 'sea': case 'ocean': return 0xcdbf8a;
    case 'islet': return 0xeedfa6;
    case 'marsh': return n > 0.6 ? 0x8a7a55 : f > 0.8 ? 0x6f9458 : 0x7fa064;
    case 'graveyard': return n > 0.62 ? 0x6a6458 : f > 0.82 ? 0x586a52 : 0x66785e;
    case 'forest': return n > 0.62 ? 0x7a8f4a : f > 0.8 ? 0x4f9650 : 0x5fa85a;
    case 'gorge': return n > 0.6 ? 0x8f8a76 : 0x6aa35c;
    case 'farm': {
      const px = Math.floor((x + 300) / 17), pz = Math.floor((z + 300) / 17), k = hash2(px, pz);          // a patchwork of fields
      const edge = ((x + 300) % 17 < 1.2) || ((z + 300) % 17 < 1.2);
      return edge ? 0x86c46a : k < 0.3 ? 0xb9935f : k < 0.5 ? 0xd9c66a : k < 0.68 ? 0x9bd070 : 0x8ed27a;
    }
    case 'plain': return n > 0.6 ? 0xc9cf7a : f > 0.82 ? 0x9cc462 : 0xa9c96a;
  }
  return 0x8ed27a;
}

function tile(x, z) {
  const q = biomeOf(x, z), id = BIOMES[q.b].id, { r, rw, cr } = q;
  let h = LIP, w = 0, c = null;
  switch (id) {
    case 'hub': h = 0; break;
    case 'ocean': case 'sea': h = r < cr + 7 ? -0.2 : -1.3; w = h > -0.3 ? 1 : 0; if (w) c = SHALLOW; break;
    case 'tidepool':
      if (r > cr) { h = -0.2; w = 1; c = SHALLOW; }                                           // the shelf beyond the shoreline
      else { h = 0; if (n1(x, z, 7, 21) > 0.68) { h = -0.15; w = 1; c = SHALLOW; } }
      break;
    case 'beach': h = rw < 76 ? LIP : rw < 100 ? 0.2 : 0.05; break;
    case 'tundra': h = rw < 90 ? LIP : 0.7; break;
    case 'summit': h = cone(dist(x, z, PLACES.peak), [[50, 5.2], [38, 8.5], [27, 13], [17, 19], [9, 26]], rw < 142 ? 1.9 : rw < 162 ? 3.1 : 3.1); break;
    case 'works': h = LIP; break;
    case 'mountain': h = cone(dist(x, z, PLACES.crag), [[48, 4.6], [34, 7.5], [22, 12], [12, 18]], rw < 148 ? 1.55 : 2.75); break;
    case 'ashflats': h = LIP; if (Math.abs(n1(x, z, 17, 40) - 0.5) < 0.018 && rw > 62) c = LAVA; break;       // glowing cracks
    case 'caldera': {
      const d = dist(x, z, PLACES.crater);
      h = cone(d, [[62, 2.75], [47, 4.6], [35, 7.5], [25, 11], [13, 8.6]], 1.55);
      if (d < 13) c = LAVA; else if (Math.abs(n1(x, z, 15, 60) - 0.5) < 0.02) c = LAVA;
      break;
    }
    case 'canyon': { const m = n1(x, z, 17, 70) * 0.75 + n1(x, z, 7, 75) * 0.25; h = m > 0.7 && rw > 64 && rw < 116 ? (m > 0.77 ? 5.2 : 3.2) : LIP; if (h > 1) c = m > 0.77 ? 0xc47a4a : 0xd39a62; break; }
    case 'ruins': { const t = PLACES.temple, d = Math.max(Math.abs(x - t[0]), Math.abs(z - t[1])); h = d < 9 ? 5.45 : d < 16 ? 3.85 : d < 23 ? 2.65 : d < 30 ? 1.75 : 1.15; if (d < 30) c = d < 9 ? 0xf0e6c4 : 0xe0d6b4; break; }
    case 'marsh': if (rw > 58 && n1(x, z, 10, 90) > 0.62) { h = 0.2; w = 1; c = MURK; } break;      // no pools against the lip of the Green: they would be a step out
    case 'graveyard': h = cone(dist(x, z, PLACES.crypt), [[26, 1.9], [14, 2.8]], 1.15); break;
    case 'forest': h = LIP; break;
    case 'gorge': h = rw < 150 ? 1.55 : 2.75; break;
    case 'farm': h = LIP; break;
    case 'plain': h = LIP + Math.round(Math.max(0, n1(x, z, 26, 110) * 0.7 + n1(x, z, 11, 115) * 0.3 - 0.45) / 0.55 * 2.4 / 0.3) * 0.3; break;
  }
  // colour: sampled a few metres away at random, so neighbouring habitats speckle into each other
  if (c === null) {
    const jx = x + (hash2(Math.floor(x) * 3 + 1, Math.floor(z) * 3 + 2) - 0.5) * 13, jz = z + (hash2(Math.floor(x) * 3 + 7, Math.floor(z) * 3 + 5) - 0.5) * 13;
    const jb = biomeOf(jx, jz).b, land = (bb) => bb !== B.ocean && bb !== B.sea;
    c = colourOf(land(jb) && land(q.b) ? jb : q.b, x, z, h);
  }
  // the river
  if (q.b !== B.ocean && q.b !== B.sea && q.b !== B.hub) {
    const rd = riverDist(x, z), gorge = id === 'gorge';
    if (rd < 3.6) { h = gorge ? 0.25 : Math.max(-0.2, h - 0.2); w = 1; c = id === 'marsh' || id === 'graveyard' ? MURK : id === 'summit' || id === 'tundra' ? 0x9fdcf0 : WATER; }
    else if (gorge && rd < 10) { h = 0.45; c = n1(x, z, 6, 130) > 0.5 ? 0xb8ad98 : 0xcdbf9a; }                     // the gorge floor, either side of the water
    else if (!gorge && rd < 5.5 && id !== 'summit') c = mix(c, 0xcdbf8a, 0.55);                                    // a sandy bank
  }
  return { h, c, w, b: q.b };
}

export function scenery(m) {
  m.tiles(tile);
  const P = PLACES;
  // ---- Crossway Green: a paved ring road, four spoke roads and the feast lawn in the middle
  for (let a = 0; a < 720; a++) { const t = a / 720 * TAU; m.paint(Math.cos(t) * 36 - 2, Math.sin(t) * 36 - 2, Math.cos(t) * 36 + 2, Math.sin(t) * 36 + 2, 0xe0cf9c); }
  for (const [x, z] of STARTS) m.path([[x * 0.5, z * 0.5], [x, z]], 3, 0xe0cf9c);
  for (const [dx, dz] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) m.path([[dx * 36, dz * 36], [dx * 58, dz * 58]], 5, 0xe0cf9c);
  m.ellipse(0, 0, 9, 9, 0, 0xd8cdb4); for (let i = -9; i < 9; i += 3) for (let j = -9; j < 9; j += 3) if (((i + j) / 3) & 1 && Math.hypot(i + 1.5, j + 1.5) < 8) m.paint(i, j, i + 3, j + 3, 0xcbbfa6);
  for (const [x, z] of STARTS) m.ellipse(x, z, 3, 3, 0, 0xf3ead7);
  // two ornamental ponds
  m.pool(-30, -8, 5, 0.06, WATER); m.pool(30, 8, 5, 0.06, WATER);
  // ---- north: the frozen lake, the glacier tarn
  m.ellipse(P.frozenLake[0], P.frozenLake[1], 15, 11, 0.3, ICE, 2);
  m.ellipse(P.glacier[0], P.glacier[1], 9, 7, 1.7, 0x9fdcf0, 1.5);
  // ---- north-east: the Stormworks yard (asphalt, painted bays) and the reservoir behind the dam
  m.fill(48, -76, 78, -50, LIP, 0x8f9499); for (let i = 0; i < 5; i++) m.paint(51 + i * 5.5, -74, 51.6 + i * 5.5, -66, 0xf1c935);
  m.fill(84, -84, 108, -58, LIP, 0xb9bcc0); m.pool(96, -71, 9, 0.2, WATER);
  // ---- east: hot springs on the flats
  for (const [dx, dz, rr] of [[0, 0, 6], [9, 5, 4], [-7, 7, 3.5], [5, -8, 3]]) m.pool(P.hotSprings[0] + dx, P.hotSprings[1] + dz, rr, 0.12, 0x7fe0d0);
  // ---- south-east: the oasis, and a causeway up the temple steps
  m.ellipse(P.oasis[0], P.oasis[1], 13, 11, LIP, 0x9cc462, 2); m.pool(P.oasis[0], P.oasis[1], 7, 0.15, WATER);
  m.ramp(P.temple[0] - 3, P.temple[1] - 44, P.temple[0] + 3, P.temple[1] - 30, 's', 1.15, 1.75, 0xe0d6b4);
  // ---- south: the pier, the islets
  m.fill(P.pier[0] - 2, 104, P.pier[0] + 2, 172, 0.5, 0xb08a5a);
  for (const [x, z] of P.islets) { m.ellipse(x, z, 13, 10, 0.3, 0xeedfa6, 2.5); m.ellipse(x, z, 6, 5, 0.6, 0x9cc462, 1); m.biome(x, z, 15, 12, B.islet); }
  // ---- south-west: the big bog
  m.pool(P.bog[0], P.bog[1], 11, 0.15, MURK); m.ellipse(P.bog[0] + 2, P.bog[1] - 1, 3.5, 3, LIP, 0x7fa064, 1);
  // ---- west: a sunny grove, and the side canyon that lets small balls into the gorge
  m.ellipse(P.grove[0], P.grove[1], 12, 10, LIP, 0x8ed27a, 2.5);
  m.trench([[-118, 0], [-160, 2]], 9, 0.45, 0xcdbf9a);
  // ---- north-west: the barnyard and a pond; the windmill hill on the prairie
  m.fill(P.barnyard[0] - 9, P.barnyard[1] - 8, P.barnyard[0] + 9, P.barnyard[1] + 8, LIP, 0xcdb78a); m.pool(-84, -40, 6, 0.12, WATER);
  m.ellipse(P.windmillHill[0], P.windmillHill[1], 16, 16, 2.75, 0xb7d27a, 2); m.ellipse(P.windmillHill[0], P.windmillHill[1], 8, 8, 3.35, 0xc9cf7a, 1);
  // ---- trails: a dirt road out of each side of the Green to the heart of each inner habitat
  const trail = (pts, wd, col) => m.path(pts, wd, col);
  trail([[0, -58], [-6, -76], [P.frozenLake[0] + 14, P.frozenLake[1] + 14]], 3, 0xdfe6ec);
  trail([[42, -42], [P.yard[0], P.yard[1]]], 4, 0x8f9499);
  trail([[58, 0], [P.hotSprings[0] - 8, P.hotSprings[1]]], 3, 0x7a6a52);
  trail([[42, 42], [P.oasis[0] - 6, P.oasis[1] - 6]], 3, 0xd9b77a);
  trail([[0, 58], [0, 104]], 4, 0xd9c28a);
  trail([[-42, 42], [P.bog[0] + 10, P.bog[1] - 10]], 3, 0x8a7a55);
  trail([[-58, 0], [P.grove[0] + 10, P.grove[1]], [-118, 0]], 3, 0x8a7a52);
  trail([[-42, -42], [P.barnyard[0] + 9, P.barnyard[1] + 8]], 4, 0xcdb78a);
}

// ---- things ----
export const ITEMS = [...hubSet.ITEMS, ...northSet.ITEMS, ...eastSet.ITEMS, ...southSet.ITEMS, ...westSet.ITEMS];
export const SHAPES = Object.assign({}, hubSet.SHAPES, northSet.SHAPES, eastSet.SHAPES, southSet.SHAPES, westSet.SHAPES);
export function layout(m) {
  for (const set of [hubSet, northSet, eastSet, southSet, westSet]) set.dress(m);
}
