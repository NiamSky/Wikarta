# Laravel cPanel SSH Auto Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan pipeline deploy otomatis Laravel ke shared cPanel via SSH yang berjalan saat push tag `v*` dengan mekanisme release symlink + rollback cepat.

**Architecture:** Build dilakukan di GitHub Actions (bukan di server), artifact dikirim via rsync ke folder `releases/<tag>`, lalu deploy script di server menautkan shared resources, menjalankan migrate/cache commands, dan melakukan atomic symlink switch ke `current`. Struktur release bersifat immutable dengan retensi release lama agar rollback cepat.

**Tech Stack:** Laravel 12, GitHub Actions, OpenSSH/rsync, Bash (remote script), Node/Vite build, Composer.

---

## File Structure (planned changes)

- Create: `.github/workflows/deploy-cpanel.yml`
  - Tanggung jawab: workflow deploy berbasis tag `v*`, build artifact, transfer ke server, eksekusi remote deploy script.
- Create: `.github/scripts/cpanel-deploy.sh`
  - Tanggung jawab: logic deploy di server (setup release dir, link shared, migrate, switch symlink, cleanup).
- Create: `.github/scripts/cpanel-rollback.sh`
  - Tanggung jawab: rollback cepat ke release sebelumnya.
- Modify: `README.md`
  - Tanggung jawab: dokumentasi setup secrets GitHub, struktur folder server, cara deploy dan rollback.

## Task 1: Tambahkan workflow deploy berbasis tag

**Files:**
- Create: `.github/workflows/deploy-cpanel.yml`
- Test: `.github/workflows/deploy-cpanel.yml` (YAML lint via `yamllint` atau validasi Actions parser pada PR)

- [ ] **Step 1: Tulis workflow skeleton (failing config check awal)**

```yaml
name: deploy-cpanel

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
```

- [ ] **Step 2: Jalankan validasi YAML awal**

Run: `python -m yamllint .github/workflows/deploy-cpanel.yml`
Expected: PASS (tidak ada syntax error YAML)

- [ ] **Step 3: Lengkapi setup build environment**

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

      - name: Install PHP dependencies
        run: composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

      - name: Install Node dependencies
        run: npm ci

      - name: Build assets
        run: npm run build
```

- [ ] **Step 4: Tambahkan packaging + artifact upload internal runner**

```yaml
      - name: Package release
        run: |
          mkdir -p release
          rsync -av --delete \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='tests' \
            --exclude='.github' \
            ./ release/

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: release
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy-cpanel.yml
git commit -m "ci: add cpanel deploy workflow trigger on v tags"
```

## Task 2: Tambahkan script deploy remote (symlink release strategy)

**Files:**
- Create: `.github/scripts/cpanel-deploy.sh`
- Test: `.github/scripts/cpanel-deploy.sh`

- [ ] **Step 1: Tulis script dengan mode strict dan input kontrak**

```bash
#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${1:?deploy path required}"
RELEASE_TAG="${2:?release tag required}"

RELEASES_DIR="$DEPLOY_PATH/releases"
SHARED_DIR="$DEPLOY_PATH/shared"
CURRENT_LINK="$DEPLOY_PATH/current"
NEW_RELEASE_DIR="$RELEASES_DIR/$RELEASE_TAG"
```

- [ ] **Step 2: Tambahkan setup folder dasar dan validasi shared env**

```bash
mkdir -p "$RELEASES_DIR" "$SHARED_DIR" "$SHARED_DIR/storage"

if [[ ! -f "$SHARED_DIR/.env" ]]; then
  echo "Missing shared .env at $SHARED_DIR/.env"
  exit 1
