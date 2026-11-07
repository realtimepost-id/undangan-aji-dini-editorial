// Daftar tamu + template pesan WA (khusus admin). GET = ambil, PUT = simpan seluruh dokumen.
const store = require('./_store');
const clean = (v, n) => String(v || '').replace(/[<>]/g, '').trim().slice(0, n);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD belum diatur di environment.' });
  if (String(req.headers['x-admin-key'] || '').trim() !== process.env.ADMIN_PASSWORD.trim()) return res.status(401).json({ error: 'Password salah' });
  try {
    if (req.method === 'GET') return res.status(200).json(await store.getGuests());
    if (req.method === 'PUT') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const guests = (Array.isArray(b.guests) ? b.guests : []).slice(0, 2000).map(g => ({
        id: clean(g.id, 20) || Math.random().toString(36).slice(2, 10), name: clean(g.name, 60), phone: clean(g.phone, 20).replace(/[^\d]/g, ''), group: clean(g.group, 30), sent: !!g.sent })).filter(g => g.name);
      await store.setGuests({ template: clean(b.template, 1500).replace(/\\n/g, '\n') || String(b.template || '').slice(0, 1500), guests });
      return res.status(200).json({ ok: true, count: guests.length });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
