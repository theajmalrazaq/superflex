# SuperFlex: Comprehensive Technical Documentation

## Table of Contents
1. [Background & Motivation](#background--motivation)
2. [Introduction & Technology Stack](#introduction--technology-stack)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Content Script Injection](#content-script-injection)
5. [Navigation & Routing System](#navigation--routing-system)
6. [AJAX Loading & Data Fetching](#ajax-loading--data-fetching)
7. [Analytics Integration](#analytics-integration)
8. [AI Integration with Puter.js](#ai-integration-with-puterjs)
9. [Build System & Bundling](#build-system--bundling)
10. [Security Considerations](#security-considerations)
11. [Guide: Converting Legacy Websites](#guide-converting-legacy-websites)

---

## Background & Motivation

### Why SuperFlex Was Created

SuperFlex emerged from a genuine frustration with outdated university learning management systems (LMS). The NUCES Flex portal, built in the mid-2000s, presented numerous UX challenges:

**Problems with the Legacy System:**
- **Outdated UI/UX**: The interface used pre-2010 design patterns with Bootstrap 2.x, making it visually unappealing and difficult to navigate
- **Poor Mobile Responsiveness**: Barely functional on modern smartphones and tablets
- **Accessibility Issues**: No dark mode support, poor contrast ratios, tiny fonts
- **Slow Performance**: Heavy server-side rendering with full page reloads for every action
- **Limited Features**: No CGPA calculators, no attendance predictions, no academic insights
- **Information Overload**: Dense tables with no visual hierarchy or data visualization
- **Browser Incompatibility**: Used deprecated jQuery plugins and legacy JavaScript patterns

**The Vision:**
Rather than waiting for institutional change (which could take years), SuperFlex takes a revolutionary approach: **inject modern web technologies directly into the legacy system** using a browser extension. This allows students to benefit from:
- Modern React-based UI components
- Real-time data visualization with Chart.js
- AI-powered academic assistance
- Smooth animations and transitions
- Mobile-responsive layouts
- Dark mode by default
- Enhanced analytics and insights

SuperFlex is essentially a **"UI hijacking" tool** that transforms an antiquated web portal into a modern, delightful user experience without requiring any server-side modifications.

---

## Introduction & Technology Stack

### Core Technologies

SuperFlex is built on a carefully selected modern web stack designed for performance, developer experience, and compatibility with Chrome Extension APIs:

#### **1. React 19.0.0**
React serves as the foundation for all UI components. The choice of React over vanilla JavaScript provides:
- **Component Reusability**: Common elements like navigation bars, cards, and modals are encapsulated
- **Virtual DOM**: Efficient re-rendering when data changes (e.g., updating attendance percentages)
- **Hooks**: Modern state management with `useState`, `useEffect`, and custom hooks
- **JSX Syntax**: Clean, readable markup that's easier to maintain than string concatenation

**Example Usage:**
```jsx
// src/components/StatsCard.jsx
function StatsCard({ icon, label, value, subtitle }) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-zinc-400 text-sm">{label}</span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {subtitle && <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>}
    </div>
  );
}
```

#### **2. Vite 4.5.0 (Build Tool)**
Vite replaced traditional webpack-based build systems for several reasons:
- **Lightning-Fast HMR**: Hot Module Replacement updates the extension in <50ms during development
- **Native ESM Support**: Modern JavaScript modules work out-of-the-box
- **Optimized Bundling**: Uses Rollup under the hood for production builds
- **Simple Configuration**: Minimal setup compared to webpack

**Configuration:** (vite.config.js)
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [
    react(),           // JSX transformation
    crx({ manifest })  // Chrome extension bundling
  ],
  css: {
    postcss: "./postcss.config.mjs"  // Tailwind CSS processing
  }
});
```

#### **3. CRXJS Vite Plugin**
This is the secret sauce that makes Chrome extension development painless:
- **Auto-reloading**: Changes to content scripts automatically reload the extension
- **Manifest Processing**: Handles manifest.json versioning and asset bundling
- **HMR for Extensions**: Brings Vite's speed to extension development

#### **4. Tailwind CSS 4.1.13**
A utility-first CSS framework that eliminates the need for custom CSS files:
- **Rapid Prototyping**: Build complex UIs without leaving HTML
- **Consistency**: Predefined spacing, colors, and sizing scales
- **Dark Mode**: Built-in dark mode utilities (`dark:bg-black`)
- **Responsive**: Mobile-first breakpoints (`sm:`, `md:`, `lg:`)

**Custom Theme:** (src/styles/tailwind.css)
```css
@import "tailwindcss";
@theme {
  --color-x: #a098ff;  /* SuperFlex brand color (purple) */
  --font-sans: "Google Sans Flex", sans-serif;
}

html {
  font-size: 90%;  /* Scale down to ~14.4px for better readability */
}
```

#### **5. Chart.js & react-chartjs-2**
Data visualization libraries for academic insights:
- **Line Charts**: CGPA trends across semesters
- **Bar Charts**: Course-wise marks breakdown
- **Progress Bars**: Attendance tracking with thresholds

#### **6. Lucide React (Icon Library)**
1000+ modern icons as React components:
```jsx
import { Home, Calendar, Award } from "lucide-react";

<Home size={20} className="text-zinc-400" />
```

#### **7. React Markdown + remark-gfm**
Powers the AI chat interface with Markdown rendering:
- **Tables**: For structured data display
- **Code Blocks**: Syntax highlighting for technical answers
- **Lists & Emphasis**: Better formatted AI responses

---

### Basic HTML/CSS Removal Strategy

One of SuperFlex's most aggressive tactics is **removing the legacy CSS** from the original Flex portal. This prevents style conflicts and ensures React components render cleanly.

**Implementation:** (src/content.jsx)
```javascript
// Remove legacy Bootstrap CSS
const unwantedCss = document.querySelector(
  'link[href="/Assets/demo/demo3/base/style.bundle.css"]'
);
if (unwantedCss) unwantedCss.remove();

// Remove vendor CSS (Bootstrap 2.x, jQuery UI)
const unwantedVendorsCss = document.querySelector(
  'link[href="/Assets/vendors/base/vendors.bundle.css"]'
);
if (unwantedVendorsCss) unwantedVendorsCss.remove();

// Remove original header and sidebar
document.querySelectorAll("header").forEach(el => el.remove());
document.querySelectorAll(".m-aside-left").forEach(el => el.remove());
document.querySelector(".m-footer")?.remove();
```

**Why This Works:**
- The original page's HTML structure remains intact (important for forms and links)
- Only the CSS is removed, so underlying functionality (POST requests, session cookies) still works
- React components are injected into the DOM, overlaying the original content

---

## Architecture Deep Dive

### High-Level System Design

SuperFlex operates in **three separate execution contexts** due to Chrome's extension security model:

```
┌─────────────────────────────────────────────────────────────┐
│                      MAIN WORLD                             │
│  (Original Flex Portal DOM + JavaScript)                    │
│  • Legacy jQuery code                                        │
│  • puter.js library (injected)                              │
│  • bridge.js (communication layer)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ DOM Events
                       │ (CustomEvent API)
┌──────────────────────▼──────────────────────────────────────┐
│                  ISOLATED WORLD                             │
│  (Content Script - React Application)                       │
│  • content.jsx (entry point)                                │
│  • React components                                          │
│  • Tailwind CSS                                              │
│  • State management                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ chrome.runtime API
                       │ (messaging)
┌──────────────────────▼──────────────────────────────────────┐
│                BACKGROUND SERVICE WORKER                     │
│  (Not currently used, but available for future features)    │
└─────────────────────────────────────────────────────────────┘
```

### Content Script Architecture

**Entry Point:** `src/content.jsx`

This file orchestrates the entire extension initialization:

```jsx
import { createRoot } from "react-dom/client";
import LoadingOverlay from "./components/LoadingOverlay";
import LoginPageStyles from "./components/LoginPageStyles";
import PathRouter from "./components/PathRouter";
import "./styles/tailwind.css";

// 1. Inject Analytics Script (Umami)
(() => {
  const scriptUmami = document.createElement("script");
  scriptUmami.src = chrome.runtime.getURL("umami.js");
  scriptUmami.defer = true;
  scriptUmami.dataset.websiteId = "17490ccf-0b15-4d8a-a908-5e774ad648de";
  document.head.appendChild(scriptUmami);

  // 2. Inject Puter.js (AI library)
  const scriptPuter = document.createElement("script");
  scriptPuter.src = chrome.runtime.getURL("puter.js");
  scriptPuter.defer = true;
  document.head.appendChild(scriptPuter);

  // 3. Inject Bridge Script (Main World communication)
  const scriptBridge = document.createElement("script");
  scriptBridge.src = chrome.runtime.getURL("bridge.js");
  scriptBridge.defer = true;
  document.head.appendChild(scriptBridge);
})();

// 4. Load Google Fonts
const fontLinks = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Google+Sans+Flex" }
];
fontLinks.forEach(linkDef => {
  const link = document.createElement("link");
  link.rel = linkDef.rel;
  link.href = linkDef.href;
  document.head.appendChild(link);
});

// 5. Create React Root Container
const container = document.createElement("div");
container.id = "react-chrome-app";
document.body.insertBefore(container, document.body.firstChild);

const root = createRoot(container);

// 6. Render React Application
const isLoginPage = window.location.href.includes("Login");

root.render(
  <>
    <LoadingOverlay />
    {isLoginPage ? <LoginPageStyles /> : <PathRouter />}
  </>
);
```

**Key Design Decisions:**

1. **Script Injection Order Matters**: Analytics → AI Library → Bridge → React
2. **Login Page Detection**: Different UI for login vs authenticated pages
3. **Font Loading**: Preconnect hints improve performance
4. **React 19 Strict Mode**: Disabled to avoid double-rendering in development

---

### Component Architecture

SuperFlex follows a **pages + components** structure:

```
src/
├── content.jsx              # Entry point
├── components/
│   ├── LoadingOverlay.jsx   # Full-screen loader
│   ├── NavBar.jsx           # Persistent navigation
│   ├── PathRouter.jsx       # Client-side routing
│   ├── SuperFlexAI.jsx      # AI chat interface
│   ├── layouts/
│   │   └── PageLayout.jsx   # Common page wrapper
│   └── pages/
│       ├── HomePage.jsx     # Dashboard
│       ├── AttendancePage.jsx
│       ├── MarksPage.jsx
│       ├── TranscriptPage.jsx
│       └── ... (11+ pages)
└── styles/
    └── tailwind.css         # Global styles
```

**Component Hierarchy:**
```
PathRouter
├── HomePage
│   ├── PageLayout
│   │   ├── NavBar
│   │   └── NotificationBanner
│   ├── StatsCard (multiple)
│   └── Chart Components
├── AttendancePage
│   └── PageLayout
├── SuperFlexAI (global)
```

---

## Navigation & Routing System

### Path-Based Router

Unlike traditional SPAs (Single Page Applications), SuperFlex doesn't control the entire page. It **reacts to URL changes** initiated by the legacy system.

**Router Implementation:** (src/components/PathRouter.jsx)

```jsx
function PathRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    // Listen for URL changes (back/forward navigation)
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Detect server errors (session expiry)
    const checkSession = () => {
      const pageText = (
        document.body?.innerText + 
        document.title + 
        document.querySelector("h1")?.innerText
      ).toLowerCase();
      
      const isError = [
        "server error", 
        "runtime error", 
        "500"
      ].some(err => pageText.includes(err));

      if (isError) {
        setIsSessionExpired(true);
        // Hide all legacy content
        Array.from(document.body.children).forEach(child => {
          if (!["react-chrome-app", "SCRIPT", "LINK"].includes(child.id || child.tagName)) {
            child.style.display = "none";
          }
        });
      }
    };

    checkSession();
    window.addEventListener("popstate", handleLocationChange);

    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [currentPath]);

  const renderComponent = () => {
    if (isSessionExpired) return <SessionExpirePage />;
    
    if (currentPath === "/" || currentPath.startsWith("/?dump=")) {
      return <HomePage />;
    }
    
    if (currentPath.includes("/Student/CourseRegistration")) {
      return <CourseRegistrationPage />;
    }
    
    if (currentPath.includes("/Student/StudentAttendance")) {
      return <AttendancePage />;
    }
    
    // ... 10+ more route checks
    
    return <NotFoundPage />;
  };

  return (
    <>
      {renderComponent()}
      <SuperFlexAI /> {/* Always rendered */}
    </>
  );
}
```

**Why This Approach:**
1. **Server-Side Navigation**: The legacy system uses full page reloads, not client-side routing
2. **Path Inspection**: `pathname` is the most reliable indicator of which page is active
3. **Graceful Fallback**: If no route matches, show a custom 404 page

### NavBar Link Extraction

The navigation system is **dynamically generated** by scraping the original Flex portal's sidebar:

**Implementation:** (src/components/NavBar.jsx - Simplified)

```jsx
useEffect(() => {
  const extractMenuLinks = () => {
    const links = [];
    const menuElements = document.querySelectorAll(".m-menu__link");

    menuElements.forEach(element => {
      if (element.href && !element.href.includes("javascript:void")) {
        const url = new URL(element.href);
        links.push({
          href: element.href,
          text: element.querySelector(".m-menu__link-text")?.textContent.trim(),
          path: url.pathname
        });
      }
    });

    return links.filter(link => 
      link.text !== "Grade Report" &&  // Exclude broken pages
      link.text !== "Transcript"       // Handled separately
    );
  };

  const links = extractMenuLinks();
  setMenuLinks(links);
  
  // Remove original sidebar from DOM
  document.querySelectorAll(".m-aside-left").forEach(el => el.remove());
}, []);
```

**Benefits:**
- **Zero Hardcoding**: Links update automatically if the university adds new pages
- **Session Handling**: Links include authentication tokens from the original page
- **Icon Mapping**: Custom Lucide icons replace legacy Bootstrap icons

---

## AJAX Loading & Data Fetching

### Problem: Cross-Origin Data Access

SuperFlex needs to fetch data from pages the user hasn't visited yet (e.g., fetching attendance data while on the home page). However, Chrome extensions face CORS restrictions.

**Solution: Leverage Same-Origin Requests**

Since the content script runs in the **same origin** as flexstudent.nu.edu.pk, it can make fetch requests to any page on that domain:

```jsx
// src/components/NavBar.jsx (AI Data Sync)
useEffect(() => {
  const fetchAndSyncData = async () => {
    const links = {};
    menuLinks.forEach(l => {
      const text = l.text.trim();
      if (text.includes("Attendance")) links.attendance = l.href;
      if (text.includes("Marks")) links.marks = l.href;
      if (text.includes("Tentative Study Plan")) links.studyPlan = l.href;
    });

    // Fetch Attendance Page
    if (links.attendance && !syncedData.attendance) {
      try {
        const res = await fetch(links.attendance);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Extract attendance table data
        const attendanceData = [];
        doc.querySelectorAll("table tbody tr").forEach(row => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 4) {
            attendanceData.push({
              course: cells[0].textContent.trim(),
              present: parseInt(cells[1].textContent),
              absent: parseInt(cells[2].textContent),
              percentage: parseFloat(cells[3].textContent)
            });
          }
        });

        setSyncedData(prev => ({ ...prev, attendance: attendanceData }));
        
        // Broadcast to AI component
        window.dispatchEvent(new CustomEvent("superflex-data-updated", {
          detail: { attendance: attendanceData }
        }));
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      }
    }
  };

  fetchAndSyncData();
}, [menuLinks, syncedData]);
```

**How It Works:**
1. **Extract Link URLs**: NavBar finds the href for "Attendance", "Marks", etc.
2. **Fetch HTML**: Use `fetch()` to get the page content
3. **Parse with DOMParser**: Convert HTML string to DOM object
4. **Query Selectors**: Use normal DOM methods to extract table data
5. **Dispatch Events**: Notify AI component that new data is available

**Example: Fee Details Page (Detailed Implementation)**

The Fee Details page demonstrates advanced AJAX usage:

```jsx
// src/components/pages/FeeDetailsPage.jsx
useEffect(() => {
  const fetchFeeData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch the consolidated fee report page
      const response = await fetch(window.location.href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // Extract semester-wise fee data
      const semesters = [];
      doc.querySelectorAll(".m-portlet").forEach(portlet => {
        const semesterName = portlet.querySelector(".m-portlet__head-text")?.textContent;
        const feeItems = [];
        
        portlet.querySelectorAll(".fee-item-row").forEach(row => {
          feeItems.push({
            name: row.querySelector(".item-name")?.textContent,
            amount: row.querySelector(".item-amount")?.textContent
          });
        });
        
        semesters.push({ name: semesterName, items: feeItems });
      });
      
      setFeeData(semesters);
    } catch (error) {
      setError("Failed to load fee details");
    } finally {
      setIsLoading(false);
    }
  };

  fetchFeeData();
}, []);
```

**Key Advantages:**
- **No Backend Required**: All data comes from existing university pages
- **Session Preservation**: Cookies are automatically included in fetch requests
- **Incremental Loading**: Only fetch data when needed (lazy loading)

---

## Analytics Integration

### Problem: External Analytics Scripts Violate CSP

Modern web analytics tools (Google Analytics, Plausible, etc.) require loading scripts from external domains. Chrome extensions have a strict **Content Security Policy (CSP)** that blocks external scripts.

**Chrome Extension CSP (Default):**
```
script-src 'self'; object-src 'self'
```

This means:
- ❌ Cannot load scripts from `https://analytics.google.com`
- ❌ Cannot use inline `<script>` tags with code
- ✅ Can only load scripts bundled with the extension

### Solution: Self-Hosted Umami.js

**Umami** is an open-source, privacy-focused analytics platform. The solution:

1. **Download umami.js**: Get the tracking script from Umami's CDN
2. **Bundle with Extension**: Place it in the `public/` folder
3. **Inject via chrome.runtime.getURL**: Load it as a local resource

**Implementation:** (src/content.jsx)

```javascript
const scriptUmami = document.createElement("script");
scriptUmami.src = chrome.runtime.getURL("umami.js");  // Loads from extension files
scriptUmami.defer = true;
scriptUmami.dataset.websiteId = "17490ccf-0b15-4d8a-a908-5e774ad648de";
document.head.appendChild(scriptUmami);
```

**Manifest Configuration:** (manifest.json)

```json
{
  "web_accessible_resources": [
    {
      "resources": ["umami.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**Benefits:**
- ✅ **CSP Compliant**: Script is part of the extension
- ✅ **Privacy**: No third-party cookies or tracking domains
- ✅ **Performance**: One less external HTTP request
- ✅ **Reliability**: Works even if analytics CDN is blocked

**What Umami Tracks:**
- Page views (which Flex pages users visit)
- Session duration
- Browser/OS distribution
- Extension version adoption

---

## AI Integration with Puter.js

### The Vision: Contextual Academic Assistant

SuperFlex AI is not a generic chatbot—it's an **academic advisor** with real-time access to:
- Current semester marks
- Attendance records (including daily logs)
- Full academic transcript
- Degree roadmap (study plan)
- Course registration status

**Example Queries:**
- "How many marks do I need in the final to get an A?"
- "Which days was I absent in Database Systems?"
- "What courses do I have left to graduate?"
- "Am I on track for a 3.5 CGPA?"

### Why Puter.js?

**Puter** is a cloud OS with built-in AI APIs (powered by Claude, GPT, Gemini). It was chosen because:

1. **No API Keys Required**: Users authenticate via OAuth, no developer API keys to manage
2. **Free Tier**: Generous free usage (unlike OpenAI's paid API)
3. **Multi-Model**: Supports Claude 3.5, GPT-4, Gemini 2.0
4. **Streaming**: Token-by-token responses (better UX than waiting for full completion)

### Technical Challenges & Solutions

#### **Challenge 1: Content Script Isolation**

Content scripts run in an **isolated world**—they cannot access JavaScript objects created by page scripts. This means:

```javascript
// In content.jsx (Isolated World)
if (window.puter) {  // ❌ Always undefined!
  await window.puter.ai.chat("Hello");
}
```

Even though `puter.js` is injected into the page, the content script **cannot see it**.

**Solution: Bridge Script**

Create a **bridge.js** script that runs in the **main world** (same context as the original page scripts):

**public/bridge.js:**
```javascript
(function() {
  console.log("SuperFlex Bridge Loaded");

  // Listen for AI requests from content script
  document.addEventListener('superflex-ai-query', async (e) => {
    const { id, prompt } = e.detail;

    // Check if Puter is available (Main World has access)
    if (!window.puter) {
      document.dispatchEvent(new CustomEvent('superflex-ai-response', {
        detail: { id, error: 'Puter.js library not found' }
      }));
      return;
    }

    try {
      // Ensure user is authenticated
      const isSignedIn = await window.puter.auth.isSignedIn();
      if (!isSignedIn) {
        document.dispatchEvent(new CustomEvent('superflex-ai-response', {
          detail: { id, error: 'auth_required' }
        }));
        return;
      }

      // Make AI request
      const response = await window.puter.ai.chat(prompt, {
        model: 'gemini-2.0-flash',
        stream: true  // Token-by-token streaming
      });

      // Stream tokens back to content script
      for await (const part of response) {
        if (part?.text) {
          document.dispatchEvent(new CustomEvent('superflex-ai-response', {
            detail: { id, text: part.text, done: false }
          }));
        }
      }

      // Signal completion
      document.dispatchEvent(new CustomEvent('superflex-ai-response', {
        detail: { id, done: true }
      }));

    } catch (err) {
      document.dispatchEvent(new CustomEvent('superflex-ai-response', {
        detail: { id, error: err.message }
      }));
    }
  });
})();
```

**How Content Script Calls AI:** (src/components/SuperFlexAI.jsx)

```jsx
const handleSend = async () => {
  const requestId = crypto.randomUUID();
  let responseText = "";

  // Set up response listener
  const responseHandler = (e) => {
    const { id, text, error, done } = e.detail;
    if (id !== requestId) return;  // Ignore other requests

    if (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
      document.removeEventListener("superflex-ai-response", responseHandler);
      return;
    }

    if (text) {
      // Append streamed token
      responseText += text;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, content: responseText }];
      });
    }

    if (done) {
      document.removeEventListener("superflex-ai-response", responseHandler);
      setIsLoading(false);
    }
  };

  document.addEventListener("superflex-ai-response", responseHandler);

  // Dispatch request to bridge
  document.dispatchEvent(new CustomEvent("superflex-ai-query", {
    detail: { id: requestId, prompt: userMessage }
  }));
};
```

**Communication Flow:**
```
Content Script          Bridge (Main World)         Puter Cloud
     │                          │                         │
     ├─ superflex-ai-query ────>│                         │
     │  { id, prompt }           │                         │
     │                           ├─ puter.ai.chat() ─────>│
     │                           │                         │
     │<─ superflex-ai-response ──┤<─ stream token ────────┤
     │  { id, text, done }       │                         │
