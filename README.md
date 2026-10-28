# SITTA UT - Tugas Praktik 2 (STSI4209)

Implementasi Antarmuka dan Alur Interaktif Sistem Pemesanan dan Distribusi Bahan Ajar (BMP) SITTA Universitas Terbuka berbasis **Vue.js**.

---

## 📁 Struktur Direktori Proyek

Sesuai dengan ketentuan Tugas Praktik 2:
```text
/stsi4209-tugas2/
├─ index.html          ← Halaman Portal Navigasi Menu ke stok.html dan tracking.html
├─ stok.html           ← Halaman 1: Stok Bahan Ajar BMP (WAJIB)
├─ tracking.html       ← Halaman 2: Tracking Delivery Order (DO) (WAJIB)
├─ css/
│  └─ style.css        ← Stylesheet CSS tampilan antarmuka bertema UT
└─ js/
   ├─ vue.js           ← Library Vue.js (offline build + CDN fallback)
   ├─ dataBahanAjar.js ← File Dummy Data Acuan (upbjjList, kategoriList, paket, stok, tracking)
   ├─ stok-app.js      ← Logika Vue.js untuk stok.html
   └─ tracking-app.js  ← Logika Vue.js untuk tracking.html
```

---

## 🎯 Pemenuhan 5 Indikator Capaian Pembelajaran

### 1. Pengorganisasian Kode Javascript Framework Vue.js
- Pemisahan kode yang modular antara file HTML (`stok.html`, `tracking.html`), Stylesheet (`css/style.css`), Master Data (`js/dataBahanAjar.js`), dan Logika Vue (`js/stok-app.js`, `js/tracking-app.js`).
- Instance Vue terstruktur rapi:
  - `el`: Target elemen mount (`#appStok`, `#appTracking`)
  - `data`: State reaktif aplikasi
  - `computed`: Properti kalkulasi dengan caching otomatis
  - `watch`: Pengawasan mutasi data spesifik
  - `methods`: Aksi pengguna (CRUD, validasi, reset)
  - `mounted`: Inisialisasi data dari `localStorage` atau dummy template

### 2. Fungsi Menampilkan Data (Mustaches, v-text, v-html)
- **Mustaches `{{ }}`**: Menampilkan teks dinamis seperti kode mata kuliah, judul modul, kuantitas stok, NIM mahasiswa, nama mahasiswa, total harga, dsb.
- **Directive `v-text`**: Digunakan untuk menampilkan teks ringkasan filter dinamis (`v-text="filterSummaryText"`).
- **Directive `v-html`**: Digunakan pada kolom catatan bahan ajar (`v-html="item.catatanHTML"`), mendukung perenderan tag format HTML seperti `<em>`, `<strong>`, `<u>`.
- **List Rendering `v-for`**: Menampilkan baris tabel stok bahan ajar, opsi dropdown `<select>`, dan riwayat timeline perjalanan ekspedisi.

### 3. Fungsi Conditional (v-if, v-else-if, v-else, v-show)
- **Status Stok Bahan Ajar**:
  - `v-if="item.qty >= item.safety"` &rarr; Status **Aman** (badge hijau dengan simbol `✔`)
  - `v-else-if="item.qty < item.safety && item.qty > 0"` &rarr; Status **Menipis** (badge orange dengan simbol `⚠`)
  - `v-else` &rarr; Status **Kosong** (badge merah dengan simbol `⛔`)
- **Dependent Filter**:
  - `v-if="filterUpbjj !== ''"` menampilkan dropdown filter *Kategori Mata Kuliah* hanya setelah pengguna memilih salah satu *UT-Daerah*.
- **Tampilan Form & Alert**:
  - `v-show="showFormTambah"` untuk toggle visibilitas formulir input stok baru.
  - `v-if="showModalEdit"` untuk membuka modal edit data stok.
  - `v-if="selectedPaketDetail"` untuk memunculkan rincian modul di bawah dropdown paket BMP pada tracking DO.
  - `v-if="currentDO"` dan `v-else-if="!currentDO && hasSearched"` untuk hasil pencarian pelacakan DO.

### 4. Data Binding & Property (v-bind, v-model, computed, methods)
- **One-Way Data Binding (`v-bind` / `:`)**:
  - `:class` dinamis untuk validasi form error dan penandaan tombol aktif.
  - `:style` untuk panjang bilah status stepper pengiriman.
  - `:key` untuk efisiensi DOM recycling pada directive `v-for`.
- **Two-Way Data Binding (`v-model`)**:
  - Mengikat nilai filter pencarian, filter dropdown, checkbox re-order alert, dan seluruh kolom input formulir tambah/edit stok serta formulir DO baru.
- **Computed Properties**:
  - `filteredStok`: Menghitung filter multi-kondisi (UT-Daerah, Kategori, Re-Order Alert, Pencarian teks) dan melakukan pengurutan (judul, stok, harga). **Kriteria Soal terpenuhi**: Hasil filter otomatis di-cache dan tidak di-recompute berulang jika dependencies tidak berubah.
  - `nextNomorDO`: Men-generate nomor DO secara otomatis berformat `DO[TahunBerjalan]-[Sequence]` (contoh: `DO2025-001`, `DO2025-002`, dst.).
  - `selectedPaketDetail`: Mengambil detail buku/modul yang termasuk ke dalam paket bahan ajar yang sedang dipilih.
