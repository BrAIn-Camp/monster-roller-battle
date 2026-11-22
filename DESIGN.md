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
  Energy refills in 8 s on its own and by 2.5% per thing rolled up; the Overcharge event makes it refill five times as fast.
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
  in 16 s and gains 1.25% per pick-up (both halved). The dash bar sits in the player panel with ball size, critters held and army power.
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

Rebuilt on 21-22 November 2026 (the running record of that night is `OVERNIGHT-LOG.md`).

**Files.** `arena.js` (the arena list and the wheel), `arena-merge.js` (merging), `arena-sim.js` (the fight, with no drawing in
it), `arena-battle.js` (everything on screen), `arena-fx.js` (particles and effect shapes), `arena-ui.js` (style sheet).

**The order of things.** The arena is chosen when the round starts so the oracle can hint at it. The wheel reveals it. Then:

1. *Merge.* Three of a kind become one of the next stage of their line, again and again (9 -> 3 -> 1). Three of a kind that
   cannot evolve become a starred, bigger version (up to three stars). A merged monster is worth 1.5x what went into it.
   The strongest 20 fight (12 on the floor, 8 in reserve); the rest "back" them for up to +50% health and damage.
   Each team's best three merges are shown at a spot in front of its corner: three spin together, flash, and one stands
   there. The results line up by the corner and walk on as the fighters they are.
2. *Drop.* The rest of the fighters and the four balls fall in. 3, 2, 1, GO.
3. *Fight.* See below. Reserves drop in at their corner as places open.
4. *Finish.* The last knockout plays in slow motion with the camera pushed in, then the winners cheer.

**The floor is a platform with no walls.** A monster whose middle goes past the edge is out, whatever health it had. One on
its feet digs in at the edge, so it takes a knock to send it over; flyers and floaters can drift back from a little way out.
A ball that leaves the floor is gone for the fight (whatever it had scooped scrambles back on).

**Every hit knocks back**, and harder the weaker the target is: metres slid = knockback x (a little + damage share x
(1 + 2.6 x health lost)) / weight. Fights drift to the edges and the weak get launched.

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
- *rams* any monster it cannot scoop: knocks it back (further at dash speed), breaks its wind-up, and stops it acting for a moment
- *rallies* one of its own by rolling through it: the signature move is charged at once, winds up in half the time and hits 20%
  harder (9 s before the same monster can be rallied again, 2 s between rallies)
- *scoops* enemy monsters smaller than 0.45 of its width (rare now: only the very smallest), and spills them when rammed
- *clashes* with other balls: the heavier, faster one stuns the other
CPU balls do all of this, come at monsters from the inside so the knock sends them outwards, and keep off the edge.

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
| Merging (group size, stars, merge bonus, bench backing) | top of `arena-merge.js` |
| Arena intro and finale timings, the camera | top of `arena-battle.js` |
| Round length | `LEVEL.seconds` in `roster.js` |

Tools: `node tools/map-image.mjs out.png 2` (picture of the map with every prop), `node tools/map-report.mjs [biome]` (size ladder and placement problems),
`node tools/map-probe.mjs x z` (ground at a point). `tools/arena-test/` is a stand-alone page for the wheel and arena
(options are listed at the top of its `test.js`). `node tools/arena-test/headless.mjs 400` runs 400 arena fights with no screen and
reports how they go (share decided by knockout, length, ring-outs, whether the strongest army wins, seat fairness); add
`tune=HP_SCALE:13` to try a number without editing, `smoke` for a quick sanity run.

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
- F3 shows a readout: frame rate, graphics level, draw calls and, in multiplayer, data rates, ping, updates per second and the send backlog.

## Graphics quality (added 20 November 2026)

`QUALITY` in `main.js` has four levels (resolution cap, shadows, draw distance). On "auto" the game starts at the top and steps down one level whenever it averages under 30 frames a second for four seconds of play; it never steps back up by itself, and remembers where it settled. The Graphics button (title screen and pause menu) cycles auto and the four levels.

## Drawing cost (measured and trimmed 20 November 2026)

Measured in single player with a 3 m ball: 3,981 draw calls and 5.0 million triangles a frame (view plus shadow pass). After the changes below: 2,334 and 2.3 million.

- Critters on the map use a plainer set of shapes (`PLAIN` in `critters/kit.js`): a median of about 1,350 triangles each instead of 4,800. The dex, the pop-up card and titans keep the detailed set (`FINE`).
- Each imported model is baked into one mesh in the shared item material (`loadModel`), instead of one mesh per colour.
- A thing is drawn out to 130 times its size (about half a degree on screen), not 300.
- Only things near the ball and at least 7% of its width cast shadows; the shadow map is 1024 on the medium level.
- Instancing (`drawWorld` in `main.js`): the things lying about the map keep their own meshes for the game to move, but those are not drawn. Each frame, every thing that is switched on and on screen has its matrix copied into a batch, one `InstancedMesh` per shape and material (and a second, shadow-casting batch for the few near the ball). A thing stuck on a ball is drawn the ordinary way. Every item is now a single mesh (a model is baked to one normalised geometry). With a 3 m ball: 740 draw calls and 1.9 million triangles a frame.
- Not done yet: dropping the logarithmic depth buffer, splitting the terrain (493,000 triangles, drawn whole) into chunks. The terrain has to stay double-sided: its cliff faces are not wound consistently.
- Reliable messages are sent in packets of about a kilobyte and only as fast as the link takes them (`netFlush`). Sent as one lump per frame, a wave of critters, the refill or an event's effects made a single very large message, which on a slow link held up everything else, the ball positions included. The refill is now sent as numbers into the starting layout (`rf`), and each event-effect shape is described once per round.
- PeerJS refuses any JSON message of 16,300 bytes or more. `room.send` in `net.js` now splits a long message into numbered pieces that are joined at the other end, and a connection error no longer counts as the player leaving (only the connection closing does). Before this, the armies sent at the end of a full round were too long: the host got an error, dropped the player, and their screen stayed on TIME UP. Armies are also sent as runs of the same critter, which keeps that message to a few kilobytes.

