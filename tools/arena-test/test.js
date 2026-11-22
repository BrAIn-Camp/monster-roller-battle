// Standalone try-out page for the arena: the wheel, then the fight, with made-up armies and stub ball/trainer models.
//   http://127.0.0.1:8417/tools/arena-test/            wheel, then a fight
//   ?mine=40 the player's army is 40 critters   ?mystat=5 ...leaning towards critters best at stat 5 (0 HP, 1 Atk, 2 Def, 3 SpA, 4 SpD, 5 Speed)
//   ?arena=magma (or tidal canopy storm frost dune hollow meadow)   skip the wheel
//   ?n=80        critters per team (each team gets a random 55-145% of it)       ?titans=1   titans per team
//   ?cpu         no human: watch four CPU balls                                   ?mute       no sound
//   ?seed=7      the same armies and the same fight every time                    ?models=0   generated critters only
//   ?only=1,4,7  armies made of just these slots (to look at particular monsters and moves)
//   ?speed=0.25  slow motion (or 4 for fast forward)
// Keys: WASD / arrows steer, Shift dashes, Space skips (in the game itself: hold Enter), R restarts, 1-8 restarts in that arena, P pauses.
import * as THREE from 'three';
import { ARENAS, createWheel, createBattle, planTeams } from '../../arena.js';
import { buildCritterGeometry } from '../../critters/kit.js';
import { stadiumMeta, loadStadium, makeArenaActor, makeStadiumInstance } from '../../critters/stadium.js';
import { STATS } from '../../critters/battle-data.js';
import c1 from '../../critters/critters_1.js';
import c2 from '../../critters/critters_2.js';
import c3 from '../../critters/critters_3.js';

