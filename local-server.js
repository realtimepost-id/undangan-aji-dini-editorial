// Server lokal tanpa dependency:  node local-server.js  (statis + /api, data tersimpan di data/rsvp.json)
const http = require('http'), fs = require('fs'), path = require('path');
try { fs.readFileSync('.env', 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !l.startsWith('#')) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, ''); }); } catch {}
process.env.ADMIN_PASSWORD ??= 'admin123';
const PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.webp': 'image/webp' };
const BLOCK = /^\/(api|data|node_modules)\/|^\/(local-server\.js|package\.json|\.env.*|README\.md)$/;
try { if (!fs.existsSync('data')) fs.mkdirSync('data'); } catch {}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost'); let p = decodeURIComponent(u.pathname);
  if (p.startsWith('/api/')) {
    const f = path.join(__dirname, 'api', path.basename(p) + '.js');
    if (path.basename(p).startsWith('_') || !fs.existsSync(f)) { res.statusCode = 404; return res.end('{}'); }
    let raw = ''; for await (const c of req) raw += c;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    req.query = Object.fromEntries(u.searchParams);
    res.status = c => (res.statusCode = c, res); res.json = o => (res.setHeader('Content-Type', 'application/json'), res.end(JSON.stringify(o)));
    return require(f)(req, res);
  }
  if (BLOCK.test(p)) { res.statusCode = 404; return res.end('Not found'); }
  let file = path.join(__dirname, p);
  if (!file.startsWith(__dirname)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (e, d) => { if (e) { res.statusCode = 404; return res.end('Not found'); } res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream'); res.end(d); });
}).listen(PORT, () => console.log(`\n  Undangan : http://localhost:${PORT}/?to=Nama+Tamu\n  Admin    : http://localhost:${PORT}/admin/   (password: ${process.env.ADMIN_PASSWORD})\n`));
