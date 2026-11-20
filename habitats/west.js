// THE WEST: Whisperwood (forest), Echo Gorge (gorge), Honeyfield Farms (farm) and Windmill Prairie (plain).
// Each habitat is a list of little scenes placed by hand; every scene is a function call below, so moving one is a one-line edit.
// Ball sizes to expect: forest and farm 0.9 -> 3 m, gorge floor 1.5 -> 4 m, the gorge plateaus and the prairie 3 -> 10 m.

const WOOD = 0x8a5a2b, DARK = 0x5e3d1e, CREAM = 0xf3ead7, IRON = 0x555b66, STEEL = 0xc8ccd4, LEAF = 0x4c9e4a, STRAW = 0xe8c95a;
const STONE = 0x9a968c, ROPE = 0xc9a35a, GOLD = 0xf1c935, RED = 0xd9415f, BLUE = 0x4a9be8, WATER = 0x6fc3ee, BLACK = 0x2a1c10, WHITE = 0xffffff;

export const ITEMS = [
  // ---- Whisperwood
  { id: 'fo_elder',      name: 'Elder Tree',        size: 14,   shape: 'fo_elder',      colors: [0x2f8f6a, 0x3b9a7a, 0x4f8f4a], rad: 0.12, mass: 0.05 },
  { id: 'fo_treehouse',  name: 'Treehouse',         size: 9,    shape: 'fo_treehouse',  colors: [0xc9a35a, 0xd9b77a], rad: 0.2, mass: 0.08 },
  { id: 'fo_toadstool',  name: 'Fairy Toadstool',   size: 0.3,  shape: 'fo_toadstool',  colors: [0xd9415f, 0xe8573a, 0xb86ae6], rad: 0.3 },
  { id: 'fo_acorn',      name: 'Giant Acorn',       size: 0.5,  shape: 'fo_acorn',      colors: [0xc98a4a, 0xb87a3a] },
  { id: 'fo_pinecone',   name: 'Giant Pinecone',    size: 0.6,  shape: 'fo_pinecone',   colors: [0x8a5a2b, 0x7a4f2a] },
  { id: 'fo_logpile',    name: 'Log Pile',          size: 1.6,  shape: 'fo_logpile',    colors: [0x8a5a2b, 0x9a6a3a], mass: 0.8 },
  { id: 'fo_sawpit',     name: 'Saw Trestle',       size: 2.8,  shape: 'fo_sawpit',     colors: [0xd9415f], mass: 0.5 },
  { id: 'fo_sawdust',    name: 'Sawdust Heap',      size: 0.5,  shape: 'fo_sawdust',    colors: [0xe8cf8f, 0xdcc07a] },
  { id: 'fo_bedroll',    name: 'Bedroll',           size: 0.55, shape: 'fo_bedroll',    colors: [0xd9534a, 0x4a86d9, 0x57a85a, 0xe8a23a] },
  { id: 'fo_bunting',    name: 'Bunting Pole',      size: 2.4,  shape: 'fo_bunting',    colors: [0xd9415f, 0x57a85a, 0x9b6ae6], rad: 0.1, mass: 0.3 },
  { id: 'fo_hive',       name: 'Beehive',           size: 0.75, shape: 'fo_hive',       colors: [0xe8c95a, 0xdcb84a] },
  { id: 'fo_hollow',     name: 'Hollow Log',        size: 3.2,  shape: 'fo_hollow',     colors: [0x8a5a2b, 0x7a5a3a], rad: 0.3, mass: 0.4 },
  { id: 'fo_basket',     name: 'Fruit Basket',      size: 0.35, shape: 'fo_basket',     colors: [0xc9a35a, 0xb88a4a] },
  { id: 'fo_birdbox',    name: 'Bird Box',          size: 1.9,  shape: 'fo_birdbox',    colors: [0xd9534a, 0x4a9be8, 0xe8a23a, 0xf3ead7], rad: 0.12, mass: 0.4 },
  { id: 'fo_totem',      name: 'Totem Stump',       size: 1.4,  shape: 'fo_totem',      colors: [0xd9534a, 0x3fa7a0, 0xe8a23a], rad: 0.3, mass: 0.8 },
  { id: 'fo_fern',       name: 'Fern',              size: 0.45, shape: 'fo_fern',       colors: [0x3f8f3a, 0x4fa04a], rad: 0.3 },
  { id: 'fo_mossrock',   name: 'Mossy Boulder',     size: 1.1,  shape: 'fo_mossrock',   colors: [0x8f8f8f, 0x9a8b78], mass: 0.8 },
  { id: 'fo_duckboard',  name: 'Duckboard',         size: 1.2,  shape: 'fo_duckboard',  colors: [0xb08a5a, 0xa07a4a], rad: 0.3, flat: true },
  // ---- Echo Gorge
  { id: 'go_kayak',      name: 'Kayak',             size: 2.2,  shape: 'go_kayak',      colors: [0xe8573a, 0xf1c935, 0x4ac2d9, 0x9bd94a, 0xd9415f], rad: 0.25, mass: 0.4 },
  { id: 'go_raft',       name: 'River Raft',        size: 3.0,  shape: 'go_raft',       colors: [0xe8a23a, 0xd9534a, 0x4a86d9], mass: 0.4 },
  { id: 'go_sluice',     name: 'Gold Sluice',       size: 3.4,  shape: 'go_sluice',     colors: [0x8a5a2b], rad: 0.3, mass: 0.4 },
  { id: 'go_waterwheel', name: 'Waterwheel Mill',   size: 9,    shape: 'go_waterwheel', colors: [0xd9c7a3, 0xcdbf9a], rad: 0.3, mass: 0.08 },
  { id: 'go_platform',   name: 'Viewing Platform',  size: 4.5,  shape: 'go_platform',   colors: [0x4a9be8], mass: 0.3 },
  { id: 'go_flagpole',   name: 'Rainbow Flag',      size: 5,    shape: 'go_flagpole',   colors: [0xd9415f, 0x9b6ae6, 0x57b65a, 0xf2903a], rad: 0.08, mass: 0.3 },
  { id: 'go_guardian',   name: 'River Guardian',    size: 10,   shape: 'go_guardian',   colors: [0x6fa8a0, 0x7fb0a0], rad: 0.25, mass: 0.3 },
  { id: 'go_bridgetower', name: 'Rope-Bridge Tower', size: 11,  shape: 'go_bridgetower', colors: [0x8a5a2b], rad: 0.2, mass: 0.1 },
  { id: 'go_horn',       name: 'Echo Horn',         size: 6,    shape: 'go_horn',       colors: [0xd9a86a], rad: 0.25, mass: 0.3 },
  { id: 'go_minegate',   name: 'Mine Entrance',     size: 5,    shape: 'go_minegate',   colors: [0x8a5a2b], rad: 0.4, mass: 0.3 },
  { id: 'go_orecart',    name: 'Ore Cart',          size: 1.5,  shape: 'go_orecart',    colors: [0xf1c935, 0x9b6ae6, 0x4ac2d9], mass: 0.6 },
  { id: 'go_rail',       name: 'Mine Rail',         size: 2,    shape: 'go_rail',       colors: [0x555b66], rad: 0.3, flat: true },
  { id: 'go_geode',      name: 'Crystal Geode',     size: 2,    shape: 'go_geode',      colors: [0x9b6ae6, 0x4ac2d9, 0xff8fb1, 0x7fe0d0], mass: 0.6 },
  { id: 'go_bigstump',   name: 'Old-Growth Stump',  size: 8,    shape: 'go_bigstump',   colors: [0xd9534a, 0x4a86d9, 0x57a85a], rad: 0.45, mass: 0.15 },
  { id: 'go_glider',     name: 'Hang-Glider Ramp',  size: 6,    shape: 'go_glider',     colors: [0xd9415f, 0x4a9be8, 0x9bd94a], rad: 0.3, mass: 0.2 },
  // ---- Honeyfield Farms
  { id: 'fa_barn',       name: 'Big Barn',          size: 9,    shape: 'fa_barn',       colors: [0xb8433a, 0xc24f3a], rad: 0.42, mass: 0.08 },
  { id: 'fa_silo',       name: 'Silo',              size: 12,   shape: 'fa_silo',       colors: [0xc8ccd4, 0xe8e2d0], rad: 0.2, mass: 0.06 },
  { id: 'fa_plough',     name: 'Plough',            size: 2,    shape: 'fa_plough',     colors: [0xd9534a], rad: 0.3, mass: 0.5 },
  { id: 'fa_churn',      name: 'Milk Churn',        size: 0.7,  shape: 'fa_churn',      colors: [0xc8ccd4, 0xb8c4d0], rad: 0.3 },
  { id: 'fa_eggcrate',   name: 'Egg Crate',         size: 0.35, shape: 'fa_eggcrate',   colors: [0xc9a66a] },
  { id: 'fa_coop',       name: 'Chicken Coop',      size: 2.4,  shape: 'fa_coop',       colors: [0xe8d9a8, 0xd9c7a3], mass: 0.4 },
  { id: 'fa_trough',     name: 'Water Trough',      size: 1.8,  shape: 'fa_trough',     colors: [0x8a5a2b, 0x8fa3b8], rad: 0.3, mass: 0.6 },
  { id: 'fa_pumpkin',    name: 'Prize Pumpkin',     size: 3,    shape: 'fa_pumpkin',    colors: [0x3f7ad9, 0xd9415f, 0xf1c935], rad: 0.4, mass: 0.8 },
  { id: 'fa_trophy',     name: 'Trophy',            size: 0.4,  shape: 'fa_trophy',     colors: [0xf1c935, 0xc8ccd4, 0xc98a4a], rad: 0.3 },
  { id: 'fa_sunflower',  name: 'Sunflower',         size: 1.5,  shape: 'fa_sunflower',  colors: [0xffd23f, 0xffc21f], rad: 0.12, mass: 0.4 },
  { id: 'fa_scarecrow',  name: 'Scarecrow',         size: 1.8,  shape: 'fa_scarecrow',  colors: [0xd9534a, 0x4a86d9, 0x57a85a, 0xe8a23a], rad: 0.2, mass: 0.5 },
  { id: 'fa_bale',       name: 'Straw Bale',        size: 1.0,  shape: 'fa_bale',       colors: [0xe8c95a, 0xdcbb4a] },
  { id: 'fa_cabbage',    name: 'Cabbage',           size: 0.3,  shape: 'fa_cabbage',    colors: [0x7fc46a, 0x8fd07a, 0x6fb85a] },
  { id: 'fa_frostcab',   name: 'Frosted Cabbage',   size: 0.3,  shape: 'fa_frostcab',   colors: [0xa8d8c8, 0xb8e0d8] },
  { id: 'fa_corn',       name: 'Corn Stalk',        size: 2.2,  shape: 'fa_corn',       colors: [0x6fae4a], rad: 0.12, mass: 0.4 },
  { id: 'fa_judgetable', name: 'Judging Table',     size: 2.2,  shape: 'fa_judgetable', colors: [0xd9415f, 0x4a86d9], mass: 0.5 },
  { id: 'fa_washline',   name: 'Washing Line',      size: 2.8,  shape: 'fa_washline',   colors: [0xd9534a], rad: 0.3, mass: 0.3 },
  { id: 'fa_appletree',  name: 'Apple Tree',        size: 4.2,  shape: 'fa_appletree',  colors: [0x4c9e4a, 0x5fae52], rad: 0.14, mass: 0.2 },
  { id: 'fa_ladder',     name: 'Orchard Ladder',    size: 2.2,  shape: 'fa_ladder',     colors: [0xc9a35a], rad: 0.2, mass: 0.3 },
  { id: 'fa_sledge',     name: 'Firewood Sledge',   size: 2.2,  shape: 'fa_sledge',     colors: [0xd9534a, 0x4a86d9], rad: 0.3, mass: 0.6 },
  // ---- Windmill Prairie
  { id: 'pl_kite',       name: 'Kite Pole',         size: 5,    shape: 'pl_kite',       colors: [0xd9415f, 0x4a9be8, 0x9b6ae6, 0xf2903a, 0x57b65a], rad: 0.08, mass: 0.2 },
  { id: 'pl_windsock',   name: 'Windsock',          size: 4,    shape: 'pl_windsock',   colors: [0xf2743a, 0xd9415f], rad: 0.08, mass: 0.3 },
  { id: 'pl_balloon',    name: 'Hot-Air Balloon',   size: 14,   shape: 'pl_balloon',    colors: [0xd9415f, 0x4a9be8, 0x9b6ae6, 0x57b65a], rad: 0.15, mass: 0.1 },
  { id: 'pl_balloonflat', name: 'Half-Inflated Balloon', size: 7, shape: 'pl_balloonflat', colors: [0xd9415f, 0x4a9be8, 0x9b6ae6, 0x57b65a], rad: 0.4, mass: 0.15 },
  { id: 'pl_wagon',      name: 'Covered Wagon',     size: 3.6,  shape: 'pl_wagon',      colors: [0xf3ead7, 0xe8dcc0], rad: 0.3, mass: 0.4 },
  { id: 'pl_rick',       name: 'Hay Rick',          size: 3.2,  shape: 'pl_rick',       colors: [0xe8c95a, 0xd9b84a], rad: 0.4, mass: 0.5 },
  { id: 'pl_mound',      name: 'Burrow Mound',      size: 0.8,  shape: 'pl_mound',      colors: [0xb9935f, 0xa8845a], rad: 0.45 },
  { id: 'pl_wildflower', name: 'Wildflowers',       size: 0.25, shape: 'pl_wildflower', colors: [0xff8fb1, 0xffffff, 0xc59bff, 0xffb347, 0xf2603a, 0x6fb8ff] },
  { id: 'pl_chair',      name: 'Giant Chair',       size: 6,    shape: 'pl_chair',      colors: [0xd9534a, 0x4a86d9, 0xe8a23a], rad: 0.3, mass: 0.2 },
  { id: 'pl_picnictable', name: 'Giant Picnic Table', size: 5,  shape: 'pl_picnictable', colors: [0xc99a5a], rad: 0.4, mass: 0.3 },
  { id: 'pl_ford',       name: 'Ford Stone',        size: 3,    shape: 'pl_ford',       colors: [0x9a968c, 0xa8a296], rad: 0.25, mass: 0.6 },
  { id: 'pl_tyreoak',    name: 'Swing Oak',         size: 12,   shape: 'pl_tyreoak',    colors: [0x4c9e4a, 0x5aa850], rad: 0.12, mass: 0.05 },
  { id: 'pl_beacon',     name: 'Beacon Tower',      size: 15,   shape: 'pl_beacon',     colors: [0xe8e2d0, 0xd9cfae], rad: 0.2, mass: 0.06 },
  { id: 'pl_pinwheel',   name: 'Pinwheel',          size: 0.5,  shape: 'pl_pinwheel',   colors: [0xd9415f, 0x4a9be8, 0x9b6ae6, 0x57b65a, 0xf2903a], rad: 0.2 },
];

