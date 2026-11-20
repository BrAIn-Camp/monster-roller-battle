// THE EAST AND SOUTH-EAST: Cinder Flats (ashflats) -> Mount Kiln (caldera), Sunscar Canyon (canyon) -> Temple of Echoes (ruins).
// Each habitat is a set of little scenes (one function each, placed by hand at the bottom of the file) built from its own props.
// Sizes follow the ladder in BRIEF.md: the flats and the canyon feed a 0.9-3 m ball, the volcano and the temple a 3-10 m one,
// and the fang spires, colossus, obelisks and saguaro giants are the "next minute's prize" for the biggest balls.

const H = Math.PI / 2, PI = Math.PI, TAU = Math.PI * 2, DEG = Math.PI / 180;
const WOOD = 0x8a5a2b, DARKWOOD = 0x5e3d1e, CREAM = 0xf3ead7, IRON = 0x555b66, SOOT = 0x2a2624, GLOW = 0xff7a26, EMBER = 0xffb340;
const BONE = 0xefe6cf, GOLD = 0xf2c230, STONE = 0xd6c79c, STONE2 = 0xb9a97e, BRONZE = 0xc9892e, STEAM = 0xf4f6f8, TURQ = 0x7fe0d0, SAND = 0xe3c58a;

export const ITEMS = [
  // ---- Cinder Flats
  { id: 'af_charcoal', name: 'Glowing Charcoal', size: 0.12, shape: 'af_charcoal', colors: [0x2a2624, 0x353030] },
  { id: 'af_duck', name: 'Lava Duck', size: 0.16, shape: 'af_duck', colors: [0xffd23f, 0xff8a2a, 0xff6fa0] },
  { id: 'af_sandal', name: 'Bath Sandal', size: 0.24, shape: 'af_sandal', colors: [0xd9b77a, 0xb5332e, 0x3a8fb5] },
  { id: 'af_skewer', name: 'Kebab Skewer', size: 0.3, shape: 'af_skewer', colors: [0xb5332e, 0xd9482e], rad: 0.2 },
  { id: 'af_lantern', name: 'Lava Lamp', size: 0.45, shape: 'af_lantern', colors: [0xff7a26, 0xff4fa0, 0xa6f04a], rad: 0.28 },
  { id: 'af_shard', name: 'Obsidian Shard', size: 0.5, shape: 'af_shard', colors: [0x2a2433, 0x3b2f4a, 0x1f1f2b], rad: 0.3, mass: 0.7 },
  { id: 'af_anvil', name: 'Anvil', size: 0.8, shape: 'af_anvil', colors: [0x4a4f58], rad: 0.4 },
  { id: 'af_chilli', name: 'Chilli String', size: 0.9, shape: 'af_chilli', colors: [0xd9282e, 0xf2903a], rad: 0.2, mass: 0.4 },
  { id: 'af_grill', name: 'Barbecue Grill', size: 1.1, shape: 'af_grill', colors: [0x2a2a2e, 0xb5332e, 0x2f6f6a], rad: 0.35, mass: 0.5 },
  { id: 'af_geyser', name: 'Geyser Cone', size: 1.2, shape: 'af_geyser', colors: [0xd9cbb0, 0xc9b79a], rad: 0.42, mass: 0.8 },
  { id: 'af_towelrack', name: 'Towel Rack', size: 1.3, shape: 'af_towelrack', colors: [0xd9482e, 0x3ab5a5, 0xffd23f], rad: 0.3, mass: 0.4 },
  { id: 'af_tub', name: 'Hot Tub', size: 1.5, shape: 'af_tub', colors: [0x9a6a3a, 0xa87a48], rad: 0.4, mass: 0.7 },
  { id: 'af_trough', name: 'Cooling Trough', size: 1.6, shape: 'af_trough', colors: [0x7a5a3a], rad: 0.35, mass: 0.6 },
  { id: 'af_cactus', name: 'Singed Cactus', size: 1.6, shape: 'af_cactus', colors: [0x5c7a4a, 0x6b6a3a], rad: 0.2, mass: 0.6 },
  { id: 'af_vent', name: 'Steam Vent', size: 1.8, shape: 'af_vent', colors: [0x4a4440, 0x5a5450], rad: 0.28, mass: 0.7 },
  { id: 'af_pipe', name: 'Warped Pipe', size: 2.6, shape: 'af_pipe', colors: [0x8a5a3a, 0x6a6f78], rad: 0.3, mass: 0.5 },
  { id: 'af_kiln', name: 'Charcoal Kiln', size: 3, shape: 'af_kiln', colors: [0x9a6a4a, 0x8a5a44, 0x7a6a5a], rad: 0.45, mass: 0.6 },
  { id: 'af_wagon', name: 'Scorched Wagon', size: 3, shape: 'af_wagon', colors: [0x3a302a, 0x2e2a28], rad: 0.35, mass: 0.4 },
  { id: 'af_deadtree', name: 'Blackened Tree', size: 4.5, shape: 'af_deadtree', colors: [0x2a2624, 0x3a3230], rad: 0.12, mass: 0.3 },
  { id: 'af_pylon', name: 'Burnt Pylon Stump', size: 5, shape: 'af_pylon', colors: [0x3a3a40, 0x4a4038], rad: 0.3, mass: 0.2 },
  { id: 'af_teahouse', name: 'Tea House', size: 5.5, shape: 'af_teahouse', colors: [0xb5332e, 0x2f6f6a], rad: 0.4, mass: 0.12 },
  // ---- Mount Kiln
  { id: 'ca_bomb', name: 'Volcanic Bomb', size: 1, shape: 'ca_bomb', colors: [0x3a3230, 0x4a3a34, 0x2e2a2c], rad: 0.45 },
  { id: 'ca_egg', name: 'Fire-proof Egg', size: 1.2, shape: 'ca_egg', colors: [0x7a2e3a, 0x4a3a5a, 0x3a3a3a], rad: 0.36 },
  { id: 'ca_instrument', name: 'Seismograph', size: 1.5, shape: 'ca_instrument', colors: [0xf1c935, 0xe86a3a], rad: 0.25, mass: 0.3 },
  { id: 'ca_suit', name: 'Heat Suit on a Stand', size: 1.9, shape: 'ca_suit', colors: [0xc9ced6, 0xe0c060], rad: 0.25, mass: 0.5 },
  { id: 'ca_nest', name: 'Cinder Nest', size: 3.4, shape: 'ca_nest', colors: [0x3a3230], flat: true, mass: 0.3 },
  { id: 'ca_raft', name: 'Rock Raft', size: 3.5, shape: 'ca_raft', colors: [0x2e2a2c, 0x3a3230], rad: 0.4, mass: 0.4 },
  { id: 'ca_chimney', name: 'Lava-fall Chimney', size: 4.5, shape: 'ca_chimney', colors: [0x3a3432, 0x48413e], rad: 0.32, mass: 0.6 },
  { id: 'ca_basalt', name: 'Basalt Columns', size: 5, shape: 'ca_basalt', colors: [0x4a4a52, 0x3e4048], rad: 0.4, mass: 0.5 },
  { id: 'ca_arch', name: 'Obsidian Arch', size: 6, shape: 'ca_arch', colors: [0x2a2433, 0x3b2f4a], rad: 0.3, mass: 0.4 },
  { id: 'ca_gong', name: 'Great Bronze Gong', size: 9, shape: 'ca_gong', colors: [0xc9892e], rad: 0.25, mass: 0.25 },
  { id: 'ca_spire', name: 'Fang Spire', size: 11, shape: 'ca_spire', colors: [0x3a3432, 0x45393a], rad: 0.2, mass: 0.35 },
  // ---- Sunscar Canyon
  { id: 'cy_potcactus', name: 'Pot Cactus', size: 0.15, shape: 'cy_potcactus', colors: [0x5fa85a, 0x4f9650, 0x7ab86a] },
  { id: 'cy_teapot', name: 'Teapot', size: 0.2, shape: 'cy_teapot', colors: [0x3a8fb5, 0xf3ead7, 0xb5332e] },
  { id: 'cy_pan', name: 'Gold Pan', size: 0.35, shape: 'cy_pan', colors: [0x6a6f78] },
  { id: 'cy_basket', name: 'Basket', size: 0.4, shape: 'cy_basket', colors: [0xc9a05a, 0xb5803a, 0xd9b77a], rad: 0.42, mass: 0.5 },
  { id: 'cy_jar', name: 'Water Jar', size: 0.5, shape: 'cy_jar', colors: [0xc7673a, 0xb5803a, 0x3a8fb5], rad: 0.36, mass: 0.6 },
  { id: 'cy_saddlebag', name: 'Saddle Bags', size: 0.55, shape: 'cy_saddlebag', colors: [0x9a5a2e, 0xb5332e, 0x2f6f8a] },
  { id: 'cy_tumbleweed', name: 'Tumbleweed', size: 0.6, shape: 'cy_tumbleweed', colors: [0xc9a86a, 0xb5945a], rad: 0.45, mass: 0.3 },
  { id: 'cy_skull', name: 'Bleached Skull', size: 0.6, shape: 'cy_skull', colors: [BONE], rad: 0.4, mass: 0.7 },
  { id: 'cy_bone', name: 'Bleached Bone', size: 0.7, shape: 'cy_bone', colors: [BONE, 0xe6dcc0], rad: 0.3 },
  { id: 'cy_pick', name: 'Pickaxe', size: 0.9, shape: 'cy_pick', colors: [IRON], rad: 0.2, mass: 0.5 },
  { id: 'cy_wheel', name: 'Wagon Wheel', size: 1.1, shape: 'cy_wheel', colors: [WOOD, 0x9a6a3a], rad: 0.25, mass: 0.4 },
  { id: 'cy_deckchair', name: 'Deck Chair', size: 1.1, shape: 'cy_deckchair', colors: [0xd9482e, 0x3a8fb5, 0xffd23f], rad: 0.35, mass: 0.4 },
  { id: 'cy_cactus', name: 'Saguaro Cactus', size: 1.5, shape: 'cy_cactus', colors: [0x5fa85a, 0x4f9650, 0x6aa35c], rad: 0.2, mass: 0.5 },
  { id: 'cy_minecart', name: 'Mine Cart', size: 1.6, shape: 'cy_minecart', colors: [0x8a5a3a, 0x6a6f78], rad: 0.4, mass: 0.6 },
  { id: 'cy_rug', name: 'Caravan Rug', size: 1.8, shape: 'cy_rug', colors: [0xb5332e, 0x2f5f9a, 0x7a3f8a], flat: true, mass: 0.3 },
  { id: 'cy_signpost', name: 'Every-which-way Signpost', size: 2.2, shape: 'cy_signpost', colors: [0xd9482e, 0x3a8fb5, 0xffd23f], rad: 0.12, mass: 0.3 },
  { id: 'cy_lemonade', name: 'Mirage Lemonade Stand', size: 2.6, shape: 'cy_lemonade', colors: [0xffd23f, 0xffe06a], rad: 0.35, mass: 0.4 },
  { id: 'cy_wagon', name: 'Broken Wagon', size: 3, shape: 'cy_wagon', colors: [0x9a6a3a, 0x8a5a2b], rad: 0.35, mass: 0.4 },
  { id: 'cy_tent', name: 'Caravan Tent', size: 3.2, shape: 'cy_tent', colors: [0xb5332e, 0x2f5f9a, 0xe8902e], rad: 0.4, mass: 0.35 },
  { id: 'cy_rowboat', name: 'Half-buried Rowing Boat', size: 3.4, shape: 'cy_rowboat', colors: [0x3a8fb5, 0xd9482e, 0xf3ead7], rad: 0.35, mass: 0.4 },
  { id: 'cy_totem', name: 'Skull Totem', size: 3.5, shape: 'cy_totem', colors: [0xd9482e, 0x3a8fb5], rad: 0.12, mass: 0.3 },
  { id: 'cy_palm', name: 'Oasis Palm', size: 6, shape: 'cy_palm', colors: [0x4f9650, 0x5fa85a], rad: 0.1, mass: 0.25 },
  { id: 'cy_ribcage', name: 'Giant Ribcage', size: 8, shape: 'cy_ribcage', colors: [BONE], rad: 0.3, mass: 0.15 },
  // ---- Temple of Echoes
  { id: 'ru_shard', name: 'Labelled Pot Shard', size: 0.18, shape: 'ru_shard', colors: [0xc7673a, 0xb5803a, 0x3a8f8a] },
  { id: 'ru_brush', name: 'Dig Brush', size: 0.25, shape: 'ru_brush', colors: [WOOD] },
  { id: 'ru_sieve', name: 'Sieve', size: 0.5, shape: 'ru_sieve', colors: [WOOD], rad: 0.45, mass: 0.3 },
  { id: 'ru_urn', name: 'Temple Urn', size: 0.65, shape: 'ru_urn', colors: [0xc7673a, 0x3a8f8a, 0xd9b77a], rad: 0.38, mass: 0.7 },
  { id: 'ru_brazier', name: 'Brazier', size: 1.2, shape: 'ru_brazier', colors: [BRONZE], rad: 0.3, mass: 0.5 },
  { id: 'ru_shipcrate', name: 'Shipping Crate', size: 1.3, shape: 'ru_shipcrate', colors: [0xc9a05a, 0xb98a4a], rad: 0.45 },
  { id: 'ru_orb', name: 'Floating Crystal Orb', size: 1.8, shape: 'ru_orb', colors: [0x6fe0f0, 0xb07af0, 0xff8ad0], rad: 0.22, mass: 0.5 },
  { id: 'ru_idol', name: 'Golden Idol', size: 2, shape: 'ru_idol', colors: [GOLD], rad: 0.28 },
  { id: 'ru_stringsq', name: 'Dig Square', size: 2, shape: 'ru_stringsq', colors: [0xcbb98a], flat: true, mass: 0.1 },
  { id: 'ru_brokencol', name: 'Broken Column', size: 2.5, shape: 'ru_brokencol', colors: [STONE, 0xe0d6b4], rad: 0.4, mass: 0.7 },
  { id: 'ru_fallencol', name: 'Fallen Column', size: 3, shape: 'ru_fallencol', colors: [STONE, 0xe0d6b4], rad: 0.3, mass: 0.6 },
  { id: 'ru_sphinx', name: 'Guardian Sphinx', size: 4, shape: 'ru_sphinx', colors: [STONE, 0xcdbb8a], rad: 0.32, mass: 0.8 },
  { id: 'ru_head', name: 'Giant Stone Head', size: 4, shape: 'ru_head', colors: [0xc9bb94, 0xb9a97e], rad: 0.38, mass: 0.9 },
  { id: 'ru_column', name: 'Temple Column', size: 5, shape: 'ru_column', colors: [STONE, 0xe0d6b4], rad: 0.14, mass: 0.5 },
  { id: 'ru_sundial', name: 'Great Sundial', size: 5, shape: 'ru_sundial', colors: [0xe0d6b4], flat: true, mass: 0.3 },
  { id: 'ru_foot', name: 'Colossus Foot', size: 5, shape: 'ru_foot', colors: [0xc9bb94], rad: 0.35, mass: 0.7 },
  { id: 'ru_hand', name: 'Colossus Hand', size: 6, shape: 'ru_hand', colors: [0xc9bb94], rad: 0.3, mass: 0.6 },
  { id: 'ru_obelisk', name: 'Echo Obelisk', size: 8, shape: 'ru_obelisk', colors: [STONE, 0xe0d6b4], rad: 0.12, mass: 0.5 },
];

