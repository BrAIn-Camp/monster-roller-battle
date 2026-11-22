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
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Where the models live. The default sits beside this module and is resolved against the
// module rather than the page, so it holds wherever the page lives. Repoint it without
// editing anything with ?stadium=<path> on the address, or by setting `stadiumPath` in
// localStorage -- either an absolute URL or a path relative to the page. That lets the
// folder live outside the project (another drive, a shared folder) while the checkout
// stays clean.
function basePath() {
  let p = null;
  try { p = new URLSearchParams(location.search).get('stadium') || localStorage.getItem('stadiumPath') || null; } catch (e) { /* no DOM, or storage blocked */ }
  if (p) return new URL(p.endsWith('/') ? p : p + '/', location.href).href;
  return new URL('../models/stadium/', import.meta.url).href;
}
const BASE = basePath();
export const stadiumBase = () => BASE;
const loader = new GLTFLoader(), texLoader = new THREE.TextureLoader();
const modelCache = new Map(), texCache = new Map();
let metaP;

// The whole set's animation and eye-swap data, ~430 KB. Resolves to null when the
// models have not been extracted, which is the normal case for a fresh checkout.
export function stadiumMeta() {
  if (!metaP) metaP = fetch(BASE + 'meta.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
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
    t = texLoader.load(BASE + 'tex/' + slug + '/' + png);
    t.flipY = false;
    fixTexture(t);
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
  const merged = mergeGeometries(geos, false);
  if (!merged) return null;
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
  return {
    root,
    update(dt) {
      mixer.update(dt);
      t += dt;
      for (const f of fx) {
        const i = Math.floor(t * FX_FPS) % f.frames.length;
        if (i !== f.last) { f.last = i; f.mat.map = texFor(entry.slug, f.frames[i]); }
      }
    },
    dispose() { mixer.stopAllAction(); mixer.uncacheRoot(root); },
  };
}
