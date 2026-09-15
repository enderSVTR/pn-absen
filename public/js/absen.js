// ============================================
// ABSENSI PAGE LOGIC - GPS AND SELFIE
// ============================================

// ---------- Inisialisasi ----------
// Peta menggunakan Google Maps embed (iframe) di absen.html.
// Posisi kantor TETAP di Pengadilan Negeri Depok.
const kantorKoord = { lat: KANTOR_LAT, lng: KANTOR_LNG };

let userLat = null;
let userLng = null;
let capturedSelfie = null;
let stream = null;
let isCameraOn = false;
let selectedPegawai = null;
let allPegawai = [];

function isLocalSecureOrigin() {
  return (
    location.protocol === "https:" ||
    ["localhost", "127.0.0.1", "::1"].includes(location.hostname)
  );
}

function redirectToHttps() {
  if (isLocalSecureOrigin()) return false;

  const httpsPort = location.port === "3000" ? "3443" : "3443";
  const portSuffix = httpsPort === "443" ? "" : `:${httpsPort}`;
  const httpsUrl = `https://${location.hostname}${portSuffix}${location.pathname}${location.search}${location.hash}`;

  document.body.innerHTML = `
    <main class="container py-5 text-center">
      <h2 class="mb-3">Membuka akses aman...</h2>
      <p>GPS dan kamera hanya dapat digunakan melalui HTTPS.</p>
      <p class="small text-muted">Jika tidak berpindah otomatis, buka:</p>
      <a class="btn btn-primary" href="${httpsUrl}">${httpsUrl}</a>
    </main>`;
  location.replace(httpsUrl);
  return true;
}

if (redirectToHttps()) {
  throw new Error("Redirecting to HTTPS");
}

const successModal = new bootstrap.Modal(
  document.getElementById("successModal"),
);

// ---------- Load Data Pegawai ----------
async function loadPegawai() {
  const response = await fetch("/api/pegawai");
  const result = await response.json();
  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Data pegawai tidak dapat dimuat");
  }

  allPegawai = result.data;
  const options = document.getElementById("pegawaiOptions");
  if (options) {
    options.replaceChildren(
      ...allPegawai.map((pegawai) => {
        const option = document.createElement("option");
        option.value = pegawai.nama;
        return option;
      }),
    );
  }

  const user = JSON.parse(localStorage.getItem("pn_user") || "null");
  if (user && user.role === "pegawai") {
    selectPegawai(user.nama);
  }
}

// ---------- Pencarian Pegawai ----------
function selectPegawai(nama) {
  const namaCari = (nama || "").trim().toLowerCase();
  const pegawai = allPegawai.find(
    (item) => item.nama.trim().toLowerCase() === namaCari,
  );

  document.getElementById("namaPegawai").value = nama || "";
  if (!pegawai) {
    resetPegawaiSelection();
    return;
  }

  selectedPegawai = pegawai;
  document.getElementById("nip").value = pegawai.nip || "";
  document.getElementById("jabatan").value = pegawai.jabatan || "";
  document.getElementById("golongan").value = pegawai.golongan || "";
  document.getElementById("ruangan").value = pegawai.ruangan || "";
}

function resetPegawaiSelection() {
  selectedPegawai = null;
  document.getElementById("nip").value = "";
  document.getElementById("jabatan").value = "";
  document.getElementById("golongan").value = "";
  document.getElementById("ruangan").value = "";
}

document.getElementById("namaPegawai")?.addEventListener("input", (event) => {
  const nama = event.target.value.trim();
  const pegawai = allPegawai.find(
    (item) => item.nama.trim().toLowerCase() === nama.toLowerCase(),
  );

  if (pegawai) selectPegawai(pegawai.nama);
  else resetPegawaiSelection();
});

function clearFields() {
  selectedPegawai = null;
  document.getElementById("namaPegawai").value = "";
  document.getElementById("nip").value = "";
  document.getElementById("jabatan").value = "";
  document.getElementById("golongan").value = "";
  document.getElementById("ruangan").value = "";
}