// ---- shared bits of shape
function saguaro(g, c, P, cap, flower) {
  P(g, 'cyl', c, [.13, .88, .13], [0, .44, 0]); P(g, 'sph', cap, [.13, .1, .13], [0, .88, 0]);
  P(g, 'cyl', c, [.075, .2, .075], [-.22, .45, 0], [0, 0, H]); P(g, 'cyl', c, [.075, .32, .075], [-.33, .58, 0]); P(g, 'sph', cap, [.075, .07, .075], [-.33, .74, 0]);
  P(g, 'cyl', c, [.075, .2, .075], [.22, .56, 0], [0, 0, H]); P(g, 'cyl', c, [.075, .24, .075], [.33, .65, 0]); P(g, 'sph', cap, [.075, .07, .075], [.33, .77, 0]);
  if (flower) P(g, 'sph', flower, [.06, .04, .06], [0, .97, 0]);
}
function wagon(g, c, P, canvas) {
  P(g, 'box', c, [.92, .16, .5], [0, .36, 0], [0, 0, .13]);
  P(g, 'cyl', canvas, [.25, .58, .25], [-.12, .6, 0], [0, 0, H + .13]);
  for (const [x, z] of [[-.3, .28], [-.3, -.28], [.3, -.28]]) { P(g, 'torus', DARKWOOD, [.2, .2, .2], [x, .2 + x * .1, z], [H, 0, 0]); P(g, 'cyl', DARKWOOD, [.05, .08, .05], [x, .2 + x * .1, z], [H, 0, 0]); }
  P(g, 'box', c, [.3, .05, .05], [.34, .2, .2], [0, .3, -.5]);
}

