// THE FOUR RINGS: a map built for the four-team round. North is -z. All numbers are metres.
// Terrain calls are documented in terrain.js. (The earlier island map is kept in old/map-island.js.)
//
// Four square areas nested inside one another, like a walled town seen from above:
//
//   1  Hearth Court  (centre, 40 m across)  all four teams start in its corners, a few metres apart
//   2  Market Ring                          through a 6 m gate plugged with crates    (ball 1.2 m)
//   3  Wild Ring                            through an 8 m gate plugged with fences   (ball 3 m)
//   4  Outer Coast                          through a 12 m gate plugged with tents    (ball 6 m)
//
// Each wall has only two gates, and the gates alternate sides: north/south, then east/west, then north/south.
// So to get from one gate to the next every team has to travel a quarter of the way round the ring, and their
// routes cross. Each wall can also be rolled straight over, but only by a ball much bigger than its gate needs.
//
// The ball rolls up anything up to half its own width and climbs a step up to 40% of its width.

export const BOUNDS = { x1: -130, x2: 130, z1: -130, z2: 130 };
export const STARTS = [[-14, 14], [14, 14], [14, -14], [-14, -14]];      // team 0 (the player) first
export const START = { x: STARTS[0][0], z: STARTS[0][1] };

// band = the critter sizes (metres) that live in the area; boost multiplies how many groups of each appear.
export const AREAS = [
  { name: 'Hearth Court', inner: 0,  outer: 20,  band: [0, 0.6],   boost: 1.4, ponds: [[-13, 0, 3], [13, 0, 3]] },
  { name: 'Market Ring',  inner: 22, outer: 48,  band: [0.6, 1.3], boost: 1.0, ponds: [[36, 36, 8]] },
  { name: 'Wild Ring',    inner: 51, outer: 86,  band: [1.3, 2.5], boost: 1.8, ponds: [[-68, -68, 12]] },
  { name: 'Outer Coast',  inner: 90, outer: 122, band: [2.5, 99],  boost: 3.0, ponds: [[-106, -106, 12], [106, 106, 12]] },
];

// Rows of things that plug each gate until a ball is big enough to roll them up. `from` = the area it leads out of,
// `out` = a point just beyond it (the CPU players and the checker use these).
export const GATES = [
  { name: 'north court gate', from: 0, x1: -3,  z1: -22, x2: 3,   z2: -20, minD: 1.2, item: 'crate', n: 6, rad: 0.55, out: [0, -27] },
  { name: 'south court gate', from: 0, x1: -3,  z1: 20,  x2: 3,   z2: 22,  minD: 1.2, item: 'crate', n: 6, rad: 0.55, out: [0, 27] },
  { name: 'east market gate', from: 1, x1: 48,  z1: -4,  x2: 51,  z2: 4,   minD: 3.0, item: 'fence', n: 6, rad: 0.75, out: [57, 0] },
  { name: 'west market gate', from: 1, x1: -51, z1: -4,  x2: -48, z2: 4,   minD: 3.0, item: 'fence', n: 6, rad: 0.75, out: [-57, 0] },
  { name: 'north wild gate',  from: 2, x1: -6,  z1: -90, x2: 6,   z2: -86, minD: 6.0, item: 'tent',  n: 4, rad: 1.6,  out: [0, -97] },
  { name: 'south wild gate',  from: 2, x1: -6,  z1: 86,  x2: 6,   z2: 90,  minD: 6.0, item: 'tent',  n: 4, rad: 1.6,  out: [0, 97] },
];

const RIM = 0x8f887c, COAST = 0xa9d67a, SAND = 0xe9dca6, MEADOW = 0x8ed27a, FOREST = 0x5fa85a, LAWN = 0xa5dc8c, GARDEN = 0x93db7e, GARDEN2 = 0x86cf72;
const PAVE = 0xd8cdb4, PAVE2 = 0xcbbfa6, STONE = 0xbdb6a6, PATH = 0xe0cf9c, WOOD = 0xb08a5a, WATER = 0x6fc3ee, ROCK = 0x9c9488, ROCK2 = 0xaaa297;
const WALL1 = 0xc9b48a, WALL2 = 0xa89a80, WALL3 = 0x8a8478;
const H = Math.PI / 2;

