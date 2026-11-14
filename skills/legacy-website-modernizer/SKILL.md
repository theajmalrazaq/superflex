---
name: legacy-website-modernizer
description: >-
  Universal workflow to audit, reverse-engineer, and modernly reskin ANY legacy, outdated, or frustrating website, portal, intranet, or web application using a client-side Chrome Extension / Web Overlay architecture (WXT, React 19, Tailwind CSS, TypeScript, Zustand).
  Triggers when asked to "modernize a legacy website", "redesign an ugly portal", "build an extension overlay for a website", "reskin a site", "modernize an intranet or ERP", or "crawl a site and recreate it as a modern app".
---

# Legacy Website Modernizer

A standardized engineering playbook for autonomous AI coding agents (Antigravity, Claude Code, Codex, Cursor, Windsurf) to transform **any clunky, outdated, or frustrating website** into a sleek, blisteringly fast, 2026-grade application.

Instead of needing backend database access or server rebuilds, this skill guides agents through building a **client-side overlay extension** (using the battle-tested SuperFlex architecture) that hijacks the legacy presentation, preserves native authentication and form submissions, and overlays a modern React/Tailwind application directly over the host domain.

---

## 1. Core Architecture Blueprint

```text
[ Legacy Host Website ] (ASP.NET / PHP / JSP / Old Rails / Classic HTML)
       ▲                                 ▲
       │ Network / Cookies               │ DOM Ingestion / Form Submissions
       │ (Preserved 100%)                │ (Hidden from User View)
┌──────┴─────────────────────────────────┴──────────────────────────────┐
│                  Modern Extension Overlay Architecture                │
│                                                                       │
│  ┌───────────────────────┐          ┌──────────────────────────────┐  │
│  │ Resilient DOM Parsers │ ───────▶ │ Zod Validated Domain Stores  │  │
│  │ (cheerio / DOMParser) │          │ (Zustand + IndexedDB Cache)  │  │
│  └───────────────────────┘          └──────────────┬───────────────┘  │
│                                                    │                  │
│                                                    ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Modern Presentation Layer (React 19 + Tailwind + Lucide Icons)   │  │
│  │ • Elevated Navigation (Sidebar / Bottom Nav on Mobile)          │  │
│  │ • System-Aware Adaptive Themes (Light Sky / Deep Dark Sky)      │  │
│  │ • Local Encrypted Credential Vault (AES-GCM Auto-Fill)          │  │
│  │ • Instant Optimistic Rendering & Pull-To-Refresh                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Execution Protocol

### Phase 1: Interactive Authentication & CAPTCHA Clearance

1. **Target Discovery:**
   - Prompt or accept the target base URL from the user (e.g. `https://portal.example.com`).
2. **Browser Automation Launch:**
   - Use an available agent browser tool (e.g. Playwright, Puppeteer, Chrome DevTools, or Firecrawl).
   - Navigate to the entry URL.
3. **Interactive Human-in-the-Loop Gate:**
   - Detect presence of authentication barriers:
     - Cloudflare Turnstile, reCAPTCHA v2/v3, hCaptcha, GeeTest
     - Multi-factor Authentication (MFA / SMS / Email OTP)
     - Username & password login forms
   - **MANDATORY RULE:** Never attempt to defeat, bypass, or spoof CAPTCHAs or 2FA mechanisms.
   - **Agent Action:** Pause and instruct the user:
     > *"Authentication or CAPTCHA detected on `<TARGET_URL>`. Please log in using the browser window. Tell me 'I have logged in' once your dashboard has loaded."*
   - Resume once the user confirms and session cookies are established.

---

### Phase 2: Autonomous DOM Audit & Route Cataloging

1. **Crawl & Catalog Authenticated Routes:**
   - For every distinct accessible page/section in the navigation:
     - Record the relative URL pattern (e.g., `/Student/Marks`, `/HR/Leaves`, `/Invoices/History`).
     - Save a full DOM snapshot to an `audit/dom/` folder:
       - Format: `audit/dom/<page_slug>.html`
     - Record network requests (XHR / Fetch endpoints, API payloads, form submit actions, anti-CSRF token hidden fields).
2. **Generate Route Map (`audit/routes.json`):**
   ```json
   {
     "targetOrigin": "https://portal.example.com",
     "routes": [
       {
         "name": "Dashboard",
         "pattern": "/Dashboard",
         "type": "summary",
         "keyElements": ["#welcome-banner", "table.stats-summary"]
       },
       {
         "name": "Records",
         "pattern": "/Records/List",
         "type": "tabular",
         "keyElements": ["table#grid-data", "select#filter-category"],
         "actions": ["form#edit-record", "input[name='__RequestVerificationToken']"]
       }
     ]
   }
   ```

---

### Phase 3: Project Scaffolding (The SuperFlex Tech Stack)

Initialize a new project workspace using the modern, zero-config extension toolchain:

```bash
# 1. Initialize WXT with React + TypeScript
bunx wxt@latest init my-modern-overlay --template react
cd my-modern-overlay

# 2. Install Core Dependencies
bun add tailwindcss @tailwindcss/vite clsx tailwind-merge class-variance-authority lucide-react zustand zod

# 3. Install Dev & Testing Tools
bun add -d vitest @testing-library/react linkedom
```

