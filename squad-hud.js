// THE SIX, ON THE ROUND'S HUD. A column down the right edge: the player's six best monsters as they stand right now
// (after merging: arena-merge.js works it out, this only draws it), and under them a hexagon of what the rest of the
// collection adds to those six.
//
// Nothing here is written out in words. A card is a portrait in a ring; the ring fills as the player closes in on
// that monster's next form or star, and bursts when it gets there. A small badge shows what it is becoming (the
// next form in silhouette, or a star). Every critter rolled up visibly goes somewhere: a spark flies from the ball
// to the card it feeds, or to the corner of the hexagon it raises.
//
//   createSquadHud({ root, faceOf, typeColor, origin, sfx })
//     faceOf(spec)    -> an image URL for a portrait ('' while there is none yet)
//     typeColor(type) -> a CSS colour
//     origin()        -> { x, y } on screen: where the ball is (sparks start there)
//     sfx             -> { evolve(stars), back(), ping(stat) }, all optional
//   .set(plan)   show this plan (from planArmy); what changed since the last one is animated
//   .step(dt)    once a frame       .reset()   a new round       .show(on)       .refresh()  redraw the portraits
//
// The hexagon is also drawn before the arena fight (arena-battle.js), so its drawing is exported: hexSvg().
import { BONUS_STAT_MAX, SQUAD, teamPower } from './arena-merge.js';

export const STAT_COL = ['#ff5a5a', '#ff9d42', '#f2c230', '#5aa2ff', '#4fc98a', '#ff7ab8'];      // HP, Attack, Defence, Sp. Atk, Sp. Def, Speed
const STAT_ICON = [                                             // a heart, a sword, a shield, a spark, a ward, an arrow
  '<path d="M12 20.5C5 15.5 2.5 12 2.5 8.7 2.5 6 4.6 4 7.2 4c1.9 0 3.6 1 4.8 2.7C13.2 5 14.9 4 16.8 4c2.6 0 4.7 2 4.7 4.7 0 3.3-2.5 6.8-9.5 11.8z"/>',
  '<path d="M20.5 2.5l1 1L12 14l-2-2zM6.6 11.4l6 6-1.5 1.5-6-6zM7 15.6l1.4 1.4-3.9 3.9-1.4-1.4z"/>',
  '<path d="M12 2.8l7.6 2.6v5.7c0 4.7-3.1 8.2-7.6 10.1-4.5-1.9-7.6-5.4-7.6-10.1V5.4z"/>',
  '<path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6-2.6 7.9-2.6-7.9L1.500 12l7.9-2.6z"/>',
  '<path fill-rule="evenodd" d="M12 2.5a9.500 9.500 0 1 0 0 19 9.500 9.500 0 0 0 0-19zm0 4a5.500 5.500 0 1 1 0 11 5.500 5.500 0 0 1 0-11z"/><circle cx="12" cy="12" r="2.6"/>',
  '<path d="M3.500 4.500l8 7.500-8 7.500zM12.500 4.500l8 7.500-8 7.500z"/>',
];
const DARK = '#2b2540';
export const STAT_SHORT = ['HP', 'ATK', 'DEF', 'SP.ATK', 'SP.DEF', 'SPEED'];
// one stat's badge, as an SVG string (for the arena's ceremony)
export const statIcon = (i) => `<svg class="st-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="${STAT_COL[i]}" stroke="${DARK}" stroke-width="2.4"/><g transform="translate(5.3 5.3) scale(.56)" fill="#fff">${STAT_ICON[i]}</g></svg>`;
const AX = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI * 2 * i / 6 - Math.PI / 2; return [Math.cos(a), Math.sin(a)]; });       // HP at the top, then clockwise
const R_IN = 5, R_OUT = 39, R_ICON = 49;
const hexPts = (r) => AX.map(([x, y], i) => ((Array.isArray(r) ? r[i] : r) * x).toFixed(1) + ',' + ((Array.isArray(r) ? r[i] : r) * y).toFixed(1)).join(' ');
const radius = (v) => R_IN + (R_OUT - R_IN) * Math.max(0, Math.min(1, v));

