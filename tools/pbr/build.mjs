// Turns a parsed model into what the game wants: one mesh on one small texture, the bones that move it, and a
// handful of clips with as few keys as will do. Budgets are in `opts`:
//   atlas      side of the one texture, in pixels (the Stadium models' textures come to about this once packed)
//   triangles  most triangles to keep (the Stadium models have 650-810)
//   fps        rate the game's curves are sampled at before keys that add nothing are dropped
import { BONE } from './sdr.mjs';
import { decodeTexture } from './tex.mjs';
import { worldMatrices, sampleTRS, localMatrix } from './pose.mjs';
import { decompose, from3x4, ident } from './math.mjs';
import { simplify } from './simplify.mjs';

export const DEFAULTS = { atlas: 128, triangles: 800, fps: 30 };

// The game's clip names, and the names the files use for the same thing, most wanted first.
export const CLIPS = [
  ['idle', ['wait', 'wait_a', 'chijyo_wait', 'kuchu_wait', 'kutyu_wait', 'wait_b', 'wait_z']],
  ['attack', ['tackle', 'tackle_a', 'tackle_phy', 'punch', 'punch_a', 'punch_phy', 'kick', 'kick_a', 'hikkaku', 'binta', 'jumpAttack', 'kime_phy']],
  ['attack_2', ['kime', 'kime_a', 'kime_b', 'kime_c']],
  ['faint', ['down', 'kuchu_down']],
  ['flinch', ['damage', 'damege', 'damage_a']],
  ['run', ['run', 'run_a', 'ran', 'run_ground']],
];

const wrapCoord = (x, mode) => {                               // 0 clamp, 1 repeat, 2 mirror
  if (mode === 1) return x - Math.floor(x);
  if (mode === 2) { const t = x - 2 * Math.floor(x / 2); return t > 1 ? 2 - t : t; }
  return Math.min(1, Math.max(0, x));
};

