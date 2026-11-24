// Writes what build.mjs made as a binary glTF: one skinned mesh named "body", its bones, one texture, its clips.
import { encodePng } from './tex.mjs';

const FLOAT = 5126, USHORT = 5123, UBYTE = 5121;

export function writeGlb(built) {
  const { mesh, nodes, clips, atlas } = built;
  const chunks = [], views = [], accessors = [];
  let offset = 0;
  const view = (buf, target) => {
    const pad = (4 - (buf.length % 4)) % 4;
    views.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target ? { target } : {}) });
    chunks.push(buf); if (pad) chunks.push(Buffer.alloc(pad));
    offset += buf.length + pad;
    return views.length - 1;
  };
  const acc = (typed, componentType, type, extra = {}, target) => {
    const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[type];
    accessors.push({ bufferView: view(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength), target), componentType, count: typed.length / n, type, ...extra });
    return accessors.length - 1;
  };
  const flat = (rows, n) => { const a = new Float32Array(rows.length * n); rows.forEach((r, i) => { for (let k = 0; k < n; k++) a[i * n + k] = r[k]; }); return a; };

  const V = mesh.V, nv = V.p.length;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const p of V.p) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); }
  const normals = V.n.map((n) => { const l = Math.hypot(...n) || 1; return [n[0] / l, n[1] / l, n[2] / l]; });
  // up to four bones a vertex, weights as bytes that add up to 255
  const wide = nodes.length > 255;
  const J = wide ? new Uint16Array(nv * 4) : new Uint8Array(nv * 4), Wt = new Uint8Array(nv * 4);
  V.w.forEach((w, i) => {
    const top = [...w].map(([b, x]) => [built.jointOf.get(b), x]).filter(([j, x]) => j !== undefined && x > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const sum = top.reduce((s, [, x]) => s + x, 0) || 1;
    let left = 255;
    top.forEach(([j, x], k) => { const q = k === top.length - 1 ? left : Math.min(left, Math.round(x / sum * 255)); J[i * 4 + k] = j; Wt[i * 4 + k] = q; left -= q; });
    if (!top.length) Wt[i * 4] = 255;
  });
  const idx = new Uint16Array(mesh.tris.length * 3);
  mesh.tris.forEach((t, i) => idx.set(t, i * 3));

  const prim = {
    attributes: {
      POSITION: acc(flat(V.p, 3), FLOAT, 'VEC3', { min: lo, max: hi }, 34962),
      NORMAL: acc(flat(normals, 3), FLOAT, 'VEC3', {}, 34962),
      TEXCOORD_0: acc(flat(V.uv, 2), FLOAT, 'VEC2', {}, 34962),
      JOINTS_0: acc(J, wide ? USHORT : UBYTE, 'VEC4', {}, 34962),
      WEIGHTS_0: acc(Wt, UBYTE, 'VEC4', { normalized: true }, 34962),
    },
    indices: acc(idx, USHORT, 'SCALAR', {}, 34963),
    material: 0,
  };
  // inverse bind matrices, column-major as glTF wants them
  const ibm = new Float32Array(nodes.length * 16);
  nodes.forEach((n, i) => { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) ibm[i * 16 + c * 4 + r] = n.ibm[r * 4 + c]; });
  const skin = { joints: nodes.map((_, i) => i), inverseBindMatrices: acc(ibm, FLOAT, 'MAT4') };

  const round = (v) => v.map((x) => +x.toFixed(6));
  const gnodes = nodes.map((n, i) => {
    const kids = nodes.map((m, j) => (m.parent === i ? j : -1)).filter((j) => j >= 0);
    return { name: n.name === 'body' ? 'body_bone' : n.name, translation: round(n.t), rotation: round(n.q), scale: round(n.s), ...(kids.length ? { children: kids } : {}) };
  });
  const bodyNode = gnodes.length;
  gnodes.push({ name: 'body', mesh: 0, skin: 0 });
  const roots = nodes.map((n, i) => (n.parent < 0 ? i : -1)).filter((i) => i >= 0);

  // All the keys go in one stretch of the file, and channels with the same key times share them: a buffer view and
  // a pair of accessors apiece cost more in the file's JSON than the keys themselves did.
  const animFloats = [], pending = [];
  const later = (values, type, extra = {}) => {
    const n = { SCALAR: 1, VEC3: 3, VEC4: 4 }[type];
    accessors.push({ bufferView: -1, byteOffset: animFloats.length * 4, componentType: FLOAT, count: values.length / n, type, ...extra });
    pending.push(accessors.length - 1);
    for (const v of values) animFloats.push(v);
    return accessors.length - 1;
  };
  const animations = clips.map((c) => {
    const samplers = [], channels = [], timesSeen = new Map();
    for (const ch of c.channels) {
      const n = ch.path === 'rotation' ? 4 : 3, tk = ch.times.map((t) => t.toFixed(5)).join(',');
      if (!timesSeen.has(tk)) timesSeen.set(tk, later(ch.times, 'SCALAR', { min: [Math.fround(ch.times[0])], max: [Math.fround(ch.times[ch.times.length - 1])] }));
      const output = later(ch.values.flat(), n === 4 ? 'VEC4' : 'VEC3');
      channels.push({ sampler: samplers.length, target: { node: ch.node, path: ch.path } });
      samplers.push({ input: timesSeen.get(tk), output });
    }
    return { name: c.name, samplers, channels };
  }).filter((a) => a.channels.length);
  if (pending.length) { const bv = view(Buffer.from(new Float32Array(animFloats).buffer)); for (const i of pending) accessors[i].bufferView = bv; }

  const png = encodePng(atlas.rgba, atlas.w, atlas.h);
  const image = view(png);
  const json = {
    asset: { version: '2.0', generator: 'tools/pbr' },
    scene: 0, scenes: [{ nodes: [...roots, bodyNode] }],
    nodes: gnodes, meshes: [{ name: 'body', primitives: [prim] }], skins: [skin],
    materials: [{ name: 'skin', pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 1 }, alphaMode: 'MASK', alphaCutoff: 0.5 }],
    textures: [{ source: 0, sampler: 0 }], images: [{ bufferView: image, mimeType: 'image/png' }],
    samplers: [{ magFilter: 9728, minFilter: 9729, wrapS: 33071, wrapT: 33071 }],
    ...(animations.length ? { animations } : {}),
    accessors, bufferViews: views, buffers: [{ byteLength: offset }],
  };
  let js = Buffer.from(JSON.stringify(json), 'utf8');
  if (js.length % 4) js = Buffer.concat([js, Buffer.alloc(4 - (js.length % 4), 0x20)]);
  const bin = Buffer.concat(chunks);
  const head = Buffer.alloc(12 + 8), binHead = Buffer.alloc(8);
  head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  head.writeUInt32LE(js.length, 12); head.writeUInt32LE(0x4e4f534a, 16);
  binHead.writeUInt32LE(bin.length, 0); binHead.writeUInt32LE(0x004e4942, 4);
  return { glb: Buffer.concat([head, js, binHead, bin]), png };
}
