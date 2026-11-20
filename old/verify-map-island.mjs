// Checks that the map is topologically interesting and has no traps.   node tools/verify-map.mjs
// For a range of ball sizes it works out, using the game's own movement rules:
//   - which habitats the ball can reach from the start
//   - "loops": independent circuits in the walkable area (routes that go round something and come back)
//   - one-way drops: ledges the ball can roll off but not climb back up
//   - pockets: places the ball can get into but cannot get back to the start from (traps, unless it can grow there)
import { BOUNDS, START, GATES, scenery } from '../map.js';
import { createTerrain, SEA_MIN_D } from '../terrain.js';

const T = createTerrain(BOUNDS, scenery), { NX, NZ, tH, tR, tW } = T;
const N = NX * NZ, gate = new Float32Array(N);
for (const g of GATES) for (let z = Math.floor(g.z1); z < g.z2; z++) for (let x = Math.floor(g.x1); x < g.x2; x++) gate[T.index(x + 0.5, z + 0.5)] = g.minD;
const zoneOf = new Array(N).fill('');
for (const [name, list] of Object.entries(T.zones)) for (const zn of list) {
  if (name === 'sea' || name === 'wild' || name === 'beach') continue;
  for (let k = 0; k < N; k++) { const x = BOUNDS.x1 + (k % NX) + 0.5, z = BOUNDS.z1 + Math.floor(k / NX) + 0.5; if (((x - zn.cx) / zn.rx) ** 2 + ((z - zn.cz) / zn.rz) ** 2 < 1 && (!zn.colors || zn.colors.includes(T.tC[k]))) zoneOf[k] = name; }
}
// Can a ball of diameter d move from tile a to its neighbour b?
function can(a, b, d) {
  if (gate[b] > d) return false;
  if (tW[b] === 2 && d < SEA_MIN_D) return false;
  const rise = tH[b] - tH[a];
  if (tR[a] || tR[b]) return rise <= 0.6;          // on a ramp: the slope is what matters, and all ramps are gentle
  return rise <= d * 0.4;
}
const nb = (k) => { const i = k % NX, j = (k / NX) | 0, o = []; if (i > 0) o.push(k - 1); if (i < NX - 1) o.push(k + 1); if (j > 0) o.push(k - NX); if (j < NZ - 1) o.push(k + NX); return o; };
function flood(start, d, forward) {
  const seen = new Uint8Array(N), q = [start]; seen[start] = 1;
  while (q.length) { const a = q.pop(); for (const b of nb(a)) if (!seen[b] && (forward ? can(a, b, d) : can(b, a, d))) { seen[b] = 1; q.push(b); } }
  return seen;
}
const startK = T.index(START.x, START.z);
let prevZones = new Set(), ok = true;
console.log('ball   area(m2)  loops  one-way  pocket  habitats newly reachable');
for (const d of [0.3, 0.5, 0.8, 1.0, 1.5, 2.25, 3.0, 3.1, 3.25, 3.75, 5, 6.5, 10, 16, 24]) {
  const fwd = flood(startK, d, true), back = flood(startK, d, false);
  let area = 0, pocket = 0, oneWay = 0, edges = 0;
  const zones = new Set(), pocketZones = {};
  for (let k = 0; k < N; k++) {
    if (!fwd[k]) continue;
    area++; if (zoneOf[k]) zones.add(zoneOf[k]);
    if (!back[k]) { pocket++; pocketZones[zoneOf[k] || 'other'] = (pocketZones[zoneOf[k] || 'other'] || 0) + 1; }
    for (const b of nb(k)) if (b > k && fwd[b]) { const ab = can(k, b, d), ba = can(b, k, d); if (ab && ba) edges++; else if (ab || ba) oneWay++; }
  }
  // loops = independent circuits of the two-way walkable graph = holes in it (E - V + components, minus the unit squares)
  let comps = 0; const seen = new Uint8Array(N);
  let faces = 0;
  for (let k = 0; k < N; k++) {
    if (fwd[k] && !seen[k]) { comps++; const q = [k]; seen[k] = 1; while (q.length) { const a = q.pop(); for (const b of nb(a)) if (fwd[b] && !seen[b] && can(a, b, d) && can(b, a, d)) { seen[b] = 1; q.push(b); } } }
    const i = k % NX, j = (k / NX) | 0;
    if (i < NX - 1 && j < NZ - 1) { const a = k, b = k + 1, c = k + NX, e = k + NX + 1; if (fwd[a] && fwd[b] && fwd[c] && fwd[e] && can(a, b, d) && can(b, a, d) && can(a, c, d) && can(c, a, d) && can(b, e, d) && can(e, b, d) && can(c, e, d) && can(e, c, d)) faces++; }
  }
  const loops = edges - area + comps - faces;
  const fresh = [...zones].filter((z) => !prevZones.has(z)); prevZones = zones;
  console.log(`${String(d).padEnd(6)} ${String(area).padEnd(9)} ${String(loops).padEnd(6)} ${String(oneWay).padEnd(8)} ${String(pocket).padEnd(7)} ${fresh.join(', ') || '-'}${pocket ? '   pockets: ' + JSON.stringify(pocketZones) : ''}`);
}
const levels = new Set(); for (let k = 0; k < N; k++) if (tW[k] !== 2) levels.add(tH[k].toFixed(2));
console.log(`\nland height levels: ${levels.size}, from ${Math.min(...[...levels].map(Number))} m to ${Math.max(...[...levels].map(Number))} m; ramps: ${T.ramps.length - 1}; gates: ${GATES.length}`);
