// node shot.mjs <port> <out.png> ["expression to run first"]
import { writeFileSync } from 'node:fs';
const [port, out, expr] = process.argv.slice(2);
const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
if (expr) { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); console.log(JSON.stringify(r.result.result && r.result.result.value)); }
const r = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(r.result.data, 'base64'));
console.log('saved', out);
ws.close();
