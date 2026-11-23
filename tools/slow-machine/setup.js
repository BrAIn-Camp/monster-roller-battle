// A round to measure in: fixed level (window.__level, default high), started, models in, and the clock stopped from running out.
(async () => {
  const LEVEL = window.__level || 'high';
  const nap = (ms) => new Promise((r) => setTimeout(r, ms));
  const G = __game, b = document.getElementById('btnGfx');
  for (let i = 0; i < 6 && !new RegExp(': ' + LEVEL + '$').test(b.textContent); i++) b.click();
  document.getElementById('btnTimed').click();
  for (let i = 0; i < 600 && G.state !== 'play'; i++) await nap(100);
  await nap(12000);
  G.timeLeft = 1e6;
  const x = G.bench(60);
  return `${b.textContent} | ${G.state} | ${x.px} | ${x.ms} ms = rules ${x.sim} + models ${x.models} + batches ${x.batch} + drawing ${x.draw} + card ${x.gpuWait} | ${x.calls} draws ${x.tris} tris | poses ${JSON.stringify(G.poses())}`;
})()