const Q = Math.PI / 4, HP = Math.PI / 2, PI = Math.PI, TAU = Math.PI * 2;
function cabbage(g, c, P) {
  P(g, 'sph', c, [.46, .38, .46], [0, .38, 0]); P(g, 'sph', 0xb9e08a, [.3, .3, .3], [0, .52, 0]);
  P(g, 'sph', c, [.5, .09, .3], [0, .14, .1], [0, .5, 0]); P(g, 'sph', c, [.5, .09, .3], [0, .14, -.1], [0, -.6, 0]);
}
export const SHAPES = {
  // ---------------- Whisperwood ----------------
  fo_elder(g, c, P) {
    P(g, 'taper', DARK, [.11, .56, .11], [0, .28, 0]); P(g, 'cone', DARK, [.22, .2, .22], [0, .1, 0]);
    P(g, 'sph', c, [.36, .2, .36], [0, .64, 0]); P(g, 'sph', c, [.26, .17, .26], [-.2, .76, .1]); P(g, 'sph', c, [.24, .16, .24], [.2, .79, -.08]);
    P(g, 'sph', c, [.2, .13, .2], [0, .87, .04]); P(g, 'sph', BLACK, [.035, .05, .02], [0, .36, .095]);
    P(g, 'sph', 0xfff2a0, [.03, .03, .03], [.2, .5, .2]); P(g, 'sph', 0xfff2a0, [.03, .03, .03], [-.24, .52, -.1]);
  },
  fo_treehouse(g, c, P) {
    P(g, 'cyl', WOOD, [.08, .62, .08], [0, .31, 0]); P(g, 'box', DARK, [.62, .04, .62], [0, .5, 0]);
    P(g, 'box', c, [.4, .22, .4], [0, .63, 0]); P(g, 'pyr', RED, [.38, .2, .38], [0, .84, 0], [0, Q, 0]);
    P(g, 'sph', LEAF, [.26, .2, .26], [-.22, .74, -.22]); P(g, 'sph', LEAF, [.24, .18, .24], [.24, .68, -.2]);
    P(g, 'box', ROPE, [.12, .52, .025], [.18, .25, .3], [-.12, 0, 0]); P(g, 'box', 0xfff2a0, [.1, .09, .02], [0, .64, .205]);
  },
  fo_toadstool(g, c, P) {
    P(g, 'cyl', CREAM, [.14, .5, .14], [0, .25, 0]); P(g, 'hemi', c, [.5, .5, .5], [0, .45, 0]);
    P(g, 'sph', WHITE, [.1, .06, .1], [.22, .84, .2]); P(g, 'sph', WHITE, [.1, .06, .1], [-.28, .8, -.05]);
  },
  fo_acorn(g, c, P) { P(g, 'sph', c, [.36, .42, .36], [0, .42, 0]); P(g, 'hemi', DARK, [.4, .28, .4], [0, .6, 0]); P(g, 'cyl', DARK, [.05, .14, .05], [0, .93, 0]); },
  fo_pinecone(g, c, P) {
    P(g, 'sph', c, [.34, .5, .34], [0, .5, 0]);
    P(g, 'cyl', DARK, [.37, .06, .37], [0, .3, 0]); P(g, 'cyl', DARK, [.36, .06, .36], [0, .52, 0]); P(g, 'cyl', DARK, [.27, .06, .27], [0, .74, 0]);
  },
  fo_logpile(g, c, P) {
    for (const z of [-.21, .21]) P(g, 'cyl', c, [.2, 1, .2], [0, .2, z], [0, 0, HP]);
    P(g, 'cyl', 0xa87a45, [.19, .96, .19], [0, .55, 0], [0, 0, HP]);
    for (const x of [-.3, .3]) P(g, 'box', DARK, [.05, .5, .05], [x, .25, .44]);
  },
  fo_sawpit(g, c, P) {
    for (const x of [-.32, .32]) P(g, 'box', WOOD, [.07, .42, .5], [x, .21, 0]);
    P(g, 'cyl', 0xa87a45, [.13, 1, .13], [0, .53, 0], [0, 0, HP]);
    P(g, 'box', STEEL, [.5, .3, .02], [.05, .76, 0]);
    P(g, 'box', c, [.05, .14, .09], [-.22, .92, 0]); P(g, 'box', c, [.05, .14, .09], [.32, .92, 0]);
  },
  fo_sawdust(g, c, P) { P(g, 'hemi', c, [.48, .42, .48], [0, 0, 0]); P(g, 'hemi', c, [.22, .2, .22], [.3, 0, .2]); },
  fo_bedroll(g, c, P) {
    P(g, 'cyl', c, [.2, 1, .2], [0, .2, 0], [0, 0, HP]);
    for (const x of [-.26, .26]) P(g, 'cyl', DARK, [.21, .08, .21], [x, .2, 0], [0, 0, HP]);
  },
  fo_bunting(g, c, P) {
    P(g, 'cyl', WOOD, [.04, .94, .04], [0, .47, 0]); P(g, 'sph', GOLD, [.07, .07, .07], [0, .95, 0]);
    const cols = [c, 0xffd23f, BLUE];
    for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) P(g, 'box', cols[(i + (sx > 0 ? 1 : 0)) % 3], [.13, .13, .02], [sx * (.12 + i * .13), .84 - i * .07, 0], [0, 0, Q]);
  },
  fo_hive(g, c, P) {
    P(g, 'box', WOOD, [.8, .08, .8], [0, .04, 0]); P(g, 'cyl', c, [.4, .22, .4], [0, .19, 0]); P(g, 'cyl', c, [.36, .2, .36], [0, .4, 0]);
    P(g, 'cyl', c, [.29, .18, .29], [0, .59, 0]); P(g, 'hemi', c, [.21, .2, .21], [0, .68, 0]); P(g, 'box', BLACK, [.14, .1, .04], [0, .16, .39]);
  },
  fo_hollow(g, c, P) {
    P(g, 'cyl', c, [.3, .98, .3], [0, .3, 0], [0, 0, HP]); P(g, 'cyl', BLACK, [.22, 1, .22], [0, .3, 0], [0, 0, HP]);
    P(g, 'sph', 0x5fa85a, [.25, .07, .2], [-.15, .58, 0]); P(g, 'cyl', CREAM, [.025, .08, .025], [.25, .62, .05]); P(g, 'sph', RED, [.08, .05, .08], [.25, .68, .05]);
  },
  fo_basket(g, c, P) {
    P(g, 'taper', c, [.4, .5, .4], [0, .25, 0], [PI, 0, 0]); P(g, 'sph', 0xd93a4a, [.34, .2, .34], [0, .5, 0]);
    for (const x of [-.38, .38]) P(g, 'box', c, [.06, .44, .08], [x, .7, 0]);
    P(g, 'box', c, [.82, .06, .08], [0, .93, 0]);
  },
  fo_birdbox(g, c, P) {
    P(g, 'cyl', WOOD, [.035, .72, .035], [0, .36, 0]); P(g, 'box', c, [.3, .26, .26], [0, .83, 0]); P(g, 'box', DARK, [.4, .05, .36], [0, .975, 0]);
    P(g, 'sph', BLACK, [.05, .05, .03], [0, .86, .13]); P(g, 'cyl', WOOD, [.015, .1, .015], [0, .76, .17], [HP, 0, 0]);
    P(g, 'cyl', WOOD, [.17, .03, .17], [0, .44, 0]); P(g, 'sph', 0xffd23f, [.11, .04, .11], [0, .47, 0]);
  },
  fo_totem(g, c, P) {
    P(g, 'cyl', WOOD, [.3, .3, .3], [0, .15, 0]); P(g, 'box', 0xa87a45, [.5, .26, .44], [0, .43, 0]); P(g, 'box', c, [.44, .24, .4], [0, .68, 0]);
    P(g, 'box', c, [.96, .1, .06], [0, .7, 0]); P(g, 'cone', 0xffd23f, [.07, .16, .07], [0, .68, .26], [HP, 0, 0]);
    for (const x of [-.12, .12]) P(g, 'sph', WHITE, [.06, .06, .04], [x, .47, .22]);
    P(g, 'pyr', RED, [.2, .18, .2], [0, .89, 0], [0, Q, 0]);
  },
  fo_fern(g, c, P) {
    P(g, 'cone', c, [.1, .55, .1], [0, .27, 0]);
    for (const s of [-1, 1]) { P(g, 'cone', c, [.14, .62, .05], [s * .22, .26, 0], [0, 0, -s * .95]); P(g, 'cone', c, [.05, .62, .14], [0, .26, s * .22], [s * .95, 0, 0]); }
  },
  fo_mossrock(g, c, P) { P(g, 'rock', c, [.5, .42, .48], [0, .4, 0]); P(g, 'hemi', 0x5fa85a, [.42, .36, .4], [-.03, .5, 0]); P(g, 'rock', c, [.2, .18, .2], [.38, .16, .3]); },
  fo_duckboard(g, c, P) {
    for (const z of [-.2, .2]) P(g, 'box', DARK, [1, .04, .07], [0, .02, z]);
    for (let i = 0; i < 5; i++) P(g, 'box', c, [.17, .05, .6], [-.4 + i * .2, .065, 0]);
  },
  // ---------------- Echo Gorge ----------------
  go_kayak(g, c, P) {
    P(g, 'sph', c, [.5, .13, .15], [0, .14, 0]); P(g, 'cyl', 0x2a2a33, [.11, .05, .09], [0, .26, 0]);
    P(g, 'cyl', WOOD, [.015, .7, .015], [.1, .31, 0], [HP, 0, 0]);
    for (const z of [-.36, .36]) P(g, 'box', 0xffd23f, [.09, .02, .13], [.1, .31, z]);
  },
  go_raft(g, c, P) {
    for (const z of [-.32, .32]) P(g, 'cyl', c, [.12, 1, .12], [0, .12, z], [0, 0, HP]);
    for (const x of [-.44, .44]) P(g, 'cyl', c, [.12, .76, .12], [x, .12, 0], [HP, 0, 0]);
    P(g, 'box', 0x6a7078, [.8, .06, .56], [0, .07, 0]); P(g, 'cyl', 0xffd23f, [.08, .62, .08], [0, .2, 0], [HP, 0, 0]);
  },
  go_sluice(g, c, P) {
    P(g, 'box', c, [1, .07, .3], [0, .3, 0], [0, 0, .15]); P(g, 'box', WATER, [.96, .03, .22], [0, .345, 0], [0, 0, .15]);
    for (const z of [-.15, .15]) P(g, 'box', DARK, [1, .11, .04], [0, .36, z], [0, 0, .15]);
    P(g, 'box', DARK, [.05, .36, .36], [.4, .18, 0]); P(g, 'box', DARK, [.05, .22, .36], [-.38, .11, 0]);
    P(g, 'cyl', IRON, [.12, .12, .12], [-.42, .06, .32]); P(g, 'sph', GOLD, [.07, .05, .07], [-.42, .13, .32]);
  },
  go_waterwheel(g, c, P) {
    P(g, 'box', c, [.5, .5, .5], [-.17, .25, 0]); P(g, 'pyr', 0xb8433a, [.42, .3, .42], [-.17, .65, 0], [0, Q, 0]);
    P(g, 'box', DARK, [.14, .22, .03], [-.17, .11, .255]);
    P(g, 'cyl', DARK, [.4, .1, .4], [.2, .42, 0], [0, 0, HP]); P(g, 'cyl', IRON, [.08, .2, .08], [.2, .42, 0], [0, 0, HP]);
    for (let k = 0; k < 4; k++) P(g, 'box', 0xa87a45, [.13, .86, .07], [.2, .42, 0], [k * Q, 0, 0]);
    P(g, 'box', WATER, [.26, .04, .12], [.3, .86, 0]);
  },
  go_platform(g, c, P) {
    P(g, 'box', WOOD, [.9, .06, .7], [0, .4, 0]);
    for (const x of [-.38, .38]) for (const z of [-.28, .28]) P(g, 'box', DARK, [.07, .4, .07], [x, .2, z]);
    P(g, 'box', DARK, [.9, .05, .04], [0, .62, .33]); P(g, 'box', WOOD, [.3, .2, .16], [0, .1, -.42]);
    P(g, 'cyl', IRON, [.03, .2, .03], [.2, .53, .2]); P(g, 'box', c, [.1, .09, .16], [.2, .67, .2]);
  },
  go_flagpole(g, c, P) {
    P(g, 'cyl', STONE, [.08, .05, .08], [0, .025, 0]); P(g, 'cyl', CREAM, [.025, .96, .025], [0, .5, 0]); P(g, 'sph', GOLD, [.04, .04, .04], [0, .98, 0]);
    P(g, 'box', c, [.34, .07, .02], [.19, .9, 0]); P(g, 'box', 0xffd23f, [.34, .07, .02], [.19, .83, 0]); P(g, 'box', BLUE, [.34, .07, .02], [.19, .76, 0]);
  },
  go_guardian(g, c, P) {
    P(g, 'box', STONE, [.5, .12, .5], [0, .06, 0]); P(g, 'taper', c, [.22, .46, .2], [0, .35, 0]); P(g, 'sph', c, [.19, .17, .19], [0, .68, 0]);
    P(g, 'cone', 0x3fa7a0, [.1, .2, .1], [0, .9, 0]);
    for (const x of [-.22, .22]) P(g, 'box', 0x3fa7a0, [.07, .2, .05], [x, .72, 0], [0, 0, x > 0 ? -.4 : .4]);
    P(g, 'box', GOLD, [.26, .045, .05], [0, .71, .165]); P(g, 'cyl', STONE, [.09, .13, .09], [0, .42, .22], [HP, 0, 0]); P(g, 'box', WATER, [.07, .38, .05], [0, .21, .3]);
  },
  go_bridgetower(g, c, P) {
    P(g, 'box', STONE, [.76, .12, .5], [0, .06, 0]);
    for (const x of [-.25, .25]) P(g, 'box', c, [.1, .88, .1], [x, .54, 0]);
    P(g, 'box', DARK, [.7, .08, .12], [0, .92, 0]); P(g, 'box', DARK, [.6, .06, .1], [0, .58, 0]); P(g, 'box', 0xa87a45, [.6, .04, .4], [0, .32, 0]);
    for (const x of [-.25, .25]) P(g, 'box', ROPE, [.04, .04, .34], [x, .76, .2], [.5, 0, 0]);
    P(g, 'box', 0xa87a45, [.3, .025, .12], [0, .6, .4], [.6, 0, 0]);
  },
  go_horn(g, c, P) {
    P(g, 'cone', c, [.09, .97, .09], [0, .34, 0], [-1.0, 0, 0]); P(g, 'sph', c, [.15, .13, .15], [0, .12, .39]);
    P(g, 'sph', BLACK, [.1, .08, .06], [0, .14, .47]); P(g, 'cyl', RED, [.062, .06, .062], [0, .33, .02], [-1.0, 0, 0]);
    P(g, 'box', DARK, [.34, .42, .05], [0, .21, -.2]);
  },
  go_minegate(g, c, P) {
    P(g, 'rock', STONE, [.5, .42, .28], [0, .38, -.2]); P(g, 'box', 0x1c1612, [.6, .72, .06], [0, .36, .02]);
    for (const x of [-.36, .36]) P(g, 'box', c, [.12, .76, .14], [x, .38, .06]);
    P(g, 'box', c, [.96, .13, .18], [0, .81, .06]);
    for (const x of [-.25, .25]) P(g, 'box', DARK, [.06, .3, .06], [x, .66, .1], [0, 0, x > 0 ? .8 : -.8]);
    P(g, 'box', CREAM, [.4, .12, .03], [0, .94, .12]); P(g, 'sph', 0xfff2a0, [.05, .05, .05], [.36, .7, .16]);
  },
  go_orecart(g, c, P) {
    P(g, 'box', IRON, [.8, .4, .55], [0, .46, 0]); P(g, 'box', 0x3a3a44, [.86, .06, .6], [0, .67, 0]); P(g, 'rock', c, [.32, .2, .22], [0, .74, 0]);
    for (const x of [-.26, .26]) for (const z of [-.27, .27]) P(g, 'cyl', 0x3a3a44, [.13, .06, .13], [x, .13, z], [HP, 0, 0]);
  },
  go_rail(g, c, P) {
    for (let i = 0; i < 4; i++) P(g, 'box', WOOD, [.1, .04, .6], [-.375 + i * .25, .02, 0]);
    for (const z of [-.2, .2]) P(g, 'box', c, [1, .04, .04], [0, .06, z]);
  },
  go_geode(g, c, P) {
    P(g, 'rock', 0x8a8a86, [.48, .4, .45], [0, .36, 0]); P(g, 'sph', WHITE, [.3, .16, .3], [0, .56, 0]);
    P(g, 'pyr', c, [.14, .5, .14], [0, .72, 0]); P(g, 'pyr', c, [.1, .4, .1], [.2, .62, .1], [0, 0, -.5]);
    P(g, 'pyr', c, [.1, .36, .1], [-.2, .6, -.05], [0, 0, .5]); P(g, 'pyr', c, [.09, .3, .09], [0, .58, .24], [.6, 0, 0]);
  },
  go_bigstump(g, c, P) {
    P(g, 'taper', WOOD, [.46, .6, .46], [0, .3, 0]);
    for (let k = 0; k < 3; k++) P(g, 'cone', WOOD, [.17, .28, .17], [Math.cos(k * 2.1 + 2.6) * .36, .14, Math.sin(k * 2.1 + 2.6) * .36]);
    P(g, 'cyl', 0xe0c08a, [.31, .02, .31], [0, .61, 0]); P(g, 'cyl', 0xc9a35a, [.18, .022, .18], [0, .612, 0]);
    P(g, 'box', c, [.14, .25, .04], [0, .125, .45]); P(g, 'box', 0xfff2a0, [.1, .1, .04], [.2, .36, .36], [0, .5, 0]);
    P(g, 'cyl', STONE, [.05, .22, .05], [-.14, .72, -.1]);
  },
  go_glider(g, c, P) {
    P(g, 'box', WOOD, [.42, .06, .92], [0, .22, 0], [-.25, 0, 0]); P(g, 'box', DARK, [.4, .4, .06], [0, .2, .36]); P(g, 'box', DARK, [.4, .2, .06], [0, .1, 0]);
    P(g, 'pyr', c, [.3, .05, .4], [0, .76, .3], [-.2, 0, 0]); P(g, 'pyr', 0xffd23f, [.18, .055, .25], [0, .765, .3], [-.2, 0, 0]);
    for (const x of [-.08, .08]) P(g, 'box', IRON, [.03, .3, .03], [x, .56, .3]);
  },
  // ---------------- Honeyfield Farms ----------------
  fa_barn(g, c, P) {
    P(g, 'box', c, [.9, .42, .7], [0, .21, 0]); P(g, 'box', c, [.46, .18, .68], [0, .5, 0]);
    for (const s of [-1, 1]) P(g, 'box', 0x6a6470, [.52, .05, .76], [s * .21, .56, 0], [0, 0, s * .6]);
    P(g, 'box', CREAM, [.3, .3, .03], [0, .15, .345]); P(g, 'box', BLACK, [.14, .12, .03], [0, .5, .34]);
    P(g, 'cyl', IRON, [.012, .16, .012], [0, .78, 0]); P(g, 'box', GOLD, [.22, .025, .02], [0, .85, 0]); P(g, 'sph', GOLD, [.045, .05, .03], [0, .91, 0]);
  },
  fa_silo(g, c, P) {
    P(g, 'cyl', c, [.19, .82, .19], [0, .41, 0]); P(g, 'hemi', 0x7f8fa3, [.19, .15, .19], [0, .82, 0]);
    for (const y of [.25, .55]) P(g, 'cyl', 0x7f8fa3, [.195, .03, .195], [0, y, 0]);
    P(g, 'box', IRON, [.05, .8, .02], [0, .4, .195]); P(g, 'box', 0x7f8fa3, [.06, .56, .06], [.22, .5, 0], [0, 0, .12]);
  },
  fa_plough(g, c, P) {
    P(g, 'box', WOOD, [.09, .09, .9], [0, .4, 0]);
    for (const x of [-.13, .13]) P(g, 'box', WOOD, [.05, .5, .05], [x, .62, -.34], [-.5, 0, 0]);
    P(g, 'pyr', STEEL, [.17, .32, .17], [0, .17, .02], [PI, 0, 0]); P(g, 'cyl', c, [.16, .06, .16], [0, .16, .4], [0, 0, HP]);
  },
  fa_churn(g, c, P) {
    P(g, 'cyl', c, [.24, .6, .24], [0, .3, 0]); P(g, 'taper', c, [.24, .14, .24], [0, .67, 0]); P(g, 'cyl', c, [.15, .14, .15], [0, .8, 0]);
    P(g, 'cyl', IRON, [.2, .05, .2], [0, .9, 0]); P(g, 'box', IRON, [.58, .05, .06], [0, .56, 0]);
  },
  fa_eggcrate(g, c, P) {
    P(g, 'box', c, [1, .22, .66], [0, .11, 0]);
    for (const x of [-.3, 0, .3]) for (const z of [-.16, .16]) P(g, 'sph', CREAM, [.11, .14, .11], [x, .3, z]);
  },
  fa_coop(g, c, P) {
    for (const z of [-.2, .2]) P(g, 'box', WOOD, [.6, .3, .05], [0, .15, z]);
    P(g, 'box', c, [.6, .4, .5], [0, .5, 0]); P(g, 'pyr', 0xb8433a, [.52, .26, .52], [0, .83, 0], [0, Q, 0]);
    P(g, 'box', BLACK, [.16, .2, .02], [0, .42, .255]); P(g, 'box', WOOD, [.16, .03, .42], [0, .16, .42], [.6, 0, 0]); P(g, 'box', c, [.2, .2, .3], [.4, .45, 0]);
  },
  fa_trough(g, c, P) {
    for (const x of [-.38, .38]) P(g, 'box', DARK, [.08, .16, .44], [x, .08, 0]);
    P(g, 'box', c, [1, .28, .4], [0, .28, 0]); P(g, 'box', WATER, [.9, .04, .3], [0, .41, 0]);
    P(g, 'cyl', IRON, [.03, .5, .03], [-.45, .5, 0]); P(g, 'box', IRON, [.2, .04, .04], [-.36, .7, 0]);
  },
  fa_pumpkin(g, c, P) {
    P(g, 'sph', 0xf2903a, [.48, .37, .48], [0, .38, 0]); P(g, 'sph', 0xe8802a, [.35, .385, .495], [0, .38, 0]); P(g, 'sph', 0xe8802a, [.495, .385, .35], [0, .38, 0]);
    P(g, 'cyl', 0x3f8f3a, [.06, .18, .06], [0, .8, 0], [0, 0, .3]);
    P(g, 'cyl', c, [.16, .04, .16], [0, .45, .49], [HP, 0, 0]); P(g, 'cyl', GOLD, [.08, .05, .08], [0, .45, .5], [HP, 0, 0]);
    for (const s of [-1, 1]) P(g, 'box', c, [.06, .22, .02], [s * .06, .25, .5], [0, 0, s * .2]);
  },
  fa_trophy(g, c, P) {
    P(g, 'box', DARK, [.4, .15, .4], [0, .075, 0]); P(g, 'cyl', c, [.07, .26, .07], [0, .27, 0]);
    P(g, 'taper', c, [.28, .5, .28], [0, .65, 0], [PI, 0, 0]); P(g, 'box', c, [.78, .06, .06], [0, .72, 0]);
  },
  fa_sunflower(g, c, P) {
    P(g, 'cyl', 0x3f8f3a, [.035, .75, .035], [0, .375, 0]);
    for (const s of [-1, 1]) P(g, 'sph', 0x4fa04a, [.14, .03, .07], [s * .14, .3 + s * .06, 0], [0, 0, s * .4]);
    P(g, 'cyl', c, [.24, .05, .24], [0, .76, .02], [HP, 0, 0]); P(g, 'cyl', 0x6a4424, [.13, .07, .13], [0, .76, .03], [HP, 0, 0]);
  },
  fa_scarecrow(g, c, P) {
    P(g, 'box', WOOD, [.06, .82, .06], [0, .41, 0]); P(g, 'box', WOOD, [.9, .06, .06], [0, .62, 0]); P(g, 'box', c, [.32, .34, .16], [0, .56, 0]);
    P(g, 'sph', STRAW, [.12, .12, .12], [0, .82, 0]); P(g, 'cyl', DARK, [.2, .025, .2], [0, .91, 0]); P(g, 'cone', DARK, [.11, .1, .11], [0, .96, 0]);
    for (const x of [-.46, .46]) P(g, 'sph', STRAW, [.06, .08, .06], [x, .6, 0]);
  },
  fa_bale(g, c, P) { P(g, 'box', c, [1, .5, .55], [0, .25, 0]); for (const x of [-.25, .25]) P(g, 'box', 0xb8433a, [.05, .52, .57], [x, .25, 0]); },
  fa_cabbage(g, c, P) { cabbage(g, c, P); },
  fa_frostcab(g, c, P) { cabbage(g, c, P); P(g, 'hemi', WHITE, [.3, .2, .3], [0, .62, 0]); },
  fa_corn(g, c, P) {
    P(g, 'cyl', c, [.04, .9, .04], [0, .45, 0]); P(g, 'cone', STRAW, [.06, .16, .06], [0, .92, 0]);
    for (const s of [-1, 1]) P(g, 'cone', c, [.05, .42, .12], [s * .12, .5 + s * .1, 0], [0, 0, -s * .7]);
    P(g, 'sph', 0xffd23f, [.07, .14, .07], [.07, .42, .06]);
  },
  fa_judgetable(g, c, P) {
    for (const x of [-.42, .42]) P(g, 'box', WOOD, [.06, .42, .44], [x, .21, 0]);
    P(g, 'box', CREAM, [1, .06, .5], [0, .45, 0]); P(g, 'box', c, [1, .3, .02], [0, .3, .25]);
    for (const x of [-.47, .47]) P(g, 'box', WOOD, [.035, .52, .035], [x, .72, -.22]);
    P(g, 'box', GOLD, [.94, .14, .02], [0, .9, -.22]);
  },
  fa_washline(g, c, P) {
    for (const x of [-.47, .47]) P(g, 'cyl', WOOD, [.03, .9, .03], [x, .45, 0]);
    P(g, 'box', CREAM, [.94, .015, .015], [0, .87, 0]);
    P(g, 'box', c, [.16, .26, .02], [-.3, .73, 0]); P(g, 'box', WHITE, [.26, .22, .02], [-.04, .75, 0]); P(g, 'box', BLUE, [.13, .34, .02], [.2, .69, 0]);
    for (const x of [.33, .4]) P(g, 'box', 0xffd23f, [.05, .13, .02], [x, .8, 0]);
  },
  fa_appletree(g, c, P) {
    P(g, 'cyl', WOOD, [.07, .42, .07], [0, .21, 0]); P(g, 'sph', c, [.4, .32, .4], [0, .67, 0]);
    for (const [x, y, z] of [[.3, .6, .22], [-.26, .72, .26], [.05, .5, .36], [-.36, .58, -.1], [.2, .86, -.2]]) P(g, 'sph', 0xd93a3a, [.055, .055, .055], [x, y, z]);
  },
  fa_ladder(g, c, P) {
    for (const x of [-.18, .18]) P(g, 'box', c, [.05, 1, .05], [x, .49, .12], [.24, 0, 0]);
    for (let i = 0; i < 3; i++) P(g, 'box', c, [.36, .04, .05], [0, .22 + i * .26, .18 - i * .063]);
    P(g, 'box', WOOD, [.3, .98, .04], [0, .48, -.12], [-.24, 0, 0]);
  },
  fa_sledge(g, c, P) {
    for (const x of [-.25, .25]) { P(g, 'box', c, [.06, .08, .96], [x, .04, 0]); P(g, 'box', c, [.06, .2, .06], [x, .13, .45], [-.6, 0, 0]); }
    P(g, 'box', WOOD, [.56, .05, .8], [0, .16, -.04]);
    for (const [y, z] of [[.28, -.22], [.28, .04], [.45, -.09]]) P(g, 'cyl', 0xa87a45, [.1, .5, .1], [0, y, z], [0, 0, HP]);
    P(g, 'hemi', WHITE, [.2, .07, .16], [0, .54, -.09]);
  },
  // ---------------- Windmill Prairie ----------------
  pl_kite(g, c, P) {
    P(g, 'cyl', STONE, [.07, .04, .07], [0, .02, 0]); P(g, 'cyl', WOOD, [.02, .8, .02], [0, .4, 0]);
    P(g, 'pyr', c, [.2, .03, .24], [.1, .74, 0], [HP, 0, 0]);
    for (let i = 0; i < 3; i++) P(g, 'box', 0xffd23f, [.07, .04, .02], [.24 + i * .06, .46 - i * .09, 0], [0, 0, .5]);
  },
  pl_windsock(g, c, P) {
    P(g, 'cyl', STONE, [.07, .04, .07], [0, .02, 0]); P(g, 'cyl', CREAM, [.025, .98, .025], [0, .5, 0]);
    P(g, 'cone', c, [.1, .46, .1], [.26, .9, 0], [0, 0, -HP]); P(g, 'cyl', WHITE, [.082, .07, .082], [.14, .9, 0], [0, 0, HP]); P(g, 'cyl', IRON, [.105, .03, .105], [.04, .9, 0], [0, 0, HP]);
  },
  pl_balloon(g, c, P) {
    P(g, 'sph', c, [.36, .38, .36], [0, .6, 0]); P(g, 'sph', 0xffd23f, [.37, .375, .12], [0, .6, 0]); P(g, 'sph', 0xffd23f, [.12, .375, .37], [0, .6, 0]);
    P(g, 'cone', c, [.25, .3, .25], [0, .3, 0], [PI, 0, 0]); P(g, 'box', ROPE, [.13, .1, .13], [0, .05, 0]);
    for (const x of [-.055, .055]) P(g, 'box', DARK, [.012, .1, .012], [x, .13, 0]);
    P(g, 'sph', 0xff9a3a, [.03, .04, .03], [0, .17, 0]);
  },
  pl_balloonflat(g, c, P) {
    P(g, 'sph', c, [.42, .22, .34], [-.1, .22, 0]); P(g, 'sph', 0xffd23f, [.43, .225, .1], [-.1, .22, 0]); P(g, 'sph', c, [.24, .13, .26], [-.3, .13, .16]);
    P(g, 'box', ROPE, [.2, .2, .2], [.4, .1, 0]); P(g, 'cyl', IRON, [.1, .07, .1], [.25, .12, -.2], [0, 0, HP]);
  },
  pl_wagon(g, c, P) {
    P(g, 'box', WOOD, [.46, .14, .8], [0, .3, -.05]); P(g, 'cyl', c, [.25, .76, .25], [0, .5, -.05], [HP, 0, 0]); P(g, 'cyl', BLACK, [.19, .02, .19], [0, .52, .34], [HP, 0, 0]);
    for (const x of [-.26, .26]) for (const z of [-.3, .2]) P(g, 'cyl', DARK, [.17, .05, .17], [x, .17, z], [0, 0, HP]);
    P(g, 'box', WOOD, [.05, .05, .2], [0, .26, .4]);
  },
  pl_rick(g, c, P) {
    P(g, 'cyl', c, [.4, .46, .4], [0, .23, 0]); P(g, 'cone', 0xd0a83a, [.47, .5, .47], [0, .7, 0]); P(g, 'cyl', WOOD, [.02, .1, .02], [0, .95, 0]);
    P(g, 'box', WOOD, [.14, .6, .03], [0, .29, .44], [.3, 0, 0]);
  },
  pl_mound(g, c, P) { P(g, 'hemi', c, [.5, .36, .5], [0, 0, 0]); P(g, 'cyl', BLACK, [.15, .03, .15], [0, .35, 0]); P(g, 'sph', STONE, [.08, .07, .08], [.3, .2, .25]); },
  pl_wildflower(g, c, P) {
    P(g, 'cone', 0x4fa04a, [.3, .5, .3], [0, .25, 0]);
    P(g, 'sph', c, [.17, .14, .17], [0, .78, 0]); P(g, 'sph', c, [.15, .12, .15], [.24, .56, .1]); P(g, 'sph', 0xffd23f, [.14, .11, .14], [-.22, .62, -.12]);
  },
  pl_chair(g, c, P) {
    for (const x of [-.26, .26]) { P(g, 'box', c, [.08, .46, .08], [x, .23, .26]); P(g, 'box', c, [.08, .98, .08], [x, .49, -.26]); }
    P(g, 'box', c, [.6, .07, .6], [0, .48, 0]); P(g, 'box', c, [.6, .1, .05], [0, .9, -.26]); P(g, 'box', c, [.6, .1, .05], [0, .7, -.26]);
  },
  pl_picnictable(g, c, P) {
    for (const x of [-.36, .36]) P(g, 'box', DARK, [.06, .6, .9], [x, .3, 0]);
    P(g, 'box', c, [1, .06, .5], [0, .62, 0]); P(g, 'box', RED, [.5, .065, .52], [0, .622, 0]);
    for (const z of [-.4, .4]) P(g, 'box', c, [1, .05, .18], [0, .34, z]);
  },
  pl_ford(g, c, P) {
    P(g, 'taper', c, [.2, .8, .16], [0, .4, 0]); P(g, 'rock', c, [.25, .12, .21], [0, .87, 0]); P(g, 'box', WATER, [.3, .08, .03], [0, .5, .15]);
    for (const x of [-.3, .3]) P(g, 'rock', STONE, [.2, .14, .2], [x, .12, .1]);
  },
  pl_tyreoak(g, c, P) {
    P(g, 'taper', WOOD, [.1, .52, .1], [0, .26, 0]); P(g, 'sph', c, [.36, .24, .36], [0, .72, 0]); P(g, 'sph', c, [.26, .2, .26], [-.24, .62, .1]); P(g, 'sph', c, [.26, .2, .26], [.24, .64, -.1]);
    P(g, 'box', WOOD, [.4, .045, .045], [.25, .42, 0]); P(g, 'box', ROPE, [.012, .26, .012], [.38, .28, 0]); P(g, 'cyl', 0x2a2a33, [.075, .035, .075], [.38, .11, 0], [HP, 0, 0]);
  },
  pl_beacon(g, c, P) {
    P(g, 'taper', c, [.2, .7, .2], [0, .35, 0]); P(g, 'cyl', RED, [.172, .1, .172], [0, .42, 0]); P(g, 'box', DARK, [.09, .14, .03], [0, .07, .195]);
    P(g, 'cyl', IRON, [.24, .04, .24], [0, .72, 0]); P(g, 'cyl', IRON, [.12, .1, .12], [0, .79, 0]);
    P(g, 'cone', 0xff7a26, [.11, .2, .11], [0, .9, 0]); P(g, 'cone', 0xffd23f, [.06, .14, .06], [0, .88, .0]);
  },
  pl_pinwheel(g, c, P) {
    P(g, 'cyl', CREAM, [.03, .75, .03], [0, .375, 0]); P(g, 'box', c, [.5, .13, .03], [0, .75, .04], [0, 0, Q]); P(g, 'box', 0xffd23f, [.5, .13, .03], [0, .75, .045], [0, 0, -Q]);
    P(g, 'sph', WHITE, [.05, .05, .05], [0, .75, .07]);
  },
};

