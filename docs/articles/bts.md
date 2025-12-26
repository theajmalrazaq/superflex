# Building SuperFlex:Technical Deep Dive

## 1. Background & Motivation

### The Problem Space

Super Flex is my engineering solution to a problem that affects thousands of students at my university: a legacy Learning Management System (LMS) built in the mid-2000s that has become increasingly unusable in the modern web era. The NUCES Flex portal was originally built with ASP.NET, Bootstrap 2.x, and jQuery UI—technologies that were revolutionary in 2006 but are now painfully outdated.

The core issues I identified were:

- **User Experience Crisis**: The interface uses pre-2010 design patterns with dense tables, poor visual hierarchy, and no mobile responsiveness whatsoever.
- **Information Accessibility**: Critical academic data (CGPA trends, attendance projections, grade distributions) is buried in raw HTML tables with no visualization or analytical insights.
- **Performance Problems**: Every navigation action triggers a full server-side page reload, taking 2-3 seconds even on fast connections.
- **Accessibility Gaps**: No dark mode support, poor contrast ratios, tiny fonts, and zero consideration for modern accessibility standards.
- **Browser Compatibility**: The portal relies on deprecated jQuery plugins and uses inline onclick handlers that conflict with modern CSP policies.

### Why Not Wait for Official Updates?

The university's IT infrastructure moves slowly. Getting approval for a full portal rewrite would take years of bureaucratic process. I realized that rather than waiting for institutional change, I could leverage browser extension technology to **inject a modern interface directly** on the client side, transforming the experience without touching the server.

This led to the concept I now call the **"Parasitic Overlay"** architecture: a system that hijacks an existing web application by removing its styles, scraping its data, and rendering a completely new interface on top of the original DOM structure.

### Evolution Timeline

**Phase 1: Console Script (2023)**
I started with a simple JavaScript snippet I would paste into the browser console. It would scan the marks table, extract values, calculate weighted averages, and display the result. It worked, but required manual execution every time.

**Phase 2: HTML/CSS/JS Injection (Early 2024)**
I evolved this into a bookmarklet that injected a floating panel with basic HTML and CSS. This panel would generate a simple report card with total marks and attendance percentages. The limitation? Every time the user refreshed the page, the panel disappeared.

**Phase 3: Version 1 - React Migration (Mid 2024)**
I realized I needed persistent state management and proper component architecture. I migrated to React and built it as a Chrome extension. V1 introduced a modern UI with Tailwind CSS, real-time state updates, and navigation handling. However, I took several architectural shortcuts that led to critical bugs.

