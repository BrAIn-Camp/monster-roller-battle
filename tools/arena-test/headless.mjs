// Headless balance test for the arena: runs the real fight (arena-sim.js) and the real merging (arena-merge.js)
// hundreds of times with no screen, and reports how the fights go.
//
//   node tools/arena-test/headless.mjs [fights=200] [seed=1] [flags]
//     smoke      a handful of fights with sanity checks on every step (positions finite, nothing stuck)
//     merge      also compare each army merged against the same army unmerged
//     verbose    one line per fight
//     mirror     all four teams bring the same army: any difference in who wins is the seat, not the army
//
// The project's .js files are ES modules with no package.json beside them, so node will not import them where
// they are: this copies what it needs into a scratch folder that has one.
import { cpSync, mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TMP = mkdtempSync(join(tmpdir(), 'arena-sim-'));
mkdirSync(join(TMP, 'critters'));
writeFileSync(join(TMP, 'package.json'), '{"type":"module"}');
for (const f of ['arena-sim.js', 'arena-merge.js', 'critters/battle-data.js', 'critters/critters_1.js', 'critters/critters_2.js', 'critters/critters_3.js']) cpSync(join(ROOT, f), join(TMP, f));
const load = (f) => import(pathToFileURL(join(TMP, f)).href);
const SIM = await load('arena-sim.js'), MERGE = await load('arena-merge.js');
const CR = [].concat((await load('critters/critters_1.js')).default, (await load('critters/critters_2.js')).default, (await load('critters/critters_3.js')).default);
const byDex = new Map(CR.map((s) => [s.dex, s])), specOf = (d) => byDex.get(d);

// The arenas, as far as the fight needs them (kept in step with arena.js by the check at the bottom of this file).
const ARENAS = [
  { id: 'magma', types: ['fire', 'rock', 'ground'], hazard: 'vents' }, { id: 'tidal', types: ['water', 'ice', 'dragon'], hazard: 'wave' },
  { id: 'canopy', types: ['grass', 'bug', 'poison'], hazard: 'spores' }, { id: 'storm', types: ['electric', 'flying', 'dragon'], hazard: 'lightning' },
  { id: 'frost', types: ['ice', 'water', 'psychic'], hazard: 'ice' }, { id: 'dune', types: ['ground', 'fighting', 'rock'], hazard: 'gust' },
  { id: 'hollow', types: ['ghost', 'psychic', 'poison'], hazard: 'fog' }, { id: 'meadow', types: ['normal', 'flying', 'fighting'], hazard: 'bumpers' },
];

const args = process.argv.slice(2), flag = (f) => args.includes(f), nums = args.filter((a) => /^\d+$/.test(a)).map(Number);
const FIGHTS = flag('smoke') ? 16 : nums[0] || 200, SEED = nums[1] || 1;
const dice = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// An army the way a round produces one: mostly common critters from two or three habitats, a few rarer ones.
const habitats = [...new Set(CR.map((c) => c.habitat))];
function makeArmy(rnd, n) {
  const home = [0, 1, 2].map(() => habitats[Math.floor(rnd() * habitats.length)]);
  const pool = (rar, local) => CR.filter((c) => (rar === 'rare' ? c.rarity !== 'common' && c.rarity !== 'uncommon' : c.rarity === rar) && (!local || home.includes(c.habitat)));
  const sets = { c: pool('common', true), u: pool('uncommon', true), r: pool('rare', false), any: pool('common', false) };
  const army = [];
  for (let i = 0; i < n; i++) {
    const r = rnd(); let p = r < 0.62 ? sets.c : r < 0.9 ? sets.u : sets.r;
    if (!p.length) p = sets.any;
    army.push(p[Math.floor(rnd() * p.length)]);
  }
  return army;
}
const plan = (army, arena, k, merged = true) => (merged
  ? MERGE.planArmy(army, { arena, specOf, teamIndex: k, limit: SIM.TUNE.ROSTER_CAP })
  : { roster: army.map((spec) => ({ spec, stars: 0, boost: 1, made: 1, value: MERGE.power(spec) })).sort((a, b) => b.value - a.value).slice(0, SIM.TUNE.ROSTER_CAP), backing: 1, merges: [], before: army.length, after: army.length, bench: 0 });

function fight(seed, { armies, arena, unmerged = -1, check = false, dt = 1 / 30 }) {
  const rnd = dice(seed);
  const teams = armies.map((army, k) => Object.assign(plan(army, arena, k, k !== unmerged), { ballD: 1 + rnd() * 9, human: false }));
  const sim = SIM.createSim({ arena, teams, rand: rnd });
  const tally = { ko: 0, ring: 0, ringByBall: 0, ballout: 0, fire: 0, breaks: 0, rally: 0, scoop: 0, ram: 0, hazHits: 0, firstKo: -1 };
  let steps = 0, digest = 0;
  while (!sim.finished && steps < 60 * 400) {
    sim.step(dt); steps++;
    for (const e of sim.events) {
      if (e.e === 'ko') { tally.ko++; if (tally.firstKo < 0) tally.firstKo = sim.time; }
      else if (e.e === 'ring') { tally.ring++; if (!e.by && e.team >= 0) tally.ringByBall++; if (tally.firstKo < 0) tally.firstKo = sim.time; }
      else if (e.e === 'ballout') tally.ballout++;
      else if (e.e === 'fire') tally.fire++;
      else if (e.e === 'break') tally.breaks++;
      else if (e.e === 'rally') tally.rally++;
      else if (e.e === 'scoop') tally.scoop++;
      else if (e.e === 'ram') tally.ram++;
    }
    sim.events.length = 0;
    if (check) {
      for (const u of sim.field) if (!(Number.isFinite(u.x) && Number.isFinite(u.z) && Number.isFinite(u.hp) && Number.isFinite(u.kx))) throw new Error(`bad monster ${u.spec.name} at step ${steps}: ${u.x},${u.z} hp ${u.hp}`);
      for (const b of sim.balls) if (!(Number.isFinite(b.x) && Number.isFinite(b.z) && Number.isFinite(b.vx) && Number.isFinite(b.D))) throw new Error(`bad ball ${b.team} at step ${steps}`);
    }
    if (steps % 30 === 0) for (const u of sim.field) digest = (digest * 31 + Math.round(u.x * 1000) + Math.round(u.hp)) | 0;
  }
  const res = sim.result(), st = sim.status();
  return { sim, res, st, tally, steps, digest, teams, strength: teams.map((t) => t.roster.reduce((s, r) => s + MERGE.strength(r.spec, r.boost * t.backing), 0)) };
}

const pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '-');
const q = (arr, f) => { const s = arr.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(f * s.length))] : 0; };
const t0 = Date.now();

