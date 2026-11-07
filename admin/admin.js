const $ = s => document.querySelector(s), esc = t => String(t ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
let key = sessionStorage.getItem('adm') || '', items = [];
const api = (path = '', opt = {}) => fetch('/api/admin' + path, { ...opt, headers: { 'x-admin-key': key } });

async function load() {
  let r, d; try { r = await api(); d = await r.json(); } catch (e) { $('#err').textContent = 'Tidak bisa terhubung ke server: ' + e.message; return false; }
  if (!r.ok) { sessionStorage.removeItem('adm'); $('#login').hidden = false; $('#app').hidden = true; $('#err').textContent = (d.error || 'Gagal') + ' (kode ' + r.status + ')'; return false; }
  items = d.items; $('#login').hidden = true; $('#app').hidden = false;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  $('#mode').textContent = d.mode === 'upstash' ? '✅ Penyimpanan: Upstash Redis (online)' : local ? 'Penyimpanan: file lokal data/' : '⚠️ Upstash BELUM terhubung — data tidak akan tersimpan. Hubungkan Upstash lalu Redeploy.';
  draw(); await loadGuests(); return true;
}
function draw() {
  const yes = items.filter(i => i.status === 'Hadir');
  $('#sTotal').textContent = items.length; $('#sYes').textContent = yes.length; $('#sPax').textContent = yes.reduce((a, i) => a + (+i.qty || 0), 0);
  $('#sNo').textContent = items.filter(i => i.status === 'Tidak Hadir').length; $('#sMaybe').textContent = items.filter(i => i.status === 'Masih Ragu').length;
  const q = $('#q').value.toLowerCase(), f = $('#f').value;
  $('#rows').innerHTML = items.filter(i => (!f || i.status === f) && (i.name + ' ' + i.wish).toLowerCase().includes(q)).map(i =>
    `<tr><td>${new Date(i.time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td><td><b>${esc(i.name)}</b></td><td><span class="tag ${i.status === 'Tidak Hadir' ? 'no' : i.status === 'Masih Ragu' ? 'ra' : ''}">${esc(i.status)}</span></td><td>${i.qty || ''}</td><td>${esc(i.wish)}</td><td><button class="del" data-id="${esc(i.id)}">Hapus</button></td></tr>`).join('') || '<tr><td colspan="6">Belum ada data.</td></tr>';
}
$('#loginBtn').onclick = async () => { key = $('#pw').value.trim(); if (!key) { $('#err').textContent = 'Ketik password dulu'; return; } $('#err').textContent = ''; sessionStorage.setItem('adm', key); await load(); };
$('#showpw').onchange = e => $('#pw').classList.toggle('show', e.target.checked);
$('#pw').oninput = e => $('#cnt').textContent = 'Terketik: ' + e.target.value.length + ' karakter';
$('#pw').onkeydown = e => { if (e.key === 'Enter') $('#loginBtn').click(); };
$('#refresh').onclick = load; $('#q').oninput = $('#f').onchange = draw;
$('#out').onclick = () => { sessionStorage.removeItem('adm'); location.reload(); };
$('#rows').onclick = async e => { const id = e.target.dataset.id; if (id && confirm('Hapus RSVP ini?')) { await api('?id=' + encodeURIComponent(id), { method: 'DELETE' }); load(); } };
$('#csv').onclick = () => {
  const c = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['Waktu', 'Nama', 'Status', 'Jumlah', 'Ucapan', 'Link Tamu'], ...items.map(i => [i.time, i.name, i.status, i.qty, i.wish, i.guest])];
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(c).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'rsvp-aji-dini.csv'; a.click();
};
if (key) load();

