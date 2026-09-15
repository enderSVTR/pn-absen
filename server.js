require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Ambil semua alamat IPv4 LAN yang dapat dipakai perangkat lain.
const os = require("os");
const netIfaces = os.networkInterfaces();
const lanCandidates = [];

Object.values(netIfaces).forEach((ifaces) => {
  ifaces.forEach((iface) => {
    if (
      iface.family === "IPv4" &&
      !iface.internal &&
      !iface.address.startsWith("169.254.")
    ) {
      lanCandidates.push(iface.address);
    }
  });
});

const lanIP =
  lanCandidates.find(
    (ip) =>
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip),
  ) ||
  lanCandidates[0] ||
  "localhost";

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 3600
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Akses HTTP dari HP diarahkan ke HTTPS agar GPS dan kamera tidak diblokir.
// Localhost tetap menggunakan HTTP karena browser menganggapnya secure context.
app.use((req, res, next) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isHttps = req.secure || forwardedProto === "https";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
    req.hostname,
  );

  if (!isHttps && !isLocalhost) {
    const host = (req.headers.host || `${lanIP}:${PORT}`).replace(
      new RegExp(`:${PORT}$`),
      `:${HTTPS_PORT}`,
    );
    return res.redirect(308, `https://${host}${req.originalUrl}`);
  }

  next();
});

// Buat folder uploads jika belum ada
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const absensiDataPath = path.join(__dirname, "database", "absensi-demo.json");
const pegawaiDemoPath = path.join(__dirname, "database", "pegawai-demo.json");

