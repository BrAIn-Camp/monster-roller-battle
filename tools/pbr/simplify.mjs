// Brings a mesh down to a triangle budget by collapsing edges, cheapest first (quadric error).
// A vertex is only ever moved onto a neighbour, never to a new place, so texture coordinates and skin weights stay
// exact. Vertices that share a position but differ in texture coordinate (a seam) collapse together along the seam;
// open edges collapse only along the edge; anything more tangled than that is left alone.
//   V    { p, n, uv, w }  arrays, one entry per vertex
//   tris [[a, b, c], ...]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function addPlane(q, n, d, w) {                                 // q: a2 ab ac ad b2 bc bd c2 cd d2
  const [a, b, c] = n;
  q[0] += w * a * a; q[1] += w * a * b; q[2] += w * a * c; q[3] += w * a * d; q[4] += w * b * b; q[5] += w * b * c; q[6] += w * b * d; q[7] += w * c * c; q[8] += w * c * d; q[9] += w * d * d;
}
const errAt = (q, [x, y, z]) => q[0] * x * x + 2 * q[1] * x * y + 2 * q[2] * x * z + 2 * q[3] * x + q[4] * y * y + 2 * q[5] * y * z + 2 * q[6] * y + q[7] * z * z + 2 * q[8] * z + q[9];

