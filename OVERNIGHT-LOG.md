# Overnight log: the arena overhaul (21-22 November 2026)

Branch `arena-overhaul`, one commit per piece of work, nothing pushed. This file is the running record: what was
built, the decisions taken without you, and every bug or rough edge found along the way (fixed or not).

## What was asked for

1. Merging: three of a kind become the next stage; triples that cannot evolve become a starred version.
2. Up to 12 a side on the floor, the rest in reserve.
3. The Pokemon models in the arena, with their animations.
4. An intro that shows the merging, by animation rather than text.
5. No walls: a monster knocked off is out (flyers can recover), a ball that falls is out for the fight.
6. Attacks worth watching, with knockback.
7. Signature moves.
8. The ball retooled: ram, interrupt, rally.
9. Knockout drama; damage ramps after 45 s instead of a health count.
10. Balance test last, once everything is in.

## Decisions taken without you (all one constant or a few lines to change)

| Decision | Why | Where |
|---|---|---|
| A roster is at most 20 (12 on the floor + 8 in reserve). Anything left after merging "backs" the roster: up to +50% health and damage. | Real armies merge down to 6-25, but a big one can still be 50+. Grinding through 40 reserves at 12 a time makes a fight last minutes, and the damage ramp then turns the reserves into confetti. | `ROSTER_CAP` in `arena-sim.js`; `BACKING` in `arena-merge.js` |
| A merged monster gets a health and damage boost so it is worth 1.5x the monsters that went into it. | By the old power formula one Ivysaur is worth about half of three Bulbasaur: merging would have punished collecting. | `MERGE_GAIN` in `arena-merge.js` |
| Eevee becomes the form the arena favours, else the three forms take turns. | It is the only branching line; it has to be the same on every machine. | `pickBranch` in `arena-merge.js` |
| Drawn sizes are compressed: a monster N times taller than typical is drawn root-N times bigger, within 0.62x to 2.5x. | Twelve a side has to be readable from one camera. Before this a Gyarados covered a fifth of the floor and a Rattata was a speck. Stats still use real height. | `H_TARGET`, `H_MIN`, `H_MAX` in `arena-sim.js` |
| Balls are smaller (about 1.3x a typical monster's height) and scoop only the very smallest monsters. | You asked for scooping to stay "for anything still small". With merged armies a scoop is a permanent removal, so it has to be rare. | `BALL_BASE`, `SCOOP_RATIO` in `arena-sim.js` |
| The camera closes in as the floor empties (it never turns, so steering does not change), and pushes in hard on the last knockout. | With 48 monsters the whole floor has to be in view; with 6 left they were ants. | the camera block at the end of `view()` in `arena-battle.js`, `CAM_CLOSE` |
| Skipping the arena fight is now HOLD Enter (0.7 s), not a tap of Space. | Space is also the arena's dash key. One reflex tap threw the whole fight away. | `SKIP_HOLD` in `main.js` |
| When a ball falls, whatever it had scooped scrambles back onto the floor. | Otherwise knocking a ball off would also delete your own scooped monsters. | `ballOut` in `arena-sim.js` |
| A hazard's slow push (wave, sandstorm) cannot carry a monster off unless it is stunned or tumbling. Balls get no such grip. | Otherwise one gust dumped half an army into the void before anyone had done anything. | `shove` in `arena-sim.js` |

## How it is built now

- `arena-merge.js`: the merging rules. A pure function of the army and the arena, so multiplayer machines agree.
- `arena-sim.js`: the whole fight with no drawing in it. One seeded dice, fixed steps in multiplayer. Everything
  that happens is pushed onto `sim.events`.
- `arena-battle.js`: watches the sim and draws: scene, fighters, effects, sound, HUD, the merge intro, the camera.
- `arena-fx.js`: particles and effect shapes. Uses its own cosmetic dice, never the fight's.
- `arena-ui.js`: style sheet and DOM helpers. `arena.js`: the arena list and the wheel.
- `tools/arena-test/headless.mjs`: runs the real fight hundreds of times with no screen (see "Balance" below).
- `tools/arena-test/`: the try-out page. New: `?seed=`, `?only=1,4,7`, `?speed=`, `?models=0`, `?manual` (frame stepping).

## Bugs found and fixed

| # | What | Fix |
|---|---|---|
| 1 | (new) The Stampede move pushed a rival ball every step it overlapped, not once: balls reached 400 m/s, and a ram at that speed drew a white ring 90 m wide over the whole screen. | The push happens once per charge; ball speed and ram distance are capped. |
| 2 | (existing, local build) Effect flipbook textures (fire tails, gas) were marked for upload before their file had arrived, so the renderer logged a warning every frame until it did. | `texFor` in `critters/stadium.js` no longer marks them; the loader does when the file lands. |
| 3 | (existing) Space both dashed and skipped in the arena. | Hold Enter to skip (see decisions). |

## Still to do / known rough edges

(kept up to date as the night goes on; see the end of the file for the final state)
