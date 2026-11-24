// Loads Pokemon Stadium (N64) battle models for the dex close-ups.
//
// These are optional: the folder is generated from a cartridge the player supplies
// (see models/stadium/README.md) and is NOT part of the repository. Everything here
// resolves to null when the folder is absent, and the caller falls back to the
// generated critter mesh in critters/kit.js.
//
// A model is one glTF mesh of several primitives sharing one skin, so glTF gives a group
// of SkinnedMeshes in primitive order -- up to 29 of them, one draw call each, because
// every primitive carries its own small texture. On load they are packed into a single
// atlas, their UVs remapped into it and their geometry merged, leaving ONE draw call for
// the body. The eye and the generated effects stay separate: the eye swaps its texture
// per frame and the effects draw additively, neither of which survives a merge. That is
// 1-2 draw calls per model in place of 17.
//
// Scale lives on the model_root node, so it is normalised by transforming a wrapper node
// and never by touching geometry: baking a matrix into a skinned mesh breaks its bind pose.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Where the models live. The default sits beside this module and is resolved against the
// module rather than the page, so it holds wherever the page lives. Repoint it without
// editing anything with ?stadium=<path> on the address, or by setting `stadiumPath` in
// localStorage -- either an absolute URL or a path relative to the page. That lets the
// folder live outside the project (another drive, a shared folder) while the checkout
// stays clean.
//
// Left alone, there are two places to look, in this order: models/pbr/ (the Battle Revolution set made by
// tools/pbr, which runs to slot 493) and models/stadium/ (the Stadium set, the first 151). The first that has a
// meta.json is the set used for everything; BASE is only known once stadiumMeta() has resolved.
function basePaths() {
  let p = null;
  try { p = new URLSearchParams(location.search).get('stadium') || localStorage.getItem('stadiumPath') || null; } catch (e) { /* no DOM, or storage blocked */ }
  if (p) return [new URL(p.endsWith('/') ? p : p + '/', location.href).href];
  return [new URL('../models/pbr/', import.meta.url).href, new URL('../models/stadium/', import.meta.url).href];
}
const BASES = basePaths();
let BASE = BASES[BASES.length - 1];
export const stadiumBase = () => BASE;
const loader = new GLTFLoader(), texLoader = new THREE.TextureLoader();
const modelCache = new Map(), texCache = new Map();
let metaP;

// The whole set's animation and eye-swap data, ~430 KB. Resolves to null when the
// models have not been extracted, which is the normal case for a fresh checkout.
export function stadiumMeta() {
  if (!metaP) metaP = (async () => {
    for (const base of BASES) {
      try { const r = await fetch(base + 'meta.json'); if (r.ok) { const meta = await r.json(); BASE = base; return meta; } } catch (e) { /* not there: try the next */ }
    }
    return null;
  })();
  return metaP;
}

// N64 textures are 32x32 and 32x64: linear magnification smears them to mush at
// dex size, so magnify with NearestFilter and leave minification alone.
function fixTexture(t) {
  if (!t) return;
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
}

// A loose PNG that gets swapped into a material at run time (eye frames, effect
// flipbooks). flipY matches the glTF convention of the baked-in map it replaces.
function texFor(slug, png) {
  const key = slug + '/' + png;
  let t = texCache.get(key);
  if (!t) {
    // (not fixTexture: that marks the texture for upload, and until the file has arrived there is nothing to
    // upload, which made the renderer warn on every frame in between. The loader marks it itself when it lands.)
    t = texLoader.load(BASE + 'tex/' + slug + '/' + png);
    t.flipY = false;
    t.magFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    texCache.set(key, t);
  }
  return t;
}

// Loads species `dex` (1-151). Resolves to null when there is no model for it, so
// every caller must handle null.
export function loadStadium(dex) {
  const key = String(dex);
  if (!modelCache.has(key)) modelCache.set(key, build(key).catch((e) => { console.warn('stadium model failed for', key, e); return null; }));
  return modelCache.get(key);
}