/* ===== Daftar tamu & WA blast ===== */
const DEFAULT_TPL = "Assalamu'alaikum Bapak/Ibu/Saudara/i *[nama]*,\n\nDengan memohon rahmat Allah SWT, kami mengundang Anda ke pernikahan *Aji & Dini*\nRabu, 02 Desember 2026 pukul 09.00 WIB.\n\nDetail & konfirmasi kehadiran:\n[link]\n\nMerupakan kehormatan bagi kami atas doa & kehadiran Anda. Terima kasih 🙏";
let guests = [];
const norm = p => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '62' + d.slice(1); else if (d.startsWith('8')) d = '62' + d; return d; };
const linkOf = n => ($('#base').value.trim().replace(/\/?$/, '/')) + '?to=' + encodeURIComponent(n).replace(/%20/g, '+');
const msgOf = g => $('#tpl').value.replace(/\[nama\]/gi, g.name).replace(/\[link\]/gi, linkOf(g.name));
const rsvpOf = g => (items.find(i => i.name.trim().toLowerCase() === g.name.trim().toLowerCase()) || {}).status || '';
const gApi = (method, body) => fetch('/api/guests', { method, headers: { 'x-admin-key': key, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });

async function loadGuests() {
  $('#base').value = localStorage.getItem('baseUrl') || location.origin + '/'; $('#tpl').value = DEFAULT_TPL;
  try {
    const r = await gApi('GET'); const d = await r.json(); if (!r.ok) throw new Error((d.error || 'Gagal') + ' (kode ' + r.status + ')');
    guests = d.guests || []; if (d.template) $('#tpl').value = d.template;
  } catch (e) { $('#gInfo').textContent = '⚠️ Daftar tamu belum bisa dimuat: ' + e.message + ' — pastikan file api/guests.js ada di repo lalu Redeploy.'; }
  drawG();
}
async function saveG(quiet) {
  if (!/\[nama\]/i.test($('#tpl').value) || !/\[link\]/i.test($('#tpl').value)) { if (!confirm('Template tidak memuat [nama] dan/atau [link]. Semua tamu akan menerima nama/link yang sama. Tetap simpan?')) return; }
  localStorage.setItem('baseUrl', $('#base').value);
  let r, d; try { r = await gApi('PUT', { template: $('#tpl').value, guests }); d = await r.json(); } catch (e) { r = { ok: false }; d = { error: 'Server tidak merespons (api/guests.js belum ada?)' }; }
  $('#gInfo').textContent = r.ok ? `Tersimpan (${d.count} tamu) · ${new Date().toLocaleTimeString('id-ID')}` : '⚠️ ' + (d.error || 'Gagal menyimpan');
}
function drawG() {
  const q = $('#gq').value.toLowerCase(), f = $('#gf').value;
  const list = guests.filter(g => (g.name + g.group).toLowerCase().includes(q) && (f !== 'unsent' || !g.sent) && (f !== 'norsvp' || !rsvpOf(g)));
  $('#glist').innerHTML = list.map(g => `<tr><td><b>${esc(g.name)}</b></td><td>${esc(g.phone)}${g.phone ? '' : ' <small>(kosong)</small>'}</td><td>${esc(g.group)}</td><td>${esc(rsvpOf(g)) || '<small>belum</small>'}</td>
    <td><input type="checkbox" data-s="${esc(g.id)}" ${g.sent ? 'checked' : ''} style="width:auto"></td>
    <td style="white-space:nowrap"><button data-wa="${esc(g.id)}">Kirim WA</button> <button data-cp="${esc(g.id)}">Salin link</button> <button class="del" data-rm="${esc(g.id)}">✕</button></td></tr>`).join('') || '<tr><td colspan="6">Belum ada tamu.</td></tr>';
  const sent = guests.filter(g => g.sent).length; if (!/^(Tersimpan|⚠️)/.test($('#gInfo').textContent)) $('#gInfo').textContent = `${guests.length} tamu · ${sent} terkirim · ${guests.length - sent} belum`;
}
function sendWA(g) {
  if (!g.phone) return alert('Nomor WA ' + g.name + ' kosong.');
  window.open('https://wa.me/' + g.phone + '?text=' + encodeURIComponent(msgOf(g)), '_blank'); g.sent = true; drawG(); saveG();
}
$('#impBtn').onclick = () => {
  const parseLine = l => { const p = l.split(/\t|;|,/).map(x => x.trim()); if (p.length >= 2) return p; const m = l.match(/^(.*?)\s*(\+?\d[\d\s-]{7,}\d)\s*(.*)$/); return m ? [m[1].trim(), m[2], m[3].trim()] : [l.trim()]; };
  const rows = $('#imp').value.split('\n').map(parseLine).filter(r => r[0]);
  rows.forEach(r => { const phone = norm(r[1]); if (!guests.some(g => g.name.toLowerCase() === r[0].toLowerCase() && g.phone === phone)) guests.push({ id: Math.random().toString(36).slice(2, 10), name: r[0], phone, group: r[2] || '', sent: false }); });
  $('#imp').value = ''; drawG(); saveG();
};
$('#saveG').onclick = () => saveG(); $('#gq').oninput = $('#gf').onchange = drawG;
$('#next').onclick = () => { const g = guests.find(x => !x.sent && x.phone); g ? sendWA(g) : alert('Semua tamu bernomor sudah ditandai terkirim.'); };
$('#glist').onclick = e => { const t = e.target, g = id => guests.find(x => x.id === id);
  if (t.dataset.wa) sendWA(g(t.dataset.wa));
  if (t.dataset.cp) navigator.clipboard.writeText(linkOf(g(t.dataset.cp).name)).then(() => t.textContent = '✓');
  if (t.dataset.rm && confirm('Hapus tamu ini?')) { guests = guests.filter(x => x.id !== t.dataset.rm); drawG(); saveG(); }
  if (t.dataset.s) { g(t.dataset.s).sent = t.checked; drawG(); saveG(); } };
$('#gcsv').onclick = () => { const c = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['Nama', 'No WA', 'Kategori', 'Terkirim', 'Status RSVP', 'Link'], ...guests.map(g => [g.name, g.phone, g.group, g.sent ? 'Ya' : 'Belum', rsvpOf(g), linkOf(g.name)])];
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(c).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'tamu-aji-dini.csv'; a.click(); };