export function scenery(m) {
  // ---- the four nested squares, outermost first; each wall is the band left between two fills
  m.fill(-130, -130, 130, 130, 14, RIM);                    // the rim of the world
  m.fill(-122, -122, 122, 122, 0, COAST);                   // 4  Outer Coast
  m.fill(-90, -90, 90, 90, 4.8, WALL3);                     //    wall 3 (roll over it at 12 m)
  m.fill(-86, -86, 86, 86, 0, MEADOW);                      // 3  Wild Ring
  m.fill(-51, -51, 51, 51, 2.6, WALL2);                     //    wall 2 (roll over it at 6.5 m)
  m.fill(-48, -48, 48, 48, 0, LAWN);                        // 2  Market Ring
  m.fill(-22, -22, 22, 22, 1.2, WALL1);                     //    wall 1 (roll over it at 3 m)
  m.fill(-20, -20, 20, 20, 0, PAVE);                        // 1  Hearth Court
  for (const g of GATES) m.fill(g.x1, g.z1, g.x2, g.z2, 0, PATH);

  // ---- roads: court gates north/south, market gates east/west, wild gates north/south
  m.path([[0, -20], [0, -48]], 5, PATH); m.path([[0, 20], [0, 48]], 5, PATH);
  m.path([[0, -35], [48, -35], [48, 0]], 4, PATH); m.path([[0, 35], [-48, 35], [-48, 0]], 4, PATH);   // quarter-turns to the market gates
  m.path([[48, 0], [86, 0]], 6, PATH); m.path([[-48, 0], [-86, 0]], 6, PATH);
  m.path([[68, 0], [68, -68], [0, -68], [0, -86]], 5, PATH); m.path([[-68, 0], [-68, 68], [0, 68], [0, 86]], 5, PATH);
  m.path([[0, -90], [0, -122]], 8, PATH); m.path([[0, 90], [0, 122]], 8, PATH);

  // ---- 1  Hearth Court: chequered paving, fountain dais in the middle, two small ponds, planters in the corners
  for (let i = -20; i < 20; i += 4) for (let j = -20; j < 20; j += 4) if (((i + j) / 4) & 1) m.paint(i, j, i + 4, j + 4, PAVE2);
  m.fill(-4, -4, 4, 4, 0.15, STONE);
  m.pool(-13, 0, 3, 0.06, WATER); m.pool(13, 0, 3, 0.06, WATER);
  for (const [x, z] of [[-18, -18], [18, -18], [18, 18], [-18, 18]]) m.fill(x - 2, z - 2, x + 2, z + 2, 0.12, GARDEN);
  m.fill(-9, -9, -6, -6, 0.1, GARDEN2); m.fill(6, 6, 9, 9, 0.1, GARDEN2);

  // ---- 2  Market Ring: a different block in each corner
  m.fill(27, -45, 45, -27, 0.4, GARDEN); m.fill(31, -41, 41, -31, 0.8, GARDEN2);        // NE  terraced garden
  m.pool(36, 36, 8, 0.1, WATER); m.ellipse(36, 36, 2.5, 2.5, 0.25, GARDEN);             // SE  pond with an islet
  m.fill(-45, 27, -27, 45, 0.3, WOOD);                                                  // SW  market boardwalk
  m.ellipse(-36, -36, 9, 9, 0.4, GARDEN); m.ellipse(-36, -36, 5, 5, 0.8, GARDEN2);      // NW  orchard knoll
  m.grass(-14, -46, -5, -40); m.grass(5, 40, 14, 46); m.grass(40, -8, 46, -4); m.grass(-46, 4, -40, 8);

  // ---- 3  Wild Ring
  m.paint(54, -84, 84, -54, FOREST);                                                    // NE  forest
  m.pool(-68, -68, 12, 0.15, WATER); m.ellipse(-68, -68, 4, 4, 0.3, GARDEN);            // NW  lake with an islet
  m.fill(56, 56, 84, 84, 1.0, ROCK); m.fill(64, 64, 84, 84, 2.0, ROCK2);                // SE  rock terraces
  m.ramp(56, 68, 60, 74, 'e', 0, 1.0, PATH);
  m.ellipse(-70, 70, 9, 9, 1.0, MEADOW);                                                // SW  grassy mound in tall grass
  m.grass(-84, 54, -56, 60); m.grass(-84, 80, -56, 84); m.grass(-60, 60, -56, 80); m.grass(-84, 60, -80, 80);
  m.grass(-30, -84, -12, -76); m.grass(12, 76, 30, 84);

  // ---- 4  Outer Coast
  m.fill(96, -118, 118, -96, 2.0, ROCK); m.fill(103, -118, 118, -103, 4.0, ROCK2);      // NE  mesa, two steps
  m.fill(-118, 96, -96, 118, 2.0, ROCK); m.fill(-118, 103, -103, 118, 4.0, ROCK2);      // SW  mesa
  m.pool(-106, -106, 12, 0.3, WATER); m.pool(106, 106, 12, 0.3, WATER);                 // NW and SE lagoons
  m.paint(-122, -122, -118, 122, SAND); m.paint(118, -122, 122, 122, SAND); m.paint(-122, -122, 122, -118, SAND); m.paint(-122, 118, 122, 122, SAND);
  m.grass(-60, -120, -30, -112); m.grass(30, 112, 60, 120); m.grass(112, -60, 120, -30); m.grass(-120, 30, -112, 60);
}

