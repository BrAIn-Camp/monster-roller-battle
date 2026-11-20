// Terrain data: a grid of 1 m tiles, each with a height, a colour and a water flag.
// No three.js in here, so the same code runs in the game and in tools/verify-map.mjs.
//
// The map (map.js) paints the terrain through these calls:
//   fill(x1,z1,x2,z2, height, colour)             flat rectangle
//   ellipse(cx,cz, rx,rz, height, colour, wobble) flat ellipse; wobble (metres) roughens the edge
//   ramp(x1,z1,x2,z2, dir, hLow, hHigh, colour)   slope rising towards dir ('n','s','e','w'; north is -z)
//   trench(points, width, height, colour)         sets height along a line of [x,z] points
//   pool(cx,cz, radius, depth, colour)            round hollow of shallow water
//   stream(points, width, colour)                 paints shallow water along a line (no depth)
//   path(points, width, colour) / paint(x1,z1,x2,z2, colour)   recolour only
//   grass(x1,z1,x2,z2)                            tall-grass patch
//   hills(x1,z1,x2,z2, maxRise, step, onlyColour) raises ground in stepped knolls, optionally only on one colour
//   zone(name, cx,cz, rx,rz, colours)             marks an ellipse as a habitat; colours (optional) limits it to tiles of those colours
export const SEA_LEVEL = -0.25;   // where the water surface is drawn
export const SEA_FLOOR = -0.3;    // any tile lower than this is sea
export const SEA_MIN_D = 3;       // the ball cannot enter the sea until it is this wide

