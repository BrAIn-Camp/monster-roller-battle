// THE FIVE RINGS: the map for the four-team round. North is -z. All numbers are metres.
// Terrain calls are documented in terrain.js. (Earlier maps are kept in the old/ folder.)
//
// Five square areas nested inside one another, like a walled town and the country round it:
//
//   1  Hearth Court   town square: fountain, cafes, picnics, market stalls. All four teams start in its corners.
//   2  Market Ring    cottages with gardens, the market, a pond, an orchard     gate: crates  (ball 1.2 m)
//   3  Wild Ring      farms, a lumber camp, a quarry, a lake                     gate: fences  (ball 3 m)
//   4  Outer Coast    villages, windmills, lagoons                               gate: tents   (ball 6 m)
//   5  Titan Reach    open country where the titans roam: every critter at ten times its size   gate: barns (ball 10 m)
//
// Each wall has two gates and they alternate sides (N/S, E/W, N/S, E/W), so routes between gates cross.
// The titans stand far taller than every wall, so they are on the horizon from the first second of a round.
//
// Things are placed as people would leave them: homes with gardens, tables with chairs, fields with carts.
// The helper functions below each build one such group; layout() says where the groups go.

export const BOUNDS = { x1: -236, x2: 236, z1: -236, z2: 236 };
export const STARTS = [[-14, 14], [14, 14], [14, -14], [-14, -14]];      // team 0 (the player) first
export const START = { x: STARTS[0][0], z: STARTS[0][1] };

// band = the critter sizes (metres) that live in the area; boost multiplies how many groups of each appear.
export const AREAS = [
  { name: 'Hearth Court', inner: 0,   outer: 20,  band: [0, 0.6],   boost: 1.4, ponds: [[-13, 0, 3], [13, 0, 3]] },
  { name: 'Market Ring',  inner: 22,  outer: 48,  band: [0.6, 1.3], boost: 1.0, ponds: [[36, 36, 8]] },
  { name: 'Wild Ring',    inner: 51,  outer: 86,  band: [1.3, 2.5], boost: 1.8, ponds: [[-68, -68, 12]] },
  { name: 'Outer Coast',  inner: 90,  outer: 122, band: [2.5, 99],  boost: 3.0, ponds: [[-106, -106, 12], [106, 106, 12]] },
  { name: 'Titan Reach',  inner: 128, outer: 226, band: [999, 999], boost: 0,   ponds: [[-178, -178, 30], [178, 178, 30]], titans: true },
];

export const GATES = [
  { name: 'north court gate', from: 0, x1: -3,   z1: -22,  x2: 3,    z2: -20, minD: 1.2, item: 'crate', n: 6, rad: 0.55, out: [0, -27] },
  { name: 'south court gate', from: 0, x1: -3,   z1: 20,   x2: 3,    z2: 22,  minD: 1.2, item: 'crate', n: 6, rad: 0.55, out: [0, 27] },
  { name: 'east market gate', from: 1, x1: 48,   z1: -4,   x2: 51,   z2: 4,   minD: 3.0, item: 'fence', n: 6, rad: 0.75, out: [57, 0] },
  { name: 'west market gate', from: 1, x1: -51,  z1: -4,   x2: -48,  z2: 4,   minD: 3.0, item: 'fence', n: 6, rad: 0.75, out: [-57, 0] },
  { name: 'north wild gate',  from: 2, x1: -6,   z1: -90,  x2: 6,    z2: -86, minD: 6.0, item: 'tent',  n: 4, rad: 1.6,  out: [0, -97] },
  { name: 'south wild gate',  from: 2, x1: -6,   z1: 86,   x2: 6,    z2: 90,  minD: 6.0, item: 'tent',  n: 4, rad: 1.6,  out: [0, 97] },
  { name: 'east coast gate',  from: 3, x1: 122,  z1: -10,  x2: 128,  z2: 10,  minD: 10,  item: 'barn',  n: 4, rad: 2.7,  out: [138, 0] },
  { name: 'west coast gate',  from: 3, x1: -128, z1: -10,  x2: -122, z2: 10,  minD: 10,  item: 'barn',  n: 4, rad: 2.7,  out: [-138, 0] },
];

