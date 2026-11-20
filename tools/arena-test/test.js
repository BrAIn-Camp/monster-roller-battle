// Standalone try-out page for arena.js: the wheel, then the battle, with random armies and stub ball/trainer models.
//   http://127.0.0.1:8417/tools/arena-test/            wheel, then a battle
//   ?arena=magma (or tidal canopy storm frost dune hollow meadow)   skip the wheel
//   ?n=60        critters per team (each team gets a random 40-140% of it)     ?titans=2   titans per team
//   ?cpu         no human: watch four CPU balls                                 ?mute       no sound
// Keys: WASD / arrows steer, Shift dashes, Space skips, R restarts, 1-8 restarts in that arena.
import * as THREE from 'three';
import { ARENAS, createWheel, createBattle } from '../../arena.js';
import { buildCritterGeometry } from '../../critters/kit.js';
import c1 from '../../critters/critters_1.js';
import c2 from '../../critters/critters_2.js';
import c3 from '../../critters/critters_3.js';

const CRITTERS = [].concat(c1, c2, c3), Q = new URLSearchParams(location.search);
const TEAMS = [
  { id: 'red', name: 'Red', hex: 0xe24a4a, css: '#e24a4a' }, { id: 'green', name: 'Green', hex: 0x3fae54, css: '#3fae54' },
  { id: 'yellow', name: 'Yellow', hex: 0xe9c21f, css: '#d9aa00' }, { id: 'blue', name: 'Blue', hex: 0x3f7fe0, css: '#3f7fe0' },
];
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const info = document.getElementById('info');

// ---- stub models (the real game passes its own builders)
const geoCache = new Map();
const teamMats = TEAMS.map((tm) => new THREE.MeshLambertMaterial({ vertexColors: true, color: new THREE.Color(tm.hex).lerp(new THREE.Color(0xffffff), 0.35), emissive: tm.hex, emissiveIntensity: 0.22 }));
function buildMesh(spec, k) {
  const key = (spec.base || spec).id;
  let geo = geoCache.get(key);
  if (!geo) { geo = buildCritterGeometry(spec.base || spec); geoCache.set(key, geo); }
  return new THREE.Mesh(geo, teamMats[k]);
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
addEventListener('keydown', (e) => {
  wake(); keys.add(e.code);
  if (e.code === 'Space') { e.preventDefault(); if (battle && !battle.finished) battle.skip(); }
  if (e.code === 'KeyR') start(null);
  if (/^Digit[1-8]$/.test(e.code)) start(ARENAS[+e.code.slice(5) - 1]);
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('pointerdown', wake);
const held = (...codes) => codes.some((c) => keys.has(c));
const input = () => ({ x: (held('KeyD', 'ArrowRight') ? 1 : 0) - (held('KeyA', 'ArrowLeft') ? 1 : 0), z: (held('KeyS', 'ArrowDown') ? 1 : 0) - (held('KeyW', 'ArrowUp') ? 1 : 0), dash: held('ShiftLeft', 'ShiftRight') });

// ---- armies
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const titanOf = (sp) => Object.assign({}, sp, { id: 'titan' + sp.id, base: sp, name: 'Titan ' + sp.name, height: Math.round(sp.height * 100) / 10, titan: true });
function makeTeams() {
  const n = Q.has('n') ? +Q.get('n') : 50, titans = Q.has('titans') ? +Q.get('titans') : 1;
  return TEAMS.map((tm, k) => {
    const army = [], size = Math.round(n * (0.4 + Math.random()));
    for (let i = 0; i < size; i++) army.push(pick(CRITTERS));
    for (let i = 0; i < titans; i++) army.push(titanOf(pick(CRITTERS.filter((c) => c.height < 2.5))));
    return Object.assign({}, tm, { army, ballD: 1.5 + Math.random() * 12, human: k === 0 && !Q.has('cpu') });
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
  else wheel = createWheel({ arenas: ARENAS, pickIndex: Math.floor(Math.random() * ARENAS.length), teams, sfx });
  info.textContent = 'WASD / arrows: steer    Shift: dash    Space: skip    R: restart    1-8: pick an arena';
}
function begin(arena) {
  battle = createBattle({ arena, teams, buildMesh, buildBall, buildTrainer, poseTrainer, input, sfx });
  battle.resize(innerWidth / innerHeight);
}
function fit() { renderer.setSize(innerWidth, innerHeight, false); if (battle) battle.resize(innerWidth / innerHeight); }
addEventListener('resize', fit);

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
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
      info.textContent = `Winner: ${r.winner < 0 ? 'nobody' : teams[r.winner].name}${r.timedOut ? ' (on time)' : ''} after ${r.seconds.toFixed(1)} s   |   left: ${st.map((s) => s.alive + '/' + s.all).join('  ')}   |   scoops: ${r.scoops.join(' ')}   |   MVP: ${r.mvp ? r.mvp.name + ' (' + r.mvp.kills + ' KOs)' : 'none'}   |   R: again`;
    }
  } else renderer.clear();
}
fit();
start(null);
requestAnimationFrame(frame);
