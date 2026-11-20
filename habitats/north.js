// THE NORTH: Frostfall Tundra (tu_), Rimepeak (su_), Stormworks (wk_) and Thunder Crags (mt_).
// Every prop here is drawn from a few simple parts (SHAPES) and set out in little scenes (the functions below dress()).
import { PLACES } from '../map.js';

const SNOW = 0xffffff, ICE = 0xbfe6f5, ICE2 = 0x8fd0ea, WOOD = 0x8a5a2b, IRON = 0x4a4f57, STEEL = 0x9aa3ad, RED = 0xd9415f, YEL = 0xf1c935;
const BLUE = 0x4a9be8, GREEN = 0x57b65a, ORANGE = 0xf2903a, STONE = 0x8a8f96, GOLD = 0xd9a23a, DARK = 0x2a2f36, CREAM = 0xe8e4dc, COPPER = 0xc9743a;
const H = Math.PI / 2, PI = Math.PI;

export const ITEMS = [
  // ---- Frostfall Tundra
  { id: 'tu_snowball', name: 'Snowball', size: 0.22, shape: 'tu_snowball', colors: [0xffffff, 0xf3f7fb] },
  { id: 'tu_snowman2', name: 'Half-built Snowman', size: 0.9, shape: 'tu_snowman2', colors: [0xffffff], rad: 0.3 },
  { id: 'tu_snowman', name: 'Snowman', size: 1.6, shape: 'tu_snowman', colors: [0xffffff], rad: 0.3, mass: 0.8 },
  { id: 'tu_igloo', name: 'Igloo', size: 2.4, shape: 'tu_igloo', colors: [0xf3f7fb, 0xe4eef6], rad: 0.4, mass: 0.4 },
  { id: 'tu_iceblock', name: 'Ice Block', size: 0.45, shape: 'tu_iceblock', colors: [0xbfe6f5, 0x9fdcf0, 0xd6f1fa] },
  { id: 'tu_fishhole', name: 'Fishing Hole', size: 0.7, shape: 'tu_fishhole', colors: [0x1f4a6a], rad: 0.3, flat: true, mass: 0.3 },
  { id: 'tu_rod', name: 'Fishing Rod', size: 0.65, shape: 'tu_rod', colors: [0x8fb8d9, 0xd9a08f], rad: 0.25, mass: 0.4 },
  { id: 'tu_fish', name: 'Frozen Fish', size: 0.22, shape: 'tu_fish', colors: [0x8fb8d9, 0xd9a08f, 0xb8c8d0] },
  { id: 'tu_rack', name: 'Fish Drying Rack', size: 1.4, shape: 'tu_rack', colors: [0xd9a08f, 0xb8c8d0], rad: 0.3, mass: 0.4 },
  { id: 'tu_stick', name: 'Hockey Stick', size: 0.95, shape: 'tu_stick', colors: [0x8a5a2b, 0xd9415f, 0x4a9be8], rad: 0.3, flat: true, mass: 0.3 },
  { id: 'tu_puck', name: 'Puck', size: 0.1, shape: 'tu_puck', colors: [0x222222] },
  { id: 'tu_goal', name: 'Hockey Goal', size: 1.4, shape: 'tu_goal', colors: [0xd9415f], rad: 0.35, mass: 0.3 },
  { id: 'tu_curl', name: 'Curling Stone', size: 0.3, shape: 'tu_curl', colors: [0xd9415f, 0xf1c935] },
  { id: 'tu_sled', name: 'Sled', size: 0.95, shape: 'tu_sled', colors: [0xd9415f, 0x4a9be8, 0xf1c935, 0x57b65a], rad: 0.35, mass: 0.5 },
  { id: 'tu_dogsled', name: 'Dog Sled', size: 2.0, shape: 'tu_dogsled', colors: [0xa8743d], rad: 0.35, mass: 0.5 },
  { id: 'tu_lantern', name: 'Lantern', size: 0.45, shape: 'tu_lantern', colors: [0xffd86a, 0xffb347] },
  { id: 'tu_pine', name: 'Snowy Pine', size: 4.2, shape: 'tu_pine', colors: [0x2f7a45, 0x3f8a4a], rad: 0.12, mass: 0.1 },
  { id: 'tu_fort', name: 'Snow Fort', size: 2.0, shape: 'tu_fort', colors: [0xf3f7fb], rad: 0.35, mass: 0.6 },
  { id: 'tu_scarecrow', name: 'Frozen Scarecrow', size: 2.0, shape: 'tu_scarecrow', colors: [0x6a8fb8, 0xb86a6a], rad: 0.15, mass: 0.3 },
  { id: 'tu_plough', name: 'Snow Plough', size: 2.9, shape: 'tu_plough', colors: [0xf2903a], rad: 0.38, mass: 0.6 },
  { id: 'tu_salt', name: 'Salt Heap', size: 1.4, shape: 'tu_salt', colors: [0xe8e4dc, 0xf3ead7], rad: 0.4 },
  { id: 'tu_icepylon', name: 'Iced-up Pylon', size: 8.0, shape: 'wk_pylon', colors: [0xbfe6f5], rad: 0.1, mass: 0.1 },
  // ---- Rimepeak
  { id: 'su_tent', name: 'Expedition Tent', size: 2.9, shape: 'su_tent', colors: [0xf2903a, 0xf1c935, 0xd9415f], rad: 0.35, mass: 0.3 },
  { id: 'su_oxygen', name: 'Oxygen Bottle', size: 0.65, shape: 'su_oxygen', colors: [0xf1c935, 0x4a9be8, 0x57b65a], rad: 0.25 },
  { id: 'su_flagpole', name: 'Prayer-flag Pole', size: 2.9, shape: 'su_flagpole', colors: [0x8a5a2b], rad: 0.1, mass: 0.2 },
  { id: 'su_flag', name: 'Prayer Flag', size: 0.45, shape: 'su_flag', colors: [0x4a9be8, 0xffffff, 0xd9415f, 0x57b65a, 0xf1c935], rad: 0.2, mass: 0.4 },
  { id: 'su_cairn', name: 'Cairn', size: 0.95, shape: 'su_cairn', colors: [0x8a8f96, 0x9aa0a8], rad: 0.33 },
  { id: 'su_crystal', name: 'Ice Spire', size: 4.2, shape: 'su_crystal', colors: [0xbfe6f5, 0x9fdcf0, 0xa8c8ff], rad: 0.2, mass: 0.5 },
  { id: 'su_cave', name: 'Ice Cave', size: 6.0, shape: 'su_cave', colors: [0xdfeaf2], rad: 0.42, mass: 0.3 },
  { id: 'su_fossil', name: 'Frozen Mammoth', size: 8.7, shape: 'su_fossil', colors: [0xbfe6f5], rad: 0.4, mass: 0.5 },
  { id: 'su_shrine', name: 'Summit Observatory', size: 10, shape: 'su_shrine', colors: [0xd9a23a], rad: 0.4, mass: 0.1 },
  { id: 'su_beacon', name: 'Rimepeak Beacon', size: 12.5, shape: 'su_beacon', colors: [0xffe14a], rad: 0.12, mass: 0.15 },
  { id: 'su_avalanche', name: 'Avalanche Snowball', size: 2.0, shape: 'su_avalanche', colors: [0xffffff], rad: 0.4, mass: 0.8 },
  { id: 'su_axe', name: 'Ice Axe', size: 0.65, shape: 'su_axe', colors: [0x4a9be8, 0xd9415f, 0xf2903a], rad: 0.2, mass: 0.4 },
  { id: 'su_rope', name: 'Coil of Rope', size: 0.45, shape: 'su_rope', colors: [0xf2903a, 0x57b65a, 0xd9415f] },
  // ---- Stormworks
  { id: 'wk_fusebox', name: 'Fuse Box', size: 1.4, shape: 'wk_fusebox', colors: [0x7a9a8a, 0x9aa3ad], rad: 0.3, mass: 0.6 },
  { id: 'wk_drum', name: 'Cable Drum', size: 0.95, shape: 'wk_drum', colors: [0x222222, 0xf2903a, 0x4a9be8], rad: 0.35, mass: 0.7 },
  { id: 'wk_battery', name: 'Battery', size: 0.15, shape: 'wk_battery', colors: [0xd9415f, 0x57b65a, 0x4a9be8, 0xf2903a], rad: 0.25 },
  { id: 'wk_carbatt', name: 'Car Battery', size: 0.65, shape: 'wk_carbatt', colors: [0xd9415f, 0x4a9be8] },
  { id: 'wk_cone', name: 'Traffic Cone', size: 0.65, shape: 'wk_cone', colors: [0xf2743a], rad: 0.3, mass: 0.5 },
  { id: 'wk_toolbox', name: 'Toolbox', size: 0.45, shape: 'wk_toolbox', colors: [0xd9415f, 0x4a9be8] },
  { id: 'wk_hardhat', name: 'Hard Hat', size: 0.3, shape: 'wk_hardhat', colors: [0xf1c935, 0xffffff, 0xf2903a] },
  { id: 'wk_valve', name: 'Valve Wheel', size: 0.95, shape: 'wk_valve', colors: [0x8fa3b8, 0xb5653a], rad: 0.3, mass: 0.6 },
  { id: 'wk_pipe', name: 'Pipe', size: 2.9, shape: 'wk_pipe', colors: [0x8fa3b8, 0xb5653a], rad: 0.3, mass: 0.4 },
  { id: 'wk_scorchpipe', name: 'Scorched Pipe', size: 2.9, shape: 'wk_pipe', colors: [0x3a3432, 0x54433c], rad: 0.3, mass: 0.4 },
  { id: 'wk_lifering', name: 'Life Ring', size: 0.65, shape: 'wk_lifering', colors: [0xd9415f, 0xf2903a] },
  { id: 'wk_pylon', name: 'Pylon', size: 8.7, shape: 'wk_pylon', colors: [0x8f9499, 0x9aa3ad], rad: 0.1, mass: 0.1 },
  { id: 'wk_transformer', name: 'Transformer', size: 2.9, shape: 'wk_transformer', colors: [0x6a8f7a, 0x7a8f9a], rad: 0.35, mass: 0.6 },
  { id: 'wk_tesla', name: 'Tesla Coil', size: 6.0, shape: 'wk_tesla', colors: [0xbfe6ff], rad: 0.15, mass: 0.2 },
  { id: 'wk_dish', name: 'Satellite Dish', size: 4.2, shape: 'wk_dish', colors: [0xe8e4dc], rad: 0.25, mass: 0.25 },
  { id: 'wk_rod', name: 'Lightning Rod', size: 2.9, shape: 'wk_rod', colors: [0xd9a23a], rad: 0.1, mass: 0.2 },
  { id: 'wk_warnsign', name: 'Warning Sign', size: 1.4, shape: 'wk_warnsign', colors: [0xf1c935], rad: 0.15, mass: 0.3 },
  { id: 'wk_vent', name: 'Steam Vent', size: 2.0, shape: 'wk_vent', colors: [0x5a5450], rad: 0.4, mass: 0.6 },
  // ---- Thunder Crags
  { id: 'mt_rock', name: 'Crag Boulder', size: 0.95, shape: 'mt_rock', colors: [0x8a867c, 0x9a968c, 0x7a7670], rad: 0.4, mass: 0.8 },
  { id: 'mt_post', name: 'Bridge Post', size: 1.4, shape: 'mt_post', colors: [0x8a5a2b], rad: 0.2, mass: 0.4 },
  { id: 'mt_bell', name: 'Goat Bell', size: 0.45, shape: 'mt_bell', colors: [0xd9415f, 0x4a9be8, 0x57b65a], rad: 0.35 },
  { id: 'mt_station', name: 'Cable-car Station', size: 8.7, shape: 'mt_station', colors: [0xd9415f], rad: 0.4, mass: 0.1 },
  { id: 'mt_gondola', name: 'Gondola', size: 2.9, shape: 'mt_gondola', colors: [0xd9415f, 0xf1c935, 0x4a9be8], rad: 0.35, mass: 0.4 },
  { id: 'mt_deadtree', name: 'Lightning-struck Tree', size: 8.7, shape: 'mt_deadtree', colors: [0x4a4038], rad: 0.1, mass: 0.15 },
  { id: 'mt_stone', name: 'Standing Stone', size: 6.0, shape: 'mt_stone', colors: [0x7a7f86, 0x8a867c], rad: 0.2, mass: 0.6 },
  { id: 'mt_wall', name: 'Climbing Wall', size: 4.2, shape: 'mt_wall', colors: [0xc9a36a], rad: 0.3, mass: 0.3 },
  { id: 'mt_chalk', name: 'Chalk Bag', size: 0.32, shape: 'mt_chalk', colors: [0xd9415f, 0x4a9be8, 0x9b6ae6, 0x57b65a] },
  { id: 'mt_nest', name: 'Eagle Nest', size: 5.0, shape: 'mt_nest', colors: [0x7a5a3a], rad: 0.4, flat: true, mass: 0.2 },
  { id: 'mt_egg', name: 'Thunderbird Egg', size: 0.95, shape: 'mt_egg', colors: [0xf3ead7, 0xbfe6f5], rad: 0.35 },
  { id: 'mt_weather', name: 'Weather Mast', size: 4.2, shape: 'mt_weather', colors: [0xd9415f], rad: 0.1, mass: 0.2 },
];

