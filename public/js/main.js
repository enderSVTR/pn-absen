// ============================================
// SISTEM ABSENSI PENGADILAN NEGERI DEPOK
// Shared / Common JavaScript
// ============================================

// Konstanta lokasi kantor PN Depok
// Pengadilan Negeri Depok Kelas IA
// Jl. Boulevard Grand Depok City No.7, Kalimulya, Kec. Cilodong,
// Kota Depok, Jawa Barat 16413
// Koordinat akurat dari OpenStreetMap
const KANTOR_LAT = -6.4249650;
const KANTOR_LNG = 106.8276964;
const KANTOR_ALAMAT =
  "Jl. Boulevard Grand Depok City No.7, Kalimulya, Kec. Cilodong, Kota Depok, Jawa Barat 16413";
const RADIUS_MAKS = 5000; // dalam meter (5 km) - mencakup seluruh area Depok + Depok 2 Tengah

// Helper: format tanggal & waktu Indonesia
function formatWaktu(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper: format jam saja
function formatJam(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper: hitung jarak haversine (meter)
function hitungJarak(lat1, lng1, lat2, lng2) {
  const R = 6371000; // radius bumi meter
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Helper: tampilkan toast notification
function showToast(message, type = "success") {
  // Buat container jika belum ada
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi bi-check-circle-fill me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// Helper: simpan data ke localStorage (mode demo)
function simpanData(kunci, data) {
  const existing = JSON.parse(localStorage.getItem(kunci) || "[]");
  existing.unshift(data);
  localStorage.setItem(kunci, JSON.stringify(existing));
}

function ambilData(kunci) {
  return JSON.parse(localStorage.getItem(kunci) || "[]");
}

// Daftar ruangan yang tersedia
const RUANGAN_LIST = ["Ruangan PTIP", "Ruangan Hukum", "Ruangan Pidana"];

// Set tahun footer otomatis
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
  