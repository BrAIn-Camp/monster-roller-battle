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
| A roster is at most 20 (12 on the floor + 8 in reserve). Anything left after merging "backs" the roster: up to +50% health and damage. They are drawn as a crowd on a stand beside the team's corner, sending sparks to the fighters as they land and jumping when the team scores. | Real armies merge down to 6-25, but a big one can still be 50+. Grinding through 40 reserves at 12 a time makes a fight last minutes, and the damage ramp then turns the reserves into confetti. | `ROSTER_CAP` in `arena-sim.js`; `BACKING` in `arena-merge.js` |
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
| 4 | (new) A monster that fights at range never got close enough to use a ring-shaped signature move (Bloom Drain, Earthshaker): Venusaur simply never fired. | With a full charge it closes in first. |
| 5 | (new) Sinking the surroundings below the platform also buried the lava pools and sea foam under the ground. | Ground lowered to where it was. |
| 6 | (new) Every fight built its own copies of the effect shapes and never freed them. | Built once and shared. |
| 7 | (existing) The arena had no music at all: the round's tune stops at "TIME UP". | A fight tune from the same synth (waiting / fighting / sudden death). |
| 8 | (existing) A hidden tab ran the whole game at a fifth of its speed. The worker that keeps a hidden tab ticking gave it one tick per quarter second, and a tick covers at most 50 ms. In multiplayer that slowed every player whenever the host's tab was hidden or covered. | The catch-up now runs as many 50 ms ticks as the gap needs (up to a second's worth). Measured: 10.0 game seconds per 10.0 real seconds in a hidden tab. |
| 9 | (new) Stampede started a third of a second after its effect played, and was cancelled outright if it began on the edge line. | It starts at once, and only stops when it runs into an edge. |
| 17 | (existing) The arena fight could not be paused: Esc did nothing there. | Esc pauses a single-player arena fight; the pause card's last button becomes "Skip to the result". |
| 18 | (existing) Sounds are one oscillator each with nothing limiting their sum, so a busy moment could clip. | A limiter before the speakers; arena hit sounds are rationed to about 14 a second. Not checked by ear (this session cannot hear). |

### Found by an independent review

Halfway through the night a second agent read the four arena files cold, with no brief beyond "find real bugs", and ran
its own thousand fights. Everything it called a definite bug is fixed:

