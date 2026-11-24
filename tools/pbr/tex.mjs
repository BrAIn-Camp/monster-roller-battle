// Decodes a GameCube/Wii texture into RGBA, top row first, and writes PNG files.
import zlib from 'node:zlib';

const x5 = (v) => (v << 3) | (v >> 2), x6 = (v) => (v << 2) | (v >> 4), x4 = (v) => v * 17, x3 = (v) => (v << 5) | (v << 2) | (v >> 1);
const rgb565 = (v) => [x5(v >> 11), x6((v >> 5) & 63), x5(v & 31), 255];
const rgb5a3 = (v) => (v & 0x8000 ? [x5((v >> 10) & 31), x5((v >> 5) & 31), x5(v & 31), 255] : [x4((v >> 8) & 15), x4((v >> 4) & 15), x4(v & 15), x3((v >> 12) & 7)]);
const ia8 = (v) => [v & 255, v & 255, v & 255, v >> 8];

// tile width, tile height, bytes per tile
const TILE = { 0x00: [8, 8, 32], 0x01: [8, 4, 32], 0x30: [4, 4, 32], 0x40: [8, 8, 32], 0x41: [8, 4, 32], 0x42: [8, 4, 32], 0x43: [4, 4, 32], 0x44: [4, 4, 32], 0x45: [4, 4, 64], 0x90: [4, 4, 32], 0xb0: [8, 8, 32] };

export function decodeTexture(b, tex) {
  const { w, h, enc } = tex, tile = TILE[enc];
  if (!tile || !w || !h) return null;
  const [tw, th, tb] = tile, out = new Uint8Array(w * h * 4);
  const put = (x, y, c) => { if (x < w && y < h) { const o = (y * w + x) * 4; out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = c[3]; } };
  let pal = null;
  if (enc === 0x00 || enc === 0x01 || enc === 0x30) {
    const n = enc === 0x00 ? 16 : enc === 0x01 ? 256 : 16384, f = tex.palEnc === 1 ? ia8 : tex.palEnc === 2 ? rgb565 : rgb5a3;
    pal = [];
    for (let i = 0; i < n && tex.palette + i * 2 + 1 < b.length; i++) pal.push(f(b.readUInt16BE(tex.palette + i * 2)));
  }
  const P = (i) => (pal && pal[i]) || [0, 0, 0, 0];
  let p = tex.image;
  for (let ty = 0; ty < h; ty += th) for (let tx = 0; tx < w; tx += tw, p += tb) {
    if (p + tb > b.length) return out;
    if (enc === 0xb0) {
      for (let s = 0; s < 4; s++) {
        const o = p + s * 8, c0 = b.readUInt16BE(o), c1 = b.readUInt16BE(o + 2), a = rgb565(c0), c = rgb565(c1);
        const mix = (x, y, k, n) => [0, 1, 2].map((i) => ((x[i] * k + y[i] * (n - k)) / n) | 0).concat(255);
        const cols = c0 > c1 ? [a, c, mix(a, c, 2, 3), mix(a, c, 1, 3)] : [a, c, mix(a, c, 1, 2), [0, 0, 0, 0]];
        for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) put(tx + (s & 1) * 4 + x, ty + (s >> 1) * 4 + y, cols[(b[o + 4 + y] >> (6 - x * 2)) & 3]);
      }
    } else if (enc === 0x45) {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const o = p + y * 8 + x * 2; put(tx + x, ty + y, [b[o + 1], b[o + 32], b[o + 33], b[o]]); }
    } else if (enc === 0x00 || enc === 0x40) {
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = (b[p + y * 4 + (x >> 1)] >> (x & 1 ? 0 : 4)) & 15; put(tx + x, ty + y, enc === 0x00 ? P(v) : [x4(v), x4(v), x4(v), 255]); }
    } else if (enc === 0x01 || enc === 0x41 || enc === 0x42) {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) { const v = b[p + y * 8 + x]; put(tx + x, ty + y, enc === 0x01 ? P(v) : enc === 0x42 ? [v, v, v, 255] : [x4(v & 15), x4(v & 15), x4(v & 15), x4(v >> 4)]); }
    } else {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = b.readUInt16BE(p + y * 8 + x * 2); put(tx + x, ty + y, enc === 0x30 ? P(v & 0x3fff) : enc === 0x43 ? ia8(v) : enc === 0x44 ? rgb565(v) : rgb5a3(v)); }
    }
  }
  return out;
}

// ---- PNG, RGBA 8-bit
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, 'latin1'); data.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
export function encodePng(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
