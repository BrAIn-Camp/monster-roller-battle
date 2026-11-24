// Turns a bone's translation, rotation and scale into its local matrix, and evaluates animation curves.
import { BONE } from './sdr.mjs';
import { mulAll, translate, scale, euler, ident, mul } from './math.mjs';

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], neg = (a) => [-a[0], -a[1], -a[2]];

// A joint is T * (1/parent scale, when it does not inherit it) * orient * R * S.
// Any other node carries Maya-style pivots: T * T3 * R * T2 * S * T1.
export function localMatrix(bone, t, r, s, parentScale) {
  if (bone.type === BONE.JOINT) {
    const comp = parentScale && (bone.flags >> 3 & 1) && (bone.jointFlags & 8);
    const m = mulAll(euler(bone.orient), euler(r), scale(s));
    return mul(translate(t), comp ? mul(scale(parentScale.map((v) => (v ? 1 / v : 1))), m) : m);
  }
  const p = bone.pivots;
  if (!p) return mulAll(translate(t), euler(r), scale(s));
  const [t1, t2, t3] = p.rpt ? [neg(p.sp), sub(add(p.sp, p.spt), p.rp), add(p.rp, p.rpt)] : [p.sp, p.spt, p.rp];
  return mulAll(translate(t), translate(t3), euler(r), translate(t2), scale(s), translate(t1));
}

// The value of one curve at time t. Keys are constant, linear or cubic with a slope either side.
export function evalCurve(keys, t) {
  const n = keys.length;
  if (t <= keys[0].t) return keys[0].v;
  if (t >= keys[n - 1].t) return keys[n - 1].v;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (keys[mid].t <= t) lo = mid; else hi = mid; }
  const a = keys[lo], b = keys[hi], d = b.t - a.t;
  if (d <= 0 || a.interp === 0) return a.v;
  const x = (t - a.t) / d;
  if (a.interp === 1) return a.v + (b.v - a.v) * x;
  // The stored slopes are already per segment (measured over the whole set: stored / (slope per second * gap) has
  // a median of 0.997), so they are the Hermite tangents as they stand.
  const m0 = a.dr, m1 = b.dl, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * a.v + (x3 - 2 * x2 + x) * m0 + (-2 * x3 + 3 * x2) * b.v + (x3 - x2) * m1;
}

// Every bone's local translation, rotation (Euler) and scale at time t of an action; rest values where no curve.
export function sampleTRS(bone, action, t) {
  const tr = bone.t.slice(), r = bone.r.slice(), s = bone.s.slice();
  const curves = action >= 0 ? bone.anim.get(action) : null;
  if (curves) {
    const set = [tr, r, s];
    for (const c of curves) set[c.comp][c.axis] = evalCurve(c.keys, t);
  }
  return { t: tr, r, s };
}

// World matrices of every bone at time t of an action (action -1: the default pose).
export function worldMatrices(bones, action = -1, t = 0) {
  const world = new Array(bones.length).fill(null), trs = new Array(bones.length).fill(null);
  const visit = (i) => {
    if (world[i]) return world[i];
    const b = bones[i];
    if (!b) return (world[i] = ident());
    const x = (trs[i] = sampleTRS(b, action, t));
    const hasParent = b.parent >= 0 && bones[b.parent];
    const pw = hasParent ? visit(b.parent) : ident();
    return (world[i] = mul(pw, localMatrix(b, x.t, x.r, x.s, hasParent ? trs[b.parent].s : null)));
  };
  for (let i = 0; i < bones.length; i++) visit(i);
  return world;
}
