# Habitat dressing brief

You are set-dressing part of the map of **Critter Roller**, a browser game (three.js, plain ES modules, no build step).
Four teams each roll a Katamari-style ball for 5 minutes on one continent, sticking things and elemental critters to it;
the ball starts 0.6 m wide and should end 15-25 m wide. Read `map.js` (the continent, biome list, `PLACES`, the river)
and one existing example of the old style, `old/map-five-rings.js` (helper style: `cafe`, `picnic`, `farm`...), before you start.

Your job: write ONE file, `habitats/<yours>.js`, exporting `ITEMS`, `SHAPES` and `dress(m)`. Edit no other file.
Do not use the Browser pane and do not start servers. Check your work with the node tools below.

## The map in one paragraph
North is -z, east is +x, metres. The centre (0,0) is Crossway Green (the hub), a bowl 50 m in radius where all four teams start
and race for a feast in the middle. Round it are eight wedges, each with an inner habitat (about 50-122 m from the centre) and an
outer one (122 m to the coast at about 210 m; the south is a bay, with land ending at about 150 m):
N tundra -> summit, NE works -> mountain, E ashflats -> caldera, SE canyon -> ruins, S beach -> tidepool (+ sea, islets),
SW marsh -> graveyard, W forest -> gorge, NW farm -> plain. Borders wander; ask the tools which biome a point is in.
Ground heights: hub 0; inner habitats 0.35; outer habitats sit on terraces (a ball climbs a step up to 40% of its width, so a
1.2 m step needs a 3 m ball). Mountains, the volcano and the temple are stepped cones. The river (`RIVER` in map.js) is shallow
and can be crossed anywhere; the sea needs a 3 m ball.

## How the ball works (this drives every placement decision)
- A ball picks up anything whose `size` (longest side, metres) is at most HALF the ball's width. Anything bigger is a solid obstacle
  until the ball has grown; then it becomes a prize. "Today's wall is next minute's prize."
- Growth is by volume: ball^3 += 0.95 x size^3 x mass. So one thing near the pick-up limit is worth dozens of crumbs.
- Target pace: the ball doubles about once a minute. Expected ball size on arrival: hub 0.6 -> 0.9 m; inner habitats 0.9 -> 3 m;
  outer habitats 3 -> 10 m; landmarks at the far edge feed 10 -> 25 m.
- Critters (0.2-2.2 m tall, most 0.3-1.7 m) are placed by the game, not by you: about 100 per habitat, small species near the hub
  side, big ones far out. So the 0.3-2 m rungs are partly filled already; items must cover EVERY rung, and above all the rungs
  critters do not: under 0.3 m (hub and the inner edge of inner habitats) and 2-16 m (outer habitats).
- In the last 45 seconds giant "titan" critters (3-20 m) appear in the outer habitats. Leave open ground for them out there.

## Design rules (from studying the Katamari games; follow them)
1. **Size ladder.** Rungs about 1.45x apart: 0.07 0.1 0.15 0.22 0.32 0.45 0.65 0.95 1.4 2 2.9 4.2 6 8.7 12.5+. Every habitat must hold
   at least 5 adjacent rungs with real numbers on each, shifted for where it is: an inner habitat needs plenty at 0.22-1.4 (what a
   0.9-3 m ball eats) plus 2-6 m things as scenery that later become prizes; an outer habitat needs plenty at 1.4-4.2 plus
   6-16 m landmarks. Always leave something "just too big" in view.
2. **Scenes, never scatter.** Every prop belongs to a little scene someone could have left behind: a queue, a picnic, a campsite,
   a stall with its stock, a row of washing, a half-built snowman next to a finished one, tools beside the thing being mended.
   One small joke per scene. Write a helper function per scene (as in the old map) and place the scenes by hand. Use `m.blob`
   or `m.scatter` only for natural ground cover (pebbles, flowers, shells, reeds), and keep that under a third of your things.
3. **Lines lead somewhere.** Lay trails of small pick-ups (rows, arcs) from the hub edge into your habitat and from scene to scene,
   so a rolling ball always sees the next thing. Rows and rings of identical things are satisfying to sweep up.
4. **Giant versions.** Fill the big rungs partly with giant versions of small themed things (`scale` option, or a second item id):
   a 6 m snowman, a 9 m cactus, a 12 m totem. It is cheap and funny.
5. **No traps, no mazes.** Leave lanes at least 1.5x as wide as the ball expected there. Never ring a small area with big solids.
   Do not block the dirt trails painted in `scenery()` or the first 6 m beyond the hub lip. Avoid long thin props.
6. **Heavily themed.** A screenshot from anywhere should say which habitat it is, and look arranged by its inhabitants.
   Each habitat needs 2-3 landmark scenes visible from far away (tall, distinctive silhouette), set on the `PLACES` named for it.
7. **Transitions.** Along each border with a neighbouring habitat, place 2-4 scenes that mix the two themes (snow-dusted pines
   and a frozen scarecrow between tundra and farm; a half-buried boat between beach and canyon). You own the border strip on
   YOUR side only; stay inside your own biomes (the report tool tells you which biome every thing landed in).
8. **Budget.** About 250-300 things per habitat (the hub: 650-750). Total for your file is given in your task. Stay within +-10%.

