// Prints the ground at points or over a patch.   node tools/map-probe.mjs x z [x z ...]     or     node tools/map-probe.mjs patch x1 z1 x2 z2 [step]
// For each point: biome, ground height (m), water (0 none, 1 shallow, 2 sea). A patch prints a grid of heights (~ = shallow water, # = sea).
import { loadWorld } from './world.mjs';
const { T, BIOMES } = await loadWorld();
const a = process.argv.slice(2);
if (a[0] === 'patch') {
  const [x1, z1, x2, z2] = a.slice(1, 5).map(Number), st = +(a[5] || 2);
  for (let z = z1; z <= z2; z += st) { let row = String(z).padStart(5) + ' '; for (let x = x1; x <= x2; x += st) { const w = T.waterAt(x, z); row += w === 2 ? '  # ' : w === 1 ? '  ~ ' : T.groundAt(x, z).toFixed(1).padStart(4); } console.log(row); }
  console.log('      x from ' + x1 + ' to ' + x2 + ' step ' + st);
} else for (let i = 0; i + 1 < a.length; i += 2) { const x = +a[i], z = +a[i + 1]; console.log(`(${x}, ${z}): ${BIOMES[T.biomeAt(x, z)].id}, ground ${T.groundAt(x, z).toFixed(2)} m, water ${T.waterAt(x, z)}`); }