export const SHAPES = {
  // ---------------- tundra ----------------
  tu_snowball(g, c, P) { P(g, 'sph', c, [.5, .5, .5], [0, .5, 0]); },
  tu_snowman2(g, c, P) {
    P(g, 'sph', c, [.42, .36, .42], [0, .36, 0]); P(g, 'sph', c, [.3, .28, .3], [0, .72, 0]);
    P(g, 'cone', ORANGE, [.05, .22, .05], [.2, .8, .26], [1.2, 0, -.6]);                    // the carrot, stuck in the wrong ball
  },
  tu_snowman(g, c, P) {
    P(g, 'sph', c, [.3, .28, .3], [0, .28, 0]); P(g, 'sph', c, [.21, .2, .21], [0, .64, 0]); P(g, 'sph', c, [.14, .14, .14], [0, .86, 0]);
    P(g, 'cone', ORANGE, [.03, .12, .03], [0, .86, .17], [H, 0, 0]);
    P(g, 'box', WOOD, [.9, .025, .025], [0, .66, 0], [0, 0, .12]);                          // twig arms
    P(g, 'cyl', RED, [.15, .05, .15], [0, .75, 0]);                                         // scarf
    P(g, 'sph', 0x222222, [.03, .03, .03], [0, .66, .2]); P(g, 'sph', 0x222222, [.03, .03, .03], [0, .56, .19]);
  },
  tu_igloo(g, c, P) {
    P(g, 'hemi', c, [.4, .42, .4], [0, 0, -.08]); P(g, 'box', c, [.26, .24, .3], [0, .12, .33]);
    P(g, 'box', 0x2a3a4a, [.16, .17, .02], [0, .085, .485]);
    P(g, 'cyl', ICE2, [.405, .025, .405], [0, .13, -.08]); P(g, 'cyl', ICE2, [.36, .025, .36], [0, .26, -.08]);
  },
  tu_iceblock(g, c, P) { P(g, 'box', c, [1, .6, .6], [0, .3, 0]); P(g, 'box', SNOW, [.9, .05, .5], [0, .61, 0]); },
  tu_fishhole(g, c, P) { P(g, 'cyl', 0xdfeaf2, [.5, .06, .5], [0, .03, 0]); P(g, 'cyl', c, [.36, .07, .36], [0, .04, 0]); },
  tu_rod(g, c, P) {
    P(g, 'box', WOOD, [.06, .42, .06], [-.15, .21, 0]); P(g, 'box', WOOD, [.9, .04, .04], [0, .5, 0], [0, 0, .5]);
    P(g, 'box', SNOW, [.015, .5, .015], [.39, .46, 0]); P(g, 'sph', c, [.1, .06, .04], [.39, .18, 0]);
  },
  tu_fish(g, c, P) {
    P(g, 'sph', c, [.4, .2, .12], [.1, .2, 0]); P(g, 'cone', c, [.18, .25, .06], [-.38, .2, 0], [0, 0, -H]);
    P(g, 'sph', 0x222222, [.03, .03, .03], [.36, .26, .09]);
  },
  tu_rack(g, c, P) {
    for (const x of [-.45, .45]) P(g, 'box', WOOD, [.06, .9, .06], [x, .45, 0]);
    P(g, 'box', WOOD, [1, .05, .05], [0, .88, 0]); P(g, 'box', WOOD, [1, .05, .05], [0, .5, 0]);
    for (const x of [-.3, -.1, .1, .3]) P(g, 'sph', x * 10 % 2 ? c : 0x8fb8d9, [.05, .14, .03], [x, .72, 0]);
  },
  tu_stick(g, c, P) { P(g, 'box', c, [.9, .05, .06], [-.05, .03, 0]); P(g, 'box', 0x222222, [.08, .05, .3], [.44, .03, .12]); },
  tu_puck(g, c, P) { P(g, 'cyl', c, [.5, .4, .5], [0, .2, 0]); },
  tu_goal(g, c, P) {
    P(g, 'box', c, [1, .05, .05], [0, .7, .2]); for (const x of [-.475, .475]) P(g, 'box', c, [.05, .7, .05], [x, .35, .2]);
    P(g, 'box', SNOW, [.95, .68, .03], [0, .33, -.02], [.55, 0, 0]);
  },
  tu_curl(g, c, P) { P(g, 'cyl', STONE, [.5, .45, .5], [0, .225, 0]); P(g, 'cyl', c, [.4, .12, .4], [0, .5, 0]); P(g, 'box', c, [.5, .1, .12], [0, .68, 0]); },
  tu_sled(g, c, P) {
    for (const x of [-.25, .25]) P(g, 'box', IRON, [.06, .08, 1], [x, .04, 0]);
    for (const z of [-.3, .3]) P(g, 'box', WOOD, [.5, .12, .06], [0, .12, z]);
    P(g, 'box', c, [.55, .07, .85], [0, .2, -.02]); P(g, 'box', c, [.55, .2, .06], [0, .29, .44], [-.5, 0, 0]);
  },
  tu_dogsled(g, c, P) {
    for (const x of [-.2, .2]) { P(g, 'box', WOOD, [.05, .06, 1], [x, .03, 0]); P(g, 'box', WOOD, [.04, .5, .04], [x, .35, -.42]); }
    P(g, 'box', c, [.42, .18, .7], [0, .2, -.05]); P(g, 'box', WOOD, [.46, .04, .04], [0, .6, -.42]);
    P(g, 'box', RED, [.3, .2, .25], [0, .39, .1]); P(g, 'box', BLUE, [.26, .18, .22], [0, .38, -.2]); P(g, 'box', YEL, [.2, .14, .2], [.02, .56, .08]);
  },
  tu_lantern(g, c, P) {
    P(g, 'box', IRON, [.5, .08, .5], [0, .04, 0]); P(g, 'box', c, [.4, .55, .4], [0, .36, 0]);
    P(g, 'pyr', IRON, [.36, .2, .36], [0, .74, 0], [0, PI / 4, 0]); P(g, 'box', IRON, [.07, .14, .07], [0, .9, 0]);
  },
  tu_pine(g, c, P) {
    P(g, 'cyl', WOOD, [.05, .3, .05], [0, .15, 0]); P(g, 'cone', c, [.3, .4, .3], [0, .4, 0]); P(g, 'cone', c, [.24, .36, .24], [0, .62, 0]);
    P(g, 'cone', SNOW, [.17, .3, .17], [0, .85, 0]); P(g, 'sph', SNOW, [.1, .05, .1], [.14, .42, .1]); P(g, 'sph', SNOW, [.09, .05, .09], [-.1, .64, -.06]);
  },
  tu_fort(g, c, P) {
    P(g, 'box', c, [.4, .45, .2], [0, .225, -.1]); P(g, 'box', c, [.36, .45, .2], [-.33, .225, .0], [0, .5, 0]); P(g, 'box', c, [.36, .45, .2], [.33, .225, .0], [0, -.5, 0]);
    for (const x of [-.13, .13]) P(g, 'box', c, [.13, .13, .2], [x, .51, -.1]);
    P(g, 'box', WOOD, [.025, .45, .025], [0, .76, -.1]); P(g, 'box', RED, [.2, .13, .015], [.1, .92, -.1]);
  },
  tu_scarecrow(g, c, P) {
    P(g, 'box', WOOD, [.06, .8, .06], [0, .4, 0]); P(g, 'box', WOOD, [.8, .05, .05], [0, .62, 0]); P(g, 'box', SNOW, [.8, .04, .07], [0, .665, 0]);
    P(g, 'box', c, [.3, .32, .14], [0, .55, 0]); P(g, 'sph', 0xe8d9a8, [.11, .11, .11], [0, .8, 0]); P(g, 'cone', 0x7a5a3a, [.17, .14, .17], [0, .93, 0]);
    for (const x of [-.32, .32]) P(g, 'cone', ICE2, [.03, .16, .03], [x, .52, 0], [PI, 0, 0]);
  },
  tu_plough(g, c, P) {
    P(g, 'box', c, [.5, .3, .55], [0, .3, -.15]); P(g, 'box', c, [.4, .25, .3], [0, .58, -.25]); P(g, 'box', ICE, [.36, .14, .02], [0, .6, -.09]);
    P(g, 'box', YEL, [.95, .32, .08], [0, .18, .3], [0, .3, 0]);
    for (const z of [-.3, 0]) P(g, 'cyl', 0x222222, [.11, .6, .11], [0, .11, z], [0, 0, H]);
    P(g, 'sph', 0xff5a3a, [.05, .05, .05], [0, .74, -.25]);
  },
  tu_salt(g, c, P) { P(g, 'cone', c, [.5, .6, .5], [0, .3, 0]); P(g, 'box', WOOD, [.035, .5, .035], [.3, .3, .2], [0, 0, -.4]); P(g, 'box', IRON, [.14, .14, .03], [.2, .08, .2], [0, 0, -.4]); },

  // ---------------- summit ----------------
  su_tent(g, c, P) {
    P(g, 'hemi', c, [.5, .42, .4], [0, 0, 0]); P(g, 'box', 0x333333, [.2, .25, .02], [0, .125, .39]);
    P(g, 'box', IRON, [.02, .3, .02], [0, .55, 0]); P(g, 'box', RED, [.14, .08, .012], [.07, .66, 0]);
    P(g, 'hemi', SNOW, [.3, .44, .25], [0, 0, -.1]);
  },
  su_oxygen(g, c, P) {
    P(g, 'cyl', c, [.2, .75, .2], [0, .375, 0]); P(g, 'hemi', c, [.2, .12, .2], [0, .75, 0]); P(g, 'cyl', IRON, [.07, .12, .07], [0, .92, 0]);
    P(g, 'cyl', SNOW, [.205, .12, .205], [0, .5, 0]);
  },
  su_flagpole(g, c, P) {
    P(g, 'cyl', c, [.025, 1, .025], [0, .5, 0]); P(g, 'rock', STONE, [.1, .07, .1], [0, .05, 0]);
    const cols = [BLUE, SNOW, RED, GREEN, YEL, BLUE];
    [-.42, -.28, -.14, .14, .28, .42].forEach((x, i) => P(g, 'box', cols[i], [.1, .1, .012], [x, .9 - Math.abs(x) * .6, 0]));
  },
  su_flag(g, c, P) { P(g, 'cyl', WOOD, [.03, 1, .03], [-.2, .5, 0]); P(g, 'box', c, [.5, .35, .02], [.07, .8, 0]); },
  su_cairn(g, c, P) {
    P(g, 'rock', c, [.45, .2, .45], [0, .2, 0]); P(g, 'rock', 0x9aa0a8, [.34, .17, .34], [.03, .5, 0]); P(g, 'rock', 0x7f858d, [.24, .13, .24], [-.02, .74, .02]);
    P(g, 'rock', c, [.14, .1, .14], [0, .9, 0]); P(g, 'sph', SNOW, [.1, .04, .1], [0, .97, 0]);
  },
  su_crystal(g, c, P) {
    P(g, 'hemi', 0xdfeaf2, [.36, .08, .36], [0, 0, 0]);
    P(g, 'pyr', c, [.17, 1, .17], [0, .5, 0], [0, .4, 0]); P(g, 'pyr', c, [.12, .62, .12], [.18, .29, .05], [0, .2, -.35]);
    P(g, 'pyr', ICE2, [.11, .52, .11], [-.17, .25, -.05], [0, .7, .4]); P(g, 'pyr', c, [.09, .4, .09], [.02, .2, .2], [.4, 0, 0]);
  },
  su_cave(g, c, P) {
    P(g, 'hemi', c, [.5, .62, .42], [0, 0, -.08]); P(g, 'hemi', 0x1f2a3a, [.28, .38, .3], [0, 0, .12]);
    P(g, 'rock', ICE, [.34, .08, .1], [0, .45, .3]);
    for (const [x, h] of [[-.14, .16], [0, .22], [.13, .14]]) P(g, 'cone', ICE2, [.035, h, .035], [x, .4 - h / 2, .36], [PI, 0, 0]);
    P(g, 'rock', SNOW, [.2, .12, .2], [-.3, .5, -.1]);
  },
  su_fossil(g, c, P) {
    P(g, 'box', c, [.9, .62, .5], [-.05, .31, 0]); P(g, 'box', SNOW, [.92, .06, .52], [-.05, .65, 0]);
    const fur = 0x8a5a3a;
    P(g, 'rock', fur, [.3, .22, .12], [-.05, .36, .24]); P(g, 'sph', fur, [.14, .15, .1], [.27, .44, .26]); P(g, 'box', fur, [.06, .32, .06], [.38, .26, .28]);
    for (const x of [-.22, .1]) P(g, 'box', fur, [.09, .22, .08], [x, .11, .27]);
    P(g, 'cone', 0xfff6dc, [.03, .3, .03], [.3, .3, .35], [0, 0, -2.2]);
  },
  su_shrine(g, c, P) {
    P(g, 'cyl', CREAM, [.4, .35, .4], [0, .175, 0]); P(g, 'box', 0xb9c2cc, [.2, .12, .2], [0, .06, .4]); P(g, 'cyl', RED, [.405, .05, .405], [0, .3, 0]);
    P(g, 'hemi', c, [.38, .3, .38], [0, .35, 0]); P(g, 'box', RED, [.12, .2, .02], [0, .22, .4]);
    P(g, 'cyl', 0xc8ccd4, [.05, .4, .05], [.12, .62, .12], [.8, 0, -.4]);
    P(g, 'cyl', c, [.02, .28, .02], [0, .78, 0]); P(g, 'sph', c, [.05, .05, .05], [0, .94, 0]);
  },
  su_beacon(g, c, P) {
    P(g, 'cyl', STONE, [.2, .06, .2], [0, .03, 0]); P(g, 'taper', CREAM, [.12, .68, .12], [0, .37, 0], [PI, 0, 0]); P(g, 'cyl', RED, [.115, .1, .115], [0, .3, 0]);
    P(g, 'cyl', RED, [.16, .04, .16], [0, .71, 0]); P(g, 'sph', c, [.13, .12, .13], [0, .83, 0]); P(g, 'cone', RED, [.12, .08, .12], [0, .96, 0]);
  },
  su_avalanche(g, c, P) {
    P(g, 'sph', c, [.5, .5, .5], [0, .5, 0]); P(g, 'rock', STONE, [.12, .1, .12], [.3, .78, .2]);
    P(g, 'box', RED, [.5, .04, .07], [-.2, .82, -.2], [.3, .5, .6]);                         // a ski
    P(g, 'box', 0x7a5a3a, [.1, .14, .16], [.05, .93, -.15]);                                // and a boot
    P(g, 'cone', 0x2f7a45, [.1, .25, .1], [-.36, .62, .3], [0, 0, .9]);
  },
  su_axe(g, c, P) {
    P(g, 'hemi', SNOW, [.22, .1, .22], [0, 0, 0]); P(g, 'box', c, [.07, .9, .07], [0, .45, 0], [0, 0, .12]); P(g, 'box', STEEL, [.6, .08, .06], [-.05, .9, 0]);
  },
  su_rope(g, c, P) { P(g, 'torus', c, [.5, .9, .5], [0, .18, 0]); P(g, 'torus', c, [.44, .9, .44], [0, .45, 0]); P(g, 'torus', c, [.38, .8, .38], [0, .7, 0]); },

  // ---------------- works ----------------
  wk_fusebox(g, c, P) {
    for (const x of [-.3, .3]) P(g, 'box', IRON, [.06, .35, .06], [x, .175, 0]);
    P(g, 'box', c, [.8, .6, .3], [0, .65, 0]); P(g, 'box', IRON, [.02, .5, .02], [0, .65, .155]); P(g, 'box', YEL, [.2, .2, .02], [-.2, .72, .155]);
    P(g, 'box', IRON, [.86, .05, .36], [0, .97, 0]);
  },
  wk_drum(g, c, P) {
    for (const z of [-.3, .3]) P(g, 'cyl', 0xb08a5a, [.5, .08, .5], [0, .5, z], [H, 0, 0]);
    P(g, 'cyl', c, [.3, .52, .3], [0, .5, 0], [H, 0, 0]); P(g, 'cyl', IRON, [.08, .7, .08], [0, .5, 0], [H, 0, 0]);
  },
  wk_battery(g, c, P) {
    P(g, 'cyl', c, [.25, .85, .25], [0, .425, 0]); P(g, 'cyl', GOLD, [.255, .16, .255], [0, .8, 0]); P(g, 'cyl', 0xc8ccd4, [.09, .1, .09], [0, .95, 0]);
  },
  wk_carbatt(g, c, P) {
    P(g, 'box', DARK, [1, .6, .6], [0, .3, 0]); P(g, 'box', c, [1, .1, .6], [0, .65, 0]); P(g, 'box', YEL, [.5, .25, .02], [0, .3, .305]);
    P(g, 'cyl', RED, [.07, .2, .07], [-.3, .8, 0]); P(g, 'cyl', BLUE, [.07, .2, .07], [.3, .8, 0]);
  },
  wk_cone(g, c, P) { P(g, 'box', 0x222222, [.8, .06, .8], [0, .03, 0]); P(g, 'cone', c, [.3, .94, .3], [0, .53, 0]); P(g, 'cyl', SNOW, [.175, .12, .175], [0, .5, 0]); },
  wk_toolbox(g, c, P) {
    P(g, 'box', c, [1, .45, .5], [0, .225, 0]); P(g, 'box', IRON, [1, .06, .52], [0, .47, 0]); P(g, 'box', IRON, [.4, .12, .06], [0, .58, 0]);
    for (const x of [-.3, .3]) P(g, 'box', YEL, [.08, .1, .02], [x, .4, .26]);
  },
  wk_hardhat(g, c, P) { P(g, 'cyl', c, [.5, .06, .5], [0, .03, 0]); P(g, 'hemi', c, [.42, .6, .42], [0, .05, 0]); P(g, 'box', c, [.1, .1, .8], [0, .62, 0]); },
  wk_valve(g, c, P) {
    P(g, 'cyl', c, [.18, .5, .18], [0, .25, 0]); P(g, 'cyl', IRON, [.26, .06, .26], [0, .5, 0]); P(g, 'cyl', IRON, [.04, .3, .04], [0, .65, 0]);
    P(g, 'torus', RED, [.45, .45, .45], [0, .82, 0]); P(g, 'box', RED, [.8, .04, .05], [0, .82, 0]); P(g, 'box', RED, [.05, .04, .8], [0, .82, 0]);
  },
  wk_pipe(g, c, P) {
    P(g, 'cyl', c, [.22, 1, .22], [0, .3, 0], [0, 0, H]);
    for (const x of [-.47, .47]) P(g, 'cyl', IRON, [.27, .05, .27], [x, .3, 0], [0, 0, H]);
    for (const x of [-.3, .3]) P(g, 'box', 0x9a9a9a, [.12, .1, .5], [x, .05, 0]);
  },
  wk_lifering(g, c, P) {
    P(g, 'torus', c, [.5, .5, .5], [0, .11, 0]);
    for (const [x, z] of [[.4, 0], [-.4, 0], [0, .4], [0, -.4]]) P(g, 'box', SNOW, [.22, .23, .22], [x, .11, z]);
  },
  wk_pylon(g, c, P) {
    P(g, 'box', c, [.04, 1, .04], [0, .5, 0]);
    P(g, 'box', c, [.035, .82, .035], [.09, .4, 0], [0, 0, .13]); P(g, 'box', c, [.035, .82, .035], [-.09, .4, 0], [0, 0, -.13]);
    P(g, 'box', c, [.035, .82, .035], [0, .4, .09], [-.13, 0, 0]); P(g, 'box', c, [.035, .82, .035], [0, .4, -.09], [.13, 0, 0]);
    P(g, 'box', c, [.6, .03, .04], [0, .7, 0]); P(g, 'box', c, [.42, .03, .04], [0, .87, 0]);
    for (const x of [-.28, .28]) P(g, 'cyl', ICE, [.022, .07, .022], [x, .65, 0]);
  },
  wk_transformer(g, c, P) {
    P(g, 'box', 0x9a9a9a, [.9, .06, .6], [0, .03, 0]); P(g, 'box', c, [.7, .6, .5], [0, .36, 0]);
    for (const x of [-.42, .42]) P(g, 'box', 0x4a5a52, [.1, .45, .44], [x, .33, 0]);
    for (const x of [-.2, 0, .2]) P(g, 'cyl', 0xd9c7a3, [.05, .3, .05], [x, .81, 0]);
  },
  wk_tesla(g, c, P) {
    P(g, 'box', IRON, [.4, .1, .4], [0, .05, 0]); P(g, 'cyl', COPPER, [.1, .6, .1], [0, .4, 0]);
    for (const y of [.25, .4, .55]) P(g, 'cyl', IRON, [.12, .03, .12], [0, y, 0]);
    P(g, 'torus', 0xc8ccd4, [.26, .3, .26], [0, .77, 0]); P(g, 'sph', c, [.12, .12, .12], [0, .87, 0]);
    P(g, 'box', YEL, [.03, .22, .03], [.2, .9, 0], [0, 0, -.8]);
  },
  wk_dish(g, c, P) {
    P(g, 'box', 0x9a9a9a, [.4, .06, .4], [0, .03, 0]); P(g, 'taper', STEEL, [.1, .5, .1], [0, .3, 0], [PI, 0, 0]);
    P(g, 'cone', c, [.45, .22, .45], [0, .62, 0], [PI + .5, 0, 0]);
    P(g, 'cyl', IRON, [.015, .25, .015], [0, .827, .113], [.5, 0, 0]); P(g, 'sph', RED, [.04, .04, .04], [0, .937, .173]);
  },
  wk_rod(g, c, P) {
    P(g, 'cyl', 0x9a9a9a, [.12, .08, .12], [0, .04, 0]); P(g, 'cyl', STEEL, [.03, .85, .03], [0, .47, 0]); P(g, 'sph', c, [.07, .07, .07], [0, .55, 0]);
    P(g, 'cone', c, [.04, .14, .04], [0, .93, 0]); P(g, 'torus', COPPER, [.16, .16, .16], [0, .12, 0]);
  },
  wk_warnsign(g, c, P) {
    P(g, 'box', IRON, [.06, .6, .06], [0, .3, 0]); P(g, 'box', c, [.44, .44, .04], [0, .68, 0], [0, 0, PI / 4]);
    P(g, 'box', 0x222222, [.07, .3, .05], [0, .68, 0], [0, 0, .35]);
  },
  wk_vent(g, c, P) {
    P(g, 'taper', c, [.45, .35, .45], [0, .175, 0], [PI, 0, 0]); P(g, 'cyl', IRON, [.33, .06, .33], [0, .33, 0]); P(g, 'cyl', 0xff7a26, [.22, .03, .22], [0, .36, 0]);
    P(g, 'sph', SNOW, [.18, .18, .18], [0, .55, 0]); P(g, 'sph', SNOW, [.14, .14, .14], [.08, .75, .03]); P(g, 'sph', SNOW, [.1, .1, .1], [-.03, .9, 0]);
  },

  // ---------------- mountain ----------------
  mt_rock(g, c, P) { P(g, 'rock', c, [.5, .47, .46], [0, .45, 0]); P(g, 'rock', 0x8a867c, [.28, .26, .28], [.24, .24, .22]); P(g, 'rock', 0x86a877, [.2, .06, .2], [-.08, .9, -.02]); },
  mt_post(g, c, P) {
    P(g, 'cyl', c, [.1, .95, .1], [0, .475, 0]); P(g, 'cone', 0x6a4a2b, [.12, .1, .12], [0, .95, 0]); P(g, 'torus', 0xd9c7a3, [.16, .25, .16], [0, .75, 0]);
    P(g, 'box', 0xd9c7a3, [.04, .3, .04], [.15, .6, 0]); P(g, 'box', 0xb08a5a, [.5, .05, .26], [.25, .3, 0]);
  },
  mt_bell(g, c, P) {
    P(g, 'taper', GOLD, [.4, .6, .4], [0, .3, 0], [PI, 0, 0]); P(g, 'sph', GOLD, [.1, .1, .1], [0, .64, 0]); P(g, 'box', c, [.9, .12, .2], [0, .78, 0]);
    P(g, 'sph', IRON, [.1, .1, .1], [0, .06, 0]);
  },
  mt_station(g, c, P) {
    P(g, 'box', 0x9a968c, [1, .15, .7], [0, .075, 0]); P(g, 'box', 0xd9c7a3, [.6, .4, .6], [-.15, .35, 0]); P(g, 'box', c, [.75, .08, .75], [-.1, .6, 0], [0, 0, .12]);
    P(g, 'box', DARK, [.02, .28, .4], [.155, .32, 0]); P(g, 'box', IRON, [.06, .9, .06], [.42, .45, 0]);
    P(g, 'cyl', YEL, [.16, .05, .16], [.42, .85, 0], [H, 0, 0]); P(g, 'box', IRON, [.5, .03, .03], [.22, .92, 0]);
  },
  mt_gondola(g, c, P) {
    P(g, 'box', IRON, [.6, .05, .4], [0, .025, 0]); P(g, 'box', c, [.7, .5, .5], [0, .3, 0]); P(g, 'box', ICE, [.72, .18, .52], [0, .4, 0]);
    P(g, 'box', CREAM, [.74, .05, .54], [0, .575, 0]); P(g, 'box', IRON, [.05, .36, .05], [0, .77, 0]); P(g, 'box', IRON, [.3, .06, .1], [0, .96, 0]);
  },
  mt_deadtree(g, c, P) {
    P(g, 'taper', c, [.09, .7, .09], [0, .35, 0], [PI, 0, 0]); P(g, 'cone', 0x2a2422, [.06, .22, .06], [.03, .8, 0], [0, 0, -.2]);
    P(g, 'box', c, [.04, .4, .04], [.16, .6, 0], [0, 0, -.9]); P(g, 'box', c, [.04, .36, .04], [-.14, .5, .02], [0, 0, 1]); P(g, 'box', c, [.04, .32, .04], [0, .68, .11], [.8, 0, 0]);
    P(g, 'box', c, [.04, .3, .04], [-.06, .84, 0], [0, 0, .3]); P(g, 'box', 0xffe14a, [.02, .42, .02], [0, .36, .075]);
  },
  mt_stone(g, c, P) { P(g, 'box', c, [.36, .94, .22], [0, .47, 0], [0, .1, 0]); P(g, 'rock', c, [.19, .07, .12], [0, .94, 0]); P(g, 'box', 0x7fe0ff, [.06, .3, .02], [.01, .6, .112], [0, .1, 0]); },
  mt_wall(g, c, P) {
    P(g, 'box', c, [.8, 1, .12], [0, .5, -.1], [.12, 0, 0]); P(g, 'box', IRON, [.06, .9, .06], [0, .43, -.3], [-.3, 0, 0]); P(g, 'box', BLUE, [.8, .06, .4], [0, .03, .25]);
    const holds = [[-.25, .2, RED], [.1, .35, YEL], [-.1, .55, GREEN], [.25, .65, 0xff8fb1], [0, .82, BLUE]];
    for (const [x, y, col] of holds) P(g, 'sph', col, [.045, .045, .045], [x, y, -.035 + (y - .5) * .12]);
  },
  mt_chalk(g, c, P) { P(g, 'cyl', c, [.36, .7, .36], [0, .35, 0]); P(g, 'sph', SNOW, [.32, .16, .32], [0, .72, 0]); P(g, 'torus', IRON, [.2, .3, .2], [.3, .6, 0], [H, 0, 0]); },
  mt_nest(g, c, P) {
    P(g, 'cyl', 0x9a7a4a, [.4, .05, .4], [0, .025, 0]); P(g, 'torus', c, [.5, .45, .5], [0, .08, 0]);
    for (let i = 0; i < 4; i++) P(g, 'box', WOOD, [.5, .03, .04], [Math.cos(i * 1.6) * .3, .13, Math.sin(i * 1.6) * .3], [0, i * 1.6 + 1.3, .1]);
  },
  mt_egg(g, c, P) { P(g, 'sph', c, [.38, .5, .38], [0, .5, 0]); P(g, 'sph', 0x7a6a5a, [.07, .07, .03], [.1, .6, .35]); P(g, 'sph', 0x7a6a5a, [.05, .05, .03], [-.14, .4, .34]); P(g, 'sph', 0x7a6a5a, [.03, .06, .06], [.36, .45, .05]); },
  mt_weather(g, c, P) {
    P(g, 'box', 0x9a9a9a, [.2, .06, .2], [0, .03, 0]); P(g, 'cyl', STEEL, [.025, 1, .025], [0, .5, 0]);
    P(g, 'box', IRON, [.5, .02, .03], [0, .92, 0]); P(g, 'box', IRON, [.03, .02, .5], [0, .92, 0]);
    for (const [x, z] of [[.25, 0], [-.25, 0], [0, .25], [0, -.25]]) P(g, 'sph', c, [.06, .06, .06], [x, .92, z]);
    P(g, 'box', YEL, [.3, .1, .02], [.1, .7, 0]);
  },
};