**Phase 4: Version 2 - Architectural Rewrite (Late 2024)**
Community feedback revealed calculation errors in SGPA logic (#7), incorrect grand totals (#2), and the legacy UI bleeding through my overlay (#6). The root cause was my naive approach to data synchronization. V2 represents a complete architectural rewrite with proper separation of concerns, a data service layer, and optimized rendering pipelines.

---

## 2. Introduction & Technology Stack

### Stack Selection Philosophy

My technology choices were driven by three constraints:

1. **Chrome Extension Compatibility**: Not all web frameworks work well in extension contexts.
2. **Developer Velocity**: I needed rapid iteration with minimal build overhead.
3. **Production Performance**: Students use this on low-end devices; bundle size and runtime performance mattered.

### Core Technologies

**React 19.0.0**
I chose React for several reasons:

- **Virtual DOM**: Efficient diffing prevents unnecessary DOM manipulations, crucial when overlaying on a page I don't control.
- **Hooks API**: Allows functional components with clean state management without class boilerplate.
- **Component Reusability**: Common UI patterns (stat cards, loading states) can be encapsulated and reused.
- **Ecosystem Maturity**: Libraries like react-chartjs-2 integrate seamlessly.

**Vite 4.5.0 + CRXJS Vite Plugin**
Traditional webpack configurations for Chrome extensions are notoriously complex. Vite changed the game:

- **Hot Module Replacement (HMR)**: Changes reflect in <50ms during development, essential for rapid UI iteration.
- **ESM-First**: Native support for ES modules eliminates transpilation overhead during development.
- **Rollup-Based Production**: Optimized bundling with tree-shaking and code splitting.
- **CRXJS Magical Integration**: Automatically processes manifest.json, handles resource bundling, and enables extension auto-reload.

The development experience went from "save → wait 10s → reload extension → navigate to page" to "save → instant update." This 10x improvement in feedback loop was transformative.

**Tailwind CSS 4.1.13**
CSS-in-JS solutions like styled-components introduce runtime overhead. Tailwind generates all styles at build time:

- **Utility-First**: Building UIs by composing atomic classes (flex, items-center, gap-2) is faster than writing custom CSS.
- **JIT Compilation**: Tailwind 3+ generates only the classes actually used in the project, resulting in ~15KB final CSS.
- **Dark Mode**: Built-in dark:{class} utilities make theming trivial.
- **No Style Bleeding**: Since I purge legacy CSS, there are no specificity conflicts.

**Puter.js**
For AI integration, I evaluated OpenAI API, Anthropic Claude, and Google Gemini. All require API key management. Puter.js was chosen because:

- **OAuth Authentication**: Users sign in once; no API keys to secure or rotate.
- **Multi-Model Access**: One interface for GPT-4o, Claude 3.5, Gemini 2.0.
- **Free Tier**: Students can use AI features without credit card requirements.
- **Streaming Support**: Token-by-token responses provide better UX than waiting for full completion.

**Umami Analytics**
Traditional analytics (Google Analytics) violate Chrome's CSP. Umami is:

- **Self-Hosted**: I bundle the tracking script with the extension.
- **Privacy-Focused**: No cookies, no fingerprinting, no PII collection.
- **Lightweight**: 2KB gzipped tracking script.

---

## 3. Architecture Deep Dive

### The Three-World Problem

Chrome extensions operate in three isolated JavaScript execution contexts, each with different capabilities and restrictions. Understanding this is critical to comprehending Super Flex's architecture.

**1. Main World (Original Page Context)**
This is the JavaScript environment where the original Flex portal's scripts execute. When I inject Puter.js here, it becomes accessible as `window.puter`. Legacy jQuery code also lives here.

_Capabilities:_ Full access to window object, can modify global variables, can load external libraries.  
_Restrictions:_ Chrome extension APIs are not available.

**2. Isolated World (Content Script Context)**
This is where my React application runs. Chrome deliberately isolates this environment to prevent malicious extensions from tampering with page scripts.

_Capabilities:_ Full React, DOM manipulation, chrome.runtime APIs.  
_Restrictions:_ Cannot access `window` variables from Main World (e.g., cannot directly call `window.puter.ai.chat()`).

**3. Background Service Worker**
A persistent background script that handles cross-tab messaging and can intercept network requests.

_Capabilities:_ chrome.* APIs, persistent state, network interception.  
*Restrictions:\* No DOM access, no UI rendering.

### Architectural Layers

```
┌───────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                        │
│  React Components (HomePage, MarksPage, AttendancePage, etc.) │
│  • Purely presentational                                      │
│  • Receives data via props                                    │
│  • Fires events upward via callbacks                          │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                      STATE LAYER                              │
│  React Context + useAiSync Hook                               │
│  • Manages application state & AI context synchronization     │
│  • LocalStorage persistence for chat and sync timestamps      │
│  • Triggers re-renders and bridge events when data changes    │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                    SERVICE LAYER                              │
│  Data Fetching & Scraping Logic                               │
│  • fetch() calls to portal endpoints                          │
│  • DOMParser-based HTML parsing                               │
│  • Data transformation (HTML → JSON)                          │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌───────────────────────────────────────────────────────────────┐
│                    BRIDGE LAYER                               │
│  Main World ↔ Isolated World Communication                    │
│  • CustomEvent-based messaging                                │
│  • Handles Puter.js AI requests/responses                     │
│  • Usage data and Authentication management                   │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow: Example Walkthrough

Let me trace a complete data flow from user action to UI update:

1. **User clicks "Attendance" in navigation** → React's onClick handler fires
2. **PathRouter updates currentPath state** → Triggers re-render
3. **AttendancePage component mounts** → useEffect runs
4. **Service layer fetches /Student/StudentAttendance** → fetch() with credentials
5. **HTML response parsed with DOMParser** → Extract table rows
6. **Data transformed to JSON array** → `[{ course: 'CS101', present: 45, absent: 3, percentage: 93.75 }, ...]`
7. **State context updated** → All subscribed components re-render
8. **AttendancePage receives new data** → Renders table and charts
9. **Event dispatched via `useAiSync` hook** → `superflex-data-updated` with localized data context
10. **SuperFlexAI component updates** → AI now has latest context from `window.superflex_ai_context`

---

## 4. Content Script Injection

### The CSS Lobotomy Strategy

The legacy Flex portal loads two massive stylesheets:

- `/Assets/vendors/base/vendors.bundle.css` (800KB, includes Bootstrap 2.3.2 and jQuery UI themes)
- `/Assets/demo/demo3/base/style.bundle.css` (200KB, custom portal styles)

These stylesheets define global styles that conflict catastrophically with modern CSS frameworks. For example, Bootstrap 2.x sets `box-sizing: content-box` globally, while Tailwind assumes `border-box`. Simply having both active causes layout explosions.

**My solution:** Aggressive stylesheet removal before React mounts.

```javascript
// Remove legacy CSS and UI, inject React root
document
  .querySelectorAll('link[href*="bundle.css"]')
  .forEach((el) => el.remove());
document
  .querySelectorAll("header, .m-aside-left, .m-footer")
  .forEach((el) => el.remove());

const root = document.createElement("div");
root.id = "react-chrome-app";
document.body.prepend(root);
createRoot(root).render(<App />);
```

**Why This Works:**

- The underlying HTML forms, links, and hidden inputs remain intact. Session cookies and CSRF tokens are preserved.
- Removing CSS doesn't break JavaScript functionality. Legacy jQuery code still runs.
- By prepending my container to body, my overlay renders before legacy content in paint order.

### Script Injection Pipeline

I need to inject multiple dependencies in a specific order:

```javascript
// Inject scripts in specific order: polyfill → puter → bridge → analytics
["polyfill.js", "puter.js", "bridge.js", "umami.js"].forEach((file) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(file);
  document.head.appendChild(script);
});
```

**Critical Ordering:**

1. **polyfill.js first** → Defines `ReadableStream` global
2. **puter.js second** → Reads polyfilled APIs during initialization
3. **bridge.js third** → Assumes `window.puter` exists
4. **umami.js** → Can load anytime (independent)

---

## 5. Navigation & Routing System

### The Phantom Router Pattern

Traditional SPA routers (React Router, Wouter) use `pushState` or `replaceState` to change URLs without page reloads. This doesn't work in Super Flex because:

- I don't control the server. If I change the URL to `/Student/FakePage`, the next real navigation triggers a 404.
- The legacy portal uses full page reloads. Clicking "Transcript" in the original menu (if it existed) would reload the entire page.

**My solution:** A "Phantom Router" that reacts to URL changes rather than causing them.

The router detects session expiry by scanning for error keywords, listens for browser navigation events, and maps URL paths to React components.

**Navigation Flow:**

1. User clicks a link in my custom NavBar
2. If it's an internal route (tab switch), I prevent default and update state
3. If it's an external route (Transcript), I allow the browser to navigate normally
4. Page reloads, content script re-initializes in <100ms
5. PathRouter detects new URL, renders appropriate component

This creates the _illusion_ of SPA navigation while respecting the server's routing.

---

## 6. AJAX Loading & Data Fetching

### The "HTML as API" Paradigm

The Flex portal has no REST API, no GraphQL endpoint, no data export. The _only_ way to access data is to request the HTML page and scrape it. Fortunately, since my extension runs on the same origin, I inherit the user's session cookies automatically.

**Fetching Strategy:**

**Fetching Strategy:** I use `fetch()` with `credentials: 'include'` to inherit session cookies, then parse the HTML response with `DOMParser` to extract table data using `querySelector`.

**Why DOMParser Instead of Regex:**
Parsing HTML with regex is famously problematic. `DOMParser` creates a real DOM tree, allowing me to use `querySelector` and `querySelectorAll` as if I were on the actual page.

**Session Handling:**
The `credentials: 'include'` flag ensures cookies are sent. If the session expires, the server returns a 302 redirect to the login page. I detect this by checking if the response HTML contains "login" or "authentication required" keywords.

---

## 7. Analytics Integration

### The CSP Dilemma

Chrome extensions enforce a strict Content Security Policy:

```
default-src 'self'; script-src 'self'; connect-src *;
```

This means:

- ❌ Cannot load scripts from external domains (e.g., `https://www.googletagmanager.com/gtag/js`)
- ❌ Cannot use inline `<script>` tags with code
- ✅ Can load scripts bundled with the extension

