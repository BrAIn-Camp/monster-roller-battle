# Crossway Continent: research and design notes

Written overnight on 19-20 November 2026 alongside the rework of the four-team round.
It covers what the research found, how the new map, round and finale are built on it, where every number lives, and what is still rough.

## 1. What the research found

Two research passes were run (web sources; the Fandom wikis and GameFAQs block automated readers, so some detail rests on
reviews, Wikipedia, the Takahashi post-mortem, WiKirby and speedrun notes; anything unverified was left out of the design).

### Katamari series: what makes a level work

| Finding | Source of the idea | How it is used here |
|---|---|---|
| Few maps, re-read at many scales: a thing is a wall, then a prize. | Takahashi post-mortem; "Prince of Objects" essay | Every habitat holds 2-16 m scenery that blocks small balls and feeds big ones. |
| A continuous size ladder: in one room the pick-up sizes run 2 cm to 1.2 m with rungs seldom more than 1.5x apart. | Speedrun pick-up-size sheet | Rungs 1.45x apart from 7 cm to 12.5 m; `tools/map-report.mjs` counts every habitat per rung. |
| Pace: Make the Moon is about one doubling every 3 minutes; speedruns manage one every 47 seconds. | Reroll timings | Our round needs five doublings in five minutes, so density is tuned for one a minute. |
| Placement is authored, not scattered: lines, rings, stacks, people-doing-things scenes, one joke per cluster. Random-feeling placement is the main criticism of the 2025 game. | Reviews of We Love Katamari Reroll and Once Upon a Katamari | Habitat files are built from scene functions (a hockey match, a dig site, a pit crew); scatter is kept for ground cover only. |
| Large tiers are filled with giant versions of small things. | Takahashi | Giant snowman, saguaro, toadstool, prize pumpkin, battery, coconut. |
| Loops and branches are loved; mazes, corridors, wedging and camera-blocking walls are hated. | Steam favourites thread; reviews | Open compass-rose layout, no walls, lanes 1.5x the expected ball, no closed pens. |
| Hard gates must be true at the stated size; stray bumps past a gate frustrate. | Once Upon a Katamari reviews | Gating is by terrace height only (a ball climbs 40% of its width), verified by tool. |
| Late-level drought ("you struggle to find new things") is a known flaw. | WLK reviews | Critter waves at each phase, everything rolled up returns at 0:45, and the titans arrive. |
| Living things: bigger ones charge, smaller ones flee; simple patrols are enough. | Wikipedia; cousin guides | Kept from the existing game (timid / calm / curious / bold tempers). |
| Versus modes: restocking, loot knocked off on a ram (5-10 things in Beautiful Katamari), slower big balls. Criticised as shallow. | Wikipedia; KatamariBall coverage | Rams now drop 3 things (9 during Static Storm); events give the round its structure. |
| Players forget how small they started. | Takahashi's stated regret | The results card shows 60 cm -> final size and the multiple. |

Liked levels: plain "as large as possible", the branching sea level, racing, underwater. Disliked: instant-fail touches (Cowbear),
upkeep timers (campfire), unreadable rules (fireflies, sweet/sour), tedium (snowman, 50 objects). None of the disliked patterns are used.

### Kirby Air Ride / Air Riders: City Trial

| Finding | How it is used here |
|---|---|
| Events are announced with a siren, a text box, a music change, a red arrow with distance and a flashing "!" on the minimap. | Same set: siren, banner, HUD chip with a draining bar, a beam of light and ground ring in the world, HUD arrow with distance, pulsing "!" on the new minimap. |
| Air Riders runs three events in a five-minute round; the original fires one every 55-125 s. | About five per round at fixed marks (shown as pips on the phase bar), one of them always the oracle. |
| Liked: located, contestable, opt-in events (Dustup Derby, bosses, vaults, UFO). Disliked: global control-scramblers. | 13 of the 14 events are located and contestable; the one global modifier (Static Storm) is short and still gives a target. |
| At 30 s left the music changes to a faster track. | Music tempo steps up each phase; the last phase starts at 0:45 with a red pulsing clock, and the last 10 s are counted on screen. |
| Stadium choice: four cards, a "Recommended" star, a vote; stadiums favour stats. Predictions hint at the stadium and are about 80% true. Reviews call the finale anticlimactic when it lasts seconds. | A wheel reveals one of eight arenas, each favouring three types; the Oracle's Whisper event hints at it and is right four times in five; the arena fight lasts up to 75 s and every player keeps a ball to play with. |
| Mario Kart rocket start: press and hold accelerate just after the 2 lands; too early stalls. | Same rule (section 4). |
| Fixed-camera party minigames: under about 60-75 s, one shared readable view, eliminated players keep playing, 3-2-1-GO and a FINISH freeze. | The arena follows all of these (section 6). |