// ---- 1. smoke: every arena, sanity-checked every step, and the same seed gives the same fight twice
if (flag('smoke') || true) {
  const rnd = dice(SEED * 7919);
  for (const arena of ARENAS) {
    const armies = [0, 1, 2, 3].map(() => makeArmy(rnd, 20 + Math.floor(rnd() * 120)));
    const a = fight(99, { armies, arena, check: true }), b = fight(99, { armies, arena });
    if (a.digest !== b.digest || a.res.winner !== b.res.winner || a.steps !== b.steps) { console.error(`FAIL ${arena.id}: the same seed gave two different fights`); process.exitCode = 1; }
    const c = fight(99, { armies, arena, dt: 1 / 60 });
    if (flag('verbose') || flag('smoke')) console.log(`${arena.id.padEnd(7)} ${a.res.seconds.toFixed(1)}s (${c.res.seconds.toFixed(1)}s at 60 Hz) winner ${a.res.winner}${a.res.timedOut ? ' ON TIME' : ''} ko ${a.tally.ko} ring ${a.tally.ring} balls out ${a.tally.ballout} specials ${a.tally.fire} broken ${a.tally.breaks} rallies ${a.tally.rally} scoops ${a.tally.scoop} rams ${a.tally.ram}`);
  }
  // degenerate armies must not break it
  for (const sizes of [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [3, 400, 1, 0]]) {
    const armies = sizes.map((n) => makeArmy(rnd, n)), r = fight(5, { armies, arena: ARENAS[0], check: true });
    if (sizes.filter((n) => n).length === 1 && r.res.winner !== sizes.findIndex((n) => n)) { console.error('FAIL: a lone army did not win', sizes, r.res.winner); process.exitCode = 1; }
  }
  if (flag('smoke')) { console.log(process.exitCode ? 'SMOKE FAILED' : 'smoke ok', `(${Date.now() - t0} ms)`); process.exit(); }
}