function readDemoAbsensi() {
  if (!fs.existsSync(absensiDataPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(absensiDataPath, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log("Gagal membaca data absensi demo:", error.message);
    return [];
  }
}

function writeDemoAbsensi(data) {
  fs.mkdirSync(path.dirname(absensiDataPath), { recursive: true });
  fs.writeFileSync(absensiDataPath, JSON.stringify(data, null, 2), "utf8");
}

function readDemoPegawai() {
  if (!fs.existsSync(pegawaiDemoPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(pegawaiDemoPath, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log("Gagal membaca data pegawai demo:", error.message);
    return [];
  }
}

// Konfigurasi multer untuk upload foto selfie
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `selfie_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya file gambar yang diizinkan!"));
  },
});

// ===== KONEKSI DATABASE MYSQL =====
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "absen_pn_depok",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Cek koneksi database (opsional - tidak crash jika MySQL tidak aktif)
db.getConnection((err) => {
  if (err) {
    console.log("⚠️ MySQL tidak terhubung. Mode demo/frontend aktif.");
    console.log("   Pastikan MySQL aktif dan jalankan database/schema.sql");
  } else {
    console.log("✅ MySQL terhubung!");
    db.releaseConnection && db.releaseConnection(err.pool ? err : undefined);
  }
});

// ===== API ROUTES =====

// Health check / status API
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    message: "API Sistem Absensi PN Depok berjalan",
    time: new Date().toISOString(),
  });
});

// Ambil daftar pegawai untuk pencarian dan pengisian otomatis form absensi.
app.get("/api/pegawai", (req, res) => {
  db.query(
    "SELECT nip, nama, jabatan, golongan, qr_code AS qr, ruangan FROM pegawai ORDER BY nama ASC",
    (err, rows) => {
      if (err) {
        return res.json({
          success: true,
          data: readDemoPegawai(),
          demo: true,
          message: "MySQL tidak tersedia, menggunakan data pegawai demo",
        });
      }
      res.json({ success: true, data: rows });
    },
  );
});

// Upload foto selfie
app.post("/api/upload-selfie", upload.single("selfie"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "File selfie tidak ditemukan" });
  }
  res.json({
    success: true,
    message: "Selfie berhasil diupload",
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

// Simpan data absensi. /api/absensi tetap dipertahankan sebagai alias lama.
app.post(["/api/absen", "/api/absensi"], upload.single("selfie"), (req, res) => {
  const {
    nama,
    nip,
    jabatan,
    ruangan,
    jenis,
    lat,
    lng,
    alamat,
    jarak,
    metode,
    qrData,
  } = req.body;

  // determine selfie path: file upload or provided URL in body
  const selfiePath = req.file
    ? `/uploads/${req.file.filename}`
    : req.body && (req.body.selfieUrl || req.body.selfie)
    ? req.body.selfieUrl || req.body.selfie
    : null;

  const result = {
    success: true,
    message: "Absensi berhasil tercatat!",
    data: {
      nama,
      nip,
      jabatan,
      ruangan,
      jenis,
      latitude: lat,
      longitude: lng,
      alamat,
      jarak: parseFloat(jarak) || 0,
      metode,
      qrData,
      selfie: selfiePath,
      waktu: new Date().toISOString(),
      diDalamRadius: req.body.diDalamRadius !== false && req.body.diDalamRadius !== "false",
      modeLokasi: req.body.modeLokasi || "kantor",
    },
  };

  const demoData = {
    id: Date.now(),
    ...result.data,
    selfie: req.file
      ? `/uploads/${req.file.filename}`
      : result.data.selfie,
  };
  const existingDemoData = readDemoAbsensi();
  writeDemoAbsensi([demoData, ...existingDemoData].slice(0, 1000));

  // Simpan ke database jika MySQL aktif
  if (db && db.query) {
    const sql = `INSERT INTO absensi (nama, nip, jabatan, ruangan, jenis, lat, lng, alamat, jarak, metode, selfie, waktu)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const selfieFilename = req.file
      ? req.file.filename
      : req.body && req.body.selfieUrl
      ? path.basename(req.body.selfieUrl)
      : null;

    const values = [
      nama,
      nip,
      jabatan,
      ruangan,
      jenis,
      lat,
      lng,
      alamat,
      parseFloat(jarak) || 0,
      metode,
      selfieFilename,
    ];
    db.query(sql, values, (err, rows) => {
      if (err) {
        console.log("DB insert error:", err.message);
      } else {
        console.log("✅ Absensi tersimpan ke database:", nama, "-", nip);
      }
    });
  }
  res.json(result);
});

// Ambil data absensi (rekap)
app.get("/api/absensi", (req, res) => {
  if (db && db.promise) {
    db.query(
      "SELECT * FROM absensi ORDER BY id DESC LIMIT 100",
      (err, rows) => {
        if (err) {
          return res.json({
            success: true,
            data: readDemoAbsensi(),
            demo: true,
            message: err.message,
          });
        }
        res.json({
          success: true,
          data: rows.length > 0 ? rows : readDemoAbsensi(),
          demo: rows.length === 0,
        });
      },
    );
  } else {
    res.json({ success: true, data: readDemoAbsensi(), demo: true });
  }
});

// Login karyawan / bos (cek dari database pegawai)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Username dan password wajib diisi" 
    });
  }

  // Admin
  if (
    username.toLowerCase() === "admin" &&
    password === (process.env.ADMIN_PASS || "admin123")
  ) {
    return res.json({
      success: true,
      role: "admin",
      data: {
        username: "admin",
        nama: "Administrator PN Depok",
        role: "admin",
      },
    });
  }

  // Cek di database pegawai jika MySQL aktif
  if (db && db.query) {
    db.query(
      "SELECT * FROM pegawai WHERE (username = ? OR nip = ?) LIMIT 1",
      [username, username],
      (err, rows) => {
        if (err || !rows || rows.length === 0) {
          return res.json({
            success: false,
            message: "Username/Password salah atau akun tidak ditemukan",
          });
        }
        const peg = rows[0];
        if (peg.password && peg.password !== password) {
          return res.json({
            success: false,
            message: "Username/Password salah atau akun tidak ditemukan",
          });
        }
        res.json({
          success: true,
          role: "pegawai",
          data: {
            username: peg.username || peg.nama,
            nama: peg.nama,
            nip: peg.nip,
            jabatan: peg.jabatan,
            ruangan: peg.ruangan,
            role: "pegawai",
          },
        });
      },
    );
  } else {
    res.json({
      success: false,
      message: "Database tidak terhubung. Gunakan mode demo di browser.",
    });
  }
});

// ===== SERVE FRONTEND =====
app.use(express.static(path.join(__dirname, "public")));

// Host info harus didefinisikan sebelum fallback "*" agar tidak dikembalikan index.html.
app.get("/api/hostinfo", (req, res) => {
  res.json({
    lanIP,
    httpsPort: HTTPS_PORT,
    httpPort: PORT,
  });
});

// Pastikan URL yang dicetak di QR selalu membuka halaman absensi.
app.get("/absen.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "absen.html"));
});

