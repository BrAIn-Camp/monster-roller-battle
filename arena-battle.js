// THE ARENA FIGHT ON SCREEN: the scene, the fighters and their animations, every effect and sound, the HUD, and
// the short intro that shows the armies merging before they are dropped in. The fight itself is arena-sim.js;
// this file only watches it (sim.events, and the positions of things) and draws. Nothing here uses the fight's
// dice, so drawing can never put two machines out of step.
//
//   merge  -> the showcase: three of a kind spin together and become one     (skipped when nobody merged)
//   drop   -> the fighters and the balls fall in
//   countdown -> 3, 2, 1, GO     fight -> sim.step()     finish -> slow-motion last knockout, then the cheer
import * as THREE from 'three';
import { createSim, TUNE, CORNERS } from './arena-sim.js';
import { planArmy, power } from './arena-merge.js';
import { createFx, TYPE_HEX, TYPE_GLOW } from './arena-fx.js';
import { el, setText, replay, injectStyle, isMe, teamLabel, chip, HAS_DOM, clamp } from './arena-ui.js';

// ---------- timings and looks ----------
const FUSE = 1.05;            // seconds for one "three become one"
const GATHER = 0.6;           // share of that spent spinning together (the rest: the flash, and the new one landing)
const SHOW_FUSES = 3;         // merges shown per team, one after another (its most valuable lines)
const MERGE_START = 0.35, MERGE_HOLD = 0.6;           // a beat before the first one, and after the last
const DROP_PHASE = 1.9, DROP_FALL = 0.42;
const COUNT_STEP = 0.7;       // seconds per "3", "2", "1"
const FREEZE = 1.5, CHEER = 4.2;                      // slow-motion last knockout, then the winners' celebration
const SLOWMO = 0.22;
const CAM_FOV = 36, CAM_ELEV = 1.06;                  // the camera: field of view (deg), elevation above the floor (rad)
const CAM_CLOSE = 0.42;       // how far in it will go when few are left (share of the way to the floor)
const STICKERS = 30;          // scooped monsters drawn on a ball
const SND = {                 // [wave, from Hz, to Hz, seconds] for a hit of each type
  normal: ['triangle', 330, 190, 0.09], fire: ['sawtooth', 430, 150, 0.16], water: ['sine', 540, 250, 0.14], grass: ['triangle', 720, 480, 0.1], electric: ['square', 1500, 650, 0.08],
  ice: ['sine', 1750, 1150, 0.1], fighting: ['square', 190, 85, 0.1], poison: ['sawtooth', 310, 210, 0.14], ground: ['sawtooth', 125, 55, 0.17], flying: ['sine', 880, 1320, 0.1],
  psychic: ['sine', 980, 1480, 0.16], bug: ['square', 920, 600, 0.05], rock: ['sawtooth', 155, 68, 0.14], ghost: ['sine', 300, 520, 0.2], dragon: ['sawtooth', 250, 520, 0.18],
};
// shapes shared by every fight (built once, never disposed)
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 14), cone: new THREE.ConeGeometry(0.5, 1, 10),
  sph: new THREE.SphereGeometry(0.5, 14, 10), rock: new THREE.DodecahedronGeometry(0.5, 0),
  disc: new THREE.CircleGeometry(1, 30).rotateX(-Math.PI / 2), ring: new THREE.RingGeometry(0.78, 1, 30).rotateX(-Math.PI / 2),
  thin: new THREE.RingGeometry(0.9, 1, 30).rotateX(-Math.PI / 2), plane: new THREE.PlaneGeometry(1, 1), planeL: new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0),
  unitRing: new THREE.RingGeometry(0.86, 1, 30).rotateX(-Math.PI / 2),
};
const backOut = (u) => 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;
const bounceOut = (u) => { const n = 7.5625, d = 2.75; return u < 1 / d ? n * u * u : u < 2 / d ? n * (u -= 1.5 / d) * u + 0.75 : u < 2.5 / d ? n * (u -= 2.25 / d) * u + 0.9375 : n * (u -= 2.625 / d) * u + 0.984375; };
const smooth = (u) => u * u * (3 - 2 * u);

// What each army merges into. Also used by the game to preload models while the wheel spins.
export function planTeams(teams, arena, specOf) {
  return teams.map((tm, k) => planArmy(tm.army || [], { arena, specOf, teamIndex: k, limit: TUNE.ROSTER_CAP }));
}

