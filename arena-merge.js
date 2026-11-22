// MERGING: before an arena fight, three of a kind become one of the next stage of their line, again and again
// (9 of the first stage -> 3 of the second -> 1 of the third). Three of a kind that cannot evolve fuse into a
// starred, bigger version of themselves instead (up to three stars). What is left over fights as it is.
//
// It is a pure function of the army and the arena: no dice, so every machine in a multiplayer game merges the
// same way. Slots are Pokedex numbers; the table works for the generated stand-ins and the local models alike.
//
//   planArmy(army, { arena, specOf, teamIndex, limit })  ->  { roster, merges, before, after, bench, backing }
//     roster  : [{ spec, stars, boost, made, value }]   strongest first, ready for the arena (at most `limit`)
//     merges  : [{ from, to, stars, count }]            what fused, in order, for the intro animation
//     bench   : how many merged monsters did not make the roster
//     backing : what the bench is worth to the ones who did: a multiplier on their health and damage
import { STATS } from './critters/battle-data.js';

// next stage by slot (first 151). A list means a branch: the arena decides (see pickBranch).
export const EVOLVES = {
  1: 2, 2: 3, 4: 5, 5: 6, 7: 8, 8: 9, 10: 11, 11: 12, 13: 14, 14: 15, 16: 17, 17: 18, 19: 20, 21: 22, 23: 24, 25: 26, 27: 28,
  29: 30, 30: 31, 32: 33, 33: 34, 35: 36, 37: 38, 39: 40, 41: 42, 43: 44, 44: 45, 46: 47, 48: 49, 50: 51, 52: 53, 54: 55,
  56: 57, 58: 59, 60: 61, 61: 62, 63: 64, 64: 65, 66: 67, 67: 68, 69: 70, 70: 71, 72: 73, 74: 75, 75: 76, 77: 78, 79: 80,
  81: 82, 84: 85, 86: 87, 88: 89, 90: 91, 92: 93, 93: 94, 96: 97, 98: 99, 100: 101, 102: 103, 104: 105, 109: 110, 111: 112,
  116: 117, 118: 119, 120: 121, 129: 130, 133: [134, 135, 136], 138: 139, 140: 141, 147: 148, 148: 149,
};
export const MERGE_SIZE = 3;          // this many of a kind make one of the next
export const MAX_STARS = 3;
export const STAR_HEIGHT = 1.22;      // each star draws (and weighs) this much bigger
// A merged monster must be worth more than what went into it, or merging would be a punishment for collecting.
// Fighting strength is roughly health x damage. One monster with the strength of its parts added together still
// loses to those parts (they all hit at once), so the merged one gets MERGE_GAIN times the sum, split evenly
// between health and damage, on top of whatever its new stage gives it naturally.
export const MERGE_GAIN = 1.5;
export const MAX_BOOST = 3.2;
// Only the strongest fight. The rest back them from the stands: the roster's health and damage rise by the root of
// (1 + BACKING x bench strength / roster strength), capped, so a big collection still counts without a fight that
// has to grind through a hundred reserves.
export const BACKING = 0.5, MAX_BACKING = 1.5;

const DEF = [50, 50, 50, 50, 50, 50];
const statsOf = (spec) => STATS[spec.dex] || DEF;
// One number for the scoreboard and for sorting: base stat total scaled by size (as battle.js always did).
export function power(spec) { const b = statsOf(spec); return (b[0] + b[1] + b[2] + b[3] + b[4] + b[5]) * Math.sqrt(spec.height) / 100; }
// Health x damage, in the arena's own terms (see unitStats in arena-sim.js): both scale with the root of height.
export function strength(spec, boost = 1) { const b = statsOf(spec); return b[0] * Math.max(b[1], b[3]) * spec.height * boost * boost; }

const baseOf = (spec) => spec.base || spec;
const round2 = (v) => Math.round(v * 100) / 100;

function pickBranch(list, arena, specOf, n) {      // a branching line: the form this arena favours, else take turns
  if (arena && arena.types) for (const dex of list) { const sp = specOf(dex); if (sp && sp.types.some((t) => arena.types.includes(t))) return dex; }
  return list[n % list.length];
}

// Build the spec for slot `dex` drawn `scale` times its natural height with `stars` stars.
function makeSpec(specOf, dex, scale, stars, titan) {
  const base = specOf(dex);
  if (!base) return null;
  const k = scale * STAR_HEIGHT ** stars;
  if (Math.abs(k - 1) < 0.005 && !titan) return base;
  const out = Object.assign({}, base, { height: round2(base.height * k), base, _pw: 0 });
  if (titan) { out.titan = true; out.id = 'titan' + base.id; out.name = 'Titan ' + base.name; } else if (scale > 1.05) out.giant = true;
  if (stars) out.stars = stars;
  return out;
}

