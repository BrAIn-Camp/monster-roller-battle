// Local Stadium-model build -- ONE switch, and everything it changes.
//
// The game proper never branches on this. main.js calls into this module at a handful of
// marked points and every one of them is a no-op while the switch is off, so the shipped
// game behaves exactly as it did before any of this existed.
//
// To turn it on: set LOCAL_MODELS below to true, and generate models/stadium/ as
// models/stadium/README.md describes. Both are needed. The asset check is deliberate
// belt-and-braces: a `true` committed here by accident still leaves the published build
// correct, because the folder it needs is gitignored and will not be there.
//
// What it changes, all of it:
//   - critters are drawn as their extracted model instead of the generated mesh, in the world and in the arena
//   - the dex card shows the model too, and every portrait (dex, HUD, results) is of the model
//   - where there is a model the generated critter is NEVER drawn in its place, not even while the model loads:
//     a critter is not drawn at all until its model has arrived
//   - critters take their name from the extracted metadata
//   - the ball is drawn with two coloured caps rather than the striped orb
//
// None of it is part of the game's rules: it is presentation only, so a round plays
// identically with the switch either way.
import * as THREE from 'three';
import { loadStadium, makeStadiumInstance, makeArenaActor, stadiumMeta, stillOf, stadiumBase } from './stadium.js';

export const LOCAL_MODELS = true;

// ---------------------------------------------------------------- state
let on = false;                 // LOCAL_MODELS *and* the models are actually present
let G = null;                   // the bits of main.js this module borrows, handed over by init()
export const isOn = () => on;

// ---------------------------------------------------------------- startup
// Resolves once it is known whether local mode is live. Safe to call either way: with the
// switch off it does not even fetch, so the shipped build never asks for the folder.
let readyDone;
const ready = new Promise((r) => { readyDone = r; });      // settles (true or false) once init knows
export async function init(host) {
  G = host;
  if (LOCAL_MODELS) {
    const meta = await stadiumMeta();
    if (meta) { on = true; applyNames(meta); }
    else console.info('local models: switch is on, but models/stadium/ is missing -- staying off');
  }
  readyDone(on);
  return on;
}

// ---------------------------------------------------------------- names
// The names in critters/*.js are placeholders for the 151 slots; the extracted metadata
// carries its own. Renaming in place is enough -- every screen reads spec.name live, and
// the dex save is keyed on spec.id, so nothing already caught is lost.
function applyNames(meta) {
  const { CREATURES, TITANS } = G;
  let n = 0;
  CREATURES.forEach((sp, i) => {
    const m = meta[String(sp.dex)];
    if (!m || !m.name) return;
    sp.name = m.name;
    if (TITANS[i]) TITANS[i].name = 'Titan ' + m.name;
    n++;
  });
  console.info('local models: renamed ' + n + ' critters');
}

// ---------------------------------------------------------------- the ball
// Two caps meeting at a dark seam, with a latch button on the front. The upper cap takes
// the team's colour and the lower varies, so four of them stay apart at a glance while
// they tumble. Returns null when off, and main.js draws its own striped orb instead.
const BALL_LOWER = [0xf3ead7, 0xf3ead7, 0x3b4668, 0xe9c21f];   // cream, cream, slate, gold
const BALL_SEAM = 0x2b2540;
let CAP;
export function ballParts(k, own) {
  if (!on) return null;
  const { mat, TEAMS } = G;
  if (!CAP) CAP = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const top = new THREE.Mesh(CAP, mat(TEAMS[k].hex));
  const low = new THREE.Mesh(CAP, mat(BALL_LOWER[k % BALL_LOWER.length]));
  low.rotation.x = Math.PI;
  const seam = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 28), mat(BALL_SEAM));
  seam.rotation.x = Math.PI / 2;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 18), mat(BALL_SEAM));
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16), mat(0xf7f4ec));
  rim.rotation.x = Math.PI / 2; rim.position.z = 0.93;
  btn.rotation.x = Math.PI / 2; btn.position.z = 0.97;
  const parts = [top, low, seam, rim, btn];
  if (own) {
    const trim = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.032, 6, 28), mat(0xffd23f));
    trim.rotation.x = Math.PI / 2;
    parts.push(trim);
  }
  for (const m of parts) m.castShadow = true;
  return parts;
}

// ---------------------------------------------------------------- the dex card
// Resolves to null when off, so the caller keeps the generated mesh it already drew.
export function dexModel(dex) { return on ? loadStadium(dex) : Promise.resolve(null); }
export function dexInstance(loaded) { return makeStadiumInstance(loaded); }

// ---------------------------------------------------------------- portraits
// One sheet of all 151, drawn from the models ahead of time (tools/faces/): 16 across, 112 px each, in dex order.
// Resolves to the image, or null when off or when the sheet is not there (the caller then takes them one at a time
// from the models).
export const FACE_PX = 112, FACE_COLS = 16;
export function faceSheet() {
  return ready.then((live) => (!live ? null : new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img); img.onerror = () => res(null);
    img.src = stadiumBase() + 'faces.png';
  })));
}

// ---------------------------------------------------------------- the arena
// A fighter for the arena fight: its model (not drawn until that has loaded; preload() is called while the wheel
// spins, so by the fight they are all there), or the generated mesh for good when the switch is off.
export function arenaActor(dex, mesh) { return makeArenaActor(dex, mesh, on); }
export function preload(dexes) { if (on) for (const d of dexes) loadStadium(d); }

