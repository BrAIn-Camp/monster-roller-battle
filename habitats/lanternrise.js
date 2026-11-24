// LANTERNRISE (map2.js): this map's own things, and where everything on it goes. The format is in BRIEF.md.
// Ids are prefixed lr_. The things the first map's habitat files define (hb_ tu_ su_ mt_ af_ ca_ cy_ ru_ be_ tp_ se_ ma_
// fo_ go_ fa_ pl_ ...) are on hand here too, and most of what is placed is theirs: an orchard is still an orchard.
const H = Math.PI / 2;
const WOOD = 0x8a5a3a, STONE = 0xb8b4a8, CREAM = 0xf3ead7, RED = 0xc94f40, GOLD = 0xf2d24a, SLATE = 0x4a4f5a, MOSS = 0x7fa064, BRONZE = 0xb08a4a;

export const ITEMS = [
  { id: 'lr_tower', name: 'Tolling Tower', size: 17, shape: 'lr_tower', colors: [RED], rad: 0.2, mass: 0.06 },
  { id: 'lr_gate', name: 'Spirit Gate', size: 5, shape: 'lr_gate', colors: [RED, 0xd8603a], rad: 0.07, mass: 0.2 },
  { id: 'lr_stonelantern', name: 'Stone Lantern', size: 1.4, shape: 'lr_stonelantern', colors: [STONE, 0xa8a498], rad: 0.22, mass: 0.8 },
  { id: 'lr_paperlantern', name: 'Paper Lantern', size: 0.3, shape: 'lr_paperlantern', colors: [0xf2603a, 0xf2d24a, 0xf6f0d8, 0xe9588a] },
  { id: 'lr_dango', name: 'Dumpling Skewer', size: 0.2, shape: 'lr_dango', colors: [0xf6b8c8] },
  { id: 'lr_maple', name: 'Maple', size: 6.5, shape: 'lr_maple', colors: [0xd8483c, 0xe8862a, 0xf2c23a, 0xc23a30], rad: 0.1, mass: 0.1 },
  { id: 'lr_bamboo', name: 'Bamboo Clump', size: 5, shape: 'lr_bamboo', colors: [0x7fb85a, 0x6aa84a], rad: 0.12, mass: 0.15 },
  { id: 'lr_shoot', name: 'Bamboo Shoot', size: 0.3, shape: 'lr_shoot', colors: [0xcfc08a, 0xb8a870] },
  { id: 'lr_menhir', name: 'Standing Stone', size: 5.5, shape: 'lr_menhir', colors: [0xb0aca0, 0x9a968c, 0xc0bcae], rad: 0.2, mass: 0.6 },
  { id: 'lr_trilith', name: 'Stone Arch', size: 8, shape: 'lr_trilith', colors: [0xb0aca0, 0xa8a498], rad: 0.1, mass: 0.4 },
  { id: 'lr_bell', name: 'Hill Bell', size: 2.2, shape: 'lr_bell', colors: [BRONZE], rad: 0.25, mass: 0.5 },
  { id: 'lr_drum', name: 'Festival Drum', size: 1.6, shape: 'lr_drum', colors: [RED, 0x3a6ab8], rad: 0.3, mass: 0.6 },
  { id: 'lr_banner', name: 'Wind Banner', size: 4.5, shape: 'lr_banner', colors: [0xd8483c, 0x3a6ab8, 0xf2d24a, 0x5fbf5a, 0xe9588a], rad: 0.05, mass: 0.1 },
  { id: 'lr_ricestook', name: 'Rice Stook', size: 1.1, shape: 'lr_ricestook', colors: [0xd9c66a, 0xcfb858] },
  { id: 'lr_ricesheaf', name: 'Rice Sheaf', size: 0.4, shape: 'lr_ricesheaf', colors: [0xd9c66a] },
  { id: 'lr_applecrate', name: 'Apple Crate', size: 0.55, shape: 'lr_applecrate', colors: [0xd8483c, 0x8fcf5a, 0xf2d24a] },
  { id: 'lr_apple', name: 'Windfall Apple', size: 0.12, shape: 'lr_apple', colors: [0xd8483c, 0x8fcf5a, 0xf2d24a, 0xe8862a] },
  { id: 'lr_ciderbarrel', name: 'Cider Barrel', size: 1.2, shape: 'lr_ciderbarrel', colors: [WOOD] },
  { id: 'lr_press', name: 'Cider Press', size: 3.2, shape: 'lr_press', colors: [WOOD], rad: 0.3, mass: 0.4 },
  { id: 'lr_cairn', name: 'Cairn', size: 2.6, shape: 'lr_cairn', colors: [0x9a968c, 0xa8a498], rad: 0.3 },
  { id: 'lr_heather', name: 'Heather', size: 0.45, shape: 'lr_heather', colors: [0xa98ab8, 0xc49ad0, 0x8f6fa8] },
  { id: 'lr_shrine', name: 'Wayside Shrine', size: 3.2, shape: 'lr_shrine', colors: [RED, 0x7a5a3a], rad: 0.28, mass: 0.3 },
  { id: 'lr_claypot', name: 'Clay Pot', size: 0.45, shape: 'lr_claypot', colors: [0xc9744a, 0xd98a5a, 0xa85a3a] },
  { id: 'lr_brickstack', name: 'Stack of Bricks', size: 0.9, shape: 'lr_brickstack', colors: [0xc9744a, 0xb8663a] },
  { id: 'lr_snowlantern', name: 'Snow Lantern', size: 0.7, shape: 'lr_snowlantern', colors: [0xffffff] },
];

