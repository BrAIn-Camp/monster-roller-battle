// Usage: node critters/check.mjs critters/critters_1.js [first last]
// Validates entries against slots.json without needing three.js.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const TYPES = ['normal','fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel'];
const HABITATS = ['town','beach','tidepool','sea','farm','marsh','forest','gorge','plain','canyon','mountain','summit','volcano','ruins','islet'];
const MOVES = ['walk','hop','fly','float','swim','slither','still'], TEMPERS = ['timid','calm','curious','bold'], RARITIES = ['common','uncommon','rare','unique'];
const SHAPES = ['sph','box','cyl','cone','taper','torus','rock','hemi'];
const slots = JSON.parse(readFileSync(new URL('./slots.json', import.meta.url), 'utf8'));
const file = process.argv[2], first = +process.argv[3] || 1, last = +process.argv[4] || 251;
const list = (await import(pathToFileURL(path.resolve(file)).href)).default;
const problems = [], seen = new Set(), ids = new Set();
const num3 = (a) => Array.isArray(a) && a.length === 3 && a.every((n) => typeof n === 'number' && isFinite(n));
for (const c of list) {
  const tag = `#${c.dex} ${c.id}`;
  const s = slots.find((x) => x.dex === c.dex);
  if (!s) { problems.push(tag + ': no such slot'); continue; }
  if (seen.has(c.dex)) problems.push(tag + ': duplicate slot'); seen.add(c.dex);
  if (!/^[a-z]+$/.test(c.id || '') || ids.has(c.id)) problems.push(tag + ': id must be unique lowercase letters'); ids.add(c.id);
  if (!c.name || c.name.toLowerCase() === s.official.toLowerCase()) problems.push(tag + ': needs an original name');
  if (c.species !== s.category) problems.push(`${tag}: species must be "${s.category}"`);
  if (JSON.stringify(c.types) !== JSON.stringify(s.types)) problems.push(`${tag}: types must be ${JSON.stringify(s.types)}`);
  if (c.height !== s.height) problems.push(`${tag}: height must be ${s.height}`);
  if (!HABITATS.includes(c.habitat)) problems.push(tag + ': bad habitat ' + c.habitat);
  if (!MOVES.includes(c.move)) problems.push(tag + ': bad move ' + c.move);
  if (!TEMPERS.includes(c.temper)) problems.push(tag + ': bad temper ' + c.temper);
  if (!RARITIES.includes(c.rarity)) problems.push(tag + ': bad rarity ' + c.rarity);
  if (!Array.isArray(c.parts) || c.parts.length < 6 || c.parts.length > 20) problems.push(tag + ': needs 6-20 parts');
  for (const p of c.parts || []) {
    if (p[0] === 'eye') { if (typeof p[1] !== 'number' || !num3(p[2])) problems.push(tag + ': bad eye part'); continue; }
    if (!SHAPES.includes(p[0])) problems.push(tag + ': bad shape ' + p[0]);
    if (typeof p[1] !== 'number' || !num3(p[2]) || !num3(p[3]) || (p[4] != null && !num3(p[4]))) problems.push(tag + ': bad part ' + JSON.stringify(p));
    else if (p[2].some((n) => n <= 0)) problems.push(tag + ': sizes must be positive');
  }
  if (!(c.parts || []).some((p) => p[0] === 'eye')) problems.push(tag + ': has no eyes');
}
for (let d = first; d <= last; d++) if (!seen.has(d)) problems.push(`slot ${d} is missing`);
console.log(problems.length ? problems.join('\n') : `OK: ${list.length} critters, slots ${first}-${last} complete`);
process.exit(problems.length ? 1 : 0);
