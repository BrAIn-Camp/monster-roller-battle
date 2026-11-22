# Stadium close-up models (optional, not in the repository)

The dex pop-up card can show the Pokemon Stadium (N64) battle model for a slot instead of the
generated critter mesh. **These files are not distributed with the game.** `models/stadium/` is in
`.gitignore`; every file under it is generated on your own machine from a cartridge you own, and
the game works normally when the folder is absent — `critters/stadium.js` resolves to `null` and
the caller falls back to `buildCreature`.

## Regenerating

1. Clone the extractor (original code, builds on the [pret/pokestadium](https://github.com/pret/pokestadium)
   decompilation; no ROM data is committed to it):

   ```
   git clone --depth 1 https://github.com/scottcandy34/DramaticShapeVoxelMod-latest
   ```

2. Run the pipeline against a **US v1.0** ROM (`.z64`, 32 MB, internal name `POKEMON STADIUM`,
   cart `NPO`, version 0, md5 `ed1378bc12115f71209a77844965ba50`). It is Python 3, stdlib only:

   ```
   python DramaticShapeVoxelMod-latest/model_extract/pipeline/build.py --rom=PATH --out=OUT
   ```

   That writes `OUT/glb/` (215 models), `OUT/textures/`, `OUT/js/` and `OUT/manifest.json`.

3. Populate this folder from that output with `tools/make-stadium-meta.py`:

   ```
   python tools/make-stadium-meta.py OUT models/stadium
   ```

   It copies the 151 species' `.glb`, writes `meta.json`, and copies only the loose PNGs that get
   swapped in at run time (eye frames and effect flipbooks) rather than the whole texture set.

## What is here

| path | what |
|---|---|
| `glb/NNN_name.glb` | 151 species, glTF 2.0, skinned, animated, textures embedded. ~495 KB each, 74 MB total |
| `meta.json` | ~440 KB: per species, the animation list, the eye-swap streams and the effect prims |
| `tex/NNN_name/` | only the PNGs swapped at run time, ~2 MB total |

Loaded one at a time, on demand, by `critters/stadium.js`. Nothing is fetched until a card shows.

## Notes

- **Textures are tiny.** N64 texture memory is 4 KB, so these are 32x32 and 32x64. The whole set is
  about 8 MB; the 74 MB is geometry and animation. They are magnified with `NearestFilter`, since
  linear filtering smears a 32-pixel texture into mush at card size.
- **Blinking is not in the `.glb`.** glTF 2.0 has no texture-swap animation channel, so the eye
  frames are per-frame index streams in `meta.json` and `critters/stadium.js` swaps `material.map`.
  143 of the 151 species have one.
- **The fire and gas are not game data.** The real effects are drawn by the battle fragments and are
  absent from the model files — Charmander's texture set is eyes, claws, teeth and skin, no flame.
  The pipeline generates original procedural flipbooks on crossed quads, tagged `generated` and
  named `*_fx.png`. 8 species, 63 effect prims. They are drawn unlit and additive (gas: alpha).