const CRITTERS = [].concat(c1, c2, c3), Q = new URLSearchParams(location.search);
const byDex = new Map(CRITTERS.map((s) => [s.dex, s])), specOf = (d) => byDex.get(d);
const TEAMS = [
  { id: 'red', name: 'Red', hex: 0xe24a4a, css: '#e24a4a' }, { id: 'green', name: 'Green', hex: 0x3fae54, css: '#3fae54' },
  { id: 'yellow', name: 'Yellow', hex: 0xe9c21f, css: '#d9aa00' }, { id: 'blue', name: 'Blue', hex: 0x3f7fe0, css: '#3f7fe0' },
];
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const info = document.getElementById('info');
let seed = Q.has('seed') ? +Q.get('seed') : (Math.random() * 1e9) | 0;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// ---- models: the local ones when they are there (as in the game's local build), else the generated critters
let live = false;
if (Q.get('models') !== '0') { const meta = await stadiumMeta(); if (meta) { live = true; for (const sp of CRITTERS) { const m = meta[String(sp.dex)]; if (m && m.name) sp.name = m.name; } } }
const geoCache = new Map();
const teamMats = TEAMS.map((tm) => new THREE.MeshLambertMaterial({ vertexColors: true, color: new THREE.Color(tm.hex).lerp(new THREE.Color(0xffffff), 0.35), emissive: tm.hex, emissiveIntensity: 0.22 }));
function buildActor(spec, k) {
  const base = spec.base || spec;
  let geo = geoCache.get(base.id);
  if (!geo) { geo = buildCritterGeometry(base); geoCache.set(base.id, geo); }
  return makeArenaActor(base.dex, new THREE.Mesh(geo, teamMats[k]), live);
}
// portraits for the ceremony, as the game makes them: the generated critter at once, the model's once it has loaded
const faces = new Map(), faceMat = new THREE.MeshLambertMaterial({ vertexColors: true });
let faceR = null;
function shoot(obj, model) {
  if (!faceR) {
    faceR = { r: new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }), sc: new THREE.Scene(), cam: new THREE.PerspectiveCamera(30, 1, 0.05, 80) };
    faceR.r.setSize(96, 96); faceR.sc.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2.2));
    const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(2, 3, 4); faceR.sc.add(dl);
  }
  const { r, sc, cam } = faceR;
  sc.add(obj); obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj, true), c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3()), s = model ? Math.max(sz.x, sz.y, sz.z * 0.8) : sz.length() * 0.62;
  cam.position.set(c.x + s * 0.85, c.y + s * 0.45, c.z + s * 1.7); cam.lookAt(c);
  r.render(sc, cam); sc.remove(obj);
  return r.domElement.toDataURL();
}
function portrait(spec) {
  const b = spec.base || spec;
  if (!faces.has(b.dex)) {
    let geo = geoCache.get(b.id);
    if (!geo) { geo = buildCritterGeometry(b); geoCache.set(b.id, geo); }
    faces.set(b.dex, shoot(new THREE.Mesh(geo, faceMat), false));
    if (live) loadStadium(b.dex).then((l) => { if (!l) return; const inst = makeStadiumInstance(l); inst.update(0); faces.set(b.dex, shoot(inst.root, true)); inst.dispose(); });
  }
  return faces.get(b.dex);
}
const sphere = new THREE.SphereGeometry(1, 24, 16), band = new THREE.TorusGeometry(1, 0.07, 6, 24), box = new THREE.BoxGeometry(1, 1, 1);
function buildBall(k) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({ color: TEAMS[k].hex })));
  for (const r of [[0, 0, 0], [Math.PI / 2, 0, 0], [0, 0, Math.PI / 2]]) { const m = new THREE.Mesh(band, new THREE.MeshLambertMaterial({ color: 0xffd23f })); m.rotation.set(r[0], r[1], r[2]); g.add(m); }
  return g;
}
function buildTrainer(k) {
  const g = new THREE.Group(), part = (color, s, p, parent = g) => { const m = new THREE.Mesh(box, new THREE.MeshLambertMaterial({ color })); m.scale.set(s[0], s[1], s[2]); m.position.set(p[0], p[1], p[2]); parent.add(m); return m; };
  const limb = (color, s, p) => { const piv = new THREE.Group(); piv.position.set(p[0], p[1], p[2]); part(color, s, [0, -s[1] / 2, 0], piv); g.add(piv); return piv; };
  const legL = limb(0x2f3a5a, [0.11, 0.36, 0.13], [0.08, 0.36, 0]), legR = limb(0x2f3a5a, [0.11, 0.36, 0.13], [-0.08, 0.36, 0]);
  part(TEAMS[k].hex, [0.3, 0.34, 0.19], [0, 0.53, 0]); part(0xf2c9a0, [0.24, 0.24, 0.24], [0, 0.82, 0]); part(TEAMS[k].hex, [0.27, 0.08, 0.3], [0, 0.96, 0.03]);
  const armL = limb(TEAMS[k].hex, [0.085, 0.28, 0.095], [0.195, 0.66, 0.01]), armR = limb(TEAMS[k].hex, [0.085, 0.28, 0.095], [-0.195, 0.66, 0.01]);
  g.userData = { legL, legR, armL, armR };
  poseTrainer(g, 0, false);
  return g;
}
function poseTrainer(g, t, moving) {
  const s = moving ? Math.sin(t * 11) * 0.6 : 0, u = g.userData;
  u.legL.rotation.x = s; u.legR.rotation.x = -s; u.armL.rotation.x = -1.3 + s * 0.12; u.armR.rotation.x = -1.3 - s * 0.12;
}

