#!/usr/bin/env bash
set -euo pipefail

mode="${1:-debug}"
here="$(cd "$(dirname "$0")" && pwd)"
root="$(dirname "$here")"
out="$here/build"
if [ -n "${ANDROID_JAR:-}" ] && [ -f "$ANDROID_JAR" ]; then
  jar="$ANDROID_JAR"
else
  jar="$(ls /usr/lib/android-sdk/platforms/android-*/android.jar 2>/dev/null | tail -n 1)"
fi
if command -v node >/dev/null 2>&1; then
  version="$(node -p "require('$root/package.json').version")"
else
  version="$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)".*/\1/p' "$root/package.json" | head -n 1)"
fi

if [ "${SKIP_WEB:-0}" != "1" ]; then
  (cd "$root" && npx wxt build && node scripts/android-bundle.mjs)
fi

if [ ! -f "$here/assets/web/superflex.js" ]; then
  echo "Missing android/assets/web/superflex.js" >&2
  exit 1
fi

rm -rf "$out"
mkdir -p "$out/gen" "$out/classes"

flags=""
if [ "$mode" = "debug" ]; then
  flags="--debug-mode"
fi

aapt package -f -m -J "$out/gen" -M "$here/AndroidManifest.xml" -S "$here/res" -A "$here/assets" \
  -I "$jar" --min-sdk-version 26 --target-sdk-version 34 \
  --version-code 1 --version-name "$version" $flags -F "$out/base.apk"

find "$here/src" "$out/gen" -name '*.java' > "$out/sources.txt"
javac -nowarn -source 8 -target 8 -bootclasspath "$jar" -d "$out/classes" @"$out/sources.txt" 2> "$out/javac.log" || { cat "$out/javac.log"; exit 1; }

dalvik-exchange --dex --output="$out/classes.dex" "$out/classes"

cp "$out/base.apk" "$out/unsigned.apk"
(cd "$out" && aapt add unsigned.apk classes.dex > /dev/null)
zipalign -f -p 4 "$out/unsigned.apk" "$out/aligned.apk"

if [ "$mode" = "release" ]; then
  if [ -z "${SF_KEYSTORE:-}" ] || [ -z "${SF_STOREPASS:-}" ] || [ -z "${SF_KEYALIAS:-}" ]; then
    echo "Release needs SF_KEYSTORE, SF_STOREPASS and SF_KEYALIAS" >&2
    exit 1
  fi
  apksigner sign --ks "$SF_KEYSTORE" --ks-pass "pass:$SF_STOREPASS" --ks-key-alias "$SF_KEYALIAS" \
    --out "$out/SuperFlex.apk" "$out/aligned.apk"
else
  store="$here/debug.keystore"
  if [ ! -f "$store" ]; then
    keytool -genkeypair -keystore "$store" -storepass android -keypass android -alias debug \
      -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=SuperFlex Debug,O=SuperFlex,C=PK" > /dev/null 2>&1
  fi
  apksigner sign --ks "$store" --ks-pass pass:android --key-pass pass:android --ks-key-alias debug \
    --out "$out/SuperFlex.apk" "$out/aligned.apk"
fi

apksigner verify --verbose "$out/SuperFlex.apk" | head -n 4

target="$here/app/build/outputs/apk/$mode"
mkdir -p "$target" "$root/dist"
cp "$out/SuperFlex.apk" "$target/app-$mode.apk"
cp "$out/SuperFlex.apk" "$root/dist/SuperFlex.apk"
ls -l "$out/SuperFlex.apk"