// Packs the body primitives' textures into one atlas, remaps their UVs into it and
// merges their geometry, so the body draws in one call instead of one per primitive.
// Safe because the export samples CLAMP_TO_EDGE: UVs are clamped to [0,1] before being
// mapped into a tile, which is what the sampler would have done anyway. Each tile is
// padded with a smeared copy of itself so filtering cannot pull in a neighbour, and the
// atlas carries no mipmaps, which would blend tiles together at distance.
const ATLAS_PAD = 2;
// Some primitives carry no texture at all and are drawn in a flat material colour. They
// get a single white texel in the atlas, and every primitive's colour is baked into a
// vertex-colour attribute, so one merged material covers textured and untextured alike.
let whiteTile;
function whitePixel() {
  if (!whiteTile) {
    whiteTile = document.createElement('canvas');
    whiteTile.width = whiteTile.height = 1;
    const c = whiteTile.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, 1, 1);
  }
  return whiteTile;
}
function packAtlas(images) {
  const tiles = images.map((img, i) => ({ i, img, w: img.width, h: img.height }));
  const order = tiles.slice().sort((a, b) => b.h - a.h || b.w - a.w);
  let size = 64;
  for (;;) {
    let x = 0, y = 0, shelf = 0, ok = true;
    for (const t of order) {
      const tw = t.w + ATLAS_PAD * 2, th = t.h + ATLAS_PAD * 2;
      if (x + tw > size) { x = 0; y += shelf; shelf = 0; }
      if (y + th > size) { ok = false; break; }
      t.x = x; t.y = y; x += tw; shelf = Math.max(shelf, th);
    }
    if (ok) break;
    size *= 2;
    if (size > 4096) return null;                       // give up and leave the prims apart
  }
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d', { willReadFrequently: false });
  ctx.imageSmoothingEnabled = false;
  for (const t of order) {
    ctx.drawImage(t.img, t.x, t.y, t.w + ATLAS_PAD * 2, t.h + ATLAS_PAD * 2);   // smeared, fills the padding
    ctx.drawImage(t.img, t.x + ATLAS_PAD, t.y + ATLAS_PAD);                     // the tile itself, exact
  }
  const rects = [];
  for (const t of tiles) rects[t.i] = { x: (t.x + ATLAS_PAD) / size, y: (t.y + ATLAS_PAD) / size, w: t.w / size, h: t.h / size };
  return { canvas: cv, rects, size };
}

// Rewrites a geometry's UVs into its tile. Everything outside [0,1] is clamped first,
// since the sampler clamped it before and an atlas has no room to run past a tile.
function remapUV(geo, r) {
  const uv = geo.attributes.uv;
  if (!uv) return;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, r.x + Math.min(1, Math.max(0, uv.getX(i))) * r.w,
                r.y + Math.min(1, Math.max(0, uv.getY(i))) * r.h);
  }
  uv.needsUpdate = true;
}

