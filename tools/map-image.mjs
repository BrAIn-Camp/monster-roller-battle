// Draws the map from above as a PNG, with everything layout() places on it.   node tools/map-image.mjs [out.png] [scale] [x1 z1 x2 z2]
// Ground colour is shaded by height; things are dots sized by their footprint (items dark, critter-free). Needs no packages.
import zlib from 'node:zlib';
import fs from 'node:fs';
import { loadWorld } from './world.mjs';
const out = process.argv[2] || 'map.png', S = +(process.argv[3] || 2);
const { T, BOUNDS, objects } = await loadWorld();
const [x1, z1, x2, z2] = process.argv.length > 7 ? process.argv.slice(4, 8).map(Number) : [BOUNDS.x1, BOUNDS.z1, BOUNDS.x2, BOUNDS.z2];
const W = Math.round((x2 - x1) * S), H = Math.round((z2 - z1) * S), px = Buffer.alloc(W * H * 3);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const x = x1 + (i + 0.5) / S, z = z1 + (j + 0.5) / S, k = T.index(x, z), c = T.tC[k], h = T.groundAt(x, z), hn = T.groundAt(x - 1, z - 1);
  let sh = 0.86 + Math.min(0.2, h * 0.012) + Math.max(-0.3, Math.min(0.25, (h - hn) * 0.22));
  let r = (c >> 16 & 255) * sh, g = (c >> 8 & 255) * sh, b = (c & 255) * sh;
  if (T.tW[k] === 2) { r = r * 0.3 + 40; g = g * 0.3 + 105; b = b * 0.3 + 160; }
  const o = (j * W + i) * 3; px[o] = Math.min(255, r); px[o + 1] = Math.min(255, g); px[o + 2] = Math.min(255, b);
}
for (const ob of objects) {
  const rad = Math.max(0.6, ob.size * 0.35 * S), cx = (ob.x - x1) * S, cz = (ob.z - z1) * S;
  const col = ob.size < 0.3 ? [255, 255, 255] : ob.size < 1 ? [255, 220, 60] : ob.size < 3 ? [240, 120, 40] : ob.size < 7 ? [200, 40, 60] : [110, 30, 140];
  for (let j = Math.floor(cz - rad); j <= cz + rad; j++) for (let i = Math.floor(cx - rad); i <= cx + rad; i++) {
    if (i < 0 || j < 0 || i >= W || j >= H || Math.hypot(i - cx, j - cz) > rad) continue;
    const o = (j * W + i) * 3; px[o] = col[0]; px[o + 1] = col[1]; px[o + 2] = col[2];
  }
}
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let j = 0; j < H; j++) px.copy(raw, j * (W * 3 + 1) + 1, j * W * 3, (j + 1) * W * 3);
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log(`wrote ${out} (${W}x${H}), ${objects.length} things. Dot colours: white <0.3 m, yellow <1 m, orange <3 m, red <7 m, purple 7 m+`);
