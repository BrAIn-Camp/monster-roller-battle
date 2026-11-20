// SALTMERE ISLAND. North is -z. All numbers are metres. Terrain calls are documented in terrain.js.
//
// The ball rolls up anything up to half its own width. It climbs a step up to a quarter of its diameter and can always drop down, so every
// terrace edge is a one-way ledge until the ball is 4x its height. Sea is closed until the ball is 3 m.
//
//   Harbour town (south coast, two levels)  <- start
//     |- beach ring: runs right round the island
//     |- west gate -> farm terraces (zig-zag ramps) -> ramp up to the forest
//     |- cliff stair (switchback) -> forest plateau: sunken clearing, stepped ruins
//     |- east boardwalk -> marsh -> gorge mouth -> up the gorge -> side ramp to the forest
//   Forest -> north ramp -> high plain -> waterfall drop into the gorge (one way)
//   Plain  -> west: mountain, climbed by a spiral of ramps (east, north, west) to a crater lake,
//             with a slot-canyon maze cut into its south flank
//          -> east: volcano, spiral ramps to the rim; the caldera is entered by a breach on the south side
//          -> north: cove trail down to the north beach, closing the loop with the beach ring
//   Offshore: pier ends, lighthouse rock, two islets (sea opens at 3 m)

export const BOUNDS = { x1: -180, x2: 180, z1: -180, z2: 180 };
export const START = { x: 0, z: 123 };

const DEEP = 0x3f8fd0, SHELF = 0x63b7e6, SAND = 0xe9dca6, WILD = 0x62a858, FOREST = 0x4f9a55, PLAIN = 0xa9d67a;
const PAVE = 0xd8cdb4, PAVE2 = 0xcbbfa6, WOOD = 0xb08a5a, PATH = 0xe0cf9c, FARM = 0x9fd47f, SOIL = 0xb9935f, HEDGE = 0x3f8a4a;
const MUD = 0x8fae6a, WATER = 0x6fc3ee, ROCK1 = 0x9c9488, ROCK2 = 0xaaa297, ROCK3 = 0xbdb6ac, SNOW = 0xeef2f5, CANYON = 0xc39a6b;
const ASH1 = 0x6f6660, ASH2 = 0x5c534f, ASH3 = 0x4a4340, LAVA = 0xf2743a, RUIN = 0xb7b3a2, CLEAR = 0x8fd67a;
const H = Math.PI / 2;

// Rows of things that plug a passage until the ball is big enough to roll them up.
// The checker (tools/verify-map.mjs) treats each as a wall for smaller balls; layout() places the rows.
export const GATES = [
  { name: 'west gate',       x1: -47, z1: 96,   x2: -45, z2: 100,  minD: 1.0,  item: 'pumpkin', n: 5, rad: 0.45 },
  { name: 'boardwalk',       x1: 70,  z1: 111,  x2: 74,  z2: 113,  minD: 1.5,  item: 'crate',   n: 5, rad: 0.45 },
  { name: 'cliff stair',     x1: -8,  z1: 86,   x2: -1,  z2: 88,   minD: 2.25, item: 'barrel',  n: 7, rad: 0.55 },
  { name: 'farm to forest',  x1: -56, z1: 26,   x2: -54, z2: 32,   minD: 3.25, item: 'bush',    n: 4, rad: 0.85 },
  { name: 'forest to plain', x1: -8,  z1: -40,  x2: -2,  z2: -38,  minD: 3.75, item: 'fence',   n: 4, rad: 0.9 },
  { name: 'north cove',      x1: -4,  z1: -127, x2: 4,   z2: -125, minD: 3.75, item: 'fence',   n: 5, rad: 0.9 },
  { name: 'mountain ramp',   x1: -27, z1: -73,  x2: -25, z2: -67,  minD: 5.0,  item: 'boulder', n: 3, rad: 1.1 },
  { name: 'volcano ramp',    x1: 41,  z1: -65,  x2: 43,  z2: -59,  minD: 5.0,  item: 'boulder', n: 3, rad: 1.1 },
];

