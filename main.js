import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BOUNDS, STARTS, BIOMES, B, PLACES, REHOME, GUESTS, R_HUB, scenery, layout, ITEMS as MAP_ITEMS, SHAPES as MAP_SHAPES } from './map.js';
import { createTerrain, vnoise, SEA_LEVEL, SEA_MIN_D } from './terrain.js';
import { buildCritterGeometry, critterMaterial } from './critters/kit.js';
import * as LOCAL from './critters/local-mode.js';   // the local Stadium-model build; inert while its switch is off
import { createBattle, power } from './battle.js';
import { EVENTS } from './events.js';
import { openRoom, openPublicRoom, cleanCode } from './net.js';
import crittersA from './critters/critters_1.js';
import crittersB from './critters/critters_2.js';
import crittersC from './critters/critters_3.js';

const { LEVEL, TYPE_COLORS, RARITY } = window.ROLLUP_DATA;
const ITEMS = [...window.ROLLUP_DATA.ITEMS, ...MAP_ITEMS];
const CREATURES = [...crittersA, ...crittersB, ...crittersC].sort((a, b) => a.dex - b.dex);
// Titans: every critter again at TITAN_SCALE times its size. They appear in the outer habitats for the last 45 seconds
// and count as the same species in the dex. `base` points back at the ordinary critter.
const TITAN_SCALE = 10;
const TITANS = CREATURES.map((sp) => Object.assign({}, sp, { id: 'titan' + sp.id, base: sp, name: 'Titan ' + sp.name, height: Math.round(sp.height * TITAN_SCALE * 10) / 10, titan: true }));
const baseOf = (sp) => sp.base || sp;

// ---------- tuning ----------
const START_D = 0.6;      // starting ball diameter (m): big enough that the 30 cm critters stick straight away
const TRAINER_H = 1.5;    // the trainer's full height (m), reached once the ball is 1.9 m wide
const trainerHeight = (d) => clamp(d * 0.6, 0.25, TRAINER_H);    // shorter than the ball, so it never hides it; human-sized from a 1.9 m ball
const PICK_RATIO = 0.5;   // can roll up things up to this fraction of the ball's diameter, so critters stay big next to it
const GROW = 3;           // d^3 += GROW * size^3 * mass per pickup: tuned so a ball doubles about once a minute
const MAX_ON_BALL = 300;  // the newest this-many things are drawn on a ball; older ones still count and still fight
// CPU difficulty (chosen on the menu). speed = share of the player's top speed; dash = how keenly they use the charge dash
// (0 = never); band = how much a CPU that is ahead of the player eases off (and one behind hurries); think = how slowly they
// pick their next target (1 = normal).
const DIFFS = {
  easy:   { label: 'Easy',   speed: 0.78, dash: 0,   band: 0.3,  floor: 0.6,  think: 1.6 },
  normal: { label: 'Normal', speed: 0.94, dash: 0.6, band: 0.18, floor: 0.75, think: 1 },
  hard:   { label: 'Hard',   speed: 1.04, dash: 1.5, band: 0.06, floor: 0.92, think: 0.65 },
};
let DIFF = DIFFS.normal, CPU_SPEED = DIFF.speed;
// The four teams. Team 0 is the player. A team's critters are tinted in its colour once rolled up.
const TEAMS = [
  { id: 'red', name: 'Red', hex: 0xe24a4a, css: '#e24a4a' },
  { id: 'green', name: 'Green', hex: 0x3fae54, css: '#3fae54' },
  { id: 'yellow', name: 'Yellow', hex: 0xe9c21f, css: '#d9aa00' },
  { id: 'blue', name: 'Blue', hex: 0x3f7fe0, css: '#3f7fe0' },
];
const CLIMB = 0.8;        // the ball climbs steps up to this fraction of its radius (40% of its width): outgrowing walls is the point
const LUMP_MAX = 1.3;     // a stuck object can prop the ball up to this many radii off the ground
const RUN = 2.4;          // speed multiplier during a dash burst
const RUN_STEER = 0.45;   // steering multiplier during a burst: fast, and hard to turn
// The charge dash. Hold the button: the ball slows to a crawl and winds up, spending energy; let go and it bursts forward.
// A longer wind-up gives a longer, faster burst. Energy refills on its own and a little with every thing rolled up.
const CHARGE_TIME = 1.2;  // seconds of wind-up for a full charge (which costs a full energy meter)
const CHARGE_CRAWL = 0.3; // share of top speed while winding up
const ENERGY_FILL = 16;   // seconds for the meter to refill on its own
const ENERGY_PICK = 0.0125;// energy gained per thing rolled up
const DASH_MIN = 0.2;     // the least energy needed to start a wind-up
const burstTime = (c) => 0.45 + 1.35 * c, burstKick = (c) => 0.75 + 0.55 * c;   // by charge 0..1: seconds of burst, and its speed as a share of RUN x top speed
const DRIVE = 1.6;        // how quickly the ball gets up to speed (per second); lower = heavier
const GRIP = 7;           // sideways grip at a standstill (per second); it falls away as speed rises
const WAVE_SHARE = 0.3;   // each minute a wave of new critters this big appears (as a share of the starting population)
const TITANS_AT = 45;      // seconds from the end at which the titans appear
const CRITTER_DENSITY = 1.8;    // scales how many groups of each species the map starts with
const REFILL_AT = 45;     // seconds from the end at which everything rolled up so far is put back for a final push
// The round's four phases, by seconds left when each begins. `sky` is what the sky turns to during it.
const PHASES = [
  { from: 300, name: 'Scramble',   sub: 'Race for the feast, then grow to 90 cm to climb out of the Green', sky: 0x9ad8f5 },
  { from: 225, name: 'Expedition', sub: 'Every habitat is open. New critters have arrived. Watch for events!', sky: 0xa8dcf0 },
  { from: 120, name: 'Frenzy',     sub: 'Two minutes left. More critters are appearing: build your team!', sky: 0xf6dca8 },
  { from: 45,  name: 'Titan Hour', short: 'Titans', sub: 'Titans walk the outer lands, and everything rolled up so far is back!', sky: 0xf7a985 },
];
const EVENT_TIMES = [262, 210, 172, 140, 98, 64];   // seconds left at which an event begins (each a few seconds either way)
const KNOCK_LOSS = 3;     // things a ball drops when a heavier ball rams it
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// What a thing adds to a ball's volume. Big balls get less out of each thing (half at BIG_D wide), which keeps a leader in reach.
const BIG_D = 6;
const growthOf = (Bq, o) => GROW * o.size ** 3 * (o.spec.mass ?? 1) * (o.bonus ?? 1) / (1 + (Bq.d / BIG_D) ** 2);
// Top speed still rises with size, a little less steeply for the giants, so a big ball never feels slow across the ground.
// What changes with mass is heft: a bigger ball takes longer to get going, to stop and to turn (gradually: 0.6 m = 96%,
// 3 m = 83%, 8 m = 66%, 15 m = 53% of a small ball's pull), so it carries its momentum.
const topSpeed = (d) => 3.2 * Math.pow(d + 0.5, 0.85) / Math.pow(1 + d / 10, 0.25);
const heft = (d) => 1 / Math.pow(1 + d / 8, 0.6);
// A burst is worth much less to a heavy ball: RUN times top speed for a small one, falling fast with heft
// (2.3x at 0.6 m, 2.0x at 3 m, 1.65x at 8 m, 1.45x at 15 m), and it is shorter too (dashLast).
const dashMult = (d) => 1 + (RUN - 1) * Math.pow(heft(d), 1.8);
const dashLast = (d) => heft(d);
const CHARGE_STEER = 0.35; // steering (keys and mouse) while winding up a dash: you commit to a direction
// How many things a crash knocks off: nothing below top speed, then more the faster you were going (a full sprint: about 14).
const crashLoss = () => 0;      // running into scenery only stops the ball; rams and charging critters are what knock things off
const V3 = THREE.Vector3;
let rand = Math.random;
let START = { x: STARTS[0][0], z: STARTS[0][1] };      // this player's start pad (their team's)
const $ = (id) => document.getElementById(id);

// ---------- part kit for generated items, the ball and the trainer ----------
const G = {
  sph: new THREE.SphereGeometry(1, 20, 14),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  taper: new THREE.CylinderGeometry(1, 0.7, 1, 16),
  cone: new THREE.ConeGeometry(1, 1, 12),
  pyr: new THREE.ConeGeometry(1, 1, 4),
  rock: new THREE.DodecahedronGeometry(1, 0),
  hemi: new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  torus: new THREE.TorusGeometry(0.8, 0.2, 8, 20).rotateX(Math.PI / 2),
};
const mats = new Map();
function mat(c) {
  let m = mats.get(c);
  if (!m) { m = new THREE.MeshLambertMaterial({ color: c }); mats.set(c, m); }
  return m;
}
function P(g, geo, color, s, p, r) {
  const m = new THREE.Mesh(G[geo], mat(color));
  m.scale.set(s[0], s[1], s[2]);
  m.position.set(p[0], p[1], p[2]);
  if (r) m.rotation.set(r[0], r[1], r[2]);
  m.castShadow = true;
  g.add(m);
  return m;
}
const WOOD = 0x8a5a2b, CREAM = 0xf3ead7, IRON = 0x555b66;

// Fallback shapes for items (used where roster.js names no model, or the model fails to load).
const SHAPES = {
  berry(g, c) { P(g, 'sph', c, [.45, .45, .45], [0, .45, 0]); P(g, 'cone', 0x3f8f3a, [.18, .2, .18], [0, .92, 0]); },
  coin(g, c) { P(g, 'cyl', c, [.5, .14, .5], [0, .07, 0]); },
  flower(g, c) { P(g, 'cyl', 0x3f8f3a, [.05, .7, .05], [0, .35, 0]); P(g, 'sph', c, [.3, .14, .3], [0, .8, 0]); P(g, 'sph', 0xffd23f, [.12, .12, .12], [0, .88, 0]); },
  mushroom(g, c) { P(g, 'cyl', CREAM, [.16, .5, .16], [0, .25, 0]); P(g, 'sph', c, [.5, .3, .5], [0, .62, 0]); },
  bottle(g, c) { P(g, 'cyl', c, [.24, .62, .24], [0, .31, 0]); P(g, 'cyl', c, [.1, .26, .1], [0, .75, 0]); P(g, 'cyl', CREAM, [.13, .12, .13], [0, .94, 0]); },
  cup(g, c) { P(g, 'taper', c, [.4, .9, .4], [0, .45, 0]); },
  boot(g, c) { P(g, 'box', c, [.36, 1, .4], [0, .5, -.1]); P(g, 'box', c, [.36, .36, .5], [0, .18, .3]); },
  pot(g, c) { P(g, 'taper', 0xc7673a, [.42, .5, .42], [0, .25, 0]); P(g, 'sph', c, [.36, .34, .36], [0, .7, 0]); },
  bucket(g, c) { P(g, 'taper', c, [.48, .9, .48], [0, .45, 0]); },
  crate(g, c) { P(g, 'box', c, [.9, .9, .9], [0, .45, 0]); P(g, 'box', WOOD, [.94, .12, .94], [0, .45, 0]); },
  barrel(g, c) { P(g, 'cyl', c, [.38, 1, .38], [0, .5, 0]); P(g, 'cyl', IRON, [.4, .08, .4], [0, .25, 0]); P(g, 'cyl', IRON, [.4, .08, .4], [0, .75, 0]); },
  sign(g, c) { P(g, 'box', WOOD, [.09, 1, .09], [0, .5, 0]); P(g, 'box', c, [.8, .36, .07], [0, .76, .05]); },
  mailbox(g, c) { P(g, 'box', WOOD, [.1, .7, .1], [0, .35, 0]); P(g, 'box', c, [.3, .3, .5], [0, .85, 0]); },
  bush(g, c) { P(g, 'sph', c, [.42, .4, .42], [-.15, .4, 0]); P(g, 'sph', c, [.36, .34, .36], [.25, .34, .1]); P(g, 'sph', c, [.3, .3, .3], [.05, .6, -.1]); },
  fence(g, c) { for (const x of [-.42, .42]) P(g, 'box', c, [.08, .6, .08], [x, .3, 0]); P(g, 'box', c, [1, .07, .05], [0, .45, 0]); P(g, 'box', c, [1, .07, .05], [0, .22, 0]); },
  bench(g, c) { P(g, 'box', c, [1, .07, .32], [0, .28, 0]); P(g, 'box', c, [1, .28, .06], [0, .46, -.15]); for (const x of [-.42, .42]) P(g, 'box', IRON, [.07, .28, .3], [x, .14, 0]); },
  blanket(g, c) { P(g, 'box', c, [1, .03, .7], [0, .015, 0]); P(g, 'box', CREAM, [.2, .036, .72], [0, .018, 0]); },
  boulder(g, c) { P(g, 'rock', c, [.55, .5, .55], [0, .45, 0]); },
  cart(g, c) {
    P(g, 'box', c, [.9, .4, .55], [0, .5, 0]);
    for (const x of [-.3, .3]) for (const z of [-.3, .3]) P(g, 'cyl', 0x3a3a44, [.18, .08, .18], [x, .18, z], [Math.PI / 2, 0, 0]);
  },
  lamp(g, c) { P(g, 'cyl', IRON, [.03, .9, .03], [0, .45, 0]); P(g, 'sph', c, [.09, .09, .09], [0, .94, 0]); },
  tree(g, c) { P(g, 'cyl', WOOD, [.07, .4, .07], [0, .2, 0]); P(g, 'cone', c, [.32, .45, .32], [0, .55, 0]); P(g, 'cone', c, [.24, .4, .24], [0, .8, 0]); },
  roundtree(g, c) { P(g, 'cyl', WOOD, [.07, .4, .07], [0, .2, 0]); P(g, 'sph', c, [.32, .34, .32], [0, .66, 0]); },
  shed(g, c) { P(g, 'box', 0xd9c7a3, [.85, .6, .85], [0, .3, 0]); P(g, 'pyr', c, [.68, .4, .68], [0, .8, 0], [0, Math.PI / 4, 0]); P(g, 'box', WOOD, [.25, .4, .04], [0, .2, .43]); },
  house(g, c) {
    P(g, 'box', CREAM, [.9, .55, .9], [0, .275, 0]);
    P(g, 'pyr', c, [.72, .45, .72], [0, .775, 0], [0, Math.PI / 4, 0]);
    P(g, 'box', WOOD, [.18, .3, .04], [0, .15, .46]);
    P(g, 'box', 0x9fd8ff, [.16, .14, .04], [.28, .32, .46]);
    P(g, 'box', 0x9fd8ff, [.16, .14, .04], [-.28, .32, .46]);
  },
  tallhouse(g, c) {
    P(g, 'box', CREAM, [.55, .75, .55], [0, .375, 0]);
    P(g, 'pyr', c, [.45, .25, .45], [0, .875, 0], [0, Math.PI / 4, 0]);
    P(g, 'box', WOOD, [.14, .2, .04], [0, .1, .28]);
    for (const y of [.35, .58]) for (const x of [-.14, .14]) P(g, 'box', 0x9fd8ff, [.12, .1, .04], [x, y, .28]);
  },
  windmill(g, c) {
    P(g, 'taper', CREAM, [.28, .8, .28], [0, .4, 0], [Math.PI, 0, 0]);
    P(g, 'cone', c, [.22, .2, .22], [0, .9, 0]);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4; P(g, 'box', WOOD, [.06, .46, .02], [Math.cos(a) * .23, .72 + Math.sin(a) * .23, .24], [0, 0, a - Math.PI / 2]); }
  },
  tower(g, c) { P(g, 'cyl', 0xe8e2d0, [.2, .8, .2], [0, .4, 0]); P(g, 'cyl', 0xffd23f, [.24, .05, .24], [0, .72, 0]); P(g, 'cone', c, [.28, .2, .28], [0, .9, 0]); },
};

Object.assign(SHAPES, MAP_SHAPES);            // the habitats' own props (habitats/*.js)

// ---------- item models (GLB files named in roster.js) ----------
const gltfLoader = new GLTFLoader();
const gltfCache = new Map();
// Loads a model and bakes it into one geometry in the shared item material: its several meshes (one per colour) merged,
// stood on y = 0, centred, and scaled so its longest side is 1. Resolves to null for a model that cannot be baked
// (textured or skinned): the thing then keeps its generated shape.
function loadModel(path) {
  if (!gltfCache.has(path)) {
    gltfCache.set(path, new Promise((res, rej) => gltfLoader.load(path, (gltf) => {
      const m = gltf.scene, meshes = [];
      m.updateMatrixWorld(true);
      m.traverse((n) => { if (n.isMesh) meshes.push(n); });
      const plain = meshes.length > 0 && meshes.every((n) => !Array.isArray(n.material) && !n.material.map && !n.isSkinnedMesh && n.geometry.attributes.position && n.geometry.attributes.normal);
      if (!plain) { console.warn('model kept as a generated shape (it has textures or bones):', path); res(null); return; }
      try {
        const parts = meshes.map((n) => {
          const pg = n.geometry.index ? n.geometry.toNonIndexed() : n.geometry.clone();
          for (const a of Object.keys(pg.attributes)) if (a !== 'position' && a !== 'normal') pg.deleteAttribute(a);
          pg.applyMatrix4(n.matrixWorld);
          const col = n.material.color, arr = new Float32Array(pg.attributes.position.count * 3);
          for (let i = 0; i < arr.length; i += 3) { arr[i] = col.r; arr[i + 1] = col.g; arr[i + 2] = col.b; }
          pg.setAttribute('color', new THREE.BufferAttribute(arr, 3));
          return pg;
        });
        const geo = mergeGeometries(parts);
        geo.computeBoundingBox();
        const b = geo.boundingBox, k2 = 1 / (Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) || 1);
        geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
        geo.scale(k2, k2, k2);
        geo.computeBoundingBox(); geo.computeBoundingSphere();
        res(geo);
      } catch (e) { console.warn('model could not be baked:', path, e); res(null); }
    }, undefined, rej)));
  }
  return gltfCache.get(path);
}
// A generated shape is drawn once per colour and merged into a single mesh, so each thing on the map is one draw call.
const itemMat = new THREE.MeshLambertMaterial({ vertexColors: true }), itemGeo = new Map();
function shapeGeometry(spec, color) {
  const key = spec.id + '|' + color;
  let geo = itemGeo.get(key);
  if (!geo) {
    const g = new THREE.Group(), parts = [];
    try { (SHAPES[spec.shape] || SHAPES.crate)(g, color, P); } catch (e) { console.warn('shape failed for', spec.id, e); SHAPES.crate(g, color, P); }
    g.updateMatrixWorld(true);
    g.traverse((n) => {
      if (!n.isMesh) return;
      const pg = n.geometry.index ? n.geometry.toNonIndexed() : n.geometry.clone();
      for (const a of Object.keys(pg.attributes)) if (a !== 'position' && a !== 'normal') pg.deleteAttribute(a);
      pg.applyMatrix4(n.matrixWorld);
      const c = n.material.color, col = new Float32Array(pg.attributes.position.count * 3);
      for (let i = 0; i < col.length; i += 3) { col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b; }
      pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
      parts.push(pg);
    });
    geo = (parts.length && mergeGeometries(parts)) || G.box;
    itemGeo.set(key, geo);
  }
  return geo;
}
// A thing is always one mesh in the shared item material: its generated shape at first, its model's once that has loaded.
function buildItem(spec) {
  const color = spec.colors[Math.floor(rand() * spec.colors.length)];
  const mesh = new THREE.Mesh(shapeGeometry(spec, color), itemMat);
  mesh.castShadow = true;
  const path = Array.isArray(spec.model) ? spec.model[Math.floor(rand() * spec.model.length)] : spec.model;
  if (path) loadModel(path).then((geo) => { if (geo) mesh.geometry = geo; }).catch((e) => console.warn('Could not load model for', spec.id, path, e));
  return mesh;
}
// Critters are generated in code from the parts lists in critters/*.js: one merged mesh per species.
const critterGeo = new Map();
function buildCreature(spec, fine = false) {   // fine: the detailed shape, for close-ups (the dex and the pop-up card)
  const key = baseOf(spec).id + (fine ? '|fine' : '');                 // a titan shares its species' mesh, just drawn bigger
  let geo = critterGeo.get(key);
  if (!geo) { geo = buildCritterGeometry(spec, fine); critterGeo.set(key, geo); }
  const m = new THREE.Mesh(geo, critterMaterial);
  m.castShadow = true;
  return m;
}
const teamMats = TEAMS.map((tm) => new THREE.MeshLambertMaterial({ vertexColors: true, color: new THREE.Color(tm.hex).lerp(new THREE.Color(0xffffff), 0.35), emissive: tm.hex, emissiveIntensity: 0.22 }));
function setTeamLook(o, team) { if (o.kind === 'creature') o.group.material = team === null ? critterMaterial : teamMats[team]; }

// ---------- renderer, lights, sky ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const SKY = 0x9ad8f5;
const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 60, 260);
const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 2500);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8fae7a, 1.7));
const sun = new THREE.DirectionalLight(0xfff4d6, 2.1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);
const SUN_DIR = new V3(0.45, 1, 0.35).normalize();
// Graphics quality. On "auto" the game starts at the top and steps down whenever it cannot hold 30 frames a second
// (it never steps back up by itself, so it does not flip-flop). res = share of the screen's own resolution (capped);
// view = how far away things are still drawn, as a share of the usual distance.
const QUALITY = [
  { name: 'high',   res: 2,    shadows: true,  view: 1, map: 2048 },
  { name: 'medium', res: 1,    shadows: true,  view: 0.9, map: 1024 },
  { name: 'low',    res: 1,    shadows: false, view: 0.8 },
  { name: 'lowest', res: 0.7,  shadows: false, view: 0.6 },
];
let QUAL = QUALITY[0], qualLevel = 0;
function setQuality(level) {
  qualLevel = clamp(level, 0, QUALITY.length - 1); QUAL = QUALITY[qualLevel];
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, QUAL.res));
  sun.castShadow = QUAL.shadows;
  if (QUAL.map && sun.shadow.mapSize.x !== QUAL.map) { sun.shadow.mapSize.set(QUAL.map, QUAL.map); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  if (typeof resize === 'function') resize();
}

function aimSun(x, y, z, d) {                 // the shadow box follows the ball and scales with it
  const W = d * 12 + 9, sc = sun.shadow.camera;
  sc.left = -W; sc.right = W; sc.top = W; sc.bottom = -W; sc.near = 1; sc.far = W * 6 + 80;
  sc.updateProjectionMatrix();
  sun.shadow.normalBias = W * 0.0015;
  sun.target.position.set(x, y, z);
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, W * 3 + 40);
}
(function buildClouds() {
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const puff = new THREE.SphereGeometry(1, 12, 8);
  for (let i = 0; i < 24; i++) {
    const a = rand() * Math.PI * 2, R = 120 + rand() * 560, y = 170 + rand() * 90, s = 14 + rand() * 22;
    for (let k = 0; k < 5; k++) {
      const m = new THREE.Mesh(puff, white);
      m.scale.set(s * (0.7 + rand() * 0.6), s * 0.38, s * (0.6 + rand() * 0.4));
      m.position.set(Math.cos(a) * R + (k - 2) * s * 0.75, y + rand() * s * 0.2, Math.sin(a) * R + (rand() - 0.5) * s);
      scene.add(m);
    }
  }
})();