## 2. The map

`map.js` paints the terrain; `habitats/*.js` dress it; `tools/map-image.mjs` draws it from above.

- One continent, 480 m square, like a region with many climates. North is cold, the south-east hot and dry, the south-west wet.
- **Crossway Green** (hub, radius 50 m) is a bowl with a 35 cm lip: a ball must reach about 90 cm to leave.
  All four teams start 30 m from the feast in the middle, on identical pads, in a four-fold symmetric fairground.
- Eight wedges, each an inner habitat (50-122 m) and an outer one (122 m to the coast):

| Wedge | Inner habitat | Outer habitat | What guards the outer one |
|---|---|---|---|
| N | Frostfall Tundra | Rimepeak (summit, 26 m peak) | 1.2 m terraces (3 m ball) |
| NE | Stormworks (power station) | Thunder Crags (18 m crag) | 1.2 m terraces |
| E | Cinder Flats (hot springs) | Mount Kiln (crater lake of lava) | 1.2 m terraces |
| SE | Sunscar Canyon (mesas, oasis) | Temple of Echoes (ziggurat) | 0.8 m step (2 m ball) |
| S | Shellsand Beach | Tide Pools, Pearl Bay, the Islets | the sea (3 m ball) |
| SW | Mirewater Marsh | Gloomrest (graveyard) | 0.8 m step |
| W | Whisperwood | Echo Gorge | 1.2 m plateau; a side canyon lets small balls onto the gorge floor |
| NW | Honeyfield Farms | Windmill Prairie | nothing: rolling hills, the one open route |

- Borders wander (noise on angle and radius) and the ground colours speckle into each other across about 13 m; each habitat file adds mixed-theme scenes on its side of every border.
- A river runs from the Rimepeak glacier down the west side, through the gorge and the marsh, to the sea.
- Three new habitats were added for critters: **tundra** (ice types), **works** (electric types) and **graveyard** (ghosts). `REHOME` and `GUESTS` in `map.js` say who moved.
- Critters are placed by habitat, and within it by size: small species near the Green, large ones far out (`critterSpot` in `main.js`).
- Titans (every species at ten times its size) appear only in the last 45 seconds, far out in their habitats.

## 3. The round, phase by phase

| Phase | Clock | What happens | How the player is told |
|---|---|---|---|
| Fly-over | before 5:00 | Camera circles the Green showing all four teams, then drops behind the player. Space skips. | Title card |
| Countdown | 3-2-1-GO | Start lights, rocket-start timing | Lights, big digits, hint pill |
| 1 Scramble | 5:00-3:45 | Sprint for the feast (Grand Tart in the middle), grow to 90 cm, leave the bowl | Phase bar segment, hint "Grow to 90 cm" |
| 2 Expedition | 3:45-2:00 | Critter wave; events begin | Banner, jingle, sky shift, faster music |
| 3 Frenzy | 2:00-0:45 | Second wave; "one minute" call | Banner, warm sky |
| 4 Titan Hour | 0:45-0:00 | Titans appear, everything rolled up so far returns, clock turns red and pulses, last 10 s counted on screen | Banner, horn, sunset sky, fastest music |
| Time up | 0:00 | Freeze, whistle | "TIME UP!" |

The phase bar under the clock shows all four phases in proportion, a pin for now, and a pip for each event.

## 4. The start

- Pads at (+-21, +-21); straight 4 m lanes to the feast are kept clear of anything over 30 cm.
- The feast is rings of treats with the best in the middle: the Grand Festival Tart (worth about 12 ordinary things its size) and four Golden Pies.
- Rocket start: begin holding forward during the "2" second and keep holding until GO. First 0.4 s of that second = perfect (2.3 s boost),
  rest of it = good (1.1 s). Holding from before the 2 = stall (0.9 s). Starting during the "1" = no boost. CPU teams roll for the same outcomes.

## 4b. The charge dash, growth and difficulty (balance pass after the first playtest)

The first human playtest reached 24 m against CPUs at 8-13 m, pulling ahead in the inner habitats by sprinting everywhere. Changes:

- **Sprint is gone; the dash is charged.** Hold the dash button and the ball slows to 30% speed, spins and winds up for up to 1.2 s,
  spending energy; release and it bursts (0.45-1.8 s at about 2.4-2.9 times top speed, steering dulled). A full meter is one full burst.
  Energy refills with time only (16 s for a full meter; rolling things up does not add to it); the Overcharge event makes it
  refill five times as fast.
  A burst into a rival knocks twice as much off it. Running into scenery no longer knocks anything off.
- **Base speed up 19%** to make up some of the lost sprint.
- **Growth:** big balls get less from each thing (half at 6 m wide, was 9 m), aiming at a winner of about 15 m.
- **Difficulty** (menu, saved): Easy, Normal and Hard change CPU speed, how keenly they dash, how quickly they pick targets and how
  much a CPU that is ahead eases off. Numbers are in `DIFFS` at the top of `main.js`.