**The Self-Hosting Solution:** I download Umami's script during build time, bundle it with the extension, and inject it as a local resource to comply with CSP restrictions.

**What I Track:**

- Page views (which Flex pages users visit most)
- Session duration
- Extension version adoption (to measure update rollout)
- Browser/OS distribution (to prioritize compatibility fixes)

**What I Don't Track:**

- Student names, IDs, or grades (PII)
- Individual marks or attendance percentages
- Any data that could identify a specific user

---

## 8. AI Integration with Puter.js

### The Bridge Communication Pattern

This was the most complex technical challenge. My React app needs to call `window.puter.ai.chat()`, but due to Chrome's isolation model, `window.puter` is undefined in the content script context.

**Architecture:**

```
┌──────────────────────────────────────────────────────┐
│  ISOLATED WORLD (Content Script - React App)         │
│                                                      │
│  document.dispatchEvent(                             │
│    new CustomEvent('superflex-ai-query', {           │
│      detail: { id: '123', prompt: 'Calculate CGPA' } │
│    })                                                │
│  );                                                  │
└──────────────────────────────────────────────────────┘
                        │
                        │ DOM Event Boundary
                        ▼
┌──────────────────────────────────────────────────────┐
│  MAIN WORLD (bridge.js - Injected Script)            │
│                                                      │
│  document.addEventListener('superflex-ai-query',     │
│    async (e) => {                                    │
│      const response = await window.puter.ai.chat(    │
│        e.detail.prompt                               │
│      );                                              │
│      document.dispatchEvent(                         │
│        new CustomEvent('superflex-ai-response', {    │
│          detail: { id: e.detail.id, text: response } │
│        })                                            │
│      );                                              │
│    }                                                 │
│  );                                                  │
└──────────────────────────────────────────────────────┘
                        │
                        │ DOM Event Boundary
                        ▼
┌──────────────────────────────────────────────────────┐
│  ISOLATED WORLD (Content Script - React App)         │
│                                                      │
│  document.addEventListener('superflex-ai-response',  │
│    (e) => {                                          │
│      if (e.detail.id === '123') {                    │
│        setAiResponse(e.detail.text);                 │
│      }                                               │
│    }                                                 │
│  );                                                  │
└──────────────────────────────────────────────────────┘
```

