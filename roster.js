// All game content lives here. Edit this file to change creatures, items and level rules.
// Where things are placed, and how many, is in map.js. Model sources are in CREDITS.md.
//
// The 151 critters are in critters/critters_1.js, _2.js and _3.js (format: critters/kit.js).
// How many of each appear is set by RARITY below; where they live is set by each critter's habitat and map.js.
(function () {
  const N = 'models/kenney/nature/', F = 'models/kenney/food/', U = 'models/kenney/furniture/';
  const T = 'models/kenney/town/', X = 'models/kenney/hex/', Y = 'models/kenney/graveyard/', Q = 'models/quaternius/';
  const g = (dir, names) => names.split(' ').map((n) => dir + n + '.glb');

  window.ROLLUP_DATA = {
    TYPE_COLORS: {
      normal: '#a8a090', fire: '#f2743a', water: '#4a9be8', grass: '#57b65a', electric: '#e9bf2a', ice: '#7fd0d8',
      fighting: '#c0503a', poison: '#a05ab8', ground: '#c9a35a', flying: '#8fa8e8', psychic: '#f06a9a', bug: '#9bbf3b',
      rock: '#a08b6a', ghost: '#6f5aa8', dragon: '#6a5ae0',
    },
    // rarity -> [number of groups, critters per group]
    RARITY: { common: [3, 3], uncommon: [2, 3], rare: [2, 1], unique: [1, 1] },

    // ITEMS
    //   size    metres (longest dimension). Same 40% rule as creatures.
    //   model   a path, or a list of paths (one is picked at random per item; null in the list = generated shape)
    //   shape, colors   the generated fallback shape
    //   rad     collision radius as a fraction of size (default 0.35)
    //   flat    true = lies on the ground; the ball rolls over it until it can pick it up
    //   mass    how much of its bulk counts towards growth (default 1). Trees and buildings are mostly air.
    ITEMS: [
      { id: 'berry',     name: 'Berry',          size: 0.03,  model: g(F, 'strawberry cherries grapes'),            shape: 'berry',    colors: [0xd9415f, 0x6a5acd, 0xf29f3a] },
      { id: 'coin',      name: 'Coin',           size: 0.035, shape: 'coin',     colors: [0xf1c935] },
      { id: 'acorn',     name: 'Acorn',          size: 0.04,  model: g(F, 'coconut'),                                shape: 'berry',    colors: [0xa8743d] },
      { id: 'sushi',     name: 'Sushi',          size: 0.05,  model: g(F, 'sushiSalmon sushiEgg makiSalmon'),        shape: 'berry',    colors: [0xf29f3a] },
      { id: 'pebble',    name: 'Pebble',         size: 0.05,  model: g(N, 'rock_smallA rock_smallB rock_smallC stone_smallA'), shape: 'boulder', colors: [0x9a9a9a, 0xb8ad98] },
      { id: 'flower',    name: 'Flower',         size: 0.08,  model: g(N, 'flower_redA flower_yellowA flower_purpleA flower_redB flower_yellowB flower_purpleB'), shape: 'flower', colors: [0xff8fb1, 0xffffff, 0xc59bff, 0xffb347] },
      { id: 'cupcake',   name: 'Cupcake',        size: 0.08,  model: g(F, 'cupcake muffin cookie cookieChocolate'),  shape: 'berry',    colors: [0xff8fb1] },
      { id: 'apple',     name: 'Fruit',          size: 0.09,  model: g(F, 'apple pear orange lemon'),                shape: 'berry',    colors: [0xd93a3a, 0x9bd94a] },
      { id: 'donut',     name: 'Donut',          size: 0.10,  model: g(F, 'donut donutSprinkles donutChocolate'),    shape: 'coin',     colors: [0xe8a26a] },
      { id: 'mushroom',  name: 'Mushroom',       size: 0.11,  model: g(N, 'mushroom_red mushroom_tan mushroom_redTall'), shape: 'mushroom', colors: [0xd9415f, 0xc98a4a] },
      { id: 'burger',    name: 'Snack',          size: 0.13,  model: g(F, 'burger burgerCheese hotDog taco croissant'), shape: 'berry', colors: [0xc98a4a] },
      { id: 'tonic',     name: 'Tonic Bottle',   size: 0.14,  model: g(F, 'sodaBottle bottleOil honey bottleKetchup'), shape: 'bottle', colors: [0x9b6ae6, 0x4ac2d9, 0xf2743a] },
      { id: 'cup',       name: 'Cup',            size: 0.18,  model: g(F, 'cup mug sodaCan can'),                    shape: 'cup',      colors: [0xc8ccd4] },
      { id: 'bread',     name: 'Bread',          size: 0.22,  model: g(F, 'bread loaf loafBaguette cheese'),         shape: 'crate',    colors: [0xd9a86a] },
      { id: 'boot',      name: 'Old Boot',       size: 0.25,  shape: 'boot',     colors: [0x7a5a3a, 0x3a4a6a] },
      { id: 'cake',      name: 'Feast',          size: 0.28,  model: g(F, 'cake cakeBirthday pineapple wholeHam turkey'), shape: 'barrel', colors: [0xf3ead7] },
      { id: 'teddy',     name: 'Teddy Bear',     size: 0.30,  model: g(U, 'bear'),                                   shape: 'bush',     colors: [0xa8743d] },
      { id: 'pot',       name: 'Flowerpot',      size: 0.32,  model: g(N, 'pot_small').concat(g(U, 'plantSmall1 plantSmall2 plantSmall3 pottedPlant')), shape: 'pot', colors: [0x57b65a, 0xff8fb1] },
      { id: 'pumpkin',   name: 'Pumpkin',        size: 0.40,  model: g(N, 'crop_pumpkin crop_melon').concat(g(F, 'watermelon pumpkin')), shape: 'berry', colors: [0xf2903a] },
      { id: 'bucket',    name: 'Bucket',         size: 0.40,  shape: 'bucket',   colors: [0x8fa3b8, 0xd95a4a] },
      { id: 'lily',      name: 'Lily Pad',       size: 0.50,  model: g(N, 'lily_large lily_small'),                  shape: 'coin',     colors: [0x57b65a], rad: 0.3, flat: true },
      { id: 'crate',     name: 'Box',            size: 0.60,  model: g(U, 'cardboardBoxClosed cardboardBoxOpen'),    shape: 'crate',    colors: [0xc99a5a] },
      { id: 'chair',     name: 'Chair',          size: 0.80,  model: g(U, 'chair trashcan').concat(g(T, 'stallStool')), shape: 'crate', colors: [0xc99a5a] },
      { id: 'barrel',    name: 'Barrel',         size: 0.90,  model: g(F, 'barrel'),                                 shape: 'barrel',   colors: [0xa8743d] },
      { id: 'stump',     name: 'Stump',          size: 0.90,  model: g(N, 'stump_round stump_old stump_roundDetailed'), shape: 'barrel', colors: [0x8a5a2b] },
      { id: 'campfire',  name: 'Campfire',       size: 1.00,  model: g(N, 'campfire_stones campfire_logs'),          shape: 'boulder',  colors: [0x8f8f8f] },
      { id: 'sign',      name: 'Signpost',       size: 1.10,  model: g(N, 'sign'),                                   shape: 'sign',     colors: [0xe8d9a8], rad: 0.2 },
      { id: 'mailbox',   name: 'Mailbox',        size: 1.20,  shape: 'mailbox',  colors: [0xd9415f, 0x4a9be8], rad: 0.2 },
      { id: 'crop',      name: 'Crops',          size: 1.20,  model: g(N, 'crops_cornStageD crops_wheatStageB'),     shape: 'bush',     colors: [0xd9c34a], rad: 0.25 },
      { id: 'bush',      name: 'Bush',           size: 1.30,  model: g(N, 'plant_bush plant_bushLarge plant_bushDetailed'), shape: 'bush', colors: [0x4c9e4a, 0x6fbf5a] },
      { id: 'log',       name: 'Log',            size: 1.40,  model: g(N, 'log log_large log_stack'),                shape: 'barrel',   colors: [0x8a5a2b] },
      { id: 'blanket',   name: 'Picnic Blanket', size: 1.40,  shape: 'blanket',  colors: [0xe86b6b], rad: 0.3, flat: true },
      { id: 'fence',     name: 'Fence',          size: 1.50,  model: g(N, 'fence_simple fence_planks'),              shape: 'fence',    colors: [0xf3ead7, 0xc99a5a] },
      { id: 'table',     name: 'Table',          size: 1.60,  model: g(U, 'tableCloth tableRound').concat(g(T, 'stallBench')), shape: 'crate', colors: [0xc99a5a] },
      { id: 'bench',     name: 'Bench',          size: 1.70,  model: g(U, 'bench benchCushion'),                     shape: 'bench',    colors: [0xa8743d] },
      { id: 'appliance', mass: 0.5, name: 'Household Junk', size: 1.80,  model: g(U, 'kitchenFridge washer televisionVintage toilet bathtub loungeSofa bedSingle'), shape: 'crate', colors: [0xc8ccd4] },
      { id: 'boulder', mass: 0.6,   name: 'Boulder',        size: 2.00,  model: g(N, 'rock_largeA rock_largeB rock_largeC rock_largeD'), shape: 'boulder', colors: [0x8f8f8f, 0xa08b6a] },
      { id: 'statue', mass: 0.5,    name: 'Statue',         size: 2.20,  model: g(N, 'statue_head statue_column statue_ring').concat(g(Y, 'urn')), shape: 'barrel', colors: [0xb8b4a8], rad: 0.3 },
      { id: 'hay',       name: 'Hay Bale',       size: 2.40,  shape: 'barrel',   colors: [0xe8c95a] },
      { id: 'cart', mass: 0.5,      name: 'Cart',           size: 2.60,  model: g(T, 'cart cartHigh'),                          shape: 'cart',     colors: [0xd95a4a, 0x4a9be8] },
      { id: 'stall', mass: 0.4,     name: 'Market Stall',   size: 2.80,  model: g(T, 'stall stallGreen stallRed'),              shape: 'cart',     colors: [0xd95a4a] },
      { id: 'tent', mass: 0.3,      name: 'Tent',           size: 3.00,  model: g(N, 'tent_detailedOpen tent_smallOpen tent_detailedClosed'), shape: 'shed', colors: [0xd9a23a] },
      { id: 'lamp', mass: 0.3,      name: 'Street Lamp',    size: 3.20,  model: g(Y, 'lightpostSingle lightpostDouble'),        shape: 'lamp',     colors: [0xfff2b0], rad: 0.08 },
      { id: 'fountain', mass: 0.4,  name: 'Fountain',       size: 3.40,  model: g(T, 'fountainRoundDetail'),                    shape: 'barrel',   colors: [0xb8b4a8], rad: 0.45 },
      { id: 'sapling', mass: 0.3,   name: 'Young Tree',     size: 3.50,  model: g(N, 'tree_small tree_default tree_simple').concat(g(T, 'tree')), shape: 'roundtree', colors: [0x6fbf5a, 0x8fd06a], rad: 0.14 },
      { id: 'canoe', mass: 0.3,     name: 'Boat',           size: 3.60,  model: g(N, 'canoe').concat(g(X, 'unit_boat')),        shape: 'cart',     colors: [0x8a5a2b], rad: 0.2 },
      { id: 'shed', mass: 0.15,      name: 'Shed',           size: 4.00,  model: g(X, 'unit_house'),                             shape: 'shed',     colors: [0x7a5a3a, 0x5a7a9a], rad: 0.45 },
      { id: 'bigrock', mass: 0.3,   name: 'Great Rock',     size: 4.50,  model: g(N, 'rock_tallA rock_tallB rock_tallC rock_tallD'), shape: 'boulder', colors: [0x8a8a86, 0x9a8b78] },
      { id: 'obelisk', mass: 0.3,   name: 'Obelisk',        size: 5.00,  model: g(N, 'statue_obelisk').concat(g(Y, 'pillarObelisk')), shape: 'tower', colors: [0x9a948a], rad: 0.15 },
      { id: 'barn', mass: 0.1,      name: 'Barn',           size: 5.00,  model: g(X, 'unit_houseLarge'),                        shape: 'shed',     colors: [0xb8433a], rad: 0.45 },
      { id: 'tree', mass: 0.05,      name: 'Pine Tree',      size: 6.50,  model: g(N, 'tree_pineTallA tree_pineTallB tree_pineTallC tree_pineRoundA tree_pineRoundC tree_pineDefaultA tree_cone'), shape: 'tree', colors: [0x2f7a45, 0x3f8a4a], rad: 0.12 },
      { id: 'oak', mass: 0.05,       name: 'Oak Tree',       size: 7.50,  model: g(N, 'tree_oak tree_detailed tree_fat').concat(g(T, 'treeHigh')), shape: 'roundtree', colors: [0x4c9e4a], rad: 0.12 },
      { id: 'house', mass: 0.06,     name: 'House',          size: 8.00,  model: [null, null],                                   shape: 'house',    colors: [0xd9534a, 0x4a86d9, 0x57a85a, 0xe8a23a], rad: 0.5 },
      { id: 'tallhouse', mass: 0.06, name: 'Tall House',     size: 10.0,  model: [null],                                         shape: 'tallhouse', colors: [0x9b6ae6, 0xd9534a], rad: 0.32 },
      { id: 'windmill', mass: 0.06,  name: 'Windmill',       size: 13.0,  model: g(X, 'unit_mill'),                              shape: 'windmill', colors: [0xd9534a], rad: 0.25 },
      { id: 'tower', mass: 0.06,     name: 'Lookout Tower',  size: 16.0,  model: g(X, 'unit_tower'),                             shape: 'tower',    colors: [0x4a86d9], rad: 0.22 },
    ],

    // The round. Free roam uses the same map with no clock, rivals or battle.
    LEVEL: {
      name: 'The Five Rings',
      seconds: 180,               // three minutes: new critters at each minute, everything back for the last 30 seconds
      targetDiameter: 0,          // 0 = no size target: a round is won in the battle afterwards
      challenges: [],             // optional extra goals, e.g. { kind: 'type', value: 'grass', count: 6, label: 'Hold 6 grass types' }
    },
  };
})();