// The hexagon as an SVG string, and a function to move it. Values are 0..1 (from hexValues).
export function hexSvg() {
  let s = `<svg viewBox="-60 -60 120 120"><polygon class="hx-plate" points="${hexPts(R_OUT + 5)}"/>`;
  s += `<polygon class="hx-guide" points="${hexPts(radius(0.5))}"/><polygon class="hx-guide" points="${hexPts(radius(1))}"/>`;
  for (const [x, y] of AX) s += `<line class="hx-guide" x1="0" y1="0" x2="${(R_OUT * x).toFixed(1)}" y2="${(R_OUT * y).toFixed(1)}"/>`;
  s += `<polygon class="hx-fill" points="${hexPts(R_IN)}"/>`;
  AX.forEach(([x, y], i) => { s += `<g class="hx-ico" data-i="${i}" transform="translate(${(R_ICON * x).toFixed(1)} ${(R_ICON * y).toFixed(1)})"><g><circle r="8" fill="${STAT_COL[i]}"/><g transform="translate(-5.400 -5.400) scale(.45)" fill="#fff">${STAT_ICON[i]}</g></g></g>`; });
  return s + '<text class="hx-num" x="0" y="5.5" text-anchor="middle"></text></svg>';
}
// values: 0..1 per corner (from hexValues). text: what to write in the middle (the team's power), if anything.
export function hexDraw(svg, values, text) {
  svg.querySelector('.hx-fill').setAttribute('points', hexPts(values.map(radius)));
  if (text !== undefined) { const t = svg.querySelector('.hx-num'); if (t.textContent !== text) t.textContent = text; }
}
export const powerText = (bonus) => { const p = Math.round(teamPower(bonus) * 100); return p > 0 ? '+' + p + '%' : ''; };
// The frame is the most ONE stat can ever be given, which an even collection never comes near: so what is drawn is a
// shape, not a bar that fills. (On a slight curve, so that the first few critters already show.)
export const hexValues = (bonus) => bonus.map((b) => Math.pow(Math.max(0, Math.min(1, b / BONUS_STAT_MAX)), 0.75));
export const HEX_STYLE = `
.hx-plate { fill: rgba(255,250,240,.93); stroke: ${DARK}; stroke-width: 2.6; stroke-linejoin: round; }
.hx-guide { fill: none; stroke: rgba(43,37,64,.16); stroke-width: 1; }
.hx-fill { fill: rgba(255,181,46,.78); stroke: ${DARK}; stroke-width: 2; stroke-linejoin: round; }
.hx-ico circle { stroke: ${DARK}; stroke-width: 2; }
.hx-num { font: 800 15px "Trebuchet MS", "Segoe UI", sans-serif; fill: #fff; stroke: ${DARK}; stroke-width: 4.5px; paint-order: stroke fill; stroke-linejoin: round; }
.hx-ico > g { transform-box: fill-box; transform-origin: center; }
.hx-ico.ping > g { animation: hxping .5s cubic-bezier(.2,1.6,.4,1); }
@keyframes hxping { 0% { transform: scale(1); } 30% { transform: scale(1.75); filter: brightness(1.5) drop-shadow(0 0 5px #fff); } 100% { transform: scale(1); } }`;

