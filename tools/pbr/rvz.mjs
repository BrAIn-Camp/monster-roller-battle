// Reads a Wii .rvz disc image (zstd or uncompressed groups) and lists or extracts the files of its partitions.
//   node rvz.mjs <image.rvz> info
//   node rvz.mjs <image.rvz> list <partition>
//   node rvz.mjs <image.rvz> extract <partition> <outdir> [substring-filter]
// Format: Dolphin's docs/WiaAndRvz.md. Junk (padding) regions are written as zeros, not regenerated.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const [, , file, cmd, ...args] = process.argv;
const fd = fs.openSync(file, 'r');
const rd = (off, len) => { const b = Buffer.alloc(len); let got = 0; while (got < len) { const n = fs.readSync(fd, b, got, len - got, Number(off) + got); if (!n) break; got += n; } return b; };

const head = rd(0, 0x48);
const magic = head.toString('latin1', 0, 4);
if (magic !== 'RVZ\x01') throw new Error('not an RVZ file: ' + JSON.stringify(magic));
const disc = rd(0x48, head.readUInt32BE(0x0c));
const discType = disc.readUInt32BE(0), compression = disc.readUInt32BE(4), chunk = disc.readUInt32BE(0x0c);
const dhead = disc.subarray(0x10, 0x90);
const nPart = disc.readUInt32BE(0x90), partSize = disc.readUInt32BE(0x94), partOff = disc.readBigUInt64BE(0x98);
const nRaw = disc.readUInt32BE(0xb4), rawOff = disc.readBigUInt64BE(0xb8), rawSize = disc.readUInt32BE(0xc0);
const nGroups = disc.readUInt32BE(0xc4), groupOff = disc.readBigUInt64BE(0xc8), groupSize = disc.readUInt32BE(0xd0);
if (compression !== 5 && compression !== 0) throw new Error('unsupported compression method ' + compression);
const unz = (b) => (compression === 5 ? zlib.zstdDecompressSync(b) : b);

const groupTab = unz(rd(groupOff, groupSize));
if (groupTab.length !== nGroups * 12) throw new Error(`group table is ${groupTab.length} bytes, expected ${nGroups * 12}`);
const partTab = rd(partOff, nPart * partSize);
const parts = [];
for (let i = 0; i < nPart; i++) {
  const o = i * partSize, pd = [];
  for (let k = 0; k < 2; k++) {
    const q = o + 16 + k * 16;
    pd.push({ first: partTab.readUInt32BE(q), n: partTab.readUInt32BE(q + 4), group: partTab.readUInt32BE(q + 8), nGroups: partTab.readUInt32BE(q + 12) });
  }
  parts.push({ pd });
}

const SECT = 0x7c00;                                  // bytes of data per 0x8000 disc sector once the hashes are gone
const perGroup = (chunk / 0x8000) * SECT;
const nLists = Math.max(1, chunk / 0x200000);
const cache = new Map();

// The data of one group of a partition, hashes and exception lists removed, `want` bytes long.
function groupData(gi, want) {
  const key = gi;
  if (cache.has(key)) return cache.get(key);
  const o = gi * 12, off = groupTab.readUInt32BE(o) * 4, ds = groupTab.readUInt32BE(o + 4), packed = groupTab.readUInt32BE(o + 8);
  const size = ds & 0x7fffffff, compressed = ds >>> 31;
  let out;
  if (size === 0) out = Buffer.alloc(want);
  else {
    let buf = rd(off, size);
    if (compressed) buf = unz(buf);
    let p = 0;
    for (let i = 0; i < nLists; i++) p += 2 + buf.readUInt16BE(p) * 22;
    if (!compressed) p = (p + 3) & ~3;
    if (!packed) out = buf.subarray(p, p + want);
    else {
      out = Buffer.alloc(want);
      let w = 0;
      const end = Math.min(buf.length, p + packed);
      while (p + 4 <= end && w < want) {
        const s = buf.readUInt32BE(p); p += 4;
        const len = s & 0x7fffffff;
        if (s >>> 31) { p += 68; w += len; }                       // junk: 17 seed words, left as zeros
        else { buf.copy(out, w, p, p + len); p += len; w += len; }
      }
    }
    if (out.length < want) { const t = Buffer.alloc(want); out.copy(t); out = t; }
  }
  cache.set(key, out);
  if (cache.size > 8) cache.delete(cache.keys().next().value);
  return out;
}

