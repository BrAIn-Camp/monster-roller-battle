// Match events: things that happen on the map for half a minute at a time, in the spirit of a City Trial.
// main.js picks one (tickEvents / startEvent / endEvent), shows its banner and counts it down; everything an event
// may touch comes in through the host object H (see `const H = {` in main.js). No imports: this file is plain data
// and functions, so it also runs headless (tools/events-test.mjs).
//
// Rules every event here follows:
//   - it happens somewhere (a marker says where), anyone can contest it, and CPU balls are sent to it;
//   - prizes and hazards are sized from the balls as they are when it starts (sizes());
//   - the place is one the player's ball can actually roll to (pathOK), or it is held in the Green;
//   - critters the event controls are moved from tick(), not from o.script: the host only runs a critter's script
//     while a ball is within about 60 m of it. Their script is HOLD, which just stops the host's own AI;
//   - end() puts the world back: finish() removes markers and effects, lets go of held things and resets MODS.

const TAU = Math.PI * 2;
const HOLD = () => {};                                   // script for a critter that tick() is moving
const DIRS = [];
for (let i = 0; i < 16; i++) DIRS.push([Math.cos(i / 16 * TAU), Math.sin(i / 16 * TAU)]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const hexOf = (css) => parseInt(css.slice(1), 16);
const landMover = (sp) => sp.move === 'walk' || sp.move === 'hop' || sp.move === 'slither';
const flier = (sp) => sp.move === 'fly' || sp.move === 'float';
const isFree = (o) => !!o && !o.on && !o.gone;
const pick = (H, list) => list[Math.min(list.length - 1, Math.floor(H.rand() * list.length))];
const playerOf = (H) => H.balls().find((b) => H.isPlayer(b)) || H.balls()[0];
const nearPlayer = (H, x, z, r) => { const p = playerOf(H); return Math.hypot(p.x - x, p.z - z) < r; };
const jingle = (H, notes, type = 'triangle', vol = 0.12, gap = 0.1, dur = 0.16) => notes.forEach((f, i) => H.sfx.tone(f, f, dur, type, vol, i * gap));

// ---------- the balls as they are now ----------
// min / med / max diameters; `go` is the size a place must be reachable for: the smaller of the lower-median ball and
// the player's, so the human is never shut out of an event; `hub` = that ball cannot yet climb out of the Green.
function sizes(H) {
  const ds = H.balls().map((b) => b.d).sort((a, b) => a - b), n = ds.length;
  const med = n % 2 ? ds[(n - 1) / 2] : (ds[n / 2 - 1] + ds[n / 2]) / 2;
  const go = Math.min(ds[Math.max(0, Math.ceil(n / 2) - 1)], playerOf(H).d);
  return { min: ds[0], max: ds[n - 1], med, go, hub: go < 0.95 };
}
function centroid(H) { let x = 0, z = 0; const bs = H.balls(); for (const b of bs) { x += b.x; z += b.z; } return [x / bs.length, z / bs.length]; }
const prizeSize = (s) => Math.max(Math.min(0.36 * s.med, 0.48 * s.min), 0.2 * s.med);

// ---------- where things can go ----------
// Can a ball d wide roll in a straight line from one point to the other? (Steps it can climb; no deep sea if small.)
function pathOK(H, x0, z0, x1, z1, d) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L)), step = 0.37 * d, sea = d >= 3 || H.MODS.iced;
  let h0 = H.groundAt(x0, z0);
  for (let i = 1; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n, h = H.groundAt(x, z);
    if (h - h0 > step || (!sea && H.waterAt(x, z) === 2)) return false;
    h0 = h;
  }
  return true;
}
function flatAt(H, x, z, r, tol) {
  const h = H.groundAt(x, z);
  for (let i = 0; i < 16; i += 4) if (Math.abs(H.groundAt(x + DIRS[i][0] * r, z + DIRS[i][1] * r) - h) > tol || H.waterAt(x + DIRS[i][0] * r, z + DIRS[i][1] * r) === 2) return false;
  return true;
}
function clearAt(H, x, z, r, ignore = 0) {               // no building, tree or boulder in the way (things of `ignore` metres or less do not count)
  for (const o of H.objects()) {
    if (o.kind !== 'item' || o.size < 0.5 || o.size <= ignore || o.spec.flat) continue;
    const p = o.group.position;
    if (Math.hypot(p.x - x, p.z - z) < r + o.rad) return false;
  }
  return true;
}
const inMap = (H, x, z) => x > H.BOUNDS.x1 + 8 && x < H.BOUNDS.x2 - 8 && z > H.BOUNDS.z1 + 8 && z < H.BOUNDS.z2 - 8;
// A dry, level, reachable spot between rMin and rMax metres from the centre (in the Green while balls are small).
// q: { rMin, rMax, d, near: [x, z] (prefer close to this), gap (keep this far from every ball), clear (radius free of props bigger than `ignore`), flat }
function findSite(H, q) {
  const hub = q.d < 0.95, r0 = hub ? 15 : q.rMin, r1 = hub ? 40 : q.rMax, balls = H.balls();
  let best = null, bs = 1e9, found = 0;
  for (let t = 0; t < 70 && found < 6; t++) {
    const a = H.rand() * TAU, r = r0 + H.rand() * (r1 - r0), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (H.waterAt(x, z) !== 0 || !flatAt(H, x, z, q.flat || 3, 0.3)) continue;
    if (q.gap && balls.some((b) => Math.hypot(b.x - x, b.z - z) < q.gap + b.d)) continue;
    if (!pathOK(H, 0, 0, x, z, q.d)) continue;
    if (q.clear && !clearAt(H, x, z, q.clear, q.ignore)) continue;
    found++;
    const sc = q.near ? Math.hypot(x - q.near[0], z - q.near[1]) : t;
    if (sc < bs) { bs = sc; best = [x, z]; }
  }
  if (best) return best;
  for (let t = 0; t < 40; t++) {                         // nothing passed: anywhere dry in the Green will do
    const a = H.rand() * TAU, r = 15 + H.rand() * 25, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (H.waterAt(x, z) === 0) return [x, z];
  }
  return [0, 24];
}
// Named places, for banners. [short name, name in a sentence]
const PLACE_INFO = {
  frozenLake: ['Frozen Lake', 'the Frozen Lake'], yard: ['Stormworks', 'the Stormworks yard'], hotSprings: ['Hot Springs', 'the Hot Springs'],
  oasis: ['Oasis', 'the Oasis'], pier: ['Pier', 'the Pier'], bog: ['Bog', 'the Big Bog'], grove: ['Grove', 'the Sunny Grove'], barnyard: ['Barnyard', 'the Barnyard'],
  temple: ['Temple', 'the Temple of Echoes'], crypt: ['Crypt', 'the Gloomrest crypt'], lighthouse: ['Lighthouse', 'the Lighthouse'], windmillHill: ['Windmill', 'Windmill Hill'],
  gorgeMouth: ['Gorge', 'the mouth of Echo Gorge'], dam: ['Dam', 'the Stormworks dam'], craterFoot: ['Crater', 'the foot of Mount Kiln'], peakFoot: ['Summit', 'the foot of Rimepeak'],
};
const EXTRA_PLACES = { craterFoot: [128, 0], peakFoot: [0, -128] };
const INNER_PLACES = ['frozenLake', 'yard', 'hotSprings', 'oasis', 'pier', 'bog', 'grove', 'barnyard'];
const OUTER_PLACES = ['temple', 'crypt', 'lighthouse', 'windmillHill', 'gorgeMouth', 'dam', 'craterFoot', 'peakFoot'];
function shuffled(H, list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.min(i, Math.floor(H.rand() * (i + 1))); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// A clear, level, reachable spot at (or a few metres from) one of the named places. -> { x, z, short, long } | null
function placeSite(H, keys, d, clear, gap, ignore) {
  const balls = H.balls();
  for (const key of shuffled(H, keys)) {
    const at = H.PLACES[key] || EXTRA_PLACES[key];
    if (!at || typeof at[0] !== 'number') continue;
    for (let k = 0; k < 25; k++) {
      const rr = k === 0 ? 0 : 7 + 6 * Math.floor((k - 1) / 8), dir = DIRS[((k - 1) * 2 + 16) % 16];
      const x = at[0] + dir[0] * rr, z = at[1] + dir[1] * rr;
      if (H.waterAt(x, z) !== 0 || !flatAt(H, x, z, Math.max(2, clear * 0.7), 0.3) || !pathOK(H, 0, 0, x, z, d) || (clear && !clearAt(H, x, z, clear, ignore))) continue;
      if (gap && balls.some((b) => Math.hypot(b.x - x, b.z - z) < gap + b.d)) continue;
      return { x, z, short: PLACE_INFO[key][0], long: PLACE_INFO[key][1] };
    }
  }
  return null;
}
// A landmark if the balls are big enough for one, else the heart of an inner habitat, else somewhere in the Green.
function namedSite(H, s, clear, gap, outerChance = 0.6) {
  let site = null;
  const ignore = 0.5 * s.min;                              // anything every ball can roll up is not in the way
  if (!s.hub && s.go >= 1.6 && H.rand() < outerChance) site = placeSite(H, OUTER_PLACES, s.go, clear, gap, ignore);
  if (!site && !s.hub) site = placeSite(H, INNER_PLACES, s.go, clear, gap, ignore);
  if (!site) { const p = findSite(H, { rMin: 15, rMax: 40, d: 0.5, clear, gap, ignore }); site = { x: p[0], z: p[1], short: 'Green', long: 'Crossway Green' }; }
  return site;
}

// ---------- critters and prizes of the right size ----------
// The n species passing `ok` whose height is nearest `target` (with a little shuffle, so it is not always the same ones).
function pickSpecies(H, ok, target, n) {
  return H.CREATURES.filter(ok).map((sp) => [Math.abs(Math.log(sp.height / target)) + H.rand() * 0.3, sp]).sort((a, b) => a[0] - b[0]).slice(0, n).map((e) => e[1]);
}
// put() options that bring a species to about `target` metres tall and, with frac, make it worth that share of a median ball's volume.
function fit(H, sp, target, frac, med) {
  const scale = H.clamp(target / sp.height, 0.5, 2.5), size = sp.height * scale;
  return { scale, bonus: frac ? H.clamp(frac * med ** 3 / (0.95 * size ** 3), 1, 40) : 1 };
}
// An item `size` metres across that is worth `frac` of a median ball's volume when rolled up.
function prize(H, id, x, z, size, frac, med, extra) {
  const e = H.SPECS[id];
  if (!e) return null;
  return H.put(id, x, z, Object.assign({ scale: size / e.size, bonus: H.clamp(frac * med ** 3 / (0.95 * size ** 3 * (e.spec.mass ?? 1)), 0.25, 60) }, extra));
}
const itemId = (H, ...ids) => ids.find((id) => H.SPECS[id] && H.SPECS[id].kind === 'item') || 'coin';
// n critters sized for this ball, straight onto it.
function reward(H, ball, n) {
  const sps = pickSpecies(H, (sp) => sp.move !== 'still', 0.36 * ball.d, 4);
  for (let i = 0; i < n && sps.length; i++) {
    const sp = pick(H, sps), o = H.put(sp.id, ball.x, ball.z, { scale: fit(H, sp, 0.36 * ball.d).scale, pop: false });
    if (o) H.give(ball, o);
  }
}

// ---------- pushing balls about ----------
// Sends a ball rolling off in direction (ux, uz). The player's ball has a velocity; a CPU's steers by heading.
function punt(H, b, ux, uz, speed) {
  if (typeof b.vx === 'number' && typeof b.vz === 'number') { b.vx = ux * speed; b.vz = uz * speed; }
  else if (typeof b.v === 'number' && 'wh' in b) { b.v = -Math.abs(b.v) * 0.4; b.wander = Math.max(b.wander || 0, 1); b.wh = Math.atan2(ux, uz); }
  else {
    const r = b.d / 2, nx = H.clamp(b.x + ux * r * 0.5, H.BOUNDS.x1 + 6, H.BOUNDS.x2 - 6), nz = H.clamp(b.z + uz * r * 0.5, H.BOUNDS.z1 + 6, H.BOUNDS.z2 - 6);
    if (H.groundAt(nx + ux * r * 0.8, nz + uz * r * 0.8) - H.groundAt(b.x, b.z) > r * 0.6) return;
    if (H.waterAt(nx, nz) === 2 && H.waterAt(b.x, b.z) !== 2 && b.d < 3 && !H.MODS.iced) return;
    b.x = nx; b.z = nz;
  }
}
// CPUs already heading for the event follow its target as it moves. (cpuGoto rolls the dice again on every call.)
function cpuFollow(H, x, z) { for (const b of H.balls()) if (!H.isPlayer(b) && b.ev) { b.ev.x = x; b.ev.z = z; } }

// ---------- per-event bookkeeping ----------
function makeFx(H) {
  const shown = [], owned = [];
  return {
    own(r) { owned.push(r); return r; },                 // a geometry or material this event made: disposed at the end
    add(o) { H.fx.add(o); shown.push(o); return o; },
    clear() { for (const o of shown) H.fx.remove(o); for (const r of owned) r.dispose(); shown.length = 0; owned.length = 0; },
  };
}
function begin(H, ev) {
  const D = ev.data;
  D.marks = []; D.held = []; D.fx = makeFx(H); D.s = sizes(H); D.ended = false;
  return D;
}
function mk(H, ev, id, x, z, opt) { if (!ev.data.marks.includes(id)) ev.data.marks.push(id); return H.mark(id, x, z, opt); }
// Takes control of a thing: the host's AI leaves it alone, and finish() lets it go (or removes it).
function hold(ev, o, opt) { if (!o) return o; if (o.kind === 'creature') o.script = HOLD; if (opt) Object.assign(o, opt); ev.data.held.push(o); return o; }
function finish(H, ev, removeHeld) {
  const D = ev.data;
  if (!D || D.ended) return false;
  D.ended = true;
  for (const id of D.marks || []) H.unmark(id);
  if (D.fx) D.fx.clear();
  for (const o of D.held || []) {
    const mine = o.script === HOLD || o.noPick;
    o.onBump = null; o.onPick = null; o.noPick = false;
    if (o.script === HOLD) o.script = null;
    if (!isFree(o)) continue;
    if (removeHeld && mine) H.remove(o);
    else if (o.kind === 'creature') { o.home = [o.group.position.x, o.group.position.z]; o.ai = 'idle'; o.timer = 1; }
  }
  if (D.world) { H.MODS.knock = 1; H.MODS.fog = 1; H.setIce(false); H.setSky(null); }
  H.cpuRelease();
  return true;
}
// Puts a held critter at (x, z) facing the way it is going, with a little bounce.
function stand(H, o, x, z, yaw, t) {
  const p = o.group.position, h = o.size;
  p.x = x; p.z = z;
  p.y = H.groundAt(x, z) + (flier(o.spec) ? h * 0.3 : Math.abs(Math.sin(t * 9 + (o.phase || 0))) * h * 0.1);
  o.group.rotation.y = yaw;
}
// Drops loose every thing in `list` that has been rolled up, so the end of the event only clears what nobody took.
function forgetTaken(list) { for (let i = list.length - 1; i >= 0; i--) if (!isFree(list[i])) { list[i] = list[list.length - 1]; list.pop(); } }

// ======================================================================================================================
const meteor = {
  id: 'meteor', name: 'Meteor Shower', sub: 'Stay off the red rings, then grab the star shards. The big one lands last!', color: '#ff8a4a', duration: 30, weight: 1, late: true,
  start(H, ev) {
    const D = begin(H, ev), s = D.s, T3 = H.THREE;
    const at = findSite(H, { rMin: 60, rMax: 140, d: s.go, near: centroid(H), flat: 4 });
    D.x = at[0]; D.z = at[1];
    D.R = s.hub ? 13 : H.clamp(13 + s.med * 2.2, 16, 30);              // the zone
    D.ri = H.clamp(1.6 + s.med * 0.9, 2.6, 9);                          // one meteor's blast
    D.next = 1.4; D.bigOut = false; D.loot = [];
    D.shard = itemId(H, 'coin', 'pebble');
    const gRing = D.fx.own(new T3.TorusGeometry(1, 0.05, 6, 32)), gDisc = D.fx.own(new T3.CircleGeometry(1, 24)), gRock = D.fx.own(new T3.DodecahedronGeometry(1, 0));
    const mRing = D.fx.own(new T3.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.95, depthWrite: false }));
    const mDisc = D.fx.own(new T3.MeshBasicMaterial({ color: 0xff5a2a, transparent: true, opacity: 0.4, depthWrite: false }));
    const mRock = D.fx.own(new T3.MeshBasicMaterial({ color: 0xffb14a }));
    D.slots = [];
    for (let i = 0; i < 6; i++) {
      const g = new T3.Group(), ring = new T3.Mesh(gRing, mRing), disc = new T3.Mesh(gDisc, mDisc), rock = new T3.Mesh(gRock, mRock);
      ring.rotation.x = Math.PI / 2; disc.rotation.x = -Math.PI / 2;
      g.add(ring); g.add(disc); g.visible = false; rock.visible = false;
      D.fx.add(g); D.fx.add(rock);
      D.slots.push({ g, disc, rock, t: -1, warn: 1.2, x: 0, z: 0, gy: 0, r: 1, big: false });
    }
    mk(H, ev, 'meteor', D.x, D.z, { label: 'Meteor shower', color: hexOf(meteor.color), radius: D.R });
    H.cpuGoto(D.x, D.z, 26, 0.75);
    jingle(H, [988, 784, 659, 523], 'square', 0.08, 0.09);
  },
  launch(H, D, x, z, r, warn, big) {
    const sl = D.slots.find((q) => q.t < 0);
    if (!sl) return;
    Object.assign(sl, { t: 0, warn, x, z, r, big, gy: H.groundAt(x, z) });
    sl.g.position.set(x, sl.gy + 0.14, z); sl.g.scale.setScalar(r); sl.g.visible = true;
    sl.disc.scale.setScalar(0.01);
    sl.rock.scale.setScalar(r * 0.4); sl.rock.visible = true;
    if (nearPlayer(H, x, z, 70)) H.sfx.tone(big ? 900 : 1500, big ? 120 : 420, warn * 0.95, 'sine', big ? 0.09 : 0.045);
  },
  impact(H, D, sl) {
    const s = D.s;
    sl.t = -1; sl.g.visible = false; sl.rock.visible = false;
    for (const b of H.balls()) {
      const dx = sl.x - b.x, dz = sl.z - b.z, dist = Math.hypot(dx, dz);
      if (dist > sl.r + b.d * 0.25) continue;
      const nx = dist > 1e-4 ? dx / dist : 1, nz = dist > 1e-4 ? dz / dist : 0;
      H.knock(b, nx, nz, sl.big ? 6 : 3);
      punt(H, b, -nx, -nz, H.topSpeed(b.d) * 1.1);
    }
    if (nearPlayer(H, sl.x, sl.z, sl.r * 4 + 12)) { H.shake(sl.big ? 0.6 : 0.25); H.sfx.bump(); }
    else if (nearPlayer(H, sl.x, sl.z, 90)) H.sfx.tone(110, 40, 0.25, 'sawtooth', 0.06);
    const size = prizeSize(s), n = sl.big ? 8 : 3 + Math.floor(H.rand() * 4);
    for (let i = 0; i < n; i++) {
      const o = prize(H, D.shard, sl.x, sl.z, size * (0.8 + H.rand() * 0.35), 0.07, s.med, { pop: false });
      if (!o) break;
      const a = H.rand() * TAU, sp = 1.5 + H.rand() * sl.r * 0.9;
      H.fling(o, Math.cos(a) * sp, 5 + H.rand() * 3, Math.sin(a) * sp);
      D.loot.push(o);
    }
    while (D.loot.length > 44) { const old = D.loot.shift(); if (isFree(old)) H.remove(old); }      // the oldest unclaimed shards burn out
    if (sl.big) {                                          // the last one leaves a ring of rare critters round its crater
      const rare = pickSpecies(H, (sp) => (sp.rarity === 'rare' || sp.rarity === 'unique') && (landMover(sp) || flier(sp)), 0.36 * s.med, 3);
      for (let i = 0; i < 7 && rare.length; i++) {
        const a = i / 7 * TAU, x = sl.x + Math.cos(a) * sl.r * 0.75, z = sl.z + Math.sin(a) * sl.r * 0.75, sp = rare[i % rare.length];
        if (H.waterAt(x, z) !== 2) H.put(sp.id, x, z, fit(H, sp, 0.36 * s.med, 0.06, s.med));
      }
      H.toast('Rare critters crawl out of the crater!');
      H.sfx.win();
    }
  },
  tick(H, ev, dt) {
    const D = ev.data;
    D.next -= dt;
    if (ev.t < 23.5 && D.next <= 0) {
      D.next = 0.95 + H.rand() * 0.45;
      const inside = H.balls().filter((b) => Math.hypot(b.x - D.x, b.z - D.z) < D.R);
      for (let t = 0; t < 4; t++) {
        let x, z;
        if (inside.length && H.rand() < 0.55) { const b = pick(H, inside); x = b.x + (H.rand() - 0.5) * D.ri; z = b.z + (H.rand() - 0.5) * D.ri; }   // half are aimed at whoever is in there
        else { const a = H.rand() * TAU, r = Math.sqrt(H.rand()) * D.R; x = D.x + Math.cos(a) * r; z = D.z + Math.sin(a) * r; }
        if (H.waterAt(x, z) === 2) continue;
        meteor.launch(H, D, x, z, D.ri * (0.8 + H.rand() * 0.4), 1.2, false);
        break;
      }
    }
    if (!D.bigOut && ev.t >= 24) {
      D.bigOut = true;
      meteor.launch(H, D, D.x, D.z, Math.min(D.R * 0.8, D.ri * 2.2), 3, true);
      H.toast('The big one is coming: get out of the middle!');
    }
    for (const sl of D.slots) {
      if (sl.t < 0) continue;
      sl.t += dt;
      const k = Math.min(1, sl.t / sl.warn);
      sl.disc.scale.setScalar(Math.max(0.01, k));          // the ring fills as the meteor comes down
      sl.rock.position.set(sl.x + (1 - k) * 14, sl.gy + (1 - k) * 60 + sl.r * 0.3, sl.z + (1 - k) * 6);
      sl.rock.rotation.x += dt * 5; sl.rock.rotation.z += dt * 3;
      if (k >= 1) meteor.impact(H, D, sl);
    }
  },
  end(H, ev) { finish(H, ev); },
};

