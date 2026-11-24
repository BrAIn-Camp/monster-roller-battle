"""Dev server for Critter Roller: serves the project folder and tells the browser never to cache,
so edits to the game's files always show up on reload.   python tools/serve.py [port]

It also takes one upload: tools/faces.html posts the portrait sheet it has drawn, which is written to
models/stadium/faces.png or models/pbr/faces.png (those two files, and only if it is a PNG)."""
import http.server
import os
import sys

FACES = os.path.join('models', 'stadium', 'faces.png')
FACES_PBR = os.path.join('models', 'pbr', 'faces.png')
PNG = b'\x89PNG\r\n\x1a\n'


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def do_POST(self):
        size = int(self.headers.get('Content-Length') or 0)
        # /tools/save-faces writes the Stadium set's sheet, /tools/save-faces?set=pbr the Battle Revolution set's
        target = {'/tools/save-faces': FACES, '/tools/save-faces?set=pbr': FACES_PBR}.get(self.path)
        if target is None or not 0 < size < 16 * 1024 * 1024:
            self.send_error(404)
            return
        data = self.rfile.read(size)
        if not data.startswith(PNG) or not os.path.isdir(os.path.dirname(target)):
            self.send_error(400)
            return
        with open(target, 'wb') as f:
            f.write(data)
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):   # keep the console quiet
        pass


if __name__ == '__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8417
    http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
