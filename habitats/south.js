// THE SOUTH: Shellsand Beach, the Tide Pools, Pearl Bay and its Islets, Mirewater Marsh and Gloomrest.
// Everything here is laid out as scenes (one helper or block per scene); dress() at the bottom says where they go.
// North is -z, east is +x. Rotation 0 faces south (+z).

const PI = Math.PI, H = PI / 2;
const WOOD = 0x8a5a2b, DWOOD = 0x5a3a1e, CREAM = 0xf3ead7, WHITE = 0xffffff, IRON = 0x555b66, DARK = 0x2c2c34, STONE = 0xa9a79c, DSTONE = 0x7d7b74;
const SAND = 0xe6cf8f, SKIN = 0xf0b48a, GOLD = 0xf1c935, RED = 0xd9413a, MOSS = 0x5f8f4a, LEAF = 0x3f9a4a, GLOW = 0xfff2a0, TAN = 0xc9a86a;

export const ITEMS = [
  // ---- Shellsand Beach
  { id: 'be_shell',     name: 'Seashell',          size: 0.07, shape: 'be_shell',     colors: [0xffc9c2, 0xfff1dc, 0xf7b98a] },
  { id: 'be_icecream',  name: 'Ice-cream Cone',    size: 0.12, shape: 'be_icecream',  colors: [0xff9ec0, 0xfff1c9, 0x9be0c0, 0x8a5a3a] },
  { id: 'be_starfish',  name: 'Starfish',          size: 0.16, shape: 'be_starfish',  colors: [0xf2743a, 0xe8527a, 0xf2b03a], flat: true, rad: 0.3 },
  { id: 'be_flipflop',  name: 'Flip-flop',         size: 0.22, shape: 'be_flipflop',  colors: [0x3ab8d9, 0xff7aa8, 0xf2c03a, 0x6ad94a] },
  { id: 'be_foot',      name: 'Wiggling Foot',     size: 0.25, shape: 'be_foot',      colors: [SKIN] },
  { id: 'be_spade',     name: 'Beach Spade',       size: 0.30, shape: 'be_spade',     colors: [RED, 0x3a8ad9, 0xf2c03a], rad: 0.25 },
  { id: 'be_head',      name: 'Buried Dad',        size: 0.30, shape: 'be_head',      colors: [0xf2e2b0, 0x3a8ad9] },
  { id: 'be_pail',      name: 'Beach Pail',        size: 0.32, shape: 'bucket',       colors: [RED, 0x3a8ad9, 0xf2c03a, 0x4ac27a] },
  { id: 'be_ball',      name: 'Beach Ball',        size: 0.45, shape: 'be_ball',      colors: [RED, 0x3a8ad9, 0xf2c03a] },
  { id: 'be_cooler',    name: 'Cooler Box',        size: 0.50, shape: 'be_cooler',    colors: [0x3a8ad9, RED] },
  { id: 'be_castle',    name: 'Sandcastle',        size: 0.65, shape: 'be_castle',    colors: [RED, 0x3a8ad9, 0xf2c03a], rad: 0.4, mass: 0.7 },
  { id: 'be_bollard',   name: 'Mooring Bollard',   size: 0.65, shape: 'be_bollard',   colors: [0xc9a86a] },
  { id: 'be_ring',      name: 'Life Ring',         size: 0.65, shape: 'be_ring',      colors: [RED, 0xf2743a], floats: true },
  { id: 'be_deckchair', name: 'Deckchair',         size: 0.95, shape: 'be_deckchair', colors: [RED, 0x3a8ad9, 0xf2c03a, 0x4ac27a] },
  { id: 'be_rod',       name: 'Fishing Rod',       size: 1.40, shape: 'be_rod',       colors: [0x3a3a44], rad: 0.1, mass: 0.3 },
  { id: 'be_oar',       name: 'Oar',               size: 1.40, shape: 'be_oar',       colors: [RED, 0x3a8ad9, 0xf2c03a, WHITE], flat: true, rad: 0.2, mass: 0.3 },
  { id: 'be_telescope', name: 'Pier Telescope',    size: 1.50, shape: 'be_telescope', colors: [0xd9a23a], rad: 0.2, mass: 0.5 },
  { id: 'be_towel',     name: 'Beach Towel',       size: 1.60, shape: 'be_towel',     colors: [0xff7aa8, 0x3ab8d9, 0xf2c03a, 0x9b6ae6], flat: true, rad: 0.3 },
  { id: 'be_mound',     name: 'Sand Mound',        size: 1.80, shape: 'be_mound',     colors: [SAND], flat: true, rad: 0.3 },
  { id: 'be_surfboard', name: 'Surfboard',         size: 2.00, shape: 'be_surfboard', colors: [0xff7aa8, 0x3ab8d9, 0xf2c03a, 0x6ad94a, 0xf2743a], rad: 0.12, mass: 0.4 },
  { id: 'be_cart',      name: 'Ice-cream Cart',    size: 2.00, shape: 'be_cart',      colors: [0xff7aa8], mass: 0.5 },
  { id: 'be_parasol',   name: 'Parasol',           size: 2.20, shape: 'be_parasol',   colors: [RED, 0x3a8ad9, 0xf2c03a, 0xff7aa8], rad: 0.1, mass: 0.3 },
  { id: 'be_rowboat',   name: 'Rowing Boat',       size: 2.90, shape: 'be_rowboat',   colors: [RED, 0x3a8ad9, 0xf2c03a, 0x4ac27a, WHITE], rad: 0.28, mass: 0.4 },
  { id: 'be_hut',       name: 'Beach Hut',         size: 3.40, shape: 'be_hut',       colors: [RED, 0x3a8ad9, 0xf2c03a, 0x4ac27a, 0xff7aa8], rad: 0.4, mass: 0.15 },
  { id: 'be_net',       name: 'Volleyball Net',    size: 3.60, shape: 'be_net',       colors: [RED], rad: 0.1, mass: 0.15 },
  { id: 'be_kite',      name: 'Kite on a Pole',    size: 4.20, shape: 'be_kite',      colors: [RED, 0x3a8ad9, 0xf2c03a, 0x9b6ae6, 0x4ac27a], rad: 0.06, mass: 0.12 },
  { id: 'be_tower',     name: 'Lifeguard Tower',   size: 6.00, shape: 'be_tower',     colors: [RED], rad: 0.25, mass: 0.1 },
  // ---- the Tide Pools
  { id: 'tp_bottle',    name: 'Message in a Bottle', size: 0.32, shape: 'tp_bottle',  colors: [0x7ac9a0, 0x8ac2d9] },
  { id: 'tp_fish',      name: 'Fresh Fish',        size: 0.45, shape: 'tp_fish',      colors: [0xa9c2d4, 0xd4b8a9, 0x8fb0c9] },
  { id: 'tp_pot',       name: 'Lobster Pot',       size: 0.65, shape: 'tp_pot',       colors: [0xb08a5a, 0x9a7a4a] },
  { id: 'tp_rope',      name: 'Coiled Rope',       size: 0.95, shape: 'tp_rope',      colors: [0xd9c28a, 0xc9a86a] },
  { id: 'tp_rock',      name: 'Barnacled Rock',    size: 1.00, shape: 'tp_rock',      colors: [0x7f8a8a, 0x8a8478], mass: 0.6 },
  { id: 'tp_conch',     name: 'Giant Conch',       size: 1.00, shape: 'tp_conch',     colors: [0xffd2b8, 0xfff1dc], mass: 0.5 },
  { id: 'tp_anchor',    name: 'Anchor',            size: 1.40, shape: 'tp_anchor',    colors: [0x4a5058], rad: 0.3, mass: 0.7 },
  { id: 'tp_clam',      name: 'Giant Clam',        size: 1.40, shape: 'tp_clam',      colors: [0xf7e2ea, 0xd9e8f0], mass: 0.5 },
  { id: 'tp_netrack',   name: 'Drying Net',        size: 2.90, shape: 'tp_netrack',   colors: [0x4a9a9a, 0x5a8ab0], rad: 0.25, mass: 0.3 },
  { id: 'tp_slab',      name: 'Fish Market Slab',  size: 2.90, shape: 'tp_slab',      colors: [0xc9c7bc], mass: 0.6 },
  { id: 'tp_hull',      name: 'Hull on Trestles',  size: 4.20, shape: 'tp_hull',      colors: [0x3a6a9a, 0xb8433a, 0x3a8a6a], rad: 0.3, mass: 0.3 },
  { id: 'tp_cottage',   name: "Keeper's Cottage",  size: 5.00, shape: 'tp_cottage',   colors: [0xb8433a], rad: 0.42, mass: 0.1 },
  { id: 'tp_lighthouse', name: 'Lighthouse',       size: 16.0, shape: 'tp_lighthouse', colors: [RED], rad: 0.14, mass: 0.06 },
  // ---- Pearl Bay and the Islets
  { id: 'se_crate',     name: 'Floating Crate',    size: 0.95, shape: 'crate',        colors: [0xc99a5a, 0xb08a5a], floats: true },
  { id: 'se_buoy',      name: 'Buoy',              size: 1.40, shape: 'se_buoy',      colors: [RED, 0xf2743a, 0xf2c03a], floats: true, rad: 0.3 },
  { id: 'se_barrel',    name: 'Floating Barrel',   size: 1.40, shape: 'barrel',       colors: [0xa8743d], floats: true },
  { id: 'se_stone',     name: 'Signal Stone',      size: 1.40, shape: 'se_stone',     colors: [0xf0ece0, 0xe2ddd0], mass: 0.8 },
  { id: 'se_coconut',   name: 'Coconut',           size: 1.40, shape: 'se_coconut',   colors: [0x8a5a3a] },
  { id: 'se_shovel',    name: 'Shovel',            size: 1.60, shape: 'se_shovel',    colors: [0x8f98a3], rad: 0.1, mass: 0.4 },
  { id: 'se_slantern',  name: 'Stone Lantern',     size: 1.60, shape: 'se_slantern',  colors: [GLOW], rad: 0.25, mass: 0.7 },
  { id: 'se_heap',      name: 'Heap of Earth',     size: 2.00, shape: 'se_heap',      colors: [0x9a7a4a, 0x7a6a52], mass: 0.7 },
  { id: 'se_fire',      name: 'Signal Fire',       size: 2.00, shape: 'se_fire',      colors: [0xf2743a], mass: 0.5 },
  { id: 'se_chest',     name: 'Treasure Chest',    size: 2.00, shape: 'se_chest',     colors: [0x9a3a2a], mass: 0.8 },
  { id: 'se_cannon',    name: 'Cannon',            size: 2.00, shape: 'se_cannon',    colors: [0x33363c], mass: 0.8 },
  { id: 'se_idol',      name: 'Mossy Idol',        size: 2.20, shape: 'se_idol',      colors: [STONE], rad: 0.3, mass: 0.8 },
  { id: 'se_raft',      name: "Castaway's Raft",   size: 2.90, shape: 'se_raft',      colors: [RED], floats: true, mass: 0.4 },
  { id: 'se_leanto',    name: 'Palm-leaf Shelter', size: 2.90, shape: 'se_leanto',    colors: [0x6aa84a], mass: 0.3 },
  { id: 'se_x',         name: 'X Marks the Spot',  size: 2.90, shape: 'se_x',         colors: [RED], flat: true, rad: 0.3, mass: 0.2 },
  { id: 'se_hammock',   name: 'Hammock',           size: 2.90, shape: 'se_hammock',   colors: [0xf2c03a, 0xff7aa8], rad: 0.25, mass: 0.3 },
  { id: 'se_tiki',      name: 'Tiki Post',         size: 2.90, shape: 'se_tiki',      colors: [0x9a6a3a], rad: 0.2, mass: 0.7 },
  { id: 'se_column',    name: 'Shrine Column',     size: 2.90, shape: 'se_column',    colors: [0xd9d2bc], rad: 0.18, mass: 0.6 },
  { id: 'se_flag',      name: 'Flagpole',          size: 4.20, shape: 'se_flag',      colors: [DARK, RED], rad: 0.06, mass: 0.12 },
  { id: 'se_fishboat',  name: 'Fishing Boat',      size: 4.20, shape: 'se_fishboat',  colors: [0x3a8ad9, RED, 0x4ac27a], floats: true, rad: 0.3, mass: 0.3 },
  { id: 'se_duck',      name: 'Giant Rubber Duck', size: 4.20, shape: 'se_duck',      colors: [0xffd83a], floats: true, mass: 0.3 },
  { id: 'se_bell',      name: 'Shrine Bell',       size: 4.20, shape: 'se_bell',      colors: [0xb08a3a], rad: 0.3, mass: 0.4 },
  { id: 'se_palm',      name: 'Coconut Palm',      size: 6.00, shape: 'se_palm',      colors: [0x4aa84a, 0x5ab85a], rad: 0.08, mass: 0.1 },
  { id: 'se_arch',      name: 'Shrine Arch',       size: 6.00, shape: 'se_arch',      colors: [0xc9442a], rad: 0.3, mass: 0.12 },
  { id: 'se_serpent',   name: 'Inflatable Sea Serpent', size: 9.00, shape: 'se_serpent', colors: [0x4ad98a, 0xa9d93a], floats: true, rad: 0.3, mass: 0.15 },
  { id: 'se_ship',      name: 'Sailing Ship',      size: 12.0, shape: 'se_ship',      colors: [RED, 0x3a6a9a], floats: true, rad: 0.3, mass: 0.08 },
  // ---- Mirewater Marsh
  { id: 'ma_shroom',    name: 'Toadstool',         size: 0.10, shape: 'ma_shroom',    colors: [0xd9413a, 0xe8527a, 0xc98a2a], rad: 0.3 },
  { id: 'ma_jar',       name: 'Jar of Fireflies',  size: 0.15, shape: 'ma_jar',       colors: [0xe6f27a, 0xc9f28a] },
  { id: 'ma_ingredient', name: 'Ingredient Jar',   size: 0.22, shape: 'bottle',       colors: [0x9b6ae6, 0x4ac27a, 0xf2743a, 0xe8527a, 0x4ac2d9] },
  { id: 'ma_reed',      name: 'Cattail Clump',     size: 0.65, shape: 'ma_reed',      colors: [0x6f9a4a, 0x86a85a], rad: 0.2, mass: 0.5 },
  { id: 'ma_stone',     name: 'Stepping Stone',    size: 0.65, shape: 'ma_stone',     colors: [0x8f9488, 0x9a9a8c], flat: true, rad: 0.3 },
  { id: 'ma_trap',      name: 'Eel Trap',          size: 0.65, shape: 'ma_trap',      colors: [0xb0965a] },
  { id: 'ma_fern',      name: 'Fern Clump',        size: 0.80, shape: 'ma_fern',      colors: [0x4f9650, 0x5fa85a], rad: 0.25, mass: 0.5 },
  { id: 'ma_bundle',    name: 'Reed Bundle',       size: 0.95, shape: 'ma_bundle',    colors: [0xc9b86a, 0xb8a85a], rad: 0.3 },
  { id: 'ma_cauldron',  name: 'Bubbling Cauldron', size: 0.95, shape: 'ma_cauldron',  colors: [0x7ad94a, 0xb06ae6] },
  { id: 'ma_lotus',     name: 'Lotus Flower',      size: 0.95, shape: 'ma_lotus',     colors: [0xff9ec0, 0xfff1f5], rad: 0.3, mass: 0.4 },
  { id: 'ma_post',      name: 'Jetty Post',        size: 1.00, shape: 'ma_post',      colors: [0x7a5a3a], rad: 0.15 },
  { id: 'ma_frognet',   name: 'Frog Net',          size: 1.20, shape: 'ma_frognet',   colors: [0x4ac27a], rad: 0.1, mass: 0.3 },
  { id: 'ma_plank',     name: 'Boardwalk Plank',   size: 1.40, shape: 'ma_plank',     colors: [0xa8845a, 0x9a7a4a], flat: true, rad: 0.25, mass: 0.3 },
  { id: 'ma_driftwood', name: 'Driftwood',         size: 1.40, shape: 'ma_driftwood', colors: [0xcfc2a8], rad: 0.25, mass: 0.5 },
  { id: 'ma_lantern',   name: 'Firefly Lantern',   size: 2.00, shape: 'ma_lantern',   colors: [0xe6f27a], rad: 0.08, mass: 0.3 },
  { id: 'ma_pole',      name: 'Punt Pole',         size: 2.00, shape: 'ma_pole',      colors: [0x9a7a4a], rad: 0.06, mass: 0.2 },
  { id: 'ma_rotlog',    name: 'Rotten Log',        size: 2.00, shape: 'ma_rotlog',    colors: [0x6a4a2a], rad: 0.3, mass: 0.6 },
  { id: 'ma_mangrove',  name: 'Mangrove',          size: 2.40, shape: 'ma_mangrove',  colors: [0x4a8a4a], rad: 0.3, mass: 0.3 },
  { id: 'ma_punt',      name: 'Punt',              size: 2.90, shape: 'ma_punt',      colors: [0x6a8a4a, 0x8a6a3a], rad: 0.25, mass: 0.4 },
  { id: 'ma_net',       name: 'Washed-up Net',     size: 2.90, shape: 'ma_net',       colors: [0x4a9a9a], flat: true, rad: 0.3, mass: 0.2 },
  { id: 'ma_statue',    name: 'Sunken Statue',     size: 4.20, shape: 'ma_statue',    colors: [0x9aa094], rad: 0.3, mass: 0.4 },
  { id: 'ma_hut',       name: 'Stilt Hut',         size: 5.50, shape: 'ma_hut',       colors: [0xb8a04a, 0xa8904a], rad: 0.3, mass: 0.1 },
  { id: 'ma_toadstool', name: 'Giant Toadstool House', size: 6.00, shape: 'ma_toadstool', colors: [0xd9413a], rad: 0.2, mass: 0.3 },
  // ---- Gloomrest
  { id: 'gy_lantern',   name: 'Grave Lantern',     size: 0.65, shape: 'gy_lantern',   colors: [0xffd27a, 0xb8f2c9] },
  { id: 'gy_pumpkin',   name: "Jack-o'-lantern",   size: 0.65, shape: 'gy_pumpkin',   colors: [0xf2903a, 0xe87a2a] },
  { id: 'gy_teapot',    name: 'Midnight Teapot',   size: 0.65, shape: 'gy_teapot',    colors: [0xd9d2e8, 0x9b8ac9] },
  { id: 'gy_stone',     name: 'Gravestone',        size: 0.95, shape: 'gy_stone',     colors: [0xa9a79c, 0x9a9c94, 0xb4b0a4], rad: 0.3, mass: 0.8 },
  { id: 'gy_cross',     name: 'Stone Cross',       size: 0.95, shape: 'gy_cross',     colors: [0xa9a79c, 0xb4b0a4], rad: 0.25, mass: 0.6 },
  { id: 'gy_obel',      name: 'Grave Marker',      size: 0.95, shape: 'gy_obel',      colors: [0x9a9c94, 0xa9a79c], rad: 0.25, mass: 0.7 },
  { id: 'gy_sunk',      name: 'Sunken Headstone',  size: 1.20, shape: 'gy_sunk',      colors: [0x8f9488, 0x9a9c94], rad: 0.3, mass: 0.6 },
  { id: 'gy_chair',     name: 'Empty Chair',       size: 1.40, shape: 'gy_chair',     colors: [0x5a3a4a, 0x4a3a5a], rad: 0.28, mass: 0.5 },
  { id: 'gy_pew',       name: 'Chapel Pew',        size: 1.40, shape: 'bench',        colors: [0x4a3a2a] },
  { id: 'gy_candle',    name: 'Candelabra',        size: 1.40, shape: 'gy_candle',    colors: [0xd9b84a], rad: 0.15, mass: 0.3 },
  { id: 'gy_gargoyle',  name: 'Gargoyle',          size: 1.40, shape: 'gy_gargoyle',  colors: [0x7d7b74, 0x8a8a84], rad: 0.3, mass: 0.8 },
  { id: 'gy_urn',       name: 'Cracked Urn',       size: 1.40, shape: 'gy_urn',       colors: [0xb4b0a4, 0x9a9c94], rad: 0.3, mass: 0.6 },
  { id: 'gy_fence',     name: 'Iron Fence',        size: 1.60, shape: 'gy_fence',     colors: [0x2c2c34], rad: 0.3, mass: 0.3 },
  { id: 'gy_coffin',    name: 'Coffin',            size: 2.00, shape: 'gy_coffin',    colors: [0x5a3a2a, 0x3a2a2a], mass: 0.6 },
  { id: 'gy_table',     name: 'Tea Table',         size: 2.00, shape: 'gy_table',     colors: [0xe8e2f0], mass: 0.6 },
  { id: 'gy_bell',      name: 'Fallen Bell',       size: 2.00, shape: 'gy_bell',      colors: [0xa8843a], mass: 0.6 },
  { id: 'gy_wisp',      name: "Will-o'-wisp Lamp", size: 2.00, shape: 'gy_wisp',      colors: [0x9af2e0, 0xb8f29a, 0xc9b8ff], rad: 0.08, mass: 0.3 },
  { id: 'gy_dcart',     name: "Gravedigger's Cart", size: 2.60, shape: 'cart',        colors: [0x4a4a3a], mass: 0.5 },
  { id: 'gy_plot',      name: 'Half-dug Plot',     size: 2.90, shape: 'gy_plot',      colors: [0x3a3028], flat: true, rad: 0.3, mass: 0.2 },
  { id: 'gy_angel',     name: 'Stone Angel',       size: 2.90, shape: 'gy_angel',     colors: [0xc9c7bc, 0xb4b0a4], rad: 0.25, mass: 0.6 },
  { id: 'gy_gate',      name: 'Crypt Gate',        size: 2.90, shape: 'gy_gate',      colors: [GLOW], rad: 0.15, mass: 0.3 },
  { id: 'gy_monument',  name: 'Monument',          size: 4.20, shape: 'gy_monument',  colors: [0xb4b0a4, 0x9a9c94], rad: 0.3, mass: 0.5 },
  { id: 'gy_hearse',    name: 'Hearse Carriage',   size: 4.20, shape: 'gy_hearse',    colors: [0x7a3a9a], rad: 0.3, mass: 0.4 },
  { id: 'gy_shed',      name: "Undertaker's Shed", size: 4.50, shape: 'shed',         colors: [0x4a3a5a], rad: 0.45, mass: 0.15 },
  { id: 'gy_deadtree',  name: 'Lantern Tree',      size: 6.00, shape: 'gy_deadtree',  colors: [0x4a4038, 0x3a3430], rad: 0.08, mass: 0.1 },
  { id: 'gy_gatehouse', name: 'Covered Gatehouse', size: 6.50, shape: 'gy_gatehouse', colors: [0x5a4a6a], rad: 0.3, mass: 0.1 },
  { id: 'gy_reaper',    name: 'Scarecrow Reaper',  size: 8.00, shape: 'gy_reaper',    colors: [0x2c2c34], rad: 0.1, mass: 0.15 },
  { id: 'gy_crypt',     name: 'Crypt',             size: 9.00, shape: 'gy_crypt',     colors: [0xb4b0a4], rad: 0.4, mass: 0.08 },
  { id: 'gy_chapel',    name: 'Ruined Chapel',     size: 14.0, shape: 'gy_chapel',    colors: [0x5a4a6a], rad: 0.3, mass: 0.06 },
];

