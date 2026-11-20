// Checks the map with the game's own movement rules.   node tools/verify-map.mjs
// For a range of ball sizes it reports, starting from the player's start:
//   - which of the map's areas the ball can reach (so the gates and walls open in the intended order)
//   - loops: independent circuits in the walkable ground
//   - one-way drops: ledges the ball can roll off but not climb back
//   - pockets: places the ball can get into but not back out of (must be 0, or it is a trap)
import { BOUNDS, STARTS, GATES, AREAS, scenery } from '../map.js';
import { createTerrain, SEA_MIN_D } from '../terrain.js';

const CLIMB = 0.4;                         // of the ball's diameter; keep in step with main.js (CLIMB = 0.8 of the radius)
const T = createTerrain(BOUNDS, scenery), { NX, NZ, tH, tR, tW } = T;
const N = NX * NZ, gate = new Float32Array(N);
for (const g of GATES) for (let z = Math.floor(g.z1); z < g.z2; z++) for (let x = Math.floor(g.x1); x < g.x2; x++) gate[T.index(x + 0.5, z + 0.5)] = g.minD;
const areaOf = (k) => { const x = BOUNDS.x1 + (k % NX) + 0.5, z = BOUNDS.z1 + Math.floor(k / NX) + 0.5, m = Math.max(Math.abs(x), Math.abs(z)); return AREAS.findIndex((a) => m >= a.inner && m <= a.outer); };
function can(a, b, d) {
  if (gate[b] > d) return false;
  if (tW[b] === 2 && d < SEA_MIN_D) return false;
  const rise = tH[b] - tH[a];
  if (tR[a] || tR[b]) return rise <= 0.6;
  return rise <= d * CLIMB;
}
const nb = (k) => { const i = k % NX, j = (k / NX) | 0, o = []; if (i > 0) o.push(k - 1); if (i < NX - 1) o.push(k + 1); if (j > 0) o.push(k - NX); if (j < NZ - 1) o.push(k + NX); return o; };
function flood(start, d, forward) {
  const seen = new Uint8Array(N), q = [start]; seen[start] = 1;
  while (q.length) { const a = q.pop(); for (const b of nb(a)) if (!seen[b] && (forward ? can(a, b, d) : can(b, a, d))) { seen[b] = 1; q.push(b); } }
  return seen;
}
let bad = 0;
console.log('ball   area(m2)  loops  one-way  pocket  areas reachable');
for (const d of [0.6, 0.8, 1.21, 2, 3.01, 4, 6.01, 8, 10.01, 12, 16, 23, 30]) {
  const startK = T.index(STARTS[0][0], STARTS[0][1]);
  const fwd = flood(startK, d, true), back = flood(startK, d, false);
  let area = 0, pocket = 0, oneWay = 0, edges = 0, comps = 0, faces = 0;
  const reach = new Set(), seen = new Uint8Array(N);
  for (let k = 0; k < N; k++) {
    if (!fwd[k]) continue;
    area++; const a = areaOf(k); if (a >= 0) reach.add(a);
    if (!back[k]) pocket++;
    for (const b of nb(k)) if (b > k && fwd[b]) { const ab = can(k, b, d), ba = can(b, k, d); if (ab && ba) edges++; else if (ab || ba) oneWay++; }
  }
  for (let k = 0; k < N; k++) {
    if (fwd[k] && !seen[k]) { comps++; const q = [k]; seen[k] = 1; while (q.length) { const a = q.pop(); for (const b of nb(a)) if (fwd[b] && !seen[b] && can(a, b, d) && can(b, a, d)) { seen[b] = 1; q.push(b); } } }
    const i = k % NX, j = (k / NX) | 0;
    if (i < NX - 1 && j < NZ - 1) { const a = k, b = k + 1, c = k + NX, e = k + NX + 1; if (fwd[a] && fwd[b] && fwd[c] && fwd[e] && can(a, b, d) && can(b, a, d) && can(a, c, d) && can(c, a, d) && can(b, e, d) && can(e, b, d) && can(c, e, d) && can(e, c, d)) faces++; }
  }
  if (pocket) bad++;
  console.log(`${String(d).padEnd(6)} ${String(area).padEnd(9)} ${String(edges - area + comps - faces).padEnd(6)} ${String(oneWay).padEnd(8)} ${String(pocket).padEnd(7)} ${[...reach].sort().map((a) => AREAS[a].name).join(', ')}`);
}
// every team's start must be able to reach every other start at the starting size
const s0 = flood(T.index(STARTS[0][0], STARTS[0][1]), 0.6, true);
const together = STARTS.every(([x, z]) => s0[T.index(x, z)]);
console.log(`\nall four starts connected at the starting size: ${together ? 'yes' : 'NO'}`);
console.log(`gates: ${GATES.map((g) => `${g.name} ${g.minD} m`).join('; ')}`);
console.log(bad || !together ? 'PROBLEMS FOUND' : 'OK: no traps');
