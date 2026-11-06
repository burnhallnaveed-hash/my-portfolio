"""
Local Publish Server — Portfolio CMS
Runs on localhost:7788
Receives portfolio data from website and git pushes to GitHub
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json, subprocess, os, sys

REPO = r'C:\Users\OMEN\.gemini\antigravity\scratch\my-portfolio'

class PublishHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"[Publish Server] {fmt % args}")

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != '/publish':
            self.send_response(404); self.end_headers(); return

        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length)

        try:
            # Validate JSON
            data = json.loads(body.decode('utf-8'))
        except Exception as e:
            self._respond(400, {'ok': False, 'message': f'Invalid JSON: {e}'})
            return

        # Write portfolio.json
        pf = os.path.join(REPO, 'portfolio.json')
        with open(pf, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"[Publish Server] portfolio.json updated ({len(body)} bytes)")

        # Git commit + push
        def git(*args):
            return subprocess.run(['git'] + list(args), cwd=REPO,
                                  capture_output=True, text=True)

        git('add', 'portfolio.json')
        c = git('commit', '-m', 'Portfolio update from Publish button')
        print(c.stdout.strip() or c.stderr.strip())

        p = git('push', 'origin', 'master')
        print(p.stdout.strip() or p.stderr.strip())

        if p.returncode == 0:
            self._respond(200, {'ok': True,
                'message': 'Published! Clients ko 1-2 min mein update nazar aayega.'})
        else:
            self._respond(500, {'ok': False,
                'message': 'Git push fail hua: ' + (p.stderr or p.stdout)})

    def do_GET(self):
        if self.path == '/ping':
            self._respond(200, {'ok': True, 'status': 'running'})
        else:
            self.send_response(404); self.end_headers()

    def _respond(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    PORT = 7788
    print("=" * 50)
    print("  Portfolio Publish Server")
    print(f"  Listening on http://localhost:{PORT}")
    print("  Website par 'Publish Live' click karein")
    print("  Band karne ke liye Ctrl+C dabayein")
    print("=" * 50)
    try:
        HTTPServer(('localhost', PORT), PublishHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nServer band ho gaya.")