// ---- sound (starts on the first key press or click) and input
let ac = null;
const wake = () => { if (!ac && !Q.has('mute')) { try { ac = new AudioContext(); } catch (e) { /* no audio */ } } };
const sfx = {
  tone(f1, f2, dur, type = 'sine', vol = 0.1, when = 0) {
    if (!ac) return;
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  cry(spec, vol) { this.tone(260 + spec.dex * 5, 420 + spec.dex * 3, 0.16, 'triangle', vol); },
};
const keys = new Set();
let paused = false;
addEventListener('keydown', (e) => {
  wake(); keys.add(e.code);
  if (e.code === 'Space') { e.preventDefault(); if (battle && !battle.finished) battle.skip(); }
  if (e.code === 'KeyR') start(null);
  if (e.code === 'KeyP') paused = !paused;
  if (/^Digit[1-8]$/.test(e.code)) start(ARENAS[+e.code.slice(5) - 1]);
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('pointerdown', wake);
const held = (...codes) => codes.some((c) => keys.has(c));
const input = () => ({ x: (held('KeyD', 'ArrowRight') ? 1 : 0) - (held('KeyA', 'ArrowLeft') ? 1 : 0), z: (held('KeyS', 'ArrowDown') ? 1 : 0) - (held('KeyW', 'ArrowUp') ? 1 : 0), dash: held('ShiftLeft', 'ShiftRight') });

// ---- armies, the way a round makes them: mostly common critters from a few habitats, a few rarer ones
const pick = (a) => a[Math.floor(rnd() * a.length)];
const titanOf = (sp) => Object.assign({}, sp, { id: 'titan' + sp.id, base: sp, name: 'Titan ' + sp.name, height: Math.round(sp.height * 100) / 10, titan: true });
const habitats = [...new Set(CRITTERS.map((c) => c.habitat))];
function makeArmy(n) {
  if (Q.has('only')) { const list = Q.get('only').split(',').map((d) => specOf(+d)).filter(Boolean), a = []; for (let i = 0; i < n; i++) a.push(list[i % list.length]); return a; }
  const home = [0, 1, 2].map(() => pick(habitats));
  const pool = (test, local) => CRITTERS.filter((c) => test(c) && (!local || home.includes(c.habitat)));
  const sets = [pool((c) => c.rarity === 'common', true), pool((c) => c.rarity === 'uncommon', true), pool((c) => c.rarity !== 'common' && c.rarity !== 'uncommon', false)], any = pool((c) => c.rarity === 'common', false);
  const army = [];
  for (let i = 0; i < n; i++) { const r = rnd(), p = sets[r < 0.62 ? 0 : r < 0.9 ? 1 : 2]; army.push(pick(p.length ? p : any)); }
  return army;
}
function makeTeams() {
  const n = Q.has('n') ? +Q.get('n') : 80, titans = Q.has('titans') ? +Q.get('titans') : 0;
  return TEAMS.map((tm, k) => {
    let army = makeArmy(Math.max(1, Math.round(n * (0.55 + rnd() * 0.9))));
    // ?mine=N: the player's own army is N critters; ?mystat=0..5: and it leans towards critters whose best stat is that one
    if (k === 0 && (Q.has('mine') || Q.has('mystat'))) {
      const size = Q.has('mine') ? +Q.get('mine') : army.length, lean = Q.has('mystat') ? +Q.get('mystat') : -1;
      const best = (c) => { const b = STATS[c.dex] || []; let m = 0; for (let i = 1; i < 6; i++) if (b[i] > b[m]) m = i; return m; };
      const pool = lean >= 0 ? CRITTERS.filter((c) => best(c) === lean && c.height < 2.2) : null;
      army = makeArmy(size);
      if (pool && pool.length) army = army.map((c, i) => (i % 4 ? pool[Math.floor(rnd() * pool.length)] : c));
    }
    for (let i = 0; i < titans; i++) army.push(titanOf(pick(CRITTERS.filter((c) => c.height < 2.5))));
    return Object.assign({}, tm, { army, ballD: 1.5 + rnd() * 12, human: k === 0 && !Q.has('cpu') });
  });
}

// ---- the flow: wheel -> battle -> result line; R to go again
let wheel = null, battle = null, teams = null, shown = false;
function start(arena) {
  if (wheel) wheel.destroy();
  if (battle) battle.destroy();
  wheel = battle = null; shown = false; teams = makeTeams();
  arena = arena || ARENAS.find((a) => a.id === Q.get('arena'));
  if (arena) begin(arena);
  else { const pickIndex = Math.floor(rnd() * ARENAS.length); wheel = createWheel({ arenas: ARENAS, pickIndex, teams, plans: planTeams(teams, ARENAS[pickIndex], specOf), sfx }); }
  info.textContent = 'WASD / arrows: steer    Shift: dash    Space: skip    R: restart    1-8: pick an arena    P: pause';
}
function begin(arena) {
  let s = (seed ^ 0x9e3779b9) >>> 0;
  const dice = Q.has('seed') ? () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; } : undefined;
  const plans = planTeams(teams, arena, specOf);
  for (const p of plans) { for (const r of p.roster) portrait(r.spec); for (const q of p.spareList) portrait(q.spec); }
  battle = createBattle({ arena, teams, specOf, plans, buildActor, buildBall, buildTrainer, poseTrainer, portrait, input, sfx, rand: dice });
  battle.resize(innerWidth / innerHeight);
  window.__battle = battle;
}
function fit() { renderer.setSize(innerWidth, innerHeight, false); if (battle) battle.resize(innerWidth / innerHeight); }
addEventListener('resize', fit);

const SPEED = Q.has('speed') ? +Q.get('speed') : 1, MANUAL = Q.has('manual');      // ?manual: nothing moves until __tick() is called (for looking at single frames)
let last = performance.now();
function advance(dt) {
  if (wheel) {
    wheel.step(dt);
    if (wheel.done) { const arena = wheel.arena; wheel.destroy(); wheel = null; begin(arena); }
  }
  if (battle) {
    battle.step(dt);
    renderer.render(battle.scene, battle.camera);
    if (battle.finished && !shown) {
      shown = true;
      const r = battle.result(), st = battle.status();
      info.textContent = `Winner: ${r.winner < 0 ? 'nobody' : teams[r.winner].name}${r.timedOut ? ' (on time)' : ''} after ${r.seconds.toFixed(1)} s   |   left: ${st.map((s) => s.alive + '/' + s.all).join('  ')}   |   brought: ${st.map((s) => s.brought + '>' + s.merged).join('  ')}   |   MVP: ${r.mvp ? r.mvp.name + ' (' + r.mvp.kills + ' KOs)' : 'none'}   |   R: again`;
    }
  } else renderer.clear();
}
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000) * SPEED; last = now;
  if (paused || MANUAL) { if (battle) renderer.render(battle.scene, battle.camera); return; }
  advance(dt);
}
function frame(now) { requestAnimationFrame(frame); tick(now); }
// (a hidden tab gets no animation frames; ?keepalive ticks it from a timer so it can be tested in the background)
if (Q.has('keepalive')) setInterval(() => { if (performance.now() - last > 200) tick(performance.now()); }, 33);
window.__tick = (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) advance(dt); return battle && (battle.phase + ' ' + battle.sim.time.toFixed(2)); };
// For looking closely at one thing from the console:  __look(x, y, w) shows only that part of the screen (fractions of it;
// w = 1 for everything), __focus(monster, w) centres it on a monster, __Q is the page's options (change, then press R).
window.__Q = Q;
window.__look = (x, y, w) => { const c = battle.camera; if (w >= 1) c.clearViewOffset(); else c.setViewOffset(innerWidth, innerHeight, x * innerWidth, y * innerHeight, w * innerWidth, w * innerHeight); };
window.__focus = (u, w = 0.35) => {
  const c = battle.camera; c.clearViewOffset(); c.updateMatrixWorld();
  const p = new THREE.Vector3(u.x, u.h * 0.5, u.z).project(c), sx = p.x * 0.5 + 0.5, sy = -p.y * 0.5 + 0.5;
  window.__look(Math.max(0, Math.min(1 - w, sx - w / 2)), Math.max(0, Math.min(1 - w, sy - w / 2)), w);
};
fit();
start(null);
requestAnimationFrame(frame);
