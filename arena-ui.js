// Shared screen bits for the arena: the style sheet, small DOM helpers and type colours (used by the wheel in
// arena.js and the fight's HUD in arena-battle.js).
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const HAS_DOM = typeof document !== 'undefined';
export const TYPE_FALLBACK = { normal: '#a8a090', fire: '#f2743a', water: '#4a9be8', grass: '#57b65a', electric: '#e9bf2a', ice: '#7fd0d8', fighting: '#c0503a', poison: '#a05ab8', ground: '#c9a35a', flying: '#8fa8e8', psychic: '#f06a9a', bug: '#9bbf3b', rock: '#a08b6a', ghost: '#6f5aa8', dragon: '#6a5ae0' };
export const typeColor = (t) => ((typeof window !== 'undefined' && window.ROLLUP_DATA && window.ROLLUP_DATA.TYPE_COLORS) || TYPE_FALLBACK)[t] || '#888';
export const chip = (t) => `<span class="ar-chip" style="background:${typeColor(t)}">${t}</span>`;
export const css = (hex) => '#' + hex.toString(16).padStart(6, '0');

// ---------- DOM helpers and the shared style sheet ----------
export function el(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
export function setText(e, s) { if (e && e._t !== s) { e._t = s; e.textContent = s; } }
export function replay(e, cls) { e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }     // restart a CSS animation
const STYLE = `
.ar-root{position:fixed;inset:0;pointer-events:none;overflow:hidden;font-family:"Trebuchet MS","Segoe UI",sans-serif;color:#2b2540;font-size:clamp(12px,1.12vw,21px);font-weight:800;z-index:20}
.ar-root *{box-sizing:border-box}
.ar-pill{background:rgba(255,255,255,.9);border:3px solid #2b2540;border-radius:1em;padding:.4em .8em;box-shadow:0 4px 0 rgba(43,37,64,.35)}
.ar-chip{display:inline-block;padding:.05em .6em;border-radius:.6em;color:#fff;font-size:.8em;margin:0 .15em;text-shadow:0 1px 0 rgba(0,0,0,.3);border:2px solid #2b2540}
.ar-dot{display:inline-block;width:.8em;height:.8em;border-radius:50%;border:2px solid #2b2540;margin-right:.4em;vertical-align:-.05em}
.ar-team{position:absolute;line-height:1.25}
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
.ar-skip{position:absolute;right:15.5em;bottom:1em;font-size:.8em;background:#bfe7ff;overflow:hidden;opacity:.85}
.ar-skip i{position:absolute;left:0;bottom:0;height:.28em;width:0;background:#2b2540}
.ar-team{width:15em}
.ar-tname{white-space:nowrap}
.ar-tally{display:flex;align-items:center;justify-content:center;gap:.45em;font-size:1.55em;margin:.1em 0 0}
.ar-tally .ar-to{color:#b07a00}
.ar-tri{position:relative;display:inline-block;width:2.3em;height:1em}
.ar-tri i{position:absolute;left:0;top:.26em;width:.48em;height:.48em;border-radius:50%;background:#2b2540;animation:ar-tri1 1.15s ease-in infinite}
.ar-tri i:nth-child(2){left:.62em;animation-name:ar-tri2}.ar-tri i:nth-child(3){left:1.24em;animation-name:ar-tri3}
@keyframes ar-tri1{0%{transform:translateX(0) scale(1)}62%{transform:translateX(1.75em) scale(.7)}66%,100%{transform:translateX(1.75em) scale(1.75);background:#b07a00}}
@keyframes ar-tri2{0%{transform:translateX(0) scale(1)}62%{transform:translateX(1.13em) scale(.7);opacity:1}66%,100%{transform:translateX(1.13em) scale(.7);opacity:0}}
@keyframes ar-tri3{0%{transform:translateX(0) scale(1)}62%{transform:translateX(.51em) scale(.7);opacity:1}66%,100%{transform:translateX(.51em) scale(.7);opacity:0}}
.ar-fighting .ar-tally{display:none}
.ar-card .ar-tri{margin:0 .35em;vertical-align:-.12em}
.ar-root:not(.ar-fighting) .ar-hp,.ar-root:not(.ar-fighting) .ar-pips{display:none}
.ar-pips{display:flex;flex-wrap:wrap;gap:.2em;margin-top:.35em}
.ar-pip{width:.7em;height:.7em;border-radius:50%;border:2px solid #2b2540;transition:transform .2s,opacity .2s}
.ar-pip.ar-res{opacity:.4;transform:scale(.72)}
.ar-pip.ar-out{background:#2b2540!important;opacity:.3;transform:scale(.72)}
.ar-pip.ar-sc{background:#fff!important}
.ar-bench{font-size:.68em;line-height:1;align-self:center;margin-left:.2em;padding:.12em .4em;border-radius:.6em;background:#2b2540;color:#fff;opacity:.75}
.ar-team{min-height:4.4em}
.ar-hex{position:absolute;right:.45em;bottom:.3em;width:3em}
.ar-hex svg{display:block;width:100%;overflow:visible}
.ar-hex .hx-ico,.ar-hex .hx-guide{display:none}
.ar-pips{margin-right:3.3em;min-height:1.7em;align-items:center}
.ar-pips{margin-right:8em}
.ar-hexdone svg{animation:ar-hexdone .6s ease-out}
@keyframes ar-hexdone{0%{filter:none;transform:scale(1)}30%{filter:brightness(1.35) drop-shadow(0 0 .5em #ffe169);transform:scale(1.13)}100%{filter:none;transform:scale(1)}}
.ar-cer{position:absolute;top:7em;width:58%;font-size:1.1em;padding:.55em .8em .7em;border-width:4px;background:rgba(255,250,240,.97);box-shadow:0 6px 0 rgba(43,37,64,.4),0 0 0 4px var(--tc);opacity:0;transform:scale(.8);transition:opacity .2s,transform .22s cubic-bezier(.3,1.4,.5,1);z-index:2}
.ar-cer.ar-on{opacity:1;transform:none}
.ar-cer.ar-l{left:2.5%}.ar-cer.ar-r{right:2.5%}
.ar-cer-head{display:flex;align-items:center;font-size:1.3em;line-height:1.2}
.ar-cer-n{margin-left:auto;min-width:2.4em;text-align:center;background:var(--tc);color:#fff;border:3px solid #2b2540;border-radius:.7em;padding:0 .45em;text-shadow:0 1px 0 rgba(0,0,0,.35);font-size:1.15em}
.ar-cer-body{display:flex;gap:.5em;align-items:stretch;margin-top:.45em}
.ar-cer-grid{flex:1;height:16.5em;display:flex;flex-wrap:wrap;align-content:flex-start;gap:3px;overflow:hidden;--cell:40px}
.ar-cer-t{position:relative;width:var(--cell);height:var(--cell);border-radius:20%;border:2px solid #2b2540;background-size:112%;background-position:center;background-repeat:no-repeat;animation:ar-tile .2s cubic-bezier(.3,1.6,.5,1)}
.ar-cer-t b{position:absolute;right:-3px;bottom:-3px;font-size:max(9px,calc(var(--cell)*.3));line-height:1;color:#fff;-webkit-text-stroke:3px #2b2540;paint-order:stroke fill}
@keyframes ar-tile{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
.ar-tick{animation:ar-tick .16s ease-out}@keyframes ar-tick{0%{transform:scale(1)}45%{transform:scale(1.22)}100%{transform:scale(1)}}
.ar-cer-hexw{position:relative;width:19em;flex:none;padding:1.7em 3.4em 4.6em}
.ar-cer-hexw>svg{display:block;width:100%;overflow:visible}
.ar-cer-hexw .hx-ico circle{stroke-width:1.6}
.ar-cer-pc{position:absolute;line-height:1;white-space:nowrap;text-align:center;transform:translate(-50%,-50%);-webkit-text-stroke:3px #2b2540;paint-order:stroke fill}
.ar-cer-pc small{display:block;font-size:.72em;letter-spacing:.04em;-webkit-text-stroke:2.5px #2b2540}
.ar-cer-pc b{display:block;font-size:1.25em;min-height:1em}
.ar-cer-pc.ar-top b{font-size:1.7em;animation:ar-lit .35s ease-out}
.ar-pc0{left:50%;top:.75em}.ar-pc1{left:88%;top:23%}.ar-pc2{left:88%;top:55%}.ar-pc3{left:50%;top:calc(100% - 4.4em)}.ar-pc4{left:12%;top:55%}.ar-pc5{left:12%;top:23%}
.ar-cer-best{position:absolute;left:50%;bottom:.25em;transform:translateX(-50%) scale(.3);opacity:0;display:flex;align-items:center;gap:.4em;white-space:nowrap;background:#2b2540;color:#ffe169;border:3px solid #2b2540;border-radius:1em;padding:.1em .7em .1em .25em;font-size:1.25em;box-shadow:0 3px 0 rgba(43,37,64,.4);text-shadow:0 1px 0 rgba(0,0,0,.4);transition:opacity .15s,transform .25s cubic-bezier(.3,1.7,.5,1)}
.ar-cer-best.ar-on{opacity:1;transform:translateX(-50%) scale(1)}
.ar-cer-best{padding:.1em .8em}.ar-cer-best span{text-transform:uppercase;letter-spacing:.06em;color:#fff;font-size:.8em}.ar-cer-best b{font-size:1.25em}
.ar-cer-hexw .hx-num{font-size:17px}
.ar-hex .hx-num{display:none}
.ar-root:not(.ar-fighting) .ar-clock{visibility:hidden}
.ar-call{animation:ar-call .5s cubic-bezier(.3,1.5,.5,1)}@keyframes ar-call{0%{transform:scale(1)}35%{transform:scale(1.22);box-shadow:0 0 0 5px #ffe169,0 4px 0 rgba(43,37,64,.35)}100%{transform:scale(1)}}
.ar-cer-f s{position:absolute;left:-.7em;top:-.5em;width:1.9em;height:1.9em;border-radius:24%;border:2px solid #2b2540;background-size:116%;background-position:center;background-repeat:no-repeat;text-decoration:none;box-shadow:0 2px 0 rgba(43,37,64,.35)}
.ar-cer-f s b{position:absolute;right:-.5em;bottom:-.35em;font-size:.78em;line-height:1;color:#fff;-webkit-text-stroke:3px #2b2540;paint-order:stroke fill}
.ar-cer-f.ar-wait s{opacity:.25}
.st-ico{width:1.5em;height:1.5em;flex:none;vertical-align:middle}
.ar-cer-six{display:flex;justify-content:center;gap:.9em;margin-top:.5em;padding-bottom:1em}
.ar-cer-f{position:relative;width:4.2em;height:4.2em;border-radius:50%;border:3px solid #2b2540;box-shadow:0 3px 0 rgba(43,37,64,.35);transition:filter .2s}
.ar-cer-f img{position:absolute;inset:-4%;width:108%;height:108%;object-fit:contain;border-radius:50%;transition:filter .2s}
.ar-cer-f.ar-wait{background:#d8d4e0!important}.ar-cer-f.ar-wait img{filter:brightness(0) opacity(.3)}.ar-cer-f.ar-wait em{opacity:0}
.ar-cer-f em{position:absolute;left:50%;top:-.55em;transform:translateX(-50%);font-style:normal;font-size:.85em;line-height:1;white-space:nowrap;color:#ffd23f;-webkit-text-stroke:3px #2b2540;paint-order:stroke fill}
.ar-cer-f u{position:absolute;left:50%;bottom:-1.05em;transform:translateX(-50%);display:flex;gap:1px;text-decoration:none}
.ar-cer-f u i{width:.68em;height:.68em;border-radius:50%;border:2px solid #2b2540;background:#e3dfea}
.ar-lit{animation:ar-lit .3s ease-out}@keyframes ar-lit{0%{transform:scale(1)}40%{transform:scale(1.9)}100%{transform:scale(1)}}
.ar-fed{animation:ar-fed .2s ease-out}@keyframes ar-fed{0%{transform:scale(1)}40%{transform:scale(1.1)}100%{transform:scale(1)}}
.ar-wake{animation:ar-wake .45s cubic-bezier(.3,1.5,.5,1)}@keyframes ar-wake{0%{transform:scale(.7)}35%{transform:scale(1.35);filter:brightness(1.6)}100%{transform:scale(1)}}
.ar-cerpop{animation:ar-cerpop .3s ease-out}@keyframes ar-cerpop{0%{transform:scale(1)}40%{transform:scale(1.025)}100%{transform:scale(1)}}
.ar-spk{position:fixed;left:0;top:0;width:.85em;height:.85em;border-radius:50%;border:2px solid #2b2540;box-shadow:0 0 .5em .1em rgba(255,255,255,.9);z-index:5}
.ar-badge{position:fixed;left:0;top:0;display:flex;align-items:center;gap:.15em;font-style:normal;font-size:1.9em;white-space:nowrap;color:#fff;-webkit-text-stroke:5px #2b2540;paint-order:stroke fill;z-index:6;filter:drop-shadow(0 3px 0 rgba(43,37,64,.4))}
.ar-best{display:none;position:absolute;right:3.7em;bottom:.5em;align-items:center;gap:.2em;font-size:1.05em;line-height:1;color:#ffe169;-webkit-text-stroke:3px #2b2540;paint-order:stroke fill}
.ar-best small{font-size:.85em;color:#fff;background:#2b2540;border-radius:.6em;padding:.12em .45em;-webkit-text-stroke:0;margin-right:.15em}
.ar-best.ar-on{display:flex;animation:ar-lit .35s ease-out}
.ar-fighting .ar-best small{display:none}
.ar-six{display:inline-flex;gap:.22em;align-items:center;vertical-align:middle}
.ar-six i{width:.8em;height:.8em;border-radius:50%;border:2px solid #2b2540}
.ar-six b{font-size:1.15em;line-height:.8;color:#ffd23f;-webkit-text-stroke:3px #2b2540;paint-order:stroke fill}
.ar-bump{animation:ar-bump .3s ease-out}
@keyframes ar-bump{0%{transform:scale(1)}40%{transform:scale(1.08)}100%{transform:scale(1)}}
.ar-ballx{display:none;float:right;width:1em;height:1em;border-radius:50%;border:2px solid #2b2540;margin-left:.3em;background:linear-gradient(135deg,transparent 42%,#c22 42%,#c22 58%,transparent 58%),#ddd}
.ar-noball .ar-ballx{display:inline-block}
.ar-ko{display:none;float:right;align-items:center;gap:.2em;margin-left:.4em;font-size:.9em}
.ar-ko.ar-on{display:inline-flex}
.ar-ko i{width:.95em;height:.95em;border-radius:50%;border:2px solid #2b2540;box-shadow:inset 0 -.32em 0 rgba(255,255,255,.75)}
.ar-keys{position:absolute;left:50%;bottom:1em;transform:translateX(-50%);font-size:.82em;white-space:nowrap;transition:opacity .5s}
.ar-keys.ar-gone{opacity:0}
.ar-keys kbd{display:inline-block;min-width:1.5em;margin:0 .1em;padding:0 .35em;border:2px solid #2b2540;border-bottom-width:4px;border-radius:.4em;background:#fff;font:inherit;text-align:center}
.ar-keys span{display:inline-block;width:.9em}
.ar-clock.ar-hot{background:#ff5a3a;color:#fff;animation:ar-pulse .45s ease-in-out infinite alternate}
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
export function injectStyle() { if (!HAS_DOM || document.getElementById('ar-style')) return; const s = document.createElement('style'); s.id = 'ar-style'; s.textContent = STYLE; document.head.appendChild(s); }
export const isMe = (tm) => (tm.me === undefined ? !!tm.human : !!tm.me);       // human: steered by a player; me: the player at this screen
export const teamLabel = (tm) => (isMe(tm) ? 'You' : tm.name);