// ---------- terrain (data in terrain.js, painted by map.js) ----------
const T = createTerrain(BOUNDS, scenery);
const { NX, NZ, tH, tC, tR, tW } = T;
let iceOn = false;                    // Cold Snap: the sea has a frozen surface that everything stands on
const groundAt = (x, z) => (iceOn && tW[T.index(x, z)] === 2 ? SEA_LEVEL + 0.04 : T.groundAt(x, z));
let seaMesh = null;
(function buildTerrainMesh() {
  // One mesh: a top face per tile, plus a cliff face wherever a tile's edge stands above its neighbour's.
  const pos = [], col = [], c = new THREE.Color(), cliff = new THREE.Color();
  const hOf = (i, j, x, z) => { const k = j * NX + i; return tR[k] ? T.rampH(T.ramps[tR[k]], x, z) : tH[k]; };
  const quad = (ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, cc) => {
    pos.push(ax, ay, az, bx, by, bz, cx, cy, cz, ax, ay, az, cx, cy, cz, dx, dy, dz);
    for (let n = 0; n < 6; n++) col.push(cc.r, cc.g, cc.b);
  };
  const side = (i, j, ni, nj, xa, za, xb, zb) => {      // edge from (xa,za) to (xb,zb), shared with tile (ni,nj)
    if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ) return;
    const a0 = hOf(i, j, xa, za), a1 = hOf(i, j, xb, zb), b0 = hOf(ni, nj, xa, za), b1 = hOf(ni, nj, xb, zb);
    if (a0 > b0 + 1e-4 || a1 > b1 + 1e-4) {
      cliff.setHex(tC[j * NX + i]).multiplyScalar(0.5 + 0.22 * vnoise(xa / 5 + za / 5, a0 * 0.9));   // the ground's own colour, darker and banded
      quad(xa, a0, za, xb, a1, zb, xb, Math.min(a1, b1), zb, xa, Math.min(a0, b0), za, cliff);
    }
  };
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x0 = BOUNDS.x1 + i, z0 = BOUNDS.z1 + j, x1 = x0 + 1, z1 = z0 + 1;
    c.setHex(tC[j * NX + i]).multiplyScalar(0.9 + 0.2 * vnoise(x0 / 7, z0 / 7) + ((i + j) & 1 ? 0.012 : -0.012));
    quad(x0, hOf(i, j, x0, z0), z0, x0, hOf(i, j, x0, z1), z1, x1, hOf(i, j, x1, z1), z1, x1, hOf(i, j, x1, z0), z0, c);
    side(i, j, i + 1, j, x1, z0, x1, z1); side(i, j, i - 1, j, x0, z0, x0, z1);
    side(i, j, i, j + 1, x0, z1, x1, z1); side(i, j, i, j - 1, x0, z0, x1, z0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  terrain.receiveShadow = true;
  scene.add(terrain);

  // the sea: a see-through sheet at sea level, with the open ocean floor beyond the map well below it
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshLambertMaterial({ color: 0x3f9be0, transparent: true, opacity: 0.72, depthWrite: false }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = SEA_LEVEL; sea.renderOrder = 2; scene.add(sea); seaMesh = sea;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshLambertMaterial({ color: 0x2f6fb0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -3; scene.add(floor);

  // tall-grass blades and short tufts, as two instanced meshes
  const d = new THREE.Object3D();
  const spots = [];
  for (const [x1, z1, x2, z2] of T.grassRects) {
    const n = Math.min(700, Math.round((x2 - x1) * (z2 - z1) * 0.9));
    for (let i = 0; i < n; i++) spots.push([x1 + rand() * (x2 - x1), z1 + rand() * (z2 - z1)]);
  }
  const blades = new THREE.InstancedMesh(G.cone, mat(0x4c9e4a), spots.length);
  spots.forEach(([x, z], i) => { const h = 0.4 + rand() * 0.3; d.position.set(x, groundAt(x, z) + h / 2, z); d.scale.set(0.13, h, 0.13); d.updateMatrix(); blades.setMatrixAt(i, d.matrix); });
  scene.add(blades);
  const tuftSpots = [];
  for (let n = 0; n < 14000; n++) {
    const x = BOUNDS.x1 + 5 + rand() * (NX - 10), z = BOUNDS.z1 + 5 + rand() * (NZ - 10);
    const k = T.index(x, z), cc = tC[k], cr = cc >> 16 & 255, cg = cc >> 8 & 255, cb = cc & 255;
    if (!tR[k] && !tW[k] && cg > cr && cg > cb) tuftSpots.push([x, z]);
  }
  const tufts = new THREE.InstancedMesh(G.cone, mat(0x58a850), tuftSpots.length);
  tuftSpots.forEach(([x, z], i) => { const h = 0.12 + rand() * 0.2; d.position.set(x, groundAt(x, z) + h / 2, z); d.scale.set(0.07, h, 0.07); d.updateMatrix(); tufts.setMatrixAt(i, d.matrix); });
  scene.add(tufts);
})();

const worldGroup = new THREE.Group();
scene.add(worldGroup);

// ---------- drawing the free things: one draw call per shape, not per thing ----------
// Everything lying about the map (S.objects) keeps its own mesh for the game to move, scale and hide, but those meshes
// are not drawn (worldGroup is invisible). Instead, every frame, each thing that is switched on and on screen has its
// matrix copied into a batch: one InstancedMesh per shape and material, so 60 pebbles cost one draw call, not 60.
// Things that cast a shadow go in a second batch of the same shape that does (they are few: only those near the ball).
// A thing stuck on a ball is that ball's child and is drawn in the ordinary way.
worldGroup.visible = false; worldGroup.matrixWorldAutoUpdate = false;
const batchGroup = new THREE.Group(), batches = new Map();
scene.add(batchGroup);
const viewFrustum = new THREE.Frustum(), viewM = new THREE.Matrix4(), viewSphere = new THREE.Sphere();
function batchFor(geo, material, casts) {
  const key = geo.uuid + material.uuid + (casts ? 's' : '');
  let b = batches.get(key);
  if (!b) { b = { geo, material, casts, cap: 0, n: 0, mesh: null, arr: null }; batches.set(key, b); }
  return b;
}
function growBatch(b) {
  const cap = Math.max(8, b.cap * 2), old = b.mesh;
  const m = new THREE.InstancedMesh(b.geo, b.material, cap);
  m.frustumCulled = false; m.castShadow = b.casts; m.matrixAutoUpdate = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  if (old) { m.instanceMatrix.array.set(old.instanceMatrix.array.subarray(0, b.n * 16)); batchGroup.remove(old); old.dispose(); }
  batchGroup.add(m); b.mesh = m; b.cap = cap; b.arr = m.instanceMatrix.array;
}
const DRAW = { things: 0, batches: 0 };            // last frame's count, for the readout
function drawWorld() {
  camera.updateMatrixWorld();
  viewFrustum.setFromProjectionMatrix(viewM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  for (const b of batches.values()) b.n = 0;
  const inGame = S.state !== 'menu' && S.state !== 'dex';      // behind the menu everything is shown, from far above
  let things = 0;
  for (const o of S.objects) {
    const g = o.group;
    if (inGame && !g.visible) continue;
    const geo = g.geometry, p = g.position, sc = g.scale.x, casts = inGame && !!o.casts;
    // off screen: skip it. Shapes stand on their base, so the middle is straight above the thing's position; a
    // shadow-caster counts as bigger, since its shadow may be in view when it is not.
    let bs = geo.boundingSphere;
    if (!bs) { geo.computeBoundingSphere(); bs = geo.boundingSphere; }
    viewSphere.center.set(p.x, p.y + bs.center.y * sc, p.z); viewSphere.radius = (bs.radius + Math.hypot(bs.center.x, bs.center.z)) * sc * (casts ? 2.6 : 1.05);
    if (!viewFrustum.intersectsSphere(viewSphere)) continue;
    if (o.kind === 'creature' || o.fly || o.mx !== p.x || o.my !== p.y || o.mz !== p.z || o.ms !== sc) { g.updateMatrix(); o.mx = p.x; o.my = p.y; o.mz = p.z; o.ms = sc; }    // (things that have not moved keep their matrix)
    let b = casts ? o.bS : o.bN;
    if (!b || b.geo !== geo || b.material !== g.material) { b = batchFor(geo, g.material, casts); if (casts) o.bS = b; else o.bN = b; }
    if (b.n >= b.cap) growBatch(b);
    b.arr.set(g.matrix.elements, b.n * 16); b.n++; things++;
  }
  let used = 0;
  for (const b of batches.values()) {
    const m = b.mesh;
    if (!m) continue;
    m.count = b.n; m.visible = b.n > 0;
    if (b.n) { used++; const a = m.instanceMatrix; if (a.clearUpdateRanges) { a.clearUpdateRanges(); a.addUpdateRange(0, b.n * 16); } a.needsUpdate = true; }
  }
  DRAW.things = things; DRAW.batches = used;
}

// ---------- the balls ----------
// The original striped orb: a team-coloured sphere banded with rings. `own` marks the
// player's own ball, which wears more trim so it reads at a distance. The local build
// hands back its own parts instead; off, that is null and this is all there is.
function styleBall(g, k, own) {
  g.clear();
  const local = LOCAL.ballParts(k, own);
  if (local) { for (const m of local) g.add(m); return; }
  P(g, 'sph', TEAMS[k].hex, [1, 1, 1], [0, 0, 0]);
  for (const rot of own ? [[0, 0, 0], [Math.PI / 2, 0, 0], [0, 0, Math.PI / 2]] : [[Math.PI / 2, 0, 0]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 6, 24), mat(own ? 0xffd23f : 0xffffff));
    ring.rotation.set(rot[0], rot[1], rot[2]); ring.castShadow = true; g.add(ring);
  }
}
function buildCaptureBall(k, own) { const g = new THREE.Group(); styleBall(g, k, own); return g; }

const ball = new THREE.Group();
const core = buildCaptureBall(0, true);
ball.add(core);
scene.add(ball);

// The trainers: original figures, 1 unit tall, each in their team's colours. Legs and arms swing as they push.
function buildTrainer(hex) {
  const g = new THREE.Group(), dark = new THREE.Color(hex).multiplyScalar(0.55).getHex(), SKIN = 0xf2c9a0, HAIR = 0x4a3426, NAVY = 0x2f3a5a;
  const limb = (color, s, p) => { const piv = new THREE.Group(); piv.position.set(p[0], p[1], p[2]); P(piv, 'box', color, s, [0, -s[1] / 2, 0]); g.add(piv); return piv; };
  const legL = limb(NAVY, [.11, .3, .13], [.08, .36, 0]), legR = limb(NAVY, [.11, .3, .13], [-.08, .36, 0]);
  for (const leg of [legL, legR]) { P(leg, 'box', CREAM, [.125, .07, .2], [0, -.325, .035]); P(leg, 'box', dark, [.127, .025, .205], [0, -.35, .035]); }   // shoes and soles
  P(g, 'box', NAVY, [.27, .1, .17], [0, .39, 0]);                     // shorts
  P(g, 'box', hex, [.3, .25, .19], [0, .545, 0]);                     // jacket
  P(g, 'box', CREAM, [.305, .045, .195], [0, .44, 0]);                // hem
  P(g, 'box', CREAM, [.05, .25, .196], [0, .545, 0]);                 // zip stripe
  P(g, 'box', 0x7a5a3a, [.24, .23, .1], [0, .55, -.14]);              // backpack
  P(g, 'cyl', 0x5a4028, [.055, .26, .055], [0, .69, -.14], [0, 0, Math.PI / 2]);   // bedroll on top
  P(g, 'box', 0x5a4028, [.04, .24, .2], [.1, .55, -.05]); P(g, 'box', 0x5a4028, [.04, .24, .2], [-.1, .55, -.05]);   // straps
  P(g, 'cyl', CREAM, [.085, .05, .085], [0, .685, 0]);                // scarf
  P(g, 'sph', SKIN, [.135, .14, .135], [0, .8, 0]);                   // head
  P(g, 'sph', HAIR, [.142, .11, .142], [0, .815, -.035]);             // hair
  P(g, 'sph', SKIN, [.03, .04, .02], [.135, .8, 0]); P(g, 'sph', SKIN, [.03, .04, .02], [-.135, .8, 0]);   // ears
  P(g, 'sph', hex, [.148, .085, .148], [0, .885, 0]);                 // cap
  P(g, 'box', dark, [.2, .022, .13], [0, .868, .13]);                 // brim
  P(g, 'sph', CREAM, [.035, .035, .035], [0, .97, 0]);                // cap button
  P(g, 'sph', 0x1b1b26, [.022, .028, .022], [.05, .805, .125]); P(g, 'sph', 0x1b1b26, [.022, .028, .022], [-.05, .805, .125]);   // eyes
  const armL = limb(hex, [.085, .23, .095], [.195, .65, .01]), armR = limb(hex, [.085, .23, .095], [-.195, .65, .01]);
  for (const arm of [armL, armR]) { P(arm, 'box', CREAM, [.09, .04, .1], [0, -.215, 0]); P(arm, 'sph', SKIN, [.05, .05, .05], [0, -.27, 0]); }   // cuffs and hands
  g.userData = { legL, legR, armL, armR };
  poseTrainer(g, 0, false);
  return g;
}
function poseTrainer(g, t, moving) {
  const s = moving ? Math.sin(t * 11) * 0.6 : 0, u = g.userData;
  u.legL.rotation.x = s; u.legR.rotation.x = -s;
  u.armL.rotation.x = -1.3 + s * 0.12; u.armR.rotation.x = -1.3 - s * 0.12;     // arms out in front, pushing
}
let trainer = buildTrainer(TEAMS[0].hex);
trainer.scale.setScalar(trainerHeight(START_D));
scene.add(trainer);

// ---------- save data ----------
const SAVE_KEY = 'critter-roller-save-v2';
let save = { dex: {}, best: {}, muted: false, difficulty: 'normal', gfx: 'auto', gfxAuto: 0 };      // gfx: 'auto' or a quality level's name; gfxAuto: the level auto last settled on
try { save = Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage unavailable */ } }

// ---------- audio (all synthesised) ----------
let ac = null, master = null;
if (new URLSearchParams(location.search).has('mute')) save.muted = true;     // add ?mute to the address to start silent
function setMuted(m) {
  save.muted = m; persist();
  if (master) master.gain.value = m ? 0 : 1;
  for (const id of ['btnMute', 'btnMute2', 'hudMute']) { const el = $(id); if (el) el.textContent = m ? 'Sound: off (M)' : 'Sound: on (M)'; }
}
function audio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.gain.value = save.muted ? 0 : 1;
    // A limiter before the speakers: every sound is its own oscillator, and a dozen at once (an arena fight) added up
    // past full volume and crackled. Quiet passages go through untouched.
    try { const lim = ac.createDynamicsCompressor(); lim.threshold.value = -10; lim.knee.value = 8; lim.ratio.value = 12; lim.attack.value = 0.003; lim.release.value = 0.12; master.connect(lim); lim.connect(ac.destination); }
    catch (e) { master.connect(ac.destination); }
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(f1, f2, dur, type, vol, when = 0) {
  if (save.muted) return;
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function sfxPickup(ratio) { tone(500 + 900 * ratio, 900 + 1500 * ratio, 0.09, 'triangle', 0.14); }
function sfxBump() { tone(150, 45, 0.28, 'sawtooth', 0.22); }
function sfxWin() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.15, i * 0.12)); }
function cry(spec, vol = 0.07) {
  const h = hash(spec.id), base = 900 / Math.pow(spec.height + 0.3, 0.6);
  const n = 2 + (h % 2), type = (h >> 3) % 2 ? 'square' : 'sawtooth';
  let when = 0;
  for (let i = 0; i < n; i++) {
    const f = base * (0.7 + ((h >> (4 + i * 3)) & 7) / 8);
    const f2 = f * (0.6 + ((h >> (7 + i * 3)) & 7) / 6);
    const dur = 0.1 + ((h >> (10 + i * 2)) & 3) * 0.04 + Math.min(0.25, spec.height * 0.03);
    tone(f, f2, dur, type, vol, when);
    when += dur * 0.9;
  }
}

// ---------- game state ----------
const S = {
  state: 'menu', mode: 'timed', tank: false,
  d: START_D, vol3: START_D ** 3, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, heading: Math.PI, sup: START_D / 2, camY: 0,
  time: 0, timeLeft: 0, reachedAt: null, hitCool: 0, shake: 0,
  objects: [], attached: [], caught: 0, critters: 0, attachedCritters: 0,
  counts: { type: {}, species: {} },
  runSeen: new Map(), runNew: new Set(), zone: '', army: [],
  debugInput: null, mdx: 0, pitch: 0, zoom: 1, locked: false, mouseX: 0, mouseY: 0, mouseIn: false,
  team: 0, phase: 0, boostT: 0, stallT: 0, energy: 1, charge: 0, boostK: 1.35, pen: [], anchor: null, camGoal: new V3(), camLook: new V3(),
};
const MODS = { knock: 1, iced: false, fog: 1, energy: 1, speed: 1, lure: false };      // things events change for a while
window.__game = S;

// ---------- multiplayer state (see the "multiplayer" section further down) ----------
// One player hosts and runs the world: critters, CPU teams, events, the clock, who rolled up what. Every other player
// steers their own ball on their own machine (so it never lags), tells the host where it is, and is told what happened.
const NET = {
  room: null,                  // the open room (net.js), in the lobby and during a match
  on: false, host: false, client: false,     // on: a multiplayer match is running here; host / client: this machine's part in it
  seat: 0, seats: ['human', 'cpu', 'cpu', 'cpu'], peers: [null, null, null, null],   // this player's team; who has each team; (host) their connection
  q: new Map(), pending: new Map(), lunges: new Set(), ready: new Set(), spawned: [], fxRoots: new Map(), fxNodes: new Map(), mmDirty: new Set(),
  snapT: 0, slowT: 0, upT: 0, modsSent: '', cdGo: false, fxKey: 1, seq: 0, seqIn: 0, answered: 0, heard: 0, lag: 0, ping: -1, pingT: 0, stats: false, bIn: 0, bOut: 0, nIn: 0,
  fxGeos: new Set(), fxGeoIn: new Map(), mute: false,
  arenaIn: [], aLatest: [], aSteps: [], aAcc: 0, aEnd: null, aSent: '', battleSeed: 1,
};
const LOB = { kinds: ['human', 'cpu', 'cpu', 'cpu'], peers: [null, null, null, null], seat: 0, diff: 'normal', auto: null, autoAt: 0 };   // the lobby, as last heard (auto: seconds until a public game starts itself, as of autoAt)
function netTo(id, m) { let q = NET.q.get(id); if (!q) NET.q.set(id, q = []); q.push(m); }
function netAll(m) { if (NET.on && NET.host && NET.room) for (const id of NET.peers) if (id) netTo(id, m); }
function netHost(m) { if (NET.on && NET.client && NET.room) netTo('host', m); }
// News that goes stale (where the balls are, the clock): sent the fast way, where a late copy is dropped rather than
// queued. If the link cannot even keep up with the reliable channel, it is skipped altogether.
function netFast(id, m) { const room = NET.room; if (!room) return; if (NET.stats) NET.bOut += JSON.stringify(m).length; if (!room.sendFast(id, m) && room.buffered(id) < 3000) netTo(id, m); }
// Reliable messages go out in order, in packets of about a kilobyte, and only as fast as the link takes them: whatever
// does not fit waits here for the next tick. (Sent as one lump, a wave of new critters or an event's effects made a
// single huge message; on a slow link that blocked everything else for seconds, the ball positions included.)
function netFlush() {
  const room = NET.room;
  if (!room) return;
  for (const [id, q] of NET.q) {
    let i = 0;
    while (i < q.length && room.buffered(id) < 5000) {
      const chunk = [];
      let size = 0;
      do { const m = q[i++]; chunk.push(m); size += m[0] === 'sp' ? 80 : JSON.stringify(m).length; } while (i < q.length && size < 1000);
      if (NET.stats) NET.bOut += size;
      room.send(id, chunk);
    }
    if (i) q.splice(0, i);
  }
}
const seatHuman = (t) => (NET.on ? NET.seats[t] === 'human' : t === S.team);
const seatLabel = (t) => (t === S.team ? 'You' : TEAMS[t].name);
// Messages that name a ball are written with a token, so each player reads "You" for their own team.
const TOK = '\u0001';
const loc = (str) => String(str).replace(/\u0001([NW])(\d)\u0001/g, (m, k2, t) => (+t === S.team ? (k2 === 'W' ? '<b>YOU</b>' : 'You') : k2 === 'W' ? `the <b>${TEAMS[t].name}</b> team` : TEAMS[t].name));
const seeded = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ---------- world generation ----------
const SPECS = {};
for (const s of ITEMS) SPECS[s.id] = { kind: 'item', spec: s, size: s.size };
for (const s of CREATURES) SPECS[s.id] = { kind: 'creature', spec: s, size: s.height };
for (const s of TITANS) SPECS[s.id] = { kind: 'creature', spec: s, size: s.height };
// Where critters live: each species has a habitat (its own, or the one map.js rehomes it to), and each habitat is one or
// two biomes of the map. Within its habitat a species keeps to a distance from the centre that suits its size: the
// small ones near the Green, the big ones far out.
const habOf = (sp) => REHOME[baseOf(sp).id] || sp.habitat;
const HAB_BIOMES = {};
BIOMES.forEach((b, i) => { if (b.hab) (HAB_BIOMES[b.hab] || (HAB_BIOMES[b.hab] = [])).push(i); });
const HAB_RANGE = {};
for (const h in HAB_BIOMES) HAB_RANGE[h] = T.biomeRange(HAB_BIOMES[h]);
const biomeAt = (x, z) => BIOMES[T.biomeAt(x, z)];
const areaOfSpec = (sp) => (HAB_BIOMES[habOf(sp)] || []).map((i) => BIOMES[i].name).join(' / ') || habOf(sp);
function critterSpot(sp, hab = habOf(sp), far = null) {
  const ids = HAB_BIOMES[hab];
  if (!ids) return null;
  const [lo, hi] = HAB_RANGE[hab], t = far ?? clamp((baseOf(sp).height - 0.3) / 1.6, 0, 1), tol = (hi - lo) * 0.14 + 6;
  const want = sp.move === 'swim' ? 'water' : sp.move === 'fly' || sp.move === 'float' ? 'dry' : 'land';
  const rT = hab === 'town' ? null : lo + (0.1 + 0.8 * t) * (hi - lo);
  for (let i = 0; i < 12; i++) {
    const p = T.sampleBiome(ids, i < 8 ? want : 'land', rT, tol, rand);
    if (!p) continue;
    if (hab === 'town' && (Math.hypot(p[0], p[1]) < 11 || STARTS.some(([sx, sz]) => Math.hypot(p[0] - sx, p[1] - sz) < 5))) continue;   // keep the feast and the start pads clear
    return p;
  }
  return null;
}
// Where a ball should be heading for its size: nowhere while it is still growing in the Green, then the heart of its
// chosen wedge's inner habitat, then the outer one. Big balls move on to a neighbouring wedge after a while.
// Each entry: [inner place, outer place, ball size needed for the outer one], by wedge from north clockwise.
const ROUTES = [
  [PLACES.frozenLake, [0, -140], 3.4], [PLACES.yard, [106, -106], 3.4], [PLACES.hotSprings, [140, 0], 3.4], [PLACES.oasis, [112, 100], 3],
  [[0, 96], [30, 140], 2.8], [PLACES.bog, [-108, 112], 3], [PLACES.grove, [-150, 2], 3], [PLACES.barnyard, [-110, -110], 2.8],
];
function routeGoal(st, x, z, d, dt) {
  if (st.wedge === undefined || d < 0.95) return null;
  const out = d >= ROUTES[st.wedge][2];
  if (out) { st.roam = (st.roam || 0) + dt; if (st.roam > 45 && d > 6) { st.roam = 0; st.wedge = (st.wedge + (rand() < 0.5 ? 1 : 7)) % 8; } }
  const g = ROUTES[st.wedge][out ? 1 : 0];
  return Math.hypot(g[0] - x, g[1] - z) > 36 ? g : null;
}
let layoutSeed = 1;
const srand = () => { layoutSeed = (layoutSeed + 0x6d2b79f5) | 0; let t = Math.imul(layoutSeed ^ (layoutSeed >>> 15), 1 | layoutSeed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };   // the map is laid out the same every game
function populate(seed = (Math.random() * 2 ** 31) | 0) {
  const rr0 = rand; rand = srand;                 // the whole world is laid out from the seed, so every player in a match builds the same one
  try { populateSeeded(seed); } finally { rand = rr0; }
}
function populateSeeded(seed) {
  worldGroup.clear();
  while (ball.children.length > 1) ball.remove(ball.children[1]);
  S.objects = []; S.attached = []; S.byId = new Map(); S.nextId = 1;
  const solids = [];
  const free = (x, z, rad) => !solids.some((s) => Math.hypot(x - s.x, z - s.z) < rad + s.rad);
  function put(id, x, z, opt = {}) {
    const e = SPECS[id];
    if (!e) { console.warn('map.js uses an id that is not in roster.js:', id); return null; }
    const size = e.size * (opt.scale ?? 1), rad = opt.rad ?? size * (e.spec.rad ?? (e.kind === 'creature' ? 0.3 : 0.35));
    const group = e.kind === 'creature' ? buildCreature(e.spec, !!e.spec.titan) : buildItem(e.spec);       // (titans fill the screen: they get the detailed shape)
    group.scale.setScalar(size);
    group.position.set(x, groundAt(x, z), z);
    group.rotation.y = opt.rot ?? rand() * Math.PI * 2;
    worldGroup.add(group);
    const o = { id: opt.id ?? S.nextId, kind: e.kind, spec: e.spec, size, rad, group, bonus: opt.bonus ?? 1, on: false, fly: null, cool: 0, contrib: 0, ldist: 0, vis: size, lump: new V3(), spawnT: 0 };
    S.nextId = Math.max(S.nextId, o.id) + 1; S.byId.set(o.id, o);
    if (e.kind === 'creature') group.rotation.order = 'YXZ';       // so a critter can tip forward whichever way it faces
    if (e.kind === 'creature') Object.assign(o, { ai: 'idle', timer: rand() * 3, home: [x, z], tx: x, tz: z, phase: rand() * 6.28, leader: null });
    else if (size >= 0.5 && !e.spec.flat) solids.push({ x, z, rad });
    S.objects.push(o);
    if (NET.host && S.live && !NET.mute) netSpawned(o, id, x, z, opt);
    return o;
  }
  const radOf = (id) => (SPECS[id] ? SPECS[id].size * (SPECS[id].spec.rad ?? 0.35) : 0);
  layoutSeed = 12345;
  { layout({
    put, rand: srand, ground: groundAt, water: T.waterAt, biomeAt: (x, z) => biomeAt(x, z).id, sizeOf: (id) => (SPECS[id] ? SPECS[id].size : 0),
    row(id, x1, z1, x2, z2, n, opt) { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; put(id, x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, opt); } },
    grid(id, x, z, cols, rows, dx, dz, opt) { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) put(id, x + i * dx, z + j * dz, opt); },
    ring(id, x, z, r, n, opt) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; put(id, x + Math.cos(a) * r, z + Math.sin(a) * r, Object.assign({ rot: -a + Math.PI / 2 }, opt)); } },
    blob(id, x, z, r, n, opt) {
      for (let i = 0; i < n; i++) for (let t = 0; t < 25; t++) {
        const a = rand() * Math.PI * 2, rr = r * Math.sqrt(rand()), px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr;
        if (free(px, pz, radOf(id)) && T.waterAt(px, pz) !== 2) { put(id, px, pz, opt); break; }
      }
    },
    scatter(id, x1, z1, x2, z2, n, opt) {
      for (let i = 0; i < n; i++) for (let t = 0; t < 40; t++) {
        const px = x1 + rand() * (x2 - x1), pz = z1 + rand() * (z2 - z1);
        if (free(px, pz, radOf(id) + 0.3)) { put(id, px, pz, opt); break; }
      }
    },
  }); }
  layoutSeed = seed | 0;

  // Critters, by habitat. Rarity sets how many groups of each species; the smallest species, which a new ball can
  // roll up first, get more; the Green gets double so the opening scramble has plenty.
  const okSpot = (sp, x, z, wet) => { const w = T.waterAt(x, z); return sp.move === 'swim' ? (wet ? w >= 1 : w === 0) : (sp.move === 'fly' || sp.move === 'float') ? w !== 2 : w === 0; };
  function herd(sp, at, n, opt) {
    if (!at) return null;
    const leader = put(sp.id, at[0], at[1], opt), wet = T.waterAt(at[0], at[1]) > 0;
    for (let i = 1; i < n; i++) for (let t = 0; t < 12; t++) {
      const a = rand() * Math.PI * 2, r = (0.8 + rand() * 1.6) * sp.height + 0.3, x = at[0] + Math.cos(a) * r, z = at[1] + Math.sin(a) * r;
      if (okSpot(sp, x, z, wet) && Math.abs(groundAt(x, z) - groundAt(at[0], at[1])) < Math.max(0.3, sp.height * 0.5)) { put(sp.id, x, z, opt).leader = leader; break; }
    }
    return leader;
  }
  for (const sp of CREATURES) {
    const [groups, per] = RARITY[sp.rarity] || [1, 1], hab = habOf(sp);
    const n = Math.max(1, Math.round(groups * (hab === 'town' ? 2 : 1) * (sp.height <= 0.45 ? 1.6 : 1) * CRITTER_DENSITY));
    for (let k = 0; k < n; k++) herd(sp, critterSpot(sp, hab), per);
  }
  for (const hab in GUESTS) for (const id of GUESTS[hab]) { const sp = SPECS[id] && SPECS[id].spec; if (sp) for (let k = 0; k < (hab === 'town' ? 3 : 1); k++) herd(sp, critterSpot(sp, hab, 0.15), 3); }
  S.critters = S.objects.filter((o) => o.kind === 'creature').length;
  // remember where everything started, so the final push can put back whatever has been rolled up
  S.initial = S.objects.map((o) => ({ o, id: o.spec.id, x: o.group.position.x, z: o.group.position.z, rot: o.group.rotation.y }));
  S.spawn = { put, herd };
  S.titansOut = false; S.live = false;
  { let cs = S.objects.length; for (const o of S.objects) cs = (cs * 31 + Math.round(o.group.position.x * 8) + Math.round(o.group.position.z * 8) * 7) | 0; S.layoutSum = cs; }
  buildUnlocks();
}

// ---------- input ----------
const keys = {};
addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;          // typing a room code
  keys[e.code] = true;
  if (e.repeat) return;
  if (e.code === 'KeyT') { S.tank = !S.tank; $('steer').textContent = S.tank ? 'tank' : 'simple'; toast('Steering: ' + (S.tank ? 'tank' : 'simple')); }
  if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
  if (e.code === 'KeyM') setMuted(!save.muted);
  if ((e.code === 'Space' || e.code === 'Enter') && S.state === 'battle' && battle && !battle.modern) skipBattle();     // (the arena fight is skipped by HOLDING Enter: Space is its dash)
  if ((e.code === 'Space' || e.code === 'Enter') && S.state === 'intro') S.introT = Math.max(S.introT, INTRO_LEN - 0.9);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; S.mouseIn = false; });
// Mouse = camera. Moving it swings the camera round the ball (and the ball rolls where the camera faces); up and down
// tilts it; the wheel zooms. No click needed. Clicking captures the pointer so it never runs out of screen; until then,
// resting the pointer at the left or right edge keeps the camera turning.
const MOUSE_YAW = 0.0075, MOUSE_PITCH = 0.006;       // radians per pixel of mouse movement
function lockMouse() { try { const p = canvas.requestPointerLock && canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed */ } }
canvas.addEventListener('click', () => { if (S.state === 'play' && document.pointerLockElement !== canvas) lockMouse(); });
document.addEventListener('mousemove', (e) => {
  S.mouseIn = true;
  S.mouseX = (e.clientX / innerWidth - 0.5) * 2; S.mouseY = (e.clientY / innerHeight - 0.5) * 2;
  if (S.state !== 'play') return;
  S.mdx += e.movementX;
  S.pitch = clamp(S.pitch + e.movementY * MOUSE_PITCH, -0.4, 1.0);
});
document.addEventListener('mouseleave', () => { S.mouseIn = false; });
canvas.addEventListener('wheel', (e) => { S.zoom = clamp(S.zoom * (e.deltaY > 0 ? 1.1 : 0.9), 0.6, 2.4); e.preventDefault(); }, { passive: false });
document.addEventListener('pointerlockchange', () => {
  const now = document.pointerLockElement === canvas;
  if (!now && S.locked && S.state === 'play') togglePause();     // Esc while captured: pause
  S.locked = now;
});
const k = (...codes) => (codes.some((c) => keys[c]) ? 1 : 0);
const dz = (v) => (Math.abs(v) < 0.18 ? 0 : v);
let padPrev = [];
function readPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) if (p && p.connected) return p;
  return null;
}
function readInput() {
  if (S.debugInput) return S.debugInput;
  const pad = readPad();
  const ax = (i) => (pad && pad.axes[i] !== undefined ? dz(pad.axes[i]) : 0);
  let f, t;
  if (S.tank) {
    const L = clamp(k('KeyW') - k('KeyS') - ax(1), -1, 1);
    const R = clamp(k('KeyI', 'ArrowUp') - k('KeyK', 'ArrowDown') - ax(3), -1, 1);
    f = (L + R) / 2; t = (L - R) / 2;
  } else {
    f = clamp(k('KeyW', 'ArrowUp') - k('KeyS', 'ArrowDown') - ax(1), -1, 1);
    t = clamp(k('KeyD', 'ArrowRight') - k('KeyA', 'ArrowLeft') + ax(0) + ax(2), -1, 1);
  }
  let mouseTurn = 0;                                              // pointer parked at a screen edge: keep turning
  if (!S.locked && S.mouseIn && Math.abs(S.mouseX) > 0.94) mouseTurn = Math.sign(S.mouseX) * 0.8;
  const run = !!(k('ShiftLeft', 'ShiftRight') || (pad && ((pad.buttons[0] && pad.buttons[0].pressed) || (pad.buttons[7] && pad.buttons[7].pressed))));
  return { f, t: clamp(t + mouseTurn, -1, 1), run };
}
function readStick() {                          // screen-relative stick for the fixed-camera arena: x right, z down the screen
  const pad = readPad(), ax = (i) => (pad && pad.axes[i] !== undefined ? dz(pad.axes[i]) : 0);
  return { x: clamp(k('KeyD', 'ArrowRight') - k('KeyA', 'ArrowLeft') + ax(0), -1, 1), z: clamp(k('KeyS', 'ArrowDown') - k('KeyW', 'ArrowUp') + ax(1), -1, 1),
    dash: !!(k('ShiftLeft', 'ShiftRight', 'Space') || (pad && ((pad.buttons[0] && pad.buttons[0].pressed) || (pad.buttons[7] && pad.buttons[7].pressed)))) };
}
function pollPadButtons() {
  const pad = readPad();
  const now = pad ? pad.buttons.map((b) => b.pressed) : [];
  const hit = (i) => now[i] && !padPrev[i];
  if (hit(9)) togglePause();
  if (S.state === 'menu') { if (NET.room) { /* in a lobby: use the buttons */ } else if (hit(0)) start('timed'); else if (hit(2)) start('free'); }
  else if (S.state === 'battle' && hit(3) && battle && !battle.modern) skipBattle();
  else if (S.state === 'intro' && hit(0)) S.introT = Math.max(S.introT, INTRO_LEN - 0.9);
  else if (S.state === 'results' && hit(0)) $('btnAgain').click();
  padPrev = now;
}

