/**
 * SITTA - Sistem Pemesanan dan Distribusi Bahan Ajar Universitas Terbuka
 * script.js - DOM Manipulation, Validation, Modal & Dynamic Data Handler
 */

document.addEventListener("DOMContentLoaded", () => {
  initGreeting();
  initLoginValidation();
  initModals();
  initStokTable();
  initTrackingDO();
  checkAuthSession();
});

/* ==========================================================
   1. GREETING LOCAL TIME
   Tampilkan "greeting" berdasarkan waktu local time (pagi/siang/sore/malam)
   ========================================================== */
function initGreeting() {
  const greetingEl = document.getElementById("greetingText");
  const timeClockEl = document.getElementById("currentTimeClock");

  if (!greetingEl) return;

  function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Selamat Datang";

    if (hours >= 4 && hours < 11) {
      greeting = "Selamat Pagi";
    } else if (hours >= 11 && hours < 15) {
      greeting = "Selamat Siang";
    } else if (hours >= 15 && hours < 18) {
      greeting = "Selamat Sore";
    } else {
      greeting = "Selamat Malam";
    }

    const currentUser = JSON.parse(localStorage.getItem("sitta_user")) || null;
    const userName = currentUser ? `, ${currentUser.nama}` : "";

    greetingEl.textContent = `${greeting}${userName}!`;

    if (timeClockEl) {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      timeClockEl.textContent = now.toLocaleDateString("id-ID", options);
    }
  }

  updateGreeting();
  if (timeClockEl) {
    setInterval(updateGreeting, 1000);
  }
}

/* ==========================================================
   2. AUTHENTICATION & LOGIN VALIDATION
   - Input: email dan password
   - Validasi terhadap dataPengguna di data.js
   - Alert/Pop-up: "email/password yang anda masukkan salah"
   ========================================================== */
function initLoginValidation() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const alertBox = document.getElementById("loginAlert");

    if (!emailInput || !passwordInput) {
      showErrorAlert(alertBox, "Harap lengkapi email dan password!");
      return;
    }

    // Cek pada array dataPengguna (dari js/data.js)
    if (typeof dataPengguna === "undefined") {
      showErrorAlert(alertBox, "Error: Data pengguna tidak ditemukan!");
      return;
    }

    const matchedUser = dataPengguna.find(
      (user) => user.email.toLowerCase() === emailInput.toLowerCase() && user.password === passwordInput
    );

    if (matchedUser) {
      // Simpan session ke localStorage
      localStorage.setItem("sitta_user", JSON.stringify(matchedUser));
      // Berhasil login -> redirect ke dashboard.html
      window.location.href = "dashboard.html";
    } else {
      // Sesuai syarat tugas PDF: munculkan pop-up / alert bahwa "email/password yang anda masukkan salah"
      alert("email/password yang anda masukkan salah");
      showErrorAlert(alertBox, "email/password yang anda masukkan salah");
    }
  });
}

function showErrorAlert(container, message) {
  if (!container) return;
  container.className = "custom-alert alert-danger";
  container.innerHTML = `<strong>Peringatan!</strong> ${message}`;
  container.style.display = "flex";
}

/* Cek status login pada halaman yang diproteksi */
function checkAuthSession() {
  const isLoginPage = window.location.pathname.endsWith("index.html") || 
                      window.location.pathname.endsWith("login.html") ||
                      window.location.pathname.endsWith("/") ||
                      window.location.pathname.split("/").pop() === "";

  const currentUser = JSON.parse(localStorage.getItem("sitta_user"));

  // Tampilkan badge nama user jika ada di navbar
  const userDisplay = document.getElementById("navUserDisplay");
  if (userDisplay && currentUser) {
    userDisplay.textContent = `${currentUser.nama} (${currentUser.role})`;
  }

  // Tombol Logout
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("sitta_user");
      window.location.href = "index.html";
    });
  }
}

/* ==========================================================
   3. MODAL BOX (Lupa Password & Registrasi)
   ========================================================== */