// Note: 'taper' is WIDER at the top (it is the cup/bucket shape); turn it over with [PI, 0, 0] for a narrowing tower.
export const SHAPES = {
  // ---------------- beach ----------------
  be_shell(g, c, P) { P(g, 'hemi', c, [.5, .45, .42], [0, 0, 0]); P(g, 'box', WHITE, [.1, .3, .8], [0, .2, 0]); },
  be_icecream(g, c, P) { P(g, 'cone', 0xd9a86a, [.28, .62, .28], [0, .31, 0], [PI, 0, 0]); P(g, 'sph', c, [.3, .28, .3], [0, .68, 0]); P(g, 'sph', RED, [.08, .08, .08], [0, .92, 0]); },
  be_starfish(g, c, P) { for (let k = 0; k < 5; k++) { const a = k * PI * 0.4; P(g, 'box', c, [.5, .12, .16], [Math.cos(a) * .25, .06, Math.sin(a) * .25], [0, -a, 0]); } },
  be_flipflop(g, c, P) { P(g, 'box', c, [.42, .12, 1], [0, .06, 0]); P(g, 'box', WHITE, [.34, .1, .08], [0, .2, .2], [.5, 0, 0]); },
  be_foot(g, c, P) { P(g, 'box', c, [.42, .8, .3], [0, .4, 0]); P(g, 'sph', c, [.24, .16, .26], [0, .84, .1]); },
  be_spade(g, c, P) { P(g, 'box', WOOD, [.1, .7, .1], [0, .65, 0]); P(g, 'box', c, [.42, .4, .08], [0, .2, 0]); },
  be_head(g, c, P) { P(g, 'sph', SKIN, [.46, .46, .46], [0, .46, 0]); P(g, 'box', DARK, [.7, .16, .1], [0, .52, .42]); P(g, 'hemi', c, [.5, .3, .5], [0, .68, 0]); },
  be_ball(g, c, P) { P(g, 'sph', c, [.5, .5, .5], [0, .5, 0]); P(g, 'cyl', WHITE, [.505, .14, .505], [0, .5, 0]); P(g, 'sph', WHITE, [.14, .06, .14], [0, .97, 0]); },
  be_cooler(g, c, P) { P(g, 'box', c, [1, .5, .6], [0, .25, 0]); P(g, 'box', WHITE, [1, .16, .62], [0, .58, 0]); P(g, 'box', IRON, [.5, .04, .06], [0, .72, 0]); },
  be_castle(g, c, P) {
    P(g, 'box', SAND, [.9, .34, .9], [0, .17, 0]);
    for (const x of [-.38, .38]) for (const z of [-.38, .38]) P(g, 'cyl', 0xdcc27e, [.13, .56, .13], [x, .28, z]);
    P(g, 'taper', 0xdcc27e, [.24, .7, .24], [0, .5, 0], [PI, 0, 0]);
    P(g, 'box', DWOOD, [.02, .16, .02], [0, .92, 0]); P(g, 'box', c, [.16, .09, .02], [.08, .95, 0]);
  },
  be_bollard(g, c, P) { P(g, 'cyl', IRON, [.3, .8, .3], [0, .4, 0]); P(g, 'cyl', IRON, [.42, .18, .42], [0, .9, 0]); P(g, 'torus', c, [.42, 1.2, .42], [0, .4, 0]); },
  be_ring(g, c, P) { P(g, 'torus', c, [.5, 1, .5], [0, .2, 0]); for (let k = 0; k < 4; k++) { const a = k * H; P(g, 'box', WHITE, [.22, .42, .22], [Math.cos(a) * .4, .2, Math.sin(a) * .4], [0, -a, 0]); } },
  be_deckchair(g, c, P) { P(g, 'box', WOOD, [.66, .05, 1], [0, .36, 0], [.7, 0, 0]); P(g, 'box', c, [.56, .04, .95], [0, .4, .04], [-.75, 0, 0]); P(g, 'box', WHITE, [.14, .045, .95], [0, .4, .04], [-.75, 0, 0]); },
  be_rod(g, c, P) { P(g, 'cyl', c, [.02, 1, .02], [0, .44, .1], [.5, 0, 0]); P(g, 'sph', RED, [.06, .06, .06], [0, .2, -.02]); P(g, 'box', WOOD, [.1, .24, .1], [0, .12, -.12]); },
  be_oar(g, c, P) { P(g, 'box', WOOD, [.06, .05, 1], [0, .025, 0]); P(g, 'box', c, [.18, .04, .28], [0, .03, .36]); },
  be_telescope(g, c, P) { P(g, 'cyl', IRON, [.05, .64, .05], [0, .32, 0]); P(g, 'cyl', IRON, [.24, .05, .24], [0, .025, 0]); P(g, 'cyl', c, [.09, .6, .09], [0, .74, 0], [1.2, 0, 0]); P(g, 'cyl', DARK, [.11, .08, .11], [0, .84, .26], [1.2, 0, 0]); },
  be_towel(g, c, P) { P(g, 'box', c, [.55, .02, 1], [0, .01, 0]); for (const z of [-.3, 0, .3]) P(g, 'box', WHITE, [.56, .024, .1], [0, .012, z]); },
  be_mound(g, c, P) { P(g, 'hemi', c, [.5, .2, .36], [0, 0, 0]); },
  be_surfboard(g, c, P) { P(g, 'sph', c, [.14, .5, .035], [0, .5, 0]); P(g, 'box', WHITE, [.04, .84, .075], [0, .5, 0]); P(g, 'box', DARK, [.02, .1, .1], [0, .14, -.06]); },
  be_cart(g, c, P) {
    P(g, 'box', WHITE, [.8, .38, .5], [0, .42, 0]); P(g, 'box', c, [.82, .1, .52], [0, .36, 0]);
    for (const x of [-.26, .26]) for (const z of [-.27, .27]) P(g, 'cyl', DARK, [.15, .06, .15], [x, .15, z], [H, 0, 0]);
    P(g, 'cyl', IRON, [.02, .34, .02], [0, .76, 0]); P(g, 'cone', c, [.42, .14, .42], [0, .92, 0]); P(g, 'cone', WHITE, [.2, .145, .2], [0, .925, 0]);
  },
  be_parasol(g, c, P) { P(g, 'cyl', WHITE, [.02, .9, .02], [0, .45, 0]); P(g, 'cone', c, [.5, .2, .5], [0, .86, 0]); P(g, 'cone', WHITE, [.25, .205, .25], [0, .862, 0]); P(g, 'sph', WHITE, [.03, .03, .03], [0, .97, 0]); },
  be_rowboat(g, c, P) { P(g, 'sph', c, [.2, .16, .5], [0, .16, 0]); P(g, 'box', DWOOD, [.28, .05, .76], [0, .27, 0]); for (const z of [-.2, .16]) P(g, 'box', CREAM, [.37, .04, .09], [0, .3, z]); },
  be_hut(g, c, P) {
    P(g, 'box', WHITE, [.62, .62, .62], [0, .31, 0]);
    for (const x of [-.24, 0, .24]) P(g, 'box', c, [.1, .62, .64], [x, .31, 0]);
    P(g, 'pyr', c, [.5, .3, .5], [0, .77, 0], [0, PI / 4, 0]); P(g, 'box', DWOOD, [.2, .4, .03], [0, .2, .325]);
  },
  be_net(g, c, P) { for (const x of [-.49, .49]) P(g, 'cyl', WHITE, [.016, .5, .016], [x, .25, 0]); P(g, 'box', WHITE, [.97, .14, .012], [0, .4, 0]); P(g, 'box', c, [.97, .03, .016], [0, .485, 0]); },
  be_kite(g, c, P) {
    P(g, 'cyl', WOOD, [.012, .76, .012], [0, .38, 0]); P(g, 'box', c, [.3, .3, .02], [.12, .78, 0], [0, 0, PI / 4]);
    P(g, 'box', WHITE, [.3, .03, .024], [.12, .78, 0], [0, 0, PI / 4]);
    for (let k = 0; k < 3; k++) P(g, 'box', GOLD, [.07, .05, .02], [.26 + k * .08, .6 - k * .09, 0], [0, 0, .5]);
  },
  be_tower(g, c, P) {
    for (const x of [-.2, .2]) for (const z of [-.2, .2]) P(g, 'box', WOOD, [.05, .6, .05], [x, .3, z]);
    P(g, 'box', WHITE, [.58, .05, .58], [0, .6, 0]); P(g, 'box', WHITE, [.42, .24, .42], [0, .74, 0]);
    P(g, 'pyr', c, [.4, .14, .4], [0, .93, 0], [0, PI / 4, 0]); P(g, 'box', WOOD, [.16, .64, .03], [0, .3, .36], [.22, 0, 0]);
    P(g, 'box', c, [.3, .1, .02], [0, .74, .22]);
  },
  // ---------------- tide pools ----------------
  tp_bottle(g, c, P) { P(g, 'cyl', c, [.2, .68, .2], [-.14, .2, 0], [0, 0, H]); P(g, 'cyl', c, [.08, .26, .08], [.32, .2, 0], [0, 0, H]); P(g, 'cyl', WOOD, [.09, .08, .09], [.46, .2, 0], [0, 0, H]); P(g, 'box', CREAM, [.4, .2, .42], [-.14, .2, 0]); },
  tp_fish(g, c, P) { P(g, 'sph', c, [.38, .14, .2], [-.1, .14, 0]); P(g, 'box', c, [.22, .05, .3], [.38, .12, 0]); P(g, 'sph', DARK, [.03, .03, .03], [-.34, .2, .1]); },
  tp_pot(g, c, P) { P(g, 'cyl', c, [.3, 1, .3], [0, .3, 0], [0, 0, H]); for (const x of [-.36, 0, .36]) P(g, 'cyl', DWOOD, [.32, .06, .32], [x, .3, 0], [0, 0, H]); P(g, 'box', DWOOD, [1, .06, .62], [0, .03, 0]); },
  tp_rope(g, c, P) { P(g, 'cyl', c, [.5, .3, .5], [0, .15, 0]); P(g, 'cyl', c, [.42, .26, .42], [0, .43, 0]); P(g, 'cyl', DWOOD, [.2, .04, .2], [0, .57, 0]); },
  tp_rock(g, c, P) { P(g, 'rock', c, [.5, .42, .5], [0, .38, 0]); for (const [x, y, z] of [[.3, .52, .2], [-.25, .6, .25], [.05, .76, -.1], [-.32, .42, -.25]]) P(g, 'cone', CREAM, [.07, .12, .07], [x, y, z]); },
  tp_conch(g, c, P) {
    P(g, 'cone', c, [.3, 1, .3], [0, .3, 0], [0, 0, -H]); P(g, 'sph', 0xff9eb0, [.2, .24, .3], [-.26, .27, .12]);
    for (const x of [-.3, -.1, .1]) P(g, 'cone', c, [.07, .2, .07], [x, .58 - (x + .3) * .5, 0]);
  },
  tp_anchor(g, c, P) {
    P(g, 'box', c, [.1, .8, .1], [0, .5, 0]); P(g, 'box', WOOD, [.5, .08, .08], [0, .8, 0]); P(g, 'torus', c, [.11, 1, .11], [0, .93, 0], [H, 0, 0]);
    for (const s of [-1, 1]) { P(g, 'box', c, [.42, .1, .1], [s * .18, .17, 0], [0, 0, s * .7]); P(g, 'cone', c, [.09, .2, .09], [s * .36, .36, 0]); }
  },
  tp_clam(g, c, P) { P(g, 'hemi', c, [.5, .28, .42], [0, .3, 0], [PI, 0, 0]); P(g, 'hemi', c, [.5, .28, .42], [0, .34, -.18], [-.9, 0, 0]); P(g, 'sph', WHITE, [.13, .13, .13], [0, .4, .08]); P(g, 'sph', 0xff9eb0, [.4, .08, .32], [0, .3, 0]); },
  tp_netrack(g, c, P) {
    for (const x of [-.46, .46]) P(g, 'box', WOOD, [.05, .62, .05], [x, .31, 0]); P(g, 'box', WOOD, [1, .05, .05], [0, .62, 0]);
    P(g, 'box', c, [.86, .5, .03], [0, .36, .06], [.2, 0, 0]); for (const x of [-.3, 0, .3]) P(g, 'sph', 0xf2903a, [.05, .05, .05], [x, .66, 0]);
  },
  tp_slab(g, c, P) { P(g, 'box', c, [1, .26, .5], [0, .13, 0]); P(g, 'box', WHITE, [.9, .05, .42], [0, .28, 0]); for (const x of [-.3, 0, .3]) P(g, 'sph', 0x8fb0c9, [.12, .04, .06], [x, .33, 0], [0, .5, 0]); },
  tp_hull(g, c, P) {
    P(g, 'sph', c, [.2, .2, .5], [0, .44, 0]); P(g, 'box', CREAM, [.3, .05, .8], [0, .58, 0]); P(g, 'box', DWOOD, [.04, .2, .8], [0, .24, 0]);
    for (const z of [-.26, .26]) { P(g, 'box', WOOD, [.56, .05, .06], [0, .22, z]); for (const x of [-.24, .24]) P(g, 'box', WOOD, [.05, .22, .05], [x, .11, z]); }
  },
  tp_cottage(g, c, P) {
    P(g, 'box', WHITE, [.84, .44, .62], [0, .22, 0]); P(g, 'pyr', c, [.62, .34, .62], [0, .61, 0], [0, PI / 4, 0]);
    P(g, 'box', DSTONE, [.1, .3, .1], [.24, .72, 0]); P(g, 'box', 0x3a6a9a, [.16, .3, .03], [0, .15, .315]);
    for (const x of [-.27, .27]) P(g, 'box', 0x9fd8ff, [.14, .12, .03], [x, .26, .315]);
  },
  tp_lighthouse(g, c, P) {
    P(g, 'taper', WHITE, [.17, .72, .17], [0, .36, 0], [PI, 0, 0]);
    P(g, 'cyl', c, [.162, .1, .162], [0, .2, 0]); P(g, 'cyl', c, [.143, .1, .143], [0, .5, 0]);
    P(g, 'cyl', DARK, [.18, .03, .18], [0, .735, 0]); P(g, 'cyl', GLOW, [.09, .12, .09], [0, .81, 0]);
    P(g, 'cone', c, [.13, .13, .13], [0, .935, 0]); P(g, 'box', DWOOD, [.07, .1, .02], [0, .05, .17]);
  },
  // ---------------- sea and islets ----------------
  se_buoy(g, c, P) { P(g, 'sph', c, [.36, .3, .36], [0, .3, 0]); P(g, 'cyl', WHITE, [.37, .1, .37], [0, .3, 0]); P(g, 'cyl', IRON, [.03, .5, .03], [0, .7, 0]); P(g, 'sph', GLOW, [.07, .07, .07], [0, .93, 0]); },
  se_stone(g, c, P) { P(g, 'rock', c, [.5, .38, .5], [0, .33, 0]); },
  se_coconut(g, c, P) { P(g, 'sph', c, [.46, .5, .46], [0, .5, 0]); for (const [x, y] of [[-.14, .7], [.14, .7], [0, .5]]) P(g, 'sph', DWOOD, [.07, .07, .05], [x, y, .4]); P(g, 'cone', TAN, [.12, .12, .12], [0, 1 - .06, 0]); },
  se_shovel(g, c, P) { P(g, 'cyl', WOOD, [.03, .7, .03], [0, .62, 0]); P(g, 'box', c, [.22, .3, .04], [0, .15, 0]); P(g, 'box', WOOD, [.16, .05, .05], [0, .97, 0]); },
  se_slantern(g, c, P) {
    P(g, 'cyl', STONE, [.3, .1, .3], [0, .05, 0]); P(g, 'cyl', STONE, [.1, .4, .1], [0, .3, 0]); P(g, 'box', STONE, [.4, .06, .4], [0, .53, 0]);
    P(g, 'box', c, [.3, .2, .3], [0, .66, 0]); P(g, 'pyr', DSTONE, [.36, .22, .36], [0, .87, 0], [0, PI / 4, 0]);
  },
  se_heap(g, c, P) { P(g, 'cone', c, [.5, .5, .5], [0, .25, 0]); P(g, 'rock', DSTONE, [.1, .08, .1], [.2, .12, .22]); },
  se_fire(g, c, P) { P(g, 'torus', DSTONE, [.48, .4, .48], [0, .08, 0]); P(g, 'cone', WOOD, [.34, .5, .34], [0, .25, 0]); P(g, 'cone', c, [.24, .7, .24], [0, .55, 0]); P(g, 'cone', GOLD, [.13, .5, .13], [0, .75, 0]); },
  se_chest(g, c, P) {
    P(g, 'box', WOOD, [1, .38, .6], [0, .19, 0]); P(g, 'cyl', c, [.3, 1, .3], [0, .38, 0], [0, 0, H]);
    for (const x of [-.32, .32]) P(g, 'box', GOLD, [.08, .7, .62], [x, .35, 0]); P(g, 'box', GOLD, [.14, .16, .04], [0, .36, .31]);
  },
  se_cannon(g, c, P) {
    P(g, 'box', WOOD, [.5, .22, .44], [0, .24, 0]); for (const z of [-.25, .25]) P(g, 'cyl', DWOOD, [.2, .06, .2], [-.05, .2, z], [H, 0, 0]);
    P(g, 'cyl', c, [.13, .9, .13], [.08, .5, 0], [0, 0, 1.3]); P(g, 'cyl', c, [.16, .1, .16], [.48, .61, 0], [0, 0, 1.3]);
  },
  se_idol(g, c, P) { P(g, 'cyl', c, [.34, .5, .34], [0, .25, 0]); P(g, 'sph', c, [.3, .28, .3], [0, .7, 0]); P(g, 'box', DARK, [.34, .05, .05], [0, .72, .27]); P(g, 'hemi', MOSS, [.31, .16, .31], [0, .84, 0]); P(g, 'sph', c, [.2, .14, .12], [0, .36, .3]); },
  se_raft(g, c, P) {
    for (const x of [-.3, -.1, .1, .3]) P(g, 'cyl', WOOD, [.1, .96, .1], [x, .1, 0], [H, 0, 0]);
    P(g, 'box', DWOOD, [.8, .04, .08], [0, .21, .3]); P(g, 'cyl', WOOD, [.025, .7, .025], [0, .55, -.1]); P(g, 'box', c, [.3, .22, .02], [.16, .76, -.1]); P(g, 'box', WHITE, [.3, .06, .024], [.16, .76, -.1]);
  },
  se_leanto(g, c, P) { P(g, 'box', c, [.94, .05, .8], [0, .34, 0], [.62, 0, 0]); for (const x of [-.42, .42]) P(g, 'cyl', WOOD, [.03, .6, .03], [x, .3, .3]); P(g, 'box', TAN, [.6, .06, .36], [0, .03, .05]); },
  se_x(g, c, P) { P(g, 'box', c, [1, .03, .18], [0, .015, 0], [0, PI / 4, 0]); P(g, 'box', c, [1, .03, .18], [0, .016, 0], [0, -PI / 4, 0]); },
  se_hammock(g, c, P) { for (const x of [-.47, .47]) P(g, 'cyl', WOOD, [.03, .6, .03], [x, .3, 0]); P(g, 'sph', c, [.44, .08, .16], [0, .3, 0]); P(g, 'box', WHITE, [.1, .17, .3], [0, .3, 0]); },
  se_tiki(g, c, P) {
    P(g, 'cyl', c, [.2, 1, .2], [0, .5, 0]); for (const x of [-.09, .09]) P(g, 'box', WHITE, [.1, .1, .05], [x, .7, .18]);
    P(g, 'box', RED, [.24, .12, .05], [0, .4, .18]); P(g, 'box', DWOOD, [.36, .06, .1], [0, .82, .16]); P(g, 'box', DWOOD, [.1, .2, .1], [0, .55, .2]);
  },
  se_column(g, c, P) { P(g, 'box', c, [.4, .08, .4], [0, .04, 0]); P(g, 'cyl', c, [.14, .84, .14], [0, .5, 0]); P(g, 'box', c, [.36, .08, .36], [0, .96, 0]); P(g, 'sph', MOSS, [.1, .08, .1], [.1, .12, .1]); },
  se_flag(g, c, P) { P(g, 'cyl', WOOD, [.015, 1, .015], [0, .5, 0]); P(g, 'box', c, [.36, .24, .02], [.19, .86, 0]); P(g, 'sph', WHITE, [.06, .06, .014], [.19, .86, 0]); },
  se_fishboat(g, c, P) {
    P(g, 'sph', c, [.2, .18, .5], [0, .16, 0]); P(g, 'box', CREAM, [.3, .05, .74], [0, .28, 0]); P(g, 'box', WHITE, [.24, .22, .26], [0, .42, -.16]);
    P(g, 'box', c, [.28, .04, .3], [0, .55, -.16]); P(g, 'cyl', WOOD, [.015, .5, .015], [0, .55, .16]); P(g, 'box', 0x4a9a9a, [.2, .2, .02], [0, .55, .26], [.4, 0, 0]);
  },
  se_duck(g, c, P) {
    P(g, 'sph', c, [.36, .3, .46], [0, .3, 0]); P(g, 'sph', c, [.24, .24, .24], [0, .72, .22]); P(g, 'box', 0xf2743a, [.2, .07, .2], [0, .68, .48]);
    for (const x of [-.12, .12]) P(g, 'sph', DARK, [.04, .04, .04], [x, .8, .4]); P(g, 'cone', c, [.16, .24, .16], [0, .46, -.42], [-.8, 0, 0]);
  },
  se_bell(g, c, P) {
    for (const x of [-.42, .42]) P(g, 'box', 0xc9442a, [.08, .9, .08], [x, .45, 0]); P(g, 'box', 0xc9442a, [1, .08, .12], [0, .92, 0]);
    P(g, 'taper', c, [.28, .46, .28], [0, .53, 0], [PI, 0, 0]); P(g, 'hemi', c, [.2, .12, .2], [0, .76, 0]); P(g, 'sph', DARK, [.07, .07, .07], [0, .27, 0]);
  },
  se_palm(g, c, P) {
    P(g, 'cyl', TAN, [.035, .82, .035], [0, .41, 0], [0, 0, .06]);
    for (let k = 0; k < 5; k++) { const a = k * PI * 0.4; P(g, 'box', c, [.44, .03, .13], [Math.cos(a) * .2 - .03, .85, Math.sin(a) * .2], [0, -a, -.35]); }
    for (const x of [-.05, .04]) P(g, 'sph', 0x8a5a3a, [.045, .045, .045], [x - .03, .8, .05]);
  },
  se_arch(g, c, P) { for (const x of [-.36, .36]) P(g, 'cyl', c, [.05, .86, .05], [x, .43, 0]); P(g, 'box', DARK, [1, .07, .12], [0, .9, 0]); P(g, 'box', c, [.86, .05, .08], [0, .72, 0]); P(g, 'box', c, [.1, .14, .04], [0, .81, 0]); },
  se_serpent(g, c, P) {
    for (const x of [-.27, 0, .26]) P(g, 'torus', c, [.15, .45, .15], [x, 0, 0], [H, 0, 0]);
    P(g, 'cyl', c, [.05, .3, .05], [.4, .15, 0]); P(g, 'sph', c, [.09, .08, .08], [.42, .32, 0]);
    for (const z of [-.05, .05]) P(g, 'sph', WHITE, [.03, .03, .03], [.45, .37, z]); P(g, 'cone', c, [.05, .16, .05], [-.44, .06, 0], [0, 0, .6]); P(g, 'box', RED, [.1, .02, .02], [.52, .3, 0]);
  },
  se_ship(g, c, P) {
    P(g, 'sph', WOOD, [.14, .13, .5], [0, .13, 0]); P(g, 'box', TAN, [.22, .03, .84], [0, .21, 0]); P(g, 'box', c, [.2, .12, .2], [0, .28, -.36]);
    for (const [z, h] of [[-.2, .7], [.08, .78], [.32, .6]]) { P(g, 'cyl', DWOOD, [.012, h, .012], [0, .2 + h / 2, z]); P(g, 'box', CREAM, [.3, h * .34, .02], [0, .2 + h * .7, z + .02]); P(g, 'box', CREAM, [.24, h * .22, .02], [0, .2 + h * .36, z + .02]); }
    P(g, 'box', c, [.02, .05, .1], [0, .97, .13]);
  },
  // ---------------- marsh ----------------
  ma_shroom(g, c, P) { P(g, 'cyl', CREAM, [.14, .55, .14], [0, .275, 0]); P(g, 'hemi', c, [.5, .42, .5], [0, .5, 0]); for (const [x, y, z] of [[.22, .78, .2], [-.25, .76, .1], [0, .86, -.2]]) P(g, 'sph', WHITE, [.08, .05, .08], [x, y, z]); },
  ma_toadstool(g, c, P) {
    P(g, 'cyl', CREAM, [.17, .56, .17], [0, .28, 0]); P(g, 'hemi', c, [.5, .42, .5], [0, .52, 0]); P(g, 'cyl', CREAM, [.44, .05, .44], [0, .52, 0]);
    for (const [x, y, z] of [[.24, .8, .2], [-.26, .78, .12], [0, .88, -.2], [.05, .76, .36]]) P(g, 'sph', WHITE, [.09, .05, .09], [x, y, z]);
    P(g, 'box', DWOOD, [.11, .2, .03], [0, .1, .165]); P(g, 'box', GLOW, [.08, .08, .03], [.02, .36, .165]); P(g, 'cyl', DSTONE, [.03, .16, .03], [-.25, .86, -.2]);
  },
  ma_jar(g, c, P) { P(g, 'cyl', c, [.32, .7, .32], [0, .35, 0]); P(g, 'cyl', DWOOD, [.34, .12, .34], [0, .76, 0]); P(g, 'torus', IRON, [.3, .6, .3], [0, .9, 0], [H, 0, 0]); },
  ma_reed(g, c, P) {
    for (const [x, z, h] of [[-.12, 0, .78], [.1, .08, .9], [.02, -.12, .66]]) { P(g, 'cyl', c, [.022, h, .022], [x, h / 2, z]); P(g, 'cyl', 0x6a4a2a, [.05, .2, .05], [x, h, z]); }
    P(g, 'cone', c, [.22, .4, .22], [0, .2, 0]);
  },
  ma_stone(g, c, P) { P(g, 'cyl', c, [.5, .16, .5], [0, .08, 0]); P(g, 'sph', MOSS, [.2, .04, .16], [.15, .16, .1]); },
  ma_trap(g, c, P) { P(g, 'cone', c, [.3, 1, .3], [0, .3, 0], [0, 0, H]); for (const x of [.1, .35]) P(g, 'cyl', DWOOD, [.31 * (1 - (.5 - x) * .9), .05, .31 * (1 - (.5 - x) * .9)], [x, .3, 0], [0, 0, H]); },
  ma_fern(g, c, P) { for (let k = 0; k < 5; k++) { const a = k * PI * 0.4; P(g, 'box', c, [.5, .03, .16], [Math.cos(a) * .24, .2, Math.sin(a) * .24], [0, -a, .5]); } P(g, 'cone', c, [.1, .4, .1], [0, .2, 0]); },
  ma_bundle(g, c, P) { P(g, 'taper', c, [.3, .96, .3], [0, .48, 0]); P(g, 'cyl', DWOOD, [.26, .08, .26], [0, .45, 0]); },
  ma_cauldron(g, c, P) {
    P(g, 'sph', DARK, [.46, .38, .46], [0, .44, 0]); P(g, 'cyl', DARK, [.42, .08, .42], [0, .74, 0]); P(g, 'cyl', c, [.37, .04, .37], [0, .78, 0]);
    for (const [x, y, z, r] of [[.1, .86, .05, .1], [-.14, .93, -.1, .07]]) P(g, 'sph', c, [r, r, r], [x, y, z]);
    P(g, 'cone', 0xf2743a, [.3, .16, .3], [0, .08, 0]);
  },
  ma_lotus(g, c, P) { P(g, 'cyl', LEAF, [.5, .04, .5], [0, .02, 0]); P(g, 'cone', c, [.34, .4, .34], [0, .24, 0], [PI, 0, 0]); P(g, 'cone', WHITE, [.2, .36, .2], [0, .3, 0], [PI, 0, 0]); P(g, 'sph', GOLD, [.1, .08, .1], [0, .42, 0]); },
  ma_post(g, c, P) { P(g, 'cyl', c, [.12, 1, .12], [0, .5, 0], [0, 0, .08]); P(g, 'torus', TAN, [.15, .5, .15], [0, .7, 0]); },
  ma_frognet(g, c, P) { P(g, 'cyl', WOOD, [.02, .8, .02], [0, .4, 0], [0, 0, .1]); P(g, 'torus', IRON, [.16, .5, .16], [-.05, .86, 0], [1.2, 0, 0]); P(g, 'cone', c, [.14, .22, .14], [-.05, .8, -.08], [2.7, 0, 0]); },
  ma_plank(g, c, P) { P(g, 'box', c, [1, .05, .36], [0, .025, 0]); for (const x of [-.36, .36]) P(g, 'box', DWOOD, [.07, .06, .38], [x, .03, 0]); },
  ma_driftwood(g, c, P) { P(g, 'cyl', c, [.09, 1, .09], [0, .1, 0], [0, 0, H]); P(g, 'cyl', c, [.05, .4, .05], [.15, .22, .05], [.3, 0, .9]); P(g, 'cyl', c, [.04, .3, .04], [-.25, .18, -.05], [-.4, 0, -.8]); },
  ma_lantern(g, c, P) { P(g, 'cyl', WOOD, [.03, .9, .03], [0, .45, 0]); P(g, 'box', WOOD, [.24, .03, .03], [.1, .88, 0]); P(g, 'cyl', c, [.07, .13, .07], [.19, .76, 0]); P(g, 'cyl', DWOOD, [.075, .03, .075], [.19, .84, 0]); },
  ma_pole(g, c, P) { P(g, 'cyl', c, [.02, 1, .02], [0, .5, 0]); P(g, 'cyl', DWOOD, [.03, .1, .03], [0, .05, 0]); },
  ma_rotlog(g, c, P) {
    P(g, 'cyl', c, [.18, 1, .18], [0, .18, 0], [0, 0, H]); P(g, 'cyl', 0x3a2a1a, [.13, 1.01, .13], [0, .18, 0], [0, 0, H]);
    for (const [x, y] of [[-.25, .3], [0, .24], [.22, .32]]) P(g, 'sph', 0xf2a03a, [.11, .03, .1], [x, y, .17]); P(g, 'sph', MOSS, [.2, .06, .12], [.1, .36, 0]);
  },
  ma_mangrove(g, c, P) {
    for (let k = 0; k < 4; k++) { const a = k * H + .5; P(g, 'cyl', 0x7a5a3a, [.03, .5, .03], [Math.cos(a) * .2, .2, Math.sin(a) * .2], [Math.sin(a) * .7, 0, -Math.cos(a) * .7]); }
    P(g, 'cyl', 0x7a5a3a, [.06, .4, .06], [0, .52, 0]); P(g, 'sph', c, [.42, .22, .42], [0, .78, 0]); P(g, 'sph', c, [.26, .16, .26], [.15, .86, .1]);
  },
  ma_punt(g, c, P) { P(g, 'box', c, [.3, .12, 1], [0, .07, 0]); P(g, 'box', DWOOD, [.22, .03, .78], [0, .14, 0]); P(g, 'box', TAN, [.3, .03, .1], [0, .15, -.3]); },
  ma_net(g, c, P) { P(g, 'box', c, [1, .02, .8], [0, .01, 0]); for (const [x, z] of [[-.4, -.3], [.35, .3], [.1, -.35]]) P(g, 'sph', 0xf2903a, [.05, .04, .05], [x, .04, z]); },
  ma_statue(g, c, P) {
    P(g, 'box', c, [.3, .64, .24], [0, .3, 0], [0, 0, .28]); P(g, 'sph', c, [.15, .15, .15], [-.16, .7, 0]); P(g, 'box', c, [.1, .34, .1], [.05, .74, 0], [0, 0, -.2]);
    P(g, 'hemi', MOSS, [.16, .1, .16], [-.16, .76, 0]); P(g, 'sph', MOSS, [.2, .08, .16], [.12, .5, 0]); P(g, 'cyl', 0x6fa494, [.42, .03, .42], [0, .015, 0]);
  },
  ma_hut(g, c, P) {
    for (const x of [-.28, .28]) for (const z of [-.28, .28]) P(g, 'cyl', WOOD, [.03, .45, .03], [x, .225, z]);
    P(g, 'box', WOOD, [.76, .04, .76], [0, .45, 0]); P(g, 'box', 0xcdb88a, [.54, .26, .54], [0, .6, 0]); P(g, 'cone', c, [.5, .27, .5], [0, .865, 0]);
    P(g, 'box', DWOOD, [.14, .2, .03], [0, .57, .275]); P(g, 'box', WOOD, [.13, .5, .02], [0, .23, .46], [.18, 0, 0]);
  },
  // ---------------- graveyard ----------------
  gy_lantern(g, c, P) { P(g, 'box', DARK, [.56, .1, .56], [0, .05, 0]); P(g, 'box', c, [.42, .5, .42], [0, .35, 0]); P(g, 'pyr', DARK, [.42, .26, .42], [0, .73, 0], [0, PI / 4, 0]); P(g, 'torus', DARK, [.12, 1, .12], [0, .9, 0], [H, 0, 0]); },
  gy_pumpkin(g, c, P) {
    P(g, 'sph', c, [.5, .42, .5], [0, .42, 0]); P(g, 'cyl', MOSS, [.07, .16, .07], [0, .9, 0]);
    for (const x of [-.18, .18]) P(g, 'pyr', GLOW, [.1, .14, .05], [x, .52, .44]); P(g, 'box', GLOW, [.36, .08, .05], [0, .3, .45]);
  },
  gy_teapot(g, c, P) { P(g, 'sph', c, [.36, .34, .36], [0, .36, 0]); P(g, 'cyl', c, [.06, .36, .06], [.4, .44, 0], [0, 0, -.8]); P(g, 'torus', c, [.16, 1, .16], [-.38, .38, 0], [H, 0, 0]); P(g, 'sph', GOLD, [.08, .08, .08], [0, .74, 0]); },
  gy_stone(g, c, P) { P(g, 'box', DSTONE, [.76, .1, .32], [0, .05, 0]); P(g, 'box', c, [.6, .56, .16], [0, .36, 0]); P(g, 'cyl', c, [.3, .16, .3], [0, .64, 0], [H, 0, 0]); P(g, 'sph', MOSS, [.2, .06, .1], [-.12, .12, .1]); },
  gy_cross(g, c, P) { P(g, 'box', DSTONE, [.44, .12, .3], [0, .06, 0]); P(g, 'box', c, [.16, .9, .14], [0, .55, 0]); P(g, 'box', c, [.6, .16, .14], [0, .7, 0]); },
  gy_obel(g, c, P) { P(g, 'box', DSTONE, [.5, .14, .5], [0, .07, 0]); P(g, 'box', c, [.28, .62, .28], [0, .45, 0]); P(g, 'pyr', c, [.2, .22, .2], [0, .87, 0], [0, PI / 4, 0]); },
  gy_sunk(g, c, P) { P(g, 'box', c, [.5, .8, .14], [.06, .32, 0], [0, 0, .32]); P(g, 'cyl', c, [.25, .14, .25], [-.06, .68, 0], [H, 0, .32]); P(g, 'cyl', 0x6fa494, [.5, .03, .5], [0, .015, 0]); P(g, 'sph', MOSS, [.16, .05, .1], [.1, .4, .08]); },
  gy_chair(g, c, P) {
    P(g, 'box', c, [.46, .07, .46], [0, .36, 0]); P(g, 'box', c, [.46, .64, .07], [0, .68, -.2]); P(g, 'cyl', c, [.23, .07, .23], [0, 1 - .035, -.2], [H, 0, 0]);
    for (const x of [-.19, .19]) P(g, 'box', DARK, [.06, .36, .06], [x, .18, .19]); P(g, 'box', RED, [.36, .05, .36], [0, .41, 0]);
  },
  gy_candle(g, c, P) {
    P(g, 'cyl', c, [.2, .05, .2], [0, .025, 0]); P(g, 'cyl', c, [.03, .66, .03], [0, .36, 0]); P(g, 'box', c, [.62, .04, .05], [0, .68, 0]);
    for (const x of [-.28, 0, .28]) { P(g, 'cyl', CREAM, [.035, .2, .035], [x, .8, 0]); P(g, 'sph', 0xf2903a, [.04, .06, .04], [x, .94, 0]); }
  },
  gy_gargoyle(g, c, P) {
    P(g, 'box', DSTONE, [.5, .3, .5], [0, .15, 0]); P(g, 'sph', c, [.24, .22, .28], [0, .5, 0]); P(g, 'sph', c, [.16, .15, .16], [0, .76, .2]);
    for (const s of [-1, 1]) { P(g, 'cone', c, [.04, .14, .04], [s * .09, .93, .18]); P(g, 'box', c, [.3, .34, .04], [s * .28, .68, -.1], [0, s * .5, s * -.4]); }
  },
  gy_urn(g, c, P) { P(g, 'cyl', c, [.2, .16, .2], [0, .08, 0]); P(g, 'taper', c, [.32, .5, .32], [0, .41, 0]); P(g, 'cyl', c, [.2, .16, .2], [0, .74, 0]); P(g, 'cyl', c, [.28, .06, .28], [0, .85, 0]); P(g, 'box', DARK, [.03, .4, .05], [.1, .45, .27], [0, 0, .3]); },
  gy_fence(g, c, P) { for (let k = 0; k < 5; k++) { P(g, 'box', c, [.035, .6, .035], [-.44 + k * .22, .3, 0]); P(g, 'cone', c, [.04, .1, .04], [-.44 + k * .22, .65, 0]); } for (const y of [.14, .5]) P(g, 'box', c, [1, .035, .035], [0, y, 0]); },
  gy_coffin(g, c, P) { P(g, 'box', c, [.34, .24, 1], [0, .12, 0]); P(g, 'box', c, [.5, .23, .4], [0, .115, -.16]); P(g, 'box', GOLD, [.05, .02, .44], [0, .25, -.1]); P(g, 'box', GOLD, [.24, .02, .05], [0, .25, -.2]); },
  gy_table(g, c, P) {
    P(g, 'cyl', DWOOD, [.08, .4, .08], [0, .2, 0]); P(g, 'cyl', c, [.5, .06, .5], [0, .43, 0]); P(g, 'taper', c, [.5, .2, .5], [0, .32, 0], [PI, 0, 0]);
    P(g, 'sph', 0x9b8ac9, [.1, .09, .1], [.1, .55, 0]); P(g, 'cyl', CREAM, [.03, .2, .03], [-.2, .56, .1]); P(g, 'sph', 0xf2903a, [.03, .05, .03], [-.2, .7, .1]);
  },
  gy_bell(g, c, P) { P(g, 'taper', c, [.42, .7, .42], [0, .4, 0], [PI, 0, .5]); P(g, 'hemi', c, [.3, .16, .3], [-.3, .58, 0], [0, 0, .5]); P(g, 'box', DARK, [.03, .4, .05], [.1, .4, .38], [0, 0, .5]); },
  gy_wisp(g, c, P) { P(g, 'cyl', IRON, [.02, .8, .02], [0, .4, 0], [0, 0, .08]); P(g, 'box', IRON, [.16, .02, .02], [.04, .8, 0]); P(g, 'sph', c, [.12, .12, .12], [.12, .84, 0]); P(g, 'sph', c, [.05, .05, .05], [.26, .94, .04]); P(g, 'sph', c, [.035, .035, .035], [.02, .96, -.06]); },
  gy_plot(g, c, P) { P(g, 'box', c, [.46, .03, .94], [0, .015, 0]); P(g, 'box', 0x7a6a52, [.56, .05, .06], [0, .025, .47]); P(g, 'box', 0x7a6a52, [.06, .05, 1], [-.27, .025, 0]); P(g, 'box', WOOD, [.06, .03, .5], [.12, .04, .1], [0, .3, 0]); },
  gy_angel(g, c, P) {
    P(g, 'box', DSTONE, [.42, .16, .42], [0, .08, 0]); P(g, 'cone', c, [.2, .56, .2], [0, .44, 0]); P(g, 'sph', c, [.09, .09, .09], [0, .78, 0]);
    for (const s of [-1, 1]) P(g, 'box', c, [.26, .4, .04], [s * .2, .62, -.08], [0, 0, s * -.45]); P(g, 'torus', GOLD, [.08, .6, .08], [0, .92, 0]);
  },
  gy_gate(g, c, P) {
    for (const s of [-1, 1]) { P(g, 'box', STONE, [.16, .86, .16], [s * .42, .43, 0]); P(g, 'sph', c, [.08, .08, .08], [s * .42, .93, 0]); P(g, 'box', DARK, [.3, .6, .03], [s * .24, .32, .1], [0, s * .7, 0]); }
    P(g, 'box', DARK, [.7, .05, .05], [0, .8, 0]);
  },
  gy_monument(g, c, P) {
    P(g, 'box', DSTONE, [.5, .16, .5], [0, .08, 0]); P(g, 'box', c, [.36, .26, .36], [0, .29, 0]); P(g, 'taper', c, [.12, .34, .12], [0, .59, 0], [PI, 0, 0]);
    P(g, 'sph', c, [.14, .12, .14], [0, .84, 0]); P(g, 'cone', c, [.07, .1, .07], [0, .95, 0]); P(g, 'sph', MOSS, [.14, .05, .1], [.1, .18, .2]);
  },
  gy_hearse(g, c, P) {
    P(g, 'box', DARK, [.42, .34, .8], [0, .42, -.06]); P(g, 'box', c, [.44, .18, .46], [0, .46, -.1]); P(g, 'box', DARK, [.46, .04, .84], [0, .61, -.06]);
    for (const x of [-.24, .24]) for (const z of [-.3, .22]) P(g, 'cyl', DSTONE, [.17, .05, .17], [x, .17, z], [0, 0, H]);
    for (const x of [-.18, .18]) for (const z of [-.42, .3]) P(g, 'cone', c, [.035, .16, .035], [x, .71, z]);
    P(g, 'box', DARK, [.36, .06, .16], [0, .5, .4]);
  },
  gy_deadtree(g, c, P) {
    P(g, 'cyl', c, [.05, .62, .05], [0, .31, 0]);
    for (const [x, y, rz, l] of [[.14, .66, -.9, .36], [-.12, .72, .7, .36], [.06, .84, -.3, .3], [-.2, .5, 1.2, .28]]) P(g, 'cyl', c, [.022, l, .022], [x, y, 0], [0, x * 3, rz]);
    P(g, 'sph', GLOW, [.045, .055, .045], [.28, .68, 0]); P(g, 'sph', GLOW, [.045, .055, .045], [-.26, .78, 0]);
  },
  gy_gatehouse(g, c, P) {
    for (const s of [-1, 1]) { P(g, 'box', STONE, [.2, .56, .5], [s * .36, .28, 0]); P(g, 'sph', GLOW, [.05, .05, .05], [s * .36, .4, .28]); }
    P(g, 'box', DWOOD, [.56, .12, .46], [0, .52, 0]); P(g, 'box', c, [1, .06, .62], [0, .61, 0]); P(g, 'box', c, [.8, .08, .44], [0, .68, 0]); P(g, 'box', c, [.56, .08, .24], [0, .76, 0]);
  },
  gy_reaper(g, c, P) {
    P(g, 'cyl', WOOD, [.025, .8, .025], [0, .4, 0]); P(g, 'box', WOOD, [.56, .03, .03], [0, .68, 0]); P(g, 'cone', c, [.22, .56, .22], [0, .46, 0]);
    P(g, 'sph', c, [.1, .11, .1], [0, .82, 0]); P(g, 'sph', 0xf2903a, [.07, .07, .05], [0, .81, .07]); P(g, 'box', TAN, [.1, .14, .04], [-.28, .62, 0]);
    P(g, 'cyl', WOOD, [.012, .96, .012], [.3, .48, 0]); P(g, 'box', 0xc8ccd4, [.3, .07, .02], [.17, .93, 0], [0, 0, .25]);
  },
  gy_crypt(g, c, P) {
    P(g, 'box', DSTONE, [.84, .06, 1], [0, .03, 0]); P(g, 'box', c, [.7, .46, .84], [0, .29, 0]); P(g, 'box', DSTONE, [.8, .07, .96], [0, .555, 0]);
    P(g, 'pyr', c, [.56, .24, .56], [0, .71, 0], [0, PI / 4, 0]); for (const x of [-.27, .27]) P(g, 'cyl', WHITE, [.045, .46, .045], [x, .29, .45]);
    P(g, 'box', DARK, [.22, .34, .03], [0, .23, .425]); P(g, 'box', c, [.05, .16, .05], [0, .9, 0]); P(g, 'box', c, [.14, .05, .05], [0, .92, 0]);
  },
  gy_chapel(g, c, P) {
    P(g, 'box', STONE, [.2, .74, .2], [-.18, .37, .2]); P(g, 'pyr', c, [.17, .26, .17], [-.18, .87, .2], [0, PI / 4, 0]); P(g, 'box', DARK, [.12, .1, .21], [-.18, .62, .2]);
    P(g, 'box', STONE, [.3, .26, .6], [.07, .13, 0]); P(g, 'box', STONE, [.3, .42, .04], [.07, .21, -.3]); P(g, 'box', c, [.2, .03, .6], [0, .33, 0], [0, 0, .7]);
    P(g, 'sph', 0x9b6ae6, [.06, .06, .03], [.07, .32, -.3]); P(g, 'box', DWOOD, [.1, .16, .02], [.07, .08, .3]);
  },
};

