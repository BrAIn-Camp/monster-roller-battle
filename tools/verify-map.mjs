// Checks the map's terrain with the game's own movement rules.   node tools/verify-map.mjs
// For a range of ball sizes it reports, starting from the player's start pad:
//   - which biomes the ball can reach (so the habitats open in the intended order)
//   - pockets: ground the ball can get into but not back out of to the start (must be 0, or it is a trap)
import { loadWorld } from './world.mjs';
import { SEA_MIN_D } from '../terrain.js';
const { T, BIOMES, map } = await loadWorld(), { NX, NZ, tH, tR, tW, tB } = T, N = NX * NZ, CLIMB = 0.4;
function can(a, b, d) {
  if (tW[b] === 2 && tW[a] !== 2 && d < SEA_MIN_D) return false;
  const rise = tH[b] - tH[a];
  if (tW[a] === 2 && rise <= 0.75) return true;            // a ball in the sea can always roll out
  if (tR[a] || tR[b]) return rise <= 0.6;
  return rise <= d * CLIMB;
}
const nb = (k) => { const i = k % NX, j = (k / NX) | 0, o = []; if (i > 5) o.push(k - 1); if (i < NX - 6) o.push(k + 1); if (j > 5) o.push(k - NX); if (j < NZ - 6) o.push(k + NX); return o; };
function flood(start, d, forward) {
  const seen = new Uint8Array(N), q = [start]; seen[start] = 1;
  while (q.length) { const a = q.pop(); for (const b of nb(a)) if (!seen[b] && (forward ? can(a, b, d) : can(b, a, d))) { seen[b] = 1; q.push(b); } }
  return seen;
}
let bad = 0;
console.log('ball    reach(m2)  pocket  biomes reachable (share of each)');
for (const d of [0.6, 0.85, 0.9, 1.2, 2, 2.1, 3.05, 4, 5.3, 6, 8.3, 10, 12.6, 16, 20, 30]) {
  const s = T.index(map.STARTS[0][0], map.STARTS[0][1]), fwd = flood(s, d, true), back = flood(s, d, false);
  let area = 0, pocket = 0; const got = new Array(BIOMES.length).fill(0), all = new Array(BIOMES.length).fill(0);
  for (let k = 0; k < N; k++) { all[tB[k]]++; if (!fwd[k]) continue; area++; got[tB[k]]++; if (!back[k]) pocket++; }
  if (pocket) bad++;
  console.log(String(d).padEnd(7), String(area).padEnd(10), String(pocket).padEnd(7), BIOMES.map((b, i) => (i && got[i] / all[i] > 0.03 ? `${b.id} ${Math.round(got[i] / all[i] * 100)}%` : '')).filter(Boolean).join(', '));
}
const s0 = flood(T.index(map.STARTS[0][0], map.STARTS[0][1]), 0.6, true);
const together = map.STARTS.every(([x, z]) => s0[T.index(x, z)]);
console.log(`\nall four starts connected at the starting size: ${together ? 'yes' : 'NO'}`);
console.log(bad || !together ? 'PROBLEMS FOUND' : 'OK: no traps');