- **Weight (second pass):** top speed still rises with size, slightly less steeply for giants, so big balls are not slow. Instead
  `heft(d)` scales acceleration, braking, sideways grip and turning down gradually with size (83% at 3 m, 66% at 8 m, 53% at 15 m),
  for the player and the CPUs alike: a big ball is slow to start, slow to stop and carries its momentum.
- **Committal wind-up:** steering by keys and mouse drops to 35% while charging (`CHARGE_STEER`).
- **Dash effects:** dust kicked out behind the spinning ball and sparks off it that build with the charge, marching chevrons on the
  ground showing the direction and reach of the burst, a camera pull-in and rumble, a dust ring on release, a team-coloured
  trail and speed lines at the screen edges during the burst. CPU balls show the same dust, sparks, chevrons and trail, so a dash can be seen coming.
- **Dash brought in line with weight (third pass):** a burst's speed is `dashMult(d)` times top speed (2.35x at 0.6 m, 2.2x at 3 m,
  1.9x at 8 m, 1.7x at 15 m, was 2.4x at every size) and it lasts less for heavy balls (73% as long at 15 m). Energy now refills
  in 16 s (halved; the gain per pick-up was halved too, and later removed: time is the only refill). The dash bar sits in the player panel with ball size, critters held and army power.
- **Fourth pass:** the burst falls off faster with weight (2.0x at 3 m, 1.65x at 8 m, 1.45x at 15 m; length 83%, 66%, 53%).
  HUD re-laid: the player's panel (critters, ball size with the dash gauge, army power) sits bottom centre just under the ball;
  standings are a ranked list with size bars top left; the dex card is top right; the clock, phase bar and event chip stay top centre;
  the minimap is bottom left and the sound button bottom right.
- **Critter attacks and getting boxed in (fifth pass):** a bold critter that reaches the ball now attacks instead of just blocking: it
  rears back for 0.4 s, lunges for 0.2 s, then backs off. A hit throws the ball clear and lets it pass through critters for 1.1 s.
  If the ball is held between solid things, or has stayed within its own width of one spot for two seconds while pushing with
  too-big critters beside it, all of them attack, so a ring of critters cannot trap a ball. Tested in the browser with rings of
  4-8 critters (and 5 titans round a 6 m ball): out in 1.5-2.1 s, 7 s for the titans.
- **Late bloomer:** any ball still under 1 m when Expedition begins is boosted to 1 m, so nobody is stuck in the Green.

## 5. Events

Every event has an icon and a tag of a few words (`EVENT_ICONS` and `EVENT_TAGS` in `main.js`). When one starts a card pops up
for under three seconds: the icon in the event's colour, its name, the tag. For as long as it lasts a chip sits under the clock
with the icon inside a ring that drains with the time left, the name, the tag, and an arrow with the distance to it; the chip
pulses in the last five seconds. Event start times are kept clear of the phase banners.

About five run per round, at the pips on the phase bar; the third is always the Oracle's Whisper. Fourteen more are in the pool
and none repeats within a round. Every prize and hazard is sized from the balls as they are when the event starts, and a site is only
chosen if the smaller balls can reach it.

| Event | Seconds | What happens | Air Ride / Air Riders cousin |
|---|---|---|---|
| Meteor Shower | 30 | A marked zone; meteors land on rings with 1.2 s warning, knock things off balls caught under them and leave gold shards; a big one in the middle leaves rare critters. | Meteors |
| Stampede | 35 | 34 critters of one type charge in a column through the Green; roll into the column. Every ninth is a bruiser that shoves. | Machine Formation |
| Surge | 35 | One type swarms its home habitat in five waves at a marked spot. | Same Item |
| Golden Critter | 40 | A golden critter small enough for the smallest ball flees and slowly tires; the catcher gets a big growth bonus and six of its species. | Tac |
| Supply Drop | 36 | An airship crosses two habitats dropping parachute crates; every fourth is a jackpot that releases critters. | UFO / Halberd, Raining Boxes |
| Magpie Raid | 35 | A thief takes six critters from the team with the biggest army and runs; every ram shakes two loose for anyone. The catch-up event. | Tac |
| Static Storm | 25 | Rams knock off three times as much; the biggest ball is marked as the target. The only map-wide modifier, kept short. | Broken Machine |
| Growth Ring | 35 | A glowing ring at a named place: inside it a ball rolls up things three-quarters its width, and the ring is stocked with exactly such things. | Restoration Area / Dash Zones |
| Ghost Fog | 30 | Thick fog; ghost and poison critters appear beside every ball and vanish when it lifts. | Dense Fog |
| Cold Snap | 35 | The sea freezes into a surface any ball can cross; water and ice critters and crates are out on the bay and the islets. Warning at 5 s. | Slippery Ground |
| Colossus | 40 | A giant critter lands at a named place; each ram shakes three ordinary ones loose and shrinks it; the tenth ram bursts it. | Dyna Blade, Huge Pillar |
| Vault | 30 | A hoard of fourteen critters of one type and gold coins at a landmark, first come first served. | Secret Rooms |
| Checkpoint Dash | 45 | Five gates light one at a time; the first ball through each wins growth and two critters. | Short Race |
| Twister | 35 | A tornado crosses three habitats flinging loose things about and spinning any ball it touches. | Gordos |
| Overcharge | 28 | Dash energy refills five times as fast for every ball. | Energy Tanks |
| Hyperspeed | 20 | Every ball's top speed is tripled. | Energy Tanks Amok |
| Growth Spurt | 30 | Every critter doubles in size; one rolled up while giant stays giant in its team's army for the arena, the rest shrink back. | Giant Items |
| Critter Parade | 30 | Every critter walks towards the nearest ball, even ones that ball can roll up. | (new) |
| Oracle's Whisper | 10 | A quiet hint at the final arena's favoured types, right four times in five. | Stadium Prediction |
 Each event is one object with `start`, `tick` and `end`,
