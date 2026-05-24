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