// ===================== placing =====================
const SIZE = Object.fromEntries(ITEMS.map((i) => [i.id, i.size]));
const FLOATS = new Set(ITEMS.filter((i) => i.floats).map((i) => i.id));
let M = null, ALLOW = [], seed = 1;
// Our own seeded random numbers (same map every game, and unaffected by how many numbers the other habitat files draw).
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
// Every placement goes through put(): a thing that would land outside the habitat it was meant for (borders wander) or in deep
// water without being a floater is left out and noted in dress.missed, so nothing ever spills into a neighbour's land.
function put(id, x, z, o) {
  const b = M.biomeAt(x, z);
  if (!ALLOW.includes(b) || (M.water(x, z) === 2 && !FLOATS.has(id))) { dress.missed.push(`${id} (${x.toFixed(1)}, ${z.toFixed(1)}) ${b}`); return null; }
  return M.put(id, x, z, o);
}
const big = (id, size, o) => Object.assign({ scale: size / SIZE[id] }, o);          // "a <size> metre version of id"
function row(id, x1, z1, x2, z2, n, o) { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; put(id, x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, o); } }
function ring(id, x, z, r, n, o, a0 = 0, inward = false) { for (let i = 0; i < n; i++) { const a = a0 + i / n * PI * 2; put(id, x + Math.cos(a) * r, z + Math.sin(a) * r, Object.assign({ rot: -a + H + (inward ? PI : 0) }, o)); } }
function cover(id, x, z, r, n, o) { for (let i = 0; i < n; i++) { const a = rnd() * PI * 2, rr = r * Math.sqrt(rnd()); put(id, x + Math.cos(a) * rr, z + Math.sin(a) * rr, Object.assign({ rot: rnd() * 6.28 }, o)); } }
// A scene's own frame: f = the way it faces; r = metres to its right, fr = metres in front.
function frame(x, z, f) {
  const at = (r, fr) => [x + r * Math.cos(f) + fr * Math.sin(f), z - r * Math.sin(f) + fr * Math.cos(f)];
  return {
    p(id, r, fr, rot = 0, o) { const [px, pz] = at(r, fr); return put(id, px, pz, Object.assign({ rot: f + rot }, o)); },
    line(id, r1, f1, r2, f2, n, rot = 0, o) { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; this.p(id, r1 + (r2 - r1) * t, f1 + (f2 - f1) * t, rot, o); } },
  };
}