// ===================== scenes =====================
// A scene is built round a point: s(id, east, south, { rot, scale }) puts a thing so many metres east / south of it.
const scene = (m, x, z) => (id, dx, dz, opt) => m.put(id, x + dx, z + dz, opt || {});
// A point on a stepped cone: r metres from its middle, a degrees clockwise from north.
const onCone = (p, r, a) => [p[0] + r * Math.sin(a * PI / 180), p[1] - r * Math.cos(a * PI / 180)];
const TAU = PI * 2;

// ---------------------------------------------------------------- FROSTFALL TUNDRA
function tundraTrail(m) {            // snowballs that grow as they roll up the trail to the lake, between pairs of lanterns
  m.row('tu_snowball', 0.6, -52.5, 0, -57.5, 6, { scale: 0.45 });
  m.row('tu_snowball', -0.4, -59.5, -3, -67.5, 6, { scale: 0.7 });
  m.row('tu_snowball', -3.6, -69.5, -5.8, -76, 5);
  m.row('tu_snowball', -6.6, -77.6, -9, -81, 3, { scale: 1.5 });
  for (const [x, z] of [[-0.7, -60], [-3, -67], [-5.3, -74]]) { m.put('tu_lantern', x - 2.4, z - 0.6); m.put('tu_lantern', x + 2.4, z + 0.6); }
}
function snowmanLadder(m) {          // one joke told in a row: from a snowball to a six-metre snowman
  m.put('tu_snowball', -8, -57); m.put('tu_snowball', -9, -58.8, { scale: 2 }); m.put('tu_snowball', -10, -60.8, { scale: 3 });
  m.put('tu_snowman2', -11, -63, { rot: 0.4 }); m.put('tu_snowman2', -12.2, -65.6, { rot: 0.2, scale: 1.5 });
  m.put('tu_snowman', -13.4, -68.4, { rot: 0.3 }); m.put('tu_snowman', -15, -71.6, { rot: 0.3, scale: 1.6 });
  m.put('tu_snowman', -17.5, -76.3, { rot: 0.4, scale: 3.75 });
  m.put('bucket', -9.6, -62.6); m.put('bucket', -14.8, -67.6); m.row('tu_snowball', -6.6, -58.4, -9.2, -64.6, 5, { scale: 0.7 });
}
function snowballFight(m) {          // two forts, an ammunition stack behind each, and a volley hanging between them
  const s = scene(m, 14, -64);
  s('tu_fort', -5, 0, { rot: -H }); s('tu_fort', 5, 0, { rot: H });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { s('tu_snowball', -7 + i * 0.3, -0.3 + j * 0.3); s('tu_snowball', 6.4 + i * 0.3, -0.3 + j * 0.3); }
  for (let i = 0; i < 7; i++) s('tu_snowball', -3 + i, Math.sin(i * 1.1) * 0.6, { scale: 0.7 });
  for (let i = 0; i < 6; i++) s('tu_snowball', -2.5 + i, 1.6 + Math.cos(i * 1.7) * 0.5, { scale: 0.45 });
  s('tu_snowman2', -6.6, 2.4, { rot: H }); s('tu_snowman', 7.4, -2.6, { rot: -H }); s('bucket', 6.4, 2);
  s('tu_sled', -6.8, -2.4, { rot: 0.5 }); s('boot', 0.4, -1.6, { rot: 1 }); s('boot', 1.5, 2.6, { rot: 2 });
}
function sledRun(m) {                // three tracks down off the high snow, and the pile-up where they all met
  for (const [x, n] of [[14, 7], [17, 8], [20, 7]]) m.row('tu_snowball', x, -101, x + 1, -87.5, n, { scale: 0.7 });
  m.put('tu_sled', 14.3, -97, { rot: 0.1 }); m.put('tu_sled', 17.5, -93.4, { rot: 0.05 }); m.put('tu_sled', 20.4, -98.4, { rot: 0.1 }); m.put('tu_sled', 14.9, -89.6, { rot: 0.2 });
  const s = scene(m, 18, -84);
  s('tu_sled', -0.9, 0, { rot: 1.2 }); s('tu_sled', 0.2, -0.9, { rot: 0.3 }); s('tu_sled', 1.1, 0.2, { rot: 2.4 }); s('tu_sled', 0, 1, { rot: 4 }); s('tu_sled', -1.6, 1.4, { rot: 5.2, scale: 1.5 });
  s('tu_snowman2', 0.2, 2.6, { rot: 0.3 }); s('boot', 1.9, -0.9); s('boot', -2, -0.4, { rot: 2 }); s('boot', 1.4, 1.6, { rot: 4 });
  s('hay', -2.4, 4.4, { rot: H }); s('hay', 1.6, 4.6, { rot: H });
}
function frozenLake(m) {             // PLACES.frozenLake: hockey abandoned mid-match, a curling lane, and ice fishing at the east end
  const [lx, lz] = PLACES.frozenLake, s = scene(m, lx, lz);
  // hockey
  s('tu_goal', -11, 0, { rot: H }); s('tu_goal', 1, 0, { rot: -H }); s('tu_snowman2', -0.3, 0, { rot: -H });        // the only goalie who stayed
  const sticks = [[-8, -1.5, 0.4], [-6, 1.5, 2], [-4, -1, 3.4], [-2.5, 1, 5], [-5, -3, 1.2], [-1.6, -2, 4.2]];
  for (const [x, z, r] of sticks) s('tu_stick', x, z, { rot: r });
  for (const [x, z] of [[-5, 0], [-6.5, -0.6], [-3, 2], [-10.6, -0.2], [-7, -3], [-2, -0.4]]) s('tu_puck', x, z);
  s('bench', -5, 4.6, { rot: PI }); for (let i = 0; i < 4; i++) s('cup', -5.9 + i * 0.6, 3.6); s('tonic', -3.4, 4.3); s('tonic', -6.8, 4.4);
  // curling: three stones waiting, one on its way, the rest crowded round the button
  for (let i = 0; i < 3; i++) s('tu_curl', -8 + i * 0.6, -7.2);
  s('tu_curl', -1, -6.8); for (let i = 0; i < 5; i++) s('tu_curl', 6 + Math.cos(i * 1.257) * 0.9, -7 + Math.sin(i * 1.257) * 0.9); s('tu_curl', 6, -7);
  s('tu_curl', 9.2, -6.6, { scale: 3 }); m.row('tu_puck', lx - 6, lz - 6.6, lx + 3.6, lz - 6.6, 5);
  // ice fishing
  const holes = [[9.5, 3.5], [11.5, -0.5], [8.2, -3], [6.2, 0.8]];
  holes.forEach(([x, z], i) => {
    s('tu_fishhole', x, z); s('bucket', x + 0.95, z + 0.35); s('tu_rod', x + 0.3, z - 0.75, { rot: i });
    s('tu_fish', x - 0.7, z + 0.4, { rot: 1 }); s('tu_fish', x - 0.95, z + 0.05, { rot: 2.2 }); if (i % 2) s('tu_lantern', x + 0.9, z - 0.7); else s('tu_fish', x - 0.6, z + 0.75, { rot: 4 });
  });
  s('tu_fish', 4.7, 1.2, { rot: 0.6, scale: 4.3 });                                         // the one that did not get away
  s('cup', 10.6, 4); s('cup', 12.4, 0.1);
}
function iglooVillage(m) {           // igloos of three sizes round a fire, fish racks, the ice quarry, and a dog sled with no dogs
  const s = scene(m, 0, -110);
  s('tu_igloo', 0, -2.5, { scale: 1.9 }); s('tu_igloo', -9, 1.6, { rot: 0.5 }); s('tu_igloo', 9, 1, { rot: -0.5 });
  s('tu_igloo', -4.6, 5.4, { rot: 0.3, scale: 0.6 }); s('tu_igloo', 5.2, 5.2, { rot: -0.3, scale: 0.6 });
  for (const [x, z] of [[-1.4, 0.6], [1.4, 0.6], [-8.6, 3.6], [-7, 3], [8.4, 3], [7, 2.6], [-3.8, 6.6], [4.4, 6.4]]) s('tu_lantern', x, z);
  s('campfire', 0, 3.6); s('log', -2, 4.2, { rot: 0.4 }); s('log', 2, 4.2, { rot: -0.4 });
  for (const [x, z, r] of [[-13.5, 5.6, 0.2], [-15.5, 3, 0.5], [-14, 0, 0.1]]) { s('tu_rack', x, z, { rot: r }); s('tu_fish', x - 0.5, z + 0.9, { rot: 1 }); s('tu_fish', x + 0.3, z + 1.1, { rot: 2 }); s('tu_fish', x + 0.9, z + 0.8, { rot: 3 }); }
  s('bucket', -12.2, 3.2); s('barrel', -16.6, 5.8);
  // the quarry: blocks cut small and stacked ever bigger
  const q = scene(m, 13, -116);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) q('tu_iceblock', i * 0.65, j * 0.5);
  for (let i = 0; i < 4; i++) q('tu_iceblock', i * 1.25, 2.6, { scale: 2 });
  for (let i = 0; i < 3; i++) q('tu_iceblock', 5.2, i * 1.6 - 0.4, { scale: 3, rot: H });
  q('tu_iceblock', 8, 0, { scale: 4.4, rot: H }); q('tu_iceblock', 8, 2.6, { scale: 4.4, rot: H });
  q('su_axe', -0.9, 1); q('su_axe', 3.2, 1.3, { rot: 2 }); q('tu_sled', 1.4, 4.4, { rot: H });
  // the dog sled: its parcels fell off one by one, back toward the lake
  m.put('tu_dogsled', 3, -100.6, { rot: H });
  [[1, -100.7], [-0.3, -100.3], [-1.7, -100.8], [-3.1, -100.4], [-4.6, -100.7], [-6, -100.2]].forEach(([x, z], i) => m.put('crate', x, z, { rot: i, scale: 0.55 }));
}
function tundraPines(m) {
  const P = [[-30, -113, 1], [-27, -116, 1.3], [-33, -116.4, 0.8], [-12, -117, 1.2], [-8, -116.4, 0.7], [24, -116.5, 1.1], [28, -113.8, 0.8], [31, -116.8, 1.4],
    [-38, -110, 0.9], [-36, -113.4, 1.2], [22, -57.5, 0.6], [25, -77.5, 0.9], [-21, -71, 0.7], [-24.5, -84, 1], [8, -78, 0.5], [34, -110, 1]];
  for (const [x, z, sc] of P) m.put('tu_pine', x, z, { scale: sc });
}
function tundraBorders(m) {
  // farm side: the last field of the farm, frozen solid
  let s = scene(m, -20, -63.5);
  s('tu_scarecrow', 0, 0, { rot: H }); s('hay', -0.6, 3.2, { rot: 0.3 }); s('hay', 1.8, 2.4, { rot: 1.2 }); s('hay', -0.4, -2.9, { rot: 0.8 });
  for (let i = 0; i < 4; i++) s('crop', 2.6, -2.4 + i * 1.3); for (let i = 0; i < 3; i++) s('tu_snowball', 0.6 + i * 0.5, 1 + i * 0.2, { scale: 2 });
  s('fence', -1.4, 5.4, { rot: H }); s('fence', 0.4, 5.4, { rot: H });
  s = scene(m, -33, -104.5);
  s('tu_scarecrow', 0, 0, { rot: 1, scale: 1.4 }); s('hay', 2.6, 0.6); s('hay', 2.2, -2.2, { rot: 1 }); s('tu_snowman2', -2, 1.2, { rot: 1 });
  for (let i = 0; i < 3; i++) s('fence', -1.6 + i * 1.6, 3, { rot: H }); s('pumpkin', 1, 1.6); s('pumpkin', 0.4, 2);
  // works side: the plough gave up here; salt heaps, a coned-off road and a pylon iced to the top
  s = scene(m, 33, -97);
  s('tu_plough', 0, 0, { rot: -H }); s('tu_salt', -3, 4.6); s('tu_salt', -0.4, 5.6, { scale: 1.5 }); s('tu_salt', 2.4, 4.4, { scale: 0.6 });
  for (let i = 0; i < 5; i++) s('wk_cone', -3.4, -2.6 + i * 1.2, { scale: 0.5 });
  s('tu_icepylon', 4.5, -8.5, { rot: 0.5 }); for (let i = 0; i < 4; i++) s('tu_iceblock', 4.5 + Math.cos(i * 1.57 + 0.4) * 1.5, -8.5 + Math.sin(i * 1.57 + 0.4) * 1.5, { scale: 2, rot: i });
  s('wk_warnsign', 1.6, -5.6, { rot: -H });
  s = scene(m, 22.5, -72);
  s('tu_salt', 0, 0, { scale: 0.6 }); s('wk_warnsign', 1.8, 0.8, { rot: -H }); for (let i = 0; i < 4; i++) s('wk_cone', -1.5 + i, 2, { scale: 0.5 });
  s('tu_iceblock', -1.4, -0.6, { rot: 1 }); s('tu_iceblock', -0.9, -1.2, { rot: 0.3 }); s('wk_drum', 1.4, -1.6, { scale: 0.47, rot: 1 });
}
function tundra(m) {
  tundraTrail(m); snowmanLadder(m); snowballFight(m); sledRun(m); frozenLake(m); iglooVillage(m); tundraPines(m); tundraBorders(m);
  // drifts: lumps of snow, bigger the farther out
  m.blob('tu_snowball', 12, -55, 5, 8, { scale: 0.45 }); m.blob('tu_snowball', -14, -54, 4, 6, { scale: 0.45 });
  m.blob('tu_snowball', 4, -72, 5, 8, { scale: 0.7 }); m.blob('tu_snowball', 26, -106, 6, 7, { scale: 3 }); m.blob('tu_snowball', -22, -108, 6, 7, { scale: 3 });
  m.blob('tu_snowball', 8, -94, 4, 6, { scale: 2 });
}

