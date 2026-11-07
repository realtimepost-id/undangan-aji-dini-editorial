/* ============ PENGATURAN UTAMA — cukup edit file ini ============ */
window.CONFIG = {
  eventTitle: "Pernikahan Aji & Dini",
  eventDetails: "Walimatul 'Ursy Wibowo Aji Susilo & Dini Setyoning Mukti",
  start: "2026-12-02T09:00:00+07:00",
  end:   "2026-12-02T15:00:00+07:00",

  // Satu atau lebih acara. venue & address boleh dikosongkan.
  events: [
    { title: "Akad & Resepsi", day: "Rabu", date: "02", month: "Desember 2026", time: "09.00 WIB – Selesai",
      venue: "", address: "", map: "https://share.google/QPHodXW7LoSAw4JaO" }
  ],
  liveStream: "",                       // isi link YouTube/IG Live jika ada

  // Semua konfirmasi RSVP lewat WhatsApp diarahkan ke nomor Dini (format 62xxxxxxxxxx)
  waDini: "6282245980629",

  gifts: [
    { "bank": "BANK MANDIRI", "number": "1730004374709", "owner": "WIBOWO AJI SUSILO" },
    { "bank": "BANK BRI", "number": "212001001984502", "owner": "WIBOWO AJI SUSILO" }
  ],
  qris: "",                             // mis. "assets/img/qris.jpg"
  giftAddress: "",                      // alamat kirim kado (opsional)

  // ---- Opsional: bagian akan muncul otomatis jika diisi ----
  story: [],      // contoh: [{ year: "2020", title: "Bertemu", text: "Cerita singkat..." }]
  dressCode: { note: "", colors: [] },   // contoh: { note: "Putih & Sage Green", colors: ["#FFFFFF", "#5E7060"] }
  notes: [],      // contoh: [{ icon: "fa-mask-face", title: "Protokol", text: "..." }]

  api: "/api/rsvp",                     // jangan diubah bila memakai Vercel / server.js
  music: "assets/audio/aji-dini-song.mp3"   // atau "assets/audio/music.mp3"
};