// ---------------------------------------------------------------- Shellsand Beach
function parasolSet(x, z, k) {            // a parasol with its towel, a pair of flip-flops kicked off, a pail and spade, and one extra
  put('be_parasol', x, z); put('be_towel', x + 1.3, z + 0.7, { rot: 0.15 * (k % 3 - 1) });
  put('be_flipflop', x + 0.5, z + 2.0, { rot: 0.2 }); put('be_flipflop', x + 0.78, z + 2.06, { rot: -0.3 });
  put('be_pail', x - 1.0, z + 1.0); put('be_spade', x - 1.35, z + 0.7, { rot: 0.6 });
  if (k % 3 === 0) put('be_cooler', x - 0.9, z - 0.9, { rot: 0.3 });
  else if (k % 3 === 1) put('be_ball', x + 2.0, z - 0.6);
  else put('be_deckchair', x - 1.6, z - 0.4, { rot: 0.2 });
}
function beach() {
  ALLOW = ['beach'];
  // shell lines lead out of the Green down both sides of the sandy road; starfish take over nearer the sea
  row('be_shell', -2.7, 55.5, -2.7, 76.5, 11); row('be_shell', 2.7, 55.5, 2.7, 76.5, 11);
  row('be_starfish', -2.7, 79, -2.7, 101.5, 6); row('be_starfish', 2.7, 79, 2.7, 101.5, 6);
  row('be_shell', -4, 57, -15.5, 63.2, 7);                                   // ...and one branches off to the parasols
  // two rows of parasols
  [[-19, 66], [-13, 66], [-7.5, 66], [-21, 73.5], [-15, 73.5], [-9, 73.5]].forEach(([x, z], k) => parasolSet(x, z, k));
  // the sandcastle ladder: every castle a size up from the last, ending in the fortress
  const castles = [[5, 59, .22], [6.6, 61, .32], [8.3, 63.1, .45], [10.3, 65.3, .65], [12.7, 67.7, .95], [15.8, 70.4, 1.4], [11.2, 73.6, 2], [17.6, 76.2, 2.9]];
  ring('be_shell', 5, 59, 0.5, 6);
  for (const [x, z, s] of castles) { put('be_castle', x, z, big('be_castle', s, { rot: s })); if (s < 1.4) { put('be_pail', x + s * 0.7 + 0.35, z - 0.25); put('be_spade', x - s * 0.7 - 0.3, z + 0.2, { rot: 1 }); } }
  put('be_castle', 13, 82.2, big('be_castle', 5)); ring('be_pail', 13, 82.2, 3.3, 6, null, 0.4);          // the fortress, moated with pails
  put('be_flipflop', 9.1, 62.4, { rot: 2 });                                // somebody trod on one
  // dad, buried up to the neck (his feet still wiggle), with a castle built on his tummy
  put('be_mound', -11, 80); put('be_head', -11.95, 80, { rot: -H }); put('be_foot', -10.12, 79.84); put('be_foot', -10.12, 80.16);
  put('be_castle', -11, 80, big('be_castle', .22)); put('be_spade', -11.1, 81.1, { rot: 2 }); put('be_pail', -11.8, 81.2);
  // volleyball court marked out in shells, lost balls in a row by size
  put('be_net', -19, 89); row('be_shell', -22.5, 84.5, -22.5, 93.5, 6); row('be_shell', -15.5, 84.5, -15.5, 93.5, 6);
  put('be_ball', -19.6, 91.6); put('be_ball', -17.4, 86.2); put('be_ball', -21, 87);
  put('be_deckchair', -13.6, 89, { rot: -H }); put('be_cooler', -13.5, 90.3);
  [[-11.4, .95], [-9.6, 1.4], [-7.2, 2]].forEach(([x, s]) => put('be_ball', x, 94.5, big('be_ball', s)));
  // the row of striped beach huts, each with its deckchair
  for (let i = 0; i < 7; i++) { const z = 80 + i * 3.6; put('be_hut', 23.6, z, { rot: -H }); put('be_deckchair', 20.9, z, { rot: -H }); put('be_pail', 21.5, z + 1.15); }
  // ice-cream cart and its queue of cones (a giant one for a sign); a trail of dropped cones leads back to the parasols
  put('be_cart', 7.5, 88, { rot: -H }); put('be_icecream', 9.7, 89.9, big('be_icecream', 2));
  [[86.5, .12], [85.8, .17], [84.95, .25], [83.9, .36], [82.6, .52], [81, .75]].forEach(([z, s]) => put('be_icecream', 7.5, z, big('be_icecream', s)));
  put('be_parasol', 5.6, 90); put('be_cooler', 9.1, 86.9); put('be_cooler', 9.2, 86.1, { rot: 0.4 });
  row('be_icecream', 5.4, 86.6, -6.6, 75.6, 8);
  // surfboards planted in a row by size
  [[-37, .65], [-35.5, .95], [-33.6, 1.4], [-31.2, 2], [-28.1, 2.9], [-24, 4.2]].forEach(([x, s]) => put('be_surfboard', x, 98, big('be_surfboard', s)));
  put('be_towel', -33, 100.6, { rot: 0.2 }); put('be_towel', -30.4, 100.8, { rot: -0.1 }); put('be_flipflop', -31.7, 101.6); put('be_flipflop', -31.4, 101.7, { rot: 0.5 }); put('be_cooler', -27, 100.6);
  // lifeguard tower: life rings in a row, the red flag, a rescue board
  put('be_tower', 12, 99); row('be_ring', 14.6, 100.6, 17.6, 100.6, 4); put('se_flag', 9.4, 100.6, big('se_flag', 2.5));
  put('be_deckchair', 11, 102.2); put('be_surfboard', 14.4, 97.4, big('be_surfboard', 2.4));
  // the rowing-boat regatta, beached, oars laid either side of every boat
  for (let i = 0; i < 5; i++) { const x = -42 + i * 4.5; put('be_rowboat', x, 109); put('be_oar', x - 1.05, 109); put('be_oar', x + 1.05, 109, { rot: PI }); }
  put('se_flag', -44, 105.2, big('se_flag', 2)); put('se_flag', -22, 105.2, big('se_flag', 2));
  // kites tied to poles
  row('be_kite', 9, 110.5, 27, 110.5, 5);
  // borders: a sunbather who dragged his chair to the canyon rocks; an angler who prefers the marsh puddles
  put('boulder', 22, 68.4); put('boulder', 23, 71.4, { rot: 1 }); put('be_deckchair', 19.8, 70.2, { rot: -H }); put('be_parasol', 20.6, 68.8); put('be_cooler', 19.9, 71.5);
  put('be_deckchair', -37, 103, { rot: -H }); put('be_rod', -38.2, 103, { rot: -H }); put('be_pail', -37.2, 104);
  put('ma_reed', -39.4, 101.9); put('ma_reed', -39.8, 103.6, big('ma_reed', .95)); put('ma_reed', -39, 104.8);
  // shells and starfish along the tideline
  for (let i = 0; i < 14; i++) put('be_shell', -20 + rnd() * 44, 103 + rnd() * 10, { rot: rnd() * 6 });
  for (let i = 0; i < 8; i++) put('be_starfish', -18 + rnd() * 40, 104 + rnd() * 9, { rot: rnd() * 6 });
}
// The pier: everything is small and kept to the two edges, so a ball always has the middle 2.5 m to itself.
function pier() {
  ALLOW = ['beach', 'tidepool'];
  for (let z = 106; z <= 170; z += 8) { put('be_bollard', -1.62, z); put('be_bollard', 1.62, z); }
  for (const z of [110, 126, 142, 158]) put('lamp', -1.75, z, { scale: 0.45 });
  for (const z of [118, 134, 150, 166]) put('lamp', 1.75, z, { scale: 0.45 });
  for (const z of [120, 124, 136, 140, 152, 156]) { put('be_rod', 1.72, z, { rot: H }); put('be_pail', 1.5, z + 1.1); }
  for (const z of [132.5, 148.5]) { put('crate', -1.6, z); put('tp_fish', -1.5, z + 1.2, { rot: 1 }); put('tp_fish', -1.55, z + 1.9, { rot: 2 }); }
  put('be_telescope', 1.35, 170.6); put('be_ring', -1.5, 170.6);
}

