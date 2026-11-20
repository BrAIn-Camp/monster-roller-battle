// habitats/hub.js: CROSSWAY GREEN on festival day. The village green of a crossroads market town, where travellers
// from every climate of the continent meet. Everything inside 34 m of the centre is laid out once and repeated four
// times by quad() (rotated 90 degrees each time), so all four teams get exactly the same start. The rim beyond the
// ring road is different on every side: each stand there hints at the climate that lies behind it.
const PI = Math.PI, H = PI / 2, Q = Math.SQRT1_2;
const CREAM = 0xf3ead7, GOLD = 0xf1c935, WOOD = 0x8a5a2b, PINE = 0xc99a5a, IRON = 0x555b66, RED = 0xd9415f, SKY = 0x4a9be8;
const BRIGHT = [0xd9415f, 0x4a9be8, 0xf2903a, 0x57b65a, 0x9b6ae6];

export const ITEMS = [
  // ---- the feast
  { id: 'hb_grandtart', name: 'Grand Festival Tart', size: 0.28, shape: 'hb_grandtart', colors: [GOLD], mass: 12 },
  { id: 'hb_goldpie', name: 'Golden Pie', size: 0.24, shape: 'hb_goldpie', colors: [GOLD], mass: 4 },
  { id: 'hb_macaron', name: 'Macaron', size: 0.05, shape: 'hb_macaron', colors: [0xff8fb1, 0x9bd94a, 0xf6d35a, 0xb99be8] },
  { id: 'hb_candy', name: 'Boiled Sweet', size: 0.07, shape: 'hb_candy', colors: BRIGHT },
  { id: 'hb_jamtart', name: 'Jam Tart', size: 0.10, shape: 'hb_jamtart', colors: [0xc8324a, 0xf2903a, 0x7a3fa8] },
  { id: 'hb_bun', name: 'Iced Bun', size: 0.14, shape: 'hb_bun', colors: [0xfff5f0, 0xffc2d6] },
  { id: 'hb_toffeeapple', name: 'Toffee Apple', size: 0.18, shape: 'hb_toffeeapple', colors: [0xb5301e, 0xc8452a] },
  { id: 'hb_pie', name: 'Fruit Pie', size: 0.22, shape: 'hb_pie', colors: [0xc98a4a] },
  { id: 'hb_jelly', name: 'Wobbly Jelly', size: 0.26, shape: 'hb_jelly', colors: [0xe8456a, 0x6fd06a, 0xf2a03a] },
  { id: 'hb_feastrug', name: 'Feast Rug', size: 6, shape: 'hb_feastrug', colors: [0xc8324a], rad: 0.5, flat: true, mass: 0.05 },
  { id: 'hb_mast', name: 'Feast Mast', size: 6, shape: 'hb_mast', colors: [RED, SKY, 0x57b65a, 0xf2903a], rad: 0.05, mass: 0.1 },
  // ---- the start pads
  { id: 'hb_startflag', name: 'Team Banner', size: 5, shape: 'hb_startflag', colors: [CREAM], rad: 0.04, mass: 0.1 },
  { id: 'hb_crumb', name: 'Breadcrumb', size: 0.05, shape: 'hb_crumb', colors: [0xe2b877, 0xd9a86a] },
  { id: 'hb_cooler', name: 'Cooler', size: 0.42, shape: 'hb_cooler', colors: [SKY, 0xd95a4a] },
  { id: 'hb_foldchair', name: 'Folding Chair', size: 0.7, shape: 'hb_foldchair', colors: [0xd95a4a, SKY, 0x57b65a], rad: 0.4 },
  { id: 'hb_waterbottle', name: 'Water Bottle', size: 0.2, shape: 'bottle', colors: [0x7fd0e8, 0x9fe0c8] },
  { id: 'hb_towel', name: 'Towel', size: 0.4, shape: 'hb_towel', colors: [0x4ac2d9, 0xf2903a], flat: true },
  // ---- fairground games and stalls
  { id: 'hb_ring', name: 'Quoit', size: 0.12, shape: 'hb_ring', colors: [RED, SKY, GOLD] },
  { id: 'hb_peg', name: 'Ring-toss Peg', size: 0.32, shape: 'hb_peg', colors: [RED, SKY, GOLD], rad: 0.3 },
  { id: 'hb_ball', name: 'Throwing Ball', size: 0.09, shape: 'hb_ball', colors: BRIGHT },
  { id: 'hb_coconut', name: 'Coconut', size: 0.16, shape: 'hb_coconut', colors: [0x7a4e2b] },
  { id: 'hb_coconutpost', name: 'Coconut on a Post', size: 0.6, shape: 'hb_coconutpost', colors: [RED, SKY], rad: 0.2, mass: 0.5 },
  { id: 'hb_booth', name: 'Game Booth', size: 2.4, shape: 'hb_booth', colors: [0xd95a4a, 0x4a86d9], mass: 0.4 },
  { id: 'hb_stall', name: 'Festival Stall', size: 2.6, shape: 'hb_stall', colors: [0xd95a4a, 0x57a85a, 0x4a86d9], mass: 0.4 },
  { id: 'hb_puppettheatre', name: 'Puppet Theatre', size: 1.9, shape: 'hb_puppettheatre', colors: [0x4a86d9], rad: 0.3, mass: 0.4 },
  { id: 'hb_puppet', name: 'Glove Puppet', size: 0.28, shape: 'hb_puppet', colors: BRIGHT },
  { id: 'hb_toyboat', name: 'Toy Boat', size: 0.24, shape: 'hb_toyboat', colors: [RED, SKY, 0x57b65a] },
  { id: 'hb_duck', name: 'Toy Duck', size: 0.16, shape: 'hb_duck', colors: [0xffd23f] },
  { id: 'hb_drum', name: 'Toy Drum', size: 0.4, shape: 'hb_drum', colors: [RED, SKY] },
  { id: 'hb_balloons', name: 'Balloons', size: 0.44, shape: 'hb_balloons', colors: [RED, 0x9b6ae6, 0x57b65a], rad: 0.25, mass: 0.4 },
  { id: 'hb_lantern', name: 'Paper Lantern', size: 0.2, shape: 'hb_lantern', colors: [0xf2743a, 0xffd23f, 0xff8fb1] },
  { id: 'hb_lanternpost', name: 'Lantern Post', size: 3, shape: 'hb_lanternpost', colors: [0xf2743a, 0xffd23f], rad: 0.06, mass: 0.2 },
  { id: 'hb_hamper', name: 'Picnic Hamper', size: 0.36, shape: 'hb_hamper', colors: [RED, SKY] },
  { id: 'hb_flowertub', name: 'Flower Tub', size: 0.4, shape: 'hb_flowertub', colors: [0xff8fb1, 0xffd23f, 0xb99be8, 0xf2743a] },
  { id: 'hb_gnome', name: 'Fishing Gnome', size: 0.5, shape: 'hb_gnome', colors: [SKY, 0x57b65a], rad: 0.3 },
  { id: 'hb_pool', name: 'Paddling Pool', size: 6, shape: 'hb_pool', colors: [0xff8fb1], rad: 0.5, flat: true, mass: 0.05 },
  // ---- the four big set pieces, one on each road (same size and weight, so no side is better off)
  { id: 'hb_bandstand', name: 'Bandstand', size: 3.5, shape: 'hb_bandstand', colors: [0x4a86d9], rad: 0.3, mass: 0.35 },
  { id: 'hb_maypole', name: 'Maypole', size: 3.5, shape: 'hb_maypole', colors: [RED], rad: 0.3, mass: 0.35 },
  { id: 'hb_carousel', name: 'Carousel', size: 3.5, shape: 'hb_carousel', colors: [0xd95a4a], rad: 0.3, mass: 0.35 },
  { id: 'hb_marquee', name: 'Cake Marquee', size: 3.5, shape: 'hb_marquee', colors: [0x57a85a], rad: 0.3, mass: 0.35 },
  // ---- the rim: something from each neighbouring climate
  { id: 'hb_snowcart', name: 'Snow-cone Cart', size: 2.2, shape: 'hb_snowcart', colors: [0x7fd0d8], mass: 0.5 },
  { id: 'hb_cone', name: 'Ice Cone', size: 0.2, shape: 'hb_cone', colors: [0x9fe8f0, 0xff8fb1, 0xfff5e6, 0xb99be8], rad: 0.3 },
  { id: 'hb_gadgetstall', name: 'Gadget Stall', size: 2.4, shape: 'hb_gadgetstall', colors: [0x3a4a6a], mass: 0.4 },
  { id: 'hb_battery', name: 'Battery', size: 0.18, shape: 'hb_battery', colors: [0x2a2a30], rad: 0.25 },
  { id: 'hb_toyrobot', name: 'Wind-up Robot', size: 0.38, shape: 'hb_toyrobot', colors: [0xe9bf2a, 0xd95a4a, 0x4ac2d9], rad: 0.3 },
  { id: 'hb_bbq', name: 'Barbecue', size: 1.3, shape: 'hb_bbq', colors: [0x3a3a44], rad: 0.3, mass: 0.5 },
  { id: 'hb_chilli', name: 'Chilli', size: 0.12, shape: 'hb_chilli', colors: [0xd9301e, 0xf2743a, 0x57b65a] },
  { id: 'hb_urn', name: 'Painted Urn', size: 0.55, shape: 'hb_urn', colors: [0xc7673a, 0x3a8fa8, 0xd9a23a], mass: 0.6 },
  { id: 'hb_rugroll', name: 'Rolled Rug', size: 0.9, shape: 'hb_rugroll', colors: [0xb8433a, 0x3a6aa8, 0x8a4aa8], rad: 0.22 },
  { id: 'hb_kiosk', name: 'Ice-cream Kiosk', size: 2.6, shape: 'hb_kiosk', colors: [0x4ac2d9], mass: 0.4 },
  { id: 'hb_beachball', name: 'Beach Ball', size: 0.42, shape: 'hb_beachball', colors: [RED, SKY, 0x57b65a], mass: 0.5 },
  { id: 'hb_herbjar', name: 'Herb Jar', size: 0.2, shape: 'hb_herbjar', colors: [0x7fb86a, 0xb99be8, 0xd9c34a] },
  { id: 'hb_fortunetent', name: "Fortune-teller's Tent", size: 2.8, shape: 'hb_fortunetent', colors: [0x8a5ac8], mass: 0.3 },
  { id: 'hb_crystalball', name: 'Crystal Ball', size: 0.34, shape: 'hb_crystalball', colors: [0xbfe8ff] },
  { id: 'hb_carving', name: 'Carved Bear', size: 0.8, shape: 'hb_carving', colors: [0xb07f40, 0x9a6a3a], rad: 0.3 },
  { id: 'hb_producestand', name: 'Farm Produce Stand', size: 2.2, shape: 'hb_producestand', colors: [0x57a85a], mass: 0.4 },
];