export const SHAPES = {
  // ================= Cinder Flats =================
  af_charcoal(g, c, P) { P(g, 'rock', c, [.45, .4, .45], [0, .4, 0]); P(g, 'sph', GLOW, [.2, .16, .2], [.2, .58, .2]); },
  af_duck(g, c, P) {
    P(g, 'sph', c, [.36, .28, .3], [0, .28, -.08]); P(g, 'sph', c, [.2, .2, .2], [0, .68, .16]);
    P(g, 'cone', 0xe8502a, [.09, .2, .09], [0, .64, .4], [H, 0, 0]); P(g, 'cone', c, [.12, .22, .12], [0, .46, -.4], [-.9, 0, 0]);
    P(g, 'sph', 0x222222, [.035, .035, .035], [.1, .76, .3]); P(g, 'sph', 0x222222, [.035, .035, .035], [-.1, .76, .3]);
  },
  af_sandal(g, c, P) { P(g, 'box', 0xcfa66a, [.42, .1, 1], [0, .05, 0]); P(g, 'box', c, [.46, .1, .14], [0, .16, .2]); P(g, 'box', c, [.08, .1, .3], [0, .16, .34]); },
  af_skewer(g, c, P) {
    P(g, 'cyl', 0xd9b77a, [.03, 1, .03], [0, .5, 0]);
    P(g, 'box', c, [.22, .15, .22], [0, .36, 0]); P(g, 'box', 0x6aa84a, [.2, .13, .2], [0, .52, 0], [0, .6, 0]); P(g, 'box', 0x8a4a2a, [.24, .15, .24], [0, .68, 0]); P(g, 'sph', 0xffd23f, [.1, .08, .1], [0, .82, 0]);
  },
  af_lantern(g, c, P) {
    P(g, 'cyl', IRON, [.26, .16, .26], [0, .08, 0]); P(g, 'sph', c, [.24, .36, .24], [0, .5, 0]); P(g, 'sph', EMBER, [.1, .12, .1], [.12, .42, .12]);
    P(g, 'cyl', IRON, [.12, .06, .12], [0, .84, 0]); P(g, 'cone', IRON, [.2, .14, .2], [0, .93, 0]);
  },
  af_shard(g, c, P) { P(g, 'pyr', c, [.2, .98, .2], [0, .49, 0], [0, .5, .06]); P(g, 'pyr', c, [.14, .6, .14], [.2, .28, .05], [0, .2, -.3]); P(g, 'pyr', 0x4a3f5e, [.12, .42, .12], [-.2, .2, -.05], [.2, 0, .35]); },
  af_anvil(g, c, P) {
    P(g, 'box', c, [.5, .2, .4], [-.08, .1, 0]); P(g, 'box', c, [.3, .3, .26], [-.08, .35, 0]); P(g, 'box', c, [.68, .22, .36], [-.14, .61, 0]);
    P(g, 'cone', c, [.11, .3, .11], [.35, .63, 0], [0, 0, -H]);
    P(g, 'box', 0x7a7f88, [.18, .11, .12], [-.3, .78, 0]); P(g, 'cyl', WOOD, [.025, .42, .025], [-.1, .78, 0], [0, 0, H]);
  },
  af_chilli(g, c, P) {
    P(g, 'box', WOOD, [.07, 1, .07], [0, .5, 0]); P(g, 'box', WOOD, [.62, .05, .05], [0, .95, 0]);
    for (const x of [-.24, .24]) for (const [y, k] of [[.78, c], [.58, 0xd9282e], [.38, c]]) P(g, 'cone', k, [.075, .2, .075], [x + (y === .58 ? .05 : 0), y, 0], [PI, 0, .3]);
  },
  af_grill(g, c, P) {
    for (const x of [-.3, .3]) for (const z of [-.16, .16]) P(g, 'cyl', IRON, [.03, .5, .03], [x, .25, z]);
    P(g, 'box', c, [.86, .22, .5], [0, .58, 0]); P(g, 'box', GLOW, [.76, .03, .4], [0, .7, 0]);
    P(g, 'box', c, [.86, .05, .46], [0, .88, -.3], [-1.1, 0, 0]);
    P(g, 'cyl', 0x8a4a2a, [.04, .32, .04], [-.18, .74, 0], [H, 0, 0]); P(g, 'cyl', 0x8a4a2a, [.04, .32, .04], [.02, .74, 0], [H, 0, 0]); P(g, 'cyl', 0xd9482e, [.04, .32, .04], [.22, .74, 0], [H, 0, 0]);
  },
  af_geyser(g, c, P) {
    P(g, 'cone', c, [.5, .5, .5], [0, .25, 0]); P(g, 'cyl', c, [.36, .16, .36], [0, .08, 0]); P(g, 'cyl', 0xefe6d6, [.17, .3, .17], [0, .3, 0]);
    P(g, 'cyl', TURQ, [.13, .03, .13], [0, .46, 0]); P(g, 'cyl', 0xcfeff4, [.05, .42, .05], [0, .68, 0]); P(g, 'sph', STEAM, [.13, .09, .13], [0, .91, 0]);
  },
  af_towelrack(g, c, P) {
    for (const x of [-.46, .46]) { P(g, 'box', WOOD, [.06, .9, .06], [x, .45, 0]); P(g, 'box', WOOD, [.06, .05, .4], [x, .025, 0]); }
    P(g, 'box', WOOD, [1, .05, .05], [0, .88, 0]);
    P(g, 'box', c, [.36, .6, .1], [-.2, .58, 0]); P(g, 'box', CREAM, [.3, .44, .1], [.2, .66, 0]); P(g, 'box', c, [.3, .08, .11], [.2, .56, 0]);
  },
  af_tub(g, c, P) {
    P(g, 'cyl', c, [.5, .55, .5], [0, .275, 0]); P(g, 'cyl', IRON, [.51, .06, .51], [0, .15, 0]); P(g, 'cyl', IRON, [.51, .06, .51], [0, .42, 0]);
    P(g, 'cyl', TURQ, [.44, .04, .44], [0, .55, 0]); P(g, 'sph', STEAM, [.15, .12, .15], [.1, .74, 0]); P(g, 'sph', STEAM, [.1, .09, .1], [-.1, .9, .08]);
  },
  af_trough(g, c, P) {
    P(g, 'box', c, [1, .3, .4], [0, .25, 0]); for (const x of [-.4, .4]) P(g, 'box', DARKWOOD, [.08, .1, .42], [x, .05, 0]);
    P(g, 'box', 0x6fc3ee, [.9, .02, .3], [0, .405, 0]); P(g, 'box', GLOW, [.05, .5, .1], [.2, .55, 0], [0, 0, .35]);
    P(g, 'sph', STEAM, [.12, .09, .12], [.05, .78, 0]); P(g, 'sph', STEAM, [.08, .07, .08], [.14, .93, .04]);
  },
  af_cactus(g, c, P) { saguaro(g, c, P, SOOT, null); P(g, 'sph', GLOW, [.04, .04, .04], [.06, .95, .06]); },
  af_vent(g, c, P) {
    P(g, 'cone', c, [.3, .9, .3], [0, .45, 0]); P(g, 'cyl', c, [.2, .5, .2], [0, .25, 0]); P(g, 'cyl', c, [.13, .62, .13], [0, .31, 0]);
    P(g, 'cyl', GLOW, [.11, .03, .11], [0, .63, 0]); P(g, 'sph', STEAM, [.2, .15, .2], [0, .76, 0]); P(g, 'sph', STEAM, [.13, .11, .13], [.07, .9, .04]);
  },
  af_pipe(g, c, P) {
    P(g, 'cyl', c, [.09, .46, .09], [-.26, .1, 0], [0, 0, H]); P(g, 'cyl', c, [.09, .4, .09], [.1, .22, 0], [0, 0, H - .65]); P(g, 'cyl', c, [.09, .36, .09], [.32, .5, 0], [0, 0, .25]);
    P(g, 'cyl', IRON, [.13, .05, .13], [-.47, .1, 0], [0, 0, H]); P(g, 'sph', c, [.1, .1, .1], [-.03, .1, 0]); P(g, 'sph', GLOW, [.085, .06, .085], [.28, .68, 0]);
  },
  af_kiln(g, c, P) {
    P(g, 'hemi', c, [.5, .62, .5], [0, 0, 0]); P(g, 'box', SOOT, [.22, .26, .08], [0, .13, .46]); P(g, 'box', GLOW, [.13, .15, .09], [0, .09, .465]);
    P(g, 'cyl', SOOT, [.1, .1, .1], [0, .62, 0]); P(g, 'sph', 0x8a8580, [.13, .1, .13], [.02, .78, 0]); P(g, 'sph', 0xa5a09a, [.09, .08, .09], [.08, .92, .03]);
  },
  af_wagon(g, c, P) { wagon(g, c, P, SOOT); P(g, 'sph', GLOW, [.06, .05, .06], [.2, .5, .1]); },
  af_deadtree(g, c, P) {
    P(g, 'cone', c, [.08, 1.2, .08], [0, .6, 0]); P(g, 'cyl', c, [.075, .3, .075], [0, .15, 0]);
    P(g, 'cyl', c, [.03, .42, .03], [.15, .7, 0], [0, 0, -.75]); P(g, 'cyl', c, [.03, .4, .03], [-.14, .58, 0], [0, 0, .85]);
    P(g, 'cyl', c, [.022, .26, .022], [-.27, .8, 0], [0, 0, .2]); P(g, 'cyl', c, [.022, .3, .022], [.05, .5, .12], [.9, 0, 0]);
    P(g, 'sph', GLOW, [.045, .06, .045], [0, .3, .06]);
  },
  af_pylon(g, c, P) {
    for (const [x, z] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]]) P(g, 'box', c, [.06, .72, .06], [x * .82, .35, z * .82], [z * .5, 0, -x * .5]);
    P(g, 'box', c, [.6, .04, .04], [0, .3, .27]); P(g, 'box', c, [.6, .04, .04], [0, .3, -.27]);
    P(g, 'box', c, [.38, .05, .38], [0, .68, 0]); P(g, 'box', c, [.05, .42, .05], [.14, .8, 0], [0, 0, -.9]);
    P(g, 'cyl', 0x1a1a1a, [.012, .5, .012], [.34, .56, .1], [0, 0, .25]); P(g, 'sph', GLOW, [.04, .04, .04], [.3, .9, 0]);
  },
  af_teahouse(g, c, P) {
    P(g, 'box', WOOD, [.92, .08, .82], [0, .04, 0]); P(g, 'box', CREAM, [.7, .38, .6], [0, .27, 0]);
    P(g, 'pyr', c, [.68, .26, .68], [0, .59, 0], [0, PI / 4, 0]); P(g, 'box', CREAM, [.3, .12, .3], [0, .72, 0]); P(g, 'pyr', c, [.36, .2, .36], [0, .88, 0], [0, PI / 4, 0]);
    P(g, 'box', DARKWOOD, [.2, .28, .03], [0, .22, .31]); P(g, 'sph', GLOW, [.05, .06, .05], [.26, .4, .34]); P(g, 'sph', GLOW, [.05, .06, .05], [-.26, .4, .34]);
  },

  // ================= Mount Kiln =================
  ca_bomb(g, c, P) { P(g, 'rock', c, [.5, .48, .5], [0, .48, 0]); P(g, 'cyl', GLOW, [.455, .03, .455], [0, .48, 0], [.5, 0, .3]); P(g, 'cyl', EMBER, [.45, .025, .45], [0, .48, 0], [-.4, 0, -1.1]); },
  ca_egg(g, c, P) { P(g, 'sph', c, [.36, .5, .36], [0, .5, 0]); P(g, 'sph', GLOW, [.09, .09, .05], [.12, .62, .31]); P(g, 'sph', EMBER, [.07, .07, .05], [-.16, .38, .3]); P(g, 'sph', GLOW, [.08, .08, .05], [.05, .78, -.27]); P(g, 'sph', EMBER, [.05, .07, .07], [.33, .4, -.05]); },
  ca_instrument(g, c, P) {
    P(g, 'cyl', IRON, [.02, .64, .02], [.2, .3, .12], [0, 0, .32]); P(g, 'cyl', IRON, [.02, .64, .02], [-.2, .3, .12], [0, 0, -.32]); P(g, 'cyl', IRON, [.02, .64, .02], [0, .3, -.2], [-.32, 0, 0]);
    P(g, 'box', c, [.32, .22, .24], [0, .68, 0]); P(g, 'box', 0x222222, [.2, .1, .02], [0, .7, .125]);
    P(g, 'cyl', IRON, [.012, .2, .012], [.1, .88, 0]); P(g, 'sph', 0xff3030, [.04, .04, .04], [.1, .97, 0]);
  },
  ca_suit(g, c, P) {
    P(g, 'cyl', IRON, [.26, .03, .26], [0, .015, 0]);
    for (const x of [-.1, .1]) P(g, 'box', c, [.15, .36, .17], [x, .2, 0]);
    P(g, 'box', c, [.42, .36, .25], [0, .54, 0]); for (const x of [-.27, .27]) P(g, 'box', c, [.11, .34, .15], [x, .53, 0]);
    P(g, 'sph', c, [.17, .17, .17], [0, .82, 0]); P(g, 'box', 0x3a2a14, [.22, .1, .06], [0, .83, .14]);
  },
  ca_nest(g, c, P) {
    P(g, 'torus', c, [.5, .45, .5], [0, .07, 0]); P(g, 'cyl', 0x5a5450, [.38, .04, .38], [0, .02, 0]);
    P(g, 'rock', 0x2a2624, [.1, .08, .1], [.42, .14, .1]); P(g, 'rock', 0x2a2624, [.09, .07, .09], [-.3, .14, .32]); P(g, 'sph', GLOW, [.06, .03, .06], [-.2, .05, -.1]);
  },
  ca_raft(g, c, P) { P(g, 'cyl', GLOW, [.5, .03, .42], [0, .015, 0]); P(g, 'rock', c, [.48, .13, .4], [0, .13, 0]); P(g, 'rock', c, [.2, .1, .2], [.14, .27, .05]); },
  ca_chimney(g, c, P) {
    P(g, 'cyl', c, [.3, .4, .3], [0, .2, 0]); P(g, 'cyl', c, [.24, .35, .24], [0, .57, 0]); P(g, 'cyl', c, [.18, .25, .18], [0, .87, 0]); P(g, 'cyl', GLOW, [.14, .03, .14], [0, .99, 0]);
    P(g, 'box', GLOW, [.1, .42, .04], [0, .21, .3]); P(g, 'box', EMBER, [.1, .37, .04], [0, .58, .24]); P(g, 'box', GLOW, [.1, .27, .04], [0, .87, .18]);
    P(g, 'cyl', GLOW, [.18, .02, .12], [0, .01, .37]);
  },
  ca_basalt(g, c, P) {
    const cols = [[0, 0, 1], [.22, .08, .8], [-.2, .1, .72], [.08, -.22, .6], [-.14, -.18, .86], [.31, -.14, .45], [-.35, -.05, .4], [.1, .28, .5]];
    cols.forEach(([x, z, h], i) => { P(g, 'cyl', i % 2 ? 0x55555e : c, [.125, h, .125], [x, h / 2, z]); });
    P(g, 'cyl', 0x6a6a74, [.11, .02, .11], [0, 1, 0]);
  },
  ca_arch(g, c, P) {
    P(g, 'box', c, [.2, .7, .25], [-.38, .35, 0], [0, 0, -.08]); P(g, 'box', c, [.2, .7, .25], [.38, .35, 0], [0, 0, .08]);
    P(g, 'box', c, [.92, .2, .25], [0, .75, 0], [0, 0, .05]); P(g, 'pyr', c, [.09, .2, .09], [-.2, .92, 0]); P(g, 'pyr', c, [.07, .14, .07], [.26, .92, 0]);
    P(g, 'box', GLOW, [.03, .5, .26], [.37, .3, 0], [0, 0, .08]);
  },
  ca_gong(g, c, P) {
    P(g, 'box', 0x9a948a, [1, .06, .4], [0, .03, 0]);
    for (const x of [-.42, .42]) P(g, 'box', 0xb5332e, [.08, .88, .08], [x, .5, 0]);
    P(g, 'box', 0xb5332e, [1, .08, .12], [0, .95, 0]); P(g, 'box', 0xb5332e, [.84, .05, .08], [0, .82, 0]);
    P(g, 'cyl', c, [.31, .05, .31], [0, .45, 0], [H, 0, 0]); P(g, 'cyl', 0xe0a94a, [.09, .08, .09], [0, .45, 0], [H, 0, 0]);
    P(g, 'cyl', WOOD, [.02, .42, .02], [.3, .26, .17], [0, 0, .3]); P(g, 'sph', 0xd9482e, [.06, .06, .06], [.24, .47, .17]);
  },
  ca_spire(g, c, P) {
    P(g, 'cone', c, [.2, .72, .2], [0, .36, 0]); P(g, 'cone', c, [.13, .62, .13], [.045, .69, 0], [0, 0, -.12]);
    P(g, 'cone', c, [.08, .3, .08], [-.13, .15, .08]); P(g, 'cyl', GLOW, [.185, .02, .185], [0, .1, 0]); P(g, 'cyl', EMBER, [.13, .015, .13], [0, .3, 0]);
  },

  // ================= Sunscar Canyon =================
  cy_potcactus(g, c, P) { P(g, 'cyl', 0xc7673a, [.3, .4, .3], [0, .2, 0]); P(g, 'cyl', 0xd9824a, [.34, .08, .34], [0, .4, 0]); P(g, 'sph', c, [.26, .3, .26], [0, .66, 0]); P(g, 'sph', 0xff6fa0, [.1, .07, .1], [0, .94, 0]); },
  cy_teapot(g, c, P) {
    P(g, 'sph', c, [.34, .3, .34], [0, .32, 0]); P(g, 'sph', c, [.14, .06, .14], [0, .62, 0]); P(g, 'sph', GOLD, [.05, .05, .05], [0, .7, 0]);
    P(g, 'cyl', c, [.05, .3, .05], [.38, .42, 0], [0, 0, -.8]); P(g, 'torus', c, [.15, .15, .15], [-.36, .34, 0], [H, 0, 0]);
  },
  cy_pan(g, c, P) { P(g, 'cyl', c, [.5, .14, .5], [0, .07, 0]); P(g, 'cyl', SAND, [.42, .02, .42], [0, .145, 0]); P(g, 'sph', GOLD, [.08, .05, .08], [.1, .17, .05]); P(g, 'sph', GOLD, [.05, .04, .05], [-.14, .17, -.1]); },
  cy_basket(g, c, P) {
    P(g, 'cyl', c, [.42, .55, .42], [0, .275, 0]); P(g, 'torus', DARKWOOD, [.46, .3, .46], [0, .55, 0]); P(g, 'cyl', DARKWOOD, [.43, .05, .43], [0, .2, 0]);
    P(g, 'cone', c, [.42, .24, .42], [0, .74, -.1], [-.35, 0, 0]); P(g, 'sph', DARKWOOD, [.07, .07, .07], [0, .88, -.15]);
  },
  cy_jar(g, c, P) {
    P(g, 'cyl', c, [.18, .06, .18], [0, .03, 0]); P(g, 'sph', c, [.36, .36, .36], [0, .4, 0]); P(g, 'cyl', c, [.16, .24, .16], [0, .8, 0]);
    P(g, 'cyl', c, [.22, .06, .22], [0, .93, 0]); P(g, 'cyl', 0x6fc3ee, [.15, .02, .15], [0, .965, 0]); P(g, 'cyl', CREAM, [.365, .05, .365], [0, .44, 0]);
  },
  cy_saddlebag(g, c, P) {
    for (const x of [-.33, .33]) { P(g, 'box', c, [.3, .5, .6], [x, .25, 0]); P(g, 'box', DARKWOOD, [.32, .18, .62], [x, .44, 0]); P(g, 'box', GOLD, [.33, .06, .08], [x, .36, 0]); }
    P(g, 'box', DARKWOOD, [.4, .1, .3], [0, .5, 0]); P(g, 'cyl', CREAM, [.12, .6, .12], [0, .67, 0], [H, 0, 0]);
  },
  cy_tumbleweed(g, c, P) { P(g, 'sph', c, [.44, .42, .44], [0, .48, 0]); P(g, 'torus', 0x9a7a44, [.49, .25, .49], [0, .49, 0], [.6, 0, .4]); P(g, 'torus', 0x9a7a44, [.49, .25, .49], [0, .49, 0], [-.5, 0, 1.2]); P(g, 'torus', 0x9a7a44, [.47, .25, .47], [0, .49, 0], [1.5, .3, 0]); },
  cy_skull(g, c, P) {
    P(g, 'sph', c, [.3, .28, .3], [0, .5, -.1]); P(g, 'box', c, [.34, .28, .36], [0, .22, .2]);
    for (const s of [-1, 1]) { P(g, 'sph', 0x2a2420, [.09, .1, .06], [s * .14, .5, .17]); P(g, 'cone', c, [.07, .4, .07], [s * .36, .68, -.1], [0, 0, -s * 1.1]); }
    P(g, 'box', 0x2a2420, [.1, .08, .04], [0, .28, .385]);
  },
  cy_bone(g, c, P) { P(g, 'cyl', c, [.08, .7, .08], [0, .14, 0], [0, 0, H]); for (const x of [-.37, .37]) for (const z of [-.07, .07]) P(g, 'sph', c, [.12, .12, .12], [x, .14, z]); },
  cy_pick(g, c, P) { P(g, 'cyl', WOOD, [.035, .95, .035], [0, .47, 0], [0, 0, .15]); P(g, 'box', c, [.72, .08, .08], [-.07, .9, 0], [0, 0, .15]); P(g, 'cone', c, [.05, .14, .05], [-.44, .83, 0], [0, 0, H + .5]); P(g, 'rock', 0xb98a5a, [.13, .08, .13], [.14, .06, .05]); },
  cy_wheel(g, c, P) {
    P(g, 'torus', c, [.5, .5, .5], [0, .5, 0], [H, 0, 0]); P(g, 'cyl', DARKWOOD, [.09, .14, .09], [0, .5, 0], [H, 0, 0]);
    for (const a of [0, PI / 3, 2 * PI / 3]) P(g, 'box', c, [.82, .05, .05], [0, .5, 0], [0, 0, a]);
  },
  cy_deckchair(g, c, P) {
    for (const x of [-.27, .27]) { P(g, 'box', WOOD, [.04, .92, .04], [x, .42, .02], [-.6, 0, 0]); P(g, 'box', WOOD, [.04, .62, .04], [x, .27, .1], [.6, 0, 0]); }
    P(g, 'box', c, [.5, .03, .78], [0, .42, 0], [-.62, 0, 0]); P(g, 'box', CREAM, [.16, .035, .79], [0, .42, 0], [-.62, 0, 0]);
  },
  cy_cactus(g, c, P) { saguaro(g, c, P, c, 0xff6fa0); },
  cy_minecart(g, c, P) {
    P(g, 'box', c, [.92, .45, .62], [0, .46, 0]); P(g, 'box', IRON, [1, .06, .68], [0, .7, 0]);
    P(g, 'rock', GOLD, [.2, .13, .2], [-.18, .78, 0]); P(g, 'rock', 0x8a867c, [.22, .15, .22], [.16, .78, .06]);
    for (const x of [-.27, .27]) for (const z of [-.31, .31]) P(g, 'cyl', 0x2a2a30, [.13, .06, .13], [x, .13, z], [H, 0, 0]);
  },
  cy_rug(g, c, P) {
    P(g, 'box', c, [.94, .03, .62], [0, .015, 0]); for (const x of [-.3, .3]) P(g, 'box', CREAM, [.1, .034, .64], [x, .017, 0]);
    P(g, 'box', GOLD, [.2, .036, .2], [0, .018, 0], [0, PI / 4, 0]); for (const x of [-.485, .485]) P(g, 'box', GOLD, [.03, .025, .62], [x, .013, 0]);
  },
  cy_signpost(g, c, P) {
    P(g, 'cyl', WOOD, [.04, 1, .04], [0, .5, 0]);
    P(g, 'box', c, [.5, .1, .03], [.2, .9, 0]); P(g, 'box', CREAM, [.46, .1, .03], [-.12, .76, .1], [0, .9, 0]);
    P(g, 'box', 0x6aa84a, [.5, .1, .03], [.06, .62, -.14], [0, -1.2, .1]); P(g, 'box', 0xe8902e, [.42, .1, .03], [-.12, .48, -.08], [0, 2.4, -.1]);
  },
  cy_lemonade(g, c, P) {
    P(g, 'box', c, [.9, .4, .4], [0, .2, 0]); P(g, 'box', CREAM, [.92, .06, .42], [0, .1, 0]);
    for (const x of [-.42, .42]) P(g, 'box', WOOD, [.05, .9, .05], [x, .45, -.15]);
    P(g, 'box', CREAM, [1, .22, .05], [0, .88, -.15]); P(g, 'box', 0x6fc3ee, [.8, .05, .06], [0, .9, -.15], [0, 0, .06]); P(g, 'box', 0x9fdcf0, [.6, .04, .06], [0, .83, -.15], [0, 0, -.05]);
    for (const x of [-.25, -.1]) P(g, 'sph', 0xffe030, [.07, .06, .07], [x, .46, .05]); P(g, 'cyl', 0xcfeff4, [.07, .17, .07], [.24, .485, .02]);
  },
  cy_wagon(g, c, P) { wagon(g, c, P, CREAM); },
  cy_tent(g, c, P) {
    P(g, 'pyr', c, [.68, .75, .68], [0, .375, 0], [0, PI / 4, 0]); P(g, 'pyr', CREAM, [.37, .41, .37], [0, .565, 0], [0, PI / 4, 0]);
    P(g, 'box', 0x3a2a20, [.2, .34, .02], [0, .17, .375], [-.57, 0, 0]); P(g, 'cyl', WOOD, [.02, .2, .02], [0, .85, 0]); P(g, 'box', GOLD, [.15, .08, .02], [.08, .93, 0]);
  },
  cy_rowboat(g, c, P) {
    P(g, 'sph', c, [.5, .2, .2], [0, .12, 0], [0, 0, .22]); P(g, 'sph', 0x5e3d1e, [.42, .15, .15], [.02, .2, 0], [0, 0, .22]);
    P(g, 'box', WOOD, [.07, .03, .3], [.12, .3, 0], [0, 0, .22]); P(g, 'hemi', SAND, [.36, .1, .34], [-.3, 0, 0]);
    P(g, 'cyl', WOOD, [.02, .6, .02], [.05, .3, .26], [0, 0, -.5]); P(g, 'box', WOOD, [.1, .16, .02], [.24, .6, .26], [0, 0, -.5]);
  },
  cy_totem(g, c, P) {
    P(g, 'cyl', WOOD, [.06, 1, .06], [0, .5, 0]); P(g, 'box', WOOD, [.62, .04, .04], [0, .72, 0]);
    for (const y of [.3, .56, .86]) { P(g, 'sph', BONE, [.16, .13, .16], [0, y, .03]); P(g, 'box', 0x2a2420, [.2, .04, .03], [0, y + .02, .175]); }
    for (const s of [-1, 1]) { P(g, 'cone', BONE, [.04, .24, .04], [s * .2, .93, .03], [0, 0, -s * 1]); P(g, 'box', c, [.05, .18, .02], [s * .28, .61, 0]); }
  },
  cy_palm(g, c, P) {
    P(g, 'cyl', 0x9a7a4a, [.04, .82, .04], [.03, .41, 0], [0, 0, -.07]);
    for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + .3; P(g, 'sph', c, [.23, .035, .09], [.06 + Math.cos(a) * .2, .83, Math.sin(a) * .2], [0, -a, -.4]); }
    P(g, 'sph', c, [.07, .07, .07], [.06, .88, 0]); P(g, 'sph', 0x6a4a2a, [.045, .045, .045], [.1, .79, .04]); P(g, 'sph', 0x6a4a2a, [.045, .045, .045], [.02, .79, -.04]);
  },
  cy_ribcage(g, c, P) {
    P(g, 'cyl', c, [.045, 1, .045], [0, .8, 0], [H, 0, 0]);
    for (const z of [-.39, -.13, .13, .39]) for (const s of [-1, 1]) {
      P(g, 'cyl', c, [.03, .5, .03], [s * .42, .25, z], [0, 0, s * .06]); P(g, 'cyl', c, [.03, .5, .03], [s * .22, .65, z], [0, 0, s * 1.0]);
    }
    P(g, 'sph', c, [.07, .07, .07], [0, .8, .47]); P(g, 'sph', c, [.07, .07, .07], [0, .8, -.47]);
  },

  // ================= Temple of Echoes =================
  ru_shard(g, c, P) { P(g, 'rock', c, [.42, .14, .32], [0, .14, .15], [0, .4, .2]); P(g, 'cyl', WOOD, [.03, .5, .03], [0, .25, -.3]); P(g, 'box', CREAM, [.4, .28, .04], [0, .62, -.3]); },
  ru_brush(g, c, P) { P(g, 'cyl', c, [.09, .55, .09], [0, .12, -.22], [H, 0, 0]); P(g, 'box', 0x8a8f98, [.3, .14, .12], [0, .12, .1]); P(g, 'box', CREAM, [.34, .16, .3], [0, .12, .33]); },
  ru_sieve(g, c, P) { P(g, 'torus', c, [.5, .9, .5], [0, .18, 0]); P(g, 'cyl', 0x9a9a9a, [.42, .02, .42], [0, .06, 0]); P(g, 'rock', 0xc7673a, [.14, .07, .12], [.1, .12, .05]); P(g, 'rock', SAND, [.16, .06, .16], [-.15, .1, -.1]); },
  ru_urn(g, c, P) {
    P(g, 'cyl', c, [.16, .08, .16], [0, .04, 0]); P(g, 'sph', c, [.34, .36, .34], [0, .42, 0]); P(g, 'cyl', c, [.15, .2, .15], [0, .8, 0]); P(g, 'cyl', c, [.22, .06, .22], [0, .93, 0]);
    P(g, 'cyl', GOLD, [.345, .06, .345], [0, .44, 0]); for (const s of [-1, 1]) P(g, 'torus', c, [.12, .12, .12], [s * .37, .62, 0], [H, 0, 0]);
  },
  ru_brazier(g, c, P) {
    P(g, 'cyl', c, [.24, .05, .24], [0, .025, 0]); P(g, 'cyl', c, [.05, .55, .05], [0, .3, 0]); P(g, 'hemi', c, [.36, .25, .36], [0, .8, 0], [PI, 0, 0]);
    P(g, 'cone', GLOW, [.24, .3, .24], [0, .93, 0]); P(g, 'cone', EMBER, [.13, .2, .13], [.04, .9, .06]);
  },
  ru_shipcrate(g, c, P) {
    P(g, 'box', c, [.94, .94, .94], [0, .47, 0]); P(g, 'box', DARKWOOD, [.98, .1, .98], [0, .18, 0]); P(g, 'box', DARKWOOD, [.98, .1, .98], [0, .76, 0]);
    P(g, 'box', 0xa82a2a, [.5, .26, .02], [0, .47, .475]); P(g, 'box', 0xa82a2a, [.02, .3, .1], [.475, .47, 0]); P(g, 'pyr', 0xa82a2a, [.02, .14, .12], [.478, .66, 0]);
  },
  ru_orb(g, c, P) {
    P(g, 'box', STONE2, [.42, .1, .42], [0, .05, 0]); P(g, 'cyl', STONE, [.14, .38, .14], [0, .29, 0]); P(g, 'cyl', STONE2, [.2, .05, .2], [0, .5, 0]);
    P(g, 'sph', c, [.2, .2, .2], [0, .77, 0]); P(g, 'torus', GOLD, [.3, .12, .3], [0, .77, 0], [.3, 0, .2]); P(g, 'sph', CREAM, [.06, .06, .06], [.08, .86, .12]);
  },
  ru_idol(g, c, P) {
    P(g, 'box', 0xc99a20, [.44, .1, .44], [0, .05, 0]); P(g, 'sph', c, [.25, .26, .24], [0, .36, 0]); P(g, 'box', c, [.62, .09, .12], [0, .48, 0]);
    P(g, 'sph', c, [.18, .18, .18], [0, .72, 0]); P(g, 'cone', c, [.13, .16, .13], [0, .92, 0]);
    for (const s of [-1, 1]) P(g, 'sph', 0xd9282e, [.04, .04, .04], [s * .07, .75, .16]); P(g, 'sph', 0xb07af0, [.045, .045, .045], [0, .83, .15]);
  },
  ru_stringsq(g, c, P) {
    P(g, 'box', c, [.94, .02, .94], [0, .01, 0]);
    for (const s of [-1, 1]) { P(g, 'box', CREAM, [1, .02, .02], [0, .08, s * .49]); P(g, 'box', CREAM, [.02, .02, 1], [s * .49, .08, 0]); }
    for (const x of [-.48, .48]) for (const z of [-.48, .48]) P(g, 'box', WOOD, [.04, .14, .04], [x, .07, z]);
  },
  ru_brokencol(g, c, P) {
    P(g, 'box', STONE2, [.48, .1, .48], [-.2, .05, 0]); P(g, 'cyl', c, [.2, .6, .2], [-.2, .4, 0]); P(g, 'rock', c, [.19, .14, .19], [-.18, .72, 0]);
    P(g, 'cyl', c, [.19, .34, .19], [.29, .19, .05], [H, .3, 0]); P(g, 'rock', STONE2, [.1, .07, .1], [.1, .07, -.3]);
  },
  ru_fallencol(g, c, P) {
    P(g, 'cyl', c, [.16, .3, .16], [-.33, .16, .02], [0, 0, H]); P(g, 'cyl', c, [.16, .3, .16], [0, .16, -.02], [0, .12, H]); P(g, 'cyl', c, [.16, .26, .16], [.3, .16, .04], [0, -.15, H]);
    P(g, 'box', STONE2, [.07, .4, .4], [.465, .2, .04]);
  },
  ru_sphinx(g, c, P) {
    P(g, 'box', c, [.36, .3, .7], [0, .2, -.14]); for (const x of [-.13, .13]) P(g, 'box', c, [.1, .12, .36], [x, .06, .32]);
    P(g, 'box', c, [.3, .36, .2], [0, .46, .18]); P(g, 'box', 0x3a6fb5, [.42, .32, .1], [0, .74, .1]); P(g, 'box', c, [.26, .26, .24], [0, .74, .2]);
    P(g, 'box', GOLD, [.44, .06, .12], [0, .92, .1]); P(g, 'sph', 0xb07af0, [.05, .05, .05], [0, .8, .33]);
  },
  ru_head(g, c, P) {
    P(g, 'box', c, [.62, .85, .66], [0, .36, 0], [0, 0, .18]); P(g, 'box', c, [.14, .3, .14], [.02, .42, .36], [0, 0, .18]); P(g, 'box', c, [.6, .1, .12], [-.03, .64, .33], [0, 0, .18]);
    for (const s of [-1, 1]) P(g, 'box', 0x4a4030, [.14, .07, .06], [s * .17 - .01, .53 + s * .03, .32], [0, 0, .18]);
    P(g, 'box', 0x4a4030, [.3, .06, .06], [.07, .2, .32], [0, 0, .18]); P(g, 'box', GOLD, [.66, .12, .7], [-.08, .8, 0], [0, 0, .18]);
  },
  ru_column(g, c, P) { P(g, 'box', STONE2, [.26, .06, .26], [0, .03, 0]); P(g, 'cyl', c, [.1, .84, .1], [0, .48, 0]); P(g, 'cyl', c, [.13, .04, .13], [0, .9, 0]); P(g, 'box', STONE2, [.28, .07, .28], [0, .955, 0]); P(g, 'cyl', 0xb07af0, [.105, .03, .105], [0, .5, 0]); },
  ru_sundial(g, c, P) {
    P(g, 'cyl', STONE2, [.5, .07, .5], [0, .035, 0]); P(g, 'cyl', c, [.43, .02, .43], [0, .08, 0]); P(g, 'pyr', BRONZE, [.03, .4, .3], [0, .29, -.05]);
    for (let k = 0; k < 6; k++) { const a = k * PI / 5 + PI; P(g, 'box', 0x6a5a3a, [.04, .02, .1], [Math.sin(a) * .38, .095, Math.cos(a) * .38], [0, a, 0]); }
  },
  ru_foot(g, c, P) {
    P(g, 'box', STONE2, [.42, .08, 1], [0, .04, 0]); P(g, 'box', c, [.34, .2, .7], [0, .18, .1]); P(g, 'cyl', c, [.17, .5, .17], [0, .35, -.28]); P(g, 'rock', c, [.17, .08, .17], [.02, .62, -.28]);
    for (let k = 0; k < 4; k++) P(g, 'sph', c, [.05, .06, .07], [-.13 + k * .087, .13, .45]); P(g, 'box', GOLD, [.36, .05, .08], [0, .29, .1]);
  },
  ru_hand(g, c, P) {
    P(g, 'cyl', c, [.2, .32, .16], [0, .16, 0]); P(g, 'box', c, [.5, .34, .2], [0, .46, 0]);
    [-.2, -.067, .067, .2].forEach((x, k) => P(g, 'box', c, [.1, .3 + (k === 1 || k === 2 ? .08 : 0), .14], [x, .78 + (k === 1 || k === 2 ? .04 : 0), .02], [.12 * k, 0, 0]));
    P(g, 'box', c, [.1, .3, .13], [.36, .5, .02], [0, 0, -.6]); P(g, 'torus', GOLD, [.22, .3, .18], [0, .27, 0]);
  },
  ru_obelisk(g, c, P) {
    P(g, 'box', STONE2, [.24, .07, .24], [0, .035, 0]); P(g, 'box', c, [.15, .82, .15], [0, .48, 0]); P(g, 'pyr', GOLD, [.11, .12, .11], [0, .94, 0], [0, PI / 4, 0]);
    P(g, 'box', 0xb07af0, [.155, .04, .155], [0, .5, 0]); P(g, 'box', 0x6fe0f0, [.155, .03, .155], [0, .7, 0]);
  },
};