// ===================== placing =====================
let M = null, HAB = '';
const mine = [];                                    // solids placed by this file (for keeping ground cover off them)
const skipped = [];                                 // things that fell outside their habitat or in water (see the note at the end of dress)
// put: one thing, kept only if it lands in the habitat being dressed. s = scale, rot = radians (left out = random), wet = allowed in shallow water.
function put(id, x, z, s = 1, rot, wet) {
  const w = M.water(x, z);
  if (M.biomeAt(x, z) !== HAB || w === 2 || (w === 1 && !wet)) { skipped.push(`${HAB}: ${id} (${x.toFixed(1)}, ${z.toFixed(1)}) -> ${M.biomeAt(x, z)}${w ? ' water ' + w : ''}`); return null; }
  const size = M.sizeOf(id) * s;
  if (size >= 0.5) mine.push({ x, z, r: size * 0.3 });
  return M.put(id, x, z, { rot: rot === undefined ? M.rand() * TAU : rot, scale: s });
}
const lerp = (a, b, t) => a + (b - a) * t;
const sAt = (s, t) => (Array.isArray(s) ? s[0] * Math.pow(s[1] / s[0], t) : s);            // [from, to] = grows smoothly along a row
function row(id, x1, z1, x2, z2, n, s = 1, rot, wet) { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; put(id, lerp(x1, x2, t), lerp(z1, z2, t), sAt(s, t), rot, wet); } }
function ring(id, x, z, r, n, s = 1, a0 = 0, inward = false) { for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; put(id, x + Math.cos(a) * r, z + Math.sin(a) * r, s, HP - a + (inward ? PI : 0)); } }
function grid(id, x, z, cols, rows, dx, dz, s = 1, rot) { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) put(id, x + i * dx, z + j * dz, typeof s === 'function' ? s(i, j) : s, rot); }
// blob: natural ground cover, random inside a circle, kept off solids, water and other habitats
function blob(id, x, z, r, n, s = 1) {
  const rad = M.sizeOf(id) * s * 0.35 + 0.25;
  for (let i = 0; i < n; i++) for (let t = 0; t < 20; t++) {
    const a = M.rand() * TAU, rr = r * Math.sqrt(M.rand()), px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr;
    if (M.biomeAt(px, pz) !== HAB || M.water(px, pz) || mine.some((o) => Math.hypot(px - o.x, pz - o.z) < o.r + rad)) continue;
    put(id, px, pz, s * (0.85 + M.rand() * 0.3)); break;
  }
}
const faceTo = (dx, dz) => Math.atan2(dx, dz);        // rotation that turns a thing's front (+z) towards (dx, dz)
const along = (dx, dz) => Math.atan2(-dz, dx);        // rotation that lays a long thing (long side = x) along (dx, dz)
// loc: a scene's own coordinates. L(id, right, front, scale, turn): turn is relative to the way the scene faces (left out = random).
const loc = (x, z, f = 0) => (id, right, front, s = 1, turn, wet) => put(id, x + right * Math.cos(f) + front * Math.sin(f), z - right * Math.sin(f) + front * Math.cos(f), s, turn === undefined ? undefined : f + turn, wet);

