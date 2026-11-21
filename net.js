// Multiplayer transport: one player hosts a room and up to three others join it.
// Every player talks only to the host (a star), over a reliable, ordered channel. Nothing here knows about the game:
// main.js decides what the messages mean.
//
// Two kinds of room:
//   private   opened by one player and joined by a four-letter code they share;
//   public    a handful of well-known rooms that anyone can be put into ("quick play"). Whoever finds one empty
//             becomes its host; everyone after joins it, until it is full or its round has started.
//
//   const room = await openRoom({ host: true })            -> hosts a new private room; room.code is what friends type in
//   const room = await openRoom({ host: false, code })     -> joins that room
//   const room = await openPublicRoom()                    -> joins a public room, or hosts one (room.host says which)
//   room.send(peerId, msg) / room.broadcast(msg)           -> host to one / all players; a player always sends to the host
//   room.onJoin(id) / room.onLeave(id) / room.onMsg(id, msg) / room.onClose(reason)   -> set these
//   room.accepting = () => bool                            -> (host) may somebody join right now? default: yes
//   room.sendFast(id, msg)                                 -> the same, but for news that goes stale (where a ball is now): it is
//                                                             never queued behind anything and never re-sent, so it arrives fresh or
//                                                             not at all. Returns false if there is no such channel (use send).
//   room.buffered(id)                                      -> bytes still waiting to go out to that player on the reliable channel
//   room.close()
//
// Two transports: 'peer' (WebRTC through the public PeerJS broker: real play over the internet) and 'local'
// (BroadcastChannel between tabs of one browser: for testing, chosen with ?net=local).

const PEERJS_URL = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIX = 'critter-roller-v1-';
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';          // no I or O: they read as 1 and 0
const PUBLIC_ROOMS = 6;                              // public rooms are named pub1..pub6 (a code nobody can type: it has a digit)
export const MAX_PLAYERS = 4;

export const makeCode = () => { let s = ''; for (let i = 0; i < 4; i++) s += LETTERS[Math.floor(Math.random() * LETTERS.length)]; return s; };
export const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);

// Why a room could not be joined or opened: none (no such room), busy (its round has started), full, taken (that name is
// already hosted), net (could not reach it).
const fail = (kind, message) => Object.assign(new Error(message), { kind });
const REFUSED = { busy: 'That game has already started', full: 'That room is full' };

function baseRoom(host, code, pub) {
  return { host, code, public: !!pub, peers: [], closed: false, accepting: () => true, onJoin() {}, onLeave() {}, onMsg() {}, onClose() {} };
}

