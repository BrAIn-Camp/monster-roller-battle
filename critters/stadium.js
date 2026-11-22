// Loads Pokemon Stadium (N64) battle models for the dex close-ups.
//
// These are optional: the folder is generated from a cartridge the player supplies
// (see models/stadium/README.md) and is NOT part of the repository. Everything here
// resolves to null when the folder is absent, and the caller falls back to the
// generated critter mesh in critters/kit.js.
//
// A model is one glTF mesh of several primitives sharing one skin, so the loaded
// scene is a group of SkinnedMeshes in primitive order. Scale lives on the
// model_root node, so it is normalised by transforming a wrapper node and never
// by touching geometry: baking a matrix into a skinned mesh breaks its bind pose.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

// Resolved against this module, not the page, so it holds wherever the page lives.
const BASE = new URL('../models/stadium/', import.meta.url).href;
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
  const root = cloneSkinned(loaded.root), meshes = [];
  root.traverse((n) => { if (n.isMesh) meshes.push(n); });
  const mixer = new THREE.AnimationMixer(root);
  const want = entry.anims.find((a) => a.name === animName) || entry.anims[0];
  const clip = clips[want.i] || clips[0];
  if (clip) mixer.clipAction(clip).play();

  // Texture animation: blinking and the dizzy swirl are per-frame texture SWAPS,
  // which glTF 2.0 cannot express, so the .glb carries only the first frame and
  // the streams live in meta.json. One primitive owns the eye material.
  let eye = null;
  const aux = entry.aux && entry.aux.find((a) => a.i === want.aux);
  if (entry.eye && aux && meshes[entry.eye.prim]) {
    const stream = aux.ch[entry.eye.channel] || aux.ch[0];
    if (stream && stream.length) {
      for (const v of new Set(stream)) if (entry.eye.map[v]) texFor(entry.slug, entry.eye.map[v]);
      // the clone shares materials, so this one is copied before its map is swapped
      const m = meshes[entry.eye.prim];
      m.material = m.material.clone();
      eye = { mat: m.material, stream, frames: aux.frames || stream.length, last: -1 };
    }
  }

  // Effect flipbooks loop seamlessly over their own frame count, so any rate reads
  // right; 12 fps is about where the fire stops looking like a slideshow.
  const FX_FPS = 12;
  const fx = (entry.fx || []).map((f) => {
    const m = meshes[f.prim];
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
      if (!eye) return;
      const f = Math.floor(t * 30) % eye.frames;          // animations are authored at 30 fps
      if (f === eye.last) return;
      eye.last = f;
      const png = entry.eye.map[eye.stream[f % eye.stream.length]];
      if (png) eye.mat.map = texFor(entry.slug, png);
    },
    dispose() { mixer.stopAllAction(); mixer.uncacheRoot(root); },
  };
}