const STYLE = `
#squad { position: absolute; right: 14px; top: 14px; --c: clamp(40px, 8.4vh, 68px); width: calc(var(--c) * 1.7); pointer-events: none; }
#squad .sq-cards { position: relative; height: calc(var(--c) * 6.72); margin: 0 auto; width: var(--c); }
#squad .sq-slot { position: absolute; left: 0; width: var(--c); height: var(--c); border-radius: 50%; border: 3px dashed rgba(43,37,64,.4); background: rgba(255,255,255,.2); box-sizing: border-box; }
.sq-card { position: absolute; left: 0; top: 0; width: var(--c); height: var(--c); transition: transform .4s cubic-bezier(.3,1.3,.5,1), opacity .3s; will-change: transform; }
.sq-card .sq-in { position: absolute; inset: 0; border-radius: 50%; }
.sq-card .sq-disc { position: absolute; inset: 9%; border-radius: 50%; border: 2px solid ${DARK}; overflow: hidden; box-shadow: 0 3px 0 rgba(43,37,64,.35); }
.sq-card img.sq-face { position: absolute; left: -6%; top: -6%; width: 112%; height: 112%; object-fit: contain; }
.sq-card svg.sq-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.sq-ring .bg { fill: none; stroke: ${DARK}; stroke-width: 15; }
.sq-ring .tr { fill: none; stroke: #fffaf0; stroke-width: 10; }
.sq-ring .fg { fill: none; stroke: #ffb52e; stroke-width: 10; stroke-linecap: round; stroke-dasharray: 0 290; transition: stroke-dasharray .35s ease-out, stroke .3s; }
.sq-card.full .sq-ring .fg { stroke: #ffd23f; filter: drop-shadow(0 0 3px #ffd23f); }
.sq-card .sq-stars { position: absolute; left: 50%; top: -9%; transform: translateX(-50%); white-space: nowrap; font-size: calc(var(--c) * .25); line-height: 1; color: #ffd23f; -webkit-text-stroke: 3px ${DARK}; paint-order: stroke fill; letter-spacing: -1px; }
.sq-card .sq-goal { position: absolute; left: -22%; bottom: -4%; width: 44%; height: 44%; border-radius: 50%; background: #fffaf0; border: 2px solid ${DARK}; box-sizing: border-box; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: calc(var(--c) * .27); line-height: 1; color: #ffd23f; -webkit-text-stroke: 2.5px ${DARK}; paint-order: stroke fill; }
.sq-card .sq-goal img { width: 118%; height: 118%; object-fit: contain; filter: brightness(0) opacity(.6); }
.sq-card .sq-goal.near { animation: sqnear .5s infinite alternate; } @keyframes sqnear { from { transform: scale(1); } to { transform: scale(1.22); background: #ffe169; } }
.sq-card .sq-flash { position: absolute; inset: 0; border-radius: 50%; background: #fff; opacity: 0; }
.sq-card .sq-burst { position: absolute; inset: 0; border-radius: 50%; border: 4px solid #ffd23f; opacity: 0; box-sizing: border-box; }
.sq-card.in .sq-in { animation: sqin .4s cubic-bezier(.2,1.5,.4,1); } @keyframes sqin { from { transform: scale(.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.sq-card.out { opacity: 0; }
.sq-card.evo { z-index: 3; } .sq-card.evo .sq-in { animation: sqevo .9s cubic-bezier(.2,1.4,.4,1); } .sq-card.evo .sq-flash { animation: sqflash .9s ease-out; } .sq-card.evo .sq-burst { animation: sqburst .8s ease-out .12s; }
@keyframes sqevo { 0% { transform: scale(1); } 16% { transform: scale(.72) rotate(-8deg); } 34% { transform: scale(1.6) rotate(5deg); } 60% { transform: scale(1.18); } 100% { transform: scale(1); } }
@keyframes sqflash { 0% { opacity: 0; } 14% { opacity: 1; } 34% { opacity: 1; } 100% { opacity: 0; } }
@keyframes sqburst { 0% { opacity: 1; transform: scale(.8); } 100% { opacity: 0; transform: scale(2.7); border-width: 1px; } }
.sq-card.back .sq-in { animation: sqback .5s ease-out; } @keyframes sqback { 0% { transform: translateX(0); filter: grayscale(1) brightness(.7); } 20% { transform: translateX(-7px) rotate(-6deg); } 45% { transform: translateX(6px) rotate(5deg); } 70% { transform: translateX(-3px); } 100% { transform: none; filter: none; } }
.sq-card.fed .sq-in { animation: sqfed .3s ease-out; } @keyframes sqfed { 0% { transform: scale(1); } 35% { transform: scale(1.16); filter: brightness(1.25); } 100% { transform: scale(1); } }
#squad .sq-hex { width: 100%; margin-top: calc(var(--c) * .1); } #squad .sq-hex svg { display: block; width: 100%; overflow: visible; filter: drop-shadow(0 3px 0 rgba(43,37,64,.3)); }
.sq-spark { position: fixed; left: 0; top: 0; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; border: 2px solid ${DARK}; box-sizing: border-box; pointer-events: none; z-index: 4; box-shadow: 0 0 10px 2px rgba(255,255,255,.9); }
${HEX_STYLE}`;

const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
const RING = 2 * Math.PI * 43;
const TRAVEL = 460;                   // ms a spark is in the air: what it feeds changes when it lands

