// Unpacks an .fsys archive: every entry, LZSS-decompressed where it is compressed, into <outdir>/<n>.bin
//   node fsys.mjs <archive.fsys> <outdir>
import fs from 'node:fs';
import path from 'node:path';

// Okumura LZSS: 4096-byte window starting at 0xFEE, flag bits low first (1 = literal), runs of 3..18.
export function lzss(src, outLen) {
  const out = Buffer.alloc(outLen), win = Buffer.alloc(4096);
  let r = 0xfee, p = 0, w = 0, flags = 0;
  while (p < src.length && w < outLen) {
    flags >>>= 1;
    if (!(flags & 0x100)) flags = src[p++] | 0xff00;
    if (flags & 1) { const c = src[p++]; out[w++] = c; win[r] = c; r = (r + 1) & 4095; }
    else {
      const lo = src[p++], hi = src[p++];
      let off = lo | ((hi & 0xf0) << 4);
      for (let n = (hi & 0x0f) + 3; n > 0 && w < outLen; n--) { const c = win[off]; off = (off + 1) & 4095; out[w++] = c; win[r] = c; r = (r + 1) & 4095; }
    }
  }
  return { out, written: w, consumed: p };
}

export function entries(b) {
  if (b.toString('latin1', 0, 4) !== 'FSYS') throw new Error('not an FSYS archive');
  const n = b.readUInt32BE(0x0c), list = b.readUInt32BE(0x40), res = [];
  for (let i = 0; i < n; i++) {
    const d = b.readUInt32BE(list + i * 4);
    res.push({ id: b.readUInt32BE(d), start: b.readUInt32BE(d + 4), size: b.readUInt32BE(d + 8), flags: b.readUInt32BE(d + 0x0c), packed: b.readUInt32BE(d + 0x14), kind: b.readUInt32BE(d + 0x20) });
  }
  return res;
}

export function unpack(b, e) {
  if (b.toString('latin1', e.start, e.start + 4) === 'LZSS') {
    const len = b.readUInt32BE(e.start + 4), plen = b.readUInt32BE(e.start + 8);
    const r = lzss(b.subarray(e.start + 16, e.start + plen), len);
    if (r.written !== len) throw new Error(`LZSS wrote ${r.written} of ${len} bytes`);
    return r.out;
  }
  return b.subarray(e.start, e.start + e.size);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [, , file, outdir] = process.argv;
  const b = fs.readFileSync(file);
  fs.mkdirSync(outdir, { recursive: true });
  entries(b).forEach((e, i) => {
    const data = unpack(b, e);
    fs.writeFileSync(path.join(outdir, i + '.bin'), data);
    console.log(i, 'id', e.id.toString(16), 'kind', e.kind, 'bytes', data.length);
  });
}