// ======================================================================================================================
const stampede = {
  id: 'stampede', name: 'Stampede', sub: 'A herd is crossing the Green: roll into the column!', color: '#c9a35a', duration: 35, weight: 1,
  start(H, ev) {
    const D = begin(H, ev), s = D.s;
    const types = {};
    for (const sp of H.CREATURES) if (landMover(sp)) for (const t of sp.types) types[t] = (types[t] || 0) + 1;
    const type = pick(H, Object.keys(types).filter((t) => types[t] >= 3));
    const target = 0.36 * s.med, kinds = pickSpecies(H, (sp) => landMover(sp) && sp.types.includes(type), target, 3);
    // the route: a straight line through the middle of the Green, as long as the balls are quick, ending on dry land
    const half = s.hub ? 43 : H.clamp(40 + s.med * 45, 70, 170);
    let best = null;
    for (let t = 0; t < 10; t++) {
      const a = H.rand() * TAU, ux = Math.cos(a), uz = Math.sin(a);
      let r0 = half, r1 = half;
      while (r0 > 45 && (H.waterAt(-ux * r0, -uz * r0) === 2 || !inMap(H, -ux * r0, -uz * r0))) r0 -= 5;
      while (r1 > 45 && (H.waterAt(ux * r1, uz * r1) === 2 || !inMap(H, ux * r1, uz * r1))) r1 -= 5;
      if (!best || r0 + r1 > best.r0 + best.r1) best = { ux, uz, r0, r1 };
    }
    Object.assign(D, best);
    D.ax = -D.ux * D.r0; D.az = -D.uz * D.r0; D.L = D.r0 + D.r1; D.yaw = Math.atan2(D.ux, D.uz);
    const N = 34, gap = Math.max(1.3, target * 1.7);
    D.col = Math.ceil(N / 3) * gap;                       // the column's length
    D.v = D.L / (stampede.duration - 3.5);
    D.mem = [];
    const bump = (ball, o) => { o.cool = 0.6; punt(H, ball, D.ux, D.uz, H.topSpeed(ball.d) * 0.9); if (H.isPlayer(ball)) { H.shake(0.15); H.sfx.bump(); } };
    for (let i = 0; i < N; i++) {
      const sp = kinds[i % kinds.length], bull = i % 9 === 4;               // a few are too big to roll up: they shove
      const opt = bull ? { scale: H.clamp(0.85 * s.med / sp.height, 0.5, 4) } : fit(H, sp, target * (0.8 + H.rand() * 0.35), 0.05, s.med);
      const back = Math.floor(i / 3) * gap + H.rand() * gap * 0.4, side = (i % 3 - 1) * gap * 0.9 + (H.rand() - 0.5) * gap * 0.3;
      const u = H.clamp(D.col - back, 0, D.L), o = H.put(sp.id, D.ax + D.ux * u - D.uz * side, D.az + D.uz * u + D.ux * side, opt);
      if (!o) continue;
      hold(ev, o, { onBump: bump });
      D.mem.push({ o, back, side, ph: H.rand() * 6 });
    }
    D.cpuT = 0;
    ev.title = cap(type) + ' Stampede';
    ev.sub = `A herd of <b>${type.toUpperCase()}</b> critters is charging ${s.hub ? 'across' : 'through'} the Green: roll into the column!`;
    mk(H, ev, 'stampede', D.ax + D.ux * D.col, D.az + D.uz * D.col, { label: 'Stampede', color: hexOf(stampede.color), radius: Math.max(4, gap * 2) });
    H.cpuGoto(D.ax + D.ux * D.col * 0.5, D.az + D.uz * D.col * 0.5, stampede.duration, 0.7);
    if (kinds[0]) H.sfx.cry(kinds[0], 0.09);
    jingle(H, [147, 147, 196, 147], 'sawtooth', 0.1, 0.14);
  },
  tick(H, ev, dt) {
    const D = ev.data, head = D.col + D.v * Math.max(0, ev.t - 1.5);
    let left = 0;
    for (const m of D.mem) {
      const o = m.o;
      if (!o) continue;
      if (o.script !== HOLD || !isFree(o)) { m.o = null; continue; }        // rolled up: no longer ours to move
      const u = head - m.back;
      if (u >= D.L) { H.remove(o); m.o = null; continue; }                  // made it to the far side
      left++;
      if (o.fly) continue;
      const uu = Math.max(0, u), sd = m.side + Math.sin(ev.t * 3 + m.ph) * 0.3;
      stand(H, o, D.ax + D.ux * uu - D.uz * sd, D.az + D.uz * uu + D.ux * sd, D.yaw, ev.t);
    }
    const hu = Math.min(D.L, head), mu = H.clamp(head - D.col * 0.4, 0, D.L);
    H.moveMark('stampede', D.ax + D.ux * hu, D.az + D.uz * hu);
    D.cpuT -= dt;
    if (D.cpuT <= 0) {
      D.cpuT = 0.7;
      cpuFollow(H, D.ax + D.ux * mu, D.az + D.uz * mu);
      if (nearPlayer(H, D.ax + D.ux * mu, D.az + D.uz * mu, 45)) H.sfx.tone(75, 50, 0.18, 'sawtooth', 0.05);
    }
    if (!left && ev.t > 2) ev.done = true;
  },
  end(H, ev) { finish(H, ev, true); },                     // whatever is still running leaves the map
};

