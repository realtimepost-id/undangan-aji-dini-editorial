// POST /api/rsvp  -> simpan RSVP   |   GET /api/rsvp -> daftar ucapan publik
const store = require('./_store');
const clean = (v, n) => String(v || '').replace(/[<>]/g, '').trim().slice(0, n);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const list = await store.list();
      return res.status(200).json({ wishes: list.filter(x => x.wish).slice(0, 150).map(({ name, status, wish, time }) => ({ name, status, wish, time })) });
    }
    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (b.website) return res.status(200).json({ ok: true }); // honeypot anti-bot
      const name = clean(b.name, 60), wish = clean(b.wish, 300);
      const status = ['Hadir', 'Tidak Hadir', 'Masih Ragu'].includes(b.status) ? b.status : 'Hadir';
      if (!name) return res.status(400).json({ error: 'Nama wajib diisi' });
      const qty = status === 'Hadir' ? Math.min(10, Math.max(1, parseInt(b.qty) || 1)) : 0;
      await store.add({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), time: new Date().toISOString(), name, status, qty, wish, guest: clean(b.guest, 60) });
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
