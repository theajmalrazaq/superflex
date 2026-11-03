# SuperFlex Modern Design System Specification ("Sky & Midnight")

> **Version**: 1.0.0  
> **Aesthetic Philosophy**: Atmospheric Minimalist Flat (Sky Gradient, Photorealistic Cloudscapes, Crisp Zero-Shadow Cards, Midnight Plum Primary & Soft Lilac Secondary Accents).

---

## 1. Overview & Core Philosophy

The **"Sky & Midnight"** design language is an ultra-clean, high-contrast, modern UI system inspired by next-generation financial and mobile applications. It replaces outdated dark skeuomorphism and heavy blurred drop-shadows with:

1. **Atmospheric Sky Backdrops**: Silky, vibrant sky-blue vertical gradients complemented by gentle, photorealistic cumulus clouds.
2. **Zero-Shadow Geometric Surfaces**: Pure flat white cards (`#ffffff`) with generous corner radiuses (`28px`–`36px`), creating crisp elevation solely through background contrast rather than artificial drop shadows or heavy blur halos.
3. **The "Midnight & Lilac" Action Hierarchy**:
   - **Primary Action**: Deep Midnight Plum / Purple (`#1e0838`) with pure white icons and text.
   - **Secondary Action**: Soft Pastel Lilac / Lavender (`#dfc8fc` / `#e9ddff`) with midnight purple text (`#1e0838`).
   - **Translucent Accent**: Glassy sky-blue secondary pills (`rgba(255, 255, 255, 0.35)`) for badges, rates, and navigation tracks.
4. **Pill & Squircle Geometry**: Strict adherence to pill-shaped interactive elements (`rounded-full`) and squircle media/logo containers (`rounded-2xl` / `rounded-3xl`).

---

## 2. Color Palette & Design Tokens

### 2.1 Background & Atmospheric Colors

| Token Name             | Hex / Value                 | Tailwind / CSS Equivalent      | Purpose                                         |
| :--------------------- | :-------------------------- | :----------------------------- | :---------------------------------------------- |
| `sky-gradient-start`   | `#3b8fe6`                   | `from-[#3b8fe6]`               | Sky top atmospheric deep azure                  |
| `sky-gradient-mid`     | `#7abdf0`                   | `via-[#7abdf0]`                | Transition mid-sky blue                         |
| `sky-gradient-end`     | `#ddedf9`                   | `to-[#ddedf9]`                 | Lower horizon soft mist blue                    |
| `sky-glass-pill`       | `rgba(255, 255, 255, 0.35)` | `bg-white/35 backdrop-blur-sm` | Translucent pills (e.g. Rate pill, version tag) |
| `sky-glass-pill-hover` | `rgba(255, 255, 255, 0.45)` | `hover:bg-white/45`            | Hover state for translucent sky pills           |

### 2.2 Brand & Interactive Colors

| Token Name                | Hex / Value | Tailwind / CSS Equivalent         | Purpose                                                      |
| :------------------------ | :---------- | :-------------------------------- | :----------------------------------------------------------- |
| `primary-midnight`        | `#1e0838`   | `bg-[#1e0838]` / `text-[#1e0838]` | Primary button fill, FAB, headline brand accents             |
| `primary-midnight-hover`  | `#2a0c4f`   | `hover:bg-[#2a0c4f]`              | Hover state for primary buttons                              |
| `primary-midnight-active` | `#150428`   | `active:bg-[#150428]`             | Active/pressed state for primary buttons                     |
| `secondary-lilac`         | `#dfc8fc`   | `bg-[#dfc8fc]` / `text-[#1e0838]` | Secondary pill action buttons (e.g. "Share", "I understand") |
| `secondary-lilac-hover`   | `#d2afff`   | `hover:bg-[#d2afff]`              | Hover state for secondary lilac buttons                      |
| `badge-lavender`          | `#e9ddff`   | `bg-[#e9ddff]`                    | Squircle logo containers, feature badges                     |
| `callout-lilac-bg`        | `#f2ecfc`   | `bg-[#f2ecfc]`                    | In-card callout banners and notice highlights                |

### 2.3 Surface & Neutral Colors