export function scenery(m) {
  // ---- sea, shelf, beach, wild interior
  m.fill(-180, -180, 180, 180, -1.3, DEEP);            // each step up out of the sea is 0.7 m, so a 3 m ball can always climb out
  m.ellipse(0, 0, 168, 166, -0.6, SHELF, 6);
  m.ellipse(0, 0, 152, 150, 0.1, SAND, 6);
  m.ellipse(0, -6, 138, 134, 8, WILD, 5);                // a high wooded plateau; everything else is cut into it
  m.hills(-150, -150, 150, 140, 2.5, 0.5, WILD);
  m.ellipse(-160, 55, 8, 9, 0.1, SAND, 1); m.ellipse(-161, 55, 4, 4, 0.9, WILD);      // west islet
  m.ellipse(168, 25, 6, 7, 0.1, SAND); m.ellipse(169, 24, 3, 3, 0.9, WILD);           // east islet, clear of the beach

  // ---- forest plateau (centre)
  m.ellipse(0, 10, 60, 52, 4.5, FOREST, 3);
  m.ellipse(-18, 8, 11, 11, 3.9, CLEAR);                    // sunken clearing
  m.ramp(-7, 6, -3, 10, 'e', 3.9, 4.5, CLEAR);
  m.fill(15, -19, 29, -5, 5.1, RUIN); m.fill(17, -17, 27, -7, 5.7, RUIN); m.fill(19, -15, 25, -9, 6.3, RUIN);   // stepped ruins

  // ---- high plain (north centre) and the trail down to the north cove
  m.fill(-50, -98, 60, -45, 6.5, PLAIN);
  m.ramp(-8, -48, -2, -36, 'n', 4.5, 6.5, PATH);            // forest -> plain
  m.ramp(-4, -146, 4, -128, 's', 0.1, 3.5, PATH);           // beach -> cove trail
  m.fill(-4, -128, 4, -112, 3.5, PATH);
  m.ramp(-4, -112, 4, -98, 's', 3.5, 6.5, PATH);            // cove trail -> plain

  // ---- mountain (north-west): three tiers and a crater lake, climbed by a spiral of ramps
  m.ellipse(-70, -70, 44, 44, 9, ROCK1, 2);
  m.ellipse(-70, -70, 33, 33, 12, ROCK2, 1);
  m.ellipse(-70, -70, 21, 21, 15, ROCK3);
  m.ellipse(-70, -70, 12, 12, 15, SNOW);
  m.pool(-70, -70, 8, 0.8, WATER);
  m.ramp(-31, -73, -16, -67, 'w', 6.5, 9, PATH);            // east: plain -> tier 1
  m.ramp(-73, -113, -67, -99, 's', 9, 12, PATH);           // north: tier 1 -> tier 2
  m.ramp(-101, -73, -87, -67, 'e', 12, 15, PATH);           // west: tier 2 -> summit
  // slot-canyon maze cut into the south-east flank, floor level with the plain
  m.fill(-62, -50, -26, -46, 6.5, CANYON); m.fill(-62, -60, -58, -36, 6.5, CANYON); m.fill(-50, -46, -46, -32, 6.5, CANYON);
  m.fill(-62, -36, -46, -32, 6.5, CANYON); m.fill(-40, -60, -36, -50, 6.5, CANYON);

  // ---- volcano (north-east): tiers, rim, and a caldera entered through a breach on the south side
  m.ellipse(80, -62, 42, 42, 8, ASH1, 2);
  m.ellipse(80, -62, 31, 31, 11, ASH2, 1);
  m.ellipse(80, -62, 21, 21, 13, ASH3);
  m.ellipse(80, -62, 14, 14, 9.5, ASH2);
  m.ellipse(80, -64, 7, 6, 9.5, LAVA);
  m.ramp(30, -65, 43, -59, 'e', 6.5, 8, PATH);              // west: plain -> tier 1
  m.ramp(77, -103, 83, -89, 's', 8, 11, PATH);              // north: tier 1 -> tier 2
  m.ramp(97, -65, 109, -59, 'w', 11, 13, PATH);            // east: tier 2 -> rim
  m.ramp(77, -50, 83, -38, 's', 9.5, 11, ASH2);             // the breach: caldera floor <-> tier 2

  // ---- gorge: waterfall from the plain, down through the forest's east side, out to the marsh
  m.fill(34, -45, 41, -20, 3.0, MUD);                       // upper gorge (drop in from the plain; one way)
  m.fill(34, -20, 41, 26, 2.0, MUD);                        // middle gorge (1 m waterfall step)
  m.ramp(34, 20, 41, 26, 'n', 1.0, 2.0, MUD);
  m.fill(34, 26, 58, 33, 1.0, MUD);                         // lower gorge, turning east
  m.ramp(50, 26, 58, 33, 'w', 0.4, 1.0, MUD);
  m.ramp(20, 0, 34, 6, 'w', 2.0, 4.5, PATH);                // side ramp: gorge <-> forest
  m.stream([[37.5, -45], [37.5, 23], [48, 29.5], [58, 29.5]], 2.2, WATER);

  // ---- harbour town (south): quay level and an upper level, joined by two stairs
  m.fill(-45, 88, 45, 112, 1.0, PAVE2);
  m.fill(-45, 112, 45, 136, 0.1, PAVE);
  m.ramp(-20, 108, -16, 116, 'n', 0.1, 1.0, PATH);
  m.ramp(16, 108, 20, 116, 'n', 0.1, 1.0, PATH);
  m.fill(-47, 88, -45, 112, 2.2, HEDGE); m.fill(-47, 96, -45, 100, 1.0, PATH);      // west wall and its gate
  m.fill(-31, 136, -28, 164, 0.1, WOOD); m.fill(28, 136, 31, 160, 0.1, WOOD);       // piers
  m.trench([[40, 136], [58, 155]], 3, 0.1, SAND); m.ellipse(62, 158, 7, 7, 0.1, SAND); m.ellipse(63, 159, 3.5, 3.5, 0.5, ROCK1);   // lighthouse rock
  m.path([[0, 136], [0, 88]], 4, PATH); m.path([[-45, 98], [45, 98]], 4, PATH);
  // cliff stair up to the forest: two ramps with a landing between (a switchback)
  m.ramp(-8, 74, -1, 88, 'n', 1.0, 2.75, PATH);
  m.fill(-8, 68, 8, 74, 2.75, PATH);
  m.ramp(1, 54, 8, 68, 'n', 2.75, 4.5, PATH);
  // tide pools on the beach (shallow enough for the starting ball to climb out of)
  m.pool(-54, 129, 3, 0.06, WATER); m.pool(-63, 123, 2.5, 0.06, WATER); m.pool(56, 127, 3, 0.06, WATER);

  // ---- farm terraces (west), each half a metre above the last, ramps on alternating sides
  m.fill(-95, 85, -47, 108, 1.0, FARM);
  m.fill(-108, 65, -56, 85, 1.5, FARM);
  m.fill(-112, 45, -56, 65, 2.0, FARM);
  m.fill(-112, 20, -56, 45, 2.5, FARM);
  m.ramp(-70, 82, -66, 88, 'n', 1.0, 1.5, PATH);
  m.ramp(-104, 62, -100, 68, 'n', 1.5, 2.0, PATH);
  m.ramp(-70, 42, -66, 48, 'n', 2.0, 2.5, PATH);
  m.ramp(-56, 26, -44, 32, 'e', 2.5, 4.5, PATH);            // top terrace -> forest
  m.fill(-108, 24, -96, 36, 3.5, FARM); m.fill(-105, 27, -99, 33, 4.5, FARM);        // windmill knoll
  m.fill(-92, 90, -74, 104, 1.0, SOIL); m.fill(-104, 69, -76, 81, 1.5, SOIL); m.fill(-94, 49, -60, 61, 2.0, SOIL);   // ploughed fields
  m.grass(-90, 24, -62, 40);

  // ---- marsh (east): mud flats, channels and islets
  m.fill(58, 30, 118, 80, 0.4, MUD);
  m.fill(50, 80, 100, 112, 0.4, MUD);
  m.ramp(70, 108, 74, 116, 'n', 0.1, 0.4, WOOD);            // boardwalk up from the beach
  for (const pts of [[[60, 40], [80, 52], [112, 50]], [[66, 74], [86, 66], [110, 72]], [[56, 92], [76, 98], [96, 90]], [[84, 34], [90, 60], [82, 84]]]) {
    m.trench(pts, 3.5, 0.25, WATER); m.stream(pts, 3.5, WATER);
  }
  for (const [x, z, r] of [[72, 44, 4], [98, 60, 5], [74, 86, 4], [104, 40, 3.5], [64, 62, 3.5], [90, 100, 4]]) m.ellipse(x, z, r, r, 0.8, CLEAR, 1);
  m.grass(92, 64, 114, 78); m.grass(52, 98, 70, 110);

  // ---- tall grass elsewhere
  m.grass(-30, -90, 0, -70); m.grass(14, -70, 40, -52); m.grass(-44, 20, -30, 40); m.grass(30, 40, 46, 54);

  // ---- habitats (where critters of each kind live)
  m.zone('town', 0, 100, 42, 10); m.zone('town', 0, 124, 42, 10);
  m.zone('beach', 0, 0, 152, 150, [SAND]);
  m.zone('tidepool', -54, 129, 5, 5); m.zone('tidepool', -63, 123, 4.5, 4.5); m.zone('tidepool', 56, 127, 5, 5);
  m.zone('sea', 0, 0, 172, 172);
  m.zone('farm', -80, 64, 32, 44, [FARM, SOIL, 0x5fae52]);
  m.zone('marsh', 88, 55, 30, 25, [MUD, WATER, CLEAR, 0x5fae52]); m.zone('marsh', 75, 96, 25, 16, [MUD, WATER, CLEAR, 0x5fae52]);
  m.zone('forest', 0, 10, 58, 50, [FOREST, CLEAR, 0x5fae52]);
  m.zone('gorge', 37.5, -10, 3.5, 34, [MUD, WATER]); m.zone('gorge', 46, 29.5, 11, 3.5, [MUD, WATER]);
  m.zone('plain', 5, -72, 54, 26, [PLAIN, 0x5fae52]);
  m.zone('canyon', -48, -46, 16, 15, [CANYON]);
  m.zone('mountain', -70, -70, 44, 44, [ROCK1, ROCK2]);
  m.zone('summit', -70, -70, 21, 21, [ROCK3, SNOW, WATER]);
  m.zone('volcano', 80, -62, 42, 42, [ASH1, ASH2, ASH3]);
  m.zone('ruins', 22, -12, 12, 12, [RUIN, FOREST]);
  m.zone('islet', -160, 55, 8, 9, [SAND, WILD]); m.zone('islet', 168, 25, 6, 7, [SAND, WILD]); m.zone('islet', 62, 158, 7, 7, [SAND, ROCK1]);
  m.zone('wild', 0, -6, 138, 134, [WILD]);
}

