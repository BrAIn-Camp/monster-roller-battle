// Reads a Battle Revolution model file (.sdr, big-endian) into plain data: textures, materials, skeletons with
// their bones, meshes, skin weights and animation curves. Nothing here is game data; it only describes the layout.
// The layout follows the community's notes on the format (github.com/bgsamm/pbr-models-import-export); this is an
// independent reader written from those notes and checked against the files themselves.

export const BONE = { NULL: 0, JOINT: 2, SKIN: 3, LIGHT: 5, VOLUME: 6, PARTICLE: 7 };
const VA_POS = 0x09, VA_NRM = 0x0a, VA_TEX0 = 0x0d, VA_NBT = 0x19;

export function parseSdr(b, stats = null) {
  const u8 = (o) => b[o], u16 = (o) => b.readUInt16BE(o), u32 = (o) => b.readUInt32BE(o), f32 = (o) => b.readFloatBE(o);
  const ok = (p) => p > 0 && p < b.length;
  const str = (o) => { if (!ok(o)) return ''; let e = o; while (e < b.length && b[e]) e++; return b.toString('latin1', o, e); };
  const vec3 = (p, d) => (ok(p) ? [f32(p), f32(p + 4), f32(p + 8)] : d);
  const count = (k, v) => { if (stats) { const m = (stats[k] ||= new Map()); m.set(v, (m.get(v) || 0) + 1); } };

  // Three header values decide how the pivot block of a non-joint node is laid out.
  const precomputedPivots = u8(0) < 1 || u16(2) < 3 || u8(4) === 0;

  // ---- textures
  const textures = [], texByAddr = new Map();
  for (let i = 0, list = u32(0x0c), n = u16(0x1a); i < n; i++) {
    const t = u32(list + i * 4);
    const tex = { addr: t, w: u16(t), h: u16(t + 2), enc: u32(t + 8), palEnc: u32(t + 0x0c), wrapS: u32(t + 0x10), wrapT: u32(t + 0x14), image: t + u32(t + 0x28), palette: u32(t + 0x48), size: u32(t + 0x4c) };
    textures.push(tex); texByAddr.set(t, tex);
    count('texEnc', tex.enc.toString(16)); count('wrap', tex.wrapS + '/' + tex.wrapT);
  }

  // ---- materials
  const materials = [], matByAddr = new Map();
  for (let i = 0, list = u32(0x14), n = u16(0x1e); i < n; i++) {
    const m = u32(list + i * 4);
    const mat = { addr: m, index: i, name: str(u32(m)), texture: texByAddr.get(u32(m + 0x18)) || null };
    materials.push(mat); matByAddr.set(m, mat);
  }

  // ---- meshes
  const meshByAddr = new Map();
  function parseMesh(addr) {
    if (meshByAddr.has(addr)) return meshByAddr.get(addr);
    const numVerts = u16(addr + 2), vertsAddr = u32(addr + 8), weightsAddr = u32(addr + 0x0c), uvLayer = u32(addr + 0x14);
    const parts = [];
    let vertStride = 0, texStride = 0;
    for (let p = u32(addr + 0x18); ok(p); p = u32(p + 0x1c)) {
      // Attribute records are 8 bytes: id, component count, component type (4 = float), fraction bits,
      // index type (2 = 8-bit, 3 = 16-bit), stride of the array, two bytes of padding. 0xff ends the table.
      const attrs = [];
      for (let a = u32(p + 0x10); ok(a) && u8(a) !== 0xff; a += 8) {
        const id = u8(a), wide = u8(a + 4) === 3;
        if (u8(a + 4) !== 3 && u8(a + 4) !== 2) throw new Error('vertex attribute that is not indexed');
        attrs.push({ id, wide });
        count('attr', [...b.subarray(a, a + 8)].map((x) => x.toString(16).padStart(2, '0')).join(''));
        if ((id === VA_POS || id === VA_TEX0) && u8(a + 2) !== 4) throw new Error('vertex data that is not float');
        if (id === VA_POS) vertStride = Math.max(vertStride, u8(a + 5));
        if (id === VA_TEX0) texStride = Math.max(texStride, u8(a + 5));
      }
      // The display list: `groups` runs of (opcode, vertex count, one 16-bit index per attribute per vertex).
      const corners = [];                                        // flat: position, normal, uv index per corner
      let q = u32(p + 0x14);
      for (let g = 0, groups = u16(p + 0x0c); g < groups; g++) {
        const op = u8(q), n = u16(q + 1); q += 3;
        count('opcode', op.toString(16));
        const vs = [];
        for (let i = 0; i < n; i++) {
          let pi = -1, ni = -1, ti = -1;
          for (const a of attrs) {
            const v = a.wide ? u16(q) : u8(q); q += a.wide ? 2 : 1;
            if (a.id === VA_POS) pi = v; else if (a.id === VA_NRM || a.id === VA_NBT) ni = v; else if (a.id === VA_TEX0) ti = v;
          }
          vs.push([pi, ni < 0 ? pi : ni, ti]);
        }
        const tri = (a, c, d) => { if (a[0] !== c[0] && a[0] !== d[0] && c[0] !== d[0]) corners.push(a, c, d); };
        if (op === 0x80) for (let i = 0; i + 3 < n; i += 4) { tri(vs[i + 1], vs[i], vs[i + 2]); tri(vs[i + 2], vs[i], vs[i + 3]); }
        else if (op === 0x90) for (let i = 0; i + 2 < n; i += 3) tri(vs[i + 1], vs[i], vs[i + 2]);
        else if (op === 0x98) for (let i = 0; i + 2 < n; i++) (i & 1 ? tri(vs[i], vs[i + 1], vs[i + 2]) : tri(vs[i + 1], vs[i], vs[i + 2]));
        else if (op === 0xa0) for (let i = 1; i + 1 < n; i++) tri(vs[i], vs[0], vs[i + 1]);
        else throw new Error('unknown display-list opcode 0x' + op.toString(16));
      }
      parts.push({ material: matByAddr.get(u32(p + 8)) || null, corners });
    }
    if (!vertStride) throw new Error('mesh without a position stride');
    const pos = new Float32Array(numVerts * 3), nrm = new Float32Array(numVerts * 3);
    for (let i = 0; i < numVerts; i++) {
      const o = vertsAddr + i * vertStride;
      pos[i * 3] = f32(o); pos[i * 3 + 1] = f32(o + 4); pos[i * 3 + 2] = f32(o + 8);
      if (vertStride >= 24) { nrm[i * 3] = f32(o + 12); nrm[i * 3 + 1] = f32(o + 16); nrm[i * 3 + 2] = f32(o + 20); }
    }
    let uv = null;
    if (ok(uvLayer) && texStride) {
      const base = u32(uvLayer), n = u16(uvLayer + 4);
      uv = new Float32Array(n * 2);
      for (let i = 0; i < n; i++) { uv[i * 2] = f32(base + i * texStride); uv[i * 2 + 1] = f32(base + i * texStride + 4); }
    }
    // Skin weights: runs of vertices on one bone, runs blended between two, then single-vertex overrides.
    let weights = null;
    if (ok(weightsAddr)) {
      weights = [];
      const w = weightsAddr;
      for (let i = 0, t = u32(w + 4), n = u16(w); i < n; i++) { const nv = u16(t + i * 4), bone = u16(t + i * 4 + 2); for (let k = 0; k < nv; k++) weights.push(new Map([[bone, 1]])); }
      for (let i = 0, t = u32(w + 0x0c), n = u16(w + 8), arr = u32(w + 0x10), c = 0; i < n; i++) {
        const nv = u16(t + i * 6), b1 = u16(t + i * 6 + 2), b2 = u16(t + i * 6 + 4);
        for (let k = 0; k < nv; k++, c++) { const x = u16(arr + c * 2) / 0xffff; weights.push(new Map(b1 === b2 ? [[b1, 1]] : [[b1, x], [b2, 1 - x]])); }
      }
      for (let i = 0, t = u32(w + 0x18), n = u16(w + 0x14); i < n; i++) {
        const o = t + i * 10, v = u16(o), b1 = u16(o + 2), b2 = u16(o + 4), w1 = u16(o + 6) / 0xffff, w2 = u16(o + 8) / 0xffff;
        const m = weights[v]; if (!m) continue;
        for (const [k, x] of m) m.set(k, x * (1 - w1 - w2));
        m.set(b1, w1); if (b2 !== 0xffff) m.set(b2, w2);
      }
      count('weightsCover', weights.length === numVerts ? 'exact' : weights.length > numVerts ? 'more' : 'fewer');
    }
    const mesh = { addr, numVerts, pos, nrm, uv, weights, parts };
    meshByAddr.set(addr, mesh);
    return mesh;
  }

  // ---- animation curves hanging off a bone: a chain of (action, curves) nodes
  function parseAnim(addr) {
    const byAction = new Map();
    for (let n = addr, guard = 0; ok(n) && guard < 4096; n = u32(n + 0x0c), guard++) {
      const curves = [];
      for (let i = 0, list = u32(n + 4), nc = u16(n + 2); i < nc; i++) {
        const c = list + i * 0x10, comp = u8(c + 1), axis = u8(c + 2), dtype = u8(c + 6), exp = u8(c + 7), k = u32(c + 8);
        count('curve', `comp${comp} axis${axis} type${dtype}`);
        if (comp > 2 || axis < 1 || axis > 3 || !ok(k)) continue;
        const size = { 0: 4, 5: 1, 6: 1, 7: 2, 8: 2 }[dtype];
        if (!size) { count('skippedType', dtype); continue; }
        const vals = u32(k), derivs = u32(k + 4), nVals = u16(k + 8), keysAddr = u32(k + 0x10), nKeys = u16(k + 0x14), fps = u8(k + 0x17);
        const scale = dtype === 0 ? 1 : 1 / 2 ** exp;
        const val = (i2) => { const o = vals + i2 * size; return (dtype === 0 ? f32(o) : dtype === 5 ? u8(o) : dtype === 6 ? b.readInt8(o) : dtype === 7 ? u16(o) : b.readInt16BE(o)) * scale; };
        const keys = [];
        if (nKeys) for (let j = 0; j < nKeys; j++) {
          const o = keysAddr + j * 0x0c, interp = u16(o);
          count('interp', interp);
          keys.push({ interp, v: val(u16(o + 2)), dl: ok(derivs) ? f32(derivs + u16(o + 4) * 4) : 0, dr: ok(derivs) ? f32(derivs + u16(o + 6) * 4) : 0, t: f32(o + 8) });
        } else if (nVals && fps) { count('baked', fps); for (let j = 0; j < nVals; j++) keys.push({ interp: 1, v: val(j), dl: 0, dr: 0, t: j / fps }); }
        if (keys.length) curves.push({ comp, axis: axis - 1, keys });
      }
      byAction.set(u16(n), curves);
    }
    return byAction;
  }

  // ---- skeletons
  const skeletons = [];
  for (let s = 0, list = u32(0x08), n = u16(0x18); s < n; s++) {
    const h = u32(list + s * 4);
    // An action record: name, then where its held loop starts and ends, then how long it is, in seconds.
    // (A curve can run on far past its action's length: an idle's occasional fidget has a period of its own.)
    const actions = [], actionInfo = [];
    for (let i = 0, t = u32(h + 0x0c), na = u16(h + 8); i < na; i++) {
      const a = t + i * 0x30;
      actions.push(str(u32(a)));
      actionInfo.push({ loopStart: f32(a + 4), loopEnd: f32(a + 8), duration: f32(a + 0x0c) });
    }
    const bones = new Array(u16(h + 6)).fill(null);
    const walk = (addr, parent, depth) => {
      for (let guard = 0; ok(addr) && guard < 4096 && depth < 256; addr = u32(addr + 0x28), guard++) {
        const type = u32(addr), index = u16(addr + 8);
        count('boneType', type);
        const bone = {
          addr, type, index, parent, name: str(u32(addr + 4)), flags: u16(addr + 0x0a),
          t: vec3(u32(addr + 0x0c), [0, 0, 0]), r: vec3(u32(addr + 0x10), [0, 0, 0]), s: vec3(u32(addr + 0x14), [1, 1, 1]),
          pivots: null, jointFlags: 0, orient: [0, 0, 0], ibm: null, mesh: null,
          anim: parseAnim(u32(addr + 0x20)),
        };
        if (type === BONE.JOINT) {
          bone.jointFlags = u32(addr + 0x30);
          bone.orient = [f32(addr + 0x34), f32(addr + 0x38), f32(addr + 0x3c)];
          bone.ibm = []; for (let i = 0; i < 12; i++) bone.ibm.push(f32(addr + 0x44 + i * 4));    // 3 rows of 4
        } else {
          const p = u32(addr + 0x18);
          if (ok(p)) bone.pivots = { sp: vec3(p), spt: vec3(p + 12), rp: vec3(p + 24), rpt: precomputedPivots ? null : vec3(p + 36) };
          if (type === BONE.SKIN) { const m = u32(addr + 0x30); if (ok(m) && ok(u32(m + 0x18))) bone.mesh = parseMesh(m); }
        }
        if (index < bones.length && !bones[index]) bones[index] = bone; else count('boneIndexClash', 1);
        walk(u32(addr + 0x24), index, depth + 1);
      }
    };
    walk(u32(h + 0x10), -1, 0);
    skeletons.push({ name: str(u32(h)), actions, actionInfo, bones });
  }
  return { precomputedPivots, textures, materials, skeletons };
}