| Token Name        | Hex / Value             | Purpose                                                     |
| :---------------- | :---------------------- | :---------------------------------------------------------- |
| `surface-card`    | `#ffffff` (Solid)       | Flat main cards, sheets, dialog surfaces (zero drop-shadow) |
| `surface-input`   | `#f8f9fa` or `#ffffff`  | Input field background with `border-slate-200`              |
| `text-primary`    | `#0f172a` (Slate 900)   | Main titles, card headlines, monetary figures               |
| `text-secondary`  | `#64748b` (Slate 500)   | Subtitles, descriptive paragraphs                           |
| `text-muted`      | `#94a3b8` (Slate 400)   | Placeholders, inactive tab labels, borders                  |
| `status-positive` | `#16a34a` (Emerald 600) | Positive growth percentages (`+2.05% ↗`)                    |
| `status-negative` | `#dc2626` (Red 600)     | Negative decline percentages (`-3.51% ↘`)                   |

---

## 3. Atmospheric Background & Cloud Implementation

As seen in the primary checking screen, the background combines a rich vertical sky gradient with soft, photorealistic white clouds in the upper half of the viewport.

```mermaid
flowchart TD
    A["Screen Viewport"] --> B["Layer 0: Sky Gradient Background (#3b8fe6 -> #ddedf9)"]
    B --> C["Layer 1: Floating Photorealistic Cloud Sprites (Top Left / Top Right)"]
    C --> D["Layer 2: Glassy Atmospheric Indicators (Rate Pills, Hero Balance)"]
    D --> E["Layer 3: Solid Flat White Cards (Z-Index 20+, rounded-[32px])"]
    E --> F["Layer 4: Interactive Floating Elements (Bottom Navigation, Midnight FAB)"]
```

### 3.1 Cloud Layer Specifications

- **Positioning**: Fixed or absolute in the background (`pointer-events-none -z-10`).
- **Placement**:
  - **Top-Right Cloud**: Large cumulus cloud billowing from the top-right corner (`w-[280px]` to `w-[360px]`, `top-[-20px] right-[-20px]`).
  - **Mid-Left Cloud**: Discrete wispy cloud floating midway (`w-[160px]` to `w-[220px]`, `top-[120px] left-[5%]`).
- **Visual Style**: Soft, organic edges blending natively into the sky gradient (photorealistic WebP/PNG or SVG feather mask, opacity `0.85`–`0.95`).
- **Animation (Optional)**: Ultra-gentle horizontal drift (e.g. `120s linear infinite alternate`).

### 3.2 HTML / Tailwind Code Pattern

```html
<div
  class="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-gradient-to-b from-[#3b8fe6] via-[#7abdf0] to-[#ddedf9]"
>
  <!-- Top-Right Fluffy Cloud -->
  <img
    src="/assets/clouds/cloud-top-right.webp"
    alt=""
    aria-hidden="true"
    class="absolute -top-6 -right-10 w-72 sm:w-96 opacity-90 select-none"
  />

  <!-- Mid-Left Floating Cloud -->
  <img
    src="/assets/clouds/cloud-mid-left.webp"
    alt=""
    aria-hidden="true"
    class="absolute top-28 left-6 w-44 sm:w-56 opacity-85 select-none"
  />
</div>
```

---

## 4. Typography & Layout Metrics

- **Primary Font Family**: `'Google Sans Flex'`, `'Plus Jakarta Sans'`, or `system-ui, -apple-system, sans-serif`.
- **Letter Spacing**: Tight on large headings (`tracking-tight`), slightly expanded on uppercase micro-badges (`tracking-wider`).

| Element                   | Size          | Weight            | Tracking / Leading                             | Example                                  |
| :------------------------ | :------------ | :---------------- | :--------------------------------------------- | :--------------------------------------- |
| **Hero Numeric Balance**  | `48px`–`56px` | `800` (Extrabold) | `tracking-tight leading-none text-white`       | `$3.13` or `$0`                          |
| **Card Hero Heading**     | `28px`–`32px` | `800` (Extrabold) | `tracking-tight leading-[1.18] text-slate-900` | `"Your portal moves with you."`          |
| **Modal / Section Title** | `20px`–`24px` | `800` (Bold)      | `tracking-tight text-slate-900`                | `"All stocks"`, `"U.S. markets run..."`  |
| **Card Subtitle / Body**  | `13px`–`14px` | `400` / `500`     | `leading-relaxed text-slate-500`               | Feature descriptions                     |
| **Section Label / Tag**   | `11px`–`12px` | `700` (Bold)      | `tracking-wide uppercase text-slate-400`       | `"CHECKING ACCOUNT"`, `"BASE"`           |
| **Pill / Button Label**   | `13px`–`14px` | `700` (Bold)      | `tracking-normal`                              | `"Sign In"`, `"Copy details"`, `"Share"` |

---

## 5. Component Specifications & Button Combinations

### 5.1 Button Pairings & Hierarchies

The design system uses deliberate button combinations to balance user prominence:

