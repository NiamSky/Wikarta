# Design Spec: Auto Deployment Laravel ke cPanel via GitHub Actions (SSH)

## 1) Latar Belakang & Tujuan
Project `Wikarta` (Laravel 12 + frontend build) membutuhkan deployment otomatis ke shared hosting cPanel via SSH terminal, dipicu oleh Git tag release.

Tujuan utama:
- Deploy konsisten tanpa upload manual
- Minim downtime saat rilis
- Rollback cepat jika release gagal
- Aman untuk environment shared hosting (tanpa root)

## 2) Scope
### In Scope
- Workflow GitHub Actions trigger tag `v*`
- Build aplikasi di runner GitHub Actions
- Upload artifact release ke server cPanel via `rsync` + SSH key
- Atomic switch release dengan symlink `current`
- Migrasi database dan cache command Laravel saat deploy
- Shared path untuk `.env` dan `storage`
- Retensi release lama + rollback manual cepat

### Out of Scope
- Provisioning server/instalasi OS
- Blue/green multi-server
- Zero-downtime migration kompleks lintas versi schema

## 3) Pendekatan Terpilih
Pendekatan A (terpilih): **Rsync artifact + release symlink**

Alasan:
- Cocok untuk shared cPanel (akses terbatas)
- Lebih aman daripada overwrite langsung folder live
- Rollback sederhana dengan mengganti symlink

## 4) Arsitektur Deployment
Struktur direktori target (contoh):
- `~/apps/wikarta/releases/<tag>/` -> tiap rilis immutable
- `~/apps/wikarta/shared/.env` -> env persistent
- `~/apps/wikarta/shared/storage/` -> file runtime persistent
- `~/apps/wikarta/current` -> symlink release aktif

Document root cPanel diarahkan ke:
- `~/apps/wikarta/current/public`

## 5) Secrets & Konfigurasi GitHub
Repository secrets yang dibutuhkan:
- `CPANEL_HOST`
- `CPANEL_PORT` (default 22 jika standar)
- `CPANEL_USER`
- `CPANEL_SSH_KEY` (private key)
- `CPANEL_DEPLOY_PATH` (contoh: `/home/<user>/apps/wikarta`)

Opsional:
- `APP_HEALTHCHECK_URL`

## 6) Trigger & Alur Workflow
Trigger:
- `on.push.tags: ["v*"]`

Alur job (single deploy job):
1. Checkout repository pada tag
2. Setup PHP + Composer + Node
3. Install dependency production (composer, npm)
4. Build frontend assets (`npm run build`)
5. Siapkan paket release (exclude `.git`, `node_modules`, `tests`, cache lokal yang tidak perlu)
6. Buat folder release baru: `releases/<tag>`
7. `rsync` paket ke folder release tersebut
8. Link resource shared ke release baru:
   - `.env` dari `shared/.env`
   - `storage` dari `shared/storage`
9. Jalankan command Laravel pada release baru:
   - `php artisan migrate --force`
   - `php artisan optimize:clear`
   - `php artisan config:cache`
10. Atomic switch symlink:
   - `ln -sfn <release_baru> current`
11. Post-deploy smoke check:
   - `php artisan about`
   - HTTP check ke endpoint health (jika tersedia)
12. Cleanup release lama, sisakan 5 release terbaru

## 7) Error Handling & Rollback
Prinsip:
- Jika langkah sebelum symlink switch gagal -> release aktif tetap release lama
- Jika gagal setelah switch -> rollback manual cepat ke release sebelumnya

Rollback:
- Tentukan release sebelumnya
- Jalankan `ln -sfn ~/apps/wikarta/releases/<prev_tag> ~/apps/wikarta/current`

Catatan:
- Migrasi database harus backward-compatible sebisa mungkin
- Jika migrasi non-reversible, rollback code tidak selalu rollback data

## 8) Testing & Validasi
Sebelum production:
- Uji workflow di tag percobaan: `v0.0.0-rc1`
- Verifikasi symlink aktif, env terbaca, storage writable
- Verifikasi asset publik termuat
- Verifikasi command artisan sukses

Validasi berkelanjutan:
- Pantau log Actions
- Simpan ringkasan release (tag, waktu, hasil smoke check)

## 9) Risiko & Mitigasi
- **Risk**: Kunci SSH salah format -> **Mitigasi**: validasi PEM key dan known_hosts
- **Risk**: Permission storage/cache -> **Mitigasi**: set permission owner user cPanel
- **Risk**: Build mismatch node/php -> **Mitigasi**: lock versi di workflow
- **Risk**: Koneksi SSH putus -> **Mitigasi**: workflow fail-fast + idempotent rerun

## 10) Definition of Done
- Deploy otomatis berjalan saat push tag `v*`
- Release baru tersedia di `releases/<tag>`
- Symlink `current` berpindah hanya saat deploy sukses
- `.env` & `storage` persistent antar release
- Rollback ke release sebelumnya terdokumentasi dan teruji