// ===================== helpers =====================
const S = (m, id, x, z, size, rot = 0) => m.put(id, x, z, { scale: size / m.sizeOf(id), rot });      // one thing at a given size in metres
const spin = (m) => m.rand() * TAU;
const many = (m, id, list) => { for (const [x, z, size, rot] of list) S(m, id, x, z, size ?? m.sizeOf(id), rot ?? spin(m)); };
function pair(m, id, x, z, rot) { const dx = Math.cos(rot) * 0.16, dz = -Math.sin(rot) * 0.16; m.put(id, x - dx, z - dz, { rot }); m.put(id, x + dx, z + dz, { rot: rot + 0.15 }); }
// things along an arc round (cx, cz); angles in degrees (0 = east, 90 = south, 180 = west, 270 = north); sizes cycles through the list
function arc(m, id, cx, cz, r, d1, d2, n, sizes, face) {
  for (let i = 0; i < n; i++) { const a = (n > 1 ? d1 + (d2 - d1) * i / (n - 1) : d1) * DEG; S(m, id, cx + Math.cos(a) * r, cz + Math.sin(a) * r, sizes[i % sizes.length], face === undefined ? spin(m) : -a + H + face); }
}
function teaSet(m, x, z) { m.put('cy_teapot', x, z, { rot: spin(m) }); m.ring('cup', x, z, 0.42, 4); }