// ---------- WebRTC through PeerJS ----------
let peerLib = null;
function loadPeerJs() {
  if (window.Peer) return Promise.resolve(window.Peer);
  if (!peerLib) peerLib = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = PEERJS_URL; s.onload = () => (window.Peer ? res(window.Peer) : rej(fail('net', 'The networking library did not load')));
    s.onerror = () => { peerLib = null; rej(fail('net', 'Could not load the networking library. Check your connection.')); };
    document.head.appendChild(s);
  });
  return peerLib;
}
// A connection to the broker, under the given name (or any name).
const newPeer = (Peer, id) => new Promise((res, rej) => {
  const p = id ? new Peer(id) : new Peer();
  p.on('open', () => res(p));
  p.on('error', (e) => { try { p.destroy(); } catch (e2) { /* gone */ } rej(e && e.type === 'unavailable-id' ? fail('taken', 'That room code is already in use') : fail('net', 'Could not reach the matchmaking server')); });
});
// Connects to the room hosted under `id` and waits for its hello.
const joinPeer = (peer, id, wait) => new Promise((res, rej) => {
  const conn = peer.connect(id, { reliable: true, serialization: 'json' });
  let done = false;
  const stop = () => { done = true; clearTimeout(timer); peer.off('error', onErr); conn.off('data', first); };
  const no = (kind, msg) => { if (done) return; stop(); try { conn.close(); } catch (e) { /* gone */ } rej(fail(kind, msg)); };
  const onErr = (e) => (e && e.type === 'peer-unavailable' ? no('none', 'No room with that code') : no('net', 'Could not connect to the room'));
  const first = (d) => {
    if (done) return;
    const k = Array.isArray(d) ? d[0] : d;
    if (k === 'hi') { stop(); res(conn); } else no(REFUSED[k] ? k : 'net', REFUSED[k] || 'Could not join the room');
  };
  const timer = setTimeout(() => no('net', 'No answer from that room. Check the code; the host may also be behind a strict firewall.'), wait);
  peer.on('error', onErr); conn.on('data', first);
});
function peerRoom(peer, host, code, pub, hostConn) {
  const room = baseRoom(host, code, pub), conns = new Map(), fasts = new Map();
  const drop = (id) => { if (!conns.has(id)) return; conns.delete(id); fasts.delete(id); room.peers = [...conns.keys()]; if (!room.closed) room.onLeave(id); };
  const shut = (reason) => { if (room.closed) return; room.closed = true; try { peer.destroy(); } catch (e) { /* gone */ } room.onClose(reason); };
  // The fast channel: a second data channel on the same connection, unordered and with no re-sending. Both ends open it
  // under the same number ("negotiated"), so nothing has to be agreed first.
  const openFast = (conn, id) => {
    try {
      const ch = conn.peerConnection.createDataChannel('fast', { negotiated: true, id: 50, ordered: false, maxRetransmits: 0 });
      ch.onmessage = (e) => { if (room.closed) return; let m; try { m = JSON.parse(e.data); } catch (e2) { return; } room.onMsg(id, [m]); };
      fasts.set(id, ch);
    } catch (e) { /* no fast channel: everything goes the reliable way */ }
  };
  const wire = (conn, id) => {
    openFast(conn, id);
    conn.on('data', (d) => { if (!room.closed) room.onMsg(id, d); });
    conn.on('close', () => (host ? drop(id) : shut('The host left the game')));
    conn.on('error', () => (host ? drop(id) : shut('Lost the connection to the host')));
  };
  room.close = () => { if (room.closed) return; room.closed = true; try { peer.destroy(); } catch (e) { /* gone */ } };
  room.buffered = (id) => { const c = conns.get(id); return c && c.dataChannel ? c.dataChannel.bufferedAmount : 0; };
  room.send = (id, msg) => { const c = conns.get(id); if (c && c.open) { try { c.send(msg); } catch (e) { /* closing */ } } };
  room.sendFast = (id, msg) => {
    const ch = fasts.get(id);
    if (!ch || ch.readyState !== 'open') return false;
    if (ch.bufferedAmount < 1200) { try { ch.send(JSON.stringify(msg)); } catch (e) { /* closing */ } }      // the last one has not left yet: the link is busy, so skip this one
    return true;
  };
  room.fastState = (id) => { const ch = fasts.get(id); return ch ? ch.readyState : 'none'; };       // for debugging
  room.broadcast = (msg) => { for (const id of conns.keys()) room.send(id, msg); };
  if (host) {
    peer.on('connection', (conn) => conn.on('open', () => {
      const why = conns.size >= MAX_PLAYERS - 1 ? 'full' : !room.accepting() ? 'busy' : null;
      if (why) { try { conn.send([why]); } catch (e) { /* gone */ } setTimeout(() => { try { conn.close(); } catch (e) { /* gone */ } }, 400); return; }
      conn.send(['hi']);
      conns.set(conn.peer, conn); room.peers = [...conns.keys()]; wire(conn, conn.peer); room.onJoin(conn.peer);
    }));
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* the broker is only needed for new joiners */ } });
  } else { conns.set('host', hostConn); room.peers = ['host']; wire(hostConn, 'host'); }
  addEventListener('pagehide', () => room.close());
  return room;
}
async function openPeerRoom({ host, code }) {
  const Peer = await loadPeerJs();
  if (!host) {
    const peer = await newPeer(Peer);
    try { return peerRoom(peer, false, code, false, await joinPeer(peer, PREFIX + code, 12000)); } catch (e) { try { peer.destroy(); } catch (e2) { /* gone */ } throw e; }
  }
  for (let tries = 0; tries < 5; tries++) {
    const c = code || makeCode();
    try { return peerRoom(await newPeer(Peer, PREFIX + c), true, c, false); } catch (e) { if (e.kind !== 'taken' || code) throw e; }     // that code is in use: roll another
  }
  throw fail('net', 'Could not open a room. Try again.');
}
async function openPeerPublic() {
  const Peer = await loadPeerJs(), peer = await newPeer(Peer);
  for (let i = 1; i <= PUBLIC_ROOMS; i++) {
    const code = 'pub' + i;
    try { return peerRoom(peer, false, code, true, await joinPeer(peer, PREFIX + code, 6000)); } catch (e) {
      if (e.kind !== 'none') continue;                         // full, already playing or unreachable: try the next one
      try { const mine = await newPeer(Peer, PREFIX + code); try { peer.destroy(); } catch (e2) { /* gone */ } return peerRoom(mine, true, code, true); }
      catch (e2) { if (e2.kind !== 'taken') { try { peer.destroy(); } catch (e3) { /* gone */ } throw e2; } }       // somebody opened it this instant: move on
    }
  }
  try { peer.destroy(); } catch (e) { /* gone */ }
  throw fail('full', 'Every public game is full or already playing. Try again in a minute, or host a private room.');
}

