// Headless test of events.js: a fake host (the H surface of main.js) over the REAL terrain, map props and critter
// specs, with a stub of the few three.js classes events use (it counts geometries/materials made and disposed).
// Every event is started, ticked at 60 Hz for its whole duration while four fake balls chase its markers, and ended;
// then the world is checked for leftovers. Run:  node tools/events-test.mjs [eventId] [-v]
import { loadWorld } from './world.mjs';
const { EVENTS } = await import('../events.js');
const CREATURES = [];
for (const n of [1, 2, 3]) CREATURES.push(...(await import(`../critters/critters_${n}.js`)).default);
CREATURES.sort((a, b) => a.dex - b.dex);
const W = await loadWorld(), { T, BOUNDS, BIOMES, B, PLACES } = W, { REHOME, STARTS } = W.map;
const only = process.argv.slice(2).find((a) => !a.startsWith('-')), verbose = process.argv.includes('-v');

// ---------- seeded randomness (terrain.sampleBiome uses Math.random) ----------
let seed = 1;
const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
Math.random = rand;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fin = (...v) => { for (const x of v) if (typeof x !== 'number' || !Number.isFinite(x)) throw new Error('not a finite number: ' + x); };

// ---------- three.js stub ----------
let liveRes = 0;
class Res { constructor() { liveRes++; this.gone = false; } dispose() { if (this.gone) throw new Error('disposed twice'); this.gone = true; liveRes--; } }
class Vec { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { fin(x, y, z); this.x = x; this.y = y; this.z = z; return this; } setScalar(s) { fin(s); this.x = this.y = this.z = s; return this; } }
class Obj {
  constructor() { this.position = new Vec(); this.rotation = new Vec(); this.scale = new Vec(1, 1, 1); this.visible = true; this.children = []; this.parent = null; }
  add(...os) { for (const o of os) { if (!(o instanceof Obj)) throw new Error('add() of a non-object'); o.parent = this; this.children.push(o); } return this; }
  remove(...os) { for (const o of os) { const i = this.children.indexOf(o); if (i >= 0) { this.children.splice(i, 1); o.parent = null; } } return this; }
}
class Group extends Obj {}
class Mesh extends Obj { constructor(g, m) { super(); if (!g || !m) throw new Error('Mesh needs a geometry and a material'); this.geometry = g; this.material = m; } }
class Geo extends Res { constructor(...a) { super(); for (const v of a) fin(v); } }
class Mat extends Res { constructor(o = {}) { super(); Object.assign(this, o); } }
const THREE = { Group, Mesh, TorusGeometry: class extends Geo {}, CircleGeometry: class extends Geo {}, DodecahedronGeometry: class extends Geo {}, CylinderGeometry: class extends Geo { constructor(a, b, c, d, e) { super(a, b, c, d, e); } }, MeshBasicMaterial: Mat, DoubleSide: 2 };
const G = Object.fromEntries('sph box cyl taper cone pyr rock hemi torus'.split(' ').map((k) => [k, { host: k }])), hostMats = new Map();
const mat = (c) => { fin(c); if (!hostMats.has(c)) hostMats.set(c, { host: c }); return hostMats.get(c); };
function P(g, geo, color, s, p, r) { if (!G[geo]) throw new Error('P: unknown geo ' + geo); const m = new Mesh(G[geo], mat(color)); m.scale.set(s[0], s[1], s[2]); m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; }

// ---------- the fake game ----------
const TITANS = CREATURES.map((sp) => Object.assign({}, sp, { id: 'titan' + sp.id, base: sp, name: 'Titan ' + sp.name, height: Math.round(sp.height * 100) / 10, titan: true }));
const SPECS = {};
for (const id in W.SPECS) SPECS[id] = { kind: 'item', spec: W.SPECS[id], size: W.SPECS[id].size };
for (const s of [...CREATURES, ...TITANS]) SPECS[s.id] = { kind: 'creature', spec: s, size: s.height };
const baseOf = (sp) => sp.base || sp, habOf = (sp) => REHOME[baseOf(sp).id] || sp.habitat;
const HAB_BIOMES = {};
BIOMES.forEach((b, i) => { if (b.hab) (HAB_BIOMES[b.hab] || (HAB_BIOMES[b.hab] = [])).push(i); });
const groundAt = T.groundAt, topSpeed = (d) => 2.7 * Math.pow(d + 0.5, 0.85), START_D = 0.6, GROW = 0.95;
const TEAMS = [{ name: 'Red', hex: 0xe24a4a, css: '#e24a4a' }, { name: 'Green', hex: 0x3fae54, css: '#3fae54' }, { name: 'Yellow', hex: 0xe9c21f, css: '#d9aa00' }, { name: 'Blue', hex: 0x3f7fe0, css: '#3f7fe0' }];