#### Directory Architecture to Enforce:
```text
src/
├── entrypoints/
│   ├── background.ts          # API requests, host permissions, key vault
│   ├── content.tsx            # Injected React overlay root & DOM observer
│   └── bridge.ts              # Native window isolation bridge
├── components/
│   ├── ui/                    # Atom components (Buttons, Modals, Cards, Toasts)
│   ├── layout/                # Modern Sidebar, Topbar, Mobile BottomNav
│   └── views/                 # Re-skinned views for each cataloged route
├── parsers/                   # Resilient HTML -> Typed Object parsers
│   ├── records.ts
│   └── dashboard.ts
├── schemas/                   # Zod definitions for all extracted entities
│   └── records.ts
├── stores/                    # Zustand client stores with persistence
│   ├── preferencesStore.ts    # Theme (light/dark), layout density
│   └── recordsStore.ts        # Cached portal entities
├── styles/
│   └── tailwind.css           # Custom theme variables & animations
└── utils/
    ├── cn.ts                  # clsx + twMerge utility
    ├── credentialVault.ts     # Web Crypto API AES-GCM local encryption
    └── domHelpers.ts          # Resilient element query helpers
```

---

### Phase 4: Resilient Parser Engineering

Legacy sites frequently lack semantic HTML (deeply nested tables, font tags, uppercase tag names). Build resilient parsers that extract clean, validated data.

#### Rules for Parsers:
1. **Never rely on fragile selector paths** like `body > div:nth-child(3) > table > tr:nth-child(4) > td:nth-child(2)`.
2. **Anchor on semantic headers or label text**: Find the `<th>` or `<td>` containing `"Status"`, compute its column index, and read subsequent row cells by index.
3. **Parse with Zod for total type safety**:
   ```typescript
   import { z } from "zod";

   export const RecordSchema = z.object({
     id: z.string().trim(),
     title: z.string().trim(),
     date: z.string().trim(),
     status: z.enum(["Active", "Pending", "Closed"]).catch("Pending"),
     amount: z.coerce.number().default(0),
   });

   export type RecordItem = z.infer<typeof RecordSchema>;

   export function parseRecordsTable(doc: Document | Element): RecordItem[] {
     const table = doc.querySelector("table.data-grid") || doc.querySelector("table");
     if (!table) return [];

     const rows = Array.from(table.querySelectorAll("tbody tr, tr"));
     return rows.slice(1).map((row) => {
       const cells = Array.from(row.querySelectorAll("td")).map(td => td.textContent?.trim() || "");
       return RecordSchema.parse({
         id: cells[0] || "",
         title: cells[1] || "",
         date: cells[2] || "",
         status: cells[3] || "Pending",
         amount: cells[4]?.replace(/[^0-9.]/g, "") || "0",
       });
     });
   }
   ```

---

### Phase 5: Presentation Hijack & Non-Destructive Overlay

The modern UI must mount cleanly over the host page **without breaking native session mechanisms**:

1. **Mount Container:**
   ```typescript
   // src/entrypoints/content.tsx
   import { createRoot } from "react-dom/client";
   import { App } from "@/components/App";
   import "@/styles/tailwind.css";

   export default defineContentScript({
     matches: ["https://portal.example.com/*"],
     cssInjectionMode: "manifest",
     runAt: "document_idle",
     main() {
       // Hide legacy body to prevent flash of unstyled content
       document.documentElement.classList.add("modern-overlay-active");

       const rootContainer = document.createElement("div");
       rootContainer.id = "modern-overlay-root";
       document.body.appendChild(rootContainer);

       const root = createRoot(rootContainer);
       root.render(<App />);
     },
   });
   ```

2. **CSS Hijack Technique:**
   ```css
   /* Hide legacy markup while retaining availability for scrapers and form posts */
   html.modern-overlay-active body > *:not(#modern-overlay-root):not(#toast-container) {
     display: none !important;
   }

   #modern-overlay-root {
     position: fixed;
     inset: 0;
     z-index: 999999;
     overflow-y: auto;
     background: var(--bg-surface);
     color: var(--text-primary);
     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
   }
   ```

3. **Seamless Form Submissions / Action Proxying:**
   - When the user triggers an action in the modern UI (e.g. submitting a form, downloading an invoice, approving a request):
     - Keep the original hidden legacy form intact.
     - Populate the hidden inputs with the modern form values.
     - Dispatch native `change` and `submit` events so legacy CSRF tokens (`__RequestVerificationToken`, session cookies) pass through smoothly.

---

### Phase 6: Dual Distribution (Extension + Mobile APK)

Ensure the modern redesign is available across platforms:

1. **Extension Distribution (Chrome / Edge / Brave):**
   - Package via `bunx wxt build` and zip the `dist/` directory.
   - Enforce least-privilege host permissions (only target portal origin + optional LLM APIs).
2. **Standalone Android App (WebView Bridge):**
   - Provide an Android WebView container that injects the compiled modern script and CSS on URL match.
   - Support mobile gestures:
     - **Pull-To-Refresh**: Native swipe-down indicator centered at top triggering page reload.
     - **Single-Line Toasts**: Floating notifications clamped to one line with ellipsis and swipe/hover dismissal.
     - **Touch Targets**: Minimum 44x44px touch areas with smooth active scaling (`active:scale-[0.98]`).

---

## 3. Verification & Quality Gate Checklist

Before declaring a modernized site complete, verify:

- [ ] **Data Fidelity:** 100% of data fields present in the legacy DOM are captured without truncation or omission.
- [ ] **Zero Layout Breakage:** Viewport behaves responsively from 360px mobile to 4K displays.
- [ ] **Non-Destructive Teardown:** Adding a "View Original Site" toggle in user settings allows instant fallback to legacy view.
- [ ] **Privacy Compliance:** All scraping and parsing happens client-side; credentials never leave the user's device.
- [ ] **Automated Testing:** DOM parsing suites written in Vitest using saved snapshots in `test/parsers/` to prevent regressions if the host site changes subtly.
