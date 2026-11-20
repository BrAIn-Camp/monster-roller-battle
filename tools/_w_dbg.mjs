globalThis.WEST_DEBUG = 1;
const { loadWorld } = await import('./world.mjs');
const { objects } = await loadWorld();
if (process.argv[2]) { const re = new RegExp(process.argv[2]); for (const o of objects) if (re.test(o.id) && ['forest','gorge','farm','plain'].includes(o.biome)) console.log(o.id, o.x.toFixed(1), o.z.toFixed(1), 'size', o.size.toFixed(2), 'y', o.y.toFixed(2), o.biome, 'w' + o.water); }