given a host object `H` (defined in `main.js`) so it never reaches into the game's internals. `window.__game.fireEvent('id')` in the
browser console starts any event at once for testing.

## 6. The finale

Rebuilt on 21-22 November 2026 (the running record of that night is `OVERNIGHT-LOG.md`), and changed to "the six" later on
the 22nd: only a team's best six monsters fight, and the player watches those six take shape during the round.

**Files.** `arena.js` (the arena list and the wheel), `arena-merge.js` (merging, the six, the stat bonus), `arena-sim.js` (the
fight, with no drawing in it), `arena-battle.js` (everything on screen), `arena-fx.js` (particles and effect shapes),
`arena-ui.js` (style sheet), `squad-hud.js` (the six and the stat hexagon on the round's HUD).

**The six.** Three of a kind become one of the next stage of their line, again and again (9 -> 3 -> 1). Three of a kind that
cannot evolve become a starred, bigger version (up to three stars). A merged monster is worth 1.5x what went into it. The
strongest six of what that leaves are the team, and they are the only ones that fight. `planArmy` in `arena-merge.js` works
this out from the army alone (no dice, no arena), so the round's HUD and every machine in a multiplayer game get the same answer.

**Everything else is in their stats.** Each critter that is not part of one of the six adds to the team's six stats (HP,
Attack, Defence, Sp. Atk, Sp. Def, Speed), the same for all six fighters. A critter's stat total is shared out by the cube of
each stat, so it goes mostly to what that critter is best at: fast critters feed Speed, tanks feed HP and Defence. Those six
totals decide two things:
- *How much.* A budget of 6 x 18% x S / (S + 31200), where S is the six totals added together: the first critters count
  most, and about 100 spares earns half of all there is.
- *Where.* The budget is shared between the stats by the square of how far each stat's share is above or below what an
  ordinary mix of critters gives it (critters as a whole lean towards Attack and Speed, so without that every team came out
  "best at Speed"). An ordinary mix gets the same on every stat (never more than +18%); one that leans towards fast
  critters gets far more Speed and less of the rest, up to +30% on a single stat. So a collection has a shape, and no
  hexagon can be filled: the frame is the +30% that only one stat can reach.
- *One number to show for it.* `teamPower` turns the six bonuses into how much stronger they make the six: health and
  damage in full, taking less and striking more often at about half each. +9% on everything is Power +30%. It is drawn in
  the middle of the hexagon on the round's HUD and in the ceremony, and decides nothing itself.
A large, even haul (+9% on each) wins as often as a team made 30% stronger outright
(`node tools/arena-test/headless.mjs bonus` measures it).

**On the round's HUD** (`squad-hud.js`, timed mode only), down the right edge:
- *Six cards*, strongest at the top: a portrait in a ring. The ring fills as the player closes in on that monster's next form
  or star (two loose first-stage critters are two thirds of a second-stage one), and is a full gold ring when there is
  nothing further to become. A small badge shows what it is becoming: the next form in silhouette, or a star.
- Rolling up the third of a kind *evolves the card on the spot* (a flash, a burst, a jingle). The ball still carries the
  three originals: if a rival knocks one off, the card steps back.
- *A hexagon*, one corner per stat, which grows as spares are collected (drawn on a curve so the first few already show).
- Every critter rolled up visibly goes somewhere: a spark flies from the ball to the card it feeds, or to the corners of
  the hexagon it raises.