// ---------- BroadcastChannel between tabs (testing) ----------
async function openLocalRoom({ host, code, pub }) {
  const room = baseRoom(host, code || makeCode(), pub);
  const me = host ? 'host' : 'p' + Math.random().toString(36).slice(2, 8);
  const ch = new BroadcastChannel(PREFIX + room.code);
  const known = new Set();
  const post = (to, kind, msg) => ch.postMessage({ from: me, to, kind, msg });
  room.buffered = () => 0;
  room.send = (id, msg) => post(id, 'msg', msg);
  room.sendFast = (id, msg) => { post(id, 'msg', [msg]); return true; };
  room.broadcast = (msg) => { for (const id of known) post(id, 'msg', msg); };
  room.close = () => { if (room.closed) return; room.closed = true; post('*', 'bye'); ch.close(); };
  const joined = new Promise((res, rej) => {
    const timer = host ? 0 : setTimeout(() => rej(fail('none', 'No room with that code')), 700);
    ch.onmessage = (e) => {
      const m = e.data;
      if (!m || (m.to !== me && m.to !== '*') || room.closed) return;
      if (m.kind === 'hello' && host) {
        const why = known.size >= MAX_PLAYERS - 1 ? 'full' : !room.accepting() ? 'busy' : null;
        if (why) { post(m.from, why); return; }
        known.add(m.from); room.peers = [...known]; post(m.from, 'welcome'); room.onJoin(m.from);
      } else if (m.kind === 'welcome' && !host) { clearTimeout(timer); known.add('host'); room.peers = ['host']; res(); }
      else if (REFUSED[m.kind] && !host) { clearTimeout(timer); rej(fail(m.kind, REFUSED[m.kind])); }
      else if (m.kind === 'bye') {
        if (!known.has(m.from)) return;
        known.delete(m.from); room.peers = [...known];
        if (host) room.onLeave(m.from); else { room.closed = true; ch.close(); room.onClose('The host left the game'); }
      } else if (m.kind === 'msg' && known.has(m.from)) room.onMsg(m.from, m.msg);
    };
    if (host) res(); else post('host', 'hello');
  });
  await joined.catch((e) => { ch.close(); throw e; });
  addEventListener('pagehide', () => room.close());
  return room;
}
async function openLocalPublic() {
  for (let i = 1; i <= PUBLIC_ROOMS; i++) {
    const code = 'pub' + i;
    try { return await openLocalRoom({ host: false, code, pub: true }); } catch (e) { if (e.kind === 'none') return openLocalRoom({ host: true, code, pub: true }); }
  }
  throw fail('full', 'Every public game is full or already playing. Try again in a minute, or host a private room.');
}

const local = () => new URLSearchParams(location.search).get('net') === 'local';
export const openRoom = (opt) => (local() ? openLocalRoom(opt) : openPeerRoom(opt));
export const openPublicRoom = () => (local() ? openLocalPublic() : openPeerPublic());