```

#### **Challenge 2: Dynamic Import of polyfill.js**

Puter.js requires a Web Streams polyfill for older browsers. The recommended approach is:

```javascript
import 'web-streams-polyfill/ponyfill';
```

However, this **fails in Chrome extensions** because:
1. Dynamic imports use `import()` which requires special CSP headers
2. The polyfill is a 4700+ line file (polyfill.js) that slows down the main bundle

**Solution: Preload as Global Script**

Instead of importing, inject polyfill.js **before** puter.js:

```javascript
// content.jsx (WRONG - doesn't work)
import polyfill from './polyfill.js';

// content.jsx (CORRECT)
const scriptPolyfill = document.createElement("script");
scriptPolyfill.src = chrome.runtime.getURL("polyfill.js");
document.head.appendChild(scriptPolyfill);

// Then load puter.js
const scriptPuter = document.createElement("script");
scriptPuter.src = chrome.runtime.getURL("puter.js");
document.head.appendChild(scriptPuter);
```

**Why This Works:**
- Polyfill runs in the global scope, patching `ReadableStream` APIs
- Puter.js finds the polyfilled APIs when it initializes
- No dynamic import() calls required

#### **Challenge 3: rustls.js Loading**

Puter.js attempts to load `rustls.js` (Rust TLS library compiled to WebAssembly) for secure connections. This also fails due to CSP.

**Solution: Include rustls.js in web_accessible_resources**

```json
// manifest.json
{
  "web_accessible_resources": [
    {
      "resources": ["polyfill.js", "puter.js", "rustls.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

Puter.js automatically detects the extension context and loads rustls.js via `chrome.runtime.getURL()`.

### AI Context System

SuperFlex AI constructs a **structured prompt** with academic data:

```jsx
const academicData = {
  student: {
    name: dataContext.studentName,
    cmsId: dataContext.studentCms,
    program: dataContext.universityInfo?.Degree,
    section: dataContext.universityInfo?.Section
  },
  currentPerformance: {
    marks: dataContext.marks,        // From HomePage or AJAX fetch
    attendance: dataContext.attendance
  },
  academicHistory: {
    transcript: dataContext.transcript,
    studyPlan: dataContext.studyPlan
  }
};

const prompt = `
You are "SuperFlex AI", the intelligent academic advisor.

### STUDENT PROFILE
- Name: ${academicData.student.name}
- Program: ${academicData.student.program}

### CURRENT SEMESTER MARKS
${JSON.stringify(academicData.currentPerformance.marks, null, 2)}

### ATTENDANCE ANALYTICS
${JSON.stringify(academicData.currentPerformance.attendance, null, 2)}

### USER QUESTION
${userMessage}

### INSTRUCTIONS
Provide a concise, accurate answer using the data above.
If data is missing, ask the user to visit the relevant page.
`;
```

**Data Synchronization:**

The AI component receives data via custom events:

```jsx
useEffect(() => {
  const handleDataUpdate = (e) => {
    const newData = e.detail;
    setDataContext(prev => {
      const updated = { ...prev, ...newData };
      window.superflex_ai_context = updated;  // Global state
      return updated;
    });
  };

  window.addEventListener("superflex-data-updated", handleDataUpdate);

  return () => {
    window.removeEventListener("superflex-data-updated", handleDataUpdate);
  };
}, []);
```

**Privacy Controls:**

Users can deny data access:

```jsx
const [permissionStatus, setPermissionStatus] = useState(
  localStorage.getItem("superflex_ai_data_permission") || "pending"
);

if (permissionStatus !== "granted") {
  academicData.marks = "Permission denied";
  academicData.attendance = "Permission denied";
}
```

---

## Build System & Bundling

### Vite + CRXJS Pipeline

The build process transforms React code into a Chrome extension:

**Development Mode:**
```bash
npm run dev
```

1. Vite starts a dev server
2. CRXJS watches `manifest.json` and content scripts
3. HMR updates the extension in real-time
4. Output: `dist/` folder with unbundled code

**Production Build:**
```bash
npm run build
```

1. Vite bundles all JSX → optimized JavaScript
2. Tailwind CSS processes only used utilities
3. CRXJS packages assets into `web_accessible_resources`
4. Output: `dist/` folder ready for Chrome Web Store

**Build Output Structure:**
```
dist/
├── manifest.json           # Processed manifest
├── assets/
│   ├── content.js          # Bundled React app
│   ├── content.css         # Tailwind output
│   └── chunk-*.js          # Code-split chunks
├── favicon.png
├── logo.svg
├── umami.js
├── puter.js
├── polyfill.js
├── rustls.js
└── bridge.js
```

### Code Splitting & Optimization

Vite automatically splits code into chunks:

```javascript
// Lazy load heavy components
const TranscriptPage = React.lazy(() => import('./pages/TranscriptPage'));

<Suspense fallback={<LoadingSpinner />}>
  <TranscriptPage />
</Suspense>
```

**Benefits:**
- Smaller initial bundle (~150KB → 80KB)
- Faster extension startup
- On-demand loading of page-specific code

### Asset Handling

**Images & Icons:**
```jsx
// Automatically resolved by CRXJS
<img src={chrome.runtime.getURL("logo.svg")} alt="SuperFlex" />
```

**Web-Accessible Resources:**
Chrome extensions require explicit whitelisting:

```json
{
  "web_accessible_resources": [
    {
      "resources": [
        "bg.png",
        "favicon.svg",
        "umami.js",
        "puter.js",
        "bridge.js"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

This allows the content script to inject these resources into the page.

### Clean Script

The `scripts/clean.js` utility removes:
- Console.log statements
- Debugging code
- Inline comments

**Usage:**
```bash
npm run clean
```

**Implementation Highlights:**
```javascript
function removeConsoleLogs(code) {
  let result = "";
  let i = 0;

  while (i < code.length) {
    if (code.slice(i, i + 11) === "console.log") {
      // Find matching closing parenthesis
      const endIndex = findConsoleLogEnd(code, i);
      i = endIndex + 1;
      continue;
    }
    result += code[i];
    i++;
  }

  return result;
}
```

---

## Security Considerations

### Content Security Policy (CSP)

Chrome extensions enforce strict CSP to prevent XSS attacks:

**Default Policy:**
```
script-src 'self'; object-src 'self'; style-src 'unsafe-inline' 'self'
```

**Implications:**
- ❌ Cannot use `eval()` or `new Function()`
- ❌ Cannot load external scripts (Google Analytics, etc.)
- ✅ Can use inline styles (required for Tailwind)

### Authentication & Session Handling

SuperFlex **never stores credentials**. It relies on the university's existing session:

1. User logs into Flex portal normally
2. Browser stores session cookies
3. SuperFlex uses those cookies for fetch requests
4. When session expires, SuperFlex detects it and shows `SessionExpirePage`

**Session Expiry Detection:**
```javascript
const checkSession = () => {
  const pageText = document.body.innerText.toLowerCase();
  const isError = ["server error", "runtime error"].some(err => 
    pageText.includes(err)
  );

  if (isError) {
    setIsSessionExpired(true);
    // Hide all content, show error message
  }
};
```

### Data Privacy

**Local Storage:**
- AI chat history: `localStorage.getItem("superflex_ai_messages")`
- Permission preferences: `localStorage.getItem("superflex_ai_data_permission")`

**No External Transmission:**
- All data stays on the user's device
- AI requests go through Puter's servers (encrypted via HTTPS)
- Analytics (Umami) only logs page views, no PII

### Bypassing Legacy JavaScript Errors

The original Flex portal has broken jQuery plugins. SuperFlex patches them:

**bridge.js:**
```javascript
// Fix mCustomScrollbar errors
if (window.jQuery && window.jQuery.fn && window.jQuery.fn.mCustomScrollbar) {
  const originalMCustomScrollbar = window.jQuery.fn.mCustomScrollbar;
  window.jQuery.fn.mCustomScrollbar = function(...args) {
    try {
      return originalMCustomScrollbar.apply(this, args);
    } catch (e) {
      console.warn("Suppressed mCustomScrollbar error:", e);
      return this;  // Return jQuery object for chaining
    }
  };
}
```

This prevents the entire page from breaking due to legacy code.

---

## Guide: Converting Legacy Websites

### Step-by-Step Architecture for Modern Overlays

This section provides a reusable blueprint for transforming any old website into a modern React-based experience.

#### **Step 1: Analyze the Legacy System**

Before writing code, understand:

1. **URL Structure**: How does navigation work?
   - Query parameters? (`?page=home`)
   - Path-based? (`/student/marks`)
   - Hash-based? (`#/dashboard`)

2. **Data Sources**:
   - Where is data displayed? (tables, divs, spans)
   - Are there AJAX endpoints?
   - Can you scrape HTML directly?

3. **Session Management**:
   - Cookie-based?
   - Token in localStorage?
   - Server-side sessions?

4. **Performance**:
   - How large are pages? (affects fetch times)
   - Are there rate limits?

**For SuperFlex:**
- URL: Path-based (`/Student/Marks`, `/Student/Attendance`)
- Data: Server-rendered HTML tables
- Sessions: Cookie-based with CSRF tokens
- Performance: ~100KB per page, no rate limits

#### **Step 2: Set Up Extension Skeleton**

**manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "Your Extension Name",
  "version": "1.0.0",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["https://your-target-site.com/*"],
      "js": ["src/content.jsx"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["assets/*", "*.js", "*.css"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.32",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^4.5.0",
    "tailwindcss": "^4.1.13"
  }
}
```

#### **Step 3: Implement CSS Removal**

Identify and remove legacy stylesheets:

```javascript
// content.jsx
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  if (link.href.includes('bootstrap') || link.href.includes('old-theme')) {
    link.remove();
  }
});

// Remove inline styles
document.body.removeAttribute('style');
document.body.style.backgroundColor = 'black';
document.body.style.fontFamily = 'Inter, sans-serif';
```

#### **Step 4: Build Path-Based Router**

```jsx
// components/Router.jsx
function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setPath(window.location.pathname);
    
    window.addEventListener('popstate', handleNavigation);
    // Also listen for link clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        setTimeout(handleNavigation, 100);
      }
    });

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Match routes
  if (path === '/') return <HomePage />;
  if (path.includes('/profile')) return <ProfilePage />;
  return <NotFoundPage />;
}
```

#### **Step 5: Scrape Navigation Links**

```jsx
useEffect(() => {
  const links = [];
  document.querySelectorAll('nav a, .sidebar a').forEach(anchor => {
    if (anchor.href && !anchor.href.includes('logout')) {
      links.push({
        text: anchor.textContent.trim(),
        href: anchor.href,
        icon: anchor.querySelector('i')?.className  // Bootstrap icons
      });
    }
  });

  setNavigationLinks(links);

  // Remove original navigation
  document.querySelector('nav')?.remove();
  document.querySelector('.sidebar')?.remove();
}, []);
```

#### **Step 6: Fetch Data with AJAX**

```jsx
async function fetchPageData(url) {
  try {
    const response = await fetch(url, {
      credentials: 'include',  // Include cookies
      headers: {
        'X-Requested-With': 'XMLHttpRequest'  // Mark as AJAX
      }
    });

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract data from tables
    const data = [];
    doc.querySelectorAll('table tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      data.push({
        col1: cells[0]?.textContent.trim(),
        col2: cells[1]?.textContent.trim()
      });
    });

    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    return null;
  }
}
```

#### **Step 7: Implement Loading States**

```jsx
function DataPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await fetchPageData('/data-endpoint');
      setData(result);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {data.map(item => (
        <div key={item.col1}>{item.col1}: {item.col2}</div>
      ))}
    </div>
  );
}
```

#### **Step 8: Add Analytics (Self-Hosted)**

1. Download Umami tracking script:
   ```bash
   curl https://analytics.your-domain.com/script.js > public/analytics.js
   ```

2. Inject it:
   ```javascript
   const script = document.createElement('script');
   script.src = chrome.runtime.getURL('analytics.js');
   script.dataset.websiteId = 'your-website-id';
   document.head.appendChild(script);
   ```

3. Configure manifest:
   ```json
   {
     "web_accessible_resources": [
       { "resources": ["analytics.js"], "matches": ["<all_urls>"] }
     ]
   }
   ```

#### **Step 9: Integrate AI (Optional)**

Follow the Puter.js integration pattern:

1. Download dependencies:
   ```bash
   curl https://js.puter.com/v2/ > public/puter.js
   ```

2. Create bridge.js:
   ```javascript
   document.addEventListener('ai-request', async (e) => {
     const { id, prompt } = e.detail;
     if (!window.puter) return;

     const response = await window.puter.ai.chat(prompt);
     document.dispatchEvent(new CustomEvent('ai-response', {
       detail: { id, text: response }
     }));
   });
   ```

3. In React component:
   ```jsx
   function AIChat() {
     const sendMessage = (message) => {
       const id = crypto.randomUUID();
       
       document.addEventListener('ai-response', (e) => {
         if (e.detail.id === id) {
           setResponse(e.detail.text);
         }
       });

       document.dispatchEvent(new CustomEvent('ai-request', {
         detail: { id, prompt: message }
       }));
     };
   }
   ```

#### **Step 10: Build & Deploy**

```bash
# Development
npm run dev
# Load unpacked extension from dist/ folder