// ===================== WHISPERWOOD =====================
function forest() {
  HAB = 'forest';
  const tz = (x) => (x > -58 ? 0 : x > -76 ? (x + 58) * -4 / 18 : 4 - (-76 - x) * 4 / 42);       // the dirt trail's z at x

  // -- the way in: acorns that get bigger the deeper you go, and an avenue of young trees
  for (let i = 0; i < 9; i++) { const x = -51.5 - i * 2.6, s = 0.3 + i * 0.09; put('fo_acorn', x, tz(x) - 2.7, s); put('fo_acorn', x - 1, tz(x) + 2.7, s); }
  for (const x of [-62, -68, -74]) for (const d of [-6.5, 6.5]) put('sapling', x, tz(x) + d);

  // -- fairy rings: each a ring of toadstools round a bigger one
  const fairy = (x, z, r, n, s, cs) => { ring('fo_toadstool', x, z, r, n, s); put('fo_toadstool', x, z, cs); };
  fairy(-58, -9, 1.8, 7, 0.5, 1.5); fairy(-64, 13, 2.4, 8, 0.7, 2); fairy(-82, -5, 3.2, 10, 1.3, 4);

  // -- the scouts' camp on the sunny side of the grove
  { const L = loc(-88, 12.5);
    L('campfire', 0, 0); ring('cup', -88, 12.5, 1.3, 5);
    for (let i = 0; i < 5; i++) { const a = 0.5 + i * TAU / 5; put('fo_bedroll', -88 + Math.cos(a) * 2.8, 12.5 + Math.sin(a) * 2.8, i === 2 ? 2 : 1, HP - a); put('boot', -88 + Math.cos(a + 0.35) * 3.7, 12.5 + Math.sin(a + 0.35) * 3.7); }
    L('tent', -6, 3.5, 1, HP * 0.8); L('tent', 6, 4, 1, -HP * 0.8);
    L('fo_bunting', -7, -3.2); L('fo_bunting', 7, -3.2); L('fo_bunting', -7, 6.6); L('fo_bunting', 7, 6.6);
    L('sign', 0, 6.4, 1.3, PI); L('crate', 3.4, 6.2, 0.6);
  }
  // -- the treehouse (landmark at the grove), with bird boxes
  put('fo_treehouse', -91, -9, 1, 0); put('bucket', -89, -6.4); put('barrel', -93.6, -6.2); put('crate', -88.2, -8, 0.6);
  for (const [x, z] of [[-97, -6], [-85, -12.5], [-95, -14.5], [-99, 7.6], [-76.5, 13.5]]) put('fo_birdbox', x, z);

  // -- west along the trail: a hollow-log tunnel with pinecones rolled through it, then pinecones and totems in size order to the gorge mouth
  put('fo_hollow', -105, 8, 1, 0); row('fo_pinecone', -99.5, 8, -108.6, 8, 7, 0.7);
  for (const [x, z] of [[-103, 10.4], [-106.8, 10.2], [-104.6, 5.4], [-107.2, 5.8]]) put('fo_fern', x, z);
  for (const [x, z] of [[-102.2, 5.6], [-101.6, 10.2], [-108.6, 10.4]]) put('fo_toadstool', x, z);
  [[-110.8, 1], [-113, 1.5], [-115.2, 2.2], [-117.6, 3.2]].forEach(([x, s], i) => put('fo_pinecone', x, tz(x) + 5.6 + i * 0.4, s));
  [[-99, 0.5], [-102, 0.7], [-105.5, 1], [-109.5, 1.4], [-113, 2], [-116.6, 2.9]].forEach(([x, s]) => put('fo_totem', x, tz(x) - 4.6 - s * 0.6, s, 0));

  // -- the woodcutters: an elder tree they will not cut, stumps, log piles sorted by size, the sawmill
  put('fo_elder', -106, -25, 0.9); put('sign', -103.6, -22.6, 1, 0.5); put('fo_pinecone', -108.5, -21.5, 3.3); put('fo_acorn', -103, -27.4, 4);
  [[-108, 0.45], [-106.2, 0.6], [-104, 0.8], [-101.4, 1], [-98.4, 1.3], [-94.8, 1.7]].forEach(([x, s]) => put('fo_logpile', x, -37, s, HP));
  put('fo_sawpit', -99, -31, 1, 0); row('fo_duckboard', -94.4, -28.6, -94.4, -31.3, 4, 1, 0);
  for (const [x, z, s] of [[-100.6, -28.7, 0.6], [-99, -28.3, 1], [-97.3, -28.8, 1.5], [-101.8, -32.7, 2], [-96.6, -33, 0.8]]) put('fo_sawdust', x, z, s);
  for (const [x, z] of [[-104, -18], [-101, -18], [-98, -18], [-104, -15], [-101, -15]]) put('stump', x, z);
  put('fo_totem', -98, -15, 0.7, 0.4); put('log', -107, -16.5); put('log', -95.6, -17.2);

  // -- beehives in a row, honey for sale, and a trail of jars leading off to...
  row('fo_hive', -73, -19, -63, -17, 6, 1, 0); row('tonic', -72.6, -17.6, -63.4, -15.7, 6);
  put('table', -60.3, -16.4); for (const [x, z] of [[-60.9, -14.8], [-59.6, -14.9], [-58.8, -16.2]]) put('tonic', x, z); put('pot', -59.4, -18);
  row('tonic', -66.3, -13.6, -70.8, 12.6, 8);
  // -- ...a picnic the bears have raided (one small bear stayed)
  { const L = loc(-72, 17, 0.4);
    L('blanket', 0, 0, 1, 0); L('teddy', 0.1, 0.1, 1, 0.6); L('fo_basket', 1.5, -0.6, 1.4); L('fo_basket', -1.7, 1.2); L('fo_basket', 0.6, 2, 0.8);
    L('bread', -1.2, -1.3); L('bread', 2.3, 1.2); L('cake', -0.6, 1.5); L('cake', 1.2, -1.8); L('cup', -2.2, -0.2); L('cup', 2.6, -0.1);
    L('tonic', -2.7, 2.2); L('tonic', -3.3, 1.5); L('tonic', 1.9, 2.6); ring('apple', -72, 17, 3.3, 4);
  }
  // -- berry bushes with baskets
  for (let i = 0; i < 5; i++) { put('bush', -56 - i * 1.25, 8.5 + i * 2.7, 0.7); if (i < 4) put('fo_basket', -57.9 - i * 1.25, 9.4 + i * 2.7, i % 2 ? 1.3 : 1); }

  // -- two more elders: one ringed with giant toadstools, one that drops giant acorns
  put('fo_elder', -102, 24, 1.1); ring('fo_toadstool', -102, 24, 5.5, 7, 3, 0.3); put('fo_toadstool', -109, 30.5, 8);
  put('fo_elder', -78, 22, 0.85); put('fo_acorn', -75, 24.6, 2); put('fo_acorn', -80.6, 25.6, 3); put('fo_acorn', -76.4, 18.8, 4);

  // -- border with the farm: the orchard carries on into the wood, and a woodshed
  put('fa_appletree', -94, -45); put('fa_appletree', -98.2, -44.4); put('sapling', -96.6, -41.3, 0.43); put('fo_basket', -95.8, -43, 1.3); put('fa_ladder', -92.6, -43.6);
  put('shed', -77, -28, 1, 0); put('fo_logpile', -73.5, -27.4, 0.6, HP); put('fo_logpile', -71.9, -28.2, 0.9, HP); put('stump', -75, -24.4); put('log', -79.6, -24.4);
  put('fo_basket', -74, -30.6, 1.3); put('fence', -70, -30.6, 1, 0); put('fence', -70.2, -25.6, 1, 0);
  // -- border with the marsh: a duckboard path, mossy boulders in size order, ferns
  for (let i = 0; i < 6; i++) put('fo_duckboard', -86 + i * 0.6, 24 + i * 1.75, 1, along(0.55, 1.55));
  put('boot', -81.9, 35.2);
  [[-90, 29, 0.4], [-92.4, 30.4, 0.6], [-95.3, 31.5, 0.9], [-99, 33, 1.3], [-103.6, 34, 1.9]].forEach(([x, z, s]) => put('fo_mossrock', x, z, s));
  put('fo_mossrock', -84.3, 30.2, 0.5); put('fo_mossrock', -80.4, 27.6, 0.7);

  // -- trees: clumps with glades between (sapling 1.5 m, young 3.5, pine 6.5, oak 7.5)
  for (const [id, x, z, s] of [
    ['sapling', -54, -12, 0.43], ['sapling', -56.5, -14.5, 0.43], ['sapling', -55, -17.5, 1],
    ['tree', -80, -20, 1], ['tree', -83.5, -23, 1], ['oak', -79.5, -22.6, 1], ['sapling', -76.5, -20.4, 0.43], ['sapling', -82, -16.5, 1],
    ['tree', -92, -24, 1], ['tree', -88, -21, 1], ['sapling', -90, -26.5, 0.43],
    ['oak', -113, -15, 1], ['oak', -109, -12, 1], ['tree', -116, -18.5, 1], ['tree', -110.5, -18.5, 1],
    ['oak', -113, 18, 1], ['tree', -116, 22, 1], ['tree', -111, 14.5, 1], ['tree', -114, 26.5, 1], ['sapling', -110.5, 21, 1],
    ['tree', -68, 24.5, 1], ['sapling', -74, 30.5, 1], ['sapling', -70.5, 28.5, 0.43],
    ['tree', -98, -9.6, 1], ['tree', -101.5, -10.8, 1], ['tree', -106, -42, 1], ['tree', -103, -45.5, 1],
  ]) put(id, x, z, s);

  // -- ground cover
  blob('flower', -90, 1, 5, 5); blob('flower', -80, 6, 4, 3); blob('mushroom', -105, 13, 3, 3); blob('mushroom', -100, -24, 4, 3);
  blob('fo_pinecone', -90, -23, 3.5, 3, 0.4); blob('fo_fern', -88, 30, 4, 5); blob('fo_fern', -98, 36, 3, 4); blob('fo_fern', -72, 28, 3, 4);
  blob('fo_fern', -112, -24, 4, 3); blob('fo_fern', -84, -28, 3, 3);
}