class Heap {
  constructor() { this.a = []; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0; for (;;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return top;
  }
  get size() { return this.a.length; }
}

export function simplify(V, trisIn, target) {
  const tris = trisIn.map((t) => t.slice()), alive = new Uint8Array(tris.length).fill(1);
  let live = tris.length;
  // vertices at one position form a group; all the topology below is between groups
  const gid = new Map(), G = new Int32Array(V.p.length), gp = [];
  V.p.forEach((p, i) => { const k = p.map((x) => Math.round(x * 1e4)).join(','); if (!gid.has(k)) { gid.set(k, gp.length); gp.push(p); } G[i] = gid.get(k); });
  const ng = gp.length, gt = Array.from({ length: ng }, () => new Set()), Q = Array.from({ length: ng }, () => new Float64Array(10)), stamp = new Int32Array(ng);
  tris.forEach((t, i) => { for (const v of t) gt[G[v]].add(i); });
  const normalOf = (a, b, c) => cross(sub(b, a), sub(c, a));
  let scale = 0;
  tris.forEach((t) => {
    const [a, b, c] = t.map((v) => V.p[v]), n = normalOf(a, b, c), len = Math.hypot(...n);
    if (!len) return;
    const u = n.map((x) => x / len);
    for (const v of t) addPlane(Q[G[v]], u, -dot(u, a), len / 2);
    scale += len / 2;
  });
  const shared = (g, h) => { const out = []; for (const t of gt[g]) if (alive[t] && gt[h].has(t)) out.push(t); return out; };
  const neighbours = (g) => { const s = new Set(); for (const t of gt[g]) if (alive[t]) for (const v of tris[t]) if (G[v] !== g) s.add(G[v]); return s; };
  // open edges and seams are fenced with a plane standing on the edge, so the outline and the seam hold their shape
  for (let g = 0; g < ng; g++) for (const h of neighbours(g)) {
    if (h < g) continue;
    const sh = shared(g, h);
    const seam = sh.length === 2 && (tris[sh[0]].find((v) => G[v] === g) !== tris[sh[1]].find((v) => G[v] === g) || tris[sh[0]].find((v) => G[v] === h) !== tris[sh[1]].find((v) => G[v] === h));
    if (sh.length !== 1 && !seam) continue;
    for (const t of sh) {
      const [a, b, c] = tris[t].map((v) => V.p[v]), fn = normalOf(a, b, c), e = sub(gp[h], gp[g]), n = cross(e, fn), len = Math.hypot(...n);
      if (!len) continue;
      const u = n.map((x) => x / len), w = dot(e, e) * (sh.length === 1 ? 8 : 2);
      addPlane(Q[g], u, -dot(u, gp[g]), w); addPlane(Q[h], u, -dot(u, gp[g]), w);
    }
  }
  const skinGap = (a, b) => { let d = 0; const keys = new Set([...V.w[a].keys(), ...V.w[b].keys()]); for (const k of keys) d += Math.abs((V.w[a].get(k) || 0) - (V.w[b].get(k) || 0)); return d / 2; };

  // What collapsing group g onto group h would cost, and which vertex of h each vertex of g becomes. Null if not allowed.
  function plan(g, h) {
    const sh = shared(g, h);
    if (!sh.length) return null;
    const wedges = new Set(); for (const t of gt[g]) if (alive[t]) for (const v of tris[t]) if (G[v] === g) wedges.add(v);
    let open = false; for (const x of neighbours(g)) if (shared(g, x).length === 1) { open = true; break; }
    const at = (t, grp) => tris[t].find((v) => G[v] === grp);
    const map = new Map();
    if (wedges.size === 1) {
      if (sh.length !== (open ? 1 : 2)) return null;
      const to = at(sh[0], h);
      if (sh.some((t) => at(t, h) !== to)) return null;
      map.set([...wedges][0], to);
    } else if (wedges.size === 2 && !open) {
      if (sh.length !== 2 || at(sh[0], g) === at(sh[1], g)) return null;
      map.set(at(sh[0], g), at(sh[0], h)); map.set(at(sh[1], g), at(sh[1], h));
    } else return null;
    // no triangle that survives may turn over or go flat
    for (const t of gt[g]) {
      if (!alive[t] || gt[h].has(t)) continue;
      const before = tris[t].map((v) => V.p[v]), after = tris[t].map((v) => (G[v] === g ? gp[h] : V.p[v]));
      const n0 = normalOf(...before), n1 = normalOf(...after), l0 = Math.hypot(...n0), l1 = Math.hypot(...n1);
      if (l1 < 1e-12 || dot(n0, n1) < 0.25 * l0 * l1) return null;
    }
    let gap = 0; for (const [a, b] of map) gap = Math.max(gap, skinGap(a, b));
    const e = sub(gp[h], gp[g]);
    const cost = (errAt(Q[g], gp[h]) + errAt(Q[h], gp[h]) + 1e-6 * scale * dot(e, e)) * (1 + 4 * gap);
    return { cost: Math.max(0, cost), map };
  }
  const heap = new Heap();
  const offer = (g, h) => { const p = plan(g, h); if (p) heap.push([p.cost, g, h, stamp[g], stamp[h]]); };
  for (let g = 0; g < ng; g++) for (const h of neighbours(g)) offer(g, h);

  while (live > target && heap.size) {
    const [, g, h, sg, sh2] = heap.pop();
    if (stamp[g] !== sg || stamp[h] !== sh2) continue;
    const p = plan(g, h);
    if (!p) continue;
    for (const t of [...gt[g]]) {
      if (!alive[t]) continue;
      if (gt[h].has(t)) { alive[t] = 0; live--; for (const v of tris[t]) gt[G[v]].delete(t); continue; }
      tris[t] = tris[t].map((v) => (p.map.has(v) ? p.map.get(v) : v));
      gt[h].add(t);
    }
    gt[g].clear();
    for (let k = 0; k < 10; k++) Q[h][k] += Q[g][k];
    // two triangles may now be the same one twice: drop the copies
    const seen = new Set();
    for (const t of gt[h]) { if (!alive[t]) continue; const k = tris[t].map((v) => G[v]).sort((a, b) => a - b).join(','); if (seen.has(k)) { alive[t] = 0; live--; for (const v of tris[t]) gt[G[v]].delete(t); } else seen.add(k); }
    stamp[g]++; stamp[h]++;
    const ring = neighbours(h);
    for (const x of ring) stamp[x]++;
    for (const x of ring) { offer(h, x); offer(x, h); for (const y of neighbours(x)) if (y !== h) offer(x, y); }
  }

  // pack down to the vertices still in use
  const remap = new Map(), out = { p: [], n: [], uv: [], w: [] }, outTris = [];
  tris.forEach((t, i) => {
    if (!alive[i]) return;
    outTris.push(t.map((v) => { if (!remap.has(v)) { remap.set(v, out.p.length); out.p.push(V.p[v]); out.n.push(V.n[v]); out.uv.push(V.uv[v]); out.w.push(V.w[v]); } return remap.get(v); }));
  });
  return { V: out, tris: outTris };
}