// `len` bytes of partition `pi`'s decrypted data starting at `off`.
function partRead(pi, off, len) {
  const out = Buffer.alloc(len);
  let done = 0, base = 0;
  for (const d of parts[pi].pd) {
    const bytes = d.n * SECT;
    while (done < len && off + done >= base && off + done < base + bytes) {
      const rel = off + done - base, g = Math.floor(rel / perGroup), within = rel - g * perGroup;
      const want = Math.min(perGroup, bytes - g * perGroup);
      const data = groupData(d.group + g, want);
      const n = Math.min(len - done, want - within);
      data.copy(out, done, within, within + n);
      done += n;
    }
    base += bytes;
  }
  return out;
}

function fst(pi) {
  const boot = partRead(pi, 0, 0x440);
  const id = boot.toString('latin1', 0, 6).replace(/[^\x20-\x7e]/g, '?');
  const title = boot.toString('latin1', 0x20, 0x60).replace(/\0.*$/s, '').replace(/[^\x20-\x7e]/g, '?');
  const fstOff = boot.readUInt32BE(0x424) * 4, fstSize = boot.readUInt32BE(0x428) * 4;
  if (!fstOff || !fstSize || fstSize > 64 << 20) return { id, title, files: null };
  const t = partRead(pi, fstOff, fstSize);
  const count = t.readUInt32BE(8), names = count * 12;
  const name = (i) => { const o = names + (t.readUInt32BE(i * 12) & 0xffffff); let e = o; while (e < t.length && t[e]) e++; return t.toString('latin1', o, e); };
  const files = [];
  const walk = (i, end, dir) => {
    while (i < end) {
      const isDir = t[i * 12] !== 0, a = t.readUInt32BE(i * 12 + 4), b = t.readUInt32BE(i * 12 + 8);
      const n = name(i).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_');
      const safe = n === '.' || n === '..' || !n ? '_' : n;
      if (isDir) { walk(i + 1, b, dir + safe + '/'); i = b; }
      else { files.push({ path: dir + safe, off: a * 4, size: b }); i++; }
    }
  };
  walk(1, count, '');
  return { id, title, files };
}

if (cmd === 'info') {
  console.log(`disc type ${discType}, compression ${compression}, chunk ${chunk}, ${nGroups} groups, ${nRaw} raw areas`);
  console.log('disc id', dhead.toString('latin1', 0, 6), '|', dhead.toString('latin1', 0x20, 0x60).replace(/\0.*$/s, ''));
  parts.forEach((p, i) => {
    let info;
    try { info = fst(i); } catch (e) { info = { id: '?', title: 'unreadable: ' + e.message, files: null }; }
    const total = info.files ? info.files.reduce((s, f) => s + f.size, 0) : 0;
    console.log(`partition ${i}: sectors ${p.pd[0].first}+${p.pd[0].n}, ${p.pd[1].first}+${p.pd[1].n} | id ${info.id} "${info.title}" | ${info.files ? info.files.length + ' files, ' + (total / 1048576).toFixed(1) + ' MB' : 'no file table'}`);
  });
} else if (cmd === 'list') {
  for (const f of fst(+args[0]).files) console.log(f.size.toString().padStart(11), f.path);
} else if (cmd === 'extract') {
  const pi = +args[0], out = path.resolve(args[1]), filter = args[2];
  let n = 0, bytes = 0;
  for (const f of fst(pi).files) {
    if (filter && !f.path.includes(filter)) continue;
    const dest = path.resolve(out, f.path);
    if (!dest.startsWith(out + path.sep)) throw new Error('path escapes the output folder: ' + f.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const w = fs.openSync(dest, 'w');
    for (let o = 0; o < f.size; o += 1 << 20) fs.writeSync(w, partRead(pi, f.off + o, Math.min(1 << 20, f.size - o)));
    fs.closeSync(w);
    n++; bytes += f.size;
  }
  console.log(`${n} files, ${(bytes / 1048576).toFixed(1)} MB written to ${out}`);
} else console.log('commands: info | list <partition> | extract <partition> <outdir> [filter]');
