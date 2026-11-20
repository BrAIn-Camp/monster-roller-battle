// Headless checks for arena.js. three.js is not installed in the project, so run it from a scratch folder:
//   mkdir %TEMP%\arena-check && cd %TEMP%\arena-check && npm init -y && npm install three@0.160.0
//   copy this file there, then:   set SRC=<project folder>   and   node headless.mjs [dom]
// It copies arena.js and the critter data next to itself (so 'three' resolves from the scratch node_modules).
// "dom" runs with a stub document so the HUD and wheel DOM code paths execute as well.
import { cpSync, mkdirSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
const SRC = process.env.SRC;
if (!SRC) throw new Error('set SRC to the project folder');
mkdirSync('critters', { recursive: true });
cpSync(SRC + '/arena.js', './arena.js');
for (const f of ['battle-data.js', 'critters_1.js', 'critters_2.js', 'critters_3.js']) cpSync(SRC + '/critters/' + f, './critters/' + f);
if (process.argv.includes('dom')) {
  const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  const mk = () => {
    const e = { style: {}, children: [], _cls: new Set(), appendChild(c) { this.children.push(c); c.parent = this; return c; }, remove() { this.removed = true; }, getContext: () => ctx };
    e.classList = { add: (...a) => a.forEach((x) => e._cls.add(x)), remove: (...a) => a.forEach((x) => e._cls.delete(x)), toggle: (x, on) => { if (on === undefined ? !e._cls.has(x) : on) e._cls.add(x); else e._cls.delete(x); } };
    return e;
  };
  globalThis.document = { createElement: mk, getElementById: () => null, head: mk(), body: mk() };
  globalThis.window = { innerWidth: 1280, innerHeight: 720 };
}
const THREE = await import('three');
const A = await import('./arena.js');
const CR = [].concat((await import('./critters/critters_1.js')).default, (await import('./critters/critters_2.js')).default, (await import('./critters/critters_3.js')).default);
const assert = (c, m) => { if (!c) { console.error('FAIL: ' + m); process.exitCode = 1; } };
let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const titan = (sp) => Object.assign({}, sp, { id: 'titan' + sp.id, base: sp, name: 'Titan ' + sp.name, height: Math.round(sp.height * 100) / 10, titan: true });
const army = (n, titans = 0) => { const a = []; for (let i = 0; i < n; i++) a.push(CR[Math.floor(rnd() * CR.length)]); for (let i = 0; i < titans; i++) a.push(titan(CR[Math.floor(rnd() * CR.length)])); return a; };
const geo = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshBasicMaterial();
const mkTeams = (sizes, titans = [0, 0, 0, 0], human = false) => ['Red', 'Green', 'Yellow', 'Blue'].map((name, i) => ({ id: name.toLowerCase(), name, hex: [0xe24a4a, 0x3fae54, 0xe9c21f, 0x3f7fe0][i], css: '#888', army: army(sizes[i], titans[i]), ballD: [3, 30, 1.2, 6][i], human: human && i === 0 }));
const opts = (arena, teams) => ({ arena, teams, buildMesh: () => new THREE.Mesh(geo, mat), buildBall: () => new THREE.Group().add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial())), buildTrainer: () => new THREE.Group(), poseTrainer() {}, input: () => ({ x: Math.sin(Date.now() / 700), z: Math.cos(Date.now() / 900), dash: true }), sfx: { tone() {}, cry() {} } });
const sane = (b, tag) => {
  for (const u of b.units) assert(Number.isFinite(u.x) && Number.isFinite(u.z) && Number.isFinite(u.hp) && Math.abs(u.x) <= b.size / 2 + 0.01 && Math.abs(u.z) <= b.size / 2 + 0.01, tag + ': unit position ' + u.x + ',' + u.z);
  for (const q of b.balls) assert(Number.isFinite(q.x) && Number.isFinite(q.z) && Number.isFinite(q.D) && Number.isFinite(q.vx) && Math.abs(q.x) <= b.size / 2 && Math.abs(q.z) <= b.size / 2, tag + ': ball ' + q.x + ',' + q.z + ' D=' + q.D);
};