function initModals() {
  // Buka Modal Lupa Password
  const btnLupaPass = document.getElementById("btnLupaPassword");
  const modalLupaPass = document.getElementById("modalLupaPassword");

  if (btnLupaPass && modalLupaPass) {
    btnLupaPass.addEventListener("click", () => {
      openModal(modalLupaPass);
    });
  }

  // Buka Modal Registrasi / Daftar
  const btnDaftar = document.getElementById("btnDaftar");
  const modalDaftar = document.getElementById("modalDaftar");

  if (btnDaftar && modalDaftar) {
    btnDaftar.addEventListener("click", () => {
      openModal(modalDaftar);
    });
  }

  // Buka Modal Tambah Bahan Ajar (pada stok.html)
  const btnTambahStok = document.getElementById("btnTambahStok");
  const modalTambahStok = document.getElementById("modalTambahStok");

  if (btnTambahStok && modalTambahStok) {
    btnTambahStok.addEventListener("click", () => {
      openModal(modalTambahStok);
    });
  }

  // Tombol Tutup (semua tombol ber-class modal-close)
  document.querySelectorAll(".modal-close, [data-dismiss='modal']").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal-overlay");
      if (modal) closeModal(modal);
    });
  });

  // Klik di luar content modal untuk menutup
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModal(e.target);
    }
  });

  // Form Submit Simulasi di Lupa Password
  const formLupaPassword = document.getElementById("formLupaPassword");
  if (formLupaPassword) {
    formLupaPassword.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Instruksi reset kata sandi telah dikirimkan ke email Anda.");
      closeModal(modalLupaPass);
    });
  }

  // Form Submit Simulasi di Registrasi Akun
  const formDaftar = document.getElementById("formDaftar");
  if (formDaftar) {
    formDaftar.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = document.getElementById("regNama").value;
      const email = document.getElementById("regEmail").value;
      const pass = document.getElementById("regPassword").value;
      const role = document.getElementById("regRole").value;

      // Tambahkan ke dataPengguna sementara
      if (typeof dataPengguna !== "undefined") {
        dataPengguna.push({
          id: dataPengguna.length + 1,
          nama: nama,
          email: email,
          password: pass,
          role: role,
          lokasi: "Daerah"
        });
      }
      alert(`Pendaftaran akun ${nama} berhasil! Silakan login.`);
      closeModal(modalDaftar);
    });
  }
}

