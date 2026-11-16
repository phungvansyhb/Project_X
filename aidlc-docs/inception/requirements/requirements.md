# Requirements Analysis (`requirements.md`)

- **Phase**: `INCEPTION`
- **Stage**: `Requirements Analysis`
- **Analysis Depth**: `Comprehensive`
- **Status**: `Validated with User (Updated with Claymorphism UI Requirements)`

---

## 1. Functional Requirements (`FR-*`)

| ID | Title | Description | Priority |
| :--- | :--- | :--- | :--- |
| **`FR-01`** | **Select-to-Translate Clay Popup** | When a user selects text on any webpage (`mouseup`), display a floating **Claymorphism** translation popup near the selection showing the source text, pronunciation button, and translated meaning. | Must Have |
| **`FR-02`** | **Translation Providers** | Provide zero-config translation out-of-the-box via Free Google Translate / Dictionary API, plus optional custom API key configuration (Gemini, OpenAI, DeepL) and Target Language selection in the Options Page. | Must Have |
| **`FR-03`** | **Auto-Highlight via CSS Custom Highlight API** | Automatically highlight the selected text and all matching occurrences on the page using `CSS.highlights` (`::highlight(project-x-vocab)`), with a non-destructive fallback if `CSS.highlights` is unavailable. | Must Have |
| **`FR-04`** | **Hover Meaning Clay Tooltip** | When the user hovers over any highlighted text on the page, display a floating **Claymorphism** tooltip showing its saved meaning, audio pronunciation, and remove-highlight button. | Must Have |
| **`FR-05`** | **Auto-Save by Page URL & Re-Highlight on Revisit** | Automatically persist highlighted words in local machine storage (`chrome.storage.local` / `browser.storage.local`) grouped by normalized Page URL, and automatically re-highlight all occurrences when the user reloads or revisits that URL. | Must Have |
| **`FR-06`** | **Extension Icon Vocabulary View** | Clicking the extension icon opens the Side Panel (or Popup) displaying all words highlighted on the **current page URL**, with a tab to view/search words across **all saved pages**. | Must Have |
| **`FR-07`** | **Excel (`.xlsx`) Export** | Users can export saved vocabulary (for the current page or all pages) into an Excel (`.xlsx`) spreadsheet with columns: **`Source Text`** and **`Translated Meaning`**. | Must Have |
| **`FR-08`** | **Claymorphism UI Design System** | All extension surfaces (**Side Panel**, **Toolbar Popup**, **On-Page Shadow DOM Translation Popup & Hover Tooltip**, and **Options Page**) must implement the **Soft Pastel Claymorphism + Dark Clay** design standard ([`ui-design.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/application-design/ui-design.md)). | Must Have |

---

## 2. Non-Functional Requirements (`NFR-*`)

- **`NFR-01` (DOM Integrity & SPA Safety)**: Highlighting MUST use the CSS Custom Highlight API (`CSS.highlights`) so host webpage DOM trees (React, Next.js, Vue, Angular) are not mutated or broken by injected `<span>` wrappers.
- **`NFR-02` (Shadow DOM Style Isolation)**: All injected on-page UI (Claymorphism translation popup and hover meaning tooltip) MUST render inside a Shadow DOM root (`#project-x-shadow-host`) with self-contained Claymorphism CSS variables so webpage styles never leak into extension UI.
- **`NFR-03` (Hover Performance)**: Range hit-testing on `mousemove` MUST be throttled (`requestAnimationFrame` / `<= 60fps`) and only inspect active `Range` objects registered for the current viewport.
- **`NFR-04` (Offline / Local Privacy)**: All saved vocabulary resides strictly on the user's machine (`storage.local`). External network calls occur only when translating text via the configured translation provider.
- **`NFR-05` (Claymorphism Visual Fidelity & Motion)**: UI elements must use multi-layered 3D clay shadows (outer drop shadow + top-left inner highlight + bottom-right inner bevel), rounded `20px–24px` corners, `Plus Jakarta Sans` / `Nunito` rounded typography, and tactile press-down micro-interactions.

---

## 3. Technical Constraints (`CON-*`) & Prerequisites (`PRE-*`)

- **`CON-01` (Cross-Browser Manifest V3)**: Must support Chrome, Edge, Brave, Firefox (`browser_specific_settings.gecko` / `sidebar_action`), and Safari (`safari-web-extension-converter`).
- **`CON-02` (CORS Bypass)**: Translation HTTP requests must execute inside the Background Service Worker (`src/background/`) rather than the Content Script to avoid webpage CORS and CSP restrictions.
- **`PRE-01`**: Browser support for `CSS.highlights` (Chrome 105+, Edge 105+, Safari 17.2+, Firefox 140+).

---

## 4. Exclusions (`EX-*`) & Success Criteria (`SC-*`)

- **`EX-01`**: Cloud account sync / remote backend database is out of scope (all data is stored locally on the user's machine and exported via Excel).
- **`SC-01`**: Selecting text on a webpage translates, highlights via `::highlight(project-x-vocab)`, and persists the word in `< 500ms` (network permitting).
- **`SC-02`**: Reloading the webpage automatically restores all highlights for that URL and displays the Claymorphism meaning tooltip on hover.
- **`SC-03`**: Clicking "Export Excel" downloads a valid `.xlsx` file openable in Microsoft Excel, Google Sheets, and Apple Numbers with `Source Text` and `Translated Meaning` columns.