// Items and scenery. Critters are placed by the game: each area gets the species whose size is in its band.
// area(id, areaNumber, howMany) scatters things over one area; the rest are placed by hand.
export function layout(m) {
  for (const g of GATES) {
    const alongZ = g.z2 - g.z1 > g.x2 - g.x1, cx = (g.x1 + g.x2) / 2, cz = (g.z1 + g.z2) / 2, e = 0.5;
    if (alongZ) m.row(g.item, cx, g.z1 + e, cx, g.z2 - e, g.n, { rad: g.rad, rot: 0, gate: true });
    else m.row(g.item, g.x1 + e, cz, g.x2 - e, cz, g.n, { rad: g.rad, rot: H, gate: true });
  }

  // ===== 1  Hearth Court: packed with small food and small critters, arranged in trails and rings
  m.put('fountain', 0, 0);
  for (const [sx, sz] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {              // from each start: a trail to the middle, and rings to circle
    m.row('cup', sx * 12.5, sz * 12.5, sx * 5.5, sz * 5.5, 8);
    m.ring('bread', sx * 14, sz * 14, 1.6, 7); m.ring('tonic', sx * 14, sz * 14, 2.6, 9);
    m.grid('donut', sx * 9 - 0.5, sz * 16 - 0.4, 4, 2, 0.35, 0.35); m.grid('cupcake', sx * 16 - 0.4, sz * 9 - 0.5, 2, 4, 0.35, 0.35);
    m.blob('flower', sx * 18, sz * 18, 1.6, 10);
  }
  m.ring('burger', 0, 0, 5.2, 16); m.ring('cake', 0, 0, 6.6, 12); m.ring('pumpkin', 0, 0, 8.2, 12);
  m.row('pot', -2.5, -18.6, 2.5, -18.6, 5); m.row('pot', -2.5, 18.6, 2.5, 18.6, 5);                // leading to the two gates
  m.row('bucket', -1.5, -16.5, 1.5, -16.5, 3); m.row('bucket', -1.5, 16.5, 1.5, 16.5, 3);
  m.row('lamp', -19, -19, -19, 19, 2); m.row('lamp', 19, -19, 19, 19, 2);
  for (const [id, n] of [['apple', 26], ['mushroom', 22], ['burger', 20], ['tonic', 16], ['cup', 20], ['bread', 24], ['boot', 16], ['cake', 14], ['teddy', 16], ['pot', 14], ['pumpkin', 14], ['bucket', 10], ['crate', 8]]) m.area(id, 0, n);

  // ===== 2  Market Ring
  for (const [x, z] of [[-41, 31], [-31, 31], [-41, 41], [-31, 41]]) { m.put('stall', x, z, { rot: 0 }); m.grid('crate', x - 0.8, z + 1.8, 3, 1, 0.75, 0.75); m.blob('pumpkin', x + 2.4, z, 1.1, 3); }   // SW market
  m.grid('crop', 28.5, -43.5, 7, 2, 2.5, 13); m.ring('bush', 36, -36, 6.5, 12); m.put('statue', 36, -36);                    // NE garden
  m.ring('barrel', 36, 36, 10, 14); m.blob('lily', 36, 36, 6, 8); m.put('canoe', 30, 44, { rot: 0.3 });                      // SE pond
  m.ring('sapling', -36, -36, 7, 8); m.put('oak', -36, -36); m.ring('stump', -36, -36, 10.5, 10);                            // NW orchard
  m.row('chair', -2, -26, -2, -44, 7); m.row('chair', 2, 26, 2, 44, 7);                                                      // along the gate roads
  m.row('barrel', 6, -35, 44, -35, 9); m.row('barrel', -6, 35, -44, 35, 9);                                                  // the quarter-turn to the market gates
  m.row('sign', 46, -30, 46, -8, 4); m.row('sign', -46, 30, -46, 8, 4);
  m.row('lamp', 24, -24, 24, 24, 3); m.row('lamp', -24, -24, -24, 24, 3);
  for (const [id, n] of [['crate', 70], ['chair', 50], ['barrel', 34], ['stump', 22], ['campfire', 8], ['mailbox', 12], ['crop', 30], ['bush', 34], ['log', 28], ['table', 16], ['bench', 16], ['appliance', 18], ['pumpkin', 24], ['pot', 16], ['teddy', 12]]) m.area(id, 1, n);

  // ===== 3  Wild Ring
  m.row('boulder', 53, -3, 53, 3, 3); m.row('boulder', -53, -3, -53, 3, 3);                                                  // just beyond each market gate
  m.row('hay', 60, -6, 82, -6, 6); m.row('hay', -60, 6, -82, 6, 6);
  m.row('cart', 68, -12, 68, -60, 6, { rot: H }); m.row('cart', -68, 12, -68, 60, 6, { rot: H });                            // the quarter-turn to the wild gates
  m.row('stall', 60, -68, 10, -68, 6); m.row('stall', -60, 68, -10, 68, 6);
  m.ring('statue', -68, -68, 15, 12); m.put('obelisk', -68, -68);                                                            // round the lake
  m.ring('boulder', 70, 70, 10, 10); m.ring('bigrock', 74, 74, 5, 4);                                                        // on the rock terraces
  m.ring('hay', -70, 70, 11.5, 12); m.put('windmill', -70, 70);                                                              // on the mound
  m.blob('sapling', 69, -69, 13, 26); m.blob('tree', 69, -69, 13, 10);                                                       // the forest
  for (const [id, n] of [['table', 40], ['bench', 40], ['boulder', 50], ['statue', 20], ['hay', 30], ['cart', 18], ['stall', 14], ['tent', 16], ['lamp', 18], ['fountain', 4], ['sapling', 30], ['bush', 36], ['fence', 40], ['appliance', 18], ['bench', 18], ['log', 20]]) m.area(id, 2, n);

  // ===== 4  Outer Coast
  m.row('shed', 12, -96, 12, -118, 4); m.row('shed', -12, 96, -12, 118, 4);                                                  // beyond each wild gate
  m.row('barn', 24, -106, 84, -106, 5); m.row('barn', -24, 106, -84, 106, 5);
  m.put('tower', 110, -110); m.put('tower', -110, 110); m.ring('bigrock', 107, -107, 8, 6); m.ring('bigrock', -107, 107, 8, 6);   // on the mesas
  m.ring('canoe', -106, -106, 14, 8); m.ring('canoe', 106, 106, 14, 8);                                                      // round the lagoons
  m.row('house', -106, -70, -106, 70, 8, { rot: H }); m.row('house', 106, 70, 106, -70, 8, { rot: -H });
  m.put('windmill', 60, 106); m.put('windmill', -60, -106); m.put('tallhouse', 96, 30); m.put('tallhouse', -96, -30);
  for (const [id, n] of [['boulder', 40], ['statue', 24], ['hay', 36], ['cart', 28], ['stall', 28], ['lamp', 24], ['canoe', 8], ['shed', 16], ['bigrock', 22], ['obelisk', 14], ['barn', 12], ['tree', 70], ['oak', 36], ['house', 10], ['tallhouse', 6], ['tent', 20], ['sapling', 26], ['statue', 10]]) m.area(id, 3, n);
}
