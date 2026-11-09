#!/usr/bin/env bash
# Ultra-lean build script for SuperFlex Android APK using raw Android SDK command-line tools.
# Zero Gradle daemon overhead, zero Gradle cache bloat. Builds in under 10 seconds.
set -euo pipefail
cd "$(dirname "$0")"

OUT_DIR="build"
OUT_APK="${1:-$OUT_DIR/SuperFlex.apk}"

# 1. Resolve Android SDK location
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
if [ ! -d "$SDK" ] && [ -d "/usr/local/lib/android/sdk" ]; then
  SDK="/usr/local/lib/android/sdk"
fi

if [ ! -d "$SDK" ]; then
  echo "ERROR: Android SDK not found. Set ANDROID_HOME." >&2
  exit 1
fi

# 2. Resolve build-tools (find highest installed version)
BT=$(find "$SDK/build-tools" -maxdepth 1 -mindepth 1 | sort -V | tail -n 1)
if [ -z "$BT" ] || [ ! -d "$BT" ]; then
  echo "ERROR: No Android build-tools found in $SDK/build-tools" >&2
  exit 1
fi

# 3. Resolve android.jar (find highest installed platform)
JAR=$(find "$SDK/platforms" -name "android.jar" | sort -V | tail -n 1)
if [ -z "$JAR" ] || [ ! -f "$JAR" ]; then
  echo "ERROR: No android.jar found in $SDK/platforms" >&2
  exit 1
fi

AAPT2="$BT/aapt2"
D8="$BT/d8"
ZIPALIGN="$BT/zipalign"
APKSIGNER="$BT/apksigner"

echo "==> Using Android SDK: $SDK"
echo "==> Using Build Tools: $BT"
echo "==> Using Platform JAR: $JAR"

# 4. Clean and recreate build directories
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/res" "$OUT_DIR/gen" "$OUT_DIR/classes" "$OUT_DIR/dex"

# 5. Compile resources
echo "==> Compiling resources with aapt2..."
"$AAPT2" compile --dir res -o "$OUT_DIR/res/res.zip"

# 6. Link APK with assets
echo "==> Linking APK with assets..."
"$AAPT2" link \
  -I "$JAR" \
  --manifest AndroidManifest.xml \
  -A assets \
  -o "$OUT_DIR/unsigned.apk" \
  --java "$OUT_DIR/gen" \
  "$OUT_DIR/res/res.zip"

# 7. Compile Java sources
echo "==> Compiling Java sources with javac..."
JAVA_SOURCES=$(find src "$OUT_DIR/gen" -name '*.java')
javac \
  -source 17 -target 17 \
  -nowarn -Xlint:-options \
  -cp "$JAR" \
  -d "$OUT_DIR/classes" \
  $JAVA_SOURCES

# 8. Dex bytecode
echo "==> Generating classes.dex with d8..."
CLASS_FILES=$(find "$OUT_DIR/classes" -name '*.class')
"$D8" \
  --release \
  --min-api 23 \
  --lib "$JAR" \
  --output "$OUT_DIR/dex" \
  $CLASS_FILES

# 9. Pack classes.dex into APK
echo "==> Packaging classes.dex..."
cp "$OUT_DIR/unsigned.apk" "$OUT_DIR/withdex.apk"
(cd "$OUT_DIR/dex" && zip -qu "../withdex.apk" classes.dex)

# 10. Align APK
echo "==> 4-byte zipaligning..."
"$ZIPALIGN" -f 4 "$OUT_DIR/withdex.apk" "$OUT_DIR/aligned.apk"

# 11. Resolve or generate debug keystore
KEYSTORE="$HOME/.android/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "==> Generating debug keystore at $KEYSTORE..."
  mkdir -p "$HOME/.android"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US"
fi

# 12. Sign APK
echo "==> Signing APK with apksigner..."
"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$OUT_APK" \
  "$OUT_DIR/aligned.apk"

echo "==> Successfully built optimized APK: $OUT_APK"
ls -lh "$OUT_APK"
