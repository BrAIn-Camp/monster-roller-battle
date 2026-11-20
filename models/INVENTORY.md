# Model inventory

Generated 2026-11-19. Every `.glb` under `models/kenney/` (1096 files, old and new), all Kenney CC0 packs. See `CREDITS-additions.md` for sources.

**Reading the tables.** Size is the bounding box W x H x D (X x Y x Z, Y up) in the model's own units, taken from the POSITION accessor min/max of every mesh primitive. Node transforms are ignored; files marked `*` have a scaled or matrix node, so their on-screen size can differ from the figure - measure those with `Box3.setFromObject` after loading. Kenney units are not metres and differ between packs (a Nature Kit tree is about 1 unit tall, a Pirate Kit ship about 13), so always scale to a target size rather than by a fixed factor. Descriptions are inferred from file names, not from looking at each model.

**External texture.** Files from the newer packs are not self-contained: each references `Textures/colormap.png` relative to itself. That file sits in a `Textures/` folder inside each affected pack folder and must be kept there (GLTFLoader resolves it automatically from the GLB's URL). Each pack has its own different colormap, so do not merge pack folders. Old camelCase files (2020 versions) and everything in nature/, space/, furniture/ and hex/ embed their data and need nothing else. The "ext" column says which is which.

**Name style.** In graveyard/, town/ and food/ the old files are camelCase (`fountainRound.glb`) and the additions are kebab-case (`fountain-square.glb`). Where a new-version file matched an existing one it was not copied, so there are no duplicates.

## Shortlists by habitat

Suggested real-world size is the longest side in metres. Paths are relative to `models/kenney/`. Each list runs from tiny to landmark.

### Snowy tundra + icy summit

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| holiday/snowflake-a.glb | 0.05 | snowflake prop (A) | 0.35 x 0.40 x 0.09 |
| holiday/gingerbread-man.glb | 0.1 | gingerbread, man | 0.34 x 0.38 x 0.08 |
| holiday/candy-cane-red.glb | 0.2 | candy, cane red | 0.30 x 0.45 x 0.10 |
| holiday/sock-red-cane.glb | 0.3 | sock, red cane | 0.42 x 0.73 x 0.24 |
| holiday/present-a-cube.glb | 0.35 | present, A cube | 0.45 x 0.30 x 0.45 |
| holiday/present-b-round.glb | 0.4 | present, B round | 0.55 x 0.27 x 0.55 |
| holiday/present-a-rectangle.glb | 0.5 | present, A rectangle | 0.65 x 0.27 x 0.45 |
| holiday/lantern.glb | 0.5 | lantern light | 0.53 x 1.74 x 0.46 |
| holiday/wreath-decorated.glb | 0.6 | wreath, decorated | 0.67 x 0.76 x 0.26 |
| holiday/rocks-small.glb | 0.6 | rocks, small | 1.54 x 0.65 x 1.42 |
| holiday/nutcracker.glb | 0.7 | nutcracker soldier toy | 0.55 x 1.08 x 0.35 |
| holiday/snow-pile.glb | 1 | snow, pile | 0.99 x 0.20 x 1.11 |
| holiday/sled.glb | 1.2 | small wooden sled | 0.63 x 0.38 x 1.00 |
| holiday/snowman.glb | 1.4 | plain snowman | 1.10 x 1.06 x 0.69 |
| holiday/rocks-medium.glb | 1.5 | rocks, medium | 1.98 x 0.88 x 1.72 |
| holiday/snowman-hat.glb | 1.6 | snowman, hat | 1.08 x 1.36 x 0.69 |
| holiday/bench.glb | 1.6 | park bench | 1.12 x 0.73 x 0.63 |
| holiday/reindeer.glb | 1.8 | standing reindeer | 0.63 x 1.12 x 1.07 |
| holiday/sled-long.glb | 2 | sled, long | 0.63 x 0.38 x 1.00 |
| platformer/tree-pine-snow-small.glb | 2.5 | tree, pine snow small | 0.66 x 1.40 x 0.66 |
| holiday/festivus-pole.glb | 3 | festivus, pole | 0.50 x 1.40 x 0.50 |
| holiday/snow-bunker.glb | 3 | snow, bunker | 1.94 x 0.41 x 1.35 |
| holiday/rocks-large.glb | 3 | rocks, large | 3.14 x 1.71 x 2.69 |
| holiday/tree-snow-a.glb | 4 | tree, snow (A) | 1.19 x 1.92 x 1.19 |
| holiday/train-locomotive.glb | 4 | train, locomotive | 0.67 x 0.43 x 0.27 |
| holiday/tree-snow-b.glb | 5 | tree, snow (B) | 1.25 x 1.97 x 1.25 |
| platformer/tree-pine-snow.glb | 6 | tree, pine snow | 0.95 x 2.00 x 0.95 |
| holiday/tree-decorated-snow.glb | 7 | tree, decorated snow | 1.25 x 2.29 x 1.25 |
| nature/tree_pineTallA_detailed.glb | 10 | tree, pine tall A detailed | 0.39 x 1.53 x 0.39 |
| nature/cliff_large_stone.glb | 14 | cliff, large stone | 1.00 x 1.00 x 0.42 |

### Mountain crags + abandoned power station

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| factory/cog-a.glb | 0.1 | cog prop (A) | 1.00 x 0.23 x 1.00 |
| nature/rock_smallA.glb | 0.3 | rock, small (A) | 0.36 x 0.19 x 0.36 |
| factory/lever-single.glb | 0.4 | lever, single | 0.50 x 0.38 x 0.34 |
| factory/cone.glb | 0.5 | traffic cone | 0.30 x 0.31 x 0.30 |
| factory/box-small.glb | 0.5 | box, small | 0.59 x 0.55 x 0.50 |
| survival/barrel.glb | 0.9 | wooden barrel | 0.24 x 0.34 x 0.24 |
| factory/box-large.glb | 1 | box, large | 1.10 x 0.55 x 1.00 |
| platformer/crate-strong.glb | 1 | crate, strong | 0.60 x 0.60 x 0.60 |
| factory/screen-panel-small.glb | 1 | screen, panel small | 0.60 x 0.99 x 0.66 |
| survival/metal-panel.glb | 1.2 | metal, panel | 0.50 x 0.50 x 0.05 |
| space/barrels.glb | 1.5 | barrel group | 0.55 x 0.25 x 0.50 |
| space/machine_barrel.glb | 1.5 | machine, barrel | 0.62 x 0.60 x 0.56 |
| space/machine_generator.glb | 2 | machine, generator | 0.95 x 0.40 x 0.55 |
| factory/pipe-large.glb | 2 | pipe, large | 1.00 x 1.00 x 1.00 |
| factory/pipe-large-valve.glb | 2 | pipe, large valve | 1.00 x 1.00 x 1.02 |
| industrial/solar-panel-landscape.glb | 2 | solar, panel landscape | 0.71 x 0.26 x 0.40 |
| factory/machine.glb | 2.5 | factory machine block | 1.20 x 1.30 x 1.50 |
| factory/robot-arm-a.glb | 2.5 | robot, arm (A) | 1.00 x 0.80 x 1.00 |
| space/machine_wireless.glb | 2.5 | machine, wireless | 0.75 x 0.60 x 0.50 |
| nature/rock_largeA.glb | 2.5 | rock, large (A) | 0.79 x 0.26 x 1.01 |
| space/satelliteDish.glb | 3 | satellite, dish | 0.69 x 0.62 x 0.57 |
| nature/rock_tallA.glb | 3.5 | rock, tall (A) | 0.98 x 1.00 x 0.68 |
| space/machine_generatorLarge.glb | 3.5 | machine, generator large | 1.00 x 0.68 x 1.30 |
| factory/hopper-high-round.glb | 3.5 | hopper, high round | 1.12 x 1.50 x 1.12 |
| industrial/detail-tank-large.glb | 5 | detail, tank large | 1.51 x 0.96 x 1.65 |
| industrial/shipping-container-a.glb | 6 | shipping, container (A) | 1.38 x 1.29 x 3.05 * |
| factory/crane.glb | 8 | gantry crane | 1.93 x 3.00 x 3.68 |
| space/satelliteDish_large.glb | 8 | satellite, dish large | 0.85 x 0.81 x 0.74 |
| industrial/water-tower.glb | 12 | water, tower | 0.91 x 2.28 x 0.89 * |
| nature/cliff_large_rock.glb | 14 | cliff, large rock | 1.00 x 1.00 x 0.42 |
| industrial/building-a.glb | 14 | building prop (A) | 2.08 x 1.47 x 1.24 |
| industrial/chimney-large.glb | 18 | chimney, large | 1.08 x 1.70 x 1.08 |
| industrial/windmill.glb | 20 | windmill building | 0.60 x 2.17 x 1.13 |

### Volcano / ashlands

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| platformer/jewel.glb | 0.1 | cut gem | 0.33 x 0.37 x 0.29 |
| nature/stone_smallA.glb | 0.15 | stone, small (A) | 0.36 x 0.19 x 0.36 |
| space/rocks_smallA.glb | 0.3 | rocks, small (A) | 0.94 x 0.10 x 0.87 |
| platformer/bomb.glb | 0.3 | round bomb | 0.49 x 0.54 x 0.49 |
| graveyard/debris.glb | 0.5 | stone rubble pile | 0.54 x 0.16 x 0.55 |
| nature/stump_old.glb | 0.6 | stump, old | 0.36 x 0.27 x 0.37 |
| graveyard/fireBasket.glb | 0.8 | fire, basket | 0.27 x 0.12 x 0.27 |
| space/rock.glb | 1 | single rock | 0.80 x 0.30 x 0.85 |
| graveyard/trunk.glb | 1 | dead tree trunk | 0.54 x 0.45 x 0.55 |
| survival/campfire-pit.glb | 1 | campfire, pit | 0.28 x 0.09 x 0.27 |
| castle/tree-trunk.glb | 1.2 | tree, trunk | 0.40 x 0.38 x 0.34 |
| space/rock_crystals.glb | 1.2 | rock, crystals | 0.85 x 0.34 x 0.80 |
| nature/stump_oldTall.glb | 1.2 | stump, old tall | 0.36 x 0.67 x 0.37 |
| space/meteor.glb | 1.5 | round meteor | 0.87 x 0.73 x 0.75 |
| space/bones.glb | 1.5 | large rib bones | 0.86 x 0.44 x 0.58 |
| graveyard/trunk-long.glb | 2 | trunk, long | 0.54 x 1.00 x 0.54 |
| space/meteor_detailed.glb | 2 | meteor, detailed | 0.87 x 0.73 x 0.82 |
| space/meteor_half.glb | 2 | meteor, half | 0.87 x 0.37 x 0.75 |
| nature/stone_largeA.glb | 2.5 | stone, large (A) | 0.79 x 0.26 x 1.01 |
| space/rock_crystalsLargeA.glb | 3 | rock, crystals large (A) | 0.83 x 0.54 x 0.92 |
| nature/stone_tallA.glb | 3.5 | stone, tall (A) | 0.98 x 1.00 x 0.68 |
| space/rock_crystalsLargeB.glb | 4 | rock, crystals large (B) | 0.94 x 0.55 x 0.93 |
| space/rock_largeA.glb | 4 | rock, large (A) | 0.92 x 0.50 x 0.83 |
| space/crater.glb | 4 | small ground crater | 0.71 x 0.12 x 0.83 |
| graveyard/pine-crooked.glb | 5 | pine, crooked | 1.18 x 2.11 x 1.33 |
| space/rock_largeB.glb | 5 | rock, large (B) | 0.93 x 0.50 x 0.94 |
| nature/stone_tallG.glb | 6 | stone, tall (G) | 0.42 x 0.78 x 0.49 |
| nature/cliff_cave_stone.glb | 8 | cliff, cave stone | 1.00 x 1.00 x 0.17 |
| space/craterLarge.glb | 10 | crater, large | 0.89 x 0.12 x 0.89 |
| nature/cliff_large_stone.glb | 16 | cliff, large stone | 1.00 x 1.00 x 0.42 |

### Desert canyon + temple ruins

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| graveyard/detail-chalice.glb | 0.1 | detail, chalice | 0.16 x 0.25 x 0.16 |
| graveyard/detail-bowl.glb | 0.15 | detail, bowl | 0.20 x 0.13 x 0.20 |
| food/fish-bones.glb | 0.2 | fish, bones | 0.31 x 0.07 x 0.64 |
| nature/pot_small.glb | 0.3 | pot, small | 0.32 x 0.27 x 0.28 |
| arena/trophy.glb | 0.3 | gold trophy cup | 0.57 x 0.48 x 0.45 |
| arena/bricks.glb | 0.4 | loose brick pile | 0.77 x 0.41 x 0.85 |
| graveyard/urn-round.glb | 0.5 | urn, round | 0.26 x 0.28 x 0.26 |
| nature/pot_large.glb | 0.6 | pot, large | 0.56 x 0.20 x 0.49 |
| nature/cactus_short.glb | 0.8 | cactus, short | 0.34 x 0.53 x 0.30 |
| nature/statue_block.glb | 1 | statue, block | 0.40 x 0.40 x 0.40 |
| survival/rock-sand-a.glb | 1 | rock, sand (A) | 0.56 x 0.39 x 0.48 |
| graveyard/altar-stone.glb | 1.5 | altar, stone | 1.04 x 0.49 x 0.65 |
| survival/bedroll.glb | 1.8 | unrolled bedroll | 0.31 x 0.13 x 0.61 |
| space/bones.glb | 2 | large rib bones | 0.86 x 0.44 x 0.58 |
| pirate/rocks-sand-a.glb | 2 | rocks, sand (A) | 5.11 x 3.21 x 4.39 |
| nature/statue_columnDamaged.glb | 2 | statue, column damaged | 0.30 x 0.70 x 0.30 |
| nature/statue_ring.glb | 2 | statue, ring | 0.60 x 0.80 x 0.40 |
| survival/tent.glb | 2 | small camping tent | 0.56 x 0.49 x 0.56 |
| nature/cactus_tall.glb | 2.5 | cactus, tall | 0.40 x 0.75 x 0.34 |
| nature/statue_head.glb | 2.5 | statue, head | 0.73 x 1.00 x 0.55 |
| survival/tent-canvas.glb | 2.5 | tent, canvas | 0.56 x 0.49 x 0.56 |
| arena/column-damaged.glb | 3 | column, damaged | 0.60 x 0.72 x 0.60 |
| arena/statue.glb | 3 | arena statue | 0.70 x 1.34 x 0.70 |
| nature/statue_column.glb | 3 | statue, column | 0.30 x 1.00 x 0.30 |
| graveyard/pillar-large.glb | 3 | pillar, large | 0.22 x 1.13 x 0.22 |
| nature/tent_detailedOpen.glb | 3 | tent, detailed open | 0.88 x 0.56 x 0.67 |
| arena/column.glb | 4 | stone column | 0.60 x 1.00 x 0.60 |
| arena/wall-gate.glb | 5 | wall, gate | 1.00 x 1.00 x 0.60 |
| nature/statue_obelisk.glb | 6 | statue, obelisk | 0.31 x 0.88 x 0.31 |
| nature/tree_palm.glb | 6 | tree, palm | 0.94 x 1.51 x 1.01 |
| nature/rock_tallE.glb | 6 | rock, tall (E) | 0.46 x 0.44 x 0.53 |
| graveyard/crypt-large.glb | 8 | crypt, large | 1.85 x 1.00 x 2.40 |
| nature/tree_palmDetailedTall.glb | 8 | tree, palm detailed tall | 1.03 x 1.25 x 1.03 * |
| nature/cliff_large_rock.glb | 15 | cliff, large rock | 1.00 x 1.00 x 0.42 |

### Beach / tide pools / sea

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| food/mussel.glb | 0.06 | mussel, food item | 0.09 x 0.04 x 0.15 |
| food/mussel-open.glb | 0.07 | mussel, open | 0.10 x 0.11 x 0.15 * |
| pirate/cannon-ball.glb | 0.15 | cannon, ball | 0.64 x 0.67 x 0.55 |
| food/coconut.glb | 0.15 | coconut, food item | 0.17 x 0.14 x 0.17 * |
| pirate/bottle.glb | 0.25 | small bottle | 0.36 x 0.89 x 0.36 |
| food/fish.glb | 0.3 | whole fish | 0.20 x 0.32 x 0.62 |
| survival/bucket.glb | 0.3 | wooden bucket | 0.14 x 0.19 x 0.14 |
| pirate/bottle-large.glb | 0.4 | bottle, large | 0.47 x 0.89 x 0.47 |
| pirate/grass-plant.glb | 0.5 | grass, plant | 1.11 x 0.52 x 1.24 |
| survival/fish-large.glb | 0.6 | fish, large | 0.31 x 0.16 x 0.10 |
| pirate/crate.glb | 0.8 | wooden crate | 1.08 x 0.77 x 1.31 |
| pirate/barrel.glb | 0.9 | wooden barrel | 1.34 x 1.23 x 1.34 |
| pirate/chest.glb | 0.9 | treasure chest | 1.27 x 0.77 x 1.78 |
| pirate/tool-shovel.glb | 1 | tool, shovel | 0.66 x 2.35 x 0.28 |
| survival/campfire-fishing-stand.glb | 1.2 | campfire, fishing stand | 0.40 x 0.28 x 0.25 |
| pirate/tool-paddle.glb | 1.4 | tool, paddle | 0.66 x 2.35 x 0.21 |
| pirate/rocks-a.glb | 1.5 | rocks prop (A) | 5.11 x 2.90 x 4.39 |
| pirate/cannon.glb | 1.5 | fixed ship cannon | 1.40 x 1.05 x 2.39 |
| pirate/rocks-sand-b.glb | 2 | rocks, sand (B) | 4.38 x 3.71 x 4.71 |
| pirate/boat-row-small.glb | 2.5 | boat, row small | 2.75 x 0.79 x 2.37 |
| pirate/flag.glb | 2.5 | flag on pole | 1.34 x 2.10 x 0.40 |
| pirate/platform-planks.glb | 3 | platform, planks | 1.89 x 0.43 x 2.70 |
| pirate/structure-platform-dock-small.glb | 3 | structure, platform dock small | 1.90 x 1.31 x 2.51 |
| nature/canoe.glb | 3.5 | wooden canoe | 0.30 x 0.18 x 1.15 |
| pirate/boat-row-large.glb | 4 | boat, row large | 2.75 x 0.79 x 2.85 |
| pirate/structure.glb | 4 | open shelter frame | 2.50 x 2.20 x 2.50 |
| pirate/flag-pirate-high.glb | 4 | flag, pirate high | 1.34 x 3.60 x 0.40 |
| pirate/structure-platform-dock.glb | 5 | structure, platform dock | 2.50 x 1.31 x 2.51 |
| pirate/palm-straight.glb | 6 | palm, straight | 2.49 x 4.21 x 2.49 |
| pirate/palm-detailed-bend.glb | 7 | palm, detailed bend | 2.88 x 4.25 x 3.22 |
| pirate/tower-watch.glb | 8 | tower, watch | 3.05 x 2.79 x 3.05 |
| pirate/ship-small.glb | 9 | ship, small | 4.80 x 9.96 x 8.80 |
| pirate/ship-medium.glb | 14 | ship, medium | 4.80 x 9.96 x 10.60 |
| pirate/tower-complete-large.glb | 15 | tower, complete large | 3.63 x 10.22 x 3.63 |
| pirate/ship-wreck.glb | 16 | ship, wreck | 4.80 x 10.75 x 10.60 |
| pirate/ship-large.glb | 20 | ship, large | 4.80 x 9.96 x 13.10 |

### Marsh + graveyard

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| graveyard/detail-chalice.glb | 0.12 | detail, chalice | 0.16 x 0.25 x 0.16 |
| graveyard/candle.glb | 0.15 | single candle | 0.14 x 0.20 x 0.14 |
| nature/mushroom_tanGroup.glb | 0.2 | mushroom, tan group | 0.27 x 0.25 x 0.25 |
| graveyard/candle-multiple.glb | 0.2 | candle, multiple | 0.26 x 0.20 x 0.27 |
| graveyard/pumpkin.glb | 0.35 | whole pumpkin | 0.38 x 0.32 x 0.38 |
| graveyard/pumpkin-carved.glb | 0.4 | pumpkin, carved | 0.38 x 0.32 x 0.38 |
| graveyard/lantern-candle.glb | 0.4 | lantern, candle | 0.24 x 0.39 x 0.24 |
| graveyard/urn-round.glb | 0.4 | urn, round | 0.26 x 0.28 x 0.26 |
| graveyard/pumpkin-tall-carved.glb | 0.5 | pumpkin, tall carved | 0.33 x 0.36 x 0.33 |
| nature/lily_large.glb | 0.6 | lily, large | 0.27 x 0.10 x 0.31 |
| graveyard/gravestone-broken.glb | 0.6 | gravestone, broken | 0.51 x 0.34 x 0.39 |
| graveyard/debris-wood.glb | 0.6 | debris, wood | 0.46 x 0.10 x 0.50 |
| graveyard/gravestone-round.glb | 0.9 | gravestone, round | 0.45 x 0.57 x 0.25 |
| graveyard/gravestone-cross.glb | 1.1 | gravestone, cross | 0.45 x 0.92 x 0.33 |
| graveyard/shovel-dirt.glb | 1.1 | shovel, dirt | 0.62 x 0.66 x 0.52 |
| graveyard/cross-wood.glb | 1.2 | cross, wood | 0.43 x 1.04 x 0.43 |
| graveyard/gravestone-wide.glb | 1.2 | gravestone, wide | 0.85 x 0.57 x 0.30 |
| nature/hanging_moss.glb | 1.5 | hanging, moss | 0.16 x 0.48 x 0.04 |
| graveyard/bench-damaged.glb | 1.6 | bench, damaged | 0.91 x 0.52 x 0.46 |
| graveyard/gravestone-cross-large.glb | 1.8 | gravestone, cross large | 0.45 x 0.94 x 0.33 |
| graveyard/coffin.glb | 2 | closed wooden coffin | 0.57 x 0.20 x 0.84 |
| graveyard/coffin-old.glb | 2 | coffin, old | 0.57 x 0.20 x 0.84 |
| graveyard/iron-fence.glb | 2 | iron, fence | 1.00 x 0.88 x 0.11 |
| graveyard/iron-fence-damaged.glb | 2 | iron, fence damaged | 1.00 x 0.88 x 0.33 |
| graveyard/trunk-long.glb | 2 | trunk, long | 0.54 x 1.00 x 0.54 |
| graveyard/grave-border.glb | 2.2 | grave, border | 0.76 x 0.11 x 1.39 |
| graveyard/cross-column.glb | 2.5 | cross, column | 0.45 x 1.45 x 0.45 |
| graveyard/iron-fence-border-gate.glb | 2.5 | iron, fence border gate | 1.00 x 0.76 x 0.22 |
| graveyard/lightpostSingle.glb | 3 | lamp post, single | 0.15 x 1.32 x 0.38 |
| graveyard/crypt-small.glb | 3.5 | crypt, small | 1.35 x 1.00 x 1.40 |
| graveyard/pillarObelisk.glb | 4 | pillar, obelisk | 0.21 x 1.05 x 0.21 |
| graveyard/crypt-a.glb | 4 | crypt prop (A) | 0.62 x 0.52 x 1.12 |
| graveyard/crypt.glb | 5 | stone crypt building | 0.72 x 0.73 x 1.12 |
| graveyard/pine-crooked.glb | 6 | pine, crooked | 1.18 x 2.11 x 1.33 |
| graveyard/pine.glb | 7 | graveyard pine tree | 1.18 x 2.30 x 1.33 |
| graveyard/crypt-large.glb | 8 | crypt, large | 1.85 x 1.00 x 2.40 |

### Forest + river gorge

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| nature/mushroom_red.glb | 0.08 | mushroom, red | 0.17 x 0.20 x 0.20 |
| nature/mushroom_tanGroup.glb | 0.15 | mushroom, tan group | 0.27 x 0.25 x 0.25 |
| nature/flower_redC.glb | 0.2 | flower, red (C) | 0.18 x 0.23 x 0.18 |
| platformer/mushrooms.glb | 0.3 | mushroom cluster | 0.52 x 0.29 x 0.51 |
| nature/grass_large.glb | 0.4 | grass, large | 0.41 x 0.25 x 0.41 |
| nature/rock_smallA.glb | 0.4 | rock, small (A) | 0.36 x 0.19 x 0.36 |
| nature/plant_bushSmall.glb | 0.5 | plant, bush small | 0.38 x 0.21 x 0.34 |
| survival/resource-wood.glb | 0.5 | resource, wood | 0.20 x 0.06 x 0.09 |
| nature/stump_round.glb | 0.6 | stump, round | 0.32 x 0.21 x 0.37 |
| survival/tool-axe.glb | 0.7 | tool, axe | 0.11 x 0.26 x 0.03 |
| nature/plant_bush.glb | 0.9 | plant, bush | 0.40 x 0.24 x 0.40 |
| nature/campfire_stones.glb | 1 | campfire, stones | 0.54 x 0.08 x 0.52 |
| nature/sign.glb | 1.2 | wooden sign | 0.30 x 0.41 x 0.07 |
| nature/stump_oldTall.glb | 1.2 | stump, old tall | 0.36 x 0.67 x 0.37 |
| nature/log.glb | 1.5 | fallen log | 0.23 x 0.17 x 0.71 |
| nature/plant_bushLarge.glb | 1.5 | plant, bush large | 0.37 x 0.24 x 0.34 |
| survival/signpost.glb | 2 | double signpost | 0.21 x 0.46 x 0.04 |
| nature/tent_smallOpen.glb | 2 | tent, small open | 0.55 x 0.56 x 0.67 |
| nature/log_large.glb | 2.5 | log, large | 1.00 x 0.42 x 0.55 |
| nature/log_stackLarge.glb | 2.5 | log, stack large | 0.63 x 0.35 x 0.71 |
| nature/tree_small.glb | 2.5 | tree, small | 0.35 x 1.11 x 0.41 |
| nature/rock_largeC.glb | 2.5 | rock, large (C) | 1.06 x 0.32 x 1.02 |
| nature/tree_pineSmallA.glb | 3 | tree, pine small (A) | 0.50 x 0.97 x 0.50 |
| nature/tent_detailedClosed.glb | 3 | tent, detailed closed | 0.88 x 0.56 x 0.64 |
| nature/canoe.glb | 3.5 | wooden canoe | 0.30 x 0.18 x 1.15 |
| survival/structure.glb | 3.5 | open shelter frame | 0.50 x 0.50 x 0.50 |
| nature/bridge_wood.glb | 4 | bridge, wood | 1.04 x 0.40 x 1.04 |
| nature/rock_tallD.glb | 4 | rock, tall (D) | 0.44 x 0.77 x 0.46 |
| nature/tree_default.glb | 5 | tree, default | 0.76 x 1.71 x 0.65 |
| nature/bridge_stone.glb | 5 | bridge, stone | 1.04 x 0.40 x 1.04 |
| nature/tree_pineRoundC.glb | 6 | tree, pine round (C) | 0.48 x 1.25 x 0.56 |
| nature/tree_oak.glb | 7 | tree, oak | 0.64 x 1.23 x 0.74 |
| castle/tree-large.glb | 8 | tree, large | 0.89 x 1.85 x 0.89 |
| nature/tree_tall.glb | 9 | tree, tall | 0.40 x 1.69 x 0.46 |
| nature/cliff_waterfall_rock.glb | 10 | cliff, waterfall rock | 1.00 x 1.00 x 0.17 |
| nature/tree_pineTallA_detailed.glb | 12 | tree, pine tall A detailed | 0.39 x 1.53 x 0.39 |
| nature/cliff_large_rock.glb | 14 | cliff, large rock | 1.00 x 1.00 x 0.42 |

### Farm + prairie

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| food/egg.glb | 0.05 | whole egg | 0.12 x 0.17 x 0.13 |
| food/apple.glb | 0.08 | whole apple | 0.20 x 0.19 x 0.20 |
| nature/crop_carrot.glb | 0.15 | crop, carrot | 0.34 x 0.62 x 0.34 |
| food/corn.glb | 0.2 | corn, food item | 0.34 x 0.32 x 0.30 |
| nature/crop_turnip.glb | 0.2 | crop, turnip | 0.34 x 0.66 x 0.34 |
| food/cabbage.glb | 0.25 | cabbage, food item | 0.38 x 0.31 x 0.40 |
| nature/flower_yellowA.glb | 0.25 | flower, yellow (A) | 0.16 x 0.19 x 0.18 |
| nature/grass.glb | 0.3 | grass tuft | 0.38 x 0.25 x 0.39 |
| survival/bucket.glb | 0.35 | wooden bucket | 0.14 x 0.19 x 0.14 |
| nature/crop_melon.glb | 0.35 | crop, melon | 0.42 x 0.35 x 0.36 |
| nature/crop_pumpkin.glb | 0.4 | crop, pumpkin | 0.44 x 0.33 x 0.45 |
| nature/crops_wheatStageA.glb | 0.5 | crop, wheat stage (A) | 0.54 x 0.34 x 0.45 |
| survival/box-large.glb | 0.8 | box, large | 0.25 x 0.25 x 0.50 |
| survival/barrel-open.glb | 0.9 | barrel, open | 0.24 x 0.34 x 0.24 |
| nature/crops_wheatStageB.glb | 1 | crop, wheat stage (B) | 0.54 x 0.54 x 0.45 |
| town/wheel.glb | 1 | cart wheel | 0.21 x 0.52 x 0.51 |
| survival/tool-hoe.glb | 1.2 | tool, hoe | 0.09 x 0.24 x 0.07 |
| graveyard/hay-bale.glb | 1.2 | hay, bale | 0.61 x 0.35 x 0.40 |
| graveyard/hay-bale-bundled.glb | 1.2 | hay, bale bundled | 0.61 x 0.38 x 0.43 |
| nature/fence_simple.glb | 1.5 | fence, simple | 1.00 x 0.34 x 0.07 |
| nature/fence_planks.glb | 1.5 | fence, planks | 1.00 x 0.34 x 0.10 |
| nature/fence_gate.glb | 1.5 | fence, gate | 1.00 x 0.52 x 0.50 * |
| survival/workbench.glb | 1.5 | wooden workbench | 0.30 x 0.24 x 0.30 |
| survival/signpost-single.glb | 1.8 | signpost, single | 0.21 x 0.46 x 0.04 |
| nature/crops_cornStageD.glb | 2 | crop, corn stage (D) | 0.43 x 1.25 x 0.35 |
| town/hedge.glb | 2 | hedge section | 0.25 x 0.25 x 1.00 |
| survival/fence-fortified.glb | 2 | fence, fortified | 0.50 x 0.52 x 0.05 |
| town/cart.glb | 2.5 | hand cart | 0.65 x 0.79 x 1.44 |
| town/cartHigh.glb | 2.5 | cart, high | 0.65 x 1.11 x 1.44 * |
| nature/crops_bambooStageB.glb | 3 | crop, bamboo stage (B) | 0.34 x 0.89 x 0.31 |
| nature/tree_fat.glb | 6 | tree, fat | 0.76 x 1.15 x 0.65 |
| town/watermill.glb | 8 | watermill building | 0.73 x 1.73 x 2.00 |
| town/watermill-wide.glb | 10 | watermill, wide | 1.05 x 1.80 x 1.80 |
| hex/unit_mill.glb | 10 | unit, mill | 0.38 x 0.93 x 0.51 |
| town/windmill.glb | 12 | windmill building | 0.47 x 3.07 x 3.07 |

### Central market town / festival green

| File | Suggested size (m) | What it is | Model bbox |
|---|---|---|---|
| food/cherries.glb | 0.05 | cherries, food item | 0.09 x 0.17 x 0.16 |
| platformer/coin-gold.glb | 0.05 | coin, gold | 0.40 x 0.40 x 0.17 |
| food/apple.glb | 0.08 | whole apple | 0.20 x 0.19 x 0.20 |
| food/bread.glb | 0.25 | bread slice | 0.44 x 0.04 x 0.37 |
| food/cheese.glb | 0.3 | cheese, food item | 0.34 x 0.22 x 0.17 |
| food/watermelon.glb | 0.4 | watermelon, food item | 0.33 x 0.69 x 0.23 * |
| shop/shopping-basket.glb | 0.4 | shopping, basket | 0.35 x 0.25 x 0.35 |
| arena/trophy.glb | 0.4 | gold trophy cup | 0.57 x 0.48 x 0.45 |
| town/stallStool.glb | 0.5 | stall, stool | 0.26 x 0.23 x 0.26 |
| food/bag.glb | 0.5 | paper grocery bag | 0.31 x 0.84 x 0.58 * |
| holiday/lantern-hanging.glb | 0.5 | lantern, hanging | 0.42 x 0.67 x 0.42 |
| food/barrel.glb | 0.9 | wooden food barrel | 0.76 x 0.68 x 0.68 |
| shop/hand-truck.glb | 1.2 | hand, truck | 0.66 x 0.55 x 0.55 * |
| shop/display-flowers.glb | 1.2 | display, flowers | 1.33 x 1.15 x 1.32 * |
| shop/display-fruit.glb | 1.5 | display, fruit | 0.60 x 0.52 x 0.60 |
| shop/display-bread.glb | 1.5 | display, bread | 0.70 x 0.50 x 0.60 * |
| town/stallBench.glb | 1.5 | stall, bench | 0.26 x 0.23 x 0.94 |
| furniture/bench.glb | 1.6 | park bench | 0.40 x 0.47 x 0.20 |
| holiday/lights-colored.glb | 2 | lights, colored | 1.01 x 0.32 x 0.06 |
| town/hedge.glb | 2 | hedge section | 0.25 x 0.25 x 1.00 |
| town/fountain-center.glb | 2 | fountain, center | 1.00 x 0.00 x 1.00 |
| town/cart.glb | 2.5 | hand cart | 0.65 x 0.79 x 1.44 |
| town/bannerRed.glb | 2.5 | banner, red | 0.05 x 0.84 x 0.50 |
| town/bannerGreen.glb | 2.5 | banner, green | 0.05 x 0.84 x 0.50 |
| town/lantern.glb | 2.5 | lantern light | 0.22 x 1.56 x 0.22 |
| town/stall.glb | 3 | market stall | 0.65 x 0.37 x 1.00 |
| town/stallRed.glb | 3 | stall, red | 1.00 x 1.24 x 1.00 |
| town/stallGreen.glb | 3 | stall, green | 1.00 x 1.24 x 1.00 |
| town/pillar-stone.glb | 3 | pillar, stone | 0.16 x 1.00 x 0.16 |
| arena/banner.glb | 3 | hanging arena banner | 0.60 x 1.02 x 0.23 |
| castle/flag-pennant.glb | 3 | flag, pennant | 0.11 x 0.87 x 0.57 |
| graveyard/lightpostDouble.glb | 3.2 | lamp post, double | 0.15 x 1.32 x 0.62 |
| town/fountainRound.glb | 4 | fountain, round | 2.00 x 0.28 x 2.00 |
| castle/flag-banner-long.glb | 4 | flag, banner long | 0.04 x 2.17 x 0.63 |
| town/fountain-square-detail.glb | 5 | fountain, square detail | 2.00 x 0.48 x 2.00 |
| town/tree.glb | 5 | simple tree | 1.02 x 2.41 x 1.02 |
| castle/wall-narrow-gate.glb | 6 | wall, narrow gate | 0.63 x 1.31 x 1.00 |
| town/treeHigh.glb | 8 | tree, high | 1.02 x 2.97 x 1.02 |
| hex/unit_house.glb | 8 | unit, house | 0.36 x 0.38 x 0.38 |
| hex/unit_houseLarge.glb | 12 | unit, house large | 0.36 x 0.38 x 0.61 |
| castle/tower-square.glb | 12 | tower, square | 1.00 x 1.31 x 1.00 |
| town/windmill.glb | 14 | windmill building | 0.47 x 3.07 x 3.07 |

### Gaps (nothing suitable in these packs; build from primitives in code)

See the notes at the end of `CREDITS-additions.md` and the report: igloo and ice blocks, electricity pylons, lava and dark volcanic rock (tint the grey `stone_*` and `space/rock*` models), dead leafless trees (only trunks and crooked pines), beach umbrellas, sea shells (only mussels), lighthouse (use a pirate or castle tower), barn, scarecrow, animal pens (assemble from fences), whole houses and cabins (only the tiny `hex/unit_house*` models and `survival/structure*` shelters).

## Full inventory by pack

### nature/ (233 files)

Nature Kit 2.1 - trees, rocks, crops, bridges, tents, statues. Self-contained GLBs.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| cactus_short.glb | 0.34 x 0.53 x 0.30 | - | cactus, short |
| cactus_tall.glb | 0.40 x 0.75 x 0.34 | - | cactus, tall |
| crop_carrot.glb | 0.34 x 0.62 x 0.34 | - | crop, carrot |
| crop_melon.glb | 0.42 x 0.35 x 0.36 | - | crop, melon |
| crop_pumpkin.glb | 0.44 x 0.33 x 0.45 | - | crop, pumpkin |
| crop_turnip.glb | 0.34 x 0.66 x 0.34 | - | crop, turnip |
| crops_bambooStageA.glb | 0.34 x 0.55 x 0.31 | - | crop, bamboo stage (A) |
| crops_bambooStageB.glb | 0.34 x 0.89 x 0.31 | - | crop, bamboo stage (B) |
| crops_cornStageA.glb | 0.30 x 0.50 x 0.30 | - | crop, corn stage (A) |
| crops_cornStageB.glb | 0.30 x 1.00 x 0.30 | - | crop, corn stage (B) |
| crops_cornStageC.glb | 0.30 x 1.25 x 0.30 | - | crop, corn stage (C) |
| crops_cornStageD.glb | 0.43 x 1.25 x 0.35 | - | crop, corn stage (D) |
| crops_leafsStageA.glb | 0.39 x 0.43 x 0.39 | - | crop, leafs stage (A) |
| crops_leafsStageB.glb | 0.39 x 0.68 x 0.39 | - | crop, leafs stage (B) |
| crops_wheatStageA.glb | 0.54 x 0.34 x 0.45 | - | crop, wheat stage (A) |
| crops_wheatStageB.glb | 0.54 x 0.54 x 0.45 | - | crop, wheat stage (B) |
| flower_purpleA.glb | 0.16 x 0.24 x 0.18 | - | flower, purple (A) |
| flower_purpleB.glb | 0.21 x 0.21 x 0.24 | - | flower, purple (B) |
| flower_purpleC.glb | 0.18 x 0.18 x 0.18 | - | flower, purple (C) |
| flower_redA.glb | 0.16 x 0.29 x 0.18 | - | flower, red (A) |
| flower_redB.glb | 0.21 x 0.26 x 0.24 | - | flower, red (B) |
| flower_redC.glb | 0.18 x 0.23 x 0.18 | - | flower, red (C) |
| flower_yellowA.glb | 0.16 x 0.19 x 0.18 | - | flower, yellow (A) |
| flower_yellowB.glb | 0.21 x 0.16 x 0.24 | - | flower, yellow (B) |
| flower_yellowC.glb | 0.18 x 0.13 x 0.18 | - | flower, yellow (C) |
| grass.glb | 0.38 x 0.25 x 0.39 | - | grass tuft |
| grass_large.glb | 0.41 x 0.25 x 0.41 | - | grass, large |
| grass_leafs.glb | 0.23 x 0.14 x 0.26 | - | grass, leafs |
| grass_leafsLarge.glb | 0.48 x 0.14 x 0.49 | - | grass, leafs large |
| hanging_moss.glb | 0.16 x 0.48 x 0.04 | - | hanging, moss |
| lily_large.glb | 0.27 x 0.10 x 0.31 | - | lily, large |
| lily_small.glb | 0.19 x 0.04 x 0.22 | - | lily, small |
| log.glb | 0.23 x 0.17 x 0.71 | - | fallen log |
| log_large.glb | 1.00 x 0.42 x 0.55 | - | log, large |
| log_stack.glb | 0.42 x 0.35 x 0.71 | - | log, stack |
| log_stackLarge.glb | 0.63 x 0.35 x 0.71 | - | log, stack large |
| mushroom_red.glb | 0.17 x 0.20 x 0.20 | - | mushroom, red |
| mushroom_redGroup.glb | 0.27 x 0.25 x 0.25 | - | mushroom, red group |
| mushroom_redTall.glb | 0.12 x 0.25 x 0.14 | - | mushroom, red tall |
| mushroom_tan.glb | 0.19 x 0.15 x 0.22 | - | mushroom, tan |
| mushroom_tanGroup.glb | 0.27 x 0.25 x 0.25 | - | mushroom, tan group |
| mushroom_tanTall.glb | 0.12 x 0.25 x 0.14 | - | mushroom, tan tall |
| plant_bush.glb | 0.40 x 0.24 x 0.40 | - | plant, bush |
| plant_bushDetailed.glb | 0.60 x 0.36 x 0.60 | - | plant, bush detailed |
| plant_bushLarge.glb | 0.37 x 0.24 x 0.34 | - | plant, bush large |
| plant_bushLargeTriangle.glb | 0.41 x 0.17 x 0.47 | - | plant, bush large triangle |
| plant_bushSmall.glb | 0.38 x 0.21 x 0.34 | - | plant, bush small |
| plant_bushTriangle.glb | 0.36 x 0.30 x 0.41 | - | plant, bush triangle |
| plant_flatShort.glb | 0.28 x 0.23 x 0.28 | - | plant, flat short |
| plant_flatTall.glb | 0.27 x 0.28 x 0.27 | - | plant, flat tall |
| stump_old.glb | 0.36 x 0.27 x 0.37 | - | stump, old |
| stump_oldTall.glb | 0.36 x 0.67 x 0.37 | - | stump, old tall |
| stump_round.glb | 0.32 x 0.21 x 0.37 | - | stump, round |
| stump_roundDetailed.glb | 0.36 x 0.21 x 0.37 | - | stump, round detailed |
| stump_square.glb | 0.36 x 0.30 x 0.30 | - | stump, square |
| stump_squareDetailed.glb | 0.44 x 0.20 x 0.44 | - | stump, square detailed |
| stump_squareDetailedWide.glb | 0.64 x 0.20 x 0.64 | - | stump, square detailed wide |
| tree_blocks.glb | 0.60 x 1.19 x 0.60 | - | tree, blocks |
| tree_blocks_dark.glb | 0.60 x 1.19 x 0.60 | - | tree, blocks dark |
| tree_blocks_fall.glb | 0.60 x 1.19 x 0.60 | - | tree, blocks fall |
| tree_cone.glb | 0.53 x 1.43 x 0.53 | - | tree, cone |
| tree_cone_dark.glb | 0.53 x 1.43 x 0.53 | - | tree, cone dark |
| tree_cone_fall.glb | 0.53 x 1.43 x 0.53 | - | tree, cone fall |
| tree_default.glb | 0.76 x 1.71 x 0.65 | - | tree, default |
| tree_default_dark.glb | 0.76 x 1.71 x 0.65 | - | tree, default dark |
| tree_default_fall.glb | 0.76 x 1.71 x 0.65 | - | tree, default fall |
| tree_detailed.glb | 0.85 x 1.33 x 0.76 | - | tree, detailed |
| tree_detailed_dark.glb | 0.85 x 1.33 x 0.76 | - | tree, detailed dark |
| tree_detailed_fall.glb | 0.85 x 1.33 x 0.76 | - | tree, detailed fall |
| tree_fat.glb | 0.76 x 1.15 x 0.65 | - | tree, fat |
| tree_fat_darkh.glb | 0.76 x 1.15 x 0.65 | - | tree, fat darkh |
| tree_fat_fall.glb | 0.76 x 1.15 x 0.65 | - | tree, fat fall |
| tree_oak.glb | 0.64 x 1.23 x 0.74 | - | tree, oak |
| tree_oak_dark.glb | 0.64 x 1.23 x 0.74 | - | tree, oak dark |
| tree_oak_fall.glb | 0.64 x 1.23 x 0.74 | - | tree, oak fall |
| tree_palm.glb | 0.94 x 1.51 x 1.01 | - | tree, palm |
| tree_palmBend.glb | 0.94 x 1.38 x 1.01 | - | tree, palm bend |
| tree_palmDetailedShort.glb | 1.03 x 0.95 x 1.03 * | - | tree, palm detailed short |
| tree_palmDetailedTall.glb | 1.03 x 1.25 x 1.03 * | - | tree, palm detailed tall |
| tree_palmShort.glb | 1.03 x 1.06 x 1.03 | - | tree, palm short |
| tree_palmTall.glb | 1.03 x 1.36 x 1.03 | - | tree, palm tall |
| tree_pineDefaultA.glb | 0.53 x 1.55 x 0.53 | - | tree, pine default (A) |
| tree_pineDefaultB.glb | 0.53 x 1.55 x 0.53 | - | tree, pine default (B) |
| tree_pineGroundA.glb | 0.48 x 0.91 x 0.56 | - | tree, pine ground (A) |
| tree_pineGroundB.glb | 0.48 x 1.04 x 0.56 | - | tree, pine ground (B) |
| tree_pineRoundA.glb | 0.62 x 1.37 x 0.71 | - | tree, pine round (A) |
| tree_pineRoundB.glb | 0.53 x 1.20 x 0.61 | - | tree, pine round (B) |
| tree_pineRoundC.glb | 0.48 x 1.25 x 0.56 | - | tree, pine round (C) |
| tree_pineRoundD.glb | 0.48 x 1.08 x 0.56 | - | tree, pine round (D) |
| tree_pineRoundE.glb | 0.53 x 1.25 x 0.53 | - | tree, pine round (E) |
| tree_pineRoundF.glb | 0.53 x 1.25 x 0.53 | - | tree, pine round (F) |
| tree_pineSmallA.glb | 0.50 x 0.97 x 0.50 | - | tree, pine small (A) |
| tree_pineSmallB.glb | 0.39 x 1.01 x 0.39 | - | tree, pine small (B) |
| tree_pineSmallC.glb | 0.39 x 1.12 x 0.39 | - | tree, pine small (C) |
| tree_pineSmallD.glb | 0.36 x 0.96 x 0.36 | - | tree, pine small (D) |
| tree_pineTallA.glb | 0.39 x 1.53 x 0.39 | - | tree, pine tall (A) |
| tree_pineTallA_detailed.glb | 0.39 x 1.53 x 0.39 | - | tree, pine tall A detailed |
| tree_pineTallB.glb | 0.39 x 1.94 x 0.39 | - | tree, pine tall (B) |
| tree_pineTallB_detailed.glb | 0.39 x 1.94 x 0.39 | - | tree, pine tall B detailed |
| tree_pineTallC.glb | 0.48 x 1.67 x 0.56 | - | tree, pine tall (C) |
| tree_pineTallC_detailed.glb | 0.48 x 1.67 x 0.56 | - | tree, pine tall C detailed |
| tree_pineTallD.glb | 0.48 x 2.08 x 0.56 | - | tree, pine tall (D) |
| tree_pineTallD_detailed.glb | 0.48 x 2.08 x 0.56 | - | tree, pine tall D detailed |
| tree_plateau.glb | 0.61 x 1.25 x 0.66 | - | tree, plateau |
| tree_plateau_dark.glb | 0.61 x 1.25 x 0.66 | - | tree, plateau dark |
| tree_plateau_fall.glb | 0.61 x 1.25 x 0.66 | - | tree, plateau fall |
| tree_simple.glb | 0.35 x 1.52 x 0.41 | - | tree, simple |
| tree_simple_dark.glb | 0.35 x 1.52 x 0.41 | - | tree, simple dark |
| tree_simple_fall.glb | 0.35 x 1.52 x 0.41 | - | tree, simple fall |
| tree_small.glb | 0.35 x 1.11 x 0.41 | - | tree, small |
| tree_small_dark.glb | 0.35 x 1.11 x 0.41 | - | tree, small dark |
| tree_small_fall.glb | 0.35 x 1.11 x 0.41 | - | tree, small fall |
| tree_tall.glb | 0.40 x 1.69 x 0.46 | - | tree, tall |
| tree_tall_dark.glb | 0.40 x 1.69 x 0.46 | - | tree, tall dark |
| tree_tall_fall.glb | 0.40 x 1.69 x 0.46 | - | tree, tall fall |
| tree_thin.glb | 0.68 x 1.49 x 0.62 | - | tree, thin |
| tree_thin_dark.glb | 0.68 x 1.49 x 0.62 | - | tree, thin dark |
| tree_thin_fall.glb | 0.68 x 1.49 x 0.62 | - | tree, thin fall |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| cliff_cave_rock.glb | 1.00 x 1.00 x 0.17 | - | cliff, cave rock |
| cliff_cave_stone.glb | 1.00 x 1.00 x 0.17 | - | cliff, cave stone |
| cliff_large_rock.glb | 1.00 x 1.00 x 0.42 | - | cliff, large rock |
| cliff_large_stone.glb | 1.00 x 1.00 x 0.42 | - | cliff, large stone |
| cliff_rock.glb | 1.00 x 1.00 x 0.17 | - | cliff, rock |
| cliff_stone.glb | 1.00 x 1.00 x 0.17 | - | cliff, stone |
| cliff_waterfall_rock.glb | 1.00 x 1.00 x 0.17 | - | cliff, waterfall rock |
| cliff_waterfall_stone.glb | 1.00 x 1.00 x 0.17 | - | cliff, waterfall stone |
| rock_largeA.glb | 0.79 x 0.26 x 1.01 | - | rock, large (A) |
| rock_largeB.glb | 0.77 x 0.43 x 1.01 | - | rock, large (B) |
| rock_largeC.glb | 1.06 x 0.32 x 1.02 | - | rock, large (C) |
| rock_largeD.glb | 1.07 x 0.57 x 1.03 | - | rock, large (D) |
| rock_largeE.glb | 1.09 x 0.29 x 0.92 | - | rock, large (E) |
| rock_largeF.glb | 1.09 x 0.48 x 0.90 | - | rock, large (F) |
| rock_smallA.glb | 0.36 x 0.19 x 0.36 | - | rock, small (A) |
| rock_smallB.glb | 0.36 x 0.18 x 0.36 | - | rock, small (B) |
| rock_smallC.glb | 0.36 x 0.12 x 0.36 | - | rock, small (C) |
| rock_smallD.glb | 0.43 x 0.23 x 0.37 | - | rock, small (D) |
| rock_smallE.glb | 0.36 x 0.26 x 0.31 | - | rock, small (E) |
| rock_smallF.glb | 0.35 x 0.24 x 0.31 | - | rock, small (F) |
| rock_smallFlatA.glb | 0.50 x 0.07 x 0.43 | - | rock, small flat (A) |
| rock_smallFlatB.glb | 0.43 x 0.07 x 0.40 | - | rock, small flat (B) |
| rock_smallFlatC.glb | 0.47 x 0.07 x 0.36 | - | rock, small flat (C) |
| rock_smallG.glb | 0.59 x 0.24 x 0.69 | - | rock, small (G) |
| rock_smallH.glb | 0.46 x 0.41 x 0.46 | - | rock, small (H) |
| rock_smallI.glb | 0.36 x 0.28 x 0.41 | - | rock, small (I) |
| rock_smallTopA.glb | 0.49 x 0.22 x 0.49 | - | rock, small top (A) |
| rock_smallTopB.glb | 0.62 x 0.28 x 0.65 | - | rock, small top (B) |
| rock_tallA.glb | 0.98 x 1.00 x 0.68 | - | rock, tall (A) |
| rock_tallB.glb | 0.77 x 0.88 x 0.77 | - | rock, tall (B) |
| rock_tallC.glb | 0.46 x 0.78 x 0.44 | - | rock, tall (C) |
| rock_tallD.glb | 0.44 x 0.77 x 0.46 | - | rock, tall (D) |
| rock_tallE.glb | 0.46 x 0.44 x 0.53 | - | rock, tall (E) |
| rock_tallF.glb | 0.44 x 0.57 x 0.51 | - | rock, tall (F) |
| rock_tallG.glb | 0.42 x 0.78 x 0.49 | - | rock, tall (G) |
| rock_tallH.glb | 0.57 x 0.71 x 0.66 | - | rock, tall (H) |
| rock_tallI.glb | 0.46 x 0.81 x 0.46 | - | rock, tall (I) |
| rock_tallJ.glb | 0.49 x 0.62 x 0.54 | - | rock, tall (J) |
| stone_largeA.glb | 0.79 x 0.26 x 1.01 | - | stone, large (A) |
| stone_largeB.glb | 0.77 x 0.43 x 1.01 | - | stone, large (B) |
| stone_largeC.glb | 1.06 x 0.32 x 1.02 | - | stone, large (C) |
| stone_largeD.glb | 1.07 x 0.57 x 1.03 | - | stone, large (D) |
| stone_largeE.glb | 1.09 x 0.29 x 0.92 | - | stone, large (E) |
| stone_largeF.glb | 1.09 x 0.48 x 0.90 | - | stone, large (F) |
| stone_smallA.glb | 0.36 x 0.19 x 0.36 | - | stone, small (A) |
| stone_smallB.glb | 0.36 x 0.18 x 0.36 | - | stone, small (B) |
| stone_smallC.glb | 0.36 x 0.12 x 0.36 | - | stone, small (C) |
| stone_smallD.glb | 0.43 x 0.23 x 0.37 | - | stone, small (D) |
| stone_smallE.glb | 0.36 x 0.26 x 0.31 | - | stone, small (E) |
| stone_smallF.glb | 0.35 x 0.24 x 0.31 | - | stone, small (F) |
| stone_smallFlatA.glb | 0.50 x 0.07 x 0.43 | - | stone, small flat (A) |
| stone_smallFlatB.glb | 0.43 x 0.07 x 0.40 | - | stone, small flat (B) |
| stone_smallFlatC.glb | 0.47 x 0.07 x 0.36 | - | stone, small flat (C) |
| stone_smallG.glb | 0.59 x 0.24 x 0.69 | - | stone, small (G) |
| stone_smallH.glb | 0.46 x 0.41 x 0.46 | - | stone, small (H) |
| stone_smallI.glb | 0.36 x 0.28 x 0.41 | - | stone, small (I) |
| stone_smallTopA.glb | 0.49 x 0.22 x 0.49 | - | stone, small top (A) |
| stone_smallTopB.glb | 0.62 x 0.28 x 0.65 | - | stone, small top (B) |
| stone_tallA.glb | 0.98 x 1.00 x 0.68 | - | stone, tall (A) |
| stone_tallB.glb | 0.77 x 0.88 x 0.77 | - | stone, tall (B) |
| stone_tallC.glb | 0.46 x 0.78 x 0.44 | - | stone, tall (C) |
| stone_tallD.glb | 0.44 x 0.77 x 0.46 | - | stone, tall (D) |
| stone_tallE.glb | 0.46 x 0.44 x 0.53 | - | stone, tall (E) |
| stone_tallF.glb | 0.44 x 0.57 x 0.51 | - | stone, tall (F) |
| stone_tallG.glb | 0.42 x 0.78 x 0.49 | - | stone, tall (G) |
| stone_tallH.glb | 0.57 x 0.71 x 0.66 | - | stone, tall (H) |
| stone_tallI.glb | 0.46 x 0.81 x 0.46 | - | stone, tall (I) |
| stone_tallJ.glb | 0.49 x 0.62 x 0.54 | - | stone, tall (J) |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bridge_center_stone.glb | 1.00 x 0.30 x 1.00 | - | bridge, center stone |
| bridge_center_stoneRound.glb | 1.00 x 0.20 x 1.00 | - | bridge, center stone round |
| bridge_center_wood.glb | 1.00 x 0.30 x 1.00 | - | bridge, center wood |
| bridge_center_woodRound.glb | 1.00 x 0.20 x 1.00 | - | bridge, center wood round |
| bridge_side_stone.glb | 1.02 x 0.40 x 1.04 | - | bridge, side stone |
| bridge_side_stoneRound.glb | 1.02 x 0.45 x 1.04 | - | bridge, side stone round |
| bridge_side_wood.glb | 1.02 x 0.40 x 1.04 | - | bridge, side wood |
| bridge_side_woodRound.glb | 1.02 x 0.45 x 1.04 | - | bridge, side wood round |
| bridge_stone.glb | 1.04 x 0.40 x 1.04 | - | bridge, stone |
| bridge_stoneNarrow.glb | 1.04 x 0.35 x 0.84 | - | bridge, stone narrow |
| bridge_stoneRound.glb | 1.04 x 0.45 x 1.04 | - | bridge, stone round |
| bridge_stoneRoundNarrow.glb | 1.04 x 0.40 x 0.84 | - | bridge, stone round narrow |
| bridge_wood.glb | 1.04 x 0.40 x 1.04 | - | bridge, wood |
| bridge_woodNarrow.glb | 1.04 x 0.35 x 0.84 | - | bridge, wood narrow |
| bridge_woodRound.glb | 1.04 x 0.45 x 1.04 | - | bridge, wood round |
| bridge_woodRoundNarrow.glb | 1.04 x 0.40 x 0.84 | - | bridge, wood round narrow |
| tent_detailedClosed.glb | 0.88 x 0.56 x 0.64 | - | tent, detailed closed |
| tent_detailedOpen.glb | 0.88 x 0.56 x 0.67 | - | tent, detailed open |
| tent_smallClosed.glb | 0.55 x 0.56 x 0.64 | - | tent, small closed |
| tent_smallOpen.glb | 0.55 x 0.56 x 0.67 | - | tent, small open |

**Boats, ships, vehicles**

| File | W x H x D | ext | Description |
|---|---|---|---|
| canoe.glb | 0.30 x 0.18 x 1.15 | - | wooden canoe |
| canoe_paddle.glb | 0.08 x 0.04 x 0.59 | - | canoe, paddle |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| fence_bend.glb | 1.00 x 0.34 x 1.00 | - | fence, bend |
| fence_bendCenter.glb | 1.00 x 0.34 x 1.00 | - | fence, bend center |
| fence_corner.glb | 1.00 x 0.34 x 1.00 | - | fence, corner |
| fence_gate.glb | 1.00 x 0.52 x 0.50 * | - | fence, gate |
| fence_planks.glb | 1.00 x 0.34 x 0.10 | - | fence, planks |
| fence_planksDouble.glb | 1.00 x 0.34 x 0.06 | - | fence, planks double |
| fence_simple.glb | 1.00 x 0.34 x 0.07 | - | fence, simple |
| fence_simpleCenter.glb | 1.00 x 0.34 x 0.07 | - | fence, simple center |
| fence_simpleDiagonal.glb | 1.00 x 0.34 x 1.00 | - | fence, simple diagonal |
| fence_simpleDiagonalCenter.glb | 1.00 x 0.34 x 1.00 | - | fence, simple diagonal center |
| fence_simpleHigh.glb | 1.04 x 0.34 x 0.11 | - | fence, simple high |
| fence_simpleLow.glb | 1.04 x 0.20 x 0.11 | - | fence, simple low |
| statue_block.glb | 0.40 x 0.40 x 0.40 | - | statue, block |
| statue_column.glb | 0.30 x 1.00 x 0.30 | - | statue, column |
| statue_columnDamaged.glb | 0.30 x 0.70 x 0.30 | - | statue, column damaged |
| statue_head.glb | 0.73 x 1.00 x 0.55 | - | statue, head |
| statue_obelisk.glb | 0.31 x 0.88 x 0.31 | - | statue, obelisk |
| statue_ring.glb | 0.60 x 0.80 x 0.40 | - | statue, ring |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| pot_large.glb | 0.56 x 0.20 x 0.49 | - | pot, large |
| pot_small.glb | 0.32 x 0.27 x 0.28 | - | pot, small |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| campfire_bricks.glb | 0.47 x 0.07 x 0.47 | - | campfire, bricks |
| campfire_logs.glb | 0.29 x 0.06 x 0.29 | - | campfire, logs |
| campfire_planks.glb | 0.35 x 0.04 x 0.35 | - | campfire, planks |
| campfire_stones.glb | 0.54 x 0.08 x 0.52 | - | campfire, stones |
| sign.glb | 0.30 x 0.41 x 0.07 | - | wooden sign |

### holiday/ (59 files)

Holiday Kit 2.0 - snow props, presents, sleds, toy train. Needs Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| tree.glb | 1.19 x 1.92 x 1.19 | colormap | simple tree |
| tree-decorated.glb | 1.19 x 2.29 x 1.19 | colormap | tree, decorated |
| tree-decorated-snow.glb | 1.25 x 2.29 x 1.25 | colormap | tree, decorated snow |
| tree-snow-a.glb | 1.19 x 1.92 x 1.19 | colormap | tree, snow (A) |
| tree-snow-b.glb | 1.25 x 1.97 x 1.25 | colormap | tree, snow (B) |
| tree-snow-c.glb | 1.19 x 1.92 x 1.19 | colormap | tree, snow (C) |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| rocks-large.glb | 3.14 x 1.71 x 2.69 | colormap | rocks, large |
| rocks-medium.glb | 1.98 x 0.88 x 1.72 | colormap | rocks, medium |
| rocks-small.glb | 1.54 x 0.65 x 1.42 | colormap | rocks, small |
| snow-bunker.glb | 1.94 x 0.41 x 1.35 | colormap | snow, bunker |
| snow-flat.glb | 1.86 x 0.10 x 1.45 | colormap | snow, flat |
| snow-flat-large.glb | 3.10 x 0.10 x 2.41 | colormap | snow, flat large |
| snow-pile.glb | 0.99 x 0.20 x 1.11 | colormap | snow, pile |

**Boats, ships, vehicles**

| File | W x H x D | ext | Description |
|---|---|---|---|
| sled.glb | 0.63 x 0.38 x 1.00 | colormap | small wooden sled |
| sled-long.glb | 0.63 x 0.38 x 1.00 | colormap | sled, long |
| train-locomotive.glb | 0.67 x 0.43 x 0.27 | colormap | train, locomotive |
| train-tender.glb | 0.35 x 0.18 x 0.20 | colormap | train, tender |
| train-wagon.glb | 0.71 x 0.31 x 0.21 | colormap | train, wagon |
| train-wagon-flat.glb | 0.69 x 0.17 x 0.20 | colormap | train, wagon flat |
| train-wagon-flat-short.glb | 0.35 x 0.17 x 0.20 | colormap | train, wagon flat short |
| train-wagon-logs.glb | 0.69 x 0.22 x 0.20 | colormap | train, wagon logs |
| train-wagon-short.glb | 0.37 x 0.31 x 0.21 | colormap | train, wagon short |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| candy-cane-green.glb | 0.30 x 0.45 x 0.10 | colormap | candy, cane green |
| candy-cane-red.glb | 0.30 x 0.45 x 0.10 | colormap | candy, cane red |
| festivus-pole.glb | 0.50 x 1.40 x 0.50 | colormap | festivus, pole |
| gingerbread-man.glb | 0.34 x 0.38 x 0.08 | colormap | gingerbread, man |
| gingerbread-woman.glb | 0.37 x 0.40 x 0.15 | colormap | gingerbread, woman |
| hanukkah-dreidel.glb | 0.16 x 0.36 x 0.16 | colormap | hanukkah, dreidel |
| hanukkah-menorah.glb | 0.56 x 0.65 x 0.19 | colormap | hanukkah, menorah |
| hanukkah-menorah-candles.glb | 0.57 x 0.87 x 0.19 | colormap | hanukkah, menorah candles |
| kwanzaa-kikombe.glb | 0.25 x 0.30 x 0.25 | colormap | kwanzaa, kikombe |
| kwanzaa-kinara.glb | 0.85 x 0.47 x 0.15 | colormap | kwanzaa, kinara |
| kwanzaa-kinara-alternative.glb | 0.75 x 0.47 x 0.15 | colormap | kwanzaa, kinara alternative |
| lantern.glb | 0.53 x 1.74 x 0.46 | colormap | lantern light |
| lantern-hanging.glb | 0.42 x 0.67 x 0.42 | colormap | lantern, hanging |
| lights-colored.glb | 1.01 x 0.32 x 0.06 | colormap | lights, colored |
| lights-green.glb | 1.01 x 0.32 x 0.06 | colormap | lights, green |
| lights-red.glb | 1.01 x 0.32 x 0.06 | colormap | lights, red |
| nutcracker.glb | 0.55 x 1.08 x 0.35 | colormap | nutcracker soldier toy |
| present-a-cube.glb | 0.45 x 0.30 x 0.45 | colormap | present, A cube |
| present-a-rectangle.glb | 0.65 x 0.27 x 0.45 | colormap | present, A rectangle |
| present-a-round.glb | 0.55 x 0.30 x 0.55 | colormap | present, A round |
| present-b-cube.glb | 0.45 x 0.27 x 0.45 | colormap | present, B cube |
| present-b-rectangle.glb | 0.65 x 0.27 x 0.45 | colormap | present, B rectangle |
| present-b-round.glb | 0.55 x 0.27 x 0.55 | colormap | present, B round |
| reindeer.glb | 0.63 x 1.12 x 1.07 | colormap | standing reindeer |
| snowflake-a.glb | 0.35 x 0.40 x 0.09 | colormap | snowflake prop (A) |
| snowflake-b.glb | 0.37 x 0.40 x 0.09 | colormap | snowflake prop (B) |
| snowflake-c.glb | 0.35 x 0.40 x 0.09 | colormap | snowflake prop (C) |
| snowman.glb | 1.10 x 1.06 x 0.69 | colormap | plain snowman |
| snowman-hat.glb | 1.08 x 1.36 x 0.69 | colormap | snowman, hat |
| sock-green.glb | 0.31 x 0.62 x 0.20 | colormap | sock, green |
| sock-green-cane.glb | 0.42 x 0.73 x 0.24 | colormap | sock, green cane |
| sock-red.glb | 0.31 x 0.62 x 0.20 | colormap | sock, red |
| sock-red-cane.glb | 0.42 x 0.73 x 0.24 | colormap | sock, red cane |
| wreath.glb | 0.67 x 0.76 x 0.26 | colormap | plain green wreath |
| wreath-decorated.glb | 0.67 x 0.76 x 0.26 | colormap | wreath, decorated |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bench.glb | 1.12 x 0.73 x 0.63 | colormap | park bench |
| bench-short.glb | 0.62 x 0.73 x 0.63 | colormap | bench, short |

### graveyard/ (86 files)

Graveyard Kit (5 old files from the 2020 version, rest from 5.0). New files need Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| pine.glb | 1.18 x 2.30 x 1.33 | colormap | graveyard pine tree |
| pine-crooked.glb | 1.18 x 2.11 x 1.33 | colormap | pine, crooked |
| pine-fall.glb | 1.18 x 2.30 x 1.33 | colormap | pine, fall |
| pine-fall-crooked.glb | 1.18 x 2.11 x 1.33 | colormap | pine, fall crooked |
| trunk.glb | 0.54 x 0.45 x 0.55 | colormap | dead tree trunk |
| trunk-long.glb | 0.54 x 1.00 x 0.54 | colormap | trunk, long |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| brick-wall.glb | 1.00 x 0.72 x 0.30 | colormap | brick, wall |
| brick-wall-curve.glb | 1.00 x 0.72 x 1.00 | colormap | brick, wall curve |
| brick-wall-curve-small.glb | 1.00 x 0.72 x 1.00 | colormap | brick, wall curve small |
| brick-wall-end.glb | 1.00 x 0.85 x 0.45 | colormap | brick, wall end |
| debris.glb | 0.54 x 0.16 x 0.55 | colormap | stone rubble pile |
| debris-wood.glb | 0.46 x 0.10 x 0.50 | colormap | debris, wood |
| rocks.glb | 1.08 x 0.38 x 0.96 | colormap | rock cluster |
| rocks-tall.glb | 1.03 x 0.59 x 1.02 | colormap | rocks, tall |
| stone-wall.glb | 1.00 x 0.72 x 0.20 | colormap | stone, wall |
| stone-wall-column.glb | 1.00 x 0.85 x 0.35 | colormap | stone, wall column |
| stone-wall-curve.glb | 1.00 x 0.72 x 1.00 | colormap | stone, wall curve |
| stone-wall-damaged.glb | 1.00 x 0.72 x 0.20 | colormap | stone, wall damaged |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| crypt.glb | 0.72 x 0.73 x 1.12 | colormap | stone crypt building |
| crypt-a.glb | 0.62 x 0.52 x 1.12 | colormap | crypt prop (A) |
| crypt-b.glb | 0.62 x 0.52 x 1.12 | colormap | crypt prop (B) |
| crypt-door.glb | 0.33 x 0.74 x 0.13 | colormap | crypt, door |
| crypt-large.glb | 1.85 x 1.00 x 2.40 | colormap | crypt, large |
| crypt-large-door.glb | 0.63 x 0.74 x 0.14 | colormap | crypt, large door |
| crypt-large-roof.glb | 1.98 x 0.76 x 2.44 | colormap | crypt, large roof |
| crypt-small.glb | 1.35 x 1.00 x 1.40 | colormap | crypt, small |
| crypt-small-roof.glb | 1.50 x 0.74 x 1.44 | colormap | crypt, small roof |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| altar-stone.glb | 1.04 x 0.49 x 0.65 | colormap | altar, stone |
| altar-wood.glb | 1.04 x 0.54 x 0.66 | colormap | altar, wood |
| border-pillar.glb | 0.22 x 0.76 x 0.22 | colormap | border, pillar |
| coffin.glb | 0.57 x 0.20 x 0.84 | colormap | closed wooden coffin |
| coffin-old.glb | 0.57 x 0.20 x 0.84 | colormap | coffin, old |
| column-large.glb | 0.39 x 1.13 x 0.39 | colormap | column, large |
| cross.glb | 0.67 x 1.05 x 0.25 | colormap | stone grave cross |
| cross-column.glb | 0.45 x 1.45 x 0.45 | colormap | cross, column |
| cross-wood.glb | 0.43 x 1.04 x 0.43 | colormap | cross, wood |
| fence.glb | 1.00 x 0.62 x 0.18 | colormap | fence section |
| fence-damaged.glb | 1.00 x 0.62 x 0.31 | colormap | fence, damaged |
| fence-gate.glb | 1.00 x 0.62 x 0.20 | colormap | fence, gate |
| grave.glb | 0.72 x 0.11 x 1.24 | colormap | grave mound |
| grave-border.glb | 0.76 x 0.11 x 1.39 | colormap | grave, border |
| gravestone-bevel.glb | 0.45 x 0.53 x 0.25 | colormap | gravestone, bevel |
| gravestone-broken.glb | 0.51 x 0.34 x 0.39 | colormap | gravestone, broken |
| gravestone-cross.glb | 0.45 x 0.92 x 0.33 | colormap | gravestone, cross |
| gravestone-cross-large.glb | 0.45 x 0.94 x 0.33 | colormap | gravestone, cross large |
| gravestone-debris.glb | 0.49 x 0.27 x 0.64 | colormap | gravestone, debris |
| gravestone-decorative.glb | 0.51 x 0.59 x 0.25 | colormap | gravestone, decorative |
| gravestone-roof.glb | 0.49 x 0.61 x 0.25 | colormap | gravestone, roof |
| gravestone-round.glb | 0.45 x 0.57 x 0.25 | colormap | gravestone, round |
| gravestone-wide.glb | 0.85 x 0.57 x 0.30 | colormap | gravestone, wide |
| iron-fence.glb | 1.00 x 0.88 x 0.11 | colormap | iron, fence |
| iron-fence-bar.glb | 0.12 x 0.67 x 0.10 | colormap | iron, fence bar |
| iron-fence-border.glb | 1.00 x 0.88 x 0.15 | colormap | iron, fence border |
| iron-fence-border-column.glb | 1.00 x 0.88 x 0.22 | colormap | iron, fence border column |
| iron-fence-border-curve.glb | 0.90 x 0.88 x 0.90 | colormap | iron, fence border curve |
| iron-fence-border-gate.glb | 1.00 x 0.76 x 0.22 | colormap | iron, fence border gate |
| iron-fence-curve.glb | 0.88 x 0.88 x 0.88 | colormap | iron, fence curve |
| iron-fence-damaged.glb | 1.00 x 0.88 x 0.33 | colormap | iron, fence damaged |
| pillar-large.glb | 0.22 x 1.13 x 0.22 | colormap | pillar, large |
| pillar-small.glb | 0.18 x 0.76 x 0.18 | colormap | pillar, small |
| pillar-square.glb | 0.35 x 1.15 x 0.35 | colormap | pillar, square |
| pillarObelisk.glb | 0.21 x 1.05 x 0.21 | - | pillar, obelisk |

**Machinery, pipes, tech**

| File | W x H x D | ext | Description |
|---|---|---|---|
| detail-bowl.glb | 0.20 x 0.13 x 0.20 | colormap | detail, bowl |
| detail-chalice.glb | 0.16 x 0.25 x 0.16 | colormap | detail, chalice |
| detail-plate.glb | 0.27 x 0.05 x 0.27 | colormap | detail, plate |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| urn.glb | 0.17 x 0.31 x 0.17 | - | stone urn |
| urn-round.glb | 0.26 x 0.28 x 0.26 | colormap | urn, round |
| urn-square.glb | 0.26 x 0.28 x 0.26 | colormap | urn, square |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| candle.glb | 0.14 x 0.20 x 0.14 | colormap | single candle |
| candle-multiple.glb | 0.26 x 0.20 x 0.27 | colormap | candle, multiple |
| fireBasket.glb | 0.27 x 0.12 x 0.27 | - | fire, basket |
| lantern-candle.glb | 0.24 x 0.39 x 0.24 | colormap | lantern, candle |
| lantern-glass.glb | 0.24 x 0.39 x 0.24 | colormap | lantern, glass |
| lightpost-all.glb | 0.73 x 1.27 x 0.73 | colormap | lamp post, all |
| lightpostDouble.glb | 0.15 x 1.32 x 0.62 | - | lamp post, double |
| lightpostSingle.glb | 0.15 x 1.32 x 0.38 | - | lamp post, single |
| pumpkin.glb | 0.38 x 0.32 x 0.38 | colormap | whole pumpkin |
| pumpkin-carved.glb | 0.38 x 0.32 x 0.38 | colormap | pumpkin, carved |
| pumpkin-tall.glb | 0.33 x 0.36 x 0.33 | colormap | pumpkin, tall |
| pumpkin-tall-carved.glb | 0.33 x 0.36 x 0.33 | colormap | pumpkin, tall carved |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bench.glb | 0.81 x 0.53 x 0.46 | colormap | park bench |
| bench-damaged.glb | 0.91 x 0.52 x 0.46 | colormap | bench, damaged |
| hay-bale.glb | 0.61 x 0.35 x 0.40 | colormap | hay, bale |
| hay-bale-bundled.glb | 0.61 x 0.38 x 0.43 | colormap | hay, bale bundled |
| shovel.glb | 0.19 x 0.61 x 0.10 | colormap | upright shovel |
| shovel-dirt.glb | 0.62 x 0.66 x 0.52 | colormap | shovel, dirt |

### pirate/ (63 files)

Pirate Kit 2.1 - ships, boats, palms, docks, towers. Needs Textures/colormap.png. Model units are large (ships up to 13 units).

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| grass.glb | 0.52 x 0.31 x 0.54 | colormap | grass tuft |
| grass-patch.glb | 1.31 x 0.47 x 1.27 | colormap | grass, patch |
| grass-plant.glb | 1.11 x 0.52 x 1.24 | colormap | grass, plant |
| palm-bend.glb | 2.88 x 4.25 x 3.22 | colormap | palm, bend |
| palm-detailed-bend.glb | 2.88 x 4.25 x 3.22 | colormap | palm, detailed bend |
| palm-detailed-straight.glb | 3.22 x 4.21 x 3.22 | colormap | palm, detailed straight |
| palm-straight.glb | 2.49 x 4.21 x 2.49 | colormap | palm, straight |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| rocks-a.glb | 5.11 x 2.90 x 4.39 | colormap | rocks prop (A) |
| rocks-b.glb | 4.44 x 3.65 x 4.71 | colormap | rocks prop (B) |
| rocks-c.glb | 3.64 x 2.30 x 3.67 | colormap | rocks prop (C) |
| rocks-sand-a.glb | 5.11 x 3.21 x 4.39 | colormap | rocks, sand (A) |
| rocks-sand-b.glb | 4.38 x 3.71 x 4.71 | colormap | rocks, sand (B) |
| rocks-sand-c.glb | 3.71 x 2.61 x 3.72 | colormap | rocks, sand (C) |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| platform.glb | 2.50 x 0.23 x 2.51 | colormap | wooden deck platform |
| platform-planks.glb | 1.89 x 0.43 x 2.70 | colormap | platform, planks |
| structure.glb | 2.50 x 2.20 x 2.50 | colormap | open shelter frame |
| structure-fence.glb | 2.50 x 2.20 x 2.50 | colormap | structure, fence |
| structure-fence-sides.glb | 3.25 x 2.20 x 3.45 | colormap | structure, fence sides |
| structure-platform.glb | 2.50 x 0.93 x 2.51 | colormap | structure, platform |
| structure-platform-dock.glb | 2.50 x 1.31 x 2.51 | colormap | structure, platform dock |
| structure-platform-dock-small.glb | 1.90 x 1.31 x 2.51 | colormap | structure, platform dock small |
| structure-platform-small.glb | 1.90 x 0.90 x 2.51 | colormap | structure, platform small |
| structure-roof.glb | 3.08 x 3.40 x 3.23 | colormap | structure, roof |
| tower-base.glb | 3.16 x 2.00 x 3.16 | colormap | tower, base |
| tower-base-door.glb | 3.16 x 2.00 x 3.56 | colormap | tower, base door |
| tower-complete-large.glb | 3.63 x 10.22 x 3.63 | colormap | tower, complete large |
| tower-complete-small.glb | 3.35 x 6.79 x 3.66 | colormap | tower, complete small |
| tower-middle.glb | 3.05 x 2.00 x 3.05 | colormap | tower, middle |
| tower-middle-windows.glb | 2.83 x 2.00 x 3.07 | colormap | tower, middle windows |
| tower-roof.glb | 3.63 x 3.44 x 3.63 | colormap | tower, roof |
| tower-top.glb | 3.35 x 2.79 x 3.35 | colormap | tower, top |
| tower-watch.glb | 3.05 x 2.79 x 3.05 | colormap | tower, watch |

**Boats, ships, vehicles**

| File | W x H x D | ext | Description |
|---|---|---|---|
| boat-row-large.glb | 2.75 x 0.79 x 2.85 | colormap | boat, row large |
| boat-row-small.glb | 2.75 x 0.79 x 2.37 | colormap | boat, row small |
| cannon.glb | 1.40 x 1.05 x 2.39 | colormap | fixed ship cannon |
| cannon-ball.glb | 0.64 x 0.67 x 0.55 | colormap | cannon, ball |
| cannon-mobile.glb | 1.68 x 1.38 x 2.39 | colormap | cannon, mobile |
| mast.glb | 4.39 x 7.86 x 1.74 | colormap | bare ship mast |
| mast-ropes.glb | 4.39 x 7.89 x 2.35 | colormap | mast, ropes |
| ship-ghost.glb | 4.80 x 9.96 x 10.60 | colormap | ship, ghost |
| ship-large.glb | 4.80 x 9.96 x 13.10 | colormap | ship, large |
| ship-medium.glb | 4.80 x 9.96 x 10.60 | colormap | ship, medium |
| ship-pirate-large.glb | 4.80 x 9.96 x 13.10 | colormap | ship, pirate large |
| ship-pirate-medium.glb | 4.80 x 9.96 x 10.60 | colormap | ship, pirate medium |
| ship-pirate-small.glb | 4.80 x 9.96 x 8.80 | colormap | ship, pirate small |
| ship-small.glb | 4.80 x 9.96 x 8.80 | colormap | ship, small |
| ship-wreck.glb | 4.80 x 10.75 x 10.60 | colormap | ship, wreck |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| barrel.glb | 1.34 x 1.23 x 1.34 | colormap | wooden barrel |
| chest.glb | 1.27 x 0.77 x 1.78 | colormap | treasure chest |
| crate.glb | 1.08 x 0.77 x 1.31 | colormap | wooden crate |
| crate-bottles.glb | 1.08 x 1.06 x 1.31 | colormap | crate, bottles |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| flag.glb | 1.34 x 2.10 x 0.40 | colormap | flag on pole |
| flag-high.glb | 1.34 x 3.60 x 0.40 | colormap | flag, high |
| flag-high-pennant.glb | 1.76 x 3.60 x 0.40 | colormap | flag, high pennant |
| flag-pennant.glb | 1.76 x 2.10 x 0.40 | colormap | flag, pennant |
| flag-pirate.glb | 1.34 x 2.10 x 0.40 | colormap | flag, pirate |
| flag-pirate-high.glb | 1.34 x 3.60 x 0.40 | colormap | flag, pirate high |
| flag-pirate-high-pennant.glb | 1.76 x 3.60 x 0.40 | colormap | flag, pirate high pennant |
| flag-pirate-pennant.glb | 1.76 x 2.10 x 0.40 | colormap | flag, pirate pennant |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bottle.glb | 0.36 x 0.89 x 0.36 | colormap | small bottle |
| bottle-large.glb | 0.47 x 0.89 x 0.47 | colormap | bottle, large |
| tool-paddle.glb | 0.66 x 2.35 x 0.21 | colormap | tool, paddle |
| tool-shovel.glb | 0.66 x 2.35 x 0.28 | colormap | tool, shovel |

### castle/ (56 files)

Castle Kit 2.0 - towers, gates, flags, siege engines. Needs Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| tree-large.glb | 0.89 x 1.85 x 0.89 | colormap | tree, large |
| tree-log.glb | 0.25 x 0.28 x 1.00 | colormap | tree, log |
| tree-small.glb | 0.74 x 1.35 x 0.72 | colormap | tree, small |
| tree-trunk.glb | 0.40 x 0.38 x 0.34 | colormap | tree, trunk |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| rocks-large.glb | 1.20 x 0.50 x 1.35 | colormap | rocks, large |
| rocks-small.glb | 1.03 x 0.50 x 1.10 | colormap | rocks, small |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bridge-draw.glb | 1.00 x 0.10 x 0.83 | colormap | bridge, draw |
| bridge-straight.glb | 0.93 x 1.18 x 0.93 | colormap | bridge, straight |
| bridge-straight-pillar.glb | 0.93 x 1.18 x 0.93 | colormap | bridge, straight pillar |
| gate.glb | 0.15 x 0.91 x 0.66 | colormap | castle gate door |
| siege-ballista.glb | 1.33 x 1.11 x 1.20 | colormap | siege, ballista |
| siege-ballista-demolished.glb | 1.75 x 0.51 x 1.55 | colormap | siege, ballista demolished |
| siege-catapult.glb | 2.15 x 1.38 x 0.94 | colormap | siege, catapult |
| siege-catapult-demolished.glb | 1.68 x 0.32 x 1.67 | colormap | siege, catapult demolished |
| siege-ram.glb | 2.09 x 1.18 x 0.95 | colormap | siege, ram |
| siege-ram-demolished.glb | 2.08 x 0.72 x 1.65 | colormap | siege, ram demolished |
| siege-tower.glb | 1.97 x 2.88 x 0.96 | colormap | siege, tower |
| siege-tower-demolished.glb | 2.17 x 2.10 x 1.85 | colormap | siege, tower demolished |
| siege-trebuchet.glb | 1.80 x 2.46 x 1.26 | colormap | siege, trebuchet |
| siege-trebuchet-demolished.glb | 1.94 x 0.31 x 2.10 | colormap | siege, trebuchet demolished |
| tower-base.glb | 1.00 x 1.31 x 1.00 | colormap | tower, base |
| tower-hexagon-base.glb | 0.90 x 1.31 x 0.78 | colormap | tower, hexagon base |
| tower-hexagon-mid.glb | 0.95 x 0.46 x 0.82 | colormap | tower, hexagon mid |
| tower-hexagon-roof.glb | 0.98 x 0.83 x 0.85 | colormap | tower, hexagon roof |
| tower-hexagon-roof-secondary.glb | 0.98 x 0.75 x 0.85 | colormap | tower, hexagon roof secondary |
| tower-hexagon-top.glb | 0.86 x 0.13 x 0.75 | colormap | tower, hexagon top |
| tower-hexagon-top-wood.glb | 0.86 x 0.46 x 0.75 | colormap | tower, hexagon top wood |
| tower-slant-roof.glb | 1.17 x 2.14 x 1.14 | colormap | tower, slant roof |
| tower-square.glb | 1.00 x 1.31 x 1.00 | colormap | tower, square |
| tower-square-arch.glb | 0.93 x 1.01 x 0.93 | colormap | tower, square arch |
| tower-square-base.glb | 1.00 x 1.01 x 1.00 | colormap | tower, square base |
| tower-square-base-border.glb | 1.00 x 0.45 x 1.00 | colormap | tower, square base border |
| tower-square-base-color.glb | 1.00 x 1.01 x 1.00 | colormap | tower, square base color |
| tower-square-mid.glb | 0.93 x 1.01 x 0.93 | colormap | tower, square mid |
| tower-square-mid-color.glb | 0.93 x 0.20 x 0.93 | colormap | tower, square mid color |
| tower-square-mid-door.glb | 0.93 x 1.01 x 0.93 | colormap | tower, square mid door |
| tower-square-mid-open.glb | 0.93 x 1.01 x 0.93 | colormap | tower, square mid open |
| tower-square-mid-open-simple.glb | 0.93 x 0.88 x 0.93 | colormap | tower, square mid open simple |
| tower-square-mid-windows.glb | 0.93 x 1.01 x 0.93 | colormap | tower, square mid windows |
| tower-square-roof.glb | 1.00 x 2.01 x 1.00 | colormap | tower, square roof |
| tower-square-top.glb | 1.00 x 0.30 x 1.00 | colormap | tower, square top |
| tower-square-top-color.glb | 1.00 x 0.38 x 1.00 | colormap | tower, square top color |
| tower-square-top-roof.glb | 1.00 x 1.00 x 1.00 | colormap | tower, square top roof |
| tower-square-top-roof-high.glb | 1.00 x 1.35 x 1.00 | colormap | tower, square top roof high |
| tower-square-top-roof-high-windows.glb | 1.00 x 1.08 x 1.00 | colormap | tower, square top roof high |
| tower-square-top-roof-rounded.glb | 1.00 x 0.95 x 1.00 | colormap | tower, square top roof rounded |
| tower-top.glb | 1.00 x 0.13 x 1.00 | colormap | tower, top |
| wall.glb | 1.00 x 1.31 x 1.00 | colormap | castle wall section |
| wall-narrow.glb | 0.50 x 1.31 x 1.00 | colormap | wall, narrow |
| wall-narrow-gate.glb | 0.63 x 1.31 x 1.00 | colormap | wall, narrow gate |
| wall-pillar.glb | 1.00 x 1.31 x 1.00 | colormap | wall, pillar |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| flag.glb | 0.11 x 0.87 x 0.43 | colormap | flag on pole |
| flag-banner-long.glb | 0.04 x 2.17 x 0.63 | colormap | flag, banner long |
| flag-banner-short.glb | 0.04 x 0.78 x 0.63 | colormap | flag, banner short |
| flag-pennant.glb | 0.11 x 0.87 x 0.57 | colormap | flag, pennant |
| flag-wide.glb | 0.11 x 0.87 x 0.55 | colormap | flag, wide |

### survival/ (73 files)

Survival Kit 2.0 - camp gear, tools, crates, shelters. Needs Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| grass.glb | 0.23 x 0.14 x 0.26 | colormap | grass tuft |
| grass-large.glb | 0.48 x 0.14 x 0.49 | colormap | grass, large |
| tree.glb | 0.55 x 1.41 x 0.53 | colormap | simple tree |
| tree-autumn.glb | 0.55 x 1.41 x 0.53 | colormap | tree, autumn |
| tree-autumn-tall.glb | 0.55 x 1.71 x 0.53 | colormap | tree, autumn tall |
| tree-autumn-trunk.glb | 0.20 x 0.26 x 0.20 | colormap | tree, autumn trunk |
| tree-log.glb | 0.25 x 0.28 x 1.00 | colormap | tree, log |
| tree-log-small.glb | 0.25 x 0.28 x 0.65 | colormap | tree, log small |
| tree-tall.glb | 0.55 x 1.71 x 0.53 | colormap | tree, tall |
| tree-trunk.glb | 0.20 x 0.26 x 0.20 | colormap | tree, trunk |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| resource-planks.glb | 0.37 x 0.09 x 0.63 | colormap | resource, planks |
| resource-stone.glb | 0.17 x 0.11 x 0.14 | colormap | resource, stone |
| resource-stone-large.glb | 0.38 x 0.16 x 0.34 | colormap | resource, stone large |
| resource-wood.glb | 0.20 x 0.06 x 0.09 | colormap | resource, wood |
| rock-a.glb | 0.56 x 0.39 x 0.62 | colormap | rock prop (A) |
| rock-b.glb | 0.83 x 0.42 x 0.72 | colormap | rock prop (B) |
| rock-c.glb | 0.78 x 0.51 x 0.57 | colormap | rock prop (C) |
| rock-flat.glb | 1.79 x 0.20 x 1.45 | colormap | rock, flat |
| rock-flat-grass.glb | 1.79 x 0.23 x 1.45 | colormap | rock, flat grass |
| rock-sand-a.glb | 0.56 x 0.39 x 0.48 | colormap | rock, sand (A) |
| rock-sand-b.glb | 0.80 x 0.45 x 0.79 | colormap | rock, sand (B) |
| rock-sand-c.glb | 0.78 x 0.51 x 0.57 | colormap | rock, sand (C) |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| structure.glb | 0.50 x 0.50 x 0.50 | colormap | open shelter frame |
| structure-canvas.glb | 0.50 x 0.50 x 0.50 | colormap | structure, canvas |
| structure-metal.glb | 0.54 x 0.50 x 0.54 | colormap | structure, metal |
| structure-metal-doorway.glb | 0.54 x 0.50 x 0.29 | colormap | structure, metal doorway |
| structure-metal-roof.glb | 0.54 x 0.50 x 0.55 | colormap | structure, metal roof |
| structure-metal-wall.glb | 0.54 x 0.50 x 0.09 | colormap | structure, metal wall |
| structure-roof.glb | 0.77 x 0.78 x 0.78 | colormap | structure, roof |
| tent.glb | 0.56 x 0.49 x 0.56 | colormap | small camping tent |
| tent-canvas.glb | 0.56 x 0.49 x 0.56 | colormap | tent, canvas |
| tent-canvas-half.glb | 0.56 x 0.49 x 0.56 | colormap | tent, canvas half |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| fence.glb | 0.50 x 0.52 x 0.04 | colormap | fence section |
| fence-doorway.glb | 0.50 x 0.52 x 0.27 | colormap | fence, doorway |
| fence-fortified.glb | 0.50 x 0.52 x 0.05 | colormap | fence, fortified |

**Machinery, pipes, tech**

| File | W x H x D | ext | Description |
|---|---|---|---|
| metal-panel.glb | 0.50 x 0.50 x 0.05 | colormap | metal, panel |
| metal-panel-narrow.glb | 0.25 x 0.50 x 0.05 | colormap | metal, panel narrow |
| metal-panel-screws.glb | 0.50 x 0.50 x 0.06 | colormap | metal, panel screws |
| metal-panel-screws-half.glb | 0.50 x 0.25 x 0.06 | colormap | metal, panel screws half |
| metal-panel-screws-narrow.glb | 0.25 x 0.50 x 0.06 | colormap | metal, panel screws narrow |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| barrel.glb | 0.24 x 0.34 x 0.24 | colormap | wooden barrel |
| barrel-open.glb | 0.24 x 0.34 x 0.24 | colormap | barrel, open |
| box.glb | 0.25 x 0.25 x 0.25 | colormap | small closed box |
| box-large.glb | 0.25 x 0.25 x 0.50 | colormap | box, large |
| box-large-open.glb | 0.25 x 0.31 x 0.50 | colormap | box, large open |
| box-open.glb | 0.25 x 0.31 x 0.25 | colormap | box, open |
| bucket.glb | 0.14 x 0.19 x 0.14 | colormap | wooden bucket |
| chest.glb | 0.26 x 0.21 x 0.39 | colormap | treasure chest |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| campfire-fishing-stand.glb | 0.40 x 0.28 x 0.25 | colormap | campfire, fishing stand |
| campfire-pit.glb | 0.28 x 0.09 x 0.27 | colormap | campfire, pit |
| campfire-stand.glb | 0.41 x 0.28 x 0.12 | colormap | campfire, stand |
| signpost.glb | 0.21 x 0.46 x 0.04 | colormap | double signpost |
| signpost-single.glb | 0.21 x 0.46 x 0.04 | colormap | signpost, single |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bedroll.glb | 0.31 x 0.13 x 0.61 | colormap | unrolled bedroll |
| bedroll-frame.glb | 0.27 x 0.15 x 0.61 | colormap | bedroll, frame |
| bedroll-packed.glb | 0.26 x 0.09 x 0.09 | colormap | bedroll, packed |
| bottle.glb | 0.05 x 0.15 x 0.06 | colormap | small bottle |
| bottle-large.glb | 0.07 x 0.14 x 0.08 | colormap | bottle, large |
| fish.glb | 0.20 x 0.11 x 0.07 | colormap | single fish |
| fish-large.glb | 0.31 x 0.16 x 0.10 | colormap | fish, large |
| tool-axe.glb | 0.11 x 0.26 x 0.03 | colormap | tool, axe |
| tool-axe-upgraded.glb | 0.15 x 0.26 x 0.04 | colormap | tool, axe upgraded |
| tool-hammer.glb | 0.09 x 0.15 x 0.04 | colormap | tool, hammer |
| tool-hammer-upgraded.glb | 0.12 x 0.18 x 0.05 | colormap | tool, hammer upgraded |
| tool-hoe.glb | 0.09 x 0.24 x 0.07 | colormap | tool, hoe |
| tool-hoe-upgraded.glb | 0.09 x 0.24 x 0.09 | colormap | tool, hoe upgraded |
| tool-pickaxe.glb | 0.18 x 0.24 x 0.04 | colormap | tool, pickaxe |
| tool-pickaxe-upgraded.glb | 0.18 x 0.24 x 0.04 | colormap | tool, pickaxe upgraded |
| tool-shovel.glb | 0.07 x 0.29 x 0.03 | colormap | tool, shovel |
| tool-shovel-upgraded.glb | 0.09 x 0.29 x 0.04 | colormap | tool, shovel upgraded |
| workbench.glb | 0.30 x 0.24 x 0.30 | colormap | wooden workbench |
| workbench-anvil.glb | 0.32 x 0.30 x 0.30 | colormap | workbench, anvil |
| workbench-grind.glb | 0.26 x 0.31 x 0.33 | colormap | workbench, grind |

### town/ (39 files)

Fantasy Town Kit (22 old camelCase files from 1.0, 17 kebab-case additions from 2.0). New files need Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| hedge.glb | 0.25 x 0.25 x 1.00 | - | hedge section |
| hedge-curved.glb | 1.00 x 0.25 x 1.00 | colormap | hedge, curved |
| hedge-gate.glb | 0.25 x 0.25 x 1.00 | colormap | hedge, gate |
| hedge-large.glb | 0.40 x 0.60 x 1.00 | colormap | hedge, large |
| hedge-large-curved.glb | 1.00 x 0.60 x 1.00 | colormap | hedge, large curved |
| hedge-large-gate.glb | 0.40 x 0.60 x 1.00 | colormap | hedge, large gate |
| tree.glb | 1.02 x 2.41 x 1.02 | - | simple tree |
| tree-high-crooked.glb | 1.02 x 2.97 x 1.02 | colormap | tree, high crooked |
| tree-high-round.glb | 1.02 x 2.75 x 1.02 | colormap | tree, high round |
| treeCrooked.glb | 1.02 x 2.41 x 1.02 | - | tree, crooked |
| treeHigh.glb | 1.02 x 2.97 x 1.02 | - | tree, high |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| rock-small.glb | 1.00 x 1.02 x 1.33 | colormap | rock, small |
| rock-wide.glb | 1.09 x 1.02 x 1.57 | colormap | rock, wide |
| rockLarge.glb | 1.60 x 1.16 x 1.45 | - | rock, large |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| watermill.glb | 0.73 x 1.73 x 2.00 | - | watermill building |
| watermill-wide.glb | 1.05 x 1.80 x 1.80 | colormap | watermill, wide |
| windmill.glb | 0.47 x 3.07 x 3.07 | - | windmill building |

**Boats, ships, vehicles**

| File | W x H x D | ext | Description |
|---|---|---|---|
| cart.glb | 0.65 x 0.79 x 1.44 | - | hand cart |
| cartHigh.glb | 0.65 x 1.11 x 1.44 * | - | cart, high |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| fence.glb | 0.07 x 0.38 x 1.00 | - | fence section |
| fence-broken.glb | 0.26 x 0.38 x 1.00 | colormap | fence, broken |
| fence-curved.glb | 1.00 x 0.38 x 1.00 | colormap | fence, curved |
| fenceGate.glb | 0.52 x 0.55 x 1.00 | - | fence, gate |
| pillar-stone.glb | 0.16 x 1.00 x 0.16 | colormap | pillar, stone |
| pillar-wood.glb | 0.16 x 1.00 x 0.16 | colormap | pillar, wood |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bannerGreen.glb | 0.05 x 0.84 x 0.50 | - | banner, green |
| bannerRed.glb | 0.05 x 0.84 x 0.50 | - | banner, red |
| fountain-center.glb | 1.00 x 0.00 x 1.00 | colormap | fountain, center |
| fountain-square.glb | 2.00 x 0.46 x 2.00 | colormap | fountain, square |
| fountain-square-detail.glb | 2.00 x 0.48 x 2.00 | colormap | fountain, square detail |
| fountainRound.glb | 2.00 x 0.28 x 2.00 | - | fountain, round |
| fountainRoundDetail.glb | 2.00 x 0.48 x 2.00 | - | fountain, round detail |
| lantern.glb | 0.22 x 1.56 x 0.22 | - | lantern light |
| stall.glb | 0.65 x 0.37 x 1.00 | - | market stall |
| stallBench.glb | 0.26 x 0.23 x 0.94 | - | stall, bench |
| stallGreen.glb | 1.00 x 1.24 x 1.00 | - | stall, green |
| stallRed.glb | 1.00 x 1.24 x 1.00 | - | stall, red |
| stallStool.glb | 0.26 x 0.23 x 0.26 | - | stall, stool |

**Other props**

| File | W x H x D | ext | Description |
|---|---|---|---|
| wheel.glb | 0.21 x 0.52 x 0.51 | - | cart wheel |

### industrial/ (37 files)

City Kit Industrial 2.0 - factories, chimneys, tanks, containers. Needs Textures/colormap.png.

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| building-a.glb | 2.08 x 1.47 x 1.24 | colormap | building prop (A) |
| building-b.glb | 2.08 x 1.47 x 1.26 | colormap | building prop (B) |
| building-c.glb | 1.88 x 1.25 x 2.11 | colormap | building prop (C) |
| building-d.glb | 0.88 x 1.42 x 1.42 | colormap | building prop (D) |
| building-e.glb | 1.68 x 1.65 x 1.29 | colormap | building prop (E) |
| building-f.glb | 1.79 x 1.93 x 1.28 | colormap | building prop (F) |
| building-g.glb | 1.68 x 1.28 x 1.28 | colormap | building prop (G) |
| building-h.glb | 1.32 x 0.73 x 1.31 | colormap | building prop (H) |
| building-i.glb | 1.03 x 0.73 x 1.30 | colormap | building prop (I) |
| building-j.glb | 1.03 x 0.86 x 1.30 | colormap | building prop (J) |
| building-k.glb | 1.30 x 0.77 x 0.91 | colormap | building prop (K) |
| building-l.glb | 2.08 x 1.93 x 1.87 | colormap | building prop (L) |
| building-m.glb | 1.32 x 1.52 x 1.70 | colormap | building prop (M) |
| building-n.glb | 0.98 x 1.91 x 1.42 | colormap | building prop (N) |
| building-o.glb | 0.88 x 0.92 x 1.24 | colormap | building prop (O) |
| building-p.glb | 1.68 x 0.71 x 0.99 | colormap | building prop (P) |
| building-q.glb | 2.14 x 0.88 x 1.77 | colormap | building prop (Q) |
| building-r.glb | 2.48 x 1.39 x 1.27 | colormap | building prop (R) |
| building-s.glb | 2.12 x 0.84 x 0.92 | colormap | building prop (S) |
| building-t.glb | 1.72 x 1.01 x 1.39 | colormap | building prop (T) |
| chimney-basic.glb | 0.20 x 1.00 x 0.20 | colormap | chimney, basic |
| chimney-large.glb | 1.08 x 1.70 x 1.08 | colormap | chimney, large |
| chimney-medium.glb | 0.45 x 1.93 x 0.45 | colormap | chimney, medium |
| chimney-small.glb | 0.30 x 0.75 x 0.30 | colormap | chimney, small |
| shipping-container-a.glb | 1.38 x 1.29 x 3.05 * | colormap | shipping, container (A) |
| shipping-container-b.glb | 1.38 x 1.29 x 3.05 * | colormap | shipping, container (B) |
| shipping-container-c.glb | 1.38 x 1.29 x 3.05 * | colormap | shipping, container (C) |
| solar-panel-flat.glb | 0.42 x 0.06 x 0.71 | colormap | solar, panel flat |
| solar-panel-landscape.glb | 0.71 x 0.26 x 0.40 | colormap | solar, panel landscape |
| solar-panel-landscape-group.glb | 1.51 x 0.26 x 0.90 | colormap | solar, panel landscape group |
| solar-panel-portrait.glb | 0.42 x 0.41 x 0.65 | colormap | solar, panel portrait |
| solar-panel-portrait-group.glb | 0.92 x 0.41 x 1.25 | colormap | solar, panel portrait group |
| water-tower.glb | 0.91 x 2.28 x 0.89 * | colormap | water, tower |
| windmill.glb | 0.60 x 2.17 x 1.13 | colormap | windmill building |
| windmill-low.glb | 0.60 x 1.65 x 1.13 | colormap | windmill, low |

**Machinery, pipes, tech**

| File | W x H x D | ext | Description |
|---|---|---|---|
| detail-tank.glb | 0.85 x 0.41 x 0.52 * | colormap | detail, tank |
| detail-tank-large.glb | 1.51 x 0.96 x 1.65 | colormap | detail, tank large |

### factory/ (62 files)

Factory Kit 3.0 - machines, pipes, cranes, conveyors, cogs. Needs Textures/colormap.png.

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| catwalk-corner.glb | 1.15 x 0.60 x 1.15 | colormap | catwalk, corner |
| catwalk-cross.glb | 1.00 x 0.40 x 1.00 | colormap | catwalk, cross |
| catwalk-junction.glb | 1.00 x 0.60 x 1.13 | colormap | catwalk, junction |
| catwalk-stairs.glb | 2.00 x 1.40 x 1.25 | colormap | catwalk, stairs |
| catwalk-stairs-loop.glb | 1.00 x 0.90 x 1.25 | colormap | catwalk, stairs loop |
| catwalk-straight.glb | 1.00 x 0.60 x 1.25 | colormap | catwalk, straight |
| crane.glb | 1.93 x 3.00 x 3.68 | colormap | gantry crane |
| crane-lift.glb | 0.72 x 1.35 x 0.72 | colormap | crane, lift |
| crane-magnet.glb | 0.72 x 0.90 x 0.72 | colormap | crane, magnet |
| hopper-high-round.glb | 1.12 x 1.50 x 1.12 | colormap | hopper, high round |
| hopper-high-square.glb | 1.12 x 1.50 x 1.12 | colormap | hopper, high square |
| hopper-round.glb | 1.12 x 1.00 x 1.12 | colormap | hopper, round |
| hopper-square.glb | 1.12 x 1.00 x 1.12 | colormap | hopper, square |

**Machinery, pipes, tech**

| File | W x H x D | ext | Description |
|---|---|---|---|
| cog-a.glb | 1.00 x 0.23 x 1.00 | colormap | cog prop (A) |
| cog-b.glb | 1.00 x 0.23 x 1.00 | colormap | cog prop (B) |
| cog-c.glb | 1.00 x 0.23 x 1.00 | colormap | cog prop (C) |
| cog-d.glb | 1.00 x 0.23 x 1.00 | colormap | cog prop (D) |
| cog-e.glb | 1.00 x 0.23 x 1.00 | colormap | cog prop (E) |
| cone.glb | 0.30 x 0.31 x 0.30 | colormap | traffic cone |
| conveyor.glb | 1.00 x 0.40 x 1.00 | colormap | conveyor belt section |
| conveyor-corner.glb | 1.00 x 0.45 x 1.00 | colormap | conveyor, corner |
| conveyor-long.glb | 2.00 x 0.40 x 1.00 | colormap | conveyor, long |
| lever-double.glb | 0.54 x 0.28 x 0.54 | colormap | lever, double |
| lever-single.glb | 0.50 x 0.38 x 0.34 | colormap | lever, single |
| machine.glb | 1.20 x 1.30 x 1.50 | colormap | factory machine block |
| machine-bed.glb | 2.35 x 1.30 x 2.35 | colormap | machine, bed |
| machine-connection-hole.glb | 1.20 x 1.29 x 1.50 | colormap | machine, connection hole |
| machine-connection-pipe.glb | 1.20 x 1.75 x 1.50 | colormap | machine, connection pipe |
| machine-fortified.glb | 1.20 x 1.35 x 1.60 | colormap | machine, fortified |
| machine-window.glb | 1.20 x 1.29 x 1.50 | colormap | machine, window |
| machine-window-bar.glb | 1.20 x 1.29 x 1.50 | colormap | machine, window bar |
| pipe-large.glb | 1.00 x 1.00 x 1.00 | colormap | pipe, large |
| pipe-large-bend.glb | 1.90 x 1.00 x 1.90 | colormap | pipe, large bend |
| pipe-large-bump.glb | 1.00 x 1.00 x 1.00 | colormap | pipe, large bump |
| pipe-large-cross.glb | 2.00 x 2.00 x 1.00 | colormap | pipe, large cross |
| pipe-large-curve.glb | 1.50 x 1.00 x 1.25 | colormap | pipe, large curve |
| pipe-large-junction.glb | 2.06 x 2.06 x 1.00 | colormap | pipe, large junction |
| pipe-large-long.glb | 2.00 x 1.00 x 1.00 | colormap | pipe, large long |
| pipe-large-side.glb | 2.00 x 1.50 x 1.00 | colormap | pipe, large side |
| pipe-large-valve.glb | 1.00 x 1.00 x 1.02 | colormap | pipe, large valve |
| piston-round.glb | 1.00 x 1.00 x 1.00 | colormap | piston, round |
| piston-square.glb | 1.00 x 1.00 x 1.00 | colormap | piston, square |
| piston-thin-round.glb | 0.50 x 1.00 x 0.50 | colormap | piston, thin round |
| piston-thin-square.glb | 0.50 x 1.00 x 0.50 | colormap | piston, thin square |
| robot-arm-a.glb | 1.00 x 0.80 x 1.00 | colormap | robot, arm (A) |
| robot-arm-b.glb | 1.00 x 1.00 x 1.00 | colormap | robot, arm (B) |
| scanner-high.glb | 0.48 x 1.27 x 1.77 | colormap | scanner, high |
| scanner-low.glb | 0.70 x 1.07 x 1.60 | colormap | scanner, low |
| screen-flat.glb | 1.20 x 0.74 x 0.65 | colormap | screen, flat |
| screen-hanging-small.glb | 0.60 x 0.69 x 0.58 | colormap | screen, hanging small |
| screen-hanging-wide.glb | 0.90 x 0.69 x 0.58 | colormap | screen, hanging wide |
| screen-panel-flat.glb | 1.20 x 0.74 x 0.80 | colormap | screen, panel flat |
| screen-panel-small.glb | 0.60 x 0.99 x 0.66 | colormap | screen, panel small |
| screen-panel-wide.glb | 1.20 x 0.99 x 0.66 | colormap | screen, panel wide |
| screen-small.glb | 0.60 x 0.99 x 0.50 | colormap | screen, small |
| screen-wide.glb | 1.20 x 0.99 x 0.49 | colormap | screen, wide |
| warning-orange.glb | 0.40 x 1.29 x 0.40 | colormap | warning, orange |
| warning-traffic.glb | 0.40 x 1.55 x 0.40 | colormap | warning, traffic |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| box-large.glb | 1.10 x 0.55 x 1.00 | colormap | box, large |
| box-long.glb | 1.10 x 0.55 x 0.50 | colormap | box, long |
| box-small.glb | 0.59 x 0.55 x 0.50 | colormap | box, small |
| box-wide.glb | 0.59 x 0.55 x 1.00 | colormap | box, wide |

### space/ (70 files)

Space Kit 2.0 - generators, satellite dishes, pipes, craters, crystal rocks. Self-contained GLBs.

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| crater.glb | 0.71 x 0.12 x 0.83 | - | small ground crater |
| craterLarge.glb | 0.89 x 0.12 x 0.89 | - | crater, large |
| meteor.glb | 0.87 x 0.73 x 0.75 | - | round meteor |
| meteor_detailed.glb | 0.87 x 0.73 x 0.82 | - | meteor, detailed |
| meteor_half.glb | 0.87 x 0.37 x 0.75 | - | meteor, half |
| rock.glb | 0.80 x 0.30 x 0.85 | - | single rock |
| rock_crystals.glb | 0.85 x 0.34 x 0.80 | - | rock, crystals |
| rock_crystalsLargeA.glb | 0.83 x 0.54 x 0.92 | - | rock, crystals large (A) |
| rock_crystalsLargeB.glb | 0.94 x 0.55 x 0.93 | - | rock, crystals large (B) |
| rock_largeA.glb | 0.92 x 0.50 x 0.83 | - | rock, large (A) |
| rock_largeB.glb | 0.93 x 0.50 x 0.94 | - | rock, large (B) |
| rocks_smallA.glb | 0.94 x 0.10 x 0.87 | - | rocks, small (A) |
| rocks_smallB.glb | 0.73 x 0.19 x 0.70 | - | rocks, small (B) |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| chimney.glb | 0.40 x 2.00 x 0.40 | - | vent chimney |
| chimney_detailed.glb | 0.40 x 2.00 x 0.40 | - | chimney, detailed |
| hangar_largeA.glb | 2.00 x 1.00 x 3.00 | - | hangar, large (A) |
| hangar_largeB.glb | 2.20 x 1.10 x 3.00 | - | hangar, large (B) |
| hangar_roundA.glb | 3.27 x 1.50 x 2.83 | - | hangar, round (A) |
| hangar_roundB.glb | 3.27 x 1.80 x 2.83 | - | hangar, round (B) |
| hangar_roundGlass.glb | 3.27 x 1.40 x 2.83 | - | hangar, round glass |
| hangar_smallA.glb | 2.00 x 1.00 x 2.00 | - | hangar, small (A) |
| hangar_smallB.glb | 2.00 x 1.00 x 2.00 | - | hangar, small (B) |
| rocket_baseA.glb | 1.80 x 1.60 x 1.80 | - | rocket, base (A) |
| rocket_baseB.glb | 1.80 x 1.30 x 1.80 | - | rocket, base (B) |
| rocket_finsA.glb | 1.20 x 0.70 x 1.20 | - | rocket, fins (A) |
| rocket_finsB.glb | 1.20 x 0.70 x 1.20 | - | rocket, fins (B) |
| rocket_fuelA.glb | 1.00 x 0.50 x 1.00 | - | rocket, fuel (A) |
| rocket_fuelB.glb | 1.00 x 1.00 x 1.00 | - | rocket, fuel (B) |
| rocket_sidesA.glb | 1.00 x 1.00 x 1.00 | - | rocket, sides (A) |
| rocket_sidesB.glb | 1.30 x 1.00 x 1.30 | - | rocket, sides (B) |
| rocket_topA.glb | 1.00 x 0.80 x 1.00 | - | rocket, top (A) |
| rocket_topB.glb | 1.00 x 1.10 x 1.00 | - | rocket, top (B) |
| structure.glb | 1.00 x 1.00 x 1.00 | - | open shelter frame |
| structure_closed.glb | 1.00 x 1.00 x 1.00 | - | structure, closed |
| structure_detailed.glb | 1.00 x 1.00 x 1.00 | - | structure, detailed |
| structure_diagonal.glb | 1.00 x 1.00 x 1.00 | - | structure, diagonal |

**Boats, ships, vehicles**

| File | W x H x D | ext | Description |
|---|---|---|---|
| rover.glb | 0.30 x 0.39 x 0.35 | - | six-wheel rover |

**Machinery, pipes, tech**

| File | W x H x D | ext | Description |
|---|---|---|---|
| machine_barrel.glb | 0.62 x 0.60 x 0.56 | - | machine, barrel |
| machine_barrelLarge.glb | 0.75 x 0.60 x 0.75 | - | machine, barrel large |
| machine_generator.glb | 0.95 x 0.40 x 0.55 | - | machine, generator |
| machine_generatorLarge.glb | 1.00 x 0.68 x 1.30 | - | machine, generator large |
| machine_wireless.glb | 0.75 x 0.60 x 0.50 | - | machine, wireless |
| machine_wirelessCable.glb | 0.95 x 0.80 x 0.60 | - | machine, wireless cable |
| pipe_corner.glb | 0.85 x 0.60 x 0.85 | - | pipe, corner |
| pipe_cornerDiagonal.glb | 0.85 x 0.60 x 0.85 | - | pipe, corner diagonal |
| pipe_cornerRound.glb | 0.85 x 0.60 x 0.85 | - | pipe, corner round |
| pipe_cornerRoundLarge.glb | 1.85 x 0.60 x 1.85 | - | pipe, corner round large |
| pipe_cross.glb | 1.00 x 0.60 x 1.00 | - | pipe, cross |
| pipe_end.glb | 0.69 x 0.60 x 1.00 | - | pipe, end |
| pipe_entrance.glb | 0.92 x 0.80 x 0.60 | - | pipe, entrance |
| pipe_open.glb | 0.69 x 0.60 x 1.00 | - | pipe, open |
| pipe_rampLarge.glb | 0.69 x 1.20 x 2.00 | - | pipe, ramp large |
| pipe_rampSmall.glb | 0.69 x 0.90 x 2.00 | - | pipe, ramp small |
| pipe_ring.glb | 0.92 x 0.80 x 1.00 | - | pipe, ring |
| pipe_ringHigh.glb | 0.92 x 1.30 x 1.00 | - | pipe, ring high |
| pipe_ringHighEnd.glb | 0.92 x 1.30 x 0.80 | - | pipe, ring high end |
| pipe_ringSupport.glb | 0.92 x 1.30 x 0.40 | - | pipe, ring support |
| pipe_split.glb | 1.00 x 0.60 x 0.85 | - | pipe, split |
| pipe_straight.glb | 0.69 x 0.60 x 1.00 | - | pipe, straight |
| pipe_supportHigh.glb | 0.40 x 1.00 x 0.40 | - | pipe, support high |
| pipe_supportLow.glb | 0.40 x 0.50 x 0.40 | - | pipe, support low |
| satelliteDish.glb | 0.69 x 0.62 x 0.57 | - | satellite, dish |
| satelliteDish_detailed.glb | 0.70 x 0.62 x 0.70 | - | satellite, dish detailed |
| satelliteDish_large.glb | 0.85 x 0.81 x 0.74 | - | satellite, dish large |
| supports_high.glb | 0.82 x 1.00 x 0.82 | - | supports, high |
| supports_low.glb | 0.82 x 0.50 x 0.82 | - | supports, low |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| barrel.glb | 0.20 x 0.25 x 0.17 | - | wooden barrel |
| barrels.glb | 0.55 x 0.25 x 0.50 | - | barrel group |
| barrels_rail.glb | 0.55 x 0.30 x 0.50 | - | barrels, rail |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bones.glb | 0.86 x 0.44 x 0.58 | - | large rib bones |

### platformer/ (55 files)

Platformer Kit 4.1 - crates, coins, fences, snow pines, pickups. Needs Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| flowers.glb | 0.78 x 0.14 x 0.79 | colormap | low flower patch |
| flowers-tall.glb | 0.55 x 0.46 x 0.62 | colormap | flowers, tall |
| grass.glb | 0.52 x 0.31 x 0.54 | colormap | grass tuft |
| hedge.glb | 1.00 x 0.40 x 0.30 | colormap | hedge section |
| hedge-corner.glb | 1.00 x 0.40 x 1.00 | colormap | hedge, corner |
| mushrooms.glb | 0.52 x 0.29 x 0.51 | colormap | mushroom cluster |
| plant.glb | 0.51 x 0.17 x 0.44 | colormap | leafy plant |
| tree.glb | 1.09 x 1.93 x 1.11 | colormap | simple tree |
| tree-pine.glb | 0.95 x 2.00 x 0.95 | colormap | tree, pine |
| tree-pine-small.glb | 0.66 x 1.40 x 0.66 | colormap | tree, pine small |
| tree-pine-snow.glb | 0.95 x 2.00 x 0.95 | colormap | tree, pine snow |
| tree-pine-snow-small.glb | 0.66 x 1.40 x 0.66 | colormap | tree, pine snow small |
| tree-snow.glb | 1.09 x 1.93 x 1.11 | colormap | tree, snow |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| brick.glb | 0.50 x 0.50 x 0.50 | colormap | single brick block |
| rocks.glb | 0.65 x 0.40 x 0.66 | colormap | rock cluster |
| stones.glb | 0.71 x 0.05 x 0.79 | colormap | small stone cluster |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| fence-broken.glb | 1.03 x 0.40 x 0.14 | colormap | fence, broken |
| fence-corner.glb | 0.99 x 0.40 x 0.99 | colormap | fence, corner |
| fence-corner-curved.glb | 0.99 x 0.40 x 0.99 | colormap | fence, corner curved |
| fence-low-broken.glb | 1.00 x 0.30 x 0.20 | colormap | fence, low broken |
| fence-low-corner.glb | 1.00 x 0.30 x 1.00 | colormap | fence, low corner |
| fence-low-corner-curved.glb | 1.00 x 0.30 x 1.00 | colormap | fence, low corner curved |
| fence-low-straight.glb | 1.00 x 0.30 x 0.20 | colormap | fence, low straight |
| fence-rope.glb | 0.95 x 0.30 x 0.21 | colormap | fence, rope |
| fence-straight.glb | 1.00 x 0.40 x 0.14 | colormap | fence, straight |

**Machinery, pipes, tech**

| File | W x H x D | ext | Description |
|---|---|---|---|
| conveyor-belt.glb | 1.00 x 0.30 x 1.00 | colormap | conveyor, belt |
| lever.glb | 0.60 x 0.54 x 0.45 | colormap | floor lever |
| pipe.glb | 1.00 x 0.56 x 1.00 | colormap | warp pipe |
| saw.glb | 0.79 x 0.79 x 0.30 | colormap | circular saw blade |
| spike-block.glb | 0.90 x 0.90 x 0.90 | colormap | spike, block |
| spike-block-wide.glb | 2.40 x 0.90 x 0.90 | colormap | spike, block wide |
| spring.glb | 0.75 x 0.33 x 0.75 | colormap | bounce spring |
| trap-spikes.glb | 0.64 x 0.26 x 0.64 | colormap | trap, spikes |
| trap-spikes-large.glb | 0.77 x 0.26 x 0.77 | colormap | trap, spikes large |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| barrel.glb | 0.52 x 0.48 x 0.52 | colormap | wooden barrel |
| chest.glb | 0.50 x 0.30 x 0.70 | colormap | treasure chest |
| crate.glb | 0.50 x 0.50 x 0.50 | colormap | wooden crate |
| crate-item.glb | 0.50 x 0.50 x 0.50 | colormap | crate, item |
| crate-item-strong.glb | 0.60 x 0.60 x 0.60 | colormap | crate, item strong |
| crate-strong.glb | 0.60 x 0.60 x 0.60 | colormap | crate, strong |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| flag.glb | 0.42 x 0.90 x 0.11 | colormap | flag on pole |
| sign.glb | 0.48 x 0.60 x 0.13 | colormap | wooden sign |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bomb.glb | 0.49 x 0.54 x 0.49 | colormap | round bomb |
| coin-bronze.glb | 0.40 x 0.40 x 0.17 | colormap | coin, bronze |
| coin-gold.glb | 0.40 x 0.40 x 0.17 | colormap | coin, gold |
| coin-silver.glb | 0.40 x 0.40 x 0.17 | colormap | coin, silver |
| heart.glb | 0.41 x 0.38 x 0.12 | colormap | heart pickup |
| jewel.glb | 0.33 x 0.37 x 0.29 | colormap | cut gem |
| key.glb | 0.38 x 0.22 x 0.07 | colormap | key pickup |
| ladder.glb | 0.50 x 1.00 x 0.10 | colormap | wooden ladder |
| ladder-broken.glb | 0.50 x 1.00 x 0.10 | colormap | ladder, broken |
| ladder-long.glb | 0.50 x 2.00 x 0.10 | colormap | ladder, long |
| lock.glb | 0.34 x 0.40 x 0.18 | colormap | padlock |
| poles.glb | 1.10 x 1.00 x 0.35 | colormap | wooden poles |
| star.glb | 0.36 x 0.36 x 0.24 | colormap | star pickup |

### arena/ (11 files)

Mini Arena 1.1 - columns, statue, banner, weapons. Needs Textures/colormap.png.

**Trees, plants, crops**

| File | W x H x D | ext | Description |
|---|---|---|---|
| tree.glb | 0.65 x 1.92 x 0.65 | colormap | simple tree |

**Rocks, cliffs, terrain**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bricks.glb | 0.77 x 0.41 x 0.85 | colormap | loose brick pile |

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| wall-gate.glb | 1.00 x 1.00 x 0.60 | colormap | wall, gate |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| column.glb | 0.60 x 1.00 x 0.60 | colormap | stone column |
| column-damaged.glb | 0.60 x 0.72 x 0.60 | colormap | column, damaged |
| statue.glb | 0.70 x 1.34 x 0.70 | colormap | arena statue |

**Lights, fire, flags, festive**

| File | W x H x D | ext | Description |
|---|---|---|---|
| banner.glb | 0.60 x 1.02 x 0.23 | colormap | hanging arena banner |
| trophy.glb | 0.57 x 0.48 x 0.45 | colormap | gold trophy cup |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| weapon-rack.glb | 0.78 x 0.47 x 0.45 | colormap | weapon, rack |
| weapon-spear.glb | 0.15 x 0.70 x 0.12 | colormap | weapon, spear |
| weapon-sword.glb | 0.21 x 0.50 x 0.06 | colormap | weapon, sword |

### shop/ (22 files)

Mini Shop 2.1 - market displays, shelves, carts. Needs Textures/colormap.png.

**Boats, ships, vehicles**

| File | W x H x D | ext | Description |
|---|---|---|---|
| hand-truck.glb | 0.66 x 0.55 x 0.55 * | colormap | hand, truck |
| shopping-basket.glb | 0.35 x 0.25 x 0.35 | colormap | shopping, basket |
| shopping-cart.glb | 0.35 x 0.39 x 0.53 | colormap | shopping, cart |

**Fences, pillars, grave markers**

| File | W x H x D | ext | Description |
|---|---|---|---|
| column.glb | 0.73 x 1.00 x 0.73 | colormap | stone column |
| fence.glb | 0.59 x 0.34 x 0.19 | colormap | fence section |

**Containers and storage**

| File | W x H x D | ext | Description |
|---|---|---|---|
| display-bread.glb | 0.70 x 0.50 x 0.60 * | colormap | display, bread |
| display-cans.glb | 0.80 x 0.30 x 0.80 | colormap | display, cans |
| display-flowers.glb | 1.33 x 1.15 x 1.32 * | colormap | display, flowers |
| display-fruit.glb | 0.60 x 0.52 x 0.60 | colormap | display, fruit |
| display-small.glb | 0.39 x 0.83 x 0.28 | colormap | display, small |
| freezer.glb | 0.80 x 0.34 x 0.60 | colormap | chest freezer |
| freezers-standing.glb | 1.00 x 0.90 x 0.48 | colormap | freezers, standing |
| shelf-bags.glb | 0.80 x 0.80 x 0.70 * | colormap | shelf, bags |
| shelf-boxes.glb | 0.80 x 0.80 x 0.70 * | colormap | shelf, boxes |
| shelf-end.glb | 0.80 x 1.05 x 0.48 | colormap | shelf, end |

**Tools, weapons, pickups**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bottle-return.glb | 0.45 x 1.09 x 0.48 | colormap | bottle, return |

**Other props**

| File | W x H x D | ext | Description |
|---|---|---|---|
| cash-register.glb | 0.90 x 0.59 x 0.85 | colormap | cash, register |
| cash-register-self.glb | 0.90 x 0.69 x 0.55 | colormap | cash, register self |
| clothing-rack.glb | 0.80 x 0.83 x 0.50 | colormap | clothing, rack |
| clothing-table.glb | 0.88 x 0.45 x 0.58 | colormap | clothing, table |
| gacha-machine.glb | 0.43 x 0.98 x 0.45 | colormap | gacha, machine |
| mannequin.glb | 0.58 x 0.72 x 0.35 | colormap | shop mannequin |

### food/ (200 files)

Food Kit (47 old camelCase files from 1.2, 153 kebab-case additions from 2.0). New files need Textures/colormap.png.

**Food items**

| File | W x H x D | ext | Description |
|---|---|---|---|
| advocado-half.glb | 0.10 x 0.21 x 0.17 | colormap | advocado, half |
| apple.glb | 0.20 x 0.19 x 0.20 | - | whole apple |
| apple-half.glb | 0.10 x 0.19 x 0.20 | colormap | apple, half |
| avocado.glb | 0.28 x 0.40 x 0.33 * | colormap | avocado prop |
| bacon.glb | 0.13 x 0.03 x 0.52 | colormap | bacon prop |
| bacon-raw.glb | 0.13 x 0.03 x 0.52 | colormap | bacon, raw |
| banana.glb | 0.14 x 0.20 x 0.63 | colormap | banana prop |
| beet.glb | 0.10 x 0.27 x 0.10 | colormap | beet prop |
| bread.glb | 0.44 x 0.04 x 0.37 | - | bread slice |
| broccoli.glb | 0.38 x 0.42 x 0.38 | colormap | broccoli prop |
| burger.glb | 0.44 x 0.12 x 0.44 * | - | burger prop |
| burger-cheese-double.glb | 0.38 x 0.12 x 0.38 * | colormap | burger, cheese double |
| burger-double.glb | 0.44 x 0.12 x 0.44 * | colormap | burger, double |
| burgerCheese.glb | 0.38 x 0.12 x 0.38 * | - | burger, cheese |
| cabbage.glb | 0.38 x 0.31 x 0.40 | colormap | cabbage prop |
| cake.glb | 0.28 x 0.27 x 0.32 | - | whole cake |
| cakeBirthday.glb | 0.28 x 0.36 x 0.32 | - | cake, birthday |
| carrot.glb | 0.34 x 0.72 x 0.34 | colormap | carrot prop |
| cauliflower.glb | 0.38 x 0.31 x 0.40 | colormap | cauliflower prop |
| celery-stick.glb | 0.05 x 0.54 x 0.09 | colormap | celery, stick |
| cheese.glb | 0.34 x 0.22 x 0.17 | - | cheese prop |
| cheese-cut.glb | 0.38 x 0.02 x 0.26 | colormap | cheese, cut |
| cherries.glb | 0.09 x 0.17 x 0.16 | - | cherries prop |
| chinese.glb | 0.45 x 0.44 x 0.56 | colormap | chinese prop |
| chocolate.glb | 0.29 x 0.03 x 0.15 | colormap | chocolate prop |
| chocolate-wrapper.glb | 0.29 x 0.07 x 0.20 | colormap | chocolate, wrapper |
| coconut.glb | 0.17 x 0.14 x 0.17 * | - | coconut prop |
| coconut-half.glb | 0.25 x 0.12 x 0.25 | colormap | coconut, half |
| cookie.glb | 0.22 x 0.05 x 0.19 | - | cookie prop |
| cookieChocolate.glb | 0.12 x 0.06 x 0.14 | - | cookie, chocolate |
| corn.glb | 0.34 x 0.32 x 0.30 | colormap | corn prop |
| corn-dog.glb | 0.60 x 0.07 x 0.24 * | colormap | corn, dog |
| croissant.glb | 0.35 x 0.19 x 0.48 | - | croissant prop |
| dim-sum.glb | 0.16 x 0.12 x 0.19 | colormap | dim, sum |
| donut.glb | 0.24 x 0.09 x 0.28 | - | donut prop |
| donutChocolate.glb | 0.24 x 0.09 x 0.28 | - | donut, chocolate |
| donutSprinkles.glb | 0.24 x 0.10 x 0.28 | - | donut, sprinkles |
| egg.glb | 0.12 x 0.17 x 0.13 | - | whole egg |
| egg-cooked.glb | 0.41 x 0.03 x 0.38 | colormap | egg, cooked |
| egg-half.glb | 0.12 x 0.11 x 0.13 | colormap | egg, half |
| eggplant.glb | 0.20 x 0.41 x 0.22 | colormap | eggplant prop |
| fish.glb | 0.20 x 0.32 x 0.62 | colormap | single fish |
| fish-bones.glb | 0.31 x 0.07 x 0.64 | colormap | fish, bones |
| fries.glb | 0.16 x 0.24 x 0.27 * | colormap | fries prop |
| fries-empty.glb | 0.16 x 0.24 x 0.27 | colormap | fries, empty |
| frikandel-speciaal.glb | 0.81 x 0.78 x 0.33 * | colormap | frikandel, speciaal |
| ginger-bread.glb | 0.26 x 0.03 x 0.24 | colormap | ginger, bread |
| grapes.glb | 0.28 x 0.42 x 0.24 | - | grapes prop |
| hot-dog-raw.glb | 0.59 x 0.10 x 0.11 | colormap | hot, dog raw |
| hotDog.glb | 0.46 x 0.63 x 0.20 * | - | hot, dog |
| ice-cream-cne.glb | 0.18 x 0.30 x 0.21 | colormap | ice, cream cne |
| ice-cream-cup.glb | 0.20 x 0.18 x 0.23 | colormap | ice, cream cup |
| ice-cream-scoop-chocolate.glb | 0.23 x 0.17 x 0.27 | colormap | ice, cream scoop chocolate |
| ice-cream-scoop-mint.glb | 0.23 x 0.14 x 0.27 * | colormap | ice, cream scoop mint |
| iceCream.glb | 0.23 x 0.46 x 0.27 | - | ice, cream |
| leek.glb | 0.27 x 0.85 x 0.27 | colormap | leek prop |
| lemon.glb | 0.17 x 0.22 x 0.20 | - | lemon prop |
| lemon-half.glb | 0.17 x 0.11 x 0.20 | colormap | lemon, half |
| loaf.glb | 0.58 x 0.44 x 0.37 | - | loaf prop |
| loaf-round.glb | 0.77 x 0.29 x 0.51 | colormap | loaf, round |
| loafBaguette.glb | 0.83 x 0.25 x 0.25 | - | loaf, baguette |
| lollypop.glb | 0.04 x 0.38 x 0.19 | colormap | lollypop prop |
| maki-roe.glb | 0.12 x 0.09 x 0.10 | colormap | maki, roe |
| maki-vegetable.glb | 0.12 x 0.07 x 0.10 | colormap | maki, vegetable |
| makiSalmon.glb | 0.12 x 0.07 x 0.10 | - | maki, salmon |
| meat-cooked.glb | 0.48 x 0.06 x 0.57 | colormap | meat, cooked |
| meat-patty.glb | 0.30 x 0.06 x 0.34 | colormap | meat, patty |
| meat-raw.glb | 0.48 x 0.06 x 0.57 | colormap | meat, raw |
| meat-ribs.glb | 0.54 x 0.06 x 0.38 | colormap | meat, ribs |
| meat-sausage.glb | 0.15 x 0.07 x 0.39 | colormap | meat, sausage |
| mincemeat-pie.glb | 0.53 x 0.17 x 0.61 | colormap | mincemeat, pie |
| muffin.glb | 0.30 x 0.25 x 0.26 | - | muffin prop |
| mushroom.glb | 0.13 x 0.14 x 0.14 | colormap | mushroom prop |
| mushroom-half.glb | 0.06 x 0.14 x 0.14 | colormap | mushroom, half |
| mussel.glb | 0.09 x 0.04 x 0.15 | colormap | mussel prop |
| mussel-open.glb | 0.10 x 0.11 x 0.15 * | colormap | mussel, open |
| onion.glb | 0.21 x 0.25 x 0.25 | colormap | onion prop |
| onion-half.glb | 0.11 x 0.25 x 0.25 | colormap | onion, half |
| orange.glb | 0.17 x 0.16 x 0.17 | - | orange prop |
| paprika.glb | 0.17 x 0.20 x 0.17 | colormap | paprika prop |
| paprika-slice.glb | 0.16 x 0.03 x 0.16 | colormap | paprika, slice |
| pear.glb | 0.20 x 0.27 x 0.20 | - | pear prop |
| pear-half.glb | 0.10 x 0.27 x 0.20 | colormap | pear, half |
| pepper.glb | 0.10 x 0.08 x 0.32 | colormap | pepper prop |
| pie.glb | 0.95 x 0.15 x 0.95 | colormap | pie prop |
| pineapple.glb | 0.24 x 0.47 x 0.24 | - | pineapple prop |
| pizza.glb | 0.61 x 0.05 x 0.43 * | - | whole pizza |
| popsicle.glb | 0.07 x 0.49 x 0.18 | colormap | popsicle prop |
| popsicle-chocolate.glb | 0.10 x 0.49 x 0.20 | colormap | popsicle, chocolate |
| popsicle-stick.glb | 0.02 x 0.34 x 0.04 | colormap | popsicle, stick |
| pudding.glb | 0.25 x 0.20 x 0.29 | colormap | pudding prop |
| pumpkin.glb | 0.42 x 0.23 x 0.42 | - | whole pumpkin |
| pumpkin-basic.glb | 0.42 x 0.30 x 0.36 | colormap | pumpkin, basic |
| radish.glb | 0.34 x 0.58 x 0.34 | colormap | radish prop |
| rice-ball.glb | 0.08 x 0.13 x 0.12 | colormap | rice, ball |
| salad.glb | 0.50 x 0.27 x 0.58 | colormap | salad prop |
| sandwich.glb | 0.39 x 0.05 x 0.39 * | colormap | sandwich prop |
| sausage.glb | 0.37 x 0.12 x 0.14 | colormap | sausage prop |
| sausage-half.glb | 0.18 x 0.12 x 0.14 | colormap | sausage, half |
| skewer.glb | 0.60 x 0.07 x 0.06 * | colormap | skewer prop |
| skewer-vegetables.glb | 0.60 x 0.11 x 0.09 * | colormap | skewer, vegetables |
| strawberry.glb | 0.12 x 0.18 x 0.12 | - | strawberry prop |
| sub.glb | 0.27 x 0.10 x 0.66 * | colormap | sub prop |
| sundae.glb | 0.22 x 0.62 x 0.26 * | colormap | sundae prop |
| sushiEgg.glb | 0.11 x 0.07 x 0.17 * | - | sushi, egg |
| sushiSalmon.glb | 0.11 x 0.07 x 0.17 * | - | sushi, salmon |
| taco.glb | 0.43 x 0.26 x 0.11 | - | taco prop |
| tomato.glb | 0.17 x 0.14 x 0.17 | colormap | tomato prop |
| tomato-slice.glb | 0.18 x 0.03 x 0.18 | colormap | tomato, slice |
| turkey.glb | 0.75 x 0.31 x 0.65 * | - | turkey prop |
| waffle.glb | 0.32 x 0.04 x 0.32 | colormap | waffle prop |
| watermelon.glb | 0.33 x 0.69 x 0.23 * | - | watermelon prop |
| wholeHam.glb | 0.38 x 0.44 x 0.64 | - | whole, ham |
| wholer-ham.glb | 0.44 x 0.51 x 1.08 * | colormap | wholer, ham |

**Kitchenware, packaging, drinks**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bag.glb | 0.31 x 0.84 x 0.58 * | - | bag prop |
| bag-flat.glb | 0.65 x 0.19 x 0.47 | colormap | bag, flat |
| barrel.glb | 0.76 x 0.68 x 0.68 | - | wooden barrel |
| bottle-musterd.glb | 0.69 x 1.89 x 0.80 * | colormap | bottle, musterd |
| bottleKetchup.glb | 0.69 x 1.89 x 0.80 * | - | bottle, ketchup |
| bottleOil.glb | 0.14 x 0.61 x 0.14 | - | bottle, oil |
| bowl.glb | 0.54 x 0.23 x 0.62 * | colormap | bowl prop |
| bowl-broth.glb | 0.53 x 0.29 x 0.58 * | colormap | bowl, broth |
| bowl-cereal.glb | 0.50 x 0.42 x 0.64 | colormap | bowl, cereal |
| bowl-soup.glb | 0.50 x 0.21 x 0.58 | colormap | bowl, soup |
| cake-slicer.glb | 0.72 x 0.07 x 0.19 | colormap | cake, slicer |
| can.glb | 0.30 x 0.32 x 0.30 | - | can prop |
| can-open.glb | 0.30 x 0.41 x 0.30 | colormap | can, open |
| can-small.glb | 0.30 x 0.14 x 0.30 | colormap | can, small |
| candy-bar.glb | 0.29 x 0.07 x 0.07 | colormap | candy, bar |
| candy-bar-wrapper.glb | 0.29 x 0.08 x 0.12 | colormap | candy, bar wrapper |
| carton.glb | 0.23 x 0.59 x 0.23 | colormap | carton prop |
| carton-small.glb | 0.23 x 0.39 x 0.23 | colormap | carton, small |
| cheese-slicer.glb | 0.62 x 0.03 x 0.19 | colormap | cheese, slicer |
| chopstic-decorative.glb | 0.02 x 0.02 x 0.45 | colormap | chopstic, decorative |
| chopstick.glb | 0.02 x 0.02 x 0.45 | colormap | chopstick prop |
| cocktail.glb | 0.26 x 0.41 x 0.30 * | colormap | cocktail prop |
| cooking-fork.glb | 0.68 x 0.07 x 0.07 | colormap | cooking, fork |
| cooking-knife.glb | 0.72 x 0.04 x 0.13 | colormap | cooking, knife |
| cooking-knife-chopping.glb | 0.60 x 0.04 x 0.22 | colormap | cooking, knife chopping |
| cooking-spatula.glb | 0.68 x 0.07 x 0.19 | colormap | cooking, spatula |
| cooking-spoon.glb | 0.67 x 0.02 x 0.17 | colormap | cooking, spoon |
| cup.glb | 0.20 x 0.20 x 0.23 | - | paper cup |
| cup-coffee.glb | 0.22 x 0.14 x 0.29 | colormap | cup, coffee |
| cup-saucer.glb | 0.36 x 0.04 x 0.36 | colormap | cup, saucer |
| cup-tea.glb | 0.24 x 0.20 x 0.29 | colormap | cup, tea |
| cupcake.glb | 0.38 x 0.19 x 0.33 * | - | cupcake prop |
| cutting-board.glb | 0.58 x 0.06 x 0.82 | colormap | cutting, board |
| cutting-board-japanese.glb | 0.49 x 0.08 x 0.84 | colormap | cutting, board japanese |
| cutting-board-round.glb | 0.80 x 0.06 x 0.80 | colormap | cutting, board round |
| egg-cup.glb | 0.16 x 0.15 x 0.18 | colormap | egg, cup |
| frappe.glb | 0.25 x 0.50 x 0.25 | colormap | frappe prop |
| frying-pan.glb | 0.66 x 0.12 x 1.02 | colormap | frying, pan |
| frying-pan-lid.glb | 0.58 x 0.11 x 0.61 | colormap | frying, pan lid |
| ginger-bread-cutter.glb | 0.29 x 0.04 x 0.27 | colormap | ginger, bread cutter |
| glass.glb | 0.16 x 0.28 x 0.18 | colormap | glass prop |
| glass-wine.glb | 0.23 x 0.50 x 0.20 | colormap | glass, wine |
| honey.glb | 0.33 x 0.32 x 0.33 | - | honey prop |
| knife-block.glb | 0.56 x 0.68 x 0.22 | colormap | knife, block |
| meat-tenderizer.glb | 0.54 x 0.12 x 0.28 | colormap | meat, tenderizer |
| mortar.glb | 0.40 x 0.21 x 0.46 | colormap | mortar prop |
| mortar-pestle.glb | 0.11 x 0.34 x 0.13 | colormap | mortar, pestle |
| mug.glb | 0.34 x 0.27 x 0.28 | - | coffee mug |
| pan.glb | 0.66 x 0.17 x 0.76 | colormap | pan prop |
| pan-stew.glb | 0.66 x 0.17 x 0.76 | colormap | pan, stew |
| pancakes.glb | 0.38 x 0.10 x 0.47 * | colormap | pancakes prop |
| peanut-butter.glb | 0.24 x 0.30 x 0.24 | colormap | peanut, butter |
| pepper-mill.glb | 0.16 x 0.55 x 0.16 | colormap | pepper, mill |
| pizza-box.glb | 0.94 x 0.09 x 0.95 | colormap | pizza, box |
| pizza-cutter.glb | 0.54 x 0.06 x 0.26 | colormap | pizza, cutter |
| plate.glb | 0.89 x 0.09 x 0.89 | colormap | plate prop |
| plate-broken.glb | 0.55 x 0.09 x 0.47 | colormap | plate, broken |
| plate-deep.glb | 0.89 x 0.09 x 0.89 * | colormap | plate, deep |
| plate-dinner.glb | 0.89 x 0.22 x 0.89 | colormap | plate, dinner |
| plate-rectangle.glb | 0.86 x 0.13 x 0.72 | colormap | plate, rectangle |
| plate-sauerkraut.glb | 0.89 x 0.17 x 0.89 | colormap | plate, sauerkraut |
| pot.glb | 0.66 x 0.36 x 0.82 | colormap | pot prop |
| pot-lid.glb | 0.66 x 0.12 x 0.63 | colormap | pot, lid |
| pot-stew.glb | 0.66 x 0.36 x 0.82 | colormap | pot, stew |
| pot-stew-lid.glb | 0.66 x 0.12 x 0.63 | colormap | pot, stew lid |
| rollingPin.glb | 0.81 x 0.14 x 0.16 | colormap | rolling, pin |
| shaker-pepper.glb | 0.10 x 0.20 x 0.10 | colormap | shaker, pepper |
| shaker-salt.glb | 0.10 x 0.20 x 0.10 | colormap | shaker, salt |
| soda.glb | 0.25 x 0.43 x 0.25 | colormap | soda prop |
| soda-can-crushed.glb | 0.25 x 0.18 x 0.25 | colormap | soda, can crushed |
| soda-glass.glb | 0.26 x 0.34 x 0.23 * | colormap | soda, glass |
| sodaBottle.glb | 0.18 x 0.56 x 0.16 | - | soda, bottle |
| sodaCan.glb | 0.23 x 0.33 x 0.23 | - | soda, can |
| soy.glb | 0.17 x 0.04 x 0.19 | colormap | soy prop |
| steamer.glb | 0.64 x 0.18 x 0.64 | colormap | steamer prop |
| styrofoam.glb | 0.98 x 0.29 x 0.76 * | colormap | styrofoam prop |
| styrofoam-dinner.glb | 0.98 x 0.33 x 1.00 * | colormap | styrofoam, dinner |
| tajine.glb | 0.82 x 0.14 x 0.86 | colormap | tajine prop |
| tajine-lid.glb | 0.76 x 0.44 x 0.79 | colormap | tajine, lid |
| utensil-fork.glb | 0.50 x 0.02 x 0.08 | colormap | utensil, fork |
| utensil-knife.glb | 0.60 x 0.02 x 0.08 | colormap | utensil, knife |
| utensil-spoon.glb | 0.48 x 0.03 x 0.12 | colormap | utensil, spoon |
| whipped-cream.glb | 0.18 x 0.13 x 0.21 * | colormap | whipped, cream |
| whisk.glb | 0.72 x 0.16 x 0.16 | colormap | whisk prop |
| wine-red.glb | 0.19 x 0.70 x 0.17 | colormap | wine, red |
| wine-white.glb | 0.20 x 0.66 x 0.18 | colormap | wine, white |

### furniture/ (23 files)

Furniture Kit (existing selection, unchanged).

**Furniture and household**

| File | W x H x D | ext | Description |
|---|---|---|---|
| bathtub.glb | 1.19 x 0.42 x 0.56 | - | bathtub, bathroom |
| bear.glb | 0.39 x 0.45 x 0.25 | - | teddy bear toy |
| bedSingle.glb | 1.62 x 0.51 x 1.89 * | - | bed, single |
| bench.glb | 0.40 x 0.47 x 0.20 | - | park bench |
| benchCushion.glb | 0.40 x 0.46 x 0.20 | - | bench, cushion |
| books.glb | 0.15 x 0.10 x 0.10 | - | stack of books |
| cardboardBoxClosed.glb | 0.21 x 0.28 x 0.21 | - | cardboard, box closed |
| cardboardBoxOpen.glb | 0.37 x 0.28 x 0.21 | - | cardboard, box open |
| chair.glb | 0.20 x 0.47 x 0.20 | - | wooden chair |
| kitchenFridge.glb | 0.43 x 0.92 x 0.32 | - | kitchen, fridge |
| lampRoundFloor.glb | 0.15 x 0.86 x 0.18 | - | lamp, round floor |
| loungeSofa.glb | 0.98 x 0.46 x 0.41 | - | lounge, sofa |
| plantSmall1.glb | 0.19 x 0.28 x 0.19 * | - | plant, small1 |
| plantSmall2.glb | 0.19 x 0.28 x 0.19 * | - | plant, small2 |
| plantSmall3.glb | 0.17 x 0.29 x 0.20 * | - | plant, small3 |
| pottedPlant.glb | 0.26 x 0.54 x 0.29 * | - | potted, plant |
| radio.glb | 0.32 x 0.23 x 0.10 | - | portable radio |
| tableCloth.glb | 0.84 x 0.33 x 0.45 | - | table, cloth |
| tableRound.glb | 0.69 x 0.37 x 0.80 | - | table, round |
| televisionVintage.glb | 0.41 x 0.27 x 0.27 | - | television, vintage |
| toilet.glb | 1.00 x 0.95 x 0.79 * | - | toilet, bathroom |
| trashcan.glb | 0.50 x 0.91 x 0.44 * | - | trash can |
| washer.glb | 0.39 x 0.50 x 0.48 | - | washing machine |

### hex/ (7 files)

Hexagon Kit (existing selection, unchanged) - tiny whole buildings.

**Buildings and large structures**

| File | W x H x D | ext | Description |
|---|---|---|---|
| unit_boat.glb | 0.65 x 0.11 x 0.69 * | - | unit, boat |
| unit_house.glb | 0.36 x 0.38 x 0.38 | - | unit, house |
| unit_houseLarge.glb | 0.36 x 0.38 x 0.61 | - | unit, house large |
| unit_mill.glb | 0.38 x 0.93 x 0.51 | - | unit, mill |
| unit_tower.glb | 0.37 x 0.82 x 0.43 | - | unit, tower |
| unit_tree.glb | 0.20 x 0.38 x 0.20 | - | unit, tree |
| unit_wallTower.glb | 0.29 x 0.35 x 0.34 | - | unit, wall tower |

