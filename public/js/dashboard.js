// ============================================
// DASHBOARD LOGIC
// ============================================

let currentAbsensiData = [];

// ---------- Cek Login ----------
function cekLogin() {
  const user = localStorage.getItem("pn_user");
  if (!user) {
    // Redirect ke halaman login
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(user);
}

// ---------- Tampilkan Tanggal ----------
function setTanggal() {
  const d = new Date();
  document.getElementById("todayDate").textContent = d.toLocaleDateString(
    "id-ID",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
}

// ---------- Render Data Absensi ----------
function renderAbsensi(filter = "", dateFilter = "") {
  const data = ambilData("pn_absensi");
  currentAbsensiData = data;
  const tbody = document.getElementById("absenTableBody");

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="text-center text-muted py-4">
          <i class="bi bi-inbox me-1"></i>Belum ada data absensi<br>
          <small>Silakan lakukan absensi terlebih dahulu</small>
        </td>
      </tr>`;
  } else {
    let filtered = data;
    
    // Filter berdasarkan tanggal
    if (dateFilter) {
      filtered = filtered.filter((d) => {
        const dataDate = new Date(d.waktu).toISOString().slice(0, 10);
        return dataDate === dateFilter;
      });
    }
    
    // Filter berdasarkan nama/NIP
    if (filter) {
      filtered = filtered.filter(
        (d) =>
          (d.nama || "").toLowerCase().includes(filter) ||
          (d.nip || "").toLowerCase().includes(filter),
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" class="text-center text-muted py-4">
            <i class="bi bi-search me-1"></i>Tidak ada hasil untuk filter yang dipilih
          </td>
        </tr>`;
      return;
    }

    const rows = filtered.map((d, i) => {
      const dalamRadius =
        d.diDalamRadius !== undefined
          ? d.diDalamRadius
          : (d.jarak || 0) <= 5000;
      const fotoBtn = d.selfie 
        ? `<button class="btn btn-sm btn-outline-primary" onclick="viewFoto('${d.selfie.replace(/'/g, "\\'")}', '${(d.nama || '-').replace(/'/g, "\\'")}', '${(d.waktu || '').replace(/'/g, "\\'")}')"><i class="bi bi-image"></i></button>`
        : '<span class="text-muted small">-</span>';
      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${d.nama || "-"}</strong></td>
          <td>${d.nip || "-"}</td>
          <td>${d.jabatan || "-"}</td>
          <td>${d.ruangan || "-"}</td>
          <td>
            <span class="badge ${d.jenis === "masuk" ? "badge-masuk" : "badge-pulang"}">
              ${d.jenis === "masuk" ? "Masuk" : "Pulang"}
            </span>
          </td>
          <td>
            <span class="badge bg-secondary">${(d.metode || "gps").toUpperCase()}</span>
          </td>
          <td>${fotoBtn}</td>
          <td>${d.jarak ? d.jarak + " m" : "-"}</td>
          <td>${formatWaktu(d.waktu)}</td>
          <td>
            ${
              dalamRadius
                ? '<span class="text-success"><i class="bi bi-check-circle"></i> Valid</span>'
                : '<span class="text-danger"><i class="bi bi-x-circle"></i> Luar Radius</span>'
            }
          </td>
        </tr>`;
    });
    tbody.innerHTML = rows.join("");
  }

  // Update statistik
  updateStats(data);
}

// ---------- Update Statistik ----------
function updateStats(data) {
  const countMasuk = data.filter((d) => d.jenis === "masuk").length;
  const countPulang = data.filter((d) => d.jenis === "pulang").length;
  const countRadius = data.filter(
    (d) => d.diDalamRadius !== false && (d.jarak || 0) <= 5000,
  ).length;
  const countPegawai = new Set(
    data.map((d) => d.nip || d.nama).filter(Boolean),
  ).size;

  document.getElementById("countMasuk").textContent = countMasuk;
  document.getElementById("countPulang").textContent = countPulang;
  document.getElementById("countRadius").textContent = countRadius;
  document.getElementById("countPegawai").textContent = countPegawai;
}

// ---------- Export Excel ----------
function getFilteredAbsensi() {
  const filter = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
  const dateFilter = document.getElementById("filterDate")?.value || "";

  return currentAbsensiData.filter((d) => {
    const matchesDate =
      !dateFilter || new Date(d.waktu).toISOString().slice(0, 10) === dateFilter;
    const matchesSearch =
      !filter ||
      (d.nama || "").toLowerCase().includes(filter) ||
      (d.nip || "").toLowerCase().includes(filter);
    return matchesDate && matchesSearch;
  });
}

function exportExcel() {
  const data = getFilteredAbsensi();
  if (data.length === 0) {
    showToast("Tidak ada data untuk diexport", "danger");
    return;
  }

  const escapeHtml = (value) =>
    String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const rows = data
    .map((d, i) => {
      const dalamRadius = d.diDalamRadius !== false && (d.jarak || 0) <= 5000;
      return `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.nama)}</td>
        <td>${escapeHtml(d.nip)}</td>
        <td>${escapeHtml(d.jabatan)}</td>
        <td>${escapeHtml(d.ruangan)}</td>
        <td>${escapeHtml(d.jenis === "masuk" ? "Masuk" : "Pulang")}</td>
        <td>${escapeHtml((d.metode || "gps").toUpperCase())}</td>
        <td>${escapeHtml(d.jarak ? `${d.jarak} m` : "-")}</td>
        <td>${escapeHtml(formatWaktu(d.waktu))}</td>
        <td>${dalamRadius ? "Valid" : "Luar Radius"}</td>
      </tr>`;
    })
    .join("");
  const excelDocument = `<table border="1">
    <thead><tr><th>No</th><th>Nama</th><th>NIP</th><th>Jabatan</th><th>Ruangan</th><th>Jenis</th><th>Metode</th><th>Jarak</th><th>Waktu</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
  const blob = new Blob([`<html><meta charset="UTF-8"><body>${excelDocument}</body></html>`], {
    type: "application/vnd.ms-excel",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `rekap_apel_pagi_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Rekap berhasil diexport ke Excel", "success");
}

// ---------- Print ----------
function printAbsensi() {
  if (getFilteredAbsensi().length === 0) {
    showToast("Tidak ada data untuk dicetak", "danger");
    return;
  }
  window.print();
}

// ---------- Event Listeners ----------
document.getElementById("searchInput")?.addEventListener("input", function () {
  const dateFilter = document.getElementById("filterDate")?.value || "";
  renderAbsensi(this.value.trim().toLowerCase(), dateFilter);
});

document.getElementById("filterDate")?.addEventListener("change", function () {
  const searchFilter = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
  renderAbsensi(searchFilter, this.value);
});

document.getElementById("btnExport")?.addEventListener("click", exportExcel);
document.getElementById("btnPrint")?.addEventListener("click", printAbsensi);

document.getElementById("btnLogout")?.addEventListener("click", function () {
  localStorage.removeItem("pn_user");
  showToast("Logout berhasil", "success");
  setTimeout(() => (window.location.href = "login.html"), 800);
});

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  const user = cekLogin();
  setTanggal();

  // Set default date ke hari ini
  const today = new Date().toISOString().split('T')[0];
  const filterDateEl = document.getElementById("filterDate");
  if (filterDateEl) {
    filterDateEl.value = today;
  }

  if (user) {
    document.getElementById("welcomeText").textContent =
      `Selamat datang, ${user.nama}`;
    // Server is the shared source of truth; localStorage is only a fallback
    // when the server cannot be reached.
    try {
      fetch("/api/absensi")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.data) && data.data.length > 0) {
            // Gunakan data dari server
            const mapped = data.data.map((d) => ({
              nama: d.nama,
              nip: d.nip,
              jabatan: d.jabatan,
              ruangan: d.ruangan,
              golongan: d.golongan,
              jenis: d.jenis,
              metode: d.metode,
              jarak: d.jarak,
              waktu: d.waktu,
              selfie: d.selfie,
              diDalamRadius:
                d.diDalamRadius !== undefined
                  ? d.diDalamRadius
                  : (d.jarak || 0) <= 5000,
            }));
            renderCustom(mapped);
          } else {
            // Fallback ke localStorage
            renderAbsensi();
          }
        })
        .catch(() => renderAbsensi());
    } catch (e) {
      renderAbsensi();
    }
  }
});

function renderCustom(data) {
  // Gunakan data server - reuse render logic with custom data
  currentAbsensiData = data;
  const tbody = document.getElementById("absenTableBody");
  if (data.length === 0) {
    renderAbsensi();
    return;
  }
  
  // Ambil filter dari input
  const dateFilter = document.getElementById("filterDate")?.value || "";
  let filtered = data;
  
  // Filter berdasarkan tanggal jika ada
  if (dateFilter) {
    filtered = filtered.filter((d) => {
      const dataDate = new Date(d.waktu).toISOString().slice(0, 10);
      return dataDate === dateFilter;
    });
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted py-4">
          <i class="bi bi-search me-1"></i>Tidak ada data untuk tanggal yang dipilih
        </td>
      </tr>`;
    return;
  }
  
  const rows = filtered.map((d, i) => {
    const dalamRadius = d.diDalamRadius;
    const fotoBtn = d.selfie 
      ? `<button class="btn btn-sm btn-outline-primary" onclick="viewFoto('${d.selfie.replace(/'/g, "\\'")}', '${(d.nama || '-').replace(/'/g, "\\'")}', '${(d.waktu || '').replace(/'/g, "\\'")}')"><i class="bi bi-image"></i></button>`
      : '<span class="text-muted small">-</span>';
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${d.nama || "-"}</strong></td>
        <td>${d.nip || "-"}</td>
        <td>${d.jabatan || "-"}</td>
        <td>${d.ruangan || "-"}</td>
        <td>
          <span class="badge ${d.jenis === "masuk" ? "badge-masuk" : "badge-pulang"}">
            ${d.jenis === "masuk" ? "Masuk" : "Pulang"}
          </span>
        </td>
        <td><span class="badge bg-secondary">${(d.metode || "gps").toUpperCase()}</span></td>
        <td>${fotoBtn}</td>
        <td>${d.jarak ? d.jarak + " m" : "-"}</td>
        <td>${formatWaktu(d.waktu)}</td>
        <td>
          ${
            dalamRadius
              ? '<span class="text-success"><i class="bi bi-check-circle"></i> Valid</span>'
              : '<span class="text-danger"><i class="bi bi-x-circle"></i> Luar Radius</span>'
          }
        </td>
      </tr>`;
  });
  tbody.innerHTML = rows.join("");

  // Update stats
  document.getElementById("countMasuk").textContent = filtered.filter(
    (d) => d.jenis === "masuk",
  ).length;
  document.getElementById("countPulang").textContent = filtered.filter(
    (d) => d.jenis === "pulang",
  ).length;
  document.getElementById("countRadius").textContent = filtered.filter(
    (d) => d.jarak <= 5000,
  ).length;
  document.getElementById("countPegawai").textContent = new Set(
    data.map((d) => d.nip || d.nama).filter(Boolean),
  ).size;
}

// ---------- View Foto Modal ----------
function viewFoto(fotoUrl, nama, waktu) {
  document.getElementById("fotoImage").src = fotoUrl;
  document.getElementById("fotoNama").textContent = nama;
  document.getElementById("fotoWaktu").textContent = formatWaktu(waktu);
  new bootstrap.Modal(document.getElementById("fotoModal")).show();
}