// ---------------------------------------------------------------- the Tide Pools
function tidepool() {
  ALLOW = ['tidepool'];
  // fish market: two slabs, the catch laid out in rows by size, one enormous swordfish nobody could lift
  put('tp_slab', 7, 120.5); put('tp_slab', 11, 120.5);
  row('tp_fish', 5.6, 122.6, 12.6, 122.6, 8, { rot: 0.4 }); row('tp_fish', 6, 124, 12, 124, 4, big('tp_fish', .65, { rot: 0.4 }));
  put('tp_fish', 15.6, 122.4, big('tp_fish', 2, { rot: 0.3 })); put('crate', 4.4, 119.6); put('crate', 4.5, 120.8); put('barrel', 13.7, 119.4); put('barrel', 14.9, 119.6);
  // a message-in-a-bottle trail, each bottle bigger than the last, all the way to the lighthouse
  [.32, .32, .45, .45, .65, .65, .95, .95, 1.4, 2].forEach((s, i) => put('tp_bottle', 19 + i * 1.05, 127 + i * 1.6, big('tp_bottle', s, { rot: i * 0.7 })));
  // the lighthouse on its rocks, the keeper's cottage, coiled ropes, lobster pots in a row
  put('tp_lighthouse', 34, 150);
  [[39.4, 151.5, 2], [38, 155.4, 2.9], [34, 156.6, 1.4], [30.2, 155.2, 2], [40, 147.6, 1.4]].forEach(([x, z, s]) => put('tp_rock', x, z, big('tp_rock', s, { rot: x })));
  put('tp_cottage', 25, 146.3, { rot: PI }); row('tp_pot', 13.5, 146.2, 20.5, 146.2, 8); row('tp_rope', 20.8, 149.6, 24.7, 149.6, 4);
  // nets drying on racks
  row('tp_netrack', -54, 124, -36, 124, 4); put('crate', -51, 126.6); put('crate', -50, 127.3, { rot: 0.5 }); put('crate', -45, 126.7); put('tp_rope', -39, 126.6); put('tp_rope', -37.6, 127.1);
  // barnacled rocks, each bigger than the last, marching down the west shore
  [[-57, 131, .65], [-56.2, 133.4, .95], [-55, 136.3, 1.4], [-53.2, 139.8, 2], [-50.6, 144.2, 2.9], [-46.6, 149.6, 4.2], [-39, 154.2, 6]].forEach(([x, z, s]) => put('tp_rock', x, z, big('tp_rock', s, { rot: z })));
  [[-33.5, 131.5, 1.4], [-19, 131.6, 2], [5.2, 131.4, 1.4], [20, 132, 2], [-19.6, 120.8, 1.4], [-44, 132.5, 2.9]].forEach(([x, z, s]) => put('tp_rock', x, z, big('tp_rock', s, { rot: z })));
  // the boatyard: three hulls up on trestles, paint pots, planks, an anchor waiting to be fitted
  for (const x of [-30, -23, -16]) put('tp_hull', x, 137.5);
  row('be_pail', -28, 141.2, -25, 141.2, 4); row('ma_plank', -21, 141, -18.6, 141, 4, { rot: H }); put('barrel', -33.4, 136); put('barrel', -33.6, 137.3); put('barrel', -12.6, 137);
  put('crate', -12.4, 138.4); put('crate', -26.5, 134.2); put('tp_rope', -19.6, 134.4); put('tp_anchor', -33.6, 140.2, { rot: 0.4 });
  // anchors in three sizes
  put('tp_anchor', 6, 134.6); put('tp_anchor', 9.8, 136.2, big('tp_anchor', 2.9, { rot: 0.3 })); put('tp_anchor', 17, 137.6, big('tp_anchor', 6, { rot: -0.3 }));
  // crab-pot stacks
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { put('tp_pot', -11.2 + i * 1.2, 121 + j * 1.1, big('tp_pot', .95)); put('tp_pot', -10.6 + i * 1.2, 150 + j * 1.1, big('tp_pot', .95)); }
  // giant conches and clams sitting in the pools and out on the shelf
  [[-30, 122.6, 1], [-23, 123, 2], [8.4, 126.4, 1.4], [-9, 143, 2.9], [-18, 158.6, 4], [21, 165, 8.7]].forEach(([x, z, s]) => put('tp_conch', x, z, big('tp_conch', s, { rot: x })));
  [[-27, 126.6, 1.4], [-22.4, 128.2, 2], [12.6, 127.6, 2.9], [11.5, 158.6, 4.1], [-31, 165, 6]].forEach(([x, z, s]) => put('tp_clam', x, z, big('tp_clam', s, { rot: x })));
  // beached buoys in a row, dinghies moored on the shelf
  row('se_buoy', -34, 147, -24, 147, 5); put('be_rowboat', -8, 163, { rot: 0.5 }); put('be_rowboat', 6.4, 164, { rot: -0.4 }); put('be_rowboat', 9, 159.5, { rot: 1.2 });
  cover('be_starfish', -6, 133, 14, 8, { scale: 2 });
}

