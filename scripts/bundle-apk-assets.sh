#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d "dist" ] || [ ! -f "dist/content-scripts/content.js" ]; then
  echo "==> Building web extension bundle..."
  if command -v bun >/dev/null 2>&1; then
    bunx wxt build
  else
    npx wxt build
  fi
else
  echo "==> Using existing dist build..."
fi

echo "==> Assembling Android web bundle with shim..."
if command -v bun >/dev/null 2>&1; then
  bun scripts/android-bundle.mjs
else
  node scripts/android-bundle.mjs
fi

echo "==> Web assets successfully bundled into android/assets/web/"
ls -lh android/assets/web/