export const SHAPES = {
  // a tower of four storeys, each with a wide roof, and a spire
  lr_tower(g, c, P) {
    P(g, 'box', CREAM, [.34, .2, .34], [0, .1, 0]); P(g, 'pyr', c, [.32, .07, .32], [0, .235, 0]);
    P(g, 'box', CREAM, [.26, .16, .26], [0, .35, 0]); P(g, 'pyr', c, [.26, .06, .26], [0, .46, 0]);
    P(g, 'box', CREAM, [.2, .14, .2], [0, .56, 0]); P(g, 'pyr', c, [.2, .06, .2], [0, .66, 0]);
    P(g, 'box', CREAM, [.14, .12, .14], [0, .75, 0]); P(g, 'pyr', c, [.16, .08, .16], [0, .85, 0]);
    P(g, 'cyl', GOLD, [.012, .11, .012], [0, .945, 0]);
  },
  // two posts and two beams: a gate to roll through
  lr_gate(g, c, P) {
    P(g, 'cyl', c, [.045, .86, .045], [.36, .43, 0]); P(g, 'cyl', c, [.045, .86, .045], [-.36, .43, 0]);
    P(g, 'box', SLATE, [1, .07, .11], [0, .93, 0]); P(g, 'box', c, [.86, .05, .07], [0, .74, 0]);
  },
  lr_stonelantern(g, c, P) {
    P(g, 'cyl', c, [.3, .1, .3], [0, .05, 0]); P(g, 'cyl', c, [.11, .42, .11], [0, .31, 0]);
    P(g, 'box', GOLD, [.34, .2, .34], [0, .62, 0]); P(g, 'pyr', c, [.4, .2, .4], [0, .82, 0]); P(g, 'sph', c, [.07, .07, .07], [0, .94, 0]);
  },
  lr_paperlantern(g, c, P) { P(g, 'sph', c, [.36, .4, .36], [0, .5, 0]); P(g, 'cyl', SLATE, [.2, .1, .2], [0, .05, 0]); P(g, 'cyl', SLATE, [.2, .1, .2], [0, .95, 0]); },
  lr_dango(g, c, P) {
    P(g, 'cyl', 0xe8d9a8, [.04, 1, .04], [0, .5, 0]); P(g, 'sph', c, [.2, .14, .2], [0, .78, 0]);
    P(g, 'sph', 0xf6f0d8, [.2, .14, .2], [0, .52, 0]); P(g, 'sph', 0x9ccf7a, [.2, .14, .2], [0, .26, 0]);
  },
  lr_maple(g, c, P) {
    P(g, 'taper', WOOD, [.05, .5, .05], [0, .25, 0]);
    P(g, 'sph', c, [.3, .22, .3], [0, .62, 0]); P(g, 'sph', c, [.22, .17, .22], [.16, .78, .06]); P(g, 'sph', c, [.2, .16, .2], [-.14, .8, -.08]);
  },
  lr_bamboo(g, c, P) {
    P(g, 'cyl', c, [.022, .92, .022], [0, .46, 0]); P(g, 'cyl', c, [.02, .8, .02], [.09, .4, .05], [0, 0, -0.06]); P(g, 'cyl', c, [.02, .7, .02], [-.08, .35, -.06], [0, 0, 0.07]);
    P(g, 'sph', 0x9ccf6a, [.14, .09, .14], [0, .93, 0]); P(g, 'sph', 0x9ccf6a, [.11, .07, .11], [.12, .8, .05]); P(g, 'sph', 0x9ccf6a, [.1, .06, .1], [-.11, .7, -.06]);
  },
  lr_shoot(g, c, P) { P(g, 'cone', c, [.3, .9, .3], [0, .45, 0]); P(g, 'cone', 0x8a7a55, [.34, .3, .34], [0, .15, 0]); },
  lr_menhir(g, c, P) { P(g, 'rock', c, [.19, .5, .15], [0, .5, 0], [0, .4, .05]); P(g, 'sph', MOSS, [.16, .05, .13], [0, .06, 0]); },
  lr_trilith(g, c, P) {
    P(g, 'rock', c, [.11, .4, .1], [.34, .4, 0]); P(g, 'rock', c, [.11, .4, .1], [-.34, .4, 0]);
    P(g, 'box', c, [1, .14, .2], [0, .86, 0], [0, 0, .02]);
  },
  lr_bell(g, c, P) {
    P(g, 'cyl', WOOD, [.05, .9, .05], [.4, .45, 0]); P(g, 'cyl', WOOD, [.05, .9, .05], [-.4, .45, 0]); P(g, 'box', WOOD, [1, .08, .12], [0, .94, 0]);
    P(g, 'taper', c, [.26, .5, .26], [0, .58, 0]); P(g, 'sph', c, [.2, .1, .2], [0, .84, 0]);
  },
  lr_drum(g, c, P) {
    P(g, 'cyl', c, [.4, .5, .4], [0, .6, 0], [H, 0, 0]); P(g, 'cyl', CREAM, [.37, .52, .37], [0, .6, 0], [H, 0, 0]);
    P(g, 'box', WOOD, [.7, .2, .5], [0, .1, 0]);
  },
  lr_banner(g, c, P) { P(g, 'cyl', WOOD, [.012, 1, .012], [0, .5, 0]); P(g, 'box', c, [.1, .62, .01], [.06, .66, 0]); P(g, 'sph', GOLD, [.025, .025, .025], [0, .99, 0]); },
  lr_ricestook(g, c, P) { P(g, 'cone', c, [.42, .9, .42], [0, .45, 0]); P(g, 'torus', WOOD, [.2, .6, .2], [0, .62, 0]); P(g, 'sph', c, [.12, .1, .12], [0, .93, 0]); },
  lr_ricesheaf(g, c, P) { P(g, 'cone', c, [.3, 1, .3], [0, .5, 0]); P(g, 'torus', WOOD, [.16, .7, .16], [0, .5, 0]); },
  lr_applecrate(g, c, P) {
    P(g, 'box', 0xb08a5a, [.9, .5, .7], [0, .25, 0]);
    P(g, 'sph', c, [.16, .16, .16], [-.22, .56, .1]); P(g, 'sph', c, [.16, .16, .16], [.18, .56, -.08]); P(g, 'sph', c, [.16, .16, .16], [0, .64, .12]);
  },
  lr_apple(g, c, P) { P(g, 'sph', c, [.44, .42, .44], [0, .42, 0]); P(g, 'cyl', WOOD, [.05, .2, .05], [0, .9, 0]); },
  lr_ciderbarrel(g, c, P) { P(g, 'cyl', c, [.4, .9, .4], [0, .45, 0]); P(g, 'torus', SLATE, [.42, .5, .42], [0, .22, 0]); P(g, 'torus', SLATE, [.42, .5, .42], [0, .68, 0]); },
  lr_press(g, c, P) {
    P(g, 'box', c, [.9, .1, .7], [0, .05, 0]); P(g, 'cyl', 0xa87a4a, [.3, .4, .3], [0, .3, 0]);
    P(g, 'box', c, [.08, .9, .08], [.4, .45, 0]); P(g, 'box', c, [.08, .9, .08], [-.4, .45, 0]); P(g, 'box', c, [.96, .1, .14], [0, .92, 0]);
    P(g, 'cyl', SLATE, [.04, .44, .04], [0, .68, 0]);
  },
  lr_cairn(g, c, P) { P(g, 'rock', c, [.36, .2, .34], [0, .2, 0]); P(g, 'rock', c, [.27, .16, .26], [.02, .5, 0]); P(g, 'rock', c, [.18, .12, .18], [-.02, .74, .01]); P(g, 'rock', c, [.1, .08, .1], [0, .92, 0]); },
  lr_heather(g, c, P) { P(g, 'sph', 0x6f8f5a, [.5, .3, .5], [0, .3, 0]); P(g, 'sph', c, [.36, .26, .36], [.06, .56, 0]); },
  lr_shrine(g, c, P) {
    P(g, 'box', STONE, [.7, .12, .6], [0, .06, 0]); P(g, 'box', WOOD, [.46, .4, .4], [0, .32, 0]);
    P(g, 'pyr', c, [.5, .26, .46], [0, .65, 0]); P(g, 'box', GOLD, [.14, .2, .02], [0, .3, .21]);
  },
  lr_claypot(g, c, P) { P(g, 'sph', c, [.42, .4, .42], [0, .4, 0]); P(g, 'cyl', c, [.24, .22, .24], [0, .86, 0]); },
  lr_brickstack(g, c, P) { P(g, 'box', c, [.9, .3, .6], [0, .15, 0]); P(g, 'box', c, [.74, .3, .56], [.02, .45, 0]); P(g, 'box', c, [.5, .28, .5], [-.04, .74, 0]); },
  lr_snowlantern(g, c, P) { P(g, 'hemi', c, [.5, .9, .5], [0, 0, 0]); P(g, 'box', 0xffd23f, [.3, .3, .1], [0, .3, .46]); },
};

