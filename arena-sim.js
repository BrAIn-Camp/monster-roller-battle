// THE ARENA FIGHT, with nothing to draw it. Everything that decides the result lives here and only here:
// monsters, their attacks and signature moves, the four balls, the arena's hazard, ring-outs and the clock.
//
// It never touches the screen. Whatever happens is pushed onto `sim.events` for arena.js to animate, which means
//   - a multiplayer fight is identical on every machine (one seeded dice, fixed steps, no drawing in the loop)
//   - skipping a fight and the headless balance test (tools/arena-test/headless.mjs) run the real thing
//
// The floor is a platform with no walls. A monster knocked past the edge is out, whatever health it had; one
// that flies or floats can drift back unless it was hit a long way out. A ball that leaves the floor is gone for
// the rest of the fight.
import { STATS, TYPE_CHART } from './critters/battle-data.js';

// ---------- tuning (one object, so the balance test can vary it) ----------
export const TUNE = {
  FIELD_CAP: 6,             // monsters per team: the six (arena-merge.js). Both the same: nobody waits in reserve,
  ROSTER_CAP: 6,            // and the rest of a collection is in the six's stats rather than on the floor
  RAMP_AT: 45,              // seconds before every hit starts to climb
  RAMP_RATE: 0.07,          // damage gains this much per second after that
  RAMP_KB: 0.6,             // and knockback this share of it
  TIME_HARD: 150,           // a safety net only: decided on health if it somehow lasts this long
  HP_SCALE: 22, DMG_BASE: 8, DMG_RATIO: 22,
  FAV_DMG: 1.25, FAV_TAKEN: 0.8, FAV_SPEED: 1.1,       // the edge an arena gives its three favoured types
  REINFORCE_EVERY: 0.8,     // seconds between reserves dropping in at a team's corner
  DROP_TIME: 0.8,           // a reserve cannot be hurt, or act, while it falls in
  ARENA_MIN: 30, ARENA_MAX: 40,
  // Drawn heights. A typical monster is H_TARGET of the arena side; others are scaled by the ROOT of how much
  // taller or shorter they really are, within H_MIN..H_MAX times typical. So a sea serpent towers over a mouse,
  // but nothing is a speck and nothing blots out the floor. (Stats still use the real height.)
  H_TARGET: 0.085, H_MIN: 0.62, H_MAX: 2.4,
  HIT_DELAY: 0.14,          // a melee swing lands this long after it starts (so the blow meets the animation)
  SHOT_SPEED: 0.62,         // ranged attacks fly this many arena sides per second
  // knockback: metres slid = kb x (KB_FLAT + KB_FRAC x damage share x (1 + KB_WEAK x health lost)) / weight
  KB_FLAT: 0.28, KB_FRAC: 4.2, KB_WEAK: 2.6, KB_DECAY: 5, KB_TUMBLE: 0.9,
  EDGE_GRIP: 0.8,           // a monster on its feet keeps its middle this many radii inside the edge
  EDGE_OUT: 0.3,            // and is out once its middle is this many radii past it
  AIR_SAVE: 0.085,          // flyers recover from this far past the edge (share of the arena side)
  SPECIAL_EVERY: 17,        // seconds for a signature move to charge (quicker for fast monsters)
  SPECIAL_HIT_GAIN: 0.02,   // and each landed hit adds this much
  BREAK_DIST: 0.9,          // a knock of at least this many metres breaks a wind-up
  RALLY_CD: 9, RALLY_BALL_CD: 2.0, RALLY_POWER: 1.2, RALLY_WIND: 0.55,
  RAM_MIN: 2.5, RAM_PUSH: 0.3, RAM_DMG: 0.04, RAM_IMMUNE: 1.2,
  SCOOP_RATIO: 0.45, SCOOP_GROW: 0.8, SCOOP_GULP: 0.7, SCOOP_DRAG: 0.35,
  BALL_BASE: 1.05, BALL_SPREAD: 0.5, BALL_MAX_GROW: 1.5, BALL_GRIP: 4.5,
  DASH_MULT: 1.8, DASH_TIME: 0.34, DASH_CD: 2.2,           // (a dash covers about 8 m before the ball can stop: with no walls, more was a trap)
  CPU_SPEED: 0.9, CPU_THINK: [0.3, 0.55],
  CLASH_STUN: 1.0,
  FREEZE_HEAVY: 0.07, FREEZE_KO: 0.05, FREEZE_GAP: 0.5,   // hit-stop, and the least time between two of them
};
const T = TUNE;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// The fight is replayed step for step on every machine in a multiplayer game, so it must come out the same in every
// browser, to the last bit. Adding, multiplying, dividing and square roots do; Math.hypot, Math.pow, Math.exp,
// Math.log, Math.cbrt and the trig functions are only "close enough", and each engine is close in its own way. So
// the fight uses these instead (plain arithmetic, the same everywhere), and never the Math versions.
const hyp = (a, b) => Math.sqrt(a * a + b * b);
const cube = (v) => v * v * v;
const PI = 3.141592653589793, TAU = 6.283185307179586;
function sin(x) {                                     // a polynomial, good to nine places
  x -= TAU * Math.round(x / TAU);
  if (x > PI / 2) x = PI - x; else if (x < -PI / 2) x = -PI - x;
  const q = x * x;
  return x * (1 + q * (-1 / 6 + q * (1 / 120 + q * (-1 / 5040 + q * (1 / 362880 + q * (-1 / 39916800 + q / 6227020800))))));
}
const cos = (x) => sin(x + PI / 2);
const fade = (x) => 1 / (1 + x * (1 + x * (0.5 + x * (1 / 6 + x / 24))));     // e^-x for the small x of one step
function cbrt(v) { if (v <= 0) return 0; let g = Math.sqrt(Math.sqrt(v)) + 0.1; for (let i = 0; i < 24; i++) g = (2 * g + v / (g * g)) / 3; return g; }
const DEF = [50, 50, 50, 50, 50, 50], NONE = [0, 0, 0, 0, 0, 0];
export const CORNERS = [[-1, 1], [-1, -1], [1, -1], [1, 1]];          // team 0 bottom-left of the screen, then clockwise

export function typeMult(att, defs) { let m = 1; for (const d of defs) m *= (TYPE_CHART[att] && TYPE_CHART[att][d] !== undefined ? TYPE_CHART[att][d] : 1); return m; }
export const isFavoured = (arena, spec) => spec.types.some((t) => arena.types.includes(t));

// ---------- signature moves, one per type ----------
// shape decides who is hit; reach/size are in "arena units" (multiplied by the arena side / 32, plus the user's
// own height where it matters). power multiplies an ordinary hit. wind is the telegraph, in seconds.
//   cone   everything in a wedge in front                 beam   everything on a line, at once
//   wave   a front that rolls forward, carrying things    nova   everything around the user
//   blast  a circle at the target (after the wind-up)     pool   a circle that lingers and hurts
//   chain  jumps from foe to foe                          strike one foe, hard (dash in, or blink behind)
//   flurry one foe, many small hits                       throw  lifts a foe and its neighbours, then hurls them
//   rush   the user itself charges down a line
export const MOVES = {
  fire:     { name: 'Flame Burst',   shape: 'cone',   reach: 7.5, arc: 0.62, power: 1.7, kb: 2.2, wind: 0.85 },
  water:    { name: 'Tidal Surge',   shape: 'wave',   reach: 11, width: 2.4, power: 1.1, kb: 0.9, carry: 0.5, wind: 0.9 },
  electric: { name: 'Chain Bolt',    shape: 'chain',  reach: 8.5, jumps: 4, power: 1.6, kb: 0.5, stun: 0.7, wind: 0.6 },
  grass:    { name: 'Bloom Drain',   shape: 'nova',   size: 4.6, power: 1.25, kb: 1.2, heal: 0.6, wind: 0.8 },
  ice:      { name: 'Deep Freeze',   shape: 'blast',  reach: 9, size: 3.3, power: 1.2, kb: 0.3, stun: 1.7, frozen: true, wind: 0.9 },
  fighting: { name: 'Sky Uppercut',  shape: 'strike', reach: 5, power: 3.2, kb: 5.0, wind: 0.6 },
  poison:   { name: 'Toxic Pool',    shape: 'pool',   reach: 8.5, size: 3.4, power: 0.42, ticks: 5, every: 0.8, slow: 0.6, wind: 0.7 },
  ground:   { name: 'Earthshaker',   shape: 'nova',   size: 5.6, power: 1.5, kb: 1.8, stun: 0.5, grounded: true, wind: 1.0 },
  flying:   { name: 'Whirlwind',     shape: 'blast',  reach: 9, size: 4.0, power: 0.9, kb: 4.4, away: true, wind: 0.7 },
  psychic:  { name: 'Mind Throw',    shape: 'throw',  reach: 9, size: 3.0, count: 3, lift: 0.9, power: 1.3, kb: 5.0, wind: 0.8 },
  bug:      { name: 'Swarm Sting',   shape: 'flurry', reach: 4, hits: 5, every: 0.16, power: 0.75, kb: 0.5, wind: 0.5 },
  rock:     { name: 'Rock Slide',    shape: 'blast',  reach: 9.5, size: 3.5, power: 2.0, kb: 1.6, stun: 0.8, wind: 1.1 },
  ghost:    { name: 'Shadow Strike', shape: 'strike', reach: 13, blink: true, power: 3.0, kb: 2.4, wind: 0.7 },
  dragon:   { name: 'Dragon Beam',   shape: 'beam',   reach: 14, width: 1.7, power: 2.0, kb: 2.2, wind: 1.0 },
  normal:   { name: 'Stampede',      shape: 'rush',   reach: 10, width: 1.2, power: 1.8, kb: 3.2, speed: 0.75, wind: 0.6 },
};
// which of a monster's types its signature move comes from: the first, unless that is "normal" and it has another
export const moveTypeOf = (spec) => (spec.types[0] === 'normal' && spec.types[1] && MOVES[spec.types[1]] ? spec.types[1] : MOVES[spec.types[0]] ? spec.types[0] : 'normal');