// Items and scenery. Critters are placed by the game from the habitats above (see roster.js for how many).
export function layout(m) {
  for (const g of GATES) {
    const alongZ = g.z2 - g.z1 > g.x2 - g.x1, cx = (g.x1 + g.x2) / 2, cz = (g.z1 + g.z2) / 2, e = 0.4;
    if (alongZ) m.row(g.item, cx, g.z1 + e, cx, g.z2 - e, g.n, { rad: g.rad, rot: H });
    else m.row(g.item, g.x1 + e, cz, g.x2 - e, cz, g.n, { rad: g.rad, rot: 0 });
  }

  // ---- quay (start): a little food to get going, then market clutter. Critters do the rest.
  // only a handful of things: enough to grow from 45 cm to the 60 cm that the smallest critters need
  m.row('cup', -2, 120.5, 2, 120.5, 5); m.ring('bread', 0, 117.5, 1.3, 6); m.row('tonic', -3, 114.5, 3, 114.5, 5);
  m.blob('burger', -6, 121, 1.5, 4); m.blob('cup', 6, 119, 1.5, 4); m.blob('bread', 0, 126.5, 2, 4);
  m.row('flower', -12, 113.2, 12, 113.2, 12); m.blob('cake', -13, 121, 2, 3); m.blob('teddy', 13, 123, 2, 3);
  for (const [x, z] of [[-24, 121], [24, 121], [-34, 127], [34, 127]]) { m.put('stall', x, z, { rot: 0 }); m.grid('crate', x - 0.8, z + 1.7, 3, 1, 0.75, 0.75); m.blob('pumpkin', x + 2.4, z, 1.1, 3); m.blob('bread', x - 2.4, z, 1, 3); }
  m.row('crate', -29.5, 139, -29.5, 161, 7); m.row('barrel', 29.5, 139, 29.5, 157, 6);         // cargo on the piers
  m.put('canoe', -12, 139, { rot: 0.4 }); m.put('canoe', 14, 140, { rot: -0.5 }); m.put('canoe', -38, 140, { rot: 1.2 });
  m.put('tower', 63, 159);                                                                       // lighthouse
  // ---- trails: lines of things, each a size up from where you are, that lead to the next area
  m.row('bread', -18, 117, -18, 107, 6); m.row('cake', 18, 117, 18, 107, 5);                 // up both stairs
  m.row('pumpkin', -30, 98, -43, 98, 6);                                                     // to the west gate
  m.row('bucket', -68, 90, -68, 81, 5); m.row('crate', -102, 69, -102, 61, 5); m.row('barrel', -68, 49, -68, 41, 5);   // up the farm ramps
  m.row('stump', -57, 29, -45, 29, 5);                                                       // farm -> forest
  m.row('chair', -4.5, 85, -4.5, 75, 5); m.row('barrel', 4.5, 67, 4.5, 55, 5);               // up the cliff stair
  m.row('log', 37.5, 24, 37.5, -18, 6, { rot: 0 });                                          // up the gorge
  m.row('log', -5, -34, -5, -47, 5, { rot: 0 });                                             // forest -> plain
  m.row('stump', 0, -100, 0, -126, 7);                                                       // down the cove trail
  m.row('boulder', -17, -70, -30, -70, 4); m.row('boulder', 31, -62, 42, -62, 4);            // up the mountain and volcano ramps
  m.ring('bush', -18, 8, 6, 8); m.blob('log', -18, 8, 5, 5);                                 // the forest clearing
  m.ring('hay', 5, -72, 11, 10);                                                             // a ring on the plain
  // ---- upper town
  m.put('fountain', 0, 100);
  for (const [x, z, r] of [[-36, 104, H], [-24, 93, 0], [24, 93, 0], [36, 104, -H]]) m.put('house', x, z, { rot: r });
  m.put('tallhouse', 30, 91, { rot: 0 }); m.put('tallhouse', -34, 91, { rot: 0 });
  m.row('lamp', -40, 110.5, -24, 110.5, 3); m.row('lamp', 24, 110.5, 40, 110.5, 3); m.row('lamp', -12, 110.5, 12, 110.5, 4);
  m.put('bench', -6, 103, { rot: 0 }); m.put('bench', 6, 103, { rot: 0 }); m.put('table', 10, 97); m.ring('chair', 10, 97, 1.3, 4);
  m.put('statue', -14, 89.5); m.put('statue', 12, 89.5); m.put('sign', 2.5, 89.5); m.put('sign', -43, 102);
  m.scatter('appliance', -42, 90, 42, 108, 5); m.scatter('chair', -42, 90, 42, 108, 5); m.scatter('mailbox', -42, 90, 42, 108, 4);

  // ---- farm
  m.grid('crop', -91, 91, 8, 5, 2.2, 2.8); m.grid('pumpkin', -103, 70, 14, 3, 2, 4); m.grid('crop', -93, 50, 12, 3, 2.8, 4.5);
  m.row('fence', -94, 86, -72, 86, 12, { rot: 0 }); m.row('fence', -64, 86, -50, 86, 8, { rot: 0 });   // along the terrace lips, gaps at the ramps
  m.row('fence', -110, 66, -106, 66, 3, { rot: 0 }); m.row('fence', -98, 66, -58, 66, 20, { rot: 0 });
  m.row('hay', -110, 30, -110, 42, 4); m.grid('hay', -76, 26, 4, 2, 4, 4);
  m.put('windmill', -102, 30); m.put('barn', -64, 74); m.put('shed', -52, 92); m.put('shed', -100, 56); m.put('cart', -58, 100, { rot: 0.3 }); m.put('cart', -84, 44, { rot: H });
  m.scatter('stump', -110, 22, -58, 44, 4); m.scatter('sapling', -110, 46, -58, 106, 10);

  // ---- forest: trees in clumps with glades between, ruins on the stepped pyramid
  for (const [x, z, r, n] of [[-40, -10, 12, 10], [-30, 34, 12, 10], [10, 36, 13, 12], [-5, -22, 10, 8], [48, 10, 6, 5], [15, 15, 9, 7], [-46, 12, 6, 4], [46, 48, 5, 4]]) { m.blob('tree', x, z, r, n); m.blob('oak', x, z, r, Math.ceil(n / 2)); }
  m.ring('statue', 22, -12, 9.5, 8); m.put('obelisk', 22, -12); m.ring('boulder', -18, 8, 9, 7);
  m.blob('stump', -18, 8, 6, 4); m.blob('log', 0, 0, 8, 4); m.blob('bush', -12, 44, 8, 6); m.blob('bush', 28, 28, 6, 5);
  m.put('tent', 4, 50, { rot: 2.6 }); m.put('campfire', 6.5, 53);                                  // camp at the top of the cliff stair

  // ---- gorge, marsh
  m.blob('boulder', 36, -30, 2.5, 3); m.blob('log', 39, 8, 3, 3); m.blob('lily', 37.5, -5, 3, 5);
  m.blob('lily', 86, 60, 22, 14); m.put('canoe', 96, 52, { rot: 1 }); m.put('canoe', 64, 96, { rot: 0.2 });
  for (const [x, z] of [[72, 44], [98, 60], [74, 86], [104, 40], [64, 62], [90, 100]]) { m.blob('sapling', x, z, 3, 3); m.blob('stump', x, z, 3.5, 2); }

  // ---- plain, mountain, volcano
  m.blob('bigrock', 20, -84, 8, 4); m.blob('oak', -36, -58, 6, 3); m.blob('oak', 46, -86, 6, 3); m.ring('boulder', 5, -72, 6, 6);
  m.blob('stump', -50, -48, 12, 6); m.put('obelisk', -38, -58.5);                                  // canyon
  m.blob('bigrock', -70, -105, 9, 4); m.blob('bigrock', -100, -70, 8, 3); m.blob('boulder', -40, -85, 7, 5);
  m.put('tent', -62, -84, { rot: 1 }); m.put('campfire', -59, -86); m.ring('obelisk', -70, -70, 11, 3);
  m.blob('bigrock', 80, -98, 9, 4); m.blob('bigrock', 112, -62, 7, 3); m.blob('boulder', 52, -62, 7, 5); m.ring('boulder', 80, -62, 12, 8);
  m.put('canoe', 8, -146, { rot: 0.5 });                       // cove trail

  // ---- beach ring, islets, wild highlands
  m.zoneScatter('stump', 'beach', 10); m.zoneScatter('boulder', 'beach', 12); m.zoneScatter('canoe', 'beach', 5);
  m.zoneScatter('tent', 'beach', 4); m.zoneScatter('log', 'beach', 10); m.zoneScatter('bucket', 'beach', 12);
  m.zoneScatter('obelisk', 'islet', 3); m.zoneScatter('bigrock', 'islet', 4);
  m.zoneScatter('tree', 'wild', 90); m.zoneScatter('oak', 'wild', 40); m.zoneScatter('bigrock', 'wild', 14);
}
