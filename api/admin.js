// Dashboard admin: GET (semua data) / DELETE ?id=...  — butuh header x-admin-key = ADMIN_PASSWORD
const store = require('./_store');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return res.status(500).json({ error: 'ADMIN_PASSWORD belum diatur di environment.' });
  if (String(req.headers['x-admin-key'] || '').trim() !== pass.trim()) return res.status(401).json({ error: 'Password salah' });
  try {
    if (req.method === 'DELETE') { await store.remove(req.query.id); return res.status(200).json({ ok: true }); }
    res.status(200).json({ mode: store.mode(), items: await store.list() });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