export function dress(m, { PLACES: P }) {
  const TAU = Math.PI * 2, R = () => m.rand();
  // the roads and stairs stay clear
  const onRoad = (x, z, w = 6) => (Math.abs(x) < w && z < -46 && z > -200) || (Math.abs(z - 6) < w && x > 46 && x < 200) || (Math.abs(z + 4) < w && x < -46 && x > -200) || (Math.abs(x) < w && z > 46 && z < 176);
  const dry = (x, z) => m.water(x, z) === 0;
  // one thing where it is asked for, unless something solid is already there (scatter checks that)
  const one = (id, x, z, opt) => m.scatter(id, x - 0.4, z - 0.4, x + 0.4, z + 0.4, 1, opt);
  // n things somewhere in the given biomes (ground cover; `where` narrows it down)
  const sow = (id, biomes, n, opt = {}, where = null) => {
    for (let i = 0, t = 0; i < n && t < n * 60; t++) {
      const x = -232 + R() * 464, z = -232 + R() * 464;
      if (!biomes.includes(m.biomeAt(x, z)) || onRoad(x, z) || (opt.wet ? m.water(x, z) !== 1 : !dry(x, z)) || (where && !where(x, z))) continue;
      one(id, x, z, opt.scale ? { scale: opt.scale[0] + R() * (opt.scale[1] - opt.scale[0]) } : undefined); i++;
    }
  };
  const both = (id, x1, z1, x2, z2, n, off, opt) => {                      // a row either side of a line
    const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz) || 1, nx = -dz / L * off, nz = dx / L * off;
    m.row(id, x1 + nx, z1 + nz, x2 + nx, z2 + nz, n, opt); m.row(id, x1 - nx, z1 - nz, x2 - nx, z2 - nz, n, opt);
  };

  // ================================================================ Lantern Square: the festival
  m.put('hb_feastrug', 0, 0, { rot: 0 }); m.put('hb_grandtart', 0, 0);
  m.ring('hb_pie', 0, 0, 2.2, 8); m.ring('hb_goldpie', 0, 0, 3.4, 6); m.ring('lr_dango', 0, 0, 4.6, 16); m.ring('hb_jelly', 0, 0, 5.8, 10);
  m.ring('lr_dango', 0, 0, 11.5, 28); m.ring('hb_candy', 0, 0, 13.5, 40); m.ring('lr_stonelantern', 0, 0, 15.5, 12);
  m.ring('lr_paperlantern', 0, 0, 18.5, 36); m.ring('hb_macaron', 0, 0, 20.5, 44);
  for (const [sx, sz] of [[-21, 21], [21, 21], [21, -21], [-21, -21]]) {
    m.row('hb_bun', sx * 0.85, sz * 0.85, sx * 0.3, sz * 0.3, 9); m.row('hb_toffeeapple', sx * 1.25, sz * 1.25, sx * 1.9, sz * 1.9, 7);
    m.ring('hb_crumb', sx, sz, 4.2, 12); m.put('hb_startflag', sx * 1.16, sz * 1.16);
  }
  // four quarters of stalls between the spoke roads, each with its stock laid out in front
  [['hb_stall', 'hb_jamtart'], ['hb_producestand', 'lr_apple'], ['hb_booth', 'hb_ring'], ['hb_kiosk', 'hb_cone'], ['hb_gadgetstall', 'hb_battery'], ['hb_snowcart', 'hb_cone'], ['hb_fortunetent', 'hb_crystalball'], ['hb_puppettheatre', 'hb_puppet']].forEach(([stall, stock], i) => {
    const a = (i + 0.5) / 8 * TAU + (i & 1 ? 0.16 : -0.16), r = 29, x = Math.cos(a) * r, z = Math.sin(a) * r;
    m.put(stall, x, z, { rot: -a - H });
    m.row(stock, x - Math.cos(a) * 3 - Math.sin(a) * 2.4, z - Math.sin(a) * 3 + Math.cos(a) * 2.4, x - Math.cos(a) * 3 + Math.sin(a) * 2.4, z - Math.sin(a) * 3 - Math.cos(a) * 2.4, 7);
    m.put('lr_paperlantern', x - Math.cos(a) * 1.6, z - Math.sin(a) * 1.6, { scale: 1.6 });
  });
  // (the bandstand and the maypole stand in two of the quarters, off the spoke roads: on the roads they held the CPU
  // teams in the Square)
  m.put('hb_bandstand', -20, -10, { rot: 1.1 }); m.put('lr_drum', -15.5, -7, { rot: 1.1 }); m.put('lr_drum', -17, -14, { rot: 1.1 }); m.row('hb_drum', -14.5, -9, -15.5, -12.5, 4);
  m.put('hb_maypole', 20, 10); m.ring('hb_balloons', 20, 10, 3.4, 8);
  m.ring('hb_lanternpost', 0, 0, 41, 16); m.ring('lr_banner', 0, 0, 46, 24);
  for (const [dx, dz] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) m.put('lr_gate', dx * 47 + (dx ? 0 : 0), dz * 47 + (dx > 0 ? 6 : dx < 0 ? -4 : 0), { rot: dx ? H : 0 });
  sow('hb_candy', ['hub'], 70); sow('hb_macaron', ['hub'], 60); sow('lr_apple', ['hub'], 50); sow('hb_jamtart', ['hub'], 40); sow('hb_cone', ['hub'], 30);
  sow('hb_hamper', ['hub'], 14); sow('hb_cooler', ['hub'], 12); sow('hb_gnome', ['hub'], 10); sow('hb_flowertub', ['hub'], 16); sow('hb_foldchair', ['hub'], 14); sow('hb_beachball', ['hub'], 8);
  sow('lr_paperlantern', ['hub'], 40); sow('hb_duck', ['hub'], 16, { wet: true });

  // ================================================================ the three pilgrim roads
  // lanterns either side, a trail of offerings down the middle, a gate at the top of each pass and the foot of each stair
  both('lr_stonelantern', 0, -56, 0, -104, 7, 4.6); m.row('lr_dango', 0, -54, 0, -104, 22); m.row('lr_paperlantern', -1.2, -110, 1.2, -126, 9);
  m.put('lr_gate', 0, -106, { rot: 0 }); m.put('lr_gate', 0, -129, { rot: 0, scale: 1.3 });
  both('lr_stonelantern', 56, 6, 106, 6, 7, 4.6); m.row('hb_bun', 54, 6, 106, 6, 22); m.row('lr_paperlantern', 110, 5, 128, 7, 9);
  m.put('lr_gate', 108, 6, { rot: H }); m.put('lr_gate', 151, 6, { rot: H, scale: 1.3 });
  both('lr_stonelantern', -56, -4, -100, -4, 7, 4.6); m.row('hb_jamtart', -54, -4, -100, -4, 22); m.row('lr_paperlantern', -104, -3, -120, -5, 9);
  m.put('lr_gate', -102, -4, { rot: H }); m.put('lr_gate', -123, -4, { rot: H, scale: 1.3 });
  m.row('be_shell', 0, 54, 0, 102, 26); both('be_bollard', 0, 108, 0, 168, 9, 1.6); m.row('be_rod', 1.4, 150, 1.4, 170, 5, { rot: H });

  // ================================================================ north: Kiteflower Downs, and the mountain
  { const [kx, kz] = [P.kiteField[0] + 22, P.kiteField[1]];
    m.ring('pl_kite', kx, kz, 8, 5); m.put('pl_windsock', kx + 11, kz - 6); m.put('pl_picnictable', kx - 15, kz + 9, { rot: 0.5 });
    m.ring('hb_foldchair', kx, kz, 4, 7); m.ring('pl_pinwheel', kx, kz, 11.5, 22); m.put('hb_hamper', kx, kz); m.row('hb_bun', kx - 3, kz + 1, kx + 3, kz + 1, 6);
    m.put('pl_balloonflat', -34, -84); m.put('pl_wagon', -28, -76, { rot: 1 }); m.row('hb_waterbottle', -31, -80, -26, -80, 5); }
  sow('pl_wildflower', ['downs'], 170); sow('pl_pinwheel', ['downs'], 40); sow('pl_mound', ['downs'], 34); sow('fa_bale', ['downs'], 14); sow('pl_rick', ['downs'], 6); sow('lr_banner', ['downs'], 10);
  m.put('pl_tyreoak', 40, -100); m.put('pl_chair', -44, -106, { rot: 2.4 });
  // Mount Hushpeak: the beacon on top, a camp on the shoulder, pines and snowmen below the snow line
  m.put('su_beacon', P.peak[0], P.peak[1]); m.ring('lr_snowlantern', P.peak[0], P.peak[1], 6.5, 10); m.ring('su_flag', P.peak[0], P.peak[1], 8.5, 14);
  for (const [rad] of [[58], [48], [38], [28], [19]]) both('lr_snowlantern', 0, P.peak[1] + rad - 1, 0, P.peak[1] + rad - 6, 2, 4.6);
  m.put('su_tent', 16, -158, { rot: 2 }); m.put('su_tent', 21, -164, { rot: 2.6 }); m.put('su_flagpole', 13, -164); m.row('su_oxygen', 14, -155, 20, -155, 4); m.put('su_axe', 18, -160); m.put('su_rope', 17, -161.5);
  m.put('su_shrine', -30, -168, { rot: 0.6 }); m.put('su_cave', 34, -190, { rot: -1 }); m.put('su_fossil', -22, -206, { rot: 0.3 });
  sow('tu_pine', ['peak'], 46, {}, (x, z) => m.ground(x, z) < 6); sow('su_cairn', ['peak'], 14); sow('su_crystal', ['peak'], 8, {}, (x, z) => m.ground(x, z) > 5); sow('tu_snowman', ['peak'], 12); sow('tu_snowman2', ['peak'], 18);
  sow('tu_snowball', ['peak'], 60); sow('su_avalanche', ['peak'], 8); sow('tu_iceblock', ['peak'], 24); sow('mt_rock', ['peak'], 22);

  // ================================================================ north-east: the Paddy Steps, and the crags
  m.put('fa_barn', P.paddyHouse[0], P.paddyHouse[1] - 1, { rot: 2.36, scale: 0.8 }); m.put('fa_coop', P.paddyHouse[0] + 6.5, P.paddyHouse[1] + 5); m.put('fa_washline', P.paddyHouse[0] - 6, P.paddyHouse[1] + 5.5, { rot: 0.8 });
  m.row('fa_eggcrate', P.paddyHouse[0] + 4, P.paddyHouse[1] + 2.5, P.paddyHouse[0] + 7.5, P.paddyHouse[1] + 2.5, 4); m.put('fa_trough', P.paddyHouse[0] - 2, P.paddyHouse[1] + 6); m.ring('af_duck', 84, -40, 3, 9);
  sow('lr_ricestook', ['paddies'], 90); sow('lr_ricesheaf', ['paddies'], 130); sow('fa_scarecrow', ['paddies'], 9); sow('fa_cabbage', ['paddies'], 70); sow('af_duck', ['paddies'], 24, { wet: true });
  sow('fa_plough', ['paddies'], 4); sow('fa_churn', ['paddies'], 10); sow('lr_stonelantern', ['paddies'], 8); sow('fa_sunflower', ['paddies'], 26); sow('fa_bale', ['paddies'], 16);
  m.put('lr_shrine', 76, -86, { rot: 2.4 }); m.put('fa_silo', 46, -92);
  m.put('mt_station', P.crag[0], P.crag[1], { rot: 2.4, scale: 0.8 }); m.put('lr_bell', 168, -92, { scale: 3 }); m.put('mt_nest', 96, -168); m.ring('mt_egg', 96, -168, 1.4, 4);
  m.put('mt_weather', 118, -116); m.put('mt_gondola', 126, -118, { rot: 0.8 }); m.row('mt_post', 104, -104, 124, -124, 6); m.row('mt_bell', 104.8, -103.2, 124.8, -123.2, 6);
  sow('mt_rock', ['crags'], 70); sow('mt_deadtree', ['crags'], 7); sow('mt_stone', ['crags'], 6); sow('mt_wall', ['crags'], 6); sow('mt_chalk', ['crags'], 50); sow('tu_pine', ['crags'], 26, {}, (x, z) => m.ground(x, z) < 4.5); sow('su_cairn', ['crags'], 10);

  // ================================================================ east: Maplefall Wood, and the Slumbering Stones
  m.put('fo_treehouse', P.mapleHeart[0] + 2, P.mapleHeart[1] - 15, { rot: -H }); m.ring('fo_bedroll', P.mapleHeart[0] - 6, P.mapleHeart[1] - 12, 2.2, 5); m.put('fo_logpile', P.mapleHeart[0] - 9, P.mapleHeart[1] - 18);
  m.put('fo_sawpit', P.mapleHeart[0] + 10, P.mapleHeart[1] - 20, { rot: 0.4 }); m.ring('fo_sawdust', P.mapleHeart[0] + 10, P.mapleHeart[1] - 20, 2.6, 7); m.put('fo_bunting', P.mapleHeart[0] - 2, P.mapleHeart[1] - 8, { rot: 0 });
  m.put('fo_elder', 96, 44); m.put('fo_hollow', 72, 34, { rot: 1 }); m.put('lr_shrine', 104, -22, { rot: -H });
  sow('lr_maple', ['wood'], 120, { scale: [0.7, 1.25] }); sow('fo_toadstool', ['wood'], 110); sow('fo_acorn', ['wood'], 80); sow('fo_pinecone', ['wood'], 60); sow('fo_fern', ['wood'], 70);
  sow('fo_mossrock', ['wood'], 26); sow('fo_basket', ['wood'], 18); sow('fo_hive', ['wood'], 10); sow('fo_birdbox', ['wood'], 8); sow('fo_totem', ['wood'], 8); sow('lr_stonelantern', ['wood'], 10);
  { const [sx, sz] = P.stones;
    m.put('ru_orb', sx, sz, { scale: 1.4 }); for (const [dx, dz] of [[5, 5], [-5, 5], [5, -5], [-5, -5]]) m.put('lr_trilith', sx + dx, sz + dz, { rot: Math.atan2(dx, dz) + H });
    m.ring('lr_menhir', sx, sz, 12.5, 10); m.ring('lr_menhir', sx, sz, 19.5, 14, { scale: 0.7 }); m.ring('ru_brazier', sx, sz, 26.5, 12);
    m.put('ru_obelisk', sx - 26, sz - 34); m.put('ru_obelisk', sx - 26, sz + 34); m.put('ru_head', sx + 6, sz + 44, { rot: 2 }); m.put('ru_hand', sx - 8, sz - 46, { rot: 1 }); m.put('ru_foot', sx + 22, sz - 40); }
  sow('lr_menhir', ['stones'], 30, { scale: [0.5, 1.1] }); sow('ru_shard', ['stones'], 90); sow('ru_urn', ['stones'], 34); sow('ru_brokencol', ['stones'], 12); sow('ru_fallencol', ['stones'], 8); sow('ru_column', ['stones'], 6);
  sow('ru_idol', ['stones'], 8); sow('ru_sieve', ['stones'], 16); sow('ru_brush', ['stones'], 30); sow('lr_heather', ['stones'], 40); sow('ru_shipcrate', ['stones'], 10);

  // ================================================================ south-east: Redclay Hollows, and Emberkiln Ridge
  { const [cx, cz] = P.clayPits;
    m.put('af_kiln', cx - 12, cz - 10, { rot: 0.8 }); m.put('af_kiln', cx - 16, cz - 4, { rot: 0.4 }); m.row('lr_brickstack', cx - 10, cz - 14, cx - 2, cz - 16, 5); m.grid('lr_claypot', cx - 20, cz - 12, 4, 3, 0.8, 0.8);
    m.put('cy_wagon', cx + 14, cz - 8, { rot: 1.2 }); m.put('cy_tent', cx + 4, cz - 14, { rot: 2.6 }); m.row('cy_pick', cx - 4, cz - 9, cx + 2, cz - 10, 4); m.put('cy_signpost', cx - 22, cz - 20); }
  sow('lr_claypot', ['hollows'], 90); sow('lr_brickstack', ['hollows'], 26); sow('cy_tumbleweed', ['hollows'], 30); sow('cy_jar', ['hollows'], 40); sow('cy_basket', ['hollows'], 30); sow('cy_cactus', ['hollows'], 26);
  sow('cy_minecart', ['hollows'], 9); sow('cy_wheel', ['hollows'], 12); sow('cy_potcactus', ['hollows'], 60); sow('cy_teapot', ['hollows'], 40); sow('cy_totem', ['hollows'], 6, {}, (x, z) => m.ground(x, z) > 2); sow('cy_palm', ['hollows'], 5);
  m.put('ca_spire', P.kiln[0] + 30, P.kiln[1] - 26); m.put('ca_gong', 104, 100, { rot: -2.3 }); m.put('ca_nest', 182, 96); m.ring('ca_egg', 182, 96, 1.6, 3); m.put('ca_arch', 112, 148, { rot: 0.7 });
  sow('ca_basalt', ['kiln'], 26); sow('ca_chimney', ['kiln'], 10); sow('af_geyser', ['kiln'], 22); sow('af_vent', ['kiln'], 16); sow('af_shard', ['kiln'], 70); sow('af_charcoal', ['kiln'], 60);
  sow('ca_bomb', ['kiln'], 22); sow('af_deadtree', ['kiln'], 8); sow('ca_instrument', ['kiln'], 6); sow('af_anvil', ['kiln'], 10);

  // ================================================================ south: the strand, the shallows, the isles
  for (let i = 0; i < 7; i++) { const x = -40 + i * 13.5 + (i > 2 ? 4 : 0), z = 78 + (i % 2) * 6; if (Math.abs(x) < 7) continue; m.put('be_parasol', x, z); m.put('be_deckchair', x + 1.4, z + 0.6, { rot: 0.3 }); m.put('be_towel', x - 1.6, z + 0.4, { rot: 0.2 }); m.put('be_cooler', x + 0.4, z - 1.3); m.row('be_icecream', x - 1, z + 2, x + 1, z + 2, 3); }
  m.put('be_hut', -22, 66, { rot: 0 }); m.put('be_hut', 22, 66, { rot: 0 }); m.put('be_tower', 30, 96); m.put('be_kite', -30, 92); m.put('be_cart', 12, 70); m.put('be_net', -52, 100, { rot: 0.4 });
  sow('be_shell', ['strand'], 170); sow('be_starfish', ['strand'], 60); sow('be_castle', ['strand'], 16); sow('be_pail', ['strand'], 30); sow('be_spade', ['strand'], 30); sow('be_ball', ['strand'], 14); sow('be_flipflop', ['strand'], 40); sow('be_surfboard', ['strand'], 8); sow('be_rowboat', ['strand'], 5);
  m.put('tp_lighthouse', P.lighthouse[0], P.lighthouse[1]); m.put('tp_cottage', P.lighthouse[0] - 9, P.lighthouse[1] - 6, { rot: 0.5 }); m.put('tp_hull', -44, 142, { rot: 1.1 });
  sow('tp_rock', ['tidepool'], 40); sow('tp_conch', ['tidepool'], 26); sow('tp_clam', ['tidepool'], 16); sow('tp_pot', ['tidepool'], 30); sow('tp_bottle', ['tidepool'], 40); sow('tp_anchor', ['tidepool'], 8); sow('tp_netrack', ['tidepool'], 6); sow('tp_fish', ['tidepool'], 30, { wet: true });
  P.islets.forEach(([x, z], i) => {
    m.put('lr_gate', x, z, { rot: i * 0.8, scale: 1.2 }); m.put('se_palm', x + 4, z - 3); m.put(['se_chest', 'se_idol', 'se_tiki', 'se_bell'][i], x - 4, z + 3);
    m.ring('se_coconut', x, z, 6, 5); m.ring('be_shell', x, z, 9, 14); m.put('se_leanto', x - 6, z - 4, { rot: 1 });
  });
  m.put('se_ship', 96, 196, { rot: 0.6 }); m.put('se_fishboat', -8, 178, { rot: 2 }); m.put('se_duck', 40, 216); m.put('se_serpent', -110, 204, { rot: 1.2 }); m.row('se_buoy', -20, 166, 60, 172, 6);

  // ================================================================ south-west: Stillmere Fen, and the ravine
  { const [lx, lz] = P.lake;
    m.put('lr_gate', lx + 3, lz - 2, { rot: 0.6, scale: 1.4 }); m.put('ma_punt', lx - 8, lz + 5, { rot: 0.7 }); m.put('ma_punt', lx + 9, lz + 8, { rot: 2.2 });
    m.put('ma_hut', lx + 22, lz - 14, { rot: -2.3 }); m.row('ma_lantern', -44, 44, lx + 13, lz - 13, 5); m.ring('ma_post', lx, lz, 17.5, 14);
    for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 4 + R() * 11; m.put('ma_lotus', lx + Math.cos(a) * r, lz + Math.sin(a) * r); }
    m.put('ma_toadstool', lx - 28, lz + 4); m.put('ma_statue', lx + 4, lz + 26, { rot: 3 }); }
  sow('ma_reed', ['fen'], 150); sow('ma_fern', ['fen'], 70); sow('ma_shroom', ['fen'], 90); sow('ma_stone', ['fen'], 40); sow('ma_jar', ['fen'], 50); sow('ma_bundle', ['fen'], 26); sow('ma_rotlog', ['fen'], 14);
  sow('ma_mangrove', ['fen'], 26); sow('ma_driftwood', ['fen'], 16); sow('ma_cauldron', ['fen'], 8); sow('ma_frognet', ['fen'], 10); sow('ma_lotus', ['fen'], 40, { wet: true }); sow('ma_plank', ['fen'], 20);
  m.put('go_waterwheel', P.ravineMouth[0] + 12, P.ravineMouth[1] - 10, { rot: 0.8 }); m.put('go_bridgetower', -108, 100); m.put('go_bridgetower', -96, 126); m.put('go_guardian', P.ravineHead[0] + 16, P.ravineHead[1] - 6, { rot: -0.9 });
  m.put('go_minegate', -150, 118, { rot: 1.1 }); m.row('go_rail', -146, 120, -132, 128, 7, { rot: 1.05 }); m.row('go_orecart', -144, 122, -134, 128, 3, { rot: 1.05 }); m.put('go_horn', -168, 160); m.put('go_glider', -120, 158, { rot: 2.2 }); m.put('go_platform', -160, 136);
  sow('go_geode', ['ravine'], 26); sow('fo_mossrock', ['ravine'], 50); sow('fo_fern', ['ravine'], 60); sow('go_bigstump', ['ravine'], 5); sow('go_flagpole', ['ravine'], 6); sow('fo_pinecone', ['ravine'], 50); sow('tu_pine', ['ravine'], 30);
  sow('go_kayak', ['ravine'], 8, { wet: true }); sow('go_raft', ['ravine'], 4, { wet: true }); sow('go_sluice', ['ravine'], 3, {}, (x, z) => m.ground(x, z) < 1);

  // ================================================================ west: the Whispering Canes, and Tolling Hill
  { const [gx, gz] = [P.caneGate[0], P.caneGate[1] + 16];
    for (let i = 0; i < 6; i++) m.put('lr_gate', gx - 7 + i * 2.8, gz, { rot: H });          // a tunnel of gates
    m.put('af_teahouse', gx + 2, gz + 9, { rot: 3.14 }); m.ring('lr_stonelantern', gx, gz, 9, 6); m.row('af_sandal', gx - 1, gz + 5, gx + 4, gz + 5, 6); m.row('cy_teapot', gx - 2, gz + 4, gx + 5, gz + 4, 5); }
  sow('lr_bamboo', ['canes'], 170, { scale: [0.7, 1.3] }); sow('lr_shoot', ['canes'], 120); sow('fo_fern', ['canes'], 60); sow('lr_paperlantern', ['canes'], 50); sow('fo_mossrock', ['canes'], 20);
  sow('lr_stonelantern', ['canes'], 12); sow('fo_basket', ['canes'], 22); sow('lr_shrine', ['canes'], 3); sow('fo_duckboard', ['canes'], 16);
  { const [tx, tz] = P.towerHill;
    m.put('lr_tower', tx, tz, { rot: 0 }); m.ring('lr_bell', tx, tz, 8.5, 4); m.ring('lr_stonelantern', tx, tz, 10, 12);
    m.ring('lr_banner', tx, tz, 18, 16); m.ring('lr_stonelantern', tx, tz, 29, 16); m.ring('lr_maple', tx, tz, 41, 12); m.ring('lr_banner', tx, tz, 53, 22);
    for (const [rad] of [[60], [47], [35], [24]]) m.put('lr_gate', tx + rad - 3.5, tz, { rot: H }); }
  sow('lr_maple', ['towerhill'], 40, { scale: [0.6, 1.1] }); sow('lr_heather', ['towerhill'], 60); sow('lr_paperlantern', ['towerhill'], 60); sow('lr_shrine', ['towerhill'], 5); sow('lr_menhir', ['towerhill'], 10, { scale: [0.4, 0.8] }); sow('lr_drum', ['towerhill'], 8); sow('lr_bell', ['towerhill'], 8);

  // ================================================================ north-west: Applewind Orchard, and the moor
  { const [px, pz] = P.ciderPress;
    m.put('lr_press', px, pz - 2, { rot: 0.8 }); m.grid('lr_ciderbarrel', px + 4, pz + 2, 3, 2, 1.4, 1.4); m.put('lr_ciderbarrel', px + 5.4, pz + 2.7, { scale: 0.8 }); m.row('lr_applecrate', px - 7, pz + 5, px - 1, pz + 6, 6);
    m.put('fa_judgetable', px - 5, pz - 5, { rot: 0.8 }); m.row('fa_trophy', px - 6, pz - 5.6, px - 4, pz - 4.4, 3); m.put('fa_ladder', px + 7, pz - 6); m.put('fa_sledge', px - 8, pz - 1); }
  for (let i = 0; i < 46; i++) { const a = -2.75 + (i % 8) * 0.105 + R() * 0.03, r = 70 + Math.floor(i / 8) * 9 + R() * 2, x = Math.sin(a) * r, z = -Math.cos(a) * r; if (m.biomeAt(x, z) === 'orchard' && dry(x, z)) { one('fa_appletree', x, z); m.ring('lr_apple', x, z, 1.6, 6); } }
  sow('lr_apple', ['orchard'], 150); sow('lr_applecrate', ['orchard'], 40); sow('fa_ladder', ['orchard'], 10); sow('fo_basket', ['orchard'], 30); sow('fa_bale', ['orchard'], 12); sow('fo_hive', ['orchard'], 12);
  sow('lr_ciderbarrel', ['orchard'], 14); sow('pl_wildflower', ['orchard'], 80); sow('fa_scarecrow', ['orchard'], 5); sow('fa_pumpkin', ['orchard'], 5);
  m.put('lr_cairn', P.moorCairn[0], P.moorCairn[1], { scale: 2.4 }); m.ring('lr_menhir', P.moorCairn[0], P.moorCairn[1], 10, 9, { scale: 0.6 });
  m.put('pl_beacon', -168, -100); m.put('pl_balloon', -104, -168); m.put('lr_trilith', -150, -160, { rot: 0.7 });
  // ================================================================ the size ladder
  // Measured against the first map, rung by rung (0.65 m to 4.2 m in the inner ring, 1.4 m to 2.9 m in the outer):
  // these fill the rungs the scenes above left thin, so a ball always has something the next size up in view.
  for (const [biome, list] of Object.entries({
    downs: 'fa_bale 30|pl_mound 20|hb_foldchair 30|pl_rick 10|pl_wagon 6|fa_scarecrow 10|hb_bbq 8|fa_sunflower 30|be_deckchair 20|hb_carving 10|fa_corn 20',
    paddies: 'fa_trough 12|fa_coop 6|fa_plough 8|fa_corn 30|fa_pumpkin 8|fa_washline 6|lr_ciderbarrel 14|lr_shrine 4|fa_churn 20',
    wood: 'fo_logpile 20|fo_birdbox 14|fo_bunting 8|fo_sawpit 5|fo_hollow 8|fo_totem 16|lr_stonelantern 14|fo_mossrock 20|lr_shrine 4|lr_maple 40 0.3 0.5',
    hollows: 'cy_wheel 14|cy_deckchair 14|cy_cactus 20|cy_minecart 10|cy_signpost 12|cy_lemonade 6|cy_wagon 6|cy_tent 6|cy_rowboat 4|cy_totem 8|af_kiln 6|cy_bone 30|cy_skull 20',
    strand: 'be_deckchair 20|be_rod 12|be_telescope 8|be_parasol 14|be_cart 6|be_surfboard 10|be_rowboat 6|be_hut 4|be_bollard 20|be_ring 16|be_cooler 20',
    fen: 'ma_post 20|ma_frognet 12|ma_driftwood 14|ma_lantern 14|ma_pole 14|ma_rotlog 10|ma_mangrove 14|ma_punt 5|ma_statue 3|ma_trap 24|ma_cauldron 12',
    canes: 'lr_stonelantern 20|lr_bamboo 60 0.25 0.5|lr_shrine 5|af_towelrack 8|af_tub 8|af_lantern 40|af_sandal 40|af_grill 8|lr_drum 8|lr_bell 6|fo_logpile 10',
    orchard: 'lr_ciderbarrel 30|fa_ladder 14|fa_sledge 8|fa_coop 5|fa_trough 8|fa_bale 20|fa_churn 20|fa_washline 5|fa_scarecrow 8|fa_pumpkin 6',
    peak: 'su_tent 10|su_flagpole 10|tu_igloo 8|tu_sled 20|tu_dogsled 8|tu_fort 6|tu_snowman 20|tu_rack 12|tu_goal 6|su_avalanche 10',
    crags: 'mt_post 30|mt_gondola 6|mt_egg 14|mt_rock 30|su_cairn 10|lr_bell 10|lr_cairn 16',
    stones: 'ru_brazier 20|ru_shipcrate 14|ru_orb 10|ru_idol 12|ru_brokencol 14|ru_fallencol 8',
    kiln: 'af_grill 10|af_tub 10|af_trough 12|af_cactus 16|af_vent 14|af_pipe 12|af_kiln 8|af_wagon 6|ca_bomb 16|ca_egg 12|ca_instrument 8|ca_suit 8',
    tidepool: 'tp_anchor 10|tp_clam 14|tp_netrack 6|tp_slab 10|se_crate 16|se_barrel 14|tp_rope 16',
    ravine: 'go_orecart 14|go_geode 14|fo_logpile 14|fo_birdbox 10|fo_hollow 6|fo_mossrock 20|fo_totem 12',
    towerhill: 'lr_stonelantern 30|lr_bell 12|lr_drum 14|lr_shrine 8|lr_cairn 12|lr_maple 30 0.3 0.5',
    moor: 'lr_cairn 24|lr_menhir 20 0.3 0.5|mt_rock 30|pl_rick 10|fa_bale 20|pl_wagon 5|lr_shrine 4|lr_stonelantern 16',
  })) for (const entry of list.split('|')) { const [id, n, lo, hi] = entry.split(' '); sow(id, [biome], +n, lo ? { scale: [+lo, +hi] } : {}); }

  sow('lr_heather', ['moor'], 190); sow('lr_cairn', ['moor'], 16, { scale: [0.6, 1.2] }); sow('mt_rock', ['moor'], 40); sow('pl_mound', ['moor'], 30); sow('lr_menhir', ['moor'], 12, { scale: [0.4, 0.9] }); sow('pl_windsock', ['moor'], 6); sow('pl_kite', ['moor'], 5); sow('pl_wildflower', ['moor'], 70);
}
