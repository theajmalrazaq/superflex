<div align="center">
  <img src="public/assets/logo.svg" alt="SuperFlex" width="300" />
  <p>A privacy-first interface and academic toolkit for the FAST-NUCES Flex Student Portal.</p>

  <p>
    <a href="https://github.com/theajmalrazaq/superflex/releases"><img src="https://img.shields.io/github/downloads/theajmalrazaq/superflex/total?style=for-the-badge&color=a098ff" alt="GitHub downloads"></a>
    <a href="https://github.com/theajmalrazaq/superflex"><img src="https://img.shields.io/github/stars/theajmalrazaq/superflex?style=for-the-badge&color=a098ff" alt="GitHub stars"></a>
    <a href="https://github.com/theajmalrazaq/superflex/issues"><img src="https://img.shields.io/github/issues-raw/theajmalrazaq/superflex?style=for-the-badge&color=a098ff" alt="GitHub issues"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-a098ff?style=for-the-badge" alt="MIT License"></a>
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

SuperFlex is an open-source Chrome extension that replaces the dated Flex Student Portal interface with a responsive React experience. It keeps the university portal as the source of truth while adding clearer dashboards, academic tools, optional AI assistance, instructor workflows, and a safer login Auto-Fill vault.

SuperFlex runs on the client side. It has no SuperFlex backend, analytics pipeline, advertising SDK, or telemetry service.

## Features

### Modern portal UI

- Responsive dashboards using Google Sans Flex and a consistent light/dark design system.
- Bottom-sheet settings, focused loading states, accessible controls, and mobile-friendly navigation.
- Clear layouts for attendance, marks, transcript, study plan, fees, feedback, registration, withdrawal, retakes, and grade-change workflows.
- Local preferences for theme, bookmarks, selected instructors, and interface settings.

### Octopus AI assistant

- Connects directly to Google's Gemini API with a key supplied by the user.
- Streams responses and automatically falls back to another compatible Gemini model when the selected model is unavailable.
- Uses only the academic context the user permits, including attendance, marks, transcript, and study-plan data.
- Supports Markdown answers, persistent local chat history, academic forecasts, summaries, and what-if questions.
- Can be disabled completely from settings.

### Attendance and instructor tools

- Course-level attendance breakdowns, threshold warnings, and leave calculations.
- Campus-aware faculty directory with instructor search and manual instructor entry.
- Attendance-review workflow that prepares a respectful email draft, opens Gmail, or copies the message.
- Instructor selections are stored locally and can be changed at any time.

### Passphrase-protected Auto-Fill

- Auto-Fill is optional and must be explicitly enabled.
- The user creates a vault passphrase; the passphrase is never stored.
- PBKDF2-HMAC-SHA256 with a unique random salt derives the encryption key.
- Credentials are encrypted locally with AES-GCM 256-bit in `chrome.storage.local`.
- The derived vault key is wrapped with a device key in isolated extension storage, so later logins
  only require choosing Auto-Fill on that browser profile.

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
- **Optional credential vault:** login credentials are stored only when Auto-Fill is enabled and are protected by the user's passphrase.
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

SuperFlex can run in Chromium-based Android browsers that support Chrome extensions, such as [Quetta Browser](https://www.quetta.net/features/extensions). Mobile extension support is controlled by the browser and may vary by version.

## Development

### Stack

- React 19
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
npm run typecheck:parsers
npm run format:check
npm run build
```

### Project map

```text
src/
├── components/       Shared UI, settings, AI, instructor and login experiences
├── components/ui/    Buttons, inputs, bottom sheets, modals and reusable states
├── entrypoints/      WXT content-script and background-service-worker entrypoints
├── hooks/            Academic context synchronization
├── pages/            Portal page replacements
├── parsers/          Typed HTML-to-data parsers
├── stores/           Persisted user preferences
└── utils/            Storage, credentials, processing and extension helpers

docs/
├── index.html        Project website
├── docs.html         Documentation reader
└── articles/         AI guide, privacy policy and engineering notes
```

## Version notes

The current V6 interface consolidates settings into a shared bottom-sheet system, introduces the Octopus AI setup flow, adds campus faculty and attendance-review tools, and replaces the previous fixed credential seed with a user-chosen passphrase vault. Historical implementation notes remain in [Behind the Scenes](docs/articles/bts.md), clearly separated from current behavior.

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
