// The end-of-round battle: every critter each team is holding fights in a square arena, automatically.
//
// Each critter's strength comes from three things:
//   - the six base stats of its Pokedex slot (critters/battle-data.js)
//   - its size: health and damage are multiplied by the square root of its height in metres,
//     so a 4 m critter hits and lasts twice as hard as a 1 m one with the same stats
//   - type matchups: it attacks with whichever of its own types is best against its target
// Behaviour: pick the nearest enemy (leaning towards ones it has a type advantage over), close in, and hit it
// every `interval` seconds. Critters whose special attack is higher than their attack fight at range.
import * as THREE from 'three';
import { STATS, TYPE_CHART } from './critters/battle-data.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const INTRO = 3.5;          // seconds the armies stand facing each other before the fight
const TIME_LIMIT = 150;     // seconds of fighting before it is decided on remaining health
const HP_SCALE = 10, DMG_BASE = 8, DMG_RATIO = 22;    // tuned so an even fight lasts about half a minute

export function typeMult(att, defs) { let m = 1; for (const d of defs) m *= (TYPE_CHART[att] && TYPE_CHART[att][d] !== undefined ? TYPE_CHART[att][d] : 1); return m; }
export function unitStats(spec) {
  const b = STATS[spec.dex] || [50, 50, 50, 50, 50, 50], m = Math.sqrt(spec.height);
  const special = b[3] > b[1];
  return {
    maxHp: b[0] * HP_SCALE * m, atk: special ? b[3] : b[1], special, def: b[2], spd: b[4], spe: b[5], m,
    interval: clamp(1.7 - b[5] / 140, 0.65, 1.6),        // faster critters attack more often
    speed: 1.4 + b[5] / 45 + spec.height * 0.25,          // and get there sooner
    range: special ? 4 + spec.height : 0,
  };
}
// One number for the scoreboard: base stat total scaled by size.
export function power(spec) { const b = STATS[spec.dex] || [50, 50, 50, 50, 50, 50]; return (b[0] + b[1] + b[2] + b[3] + b[4] + b[5]) * Math.sqrt(spec.height) / 100; }

