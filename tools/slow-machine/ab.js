// window.__ab(name, on, off, rounds, frames): the frame's cost with a change switched on and off in turn, averaged.
window.__ab = (name, on, off, rounds = 5, frames = 80) => {
  const G = __game, sum = { a: null, b: null };
  const add = (k, b) => { const s = sum[k] || (sum[k] = { ms: 0, sim: 0, batch: 0, draw: 0, gpuWait: 0, calls: 0, n: 0 }); for (const f of ['ms', 'sim', 'batch', 'draw', 'gpuWait', 'calls']) s[f] += b[f]; s.n++; };
  G.bench(20);
  for (let i = 0; i < rounds; i++) { off(); G.bench(5); add('a', G.bench(frames)); on(); G.bench(5); add('b', G.bench(frames)); }
  off();
  const row = (s) => `${(s.ms / s.n).toFixed(2)} ms = rules ${(s.sim / s.n).toFixed(2)} + batches ${(s.batch / s.n).toFixed(2)} + drawing ${(s.draw / s.n).toFixed(2)} + card ${(s.gpuWait / s.n).toFixed(2)} | ${Math.round(s.calls / s.n)} draws`;
  return `${name}\n   without: ${row(sum.a)}\n   with:    ${row(sum.b)}\n   saves ${((sum.a.ms - sum.b.ms) / sum.a.n).toFixed(2)} ms (${((1 - sum.b.ms / sum.a.ms) * 100).toFixed(0)}%)`;
};
'ready'