| # | What | Fix |
|---|---|---|
| 10 | A monster could be on the floor twice. Scooped and, in the same step, freed by a clash, it was added to the list again before it had left it: for about nine seconds it moved, attacked and charged at double speed and was hit twice by every area move. Seen in 1 fight in 600. | `drop()` checks before adding. |
| 11 | Rock Slide's falling rocks changed two settings on a material borrowed from a shared pool and never put them back. After the first Rock Slide, the next six things to borrow one (move outlines, the Toxic Pool, the ice block on a frozen monster) drew solid instead of see-through. | Rocks use a lit material of their own kind; nothing changes a pooled material. |
| 12 | Monsters were left behind in memory after a fight: the ones riding a ball at the end, and (when a fight was skipped) everything that fell during the skipped stretch. With the models on, each is a skeleton, an animation mixer and a material. | Every fighter made is tracked until it is let go, and `destroy()` lets go of whatever is left. |
| 13 | A monster freed from a ball that had just rolled off was stunned for 0.4 s on the very edge, and a stunned monster has no grip there: about 1 in 25 fell straight off again. | Freed monsters are "busy", not stunned, and are put a little further in. |
| 14 | A rally's bonus (faster wind-up, 20% harder) survived the wind-up being broken and applied to that monster's next move, however much later. | Cleared when a wind-up breaks. |
| 15 | The fight stops dead at the last knockout, but for the next six seconds the screen still drew it: shots hung in the air, telegraphs stayed on the floor, stunned monsters kept wobbling. | Entering the finish lets go of everything in mid-air or half wound up. |
| 16 | `skip()` on the fight itself did not refuse a multiplayer fight (only the game's own key handler did). | It refuses. |

And one it called "suspicious": the fight used `Math.hypot`, `Math.exp`, `Math.cbrt`, `Math.log`, `**` and the trig
functions, none of which are guaranteed to give the same last bit in every browser. Two tabs of one browser cannot show
that, and the old arena had the same weakness. A fight replayed on Chrome and on Firefox could drift apart. The fight now
uses only adding, multiplying, dividing and square roots (exact everywhere), with its own short `sin`, `cos`, decay and
cube root built from those. **Not verified across two different browsers**: that needs a Chrome player and a Firefox or
Safari player in one room.

## Checked

- `node tools/arena-test/headless.mjs smoke`: every arena, positions finite on every step, the same seed gives the same
  fight twice, degenerate armies (none, one team only, 3 against 400), and 300 random armies through the merger with the
  bookkeeping checked (what goes into the roster adds up to what was brought).
- Two browser tabs in a `?net=local` room: both played the arena fight from the host's steps and ended with the same
  winner, time and top fighter. No "ended differently" warning on the client.
- The whole round in the browser, single player: wheel, merge intro, drop, fight, finish, results. No console errors.
- Skipping during the intro and mid-fight, leaving mid-fight, three fights in a row, resizing the window.
- The stand-in build (`?models=0` on the test page): generated critters fight with the same moves and effects.
- Cost: about 4 ms a frame for the fight and its drawing with 48 animated models on the floor (test page, this machine).

## Balance (headless, 800 fights, armies of 14 to 195 critters)

| Measure | Result |
|---|---|
| Decided by knockout | 100% (none reached the 150 s safety net) |
| Length | median 53 s; one in ten under 42 s, one in ten over 62 s |
| First knockout | about 5 s in |
| Knockouts that are ring-outs | 28% |
| Signature moves per fight | about 80 (of which about 21 are rallies by the CPU balls) |
| Balls lost per fight | 1.1 of 4 (CPU) |
| The strongest army wins | 50% (2nd strongest 29%, 3rd 14%, 4th 7%) |
| Wins by seat, identical armies | 24 / 28 / 24 / 23% over 600 fights |
| Between arenas | 49 to 54 s, ring-outs 26 to 32% |

What was changed to get there: health x1.5 (fights were over in 40 s, before sudden death ever started), signature moves
charge in 17 s rather than 11 (there were 120 a fight), and 2 s between a ball's rallies.

Run it yourself: `node tools/arena-test/headless.mjs 400`. Try a number without editing: `... tune=RAMP_AT:60,HP_SCALE:12`.

## Not verified, and known rough edges

**I could not watch it move or hear it.** Everything here was checked from still frames stepped one at a time, from
numbers, and from the console. Nobody has sat and played a round. The things most likely to need your eye and ear:

- *Feel.* Whether a ram, a rally and a ring-out feel as good as the numbers say. Steering is the same ball as before,
  with no walls to save it.
- *Sound.* The fight tune, the per-type hit sounds and the limiter have never been heard. If the mix is wrong, the tune's
  volumes are in `fightTick` (`main.js`) and the hit sounds in `SND` (`arena-battle.js`).
- *Animation timing.* A model's attack clip is 1.3 to 6 s long as extracted; it is squeezed to 0.4 to 0.85 s for an
  ordinary hit and to the wind-up plus half a second for a signature move. Some species will look hurried.
- *Two different browsers in one room.* See bug 16's note: built to agree, tested only Chrome against Chrome.
- *A ball out for the fight.* As you chose. A player who rolls off in the first seconds watches the rest (their monsters
  fight on). If that grates, a respawn is a few lines in `ballOut` (`arena-sim.js`).

Smaller things, left as they are:

- A team whose only surviving monsters are inside a rival's ball is out, and the fight can end with them still in it.
- The floor cap of 12 is soft: a monster freed from a ball comes back on top of the reserves that replaced it (14 seen).
- A monster nudged just past the edge line snaps back rather than stepping back.
- The stand-in build (no models) fights with the same moves, but its critters have no clips: they lean, lunge, squash
  and breathe instead.
- `battle.js` (the old plain battle) is still there as the fallback if `arena.js` fails to load. Untouched.
- `tools/events-test.mjs` was already broken before tonight and still is.

**Not arena work, but you should know:** the Stadium models are committed and pushed (`models/stadium/`, 1,231 files),
while `models/stadium/README.md`, `critters/local-mode.js` and `CREDITS.md` all still say they are not distributed. I
did not touch that. The arena uses them whenever the folder is there, and falls back to the generated critters when it
is not.

## What to try first

1. `python tools/serve.py 8417`, open http://127.0.0.1:8417/, play a round. The arena starts after the wheel.
2. In the arena: roll through one of your own monsters (the gold dotted trail points at one), ram a rival near the edge,
   and keep your own ball on the floor. Shift or Space dashes, Esc pauses, holding Enter skips.
3. For the arena alone: http://127.0.0.1:8417/tools/arena-test/ (R restarts, 1-8 pick an arena, `?cpu` to just watch).
4. `node tools/arena-test/headless.mjs 400 moves` for the balance report.