// ===================== ECHO GORGE =====================
const RV = [[-150, -56], [-168, -18], [-166, 22], [-150, 56]];                 // the river's centre line through the gorge
// bank(z, d): the point d metres east (+) or west (-) of the river where it passes z. The sandy floor is about 5 to 8.5 m out on each side.
function bank(z, d) {
  let i = 0; while (i < RV.length - 2 && z > RV[i + 1][1]) i++;
  const [ax, az] = RV[i], [bx, bz] = RV[i + 1], t = (z - az) / (bz - az), len = Math.hypot(bx - ax, bz - az);
  return [lerp(ax, bx, t) + (bz - az) / len * d, z - (bx - ax) / len * d];
}
const flow = (z) => { let i = 0; while (i < RV.length - 2 && z > RV[i + 1][1]) i++; return along(RV[i + 1][0] - RV[i][0], RV[i + 1][1] - RV[i][1]); };
function gorge() {
  HAB = 'gorge';
  const B = (id, z, d, s, rot, wet) => put(id, ...bank(z, d), s, rot, wet);
  const cz = (x) => 2 * (-118 - x) / 42;                                         // the side canyon's centre line

  // -- the side canyon: mine rails and gold dropped along them, an ore cart at the end of the line
  for (let i = 0; i < 6; i++) { const x = -124.5 - i * 2; put('go_rail', x, cz(x) + 0.4, 1, 0); }
  put('go_orecart', -137.5, 1.4, 1, 0); put('go_orecart', -129, 4.2, 0.6);
  for (let i = 0; i < 10; i++) { const x = -140 - i * 1.9; put('coin', x, cz(x) + 0.5 + (i % 2 ? 0.7 : -0.7), 5); }
  for (const [x, d, s] of [[-131, -3, 0.3], [-142, -3.2, 0.25], [-148, 3.3, 0.35], [-153, -3.2, 0.45]]) put('go_geode', x, cz(x) + d + 0.5, s);

  // -- east bank, south of the canyon: kayaks and rafts pulled up in size order, with the hire shack's odds and ends
  [[10, 0.64], [13, 0.8], [16.5, 1], [20.5, 1.3], [27.5, 1.6], [33.5, 1.9]].forEach(([z, s]) => B('go_kayak', z, 6.3, s, 0.12));
  B('go_raft', 40, 6.3, 1, flow(40)); B('go_raft', 46.5, 6.4, 1.4, flow(46.5));
  B('sign', 7.2, 5.4, 1, -HP); for (let i = 0; i < 4; i++) B('boot', 7 + i * 0.7, 8.2, 1.2, HP);
  B('bucket', 11.5, 8.5); B('bucket', 18.5, 8.5); B('bucket', 30.6, 8.6); B('crate', 14.8, 8.3); B('crate', 24, 8.4); B('chair', 36.8, 8.2); B('barrel', 43.3, 8.3);
  // -- west bank opposite: the fishing camp. So far they have caught five boots.
  B('tent', 7.4, -7.3, 0.6, HP); B('campfire', 3.4, -7.2);
  for (const z of [-1, 1.2, 3.4]) { B('chair', z, -5.1, 1, HP); B('bucket', z + 1.1, -5.7); }
  [1, 1.4, 1.9, 2.6, 3.4].forEach((s, i) => B('boot', 10 + i * 1.15, -5.8, s, HP));
  B('crate', 5.2, -8.2); B('log', 0.8, -8.1, 0.8, 0);
  // -- stepping stones across the river
  for (const d of [-2.9, -1, 0.9, 2.8]) { B('boulder', 5.4, d, 0.4, undefined, true); B('boulder', -44, d, 0.45, undefined, true); }
  // -- the waterwheel mill (landmark) on the west bank, flour barrels beside it; river-smoothed boulders in size order going south
  B('go_waterwheel', 21, -6.2, 1, 0); B('barrel', 15.9, -7.4); B('barrel', 16.9, -6.2); B('crate', 26.2, -7.2); B('crate', 27.3, -6.2); B('barrel', 26.8, -8.2, 0.7);
  [[30.5, 0.2], [32.6, 0.28], [35.2, 0.4], [38.4, 0.56], [42.4, 0.8], [47.2, 1.1], [52.8, 1.5]].forEach(([z, s]) => B('boulder', z, -6.5, s));
  // -- the gold-panning sluice, north along the east bank
  B('go_sluice', -33, 6.5, 1, flow(-33)); B('sign', -27.6, 7.8, 1, -HP); B('bucket', -30, 8.2); B('bucket', -36.2, 8); B('bucket', -28.8, 5.6);
  for (const z of [-31.5, -33, -34.5]) B('pot', z, 4.9);
  { const [x, z] = bank(-38, 6.6); ring('coin', x, z, 0.8, 8, 6); put('coin', x, z, 8); }
  B('go_orecart', -40.2, 7.4, 0.6); B('barrel', -42.4, 6.8);

  // -- the falls (landmark): the river guardian stands in the water; a viewing platform and rainbow flags on the rim above
  B('go_guardian', -19, 0, 1, 0, true);
  put('go_platform', -155.4, -16.5, 1, -HP); put('bench', -152.6, -12.4, 1, -HP); put('sign', -155.8, -20.6, 1, -HP);
  for (const z of [-29, -25.5, -11.5, -8]) B('go_flagpole', z, 12.4, 1, HP); for (const z of [-22, -15]) B('go_flagpole', z, -13.6, 1, -HP);
  put('stall', -143, -12.4, 1, -HP); [[-16.6, 0.12], [-19, 0.17], [-22.2, 0.24]].forEach(([z, s]) => put('go_guardian', -142.6, z, s, -HP));   // souvenir guardians

  // -- rope-bridge towers facing each other across the gap (landmark pair)
  B('go_bridgetower', 11, 13, 1, -HP); B('barrel', 7.8, 13.8); B('crate', 14.3, 13.6, 1.5);
  B('go_bridgetower', 11, -15.5, 1, HP); B('barrel', 14.6, -16.4, 1.4); B('crate', 7.6, -16.4, 1.5); B('sign', 8.2, -13.6, 1.4, HP);

  // -- east terrace: the old mine, rails and ore carts
  put('go_minegate', -134, -26, 1, 0); row('go_rail', -134, -22.4, -134, -14.4, 5, 1, HP);
  put('go_orecart', -134, -17.2, 1.4, HP); put('go_orecart', -130.4, -21.4, 1); put('go_orecart', -138.6, -14.4, 2, 0.5);
  put('go_geode', -130, -16.4, 0.5); put('go_geode', -138.2, -20.8, 0.7); put('crate', -129.4, -25.4, 2); put('crate', -127.8, -23.4, 2.4);
  put('barrel', -139.4, -26, 1.5); put('lamp', -137.3, -23.4); put('lamp', -130.7, -23.4); put('sign', -136.6, -11.4, 1.5, 0);
  // -- the echo: the big horn on the west rim, and its echoes getting smaller across the east terrace
  put('go_horn', -181, -30, 1, HP); put('bench', -187, -27.4, 1, HP); put('bench', -187, -32.6, 1, HP);
  put('go_horn', -146, -34.5, 0.5, HP); put('go_horn', -139.5, -36, 0.25, HP); put('go_horn', -135.2, -37, 0.125, HP);
  // -- crystal geodes in a rising spiral
  [[-127, 14, 0.5], [-131, 21, 0.7], [-126, 27, 1], [-135, 30, 1.4], [-143, 23, 2], [-137, 11, 2.5]].forEach(([x, z, s]) => put('go_geode', x, z, s));
  // -- an old-growth stump the size of a house; somebody has moved in
  put('go_bigstump', -128, -44, 1, 0); put('mailbox', -123.4, -40.4, 1.4); put('bush', -125.6, -39.4); put('bush', -130.6, -39.6);
  put('fo_logpile', -134.4, -47, 1.3); put('fo_logpile', -137.4, -44.4, 1.7);

  // -- west plateau: the cliff-top campsite
  { const L = loc(-197, -4, HP);
    L('campfire', 0, 0, 2); for (const a of [0.6, 2.2, 3.9]) put('bench', -197 + Math.cos(a) * 3.7, -4 + Math.sin(a) * 3.7, 1, HP - a + PI);
    for (const [x, z, s] of [[-204, -9.5, 1], [-205.5, -3, 1], [-204, 3.6, 1], [-198.6, 9.6, 1.6], [-198.6, -14, 1.2]]) put('tent', x, z, s, faceTo(-197 - x, -4 - z));
    row('fo_bedroll', -193.6, -12.4, -188.2, -12.4, 4, 2.6, HP);
    put('crate', -190, 2, 2); put('crate', -188.9, 3.5, 2); put('crate', -191.4, 3.6, 2.6); put('barrel', -192.6, 6.6, 1.6); put('barrel', -190.6, 7.8, 1.9);
    put('lamp', -191, -6); put('lamp', -191, -1.4); put('log', -200.6, 1.8, 1.3); put('log', -196, -8.6, 1.5); put('fo_logpile', -201.6, 7, 1.4);
    put('fo_bunting', -186.4, -7.4, 1.5); put('fo_bunting', -186.4, 0.6, 1.5);
  }
  [[-186, -16, 0.7], [-184.6, -19.6, 1], [-183.2, -23.6, 1.4]].forEach(([x, z, s]) => put('boulder', x, z, s));
  // -- the hang-glider launch on the rim, a spare glider and a windsock
  put('go_glider', -178.5, 37, 1, HP); put('go_glider', -187, 42.4, 0.6); put('pl_windsock', -181, 44.8); put('crate', -184.6, 34.8, 2); put('crate', -186, 36.6, 2.4);
  // -- more house-sized stumps and big crystals out west
  put('go_bigstump', -201, 23, 1, HP); put('mailbox', -195.6, 20.8, 1.4); put('go_bigstump', -191, 60, 0.8, 0);
  put('go_geode', -205, -30, 2.5); put('go_geode', -193, -43, 1.8); put('go_geode', -200, -37, 1.2); put('go_geode', -203, 46, 2); put('go_geode', -197.6, 50, 1.4);
  put('bigrock', -208.6, -18); put('boulder', -205.6, -20.4, 1.5); put('boulder', -207.4, -14.6, 1);

  // -- trees on the plateaus, in clumps
  for (const [id, x, z] of [
    ['oak', -123, -33], ['tree', -121.6, -29], ['tree', -125.6, -30.4], ['oak', -124, 9.5], ['tree', -121.6, 12.6], ['tree', -138, 34], ['oak', -143, 35.6],
    ['oak', -116, -49], ['tree', -119.6, -52], ['tree', -114, -46],
    ['oak', -207, 9], ['oak', -208, 15], ['tree', -203.6, 13], ['tree', -188, 17], ['tree', -185.6, 21.6], ['tree', -190.6, 22.6],
    ['tree', -206, 52], ['oak', -205, 57], ['tree', -183, 64], ['oak', -177, 66.5], ['tree', -207, -40], ['oak', -209, -46],
  ]) put(id, x, z);

  // -- borders: a kite caught by the wind-bent pines (prairie side); an ore cart the forest has claimed (forest side)
  put('tree', -205, -52.4); put('pl_kite', -201.6, -52, 0.6); put('pl_pinwheel', -199, -50.4, 3); put('pl_pinwheel', -203.4, -49, 4);
  put('go_orecart', -123, -12, 1, 0.3); ring('fo_toadstool', -123, -12, 1.7, 6, 2, 0.4); put('fo_totem', -122.6, 17, 1.5, HP); put('go_geode', -124.6, 19.4, 0.5);
  put('fo_mossrock', -171, 64.6, 2); put('lamp', -168.6, 62.4, 0.8); put('fo_mossrock', -174.4, 62, 1.3);
}