- Each rival's strongest monster is a small portrait on its row of the standings.
There are no markers in the world: players learn the lines and hunt for themselves. CPU teams do hunt (more keenly on
Normal and Hard): a critter they already carry one or two of seems nearer to them (`hunt` in `DIFFS`, `main.js`).

**The order of things.** The arena is chosen when the round starts so the oracle can hint at it. The wheel reveals it. Then:

1. *Muster*, the ceremony (about 23 s with one player and three CPU teams; hold Enter skips the fight, a press of dash
   hurries a count). Every team's six step up by their corner, strongest first, in two rows of three. Then each team takes a
   turn: CPU teams first and quickly (under 3 s each), then players by seat with the full count (9 s). The order and every
   duration are the same on every machine in a multiplayer game, because the fight must start on the same step everywhere.
   The camera goes to the team's corner and a panel opens beside it. The hexagon is the largest thing on it, because it is
   what the whole round's collecting came to:
   - *the count* (5 s for a player, less for a small collection): everything the team rolled up, a species to a tile with a
     tally on it. First the critters that became its six: they fly to the six portraits, which start as silhouettes and come
     to life as they fill, so nine little ones are seen to have become the big one. Then all the rest: each sends a spark to
     the corner of the hexagon it feeds, and the hexagon takes its shape as they land. The number at the top is everything
     the team caught.
     A Power figure in the middle of the hexagon climbs with every one counted. A fighter that was merged carries a small
     tag of what it grew from ("x9" on a Charmander beside the Charizard).
   - *what it came to* (1 s): the bonus appears on each corner in turn, clockwise from the top (each named, the best one
     larger), then the Power in the middle turns gold. The corner numbers are held back until here because one stat's
     share can fall while the count is still going.
   - *the hand-over*: one stat at a time, a badge with that bonus on it flies from its corner to the six on the floor, who
     take it with a flash in its colour. At the last they flare and roar.
   After the last turn the camera pulls back and the four are put side by side: a bar each, as tall as its Power, with what
   it caught underneath, rising weakest first. Each corner card keeps its best stat's badge and its Power for the fight.
   This is the third version, shaped by role-played players (a child, a competitive player, an adult with a small haul).
   The first counted only the spares, showed no names or numbers anyone could read and gave every team five seconds: 5/10
   for excitement, 3 to 5 for clarity, and all three asked why the count did not match what they had caught. The second
   fixed the count but every team headlined "Speed +10%" and "+11% for ninety critters" read as nothing. The third scored
   6 for excitement, 4 for clarity and 5 for "my effort was honoured" (from 5, 3 and 4), and asked for a real comparison at
   the end, which is the bars. These reviewers saw stepped still frames at 800 x 600 with no sound, so motion, sound and
   small type are judged harshly or not at all; a person should watch it.
2. *Drop.* The six hop to their places and the four balls fall in. 3, 2, 1, GO.
3. *Fight.* See below. Six a side, all on the floor from the start; nobody waits in reserve.
4. *Finish.* The last knockout plays in slow motion with the camera pushed in, then the winners cheer.

**The floor is a platform with no walls.** A monster whose middle goes past the edge is out, whatever health it had. One on
its feet digs in at the edge, so it takes a knock to send it over; flyers and floaters can drift back from a little way out.
A ball that leaves the floor is gone for the fight (whatever it had scooped scrambles back on).

**Every hit knocks back**, and harder the weaker the target is: metres slid = knockback x (a little + damage share x
(1 + 2.6 x health lost)) / weight. Fights drift to the edges and the weak get launched.

**Room to see it.** Monsters keep 1.55 times their two radii apart (a melee hit reaches across the gap), and one choosing a
target counts a foe as 70% further away for every monster already on it. So a fight is a handful of duels across the floor
rather than one heap in the middle. Health and the signature move are read off the floor: each monster stands in a ring of its
team's colour that empties as it is hurt (white shows what the last blow took), with a thin gold ring inside that fills as
its move charges. Nothing floats over the models but the player's own "roll through me" marks.

**Signature moves.** One per type, from a monster's first type (its second if the first is Normal). It charges over about 17 s,
faster for quick monsters and with every hit landed. A full charge starts a wind-up of 0.5 to 1.1 s, drawn on the floor in the
type's colour: a wedge, a strip, a ring or a reticle, filling until the move goes off. A hard knock or a ram breaks it.