const RIM = 0x8f887c, REACH = 0x7cba68, COAST = 0xa9d67a, SAND = 0xe9dca6, MEADOW = 0x8ed27a, FOREST = 0x5fa85a, LAWN = 0xa5dc8c, GARDEN = 0x93db7e, GARDEN2 = 0x86cf72;
const PAVE = 0xd8cdb4, PAVE2 = 0xcbbfa6, STONE = 0xbdb6a6, PATH = 0xe0cf9c, WOOD = 0xb08a5a, WATER = 0x6fc3ee, ROCK = 0x9c9488, ROCK2 = 0xaaa297, SOIL = 0xb9935f;
const WALL1 = 0xc9b48a, WALL2 = 0xa89a80, WALL3 = 0x8a8478, WALL4 = 0x7a756c;
const H = Math.PI / 2, PI = Math.PI;

export function scenery(m) {
  // ---- the nested squares, outermost first; each wall is the band left between two fills
  m.fill(-236, -236, 236, 236, 40, RIM);                    // the rim of the world
  m.fill(-226, -226, 226, 226, 0, REACH);                   // 5  Titan Reach
  m.fill(-128, -128, 128, 128, 9, WALL4);                   //    wall 4 (roll over it at 22 m)
  m.fill(-122, -122, 122, 122, 0, COAST);                   // 4  Outer Coast
  m.fill(-90, -90, 90, 90, 4.8, WALL3);                     //    wall 3 (roll over it at 12 m)
  m.fill(-86, -86, 86, 86, 0, MEADOW);                      // 3  Wild Ring
  m.fill(-51, -51, 51, 51, 2.6, WALL2);                     //    wall 2 (roll over it at 6.5 m)
  m.fill(-48, -48, 48, 48, 0, LAWN);                        // 2  Market Ring
  m.fill(-22, -22, 22, 22, 1.2, WALL1);                     //    wall 1 (roll over it at 3 m)
  m.fill(-20, -20, 20, 20, 0, PAVE);                        // 1  Hearth Court
  for (const g of GATES) m.fill(g.x1, g.z1, g.x2, g.z2, 0, PATH);

  // ---- roads through the gates, with quarter-turns between them
  m.path([[0, -20], [0, -48]], 5, PATH); m.path([[0, 20], [0, 48]], 5, PATH);
  m.path([[0, -35], [48, -35], [48, 0]], 4, PATH); m.path([[0, 35], [-48, 35], [-48, 0]], 4, PATH);
  m.path([[48, 0], [86, 0]], 6, PATH); m.path([[-48, 0], [-86, 0]], 6, PATH);
  m.path([[68, 0], [68, -68], [0, -68], [0, -86]], 5, PATH); m.path([[-68, 0], [-68, 68], [0, 68], [0, 86]], 5, PATH);
  m.path([[0, -90], [0, -122]], 8, PATH); m.path([[0, 90], [0, 122]], 8, PATH);
  m.path([[0, -106], [106, -106], [106, 0], [122, 0]], 7, PATH); m.path([[0, 106], [-106, 106], [-106, 0], [-122, 0]], 7, PATH);
  m.path([[128, 0], [226, 0]], 12, PATH); m.path([[-128, 0], [-226, 0]], 12, PATH);

  // ---- 1  Hearth Court
  for (let i = -20; i < 20; i += 4) for (let j = -20; j < 20; j += 4) if (((i + j) / 4) & 1) m.paint(i, j, i + 4, j + 4, PAVE2);
  m.fill(-4, -4, 4, 4, 0.15, STONE);
  m.pool(-13, 0, 3, 0.06, WATER); m.pool(13, 0, 3, 0.06, WATER);
  for (const [x, z] of [[-18, -18], [18, -18], [18, 18], [-18, 18]]) m.fill(x - 2, z - 2, x + 2, z + 2, 0.12, GARDEN);

  // ---- 2  Market Ring
  m.fill(27, -45, 45, -27, 0.4, GARDEN); m.fill(31, -41, 41, -31, 0.8, GARDEN2);        // NE  terraced garden
  m.pool(36, 36, 8, 0.1, WATER); m.ellipse(36, 36, 2.5, 2.5, 0.25, GARDEN);             // SE  pond with an islet
  m.fill(-45, 27, -27, 45, 0.3, WOOD);                                                  // SW  market boardwalk
  m.ellipse(-36, -36, 9, 9, 0.4, GARDEN); m.ellipse(-36, -36, 5, 5, 0.8, GARDEN2);      // NW  orchard knoll
  for (const [x, z] of [[-20, -43.5], [8, -43.5], [-20, 39.5], [8, 39.5]]) m.paint(x, z, x + 4, z + 4, SOIL);   // cottage vegetable beds
  for (const [x, z] of [[39.5, -20], [39.5, 8], [-43.5, -20], [-43.5, 8]]) m.paint(x, z, x + 4, z + 4, SOIL);

  // ---- 3  Wild Ring
  m.paint(54, -84, 84, -54, FOREST);                                                    // NE  forest
  m.pool(-68, -68, 12, 0.15, WATER); m.ellipse(-68, -68, 4, 4, 0.3, GARDEN);            // NW  lake with an islet
  m.fill(56, 56, 84, 84, 1.0, ROCK); m.fill(64, 64, 84, 84, 2.0, ROCK2);                // SE  quarry terraces
  m.ramp(56, 68, 60, 74, 'e', 0, 1.0, PATH);
  m.ellipse(-70, 70, 9, 9, 1.0, MEADOW);                                                // SW  windmill mound
  for (const [x, z] of [[-38, -82], [18, -82], [-38, 62], [18, 62]]) m.paint(x, z, x + 20, z + 12, SOIL);       // farm fields, north and south
  for (const [x, z] of [[62, -38], [62, 18], [-82, -38], [-82, 18]]) m.paint(x, z, x + 12, z + 20, SOIL);       // east and west
  m.grass(-84, 54, -56, 60); m.grass(-84, 80, -56, 84); m.grass(-60, 60, -56, 80); m.grass(-84, 60, -80, 80);

  // ---- 4  Outer Coast
  m.fill(96, -118, 118, -96, 2.0, ROCK); m.fill(103, -118, 118, -103, 4.0, ROCK2);      // NE  mesa
  m.fill(-118, 96, -96, 118, 2.0, ROCK); m.fill(-118, 103, -103, 118, 4.0, ROCK2);      // SW  mesa
  m.pool(-106, -106, 12, 0.3, WATER); m.pool(106, 106, 12, 0.3, WATER);                 // NW and SE lagoons
  m.paint(-122, -122, -119, 122, SAND); m.paint(119, -122, 122, 122, SAND); m.paint(-122, -122, 122, -119, SAND); m.paint(-122, 119, 122, 122, SAND);

  // ---- 5  Titan Reach: rolling open country, two great lakes, a few high mesas
  m.hills(-226, -226, 226, 226, 3, 1, REACH);
  m.fill(-232, -14, -128, 14, 0, REACH); m.fill(128, -14, 232, 14, 0, REACH);           // level ground along the road out of each gate
  m.path([[128, 0], [226, 0]], 12, PATH); m.path([[-128, 0], [-226, 0]], 12, PATH);
  m.pool(-178, -178, 30, 0.5, WATER); m.pool(178, 178, 30, 0.5, WATER);
  m.fill(150, -210, 200, -160, 6, ROCK); m.fill(162, -210, 200, -172, 12, ROCK2);
  m.fill(-200, 160, -150, 210, 6, ROCK); m.fill(-200, 172, -162, 210, 12, ROCK2);
  m.grass(-60, -224, 60, -200); m.grass(-60, 200, 60, 224);
}