// ---------------------------------------------------------------- critters in the world
// Every critter in the world is one plain mesh, and those batch into an instanced draw per species. With models,
// that mesh is the model standing still (still(), below): main.js asks for it the first time the critter is about to
// be seen and draws nothing for it until then, so the generated shape never appears where there is a model.
// A model that MOVES is its own draw call with a skeleton and cannot join the batches, so a budgeted pool shadows
// the critters worth it: in front of the camera, and big enough on screen to tell apart. The still mesh is hidden
// (main.js reads o.understudy, the one field this module writes onto a game object) and the animated model is drawn
// at its transform. This runs wherever the world is on show, not only during a round.
//
// still(dex) resolves to { geo, mat }, or to null when there are no models (or none for that species): only then
// does main.js fall back to the generated shape.
export function still(dex) { return ready.then((live) => (live ? loadStadium(dex).then((l) => (l ? stillOf(l) : null)) : null)); }

//
// Tuned by measurement: 240 models hold a locked 60 fps with a 19 ms worst frame. Below
// 5px the count stops climbing -- the frustum and the critters in view run out first.
// Density varies a lot by habitat, so the cap is what protects the frame rate.
let budgetMax = 240;                    // live models at once
let budgetPx = 5;                       // smallest on-screen height worth a model
const ACQUIRE_PER_FRAME = 8;            // spread cloning over frames so movement does not hitch
const POOL_PER_SPECIES = 6;             // spare instances kept rather than disposed
const live = new Map();                 // o -> { inst, dex } | 'loading'
const spares = new Map();               // dex -> [instances]
const vScale = new THREE.Vector3(), vSphere = new THREE.Sphere();
const vFrustum = new THREE.Frustum(), vProj = new THREE.Matrix4();

function take(dex, loaded) {
  const pool = spares.get(dex);
  if (pool && pool.length) return pool.pop();
  return makeStadiumInstance(loaded);
}
function give(u) {
  G.scene.remove(u.inst.root);
  const pool = spares.get(u.dex) || [];
  if (pool.length < POOL_PER_SPECIES) { pool.push(u.inst); spares.set(u.dex, pool); }
  else u.inst.dispose();
}
function release(o) { o.understudy = false; o.group.visible = true; }     // (its still mesh again; a round's view cull hides it again if it is out of range)
export function clearWorld() {
  if (!live.size) return;
  for (const [o, u] of live) { if (u !== 'loading') give(u); release(o); }
  live.clear();
}
export function tickWorld(dt) {
  if (!on || budgetMax <= 0) { clearWorld(); return; }
  const { scene, camera, renderer, S, baseOf } = G;
  vProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  vFrustum.setFromProjectionMatrix(vProj);
  const px = renderer.domElement.height || 1080, cam = camera.position;
  const cand = [];
  // Both lists, without building a third every frame: attach() splices a critter out of
  // S.objects and into S.attached, so the ones stuck to the ball -- the closest things to
  // the camera there are -- are only ever found in the second.
  for (let l = 0; l < 2; l++) for (const o of (l ? S.attached : S.objects)) {
    const g = o.group;
    if (o.kind !== 'creature' || o.gone || !g.parent) continue;
    // Only one that is already drawn as its still model, in that model's own colours: until the still has arrived
    // there is nothing to stand in for, and one wearing something special (gold) keeps it.
    if (!g.userData.om || g.material !== g.userData.om) continue;
    // Where it is in the world. A free critter's parent sits at the origin and is never given a world matrix (its
    // children are drawn in batches), so its own position is the answer; one stuck to a ball is positioned
    // relative to the ball, and the renderer worked out its world matrix this frame.
    let x = g.position.x, y = g.position.y, z = g.position.z;
    if (o.on) { const e = g.matrixWorld.elements; x = e[12]; y = e[13]; z = e[14]; }
    const dx = x - cam.x, dy = y - cam.y, dz = z - cam.z;
    const d2 = dx * dx + dy * dy + dz * dz;
    // a thing of height h at distance d covers about h / (1.04 * d) of the screen height at this fov
    if (px * o.size / (1.04 * Math.sqrt(d2) + 1e-3) < budgetPx) continue;
    vSphere.center.set(x, y, z);
    vSphere.radius = o.size;
    if (!vFrustum.intersectsSphere(vSphere)) continue;               // behind or beside the camera
    cand.push({ o, d2 });
  }
  cand.sort((a, b) => a.d2 - b.d2);                                  // nearest first
  const want = new Set(cand.slice(0, budgetMax).map((c) => c.o));
  for (const [o, u] of [...live]) {
    if (want.has(o)) continue;
    if (u !== 'loading') give(u);
    release(o);
    live.delete(o);
  }
  let budget = ACQUIRE_PER_FRAME;
  for (const o of want) {
    if (live.has(o)) continue;
    if (budget-- <= 0) break;
    const dex = baseOf(o.spec).dex;
    live.set(o, 'loading');
    loadStadium(dex).then((l) => {
      if (live.get(o) !== 'loading') return;                         // released while it loaded
      if (!l) { live.delete(o); return; }
      const inst = take(dex, l);
      scene.add(inst.root);
      live.set(o, { inst, dex });
    });
  }
  for (const [o, u] of live) {
    if (u === 'loading') continue;
    const g = o.group, r = u.inst.root;
    o.understudy = true;
    g.visible = false;   // the cull runs before this and would leave it on for a frame, drawing both
    if (o.on) { g.getWorldPosition(r.position); g.getWorldQuaternion(r.quaternion); r.scale.copy(g.getWorldScale(vScale)); }
    else { r.position.copy(g.position); r.quaternion.copy(g.quaternion); r.scale.copy(g.scale); }
    u.inst.update(dt);
  }
}

// ---------------------------------------------------------------- console
export function hooks(S) {
  if (!on) return;
  S.models = (n, px) => {
    budgetMax = n === undefined ? 240 : Math.max(0, n);
    if (px !== undefined) budgetPx = px;
    clearWorld();
    return `models: up to ${budgetMax} at once, down to ${budgetPx}px on screen`;
  };
}
