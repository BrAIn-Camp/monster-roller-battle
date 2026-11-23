// node cdp.mjs <port> <cpu throttle> <script.js | -e "expression"> [url to open first]
// Runs a script in the page of the stand-in Chrome and prints what it returns.
import { readFileSync } from 'node:fs';
const [port, rate, what, arg4, arg5] = process.argv.slice(2);
const expr = what === '-e' ? arg4 : readFileSync(what, 'utf8');
const url = what === '-e' ? arg5 : arg4;
const base = `http://127.0.0.1:${port}`;
let tabs = await (await fetch(base + '/json')).json();
let tab = tabs.find((t) => t.type === 'page');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setCPUThrottlingRate', { rate: Number(rate) || 1 });
if (url) { await send('Page.enable'); await send('Page.navigate', { url }); await new Promise((r) => setTimeout(r, 4000)); }
const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 600000 });
const r = res.result || {};
if (r.exceptionDetails) console.log('EXCEPTION', JSON.stringify(r.exceptionDetails.exception || r.exceptionDetails).slice(0, 2000));
else console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value, null, 1));
ws.close();