export function hash2(i, j) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
export function vnoise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createTerrain(BOUNDS, scenery) {
  const NX = BOUNDS.x2 - BOUNDS.x1, NZ = BOUNDS.z2 - BOUNDS.z1;
  const tH = new Float32Array(NX * NZ), tC = new Uint32Array(NX * NZ), tR = new Uint16Array(NX * NZ), tW = new Uint8Array(NX * NZ);
  const ramps = [null], grassRects = [], zones = {};
  const eachTile = (x1, z1, x2, z2, fn) => {
    const i1 = Math.max(0, Math.round(x1 - BOUNDS.x1)), i2 = Math.min(NX, Math.round(x2 - BOUNDS.x1));
    const j1 = Math.max(0, Math.round(z1 - BOUNDS.z1)), j2 = Math.min(NZ, Math.round(z2 - BOUNDS.z1));
    for (let j = j1; j < j2; j++) for (let i = i1; i < i2; i++) fn(j * NX + i, BOUNDS.x1 + i + 0.5, BOUNDS.z1 + j + 0.5);
  };
  const rampH = (rp, x, z) => rp.h0 + (rp.h1 - rp.h0) * clamp(((rp.axis ? z : x) - rp.a) / (rp.b - rp.a), 0, 1);
  const index = (x, z) => clamp(Math.floor(z - BOUNDS.z1), 0, NZ - 1) * NX + clamp(Math.floor(x - BOUNDS.x1), 0, NX - 1);
  const groundAt = (x, z) => { const k = index(x, z); return tR[k] ? rampH(ramps[tR[k]], x, z) : tH[k]; };
  const alongLine = (points, width, fn) => {
    const hw = width / 2;
    for (let s = 0; s < points.length - 1; s++) {
      const [ax, az] = points[s], [bx, bz] = points[s + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      eachTile(Math.min(ax, bx) - hw - 1, Math.min(az, bz) - hw - 1, Math.max(ax, bx) + hw + 1, Math.max(az, bz) + hw + 1, (k, x, z) => {
        const t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
        if (Math.hypot(x - ax - dx * t, z - az - dz * t) <= hw) fn(k);
      });
    }
  };
  const api = {
    fill(x1, z1, x2, z2, h, color) { eachTile(x1, z1, x2, z2, (k) => { tH[k] = h; tR[k] = 0; tW[k] = 0; if (color !== undefined) tC[k] = color; }); },
    paint(x1, z1, x2, z2, color) { eachTile(x1, z1, x2, z2, (k) => { tC[k] = color; }); },
    ellipse(cx, cz, rx, rz, h, color, wobble = 0) {
      eachTile(cx - rx - wobble, cz - rz - wobble, cx + rx + wobble, cz + rz + wobble, (k, x, z) => {
        const dx = (x - cx) / rx, dz = (z - cz) / rz, a = Math.atan2(dz, dx);
        const lim = 1 + (wobble ? (vnoise(Math.cos(a) * 2.5 + cx * 0.05 + 40, Math.sin(a) * 2.5 + cz * 0.05 + 40) - 0.5) * 2 * wobble / Math.min(rx, rz) : 0);
        if (dx * dx + dz * dz < lim * lim) { tH[k] = h; tR[k] = 0; tW[k] = 0; if (color !== undefined) tC[k] = color; }
      });
    },
    ramp(x1, z1, x2, z2, dir, h0, h1, color) {
      const rp = { axis: dir === 'n' || dir === 's' ? 1 : 0, h0, h1,
        a: dir === 'n' ? z2 : dir === 's' ? z1 : dir === 'e' ? x1 : x2,
        b: dir === 'n' ? z1 : dir === 's' ? z2 : dir === 'e' ? x2 : x1 };
      ramps.push(rp);
      const id = ramps.length - 1;
      eachTile(x1, z1, x2, z2, (k, x, z) => { tR[k] = id; tH[k] = rampH(rp, x, z); tW[k] = 0; if (color !== undefined) tC[k] = color; });
    },
    trench(points, width, h, color) { alongLine(points, width, (k) => { tH[k] = h; tR[k] = 0; tW[k] = 0; if (color !== undefined) tC[k] = color; }); },
    path(points, width, color) { alongLine(points, width, (k) => { tC[k] = color; }); },
    stream(points, width, color) { alongLine(points, width, (k) => { tC[k] = color; tW[k] = 1; }); },
    pool(cx, cz, r, depth, color) {
      eachTile(cx - r, cz - r, cx + r, cz + r, (k, x, z) => { if (Math.hypot(x - cx, z - cz) < r) { tH[k] -= depth; tR[k] = 0; tC[k] = color; tW[k] = 1; } });
    },
    grass(x1, z1, x2, z2) { this.paint(x1, z1, x2, z2, 0x5fae52); grassRects.push([x1, z1, x2, z2]); },
    hills(x1, z1, x2, z2, amp, step, only) {
      eachTile(x1, z1, x2, z2, (k, x, z) => {
        if (only !== undefined && tC[k] !== only) return;
        const n = vnoise(x / 22, z / 22) * 0.7 + vnoise(x / 9, z / 9) * 0.3;
        tH[k] += Math.round(Math.max(0, n - 0.42) / 0.58 * amp / step) * step; tR[k] = 0;
      });
    },
    zone(name, cx, cz, rx, rz, colors) { (zones[name] || (zones[name] = [])).push({ cx, cz, rx, rz, colors: colors || null }); },
  };
  scenery(api);
  for (let k = 0; k < tH.length; k++) if (tH[k] < SEA_FLOOR) tW[k] = 2;

  // Picks a random spot inside a named habitat. want: 'land' | 'water' | 'sea' | 'any'.
  const sample = (name, want = 'land', rand = Math.random) => {
    const list = zones[name];
    if (!list) return null;
    for (let t = 0; t < 200; t++) {
      const zn = list[Math.floor(rand() * list.length)], a = rand() * Math.PI * 2, r = Math.sqrt(rand());
      const x = zn.cx + Math.cos(a) * r * zn.rx, z = zn.cz + Math.sin(a) * r * zn.rz;
      if (x < BOUNDS.x1 + 6 || x > BOUNDS.x2 - 6 || z < BOUNDS.z1 + 6 || z > BOUNDS.z2 - 6) continue;
      const k = index(x, z);
      if (tR[k]) continue;
      if (zn.colors && !zn.colors.includes(tC[k])) continue;
      const w = tW[k];
      if (want === 'land' && w === 2) continue;
      if (want === 'water' && w === 0) continue;
      if (want === 'sea' && w !== 2) continue;
      return [x, z];
    }
    return null;
  };
  return { BOUNDS, NX, NZ, tH, tC, tR, tW, ramps, rampH, grassRects, zones, groundAt, index, sample, waterAt: (x, z) => tW[index(x, z)] };
}
