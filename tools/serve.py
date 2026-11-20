"""Dev server for Critter Roller: serves the project folder and tells the browser never to cache,
so edits to the game's files always show up on reload.   python tools/serve.py [port]"""
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def log_message(self, fmt, *args):   # keep the console quiet
        pass


if __name__ == '__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8417
    http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
