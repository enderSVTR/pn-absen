# 🚀 SETUP LENGKAP UNTUK AKSES DI HP

## ✅ Yang Sudah Saya Lakukan

1. ✅ Menambahkan pegawai "Duvall, S.teh." ke database
2. ✅ Menambahkan pegawai ke data demo di browser
3. ✅ Memperbaiki CORS untuk akses dari HP
4. ✅ Memperbaiki server agar menampilkan IP untuk akses HP
5. ✅ Update `.env` dengan konfigurasi HTTPS

---

## 🔧 Cara Jalankan Server

### Di Laptop (Windows PowerShell)

```powershell
# Masuk ke folder project
cd C:\Users\Lenovo\Downloads\web-absen-PN

# Jalankan server
npm start
```

**Output yang muncul:**
```
✅ MySQL terhubung!
🚀 Server Sistem Absensi PN Depok berjalan!
   🌐 Di perangkat ini : http://localhost:3000
   📡 Di HP/Jaringan   : http://192.168.x.x:3000
   🔒 HTTPS (GPS/kamera): https://192.168.x.x:3443

📱 AKSES DI HP:
   1. Jika cukup: http://192.168.x.x:3000
   2. Untuk GPS & Kamera: https://192.168.x.x:3443 (klik Advanced → Proceed)
   Pastikan HP & Laptop di WiFi yang SAMA!
```

**CATAT IP YANG MUNCUL** (mis: 192.168.1.100)

---

## 📱 Akses dari HP

### **Option 1: HTTP Sederhana** (Tanpa GPS/Kamera)
```
http://192.168.1.100:3000
```

### **Option 2: HTTPS Lengkap** (Dengan GPS & Kamera)
```
https://192.168.1.100:3443
```

**Langkah pertama kali:**
1. Buka URL di browser HP
2. Akan muncul ⚠️ **"Koneksi tidak aman"**
3. Klik **"Advanced"** → **"Proceed"** / **"Lanjutkan"**
4. Sekarang sudah bisa akses!

---

## 🧪 Test di HP

### Login Test
- **Username:** `duvall`
- **Password:** `duvall123`

### Data Absensi
Setelah login, pegawai sudah tampil di dropdown:
- ✅ Duvall, S.teh.
- ✅ Siti Rahayu, S.Kom.
- ✅ Budi Santoso, A.Md.
- ✅ Dewi Lestari, S.E.

---

## ⚠️ Troubleshooting

### Masalah: HP tidak bisa akses
**Solusi:**
1. Pastikan HP & Laptop di **WiFi yang SAMA**
2. Coba restart server
3. Matikan Firewall Windows (atau allow port 3000 & 3443)

### Masalah: HTTPS warning tidak hilang
**Solusi:**
1. Itu normal (sertifikat self-signed)
2. Klik Advanced → Proceed
3. Refresh halaman

### Masalah: GPS tidak bekerja
**Solusi:**
1. Pastikan pakai HTTPS (port 3443)
2. Izinkan lokasi saat browser minta
3. Aktifkan GPS di HP

### Masalah: Kamera tidak muncul
**Solusi:**
1. Pakai HTTPS (port 3443)
2. Izinkan kamera saat browser minta
3. Reload halaman (Ctrl+Shift+R)

---

## 📊 Database

### Setup MySQL (Opsional)
Jika ingin data tersimpan di database:

1. Buka **MySQL Command Line** atau **phpMyAdmin**
2. Jalankan file: `database/schema.sql`
3. Database akan otomatis terisi dengan data pegawai

---

## 💡 Tips

- 📌 Bookmark URL di HP agar mudah diakses
- 🔄 Jika ada perubahan data pegawai, update file `database/schema.sql` dan jalankan ulang
- 📱 Bisa akses dari banyak HP sekaligus (selama WiFi sama)
- 🖥️ Untuk akses publik, gunakan ngrok atau cloudflare tunnel

---

## 📞 Bantuan

Jika masih ada masalah:
1. Buka DevTools di HP: **F12**
2. Lihat tab **Console** untuk error details
3. Lihat tab **Network** untuk request/response

---

**🎉 Selesai! Web siap diakses di HP!**