export function createBattle({ teams, buildMesh }) {
  const total = teams.reduce((n, t) => n + t.army.length, 0);
  const biggest = teams.reduce((h, t) => Math.max(h, ...t.army.map((s) => s.height), 0), 0);
  const L = clamp(16 + 1.1 * Math.sqrt(total) + biggest * 1.5, 24, 90);    // arena side, metres: tight enough that the armies fill it

  // ---- arena
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ad8f5);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f7a, 1.9));
  const sun = new THREE.DirectionalLight(0xfff4d6, 1.8); sun.position.set(L * 0.4, L, L * 0.3); scene.add(sun);
  const flat = (w, d, color, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), new THREE.MeshLambertMaterial({ color })); m.position.set(x, y, z); scene.add(m); return m; };
  flat(L * 4, L * 4, 0x7ec86a, 0, -0.35, 0);                    // grass all round
  flat(L, L, 0xe6d7a8, 0, -0.1, 0);                             // sand floor
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xb89a6a });
  for (const [x, z, w, d] of [[0, -L / 2 - 0.5, L + 2, 1], [0, L / 2 + 0.5, L + 2, 1], [-L / 2 - 0.5, 0, 1, L], [L / 2 + 0.5, 0, 1, L]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), wallMat); m.position.set(x, 0.7, z); scene.add(m);
  }
  // each team's side is marked in its colour, with a banner pole at the middle of it
  const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]];             // north, east, south, west
  teams.forEach((tm, k) => {
    const [sx, sz] = SIDES[k], along = sx === 0;
    flat(along ? L * 0.9 : L * 0.05, along ? L * 0.05 : L * 0.9, tm.hex, sx * L * 0.46, 0.02, sz * L * 0.46);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 8), wallMat); pole.position.set(sx * (L / 2 + 1.5), 3.5, sz * (L / 2 + 1.5)); scene.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 0.08), new THREE.MeshLambertMaterial({ color: tm.hex })); flag.position.set(sx * (L / 2 + 1.5) + 1.3, 6.1, sz * (L / 2 + 1.5)); scene.add(flag);
  });
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);

  // ---- units
  const units = [];
  teams.forEach((tm, k) => {
    const [sx, sz] = SIDES[k];
    for (const spec of tm.army) {
      const along = (Math.random() - 0.5) * L * 0.8, depth = L * 0.5 - 2 - Math.random() * L * 0.17;
      const x = sx === 0 ? along : sx * depth, z = sz === 0 ? along : sz * depth;
      const st = unitStats(spec), mesh = buildMesh(spec, k);
      mesh.scale.setScalar(spec.height);
      scene.add(mesh);
      units.push({ team: k, spec, st, hp: st.maxHp, x, z, yaw: Math.atan2(-x, -z), cd: Math.random() * 0.8, target: null, rt: Math.random() * 1.2, mesh,
        r: Math.max(0.15, spec.height * 0.3), alive: true, die: 0, lunge: 0, flash: 0, dmg: 0, kills: 0, moving: false,
        air: spec.move === 'fly' || spec.move === 'float', phase: Math.random() * 6.28 });
    }
  });
  const B = { t: 0, finished: false, winner: -1, fought: 0 };
  const effCache = new Map();
  const bestEff = (u, v) => {                                   // the best multiplier any of u's types gets against v
    const key = u.spec.dex * 200 + v.spec.dex;
    let e = effCache.get(key);
    if (e === undefined) { e = Math.max(...u.spec.types.map((t) => typeMult(t, v.spec.types))); effCache.set(key, e); }
    return e;
  };

  // ---- ranged-attack bolts (purely visual)
  const boltGeo = new THREE.BoxGeometry(0.12, 0.12, 1), bolts = [];
  const boltMats = teams.map((tm) => new THREE.MeshBasicMaterial({ color: tm.hex }));
  function bolt(u, t) {
    if (bolts.length > 80) return;
    const m = new THREE.Mesh(boltGeo, boltMats[u.team]);
    const y1 = u.spec.height * 0.6, y2 = t.spec.height * 0.5, dx = t.x - u.x, dz = t.z - u.z, dy = y2 - y1;
    m.position.set((u.x + t.x) / 2, (y1 + y2) / 2, (u.z + t.z) / 2);
    m.lookAt(t.x, y2, t.z);
    m.scale.set(1 + u.spec.height * 0.6, 1 + u.spec.height * 0.6, Math.hypot(dx, dy, dz));
    scene.add(m); bolts.push({ m, life: 0.1 });
  }

  function separate(alive) {                                    // keep critters from standing inside each other
    const cell = 4, grid = new Map();
    for (const u of alive) { const key = Math.floor(u.x / cell) * 1000 + Math.floor(u.z / cell); (grid.get(key) || grid.set(key, []).get(key)).push(u); }
    for (const u of alive) {
      const cx = Math.floor(u.x / cell), cz = Math.floor(u.z / cell), reach = Math.ceil((u.r + 3) / cell);
      for (let i = -reach; i <= reach; i++) for (let j = -reach; j <= reach; j++) {
        const list = grid.get((cx + i) * 1000 + cz + j);
        if (!list) continue;
        for (const v of list) {
          if (v === u) continue;
          const dx = u.x - v.x, dz = u.z - v.z, d = Math.hypot(dx, dz) || 0.001, min = (u.r + v.r) * 0.9;
          if (d < min) { const push = (min - d) * (v.r * v.r) / (u.r * u.r + v.r * v.r) * 0.5; u.x += dx / d * push; u.z += dz / d * push; }   // the smaller one gives way
        }
      }
      const lim = L / 2 - u.r;
      u.x = clamp(u.x, -lim, lim); u.z = clamp(u.z, -lim, lim);
    }
  }

  function simulate(dt) {
    B.fought += dt;
    const alive = units.filter((u) => u.alive);
    for (const u of alive) {
      u.rt -= dt; u.cd -= dt;
      if (!u.target || !u.target.alive || u.rt <= 0) {
        u.rt = 1 + Math.random() * 0.5;
        let best = null, bs = 1e9;
        for (const v of alive) {
          if (v.team === u.team) continue;
          const s = Math.hypot(v.x - u.x, v.z - u.z) * (1.3 - 0.15 * Math.min(bestEff(u, v), 2));
          if (s < bs) { bs = s; best = v; }
        }
        u.target = best;
      }
      const t = u.target;
      if (!t) { u.moving = false; continue; }
      const dx = t.x - u.x, dz = t.z - u.z, d = Math.hypot(dx, dz) || 0.001;
      const reach = u.st.range > 0 ? u.st.range + t.r : u.r + t.r + 0.25;
      u.yaw = Math.atan2(dx, dz);
      if (d > reach) { u.x += dx / d * u.st.speed * dt; u.z += dz / d * u.st.speed * dt; u.moving = true; }
      else {
        u.moving = false;
        if (u.cd <= 0) {
          const eff = bestEff(u, t), D = u.st.special ? t.st.spd : t.st.def;
          const dmg = eff === 0 ? 1 : (DMG_BASE + DMG_RATIO * u.st.atk / D) * eff * u.st.m * (0.85 + Math.random() * 0.3);
          t.hp -= dmg; u.dmg += dmg; t.flash = 0.18; u.lunge = 0.18; u.cd = u.st.interval;
          if (u.st.range > 0) bolt(u, t);
          if (t.hp <= 0) { t.alive = false; t.die = 0.7; u.kills++; }
        }
      }
    }
    separate(alive.filter((u) => u.alive));
    const left = new Set(units.filter((u) => u.alive).map((u) => u.team));
    if (left.size <= 1 || B.fought > TIME_LIMIT) {
      B.finished = true;
      const hp = teams.map((_, k) => units.reduce((s, u) => s + (u.alive && u.team === k ? u.hp : 0), 0));
      const top = Math.max(...hp);
      B.winner = top > 0 ? hp.indexOf(top) : -1;
      B.timedOut = left.size > 1;
    }
  }

  const look = new THREE.Vector3();
  let camAng = 0.6, camDist = L * 0.8;
  function visuals(dt) {
    let sx = 0, sz = 0, n = 0, spread = 0;
    for (const u of units) {
      const h = u.spec.height;
      if (u.alive) {
        u.lunge = Math.max(0, u.lunge - dt); u.flash = Math.max(0, u.flash - dt);
        const lu = u.lunge > 0 ? Math.sin(u.lunge / 0.18 * Math.PI) * Math.min(0.6, u.r) : 0;
        const y = u.air ? h * (0.4 + 0.08 * Math.sin(B.t * 3 + u.phase)) : u.moving ? Math.abs(Math.sin(B.t * 9 + u.phase)) * h * 0.1 : 0;
        u.mesh.position.set(u.x + Math.sin(u.yaw) * lu, y, u.z + Math.cos(u.yaw) * lu);
        u.mesh.rotation.set(0, u.yaw, 0);
        u.mesh.scale.setScalar(h * (1 + (u.flash > 0 ? 0.14 : 0)));
        sx += u.x; sz += u.z; n++;
      } else if (u.die > 0) {                                   // topple and shrink away
        u.die -= dt;
        const k = Math.max(0, u.die / 0.7);
        u.mesh.rotation.z = (1 - k) * 1.5;
        u.mesh.scale.setScalar(h * (0.25 + 0.75 * k));
        if (u.die <= 0) scene.remove(u.mesh);
      }
    }
    for (let i = bolts.length - 1; i >= 0; i--) { bolts[i].life -= dt; if (bolts[i].life <= 0) { scene.remove(bolts[i].m); bolts.splice(i, 1); } }
    if (n) { sx /= n; sz /= n; for (const u of units) if (u.alive) spread = Math.max(spread, Math.hypot(u.x - sx, u.z - sz) + u.spec.height); }
    look.lerp(new THREE.Vector3(sx, 1, sz), 1 - Math.exp(-1.5 * dt));
    camDist += (clamp(spread * 1.15 + 7, 12, L * 0.85) - camDist) * (1 - Math.exp(-1.2 * dt));
    camAng += dt * 0.14;
    camera.position.set(look.x + Math.sin(camAng) * camDist, camDist * 0.42 + 2, look.z + Math.cos(camAng) * camDist);
    camera.lookAt(look);
  }

  return {
    scene, camera, units, size: L,
    get finished() { return B.finished; },
    get intro() { return Math.max(0, INTRO - B.t); },
    step(dt) {
      B.t += dt;
      if (B.t < INTRO) separate(units);
      else if (!B.finished) simulate(dt);
      visuals(dt);
    },
    skip() {                                    // play the rest out instantly
      B.t = Math.max(B.t, INTRO);
      for (let i = 0; i < 30000 && !B.finished; i++) { simulate(1 / 30); B.t += 1 / 30; }
      for (const u of units) if (!u.alive && u.die > 0) { u.die = 0; scene.remove(u.mesh); }
      visuals(0);
    },
    status() {
      return teams.map((tm, k) => {
        let alive = 0, all = 0, hp = 0, max = 0;
        for (const u of units) if (u.team === k) { all++; max += u.st.maxHp; if (u.alive) { alive++; hp += u.hp; } }
        return { alive, all, hp: max ? hp / max : 0 };
      });
    },
    result() {
      const mvp = units.reduce((a, u) => (!a || u.dmg > a.dmg ? u : a), null);
      return { winner: B.winner, timedOut: !!B.timedOut, seconds: B.fought, mvp: mvp && mvp.dmg > 0 ? { name: mvp.spec.name, team: mvp.team, damage: Math.round(mvp.dmg), kills: mvp.kills } : null };
    },
  };
}
