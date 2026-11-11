# Privacy Policy & Data Security

Your data privacy and security are at the core of everything we do at SuperFlex. We believe in transparency and want you to know exactly how your data is handled when you use the extension.

## 1. Our Privacy Philosophy

SuperFlex was built by students, for students. We understand the sensitivity of academic records, and we have designed the extension with a **Privacy-First** architecture.

- **We don't want your data.** We only access it to show it to you in a better way.
- **Credential storage is optional.** Auto-Fill stores credentials only when you explicitly enable it in Settings or via "Remember Me" and encrypts them locally in isolated storage.
- **You are in control.** You decide which data to sync and when to use AI features.

## 2. Information We Access

SuperFlex works as a "parasitic overlay," meaning it reads information from your university portal to render a modern interface.

### Academic Data

To provide the dashboard, calculators, and AI features, SuperFlex reads:

- Your name and roll number.
- Attendance records.
- Marks, grades, and GPA information.
- Transcript and study plan details.

**Storage:** This data is stored **locally on your device** in your browser's `localStorage`. It is never uploaded to SuperFlex servers.

### AI Context Sync

When you use Octopus AI, your message and the selected academic context are sent directly to Google's Gemini API using the API key you provide. The key is stored in the browser extension's local storage. SuperFlex does not proxy these requests or store the key on its servers.

- **Opt-in Only:** AI data access is only enabled if you explicitly grant permission.
- **Provider policies:** AI data handling follows Google's Gemini API terms and your account settings.

## 3. Information We Collect

We prioritize your total privacy. SuperFlex operates with **zero analytics, zero tracking, and zero telemetry**.

### What we track:

- **Nothing.** We do not track page views, feature usage, clicks, or session duration.

### What we NEVER collect:

- Your name, student ID, or roll number.
- Your specific marks, grades, or transcripts.
- Any passwords, credentials, or session cookies.
- Any usage metrics or telemetry that could identify you or your device.

## 4. Third-Party Services

We use minimal trusted partners strictly for user-requested functionality:

- **Google Gemini:** Used for AI academic chat only when you provide and configure your own API key.
- **Google Fonts:** Used to provide the Google Sans Flex typography.
- **Github/Vercel:** Used for project hosting and documentation.

## 5. Security Measures

- **No Backend:** SuperFlex has no central database or telemetry servers. Your academic data lives exclusively on your local computer.
- **Device-Wrapped Local Encryption:** Auto-Fill derives an AES-GCM (256-bit) key via PBKDF2-HMAC-SHA256 (600,000 iterations with a unique random salt) and encrypts credentials before storage in `chrome.storage.local` (or isolated WebView storage on Android). A separate local device key wraps the derived vault key so future logins can use 1-click Auto-Fill on the same browser or device without storing plaintext passwords.
- **HTTPS Only:** Communications with Google's Gemini API are encrypted in transit using HTTPS/TLS.

## 6. Your Rights

Since we do not store your data on our servers, "deleting your data" is as simple as:

1. Clicking "Clear Chat" in the AI window.
2. Uninstalling the extension.
3. Clearing your browser's local storage/cookies for the university portal.

## 7. Contact Us

If you have any questions about this Privacy Policy or how we handle your data, feel free to reach out:

- **Email:** theajmalrazaq@gmail.com
- **Github:** [theajmalrazaq/superflex](https://github.com/theajmalrazaq/superflex)

---

_Last Updated: November 11, 2026_