export function planArmy(army, { arena = null, specOf, teamIndex = 0, limit = Infinity } = {}) {
  // ---- count what was brought, by kind. A kind is slot + how much bigger than natural it is + titan + stars.
  const kinds = new Map();
  const keyOf = (dex, scale, titan, stars) => dex + '|' + scale + '|' + (titan ? 1 : 0) + '|' + stars;
  const add = (dex, scale, titan, stars, n, strengthIn, made) => {
    const key = keyOf(dex, scale, titan, stars);
    let k = kinds.get(key);
    if (!k) { k = { key, dex, scale, titan, stars, plain: 0, fused: [] }; kinds.set(key, k); }
    if (made > 1) {
      // what a merged monster carries forward is the better of what went into it and what its new stage is worth
      // by nature (three weak fish make a sea serpent that is far stronger than they were)
      const sp = makeSpec(specOf, dex, scale, stars, titan), carried = Math.max(strengthIn, sp ? strength(sp) : 0);
      for (let i = 0; i < n; i++) k.fused.push({ strengthIn: carried, made });
    } else k.plain += n;
    return k;
  };
  for (const spec of army || []) {
    const b = baseOf(spec);
    if (!b || !b.dex) continue;
    add(b.dex, round2(spec.height / b.height), !!spec.titan, 0, 1, 0, 1);
  }
  const before = (army || []).length, merges = [];
  let branchN = teamIndex;

  // ---- merge, lowest slot first (every evolution in the first 151 goes to a higher slot, so one pass up the
  // list finishes every line), then star what cannot evolve, one star level at a time.
  const fuse = (k) => {
    const next = EVOLVES[k.dex];
    if (!next && k.stars >= MAX_STARS) return;          // nothing left to become
    const sp = makeSpec(specOf, k.dex, k.scale, k.stars, k.titan);
    if (!sp) return;
    const each = strength(sp);
    while (k.plain + k.fused.length >= MERGE_SIZE) {
      let sIn = 0, made = 0;
      for (let i = 0; i < MERGE_SIZE; i++) {            // already-merged ones go in first, so their boost is carried up
        if (k.fused.length) { const f = k.fused.pop(); sIn += f.strengthIn; made += f.made; } else { k.plain--; sIn += each; made += 1; }
      }
      const to = next
        ? add(Array.isArray(next) ? pickBranch(next, arena, specOf, branchN++) : next, k.scale, k.titan, k.stars, 1, sIn * MERGE_GAIN, made)
        : add(k.dex, k.scale, k.titan, k.stars + 1, 1, sIn * MERGE_GAIN, made);
      const toKey = keyOf(to.dex, to.scale, to.titan, to.stars), last = merges[merges.length - 1];
      if (last && last.fromKey === k.key && last.toKey === toKey) last.count++;
      else merges.push({ from: sp, to: makeSpec(specOf, to.dex, to.scale, to.stars, to.titan), fromKey: k.key, toKey, stars: to.stars, count: 1 });
    }
  };
  // Every evolution in the first 151 goes to a higher slot, so walking up the slots finishes a whole line in one
  // pass; a star lands one star level up, which the outer loop reaches next. The list is re-read after each kind
  // because fusing adds new ones.
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

  // ---- the roster: one entry per monster that will fight, strongest first
  const roster = [];
  for (const k of kinds.values()) {
    const spec = makeSpec(specOf, k.dex, k.scale, k.stars, k.titan);
    if (!spec) continue;
    const natural = strength(spec), value = power(spec);
    for (let i = 0; i < k.plain; i++) roster.push({ spec, stars: k.stars, boost: 1, made: 1, value });
    for (const f of k.fused) {
      const boost = Math.min(MAX_BOOST, Math.max(1, Math.sqrt(f.strengthIn / natural)));
      roster.push({ spec, stars: k.stars, boost, made: Math.round(f.made), value: value * boost });
    }
  }
  roster.sort((a, b) => b.value - a.value || a.spec.dex - b.spec.dex || b.spec.height - a.spec.height);
  const after = roster.length, benched = roster.splice(Math.min(roster.length, limit));
  const sum = (list) => list.reduce((s, r) => s + strength(r.spec, r.boost), 0);
  const backing = benched.length ? Math.min(MAX_BACKING, Math.sqrt(1 + BACKING * sum(benched) / Math.max(1, sum(roster)))) : 1;
  return { roster, merges, before, after, bench: benched.length, backing };
}
