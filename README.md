# Aji & Dini — Editorial Wedding Invitation\n\nVersi desain alternatif dengan art direction editorial: warm ivory, olive, clay, serif display typography, asymmetric couple layout, curated photo grid, responsive RSVP. Data acara, backend, admin, dan fitur RSVP tetap dipertahankan dari paket sumber.

## Struktur
```
index.html            halaman undangan
assets/css/style.css  tampilan          assets/js/config.js  ← SEMUA data diedit di sini
assets/js/app.js      logika            assets/img/          foto (sudah di-crop & kompres)
api/                  backend Vercel (rsvp.js, admin.js, _store.js)
admin/                dashboard RSVP (buka /admin)
local-server.js      server lokal untuk testing (JANGAN dinamai server.js: Vercel akan salah mengira itu aplikasinya)
data/rsvp.json        database lokal (hanya saat testing)
```

## Jalankan di VS Code (Mac)
Buka folder → Terminal → `node local-server.js` (atau `npm start`) lalu buka:
- Undangan: http://localhost:3000/?to=Budi+Santoso
- Admin: http://localhost:3000/admin/  (password default `admin123`, ubah via file `.env`, salin dari `.env.example`)

Butuh Node.js 18+ (`node -v`; install dari nodejs.org atau `brew install node`).

## Hosting di Vercel + database online (tinggal lacak)
1. Upload folder ke GitHub (atau `npx vercel` dari terminal), lalu Import di vercel.com.
2. Di project Vercel: **Storage → Create / Marketplace → Upstash Redis (gratis)** → Connect ke project. Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` terisi otomatis.
3. **Settings → Environment Variables** → tambah `ADMIN_PASSWORD` (password dashboard Anda).
4. **Redeploy**. Selesai: RSVP & ucapan tamu masuk database; lihat di `https://domain-anda/admin`.
5. Di admin: lihat statistik, cari, hapus, **Export CSV** (buka di Excel/Google Sheets), dan buat link tamu personal.
6. Ganti `og:image` di `index.html` menjadi URL lengkap domain Anda agar preview muncul saat dibagikan di WhatsApp.

## Mengubah isi
Semua teks acara, rekening, nomor WhatsApp Dini (`waDini`), musik, live streaming, QRIS, alamat kado, love story, dress code, catatan: edit `assets/js/config.js`.

## Dashboard admin (`/admin`)
- **Statistik & tabel RSVP**: hadir / tidak / ragu, total orang, cari, hapus, **Export CSV** (Excel / Google Sheets).
- **Daftar Tamu & WA Blast**: tempel dari Excel/Sheets (Nama, No WA, Kategori) → link personal + pesan otomatis → tombol **Kirim WA** (membuka WhatsApp dengan pesan siap kirim, tamu ditandai terkirim). Kolom RSVP otomatis cocok dengan nama tamu. Daftar tersimpan di database (Upstash), bisa di-export ke CSV.
- Password admin = environment variable `ADMIN_PASSWORD`. Banner di atas dashboard menunjukkan apakah Upstash sudah terhubung.


## Pembaruan paket
- Galeri diperluas menjadi 8 foto; dua potret terbaru ditambahkan sebagai `g7.jpg` dan `g8.jpg`.
- Musik latar menggunakan audio dari video `A Thousand Years` yang diberikan pengguna.
- Bagian hadiah menampilkan tiga rekening: BRI, Mandiri, dan BRI; tombol salin nomor tersedia untuk masing-masing rekening.