// 0. the arena list
const covered = new Set(A.ARENAS.flatMap((a) => a.types));
assert(A.ARENAS.length === 8 && covered.size === 15, 'arenas cover all 15 types: ' + covered.size);

// 1. full battles stepped at 30 Hz in every arena, with different army shapes
const shapes = [[[30, 30, 30, 30], [0, 0, 0, 0]], [[0, 1, 30, 250], [0, 0, 1, 2]], [[250, 250, 250, 250], [2, 1, 0, 3]], [[1, 0, 0, 0], [0, 0, 0, 0]], [[5, 0, 0, 3], [1, 0, 0, 0]], [[60, 80, 20, 120], [0, 3, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0]], [[1, 1, 1, 1], [0, 0, 0, 0]]];
let ai = 0;
for (const [sizes, tit] of shapes) for (let rep = 0; rep < 2; rep++) {
  const arena = A.ARENAS[ai++ % 8], teams = mkTeams(sizes, tit, rep === 1), b = A.createBattle(opts(arena, teams)), tag = arena.id + ' ' + sizes.join('/');
  b.resize(rep ? 16 / 9 : 0.7);
  let steps = 0, maxField = 0; const t0 = performance.now();
  while (!b.finished && steps < 4000) { b.step(1 / 30); steps++; maxField = Math.max(maxField, b.units.length); if (steps % 50 === 0) sane(b, tag); }
  const ms = (performance.now() - t0) / steps, r = b.result(), st = b.status();
  assert(b.finished, tag + ' finishes'); sane(b, tag);
  const any = sizes.some((n, i) => n + tit[i] > 0);
  assert(any ? r.winner >= 0 : r.winner === -1, tag + ' winner ' + r.winner);
  if (r.winner >= 0) assert(st[r.winner].alive > 0, tag + ' winner has critters');
  assert(r.seconds <= 75.1, tag + ' time ' + r.seconds);
  st.forEach((s, k) => assert(s.all === sizes[k] + tit[k] && s.alive >= 0 && s.alive <= s.all && s.hp >= 0 && s.hp <= 1.0001, tag + ' status ' + JSON.stringify(s)));
  assert(Number.isFinite(b.camera.position.x + b.camera.position.y + b.camera.position.z), tag + ' camera');
  const lost = st.reduce((n, s) => n + s.all - s.alive, 0), held = st.reduce((n, s) => n + s.scooped, 0);
  console.log(`${tag.padEnd(30)} scooped ${held}/${lost} lost; L=${b.size.toFixed(0)} win=${r.winner}${r.timedOut ? ' (time)' : ''} ${r.seconds.toFixed(1)}s scoops=${r.scoops} held=${st.map((s) => s.scooped)} alive=${st.map((s) => s.alive + '/' + s.all).join(' ')} ballD=${b.balls.map((q) => q.D.toFixed(1))} field<=${maxField} ${ms.toFixed(3)} ms/step mvp=${r.mvp && r.mvp.name}`);
  b.destroy();
}

// 2. skip() from every phase, then step/destroy/skip again (must all be harmless)
for (const at of [0, 40, 130, 400]) {
  const b = A.createBattle(opts(A.ARENAS[at % 8], mkTeams([120, 90, 250, 40], [1, 0, 2, 0], true)));
  for (let i = 0; i < at; i++) b.step(1 / 30);
  const t0 = performance.now(); b.skip(); const ms = performance.now() - t0, r = b.result();
  assert(b.finished && r.winner >= 0, 'skip at step ' + at); sane(b, 'skip');
  b.step(1 / 30); b.destroy(); b.step(1 / 30); b.skip(); b.destroy();
  console.log(`skip() from step ${at}: ${ms.toFixed(0)} ms, winner ${r.winner}, ${r.seconds.toFixed(1)}s, scoops ${r.scoops}`);
}
{ const b = A.createBattle(opts(A.ARENAS[1], mkTeams([40, 40, 40, 40]))); for (let i = 0; i < 200; i++) b.step(1 / 30); b.destroy(); b.destroy(); }      // destroy mid-fight