// ---------- GPS ----------
// Fungsi menampilkan lokasi pengguna berdasarkan koordinat GPS browser.
// Peta tampil via Google Maps embed (iframe) di absen.html.
let watchId = null;

function updateLokasiDisplay(jarak) {
  document.getElementById("txtLat").textContent = userLat.toFixed(6);
  document.getElementById("txtLng").textContent = userLng.toFixed(6);
  document.getElementById("txtJarak").textContent = jarak.toFixed(1) + " m";

  // Indikator pelacakan langsung mengikuti posisi pengguna
  const statusEl = document.getElementById("gpsStatus");
  if (statusEl && watchId && !window.lokasiDariIP) {
    const waktu = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const jarakTxt = jarak.toFixed(0);
    const label = jarak <= RADIUS_MAKS ? "Lokasi valid" : "Di luar radius";
    statusEl.innerHTML = `<span class="status-ok"><span class="status-dot"></span>📍 Melacak lokasi Anda (${label}, ${jarakTxt} m) - ${waktu}</span>`;
  }
}

// Mode lokasi: 'kantor' (validasi radius) atau 'dinas' (tanpa radius)
function getModeLokasi() {
  const el = document.getElementById("modeLokasi");
  return el ? el.value : "kantor";
}

// Tampilkan/sembunyikan info mode dinas luar
function setModeLokasiListeners() {
  const el = document.getElementById("modeLokasi");
  const info = document.getElementById("modeLokasiInfo");
  if (!el || !info) return;
  el.addEventListener("change", () => {
    if (el.value === "dinas") {
      info.classList.remove("d-none");
    } else {
      info.classList.add("d-none");
    }
  });
}

// ---------- Fallback Lokasi ----------
// Geolokasi berbasis IP tidak cukup akurat untuk validasi kehadiran.
async function getLocationViaIP() {
  const statusEl = document.getElementById("gpsStatus");
  userLat = null;
  userLng = null;
  window.lokasiDariIP = false;
  document.getElementById("txtLat").textContent = "-";
  document.getElementById("txtLng").textContent = "-";
  document.getElementById("txtJarak").textContent = "-";
  statusEl.innerHTML =
    '<span class="status-warn"><span class="status-dot"></span>GPS tidak tersedia. Buka halaman dengan HTTPS dan izinkan akses lokasi.</span>';
  showToast(
    "Lokasi IP tidak digunakan karena tidak akurat. Aktifkan GPS melalui HTTPS.",
    "danger",
  );
}