// Fallback ke halaman utama
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== START SERVER =====
// Listen di 0.0.0.0 agar bisa diakses dari perangkat lain (HP) di jaringan yang sama
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Server Sistem Absensi PN Depok berjalan!`);
  console.log("   🌐 Di perangkat ini : http://localhost:" + PORT);
  console.log("   📡 Di HP/Jaringan   : http://" + lanIP + ":" + PORT);
  console.log(
    "   🔒 HTTPS (GPS/kamera): https://" + lanIP + ":" + HTTPS_PORT,
  );
  console.log("\n📱 AKSES DI HP:");
  console.log("   1. Jika cukup: http://" + lanIP + ":" + PORT);
  console.log("   2. Untuk GPS & Kamera: https://" + lanIP + ":" + HTTPS_PORT + " (klik Advanced → Proceed)");
  console.log("   Pastikan HP & Laptop di WiFi yang SAMA!");
});

// ===== HTTPS OTOMATIS (untuk GPS & kamera di HP) =====
// Browser hanya mengizinkan GPS & kamera pada koneksi HTTPS. Sertifikat
// self-signed dibuat otomatis (tanpa perlu install openssl). Buka
// https://IP_LAN:3443 di HP lalu klik "Advanced" > "Proceed/Lanjutkan".
const https = require("https");
try {
  const certsDir = path.join(__dirname, "certs");
  const certPath = path.join(certsDir, "cert.pem");
  const keyPath = path.join(certsDir, "key.pem");

  let cert, key;
  const requiredNames = ["pn-depok.local", "localhost", ...lanCandidates];
  let certificateNeedsRefresh = true;

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
      const forge = require("node-forge");
      const existingCert = forge.pki.certificateFromPem(
        fs.readFileSync(certPath, "utf8"),
      );
      const existingNames =
        existingCert.extensions
          .find((extension) => extension.name === "subjectAltName")
          ?.altNames.map((name) => (name.type === 7 ? name.ip : name.value)) ||
        [];
      certificateNeedsRefresh = requiredNames.some(
        (name) => !existingNames.includes(name),
      );
    } catch (error) {
      console.log("⚠️ Sertifikat HTTPS lama tidak dapat dibaca, membuat ulang.");
    }
  }

  if (!certificateNeedsRefresh) {
    cert = fs.readFileSync(certPath);
    key = fs.readFileSync(keyPath);
  } else {
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
    // Generate self-signed cert dengan node-forge (kompatibel Node 22)
    const forge = require("node-forge");
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const certObj = forge.pki.createCertificate();
    certObj.publicKey = keys.publicKey;
    certObj.serialNumber = "01";
    certObj.validity.notBefore = new Date();
    certObj.validity.notAfter = new Date();
    certObj.validity.notAfter.setFullYear(
      certObj.validity.notBefore.getFullYear() + 1,
    );
    const attrs = [{ name: "commonName", value: "pn-depok.local" }];
    certObj.setSubject(attrs);
    certObj.setIssuer(attrs);
    certObj.setExtensions([
      {
        name: "basicConstraints",
        cA: true,
      },
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        keyEncipherment: true,
      },
      {
        name: "extKeyUsage",
        serverAuth: true,
      },
      {
        name: "subjectAltName",
        altNames: [
          { type: 2, value: "pn-depok.local" },
          { type: 2, value: "localhost" },
          { type: 7, ip: "127.0.0.1" },
          ...lanCandidates.map((ip) => ({ type: 7, ip })),
        ],
      },
    ]);
    certObj.sign(keys.privateKey, forge.md.sha256.create());
    cert = forge.pki.certificateToPem(certObj);
    key = forge.pki.privateKeyToPem(keys.privateKey);
    fs.writeFileSync(certPath, cert);
    fs.writeFileSync(keyPath, key);
  }

  https.createServer({ cert, key }, app).listen(HTTPS_PORT, "0.0.0.0", () => {
    console.log("\n🔒 HTTPS aktif (GPS & kamera bisa dipakai di HP):");
    console.log("   🌐 Di perangkat ini : https://localhost:" + HTTPS_PORT);
    console.log("   📡 Di jaringan (LAN): https://" + lanIP + ":" + HTTPS_PORT);
    console.log(
      "   ⚠️  Sertifikat lokal self-signed. Untuk pertama kali, klik 'Advanced' lalu 'Proceed/Lanjutkan'.",
    );
  });
} catch (e) {
  console.log("⚠️ Gagal menyiapkan HTTPS:", e.message);
}