| Type | Move | What it does |
|---|---|---|
| Fire | Flame Burst | a wedge of fire in front |
| Water | Tidal Surge | a wave that rolls forward and carries things with it |
| Electric | Chain Bolt | jumps between up to four foes and stuns them |
| Grass | Bloom Drain | hurts everything around it and heals itself and friends |
| Ice | Deep Freeze | a circle at the target: frozen solid for 1.7 s |
| Fighting | Sky Uppercut | dashes in and launches one foe |
| Poison | Toxic Pool | a pool that lingers, hurting and slowing |
| Ground | Earthshaker | a quake around it (flyers are untouched) |
| Flying | Whirlwind | little damage, a huge shove away from the user |
| Psychic | Mind Throw | lifts a foe and its neighbours, then hurls them |
| Bug | Swarm Sting | five fast stings on one foe |
| Rock | Rock Slide | boulders land on the target's spot |
| Ghost | Shadow Strike | appears beside the weakest foe in reach and knocks it towards the nearest edge |
| Dragon | Dragon Beam | everything on a line |
| Normal | Stampede | charges down a line, bowling foes aside |

**The balls.** The human steers with the stick or WASD and dashes with Shift or Space. A ball:
- *rams* any monster it cannot scoop: breaks its wind-up and knocks it back. Metres slid = 0.26 x closing speed x
  (1 + 1.5 x health lost) / weight, so a ball barely moves a fresh monster and sends a weakened one flying: the ball is the
  finisher, and picking the hurt one near an edge is the skill. A ram at dash speed is a *smash*: 1.3x the distance, 7% of
  the target's health, and the fight holds its breath for a moment
- *rallies* one of its own by rolling through it: the signature move is charged at once, winds up in half the time and hits 20%
  harder (9 s before the same monster can be rallied again, 2 s between rallies)
- *scoops* enemy monsters smaller than 0.45 of its width (rare now: only the very smallest), and spills them when rammed
- *clashes* with other balls: the heavier, faster one stuns the other
CPU balls do all of this, come at monsters from the inside so the knock sends them outwards, go first for one a smash would
send over the edge, and keep off the edge.

*What a ball is worth* (`node tools/arena-test/headless.mjs balls`: four identical teams, so 25% is an even share). A team
whose ball sits out wins 11%. A team with the only ball on the floor wins 76%. Each ball makes about 1.3 ring-outs a fight;
before rams depended on health it was 0.3, and nearly all of a ball's worth came from dozens of small nudges nobody could see.

**Favoured types** (three per arena) deal 25% more damage, take 20% less, move 10% faster, wear a gold ring, and ignore the
arena's hazard. A hazard's slow push (wave, sandstorm) carries off only monsters that are stunned or tumbling; balls get no grip.

**Ending.** No time limit. After 45 s every hit climbs (7% a second, and knockback with it), the clock turns into the
multiplier and the light turns red. A fight that somehow reaches 150 s is decided on health, as a safety net only.

**The camera** never turns (so "up" on the stick is always away), but it closes in on whatever is still fighting as the floor
empties, and pushes in on the last knockout.

**Drawn sizes are compressed**: a monster N times taller than typical is drawn root-N times bigger, within 0.62x to 2.4x. Stats
use the real height.

**The fight is separate from its drawing.** `arena-sim.js` uses one dice and pushes what happens onto `sim.events`;
`arena-battle.js` draws from that with its own cosmetic dice. So a multiplayer fight is the same on every machine, skipping
runs the real fight, and `tools/arena-test/headless.mjs` can run hundreds of them in seconds (see section 7).

## 7. Where the numbers live

| What | Where |
|---|---|
| Phases, event times, knock loss, titan time, critter density, growth rate | top of `main.js` |
| Biomes, places, river, who lives where | `map.js` |
| Props and scenes per habitat | `habitats/*.js` (rules in `habitats/BRIEF.md`) |
| Events | `events.js` |
| Arena list | top of `arena.js` |
| Everything that decides an arena fight (floor cap, knockback, ramp, ball rules, the edge) | `TUNE` at the top of `arena-sim.js` |
| Signature moves | `MOVES` in `arena-sim.js` |
| Merging and the six (group size, stars, merge bonus, how many fight, what spares are worth) | top of `arena-merge.js` |
| The six on the round's HUD (cards, rings, hexagon, sparks) | `squad-hud.js` |
| The muster and finale timings, the camera | top of `arena-battle.js` |
| Round length | `LEVEL.seconds` in `roster.js` |

Tools: `node tools/map-image.mjs out.png 2` (picture of the map with every prop), `node tools/map-report.mjs [biome]` (size ladder and placement problems),
`node tools/map-probe.mjs x z` (ground at a point). `tools/arena-test/` is a stand-alone page for the wheel and arena
(options are listed at the top of its `test.js`). `node tools/arena-test/headless.mjs 400` runs 400 arena fights with no screen and
reports how they go (share decided by knockout, length, ring-outs, whether the strongest army wins, seat fairness); add
`tune=HP_SCALE:13` to try a number without editing, `smoke` for a quick sanity run, `bonus` for what a collection is worth.

## 8. Online play (not built)

