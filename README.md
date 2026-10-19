# Simulasi Gerak Jatuh Bebas

Simulasi interaktif bergaya PhET untuk gerak jatuh bebas dan gerak vertikal ke bawah/ke atas. Tanpa instalasi, tanpa internet.

## Cara membuka
1. Taruh `index.html`, `style.css`, dan `script.js` dalam satu folder.
2. Buka `index.html` dengan Chrome, Edge, atau Firefox.

| File | Isi |
|---|---|
| `index.html` | Struktur halaman, panel kontrol, dan teks penjelasan |
| `style.css` | Tampilan |
| `script.js` | Rumus fisika, simulasi numerik, animasi, grafik, validasi |

## Cara pakai
- **Contoh cepat:** Jatuh bebas, Lempar ke bawah, Lempar ke atas.
- **Pengaturan:** h₀ (m), v₀ (m/s), arah v₀ (↓ / ↑), dan g (Bumi, Bulan, Mars, Jupiter, atau kustom).
- **Kontrol bawah:** ↺ ulangi, ▶/⏸ mulai/jeda (Spasi), ⏭ maju 0,05 s, penggeser waktu, kecepatan putar (Lambat/Normal/Cepat).
- **Seret bola** saat t = 0 untuk mengubah h₀ langsung di panggung.
- **Tampilan:** vektor v, vektor a, jejak bola per selang waktu, penggaris.
- Mengubah parameter selalu mengulang simulasi dari t = 0.

## Input dan output
| Input | Satuan | Aturan |
|---|---|---|
| Tinggi awal h₀ | m | ≥ 0 |
| Kecepatan awal v₀ | m/s | ≥ 0 (arah dipilih terpisah) |
| Gravitasi g | m/s² | > 0 |

Output: waktu jatuh, laju saat mendarat, tinggi maksimum, waktu ke puncak, v₀ᵧ, dan a. Ada juga grafik y–t, v–t, a–t dan tabel posisi/kecepatan tiap waktu.

## Rumus (ke atas positif, a = −g)
- y = h₀ + v₀ᵧt − ½gt²
- vᵧ = v₀ᵧ − gt
- t_jatuh = (v₀ᵧ + √(v₀ᵧ² + 2gh₀)) / g
- v_tanah = √(v₀² + 2gh₀)
- Jatuh bebas: t = √(2h₀/g)

## Validasi
Tab **Validasi** berisi:
1. Hitungan manual lengkap dengan angka substitusi.
2. Perbandingan rumus dengan simulasi numerik langkah demi langkah (Δt = 0,001 s) beserta persen galat.

Tab **Teori vs eksperimen** menerima waktu jatuh dan laju mendarat dari praktikum, lalu menghitung galat dan g hasil eksperimen (g = 2(h₀ + v₀ᵧt)/t²).

## Catatan untuk pembahasan laporan
- Hambatan udara diabaikan. Pada eksperimen nyata, waktu jatuh biasanya sedikit lebih besar dan laju mendarat sedikit lebih kecil dari teori.
- Sumber galat lain: waktu reaksi, kalibrasi skala Tracker, dan jumlah frame video.
- Jika h₀ = 0 dan bola dilempar ke bawah (atau v₀ = 0), waktu jatuh = 0 karena bola sudah di tanah. Itu normal.
- Massa tidak memengaruhi hasil, karena percepatan jatuh bebas sama untuk semua benda tanpa hambatan udara.

## Untuk pengumpulan
Kirim ketiga file sebagai source code. Tambahkan screenshot (pengaturan, grafik, validasi, perbandingan) dan video demo 1–2 menit rekam layar. Hosting gratis: GitHub Pages atau Netlify.
