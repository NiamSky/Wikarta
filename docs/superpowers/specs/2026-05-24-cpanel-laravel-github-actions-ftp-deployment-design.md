# Design Spec: Auto Deployment Laravel ke cPanel via GitHub Actions (FTP)

## 1) Latar Belakang & Tujuan
Project `Wikarta` perlu revisi deployment dari SSH ke FTP biasa karena hosting cPanel lebih cocok/tersedia di mode FTP.

Tujuan:
- Deploy otomatis saat release tag
- Alur sederhana dan kompatibel dengan shared cPanel
- Sinkronisasi file terkontrol ke `public_html`

## 2) Scope
### In Scope
- Trigger GitHub Actions pada tag `v*`
- Build aplikasi di GitHub Actions
- Upload hasil build via FTP ke `public_html`
- Mirror upload (sinkronisasi + delete file remote yang obsolete)
- Exclude file sensitif/non-deploy
- Dokumentasi secrets FTP dan prosedur rollback

### Out of Scope
- Eksekusi command server otomatis via workflow (migrate/artisan)
- Atomic release symlink/zero-downtime switch
- SSH-based rollback script

## 3) Pendekatan Terpilih
Pendekatan A: **Build di Actions + FTP mirror ke `public_html`**.

Alasan:
- Paling kompatibel dengan FTP biasa
- Operasional ringan tanpa akses SSH wajib
- Tetap menjaga otomasi deployment berbasis release tag

## 4) Arsitektur Deployment
Arsitektur target:
1. GitHub Actions melakukan build app (PHP deps + frontend assets)
2. Workflow menyiapkan folder `release/` yang siap deploy
3. FTP action melakukan mirror upload ke `public_html`
4. Migrasi/artisan command dijalankan manual via cPanel Terminal jika diperlukan

## 5) Secrets GitHub
Secrets yang dibutuhkan:
- `FTP_HOST`
- `FTP_PORT`
- `FTP_USER`
- `FTP_PASS`
- `FTP_TARGET_DIR` (default: `public_html`)

## 6) Trigger & Alur Workflow
Trigger:
- `on.push.tags: ["v*"]`

Langkah:
1. Checkout source pada tag
2. Setup PHP dan Node
3. Install dependency production (`composer install --no-dev`)
4. Install node dependency (`npm ci`) dan build assets (`npm run build`)
5. Buat paket deploy `release/` dengan exclude:
   - `.git`, `.github`, `node_modules`, `tests`, file lokal/dev
6. Upload `release/` ke `FTP_TARGET_DIR` via mode mirror
7. Simpan log deployment pada Actions run

## 7) Error Handling & Rollback
- Jika upload FTP gagal, workflow fail dan aplikasi tetap di state file terakhir yang berhasil tersalin.
- Rollback dilakukan dengan redeploy tag sebelumnya (re-run workflow pada tag stabil).
- Karena FTP biasa tidak atomic, ada potensi window inconsistency saat upload; mitigasi dengan release window off-peak dan ukuran deploy minimum.

## 8) Keamanan & Operasional
- Hindari upload `.env` dari pipeline
- Gunakan kredensial FTP via GitHub Secrets
- Gunakan whitelist file/folder deploy
- Untuk environment sensitif, disarankan upgrade ke FTPS jika tersedia

## 9) Testing & Validasi
Sebelum production:
- Test deploy ke tag uji `v0.0.0-rc1`
- Verifikasi file publik ter-update
- Verifikasi aplikasi dapat diakses normal
- Jalankan migrate manual jika ada perubahan schema

## 10) Definition of Done
- Workflow deploy FTP berjalan pada tag `v*`
- Build sukses dan file tersinkron ke `public_html`
- File sensitif/non-deploy tidak ikut terupload
- README mencakup setup FTP secrets dan rollback procedure