// ===================== HONEYFIELD FARMS =====================
function farm() {
  HAB = 'farm';
  // -- the way in from the Green: cakes, then egg crates and apples along the trail to the barnyard, under festival bunting
  row('cupcake', -35.6, -37.3, -40.6, -41.1, 5); row('donut', -37.4, -41.6, -41.6, -45.6, 4);
  for (let i = 0; i < 6; i++) { const t = 2 + i * 2.6; put('fa_eggcrate', -42 - 0.618 * t - 2.4, -42 - 0.787 * t + 1.9, 1, 0.9); }
  for (let i = 0; i < 6; i++) { const t = 1.5 + i * 2.5; put('apple', -42 - 0.618 * t + 2.1, -42 - 0.787 * t - 1.6); }
  put('fo_bunting', -44.4, -38.8); put('fo_bunting', -39.2, -45); put('fo_bunting', -51.6, -47.6); put('fo_bunting', -46.6, -53.6);

  // -- field: cabbages in rows, each row bigger than the last
  grid('fa_cabbage', -42.5, -48.6, 5, 5, 2.6, -2.6, (i, j) => [0.6, 0.8, 1, 1.3, 1.7][j]);
  put('bucket', -44.4, -60.4); put('boot', -43.8, -57.6); put('boot', -44.1, -58.2); put('sign', -44.2, -53.4, 1, -HP);

  // -- the produce-judging table: trophies, the entries lined up by size, the tea table
  { const L = loc(-55, -36.5, 1.97);
    L('fa_judgetable', 0, 0, 1, 0); L('fa_trophy', 0, 1.7, 2); L('fa_trophy', -1, 1.5, 1.4); L('fa_trophy', 1, 1.5, 1);
    L('pumpkin', -3.4, 3.4); L('fa_pumpkin', -2.4, 3.4, 0.2, 0); L('fa_cabbage', -1.1, 3.4, 2.4); L('fa_pumpkin', 0.5, 3.5, 0.33, 0); L('fa_pumpkin', 2.6, 3.7, 0.47, 0);
    ['cupcake', 'donut', 'burger', 'cake', 'burger', 'donut', 'cupcake'].forEach((id, i) => L(id, -2.7 + i * 0.9, 5.2));
    L('table', 4.6, 0.4); L('cake', 4.6, 1.6); L('cake', 3.5, 0.2); L('cup', 5.6, 1.3); L('cup', 3.7, 1.5); L('bench', -4.6, 0.8, 1, HP);
    L('fo_bunting', -6, -2.2); L('fo_bunting', 6.4, -2.2); L('fo_bunting', -6, 6.6); L('fo_bunting', 6.4, 6.6);
  }
  // -- apple bobbing
  put('barrel', -58, -50); ring('apple', -58, -50, 1.1, 6); put('bucket', -59.7, -48.5); put('bucket', -56.4, -51.7);

  // -- the barnyard (landmark): barn, silo, churns in a row, coop with eggs but no chickens, trough, plough and cart
  put('fa_barn', -63.5, -67.2, 1, 0); put('fa_silo', -56, -69.3, 1, 0);
  row('fa_churn', -68, -60.9, -61, -60.9, 6, 1, 0);
  put('fa_coop', -70.4, -57.8, 1, HP); for (const [x, z] of [[-68.2, -57], [-68.2, -58.5], [-67.3, -57.7], [-68.5, -59.7]]) put('fa_eggcrate', x, z, 1, HP);
  put('fa_trough', -56.6, -61.4, 1, 0); put('fa_trough', -56.4, -63.6, 0.7, 0); put('bucket', -58.6, -62.2); put('bucket', -54.6, -62.6); put('bucket', -58.4, -59.6);
  put('fa_plough', -74.6, -62.4, 1, 0.4); put('cart', -75.2, -68.4, 1, HP); put('fa_bale', -72.8, -70.6, 1, 0.2); put('fa_bale', -74.2, -72, 1, 1.2);

  // -- field: pumpkins in rows; the prize pumpkin, second and third on the podium, and a trophy bigger than third place
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) put('pumpkin', -65.5 - i * 2.5, -54.3 + j * 3, [1, 1.3, 1.6, 2, 2.4][i]);
  put('fa_pumpkin', -71, -41.6, 1, 0); put('fa_pumpkin', -75, -43, 0.66, 0); put('fa_pumpkin', -67.3, -42.7, 0.47, 0); put('fa_trophy', -68.8, -39.4, 3, 0);

  // -- the duck pond: a tiny jetty, bread for the ducks, a bench; beehives and honey
  put('fo_duckboard', -78.8, -42.3, 2, 0, true); put('bread', -77.3, -41.5); put('bread', -77.6, -43.2); put('bread', -76.8, -42.4); put('bench', -74.6, -38.2, 1, -HP);
  for (const [x, z] of [[-81.6, -43.6], [-80.4, -41.6], [-83, -45], [-84.6, -44.2]]) put('lily', x, z, 1, undefined, true);
  row('fo_hive', -70, -36, -62.4, -35.2, 5, 1, 0); row('tonic', -69.6, -34.7, -62.8, -34, 6); for (const x of [-71.6, -61, -60.2]) put('pot', x, -36.2);

  // -- the orchard: trees in rows, ladders, baskets, windfalls
  for (const x of [-93, -87.5, -82]) for (const z of [-59, -54, -49.5]) put('fa_appletree', x, z);
  put('fa_ladder', -91.6, -58, 1, -1); put('fa_ladder', -86.1, -53.1, 1, -1); put('fa_ladder', -80.6, -48.6, 1, -1);
  for (const [x, z, s] of [[-94.2, -57.5, 1], [-88.7, -57.8, 1.4], [-88.6, -52.8, 1], [-83.2, -52.8, 1.4], [-83.3, -48, 1], [-91.8, -48.2, 1.8]]) put('fo_basket', x, z, s);
  ring('apple', -93, -54, 1.3, 4); ring('apple', -87.5, -49.5, 1.3, 4); ring('apple', -82, -59, 1.3, 4);

  // -- field: sunflowers, half a metre to four metres
  for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) put('fa_sunflower', -80.5 - i * 2.5, -76 + j * 3.4, [0.33, 0.55, 0.9, 1.5, 2.7][i], HP);
  // -- field: the scarecrow parade, smallest at the back
  { const sc = [0.33, 0.45, 0.6, 0.8, 1.1, 1.5, 2, 2.8], tt = [0, 0.08, 0.17, 0.27, 0.39, 0.54, 0.73, 1];
    sc.forEach((s, i) => put('fa_scarecrow', lerp(-64.5, -74.4, tt[i]), lerp(-81.6, -91.6, tt[i]), s, faceTo(-1, -1))); }
  // -- field: straw bales being stacked into a pyramid (the last one will not fit), round bales waiting, the cart
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4 - j; i++) put('fa_bale', -53.5 + (i - (3 - j) / 2) * 1.15, -85.4 - j * 0.85, 1, 0);
  put('fa_bale', -49.6, -90.6, 1.8, 0.5); put('fa_ladder', -53.5, -90.2, 1, 0); put('hay', -58.6, -90.4); put('hay', -58.6, -87.2); put('hay', -58.6, -84);
  put('cart', -48.8, -84.2, 1, 0.3); put('fa_bale', -47.4, -86.6, 1, 0.9); put('fa_bale', -50.8, -82, 1, 0.1);
  // -- field: the corn maze (two rows)
  row('fa_corn', -40.5, -92.4, -40.5, -86.4, 5); row('fa_corn', -37.5, -92.4, -37.5, -86.4, 5); put('sign', -39, -84.6, 1.2, 0); put('sign', -39, -94.4, 1.2, PI);

  // -- the farmhouse: washing on the line, boots on the step
  put('house', -36.5, -71.5, 1, -HP); put('fa_washline', -39, -64.4, 1, 0); put('fa_washline', -34.4, -63, 1, 0.2); put('bench', -42.2, -69.6, 1, -HP);
  row('pot', -41.6, -74.2, -41.6, -76.2, 3); put('mailbox', -44, -66.8); put('boot', -41.5, -71.6); put('boot', -41.3, -72.2);
  blob('flower', -43, -62.5, 2, 4);

  // -- border with the tundra: frost-nipped cabbages and a sledge of firewood
  grid('fa_frostcab', -56, -108.4, 3, 3, 3.4, 3, (i, j) => 1 + ((i + j) % 2) * 0.5);
  put('fa_sledge', -43, -101, 1, 0.5); put('log', -45.6, -99.4); put('log', -41, -98.6); put('log', -40.6, -102.4, 0.7); put('fo_logpile', -45.8, -103.2, 0.8);
  row('fence', -52, -97.2, -48.8, -97.2, 3, 1, 0); put('fa_scarecrow', -46.6, -106.6, 1.2, 2.6); put('fa_frostcab', -46.2, -105, 2.4);
  // -- border with the prairie: round bales, pinwheels
  put('hay', -99, -58); put('hay', -101.4, -60.6); put('hay', -98.6, -62.6); row('pl_pinwheel', -96.6, -64.4, -97.2, -69, 4, [0.8, 1.6], -HP);

  // -- fences in short runs with gaps
  row('fence', -62.2, -93.6, -62.2, -90.4, 3, 1, HP); row('fence', -77, -79.2, -73.8, -79.2, 3, 1, 0);
  row('fence', -45.2, -91, -45.2, -87.8, 3, 1, HP); row('fence', -79.2, -60, -79.2, -56.8, 3, 1, HP); row('fence', -60, -45.3, -56.8, -45.3, 3, 1, 0);
}