- **Methods Properties**:
  - Operasi CRUD stok (`tambahStok`, `editStok`, `simpanEditStok`, `hapusStok`).
  - Fungsi `resetFilter` untuk mengembalikan semua filter dan sort ke nilai default.
  - Fungsi `formatRupiah` untuk formatting nominal mata uang Rupiah.
  - Fungsi `isiTanggalHariIni` menggunakan JavaScript `Date` lokal (`YYYY-MM-DD`).

### 5. Fungsi Watchers (&ge; 2 Watcher per Halaman)
- **Pada `js/stok-app.js`**:
  - **Watcher 1 (`filterUpbjj`)**: Memantau perubahan pilihan UT-Daerah. Saat UT-Daerah diubah atau dikosongkan, watcher otomatis mereset pilihan filter kategori agar dependent dropdown tetap sinkron.
  - **Watcher 2 (`stok`, deep: true)**: Memantau mutasi array stok secara mendalam. Setiap kali ada penambahan, pengeditan, atau penghapusan data, watcher otomatis menyimpan pembaruan ke `localStorage` agar tidak hilang saat halaman di-refresh.
- **Pada `js/tracking-app.js`**:
  - **Watcher 1 (`formDO.paketKode`)**: Memantau perubahan paket bahan ajar yang dipilih. Saat paket berganti, watcher otomatis menyinkronkan properti `formDO.totalHarga` dengan `paket.harga`.
  - **Watcher 2 (`trackingData`, deep: true)**: Memantau mutasi data tracking dan otomatis melakukan auto-save ke `localStorage`.
  - **Watcher 3 (`inputCariDO`)**: Melakukan instant live-search saat pengguna mengetikkan nomor DO.

### 6. Formulir Input & Validasi Sederhana
- Formulir input bahan ajar baru dengan validasi field kode, judul, UT-daerah, kategori, lokasi rak, harga, qty, dan safety stock.
- Formulir input Delivery Order (DO) baru dengan validasi NIM numerik (8-12 digit), nama mahasiswa, pilihan ekspedisi, paket BMP, dan tanggal kirim.

---

## 🎬 Sistematika Penjelasan untuk Rekaman Video (Maksimal 15 Menit)

Rekomendasi alur presentasi video untuk mendapatkan nilai maksimal (15 Poin Presentasi):
1. **Pendahuluan (1-2 Menit)**:
   - Perkenalan nama, NIM, dan mata kuliah STSI4209 Sistem Informasi UT.
   - Penjelasan ringkas arsitektur dan struktur folder file proyek (`index.html`, `stok.html`, `tracking.html`, `js/dataBahanAjar.js`, `js/stok-app.js`, `js/tracking-app.js`).
2. **Demonstrasi Halaman 1: Stok Bahan Ajar (5-6 Menit)**:
   - Penjelasan sintaks Vue: `v-text`, `v-html` pada kolom catatan, Mustaches `{{ }}`.
   - Demonstrasi status stok `v-if`, `v-else-if`, `v-else` (Aman / Menipis / Kosong).
   - Pengujian Filter UT-Daerah dan kemunculan Dependent Filter Kategori.
   - Pengujian filter Re-Order Alert (stok < safety dan stok = 0).
   - Pengujian sorting judul, stok, harga, dan tombol Reset Filter.
   - Penjelasan logika `computed: filteredStok` yang tidak perlu di-recompute berulang.
   - Demonstrasi Watcher 1 (reset kategori) dan Watcher 2 (deep watch localStorage).
   - Demonstrasi form tambah data baru dengan validasi dan modal edit data stok.
3. **Demonstrasi Halaman 2: Tracking Delivery Order (4-5 Menit)**:
   - Penjelasan fitur pelacakan nomor DO dan riwayat timeline perjalanan.
   - Demonstrasi form input DO baru:
     - Penomoran DO otomatis `DO[Tahun]-[Sequence]`.
     - Pengisian NIM dan Nama secara manual.
     - Pilihan paket bahan ajar pada elemen `<select>` dan kemunculan informasi detail modul di bawahnya.
     - Penjelasan Watcher sinkronisasi harga otomatis dari `paket.harga`.
     - Pengambilan tanggal lokal menggunakan fungsi `Date`.
     - Penerbitan DO baru dan hasil pelacakan langsung.
4. **Penutup & Kesimpulan (1-2 Menit)**:
   - Rangkuman implementasi seluruh 5 indikator capaian Vue.js.

---

## 📚 Sumber Referensi

- Sufandi, U. U., Aprijani, D. A., & Pandiangan, P. (2021). Evaluasi dan hasil review desain user interface prototype aplikasi mobile SITTA Universitas Terbuka. *Jurnal Nasional Pendidikan Teknik Informatika: JANAPATI*, 10(3), 147-156. [https://doi.org/10.23887/janapati.v10i3.40281](https://doi.org/10.23887/janapati.v10i3.40281)
- Sufandi, U. U. (2022). Analisis Kebutuhan dan Dokumentasi Sistem Informasi Tiras dan Transaksi Bahan Ajar Universitas Terbuka. *Jurnal Nasional Pendidikan Teknik Informatika: JANAPATI*, 11(2), 112-122. [https://doi.org/10.23887/janapati.v11i2.42966](https://doi.org/10.23887/janapati.v11i2.42966)
