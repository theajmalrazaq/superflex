# Privacy Policy & Data Security

Your data privacy and security are at the core of everything we do at SuperFlex. We believe in transparency and want you to know exactly how your data is handled when you use the extension.

## 1. Our Privacy Philosophy

SuperFlex was built by students, for students. We understand the sensitivity of academic records, and we have designed the extension with a **Privacy-First** architecture.

- **We don't want your data.** We only access it to show it to you in a better way.
- **We never store your credentials.** Your login information remains between you and the university.
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

When you use the AI Academic Assistant, the data listed above is sent to AI model providers (like OpenAI, Anthropic, or Google) via the Puter.ai API. This is necessary for the AI to understand your academic context and provide personalized advice.

- **Opt-in Only:** AI data access is only enabled if you explicitly grant permission.
- **No Training:** We request that providers do not use this data to train their models.

## 3. Information We Collect

We prioritize your anonymity. We use **Umami Analytics**, a privacy-focused, cookieless analytics tool, to track light usage data.

### What we track:

- Which pages are visited most (e.g., Marks vs. Attendance).
- Extension version adoption.
- General browser and OS information.

### What we NEVER collect:

- Your name, student ID, or roll number.
- Your specific marks or grades.
- Any information that could be used to identify you personally.

## 4. Third-Party Services

We use a few trusted partners to provide core functionality:

- **Puter.ai:** Used to securely connect to AI models. Data transmitted is strictly for chat processing.
- **Google Fonts:** Used to provide the Google Sans Flex typography.
- **Github/Vercel:** Used for project hosting and documentation.

## 5. Security Measures

- **No Backend:** SuperFlex has no central database. If our website were compromised, your academic data would still be safe because it lives only on your computer.
- **Local Encryption:** We rely on browser sandbox security to protect the data stored in `localStorage`.
- **HTTPS Only:** All communications with third-party APIs (Puter, Umami) are encrypted via TLS.

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

_Last Updated: December 27, 2024_