// ---------- HUD ----------
const fmtSize = (d) => (d < 1 ? (d * 100).toFixed(1) + ' cm' : d.toFixed(2) + ' m');
const fmtTime = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const typeChip = (t) => `<span class="type" style="background:${TYPE_COLORS[t] || '#888'}">${t}</span>`;
const typeChips = (sp) => sp.types.map(typeChip).join('');
let toastTimer = 0;
function toast(msg) { const el = $('toast'); el.textContent = loc(msg); el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }
function showPick(html) { const el = $('pick'); el.innerHTML = html; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }
function challengeProgress(c) { return (c.kind === 'type' ? S.counts.type[c.value] : S.counts.species[c.value]) || 0; }
function armyPower(army) { let s = 0; for (const sp of army) s += sp._pw || (sp._pw = power(sp)); return s; }
function updateHud() {
  const en = $('energyfill'), ch = $('chargefill');
  en.style.width = (S.energy * 100).toFixed(1) + '%'; ch.style.width = (S.charge * 100).toFixed(1) + '%';
  $('energy').className = S.charge > 0 ? 'charging' : S.energy >= 0.999 ? 'full' : S.energy < DASH_MIN ? 'empty' : '';
  $('dashlabel').textContent = S.charge > 0 ? 'CHARGING' : S.boostT > 0 ? 'BURST!' : S.energy >= 0.999 ? 'DASH READY' : 'DASH';
  const nCrit = String(S.attachedCritters), nPow = String(Math.round(armyPower(S.army)));
  if ($('statCrit').textContent !== nCrit) $('statCrit').textContent = nCrit;
  if ($('statPow').textContent !== nPow) $('statPow').textContent = nPow;
  $('size').firstChild.nodeValue = fmtSize(S.d);
  const target = S.mode === 'timed' && LEVEL.targetDiameter > 0;
  $('bar').style.display = target ? 'block' : 'none';
  if (target) $('barfill').style.width = Math.min(100, S.d / LEVEL.targetDiameter * 100).toFixed(1) + '%';
  $('timer').textContent = S.mode === 'timed' ? fmtTime(Math.max(0, S.timeLeft)) : 'Free roam';
  let html = '';
  if (S.mode === 'timed') {                     // standings, biggest ball first
    const rows = allBalls().map((b) => ({ tm: TEAMS[b.team], name: seatLabel(b.team), d: b.d, army: b.army, me: b === S })).sort((a, b) => b.d - a.d);
    const big = Math.max(rows[0].d, 1);
    rows.forEach((r, i) => { html += `<div class="sb${r.me ? ' me' : ''}"><i class="rk">${i + 1}</i><b style="color:${r.tm.css}">${r.name}</b><span class="szbar"><u style="width:${(r.d / big * 100).toFixed(0)}%;background:${r.tm.css}"></u></span><em>${fmtSize(r.d)}</em><span class="cr">${r.army.length}</span></div>`; });
    html = '<div class="sbhead"><span>Standings</span><span>size</span><span>critters</span></div>' + html;
  }
  $('goals').style.display = html ? '' : 'none';
  if ($('goals').innerHTML !== html) $('goals').innerHTML = html;
}

function showArea(name) { const el = $('area'); el.textContent = name; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }

// ---------- dex pop-up: a spinning model and the entry, top right, for the first of each species in a run ----------
const popR = new THREE.WebGLRenderer({ canvas: $('dexcv'), antialias: true, alpha: true });
popR.setPixelRatio(1);
const popScene = new THREE.Scene(), popSpin = new THREE.Group(), popCam = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
popScene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2.2), popSpin);
{ const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(2, 3, 4); popScene.add(dl); }
let popT = 0, popInst = null, popSeq = 0;
// Centre whatever is in the pop-up on the origin and pull the camera back to fit it.
// Box3 rather than geometry.boundingBox: a Stadium model is a group of several meshes.
function framePop(obj) {
  const b = new THREE.Box3().setFromObject(obj), c = b.getCenter(new V3()), s = b.getSize(new V3()).length();
  obj.position.sub(c);
  popCam.position.set(0, s * 0.45, s * 1.9); popCam.lookAt(0, 0, 0);
}
function showDexPop(sp, isNew, count) {
  popSpin.clear();
  if (popInst) { popInst.dispose(); popInst = null; }
  const m = buildCreature(sp, true);
  popSpin.add(m);
  framePop(m);
  popSpin.rotation.y = 0.5;
  // Where the player has extracted the Stadium models, swap the real one in when it
  // arrives. The generated mesh is already on screen, so a slow load shows nothing odd,
  // and a pop that has been replaced or has expired drops its result on the floor.
  const seq = ++popSeq;
  LOCAL.dexModel(sp.dex).then((l) => {
    if (!l || seq !== popSeq || popT <= 0) return;
    popSpin.clear();
    popInst = LOCAL.dexInstance(l);
    popSpin.add(popInst.root);
    framePop(popInst.root);
  });
  $('dexinfo').innerHTML = `${isNew ? '<div class="new">NEW!</div>' : ''}<div class="nm">#${String(sp.dex).padStart(3, '0')} ${sp.name}</div><div class="meta">${sp.species} critter</div>${typeChips(sp)}<div class="meta">${sp.height} m · ${sp.rarity} · ${sp.temper}</div><div class="meta">lives: ${areaOfSpec(sp)} · caught ${count}</div>`;
  $('dexpop').classList.add('show');
  popT = isNew ? 5 : 3;
  popR.render(popScene, popCam);
}
function tickDexPop(dt) {
  if (popT <= 0) return;
  popT -= dt;
  popSpin.rotation.y += dt * 1.6;
  if (popInst) popInst.update(dt);
  popR.render(popScene, popCam);
  if (popT <= 0) {
    $('dexpop').classList.remove('show');
    if (popInst) { popInst.dispose(); popInst = null; }
    popSpin.clear();
  }
}

// ---------- "now rollable" announcements, and the arrow to what a challenge still needs ----------
let unlocks = [], unlockAt = 0;
function buildUnlocks() {                     // every kind of thing on the map, smallest first
  const best = new Map();
  for (const o of S.objects) if (!best.has(o.spec.name) || o.size < best.get(o.spec.name)) best.set(o.spec.name, o.size);
  unlocks = [...best].map(([name, size]) => ({ name, size })).sort((a, b) => a.size - b.size);
  unlockAt = unlocks.findIndex((u) => u.size > S.d * PICK_RATIO);
  if (unlockAt < 0) unlockAt = unlocks.length;
}
function announceUnlocks() {
  const names = [];
  while (unlockAt < unlocks.length && unlocks[unlockAt].size <= S.d * PICK_RATIO) names.push(unlocks[unlockAt++].name);
  if (names.length) toast('Now rollable: ' + names.slice(0, 3).join(', ') + (names.length > 3 ? ` +${names.length - 3} more` : ''));
}
let seekT = 0;
function updateSeek(dt, hx, hz) {          // the habitat banner, and the pointer to whatever is marked (an event), or the way out of the Green
  seekT -= dt;
  if (seekT > 0) return;
  seekT = 0.2;
  const zn = biomeAt(S.x, S.z).name;
  if (zn !== S.zone) { S.zone = zn; if (S.state === 'play') showArea(zn); }
  const el = $('seek');
  let mk = null, md = 1e9;
  for (const m of markers.values()) { const d = Math.hypot(m.x - S.x, m.z - S.z); if (d < md) { md = d; mk = m; } }
  if (mk && S.state === 'play') {
    const dx = mk.x - S.x, dz2 = mk.z - S.z, rel = Math.atan2(dx * -hz + dz2 * hx, dx * hx + dz2 * hz);    // 0 = straight ahead, positive = to the right
    if (S.ev) { el.style.display = 'none'; $('evdist').innerHTML = `<span class="arr" style="transform:rotate(${rel.toFixed(2)}rad)">↑</span>${Math.round(md)} m`; }
    else { el.style.display = 'block'; el.innerHTML = `<span class="arr" style="transform:rotate(${rel.toFixed(2)}rad);color:${mk.css}">↑</span> <b>${mk.label}</b> ${Math.round(md)} m`; }
  } else if (S.mode === 'timed' && S.state === 'play' && S.d < 0.9 && Math.hypot(S.x, S.z) < R_HUB + 4 && S.time > 6) {
    el.style.display = 'block'; el.innerHTML = 'Grow to <b>90 cm</b> to climb out of the Green';
  } else el.style.display = 'none';
  if (!mk && S.ev && $('evdist').innerHTML) $('evdist').innerHTML = '';
}

// ---------- markers: a beam of light and a ring on the ground, a "!" on the minimap and an arrow in the HUD ----------
const markers = new Map(), fx = new THREE.Group();
scene.add(fx);
function mark(id, x, z, opt = {}) {
  unmark(id);
  const color = opt.color ?? 0xffe169, radius = opt.radius ?? 6, g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.6, radius * 0.12), Math.max(0.6, radius * 0.12), 160, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, depthWrite: false, fog: false, side: THREE.DoubleSide }));
  beam.position.y = 80;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, Math.max(0.12, radius * 0.035), 6, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, fog: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.25;
  g.add(beam, ring); g.position.set(x, groundAt(x, z), z); fx.add(g);
  const m = { id, x, z, label: opt.label || 'Event', color, css: '#' + color.toString(16).padStart(6, '0'), radius, g, ring };
  markers.set(id, m);
  return m;
}
function moveMark(id, x, z) { const m = markers.get(id); if (m) { m.x = x; m.z = z; m.g.position.set(x, groundAt(x, z), z); } }
function unmark(id) { const m = markers.get(id); if (m) { fx.remove(m.g); markers.delete(id); } }
// ---------- dash effects: dust and sparks (one instanced mesh of little cubes), and the aim arrow on the ground ----------
const PMAX = 500, parts = [], pDummy = new THREE.Object3D(), pCol = new THREE.Color();
const pMesh = new THREE.InstancedMesh(G.box, new THREE.MeshBasicMaterial({ fog: false }), PMAX);
pMesh.frustumCulled = false; pMesh.count = 0; scene.add(pMesh);
function puff(x, y, z, vx, vy, vz, life, size, color, grav = 6) { if (parts.length < PMAX) parts.push({ x, y, z, vx, vy, vz, life, max: life, size, color, grav }); }
function tickParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i];
    q.life -= dt;
    if (q.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
    q.vy -= q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
  }
  for (let i = 0; i < parts.length; i++) {
    const q = parts[i], s = q.size * (0.35 + 0.65 * q.life / q.max);
    pDummy.position.set(q.x, q.y, q.z); pDummy.rotation.set(q.life * 7, q.life * 5, 0); pDummy.scale.setScalar(s); pDummy.updateMatrix();
    pMesh.setMatrixAt(i, pDummy.matrix); pMesh.setColorAt(i, pCol.setHex(q.color));
  }
  pMesh.count = parts.length; pMesh.instanceMatrix.needsUpdate = true;
  if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
}
const DUST = [0xe6d9b8, 0xd8c8a0, 0xf3ead7];
// Winding up: dust kicked out behind the spinning ball and sparks flying off it, more as the charge builds (c = 0..1).
function chargeFx(Bq, c, dt) {
  const d = Bq.d, r = d / 2, hx = Math.sin(Bq.heading), hz = Math.cos(Bq.heading), gy = groundAt(Bq.x, Bq.z), k = Math.pow(d, 0.7), col = TEAMS[Bq.team].hex;
  let n = (14 + 46 * c) * dt; n = Math.floor(n) + (rand() < n % 1 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const side = (rand() - 0.5) * r * 1.4;
    puff(Bq.x - hx * r * 0.7 + hz * side, gy + 0.05 * k, Bq.z - hz * r * 0.7 - hx * side, -hx * (2.5 + 4 * c) * k + (rand() - 0.5) * k, (1.2 + 2.5 * rand()) * k, -hz * (2.5 + 4 * c) * k + (rand() - 0.5) * k, 0.45 + rand() * 0.3, (0.1 + 0.1 * rand()) * k, DUST[i % 3], 5 * k);
    if (rand() < 0.35 + 0.5 * c) {
      const a = rand() * 6.28, up = 0.2 + rand() * 0.9;
      puff(Bq.x + Math.cos(a) * r * 0.9, gy + r * (0.4 + up), Bq.z + Math.sin(a) * r * 0.9, Math.cos(a) * (2 + 4 * c) * k, (1.5 + 3 * rand()) * k, Math.sin(a) * (2 + 4 * c) * k, 0.25 + rand() * 0.25, (0.05 + 0.05 * c) * k, rand() < 0.5 ? 0xffe169 : rand() < 0.5 ? 0xffffff : col, 9 * k);
    }
  }
}
// Letting go: a ring of dust thrown out, then a streak of team-coloured sparks for as long as the burst lasts.
function burstFx(Bq, c) {
  const r = Bq.d / 2, gy = groundAt(Bq.x, Bq.z), k = Math.pow(Bq.d, 0.7);
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28, sp = (3 + 5 * c) * k; puff(Bq.x + Math.cos(a) * r, gy + 0.1 * k, Bq.z + Math.sin(a) * r, Math.cos(a) * sp, (1 + rand() * 2) * k, Math.sin(a) * sp, 0.5 + rand() * 0.3, (0.14 + 0.1 * rand()) * k, DUST[i % 3], 4 * k); }
}
function trailFx(Bq, dt) {
  const r = Bq.d / 2, hx = Math.sin(Bq.heading), hz = Math.cos(Bq.heading), gy = groundAt(Bq.x, Bq.z), k = Math.pow(Bq.d, 0.7), col = TEAMS[Bq.team].hex;
  let n = 40 * dt; n = Math.floor(n) + (rand() < n % 1 ? 1 : 0);
  for (let i = 0; i < n; i++) puff(Bq.x - hx * r + (rand() - 0.5) * r, gy + rand() * r * 1.4, Bq.z - hz * r + (rand() - 0.5) * r, -hx * k + (rand() - 0.5) * k, rand() * k, -hz * k + (rand() - 0.5) * k, 0.35 + rand() * 0.3, (0.08 + 0.1 * rand()) * k, i % 3 === 0 ? 0xffffff : i % 3 === 1 ? col : DUST[0], 1.5 * k);
}
// The aim arrow: lies on the ground ahead of a ball that is winding up, pointing where the burst will go and growing with the charge.
const arrows = new THREE.Group();
scene.add(arrows);
const arrowGeo = new THREE.BufferGeometry();      // one chevron, pointing along +z, 1 wide
arrowGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0, 0, 0.55, 0, 0, 0.25, 0.5, 0, 0, 0, 0, 0.25, 0, 0, 0.55, -0.5, 0, 0, 0, 0, 0.25, -0.5, 0, -0.22, 0.5, 0, 0, 0.5, 0, -0.22, 0, 0, 0.25], 3));
const CHEVRONS = 9;
function aimArrow(Bq, c) {
  if (c <= 0) { if (Bq.arrow) Bq.arrow.visible = false; return; }
  if (!Bq.arrow || Bq.arrow.parent !== arrows) {
    const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: Bq === S ? 0xffe169 : TEAMS[Bq.team].hex, transparent: true, opacity: 0.8, depthWrite: false, fog: false, side: THREE.DoubleSide });
    for (let i = 0; i < CHEVRONS; i++) { const ch = new THREE.Mesh(arrowGeo, m); ch.renderOrder = 3; g.add(ch); }
    g.userData.mat = m; Bq.arrow = g; arrows.add(g);
  }
  const r = Bq.d / 2, hx = Math.sin(Bq.heading), hz = Math.cos(Bq.heading), len = r * 1.2 + c * topSpeed(Bq.d) * dashMult(Bq.d) * burstTime(c) * dashLast(Bq.d) * 0.55, step = Math.max(Bq.d * 0.8, len / CHEVRONS);
  Bq.arrow.visible = true;
  Bq.arrow.userData.mat.opacity = 0.5 + 0.4 * c + (c >= 0.999 ? 0.1 * Math.sin(S.time * 30) : 0);
  Bq.arrow.children.forEach((ch, i) => {
    const dist = r * 1.25 + (i + (S.time * 2.5) % 1) * step;                 // the chevrons march forward
    ch.visible = dist < len + r;
    if (!ch.visible) return;
    const x = Bq.x + hx * dist, z = Bq.z + hz * dist;
    ch.position.set(x, groundAt(x, z) + 0.08 + Bq.d * 0.02, z);
    ch.rotation.y = Bq.heading;
    ch.scale.set(Bq.d * (0.75 + 0.35 * c), 1, Bq.d * 0.9);
  });
}
function clearFx() {
  parts.length = 0; pMesh.count = 0; arrows.clear(); S.arrow = null; for (const id of [...markers.keys()]) unmark(id); fx.clear(); NET.fxRoots.clear(); NET.fxNodes.clear(); }

// ---------- pickups and knocks ----------
const tmpV = new V3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), UP = new V3(0, 1, 0), downLocal = new V3(), axis = new V3();
function bump(map, key, n) { map[key] = (map[key] || 0) + n; }
// Things stay on the ball's surface at their true size. Each time the ball grows they are pushed back out to the
// new surface, so nothing sinks in or disappears (beyond the MAX_ON_BALL drawing cap).
function seatOn(list, r) {
  for (const a of list) {
    a.ldist = Math.max(r * 0.55, r - a.size * 0.2);
    a.group.scale.setScalar(a.size);
    a.group.position.setLength(a.ldist);
    a.lump.copy(a.group.position).setLength(Math.min(r * LUMP_MAX, a.ldist + a.size * (a.spec.flat ? 0.05 : 0.45)));
  }
}
function seatAll() { seatOn(S.attached, S.d / 2); }
// Fix a free thing onto a ball centred at (cx,cy,cz): feet-first where it touched, knocked a little askew.
function stick(ballGroup, o, cx, cy, cz, r) {
  const p = o.group.position;
  tmpV.set(p.x - cx, p.y + Math.min(o.size * 0.5, r * 1.5) - cy, p.z - cz);
  if (tmpV.lengthSq() < 1e-10) tmpV.set(0, 1, 0);
  tmpV.normalize();
  o.group.visible = true;
  o.group.quaternion.setFromUnitVectors(UP, tmpV);
  axis.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
  o.group.quaternion.multiply(tmpQ2.setFromAxisAngle(axis, (rand() - 0.5) * 1.2));
  o.group.position.set(cx + tmpV.x * r, cy + tmpV.y * r, cz + tmpV.z * r);
  ballGroup.position.set(cx, cy, cz);
  ballGroup.updateMatrixWorld(true);
  ballGroup.attach(o.group);
  o.on = true;
}
function attach(o) {
  stick(ball, o, S.x, S.y, S.z, S.d / 2);
  o.contrib = growthOf(S, o);
  S.vol3 += o.contrib; S.d = Math.cbrt(S.vol3);
  { const i = S.objects.indexOf(o); if (i >= 0) S.objects.splice(i, 1); }
  S.attached.push(o); S.caught++; o.by = S.team;
  if (NET.host) netAll(['pk', S.team, o.id]);
  o.script = null; if (o.onPick) { const f = o.onPick; o.onPick = null; f(S, o); }
  sfxPickup(Math.min(1, o.size / (S.d * PICK_RATIO)));
  S.energy = Math.min(1, S.energy + ENERGY_PICK);
  if (o.kind === 'creature') {
    const sp = o.spec;
    S.attachedCritters++;
    S.army.push(armySpec(o)); setTeamLook(o, S.team);
    for (const t of sp.types) bump(S.counts.type, t, 1);
    bump(S.counts.species, sp.id, 1);
    const key = baseOf(sp).id;
    const e = save.dex[key] || (save.dex[key] = { count: 0, first: S.d });
    const isNew = e.count === 0;
    e.count++; persist();
    cry(sp);
    const runN = (S.runSeen.get(key) || 0) + 1;
    S.runSeen.set(key, runN);
    if (isNew) S.runNew.add(key);
    // the full card is for news: the first of a species this run. Repeats get a small tally at the bottom.
    if (runN === 1 || sp.titan) showDexPop(sp, isNew, e.count);          // a titan always earns the full card
    else showPick(`${sp.name} <span style="opacity:.6">×${runN}</span>`);
  } else {
    showPick(`${o.spec.name} <span style="opacity:.6">${fmtSize(o.size)}</span>`);
  }
  while (S.attached.length > MAX_ON_BALL) ball.remove(S.attached.shift().group);   // the oldest are absorbed for good: still counted, no longer drawn
  seatAll();
  announceUnlocks();
  if (S.mode === 'timed' && LEVEL.targetDiameter > 0 && S.reachedAt === null && S.d >= LEVEL.targetDiameter) {
    S.reachedAt = S.time; sfxWin(); toast('Target size reached — keep rolling!');
    if (!save.best.timedTime || S.time < save.best.timedTime) { save.best.timedTime = S.time; persist(); }
  }
}
function hardHit(nx, nz, vmax, lose = 2) {
  if (S.hitCool > 0) return;
  S.hitCool = 3; S.shake = 0.3; sfxBump();          // three seconds' grace after a knock, so nothing can strip the ball bare
  const sent = [];
  for (let i = 0; i < lose && S.attached.length; i++) {
    const o = S.attached.pop();
    worldGroup.attach(o.group);
    o.group.scale.setScalar(o.size);
    o.on = false; o.cool = 1.2;
    o.fly = { vx: (-nx + rand() - 0.5) * vmax * 0.8, vy: Math.sqrt(20 * S.d) + 0.5, vz: (-nz + rand() - 0.5) * vmax * 0.8 };
    o.by = null; sent.push([o.id, o.fly.vx, o.fly.vy, o.fly.vz]);
    S.vol3 -= o.contrib; S.caught--;
    if (o.kind === 'creature') {
      S.attachedCritters--;
      armyDrop(S.army, o);
      setTeamLook(o, null);
      for (const t of o.spec.types) bump(S.counts.type, t, -1);
      bump(S.counts.species, o.spec.id, -1); o.ai = 'idle'; o.timer = 1.5;
    }
    S.objects.push(o);
  }
  S.vol3 = Math.max(START_D ** 3, S.vol3);
  S.d = Math.cbrt(S.vol3);
  if (sent.length) netAll(['dr', S.team, sent, 1]);
  seatAll();                                          // the ball shrank: re-seat what is left
}
// How far the ball's centre sits above the ground: its radius, or the tip of whichever
// stuck-on object is currently underneath, if that pokes out further. This is the lumpiness.
function lumpSupport(r) {
  downLocal.set(0, -1, 0).applyQuaternion(tmpQ.copy(ball.quaternion).invert());
  let s = r;
  for (const o of S.attached) { const t = o.lump.dot(downLocal); if (t > s) s = t; }
  return Math.min(s, r * LUMP_MAX);
}
// Which way are the tiles the ball cannot enter (too tall a step, or sea while the ball is small)?
const COS8 = [], SIN8 = [], tc = { x: 0, z: 0 };
for (let a = 0; a < 8; a++) { COS8.push(Math.cos(a * Math.PI / 4)); SIN8.push(Math.sin(a * Math.PI / 4)); }
// dx,dz (optional) = the direction of travel: then only tiles ahead count, so walls on both sides cannot cancel out.
function terrainContact(x, z, feet, r, dx = 0, dz = 0) {
  const inSea = T.waterAt(S.x, S.z) === 2;                     // already in the sea: never trapped there
  const lim = feet + Math.max(r * CLIMB, inSea ? 0.75 : 0), noSea = S.d < SEA_MIN_D && !inSea && !MODS.iced;
  let n = 0; tc.x = 0; tc.z = 0;
  for (let a = 0; a < 8; a++) {
    if ((dx || dz) && COS8[a] * dx + SIN8[a] * dz < 0.3) continue;
    const px = x + COS8[a] * r * 0.85, pz = z + SIN8[a] * r * 0.85;
    if (groundAt(px, pz) > lim || (noSea && T.waterAt(px, pz) === 2)) { tc.x += COS8[a]; tc.z += SIN8[a]; n++; }
  }
  return n;
}

// ---------- the same few actions for any ball (the player's S or a CPU's), used by collisions and by events ----------
const allBalls = () => [S, ...rivals];
// What goes into a team's army for a critter: its species, or a copy at the size it was caught at if that was bigger than
// normal (Growth Spurt), so it fights at that size in the arena.
const armySpec = (o) => o.armySpec || (o.armySpec = o.size > o.spec.height * 1.05 ? Object.assign({}, o.spec, { height: Math.round(o.size * 100) / 100, base: baseOf(o.spec), giant: true, _pw: 0 }) : o.spec);
const armyDrop = (army, o) => { const k = army.lastIndexOf(o.armySpec || o.spec); if (k >= 0) army.splice(k, 1); o.armySpec = null; };
// A critter's attack: it rears back for a moment, then lunges at the ball. A hit throws the ball clear and, for a second,
// lets it pass through critters, so a ball boxed in by several of them always gets out.
function startLunge(o, Bq) {
  if (NET.client) { if (Bq === S && o.spec.move !== 'still') NET.lunges.add(o.id); return; }      // the host runs the critters: ask it
  if (o.ai === 'lunge' || o.ai === 'retreat' || o.script || o.spec.move === 'still') return;
  o.ai = 'lunge'; o.lt = 0; o.struck = false; o.lunB = Bq;
  cry(o.spec, 0.04);
}
function strike(Bq, o, nx, nz) {                  // (nx, nz) points from the critter to the ball
  const vm = topSpeed(Bq.d);
  Bq.ghostT = 1.1;
  const k = Math.pow(Bq.d, 0.7);
  for (let i = 0; i < 10; i++) puff(Bq.x - nx * Bq.d / 2, groundAt(Bq.x, Bq.z) + Bq.d * (0.2 + 0.5 * rand()), Bq.z - nz * Bq.d / 2, (nx + rand() - 0.5) * 4 * k, (1 + 2 * rand()) * k, (nz + rand() - 0.5) * 4 * k, 0.35, 0.1 * k, i % 2 ? 0xffffff : 0xffe169, 6 * k);
  if (Bq === S) {
    S.vx = nx * vm * 1.8; S.vz = nz * vm * 1.8; S.charge = 0;
    if (o.size > S.d) hardHit(-nx, -nz, vm, 1);           // only a critter taller than the ball knocks anything off; smaller ones just shove
    else { S.shake = 0.15; sfxBump(); }
  } else if (Bq.remote) {                            // another player's ball: their machine moves it, so send the shove
    Bq.vx = nx * vm * 1.8; Bq.vz = nz * vm * 1.8; Bq.imp.ghost = 1.1; Bq.imp.chg0 = 1;
    if (o.size > Bq.d) rivalKnock(Bq, -nx, -nz, 1); else Bq.imp.bump = 1;
  } else {
    Bq.wander = 1.2; Bq.wh = Math.atan2(nx, nz); Bq.heading = Bq.wh; Bq.v = vm * 1.3; Bq.wind = 0;
    if (o.size > Bq.d) rivalKnock(Bq, -nx, -nz, 1);
  }
}
const pickRatio = (Bq) => PICK_RATIO + (Bq.ratioBonus || 0);
const ballName = (Bq) => `${TOK}N${Bq.team}${TOK}`;        // read as "You" or the team's name by whoever sees it (loc)
function give(Bq, o) { if (o.on || !S.objects.includes(o)) return; if (Bq === S) attach(o); else rivalAttach(Bq, o); }
function knock(Bq, nx, nz, n) { n = Math.max(1, Math.round(n * MODS.knock)); if (Bq === S) hardHit(nx, nz, topSpeed(S.d), n); else rivalKnock(Bq, nx, nz, n); }
function growBall(Bq, vol) {
  Bq.vol3 = Math.max(START_D ** 3, Bq.vol3 + vol); Bq.d = Math.cbrt(Bq.vol3);
  if (Bq === S) seatAll(); else seatOn(Bq.attached, Bq.d / 2);
}
// Takes the newest n things (critters only, if asked) off a ball and stands them on the ground beside it. Returns them.
function takeFrom(Bq, n, crittersOnly) {
  const out = [], sent = [];
  for (let i = Bq.attached.length - 1; i >= 0 && out.length < n; i--) {
    const o = Bq.attached[i];
    if (crittersOnly && o.kind !== 'creature') continue;
    Bq.attached.splice(i, 1);
    worldGroup.attach(o.group);
    o.group.scale.setScalar(o.size); o.group.rotation.set(0, rand() * 6.28, 0);
    const a = rand() * 6.28, rr = Bq.d / 2 + o.size;
    o.group.position.set(Bq.x + Math.cos(a) * rr, groundAt(Bq.x + Math.cos(a) * rr, Bq.z + Math.sin(a) * rr), Bq.z + Math.sin(a) * rr);
    o.on = false; o.cool = 1.5; o.fly = null; o.by = null;
    sent.push([o.id, o.group.position.x, o.group.position.z, o.group.rotation.y]);
    Bq.vol3 -= o.contrib;
    if (Bq === S) S.caught--;
    if (o.kind === 'creature') {
      armyDrop(Bq.army, o);
      setTeamLook(o, null); o.ai = 'idle'; o.timer = 1.5; o.home = [o.group.position.x, o.group.position.z];
      if (Bq === S) { S.attachedCritters--; for (const t of o.spec.types) bump(S.counts.type, t, -1); bump(S.counts.species, o.spec.id, -1); }
    }
    S.objects.push(o); out.push(o);
  }
  if (sent.length) netAll(['tk', Bq.team, sent]);
  growBall(Bq, 0);
  return out;
}
function removeThing(o) { const i = S.objects.indexOf(o); if (i >= 0) S.objects.splice(i, 1); worldGroup.remove(o.group); o.gone = true; S.byId.delete(o.id); netAll(['rm', o.id]); }
const goldMat = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0xd99a00, emissiveIntensity: 0.55 });
// What events (events.js) are given to work with. See the top of events.js for how each is used.
const H = {
  THREE, S, T, MODS, PLACES, BIOMES, B, CREATURES, TITANS, SPECS, TEAMS, STARTS, BOUNDS, P, G, mat, goldMat,
  fx: { add(o) { fx.add(o); if (NET.host) NET.fxRoots.set(o, { key: NET.fxKey++, n: -1, sigs: [] }); }, remove(o) { fx.remove(o); const e = NET.fxRoots.get(o); if (e) { NET.fxRoots.delete(o); netAll(['fxr', e.key]); } } },
  rand: () => rand(), clamp, topSpeed, groundAt, waterAt: T.waterAt, biomeAt, sampleBiome: T.sampleBiome, critterSpot, habOf, baseOf,
  balls: allBalls, isPlayer: (Bq) => Bq === S, isHuman: (Bq) => Bq === S || !!Bq.human, ballName, who: (Bq) => `${TOK}W${Bq.team}${TOK}`, teamOf: (Bq) => TEAMS[Bq.team], pickRatio,
  objects: () => S.objects, time: () => S.time, timeLeft: () => S.timeLeft,
  put: (id, x, z, opt = {}) => { const o = S.spawn.put(id, x, z, opt); if (o && opt.pop !== false) { o.spawnT = 0.9; o.group.scale.setScalar(0.001); } if (o && opt.gold && o.kind === 'creature') o.group.material = goldMat; return o; },
  herd: (sp, at, n, opt) => { const from = S.objects.length, lead = S.spawn.herd(sp, at, n, opt); materialize(from); return S.objects.slice(from); },
  remove: removeThing, give, knock, grow: growBall, takeFrom,
  fling: (o, vx, vy, vz) => { o.fly = { vx, vy, vz }; o.cool = 1; const p = o.group.position; netAll(['fl', o.id, p.x, p.y, p.z, vx, vy, vz]); },
  toast: (m) => { toast(m); netAll(['ts', m]); }, announce: (...a) => { announce(...a); netAll(['an', a]); }, shake: (t = 0.3) => { S.shake = Math.max(S.shake, t); },
  sfx: { tone: (...a) => { tone(...a); netAll(['sx', 0, a]); }, cry: (sp, vol) => { cry(sp, vol); netAll(['sx', 1, [sp.id, vol]]); }, bump: sfxBump, win: sfxWin },
  mark: (id, x, z, opt) => { netAll(['mk', id, x, z, opt || {}]); return mark(id, x, z, opt); }, moveMark: (id, x, z) => { moveMark(id, x, z); if (NET.host) NET.mmDirty.add(id); }, unmark: (id) => { unmark(id); netAll(['um', id]); },
  cpuGoto(x, z, seconds = 20, chance = 0.7) { for (const R of rivals) if (rand() < chance) R.ev = { x, z, until: S.time + seconds }; },
  cpuRelease() { for (const R of rivals) R.ev = null; },
  forecast: () => S.forecast,
  setIce(on) { MODS.iced = on; iceOn = on; if (seaMesh) { seaMesh.material.color.setHex(on ? 0xe4f6fb : 0x3f9be0); seaMesh.material.opacity = on ? 0.93 : 0.72; } },
  setSky(hex) { S.skyOverride = hex; },
};

