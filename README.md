# Project X — Browser Extension Template (Manifest V3)

A modern, cross-browser **Manifest V3** extension template built with **Vite**, **React 19**, and **TypeScript**. Designed for **Chrome**, **Edge**, **Brave**, and **Safari**, featuring a full-featured **Side Panel**, **Options Page**, **Popup Launcher**, **Background Service Worker**, and **Content Script** connected by reactive cross-browser storage.

---

## Features

- **Side Panel (`sidepanel.html` / `src/sidepanel/`)**:
  - Persistent companion UI alongside any webpage.
  - Active Tab Inspector (page title, URL, word count, heading count) & Page Heading Highlighter.
  - Quick Notes workspace saved directly to `chrome.storage.local` / `browser.storage.local`.
- **Options Page (`options.html` / `src/options/`)**:
  - Full-page configuration dashboard with reactive state synchronization.
  - Toggle whether clicking the toolbar icon opens the **Side Panel** directly (`chrome.sidePanel.setPanelBehavior`) or the **Popup**.
  - Theme selector (`System`, `Light`, `Dark`) and Accent Color palette (`Indigo`, `Emerald`, `Rose`, `Amber`).
  - Storage Inspector with JSON export and one-click reset.
- **Background Service Worker (`src/background/index.ts`)**:
  - Syncs `sidePanel.setPanelBehavior` with user preferences.
  - Registers a right-click Context Menu item (*"Save selection to Project X Side Panel"*).
- **Cross-Browser Compatibility (`src/shared/storage.ts`)**:
  - Unified `browser.*` / `chrome.*` API resolution for Chromium browsers and Safari Web Extensions, plus automatic `localStorage` + `BroadcastChannel` fallback when running in Vite's browser dev workbench.

---

## Project Structure

```text
├── public/
│   ├── icons/                # Extension icons (16, 32, 48, 128px)
│   └── manifest.json         # Manifest V3 configuration
├── src/
│   ├── background/           # Service worker (Side Panel behavior & context menus)
│   ├── content/              # Content script (page metrics & heading highlighter)
│   ├── dev/                  # Side-by-side Dev Workbench (Options + Side Panel)
│   ├── options/              # Options Page React app
│   ├── popup/                # Toolbar Popup React app
│   ├── shared/               # Typed storage, messaging, and theme CSS
│   └── sidepanel/            # Side Panel React app
├── index.html                # Dev Workbench entry point
├── options.html              # Extension Options entry point
├── popup.html                # Extension Popup entry point
├── sidepanel.html            # Extension Side Panel entry point
├── tsconfig.json
└── vite.config.ts            # Multi-entry Rollup configuration
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Interactive Dev Workbench

Preview and develop the **Side Panel**, **Options Page**, and **Popup** side-by-side in any browser tab with HMR and live storage synchronization:

```bash
npm run dev
```

### 3. Build for Production (Unpacked Extension)

```bash
npm run build
```

Or rebuild automatically on file changes:

```bash
npm run watch
```

---

## Loading the Extension in Browsers

### Chrome / Edge / Brave
1. Run `npm run build` to generate the `dist/` folder.
2. Open `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `dist/` directory.

### Safari (macOS / iOS)
1. Run `npm run build`.
2. Convert the `dist/` folder into an Xcode Web Extension project:
   ```bash
   xcrun safari-web-extension-converter dist/
   ```
3. Build and run the generated project in Xcode, then enable the extension in **Safari → Settings → Extensions**.