// rand: the fight's dice (a seeded one in multiplayer, so every machine fights the same fight); input(team) gives a
// player's stick; noSkip: no skipping (a multiplayer fight is stepped by the host).
// buildActor(spec, team) -> { root, play(name, opts), update(dt), flash(k, color), dispose(), rigged }
export function createBattle({ arena, teams = [], specOf, plans, buildActor, buildMesh, buildBall, buildTrainer, poseTrainer, input, sfx, rand: dice, noSkip = false } = {}) {
  const NT = teams.length, vr = Math.random;
  let quiet = false, destroyed = false;                         // quiet: no effects or sound (while skipping)
  const tone = (...a) => { if (quiet) return; try { if (sfx && sfx.tone) sfx.tone(...a); } catch (e) { /* no audio */ } };
  const cry = (spec, vol) => { if (quiet) return; try { if (sfx && sfx.cry) sfx.cry(spec, vol); } catch (e) { /* no audio */ } };
  if (!buildActor) buildActor = (spec, k) => { const mesh = buildMesh(spec, k), root = new THREE.Group(); root.add(mesh); return { root, rigged: false, play: () => 0, update() {}, flash() {}, dispose() {} }; };

  // Every actor made is kept track of until it is let go, so destroy() can be sure of leaving none behind: not the
  // scooped ones riding a ball, nor ones that fell while a fight was being skipped, nor one whose model is still loading.
  const actors = new Set(), makeActor = buildActor;
  buildActor = (spec, k) => { const a = makeActor(spec, k); actors.add(a); return a; };
  const freeActor = (a) => { if (!actors.delete(a)) return; a.root.removeFromParent(); a.dispose(); };

  // ---- the fight
  plans = plans || planTeams(teams, arena, specOf);
  const sim = createSim({ arena, rand: dice || Math.random, input, teams: teams.map((tm, k) => ({ roster: plans[k].roster, backing: plans[k].backing, ballD: tm.ballD, human: tm.human })) });
  const L = sim.L, half = sim.half, K = sim.K, DROP = L * 0.14;
  const total = sim.recs.reduce((n, r) => n + r.length, 0);
  const myTeam = teams.findIndex(isMe);

  // ---- scene, materials, helpers
  const scene = new THREE.Scene();
  const sky = new THREE.Color(arena.sky), skyHot = new THREE.Color(0x5a1420);
  scene.background = sky.clone();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9a8f7a, 1.75); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4d6, 1.8); sun.position.set(L * 0.35, L * 0.95, L * 0.5); scene.add(sun);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  { const c = sun.shadow.camera, s = L * 0.78; c.left = -s; c.right = s; c.top = s; c.bottom = -s; c.near = 1; c.far = L * 3.2; c.updateProjectionMatrix(); }
  const camera = new THREE.PerspectiveCamera(CAM_FOV, 16 / 9, 0.5, 2000), camBase = new THREE.Vector3(), camLook = new THREE.Vector3(), camDir = new THREE.Vector3();
  const mats = new Map(), owned = [];
  const matOf = (Kind, tag, color, o) => { const key = tag + color + (o ? JSON.stringify(o) : ''); let m = mats.get(key); if (!m) { m = new Kind(Object.assign({ color }, o)); mats.set(key, m); } return m; };
  const lam = (color, o) => matOf(THREE.MeshLambertMaterial, 'L', color, o), bas = (color, o) => matOf(THREE.MeshBasicMaterial, 'B', color, o);
  const glass = (color, opacity) => bas(color, { transparent: true, opacity, depthWrite: false });
  // Everything beyond the floor sits in `outside`, which is sunk by DROP: the floor is a platform and what is
  // around it is a long way down. put() sends anything placed past the edge there by itself.
  const outside = new THREE.Group(); outside.position.y = -DROP; scene.add(outside);
  const put = (geo, m, x, y, z, sx = 1, sy = sx, sz = sx, ry = 0, parent) => {
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.y = ry;
    (parent || (Math.abs(x) > half + 0.01 || Math.abs(z) > half + 0.01 ? outside : scene)).add(o); return o;
  };
  let seed = 12345 + arena.id.length * 977 + arena.id.charCodeAt(0) * 31;
  const srand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };     // seeded: the dressing is the same every time
  const v3 = new THREE.Vector3(), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3(), col = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0), camQ = new THREE.Quaternion();
  let T = 0, shake = 0;
  const bump = (s) => { if (!quiet) shake = Math.max(shake, s); };

  // ---- the platform: a slab with a bright lip, team corners, and the themed world far below
  put(GEO.box, lam(arena.ground), 0, -0.6, 0, L * 9, 0.6, L * 9, 0, outside);
  const floor = put(GEO.box, lam(arena.floor), 0, -0.2, 0, L, 0.4, L, 0, scene); floor.receiveShadow = true;
  put(GEO.box, lam(arena.wall), 0, -0.4 - DROP * 0.5, 0, L - 0.3, DROP, L - 0.3, 0, scene);
  put(GEO.box, lam(new THREE.Color(arena.wall).multiplyScalar(0.7).getHex()), 0, -DROP - 0.1, 0, L * 0.86, DROP * 0.6, L * 0.86, 0, scene);
  for (const [x, z, w, d] of [[0, -half + 0.14, L, 0.28], [0, half - 0.14, L, 0.28], [-half + 0.14, 0, 0.28, L], [half - 0.14, 0, 0.28, L]]) put(GEO.box, bas(0xfff6d8), x, 0.012, z, w, 0.02, d, 0, scene);   // the lip: this is the edge
  put(GEO.thin, glass(0xffffff, 0.35), 0, 0.012, 0, L * 0.13);
  teams.forEach((tm, k) => {
    const [cx, cz] = CORNERS[k % 4];
    const quad = new THREE.Mesh(new THREE.CircleGeometry(L * 0.3, 24, Math.atan2(cz, -cx) - Math.PI / 4, Math.PI / 2).rotateX(-Math.PI / 2), glass(tm.hex, 0.4));
    quad.position.set(cx * half, 0.014, cz * half); scene.add(quad); owned.push(quad.geometry);
    const px = cx * (half + 0.55), pz = cz * (half + 0.55);     // a corner block carrying the team's post and flag
    put(GEO.box, lam(arena.wall), px, -0.6, pz, 1.5, 1.2, 1.5, 0, scene);
    put(GEO.cyl, lam(tm.hex), px, 0.15, pz, 1.2, 0.3, 1.2, 0, scene);
    if (cz < 0) { put(GEO.cyl, lam(0xf5efe0), px, 2.2, pz, 0.16, 4, 0.16, 0, scene); put(GEO.box, lam(tm.hex), px - cx * 1.2, 3.5, pz, 2.2, 1.4, 0.08, 0, scene); }
  });
  // scatter(n, near, far, fn): n props outside the walls. k is a height factor: props on the camera side are kept low.
  const scatter = (n, near, far, fn) => { for (let i = 0; i < n; i++) { const side = i % 4, a = (srand() - 0.5) * (L + far * 2), o = half + 1.8 + near + srand() * (far - near); fn(side === 0 ? a : side === 1 ? o : side === 2 ? a : -o, side === 0 ? -o : side === 2 ? o : a, side === 2 ? 0.3 : 1, 0.7 + srand() * 0.6); } };
  const inside = (m = 0.9) => (srand() - 0.5) * L * m;
  const DRESS = {
    magma() {
      scatter(30, 0.5, 11, (x, z, k, s) => put(GEO.cone, lam(0x3d2d2d), x, 1.6 * k * s - 0.3, z, 2.4 * s, 3.2 * k * s, 2.4 * s));
      scatter(18, 1, 13, (x, z, k, s) => put(GEO.disc, bas(0xff8a2a), x, -0.28, z, 1.5 + s * 2));
      scatter(10, 2, 12, (x, z, k, s) => put(GEO.disc, bas(0xffd23f), x, -0.27, z, 0.6 * s));
      for (let i = 0; i < 12; i++) put(GEO.box, bas(arena.detail), inside(), 0.011, inside(), 0.14, 0.02, 2 + srand() * 4, srand() * 3.14);
      for (let i = 0; i < 10; i++) put(GEO.disc, lam(0x4a3737), inside(), 0.008, inside(), 1 + srand() * 1.6);
    },
    tidal() {
      for (let i = 1; i < 12; i++) put(GEO.box, lam(arena.detail), -half + i * L / 12, 0.011, 0, 0.1, 0.02, L);
      scatter(30, 1, 14, (x, z, k, s) => put(GEO.box, glass(0xffffff, 0.55), x, -0.28, z, 2.5 + s * 3, 0.02, 0.4));
      scatter(10, 2, 9, (x, z, k, s) => { put(GEO.sph, lam(0xe24a4a), x, 0, z, 1.3 * s); put(GEO.cyl, lam(0xffffff), x, 0.2, z, 1.34 * s, 0.25 * s, 1.34 * s); });
      for (let i = -3; i <= 3; i++) for (const sgn of [-1, 1]) put(GEO.cyl, lam(0x5a4028), sgn * (half + 1.4), 0.4, i * L / 6.5, 0.6, sgn * i > 9 ? 1 : 2.2, 0.6);
      put(GEO.cyl, lam(0xf5efe0), half + 7, 3.5, -half - 5, 3, 8, 3); put(GEO.cyl, lam(0xe24a4a), half + 7, 4.5, -half - 5, 3.06, 2, 3.06); put(GEO.sph, bas(0xffe169), half + 7, 8.2, -half - 5, 2.2);   // lighthouse
      scatter(8, 3, 12, (x, z, k, s) => put(GEO.rock, lam(0x6a7684), x, -0.1, z, 2.5 * s, 1.6 * s * k, 2.2 * s));
    },
    canopy() {
      scatter(34, 1, 13, (x, z, k, s) => { put(GEO.cyl, lam(0x7a5a3a), x, 1.4 * k * s, z, 0.7 * s, 3.4 * k * s, 0.7 * s); put(GEO.sph, lam(srand() < 0.5 ? 0x3f8f4a : 0x4fa856), x, (3.4 * k + 0.9) * s, z, 4 * s, 3 * s * (0.5 + k / 2), 4 * s); });
      scatter(12, 0.3, 6, (x, z, k, s) => { put(GEO.cyl, lam(0xf2e6c4), x, 0.3 * s, z, 0.5 * s, 1.2 * s, 0.5 * s); put(GEO.sph, lam(0xd2468c), x, 0.95 * s, z, 1.8 * s, 0.9 * s, 1.8 * s); });
      for (let i = 0; i < 16; i++) put(GEO.disc, lam(arena.detail), inside(), 0.008, inside(), 1 + srand() * 2.2);
      for (let i = 0; i < 26; i++) put(GEO.sph, lam([0xffe169, 0xffffff, 0xf06a9a][i % 3]), inside(0.96), 0.05, inside(0.96), 0.3, 0.12, 0.3);
    },
    storm() {
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 0], [1, 0], [0, -1], [-0.5, -1], [0.5, -1]]) { const x = a * (half + 4), z = b * (half + 4); put(GEO.cyl, lam(0x5a6272), x, 4.5, z, 0.7, 10, 0.7); put(GEO.cone, lam(0x4a5262), x, 0.6, z, 2.4, 2, 2.4); put(GEO.sph, bas(arena.detail), x, 9.9, z, 1.3); }
      scatter(26, 1, 15, (x, z, k, s) => { for (let j = 0; j < 3; j++) put(GEO.sph, lam(j ? 0x5c667a : 0x6b768c), x + (j - 1) * 2.2 * s, -0.2 + (j === 1 ? 0.5 : 0), z + (j % 2) * 0.8, 4 * s, 1.8 * s * (0.4 + k * 0.6), 3.2 * s); });
      for (const sgn of [-1, 1]) { put(GEO.box, bas(arena.detail), 0, 0.011, sgn * (half - 0.5), L - 1, 0.02, 0.22); put(GEO.box, bas(arena.detail), sgn * (half - 0.5), 0.011, 0, 0.22, 0.02, L - 1); }
      for (let i = 1; i < 6; i++) { put(GEO.box, lam(0x7a8498), -half + i * L / 6, 0.009, 0, 0.12, 0.02, L); put(GEO.box, lam(0x7a8498), 0, 0.009, -half + i * L / 6, L, 0.02, 0.12); }
    },
    frost() {
      scatter(30, 0.5, 11, (x, z, k, s) => put(GEO.cone, lam(0x9fdcf0), x, 1.7 * k * s - 0.3, z, 1.5 * s, 3.6 * k * s, 1.5 * s));
      scatter(16, 1, 12, (x, z, k, s) => put(GEO.sph, lam(0xffffff), x, -0.3, z, 4.5 * s, 1.8 * s * k, 3.6 * s));
      scatter(14, 3, 13, (x, z, k, s) => { put(GEO.cyl, lam(0x6b4a2e), x, 0.4, z, 0.5, 1.4, 0.5); put(GEO.cone, lam(0x2f6b4f), x, 2.2 * k + 0.6, z, 2.8 * s, 3.6 * k, 2.8 * s); put(GEO.cone, lam(0xffffff), x, 3.7 * k + 0.6, z, 1.3 * s, 1.5 * k, 1.3 * s); });
      for (let i = 0; i < 18; i++) put(GEO.box, glass(0xffffff, 0.6), inside(), 0.011, inside(), 0.07, 0.02, 2 + srand() * 5, srand() * 3.14);
      for (let i = 0; i < 8; i++) put(GEO.disc, glass(0xffffff, 0.3), inside(), 0.009, inside(), 1.5 + srand() * 2.5);
    },
    dune() {
      put(GEO.ring, lam(arena.detail), 0, 0.009, 0, L * 0.36); put(GEO.disc, lam(arena.detail), 0, 0.008, 0, L * 0.09);
      scatter(22, 0.4, 7, (x, z, k, s) => { const hh = (2 + srand() * 4.5) * k; put(GEO.cyl, lam(0xcaa66a), x, hh / 2 - 0.3, z, 1.3, hh, 1.3); put(GEO.box, lam(0xb98f55), x, hh - 0.2, z, 1.7, 0.4, 1.7); });
      scatter(14, 5, 15, (x, z, k, s) => put(GEO.sph, lam(0xe2c688), x, -0.4, z, 9 * s, 2.4 * s * k, 6 * s));
      scatter(12, 3, 12, (x, z, k, s) => { put(GEO.cyl, lam(0x5f9a4a), x, 1 * k, z, 0.6, 2.6 * k, 0.6); put(GEO.cyl, lam(0x5f9a4a), x + 0.55, 1.3 * k, z, 0.4, 1.1 * k, 0.4); put(GEO.cyl, lam(0x5f9a4a), x - 0.55, 1 * k, z, 0.4, 0.9 * k, 0.4); });
    },
    hollow() {
      for (let i = 1; i < 7; i++) { put(GEO.box, lam(arena.detail), -half + i * L / 7, 0.009, 0, 0.14, 0.02, L); put(GEO.box, lam(arena.detail), 0, 0.009, -half + i * L / 7, L, 0.02, 0.14); }
      scatter(36, 0.5, 10, (x, z, k, s) => { put(GEO.box, lam(0x8d8a9c), x, 0.4 * s, z, 1.1 * s, 1.5 * s, 0.35); put(GEO.cyl, lam(0x8d8a9c), x, 1.15 * s, z, 1.1 * s, 0.35, 1.1 * s).rotation.x = Math.PI / 2; });
      scatter(14, 2, 13, (x, z, k, s) => { put(GEO.cyl, lam(0x3a2f2a), x, 1.8 * k * s, z, 0.6, 4.2 * k * s, 0.6); for (const sg of [-1, 1]) put(GEO.cyl, lam(0x3a2f2a), x + sg * 0.9, 3.4 * k * s, z, 0.3, 2.2 * k, 0.3).rotation.z = -sg * 0.9; });
      scatter(12, 0.3, 8, (x, z, k, s) => { put(GEO.cyl, lam(0x2a2438), x, 0.9 * k, z, 0.2, 2.4 * k, 0.2); put(GEO.sph, bas(0xffc94d), x, 2.2 * k + 0.1, z, 0.75); });
      scatter(8, 1, 9, (x, z, k, s) => put(GEO.sph, lam(0xe8873a), x, 0.1, z, 1.1 * s, 0.85 * s, 1.1 * s));
    },
    meadow() {
      for (let i = 0; i < 10; i += 2) put(GEO.box, lam(arena.detail), -half + (i + 0.5) * L / 10, 0.008, 0, L / 10, 0.02, L);
      for (const sgn of [-1, 1]) { put(GEO.box, bas(0xffffff), 0, 0.012, sgn * (half - 0.6), L - 1.2, 0.02, 0.16); put(GEO.box, bas(0xffffff), sgn * (half - 0.6), 0.012, 0, 0.16, 0.02, L - 1.2); }
      for (const [sx, sz] of [[0, -1], [-1, 0], [1, 0]]) for (let tier = 0; tier < 3; tier++) {                 // stands with a crowd on three sides
        const o = half + 3 + tier * 2.2, w = L * 0.8;
        put(GEO.box, lam(0xcfc9bb), sx * o, tier * 0.7, sz * o, sx ? 2.2 : w, 1.4 + tier * 1.4, sx ? w : 2.2);
        for (let i = 0; i < 16; i++) { const a = (srand() - 0.5) * w * 0.94; put(GEO.sph, lam([0xe24a4a, 0x3fae54, 0xe9c21f, 0x3f7fe0, 0xffffff][Math.floor(srand() * 5)]), sx ? sx * o : a, tier * 1.4 + 1.2, sz ? sz * o : a, 0.9); }
      }
      scatter(10, 0.3, 3, (x, z, k, s) => { if (k < 1) put(GEO.sph, lam(0x4fa856), x, 0, z, 2.6 * s, 1.2, 1.6); });
    },
  };
  (DRESS[arena.id] || DRESS.meadow)();

  // ---- effects and sound
  const fx = createFx({ scene, camera, L });
  let sndBudget = 0;                                            // hit sounds are rationed (about 14 a second, 3 at once), so a pile-up is not a wall of beeps
  const hitSound = (type, vol, pitch = 1) => { if (sndBudget < 1) return; sndBudget--; const s = SND[type] || SND.normal; tone(s[1] * pitch, s[2] * pitch, s[3], s[0], vol); };
  const hexOf = (type) => TYPE_HEX[type] || 0xffffff, glowOf = (type) => TYPE_GLOW[type] || 0xffffff;

  // ---- drawn in bulk: team rings, favoured auras, health bars, signature-move meters, stars, "roll through me" marks
  const RN = NT * TUNE.FIELD_CAP + 24;
  const inst = (geo, material, n = RN) => { const m = new THREE.InstancedMesh(geo, material, n); m.frustumCulled = false; m.count = 0; scene.add(m); owned.push(material); return m; };
  const ringMesh = inst(GEO.unitRing, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false }));
  const auraMesh = inst(GEO.thin, new THREE.MeshBasicMaterial({ color: 0xffe169, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  const barBg = inst(GEO.plane, new THREE.MeshBasicMaterial({ color: 0x2b2540, depthTest: false, transparent: true }));
  const barLag = inst(GEO.planeL, new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true }));
  const barFill = inst(GEO.planeL, new THREE.MeshBasicMaterial({ depthTest: false, transparent: true }));
  const barCharge = inst(GEO.planeL, new THREE.MeshBasicMaterial({ depthTest: false, transparent: true }));
  const starMesh = inst(fx.GEO.star5, new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false, transparent: true, side: THREE.DoubleSide }), RN * 3);
  const markMesh = inst(fx.GEO.chevron, new THREE.MeshBasicMaterial({ color: 0xffe169, depthTest: false, transparent: true, side: THREE.DoubleSide }), TUNE.FIELD_CAP + 4);
  // a trail of gold dots from the player's ball to one of their own monsters, until they have rolled through one:
  // the rally shown, not explained
  const GUIDE = 9, guideMesh = inst(GEO.disc, new THREE.MeshBasicMaterial({ color: 0xffe169, transparent: true, opacity: 0.9, depthWrite: false }), GUIDE);
  let guideOn = myTeam >= 0 ? 1 : 0, guideTo = null;
  barBg.renderOrder = 5; barLag.renderOrder = 6; barFill.renderOrder = 7; barCharge.renderOrder = 7; starMesh.renderOrder = 8; markMesh.renderOrder = 8;
  const teamCol = teams.map((tm) => new THREE.Color(tm.hex)), GOLD = new THREE.Color(0xffd23f), DIM = new THREE.Color(0x8a86a0), WHITE = new THREE.Color(0xffffff);

  // ---- fighters. A monster's drawing state hangs off it as u.v; the sim never looks at it.
  const views = [], dying = [];
  function ensure(u, made) {                                    // made: an actor that already exists (from the merge showcase)
    if (u.v) return u.v;
    const actor = made || buildActor(u.spec, u.team);
    if (!made) { actor.root.scale.setScalar(0.0001); actor.root.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(actor.root); }
    actor.root.rotation.order = 'YXZ';                              // turn to face first, then lean: so a lean is always forwards
    const v = u.v = { u, actor, pop: 0, delay: 0, fall: -1, land: 1, lunge: 0, kick: 0, flash: 0, flashCol: 0xffffff, squash: 0, yaw: u.yaw, y: 0, lag: 1, phase: vr() * 6.28, tele: null, ice: null, lift: 0, tumble: 0, hop: null, bar: 0, lean: 0 };
    views.push(v);
    return v;
  }
  function dropTele(v) { if (v.tele) { for (const h of v.tele) h.release(0.12); v.tele = null; } }
  function forget(v) {                                          // stop drawing it as a fighter (it is now a falling body, or on a ball)
    dropTele(v); if (v.ice) { v.ice.release(0.1); v.ice = null; }
    const i = views.indexOf(v); if (i >= 0) views.splice(i, 1);
  }
  const groundY = (x, z) => (Math.abs(x) <= half && Math.abs(z) <= half ? 0 : -DROP);

  // ---- balls
  const ballViews = sim.balls.map((b, k) => {
    const tm = teams[k], w = { b, group: new THREE.Group(), roll: new THREE.Group(), drawn: 0, y: 0, vy: 0, fallen: false, fx: 0, fz: 0, dust: 0, dim: false };
    w.group.add(w.roll); scene.add(w.group);
    w.mesh = buildBall ? buildBall(k) : put(GEO.sph, lam(tm.hex), 0, 0, 0, 2, 2, 2, 0, w.roll); w.roll.add(w.mesh);
    w.mesh.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    w.trainer = buildTrainer ? buildTrainer(k) : null; if (w.trainer) scene.add(w.trainer);
    w.ring = put(GEO.ring, glass(tm.hex, 0.9), 0, 0.03, 0, 1, 1, 1, 0, scene); w.stars = new THREE.Group(); w.stars.visible = false; scene.add(w.stars);
    for (let i = 0; i < 3; i++) put(GEO.rock, bas(0xffe169), Math.cos(i * 2.094), 0, Math.sin(i * 2.094), 0.45, 0.45, 0.45, 0, w.stars);
    if (isMe(tm)) {                                             // the player's own ball: a bobbing arrow and a dash cooldown bar
      w.arrow = put(GEO.cone, bas(0xffe169), 0, 0, 0, 1, 1.4, 1, 0, scene); w.arrow.rotation.x = Math.PI;
      w.cdBg = put(GEO.box, bas(0x2b2540), 0, 0.04, 0, 1, 0.02, 0.4, 0, scene); w.cdFill = put(GEO.box, bas(0xffe169), 0, 0.06, 0, 1, 0.02, 0.24, 0, scene);
    }
    return w;
  });
  function dimBall(w, out) {                                    // a team with nobody left: its ball keeps playing, dimmed
    if (w.dim === out) return; w.dim = out;
    w.mesh.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      if (!o.userData.arLive) { o.userData.arLive = o.material; const m = o.material.clone(); if (m.color) m.color.multiplyScalar(0.3).lerp(col.set(0x777788), 0.35); if (m.emissive) m.emissive.multiplyScalar(0.15); o.userData.arDim = m; owned.push(m); }
      o.material = out ? o.userData.arDim : o.userData.arLive;
    });
    w.ring.material = out ? glass(0x555566, 0.7) : glass(teams[w.b.team].hex, 0.9);
    if (hud) hud.panels[w.b.team].root.classList.toggle('ar-isout', out);
  }
  function stick(w, u) {                                        // a scooped monster rides on the ball
    const v = ensure(u), b = w.b; forget(v);
    v3.set(u.x - b.x, u.h * 0.5 - b.R * 0.3 + vr() * b.R * 0.6, u.z - b.z).normalize();
    const root = v.actor.root; root.removeFromParent();
    if (w.drawn < STICKERS) {
      w.drawn++; v3.applyQuaternion(q4.copy(w.roll.quaternion).invert());
      root.position.copy(v3).multiplyScalar(0.86); root.quaternion.setFromUnitVectors(UP, v3); root.userData.arH = u.h; root.scale.setScalar(Math.min(u.h, b.R * 0.9) / b.R); w.roll.add(root);
    }
  }
  function unstick(w, u) {
    const v = u.v; if (!v) return;
    const root = v.actor.root;
    if (root.parent === w.roll) w.drawn--;
    root.removeFromParent(); root.userData.arH = 0; root.quaternion.identity(); scene.add(root);
    v.pop = 0.4; v.fall = -1; v.yaw = u.yaw; views.push(v);
  }

  // ---- the arena's hazard, drawn from the sim's zones
  const hazView = (function makeHazardView() {
    const H = sim.haz, Z = H.zones, kind = H.kind, W = H.W, noop = () => {};
    const arrows = () => { const g = new THREE.Group(); for (let i = -1; i <= 1; i++) { const c = put(GEO.cone, glass(0xffffff, 0.75), i * L * 0.2, 0.05, 0, L * 0.07, L * 0.11, 0.05, 0, g); c.rotation.x = Math.PI / 2; } g.visible = false; scene.add(g); return g; };
    if (kind === 'vents') {
      for (const q of Z) { const r = q.r; put(GEO.disc, lam(0x2a1f1f), q.x, 0.016, q.z, r); put(GEO.thin, bas(0xff8a2a), q.x, 0.02, q.z, r); q.core = put(GEO.disc, bas(0xffb03a), q.x, 0.024, q.z, r * 0.3); q.col = put(GEO.cyl, glass(0xffa53a, 0.8), q.x, 0, q.z, r, 1, r); q.col.visible = false; }
      return { warn: () => tone(160, 240, 0.35, 'sawtooth', 0.06), fire: (q) => { fx.puff(q.x, 0.6, q.z, 18, 0xff8a2a, 8, 0.55, 0.8, -16, 10); fx.burst(q.x, 1, q.z, 16, 0xffd23f, 9, 0.5, 0.6); fx.ring(q.x, q.z, { r0: q.r * 0.5, r1: q.r * 1.7, color: 0xff8a2a, life: 0.4 }); bump(0.3); tone(150, 45, 0.45, 'sawtooth', 0.2); },
        view() { for (const q of Z) { const r = q.r; q.core.scale.setScalar(r * (q.s === 1 ? 0.3 + 0.7 * (1 - q.t / H.WARN) + 0.04 * Math.sin(T * 34) : q.s === 2 ? 1 : 0.26 + 0.04 * Math.sin(T * 2 + q.x))); q.col.visible = q.s === 2; if (q.s === 2) { const k = q.t / H.ACT, hh = 3 + 8 * (1 - k); q.col.scale.set(r * 1.5 * k + 0.3, hh, r * 1.5 * k + 0.3); q.col.position.y = hh / 2; } } } };
    }
    if (kind === 'lightning') {
      for (const q of Z) { const r = q.r; q.g = new THREE.Group(); put(GEO.thin, bas(0xffe169), 0, 0.03, 0, r, r, r, 0, q.g); q.fill = put(GEO.disc, glass(0xffe169, 0.45), 0, 0.028, 0, r, r, r, 0, q.g); q.bolt = put(GEO.box, bas(0xfffbe0), 0, 15, 0, 0.5, 30, 0.5, 0, q.g); q.g.visible = false; scene.add(q.g); }
      return { warn: () => tone(1300, 1500, 0.07, 'square', 0.04), fire: (q) => { fx.puff(q.x, 0.5, q.z, 12, 0xffe169, 7, 0.35, 0.5, -10, 5); fx.flash(q.x, 1, q.z, { r: q.r * 1.2, color: 0xfff6b0 }); fx.ring(q.x, q.z, { r0: q.r * 0.4, r1: q.r * 1.8, color: 0xffe169 }); bump(0.25); tone(1800, 120, 0.3, 'sawtooth', 0.2); },
        view() { for (const q of Z) { q.g.visible = q.s > 0; q.g.position.set(q.x, 0, q.z); q.bolt.visible = q.s === 2; if (q.s === 1) q.fill.scale.setScalar(q.r * (1 - q.t / H.WARN) + 0.01); else if (q.s === 2) q.bolt.position.x = Math.sin(T * 90) * 0.3; } } };
    }
    if (kind === 'spores') {
      for (const q of Z) { const r = q.r; put(GEO.thin, glass(0xa05ab8, 0.5), q.x, 0.02, q.z, r); put(GEO.cyl, lam(0xf2e6c4), q.x, 0.25, q.z, 0.5, 0.5, 0.5); q.cap = put(GEO.sph, lam(0xa05ab8), q.x, 0.6, q.z, 1.5, 0.7, 1.5); q.fill = put(GEO.disc, glass(0xa05ab8, 0.3), q.x, 0.024, q.z, 0.01); q.cloud = put(GEO.sph, glass(0xb9e06a, 0.4), q.x, 0.3, q.z, r * 2, 1.6, r * 2); q.cloud.visible = false; }
      return { warn: noop, fire: (q) => { fx.puff(q.x, 0.8, q.z, 14, 0xb9e06a, 4, 0.5, 1.2, -1, 2); tone(300, 180, 0.3, 'sine', 0.12); },
        view() { for (const q of Z) { const r = q.r, w = q.s === 1 ? 1 - q.t / H.WARN : 0; q.cap.scale.set(1.5 + w * 0.9 + (q.s === 1 ? 0.1 * Math.sin(T * 30) : 0), 0.7 + w * 0.5, 1.5 + w * 0.9); q.fill.scale.setScalar(q.s === 1 ? r * w + 0.01 : 0.01); q.cloud.visible = q.s === 2; if (q.s === 2) { const k = Math.min(1, (H.ACT - q.t) * 3, q.t * 2); q.cloud.scale.set(r * 2 * k, 1.6 + 0.2 * Math.sin(T * 3 + q.x), r * 2 * k); if (vr() < 0.2) fx.spark(q.x + (vr() - 0.5) * r * 1.4, 0.3, q.z + (vr() - 0.5) * r * 1.4, 0, 1.2, 0, 0xd8f09a, 0.25, 1); } } } };
    }
    if (kind === 'wave') {
      const g = new THREE.Group(), arr = arrows();
      put(GEO.cyl, glass(0x4aa8ee, 0.75), 0, 0, 0, 3.2, L, 2.6, 0, g).rotation.z = Math.PI / 2; put(GEO.box, bas(0xffffff), 0, 1.25, 0, L, 0.3, 0.7, 0, g); g.visible = false; scene.add(g);
      return { warn: () => tone(200, 320, 0.6, 'sine', 0.1), fire: () => tone(320, 120, 1.2, 'sine', 0.14),
        view() {
          g.visible = W.s > 0; arr.visible = W.s === 1 && Math.sin(T * 16) > -0.3;
          if (!W.s) return;
          g.position.set(W.dx * W.p, 0, W.dz * W.p); g.rotation.y = W.dx ? Math.PI / 2 : 0; g.scale.y = W.s === 1 ? 0.25 + 0.75 * (1 - W.t / H.WARN) : 1 + 0.08 * Math.sin(T * 10);
          arr.rotation.y = Math.atan2(W.dx, W.dz); arr.position.set(-W.dx * L * 0.3, 0, -W.dz * L * 0.3);
          if (W.s === 2 && vr() < 0.5) fx.spark(W.dx * W.p + W.dz * (vr() - 0.5) * L, 1.3, W.dz * W.p + W.dx * (vr() - 0.5) * L, W.dx * 2, 3, W.dz * 2, 0xffffff, 0.3, 0.5, -9);
        } };
    }
    if (kind === 'gust') {
      const arr = arrows();
      return { warn: () => tone(500, 700, 0.5, 'sine', 0.06), fire: () => tone(260, 420, H.ACT, 'sawtooth', 0.05),
        view() {
          arr.visible = W.s === 1 ? Math.sin(T * 16) > -0.3 : W.s === 2; arr.rotation.y = Math.atan2(W.dx, W.dz);
          if (W.s && vr() < (W.s === 2 ? 0.9 : 0.25)) { const sp = W.s === 2 ? 26 : 8; fx.spark((vr() - 0.5) * L - W.dx * L * 0.3, 0.3 + vr() * 2.5, (vr() - 0.5) * L - W.dz * L * 0.3, W.dx * sp, 0, W.dz * sp, 0xf7e7b8, 0.3, 0.7); }
        } };
    }
    if (kind === 'fog') {
      const fogMat = lam(0xa9a0cc, { transparent: true, opacity: 0.62, depthWrite: false });
      for (const q of Z) { const r = q.r; q.g = new THREE.Group(); for (let j = 0; j < 5; j++) put(GEO.sph, fogMat, Math.cos(j * 1.257) * r * 0.45 * (j ? 1 : 0), 1.2 + (j % 2) * 0.5, Math.sin(j * 1.257) * r * 0.45 * (j ? 1 : 0), r * 1.25, 1.8, r * 1.25, 0, q.g); scene.add(q.g); }
      return { warn: noop, fire: noop, view() { for (const q of Z) { q.g.position.set(q.x, 0.1 * Math.sin(T + q.vx * 9), q.z); q.g.rotation.y = T * 0.15 + q.vx; } } };
    }
    if (kind === 'bumpers') {
      for (const q of Z) { const r = q.r; put(GEO.cyl, lam(0xffffff), q.x, 0.3, q.z, r * 2, 0.6, r * 2); q.cap = put(GEO.sph, lam(0xe24a4a), q.x, 0.7, q.z, r * 2.3, 1.1, r * 2.3); put(GEO.thin, bas(0xffe169), q.x, 0.02, q.z, r * 1.5); }
      return { warn: noop, fire: noop, bumper: (q) => { tone(700, 1100, 0.1, 'square', 0.12); fx.puff(q.x, 0.8, q.z, 6, 0xffe169, 5, 0.3, 0.4); fx.ring(q.x, q.z, { r0: q.r, r1: q.r * 2.6, color: 0xffe169, life: 0.25 }); },
        view() { for (const q of Z) { const r = q.r, k = 1 + q.hit * 1.6; q.cap.scale.set(r * 2.3 * k, 1.1 / k, r * 2.3 * k); } } };
    }
    return { warn: noop, fire: noop, view: noop };
  })();

  const timed = [];                                             // held shapes with a time to live: [{ h, t }]
  const holdFor = (h, t) => { timed.push({ h, t }); };
  // ---- signature moves: the telegraph on the floor while one winds up...
  const stripYaw = (dx, dz) => Math.atan2(dx, dz) + Math.PI;   // the strip and wedge shapes run along -z
  function telegraph(u, w) {
    const v = ensure(u), M = w.M, c = hexOf(w.move), holds = [], k = () => clamp(w.t / w.dur, 0, 1), y = 0.035;
    // the whole area faintly, so it can be read at once; and a brighter fill that grows until the move goes off
    const outline = (kind, o, place) => holds.push(fx.hold(kind, Object.assign({ color: c, opacity: 0.16 }, o), (t, dt, m) => place(m, 1)));
    const fill = (kind, o, place) => holds.push(fx.hold(kind, Object.assign({ color: c, opacity: 0.3 }, o), (t, dt, m) => { place(m, k()); m.material.opacity = 0.2 + 0.22 * k() + 0.08 * Math.sin(T * 30); }));
    switch (M.shape) {
      case 'cone': { const place = (m, f) => { m.position.set(u.x, y, u.z); m.rotation.y = stripYaw(w.dx, w.dz); m.scale.set(w.reach * f, 1, w.reach * f); }; outline('wedge', { arc: M.arc }, place); fill('wedge', { arc: M.arc }, place); break; }
      case 'beam': case 'rush': case 'wave': { const wd = w.width + (M.shape === 'wave' ? 1.2 * K : 0), place = (m, f) => { m.position.set(u.x, y, u.z); m.rotation.y = stripYaw(w.dx, w.dz); m.scale.set(wd, 1, w.reach * f); }; outline('strip', {}, place); fill('strip', {}, place); break; }
      case 'nova': { const r = w.size + u.r; outline('disc', {}, (m) => { m.position.set(u.x, y, u.z); m.scale.set(r, 1, r); }); fill('ring', {}, (m, f) => { m.position.set(u.x, y + 0.01, u.z); m.scale.set(r * f + 0.01, 1, r * f + 0.01); }); break; }
      case 'blast': case 'pool': { outline('disc', {}, (m) => { m.position.set(w.tx, y, w.tz); m.scale.set(w.size, 1, w.size); }); fill('ring', {}, (m, f) => { const r = w.size * (1.6 - 0.6 * f); m.position.set(w.tx, y + 0.01, w.tz); m.scale.set(r, 1, r); }); break; }
      default: {                                               // one foe: a reticle that closes on it
        const t = w.target;
        fill('thin', {}, (m, f) => { const r = (t.r + 0.4) * (2.4 - 1.4 * f); m.position.set(t.x, y + 0.01, t.z); m.scale.set(r, 1, r); });
        fill('ring', { opacity: 0.4 }, (m, f) => { const r = (u.r + 0.3) * (0.6 + 0.6 * f); m.position.set(u.x, y, u.z); m.scale.set(r, 1, r); });
      }
    }
    if (w.move === 'rock') for (let i = 0; i < 6; i++) {        // the rocks are already on their way down
      const a = vr() * 6.28, d = Math.sqrt(vr()) * w.size * 0.8, x = w.tx + Math.cos(a) * d, z = w.tz + Math.sin(a) * d, s = (0.7 + vr() * 0.9) * K, start = L * 0.5 + i * 2, delay = vr() * 0.12;
      holds.push(fx.hold('rock', { color: 0x8f7c5c, opacity: 1, solid: true }, (t, dt, m) => { const f = clamp((w.t - delay) / (w.dur - delay), 0, 1); m.position.set(x, s * 0.4 + start * (1 - f * f), z); m.rotation.set(t * 5, t * 3, 0); m.scale.setScalar(s); }));
    }
    v.tele = holds;
    tone(300, 900, w.dur, 'sine', 0.05); v.actor.play('special', { dur: w.dur + 0.45 });
  }
  // ...and the move itself
  function fireFx(e) {
    const u = e.u, w = e.w, M = w.M, c = hexOf(w.move), g = glowOf(w.move), v = u.v, my = u.h * 0.55;
    if (v) { dropTele(v); v.kick = 0.25; }
    const s = SND[w.move] || SND.normal; tone(s[1] * 0.8, s[2] * 0.6, s[3] * 2.4, s[0], 0.2); tone(s[1] * 1.6, s[2] * 1.2, s[3] * 1.4, s[0], 0.1, 0.03);
    cry(u.spec, 0.1);
    switch (M.shape) {
      case 'cone': {
        const a0 = Math.atan2(w.dx, w.dz);
        for (let i = 0; i < 54; i++) { const a = a0 + (vr() - 0.5) * 2 * M.arc, sp = w.reach / 0.42 * (0.45 + vr() * 0.75); fx.spark(u.x + Math.sin(a) * u.r, my * (0.6 + vr() * 0.8), u.z + Math.cos(a) * u.r, Math.sin(a) * sp, (vr() - 0.3) * 3, Math.cos(a) * sp, vr() < 0.4 ? g : c, (0.45 + vr() * 0.7) * K, 0.3 + vr() * 0.25, 2, true, 1.5); }
        const h = fx.hold('wedge', { color: c, opacity: 0.6, lit: true, arc: M.arc }, (t, dt, m) => { m.position.set(u.x, 0.05, u.z); m.rotation.y = stripYaw(w.dx, w.dz); m.scale.set(w.reach, 1, w.reach); }); h.release(0.35);
        fx.flash(u.x + w.dx * u.r, my, u.z + w.dz * u.r, { r: u.h * 0.7, color: g }); bump(0.22);
        break;
      }
      case 'beam': {
        const x2 = u.x + w.dx * w.reach, z2 = u.z + w.dz * w.reach;
        fx.beam(u.x + w.dx * u.r, my, u.z + w.dz * u.r, x2, my, z2, { w: w.width * 0.9, life: 0.42, color: c, core: 0xffffff });
        for (let i = 0; i < 24; i++) { const f = vr(); fx.spark(u.x + w.dx * w.reach * f, my, u.z + w.dz * w.reach * f, (vr() - 0.5) * 6, vr() * 5, (vr() - 0.5) * 6, vr() < 0.5 ? g : c, 0.4 * K, 0.5, -4, true, 2); }
        fx.flash(u.x + w.dx * u.r, my, u.z + w.dz * u.r, { r: u.h * 0.9, color: g, life: 0.3 }); fx.ring(x2, z2, { r0: 0.5, r1: 3 * K, color: c }); bump(0.4);
        break;
      }
      case 'nova': {
        const r = w.size + u.r;
        fx.ring(u.x, u.z, { r0: u.r, r1: r * 1.05, color: c, life: 0.45, opacity: 1 }); fx.disc(u.x, u.z, { r0: u.r, r1: r, color: c, life: 0.35, opacity: 0.45 });
        if (M.grounded) { for (let i = 0; i < 30; i++) { const a = i / 30 * 6.283, d = r * (0.4 + vr() * 0.6); fx.spark(u.x + Math.cos(a) * d, 0.1, u.z + Math.sin(a) * d, Math.cos(a) * 3, 4 + vr() * 7, Math.sin(a) * 3, vr() < 0.5 ? 0x8f7c5c : 0xcfb98a, (0.3 + vr() * 0.5) * K, 0.6 + vr() * 0.4, -20); } for (let i = 0; i < 7; i++) { const a = vr() * 6.283, d = r * vr(); fx.shard(u.x + Math.cos(a) * d, 0.2, u.z + Math.sin(a) * d, Math.cos(a) * 2, 7 + vr() * 5, Math.sin(a) * 2, { size: (0.5 + vr() * 0.6) * K, color: 0x8f7c5c, rock: true, life: 0.9 }); } bump(0.55); tone(70, 35, 0.6, 'sawtooth', 0.22); }
        else { for (let i = 0; i < 36; i++) { const a = vr() * 6.283, sp = r / 0.5 * (0.6 + vr() * 0.5); fx.spark(u.x + Math.cos(a) * u.r, 0.3 + vr() * u.h * 0.6, u.z + Math.sin(a) * u.r, Math.cos(a) * sp, 1 + vr() * 3, Math.sin(a) * sp, vr() < 0.5 ? g : c, (0.3 + vr() * 0.4) * K, 0.5, -3, vr() < 0.5, 1.5); } bump(0.2); }
        if (e.healed) for (const f of e.healed) { fx.chevrons(f.x, f.h + 0.6, f.z, { color: 0x8dff7a, size: 0.4 + f.h * 0.12, n: 2 }); fx.burst(f.x, f.h * 0.6, f.z, 6, 0xc8ff8a, 3, 0.3, 0.6); if (f.v) { f.v.flash = 0.25; f.v.flashCol = 0x66ff55; } }
        break;
      }
      case 'blast': {
        const x = w.tx, z = w.tz;
        fx.ring(x, z, { r0: w.size * 0.3, r1: w.size * 1.15, color: c, opacity: 1, life: 0.45 }); fx.disc(x, z, { r0: w.size * 0.5, r1: w.size, color: g, life: 0.3 });
        if (w.move === 'ice') { fx.flash(x, 1, z, { r: w.size * 0.9, color: 0xd8f6ff, life: 0.3 }); for (let i = 0; i < 12; i++) { const a = vr() * 6.283; fx.shard(x, 0.5, z, Math.cos(a) * (4 + vr() * 6), 5 + vr() * 6, Math.sin(a) * (4 + vr() * 6), { size: (0.4 + vr() * 0.5) * K, color: 0xbff2ff, life: 0.8, opacity: 0.85 }); } fx.burst(x, 1, z, 24, 0xffffff, 9, 0.35 * K, 0.6); tone(2200, 900, 0.35, 'sine', 0.16); bump(0.25); }
        else if (w.move === 'rock') { for (let i = 0; i < 10; i++) { const a = vr() * 6.283; fx.shard(x + Math.cos(a) * w.size * 0.4, 0.4, z + Math.sin(a) * w.size * 0.4, Math.cos(a) * (3 + vr() * 6), 6 + vr() * 6, Math.sin(a) * (3 + vr() * 6), { size: (0.5 + vr() * 0.7) * K, color: 0x8f7c5c, rock: true, life: 1 }); } fx.puff(x, 0.3, z, 26, 0xcfb98a, 9, 0.6 * K, 0.8, -6, 2); bump(0.5); tone(90, 40, 0.5, 'sawtooth', 0.24); }
        else {                                                  // a whirlwind: rings climbing a funnel, and everything in it spinning out
          for (let i = 0; i < 60; i++) { const a = vr() * 6.283, d = w.size * (0.2 + vr() * 0.8), sp = 9 + vr() * 6; fx.spark(x + Math.cos(a) * d, 0.2 + vr() * 1, z + Math.sin(a) * d, -Math.sin(a) * sp + w.dx * 5, 2 + vr() * 6, Math.cos(a) * sp + w.dz * 5, vr() < 0.5 ? 0xffffff : c, (0.3 + vr() * 0.4) * K, 0.7, 0, true, 1.2); }
          for (let i = 0; i < 6; i++) fx.ring(x + w.dx * i * 0.35, z + w.dz * i * 0.35, { r0: w.size * 0.15, r1: w.size * (0.35 + i * 0.13), y: 0.3 + i * 0.75 * K, color: i % 2 ? 0xffffff : c, life: 0.4 + i * 0.07, opacity: 0.8, thin: i % 2 === 1 });
          tone(500, 1400, 0.5, 'sine', 0.12); bump(0.25);
        }
        break;
      }
      case 'pool': fx.puff(w.tx, 0.3, w.tz, 20, c, 6, 0.5 * K, 0.7, -8, 4); fx.ring(w.tx, w.tz, { r0: 0.5, r1: w.size, color: c, life: 0.4 }); tone(260, 140, 0.4, 'sawtooth', 0.12); break;
      case 'chain': {
        let px = u.x, py = my, pz = u.z;
        (e.chain || []).forEach((t, i) => { const ty = t.h * 0.55; fx.bolt(px, py, pz, t.x, ty, t.z, { color: i % 2 ? 0xffffff : c, w: 0.22 * K, life: 0.3, jag: 1.0 * K }); fx.bolt(px, py, pz, t.x, ty, t.z, { color: g, w: 0.1 * K, life: 0.3, jag: 0.6 * K }); fx.flash(t.x, ty, t.z, { r: t.h * 0.7, color: 0xfff6b0, life: 0.25 }); fx.burst(t.x, ty, t.z, 8, c, 7, 0.3 * K, 0.4); px = t.x; py = ty; pz = t.z; });
        tone(2400, 500, 0.3, 'square', 0.14); bump(0.25);
        break;
      }
      case 'strike': {
        const t = e.to; if (!t) break;
        if (M.blink) { fx.burst(e.from.x, my, e.from.z, 16, c, 5, 0.4 * K, 0.6); fx.flash(e.from.x, my, e.from.z, { r: u.h * 0.8, color: 0x3a2a60, life: 0.3 }); fx.burst(u.x, my, u.z, 16, g, 5, 0.4 * K, 0.5); if (v) { v.pop = 0.2; v.yaw = u.yaw; } fx.slash(t.x, t.h * 0.5, t.z, u.yaw, { size: t.h * 1.3 + 1, color: g, life: 0.28 }); fx.slash(t.x, t.h * 0.5, t.z, u.yaw + 1.2, { size: t.h * 1.1 + 1, color: c, life: 0.32 }); tone(700, 120, 0.4, 'sine', 0.16); }
        else { fx.beam(e.from.x, my, e.from.z, u.x, my, u.z, { w: u.r * 1.4, life: 0.22, color: c, core: 0xffffff, grow: 0.03 }); fx.puff(e.from.x, 0.2, e.from.z, 10, 0xf5efe0, 5, 0.4, 0.5); fx.star(t.x, t.h * 0.7, t.z, { size: t.h * 1.6 + 1.5, color: 0xffffff, life: 0.35 }); fx.ring(t.x, t.z, { r0: t.r, r1: t.r + 4 * K, color: c, life: 0.35 }); for (let i = 0; i < 12; i++) fx.spark(t.x, t.h * 0.5, t.z, (vr() - 0.5) * 5, 8 + vr() * 8, (vr() - 0.5) * 5, g, 0.35 * K, 0.5, -14, true); if (v) v.yaw = u.yaw; tone(140, 600, 0.25, 'square', 0.2); }
        bump(0.4);
        break;
      }
      case 'throw':                                             // each one caught: a line from the user's mind to it, and a ring that holds it up
        for (const t of e.hits) {
          fx.beam(u.x, u.h * 0.9, u.z, t.x, t.h * 0.6, t.z, { w: 0.22 * K, life: 0.3, color: c, core: 0xffffff, grow: 0.05 });
          fx.ring(t.x, t.z, { r0: t.r * 2.2, r1: t.r * 0.7, color: c, life: 0.35, opacity: 1 });
          const h = fx.hold('thin', { color: g, opacity: 0.9, lit: true }, (tt, dt, m) => { const s = (t.r + 0.5) * (1 + 0.08 * Math.sin(tt * 18)); m.position.set(t.x, 0.05, t.z); m.scale.set(s, 1, s); m.rotation.y = tt * 3; });
          holdFor(h, M.lift);
          if (t.v) t.v.lift = M.lift;
        }
        tone(600, 1500, M.lift, 'sine', 0.12);
        break;
      case 'rush': fx.puff(u.x, 0.2, u.z, 12, 0xf5efe0, 6, 0.5, 0.5); fx.ring(u.x, u.z, { r0: u.r, r1: u.r + 3 * K, color: 0xffffff, life: 0.3 }); tone(200, 500, 0.3, 'sawtooth', 0.14); break;
      default: break;
    }
  }
  // things the sim keeps moving: shots, rolling waves, pools. Each gets a drawing the first time it is seen.
  const shotViews = new Map(), waveViews = new Map(), poolViews = new Map();
  function drawFlying(dt) {
    for (const s of sim.shots) {
      let w = shotViews.get(s);
      if (!w) {
        const lob = s.type === 'rock' || s.type === 'ground', solid = lob || s.type === 'grass' || s.type === 'bug' || s.type === 'poison' || s.type === 'ice';
        const size = (0.34 + s.u.h * 0.1) * K;
        w = { h: fx.hold(lob ? 'rock' : s.type === 'ice' || s.type === 'grass' || s.type === 'bug' ? 'shard' : 'sph', { color: solid ? hexOf(s.type) : glowOf(s.type), opacity: 1, lit: !solid, solid }, () => {}), d0: Math.hypot(s.t.x - s.sx, s.t.z - s.sz) || 1, y0: s.u.h * 0.6, lob, size, solid };
        shotViews.set(s, w);
      }
      const f = clamp(1 - Math.hypot(s.t.x - s.x, s.t.z - s.z) / w.d0, 0, 1), y = w.y0 + (s.t.h * 0.5 - w.y0) * f + (w.lob ? Math.sin(f * Math.PI) * (2 + w.d0 * 0.18) : 0), m = w.h.mesh;
      m.position.set(s.x, y, s.z); m.rotation.set(T * 9, T * 7, 0); m.scale.setScalar(w.size * (w.solid ? 1 : 1 + 0.2 * Math.sin(T * 40)));
      if (vr() < 0.7) fx.spark(s.x, y, s.z, (vr() - 0.5) * 1.5, (vr() - 0.5) * 1.5, (vr() - 0.5) * 1.5, vr() < 0.5 ? hexOf(s.type) : glowOf(s.type), w.size * 0.7, 0.25, 0, !w.solid || s.type === 'ice');
    }
    for (const W of sim.waves) {
      let w = waveViews.get(W);
      if (!w) { const g = new THREE.Group(); put(GEO.cyl, glass(0x4aa8ee, 0.8), 0, 0, 0, 2.2 * K, W.width, 1.9 * K, 0, g).rotation.z = Math.PI / 2; put(GEO.box, bas(0xffffff), 0, 0.9 * K, 0, W.width, 0.22 * K, 0.5 * K, 0, g); g.rotation.y = Math.atan2(W.dx, W.dz); scene.add(g); w = { g }; waveViews.set(W, w); tone(380, 130, 0.9, 'sine', 0.16); }
      const x = W.x + W.dx * W.p, z = W.z + W.dz * W.p, fade = clamp((W.reach - W.p) / (2 * K), 0, 1);
      w.g.position.set(x, 0, z); w.g.scale.set(1, (0.5 + 0.5 * clamp(W.p / (2 * K), 0, 1)) * fade + 0.01, 1);
      for (let i = 0; i < 2; i++) { const o = (vr() - 0.5) * W.width; fx.spark(x + W.dz * o, 0.9 * K, z - W.dx * o, W.dx * 3 + (vr() - 0.5) * 2, 2 + vr() * 3, W.dz * 3 + (vr() - 0.5) * 2, vr() < 0.6 ? 0xffffff : 0x9fd4ff, 0.3 * K, 0.5, -9); }
    }
    for (const [W, w] of waveViews) if (!sim.waves.includes(W)) { w.g.removeFromParent(); waveViews.delete(W); }
    for (const P of sim.pools) {
      let w = poolViews.get(P);
      if (!w) { const c = hexOf(P.type); w = { a: fx.hold('disc', { color: c, opacity: 0.5 }, (t, dt, m) => { const r = P.r * Math.min(1, t * 4); m.position.set(P.x, 0.03, P.z); m.scale.set(r, 1, r); m.material.opacity = 0.42 + 0.1 * Math.sin(t * 6); }), b: fx.hold('thin', { color: glowOf(P.type), opacity: 0.8, lit: true }, (t, dt, m) => { const r = P.r * Math.min(1, t * 4) * (1 + 0.03 * Math.sin(t * 9)); m.position.set(P.x, 0.04, P.z); m.scale.set(r, 1, r); }) }; poolViews.set(P, w); }
      if (vr() < 0.5) { const a = vr() * 6.283, d = Math.sqrt(vr()) * P.r; fx.spark(P.x + Math.cos(a) * d, 0.1, P.z + Math.sin(a) * d, 0, 1.5 + vr() * 2, 0, vr() < 0.5 ? hexOf(P.type) : glowOf(P.type), (0.25 + vr() * 0.3) * K, 0.6, 0, vr() < 0.4); }
    }
    for (const [P, w] of poolViews) if (!sim.pools.includes(P)) { w.a.release(0.4); w.b.release(0.4); poolViews.delete(P); }
  }

  // ---- knocked out: the body leaves the fight in style
  function launch(e, ring) {
    const u = e.t, v = u.v; if (!v) return;
    forget(v);
    const sp = ring ? Math.hypot(u.kx, u.kz) : clamp(e.dist * 3.4, 7 * K, 26 * K), dx = ring && sp > 0.5 ? u.kx / sp : e.dx, dz = ring && sp > 0.5 ? u.kz / sp : e.dz;
    const big = u.h > sim.hRef * 1.3;
    dying.push({ u, v, x: u.x, y: v.y, z: u.z, vx: dx * Math.max(sp, ring ? 3 : 0), vz: dz * Math.max(sp, ring ? 3 : 0), vy: ring ? 3 + sp * 0.12 : (7 + e.dist * 0.5) * (big ? 0.8 : 1), spin: (vr() < 0.5 ? -1 : 1) * (6 + vr() * 6), rx: 0, t: 0, ring, bounced: false, scale: 1 });
    v.actor.play('faint', { hold: true, speed: 2.2 });
    if (ring) { tone(1300, 220, 0.6, 'sine', 0.12); fx.ring(u.x, u.z, { r0: u.r, r1: u.r + 3.5 * K, color: 0xffffff, life: 0.35 }); }
    else { fx.star(u.x, u.h * 0.7, u.z, { size: u.h * 0.8 + 1.1 * K, color: 0xfff2b0, life: 0.3, opacity: 0.9 }); fx.ring(u.x, u.z, { r0: u.r, r1: u.r + 3 * K, color: teams[u.team].hex, life: 0.4 }); fx.burst(u.x, u.h * 0.6, u.z, big ? 22 : 12, 0xffffff, 8, 0.4 * K, 0.6); tone(big ? 200 : 300, 60, big ? 0.45 : 0.3, 'triangle', big ? 0.2 : 0.12); }
    cry(u.spec, big ? 0.12 : 0.07); bump(big ? 0.35 : 0.15);
    if (hud) pipFlash(u.team);
    lastKo.set(u.x, u.h * 0.5, u.z);
  }
  const lastKo = new THREE.Vector3();
  function drawDying(dt) {
    for (let i = dying.length - 1; i >= 0; i--) {
      const d = dying[i], u = d.u, root = d.v.actor.root;
      d.t += dt; d.vy -= 30 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; d.rx += d.spin * dt;
      const gy = groundY(d.x, d.z);
      if (d.y < gy && d.vy < 0) {
        if (gy === 0 && !d.bounced) { d.bounced = true; d.y = 0; d.vy = -d.vy * 0.42; d.vx *= 0.7; d.vz *= 0.7; fx.puff(d.x, 0.2, d.z, 6, 0xf5efe0, 4, 0.4, 0.4); tone(120, 60, 0.12, 'triangle', 0.08); }
        else {                                                 // gone: stars on the floor, a splash far below
          if (gy === 0) { fx.star(d.x, u.h * 0.5, d.z, { size: u.h * 0.45 + 0.7 * K, color: 0xffd23f, five: true, life: 0.5, spin: 3, lit: false }); fx.burst(d.x, u.h * 0.4, d.z, 12, 0xfff2b0, 6, 0.35 * K, 0.6); }
          else { fx.puff(d.x, -DROP + 0.3, d.z, 14, arena.detail, 6, 0.6 * K, 0.9, -12, 9); fx.ring(d.x, d.z, { r0: 0.5, r1: 4 * K, color: 0xffffff, y: -DROP + 0.1, life: 0.6, lit: false, opacity: 0.6 }); tone(160, 70, 0.3, 'sine', 0.1); }
          freeActor(d.v.actor); dying.splice(i, 1); continue;
        }
      }
      d.scale = Math.max(0.35, 1 - d.t * 0.35);
      root.position.set(d.x, d.y + u.h * 0.3, d.z); root.rotation.set(d.rx, d.v.yaw, d.rx * 0.3); root.scale.setScalar(u.h * d.scale);
      d.v.actor.flash(Math.max(0, 0.55 - d.t * 2.5)); d.v.actor.update(dt);
      if (i === dying.length - 1) lastKo.set(d.x, d.y, d.z);    // (the camera follows the last one out)
      if (vr() < 0.5) fx.spark(d.x, d.y + u.h * 0.3, d.z, 0, 0, 0, 0xffffff, 0.3 * K, 0.3, 0, true);
    }
  }

  // ---- what the sim said happened this step
  function onEvent(e) {
    switch (e.e) {
      case 'atk': {
        const u = e.u, t = e.t, v = ensure(u), c = hexOf(e.type);
        v.actor.play('attack', { dur: clamp(u.st.interval * 0.8, 0.42, 0.85) });
        if (e.ranged) {
          v.kick = 0.16;
          if (e.instant) {
            const y1 = u.h * 0.6, y2 = t.h * 0.5, mx = e.miss ? (vr() - 0.5) * 3 : 0;
            if (e.type === 'electric') fx.bolt(u.x, y1, u.z, t.x + mx, y2, t.z + mx, { color: 0xfff6b0, w: 0.14 * K, jag: 0.7 * K });
            else if (e.type === 'psychic') { fx.beam(u.x, y1, u.z, t.x + mx, y2, t.z + mx, { w: 0.3 * K, life: 0.2, color: c, core: 0xffffff }); fx.ring(t.x + mx, t.z + mx, { r0: t.r * 1.6, r1: t.r * 0.5, color: c, life: 0.25 }); }
            else { fx.flash(t.x + mx, y2, t.z + mx, { r: t.h * 0.6, color: 0x4a3a80, life: 0.3 }); fx.burst(t.x + mx, y2, t.z + mx, 6, c, 3, 0.3 * K, 0.4); }
          }
          hitSound(e.type, isMe(teams[u.team]) ? 0.06 : 0.035, 1.5);
        } else {
          v.lunge = 0.24;
          const d = Math.hypot(t.x - u.x, t.z - u.z) || 1, f = (u.r + 0.2) / d;
          fx.slash(u.x + (t.x - u.x) * f, Math.min(u.h, t.h) * 0.55 + 0.2, u.z + (t.z - u.z) * f, u.yaw, { size: clamp(u.h * 0.75, 0.9, 4), color: glowOf(e.type), life: 0.2 });
        }
        break;
      }
      case 'hit': {
        const t = e.t, v = t.v; if (!v) break;
        const c = hexOf(e.type), share = e.dmg / t.st.maxHp, big = e.heavy || e.special, y = t.h * 0.55;
        v.flash = big ? 0.22 : 0.14; v.flashCol = 0xffffff; v.squash = big ? 0.3 : 0.16;
        fx.star(t.x + (vr() - 0.5) * t.r, y + (vr() - 0.5) * t.h * 0.3, t.z + (vr() - 0.5) * t.r, { size: (clamp(0.45 + share * 4, 0.45, 1.1) + (big ? 0.45 : 0)) * K + t.r * 0.35, color: e.eff > 1 ? 0xffffff : glowOf(e.type), life: big ? 0.26 : 0.16, opacity: 0.85 });
        fx.burst(t.x, y, t.z, big ? 12 : e.eff > 1 ? 8 : 4, c, big ? 9 : 5, (big ? 0.4 : 0.28) * K, 0.4, e.type !== 'rock' && e.type !== 'ground' && e.type !== 'grass');
        if (e.eff > 1) { fx.ring(t.x, t.z, { r0: t.r, r1: t.r + 2.2 * K, color: c, life: 0.3 }); fx.chevrons(t.x, t.h + 1.0, t.z, { color: 0xff5a4a, size: 0.42 + t.h * 0.08, n: 2, life: 0.55 }); }
        else if (e.eff < 1 && e.dmg > 0) fx.chevrons(t.x, t.h + 1.4, t.z, { color: 0x9a96b0, size: 0.36 + t.h * 0.06, n: 1, life: 0.5, down: true });
        hitSound(e.type, (big ? 0.16 : 0.07) * (e.eff > 1 ? 1.3 : 1), e.eff > 1 ? 1.25 : e.eff < 1 ? 0.7 : 1);
        if (e.heavy) bump(0.22);
        break;
      }
      case 'ko': launch(e, false); break;
      case 'ring': launch(e, true); break;
      case 'wind': telegraph(e.u, e.w); break;
      case 'fire': fireFx(e); break;
      case 'break': { const u = e.u, v = u.v; if (v) { dropTele(v); v.squash = 0.35; v.actor.play('hurt'); } for (let i = 0; i < 8; i++) { const a = vr() * 6.283; fx.shard(u.x, u.h * 0.7, u.z, Math.cos(a) * 5, 4 + vr() * 5, Math.sin(a) * 5, { size: 0.35 * K, color: hexOf(e.move), life: 0.6 }); } fx.ring(u.x, u.z, { r0: u.r * 2, r1: u.r * 0.4, color: 0xffffff, life: 0.25 }); tone(900, 180, 0.22, 'square', 0.12); break; }
      case 'sting': { const t = e.t; fx.slash(t.x, t.h * (0.3 + 0.12 * e.i), t.z, e.u.yaw + e.i * 1.3, { size: clamp(t.h * 0.6, 0.8, 3), color: 0xe8ff9a, life: 0.14 }); if (e.u.v) e.u.v.lunge = 0.14; break; }
      case 'thrown': for (const t of e.hits) { if (t.v) t.v.lift = 0; fx.flash(t.x, t.h * 0.5, t.z, { r: t.h * 0.8, color: 0xffc2dc, life: 0.3 }); } tone(1500, 300, 0.3, 'sine', 0.16); bump(0.3); break;
      case 'rushend': fx.puff(e.u.x, 0.2, e.u.z, 8, 0xf5efe0, 5, 0.4, 0.4); break;
      case 'shotend': { const w = shotViews.get(e.s); if (w) { w.h.release(0.05); shotViews.delete(e.s); } break; }
      case 'rally': {
        const u = e.u, v = ensure(u), mine = isMe(teams[u.team]);
        fx.ring(u.x, u.z, { r0: u.r * 0.5, r1: u.r + 3 * K, color: 0xffe169, life: 0.45, opacity: 1 }); fx.chevrons(u.x, u.h + 0.5, u.z, { color: 0xffe169, size: 0.5 + u.h * 0.12, n: 3 });
        for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; fx.spark(u.x + Math.cos(a) * u.r * 1.3, 0.1, u.z + Math.sin(a) * u.r * 1.3, 0, 5 + vr() * 5, 0, 0xffe169, 0.3 * K, 0.6, 0, true); }
        v.squash = -0.35; v.flash = 0.3; v.flashCol = 0xffd23f;
        tone(784, 784, 0.1, 'triangle', mine ? 0.2 : 0.07); tone(1175, 1568, 0.22, 'triangle', mine ? 0.2 : 0.07, 0.08); if (mine) cry(u.spec, 0.14);
        break;
      }
      case 'ram': {
        const b = e.b, u = e.u, d = Math.hypot(u.x - b.x, u.z - b.z) || 1, x = b.x + (u.x - b.x) / d * b.R, z = b.z + (u.z - b.z) / d * b.R, mine = !b.cpu;
        fx.star(x, Math.min(b.R, u.h * 0.6), z, { size: clamp(1.2 + e.dist * 0.5, 1.2, 4.5) * K, color: 0xffffff, life: 0.28 }); fx.puff(x, 0.3, z, 7, 0xf5efe0, 5, 0.4, 0.4); fx.ring(x, z, { r0: 0.4, r1: 1.5 + e.dist * 0.6, color: teams[b.team].hex, life: 0.3 });
        if (u.v) { u.v.flash = 0.2; u.v.flashCol = 0xffffff; u.v.squash = 0.3; }
        tone(210, 90, 0.14, 'square', mine ? 0.18 : 0.06); if (mine) bump(0.2 + Math.min(0.25, e.dist * 0.05));
        break;
      }
      case 'clash': { const a = e.a, b = e.b, x = (a.x + b.x) / 2, z = (a.z + b.z) / 2; if (e.speed < 3) break; fx.puff(x, Math.min(a.R, b.R), z, 10, 0xffffff, 6, 0.35, 0.4); fx.star(x, Math.min(a.R, b.R), z, { size: 2.5 * K, color: 0xffffff, life: 0.3 }); tone(170, 70, 0.22, 'sawtooth', 0.18); bump(0.25); if (e.loser) tone(900, 300, 0.3, 'triangle', 0.14); break; }
      case 'dash': { const b = e.b; if (!b.cpu) tone(300, 700, 0.14, 'sine', 0.14); fx.puff(b.x, 0.3, b.z, 8, 0xf5efe0, 4, 0.4, 0.5); break; }
      case 'scoop': {
        const b = e.b, u = e.u, w = ballViews[b.team]; stick(w, u);
        const f = 520 * 1.09 ** Math.min(b.combo, 12);
        tone(f, f * 1.5, 0.12, 'triangle', b.cpu ? 0.08 : 0.2); if (!b.cpu) cry(u.spec, 0.12);
        fx.puff(u.x, u.h * 0.5, u.z, 8, teams[b.team].hex, 5, 0.3, 0.5, -8, 3); fx.ring(u.x, u.z, { r0: u.r * 2, r1: 0.2, color: teams[b.team].hex, life: 0.25 });
        if (hud) pipFlash(u.team);
        break;
      }
      case 'free': { unstick(ballViews[e.b.team], e.u); fx.burst(e.u.x, e.u.h * 0.5, e.u.z, 8, teams[e.u.team].hex, 5, 0.3 * K, 0.5); fx.chevrons(e.u.x, e.u.h + 0.5, e.u.z, { color: teams[e.u.team].hex, n: 2, size: 0.4 }); tone(600, 1200, 0.15, 'triangle', 0.1); break; }
      case 'ballout': {
        const b = e.b, w = ballViews[b.team]; w.fallen = true; w.vy = 2; w.y = b.R; w.fx = b.x; w.fz = b.z;
        tone(1100, 140, 0.9, 'sine', 0.2); fx.ring(b.x, b.z, { r0: b.R, r1: b.R + 4 * K, color: teams[b.team].hex, life: 0.5, opacity: 1 }); bump(0.4);
        if (hud) hud.panels[b.team].root.classList.add('ar-noball');
        break;
      }
      case 'reinforce': { const v = ensure(e.u); v.fall = 0; v.delay = 0; v.fallDur = TUNE.DROP_TIME; v.pop = 1; break; }
      case 'teamout': dimBall(ballViews[e.team], e.out); break;
      case 'hazwarn': hazView.warn(e.q); break;
      case 'hazfire': hazView.fire(e.q); break;
      case 'bumper': if (hazView.bumper) hazView.bumper(e.q); break;
      case 'ramp': if (hud) { hud.clock.classList.add('ar-hot'); } tone(220, 220, 0.5, 'sawtooth', 0.12); tone(330, 330, 0.5, 'sawtooth', 0.12, 0.25); tone(440, 660, 0.8, 'sawtooth', 0.14, 0.5); break;
      default: break;
    }
  }

  // ---- the merge showcase. Each team has a spot in front of its corner where, one after another, three of a kind
  // spin together and become one; the result hops back to a line-up by the corner. When the armies drop in, the
  // ones in the line-up walk on as themselves: they are the same monsters that are about to fight.
  const show = [];                                              // per team: { team, x, z, fuses, lined, ... }
  let mergeLen = 0;
  const sameKind = (a, b) => (a.base || a).dex === (b.base || b).dex && a.height === b.height && (a.stars || 0) === (b.stars || 0);
  plans.forEach((p, k) => {
    if (!p.merges.length) return;
    const finals = p.merges.filter((m) => !p.merges.some((o) => o.fromKey === m.toKey)).sort((a, b) => power(b.to) - power(a.to) || a.to.dex - b.to.dex);
    const fuses = [];
    for (const m of finals) {
      const stages = [m]; let prev = p.merges.find((o) => o.toKey === m.fromKey);
      while (prev) { stages.unshift(prev); prev = p.merges.find((o) => o.toKey === stages[0].fromKey); }       // (the line, earliest stage first)
      const take = stages.slice(-Math.min(stages.length, SHOW_FUSES - fuses.length));
      take.forEach((st, i) => fuses.push({ m: st, cont: i > 0, last: i === take.length - 1 }));
      if (fuses.length >= SHOW_FUSES) break;
    }
    const [cx, cz] = CORNERS[k % 4], n = fuses.filter((f) => f.last).length;
    show.push({ team: k, x: cx * L * 0.19, z: cz * L * 0.19, cx, cz, fuses, n, idx: -1, parts: [], result: null, lined: [], flashed: false, face: Math.atan2(-cx, -cz) });
    mergeLen = Math.max(mergeLen, MERGE_START + fuses.length * FUSE + MERGE_HOLD);
  });
  const showH = (spec) => clamp(sim.hOf(spec) * 1.7, L * 0.085, L * 0.17);
  const lineSpot = (c, j) => { const tx = -c.cz * Math.SQRT1_2, tz = c.cx * Math.SQRT1_2, off = (j - (c.n - 1) / 2) * L * 0.105; return [c.cx * L * 0.345 + tx * off, c.cz * L * 0.345 + tz * off]; };
  const newActor = (spec, k) => { const a = buildActor(spec, k); a.root.scale.setScalar(0.0001); a.root.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(a.root); return a; };
  function showcase(dt) {
    for (const c of show) {
      const t = pt - MERGE_START - c.team * 0.06, tm = teams[c.team];
      for (const q of c.lined) {                                // the ones already made: hop to their place, then wait there
        q.t += dt; const g = clamp(q.t / 0.4, 0, 1), e = smooth(g), root = q.actor.root;
        root.position.set(q.x0 + (q.x - q.x0) * e, Math.sin(g * Math.PI) * q.h * 0.9 + (g >= 1 ? Math.abs(Math.sin((q.t - 0.4) * 6)) * q.h * 0.06 : 0), q.z0 + (q.z - q.z0) * e);
        root.rotation.y = c.face; root.scale.setScalar(q.h * (1 + (q.h0 / q.h - 1) * (1 - e)));
        if (g >= 1 && !q.landed) { q.landed = true; fx.puff(q.x, 0.15, q.z, 6, 0xf5efe0, 3, 0.35, 0.4); tone(180, 80, 0.1, 'triangle', 0.08); }
        q.actor.update(dt);
      }
      if (t < 0 || c.idx >= c.fuses.length) continue;
      if (t >= c.fuses.length * FUSE) { if (c.result) lineUp(c, c.fuses[c.fuses.length - 1].m.to); c.idx = c.fuses.length; continue; }
      const fi = Math.min(c.fuses.length - 1, Math.floor(t / FUSE)), f = c.fuses[fi], st = f.m, k = clamp((t - fi * FUSE) / FUSE, 0, 1);
      if (fi !== c.idx) {                                       // the next three (when a line carries on, the one just made is the first of them)
        c.idx = fi; c.flashed = false;
        if (c.result && !f.cont) lineUp(c, c.fuses[fi - 1].m.to);
        for (const a of c.parts) freeActor(a.actor);
        c.parts = [];
        for (let i = 0; i < 3; i++) { const keep = i === 0 && f.cont && c.result; c.parts.push({ actor: keep ? c.result : newActor(st.from, c.team), a: i * 2.094 + fi * 0.7 + c.team, kept: !!keep }); }
        c.result = null;
        tone(330 + fi * 110, 520 + fi * 110, FUSE * 0.5, 'triangle', 0.06);
      }
      const h = showH(st.from), R = h * 0.8 + 0.9;
      if (k < GATHER) {                                         // gather: pop in on a ring, then round and round, faster and tighter
        const g = k / GATHER, r = R * (1 - g * g * g * 0.94), spin = g * g * 8.5;
        c.parts.forEach((p) => {
          const a = p.a + spin, root = p.actor.root, popK = p.kept ? 1 : clamp(g * 4.5, 0, 1);
          root.position.set(c.x + Math.cos(a) * r, h * 0.35 * g * g + Math.abs(Math.sin(g * 14 + p.a)) * h * 0.08 * (1 - g), c.z + Math.sin(a) * r);
          root.rotation.y = -a + Math.PI + g * 3; root.scale.setScalar(h * backOut(popK) * (1 - g * g * g * 0.4)); p.actor.update(dt); p.actor.flash(g * g * 0.8, 0xffffff);
          if (vr() < 0.35 + g * 0.6) fx.spark(root.position.x, root.position.y + h * 0.5, root.position.z, 0, 0.6, 0, vr() < 0.6 ? tm.hex : 0xffffff, (0.25 + g * 0.2) * K, 0.4, 0, true);
        });
        if (g > 0.25) fx.spark(c.x + (vr() - 0.5) * R, 0.1, c.z + (vr() - 0.5) * R, 0, 4 + g * 6, 0, 0xffffff, 0.22 * K, 0.35, 0, true);
      } else {
        const hh = showH(st.to);
        if (!c.flashed) {                                       // they meet: a flash, and one stands where three were
          c.flashed = true;
          for (const p of c.parts) freeActor(p.actor);
          c.parts = [];
          fx.flash(c.x, hh * 0.55, c.z, { r: hh * 0.75 + 0.5, color: 0xffffff, life: 0.22, opacity: 0.85 });
          fx.ring(c.x, c.z, { r0: 0.4, r1: hh * 1.5 + 2.2, color: tm.hex, life: 0.5, opacity: 1 }); fx.ring(c.x, c.z, { r0: 0.2, r1: hh * 1.1 + 1.4, color: 0xffffff, life: 0.32, thin: true });
          fx.burst(c.x, hh * 0.6, c.z, 22, 0xffffff, 8, 0.36 * K, 0.6); fx.burst(c.x, hh * 0.6, c.z, 14, tm.hex, 6.5, 0.42 * K, 0.75);
          for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; fx.spark(c.x + Math.cos(a) * hh * 0.5, 0.2, c.z + Math.sin(a) * hh * 0.5, Math.cos(a) * 2, 7 + vr() * 4, Math.sin(a) * 2, 0xffe169, 0.3 * K, 0.7, -9, true); }
          if (st.stars) for (let i = 0; i < st.stars; i++) fx.star(c.x + (i - (st.stars - 1) / 2) * hh * 0.42, hh * 1.25 + 0.7, c.z, { size: hh * 0.24 + 0.45, color: 0xffd23f, five: true, life: FUSE * (1 - GATHER) + 0.25, spin: 0.5, lit: false });
          c.result = newActor(st.to, c.team); c.result.play('entrance', { dur: 0.8 });
          const fq = 523 * 1.19 ** fi; tone(fq, fq, 0.1, 'triangle', 0.16); tone(fq * 1.26, fq * 1.26, 0.1, 'triangle', 0.16, 0.08); tone(fq * 1.5, fq * 2, 0.3, 'triangle', 0.18, 0.16);
          cry(st.to, 0.08); bump(0.1);
          if (hud) replay(hud.panels[c.team].root, 'ar-bump');
        }
        const g = (k - GATHER) / (1 - GATHER), root = c.result.root;
        root.position.set(c.x, Math.abs(Math.sin(Math.min(1, g * 1.5) * Math.PI)) * hh * 0.3, c.z); root.rotation.y = c.face + (1 - smooth(Math.min(1, g * 1.6))) * 6.283; root.scale.setScalar(hh * backOut(clamp(g * 2.6, 0, 1))); c.result.update(dt);
      }
    }
  }
  function lineUp(c, spec) {                                    // the one just made takes its place by the corner
    if (!c.result) return;
    const [x, z] = lineSpot(c, c.lined.length);
    c.lined.push({ actor: c.result, spec, x0: c.x, z0: c.z, x, z, t: 0, h0: showH(spec), h: sim.hOf(spec), landed: false });
    c.result = null;
  }
  const leaving = [];                                           // made in the showcase but not on the floor at the start: up and away
  function endShowcase(adoptThem) {
    for (const c of show) {
      for (const p of c.parts) freeActor(p.actor);
      c.parts = [];
      if (c.result) lineUp(c, c.fuses[Math.max(0, Math.min(c.idx, c.fuses.length - 1))].m.to);
      for (const q of c.lined) {
        const u = adoptThem && sim.field.find((o) => o.team === c.team && !o.v && sameKind(o.spec, q.spec));
        if (u) { const v = ensure(u, q.actor), p = q.actor.root.position; v.pop = 1; v.hop = { x: p.x, z: p.z, t: 0, dur: 0.5 }; }
        else if (adoptThem) leaving.push({ actor: q.actor, t: 0, h: q.h, x: q.x, z: q.z, team: c.team });
        else freeActor(q.actor);
      }
      c.lined = []; c.idx = c.fuses.length;
    }
  }
  function drawLeaving(dt) {
    for (let i = leaving.length - 1; i >= 0; i--) {
      const q = leaving[i]; q.t += dt; const g = clamp(q.t / 0.35, 0, 1), root = q.actor.root;
      root.position.y = g * g * q.h * 4; root.scale.setScalar(q.h * (1 - g) + 0.0001);
      if (vr() < 0.8) fx.spark(q.x + (vr() - 0.5) * q.h, root.position.y + vr() * q.h, q.z + (vr() - 0.5) * q.h, 0, 6, 0, vr() < 0.5 ? teams[q.team].hex : 0xffffff, 0.3 * K, 0.4, 0, true);
      if (g >= 1) { freeActor(q.actor); leaving.splice(i, 1); }
    }
  }

  // ---- state
  let phase = total ? (mergeLen > 0 ? 'merge' : 'drop') : 'done', pt = 0, countN = -1, finished = !total, cheering = !total, hudT = 0, lowTick = 99;
  const cam = { x: 0, z: 0, f: 0 };                             // where the camera has drifted to: a slide over the floor, and how far in
  const winner = () => sim.winner;

  // ---- HUD (DOM). Everything is cached so nothing is rewritten unless it changed.
  let hud = null;
  if (HAS_DOM) {
    injectStyle();
    const root = el('div', 'ar-root', document.body);
    hud = { root, panels: [] };
    teams.forEach((tm, k) => {
      const p = el('div', `ar-team ar-pill ar-c${k % 4}${isMe(tm) ? ' ar-me' : ''}`, root), plan = plans[k];
      el('div', 'ar-tname', p, `<i class="ar-dot" style="background:${tm.css}"></i>${teamLabel(tm)}<span class="ar-out">OUT</span><span class="ar-ballx" title="ball lost"></span>`);
      const fill = el('i', '', el('div', 'ar-hp', p)); fill.style.background = tm.css;
      const pips = el('div', 'ar-pips', p), list = [];
      for (let i = 0; i < sim.recs[k].length; i++) { const d = el('i', 'ar-pip', pips); d.style.background = tm.css; list.push({ e: d, s: '' }); }
      if (plan.bench > 0) el('span', 'ar-bench', pips, `+${plan.bench}`).title = `${plan.bench} more back them from the bench: +${Math.round((plan.backing - 1) * 100)}% health and damage`;
      const tally = el('div', 'ar-tally', p, plan.before > plan.after ? `<b>${plan.before}</b><span class="ar-tri"><i></i><i></i><i></i></span><b class="ar-to">${plan.after}</b>` : `<b>${plan.before}</b>`);
      hud.panels.push({ root: p, fill, pips: list, tally, n: tally.firstChild, w: -1, bench: plan.bench });
      if (!sim.recs[k].length) p.classList.add('ar-isout');
    });
    const top = el('div', 'ar-top', root);
    hud.clock = el('div', 'ar-pill ar-clock', top);
    el('div', 'ar-pill ar-name', top, `${arena.name} ${arena.types.map(chip).join('')}`);
    hud.big = el('div', 'ar-big', root); hud.sub = el('div', 'ar-pill ar-sub', root);
    hud.skip = el('div', 'ar-pill ar-skip', root, 'Hold Enter to skip<i></i>'); if (noSkip) hud.skip.style.display = 'none';
    hud.skipFill = hud.skip.lastChild;
    if (myTeam >= 0) hud.keys = el('div', 'ar-pill ar-keys', root, '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> roll <span></span> <kbd>Shift</kbd> dash');      // gone after the first dash
    if (phase !== 'merge') root.classList.add('ar-fighting');
  }
  function big(text, anim, small) { if (!hud) return; hud.big.textContent = text; hud.big.classList.toggle('ar-small', !!small); hud.big.classList.remove('ar-punch', 'ar-stay'); replay(hud.big, anim); }
  function pipFlash(k) { if (hud) replay(hud.panels[k].root, 'ar-bump'); }
  function drawHud() {
    if (!hud) return;
    const t = sim.time, left = Math.max(0, Math.ceil(TUNE.RAMP_AT - t)), hot = sim.ramp > 1;
    setText(hud.clock, hot ? '×' + sim.ramp.toFixed(1) : Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'));
    if (hud.keys && !hud.keysGone && (sim.balls[myTeam].dashCd > 0 || sim.balls[myTeam].gone || t > 14)) { hud.keysGone = true; hud.keys.classList.add('ar-gone'); }
    const low = phase === 'fight' && !hot && left <= 5;
    if (hud.low !== low) { hud.low = low; hud.clock.classList.toggle('ar-low', low); }
    if (low && left !== lowTick) { lowTick = left; tone(1000, 1000, 0.05, 'square', 0.1); }
    const st = sim.tally();
    for (let k = 0; k < NT; k++) {
      const p = hud.panels[k], w = Math.round((sim.maxHpAll[k] ? st[k].hp / sim.maxHpAll[k] : 0) * 100), recs = sim.recs[k];
      if (p.w !== w) { p.w = w; p.fill.style.width = w + '%'; }
      for (let i = 0; i < recs.length; i++) {                    // one pip per fighter: fighting, waiting, scooped or out
        const u = recs[i].unit, s = !u ? 'res' : u.alive ? 'on' : u.scooped ? 'sc' : 'out', q = p.pips[i];
        if (q.s !== s) { q.s = s; q.e.className = 'ar-pip ar-' + s; }
      }
    }
  }

  // ---- fixed camera: fit the whole floor between the HUD bands for this aspect ratio, once
  const FIT = [[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1], [-1, 3, -1], [1, 3, -1]], span = [0, 0, 0];
  function fitCamera() {
    const XLIM = 0.93, YTOP = 0.72, YBOT = -0.86;
    let tz = 0;
    const place = (d) => { camera.position.set(0, Math.sin(CAM_ELEV) * d, tz + Math.cos(CAM_ELEV) * d); camera.lookAt(0, 0, tz); camera.updateMatrixWorld(); };
    const measure = () => { span[0] = 0; span[1] = 9; span[2] = -9; for (const p of FIT) { v3.set(p[0] * (half + 1), p[1], p[2] * (half + 1)).project(camera); span[0] = Math.max(span[0], Math.abs(v3.x)); span[1] = Math.min(span[1], v3.y); span[2] = Math.max(span[2], v3.y); } };
    const search = (ok) => { let lo = 2, hi = L * 12; for (let i = 0; i < 26; i++) { const d = (lo + hi) / 2; place(d); measure(); if (ok()) hi = d; else lo = d; } place(hi); measure(); return hi; };
    for (let pass = 0; pass < 4; pass++) {                      // size it, then slide the look-at point until it is centred in the free band
      const d = search(() => span[0] <= XLIM && span[2] - span[1] <= YTOP - YBOT), mid = (span[1] + span[2]) / 2, err = mid - (YTOP + YBOT) / 2;
      tz += 0.5; place(d); measure(); const der = ((span[1] + span[2]) / 2 - mid) / 0.5; tz -= 0.5;
      if (Math.abs(der) > 1e-6) tz -= err / der;
    }
    search(() => span[0] <= XLIM && span[1] >= YBOT - 0.005 && span[2] <= YTOP + 0.005);
    camBase.copy(camera.position); camLook.set(0, 0, tz); camDir.copy(camLook).sub(camBase); camQ.copy(camera.quaternion);
  }
  function resizeView(aspect) { camera.aspect = aspect > 0 ? aspect : 16 / 9; camera.updateProjectionMatrix(); fitCamera(); }
  resizeView(HAS_DOM && typeof window !== 'undefined' && window.innerHeight ? window.innerWidth / window.innerHeight : 16 / 9);

  // ---- drawing
  function bar(mesh, n, x, y, z, w, hgt, c) { s3.set(w, hgt, 1); m4.compose(v3.set(x, y, z), camQ, s3); mesh.setMatrixAt(n, m4); if (c) mesh.setColorAt(n, c); }
  function view(dt, fdt) {                                      // dt: this frame; fdt: the same, slowed for hit-stop and the finale
    const cheerTeam = cheering ? winner() : -1, fight = phase === 'fight' || phase === 'finish', live = !sim.finished;      // live: the fight is still going (after it, nobody is stunned, tumbling or winding up)
    let n = 0, na = 0, nb = 0, ns = 0, nm = 0;
    for (let i = views.length - 1; i >= 0; i--) {
      const v = views[i], u = v.u, h = u.h, A = v.actor;
      if (!u.alive && !u.scooped && fight) continue;
      // falling in (the opening drop, or a reserve arriving)
      let fallY = 0;
      if (v.fall >= 0) {
        if (v.delay > 0) { v.delay -= dt; A.root.scale.setScalar(0.0001); continue; }
        v.fall += dt; const g = clamp(v.fall / (v.fallDur || DROP_FALL), 0, 1);
        fallY = (1 - g * g) * L * 0.55; v.pop = 1;
        if (g >= 1) { v.fall = -1; v.land = 0; fx.puff(u.x, 0.15, u.z, h > sim.hRef * 1.3 ? 12 : 6, 0xf5efe0, 3 + h, 0.3 + h * 0.08, 0.45); fx.ring(u.x, u.z, { r0: u.r, r1: u.r * 2.4 + 0.6, color: 0xffffff, life: 0.25, opacity: 0.7 }); if (sndBudget >= 1) { sndBudget--; tone(clamp(260 / Math.sqrt(h), 60, 320), 50, 0.12, 'triangle', 0.1); } if (h > sim.hRef * 1.5) bump(0.15); A.play('entrance', { dur: 0.8 }); }
      } else if (v.pop < 1) v.pop = Math.min(1, v.pop + dt / 0.25);
      if (v.land < 1) v.land = Math.min(1, v.land + dt / 0.3);
      v.lunge = Math.max(0, v.lunge - fdt); v.kick = Math.max(0, v.kick - fdt); v.flash = Math.max(0, v.flash - fdt);
      v.squash += (0 - v.squash) * Math.min(1, fdt * 12);
      // where and how it stands
      // a melee swing: a short pull back, then the lunge; a ranged one: a kick backwards
      let lu = 0;
      if (v.lunge > 0) { const q = 1 - v.lunge / 0.24, amp = Math.min(0.95, u.r * 1.3); lu = q < 0.22 ? -Math.sin(q / 0.22 * Math.PI) * amp * 0.28 : Math.sin((q - 0.22) / 0.78 * Math.PI) * amp; }
      else if (v.kick > 0) lu = -Math.sin(v.kick / 0.2 * Math.PI) * 0.3;
      let y = u.air ? h * (0.28 + 0.06 * Math.sin(T * 3 + v.phase)) : u.moving ? Math.abs(Math.sin(T * 10 + v.phase)) * h * 0.09 : 0;
      if (u.lifted > 0 || v.lift > 0) { v.lift = Math.max(0, v.lift - fdt); y += h * 0.9 * Math.sin(clamp(1 - Math.max(u.lifted, 0) / 0.9, 0, 1) * Math.PI * 0.5); if (vr() < 0.5) fx.spark(u.x + (vr() - 0.5) * h, y + vr() * h, u.z + (vr() - 0.5) * h, 0, 2, 0, 0xffc2dc, 0.25 * K, 0.3, 0, true); }
      if (u.team === cheerTeam) y += Math.abs(Math.sin(T * 7 + v.phase)) * Math.min(h * 0.5, 1.4);
      if (u.launched > 0 && live) { v.tumble += fdt * 14; y += Math.abs(Math.sin(v.tumble)) * h * 0.18; } else v.tumble = 0;
      v.y = y + fallY;
      let dy = u.yaw - v.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); v.yaw += dy * Math.min(1, fdt * 14);
      let px = u.x, pz = u.z;
      if (v.hop) { const q = v.hop; q.t += dt; const g = clamp(q.t / q.dur, 0, 1), e = smooth(g); px = q.x + (u.x - q.x) * e; pz = q.z + (u.z - q.z) * e; v.y += Math.sin(g * Math.PI) * h * 0.9; if (g >= 1) { v.hop = null; v.land = 0; fx.puff(u.x, 0.15, u.z, 5, 0xf5efe0, 3, 0.3, 0.4); } }
      A.root.position.set(px + Math.sin(v.yaw) * lu, v.y, pz + Math.cos(v.yaw) * lu);
      // lean: into a run, into a swing, back from a blow; reeling when stunned, head over heels when knocked flying
      const reel = live && u.stun > 0 && !u.frozen, wob = reel ? Math.sin(T * 40) * 0.3 : 0;
      v.lean += ((u.moving ? 0.16 : 0) + (v.lunge > 0 ? 0.3 : 0) - v.squash * 1.1 - v.lean) * Math.min(1, fdt * 14);
      A.root.rotation.set(u.launched > 0 && live ? -0.5 * Math.sin(v.tumble) : v.lean, v.yaw + wob, reel ? Math.sin(T * 31) * 0.18 : 0);
      const breathe = A.rigged || u.moving ? 0 : Math.sin(T * 2.6 + v.phase) * 0.025;      // (the generated critters have no clips: let them breathe)
      const landSq = v.land < 1 ? Math.sin(v.land * Math.PI) * 0.28 * (1 - v.land) * 2 : 0, sq = v.squash + landSq - breathe, grow = (u.wind && live ? 1 + 0.08 * Math.sin(T * 34) * clamp(u.wind.t / u.wind.dur, 0, 1) : 1) * (v.pop < 1 ? backOut(v.pop) : 1) * h;
      A.root.scale.set(grow * (1 + sq * 0.5), Math.max(0.0001, grow * (1 - sq)), grow * (1 + sq * 0.5));
      // glow: winding up in its type's colour, or the flash of being hit
      if (u.wind && live) { const k = clamp(u.wind.t / u.wind.dur, 0, 1), c = hexOf(u.wind.move); A.flash(0.25 + 0.55 * k * (0.7 + 0.3 * Math.sin(T * 30)), c); if (vr() < 0.5 + k * 0.5) { const a = vr() * 6.283, d = h * 1.2 + 0.8; fx.spark(u.x + Math.cos(a) * d, vr() * h * 1.2, u.z + Math.sin(a) * d, -Math.cos(a) * d / 0.3, 0, -Math.sin(a) * d / 0.3, vr() < 0.5 ? c : glowOf(u.wind.move), 0.3 * K, 0.3, 0, true); } }
      else if (v.flash > 0) A.flash(Math.min(1, v.flash * 6), v.flashCol); else if (u.frozen && live) A.flash(0.5, 0x6fd8ff); else A.flash(0);
      if (u.frozen && live && !v.ice) { const s = h * 1.15; v.ice = fx.hold('shard', { color: 0xbff2ff, opacity: 0.55 }, (t, dtt, m) => { m.position.set(u.x, h * 0.55, u.z); m.scale.set(s, s * 1.3, s); m.rotation.y = 0.6; }); }
      else if (!(u.frozen && live) && v.ice) { v.ice.release(0.2); v.ice = null; for (let j = 0; j < 6; j++) { const a = vr() * 6.283; fx.shard(u.x, h * 0.6, u.z, Math.cos(a) * 4, 4 + vr() * 3, Math.sin(a) * 4, { size: 0.3 * K, color: 0xbff2ff, life: 0.5, opacity: 0.8 }); } }
      if (u.rush && vr() < 0.8) fx.spark(u.x - u.rush.dx * u.r, 0.2, u.z - u.rush.dz * u.r, (vr() - 0.5) * 3, 1 + vr() * 2, (vr() - 0.5) * 3, 0xf5efe0, 0.4 * K, 0.4);
      A.update(u.frozen && live ? 0 : fdt);
      if (v.pop <= 0 || fallY > h * 2 || n >= RN) continue;
      // ring, aura, bars
      const s = Math.max(0.55, u.r * 1.4);
      m4.makeScale(s, 1, s).setPosition(u.x, 0.02, u.z); ringMesh.setMatrixAt(n, m4); ringMesh.setColorAt(n, teamCol[u.team]); n++;
      if (u.fav) { const a = s * (1.2 + 0.08 * Math.sin(T * 5 + v.phase)); m4.makeScale(a, 1, a).setPosition(u.x, 0.026, u.z); auraMesh.setMatrixAt(na++, m4); }
      if (!fight || fallY > 0.5) continue;
      // The health bar appears once it has something to say (hurt, or its signature move is nearly ready), so a
      // fresh army is not a wall of bars. Under it, a thin gold line fills as the move charges.
      const bw = clamp(h * 0.8, 1.3 * K, 2.5 * K), bh = 0.2 * K, by = h * 1.08 + y + 0.45 * K, f = clamp(u.hp / u.st.maxHp, 0, 1), ch = u.wind ? 1 : u.charge;
      v.lag = Math.max(f, v.lag - fdt * 0.45);
      const want = f < 0.999 || ch > 0.7 || u.stars > 0 ? 1 : 0; v.bar += (want - v.bar) * Math.min(1, dt * 10);
      if (v.bar > 0.02) {
        const a = v.bar;
        bar(barBg, nb, u.x, by - bh * 0.3, u.z, (bw + 0.12 * K) * a, bh * 1.9, null);
        bar(barLag, nb, u.x - bw * a / 2, by, u.z, Math.max(0.001, bw * v.lag * a), bh, WHITE);
        bar(barFill, nb, u.x - bw * a / 2, by, u.z, Math.max(0.001, bw * f * a), bh, teamCol[u.team]);
        bar(barCharge, nb, u.x - bw * a / 2, by - bh * 0.85, u.z, Math.max(0.001, bw * ch * a), bh * 0.42, ch >= 1 || u.wind ? (Math.sin(T * 24) > 0 ? WHITE : GOLD) : GOLD);
        nb++;
        for (let j = 0; j < u.stars && ns < RN * 3; j++) { const ss = 0.3 * K * a; s3.set(ss, ss, ss); m4.compose(v3.set(u.x + (j - (u.stars - 1) / 2) * ss * 2.2, by + bh * 1.2 + ss * 0.9, u.z), camQ, s3); starMesh.setMatrixAt(ns++, m4); }
      }
      if (u.team === myTeam && nm < TUNE.FIELD_CAP + 4 && u.rallyCd <= 0 && !u.wind && !u.rush && u.stun <= 0 && phase === 'fight' && !sim.balls[myTeam].gone) {      // "roll through me"
        const ms = (0.42 + 0.06 * Math.sin(T * 9 + v.phase)) * K; s3.set(ms, ms, ms); m4.compose(v3.set(u.x, by + bh * 2.2 + ms + u.stars * 0.3 * K + Math.sin(T * 6 + v.phase) * 0.12, u.z), camQ, s3); markMesh.setMatrixAt(nm++, m4);
      }
    }
    ringMesh.count = n; auraMesh.count = na; barBg.count = barLag.count = barFill.count = barCharge.count = nb; starMesh.count = ns; markMesh.count = nm;
    let ng = 0;
    if (guideOn > 0 && phase === 'fight' && myTeam >= 0) {
      const b = sim.balls[myTeam];
      if (b.gone || b.rallies > 0 || sim.time > 25) guideOn = Math.max(0, guideOn - dt * 2);
      if (!guideTo || !guideTo.alive || guideTo.rallyCd > 0 || guideTo.wind) { guideTo = null; let bd = 1e9; for (const u of sim.field) { if (u.team !== myTeam || !u.alive || u.rallyCd > 0 || u.wind || u.drop > 0) continue; const d = Math.hypot(u.x - b.x, u.z - b.z); if (d < bd) { bd = d; guideTo = u; } } }
      if (guideTo && !b.gone) {
        const dx = guideTo.x - b.x, dz = guideTo.z - b.z, d = Math.hypot(dx, dz), a = b.R + 0.4, z = d - guideTo.r - 0.3;
        if (z > a + 0.5) for (let i = 0; i < GUIDE; i++) { const f = ((i + (T * 1.6) % 1) / GUIDE), at = a + (z - a) * f, s = (0.16 + 0.1 * Math.sin(f * Math.PI)) * K * guideOn; m4.makeScale(s, 1, s).setPosition(b.x + dx / d * at, 0.03, b.z + dz / d * at); guideMesh.setMatrixAt(ng++, m4); }
      }
    }
    guideMesh.count = ng; guideMesh.instanceMatrix.needsUpdate = true;
    for (const m of [ringMesh, auraMesh, barBg, barLag, barFill, barCharge, starMesh, markMesh]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    drawDying(fdt); drawLeaving(dt);
    for (let i = timed.length - 1; i >= 0; i--) { timed[i].t -= fdt; if (timed[i].t <= 0) { timed[i].h.release(0.2); timed.splice(i, 1); } }
    if (fight && live) drawFlying(fdt);
    // balls
    for (const w of ballViews) {
      const b = w.b, sp = Math.hypot(b.vx, b.vz), R = b.R, tm = teams[b.team];
      const dropIn = phase === 'merge' ? 0 : phase === 'drop' ? clamp((pt - 0.5 - b.team * 0.12) / 0.9, 0, 1) : 1;
      if (w.fallen) {                                           // over the edge: it keeps its speed and drops out of the world
        w.vy -= 32 * fdt; w.y += w.vy * fdt; w.fx += b.vx * fdt; w.fz += b.vz * fdt;
        w.group.position.set(w.fx, w.y, w.fz); w.roll.scale.setScalar(R);
        if (sp > 0.05) { v3.set(b.vz / sp, 0, -b.vx / sp); w.roll.quaternion.premultiply(q4.setFromAxisAngle(v3, sp * fdt / R)); }
        if (w.y < -DROP && w.group.visible) { w.group.visible = false; fx.puff(w.fx, -DROP + 0.4, w.fz, 22, arena.detail, 8, 0.7 * K, 1, -12, 11); fx.ring(w.fx, w.fz, { r0: 1, r1: 6 * K, color: 0xffffff, y: -DROP + 0.1, life: 0.7, lit: false, opacity: 0.7 }); tone(140, 50, 0.4, 'sine', 0.16); }
        w.ring.visible = false; w.stars.visible = false; if (w.arrow) { w.arrow.visible = false; w.cdBg.visible = w.cdFill.visible = false; }
        if (w.trainer) { const [ox, oz] = Math.abs(w.fx) > Math.abs(w.fz) ? [Math.sign(w.fx), 0] : [0, Math.sign(w.fz)]; w.trainer.rotation.y = Math.atan2(ox, oz) + Math.sin(T * 5) * 0.15; if (poseTrainer) poseTrainer(w.trainer, T, false); }
        continue;
      }
      w.group.visible = dropIn > 0; w.group.position.set(b.x, R + (1 - bounceOut(dropIn)) * L * 0.4, b.z); w.roll.scale.setScalar(R);
      for (let i = 0; i < w.roll.children.length; i++) { const c = w.roll.children[i]; if (c.userData.arH) c.scale.setScalar(Math.min(c.userData.arH, R * 0.9) / R); }
      if (sp > 0.05 && fdt > 0) { v3.set(b.vz / sp, 0, -b.vx / sp); w.roll.quaternion.premultiply(q4.setFromAxisAngle(v3, sp * fdt / R)); }
      w.ring.position.set(b.x, 0.03, b.z); w.ring.scale.setScalar(R * (1.25 + 0.35 * Math.max(0, b.gulp) / TUNE.SCOOP_GULP)); w.ring.visible = dropIn >= 1;
      if (w.trainer) {
        const th = clamp(b.D * 0.7, 1.2, L * 0.09), back = R + th * 0.22;
        w.trainer.visible = dropIn >= 1; w.trainer.scale.setScalar(th); w.trainer.position.set(b.x - Math.sin(b.hd) * back, b.team === cheerTeam ? Math.abs(Math.sin(T * 7)) * 0.8 : 0, b.z - Math.cos(b.hd) * back); w.trainer.rotation.y = b.hd;
        if (poseTrainer) poseTrainer(w.trainer, T, b.moving && b.stun <= 0);
      }
      w.stars.visible = b.stun > 0; if (b.stun > 0) { w.stars.position.set(b.x, R * 2 + 0.7, b.z); w.stars.rotation.y = T * 9; }
      if (sp > 1 && (b.dashT > 0 || sp > sim.topSpeed0 * 1.3)) { w.dust += dt; if (w.dust > 0.03) { w.dust = 0; fx.spark(b.x - b.vx / sp * R, 0.2, b.z - b.vz / sp * R, (vr() - 0.5) * 2, 1 + vr(), (vr() - 0.5) * 2, 0xf5efe0, 0.25 + R * 0.2, 0.45); } }
      if (w.arrow) {
        w.arrow.position.set(b.x, R * 2 + 1.6 + Math.sin(T * 5) * 0.25, b.z); w.arrow.visible = dropIn >= 1;
        const wd = Math.max(1.6, R * 1.8), f = clamp(1 - b.dashCd / TUNE.DASH_CD, 0, 1), on = dropIn >= 1 && f < 1;
        w.cdBg.visible = w.cdFill.visible = on;
        if (on) { w.cdBg.position.set(b.x, 0.04, b.z + R + 0.7); w.cdBg.scale.x = wd + 0.16; w.cdFill.position.set(b.x - wd / 2 + wd * f / 2, 0.06, b.z + R + 0.7); w.cdFill.scale.x = Math.max(0.01, wd * f); }
      }
    }
    hazView.view(dt);
    if (cheering && winner() >= 0 && phase === 'finish') for (let i = 0; i < 3; i++) fx.spark((vr() - 0.5) * L, L * 0.3 + vr() * 4, (vr() - 0.5) * L, (vr() - 0.5) * 3, -2, (vr() - 0.5) * 3, [teams[winner()].hex, 0xffffff, 0xffe169][Math.floor(vr() * 3)], 0.4, 2.2, -5);
    fx.step(fdt);
    // sudden death: the light turns
    const heat = clamp((sim.ramp - 1) / 1.6, 0, 1), pulse = heat > 0 ? 0.5 + 0.5 * Math.sin(T * (3 + heat * 5)) : 0;
    scene.background.copy(sky).lerp(skyHot, heat * (0.55 + 0.2 * pulse)); hemi.intensity = 1.75 - heat * 0.45; sun.color.setHex(0xfff4d6).lerp(col.set(0xff7a4a), heat * 0.8);
    // The camera never turns (steering stays "up is away"), but it closes in: on whatever is still fighting as the
    // floor empties, and hard on the last knockout. Everything alive, and every ball in play, stays in frame.
    shake = Math.max(0, shake - dt * 1.6);
    let gx = 0, gz = 0, gf = 0;
    if (phase === 'finish' && pt < FREEZE) { gx = clamp(lastKo.x, -half * 1.15, half * 1.15); gz = clamp(lastKo.z, -half * 1.15, half * 1.15); gf = 0.46; }
    else if (phase === 'fight' || phase === 'finish') {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      const grow = (x, z, pad) => { x0 = Math.min(x0, x - pad); x1 = Math.max(x1, x + pad); z0 = Math.min(z0, z - pad); z1 = Math.max(z1, z + pad); };
      for (const u of sim.field) if (u.alive) grow(u.x, u.z, u.h + 1.5);
      for (const b of sim.balls) if (!b.gone && (!b.teamOut || b.team === myTeam)) grow(b.x, b.z, b.R + 2);
      if (x1 > x0) {
        const s = Math.max((x1 - x0) / L, (z1 - z0) / L * 1.25) + 0.16;       // (the floor is seen foreshortened: depth costs more screen than width)
        gf = clamp(1 - s, 0, CAM_CLOSE); const pan = clamp(gf / 0.12, 0, 1);
        gx = clamp((x0 + x1) / 2, -half * 0.6, half * 0.6) * pan; gz = clamp((z0 + z1) / 2, -half * 0.6, half * 0.6) * pan;
      }
    }
    const ck = Math.min(1, dt * (phase === 'finish' && pt < FREEZE ? 4 : gf < cam.f ? 2.2 : 0.7));      // quick to pull back, slow to close in
    cam.x += (gx - cam.x) * ck; cam.z += (gz - cam.z) * ck; cam.f += (gf - cam.f) * ck;
    camera.position.copy(camBase); camera.position.x += cam.x; camera.position.z += cam.z; camera.position.addScaledVector(camDir, cam.f);
    camera.position.x += (vr() - 0.5) * shake * 0.7; camera.position.y += (vr() - 0.5) * shake * 0.7;
    hudT -= dt; if (hudT <= 0) { hudT = 0.1; drawHud(); }
  }
  const winText = () => (winner() < 0 ? 'Nobody is left standing' : isMe(teams[winner()]) ? 'You win!' : `${teams[winner()].name} wins!`);
  function celebrate() {
    cheering = true;
    const w = winner();
    if (hud) { big(winText(), 'ar-stay', true); if (sim.timedOut) { hud.sub.textContent = 'Time! Decided on health remaining'; hud.sub.classList.add('ar-on'); } }
    if (w >= 0) { const s = isMe(teams[w]) ? 1 : 0.8; [523, 659, 784, 1047].forEach((f, i) => tone(f * s, f * s, i === 3 ? 0.5 : 0.14, 'square', 0.16, i * 0.13)); for (const v of views) if (v.u.team === w && v.u.alive) v.actor.play('entrance', { dur: 1.4 }); }
  }
  function finishNow() { phase = 'done'; finished = true; }
  // The fight has stopped where the last knockout left it. What was in mid-air or half wound up is let go, so the
  // survivors are not left frozen in a pose with a telegraph under them while the winner is announced.
  function settle() {
    for (const v of views) dropTele(v);
    for (const w of shotViews.values()) w.h.release(0.15); shotViews.clear();
    for (const w of waveViews.values()) w.g.removeFromParent(); waveViews.clear();
    for (const w of poolViews.values()) { w.a.release(0.4); w.b.release(0.4); } poolViews.clear();
    for (const t of timed) t.h.release(0.2); timed.length = 0;
  }
  function beginDrop() {
    phase = 'drop'; pt = 0; endShowcase(true);
    if (hud) hud.root.classList.add('ar-fighting');
    const order = sim.field.slice().sort((a, b) => a.team - b.team || b.value - a.value); let k = -1, i = 0;
    for (const u of order) { if (u.team !== k) { k = u.team; i = 0; } if (u.v) continue; const v = ensure(u); v.fall = 0; v.delay = 0.2 + i++ * 0.08 + u.team * 0.05; v.fallDur = DROP_FALL; }
  }
  function drain() { const ev = sim.events; for (let i = 0; i < ev.length; i++) onEvent(ev[i]); ev.length = 0; }

  if (!total) { if (hud) big(winText(), 'ar-stay', true); }
  else if (phase === 'drop') beginDrop();
  view(0, 0);

  return {
    scene, camera, size: L, arena, sim, plans,
    get finished() { return finished; },
    get phase() { return phase; },
    get units() { return sim.field; },                           // live monsters on the floor (read-only, for debugging and tests)
    get balls() { return sim.balls; },
    step(dt) {
      if (destroyed || finished) return;
      T += dt; pt += dt; sndBudget = Math.min(3, sndBudget + dt * 14);
      let fdt = dt;
      if (phase === 'merge') { showcase(dt); if (pt >= mergeLen) beginDrop(); }
      else if (phase === 'drop') { if (pt >= DROP_PHASE) { phase = 'countdown'; pt = 0; countN = -1; } }
      if (phase === 'countdown') {                              // 3, 2, 1, GO! Nothing moves until GO
        const c = Math.floor(pt / COUNT_STEP);
        if (c !== countN) {
          countN = c;
          if (c < 3) { big(String(3 - c), 'ar-punch'); tone(440 + c * 60, 440 + c * 60, 0.14, 'square', 0.18); }
          else { phase = 'fight'; pt = 0; big('GO!', 'ar-punch'); tone(880, 1320, 0.4, 'square', 0.2); }
        }
      } else if (phase === 'fight') {
        sim.step(dt); drain();
        if (sim.frozen) fdt = dt * 0.08;
        if (sim.finished) { phase = 'finish'; pt = 0; settle(); tone(1400, 1400, 0.5, 'square', 0.16); tone(1400, 900, 0.3, 'square', 0.16, 0.5); bump(0.5); }
      } else if (phase === 'finish') {
        if (pt < FREEZE) fdt = dt * SLOWMO;                     // the last knockout, slowly
        else if (!cheering) celebrate();
        if (pt >= FREEZE + CHEER) finishNow();
      }
      view(dt, fdt);
    },
    resize: resizeView,
    skipHold(f) { if (hud && hud.skipF !== f) { hud.skipF = f; hud.skipFill.style.width = (clamp(f, 0, 1) * 100).toFixed(0) + '%'; } },      // how far through the hold-to-skip
    status() { const st = sim.status(); st.forEach((s, k) => { s.brought = plans[k].before; s.merged = plans[k].after; s.bench = plans[k].bench; }); return st; },
    result() { return sim.result(); },
    skip() {                                                    // play the rest out instantly: 30 Hz, every ball CPU-driven, no effects
      if (destroyed || finished || noSkip) return;                // (a multiplayer fight is stepped by its host: skipping one copy would part it from the rest)
      quiet = true; fx.quiet = true; sim.auto = true;
      endShowcase(false); for (const q of leaving) freeActor(q.actor); leaving.length = 0;
      for (let i = 0; i < 9000 && !sim.finished; i++) { sim.step(1 / 30); sim.events.length = 0; }
      for (const d of dying) freeActor(d.v.actor); dying.length = 0;
      for (const v of views.slice()) { if (!v.u.alive) { forget(v); freeActor(v.actor); } else { v.fall = -1; v.pop = 1; v.delay = 0; v.hop = null; dropTele(v); } }
      for (const u of sim.field) { const v = ensure(u); v.fall = -1; v.pop = 1; }
      sim.balls.forEach((b, k) => { if (b.gone) { ballViews[k].fallen = true; ballViews[k].group.visible = false; ballViews[k].ring.visible = false; if (hud) hud.panels[k].root.classList.add('ar-noball'); } dimBall(ballViews[k], b.teamOut); });
      fx.clear(); for (const w of shotViews.values()) w.h.release(0); shotViews.clear();
      quiet = false; fx.quiet = false; T = Math.max(T, 3); phase = 'finish'; pt = FREEZE; cheering = true; finishNow();
      if (hud) { hud.root.classList.add('ar-fighting'); big(winText(), 'ar-stay', true); }
      hudT = 0; view(0, 0);
    },
    destroy() {
      if (destroyed) return; destroyed = true;
      if (hud) { hud.root.remove(); hud = null; }
      endShowcase(false);
      for (const a of [...actors]) freeActor(a);
      fx.dispose();
      for (const m of mats.values()) m.dispose(); for (const o of owned) o.dispose();
      for (const m of [ringMesh, auraMesh, barBg, barLag, barFill, barCharge, starMesh, markMesh, guideMesh]) m.dispose();
      sun.shadow.map && sun.shadow.map.dispose();
    },
  };
}