// ---------- critter behaviour ----------
// temper: timid = bolts early; calm = only moves off when you are close; curious = comes over to look while it is
// too big to roll up; bold = charges and bumps you while it is too big to roll up.
// move: walk, hop, slither on land; swim stays in water; fly and float ignore the terrain; still never moves.
// B is whichever ball is nearest: the player (S) or a CPU. Critters react to all of them alike.
function updateCreature(o, dt, B) {
  const vmax = topSpeed(B.d) * (B === S || B.human ? 1 : CPU_SPEED);
  const sp = o.spec, h = o.size, p = o.group.position;
  const bx = B.x - p.x, bz = B.z - p.z, dist = Math.hypot(bx, bz) || 1e-6;
  if (o.script) { o.script(o, dt, B); if (!o.gone && !o.on) { const air2 = sp.move === 'fly' || sp.move === 'float'; p.y = groundAt(p.x, p.z) + (air2 ? h * 0.3 : Math.abs(Math.sin(S.time * 9 + o.phase)) * h * 0.08); } return; }
  const pickable = !o.noPick && h <= B.d * pickRatio(B), air = sp.move === 'fly' || sp.move === 'float', still = sp.move === 'still';
  let speed = (sp.move === 'fly' ? 1.4 : sp.move === 'slither' ? 0.75 : 0.95) * Math.sqrt(h), ux = 0, uz = 0;
  o.timer -= dt;
  const scare = sp.temper === 'timid' ? 6 * B.d + 4 * h : sp.temper === 'calm' ? 2.2 * B.d + 1.5 * h : 3.5 * B.d + 2.5 * h;
  const busy = o.ai === 'lunge' || o.ai === 'retreat', lure = MODS.lure && !busy && !still;     // Critter Parade: everything walks to the nearest ball
  if (lure) o.ai = 'lure'; else if (o.ai === 'lure') { o.ai = 'idle'; o.timer = 1; }
  if (!busy && !lure && pickable && dist < scare) o.ai = 'flee';
  else if (o.ai === 'flee') { o.ai = 'idle'; o.timer = 1; }
  const notice = !pickable && (o.ai === 'idle' || o.ai === 'walk') && B.d > h * 0.15 && dist < 5 * h + B.d;
  if (notice && sp.temper === 'bold' && B.d < h * 2.5) { o.ai = 'charge'; o.timer = 3; cry(sp, 0.04); }
  else if (notice && sp.temper === 'curious') { o.ai = 'follow'; o.timer = 6; }
  switch (o.ai) {
    case 'flee': ux = -bx / dist; uz = -bz / dist; speed = Math.min(speed * 2.2, vmax * 0.65); break;
    case 'charge':
      ux = bx / dist; uz = bz / dist; speed *= 2.4;
      if (o.timer <= 0 || dist > 8 * h + B.d) { o.ai = 'rest'; o.timer = 3; }
      if (dist < B.d / 2 + o.rad + h * 0.7) startLunge(o, B);       // close enough: attack
      break;
    case 'lure': if (dist > B.d / 2 + o.rad * 0.6) { ux = bx / dist; uz = bz / dist; speed *= 1.7; } break;
    case 'lunge': {                                 // rear back (0.4 s), spring at the ball (0.2 s), then back off
      const Lb = o.lunB || B, lx = Lb.x - p.x, lz = Lb.z - p.z, ld = Math.hypot(lx, lz) || 1e-6;
      o.lt += dt; o.yaw = Math.atan2(lx, lz);
      if (o.lt < 0.4) { ux = -lx / ld; uz = -lz / ld; speed = h * 0.8; }
      else if (o.lt < 0.6) {
        ux = lx / ld; uz = lz / ld; speed = h * 5 + 3;
        if (!o.struck && ld < Lb.d / 2 + o.rad + h * 0.6) { o.struck = true; strike(Lb, o, lx / ld, lz / ld); }
      } else { o.ai = 'retreat'; o.timer = 1.6; }
      break;
    }
    case 'retreat': ux = -bx / dist; uz = -bz / dist; speed *= 1.6; if (o.timer <= 0) { o.ai = 'rest'; o.timer = 4; } break;
    case 'follow':                                  // trots after the ball, keeping a little distance
      if (dist > 1.6 * (h + B.d)) { ux = bx / dist; uz = bz / dist; speed *= 1.5; }
      if (o.timer <= 0 || dist > 9 * h + 2 * B.d) { o.ai = 'rest'; o.timer = 2; }
      break;
    case 'rest': if (o.timer <= 0) o.ai = 'idle'; break;
    case 'walk': {
      const tx = o.tx - p.x, tz = o.tz - p.z, td = Math.hypot(tx, tz);
      if (td < h * 0.3 || o.timer <= 0) { o.ai = 'idle'; o.timer = 1 + rand() * 3; } else { ux = tx / td; uz = tz / td; }
      break;
    }
    default:
      if (o.timer <= 0) {
        const lead = o.leader && !o.leader.on ? o.leader.group.position : null;
        const ax = lead ? lead.x : o.home[0], az = lead ? lead.z : o.home[1];
        const R = (lead ? 1.5 : 3) * h + 1, a = rand() * Math.PI * 2;
        o.tx = ax + Math.cos(a) * R * rand(); o.tz = az + Math.sin(a) * R * rand();
        o.ai = 'walk'; o.timer = 6;
      }
  }
  const moving = !still && (ux !== 0 || uz !== 0);
  if (moving) {
    const nx = clamp(p.x + ux * speed * dt, BOUNDS.x1 + 5, BOUNDS.x2 - 5);
    const nz = clamp(p.z + uz * speed * dt, BOUNDS.z1 + 5, BOUNDS.z2 - 5);
    const rise = groundAt(nx, nz) - groundAt(p.x, p.z), w = T.waterAt(nx, nz);
    // fliers go anywhere; swimmers keep to water; the rest manage small steps, hop down ledges, and stay out of the sea
    const can = air ? true : sp.move === 'swim' ? w !== 0 : (w !== 2 && rise <= Math.max(0.05, h * 0.25) && -rise <= h * 1.5);
    if (can) { p.x = nx; p.z = nz; }
    else if (o.ai === 'walk') { o.ai = 'idle'; o.timer = 0.5; }
  }
  const wob = S.time * (sp.move === 'hop' ? 9 : 7) + o.phase;
  let lift = 0;
  if (sp.move === 'fly') lift = h * (0.5 + 0.1 * Math.sin(S.time * 3 + o.phase));
  else if (sp.move === 'float') lift = h * (0.18 + 0.07 * Math.sin(S.time * 2 + o.phase));
  else if (sp.move === 'swim') lift = T.waterAt(p.x, p.z) === 2 ? Math.max(0, SEA_LEVEL - h * 0.55 - groundAt(p.x, p.z)) : 0;
  else if (moving) lift = Math.abs(Math.sin(wob)) * h * (sp.move === 'hop' ? 0.22 : sp.move === 'slither' ? 0 : 0.06);
  p.y = groundAt(p.x, p.z) + lift;
  if (moving && o.ai !== 'lunge') o.yaw = Math.atan2(ux, uz);
  const tip = o.ai === 'lunge' ? (o.lt < 0.4 ? -0.45 * (o.lt / 0.4) : 0.6) : 0;          // leans back to wind up, then pitches forward into the lunge
  if (o.yaw !== undefined) o.group.rotation.set(tip, o.yaw + (moving && sp.move === 'slither' ? Math.sin(wob) * 0.35 : 0), moving && !air ? Math.sin(wob) * 0.09 : 0);
}

// ---------- rivals: three CPU players rolling their own balls on the same map ----------
const rivals = [];
function makeRivals() {
  for (const R of rivals) { scene.remove(R.ball); scene.remove(R.trainer); }
  for (let i = 0; i < TEAMS.length; i++) $('tag' + i).style.display = 'none';
  rivals.length = 0;
  if (S.mode !== 'timed') return;
  const wedges = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => rand() - 0.5);
  for (let i = 0; i < TEAMS.length; i++) {
    if (i === S.team) continue;
    const [x, z] = STARTS[i], ballG = new THREE.Group(), coreG = buildCaptureBall(i, false);
    ballG.add(coreG); scene.add(ballG);
    const figure = buildTrainer(TEAMS[i].hex); scene.add(figure);
    const y = groundAt(x, z) + START_D / 2, heading = Math.atan2(-x, -z);
    // remote: the ball is moved by another machine (a player's, as the host sees it; everybody's, as a client sees them)
    const R = { team: i, x, z, y, d: START_D, vol3: START_D ** 3, heading, v: 0, ball: ballG, core: coreG, trainer: figure,
      attached: [], army: [], hitCool: 0, retarget: rand(), target: null, chasing: null, avoid: new Set(), wander: 0, wh: 0, lastX: x, lastZ: z, stuckT: 3,
      wedge: wedges[i], dash: true, dashUntil: 14, boostT: 0, stallT: 0, ev: null, energy: 1, wind: 0,
      human: seatHuman(i), remote: NET.client || (NET.host && seatHuman(i)), nx: x, ny: y, nz: z, nh: heading, rvx: 0, rvz: 0, nb: 0, chg: 0, nAge: 0, ren: 1, imp: null, impCool: 0 };
    if (R.remote && NET.host) {                     // the host cannot push another player's ball itself: writing its velocity or energy queues a message to them
      const want = (r) => { const m = r.imp || (r.imp = {}); if (m.vx === undefined) { m.vx = r.rvx; m.vz = r.rvz; } return m; };
      Object.defineProperty(R, 'vx', { configurable: true, get() { return this.rvx; }, set(v) { want(this).vx = v; } });
      Object.defineProperty(R, 'vz', { configurable: true, get() { return this.rvz; }, set(v) { want(this).vz = v; } });
      Object.defineProperty(R, 'energy', { configurable: true, get() { return this.ren; }, set(v) { (this.imp || (this.imp = {})).energy = v; } });
    }
    rivals.push(R);
  }
}
const rivalOf = (t) => rivals.find((R) => R.team === t);
const ballOf = (t) => (t === S.team ? S : rivalOf(t));
function rivalAttach(R, o) {
  stick(R.ball, o, R.x, R.y, R.z, R.d / 2);
  o.contrib = growthOf(R, o);
  R.vol3 += o.contrib; R.d = Math.cbrt(R.vol3);
  { const i = S.objects.indexOf(o); if (i >= 0) S.objects.splice(i, 1); }
  R.attached.push(o); o.by = R.team; if (!R.remote) R.energy = Math.min(1, R.energy + ENERGY_PICK);
  if (NET.host) netAll(['pk', R.team, o.id]);
  o.script = null; if (o.onPick) { const f = o.onPick; o.onPick = null; f(R, o); }
  if (o.kind === 'creature') { R.army.push(armySpec(o)); setTeamLook(o, R.team); }
  while (R.attached.length > MAX_ON_BALL) R.ball.remove(R.attached.shift().group);
  seatOn(R.attached, R.d / 2);
}
function rivalKnock(R, nx, nz, lose) {            // things fly off in direction (-nx,-nz)
  if (R.hitCool > 0) return;
  R.hitCool = 3;
  const sp = topSpeed(R.d), sent = [];
  for (let i = 0; i < lose && R.attached.length; i++) {
    const o = R.attached.pop();
    worldGroup.attach(o.group);
    o.group.scale.setScalar(o.size);
    o.on = false; o.cool = 1.2;
    o.fly = { vx: (-nx + rand() - 0.5) * sp * 0.8, vy: Math.sqrt(20 * R.d) + 0.5, vz: (-nz + rand() - 0.5) * sp * 0.8 };
    o.by = null; sent.push([o.id, o.fly.vx, o.fly.vy, o.fly.vz]);
    R.vol3 -= o.contrib;
    if (o.kind === 'creature') { armyDrop(R.army, o); setTeamLook(o, null); o.ai = 'idle'; o.timer = 1.5; }
    S.objects.push(o);
  }
  R.vol3 = Math.max(START_D ** 3, R.vol3); R.d = Math.cbrt(R.vol3);
  if (sent.length) netAll(['dr', R.team, sent, 1]);
  seatOn(R.attached, R.d / 2);
}
// Roll up, or be stopped by, whatever a rival's ball touches. (Another player's ball rolls things up on its own machine
// and asks the host, see `claim`; here it only bumps things.)
function rivalContacts(R) {
  const r = R.d / 2;
  for (let i = S.objects.length - 1; i >= 0; i--) {
    const o = S.objects[i];
    if (o.fly) continue;
    const p = o.group.position, ox = p.x - R.x, oz = p.z - R.z, dist = Math.hypot(ox, oz), reach = R.d / 2 + o.rad;
    if (dist >= reach || R.y - r > p.y + o.size || R.y + r < p.y) continue;
    if (!o.noPick && o.size <= R.d * pickRatio(R)) { if (o.cool <= 0 && !R.remote) rivalAttach(R, o); continue; }
    if (o.spec.flat) continue;
    if (o.onBump && o.cool <= 0) o.onBump(R, o);
    if (o.kind === 'creature' && R.ghostT > 0) continue;       // just thrown clear by a lunge: passes through critters for a moment
    if (!R.remote) { R.x -= ox / (dist || 1) * (reach - dist); R.z -= oz / (dist || 1) * (reach - dist); }
    if (o.kind === 'creature' && o.ai === 'charge') startLunge(o, R);
  }
}
function rivalRender(R, dt) {
  const r = R.d / 2, hx = Math.sin(R.heading), hz = Math.cos(R.heading);
  const vx = R.remote ? R.rvx : hx * R.v, vz = R.remote ? R.rvz : hz * R.v, sp = Math.hypot(vx, vz);
  if (sp > 1e-4) { rollAxis.set(vz / sp, 0, -vx / sp); tmpQ.setFromAxisAngle(rollAxis, sp * dt / r); R.ball.quaternion.premultiply(tmpQ); }
  R.ball.position.set(R.x, R.y, R.z);
  const th = trainerHeight(R.d), fx2 = R.x - hx * (r + th * 0.32), fz = R.z - hz * (r + th * 0.32);
  let fy = groundAt(fx2, fz); if (Math.abs(fy - (R.y - r)) > Math.max(r, th * 0.4)) fy = R.y - r;
  R.trainer.scale.setScalar(th); R.trainer.position.set(fx2, fy, fz); R.trainer.rotation.y = R.heading;
  poseTrainer(R.trainer, S.time + R.team, sp > 0.25);
  R.core.scale.setScalar(r);
}
// A ball that another machine is steering: glide to where it was last reported, carried on by its speed in between.
function puppetRival(R, dt) {
  R.nAge += dt; R.impCool = Math.max(0, R.impCool - dt);
  if (R.nAge < 0.5) { R.nx += R.rvx * dt; R.nz += R.rvz * dt; }
  const k2 = 1 - Math.exp(-10 * dt);
  if (Math.hypot(R.nx - R.x, R.nz - R.z) > 40) { R.x = R.nx; R.z = R.nz; R.y = R.ny; }
  R.x += (R.nx - R.x) * k2; R.z += (R.nz - R.z) * k2; R.y += (R.ny - R.y) * k2;
  let dh = R.nh - R.heading; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
  R.heading += dh * k2;
  R.v = Math.hypot(R.rvx, R.rvz); R.boostT = R.nb ? 0.2 : 0;
  aimArrow(R, R.chg);
  if (R.chg > 0) { chargeFx(R, R.chg, dt); rollAxis.set(Math.cos(R.heading), 0, -Math.sin(R.heading)); tmpQ.setFromAxisAngle(rollAxis, (6 + 22 * R.chg) * dt); R.ball.quaternion.premultiply(tmpQ); }
  else if (R.nb) trailFx(R, dt);
  if (NET.host) rivalContacts(R);
  rivalRender(R, dt);
}
const velOf = (b) => (b === S ? [S.vx, S.vz] : b.remote ? [b.rvx, b.rvz] : [Math.sin(b.heading) * b.v, Math.cos(b.heading) * b.v]);
function rebound(b, ux, uz, closing, vx, vz) {       // after a bump: (ux, uz) points away from the other ball
  if (b === S) { S.vx += ux * closing * 1.2; S.vz += uz * closing * 1.2; }
  else if (b.remote) { if (b.impCool <= 0) { b.impCool = 0.25; b.vx = vx + ux * closing * 1.2; b.vz = vz + uz * closing * 1.2; b.imp.bump = 1; } }
  else { b.v *= -0.4; b.wander = 1; b.wh = Math.atan2(ux, uz); }
}
function updateRivals(dt, frozen) {
  const humans = allBalls().filter((b) => b === S || b.human);
  const humanD = Math.exp(humans.reduce((n, b) => n + Math.log(b.d), 0) / humans.length);      // CPUs pace themselves against the players (the middle of their sizes)
  for (const R of rivals) {
    R.hitCool = Math.max(0, R.hitCool - dt); R.ghostT = Math.max(0, (R.ghostT || 0) - dt);
    R.stallT = Math.max(0, R.stallT - dt); R.boostT = Math.max(0, R.boostT - dt);
    if (R.remote) { puppetRival(R, dt); continue; }
    if (!frozen) R.energy = Math.min(1, R.energy + dt / ENERGY_FILL * MODS.energy);
    const band = clamp(1.04 - DIFF.band * Math.log2(R.d / humanD), DIFF.floor, 1.08);     // a CPU well ahead of the player eases off; one behind hurries
    const r = R.d / 2, vmax = frozen || R.stallT > 0 ? 0 : topSpeed(R.d) * MODS.speed * CPU_SPEED * band * (R.boostT > 0 ? dashMult(R.d) * 0.95 : R.wind > 0 ? CHARGE_CRAWL : 1), g0 = groundAt(R.x, R.z);
    // choose what to chase: the nearest thing it can roll up on its own level, preferring critters
    R.retarget -= dt;
    if (R.wander > 0) { R.wander -= dt; R.target = null; }
    else if (R.retarget <= 0) {
      R.retarget = (0.45 + rand() * 0.3) * DIFF.think;                 // CPUs dither: they only look for a new target every second or two
      let best = null, bd = 1e9;
      for (const o of S.objects) {
        if (o.fly || o.cool > 0 || o.noPick || o.size > R.d * pickRatio(R) || o.size < R.d * 0.08 || R.avoid.has(o)) continue;
        const p = o.group.position, worth = 0.35 + o.size / (R.d * PICK_RATIO);       // bigger pickups are worth a longer trip
        const d = Math.hypot(p.x - R.x, p.z - R.z) * (o.kind === 'creature' ? 0.6 : 1) / worth;
        if (d < bd && d < (60 + R.d * 6) / worth && groundAt(p.x, p.z) - g0 < R.d * 0.4 && (R.d >= SEA_MIN_D || MODS.iced || T.waterAt(p.x, p.z) !== 2)) { bd = d; best = o; }
      }
      R.target = best; if (best) R.chasing = best;
      if (!best) { R.wander = 3; R.wh = rand() * 6.28; }
    }
    const tp = R.target && !R.target.on ? R.target.group.position : null;
    // the opening dash for the feast; then wherever an event calls it; otherwise the habitat that suits its size
    if (R.dash && (Math.hypot(R.x, R.z) < 5 || S.time > R.dashUntil)) R.dash = false;
    const evg = R.ev && S.time < R.ev.until && Math.hypot(R.ev.x - R.x, R.ev.z - R.z) > R.d + 2 ? [R.ev.x, R.ev.z] : null;
    const goal = R.wander > 0 ? null : R.dash ? PLACES.feast : evg || routeGoal(R, R.x, R.z, R.d, dt);
    let diff = (goal ? Math.atan2(goal[0] - R.x, goal[1] - R.z) : tp ? Math.atan2(tp.x - R.x, tp.z - R.z) : R.wh) - R.heading;
    while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
    const hf = heft(R.d), turnR = 2.6 * Math.sqrt(hf) * (R.wind > 0 ? CHARGE_STEER : 1) * dt;
    R.heading += clamp(diff, -turnR, turnR);
    const clear = Math.abs(diff) < 0.2 && (goal || (tp && Math.hypot(tp.x - R.x, tp.z - R.z) > R.d * 5));     // lined up with a long run ahead: sprint
    // the charge dash: with a clear run ahead and energy to spare it winds up (crawling), then bursts
    const windC = R.wind > 0 ? 0.65 * (1 - R.wind / (CHARGE_TIME * 0.65)) : 0;
    aimArrow(R, windC);
    if (R.wind > 0) { chargeFx(R, windC, dt); rollAxis.set(Math.cos(R.heading), 0, -Math.sin(R.heading)); tmpQ.setFromAxisAngle(rollAxis, (6 + 22 * windC) * dt); R.ball.quaternion.premultiply(tmpQ); }
    else if (R.boostT > 0 && !frozen) trailFx(R, dt);
    if (R.wind > 0) { R.wind -= dt; if (R.wind <= 0) { burstFx(R, 0.65); R.boostT = burstTime(0.65) * dashLast(R.d); R.v = Math.max(R.v, topSpeed(R.d) * CPU_SPEED * dashMult(R.d) * burstKick(0.65)); } }
    else if (clear && !frozen && R.boostT <= 0 && R.energy >= 0.7 && rand() < DIFF.dash * dt) { R.wind = CHARGE_TIME * 0.65; R.energy -= 0.65; }
    R.v += ((Math.abs(diff) < 1 ? vmax : vmax * 0.35) - R.v) * (1 - Math.exp(-DRIVE * (R.boostT > 0 ? 3 * Math.sqrt(hf) : hf) * dt));
    const hx = Math.sin(R.heading), hz = Math.cos(R.heading);
    const nx = clamp(R.x + hx * R.v * dt, BOUNDS.x1 + 5, BOUNDS.x2 - 5), nz = clamp(R.z + hz * R.v * dt, BOUNDS.z1 + 5, BOUNDS.z2 - 5);
    const px = nx + hx * r * 0.8, pz = nz + hz * r * 0.8;
    if (groundAt(px, pz) - g0 > r * CLIMB || (R.d < SEA_MIN_D && !MODS.iced && T.waterAt(px, pz) === 2 && T.waterAt(R.x, R.z) !== 2)) {
      R.v *= -0.3; R.wander = 1.5; R.wh = R.heading + (rand() < 0.5 ? 1 : -1) * (1.2 + rand());      // blocked: turn away
    } else { R.x = nx; R.z = nz; }
    R.stuckT -= dt;
    if (R.stuckT <= 0) { R.stuckT = 3; if (Math.hypot(R.x - R.lastX, R.z - R.lastZ) < R.d * 0.5 + 0.3) { if (R.chasing) R.avoid.add(R.chasing); R.wander = 3; R.wh = rand() * 6.28; } R.lastX = R.x; R.lastZ = R.z; }   // stuck: give up on that thing for good
    R.y += (groundAt(R.x, R.z) + r - R.y) * Math.min(1, 10 * dt);
    rivalContacts(R);
    rivalRender(R, dt);
  }
  if (NET.client) return;                               // the host decides who bumped whom
  // bumps: balls bounce apart, and whichever carries less momentum drops a couple of things for anyone to grab
  const all = allBalls();
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
    const A = all[a], Bv = all[b], far = A.remote || Bv.remote ? 1.07 : 1;       // a player's own machine keeps their ball out of the others, so allow a little slack
    const dx = Bv.x - A.x, dz = Bv.z - A.z, dist = Math.hypot(dx, dz) || 0.001, reach = (A.d + Bv.d) / 2;
    if (dist >= reach * far || Math.abs(Bv.y - A.y) > reach) continue;
    const nx = dx / dist, nz = dz / dist, push = Math.max(0, reach - dist) / 2;
    const [avx, avz] = velOf(A), [bvx, bvz] = velOf(Bv);
    const closing = (avx - bvx) * nx + (avz - bvz) * nz;
    // shove them apart, but never through a wall or up a step either could not climb on its own
    const shove = (x, z, d, sx, sz) => { const k2 = Math.min(push, d * 0.15); return groundAt(x + sx * k2, z + sz * k2) - groundAt(x, z) <= d * 0.2 ? [x + sx * k2, z + sz * k2] : [x, z]; };
    if (!A.remote) [A.x, A.z] = shove(A.x, A.z, A.d, -nx, -nz);
    if (!Bv.remote) [Bv.x, Bv.z] = shove(Bv.x, Bv.z, Bv.d, nx, nz);
    if (closing < 0.5) continue;
    const ma = A.d ** 3 * (Math.hypot(avx, avz) + 0.5), mb = Bv.d ** 3 * (Math.hypot(bvx, bvz) + 0.5);
    const hitter = ma >= mb ? A : Bv;                                          // a ball in mid-burst knocks twice as much loose
    knock(ma >= mb ? Bv : A, ma >= mb ? -nx : nx, ma >= mb ? -nz : nz, KNOCK_LOSS * (hitter.boostT > 0 ? 2 : 1));
    if (A === S || Bv === S) { S.shake = 0.2; sfxBump(); }
    rebound(A, -nx, -nz, closing, avx, avz); rebound(Bv, nx, nz, closing, bvx, bvz);
  }
}

// Name tags: each CPU has its name over its ball while it is on screen, and an arrow at the screen edge when it is not.
const tagV = new V3();
function updateTags() {
  for (const R of rivals) {
    const el = $('tag' + R.team), tm = TEAMS[R.team];
    tagV.set(R.x, R.y + R.d / 2 + Math.max(0.35, R.d * 0.3), R.z).project(camera);
    const behind = tagV.z > 1, dist = Math.hypot(R.x - S.x, R.z - S.z);
    let sx = (tagV.x * 0.5 + 0.5) * innerWidth, sy = (-tagV.y * 0.5 + 0.5) * innerHeight;
    if (!behind && sx > 40 && sx < innerWidth - 40 && sy > 40 && sy < innerHeight - 40) {
      el.className = 'tag'; el.innerHTML = `${tm.name} · ${fmtSize(R.d)}<i>▼</i>`;
    } else {
      let dx = tagV.x, dy = -tagV.y; if (behind) { dx = -dx; dy = -dy; }
      const a = Math.atan2(dy, dx), m = 56, hw = innerWidth / 2 - m, hh = innerHeight / 2 - m;
      const kx = Math.min(hw / Math.abs(Math.cos(a) || 1e-6), hh / Math.abs(Math.sin(a) || 1e-6));
      sx = innerWidth / 2 + Math.cos(a) * kx; sy = innerHeight / 2 + Math.sin(a) * kx;
      el.className = 'tag edge'; el.innerHTML = `<b style="display:inline-block;transform:rotate(${(a + Math.PI / 2).toFixed(2)}rad)">▲</b> ${tm.name} ${Math.round(dist)} m`;
    }
    el.style.display = 'block'; el.style.left = sx.toFixed(0) + 'px'; el.style.top = sy.toFixed(0) + 'px'; el.style.background = tm.css;
  }
}

