<div align="center">
  <img src="public/assets/logo.svg" alt="SuperFlex" width="300" />
  <p>A privacy-first interface and academic toolkit for the FAST-NUCES Flex Student Portal.</p>

  <p>
    <a href="https://github.com/theajmalrazaq/superflex/releases"><img src="https://img.shields.io/github/downloads/theajmalrazaq/superflex/total?style=for-the-badge&color=230052" alt="GitHub downloads"></a>
    <a href="https://github.com/theajmalrazaq/superflex"><img src="https://img.shields.io/github/stars/theajmalrazaq/superflex?style=for-the-badge&color=230052" alt="GitHub stars"></a>
    <a href="https://github.com/theajmalrazaq/superflex/issues"><img src="https://img.shields.io/github/issues-raw/theajmalrazaq/superflex?style=for-the-badge&color=230052" alt="GitHub issues"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-230052?style=for-the-badge" alt="MIT License"></a>
  </p>

  <p>
    <a href="https://theajmalrazaq.github.io/superflex">Website</a> ·
    <a href="#features">Features</a> ·
    <a href="#installation">Installation</a> ·
    <a href="#privacy-and-security">Privacy</a> ·
    <a href="#development">Development</a>
  </p>
</div>

## Overview

SuperFlex (`v7.0.0`) is an open-source Chrome extension and Android WebView wrapper that replaces the dated Flex Student Portal interface with a responsive React experience. It keeps the university portal as the source of truth while adding clearer dashboards, academic tools, optional AI assistance, instructor workflows, mobile navigation, and an AES-GCM encrypted login Auto-Fill vault.

SuperFlex runs on the client side. It has no SuperFlex backend, analytics pipeline, advertising SDK, or telemetry service.

## Features

### Modern portal UI & mobile experience

- Responsive dashboards using Google Sans Flex and a consistent light/dark design system across desktop, mobile browsers, and the native Android app.
- Floating bottom navigation dock with Octopus AI launcher, active-route Speed Dial menu, and accessible bottom-sheet modals.
- Interactive attendance heatmaps with viewport-clamped tooltips, quick profile navigation and photo upload from any screen, and clean skeleton loading states.
- Clear layouts for home assessments (including ungraded and participation categories), attendance, marks, transcript, study plan, fees, feedback, registration, withdrawal, retakes, and grade-change workflows.
- Local preferences for theme, bookmarks, custom profile image, selected instructors, and interface settings.

### Octopus AI assistant

- Connects directly to Google's Gemini API with a key supplied by the user, anchored to a bottom-docked panel on desktop and mobile.
- Streams responses and automatically falls back to another compatible Gemini model when the selected model is unavailable.
- Uses only the academic context the user permits, including attendance, marks, transcript, and study-plan data.
- Supports Markdown answers, wrapping quick-prompt chips, persistent local chat history, academic forecasts, summaries, and what-if questions.
- Can be disabled completely from settings.

### Attendance and instructor tools

- Course-level attendance breakdowns, interactive heatmaps, threshold warnings, and leave calculations.
- Campus-aware faculty directory (`Course Faculty Settings`) with instructor search, course step navigation, and manual instructor entry.
- Attendance-review workflow that prepares a respectful email draft, opens Gmail, or copies the message.
- Instructor selections are stored locally per student and can be changed at any time.

### Encrypted Auto-Fill vault

- Auto-Fill is optional and enabled only when credentials are saved via the **Auto-Fill** tab in Settings or **Remember Me** on login.
- Uses PBKDF2-HMAC-SHA256 (`600,000` iterations, 16-byte random salt) to derive an AES-GCM 256-bit key—either from a generated 256-bit random secret or an explicit passphrase—with fresh 12-byte IVs per encryption.
- Wraps the derived vault key with a browser/device key stored in `chrome.storage.local` (or isolated WebView storage on Android), so subsequent logins can trigger 1-click Auto-Fill without re-entering credentials.

### Academic planning

- Attendance simulations and course-level status indicators.
- Marks breakdowns, best-of calculations, and grade forecasting.
- Semester and cumulative GPA views.
- Study-plan and transcript parsing for a clearer degree overview.
- Fee details and challan pages with simplified financial information.

## Supported pages

- Home
- Attendance
- Marks and PLO report
- Transcript
- Study plan
- Course registration and withdrawal
- Course feedback
- Grade change
- Fee details and fee challan
- Retake exam
- Change password and session-expiry screens

## Privacy and security

- **Zero telemetry:** the extension does not send usage analytics or tracking events.
- **No SuperFlex backend:** academic records and preferences remain in the browser.
- **Direct AI connection:** permitted prompts and academic context go directly to Google's Gemini API using the user's key.
- **Optional credential vault:** login credentials are stored only when Auto-Fill is enabled and are encrypted locally with AES-GCM 256-bit inside isolated extension or WebView storage.
- **Official records win:** SuperFlex is a client-side interface. University records remain authoritative.

Read the full [Privacy Policy](docs/articles/privacy.md).

## Installation