// Replaces `parts` (SkinnedMeshes of one skin) with a single merged SkinnedMesh.
// Returns it, or null if anything about them rules a merge out.
function mergeBody(parts) {
  if (parts.length < 2) return null;
  const images = parts.map((m) => {
    const img = m.material.map && m.material.map.image;
    return img && img.width ? img : whitePixel();
  });
  const atlas = packAtlas(images);
  if (!atlas) return null;
  const geos = [];
  for (let i = 0; i < parts.length; i++) {
    const g = parts[i].geometry.index ? parts[i].geometry.toNonIndexed() : parts[i].geometry.clone();
    for (const a of Object.keys(g.attributes)) {
      if (!['position', 'normal', 'uv', 'skinIndex', 'skinWeight'].includes(a)) g.deleteAttribute(a);
    }
    if (!g.attributes.skinIndex) return null;
    if (!g.attributes.uv) {                             // untextured: point every vertex at the white texel
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    remapUV(g, atlas.rects[i]);
    const col = parts[i].material.color || new THREE.Color(0xffffff);
    const n = g.attributes.position.count, cols = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { cols[k * 3] = col.r; cols[k * 3 + 1] = col.g; cols[k * 3 + 2] = col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geos.push(g);
  }
  const loose = mergeGeometries(geos, false);
  if (!loose) return null;
  // (the prims come apart as loose triangles, three corners each; welding the corners that are the same in every
  // respect leaves about a third as many vertices to skin, to draw and to keep poses of)
  const merged = mergeVertices(loose);
  loose.dispose();
  const tex = new THREE.CanvasTexture(atlas.canvas);
  tex.flipY = false;                                    // glTF convention, as the source maps were
  tex.generateMipmaps = false;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  // one material for the lot, so the loosest of the originals' settings has to cover all
  const twoSided = parts.some((m) => m.material.side === THREE.DoubleSide);
  const sm = new THREE.SkinnedMesh(merged, new THREE.MeshLambertMaterial({
    map: tex, alphaTest: 0.5, vertexColors: true,
    side: twoSided ? THREE.DoubleSide : THREE.FrontSide,
  }));
  sm.castShadow = true;
  sm.bind(parts[0].skeleton, parts[0].bindMatrix);
  sm.bindMode = parts[0].bindMode;
  return sm;
}

async function build(key) {
  const meta = await stadiumMeta();
  const entry = meta && meta[key];
  if (!entry) return null;
  const gltf = await loader.loadAsync(BASE + 'glb/' + entry.slug + '.glb');
  const model = gltf.scene, meshes = [];
  model.traverse((n) => {
    if (!n.isMesh) return;
    meshes.push(n);
    // glTF gives MeshStandardMaterial, which needs an environment map to read well.
    // Lambert matches the rest of the game's look and is cheaper; alphaTest comes
    // from the export's alphaMode MASK and must survive, or cut-out edges go solid.
    const src = n.material;
    fixTexture(src.map);
    n.material = new THREE.MeshLambertMaterial({
      map: src.map, color: src.color, side: src.side,
      alphaTest: src.alphaTest || 0.5, transparent: false,
    });
    src.dispose();
    n.castShadow = true;
  });

  // The fire and gas are NOT extracted game data -- the real effects live in the
  // battle fragments, so the pipeline generates original flipbooks on crossed quads.
  // They are unlit and must not alpha-test or write depth, or the quads punch holes
  // in each other and the body shows through the flame.
  for (const f of entry.fx || []) {
    const n = meshes[f.prim];
    if (!n) continue;
    const old = n.material;
    n.material = new THREE.MeshBasicMaterial({
      map: old.map, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: f.kind === 'gas' ? THREE.NormalBlending : THREE.AdditiveBlending,
      opacity: f.kind === 'gas' ? 0.75 : 1,
    });
    old.dispose();
    n.castShadow = false;
    n.renderOrder = 1;
  }

  // Name the prims by role: instances are clones, so a reference would not survive, and
  // merging the body renumbers everything an index would have pointed at.
  (entry.fx || []).forEach((f, i) => { if (meshes[f.prim]) meshes[f.prim].name = 'fx' + i; });

  // Merge everything that is not an effect into one mesh. The eye goes in with the rest:
  // nothing swaps its texture any more, so it has no reason to stay its own draw call.
  const keepApart = new Set();
  for (const f of entry.fx || []) keepApart.add(f.prim);
  const body = meshes.filter((m, i) => !keepApart.has(i));
  const bodyMesh = mergeBody(body);
  if (bodyMesh) {
    const parent = body[0].parent;
    for (const m of body) { m.removeFromParent(); m.geometry.dispose(); m.material.map = null; m.material.dispose(); }
    bodyMesh.name = 'body';
    parent.add(bodyMesh);
  }

  // Normalise on a wrapper: centred in x/z, standing on y = 0, longest side 1,
  // which is the same contract buildCritterGeometry gives the generated meshes.
  const root = new THREE.Group();
  root.add(model);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
  const k = 1 / (Math.max(size.x, size.y, size.z) || 1);
  model.scale.multiplyScalar(k);
  model.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);

  return { entry, root, meshes, clips: gltf.animations };
}

// One playable instance. `root` goes in the scene; call `update(dt)` each frame.
// The loaded model is cached and shared, so each instance gets its own clone --
// SkeletonUtils.clone, because a plain clone() rebinds nothing and the skin breaks.
export function makeStadiumInstance(loaded, animName = 'idle') {
  const { entry, clips } = loaded;
  const root = cloneSkinned(loaded.root);
  const byRole = (name) => root.getObjectByName(name);    // the body merge renumbers prims, so roles are named
  const mixer = new THREE.AnimationMixer(root);
  const want = entry.anims.find((a) => a.name === animName) || entry.anims[0];
  const clip = clips[want.i] || clips[0];
  if (clip) mixer.clipAction(clip).play();

  // The eye-swap streams in meta.json are deliberately unused. Played as a loop they
  // blink constantly, and several species carry a separate primitive per eye so only one
  // side animates. The game does not need it, so the eye keeps its open frame and the
  // primitive merges into the body with everything else.

  // Effect flipbooks loop seamlessly over their own frame count, so any rate reads
  // right; 12 fps is about where the fire stops looking like a slideshow.
  const FX_FPS = 12;
  const fx = (entry.fx || []).map((f, i) => {
    const m = byRole('fx' + i);
    if (!m || !f.frames.length) return null;
    for (const png of f.frames) texFor(entry.slug, png);
    m.material = m.material.clone();
    return { mat: m.material, frames: f.frames, last: -1 };
  }).filter(Boolean);

  let t = 0;
  const flip = () => {
    for (const f of fx) {
      const i = Math.floor(t * FX_FPS) % f.frames.length;
      if (i !== f.last) { f.last = i; f.mat.map = texFor(entry.slug, f.frames[i]); }
    }
  };
  return {
    root,
    update(dt) { mixer.update(dt); t += dt; flip(); },
    at(time) { mixer.setTime(time); t = time; flip(); },      // the pose at that moment of a shared clock (see poseTo)
    dispose() { mixer.stopAllAction(); mixer.uncacheRoot(root); },
  };
}

// ---------------------------------------------------------------- standing still, and breathing
// A skeleton apiece is what makes a model dear: its bones are moved, multiplied out and sent to the graphics card
// every frame, and it is a draw call of its own (about 0.06 ms each, measured; 240 of them were most of a frame).
// So a critter in the world has none. It is drawn as a "still": the model's body as one plain (unskinned) geometry,
// in the same normalised frame as the model, which batches into one instanced draw per species however many there
// are. Effects (flames, gas) are left out of it.
//
// The still breathes all the same. Its idle loop is worked out ahead of time as POSES sets of vertex positions
// (bakePose, one pose a call so it can be spread over frames) and handed to the geometry as morph targets; the
// graphics card blends the two poses either side of now (poseTo sets the weights). Every mesh drawing the geometry
// must carry a set of weights as its morphTargetInfluences: still.infl to breathe (it is one array, so setting it once
// moves every mesh that has it, in step), or still.rest to hold the first pose.
//
// stillOf returns { geo, mat, infl, rest, fx, ... }, or null if the model's body is not one mesh.
export const POSES = 16;
const REST = Object.freeze(new Array(POSES).fill(0));

// One sheet of skins for every still. A material apiece meant that each species drawn was a change of material, and
// at every change three.js sends the whole set-up again (the lights, the fog, the shadow): a draw call of a critter
// cost four times one of a prop. So each model's skin, as it arrives, is copied into a free patch of one big texture
// and its still's UVs are moved to that patch; every still is then drawn with the same material (two of them really:
// `plain` for a shape that stands still and `moving` for one with poses, which are different programs, and each of
// those again for models that are drawn from both sides).
// shareSkins(renderer) sets it up. Without it (or on a card that cannot hold the texture) a still keeps a material
// of its own, as before.
const SHEET_W = 4096, SHEET_H = 2048, CELL = 64, COLS = SHEET_W / CELL, ROWS = SHEET_H / CELL;
let sheet = null;
export function shareSkins(renderer) {
  if (sheet !== null) return;
  sheet = false;
  try {
    if (!renderer.capabilities.isWebGL2 || renderer.capabilities.maxTextureSize < SHEET_W) return;
    const tex = new THREE.DataTexture(new Uint8Array(SHEET_W * SHEET_H * 4), SHEET_W, SHEET_H, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.flipY = false; tex.generateMipmaps = false; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    renderer.initTexture(tex);
    tex.image.data = null;                              // (it is on the card now, and filled from there on: no need to keep 32 MB of blank here)
    const mk = (side) => new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, vertexColors: true, side });
    const pair = () => ({ [THREE.FrontSide]: mk(THREE.FrontSide), [THREE.DoubleSide]: mk(THREE.DoubleSide) });
    sheet = { tex, renderer, used: new Uint8Array(COLS * ROWS), plain: pair(), moving: pair(), n: 0 };
  } catch (e) { console.warn('stadium: no shared skin sheet', e); sheet = false; }
}
export const skinSheet = () => sheet;
// Copies a skin into the first free patch of the sheet big enough for it. Returns where it went (in pixels), or null.
const spot = new THREE.Vector2();
function placeSkin(map) {
  const img = map && map.image, w = img && img.width, h = img && img.height;
  if (!sheet || !w || !h) return null;
  const cw = Math.ceil(w / CELL), ch = Math.ceil(h / CELL), used = sheet.used;
  for (let y = 0; y + ch <= ROWS; y++) for (let x = 0; x + cw <= COLS; x++) {
    let free = true;
    for (let j = 0; j < ch && free; j++) for (let i = 0; i < cw; i++) if (used[(y + j) * COLS + x + i]) { free = false; break; }
    if (!free) continue;
    try { sheet.renderer.copyTextureToTexture(spot.set(x * CELL, y * CELL), map, sheet.tex); } catch (e) { console.warn('stadium: skin not copied', e); return null; }
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) used[(y + j) * COLS + x + i] = 1;
    sheet.n++;
    return { x: x * CELL, y: y * CELL, w, h };
  }
  return null;
}

