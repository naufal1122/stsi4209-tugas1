/**
 * STSI4209 - Tugas Praktik 2: Logika Vue.js untuk Tracking Delivery Order (DO)
 * Universitas Terbuka - SITTA
 * 
 * Memenuhi 5 Indikator Capaian:
 * 1. Pengorganisasian kode Vue.js (data, computed, methods, watch, lifecycle)
 * 2. Menampilkan data (Mustache {{ }}, v-text, v-html)
 * 3. Conditional rendering (v-if, v-else-if, v-else, v-show)
 * 4. Data binding (v-bind, v-model, computed & methods)
 * 5. Minimal 2 Watchers (formDO.paketKode dan deep watcher trackingData)
 */

var appTracking = new Vue({
  el: '#appTracking',
  data: {
    // 1. Master Data Dummy (Diambil dari template dataBahanAjar.js)
    pengirimanList: (window.initialDataBahanAjar && window.initialDataBahanAjar.pengirimanList)
      ? [...window.initialDataBahanAjar.pengirimanList]
      : [
          { kode: "REG", nama: "Reguler (3-5 hari)" },
          { kode: "EXP", nama: "Ekspres (1-2 hari)" }
        ],

    paket: (window.initialDataBahanAjar && window.initialDataBahanAjar.paket)
      ? JSON.parse(JSON.stringify(window.initialDataBahanAjar.paket))
      : [
          { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
          { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
        ],

    // Master referensi buku/katalog bahan ajar untuk menampilkan detail isi paket
    katalogBuku: {
      "EKMA4116": "Pengantar Manajemen (BMP)",
      "EKMA4115": "Pengantar Akuntansi (BMP)",
      "BIOL4201": "Biologi Umum (Praktikum BMP)",
      "FISIP4001": "Dasar-Dasar Sosiologi (BMP)"
    },

    // 2. Data Pelacakan Delivery Order (Key-Value atau Object)
    trackingData: {},

    // 3. State Pencarian DO
    inputCariDO: "DO2025-001",
    currentDO: null,
    hasSearched: true,

    // 4. State UI Control
    showModalTambahDO: false,
    alertNotification: {
      show: false,
      type: "success",
      message: ""
    },

    // 5. Data Model Formulir DO Baru (Two-Way Binding v-model)
    formDO: {
      nomorDO: "",       // Digenerate otomatis
      nim: "",           // Diisi manual
      nama: "",          // Diisi manual
      ekspedisi: "",     // Dipilih dari pengirimanList
      paketKode: "",     // Dipilih dari <select> paket
      tanggalKirim: "",  // Diisi manual atau fungsi Date
      totalHarga: 0      // Otomatis diambil dari paket -> harga
    },
    errorsDO: {},

    // Log watcher untuk dokumentasi dan video penjelasan
    watcherLog: ""
  },

  // =========================================================================
  // COMPUTED PROPERTIES
  // =========================================================================
  computed: {
    /**
     * Otomatis men-generate Nomor DO baru sesuai instruksi soal:
     * - DO
     * - Tahun Berjalan (misal 2025 atau 2026)
     * - Sequence Number 3-digit (misal 001, 002, 003, ...)
     * Misal: DO2025-001, jika sudah ada, lanjut DO2025-002, dst.
     */
    nextNomorDO: function() {
      var tahunSekarang = new Date().getFullYear();
      var prefix = "DO" + tahunSekarang + "-";
      
      // Ambil seluruh nomor DO yang ada saat ini
      var keys = Object.keys(this.trackingData);
      var maxSeq = 0;

      keys.forEach(function(key) {
        // Cek pola DO{tahun}-{seq}
        var match = key.match(/^DO(\d{4})-(\d+)$/i);
        if (match) {
          var seq = parseInt(match[2], 10);
          if (seq > maxSeq) {
            maxSeq = seq;
          }
        }
      });

      var nextSeq = maxSeq + 1;
      // Format 3 digit sequence: 001, 002, dst.
      var seqStr = String(nextSeq).padStart(3, "0");
      return prefix + seqStr;
    },

    /**
     * Menampilkan Detail Isi Paket Bahan Ajar yang dipilih di bawah elemen <select>
     * Kriteria Soal: "Setelah memilih paket, akan muncul detail isi paket bahan ajar
     * tersebut di bawah elemen <select> untuk memberikan informasi"
     */
    selectedPaketDetail: function() {
      var self = this;
      if (!this.formDO.paketKode) {
        return null;
      }
      var p = this.paket.find(function(item) {
        return item.kode === self.formDO.paketKode;
      });
      if (!p) return null;

      // Map kode buku ke judul lengkap dari master katalogBuku
      var listBuku = p.isi.map(function(kodeBuku) {
        return {
          kode: kodeBuku,
          judul: self.katalogBuku[kodeBuku] || "Modul Bahan Ajar " + kodeBuku
        };
      });

      return {
        kode: p.kode,
        nama: p.nama,
        harga: p.harga,
        items: listBuku
      };
    },

    // Total DO yang terdaftar dalam sistem
    totalDOTersimpan: function() {
      return Object.keys(this.trackingData).length;
    },

    // Daftar semua DO dalam bentuk array untuk mempermudah pemilihan cepat (v-for)
    listDORingkas: function() {
      var self = this;
      return Object.keys(this.trackingData).map(function(k) {
        return self.trackingData[k];
      });
    }
  },

  // =========================================================================
  // WATCHERS (Memenuhi Indikator 5: Minimal 2 Watcher)
  // =========================================================================
  watch: {
    /**
     * WATCHER 1: Memantau perubahan pemilihan 'formDO.paketKode'
     * Kriteria Soal: "Total Harga, diambil dari data pada Array of Objects paket -> harga"
     * Saat paket dipilih oleh pengguna, watcher secara reaktif mencocokkan paket
     * dan otomatis mengisi formDO.totalHarga dengan harga paket tersebut.
     */
    'formDO.paketKode': function(newKode, oldKode) {
      if (newKode) {
        var p = this.paket.find(function(item) {
          return item.kode === newKode;
        });
        if (p) {
          this.formDO.totalHarga = p.harga;
          this.watcherLog = "Watcher 1 terpanggil: Paket berganti ke '" + p.nama + "'. Total harga disinkronkan ke " + this.formatRupiah(p.harga);
        }
      } else {
        this.formDO.totalHarga = 0;
      }
    },

    /**
     * WATCHER 2: Memantau mutasi data tracking (deep: true)
     * Otomatis menyimpan setiap DO baru atau perubahan status ke localStorage
     * agar data pelacakan pengiriman tetap persisten saat halaman dimuat ulang.
     */
    trackingData: {
      handler: function(newVal) {
        var total = Object.keys(newVal).length;
        this.watcherLog = "Watcher 2 terpanggil: Data tracking dimutasi. Menyimpan " + total + " DO ke LocalStorage.";
        try {
          localStorage.setItem("sitta_ut_tracking", JSON.stringify(newVal));
        } catch (e) {
          console.warn("Gagal menyimpan tracking ke localStorage:", e);
        }
      },
      deep: true
    },

    /**
     * WATCHER 3 (Tambahan): Memantau input pencarian nomor DO (Auto-search)
     */
    inputCariDO: function(newVal) {
      if (newVal && newVal.trim().length >= 6) {
        var key = newVal.trim().toUpperCase();
        if (this.trackingData[key]) {
          this.currentDO = this.trackingData[key];
          this.hasSearched = true;
        }
      }
    }
  },

  // =========================================================================
  // METHODS
  // =========================================================================
  methods: {
    // Format Mata Uang Rupiah
    formatRupiah: function(angka) {
      if (angka === undefined || angka === null) return "Rp 0";
      return "Rp " + Number(angka).toLocaleString("id-ID");
    },

    // Mencari Nomor DO
    lacakDO: function() {
      if (!this.inputCariDO || this.inputCariDO.trim() === "") {
        this.tampilkanNotifikasi("danger", "Silakan masukkan nomor Delivery Order (DO) yang ingin dilacak.");
        return;
      }

      var keyword = this.inputCariDO.trim().toUpperCase();
      this.hasSearched = true;

      if (this.trackingData[keyword]) {
        this.currentDO = this.trackingData[keyword];
        this.tampilkanNotifikasi("success", "Data pengiriman DO '" + keyword + "' berhasil ditemukan!");
      } else {
        this.currentDO = null;
        this.tampilkanNotifikasi("warning", "Nomor DO '" + keyword + "' tidak ditemukan dalam sistem.");
      }
    },

    // Pilih Cepat DO dari daftar yang ada
    pilihCepatDO: function(nomor) {
      this.inputCariDO = nomor;
      this.lacakDO();
    },

    // Buka Modal Form Tambah DO Baru
    bukaModalTambahDO: function() {
      this.errorsDO = {};
      // Set nomor DO otomatis dari computed nextNomorDO
      this.formDO.nomorDO = this.nextNomorDO;
      this.formDO.nim = "";
      this.formDO.nama = "";
      this.formDO.ekspedisi = "";
      this.formDO.paketKode = "";
      this.formDO.totalHarga = 0;
      
      // Ambil tanggal hari ini secara otomatis menggunakan Date lokal
      this.isiTanggalHariIni();

      this.showModalTambahDO = true;
    },

    // Mengambil local date (YYYY-MM-DD)
    isiTanggalHariIni: function() {
      var now = new Date();
      var year = now.getFullYear();
      var month = String(now.getMonth() + 1).padStart(2, "0");
      var day = String(now.getDate()).padStart(2, "0");
      this.formDO.tanggalKirim = year + "-" + month + "-" + day;
    },

    // Validasi Form DO Baru
    validasiFormDO: function() {
      this.errorsDO = {};
      var valid = true;

      if (!this.formDO.nim || this.formDO.nim.trim() === "") {
        this.errorsDO.nim = "NIM Mahasiswa wajib diisi.";
        valid = false;
      } else if (!/^\d{8,12}$/.test(this.formDO.nim.trim())) {
        this.errorsDO.nim = "NIM harus berupa 8-12 digit angka numerik.";
        valid = false;
      }

      if (!this.formDO.nama || this.formDO.nama.trim() === "") {
        this.errorsDO.nama = "Nama lengkap mahasiswa wajib diisi.";
        valid = false;
      }

      if (!this.formDO.ekspedisi) {
        this.errorsDO.ekspedisi = "Silakan pilih layanan ekspedisi.";
        valid = false;
      }

      if (!this.formDO.paketKode) {
        this.errorsDO.paketKode = "Silakan pilih paket bahan ajar BMP.";
        valid = false;
      }

      if (!this.formDO.tanggalKirim) {
        this.errorsDO.tanggalKirim = "Tanggal kirim harus diisi.";
        valid = false;
      }

      return valid;
    },

    // Simpan Input Delivery Order Baru
    simpanDOBaru: function() {
      if (!this.validasiFormDO()) {
        this.tampilkanNotifikasi("danger", "Mohon lengkapi seluruh formulir DO dengan benar.");
        return;
      }

      var noDO = this.formDO.nomorDO;
      var now = new Date();
      var jamKirim = String(now.getHours()).padStart(2, "0") + ":" + 
                     String(now.getMinutes()).padStart(2, "0") + ":" + 
                     String(now.getSeconds()).padStart(2, "0");

      // Siapkan object tracking DO baru
      var doBaru = {
        nomorDO: noDO,
        nim: this.formDO.nim.trim(),
        nama: this.formDO.nama.trim(),
        status: "Dalam Perjalanan",
        ekspedisi: this.formDO.ekspedisi,
        tanggalKirim: this.formDO.tanggalKirim,
        paket: this.formDO.paketKode,
        total: Number(this.formDO.totalHarga),
        perjalanan: [
          {
            waktu: this.formDO.tanggalKirim + " " + jamKirim,
            keterangan: "Penerimaan di Loket Ekspedisi: PUSLABA UT PONDOK CABE"
          },
          {
            waktu: this.formDO.tanggalKirim + " " + jamKirim,
            keterangan: "Manifest pengiriman DO dibuat - Siap diberangkatkan ke alamat tujuan"
          }
        ]
      };

      // Simpan secara reaktif menggunakan Vue.set
      this.$set(this.trackingData, noDO, doBaru);

      // Tutup modal dan langsung tampilkan DO yang baru dibuat
      this.showModalTambahDO = false;
      this.inputCariDO = noDO;
      this.currentDO = doBaru;
      this.hasSearched = true;

      this.tampilkanNotifikasi("success", "Delivery Order '" + noDO + "' untuk " + doBaru.nama + " berhasil diterbitkan!");
    },

    // Reset Data Tracking ke Dummy Awal
    resetTrackingData: function() {
      if (confirm("Kembalikan seluruh data Tracking DO ke dummy awal?")) {
        localStorage.removeItem("sitta_ut_tracking");
        if (window.initialDataBahanAjar && window.initialDataBahanAjar.tracking) {
          this.trackingData = JSON.parse(JSON.stringify(window.initialDataBahanAjar.tracking));
        }
        this.inputCariDO = "DO2025-001";
        this.currentDO = this.trackingData["DO2025-001"] || null;
        this.tampilkanNotifikasi("success", "Data tracking DO berhasil di-reset.");
      }
    },

    // Notifikasi Toast
    tampilkanNotifikasi: function(type, message) {
      this.alertNotification = {
        show: true,
        type: type,
        message: message
      };
      var self = this;
      setTimeout(function() {
        self.alertNotification.show = false;
      }, 4500);
    }
  },

  // =========================================================================
  // MOUNTED HOOK
  // =========================================================================
  mounted: function() {
    var savedTracking = localStorage.getItem("sitta_ut_tracking");
    if (savedTracking) {
      try {
        this.trackingData = JSON.parse(savedTracking);
      } catch (e) {
        console.error("Gagal load tracking dari storage:", e);
        this.trackingData = (window.initialDataBahanAjar && window.initialDataBahanAjar.tracking)
          ? JSON.parse(JSON.stringify(window.initialDataBahanAjar.tracking))
          : {};
      }
    } else if (window.initialDataBahanAjar && window.initialDataBahanAjar.tracking) {
      this.trackingData = JSON.parse(JSON.stringify(window.initialDataBahanAjar.tracking));
    }

    // Default tampilkan DO awal jika ada
    if (this.trackingData["DO2025-001"]) {
      this.currentDO = this.trackingData["DO2025-001"];
    } else {
      var keys = Object.keys(this.trackingData);
      if (keys.length > 0) {
        this.currentDO = this.trackingData[keys[0]];
        this.inputCariDO = keys[0];
      }
    }
  }
});