// ===================== WINDMILL PRAIRIE =====================
function plain() {
  HAB = 'plain';
  // -- the line of windmills along the ridge (landmark); an apprentice windmill; flour barrels and bales at each
  const mills = [[-134, -134], [-166, -100], [-104, -160], [-190, -76]];
  for (const [x, z] of mills) { put('windmill', x, z, 1, Q); put('barrel', x + 4.6, z + 1, 1.5); put('barrel', x + 5.2, z - 1.4, 1.2); put('crate', x + 3.4, z + 3.6, 2); }
  put('windmill', -160.4, -96.4, 0.25, Q); put('hay', -170.6, -96); put('hay', -128.6, -127.6);

  // -- pinwheel trails: from the farm to the ford, on to the balloons, then up to the windmill hill
  row('pl_pinwheel', -80, -97, -108, -97, 8, [0.6, 1.4], HP); row('pl_pinwheel', -128, -103, -142, -103.6, 5, [1.5, 2.6], HP);
  row('pl_pinwheel', -146.5, -112, -148, -126, 5, [2.6, 4], HP); put('pl_pinwheel', -154, -130.5, 6, HP); put('pl_pinwheel', -154, -137.5, 6, HP);
  // -- the ford: marker stones on both banks, stepping stones between
  put('pl_ford', -125.5, -102, 1, faceTo(1, 0.4)); put('pl_ford', -110.5, -96.5, 1, faceTo(-1, -0.4));
  for (let i = 0; i < 5; i++) put('boulder', lerp(-122.6, -113.4, i / 4), lerp(-101, -97.6, i / 4), 0.4, undefined, true);

  // -- the balloon field (landmark): one balloon up, one half inflated, spare baskets in size order, the ticket stall
  put('pl_balloon', -148, -104, 1, 0); ring('crate', -148, -104, 4.2, 4, 1.5, 0.4);
  put('pl_balloonflat', -141, -92, 1, 0.6); [[-152.6, -95.4, 3], [-150.4, -93.6, 4.5], [-147.6, -91.4, 6]].forEach(([x, z, s]) => put('fo_basket', x, z, s));
  put('stall', -155.6, -108.6, 1, faceTo(1, 0.6)); put('barrel', -137.4, -94.4, 1.6); put('barrel', -136.2, -96.4, 1.6); put('barrel', -138.6, -96.8, 2);
  put('fo_bunting', -156, -99, 1.5); put('fo_bunting', -140.4, -99.6, 1.5); put('fo_bunting', -152, -111.4, 1.5); put('fo_bunting', -141.6, -108.6, 1.5);
  put('pl_windsock', -144.6, -113.4); put('pl_windsock', -135.6, -88.6);

  // -- the kite field: kites and windsocks on tall poles, the flyers' blanket and spare kites
  for (const [x, z] of [[-126, -152], [-122, -156.4], [-117, -158.4], [-112.6, -154]]) put('pl_kite', x, z);
  put('pl_windsock', -119, -147.6); put('pl_windsock', -109, -150.4); put('pl_windsock', -129, -158);
  put('blanket', -118.4, -152.6, 1.5); for (const [x, z] of [[-120.4, -150.8], [-116.4, -151.4], [-117.4, -155], [-121, -154.4]]) put('pl_kite', x, z, 0.3);
  put('barrel', -115.4, -153.4, 0.7); put('barrel', -119.6, -156, 0.7); put('pl_kite', -166, -134, 1.2); put('pl_kite', -176, -92, 1.2); put('pl_kite', -96, -168, 1.2);

  // -- the giant picnic (the giant-version joke): blanket, table and chair, cup, cake, fruit, basket and a very large bear
  put('blanket', -166, -122, 6, 0.3); put('cup', -164, -123.6, 14); put('cake', -167.6, -120.4, 9); put('apple', -163.4, -119.6, 20); put('bread', -168.6, -124.4, 9);
  put('teddy', -165.4, -127.6, 8, 2.6); put('fo_basket', -172, -119.6, 9); put('pl_picnictable', -176, -111.6, 1.4, 0.4); put('pl_chair', -170, -110, 1, -1.1); put('pl_chair', -179, -119, 0.5, 0.8);
  // -- the lone oak with its tyre swing, acorns to match
  put('pl_tyreoak', -184, -102, 1, 0.8); put('bench', -180, -99.4, 1.3, faceTo(-1, -0.6)); put('fo_acorn', -187, -98.4, 2.8); put('fo_acorn', -181.4, -105.6, 4); put('fo_acorn', -186.6, -106, 5.6);
  // -- the beacon tower on the far coast, firewood stacked beside it
  put('pl_beacon', -152, -147, 1, faceTo(1, 1)); put('fo_logpile', -147.6, -150, 1.5); put('fo_logpile', -157, -141.6, 1.1); put('barrel', -155.4, -143.6, 1.6); put('crate', -150.6, -142.4, 2.2);

  // -- the wagon-train circle round its campfire (and one wagon that is only a toy)
  { const cx = -110, cz = -80;
    for (let i = 0; i < 5; i++) { const a = 0.3 + i * TAU / 5; put('pl_wagon', cx + Math.cos(a) * 8.5, cz + Math.sin(a) * 8.5, 1, Math.atan2(-Math.sin(a), Math.cos(a))); }
    put('campfire', cx, cz, 1.6); ring('log', cx, cz, 2.9, 4, 0.9, 0.6); ring('fo_bedroll', cx, cz, 5, 3, 2.4, 1.6);
    put('barrel', cx + 3.6, cz + 4.2, 1.3); put('barrel', cx + 4.8, cz + 3.2, 1.6); put('pot', cx - 1.6, cz + 1.2, 2); put('pot', cx - 0.4, cz + 1.9, 2.6); put('pl_wagon', cx - 4.4, cz - 3.4, 0.4);
  }
  // -- hay ricks standing in a row, small to huge
  [[-90, -106, 0.5], [-87, -109.6, 0.7], [-83.4, -113.2, 1], [-79, -117.2, 1.4], [-73.4, -121.8, 1.9]].forEach(([x, z, s]) => put('pl_rick', x, z, s, faceTo(-1, 0.4)));
  put('fa_bale', -92.6, -103.6, 1.4); put('fa_bale', -94.2, -105.4, 1.4); put('fa_ladder', -86, -106.4, 1.2);
  // -- burrow towns: mounds in rows (nobody home)
  grid('pl_mound', -128, -68.4, 4, 3, 3.6, 3.2, (i, j) => (i === 3 ? 1.7 : 1)); grid('pl_mound', -97, -150, 3, 3, 5, 5, (i, j) => 1.6 + i * 0.5);
  // -- the rodeo arena with nobody in it: fence arcs, barrels set out for a race, more barrels in size order, a boot left behind
  { const cx = -172, cz = -82;
    for (const a0 of [Q, 3 * Q, 5 * Q, 7 * Q]) for (const k of [-1, 0, 1]) { const a = a0 + k * 0.19; put('fence', cx + Math.cos(a) * 9.5, cz + Math.sin(a) * 9.5, 1.15, Math.atan2(-Math.cos(a), -Math.sin(a))); }
    put('barrel', cx, cz - 4.6, 1.5); put('barrel', cx - 4, cz + 2.4, 1.5); put('barrel', cx + 4, cz + 2.4, 1.5); put('boot', cx, cz, 4.4, 0.7);
    [[1, 0], [1.3, 1.5], [1.7, 3.3], [2.2, 5.6]].forEach(([s, d]) => put('barrel', -163 + d * 0.87, -93 + d * 0.5, s));
    for (const x of [-176.4, -172, -167.6]) put('bench', x, cz + 12.6, 1.5, PI); put('hay', -160, -78.4); put('hay', -160.2, -82.2); put('sign', -161.4, -86.4, 1.5, HP);
  }
  // -- borders: a scarecrow flying a kite among runaway sunflowers (farm side); a kayak turned flower bed (gorge side)
  put('fa_scarecrow', -104, -69, 1.5, faceTo(-1, -0.3)); put('pl_kite', -105.6, -67.4, 0.5); put('fa_sunflower', -102.4, -71.6, 2); put('fa_sunflower', -106.6, -71, 2.6); put('fa_sunflower', -103.6, -66.6, 1.6);
  put('go_kayak', -160, -66, 1.3, 0.4); ring('pl_wildflower', -160, -66, 1.9, 5, 2); put('sign', -157.6, -64, 1.2);

  // -- wildflower meadows
  blob('pl_wildflower', -152, -76, 9, 14, 1.4); blob('pl_wildflower', -127, -109, 6, 12, 1.4); blob('pl_wildflower', -100, -124, 6, 10); blob('pl_wildflower', -132, -160, 6, 10, 1.6);
  blob('pl_wildflower', -196, -88, 6, 10, 1.8); blob('pl_wildflower', -116, -172, 5, 8, 1.8); blob('pl_wildflower', -118, -90, 5, 8);
}

export function dress(m) {
  M = m; mine.length = 0; skipped.length = 0;
  forest(); gorge(); farm(); plain();
  if (globalThis.WEST_DEBUG && skipped.length) console.log('west.js left out:\n  ' + skipped.join('\n  '));
}
