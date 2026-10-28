/**
 * STSI4209 - Tugas Praktik 2: Logika Vue.js untuk Halaman Stok Bahan Ajar
 * Universitas Terbuka - SITTA
 * 
 * Memenuhi 5 Indikator Capaian:
 * 1. Pengorganisasian kode Vue.js (data, computed, methods, watch)
 * 2. Menampilkan data (Mustache {{ }}, v-text, v-html)
 * 3. Conditional rendering (v-if, v-else-if, v-else, v-show)
 * 4. Data binding (v-bind, v-model, computed & methods)
 * 5. Watchers (memantau filterUpbjj dan deep watcher array stok)
 */

var appStok = new Vue({
  el: '#appStok',
  data: {
    // 1. Data Dummy / Master yang diambil dari referensi dataBahanAjar.js
    upbjjList: (window.initialDataBahanAjar && window.initialDataBahanAjar.upbjjList) 
      ? [...window.initialDataBahanAjar.upbjjList] 
      : ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
    
    kategoriList: (window.initialDataBahanAjar && window.initialDataBahanAjar.kategoriList) 
      ? [...window.initialDataBahanAjar.kategoriList] 
      : ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],

    // Array data stok bahan ajar (dengan auto-load dari localStorage jika ada)
    stok: [],

    // 2. Data State untuk Filter dan Sorting
    filterUpbjj: "",        // Filter UT-Daerah (dependent parent)
    filterKategori: "",     // Filter Kategori (dependent child)
    filterHanyaReorder: false, // Filter stok < safety atau stok === 0
    searchJudul: "",        // Filter pencarian teks judul/kode
    sortBy: "judul",        // Pilihan sort: 'judul', 'qty', 'harga'
    sortOrder: "asc",       // Arah sort: 'asc' atau 'desc'

    // 3. Data State untuk UI Control (v-show / v-if)
    showFormTambah: false,
    showModalEdit: false,
    alertNotification: {
      show: false,
      type: "success",
      message: ""
    },

    // 4. Data Model Formulir Tambah Stok Baru (Two-Way Data Binding v-model)
    formTambah: {
      kode: "",
      judul: "",
      kategori: "",
      upbjj: "",
      lokasiRak: "",
      harga: 0,
      qty: 0,
      safety: 10,
      catatanHTML: ""
    },
    errorsTambah: {},

    // 5. Data Model Formulir Edit Stok
    formEdit: {
      index: -1,
      kode: "",
      judul: "",
      kategori: "",
      upbjj: "",
      lokasiRak: "",
      harga: 0,
      qty: 0,
      safety: 0,
      catatanHTML: ""
    },
    errorsEdit: {},

    // Info watcher log untuk keperluan demonstrasi pengujian
    watcherLog: ""
  },

  // =========================================================================
  // COMPUTED PROPERTIES (Otomatis di-cache oleh Vue.js untuk efisiensi tinggi)
  // Tidak perlu recompute berulang jika dependencies tidak mengalami perubahan
  // =========================================================================
  computed: {
    /**
     * Mengolah seluruh filter dan sort data stok secara reaktif.
     * Kriteria Soal: "Terapkan fitur di vue.js di mana di semua filter tidak perlu recompute kembali."
     */
    filteredStok: function() {
      var self = this;
      var hasil = self.stok.filter(function(item) {
        // Filter 1: UT-Daerah
        if (self.filterUpbjj && self.filterUpbjj !== "") {
          if (item.upbjj !== self.filterUpbjj) {
            return false;
          }
        }

        // Filter 2: Kategori Mata Kuliah (Hanya aktif jika UT-Daerah dipilih / Dependent)
        if (self.filterKategori && self.filterKategori !== "") {
          if (item.kategori !== self.filterKategori) {
            return false;
          }
        }

        // Filter 3: Filter Kebutuhan Re-Order (Stok < Safety Stock atau Stok == 0)
        if (self.filterHanyaReorder) {
          var butuhReorder = (item.qty < item.safety) || (item.qty === 0);
          if (!butuhReorder) {
            return false;
          }
        }

        // Filter 4: Pencarian kata kunci Judul / Kode
        if (self.searchJudul && self.searchJudul.trim() !== "") {
          var keyword = self.searchJudul.toLowerCase().trim();
          var matchKode = item.kode.toLowerCase().includes(keyword);
          var matchJudul = item.judul.toLowerCase().includes(keyword);
          if (!matchKode && !matchJudul) {
            return false;
          }
        }

        return true;
      });

      // Fitur Sort: Mengurutkan berdasarkan judul, stok (qty), atau harga
      hasil.sort(function(a, b) {
        var multiplier = self.sortOrder === "asc" ? 1 : -1;

        if (self.sortBy === "judul") {
          return a.judul.localeCompare(b.judul) * multiplier;
        } else if (self.sortBy === "qty") {
          return (a.qty - b.qty) * multiplier;
        } else if (self.sortBy === "harga") {
          return (a.harga - b.harga) * multiplier;
        }
        return 0;
      });

      return hasil;
    },

    // Ringkasan Teks Filter yang Digunakan (Digunakan dengan v-text)
    filterSummaryText: function() {
      var parts = [];
      if (this.filterUpbjj) {
        parts.push("UT-Daerah: " + this.filterUpbjj);
      }
      if (this.filterKategori) {
        parts.push("Kategori: " + this.filterKategori);
      }
      if (this.filterHanyaReorder) {
        parts.push("Mode: Re-Order Alert (Stok Kritis/Kosong)");
      }
      if (this.searchJudul) {
        parts.push("Pencarian: '" + this.searchJudul + "'");
      }
      if (parts.length === 0) {
        return "Menampilkan semua bahan ajar (tanpa filter)";
      }
      return "Filter aktif: " + parts.join(" | ");
    },

    // Statistik Ringkasan Stok
    totalItemStok: function() {
      return this.stok.length;
    },

    totalQtyFisik: function() {
      return this.stok.reduce(function(total, item) {
        return total + Number(item.qty || 0);
      }, 0);
    },

    jumlahAman: function() {
      return this.stok.filter(function(i) {
        return Number(i.qty) >= Number(i.safety);
      }).length;
    },

    jumlahMenipis: function() {
      return this.stok.filter(function(i) {
        return Number(i.qty) < Number(i.safety) && Number(i.qty) > 0;
      }).length;
    },

    jumlahKosong: function() {
      return this.stok.filter(function(i) {
        return Number(i.qty) === 0;
      }).length;
    }
  },

  // =========================================================================
  // WATCHERS (Memenuhi Indikator 5: Minimal 2 Watcher)
  // =========================================================================
  watch: {
    /**
     * WATCHER 1: Memantau perubahan pilihan 'filterUpbjj' (Dependent Filter)
     * Kriteria Soal: "Implementasikan dependent options seperti misalkan ketika memilih 
     * filter stok berdasarkan 'UT-daerah', baru akan memunculkan filter untuk 'Kategori Mata Kuliah'"
     * Apabila UT-Daerah berganti atau dikosongkan, reset kategori agar pilihan selalu sinkron.
     */
    filterUpbjj: function(newVal, oldVal) {
      this.watcherLog = "Watcher 1 terpanggil: Filter UT-Daerah berubah dari '" + oldVal + "' ke '" + newVal + "'";
      // Reset filter kategori jika UT-Daerah diganti atau dikosongkan
      this.filterKategori = "";
    },

    /**
     * WATCHER 2: Memantau mutasi array 'stok' secara mendalam (deep: true)
     * Berfungsi untuk otomatis menyimpan setiap penambahan, edit, maupun hapus ke LocalStorage
     * serta memberikan peringatan jika terdapat stok yang menipis atau kosong.
     */
    stok: {
      handler: function(newVal) {
        this.watcherLog = "Watcher 2 terpanggil: Data stok termutasi. Menyimpan " + newVal.length + " item ke LocalStorage.";
        try {
          localStorage.setItem("sitta_ut_stok", JSON.stringify(newVal));
        } catch (e) {
          console.warn("Gagal menyimpan ke localStorage:", e);
        }
      },
      deep: true
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

    // Reset Semua Filter & Sort ke Keadaan Semula
    resetFilter: function() {
      this.filterUpbjj = "";
      this.filterKategori = "";
      this.filterHanyaReorder = false;
      this.searchJudul = "";
      this.sortBy = "judul";
      this.sortOrder = "asc";
      this.tampilkanNotifikasi("success", "Semua filter dan pengurutan telah di-reset ke default.");
    },

    // Buka / Tutup Form Tambah
    toggleFormTambah: function() {
      this.showFormTambah = !this.showFormTambah;
      if (this.showFormTambah) {
        this.errorsTambah = {};
      }
    },

    // Validasi Form Tambah Sederhana
    validasiFormTambah: function() {
      this.errorsTambah = {};
      var valid = true;

      if (!this.formTambah.kode || this.formTambah.kode.trim() === "") {
        this.errorsTambah.kode = "Kode Mata Kuliah wajib diisi.";
        valid = false;
      }
      if (!this.formTambah.judul || this.formTambah.judul.trim() === "") {
        this.errorsTambah.judul = "Nama / Judul Bahan Ajar wajib diisi.";
        valid = false;
      }
      if (!this.formTambah.kategori) {
        this.errorsTambah.kategori = "Pilih salah satu Kategori.";
        valid = false;
      }
      if (!this.formTambah.upbjj) {
        this.errorsTambah.upbjj = "Pilih UT-Daerah.";
        valid = false;
      }
      if (!this.formTambah.lokasiRak || this.formTambah.lokasiRak.trim() === "") {
        this.errorsTambah.lokasiRak = "Lokasi Rak wajib diisi.";
        valid = false;
      }
      if (this.formTambah.harga === "" || Number(this.formTambah.harga) < 0) {
        this.errorsTambah.harga = "Harga harus berupa angka valid (>= 0).";
        valid = false;
      }
      if (this.formTambah.qty === "" || Number(this.formTambah.qty) < 0) {
        this.errorsTambah.qty = "Jumlah stok harus berupa angka valid (>= 0).";
        valid = false;
      }
      if (this.formTambah.safety === "" || Number(this.formTambah.safety) < 0) {
        this.errorsTambah.safety = "Safety stock harus berupa angka valid (>= 0).";
        valid = false;
      }

      return valid;
    },

    // Simpan Data Bahan Ajar Baru
    tambahStok: function() {
      if (!this.validasiFormTambah()) {
        this.tampilkanNotifikasi("danger", "Mohon lengkapi seluruh isian formulir dengan benar.");
        return;
      }

      var itemBaru = {
        kode: this.formTambah.kode.trim().toUpperCase(),
        judul: this.formTambah.judul.trim(),
        kategori: this.formTambah.kategori,
        upbjj: this.formTambah.upbjj,
        lokasiRak: this.formTambah.lokasiRak.trim().toUpperCase(),
        harga: Number(this.formTambah.harga),
        qty: Number(this.formTambah.qty),
        safety: Number(this.formTambah.safety),
        catatanHTML: this.formTambah.catatanHTML.trim() || "<em>Tidak ada catatan</em>"
      };

      // Tambahkan ke array stok
      this.stok.push(itemBaru);

      // Reset Form Tambah
      this.formTambah = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 10,
        catatanHTML: ""
      };
      this.showFormTambah = false;
      this.tampilkanNotifikasi("success", "Bahan ajar '" + itemBaru.kode + " - " + itemBaru.judul + "' berhasil ditambahkan!");
    },

    // Buka Modal Edit Stok
    editStok: function(item) {
      var idx = this.stok.indexOf(item);
      if (idx === -1) return;

      this.formEdit = {
        index: idx,
        kode: item.kode,
        judul: item.judul,
        kategori: item.kategori,
        upbjj: item.upbjj,
        lokasiRak: item.lokasiRak,
        harga: item.harga,
        qty: item.qty,
        safety: item.safety,
        catatanHTML: item.catatanHTML
      };
      this.errorsEdit = {};
      this.showModalEdit = true;
    },

    // Validasi & Simpan Hasil Edit
    simpanEditStok: function() {
      this.errorsEdit = {};
      if (this.formEdit.qty === "" || Number(this.formEdit.qty) < 0) {
        this.errorsEdit.qty = "Jumlah stok harus valid (>= 0).";
        return;
      }
      if (this.formEdit.safety === "" || Number(this.formEdit.safety) < 0) {
        this.errorsEdit.safety = "Safety stock harus valid (>= 0).";
        return;
      }
      if (this.formEdit.harga === "" || Number(this.formEdit.harga) < 0) {
        this.errorsEdit.harga = "Harga harus valid (>= 0).";
        return;
      }
      if (!this.formEdit.lokasiRak || this.formEdit.lokasiRak.trim() === "") {
        this.errorsEdit.lokasiRak = "Lokasi Rak tidak boleh kosong.";
        return;
      }

      var idx = this.formEdit.index;
      if (idx >= 0 && idx < this.stok.length) {
        // Update data stok menggunakan Vue.set untuk reaktivitas terjamin
        var updated = {
          kode: this.formEdit.kode,
          judul: this.formEdit.judul,
          kategori: this.formEdit.kategori,
          upbjj: this.formEdit.upbjj,
          lokasiRak: this.formEdit.lokasiRak.trim().toUpperCase(),
          harga: Number(this.formEdit.harga),
          qty: Number(this.formEdit.qty),
          safety: Number(this.formEdit.safety),
          catatanHTML: this.formEdit.catatanHTML || "<em>Tidak ada catatan</em>"
        };

        this.$set(this.stok, idx, updated);
        this.showModalEdit = false;
        this.tampilkanNotifikasi("success", "Perubahan stok untuk '" + updated.kode + "' berhasil disimpan!");
      }
    },

    // Batal Edit
    batalEditStok: function() {
      this.showModalEdit = false;
    },

    // Hapus Stok
    hapusStok: function(item) {
      if (confirm("Apakah Anda yakin ingin menghapus data stok '" + item.kode + " - " + item.judul + "'?")) {
        var idx = this.stok.indexOf(item);
        if (idx !== -1) {
          this.stok.splice(idx, 1);
          this.tampilkanNotifikasi("warning", "Data bahan ajar berhasil dihapus.");
        }
      }
    },

    // Reset Data ke Dummy Asli
    resetDataKeDefault: function() {
      if (confirm("Kembalikan seluruh data stok ke template dummy awal?")) {
        localStorage.removeItem("sitta_ut_stok");
        if (window.initialDataBahanAjar && window.initialDataBahanAjar.stok) {
          this.stok = JSON.parse(JSON.stringify(window.initialDataBahanAjar.stok));
        }
        this.resetFilter();
        this.tampilkanNotifikasi("success", "Data stok berhasil di-reset ke dummy data bawaan UT.");
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
  // MOUNTED HOOK (Inisialisasi Data dari LocalStorage atau Dummy Data Awal)
  // =========================================================================
  mounted: function() {
    var savedStok = localStorage.getItem("sitta_ut_stok");
    if (savedStok) {
      try {
        this.stok = JSON.parse(savedStok);
      } catch (e) {
        console.error("Error parsing saved stok, fallback ke data bawaan", e);
        this.stok = (window.initialDataBahanAjar && window.initialDataBahanAjar.stok) 
          ? JSON.parse(JSON.stringify(window.initialDataBahanAjar.stok)) 
          : [];
      }
    } else if (window.initialDataBahanAjar && window.initialDataBahanAjar.stok) {
      this.stok = JSON.parse(JSON.stringify(window.initialDataBahanAjar.stok));
    }
  }
});