fi
```

- [ ] **Step 3: Tambahkan link shared resources ke release baru**

```bash
ln -sfn "$SHARED_DIR/.env" "$NEW_RELEASE_DIR/.env"
rm -rf "$NEW_RELEASE_DIR/storage"
ln -sfn "$SHARED_DIR/storage" "$NEW_RELEASE_DIR/storage"
```

- [ ] **Step 4: Tambahkan artisan commands + atomic switch + cleanup**

```bash
php "$NEW_RELEASE_DIR/artisan" migrate --force
php "$NEW_RELEASE_DIR/artisan" optimize:clear
php "$NEW_RELEASE_DIR/artisan" config:cache
php "$NEW_RELEASE_DIR/artisan" about > /dev/null

ln -sfn "$NEW_RELEASE_DIR" "$CURRENT_LINK"

ls -1dt "$RELEASES_DIR"/* | tail -n +6 | xargs -r rm -rf
```

- [ ] **Step 5: Uji script dengan shellcheck**

Run: `shellcheck .github/scripts/cpanel-deploy.sh`
Expected: PASS (no error severity)

- [ ] **Step 6: Commit**

```bash
git add .github/scripts/cpanel-deploy.sh
git commit -m "ci: add remote deploy script for cpanel releases"
```

## Task 3: Tambahkan script rollback remote

**Files:**
- Create: `.github/scripts/cpanel-rollback.sh`
- Test: `.github/scripts/cpanel-rollback.sh`

- [ ] **Step 1: Tulis script rollback dengan kontrak input**

```bash
#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${1:?deploy path required}"
TARGET_TAG="${2:?target release tag required}"

TARGET_DIR="$DEPLOY_PATH/releases/$TARGET_TAG"
CURRENT_LINK="$DEPLOY_PATH/current"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Release not found: $TARGET_DIR"
  exit 1
fi

ln -sfn "$TARGET_DIR" "$CURRENT_LINK"
echo "Rolled back to $TARGET_TAG"
```

- [ ] **Step 2: Uji script dengan shellcheck**

Run: `shellcheck .github/scripts/cpanel-rollback.sh`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add .github/scripts/cpanel-rollback.sh
git commit -m "ci: add cpanel rollback helper script"
```

## Task 4: Integrasi workflow dengan SSH, rsync, dan remote execution

**Files:**
- Modify: `.github/workflows/deploy-cpanel.yml`
- Modify: `.github/scripts/cpanel-deploy.sh`
- Test: `.github/workflows/deploy-cpanel.yml`

- [ ] **Step 1: Tambahkan step setup SSH key + known_hosts**

```yaml
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.CPANEL_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -p "${{ secrets.CPANEL_PORT }}" "${{ secrets.CPANEL_HOST }}" >> ~/.ssh/known_hosts
```

- [ ] **Step 2: Tambahkan transfer artifact ke server release path**

```yaml
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: app-release
          path: release

      - name: Create remote release directory
        run: |
          TAG="${GITHUB_REF_NAME}"
          ssh -p "${{ secrets.CPANEL_PORT }}" "${{ secrets.CPANEL_USER }}@${{ secrets.CPANEL_HOST }}" \
            "mkdir -p '${{ secrets.CPANEL_DEPLOY_PATH }}/releases/${TAG}'"

      - name: Rsync release to cPanel
        run: |
          TAG="${GITHUB_REF_NAME}"
          rsync -az --delete -e "ssh -p ${{ secrets.CPANEL_PORT }}" \
            release/ "${{ secrets.CPANEL_USER }}@${{ secrets.CPANEL_HOST }}:${{ secrets.CPANEL_DEPLOY_PATH }}/releases/${TAG}/"
```

- [ ] **Step 3: Upload dan eksekusi deploy script di server**

```yaml
      - name: Upload deploy script
        run: |
          rsync -az -e "ssh -p ${{ secrets.CPANEL_PORT }}" \
            .github/scripts/cpanel-deploy.sh \
            "${{ secrets.CPANEL_USER }}@${{ secrets.CPANEL_HOST }}:${{ secrets.CPANEL_DEPLOY_PATH }}/cpanel-deploy.sh"

      - name: Run remote deploy script
        run: |
          TAG="${GITHUB_REF_NAME}"
          ssh -p "${{ secrets.CPANEL_PORT }}" "${{ secrets.CPANEL_USER }}@${{ secrets.CPANEL_HOST }}" \
            "chmod +x '${{ secrets.CPANEL_DEPLOY_PATH }}/cpanel-deploy.sh' && '${{ secrets.CPANEL_DEPLOY_PATH }}/cpanel-deploy.sh' '${{ secrets.CPANEL_DEPLOY_PATH }}' '${TAG}'"
```

- [ ] **Step 4: Tambahkan healthcheck opsional setelah deploy**

```yaml
      - name: HTTP health check (optional)
        if: ${{ secrets.APP_HEALTHCHECK_URL != '' }}
        run: |
          curl -fSL "${{ secrets.APP_HEALTHCHECK_URL }}"
```

- [ ] **Step 5: Validasi syntax workflow**

Run: `python -m yamllint .github/workflows/deploy-cpanel.yml`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy-cpanel.yml .github/scripts/cpanel-deploy.sh
git commit -m "ci: wire ssh rsync deploy flow for cpanel"
```

## Task 5: Dokumentasi operasional deploy & rollback

**Files:**
- Modify: `README.md`
- Test: `README.md` (manual doc verification)

- [ ] **Step 1: Tambahkan section baru 'Deployment ke cPanel via GitHub Actions'**

```md
## Deployment ke cPanel via GitHub Actions

### Secrets yang wajib
- CPANEL_HOST
- CPANEL_PORT
- CPANEL_USER
- CPANEL_SSH_KEY
- CPANEL_DEPLOY_PATH

### Struktur server
- <DEPLOY_PATH>/releases/<tag>
- <DEPLOY_PATH>/shared/.env
- <DEPLOY_PATH>/shared/storage
- <DEPLOY_PATH>/current

### Trigger deploy
Push tag dengan format `v*`, contoh:

```bash
git tag v1.0.0
git push origin v1.0.0
```
```

- [ ] **Step 2: Tambahkan panduan rollback cepat**

```md
### Rollback cepat
Upload script rollback lalu jalankan di server:

```bash
bash cpanel-rollback.sh /home/<user>/apps/wikarta v1.0.0
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add cpanel deployment and rollback guide"
```

## Task 6: Verifikasi end-to-end + quality gates

**Files:**
- Modify: `.github/workflows/deploy-cpanel.yml` (jika ada perbaikan akhir)
- Test: local + GitHub Actions run

- [ ] **Step 1: Jalankan lint/type/test lokal sesuai repo**

Run: `composer lint:check && npm run lint:check && npm run types:check && php artisan test`
Expected: semua PASS

- [ ] **Step 2: Buat tag percobaan release candidate**

Run: `git tag v0.0.0-rc1 && git push origin v0.0.0-rc1`
Expected: workflow `deploy-cpanel` terpanggil pada tab Actions

- [ ] **Step 3: Verifikasi hasil deploy via SSH**

Run:
```bash
ssh -p <port> <user>@<host> "ls -la <deploy_path>/releases && readlink <deploy_path>/current"
```
Expected: ada folder `releases/v0.0.0-rc1` dan `current` menunjuk ke release tersebut

- [ ] **Step 4: Verifikasi aplikasi hidup**

Run: `curl -fSL <healthcheck-url>`
Expected: HTTP 200

- [ ] **Step 5: Commit final adjustment (jika ada)**

```bash
git add .
git commit -m "chore: finalize cpanel deployment pipeline"
```

## Self-Review Checklist (completed)

- Spec coverage: semua requirement di spec tercakup (trigger tag, build di Actions, rsync, symlink release, migrate/cache, cleanup, rollback, docs).
- Placeholder scan: tidak ada TODO/TBD/"implement later".
- Consistency check: nama secrets, path deploy, dan nama file script konsisten lintas task.