// ---------- after the round: the wheel picks an arena, then the armies and the four balls fight in it (arena.js) ----------
let ARENA = null, battle = null, wheel = null, battleHold = 0;
import('./arena.js').then((m) => { ARENA = m; }).catch((e) => console.warn('arena.js did not load; using the plain battle', e));
const winnerText = (w) => (w < 0 ? 'Nobody is left standing' : w === S.team ? 'You win!' : `${TEAMS[w].name} team wins!`);
// human: steered by a player (the fight treats it so on every machine); me: this player's own team (for "You" and the arrow)
const battleTeams = () => TEAMS.map((tm, i) => { const b = ballOf(i); return Object.assign({}, tm, { army: (b ? b.army : []).slice(), ballD: b ? b.d : START_D, human: seatHuman(i), me: i === S.team }); });
// In multiplayer every machine must start the fight from exactly the same armies, so the host sends them and everyone
// (the host included) builds the teams from that.
// (An army is sent as runs of the same critter: [species, giant height or 0, how many].)
const packTeams = (teams) => teams.map((tm) => {
  const a = [];
  for (const sp of tm.army) { const h = sp.giant ? sp.height : 0, last = a[a.length - 1]; if (last && last[0] === sp.id && last[1] === h) last[2]++; else a.push([sp.id, h, 1]); }
  return { d: tm.ballD, h: tm.human ? 1 : 0, a };
});
const unpackTeams = (packed) => TEAMS.map((tm, i) => Object.assign({}, tm, { ballD: packed[i].d, human: !!packed[i].h, me: i === S.team,
  army: packed[i].a.filter(([id]) => SPECS[id]).flatMap(([id, h, n]) => { const sp = SPECS[id].spec, one = h ? Object.assign({}, sp, { height: h, base: baseOf(sp), giant: true, _pw: 0 }) : sp; return new Array(n || 1).fill(one); }) }));
function buildBallFor(k) { return buildCaptureBall(k, k === S.team); }
// Before the fight every army merges (arena-merge.js): three of a kind become the next stage of their line. It is
// worked out as the wheel starts, from the armies and the arena alone, so every machine gets the same answer and
// the local build can fetch the models it will need while the wheel spins.
const specByDex = new Map(CREATURES.map((sp) => [sp.dex, sp])), specOf = (dex) => specByDex.get(dex);
function planBattle(teams, arena) {
  S.battlePlans = null;
  if (!ARENA || !ARENA.planTeams || !arena) return;
  const plans = ARENA.planTeams(teams, arena, specOf), dexes = new Set();
  for (const p of plans) { for (const r of p.roster) dexes.add(baseOf(r.spec).dex); for (const m of p.merges) { dexes.add(baseOf(m.from).dex); dexes.add(baseOf(m.to).dex); } }
  LOCAL.preload([...dexes]);
  S.battlePlans = { arena, plans };
}
// The arena is decided when the round starts (so the oracle can hint at it); the wheel only reveals it.
function pickArenas() {
  S.forecast = null;
  if (!ARENA || NET.client) return;
  const list = ARENA.ARENAS, pick = Math.floor(rand() * list.length);
  S.forecast = { arenas: list, pick, arena: list[pick] };
}
const ORACLE = { id: 'oracle', name: "Oracle's Whisper", quiet: true, duration: 10, color: '#c9a6ff', ok: () => !!S.forecast,
  start(H2, ev) {
    const f = S.forecast, truth = rand() < 0.8, others = f.arenas.filter((a) => a !== f.arena), a = truth ? f.arena : others[Math.floor(rand() * others.length)];
    ev.tag = 'Arena favours ' + a.types.map((t) => `<i style="background:${TYPE_COLORS[t] || '#888'}">${t}</i>`).join(' ') + ' &nbsp;<small>(4 in 5)</small>';
    S.oracleSaid = a;
  } };
function timeUp() {
  if (S.state === 'timeup') return;
  netAll(['tu']); S.menuOpen = false; show(null);
  endEvent(); clearFx(); music.stop();
  MODS.knock = 1; MODS.fog = 1; MODS.energy = 1; MODS.speed = 1; MODS.lure = false; H.setIce(false); S.skyOverride = null;
  for (const R of rivals) R.ev = null;
  S.state = 'timeup'; S.tuT = 0; S.timeLeft = 0; S.tuSaid = false;
  if (document.pointerLockElement) document.exitPointerLock();
  showCount('TIME UP!', 'timeup');
  [1568, 1568, 1568].forEach((f, i) => tone(f, f * 0.97, i === 2 ? 0.7 : 0.16, 'square', 0.14, i * 0.22));
  updateHud();
}
function tickTimeUp(dt) {
  S.tuT += dt;
  update(dt);
  if (S.tuT > 2.6 && !NET.client) startWheel();        // (a client waits for the host's armies)
  if (NET.client && S.tuT > 8 && !S.tuSaid) { S.tuSaid = true; toast('Waiting for the host…'); }
}
function startWheel(net = null) {            // net: the armies and the arena the host sent (multiplayer clients)
  $('count').className = '';
  let teams;
  if (NET.client) { teams = unpackTeams(net.teams); if (ARENA) S.forecast = { arenas: ARENA.ARENAS, pick: net.pick, arena: ARENA.ARENAS[net.pick] }; }
  else if (NET.host) { const packed = packTeams(battleTeams()); teams = unpackTeams(packed); netAll(['wh', { teams: packed, pick: S.forecast ? S.forecast.pick : 0 }]); }
  else teams = battleTeams();
  S.battleTeams = teams;
  NET.aSteps = []; NET.aEnd = null; NET.aAcc = 0; NET.aSent = ''; NET.aLatest = []; NET.arenaIn = []; NET.battleSeed = 0;
  if (!teams.some((t) => t.army.length)) { S.battleResult = { winner: -1, mvp: null }; S.battleStatus = teams.map(() => ({ alive: 0, all: 0, hp: 0 })); finish(); return; }
  if (!ARENA || !S.forecast) { startBattle(null); return; }
  S.state = 'wheel'; show('battle');
  planBattle(teams, S.forecast.arena);
  wheel = ARENA.createWheel({ arenas: S.forecast.arenas, pickIndex: S.forecast.pick, teams, plans: S.battlePlans && S.battlePlans.plans, sfx: { tone, cry } });
}
function tickWheel(dt) {
  wheel.step(dt);
  if (wheel.done && (!NET.client || NET.battleSeed)) { const arena = wheel.arena || S.forecast.arena; wheel.destroy(); wheel = null; startBattle(arena); }   // (a client starts when the host does)
}
function startBattle(arena) {
  const teams = NET.on ? S.battleTeams : battleTeams();
  if (NET.host) { NET.battleSeed = 1 + ((Math.random() * 2 ** 30) | 0); netAll(['ba', NET.battleSeed]); }
  S.battleTeams = teams; S.battleResult = null; S.battleStatus = null; S.battleArena = arena;
  S.state = 'battle';
  show('battle');
  const buildMesh = (spec, k) => { const m = buildCreature(spec); m.material = teamMats[k]; return m; };
  if (ARENA && arena) {
    // a fighter is the generated critter in its team's colour, or (local build) its model once that has loaded
    const buildActor = (spec, k) => LOCAL.arenaActor(baseOf(spec).dex, buildMesh(spec, k));
    const plans = S.battlePlans && S.battlePlans.arena === arena ? S.battlePlans.plans : undefined;
    battle = ARENA.createBattle({ arena, teams, specOf, plans, buildActor, buildBall: buildBallFor, buildTrainer: (k) => buildTrainer(TEAMS[k].hex), poseTrainer, sfx: { tone, cry },
      input: NET.on ? (k) => NET.arenaIn[k] : readStick, rand: NET.on ? seeded(NET.battleSeed) : undefined, noSkip: NET.on });
    battle.modern = true;
    if (battle.resize) battle.resize(innerWidth / innerHeight);
  } else {
    battle = createBattle({ teams, buildMesh });
    battle.camera.aspect = innerWidth / innerHeight; battle.camera.updateProjectionMatrix();
    $('battleui').style.display = 'block';
  }
  battleHold = 0;
}
function tickBattle(dt) {
  if (battle.modern) {                          // the arena's music follows the fight: waiting, fighting, sudden death
    const ph = battle.phase;
    music.fight(ph === 'fight' ? (battle.sim.ramp > 1 ? 2 : 1) : ph === 'finish' || ph === 'done' ? -1 : 0);
    music.tick();
  }
  if (NET.on && battle.modern) { tickBattleNet(dt); return; }
  if (battle.modern) {
    // Skipping takes a held key (Enter, or Y on a pad), so a tap meant for the dash can never throw the fight away.
    const pad = readPad(), want = k('Enter', 'NumpadEnter') || !!(pad && pad.buttons[3] && pad.buttons[3].pressed);
    S.skipHold = want ? (S.skipHold || 0) + dt : 0;
    if (battle.skipHold) battle.skipHold(S.skipHold / SKIP_HOLD);
    if (S.skipHold >= SKIP_HOLD) { S.skipHold = 0; skipBattle(); return; }
  }
  battle.step(dt);
  if (battle.modern) { if (battle.finished) endBattle(); return; }
  const st = battle.status();
  $('battlebars').innerHTML = S.battleTeams.map((tm, k) => `<div class="bb"><span class="dot" style="background:${tm.css}"></span><b>${seatLabel(k)}</b><div class="hpbar"><i style="width:${(st[k].hp * 100).toFixed(0)}%;background:${tm.css}"></i></div><span>${st[k].alive}/${st[k].all}</span></div>`).join('');
  $('battlebanner').textContent = battle.intro > 0 ? `Battle in ${Math.ceil(battle.intro)}…` : battle.finished ? winnerText(battle.result().winner) : '';
  if (battle.finished) { battleHold += dt; if (battleHold > 3.5) endBattle(); }
}
function endBattle(given = null) {            // given: the host's result (multiplayer clients show that, whatever their own copy says)
  if (!battle) return;
  S.battleResult = given ? given[0] : battle.result(); S.battleStatus = given ? given[1] : battle.status();
  if (battle.destroy) battle.destroy();
  battle = null; music.fight(-1);
  $('battleui').style.display = 'none';
  finish();
}
const SKIP_HOLD = 0.7;                        // seconds Enter is held to skip the arena fight
function skipBattle() { if (battle && !NET.on) { battle.skip(); endBattle(); } return S.battleResult; }
S.skipBattle = skipBattle;
function battleRows() {
  const res = S.battleResult, st = S.battleStatus;
  if (!res || !st) return '';
  let h = S.battleArena ? `<tr><td>Arena</td><td>${S.battleArena.name} (favours ${S.battleArena.types.join(', ')})</td></tr>` : '';
  h += S.battleTeams.map((tm, k) => `<tr><td><span class="dot" style="background:${tm.css}"></span> ${k === S.team ? 'You' : tm.name + (tm.human ? '' : ' (CPU)')}${res.winner === k ? ' ★' : ''}</td><td>${st[k].brought !== undefined ? `${st[k].brought} critter${st[k].brought === 1 ? '' : 's'}${st[k].merged < st[k].brought ? ` merged into ${st[k].merged}` : ''}, ${st[k].alive} left standing${st[k].ballOut ? ', ball lost' : ''}` : `${st[k].all} fought, ${st[k].alive} left standing`}</td></tr>`).join('');
  if (res.rallies && res.ringOuts) { const me = S.team, n = (v, one, many) => `${v} ${v === 1 ? one : many}`; h += `<tr><td>Your ball in the arena</td><td>${n(res.ringOuts[me], 'monster', 'monsters')} rammed off the edge, ${n(res.rallies[me], 'rally', 'rallies')}</td></tr>`; }
  if (res.mvp) h += `<tr><td>Top fighter</td><td>${res.mvp.name} (${res.mvp.team === S.team ? 'yours' : TEAMS[res.mvp.team].name}), ${res.mvp.kills} knock-outs</td></tr>`;
  if (res.timedOut) h += '<tr><td colspan="2">Decided on remaining health after the time limit.</td></tr>';
  return h;
}

// ---------- waves: new critters each minute, and everything back for the last half minute ----------
function materialize(from) {                 // things added since index `from` grow in from nothing
  for (let i = from; i < S.objects.length; i++) { const o = S.objects[i]; o.spawnT = 0.9 + rand() * 0.6; o.group.scale.setScalar(0.001); }
}
function spawnWave() {
  const from = S.objects.length;
  for (const sp of CREATURES) {
    const [groups, per] = RARITY[sp.rarity] || [1, 1];
    const want = groups * WAVE_SHARE * (sp.height <= 0.45 ? 0.6 : 1.2), n = Math.floor(want) + (rand() < want % 1 ? 1 : 0);
    for (let k = 0; k < n; k++) S.spawn.herd(sp, critterSpot(sp), per);
  }
  const added = S.objects.length - from;
  materialize(from);
  S.critters += added;
  [392, 523, 659].forEach((f, i) => tone(f, f * 1.5, 0.2, 'sine', 0.12, i * 0.09));
  return added;
}
// The last 45 seconds: one giant of every species, far out in its habitat (town critters' titans roam the prairie).
function spawnTitans() {
  const from = S.objects.length, placed = [];
  for (const sp of [...TITANS].sort((p1, p2) => p2.height - p1.height)) {       // biggest first, while there is room
    const hab = habOf(sp) === 'town' ? 'plain' : habOf(sp);
    for (let t = 0; t < 30; t++) {
      const pt = critterSpot(sp, hab, 0.6 + rand() * 0.4);
      if (!pt || placed.some((q) => Math.hypot(q[0] - pt[0], q[1] - pt[1]) < (q[2] + sp.height) * 0.45 + 2)) continue;
      if (allBalls().some((b) => Math.hypot(b.x - pt[0], b.z - pt[1]) < b.d + sp.height)) continue;
      S.spawn.put(sp.id, pt[0], pt[1]); placed.push([pt[0], pt[1], sp.height]); break;
    }
  }
  for (let i = from; i < S.objects.length; i++) { const o = S.objects[i]; o.spawnT = 1.6 + rand() * 1.2; o.group.scale.setScalar(0.001); }
  S.titansOut = true;
  [98, 98, 131, 98].forEach((f, i) => tone(f, f * 0.98, 0.5, 'sawtooth', 0.2, i * 0.42));
}
function refillMap() {
  const here = new Set(S.objects), from = S.objects.length, balls = [S, ...rivals], back = [];
  NET.mute = true;                                // (the other players are told which of the original things came back, by number: far smaller than describing each)
  S.initial.forEach((e, k2) => {
    if (here.has(e.o)) return;                                     // still out there
    if (balls.some((b) => Math.hypot(b.x - e.x, b.z - e.z) < b.d)) return;   // not underneath a ball
    const o = S.spawn.put(e.id, e.x, e.z, { rot: e.rot });
    if (o) { e.o = o; o.nsig = propSig(o); back.push(k2, o.id); }
  });
  NET.mute = false;
  for (let i = 0; i < back.length; i += 160) netAll(['rf', back.slice(i, i + 160)]);
  materialize(from);
  return S.objects.length - from;
}

// ---------- the round: phases, the clock's announcements and events ----------
function announce(title, sub = '', color = '#ffe169', kicker = '') {
  const el = $('banner');
  el.innerHTML = loc(`${kicker ? `<div class="kick">${kicker}</div>` : ''}<div class="ttl" style="background:${color}">${title}</div>${sub ? `<div class="sub2">${sub}</div>` : ''}`);
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function showCount(txt, cls = '') { const el = $('count'); el.textContent = txt; el.className = cls; void el.offsetWidth; el.className = cls + ' show'; }
function enterPhase(ph) {
  const P2 = PHASES[ph];
  let sub = P2.sub;
  if (NET.client) {                              // the host adds the critters; this machine only marks the moment
    if (ph === 1 || ph === 2) [392, 523, 659].forEach((f, i) => tone(f, f * 1.5, 0.2, 'sine', 0.12, i * 0.09));
    if (ph === 3) { [98, 98, 131, 98].forEach((f, i) => tone(f, f * 0.98, 0.5, 'sawtooth', 0.2, i * 0.42)); $('timer').classList.add('hot'); }
  }
  else if (ph === 1 || ph === 2) spawnWave();
  if (ph === 1 && !NET.client) for (const b of allBalls()) if (b.d < 1) {            // nobody is left stuck in the Green: a ball still under 1 m gets a leg up
    growBall(b, 1 - b.vol3);
    if (b === S) { sub = 'You got a leg up to 1 m: climb out of the Green! ' + sub; toast('Late bloomer: boosted to 1 m'); }
  }
  if (ph === 3 && !NET.client) { spawnTitans(); refillMap(); $('timer').classList.add('hot'); }
  if (ph > 0) { announce(P2.name.toUpperCase(), sub, ph === 3 ? '#ff8a6a' : '#ffe169', `Phase ${ph + 1} of ${PHASES.length}`); [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.2, 'triangle', 0.16, i * 0.1)); }
  music.setPhase(ph);
  updatePhaseBar(true);
}
function updatePhaseBar(force) {
  const el = $('phasebar');
  if (force || !el.dataset.built) {
    el.dataset.built = '1';
    el.innerHTML = PHASES.map((ph, i) => { const end = PHASES[i + 1] ? PHASES[i + 1].from : 0; return `<div class="seg${i === S.phase ? ' on' : i < S.phase ? ' past' : ''}" style="flex:${ph.from - end}"><span>${ph.short || ph.name}</span></div>`; }).join('') + '<i id="phasepin"></i>'
      + S.evTimes.map((t) => `<b class="pip" style="left:${((LEVEL.seconds - t) / LEVEL.seconds * 100).toFixed(1)}%"></b>`).join('');
  }
  $('phasepin').style.left = ((LEVEL.seconds - Math.max(0, S.timeLeft)) / LEVEL.seconds * 100).toFixed(2) + '%';
}
const skyNow = new THREE.Color(SKY), skyGoal = new THREE.Color(SKY);
function updateSky(dt) {
  skyGoal.setHex(S.skyOverride ?? PHASES[S.phase].sky);
  skyNow.lerp(skyGoal, 1 - Math.exp(-0.8 * dt));
  scene.background.copy(skyNow); scene.fog.color.copy(skyNow);
}
// Events. One runs at a time. Each has an icon and a few words (below) so it can be read at a glance: a card pops up when it
// starts, then a chip under the clock keeps the icon, the name, a ring that drains with the time left, and the way to it.
// Icons are drawn in a 24 x 24 box: white strokes, with class "f" for filled shapes.
const EVENT_ICONS = {
  meteor: '<circle class="f" cx="15.5" cy="15.5" r="4.5"/><path d="M4 4l7 7M4 10l4 4M10 4l4 4"/>',
  stampede: '<path d="M3 6l6 6-6 6M10 6l6 6-6 6M17 6l4 6-4 6"/>',
  swarm: '<circle class="f" cx="12" cy="12" r="3.2"/><circle class="f" cx="5" cy="6" r="2"/><circle class="f" cx="19" cy="6" r="2"/><circle class="f" cx="5" cy="18" r="2"/><circle class="f" cx="19" cy="18" r="2"/>',
  golden: '<path class="f" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
  supply: '<path class="f" d="M4.5 9.5a7.5 7.5 0 0 1 15 0z"/><path d="M5 10l5 6M19 10l-5 6"/><rect class="f" x="9" y="16" width="6" height="5.5" rx="1"/>',
  magpie: '<path class="f" d="M2.5 8.5h19v4a4.5 4.5 0 0 1-4.5 4.5h-1.5L12 14l-3.5 3H7a4.5 4.5 0 0 1-4.5-4.5z"/><circle class="d" cx="8" cy="12" r="1.7"/><circle class="d" cx="16" cy="12" r="1.7"/>',
  static: '<path class="f" d="M13.5 2L5 13.5h5.5L9.5 22 19 9.5h-5.5z"/>',
  ring: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M7.5 12h9"/>',
  fog: '<path class="f" d="M12 3a6 6 0 0 0-6 6v11l2.5-2 1.8 2 1.7-2 1.7 2 1.8-2L18 20V9a6 6 0 0 0-6-6z"/><circle class="d" cx="9.7" cy="10" r="1.4"/><circle class="d" cx="14.3" cy="10" r="1.4"/>',
  cold: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2L3.8 16.8M12 6l-2.5-2M12 6l2.5-2M12 18l-2.5 2M12 18l2.5 2"/>',
  pinata: '<circle cx="12" cy="13" r="7.5"/><path d="M12 5.5l-2.5 4.5 4.5 3-3 4.5"/><path d="M8 4l-1-2M16 4l1-2"/>',
  vault: '<path class="f" d="M3.5 11a8.5 6 0 0 1 17 0z"/><rect x="3.5" y="11" width="17" height="9" rx="1.5"/><path d="M12 13.5v3.5"/>',
  dash: '<path d="M6 22V3"/><path class="f" d="M6 3.5h13l-3.2 4 3.2 4H6z"/>',
  twister: '<path d="M3.5 5h17M6 9h12.5M8 13h9M10 17h5.5M11.5 21h2"/>',
  overcharge: '<rect x="3" y="7" width="15.5" height="10" rx="2.2"/><path d="M21 10.5v3"/><path class="f" d="M11.8 8.2l-3.6 4.6h3l-.9 3 3.6-4.6h-3z"/>',
  hyperspeed: '<path class="f" d="M2.5 5l8.5 7-8.5 7zM12.5 5l8.5 7-8.5 7z"/>',
  giants: '<path d="M12 21V5M5.5 11.5L12 5l6.5 6.5"/><path d="M4 21.5h16"/>',
  parade: '<path class="f" d="M5 3.5v8.5a7 7 0 0 0 14 0V3.5h-4.5v8.5a2.5 2.5 0 0 1-5 0V3.5z"/><path class="d" d="M5 7h4.5M14.5 7H19" style="stroke:#2b2540;stroke-width:1.6"/>',
  oracle: '<path d="M1.8 12S5.8 5.5 12 5.5 22.2 12 22.2 12 18.2 18.5 12 18.5 1.8 12 1.8 12z"/><circle class="f" cx="12" cy="12" r="3.2"/>',
};
const EVENT_TAGS = {
  meteor: 'Dodge, then grab the shards', stampede: 'Roll into the herd', swarm: 'They are swarming here', golden: 'Catch it!', supply: 'Chase the crates',
  magpie: 'Ram the thief', static: 'Rams hit 3x harder', ring: 'Bigger pick-ups inside', fog: 'Ghosts are out', cold: 'The sea is frozen',
  pinata: 'Ram it ten times', vault: 'First come, first served', dash: 'Race through the gates', twister: 'Keep clear of it',
  overcharge: 'Dash refills 5x faster', hyperspeed: 'Everyone is 3x faster', giants: 'Critters are 2x size', parade: 'Critters come to you', oracle: '',
};
const eventIcon = (id) => `<svg viewBox="0 0 24 24">${EVENT_ICONS[id] || '<path d="M12 5v9M12 18v1"/>'}</svg>`;
function tickEvents(dt) {
  const ev = S.ev;
  if (ev) {
    ev.t += dt;
    try { if (ev.def.tick && !ev.net) ev.def.tick(H, ev, dt); } catch (e) { console.error('event tick failed', ev.def.id, e); ev.done = true; }
    const left = ev.def.duration - ev.t;
    const pct = clamp(left / ev.def.duration * 100, 0, 100);
    if (Math.abs(pct - (ev.pct ?? 200)) > 0.6) { ev.pct = pct; $('evring').style.background = `conic-gradient(${ev.color} ${pct.toFixed(1)}%, rgba(43,37,64,.25) 0)`; }
    $('evchip').classList.toggle('ending', left < 5);
    if ((left <= 0 || ev.done) && !ev.net) endEvent();       // (a client's copy ends when the host says so)
    return;
  }
  if (NET.client) return;
  if (S.evTimes.length && S.timeLeft <= S.evTimes[0] && S.timeLeft > 20) {
    S.evTimes.shift();
    S.evCount++;
    const pool = (S.evCount === 3 && ORACLE.ok() ? [ORACLE] : EVENTS).filter((e) => !S.evUsed.has(e.id) && (!e.ok || e.ok(H)) && S.timeLeft - (e.duration || 20) > (e.late ? 6 : TITANS_AT - 12));
    if (pool.length) { let w = pool.reduce((n, e) => n + (e.weight || 1), 0) * rand(), pick = pool[0]; for (const e of pool) { w -= e.weight || 1; if (w <= 0) { pick = e; break; } } startEvent(pick); }
  }
}
function startEvent(def) {
  if (S.ev) endEvent();
  S.evUsed.add(def.id);
  const color = def.color || '#ffe169';
  const ev = S.ev = { def, t: 0, done: false, data: {}, color };
  if (!def.quiet) { for (let i = 0; i < 3; i++) tone(620, 930, 0.22, 'sawtooth', 0.13, i * 0.26); }
  else tone(880, 1320, 0.5, 'sine', 0.1);
  try { def.start(H, ev); } catch (e) { console.error('event start failed', def.id, e); S.ev = null; return; }
  const name = ev.title || def.name, tag = ev.tag ?? EVENT_TAGS[def.id] ?? '';
  netAll(['ev', def.id, name, tag, color, def.duration, def.quiet ? 1 : 0]);
  showEvent(def.id, name, tag, color);
}
function showEvent(id, name, tag, color) {     // the card that pops up, and the chip under the clock
  const icon = eventIcon(id), card = $('evcard');
  name = loc(name); tag = loc(tag);
  card.innerHTML = `<div class="ico" style="background:${color}">${icon}</div><b>${name}</b>${tag ? `<span>${tag}</span>` : ''}`;
  card.classList.remove('show'); void card.offsetWidth; card.classList.add('show');
  $('evico').innerHTML = icon; $('evico').style.background = color; $('evname').textContent = name; $('evtag').innerHTML = tag; $('evdist').innerHTML = '';
  $('evchip').classList.remove('ending'); $('evchip').style.display = 'flex';
}
function endEvent() {
  const ev = S.ev;
  if (!ev) return;
  S.ev = null;
  if (!ev.net) netAll(['eve']);
  try { if (ev.def.end && !ev.net) ev.def.end(H, ev); } catch (e) { console.error('event end failed', ev.def.id, e); }
  $('evchip').style.display = 'none';
}
S.fireEvent = (id) => { const def = EVENTS.find((e) => e.id === id); if (def) startEvent(def); return !!def; };   // debug: start an event now
function tickMatch(dt) {
  const tl = S.timeLeft;
  let ph = 0;
  for (let i = 0; i < PHASES.length; i++) if (tl <= PHASES[i].from) ph = i;
  if (ph !== S.phase) { S.phase = ph; enterPhase(ph); }
  const sec = Math.ceil(tl);
  if (sec !== S.lastSec) {
    S.lastSec = sec;
    if (sec <= 10 && sec > 0) { showCount(String(sec), 'final'); tone(880, 880, 0.09, 'square', 0.12); }
    else if (sec === 30) { toast('30 seconds left!'); tone(660, 660, 0.3, 'square', 0.1); }
    else if (sec === 60) toast('One minute left!');
  }
  if (!NET.client) for (const b of allBalls()) b.ratioBonus = 0;        // events that widen a ball's reach set this again every frame
  tickEvents(dt);
  updatePhaseBar();
}

// ---------- minimap ----------
const mini = $('mini'), miniCtx = mini.getContext('2d'), miniBase = document.createElement('canvas');
(function drawMiniBase() {
  const N = 160; miniBase.width = miniBase.height = N;
  const cx = miniBase.getContext('2d'), img = cx.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = BOUNDS.x1 + (i + 0.5) / N * NX, z = BOUNDS.z1 + (j + 0.5) / N * NZ, kk = T.index(x, z), c = tC[kk], sea = tW[kk] === 2, o = (j * N + i) * 4;
    const sh = 0.9 + Math.min(0.2, tH[kk] * 0.012);
    img.data[o] = sea ? 74 : Math.min(255, (c >> 16 & 255) * sh); img.data[o + 1] = sea ? 150 : Math.min(255, (c >> 8 & 255) * sh); img.data[o + 2] = sea ? 214 : Math.min(255, (c & 255) * sh); img.data[o + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
})();
let miniT = 0;
function updateMini(dt) {
  miniT -= dt;
  if (miniT > 0) return;
  miniT = 0.08;
  const N = mini.width, sc = N / NX, cx = miniCtx, mx = (x) => (x - BOUNDS.x1) * sc, mz = (z) => (z - BOUNDS.z1) * sc;
  cx.clearRect(0, 0, N, N);
  cx.save(); cx.beginPath(); cx.arc(N / 2, N / 2, N / 2 - 1, 0, 6.3); cx.clip();
  cx.drawImage(miniBase, 0, 0, N, N);
  if (MODS.fog < 1) { cx.fillStyle = 'rgba(210,214,224,.72)'; cx.fillRect(0, 0, N, N); }
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 160);
  for (const m of markers.values()) {
    cx.beginPath(); cx.arc(mx(m.x), mz(m.z), 6 + pulse * 4, 0, 6.3); cx.fillStyle = m.css; cx.globalAlpha = 0.35 + 0.3 * pulse; cx.fill(); cx.globalAlpha = 1;
    cx.beginPath(); cx.arc(mx(m.x), mz(m.z), 5, 0, 6.3); cx.fillStyle = m.css; cx.fill(); cx.lineWidth = 1.5; cx.strokeStyle = '#2b2540'; cx.stroke();
    cx.fillStyle = '#2b2540'; cx.font = 'bold 9px sans-serif'; cx.textAlign = 'center'; cx.fillText('!', mx(m.x), mz(m.z) + 3);
  }
  for (const b of [...rivals, S]) {
    const x = mx(b.x), z = mz(b.z), me = b === S;
    cx.beginPath(); cx.arc(x, z, me ? 4.5 : 3.5, 0, 6.3); cx.fillStyle = TEAMS[b.team].css; cx.fill(); cx.lineWidth = me ? 2 : 1.2; cx.strokeStyle = me ? '#fff' : '#2b2540'; cx.stroke();
    if (me) { cx.beginPath(); cx.moveTo(x, z); cx.lineTo(x + Math.sin(S.heading) * 9, z + Math.cos(S.heading) * 9); cx.strokeStyle = '#fff'; cx.stroke(); }
  }
  cx.restore();
}