## The file you write
```js
// habitats/<yours>.js
export const ITEMS = [
  // id: prefix with your two-letter code (given in your task) so ids never clash. shape: a key of SHAPES below, or a built-in one.
  // size = longest side in metres. rad = collision radius as a fraction of size (default 0.35; trees/poles ~0.12).
  // flat: true = lies on the ground and is rolled over until it can be picked up. mass (default 1) = how much of its bulk counts
  // for growth: 0.3-0.6 for hollow or spindly things (tents, trees, carts), 0.05-0.15 for buildings and tall trees.
  // floats: true = allowed on deep sea (boats, buoys). colors: one is picked at random per thing and passed to the shape.
  { id: 'tu_snowman', name: 'Snowman', size: 1.6, shape: 'tu_snowman', colors: [0xffffff], rad: 0.3, mass: 0.8 },
];
export const SHAPES = {
  // Draws ONE thing inside a 1 x 1 x 1 box standing on y = 0, centred on x = z = 0 (the game scales it by `size`).
  // P(group, geo, colour, [sx, sy, sz], [x, y, z], [rotX, rotY, rotZ]?) adds a part.
  //   geo 'box': sx, sy, sz are full width, height, depth.
  //   geo 'sph' | 'rock' | 'hemi': sx, sy, sz are RADII (a 'sph' with [.5,.5,.5] fills the box). 'hemi' is a dome, flat side down, y = its base.
  //   geo 'cyl' | 'taper' | 'cone' | 'pyr': sx, sz are radii, sy is the full height, centred on y. taper narrows to 70% at the top; pyr is 4-sided.
  //   geo 'torus': a ring lying flat; sx, sz = outer radius, sy scales its thickness.
  // c is the colour chosen from the item's `colors`. Use 3-9 parts; small things (under 0.3 m) 1-4 parts. Chunky, toy-like, readable
  // from 30 m: exaggerate the feature that identifies the thing. All parts of one thing are merged into one mesh by the game.
  tu_snowman(g, c, P) {
    P(g, 'sph', c, [.3, .28, .3], [0, .28, 0]); P(g, 'sph', c, [.21, .2, .21], [0, .64, 0]); P(g, 'sph', c, [.14, .14, .14], [0, .86, 0]);
    P(g, 'cone', 0xf2903a, [.03, .12, .03], [0, .86, .17], [Math.PI / 2, 0, 0]);
  },
};
export function dress(m) { /* place everything */ }
```
Built-in shapes you may reuse for your own items: berry coin flower mushroom bottle cup boot pot bucket crate barrel sign mailbox bush
fence bench blanket boulder cart lamp tree roundtree shed house tallhouse windmill tower. You may also place any existing item id
from `roster.js` (they have proper models: food, flowers, crates, barrels, logs, bushes, benches, tents, trees, houses...), but
most of what you place should be your own themed items, 25-45 new items per file.

### The `m` API inside dress(m)
- `m.put(id, x, z, { rot, scale })` one thing; rot in radians (0 faces +z/south, PI/2 faces east), scale multiplies its size. Returns it.
- `m.row(id, x1, z1, x2, z2, n, opt)`, `m.grid(id, x, z, cols, rows, dx, dz, opt)`, `m.ring(id, x, z, radius, n, opt)` (things face outward),
  `m.blob(id, x, z, radius, n, opt)` (random inside a circle, avoiding solids and deep sea), `m.scatter(id, x1, z1, x2, z2, n, opt)`.
- `m.rand()` seeded random 0..1 (use this, never Math.random, so the map is the same every game).
- `m.ground(x, z)` height, `m.water(x, z)` 0 none / 1 shallow / 2 sea, `m.biomeAt(x, z)` biome id, `m.sizeOf(id)`.
Things are stood on the ground automatically. Do not place anything within 5 m of the map edge (+-235).

## Tools (run from the project folder)
- `node tools/map-probe.mjs x z [x z ...]` biome, height and water at points; `node tools/map-probe.mjs patch x1 z1 x2 z2 [step]` a grid of heights.
- `node tools/map-report.mjs <biome> [<biome> ...]` things per size rung per biome, and placement problems (in the sea, straddling a
  ledge, solids inside each other, unknown ids/shapes). Get it to "no placement problems" for your biomes (a few deliberate overlaps
  such as a thing on a table are fine: say so in your report).
- `node tools/map-image.mjs <out.png> <scale> [x1 z1 x2 z2]` a top-down picture with your things as dots (white < 0.3 m, yellow < 1 m,
  orange < 3 m, red < 7 m, purple bigger). Write it to your temp folder, not the project, and LOOK at it (Read the PNG) at scale 4-6 for
  each habitat: check for scenes rather than noise, clear lanes, trails, and that nothing sits in the wrong place.
- `node --check habitats/<yours>.js` for syntax. The other habitat files are being written at the same time by other people; if one
  of them is briefly broken and the tools fail to load, wait a minute and retry (do not fix their files).

## Report back (short)
The item list (id, name, size) grouped by habitat; the scenes you built and where; the landmark for each `PLACES` point; the final
map-report table for your biomes; anything you could not make work.