# Production
npm run build
# Upload dist/ folder to Chrome Web Store
```

### Key Patterns Summary

| Pattern | SuperFlex Implementation | Reusable Approach |
|---------|--------------------------|-------------------|
| **CSS Removal** | Remove Bootstrap 2.x stylesheets | Query all `<link>` tags, remove by href pattern |
| **Navigation Extraction** | Scrape `.m-menu__link` elements | Find all `nav a` or `.sidebar a` |
| **Routing** | Path-based with `window.location.pathname` | Listen to `popstate` + click events |
| **Data Fetching** | `fetch()` + DOMParser | Same-origin requests with `credentials: 'include'` |
| **Analytics** | Self-hosted Umami | Download script, inject via `chrome.runtime.getURL()` |
| **AI** | Puter.js with bridge.js | Bridge pattern for Main World access |
| **Loading States** | Full-screen overlay with spinner | Conditional rendering based on state |

---

## Additional Resources

### Troubleshooting Common Issues

**1. Extension Not Loading**
- Check manifest.json syntax (JSON is strict, no trailing commas)
- Verify `matches` pattern includes the target site
- Look for errors in `chrome://extensions` → Details → Errors

**2. Styles Not Applying**
- Ensure Tailwind directives are in CSS file: `@import "tailwindcss";`
- Check if legacy CSS is being removed successfully
- Inspect element to verify classes are present

