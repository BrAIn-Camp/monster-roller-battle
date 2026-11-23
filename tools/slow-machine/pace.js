// One round played by the autoplay bot: how big the balls are as it goes on. For comparing the pace of two builds
// (run it several times: the bot's luck varies a good deal).
(async () => {
  const nap = (ms) => new Promise((r) => setTimeout(r, ms));
  const G = __game;
  document.getElementById('btnTimed').click();
  for (let i = 0; i < 600 && G.state !== 'play'; i++) await nap(100);
  await nap(1500);
  const marks = [];
  for (let k = 0; k < 5; k++) { G.autoplay(k < 4 ? 60 : 55, 600); G.state = 'play'; await nap(50); marks.push(+G.d.toFixed(2)); }
  const cpus = G.rivals.map((R) => +R.d.toFixed(2)).sort((a, b) => b - a);
  const crit = G.attached.filter((o) => o.kind === 'creature').length;
  // how many species a ball that size could still not roll up
  const tooBig = (d) => { const seen = new Set(); for (const o of G.objects) if (o.kind === 'creature' && !o.spec.titan && o.size > d * 0.5) seen.add(o.spec.id); return seen.size; };
  return JSON.stringify({ me: marks, cpus, caught: G.caught, critters: G.army.length, tooBigForMe: tooBig(G.d), tooBigForBest: tooBig(Math.max(G.d, ...cpus)) });
})()
