# Battle Revolution models (optional, never in the repository)

These tools turn the creature models of a Pokémon Battle Revolution (Wii) disc image into the `.glb` + `meta.json`
layout that `critters/stadium.js` loads. They contain no game data. **What they write is not distributed with the
game**: `models/pbr/` is in `.gitignore`, and every file under it is made on your own machine from a disc you own.
Do not commit or publish it.

All of it is plain Node (22.15 or later, for its built-in zstd), with nothing to install.

## Steps

1. Pull the model archives out of the disc image (`.rvz`; partition 1 is the game):

   ```
   node tools/pbr/rvz.mjs "<image.rvz>" info
   node tools/pbr/rvz.mjs "<image.rvz>" extract 1 "<folder outside the project>" pkx_
   ```

   That writes 495 `pkx_NNN.fsys` files, about 370 MB.

2. Convert them:

   ```
   node tools/pbr/convert.mjs "<that folder>" models/pbr
   ```

   493 models, about 113 MB, a minute or so. Options: `--only 1,25,152-251`, `--atlas 128`, `--triangles 800`,
   `--fps 30`, `--png` (also writes each model's texture beside it, to look at).

3. Check them: `node tools/pbr/check.mjs models/pbr` plays every clip of every model through and reports anything
   that flies apart. About two dozen findings are expected and harmless: a few species are scaled up by a bone
   (the whale is five times its mesh), and wings and long bodies rest folded.

4. Look at one: run `python tools/serve.py` and open
   `http://127.0.0.1:8417/tools/stadium-view.html?stadium=/models/pbr/`.

## What comes out, and why it is the size it is

The budgets are set to match the Stadium (N64) models the game already used, so a species costs the same to draw
whichever set it comes from.

| | Stadium set (151) | This set (493) | As stored on the disc |
|---|---|---|---|
| triangles, median | 690 | 799 (never over about 800) | 822, and 2,760 for the fourth generation |
| bones, median | 42 | 39 | 76 |
| textures | about 13 of 32x32 | one of 128x128 | about 8, mostly 512 wide |
| draw calls once loaded | 1 after a merge at load time | 1, no merge needed | |
| file, mean | 508 KB | 240 KB | 577 KB unpacked |

- **Triangles.** Anything over the budget is brought down by collapsing edges, cheapest first (`simplify.mjs`).
  Vertices only ever move onto a neighbour, so texture coordinates and skin weights stay exact; texture seams and
  open edges keep their outline.
- **One small texture.** Each material's triangles are slid back by whole tiles, the part of the texture they cover
  is cut out with its tiling and mirroring baked in, and the pieces are packed into one 128x128 sheet at an even
  texel density. The game then has one mesh on one clamped texture, which is what its shared skin sheet wants
  (a 128 sheet takes four of its 64-pixel cells).
- **Bones.** Only bones with a vertex on them, and their ancestors, are kept. Effect locators, lights, hit volumes
  and particle emitters go.
- **Clips.** Six, under the game's names: `idle` (wait), `attack` (tackle, punch, kick...), `attack_2` (kime),
  `faint` (down), `flinch` (damage), `run`. The curves are sampled at 30 a second and every key that a straight
  line between its neighbours would reproduce is dropped. Each clip is cut to the length the file gives the action:
  an idle's curves can run on for half a minute (an occasional fidget on a period of its own), and only the
  breathing loop is taken.

## Not carried over

- Blinking and sleeping eyes (`tx_wink`, `tx_sleep`, `tx_wakeup`: texture animation).
- Flames, gas and other effects (particle emitters, not meshes).
- Shiny colours and the other forms in an archive: the first model of each archive is the one converted.
- Semi-transparent surfaces are cut out at half alpha, as the game's materials expect.

## The format, briefly

`rvz.mjs` reads the image (Dolphin's `docs/WiaAndRvz.md`), `fsys.mjs` unpacks an archive (LZSS), `sdr.mjs` reads a
model: a header with lists of skeletons, textures and materials; bones as a tree of records (joints carry an
inverse bind matrix, other nodes carry Maya-style pivots); meshes as GX display lists over float arrays; skin
weights as runs; animation as per-bone curves, keyed (constant, linear or cubic with a slope either side) or as
a row of values at 60 a second. The layout follows the community's notes in
github.com/bgsamm/pbr-models-import-export, corrected against the files (attribute records are 8 bytes; an
action record holds its loop and length; stored slopes are per segment). `pose.mjs` holds the bone maths.
