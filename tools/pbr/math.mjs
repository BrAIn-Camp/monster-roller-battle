// Small 4x4 matrix helpers. Matrices are 16 numbers in row-major order, acting on column vectors:
// mul(a, b) applies b first, then a.
export const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export function mul(a, b) {
  const o = new Array(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
  return o;
}
export const mulAll = (...ms) => ms.reduce(mul);
export const translate = ([x, y, z]) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
export const scale = ([x, y, z]) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
// Euler angles in radians, X applied first: R = Rz * Ry * Rx.
export function euler([x, y, z]) {
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  return [
    cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx, 0,
    sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx, 0,
    -sy, cy * sx, cy * cx, 0,
    0, 0, 0, 1,
  ];
}
export const from3x4 = (m) => [...m, 0, 0, 0, 1];
export function point(m, [x, y, z]) { return [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]]; }
export function dir(m, [x, y, z]) { return [m[0] * x + m[1] * y + m[2] * z, m[4] * x + m[5] * y + m[6] * z, m[8] * x + m[9] * y + m[10] * z]; }
// Inverse of an affine matrix (last row 0 0 0 1).
export function invert(m) {
  const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
  const A = e * i - f * h, B = f * g - d * i, C = d * h - e * g, det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-20) return ident();
  const k = 1 / det;
  const r = [A * k, (c * h - b * i) * k, (b * f - c * e) * k, B * k, (a * i - c * g) * k, (c * d - a * f) * k, C * k, (b * g - a * h) * k, (a * e - b * d) * k];
  const x = m[3], y = m[7], z = m[11];
  return [r[0], r[1], r[2], -(r[0] * x + r[1] * y + r[2] * z), r[3], r[4], r[5], -(r[3] * x + r[4] * y + r[5] * z), r[6], r[7], r[8], -(r[6] * x + r[7] * y + r[8] * z), 0, 0, 0, 1];
}
// Splits an affine matrix into translation, rotation (unit quaternion x y z w) and scale. Shear is dropped.
export function decompose(m) {
  let sx = Math.hypot(m[0], m[4], m[8]), sy = Math.hypot(m[1], m[5], m[9]), sz = Math.hypot(m[2], m[6], m[10]);
  const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[1] * (m[4] * m[10] - m[6] * m[8]) + m[2] * (m[4] * m[9] - m[5] * m[8]);
  if (det < 0) sx = -sx;
  const ix = sx ? 1 / sx : 0, iy = sy ? 1 / sy : 0, iz = sz ? 1 / sz : 0;
  const r00 = m[0] * ix, r01 = m[1] * iy, r02 = m[2] * iz, r10 = m[4] * ix, r11 = m[5] * iy, r12 = m[6] * iz, r20 = m[8] * ix, r21 = m[9] * iy, r22 = m[10] * iz;
  let q;
  const tr = r00 + r11 + r22;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [(r21 - r12) / s, (r02 - r20) / s, (r10 - r01) / s, s / 4]; }
  else if (r00 > r11 && r00 > r22) { const s = Math.sqrt(1 + r00 - r11 - r22) * 2; q = [s / 4, (r01 + r10) / s, (r02 + r20) / s, (r21 - r12) / s]; }
  else if (r11 > r22) { const s = Math.sqrt(1 + r11 - r00 - r22) * 2; q = [(r01 + r10) / s, s / 4, (r12 + r21) / s, (r02 - r20) / s]; }
  else { const s = Math.sqrt(1 + r22 - r00 - r11) * 2; q = [(r02 + r20) / s, (r12 + r21) / s, s / 4, (r10 - r01) / s]; }
  const n = Math.hypot(...q) || 1;
  return { t: [m[3], m[7], m[11]], q: q.map((v) => v / n), s: [sx, sy, sz] };
}
