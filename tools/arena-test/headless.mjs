// Headless balance test for the arena: runs the real fight (arena-sim.js) and the real merging (arena-merge.js)
// hundreds of times with no screen, and reports how the fights go.
//
//   node tools/arena-test/headless.mjs [fights=200] [seed=1] [flags]
//     smoke      a handful of fights with sanity checks on every step (positions finite, nothing stuck)
//     merge      also compare each army merged against the same army unmerged
//     verbose    one line per fight
//     moves      a table of the signature moves: how often each is used and what one use is worth
//     mirror     all four teams bring the same army: any difference in who wins is the seat, not the army
//     bonus      what the spare critters are worth: the same six against themselves, one side with its spares'
//                stat bonus and one without, beside the same test with one side simply made 15/30/60% stronger
//     tune=HP_SCALE:13,RAMP_AT:40   try other tuning values (the names in TUNE, arena-sim.js)
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
// tune=HP_SCALE:13,RAMP_AT:40 tries other numbers without editing arena-sim.js
for (const a of args) if (a.startsWith('tune=')) for (const kv of a.slice(5).split(',')) { const [k, v] = kv.split(':'); if (!(k in SIM.TUNE)) throw new Error('no such tuning value: ' + k); SIM.TUNE[k] = +v; }
const FIGHTS = flag('smoke') ? 16 : nums[0] || 200, SEED = nums[1] || 1;
const MOVE = {};                                            // per signature move: uses and what they did (for the `moves` table)
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
  ? MERGE.planArmy(army, { specOf, teamIndex: k, limit: SIM.TUNE.ROSTER_CAP })
  : { roster: army.map((spec) => ({ spec, stars: 0, boost: 1, made: 1, value: MERGE.power(spec) })).sort((a, b) => b.value - a.value).slice(0, SIM.TUNE.ROSTER_CAP), bonus: [0, 0, 0, 0, 0, 0], merges: [], before: army.length, after: army.length, bench: 0 });

