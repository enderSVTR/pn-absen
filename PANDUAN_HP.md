# 📱 PANDUAN AKSES ABSENSI DI HP

## ✅ Prasyarat
- HP dan Laptop terhubung **di jaringan WiFi yang SAMA**
- Server sudah running di laptop dengan `npm start`

---

## 🚀 Langkah Akses di HP

### 1️⃣ Cari IP Address Laptop
Buka **PowerShell** di Laptop, ketik:
```powershell
ipconfig
```
Cari baris yang bertuliskan **IPv4 Address** (biasanya 192.168.x.x atau 10.0.x.x)
**Contoh:** `192.168.1.100`

---

### 2️⃣ Akses HTTP (Recommended untuk awal)
Buka browser HP, masuk ke:
```
http://192.168.1.100:3000
```
*(Ganti `192.168.1.100` dengan IP Laptop Anda)*

**Fitur yang bekerja:**
- ✅ Pilih pegawai
- ✅ Input data
- ✅ Upload foto selfie
- ✅ Simpan data di HP

**Fitur terbatas:**
- ❌ GPS tidak bekerja (butuh HTTPS)
- ❌ Kamera terbatas (butuh HTTPS)

---

### 3️⃣ Akses HTTPS (Untuk GPS & Kamera penuh)
Buka browser HP, masuk ke:
```
https://192.168.1.100:3443
```
*(Port berbeda: 3443, bukan 3000)*

**Langkah pertama kali:**
1. Akan muncul **peringatan sertifikat** ("Koneksi tidak aman")
2. **Klik "Advanced" → "Proceed" / "Lanjutkan"**
3. Sekarang bisa gunakan GPS & Kamera penuh

**Fitur yang bekerja:**
- ✅ Pilih pegawai
- ✅ GPS bisa akurat
- ✅ Kamera & Selfie
- ✅ Semua fitur lengkap

---

## 🔧 Troubleshooting

### ❌ HP tidak bisa akses laptop
**Solusi:**
1. Pastikan HP & Laptop di **WiFi yang SAMA**
2. Firewall Laptop mungkin blocking → buka/matikan firewall Windows untuk port 3000 & 3443
3. Coba ping IP laptop dari HP

### ❌ HTTPS / Kamera tidak muncul
**Solusi:**
1. Pakai HTTPS port 3443, bukan 3000
2. Klik "Advanced" → "Proceed" saat muncul warning
3. Reload halaman (Ctrl+Shift+R)

### ❌ GPS tidak akurat / tidak deteksi
**Solusi:**
1. Pastikan sudah pakai HTTPS
2. Izinkan akses lokasi saat browser minta
3. Aktifkan GPS di HP
4. Tunggu 3-5 detik untuk akurasi

### ❌ Foto selfie tidak bisa diambil
**Solusi:**
1. Pakai HTTPS (port 3443)
2. Izinkan akses kamera saat browser minta
3. Coba reload halaman

---

## 📋 Ringkas Akses

| Kebutuhan | URL | Port | GPS | Kamera |
|-----------|-----|------|-----|--------|
| **Cepat** | http://192.168.1.100:3000 | 3000 | ❌ | ❌ |
| **Lengkap** | https://192.168.1.100:3443 | 3443 | ✅ | ✅ |

---

## 💡 Tips
- Jika sering akses, bookmark URL di HP
- Jangan lupa izinkan Lokasi & Kamera saat pertama kali
- Jika error, buka DevTools HP (F12) dan cek console

---

**Butuh bantuan?** Hubungi admin atau cek console browser (F12) untuk detail error.