```
┌────────────────────────────────────────────────────────┐
│  Primary: [ Sign In              → ]                   │  <- Midnight Purple (#1e0838) + White
├────────────────────────────────────────────────────────┤
│  Dual Action:                                          │
│  [ Copy details ]              [      Share      ]     │
│  (#1e0838 Pill)                (#dfc8fc Lilac Pill)    │
├────────────────────────────────────────────────────────┤
│  Modal / Bottom Sheet Action:                          │
│  [                   I understand                    ] │  <- Lilac Pill (#dfc8fc) + #1e0838 text
└────────────────────────────────────────────────────────┘
```

#### A. Primary Action Button (Midnight Pill)

- **Geometry**: `rounded-full`, height `52px`, padding `px-7 py-3.5`.
- **Colors**: Background `#1e0838`, text `#ffffff`.
- **Shadow**: `shadow-none` (strictly flat).
- **Icon**: Right arrow (`<svg> <path d="M5 12h14"/> <path d="m12 5 7 7-7 7"/> </svg>`) in crisp 2.5px stroke.
- **Tailwind**:
  ```css
  bg-[#1e0838] hover:bg-[#2a0c4f] active:scale-[0.98] text-white rounded-full font-bold text-sm h-[52px] px-7 flex items-center justify-center gap-2 border-none shadow-none transition-all
  ```

#### B. Secondary Action Button (Lilac Pill)

- **Geometry**: `rounded-full`, height `52px` or `48px`, padding `px-6 py-3`.
- **Colors**: Background `#dfc8fc` (or `#e9ddff`), text `#1e0838`.
- **Shadow**: `shadow-none`.
- **Tailwind**:
  ```css
  bg-[#dfc8fc] hover:bg-[#d2afff] active:scale-[0.98] text-[#1e0838] rounded-full font-bold text-sm h-[52px] px-6 flex items-center justify-center gap-2 border-none shadow-none transition-all
  ```

#### C. Floating Action Button (Midnight Circle FAB)

- **Geometry**: Perfect circle `w-14 h-14 rounded-full`.
- **Colors**: Background `#1e0838`, icon `#ffffff` (`+` plus or search magnifying glass).
- **Shadow**: `shadow-none`.
- **Tailwind**:
  ```css
  w-14 h-14 rounded-full bg-[#1e0838] text-white flex items-center justify-center shadow-none border-none cursor-pointer active:scale-95 transition-transform
  ```

#### D. Translucent Secondary Glassy Pill

- **Geometry**: `rounded-full`, height `36px`–`40px`, padding `px-4 py-1.5`.
- **Colors**: Background `rgba(255, 255, 255, 0.35)`, text `#0f172a` or `#ffffff`.
- **Use Case**: Rate pill (`USD 1 = PKR 275.12 Today`), version banner.

---

### 5.2 Cards & Surface Containers

- **Zero-Shadow Rule**: Every card uses `box-shadow: none` (`!shadow-none`).
- **Corner Radius**: `rounded-[28px]` or `rounded-[32px]`.
- **Background**: Solid `#ffffff`.
- **Internal Callout Container**:
  - Background: Soft lilac `#f2ecfc` or `#f3edff`.
  - Radius: `rounded-2xl`.
  - Icon & Text: Midnight plum `#1e0838` with muted body `#475569`.

#### Card Template

```jsx
<div className="bg-white rounded-[32px] p-6 sm:p-8 flex flex-col gap-4 text-slate-900 shadow-none border-none">
  <div className="flex items-center justify-between">
    <h3 className="text-base font-extrabold text-slate-900">Network</h3>
    <button className="text-slate-400 hover:text-slate-700">
      <CopyIcon className="w-5 h-5" />
    </button>
  </div>

  <p className="text-lg font-bold text-slate-800">Base</p>

  {/* In-Card Soft Lilac Callout Notice */}
  <div className="p-4 rounded-2xl bg-[#f2ecfc] flex items-start gap-3">
    <InfoIcon className="w-5 h-5 text-[#1e0838] shrink-0 mt-0.5" />
    <p className="text-xs font-medium text-slate-700 leading-relaxed">
      Only send supported tokens on this network. Any other coin or network may be lost.
    </p>
  </div>
</div>
```

---

### 5.3 Modals & Bottom Sheets

As seen in the "U.S. markets run 7:30 PM" modal:

