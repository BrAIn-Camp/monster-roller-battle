// The end-of-round ARENA BATTLE: a wheel picks one of eight themed arenas, then the four armies brawl in it
// while each team's trainer pushes a ball around that scoops up small enemy critters. Fixed camera, minigame feel.
//
//   createWheel({ arenas, pickIndex, teams, sfx })  -> full-screen wheel overlay, then a result card
//   createBattle({ arena, teams, buildMesh, ... })  -> the battle itself (scene + camera + its own DOM HUD)
//
// Combat maths are the same as the old battle.js: a critter's strength comes from the six base stats of its dex
// slot, the square root of its height, and type match-ups (it attacks with whichever of its types is best).
// On top of that every arena FAVOURS three types: favoured critters hit harder, take less, move a little faster,
// wear a gold ring, and are immune to the arena's own hazard (balls never are).
import * as THREE from 'three';
import { STATS, TYPE_CHART } from './critters/battle-data.js';

// ---------- tuning ----------
const INTRO = 3.0;            // seconds: armies pop in, arena card shown
const COUNT_STEP = 0.8;       // seconds per "3", "2", "1"
const TIME_LIMIT = 75;        // seconds of fighting before it is decided on remaining health fraction
const FREEZE = 1.2, CHEER = 4.0;                      // "FINISH!" freeze, then the winners' celebration
const HP_SCALE = 10, DMG_BASE = 8, DMG_RATIO = 22;    // as battle.js
const FAV_DMG = 1.25, FAV_TAKEN = 0.8, FAV_SPEED = 1.1;   // the favoured-type edge
const FIELD_CAP = 60;         // critters per team on the floor at once; the rest wait in reserve (strongest first)
const REINFORCE_EVERY = 0.3;  // seconds between reinforcements walking in at a team's corner
const ARENA_MIN = 26, ARENA_MAX = 70;                 // arena side, metres
// Sizes are compressed for the fixed camera: nothing is drawn taller than MAX_H_FRAC of the arena side (titans are
// scaled DOWN) or smaller than MIN_H_FRAC (specks are scaled up). Stats still use the real height.
const MAX_H_FRAC = 0.22, MIN_H_FRAC = 0.016;
const SCOOP_RATIO = 0.5;      // a ball scoops enemy critters no taller than this x its diameter
const SCOOP_GROW = 0.8;       // ball volume gained per scoop = this x height^3
const SCOOP_GULP = 0.7;       // seconds after a scoop before the ball can scoop again (its ground ring swells while it is "full")
const SCOOP_DRAG = 0.35;      // and each scoop costs it this share of its speed
const BALL_SPREAD = 0.6;      // the biggest finishing ball starts up to (1 + this) x the base ball
const BALL_MAX_GROW = 1.8;    // a ball never grows past this x its starting diameter (or 20% of the arena)
const BALL_GRIP = 4.5;        // how quickly a ball's velocity follows the stick (ice arena: 1.25)
const DASH_MULT = 2.0, DASH_TIME = 0.4, DASH_CD = 2.2;
const CPU_SPEED = 0.9;        // CPU balls are a touch slower, think every CPU_THINK seconds, and aim with a wobble
const CPU_THINK = [0.35, 0.65];
const CLASH_STUN = 1.0;       // seconds the loser of a ball clash is stunned (then 1.5 s of immunity)
const STICKERS = 40;          // scooped critters drawn on a ball
const CAM_FOV = 36, CAM_ELEV = 1.06;                  // fixed camera: field of view (deg), elevation above the floor (rad)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HAS_DOM = typeof document !== 'undefined';
const TYPE_FALLBACK = { normal: '#a8a090', fire: '#f2743a', water: '#4a9be8', grass: '#57b65a', electric: '#e9bf2a', ice: '#7fd0d8', fighting: '#c0503a', poison: '#a05ab8', ground: '#c9a35a', flying: '#8fa8e8', psychic: '#f06a9a', bug: '#9bbf3b', rock: '#a08b6a', ghost: '#6f5aa8', dragon: '#6a5ae0' };
const typeColor = (t) => ((typeof window !== 'undefined' && window.ROLLUP_DATA && window.ROLLUP_DATA.TYPE_COLORS) || TYPE_FALLBACK)[t] || '#888';
const chip = (t) => `<span class="ar-chip" style="background:${typeColor(t)}">${t}</span>`;
const css = (hex) => '#' + hex.toString(16).padStart(6, '0');
const DEF = [50, 50, 50, 50, 50, 50];

// ---------- arenas ----------
// floor/detail/wall/ground/sky are 0xRRGGBB; accent is the wheel-segment colour; hazard picks the quirk in makeHazard().
export const ARENAS = [
  { id: 'magma', name: 'Magma Bowl', types: ['fire', 'rock', 'ground'], blurb: 'Lava vents fill up, then blow. Stay off the glowing circles!', hazardName: 'Lava vents', hazard: 'vents', floor: 0x5c4646, detail: 0xff6a1a, wall: 0x2e2323, ground: 0x241a1a, sky: 0x1c1212, accent: 0xf2743a },
  { id: 'tidal', name: 'Tidal Deck', types: ['water', 'ice', 'dragon'], blurb: 'Big waves roll across the deck and carry everything with them.', hazardName: 'Rolling waves', hazard: 'wave', floor: 0xc99b62, detail: 0xa87b48, wall: 0x7a5a3a, ground: 0x2f8fd6, sky: 0x2f8fd6, accent: 0x4a9be8 },
  { id: 'canopy', name: 'Canopy Ring', types: ['grass', 'bug', 'poison'], blurb: 'Giant mushrooms puff sticky spores that slow whatever is inside.', hazardName: 'Spore puffs', hazard: 'spores', floor: 0x8ccb70, detail: 0x74b45c, wall: 0x6b4a2e, ground: 0x3f8a45, sky: 0x3f8a45, accent: 0x57b65a },
  { id: 'storm', name: 'Storm Spire', types: ['electric', 'flying', 'dragon'], blurb: 'Lightning strikes where the yellow marker closes. Balls get zapped!', hazardName: 'Lightning', hazard: 'lightning', floor: 0x8792a6, detail: 0xffe169, wall: 0x4f586b, ground: 0x394256, sky: 0x2c3345, accent: 0xe9bf2a },
  { id: 'frost', name: 'Frost Rink', types: ['ice', 'water', 'psychic'], blurb: 'Polished ice: balls are fast, slippery and very hard to turn.', hazardName: 'Slippery ice', hazard: 'ice', floor: 0xc4ecf7, detail: 0xffffff, wall: 0x8fc9de, ground: 0xeef6fb, sky: 0xdff1fa, accent: 0x7fd0d8 },
  { id: 'dune', name: 'Dune Coliseum', types: ['ground', 'fighting', 'rock'], blurb: 'Sandstorm gusts shove everyone the way the big arrow points.', hazardName: 'Sandstorm gusts', hazard: 'gust', floor: 0xe6cf95, detail: 0xd4b672, wall: 0xb98f55, ground: 0xd9b877, sky: 0xd9b877, accent: 0xc9a35a },
  { id: 'hollow', name: 'Haunted Hollow', types: ['ghost', 'psychic', 'poison'], blurb: 'Drifting fog hides critters from rival balls and makes attacks miss.', hazardName: 'Drifting fog', hazard: 'fog', floor: 0x77718f, detail: 0x625c7a, wall: 0x3a3350, ground: 0x322c46, sky: 0x221d33, accent: 0x6f5aa8 },
  { id: 'meadow', name: 'Meadow Stadium', types: ['normal', 'flying', 'fighting'], blurb: 'A friendly pitch with four pinball bumpers. Boing!', hazardName: 'Bouncy bumpers', hazard: 'bumpers', floor: 0x8fd16a, detail: 0x7fc45c, wall: 0xf2efe6, ground: 0x69b052, sky: 0x9ad8f5, accent: 0x8fa8e8 },
];

// ---------- combat maths (from battle.js) ----------
export function typeMult(att, defs) { let m = 1; for (const d of defs) m *= (TYPE_CHART[att] && TYPE_CHART[att][d] !== undefined ? TYPE_CHART[att][d] : 1); return m; }
// One number for the scoreboard: base stat total scaled by size.
export function power(spec) { const b = STATS[spec.dex] || DEF; return (b[0] + b[1] + b[2] + b[3] + b[4] + b[5]) * Math.sqrt(spec.height) / 100; }
export const isFavoured = (arena, spec) => spec.types.some((t) => arena.types.includes(t));
export const favouredCount = (arena, army) => (army || []).reduce((n, s) => n + (isFavoured(arena, s) ? 1 : 0), 0);
function unitStats(spec, h, spdK) {          // h = height as drawn in the arena, spdK = arena-size speed factor
  const b = STATS[spec.dex] || DEF, m = Math.sqrt(spec.height), special = b[3] > b[1];
  return {
    maxHp: b[0] * HP_SCALE * m, atk: special ? b[3] : b[1], special, def: b[2], spd: b[4], m,
    interval: clamp(1.7 - b[5] / 140, 0.65, 1.6),        // faster critters attack more often
    speed: (1.4 + b[5] / 45 + h * 0.25) * spdK,          // and get there sooner
    range: special ? 3.5 + h : 0,                        // special attackers fight at range
  };
}