function openModal(modal) {
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(modal) {
  if (modal) {
    modal.style.display = "none";
  }
}

/* ==========================================================
   4. DATA BAHAN AJAR (stok.html)
   - Tampilkan dinamis dari dataBahanAjar di data.js
   - Tambah baris baru menggunakan JavaScript DOM
   ========================================================== */
function initStokTable() {
  const tabelBody = document.getElementById("tabelStokBody");
  if (!tabelBody) return;

  // Render awal data dari dataBahanAjar
  renderStokRows();

  // Handle Form Tambah Bahan Ajar Baru
  const formTambahStok = document.getElementById("formTambahStok");
  if (formTambahStok) {
    formTambahStok.addEventListener("submit", (e) => {
      e.preventDefault();

      const kodeLokasi = document.getElementById("stokKodeLokasi").value.trim();
      const kodeBarang = document.getElementById("stokKodeBarang").value.trim();
      const namaBarang = document.getElementById("stokNamaBarang").value.trim();
      const jenisBarang = document.getElementById("stokJenisBarang").value.trim();
      const edisi = document.getElementById("stokEdisi").value.trim();
      const stok = parseInt(document.getElementById("stokJumlah").value, 10);
      const cover = document.getElementById("stokCover").value.trim() || "img/default_book.jpg";

      // Validasi sederhana
      if (!kodeLokasi || !kodeBarang || !namaBarang || isNaN(stok)) {
        alert("Mohon lengkapi semua isian formulir!");
        return;
      }

      const itemBaru = {
        kodeLokasi,
        kodeBarang,
        namaBarang,
        jenisBarang,
        edisi,
        stok,
        cover
      };

      // Tambahkan ke array dan DOM
      if (typeof dataBahanAjar !== "undefined") {
        dataBahanAjar.push(itemBaru);
      }

      // Sisipkan baris baru langsung ke tabel menggunakan DOM API (createElement)
      appendRowToStokTable(itemBaru, dataBahanAjar.length);

      // Tutup modal dan reset form
      const modalTambahStok = document.getElementById("modalTambahStok");
      closeModal(modalTambahStok);
      formTambahStok.reset();

      alert(`Bahan ajar "${namaBarang}" berhasil ditambahkan!`);
    });
  }
}

function renderStokRows() {
  const tabelBody = document.getElementById("tabelStokBody");
  if (!tabelBody || typeof dataBahanAjar === "undefined") return;

  tabelBody.innerHTML = "";
  dataBahanAjar.forEach((item, index) => {
    appendRowToStokTable(item, index + 1);
  });
}

function appendRowToStokTable(item, noUrut) {
  const tabelBody = document.getElementById("tabelStokBody");
  if (!tabelBody) return;

  const tr = document.createElement("tr");

  // Format badge status stok
  let badgeClass = "stock-high";
  if (item.stok < 200) {
    badgeClass = "stock-low";
  } else if (item.stok < 400) {
    badgeClass = "stock-med";
  }

  tr.innerHTML = `
    <td><strong>${noUrut}</strong></td>
    <td><span class="badge" style="background:#e2e8f0; padding:4px 8px; border-radius:4px; font-family:monospace;">${item.kodeLokasi}</span></td>
    <td><strong>${item.kodeBarang}</strong></td>
    <td>
      <div class="book-cell">
        <img src="${item.cover}" alt="${item.namaBarang}" class="book-thumb" onerror="this.onerror=null; this.src='https://placehold.co/44x60/0b5cab/ffffff?text=BMP';">
        <div>
          <div><strong>${item.namaBarang}</strong></div>
          <small class="text-muted" style="color:#718096;">BMP Universitas Terbuka</small>
        </div>
      </div>
    </td>
    <td>${item.jenisBarang}</td>
    <td>Edisi ${item.edisi}</td>
    <td><span class="stock-badge ${badgeClass}">${item.stok.toLocaleString('id-ID')} eks</span></td>
    <td>
      <button class="btn btn-outline" style="padding:4px 10px; font-size:0.8rem;" onclick="lihatDetailStok('${item.kodeBarang}')">
        Detail
      </button>
    </td>
  `;

  tabelBody.appendChild(tr);
}

function lihatDetailStok(kodeBarang) {
  const item = dataBahanAjar.find(b => b.kodeBarang === kodeBarang);
  if (!item) return;

  const modalDetail = document.getElementById("modalDetailBahanAjar");
  const modalDetailContent = document.getElementById("detailBahanAjarContent");

  if (modalDetail && modalDetailContent) {
    modalDetailContent.innerHTML = `
      <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
        <img src="${item.cover}" alt="${item.namaBarang}" style="width:140px; height:190px; object-fit:cover; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);" onerror="this.src='https://placehold.co/140x190/0b5cab/ffffff?text=BMP+UT'">
        <div style="flex:1; min-width:200px;">
          <h3 style="color:#0b5cab; margin-bottom:8px;">${item.namaBarang}</h3>
          <p style="margin-bottom:6px;"><strong>Kode Barang:</strong> ${item.kodeBarang}</p>
          <p style="margin-bottom:6px;"><strong>Kode Lokasi:</strong> ${item.kodeLokasi}</p>
          <p style="margin-bottom:6px;"><strong>Jenis Barang:</strong> ${item.jenisBarang}</p>
          <p style="margin-bottom:6px;"><strong>Edisi:</strong> ${item.edisi}</p>
          <p style="margin-bottom:6px;"><strong>Jumlah Tersedia:</strong> <span class="stock-badge stock-high">${item.stok} eksemplar</span></p>
        </div>
      </div>
    `;
    openModal(modalDetail);
  } else {
    alert(`Detail Bahan Ajar:\nNama: ${item.namaBarang}\nKode: ${item.kodeBarang}\nLokasi: ${item.kodeLokasi}\nStok: ${item.stok}`);
  }
}

/* ==========================================================
   5. TRACKING PENGIRIMAN DO (tracking.html / dashboard.html)
   - Input: Nomor Delivery Order
   - Cari data di dataTracking
   - Tampilkan: Nama Mahasiswa, Status, Detail Ekspedisi, Tanggal Kirim, Jenis Paket, Total Pembayaran, Perjalanan
   ========================================================== */
function initTrackingDO() {
  const formTracking = document.getElementById("formTrackingDO");
  if (!formTracking) return;

  formTracking.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputDO = document.getElementById("inputNomorDO").value.trim();
    const resultPanel = document.getElementById("trackingResultPanel");
    const notFoundPanel = document.getElementById("trackingNotFound");

    if (!inputDO) {
      alert("Silakan masukkan Nomor Delivery Order!");
      return;
    }

    if (typeof dataTracking === "undefined") {
      alert("Data tracking tidak tersedia.");
      return;
    }

    const data = dataTracking[inputDO];

    if (data) {
      if (notFoundPanel) notFoundPanel.style.display = "none";
      displayTrackingInfo(data);
      if (resultPanel) resultPanel.style.display = "block";
    } else {
      if (resultPanel) resultPanel.style.display = "none";
      if (notFoundPanel) {
        notFoundPanel.style.display = "block";
        notFoundPanel.innerHTML = `
          <div class="custom-alert alert-danger">
            <strong>Nomor DO tidak ditemukan!</strong> Nomor Delivery Order "<strong>${inputDO}</strong>" tidak terdaftar dalam sistem. Coba: <code>2023001234</code> atau <code>2023005678</code>.
          </div>
        `;
      } else {
        alert(`Nomor Delivery Order "${inputDO}" tidak ditemukan dalam sistem!`);
      }
    }
  });
}

