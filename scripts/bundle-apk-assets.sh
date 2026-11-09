#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Building web extension bundle..."
bun run build

echo "==> Syncing web assets to android/assets/web/..."
mkdir -p android/assets/web/assets

cp dist/content-scripts/content.css android/assets/web/content.css
cp dist/content-scripts/content.js android/assets/web/superflex.js
cp -r dist/assets/* android/assets/web/assets/
cp dist/reviews.json android/assets/web/reviews.json
cp dist/bridge.js android/assets/web/bridge.js

echo "==> Web assets successfully bundled into android/assets/web/"
ls -lh android/assets/web/