function getLocation() {
  const statusEl = document.getElementById("gpsStatus");

  if (!isLocalSecureOrigin()) {
    redirectToHttps();
    return;
  }

  if (!navigator.geolocation) {
    statusEl.innerHTML =
      '<span class="status-warn"><span class="status-dot"></span>Browser tidak mendukung GPS</span>';
    getLocationViaIP();
    return;
  }

  statusEl.innerHTML =
    '<span class="status-warn"><span class="status-dot"></span>Mendeteksi lokasi...</span>';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      window.lokasiDariIP = false;

      const jarak = hitungJarak(
        userLat,
        userLng,
        kantorKoord.lat,
        kantorKoord.lng,
      );
      updateLokasiDisplay(jarak);

      const d = new Date();
      const waktuLokasi = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (jarak <= RADIUS_MAKS) {
        statusEl.innerHTML = `<span class="status-ok"><span class="status-dot"></span>Lokasi valid (${jarak.toFixed(0)} m dari kantor) - ${waktuLokasi}</span>`;
        showToast("Lokasi terdeteksi! Anda berada dalam radius.", "success");
      } else {
        statusEl.innerHTML = `<span class="status-warn"><span class="status-dot"></span>Di luar radius (${jarak.toFixed(0)} m dari kantor)</span>`;
        showToast("Lokasi di luar radius kantor!", "danger");
      }
    },
    (err) => {
      let msg = "Gagal mendapatkan lokasi";
      switch (err.code) {
        case err.PERMISSION_DENIED:
          msg = "Izin lokasi ditolak";
          break;
        case err.POSITION_UNAVAILABLE:
          msg = "Lokasi tidak tersedia";
          break;
        case err.TIMEOUT:
          msg = "Waktu deteksi habis";
          break;
      }
      statusEl.innerHTML = `<span class="status-warn"><span class="status-dot"></span>${msg}</span>`;
      showToast(msg, "danger");
      getLocationViaIP();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

document.getElementById("btnLokasi")?.addEventListener("click", getLocation);

// ---------- KAMERA & SELFIE ----------
async function openCamera() {
  const preview = document.getElementById("selfieCameraPreview");
  const btnFoto = document.getElementById("btnFoto");

  if (!isLocalSecureOrigin()) {
    redirectToHttps();
    return;
  }

  try {
    if (!isCameraOn) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Peramban ini tidak mendukung akses kamera.");
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 } },
        audio: false,
      });
      preview.innerHTML = '<video id="videoCam" autoplay playsinline></video>';
      const video = document.getElementById("videoCam");
      video.srcObject = stream;
      await new Promise((resolve, reject) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
        video.addEventListener("error", reject, { once: true });
      });
      await video.play();
      isCameraOn = true;
      btnFoto.disabled = false;
      capturedSelfie = null;
    }
  } catch (err) {
    let errMsg = "Kamera tidak tersedia. ";
    if (err.name === 'NotAllowedError') {
      errMsg += "Izinkan akses kamera di pengaturan browser HP Anda!";
    } else if (err.name === 'NotFoundError') {
      errMsg += "Perangkat tidak memiliki kamera.";
    } else if (err.name === 'NotReadableError') {
      errMsg += "Kamera sedang digunakan aplikasi lain.";
    } else if (!isLocalSecureOrigin()) {
      errMsg = "Kamera memerlukan HTTPS. Halaman akan dialihkan ke HTTPS.";
    }
    showToast(errMsg, "danger");
    console.error("Camera Error:", err);
  }
}

function closeCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  isCameraOn = false;
  const btnFoto = document.getElementById("btnFoto");
  btnFoto.disabled = true;

  if (!capturedSelfie) {
    document.getElementById("selfieCameraPreview").innerHTML = `
      <div class="placeholder">
        <i class="bi bi-camera-video"></i>
        <p class="mb-0">Video kamera akan tampil di sini</p>
      </div>`;
  }
}

