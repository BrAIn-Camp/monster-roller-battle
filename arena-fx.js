// Effects for the arena: everything that flashes, flies, bursts or glows. None of it decides anything (the fight is
// arena-sim.js); this only draws, with its own cosmetic dice, so it can never put two machines out of step.
//
//   const fx = createFx({ scene, camera, L })
//   fx.spark / fx.puff            little cubes (solid) or glowing blobs (additive), from two instanced pools
//   fx.ring / disc / flash / beam / bolt / slash / star / shard     one-shot shapes that animate and remove themselves
//   fx.hold(...)                  a shape that stays until released (telegraphs, pools, ice blocks)
//   fx.step(dt)                   once a frame
import * as THREE from 'three';

export const TYPE_HEX = { normal: 0xd8d2c0, fire: 0xff7a2a, water: 0x4aa8ff, grass: 0x5fd058, electric: 0xffe34a, ice: 0x9fe8f5, fighting: 0xe2603a, poison: 0xb866d8, ground: 0xd9aa55, flying: 0xa8c4ff, psychic: 0xff6fa8, bug: 0xb4d83a, rock: 0xb09a70, ghost: 0x8a6fd0, dragon: 0x7a6aff, dark: 0x6a5568, steel: 0xb4bece };
export const TYPE_GLOW = { normal: 0xffffff, fire: 0xffd23f, water: 0xbfe6ff, grass: 0xc8ff8a, electric: 0xffffff, ice: 0xffffff, fighting: 0xffc09a, poison: 0xe6a8ff, ground: 0xffe2a0, flying: 0xffffff, psychic: 0xffc2dc, bug: 0xe8ff9a, rock: 0xe6d6b0, ghost: 0xc9b6ff, dragon: 0xc4bcff, dark: 0xb89ab4, steel: 0xffffff };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = (k) => 1 - (1 - k) * (1 - k);

// ---- shared shapes, built once and kept (every fight uses the same ones). Flat ones lie on the floor (y up);
// upright ones face the camera.
const flat = (g) => g.rotateX(-Math.PI / 2);
let SHAPES = null;
function shapes() {
  if (SHAPES) return SHAPES;
  const star4 = (() => {                                        // a four-point impact star
    const s = new THREE.Shape(), n = 8;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = i % 2 ? 0.13 : 1; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    return new THREE.ShapeGeometry(s);
  })();
  const star5 = (() => {                                        // a five-point star (merge stars, dizzy stars)
    const s = new THREE.Shape(), n = 10;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.45 : 1; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    return new THREE.ShapeGeometry(s);
  })();
  const chevron = (() => {                                      // an up-pointing chevron
    const s = new THREE.Shape();
    s.moveTo(0, 0.5); s.lineTo(0.8, -0.3); s.lineTo(0.8, -0.75); s.lineTo(0, 0.05); s.lineTo(-0.8, -0.75); s.lineTo(-0.8, -0.3); s.closePath();
    return new THREE.ShapeGeometry(s);
  })();
  SHAPES = {
    box: new THREE.BoxGeometry(1, 1, 1), blob: new THREE.IcosahedronGeometry(0.5, 1), sph: new THREE.SphereGeometry(0.5, 16, 12),
    ring: flat(new THREE.RingGeometry(0.84, 1, 48)), thin: flat(new THREE.RingGeometry(0.93, 1, 48)), disc: flat(new THREE.CircleGeometry(1, 40)),
    strip: flat(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0)),       // on the floor, one unit long, running from the origin along -z (as the wedges do)
    quad: new THREE.PlaneGeometry(1, 1), star4, star5, chevron,
    crescent: new THREE.RingGeometry(0.62, 1, 20, 1, Math.PI * 0.15, Math.PI * 0.7),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, true), shard: new THREE.OctahedronGeometry(0.5, 0), rock: new THREE.DodecahedronGeometry(0.5, 0),
    cone: new THREE.ConeGeometry(0.5, 1, 10),
  };
  return SHAPES;
}
const wedges = new Map();
const wedgeOf = (arc) => { const key = Math.round(arc * 100); let g = wedges.get(key); if (!g) { g = flat(new THREE.CircleGeometry(1, 28, Math.PI / 2 - arc, arc * 2)); wedges.set(key, g); } return g; };