// ===================== CINDER FLATS =====================
function emberTrail(m) {                     // embers dropped along the road from the Green, then somebody's sandals, walked out of
  for (let i = 0; i < 10; i++) { const t = i / 9; m.put('af_charcoal', 57.5 + t * 14, -0.1 + t * 3.8 + (i % 2 ? 0.8 : -0.8), { rot: spin(m) }); }
  for (let i = 0; i < 6; i++) m.put('af_sandal', 73 + i * 1.5, 4.1 + i * 0.4 + (i % 2 ? 0.3 : -0.3), { rot: H + 0.25 });
  m.blob('af_shard', 60, 9, 4, 4, { scale: 0.4 }); m.blob('af_shard', 60, -9, 4, 4, { scale: 0.75 });
  many(m, 'af_shard', [[63, 12.5, 0.22], [64.4, 13.6, 0.32], [66.2, 14.6, 0.45], [68.4, 15.4, 0.65], [71, 16, 0.95]]);          // a first little stair of obsidian
}
function hotSprings(m) {                     // PLACES.hotSprings: four pools, tubs, towels, sandals in pairs, ducks, a tea house
  for (const [x, z, sz, duck] of [[84, -2.5, 1.5, 1], [100.5, 4, 1.5, 1], [90, 15.8, 1.5, 0], [76, 17, 1.5, 1], [104.5, 16.5, 2.55, 0]]) {
    S(m, 'af_tub', x, z, sz, spin(m)); pair(m, 'af_sandal', x - sz * 0.75, z + sz * 0.5, spin(m)); m.put('bucket', x + sz * 0.8, z + sz * 0.35);
    if (duck) m.put('af_duck', x + 0.2, z - sz * 0.72, { rot: spin(m) });
  }
  m.ring('af_duck', 88, 6, 3.2, 8); S(m, 'af_duck', 88, 6, 0.96, -H);                         // a ring of ducks round the big one
  S(m, 'af_duck', 97, 11, 1.9, 2.4);                                                          // ... and the duck nobody can lift (yet)
  many(m, 'af_duck', [[93, -6.2, 0.16, PI], [93, -7.2, 0.22, PI], [93, -8.5, 0.32, PI], [93, -10.2, 0.45, PI], [93, -12.5, 0.65, PI]]);   // a family marching off in size order
  for (let i = 0; i < 4; i++) m.put('af_towelrack', 78.5 + i * 2.7, -7.2 - i * 0.4, { rot: 0.1 });
  pair(m, 'af_sandal', 79, -6, 0.2); pair(m, 'af_sandal', 84.5, -6.4, -0.3);
  many(m, 'af_vent', [[75, -3.5, 1.8], [95.5, 20.5, 2.4], [109, 9, 1.4], [83, 21.5, 1.1], [72, 11, 1.8], [101, -15, 2.4]]);
  // the tea house: low tea on blankets, sandals left at the edge
  m.put('af_teahouse', 104, -4.5, { rot: -H }); m.put('af_lantern', 101.3, -2.6); m.put('af_lantern', 101.3, -6.4);
  m.put('blanket', 97.5, -6.5, { rot: 0.3 }); teaSet(m, 97.5, -6.5); pair(m, 'af_sandal', 96.3, -5.2, 1);
  m.put('blanket', 99.5, -10.5, { rot: -0.4 }); teaSet(m, 99.5, -10.5); pair(m, 'af_sandal', 98.4, -11.9, 2.4);
  m.put('bench', 104.5, -8.6, { rot: PI }); m.put('bench', 104.5, -0.3, { rot: 0 });
}
function cookOff(m) {                        // the pit-masters' cook-off: five grills in a row, the champion's giant grill behind, judges in front
  for (let i = 0; i < 5; i++) { const x = 62 + i * 4; m.put('af_grill', x, -24, { rot: 0 }); m.row('af_skewer', x - 0.5, -22.5, x + 0.5, -22.5, 3); }
  S(m, 'af_grill', 70, -30, 2.6, 0); S(m, 'af_skewer', 73, -30, 1.5); S(m, 'af_skewer', 67.2, -30, 0.9);
  m.put('table', 70, -17, { rot: 0 }); m.put('chair', 68.9, -15.6, { rot: PI }); m.put('chair', 71.1, -15.6, { rot: PI });
  m.row('burger', 67.5, -19.4, 72.5, -19.4, 6);
  m.row('af_chilli', 59, -26, 59, -19, 3, { rot: H }); m.row('af_chilli', 81, -26, 81, -19, 3, { rot: H });
  m.put('af_chilli', 65.5, -13.5); m.put('af_chilli', 74.5, -13.5); m.put('sign', 70, -12.2);
  m.put('barrel', 60.5, -28.5); m.put('barrel', 79.5, -28.5); m.put('crate', 81.5, -30); m.put('crate', 82.4, -29.1); m.put('crate', 81.9, -31.2);
  m.blob('af_charcoal', 70, -25, 4.5, 5);
  m.row('af_lantern', 66.5, -3, 69, -10.5, 4);                                                // lamps from the road to the cook-off
}
function charcoalCamp(m) {                   // kilns in rising size, the wood that goes in and the charcoal that comes out
  many(m, 'af_kiln', [[64, 24, 2, 0.3], [69, 25, 2.5, 0.2], [75, 26.5, 3, 0.1], [82.5, 28.5, 4, -0.2]]);
  for (const [x, z] of [[66, 30], [66, 30.9], [67.7, 30], [67.7, 30.9]]) m.put('log', x, z, { rot: H });
  m.put('log', 71.6, 33.4, { rot: 0.4 }); m.put('log', 72.6, 34.6, { rot: 0.5 });
  m.put('stump', 61, 28.8); m.put('stump', 62.6, 30.8); m.put('stump', 60, 31.6);
  m.put('tent', 78.5, 34, { rot: PI }); m.put('campfire', 74.5, 31.5); m.put('bucket', 76, 30.3); m.put('crate', 80.9, 32.2); m.put('crate', 81.6, 33.3);
  m.blob('af_charcoal', 72, 28.5, 7, 6);
  m.row('af_lantern', 68, 8.5, 66.5, 19.5, 4);
  // a second stand of kilns out by the volcano road
  many(m, 'af_kiln', [[104, -27, 3, 0.6], [108.5, -23.5, 2.2, 1.2], [110, -30.5, 3.6, 0.9]]);
  m.put('log', 106.5, -31, { rot: 0.2 }); m.put('log', 106.9, -32, { rot: 0.25 }); m.put('log', 101.5, -24.5, { rot: 1.1 });
  m.blob('af_charcoal', 106.5, -27, 4, 3);
}
function blackenedWoods(m) {
  many(m, 'af_deadtree', [[88, -29, 4.5], [91, -34, 3], [94, -29.5, 5.8], [97, -35, 4], [100, -30.5, 2.4], [89.5, -38, 5], [102, -36.5, 3.4],
    [101, 24, 4.5], [105, 27.5, 3], [109, 23.5, 5.8], [103, 31.5, 2.4], [108, 32.5, 4.5], [111.5, 28, 3.6], [105.5, 36.5, 5]]);
}
function geysers(m) { many(m, 'af_geyser', [[90, 30, 0.6], [93.5, 27.5, 0.85], [97, 30.5, 1.2], [93, 33.5, 1.7], [98.5, 35.5, 2.5], [101.5, 40.5, 3.6]]); m.blob('pebble', 95, 32, 6, 5, { scale: 2 }); }
function smithy(m) {                         // the smith who works the obsidian: forge shed, anvils (one far too big), cooling troughs
  m.put('shed', 115.5, 15, { rot: -H });
  many(m, 'af_anvil', [[111.2, 12, 0.8, 0.3], [111.6, 14.6, 0.8, -0.2], [110.6, 17.2, 0.8, 0.5], [112.3, 20.6, 2, 0.2]]);
  m.put('af_trough', 108.4, 12.6, { rot: H }); m.put('af_trough', 108.2, 16.2, { rot: H });
  m.put('barrel', 113.4, 11.2); m.put('crate', 114.6, 18.6); m.put('bucket', 109.6, 14.4); m.put('af_lantern', 113.2, 13.2); m.put('af_lantern', 113.2, 16.8);
  many(m, 'af_shard', [[110, 9.4, 0.5], [111, 8.8, 0.7], [112.2, 8.5, 0.95]]);
}
function obsidianStair(m) {                  // shards in rising sizes, leading from the springs to the volcano's door
  many(m, 'af_shard', [[84, -15, 0.22], [85.4, -15.4, 0.32], [87.2, -15.8, 0.45], [89.6, -16.2, 0.65], [92.6, -16.8, 0.95], [96.4, -17.6, 1.4],
    [105.5, -18.6, 2], [111.5, -19.6, 2.9], [117.5, -19, 4.2], [120.5, -8.5, 6], [119.5, 9.5, 4.2]]);
}
function lampAvenue(m) {                     // lava lamps in pairs, bigger and bigger, up to the foot of Mount Kiln
  [[108, 0.45], [111, 0.65], [114, 0.95], [117, 1.4], [120.5, 2.2]].forEach(([x, sz]) => { S(m, 'af_lantern', x, -2, sz, 0); S(m, 'af_lantern', x, 4.5, sz, 0); });
}
function ashBorders(m) {
  // north, against the Stormworks: burnt-out pylon stumps and pipes the heat has bent
  S(m, 'af_pylon', 80, -32, 5, 0.3); many(m, 'af_pipe', [[84.5, -31, 2.6, 0.4], [83.5, -35.5, 2.6, 2], [76.8, -30.2, 2.6, 4], [79.5, -27.4, 1.8, 1]]);
  S(m, 'af_pylon', 57.5, -22.5, 3, 1); many(m, 'af_pipe', [[54.5, -20.5, 1.8, 0.2], [61, -24, 2.6, 2.6]]); m.put('barrel', 55.5, -23.4); m.put('af_lantern', 59.4, -21);
  S(m, 'af_pylon', 102, -41.5, 4, 2); many(m, 'af_pipe', [[98, -41, 2.6, 1], [105.5, -42.5, 1.8, 3]]);
  // south, against the canyon: cacti with singed tops round a scorched wagon
  S(m, 'af_wagon', 80, 40, 3, 0.4); m.put('cy_wheel', 77.4, 38.2, { rot: 0.8 }); m.put('cy_wheel', 82.8, 42.4, { rot: 2 }); m.put('crate', 82.2, 37.8); m.put('crate', 83.2, 38.9);
  m.blob('af_charcoal', 80, 40, 3.5, 3);
  many(m, 'af_cactus', [[66, 33.5, 1.6], [69, 36, 0.95], [73, 38.5, 2.6], [63.8, 31.4, 0.65], [84.5, 43.2, 2], [76, 42, 1.3], [88, 45, 0.95]]);
  many(m, 'af_cactus', [[96, 46, 1.6], [99.5, 47.6, 0.8], [102.5, 45, 2.4]]); many(m, 'cy_bone', [[97.6, 44.4, 0.7], [98.6, 45.2, 0.5], [100.4, 44.2, 0.9]]); m.put('cy_skull', 99, 43.6, { rot: 1 });
}