export const SHAPES = {
  hb_grandtart(g, c, P) {
    P(g, 'cyl', c, [.5, .05, .5], [0, .025, 0]); P(g, 'cyl', 0xd9a441, [.46, .3, .46], [0, .2, 0]); P(g, 'cyl', 0xc8324a, [.38, .06, .38], [0, .36, 0]);
    P(g, 'sph', 0xfff5e6, [.18, .13, .18], [0, .46, 0]); P(g, 'sph', 0xe0243a, [.09, .09, .09], [0, .63, 0]);
  },
  hb_goldpie(g, c, P) { P(g, 'cyl', 0xe8b93a, [.5, .26, .5], [0, .13, 0]); P(g, 'sph', 0xf6d35a, [.44, .2, .44], [0, .28, 0]); P(g, 'sph', 0xfff2b0, [.1, .08, .1], [0, .5, 0]); },
  hb_macaron(g, c, P) { P(g, 'cyl', c, [.5, .2, .5], [0, .1, 0]); P(g, 'cyl', CREAM, [.44, .12, .44], [0, .26, 0]); P(g, 'cyl', c, [.5, .2, .5], [0, .42, 0]); },
  hb_candy(g, c, P) { P(g, 'sph', c, [.28, .28, .28], [0, .28, 0]); P(g, 'cone', c, [.18, .22, .18], [.38, .28, 0], [0, 0, H]); P(g, 'cone', c, [.18, .22, .18], [-.38, .28, 0], [0, 0, -H]); },
  hb_jamtart(g, c, P) { P(g, 'cyl', 0xe0b56a, [.5, .24, .5], [0, .12, 0]); P(g, 'cyl', c, [.36, .06, .36], [0, .25, 0]); },
  hb_bun(g, c, P) { P(g, 'sph', 0xd99a52, [.5, .34, .5], [0, .34, 0]); P(g, 'sph', c, [.34, .16, .34], [0, .56, 0]); P(g, 'sph', 0xe0243a, [.09, .09, .09], [0, .74, 0]); },
  hb_toffeeapple(g, c, P) { P(g, 'sph', c, [.34, .34, .34], [0, .34, 0]); P(g, 'cyl', 0xe8d9a8, [.035, .4, .035], [0, .8, 0]); },
  hb_pie(g, c, P) { P(g, 'cyl', c, [.5, .26, .5], [0, .13, 0]); P(g, 'sph', 0xe8bd7a, [.45, .16, .45], [0, .27, 0]); P(g, 'box', WOOD, [.3, .03, .05], [0, .43, 0]); },
  hb_jelly(g, c, P) { P(g, 'cyl', CREAM, [.5, .05, .5], [0, .025, 0]); P(g, 'taper', c, [.42, .55, .42], [0, .33, 0]); P(g, 'sph', c, [.3, .14, .3], [0, .62, 0]); },
  hb_feastrug(g, c, P) {
    P(g, 'cyl', c, [.5, .003, .5], [0, .0015, 0]); P(g, 'cyl', CREAM, [.43, .0035, .43], [0, .00175, 0]);
    P(g, 'cyl', GOLD, [.36, .004, .36], [0, .002, 0]); P(g, 'cyl', c, [.3, .0045, .3], [0, .00225, 0]);
  },
  hb_mast(g, c, P) {
    P(g, 'cyl', 0xb8b4a8, [.04, .03, .04], [0, .015, 0]); P(g, 'cyl', CREAM, [.012, .96, .012], [0, .48, 0]); P(g, 'sph', GOLD, [.028, .028, .028], [0, .972, 0]);
    P(g, 'box', c, [.15, .055, .006], [.085, .9, 0]); P(g, 'box', GOLD, [.12, .05, .006], [.07, .825, 0]); P(g, 'box', c, [.09, .045, .006], [.055, .755, 0]);
  },
  hb_startflag(g, c, P) {
    P(g, 'box', 0xe8d9a8, [.1, .03, .1], [0, .015, 0]); P(g, 'cyl', c, [.014, .94, .014], [0, .47, 0]); P(g, 'sph', GOLD, [.03, .03, .03], [0, .965, 0]);
    P(g, 'box', c, [.2, .34, .008], [.115, .74, 0]); P(g, 'box', GOLD, [.2, .05, .011], [.115, .86, 0]); P(g, 'box', GOLD, [.2, .05, .011], [.115, .62, 0]);
  },
  hb_crumb(g, c, P) { P(g, 'rock', c, [.5, .4, .5], [0, .4, 0]); },
  hb_cooler(g, c, P) { P(g, 'box', c, [1, .5, .6], [0, .25, 0]); P(g, 'box', 0xffffff, [1.02, .14, .62], [0, .57, 0]); P(g, 'box', 0xc8ccd4, [.5, .05, .08], [0, .67, 0]); },
  hb_foldchair(g, c, P) {
    P(g, 'box', c, [.6, .05, .6], [0, .45, 0]); P(g, 'box', c, [.6, .36, .05], [0, .8, -.3]);
    for (const x of [-.27, .27]) { P(g, 'box', 0xc8ccd4, [.05, 1, .05], [x, .5, -.3]); P(g, 'box', 0xc8ccd4, [.05, .45, .05], [x, .225, .27]); }
  },
  hb_towel(g, c, P) { P(g, 'box', c, [1, .04, .6], [0, .02, 0]); P(g, 'box', 0xffffff, [.12, .046, .6], [-.25, .023, 0]); P(g, 'box', 0xffffff, [.12, .046, .6], [.25, .023, 0]); },
  hb_ring(g, c, P) { P(g, 'cyl', c, [.5, .16, .5], [0, .08, 0]); P(g, 'cyl', CREAM, [.34, .17, .34], [0, .085, 0]); },
  hb_peg(g, c, P) { P(g, 'cyl', PINE, [.4, .12, .4], [0, .06, 0]); P(g, 'cyl', c, [.09, .8, .09], [0, .52, 0]); P(g, 'sph', c, [.13, .13, .13], [0, .87, 0]); },
  hb_ball(g, c, P) { P(g, 'sph', c, [.5, .5, .5], [0, .5, 0]); P(g, 'cyl', CREAM, [.505, .12, .505], [0, .5, 0]); },
  hb_coconut(g, c, P) { P(g, 'sph', c, [.5, .45, .5], [0, .45, 0]); for (const x of [-.12, 0, .12]) P(g, 'sph', 0x3a2414, [.06, .06, .06], [x, .8 - Math.abs(x) * .6, .22]); },
  hb_coconutpost(g, c, P) {
    P(g, 'cyl', PINE, [.3, .05, .3], [0, .025, 0]); P(g, 'cyl', c, [.06, .66, .06], [0, .36, 0]); P(g, 'taper', CREAM, [.2, .1, .2], [0, .7, 0], [PI, 0, 0]);
    P(g, 'sph', 0x7a4e2b, [.19, .17, .19], [0, .86, 0]);
  },
  hb_booth(g, c, P) {
    P(g, 'box', c, [.9, .7, .06], [0, .35, -.35]); P(g, 'box', c, [.06, .7, .6], [-.45, .35, -.05]); P(g, 'box', c, [.06, .7, .6], [.45, .35, -.05]);
    P(g, 'box', CREAM, [.92, .12, .07], [0, .56, -.34]); P(g, 'box', PINE, [.96, .08, .2], [0, .36, .3]); P(g, 'pyr', GOLD, [.7, .28, .7], [0, .84, -.03], [0, PI / 4, 0]);
    P(g, 'sph', CREAM, [.05, .05, .05], [0, .98, -.03]);
  },
  hb_stall(g, c, P) {
    P(g, 'box', PINE, [.9, .32, .4], [0, .16, .1]); for (const x of [-.42, .42]) P(g, 'box', WOOD, [.05, .8, .05], [x, .4, -.2]);
    P(g, 'box', c, [1, .07, .72], [0, .82, .02], [.28, 0, 0]); for (const x of [-.3, .3]) P(g, 'box', CREAM, [.2, .075, .725], [x, .82, .02], [.28, 0, 0]);
    P(g, 'sph', 0xf2903a, [.08, .08, .08], [-.22, .4, .12]); P(g, 'sph', RED, [.08, .08, .08], [.02, .4, .14]); P(g, 'box', 0xe8bd7a, [.2, .1, .16], [.27, .37, .12]);
  },
  hb_puppettheatre(g, c, P) {
    P(g, 'box', c, [.7, .45, .3], [0, .225, 0]); P(g, 'box', c, [.12, .34, .3], [-.29, .62, 0]); P(g, 'box', c, [.12, .34, .3], [.29, .62, 0]);
    P(g, 'box', GOLD, [.74, .12, .32], [0, .85, 0]); P(g, 'box', 0x2a2a3a, [.46, .34, .05], [0, .62, -.1]); P(g, 'pyr', RED, [.3, .1, .2], [0, .95, 0], [0, PI / 4, 0]);
    P(g, 'cone', RED, [.07, .14, .07], [-.08, .52, .06]); P(g, 'sph', 0xf2c9a0, [.05, .05, .05], [-.08, .62, .06]); P(g, 'box', CREAM, [.5, .06, .31], [0, .3, .005]);
  },
  hb_puppet(g, c, P) {
    P(g, 'cone', c, [.3, .62, .3], [0, .31, 0]); P(g, 'box', c, [.74, .08, .1], [0, .46, 0]); P(g, 'sph', 0xf2c9a0, [.19, .19, .19], [0, .7, 0]);
    P(g, 'cone', GOLD, [.13, .2, .13], [0, .9, 0]);
  },
  hb_toyboat(g, c, P) { P(g, 'box', c, [1, .2, .38], [0, .1, 0]); P(g, 'cyl', WOOD, [.025, .6, .025], [0, .5, 0]); P(g, 'box', CREAM, [.42, .44, .02], [.12, .56, 0]); },
  hb_duck(g, c, P) { P(g, 'sph', c, [.36, .3, .44], [0, .3, -.05]); P(g, 'sph', c, [.2, .2, .2], [0, .7, .2]); P(g, 'cone', 0xf2903a, [.07, .16, .07], [0, .68, .44], [H, 0, 0]); },
  hb_drum(g, c, P) {
    P(g, 'cyl', c, [.47, .6, .47], [0, .33, 0]); P(g, 'cyl', GOLD, [.5, .07, .5], [0, .06, 0]); P(g, 'cyl', CREAM, [.5, .07, .5], [0, .64, 0]);
    P(g, 'box', PINE, [.6, .04, .04], [0, .71, .1], [0, .5, 0]); P(g, 'box', PINE, [.6, .04, .04], [0, .71, -.1], [0, -.4, 0]);
  },
  hb_balloons(g, c, P) {
    P(g, 'box', IRON, [.14, .06, .14], [0, .03, 0]); P(g, 'cyl', 0x9a9a9a, [.01, .55, .01], [0, .3, 0]);
    P(g, 'sph', c, [.2, .22, .2], [0, .76, 0]); P(g, 'sph', 0xffd23f, [.17, .19, .17], [-.22, .62, .05]); P(g, 'sph', SKY, [.17, .19, .17], [.22, .64, -.05]);
  },
  hb_lantern(g, c, P) { P(g, 'cyl', GOLD, [.16, .08, .16], [0, .04, 0]); P(g, 'sph', c, [.4, .36, .4], [0, .42, 0]); P(g, 'cyl', GOLD, [.16, .08, .16], [0, .8, 0]); P(g, 'cyl', WOOD, [.02, .16, .02], [0, .92, 0]); },
  hb_lanternpost(g, c, P) {
    P(g, 'cyl', 0xb8b4a8, [.06, .03, .06], [0, .015, 0]); P(g, 'cyl', CREAM, [.02, .96, .02], [0, .48, 0]); P(g, 'box', CREAM, [.5, .02, .02], [0, .9, 0]);
    P(g, 'sph', c, [.07, .08, .07], [-.22, .8, 0]); P(g, 'sph', c, [.07, .08, .07], [.22, .8, 0]); P(g, 'sph', GOLD, [.035, .035, .035], [0, .97, 0]);
  },
  hb_hamper(g, c, P) { P(g, 'box', PINE, [1, .5, .66], [0, .25, 0]); P(g, 'box', 0xb07f40, [1.02, .08, .68], [0, .54, 0]); P(g, 'box', c, [.5, .1, .7], [.2, .56, 0]); P(g, 'box', WOOD, [.4, .05, .06], [-.2, .62, 0]); },
  hb_flowertub(g, c, P) {
    P(g, 'taper', 0x9a6a3a, [.46, .5, .46], [0, .25, 0], [PI, 0, 0]); P(g, 'sph', 0x57b65a, [.42, .14, .42], [0, .52, 0]);
    P(g, 'sph', c, [.2, .16, .2], [-.18, .68, .1]); P(g, 'sph', c, [.2, .16, .2], [.2, .66, .05]); P(g, 'sph', CREAM, [.18, .16, .18], [0, .76, -.16]);
  },
  hb_gnome(g, c, P) {
    P(g, 'cone', c, [.3, .5, .3], [0, .25, 0]); P(g, 'sph', 0xf2c9a0, [.18, .18, .18], [0, .56, 0]); P(g, 'sph', 0xffffff, [.16, .14, .12], [0, .47, .1]);
    P(g, 'cone', 0xd9301e, [.2, .36, .2], [0, .82, 0]); P(g, 'cyl', WOOD, [.015, .5, .015], [.22, .52, .3], [1, 0, 0]); P(g, 'sph', 0xd9301e, [.04, .04, .04], [.22, .34, .5]);
  },
  hb_pool(g, c, P) { P(g, 'cyl', c, [.5, .004, .5], [0, .002, 0]); P(g, 'cyl', 0x8fd8f0, [.45, .0046, .45], [0, .0023, 0]); P(g, 'cyl', 0xbfeeff, [.2, .005, .2], [.1, .0025, -.1]); },
  hb_bandstand(g, c, P) {
    P(g, 'cyl', 0xe8d9a8, [.5, .14, .5], [0, .07, 0]);
    for (let i = 0; i < 6; i++) { const a = i * PI / 3; P(g, 'cyl', CREAM, [.025, .5, .025], [Math.cos(a) * .42, .39, Math.sin(a) * .42]); }
    P(g, 'cone', c, [.5, .3, .5], [0, .79, 0]); P(g, 'sph', GOLD, [.05, .05, .05], [0, .95, 0]);
  },
  hb_maypole(g, c, P) {
    P(g, 'cyl', 0xe8d9a8, [.3, .06, .3], [0, .03, 0]); P(g, 'cyl', CREAM, [.03, .9, .03], [0, .5, 0]); P(g, 'sph', GOLD, [.07, .07, .07], [0, .93, 0]);
    for (let i = 0; i < 6; i++) { const a = i * PI / 3; P(g, 'box', [c, CREAM, GOLD, SKY, 0x57b65a, 0xff8fb1][i], [.03, .96, .012], [Math.cos(a) * .2, .47, Math.sin(a) * .2], [0, -a, .42]); }
  },
  hb_carousel(g, c, P) {
    P(g, 'cyl', 0xe8d9a8, [.5, .08, .5], [0, .04, 0]); P(g, 'cyl', GOLD, [.06, .7, .06], [0, .43, 0]); P(g, 'cone', c, [.5, .26, .5], [0, .85, 0]); P(g, 'sph', GOLD, [.04, .04, .04], [0, .97, 0]);
    for (let i = 0; i < 4; i++) { const a = i * H + .5; P(g, 'box', [CREAM, SKY, 0xffd23f, 0xff8fb1][i], [.08, .16, .22], [Math.cos(a) * .34, .34, Math.sin(a) * .34], [0, -a, 0]); }
  },
  hb_marquee(g, c, P) {
    P(g, 'cyl', c, [.5, .45, .5], [0, .225, 0]); for (let i = 0; i < 4; i++) P(g, 'box', CREAM, [.12, .44, 1.005], [0, .225, 0], [0, i * PI / 4, 0]);
    P(g, 'cone', CREAM, [.5, .42, .5], [0, .66, 0]); P(g, 'box', GOLD, [.1, .06, .01], [.05, .96, 0]); P(g, 'cyl', WOOD, [.01, .14, .01], [0, .93, 0]);
  },
  hb_snowcart(g, c, P) {
    P(g, 'box', 0xffffff, [.9, .36, .5], [0, .42, 0]); P(g, 'box', c, [.92, .1, .52], [0, .3, 0]);
    for (const x of [-.3, .3]) P(g, 'cyl', 0x3a3a44, [.16, .06, .16], [x, .16, .27], [H, 0, 0]);
    P(g, 'sph', 0xe8f8ff, [.22, .12, .2], [-.15, .62, 0]); P(g, 'cyl', WOOD, [.02, .36, .02], [.3, .76, 0]); P(g, 'cone', c, [.3, .14, .3], [.2, .93, 0]);
    P(g, 'cone', 0xffffff, [.14, .07, .14], [.2, .965, 0]);
  },
  hb_cone(g, c, P) { P(g, 'cone', 0xe8c98a, [.3, .6, .3], [0, .3, 0], [PI, 0, 0]); P(g, 'sph', c, [.32, .3, .32], [0, .7, 0]); },
  hb_gadgetstall(g, c, P) {
    P(g, 'box', IRON, [.9, .4, .45], [0, .2, .05]); P(g, 'box', c, [.9, .5, .06], [0, .65, -.2]); P(g, 'box', 0xffe14a, [.1, .32, .03], [.03, .68, -.16], [0, 0, .5]);
    P(g, 'box', 0xffe14a, [.1, .2, .03], [-.05, .56, -.16], [0, 0, -.4]); P(g, 'cyl', 0xc8ccd4, [.015, .2, .015], [.36, .9, -.2]); P(g, 'sph', 0xff4a3a, [.035, .035, .035], [.36, .96, -.2]);
    P(g, 'sph', 0xffe14a, [.06, .07, .06], [-.25, .47, .1]); P(g, 'box', 0x4ac2d9, [.16, .12, .12], [.2, .46, .1]);
  },
  hb_battery(g, c, P) { P(g, 'cyl', c, [.3, .6, .3], [0, .3, 0]); P(g, 'cyl', 0xe8a23a, [.305, .26, .305], [0, .73, 0]); P(g, 'cyl', 0xc8ccd4, [.1, .1, .1], [0, .91, 0]); },
  hb_toyrobot(g, c, P) {
    for (const x of [-.13, .13]) P(g, 'box', IRON, [.14, .2, .16], [x, .1, 0]);
    P(g, 'box', c, [.5, .38, .32], [0, .39, 0]); P(g, 'box', 0xc8ccd4, [.34, .24, .26], [0, .7, 0]);
    for (const x of [-.08, .08]) P(g, 'sph', 0xffe14a, [.05, .05, .05], [x, .72, .13]);
    P(g, 'cyl', IRON, [.015, .14, .015], [0, .89, 0]); P(g, 'sph', 0xff4a3a, [.04, .04, .04], [0, .96, 0]);
  },
  hb_bbq(g, c, P) {
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; P(g, 'cyl', IRON, [.02, .5, .02], [Math.cos(a) * .3, .25, Math.sin(a) * .3]); }
    P(g, 'sph', c, [.42, .22, .42], [0, .56, 0]); P(g, 'cyl', 0xc8ccd4, [.42, .03, .42], [0, .64, 0]);
    P(g, 'cone', 0xd9301e, [.06, .3, .06], [-.12, .69, .05], [0, .4, H]); P(g, 'cone', 0xf2743a, [.06, .3, .06], [.1, .69, -.1], [0, -.6, H]); P(g, 'sph', 0xff8a3a, [.1, .05, .1], [.05, .68, .2]);
  },
  hb_chilli(g, c, P) { P(g, 'cone', c, [.16, .85, .16], [-.05, .16, 0], [0, 0, H]); P(g, 'cyl', 0x3f8f3a, [.04, .14, .04], [.42, .2, 0], [0, 0, 1]); },
  hb_urn(g, c, P) {
    P(g, 'cyl', c, [.2, .06, .2], [0, .03, 0]); P(g, 'sph', c, [.38, .36, .38], [0, .4, 0]); P(g, 'cyl', CREAM, [.385, .07, .385], [0, .42, 0]);
    P(g, 'cyl', c, [.18, .22, .18], [0, .82, 0]); P(g, 'cyl', c, [.24, .06, .24], [0, .95, 0]);
  },
  hb_rugroll(g, c, P) { P(g, 'cyl', c, [.2, 1, .2], [0, .5, 0]); P(g, 'cyl', CREAM, [.21, .07, .21], [0, .22, 0]); P(g, 'cyl', GOLD, [.21, .07, .21], [0, .78, 0]); P(g, 'cyl', CREAM, [.1, 1.005, .1], [0, .5, 0]); },
  hb_kiosk(g, c, P) {
    P(g, 'box', CREAM, [.7, .6, .7], [0, .3, 0]); P(g, 'box', 0x2a3a4a, [.5, .2, .04], [0, .42, .34]); P(g, 'box', PINE, [.74, .05, .2], [0, .3, .42]);
    P(g, 'box', c, [.92, .08, .92], [0, .64, 0]); P(g, 'box', CREAM, [.3, .085, .925], [0, .64, 0]);
    P(g, 'cone', 0xe8c98a, [.13, .2, .13], [0, .78, 0], [PI, 0, 0]); P(g, 'sph', 0xff8fb1, [.14, .12, .14], [0, .9, 0]);
  },
  hb_beachball(g, c, P) { P(g, 'sph', c, [.5, .5, .5], [0, .5, 0]); P(g, 'cyl', 0xffffff, [.505, .16, .505], [0, .5, 0]); P(g, 'cyl', 0xffd23f, [.505, .16, .505], [0, .5, 0], [0, 0, H]); },
  hb_herbjar(g, c, P) { P(g, 'cyl', c, [.34, .62, .34], [0, .31, 0]); P(g, 'box', CREAM, [.3, .24, .02], [0, .32, .335]); P(g, 'cyl', 0xa8743d, [.26, .14, .26], [0, .69, 0]); P(g, 'sph', 0x3f8f3a, [.14, .12, .14], [0, .86, 0]); },
  hb_fortunetent(g, c, P) {
    P(g, 'cyl', c, [.45, .4, .45], [0, .2, 0]); P(g, 'cone', 0x5a3a98, [.5, .5, .5], [0, .65, 0]); P(g, 'box', 0x24143a, [.22, .32, .03], [0, .16, .44]);
    P(g, 'sph', GOLD, [.06, .06, .06], [0, .93, 0]); for (const [x, y] of [[-.22, .3], [.24, .24], [.3, .1]]) P(g, 'sph', GOLD, [.04, .04, .02], [x, y, Math.sqrt(.2 - x * x)]);
  },
  hb_crystalball(g, c, P) { P(g, 'taper', 0x6a4aa8, [.34, .22, .34], [0, .11, 0]); P(g, 'sph', c, [.4, .4, .4], [0, .58, 0]); P(g, 'sph', 0xffffff, [.12, .12, .12], [.12, .7, .22]); },
  hb_carving(g, c, P) {
    P(g, 'cyl', WOOD, [.3, .2, .3], [0, .1, 0]); P(g, 'sph', c, [.3, .32, .28], [0, .48, 0]); P(g, 'sph', c, [.2, .2, .2], [0, .78, 0]);
    for (const x of [-.14, .14]) P(g, 'sph', c, [.07, .07, .07], [x, .93, 0]); P(g, 'sph', 0xe8c98a, [.09, .08, .09], [0, .75, .17]);
  },
  hb_producestand(g, c, P) {
    for (const x of [-.42, .42]) P(g, 'box', WOOD, [.06, .4, .45], [x, .2, 0]); P(g, 'box', PINE, [.95, .08, .5], [0, .44, 0]);
    P(g, 'sph', 0xf2903a, [.14, .1, .18], [-.3, .54, 0]); P(g, 'sph', 0xd93a3a, [.14, .1, .18], [0, .54, 0]); P(g, 'sph', 0x9bd94a, [.14, .1, .18], [.3, .54, 0]);
    for (const x of [-.36, .36]) P(g, 'cyl', WOOD, [.02, .5, .02], [x, .72, -.22]); P(g, 'box', c, [.8, .18, .04], [0, .9, -.22]);
  },
};