// ---------- music: a small looping tune that speeds up with each phase (all synthesised) ----------
const music = (() => {
  const SCALE = [0, 2, 4, 7, 9], TEMPO = [112, 124, 138, 168];
  const MINOR = [0, 3, 5, 7, 10], FIGHT = [116, 150, 178];     // the arena's tune: waiting, fighting, sudden death
  let on = false, phase = 0, step = 0, nextT = 0, arena = false, heat = 0;
  const note = (semi, oct) => 220 * Math.pow(2, (semi + oct * 12) / 12);
  // The arena fight: a minor loop over a walking bass. Level 0 is the wait before GO (bass and a kick), 1 the fight
  // (the tune, a snare, hats), 2 sudden death (faster, a step higher, the tune doubled).
  function fightTick() {
    const beat = 60 / FIGHT[heat] / 2;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.2) {
      const when = nextT - ac.currentTime, bar = Math.floor(step / 16) % 4, s = step % 16, root = [0, 0, -4, -2][bar] + (heat === 2 ? 2 : 0);
      if (s % 4 === 0) tone(150, 42, 0.12, 'sine', 0.11, when);                                              // kick
      if (heat === 0 ? s % 4 === 0 : true) { const f = note(root - 12 + (heat && s % 4 === 3 ? 12 : 0), 0) / 2; tone(f, f, beat * 0.85, 'sawtooth', heat ? 0.045 : 0.06, when); }
      if (heat >= 1 && (s % 2 === 0 || heat === 2)) { const k2 = (s * 5 + bar * 2 + (s % 3)) % 5, f = note(root + MINOR[k2], 1 + (heat === 2 && s % 4 === 2 ? 1 : 0)); tone(f, f, beat * 0.8, 'square', 0.02, when); }
      if (heat >= 1 && s % 8 === 4) { tone(1900, 380, 0.07, 'square', 0.03, when); tone(3100, 1300, 0.05, 'sawtooth', 0.02, when); }      // snare
      if (heat >= 1 && (s % 2 === 1 || heat === 2)) tone(5200, 3200, 0.02, 'square', 0.011, when);              // hat
      step++; nextT += beat;
    }
  }
  return {
    start() { on = true; arena = false; step = 0; nextT = 0; phase = 0; },
    stop() { on = false; arena = false; },
    setPhase(ph) { phase = ph; },
    fight(level) {                          // level: 0 waiting, 1 fighting, 2 sudden death; -1 stops it
      if (level < 0) { if (arena) { on = false; arena = false; } return; }
      if (!arena) { arena = true; on = true; step = 0; nextT = 0; }
      heat = level;
    },
    tick() {
      if (!on || save.muted || !ac) return;
      if (arena) { fightTick(); return; }
      const beat = 60 / TEMPO[phase] / 2;
      if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
      while (nextT < ac.currentTime + 0.2) {
        const when = nextT - ac.currentTime, bar = Math.floor(step / 16) % 4, s = step % 16, root = [0, -3, 5, 2][bar] + (phase === 3 ? 2 : 0);
        if (s % 4 === 0) tone(note(root - 12, 0) / 2, note(root - 12, 0) / 2, beat * 1.8, 'triangle', 0.09, when);
        if (s % 2 === 0 || phase >= 2) { const k2 = (s * 7 + bar * 3 + (s % 3) * 2) % 5; tone(note(root + SCALE[k2], 1), note(root + SCALE[k2], 1), beat * 0.9, 'square', 0.022, when); }
        if (phase >= 1 && s % 4 === 2) tone(2400, 900, 0.03, 'square', 0.02, when);
        if (phase === 3 && s % 2 === 1) tone(3200, 1800, 0.02, 'square', 0.015, when);
        step++; nextT += beat;
      }
    },
  };
})();

// ---------- multiplayer ----------
// The host's machine runs the world exactly as in single player; other players' balls are "remote" rivals there, moved by
// what their machines report. A client runs its own ball's physics and draws everything else from what the host sends:
//   reliable events   things rolled up (pk), dropped (dr, tk), added (sp), removed (rm), changed (pr), events and their
//                     markers and effects, the phases of the round, and shoves to this player's ball (im);
//   fast channel      20 times a second, where every ball is and how big, and the clock: never queued, never re-sent, so
//                     it is always fresh (see netFast); the critters that moved near this player go reliably, 10 times a
//                     second, and wait if that player's link is behind.
// A client rolls things up at once on its own screen and asks the host (cl); the host agrees (pk) or refuses (dn).
const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
const propBits = (o) => (o.noPick ? 2 : 0) | (o.group.material === goldMat ? 1 : 0);
const propSig = (o) => o.size * 4 + propBits(o);

function netBegin() {                            // a round is starting (called from start, after the map is built)
  NET.q.clear(); NET.pending.clear(); NET.lunges.clear(); NET.ready = new Set(); NET.spawned = []; NET.fxRoots.clear(); NET.fxNodes.clear(); NET.mmDirty.clear();
  NET.snapT = 0; NET.slowT = 0; NET.upT = 0; NET.modsSent = ''; NET.cdGo = false; NET.battleSeed = 0; NET.aEnd = null; NET.aSteps = [];
  for (const geo of NET.fxGeoIn.values()) geo.dispose();
  NET.fxGeos.clear(); NET.fxGeoIn.clear(); NET.mute = false;
  NET.seq = 0; NET.seqIn = 0; NET.answered = 0; NET.heard = performance.now(); NET.lag = 0; $('netwarn').classList.remove('show');
  if (!NET.on) return;
  if (NET.host) { for (const o of S.objects) o.nsig = propSig(o); S.live = true; }
  else netHost(['rdy', S.layoutSum]);
}
// (host) something was added to the world after the start: tell everyone. The record is filled in when it is sent, so
// whatever the spawner does to the new thing in the same frame (gold, held, popping in) goes with it.
function netSpawned(o, specId, x, z) {
  const rec = ['sp', o.id, specId, r2(x), r2(z), 0, 0, 0, o.bonus, 0, 0, 0];
  NET.spawned.push([rec, o]); netAll(rec);
}
function netTick(dt) {
  if (!NET.room) return;
  if (NET.host) {
    for (const R of rivals) if (R.imp) { const id = NET.peers[R.team]; if (id) netTo(id, ['im', R.imp]); R.imp = null; }
    for (const [rec, o] of NET.spawned) { rec[5] = r2(o.group.rotation.y); rec[6] = o.size; rec[7] = o.rad; rec[9] = r2(o.spawnT); rec[10] = propBits(o); rec[11] = r2(o.cool); o.nsig = propSig(o); }
    NET.spawned.length = 0;
    const mods = JSON.stringify([MODS, S.skyOverride ?? null]);
    if (mods !== NET.modsSent) { NET.modsSent = mods; netAll(['md', mods]); }
    NET.snapT -= dt; NET.slowT -= dt;
    if (NET.snapT <= 0) { NET.snapT = 1 / 12; netBalls(); }
    if (NET.slowT <= 0) { NET.slowT = 1 / 5; netWorld(); }
  } else {
    NET.upT -= dt; NET.pingT -= dt;
    if (NET.upT <= 0) { NET.upT = 1 / 12; netFast('host', ['u', ++NET.seq, Math.round(S.x * 10), Math.round(S.y * 10), Math.round(S.z * 10), Math.round((S.heading % (2 * Math.PI)) * 100), Math.round(S.vx * 10), Math.round(S.vz * 10), S.boostT > 0 ? 1 : 0, Math.round(S.charge * 10), Math.round(S.energy * 100)]); }
    if (NET.pingT <= 0) { NET.pingT = 1; netFast('host', ['pg', Math.round(performance.now())]); }
    if (NET.lunges.size) { netHost(['lg', [...NET.lunges]]); NET.lunges.clear(); }
    for (const e of NET.fxNodes.values()) for (const o of e.nodes) if (o.userData.tp) o.position.lerp(o.userData.tp, Math.min(1, 12 * dt));
    const quiet = (performance.now() - NET.heard) / 1000;          // how long since the host was last heard from
    NET.lag = quiet; $('netwarn').classList.toggle('show', quiet > 1.5 && S.state === 'play');
  }
  netFlush();
}
// (host) Which free things near this player's ball have moved since they were last told? The nearest and the most out
// of date first, 24 at most. Each is three whole numbers: which thing, and where (in tenths of a metre).
function critterDelta(R, slot) {
  const cand = [], lim = 50 + R.d * 9, i = slot * 2;
  for (const o of S.objects) {
    if (o.fly) continue;
    const p = o.group.position, s = o.sent || (o.sent = []);
    if (s[i] === undefined) { s[i] = p.x; s[i + 1] = p.z; continue; }
    const off = Math.abs(p.x - s[i]) + Math.abs(p.z - s[i + 1]);
    if (off < 0.15) continue;
    const d = Math.hypot(p.x - R.x, p.z - R.z);
    if (d < lim + o.size * 4) cand.push([d / (1 + 4 * off), o]);       // the further out of date, the sooner it is sent
  }
  cand.sort((a, b) => a[0] - b[0]);
  const out = [];
  for (let n = 0; n < cand.length && n < 24; n++) { const o = cand[n][1], p = o.group.position; o.sent[i] = p.x; o.sent[i + 1] = p.z; out.push(o.id, Math.round(p.x * 10), Math.round(p.z * 10)); }
  return out;
}
// (host) 12 times a second, the fast way: where every ball is and the clock, as whole numbers to keep it small. Each
// copy stands alone, so a lost or skipped one does not matter.
function netBalls() {
  const balls = [];
  for (let t = 0; t < TEAMS.length; t++) {
    const b = ballOf(t), [vx, vz] = velOf(b);
    const chg = b === S ? S.charge : b.remote ? b.chg : b.wind > 0 ? 0.65 * (1 - b.wind / (CHARGE_TIME * 0.65)) : 0;
    balls.push(Math.round(b.x * 10), Math.round(b.y * 10), Math.round(b.z * 10), Math.round((b.heading % (2 * Math.PI)) * 100), Math.round(vx * 10), Math.round(vz * 10), Math.round(b.d * 1000), b.boostT > 0 ? 1 : 0, Math.round(chg * 10));
  }
  const seq = ++NET.seq, tl = Math.round(S.timeLeft * 10);
  for (let t = 0; t < TEAMS.length; t++) {
    const id = NET.peers[t], R = id && rivalOf(t);
    if (R) netFast(id, ['b', seq, tl, balls, [R.vol3, R.ratioBonus || 0, R.claims || 0]]);
  }
}
// (host) 5 times a second, the reliable way: what events changed, and the critters that moved near each player. A player
// whose link is behind gets no critters until it has caught up (they are then simply sent later: nothing is lost).
function netWorld() {
  const pr = [];                                 // things whose size or state an event changed
  for (const o of S.objects) { const sg = propSig(o); if (o.nsig === undefined) o.nsig = sg; else if (o.nsig !== sg) { o.nsig = sg; pr.push([o.id, o.size, o.rad, propBits(o)]); } }
  if (pr.length) netAll(['pr', pr]);
  const mm = [];
  for (const id of NET.mmDirty) { const m = markers.get(id); if (m) mm.push(id, r2(m.x), r2(m.z)); }
  NET.mmDirty.clear();
  const fxu = netFxScan();
  if (mm.length || fxu.length) netAll(['fu', mm, fxu]);
  for (let t = 0; t < TEAMS.length; t++) {
    const id = NET.peers[t], R = id && rivalOf(t);
    if (!R || NET.room.buffered(id) > 1500 || (NET.q.get(id) || []).length > 30) continue;
    const crit = critterDelta(R, t);
    if (crit.length) netTo(id, ['c', crit]);
  }
}
// (client) where the balls are and what the clock says
function netSnap(m) {
  const [, seq, tl, balls, own] = m;
  if (seq <= NET.seqIn) return;                  // an older copy that arrived late
  NET.seqIn = seq; NET.heard = performance.now();
  if (NET.stats) NET.nIn++;
  if (S.state === 'play') S.timeLeft += (tl / 10 - S.timeLeft) * 0.35;
  for (let t = 0; t < TEAMS.length; t++) {
    const R = t === S.team ? null : rivalOf(t), i = t * 9;
    if (!R) continue;
    R.nx = balls[i] / 10; R.ny = balls[i + 1] / 10; R.nz = balls[i + 2] / 10; R.nh = balls[i + 3] / 100; R.rvx = balls[i + 4] / 10; R.rvz = balls[i + 5] / 10; R.nb = balls[i + 7]; R.chg = balls[i + 8] / 10; R.nAge = 0;
    const d = balls[i + 6] / 1000;
    if (Math.abs(d - R.d) > 1e-6) { R.d = d; R.vol3 = d ** 3; seatOn(R.attached, d / 2); }
  }
  S.ratioBonus = own[1];
  if (own[2] !== NET.answered) return;           // the host has answered claims this machine has not heard about yet (or the reverse): its size for us is out of step, wait for the next
  let v = own[0];                                // this ball's size: what the host has agreed, plus what it has not answered yet
  for (const c of NET.pending.values()) v += c;
  v = Math.max(START_D ** 3, v);
  if (Math.abs(v - S.vol3) > 1e-9 * v) { S.vol3 = v; S.d = Math.cbrt(v); seatAll(); announceUnlocks(); }
}
function netWorldIn(mm, fxu) {                   // (client) markers and event effects that moved
  for (let i = 0; i < mm.length; i += 3) moveMark(mm[i], mm[i + 1], mm[i + 2]);
  for (const [key, i, sig] of fxu) {
    const e = NET.fxNodes.get(key), o = e && e.nodes[i];
    if (!o) continue;
    const a = sig.split(',');
    (o.userData.tp || (o.userData.tp = new V3())).set(+a[0], +a[1], +a[2]);
    o.quaternion.set(+a[3], +a[4], +a[5], +a[6]).normalize(); o.scale.set(+a[7], +a[8], +a[9]); o.visible = a[10] === '1';
    if (o.isMesh && a.length > 12) { const mt = o.material; mt.color.setHex(+a[12]); mt.opacity = +a[13]; mt.transparent = a[14] === '1'; }
  }
}
// (client) a critter or thing the host is moving: glide to where it was last said to be, and bob as it walks
function puppetThing(o, dt, dist) {
  const p = o.group.position, sp = o.spec, h = o.size;
  let moving = false;
  if (o.ntx !== undefined) {
    const dx = o.ntx - p.x, dz2 = o.ntz - p.z, d = Math.hypot(dx, dz2);
    if (d > 25) { p.x = o.ntx; p.z = o.ntz; }
    else if (d > 0.005) { const k2 = Math.min(1, 5 * dt); p.x += dx * k2; p.z += dz2 * k2; moving = d > 0.06; if (d > 0.12) o.nyaw = Math.atan2(dx, dz2); }       // it faces the way it is going
    else o.ntx = undefined;
  }
  if (o.kind !== 'creature') { if (moving) p.y = groundAt(p.x, p.z); return; }
  if (!moving && dist > 150 + S.d * 12) return;
  const air = sp.move === 'fly' || sp.move === 'float', wob = S.time * (sp.move === 'hop' ? 9 : 7) + o.phase;
  let lift = 0;
  if (sp.move === 'fly') lift = h * (0.5 + 0.1 * Math.sin(S.time * 3 + o.phase));
  else if (sp.move === 'float') lift = h * (0.18 + 0.07 * Math.sin(S.time * 2 + o.phase));
  else if (sp.move === 'swim') lift = T.waterAt(p.x, p.z) === 2 ? Math.max(0, SEA_LEVEL - h * 0.55 - groundAt(p.x, p.z)) : 0;
  else if (moving) lift = Math.abs(Math.sin(wob)) * h * (sp.move === 'hop' ? 0.22 : sp.move === 'slither' ? 0 : 0.06);
  p.y = groundAt(p.x, p.z) + lift;
  if (o.nyaw !== undefined) o.group.rotation.set(0, o.nyaw + (moving && sp.move === 'slither' ? Math.sin(wob) * 0.35 : 0), moving && !air ? Math.sin(wob) * 0.09 : 0);
}
// Takes a thing off whichever ball it is on and puts it back in the world (where it goes next is the caller's business).
function unstick(Bq, o) {
  if (Bq) { const i = Bq.attached.indexOf(o); if (i >= 0) Bq.attached.splice(i, 1); }
  if (o.group.parent && o.group.parent !== worldGroup) worldGroup.attach(o.group);
  else if (!o.group.parent) { worldGroup.add(o.group); if (Bq) o.group.position.set(Bq.x, Bq.y, Bq.z); }
  o.group.scale.setScalar(o.size); o.group.visible = true;
  if (o.on && Bq === S) {
    S.vol3 -= o.contrib; S.caught--; NET.pending.delete(o.id);
    if (o.kind === 'creature') { S.attachedCritters--; armyDrop(S.army, o); for (const t of o.spec.types) bump(S.counts.type, t, -1); bump(S.counts.species, o.spec.id, -1); }
  } else if (o.on && Bq && o.kind === 'creature') armyDrop(Bq.army, o);
  if (o.kind === 'creature') setTeamLook(o, null);
  o.on = false; o.by = null;
  if (!o.gone && !S.objects.includes(o)) S.objects.push(o);
}
const holderOf = (o) => (o.on && o.by !== null && o.by !== undefined ? ballOf(o.by) : null);
// (client) rolls a thing up here and now, and asks the host to agree
function claim(o) {
  const p = o.group.position;
  o.wpos = [p.x, p.y, p.z, o.group.rotation.y];
  attach(o); NET.pending.set(o.id, o.contrib); netHost(['cl', o.id]);
}
function netPick(team, id) {                     // (client) the host says this ball has rolled this thing up
  const o = S.byId.get(id), Bq = ballOf(team);
  if (!o || o.gone || !Bq) return;
  if (o.on && o.by === team) return;             // already there: it was this player's own claim, now agreed
  if (o.on) { const from = holderOf(o); unstick(from, o); if (from === S) seatAll(); }
  o.fly = null;
  if (!S.objects.includes(o)) S.objects.push(o);
  if (Bq === S) attach(o); else rivalAttach(Bq, o);
}
function netDeny(id) {                           // (client) the host refused a claim: somebody else got there first
  const o = S.byId.get(id);
  NET.pending.delete(id); NET.answered++;
  if (!o || !o.on || o.by !== S.team) return;
  unstick(S, o);
  if (o.wpos) { o.group.position.set(o.wpos[0], o.wpos[1], o.wpos[2]); o.group.rotation.set(0, o.wpos[3], 0); }
  o.cool = 0.5;
  S.vol3 = Math.max(START_D ** 3, S.vol3); S.d = Math.cbrt(S.vol3); seatAll();
}
function netDrop(team, list, hit) {              // (client) things knocked off a ball, flying
  const Bq = ballOf(team);
  if (!Bq) return;
  for (const [id, vx, vy, vz] of list) { const o = S.byId.get(id); if (!o || o.gone) continue; unstick(holderOf(o) || Bq, o); o.fly = { vx, vy, vz }; o.cool = 1.2; }
  if (Bq === S) { if (hit) { S.hitCool = 3; S.shake = 0.3; sfxBump(); } S.vol3 = Math.max(START_D ** 3, S.vol3); S.d = Math.cbrt(S.vol3); seatAll(); }
  else seatOn(Bq.attached, Bq.d / 2);
}
function netTake(team, list) {                   // (client) things taken off a ball and stood beside it
  const Bq = ballOf(team);
  if (!Bq) return;
  for (const [id, x, z, rot] of list) { const o = S.byId.get(id); if (!o || o.gone) continue; unstick(holderOf(o) || Bq, o); o.fly = null; o.cool = 1.5; o.group.position.set(x, groundAt(x, z), z); o.group.rotation.set(0, rot, 0); o.ntx = undefined; }
  if (Bq === S) { S.vol3 = Math.max(START_D ** 3, S.vol3); S.d = Math.cbrt(S.vol3); seatAll(); } else seatOn(Bq.attached, Bq.d / 2);
}

// Event effects (a twister, a supply ship, falling crates...) are built by events.js straight out of meshes, on the host.
// Rather than teach every event to describe itself, the host sends each effect's meshes once and then whatever moves.
const fxMat = (m) => [m.type, m.color ? m.color.getHex() : 0xffffff, r2(m.opacity), m.transparent ? 1 : 0, m.side, m.depthWrite ? 1 : 0, m.fog ? 1 : 0, m.emissive ? m.emissive.getHex() : 0, m.emissiveIntensity ?? 0, m.vertexColors ? 1 : 0];
const fxFlat = (o, out = []) => { out.push(o); for (const c of o.children) fxFlat(c, out); return out; };
const fxSig = (o) => `${r2(o.position.x)},${r2(o.position.y)},${r2(o.position.z)},${r3(o.quaternion.x)},${r3(o.quaternion.y)},${r3(o.quaternion.z)},${r3(o.quaternion.w)},${r3(o.scale.x)},${r3(o.scale.y)},${r3(o.scale.z)},${o.visible ? 1 : 0}${o.isMesh ? ',' + fxMat(o.material).slice(0, 4).join() : ''}`;
function fxSer(o) {
  const n = { p: o.position.toArray().map(r3), q: o.quaternion.toArray().map(r3), s: o.scale.toArray().map(r3), v: o.visible ? 1 : 0, c: o.children.map(fxSer) };
  if (o.isMesh) {
    let g = null;
    for (const k2 in G) if (G[k2] === o.geometry) g = k2;
    if (g) n.g = g;
    else if (NET.fxGeos.has(o.geometry.uuid)) n.g = { u: o.geometry.uuid };            // already described this round
    else { NET.fxGeos.add(o.geometry.uuid); n.g = { u: o.geometry.uuid, p: Array.from(o.geometry.attributes.position.array, r3), i: o.geometry.index ? Array.from(o.geometry.index.array) : null }; }
    n.m = fxMat(o.material); n.ro = o.renderOrder;
  }
  return n;
}
function netFxScan() {                           // (host) new effects in full; for the rest, only the parts that changed
  const upd = [];
  for (const [root, e] of NET.fxRoots) {
    const nodes = fxFlat(root);
    if (e.n !== nodes.length) { e.n = nodes.length; e.sigs = nodes.map(fxSig); netAll(['fxa', e.key, fxSer(root)]); continue; }
    for (let i = 0; i < nodes.length; i++) { const sg = fxSig(nodes[i]); if (sg !== e.sigs[i]) { e.sigs[i] = sg; upd.push([e.key, i, sg]); } }
  }
  return upd;
}
function fxBuild(n) {                            // (client)
  let o;
  if (n.g) {
    let geo = typeof n.g === 'string' ? G[n.g] : null;
    if (!geo) geo = NET.fxGeoIn.get(n.g.u);
    if (!geo && n.g.p) { geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(n.g.p, 3)); if (n.g.i) geo.setIndex(n.g.i); geo.computeVertexNormals(); NET.fxGeoIn.set(n.g.u, geo); }
    if (!geo) geo = G.box;
    const a = n.m, M = THREE[a[0]] || THREE.MeshBasicMaterial;
    const mt = new M({ color: a[1], opacity: a[2], transparent: !!a[3], side: a[4], depthWrite: !!a[5], fog: !!a[6], vertexColors: !!a[9] });
    if (mt.emissive) { mt.emissive.setHex(a[7]); mt.emissiveIntensity = a[8]; }
    o = new THREE.Mesh(geo, mt); o.renderOrder = n.ro || 0;
  } else o = new THREE.Group();
  o.position.fromArray(n.p); o.quaternion.fromArray(n.q).normalize(); o.scale.fromArray(n.s); o.visible = !!n.v;
  for (const c of n.c) o.add(fxBuild(c));
  return o;
}
function fxDrop(key) {
  const e = NET.fxNodes.get(key);
  if (!e) return;
  fx.remove(e.root); NET.fxNodes.delete(key);
  for (const o of e.nodes) if (o.isMesh) o.material.dispose();
}

// ---- messages ----
function clientMsg(m) {
  const k2 = m[0];
  if (k2 === 'full') { leaveRoom('That room is full'); return; }
  if (k2 === 'lob') { LOB.kinds = m[1]; LOB.seat = m[2]; LOB.diff = m[3]; LOB.auto = m[4] ?? null; LOB.autoAt = performance.now(); if (!NET.on) { renderLobby(); if (S.state === 'menu') menuView('mvLobby'); } return; }
  if (k2 === 'go') { beginMatch(m[1], m[2]); return; }
  if (!NET.on) return;
  switch (k2) {
    case 'b': netSnap(m); break;
    case 'c': { const crit = m[1]; for (let i = 0; i < crit.length; i += 3) { const o = S.byId.get(crit[i]); if (o && !o.on) { o.ntx = crit[i + 1] / 10; o.ntz = crit[i + 2] / 10; } } break; }
    case 'po': NET.ping = Math.round(performance.now()) - m[1]; break;
    case 'fu': netWorldIn(m[1], m[2]); break;
    case 'ok': NET.pending.delete(m[1]); NET.answered++; break;        // the host agreed to a claim
    case 'cd': NET.cdGo = true; if (S.state === 'intro') S.introT = Math.max(S.introT, INTRO_LEN); break;
    case 'pk': netPick(m[1], m[2]); break;
    case 'dn': netDeny(m[1]); break;
    case 'dr': netDrop(m[1], m[2], m[3]); break;
    case 'tk': netTake(m[1], m[2]); break;
    case 'sp': {
      const [, id, specId, x, z, rot, size, rad, bonus, spawnT, bits, cool] = m, e = SPECS[specId];
      if (!e || S.byId.has(id)) break;
      const o = S.spawn.put(specId, x, z, { id, rot, bonus, scale: size / e.size, rad });
      if (!o) break;
      o.cool = cool; o.noPick = !!(bits & 2);
      if ((bits & 1) && o.kind === 'creature') o.group.material = goldMat;
      if (spawnT > 0) { o.spawnT = spawnT; o.group.scale.setScalar(0.001); }
      break;
    }
    case 'rf': for (let i = 0; i < m[1].length; i += 2) {            // things from the start of the round that are back
      const e = S.initial[m[1][i]];
      if (!e || S.byId.has(m[1][i + 1])) continue;
      const o = S.spawn.put(e.id, e.x, e.z, { rot: e.rot, id: m[1][i + 1] });
      if (o) { e.o = o; o.spawnT = 0.9 + rand() * 0.6; o.group.scale.setScalar(0.001); }
    } break;
    case 'rm': { const o = S.byId.get(m[1]); if (o) { if (o.on) { const from = holderOf(o); unstick(from, o); if (from === S) seatAll(); } removeThing(o); } break; }
    case 'pr': for (const [id, size, rad, bits] of m[1]) {
      const o = S.byId.get(id);
      if (!o) continue;
      o.size = size; o.rad = rad; o.vis = size; o.armySpec = null; o.noPick = !!(bits & 2);
      if (!o.on) { o.group.scale.setScalar(size); if (o.kind === 'creature') o.group.material = bits & 1 ? goldMat : critterMaterial; }
    } break;
    case 'fl': { const o = S.byId.get(m[1]); if (o && !o.on) { o.group.position.set(m[2], m[3], m[4]); o.fly = { vx: m[5], vy: m[6], vz: m[7] }; o.cool = 1; } break; }
    case 'im': {
      const p = m[1];
      if (p.vx !== undefined) { S.vx = p.vx; S.vz = p.vz; }
      if (p.energy !== undefined) S.energy = p.energy;
      if (p.ghost) S.ghostT = p.ghost;
      if (p.chg0) S.charge = 0;
      if (p.bump) { S.shake = 0.2; sfxBump(); }
      break;
    }
    case 'ev':
      S.ev = { def: { id: m[1], duration: m[5] }, t: 0, done: false, data: {}, color: m[4], net: true };
      if (!m[6]) { for (let i = 0; i < 3; i++) tone(620, 930, 0.22, 'sawtooth', 0.13, i * 0.26); } else tone(880, 1320, 0.5, 'sine', 0.1);
      showEvent(m[1], m[2], m[3], m[4]);
      break;
    case 'eve': endEvent(); break;
    case 'ts': toast(m[1]); break;
    case 'an': announce(...m[1]); break;
    case 'sx': if (m[1] === 0) tone(...m[2]); else if (SPECS[m[2][0]]) cry(SPECS[m[2][0]].spec, m[2][1]); break;
    case 'mk': mark(m[1], m[2], m[3], m[4]); break;
    case 'um': unmark(m[1]); break;
    case 'md': { const [mods, sky] = JSON.parse(m[1]); Object.assign(MODS, mods); H.setIce(mods.iced); S.skyOverride = sky; break; }
    case 'fxa': fxDrop(m[1]); { const root = fxBuild(m[2]); fx.add(root); NET.fxNodes.set(m[1], { root, nodes: fxFlat(root) }); } break;
    case 'fxr': fxDrop(m[1]); break;
    case 'tu': timeUp(); break;
    case 'wh': if (S.state === 'play') timeUp(); startWheel(m[1]); break;
    case 'ba': NET.battleSeed = m[1]; if (wheel) { wheel.destroy(); wheel = null; startBattle(S.forecast.arena); } break;
    case 'as': for (const row of m[1]) NET.aSteps.push(row); break;
    case 'ae': NET.aEnd = [m[1], m[2]]; break;
    case 'left': { NET.seats[m[1]] = 'cpu'; const R = rivalOf(m[1]); if (R) R.human = false; toast(`${TEAMS[m[1]].name} left the game`); break; }
  }
}
function hostMsg(id, m) {
  if (!NET.on) return;
  const seat = NET.peers.indexOf(id), R = seat > 0 ? rivalOf(seat) : null;
  if (!R) return;
  switch (m[0]) {
    case 'pg': netFast(id, ['po', m[1]]); break;
    case 'rdy':
      NET.ready.add(id);
      if (m[1] !== S.layoutSum) { console.warn('a player built a different map', seat, m[1], S.layoutSum); toast(`${TEAMS[seat].name}'s map does not match: they may see things out of place`); }
      break;
    case 'u':
      if (m[1] <= (R.seqIn || 0)) break;         // an older report that arrived late
      R.seqIn = m[1];
      R.nx = clamp((+m[2] || 0) / 10, BOUNDS.x1, BOUNDS.x2); R.ny = (+m[3] || 0) / 10; R.nz = clamp((+m[4] || 0) / 10, BOUNDS.z1, BOUNDS.z2); R.nh = (+m[5] || 0) / 100;
      R.rvx = (+m[6] || 0) / 10; R.rvz = (+m[7] || 0) / 10; R.nb = m[8] ? 1 : 0; R.chg = (+m[9] || 0) / 10; R.ren = (+m[10] || 0) / 100; R.nAge = 0;
      break;
    case 'cl': {                                 // they rolled something up: first come, first served
      const o = S.byId.get(m[1]);
      R.claims = (R.claims || 0) + 1;            // every claim gets exactly one answer: ok or dn
      let ok = false;
      try { if (o && !o.on && !o.gone && !o.noPick && S.state === 'play' && o.size <= R.d * pickRatio(R) * 1.25 && S.objects.includes(o)) { o.fly = null; rivalAttach(R, o); ok = true; } }
      catch (e) { console.error('claim failed', e); ok = !!(o && o.on && o.by === R.team); }
      netTo(id, [ok ? 'ok' : 'dn', m[1]]);
      break;
    }
    case 'lg': for (const oid of m[1]) { const o = S.byId.get(oid); if (o && !o.on && !o.gone && Math.hypot(o.group.position.x - R.x, o.group.position.z - R.z) < R.d * 2 + o.size * 3) startLunge(o, R); } break;
    case 'ai': NET.aLatest[seat] = [clamp(Math.round(+m[1] || 0), -100, 100), clamp(Math.round(+m[2] || 0), -100, 100), m[3] ? 1 : 0]; break;
  }
}