async function capturePhoto() {
  if (!isCameraOn) {
    await openCamera();
  }

  const video = document.getElementById("videoCam");
  if (!video || !isCameraOn) {
    showToast("Izinkan akses kamera terlebih dahulu.", "danger");
    return;
  }
  if (!video.videoWidth || !video.videoHeight) {
    showToast("Kamera belum siap. Tunggu sampai gambar kamera tampil.", "danger");
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedSelfie = canvas.toDataURL("image/jpeg", 0.8);
  const preview = document.getElementById("selfieCameraPreview");
  preview.innerHTML = `<img src="${capturedSelfie}" alt="Selfie">`;
  showToast("✅ Foto selfie berhasil diambil!", "success");
  closeCamera();
}

document.getElementById("btnFoto")?.addEventListener("click", capturePhoto);

// ---------- SUBMIT ABSENSI ----------
document
  .getElementById("btnSubmit")
  ?.addEventListener("click", async function () {
    const nama = selectedPegawai?.nama;
    const nip = document.getElementById("nip").value;
    const jabatan = document.getElementById("jabatan").value;
    const golongan = document.getElementById("golongan").value;
    const ruangan = document.getElementById("ruangan").value;
    const jenis = document.getElementById("jenisAbsen").value;
    const metode = document.getElementById("metodeAbsen").value;
    const verif = document.getElementById("verifCheck").checked;

    if (!selectedPegawai || !nama) {
      showToast("Silakan masukkan nama pegawai terlebih dahulu", "danger");
      return;
    }
    if (!ruangan) {
      showToast("Silakan pilih ruangan terlebih dahulu", "danger");
      return;
    }
    if (userLat === null || userLng === null) {
      showToast('GPS belum aktif. Klik "Dapatkan Lokasi"', "danger");
      return;
    }
    if (!capturedSelfie) {
      showToast("Ambil foto selfie terlebih dahulu", "danger");
      return;
    }
    if (!verif) {
      showToast("Centang pernyataan verifikasi", "danger");
      return;
    }

    const jarak = hitungJarak(
      userLat,
      userLng,
      kantorKoord.lat,
      kantorKoord.lng,
    );

    // Mode lokasi: dinas luar mengizinkan absen di luar radius
    const modeLokasi = getModeLokasi();
    const diDalamRadius = jarak <= RADIUS_MAKS;

    if (modeLokasi === "kantor" && !diDalamRadius) {
      showToast(
        "Anda di luar radius kantor. Pilih 'Dinas Luar' jika dinas/berada di luar.",
        "danger",
      );
      return;
    }

    const absenData = {
      nama,
      nip,
      jabatan,
      golongan,
      ruangan,
      jenis,
      lat: userLat,
      lng: userLng,
      jarak: Math.round(jarak),
      metode,
      alamat: modeLokasi === "dinas" ? "Dinas Luar" : "PN Depok",
      qrData: selectedPegawai.qr,
      selfie: capturedSelfie,
      waktu: new Date().toISOString(),
      diDalamRadius,
      modeLokasi,
    };

    let serverSaved = false;
    try {
      const response = await fetch("/api/absen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(absenData),
      });
      const result = await response.json();
      serverSaved = response.ok && result.success === true;
    } catch (error) {
      console.error("Gagal mengirim absensi ke server:", error);
    }

    const modalMsg = document.getElementById("modalMsg");
    modalMsg.innerHTML = `
    <strong>${nama}</strong><br>
    ${ruangan}<br>
    ${jenis === "masuk" ? "Absen Masuk" : "Absen Pulang"} berhasil<br>
    <small>Jarak ${Math.round(jarak)} m | ${
      modeLokasi === "dinas" ? "Dinas Luar" : "Di Kantor"
    }</small>
  `;
    successModal.show();
    showToast(
      serverSaved
        ? "Absensi berhasil dikirim ke dashboard admin!"
        : "Absensi tersimpan di perangkat, tetapi belum terkirim ke server.",
      serverSaved ? "success" : "warning",
    );

    document.getElementById("namaPegawai").value = "";
    clearFields();
    capturedSelfie = null;
    userLat = null;
    userLng = null;
    document.getElementById("txtLat").textContent = "-";
    document.getElementById("txtLng").textContent = "-";
    document.getElementById("txtJarak").textContent = "-";
    document.getElementById("gpsStatus").innerHTML =
      '<span class="status-warn"><span class="status-dot"></span>Menunggu izin lokasi...</span>';
    document.getElementById("selfieCameraPreview").innerHTML = `
    <div class="placeholder">
      <i class="bi bi-camera-video"></i>
      <p class="mb-0">Video kamera akan tampil di sini</p>
    </div>`;
  });

// Pelacakan lokasi otomatis (mengikuti pergerakan pegawai)
function startLocationWatch() {
  if (!navigator.geolocation || watchId) return;
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      window.lokasiDariIP = false;
      const jarak = hitungJarak(
        userLat,
        userLng,
        kantorKoord.lat,
        kantorKoord.lng,
      );
      updateLokasiDisplay(jarak);
    },
    () => {
      // Abaikan error pada watch (fallback via getLocation)
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
  );
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  loadPegawai().catch((error) => {
    console.error("Gagal memuat data pegawai:", error);
    showToast("Data pegawai belum dapat dimuat dari database.", "danger");
  });
  setModeLokasiListeners();
  startLocationWatch();
  openCamera();

  // Coba deteksi lokasi otomatis saat halaman dibuka
  setTimeout(() => {
    if (userLat === null && userLng === null) {
      getLocation();
    }
  }, 800);
});