// ===================== MOUNT KILN =====================
const CR = [186, 0];
const pc = (d, deg) => [CR[0] + Math.cos(deg * DEG) * d, CR[1] + Math.sin(deg * DEG) * d];
function craterRim(m) {                      // PLACES.crater: the ring of fangs on the rim, prize bombs by the lava, three rafts on it
  [14, 9, 12, 8, 13, 10, 13, 8.5, 11].forEach((sz, i) => { const [x, z] = pc(19, 180 + i * 40); S(m, 'ca_spire', x, z, sz, spin(m)); });
  for (const deg of [200, 280, 0, 120]) { const [x, z] = pc(16.2, deg); S(m, 'ca_bomb', x, z, 3.5); }
  { const [x, z] = pc(16.5, 240); S(m, 'ca_egg', x, z, 2); } { const [x, z] = pc(16.5, 60); S(m, 'ca_egg', x, z, 2); }
  S(m, 'ca_raft', 181.5, -5, 3.5, 0.4); S(m, 'ca_raft', 191, 2.5, 2.8, 2); S(m, 'ca_raft', 185, 7, 2.1, 4);
}
function nest(m, deg, sizes) {               // a cinder nest: eggs in the ring, a splash of little bombs round it
  const [x, z] = pc(30, deg); m.put('ca_nest', x, z);
  sizes.forEach((sz, i) => { const a = i * TAU / sizes.length + deg; S(m, 'ca_egg', x + Math.cos(a) * 0.9, z + Math.sin(a) * 0.9, sz, spin(m)); });
  arc(m, 'ca_bomb', x, z, 3.3, 0, 300, 6, [0.8, 1.15]);
}
function lair(m) {                           // whatever lays the eggs lives up here: three nests on the 7.5 m terrace and a horned skull
  nest(m, 205, [1, 1.45, 2]); nest(m, 300, [1.2, 1.7]); nest(m, 95, [1, 1.2, 1.7]);
  { const [x, z] = pc(30, 186); S(m, 'cy_skull', x, z, 3.6, -H); }
  [[250, 2.4], [340, 2.9], [30, 2.4], [140, 2.9]].forEach(([deg, sz]) => { const [x, z] = pc(30, deg); S(m, 'ca_bomb', x, z, sz); });
  { const [x, z] = pc(41, 203); S(m, 'ca_egg', x, z, 1); } { const [x, z] = pc(55, 206); S(m, 'ca_egg', x, z, 1.2); }      // two that rolled downhill
}
function terraces(m) {                       // arcs of bombs to sweep up along the 4.6 m terrace
  arc(m, 'ca_bomb', CR[0], CR[1], 41, 213, 273, 6, [1.65, 2.4]); arc(m, 'ca_bomb', CR[0], CR[1], 41, 105, 165, 6, [2.4, 1.65]);
  arc(m, 'ca_bomb', CR[0], CR[1], 41, 290, 310, 3, [1.65, 2.4]);
  arc(m, 'ca_bomb', CR[0], CR[1], 30, 50, 70, 3, [1.65, 2.4]); arc(m, 'ca_bomb', CR[0], CR[1], 30, 226, 238, 2, [1.65, 2.4]);
  arc(m, 'crate', CR[0], CR[1], 41, 172, 196, 4, [1.5]); { const [x, z] = pc(43.5, 184); S(m, 'ca_suit', x, z, 1.9, -H); }      // samples left on the second terrace, and a suit nobody went back for
  arc(m, 'ca_basalt', CR[0], CR[1], 57, 222, 238, 3, [2, 2.9, 2]); arc(m, 'ca_bomb', CR[0], CR[1], 54.5, 118, 132, 4, [1.15, 1.4]);
  arc(m, 'af_lantern', CR[0], CR[1], 54, 207, 189, 4, [0.9], 0); arc(m, 'ca_bomb', CR[0], CR[1], 54, 171, 153, 4, [0.8, 1.15]);
}
function gongShrine(m) {                     // the great gong, facing the hub from the first terrace, with braziers and offerings
  S(m, 'ca_gong', 134, 0, 9, -H);
  S(m, 'ru_brazier', 130.5, -4.5, 1.8); S(m, 'ru_brazier', 130.5, 4.5, 1.8);
  m.row('ca_bomb', 130.2, -2, 130.2, 2, 5, { scale: 0.8 });
}
function volcanoCamp(m) {                    // the volcanologists' base camp at the foot of the north-west slope
  m.put('tent', 124, -45.5, { rot: 0.6 }); m.put('tent', 131.5, -46.5, { rot: -0.3 });
  m.row('ca_suit', 122.5, -39.2, 130.5, -37.4, 5, { rot: PI + 0.2 });                         // suits on their stands, waiting for the morning
  S(m, 'ca_suit', 131, -33, 1.9, H); m.put('campfire', 132.6, -33);                            // ... and one "toasting marshmallows"
  many(m, 'ca_instrument', [[134.2, -41, 1.5, 0], [127.5, -34.2, 1.5, 1], [122.8, -33.2, 1.5, 2]]);
  many(m, 'crate', [[127, -49.8, 1.5, 0], [128.9, -50, 1.5, 0.2], [128, -48.1, 1.5, 0.5], [134.5, -50.5, 2.4, 0.3], [121.6, -48.6, 0.6, 0], [122.4, -49.2, 0.6, 1]]);
  S(m, 'barrel', 121, -42, 1.8); S(m, 'barrel', 119.8, -44.4, 1.8);
  m.put('table', 128, -42.2, { rot: 0.2 }); m.put('chair', 126.6, -41.8, { rot: -H }); m.put('chair', 129.4, -42.6, { rot: H }); m.ring('cup', 128, -40.6, 0.3, 3);
  many(m, 'af_deadtree', [[118.5, -37, 4.5], [117, -45, 3], [121, -30.5, 3.6]]);              // the last of the flats' burnt trees
  // an outpost on the south terrace
  S(m, 'ca_suit', 170, 50.5, 1.9, PI); S(m, 'ca_suit', 172, 50.2, 1.9, PI); S(m, 'ca_instrument', 174.5, 51, 1.5, 0); many(m, 'crate', [[168, 52.6, 1.5, 0.2], [169.6, 53.4, 1.5, 0.6]]);
}
function basaltOrgan(m) {                    // basalt columns like organ pipes, each cluster bigger than the last, along the Crags border
  many(m, 'ca_basalt', [[138, -55, 2, 0], [145.5, -58.5, 2.9, 1], [149.5, -64.5, 4.2, 2], [157.5, -70, 6, 3], [166, -76, 8.7, 4], [177, -81, 10, 5]]);
  many(m, 'ca_basalt', [[164.5, 52, 2.9, 1], [201, 54, 4.2, 2]]);
}
function bombField(m) {                      // the bomb ladder, and the big ones with the splash of small ones they threw up
  many(m, 'ca_bomb', [[142, -50.5, 0.8], [146, -53, 1.15], [150.5, -56.5, 1.65], [157, -60.5, 2.4], [165, -63.8, 3.5], [175, -66.8, 5], [186.5, -70.5, 6]]);
  S(m, 'ca_bomb', 167, -51, 3.5); arc(m, 'ca_bomb', 167, -51, 3.6, 20, 340, 6, [0.8, 1.15, 0.95]);
  S(m, 'ca_bomb', 186, -52.5, 4.2); arc(m, 'ca_bomb', 186, -52.5, 3.9, 0, 310, 7, [1.15, 1.4]);
  many(m, 'af_lantern', [[144, -49.4, 0.9], [148.6, -52.4, 0.9], [154, -56.6, 0.9], [161, -60, 0.9], [170, -63, 0.9]]);          // the expedition's lamps up the bomb stair
  m.blob('ca_bomb', 170, -72, 6, 6, { scale: 0.9 }); m.blob('ca_bomb', 184, -78, 5, 5, { scale: 1.2 });
  m.blob('ca_bomb', 196, -53, 4, 4, { scale: 1.3 }); m.blob('ca_bomb', 182, 53.5, 3.5, 5, { scale: 1 }); m.blob('ca_bomb', 194, 54, 3.5, 4, { scale: 1.4 });
  many(m, 'ca_chimney', [[157, -51.5, 4.5, 0.5], [176.5, -55, 6.3, 0], [190, -82, 7.2, 3.6], [203, -51, 3.2, 1], [143.9, 35.4, 3.2, 2], [147.1, -38.9, 4.5, 1]]);
  m.put('ca_nest', 205, 53); many(m, 'ca_egg', [[204.2, 52.5, 1.2], [205.8, 52.8, 1.45], [205, 54, 1]]); arc(m, 'ca_bomb', 205, 53, 3.2, 150, 330, 4, [0.8, 1.15]);   // a fourth nest, low down, perhaps a first attempt
  S(m, 'ca_arch', 191, -73.5, 8.4, 0.5);
  // the south-west pocket, the small way in: a bomb stair, a low arch, and bits of the temple that got this far
  many(m, 'ca_bomb', [[119, 23.5, 0.8], [121.5, 26, 1.15], [125.4, 24.6, 1.65]]); S(m, 'ca_arch', 123, 30.5, 4.2, 0.2);
  S(m, 'ru_brokencol', 119.2, 34.4, 2.5, 1); S(m, 'ru_urn', 122.6, 35, 0.95); S(m, 'ru_urn', 124, 35.6, 0.65);
  // the south terrace, against the temple sands
  S(m, 'ru_fallencol', 177.5, 54.5, 3, 0.4); S(m, 'ru_brazier', 180, 56.2, 1.2); S(m, 'ru_brazier', 175.2, 56.4, 1.2); S(m, 'ca_egg', 188, 54.5, 1.45);
}

