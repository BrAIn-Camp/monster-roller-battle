// node prof.mjs <port> <cpu throttle> "<expression to run while profiling>" [top n]
// A processor profile of the page's main thread while the expression runs: where the time goes, by function.
const [port, rate, expr, topN = 45] = process.argv.slice(2);
const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setCPUThrottlingRate', { rate: Number(rate) || 1 });
await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 100 });
await send('Profiler.start');
const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 600000 });
const { result: { profile } } = await send('Profiler.stop');
console.log('returned:', JSON.stringify(res.result.result && res.result.result.value));
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map(); for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
const self = new Map(); let total = 0;
const dts = profile.timeDeltas;
profile.samples.forEach((s, i) => { self.set(s, (self.get(s) || 0) + dts[i]); total += dts[i]; });
const name = (n) => { const f = n.callFrame; return (f.functionName || '(anon)') + ' ' + f.url.split('/').pop().split('?')[0] + ':' + (f.lineNumber + 1); };
const flat = new Map(), incl = new Map();
for (const [nid, t] of self) {
  const n = byId.get(nid), k = name(n);
  flat.set(k, (flat.get(k) || 0) + t);
  const seen = new Set();
  for (let p = nid; p; p = parent.get(p)) { const kk = name(byId.get(p)); if (!seen.has(kk)) { seen.add(kk); incl.set(kk, (incl.get(kk) || 0) + t); } }
}
const pct = (t) => (t / total * 100).toFixed(1).padStart(5) + '%';
console.log('total ms', (total / 1000).toFixed(0));
console.log('\n== self time');
for (const [k, t] of [...flat].sort((a, b) => b[1] - a[1]).slice(0, topN)) console.log(pct(t), k);
console.log('\n== including what it calls');
for (const [k, t] of [...incl].sort((a, b) => b[1] - a[1]).slice(0, topN)) console.log(pct(t), k);
const want = (process.argv[6] || '').split(',').filter(Boolean);
for (const w of want) {
  const callers = new Map(); let tot = 0;
  for (const [nid, t] of self) { const n = byId.get(nid); if (n.callFrame.functionName !== w) continue; tot += t; let p = parent.get(nid), chain = []; for (let k = 0; k < 4 && p; k++, p = parent.get(p)) chain.push(name(byId.get(p)).split(' ')[0]); const key = chain.join(' < '); callers.set(key, (callers.get(key) || 0) + t); }
  console.log('\n== who calls ' + w + ' (self ' + pct(tot) + ')');
  for (const [k, t] of [...callers].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(pct(t), k);
}
ws.close();