export function createSquadHud({ root, faceOf, typeColor = () => '#ccc', origin = null, sfx = {} }) {
  if (!document.getElementById('squad-style')) { const st = el('style', '', document.head); st.id = 'squad-style'; st.textContent = STYLE; }
  const box = el('div', '', root); box.id = 'squad';
  const cardsEl = el('div', 'sq-cards', box);
  for (let i = 0; i < SQUAD; i++) el('div', 'sq-slot', cardsEl).style.top = `calc(var(--c) * ${(i * 1.12).toFixed(2)})`;
  const hexEl = el('div', 'sq-hex', box, hexSvg()), hexSvgEl = hexEl.firstChild, icons = [...hexEl.querySelectorAll('.hx-ico')];
  const cards = new Map();            // id -> card
  let shown = null, hexNow = [0, 0, 0, 0, 0, 0], hexTo = [0, 0, 0, 0, 0, 0], sparks = 0, visible = true, laterN = 0, powNow = '', powNext = '';
  const pulse = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

  function makeCard(id) {
    const root1 = el('div', 'sq-card', cardsEl), inner = el('div', 'sq-in', root1);
    inner.innerHTML = `<svg class="sq-ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="43"/><circle class="tr" cx="50" cy="50" r="43"/><circle class="fg" cx="50" cy="50" r="43"/></svg><div class="sq-disc"><img class="sq-face" alt=""></div><div class="sq-stars"></div><div class="sq-goal"></div><div class="sq-flash"></div><div class="sq-burst"></div>`;
    const c = { id, root: root1, fg: inner.querySelector('.fg'), disc: inner.querySelector('.sq-disc'), face: inner.querySelector('.sq-face'), stars: inner.querySelector('.sq-stars'), goal: inner.querySelector('.sq-goal'), entry: null, slot: -1, ring: -1, faceUrl: null, goalKey: null };
    cards.set(id, c);
    return c;
  }
  const place = (c, slot) => { if (c.slot !== slot) { c.slot = slot; c.root.style.transform = `translateY(calc(var(--c) * ${(slot * 1.12).toFixed(2)}))`; } };
  function setRing(c, v) {
    if (c.ring === v) return;
    c.ring = v;
    c.fg.style.strokeDasharray = `${(RING * v).toFixed(1)} ${RING.toFixed(1)}`;
    c.root.classList.toggle('full', v >= 1);
    c.goal.classList.toggle('near', v >= 0.66 && v < 1);
  }
  function paint(c, r) {              // everything about a card but its ring
    c.entry = r;
    const url = faceOf(r.spec) || '';
    if (c.faceUrl !== url) { c.faceUrl = url; if (url) c.face.src = url; c.face.style.visibility = url ? '' : 'hidden'; }
    c.disc.style.background = `radial-gradient(circle at 50% 35%, #fff 0%, ${typeColor(r.spec.types[0])} 130%)`;
    const st = '★'.repeat(r.stars || 0);
    if (c.stars.textContent !== st) c.stars.textContent = st;
    const g = r.goal, gk = !g ? '' : g.stars ? 'star' : 'f' + (g.spec ? g.spec.dex : 0) + (g.spec ? faceOf(g.spec) || '' : '');
    if (c.goalKey !== gk) { c.goalKey = gk; c.goal.style.display = g ? '' : 'none'; if (g) c.goal.innerHTML = g.stars ? '★' : `<img alt="" src="${(g.spec && faceOf(g.spec)) || ''}">`; }
  }
  function spark(to, color, done) {
    const o = origin ? origin() : null;
    if (!o || !visible || sparks >= 10 || document.hidden) { if (done) done(); return false; }
    const b = to.getBoundingClientRect(), x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    const dx = x1 - o.x, dy = y1 - o.y, bend = 0.22 + Math.random() * 0.12;
    const mx = o.x + dx * 0.45 - dy * bend, my = o.y + dy * 0.45 + dx * bend * 0.4 - 30;
    const s = el('i', 'sq-spark', document.body); s.style.background = color;
    sparks++;
    const a = s.animate([{ transform: `translate(${o.x}px,${o.y}px) scale(.4)`, opacity: 0.2 }, { transform: `translate(${mx}px,${my}px) scale(1.5)`, opacity: 1, offset: 0.4 }, { transform: `translate(${x1}px,${y1}px) scale(.7)`, opacity: 1 }], { duration: TRAVEL, easing: 'cubic-bezier(.35,0,.7,1)' });
    // (a tab that is not being drawn never finishes an animation: the timer makes sure what the spark feeds still moves)
    let landed = false;
    const land = () => { if (landed) return; landed = true; s.remove(); sparks--; if (done) done(); };
    a.onfinish = a.oncancel = land; setTimeout(land, TRAVEL + 200);
    return true;
  }
  // identities: the n-th monster of a kind keeps its card while it stays in the six
  function idsOf(roster) { const n = {}; return roster.map((r) => r.kind + '#' + (n[r.kind] = (n[r.kind] || 0) + 1)); }

  function set(plan, { quiet = false } = {}) {
    const roster = plan.roster.slice(0, SQUAD), ids = idsOf(roster), old = shown;
    shown = plan;
    const gone = [...cards.values()].filter((c) => !ids.includes(c.id));
    let evolved = null, lost = false; const fed = [];
    roster.forEach((r, i) => {
      let c = cards.get(ids[i]), fresh = false;
      if (!c) {
        // a card that has just become this one (its next form, or the form it has fallen back to) turns into it
        // where it stands; anything else arrives new
        const up = gone.findIndex((g) => g.entry && g.entry.goal && goalKind(g.entry) === r.kind), down = up < 0 ? gone.findIndex((g) => g.entry && goalKind(r) === g.entry.kind) : -1;
        const from = up >= 0 ? gone.splice(up, 1)[0] : down >= 0 ? gone.splice(down, 1)[0] : null;
        if (from) { cards.delete(from.id); from.id = ids[i]; cards.set(from.id, from); c = from; }
        else { c = makeCard(ids[i]); fresh = true; }
        if (!quiet) {
          if (up >= 0 || (fresh && r.made > 1)) { evolved = evolved || r; pulse(c.root, 'evo'); const p = c; setTimeout(() => { if (p.entry === r) paint(p, r); }, 130); c.entry = r; setRing(c, 0); }
          else if (down >= 0) { lost = true; pulse(c.root, 'back'); }
          else pulse(c.root, 'in');
        }
        if (!(up >= 0 && !quiet)) paint(c, r);
      } else {
        if (!quiet && old && r.ring > c.ring + 0.001) fed.push(c);
        paint(c, r);
      }
      place(c, i);
    });
    for (const c of gone) { cards.delete(c.id); c.root.classList.add('out'); setTimeout(() => c.root.remove(), 320); }
    // ---- what the rest of the collection adds
    const to = hexValues(plan.bonus), grew = [];
    powNext = powerText(plan.bonus);
    if (old && !quiet) to.forEach((v, i) => { if (v > hexTo[i] + 1e-4) grew.push([v - hexTo[i], i]); });
    grew.sort((a, b) => b[0] - a[0]);
    // ---- sparks: to the card that was fed, else to the corners that grew most. What they feed moves when they land.
    const n = ++laterN, showPow = () => { if (powNow !== powNext) { powNow = powNext; hexDraw(hexSvgEl, hexNow, powNow); } }, rings = () => { if (n !== laterN) return; roster.forEach((r, i) => { const c = cards.get(ids[i]); if (c) setRing(c, r.ring); }); };
    const hex = () => { if (n === laterN) { hexTo = to; showPow(); } };
    if (quiet) { rings(); hexTo = to; hexNow = to.slice(); showPow(); hexDraw(hexSvgEl, hexNow); return; }
    if (evolved) { if (sfx.evolve) sfx.evolve(evolved.stars || 0); setTimeout(rings, 420); } else if (fed.length) { const c = fed[0]; spark(c.root, '#ffd23f', () => { rings(); pulse(c.root, 'fed'); }); } else rings();
    if (lost && sfx.back) sfx.back();
    if (grew.length && !evolved && !fed.length) {
      let first = true;
      for (const [, i] of grew.slice(0, 2)) { const lead = first; first = false; spark(icons[i], STAT_COL[i], () => { if (lead) hex(); pulse(icons[i], 'ping'); if (lead && sfx.ping) sfx.ping(i); }); }
    } else hex();
  }
  const goalKind = (r) => (r.goal ? r.goal.kind : null);

  return {
    set,
    step(dt) {
      let moved = false;
      for (let i = 0; i < 6; i++) { const d = hexTo[i] - hexNow[i]; if (Math.abs(d) > 0.0005) { hexNow[i] += d * Math.min(1, dt * 9); moved = true; } }
      if (moved) hexDraw(hexSvgEl, hexNow);
    },
    refresh() { for (const c of cards.values()) if (c.entry) paint(c, c.entry); },
    reset() { for (const c of cards.values()) c.root.remove(); cards.clear(); shown = null; laterN++; hexNow = [0, 0, 0, 0, 0, 0]; hexTo = [0, 0, 0, 0, 0, 0]; powNow = powNext = ''; hexDraw(hexSvgEl, hexNow, ''); },
    show(on) { if (visible !== on) { visible = on; box.style.display = on ? '' : 'none'; } },
    get plan() { return shown; },
    el: box,
  };
}