// ===================== SUNSCAR CANYON =====================
function cactusNursery(m) {                  // pot cacti down the trail from the Green, and the stall they came from
  for (let i = 0; i < 6; i++) { const t = i / 5, x = 40.4 + t * 11, z = 39.9 + t * 14.6, k = 1 + t; m.put('cy_potcactus', x - 1.5, z + 1.1, { scale: k }); m.put('cy_potcactus', x + 1.5, z - 1.1, { scale: k }); }
  m.put('stall', 49.5, 40, { rot: 0 }); m.put('sign', 46.6, 40.6, { rot: 0.4 });
  [1, 1.5, 2.1, 3].forEach((k, i) => { for (let j = 0; j < 3; j++) m.put('cy_potcactus', 47.8 + i * 0.75, 42.8 + j * 0.6, { scale: k }); });
  S(m, 'cy_potcactus', 52.3, 42.4, 0.95);                                                     // the one that won a rosette
}
function oasis(m) {                          // PLACES.oasis: palms, a caravan resting (minus the camels), jars in size order by the water
  [[20, 6], [75, 5], [128, 6.6], [172, 4.8], [228, 6], [288, 7.2], [335, 5.4]].forEach(([deg, sz]) => S(m, 'cy_palm', 60 + Math.cos(deg * DEG) * 9.6, 64 + Math.sin(deg * DEG) * 9.2, sz, spin(m)));
  m.put('cy_tent', 63, 78.5, { rot: PI }); m.put('cy_tent', 69.5, 75, { rot: PI + 0.5 }); m.put('cy_tent', 55.5, 78, { rot: PI - 0.4 });
  m.put('cy_rug', 59, 74.6, { rot: 0.2 }); teaSet(m, 59, 74.6); m.put('cy_rug', 65.8, 73.6, { rot: -0.3 }); m.put('cy_saddlebag', 65.8, 73.6, { rot: 1 }); m.put('cy_rug', 62.3, 72.4, { rot: 1.4 });
  m.put('campfire', 62.4, 75.6);
  m.row('cy_saddlebag', 49.6, 70.4, 53.6, 75.2, 6, { rot: 0.7 }); m.put('bucket', 48.9, 69.4); m.put('bucket', 49.9, 69); m.put('sign', 54.6, 76.4, { rot: 0.7 });   // the camel queue, without the camels
  arc(m, 'cy_jar', 60, 64, 8.5, 196, 262, 7, [0.22, 0.32, 0.45, 0.65, 0.95, 1.3, 1.6]);
  m.put('lily', 58, 62.5); m.put('lily', 62, 66); m.put('lily', 61, 61.5);
}
function cactusAvenue(m) {                   // the cactus ladder: nine saguaros, 45 cm to 9 m, then three cactus gardens and two lone giants
  many(m, 'cy_cactus', [[40, 86, 0.45], [42.3, 85.6, 0.65], [45, 86.2, 0.95], [48.4, 85.7, 1.4], [52.6, 86.3, 2], [57.8, 85.6, 2.9], [64.2, 86.2, 4.2], [72, 85.6, 6], [81.5, 86.2, 9]]);
  for (const [x, z] of [[96, 71.5], [38, 55.5], [84, 50.6]]) {
    many(m, 'cy_cactus', [[x, z, 4.2], [x + 2.6, z + 1.2, 2.4], [x - 2, z + 2, 1.5]]);
    S(m, 'cy_potcactus', x + 0.6, z + 2.6, 0.32); S(m, 'cy_potcactus', x - 0.5, z - 2.2, 0.45); S(m, 'cy_potcactus', x + 2.2, z - 1.4, 0.65);
  }
  S(m, 'cy_cactus', 90, 79.5, 8, 1); S(m, 'cy_cactus', 37.5, 91.5, 9, 2);
}
function prospectors(m) {                    // the claim: carts on the track, picks where they were dropped, pans round the day's nuggets
  for (let i = 0; i < 3; i++) m.put('cy_minecart', 84 + i * 2.3, 56, { rot: 0 });
  many(m, 'cy_pick', [[91, 57, 0.9], [92.3, 58.6, 0.9], [83, 59.6, 0.9], [90.6, 63, 0.9], [85.4, 63.6, 0.9]]);
  m.ring('cy_pan', 88, 61, 1.3, 5); m.blob('coin', 88, 61, 0.8, 8, { scale: 2 });
  m.put('tent', 93.5, 63, { rot: -H }); m.put('crate', 82, 62); m.put('crate', 82.9, 63.1); m.put('barrel', 95.6, 59.4); m.put('campfire', 89.5, 65.2);
  m.put('af_lantern', 86.6, 58); m.put('af_lantern', 90.2, 59.6); m.put('sign', 86, 53.4, { rot: PI }); m.put('bucket', 86.4, 62.4); m.put('bucket', 89.9, 62.2);
  m.put('boulder', 90.5, 53.2); m.put('boulder', 93.2, 54.6); m.put('bigrock', 96.6, 55.6);
}
function boneyard(m) {                       // the giant ribcage (landmark), its skull, and a trail of bones to it
  S(m, 'cy_ribcage', 60.5, 100.5, 8, 0.4); S(m, 'cy_skull', 62.6, 95.6, 2.4, PI + 0.4);
  many(m, 'cy_bone', [[53, 95, 1.4], [66, 98, 1], [52.6, 101.4, 2], [64, 100.6, 0.7], [56, 104.6, 1], [61.5, 93.4, 1.4]]);
  many(m, 'cy_bone', [[55.6, 88.6, 0.4], [56.2, 90, 0.5], [56.6, 91.6, 0.7], [57.2, 93.2, 0.95]]);
  many(m, 'cy_skull', [[50.8, 97.6, 0.6], [65.6, 103.2, 0.6], [54.4, 106, 0.9]]);
}
function wagonRuts(m) {                      // a wagon that lost a wheel; the wheel got further than the wagon did
  S(m, 'cy_wagon', 42, 100, 3, 0.5); many(m, 'cy_wheel', [[44.6, 98.2, 1.1, 0.5], [47.6, 96.6, 1.1, 0.6], [50.4, 95.6, 1.1, 0.4]]);
  m.put('crate', 39.8, 101.6); m.put('crate', 40.4, 102.7); m.put('crate', 43.4, 102.6); m.put('barrel', 44.6, 101.4); m.put('barrel', 39.6, 98.4); S(m, 'cy_jar', 41.4, 97.4, 0.65);
}
function tumbleweeds(m) {
  m.scatter('cy_tumbleweed', 22, 52, 38, 60, 5); m.scatter('cy_tumbleweed', 36, 103, 60, 108, 4); m.scatter('cy_tumbleweed', 78, 66, 92, 71, 4);
  S(m, 'cy_tumbleweed', 26.5, 64.5, 1.2); S(m, 'cy_tumbleweed', 52, 108.5, 1.2); S(m, 'cy_tumbleweed', 101.5, 69, 2);
}
function signposts(m) {
  m.put('cy_signpost', 43, 49, { rot: 0.5 });
  m.put('cy_signpost', 70, 80, { rot: 0 }); m.put('cy_signpost', 71.3, 81.5, { rot: 2 }); m.put('cy_signpost', 68.7, 81.7, { rot: 4 }); m.put('sign', 70, 82.6, { rot: 0 });   // a crossroads with too many opinions
  m.put('cy_signpost', 76, 93.4, { rot: 1 });
}
function basketSeller(m) {                   // baskets in size order; the biggest has its lid ajar and nothing in it. Probably.
  m.put('stall', 82, 74.6, { rot: 0 }); m.put('cy_rug', 82, 78.2, { rot: 0 });
  [0.22, 0.32, 0.46, 0.66].forEach((sz, i) => { S(m, 'cy_basket', 80.2 + i * 1.2, 77.7, sz, 0); S(m, 'cy_basket', 80.2 + i * 1.2, 78.8, sz, 0.5); });
  S(m, 'cy_basket', 85.8, 77.2, 1.2, 0.3); S(m, 'cy_basket', 78, 76.6, 2, -0.4);
}
function skullTotems(m) {                    // totems mark the passes up to the temple
  many(m, 'cy_totem', [[103.6, 58.4, 3.5, -H], [102.6, 66.4, 4.2, -H], [72.5, 96.8, 2.8, 2.4], [77.4, 91.2, 3.5, 2.4], [88.6, 83, 5, -0.8]]);
  m.row('cy_skull', 102, 60.2, 101.4, 64.6, 4, { rot: -H }); m.row('cy_skull', 73.6, 95.6, 76.2, 92.6, 4, { rot: 2.4 });
}
function canyonBorders(m) {
  // south-west, against the beach: a rowing boat a long way from the water, deck chairs in the dunes, a lemonade stand that may not be there
  S(m, 'cy_rowboat', 27.5, 57, 3.4, 0.7); S(m, 'cy_rowboat', 25.5, 61.2, 1.7, 2.2);
  many(m, 'cy_deckchair', [[32, 84, 1.1, -H], [33.6, 85.6, 1.1, -H + 0.2], [35.4, 84.2, 1.1, -H - 0.2], [37, 86, 1.1, -H]]);
  m.put('blanket', 34.5, 88.2, { rot: 0.3 }); m.row('cup', 33.6, 87, 36.2, 87.4, 4);
  m.put('cy_lemonade', 38, 104.5, { rot: -H }); m.row('cup', 36.6, 103.2, 36.6, 105.8, 6); S(m, 'cy_jar', 38.4, 102.2, 0.5); S(m, 'cy_jar', 38.6, 106.8, 0.65); m.put('cy_signpost', 34.6, 101.6, { rot: 3 });
  // north, against the flats: soot and obsidian blown in among the cacti
  many(m, 'af_shard', [[50.5, 30.6, 0.32], [52, 31.6, 0.5], [54, 32, 0.8]]); S(m, 'af_cactus', 48.4, 30.2, 1.1); S(m, 'cy_cactus', 46, 32.4, 0.95); m.put('af_lantern', 51.4, 33.2); m.blob('af_charcoal', 50, 31.5, 2.5, 4);
  // east, against the temple: a broken column in the sand and crates waiting for a wagon
  S(m, 'ru_brokencol', 93, 77.6, 2.5, 1); many(m, 'ru_shipcrate', [[92, 74.2, 1.3, 0.2], [93.5, 74.8, 1.3, 0.5], [92.6, 75.6, 0.65, 0]]); S(m, 'ru_urn', 95, 76.4, 0.65);
}