**Bridge Implementation (public/bridge.js):**

```javascript
// Bridge: Listen for AI queries from React, call Puter.js, stream responses back
document.addEventListener("superflex-ai-query", async (e) => {
  const { id, prompt, model } = e.detail;

  const stream = await window.puter.ai.chat(prompt, { 
    model: model || "gpt-4o-mini",
    stream: true 
  });

  for await (const chunk of stream) {
    if (activeRequestId === id) { // Verify request still active
      document.dispatchEvent(
        new CustomEvent("superflex-ai-response", {
          detail: { id, text: chunk.text },
        }),
      );
    }
  }
});
```

**React Component:** Generates a unique request ID, sets up a response listener that accumulates streamed tokens, handles errors (including auth triggers), and dispatches the AI query event with the constructed context.

### Context Assembly

The AI needs academic data to be useful. I construct a structured context:

The AI needs context to be useful. I construct a structured prompt that includes student profile, current marks, attendance, transcript history, and the user's query, all formatted as JSON within a system message.

---

## 9. Build System & Bundling

### Vite + CRXJS Configuration

I use Vite with CRXJS for automated manifest processing and code splitting. Heavy libraries like Chart.js are bundled separately to optimize initial load time.

### Dynamic Import Issues

One major hurdle was Puter.js's dependency on `web-streams-polyfill` and `rustls`. The library originally tried to dynamically import these from a CDN, which violates Chrome Extension CSP.