// A copy of the model, playing its idle clip, to read vertex positions out of.
function poseRig(loaded) {
  const root = cloneSkinned(loaded.root), { entry, clips } = loaded;
  let body = root.getObjectByName('body');
  if (!body) { const all = []; root.traverse((n) => { if (n.isSkinnedMesh && !/^fx\d+$/.test(n.name)) all.push(n); }); if (all.length === 1) body = all[0]; }
  if (!body || !body.isSkinnedMesh) return null;
  const mixer = new THREE.AnimationMixer(root);
  const want = entry.anims.find((a) => a.name === 'idle') || entry.anims[0], clip = (want && clips[want.i]) || clips[0];
  if (clip) mixer.clipAction(clip).play();
  return { root, body, mixer, dur: clip ? clip.duration : 0 };
}
function freeRig(rig) { rig.mixer.stopAllAction(); rig.mixer.uncacheRoot(rig.root); }
// Where each vertex of the body is at time t of the loop (into P), and if N is given which way it faces.
const pv = new THREE.Vector3(), pw = new THREE.Vector3();
function poseAt(rig, t, P, N) {
  rig.mixer.setTime(t);
  rig.root.updateMatrixWorld(true);
  const body = rig.body, src = body.geometry, pos = src.attributes.position, nor = N ? src.attributes.normal : null, n = pos.count;
  if (!src.boundingSphere) src.computeBoundingSphere();
  const eps = (src.boundingSphere.radius || 1) * 0.01;
  for (let i = 0; i < n; i++) {
    pv.fromBufferAttribute(pos, i);
    if (nor) pw.fromBufferAttribute(nor, i).multiplyScalar(eps).add(pv);
    body.applyBoneTransform(i, pv).applyMatrix4(body.matrixWorld);
    P[i * 3] = pv.x; P[i * 3 + 1] = pv.y; P[i * 3 + 2] = pv.z;
    if (nor) {                                            // (a normal goes wherever a point just along it went)
      body.applyBoneTransform(i, pw).applyMatrix4(body.matrixWorld).sub(pv).normalize();
      N[i * 3] = pw.x; N[i * 3 + 1] = pw.y; N[i * 3 + 2] = pw.z;
    }
  }
}
export function stillOf(loaded) {
  if (loaded.still !== undefined) return loaded.still;
  loaded.still = null;
  let rig = null;
  try {
    rig = poseRig(loaded);
    if (!rig) return null;
    const src = rig.body.geometry, n = src.attributes.position.count, nor = !!src.attributes.normal;
    const P = new Float32Array(n * 3), N = nor ? new Float32Array(n * 3) : null;
    poseAt(rig, 0, P, N);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    if (nor) geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    for (const a of ['uv', 'color']) if (src.attributes[a]) geo.setAttribute(a, src.attributes[a].clone());
    if (src.index) geo.setIndex(src.index.clone());
    if (!nor) geo.computeVertexNormals();
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    const infl = new Array(POSES).fill(0);
    // Its material: the shared one, with its skin copied into the sheet (see shareSkins); or failing that one of its
    // own, sharing the model's texture. (Never the model's own material: the skinned model and the still are
    // different shader programs, and one material drawn both ways has its program looked up again at every change.)
    const own = rig.body.material, side = own.side === THREE.DoubleSide ? THREE.DoubleSide : THREE.FrontSide;
    const at = own.side === THREE.BackSide ? null : placeSkin(own.map);
    let mat, movingMat = null;
    if (at) {
      const uv = geo.attributes.uv;
      if (uv) { for (let i = 0; i < uv.count; i++) uv.setXY(i, (at.x + uv.getX(i) * at.w) / SHEET_W, (at.y + uv.getY(i) * at.h) / SHEET_H); uv.needsUpdate = true; }
      if (!geo.attributes.color) {                        // (the shared material takes its colours from the corners)
        const c = own.color, col = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      mat = sheet.plain[side]; movingMat = sheet.moving[side];
    } else mat = own.clone();
    loaded.still = { geo, mat, movingMat, shared: !!at, infl, rest: REST, loaded, dur: rig.dur, fx: !!(loaded.entry.fx && loaded.entry.fx.length), poses: 0, bank: null, rig: null, moving: false, a: 0, b: 0 };
    geo.userData.infl = infl; geo.userData.still = loaded.still;
  } catch (e) { console.warn('stadium: no still for', loaded.entry && loaded.entry.slug, e); }
  if (rig) freeRig(rig);
  return loaded.still;
}
// Works out the next pose of a still's idle loop. Returns true once there is nothing left to do: either all POSES are
// in the geometry and still.moving is set, or the model has no clip to take them from and it stays as it is.
export function bakePose(still) {
  if (still.poses >= POSES) return true;
  try {
    if (!still.rig) { still.rig = poseRig(still.loaded); still.bank = []; }
    const rig = still.rig;
    if (!rig || !(rig.dur > 0)) throw new Error('no idle clip');
    const P = new Float32Array(still.geo.attributes.position.count * 3);
    poseAt(rig, still.poses / POSES * rig.dur, P, null);
    still.bank.push(new THREE.BufferAttribute(P, 3));
    if (++still.poses < POSES) return false;
    // all there. The sphere it is culled by has to hold every pose, not only the first.
    const bs = still.geo.boundingSphere, c = bs.center;
    let r2 = bs.radius * bs.radius;
    for (const a of still.bank) { const q = a.array; for (let i = 0; i < q.length; i += 3) { const dx = q[i] - c.x, dy = q[i + 1] - c.y, dz = q[i + 2] - c.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > r2) r2 = d2; } }
    bs.radius = Math.sqrt(r2);
    still.geo.morphAttributes.position = still.bank;
    still.dur = rig.dur; still.moving = true;
  } catch (e) { still.poses = POSES; if (!/no idle clip/.test(String(e))) console.warn('stadium: no poses for', still.loaded.entry && still.loaded.entry.slug, e); }
  if (still.rig) freeRig(still.rig);
  still.rig = still.bank = null;
  return true;
}
// Puts a moving still at time t of a clock that every one of them shares: the two poses either side, blended.
export function poseTo(still, t) {
  const f = (t / still.dur % 1) * POSES, i = Math.floor(f), a = i % POSES, b = (a + 1) % POSES, w = still.infl;
  w[still.a] = 0; w[still.b] = 0;
  w[a] = 1 - (f - i); w[b] = f - i;
  still.a = a; still.b = b;
}