// ===================== groups of things =====================
// f = the way the group faces, as a rotation: 0 faces south (+z), PI north, H east, -H west.
// at() turns "so many metres to the right of / in front of the group's centre" into map coordinates.
const at = (x, z, f, right, front) => [x + right * Math.cos(f) + front * Math.sin(f), z - right * Math.sin(f) + front * Math.cos(f)];
const put = (m, id, x, z, f, right, front, rot) => { const [px, pz] = at(x, z, f, right, front); return m.put(id, px, pz, { rot: rot === undefined ? f : f + rot }); };
const line = (m, id, x, z, f, r1, f1, r2, f2, n, rot) => { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; put(m, id, x, z, f, r1 + (r2 - r1) * t, f1 + (f2 - f1) * t, rot); } };

function cafe(m, x, z, food) {               // a table, four chairs pulled up to it, and a meal laid round it
  m.put('table', x, z, { rot: 0 }); m.ring('chair', x, z, 1.35, 4);
  m.ring(food, x, z, 2.1, 8); m.ring('cup', x, z, 2.7, 6);
}
function picnic(m, x, z, f) {                // a blanket with a spread on it
  put(m, 'blanket', x, z, f, 0, 0);
  for (let i = 0; i < 4; i++) { put(m, 'sushi', x, z, f, -0.45 + i * 0.3, -0.18, 0); put(m, 'cupcake', x, z, f, -0.45 + i * 0.3, 0.15, 0); }
  put(m, 'cake', x, z, f, 0.95, 0, 0); put(m, 'tonic', x, z, f, -0.95, 0.2, 0); put(m, 'tonic', x, z, f, -0.95, -0.2, 0);
  line(m, 'donut', x, z, f, -0.5, 0.75, 0.5, 0.75, 4); line(m, 'apple', x, z, f, -0.5, -0.75, 0.5, -0.75, 4);
  put(m, 'teddy', x, z, f, 1.3, 0.9, 0.6); put(m, 'boot', x, z, f, -1.3, -0.8, 0.3); put(m, 'boot', x, z, f, -1.05, -0.9, 0.9);
}
function stall(m, x, z, f, goods) {          // a market stall with its stock stacked beside it and produce set out in front
  put(m, 'stall', x, z, f, 0, 0);
  put(m, 'crate', x, z, f, 2.1, -0.3); put(m, 'crate', x, z, f, 2.1, 0.5); put(m, 'barrel', x, z, f, -2.2, 0);
  line(m, goods, x, z, f, -1.4, 1.9, 1.4, 1.9, 6); line(m, 'bread', x, z, f, -1.2, 2.5, 1.2, 2.5, 5);
  put(m, 'bucket', x, z, f, -2.3, 1.2);
}
function cottage(m, x, z, f, crop) {         // a small house: pots by the door, a fenced front garden, a vegetable bed, a woodpile behind
  put(m, 'shed', x, z, f, 0, 0);
  line(m, 'pot', x, z, f, -1.6, 2.5, -0.7, 2.5, 3); line(m, 'pot', x, z, f, 0.7, 2.5, 1.6, 2.5, 3);
  put(m, 'bench', x, z, f, 2.6, 2.7, 0); put(m, 'mailbox', x, z, f, 1.1, 5.2, 0); put(m, 'boot', x, z, f, 0.4, 2.3, 0.4); put(m, 'boot', x, z, f, 0.2, 2.45, 1.1);
  line(m, 'fence', x, z, f, -5.2, 4.6, -1.6, 4.6, 3, H); line(m, 'fence', x, z, f, 2.4, 4.6, 5.2, 4.6, 2, H);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) put(m, crop, x, z, f, -6 + i * 1.3, -1.3 + j * 1.3, 0);          // the vegetable bed
  put(m, 'bucket', x, z, f, -3.6, 1.6); put(m, 'log', x, z, f, 0.8, -3.2, H); put(m, 'log', x, z, f, -0.7, -3.2, H); put(m, 'stump', x, z, f, 2.4, -3.2);
  put(m, 'table', x, z, f, 4.6, 0.5, 0); put(m, 'chair', x, z, f, 4.6, 1.9, PI); put(m, 'chair', x, z, f, 4.6, -0.9, 0);
  put(m, 'teddy', x, z, f, 3.4, 2.7, 0.5); put(m, 'cake', x, z, f, 5.9, 0.5, 0);
}
function farm(m, x, z, f) {                  // a barn with a fenced paddock, a ploughed field, a hay store and a cart
  put(m, 'barn', x, z, f, 0, -3);
  line(m, 'fence', x, z, f, 5, -6, 13, -6, 6, H); line(m, 'fence', x, z, f, 5, 0, 13, 0, 6, H);                         // paddock
  line(m, 'fence', x, z, f, 13.8, -5, 13.8, -1, 3, 0); put(m, 'bucket', x, z, f, 6, -3); put(m, 'bucket', x, z, f, 6.8, -2.4);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) put(m, 'crop', x, z, f, -13 + i * 1.9, 2 + j * 2.4, 0);          // field
  line(m, 'hay', x, z, f, -13, -5, -6, -5, 3); put(m, 'hay', x, z, f, -11, -7.6); put(m, 'hay', x, z, f, -8, -7.6);
  put(m, 'cart', x, z, f, -4, 3.5, H); line(m, 'pumpkin', x, z, f, -3.4, 5.6, 1.5, 5.6, 6);
  put(m, 'stump', x, z, f, 3.6, 3.4); put(m, 'log', x, z, f, 3.6, 5.2, 0); put(m, 'bench', x, z, f, 0, 2.6, 0); put(m, 'barrel', x, z, f, 2.2, 1.2); put(m, 'barrel', x, z, f, -2.2, 1.2);
}
function camp(m, x, z) {                     // tents round a fire, with logs to sit on
  m.put('campfire', x, z); m.ring('log', x, z, 2.3, 4);
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.5; m.put('tent', x + Math.cos(a) * 6, z + Math.sin(a) * 6, { rot: -a - H }); }
  m.put('barrel', x + 3.6, z - 3.4); m.put('crate', x - 3.8, z - 3.2); m.put('stump', x - 3.2, z + 3.8); m.ring('pumpkin', x, z, 3.4, 5);
}
function village(m, x, z, f, n) {            // a street of houses facing a road, each with a fence, a tree and a lamp out front
  for (let i = 0; i < n; i++) {
    const r = (i - (n - 1) / 2) * 15;
    put(m, i % 3 === 2 ? 'tallhouse' : 'house', x, z, f, r, 0);
    line(m, 'fence', x, z, f, r - 4.5, 6.4, r + 4.5, 6.4, 5, H); put(m, 'sapling', x, z, f, r + 5.6, 4, 0); put(m, 'lamp', x, z, f, r - 6.5, 7.6, 0);
    put(m, 'shed', x, z, f, r - 2.5, -7.5); put(m, 'cart', x, z, f, r + 3.5, -7, H); put(m, 'bench', x, z, f, r + 1.5, 5.2, 0); put(m, 'statue', x, z, f, r - 2.6, 5.4, 0);
  }
}

