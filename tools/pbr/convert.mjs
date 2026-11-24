// Converts Battle Revolution's model archives into the .glb + meta.json layout the game loads (see README.md here).
//
//   node tools/pbr/convert.mjs <folder of pkx_NNN.fsys> <output folder> [options]
//     --only 1,25,152-160   just these species
//     --atlas 128           side of each model's one texture, in pixels
//     --triangles 800       most triangles a model keeps
//     --fps 30              sampling rate before spare keys are dropped
//     --png                 also write each model's texture beside it, to look at
//
// Nothing this writes belongs in the repository: it is made on your own machine from a disc you own.
import fs from 'node:fs';
import path from 'node:path';
import { entries, unpack } from './fsys.mjs';
import { parseSdr } from './sdr.mjs';
import { build, DEFAULTS } from './build.mjs';
import { writeGlb } from './glb.mjs';

const args = process.argv.slice(2), flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
const [src, out] = args;
if (!src || !out || src.startsWith('--')) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(0, 10).join('\n')); process.exit(1); }
const opts = { atlas: +flag('atlas', DEFAULTS.atlas), triangles: +flag('triangles', DEFAULTS.triangles), fps: +flag('fps', DEFAULTS.fps) };
const only = (() => {
  const s = flag('only', ''); if (!s) return null;
  const set = new Set();
  for (const part of s.split(',')) { const [a, b] = part.split('-').map(Number); for (let i = a; i <= (b || a); i++) set.add(i); }
  return set;
})();
const savePng = args.includes('--png');
// The names the game shows come from meta.json (critters/local-mode.js). Slots the game knows take theirs from
// critters/slots.json; the rest keep the name the model file gives its skeleton.
const NAMES = new Map();
try { for (const s of JSON.parse(fs.readFileSync(new URL('../../critters/slots.json', import.meta.url), 'utf8'))) NAMES.set(s.dex, s.official); } catch (e) { /* no slots file: skeleton names */ }

fs.mkdirSync(path.join(out, 'glb'), { recursive: true });
const metaPath = path.join(out, 'meta.json');
const meta = only && fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
const rows = [], failed = [];
for (const f of fs.readdirSync(src).filter((x) => /^pkx_\d+\.fsys$/.test(x)).sort()) {
  const dex = +f.slice(4, 7);
  if (dex > 493 || (only && !only.has(dex))) continue;
  try {
    const archive = fs.readFileSync(path.join(src, f));
    // an archive's first model is the ordinary one; a few lead with something else, so take the first that builds
    let built = null, why = null;
    for (const e of entries(archive).slice(0, 8)) {
      try { const raw = unpack(archive, e); built = build(parseSdr(raw), raw, opts); break; } catch (err) { why ||= err; }
    }
    if (!built) throw why || new Error('empty archive');
    const { glb, png } = writeGlb(built);
    const slug = String(dex).padStart(3, '0') + '_' + built.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    fs.writeFileSync(path.join(out, 'glb', slug + '.glb'), glb);
    if (savePng) fs.writeFileSync(path.join(out, 'glb', slug + '.png'), png);
    meta[String(dex)] = {
      slug, name: NAMES.get(dex) || built.name, eye: null, fx: [], aux: [],
      anims: built.clips.filter((c) => c.channels.length).map((c, i) => ({ i, name: c.name, frames: c.frames, loop: 0, aux: -1, from: c.source })),
    };
    const keys = built.clips.reduce((s, c) => s + c.channels.reduce((t, ch) => t + ch.times.length, 0), 0);
    rows.push({ dex, slug, bytes: glb.length, tris: built.mesh.tris.length, from: built.before.tris, verts: built.mesh.V.p.length, bones: built.nodes.length, bonesIn: built.bonesIn, clips: built.clips.length, keys });
  } catch (e) { failed.push(`${f}: ${e.message}`); }
}
fs.writeFileSync(metaPath, JSON.stringify(meta));

const stat = (k) => { const v = rows.map((r) => r[k]).sort((a, b) => a - b); return v.length ? `min ${v[0]}  median ${v[v.length >> 1]}  mean ${Math.round(v.reduce((a, b) => a + b, 0) / v.length)}  max ${v[v.length - 1]}` : '-'; };
console.log(`${rows.length} models written to ${path.resolve(out)}, ${failed.length} failed`);
for (const f of failed) console.log('  ' + f);
for (const k of ['bytes', 'tris', 'from', 'verts', 'bones', 'bonesIn', 'clips', 'keys']) console.log(k.padEnd(8), stat(k));
console.log('total', (rows.reduce((s, r) => s + r.bytes, 0) / 1048576).toFixed(1), 'MB');
if (rows.length <= 12) for (const r of rows) console.log(JSON.stringify(r));