// ---------------------------------------------------------------- RIMEPEAK
function baseCamp(m) {               // tents round a fire, the oxygen dump, crates, and a line of prayer flags between two poles
  const s = scene(m, -26, -130.5);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; s('su_tent', Math.cos(a) * 5.6, Math.sin(a) * 4.6, { rot: -a - H }); }
  s('campfire', 0, 0); s('log', 1.6, 1, { rot: 1 }); s('log', -1.7, 0.6, { rot: 2 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) s('su_oxygen', -9.4 + i * 0.6, -2 + j * 0.6);
  for (let i = 0; i < 4; i++) s('su_oxygen', -9.6 + i * 1.3, 0.6, { scale: 2.2 });
  s('crate', 8.6, -1.6, { scale: 2.4 }); s('crate', 10.2, -1.2, { scale: 2.4, rot: 0.4 }); s('crate', 9.2, 0.2, { scale: 2.4, rot: 1 }); s('crate', 11, 0.6, { scale: 1.6 });
  s('barrel', 8.4, 2); s('barrel', 9.5, 2.6); for (let i = 0; i < 4; i++) s('su_axe', 2.4 + i * 0.7, -2.2, { rot: i }); for (let i = 0; i < 3; i++) s('su_rope', -2.6 - i * 0.6, -2);
  s('su_flagpole', -8, -4.6); s('su_flagpole', 8, -4.6); for (let i = 0; i < 9; i++) s('su_flag', -6.4 + i * 1.6, -4.6, { scale: 1.5 });
}
function cairnTrail(m) {             // cairns that grow, leading from the edge of the tundra up to the observatory
  const pk = PLACES.peak;
  const C = [[4, -126, 1], [10, -128, 1.5], [16, -130.5, 2.1], [22.5, -133.5, 3.05], [29, -141.5, 4.4]];
  for (const [x, z, sc] of C) m.put('su_cairn', x, z, { scale: sc });
  const [x, z] = onCone(pk, 44, 135); m.put('su_cairn', x, z, { scale: 6.3 });
  m.row('su_flag', 5.6, -126.6, 8.6, -127.6, 3, { scale: 1.5 }); m.row('su_flag', 12, -128.8, 14.4, -129.8, 3, { scale: 2 }); m.row('su_flag', 18.4, -131.4, 20.6, -132.4, 2, { scale: 3 });
}
function avalanche(m) {              // it came off the east face: the farther the snowballs rolled the bigger they got
  const A = [[52, -131, 0.5], [45.5, -133, 0.7], [50, -137.5, 1], [42, -139, 1.45], [47, -145, 2.1], [40.5, -150.5, 2.5], [36, -128.5, 0.7], [39.5, -132, 1], [54, -143, 1.45]];
  for (const [x, z, sc] of A) m.put('su_avalanche', x, z, { scale: sc, rot: x });
  m.blob('su_avalanche', 46, -128, 6, 6, { scale: 0.5 });
  for (const a of [75, 92]) { const [x, z] = onCone(PLACES.peak, 44, a); m.put('su_avalanche', x, z, { scale: 2.5, rot: a }); }
}
function climbers(m) {               // the south face: a roped team's kit laid out below a giant ice axe left in the ledge above
  const s = scene(m, 0, -131.5);
  for (let i = 0; i < 4; i++) { s('su_axe', -4.5 + i * 3, 1 - i * 0.3, { scale: 2, rot: i }); s('su_rope', -3.3 + i * 3, 1.3 - i * 0.3, { scale: 2 }); }
  for (let i = 0; i < 6; i++) s('su_oxygen', -6 + i * 1.5, -1.6, { scale: 2.2 });
  s('crate', 7.4, 0.4, { scale: 2.4 }); s('crate', 9, 1, { scale: 2.4, rot: 0.6 }); s('su_tent', -9.5, 0, { rot: 0.3 });
  s('su_flagpole', -6.6, 2.6); s('su_flagpole', 6, 2.6);
  const pk = PLACES.peak;
  let [x, z] = onCone(pk, 44, 180); m.put('su_axe', x, z, { scale: 9, rot: 0.2 });
  [x, z] = onCone(pk, 44, 192); m.put('su_tent', x, z, { scale: 1.5, rot: 0.2 }); [x, z] = onCone(pk, 44, 203); m.put('su_tent', x, z, { scale: 1.5, rot: -0.3 });
  [x, z] = onCone(pk, 45, 164); m.put('su_oxygen', x, z, { scale: 6.5 }); [x, z] = onCone(pk, 42, 170); m.put('su_oxygen', x, z, { scale: 4.5 });
  for (const a of [186, 197, 208]) { [x, z] = onCone(pk, 41, a); m.put('su_oxygen', x, z, { scale: 3.2 }); }
}
function glacierTarn(m) {            // PLACES.glacier: the river's source, an ice cave above it and a crown of spires
  const [gx, gz] = PLACES.glacier, s = scene(m, gx, gz);
  s('su_cave', -11.5, -9.5, { rot: 0.8 });
  s('su_crystal', -16, -16, { scale: 2.07, rot: 1 }); s('su_crystal', -18, -4, { scale: 1.4, rot: 2 }); s('su_crystal', -22, -10, { scale: 0.7, rot: 3 });
  s('su_crystal', 8, 13, { scale: 0.7 }); s('su_crystal', 3, 15.5, { scale: 1, rot: 4 }); s('su_crystal', -4, -13, { scale: 0.7, rot: 5 });
  const [x, z] = onCone(PLACES.peak, 44, 246); m.put('su_crystal', x, z, { scale: 2.07, rot: 2 });
  // seracs: ice blocks, ever bigger, marching west from the tarn
  const B = [[-18, 6, 3], [-21, 5, 3], [-24.5, 3.5, 4.4], [-28.5, 2.5, 4.4], [-33, 1.5, 6.5], [-38.5, 0.5, 6.5], [-45, -1, 9]];
  for (const [dx, dz, sc] of B) s('tu_iceblock', dx, dz, { scale: sc, rot: dx });
}
function fossilDig(m) {              // a mammoth in a block of ice, and the camp of whoever was chipping it out
  const s = scene(m, -82, -176);
  s('su_fossil', 0, 0, { rot: 0.3 }); s('su_tent', 9, 4, { rot: -1 }); s('su_tent', 9.5, -2.5, { rot: -1.6 });
  for (let i = 0; i < 5; i++) s('tu_iceblock', -3 + i * 1.9, 6.4, { scale: 3 + (i % 2), rot: 0.1 * i });
  for (let i = 0; i < 4; i++) s('su_axe', 1 + i * 1.2, 4.3, { scale: 2, rot: i * 2 });
  s('crate', 6, 6.6, { scale: 2.4 }); s('crate', 7.6, 7.4, { scale: 2.4, rot: 1 }); s('sign', 4.6, 3.6, { scale: 1.6 });
  s('su_flagpole', -6, 4); s('su_flagpole', 6.5, 1); s('su_cairn', -7, -3, { scale: 2.1 }); s('su_cairn', -9.5, 0.5, { scale: 1.5 });
}
function peak(m) {                   // PLACES.peak: the observatory on the second ledge, spires on every ledge, the beacon on top
  const pk = PLACES.peak, at = (id, r, a, opt) => { const [x, z] = onCone(pk, r, a); return m.put(id, x, z, opt); };
  at('su_shrine', 32.5, 135, { rot: PI / 4 });
  for (const a of [108, 120, 150, 162]) at('su_flagpole', 32.5, a, { scale: 2, rot: -a * PI / 180 });
  at('su_cairn', 31, 176, { scale: 4.4 }); at('su_cairn', 34, 188, { scale: 6.3 }); at('su_cairn', 31, 94, { scale: 4.4 });
  at('su_crystal', 32.5, 205, { scale: 2.07 }); at('su_crystal', 32.5, 250, { scale: 2.9 }); at('su_crystal', 32.5, 300, { scale: 2.07 }); at('su_crystal', 32.5, 62, { scale: 2.5 }); at('su_crystal', 33, 80, { scale: 1.45 });
  at('su_crystal', 44, 108, { scale: 1.45 }); at('su_crystal', 44, 222, { scale: 1.45 }); at('su_crystal', 44, 268, { scale: 1.45 }); at('su_crystal', 44, 120, { scale: 1 }); at('su_crystal', 44, 148, { scale: 1 });
  at('su_flagpole', 44, 126, { scale: 1.5 }); at('su_flagpole', 44, 142, { scale: 1.5 }); at('su_cairn', 44, 232, { scale: 3.05 }); at('su_cairn', 44, 214, { scale: 4.4 });
  at('su_crystal', 22, 100, { scale: 2.9 }); at('su_crystal', 22, 225, { scale: 2.9 }); at('su_crystal', 22, 160, { scale: 2.07 });
  for (const a of [60, 180, 300]) at('su_flagpole', 13, a, { scale: 3, rot: -a * PI / 180 });
  m.put('su_beacon', pk[0], pk[1]);
}
function summitBorders(m) {
  // tundra side: the village's outpost, and the biggest snowman anyone has carried this high
  m.put('tu_igloo', 31, -127.5, { scale: 1.9, rot: 0.2 }); m.put('tu_pine', 35.5, -125.6, { scale: 1.1 }); m.put('tu_pine', 27, -125.2, { scale: 0.8 }); m.put('tu_lantern', 30, -124.6, { scale: 3 }); m.put('tu_lantern', 32.4, -124.4, { scale: 3 });
  m.put('tu_snowman', -7, -127, { scale: 2.5 }); m.put('tu_snowman', -10.5, -126, { scale: 1.6, rot: 0.4 }); m.put('tu_pine', -48, -127, { scale: 1.2 }); m.put('tu_pine', -44.5, -125.4, { scale: 0.9 });
  // mountain side: crag boulders furred with ice
  const s = scene(m, 50, -166);
  s('mt_rock', 0, 0, { scale: 4.4 }); s('mt_rock', -3.4, 3, { scale: 2.1, rot: 1 }); s('mt_rock', 2, 4.6, { scale: 3.05, rot: 2 });
  s('su_crystal', -2.6, -3.4, { scale: 0.7 }); s('su_crystal', 1.4, -4.6, { scale: 0.5, rot: 2 }); s('mt_deadtree', -1, 8.4, { scale: 0.5 });
}
function summit(m) {
  baseCamp(m); cairnTrail(m); avalanche(m); climbers(m); glacierTarn(m); fossilDig(m); peak(m); summitBorders(m);
  // ground cover: frost-split boulders, shards of ice, lumps of old avalanche
  m.blob('boulder', -74, -152, 9, 6); m.blob('boulder', -96, -190, 7, 4, { scale: 1.5 }); m.blob('boulder', 44, -122.5, 0.1, 1);
  m.blob('su_crystal', -70, -190, 8, 6, { scale: 0.35 }); m.blob('su_crystal', -46, -134, 7, 6, { scale: 0.35 }); m.blob('su_crystal', 52, -186, 5, 5, { scale: 0.5 });
  m.blob('su_avalanche', -12, -134.5, 3, 4, { scale: 0.7 }); m.blob('su_avalanche', -62, -140, 6, 5, { scale: 1 }); m.blob('su_avalanche', -56, -196, 6, 5, { scale: 1.45 });
  m.blob('su_cairn', -90, -160, 7, 5, { scale: 1.5 }); m.blob('su_cairn', 14, -124.5, 2, 3, { scale: 1 });
}