export function dress(m) {
  // A ring of n things round (x, z), first one at `phase` radians; with n a multiple of 4 it is the same from all four sides.
  const ringW = (id, x, z, r, n, phase = 0, opt = {}) => { for (let i = 0; i < n; i++) { const a = phase + i / n * PI * 2; m.put(id, x + Math.cos(a) * r, z + Math.sin(a) * r, Object.assign({ rot: H - a }, opt)); } };

  // quad(fn): runs a scene once per team quadrant. The scene is written in "pad coordinates": u = metres out from the feast
  // along the team's approach lane (the pad is at u = 29.7), v = metres to the side; rot 0 faces +v, rot PI/2 faces outward.
  // k = 0 south-east, 1 south-west, 2 north-west, 3 north-east. L.ax(r, t) is a point r metres out along the road that
  // bounds the quadrant on its +v side (k = 0 the south road, 1 west, 2 north, 3 east), t metres to the side of it.
  function quad(fn) {
    for (let k = 0; k < 4; k++) {
      const th = PI / 4 + k * H, c = Math.cos(th), s = Math.sin(th);
      const L = {
        k,
        put: (id, u, v, opt = {}) => m.put(id, c * u - s * v, s * u + c * v, Object.assign({}, opt, { rot: (opt.rot ?? 0) - th })),
        row(id, u1, v1, u2, v2, n, opt) { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; L.put(id, u1 + (u2 - u1) * t, v1 + (v2 - v1) * t, opt); } },
        ring(id, u, v, r, n, phase = 0, opt = {}) { for (let i = 0; i < n; i++) { const a = phase + i / n * PI * 2; L.put(id, u + Math.cos(a) * r, v + Math.sin(a) * r, Object.assign({ rot: H - a }, opt)); } },
        ax: (r, t = 0) => [(r - t) * Q, (r + t) * Q],
      };
      fn(L);
    }
  }

  // ================= THE FEAST: rings of treats on the paved circle, the best in the middle =================
  m.put('hb_feastrug', 0, 0);
  m.put('hb_grandtart', 0, 0);
  ringW('cupcake', 0, 0, 1.0, 8, PI / 8);
  ringW('hb_goldpie', 0, 0, 2.0, 4, PI / 4);            // one on each team's lane
  ringW('cake', 0, 0, 2.6, 8, PI / 8);
  ringW('hb_jelly', 0, 0, 3.2, 12, 0);
  ringW('hb_pie', 0, 0, 4.0, 16, PI / 16);
  ringW('hb_toffeeapple', 0, 0, 4.8, 16, 0);
  ringW('hb_bun', 0, 0, 5.6, 20, PI / 20);
  ringW('hb_jamtart', 0, 0, 6.4, 20, 0);
  ringW('hb_candy', 0, 0, 7.2, 24, PI / 24);
  ringW('hb_macaron', 0, 0, 8.0, 24, 0);
  ringW('hb_mast', 0, 0, 9.5, 4, 0, { rot: 0 });        // on the four roads, between the lanes

  // ================= one team's quarter of the green, repeated four times =================
  quad((L) => {
    // ---- the lane: empty, edged with breadcrumbs that lead to the feast
    const trail = ['hb_crumb', 'hb_crumb', 'hb_candy', 'hb_crumb', 'hb_macaron', 'hb_bun'];
    for (let i = 0; i < 13; i++) for (const v of [-2.25, 2.25]) L.put(trail[i % 6], 10 + i * 1.3, v);
    // ---- the pad: a horseshoe of sweets round it, the banner and the pit crew behind
    for (let i = 0; i < 8; i++) { const a = (-120 + i * 240 / 7) * PI / 180; L.put('hb_candy', 29.7 + Math.cos(a) * 3.25, Math.sin(a) * 3.25); }
    L.put('hb_startflag', 33.4, 0, { rot: 0 });
    L.put('hb_cooler', 31.9, 3.3, { rot: -H + 0.3 });
    L.put('hb_foldchair', 32.9, 1.9, { rot: -H });
    L.put('hb_waterbottle', 31.25, 4.0); L.put('hb_waterbottle', 32.55, 3.35);
    L.put('hb_towel', 32.6, -2.2, { rot: 0.4 });
    L.put('bucket', 31.7, -3.5);
    // ---- flower beds either side of the lane mouth
    for (const v of [-4.6, 4.6]) { L.put('hb_flowertub', 11.6, v); L.ring('flower', 11.6, v, 0.75, 6); }

    // ---- RING TOSS (left of the lane): pegs, quoits on the throwing line, prizes by the booth
    L.put('hb_booth', 17, 8.6, { rot: PI });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) L.put('hb_peg', 15.8 + i * 1.2, 5.2 + j * 1.2);
    L.row('hb_ring', 14.5, 3.5, 19.5, 3.5, 5);
    L.put('teddy', 15.1, 9.0, { rot: PI }); L.put('teddy', 18.9, 9.0, { rot: PI });
    L.put('hb_ring', 18.9, 9.0);                                    // somebody ringed the prize instead of the peg
    // ---- COCONUT SHY (right of the lane): balls on the line, coconuts on posts, the ones knocked off behind
    L.put('hb_booth', 17, -9.2, { rot: 0 });
    L.row('hb_coconutpost', 15.2, -6.6, 18.8, -6.6, 4);
    L.row('hb_ball', 14.5, -3.5, 19.5, -3.5, 6);
    for (const [u, v] of [[15.5, -7.6], [16.7, -7.4], [17.9, -7.7], [20.6, -7.9]]) L.put('hb_coconut', u, v);

    // ---- lantern posts, and a string of lanterns that has come down
    L.put('hb_lanternpost', 20.2, 10.3, { rot: 0.5 }); L.put('hb_lanternpost', 20.2, -10.3, { rot: -0.5 });
    L.row('hb_lantern', 19.9, 11.3, 18.9, 13.9, 3);

    // ---- FOOD STALL (left, by the pad): stock out front, teddies queueing politely
    L.put('hb_stall', 27.2, 8.6, { rot: PI });
    L.row('hb_toffeeapple', 25.9, 6.9, 28.5, 6.9, 3);
    L.put('hb_pie', 26.4, 6.2); L.put('hb_pie', 28.0, 6.2);
    L.put('pumpkin', 25.2, 8.3); L.put('pumpkin', 25.0, 9.3);
    L.put('crate', 29.2, 8.9, { rot: 0.3 }); L.put('crate', 29.4, 10.0, { rot: -0.2 });
    L.put('teddy', 27.2, 5.3, { rot: 0 }); L.put('teddy', 27.2, 4.5, { rot: 0 });
    // ---- PUPPET THEATRE (left, outer): the audience is two more puppets
    L.put('hb_puppettheatre', 24.2, 13.8, { rot: -H });
    L.put('hb_puppet', 22.7, 13.1, { rot: H }); L.put('hb_puppet', 22.6, 14.4, { rot: H });
    L.put('hb_balloons', 25.2, 12.1); L.put('hb_balloons', 25.6, 15.3);

    // ---- TOY STALL (right, by the pad): toy boats set off towards the water
    L.put('hb_stall', 25.6, -6.6, { rot: 0 });
    L.put('hb_drum', 27.4, -5.4); L.put('hb_drum', 27.7, -6.7);
    L.put('hb_puppet', 24.1, -5.2, { rot: 0 });
    L.put('hb_toyboat', 25.4, -8.5, { rot: 0.3 }); L.put('hb_toyboat', 25.9, -9.7, { rot: 0.1 });
    // ---- THE WATER: the ornamental pond on two sides, a paddling pool standing in for it on the other two
    const pu = 26.87, pv = -15.56;
    if (L.k % 2) L.put('hb_pool', pu, pv);
    L.put('hb_toyboat', pu - 1.5, pv + 1.0, { rot: 1 }); L.put('hb_toyboat', pu + 1.3, pv - 0.9, { rot: -0.6 });
    L.put('hb_duck', pu + 0.5, pv + 2.2, { rot: 2 }); L.put('hb_duck', pu - 2.2, pv - 1.4, { rot: 0.5 }); L.put('hb_duck', pu + 2.3, pv + 1.3, { rot: -1 });
    L.put('lily', pu - 0.4, pv - 2.4);
    L.put('bread', 22.4, -11.8); L.put('bread', 23.2, -11.1);       // the ducks' bread
    L.put('hb_gnome', 21.0, -14.8, { rot: H }); L.put('bucket', 20.9, -13.6);

    // ---- along the road on the +v side: mast, picnic, the big set piece, and a line of toffee apples out of the green
    const [au, av] = L.ax(14);
    L.put('blanket', au, av, { rot: PI / 4 });
    L.put('hb_hamper', ...L.ax(14.55, 0.45), { rot: 0.6 });
    L.put('hb_pie', ...L.ax(13.75, -0.4)); L.put('hb_pie', ...L.ax(14.2, -0.75));
    L.put('hb_jelly', ...L.ax(13.6, 0.4)); L.put('cup', ...L.ax(14.3, 0.9));
    for (let i = 0; i < 4; i++) L.put('hb_jamtart', ...L.ax(13.0 - i * 0.7, 0));   // tarts walking off towards the feast
    const [bu, bv] = L.ax(24.5);
    L.put(['hb_carousel', 'hb_marquee', 'hb_bandstand', 'hb_maypole'][L.k], bu, bv, { rot: -PI * 3 / 4 });
    L.ring('hb_flowertub', bu, bv, 2.5, 4, 0);
    L.put('hb_foldchair', ...L.ax(20.9, -1.2), { rot: PI / 4 }); L.put('hb_foldchair', ...L.ax(20.9, 1.2), { rot: PI / 4 });
    for (let i = 0; i < 5; i++) L.put('hb_toffeeapple', ...L.ax(29 + i * 1.5, 0));
  });

  // ================= THE RIM (beyond the ring road): a taste of each neighbouring climate =================
  const face = (x, z) => Math.atan2(-x, -z);          // rot that faces the centre of the green
  // N, towards the tundra: the snow-cone cart, buckets of ice, cones lined up along the road
  m.put('hb_snowcart', 5.8, -41.8, { rot: -H });
  for (const z of [-40.6, -41.8, -43.0]) m.put('hb_cone', 3.5, z);
  m.put('bucket', 7.4, -40.2); m.put('bucket', 7.7, -43.2); m.put('crate', 7.9, -41.7, { rot: 0.2 });
  m.put('sign', 4.6, -39.3, { rot: -H });
  // NE, towards the Stormworks: the gadget stall, batteries, wind-up robots that have marched off
  m.put('hb_gadgetstall', 29.8, -29.8, { rot: face(29.8, -29.8) });
  m.row('hb_battery', 27.1, -29.3, 29.3, -27.1, 4);
  m.put('hb_toyrobot', 26.6, -27.4, { rot: face(1, -1) }); m.put('hb_toyrobot', 25.9, -26.7, { rot: face(1, -1) }); m.put('hb_toyrobot', 25.2, -26.0, { rot: face(1, -1) });
  m.put('crate', 31.9, -28.2, { rot: 0.5 });
  // E, towards the ash flats: a barbecue, chillies in a row, sauce bottles, a barrel of charcoal
  m.put('hb_bbq', 41.8, 5.8);
  m.row('hb_chilli', 39.6, 3.6, 43.2, 3.6, 4);
  for (const [x, z] of [[40.2, 6.4], [40.3, 7.0], [40.9, 7.4]]) m.put('tonic', x, z);
  m.put('barrel', 43.6, 6.4); m.put('hb_urn', 42.4, 7.9, { scale: 0.8 });
  // SE, towards the canyon: the pottery and rug seller
  m.put('blanket', 29.8, 29.8, { rot: PI / 4, scale: 1.5 });
  m.put('hb_urn', 28.2, 30.6); m.put('hb_urn', 30.6, 28.2); m.put('hb_urn', 31.6, 31.6, { scale: 1.6 });
  m.put('pot', 28.9, 28.1); m.put('pot', 27.9, 29.0); m.put('pot', 29.8, 29.8);
  m.put('hb_rugroll', 31.9, 29.6); m.put('hb_rugroll', 29.6, 32.0);
  // S, towards the beach: the ice-cream kiosk, cones, beach balls, a bucket
  m.put('hb_kiosk', -6.0, 41.8, { rot: H });
  for (const z of [40.6, 41.8, 43.0]) m.put('hb_cone', -3.5, z);
  m.put('hb_beachball', -7.9, 39.9); m.put('hb_beachball', -8.4, 43.4); m.put('hb_beachball', -4.4, 44.6);
  m.put('bucket', -8.9, 41.6);
  // SW, towards the marsh: the herbalist's table and jars, and the fortune-teller
  m.put('table', -33.6, 25.8, { rot: face(-33.6, 25.8) });
  m.row('hb_herbjar', -32.9, 23.9, -31.6, 26.6, 4);
  m.put('pot', -35.0, 27.4); m.put('pot', -34.4, 24.0);
  m.put('hb_fortunetent', -26.6, 33.2, { rot: face(-26.6, 33.2) });
  m.put('hb_crystalball', -25.2, 31.4); m.put('sign', -28.6, 31.6, { rot: face(-28.6, 31.6) });
  // W, towards the forest: the wood-carver (three bears, small to large) and the mushroom seller
  m.put('hb_carving', -40.4, -4.4, { rot: H, scale: 0.6 }); m.put('hb_carving', -41.6, -5.2, { rot: H }); m.put('hb_carving', -43.2, -6.4, { rot: H, scale: 1.5 });
  m.put('stump', -43.4, -4.2); m.put('log', -41.2, -7.4, { rot: 0.4 });
  m.row('mushroom', -39.4, -3.4, -39.4, -5.8, 3);
  m.put('mushroom', -39.6, -7.0, { scale: 3 }); m.put('mushroom', -40.2, -8.0, { scale: 3 });
  // NW, towards the farms: the produce stand, pumpkins, a line of apples, a hay bale
  m.put('hb_producestand', -29.8, -29.8, { rot: face(-29.8, -29.8) });
  m.put('pumpkin', -27.6, -28.6); m.put('pumpkin', -28.6, -27.6); m.put('pumpkin', -27.4, -27.4);
  m.row('apple', -26.6, -26.6, -25.1, -25.1, 4);
  m.put('hay', -32.2, -28.6, { scale: 0.5 }); m.put('crate', -28.4, -31.9, { rot: 0.4 });
}
