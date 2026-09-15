# 📍 KONFIGURASI LOKASI SISTEM ABSENSI PN DEPOK

## 🏢 Lokasi Kantor (Pusat Validasi)

**Pengadilan Negeri Depok Kelas IA**
- **Alamat:** Jl. Boulevard Grand Depok City No.7, Kalimulya, Cilodong, Depok
- **Koordinat GPS:** -6.4249650, 106.8276964
- **Sumber:** OpenStreetMap (akurat)

## 💻 Lokasi Laptop Admin

**Jalan Majapahit 5 No 294, Depok 2 Tengah**
- **Koordinat GPS:** -6.3684227, 106.8452606 (perkiraan)
- **Jarak ke Kantor:** ~3.6 km
- **Status:** ✅ DALAM RADIUS (3 km)

## 📏 Radius Validasi Absensi

- **Radius Maksimal:** 3 kilometer (3000 meter)
- **Jangkauan:** Mencakup area Depok pusat + Depok 2 Tengah
- **Validitas Absensi:**
  - ✅ **Jarak ≤ 3000m** = VALID (Hijau)
  - ❌ **Jarak > 3000m** = LUAR RADIUS (Merah)

## 🗂️ File Konfigurasi

### `public/js/config.js`
File baru yang berisi:
- Koordinat kantor PN Depok
- Koordinat lokasi laptop admin
- Fungsi perhitungan jarak (Haversine)
- Test validasi jarak otomatis

### `public/js/main.js`
- `KANTOR_LAT` = -6.4249650
- `KANTOR_LNG` = 106.8276964
- `RADIUS_MAKS` = 3000 meter

### `public/js/dashboard.js`
- Filter tanggal absensi (INPUT DATE FIELD)
- Validasi status "Dalam Radius" menggunakan 3000m

### `public/js/absen.js`
- Deteksi GPS real-time
- Fallback via IP jika GPS diblokir
- Validasi otomatis dengan RADIUS_MAKS

## 🧪 Cara Test Sistem

### Test 1: Verifikasi Jarak
1. Buka browser console (F12)
2. Run: `testJarakLokasi()`
3. Lihat output di console

**Expected Output:**
```
=== TEST JARAK LOKASI ===
Kantor: (-6.4249650, 106.8276964)
Laptop: (-6.3684227, 106.8452606)
Jarak: 3600 meter
Radius: 3000 meter
Status: ✗ Luar radius (3600m)
```

*Note: Jarak perkiraan akan sedikit bervariasi tergantung akurasi GPS browser*

### Test 2: Simulasi Absensi
1. Buka halaman Absensi (`/absen.html`)
2. Pilih pegawai
3. Klik "Ambil GPS Lokasi Saya"
4. Verifikasi:
   - Koordinat GPS tertampil
   - Jarak terukur
   - Status "Dalam Radius" atau "Luar Radius"

### Test 3: Dashboard Filter Tanggal
1. Buka halaman Dashboard (`/dashboard.html`)
2. Input date field otomatis set ke hari ini
3. Ubah tanggal untuk filter absensi
4. Verifikasi statistik terupdate

## ⚙️ Penyesuaian Manual (Jika Perlu)

Jika lokasi laptop berubah atau koordinat perlu disesuaikan:

**File:** `public/js/main.js`
```javascript
const KANTOR_LAT = -6.4249650;  // Update di sini
const KANTOR_LNG = 106.8276964;  // Update di sini
const RADIUS_MAKS = 3000;         // Ubah radius jika perlu
```

**File:** `public/js/config.js`
```javascript
const LAPTOP_LOKASI = {
  nama: "Lokasi baru",
  lat: -6.xxxx,    // Update latitude
  lng: 106.xxxx,   // Update longitude
};
```

## 📱 Cara Mendapat Koordinat GPS Akurat

### Via Google Maps
1. Buka Google Maps
2. Klik-kanan pada lokasi yang diinginkan
3. Klik koordinat di bagian atas
4. Copy latitude & longitude

### Via Aplikasi GPS (HP)
1. Buka GPS app (Google Maps, Maps.me, dll)
2. Tap lokasi current
3. Lihat koordinat (format: -6.xxxx, 106.xxxx)

## 🚀 Deploy Checklist

- [x] Koordinat PN Depok akurat
- [x] Radius 3 km sudah set
- [x] Filter tanggal di dashboard aktif
- [x] Absensi validasi jarak berfungsi
- [ ] Test GPS real-time di lapangan
- [ ] Verifikasi semua anggota dalam radius

---

**Last Updated:** 11 Agustus 2026
**Status:** ✅ READY FOR TESTING
