// Builds one merged, vertex-coloured mesh geometry for a critter from its `parts` list.
//
// A part is  [shape, colour, size, position, rotation?, mirror?]
//   shape     'sph' | 'box' | 'cyl' | 'cone' | 'taper' | 'torus' | 'rock' | 'hemi'
//             every shape fills a 1 x 1 x 1 box before sizing:
//             sph = ball, cyl = upright cylinder, cone = upright cone (point up),
//             taper = cylinder narrower at the top, torus = ring lying flat,
//             rock = faceted lump, hemi = dome (flat side down)
//   colour    0xRRGGBB
//   size      [width (x), height (y), depth (z)]
//   position  [x, y, z] of the part's centre.  +z is the critter's front, +y is up, feet at y = 0
//   rotation  [x, y, z] in degrees (optional)
//   mirror    true = also add a copy on the other side (x negated) (optional)
// Special part:  ['eye', radius, [x, y, z]]   a dark eye, always mirrored.
//
// Parts are authored to fit roughly inside a 1-unit box. The result is re-centred, stood on y = 0 and
// scaled so its longest side is exactly 1, so the game can scale it by the critter's height in metres.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Two sets of the basic shapes. FINE is for a critter seen close up (the dex, the pop-up card). PLAIN is for the
// thousands on the map, where each is a few centimetres on screen: about a third of the triangles, and eyes of 40
// triangles instead of 350 each.
function shapes(sw, sh, round, tube, ring) {
  const dome = new THREE.SphereGeometry(0.5, sw, Math.max(3, sh >> 1), 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 2, 1); dome.translate(0, -0.5, 0);
  const set = {
    sph: new THREE.SphereGeometry(0.5, sw, sh),
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, round),
    cone: new THREE.ConeGeometry(0.5, 1, round),
    taper: new THREE.CylinderGeometry(0.3, 0.5, 1, round),
    torus: new THREE.TorusGeometry(0.38, 0.12, tube, ring).rotateX(Math.PI / 2),
    rock: new THREE.DodecahedronGeometry(0.5, 0),
    hemi: dome,
    eye: new THREE.SphereGeometry(0.5, Math.max(6, sw >> 1), Math.max(4, sh >> 1)),
  };
  for (const k in set) { const g = set[k].index ? set[k].toNonIndexed() : set[k]; g.deleteAttribute('uv'); set[k] = g; }
  return set;
}
const FINE = shapes(16, 12, 14, 8, 18), PLAIN = shapes(10, 7, 8, 5, 10);
let BASE = PLAIN;

const D = Math.PI / 180;
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
const vp = new THREE.Vector3(), vs = new THREE.Vector3();

function piece(shape, colour, size, pos, rot) {
  const base = BASE[shape];
  if (!base) throw new Error('unknown shape ' + shape);
  const g = base.clone();
  e.set((rot ? rot[0] : 0) * D, (rot ? rot[1] : 0) * D, (rot ? rot[2] : 0) * D);
  m4.compose(vp.set(pos[0], pos[1], pos[2]), q.setFromEuler(e), vs.set(size[0], size[1], size[2]));
  g.applyMatrix4(m4);
  c.setHex(colour);
  const n = g.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function buildCritterGeometry(spec, fine = false) {
  BASE = fine ? FINE : PLAIN;
  const out = [];
  for (const p of spec.parts) {
    if (p[0] === 'eye') {
      const r = p[1] * 2, [x, y, z] = p[2];
      out.push(piece('eye', 0x15151f, [r, r, r], [x, y, z]), piece('eye', 0x15151f, [r, r, r], [-x, y, z]));
      out.push(piece('eye', 0xffffff, [r * 0.35, r * 0.35, r * 0.35], [x + r * 0.15, y + r * 0.2, z + r * 0.36]), piece('eye', 0xffffff, [r * 0.35, r * 0.35, r * 0.35], [-x + r * 0.15, y + r * 0.2, z + r * 0.36]));
      continue;
    }
    const [shape, colour, size, pos, rot, mirror] = p;
    out.push(piece(shape, colour, size, pos, rot));
    if (mirror) out.push(piece(shape, colour, size, [-pos[0], pos[1], pos[2]], rot ? [rot[0], -rot[1], -rot[2]] : null));
  }
  const g = mergeGeometries(out, false);
  for (const o of out) o.dispose();
  g.computeBoundingBox();
  const b = g.boundingBox, sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  const k = 1 / (Math.max(sx, sy, sz) || 1);
  g.scale(k, k, k);
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

export const critterMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });

// Checks a critter entry and returns a list of problems (empty = fine). No three.js needed by callers.
export const TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel'];
export const HABITATS = ['town', 'beach', 'tidepool', 'sea', 'farm', 'marsh', 'forest', 'gorge', 'plain', 'canyon', 'mountain', 'summit', 'volcano', 'ruins', 'islet'];
export const MOVES = ['walk', 'hop', 'fly', 'float', 'swim', 'slither', 'still'];
export const TEMPERS = ['timid', 'calm', 'curious', 'bold'];
export const RARITIES = ['common', 'uncommon', 'rare', 'unique'];
