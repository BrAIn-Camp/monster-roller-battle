// In a running round: a frame at each level (start of a round), then with 300 things stuck to every ball.
(async () => {
  const nap = (ms) => new Promise((r) => setTimeout(r, ms));
  const G = __game, X = G.gfx, out = [];
  const row = (b) => `${b.quality} ${b.px}: ${b.ms} ms (worst ${b.worst}) = rules ${b.sim} + models ${b.models} + batches ${b.batch} + drawing ${b.draw} + card ${b.gpuWait} | ${b.calls} draws, ${b.tris} tris`;
  for (let q = 0; q < 4; q++) { X.setQuality(q); G.bench(40); await nap(400); G.bench(40); await nap(400); out.push('start of round, ' + row(G.bench(60))); }
  X.setQuality(0); G.bench(20);
  // bring the rivals into view and fill every ball
  G.rivals.forEach((R, i) => { R.x = G.x + Math.sin(G.heading + (i - 1) * 0.5) * 14; R.z = G.z + Math.cos(G.heading + (i - 1) * 0.5) * 14; });
  G.fill(300); G.bench(60); await nap(500); G.bench(60); await nap(500);
  for (const q of [0, 3]) { X.setQuality(q); G.bench(40); await nap(400); G.bench(40); out.push(`four full balls in view (${[G, ...G.rivals].map((B) => B.attached.length).join(',')} stuck), ` + row(G.bench(60))); }
  X.setQuality(0);
  return out.join('\n');
})()
