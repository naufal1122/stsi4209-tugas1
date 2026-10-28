# DOKUMEN LAPORAN TUGAS PRAKTIK 2
## SISTEM INFORMASI TIRAS & TRANSAKSI BAHAN AJAR (SITTA)
### MATA KULIAH: STSI4209 - PEMROGRAMAN BERBASIS WEB / SISTEM INFORMASI
**UNIVERSITAS TERBUKA**

---

## DAFTAR ISI
1. [Identitas Tugas](#1-identitas-tugas)
2. [Struktur Program](#2-struktur-program)
3. [Data Dummy (Template Acuan)](#3-data-dummy-template-acuan)
4. [Penjelasan Program & Arsitektur Vue.js](#4-penjelasan-program--arsitektur-vuejs)
5. [Pembahasan Pemenuhan 5 Indikator Capaian Belajar](#5-pembahasan-pemenuhan-5-indikator-capaian-belajar)
6. [Alur Logika & Cara Kerja Sistem](#6-alur-logika--cara-kerja-sistem)
7. [Daftar Pustaka](#7-daftar-pustaka)

---

## 1. IDENTITAS TUGAS

- **Mata Kuliah**: STSI4209 - Pemrograman Berbasis Web
- **Institusi**: Program Studi Sistem Informasi, Fakultas Sains dan Teknologi, Universitas Terbuka
- **Topik**: Implementasi Framework JavaScript Vue.js untuk Sistem Pemesanan dan Distribusi Bahan Ajar (SITTA UT)
- **Tujuan Pembelajaran**:
  1. Mahasiswa mampu mengimplementasikan sistem pengorganisasian kode JavaScript Framework Vue.js yang bersih, modular, dan terstruktur.
  2. Mahasiswa mampu menerapkan fungsi penampilan data melalui Mustaches `{{ }}`, directive `v-text`, dan directive `v-html`.
  3. Mahasiswa mampu menerapkan conditional rendering (`v-if`, `v-else-if`, `v-else`, `v-show`) dengan operator kondisi yang sesuai.
  4. Mahasiswa mampu menerapkan data binding (one-way binding `v-bind`, two-way binding `v-model`) serta properti pengolahan data (`computed` dan `methods`).
  5. Mahasiswa mampu menerapkan fungsi `watchers` untuk pemantauan mutasi data secara reaktif.

---

## 2. STRUKTUR PROGRAM

Struktur direktori proyek dirancang secara modular, memisahkan lapisan tampilan (HTML), styling (CSS), data acuan (JavaScript), serta logika interaktivitas Vue.js:

```text
/stsi4209-tugas2/
│
├── index.html               # Halaman Portal Utama (Navigasi ke stok.html dan tracking.html)
├── stok.html                # Halaman 1: Stok Bahan Ajar BMP (Wajib)
├── tracking.html            # Halaman 2: Tracking Delivery Order / DO (Wajib)
│
├── css/
│   └── style.css            # Stylesheet antarmuka responsif bernuansa Universitas Terbuka
│
└── js/
    ├── vue.js               # Framework Vue.js v2 (Distribusi lokal offline-first + fallback CDN)
    ├── dataBahanAjar.js     # Berkas Dummy Master Data (template acuan bersama)
    ├── stok-app.js          # Logika Vue.js (Instance, Computed, Watchers, Methods) untuk stok.html
    └── tracking-app.js      # Logika Vue.js (Instance, Computed, Watchers, Methods) untuk tracking.html
```

### Rincian Peran Masing-Masing File:
1. **`index.html`**: Berfungsi sebagai portal sentral yang menyediakan tautan navigasi langsung ke Halaman Stok Bahan Ajar dan Halaman Tracking DO. Di dalamnya disajikan rangkuman matriks pemenuhan indikator penilaian tugas.
2. **`stok.html`**: Halaman antarmuka interaktif untuk menampilkan katalog bahan ajar, filter bertingkat (dependent options), indikator visual status stok (Aman, Menipis, Kosong), formulir penambahan BMP baru, serta modal dialog pengeditan stok.
3. **`tracking.html`**: Halaman antarmuka pelacakan Delivery Order (DO) yang menyajikan pencarian nomor DO, linimasa (timeline) perjalanan ekspedisi, serta formulir pembuatan DO baru dengan penomoran otomatis dan rincian modul BMP.
4. **`css/style.css`**: Berisi variabel warna resmi UT (`#0b5cab` dan `#f7b731`), komponen badges status, kartu statistik, modal popup, timeline stepper, serta tata letak responsif.
5. **`js/dataBahanAjar.js`**: Menyimpan dataset acuan seperti daftar UT-Daerah (`upbjjList`), kategori mata kuliah (`kategoriList`), ekspedisi pengiriman (`pengirimanList`), paket buku BMP (`paket`), stok buku BMP (`stok`), dan riwayat status DO (`tracking`).
6. **`js/stok-app.js`**: Mengelola seluruh *state* reaktif inventaris stok, caching filter multi-kondisi melalui `computed`, validasi formulir, serta 2 buah watcher.
7. **`js/tracking-app.js`**: Mengelola *state* pelacakan DO, penomoran otomatis DO berbasis urutan tahun berjalan, auto-sinkronisasi harga paket melalui watcher, dan persistensi `localStorage`.

---

## 3. DATA DUMMY (TEMPLATE ACUAN)

Berikut adalah data dummy acuan yang dideklarasikan di dalam file `js/dataBahanAjar.js` dan digunakan secara reaktif oleh aplikasi:

```javascript
/**
 * Data Template / Dummy Data Acuan Tugas Praktik 2
 * STSI4209 - Pemrograman Web / Sistem Informasi UT
 */
var initialDataBahanAjar = {
  // 1. Daftar UT-Daerah (UPBJJ)
  upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],

  // 2. Daftar Kategori Mata Kuliah
  kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],

  // 3. Daftar Opsi Ekspedisi Pengiriman
  pengirimanList: [
    { kode: "REG", nama: "Reguler (3-5 hari)" },
    { kode: "EXP", nama: "Ekspres (1-2 hari)" }
  ],

  // 4. Daftar Paket Bahan Ajar BMP UT
  paket: [
    { 
      kode: "PAKET-UT-001", 
      nama: "PAKET IPS Dasar", 
      isi: ["EKMA4116", "EKMA4115"], 
      harga: 120000 
    },
    { 
      kode: "PAKET-UT-002", 
      nama: "PAKET IPA Dasar", 
      isi: ["BIOL4201", "FISIP4001"], 
      harga: 140000 
    }
  ],

  // 5. Data Inventaris Stok Bahan Ajar BMP
  stok: [
    {
      kode: "EKMA4116",
      judul: "Pengantar Manajemen",
      kategori: "MK Wajib",
      upbjj: "Jakarta",
      lokasiRak: "R1-A3",
      harga: 65000,
      qty: 28,
      safety: 20,
      catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
    },
    {
      kode: "EKMA4115",
      judul: "Pengantar Akuntansi",
      kategori: "MK Wajib",
      upbjj: "Jakarta",
      lokasiRak: "R1-A4",
      harga: 60000,
      qty: 7,
      safety: 15,
      catatanHTML: "<strong>Cover baru</strong>"
    },
    {
      kode: "BIOL4201",
      judul: "Biologi Umum (Praktikum)",
      kategori: "Praktikum",
      upbjj: "Surabaya",
      lokasiRak: "R3-B2",
      harga: 80000,
      qty: 12,
      safety: 10,
      catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
    },
    {
      kode: "FISIP4001",
      judul: "Dasar-Dasar Sosiologi",
      kategori: "MK Pilihan",
      upbjj: "Makassar",
      lokasiRak: "R2-C1",
      harga: 55000,
      qty: 2,
      safety: 8,
      catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
    }
  ],

  // 6. Data Pelacakan Delivery Order (DO)
  tracking: {
    "DO2025-001": {
      nomorDO: "DO2025-001",
      nim: "123456789",
      nama: "Rina Wulandari",
      status: "Dalam Perjalanan",
      ekspedisi: "JNE Regular (3-5 hari)",
      tanggalKirim: "2025-08-25",
      paket: "PAKET-UT-001",
      total: 120000,
      perjalanan: [
        { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
        { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
        { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
      ]
    },
    "DO2025-002": {
      nomorDO: "DO2025-002",
      nim: "043928172",
      nama: "Budi Santoso",
      status: "Terkirim",
      ekspedisi: "JNE Ekspres (1-2 hari)",
      tanggalKirim: "2025-09-02",
      paket: "PAKET-UT-002",
      total: 140000,
      perjalanan: [
        { waktu: "2025-09-02 09:15:00", keterangan: "Penerimaan di Loket: PUSLABA UT TANGERANG" },
        { waktu: "2025-09-02 18:30:12", keterangan: "Tiba di Hub Gateway: SURABAYA" },
        { waktu: "2025-09-03 11:20:45", keterangan: "Paket telah diterima oleh YBS (Budi Santoso)" }
      ]
    }
  }
};
```

---

## 4. PENJELASAN PROGRAM & ARSITEKTUR VUE.JS

Sistem dibangun menggunakan arsitektur **Model-View-ViewModel (MVVM)** bawaan Vue.js:
- **Model**: Dikelola oleh properti `data` pada instance Vue (array stok, object tracking, filter state, form state).
- **View**: Template berkas HTML (`stok.html` dan `tracking.html`) yang didekorasi dengan Vue directives (`v-model`, `v-bind`, `v-if`, `v-for`, `v-text`, `v-html`).
- **ViewModel**: Instance Vue (`new Vue({ ... })`) yang menjadi jembatan penghubung antara Model dan View secara dua arah (*two-way data binding*) dan otomatis merefleksikan setiap perubahan mutasi data ke DOM tanpa manipulasi manual `document.getElementById()`.

### A. Arsitektur Halaman Stok (`js/stok-app.js`)
Instance Vue di-mount pada elemen `#appStok` dengan konfigurasi:
1. `el: '#appStok'`: Menetapkan target DOM.
2. `data`: Menyimpan koleksi stok buku, filter UPBJJ, filter kategori, flag reorder alert, kata kunci pencarian, serta state formulir tambah/edit.
3. `computed`: Berisi kalkulasi turunan seperti `filteredStok`, `totalItemStok`, `totalQtyFisik`, serta ringkasan stok aman/menipis/kosong.
4. `watch`: Mengamati perubahan filter UT-Daerah dan mutasi array stok (`deep: true`).
5. `methods`: Menyediakan fungsi-fungsi handler event seperti `resetFilter()`, `tambahStok()`, `editStok()`, `simpanEditStok()`, `hapusStok()`, dan `formatRupiah()`.
6. `mounted()`: Lifecycle hook untuk memuat data tersimpan dari `localStorage` atau menginisialisasi dari dummy template awal.

### B. Arsitektur Halaman Tracking DO (`js/tracking-app.js`)
Instance Vue di-mount pada elemen `#appTracking` dengan konfigurasi:
1. `el: '#appTracking'`: Menetapkan target DOM.
2. `data`: Menyimpan koleksi DO (`trackingData`), input pencarian `inputCariDO`, referensi katalog modul BMP, serta formulir penerbitan DO baru.
3. `computed`: Menghitung penomoran sequence otomatis `nextNomorDO` (`DO[Tahun]-[Sequence]`), mengekstrak detail daftar buku pada paket yang dipilih `selectedPaketDetail`, dan mengonversi koleksi DO ke format array ringkas.
4. `watch`: Mengamati pemilihan paket `formDO.paketKode` untuk auto-update harga dan mengamati `trackingData` (`deep: true`) untuk persistensi ke `localStorage`.
5. `methods`: Menyediakan fungsi `lacakDO()`, `bukaModalTambahDO()`, `isiTanggalHariIni()`, `validasiFormDO()`, dan `simpanDOBaru()`.

---

## 5. PEMBAHASAN PEMENUHAN 5 INDIKATOR CAPAIAN BELAJAR

### Indikator 1: Sistem Pengorganisasian Kode Vue.js
**Kriteria**: Menerapkan arsitektur dan pemisahan file yang rapi, mudah dipahami, serta sesuai konvensi umum framework Vue.js.
- **Implementasi**: 
  - Tidak mencampur kode JavaScript ke dalam atribut HTML (bebas *inline script* spaghetti).
  - Berkas logika JavaScript dipisahkan ke dalam folder `js/` (`stok-app.js`, `tracking-app.js`, `dataBahanAjar.js`).
  - Berkas stylesheet dipusatkan di `css/style.css`.
  - Mengikuti struktur instance standar Vue.js tanpa kebutuhan kompilator rumit (Webpack/Vite) sesuai arahan tugas.

### Indikator 2: Fungsi Menampilkan Data (Mustaches, v-text, v-html)
**Kriteria**: Menerapkan berbagai mekanisme penampilan data secara tepat sesuai kebutuhan tipe konten.
- **Implementasi**:
  1. **Mustaches `{{ ... }}`**: Digunakan untuk interpolasi teks satu arah, misalnya:
     ```html
     <td>{{ item.kode }}</td>
     <td>{{ item.judul }}</td>
     <td>{{ formatRupiah(item.harga) }}</td>
     ```
  2. **Directive `v-text`**: Digunakan untuk mengisi konten teks elemen secara deklaratif pada ringkasan filter aktif:
     ```html
     <span v-text="filterSummaryText"></span>
     ```
  3. **Directive `v-html`**: Digunakan secara khusus pada kolom catatan bahan ajar (`item.catatanHTML`) agar format HTML seperti `<em>`, `<strong>`, dan `<u>` dapat dirender menjadi teks berformat:
     ```html
     <div v-html="item.catatanHTML"></div>
     ```
  4. **List Rendering `v-for`**: Digunakan untuk menampilkan data berulang pada baris tabel dan opsi dropdown:
     ```html
     <tr v-for="(item, index) in filteredStok" :key="item.kode + '-' + item.upbjj">
     ```

### Indikator 3: Penggunaan Conditional Rendering (`v-if`, `v-else-if`, `v-else`, `v-show`)
**Kriteria**: Menggunakan directive pengkondisian dengan operator logika yang tepat untuk mengatur keberadaan dan visibilitas elemen.
- **Implementasi**:
  1. **Status Stok Bahan Ajar**:
     ```html
     <!-- Aman: Stok >= Safety Stock -->
     <span v-if="Number(item.qty) >= Number(item.safety)" class="badge-status badge-aman">
       <span>&#10004;</span> Aman
     </span>

     <!-- Menipis: Stok < Safety Stock dan Stok > 0 -->
     <span v-else-if="Number(item.qty) < Number(item.safety) && Number(item.qty) > 0" class="badge-status badge-menipis">
       <span>&#9888;</span> Menipis
     </span>

     <!-- Kosong: Stok == 0 -->
     <span v-else class="badge-status badge-kosong">
       <span>&#9940;</span> Kosong
     </span>
     ```
  2. **Dependent Options Filter Kategori**: Dropdown kategori mata kuliah hanya dirender di DOM ketika pengguna sudah memilih salah satu UT-Daerah:
     ```html
     <div v-if="filterUpbjj !== ''" class="form-group dependent-filter-box">
       <label>Kategori Mata Kuliah:</label>
       <select v-model="filterKategori" class="form-control"> ... </select>
     </div>
     ```
  3. **Toggle Formulir Tambah (`v-show`)**: Mengubah visibilitas form tanpa menghapus elemen dari DOM:
     ```html
     <section v-show="showFormTambah" class="filter-card"> ... </section>
     ```
  4. **Detail Isi Paket BMP pada Tracking DO**:
     ```html
     <div v-if="selectedPaketDetail" class="package-detail-card">
       <h5>Informasi Detail Isi {{ selectedPaketDetail.nama }}:</h5>
       ...
     </div>
     ```

### Indikator 4: Data Binding & Property (`computed` & `methods`)
**Kriteria**: Menerapkan binding satu arah dan dua arah serta memanfaatkan computed properties dan methods secara proporsional.
- **Implementasi**:
  1. **One-Way Binding (`v-bind` / `:`)**:
     - `:class="['form-control', { 'is-invalid': errorsTambah.kode }]"` untuk validasi.
     - `:key="item.kode"` untuk efisiensi reconciliasi Virtual DOM.
  2. **Two-Way Binding (`v-model`)**:
     - Mengikat input formulir dan filter (`v-model="filterUpbjj"`, `v-model="formTambah.qty"`, `v-model="formDO.nim"`).
  3. **Computed Property (`computed`)**:
     - **`filteredStok`**: Mengolah filter multi-kriteria dan sorting secara terpadu.
       > *Argumen Pendukung*: Sesuai instruksi tugas *"di mana di semua filter tidak perlu recompute kembali"*, Vue meng-cache hasil `filteredStok` dan hanya menghitung ulang jika salah satu dependensinya (`stok`, `filterUpbjj`, `filterKategori`, `filterHanyaReorder`, `sortBy`, atau `sortOrder`) berubah nilainya.
     - **`nextNomorDO`**: Mengkalkulasi penomoran urut DO terbaru secara otomatis dengan format `DO[TahunBerjalan]-[Sequence 3 Digit]`.
     - **`selectedPaketDetail`**: Menggabungkan data paket BMP dengan katalog judul buku.
  4. **Methods Property (`methods`)**:
     - `resetFilter()`: Mengembalikan seluruh filter ke kondisi default.
     - `tambahStok()`, `editStok()`, `simpanEditStok()`, `hapusStok()`: Operasi manipulasi data inventaris.
     - `isiTanggalHariIni()`: Mengambil tanggal sistem lokal secara otomatis (`new Date()`).
     - `formatRupiah()`: Utilitas formatting nominal Rupiah berbasis `Intl.NumberFormat`.

### Indikator 5: Fungsi Watchers (Minimal 2 Watcher)
**Kriteria**: Menerapkan minimal 2 buah watcher untuk memantau perubahan data reaktif dan mengeksekusi side-effects.
- **Implementasi pada `stok-app.js`**:
  1. **Watcher 1: `filterUpbjj`**:
     ```javascript
     watch: {
       filterUpbjj: function(newVal, oldVal) {
         // Saat UT-Daerah diganti atau direset, bersihkan pilihan filter kategori
         this.filterKategori = "";
       }
     }
     ```
  2. **Watcher 2: `stok` (`deep: true`)**:
     ```javascript
     stok: {
       handler: function(newVal) {
         // Menyimpan setiap mutasi array stok ke localStorage
         localStorage.setItem("sitta_ut_stok", JSON.stringify(newVal));
       },
       deep: true
     }
     ```
- **Implementasi pada `tracking-app.js`**:
  1. **Watcher 1: `formDO.paketKode`**:
     ```javascript
     'formDO.paketKode': function(newKode, oldKode) {
       if (newKode) {
         var p = this.paket.find(function(item) { return item.kode === newKode; });
         if (p) {
           // Otomatis menyinkronkan total harga form dengan harga paket
           this.formDO.totalHarga = p.harga;
         }
       }
     }
     ```
  2. **Watcher 2: `trackingData` (`deep: true`)**:
     ```javascript
     trackingData: {
       handler: function(newVal) {
         localStorage.setItem("sitta_ut_tracking", JSON.stringify(newVal));
       },
       deep: true
     }
     ```

---

## 6. ALUR LOGIKA & CARA KERJA SISTEM

### A. Alur Pengelolaan Stok Bahan Ajar
```text
[Data Master / LocalStorage]
         │
         ▼
[Vue Data: stok[]] ───> [Watcher stok (deep: true)] ───> [Simpan ke LocalStorage]
         │
         ├────────────────────────────────────────┐
         │                                        │
         ▼                                        ▼
[Filter & Sort Input]                    [User Trigger Action]
(UPBJJ, Kategori, Re-Order, Cari)        (Tambah / Edit / Hapus)
         │                                        │
         ▼                                        ▼
[Watcher filterUpbjj]                   [Methods: tambahStok / simpanEdit]
(Reset filterKategori)                  (Validasi -> Mutasi Array stok)
         │                                        │
         ▼                                        │
[Computed: filteredStok] <────────────────────────┘
(Di-cache oleh Vue)
         │
         ▼
[Render ke DOM: stok.html]
- v-for: Baris Tabel
- v-if / v-else-if / v-else: Badge Status (Aman, Menipis, Kosong)
- v-html: Kolom Catatan
```

### B. Alur Pelacakan & Penerbitan Delivery Order (DO)
```text
[Form Penerbitan DO Baru]
         │
         ├─> 1. Nomor DO: Otomatis dihitung oleh computed nextNomorDO (misal: DO2026-003)
         ├─> 2. NIM & Nama: Diisi manual dengan validasi numerik
         ├─> 3. Ekspedisi: Dipilih dari pengirimanList
         ├─> 4. Paket Bahan Ajar (<select>):
         │       │
         │       ├─> v-if="selectedPaketDetail": Memunculkan daftar modul isi paket di bawah <select>
         │       └─> Watcher formDO.paketKode: Mengisi formDO.totalHarga otomatis dari paket.harga
         │
         ├─> 5. Tanggal Kirim: Diisi manual atau fungsi Date lokal (isiTanggalHariIni)
         │
         ▼
[Method simpanDOBaru()] ───> Validasi Form Berhasil
         │
         ▼
[Vue.set(trackingData, noDO, doBaru)]
         │
         ├─> Watcher trackingData (deep: true) menyimpan ke localStorage
         └─> Nomor DO baru langsung diset aktif & dimuat ke halaman pelacakan
```

---

## 7. DAFTAR PUSTAKA

1. **Sufandi, U. U., Aprijani, D. A., & Pandiangan, P. (2021).** Evaluasi dan hasil review desain user interface prototype aplikasi mobile SITTA Universitas Terbuka. *Jurnal Nasional Pendidikan Teknik Informatika: JANAPATI*, 10(3), 147-156. [https://doi.org/10.23887/janapati.v10i3.40281](https://doi.org/10.23887/janapati.v10i3.40281)
2. **Sufandi, U. U. (2022).** Analisis Kebutuhan dan Dokumentasi Sistem Informasi Tiras dan Transaksi Bahan Ajar Universitas Terbuka. *Jurnal Nasional Pendidikan Teknik Informatika: JANAPATI*, 11(2), 112-122. [https://doi.org/10.23887/janapati.v11i2.42966](https://doi.org/10.23887/janapati.v11i2.42966)
3. **You, E. (2023).** *Vue.js Guide & API Documentation (v2.x)*. Vue.js Organization. [https://v2.vuejs.org/](https://v2.vuejs.org/)
4. **Universitas Terbuka.** *Buku Materi Pokok (BMP) STSI4209 - Pemrograman Berbasis Web*. Tangerang Selatan: Universitas Terbuka.