// ---------- setting up ----------
// teams: [{ roster: [{ spec, stars, boost, value }], bonus, ballD, human }]   (roster and bonus from arena-merge.js;
// bonus is the share the team's spare critters add to each of the six stats, the same for every fighter)
// rand: the dice. input(team) -> { x, z, dash } for a human-steered ball.
export function createSim({ arena, teams, rand = Math.random, input = null }) {
  const NT = teams.length, events = [];
  const emit = (e) => { events.push(e); };

  // ---- sizes: the arena, and how big everything is drawn in it
  const recs = teams.map((tm) => (tm.roster || []).slice(0, T.ROSTER_CAP).map((r) => ({ spec: r.spec, stars: r.stars || 0, boost: r.boost || 1, bonus: tm.bonus || NONE, value: r.value, made: r.made || 1, fav: isFavoured(arena, r.spec) })));
  const onStart = recs.map((r) => Math.min(r.length, T.FIELD_CAP));
  const heights = []; let biggest = 0;
  recs.forEach((r) => r.forEach((c) => { heights.push(c.spec.height); biggest = Math.max(biggest, c.spec.height); }));
  heights.sort((a, b) => a - b);
  const total = heights.length, median = total ? heights[total >> 1] : 1;
  const L = clamp(29 + Math.sqrt(total) * 0.35 + Math.min(biggest, 30) * 0.25, T.ARENA_MIN, T.ARENA_MAX), half = L / 2, K = L / 32;
  const hRef = L * T.H_TARGET;
  const hOf = (spec) => hRef * clamp(Math.sqrt(spec.height / median), T.H_MIN, T.H_MAX);
  const spdK = clamp(L / 40, 0.8, 1.5);
  function unitStats(c) {
    const b0 = STATS[c.spec.dex] || DEF, b = b0.map((v, i) => v * (1 + (c.bonus[i] || 0))), m = Math.sqrt(c.spec.height), special = b0[3] > b0[1];
    return {
      maxHp: b[0] * T.HP_SCALE * m * c.boost, atk: special ? b[3] : b[1], special, def: b[2], spd: b[4], m: m * c.boost,
      interval: clamp(1.7 - b[5] / 140, 0.65, 1.6),              // faster monsters attack more often
      speed: (1.4 + b[5] / 45 + c.h * 0.25) * spdK,              // and get there sooner
      range: special ? 3.5 * K + c.h : 0,                        // special attackers fight at range
      charge: 1 / (T.SPECIAL_EVERY * clamp(1.25 - b[5] / 240, 0.75, 1.2)),
      weight: clamp(Math.sqrt(c.h / hRef), 0.6, 1.9) * (0.85 + (b[0] + b[2]) / 600),
    };
  }
  const maxHpAll = new Array(NT).fill(0), next = onStart.slice();       // next[k]: index of team k's next reserve
  recs.forEach((r, k) => r.forEach((c) => { c.h = hOf(c.spec); c.st = unitStats(c); c.move = moveTypeOf(c.spec); maxHpAll[k] += c.st.maxHp; }));

  // ---- units
  const field = [], everyone = [];                              // on the floor and fighting / every monster that entered
  let uid = 0;
  function spawn(c, k, x, z, drop) {
    const u = { id: uid++, team: k, rec: c, spec: c.spec, st: c.st, h: c.h, r: Math.max(0.2, c.h * 0.3), fav: c.fav, value: c.value, stars: c.stars, move: c.move,
      hp: c.st.maxHp, x, z, yaw: Math.atan2(-x, -z), cd: 0.3 + rand() * 0.9, rt: rand() * 0.6, target: null,
      kx: 0, kz: 0, launched: 0, stun: 0, frozen: false, lifted: 0, slow: 0, ramImm: 0, noScoop: 0, drop,
      charge: rand() * 0.45, wind: null, rush: null, busy: 0, rallyCd: 0, rallied: false,
      alive: true, scooped: false, out: null, lastBy: null, lastTeam: -1, lastT: -99, dmg: 0, kills: 0, moving: false, off: false,
      air: c.spec.move === 'fly' || c.spec.move === 'float' };
    c.unit = u; field.push(u); everyone.push(u);
    return u;
  }
  recs.forEach((r, k) => {
    const [cx, cz] = CORNERS[k % 4], spread = L * 0.13 * clamp(Math.sqrt(onStart[k] / 12), 0.4, 1);
    for (let i = 0; i < onStart[k]; i++) { const a = rand() * 6.283, d = Math.sqrt(rand()) * spread; spawn(r[i], k, cx * L * 0.29 + cos(a) * d, cz * L * 0.29 + sin(a) * d, 0); }
  });
  const inner = (u) => half - u.r * T.EDGE_GRIP;
  function separate(hold) {                                     // keep monsters from standing inside each other (the lighter one gives way)
    const n = field.length;
    for (let i = 0; i < n; i++) {
      const u = field[i];
      for (let j = i + 1; j < n; j++) {
        const v = field[j], min = (u.r + v.r) * 0.92, dx = u.x - v.x, dz = u.z - v.z;
        if (dx > min || dx < -min || dz > min || dz < -min) continue;
        const d = hyp(dx, dz) || 0.001;
        if (d < min) { const push = (min - d) * 0.5 / d, wu = v.r * v.r / (u.r * u.r + v.r * v.r); u.x += dx * push * wu; u.z += dz * push * wu; v.x -= dx * push * (1 - wu); v.z -= dz * push * (1 - wu); }
      }
      if (hold || !(u.launched > 0 || u.stun > 0 || u.air)) { const lim = inner(u); u.x = clamp(u.x, -lim, lim); u.z = clamp(u.z, -lim, lim); }
    }
  }
  for (let i = 0; i < 30; i++) separate(true);                  // settle the starting formations

  // ---- type match-ups, cached by pair of slots
  const effCache = new Map();
  const best = (u, v) => {                                      // [multiplier, type] of u's best type against v
    const key = u.spec.dex * 1000 + v.spec.dex; let e = effCache.get(key);
    if (!e) { e = [-1, u.spec.types[0]]; for (const t of u.spec.types) { const m = typeMult(t, v.spec.types); if (m > e[0]) e = [m, t]; } effCache.set(key, e); }
    return e;
  };

  // ---- balls: "earned but compressed". The smallest ball is a little wider than a typical monster is tall and
  // can scoop nothing but the very smallest; the biggest is BALL_SPREAD wider and can scoop a few more.
  const baseD = hRef * T.BALL_BASE;
  const finishD = teams.map((tm) => Math.max(0.05, +tm.ballD || 0.5)), loD = Math.min(...finishD, 1e9), spanD = Math.sqrt(Math.max(Math.max(...finishD, loD) / loD, 4)) - 1;
  const topSpeed0 = 4.5 + L * 0.13;                             // ball top speed before size, dash and arena factors
  const balls = teams.map((tm, k) => {
    const [cx, cz] = CORNERS[k % 4], D = baseD * (1 + T.BALL_SPREAD * (Math.sqrt(finishD[k] / loD) - 1) / spanD);
    return { isBall: true, team: k, cpu: !tm.human, x: cx * L * 0.12, z: cz * L * 0.12, vx: 0, vz: 0, D, D0: D, R: D / 2, hd: Math.atan2(-cx, -cz),
      hx: -cx * Math.SQRT1_2, hz: -cz * Math.SQRT1_2, stun: 0, safe: 0, gulp: 0, dashT: 0, dashCd: 0, combo: 0, comboT: 0, rallyCd: 0, cargo: [], scoops: 0, rams: 0, rallies: 0, ringOuts: 0,
      aim: null, plan: '', rt: rand() * 0.5, ax: 0, az: 0, wob: rand() * 6.28, moving: false, gone: false, teamOut: false };
  });
  const maxD = (b) => b.D0 * T.BALL_MAX_GROW;
  function stunBall(b, dur) { if (b.safe > 0 || b.gone) return false; b.stun = dur; b.safe = dur + 1.5; b.dashT = 0; return true; }

  // ---- things in flight and things that happen a little later (all deterministic: kept in order)
  const shots = [], waves = [], pools = [], timers = [];
  let seq = 0, now = 0;
  const later = (delay, fn) => { timers.push({ at: now + delay, n: seq++, fn }); };
  let ramp = 1, freeze = 0, freezeGap = 0;
  const hitStop = (dur) => { if (freezeGap > 0) return; freeze = Math.max(freeze, dur); freezeGap = T.FREEZE_GAP; };

  // ---- hurting, knocking back, knocking out
  function knock(t, dx, dz, dist) {                             // slide t `dist` metres along (dx, dz)
    if (!t.alive || dist <= 0) return;
    const d = hyp(dx, dz) || 1, v = dist * T.KB_DECAY;
    t.kx += dx / d * v; t.kz += dz / d * v;
    t.launched = Math.max(t.launched, clamp(0.12 + dist * 0.09, 0.15, T.KB_TUMBLE));
    if (dist >= T.BREAK_DIST) breakWind(t);
  }
  function breakWind(t) {
    if (!t.wind && !t.rush) return;
    if (t.wind) { emit({ e: 'break', u: t, move: t.wind.move }); t.charge = 0.45; }
    t.wind = null; t.rush = null; t.rallied = false;
  }
  function stunUnit(t, dur, frozen) { if (!t.alive) return; t.stun = Math.max(t.stun, dur); if (frozen) t.frozen = true; breakWind(t); }
  // src: the attacker (or null for a hazard or a ball). o: { type, eff, kb, dx, dz, stun, frozen, special, team }
  function hurt(src, t, dmg, o = {}) {
    if (!t.alive || t.drop > 0) return 0;
    dmg *= ramp * (t.fav ? T.FAV_TAKEN : 1);
    const share = dmg / t.st.maxHp;
    t.hp -= dmg;
    if (src) { src.dmg += dmg; src.charge = Math.min(1, src.charge + T.SPECIAL_HIT_GAIN); t.lastBy = src; }
    const team = src ? src.team : o.team !== undefined ? o.team : -1;
    if (team >= 0) { t.lastTeam = team; t.lastT = now; if (!src) t.lastBy = null; }
    const weak = 1 - Math.max(0, t.hp) / t.st.maxHp;
    const dist = (o.kb || 0) * (T.KB_FLAT + T.KB_FRAC * share * (1 + T.KB_WEAK * weak)) * K * (1 + (ramp - 1) * T.RAMP_KB) / t.st.weight;
    let dx = o.dx, dz = o.dz;
    if (dx === undefined) { dx = src ? t.x - src.x : 0; dz = src ? t.z - src.z : 0; }
    const heavy = dist > 1.6 * K || share > 0.3;
    emit({ e: 'hit', u: src, t, dmg, eff: o.eff === undefined ? 1 : o.eff, type: o.type || 'normal', heavy, special: !!o.special, pool: !!o.pool, dist });
    if (t.hp <= 0) { knockOut(t, src, dx, dz, Math.max(dist, 1.2 * K), 'ko'); return dmg; }
    if (o.stun) stunUnit(t, o.stun, o.frozen);
    if (dist > 0.02) knock(t, dx, dz, dist);
    if (heavy && o.special) hitStop(T.FREEZE_HEAVY);
    return dmg;
  }
  function knockOut(t, src, dx, dz, dist, how) {
    if (!t.alive) return;
    t.alive = false; t.out = how; t.wind = null; t.rush = null; t.target = null;
    const by = src || (now - t.lastT < 4 ? t.lastBy : null), team = src ? src.team : now - t.lastT < 4 ? t.lastTeam : -1;
    if (by && by.team !== t.team) by.kills++;
    if (how === 'ring' && team >= 0 && team !== t.team) balls[team].ringOuts += by ? 0 : 1;
    const d = hyp(dx, dz) || 1;
    emit({ e: how, t, by, team, dx: dx / d, dz: dz / d, dist });
    hitStop(T.FREEZE_KO + (t.h > hRef * 1.3 ? 0.04 : 0));
  }
  // an ordinary hit from u on t with `power`, in the best of u's types (or `type` for a signature move)
  function strike(u, t, power, o = {}) {
    if (!t.alive) return 0;
    let eff, type;
    if (o.type) { type = o.type; eff = typeMult(type, t.spec.types); } else { const b = best(u, t); eff = b[0]; type = b[1]; }
    const D = u.st.special ? t.st.spd : t.st.def;
    const dmg = eff === 0 ? 1 : (T.DMG_BASE + T.DMG_RATIO * u.st.atk / D) * eff * u.st.m * (0.85 + rand() * 0.3) * (u.fav ? T.FAV_DMG : 1) * power;
    return hurt(u, t, dmg, Object.assign({ type, eff, kb: 1 }, o));
  }
  const foes = (team, fn) => { for (let i = 0; i < field.length; i++) { const v = field[i]; if (v.alive && v.team !== team && v.drop <= 0) fn(v); } };
  // signature moves shove rival balls about as well (never their own)
  function shoveBalls(team, x, z, radius, force, dx, dz) {
    for (const b of balls) {
      if (b.gone || b.team === team) continue;
      const ex = b.x - x, ez = b.z - z, d = hyp(ex, ez) || 0.01;
      if (d > radius + b.R) continue;
      const nx = dx === undefined ? ex / d : dx, nz = dx === undefined ? ez / d : dz;
      b.vx += nx * force; b.vz += nz * force; b.dashT = 0;
    }
  }

  // ---- the arena's hazard. Favoured monsters ignore it; balls never do. Everything is telegraphed.
  const cross = (d) => [[0, 0], [d, 0], [-d, 0], [0, d], [0, -d]];
  // a slow push (wave, wind): a monster on its feet digs in at the edge; a stunned or tumbling one is carried off
  const shove = (u, dx, dz) => { u.x += dx; u.z += dz; if (!(u.launched > 0 || u.stun > 0 || u.air)) { const lim = inner(u); u.x = clamp(u.x, -lim, lim); u.z = clamp(u.z, -lim, lim); } };
  const haz = (function makeHazard() {
    const H = { kind: arena.hazard, grip: T.BALL_GRIP, top: 1, zones: [], W: null, step() {}, slow: () => 1, hidden: () => false };
    const Z = H.zones, kind = arena.hazard;
    H.danger = (x, z, pad) => { for (const q of Z) if (q.bad && (x - q.x) * (x - q.x) + (z - q.z) * (z - q.z) < (q.r + pad) * (q.r + pad)) return q; return null; };
    const within = (x, z, s) => { for (const q of Z) if (q.s === s && (x - q.x) * (x - q.x) + (z - q.z) * (z - q.z) < q.r * q.r) return true; return false; };
    const blast = (q, dist, dmg, stun) => {                     // knock back and hurt whatever stands in zone q
      for (const u of field) { if (u.fav || !u.alive || u.drop > 0) continue; const dx = u.x - q.x, dz = u.z - q.z, d = hyp(dx, dz) || 0.01; if (d < q.r + u.r) { u.hp = Math.max(1, u.hp - u.st.maxHp * dmg); emit({ e: 'hit', u: null, t: u, dmg: 0, eff: 1, type: arena.types[0], heavy: false, special: false, dist }); knock(u, dx, dz, dist * K / u.st.weight); stunUnit(u, 0.4); } }
      for (const b of balls) { if (b.gone) continue; const dx = b.x - q.x, dz = b.z - q.z, d = hyp(dx, dz) || 0.01; if (d < q.r + b.R * 0.6) { b.vx += dx / d * dist * 6.5; b.vz += dz / d * dist * 6.5; if (stun) stunBall(b, stun); } }
    };
    const cycle = (q, dt, idle, warn, act, onWarn, onFire) => {     // idle -> warn (telegraph) -> active -> idle
      q.t -= dt; if (q.t > 0) return;
      if (q.s === 0) { q.s = 1; q.t = warn; if (onWarn) onWarn(q); emit({ e: 'hazwarn', q }); } else if (q.s === 1) { q.s = 2; q.t = act; if (onFire) onFire(q); emit({ e: 'hazfire', q }); } else { q.s = 0; q.t = idle[0] + rand() * (idle[1] - idle[0]); }
      q.bad = q.s > 0;
    };
    if (kind === 'vents') {                                     // Magma Bowl: five vents fill up for 1.4 s, then blow outwards
      const r = L * 0.085; H.WARN = 1.4; H.ACT = 0.5;
      cross(L * 0.25).forEach(([x, z], i) => Z.push({ x, z, r, s: 0, t: 2.5 + i * 1.2 + rand() * 2, bad: false }));
      H.step = (dt) => { for (const q of Z) cycle(q, dt, [4.5, 8], H.WARN, H.ACT, null, () => blast(q, 2.4, 0.07, 0.5)); };
    } else if (kind === 'lightning') {                          // Storm Spire: a marker closes for 1.2 s, then the bolt lands
      const r = L * 0.065; H.WARN = 1.2; H.ACT = 0.22;
      for (let i = 0; i < 3; i++) Z.push({ x: 0, z: 0, r, s: 0, t: 1.5 + i * 1.1, bad: false });
      H.step = (dt) => { for (const q of Z) cycle(q, dt, [1.4, 3.4], H.WARN, H.ACT, () => {
        const live = balls.filter((b) => !b.gone);
        const tgt = rand() < 0.65 ? (rand() < 0.4 || !field.length ? live[Math.floor(rand() * live.length)] : field[Math.floor(rand() * field.length)]) : null;   // often aimed near the action
        q.x = clamp(tgt ? tgt.x + (rand() - 0.5) * r * 2 : (rand() - 0.5) * L, -half + r, half - r); q.z = clamp(tgt ? tgt.z + (rand() - 0.5) * r * 2 : (rand() - 0.5) * L, -half + r, half - r);
      }, () => blast(q, 1.0, 0.08, 0.9)); };
    } else if (kind === 'spores') {                             // Canopy Ring: mushrooms swell, then leave a cloud that slows
      const r = L * 0.1; H.WARN = 1.2; H.ACT = 3.6;
      cross(L * 0.26).forEach(([x, z], i) => Z.push({ x, z, r, s: 0, t: 3 + i * 1.5 + rand() * 2, bad: false }));
      H.step = (dt) => { for (const q of Z) cycle(q, dt, [5, 9], H.WARN, H.ACT); };
      H.slow = (x, z) => (within(x, z, 2) ? 0.5 : 1);
    } else if (kind === 'wave') {                               // Tidal Deck: a wave rises at one edge for 1.6 s, then rolls across
      const W = H.W = { s: 0, t: 5, dx: 1, dz: 0, p: 0 }, speed = L / 3; H.WARN = 1.6;
      H.step = (dt) => {
        W.t -= dt;
        if (W.s === 0 && W.t <= 0) { const d = [[1, 0], [0, 1], [-1, 0], [0, -1]][Math.floor(rand() * 4)]; W.dx = d[0]; W.dz = d[1]; W.s = 1; W.t = H.WARN; W.p = -half - 1.6; emit({ e: 'hazwarn', q: W }); }
        else if (W.s === 1 && W.t <= 0) { W.s = 2; emit({ e: 'hazfire', q: W }); }
        else if (W.s === 2) {
          W.p += speed * dt;
          for (const u of field) if (!u.fav && !u.air && u.alive && Math.abs(u.x * W.dx + u.z * W.dz - W.p) < 1.6 + u.r) shove(u, W.dx * speed * 0.55 * dt, W.dz * speed * 0.55 * dt);
          for (const b of balls) if (!b.gone && Math.abs(b.x * W.dx + b.z * W.dz - W.p) < 1.6 + b.R * 0.5) { b.vx += W.dx * 22 * dt; b.vz += W.dz * 22 * dt; }
          if (W.p > half + 2) { W.s = 0; W.t = 6 + rand() * 4; }
        }
      };
    } else if (kind === 'gust') {                               // Dune Coliseum: the arrows show which way the next gust blows
      const W = H.W = { s: 0, t: 4.5, dx: 1, dz: 0 }; H.WARN = 1.5; H.ACT = 2.6;
      H.step = (dt) => {
        W.t -= dt;
        if (W.s === 0 && W.t <= 0) { const a = Math.floor(rand() * 8) * Math.PI / 4; W.dx = cos(a); W.dz = sin(a); W.s = 1; W.t = H.WARN; emit({ e: 'hazwarn', q: W }); }
        else if (W.s === 1 && W.t <= 0) { W.s = 2; W.t = H.ACT; emit({ e: 'hazfire', q: W }); }
        else if (W.s === 2) {
          for (const u of field) if (!u.fav && u.alive) { const p = u.air ? 2.6 : 1.8; shove(u, W.dx * p * dt, W.dz * p * dt); }
          for (const b of balls) if (!b.gone) { b.vx += W.dx * 9 * dt; b.vz += W.dz * 9 * dt; }
          if (W.t <= 0) { W.s = 0; W.t = 5.5 + rand() * 4; }
        }
      };
    } else if (kind === 'fog') {                                // Haunted Hollow: four fog banks drift about, always visible
      const r = L * 0.11;
      for (let i = 0; i < 4; i++) { const a = i * 1.571 + 0.8; Z.push({ x: cos(a) * L * 0.22, z: sin(a) * L * 0.22, r, s: 2, vx: cos(a * 2.3 + 1) * 1.3, vz: sin(a * 2.3 + 1) * 1.3, bad: false }); }
      H.step = (dt) => { for (const q of Z) { q.x += q.vx * dt; q.z += q.vz * dt; if (Math.abs(q.x) > half - r * 0.6) q.vx = -Math.sign(q.x) * Math.abs(q.vx); if (Math.abs(q.z) > half - r * 0.6) q.vz = -Math.sign(q.z) * Math.abs(q.vz); } };
      H.hidden = (x, z) => within(x, z, 2);
    } else if (kind === 'bumpers') {                            // Meadow Stadium: four pinball bumpers
      const r = Math.max(1.1, L * 0.035);
      cross(L * 0.24).slice(1).forEach(([x, z]) => Z.push({ x, z, r, s: 2, hit: 0, bad: false }));
      H.step = (dt) => { for (const q of Z) {
        q.hit = Math.max(0, q.hit - dt);
        for (const b of balls) { if (b.gone) continue; const dx = b.x - q.x, dz = b.z - q.z, d = hyp(dx, dz) || 0.01; if (d < r + b.R) { const sp = Math.max(hyp(b.vx, b.vz) * 1.05, topSpeed0 * 1.1); b.x = q.x + dx / d * (r + b.R); b.z = q.z + dz / d * (r + b.R); b.vx = dx / d * sp; b.vz = dz / d * sp; b.dashT = 0; q.hit = 0.25; emit({ e: 'bumper', q, b }); } }
        for (const u of field) { const dx = u.x - q.x, dz = u.z - q.z, d = hyp(dx, dz) || 0.01; if (d < r + u.r) { u.x = q.x + dx / d * (r + u.r); u.z = q.z + dz / d * (r + u.r); if (u.launched > 0 && q.hit <= 0) { const sp = hyp(u.kx, u.kz) * 1.1 + 4; u.kx = dx / d * sp; u.kz = dz / d * sp; u.launched = Math.max(u.launched, 0.4); q.hit = 0.25; emit({ e: 'bumper', q, b: null }); } } }
      } };
    } else if (kind === 'ice') { H.grip = 2.2; H.top = 1.08; }   // Frost Rink: balls slide (but with no walls, not so far that stopping is hopeless)
    return H;
  })();

  // ---- signature moves
  const reachOf = (u, M) => (M.reach || M.size || 4) * K + u.h * 0.5;
  function windUp(u, t) {
    const M = MOVES[u.move], dx = t.x - u.x, dz = t.z - u.z, d = hyp(dx, dz) || 1;
    u.wind = { move: u.move, M, t: 0, dur: M.wind * (u.rallied ? T.RALLY_WIND : 1), target: t, x: u.x, z: u.z, tx: t.x, tz: t.z, dx: dx / d, dz: dz / d, size: (M.size || 0) * K, reach: reachOf(u, M), width: (M.width || 0) * K + u.r, power: M.power * (u.rallied ? T.RALLY_POWER : 1) };
    u.yaw = Math.atan2(dx, dz); u.charge = 0; u.moving = false;
    emit({ e: 'wind', u, w: u.wind });
  }
  function fire(u) {
    const w = u.wind, M = w.M, type = w.move, o = { type, kb: M.kb || 0, special: true, stun: M.stun || 0, frozen: !!M.frozen };
    u.wind = null; u.rallied = false; u.busy = 0.35; u.cd = Math.max(u.cd, 0.5);
    const tgt = w.target && w.target.alive ? w.target : null;
    if (tgt && M.shape !== 'blast' && M.shape !== 'pool') { const dx = tgt.x - u.x, dz = tgt.z - u.z, d = hyp(dx, dz) || 1; if (M.shape !== 'cone' && M.shape !== 'beam' && M.shape !== 'wave' && M.shape !== 'rush') { w.tx = tgt.x; w.tz = tgt.z; } w.dx = dx / d; w.dz = dz / d; u.yaw = Math.atan2(dx, dz); }
    const ev = { e: 'fire', u, w, hits: [] };
    emit(ev);
    switch (M.shape) {
      case 'cone': {
        const edge = cos(M.arc);
        foes(u.team, (v) => { const dx = v.x - u.x, dz = v.z - u.z, d = hyp(dx, dz) || 0.01; if (d < w.reach + v.r && (d < u.r + v.r + 0.5 || (dx * w.dx + dz * w.dz) / d > edge)) { ev.hits.push(v); strike(u, v, w.power, o); } });
        shoveBalls(u.team, u.x + w.dx * w.reach * 0.5, u.z + w.dz * w.reach * 0.5, w.reach * 0.55, 7 * M.kb / 2.2, w.dx, w.dz);
        break;
      }
      case 'beam': {
        foes(u.team, (v) => { const dx = v.x - u.x, dz = v.z - u.z, along = dx * w.dx + dz * w.dz, side = Math.abs(dx * w.dz - dz * w.dx); if (along > -v.r && along < w.reach + v.r && side < w.width * 0.5 + v.r) { ev.hits.push(v); strike(u, v, w.power, Object.assign({}, o, { dx: w.dx, dz: w.dz })); } });
        for (const b of balls) { if (b.gone || b.team === u.team) continue; const dx = b.x - u.x, dz = b.z - u.z, along = dx * w.dx + dz * w.dz, side = Math.abs(dx * w.dz - dz * w.dx); if (along > 0 && along < w.reach && side < w.width * 0.5 + b.R) { b.vx += w.dx * 9; b.vz += w.dz * 9; b.dashT = 0; } }
        break;
      }
      case 'wave':                                              // rolls forward from the user, carrying what it meets
        waves.push({ u, team: u.team, x: u.x, z: u.z, dx: w.dx, dz: w.dz, p: u.r, reach: w.reach, width: w.width + 1.2 * K, speed: L * 0.55, power: w.power, o, hit: new Set(), carry: M.carry, ev });
        break;
      case 'nova':
        foes(u.team, (v) => { if (M.grounded && v.air) return; const d = hyp(v.x - u.x, v.z - u.z); if (d < w.size + u.r + v.r) { ev.hits.push(v); const dealt = strike(u, v, w.power, o); if (M.heal) ev.heal = (ev.heal || 0) + dealt * M.heal; } });
        if (ev.heal) {                                          // what it drained is shared by the user and friends inside the ring
          const friends = field.filter((v) => v.alive && v.team === u.team && hyp(v.x - u.x, v.z - u.z) < w.size + u.r + v.r);
          ev.healed = friends; for (const v of friends) v.hp = Math.min(v.st.maxHp, v.hp + ev.heal / friends.length * (v === u ? 1.5 : 1));
        }
        shoveBalls(u.team, u.x, u.z, w.size + u.r, 6 * (M.kb || 1));
        break;
      case 'blast': {
        const cx = w.tx, cz = w.tz;
        foes(u.team, (v) => { const dx = v.x - cx, dz = v.z - cz, d = hyp(dx, dz); if (d < w.size + v.r) { ev.hits.push(v); strike(u, v, w.power, M.away ? Object.assign({}, o, { dx: v.x - u.x, dz: v.z - u.z }) : Object.assign({}, o, { dx: dx || 0.01, dz })); } });
        if (M.kb > 1) shoveBalls(u.team, cx, cz, w.size, 2.4 * M.kb, M.away ? w.dx : undefined, M.away ? w.dz : undefined);
        else if (M.frozen) for (const b of balls) if (!b.gone && b.team !== u.team && hyp(b.x - cx, b.z - cz) < w.size + b.R * 0.5) stunBall(b, 0.8);
        break;
      }
      case 'pool':
        pools.push({ u, team: u.team, x: w.tx, z: w.tz, r: w.size, left: M.ticks, t: 0.05, every: M.every, power: w.power, slow: M.slow, type, life: M.ticks * M.every });
        break;
      case 'chain': {
        let from = u, cur = tgt; const seen = new Set();
        ev.chain = [];
        for (let i = 0; i < M.jumps && cur; i++) {
          seen.add(cur); ev.chain.push(cur); ev.hits.push(cur);
          strike(u, cur, w.power * (1 - i * 0.15), Object.assign({}, o, { dx: cur.x - from.x, dz: cur.z - from.z }));
          let nxt = null, bd = 5.5 * K * 5.5 * K;
          foes(u.team, (v) => { if (seen.has(v)) return; const d = (v.x - cur.x) * (v.x - cur.x) + (v.z - cur.z) * (v.z - cur.z); if (d < bd) { bd = d; nxt = v; } });
          from = cur; cur = nxt;
        }
        for (const b of balls) if (!b.gone && b.team !== u.team && ev.chain.some((v) => hyp(b.x - v.x, b.z - v.z) < b.R + 1.5 * K)) stunBall(b, 0.7);
        break;
      }
      case 'strike': {
        let v = tgt;
        if (M.blink) { let bf = 2; foes(u.team, (q) => { const d = hyp(q.x - u.x, q.z - u.z), f = q.hp / q.st.maxHp + d / (w.reach * 4); if (d < w.reach && f < bf) { bf = f; v = q; } }); }
        if (!v) break;
        const dx = v.x - u.x, dz = v.z - u.z, d = hyp(dx, dz) || 1, gap = u.r + v.r + 0.2;
        ev.from = { x: u.x, z: u.z };
        let hx = dx / d, hz = dz / d;
        if (M.blink) { const ex = Math.abs(v.x) > Math.abs(v.z) ? Math.sign(v.x) : 0, ez = ex ? 0 : Math.sign(v.z); hx = ex; hz = ez; u.x = v.x - hx * gap; u.z = v.z - hz * gap; }   // appear on its inner side, to knock it towards the nearest edge
        else if (d > gap) { u.x = v.x - hx * gap; u.z = v.z - hz * gap; }
        const lim = inner(u); u.x = clamp(u.x, -lim, lim); u.z = clamp(u.z, -lim, lim);
        u.yaw = Math.atan2(v.x - u.x, v.z - u.z); u.target = v; ev.hits.push(v); ev.to = v;
        strike(u, v, w.power, Object.assign({}, o, { dx: hx, dz: hz }));
        break;
      }
      case 'flurry': {
        if (!tgt) break;
        ev.to = tgt; u.busy = M.hits * M.every + 0.2;
        for (let i = 0; i < M.hits; i++) later(i * M.every, () => { if (u.alive && tgt.alive && u.stun <= 0) { emit({ e: 'sting', u, t: tgt, i }); strike(u, tgt, w.power, Object.assign({}, o, { kb: i === M.hits - 1 ? 2.2 : M.kb })); } });
        break;
      }
      case 'throw': {
        if (!tgt) break;
        const picked = [tgt];
        foes(u.team, (v) => { if (v !== tgt && picked.length < M.count && hyp(v.x - tgt.x, v.z - tgt.z) < w.size + v.r) picked.push(v); });
        ev.hits = picked; u.busy = M.lift + 0.2;
        for (const v of picked) { stunUnit(v, M.lift + 0.15); v.lifted = M.lift; }
        later(M.lift, () => { for (const v of picked) if (v.alive) { v.lifted = 0; if (u.alive) strike(u, v, w.power, Object.assign({}, o, { stun: 0, dx: v.x - u.x, dz: v.z - u.z })); else knock(v, v.x - u.x, v.z - u.z, 2 * K); } emit({ e: 'thrown', u, hits: picked }); });
        break;
      }
      case 'rush':
        u.busy = 0;                                             // (off at once: the charge is the move)
        u.rush = { dx: w.dx, dz: w.dz, left: w.reach, speed: L * M.speed, hit: new Set(), power: w.power, o, width: w.width };
        break;
      default: break;
    }
  }
  function stepMoves(dt) {
    for (let i = waves.length - 1; i >= 0; i--) {               // rolling fronts
      const W = waves[i], step = W.speed * dt; W.p += step;
      foes(W.team, (v) => {
        const dx = v.x - W.x, dz = v.z - W.z, along = dx * W.dx + dz * W.dz, side = Math.abs(dx * W.dz - dz * W.dx);
        if (side > W.width * 0.5 + v.r || Math.abs(along - W.p) > 1.4 * K + v.r) return;
        if (!W.hit.has(v)) { W.hit.add(v); W.ev.hits.push(v); strike(W.u, v, W.power, Object.assign({}, W.o, { dx: W.dx, dz: W.dz })); if (v.alive) { v.launched = Math.max(v.launched, 0.5); breakWind(v); } }
        if (v.alive && !v.fav) { v.x += W.dx * step * W.carry / v.st.weight; v.z += W.dz * step * W.carry / v.st.weight; v.launched = Math.max(v.launched, 0.12); }
      });
      for (const b of balls) { if (b.gone || b.team === W.team) continue; const dx = b.x - W.x, dz = b.z - W.z, along = dx * W.dx + dz * W.dz, side = Math.abs(dx * W.dz - dz * W.dx); if (side < W.width * 0.5 + b.R && Math.abs(along - W.p) < 1.4 * K + b.R) { b.vx += W.dx * 34 * dt; b.vz += W.dz * 34 * dt; b.dashT = 0; } }
      if (W.p > W.reach) waves.splice(i, 1);
    }
    for (let i = pools.length - 1; i >= 0; i--) {               // lingering pools
      const P = pools[i]; P.t -= dt; P.life -= dt;
      if (P.t <= 0 && P.left > 0) {
        P.t += P.every; P.left--;
        foes(P.team, (v) => { if (hyp(v.x - P.x, v.z - P.z) < P.r + v.r) { v.slow = Math.max(v.slow, P.every + 0.1); if (P.u) strike(P.u, v, P.power, { type: P.type, kb: 0, special: false, pool: true }); } });
      }
      if (P.life <= 0) pools.splice(i, 1);
    }
  }

  // ---- one monster's turn
  function stepUnit(u, dt, kd) {
    u.rt -= dt; u.cd -= dt;
    if (u.noScoop > 0) u.noScoop -= dt; if (u.ramImm > 0) u.ramImm -= dt; if (u.rallyCd > 0) u.rallyCd -= dt; if (u.slow > 0) u.slow -= dt;
    if (u.drop > 0) { u.drop -= dt; return; }
    if (u.kx !== 0 || u.kz !== 0) { u.x += u.kx * dt; u.z += u.kz * dt; u.kx *= kd; u.kz *= kd; if (Math.abs(u.kx) + Math.abs(u.kz) < 0.05) u.kx = u.kz = 0; }
    if (u.launched > 0) u.launched -= dt;
    if (u.lifted > 0) u.lifted -= dt;
    // the edge
    const over = Math.max(Math.abs(u.x), Math.abs(u.z)) - half;
    if (over > (u.air ? L * T.AIR_SAVE : u.r * T.EDGE_OUT)) { knockOut(u, null, Math.abs(u.x) > Math.abs(u.z) ? Math.sign(u.x) : 0, Math.abs(u.x) > Math.abs(u.z) ? 0 : Math.sign(u.z), hyp(u.kx, u.kz) / T.KB_DECAY + 1, 'ring'); return; }
    u.off = over > 0;
    if (u.stun > 0) { u.stun -= dt; if (u.stun <= 0) u.frozen = false; u.moving = false; return; }
    const lim = inner(u), loose = u.launched > 0;
    if (!loose && (Math.abs(u.x) > lim || Math.abs(u.z) > lim)) {       // back from the brink (a flyer drifts in over open air)
      const sp = (u.air ? u.st.speed * 1.4 : 7) * dt, tx = clamp(u.x, -lim, lim), tz = clamp(u.z, -lim, lim), d = hyp(tx - u.x, tz - u.z);
      if (d <= sp) { u.x = tx; u.z = tz; } else { u.x += (tx - u.x) / d * sp; u.z += (tz - u.z) / d * sp; }
      if (u.off) { u.moving = true; return; }
    }
    if (loose) { u.moving = false; return; }
    if (u.busy > 0) { u.busy -= dt; u.moving = false; return; }
    if (u.rush) {                                               // charging down a line, bowling foes aside
      const R = u.rush, step = Math.min(R.left, R.speed * dt);
      u.x += R.dx * step; u.z += R.dz * step; R.left -= step; u.moving = true;
      foes(u.team, (v) => { if (!R.hit.has(v) && hyp(v.x - u.x, v.z - u.z) < u.r + v.r + R.width * 0.5) { R.hit.add(v); const side = (v.x - u.x) * R.dz - (v.z - u.z) * R.dx >= 0 ? 1 : -1; strike(u, v, R.power, Object.assign({}, R.o, { dx: R.dx * 0.75 + R.dz * side * 0.6, dz: R.dz * 0.75 - R.dx * side * 0.6 })); } });
      for (const b of balls) if (!b.gone && b.team !== u.team && !R.hit.has(b) && hyp(b.x - u.x, b.z - u.z) < u.r + b.R) { R.hit.add(b); b.vx += R.dx * 9; b.vz += R.dz * 9; b.dashT = 0; }
      // it stops when it runs INTO an edge; one that starts on the edge line and runs along it carries on
      const wall = (Math.abs(u.x) >= lim && u.x * R.dx > 0.25 * Math.abs(u.x)) || (Math.abs(u.z) >= lim && u.z * R.dz > 0.25 * Math.abs(u.z));
      u.x = clamp(u.x, -lim, lim); u.z = clamp(u.z, -lim, lim);
      if (R.left <= 0 || wall) { u.rush = null; u.busy = 0.3; emit({ e: 'rushend', u }); }
      return;
    }
    if (u.wind) {                                               // winding up: rooted, and the telegraph is on the floor
      const w = u.wind; w.t += dt; u.moving = false;
      if (w.t >= w.dur) fire(u);
      return;
    }
    if (!u.target || !u.target.alive || u.rt <= 0) {            // nearest foe, leaning towards ones it has a type advantage over
      u.rt = 0.8 + rand() * 0.5;
      let bst = null, bs = 1e9;
      for (const v of field) { if (v.team === u.team || !v.alive || v.drop > 0) continue; const s = hyp(v.x - u.x, v.z - u.z) * (1.3 - 0.15 * Math.min(best(u, v)[0], 2)) * (v.off ? 1.6 : 1); if (s < bs) { bs = s; bst = v; } }
      u.target = bst;
    }
    const t = u.target;
    u.charge = Math.min(1, u.charge + u.st.charge * dt);
    if (!t) { u.moving = false; return; }
    const dx = t.x - u.x, dz = t.z - u.z, d = hyp(dx, dz) || 0.001, reach = u.st.range > 0 ? u.st.range + t.r : u.r + t.r + 0.25;
    u.yaw = Math.atan2(dx, dz);
    // a charged signature move goes off as soon as the target is inside it; one that reaches less far than the
    // monster's ordinary attack (a ring around itself, for a monster that fights at range) makes it close in first
    let stand = reach;
    if (u.charge >= 1 && t.drop <= 0) {
      const M = MOVES[u.move], sr = reachOf(u, M) * (M.shape === 'nova' ? 0.7 : 0.95) + t.r;
      if (d < sr) { windUp(u, t); return; }
      stand = Math.min(reach, sr * 0.9);
    }
    if (d > stand) {
      const sp = u.st.speed * (u.fav ? T.FAV_SPEED : haz.slow(u.x, u.z)) * (u.slow > 0 ? 0.6 : 1) * dt;
      u.x = clamp(u.x + dx / d * sp, -lim, lim); u.z = clamp(u.z + dz / d * sp, -lim, lim); u.moving = true;
      return;
    }
    u.moving = false;
    if (u.cd > 0) return;
    u.cd = u.st.interval;
    const b = best(u, t), miss = !u.fav && rand() < 0.35 && (haz.hidden(u.x, u.z) || haz.hidden(t.x, t.z));      // fog: a swing and a miss
    if (u.st.range > 0) {
      const instant = b[1] === 'electric' || b[1] === 'psychic' || b[1] === 'ghost';
      emit({ e: 'atk', u, t, type: b[1], ranged: true, instant, miss });
      if (instant) { if (!miss) later(0.08, () => { if (t.alive) strike(u, t, 1, { kb: 0.7 }); }); }
      else shots.push({ u, t, x: u.x, z: u.z, sx: u.x, sz: u.z, speed: L * T.SHOT_SPEED, type: b[1], miss, id: uid++ });
    } else {
      emit({ e: 'atk', u, t, type: b[1], ranged: false, miss });
      if (!miss) later(T.HIT_DELAY, () => { if (u.alive && t.alive && u.stun <= 0 && hyp(t.x - u.x, t.z - u.z) < u.r + t.r + 1.2) strike(u, t, 1, { kb: 1 }); });
    }
  }

  // ---- ball brains
  const edgeGap = (x, z) => half - Math.max(Math.abs(x), Math.abs(z));           // metres to the nearest edge
  function outward(x, z) { return Math.abs(x) > Math.abs(z) ? [Math.sign(x) || 1, 0] : [0, Math.sign(z) || 1]; }
  function think(b) {
    let bestT = null, bs = 0, plan = '';
    const consider = (o, s, p) => { if (o === b.aim) s *= 1.25; if (s > bs) { bs = s; bestT = o; plan = p; } };          // a little loyalty, so it does not dither
    const lim = T.SCOOP_RATIO * b.D;
    for (const u of field) {
      if (!u.alive || u.drop > 0) continue;
      const d = hyp(u.x - b.x, u.z - b.z) + L * 0.1;
      if (u.team === b.team) {                                  // rally one of ours that has someone to hit
        if (b.rallyCd <= 0.3 && u.rallyCd <= 0 && !u.wind && !u.rush && u.stun <= 0 && u.target && u.charge < 0.85 && !b.teamOut) consider(u, (u.value + 1) * 1.1 / d, 'rally');
        continue;
      }
      if (haz.hidden(u.x, u.z)) continue;
      if (u.h <= lim) { if (u.noScoop <= 0) { let s = (u.value + 0.5) * 1.3 / d; for (const o of balls) if (o !== b && o.aim === u) s *= 0.35; consider(u, s, 'scoop'); } continue; }
      if (u.ramImm > 0) continue;
      let s = 0;
      if (u.wind) s = (u.value + 1) * 2.2 / d;                                    // break a wind-up
      const gap = edgeGap(u.x, u.z);
      if (gap < L * 0.2) s = Math.max(s, (u.value + 1) * (1.9 - gap / (L * 0.2)) * 1.2 / d);     // shove one near the edge over it
      else if (u.target && u.target.team === b.team) s = Math.max(s, (u.value + 1) * 0.35 / d);
      if (haz.danger(u.x, u.z, 0)) s *= 0.5;
      if (s > 0) consider(u, s, 'ram');
    }
    for (const o of balls) {                                    // a rival ball: free what it scooped, or bump it off
      if (o === b || o.gone || o.safe > 0 || o.D > b.D * 1.25) continue;
      let mine = 0; for (const c of o.cargo) if (c.team === b.team) mine++;
      const gap = edgeGap(o.x, o.z), s = ((mine ? 1 + mine * 3 : 0) + (gap < L * 0.18 ? 2.2 : 0.25)) / (hyp(o.x - b.x, o.z - b.z) + L * 0.12);
      consider(o, s, 'ram');
    }
    b.aim = bestT; b.plan = plan;
  }
  function moveBall(b, dt, auto) {
    if (b.gone) return;
    const cpu = b.cpu || auto, top = topSpeed0 * (1 + 0.12 * (b.D / b.D0 - 1)) * haz.top * haz.slow(b.x, b.z) * (cpu ? T.CPU_SPEED : 1);
    let ix = 0, iz = 0, dash = false;
    b.dashCd -= dt; b.safe -= dt; b.comboT -= dt; b.gulp -= dt; b.rallyCd -= dt;
    if (b.stun > 0) b.stun -= dt;
    else if (cpu) {
      b.rt -= dt;
      if (b.aim && (b.aim.isBall ? b.aim.gone : !b.aim.alive)) b.aim = null;       // somebody else got it: coast until the next think
      if (b.rt <= 0) { b.rt = T.CPU_THINK[0] + rand() * (T.CPU_THINK[1] - T.CPU_THINK[0]); think(b); }
      const a = b.aim;
      let tx = a ? a.x : 0, tz = a ? a.z : 0, lined = true;
      if (a && b.plan === 'ram') {                              // come at it from the inside, so the knock sends it outwards
        const tr = a.isBall ? a.R : a.r, [ox, oz] = outward(a.x, a.z), px = a.x - ox * (b.R + tr + 1.6), pz = a.z - oz * (b.R + tr + 1.6);
        const ex = a.x - b.x, ez = a.z - b.z, e = hyp(ex, ez) || 1;
        lined = (ex * ox + ez * oz) / e > 0.72 || a.wind;
        if (!lined && edgeGap(a.x, a.z) < L * 0.22) { tx = px; tz = pz; }
      }
      const dx = tx - b.x, dz = tz - b.z, d = hyp(dx, dz) || 0.001;
      if (a || d > L * 0.12) {
        const w = sin(now * 1.7 + b.wob) * 0.12, c = cos(w), s = sin(w);    // aim wobble
        ix = (dx * c - dz * s) / d; iz = (dx * s + dz * c) / d;
        const q = haz.danger(b.x + ix * 2.5, b.z + iz * 2.5, b.R + 1);               // steer round live hazards
        if (q) { const ex = b.x - q.x, ez = b.z - q.z, e = hyp(ex, ez) || 1; ix += ex / e * 1.4; iz += ez / e * 1.4; const m = hyp(ix, iz) || 1; ix /= m; iz /= m; }
        else if (a && lined && b.plan !== 'rally' && b.dashCd <= 0 && d > b.R + 1.5 && d < L * 0.26 && (b.vx * dx + b.vz * dz) / d > top * 0.45 && rand() < dt * 2.4) {
          // only dash if stopping on the far side still leaves floor under the ball
          const stop = top * T.DASH_MULT * (T.DASH_TIME + 1.2 / haz.grip), far = d + stop * (b.plan === 'ram' ? 0.35 : 1);
          if (edgeGap(b.x + dx / d * far, b.z + dz / d * far) > b.R * 0.5) dash = true;
        }
      }
      // stay on the floor: where will this ball be once it has had time to stop?
      const look = 0.35 + 1.5 / haz.grip, fx = b.x + b.vx * look, fz = b.z + b.vz * look, safe = half - b.R * 0.6 - L * 0.02;
      if (Math.abs(fx) > safe) { ix = -Math.sign(fx) * 1.6; dash = false; }
      if (Math.abs(fz) > safe) { iz = -Math.sign(fz) * 1.6; dash = false; }
      const m = hyp(ix, iz); if (m > 1) { ix /= m; iz /= m; }
      b.ax += (ix - b.ax) * Math.min(1, dt * 7); b.az += (iz - b.az) * Math.min(1, dt * 7); ix = b.ax; iz = b.az;      // reaction lag
    } else {
      const s = (input && input(b.team)) || {}; ix = +s.x || 0; iz = +s.z || 0; dash = !!s.dash;
      const m = hyp(ix, iz); if (m > 1) { ix /= m; iz /= m; }
    }
    if (dash && b.dashCd <= 0 && b.stun <= 0) {
      let hx = ix, hz = iz; const m = hyp(hx, hz);
      if (m < 0.2) { hx = b.hx; hz = b.hz; } else { hx /= m; hz /= m; }
      b.vx = hx * top * T.DASH_MULT; b.vz = hz * top * T.DASH_MULT; b.dashT = T.DASH_TIME; b.dashCd = T.DASH_CD;
      emit({ e: 'dash', b });
    }
    if (b.stun > 0) { const f = fade(2.2 * dt); b.vx *= f; b.vz *= f; }
    else if (b.dashT > 0) b.dashT -= dt;                         // a dash is a committed burst: no steering until it ends
    else { const k = 1 - fade(haz.grip * dt); b.vx += (ix * top - b.vx) * k; b.vz += (iz * top - b.vz) * k; }
    let sp = hyp(b.vx, b.vz);
    const cap = topSpeed0 * 3.2;                                 // however hard it was hit
    if (sp > cap) { b.vx *= cap / sp; b.vz *= cap / sp; sp = cap; }
    b.x += b.vx * dt; b.z += b.vz * dt;
    b.moving = sp > 0.6;
    if (sp > 0.6) { b.hx = b.vx / sp; b.hz = b.vz / sp; b.hd = Math.atan2(b.vx, b.vz); }      // (hd is only for drawing)
    if (Math.abs(b.x) > half + b.R * 0.15 || Math.abs(b.z) > half + b.R * 0.15) { ballOut(b); return; }      // off the edge: gone for the fight

    // monsters: scoop the small foes, ram the big ones, rally our own
    const scoopMax = T.SCOOP_RATIO * b.D;
    for (const u of field) {
      if (!u.alive || u.drop > 0) continue;
      const dx = b.x - u.x, dz = b.z - u.z, reach = b.R + u.r;
      if (dx > reach || dx < -reach || dz > reach || dz < -reach) continue;
      const d = hyp(dx, dz) || 0.001;
      if (u.team === b.team) {
        if (d < b.R + u.r * 0.7 && sp > 1 && b.rallyCd <= 0 && u.rallyCd <= 0 && !u.wind && !u.rush && u.stun <= 0 && b.stun <= 0 && !b.teamOut) {
          u.charge = 1; u.rallied = true; u.rallyCd = T.RALLY_CD; b.rallyCd = T.RALLY_BALL_CD; b.rallies++; u.rt = 0;
          emit({ e: 'rally', u, b });
        }
        if (u.r > b.R) { const min = b.R + u.r * 0.85; if (d < min) { b.x += dx / d * (min - d) * 0.5; b.z += dz / d * (min - d) * 0.5; } }     // our own giant: slide round it
        else { const min = b.R + u.r * 0.5; if (d < min && !u.wind) { const p = (min - d) * Math.min(1, dt * 10); u.x -= dx / d * p; u.z -= dz / d * p; } }
      } else if (u.h <= scoopMax) {
        if (u.noScoop <= 0 && b.stun <= 0 && b.gulp <= 0 && d < b.R + u.r * 0.5) scoop(b, u);
      } else {
        const min = b.R + u.r * 0.9;
        if (d < min) {
          const nx = dx / d, nz = dz / d, vn = b.vx * nx + b.vz * nz;
          b.x += nx * (min - d); b.z += nz * (min - d);
          if (vn < 0) {
            b.vx -= 1.45 * vn * nx; b.vz -= 1.45 * vn * nz; b.dashT = 0;
            if (-vn > T.RAM_MIN && u.ramImm <= 0) {             // a proper ram: knocks it back, breaks its wind-up
              const dist = Math.min(L * 0.3, T.RAM_PUSH * -vn * clamp(Math.sqrt(b.D / u.h), 0.6, 1.5) * (1 + (ramp - 1) * T.RAMP_KB) / u.st.weight);
              u.ramImm = T.RAM_IMMUNE; b.rams++;
              u.hp = Math.max(1, u.hp - u.st.maxHp * T.RAM_DMG); u.lastTeam = b.team; u.lastT = now; u.lastBy = null;
              const broke = !!u.wind;
              knock(u, -nx, -nz, dist); if (broke) breakWind(u);
              emit({ e: 'ram', b, u, dist, broke, speed: -vn });
            }
            if (cpu && b.aim === u) { b.aim = null; b.rt = 0.15; }
          }
        }
      }
    }
  }
  function scoop(b, u) {
    u.alive = false; u.scooped = true; u.target = null; u.wind = null; u.rush = null;
    b.cargo.push(u); b.scoops++; b.combo = b.comboT > 0 ? b.combo + 1 : 0; b.comboT = 2.5; b.gulp = T.SCOOP_GULP; b.vx *= 1 - T.SCOOP_DRAG; b.vz *= 1 - T.SCOOP_DRAG; b.dashT = 0;
    if (b.aim === u) { b.aim = null; b.rt = Math.max(b.rt, 0.3); }
    const D = Math.min(maxD(b), cbrt(cube(b.D) + T.SCOOP_GROW * cube(u.h))); b.D = D; b.R = D / 2;
    emit({ e: 'scoop', b, u });
  }
  function drop(b, n, all) {                                    // a rammed ball spills monsters back into play for their own team
    for (; (all || n > 0) && b.cargo.length; n--) {
      const u = b.cargo.splice(all ? 0 : Math.floor(rand() * b.cargo.length), 1)[0], a = rand() * 6.283, lim = inner(u) - u.r;
      u.alive = true; u.scooped = false; u.noScoop = 2.5; u.stun = 0; u.frozen = false; u.busy = 0.4; u.rt = 0; u.kx = u.kz = 0; u.launched = 0;      // (busy, not stunned: a stunned monster has no grip on the edge)
      u.x = clamp(b.x + cos(a) * (b.R + u.r + 0.3), -lim, lim); u.z = clamp(b.z + sin(a) * (b.R + u.r + 0.3), -lim, lim);
      if (!field.includes(u)) field.push(u);                    // (scooped this very step: it has not left the list yet)
      const D = Math.max(b.D0, cbrt(Math.max(0, cube(b.D) - T.SCOOP_GROW * cube(u.h)))); b.D = D; b.R = D / 2;
      emit({ e: 'free', b, u });
    }
  }
  function ballOut(b) {
    drop(b, 0, true);                                           // whatever it scooped scrambles back onto the floor
    b.gone = true; b.aim = null; b.dashT = 0;
    emit({ e: 'ballout', b });
    hitStop(0.09);
  }
  function clash() {                                            // ball against ball: the heavier, faster one wins the exchange
    for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      if (a.gone || b.gone) continue;
      const dx = b.x - a.x, dz = b.z - a.z, min = a.R + b.R, d = hyp(dx, dz) || 0.001;
      if (d >= min) continue;
      const nx = dx / d, nz = dz / d, ma = cube(a.D), mb = cube(b.D), sh = (min - d) / (ma + mb);
      a.x -= nx * sh * mb; a.z -= nz * sh * mb; b.x += nx * sh * ma; b.z += nz * sh * ma;
      const va = a.vx * nx + a.vz * nz, vb = b.vx * nx + b.vz * nz, cs = va - vb;
      if (cs <= 0) continue;
      const imp = 1.7 * cs / (1 / ma + 1 / mb);
      a.vx -= imp / ma * nx; a.vz -= imp / ma * nz; b.vx += imp / mb * nx; b.vz += imp / mb * nz; a.dashT = b.dashT = 0;
      if (cs < 3) continue;
      const pa = a.D * Math.sqrt(a.D) * (Math.max(0, va) + 1), pb = b.D * Math.sqrt(b.D) * (Math.max(0, -vb) + 1), loser = pa > pb * 1.15 ? b : pb > pa * 1.15 ? a : null;
      let stunned = false;
      if (loser && stunBall(loser, T.CLASH_STUN)) { const s = loser === b ? 1 : -1; loser.vx += s * nx * 5; loser.vz += s * nz * 5; drop(loser, 1 + (rand() < 0.5 ? 1 : 0)); stunned = true; }
      emit({ e: 'clash', a, b, loser: stunned ? loser : null, speed: cs });
    }
  }

  // ---- state
  let fought = 0, finished = false, winner = -1, timedOut = false, reinT = 0, auto = false;
  const stat = teams.map(() => ({ alive: 0, floor: 0, hp: 0, fav: 0 }));
  function tally() {
    for (let k = 0; k < NT; k++) { const s = stat[k]; s.floor = 0; s.hp = 0; s.fav = 0; for (let i = next[k]; i < recs[k].length; i++) { s.hp += recs[k][i].st.maxHp; if (recs[k][i].fav) s.fav++; } s.alive = recs[k].length - next[k]; }
    for (const u of field) if (u.alive) { const s = stat[u.team]; s.alive++; s.floor++; s.hp += u.hp; if (u.fav) s.fav++; }
    return stat;
  }
  function end(byTime) {
    tally(); timedOut = byTime; winner = -1; let bestF = 0;
    for (let k = 0; k < NT; k++) { const f = stat[k].alive ? stat[k].hp / maxHpAll[k] : 0; if (f > bestF) { bestF = f; winner = k; } }   // most health left, as a share of what it brought
    finished = true;
    emit({ e: 'end', winner, timedOut });
  }

  // ---- one step of the fight
  function step(dt) {
    if (finished) return;
    if (freezeGap > 0) freezeGap -= dt;
    if (freeze > 0) { freeze -= dt; return; }                   // hit-stop: the whole fight holds its breath
    fought += dt; now = fought;
    const r = fought > T.RAMP_AT ? 1 + T.RAMP_RATE * (fought - T.RAMP_AT) : 1;
    if (ramp === 1 && r > 1) emit({ e: 'ramp' });
    ramp = r;
    if (timers.length) {                                        // things due now, in the order they were asked for
      timers.sort((a, b) => a.at - b.at || a.n - b.n);
      while (timers.length && timers[0].at <= now) timers.shift().fn();
    }
    const kd = fade(T.KB_DECAY * dt);
    for (let i = 0; i < field.length; i++) { const u = field[i]; if (u.alive) stepUnit(u, dt, kd); }
    for (let i = shots.length - 1; i >= 0; i--) {               // ranged attacks in flight
      const s = shots[i], t = s.t, dx = t.x - s.x, dz = t.z - s.z, d = hyp(dx, dz) || 0.001, mv = s.speed * dt;
      if (!t.alive || d <= mv + t.r * 0.5) { if (t.alive && !s.miss) strike(s.u, t, 1, { kb: 0.7, dx: t.x - s.sx, dz: t.z - s.sz }); emit({ e: 'shotend', s, hit: t.alive && !s.miss }); shots.splice(i, 1); }
      else { s.x += dx / d * mv; s.z += dz / d * mv; }
    }
    stepMoves(dt);
    for (const b of balls) moveBall(b, dt, auto);
    clash();
    haz.step(dt);
    let w = 0; for (let i = 0; i < field.length; i++) { const u = field[i]; if (u.alive) field[w++] = u; } field.length = w;     // forget the fallen and the scooped
    separate(false);
    // reserves drop in at their corner while there is room on the floor
    reinT -= dt;
    for (let k = 0; k < NT; k++) stat[k].floor = 0;
    for (const u of field) stat[u.team].floor++;
    if (reinT <= 0) {
      reinT = T.REINFORCE_EVERY;
      for (let k = 0; k < NT; k++) if (next[k] < recs[k].length && stat[k].floor < T.FIELD_CAP) {
        const c = recs[k][next[k]++], [cx, cz] = CORNERS[k % 4], a = rand() * 6.283, d = Math.sqrt(rand()) * L * 0.1;
        const lim = half - c.h * 0.3 - 0.3, u = spawn(c, k, clamp(cx * L * 0.3 + cos(a) * d, -lim, lim), clamp(cz * L * 0.3 + sin(a) * d, -lim, lim), T.DROP_TIME);
        u.noScoop = 1.5; stat[k].floor++;
        emit({ e: 'reinforce', u });
      }
    }
    let left = 0;
    for (let k = 0; k < NT; k++) {
      const alive = stat[k].floor + recs[k].length - next[k];
      if (alive > 0) left++;
      if (balls[k].teamOut !== (alive === 0)) { balls[k].teamOut = alive === 0; emit({ e: 'teamout', team: k, out: alive === 0 }); }
    }
    if (left <= 1) end(false); else if (fought >= T.TIME_HARD) end(true);
  }

  return {
    arena, L, half, K, hRef, hOf, onStart, events, field, everyone, balls, shots, waves, pools, haz, recs, next, maxHpAll, topSpeed0, teams,
    get time() { return fought; }, get ramp() { return ramp; }, get finished() { return finished; }, get winner() { return winner; }, get timedOut() { return timedOut; },
    get frozen() { return freeze > 0; },
    set auto(v) { auto = !!v; },
    step, tally,
    reserves: (k) => recs[k].length - next[k],
    status() { tally(); return teams.map((tm, k) => ({ alive: stat[k].alive, all: recs[k].length, hp: maxHpAll[k] ? clamp(stat[k].hp / maxHpAll[k], 0, 1) : 0, scooped: balls[k].cargo.length, favoured: stat[k].fav, ballOut: balls[k].gone })); },
    result() {
      const mvp = everyone.reduce((a, u) => (!a || u.dmg > a.dmg ? u : a), null);
      return { winner, timedOut, seconds: fought, scoops: balls.map((b) => b.scoops), rams: balls.map((b) => b.rams), rallies: balls.map((b) => b.rallies), ringOuts: balls.map((b) => b.ringOuts),
        mvp: mvp && mvp.dmg > 0 ? { name: mvp.spec.name, dex: mvp.spec.dex, team: mvp.team, damage: Math.round(mvp.dmg), kills: mvp.kills } : null };
    },
  };
}