// ===================== TEMPLE OF ECHOES =====================
const TP = [133, 133];
function avenue(m) {                         // columns (whole, broken, fallen) rising toward the ramp, sphinxes in pairs, urns down the middle
  const W = [['ru_column', 3], ['ru_brokencol', 2.5], ['ru_column', 5], ['ru_fallencol', 3], ['ru_column', 7], ['ru_column', 9]];
  const E = [['ru_column', 3], ['ru_column', 4], ['ru_brokencol', 3.5], ['ru_column', 5], ['ru_fallencol', 4], ['ru_column', 9]];
  for (let i = 0; i < 6; i++) { const z = 56 + i * 6; S(m, W[i][0], 125, z, W[i][1], W[i][0] === 'ru_fallencol' ? 1.3 : 0); S(m, E[i][0], 141, z, E[i][1], E[i][0] === 'ru_fallencol' ? 1.8 : 0); }
  S(m, 'ru_sphinx', 126, 50, 4, PI); S(m, 'ru_sphinx', 140, 50, 4, PI); S(m, 'ru_sphinx', 124.5, 93.5, 6, PI); S(m, 'ru_sphinx', 141.5, 93.5, 6, PI);
  [0.65, 0.65, 0.78, 0.78, 0.95, 0.95, 1.2, 1.43].forEach((sz, i) => S(m, 'ru_urn', 133, 54 + i * 4.4, sz));
  many(m, 'ru_urn', [[110, 64.5, 0.78], [113, 63.4, 0.78], [116, 62.4, 0.78], [119, 61.4, 0.78], [122, 60.6, 0.78]]);         // the way in from the canyon
}
function obelisks(m) { S(m, 'ru_obelisk', 126, 106.5, 6); S(m, 'ru_obelisk', 140, 106.5, 6); S(m, 'ru_obelisk', 192, 74, 12.8); S(m, 'ru_obelisk', 70, 127, 8.8); S(m, 'ru_obelisk', 173, 112, 8); }
function digSite(m) {                        // a grid of string squares, a find (labelled) in most of them, tools, tea, and crates stencilled for shipping
  m.grid('ru_stringsq', 153, 80, 4, 3, 2.2, 2.2);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { if ((i + j * 2) % 5 === 4) continue; m.put('ru_shard', 153 + i * 2.2 + (m.rand() - 0.5), 80 + j * 2.2 + (m.rand() - 0.5), { rot: spin(m) }); }
  m.put('boot', 157.6, 84.6, { rot: 1 }); m.put('teddy', 159.8, 80.2, { rot: 2 });            // not every find is ancient
  many(m, 'ru_brush', [[153.6, 81, 0.25], [156, 82.6, 0.25], [158, 79.6, 0.25], [160.2, 83.4, 0.25], [154.8, 85, 0.25]]);
  many(m, 'ru_sieve', [[162.6, 80.8, 0.5], [163.4, 82.8, 0.5], [162.4, 84.8, 0.5]]); m.put('bucket', 151.6, 82); m.put('bucket', 151.4, 83.4);
  m.put('table', 164.2, 88.6, { rot: 0.3 }); m.put('chair', 162.8, 88.2, { rot: -H }); m.put('chair', 165.6, 89, { rot: H }); m.put('blanket', 161, 90.6, { rot: 0.2 }); teaSet(m, 161, 90.6);
  many(m, 'ru_shipcrate', [[150, 88, 1.3, 0], [151.6, 88.1, 1.3, 0.1], [150.8, 89.6, 1.3, 0.4], [148, 84.4, 2.1, 0.2], [147.4, 80.2, 2.6, 0], [154.6, 88.2, 0.65, 0.3]]);
  m.put('cart', 154.5, 91, { rot: 0.4 }); m.put('tent', 167, 79, { rot: -H }); m.put('sign', 151.4, 78.2, { rot: PI }); m.put('sign', 164.4, 85, { rot: H });
  S(m, 'ru_head', 157, 76, 2, 0.2);                                                           // the one they are still digging out
}
function stoneHeads(m) { S(m, 'ru_head', 168, 70, 3, 0.4); S(m, 'ru_head', 175, 72.5, 4, 0); S(m, 'ru_head', 183.5, 70, 6, -0.4); }
function colossus(m) {                       // the toppled colossus (landmark): a 9 m head, a 6 m hand reaching out of the sand, a 5 m foot
  S(m, 'ru_head', 84, 128, 9, 0.6); S(m, 'ru_hand', 72, 139, 6, 0.3); S(m, 'ru_foot', 91, 144, 5, 1.1);
  S(m, 'ru_brokencol', 78, 147, 2.5, 0); S(m, 'ru_brokencol', 65.5, 131.5, 3.5, 2); S(m, 'ru_brokencol', 96, 134, 2.5, 4);
  S(m, 'ru_fallencol', 76, 132, 3, 0.8); S(m, 'ru_fallencol', 83.5, 139.5, 4, 2.2);
  many(m, 'ru_urn', [[100.5, 121, 0.65], [98.6, 122.6, 0.78], [96.6, 124.2, 0.95], [94.4, 125.8, 1.2], [92, 127.4, 1.43]]);
}
function sundialPlaza(m) {                   // the sundial, twelve urns for the hours, six orbs humming round it
  m.put('ru_sundial', 108, 87, { rot: 0 }); m.ring('ru_urn', 108, 87, 4.6, 12); m.ring('ru_orb', 108, 87, 8.6, 6);
  m.put('bench', 101.4, 91.6, { rot: 0.8 }); m.put('bench', 114.6, 91.6, { rot: -0.8 });
  many(m, 'ru_brazier', [[119, 85, 1.2], [122, 84, 1.2]]);
}
function ziggurat(m) {                       // PLACES.temple: every tier lined with urns and braziers one rung bigger than the tier below
  const [tx, tz] = TP, U = (dx, dz, sz) => S(m, 'ru_urn', tx + dx, tz + dz, sz), Bz = (dx, dz, sz) => S(m, 'ru_brazier', tx + dx, tz + dz, sz), O = (dx, dz, sz) => S(m, 'ru_orb', tx + dx, tz + dz, sz);
  // tier 1 (1.75 m): 65 cm urns, 1.2 m braziers
  for (let i = 0; i < 6; i++) { U(-25 + i * 2.8, -26.5, 0.65); U(11 + i * 2.8, -26.5, 0.65); }
  for (const dz of [-19, -11, -3, 5, 13]) U(-26.5, dz, 0.95); for (const dz of [-19, -11, -3]) U(26.5, dz, 0.95);
  for (const dx of [-23, -15, -7, 1]) U(dx, 26.5, 0.95);
  Bz(-26.5, -26.5, 1.2); Bz(26.5, -26.5, 1.2); Bz(-26.5, 26.5, 1.2);
  // tier 2 (2.65 m): 1.4 m urns, 1.8 m braziers, an orb each side
  for (const dx of [-18, -12, -6, 6, 12, 18]) U(dx, -19.5, 1.43);
  U(-19.5, -10, 1.43); U(-19.5, 10, 1.43); U(19.5, -10, 1.43); U(19.5, 8, 1.43); for (const dx of [-14, -4, 6]) U(dx, 19.5, 1.43);
  Bz(-19.5, -19.5, 1.8); Bz(19.5, -19.5, 1.8); Bz(-19.5, 19.5, 1.8); O(-19.5, 0, 1.8); O(19.5, 0, 1.8);
  // tier 3 (3.85 m): 2.1 m urns, 2.2 m braziers, orbs on the corners
  U(-10, -12.5, 2.1); U(10, -12.5, 2.1); Bz(-4.5, -12.5, 2.2); Bz(4.5, -12.5, 2.2); U(-12.5, 0, 2.1); U(12.5, 0, 2.1); Bz(0, 12.5, 2.2);
  O(-12.5, -12.5, 2.3); O(12.5, -12.5, 2.3); O(-12.5, 12.5, 2.3); O(12.5, 12.5, 2.3);
  // the treasure room on top (5.45 m): the golden idol, big urns, bigger braziers, coins
  m.put('ru_idol', tx, tz, { rot: PI });
  U(0, -6.5, 2.1); U(0, 6.5, 2.1); U(-6.5, 0, 2.1); U(6.5, 0, 2.1); Bz(-6.8, -6.8, 2.9); Bz(6.8, -6.8, 2.9); Bz(-6.8, 6.8, 2.9); Bz(6.8, 6.8, 2.9);
  m.ring('coin', tx, tz, 1.6, 8, { scale: 6 }); m.blob('coin', tx, tz, 5.5, 22, { scale: 4 });
}
function templeBorders(m) {
  // against the canyon: cacti through the paving, tumbleweeds caught on a fallen column
  S(m, 'ru_fallencol', 110, 70, 3, 0.3); S(m, 'ru_brokencol', 113.6, 68, 2.5, 2); S(m, 'cy_cactus', 112.6, 72.4, 2.4); S(m, 'cy_cactus', 108, 72.6, 1.2); S(m, 'cy_tumbleweed', 110.6, 71.4, 0.6); S(m, 'cy_tumbleweed', 109.2, 68.6, 0.9);
  S(m, 'cy_cactus', 90, 101, 2.9); S(m, 'ru_brokencol', 93, 103.4, 2.5, 3); S(m, 'ru_fallencol', 88.4, 105, 3, 1.2); m.put('cy_skull', 91.4, 99.2, { rot: 1 }); m.put('cy_skull', 86.8, 102.4, { rot: 2 });
  // against Mount Kiln: a volcanic bomb through the colonnade, obsidian among the urns
  S(m, 'ca_bomb', 138, 44, 3, 0); S(m, 'ru_brokencol', 134.2, 42.6, 2.5, 0.5); S(m, 'ru_brokencol', 141.8, 46.6, 3.5, 3); S(m, 'ru_fallencol', 136, 47.6, 3, 0.2);
  many(m, 'ca_bomb', [[140.6, 42.4, 0.8], [135.6, 45.2, 0.8], [139.4, 47.2, 1.15]]);
  S(m, 'af_shard', 158, 57, 2, 0); many(m, 'ca_bomb', [[155.4, 56.4, 1.65], [160.4, 59, 1.15]]); S(m, 'ru_urn', 157, 59.6, 0.95); S(m, 'ru_urn', 159.2, 55.2, 0.95);
  // against the tide pools: a canoe moored to a column, the archaeologists' day off
  m.put('canoe', 42.5, 126, { rot: 0.3 }); S(m, 'ru_column', 45, 128.6, 2.5); m.put('cy_deckchair', 46.2, 124.4, { rot: -H }); S(m, 'ru_urn', 44.4, 123, 0.65); S(m, 'ru_urn', 47.6, 127.2, 0.95); m.put('sign', 46.8, 130.2, { rot: -H });
}

export function dress(m) {
  // Cinder Flats (east, inner)
  hotSprings(m); cookOff(m); charcoalCamp(m); smithy(m); blackenedWoods(m); geysers(m); obsidianStair(m); lampAvenue(m); ashBorders(m); emberTrail(m);
  // Mount Kiln (east, outer)
  craterRim(m); lair(m); terraces(m); gongShrine(m); volcanoCamp(m); basaltOrgan(m); bombField(m);
  // Sunscar Canyon (south-east, inner)
  oasis(m); cactusNursery(m); cactusAvenue(m); prospectors(m); boneyard(m); wagonRuts(m); signposts(m); basketSeller(m); skullTotems(m); canyonBorders(m); tumbleweeds(m);
  // Temple of Echoes (south-east, outer)
  avenue(m); obelisks(m); digSite(m); stoneHeads(m); colossus(m); sundialPlaza(m); ziggurat(m); templeBorders(m);
}