**3. AJAX Requests Failing**
- Check CORS headers (should work for same-origin)
- Verify cookies are included (`credentials: 'include'`)
- Look for CSRF token requirements in legacy system

**4. AI Not Responding**
- Confirm puter.js and bridge.js are loaded (check Network tab)
- Verify `web_accessible_resources` includes all dependencies
- Check browser console for error messages

### Performance Optimization

**Bundle Size Reduction:**
- Use code splitting for large pages
- Tree-shake unused Lucide icons:
  ```javascript
  // Instead of: import * as Icons from 'lucide-react';
  import { Home, Calendar } from 'lucide-react';
  ```

**Loading Speed:**
- Lazy load non-critical pages
- Use `<link rel="preconnect">` for external fonts
- Minimize initial render time (defer heavy computations)

**Memory Management:**
- Clean up event listeners in `useEffect` cleanup
- Avoid storing large datasets in state (use refs or memoization)

### Best Practices

1. **Always Remove Legacy Event Listeners**: Old JavaScript may conflict with React
2. **Use DOMParser for Scraping**: Safer than regex for extracting data
3. **Implement Error Boundaries**: Catch React errors gracefully
4. **Test Session Expiry**: Ensure the extension handles logouts properly
5. **Respect Privacy**: Never log sensitive data (grades, personal info)