// 3. the favoured bonus: two equal armies of similar-sized species whose types are neutral to each other (fire, electric);
//    the same fight in the arena that favours side A (Magma Bowl) and the one that favours side B (Storm Spire)
{
  const pure = (ty) => CR.filter((c) => c.types.length === 1 && c.types[0] === ty);
  let fire = null, elec = null, gap = 9;
  for (const f of pure('fire')) for (const e of pure('electric')) if (Math.abs(f.height - e.height) < gap) { gap = Math.abs(f.height - e.height); fire = f; elec = e; }
  const magma = A.ARENAS.find((a) => a.id === 'magma'), storm = A.ARENAS.find((a) => a.id === 'storm');
  assert(A.isFavoured(magma, fire) && !A.isFavoured(storm, fire) && A.favouredCount(magma, [fire, elec, fire]) === 2, 'favoured helpers');
  const run = (arena) => { let wins = 0, hp = 0; for (let i = 0; i < 40; i++) { const teams = mkTeams([0, 0, 0, 0]); teams.forEach((t) => { t.ballD = 1; }); teams[0].army = Array(25).fill(fire); teams[2].army = Array(25).fill(elec); const b = A.createBattle(opts(arena, teams)); b.skip(); if (b.result().winner === 0) wins++; const s = b.status(); hp += s[0].hp - s[2].hp; b.destroy(); } return [wins, hp / 40]; };
  const fa = run(magma), fb = run(storm);
  console.log(`favoured check: 25 ${fire.name} (fire, ${fire.height} m) vs 25 ${elec.name} (electric, ${elec.height} m), 40 fights each: fire side wins ${fa[0]}/40 in Magma Bowl (hp margin ${fa[1].toFixed(2)}), ${fb[0]}/40 in Storm Spire (hp margin ${fb[1].toFixed(2)})`);
  assert(fa[0] > fb[0] && fa[1] > fb[1], 'favoured side does better');
}

// 4. timing: 4 x 252 armies, fight phase only
{
  const b = A.createBattle(opts(A.ARENAS[0], mkTeams([250, 250, 250, 250], [2, 2, 2, 2])));
  while (b.phase !== 'fight') b.step(1 / 30);
  let n = 0, worst = 0; const t0 = performance.now();
  while (!b.finished && b.phase === 'fight') { const s = performance.now(); b.step(1 / 60); worst = Math.max(worst, performance.now() - s); n++; }
  console.log(`4 x 252 armies: ${n} fight steps at 60 Hz, ${((performance.now() - t0) / n).toFixed(3)} ms/step average, ${worst.toFixed(2)} ms worst (simulation + all visual bookkeeping, no GPU)`);
  const t1 = performance.now(), b2 = A.createBattle(opts(A.ARENAS[3], mkTeams([250, 250, 250, 250], [2, 2, 2, 2]))), made = performance.now() - t1, t2 = performance.now(); b2.skip();
  console.log(`createBattle 4 x 252: ${made.toFixed(0)} ms; skip(): ${(performance.now() - t2).toFixed(0)} ms`);
}

// 5. the wheel
{
  const teams = mkTeams([20, 30, 40, 50]); let ticks = 0;
  for (const pick of [0, 3, 7]) { const w = A.createWheel({ arenas: A.ARENAS, pickIndex: pick, teams, sfx: { tone() { ticks++; } } }); let t = 0; while (!w.done && t < 20) { w.step(1 / 60); t += 1 / 60; } assert(w.done && w.arena === A.ARENAS[pick] && t > 7 && t < 10, 'wheel ' + pick + ' t=' + t); w.destroy(); }
  const w = A.createWheel({ arenas: A.ARENAS.slice(2, 6), pickIndex: 1, teams }); w.destroy(); assert(w.arena.id === 'storm', 'wheel subset');
  console.log('wheel ok, sounds per spin ~' + Math.round(ticks / 3));
}
console.log(process.exitCode ? 'SOME CHECKS FAILED' : 'ALL CHECKS PASSED');
