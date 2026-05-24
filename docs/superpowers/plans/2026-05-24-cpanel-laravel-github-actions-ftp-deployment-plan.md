# Laravel cPanel FTP Auto Deploy Revision Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merevisi pipeline deploy cPanel dari SSH ke FTP biasa dengan trigger tag `v*`, build di GitHub Actions, dan mirror upload ke `public_html`.

**Architecture:** Workflow tetap build di GitHub Actions, namun tahap transfer file diganti ke FTP deploy action dengan sinkronisasi mirror. Komponen SSH-specific (secrets, upload script, remote exec) dihapus dari workflow. Operasi artisan/migrate dipindah jadi prosedur manual pasca deploy di cPanel.

**Tech Stack:** GitHub Actions, Laravel 12, Node/Vite, Composer, FTP deployment action.

---

## File Structure (planned changes)

- Modify: `.github/workflows/deploy-cpanel.yml`
  - Mengganti step SSH/rsync ke FTP mirror deploy.
- Modify: `README.md`
  - Mengganti dokumentasi deploy dari SSH ke FTP + secrets baru + rollback via redeploy tag.
- Keep (optional): `.github/scripts/cpanel-deploy.sh`, `.github/scripts/cpanel-rollback.sh`
  - Tidak dipakai di mode FTP, diputuskan apakah dipertahankan sebagai legacy atau dihapus.
- Create: `docs/superpowers/specs/2026-05-24-cpanel-laravel-github-actions-ftp-deployment-design.md`
  - Dokumen desain revisi FTP.

## Task 1: Ubah workflow dari SSH ke FTP mirror deploy

**Files:**
- Modify: `.github/workflows/deploy-cpanel.yml`
- Test: `.github/workflows/deploy-cpanel.yml`

- [ ] **Step 1: Pertahankan trigger dan build steps yang sudah benar**

Pastikan bagian ini tetap ada:

```yaml
on:
  push:
    tags:
      - 'v*'
```

```yaml
- name: Setup PHP
  uses: shivammathur/setup-php@v2
  with:
    php-version: '8.4'
    tools: composer:v2

- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '22'

- name: Install PHP Dependencies
  run: composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

- name: Install Node Dependencies
  run: npm ci

- name: Build Assets
  run: npm run build
```

- [ ] **Step 2: Hapus step SSH/remote yang tidak relevan**

Hapus semua step ini:
- Setup SSH key
- Create remote release directory
- Rsync release to cPanel
- Upload deploy script
- Run remote deploy script

- [ ] **Step 3: Tambahkan FTP deploy step**

Tambahkan step deploy FTP dengan mirror mode:

```yaml
- name: Deploy via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_HOST }}
    username: ${{ secrets.FTP_USER }}
    password: ${{ secrets.FTP_PASS }}
    port: ${{ secrets.FTP_PORT }}
    protocol: ftp
    local-dir: release/
    server-dir: ${{ secrets.FTP_TARGET_DIR }}/
    dangerous-clean-slate: false
    exclude: |
      **/.git*
      **/.github/**
      **/node_modules/**
      **/tests/**
      **/.env
```

- [ ] **Step 4: Pertahankan packaging release yang aman**

```yaml
- name: Package Release
  run: |
    mkdir -p release
    rsync -av --delete \
      --exclude='.git' \
      --exclude='node_modules' \
      --exclude='tests' \
      --exclude='.github' \
      --exclude='release' \
      ./ release/
```

- [ ] **Step 5: Jalankan validasi workflow**

Run: `python -m yamllint .github/workflows/deploy-cpanel.yml`
Expected: PASS (atau laporkan jika `yamllint` tidak tersedia)

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy-cpanel.yml
git commit -m "ci: switch cpanel deployment from ssh to ftp"
```

## Task 2: Revisi dokumentasi README untuk mode FTP

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Ubah daftar secrets deployment**

Ganti dari secrets SSH menjadi:

```md
### Secrets yang wajib
- FTP_HOST
- FTP_PORT
- FTP_USER
- FTP_PASS
- FTP_TARGET_DIR
```

- [ ] **Step 2: Ubah deskripsi alur deploy**

Tambahkan bahwa deploy sekarang via FTP mirror ke `public_html` (atau `FTP_TARGET_DIR`) dan tidak mengeksekusi artisan command otomatis.

- [ ] **Step 3: Ubah rollback section**

Ganti rollback script SSH menjadi rollback berbasis redeploy tag sebelumnya:

```md
### Rollback cepat
Lakukan redeploy tag stabil sebelumnya, contoh:

```bash
git tag -f v1.0.0
git push origin v1.0.0 --force
```
```

- [ ] **Step 4: Tambahkan catatan migrate manual**

```md
Jika ada perubahan database schema, jalankan manual di cPanel Terminal:

```bash
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
```
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update cpanel deployment guide to ftp workflow"
```

## Task 3: Putuskan status script SSH legacy

**Files:**
- Modify/Delete: `.github/scripts/cpanel-deploy.sh`
- Modify/Delete: `.github/scripts/cpanel-rollback.sh`

- [ ] **Step 1: Pilih salah satu kebijakan**

Pilihan A (recommended): hapus script SSH karena tidak dipakai lagi.

```bash
git rm .github/scripts/cpanel-deploy.sh .github/scripts/cpanel-rollback.sh
```

Pilihan B: pertahankan script sebagai fallback, tapi tandai legacy di README.

- [ ] **Step 2: Jika dipertahankan, tambahkan penanda legacy**

Tambahkan catatan di README bahwa script tersebut tidak digunakan workflow aktif.

- [ ] **Step 3: Commit**

Jika hapus:

```bash
git add -A
git commit -m "chore: remove legacy ssh deployment scripts"
```

Jika keep:

```bash
git add .github/scripts/cpanel-deploy.sh .github/scripts/cpanel-rollback.sh README.md
git commit -m "chore: mark ssh deployment scripts as legacy"
```

## Task 4: Verifikasi akhir

**Files:**
- Test only

- [ ] **Step 1: Validasi script npm/composer yang relevan**

Run: `npm run lint:check && npm run types:check`
Expected: PASS atau laporkan blocker existing repo

- [ ] **Step 2: Validasi test backend**

Run: `php artisan test`
Expected: PASS

- [ ] **Step 3: Validasi status git bersih setelah commit**

Run: `git status --short`
Expected: no output

## Self-Review Checklist (completed)

- Spec coverage: workflow FTP, secrets baru, rollback baru, dan migrate manual sudah tercakup.
- Placeholder scan: tidak ada TODO/TBD.
- Consistency check: nama secrets FTP konsisten di workflow + README.