// ---------------------------------------------------------------- STORMWORKS
function worksTrail(m) {             // dropped batteries all the way up the road, and a coned-off lane
  m.row('wk_battery', 37, -37.6, 41, -41.6, 6, { scale: 0.67 });
  m.row('wk_battery', 42.4, -43.6, 48.4, -49.6, 8);
  m.row('wk_battery', 49.6, -50.4, 53.6, -54.4, 5, { scale: 2 });
  for (const c of [45.5, 50, 54.5]) { m.put('wk_cone', c - 1.8, -c - 1.8, { scale: 0.5 }); m.put('wk_cone', c + 1.8, -c + 1.8, { scale: 0.5 }); }
  m.put('wk_warnsign', 41.5, -46.5, { rot: -PI / 4 }); m.put('wk_hardhat', 43.4, -41.8); m.put('wk_hardhat', 47.5, -45.4, { rot: 2 });
}
function yard(m) {                   // PLACES.yard: cable drums parked in the bays, fuse boxes down one side, the battery ladder, a tea break
  // parking bays (painted lines at x = 51, 56.5, 62, 67.5, 73)
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) m.put('wk_drum', 53.3 + i * 1.1, -72.4 + j * 1.6, { scale: 0.47, rot: H });
  for (let j = 0; j < 3; j++) m.put('wk_drum', 59.3, -72.6 + j * 2.1, { rot: H });
  m.put('wk_drum', 64.8, -71.4, { scale: 2.1, rot: H }); m.put('wk_drum', 64.6, -67.6, { rot: 0.4 });
  m.put('cart', 70.3, -71, { rot: 0 }); m.put('wk_toolbox', 69.2, -68); m.put('wk_toolbox', 71, -67.6, { rot: 1 }); m.put('wk_cone', 70.2, -66.2);
  for (let i = 0; i < 6; i++) m.put('wk_fusebox', 76.6, -74 + i * 4, { rot: -H });
  for (let i = 0; i < 5; i++) m.put('wk_battery', 77, -72 + i * 4, { scale: 3 });
  // the battery ladder: AA, D, car, lorry, and one the size of a silo
  for (let i = 0; i < 6; i++) m.put('wk_battery', 50 + i * 0.4, -52);
  for (let i = 0; i < 4; i++) m.put('wk_battery', 53 + i * 0.6, -52, { scale: 2 });
  for (let i = 0; i < 3; i++) m.put('wk_battery', 55.8 + i * 0.9, -52, { scale: 4.3 });
  for (let i = 0; i < 3; i++) m.put('wk_carbatt', 59 + i * 1.2, -52);
  m.put('wk_carbatt', 63.4, -52, { scale: 2 }); m.put('wk_carbatt', 65.6, -52, { scale: 2 }); m.put('wk_battery', 69.6, -52.6, { scale: 28 });
  // tea break, left mid-way: four hats along the bench, five doughnuts
  const s = scene(m, 56, -60);
  s('bench', 0, -0.8); for (let i = 0; i < 4; i++) s('wk_hardhat', -0.9 + i * 0.6, 0.1, { rot: i }); s('crate', 0, 1.2);
  for (let i = 0; i < 4; i++) s('cup', Math.cos(i * 1.57 + 0.5) * 0.55, 1.2 + Math.sin(i * 1.57 + 0.5) * 0.55); for (let i = 0; i < 5; i++) s('donut', -1 + i * 0.3, 2);
  s('bread', 0.9, 1.9); s('tonic', -1.3, 1.2); s('chair', -1.6, 0.6, { rot: 1 }); s('chair', 1.7, 1.3, { rot: -1 });
  s('wk_toolbox', 2.2, -0.6); s('wk_toolbox', 2.7, 0.3, { rot: 0.8 }); s('boot', -2, -0.6); s('boot', -2.3, -0.2, { rot: 1 });
  // the transformer they were mending
  const t = scene(m, 67.5, -60);
  t('wk_transformer', 0, 0, { rot: 0.2 }); for (let i = 0; i < 5; i++) t('wk_cone', Math.cos(i * 1.257) * 2.6, Math.sin(i * 1.257) * 2.6);
  t('wk_toolbox', -1.7, 1.2, { rot: 2 }); t('wk_hardhat', -1.5, -1.3); t('wk_warnsign', 2.4, -2.6, { rot: 0.5 }); t('wk_carbatt', 1.5, 1.7, { rot: 0.4 });
}
function dam(m) {                    // PLACES.dam: valve wheels along the bank, the pipe run from the yard, the control hut, life rings
  for (let i = 0; i < 5; i++) m.put('wk_valve', 85.4, -79 + i * 3, { scale: i === 2 ? 1.5 : 1, rot: i });
  m.put('wk_valve', 87.5, -62.4, { scale: 2.1 }); m.put('wk_valve', 90.5, -82.6, { scale: 3.05, rot: 1 });
  for (let i = 0; i < 3; i++) m.put('wk_pipe', 79.8 + i * 3.2, -64.6);
  m.put('shed', 93, -59.8, { scale: 0.75, rot: PI }); m.put('wk_warnsign', 89.6, -60.4, { rot: PI }); m.put('wk_fusebox', 96.4, -60.2, { rot: PI }); m.put('wk_rod', 95.6, -57.6);
  for (const [x, z] of [[91.5, -68], [95.5, -74.5], [97.5, -67], [93, -77]]) m.put('wk_lifering', x, z);
  m.put('wk_lifering', 90.4, -62.4, { rot: 1 }); m.put('wk_lifering', 86.6, -81.4); m.put('wk_lifering', 97, -70.6, { scale: 3 });
  m.row('wk_hardhat', 80.4, -62.4, 85.6, -62.4, 4);
}
function substation(m) {             // four transformers behind their warning signs
  const s = scene(m, 42, -76);
  for (const [x, z] of [[-2.3, -2.2], [2.3, -2.2], [-2.3, 2.2], [2.3, 2.2]]) s('wk_transformer', x, z);
  s('wk_rod', -5.2, 0); s('wk_rod', 5.2, 0); s('wk_warnsign', -2.3, 5.4); s('wk_warnsign', 2.3, 5.4); s('wk_fusebox', 0, -5.6, { rot: PI }); s('wk_fusebox', 2.6, -5.6, { rot: PI });
  for (let i = 0; i < 5; i++) s('wk_cone', -4 + i * 2, 6.8); for (let i = 0; i < 4; i++) s('wk_carbatt', -5.4, -4.6 + i * 0.9 - 2, { rot: H });
}
function teslaField(m) {             // three tesla towers ringed with the batteries they were charging; the big dish beside them
  m.put('wk_tesla', 50, -91); m.put('wk_tesla', 58, -95); m.put('wk_tesla', 53, -101, { scale: 1.45 });
  m.ring('wk_carbatt', 50, -91, 2.3, 8); m.ring('wk_battery', 58, -95, 2.2, 8, { scale: 4.3 }); m.ring('wk_carbatt', 53, -101, 3, 6, { scale: 2 });
  m.row('wk_rod', 61.5, -89, 66.5, -91.5, 3); m.put('wk_dish', 67, -98, { scale: 2.07, rot: 2.4 }); m.put('wk_warnsign', 55, -87.6);
  m.row('wk_cone', 60, -78.5, 54, -87, 6);
  m.put('wk_pylon', 68, -82, { scale: 0.7, rot: PI / 4 }); m.put('wk_pylon', 75.5, -87.5, { scale: 0.85, rot: PI / 4 });
}
function scrapHeap(m) {              // household junk in a heap, a sofa set in front of a television, small junk leading in from the road
  const s = scene(m, 58, -37.5);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; s('appliance', Math.cos(a) * 2.7, Math.sin(a) * 2.7, { rot: a * 2 }); }
  s('appliance', 0, 0, { scale: 1.4, rot: 1 }); s('teddy', 0.4, 4.1); s('chair', 4.6, 1.6, { rot: 1 }); s('chair', -4.4, -2, { rot: 2 });
  for (const [x, z] of [[4, -3], [5, -1.4], [-4.6, 2.2]]) s('crate', x, z, { rot: x });
  for (const [x, z] of [[-3.6, 4], [3, 4.4], [5.6, 3.4]]) s('bucket', x, z); for (const [x, z] of [[-5, 0.4], [1.6, -4.6], [-2, -4.8], [5.8, 0.6]]) s('boot', x, z, { rot: x });
  for (const [x, z] of [[-1, 4.6], [2, 5.2], [-5.6, -1.6]]) s('tonic', x, z); s('pot', -3, -4.2); s('pot', 3.4, -4.8);
  m.row('cup', 49.5, -46, 53.5, -41.5, 5); m.row('wk_battery', 46.4, -44.4, 52, -38.6, 6, { scale: 1.5 });
  m.put('wk_dish', 34, -56, { rot: 0.6 }); m.put('wk_dish', 78, -42.5, { rot: 2 });
  m.row('wk_hardhat', 36, -53.4, 39.5, -50, 4); m.row('wk_toolbox', 36.5, -58.6, 40.5, -60.6, 3);
}
function worksBorders(m) {
  // ashflats side: scorched pipes and geothermal vents with their caps of steam
  let s = scene(m, 72, -39.5);
  s('wk_vent', 0, 0); s('wk_scorchpipe', -3.2, 1.2, { rot: 0.4, scale: 0.7 }); s('wk_scorchpipe', 3, -1.6, { rot: 1.2, scale: 0.7 }); s('wk_warnsign', -1.6, -2.4);
  s = scene(m, 86, -49);
  s('wk_vent', 0, 0, { scale: 1.5 }); s('wk_scorchpipe', 4, 0.6, { rot: 0.2 }); s('wk_scorchpipe', -3.6, -1.8, { rot: 1.4 }); for (let i = 0; i < 4; i++) s('wk_cone', -2.4 + i * 1.6, 3, { scale: 0.5 });
  m.row('wk_vent', 74.5, -41.4, 83.2, -47.4, 5, { scale: 0.33 });
  // tundra side: cables iced solid
  s = scene(m, 45, -97);
  s('wk_drum', 0, 0, { scale: 2.1, rot: 0.4 }); s('wk_drum', 2.6, 1.4, { rot: 1 }); s('wk_drum', -1.6, 2.4, { rot: 2 });
  s('tu_iceblock', 2, -1.8, { scale: 2 }); s('tu_iceblock', -2.2, -1.2, { scale: 2, rot: 1 }); s('tu_iceblock', 0.6, 3, { scale: 2, rot: 2 });
  for (let i = 0; i < 5; i++) s('tu_snowball', -3 + i * 1.3, 4.4 + (i % 2) * 0.5, { scale: 2 });
  s('wk_pylon', 2, -5.5, { scale: 0.7, rot: 0.5 });
  m.put('tu_salt', 34, -68.5, { scale: 0.6 }); m.put('wk_warnsign', 35.6, -67.6, { rot: H }); m.row('wk_cone', 33.4, -66, 36.4, -64.6, 3, { scale: 0.5 });
}
function works(m) {
  worksTrail(m); yard(m); dam(m); substation(m); teslaField(m); scrapHeap(m); worksBorders(m);
  m.row('wk_battery', 48, -66, 45.6, -70.4, 6, { scale: 2 });                               // yard -> substation
  m.row('wk_lifering', 73.5, -79.5, 83, -81.5, 4);                                           // yard -> dam, round the back
  m.row('wk_toolbox', 80, -52, 84, -57, 4);
  // gone to seed: weeds through the concrete
  m.blob('bush', 30, -64, 4, 4); m.blob('bush', 58, -82, 5, 4); m.blob('bush', 90, -53, 3, 3); m.blob('bush', 46, -33, 3, 3);
  m.blob('flower', 44, -60, 4, 8); m.blob('flower', 62, -46, 4, 8); m.blob('mushroom', 36, -84, 3, 6);
}

