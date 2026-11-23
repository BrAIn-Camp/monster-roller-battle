// Checks the baked props against the game's own records. Returns a line of counts and any faults found.
window.__inv = () => {
  const G = __game, X = G.gfx, bad = [];
  let baked = 0, loose = 0, waiting = 0, blank = 0, cells = 0;
  const inCell = new Set();
  for (const c of X.cells) {
    if (c.far) cells++;
    for (let i = 0; i < c.items.length; i++) {
      const o = c.items[i], live = o.baked && o.cell === c && o.bi === i;
      for (const part of [c.far, c.near]) {
        if (!part) continue;
        const from = i ? part.end[i - 1] : 0, to = part.end[i], a = part.mesh.geometry.index.array;
        let zero = true; for (let k = from; k < to; k++) if (a[k] !== 0) { zero = false; break; }
        if (live && zero && to > from + 3) bad.push('baked but blank: ' + o.spec.id);
        if (!live && !zero) bad.push('gone but still drawn: ' + o.spec.id + ' on=' + o.on + ' gone=' + o.gone + ' fly=' + !!o.fly);
      }
      if (live) { inCell.add(o); if (o.on || o.gone || o.fly) bad.push('baked while ' + (o.on ? 'on a ball' : o.gone ? 'gone' : 'flying') + ': ' + o.spec.id); const p = o.group.position; if (p.x !== o.bkx || p.z !== o.bkz) bad.push('baked but moved: ' + o.spec.id); }
      else blank++;
    }
  }
  for (const o of G.objects) { if (o.kind !== 'item') continue; if (o.baked) { baked++; if (!inCell.has(o)) bad.push('says baked, in no cell: ' + o.spec.id); } else if (o.cell) waiting++; else loose++; }
  for (const B of [G, ...G.rivals]) for (const o of B.attached) if (o.baked || o.cell) bad.push('on a ball but baked: ' + o.spec.id);
  return `items free ${baked + loose + waiting}: baked ${baked}, waiting for their cell ${waiting}, loose ${loose}; blanked slots ${blank}; cells ${cells}; queue ${X.bakeQueue.size}; faults ${bad.length}` + (bad.length ? '\n  ' + [...new Set(bad)].slice(0, 12).join('\n  ') : '');
};
'ready'
