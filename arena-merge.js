// MERGING, AND THE SIX: three of a kind become one of the next stage of their line, again and again (9 of the first
// stage -> 3 of the second -> 1 of the third). Three of a kind that cannot evolve fuse into a starred, bigger
// version of themselves instead (up to three stars). The strongest six of what that leaves are the team: they are
// the only ones that fight. Everything else still counts: each spare critter adds a sliver of its own six stats to
// all six fighters (see teamBonus), so a big collection makes the six tougher, harder-hitting or quicker.
//
// It is a pure function of the army: no dice and no arena, so every machine in a multiplayer game gets the same
// answer, and what the round's HUD shows a player is exactly what walks into the arena. Slots are Pokedex numbers;
// the table works for the generated stand-ins and the local models alike.
//
//   planArmy(army, { specOf, teamIndex, limit })  ->  { roster, merges, before, after, bench, spares, spareList, spare, bonus }
//     roster  : [{ spec, stars, boost, made, value, kind, ring, goal, from }]   the fighters, strongest first (at most `limit`)
//                 from : [{ spec, count }] the critters it is made of, as they were brought
//                 ring : 0..1, how close this kind is to its next form or star (1 = nothing further to become)
//                 goal : { spec, stars } of what it becomes next, or null
//     merges  : [{ from, to, stars, count }]            what fused, in order
//     bench   : how many merged monsters did not make the roster;  spares: how many critters are not in a fighter
//     spareList: [{ spec, count, add }] the spare critters by kind, weakest first; add is what one of them adds to `spare`
//     spare   : [6] the spare critters' stats added up (each weighted by the root of its height)
//     bonus   : [6] what that is worth: the share added to each of the fighters' stats (0.12 = +12%)
import { STATS } from './critters/battle-data.js';
// (In the game the critters are drawn bigger than the heights the fight was balanced for: see the size curve in
// main.js. A spec then carries the height it had as height0, and that is what everything here goes by.)
const H0 = (s) => s.height0 ?? s.height;

// next stage by slot (first 151). A list means a branch: teams take turns (see pickBranch).
export const EVOLVES = {
  1: 2, 2: 3, 4: 5, 5: 6, 7: 8, 8: 9, 10: 11, 11: 12, 13: 14, 14: 15, 16: 17, 17: 18, 19: 20, 21: 22, 23: 24, 25: 26, 27: 28,
  29: 30, 30: 31, 32: 33, 33: 34, 35: 36, 37: 38, 39: 40, 41: 42, 43: 44, 44: 45, 46: 47, 48: 49, 50: 51, 52: 53, 54: 55,
  56: 57, 58: 59, 60: 61, 61: 62, 63: 64, 64: 65, 66: 67, 67: 68, 69: 70, 70: 71, 72: 73, 74: 75, 75: 76, 77: 78, 79: 80,
  81: 82, 84: 85, 86: 87, 88: 89, 90: 91, 92: 93, 93: 94, 96: 97, 98: 99, 100: 101, 102: 103, 104: 105, 109: 110, 111: 112,
  116: 117, 118: 119, 120: 121, 129: 130, 133: [134, 135, 136], 138: 139, 140: 141, 147: 148, 148: 149,
};
const PREV = {};                      // and the stage before, by slot
for (const k in EVOLVES) for (const to of [].concat(EVOLVES[k])) PREV[to] = +k;
export const SQUAD = 6;               // this many fight
export const MERGE_SIZE = 3;          // this many of a kind make one of the next
export const MAX_STARS = 3;
export const STAR_HEIGHT = 1.22;      // each star draws (and weighs) this much bigger
// A merged monster must be worth more than what went into it, or merging would be a punishment for collecting.
// Fighting strength is roughly health x damage. One monster with the strength of its parts added together still
// loses to those parts (they all hit at once), so the merged one gets MERGE_GAIN times the sum, split evenly
// between health and damage, on top of whatever its new stage gives it naturally.
export const MERGE_GAIN = 1.5;
export const MAX_BOOST = 3.2;
// What the spare critters are worth. Their stats are added up into six totals (see spareOf). Two things come of that:
//   how much: a budget of bonus, 6 x BONUS_AVG x S / (S + BONUS_HALF), where S is the six totals added together. The
//             first critters count most and every one after a little less. BONUS_HALF is about a hundred ordinary
//             critters, so a big haul gets half of all there is.
//   where:    the budget is shared between the six stats by the SQUARE of how far each stat's share of S is above
//             or below what an ordinary mix of critters gives it (USUAL). An ordinary mix gets the same on every
//             stat (at most BONUS_AVG); one that leans towards fast critters gets much more Speed and less of the
//             rest, up to BONUS_STAT_MAX on one stat. So what a player chooses to roll up shows as a shape, no
//             collection can fill every corner, and two teams rarely come out best at the same thing.
// All six stats rising together multiply up (more health, more damage, less damage taken, more attacks): +9% on
// each wins as often as a team made 30% stronger outright, which is what a large, even haul is meant to be worth
// (measured: node tools/arena-test/headless.mjs bonus).
export const BONUS_AVG = 0.18, BONUS_HALF = 31200, BONUS_STAT_MAX = 0.3;
export const STAT_NAMES = ['HP', 'Attack', 'Defence', 'Sp. Atk', 'Sp. Def', 'Speed'];

