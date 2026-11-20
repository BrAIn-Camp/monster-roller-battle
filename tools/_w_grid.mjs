import { loadWorld } from './world.mjs';
const { T, BIOMES } = await loadWorld();
const L = { forest: 'F', gorge: 'G', farm: 'A', plain: 'P', hub: 'h', tundra: 't', summit: 's', marsh: 'm', graveyard: 'y', ocean: ' ', sea: ' ' };
const [x1, z1, x2, z2, st] = process.argv.slice(2).map(Number);
const hc = (h) => h < 0.3 ? '_' : h < 0.4 ? '.' : h < 0.5 ? ',' : h < 0.8 ? '0' : h < 1.1 ? '1' : h < 1.4 ? '2' : h < 1.7 ? '3' : h < 2 ? '4' : h < 2.3 ? '5' : h < 2.6 ? '6' : h < 2.9 ? '7' : h < 3.2 ? '8' : '9';
let hd = '      '; for (let x = x1; x <= x2; x += st) hd += (Math.round(x) % 20 === 0 ? '|' + String(x).padEnd(Math.floor(20 / st)) : ''); console.log(hd + '      (heights right)');
for (let z = z1; z <= z2; z += st) { let r = String(z).padStart(5) + ' ', r2 = '  ';
  for (let x = x1; x <= x2; x += st) { const b = BIOMES[T.biomeAt(x, z)].id, w = T.waterAt(x, z), h = T.groundAt(x, z); let c = L[b] ?? '?'; if (w === 1) c = '~'; if (w === 2) c = ' '; if (Math.round(x) % 20 === 0) { r += '|'; r2 += '|'; } r += c; r2 += w ? '~' : hc(h); }
  console.log(r + r2); }
