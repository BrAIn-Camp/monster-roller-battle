// Builds the map without the game: terrain plus everything layout() places. Used by the map tools.
// loadWorld() -> { T, BOUNDS, BIOMES, B, PLACES, SPECS, objects: [{ id, x, z, size, rad, rot, biome, flat }], warnings }
import { createTerrain } from '../terrain.js';
globalThis.window = globalThis.window || {};
await import('../roster.js');
const map = await import('../map.js');
export async function loadWorld() {
  const { BOUNDS, BIOMES, B, PLACES, scenery, layout } = map;
  const T = createTerrain(BOUNDS, scenery);
  const SPECS = {}, warnings = [];
  for (const s of [...window.ROLLUP_DATA.ITEMS, ...map.ITEMS]) { if (SPECS[s.id]) warnings.push('duplicate item id ' + s.id); SPECS[s.id] = s; if (s.shape && !map.SHAPES[s.shape] && !BUILTIN.has(s.shape)) warnings.push(`item ${s.id} uses unknown shape ${s.shape}`); }
  let seed = 12345; const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const objects = [], solids = [];
  const radOf = (id) => (SPECS[id] ? SPECS[id].size * (SPECS[id].rad ?? 0.35) : 0);
  const free = (x, z, rad) => !solids.some((s) => Math.hypot(x - s.x, z - s.z) < rad + s.rad);
  function put(id, x, z, opt = {}) {
    const s = SPECS[id];
    if (!s) { warnings.push('unknown item id ' + id); return null; }
    const size = s.size * (opt.scale ?? 1), rad = opt.rad ?? size * (s.rad ?? 0.35);
    const o = { id, x, z, size, rad, rot: opt.rot ?? 0, biome: BIOMES[T.biomeAt(x, z)].id, flat: !!s.flat, water: T.waterAt(x, z), y: T.groundAt(x, z) };
    objects.push(o);
    if (size >= 0.5 && !s.flat) solids.push({ x, z, rad });
    return o;
  }
  const m = {
    put, rand, ground: T.groundAt, water: T.waterAt, biomeAt: (x, z) => BIOMES[T.biomeAt(x, z)].id, sizeOf: (id) => (SPECS[id] ? SPECS[id].size : 0),
    row(id, x1, z1, x2, z2, n, opt) { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; put(id, x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, opt); } },
    grid(id, x, z, cols, rows, dx, dz, opt) { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) put(id, x + i * dx, z + j * dz, opt); },
    ring(id, x, z, r, n, opt) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; put(id, x + Math.cos(a) * r, z + Math.sin(a) * r, Object.assign({ rot: -a + Math.PI / 2 }, opt)); } },
    blob(id, x, z, r, n, opt) { for (let i = 0; i < n; i++) for (let t = 0; t < 25; t++) { const a = rand() * Math.PI * 2, rr = r * Math.sqrt(rand()), px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr; if (free(px, pz, radOf(id)) && T.waterAt(px, pz) !== 2) { put(id, px, pz, Object.assign({ rot: rand() * 6.283 }, opt)); break; } } },
    scatter(id, x1, z1, x2, z2, n, opt) { for (let i = 0; i < n; i++) for (let t = 0; t < 40; t++) { const px = x1 + rand() * (x2 - x1), pz = z1 + rand() * (z2 - z1); if (free(px, pz, radOf(id) + 0.3)) { put(id, px, pz, Object.assign({ rot: rand() * 6.283 }, opt)); break; } } },
  };
  layout(m);
  return { T, BOUNDS, BIOMES, B, PLACES, SPECS, objects, warnings, map };
}
const BUILTIN = new Set('berry coin flower mushroom bottle cup boot pot bucket crate barrel sign mailbox bush fence bench blanket boulder cart lamp tree roundtree shed house tallhouse windmill tower'.split(' '));