Asked for as a later goal. What was done toward it: the player and the CPU teams now go through the same small set of actions
(`give`, `knock`, `growBall`, `takeFrom`), events only touch the game through `H`, the map layout is seeded so every client builds the
same world, and the arena takes its human input as a function. What it still needs: one authoritative simulation with the player's
ball moved out of the special `S` object into the same shape as a rival, seeded critter spawning, and a transport layer.

## Multiplayer (added 20 November 2026)

Up to four players, one of them hosting; CPU teams take the empty seats. See README.md for how to start a game.

- `net.js` is the transport: a room with a four-letter code, every player connected to the host (WebRTC through PeerJS), one reliable ordered channel each.
- The host runs the round exactly as in single player. Another player's ball is a rival marked `remote`: the host does not steer it, it glides to where that player's machine last reported it.
- A client runs only its own ball's physics. Everything else is drawn from the host, over two channels on the same connection:
  - the reliable one, for what was rolled up, dropped, added, removed or changed, for events, markers and effects, and (5 times a second, 24 at most) the nearby critters that have moved;
  - the fast one (unordered, never re-sent), for where the balls are and the clock, 12 times a second each way, as whole numbers. A copy that cannot leave at once is skipped, so this news is never late, only less frequent.
- The host sends no more than a player's link can carry: critter updates wait while that player's reliable channel has a backlog. The first version sent everything reliably at a fixed rate (about 15 KB/s per player); on a slow upload the backlog grew without limit, so positions and the clock fell seconds behind. A client that has not heard from the host for over a second shows a "connection is slow" notice.
- Pick-ups are optimistic: the client sticks the thing on at once and asks; the host answers yes (to everyone) or no (and the client puts it back).
- Rams, critter attacks and event shoves are decided by the host and sent to the player concerned as a new velocity.
- The map is built from a seed the host sends, so every machine lays out the same world and things can be named by number. Each machine checks its layout against the host's.
- The arena fight is replayed, not streamed: same armies, same seeded dice, fixed 1/60 s steps, and the host sends every step's stick inputs. The host's result is the one shown.
- Public games (Quick play) need no server of their own: there are six fixed room names (`pub1` to `pub6` in `net.js`). A player tries each in turn: joins the first that is waiting, or hosts the first that nobody holds. A public host refuses joiners while its round is on, starts by itself on a countdown (`PUBLIC_WAIT` in `main.js`), uses Normal CPUs, and everyone is returned from the results screen to the lobby after 25 seconds.
- Not done: joining a round already under way, carrying on if the host leaves, relay servers for players behind strict firewalls, and player names.
- Measured cost after the second pass: about 3.3 kB/s from the host to each player and 0.4 kB/s back.
- F3 shows a readout: frame rate, graphics level, draw calls, where a frame's time went (rules, models, batches, drawing) and, in multiplayer, data rates, ping, updates per second and the send backlog.

## Graphics quality (added 20 November 2026)

`QUALITY` in `main.js` has four levels (resolution cap, shadows, draw distance). On "auto" the game starts at the top and steps down one level whenever it averages under 30 frames a second for four seconds of play; it never steps back up by itself, and remembers where it settled. The Graphics button (title screen and pause menu) cycles auto and the four levels.

## Drawing cost of the models (measured and trimmed 22 November 2026)

`__game.bench(frames)` in the console runs frames back to back, waits for the graphics card after each and says what a frame
costs and where it went; it works in a hidden tab. Measured with it at 1920x1080 on the development machine:

| | before | after |
|---|---|---|
| start of a round | 21.2 ms | 8.0 ms |
| late in a round, a 5 m ball | 8.4 ms | 3.9 ms |
| title screen | 21.9 ms | 8.7 ms |

- **What it was.** Up to 240 critters at a time were drawn as the model proper, each with a skeleton: bones moved, multiplied
  out and sent to the graphics card every frame, and a draw call apiece. That cost 0.06 ms each however small they were on
  screen: 14 ms of the frame at the start of a round.
- **Poses instead of skeletons.** A critter in the world is its model's "still" (`stillOf` in `critters/stadium.js`), one
  instanced draw per species. The still's idle loop is baked into 16 sets of vertex positions (`bakePose`, 1.5 ms of it a
  frame at most, only for species on show in a round) and the graphics card blends the two either side of now (`poseTo`).
  Every free critter of a species breathes, in step, at the price of one that stands still. A critter stuck to a ball holds
  its first pose.
- **Skeletons only where there is a flame.** The eight species with fire or gas get the model proper when they are free and
  close (16 at most, 16 pixels and up), posed by the same clock.
- **Welded vertices.** A model's body came out of the merge as loose triangles; welding identical corners leaves about a
  third as many vertices (2,000 to 700).