// ---------- DOM helpers and the shared style sheet ----------
function el(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
function setText(e, s) { if (e && e._t !== s) { e._t = s; e.textContent = s; } }
function replay(e, cls) { e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }     // restart a CSS animation
const STYLE = `
.ar-root{position:fixed;inset:0;pointer-events:none;overflow:hidden;font-family:"Trebuchet MS","Segoe UI",sans-serif;color:#2b2540;font-size:clamp(12px,1.12vw,21px);font-weight:800;z-index:20}
.ar-root *{box-sizing:border-box}
.ar-pill{background:rgba(255,255,255,.9);border:3px solid #2b2540;border-radius:1em;padding:.4em .8em;box-shadow:0 4px 0 rgba(43,37,64,.35)}
.ar-chip{display:inline-block;padding:.05em .6em;border-radius:.6em;color:#fff;font-size:.8em;margin:0 .15em;text-shadow:0 1px 0 rgba(0,0,0,.3);border:2px solid #2b2540}
.ar-dot{display:inline-block;width:.8em;height:.8em;border-radius:50%;border:2px solid #2b2540;margin-right:.4em;vertical-align:-.05em}
.ar-team{position:absolute;width:13.5em;line-height:1.25}
.ar-team.ar-c0{left:1em;bottom:1em}.ar-team.ar-c1{left:1em;top:1em}.ar-team.ar-c2{right:1em;top:1em}.ar-team.ar-c3{right:1em;bottom:1em}
.ar-team.ar-me{background:#fff9d9;border-color:#2b2540;box-shadow:0 4px 0 rgba(43,37,64,.35),0 0 0 3px #ffe169}
.ar-team.ar-isout{opacity:.6;filter:grayscale(.7)}
.ar-team .ar-out{display:none;float:right;background:#2b2540;color:#fff;border-radius:.5em;padding:0 .5em;font-size:.75em}
.ar-team.ar-isout .ar-out{display:inline-block}
.ar-hp{height:.8em;border:2px solid #2b2540;border-radius:.45em;background:#fff;overflow:hidden;margin:.25em 0}
.ar-hp i{display:block;height:100%;width:100%;transition:width .2s}
.ar-row{display:flex;justify-content:space-between;font-size:.82em;white-space:nowrap}
.ar-fv{color:#b07a00}
.ar-res{font-size:.72em;opacity:.7;font-weight:700;height:1.2em}
.ar-top{position:absolute;left:50%;top:1em;transform:translateX(-50%);text-align:center}
.ar-clock{display:inline-block;font-size:1.9em;min-width:3.4em;padding:.1em .5em}
.ar-clock.ar-low{background:#ffe169;color:#c22;animation:ar-pulse .5s ease-in-out infinite alternate}
.ar-name{margin-top:.45em;font-size:.86em;white-space:nowrap;padding:.25em .7em}
.ar-name small{opacity:.7;font-weight:700;margin-left:.5em}
.ar-big{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:9em;font-weight:900;color:#ffe169;white-space:nowrap;-webkit-text-stroke:.05em #2b2540;paint-order:stroke fill;text-shadow:0 .07em 0 #2b2540,0 0 .3em rgba(43,37,64,.5);opacity:0}
.ar-big.ar-small{font-size:5.2em}
.ar-big.ar-punch{animation:ar-punch .8s ease-out both}
.ar-big.ar-stay{animation:ar-stay .45s ease-out both}
.ar-sub{position:absolute;left:50%;top:58%;transform:translateX(-50%);white-space:nowrap;opacity:0;transition:opacity .3s}
.ar-sub.ar-on{opacity:1}
.ar-intro{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.6);text-align:center;padding:.8em 1.6em;opacity:0;transition:opacity .3s,transform .3s cubic-bezier(.3,1.5,.5,1);background:#fffaf0;border-width:4px;border-radius:1.4em}
.ar-intro.ar-on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.ar-intro h3{margin:0;font-size:2.4em}.ar-intro p{margin:.3em 0 0;font-weight:700;font-size:.95em;max-width:26em}
.ar-flag{position:absolute;transform:translate(-50%,-50%);color:#fff;padding:.15em .8em;border-radius:.8em;border:3px solid #2b2540;white-space:nowrap;text-shadow:0 1px 0 rgba(0,0,0,.35);transition:opacity .3s;text-align:center;box-shadow:0 4px 0 rgba(43,37,64,.35)}
.ar-flag small{display:block;font-size:.72em;font-weight:700}
.ar-pop{position:absolute;transform:translate(-50%,-50%);color:#fff;font-size:.95em;padding:.05em .6em;border-radius:.7em;border:2px solid #2b2540;white-space:nowrap;opacity:0;text-shadow:0 1px 0 rgba(0,0,0,.35)}
.ar-pop.ar-on{animation:ar-rise 1.2s ease-out both}
.ar-skip{position:absolute;right:1em;bottom:7.4em;font-size:.8em;background:#bfe7ff}
@keyframes ar-pulse{from{transform:scale(1)}to{transform:scale(1.14)}}
@keyframes ar-punch{0%{opacity:0;transform:translate(-50%,-50%) scale(2.8)}18%{opacity:1;transform:translate(-50%,-50%) scale(.88)}30%{transform:translate(-50%,-50%) scale(1.1)}42%{transform:translate(-50%,-50%) scale(1)}78%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}
@keyframes ar-stay{0%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}45%{opacity:1;transform:translate(-50%,-50%) scale(.9)}70%{transform:translate(-50%,-50%) scale(1.06)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes ar-rise{0%{opacity:0;margin-top:0;transform:translate(-50%,-50%) scale(.5)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;margin-top:-3.2em}}
.ar-wheel{z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2em;background:radial-gradient(circle,rgba(43,37,64,.5),rgba(43,37,64,.88))}
.ar-wtitle{font-size:1.9em;background:#ffe169;padding:.25em 1em}
.ar-wwrap{position:relative;width:min(66vh,60vw);height:min(66vh,60vw);transition:transform .45s,opacity .45s}
.ar-wwrap.ar-dim{transform:scale(.86);opacity:.4}
.ar-wwrap canvas{width:100%;height:100%;display:block;border-radius:50%;box-shadow:0 .5em 0 rgba(43,37,64,.5)}
.ar-ptr{position:absolute;left:50%;top:-3.5%;margin-left:-1.5em;width:0;height:0;border-left:1.5em solid transparent;border-right:1.5em solid transparent;border-top:3em solid #ffe169;filter:drop-shadow(0 3px 0 #2b2540) drop-shadow(0 -2px 0 #2b2540) drop-shadow(2px 0 0 #2b2540) drop-shadow(-2px 0 0 #2b2540);transform-origin:50% -2.4em}
.ar-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.4);opacity:0;transition:opacity .25s,transform .35s cubic-bezier(.3,1.6,.5,1);background:#fffaf0;border:4px solid #2b2540;border-radius:1.5em;padding:1.1em 1.8em;box-shadow:0 8px 0 rgba(43,37,64,.4);text-align:center;min-width:24em}
.ar-card.ar-on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.ar-card h3{margin:0;font-size:2.6em}.ar-card h4{margin:0;font-size:.9em;opacity:.65}
.ar-card p{margin:.35em 0 .6em;font-weight:700}
.ar-card table{margin:.7em auto 0;border-collapse:collapse;font-size:1.05em}
.ar-card td{padding:.15em .7em;text-align:left;white-space:nowrap}
.ar-lucky{background:#ffe169;border:2px solid #2b2540;border-radius:.6em;padding:0 .5em;font-size:.8em;margin-left:.4em}
`;
function injectStyle() { if (!HAS_DOM || document.getElementById('ar-style')) return; const s = document.createElement('style'); s.id = 'ar-style'; s.textContent = STYLE; document.head.appendChild(s); }
const isMe = (tm) => (tm.me === undefined ? !!tm.human : !!tm.me);       // human: steered by a player; me: the player at this screen
const teamLabel = (tm) => (isMe(tm) ? 'You' : tm.name);

// ====================================================================================================
//  THE WHEEL
// ====================================================================================================
const SPIN = 4.5, SETTLE = 0.7, CARD_AT = 0.25, CARD_TIME = 3.2, WHEEL_TURNS = 5;
export function createWheel({ arenas = ARENAS, pickIndex = 0, teams = [], sfx } = {}) {
  const n = arenas.length, pick = (((pickIndex | 0) % n) + n) % n, seg = Math.PI * 2 / n, arena = arenas[pick];
  const tone = (...a) => { try { if (sfx && sfx.tone) sfx.tone(...a); } catch (e) { /* no audio */ } };
  // The wheel turns clockwise by `ang`. Segment i is centred i * seg clockwise from the top, so it sits under the
  // pointer when ang = -i * seg (mod a turn). It stops a little off-centre and overshoots, then settles back.
  const jitter = (Math.random() - 0.5) * seg * 0.5, over = seg * 0.14, final = Math.PI * 2 * WHEEL_TURNS - pick * seg - jitter;
  const ease = (u) => (u < 0.15 ? 0.2093 * (u / 0.15) ** 2 : 0.2093 + 0.7907 * (1 - (1 - (u - 0.15) / 0.85) ** 3));   // speed up, then a long slow-down
  let t = 0, ang = 0, last = 0, flick = 0, carded = false, done = false, root = null, cv = null, ptr = null, wrap = null, card = null;

  if (HAS_DOM) {
    injectStyle();
    root = el('div', 'ar-root ar-wheel', document.body);
    el('div', 'ar-pill ar-wtitle', root, "Time's up! Spin for the arena");
    wrap = el('div', 'ar-wwrap', root);
    cv = el('canvas', '', wrap); cv.width = cv.height = 760;
    ptr = el('div', 'ar-ptr', wrap);
    const ctx = cv.getContext && cv.getContext('2d');
    if (ctx) {
      const C = 380, R = 368;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * seg, A = arenas[i];
        ctx.beginPath(); ctx.moveTo(C, C); ctx.arc(C, C, R, a - seg / 2, a + seg / 2); ctx.closePath();
        ctx.fillStyle = css(A.accent); ctx.fill();
        if (i % 2) { ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill(); }
        ctx.lineWidth = 6; ctx.strokeStyle = '#2b2540'; ctx.stroke();
        ctx.save(); ctx.translate(C, C); ctx.rotate(a);
        ctx.font = `800 ${n > 6 ? 30 : 36}px "Trebuchet MS","Segoe UI",sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2b2540'; ctx.strokeText(A.name, R - 62, 0);
        ctx.fillStyle = '#fff'; ctx.fillText(A.name, R - 62, 0);
        A.types.forEach((ty, k) => {                              // the three favoured types as dots on the rim
          const b = (k - (A.types.length - 1) / 2) * 0.115;
          ctx.beginPath(); ctx.arc(Math.cos(b) * (R - 30), Math.sin(b) * (R - 30), 15, 0, Math.PI * 2);
          ctx.fillStyle = typeColor(ty); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
        });
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(C, C, 46, 0, Math.PI * 2); ctx.fillStyle = '#ffe169'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#2b2540'; ctx.stroke();
      ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.stroke();
    }
    const counts = teams.map((tm) => favouredCount(arena, tm.army)), top = Math.max(0, ...counts);
    card = el('div', 'ar-card', root,
      `<h4>The arena is</h4><h3>${arena.name}</h3><p>${arena.blurb}</p><div>Favoured: ${arena.types.map(chip).join('')}</div><table>` +
      teams.map((tm, k) => `<tr><td><i class="ar-dot" style="background:${tm.css}"></i>${teamLabel(tm)}</td><td>★ ${counts[k]} favoured critter${counts[k] === 1 ? '' : 's'}<span style="opacity:.55;font-weight:700"> of ${(tm.army || []).length}</span>${top > 0 && counts[k] === top ? '<span class="ar-lucky">Lucky!</span>' : ''}</td></tr>`).join('') + '</table>');
  }
  return {
    get done() { return done; },
    get arena() { return arena; },
    step(dt) {
      if (done) return;
      t += dt;
      if (t < SPIN) ang = (final + over) * ease(t / SPIN);
      else if (t < SPIN + SETTLE) { const u = (t - SPIN) / SETTLE; ang = final + over * Math.cos(u * Math.PI * 3) * (1 - u) ** 2; }
      else ang = final;
      const idx = ((Math.round(-ang / seg) % n) + n) % n;
      if (idx !== last && t < SPIN) { last = idx; flick = 1; tone(1100, 800, 0.03, 'square', 0.1); }      // a tick per segment, so they slow with the wheel
      flick = Math.max(0, flick - dt * 9);
      if (cv) { cv.style.transform = `rotate(${ang.toFixed(4)}rad)`; ptr.style.transform = `rotate(${(-flick * 20).toFixed(1)}deg)`; }
      if (!carded && t >= SPIN + SETTLE + CARD_AT) {
        carded = true;
        tone(523, 523, 0.14, 'square', 0.16); tone(659, 659, 0.14, 'square', 0.16, 0.12); tone(784, 1047, 0.4, 'square', 0.18, 0.24);
        if (card) { card.classList.add('ar-on'); wrap.classList.add('ar-dim'); }
      }
      if (t >= SPIN + SETTLE + CARD_AT + CARD_TIME) done = true;
    },
    destroy() { if (root) { root.remove(); root = null; } done = true; },
  };
}

// ====================================================================================================
//  THE BATTLE
// ====================================================================================================
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 14), cone: new THREE.ConeGeometry(0.5, 1, 10),
  sph: new THREE.SphereGeometry(0.5, 14, 10), rock: new THREE.DodecahedronGeometry(0.5, 0),
  disc: new THREE.CircleGeometry(1, 30).rotateX(-Math.PI / 2), ring: new THREE.RingGeometry(0.78, 1, 30).rotateX(-Math.PI / 2),
  thin: new THREE.RingGeometry(0.9, 1, 30).rotateX(-Math.PI / 2), plane: new THREE.PlaneGeometry(1, 1), planeL: new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0),
};
const CORNERS = [[-1, 1], [-1, -1], [1, -1], [1, 1]];          // team 0 bottom-left of the screen, then clockwise
const backOut = (u) => 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;
const bounceOut = (u) => { const n = 7.5625, d = 2.75; return u < 1 / d ? n * u * u : u < 2 / d ? n * (u -= 1.5 / d) * u + 0.75 : u < 2.5 / d ? n * (u -= 2.25 / d) * u + 0.9375 : n * (u -= 2.625 / d) * u + 0.984375; };

// rand: the dice (a seeded one in multiplayer, so every machine fights the same fight); input(team) gives a player's stick;
// noSkip: no skipping (a multiplayer fight is stepped by the host).
export function createBattle({ arena = ARENAS[0], teams = [], buildMesh, buildBall, buildTrainer, poseTrainer, input, sfx, rand: dice, noSkip = false } = {}) {
  const rand = dice || Math.random, NT = teams.length;
  let quiet = false, auto = false, destroyed = false;           // quiet: no effects or sound (skip); auto: the human's ball is CPU-driven
  const tone = (...a) => { if (quiet) return; try { if (sfx && sfx.tone) sfx.tone(...a); } catch (e) { /* no audio */ } };
  const cry = (spec, vol) => { if (quiet) return; try { if (sfx && sfx.cry) sfx.cry(spec, vol); } catch (e) { /* no audio */ } };

  // ---- who fights: every army sorted strongest first; the first FIELD_CAP start on the floor, the rest are reserves
  const recs = teams.map((tm) => (tm.army || []).map((spec) => ({ spec, value: power(spec), fav: isFavoured(arena, spec) })).sort((a, b) => b.value - a.value));
  const onStart = recs.map((r) => Math.min(r.length, FIELD_CAP)), total = onStart.reduce((a, b) => a + b, 0);
  let biggest = 0; const realH = [];
  recs.forEach((r, k) => { for (let i = 0; i < r.length; i++) { if (i < onStart[k]) realH.push(r[i].spec.height); biggest = Math.max(biggest, r[i].spec.height); } });
  realH.sort((a, b) => a - b);
  const L = clamp(14 + 1.3 * Math.sqrt(total) + Math.min(biggest, 34) * 0.9, ARENA_MIN, ARENA_MAX);     // arena side, metres
  // Drawn height: scale everything up a little if the typical critter would be a speck from the fixed camera, then
  // clamp to [MIN_H_FRAC, MAX_H_FRAC] of the arena side, which is what shrinks titans.
  const median = realH.length ? realH[realH.length >> 1] : 1, zoom = clamp(L * 0.032 / median, 1, 2.5);
  const hOf = (spec) => clamp(spec.height * zoom, L * MIN_H_FRAC, L * MAX_H_FRAC);
  const spdK = clamp(L / 40, 0.8, 1.5);
  const maxHpAll = new Array(NT).fill(0), reserveHp = new Array(NT).fill(0), next = onStart.slice();     // next[k]: index of team k's next reserve
  recs.forEach((r, k) => r.forEach((c, i) => { c.h = hOf(c.spec); c.st = unitStats(c.spec, c.h, spdK); maxHpAll[k] += c.st.maxHp; if (i >= onStart[k]) reserveHp[k] += c.st.maxHp; }));

  // ---- ball sizes: "earned but compressed". The base ball can scoop about the smallest third of the starting field.
  const p33 = realH.length ? hOf({ height: realH[Math.floor(realH.length / 3)] }) : 1;
  const baseD = clamp(p33 / SCOOP_RATIO * 1.02, L * 0.05, L * 0.11);
  const finishD = teams.map((tm) => Math.max(0.05, +tm.ballD || 0.5)), loD = Math.min(...finishD, 1e9), spanD = Math.max(Math.log(Math.max(...finishD, loD) / loD), Math.log(4));
  const topSpeed0 = 4.5 + L * 0.13;                             // ball top speed before size, dash and arena factors

  // ---- scene, materials, helpers
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(arena.sky);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f7a, 1.9));
  const sun = new THREE.DirectionalLight(0xfff4d6, 1.7); sun.position.set(L * 0.4, L, L * 0.5); scene.add(sun);
  const camera = new THREE.PerspectiveCamera(CAM_FOV, 16 / 9, 0.5, 2000), camBase = new THREE.Vector3();
  const mats = new Map(), owned = [];
  const matOf = (Kind, tag, color, o) => { const key = tag + color + (o ? JSON.stringify(o) : ''); let m = mats.get(key); if (!m) { m = new Kind(Object.assign({ color }, o)); mats.set(key, m); } return m; };
  const lam = (color, o) => matOf(THREE.MeshLambertMaterial, 'L', color, o), bas = (color, o) => matOf(THREE.MeshBasicMaterial, 'B', color, o);
  const glass = (color, opacity) => bas(color, { transparent: true, opacity, depthWrite: false });
  const put = (geo, m, x, y, z, sx = 1, sy = sx, sz = sx, ry = 0, parent = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.y = ry; parent.add(o); return o; };
  let seed = 12345 + arena.id.length * 977 + arena.id.charCodeAt(0) * 31;
  const srand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };     // seeded: the dressing is the same every time
  const v3 = new THREE.Vector3(), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), col = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0);
  let T = 0, shake = 0;

  // ---- the arena: floor, rim, team corners, themed dressing outside the play area
  const half = L / 2;
  put(GEO.box, lam(arena.ground), 0, -0.6, 0, L * 8, 0.6, L * 8);
  put(GEO.box, lam(arena.floor), 0, -0.2, 0, L, 0.4, L);
  for (const [x, z, w, d] of [[0, -half - 0.5, L + 2, 1], [0, half + 0.5, L + 2, 1], [-half - 0.5, 0, 1, L], [half + 0.5, 0, 1, L]]) put(GEO.box, lam(arena.wall), x, 0.3, z, w, z > 0 ? 0.7 : 1.4, d);
  put(GEO.thin, glass(0xffffff, 0.35), 0, 0.012, 0, L * 0.13);
  teams.forEach((tm, k) => {
    const [cx, cz] = CORNERS[k % 4];
    const quad = new THREE.Mesh(new THREE.CircleGeometry(L * 0.3, 24, Math.atan2(cz, -cx) - Math.PI / 4, Math.PI / 2).rotateX(-Math.PI / 2), glass(tm.hex, 0.4));
    quad.position.set(cx * half, 0.014, cz * half); scene.add(quad); owned.push(quad.geometry);
    put(GEO.cyl, lam(arena.wall), cx * (half + 0.5), 1.6, cz * (half + 0.5), 1.3, cz > 0 ? 2 : 3.2, 1.3);        // corner post and flag
    put(GEO.cyl, lam(tm.hex), cx * (half + 0.5), cz > 0 ? 2.75 : 3.35, cz * (half + 0.5), 1.6, 0.3, 1.6);
    if (cz < 0) { put(GEO.cyl, lam(0xf5efe0), cx * (half + 0.5), 5.2, cz * (half + 0.5), 0.16, 4, 0.16); put(GEO.box, lam(tm.hex), cx * (half + 0.5) - cx * 1.2, 6.4, cz * (half + 0.5), 2.2, 1.4, 0.08); }
  });
  // scatter(n, near, far, fn): n props outside the walls. k is a height factor: props on the camera side are kept low.
  const scatter = (n, near, far, fn) => { for (let i = 0; i < n; i++) { const side = i % 4, a = (srand() - 0.5) * (L + far * 2), o = half + 1.8 + near + srand() * (far - near); fn(side === 0 ? a : side === 1 ? o : side === 2 ? a : -o, side === 0 ? -o : side === 2 ? o : a, side === 2 ? 0.3 : 1, 0.7 + srand() * 0.6); } };
  const inside = (m = 0.9) => (srand() - 0.5) * L * m;
  const DRESS = {
    magma() {
      scatter(30, 0.5, 11, (x, z, k, s) => put(GEO.cone, lam(0x3d2d2d), x, 1.6 * k * s - 0.3, z, 2.4 * s, 3.2 * k * s, 2.4 * s));
      scatter(18, 1, 13, (x, z, k, s) => put(GEO.disc, bas(0xff8a2a), x, -0.28, z, 1.5 + s * 2));
      scatter(10, 2, 12, (x, z, k, s) => put(GEO.disc, bas(0xffd23f), x, -0.27, z, 0.6 * s));
      for (let i = 0; i < 12; i++) put(GEO.box, bas(arena.detail), inside(), 0.011, inside(), 0.14, 0.02, 2 + srand() * 4, srand() * 3.14);
      for (let i = 0; i < 10; i++) put(GEO.disc, lam(0x4a3737), inside(), 0.008, inside(), 1 + srand() * 1.6);
    },
    tidal() {
      for (let i = 1; i < 12; i++) put(GEO.box, lam(arena.detail), -half + i * L / 12, 0.011, 0, 0.1, 0.02, L);
      scatter(30, 1, 14, (x, z, k, s) => put(GEO.box, glass(0xffffff, 0.55), x, -0.28, z, 2.5 + s * 3, 0.02, 0.4));
      scatter(10, 2, 9, (x, z, k, s) => { put(GEO.sph, lam(0xe24a4a), x, 0, z, 1.3 * s); put(GEO.cyl, lam(0xffffff), x, 0.2, z, 1.34 * s, 0.25 * s, 1.34 * s); });
      for (let i = -3; i <= 3; i++) for (const sgn of [-1, 1]) put(GEO.cyl, lam(0x5a4028), sgn * (half + 1.4), 0.4, i * L / 6.5, 0.6, sgn * i > 9 ? 1 : 2.2, 0.6);
      put(GEO.cyl, lam(0xf5efe0), half + 7, 3.5, -half - 5, 3, 8, 3); put(GEO.cyl, lam(0xe24a4a), half + 7, 4.5, -half - 5, 3.06, 2, 3.06); put(GEO.sph, bas(0xffe169), half + 7, 8.2, -half - 5, 2.2);   // lighthouse
      scatter(8, 3, 12, (x, z, k, s) => put(GEO.rock, lam(0x6a7684), x, -0.1, z, 2.5 * s, 1.6 * s * k, 2.2 * s));
    },
    canopy() {
      scatter(34, 1, 13, (x, z, k, s) => { put(GEO.cyl, lam(0x7a5a3a), x, 1.4 * k * s, z, 0.7 * s, 3.4 * k * s, 0.7 * s); put(GEO.sph, lam(srand() < 0.5 ? 0x3f8f4a : 0x4fa856), x, (3.4 * k + 0.9) * s, z, 4 * s, 3 * s * (0.5 + k / 2), 4 * s); });
      scatter(12, 0.3, 6, (x, z, k, s) => { put(GEO.cyl, lam(0xf2e6c4), x, 0.3 * s, z, 0.5 * s, 1.2 * s, 0.5 * s); put(GEO.sph, lam(0xd2468c), x, 0.95 * s, z, 1.8 * s, 0.9 * s, 1.8 * s); });
      for (let i = 0; i < 16; i++) put(GEO.disc, lam(arena.detail), inside(), 0.008, inside(), 1 + srand() * 2.2);
      for (let i = 0; i < 26; i++) put(GEO.sph, lam([0xffe169, 0xffffff, 0xf06a9a][i % 3]), inside(0.96), 0.05, inside(0.96), 0.3, 0.12, 0.3);
    },
    storm() {
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 0], [1, 0], [0, -1], [-0.5, -1], [0.5, -1]]) { const x = a * (half + 4), z = b * (half + 4); put(GEO.cyl, lam(0x5a6272), x, 4.5, z, 0.7, 10, 0.7); put(GEO.cone, lam(0x4a5262), x, 0.6, z, 2.4, 2, 2.4); put(GEO.sph, bas(arena.detail), x, 9.9, z, 1.3); }
      scatter(26, 1, 15, (x, z, k, s) => { for (let j = 0; j < 3; j++) put(GEO.sph, lam(j ? 0x5c667a : 0x6b768c), x + (j - 1) * 2.2 * s, -0.2 + (j === 1 ? 0.5 : 0), z + (j % 2) * 0.8, 4 * s, 1.8 * s * (0.4 + k * 0.6), 3.2 * s); });
      for (const sgn of [-1, 1]) { put(GEO.box, bas(arena.detail), 0, 0.011, sgn * (half - 0.5), L - 1, 0.02, 0.22); put(GEO.box, bas(arena.detail), sgn * (half - 0.5), 0.011, 0, 0.22, 0.02, L - 1); }
      for (let i = 1; i < 6; i++) { put(GEO.box, lam(0x7a8498), -half + i * L / 6, 0.009, 0, 0.12, 0.02, L); put(GEO.box, lam(0x7a8498), 0, 0.009, -half + i * L / 6, L, 0.02, 0.12); }
    },
    frost() {
      scatter(30, 0.5, 11, (x, z, k, s) => put(GEO.cone, lam(0x9fdcf0), x, 1.7 * k * s - 0.3, z, 1.5 * s, 3.6 * k * s, 1.5 * s));
      scatter(16, 1, 12, (x, z, k, s) => put(GEO.sph, lam(0xffffff), x, -0.3, z, 4.5 * s, 1.8 * s * k, 3.6 * s));
      scatter(14, 3, 13, (x, z, k, s) => { put(GEO.cyl, lam(0x6b4a2e), x, 0.4, z, 0.5, 1.4, 0.5); put(GEO.cone, lam(0x2f6b4f), x, 2.2 * k + 0.6, z, 2.8 * s, 3.6 * k, 2.8 * s); put(GEO.cone, lam(0xffffff), x, 3.7 * k + 0.6, z, 1.3 * s, 1.5 * k, 1.3 * s); });
      for (let i = 0; i < 18; i++) put(GEO.box, glass(0xffffff, 0.6), inside(), 0.011, inside(), 0.07, 0.02, 2 + srand() * 5, srand() * 3.14);
      for (let i = 0; i < 8; i++) put(GEO.disc, glass(0xffffff, 0.3), inside(), 0.009, inside(), 1.5 + srand() * 2.5);
    },
    dune() {
      put(GEO.ring, lam(arena.detail), 0, 0.009, 0, L * 0.36); put(GEO.disc, lam(arena.detail), 0, 0.008, 0, L * 0.09);
      scatter(22, 0.4, 7, (x, z, k, s) => { const hh = (2 + srand() * 4.5) * k; put(GEO.cyl, lam(0xcaa66a), x, hh / 2 - 0.3, z, 1.3, hh, 1.3); put(GEO.box, lam(0xb98f55), x, hh - 0.2, z, 1.7, 0.4, 1.7); });
      scatter(14, 5, 15, (x, z, k, s) => put(GEO.sph, lam(0xe2c688), x, -0.4, z, 9 * s, 2.4 * s * k, 6 * s));
      scatter(12, 3, 12, (x, z, k, s) => { put(GEO.cyl, lam(0x5f9a4a), x, 1 * k, z, 0.6, 2.6 * k, 0.6); put(GEO.cyl, lam(0x5f9a4a), x + 0.55, 1.3 * k, z, 0.4, 1.1 * k, 0.4); put(GEO.cyl, lam(0x5f9a4a), x - 0.55, 1 * k, z, 0.4, 0.9 * k, 0.4); });
    },
    hollow() {
      for (let i = 1; i < 7; i++) { put(GEO.box, lam(arena.detail), -half + i * L / 7, 0.009, 0, 0.14, 0.02, L); put(GEO.box, lam(arena.detail), 0, 0.009, -half + i * L / 7, L, 0.02, 0.14); }
      scatter(36, 0.5, 10, (x, z, k, s) => { put(GEO.box, lam(0x8d8a9c), x, 0.4 * s, z, 1.1 * s, 1.5 * s, 0.35); put(GEO.cyl, lam(0x8d8a9c), x, 1.15 * s, z, 1.1 * s, 0.35, 1.1 * s).rotation.x = Math.PI / 2; });
      scatter(14, 2, 13, (x, z, k, s) => { put(GEO.cyl, lam(0x3a2f2a), x, 1.8 * k * s, z, 0.6, 4.2 * k * s, 0.6); for (const sg of [-1, 1]) put(GEO.cyl, lam(0x3a2f2a), x + sg * 0.9, 3.4 * k * s, z, 0.3, 2.2 * k, 0.3).rotation.z = -sg * 0.9; });
      scatter(12, 0.3, 8, (x, z, k, s) => { put(GEO.cyl, lam(0x2a2438), x, 0.9 * k, z, 0.2, 2.4 * k, 0.2); put(GEO.sph, bas(0xffc94d), x, 2.2 * k + 0.1, z, 0.75); });
      scatter(8, 1, 9, (x, z, k, s) => put(GEO.sph, lam(0xe8873a), x, 0.1, z, 1.1 * s, 0.85 * s, 1.1 * s));
    },
    meadow() {
      for (let i = 0; i < 10; i += 2) put(GEO.box, lam(arena.detail), -half + (i + 0.5) * L / 10, 0.008, 0, L / 10, 0.02, L);
      for (const sgn of [-1, 1]) { put(GEO.box, bas(0xffffff), 0, 0.012, sgn * (half - 0.6), L - 1.2, 0.02, 0.16); put(GEO.box, bas(0xffffff), sgn * (half - 0.6), 0.012, 0, 0.16, 0.02, L - 1.2); }
      for (const [sx, sz] of [[0, -1], [-1, 0], [1, 0]]) for (let tier = 0; tier < 3; tier++) {                 // stands with a crowd on three sides
        const o = half + 3 + tier * 2.2, w = L * 0.8;
        put(GEO.box, lam(0xcfc9bb), sx * o, tier * 0.7, sz * o, sx ? 2.2 : w, 1.4 + tier * 1.4, sx ? w : 2.2);
        for (let i = 0; i < 16; i++) { const a = (srand() - 0.5) * w * 0.94; put(GEO.sph, lam([0xe24a4a, 0x3fae54, 0xe9c21f, 0x3f7fe0, 0xffffff][Math.floor(srand() * 5)]), sx ? sx * o : a, tier * 1.4 + 1.2, sz ? sz * o : a, 0.9); }
      }
      scatter(10, 0.3, 3, (x, z, k, s) => { if (k < 1) put(GEO.sph, lam(0x4fa856), x, 0, z, 2.6 * s, 1.2, 1.6); });
    },
  };
  (DRESS[arena.id] || DRESS.meadow)();

  // ---- particles: one instanced pool for KO puffs, dust, sparks, hazard bursts and confetti
  const PN = 420, P = { x: new Float32Array(PN), y: new Float32Array(PN), z: new Float32Array(PN), vx: new Float32Array(PN), vy: new Float32Array(PN), vz: new Float32Array(PN), life: new Float32Array(PN), max: new Float32Array(PN), size: new Float32Array(PN), grav: new Float32Array(PN) };
  const pMesh = new THREE.InstancedMesh(GEO.box, new THREE.MeshBasicMaterial(), PN); pMesh.frustumCulled = false; scene.add(pMesh); owned.push(pMesh.material);
  m4.makeScale(0, 0, 0); col.set(0xffffff);
  for (let i = 0; i < PN; i++) { pMesh.setMatrixAt(i, m4); pMesh.setColorAt(i, col); }
  let pNext = 0, pLive = 0;
  function spark(x, y, z, vx, vy, vz, color, size, life, grav = 0) {
    if (quiet) return;
    const i = pNext; pNext = (pNext + 1) % PN;
    P.x[i] = x; P.y[i] = y; P.z[i] = z; P.vx[i] = vx; P.vy[i] = vy; P.vz[i] = vz; P.life[i] = P.max[i] = life; P.size[i] = size; P.grav[i] = grav;
    pMesh.setColorAt(i, col.set(color)); pMesh.instanceColor.needsUpdate = true; pLive = Math.max(pLive, life);
  }
  function puff(x, y, z, n, color, spd, size, life, grav = 0, up = 0) {
    if (quiet) return;
    for (let i = 0; i < n; i++) { const a = rand() * 6.283, s = spd * (0.35 + rand() * 0.65); spark(x, y, z, Math.cos(a) * s, up + rand() * spd * 0.4, Math.sin(a) * s, color, size * (0.6 + rand() * 0.6), life * (0.6 + rand() * 0.5), grav); }
  }
  function drawParticles(dt) {
    if (pLive <= -0.1) return;
    pLive -= dt;
    for (let i = 0; i < PN; i++) {
      if (P.max[i] === 0) continue;
      P.life[i] -= dt;
      if (P.life[i] <= 0) { P.max[i] = 0; m4.makeScale(0, 0, 0); pMesh.setMatrixAt(i, m4); continue; }
      P.vy[i] += P.grav[i] * dt; P.x[i] += P.vx[i] * dt; P.y[i] += P.vy[i] * dt; P.z[i] += P.vz[i] * dt;
      if (P.y[i] < 0.05) { P.y[i] = 0.05; P.vy[i] = 0; P.vx[i] *= 0.8; P.vz[i] *= 0.8; }
      const s = P.size[i] * Math.min(1, P.life[i] / P.max[i] * 2);
      m4.makeScale(s, s, s).setPosition(P.x[i], P.y[i], P.z[i]); pMesh.setMatrixAt(i, m4);
    }
    pMesh.instanceMatrix.needsUpdate = true;
  }

  // ---- ground rings (team colour under every critter, gold pulse under favoured ones) and ranged-attack bolts
  const RN = NT * FIELD_CAP + 80;
  const ringMesh = new THREE.InstancedMesh(GEO.ring, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }), RN);
  const auraMesh = new THREE.InstancedMesh(GEO.thin, new THREE.MeshBasicMaterial({ color: 0xffe169, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }), RN);
  for (const m of [ringMesh, auraMesh]) { m.frustumCulled = false; m.count = 0; scene.add(m); owned.push(m.material); }
  const teamCol = teams.map((tm) => new THREE.Color(tm.hex));
  const bolts = [];
  for (let i = 0; i < 36; i++) { const m = put(GEO.box, bas(0xffffff), 0, 0, 0); m.visible = false; bolts.push({ m, life: 0 }); }
  let boltNext = 0;
  function bolt(u, t) {
    if (quiet) return;
    const b = bolts[boltNext]; boltNext = (boltNext + 1) % bolts.length;
    const y1 = u.h * 0.6, y2 = t.h * 0.5, w = 0.1 + u.h * 0.07;
    b.m.material = bas(teams[u.team].hex); b.m.position.set((u.x + t.x) / 2, (y1 + y2) / 2, (u.z + t.z) / 2); b.m.lookAt(t.x, y2, t.z);
    b.m.scale.set(w, w, Math.hypot(t.x - u.x, y2 - y1, t.z - u.z)); b.m.visible = true; b.life = 0.1;
  }

  // ---- units
  const field = [], everyone = [], dying = [];                  // on the floor and alive / every critter that entered / toppling
  const barBg = bas(0x2b2540), barElev = -CAM_ELEV;
  function spawn(rec, k, x, z, delay) {
    const mesh = buildMesh(rec.spec, k); mesh.scale.setScalar(0.0001); scene.add(mesh);
    const u = { team: k, spec: rec.spec, st: rec.st, h: rec.h, fav: rec.fav, value: rec.value, hp: rec.st.maxHp, x, z, yaw: Math.atan2(-x, -z), cd: rand() * 0.8, rt: rand() * 1.2, target: null, mesh,
      r: Math.max(0.15, rec.h * 0.3), alive: true, scooped: false, die: 0, lunge: 0, flash: 0, dmg: 0, kills: 0, moving: false, stun: 0, stagImm: 0, noScoop: 0, kx: 0, kz: 0, pop: 0, delay,
      air: rec.spec.move === 'fly' || rec.spec.move === 'float', phase: rand() * 6.28, bar: null };
    if (rec.h >= L * 0.085 || rec.spec.titan) {                 // only big critters and titans get a health bar
      const g = new THREE.Group(), w = rec.h * 0.9;
      put(GEO.plane, barBg, 0, 0, 0, w + 0.16, 0.36, 1, 0, g); u.fill = put(GEO.planeL, bas(teams[k].hex), -w / 2, 0, 0.01, w, 0.22, 1, 0, g);
      g.rotation.x = barElev; g.visible = false; scene.add(g); u.bar = g; u.barW = w;
    }
    field.push(u); everyone.push(u);
    return u;
  }
  recs.forEach((r, k) => {
    const [cx, cz] = CORNERS[k % 4], spread = L * 0.15 * clamp(Math.sqrt(onStart[k] / 40), 0.35, 1);
    for (let i = 0; i < onStart[k]; i++) { const a = rand() * 6.283, d = Math.sqrt(rand()) * spread; spawn(r[i], k, cx * L * 0.3 + Math.cos(a) * d, cz * L * 0.3 + Math.sin(a) * d, 0.2 + rand() * 1.4); }
  });
  function separate() {                                         // keep critters from standing inside each other (the smaller one gives way)
    const n = field.length;
    for (let i = 0; i < n; i++) {
      const u = field[i];
      for (let j = i + 1; j < n; j++) {
        const v = field[j], min = (u.r + v.r) * 0.9, dx = u.x - v.x, dz = u.z - v.z;
        if (dx > min || dx < -min || dz > min || dz < -min) continue;
        const d = Math.hypot(dx, dz) || 0.001;
        if (d < min) { const push = (min - d) * 0.5 / d, wu = v.r * v.r / (u.r * u.r + v.r * v.r); u.x += dx * push * wu; u.z += dz * push * wu; v.x -= dx * push * (1 - wu); v.z -= dz * push * (1 - wu); }
      }
      const lim = half - u.r; u.x = clamp(u.x, -lim, lim); u.z = clamp(u.z, -lim, lim);
    }
  }
  for (let i = 0; i < 30; i++) separate();                      // settle the starting formations
  const effCache = new Map();
  const bestEff = (u, v) => {                                   // the best multiplier any of u's types gets against v
    const key = u.spec.dex * 200 + v.spec.dex; let e = effCache.get(key);
    if (e === undefined) { e = Math.max(...u.spec.types.map((t) => typeMult(t, v.spec.types))); effCache.set(key, e); }
    return e;
  };
  function stagger(u, dur) { if (u.stagImm > 0) return; u.stun = dur; u.stagImm = dur + 1.6; u.cd = Math.max(u.cd, dur); }

  // ---- balls
  const balls = teams.map((tm, k) => {
    const [cx, cz] = CORNERS[k % 4], D = baseD * (1 + BALL_SPREAD * Math.log(finishD[k] / loD) / spanD);
    const b = { isBall: true, team: k, cpu: !tm.human, x: cx * L * 0.13, z: cz * L * 0.13, vx: 0, vz: 0, D, D0: D, R: D / 2, hd: Math.atan2(-cx, -cz), stun: 0, safe: 0, gulp: 0, dashT: 0, dashCd: 0, combo: 0, comboT: 0,
      cargo: [], drawn: 0, scoops: 0, aim: null, rt: rand() * 0.5, ax: 0, az: 0, out: false, wob: rand() * 6.28, moving: false, dust: 0 };
    b.group = new THREE.Group(); b.roll = new THREE.Group(); b.group.add(b.roll); scene.add(b.group);
    b.mesh = buildBall ? buildBall(k) : put(GEO.sph, lam(tm.hex), 0, 0, 0, 2, 2, 2, 0, b.roll); b.roll.add(b.mesh);
    b.trainer = buildTrainer ? buildTrainer(k) : null; if (b.trainer) scene.add(b.trainer);
    b.ring = put(GEO.ring, glass(tm.hex, 0.9), 0, 0.03, 0); b.stars = new THREE.Group(); b.stars.visible = false; scene.add(b.stars);
    for (let i = 0; i < 3; i++) put(GEO.rock, bas(0xffe169), Math.cos(i * 2.094), 0, Math.sin(i * 2.094), 0.45, 0.45, 0.45, 0, b.stars);
    if (isMe(tm)) {                                             // the player's own ball: a bobbing arrow and a dash cooldown bar
      b.arrow = put(GEO.cone, bas(0xffe169), 0, 0, 0, 1, 1.4, 1); b.arrow.rotation.x = Math.PI;
      b.cdBg = put(GEO.box, bas(0x2b2540), 0, 0.04, 0, 1, 0.02, 0.4); b.cdFill = put(GEO.box, bas(0xffe169), 0, 0.06, 0, 1, 0.02, 0.24);
    }
    return b;
  });
  const maxD = (b) => Math.min(b.D0 * BALL_MAX_GROW, L * 0.2);
  function resize(b, D) { b.D = D; b.R = D / 2; for (let i = 0; i < b.roll.children.length; i++) { const c = b.roll.children[i]; if (c.userData.arH) c.scale.setScalar(Math.min(c.userData.arH, b.R * 0.9) / b.R); } }
  function stunBall(b, dur) { if (b.safe > 0) return false; b.stun = dur; b.safe = dur + 1.5; b.dashT = 0; return true; }
  function setOut(b, out) {                                     // an eliminated team's ball keeps playing, dimmed
    if (b.out === out) return; b.out = out;
    b.mesh.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      if (!o.userData.arLive) { o.userData.arLive = o.material; const m = o.material.clone(); if (m.color) m.color.multiplyScalar(0.3).lerp(col.set(0x777788), 0.35); if (m.emissive) m.emissive.multiplyScalar(0.15); o.userData.arDim = m; owned.push(m); }
      o.material = out ? o.userData.arDim : o.userData.arLive;
    });
    b.ring.material = out ? glass(0x555566, 0.7) : glass(teams[b.team].hex, 0.9);
    if (hud) hud.panels[b.team].root.classList.toggle('ar-isout', out);
  }
  function scoop(b, u) {
    u.alive = false; u.scooped = true; u.target = null; if (u.bar) u.bar.visible = false;
    b.cargo.push(u); b.scoops++; b.combo = b.comboT > 0 ? b.combo + 1 : 0; b.comboT = 2.5; b.gulp = SCOOP_GULP; b.vx *= 1 - SCOOP_DRAG; b.vz *= 1 - SCOOP_DRAG; b.dashT = 0;
    if (b.aim === u) { b.aim = null; b.rt = Math.max(b.rt, 0.3); }
    // stick it to the ball where it touched, standing out from the surface
    v3.set(u.x - b.x, u.h * 0.5 - b.R * 0.3 + rand() * b.R * 0.6, u.z - b.z).normalize();
    u.mesh.removeFromParent();
    if (b.drawn < STICKERS) {
      b.drawn++; v3.applyQuaternion(q4.copy(b.roll.quaternion).invert());
      u.mesh.position.copy(v3).multiplyScalar(0.86); u.mesh.quaternion.setFromUnitVectors(UP, v3); u.mesh.userData.arH = u.h; b.roll.add(u.mesh);
    }
    resize(b, Math.min(maxD(b), Math.cbrt(b.D ** 3 + SCOOP_GROW * u.h ** 3)));
    if (quiet) return;
    const f = 520 * 1.09 ** Math.min(b.combo, 12);
    tone(f, f * 1.5, 0.12, 'triangle', b.cpu ? 0.08 : 0.2); if (!b.cpu) cry(u.spec, 0.12);
    puff(u.x, u.h * 0.5, u.z, 8, teams[b.team].hex, 5, 0.3, 0.5, -8, 3);
    pop(u.x, u.h + 1, u.z, b.cpu ? `+1 ${u.spec.name}` : `+1 scooped ${u.spec.name}!${b.combo > 0 ? ' x' + (b.combo + 1) : ''}`, teams[b.team].css);
  }
  function drop(b, n) {                                         // a rammed ball spills critters back into play for their own team
    for (; n > 0 && b.cargo.length; n--) {
      const u = b.cargo.splice(Math.floor(rand() * b.cargo.length), 1)[0], a = rand() * 6.283, lim = half - u.r;
      if (u.mesh.parent === b.roll) b.drawn--;
      u.mesh.removeFromParent(); u.mesh.userData.arH = 0; u.mesh.quaternion.identity(); scene.add(u.mesh);
      u.alive = true; u.scooped = false; u.noScoop = 2.5; u.stun = 0.4; u.pop = 1; u.rt = 0;
      u.x = clamp(b.x + Math.cos(a) * (b.R + u.r + 0.3), -lim, lim); u.z = clamp(b.z + Math.sin(a) * (b.R + u.r + 0.3), -lim, lim); u.kx = Math.cos(a) * 6; u.kz = Math.sin(a) * 6;
      field.push(u);
      resize(b, Math.max(b.D0, Math.cbrt(Math.max(0, b.D ** 3 - SCOOP_GROW * u.h ** 3))));
      pop(u.x, u.h + 1, u.z, `${u.spec.name} is free!`, teams[u.team].css);
    }
  }

  // ---- the arena's hazard. Favoured critters ignore it; balls never do. Everything is telegraphed.
  const cross = (d) => [[0, 0], [d, 0], [-d, 0], [0, d], [0, -d]];
  const haz = (function makeHazard() {
    const H = { grip: BALL_GRIP, top: 1, zones: [], step() {}, view() {}, slow: () => 1, hidden: () => false };
    const Z = H.zones, kind = arena.hazard;
    H.danger = (x, z, pad) => { for (const q of Z) if (q.bad && (x - q.x) ** 2 + (z - q.z) ** 2 < (q.r + pad) ** 2) return q; return null; };
    const within = (x, z, s) => { for (const q of Z) if (q.s === s && (x - q.x) ** 2 + (z - q.z) ** 2 < q.r * q.r) return true; return false; };
    const blast = (q, force, dmg, stun) => {                    // knock back and hurt whatever stands in zone q
      for (const u of field) { if (u.fav) continue; const dx = u.x - q.x, dz = u.z - q.z, d = Math.hypot(dx, dz) || 0.01; if (d < q.r + u.r) { u.kx += dx / d * force; u.kz += dz / d * force; u.hp = Math.max(1, u.hp - u.st.maxHp * dmg); u.flash = 0.2; stagger(u, 0.5); } }
      for (const b of balls) { const dx = b.x - q.x, dz = b.z - q.z, d = Math.hypot(dx, dz) || 0.01; if (d < q.r + b.R * 0.6) { b.vx += dx / d * force * 1.3; b.vz += dz / d * force * 1.3; if (stun) stunBall(b, stun); } }
    };
    const cycle = (q, dt, idle, warn, act, onWarn, onFire) => {     // idle -> warn (telegraph) -> active -> idle
      q.t -= dt; if (q.t > 0) return;
      if (q.s === 0) { q.s = 1; q.t = warn; if (onWarn) onWarn(q); } else if (q.s === 1) { q.s = 2; q.t = act; if (onFire) onFire(q); } else { q.s = 0; q.t = idle[0] + rand() * (idle[1] - idle[0]); }
      q.bad = q.s > 0;
    };
    const arrows = () => { const g = new THREE.Group(); for (let i = -1; i <= 1; i++) { const c = put(GEO.cone, glass(0xffffff, 0.75), i * L * 0.2, 0.05, 0, L * 0.07, L * 0.11, 0.05, 0, g); c.rotation.x = Math.PI / 2; } g.visible = false; scene.add(g); return g; };

    if (kind === 'vents') {                                     // Magma Bowl: five vents fill up for 1.4 s, then blow outwards
      const r = L * 0.085, WARN = 1.4;
      cross(L * 0.26).forEach(([x, z], i) => {
        const q = { x, z, r, s: 0, t: 2.5 + i * 1.2 + rand() * 2, bad: false };
        put(GEO.disc, lam(0x2a1f1f), x, 0.016, z, r); put(GEO.thin, bas(0xff8a2a), x, 0.02, z, r);
        q.core = put(GEO.disc, bas(0xffb03a), x, 0.024, z, r * 0.3); q.col = put(GEO.cyl, glass(0xffa53a, 0.8), x, 0, z, r, 1, r); q.col.visible = false; Z.push(q);
      });
      H.step = (dt) => { for (const q of Z) cycle(q, dt, [4.5, 8], WARN, 0.5, () => tone(160, 240, 0.35, 'sawtooth', 0.06), () => { blast(q, 12, 0.07, 0.5); puff(q.x, 0.6, q.z, 18, 0xff8a2a, 8, 0.55, 0.8, -16, 10); shake = Math.max(shake, 0.3); tone(150, 45, 0.45, 'sawtooth', 0.2); }); };
      H.view = () => { for (const q of Z) { q.core.scale.setScalar(r * (q.s === 1 ? 0.3 + 0.7 * (1 - q.t / WARN) + 0.04 * Math.sin(T * 34) : q.s === 2 ? 1 : 0.26 + 0.04 * Math.sin(T * 2 + q.x))); q.col.visible = q.s === 2; if (q.s === 2) { const k = q.t / 0.5, hh = 3 + 8 * (1 - k); q.col.scale.set(r * 1.5 * k + 0.3, hh, r * 1.5 * k + 0.3); q.col.position.y = hh / 2; } } };
    } else if (kind === 'lightning') {                          // Storm Spire: a marker closes for 1.2 s, then the bolt lands
      const r = L * 0.065, WARN = 1.2;
      for (let i = 0; i < 3; i++) {
        const q = { x: 0, z: 0, r, s: 0, t: 1.5 + i * 1.1, bad: false, g: new THREE.Group() };
        put(GEO.thin, bas(0xffe169), 0, 0.03, 0, r, r, r, 0, q.g); q.fill = put(GEO.disc, glass(0xffe169, 0.45), 0, 0.028, 0, r, r, r, 0, q.g);
        q.bolt = put(GEO.box, bas(0xfffbe0), 0, 15, 0, 0.5, 30, 0.5, 0, q.g); q.g.visible = false; scene.add(q.g); Z.push(q);
      }
      H.step = (dt) => { for (const q of Z) cycle(q, dt, [1.4, 3.4], WARN, 0.22, () => {
        const tgt = rand() < 0.65 ? (rand() < 0.4 || !field.length ? balls[Math.floor(rand() * balls.length)] : field[Math.floor(rand() * field.length)]) : null;   // often aimed near the action
        q.x = clamp(tgt ? tgt.x + (rand() - 0.5) * r * 2 : (rand() - 0.5) * L, -half + r, half - r); q.z = clamp(tgt ? tgt.z + (rand() - 0.5) * r * 2 : (rand() - 0.5) * L, -half + r, half - r);
        tone(1300, 1500, 0.07, 'square', 0.04);
      }, () => { blast(q, 5, 0.08, 0.9); puff(q.x, 0.5, q.z, 12, 0xffe169, 7, 0.35, 0.5, -10, 5); shake = Math.max(shake, 0.25); tone(1800, 120, 0.3, 'sawtooth', 0.2); }); };
      H.view = () => { for (const q of Z) { q.g.visible = q.s > 0; q.g.position.set(q.x, 0, q.z); q.bolt.visible = q.s === 2; if (q.s === 1) q.fill.scale.setScalar(r * (1 - q.t / WARN) + 0.01); else if (q.s === 2) q.bolt.position.x = Math.sin(T * 90) * 0.3; } };
    } else if (kind === 'spores') {                             // Canopy Ring: mushrooms swell, then leave a cloud that slows
      const r = L * 0.1, WARN = 1.2, ACT = 3.6;
      cross(L * 0.27).forEach(([x, z], i) => {
        const q = { x, z, r, s: 0, t: 3 + i * 1.5 + rand() * 2, bad: false };
        put(GEO.thin, glass(0xa05ab8, 0.5), x, 0.02, z, r); put(GEO.cyl, lam(0xf2e6c4), x, 0.25, z, 0.5, 0.5, 0.5);
        q.cap = put(GEO.sph, lam(0xa05ab8), x, 0.6, z, 1.5, 0.7, 1.5); q.fill = put(GEO.disc, glass(0xa05ab8, 0.3), x, 0.024, z, 0.01); q.cloud = put(GEO.sph, glass(0xb9e06a, 0.4), x, 0.3, z, r * 2, 1.6, r * 2); q.cloud.visible = false; Z.push(q);
      });
      H.step = (dt) => { for (const q of Z) cycle(q, dt, [5, 9], WARN, ACT, null, () => { puff(q.x, 0.8, q.z, 14, 0xb9e06a, 4, 0.5, 1.2, -1, 2); tone(300, 180, 0.3, 'sine', 0.12); }); };
      H.slow = (x, z) => (within(x, z, 2) ? 0.5 : 1);
      H.view = () => { for (const q of Z) { const w = q.s === 1 ? 1 - q.t / WARN : 0; q.cap.scale.set(1.5 + w * 0.9 + (q.s === 1 ? 0.1 * Math.sin(T * 30) : 0), 0.7 + w * 0.5, 1.5 + w * 0.9); q.fill.scale.setScalar(q.s === 1 ? r * w + 0.01 : 0.01); q.cloud.visible = q.s === 2; if (q.s === 2) { const k = Math.min(1, (ACT - q.t) * 3, q.t * 2); q.cloud.scale.set(r * 2 * k, 1.6 + 0.2 * Math.sin(T * 3 + q.x), r * 2 * k); if (rand() < 0.2) spark(q.x + (rand() - 0.5) * r * 1.4, 0.3, q.z + (rand() - 0.5) * r * 1.4, 0, 1.2, 0, 0xd8f09a, 0.25, 1); } } };
    } else if (kind === 'wave') {                               // Tidal Deck: a wave rises at one edge for 1.6 s, then rolls across
      const W = { s: 0, t: 5, dx: 1, dz: 0, p: 0 }, speed = L / 3, WARN = 1.6, g = new THREE.Group(), arr = arrows();
      put(GEO.cyl, glass(0x4aa8ee, 0.75), 0, 0, 0, 3.2, L, 2.6, 0, g).rotation.z = Math.PI / 2; put(GEO.box, bas(0xffffff), 0, 1.25, 0, L, 0.3, 0.7, 0, g); g.visible = false; scene.add(g);
      H.step = (dt) => {
        W.t -= dt;
        if (W.s === 0 && W.t <= 0) { const d = [[1, 0], [0, 1], [-1, 0], [0, -1]][Math.floor(rand() * 4)]; W.dx = d[0]; W.dz = d[1]; W.s = 1; W.t = WARN; W.p = -half - 1.6; tone(200, 320, 0.6, 'sine', 0.1); }
        else if (W.s === 1 && W.t <= 0) { W.s = 2; tone(320, 120, 1.2, 'sine', 0.14); }
        else if (W.s === 2) {
          W.p += speed * dt;
          for (const u of field) if (!u.fav && !u.air && Math.abs(u.x * W.dx + u.z * W.dz - W.p) < 1.6 + u.r) { u.x += W.dx * speed * 0.6 * dt; u.z += W.dz * speed * 0.6 * dt; }
          for (const b of balls) if (Math.abs(b.x * W.dx + b.z * W.dz - W.p) < 1.6 + b.R * 0.5) { b.vx += W.dx * 36 * dt; b.vz += W.dz * 36 * dt; }
          if (W.p > half + 2) { W.s = 0; W.t = 6 + rand() * 4; }
        }
      };
      H.view = () => {
        g.visible = W.s > 0; arr.visible = W.s === 1 && Math.sin(T * 16) > -0.3;
        if (!W.s) return;
        g.position.set(W.dx * W.p, 0, W.dz * W.p); g.rotation.y = W.dx ? Math.PI / 2 : 0; g.scale.y = W.s === 1 ? 0.25 + 0.75 * (1 - W.t / WARN) : 1 + 0.08 * Math.sin(T * 10);
        arr.rotation.y = Math.atan2(W.dx, W.dz); arr.position.set(-W.dx * L * 0.3, 0, -W.dz * L * 0.3);
        if (W.s === 2 && rand() < 0.5) spark(W.dx * W.p + W.dz * (rand() - 0.5) * L, 1.3, W.dz * W.p + W.dx * (rand() - 0.5) * L, W.dx * 2, 3, W.dz * 2, 0xffffff, 0.3, 0.5, -9);
      };
    } else if (kind === 'gust') {                               // Dune Coliseum: the arrows show which way the next gust blows
      const W = { s: 0, t: 4.5, dx: 1, dz: 0 }, WARN = 1.5, ACT = 2.6, arr = arrows();
      H.step = (dt) => {
        W.t -= dt;
        if (W.s === 0 && W.t <= 0) { const a = Math.floor(rand() * 8) * Math.PI / 4; W.dx = Math.cos(a); W.dz = Math.sin(a); W.s = 1; W.t = WARN; tone(500, 700, 0.5, 'sine', 0.06); }
        else if (W.s === 1 && W.t <= 0) { W.s = 2; W.t = ACT; tone(260, 420, ACT, 'sawtooth', 0.05); }
        else if (W.s === 2) {
          for (const u of field) if (!u.fav) { const p = u.air ? 3.2 : 2.2; u.x += W.dx * p * dt; u.z += W.dz * p * dt; }
          for (const b of balls) { b.vx += W.dx * 11 * dt; b.vz += W.dz * 11 * dt; }
          if (W.t <= 0) { W.s = 0; W.t = 5.5 + rand() * 4; }
        }
      };
      H.view = () => {
        arr.visible = W.s === 1 ? Math.sin(T * 16) > -0.3 : W.s === 2; arr.rotation.y = Math.atan2(W.dx, W.dz);
        if (W.s && rand() < (W.s === 2 ? 0.9 : 0.25)) { const sp = W.s === 2 ? 26 : 8; spark((rand() - 0.5) * L - W.dx * L * 0.3, 0.3 + rand() * 2.5, (rand() - 0.5) * L - W.dz * L * 0.3, W.dx * sp, 0, W.dz * sp, 0xf7e7b8, 0.3, 0.7); }
      };
    } else if (kind === 'fog') {                                // Haunted Hollow: four fog banks drift about, always visible
      const r = L * 0.11, fogMat = lam(0xa9a0cc, { transparent: true, opacity: 0.62, depthWrite: false });
      for (let i = 0; i < 4; i++) {
        const a = i * 1.571 + 0.8, q = { x: Math.cos(a) * L * 0.22, z: Math.sin(a) * L * 0.22, r, s: 2, vx: Math.cos(a * 2.3 + 1) * 1.3, vz: Math.sin(a * 2.3 + 1) * 1.3, bad: false, g: new THREE.Group() };
        for (let j = 0; j < 5; j++) put(GEO.sph, fogMat, Math.cos(j * 1.257) * r * 0.45 * (j ? 1 : 0), 1.2 + (j % 2) * 0.5, Math.sin(j * 1.257) * r * 0.45 * (j ? 1 : 0), r * 1.25, 1.8, r * 1.25, 0, q.g);
        scene.add(q.g); Z.push(q);
      }
      H.step = (dt) => { for (const q of Z) { q.x += q.vx * dt; q.z += q.vz * dt; if (Math.abs(q.x) > half - r * 0.6) q.vx = -Math.sign(q.x) * Math.abs(q.vx); if (Math.abs(q.z) > half - r * 0.6) q.vz = -Math.sign(q.z) * Math.abs(q.vz); } };
      H.hidden = (x, z) => within(x, z, 2);
      H.view = () => { for (const q of Z) { q.g.position.set(q.x, 0.1 * Math.sin(T + q.vx * 9), q.z); q.g.rotation.y = T * 0.15 + q.vx; } };
    } else if (kind === 'bumpers') {                            // Meadow Stadium: four pinball bumpers
      const r = Math.max(1.1, L * 0.035);
      cross(L * 0.25).slice(1).forEach(([x, z]) => { const q = { x, z, r, s: 2, hit: 0, bad: false }; put(GEO.cyl, lam(0xffffff), x, 0.3, z, r * 2, 0.6, r * 2); q.cap = put(GEO.sph, lam(0xe24a4a), x, 0.7, z, r * 2.3, 1.1, r * 2.3); put(GEO.thin, bas(0xffe169), x, 0.02, z, r * 1.5); Z.push(q); });
      H.step = (dt) => { for (const q of Z) {
        q.hit = Math.max(0, q.hit - dt);
        for (const b of balls) { const dx = b.x - q.x, dz = b.z - q.z, d = Math.hypot(dx, dz) || 0.01; if (d < r + b.R) { const sp = Math.max(Math.hypot(b.vx, b.vz) * 1.05, topSpeed0 * 1.15); b.x = q.x + dx / d * (r + b.R); b.z = q.z + dz / d * (r + b.R); b.vx = dx / d * sp; b.vz = dz / d * sp; b.dashT = 0; q.hit = 0.25; tone(700, 1100, 0.1, 'square', 0.12); puff(q.x, 0.8, q.z, 6, 0xffe169, 5, 0.3, 0.4); } }
        for (const u of field) { const dx = u.x - q.x, dz = u.z - q.z, d = Math.hypot(dx, dz) || 0.01; if (d < r + u.r) { u.x = q.x + dx / d * (r + u.r); u.z = q.z + dz / d * (r + u.r); } }
      } };
      H.view = () => { for (const q of Z) { const k = 1 + q.hit * 1.6; q.cap.scale.set(r * 2.3 * k, 1.1 / k, r * 2.3 * k); } };
    } else if (kind === 'ice') { H.grip = 1.25; H.top = 1.12; }  // Frost Rink: balls slide
    return H;
  })();

  // ---- state
  let phase = 'intro', pt = 0, countN = -1, fought = 0, finished = false, winner = -1, timedOut = false, cheering = false, reinT = 0, lastTick = 99, hudT = 0;
  const stat = teams.map(() => ({ alive: 0, hp: 0, fav: 0 }));
  function tally() {
    for (let k = 0; k < NT; k++) { stat[k].alive = recs[k].length - next[k]; stat[k].hp = reserveHp[k]; stat[k].fav = 0; for (let i = next[k]; i < recs[k].length; i++) if (recs[k][i].fav) stat[k].fav++; }
    for (const u of field) if (u.alive) { const s = stat[u.team]; s.alive++; s.hp += u.hp; if (u.fav) s.fav++; }
  }
  function end(byTime) {
    tally(); timedOut = byTime; winner = -1; let best = 0;
    for (let k = 0; k < NT; k++) { const f = stat[k].alive ? stat[k].hp / maxHpAll[k] : 0; if (f > best) { best = f; winner = k; } }   // most health left, as a fraction of the army it brought
    phase = 'finish'; pt = 0;
    if (!quiet) { big('FINISH!', 'ar-stay'); tone(1400, 1400, 0.5, 'square', 0.16); tone(1400, 900, 0.3, 'square', 0.16, 0.5); shake = 0.4; }
  }

  // ---- ball brains and physics
  function think(b) {
    let best = null, bs = 0;
    const lim = SCOOP_RATIO * b.D;
    for (const u of field) {
      if (u.team === b.team || !u.alive || u.h > lim || u.noScoop > 0 || haz.hidden(u.x, u.z)) continue;
      let s = (u.value + 0.5) * (u.target && u.target.team === b.team ? 1.6 : 1) / (Math.hypot(u.x - b.x, u.z - b.z) + L * 0.12);   // strong, close, and hurting my army
      for (const o of balls) if (o !== b && o.aim === u) s *= 0.35;                 // somebody else is already after it
      if (haz.danger(u.x, u.z, 0)) s *= 0.4;
      if (u === b.aim) s *= 1.25;                                                   // a little loyalty, so it does not dither
      if (s > bs) { bs = s; best = u; }
    }
    if (!best) {                                                // nothing to scoop: ram a ball carrying critters, or go and bump a big enemy
      for (const o of balls) { if (o === b || o.safe > 0 || !o.cargo.length || o.D > b.D * 1.15) continue; let mine = 0; for (const c of o.cargo) if (c.team === b.team) mine++; const s = (1 + mine * 3) / (Math.hypot(o.x - b.x, o.z - b.z) + 4); if (s > bs) { bs = s; best = o; } }
      if (!best) for (const u of field) { if (u.team === b.team || !u.alive || u.stagImm > 0 || !u.target || u.target.team !== b.team) continue; const s = u.value / (Math.hypot(u.x - b.x, u.z - b.z) + 4); if (s > bs) { bs = s; best = u; } }
    }
    b.aim = best;
  }
  function moveBall(b, dt) {
    const cpu = b.cpu || auto, top = topSpeed0 * (1 + 0.12 * (b.D / b.D0 - 1)) * haz.top * haz.slow(b.x, b.z) * (cpu ? CPU_SPEED : 1);
    let ix = 0, iz = 0, dash = false;
    b.dashCd -= dt; b.safe -= dt; b.comboT -= dt; b.gulp -= dt;
    if (b.stun > 0) b.stun -= dt;
    else if (cpu) {
      b.rt -= dt;
      if (b.aim && !b.aim.isBall && !b.aim.alive) b.aim = null;                     // somebody else got it: coast until the next think
      if (b.rt <= 0) { b.rt = CPU_THINK[0] + rand() * (CPU_THINK[1] - CPU_THINK[0]); think(b); }
      const a = b.aim, tx = a ? a.x : 0, tz = a ? a.z : 0, dx = tx - b.x, dz = tz - b.z, d = Math.hypot(dx, dz) || 0.001;
      if (a || d > L * 0.15) {
        const w = Math.sin(T * 1.7 + b.wob) * 0.14, c = Math.cos(w), s = Math.sin(w);    // aim wobble
        ix = (dx * c - dz * s) / d; iz = (dx * s + dz * c) / d;
        const q = haz.danger(b.x + ix * 2.5, b.z + iz * 2.5, b.R + 1);               // steer round live hazards
        if (q) { const ex = b.x - q.x, ez = b.z - q.z, e = Math.hypot(ex, ez) || 1; ix += ex / e * 1.4; iz += ez / e * 1.4; const m = Math.hypot(ix, iz) || 1; ix /= m; iz /= m; }
        else if (a && b.dashCd <= 0 && d > b.R + 1.5 && d < L * 0.28 && (b.vx * dx + b.vz * dz) / d > top * 0.5 && rand() < dt * 2.2) dash = true;
      }
      b.ax += (ix - b.ax) * Math.min(1, dt * 7); b.az += (iz - b.az) * Math.min(1, dt * 7); ix = b.ax; iz = b.az;      // reaction lag
    } else {
      const s = (input && input(b.team)) || {}; ix = +s.x || 0; iz = +s.z || 0; dash = !!s.dash;
      const m = Math.hypot(ix, iz); if (m > 1) { ix /= m; iz /= m; }
    }
    if (dash && b.dashCd <= 0 && b.stun <= 0) {
      let hx = ix, hz = iz; const m = Math.hypot(hx, hz);
      if (m < 0.2) { hx = Math.sin(b.hd); hz = Math.cos(b.hd); } else { hx /= m; hz /= m; }
      b.vx = hx * top * DASH_MULT; b.vz = hz * top * DASH_MULT; b.dashT = DASH_TIME; b.dashCd = DASH_CD;
      if (!b.cpu) tone(300, 700, 0.14, 'sine', 0.14);
      puff(b.x, 0.3, b.z, 8, 0xf5efe0, 4, 0.4, 0.5);
    }
    if (b.stun > 0) { const f = Math.exp(-2.2 * dt); b.vx *= f; b.vz *= f; }
    else if (b.dashT > 0) b.dashT -= dt;                         // a dash is a committed burst: no steering until it ends
    else { const k = 1 - Math.exp(-haz.grip * dt); b.vx += (ix * top - b.vx) * k; b.vz += (iz * top - b.vz) * k; }
    b.x += b.vx * dt; b.z += b.vz * dt;
    const lim = half - b.R;
    if (b.x > lim) { b.x = lim; b.vx = -Math.abs(b.vx) * 0.5; } else if (b.x < -lim) { b.x = -lim; b.vx = Math.abs(b.vx) * 0.5; }
    if (b.z > lim) { b.z = lim; b.vz = -Math.abs(b.vz) * 0.5; } else if (b.z < -lim) { b.z = -lim; b.vz = Math.abs(b.vz) * 0.5; }
    const sp = Math.hypot(b.vx, b.vz); b.moving = sp > 0.6;
    if (sp > 0.6) b.hd = Math.atan2(b.vx, b.vz);

    // critters: scoop the small enemies, bounce off the big ones (staggering them), nudge our own aside
    const scoopMax = SCOOP_RATIO * b.D;
    for (const u of field) {
      if (!u.alive) continue;
      const dx = b.x - u.x, dz = b.z - u.z, reach = b.R + u.r;
      if (dx > reach || dx < -reach || dz > reach || dz < -reach) continue;
      const d = Math.hypot(dx, dz) || 0.001;
      if (u.team === b.team) {
        if (u.r > b.R) { const min = b.R + u.r * 0.85; if (d < min) { b.x += dx / d * (min - d) * 0.5; b.z += dz / d * (min - d) * 0.5; } }     // our own titan: slide round it
        else { const min = b.R + u.r * 0.5; if (d < min) { const p = (min - d) * Math.min(1, dt * 10); u.x -= dx / d * p; u.z -= dz / d * p; } }
      } else if (u.h <= scoopMax) {
        if (u.noScoop <= 0 && b.stun <= 0 && b.gulp <= 0 && d < b.R + u.r * 0.5) scoop(b, u);
      } else {
        const min = b.R + u.r * 0.9;
        if (d < min) {
          const nx = dx / d, nz = dz / d, vn = b.vx * nx + b.vz * nz;
          b.x += nx * (min - d); b.z += nz * (min - d);
          if (vn < 0) {
            b.vx -= 1.45 * vn * nx; b.vz -= 1.45 * vn * nz; b.dashT = 0;
            if (-vn > 2.5 && u.stagImm <= 0) { stagger(u, 0.6); u.kx -= nx * Math.min(5, -vn * 0.3); u.kz -= nz * Math.min(5, -vn * 0.3); u.flash = 0.2; puff(u.x + nx * u.r, u.h * 0.4, u.z + nz * u.r, 5, 0xffffff, 4, 0.3, 0.35); tone(200, 120, 0.1, 'square', b.cpu ? 0.04 : 0.12); if (!b.cpu) shake = Math.max(shake, 0.15); }
            if (cpu && b.aim === u) { b.aim = null; b.rt = 0.2; }
          }
        }
      }
    }
  }
  function clash() {                                            // ball against ball: the heavier, faster one wins the exchange
    for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j], dx = b.x - a.x, dz = b.z - a.z, min = a.R + b.R, d = Math.hypot(dx, dz) || 0.001;
      if (d >= min) continue;
      const nx = dx / d, nz = dz / d, ma = a.D ** 3, mb = b.D ** 3, sh = (min - d) / (ma + mb);
      a.x -= nx * sh * mb; a.z -= nz * sh * mb; b.x += nx * sh * ma; b.z += nz * sh * ma;
      const va = a.vx * nx + a.vz * nz, vb = b.vx * nx + b.vz * nz, cs = va - vb;
      if (cs <= 0) continue;
      const imp = 1.7 * cs / (1 / ma + 1 / mb);
      a.vx -= imp / ma * nx; a.vz -= imp / ma * nz; b.vx += imp / mb * nx; b.vz += imp / mb * nz; a.dashT = b.dashT = 0;
      if (cs < 3) continue;
      const pa = a.D ** 1.5 * (Math.max(0, va) + 1), pb = b.D ** 1.5 * (Math.max(0, -vb) + 1), loser = pa > pb * 1.15 ? b : pb > pa * 1.15 ? a : null;
      puff((a.x + b.x) / 2, Math.min(a.R, b.R), (a.z + b.z) / 2, 10, 0xffffff, 6, 0.35, 0.4); tone(170, 70, 0.22, 'sawtooth', 0.18); shake = Math.max(shake, 0.25);
      if (loser && stunBall(loser, CLASH_STUN)) { const s = loser === b ? 1 : -1; loser.vx += s * nx * 5; loser.vz += s * nz * 5; drop(loser, 1 + (rand() < 0.5 ? 1 : 0)); tone(900, 300, 0.3, 'triangle', 0.14); }
    }
  }

  // ---- one step of the fight
  function simulate(dt) {
    fought += dt;
    const kd = Math.exp(-(haz.grip < 2 ? 2 : 5) * dt);
    for (const u of field) {
      if (!u.alive) continue;
      u.rt -= dt; u.cd -= dt; if (u.noScoop > 0) u.noScoop -= dt; if (u.stagImm > 0) u.stagImm -= dt;
      if (u.kx !== 0 || u.kz !== 0) { u.x += u.kx * dt; u.z += u.kz * dt; u.kx *= kd; u.kz *= kd; if (Math.abs(u.kx) + Math.abs(u.kz) < 0.05) u.kx = u.kz = 0; }
      if (u.stun > 0) { u.stun -= dt; u.moving = false; continue; }
      if (!u.target || !u.target.alive || u.rt <= 0) {          // nearest enemy, leaning towards ones it has a type advantage over
        u.rt = 1 + rand() * 0.5;
        let best = null, bs = 1e9;
        for (const v of field) { if (v.team === u.team || !v.alive) continue; const s = Math.hypot(v.x - u.x, v.z - u.z) * (1.3 - 0.15 * Math.min(bestEff(u, v), 2)); if (s < bs) { bs = s; best = v; } }
        u.target = best;
      }
      const t = u.target;
      if (!t) { u.moving = false; continue; }
      const dx = t.x - u.x, dz = t.z - u.z, d = Math.hypot(dx, dz) || 0.001, reach = u.st.range > 0 ? u.st.range + t.r : u.r + t.r + 0.25;
      u.yaw = Math.atan2(dx, dz);
      if (d > reach) { const sp = u.st.speed * (u.fav ? FAV_SPEED : haz.slow(u.x, u.z)) * dt; u.x += dx / d * sp; u.z += dz / d * sp; u.moving = true; }
      else {
        u.moving = false;
        if (u.cd <= 0) {
          u.cd = u.st.interval; u.lunge = 0.18;
          if (u.st.range > 0) bolt(u, t);
          if (!u.fav && rand() < 0.35 && (haz.hidden(u.x, u.z) || haz.hidden(t.x, t.z))) continue;      // fog: a swing and a miss
          const eff = bestEff(u, t), D = u.st.special ? t.st.spd : t.st.def;
          const dmg = eff === 0 ? 1 : (DMG_BASE + DMG_RATIO * u.st.atk / D) * eff * u.st.m * (0.85 + rand() * 0.3) * (u.fav ? FAV_DMG : 1) * (t.fav ? FAV_TAKEN : 1);
          t.hp -= dmg; u.dmg += dmg; t.flash = 0.18;
          if (t.hp <= 0) {
            t.alive = false; u.kills++; if (t.bar) t.bar.visible = false;
            if (quiet) t.mesh.removeFromParent(); else { t.die = 0.6; dying.push(t); puff(t.x, t.h * 0.5, t.z, t.h > 2 ? 10 : 5, 0xffffff, 2 + t.h, 0.2 + t.h * 0.12, 0.5, 0, 1.5); if (t.h >= L * 0.085) { tone(240, 80, 0.3, 'triangle', 0.12); pop(t.x, t.h + 1, t.z, `${t.spec.name} is down!`, '#2b2540'); } }
          }
        }
      }
    }
    for (const b of balls) moveBall(b, dt);
    clash();
    haz.step(dt);
    for (const b of balls) { const lim = half - b.R; b.x = clamp(b.x, -lim, lim); b.z = clamp(b.z, -lim, lim); }
    let w = 0; for (let i = 0; i < field.length; i++) { const u = field[i]; if (u.alive) field[w++] = u; } field.length = w;     // forget the fallen and the scooped
    separate();
    // reinforcements walk in at their corner while there is room on the floor
    reinT -= dt;
    const on = stat; for (let k = 0; k < NT; k++) on[k].alive = 0;
    for (const u of field) on[u.team].alive++;
    if (reinT <= 0) {
      reinT = REINFORCE_EVERY;
      for (let k = 0; k < NT; k++) if (next[k] < recs[k].length && on[k].alive < FIELD_CAP) {
        const rec = recs[k][next[k]++], [cx, cz] = CORNERS[k % 4], u = spawn(rec, k, cx * (half - rec.h * 0.3 - 0.5 - rand() * 3), cz * (half - rec.h * 0.3 - 0.5 - rand() * 3), 0);
        reserveHp[k] = next[k] < recs[k].length ? reserveHp[k] - rec.st.maxHp : 0; u.noScoop = 1.2; on[k].alive++;
      }
    }
    let left = 0;
    for (let k = 0; k < NT; k++) { const alive = on[k].alive + recs[k].length - next[k]; if (alive > 0) left++; setOut(balls[k], alive === 0); }
    if (left <= 1) end(false); else if (fought >= TIME_LIMIT) end(true);
  }

  // ---- HUD (DOM). Everything is cached so nothing is rewritten unless it changed.
  let hud = null;
  const pops = []; let popNext = 0;
  if (HAS_DOM) {
    injectStyle();
    const root = el('div', 'ar-root', document.body);
    hud = { root, panels: [], flags: [] };
    teams.forEach((tm, k) => {
      const p = el('div', `ar-team ar-pill ar-c${k % 4}${isMe(tm) ? ' ar-me' : ''}`, root);
      el('div', '', p, `<i class="ar-dot" style="background:${tm.css}"></i>${teamLabel(tm)}<span class="ar-out">OUT</span>`);
      const fill = el('i', '', el('div', 'ar-hp', p)); fill.style.background = tm.css;
      const row = el('div', 'ar-row', p), alive = el('span', '', row), sc = el('span', '', row), fv = el('span', 'ar-fv', row);
      hud.panels.push({ root: p, fill, alive, sc, fv, res: el('div', 'ar-res', p), w: -1 });
      const f = el('div', 'ar-flag', root, `${teamLabel(tm)}<small>${(tm.army || []).length} critter${(tm.army || []).length === 1 ? '' : 's'}</small>`); f.style.background = tm.css; hud.flags.push(f);
    });
    const top = el('div', 'ar-top', root);
    hud.clock = el('div', 'ar-pill ar-clock', top);
    el('div', 'ar-pill ar-name', top, `${arena.name} ${arena.types.map(chip).join('')}<small>${arena.hazardName}</small>`);
    hud.intro = el('div', 'ar-pill ar-intro', root, `<h3>${arena.name}</h3><div>Favoured: ${arena.types.map(chip).join('')}</div><p>${arena.blurb}</p>`);
    hud.big = el('div', 'ar-big', root); hud.sub = el('div', 'ar-pill ar-sub', root);
    hud.skip = el('div', 'ar-pill ar-skip', root, 'Skip (Space)'); if (noSkip) hud.skip.style.display = 'none';
    for (let i = 0; i < 8; i++) pops.push(el('div', 'ar-pop', root));
  }
  function big(text, anim, small) { if (!hud) return; hud.big.textContent = text; hud.big.classList.toggle('ar-small', !!small); hud.big.classList.remove('ar-punch', 'ar-stay'); replay(hud.big, anim); }
  function project(x, y, z, e) { v3.set(x, y, z).project(camera); e.style.left = ((v3.x * 0.5 + 0.5) * 100).toFixed(1) + '%'; e.style.top = ((-v3.y * 0.5 + 0.5) * 100).toFixed(1) + '%'; }
  function pop(x, y, z, text, bg) { if (quiet || !hud) return; const e = pops[popNext]; popNext = (popNext + 1) % pops.length; e.textContent = text; e.style.background = bg; project(x, y, z, e); replay(e, 'ar-on'); }
  function placeFlags() { if (hud) teams.forEach((tm, k) => { const [cx, cz] = CORNERS[k % 4]; project(cx * L * 0.33, 0, cz * L * 0.33, hud.flags[k]); }); }
  function drawHud() {
    if (!hud) return;
    const left = Math.max(0, Math.ceil(TIME_LIMIT - fought));
    setText(hud.clock, Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'));
    const low = phase === 'fight' && left <= 10;
    if (hud.low !== low) { hud.low = low; hud.clock.classList.toggle('ar-low', low); }
    if (low && left !== lastTick) { lastTick = left; tone(1000, 1000, 0.05, 'square', 0.1); }
    tally();
    for (let k = 0; k < NT; k++) {
      const p = hud.panels[k], w = Math.round((maxHpAll[k] ? stat[k].hp / maxHpAll[k] : 0) * 100), res = recs[k].length - next[k];
      if (p.w !== w) { p.w = w; p.fill.style.width = w + '%'; }
      setText(p.alive, `${stat[k].alive}/${recs[k].length} left`); setText(p.sc, `Scooped ${balls[k].cargo.length}`); setText(p.fv, `★ ${stat[k].fav}`); setText(p.res, res > 0 ? `+${res} in reserve` : '');
    }
  }

  // ---- fixed camera: fit the whole floor between the HUD bands for this aspect ratio, once
  const FIT = [[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1], [-1, 3, -1], [1, 3, -1]], span = [0, 0, 0];
  function fitCamera() {
    const XLIM = 0.95, YTOP = 0.74, YBOT = -0.9;
    let tz = 0;
    const place = (d) => { camera.position.set(0, Math.sin(CAM_ELEV) * d, tz + Math.cos(CAM_ELEV) * d); camera.lookAt(0, 0, tz); camera.updateMatrixWorld(); };
    const measure = () => { span[0] = 0; span[1] = 9; span[2] = -9; for (const p of FIT) { v3.set(p[0] * (half + 1), p[1], p[2] * (half + 1)).project(camera); span[0] = Math.max(span[0], Math.abs(v3.x)); span[1] = Math.min(span[1], v3.y); span[2] = Math.max(span[2], v3.y); } };
    const search = (ok) => { let lo = 2, hi = L * 12; for (let i = 0; i < 26; i++) { const d = (lo + hi) / 2; place(d); measure(); if (ok()) hi = d; else lo = d; } place(hi); measure(); return hi; };
    for (let pass = 0; pass < 4; pass++) {                      // size it, then slide the look-at point until it is centred in the free band
      const d = search(() => span[0] <= XLIM && span[2] - span[1] <= YTOP - YBOT), mid = (span[1] + span[2]) / 2, err = mid - (YTOP + YBOT) / 2;
      tz += 0.5; place(d); measure(); const der = ((span[1] + span[2]) / 2 - mid) / 0.5; tz -= 0.5;
      if (Math.abs(der) > 1e-6) tz -= err / der;
    }
    search(() => span[0] <= XLIM && span[1] >= YBOT - 0.005 && span[2] <= YTOP + 0.005);
    camBase.copy(camera.position);
  }
  function resizeView(aspect) { camera.aspect = aspect > 0 ? aspect : 16 / 9; camera.updateProjectionMatrix(); fitCamera(); placeFlags(); }
  resizeView(HAS_DOM && typeof window !== 'undefined' && window.innerHeight ? window.innerWidth / window.innerHeight : 16 / 9);

  // ---- drawing
  function view(dt) {
    const cheerTeam = cheering ? winner : -1;
    let n = 0, na = 0;
    for (let i = 0; i < field.length; i++) {
      const u = field[i], h = u.h;
      u.lunge = Math.max(0, u.lunge - dt); u.flash = Math.max(0, u.flash - dt);
      if (u.pop < 1 && T >= u.delay) { if (u.pop === 0 && u.delay > 0 && rand() < 0.2) tone(500 + rand() * 500, 900, 0.04, 'sine', 0.03); u.pop = Math.min(1, u.pop + dt / 0.3); }
      const lu = u.lunge > 0 ? Math.sin(u.lunge / 0.18 * Math.PI) * Math.min(0.6, u.r) : 0;
      let y = u.air ? h * (0.3 + 0.07 * Math.sin(T * 3 + u.phase)) : u.moving ? Math.abs(Math.sin(T * 9 + u.phase)) * h * 0.1 : 0;
      if (u.team === cheerTeam) y += Math.abs(Math.sin(T * 7 + u.phase)) * Math.min(h * 0.6, 1.6);
      u.mesh.position.set(u.x + Math.sin(u.yaw) * lu, y, u.z + Math.cos(u.yaw) * lu);
      u.mesh.rotation.set(0, u.yaw + (u.stun > 0 ? Math.sin(T * 40) * 0.35 : 0), u.stun > 0 ? Math.sin(T * 31) * 0.18 : 0);
      u.mesh.scale.setScalar(Math.max(0.0001, h * (1 + (u.flash > 0 ? 0.14 : 0)) * (u.pop < 1 ? backOut(u.pop) : 1)));
      if (u.bar) { u.bar.visible = u.pop >= 1; u.bar.position.set(u.x, h * 1.12 + y + 0.4, u.z); u.fill.scale.x = Math.max(0.001, u.barW * u.hp / u.st.maxHp); }
      if (u.pop > 0 && n < RN) {
        const s = Math.max(0.45, u.r * 1.55);
        m4.makeScale(s, 1, s).setPosition(u.x, 0.02, u.z); ringMesh.setMatrixAt(n, m4); ringMesh.setColorAt(n, teamCol[u.team]); n++;
        if (u.fav) { const a = s * (1.28 + 0.1 * Math.sin(T * 5 + u.phase)); m4.makeScale(a, 1, a).setPosition(u.x, 0.026, u.z); auraMesh.setMatrixAt(na++, m4); }
      }
    }
    ringMesh.count = n; auraMesh.count = na; ringMesh.instanceMatrix.needsUpdate = auraMesh.instanceMatrix.needsUpdate = true; if (ringMesh.instanceColor) ringMesh.instanceColor.needsUpdate = true;
    for (let i = dying.length - 1; i >= 0; i--) {               // topple and shrink away
      const u = dying[i]; u.die -= dt;
      const k = Math.max(0, u.die / 0.6);
      u.mesh.rotation.z = (1 - k) * 1.5; u.mesh.scale.setScalar(u.h * (0.2 + 0.8 * k));
      if (u.die <= 0) { u.mesh.removeFromParent(); dying.splice(i, 1); }
    }
    for (const b of bolts) if (b.life > 0) { b.life -= dt; if (b.life <= 0) b.m.visible = false; }
    for (const b of balls) {
      const dropIn = clamp((T - 1.2 - b.team * 0.15) / 0.9, 0, 1), sp = Math.hypot(b.vx, b.vz), R = b.R;
      b.group.visible = dropIn > 0; b.group.position.set(b.x, R + (1 - bounceOut(dropIn)) * L * 0.4, b.z); b.roll.scale.setScalar(R);
      if (sp > 0.05 && dt > 0) { v3.set(b.vz / sp, 0, -b.vx / sp); b.roll.quaternion.premultiply(q4.setFromAxisAngle(v3, sp * dt / R)); }
      b.ring.position.set(b.x, 0.03, b.z); b.ring.scale.setScalar(R * (1.25 + 0.35 * Math.max(0, b.gulp) / SCOOP_GULP)); b.ring.visible = dropIn >= 1;
      if (b.trainer) {
        const th = clamp(b.D * 0.7, 1.2, L * 0.09), back = R + th * 0.22;
        b.trainer.visible = dropIn >= 1; b.trainer.scale.setScalar(th); b.trainer.position.set(b.x - Math.sin(b.hd) * back, b.team === cheerTeam ? Math.abs(Math.sin(T * 7)) * 0.8 : 0, b.z - Math.cos(b.hd) * back); b.trainer.rotation.y = b.hd;
        if (poseTrainer) poseTrainer(b.trainer, T, b.moving && b.stun <= 0);
      }
      b.stars.visible = b.stun > 0; if (b.stun > 0) { b.stars.position.set(b.x, R * 2 + 0.7, b.z); b.stars.rotation.y = T * 9; }
      if (sp > 1 && (b.dashT > 0 || sp > topSpeed0 * 1.3)) { b.dust += dt; if (b.dust > 0.03) { b.dust = 0; spark(b.x - b.vx / sp * R, 0.2, b.z - b.vz / sp * R, (rand() - 0.5) * 2, 1 + rand(), (rand() - 0.5) * 2, 0xf5efe0, 0.25 + R * 0.2, 0.45); } }
      if (b.arrow) {
        b.arrow.position.set(b.x, R * 2 + 1.6 + Math.sin(T * 5) * 0.25, b.z); b.arrow.visible = dropIn >= 1;
        const w = Math.max(1.6, R * 1.8), f = clamp(1 - b.dashCd / DASH_CD, 0, 1), show = dropIn >= 1 && f < 1;
        b.cdBg.visible = b.cdFill.visible = show;
        if (show) { b.cdBg.position.set(b.x, 0.04, b.z + R + 0.7); b.cdBg.scale.x = w + 0.16; b.cdFill.position.set(b.x - w / 2 + w * f / 2, 0.06, b.z + R + 0.7); b.cdFill.scale.x = Math.max(0.01, w * f); }
      }
    }
    haz.view(dt);
    if (cheering && winner >= 0 && phase === 'finish') for (let i = 0; i < 3; i++) spark((rand() - 0.5) * L, L * 0.3 + rand() * 4, (rand() - 0.5) * L, (rand() - 0.5) * 3, -2, (rand() - 0.5) * 3, [teams[winner].hex, 0xffffff, 0xffe169][Math.floor(rand() * 3)], 0.4, 2.2, -5);
    drawParticles(dt);
    shake = Math.max(0, shake - dt * 1.5);                      // the only camera motion: a tiny impact shake
    camera.position.set(camBase.x + (rand() - 0.5) * shake * 0.6, camBase.y + (rand() - 0.5) * shake * 0.6, camBase.z);
    hudT -= dt; if (hudT <= 0) { hudT = 0.1; drawHud(); }
  }
  const winText = () => (winner < 0 ? 'Nobody is left standing' : isMe(teams[winner]) ? 'You win!' : `${teams[winner].name} wins!`);
  function celebrate() {
    cheering = true;
    if (hud) { big(winText(), 'ar-stay', true); if (timedOut) { hud.sub.textContent = 'Time! Decided on health remaining'; hud.sub.classList.add('ar-on'); } }
    if (winner >= 0) { const s = isMe(teams[winner]) ? 1 : 0.8; [523, 659, 784, 1047].forEach((f, i) => tone(f * s, f * s, i === 3 ? 0.5 : 0.14, 'square', 0.16, i * 0.13)); }
  }
  function finishNow() { phase = 'done'; finished = true; }

  if (!total) { winner = -1; cheering = true; finishNow(); if (hud) { big(winText(), 'ar-stay', true); hud.flags.forEach((f) => { f.style.opacity = 0; }); } }   // nobody brought anybody
  else if (hud) hud.intro.classList.add('ar-on');
  view(0);

  return {
    scene, camera, size: L, arena,
    get finished() { return finished; },
    get phase() { return phase; },
    get units() { return field; },                               // live critters on the floor (read-only, for debugging and tests)
    get balls() { return balls; },
    step(dt) {
      if (destroyed) return;
      T += dt; pt += dt;
      if (phase === 'intro') { if (pt >= INTRO) { phase = 'countdown'; pt = 0; countN = -1; if (hud) hud.intro.classList.remove('ar-on'); } }
      if (phase === 'countdown') {                              // 3, 2, 1, GO! Nothing moves until GO
        const c = Math.floor(pt / COUNT_STEP);
        if (c !== countN) {
          countN = c;
          if (c < 3) { big(String(3 - c), 'ar-punch'); tone(440 + c * 60, 440 + c * 60, 0.14, 'square', 0.18); }
          else { phase = 'fight'; pt = 0; big('GO!', 'ar-punch'); tone(880, 1320, 0.4, 'square', 0.2); if (hud) hud.flags.forEach((f) => { f.style.opacity = 0; }); }
        }
      } else if (phase === 'fight') simulate(dt);
      else if (phase === 'finish') { if (!cheering && pt >= FREEZE) celebrate(); if (pt >= FREEZE + CHEER) finishNow(); }
      view(dt);
    },
    resize: resizeView,
    status() { tally(); return teams.map((tm, k) => ({ alive: stat[k].alive, all: recs[k].length, hp: maxHpAll[k] ? clamp(stat[k].hp / maxHpAll[k], 0, 1) : 0, scooped: balls[k].cargo.length, favoured: stat[k].fav })); },
    result() {
      const mvp = everyone.reduce((a, u) => (!a || u.dmg > a.dmg ? u : a), null);
      return { winner, timedOut, seconds: fought, scoops: balls.map((b) => b.scoops), mvp: mvp && mvp.dmg > 0 ? { name: mvp.spec.name, team: mvp.team, damage: Math.round(mvp.dmg), kills: mvp.kills } : null };
    },
    skip() {                                                    // play the rest out instantly: 30 Hz, every ball CPU-driven, no effects
      if (destroyed || finished) return;
      quiet = auto = true;
      if (phase === 'intro' || phase === 'countdown') { phase = 'fight'; for (const u of field) u.pop = 1; }
      for (let i = 0; i < 6000 && phase === 'fight'; i++) simulate(1 / 30);
      for (const u of dying) u.mesh.removeFromParent(); dying.length = 0;
      quiet = auto = false; T = Math.max(T, 3); cheering = true; finishNow();
      if (hud) { hud.intro.classList.remove('ar-on'); hud.flags.forEach((f) => { f.style.opacity = 0; }); big(winText(), 'ar-stay', true); }
      hudT = 0; view(0);
    },
    destroy() {
      if (destroyed) return; destroyed = true;
      if (hud) { hud.root.remove(); hud = null; }
      for (const m of mats.values()) m.dispose(); for (const o of owned) o.dispose();
      ringMesh.dispose(); auraMesh.dispose(); pMesh.dispose();
    },
  };
}