// ---------------------------------------------------------------- THUNDER CRAGS
function boulderLadder(m) {          // a rockfall sorted by size: half a metre at the works fence, nine metres under the crag
  const L = [[76, -104, 0.55], [75.6, -106.6, 0.75], [75.2, -109.8, 1], [74.8, -113.6, 1.5], [74.4, -118.2, 2.1], [72, -124, 3.05], [77, -137, 4.4], [81, -146, 6.3], [90, -177, 9.5]];
  for (const [x, z, sc] of L) m.put('mt_rock', x, z, { scale: sc, rot: x });
  const F = [[97, -172, 3.05], [100.5, -180, 4.4], [83, -183, 3.05], [78, -173, 2.1], [95, -186.5, 2.1], [72, -186, 4.4], [104, -170, 6.3]];
  for (const [x, z, sc] of F) m.put('mt_rock', x, z, { scale: sc, rot: z });
}
function ropeBridge(m) {             // two rows of posts where a rope bridge crossed the step
  for (let i = 0; i < 6; i++) { m.put('mt_post', 64, -119 - i * 3.2, { scale: 1.5, rot: PI }); m.put('mt_post', 67.4, -119 - i * 3.2, { scale: 1.5 }); }
  m.put('su_rope', 65.7, -116.6, { scale: 3 }); m.put('su_rope', 65.7, -137.6, { scale: 3 });
}
function mountainHut(m) {            // the hut, its firewood, a chopping block with the axe still in it
  const s = scene(m, 61, -110);
  s('shed', 0, 0, { scale: 1.5, rot: H });
  for (let i = 0; i < 4; i++) { s('log', -1.8 + i * 1.5, -4.4, { rot: 0 }); s('log', -1.8 + i * 1.5, -6, { rot: 0, scale: 1.5 }); }
  s('stump', 5.2, -3); s('su_axe', 5.9, -2.4, { scale: 2 }); s('campfire', 6.4, 0.6, { scale: 1.5 }); s('bench', 6.2, 3.6, { rot: PI, scale: 1.3 });
  s('tu_lantern', 4, -1.6, { scale: 3 }); s('tu_lantern', 4, 1.8, { scale: 3 }); s('barrel', -1, 4.4, { scale: 1.6 }); s('barrel', 1, 4.8, { scale: 1.6 });
}
function paddock(m) {                // the gate is open and the goats are gone; only their bells are left, and one bell nobody could have worn
  const s = scene(m, 96, -91);
  for (let i = 0; i < 4; i++) { s('fence', -3.75 + i * 2.5, -3.6, { rot: H, scale: 1.5 }); if (i !== 2) s('fence', -3.75 + i * 2.5, 3.6, { rot: H, scale: 1.5 }); }
  for (const z of [-1.3, 1.3]) { s('fence', -5.2, z, { scale: 1.5 }); s('fence', 5.2, z, { scale: 1.5 }); }
  for (const [x, z] of [[-3, -1.6], [-1.4, 0.6], [0.4, -2], [2.2, 1.4], [3.4, -0.8]]) s('mt_bell', x, z, { rot: x });
  for (const [x, z] of [[-3.4, 1.6], [0.6, 0.4], [3.6, -2.2]]) s('mt_bell', x, z, { scale: 2, rot: z });
  s('mt_bell', -1.2, -1.8, { scale: 4 }); s('mt_bell', 2, -0.6, { scale: 3.2, rot: 1 }); s('mt_bell', 2.4, 6.6, { scale: 6.5, rot: 0.4 });
  s('hay', -7.8, -2.6); s('hay', -7.6, 0.4, { rot: 1 }); s('bucket', -3.6, -2.8, { scale: 2 }); s('bucket', -2.6, -2.9, { scale: 2 });
  for (let i = 0; i < 6; i++) s('mt_bell', 0.8 - i * 3.2, 6 + i * 1.2 - (i > 2 ? (i - 2) * 3 : 0), { scale: 2 + (i % 2) });           // a trail of bells toward the hut
}
function cableCar(m) {               // lower station on the terrace, upper station on the second ledge, gondolas fallen along the line
  const cg = PLACES.crag, ux = -0.875, uz = -0.482;
  m.put('mt_station', cg[0] + ux * 57, cg[1] + uz * 57, { rot: -0.5 });
  m.put('mt_station', cg[0] + ux * 28, cg[1] + uz * 28, { rot: PI - 0.5, scale: 0.7 });
  m.put('mt_gondola', cg[0] + ux * 45, cg[1] + uz * 45, { rot: 0.4 }); m.put('mt_gondola', cg[0] + ux * 39, cg[1] + uz * 39, { rot: -0.5 });
  m.put('mt_gondola', cg[0] + ux * 60 - 4, cg[1] + uz * 60 + 7, { rot: -0.5 }); m.put('mt_gondola', cg[0] + ux * 63 - 3, cg[1] + uz * 63 + 11.5, { rot: -0.7 });
  m.put('wk_pylon', cg[0] + ux * 42 - uz * 4, cg[1] + uz * 42 + ux * 4, { scale: 0.8, rot: 0.5 });
  m.put('wk_drum', cg[0] + ux * 55 + 5, cg[1] + uz * 55 - 6, { scale: 2.1 }); m.put('wk_drum', cg[0] + ux * 55 + 8, cg[1] + uz * 55 - 7, { scale: 3.05, rot: 1 });
}
function deadTrees(m) {
  const T = [[150, -100, 1], [160, -108, 0.8], [165, -95, 0.6], [112, -178, 0.8], [96, -192, 1.2], [118, -76, 0.5], [126, -60, 0.4], [66, -150, 0.5], [70, -160, 0.7]];
  for (const [x, z, sc] of T) m.put('mt_deadtree', x, z, { scale: sc, rot: x });
}
function standingStones(m) {         // PLACES.crag: a ring of standing stones, each wired to a lightning rod, and the king stone on the top
  const cg = PLACES.crag;
  for (let i = 0; i < 8; i++) { const [x, z] = onCone(cg, 17, i * 45 + 10); m.put('mt_stone', x, z, { rot: -(i * 45 + 10) * PI / 180 + PI }); }
  for (let i = 0; i < 4; i++) { const [x, z] = onCone(cg, 17, i * 90 + 32); m.put('wk_rod', x, z, { scale: 2 }); }
  m.put('mt_stone', cg[0], cg[1], { scale: 2, rot: 0.4 }); m.put('wk_rod', cg[0] + 4, cg[1] + 3, { scale: 3 });
  for (const a of [200, 235, 270]) { const [x, z] = onCone(cg, 28, a + 62); m.put('mt_stone', x, z, { scale: 0.7, rot: a }); }
}
function climbingWall(m) {           // the training wall along the dam's east bank, chalk bags from pocket-size to absurd
  for (let i = 0; i < 3; i++) m.put('mt_wall', 113.5, -76 + i * 6, { rot: -H });
  for (let i = 0; i < 4; i++) m.put('mt_chalk', 110.6, -77 + i * 0.7); for (let i = 0; i < 3; i++) m.put('mt_chalk', 110.6, -73.4 + i * 1.3, { scale: 2 });
  m.put('mt_chalk', 110.8, -68.4, { scale: 4.4 }); m.put('mt_chalk', 111, -63.6, { scale: 6.3 });
  for (let i = 0; i < 3; i++) m.put('su_rope', 116.6, -74 + i * 5, { scale: 3 }); m.put('bench', 117.4, -66, { rot: -H, scale: 1.3 });
  m.put('blanket', 110.4, -60.6, { scale: 2 });
}
function eagleNest(m) {              // a nest of whole logs on the south-east ledge, three eggs a metre tall
  const [x, z] = onCone(PLACES.crag, 28, 139), s = scene(m, x, z);
  s('mt_nest', 0, 0);
  for (let i = 0; i < 8; i++) if (i !== 2) { const a = i / 8 * TAU; s('log', Math.cos(a) * 3.3, Math.sin(a) * 3.3, { rot: -a, scale: 1.6 }); }
  s('mt_egg', -0.8, -0.4); s('mt_egg', 0.9, 0.7, { rot: 1 }); s('mt_egg', 0.2, -1.3, { scale: 1.5, rot: 2 });
  s('mt_deadtree', 5.6, -3.4, { scale: 1.2 });
}
function weatherStation(m) {         // spinning-cup masts on the south ledge, instrument cabinets, a dish
  const [x, z] = onCone(PLACES.crag, 41, 180), s = scene(m, x, z);
  s('mt_weather', 0, 0, { scale: 2 }); s('mt_weather', -5.5, -1.6); s('mt_weather', 5.5, -1.6, { rot: 1 });
  for (let i = 0; i < 4; i++) s('mt_weather', -4.5 + i * 3, 3.4, { scale: 0.5, rot: i });
  for (let i = 0; i < 3; i++) s('wk_fusebox', -3 + i * 3, -3.6, { scale: 1.5 }); s('wk_dish', 9.5, 1.5, { rot: 1 });
  s('crate', -8.4, 1.6, { scale: 2.4 }); s('crate', -9.6, 3, { scale: 2.4, rot: 1 }); s('crate', -7.6, 3.4, { scale: 3.4, rot: 0.5 });
}
function mountainBorders(m) {
  // works side: the pylons march on up toward the crag
  m.put('wk_pylon', 85, -95, { rot: PI / 4 }); m.put('wk_pylon', 103, -106, { scale: 1.2, rot: PI / 4 }); m.put('wk_pylon', 112, -115, { scale: 1.6, rot: PI / 4 });
  m.put('wk_drum', 82, -99, { scale: 2.1, rot: 1 }); m.put('wk_drum', 84.5, -101.5, { scale: 2.1, rot: 2 }); m.put('wk_warnsign', 87.5, -97.5, { scale: 1.5 }); m.put('wk_transformer', 89, -102.5, { rot: 0.6 });
  // summit side: spires among the boulders
  const s = scene(m, 64, -170);
  s('su_crystal', 0, 0, { scale: 1 }); s('su_crystal', 3, 3, { scale: 0.5, rot: 2 }); s('mt_rock', -1, 4.4, { scale: 3.05 }); s('mt_rock', 4, -2.6, { scale: 2.1, rot: 1 }); s('tu_snowman', 3.6, 7, { scale: 1.6 });
  // caldera side: scorched trees and one steaming crack
  m.put('wk_vent', 142, -82, { scale: 1.5 }); m.put('mt_deadtree', 146, -79, { scale: 0.45 }); m.put('mt_deadtree', 139, -78.5, { scale: 0.35, rot: 2 });
}
function mountain(m) {
  boulderLadder(m); ropeBridge(m); mountainHut(m); paddock(m); cableCar(m); deadTrees(m); standingStones(m); climbingWall(m); eagleNest(m); weatherStation(m); mountainBorders(m);
  m.row('mt_rock', 80, -86, 90, -88, 5, { scale: 1.5 });                                     // works -> paddock
  m.row('su_cairn', 70, -128, 76, -131, 3, { scale: 1.5 });
  // scree: natural boulder fields, bigger toward the crag and the far terraces
  m.blob('mt_rock', 68, -98, 5, 5, { scale: 1 }); m.blob('mt_rock', 84, -114, 5, 7, { scale: 1.5 }); m.blob('mt_rock', 122, -68, 6, 7, { scale: 1.5 });
  m.blob('mt_rock', 96, -150, 4, 5, { scale: 2.1 }); m.blob('mt_rock', 160, -92, 8, 7, { scale: 2.1 }); m.blob('mt_rock', 76, -196, 0.1, 1, { scale: 3.05 });
  m.blob('mt_rock', 128, -98, 4, 4, { scale: 3.05 }); m.blob('mt_rock', 110, -98, 4, 4, { scale: 3.05 });
  m.blob('bigrock', 166, -84, 6, 3); m.blob('boulder', 116, -56, 5, 5); m.blob('bush', 100, -80.5, 2.5, 4, { scale: 1.3 }); m.blob('bush', 68, -142, 4, 5, { scale: 1.3 });
}

export function dress(m) { tundra(m); summit(m); works(m); mountain(m); }
