# ⚖️ Sistem Absensi Online Pengadilan Negeri Depok

Website **Responsive** untuk absensi online di Pengadilan Negeri Depok Kelas IA.
Bisa dibuka di **Laptop** maupun **HP (Smartphone)**.

## ✨ Fitur Utama

- ✅ **GPS Tracking** - Deteksi lokasi real-time, validasi radius jarak dari kantor
- ✅ **Foto Selfie** - Verifikasi wajah via kamera langsung
- ✅ **QR Code** - Generate & download QR Code identitas pegawai
- ✅ **Responsive** - Mobile-first design (Bootstrap 5)
- ✅ **Dashboard** - Rekap data absensi, statistik, export CSV

## 🛠️ Teknologi

- **Frontend**: HTML, CSS, JavaScript + Bootstrap 5 + Leaflet (map)
- **Backend**: Node.js + Express
- **Database**: MySQL (mysql2)

## 📁 Struktur Proyek

```
web-absen-PN/
├── server.js              # Backend Express
├── package.json           # Dependencies
├── .env                   # Konfigurasi DB
├── database/
│   └── schema.sql         # Struktur database MySQL
├── public/                # Frontend
│   ├── index.html         # Landing page
│   ├── login.html         # Halaman login
│   ├── absen.html         # Form absensi (GPS + Selfie + QR)
│   ├── dashboard.html     # Dashboard admin
│   ├── css/style.css
│   └── js/
│       ├── main.js
│       ├── absen.js
│       └── dashboard.js
└── uploads/               # Folder foto selfie
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. (Opsional) Siapkan Database MySQL

Import file `database/schema.sql` ke MySQL Anda, lalu sesuaikan `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=absen_pn_depok
```

> Jika MySQL tidak aktif, website tetap berjalan penuh dalam **mode demo** (data tersimpan di browser localStorage).

### 3. Jalankan Server

```bash
npm start
```

Setelah server berjalan, akan muncul alamat LAN dan HTTPS (misal
`https://192.168.100.5:3443`) di terminal.

### 4. Buka di Browser (Laptop)

```
http://localhost:3000
```

### 5. Akses dari HP (Smartphone) 📱 — SUPAYA GPS & KAMERA JALAN

> ⚠️ **PENTING:** Browser **memblokir GPS & kamera** pada koneksi `http://IP:3000`
> biasa (kecuali `localhost`). Server otomatis mengarahkan akses HTTP dari LAN
> ke HTTPS, tetapi URL yang disarankan tetap `https://IP-LAN:3443`.

**Cara 1 (PALING DISARANKAN) — HTTPS via localtunnel:**

1. Jalankan server:
   ```bash
   npm start
   ```
2. Di terminal/CMD lain, jalankan tunnel:
   ```bash
   npm run tunnel
   ```
   Akan muncul URL publik, misal:
   ```
   your url is: https://absen-pn-depok.loca.lt
   ```
3. Buka URL `https://...loca.lt` itu di **HP** (dari jaringan apa pun, tidak harus sama dengan laptop).
4. Saat pertama dibuka, browser mungkin menampilkan halaman verifikasi localtunnel
   ("Verify You Are Human") — klik tombol **"Click to Continue"** lalu masukkan
   password **`localtunnel`** bila diminta, atau buka tautan `https://...loca.lt` langsung.
5. Izinkan akses **lokasi** dan **kamera** saat diminta → GPS akurat & selfie jalan.

**Cara 2 — di jaringan WiFi yang sama (HTTPS lokal):**

1. Pastikan HP & laptop di WiFi/jaringan yang **sama**.
2. Buka `https://192.168.x.x:3443` di HP (IP dan port yang muncul di terminal server).
3. Jika muncul peringatan sertifikat lokal, pilih **Advanced** lalu
   **Proceed/Lanjutkan**. Setelah itu izinkan akses lokasi dan kamera.
4. Jika terlanjur membuka `http://192.168.x.x:3000`, server akan mengarahkan
   otomatis ke URL HTTPS.

## 🔐 Akun Login

### Admin

- **Username**: `admin`
- **Password**: `admin123`

### Karyawan / Bos

| Nama                             | Username  | Password    | Ruangan        |
| -------------------------------- | --------- | ----------- | -------------- |
| Bangbang (Hakim/Bos)             | `ptip-pn` | `ptip-maju` | Ruangan PTIP   |
| Siti Rahayu (Panitera Muda)      | `siti`    | `siti123`   | Ruangan Hukum  |
| Budi Santoso (Jurusita)          | `budi`    | `budi123`   | Ruangan Pidana |
| Dewi Lestari (Staf Administrasi) | `dewi`    | `dewi123`   | Ruangan PTIP   |

## 📌 Catatan

- Untuk fitur GPS & kamera, gunakan **HTTPS** atau `localhost` (browser memblokir akses pada HTTP non-localhost).
- Di HP, izinkan akses **lokasi** dan **kamera** saat diminta browser.
- Pastikan Anda berada dalam radius ±1 km dari kantor PN Depok (Jl. Boulevard Grand Depok City No.7) untuk absensi valid.

---

© <span id="year"></span> Pengadilan Negeri Depok Kelas IA