// ---- the arena fight ----
// The fight is not sent thing by thing. Every machine runs the same fight from the same armies and the same dice, in
// steps of 1/60 s; the host decides when each step happens and what every player's stick was doing in it, and sends
// that. The others replay the steps as they arrive (a player's own steering comes back with the rest, a moment late).
const ASTEP = 1 / 60;
const stickBits = () => { const st = readStick(); return [Math.round(clamp(st.x, -1, 1) * 100), Math.round(clamp(st.z, -1, 1) * 100), st.dash ? 1 : 0]; };
function arenaStep(row) {
  for (let t = 0; t < TEAMS.length; t++) NET.arenaIn[t] = { x: row[t * 3] / 100, z: row[t * 3 + 1] / 100, dash: !!row[t * 3 + 2] };
  battle.step(ASTEP);
}
function tickBattleNet(dt) {
  if (NET.host) {
    NET.aAcc = Math.min(0.25, NET.aAcc + dt);
    const out = [];
    while (NET.aAcc >= ASTEP && !battle.finished) {
      NET.aAcc -= ASTEP;
      NET.aLatest[S.team] = stickBits();
      const row = [];
      for (let t = 0; t < TEAMS.length; t++) { const st = NET.aLatest[t] || [0, 0, 0]; row.push(st[0], st[1], st[2]); }
      out.push(row); arenaStep(row);
    }
    if (out.length) netAll(['as', out]);
    if (battle.finished) { const end = [battle.result(), battle.status()]; netAll(['ae', end[0], end[1]]); endBattle(end); }
  } else {
    const st = stickBits(), key = st.join();
    if (key !== NET.aSent) { NET.aSent = key; netHost(['ai', st[0], st[1], st[2]]); }
    let n = Math.min(10, Math.max(1, Math.ceil((NET.aSteps.length - 2) / 2)));      // keep a couple of steps in hand; the further behind, the faster it catches up
    while (n-- > 0 && NET.aSteps.length && !battle.finished) arenaStep(NET.aSteps.shift());
    if (NET.aEnd && (battle.finished || !NET.aSteps.length)) {
      if (battle.result().winner !== NET.aEnd[0].winner) console.warn("this copy of the fight ended differently from the host's", battle.result(), NET.aEnd[0]);
      endBattle(NET.aEnd);
    }
  }
}

// ---- rooms and the lobby ----
// A private room is its host's: they pick the CPU difficulty and press Start. A public room belongs to nobody in
// particular (its host is whoever arrived first): it starts itself once two players are in, and nobody joins mid-round.
const PUBLIC_WAIT = 20, PUBLIC_WAIT_FULL = 5, PUBLIC_RESULTS = 25;       // seconds: before a public game starts; once all four are in; on the results screen
const lobbyHumans = () => LOB.kinds.filter((kind) => kind === 'human').length;
const autoLeft = () => (LOB.auto === null ? null : Math.max(0, Math.ceil(LOB.auto - (performance.now() - LOB.autoAt) / 1000)));
function lobbyText() {
  const room = NET.room, host = room && room.host, n = lobbyHumans(), left = autoLeft();
  if (room && room.public) return left !== null ? `${n} players. Starting in ${left}…` : 'Looking for other players…';
  return host ? (n < 2 ? 'Share the code or the link. Empty seats are played by CPU teams.' : `${n} players are in.`) : `Waiting for the host to start. CPU teams: ${(DIFFS[LOB.diff] || DIFFS.normal).label}.`;
}
function renderLobby() {
  const room = NET.room, host = room && room.host, pub = room && room.public;
  $('roomTitle').firstChild.nodeValue = pub ? 'Public game' : 'Room';
  $('roomCode').textContent = room && !pub ? room.code : ''; $('roomCode').style.display = pub ? 'none' : '';
  $('btnCopy').style.display = pub ? 'none' : '';
  $('seats').innerHTML = TEAMS.map((tm, i) => `<div class="seat${LOB.kinds[i] === 'human' ? ' in' : ''}"><i class="dot" style="background:${tm.css}"></i><b>${tm.name}</b><span>${i === LOB.seat ? 'You' : LOB.kinds[i] === 'human' ? 'Player' : 'CPU'}${i === 0 && !pub ? ' · host' : ''}</span></div>`).join('');
  $('btnStartMp').style.display = host ? '' : 'none';
  $('btnStartMp').textContent = pub ? 'Start now' : 'Start game';
  $('lobbyDiff').style.display = host && !pub ? '' : 'none';
  $('lobbyMsg').textContent = lobbyText();
}
function sendLobby() {
  const room = NET.room;
  if (!room || !room.host) return;
  LOB.diff = room.public ? 'normal' : save.difficulty;
  for (let t = 1; t < TEAMS.length; t++) if (LOB.peers[t]) room.send(LOB.peers[t], [['lob', LOB.kinds, t, LOB.diff, autoLeft()]]);
}
// (public host) The countdown to a public game: it runs while two or more players are waiting in the lobby.
function lobbyAuto() {
  const n = lobbyHumans(), was = LOB.auto;
  if (n < 2) LOB.auto = null;
  else { const left = autoLeft(), cap = n >= TEAMS.length ? PUBLIC_WAIT_FULL : PUBLIC_WAIT; LOB.auto = Math.min(left ?? cap, cap); LOB.autoAt = performance.now(); }
  return was !== LOB.auto;
}
let lobbyShown = '';
function lobbyTick() {                           // once a tick while in a room (also from the worker's timer, so a hidden tab keeps count)
  const room = NET.room;
  if (!room) return;
  if (room.public && S.state === 'results') {    // nobody is left waiting on somebody else's results screen
    S.resAt = S.resAt || performance.now();
    if (performance.now() - S.resAt > PUBLIC_RESULTS * 1000) { toLobby(); return; }
  }
  if (NET.on || S.state !== 'menu') return;
  if (room.public && room.host && autoLeft() === 0 && lobbyHumans() >= 2) { startMatch(); return; }
  const txt = lobbyText();
  if (txt !== lobbyShown) { lobbyShown = txt; $('lobbyMsg').textContent = txt; }
}
function bindRoom(room) {
  NET.room = room; NET.q.clear();
  room.accepting = () => !(room.public && NET.on);       // a public game under way takes nobody new: they are sent to another room
  room.onMsg = (id, batch) => {
    if (NET.stats) NET.bIn += JSON.stringify(batch).length;
    for (const m of Array.isArray(batch) && Array.isArray(batch[0]) ? batch : [batch]) {
      try { if (room.host) hostMsg(id, m); else clientMsg(m); } catch (e) { console.error('multiplayer message failed', m && m[0], e); }
    }
  };
  room.onJoin = (id) => {
    const seat = LOB.kinds.indexOf('cpu');
    if (seat < 1) return;
    LOB.kinds[seat] = 'human'; LOB.peers[seat] = id;
    if (room.public && !NET.on) lobbyAuto();
    sendLobby(); if (!NET.on) renderLobby();
  };
  room.onLeave = (id) => {
    const seat = LOB.peers.indexOf(id);
    if (seat < 0) return;
    LOB.kinds[seat] = 'cpu'; LOB.peers[seat] = null; NET.q.delete(id);
    if (room.public && !NET.on) lobbyAuto();
    sendLobby(); if (!NET.on) renderLobby();
    if (NET.on && NET.peers[seat] === id) {        // mid-round: a CPU takes the ball over
      NET.peers[seat] = null; NET.seats[seat] = 'cpu'; NET.aLatest[seat] = [0, 0, 0];
      const R = rivalOf(seat);
      if (R) { delete R.vx; delete R.vz; delete R.energy; Object.assign(R, { remote: false, human: false, v: 0, imp: null, wander: 0, energy: 1, dash: false }); }
      toast(`${TEAMS[seat].name} left the game`); netAll(['left', seat]);
    }
  };
  room.onClose = (reason) => { if (NET.room === room) { NET.room = null; dropToMenu(reason || 'Disconnected'); } };
}
async function hostRoom() {
  if (NET.room || NET.joining) return;
  NET.joining = true; $('netMsg').textContent = 'Opening a room…';
  try { bindRoom(await openRoom({ host: true })); } catch (e) { $('netMsg').textContent = (e && e.message) || 'Could not open a room'; return; } finally { NET.joining = false; }
  LOB.kinds = ['human', 'cpu', 'cpu', 'cpu']; LOB.peers = [null, null, null, null]; LOB.seat = 0; LOB.diff = save.difficulty; LOB.auto = null;
  $('netMsg').textContent = '';
  renderLobby(); menuView('mvLobby');
}
// Quick play: into a public game that is waiting for players, or the first one in a new one.
async function quickPlay() {
  if (NET.room || NET.joining) return;
  NET.joining = true; $('netMsg').textContent = 'Looking for a game…';
  let room;
  try { room = await openPublicRoom(); bindRoom(room); } catch (e) { $('netMsg').textContent = (e && e.message) || 'Could not find a game'; return; } finally { NET.joining = false; }
  $('netMsg').textContent = '';
  if (room.host) { LOB.kinds = ['human', 'cpu', 'cpu', 'cpu']; LOB.peers = [null, null, null, null]; LOB.seat = 0; LOB.diff = 'normal'; LOB.auto = null; renderLobby(); menuView('mvLobby'); }
  else $('netMsg').textContent = 'Found a game. Joining…';
}
async function joinRoom(code) {
  code = cleanCode(code);
  if (NET.room || NET.joining) return;
  if (code.length !== 4) { $('netMsg').textContent = 'Enter the 4-letter room code'; return; }
  NET.joining = true; $('netMsg').textContent = 'Joining…';
  try { bindRoom(await openRoom({ host: false, code })); } catch (e) { $('netMsg').textContent = (e && e.message) || 'Could not join that room'; return; } finally { NET.joining = false; }
  $('netMsg').textContent = 'Connected. Waiting for the host…';
}
function startMatch() {                          // (host) everybody in the lobby starts a round
  const room = NET.room;
  if (!room || !room.host || NET.on) return;
  const cfg = { seed: (Math.random() * 2 ** 31) | 0, evTimes: EVENT_TIMES.map((t) => t + Math.round((Math.random() - 0.5) * 6)), kinds: LOB.kinds.slice(), diff: room.public ? 'normal' : save.difficulty };
  NET.peers = LOB.peers.slice(); LOB.auto = null;
  for (let t = 1; t < TEAMS.length; t++) if (NET.peers[t]) room.send(NET.peers[t], [['go', cfg, t]]);
  beginMatch(cfg, 0);
}
function stopBattle() { music.fight(-1); if (battle) { if (battle.destroy) battle.destroy(); battle = null; } if (wheel) { wheel.destroy(); wheel = null; } $('battleui').style.display = 'none'; }
function beginMatch(cfg, seat) {
  stopBattle();
  NET.on = true; NET.host = NET.room.host; NET.client = !NET.host; NET.seat = seat; NET.seats = cfg.kinds.slice();
  if (NET.client) NET.peers = [null, null, null, null];
  start('timed', cfg);
}
function toLobby() {
  stopBattle(); toMenu(); menuView('mvLobby');
  const room = NET.room;
  if (room && room.public && room.host && lobbyAuto()) sendLobby();      // back from a round: the next one counts down
  renderLobby();
}
function dropToMenu(msg) { stopBattle(); $('count').className = ''; toMenu(); menuView(msg ? 'mvMulti' : 'mvHome'); $('netMsg').textContent = msg || ''; }
function leaveRoom(msg) { const room = NET.room; NET.room = null; if (room) room.close(); dropToMenu(msg); }
S.net = NET; S.lob = LOB; S.netClaim = claim;      // debug hooks
S.gfx = { renderer, scene, camera, worldGroup, sun, setQuality, drawWorld, batches, DRAW };      // debug hooks for measuring drawing cost

// ---------- main update ----------
const rollAxis = new V3();
function update(dt) {
  const frozen = S.state !== 'play' && S.state !== 'sim';      // the fly-over and the countdown: everything stands still
  S.time += dt;
  S.hitCool = Math.max(0, S.hitCool - dt); S.ghostT = Math.max(0, (S.ghostT || 0) - dt);
  const vmax = topSpeed(S.d) * MODS.speed;
  let boxers = null, touching = 0;
  const inp = frozen ? { f: 0, t: 0, run: false } : readInput();
  let f = inp.f, t = inp.t, run = !!inp.run;
  if (frozen) S.mdx = 0;
  if (S.stallT > 0) { S.stallT -= dt; f = 0; }
  // the charge dash
  if (!frozen) S.energy = Math.min(1, S.energy + dt / ENERGY_FILL * MODS.energy);
  let hold = run && !frozen && S.boostT <= 0 && S.stallT <= 0;
  if (inp.auto) hold = inp.auto === 'dash' && S.boostT <= 0 && S.charge < 0.7 && (S.charge > 0 || S.energy >= 0.75);      // the playtest bot: wind up most of the way, then let go
  let charging = false, released = 0;
  if (hold && (S.charge > 0 || S.energy >= DASH_MIN)) {
    const add = Math.min(dt / CHARGE_TIME, S.energy, 1 - S.charge);
    S.charge += add; S.energy -= add; charging = true;
    if (add > 0 && Math.floor(S.time * 14) !== Math.floor((S.time - dt) * 14)) tone(180 + 520 * S.charge, 200 + 560 * S.charge, 0.05, 'sawtooth', 0.035);
  } else if (S.charge > 0) { released = S.charge; S.charge = 0; }
  if (released > 0.05) { S.boostT = burstTime(released) * dashLast(S.d); S.boostK = 1 + 0.2 * released; S.dashed = true; burstFx(S, released); tone(240, 1100 + 500 * released, 0.3, 'sawtooth', 0.11); }
  if (charging) chargeFx(S, S.charge, dt);
  else if (S.boostT > 0 && S.dashed && !frozen) trailFx(S, dt);
  aimArrow(S, charging ? S.charge : 0);
  const boosting = S.boostT > 0;
  if (boosting) { S.boostT -= dt; f = 1; }
  run = boosting;
  const top = vmax * (boosting ? dashMult(S.d) * S.boostK : charging ? CHARGE_CRAWL : 1);
  const hf = heft(S.d);
  S.heading -= (t * 2.4 * dt * Math.sqrt(hf) * (boosting ? RUN_STEER : 1) + S.mdx * MOUSE_YAW) * (charging ? CHARGE_STEER : 1);     // a burst dulls the keys; winding up dulls keys and mouse alike
  S.mdx = 0;
  const hx = Math.sin(S.heading), hz = Math.cos(S.heading);
  if (released > 0.05) { const v = vmax * dashMult(S.d) * burstKick(released); S.vx = hx * v; S.vz = hz * v; S.shake = 0.08; }
  if (charging) { const br = Math.exp(-4 * dt); S.vx *= br; S.vz *= br; }          // winding up: the ball digs in
  // Momentum: the ball takes time to get up to speed and to stop, and the faster it is going the less it grips,
  // so at a sprint it keeps sliding the way it was headed long after the camera has turned.
  const fast = Math.hypot(S.vx, S.vz) / vmax;                 // speed as a share of ordinary top speed
  const drive = DRIVE * (boosting ? Math.sqrt(hf) : hf);                  // a heavy ball is slower to get going and to stop
  S.vx += hx * f * top * drive * dt; S.vz += hz * f * top * drive * dt;
  let vf = S.vx * hx + S.vz * hz, vl = -S.vx * hz + S.vz * hx;
  vf *= Math.exp(-drive * (f * vf < 0 ? 2.2 : 1) * dt);        // pulling back brakes harder than coasting
  vl *= Math.exp(-(GRIP * Math.sqrt(hf) / (1 + 2.6 * fast * fast)) * dt);
  S.vx = hx * vf - hz * vl; S.vz = hz * vf + hx * vl;

  // sideways movement, one axis at a time, stopped by any step too tall to climb
  let r = S.d / 2;
  let feet = S.y - S.sup;                          // the lowest point of the (lumpy) ball
  if (terrainContact(S.x, S.z, feet, r)) {         // grew into a cliff: ease away from it
    const l = Math.hypot(tc.x, tc.z);
    if (l > 0.01) { S.x -= tc.x / l * r * 0.06; S.z -= tc.z / l * r * 0.06; }
  }
  const tryX = clamp(S.x + S.vx * dt, BOUNDS.x1 + 5, BOUNDS.x2 - 5);
  if (S.vx !== 0 && terrainContact(tryX, S.z, feet, r, Math.sign(S.vx), 0)) { const n = crashLoss(Math.abs(S.vx), vmax); if (n) hardHit(Math.sign(S.vx), 0, vmax, n); S.vx *= -0.35; }
  else S.x = tryX;
  const tryZ = clamp(S.z + S.vz * dt, BOUNDS.z1 + 5, BOUNDS.z2 - 5);
  if (S.vz !== 0 && terrainContact(S.x, tryZ, feet, r, 0, Math.sign(S.vz))) { const n = crashLoss(Math.abs(S.vz), vmax); if (n) hardHit(0, Math.sign(S.vz), vmax, n); S.vz *= -0.35; }
  else S.z = tryZ;

  // roll (and, while winding up, spin on the spot)
  if (charging) { rollAxis.set(hz, 0, -hx); tmpQ.setFromAxisAngle(rollAxis, (6 + 22 * S.charge) * dt); ball.quaternion.premultiply(tmpQ); }
  const speed = Math.hypot(S.vx, S.vz);
  if (speed > 1e-5) {
    rollAxis.set(S.vz / speed, 0, -S.vx / speed);
    tmpQ.setFromAxisAngle(rollAxis, speed * dt / r);
    ball.quaternion.premultiply(tmpQ);
  }

  // height: ride up over steps, ramps and the ball's own lumps; fall when there is nothing underneath
  const sup = lumpSupport(r), target = groundAt(S.x, S.z) + sup;
  if (S.y < target) {
    const rise = Math.min(target - S.y, (target - S.y) * Math.min(1, 20 * dt) + r * 0.02);
    const slow = Math.max(0.5, 1 - 0.6 * rise / r);         // heaving the ball upward costs speed
    S.vx *= slow; S.vz *= slow;
    S.y += rise; S.vy = 0;
  } else if (S.y > target) {
    S.vy -= 9.8 * (1 + S.d) * dt;
    S.y += S.vy * dt;
    if (S.y <= target) { if (S.vy < -3 - S.d) { S.shake = 0.18; tone(90, 50, 0.18, 'sine', 0.2); } S.y = target; S.vy = 0; }
  }
  S.sup = sup;
  feet = S.y - sup;

  for (let i = S.objects.length - 1; i >= 0; i--) {
    const o = S.objects[i], p = o.group.position;
    if (o.fly) {                                 // knocked loose, in the air
      o.fly.vy -= 9.8 * dt;
      p.x = clamp(p.x + o.fly.vx * dt, BOUNDS.x1 + 5, BOUNDS.x2 - 5); p.y += o.fly.vy * dt; p.z = clamp(p.z + o.fly.vz * dt, BOUNDS.z1 + 5, BOUNDS.z2 - 5);
      o.group.rotation.x += dt * 7;
      const gy = groundAt(p.x, p.z);
      if (p.y <= gy) {
        o.group.rotation.set(0, rand() * 6.28, 0); o.fly = null;
        if (o.kind === 'creature') {
          const w = T.waterAt(p.x, p.z), sw = o.spec.move === 'swim', air = o.spec.move === 'fly' || o.spec.move === 'float';
          if (air || (sw ? w !== 0 : w !== 2)) o.home = [p.x, p.z]; else { p.x = o.home[0]; p.z = o.home[1]; }
        }
        p.y = groundAt(p.x, p.z);
      }
      continue;
    }
    if (o.cool > 0) o.cool -= dt;
    if (o.spawnT > 0) {                          // materialising: grows in with a wobble, and cannot be rolled up for a moment
      o.spawnT -= dt;
      const k = clamp(1 - o.spawnT / 0.9, 0.001, 1);
      o.group.scale.setScalar(o.size * (k < 1 ? k * (1 + 0.35 * Math.sin(k * 9)) : 1));
      if (o.spawnT > 0.3) continue;
    }
    const ox = p.x - S.x, oz = p.z - S.z, dist = Math.hypot(ox, oz);
    o.group.visible = !o.understudy && dist < (o.size * 130 + S.d * 10 + 25) * QUAL.view;   // out to where it is about half a degree across; an understudied critter is drawn as its model instead
    const casts = QUAL.shadows && o.size > S.d * 0.07 && dist < S.d * 14 + 12 + o.size;      // shadows only fall near the ball (see aimSun), and specks need none: which batch it is drawn in (drawWorld)
    o.casts = casts;
    if (NET.client) { if (o.kind === 'creature' || o.ntx !== undefined) puppetThing(o, dt, dist); }      // the host moves the critters; here they glide to where it says
    else if (o.kind === 'creature') {                 // it minds the nearest ball, whoever is pushing it
      let B = S, gap = dist - S.d;
      for (const R of rivals) { const g2 = Math.hypot(p.x - R.x, p.z - R.z) - R.d; if (g2 < gap) { B = R; gap = g2; } }
      if (gap < 60 + B.d * 11) updateCreature(o, dt, B);
    }
    r = S.d / 2;
    const reach = r + o.rad;
    if (o.kind === 'creature' && dist < reach + S.d * 0.35 && (o.noPick || o.size > S.d * pickRatio(S)) && !(S.ghostT > 0)) (boxers || (boxers = [])).push(o);   // a critter too big to roll up, right beside the ball
    if (dist >= reach) continue;
    if (feet > p.y + o.size || S.y + r < p.y) continue;      // on a different level: passes over or under
    if (!o.noPick && o.size <= S.d * pickRatio(S)) { if (o.cool <= 0) { if (NET.client) claim(o); else attach(o); } continue; }
    if (o.spec.flat) continue;
    if (o.onBump && o.cool <= 0) o.onBump(S, o);
    if (o.kind === 'creature' && S.ghostT > 0) continue;        // just thrown clear by a lunge: passes through critters for a moment
    touching++;
    const nx = dist > 1e-6 ? ox / dist : 1, nz = dist > 1e-6 ? oz / dist : 0;
    S.x -= nx * (reach - dist); S.z -= nz * (reach - dist);
    const vn = S.vx * nx + S.vz * nz;
    if (vn > 0) { S.vx -= 1.6 * vn * nx; S.vz -= 1.6 * vn * nz; if (o.size > S.d * 0.8 && !o.onBump) { const n = crashLoss(vn, vmax); if (n) hardHit(nx, nz, vmax, n); } }      // only a sprint into something big knocks things loose
    if (o.kind === 'creature' && o.ai === 'charge') startLunge(o, S);
  }
  // boxed in: hardly moving for most of a second with three or more too-big critters right beside the ball, or held between
  // two solid things at least one of which is such a critter. The critters attack, and their lunges throw the ball clear (see strike).
  S.boxT = boxers && !frozen && Math.hypot(S.vx, S.vz) < vmax * 0.3 && (boxers.length >= 3 || touching >= 2) ? (S.boxT || 0) + dt : 0;
  if (S.boxT > 0.7) { S.boxT = 0; for (const o of boxers) startLunge(o, S); }
  // the slower check, for a ball that can still roll about but is penned in: it has stayed within its own width of one spot
  // for two seconds while pushing, with too-big critters beside it on at least two occasions. Every one of them attacks.
  if (boxers) for (const o of boxers) { o.nearT = S.time; if (!S.pen.includes(o)) S.pen.push(o); }
  if (!S.anchor || Math.hypot(S.x - S.anchor[0], S.z - S.anchor[1]) > Math.max(1.2, S.d * 0.8) || frozen) { S.anchor = [S.x, S.z, S.time]; }
  else if (S.time - S.anchor[2] > 2 && (f !== 0 || t !== 0)) {
    S.pen = S.pen.filter((o) => !o.on && !o.gone && S.time - o.nearT < 2);
    if (S.pen.length >= 2) for (const o of S.pen) startLunge(o, S);
    S.anchor[2] = S.time - 0.8;
  }

  updateRivals(dt, frozen);
  if (NET.client) for (const R of rivals) {             // keep out of the other balls (the host decides what a bump knocks off)
    const dx = S.x - R.x, dz = S.z - R.z, dist = Math.hypot(dx, dz) || 0.001, over = (S.d + R.d) / 2 - dist;
    if (over > 0 && Math.abs(R.y - S.y) < (S.d + R.d) / 2) { const k2 = Math.min(over, S.d * 0.3); if (groundAt(S.x + dx / dist * k2, S.z + dz / dist * k2) - groundAt(S.x, S.z) <= S.d * 0.2) { S.x += dx / dist * k2; S.z += dz / dist * k2; } }
  }

  // ball, trainer, camera
  r = S.d / 2;
  ball.position.set(S.x, S.y, S.z);
  core.scale.setScalar(r);
  const th = trainerHeight(S.d);
  trainer.scale.setScalar(th);
  const tx = S.x - hx * (r + th * 0.32), tz = S.z - hz * (r + th * 0.32);
  let ty = groundAt(tx, tz);
  if (Math.abs(ty - feet) > Math.max(r, th * 0.4)) ty = feet;
  trainer.position.set(tx, ty + Math.abs(Math.sin(S.time * 12)) * th * 0.04 * Math.min(1, speed / (vmax * 0.3)), tz);
  trainer.rotation.y = S.heading;
  poseTrainer(trainer, S.time, speed > 0.25);

  S.camY += (feet - S.camY) * (1 - Math.exp(-5 * dt));      // follows the ground level, not every wobble
  const cd = S.d * 2.7 + th * 1.6, ch = S.d * 1.15 + th;    // close and low; framed on the trainer while the ball is small
  const camL = Math.hypot(cd, ch) * S.zoom, camE = clamp(Math.atan2(ch, cd) + S.pitch, 0.06, 1.35);
  tmpV.set(S.x - hx * camL * Math.cos(camE), S.camY + camL * Math.sin(camE), S.z - hz * camL * Math.cos(camE));
  S.camGoal.copy(tmpV);
  camera.position.lerp(tmpV, 1 - Math.exp(-10 * dt));
  camera.fov += ((boosting ? 72 : charging ? 50 : 55) - camera.fov) * (1 - Math.exp(-5 * dt));
  aimSun(S.x, feet, S.z, S.d);
  const floor = groundAt(camera.position.x, camera.position.z) + S.d * 0.35 + th * 0.2;
  if (camera.position.y < floor) camera.position.y = floor;  // never inside a cliff
  if (charging) { camera.position.x += (rand() - 0.5) * S.d * 0.05 * S.charge; camera.position.y += (rand() - 0.5) * S.d * 0.05 * S.charge; }     // the wind-up rumbles
  $('speedlines').style.opacity = boosting ? Math.min(0.85, S.boostT * 2.5).toFixed(2) : '0';
  if (S.shake > 0) { S.shake -= dt; camera.position.x += (rand() - 0.5) * S.d * 0.25; camera.position.y += (rand() - 0.5) * S.d * 0.25; }
  S.camLook.set(S.x + hx * S.d, S.camY + Math.max(S.d * 0.7, th * 0.6), S.z + hz * S.d);
  camera.lookAt(S.camLook);
  camera.near = Math.max(0.05, S.d * 0.05);
  camera.updateProjectionMatrix();
  S.fogK = (S.fogK ?? 1) + (MODS.fog - (S.fogK ?? 1)) * (1 - Math.exp(-1.5 * dt));
  scene.fog.near = (60 + S.d * 30) * S.fogK; scene.fog.far = (260 + S.d * 120) * S.fogK;
  for (const m of markers.values()) { m.ring.scale.setScalar(1 + 0.06 * Math.sin(S.time * 5)); m.g.rotation.y += dt; }

  tickParts(dt);
  updateSeek(dt, hx, hz);
  updateTags();
  updateSky(dt);
  if (S.mode === 'timed') { updateMini(dt); music.tick(); }
  if (S.mode === 'timed' && !frozen) { S.timeLeft -= dt; tickMatch(dt); if (S.timeLeft <= 0 && S.state === 'play' && !NET.client) timeUp(); }
  if (NET.on) netTick(dt);
  updateHud();
}

