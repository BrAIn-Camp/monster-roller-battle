// node mp.mjs <port>: a host and a client in two tabs (?net=local), a round started, claims granted and refused,
// and the baked props' books checked on both.
import { readFileSync } from 'node:fs';
const port = process.argv[2], base = `http://127.0.0.1:${port}`;
const inv = readFileSync(new URL('./inv.js', import.meta.url), 'utf8');
async function tab(url) {
  const t = await (await fetch(`${base}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const waiting = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const run = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); const x = r.result; if (x.exceptionDetails) return 'EXCEPTION ' + JSON.stringify(x.exceptionDetails.exception || x.exceptionDetails).slice(0, 600); return x.result.value; };
  return { run, close: () => fetch(`${base}/json/close/${t.id}`), ws };
}
const nap = (ms) => new Promise((r) => setTimeout(r, ms));
const errHook = `window.__errs=[];addEventListener('error',e=>__errs.push('error: '+e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));addEventListener('unhandledrejection',e=>__errs.push('rejection: '+(e.reason&&e.reason.message||e.reason)));{const r=console.error;console.error=(...a)=>{__errs.push('console.error: '+a.map(String).join(' ').slice(0,200));r.apply(console,a)}};1`;
const host = await tab('http://127.0.0.1:8417/?mute&net=local');
await nap(5000);
await host.run(errHook); await host.run(inv);
console.log('host menu:', await host.run(`document.getElementById('btnMulti').click(); document.getElementById('btnHost').click(); new Promise(r=>setTimeout(()=>r(document.getElementById('roomCode').textContent),2500))`));
const code = await host.run(`document.getElementById('roomCode').textContent`);
const client = await tab('http://127.0.0.1:8417/?mute&net=local&room=' + code);
await nap(6000);
await client.run(errHook); await client.run(inv);
console.log('lobby:', await host.run(`JSON.stringify({kinds:__game.lob.kinds,peers:__game.lob.peers.map(p=>!!p)})`));
await host.run(`document.getElementById('btnStartMp').click();1`);
const wait = `(async()=>{for(let i=0;i<900&&__game.state!=='play';i++)await new Promise(r=>setTimeout(r,100));await new Promise(r=>setTimeout(r,5000));return __game.state+' client='+__game.net.client+' host='+__game.net.host+' | '+__inv()})()`;
const [h1, c1] = await Promise.all([host.run(wait), client.run(wait)]);
console.log('host:  ', h1); console.log('client:', c1);
// the client claims the 12 props nearest its ball that it could roll up; the host is told to refuse 5 of them
const ids = JSON.parse(await client.run(`(()=>{const G=__game;const L=G.objects.filter(o=>o.kind==='item'&&o.baked&&!o.noPick).sort((a,b)=>Math.hypot(a.group.position.x-G.x,a.group.position.z-G.z)-Math.hypot(b.group.position.x-G.x,b.group.position.z-G.z)).slice(0,12);window.__mine=L;window.__was=L.map(o=>[o.group.position.x,o.group.position.y,o.group.position.z]);return JSON.stringify(L.map(o=>o.id))})()`));
const refuse = ids.slice(0, 5);
await host.run(`for(const id of ${JSON.stringify(refuse)}){const o=__game.byId.get(id);if(o)o.noPick=true};1`);
console.log('claimed:', await client.run(`(()=>{const G=__game;G.d=Math.max(G.d,30);G.vol3=G.d**3;for(const o of __mine)G.netClaim(o);return __mine.length+' claims sent; on the ball now '+__mine.filter(o=>o.on).length+' | '+__inv()})()`));
await nap(1500);
console.log('after answers (client):', await client.run(`(()=>{const G=__game;const back=__mine.filter(o=>!o.on);return 'refused and back in the world '+back.length+', kept '+__mine.filter(o=>o.on).length+'; of those back: at their old place '+back.filter(o=>{const w=__was[__mine.indexOf(o)],p=o.group.position;return Math.hypot(p.x-w[0],p.z-w[2])<0.01}).length+', baked '+back.filter(o=>o.baked).length+' | '+__inv()})()`));
await nap(4000);
console.log('four seconds on (client):', await client.run(`(()=>{const back=__mine.filter(o=>!o.on);return 'of the '+back.length+' back: baked again '+back.filter(o=>o.baked).length+' | '+__inv()})()`));
console.log('host:', await host.run(`(()=>{const G=__game;const R=G.rivals.find(r=>r.human);return 'the player\\'s ball holds '+(R?R.attached.length:'?')+' | '+__inv()})()`));
// let it run a while with the host's CPUs playing, then compare what each side thinks is free
await nap(8000);
const freeH = JSON.parse(await host.run(`JSON.stringify(__game.objects.filter(o=>o.kind==='item').map(o=>o.id).sort((a,b)=>a-b))`));
const freeC = JSON.parse(await client.run(`JSON.stringify(__game.objects.filter(o=>o.kind==='item').map(o=>o.id).sort((a,b)=>a-b))`));
const sh = new Set(freeH), scn = new Set(freeC);
console.log(`free props: host ${freeH.length}, client ${freeC.length}; only on host ${freeH.filter((x) => !scn.has(x)).length}, only on client ${freeC.filter((x) => !sh.has(x)).length}`);
console.log('host end:  ', await host.run(`__inv()+' | errors '+JSON.stringify(__errs)`));
console.log('client end:', await client.run(`__inv()+' | errors '+JSON.stringify(__errs)`));
await host.close(); await client.close();
process.exit(0);