// ---------------------------------------------------------------- Pearl Bay
function sea() {
  ALLOW = ['sea', 'tidepool', 'islet'];
  // lines of buoys from the pier end out to each islet
  row('se_buoy', -3.5, 176.5, -20, 189.5, 4); row('se_buoy', 3.5, 178, 13, 194, 4); row('se_buoy', 6.5, 176, 49, 185.5, 7); row('se_buoy', -7, 175.5, -59, 181, 8);
  // fishing boats, and a trawler twice their size
  put('se_fishboat', 40, 174, { rot: 1 }); put('se_fishboat', -48, 193, { rot: -0.6 }); put('se_fishboat', 86, 202, { rot: 2 }); put('se_fishboat', -6, 214, { rot: 2.6 });
  put('se_fishboat', -92, 205, big('se_fishboat', 6, { rot: 0.8 }));
  // the sailing ship at anchor, ringed by marker buoys
  put('se_ship', 30, 221, { rot: H }); ring('se_buoy', 30, 221, 9, 4, null, 0.8);
  // flotsam from a wreck drifting in two lines between the islets
  for (let i = 0; i < 7; i++) put('se_crate', 30 + i * 3.6 + rnd(), 192 + i * 2.3 + rnd(), { rot: rnd() * 6 });
  for (let i = 0; i < 6; i++) put('se_barrel', 34 + i * 3.4 + rnd(), 203 + i * 2 + rnd(), { rot: rnd() * 6 });
  [[37, 211], [45, 194.5], [58, 203]].forEach(([x, z]) => put('se_crate', x, z, big('se_crate', 2.2, { rot: x })));
  put('se_barrel', 22, 196.5, big('se_barrel', 2.9, { rot: 1 })); put('se_barrel', 52, 214, big('se_barrel', 2.9, { rot: 2 }));
  // the castaway's raft, flying his shirt
  put('se_raft', -44, 210, { rot: 0.7 });
  // a 9 m inflatable sea serpent, swimmers' rings round it; a giant rubber duck and her ducklings
  put('se_serpent', -66, 207, { rot: 0.3 }); ring('be_ring', -66, 207, 6.5, 4, big('be_ring', 1.4), 0.5);
  put('se_duck', -18, 217, { rot: H }); row('se_duck', -22, 218.2, -33, 222, 5, big('se_duck', 1.4, { rot: H }));
}
function islets() {
  ALLOW = ['islet'];
  { // 1  castaway camp: SOS in white stones, shelter, signal fire, his shirt on a pole
    const x = -30, z = 196, S = [[.8, -1.6], [-.8, -1.0], [0, 0], [.8, 1.0], [-.8, 1.6]];
    for (const [dx, dz] of S) { put('se_stone', x - 6 + dx, z + 4.6 + dz); put('se_stone', x + 6 + dx, z + 4.6 + dz); }
    ring('se_stone', x, z + 4.6, 1.6, 6);
    put('se_leanto', x - 3, z - 1.6, { rot: 0.3 }); put('se_fire', x + 3.6, z - 1); put('se_flag', x + 0.4, z - 4.6, { rot: 0 });
    put('se_palm', x - 8.5, z - 2.5); put('se_palm', x + 8.4, z - 3.4, { rot: 2 });
    put('se_coconut', x - 6.5, z - 4.6); put('se_coconut', x + 6.4, z - 0.6); put('se_coconut', x - 0.6, z - 1.6);
    put('se_barrel', x + 1.4, z - 6); put('se_crate', x - 5.6, z - 0.2, big('se_crate', 1.45, { rot: 0.4 })); put('se_crate', x - 9, z + 0.4, big('se_crate', 1.45));
  }
  { // 2  pirate dig: an X, three holes' worth of earth, shovels left standing, the chest, giant gold coins spilling to the shore
    const x = 18, z = 204;
    put('se_x', x, z); put('se_heap', x - 2.8, z - 1.6); put('se_heap', x + 2.2, z - 2.6); put('se_heap', x - 1.6, z + 2.8);
    put('se_shovel', x + 1.5, z + 1.2, { rot: 0.4 }); put('se_shovel', x - 3.8, z + 0.8, { rot: 1 }); put('se_shovel', x + 0.2, z - 3.6, big('se_shovel', 2.9));
    put('se_chest', x + 4.2, z + 0.6, { rot: -0.4 }); put('se_chest', x - 5.4, z - 3, big('se_chest', 1.4, { rot: 0.7 }));
    row('coin', x + 5.4, z + 2.2, x + 7.4, z + 4.4, 5, { scale: 40 });
    put('se_flag', x - 6.6, z + 3.2, { rot: 0.5 }); put('se_cannon', x + 8.4, z - 1.6, { rot: H }); put('se_cannon', x - 8.6, z - 0.2, { rot: -H });
    row('se_barrel', x - 2.6, z + 6, x + 2.2, z + 6, 4); put('se_stone', x + 5.4, z - 4.6, big('se_stone', 2.8)); put('se_palm', x - 3, z - 6); put('se_palm', x + 9.5, z + 2.4, { rot: 1 });
  }
  { // 3  coconut-palm grove: a ring of palms, a hammock, and the 5 m coconut everyone is waiting for
    const x = 62, z = 188;
    put('se_coconut', x, z, big('se_coconut', 5));
    for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2 + 0.3; put('se_palm', x + Math.cos(a) * 8, z + Math.sin(a) * 6, { rot: a }); }
    ring('se_coconut', x, z, 3.9, 6, null, 0.2); [[x - 5.6, z + 0.6], [x + 5.8, z - 1.2], [x + 0.6, z + 5.2]].forEach(([px, pz]) => put('se_coconut', px, pz, big('se_coconut', 2)));
    put('se_hammock', x + 2.6, z - 5.2, { rot: 0.2 }); put('se_tiki', x - 3.6, z - 4.6); put('se_tiki', x - 9.4, z + 1.4, { rot: -H }); put('se_tiki', x + 10, z + 0.6, { rot: H });
    put('be_parasol', x - 3.6, z + 5.6, big('be_parasol', 2.9)); put('be_deckchair', x - 5.4, z + 6.4, big('be_deckchair', 1.45, { rot: 0.4 })); put('be_deckchair', x - 1.6, z + 6.8, big('be_deckchair', 1.45, { rot: -0.3 }));
  }
  { // 4  ruined shrine: an arch, two rows of columns (two broken short), the big bell, lanterns, idols
    const x = -74, z = 182;
    put('se_arch', x, z + 6.4); put('se_bell', x, z - 1);
    for (const s of [-1, 1]) {
      put('se_column', x + s * 3.4, z + 4); put('se_column', x + s * 3.4, z + 0.4); put('se_column', x + s * 3.4, z - 3.2, big('se_column', 2));
      put('se_slantern', x + s * 1.9, z + 4.6); put('se_slantern', x + s * 6, z + 2.4, big('se_slantern', 2.1)); put('se_slantern', x + s * 8.6, z - 0.6);
      put('se_idol', x + s * 2.6, z - 5.4, { rot: -s * 0.3 }); put('gy_urn', x + s * 5.8, z - 2.4); put('gy_urn', x + s * 5.6, z + 5.4);
    }
    put('se_idol', x, z - 6, big('se_idol', 4.2)); put('se_stone', x - 8, z + 3.4); put('se_stone', x + 7.4, z + 5.2, { rot: 1 }); put('se_stone', x + 9.6, z + 2); put('se_palm', x - 9.6, z - 2.6);
  }
}