export function layout(m) {
  for (const g of GATES) {
    const alongZ = g.z2 - g.z1 > g.x2 - g.x1, cx = (g.x1 + g.x2) / 2, cz = (g.z1 + g.z2) / 2, e = g.item === 'barn' ? 2.6 : 0.5;
    if (alongZ) m.row(g.item, cx, g.z1 + e, cx, g.z2 - e, g.n, { rad: g.rad, rot: H, gate: true });
    else m.row(g.item, g.x1 + e, cz, g.x2 - e, cz, g.n, { rad: g.rad, rot: H, gate: true });
  }

  // ===== 1  Hearth Court: the town square on a market day
  m.put('fountain', 0, 0); m.ring('bench', 0, 0, 6.4, 4); m.ring('pot', 0, 0, 4.6, 8);
  for (const [sx, sz] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
    cafe(m, sx * 8.5, sz * 8.5, sx * sz > 0 ? 'burger' : 'cake');                            // four cafe terraces round the fountain
    picnic(m, sx * 15.5, sz * 6, sx > 0 ? H : -H); picnic(m, sx * 6, sz * 15.5, sz > 0 ? 0 : PI);   // picnics either side of each start
    m.ring('bread', sx * 14, sz * 14, 1.6, 7); m.ring('tonic', sx * 14, sz * 14, 2.6, 9);    // each team's starting larder
    m.ring('flower', sx * 18, sz * 18, 1.5, 9); m.put('lamp', sx * 19, sz * 11); m.put('lamp', sx * 11, sz * 19);
  }
  stall(m, -11, -17.5, 0, 'apple'); stall(m, 11, -17.5, 0, 'mushroom'); stall(m, -11, 17.5, PI, 'pumpkin'); stall(m, 11, 17.5, PI, 'apple');
  m.ring('bucket', -13, 0, 4, 6); m.ring('bucket', 13, 0, 4, 6); m.blob('lily', -13, 0, 2.2, 3); m.blob('lily', 13, 0, 2.2, 3);     // round the two ponds
  m.row('pot', -2.5, -18.6, 2.5, -18.6, 5); m.row('pot', -2.5, 18.6, 2.5, 18.6, 5);                                                  // either side of each gate
  for (const [id, n] of [['mushroom', 14], ['boot', 8], ['teddy', 8], ['pumpkin', 8], ['cup', 12]]) m.area(id, 0, n);

  // ===== 2  Market Ring: cottages along the wall, the market, the pond, the orchard
  cottage(m, -14, -41, 0, 'pumpkin'); cottage(m, 14, -41, 0, 'crop'); cottage(m, -14, 41, PI, 'crop'); cottage(m, 14, 41, PI, 'pumpkin');
  cottage(m, 41, -14, -H, 'crop'); cottage(m, 41, 14, -H, 'pumpkin'); cottage(m, -41, -14, H, 'pumpkin'); cottage(m, -41, 14, H, 'crop');
  for (const [x, z] of [[-41, 31], [-31, 31]]) stall(m, x, z, 0, 'pumpkin');                                                         // SW  the market
  for (const [x, z] of [[-41, 41], [-31, 41]]) stall(m, x, z, PI, 'apple');
  cafe(m, -36, 36, 'burger'); m.row('lamp', -44, 26, -28, 26, 3);
  for (let i = 0; i < 7; i++) { m.put('crop', 28.5 + i * 2.5, -43.5); m.put('crop', 28.5 + i * 2.5, -28.5); }                       // NE  the terraced garden
  m.ring('bush', 36, -36, 6.5, 12); m.put('statue', 36, -36); m.ring('bench', 36, -36, 3.6, 4); m.ring('pot', 36, -36, 2.2, 6);
  m.ring('barrel', 36, 36, 10, 10); m.blob('lily', 36, 36, 6, 8); m.put('canoe', 30, 45, { rot: 0.3 }); m.put('canoe', 44, 43, { rot: -0.4 });   // SE  the pond
  m.row('bench', 26, 27, 34, 26, 2); m.ring('bucket', 36, 36, 9, 6); camp(m, 26, 43.5);
  m.ring('sapling', -36, -36, 7, 8); m.put('oak', -36, -36); m.ring('crate', -36, -36, 9, 8); m.ring('apple', -36, -36, 5, 14); m.ring('stump', -36, -36, 10.5, 6);   // NW  the orchard
  for (const z of [-26, -32, -38, -44]) { m.put('lamp', -3.6, z); m.put('lamp', 3.6, -z); }                                           // street lamps and benches on the gate roads
  m.row('bench', 4, -27, 4, -43, 3, { rot: -H }); m.row('bench', -4, 27, -4, 43, 3, { rot: H });
  m.row('barrel', 8, -33, 44, -33, 7); m.row('barrel', -8, 33, -44, 33, 7); m.row('sign', 46, -30, 46, -8, 3); m.row('sign', -46, 30, -46, 8, 3);
  for (const [id, n] of [['crate', 36], ['chair', 26], ['barrel', 16], ['stump', 14], ['bush', 26], ['log', 16], ['appliance', 10], ['pumpkin', 20], ['teddy', 10]]) m.area(id, 1, n);

  // ===== 3  Wild Ring: eight farms, a lumber camp in the forest, a quarry, the lake
  farm(m, -28, -72, 0); farm(m, 28, -72, 0); farm(m, -28, 72, PI); farm(m, 28, 72, PI);
  farm(m, 72, -28, -H); farm(m, 72, 28, -H); farm(m, -72, -28, H); farm(m, -72, 28, H);
  m.blob('sapling', 69, -69, 13, 22); m.blob('tree', 72, -72, 10, 8);                                                                // NE  forest and lumber camp
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) m.put('log', 58 + i * 1.6, -62 + j * 1.6, { rot: 0 });
  m.ring('stump', 62, -74, 4, 7); m.put('cart', 57, -68, { rot: 0.4 }); camp(m, 78, -58);
  m.ring('statue', -68, -68, 15, 10); m.put('obelisk', -68, -68); m.put('shed', -80, -58, { rot: 2.2 }); m.row('canoe', -78, -80, -60, -82, 3, { rot: 0.2 }); camp(m, -56, -80);   // NW  the lake
  m.grid('boulder', 58, 58, 3, 3, 2.4, 2.4); m.ring('boulder', 74, 74, 7, 8); m.ring('bigrock', 74, 74, 3.5, 3);                     // SE  the quarry
  m.put('cart', 61, 66, { rot: H }); m.put('cart', 61, 78, { rot: H }); m.row('crate', 57, 82, 63, 82, 5); m.put('tent', 80, 60, { rot: 2.4 });
  m.ring('hay', -70, 70, 11.5, 12); m.put('windmill', -70, 70); m.row('cart', -84, 56, -58, 56, 4, { rot: 0 });                      // SW  the windmill
  m.row('boulder', 53, -3, 53, 3, 3); m.row('boulder', -53, -3, -53, 3, 3);                                                          // beyond the market gates
  m.row('lamp', 56, -4, 84, -4, 5); m.row('lamp', -56, 4, -84, 4, 5); m.row('stall', 60, -64, 12, -64, 5, { rot: PI }); m.row('stall', -60, 64, -12, 64, 5, { rot: 0 });
  m.row('bench', 64, -10, 64, -58, 5, { rot: H }); m.row('bench', -64, 10, -64, 58, 5, { rot: -H });
  for (const [id, n] of [['table', 30], ['bench', 20], ['boulder', 30], ['hay', 20], ['bush', 30], ['fence', 24], ['appliance', 14], ['log', 16], ['stump', 16], ['tent', 8]]) m.area(id, 2, n);

  // ===== 4  Outer Coast: four villages, windmills on the mesas, boats on the lagoons
  village(m, 44, -112, 0, 5); village(m, -44, 112, PI, 5); village(m, 112, 50, -H, 4); village(m, -112, -50, H, 4);
  village(m, -40, -100, PI, 4); village(m, 40, 100, 0, 4);
  m.put('tower', 110, -110); m.put('windmill', 100, -100); m.ring('bigrock', 107, -107, 9, 6);                                       // NE and SW mesas
  m.put('tower', -110, 110); m.put('windmill', -100, 100); m.ring('bigrock', -107, 107, 9, 6);
  m.ring('canoe', -106, -106, 14, 8); m.ring('canoe', 106, 106, 14, 8); m.row('shed', -96, -92, -116, -92, 3); m.row('shed', 96, 92, 116, 92, 3);   // boathouses
  camp(m, -92, -116); camp(m, 92, 116);
  m.row('tree', -118, -84, -118, 84, 12); m.row('tree', 118, -84, 118, 84, 12);                                                       // tree-lined edges
  m.row('oak', -80, -118, 80, -118, 9); m.row('oak', -80, 118, 80, 118, 9);
  m.row('lamp', 4.5, -94, 4.5, -120, 4); m.row('lamp', -4.5, 94, -4.5, 120, 4); m.row('obelisk', 112, -14, 112, 14, 2); m.row('obelisk', -112, -14, -112, 14, 2);
  for (const [id, n] of [['boulder', 30], ['statue', 16], ['hay', 26], ['cart', 16], ['stall', 16], ['lamp', 12], ['bigrock', 18], ['barn', 8], ['tent', 14], ['sapling', 20], ['tree', 24], ['oak', 14]]) m.area(id, 3, n);

  // ===== 5  Titan Reach: woods and standing stones that look like toys beside the titans
  for (const [x, z] of [[160, -60], [-160, 60], [60, 170], [-60, -170], [190, 90], [-190, -90], [90, -190], [-90, 190]]) { m.blob('tree', x, z, 16, 16); m.blob('oak', x, z, 16, 8); }
  m.ring('obelisk', 180, -190, 12, 8); m.ring('obelisk', -180, 190, 12, 8); m.ring('bigrock', -178, -178, 34, 14); m.ring('bigrock', 178, 178, 34, 14);
  village(m, 150, 22, 0, 3); village(m, -150, -22, PI, 3);                                                                            // two hamlets by the road, for scale
  for (const [id, n] of [['bigrock', 30], ['tree', 60], ['oak', 30], ['barn', 10], ['house', 10], ['windmill', 4], ['tower', 3]]) m.area(id, 4, n);
}