const DEF = [50, 50, 50, 50, 50, 50];
const statsOf = (spec) => STATS[spec.dex] || DEF;
// One number for the scoreboard and for sorting: base stat total scaled by size (as battle.js always did).
export function power(spec) { const b = statsOf(spec); return (b[0] + b[1] + b[2] + b[3] + b[4] + b[5]) * Math.sqrt(H0(spec)) / 100; }
// Health x damage, in the arena's own terms (see unitStats in arena-sim.js): both scale with the root of height.
export function strength(spec, boost = 1) { const b = statsOf(spec); return b[0] * Math.max(b[1], b[3]) * H0(spec) * boost * boost; }
// What one of every species together would add to each stat, as a share of the whole (times six, so 1 is an even
// share). Critters as a whole lean towards Attack and Speed; measuring a collection against this, rather than
// against an even split, is what lets a lean of the player's own making show.
const USUAL = (() => {
  const t = [0, 0, 0, 0, 0, 0]; let S = 0;
  for (const dex of Object.keys(STATS)) {
    const b = STATS[dex]; let sum = 0, cubes = 0;
    for (let i = 0; i < 6; i++) { sum += b[i]; cubes += b[i] * b[i] * b[i]; }
    for (let i = 0; i < 6; i++) { const v = b[i] * b[i] * b[i] / cubes * sum; t[i] += v; S += v; }
  }
  return t.map((v) => v / S * 6);
})();
// The share added to each stat by spare critters whose stats add up to `spare`.
export function teamBonus(spare) {
  let S = 0, W = 0;
  for (let i = 0; i < 6; i++) S += spare[i] > 0 ? spare[i] : 0;
  if (!(S > 0)) return [0, 0, 0, 0, 0, 0];
  const budget = 6 * BONUS_AVG * S / (S + BONUS_HALF), w = spare.map((v, i) => { const q = v > 0 ? v / S / USUAL[i] : 0; W += q * q; return q * q; });
  return w.map((q) => Math.min(BONUS_STAT_MAX, budget * q / W));
}
// One number for what a bonus is worth in a fight: how much stronger it makes the six (0.3 = 30% stronger). Health
// and damage count in full; taking less and striking more often count for about half as much each. It is for
// showing, not for deciding anything; it agrees with the measured worth of an even bonus (9% on each is about 30%).
export function teamPower(bonus) {
  return (1 + bonus[0]) * (1 + (bonus[1] + bonus[3]) / 2) * Math.sqrt((1 + (bonus[2] + bonus[4]) / 2) * (1 + bonus[5])) - 1;
}
// What one critter adds to `spare` when it is not in a fighter: its stat total (times the root of its height),
// shared out by the cube of each stat, so that it goes mostly to what that critter is best at. A fast critter
// feeds Speed, a tank feeds HP and Defence, and what a player collects shows in the shape of their bonus.
export function spareOf(spec) {
  const b = statsOf(spec), w = Math.sqrt(H0(spec));
  let sum = 0, cubes = 0;
  for (let i = 0; i < 6; i++) { sum += b[i]; cubes += b[i] * b[i] * b[i]; }
  return b.map((v) => (cubes > 0 ? v * v * v / cubes * sum * w : 0));
}

