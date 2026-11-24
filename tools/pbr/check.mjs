// Reads back the .glb files convert.mjs wrote and plays every clip through, the way the game's skinning would,
// looking for the signs of a wrong conversion: a mesh that flies apart, bones that are not numbers, a clip that
// does not come back to where it started.
//   node tools/pbr/check.mjs <output folder> [--list]
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2], list = process.argv.includes('--list');
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
const mulCM = (a, b) => { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; };
const compose = (t, q, s) => {
  const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  return [(1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0, (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0, (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0, t[0], t[1], t[2], 1];
};
const rows = [], bad = [];
for (const [dex, e] of Object.entries(meta)) {
  const b = fs.readFileSync(path.join(dir, 'glb', e.slug + '.glb'));
  const jl = b.readUInt32LE(12), j = JSON.parse(b.toString('utf8', 20, 20 + jl)), bin = b.subarray(20 + jl + 8);
  const read = (ai) => {
    const a = j.accessors[ai], v = j.bufferViews[a.bufferView], n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[a.type], o = (v.byteOffset || 0) + (a.byteOffset || 0), out = [];
    for (let i = 0; i < a.count * n; i++) out.push(a.componentType === 5126 ? bin.readFloatLE(o + i * 4) : a.componentType === 5123 ? bin.readUInt16LE(o + i * 2) : bin[o + i]);
    return { data: out, n, count: a.count };
  };
  const prim = j.meshes[0].primitives[0], P = read(prim.attributes.POSITION), J = read(prim.attributes.JOINTS_0), W = read(prim.attributes.WEIGHTS_0), ibm = read(j.skins[0].inverseBindMatrices).data;
  const joints = j.skins[0].joints, parent = new Map();
  j.nodes.forEach((n, i) => (n.children || []).forEach((c) => parent.set(c, i)));
  const box = (trs) => {
    const world = new Map();
    const get = (i) => { if (!world.has(i)) { const n = trs[i], l = compose(n.t, n.q, n.s); world.set(i, parent.has(i) ? mulCM(get(parent.get(i)), l) : l); } return world.get(i); };
    const skin = joints.map((nj, k) => mulCM(get(nj), ibm.slice(k * 16, k * 16 + 16)));
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let v = 0; v < P.count; v++) {
      const p = [P.data[v * 3], P.data[v * 3 + 1], P.data[v * 3 + 2]], o = [0, 0, 0];
      for (let k = 0; k < 4; k++) { const w = W.data[v * 4 + k] / 255; if (!w) continue; const m = skin[J.data[v * 4 + k]]; for (let r = 0; r < 3; r++) o[r] += w * (m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r]); }
      for (let r = 0; r < 3; r++) { lo[r] = Math.min(lo[r], o[r]); hi[r] = Math.max(hi[r], o[r]); }
    }
    return { lo, hi, size: Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) };
  };
  const rest = j.nodes.map((n) => ({ t: n.translation || [0, 0, 0], q: n.rotation || [0, 0, 0, 1], s: n.scale || [1, 1, 1] }));
  const bind = Math.max(...[0, 1, 2].map((k) => j.accessors[prim.attributes.POSITION].max[k] - j.accessors[prim.attributes.POSITION].min[k]));
  const r0 = box(rest);
  const row = { dex: +dex, slug: e.slug, tris: j.accessors[prim.indices].count / 3, bones: joints.length, bytes: b.length, rest: r0.size / bind, clips: {} };
  for (const a of j.animations || []) {
    const ch = a.channels.map((c) => { const s = a.samplers[c.sampler]; return { node: c.target.node, path: c.target.path, t: read(s.input).data, v: read(s.output) }; });
    const dur = Math.max(...ch.map((c) => c.t[c.t.length - 1]));
    let worst = 0, nan = false, first = null, last = null;
    for (let f = 0; f <= 8; f++) {
      const time = dur * f / 8, trs = rest.map((x) => ({ t: x.t.slice(), q: x.q.slice(), s: x.s.slice() }));
      for (const c of ch) {
        let i = 0; while (i + 1 < c.t.length && c.t[i + 1] <= time) i++;
        const k = Math.min(i + 1, c.t.length - 1), x = k === i ? 0 : (time - c.t[i]) / (c.t[k] - c.t[i]), n = c.v.n;
        let val = []; for (let d = 0; d < n; d++) val.push(c.v.data[i * n + d] + (c.v.data[k * n + d] - c.v.data[i * n + d]) * x);
        if (n === 4) { const l = Math.hypot(...val) || 1; val = val.map((q) => q / l); }
        if (val.some((q) => !Number.isFinite(q))) nan = true;
        trs[c.node][c.path === 'translation' ? 't' : c.path === 'rotation' ? 'q' : 's'] = val;
      }
      const bx = box(trs);
      worst = Math.max(worst, bx.size / bind);
      if (f === 0) first = bx; if (f === 8) last = bx;
    }
    const drift = Math.max(...[0, 1, 2].map((k) => Math.abs(first.lo[k] - last.lo[k]) + Math.abs(first.hi[k] - last.hi[k]))) / bind;
    row.clips[a.name] = { dur: +dur.toFixed(2), stretch: +worst.toFixed(2), drift: +drift.toFixed(3) };
    if (nan || !(worst < 3.5)) bad.push(`${e.slug} ${a.name}: stretches to ${worst.toFixed(1)}x${nan ? ', not a number' : ''}`);
    if (a.name === 'idle' && drift > 0.08) bad.push(`${e.slug} idle does not loop (ends ${drift.toFixed(2)} of its size away from its start)`);
  }
  if (!(r0.size / bind < 2.5 && r0.size / bind > 0.4)) bad.push(`${e.slug}: resting pose is ${(r0.size / bind).toFixed(2)}x its bind size`);
  if (!row.clips.idle) bad.push(`${e.slug}: no idle clip`);
  rows.push(row);
}
const stat = (f) => { const v = rows.map(f).filter((x) => x != null).sort((a, b) => a - b); return v.length ? `min ${v[0]}  median ${v[v.length >> 1]}  max ${v[v.length - 1]}` : '-'; };
console.log(rows.length, 'models checked;', bad.length, 'findings');
console.log('triangles', stat((r) => r.tris)); console.log('bones    ', stat((r) => r.bones)); console.log('bytes    ', stat((r) => r.bytes));
console.log('total', (rows.reduce((s, r) => s + r.bytes, 0) / 1048576).toFixed(1), 'MB');
for (const n of ['idle', 'attack', 'attack_2', 'faint', 'flinch', 'run']) console.log(n.padEnd(9), 'in', rows.filter((r) => r.clips[n]).length, '| seconds', stat((r) => r.clips[n]?.dur), '| stretch', stat((r) => r.clips[n]?.stretch));
for (const x of bad.slice(0, list ? 500 : 30)) console.log('  ' + x);
if (list) for (const r of rows) console.log(JSON.stringify(r));
