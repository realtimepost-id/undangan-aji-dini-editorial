
/* ============ PENGATURAN UTAMA — cukup edit file ini ============ */
window.CONFIG = {
  eventTitle: "Pernikahan Aji & Dini",
  eventDetails: "Walimatul 'Ursy Wibowo Aji Susilo & Dini Setyoning Mukti",

  // Tanggal dan jam acara
  start: "2026-12-05T12:00:00+07:00",
  end: "2026-12-05T16:00:00+07:00",

  // Satu atau lebih acara
  events: [
    {
      title: "Wedding Reception",
      day: "Sabtu",
      date: "05",
      month: "Desember",
      time: "12.00–16.00 WIB",
      venue: "",
      address: "",
      map: "https://www.google.com/maps?q=-7.8502398,111.0981072&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835694,94286869,100820247,100822504,100838877,121816461&g_ep=CAISEjI2LjQzLjEuMDAxOTUxMTAxMBgAIIgnKnssOTQyOTc2OTksOTQyMzExODgsOTQyODA1NjgsMTAwODIxNTU1LDQ3MDcxNzA0LDk0MjE4NjQxLDk0MjgyMTM0LDEwMDgzNTY5NCw5NDI4Njg2OSwxMDA4MjAyNDcsMTAwODIyNTA0LDEwMDgzODg3NywxMjE4MTY0NjFCAklE&skid=b6b34100-568f-49dd-a9e1-3cbd0030903e&g_st=iw"
    }
  ],

  liveStream: "",

  // RSVP WhatsApp
  waDini: "6282245980629",

  // Rekening hadiah
  gifts: [
    {
      bank: "BANK MANDIRI",
      number: "1730004374709",
      owner: "WIBOWO AJI SUSILO"
    },
    {
      bank: "BANK BRI",
      number: "212001001984502",
      owner: "WIBOWO AJI SUSILO"
    }
  ],

  qris: "",
  giftAddress: "",

  // Bagian opsional
  story: [],
  dressCode: {
    note: "",
    colors: []
  },
  notes: [],

  // API dan musik
  api: "/api/rsvp",
  music: "assets/audio/aji-dini-song.mp3"
};