function fight(seed, { armies, arena, unmerged = -1, check = false, dt = 1 / 30, noBonus = null, stronger = null }) {
  const rnd = dice(seed);
  const teams = armies.map((army, k) => Object.assign(plan(army, arena, k, k !== unmerged), { ballD: 1 + rnd() * 9, human: false }));
  if (noBonus) teams.forEach((t, k) => { if (noBonus === true || noBonus.includes(k)) t.bonus = [0, 0, 0, 0, 0, 0]; });
  if (stronger) teams.forEach((t, k) => { if (stronger[k]) t.roster = t.roster.map((r) => Object.assign({}, r, { boost: r.boost * Math.sqrt(stronger[k]) })); });
  const sim = SIM.createSim({ arena, teams, rand: rnd });
  const tally = { ko: 0, ring: 0, ringByBall: 0, ballout: 0, fire: 0, breaks: 0, rally: 0, scoop: 0, ram: 0, hazHits: 0, firstKo: -1 };
  let steps = 0, digest = 0;
  while (!sim.finished && steps < 60 * 400) {
    sim.step(dt); steps++;
    for (const e of sim.events) {
      if (e.e === 'ko') { tally.ko++; if (tally.firstKo < 0) tally.firstKo = sim.time; }
      else if (e.e === 'ring') { tally.ring++; if (e.t._sp && sim.time - e.t._spT < 2 && MOVE[e.t._sp]) MOVE[e.t._sp].ring++; if (!e.by && e.team >= 0) tally.ringByBall++; if (tally.firstKo < 0) tally.firstKo = sim.time; }
      else if (e.e === 'ballout') tally.ballout++;
      else if (e.e === 'fire') { tally.fire++; const m = MOVE[e.w.move] || (MOVE[e.w.move] = { uses: 0, dmg: 0, ko: 0, ring: 0, hits: 0 }); m.uses++; }
      else if (e.e === 'hit' && (e.special || e.pool) && e.u) {              // what a signature move did: health taken (in whole monsters), knockouts, and ring-outs soon after
        const m = MOVE[e.type] || (MOVE[e.type] = { uses: 0, dmg: 0, ko: 0, ring: 0, hits: 0 });
        m.hits++; m.dmg += Math.min(1, e.dmg / e.t.st.maxHp); if (e.t.hp <= 0) m.ko++;
        e.t._sp = e.type; e.t._spT = sim.time;
      }
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
  return { sim, res, st, tally, steps, digest, teams, strength: teams.map((t) => t.roster.reduce((s, r) => s + MERGE.strength(r.spec, r.boost), 0) * (1 + t.bonus[0]) * (1 + Math.max(t.bonus[1], t.bonus[3]))) };
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
  // merging never loses or invents a critter: what went into the roster adds up to what was brought
  for (let i = 0; i < 300; i++) {
    const army = makeArmy(rnd, 1 + Math.floor(rnd() * 260)), p = MERGE.planArmy(army, { specOf, teamIndex: i % 4, limit: Infinity });
    const made = p.roster.reduce((n, r) => n + r.made, 0);
    if (made !== army.length || p.after !== p.roster.length || p.before !== army.length) { console.error(`FAIL merge: ${army.length} critters became a roster made of ${made}`); process.exitCode = 1; break; }
    if (p.spares !== 0 || p.spare.some((v) => v !== 0)) { console.error('FAIL merge: with everyone fighting there should be no spares', p.spares, p.spare); process.exitCode = 1; break; }
    const six = MERGE.planArmy(army, { specOf, teamIndex: i % 4 });
    if (six.roster.length !== Math.min(6, p.after) || six.spares !== army.length - six.roster.reduce((n, r) => n + r.made, 0)) { console.error('FAIL merge: the six do not add up'); process.exitCode = 1; break; }
    if (six.roster.some((r, j) => r.kind !== p.roster[j].kind || !(r.ring > 0 && r.ring <= 1) || (r.ring === 1) !== !r.goal)) { console.error('FAIL merge: the six are not the strongest six, or a ring is out of range'); process.exitCode = 1; break; }
    if (six.bonus.some((v) => !(v >= 0 && v < MERGE.BONUS_MAX))) { console.error('FAIL merge: a bonus is out of range', six.bonus); process.exitCode = 1; break; }
    if (p.roster.some((r) => !(r.boost >= 1 && r.boost <= MERGE.MAX_BOOST) || r.stars > MERGE.MAX_STARS)) { console.error('FAIL merge: a boost or star count is out of range'); process.exitCode = 1; break; }
    for (let j = 1; j < p.roster.length; j++) if (p.roster[j].value > p.roster[j - 1].value + 1e-9) { console.error('FAIL merge: roster is not strongest first'); process.exitCode = 1; break; }
  }
  // degenerate armies must not break it
  for (const sizes of [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [3, 400, 1, 0]]) {
    const armies = sizes.map((n) => makeArmy(rnd, n)), r = fight(5, { armies, arena: ARENAS[0], check: true });
    if (sizes.filter((n) => n).length === 1 && r.res.winner !== sizes.findIndex((n) => n)) { console.error('FAIL: a lone army did not win', sizes, r.res.winner); process.exitCode = 1; }
  }
  if (flag('smoke')) { console.log(process.exitCode ? 'SMOKE FAILED' : 'smoke ok', `(${Date.now() - t0} ms)`); process.exit(); }
}

// ---- 1b. what a collection is worth (see BONUS_MAX in arena-merge.js)
if (flag('bonus')) {
  const rnd = dice(SEED * 31), N = Math.max(100, nums[0] || 300);
  console.log('');
  console.log('  spare critters  bonus on each stat (HP Atk Def SpA SpD Spe), averaged over 60 armies');
  for (const n of [10, 25, 50, 100, 150, 200]) {
    const sum = [0, 0, 0, 0, 0, 0]; let spares = 0;
    for (let i = 0; i < 60; i++) { const p = MERGE.planArmy(makeArmy(rnd, n), { specOf }); p.bonus.forEach((v, j) => { sum[j] += v; }); spares += p.spares; }
    console.log(`  ${String(n).padStart(5)} brought, ${(spares / 60).toFixed(0).padStart(3)} spare    ` + sum.map((v) => '+' + (v / 60 * 100).toFixed(0).padStart(2) + '%').join(' '));
  }
  const duel = (label, opts) => {
    let win = 0, n = 0;
    for (let f = 0; f < N; f++) {
      const army = makeArmy(rnd, opts.size || 110), seat = f % 2;
      const r = fight(500 + f, Object.assign({ armies: [army, army], arena: ARENAS[f % 8] }, opts.make(seat)));
      if (r.res.winner >= 0) { n++; if (r.res.winner === seat) win++; }
    }
    console.log(`  ${label.padEnd(44)} wins ${pct(win, n)} of ${n} duels against the same six`);
  };
  console.log('');
  for (const size of [30, 60, 110, 200]) duel(`bonus from an army of ${size}`, { size, make: (seat) => ({ noBonus: [1 - seat] }) });
  for (const k of [1.15, 1.3, 1.6, 2]) duel(`simply ${Math.round((k - 1) * 100)}% stronger (health x damage)`, { make: (seat) => ({ noBonus: true, stronger: seat ? [0, k] : [k, 0] }) });
  process.exit();
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
if (flag('moves')) {
  console.log('\n  signature moves          uses/fight   foes hit   health taken   knockouts   ring-outs   (the last three per use; health in whole monsters)');
  for (const [type, m] of Object.entries(MOVE).sort((a, b) => (b[1].dmg + b[1].ko + b[1].ring) / b[1].uses - (a[1].dmg + a[1].ko + a[1].ring) / a[1].uses))
    console.log(`    ${(SIM.MOVES[type].name + ' (' + type + ')').padEnd(26)} ${(m.uses / A.n).toFixed(1).padStart(6)} ${(m.hits / m.uses).toFixed(2).padStart(10)} ${(m.dmg / m.uses).toFixed(2).padStart(12)} ${(m.ko / m.uses).toFixed(2).padStart(12)} ${(m.ring / m.uses).toFixed(2).padStart(11)}`);
}
