# SuperFlex for Android

Runs the existing SuperFlex bundle (`background.js` and `content.js` from the WXT build) inside an Android WebView on `https://flexstudent.nu.edu.pk`, behind a `chrome.*` compatibility shim. The Chrome extension build is untouched.

## Build

Needs Java 17+, Bun 1.2+, and on Ubuntu: `aapt apksigner zipalign android-sdk-platform-23 dalvik-exchange`.

    bun install
    ./android/build.sh debug

Output: `dist/SuperFlex.apk` (also `android/app/build/outputs/apk/debug/app-debug.apk`). The extension build wipes `dist/`, so build the APK last.

Release: set `SF_KEYSTORE`, `SF_STOREPASS`, `SF_KEYALIAS` and run `./android/build.sh release`.

## Install

    adb install -r dist/SuperFlex.apk

or copy the file to the phone and open it (allow installs from unknown sources).

## Test

    bun run test:android

Runs the shim and bundle in headless Chromium against a stand-in page. It does not contact the real FLEX portal.

## Layout

- `shim/shim.js`: chrome.runtime, storage, tabs, ports and browsingData for the WebView
- `scripts/android-bundle.mjs`: assembles the web bundle from the WXT output
- `src/com/superflex/app`: native shell (WebView, splash, downloads, uploads, offline screen)