- **Overlay**: Soft backdrop `bg-slate-900/40` without heavy blur halos.
- **Card Surface**: Solid `#ffffff`, `rounded-[32px]`, zero shadow.
- **Header Badge**: Squircle container (`w-16 h-16 rounded-2xl bg-[#e9ddff]`) displaying the hero graphic or SuperFlex lightning emblem in `#1e0838`.
- **Action**: Full-width lilac button (`bg-[#dfc8fc] text-[#1e0838]`).

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
  <div className="bg-white rounded-[32px] p-7 sm:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-none border-none">
    {/* Centered Squircle Badge */}
    <div className="w-16 h-16 rounded-2xl bg-[#e9ddff] flex items-center justify-center mb-6">
      <img src="/assets/favicon.svg" alt="Emblem" className="w-8 h-8" />
    </div>

    {/* Title */}
    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
      U.S. markets run 7:30 PM – 2:00 AM GMT+5
    </h2>

    {/* Subtitle */}
    <p className="text-slate-500 text-xs sm:text-sm font-normal mt-2.5 mb-7">
      You can place an order once they’re open.
    </p>

    {/* Action Lilac Button */}
    <button className="w-full bg-[#dfc8fc] hover:bg-[#d2afff] text-[#1e0838] font-bold text-sm py-3.5 px-6 rounded-full shadow-none border-none cursor-pointer transition-all">
      I understand
    </button>
  </div>
</div>
```

---

### 5.4 Segmented Track & Pill Switchers

As seen in the **All / Stocks / ETFs / Commodities** and **BASE / SOLANA** selectors:

- **Track**: Pill-shaped container (`rounded-full p-1 bg-white/40` or `bg-slate-100`).
- **Active State**:
  - In Category Filter: Solid midnight pill (`bg-[#1e0838] text-white rounded-full px-5 py-2`).
  - In Network Selector: Solid white pill (`bg-white text-slate-900 rounded-full px-6 py-2 shadow-none`).
- **Inactive State**: Transparent or faint pill (`text-slate-600 hover:text-slate-900 px-5 py-2`).

---

### 5.5 Form Inputs & Inline Action Controls

As seen in the login card reference:

- **Geometry**: Pill-shaped (`rounded-full h-[52px] px-6`).
- **Background**: Soft off-white (`#f8f9fa`) or crisp white (`#ffffff`).
- **Border**: Subtle 1px `border-slate-200`.
- **Focus**: Sharp midnight border `focus:border-[#1e0838]`, **strictly `ring-0`** (no blur glow rings).
- **Inline Action Alternative**: Input with integrated circular arrow button positioned inside the right edge.

---

## 6. Iconography & Badges

- **SuperFlex Lightning Favicon**:
  - Embedded as flat vector in squircle badges (`w-12 h-12 rounded-2xl bg-[#e9ddff]`).
  - Path: `M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z`.
  - Fill: `#1e0838` (Midnight Plum).
- **Navigation & Status Icons**:
  - Lucide / Clean SVG line icons, `stroke-width="2"` or `2.5`.
  - Rounded stroke ends (`stroke-linecap="round" stroke-linejoin="round"`).

---

## 7. Responsive Breakpoint Rules

| Breakpoint                    | Card Max Width                    | Padding        | Border Radius    |
| :---------------------------- | :-------------------------------- | :------------- | :--------------- |
| **Mobile (`< 640px`)**        | `92vw`                            | `p-6` to `p-7` | `rounded-[28px]` |
| **Tablet (`640px`–`1024px`)** | `430px` (Login) / `520px` (Modal) | `p-8`          | `rounded-[32px]` |
| **Desktop (`> 1024px`)**      | Responsive container              | `p-10`         | `rounded-[36px]` |

---

## 8. Summary Checklist for SuperFlex Developers

When creating or redesigning components under this system, verify:

- [ ] **Zero Drop Shadows**: No `shadow-lg`, `shadow-md`, or custom box-shadows. Use contrast against the sky gradient for depth.
- [ ] **No Fuzzy Glow Halos**: No blur glows behind cards or inputs. Focus states use crisp border lines.
- [ ] **Smooth Sky Backdrop**: Vertical linear gradient (`#3b8fe6` to `#ddedf9`) with photorealistic cloud sprites.
- [ ] **Midnight Plum Primary**: Primary CTAs use `#1e0838` with white text and right-facing arrow `->`.
- [ ] **Soft Lilac Secondary**: Secondary CTAs use `#dfc8fc` / `#e9ddff` with `#1e0838` text.
- [ ] **Pill & Squircle Geometry**: Interactive elements are pills (`rounded-full`); icon containers are squircles (`rounded-2xl`).
- [ ] **Flat Pure White Surfaces**: Content containers are `#ffffff` with high corner radiuses (`28px`–`36px`).
