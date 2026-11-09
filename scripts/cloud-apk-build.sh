#!/usr/bin/env bash
set -euo pipefail

echo "==> Triggering cloud APK build via GitHub Actions (zero-release artifact)..."

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI ('gh') is not installed. Install via: mise use -g gh or your package manager." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI is not logged in. Run 'gh auth login' to authenticate with your GitHub account." >&2
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "master")
echo "==> Branch: $BRANCH"

# Trigger workflow with empty version to bypass release creation
gh workflow run build-and-release.yml --ref "$BRANCH" -f version=""

echo "==> Waiting for runner allocation..."
sleep 4

RUN_ID=$(gh run list --workflow=build-and-release.yml --branch="$BRANCH" --limit=1 --json databaseId -q '.[0].databaseId')
if [ -z "$RUN_ID" ]; then
  echo "ERROR: Could not find triggered workflow run." >&2
  exit 1
fi

echo "==> Monitoring cloud build #$RUN_ID..."
gh run watch "$RUN_ID"

echo "==> Downloading SuperFlex.apk artifact directly to workspace..."
rm -f SuperFlex.apk
gh run download "$RUN_ID" -n SuperFlex-APK -D .

if [ -f "SuperFlex.apk" ]; then
  echo "✅ SuperFlex.apk downloaded successfully: $(ls -lh SuperFlex.apk | awk '{print $5, $9}')"
else
  echo "⚠️ SuperFlex.apk not found in root directory, check download folder."
fi