let G_ = null;      // the current game: { objects, balls, markers, fx, MODS, sky, time, log }
function newGame(ds) {
  const g = { objects: [], markers: new Map(), fx: new Group(), MODS: { knock: 1, iced: false, fog: 1 }, sky: null, time: 100, stats: { put: 0, picks: 0, bumps: 0, knocks: 0, lost: 0, flings: 0, toasts: [], announces: 0, tones: 0, grows: 0, cpuGoto: 0, ratio: 0 } };
  G_ = g;
  g.balls = ds.map((d, i) => {
    const a = rand() * 6.28, r = d < 0.95 ? 20 + rand() * 15 : 40 + rand() * 60, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const b = { team: i, x, z, y: groundAt(x, z) + d / 2, d, vol3: d ** 3, attached: [], army: [], hitCool: 0, ratioBonus: 0, heading: rand() * 6.28, ev: null, lazy: rand() };
    if (i === 0) Object.assign(b, { vx: 0, vz: 0 }); else Object.assign(b, { v: 0, wander: 0, wh: 0 });
    return b;
  });
  for (const o of W.objects) put(o.id, o.x, o.z, { rot: o.rot });
  for (const sp of CREATURES) { const p = T.sampleBiome(HAB_BIOMES[habOf(sp)] || [B.hub], sp.move === 'swim' ? 'water' : 'land'); if (p) herd(sp, p, 3); }
  for (const o of g.objects) o.spawnT = 0;
  // every ball starts with an army; the first rival has the biggest (for the thief)
  g.balls.forEach((b, i) => { for (let k = 0; k < 4 + i * 3; k++) { const sp = CREATURES[Math.floor(rand() * CREATURES.length)], o = put(sp.id, b.x, b.z, { scale: 0.2 * b.d / sp.height }); attach(b, o, true); } });
  return g;
}
function put(id, x, z, opt = {}) {
  const e = SPECS[id];
  if (!e) throw new Error('put: unknown id ' + id);
  fin(x, z, opt.scale ?? 1, opt.bonus ?? 1, opt.rot ?? 0);
  if ((opt.scale ?? 1) <= 0 || (opt.bonus ?? 1) <= 0) throw new Error('put: scale/bonus must be positive');
  if (x < BOUNDS.x1 || x > BOUNDS.x2 || z < BOUNDS.z1 || z > BOUNDS.z2) throw new Error(`put: ${id} off the map at ${x.toFixed(0)},${z.toFixed(0)}`);
  const size = e.size * (opt.scale ?? 1), rad = size * (e.spec.rad ?? (e.kind === 'creature' ? 0.3 : 0.35)), group = new Mesh({ host: 1 }, { host: 1 });
  group.scale.setScalar(size); group.position.set(x, groundAt(x, z), z); group.rotation.y = opt.rot ?? rand() * 6.28;
  const o = { kind: e.kind, spec: e.spec, size, rad, group, bonus: opt.bonus ?? 1, on: false, fly: null, cool: 0, contrib: 0, spawnT: 0, made: !!G_.inEvent };
  if (e.kind === 'creature') Object.assign(o, { ai: 'idle', timer: rand() * 3, home: [x, z], tx: x, tz: z, phase: rand() * 6.28, leader: null });
  G_.objects.push(o); G_.stats.put++;
  return o;
}
function herd(sp, at, n, opt) {
  if (!at) return null;
  const leader = put(sp.id, at[0], at[1], opt);
  for (let i = 1; i < n; i++) for (let t = 0; t < 12; t++) {
    const a = rand() * 6.28, r = (0.8 + rand() * 1.6) * sp.height + 0.3, x = at[0] + Math.cos(a) * r, z = at[1] + Math.sin(a) * r, w = T.waterAt(x, z);
    if ((sp.move === 'swim' ? w >= 1 : w !== 2) && Math.abs(groundAt(x, z) - groundAt(at[0], at[1])) < Math.max(0.3, sp.height * 0.5)) { put(sp.id, x, z, opt).leader = leader; break; }
  }
  return leader;
}
function attach(b, o, quiet) {
  const i = G_.objects.indexOf(o);
  if (i < 0 || o.on) throw new Error('attach of something that is not free');
  G_.objects.splice(i, 1); o.on = true; o.fly = null;
  o.contrib = GROW * o.size ** 3 * (o.spec.mass ?? 1) * (o.bonus ?? 1);
  b.vol3 += o.contrib; b.d = Math.cbrt(b.vol3); b.attached.push(o);
  o.script = null;
  if (o.onPick) { const f = o.onPick; o.onPick = null; f(b, o); }
  if (o.kind === 'creature') b.army.push(o.spec);
  if (!quiet) G_.stats.picks++;
}
function knock(b, nx, nz, n) {
  fin(nx, nz, n);
  n = Math.max(1, Math.round(n * G_.MODS.knock));
  G_.stats.knocks++;
  if (b.hitCool > 0) return;
  b.hitCool = 3;
  for (let i = 0; i < n && b.attached.length; i++) {
    const o = b.attached.pop();
    o.on = false; o.cool = 1.2; o.group.position.set(b.x, b.y, b.z);
    o.fly = { vx: (-nx + rand() - 0.5) * 4, vy: Math.sqrt(20 * b.d) + 0.5, vz: (-nz + rand() - 0.5) * 4 };
    b.vol3 -= o.contrib;
    if (o.kind === 'creature') { const k = b.army.lastIndexOf(o.spec); if (k >= 0) b.army.splice(k, 1); o.ai = 'idle'; }
    G_.objects.push(o); G_.stats.lost++;
  }
  b.vol3 = Math.max(START_D ** 3, b.vol3); b.d = Math.cbrt(b.vol3);
}
function takeFrom(b, n, crittersOnly) {
  const out = [];
  for (let i = b.attached.length - 1; i >= 0 && out.length < n; i--) {
    const o = b.attached[i];
    if (crittersOnly && o.kind !== 'creature') continue;
    b.attached.splice(i, 1);
    const a = rand() * 6.28, rr = b.d / 2 + o.size, x = clamp(b.x + Math.cos(a) * rr, BOUNDS.x1 + 1, BOUNDS.x2 - 1), z = clamp(b.z + Math.sin(a) * rr, BOUNDS.z1 + 1, BOUNDS.z2 - 1);
    o.group.position.set(x, groundAt(x, z), z); o.on = false; o.cool = 1.5; o.fly = null; b.vol3 -= o.contrib;
    if (o.kind === 'creature') { const k = b.army.lastIndexOf(o.spec); if (k >= 0) b.army.splice(k, 1); o.ai = 'idle'; o.home = [x, z]; }
    G_.objects.push(o); out.push(o);
  }
  b.vol3 = Math.max(START_D ** 3, b.vol3); b.d = Math.cbrt(b.vol3);
  return out;
}
const H = {
  THREE, T, PLACES, BIOMES, B, CREATURES, TITANS, SPECS, TEAMS, STARTS, BOUNDS, P, G, mat, baseOf,
  get MODS() { return G_.MODS; }, get fx() { return G_.fx; }, get S() { return G_.balls[0]; },
  rand, clamp, topSpeed, groundAt, waterAt: T.waterAt, biomeAt: (x, z) => BIOMES[T.biomeAt(x, z)], sampleBiome: T.sampleBiome, habOf,
  critterSpot: (sp, hab = habOf(sp)) => (HAB_BIOMES[hab] ? T.sampleBiome(HAB_BIOMES[hab], 'land') : null),
  balls: () => G_.balls, isPlayer: (b) => b === G_.balls[0], ballName: (b) => (b === G_.balls[0] ? 'You' : TEAMS[b.team].name), teamOf: (b) => TEAMS[b.team], pickRatio: (b) => 0.5 + (b.ratioBonus || 0),
  objects: () => G_.objects, time: () => G_.time, timeLeft: () => 150, forecast: () => null,
  put: (id, x, z, opt = {}) => { const o = put(id, x, z, opt); if (opt.pop !== false) { o.spawnT = 0.9; o.group.scale.setScalar(0.001); } if (opt.gold) o.gold = true; return o; },
  herd: (sp, at, n, opt) => { const from = G_.objects.length; herd(sp, at, n, opt); for (let i = from; i < G_.objects.length; i++) G_.objects[i].spawnT = 0.9 + rand() * 0.6; return G_.objects.slice(from); },
  remove(o) { const i = G_.objects.indexOf(o); if (i >= 0) G_.objects.splice(i, 1); o.gone = true; },
  give(b, o) { if (o.on || !G_.objects.includes(o)) return; attach(b, o); },
  knock, takeFrom,
  grow(b, vol) { fin(vol); b.vol3 = Math.max(START_D ** 3, b.vol3 + vol); b.d = Math.cbrt(b.vol3); G_.stats.grows++; },
  fling(o, vx, vy, vz) { fin(vx, vy, vz); if (o.on || o.gone) throw new Error('fling of something not free'); o.fly = { vx, vy, vz }; o.cool = 1; G_.stats.flings++; },
  toast(t) { if (typeof t !== 'string' || /undefined|NaN|\[object/.test(t)) throw new Error('bad toast: ' + t); G_.stats.toasts.push(t); },
  announce() { G_.stats.announces++; },
  shake(t = 0.3) { fin(t); },
  sfx: { tone(f1, f2, dur, type = 'sine', vol = 0.1, when = 0) { fin(f1, f2, dur, vol, when); if (f1 <= 0 || f2 <= 0 || dur <= 0 || vol <= 0 || vol > 0.3 || !['sine', 'square', 'sawtooth', 'triangle'].includes(type)) throw new Error(`bad tone ${f1} ${f2} ${dur} ${type} ${vol}`); G_.stats.tones++; }, cry(spec, vol = 0.07) { if (!spec || !spec.id) throw new Error('cry without a spec'); fin(vol); }, bump() {}, win() {} },
  mark(id, x, z, opt = {}) { fin(x, z, opt.color ?? 0, opt.radius ?? 6); H.unmark(id); const g = new Group(); G_.fx.add(g); G_.markers.set(id, { id, x, z, g, label: opt.label, radius: opt.radius ?? 6 }); if (!opt.label || /undefined|NaN/.test(opt.label)) throw new Error('marker without a label'); },
  moveMark(id, x, z) { fin(x, z); const m = G_.markers.get(id); if (m) { m.x = x; m.z = z; } },
  unmark(id) { const m = G_.markers.get(id); if (m) { G_.fx.remove(m.g); G_.markers.delete(id); } },
  cpuGoto(x, z, seconds = 20, chance = 0.7) { fin(x, z, seconds, chance); G_.stats.cpuGoto++; for (const b of G_.balls.slice(1)) if (rand() < chance) b.ev = { x, z, until: G_.time + seconds }; },
  cpuRelease() { for (const b of G_.balls) b.ev = null; },
  setIce(on) { G_.MODS.iced = !!on; }, setSky(hex) { if (hex !== null) fin(hex); G_.sky = hex; },
};

// One frame of the fake game: balls roll (towards the event, mostly), things fly and land, balls roll up or bump what they touch.
function step(dt, ev) {
  const g = G_;
  g.time += dt;
  for (const b of g.balls) {
    b.hitCool = Math.max(0, b.hitCool - dt);
    let tx = null, tz = null;
    if (b.ev && g.time < b.ev.until) { tx = b.ev.x; tz = b.ev.z; }
    else if (b.team === 0 || b.lazy < 0.5) { let md = 1e9; for (const m of g.markers.values()) { const d = Math.hypot(m.x - b.x, m.z - b.z); if (d < md) { md = d; tx = m.x; tz = m.z; } } }
    if (tx !== null && Math.hypot(tx - b.x, tz - b.z) > 0.3) b.heading = Math.atan2(tx - b.x, tz - b.z) + Math.sin(g.time * 0.7 + b.team) * 0.3;
    else b.heading += (rand() - 0.5) * 0.4;
    if (b.wander > 0) { b.wander -= dt; b.heading = b.wh; }
    const sp = topSpeed(b.d) * 1.4;
    let mx = Math.sin(b.heading) * sp, mz = Math.cos(b.heading) * sp;
    if (b.team === 0) { b.vx += (mx - b.vx) * Math.min(1, 3 * dt); b.vz += (mz - b.vz) * Math.min(1, 3 * dt); mx = b.vx; mz = b.vz; }
    b.x = clamp(b.x + mx * dt, BOUNDS.x1 + 5, BOUNDS.x2 - 5); b.z = clamp(b.z + mz * dt, BOUNDS.z1 + 5, BOUNDS.z2 - 5);
    b.y = groundAt(b.x, b.z) + b.d / 2;
    fin(b.x, b.z, b.d, b.vol3);
  }
  for (let i = g.objects.length - 1; i >= 0; i--) {
    const o = g.objects[i];
    if (!o) continue;                                       // the list shrank under us (an event removed things from a callback)
    const p = o.group.position;
    if (p.x !== p.x || p.y !== p.y || p.z !== p.z) throw new Error('NaN position on ' + o.spec.id);
    if (o.fly) {
      o.fly.vy -= 9.8 * dt;
      p.x = clamp(p.x + o.fly.vx * dt, BOUNDS.x1 + 5, BOUNDS.x2 - 5); p.y += o.fly.vy * dt; p.z = clamp(p.z + o.fly.vz * dt, BOUNDS.z1 + 5, BOUNDS.z2 - 5);
      if (p.y <= groundAt(p.x, p.z)) { o.fly = null; p.y = groundAt(p.x, p.z); if (o.kind === 'creature') o.home = [p.x, p.z]; }
      continue;
    }
    if (o.cool > 0) o.cool -= dt;
    if (o.spawnT > 0) { o.spawnT -= dt; if (o.spawnT > 0.3) continue; }
    if (o.script) {
      let near = null, gap = 1e9;
      for (const b of g.balls) { const d = Math.hypot(p.x - b.x, p.z - b.z) - b.d; if (d < gap) { gap = d; near = b; } }
      if (o.kind === 'creature' && gap < 60 + near.d * 11) { o.script(o, dt, near); if (o.gone || o.on) continue; }
    }
    for (const b of g.balls) {
      if (o.on || o.gone) break;
      const dx = p.x - b.x, dz = p.z - b.z, reach = b.d / 2 + o.rad;
      if (dx * dx + dz * dz >= reach * reach) continue;
      const dist = Math.hypot(dx, dz);
      if (!o.noPick && o.size <= b.d * H.pickRatio(b)) { if (o.cool <= 0) { if (b.ratioBonus && o.size > b.d * 0.5) g.stats.ratio++; attach(b, o); } continue; }
      if (o.spec.flat) continue;
      if (o.onBump && o.cool <= 0) { o.onBump(b, o); g.stats.bumps++; }
      b.x -= (p.x - b.x) / (dist || 1) * (reach - dist); b.z -= (p.z - b.z) / (dist || 1) * (reach - dist);
    }
  }
  for (const b of g.balls) b.ratioBonus = 0;
  if (ev) {
    ev.t += dt;
    ev.def.tick(H, ev, dt);
  }
}

// ---------- the checks ----------
function leftovers(g, base) {
  const bad = [];
  if (g.markers.size) bad.push('markers left: ' + [...g.markers.keys()]);
  if (g.MODS.knock !== 1 || g.MODS.fog !== 1 || g.MODS.iced) bad.push('MODS not reset: ' + JSON.stringify(g.MODS));
  if (g.sky !== null) bad.push('sky not reset');
  if (g.fx.children.length !== base.fx) bad.push(`fx children ${g.fx.children.length} (was ${base.fx})`);
  if (liveRes !== base.res) bad.push(`geometries/materials not disposed: ${liveRes - base.res}`);
  const all = [...g.objects, ...g.balls.flatMap((b) => b.attached)];
  const held = all.filter((o) => o.noPick || o.script || o.onBump || o.onPick);
  if (held.length) bad.push(`${held.length} things still have noPick/script/onBump/onPick (${held[0].spec.id})`);
  if (g.objects.some((o) => o.gone || o.on)) bad.push('a removed or attached thing is still in the world list');
  if (g.balls.some((b) => b.ev)) bad.push('CPU goals not released');
  for (const o of g.objects) { const p = o.group.position; if (![p.x, p.y, p.z, o.size].every(Number.isFinite)) bad.push('non-finite object ' + o.spec.id); }
  return bad;
}
const PRESETS = { tiny: [0.6, 0.7, 0.8, 0.9], small: [1.1, 1.4, 1.8, 2.4], mid: [3, 3.6, 4.5, 6], big: [8, 10, 12, 15], mixed: [0.8, 2, 5, 12], playerTiny: [0.7, 3, 4, 5] };
const rows = [], fails = [];
function run(def, preset, sd, mode) {
  seed = sd * 7919 + preset.length * 31 + def.id.length;
  const g = newGame(PRESETS[preset]);
  const base = { fx: g.fx.children.length, res: liveRes, n: g.objects.length };
  g.stats = Object.assign(g.stats, { put: 0, picks: 0 });
  const d0 = g.balls.map((b) => b.d), okNow = !def.ok || !!def.ok(H);
  const ev = { def, t: 0, done: false, data: {} };
  g.inEvent = true;
  let frames = 0, maxFx = 0, where = '', far = 0;
  const tag = `${def.id} [${preset} seed ${sd} ${mode}]`;
  try {
    def.start(H, ev);
    if (typeof (ev.title || def.name) !== 'string' || /undefined|NaN|\[object/.test((ev.title || '') + (ev.sub || ''))) throw new Error('bad banner: ' + ev.title + ' / ' + ev.sub);
    const m0 = [...g.markers.values()][0];
    where = m0 ? `${Math.round(Math.hypot(m0.x, m0.z))}m ${BIOMES[T.biomeAt(m0.x, m0.z)].id}` : '-';
    const limit = mode === 'instant' ? 0 : mode === 'one' ? 1 : Math.ceil(def.duration * 60) + 5;
    while (frames < limit && !ev.done && ev.t < def.duration) { step(1 / 60, ev); frames++; maxFx = Math.max(maxFx, g.fx.children.length); for (const m of g.markers.values()) far = Math.max(far, Math.hypot(m.x, m.z)); }
    def.end(H, ev);
    if (mode === 'twice') def.end(H, ev);
    def.tick(H, ev, 1 / 60);                                // a stray tick after the end must do nothing
    for (let i = 0; i < 240; i++) step(1 / 60, null);       // let flung things land and popping things settle
  } catch (e) { fails.push(`${tag}: THREW ${e.stack.split('\n').slice(0, 3).join(' | ')}`); return; }
  const bad = leftovers(g, base);
  for (const b of bad) fails.push(`${tag}: ${b}`);
  if (mode === 'full') {
    const st = g.stats, growth = g.balls.map((b, i) => (b.d / d0[i]).toFixed(2)).join(' ');
    rows.push({ event: def.id, preset, ok: okNow ? 'y' : 'n', secs: (frames / 60).toFixed(1), where, far: Math.round(far), title: ev.title || def.name, put: st.put, picks: st.picks, bumps: st.bumps, knocks: st.knocks, lost: st.lost, flings: st.flings, grows: st.grows, ratio: st.ratio, maxFx: maxFx - base.fx, left: g.objects.filter((o) => o.made).length, growth, toasts: st.toasts.length });
    if (verbose) console.log(tag, '|', ev.title || def.name, '|', ev.sub || def.sub, '|', st.toasts.join(' / '));
    if (g.objects.filter((o) => o.made).length > 70) fails.push(`${tag}: ${g.objects.filter((o) => o.made).length} things made by the event are still lying about`);
    if (!st.cpuGoto && def.id !== 'fog') fails.push(`${tag}: never called cpuGoto`);
  }
}
const t0 = Date.now();
for (const def of EVENTS) {
  if (only && def.id !== only) continue;
  for (const k of ['id', 'name', 'sub', 'color', 'duration']) if (def[k] === undefined) fails.push(`${def.id}: missing ${k}`);
  if (!/^#[0-9a-f]{6}$/.test(def.color)) fails.push(`${def.id}: colour must be #rrggbb`);
  for (const preset in PRESETS) {
    for (let sd = 1; sd <= 3; sd++) run(def, preset, sd, 'full');
    run(def, preset, 4, 'instant'); run(def, preset, 5, 'one'); run(def, preset, 6, 'twice');
  }
}
// averaged over the seeds, per event and preset
const keyed = {};
for (const r of rows) { const k = r.event + ' ' + r.preset; (keyed[k] || (keyed[k] = [])).push(r); }
const avg = (l, f) => Math.round(l.reduce((n, r) => n + r[f], 0) / l.length);
console.table(Object.values(keyed).map((l) => ({ event: l[0].event, balls: l[0].preset, ok: l[0].ok, secs: l.map((r) => r.secs).join(' '), where: l[0].where, far: l.map((r) => r.far).join(' '), put: avg(l, 'put'), picks: avg(l, 'picks'), bumps: avg(l, 'bumps'), knocks: avg(l, 'knocks'), lost: avg(l, 'lost'), flings: avg(l, 'flings'), grows: avg(l, 'grows'), wide: avg(l, 'ratio'), fx: avg(l, 'maxFx'), left: l.map((r) => r.left).join(' '), growth0: l[0].growth })));
console.log(`${EVENTS.length} events, ${rows.length} full runs, ${Date.now() - t0} ms`);
if (fails.length) { console.log('\nFAILURES (' + fails.length + '):\n' + [...new Set(fails)].slice(0, 60).join('\n')); process.exit(1); }
console.log('all checks passed');