const baseOf = (spec) => spec.base || spec;
const round2 = (v) => Math.round(v * 100) / 100;
const starScale = (stars) => { let k = 1; for (let i = 0; i < stars; i++) k *= STAR_HEIGHT; return k; };   // (not **: the same in every browser)
const pickBranch = (list, n) => list[n % list.length];          // a branching line: teams take turns

// Build the spec for slot `dex` drawn `scale` times its natural height with `stars` stars.
function makeSpec(specOf, dex, scale, stars, titan) {
  const base = specOf(dex);
  if (!base) return null;
  const k = scale * starScale(stars);
  if (Math.abs(k - 1) < 0.005 && !titan) return base;
  const out = Object.assign({}, base, { height: round2(base.height * k), height0: round2(H0(base) * k), base, _pw: 0 });
  if (titan) { out.titan = true; out.id = 'titan' + base.id; out.name = 'Titan ' + base.name; } else if (scale > 1.05) out.giant = true;
  if (stars) out.stars = stars;
  return out;
}

export function planArmy(army, { specOf, teamIndex = 0, limit = SQUAD } = {}) {
  // ---- count what was brought, by kind. A kind is slot + how much bigger than natural it is + titan + stars.
  const kinds = new Map();
  const keyOf = (dex, scale, titan, stars) => dex + '|' + scale + '|' + (titan ? 1 : 0) + '|' + stars;
  const kindOf = (dex, scale, titan, stars) => {
    const key = keyOf(dex, scale, titan, stars);
    let k = kinds.get(key);
    if (!k) { k = { key, dex, scale, titan, stars, plain: 0, brought: 0, fused: [], spec: makeSpec(specOf, dex, scale, stars, titan) }; k.one = k.spec ? spareOf(k.spec) : DEF; kinds.set(key, k); }
    return k;
  };
  for (const spec of army || []) {
    const b = baseOf(spec);
    if (!b || !b.dex) continue;
    const k = kindOf(b.dex, round2(H0(spec) / H0(b)), !!spec.titan, 0);
    k.plain++; k.brought++;
  }
  const before = (army || []).length, merges = [];
  let branchN = teamIndex;
  const nextOf = (k) => { const n = EVOLVES[k.dex]; return n ? kindOf(Array.isArray(n) ? pickBranch(n, branchN) : n, k.scale, k.titan, k.stars) : k.stars < MAX_STARS ? kindOf(k.dex, k.scale, k.titan, k.stars + 1) : null; };

  // ---- merge, lowest slot first (every evolution in the first 151 goes to a higher slot, so one pass up the
  // list finishes every line), then star what cannot evolve, one star level at a time.
  const fuse = (k) => {
    if (!k.spec || (!EVOLVES[k.dex] && k.stars >= MAX_STARS)) return;      // nothing left to become
    const each = strength(k.spec);
    while (k.plain + k.fused.length >= MERGE_SIZE) {
      let sIn = 0, made = 0; const raw = [];             // raw: the critters it is made of, as they were brought
      for (let i = 0; i < MERGE_SIZE; i++) {            // already-merged ones go in first, so their boost is carried up
        if (k.fused.length) { const f = k.fused.pop(); sIn += f.strengthIn; made += f.made; for (const q of f.raw) raw.push(q); }
        else { k.plain--; sIn += each; made += 1; raw.push(k.key); }
      }
      const to = nextOf(k);
      if (Array.isArray(EVOLVES[k.dex])) branchN++;
      // what a merged monster carries forward is the better of what went into it and what its new stage is worth
      // by nature (three weak fish make a sea serpent that is far stronger than they were)
      to.fused.push({ strengthIn: Math.max(sIn * MERGE_GAIN, to.spec ? strength(to.spec) : 0), made, raw });
      const last = merges[merges.length - 1];
      if (last && last.fromKey === k.key && last.toKey === to.key) last.count++;
      else merges.push({ from: k.spec, to: to.spec, fromKey: k.key, toKey: to.key, stars: to.stars, count: 1 });
    }
  };
  // The list is re-read after each kind because fusing adds new ones; a star lands one star level up, which the
  // outer loop reaches next.
  const rank = (a, b) => a.dex - b.dex || a.scale - b.scale || (a.titan ? 1 : 0) - (b.titan ? 1 : 0);
  for (let stars = 0; stars <= MAX_STARS; stars++) {
    const seen = new Set();
    for (;;) {
      const k = [...kinds.values()].filter((q) => q.stars === stars && !seen.has(q)).sort(rank)[0];
      if (!k) break;
      seen.add(k);
      fuse(k);
    }
  }

  // ---- how close each kind is to its next step. `have(k)` is how many of kind k there are, counting the part-made
  // one its smaller stages add up to (two loose first-stage critters are two thirds of a second-stage one).
  const count = (k) => (k ? k.plain + k.fused.length : 0);
  const before1 = (k) => (k.stars > 0 ? kinds.get(keyOf(k.dex, k.scale, k.titan, k.stars - 1)) : PREV[k.dex] ? kinds.get(keyOf(PREV[k.dex], k.scale, k.titan, 0)) : null);
  const have = (k, depth = 0) => { const p = depth < 8 ? before1(k) : null; return count(k) + (p ? Math.min(0.999, have(p, depth + 1) / MERGE_SIZE) : 0); };
  const ringOf = (k) => (EVOLVES[k.dex] || k.stars < MAX_STARS ? Math.min(0.97, have(k) / MERGE_SIZE) : 1);
  const goalOf = (k) => {
    const n = EVOLVES[k.dex];
    if (n) { const dex = Array.isArray(n) ? pickBranch(n, branchN) : n; return { spec: makeSpec(specOf, dex, k.scale, 0, k.titan), stars: 0, kind: keyOf(dex, k.scale, k.titan, k.stars) }; }
    return k.stars < MAX_STARS ? { spec: makeSpec(specOf, k.dex, k.scale, k.stars + 1, k.titan), stars: k.stars + 1, kind: keyOf(k.dex, k.scale, k.titan, k.stars + 1) } : null;
  };

  // ---- the roster: one entry per monster, strongest first; the first `limit` fight
  const roster = [];
  for (const k of kinds.values()) {
    if (!k.spec || !count(k)) continue;
    const natural = strength(k.spec), value = power(k.spec), ring = ringOf(k), goal = goalOf(k);
    for (let i = 0; i < k.plain; i++) roster.push({ spec: k.spec, stars: k.stars, boost: 1, made: 1, value, kind: k.key, ring, goal, raw: [k.key] });
    for (const f of k.fused) {
      const boost = Math.min(MAX_BOOST, Math.max(1, Math.sqrt(f.strengthIn / natural)));
      roster.push({ spec: k.spec, stars: k.stars, boost, made: Math.round(f.made), value: value * boost, kind: k.key, ring, goal, raw: f.raw });
    }
  }
  roster.sort((a, b) => b.value - a.value || a.spec.dex - b.spec.dex || H0(b.spec) - H0(a.spec));
  const after = roster.length;
  roster.length = Math.min(roster.length, limit);
  for (const r of roster) {                                     // what each fighter is made of, as it was brought: [{ spec, count }]
    const n = new Map(); for (const q of r.raw) n.set(q, (n.get(q) || 0) + 1);
    r.from = [...n].map(([key, count]) => ({ spec: kinds.get(key).spec, count }));
  }
  // ---- everything that is not part of a fighter backs them
  const usedRaw = new Map(), spare = [0, 0, 0, 0, 0, 0], spareList = [];
  let spares = 0;
  for (const r of roster) for (const q of r.raw) usedRaw.set(q, (usedRaw.get(q) || 0) + 1);
  for (const k of kinds.values()) {
    const count = k.brought - (usedRaw.get(k.key) || 0);
    if (count <= 0 || !k.spec) continue;
    spareList.push({ spec: k.spec, count, add: k.one, value: power(k.spec) }); spares += count;
    for (let i = 0; i < 6; i++) spare[i] += k.one[i] * count;
  }
  spareList.sort((a, b) => a.value - b.value || a.spec.dex - b.spec.dex || H0(a.spec) - H0(b.spec));
  return { roster, merges, before, after, bench: after - roster.length, spares, spareList, spare, bonus: teamBonus(spare) };
}