// ---------------------------------------------------------------- Mirewater Marsh
function stiltHut(x, z, f, kind) {
  const s = frame(x, z, f);
  s.p('ma_hut', 0, 0); s.p('ma_cauldron', kind ? 3.4 : 0, kind ? 3 : 3.7);
  if (kind === 0) {            // the herbalist: ingredient jars in two neat rows, reed bundles drying, a jar trail left by a forgetful customer
    s.line('ma_ingredient', -1.5, 5, 1.5, 5, 6); s.line('ma_ingredient', -1.5, 5.5, 1.5, 5.5, 6);
    s.line('ma_bundle', 3.2, -0.4, 3.2, 2.2, 3); s.p('ma_frognet', -3, 0.8); s.p('ma_frognet', -3.2, 1.8, 0.5); s.p('be_pail', -1.4, 3.4);
    s.line('ma_jar', -0.6, 2.4, 0.6, 2.4, 3);
  } else {                     // the frog-catcher: nets, eel traps, jars of fireflies, reed bundles stood in size order
    s.line('ma_ingredient', 2.4, 4.3, 4.6, 4.3, 5); s.line('ma_frognet', -3, 0, -3, 2, 3); s.line('ma_trap', -4.8, 4, -1.5, 4, 4, 0.3);
    s.line('ma_jar', -2.5, 5.2, 0, 5.2, 6); [[3, .65], [4.2, .95], [5.8, 1.4], [7.9, 2]].forEach(([r, sz]) => s.p('ma_bundle', r, -1, 0, big('ma_bundle', sz)));
    s.p('be_pail', 1.2, 2.6); s.p('be_pail', 1.7, 3);
  }
}
function marsh() {
  ALLOW = ['marsh'];
  // the mushroom-ring ladder: fairy rings from thumb-size up, stepping away from the Green to the giant toadstool house
  const rings = [[-27, 49, .07, .5, 7], [-30.2, 50.6, .1, .7, 7], [-33.6, 52.6, .15, 1, 7], [-37, 55.6, .22, 1.3, 6], [-40, 59.6, .32, 1.7, 6], [-43, 64.6, .45, 2.1, 6],
    [-46, 70.6, .65, 2.6, 5], [-38.4, 72, .95, 3.1, 5], [-42, 89.4, 1.4, 3.6, 5]];
  rings.forEach(([x, z, s, r, n], k) => { ring('ma_shroom', x, z, r, n, big('ma_shroom', s), k); if (k < 5) put('ma_jar', x, z); });
  put('ma_toadstool', -57, 93); ring('ma_shroom', -57, 93, 6.2, 5, big('ma_shroom', 2), 0.3);
  // firefly lanterns and a row of jars along the trail in, then on to the jetty
  [[-42.2, 45.8], [-49.8, 46.2], [-50.2, 53.8], [-49.3, 60.2], [-49.3, 63.8]].forEach(([x, z], i) => put('ma_lantern', x, z, { rot: i }));
  row('ma_jar', -41.7, 44.3, -50.7, 53.3, 9);
  // the bog: a rickety jetty out to the island with the sunken statue, a punt tied up, lotus and lily pads, eel traps on the bank
  for (let i = 0; i < 10; i++) put('ma_plank', -50.8 - i * 0.7, 62 + (rnd() - 0.5) * 0.2, { rot: H + (rnd() - 0.5) * 0.3 });
  for (const x of [-51.5, -53.6, -55.7]) { put('ma_post', x, 61.05, { rot: x }); put('ma_post', x, 62.95, { rot: -x }); }
  put('ma_statue', -60.4, 60.8, { rot: 0.5 }); put('ma_punt', -53.6, 65.2, { rot: 1.2 }); put('ma_pole', -52, 66.6);
  [[-67, 55.5], [-68.6, 66], [-58, 70.6]].forEach(([x, z]) => put('ma_lotus', x, z, big('ma_lotus', 3)));
  ring('ma_lotus', -60, 61, 6.2, 6, null, 0.5); row('ma_trap', -66, 50.6, -58, 50.6, 5, { rot: 0.4 });
  cover('lily', -62, 62, 9.5, 8);
  // three stilt huts
  stiltHut(-30, 66, -H, 0); row('ma_jar', -40.4, 65, -35.9, 66, 5);
  stiltHut(-70, 44, 0, 1);
  { // the west hut, reached by a boardwalk across the big pool; cattails in size order, a punt and its pole
    put('ma_hut', -88, 69, { rot: PI }); row('ma_plank', -88, 65.4, -88, 52.4, 10);
    for (const z of [64, 58.5, 53]) { put('ma_post', -88.95, z); put('ma_post', -87.05, z, { rot: 2 }); }
    [[-99, .65], [-97.4, .95], [-95.4, 1.4], [-92.9, 2]].forEach(([x, s]) => put('ma_reed', x, 72.2, big('ma_reed', s))); put('ma_reed', -82.6, 71.6, big('ma_reed', 2.9));
    put('ma_punt', -93, 61, { rot: 0.3 }); put('ma_pole', -91.4, 62.4); put('ma_lantern', -90.3, 66.4); put('ma_lantern', -85.7, 66.4, { rot: PI });
  }
  // stepping-stone lines across two pools
  row('ma_stone', -43.5, 74.5, -57, 85.5, 9); row('ma_stone', -66.5, 79, -78, 79.6, 7);
  // cattail clumps stood in size order along three pool edges; loose reeds round the pools
  for (const [x, z, dx] of [[-73, 86.6, 1], [-56, 47.6, -1], [-30.6, 76.6, -1]]) [[0, .65], [1.7, .95], [3.8, 1.4], [6.4, 2]].forEach(([d, s]) => put('ma_reed', x + d * dx, z, big('ma_reed', s)));
  for (const [x, z, r, n] of [[-91, 58, 9, 5], [-48, 80, 4.5, 3], [-69, 90, 4.5, 3], [-47, 99, 4, 2]]) cover('ma_reed', x, z, r, n);
  cover('lily', -91, 58, 8, 4); cover('lily', -47, 43, 5, 3);
  // border with the beach: mangroves, a washed-up net with lobster pots in it, driftwood, shells
  put('ma_mangrove', -35.6, 80.4); put('ma_mangrove', -41.4, 94.4, { rot: 3 }); put('ma_mangrove', -43.8, 97.8, big('ma_mangrove', 2.9, { rot: 1 })); put('ma_mangrove', -46.4, 101.4, { rot: 2 });
  put('ma_net', -39, 91.2, { rot: 0.4 }); put('tp_pot', -40.4, 92.4, { rot: 1 }); put('tp_pot', -41.5, 91.4);
  put('ma_driftwood', -37.6, 84.4, { rot: 0.3 }); put('ma_driftwood', -40.6, 89.4, { rot: 1.4 }); put('ma_driftwood', -37.8, 93.6, { rot: 2.2 }); put('ma_driftwood', -46.6, 102.6, { rot: 0.8 });
  row('be_shell', -37.2, 86, -37.6, 92.4, 6); put('be_starfish', -38.4, 88.2); put('be_starfish', -36.9, 90); put('be_starfish', -39.4, 93.4);
  // border with the forest: rotten logs with bracket fungi, ferns, toadstools sprouting beside them
  [[-76, 38.6, 0.3], [-80.4, 40.8, 1.2], [-85, 43.4, 0.6], [-92.5, 45.8, 2]].forEach(([x, z, r]) => {
    put('ma_rotlog', x, z, { rot: r }); put('ma_fern', x + 1.3, z + 1.2, { rot: r }); put('ma_fern', x - 1.2, z - 1.3, big('ma_fern', 1.2, { rot: r * 2 }));
    put('ma_shroom', x + 0.2, z + 0.9, big('ma_shroom', .25)); put('ma_shroom', x - 0.5, z + 0.8, big('ma_shroom', .18));
  });
  put('stump', -78.4, 43.6); put('stump', -88.6, 46.4);
  // border with Gloomrest: headstones that slid into a pool, one lantern still lit
  [[-92, 76.4], [-90, 79.6], [-93.4, 81.2], [-89.4, 83]].forEach(([x, z], i) => put('gy_sunk', x, z, { rot: i * 1.3 })); put('ma_lantern', -86, 77.4);
}