- **Title screen.** Anything that would be under about three pixels from up there is left out: 5,560 things to 3,250.
- **What is left** (start of a round, 8 ms): the rules 1.6 ms, filling the batches 0.6, handing about 570 draws to the card
  2.4, the card itself 3.3. Shadows are 0.3 ms of that and the grass nothing; rendering at the screen's own resolution
  instead of 1.5 times it saves 0.3.
- **The things stuck to balls go through the batches too** (22 November 2026). Each used to be its own draw. Now every
  thing's own mesh is on a layer the camera does not look at, and `drawHeld` copies each stuck thing's place (the ball's
  times its own on the ball) into the same batches as the free ones; a model's still gets a second batch whose weights
  stay at rest, so the stuck ones hold still. With four full balls in view (`__game.fill()`, 1,200 stuck things, 1920x1080):
  1,740 draws to 625, and the main thread's share of drawing the frame 7.8 ms to 3.9. The whole frame as `bench` times it
  falls less, 11.0 ms to 9.6, because `bench` waits for the card after every frame and the card's own work no longer
  hides behind the main thread's; frames drawn back to back with no wait go from 4.5 ms to 3.6. At "low" graphics
  `bench` reads slightly worse (7.7 to 8.2) while back to back is still better (3.7 to 3.1). `__game.gfx.loose(true)`
  draws them one by one again, for comparing.
- **A batch is only sent to the card when it has changed** (22 November 2026). Every batch's matrices were sent every
  frame, about 390 small uploads, and that was a third of the frame: 2.3 ms, nearly all of it on the card's side. Most
  batches hold things that never move, so `batchPut` remembers which thing (and which of its matrices) filled each slot
  and a batch is sent only from the first slot that differs: about 40 a frame, standing or rolling. Start of a round at
  1920x1080: 7.1 ms to 4.7 (6.7 to 4.5 while turning and rolling). `__game.gfx.DRAW.sendAll = true` sends them all
  again, for comparing; a full-screen pixel comparison of the two is identical apart from a few pixels of something
  that flickers by itself (two frames sent in full differ by as much).
- **Measured on a fast machine.** All of these figures are from the development machine (a GeForce RTX 5060 Ti, 28 cores).
  A laptop with built-in graphics will be several times slower on the main thread and far slower on the card, and the
  split will differ: there the triangles (1.4 million a frame at the start of a round: terrain 493,000 drawn whole,
  items 630,000, critters 180,000, grass tufts 104,000), the 4x anti-aliasing and the logarithmic depth buffer are
  likely to matter, none of which shows here.
- **Tried and dropped:** leaving out the stuck things hidden behind their own ball (about a third of them, 300,000
  triangles). No measurable gain: the card is not short of triangles.

## Drawing cost (measured and trimmed 20 November 2026)

Measured in single player with a 3 m ball: 3,981 draw calls and 5.0 million triangles a frame (view plus shadow pass). After the changes below: 2,334 and 2.3 million.

- Critters on the map use a plainer set of shapes (`PLAIN` in `critters/kit.js`): a median of about 1,350 triangles each instead of 4,800. The dex, the pop-up card and titans keep the detailed set (`FINE`).
- Each imported model is baked into one mesh in the shared item material (`loadModel`), instead of one mesh per colour.
- A thing is drawn out to 130 times its size (about half a degree on screen), not 300.
- Only things near the ball and at least 7% of its width cast shadows; the shadow map is 1024 on the medium level.
- Instancing (`drawWorld` in `main.js`): the things lying about the map keep their own meshes for the game to move, but those are not drawn. Each frame, every thing that is switched on and on screen has its matrix copied into a batch, one `InstancedMesh` per shape and material (and a second, shadow-casting batch for the few near the ball). A thing stuck on a ball was drawn the ordinary way then (it goes through the batches now: see above). Every item is now a single mesh (a model is baked to one normalised geometry). With a 3 m ball: 740 draw calls and 1.9 million triangles a frame.
- Not done yet: dropping the logarithmic depth buffer, splitting the terrain (493,000 triangles, drawn whole) into chunks. The terrain has to stay double-sided: its cliff faces are not wound consistently.
- Reliable messages are sent in packets of about a kilobyte and only as fast as the link takes them (`netFlush`). Sent as one lump per frame, a wave of critters, the refill or an event's effects made a single very large message, which on a slow link held up everything else, the ball positions included. The refill is now sent as numbers into the starting layout (`rf`), and each event-effect shape is described once per round.
- PeerJS refuses any JSON message of 16,300 bytes or more. `room.send` in `net.js` now splits a long message into numbered pieces that are joined at the other end, and a connection error no longer counts as the player leaving (only the connection closing does). Before this, the armies sent at the end of a full round were too long: the host got an error, dropped the player, and their screen stayed on TIME UP. Armies are also sent as runs of the same critter, which keeps that message to a few kilobytes.

