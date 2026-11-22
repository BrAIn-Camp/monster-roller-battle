"""Populate models/stadium/ from the Stadium extraction pipeline's output.

    python tools/make-stadium-meta.py <pipeline-out-dir> <models/stadium>

Copies the 151 species' .glb, writes meta.json (animation lists, eye-swap streams,
effect prims) and copies only the loose PNGs that are swapped in at run time --
not the whole texture set, which the .glb files already carry embedded.
See models/stadium/README.md.
"""
import json, glob, os, shutil, sys

FIRE_FRAMES, GAS_FRAMES, GAS_SIZE = 8, 10, (48, 48)


def load(path):
    s = open(path, encoding='utf-8').read()
    return json.loads(s[s.index('(') + 1:s.rindex(')')])        # PKMN_LOAD({...});


def main(src, dst):
    texroot = os.path.join(dst, 'tex')
    glbroot = os.path.join(dst, 'glb')
    for d in (texroot, glbroot):
        shutil.rmtree(d, ignore_errors=True)
        os.makedirs(d, exist_ok=True)

    meta, pngs, glbs = {}, 0, 0
    for f in sorted(glob.glob(os.path.join(src, 'js', '[01]*.js'))):
        d = load(f)
        slug, species = os.path.basename(f)[:-3], d['species']
        names = {int(n.split('_')[0]): n for n in os.listdir(os.path.join(src, 'textures', slug))}
        want = set()

        eye = None
        for i, p in enumerate(d['prims']):
            ta = p.get('texAnim')
            if ta is not None and ta >= 0:
                m = {k: names[v] for k, v in (p.get('texMap') or {}).items()}
                want |= set(m.values())
                eye = {'prim': i, 'channel': ta, 'map': m}
                break

        fx = []
        for i, p in enumerate(d['prims']):
            if not p.get('generated'):
                continue
            t0 = p['tex']
            wh = (d['textures'][t0]['w'], d['textures'][t0]['h'])
            n = GAS_FRAMES if wh == GAS_SIZE else FIRE_FRAMES
            frames = [names[t] for t in range(t0, min(t0 + n, len(d['textures']))) if t in names]
            want |= set(frames)
            fx.append({'prim': i, 'kind': 'gas' if wh == GAS_SIZE else 'fire', 'frames': frames})

        meta[str(species)] = {
            'slug': slug, 'name': d['name'], 'eye': eye, 'fx': fx,
            'anims': [{'i': a['index'], 'name': a['name'], 'frames': a['frames'],
                       'loop': a['loopStart'], 'aux': a.get('aux', -1)} for a in d['anims']],
            'aux': [{'i': a['index'], 'frames': a['frames'], 'loop': a['loopStart'],
                     'ch': a['channels']} for a in d.get('auxAnims', [])],
        }

        shutil.copy(os.path.join(src, 'glb', slug + '.glb'), os.path.join(glbroot, slug + '.glb'))
        glbs += 1
        if want:
            out = os.path.join(texroot, slug)
            os.makedirs(out, exist_ok=True)
            for png in sorted(want):
                shutil.copy(os.path.join(src, 'textures', slug, png), os.path.join(out, png))
                pngs += 1

    with open(os.path.join(dst, 'meta.json'), 'w', encoding='utf-8') as fp:
        json.dump(meta, fp, separators=(',', ':'))
    print(f'{glbs} models, {pngs} run-time PNGs, meta.json '
          f'{os.path.getsize(os.path.join(dst, "meta.json")) // 1024} KB')
    print(f'  {sum(1 for v in meta.values() if v["eye"])} species with eye animation, '
          f'{sum(len(v["fx"]) for v in meta.values())} effect prims')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