// ---------------------------------------------------------------- Gloomrest
const RIV = [[-150, 56], [-124, 90], [-96, 116], [-66, 150]];
function alongRiver(s) {                 // the point s metres down the river from the top of the graveyard, and the unit normal pointing at the marsh
  for (let i = 0; i < RIV.length - 1; i++) {
    const [ax, az] = RIV[i], [bx, bz] = RIV[i + 1], L = Math.hypot(bx - ax, bz - az);
    if (s <= L || i === RIV.length - 2) return { x: ax + (bx - ax) * s / L, z: az + (bz - az) * s / L, nx: (bz - az) / L, nz: -(bx - ax) / L };
    s -= L;
  }
}
const CRYPT = [-133, 133];
const pathZ = (x) => 101 + (x + 73) * 0.0588;                       // the pumpkin path from the marsh to the chapel
const KEEP = [[-151, 80.5, 7], [-166, 96, 14], [-116, 65.5, 8.5], [-129, 49, 9], [-167, 118, 7]];      // scenes the grave rows leave room for
const GRAVES = [];
function graveRow(off, size, step, s1, s2) {
  const kinds = ['gy_stone', 'gy_cross', 'gy_stone', 'gy_obel'];
  let k = Math.round(Math.abs(off));
  for (let s = s1; s <= s2; s += step, k++) {
    const p = alongRiver(s), x = p.x + p.nx * off, z = p.z + p.nz * off;
    if (Math.abs(z - pathZ(x)) < 5 || Math.hypot(x - CRYPT[0], z - CRYPT[1]) < 28.5 + size * 0.4) continue;
    if (KEEP.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr) || M.water(x, z)) continue;
    const g0 = M.ground(x, z), id = kinds[k % 4];
    if ([[2, 0], [-2, 0], [0, 2], [0, -2]].some(([dx, dz]) => Math.abs(M.ground(x + dx, z + dz) - g0) > 0.3)) continue;      // not on a ledge
    if (GRAVES.some(([gx, gz, gs]) => Math.hypot(x - gx, z - gz) < 1.2 + (gs + size) * 0.6)) continue;                        // rows meet at the river's bend
    GRAVES.push([x, z, size]);
    put(id, x, z, big(id, size, { rot: Math.atan2(p.nx, p.nz) + (rnd() - 0.5) * 0.16 }));
  }
}
function graveyard() {
  ALLOW = ['graveyard']; GRAVES.length = 0;
  // rows of graves along the river: little markers on the marsh side, a size up every row, monuments beyond the far bank
  graveRow(23.5, .45, 3, 14, 96); graveRow(19, .65, 3.5, 12, 98); graveRow(14, .95, 4.2, 12, 98); graveRow(8.5, 1.4, 5.2, 12, 100);
  graveRow(-9, 2, 6.2, 4, 74); graveRow(-16.5, 2.9, 7, 2, 72); graveRow(-25, 4.2, 10, 0, 66); graveRow(-35, 4.2, 10, 3, 60);
  // the pumpkin path: jack-o'-lanterns in pairs from the marsh edge to the chapel door, bigger past the river
  for (let x = -78; x >= -106; x -= 4) for (const s of [-3, 3]) put('gy_pumpkin', x, pathZ(x) + s, { rot: s > 0 ? PI : 0 });
  for (let i = 0; i < 6; i++) { const x = -124 - i * 6; for (const s of [-3.2, 3.2]) put('gy_pumpkin', x, pathZ(x) + s, big('gy_pumpkin', i < 3 ? .95 : 1.4, { rot: s > 0 ? PI : 0 })); }
  for (const z of [-7, 7]) put('gy_wisp', -110, pathZ(-110) + z); for (const z of [-7, 7]) put('gy_wisp', -121, pathZ(-121) + z, { rot: 2 });
  { // the crypt on its hill behind an iron fence; angels at the gate; monuments, gargoyles and lantern trees on the terrace below
    const [x, z] = CRYPT;
    put('gy_crypt', x, z, { rot: H });
    for (let q = 0; q < 4; q++) for (let i = -2; i <= 2; i++) { const a = q * H + PI / 4 + i * 0.24; put('gy_fence', x + Math.cos(a) * 11, z + Math.sin(a) * 11, { rot: H - a }); }
    put('gy_gate', x + 11, z, { rot: H }); put('gy_angel', x + 11.6, z - 3.6, { rot: H }); put('gy_angel', x + 11.6, z + 3.6, { rot: H });
    for (const dx of [5.4, 8.2]) for (const dz of [-1.7, 1.7]) put('gy_urn', x + dx, z + dz);
    for (let k = 0; k < 8; k++) { const a = k * PI / 4 + 0.39, six = k % 2 === 1 && k !== 7; put('gy_monument', x + Math.cos(a) * 20, z + Math.sin(a) * 20, big('gy_monument', six ? 6 : 4.2, { rot: H - a })); }
    for (let k = 0; k < 4; k++) { const a = k * H + 1.18; put('gy_deadtree', x + Math.cos(a) * 23, z + Math.sin(a) * 23, { rot: a }); put('gy_lantern', x + Math.cos(a) * 21.4, z + Math.sin(a) * 21.4); }
    for (const a of [-0.42, 0.42, PI - 0.42, PI + 0.42]) put('gy_gargoyle', x + Math.cos(a) * 17, z + Math.sin(a) * 17, big('gy_gargoyle', Math.abs(a) < 1 ? 1.4 : 2, { rot: H - a }));
  }
  { // the ruined chapel: bell tower standing, bell fallen out of it, pews still in rows on the grass
    put('gy_chapel', -166, 90); put('gy_bell', -159.4, 95.6, { rot: 0.6 });
    for (const x of [-168.6, -163.4]) for (let j = 0; j < 4; j++) put('gy_pew', x, 97.4 + j * 2.4, { rot: PI });
    put('gy_candle', -171, 95.6); put('gy_candle', -161, 99.4); put('gy_angel', -174, 99, big('gy_angel', 4.2, { rot: H }));
    put('gy_gargoyle', -158.6, 87.4, big('gy_gargoyle', 2, { rot: H })); put('gy_gargoyle', -173.4, 84, big('gy_gargoyle', 2, { rot: -H }));
    put('gy_urn', -170.4, 107.4); put('gy_urn', -161.6, 107.4); put('gy_pumpkin', -157.4, 91.6, big('gy_pumpkin', 2.9, { rot: H })); put('gy_pumpkin', -157.4, 101.4, big('gy_pumpkin', 2.9, { rot: H }));
    put('gy_wisp', -176, 92); put('gy_wisp', -172, 104.6, { rot: 1 }); put('gy_deadtree', -178.6, 86.6); put('gy_lantern', -177.4, 88);
  }
  { // border with the gorge: the covered gatehouse, cracked urns lining the way in, a run of fence either side
    const s = frame(-129, 45, 0);
    s.p('gy_gatehouse', 0, 0);
    for (const r of [-2.6, 2.6]) { s.p('gy_urn', r, 4.2); s.p('gy_urn', r, 7.2); s.p('gy_urn', r, 10.4, 0, big('gy_urn', 2)); s.p('gy_lantern', r * 0.85, 2.3); }
    s.line('gy_fence', -8.6, 0, -4.4, 0, 3); s.line('gy_fence', 4.4, 0, 8.6, 0, 3); s.p('sign', 4.6, 3.4, 0.3);
  }
  { // the undertaker's shed: coffins lined up outside by size, one far too big for anybody
    const s = frame(-116, 63, 0);
    s.p('gy_shed', 0, 0); s.line('gy_coffin', -4, 3.6, 4, 3.6, 5); s.line('gy_coffin', -3, 6.3, 0.2, 6.3, 3, 0, big('gy_coffin', 1.4));
    s.p('gy_coffin', 6.4, 2.6, 0.4, big('gy_coffin', 4.2)); s.line('ma_plank', -5.2, -1, -5.2, 0.6, 3, H); s.p('gy_lantern', -1.4, 2.4); s.p('gy_lantern', 1.4, 2.4);
  }
  { // the gravedigger's half-dug plot: cart, heaps of earth, shovels (one giant), the coffin waiting, and his boots - he left in a hurry
    put('gy_plot', -151, 80, { rot: 0.2 }); put('se_heap', -153.7, 79); put('se_heap', -153.3, 82); put('gy_dcart', -147.4, 82.4, { rot: 0.5 });
    put('se_shovel', -150.2, 77.8, { rot: 1 }); put('se_shovel', -152, 82.9, { rot: 2 }); put('se_shovel', -155.6, 84.2, big('se_shovel', 2.9));
    put('gy_lantern', -149.7, 77.4); put('gy_coffin', -147.4, 78.2, { rot: 0.3 }); put('boot', -150.6, 81.5, { scale: 2 }); put('boot', -150.1, 81.8, { scale: 2, rot: 1 });
  }
  { // the midnight tea party: six empty chairs pulled up, cups laid, a teapot as big as a guest
    const x = -95, z = 142;
    put('gy_table', x, z); ring('gy_chair', x, z, 2.3, 6, null, 0.3, true); ring('cup', x, z, 1.35, 6, { scale: 2.5 }, 0.3);
    put('gy_teapot', x + 3.6, z + 2.4); put('gy_teapot', x - 3.4, z + 2.8, { rot: 2 }); put('gy_teapot', x + 4.8, z - 3, big('gy_teapot', 2, { rot: 1 }));
    put('gy_candle', x - 3.6, z - 2.6); put('gy_candle', x + 0.4, z + 4);
  }
  // the 8 m scarecrow-reaper in a ring of will-o'-wisps, two prize pumpkins at his feet
  put('gy_reaper', -104, 158); ring('gy_wisp', -104, 158, 7, 6, null, 0.5);
  put('gy_pumpkin', -99, 155, big('gy_pumpkin', 2.9, { rot: 0.5 })); put('gy_pumpkin', -109, 161.4, big('gy_pumpkin', 2, { rot: -0.5 }));
  // the hearse carriage, its last passenger unloaded
  put('gy_hearse', -167, 118, { rot: 0.5 }); put('gy_coffin', -163.2, 121, { rot: 0.5 }); put('gy_wisp', -170, 114.4); put('gy_wisp', -163.4, 114.8, { rot: 2 }); put('gy_deadtree', -172.6, 121.6); put('gy_lantern', -171.4, 123);
  // border with the marsh: headstones sliding into the wet, and a few already in the river
  [[-103.4, 72.6], [-101.6, 76.6], [-100, 80.6], [-97, 84.4], [-94.6, 87.4]].forEach(([x, z], i) => put('gy_sunk', x, z, { rot: i * 1.1 }));
  for (const s of [48, 57, 66, 75]) { const p = alongRiver(s); put('gy_sunk', p.x + (s % 2 ? 1.2 : -1.2), p.z, big('gy_sunk', 1.6, { rot: s })); }
  // lantern trees here and there, a stone angel and gargoyles among the rows
  [[-139, 62], [-107, 80], [-84, 110], [-143, 104], [-183, 104], [-120, 164]].forEach(([x, z], i) => { put('gy_deadtree', x, z, { rot: i }); put('gy_lantern', x + 1.3, z + 0.9); });
  put('gy_angel', -178, 110, { rot: H }); put('gy_angel', -92, 127, { rot: -H }); put('gy_gargoyle', -112, 112, { rot: -H }); put('gy_gargoyle', -86, 96, { rot: PI });
}

export function dress(m) {
  M = m; seed = 20261; dress.missed = [];
  beach(); pier(); tidepool(); sea(); islets(); marsh(); graveyard();
}
dress.missed = [];