export function build(model, raw, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const sk = model.skeletons[0];
  if (!sk) throw new Error('no skeleton');
  const bones = sk.bones;

  // ---------------------------------------------------------------- corners, one material at a time
  const mats = new Map();                                      // material index (-1: none) -> { tex, tris: [[corner x3]] }
  const idleAction = (() => { for (const n of CLIPS[0][1]) { const i = sk.actions.indexOf(n); if (i >= 0) return i; } return -1; })();
  for (const bone of bones) {
    if (!bone || bone.type !== BONE.SKIN || !bone.mesh) continue;
    const mesh = bone.mesh, rigid = new Map([[bone.index, 1]]);
    for (const part of mesh.parts) {
      const mi = part.material ? part.material.index : -1;
      if (!mats.has(mi)) mats.set(mi, { tex: part.material && part.material.texture, tris: [] });
      const tris = mats.get(mi).tris, c = part.corners;
      for (let i = 0; i < c.length; i += 3) {
        const tri = [];
        for (let k = 0; k < 3; k++) {
          const [pi, ni, ti] = c[i + k];
          tri.push({
            p: [mesh.pos[pi * 3], mesh.pos[pi * 3 + 1], mesh.pos[pi * 3 + 2]],
            n: [mesh.nrm[ni * 3], mesh.nrm[ni * 3 + 1], mesh.nrm[ni * 3 + 2]],
            uv: mesh.uv && ti >= 0 ? [mesh.uv[ti * 2], mesh.uv[ti * 2 + 1]] : [0, 0],
            w: (mesh.weights && mesh.weights[pi]) || rigid,
          });
        }
        tris.push(tri);
      }
    }
  }
  if (!mats.size) throw new Error('no mesh');

  // ---------------------------------------------------------------- the one texture
  // Each material's triangles are slid back by whole tiles so they sit near the origin, the part of the texture they
  // then cover is cut out (tiling and mirroring baked in), and the pieces are packed at one texel density.
  const area3 = (t) => { const [a, b, c] = t.map((x) => x.p), u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; return 0.5 * Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]); };
  const pieces = [];
  for (const [mi, m] of mats) {
    const tex = m.tex, img = tex ? decodeTexture(raw, tex) : null;
    let u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity, area = 0;
    for (const t of m.tris) {
      area += area3(t);
      if (!img) { for (const c of t) c.uv = [0.5, 0.5]; continue; }
      const shift = (k, mode) => {
        if (mode === 0) { for (const c of t) c.uv[k] = Math.min(1, Math.max(0, c.uv[k])); return; }
        const lo = Math.min(t[0].uv[k], t[1].uv[k], t[2].uv[k]), by = mode === 2 ? 2 * Math.floor(lo / 2) : Math.floor(lo);
        for (const c of t) c.uv[k] -= by;
      };
      for (const c of t) c.uv = c.uv.slice();
      shift(0, tex.wrapS); shift(1, tex.wrapT);
      for (const c of t) { u0 = Math.min(u0, c.uv[0]); u1 = Math.max(u1, c.uv[0]); v0 = Math.min(v0, c.uv[1]); v1 = Math.max(v1, c.uv[1]); }
    }
    if (!img) { pieces.push({ mi, m, img: null, u0: 0, v0: 0, u1: 1, v1: 1, sw: 1, sh: 1, area }); continue; }
    // a texture tiled many times over is cut down to a few tiles' worth: past that the bake is only noise
    u1 = Math.min(u1, u0 + 8); v1 = Math.min(v1, v0 + 8);
    if (u1 - u0 < 1e-6) u1 = u0 + 1e-6; if (v1 - v0 < 1e-6) v1 = v0 + 1e-6;
    pieces.push({ mi, m, img, tex, u0, v0, u1, v1, sw: Math.max(1, (u1 - u0) * tex.w), sh: Math.max(1, (v1 - v0) * tex.h), area });
  }
  const PAD = 1, W = opts.atlas, H = opts.atlas;
  const sizeAt = (d) => {
    for (const p of pieces) {
      const want = Math.max(4, d * d * p.area), aspect = p.sw / p.sh;
      p.rw = Math.max(1, Math.min(Math.ceil(p.sw), Math.round(Math.sqrt(want * aspect))));
      p.rh = Math.max(1, Math.min(Math.ceil(p.sh), Math.round(Math.sqrt(want / aspect))));
      if (!p.img) p.rw = p.rh = 1;
      p.rw = Math.min(p.rw, W - 2 * PAD); p.rh = Math.min(p.rh, H - 2 * PAD);
    }
  };
  const pack = () => {
    let x = 0, y = 0, shelf = 0;
    for (const p of pieces.slice().sort((a, b) => b.rh - a.rh || b.rw - a.rw)) {
      const w = p.rw + 2 * PAD, h = p.rh + 2 * PAD;
      if (x + w > W) { x = 0; y += shelf; shelf = 0; }
      if (y + h > H) return false;
      p.x = x + PAD; p.y = y + PAD; x += w; shelf = Math.max(shelf, h);
    }
    return true;
  };
  let lo = 0, hi = 4096;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; sizeAt(mid); if (pack()) lo = mid; else hi = mid; }
  sizeAt(lo);
  if (!pack()) throw new Error('texture pieces do not fit the atlas');
  const atlas = new Uint8Array(W * H * 4);
  let anyAlpha = false;
  for (const p of pieces) {
    const px = (x, y, c) => { const o = (y * W + x) * 4; atlas[o] = c[0]; atlas[o + 1] = c[1]; atlas[o + 2] = c[2]; atlas[o + 3] = c[3]; };
    const cell = new Array(p.rw * p.rh);
    for (let j = 0; j < p.rh; j++) for (let i = 0; i < p.rw; i++) {
      if (!p.img) { cell[j * p.rw + i] = [255, 255, 255, 255]; continue; }
      // average the source texels this pixel covers, weighting colour by alpha
      const N = Math.max(1, Math.min(8, Math.ceil(Math.max(p.sw / p.rw, p.sh / p.rh))));
      let r = 0, g = 0, bl = 0, a = 0;
      for (let sj = 0; sj < N; sj++) for (let si = 0; si < N; si++) {
        const u = p.u0 + (p.u1 - p.u0) * (i + (si + 0.5) / N) / p.rw, v = p.v0 + (p.v1 - p.v0) * (j + (sj + 0.5) / N) / p.rh;
        const tx = Math.min(p.tex.w - 1, Math.floor(wrapCoord(u, p.tex.wrapS) * p.tex.w)), ty = Math.min(p.tex.h - 1, Math.floor(wrapCoord(v, p.tex.wrapT) * p.tex.h));
        const o = (ty * p.tex.w + tx) * 4, al = p.img[o + 3];
        r += p.img[o] * al; g += p.img[o + 1] * al; bl += p.img[o + 2] * al; a += al;
      }
      const alpha = a / (N * N);
      cell[j * p.rw + i] = a > 0 ? [Math.round(r / a), Math.round(g / a), Math.round(bl / a), alpha >= 128 ? 255 : 0] : [0, 0, 0, 0];
      if (alpha < 128) anyAlpha = true;
    }
    for (let j = -PAD; j < p.rh + PAD; j++) for (let i = -PAD; i < p.rw + PAD; i++) px(p.x + i, p.y + j, cell[Math.min(p.rh - 1, Math.max(0, j)) * p.rw + Math.min(p.rw - 1, Math.max(0, i))]);
    for (const t of p.m.tris) for (const c of t) {
      const fu = Math.min(1, Math.max(0, (c.uv[0] - p.u0) / (p.u1 - p.u0))), fv = Math.min(1, Math.max(0, (c.uv[1] - p.v0) / (p.v1 - p.v0)));
      c.uv = [(p.x + fu * p.rw) / W, (p.y + fv * p.rh) / H];
    }
  }

  // ---------------------------------------------------------------- one indexed mesh
  const key = new Map(), V = { p: [], n: [], uv: [], w: [] }, tris = [];
  const q = (x, s) => Math.round(x * s);
  for (const p of pieces) for (const t of p.m.tris) {
    const idx = t.map((c) => {
      const k = `${q(c.p[0], 1e4)},${q(c.p[1], 1e4)},${q(c.p[2], 1e4)}|${q(c.n[0], 50)},${q(c.n[1], 50)},${q(c.n[2], 50)}|${q(c.uv[0], 4096)},${q(c.uv[1], 4096)}|${[...c.w].map(([b, x]) => b + ':' + q(x, 100)).join(',')}`;
      let i = key.get(k);
      if (i === undefined) { i = V.p.length; key.set(k, i); V.p.push(c.p); V.n.push(c.n); V.uv.push(c.uv); V.w.push(c.w); }
      return i;
    });
    if (idx[0] !== idx[1] && idx[1] !== idx[2] && idx[0] !== idx[2]) tris.push(idx);
  }
  // which way round the triangles go: the stored normals say which side is out
  let facing = 0;
  for (const [a, b, c] of tris) {
    const A = V.p[a], B = V.p[b], C = V.p[c], u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const fn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    for (const i of [a, b, c]) facing += fn[0] * V.n[i][0] + fn[1] * V.n[i][1] + fn[2] * V.n[i][2];
  }
  if (facing < 0) for (const t of tris) { const x = t[1]; t[1] = t[2]; t[2] = x; }
  const before = { tris: tris.length, verts: V.p.length };
  const mesh = tris.length > opts.triangles ? simplify(V, tris, opts.triangles) : { V, tris };

  // ---------------------------------------------------------------- the bones that matter
  // Those with a vertex on them, and everything above those. Effect locators, lights and the like are dropped.
  const keep = new Set();
  for (const w of mesh.V.w) for (const [b] of w) for (let i = b; i >= 0 && bones[i] && !keep.has(i); i = bones[i].parent) keep.add(i);
  const order = [];
  const visit = (i) => { order.push(i); bones.forEach((b, j) => { if (b && b.parent === i && keep.has(j)) visit(j); }); };
  bones.forEach((b, i) => { if (b && keep.has(i) && !(b.parent >= 0 && bones[b.parent])) visit(i); });
  const slot = new Map(order.map((b, i) => [b, i]));
  const restTRS = (i, action, t) => {
    const b = bones[i], x = sampleTRS(b, action, t), par = b.parent >= 0 && bones[b.parent] ? sampleTRS(bones[b.parent], action, t).s : null;
    return decompose(localMatrix(b, x.t, x.r, x.s, par));
  };
  const nodes = order.map((i) => ({ name: bones[i].name, parent: slot.has(bones[i].parent) ? slot.get(bones[i].parent) : -1, ...restTRS(i, idleAction, 0), ibm: bones[i].ibm ? from3x4(bones[i].ibm) : ident() }));

  // ---------------------------------------------------------------- clips
  let size = 0;
  { let lo3 = [Infinity, Infinity, Infinity], hi3 = [-Infinity, -Infinity, -Infinity]; for (const p of mesh.V.p) for (let k = 0; k < 3; k++) { lo3[k] = Math.min(lo3[k], p[k]); hi3[k] = Math.max(hi3[k], p[k]); } size = Math.max(hi3[0] - lo3[0], hi3[1] - lo3[1], hi3[2] - lo3[2]) || 1; }
  const clips = [];
  for (const [name, wanted] of CLIPS) {
    const src = wanted.find((n) => sk.actions.includes(n));
    if (!src) continue;
    const action = sk.actions.indexOf(src);
    // the length the file gives the action; failing that, as far as its curves run
    let dur = sk.actionInfo[action].duration;
    if (!(dur > 0 && dur < 60)) { dur = 0; for (const i of order) for (const c of bones[i].anim.get(action) || []) dur = Math.max(dur, c.keys[c.keys.length - 1].t); }
    if (!(dur > 0)) continue;
    dur = Math.min(dur, 12);
    const n = Math.max(2, Math.round(dur * opts.fps) + 1), times = Array.from({ length: n }, (_, k) => k * dur / (n - 1));
    const channels = [];
    order.forEach((bi, ni) => {
      if (!bones[bi].anim.has(action) && !(bones[bi].parent >= 0 && bones[bones[bi].parent]?.anim.has(action))) return;
      const frames = times.map((t) => restTRS(bi, action, t));
      for (let k = 1; k < n; k++) { const a = frames[k - 1].q, b = frames[k].q; if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] < 0) frames[k].q = b.map((x) => -x); }
      const rest = nodes[ni];
      for (const [path, get, tol, lerp] of [
        ['translation', (f) => f.t, size * 0.002, false], ['rotation', (f) => f.q, 0.004, true], ['scale', (f) => f.s, 0.004, false],
      ]) {
        const vals = frames.map(get), base = get(rest);
        if (vals.every((v) => v.every((x, k) => Math.abs(x - base[k]) <= tol * 0.5))) continue;
        const kept = reduce(times, vals, tol);
        channels.push({ node: ni, path, times: kept.map((k) => times[k]), values: kept.map((k) => vals[k]) });
      }
    });
    clips.push({ name, source: src, duration: dur, frames: n, channels });
  }

  return { name: sk.name, atlas: { rgba: atlas, w: W, h: H, alpha: anyAlpha }, mesh, nodes, joints: order.map((_, i) => i), jointOf: slot, clips, before, bonesIn: bones.filter(Boolean).length };
}

// Which samples to keep so that straight lines between them stay within `tol` of every sample left out.
function reduce(times, vals, tol) {
  const keep = new Uint8Array(times.length);
  keep[0] = keep[times.length - 1] = 1;
  const stack = [[0, times.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    let worst = 0, at = -1;
    for (let i = a + 1; i < b; i++) {
      const x = (times[i] - times[a]) / (times[b] - times[a]);
      let e = 0;
      for (let k = 0; k < vals[i].length; k++) e = Math.max(e, Math.abs(vals[a][k] + (vals[b][k] - vals[a][k]) * x - vals[i][k]));
      if (e > worst) { worst = e; at = i; }
    }
    if (worst > tol) { keep[at] = 1; stack.push([a, at], [at, b]); }
  }
  const out = []; keep.forEach((k, i) => { if (k) out.push(i); });
  return out;
}
