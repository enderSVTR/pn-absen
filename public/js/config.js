// ============================================
// KONFIGURASI SISTEM ABSENSI PN DEPOK
// ============================================

// KANTOR: Pengadilan Negeri Depok
// Alamat: Jl. Boulevard Grand Depok City No.7, Kalimulya, Kec. Cilodong,
// Kota Depok, Jawa Barat 16413
const KANTOR_ALAMAT =
  "Jl. Boulevard Grand Depok City No.7, Kalimulya, Kec. Cilodong, Kota Depok, Jawa Barat 16413";
// Koordinat GPS (dari OpenStreetMap)
const KANTOR_LAT = -6.4249650;
const KANTOR_LNG = 106.8276964;

// RADIUS VALIDASI LOKASI
// 5 km = mencakup seluruh area Depok (Sukmajaya, Mekar Jaya, dll)
const RADIUS_MAKS = 5000; // dalam meter

// INFORMASI LOKASI REFERENSI
// Lokasi Laptop/Admin
const LAPTOP_LOKASI = {
  nama: "Jl. Majapahit V No.294, Mekar Jaya, Sukmajaya, Depok",
  lat: -6.3950000,    // Mekar Jaya, Sukmajaya
  lng: 106.8380000,   // Gang area
  catatan: "Lokasi laptop admin - DALAM radius dari PN Depok"
};

// Fungsi: Hitung jarak antara dua koordinat (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam meter
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Fungsi: Verifikasi lokasi dalam radius
function isWithinRadius(lat, lng, tolerance = RADIUS_MAKS) {
  const jarak = calculateDistance(lat, lng, KANTOR_LAT, KANTOR_LNG);
  return {
    valid: jarak <= tolerance,
    jarak: jarak,
    pesan: jarak <= tolerance 
      ? `✓ Dalam radius (${jarak.toFixed(0)}m)`
      : `✗ Luar radius (${jarak.toFixed(0)}m)`
  };
}

// Info: Test jarak dari lokasi laptop ke kantor
function testJarakLokasi() {
  const test = isWithinRadius(LAPTOP_LOKASI.lat, LAPTOP_LOKASI.lng);
  console.log("=== TEST JARAK LOKASI ===");
  console.log(`Kantor: (${KANTOR_LAT}, ${KANTOR_LNG})`);
  console.log(`Laptop: (${LAPTOP_LOKASI.lat}, ${LAPTOP_LOKASI.lng})`);
  console.log(`Jarak: ${test.jarak.toFixed(0)} meter`);
  console.log(`Radius: ${RADIUS_MAKS} meter`);
  console.log(`Status: ${test.pesan}`);
  console.log("=========================");
  return test;
}

// Jalankan test saat config dimuat
if (typeof window !== 'undefined') {
  console.log("[CONFIG LOADED] Sistem Absensi PN Depok initialized");
  testJarakLokasi();
}
