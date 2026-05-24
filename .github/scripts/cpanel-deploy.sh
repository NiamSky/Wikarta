#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${1:?deploy path required}"
RELEASE_TAG="${2:?release tag required}"

if [[ ! "$RELEASE_TAG" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Invalid release tag: $RELEASE_TAG"
  exit 1
fi

RELEASES_DIR="$DEPLOY_PATH/releases"
SHARED_DIR="$DEPLOY_PATH/shared"
CURRENT_LINK="$DEPLOY_PATH/current"
NEW_RELEASE_DIR="$RELEASES_DIR/$RELEASE_TAG"

mkdir -p "$RELEASES_DIR" "$SHARED_DIR" "$SHARED_DIR/storage" "$NEW_RELEASE_DIR"

RELEASES_DIR_ABS="$(cd "$RELEASES_DIR" && pwd -P)"
NEW_RELEASE_DIR_ABS="$(cd "$NEW_RELEASE_DIR" && pwd -P)"

case "$NEW_RELEASE_DIR_ABS" in
  "$RELEASES_DIR_ABS"/*) ;;
  *)
    echo "Release path escapes releases directory: $NEW_RELEASE_DIR_ABS"
    exit 1
    ;;
esac

NEW_RELEASE_DIR="$NEW_RELEASE_DIR_ABS"

if [[ ! -f "$SHARED_DIR/.env" ]]; then
  echo "Missing shared .env at $SHARED_DIR/.env"
  exit 1
fi

ln -sfn "$SHARED_DIR/.env" "$NEW_RELEASE_DIR/.env"
rm -rf "$NEW_RELEASE_DIR/storage"
ln -sfn "$SHARED_DIR/storage" "$NEW_RELEASE_DIR/storage"

if ! command -v php >/dev/null 2>&1; then
  echo "php command not found"
  exit 1
fi

if [[ ! -f "$NEW_RELEASE_DIR/artisan" ]]; then
  echo "Missing artisan at $NEW_RELEASE_DIR/artisan"
  exit 1
fi

php "$NEW_RELEASE_DIR/artisan" migrate --force
php "$NEW_RELEASE_DIR/artisan" optimize:clear
php "$NEW_RELEASE_DIR/artisan" config:cache
php "$NEW_RELEASE_DIR/artisan" about > /dev/null

ln -sfn "$NEW_RELEASE_DIR" "$CURRENT_LINK"

mapfile -t old_releases < <(
  find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -nr \
    | awk 'NR > 5 { sub(/^[^ ]+ /, ""); print }'
)

if (( ${#old_releases[@]} > 0 )); then
  rm -rf -- "${old_releases[@]}"
fi
