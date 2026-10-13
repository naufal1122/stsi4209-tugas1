# SITTA - Universitas Terbuka (Tugas Praktik 1 STSI4209)

Aplikasi Front-End Pemesanan dan Distribusi Bahan Ajar SITTA Universitas Terbuka.

## Fitur:
1. **Halaman Login (`index.html` / `login.html`)**:
   - Autentikasi berbasis data dummy (`js/data.js`).
   - Alert box & error feedback jika email/password salah.
   - Modal popup "Lupa Password" dan "Daftar Akun".
2. **Dashboard (`dashboard.html`)**:
   - Greeting dinamis berdasarkan waktu lokal (Pagi/Siang/Sore/Malam).
   - Menu navigasi satu baris dengan dropdown laporan.
   - Fitur pencarian cepat Delivery Order (DO).
3. **Tracking Pengiriman (`tracking.html`)**:
   - Pelacakan DO mahasiswa (`2023001234` dan `2023005678`).
   - Progress bar stepper & timeline riwayat ekspedisi.
4. **Informasi Stok Bahan Ajar (`stok.html`)**:
   - Katalog dinamis bahan ajar BMP UT.
   - Form penambahan baris data stok baru secara langsung via JavaScript DOM manipulation.