// ======================================================================================================================
const swarm = {
  id: 'swarm', name: 'Elemental Surge', sub: 'Critters of one type are swarming one habitat: get there!', color: '#ff5fa2', duration: 35, weight: 1.2,
  start(H, ev) {
    const D = begin(H, ev), s = D.s;
    const zones = s.hub ? ['hub'] : ['tundra', 'works', 'ashflats', 'canyon', 'beach', 'marsh', 'forest', 'farm'];
    let opts = [];
    for (const zid of zones) {
      const bi = H.B[zid], biome = H.BIOMES[bi], byType = {};
      if (!biome) continue;
      for (const sp of H.CREATURES) if (sp.move !== 'swim' && sp.move !== 'still' && H.habOf(sp) === biome.hab) for (const t of sp.types) (byType[t] || (byType[t] = [])).push(sp);
      for (const t in byType) opts.push({ bi, biome, type: t, list: byType[t] });
    }
    if (opts.some((o) => o.list.length >= 2)) opts = opts.filter((o) => o.list.length >= 2);
    let o = opts.length ? pick(H, opts) : null;
    if (!o) { const bi = H.B.hub; o = { bi, biome: H.BIOMES[bi], type: 'normal', list: H.CREATURES.filter((sp) => landMover(sp) && sp.types.includes('normal')) }; }
    let at = null;
    for (let t = 0; t < 14 && !at; t++) {
      const p = H.sampleBiome([o.bi], 'land', s.hub ? 28 : 86, 14);
      if (p && flatAt(H, p[0], p[1], 4, 0.3) && pathOK(H, 0, 0, p[0], p[1], s.go)) at = p;
    }
    if (!at) at = findSite(H, { rMin: 60, rMax: 110, d: s.go });
    D.x = at[0]; D.z = at[1]; D.type = o.type; D.wave = 0;
    D.kinds = o.list.map((sp) => [Math.abs(Math.log(sp.height / (0.36 * s.med))), sp]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((e) => e[1]);
    const where = H.biomeAt(D.x, D.z) || o.biome;
    ev.title = cap(o.type) + ' Surge';
    ev.sub = `<b>${o.type.toUpperCase()}</b> critters are swarming ${where.name || o.biome.name}! They keep coming for 25 seconds`;
    mk(H, ev, 'swarm', D.x, D.z, { label: cap(o.type) + ' swarm', color: hexOf(swarm.color), radius: 15 });
    H.cpuGoto(D.x, D.z, 30, 0.75);
    jingle(H, [392, 523, 659, 784, 1047], 'triangle', 0.1, 0.07);
  },
  tick(H, ev) {
    const D = ev.data, s = D.s;
    if (D.wave >= 5 || ev.t < 0.3 + D.wave * 6.2) return;
    D.wave++;
    const h0 = H.groundAt(D.x, D.z);
    for (let g = 0; g < 2; g++) {                         // two groups of four each wave: forty in all
      const sp = D.kinds[(D.wave + g) % D.kinds.length];
      for (let t = 0; t < 10; t++) {
        const a = H.rand() * TAU, r = 3 + H.rand() * 10, x = D.x + Math.cos(a) * r, z = D.z + Math.sin(a) * r;
        if (H.waterAt(x, z) !== 0 || Math.abs(H.groundAt(x, z) - h0) > 0.4) continue;
        H.herd(sp, [x, z], 4, fit(H, sp, 0.36 * s.med * (0.85 + H.rand() * 0.3), 0.05, s.med));
        break;
      }
    }
    if (nearPlayer(H, D.x, D.z, 70)) { H.sfx.cry(D.kinds[D.wave % D.kinds.length], 0.07); jingle(H, [523, 784], 'sine', 0.07, 0.08); }
  },
  end(H, ev) { finish(H, ev); },
};

// ======================================================================================================================
const golden = {
  id: 'golden', name: 'Golden Critter', sub: 'A golden critter is on the run. Whoever catches it wins big!', color: '#ffd23f', duration: 40, weight: 1, late: true,
  start(H, ev) {
    const D = begin(H, ev), s = D.s;
    const sp = pick(H, H.CREATURES.filter((c) => (c.move === 'walk' || c.move === 'hop') && c.height <= 1.6));
    const at = findSite(H, { rMin: 58, rMax: 112, d: Math.min(s.go, s.min), near: centroid(H), gap: 22 });
    D.sp = sp; D.scale = 0.4 * s.min / sp.height;                            // small enough for the smallest ball
    D.lim = s.min < 0.95 ? 44 : 205;                                         // it stays where every ball can follow
    D.step = 0.3 * s.min;
    D.o = hold(ev, H.put(sp.id, at[0], at[1], { scale: D.scale, gold: true }), { onPick: (ball) => { D.winner = ball; } });
    if (!D.o) { ev.done = true; return; }
    D.hx = 0; D.hz = 1; D.gx = 0; D.gz = 1; D.speed = 0; D.think = 0; D.cpuT = 0; D.glint = 0;
    D.vmax = H.topSpeed(s.med) * 1.15;                 // quicker than a median ball at a roll, slower than one at a sprint
    ev.sub = `A golden <b>${sp.name}</b> is on the run. Catch it for a huge growth spurt and six more like it!`;
    mk(H, ev, 'golden', at[0], at[1], { label: 'Golden ' + sp.name, color: hexOf(golden.color), radius: Math.max(2.5, s.min * 1.5) });
    H.cpuGoto(at[0], at[1], golden.duration, 0.8);
    jingle(H, [1319, 1568, 2093, 1568, 2093], 'sine', 0.1, 0.08, 0.12);
  },
  blocked(H, D, x0, z0, x, z) {
    return Math.hypot(x, z) > D.lim || !inMap(H, x, z) || H.waterAt(x, z) === 2 || H.groundAt(x, z) - H.groundAt(x0, z0) > D.step;
  },
  tick(H, ev, dt) {
    const D = ev.data, o = D.o;
    if (D.winner) {                                        // paid out here, not inside the host's collision loop
      const b = D.winner;
      H.grow(b, 0.45 * b.vol3);
      for (let i = 0; i < 6; i++) { const m = H.put(D.sp.id, b.x, b.z, { scale: Math.max(D.scale, H.clamp(0.3 * b.d / D.sp.height, 0.5, 2.5)), pop: false }); if (m) H.give(b, m); }
      H.toast(`${H.ballName(b)} caught the Golden ${D.sp.name}!`);
      H.sfx.win();
      ev.done = true;
      return;
    }
    if (!isFree(o)) { ev.done = true; return; }
    const p = o.group.position, balls = H.balls();
    if (o.fly) { H.moveMark('golden', p.x, p.z); return; }
    D.think -= dt;
    if (D.think <= 0) {
      D.think = 0.12;
      let near = 1e9;
      for (const b of balls) near = Math.min(near, Math.hypot(b.x - p.x, b.z - p.z) - b.d / 2);
      if (near > 26 + D.s.max * 2) D.speed = 0;            // nobody about: it stops to preen
      else {
        D.speed = D.vmax * (1.1 - 0.5 * ev.t / golden.duration);           // it tires, so somebody gets it in the end
        const look = 3 + D.speed * 0.9;
        let bs = -1e9, bi = -1;
        for (let i = 0; i < 16; i++) {
          const qx = p.x + DIRS[i][0] * look, qz = p.z + DIRS[i][1] * look;
          if (golden.blocked(H, D, p.x, p.z, p.x + DIRS[i][0] * look * 0.5, p.z + DIRS[i][1] * look * 0.5) || golden.blocked(H, D, p.x, p.z, qx, qz)) continue;
          let sc = 1e9;
          for (const b of balls) sc = Math.min(sc, Math.hypot(b.x - qx, b.z - qz) - b.d / 2);
          sc += 2.5 * (DIRS[i][0] * D.hx + DIRS[i][1] * D.hz);              // it does not like to double back
          if (sc > bs) { bs = sc; bi = i; }
        }
        if (bi >= 0) { D.gx = DIRS[bi][0]; D.gz = DIRS[bi][1]; }
        else { const l = Math.hypot(p.x, p.z) || 1; D.gx = -p.x / l; D.gz = -p.z / l; D.speed *= 0.5; }      // cornered: back towards the middle
      }
    }
    const k = Math.min(1, 9 * dt);
    D.hx += (D.gx - D.hx) * k; D.hz += (D.gz - D.hz) * k;
    const hl = Math.hypot(D.hx, D.hz) || 1, ux = D.hx / hl, uz = D.hz / hl;
    let nx = p.x + ux * D.speed * dt, nz = p.z + uz * D.speed * dt;
    if (D.speed > 0 && golden.blocked(H, D, p.x, p.z, nx, nz)) { nx = p.x; nz = p.z; D.think = 0; }
    stand(H, o, nx, nz, Math.atan2(ux, uz), D.speed > 0 ? ev.t : 0);
    H.moveMark('golden', nx, nz);
    D.cpuT -= dt;
    if (D.cpuT <= 0) { D.cpuT = 0.4; cpuFollow(H, nx, nz); }
    D.glint -= dt;
    if (D.glint <= 0) { D.glint = 1.7; if (nearPlayer(H, nx, nz, 45)) H.sfx.tone(1760, 2640, 0.08, 'sine', 0.045); }
  },
  end(H, ev) {
    const D = ev.data, away = !D.ended && isFree(D.o) && !D.winner;
    if (finish(H, ev, true) && away && ev.t >= golden.duration - 0.5) H.toast('The golden critter got away!');
  },
};

// ======================================================================================================================
const supply = {
  id: 'supply', name: 'Supply Drop', sub: 'An airship is dropping crates along its route. Some are jackpots!', color: '#5ad1e6', duration: 36, weight: 1, late: true,
  start(H, ev) {
    const D = begin(H, ev), s = D.s, T3 = H.THREE;
    // the route: across the Green while balls are small, else a chord from one inner habitat to another three wedges round
    const a = Math.floor(H.rand() * 8) * TAU / 8 + (H.rand() - 0.5) * 0.3, r = s.hub ? 38 : 92, b = a + (s.hub ? Math.PI : TAU * 3 / 8 * (H.rand() < 0.5 ? 1 : -1));
    D.ax = Math.cos(a) * r; D.az = Math.sin(a) * r; D.bx = Math.cos(b) * r; D.bz = Math.sin(b) * r;
    D.fly = supply.duration - 5;                           // seconds from one end to the other
    const L = Math.hypot(D.bx - D.ax, D.bz - D.az) || 1;
    D.ux = (D.bx - D.ax) / L; D.uz = (D.bz - D.az) / L;
    D.sz = H.clamp(2.5 + s.med, 3.5, 9); D.alt = 14 + D.sz * 1.6;
    const ship = new T3.Group();
    H.P(ship, 'sph', 0xe85a4a, [0.55, 0.5, 1.2], [0, 0, 0]);
    H.P(ship, 'sph', 0xfff2d0, [0.57, 0.12, 1.22], [0, 0, 0]);
    H.P(ship, 'box', 0x8a5a2b, [0.35, 0.22, 0.6], [0, -0.62, 0]);
    H.P(ship, 'box', 0xfff2d0, [0.04, 0.5, 0.4], [0, 0.25, -1.05]);
    H.P(ship, 'box', 0xfff2d0, [0.8, 0.04, 0.4], [0, 0, -1.05]);
    ship.scale.setScalar(D.sz); ship.rotation.y = Math.atan2(D.ux, D.uz);
    D.ship = D.fx.add(ship);
    D.size = prizeSize(s); D.crateId = itemId(H, 'crate', 'barrel', 'cake');
    D.falls = [];
    for (let i = 0; i < 4; i++) {
      const g = new T3.Group();
      H.P(g, 'box', 0xc99a5a, [1, 1, 1], [0, 0.5, 0]);
      H.P(g, 'hemi', 0xffffff, [0.9, 0.7, 0.9], [0, 1.7, 0]);
      g.visible = false;
      D.falls.push({ g: D.fx.add(g), t: -1, x: 0, z: 0, gy: 0, y0: 0, jack: false });
    }
    D.next = 1.5; D.count = 0; D.jacks = []; D.cpuT = 0; D.hum = 0;
    supply.fly(H, D, 0, 0);
    mk(H, ev, 'supply', D.ax, D.az, { label: 'Supply drop', color: hexOf(supply.color), radius: Math.max(5, D.sz) });
    H.cpuGoto(D.ax, D.az, supply.duration, 0.7);
    jingle(H, [523, 659, 784, 659, 1047], 'square', 0.07, 0.11);
  },
  fly(H, D, t) {
    const k = H.clamp(t / D.fly, 0, 1.2);
    D.x = D.ax + (D.bx - D.ax) * k; D.z = D.az + (D.bz - D.az) * k;
    D.ship.position.set(D.x, Math.max(0, H.groundAt(H.clamp(D.x, H.BOUNDS.x1 + 1, H.BOUNDS.x2 - 1), H.clamp(D.z, H.BOUNDS.z1 + 1, H.BOUNDS.z2 - 1))) * 0.5 + D.alt + Math.sin(t * 1.3) * 0.4, D.z);
  },
  tick(H, ev, dt) {
    const D = ev.data, s = D.s;
    supply.fly(H, D, ev.t);
    H.moveMark('supply', D.x, D.z);
    D.next -= dt;
    if (D.next <= 0 && ev.t < supply.duration - 6) {
      D.next = 2;
      const f = D.falls.find((q) => q.t < 0);
      for (let t = 0; f && t < 6; t++) {                   // somewhere beside the route that a ball can get to
        const side = (H.rand() - 0.5) * (8 + t * 5), x = D.x - D.uz * side, z = D.z + D.ux * side, gy = H.groundAt(x, z);
        if (!inMap(H, x, z) || H.waterAt(x, z) === 2 || (gy > 0.36 + 0.37 * s.go && !pathOK(H, 0, 0, x, z, s.go))) continue;
        D.count++;
        Object.assign(f, { t: 0, x, z, gy, y0: D.ship.position.y - D.sz * 0.7, jack: D.count % 4 === 0 });
        f.g.scale.setScalar(D.size * (f.jack ? 1.2 : 1)); f.g.visible = true;
        if (nearPlayer(H, x, z, 60)) H.sfx.tone(880, 660, 0.1, 'square', 0.05);
        break;
      }
    }
    for (const f of D.falls) {
      if (f.t < 0) continue;
      f.t += dt;
      const k = Math.min(1, f.t / 2.4);
      f.g.position.set(f.x + Math.sin(f.t * 3) * 0.5 * (1 - k), f.y0 + (f.gy - f.y0) * k, f.z);
      f.g.rotation.z = Math.sin(f.t * 3) * 0.15 * (1 - k);
      if (k < 1) continue;
      f.t = -1; f.g.visible = false;
      const o = prize(H, D.crateId, f.x, f.z, D.size * (f.jack ? 1.2 : 1), f.jack ? 0.16 : 0.11, s.med, { pop: false });
      if (o && f.jack) hold(ev, o, { onPick: (ball) => { D.jacks.push(ball); } });
      if (nearPlayer(H, f.x, f.z, 40)) H.sfx.tone(220, 140, 0.1, 'triangle', 0.08);
    }
    while (D.jacks.length) {                               // a jackpot crate bursts open: three critters hop out beside whoever took it
      const b = D.jacks.pop(), kinds = pickSpecies(H, landMover, 0.34 * b.d, 3);
      for (let i = 0; i < 3 && kinds.length; i++) {
        const a = H.rand() * TAU, r = b.d * 0.5 + 1 + H.rand() * 2, x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r, sp = kinds[i % kinds.length];
        if (inMap(H, x, z) && H.waterAt(x, z) !== 2) H.put(sp.id, x, z, fit(H, sp, 0.34 * b.d));
      }
      if (H.isPlayer(b)) { H.toast('Jackpot crate: three critters!'); H.sfx.win(); }
    }
    D.cpuT -= dt;
    if (D.cpuT <= 0) { D.cpuT = 1; cpuFollow(H, D.x - D.ux * 8, D.z - D.uz * 8); }
    D.hum -= dt;
    if (D.hum <= 0) { D.hum = 2.6; if (nearPlayer(H, D.x, D.z, 60)) H.sfx.tone(92, 88, 0.6, 'sawtooth', 0.035); }
  },
  end(H, ev) { finish(H, ev); },
};

// ======================================================================================================================
const magpie = {
  id: 'magpie', name: 'Magpie Raid', sub: 'A thief has robbed the biggest team. Ram it to shake the loot loose!', color: '#7d5ae0', duration: 35, weight: 1,
  victim(H) { let v = null; for (const b of H.balls()) if (!v || b.army.length > v.army.length) v = b; return v; },
  ok(H) { const v = magpie.victim(H); return !!v && v.army.length >= 6 && H.balls().every((b) => b === v || b.army.length < v.army.length); },
  start(H, ev) {
    const D = begin(H, ev), s = D.s, v = magpie.victim(H);
    D.loot = [];
    for (const o of H.takeFrom(v, 6, true)) { D.loot.push({ id: o.spec.id, scale: o.size / H.SPECS[o.spec.id].size }); H.remove(o); }
    if (!D.loot.length) { ev.done = true; return; }
    D.n0 = D.loot.length;
    const sp = pickSpecies(H, (c) => c.move === 'fly' && c.types.includes('flying'), 1.6, 3)[0] || pickSpecies(H, flier, 1.6, 1)[0];
    const size = H.clamp(0.8 * s.med, 0.9, 4.5);
    let x = v.x, z = v.z;
    for (let t = 0; t < 8; t++) { const a = H.rand() * TAU, px = v.x + Math.cos(a) * (v.d / 2 + size + 1.5), pz = v.z + Math.sin(a) * (v.d / 2 + size + 1.5); if (inMap(H, px, pz) && H.waterAt(px, pz) !== 2) { x = px; z = pz; break; } }
    D.hits = [];
    D.o = hold(ev, H.put(sp.id, x, z, { scale: size / sp.height }), { noPick: true, cool: 2.5, onBump: (ball, o) => { o.cool = 1.6; D.hits.push(ball); } });
    if (!D.o) { ev.done = true; return; }
    D.speed = Math.max(3.2, H.topSpeed(s.med) * 0.85); D.stun = 0.7; D.boost = 4; D.cpuT = 0;       // it gets a head start, and bolts again after every ram D.caw = 0; D.tx = x; D.tz = z; D.ring = s.hub ? 36 : 95;
    const sack = new H.THREE.Group();
    H.P(sack, 'sph', 0x8a5a2b, [0.5, 0.55, 0.5], [0, 0, 0]);
    H.P(sack, 'cyl', 0xe8d9a8, [0.16, 0.2, 0.16], [0, 0.55, 0]);
    D.sack = D.fx.add(sack); D.size = size;
    magpie.flee(H, D);
    const who = H.isPlayer(v) ? '<b>YOU</b>' : `the <b>${H.teamOf(v).name}</b> team`;
    ev.sub = `A thief stole ${D.n0} critters from ${who}! Ram it to shake them loose: anyone can grab them`;
    mk(H, ev, 'magpie', x, z, { label: 'Thief', color: hexOf(magpie.color), radius: Math.max(3, size * 1.5) });
    H.cpuGoto(x, z, magpie.duration, 0.75);
    H.sfx.cry(sp, 0.1);
    jingle(H, [440, 415, 392, 370, 349], 'square', 0.08, 0.07);
  },
  flee(H, D) {                                             // picks the spot on its ring that is furthest from every ball
    const p = D.o.group.position, balls = H.balls();
    let bs = -1e9;
    for (let i = 0; i < 16; i++) {
      const x = DIRS[i][0] * D.ring, z = DIRS[i][1] * D.ring;
      if (H.waterAt(x, z) === 2 || Math.hypot(x - p.x, z - p.z) < 30) continue;
      let sc = 1e9;
      for (const b of balls) sc = Math.min(sc, Math.hypot(b.x - x, b.z - z));
      sc += H.rand() * 25;
      if (sc > bs) { bs = sc; D.tx = x; D.tz = z; }
    }
  },
  tick(H, ev, dt) {
    const D = ev.data, o = D.o;
    if (!isFree(o)) { ev.done = true; return; }
    const p = o.group.position;
    while (D.hits.length) {
      D.hits.pop();
      for (let k = 0; k < 2 && D.loot.length; k++) {
        const L = D.loot.pop(), m = H.put(L.id, p.x, p.z, { scale: L.scale, pop: false });
        if (!m) continue;
        const a = H.rand() * TAU, sp = 3 + H.rand() * (2 + D.s.med);
        H.fling(m, Math.cos(a) * sp, 6 + H.rand() * 3, Math.sin(a) * sp);
      }
      D.stun = 0.4; D.boost = 1.6;
      if (nearPlayer(H, p.x, p.z, 50)) { H.sfx.cry(o.spec, 0.09); H.sfx.tone(700, 300, 0.15, 'square', 0.07); }
      if (!D.loot.length) { H.toast('The thief dropped everything and fled!'); ev.done = true; return; }
      magpie.flee(H, D);
    }
    let x = p.x, z = p.z, yaw = o.group.rotation.y;
    if (D.stun > 0) D.stun -= dt;
    else {
      const dx = D.tx - x, dz = D.tz - z, d = Math.hypot(dx, dz), v = D.speed * (D.boost > 0 ? 1.7 : 1);
      D.boost -= dt;
      if (d < 3) magpie.flee(H, D);
      else {
        const wob = Math.sin(ev.t * 2.3) * 0.5, ux = dx / d, uz = dz / d, vx = ux - uz * wob, vz = uz + ux * wob, vl = Math.hypot(vx, vz);
        x += vx / vl * v * dt; z += vz / vl * v * dt; yaw = Math.atan2(vx, vz);
      }
    }
    stand(H, o, x, z, yaw, ev.t);
    const k = 0.5 + 0.5 * D.loot.length / D.n0;
    D.sack.position.set(x, p.y + o.size * 1.05, z); D.sack.scale.setScalar(D.size * 0.6 * k);
    H.moveMark('magpie', x, z);
    D.cpuT -= dt;
    if (D.cpuT <= 0) { D.cpuT = 0.5; cpuFollow(H, x, z); }
    D.caw -= dt;
    if (D.caw <= 0) { D.caw = 3.1; if (nearPlayer(H, x, z, 45)) H.sfx.cry(o.spec, 0.05); }
  },
  end(H, ev) {
    const D = ev.data, left = !D.ended && D.loot ? D.loot.length : 0;
    if (finish(H, ev, true) && left && ev.t >= magpie.duration - 0.5) H.toast(`The thief got away with ${left} critter${left > 1 ? 's' : ''}!`);
  },
};

// ======================================================================================================================
const staticStorm = {
  id: 'static', name: 'Static Storm', sub: 'For 25 seconds every ram knocks off THREE times as much. Hunt the biggest ball!', color: '#f5e663', duration: 25, weight: 0.8, late: true,
  biggest(H) { let m = null; for (const b of H.balls()) if (!m || b.d > m.d) m = b; return m; },
  start(H, ev) {
    const D = begin(H, ev), T3 = H.THREE;
    D.world = true;
    H.MODS.knock = 3; H.setSky(0x4a4f6a);
    const geo = D.fx.own(new T3.TorusGeometry(1, 0.035, 5, 22)), m = D.fx.own(new T3.MeshBasicMaterial({ color: 0xfff27a }));
    D.rings = [];
    for (const b of H.balls()) for (let k = 0; k < 2; k++) D.rings.push({ b, k, mesh: D.fx.add(new T3.Mesh(geo, m)) });
    const big = staticStorm.biggest(H);
    mk(H, ev, 'static', big.x, big.z, { label: 'Biggest target', color: hexOf(staticStorm.color), radius: Math.max(3, big.d) });
    H.cpuGoto(big.x, big.z, staticStorm.duration, 0.6);
    D.cpuT = 0; D.zap = 0;
    H.sfx.tone(60, 40, 1.2, 'sawtooth', 0.12);
    jingle(H, [1245, 311, 1245, 311], 'square', 0.06, 0.06, 0.05);
  },
  tick(H, ev, dt) {
    const D = ev.data;
    H.MODS.knock = 3;
    for (const r of D.rings) {
      const b = r.b, m = r.mesh;
      m.position.set(b.x, b.y, b.z); m.scale.setScalar(b.d * (0.6 + 0.06 * r.k));
      m.rotation.set(ev.t * (5 + r.k * 3) + r.k * 1.7, ev.t * 3.1 * (r.k ? -1 : 1), r.k * 1.1);
      m.visible = Math.sin(ev.t * 37 + r.k * 2 + b.team * 1.3) > -0.35;       // it flickers
    }
    const big = staticStorm.biggest(H);
    H.moveMark('static', big.x, big.z);
    D.cpuT -= dt;
    if (D.cpuT <= 0) { D.cpuT = 0.6; cpuFollow(H, big.x, big.z); }
    D.zap -= dt;
    if (D.zap <= 0) { D.zap = 0.5 + H.rand() * 0.8; H.sfx.tone(1800 + H.rand() * 900, 200, 0.05, 'square', 0.03); }
    if (!D.warned && ev.t > staticStorm.duration - 4) { D.warned = true; H.toast('The storm is passing...'); }
  },
  end(H, ev) { finish(H, ev); },
};

// ======================================================================================================================
const growthRing = {
  id: 'ring', name: 'Growth Ring', sub: 'Inside the ring a ball rolls up things three-quarters its own width!', color: '#7cf29a', duration: 35, weight: 1, late: true,
  start(H, ev) {
    const D = begin(H, ev), s = D.s, T3 = H.THREE;
    D.R = 14;
    const site = namedSite(H, s, 0, 0, 0);
    D.x = site.x; D.z = site.z; D.loot = []; D.wave = 0; D.tidy = 0;
    D.items = ['crate', 'barrel', 'pumpkin', 'cake', 'teddy', 'bucket', 'stump'].filter((id) => H.SPECS[id]);
    if (!D.items.length) D.items = ['coin'];
    const geo = D.fx.own(new T3.CylinderGeometry(D.R, D.R, 1, 40, 1, true));
    D.mat = D.fx.own(new T3.MeshBasicMaterial({ color: 0x7cf29a, transparent: true, opacity: 0.2, depthWrite: false, side: T3.DoubleSide }));
    D.wall = D.fx.add(new T3.Mesh(geo, D.mat));
    D.wall.scale.y = 2 + s.med; D.wall.position.set(D.x, H.groundAt(D.x, D.z) + (2 + s.med) / 2, D.z);
    ev.title = site.short + ' Growth Ring';
    ev.sub = `A growth ring glows at ${site.long}: inside it, a ball rolls up things <b>three-quarters</b> its own width!`;
    mk(H, ev, 'ring', D.x, D.z, { label: 'Growth ring', color: hexOf(growthRing.color), radius: D.R });
    H.cpuGoto(D.x, D.z, 30, 0.8);
    growthRing.fill(H, D, 14, 8);
    jingle(H, [262, 330, 392, 523, 659, 784], 'sine', 0.1, 0.07, 0.2);
  },
  // Things between half and three-quarters of a median ball: only worth having inside the ring.
  fill(H, D, items, critters) {
    const s = sizes(H), h0 = H.groundAt(D.x, D.z);
    const spot = () => { for (let t = 0; t < 8; t++) { const a = H.rand() * TAU, r = 2 + Math.sqrt(H.rand()) * (D.R - 3), x = D.x + Math.cos(a) * r, z = D.z + Math.sin(a) * r; if (H.waterAt(x, z) !== 2 && Math.abs(H.groundAt(x, z) - h0) < 0.4 && !H.balls().some((b) => Math.hypot(b.x - x, b.z - z) < b.d * 0.5 + 0.75 * s.med)) return [x, z]; } return null; };
    for (let i = 0; i < items; i++) {
      const p = spot(), size = s.med * (0.52 + H.rand() * 0.2);
      if (!p) continue;
      const o = prize(H, pick(H, D.items), p[0], p[1], size, 0.11, s.med);
      if (o) D.loot.push(o);
    }
    const kinds = pickSpecies(H, landMover, 0.6 * s.med, 3);
    for (let i = 0; i < critters && kinds.length; i++) {
      const p = spot(), sp = kinds[i % kinds.length];
      if (p) H.put(sp.id, p[0], p[1], { scale: H.clamp(s.med * (0.52 + H.rand() * 0.2) / sp.height, 0.4, 4), bonus: 0.6 });
    }
  },
  tick(H, ev, dt) {
    const D = ev.data;
    let inside = 0;
    for (const b of H.balls()) if (Math.hypot(b.x - D.x, b.z - D.z) < D.R) { b.ratioBonus = 0.25; inside++; }
    D.mat.opacity = 0.16 + 0.08 * Math.sin(ev.t * 4) + (inside ? 0.06 : 0);
    D.wall.rotation.y += dt * 0.5;
    if (D.wave < 2 && ev.t > 11 + D.wave * 10) { D.wave++; growthRing.fill(H, D, 7, 3); if (nearPlayer(H, D.x, D.z, 40)) jingle(H, [523, 784], 'sine', 0.07, 0.08); }
    D.tidy -= dt;
    if (D.tidy <= 0) { D.tidy = 0.5; forgetTaken(D.loot); }
  },
  end(H, ev) {
    const D = ev.data, loot = !D.ended && D.loot ? D.loot : [];
    finish(H, ev);
    for (const o of loot) if (isFree(o) && !o.fly) H.remove(o);            // the ring's oversized treasure fades with it; its critters stay
  },
};

// ======================================================================================================================
const ghostFog = {
  id: 'fog', name: 'Ghost Fog', sub: 'Ghost and poison critters only come out in the fog. They are appearing near you now!', color: '#9a8fc0', duration: 30, weight: 1,
  start(H, ev) {
    const D = begin(H, ev);
    D.world = true;
    H.MODS.fog = 0.3; H.setSky(0x6b6480);
    D.loot = []; D.wave = 0; D.tidy = 0;
    D.ghosts = H.CREATURES.filter((sp) => sp.types.includes('ghost') && sp.move !== 'swim' && sp.move !== 'still');
    D.poison = H.CREATURES.filter((sp) => sp.types.includes('poison') && !sp.types.includes('ghost') && sp.move !== 'swim' && sp.move !== 'still');
    if (!D.ghosts.length) D.ghosts = D.poison;
    if (!D.poison.length) D.poison = D.ghosts;
    H.sfx.tone(220, 110, 1.6, 'sine', 0.12); H.sfx.tone(233, 117, 1.6, 'sine', 0.08, 0.3);
  },
  tick(H, ev, dt) {
    const D = ev.data;
    H.MODS.fog = 0.3;
    D.tidy -= dt;
    if (D.tidy <= 0) { D.tidy = 0.5; forgetTaken(D.loot); }
    if (D.wave >= 6 || ev.t < 1.5 + D.wave * 4.6 || !D.ghosts.length) return;
    D.wave++;
    for (const b of H.balls()) {                           // a little group beside every ball, sized for that ball
      const ghost = H.rand() < 0.5, list = ghost ? D.ghosts : D.poison, target = 0.36 * b.d;
      const sp = list.map((c) => [Math.abs(Math.log(c.height / target)) + H.rand() * 0.5, c]).sort((p, q) => p[0] - q[0])[0][1];
      const h0 = H.groundAt(b.x, b.z);
      for (let t = 0; t < 8; t++) {
        const a = H.rand() * TAU, r = b.d * 1.5 + 5 + H.rand() * 6, x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r;
        if (!inMap(H, x, z) || H.waterAt(x, z) !== 0 || Math.abs(H.groundAt(x, z) - h0) > 0.3 * b.d) continue;
        for (const o of H.herd(sp, [x, z], ghost ? 2 : 3, fit(H, sp, target, 0.05, D.s.med))) D.loot.push(o);
        break;
      }
    }
    H.sfx.tone(180 + D.wave * 12, 90, 0.9, 'sine', 0.07);
  },
  end(H, ev) {
    const D = ev.data, loot = !D.ended && D.loot ? D.loot : [];
    finish(H, ev);
    for (const o of loot) if (isFree(o)) H.remove(o);                       // they fade with the fog
  },
};

// ======================================================================================================================
const coldSnap = {
  id: 'cold', name: 'Cold Snap', sub: 'The sea has frozen! Any ball can cross Pearl Bay: ice and water critters are out on the ice', color: '#9fe3f5', duration: 35, weight: 1,
  ok(H) { const s = sizes(H); return s.go >= 1.05 && Array.isArray(H.PLACES.islets) && !H.MODS.iced; },
  start(H, ev) {
    const D = begin(H, ev), s = D.s;
    D.world = true;
    H.setIce(true); H.setSky(0xdff3fa);
    const isl = H.PLACES.islets;
    let mx = 0, mz = 0;
    for (const p of isl) { mx += p[0] / isl.length; mz += p[1] / isl.length; }
    D.x = mx; D.z = mz;
    const target = 0.36 * s.med, cold = (sp) => sp.types.includes('ice') || sp.types.includes('water');
    const swimmers = pickSpecies(H, (sp) => cold(sp) && sp.move === 'swim', target, 4);
    const fliers = pickSpecies(H, (sp) => sp.types.includes('ice') && flier(sp), target, 2);
    const crate = itemId(H, 'crate', 'barrel', 'cake'), size = prizeSize(s);
    const school = (x, z, i) => { const sp = swimmers[i % swimmers.length]; if (sp && H.waterAt(x, z) === 2) H.herd(sp, [x, z], 3, fit(H, sp, target, 0.06, s.med)); };
    isl.forEach((p, i) => {
      // out on the ice round each islet (any ball can get there); on the islet itself only if the balls can climb out of the bay
      for (let t = 0; t < 8; t++) { const a = H.rand() * TAU, r = 17 + H.rand() * 6, x = p[0] + Math.cos(a) * r, z = p[1] + Math.sin(a) * r; if (inMap(H, x, z) && H.waterAt(x, z) === 2) { school(x, z, i); break; } }
      if (0.37 * s.go >= H.groundAt(p[0], p[1]) + 1.3) {
        for (let k = 0; k < 3; k++) { const a = H.rand() * TAU, x = p[0] + Math.cos(a) * 4, z = p[1] + Math.sin(a) * 4; if (H.waterAt(x, z) === 0) prize(H, crate, x, z, size, 0.11, s.med); }
        if (fliers.length) H.herd(fliers[i % fliers.length], p, 2, fit(H, fliers[i % fliers.length], target, 0.06, s.med));
      }
    });
    for (let i = 0; i < 4; i++) { const p = H.sampleBiome([H.B.sea], 'water', Math.hypot(mx, mz) - 14, 16); if (p) school(p[0], p[1], i + 1); }
    for (let i = 0; i < 8; i++) {                         // and along the frozen shallows, where things stand proud of the ice
      const p = H.sampleBiome([H.B.tidepool], 'dry', null, 20);
      if (!p || H.groundAt(p[0], p[1]) < -0.22) continue;
      if (i % 4 === 3 && fliers.length) H.herd(fliers[i % fliers.length], p, 2, fit(H, fliers[i % fliers.length], target, 0.06, s.med));
      else prize(H, crate, p[0], p[1], size, 0.11, s.med);
    }
    mk(H, ev, 'cold', D.x, D.z, { label: 'Frozen bay', color: hexOf(coldSnap.color), radius: 26 });
    H.cpuGoto(D.x, D.z, 27, 0.6);
    jingle(H, [2093, 1568, 1319, 1047, 1319, 2093], 'sine', 0.08, 0.09, 0.25);
  },
  tick(H, ev) {
    const D = ev.data;
    if (!D.warned && ev.t >= coldSnap.duration - 5) {
      D.warned = true;
      H.toast('The ice is cracking: get off the sea!');
      H.shake(0.3);
      jingle(H, [180, 140, 110, 90], 'sawtooth', 0.12, 0.16, 0.2);
      const pier = H.PLACES.pier || [0, 118];
      H.cpuGoto(pier[0], pier[1] - 12, 8, 1);             // everyone back to shore
    }
  },
  end(H, ev) { finish(H, ev); },
};

// ======================================================================================================================
const pinata = {
  id: 'pinata', name: 'Pinata Colossus', sub: 'A colossus has landed. Ram it to shake critters loose, until it bursts!', color: '#ff7ad9', duration: 40, weight: 1,
  RAMS: 10,
  start(H, ev) {
    const D = begin(H, ev), s = D.s;
    // a small species whose titan (ten times its size) stands 3-6 balls tall; scaled the rest of the way to 4.5
    const sp = pickSpecies(H, (c) => landMover(c) && H.SPECS['titan' + c.id], 0.45 * s.med, 4)[0] || pickSpecies(H, landMover, 0.45 * s.med, 1)[0];
    const tid = H.SPECS['titan' + sp.id] ? 'titan' + sp.id : sp.id, big = 4.5 * s.med, rad = big * 0.3;
    const site = namedSite(H, s, rad + 2, rad + 2, 0.4);
    D.sp = sp; D.x = site.x; D.z = site.z; D.rams = 0; D.hits = []; D.wob = 0; D.last = null;
    D.small = fit(H, sp, Math.min(sp.height, 0.42 * s.med), 0.05, s.med);
    D.o = hold(ev, H.put(tid, site.x, site.z, { scale: big / H.SPECS[tid].size }), { noPick: true, onBump: (ball, o) => { o.cool = 1.4; D.hits.push(ball); } });
    if (!D.o) { ev.done = true; return; }
    ev.title = site.short + ' Colossus';
    ev.sub = `A giant <b>${sp.name}</b> has landed at ${site.long}. Ram it to shake critters loose: ${pinata.RAMS} rams and it bursts!`;
    mk(H, ev, 'pinata', site.x, site.z, { label: 'Colossus', color: hexOf(pinata.color), radius: Math.max(5, rad * 1.6) });
    H.cpuGoto(site.x, site.z, pinata.duration, 0.8);
    H.sfx.cry(sp, 0.12);
    jingle(H, [196, 262, 196, 330, 392], 'sawtooth', 0.09, 0.12);
  },
  shower(H, D, n) {
    const p = D.o.group.position, r = D.o.rad;
    for (let i = 0; i < n; i++) {
      const a = H.rand() * TAU, m = H.put(D.sp.id, p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, Object.assign({ pop: false }, D.small));
      if (!m) continue;
      const v = 3 + H.rand() * (2 + D.s.med);
      H.fling(m, Math.cos(a) * v, 6 + H.rand() * 3, Math.sin(a) * v);
    }
  },
  tick(H, ev, dt) {
    const D = ev.data, o = D.o;
    if (!isFree(o)) { ev.done = true; return; }
    while (D.hits.length) {
      D.last = D.hits.pop(); D.rams++; D.wob = 1;
      const near = nearPlayer(H, D.x, D.z, 60);
      if (D.rams >= pinata.RAMS) {
        pinata.shower(H, D, 10);
        H.remove(o);
        H.grow(D.last, 0.3 * D.last.vol3);
        H.toast(`${H.ballName(D.last)} burst the Colossus!`);
        if (near) { H.shake(0.5); H.sfx.win(); }
        ev.done = true;
        return;
      }
      pinata.shower(H, D, 3);
      o.size *= 0.92; o.rad *= 0.92; o.group.scale.setScalar(o.size);
      if (near) { H.sfx.cry(D.sp, 0.08); H.sfx.tone(300 + D.rams * 40, 150, 0.12, 'square', 0.08); }
      if (D.rams === pinata.RAMS / 2) H.toast(`The Colossus is cracking: ${pinata.RAMS - D.rams} more rams!`);
    }
    if (D.wob > 0) { D.wob = Math.max(0, D.wob - dt * 2.5); o.group.rotation.z = Math.sin(ev.t * 30) * 0.12 * D.wob; }
  },
  end(H, ev) { finish(H, ev, true); },                     // if nobody burst it, it stomps off
};

// ======================================================================================================================
const vault = {
  id: 'vault', name: 'Vault', sub: 'A vault is open: a hoard of critters and gold, first come first served!', color: '#e8c34a', duration: 30, weight: 1,
  start(H, ev) {
    const D = begin(H, ev), s = D.s;
    const types = {};
    for (const sp of H.CREATURES) if (landMover(sp) || flier(sp)) for (const t of sp.types) types[t] = (types[t] || 0) + 1;
    const type = pick(H, Object.keys(types).filter((t) => types[t] >= 3));
    const target = 0.36 * s.med, kinds = pickSpecies(H, (sp) => (landMover(sp) || flier(sp)) && sp.types.includes(type), target, 3);
    const r1 = target * 2.3 + 1, site = namedSite(H, s, r1 + 1.5, r1 + 16, 0.7);
    D.x = site.x; D.z = site.z; D.hoard = [];
    for (let i = 0; i < 14; i++) {                         // nine round the outside, five inside
      const outer = i < 9, a = (outer ? i / 9 : (i - 9) / 5 + 0.1) * TAU, r = outer ? r1 : r1 * 0.5, sp = kinds[i % kinds.length];
      const o = hold(ev, H.put(sp.id, D.x + Math.cos(a) * r, D.z + Math.sin(a) * r, Object.assign({ rot: Math.atan2(Math.cos(a), Math.sin(a)) }, fit(H, sp, target, 0.06, s.med))));
      if (o) D.hoard.push(o);
    }
    const coin = itemId(H, 'coin', 'pebble'), cs = prizeSize(s) * 0.6;
    for (let i = 0; i < 10; i++) {
      const a = H.rand() * TAU, r = H.rand() * r1 * 0.3, o = prize(H, coin, D.x + Math.cos(a) * r, D.z + Math.sin(a) * r, cs, 0.03, s.med);
      if (o) D.hoard.push(o);
    }
    ev.title = site.short + ' Vault';
    ev.sub = `The ${site.short} vault is open! 14 <b>${type.toUpperCase()}</b> critters and a pile of gold at ${site.long}: first come, first served`;
    mk(H, ev, 'vault', D.x, D.z, { label: site.short + ' vault', color: hexOf(vault.color), radius: r1 + 2 });
    H.cpuGoto(D.x, D.z, vault.duration, 0.85);
    jingle(H, [392, 494, 587, 784, 587, 784], 'triangle', 0.11, 0.09);
  },
  tick(H, ev) {
    const D = ev.data;
    if (ev.t < 2) return;
    for (const o of D.hoard) if (isFree(o)) return;
    H.toast('The vault has been cleaned out!');
    ev.done = true;
  },
  end(H, ev) { finish(H, ev); },                           // what is left stays, and wanders off
};

// ======================================================================================================================
const dash = {
  id: 'dash', name: 'Checkpoint Dash', sub: 'Five gates, one at a time. First ball through each wins growth and two critters!', color: '#4ad7ff', duration: 45, weight: 1,
  start(H, ev) {
    const D = begin(H, ev), s = D.s, T3 = H.THREE;
    const gapM = s.hub ? 26 : H.clamp(H.topSpeed(s.med) * 3.2, 35, 60), turns = [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, 1.95, -1.95, 2.5, -2.5, Math.PI], flip = H.rand() < 0.5 ? 1 : -1;
    const okAt = (x, z) => inMap(H, x, z) && Math.hypot(x, z) < 200 && H.waterAt(x, z) !== 2 && flatAt(H, x, z, 2, 0.5);
    // the first gate: about 40 m out (nearer while balls are small), then each next one 35 m on (more for big, quick balls), turning only as far as the ground demands
    let pts = null;
    for (let t = 0; t < 12 && !pts; t++) {
      const a = H.rand() * TAU, r = s.hub ? 22 : 40, chain = [[Math.cos(a) * r, Math.sin(a) * r]];
      if (!okAt(chain[0][0], chain[0][1]) || !pathOK(H, 0, 0, chain[0][0], chain[0][1], s.go)) continue;
      let head = a;
      while (chain.length < 5) {
        const p = chain[chain.length - 1];
        let nextP = null;
        for (const tn of turns) {
          const h2 = head + tn * flip, x = p[0] + Math.cos(h2) * gapM, z = p[1] + Math.sin(h2) * gapM;
          if (!okAt(x, z) || !pathOK(H, p[0], p[1], x, z, s.go) || chain.some((q) => Math.hypot(q[0] - x, q[1] - z) < gapM * 0.7)) continue;
          nextP = [x, z]; head = h2; break;
        }
        if (!nextP) break;
        chain.push(nextP);
      }
      if (chain.length === 5) pts = chain;
    }
    if (!pts) { pts = []; const a0 = H.rand() * TAU; for (let i = 0; i < 5; i++) pts.push([Math.cos(a0 + i * 1.1) * 28, Math.sin(a0 + i * 1.1) * 28]); }   // a lap of the Green
    D.gr = H.clamp(2.5 + s.med * 1.3, 4, 12);
    const geo = D.fx.own(new T3.TorusGeometry(1, 0.07, 6, 28, Math.PI));
    D.mOn = D.fx.own(new T3.MeshBasicMaterial({ color: 0x4ad7ff }));
    D.mOff = D.fx.own(new T3.MeshBasicMaterial({ color: 0x8aa0b0, transparent: true, opacity: 0.4, depthWrite: false }));
    D.gates = pts.map((p, i) => {
      const q = pts[i + 1] || p, o = pts[i - 1] || [0, 0], m = new T3.Mesh(geo, D.mOff);
      m.position.set(p[0], H.groundAt(p[0], p[1]), p[1]); m.scale.setScalar(D.gr);
      m.rotation.y = Math.atan2(q[0] - o[0], q[1] - o[1]);                   // the arch faces along the course
      return { x: p[0], z: p[1], mesh: D.fx.add(m) };
    });
    D.i = -1;
    dash.light(H, ev, 0);
    H.cpuGoto(pts[0][0], pts[0][1], dash.duration, 0.8);
    jingle(H, [659, 659, 659, 1047], 'square', 0.09, 0.22, 0.14);
  },
  light(H, ev, i) {
    const D = ev.data;
    if (D.gates[D.i]) D.gates[D.i].mesh.visible = false;
    D.i = i;
    const g = D.gates[i];
    if (!g) return;
    g.mesh.material = D.mOn;
    mk(H, ev, 'dash', g.x, g.z, { label: `Gate ${i + 1}/${D.gates.length}`, color: hexOf(dash.color), radius: D.gr });
    cpuFollow(H, g.x, g.z);
  },
  tick(H, ev) {
    const D = ev.data, g = D.gates[D.i];
    if (!g) { ev.done = true; return; }
    g.mesh.scale.setScalar(D.gr * (1 + 0.05 * Math.sin(ev.t * 8)));
    let win = null, bd = 1e9;
    for (const b of H.balls()) { const d = Math.hypot(b.x - g.x, b.z - g.z); if (d < D.gr + b.d * 0.25 && d < bd) { bd = d; win = b; } }
    if (!win) return;
    H.grow(win, 0.12 * win.vol3);
    reward(H, win, 2);
    H.toast(`${H.ballName(win)} took gate ${D.i + 1}/${D.gates.length}`);
    if (H.isPlayer(win)) H.sfx.win(); else H.sfx.tone(523, 392, 0.2, 'triangle', 0.1);
    if (D.i + 1 >= D.gates.length) { g.mesh.visible = false; ev.done = true; return; }
    dash.light(H, ev, D.i + 1);
  },
  end(H, ev) { finish(H, ev); },
};

// ======================================================================================================================
const twister = {
  id: 'twister', name: 'Twister', sub: 'A tornado is tearing across the map. Keep clear of it, and grab what it throws out!', color: '#b8c4d6', duration: 35, weight: 1, late: true,
  start(H, ev) {
    const D = begin(H, ev), s = D.s, T3 = H.THREE;
    D.Rt = H.clamp(2 + s.med * 0.8, 3, 9);
    D.maxSize = Math.max(1.2, s.med * 0.8);                // it cannot lift anything bigger
    // the route: three points, each in the next habitat round (or three corners of the Green)
    const k0 = Math.floor(H.rand() * 8), turn = H.rand() < 0.5 ? 1 : -1;
    D.pts = [];
    for (let i = 0; i < 3; i++) {
      const a = s.hub ? H.rand() * TAU : (k0 + i * turn) * TAU / 8 + (H.rand() - 0.5) * 0.3, r = s.hub ? 16 + H.rand() * 22 : 78 + H.rand() * 24;
      D.pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    D.len = [Math.hypot(D.pts[1][0] - D.pts[0][0], D.pts[1][1] - D.pts[0][1]), Math.hypot(D.pts[2][0] - D.pts[1][0], D.pts[2][1] - D.pts[1][1])];
    D.v = (D.len[0] + D.len[1]) / (twister.duration - 1);
    const geo = D.fx.own(new T3.TorusGeometry(1, 0.17, 5, 14)), m = D.fx.own(new T3.MeshBasicMaterial({ color: 0xcfd6e2, transparent: true, opacity: 0.6, depthWrite: false }));
    D.rings = [];
    for (let i = 0; i < 8; i++) { const mesh = new T3.Mesh(geo, m); mesh.rotation.x = Math.PI / 2; D.rings.push(D.fx.add(mesh)); }
    D.suck = 0; D.scan = 0; D.cpuT = 0; D.howl = 0; D.x = D.pts[0][0]; D.z = D.pts[0][1]; D.ux = 1; D.uz = 0;
    twister.move(H, D, 0);
    mk(H, ev, 'twister', D.x, D.z, { label: 'Twister', color: hexOf(twister.color), radius: D.Rt * 1.7 });
    H.cpuGoto(D.x, D.z, twister.duration, 0.6);
    H.sfx.tone(140, 420, 1.2, 'sawtooth', 0.07); H.sfx.tone(210, 630, 1.2, 'sine', 0.06, 0.1);
  },
  move(H, D, t) {
    let sd = D.v * t, seg = 0;
    if (sd > D.len[0]) { sd -= D.len[0]; seg = 1; }
    const a = D.pts[seg], b = D.pts[seg + 1], L = D.len[seg] || 1, k = Math.min(1, sd / L), sway = Math.sin(t * 0.9) * 6;
    D.ux = (b[0] - a[0]) / L; D.uz = (b[1] - a[1]) / L;
    D.x = H.clamp(a[0] + (b[0] - a[0]) * k - D.uz * sway, H.BOUNDS.x1 + 10, H.BOUNDS.x2 - 10);
    D.z = H.clamp(a[1] + (b[1] - a[1]) * k + D.ux * sway, H.BOUNDS.z1 + 10, H.BOUNDS.z2 - 10);
    const gy = H.groundAt(D.x, D.z);
    for (let i = 0; i < D.rings.length; i++) {
      const rr = D.Rt * (0.3 + 0.11 * i), m = D.rings[i];
      m.position.set(D.x + Math.cos(t * 6 + i * 0.9) * rr * 0.22, gy + (i + 0.4) * D.Rt * 0.5, D.z + Math.sin(t * 6 + i * 0.9) * rr * 0.22);
      m.scale.set(rr, rr, D.Rt * 0.9);
      m.rotation.z = t * (4 + i * 0.3);
    }
  },
  tick(H, ev, dt) {
    const D = ev.data;
    twister.move(H, D, ev.t);
    H.moveMark('twister', D.x, D.z);
    D.suck -= dt;
    if (D.suck <= 0) {                                     // about six things a second go up and come down somewhere else
      D.suck = 1 / 6;
      const objs = H.objects(), n = objs.length, R2 = (D.Rt * 1.7) ** 2;
      for (let k = 0; k < n; k++) {
        const o = objs[(D.scan + k) % n];
        if (o.fly || o.on || o.noPick || o.script || o.spawnT > 0 || o.cool > 0 || o.size > D.maxSize) continue;
        const p = o.group.position, dx = p.x - D.x, dz = p.z - D.z;
        if (dx * dx + dz * dz > R2) continue;
        const vy = 8 + H.rand() * 4, sp = 4 + H.rand() * D.Rt, air = 2 * vy / 9.8;
        let a = H.rand() * TAU;
        for (let t = 0; t < 4 && H.waterAt(p.x + Math.cos(a) * sp * air, p.z + Math.sin(a) * sp * air) === 2; t++) a = H.rand() * TAU;   // not into the sea, if it can help it
        H.fling(o, Math.cos(a) * sp, vy, Math.sin(a) * sp);
        D.scan = (D.scan + k + 1) % n;
        break;
      }
    }
    for (const b of H.balls()) {                           // touch it and you are spun, stripped and thrown out
      const dx = D.x - b.x, dz = D.z - b.z, dist = Math.hypot(dx, dz);
      if (dist > D.Rt * 0.9 + b.d / 2) continue;
      const nx = dist > 1e-4 ? dx / dist : 1, nz = dist > 1e-4 ? dz / dist : 0;
      if (!(b.hitCool > 0)) { H.knock(b, nx, nz, 3); if (H.isPlayer(b)) H.shake(0.4); }
      punt(H, b, -nx, -nz, H.topSpeed(b.d) * 1.2);
    }
    D.cpuT -= dt;
    if (D.cpuT <= 0) { D.cpuT = 1; cpuFollow(H, D.x - D.ux * D.Rt * 3.5, D.z - D.uz * D.Rt * 3.5); }      // CPUs trail it at a safe distance
    D.howl -= dt;
    if (D.howl <= 0) { D.howl = 1.4; if (nearPlayer(H, D.x, D.z, 70)) H.sfx.tone(120 + H.rand() * 60, 260 + H.rand() * 120, 1.1, 'sawtooth', 0.04); }
  },
  end(H, ev) { finish(H, ev); },
};

// ---------- the list ----------
// A start() that throws cleans up after itself before the host hears about it; tick() does nothing once ended.
function guard(def) {
  const { start, tick, end } = def;
  def.start = (H, ev) => { try { start(H, ev); } catch (e) { try { end(H, ev); } catch (e2) { /* the first error is the one to report */ } throw e; } };
  def.tick = (H, ev, dt) => { if (!ev.data.ended) tick(H, ev, dt); };
  return def;
}
export const EVENTS = [meteor, stampede, swarm, golden, supply, magpie, staticStorm, growthRing, ghostFog, coldSnap, pinata, vault, dash, twister].map(guard);