**Solution:** I downloaded these dependencies locally to the `/public/scripts/` directory, bundled them with the extension, and patched `puter.js` to import them from the same directory using relative paths. This makes the extension fully self-contained and compliant with strict security policies.

---

## 10. Security Considerations

### Authentication Model

I never store or transmit credentials. The flow is:

1. User logs into the Flex portal normally (I don't touch the login page)
2. Browser stores session cookies (httpOnly, Secure, SameSite)
3. My extension reads data using those cookies
4. If the session expires, I detect it and gracefully degrade to showing the login page

Session expiry is detected by scanning the page text for error keywords like "server error" or "session expired."

### Data Storage

**What I Store in localStorage:**

- AI chat history (messages array)
- User preferences (theme, selected AI model)
- Permission status (whether user allowed data sharing with AI)
- Last sync timestamps (to avoid redundant fetches)

**What I Don't Store:**

- Passwords or credentials
- Raw HTML responses
- Session tokens (these live in httpOnly cookies I can't access)

### CSP Compliance

By self-hosting all dependencies (Umami, Puter, polyfills), I ensure:

- No external script loads (violates CSP)
- No eval() usage (blocked in extensions)
- No inline scripts (CSP violation)

All code is bundled at build time and served from `chrome-extension://` URLs.

---

## 11. Guide: Converting Legacy Websites

### Step 1: Reconnaissance

Before writing code, spend time understanding the target system:

- **Inspect Network Traffic**: Open DevTools → Network tab while navigating. Note which endpoints return data.
- **Analyze HTML Structure**: Use Elements tab to identify stable selectors (classes, IDs) for scraping.
- **Test Session Persistence**: Clear cookies, log in, inspect cookie attributes (Secure, HttpOnly, SameSite).
- **Check for CSRF Protection**: Look for hidden `__RequestVerificationToken` fields or X-CSRF-Token headers.

### Step 2: Stylesheet Isolation

Remove problematic legacy styles by querying all `<link>` tags and removing those matching specific patterns (e.g., Bootstrap, old themes).

### Step 3: Build a Minimal Router

Start with a simple path-based router that reads `window.location.pathname` and renders the appropriate component.

### Step 4: Scrape Incrementally

Don't try to scrape everything at once. Use `fetch()` with `credentials: 'include'`, parse the HTML with `DOMParser`, and extract one data source at a time using `querySelector`.

### Lessons Learned

1. **Don't Fight the Platform**: If the site uses server-side routing, don't try to force SPA behavior. Embrace page reloads.
2. **DOMParser is Your Friend**: It's safer and more reliable than regex for HTML scraping.
3. **Graceful Degradation**: If a scrape fails, show a helpful error instead of crashing.
4. **Version Your Scraping Logic**: Websites change. Tag your selectors with comments explaining what they target.

---

## Closing Thoughts

Building Super Flex taught me that even the most antiquated systems can be modernized without backend access. The "Parasitic Overlay" architecture is replicable for any legacy application that:

- Uses server-rendered HTML (not heavy client-side JavaScript)
- Has consistent URL patterns
- Allows same-origin requests
- Doesn't employ aggressive anti-scraping measures

The key insight is this: **the DOM is your API**. When official APIs don't exist, the HTML structure _is_ the data source. With `DOMParser`, `fetch`, and clever state management, you can transform any website into a modern experience.