function displayTrackingInfo(data) {
  // Update elemen ringkasan
  const elNama = document.getElementById("trackNamaMahasiswa");
  const elNomorDO = document.getElementById("trackNomorDO");
  const elStatus = document.getElementById("trackStatus");
  const elEkspedisi = document.getElementById("trackEkspedisi");
  const elTglKirim = document.getElementById("trackTanggalKirim");
  const elPaket = document.getElementById("trackJenisPaket");
  const elTotal = document.getElementById("trackTotalPembayaran");
  const timelineList = document.getElementById("trackTimelineList");

  if (elNama) elNama.textContent = data.nama;
  if (elNomorDO) elNomorDO.textContent = data.nomorDO;
  if (elEkspedisi) elEkspedisi.textContent = data.ekspedisi;
  if (elTglKirim) elTglKirim.textContent = data.tanggalKirim;
  if (elPaket) elPaket.textContent = data.paket;
  if (elTotal) elTotal.textContent = data.total;

  if (elStatus) {
    elStatus.textContent = data.status;
    elStatus.className = "status-badge";
    if (data.status.toLowerCase().includes("selesai") || data.status.toLowerCase().includes("diterima")) {
      elStatus.classList.add("delivered");
    } else if (data.status.toLowerCase().includes("perjalanan")) {
      elStatus.classList.add("in-transit");
    } else {
      elStatus.classList.add("processing");
    }
  }

  // Update Stepper Progress Bar
  const stepNodes = document.querySelectorAll(".progress-stepper .step-node");
  const progressFill = document.querySelector(".progress-fill");

  if (stepNodes.length > 0) {
    stepNodes.forEach(node => node.className = "step-node");
    
    if (data.status === "Dalam Perjalanan") {
      stepNodes[0].classList.add("completed");
      stepNodes[1].classList.add("completed");
      stepNodes[2].classList.add("active");
      if (progressFill) progressFill.style.width = "66%";
    } else if (data.status === "Dikirim" || data.status === "Selesai") {
      stepNodes[0].classList.add("completed");
      stepNodes[1].classList.add("completed");
      stepNodes[2].classList.add("completed");
      stepNodes[3].classList.add("completed");
      if (progressFill) progressFill.style.width = "100%";
    } else {
      stepNodes[0].classList.add("active");
      if (progressFill) progressFill.style.width = "25%";
    }
  }

  // Update Timeline History
  if (timelineList && Array.isArray(data.perjalanan)) {
    timelineList.innerHTML = "";
    data.perjalanan.forEach((step) => {
      const li = document.createElement("li");
      li.className = "timeline-step";
      li.innerHTML = `
        <div class="timeline-time">${step.waktu}</div>
        <div class="timeline-desc">${step.keterangan}</div>
      `;
      timelineList.appendChild(li);
    });
  }
}