export function createFx({ scene, camera, L }) {
  const rnd = Math.random;
  const m4 = new THREE.Matrix4(), col = new THREE.Color(), v3 = new THREE.Vector3(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3();
  const owned = [];

  const GEO = shapes(), wedge = wedgeOf;

  // ---- materials: a small pool per look, so a one-shot shape can fade without touching anyone else's
  const free = { add: [], norm: [], lam: [] };
  function mat(kind, color, opacity) {
    let m = free[kind].pop();
    if (!m) {
      m = kind === 'lam' ? new THREE.MeshLambertMaterial({ transparent: true }) : new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: kind === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending });
      m.userData.kind = kind; owned.push(m);
    }
    m.color.set(color); m.opacity = opacity;
    return m;                                                   // (nothing else about a pooled material may be changed by its user)
  }
  const give = (m) => { free[m.userData.kind].push(m); };

  // ---- particles: two instanced pools
  function pool(n, geo, material) {
    const P = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), vz: new Float32Array(n), life: new Float32Array(n), max: new Float32Array(n), size: new Float32Array(n), grav: new Float32Array(n), drag: new Float32Array(n), next: 0, live: 0 };
    P.mesh = new THREE.InstancedMesh(geo, material, n); P.mesh.frustumCulled = false; scene.add(P.mesh); owned.push(material);
    m4.makeScale(0, 0, 0); col.set(0xffffff);
    for (let i = 0; i < n; i++) { P.mesh.setMatrixAt(i, m4); P.mesh.setColorAt(i, col); }
    return P;
  }
  const solid = pool(700, GEO.box, new THREE.MeshBasicMaterial());
  const glow = pool(900, GEO.blob, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
  let quiet = false;
  function spark(x, y, z, vx, vy, vz, color, size, life, grav = 0, lit = false, drag = 0) {
    if (quiet) return;
    const P = lit ? glow : solid, i = P.next; P.next = (P.next + 1) % P.n;
    P.x[i] = x; P.y[i] = y; P.z[i] = z; P.vx[i] = vx; P.vy[i] = vy; P.vz[i] = vz; P.life[i] = P.max[i] = life; P.size[i] = size; P.grav[i] = grav; P.drag[i] = drag;
    P.mesh.setColorAt(i, col.set(color)); P.mesh.instanceColor.needsUpdate = true; P.live = Math.max(P.live, life);
  }
  function puff(x, y, z, n, color, spd, size, life, grav = 0, up = 0, lit = false) {
    if (quiet) return;
    for (let i = 0; i < n; i++) { const a = rnd() * 6.283, s = spd * (0.35 + rnd() * 0.65); spark(x, y, z, Math.cos(a) * s, up + rnd() * spd * 0.4, Math.sin(a) * s, color, size * (0.6 + rnd() * 0.6), life * (0.6 + rnd() * 0.5), grav, lit, lit ? 2 : 0); }
  }
  function burst(x, y, z, n, color, spd, size, life, lit = true) {          // a ball of sparks in every direction
    if (quiet) return;
    for (let i = 0; i < n; i++) { const a = rnd() * 6.283, e = (rnd() - 0.3) * 1.6, s = spd * (0.4 + rnd() * 0.6), c = Math.cos(e); spark(x, y, z, Math.cos(a) * c * s, Math.sin(e) * s, Math.sin(a) * c * s, color, size * (0.6 + rnd() * 0.6), life * (0.6 + rnd() * 0.5), -6, lit, 3); }
  }
  function drawPool(P, dt, floor) {
    if (P.live <= -0.1) return;
    P.live -= dt;
    for (let i = 0; i < P.n; i++) {
      if (P.max[i] === 0) continue;
      P.life[i] -= dt;
      if (P.life[i] <= 0) { P.max[i] = 0; m4.makeScale(0, 0, 0); P.mesh.setMatrixAt(i, m4); continue; }
      if (P.drag[i]) { const f = Math.exp(-P.drag[i] * dt); P.vx[i] *= f; P.vy[i] *= f; P.vz[i] *= f; }
      P.vy[i] += P.grav[i] * dt; P.x[i] += P.vx[i] * dt; P.y[i] += P.vy[i] * dt; P.z[i] += P.vz[i] * dt;
      if (floor && P.y[i] < 0.05 && Math.abs(P.x[i]) < L / 2 && Math.abs(P.z[i]) < L / 2) { P.y[i] = 0.05; P.vy[i] = 0; P.vx[i] *= 0.8; P.vz[i] *= 0.8; }
      const s = P.size[i] * Math.min(1, P.life[i] / P.max[i] * 2);
      m4.makeScale(s, s, s).setPosition(P.x[i], P.y[i], P.z[i]); P.mesh.setMatrixAt(i, m4);
    }
    P.mesh.instanceMatrix.needsUpdate = true;
  }

  // ---- one-shot and held shapes
  const acts = [];                                              // { mesh, t, life, tick(k, dt, mesh), hold }
  function add(geo, material, life, tick, parent = scene) {
    const mesh = new THREE.Mesh(geo, material); mesh.frustumCulled = false; mesh.renderOrder = 2;
    parent.add(mesh);
    const a = { mesh, t: 0, life, tick, hold: life === Infinity, done: false };
    acts.push(a); tick(0, 0, mesh);
    return a;
  }
  function end(a) { if (a.done) return; a.done = true; a.mesh.removeFromParent(); give(a.mesh.material); }
  const facing = (mesh) => mesh.quaternion.copy(camera.quaternion);

  const api = {
    GEO, spark, puff, burst,
    set quiet(v) { quiet = v; }, get quiet() { return quiet; },
    // an expanding ring on the floor
    ring(x, z, { r0 = 0.2, r1 = 3, life = 0.4, color = 0xffffff, opacity = 0.9, y = 0.06, thin = false, lit = true } = {}) {
      if (quiet) return null;
      return add(thin ? GEO.thin : GEO.ring, mat(lit ? 'add' : 'norm', color, opacity), life, (k, dt, m) => { const r = r0 + (r1 - r0) * easeOut(k); m.position.set(x, y, z); m.scale.set(r, 1, r); m.material.opacity = opacity * (1 - k * k); });
    },
    disc(x, z, { r0 = 0.2, r1 = 3, life = 0.4, color = 0xffffff, opacity = 0.6, y = 0.05, lit = true } = {}) {
      if (quiet) return null;
      return add(GEO.disc, mat(lit ? 'add' : 'norm', color, opacity), life, (k, dt, m) => { const r = r0 + (r1 - r0) * easeOut(k); m.position.set(x, y, z); m.scale.set(r, 1, r); m.material.opacity = opacity * (1 - k); });
    },
    // a glowing ball that pops and fades
    flash(x, y, z, { r = 1.5, life = 0.22, color = 0xffffff, opacity = 0.9 } = {}) {
      if (quiet) return null;
      return add(GEO.sph, mat('add', color, opacity), life, (k, dt, m) => { const s = r * 2 * (0.35 + 0.65 * easeOut(k)); m.position.set(x, y, z); m.scale.setScalar(s); m.material.opacity = opacity * (1 - k); });
    },
    // a four-point star facing the camera (an impact)
    star(x, y, z, { size = 1.5, life = 0.25, color = 0xffffff, spin = 1.2, five = false, opacity = 1, lit = true } = {}) {
      if (quiet) return null;
      const r0 = rnd() * 6.28;
      return add(five ? GEO.star5 : GEO.star4, mat(lit ? 'add' : 'norm', color, opacity), life, (k, dt, m) => { facing(m); m.rotateZ(r0 + k * spin); m.position.set(x, y, z); m.scale.setScalar(size * (0.3 + 0.9 * easeOut(Math.min(1, k * 2.2))) * (1 - k * 0.3)); m.material.opacity = opacity * (1 - k * k * k); });
    },
    // a crescent swipe standing in front of an attacker
    slash(x, y, z, yaw, { size = 1.2, life = 0.2, color = 0xffffff, tilt = 0.5 } = {}) {
      if (quiet) return null;
      const side = rnd() < 0.5 ? -1 : 1;
      return add(GEO.crescent, mat('add', color, 1), life, (k, dt, m) => { m.position.set(x, y, z); m.rotation.set(-Math.PI / 2 + tilt, 0, 0); m.rotateOnWorldAxis(v3.set(0, 1, 0), yaw + side * (1.6 - k * 3.2)); m.scale.setScalar(size * (0.7 + 0.5 * k)); m.material.opacity = 1 - k * k; });
    },
    // a straight beam between two points, bright core in a coloured sleeve
    beam(x1, y1, z1, x2, y2, z2, { w = 0.6, life = 0.3, color = 0xffffff, core = 0xffffff, grow = 0.06 } = {}) {
      if (quiet) return null;
      const len = Math.hypot(x2 - x1, y2 - y1, z2 - z1) || 0.01;
      const place = (m, k, wide) => { const reach = Math.min(1, k * life / grow); m.position.set(x1 + (x2 - x1) * reach / 2, y1 + (y2 - y1) * reach / 2, z1 + (z2 - z1) * reach / 2); m.quaternion.setFromUnitVectors(v3.set(0, 1, 0), s3.set((x2 - x1) / len, (y2 - y1) / len, (z2 - z1) / len)); const s = wide * (1 - k * k) * (1 + 0.15 * Math.sin(k * 60)); m.scale.set(s, len * reach, s); };
      add(GEO.cyl, mat('add', color, 0.7), life, (k, dt, m) => { place(m, k, w); m.material.opacity = 0.7 * (1 - k * k); });
      return add(GEO.cyl, mat('add', core, 1), life, (k, dt, m) => { place(m, k, w * 0.45); m.material.opacity = 1 - k * k; });
    },
    // a jagged bolt between two points, re-drawn a few times while it lasts
    bolt(x1, y1, z1, x2, y2, z2, { w = 0.16, life = 0.22, color = 0xffffff, jag = 0.7, segs = 6 } = {}) {
      if (quiet) return;
      const len = Math.hypot(x2 - x1, y2 - y1, z2 - z1) || 0.01, n = Math.max(2, Math.min(segs, Math.ceil(len / 1.2)));
      const pts = [];
      const shape = () => { pts.length = 0; for (let i = 0; i <= n; i++) { const f = i / n, j = i && i < n ? jag : 0; pts.push(x1 + (x2 - x1) * f + (rnd() - 0.5) * j, y1 + (y2 - y1) * f + (rnd() - 0.5) * j, z1 + (z2 - z1) * f + (rnd() - 0.5) * j); } };
      shape();
      for (let i = 0; i < n; i++) {
        let frame = -1;
        add(GEO.box, mat('add', color, 1), life, (k, dt, m) => {
          const f = Math.floor(k * 4); if (i === 0 && f !== frame && f > 0) shape(); frame = f;
          const a = i * 3, ax = pts[a], ay = pts[a + 1], az = pts[a + 2], bx = pts[a + 3], by = pts[a + 4], bz = pts[a + 5], d = Math.hypot(bx - ax, by - ay, bz - az) || 0.01;
          m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); m.quaternion.setFromUnitVectors(v3.set(0, 0, 1), s3.set((bx - ax) / d, (by - ay) / d, (bz - az) / d)); m.scale.set(w, w, d * 1.05); m.material.opacity = (1 - k) * (0.6 + 0.4 * Math.sin(k * 50));
        });
      }
    },
    // a chunk that flies out and tumbles (ice, rock, broken wind-up)
    shard(x, y, z, vx, vy, vz, { size = 0.4, life = 0.8, color = 0xffffff, rock = false, opacity = 1, grav = -22 } = {}) {
      if (quiet) return null;
      let px = x, py = y, pz = z, uy = vy; const rx = rnd() * 9, rz = rnd() * 9;
      return add(rock ? GEO.rock : GEO.shard, mat('lam', color, opacity), life, (k, dt, m) => { uy += grav * dt; px += vx * dt; py += uy * dt; pz += vz * dt; if (py < size * 0.3 && Math.abs(px) < L / 2 && Math.abs(pz) < L / 2) { py = size * 0.3; uy = -uy * 0.35; vx *= 0.6; vz *= 0.6; } m.position.set(px, py, pz); m.rotation.set(rx * k * 2, 0, rz * k * 2); m.scale.setScalar(size * (1 - k * k)); });
    },
    // rising chevrons (a rally, a boost)
    chevrons(x, y, z, { size = 0.7, color = 0xffe169, n = 3, life = 0.7, down = false } = {}) {
      if (quiet) return;
      for (let i = 0; i < n; i++) {
        const delay = i * 0.09;
        add(GEO.chevron, mat('add', color, 0), life + delay, (k, dt, m) => { const t = Math.max(0, (k * (life + delay) - delay) / life); facing(m); if (down) m.rotateZ(Math.PI); m.position.set(x, y + (down ? -1 : 1) * t * size * 2.6 + i * size * 0.1, z); m.scale.setScalar(size * (0.6 + 0.4 * easeOut(Math.min(1, t * 3)))); m.material.opacity = t <= 0 ? 0 : (1 - t) * 0.95; });
      }
    },
    // a shape that stays until released: returns { mesh, set(fn), release(fade) }
    hold(kind, { color = 0xffffff, opacity = 0.5, lit = false, solid = false, arc = 0.6, parent = scene } = {}, tick) {      // solid: a lit, shaded thing (a rock) rather than a flat glow
      const geo = kind === 'wedge' ? wedge(arc) : GEO[kind];
      const a = add(geo, mat(solid ? 'lam' : lit ? 'add' : 'norm', color, opacity), Infinity, tick || (() => {}), parent);
      a.mesh.renderOrder = 1;
      return { mesh: a.mesh, act: a, release(fade = 0.15) { if (a.done || a.fading) return; a.fading = true; const o = a.mesh.material.opacity, old = a.tick; a.hold = false; a.t = 0; a.life = fade; a.tick = (k, dt, m) => { old(1, dt, m); m.material.opacity = o * (1 - k); }; } };
    },
    step(dt) {
      for (let i = acts.length - 1; i >= 0; i--) {
        const a = acts[i]; a.t += dt;
        if (a.hold) { a.tick(a.t, dt, a.mesh); continue; }
        if (a.t >= a.life) { end(a); acts.splice(i, 1); continue; }
        a.tick(a.t / a.life, dt, a.mesh);
      }
      drawPool(solid, dt, true); drawPool(glow, dt, false);
    },
    clear() { for (const a of acts) end(a); acts.length = 0; },
    dispose() {
      api.clear(); solid.mesh.removeFromParent(); glow.mesh.removeFromParent(); solid.mesh.dispose(); glow.mesh.dispose();
      for (const m of owned) m.dispose();
    },
  };
  return api;
}