// ---------------------------------------------------------------- the arena
// A fighter: the same clone, with its clips on call and a material of its own so it can flash when hit.
//   play(name, { dur, speed, hold })   'idle' loops; 'attack', 'special', 'faint' and 'entrance' play once and
//                                      then fall back to idle (unless hold). dur stretches the clip to that long.
//   flash(k, color)                    glow by k (0 to 1) in that colour
// Returns how long the clip will take, so the caller can time things to it.
export function makeStadiumActor(loaded) {
  const { entry, clips } = loaded;
  const root = cloneSkinned(loaded.root);
  const mixer = new THREE.AnimationMixer(root);
  const body = root.getObjectByName('body');
  const skin = body ? (body.material = body.material.clone()) : null;
  const find = (...names) => { for (const n of names) { const a = entry.anims.find((x) => x.name === n); if (a && clips[a.i]) return clips[a.i]; } return null; };
  const CLIP = {
    idle: find('idle'), attack: find('attack', 'attack_default'), special: find('attack_2', 'attack_3', 'attack_default', 'attack'),
    faint: find('faint'), entrance: find('entrance'), hurt: find('flinch', 'reaction_182', 'reaction_172', 'reaction_170'),
  };
  let cur = null, fallBack = false;
  function play(name, { dur = 0, speed = 1, hold = false, fade = 0.1 } = {}) {
    const clip = CLIP[name] || CLIP.idle;
    if (!clip) return 0;
    const act = mixer.clipAction(clip), loop = name === 'idle';
    act.reset();
    act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    act.clampWhenFinished = true;
    act.timeScale = dur > 0 ? clip.duration / dur : speed;
    act.enabled = true; act.setEffectiveWeight(1);
    act.play();
    if (cur && cur !== act) cur.crossFadeTo(act, fade, false);
    cur = act; fallBack = !loop && !hold;
    return clip.duration / act.timeScale;
  }
  mixer.addEventListener('finished', (e) => { if (e.action === cur && fallBack) play('idle', { fade: 0.2 }); });
  play('idle');
  if (cur) cur.time = Math.random() * cur.getClip().duration;      // so a row of the same species does not breathe in step

  const FX_FPS = 12;
  const fx = (entry.fx || []).map((f, i) => {
    const m = root.getObjectByName('fx' + i);
    if (!m || !f.frames.length) return null;
    for (const png of f.frames) texFor(entry.slug, png);
    m.material = m.material.clone();
    return { mat: m.material, frames: f.frames, last: -1 };
  }).filter(Boolean);
  let t = 0;
  return {
    root, play,
    has: (name) => !!CLIP[name],
    update(dt) {
      mixer.update(dt);
      t += dt;
      for (const f of fx) { const i = Math.floor(t * FX_FPS) % f.frames.length; if (i !== f.last) { f.last = i; f.mat.map = texFor(entry.slug, f.frames[i]); } }
    },
    flash(k, color = 0xffffff) { if (skin) skin.emissive.set(color).multiplyScalar(k); },
    dispose() { mixer.stopAllAction(); mixer.uncacheRoot(root); if (skin) skin.dispose(); for (const f of fx) f.mat.dispose(); },
  };
}

