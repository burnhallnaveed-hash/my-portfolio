"""
Local Publish Server — Portfolio CMS v3 (E: Drive Dedicated)
Handles portfolio.json AND media files (GLB / MP4) strictly in E:\my-portfolio
Automatically routes large files (>25MB) through GitHub Release CDN
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json, subprocess, os, base64

REPO       = r'E:\my-portfolio'
OWNER      = 'designcorner488'
REPO_NAME  = 'designcorner488.github.io'
BRANCH     = 'master'
PAGES_BASE = f'https://{OWNER}.github.io'
RELEASE_URL= f'https://github.com/{OWNER}/{REPO_NAME}/releases/download/v1.0'

class PublishHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"[Server] {fmt % args}")

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == '/ping':
            self._respond(200, {'ok': True, 'status': 'running', 'drive': 'E'})
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != '/publish':
            self.send_response(404); self.end_headers(); return

        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length)

        try:
            payload = json.loads(body.decode('utf-8'))
        except Exception as e:
            self._respond(400, {'ok': False, 'message': f'Invalid JSON: {e}'})
            return

        portfolio  = payload.get('portfolio', {})
        media_list = payload.get('media', [])

        # ---- Save media files strictly in E:\my-portfolio\media ----
        media_dir = os.path.join(REPO, 'media')
        os.makedirs(media_dir, exist_ok=True)

        published_media = []
        large_files = []

        for item in media_list:
            try:
                file_bytes = base64.b64decode(item['dataBase64'])
                filename   = item['name']
                filepath   = os.path.join(media_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(file_bytes)
                size_mb = len(file_bytes) / (1024*1024)
                print(f"  [E: Drive] Saved: {filename} ({size_mb:.1f} MB)")

                # If file > 25MB, upload via GitHub Release CDN to prevent git push timeout
                if size_mb > 25.0:
                    large_files.append((filename, filepath))
                    item_url = f'{RELEASE_URL}/{filename}'
                else:
                    item_url = f'{PAGES_BASE}/media/{filename}'

                published_media.append({
                    'name':        filename,
                    'displayName': item.get('displayName', filename),
                    'type':        item.get('type', 'video'),
                    'url':         item_url
                })
            except Exception as e:
                print(f"  Error saving {item.get('name','?')}: {e}")

        # Upload any large files to Release CDN
        for fn, fp in large_files:
            try:
                print(f"  Uploading large asset {fn} to GitHub Release CDN...")
                subprocess.run(['gh', 'release', 'upload', 'v1.0', fp, '--clobber'],
                               cwd=REPO, capture_output=True, text=True)
            except Exception as ex:
                print(f"  Release upload note: {ex}")

        # Preserve previously published media if no new ones sent
        if not media_list and '_media' in portfolio:
            published_media = portfolio.get('_media', [])
        elif published_media:
            portfolio['_media'] = published_media

        # ---- Write portfolio.json ----
        pf = os.path.join(REPO, 'portfolio.json')
        with open(pf, 'w', encoding='utf-8') as f:
            json.dump(portfolio, f, indent=2, ensure_ascii=False)
        print(f"  [E: Drive] portfolio.json saved ({len(json.dumps(portfolio))} bytes)")

        # ---- Git commit + push ----
        def git(*args):
            return subprocess.run(
                ['git'] + list(args), cwd=REPO,
                capture_output=True, text=True, encoding='utf-8', errors='replace'
            )

        git('add', 'portfolio.json')
        if os.path.isdir(media_dir):
            git('add', 'media/')

        c = git('commit', '-m',
                f'Portfolio update: {len(published_media)} media files, via Publish button')
        print(c.stdout.strip() or c.stderr.strip() or '(no commit output)')

        p = git('push', 'origin', BRANCH)
        print(p.stdout.strip() or p.stderr.strip() or '(no push output)')

        if p.returncode == 0:
            self._respond(200, {
                'ok': True,
                'mediaCount': len(published_media),
                'message': f'Published! {len(published_media)} media files. 1-2 min mein update nazar aayega.'
            })
        else:
            self._respond(500, {
                'ok': False,
                'message': 'Git push note: ' + (p.stderr or p.stdout or 'completed')
            })

    def _respond(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    PORT = 7788
    print('=' * 58)
    print('  Portfolio Publish Server  —  Design Corner (E: Drive)')
    print(f'  Listening: http://localhost:{PORT}')
    print(f'  Repository Root: {REPO}')
    print('  Website par "Publish Live" dabayein')
    print('  Band karne ke liye: Ctrl+C  or window close')
    print('=' * 58)
    try:
        HTTPServer(('localhost', PORT), PublishHandler).serve_forever()
    except KeyboardInterrupt:
        print('\nServer band ho gaya.')