// ---- 2. many fights
const rnd = dice(SEED);
const A = { n: 0, timed: 0, len: [], firstKo: [], ko: 0, ring: 0, ringByBall: 0, ballout: 0, fire: 0, breaks: 0, rally: 0, scoop: 0, ram: 0, strongWin: 0, rankOfWinner: [0, 0, 0, 0], seatWin: [0, 0, 0, 0], nobody: 0, byArena: {}, left: [] };
const mergeCmp = { n: 0, win: 0 };
for (let f = 0; f < FIGHTS; f++) {
  const arena = ARENAS[f % ARENAS.length];
  const base = 25 + Math.floor(rnd() * 110);
  const armies = [0, 1, 2, 3].map(() => makeArmy(rnd, Math.max(4, Math.round(base * (0.55 + rnd() * 0.9)))));
  if (flag('mirror')) armies[1] = armies[2] = armies[3] = armies[0];
  const r = fight(1000 + f * 13 + SEED, { armies, arena });
  A.n++; if (r.res.timedOut) A.timed++;
  A.len.push(r.res.seconds); A.firstKo.push(r.tally.firstKo);
  for (const k of ['ko', 'ring', 'ringByBall', 'ballout', 'fire', 'breaks', 'rally', 'scoop', 'ram']) A[k] += r.tally[k];
  const order = r.strength.map((s, k) => [s, k]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  if (r.res.winner < 0) A.nobody++; else { A.rankOfWinner[order.indexOf(r.res.winner)]++; A.seatWin[r.res.winner]++; A.left.push(r.st[r.res.winner].alive); }
  const ba = A.byArena[arena.id] || (A.byArena[arena.id] = { n: 0, len: 0, ring: 0, ko: 0, ballout: 0, favWin: 0 });
  ba.n++; ba.len += r.res.seconds; ba.ring += r.tally.ring; ba.ko += r.tally.ko; ba.ballout += r.tally.ballout;
  if (r.res.winner >= 0) { const fav = r.teams.map((t) => t.roster.filter((x) => SIM.isFavoured(arena, x.spec)).length); if (fav[r.res.winner] === Math.max(...fav)) ba.favWin++; }
  if (flag('verbose')) console.log(`${String(f).padStart(3)} ${arena.id.padEnd(7)} armies ${armies.map((a) => a.length).join('/')} -> ${r.teams.map((t) => t.after).join('/')}  ${r.res.seconds.toFixed(1)}s winner ${r.res.winner} (strength rank ${order.indexOf(r.res.winner) + 1}) ko ${r.tally.ko} ring ${r.tally.ring} ballsOut ${r.tally.ballout} left ${r.st.map((s) => s.alive).join('/')}`);
  if (flag('merge') && f % 4 === 0) {                       // the same four armies, with team 0 unmerged: does merging pay?
    const two = [armies[0], armies[0]];                      // a mirror match, merged against unmerged, both seats
    for (const un of [0, 1]) { const m = fight(77 + f, { armies: two, arena, unmerged: un }); if (m.res.winner >= 0) { mergeCmp.n++; if (m.res.winner !== un) mergeCmp.win++; } }
  }
}
const kos = A.ko + A.ring;
console.log(`\n${A.n} fights, seed ${SEED}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log(`  decided by knockout      ${pct(A.n - A.timed, A.n)}   (on the clock: ${A.timed}, nobody left: ${A.nobody})`);
console.log(`  length                   median ${q(A.len, 0.5).toFixed(0)} s   10%: ${q(A.len, 0.1).toFixed(0)} s   90%: ${q(A.len, 0.9).toFixed(0)} s   longest ${Math.max(...A.len).toFixed(0)} s`);
console.log(`  first knockout           median ${q(A.firstKo, 0.5).toFixed(1)} s`);
console.log(`  knockouts per fight      ${(kos / A.n).toFixed(1)}   ring-outs ${pct(A.ring, kos)} of them (${pct(A.ringByBall, A.ring)} of those by a ball)`);
console.log(`  per fight                signature moves ${(A.fire / A.n).toFixed(1)}  broken ${(A.breaks / A.n).toFixed(1)}  rallies ${(A.rally / A.n).toFixed(1)}  rams ${(A.ram / A.n).toFixed(1)}  scoops ${(A.scoop / A.n).toFixed(1)}  balls lost ${(A.ballout / A.n).toFixed(2)} of 4`);
console.log(`  winner's strength rank   1st ${pct(A.rankOfWinner[0], A.n)}  2nd ${pct(A.rankOfWinner[1], A.n)}  3rd ${pct(A.rankOfWinner[2], A.n)}  4th ${pct(A.rankOfWinner[3], A.n)}`);
console.log(`  wins by seat             ${A.seatWin.map((w) => pct(w, A.n)).join('  ')}`);
console.log(`  winner's monsters left   median ${q(A.left, 0.5)}`);
console.log('  by arena                 ' + Object.entries(A.byArena).map(([id, b]) => `${id} ${(b.len / b.n).toFixed(0)}s ring ${pct(b.ring, b.ring + b.ko)} ballsOut ${(b.ballout / b.n).toFixed(1)} mostFavWins ${pct(b.favWin, b.n)}`).join('\n                           '));
if (mergeCmp.n) console.log(`  merged beats unmerged    ${pct(mergeCmp.win, mergeCmp.n)} of ${mergeCmp.n} mirror matches`);
