# 📱 CARA FOTO SELFIE DI HP

## ⚠️ PENTING: HARUS PAKAI HTTPS

Kamera pada browser HP hanya bekerja dengan **HTTPS**, bukan HTTP!

---

## ✅ Langkah-Langkah

### 1. Akses URL HTTPS di HP
```
https://IP-LAN:3443
```
Ganti `IP-LAN` dengan alamat `192.168.x.x`, `10.x.x.x`, atau alamat LAN lain
yang muncul di terminal saat server dijalankan.

**BUKAN:** `http://IP-LAN:3000` ❌

---

### 2. Saat Warning Muncul
Akan muncul peringatan: **"Koneksi tidak aman"**

**Klik:**
- Android: **Advanced** → **Proceed**
- iPhone: Tap **Show Details** → **Visit Website**

---

### 3. Izinkan Akses Kamera
Browser akan minta izin:
- **Android:** Klik **Allow** / **Izinkan**
- **iPhone:** Klik **Allow** / **Izinkan**

---

### 4. Buka Kamera
1. Pilih pegawai dari dropdown
2. Klik tombol **"Buka Kamera"** (🎥)
3. Video live akan tampil di HP
4. Klik **"Ambil Foto"** (📷) untuk ambil selfie

---

## ❌ Troubleshooting

### Problem: "Kamera memerlukan HTTPS"
**Solusi:**
- ✅ Pastikan URL dimulai dengan `https://` (bukan `http://`)
- ✅ Port harus `3443` (bukan `3000`)
- ✅ URL yang benar: `https://IP-LAN:3443`
- ✅ Jika membuka `http://IP-LAN:3000`, server akan mengarahkan otomatis ke HTTPS

### Problem: Kamera tidak muncul
**Solusi:**
1. Refresh halaman: `Ctrl+Shift+R` atau geser ke bawah tekan refresh
2. Buka ulang browser
3. Restart HP

### Problem: Browser bilang "Izin akses kamera ditolak"
**Solusi:**
1. Buka **Settings** (Pengaturan) HP
2. Cari **Apps** → **Permissions** / **Aplikasi** → **Izin**
3. Cari browser Anda (Chrome, Firefox, Samsung Internet, dll)
4. Berikan izin **Camera** / **Kamera**
5. Kembali ke web dan coba lagi

### Problem: Kamera tapi layarnya hitam
**Solusi:**
1. Pastikan HP tidak dalam mode gelap ekstrem (cek pencahayaan)
2. Tutup aplikasi lain yang menggunakan kamera
3. Coba aplikasi kamera bawaan HP → restart → coba lagi

### Problem: Video delay atau freeze
**Solusi:**
1. Kurangi beban internet (jangan download saat ini)
2. Dekatkan HP ke router WiFi
3. Tutup aplikasi lain

---

## 💡 Tips

- 📍 **Lokasi:** Ambil foto di tempat yang cukup cahaya
- 🎯 **Arah:** Hadapkan kamera depan HP ke wajah (selfie mode)
- ⚡ **Koneksi:** WiFi stabil diperlukan untuk video
- 🔒 **Keamanan:** Sertifikat self-signed itu aman (hanya localhost)

---

## ✨ Fitur Lengkap Setelah Foto
Setelah ambil foto selfie:
- ✅ GPS akan otomatis terakses
- ✅ Semua data pegawai siap dikirim
- ✅ Data tersimpan langsung ke server/database

---

**Jika masih bermasalah:**
1. Buka DevTools: **F12** di HP
2. Lihat tab **Console** untuk error detail
3. Screenshot error dan kirim

🎉 **Sekarang siap ambil foto langsung tanpa bisa boong!**
