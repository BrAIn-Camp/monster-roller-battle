// Counts what layout() places in each biome, by size rung, and lists placement problems.   node tools/map-report.mjs [biome ...]
// Rungs are pick-up sizes about 1.45x apart. "ball" is the ball diameter that can roll a thing up (twice its size).
import { loadWorld } from './world.mjs';
const { objects, warnings, BIOMES, T, SPECS } = await loadWorld();
const only = process.argv.slice(2);
const RUNGS = [0, 0.07, 0.1, 0.15, 0.22, 0.32, 0.45, 0.65, 0.95, 1.4, 2, 2.9, 4.2, 6, 8.7, 12.5, 99];
const label = (i) => (RUNGS[i + 1] >= 99 ? `${RUNGS[i]}+` : `<${RUNGS[i + 1]}`).padStart(5);
console.log('biome      total ' + RUNGS.slice(0, -1).map((_, i) => label(i)).join(' ') + '   kinds');
for (const b of BIOMES) {
  if (only.length && !only.includes(b.id)) continue;
  const list = objects.filter((o) => o.biome === b.id);
  const row = RUNGS.slice(0, -1).map((lo, i) => String(list.filter((o) => o.size >= lo && o.size < RUNGS[i + 1]).length || '.').padStart(5));
  console.log(b.id.padEnd(10) + String(list.length).padStart(5) + ' ' + row.join(' ') + '   ' + new Set(list.map((o) => o.id)).size);
}
console.log(`\nall biomes: ${objects.length} things, ${new Set(objects.map((o) => o.id)).size} kinds`);
const probs = [...warnings];
const solid = objects.filter((o) => o.size >= 0.5 && !o.flat);
for (const o of objects) {
  if (only.length && !only.includes(o.biome)) continue;
  const at = `${o.id} at (${o.x.toFixed(1)}, ${o.z.toFixed(1)})`;
  if (Math.abs(o.x) > 232 || Math.abs(o.z) > 232) probs.push(`${at}: outside the playable area`);
  else if (o.water === 2 && !SPECS[o.id].floats) probs.push(`${at}: in the deep sea (add floats: true to the item if that is meant)`);
  let lo = o.y, hi = o.y; for (let a = 0; a < 6; a++) { const g = T.groundAt(o.x + Math.cos(a) * o.rad * 0.8, o.z + Math.sin(a) * o.rad * 0.8); lo = Math.min(lo, g); hi = Math.max(hi, g); }
  if (hi - lo > Math.max(0.5, o.size * 0.25)) probs.push(`${at}: straddles a ${(hi - lo).toFixed(1)} m ledge`);
}
const cell = new Map();
for (const o of solid) { const k = Math.floor(o.x / 8) + ',' + Math.floor(o.z / 8); (cell.get(k) || cell.set(k, []).get(k)).push(o); }
let overlaps = 0;
for (const o of solid) { if (only.length && !only.includes(o.biome)) continue; const cx = Math.floor(o.x / 8), cz = Math.floor(o.z / 8);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const p of cell.get((cx + i) + ',' + (cz + j)) || []) if (p !== o && (p.x > o.x || (p.x === o.x && p.z > o.z)) && Math.hypot(p.x - o.x, p.z - o.z) < (o.rad + p.rad) * 0.55) { overlaps++; if (overlaps <= 25) probs.push(`${o.id} (${o.x.toFixed(1)}, ${o.z.toFixed(1)}) is inside ${p.id} (${p.x.toFixed(1)}, ${p.z.toFixed(1)})`); } }
console.log(probs.length ? `\n${probs.length} problems${overlaps > 25 ? ` (${overlaps} overlaps, first 25 shown)` : ''}:\n  ` + probs.slice(0, 80).join('\n  ') : '\nno placement problems');