---

## Conclusion

SuperFlex represents a radical approach to modernizing legacy web applications: **overlay rather than rebuild**. By leveraging Chrome extension APIs, React, and clever DOM manipulation, it transforms a 2005-era university portal into a 2024-level user experience.

The architecture is replicable for any legacy system that:
- Uses server-side rendering (not heavy client-side JavaScript)
- Has consistent URL patterns
- Allows same-origin requests
- Doesn't use heavy anti-scraping measures

**Key Takeaways:**

1. **CSS Removal is Powerful**: Removing old stylesheets eliminates 90% of UI conflicts
2. **Bridge Pattern Works**: Content scripts + Main World scripts = full browser API access
3. **AJAX > Server Load**: Fetching data on-demand is faster than waiting for page loads
4. **Self-Hosting = CSP Compliance**: Download external scripts to bundle with extension
5. **React is Overkill but Worth It**: The developer experience and component reusability pay off

**Future Enhancements:**

- Offline mode with IndexedDB caching
- Push notifications for grade updates
- Browser sync across devices
- Mobile app (React Native with WebView)

---

**Repository:** [github.com/theajmalrazaq/superflex](https://github.com/theajmalrazaq/superflex)  
**Author:** Ajmal Razaq  
**License:** MIT  
**Version:** 1.0.0  
**Last Updated:** December 2024

---

## Appendix: Code Reference

### Complete File Tree
```
superflex/
├── manifest.json
├── package.json
├── vite.config.js
├── postcss.config.mjs
├── eslint.config.js
├── public/
│   ├── bridge.js          # Main World communication bridge
│   ├── puter.js           # Puter AI library
│   ├── polyfill.js        # Web Streams polyfill
│   ├── rustls.js          # Rust TLS for Puter
│   ├── umami.js           # Self-hosted analytics
│   ├── favicon.svg
│   ├── logo.svg
│   ├── bg.png
│   └── overlay.png
├── src/
│   ├── content.jsx        # Entry point
│   ├── components/
│   │   ├── LoadingOverlay.jsx
│   │   ├── LoginPageStyles.jsx
│   │   ├── NavBar.jsx
│   │   ├── NotificationBanner.jsx
│   │   ├── PageHeader.jsx
│   │   ├── PathRouter.jsx
│   │   ├── ReviewCarousel.jsx
│   │   ├── StatsCard.jsx
│   │   ├── SuperFlexAI.jsx
│   │   ├── SuperTabs.jsx
│   │   ├── layouts/
│   │   │   └── PageLayout.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── AttendancePage.jsx
│   │       ├── MarksPage.jsx
│   │       ├── TranscriptPage.jsx
│   │       ├── FeeDetailsPage.jsx
│   │       ├── CourseFeedbackPage.jsx
│   │       ├── StudyPlanPage.jsx
│   │       ├── SessionExpirePage.jsx
│   │       └── NotFoundPage.jsx
│   └── styles/
│       ├── tailwind.css   # Global styles
│       └── loading.css    # Loading animations
├── scripts/
│   └── clean.js           # Remove console.logs
└── docs/
    └── index.html         # Marketing website
```

### Key Configuration Files

**tailwind.config.js (implicit via @theme):**
```css
@theme {
  --color-x: #a098ff;  /* Brand purple */
  --font-sans: "Google Sans Flex", sans-serif;
}
```

**postcss.config.mjs:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

**eslint.config.js:**
```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  }
];
```

---

**End of Documentation**

This guide should serve as a comprehensive reference for understanding SuperFlex's architecture and as a blueprint for anyone looking to modernize legacy web applications using similar techniques.
