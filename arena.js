// The end-of-round ARENA BATTLE: a wheel picks one of eight themed arenas, the armies merge (three of a kind become
// the next stage of their line), and what is left fights on a platform with no walls while each team's trainer
// pushes a ball around it. Fixed camera, minigame feel.
//
//   createWheel({ arenas, pickIndex, teams, sfx })     -> full-screen wheel overlay, then a result card
//   planTeams(teams, arena, specOf)                    -> what each army merges into (also used to preload models)
//   createBattle({ arena, teams, specOf, buildActor, ... })  -> the fight (scene + camera + its own DOM HUD)
//
// Where things live:
//   arena-merge.js   the merging rules                 arena-sim.js     the fight itself (no drawing; deterministic)
//   arena-battle.js  drawing, sound, HUD, the intro    arena-fx.js      particles and effect shapes
//   arena-ui.js      style sheet and DOM helpers
// Every arena FAVOURS three types: favoured monsters hit harder, take less, move a little faster, wear a gold ring,
// and are immune to the arena's own hazard (balls never are).
import { typeColor, chip, css, el, injectStyle, teamLabel, HAS_DOM } from './arena-ui.js';
import { isFavoured } from './arena-sim.js';
export { createBattle, planTeams } from './arena-battle.js';
export { power } from './arena-merge.js';
export { typeMult, isFavoured } from './arena-sim.js';

// ---------- arenas ----------
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
export const favouredCount = (arena, army) => (army || []).reduce((n, s) => n + (isFavoured(arena, s) ? 1 : 0), 0);

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