### Chrome and Chromium browsers

1. Install SuperFlex from the [Chrome Web Store](https://chromewebstore.google.com/detail/superflex/gipkdnbjfhjenfgehofkimpffdbkgppd).
2. Open the FAST-NUCES Flex Student Portal.
3. Complete the first-run privacy setup and configure only the optional tools you want.

### Manual installation

1. Download the latest package from [GitHub Releases](https://github.com/theajmalrazaq/superflex/releases).
2. Extract the archive.
3. Open `chrome://extensions` and enable Developer mode.
4. Select **Load unpacked** and choose the extracted extension directory.

### Android

SuperFlex v7.0.0 runs natively on Android via its built-in WebView shell ([android/README.md](android/README.md)) and also works in extension-capable Chromium Android browsers such as [Quetta Browser](https://www.quetta.net/features/extensions).

1. Download `SuperFlex.apk` from [GitHub Releases](https://github.com/theajmalrazaq/superflex/releases) (or build locally with `npm run android:build`).
2. Install the APK on your Android device and sign in to `flexstudent.nu.edu.pk`.

## Development

### Stack

- TypeScript and React 19
- WXT and Vite
- Tailwind CSS 4
- Radix UI primitives
- Zustand and Zod
- Chart.js
- Vitest, Oxlint, and Oxfmt

### Setup

```bash
git clone https://github.com/theajmalrazaq/superflex.git
cd superflex
npm install
npm run dev
```

WXT creates the development extension output. Load the generated Chrome MV3 directory shown by WXT in `chrome://extensions`.

### Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run format:check
npm run build
npm run android:bundle
```

The project-wide TypeScript check covers source, tests, build configuration, and documentation scripts. Implicit parameter types and nullable legacy values are allowed during migration; the parser check remains fully strict.

### Shared state and validation

Use the Zustand preference, teacher, and faculty stores for state shared between components. Teacher data stays in the existing student-scoped storage keys; faculty requests are cached separately by campus. Keep transient form fields and modal state local to their components.

Validate storage, extension messages, model responses, credentials, email drafts, and review data with the Zod Mini schemas in `src/schemas/`. Derive TypeScript types from schemas when a runtime schema exists. Use the shared Markdown parser for draft links and question text, including reference links and nested formatting. Regex remains useful for locating tokens and extracting portal formats; complete-value validation belongs in schemas.

The existing Radix primitives, `cva`, `cn` (`clsx` and `tailwind-merge`), Chart.js, and transactional `idb` helpers already serve their intended roles. Use `structuredClone` for copies of plain academic data.

### Documentation website

```bash
npm run dev:docs
npm run build:docs
```

The website works directly from `docs/` on static hosting. Author behavior in `docs/scripts/*.ts` and run `npm run build:docs:scripts` to regenerate the committed browser bundles in `docs/scripts/generated/`. Vite serves TypeScript directly during development; `npm run build:docs` refreshes those bundles and creates `dist-docs/` for artifact hosting. Reviews are bundled from `public/reviews.json`, the shared source for the website and extension. HTML, CSS, JSON, Markdown, and media remain in their native formats.

### Project map

```text
android/            Native Android WebView shell, chrome.* shim, and APK build scripts
src/
├── components/       Shared UI, settings, AI, instructor and login experiences
├── components/ui/    Buttons, inputs, bottom sheets, modals and reusable states
├── entrypoints/      WXT content script, background worker, and browser bridge
├── hooks/            Academic context synchronization
├── pages/            Portal page replacements
├── parsers/          Typed HTML-to-data parsers
├── schemas/          Runtime validation for stored and external data
├── stores/           Shared preferences, student teachers, and campus faculty cache
└── utils/            Storage, credentials, processing and extension helpers

docs/
├── index.html        Project website
├── docs.html         Documentation reader
├── scripts/          TypeScript website behavior and theme setup
└── articles/         AI guide, privacy policy and engineering notes
```

## Version notes

**v7.0.0** expands SuperFlex across desktop, mobile browsers, and a standalone Android WebView app (`android/`), introduces a bottom-docked mobile navigation bar with Octopus AI quick access and active Speed Dial states, refines bottom-sheet modal spacing and responsive layouts, preserves full assessment categories (including ungraded and participation items), adds one-tap profile photo access from any screen, and stores optional Auto-Fill credentials in an AES-GCM 256-bit device-wrapped vault configurable directly in Settings. Historical implementation notes remain in [Behind the Scenes](docs/articles/bts.md), clearly separated from current behavior.

## Contributing

Issues and pull requests are welcome.

1. Fork the repository.
2. Create a focused branch.
3. Add or update tests where behavior changes.
4. Run the quality checks above.
5. Open a pull request explaining the problem and the chosen solution.

## Disclaimer

SuperFlex is an independent open-source community project. It is not affiliated with, endorsed by, or sponsored by FAST-NUCES. It does not modify university records or bypass university security controls. Use it voluntarily, verify important academic information against the official portal, and report discrepancies through the university's official channels.

## License

Released under the [MIT License](LICENSE).
