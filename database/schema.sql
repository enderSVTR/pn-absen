-- =============================================
-- DATABASE SISTEM ABSENSI PENGADILAN NEGERI DEPOK
-- =============================================

CREATE DATABASE IF NOT EXISTS absen_pn_depok;
USE absen_pn_depok;

-- =============================================
-- TABEL ADMIN
-- =============================================
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password default: ptip-pn (hash sederhana, gunakan bcrypt di produksi)
INSERT INTO admin (username, password, nama_lengkap) VALUES
('admin', 'admin123', 'Administrator PN Depok')
ON DUPLICATE KEY UPDATE username = username;

-- =============================================
-- TABEL PEGAWAI (KARYAWAN & BOS)
-- =============================================
CREATE TABLE IF NOT EXISTS pegawai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nip VARCHAR(30) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100) NOT NULL,
  golongan VARCHAR(20),
  email VARCHAR(100),
  no_hp VARCHAR(20),
  qr_code TEXT,
  foto VARCHAR(255),
  username VARCHAR(50) NULL UNIQUE,
  password VARCHAR(255) NULL,
  ruangan VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABEL ABSENSI
-- =============================================
CREATE TABLE IF NOT EXISTS absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nip VARCHAR(30),
  jabatan VARCHAR(100),
  ruangan VARCHAR(100),
  jenis ENUM('masuk', 'pulang') NOT NULL DEFAULT 'masuk',
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  alamat TEXT,
  jarak DECIMAL(10, 2),
  metode ENUM('gps', 'qr', 'manual') DEFAULT 'gps',
  selfie VARCHAR(255),
  waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk mempercepat pencarian
CREATE INDEX idx_absen_waktu ON absensi (waktu);
CREATE INDEX idx_absen_nama ON absensi (nama);

-- =============================================
-- DATA PEGAWAI
-- =============================================
INSERT INTO pegawai (nip, nama, jabatan, golongan, qr_code, username, password, ruangan) VALUES
('198501012010121001', 'Fikri', 'Hakim (Bos)', 'III/d', 'PN-DPK-001', 'ptip-pn', 'ptip-maju', 'Ruangan PTIP'),
('199002152015041002', 'Siti Rahayu, S.Kom.', 'Panitera Muda', 'III/c', 'PN-DPK-002', 'siti', 'siti123', 'Ruangan Hukum'),
('198712102012121003', 'Budi Santoso, A.Md.', 'Jurusita', 'III/b', 'PN-DPK-003', 'budi', 'budi123', 'Ruangan Pidana'),
('199503202020122004', 'Dewi Lestari, S.E.', 'Staf Administrasi', 'III/a', 'PN-DPK-004', 'dewi', 'dewi123', 'Ruangan PTIP'),
('199701012021011005', 'Andiluak', 'Staf Administrasi', 'III/a', 'PN-DPK-005', 'andiluak', 'andiluak123', 'Ruangan PTIP'),
('199802022022021006', 'Grace', 'Staf Administrasi', 'III/a', 'PN-DPK-006', 'grace', 'grace123', 'Ruangan Hukum'),
('199903032023031007', 'Hiliyda', 'Staf Administrasi', 'III/a', 'PN-DPK-007', 'hilda', 'hilda123', 'Ruangan Pidana'),
('199604042020041008', 'Puguh', 'Staf Administrasi', 'III/a', 'PN-DPK-008', 'puguh', 'puguh123')
ON DUPLICATE KEY UPDATE
  nama = VALUES(nama),
  jabatan = VALUES(jabatan),
  golongan = VALUES(golongan),
  qr_code = VALUES(qr_code),
  username = VALUES(username),
  password = VALUES(password),
  ruangan = VALUES(ruangan);