// What the arena is handed for every fighter, whether or not there is a model for it. `mesh` is the generated
// critter. Without models (`live` false) it is shown at once and that is that. With them it is never shown in a
// model's place: the fighter is simply not drawn until its model has loaded (straight away when it was preloaded),
// and the generated one appears only if there turns out to be no model for the species at all.
// The arena never needs to know which it is drawing.
export function makeArenaActor(dex, mesh, live) {
  const root = new THREE.Group();
  root.add(mesh);
  let inst = null, dead = false, asked = null, own = null, base = null, baseK = 1;
  const A = {
    root, rigged: false,
    // (the model always arrives a moment after the actor is made, even when it was preloaded, so what was asked of
    // it in that moment is remembered and played when it lands: a new fighter's entrance, a faint)
    play(name, o) { asked = { name, o, at: performance.now() }; return inst ? inst.play(name, o) : 0; },
    update(dt) { if (inst) inst.update(dt); },
    // A generated critter shares its team's material with every other one, so to glow alone it takes a copy the
    // first time it is asked to. Its glow fades from the team's own tint towards the colour asked for.
    flash(k, color = 0xffffff) {
      if (inst) { inst.flash(k, color); return; }
      if (!own) {
        if (k <= 0 || !mesh.material || !mesh.material.emissive) return;
        own = mesh.material = mesh.material.clone(); base = own.emissive.clone(); baseK = own.emissiveIntensity;
      }
      own.emissive.copy(base).lerp(tint.set(color), Math.min(1, k)); own.emissiveIntensity = baseK + (0.9 - baseK) * Math.min(1, k);
    },
    dispose() { dead = true; if (inst) inst.dispose(); if (own) own.dispose(); },
  };
  if (live) mesh.visible = false;
  if (live) loadStadium(dex).then((l) => {
    if (dead) return;
    if (!l) { mesh.visible = true; return; }
    inst = makeStadiumActor(l);
    root.remove(mesh); root.add(inst.root);
    A.rigged = true;
    if (asked && asked.name !== 'idle' && ((asked.o && asked.o.hold) || performance.now() - asked.at < 700)) inst.play(asked.name, asked.o);
  });
  return A;
}
const tint = new THREE.Color();
