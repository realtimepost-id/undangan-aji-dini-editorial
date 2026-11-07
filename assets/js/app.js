(() => {
  const C = window.CONFIG, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = t => String(t ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400); };
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const copy = (t, ok) => navigator.clipboard.writeText(t).then(() => toast(ok), () => toast('Gagal menyalin'));
  const firstMap = (C.events.find(e => e.map) || {}).map;

  /* Nama tamu: ?to=Nama+Tamu */
  const guest = new URLSearchParams(location.search).get('to');
  if (guest) { $('#guestName').textContent = guest; $('#fName').value = guest; }

  /* Acara */
  $('#events').innerHTML = C.events.map(e => `<div class="card event rv"><h3 class="serif">${esc(e.title)}</h3>
    <div class="bigdate"><span>${esc(e.day)}</span><strong class="serif">${esc(e.date)}</strong><span>${esc(e.month)}</span></div>
    <p><i class="fa-regular fa-clock"></i>${esc(e.time)}</p>
    ${e.venue ? `<p><i class="fa-solid fa-location-dot"></i><b>${esc(e.venue)}</b></p>` : ''}${e.address ? `<p>${esc(e.address)}</p>` : ''}
    ${e.map ? `<a class="btn" href="${esc(e.map)}" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Buka Google Maps</a>` : ''}</div>`).join('');
  const fmt = d => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, '');
  $('#gcalBtn').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(C.eventTitle) + '&dates=' + fmt(C.start) + '/' + fmt(C.end) + '&details=' + encodeURIComponent(C.eventDetails) + '&location=' + encodeURIComponent(firstMap || '');
  if (C.liveStream) { const l = $('#liveBtn'); l.href = C.liveStream; l.hidden = false; }
  $('#icsBtn').onclick = () => {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan//ID', 'BEGIN:VEVENT', 'UID:' + fmt(C.start) + '@undangan', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(C.start), 'DTEND:' + fmt(C.end),
      'SUMMARY:' + C.eventTitle, 'DESCRIPTION:' + C.eventDetails, 'URL:' + (firstMap || ''), 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Besok hari bahagia', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'undangan-aji-dini.ics'; a.click();
  };

  /* Bagian opsional */
  let info = false;
  if (C.story && C.story.length) { $('#story').hidden = false; $('#storyList').innerHTML = C.story.map(s => `<div class="tl rv"><b>${esc(s.year)}</b><h4 class="serif">${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join(''); }
  if (C.dressCode && (C.dressCode.note || (C.dressCode.colors || []).length)) { info = true; $('#dress').hidden = false; $('#dressNote').textContent = C.dressCode.note || ''; $('#swatches').innerHTML = (C.dressCode.colors || []).map(c => `<i style="background:${esc(c)}"></i>`).join(''); }
  if (C.notes && C.notes.length) { info = true; $('#notes').innerHTML = C.notes.map(n => `<div class="card rv"><i class="fa-solid ${esc(n.icon || 'fa-circle-info')} gold"></i><h3 class="serif">${esc(n.title)}</h3><p>${esc(n.text)}</p></div>`).join(''); }
  $('#info').hidden = !info;

  /* Hadiah */
  $('#gifts').innerHTML = C.gifts.map((g, i) => `<div class="card bank rv"><i class="fa-solid fa-building-columns gold"></i><b class="bk">${esc(g.bank)}</b><h3>${esc(g.number)}</h3><p>${esc(g.owner)}</p><button class="btn" data-i="${i}"><i class="fa-regular fa-copy"></i> Salin Nomor Rekening</button></div>`).join('');
  $$('#gifts button').forEach(b => b.onclick = () => copy(C.gifts[b.dataset.i].number, 'Nomor rekening disalin'));
  if (C.qris) { $('#qrisCard').hidden = false; $('#qrisImg').src = C.qris; }
  if (C.giftAddress) { $('#addrCard').hidden = false; $('#addrText').textContent = C.giftAddress; $('#copyAddr').onclick = () => copy(C.giftAddress, 'Alamat disalin'); }
  $('#shareBtn').onclick = () => { const url = location.origin + location.pathname; navigator.share ? navigator.share({ title: C.eventTitle, url }).catch(() => {}) : copy(url, 'Link undangan disalin'); };

  /* Musik */
  const music = $('#bgMusic'), mBtn = $('#musicBtn');
  if (C.music) { music.src = C.music; mBtn.classList.add('show'); }
  const play = () => music.play().then(() => mBtn.classList.add('playing')).catch(() => {});
  const stop = () => { music.pause(); mBtn.classList.remove('playing'); };
  mBtn.onclick = () => music.paused ? play() : stop();
  document.addEventListener('visibilitychange', () => { if (document.hidden && !music.paused) stop(); });
  $('#openBtn').onclick = () => { $('#cover').classList.add('opened'); document.body.classList.remove('locked'); window.scrollTo(0, 0); if (C.music) play(); setTimeout(() => $$('.hero .rv').forEach(e => e.classList.add('in')), 500); };

  /* Countdown */
  const target = new Date(C.start).getTime(), pad = v => String(v).padStart(2, '0');
  const tick = () => { const df = Math.max(0, target - Date.now()); $('#d').textContent = Math.floor(df / 864e5); $('#h').textContent = pad(Math.floor(df % 864e5 / 36e5)); $('#m').textContent = pad(Math.floor(df % 36e5 / 6e4)); $('#s').textContent = pad(Math.floor(df % 6e4 / 1e3)); };
  tick(); setInterval(tick, 1000);

  /* Reveal, navbar aktif, progress scroll */
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));
  const links = $$('.nav a'), so = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id))), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); s && so.observe(s); });
  addEventListener('scroll', () => { const h = document.documentElement; $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100 || 0) + '%'; }, { passive: true });

  /* Kelopak */
  for (let i = 0; i < 12; i++) { const p = document.createElement('i'); p.className = 'petal'; const s = 7 + Math.random() * 9;
    Object.assign(p.style, { left: Math.random() * 100 + '%', width: s + 'px', height: s + 'px', animationDuration: 7 + Math.random() * 7 + 's', animationDelay: Math.random() * 7 + 's' }); $('#petals').appendChild(p); }

  /* Lightbox */
  const imgs = $$('.bento img'), lb = $('#lb'), lbImg = $('#lbImg'); let idx = 0;
  const show = i => { idx = (i + imgs.length) % imgs.length; lbImg.src = imgs[idx].src; lb.hidden = false; };
  imgs.forEach((im, i) => im.parentElement.onclick = () => show(i));
  $('.lb-x').onclick = () => lb.hidden = true; $('.prev').onclick = () => show(idx - 1); $('.next').onclick = () => show(idx + 1);
  lb.onclick = e => { if (e.target === lb) lb.hidden = true; };
  document.addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX); lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });

  /* Ucapan */
  const KEY = 'aji_dini_wishes_v3', PAGE = 8; let remote = [], shown = PAGE;
  const ago = t => { if (!t) return ''; const m = Math.floor((Date.now() - new Date(t)) / 6e4); return m < 1 ? 'baru saja' : m < 60 ? m + ' menit lalu' : m < 1440 ? Math.floor(m / 60) + ' jam lalu' : Math.floor(m / 1440) + ' hari lalu'; };
  const render = () => {
    const all = [...store.get(KEY, []).filter(l => !remote.some(r => r.name === l.name && r.wish === l.wish)), ...remote];
    $('#wishes').innerHTML = all.length ? all.slice(0, shown).map(w => `<div class="wish"><h5>${esc(w.name)} <span class="${w.status === 'Tidak Hadir' ? 'no' : w.status === 'Masih Ragu' ? 'ra' : ''}">${esc(w.status)}</span></h5><p>${esc(w.wish)}</p><small>${ago(w.time)}</small></div>`).join('')
      : '<div class="wish"><p>Jadilah yang pertama mengirim ucapan & doa untuk Aji & Dini 🤍</p></div>';
    $('#wishCount').textContent = all.length ? `(${all.length})` : ''; $('#moreBtn').hidden = all.length <= shown;
  };
  $('#moreBtn').onclick = () => { shown += PAGE; render(); };
  fetch(C.api).then(r => r.json()).then(d => { remote = d.wishes || []; render(); }).catch(() => {}); render();

  /* RSVP */
  $('#fStatus').onchange = e => $('#qtyRow').style.display = e.target.value === 'Hadir' ? '' : 'none';
  $('#rsvpForm').onsubmit = async e => {
    e.preventDefault();
    const name = $('#fName').value.trim(), status = $('#fStatus').value, wish = $('#fWish').value.trim(), qty = status === 'Hadir' ? Math.min(10, Math.max(1, +$('#fQty').value || 1)) : 0;
    if (!name || !wish) return; const btn = $('#sendBtn'); btn.disabled = true;
    let saved = false;
    try { const r = await fetch(C.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, status, qty, wish, guest: guest || '', website: $('#fBot').value }) }); saved = r.ok; } catch {}
    const l = store.get(KEY, []); l.unshift({ name, status, wish, time: new Date().toISOString() }); store.set(KEY, l); render();
    $('#waBtn').href = `https://api.whatsapp.com/send?phone=${C.waDini}&text=` + encodeURIComponent(`Halo Dini, saya mengonfirmasi kehadiran:\n\n*Nama:* ${name}\n*Status:* ${status}${qty ? ` (${qty} orang)` : ''}\n*Ucapan:* ${wish}`);
    $('#tName').textContent = name; $('#tInfo').textContent = qty ? `${status} · ${qty} orang` : status; $('#qr').innerHTML = '';
    if (status === 'Hadir' && window.QRCode) { new QRCode($('#qr'), { text: `AJI-DINI|${name}|${qty}`, width: 160, height: 160, colorDark: '#3E4F41' }); $('#qr').style.display = 'flex'; } else $('#qr').style.display = 'none';
    $('#ticket').hidden = false; $('#ticket').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('#fWish').value = ''; btn.disabled = false; toast(saved ? 'RSVP terkirim, terima kasih!' : 'Tersimpan di perangkat. Silakan konfirmasi via WhatsApp.');
  };
})();