S.step = update; S.groundAt = groundAt; S.T = T;   // debug hooks
S.rivals = rivals; S.H = H; S.markers = markers; S.eventIcons = () => [...EVENTS, ORACLE].map((e) => ({ id: e.id, name: e.name, color: e.color || '#ffe169', tag: EVENT_TAGS[e.id] || '', svg: eventIcon(e.id) })); S.timeUp = () => timeUp();
S.render = () => { tickDexPop(0.016); if (S.state === 'battle' && battle) { battle.step(0.016); renderer.render(battle.scene, battle.camera); } else { drawWorld(); renderer.render(scene, camera); } };   // draw one frame now (for background tabs)
// Playtest helper: S.autoplay(seconds) rolls a simple bot through the level in fast-forward and returns a log.
// It chases the nearest thing it can roll up on its own level, and wanders when stuck. Start a level first.
S.autoplay = (seconds, everySec = 30) => {
  const gs = S.autoGate || (S.autoGate = { wedge: Math.floor(rand() * 8) });
  const was = S.state; S.state = 'sim';
  let lastX = S.x, lastZ = S.z, escape = 0, escT = 1, wander = 0, wh = 0, firstCritter = null, hits = 0;
  const log = [];
  for (let i = 0; i < seconds * 30 && S.state === 'sim'; i++) {
    let best = null, bd = 1e9;
    if (wander > 0) wander--;
    else {
      const g0 = groundAt(S.x, S.z);
      for (const o of S.objects) {
        if (o.fly || o.cool > 0 || o.noPick || o.size > S.d * PICK_RATIO || o.size < S.d * 0.08) continue;
        const p = o.group.position, dx = p.x - S.x, dz = p.z - S.z, d = Math.hypot(dx, dz) * (o.kind === 'creature' ? 0.6 : 1);
        if (d < bd && d < 45 + S.d * 5 && Math.abs(groundAt(p.x, p.z) - g0) < S.d * 0.25 + 0.05 && (S.d >= SEA_MIN_D || T.waterAt(p.x, p.z) !== 2)) { bd = d; best = [dx, dz]; }
      }
      if (!best) { wander = 150; wh = rand() * 6.28; }
    }
    if (i % 90 === 0) { if (Math.hypot(S.x - lastX, S.z - lastZ) < S.d * 0.5 + 0.2) { escape = 45; escT = rand() < 0.5 ? 1 : -1; wander = 120; wh = rand() * 6.28; } lastX = S.x; lastZ = S.z; }
    if (escape > 0) { escape--; S.debugInput = { f: escape > 25 ? -1 : 1, t: escT, run: false }; }
    else {
      const goal = wander > 0 ? null : S.time < 10 && Math.hypot(S.x, S.z) > 5 ? PLACES.feast : routeGoal(gs, S.x, S.z, S.d, 1 / 30);
      if (goal) best = [goal[0] - S.x, goal[1] - S.z];
      let diff = (best ? Math.atan2(best[0], best[1]) : wh) - S.heading; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
      S.debugInput = { f: Math.abs(diff) < 1 ? 1 : 0.3, t: clamp(-diff * 3, -1, 1), run: false, auto: !!best && Math.abs(diff) < 0.2 && Math.hypot(best[0], best[1]) > S.d * 5 ? 'dash' : 'none' }; }
    const before = S.caught;
    update(1 / 30);
    if (S.caught < before) hits++;
    if (firstCritter === null && S.attachedCritters > 0) firstCritter = Math.round(S.time);
    if (i % (everySec * 30) === 0) log.push(`${fmtTime(S.time)} ball ${fmtSize(S.d)}, ${S.attachedCritters} critters, ${S.caught} things`);
  }
  S.debugInput = { f: 0, t: 0 };
  return { log, ball: fmtSize(S.d), critters: S.attachedCritters, things: S.caught, knocks: hits, firstCritterAtSec: firstCritter, targetReachedAtSec: S.reachedAt && Math.round(S.reachedAt), speciesInDex: Object.keys(save.dex).length, state: S.state };
};

// ---------- flow ----------
function show(id) { if (id !== null && document.pointerLockElement) document.exitPointerLock(); for (const o of ['menu', 'pause', 'results', 'dex', 'help']) $(o).classList.toggle('open', o === id); $('hud').style.display = id === null || id === 'pause' ? 'block' : 'none'; }
const INTRO_LEN = 5.4;
// Dress the player's ball, trainer and HUD panel in their team's colour.
function dressPlayer() {
  const tm = TEAMS[S.team];
  styleBall(core, S.team, true);
  scene.remove(trainer); trainer = buildTrainer(tm.hex); trainer.scale.setScalar(trainerHeight(START_D)); scene.add(trainer);
  $('size').style.borderTopColor = tm.css;
}
// cfg: a multiplayer match, as the host set it up ({ seed, evTimes, kinds, diff }); null for single player.
function start(mode, cfg = null) {
  audio();
  if (!cfg) { NET.on = NET.host = NET.client = false; NET.seats = ['human', 'cpu', 'cpu', 'cpu']; }
  S.team = cfg ? NET.seat : 0;
  START = { x: STARTS[S.team][0], z: STARTS[S.team][1] };
  dressPlayer();
  const gy = groundAt(START.x, START.z), timed = mode === 'timed';
  Object.assign(S, { state: timed ? 'intro' : 'play', mode, d: START_D, vol3: START_D ** 3, x: START.x, y: gy + START_D / 2, z: START.z, vx: 0, vy: 0, vz: 0, sup: START_D / 2, camY: gy,
    heading: Math.atan2(-START.x, -START.z), time: 0, timeLeft: LEVEL.seconds, reachedAt: null, hitCool: 0, shake: 0, caught: 0, attachedCritters: 0, counts: { type: {}, species: {} }, pitch: 0, zoom: 1, mdx: 0, runSeen: new Map(), runNew: new Set(), zone: '', army: [], autoGate: null,
    phase: 0, lastSec: -1, boostT: 0, stallT: 0, energy: 1, charge: 0, boostK: 1.35, pen: [], anchor: null, ghostT: 0, boxT: 0, introT: 0, cdT: 0, cdStep: -1, cdHold: null, ev: null, evCount: 0, evUsed: new Set(), evTimes: cfg ? cfg.evTimes.slice() : EVENT_TIMES.map((t) => t + Math.round((rand() - 0.5) * 6)), skyOverride: null, fogK: 1, battleResult: null, battleArena: null, ratioBonus: 0, menuOpen: false });
  MODS.knock = 1; MODS.fog = 1; MODS.energy = 1; MODS.speed = 1; MODS.lure = false; H.setIce(false);
  DIFF = DIFFS[cfg ? cfg.diff : save.difficulty] || DIFFS.normal; CPU_SPEED = DIFF.speed;
  clearFx();
  $('timer').classList.remove('hot'); $('evchip').style.display = 'none'; $('count').className = '';
  for (const id of ['phasebar', 'mini']) $(id).style.display = timed ? '' : 'none';
  ball.quaternion.identity();
  populate(cfg ? cfg.seed : undefined);
  makeRivals();
  pickArenas();
  netBegin();
  const hx = Math.sin(S.heading), hz = Math.cos(S.heading);
  camera.position.set(START.x - hx * 1.6, gy + 0.8, START.z - hz * 1.6);
  show(null);
  if (timed) { music.start(); updatePhaseBar(true); const c = $('introcard'); c.classList.remove('show'); void c.offsetWidth; c.classList.add('show'); }
  else music.stop();
}
// The fly-over: the camera circles the Green so everyone can see all four teams on their pads, then drops in behind the player.
const introV = new V3(), introL = new V3();
function tickIntro(dt) {
  S.introT += dt;
  update(dt);
  const swoop = 1.3, u = Math.min(1, S.introT / (INTRO_LEN - swoop)), k2 = clamp((S.introT - (INTRO_LEN - swoop)) / swoop, 0, 1), e = k2 * k2 * (3 - 2 * k2);
  const a = Math.atan2(START.x, START.z) + (1 - u) * (1 - u) * 3.4, R = 66 - 22 * u, hgt = 36 - 17 * u;
  introV.set(Math.sin(a) * R, hgt, Math.cos(a) * R);
  camera.position.lerpVectors(introV, S.camGoal, e);
  introL.set(0, 1.5, 0).lerp(S.camLook, e);
  camera.lookAt(introL);
  if (S.introT >= INTRO_LEN && NET.client && !NET.cdGo) return;                 // everyone counts down together, when the host says
  if (S.introT >= INTRO_LEN && NET.host && NET.ready.size < NET.peers.filter(Boolean).length && S.introT < INTRO_LEN + 8) return;   // give the others a moment to build the map
  if (S.introT >= INTRO_LEN) { netAll(['cd']); S.state = 'countdown'; S.cdT = 0; S.cdStep = -1; S.cdHold = null; $('lights').className = 'show'; for (const l of $('lights').children) l.className = ''; }
}
// The countdown. Hold forward as the 2 lands and keep holding for a rocket start; hold from before the 2 and the ball stalls.
function boostQuality() { const h = S.cdHold; return h === null ? 0 : h < 1 ? -1 : h < 1.4 ? 2 : h < 2 ? 1 : 0; }
function tickCountdown(dt) {
  S.cdT += dt;
  update(dt);
  const fwd = readInput().f > 0.5;
  if (fwd && S.cdHold === null) S.cdHold = S.cdT; else if (!fwd) S.cdHold = null;
  const step = Math.floor(S.cdT);
  if (step !== S.cdStep && step < 3) {
    S.cdStep = step; showCount(String(3 - step), 'cd'); tone(440, 440, 0.2, 'square', 0.16);
    $('lights').children[step].className = 'red';
  }
  const q = boostQuality(), hint = $('boosthint');
  hint.textContent = q === 2 ? 'Perfect! Keep holding...' : q === 1 ? 'Good! Keep holding...' : q === -1 ? 'Too early - the ball will stall!' : S.cdHold !== null ? 'Too late for a boost' : 'Hold forward as the 2 lands for a rocket start';
  hint.className = 'pill show q' + (q + 1);
  if (S.cdT >= 3) go(q);
}
function go(q) {
  S.state = 'play'; S.time = 0;
  showCount('GO!', 'go'); tone(880, 880, 0.55, 'square', 0.18);
  for (const l of $('lights').children) l.className = 'green';
  $('boosthint').className = 'pill';
  setTimeout(() => { $('lights').className = ''; }, 900);
  const hx = Math.sin(S.heading), hz = Math.cos(S.heading), v = topSpeed(S.d) * RUN;
  S.boostK = 1.35; S.dashed = true;
  if (q === 2) { S.boostT = 2.3; S.vx = hx * v * 1.2; S.vz = hz * v * 1.2; toast('ROCKET START!'); tone(200, 1400, 0.5, 'sawtooth', 0.12); }
  else if (q === 1) { S.boostT = 1.1; S.vx = hx * v * 0.8; S.vz = hz * v * 0.8; toast('Boost start!'); tone(200, 900, 0.35, 'sawtooth', 0.1); }
  else if (q === -1) { S.stallT = 0.9; toast('Stalled! Too early'); tone(220, 60, 0.5, 'sawtooth', 0.14); }
  for (const R of rivals) { if (R.remote) continue; const r = rand(); if (r < 0.28) R.boostT = 2.3; else if (r < 0.58) R.boostT = 1.1; else if (r < 0.7) R.stallT = 0.9; R.dashUntil = 14; }
  showArea('Race to the feast!');
}
function togglePause() {
  if (NET.on) {                                  // a multiplayer round cannot stop for one player: the menu opens over the running game
    if (S.state !== 'play') return;
    S.menuOpen = !S.menuOpen; show(S.menuOpen ? 'pause' : null);
  }
  else if (S.state === 'play') { S.state = 'paused'; show('pause'); }
  else if (S.state === 'paused') { S.state = 'play'; show(null); }
  else if (S.state === 'battle' && battle && battle.modern) { S.state = 'battlepause'; S.skipHold = 0; show('pause'); $('hud').style.display = 'none'; }      // the arena fight can be paused too (single player); the round's own HUD stays away
  else if (S.state === 'battlepause') { S.state = 'battle'; show('battle'); }
  $('pauseTitle').textContent = NET.on ? 'Game menu' : 'Paused';
  $('btnEnd').textContent = NET.on ? 'Leave game' : S.state === 'battlepause' ? 'Skip to the result' : 'End run';
}
function finish() {
  endEvent(); clearFx(); music.stop();
  S.state = 'results';
  const b = save.best;
  let title, rows = `<tr><td>Your ball</td><td>${fmtSize(START_D)} → <b>${fmtSize(S.d)}</b> (${(S.d / START_D).toFixed(0)} times as wide)</td></tr><tr><td>Critters rolled up</td><td>${S.attachedCritters} of ${S.critters}</td></tr><tr><td>Everything rolled up</td><td>${S.caught}</td></tr>`;
  if (S.mode === 'timed') {
    const w = S.battleResult ? S.battleResult.winner : -1;
    title = winnerText(w);
    rows = battleRows() + rows;
    if (w === S.team) { b.wins = (b.wins || 0) + 1; sfxWin(); }
    if (!b.timedSize || S.d > b.timedSize) b.timedSize = S.d;
    rows += `<tr><td>Best size</td><td>${fmtSize(b.timedSize)}</td></tr>`;
  } else {
    title = 'Free roam over';
    if (!b.freeSize || S.d > b.freeSize) b.freeSize = S.d;
    rows += `<tr><td>Best size</td><td>${fmtSize(b.freeSize)}</td></tr>`;
  }
  persist();
  $('resTitle').textContent = title;
  const seen = [...S.runSeen.keys()].map((id) => SPECS[id].spec).sort((a, b2) => a.dex - b2.dex);
  const lineup = seen.length ? `<div class="lineup">${seen.map((sp) => `<span class="${S.runNew.has(sp.id) ? 'isnew' : ''}" title="${sp.name}"><img src="${thumbs[sp.id] || ''}" alt="${sp.name}"></span>`).join('')}</div><p class="sub">${seen.length} species this run${S.runNew.size ? `, ${S.runNew.size} new to your dex (gold)` : ''}</p>` : '';
  $('resBody').innerHTML = `<table class="res">${rows}</table>${lineup}`;
  $('btnAgain').textContent = NET.on ? 'Back to lobby' : 'Play again'; $('btnMenu').textContent = NET.on ? 'Leave' : 'Menu'; S.resAt = 0;
  show('results');
}
function toMenu() {
  NET.on = NET.host = NET.client = false; S.menuOpen = false;
  S.state = 'menu'; S.phase = 0; S.skyOverride = null; music.stop(); clearFx(); skyNow.setHex(SKY); scene.background.setHex(SKY); scene.fog.color.setHex(SKY);
  const b = save.best, parts = [];
  if (b.wins) parts.push(b.wins + (b.wins === 1 ? ' battle won' : ' battles won'));
  if (b.timedSize) parts.push('best ball ' + fmtSize(b.timedSize));
  $('best').textContent = parts.join(' · ');
  show('menu');
}

// ---------- dex ----------
const thumbs = {};
function makeThumbs() {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(96, 96);
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2.2));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(2, 3, 4); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  for (const spec of CREATURES) {
    const g = buildCreature(spec, true);
    sc.add(g);
    const b = g.geometry.boundingBox, c = b.getCenter(new V3()), s = b.getSize(new V3()).length();
    cam.position.set(c.x + s * 0.95, c.y + s * 0.5, c.z + s * 1.65); cam.lookAt(c);
    r.render(sc, cam);
    thumbs[spec.id] = r.domElement.toDataURL();
    sc.remove(g);
  }
  r.dispose(); r.forceContextLoss();
}
function openDex(all) {
  let html = '', seen = 0;
  for (const sp of CREATURES) {
    const e = save.dex[sp.id], num = '#' + String(sp.dex).padStart(3, '0');
    if (e && e.count) seen++;
    html += (e && e.count) || all
      ? `<div class="dex"><img src="${thumbs[sp.id] || ''}" alt=""><div>${num} ${sp.name}</div><div class="meta">${sp.species}</div>${typeChips(sp)}<div class="meta">${sp.height} m · ${sp.rarity} · ${sp.temper}</div><div class="meta">${areaOfSpec(sp)}${e && e.count ? ' · caught ' + e.count : ''}</div></div>`
      : `<div class="dex unseen"><img src="${thumbs[sp.id] || ''}" alt=""><div>${num} ???</div><div class="meta">${sp.height} m · ${sp.rarity}</div><div class="meta">seen in: ${areaOfSpec(sp)}</div></div>`;
  }
  $('dexgrid').innerHTML = html;
  $('dexcount').textContent = `${seen}/${CREATURES.length}`;
  S.state = 'dex'; show('dex');
}
globalThis.S = S;       // main.js is a module, so the console hooks below need S put somewhere reachable
S.openDex = openDex;    // S.openDex(true) from the console shows every critter, caught or not
S.grab = (n = 1) => { const near = S.objects.filter((o) => o.kind === 'creature' && !o.on && !o.gone)
  .sort((a, b) => Math.hypot(a.group.position.x - S.x, a.group.position.z - S.z) - Math.hypot(b.group.position.x - S.x, b.group.position.z - S.z));
  let k = 0; for (const o of near.slice(0, n)) { attach(o); k++; } return k + ' rolled up'; };   // S.grab(5) from the console, for testing pick-ups
S.dexPop = (n) => showDexPop(CREATURES[Math.max(1, Math.min(151, n)) - 1], true, 1);   // S.dexPop(4) from the console shows one entry's card

// ---------- wiring ----------
$('btnTimed').onclick = () => start('timed');
$('btnFree').onclick = () => start('free');
$('btnDex').onclick = () => openDex(false);
$('btnDexBack').onclick = toMenu;
$('btnResume').onclick = togglePause;
$('btnEnd').onclick = () => { if (NET.on) leaveRoom(); else if (S.state === 'battlepause') { S.state = 'battle'; show('battle'); skipBattle(); } else if (S.mode === 'timed') { S.state = 'play'; show(null); timeUp(); } else finish(); };
$('btnAgain').onclick = () => { if (NET.room) toLobby(); else start(S.mode); };
$('btnMenu').onclick = () => { if (NET.room) leaveRoom(); else toMenu(); };
for (const id of ['btnMute', 'btnMute2', 'hudMute']) $(id).onclick = () => setMuted(!save.muted);
for (const id of ['btnGfx', 'btnGfx2']) $(id).onclick = cycleGfx;
function setDifficulty(d) {
  save.difficulty = DIFFS[d] ? d : 'normal'; persist();
  for (const k2 in DIFFS) for (const pre of ['diff_', 'ldiff_']) $(pre + k2).classList.toggle('on', k2 === save.difficulty);
  if (NET.room && NET.room.host) sendLobby();
}
for (const k2 in DIFFS) for (const pre of ['diff_', 'ldiff_']) $(pre + k2).onclick = () => setDifficulty(k2);
setDifficulty(save.difficulty);
setMuted(!!save.muted);
$('btnSkip').onclick = skipBattle;
// the title screen: a home view, and one each for single player, multiplayer and the room lobby
function menuView(v) { for (const id of ['mvHome', 'mvSolo', 'mvMulti', 'mvLobby']) $(id).classList.toggle('on', id === v); $('menu').classList.toggle('inner', v !== 'mvHome'); }
$('btnSolo').onclick = () => menuView('mvSolo');
$('btnMulti').onclick = () => { $('netMsg').textContent = ''; menuView('mvMulti'); };
for (const b of document.querySelectorAll('[data-back]')) b.onclick = () => menuView('mvHome');
$('btnHelp').onclick = () => { S.state = 'dex'; show('help'); };
$('btnHelpBack').onclick = toMenu;
$('btnHost').onclick = () => hostRoom();
$('btnQuick').onclick = () => quickPlay();
$('btnJoin').onclick = () => joinRoom($('joinCode').value);
$('joinCode').addEventListener('input', (e) => { e.target.value = cleanCode(e.target.value); });
$('joinCode').addEventListener('keydown', (e) => { if (e.code === 'Enter') joinRoom($('joinCode').value); });
$('btnStartMp').onclick = () => startMatch();
$('btnLeave').onclick = () => leaveRoom();
$('btnCopy').onclick = () => {
  const u = new URL(location.href); u.searchParams.set('room', NET.room.code);
  const done = () => { $('btnCopy').textContent = 'Link copied!'; setTimeout(() => { $('btnCopy').textContent = 'Copy invite link'; }, 1600); };
  try { navigator.clipboard.writeText(u.href).then(done, () => prompt('Copy this link:', u.href)); } catch (e) { prompt('Copy this link:', u.href); }
};

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  if (battle) { if (battle.resize) battle.resize(innerWidth / innerHeight); else { battle.camera.aspect = innerWidth / innerHeight; battle.camera.updateProjectionMatrix(); } }
}
addEventListener('resize', resize);
applyGfx();
makeThumbs();
// The local Stadium-model build, if its switch is on and the models are there. Everything
// it changes lives in critters/local-mode.js; this is the only place the game starts it.
LOCAL.init({ scene, camera, renderer, S, baseOf, mat, TEAMS, CREATURES, TITANS }).then((live) => {
  if (!live) return;
  styleBall(core, S.team || 0, true);      // the ball was built before the switch was known
  LOCAL.hooks(S);
});
populate();
toMenu();
menuView('mvHome');
{ const code = cleanCode(new URLSearchParams(location.search).get('room')); if (code.length === 4) { $('joinCode').value = code; menuView('mvMulti'); joinRoom(code); } }   // opened from an invite link

let last = performance.now(), menuSpin = 0;
// Frame-rate watch (animation frames only): every two seconds of play, the average rate. Auto quality steps down below 30.
const FPS = { n: 0, t0: performance.now(), now: 0, ms: 0, low: 0 };
function watchFps(now) {
  FPS.n++;
  const span = now - FPS.t0;
  if (span < 2000) return;
  FPS.now = FPS.n * 1000 / span; FPS.ms = span / FPS.n; FPS.n = 0; FPS.t0 = now;
  const playing = S.state === 'play' || S.state === 'battle';
  if (!playing || document.hidden || span > 3000) { FPS.low = 0; return; }       // (a gap that long was a pause or a hidden tab, not a slow machine)
  FPS.low = FPS.now < 30 ? FPS.low + 1 : 0;
  if (save.gfx === 'auto' && FPS.low >= 2 && qualLevel < QUALITY.length - 1) { FPS.low = 0; setQuality(qualLevel + 1); save.gfxAuto = qualLevel; persist(); showGfx(); toast('Graphics lowered to keep the game smooth'); }
}
function showGfx() { for (const id of ['btnGfx', 'btnGfx2']) $(id).textContent = 'Graphics: ' + (save.gfx === 'auto' ? `auto (${QUAL.name})` : QUAL.name); }
function cycleGfx() {
  const names = ['auto', ...QUALITY.map((q) => q.name)];
  save.gfx = names[(names.indexOf(save.gfx) + 1) % names.length]; if (save.gfx === 'auto') save.gfxAuto = 0;
  persist(); applyGfx();
}
function applyGfx() { const k2 = QUALITY.findIndex((q) => q.name === save.gfx); setQuality(k2 >= 0 ? k2 : save.gfxAuto || 0); showGfx(); }
// The readout (F3): frame rate, and in multiplayer how the connection is doing. For telling a slow machine from a slow link.
let statsT = 0;
function showStats(now) {
  if (!NET.stats || now - statsT < 1000) return;
  const secs = (now - statsT) / 1000; statsT = now;
  let txt = `${FPS.now.toFixed(0)} fps (${FPS.ms.toFixed(0)} ms) · graphics ${QUAL.name} · ${renderer.info.render.calls} draws · ${DRAW.things} things in ${DRAW.batches} batches`;
  if (NET.room) {
    const back = NET.host ? Math.max(0, ...NET.peers.filter(Boolean).map((id) => NET.room.buffered(id))) : NET.room.buffered('host');
    txt += `\n${NET.room.host ? 'host' : 'player'}${NET.room.public ? ' (public)' : ''} · ${NET.on ? `sent ${(NET.bOut / secs / 1000).toFixed(1)} kB/s · received ${(NET.bIn / secs / 1000).toFixed(1)} kB/s · waiting to send ${back} B` : 'in the lobby'}`;
    if (NET.client) txt += `\nping ${NET.ping < 0 ? '?' : NET.ping + ' ms'} · ${(NET.nIn / secs).toFixed(0)} updates/s · last heard ${NET.lag.toFixed(1)} s ago · fast channel ${NET.room.fastState ? NET.room.fastState('host') : 'n/a'}`;
  }
  NET.bOut = NET.bIn = NET.nIn = 0;
  $('netstats').textContent = txt;
}
addEventListener('keydown', (e) => { if (e.code === 'F3') { e.preventDefault(); NET.stats = !NET.stats; $('netstats').style.display = NET.stats ? 'block' : 'none'; statsT = 0; } });
function frame(now) { watchFps(now); showStats(now); tick(now); requestAnimationFrame(frame); }
// A hidden or covered tab gets few or no animation frames, which would freeze a multiplayer game for everyone else: a
// worker's timer keeps this one ticking while it is in a room.
try {
  const w = new Worker(URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 33)'], { type: 'text/javascript' })));
  const always = new URLSearchParams(location.search).has('keepalive');      // ?keepalive: also in single player (for testing in a hidden tab)
  // No frame for a quarter of a second: tick anyway, and make up the time. (One tick covers at most 50 ms, so a single
  // tick per quarter second ran the game at a fifth of its speed: for every player, if it was the host's tab that was hidden.)
  w.onmessage = () => {
    lobbyTick();
    if (!(NET.room || always) || S.state === 'menu') return;
    const now = performance.now(), lag = now - last;
    if (lag <= 250) return;
    const n = Math.min(20, Math.ceil(lag / 50)), from = now - Math.min(lag, n * 50);
    for (let i = 1; i <= n; i++) tick(from + (now - from) * i / n);
  };
} catch (e) { /* no workers: the game simply waits while hidden */ }
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  if (dt <= 0) return;
  last = now;
  pollPadButtons();
  tickDexPop(dt);
  if (S.state === 'play') { update(dt); LOCAL.tickWorld(dt); }
  else LOCAL.clearWorld();
  if (S.state === 'intro') tickIntro(dt);
  else if (S.state === 'countdown') tickCountdown(dt);
  else if (S.state === 'timeup') tickTimeUp(dt);
  else if (S.state === 'wheel' && wheel) tickWheel(dt);
  else if (S.state === 'battle' && battle) tickBattle(dt);
  else if (S.state === 'menu' || S.state === 'dex') {   // slow orbit over the island behind the menu
    menuSpin += dt * 0.08;
    const gy = groundAt(START.x, START.z);
    ball.position.set(START.x, gy + START_D / 2, START.z); core.scale.setScalar(START_D / 2);
    trainer.scale.setScalar(trainerHeight(START_D)); trainer.position.set(START.x, gy, START.z + 0.35); trainer.rotation.y = Math.PI;
    camera.position.set(Math.sin(menuSpin) * 250, 150, Math.cos(menuSpin) * 250);
    camera.lookAt(0, 0, 0);
    scene.fog.near = 400; scene.fog.far = 1600;
    aimSun(0, 0, 0, 12);
  }
  netFlush(); lobbyTick();
  if (document.hidden) return;
  if ((S.state === 'battle' || S.state === 'battlepause') && battle) renderer.render(battle.scene, battle.camera); else { drawWorld(); renderer.render(scene, camera); }
}
requestAnimationFrame(frame);
