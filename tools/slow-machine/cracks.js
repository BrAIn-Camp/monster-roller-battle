// Looks for pinholes in the ground: draws the ground alone against bright magenta from many places and counts the
// magenta pixels that have ground on every side.
(() => {
  const G = __game, X = G.gfx, R = X.renderer, sc = X.scene, cam = X.camera, gl = R.getContext();
  const was = { bg: sc.background, fog: sc.fog, state: G.state };
  G.state = 'paused';
  const ground = new Set(), hidden = [];
  for (const o of sc.children) {
    const isGround = o.isMesh && !o.isInstancedMesh && o.material && o.material.map && o.material.vertexColors;
    if (isGround) ground.add(o); else if (o.visible && !o.isLight) { hidden.push(o); o.visible = false; }
  }
  sc.background = new (sc.background.constructor)(1, 0, 1); sc.fog = null;
  for (const o of ground) o.material.needsUpdate = true;
  const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(w * h * 4);
  let holes = 0, views = 0, worst = 0, worstAt = '';
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const tint = (i) => Math.min(px[i], px[i + 2]) - px[i + 1];
  const mag = (i) => tint(i) > 30; const clean = (i) => tint(i) < 8; let sky = 0, land = 0;
  for (let v = 0; v < 60; v++) {
    const x = (rnd() - 0.5) * 380, z = (rnd() - 0.5) * 380, y = G.groundAt(x, z) + 1.5 + rnd() * rnd() * 40, a = rnd() * 6.283;
    cam.position.set(x, y, z); cam.near = 0.1; cam.far = 2500; cam.updateProjectionMatrix();
    cam.lookAt(x + Math.sin(a) * 30, y - 2 - rnd() * 12, z + Math.cos(a) * 30);
    cam.updateMatrixWorld();
    R.render(sc, cam);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let n = 0;
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      const k = (j * w + i) * 4;
      if (mag(k)) { sky++; if (clean(k - 4) && clean(k + 4) && clean(k - w * 4) && clean(k + w * 4)) n++; } else land++;
    }
    holes += n; views++;
    if (n > worst) { worst = n; worstAt = `${x.toFixed(0)},${y.toFixed(0)},${z.toFixed(0)} facing ${a.toFixed(2)}`; }
  }
  sc.background = was.bg; sc.fog = was.fog;
  for (const o of ground) o.material.needsUpdate = true;
  for (const o of hidden) o.visible = true;
  G.state = was.state;
  return `ground meshes ${ground.size}, ${views} views at ${w}x${h}: ${holes} pinhole pixels in all, worst view ${worst} (${worstAt}); magenta ${sky} px, ground ${land} px`;
})()
