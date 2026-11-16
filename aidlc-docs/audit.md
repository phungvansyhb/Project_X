# AI-DLC Append-Only Audit Log (`audit.md`)

> **Rule**: This is an append-only audit trail. Every user input, clarification, approval, and AI action must be logged here with an ISO 8601 timestamp at the end of every prompt. Never overwrite or summarize away historical entries.

---

## [2026-11-15T18:13:38-08:00] — Prompt 1: Create Browser Extension Template
- **Phase / Stage**: `INCEPTION & INITIAL SCAFFOLD / Workspace Setup`
- **User Input**: `"help me create an browser extension template"`
- **Clarifications / Decisions**:
  - **Tech Stack**: `(Recommended) Vite + React + TypeScript (WXT or CRXJS)`
  - **Components**: `Side Panel / Options Page`
  - **Target Browsers**: `Chrome / Chromium (Manifest V3), Edge / Brave / Safari`
- **Artifacts & Files Updated**:
  - Created `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `README.md`.
  - Created `public/manifest.json` and generated icons (`public/icons/icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`).
  - Created `src/shared/storage.ts`, `src/shared/messaging.ts`, `src/shared/styles.css`.
  - Created `sidepanel.html`, `src/sidepanel/main.tsx`, `src/sidepanel/SidePanelApp.tsx`.
  - Created `options.html`, `src/options/main.tsx`, `src/options/OptionsApp.tsx`.
  - Created `popup.html`, `src/popup/main.tsx`, `src/popup/PopupApp.tsx`, `index.html`, `src/dev/main.tsx`.
  - Created `src/background/index.ts`, `src/content/index.ts`.
- **Verification & Gate Status**: `npm install && npm run build` succeeded with 0 errors.

---

## [2026-11-15T18:22:50-08:00] — Prompt 2: Create Initial Documentation & Changelog Rule
- **Phase / Stage**: `INCEPTION / Governance Setup`
- **User Input**: `"Ok now create a folder instructors/. This includes files : spec.md , plan.md and change_log.md. Every time prompt finished, you need to update to change_log.md"`
- **Clarifications / Decisions**: Established rule to log every prompt completion.
- **Artifacts & Files Updated**:
  - Created `instructors/spec.md`, `instructors/plan.md`, `instructors/change_log.md`.
- **Verification & Gate Status**: Verified files created and formatted.

---

## [2026-11-15T18:33:25-08:00] — Prompt 3: Analyze & Clarify Web Translator & Highlighter Requirements
- **Phase / Stage**: `INCEPTION / Requirements Analysis`
- **User Input**: `"The plan is : Create a browser extensions which available with all popular browser. While user read on the web they can select a text then a popup translate appears. After that the text selected will be hightligh (use css :highlight maybe) and when user hovers this text again this will display meaning. User can click extension icon in order to view all words that highlighted on current page. Extension auto save these word by page url on user machine storage, user can export them in excel format to learn. Let's help me analyze and clarify the requirements"`
- **Clarifications / Decisions**:
  - **Q1 (Translation Provider)**: `(Recommended) Free Google Translate / Dictionary API out-of-the-box + optional custom API key (Gemini / OpenAI / DeepL) in Options`
  - **Q2 (Selection & Highlight Trigger)**: `(Recommended) Auto-translate, auto-highlight, and auto-save immediately on text selection (configurable in Options)`
  - **Q3 (Re-Visit / Persistence Behavior)**: `(Recommended) Re-highlight saved words automatically when revisiting the same URL + match all occurrences of the word on that page`
  - **Q4 (Excel Export Columns)**: `Source Text (Word / Phrase) & Translated Meaning`
- **Artifacts & Files Updated**:
  - Updated specification, roadmap, and changelog with clarified requirements and `CSS.highlights` architecture.
- **Verification & Gate Status**: Requirements analysis completed.

---

## [2026-11-15T18:52:55-08:00] — Prompt 4: Migrate to Standard AI-DLC Instructions & Artifact Structure
- **Phase / Stage**: `INCEPTION / Complete AI-DLC Standardization (Stages 1–6)`
- **User Input**: `"I want to create instuctions follow standard AIDLC, help me create them, can delete instuctors/ if needed"`
- **Clarifications / Decisions**:
  - Removed legacy `instructors/` folder and replaced with standard **AI-DLC** structure (`AGENTS.md`, `instructions/`, and `aidlc-docs/`).
- **Artifacts & Files Updated**:
  - Deleted `instructors/`.
  - Created root [`AGENTS.md`](file:///home/antigravity/phungvansyhb/Project_X/AGENTS.md).
  - Created steering rules in `instructions/`:
    - [`instructions/core-workflow.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/core-workflow.md)
    - [`instructions/common/session-and-audit.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/common/session-and-audit.md)
    - [`instructions/inception/inception-rules.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/inception/inception-rules.md)
    - [`instructions/construction/construction-rules.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/construction/construction-rules.md)
    - [`instructions/operations/operations-rules.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/operations/operations-rules.md)
  - Created AI-DLC living artifacts in `aidlc-docs/`:
    - [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md)
    - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md)
    - [`aidlc-docs/inception/requirements/requirements.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/requirements/requirements.md)
    - [`aidlc-docs/inception/user-stories/user-stories.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/user-stories/user-stories.md)
    - [`aidlc-docs/inception/application-design/architecture.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/application-design/architecture.md)
    - [`aidlc-docs/inception/units/units.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/units/units.md)
    - [`aidlc-docs/inception/plans/execution-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/plans/execution-plan.md)
    - [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md)
    - [`aidlc-docs/operations/release-and-packaging.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/operations/release-and-packaging.md)
- **Verification & Gate Status**: Inception Phase artifacts complete; ready at **Gate 1** for user approval to begin Construction Phase (`UNIT-01` → `UNIT-04`).

---

## [2026-11-15T19:10:50-08:00] — Prompt 5: Query Current AI-DLC Stage & Next Steps
- **Phase / Stage**: `INCEPTION (Stage 1.6 Completed) / Gate 1 Sign-Off Check`
- **User Input**: `"theo như các file thì hiện tại tôi đang ở stage nào và bước tiếp theo là gì"`
- **Clarifications / Decisions**: Informational query regarding current AI-DLC workflow position and next actionable step.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 5 audit entry.
- **Verification & Gate Status**: Remains at **Gate 1 Sign-Off** awaiting user approval to transition from `INCEPTION` to `CONSTRUCTION` (`UNIT-01`).

---

## [2026-11-15T19:24:00-08:00] — Prompt 6: Clarify & Specify Claymorphism UI Design Standard
- **Phase / Stage**: `INCEPTION / Stage 1.4: Application & UI Design`
- **User Input**: `"Where is clarify extension UI design? I want extension UI follow Claymorphism design stardard"`
- **Clarifications / Decisions**:
  - **Q1 (Target UI Surfaces)**: `Side Panel & Toolbar Popup (main extension views), On-Page Translation Popup & Hover Meaning Tooltip (Shadow DOM UI)`
  - **Q2 (Claymorphism Visual Aesthetic)**: `(Recommended) Soft Pastel Clay (Cream/Cloud backdrop, vibrant pastel cards with dual inner-3D + outer drop shadows, rounded 20px–24px corners) + Dark Clay mode`
  - **Q3 (Typography & Micro-Interactions)**: `(Recommended) Plus Jakarta Sans / Nunito (friendly rounded geometric sans-serif that pairs naturally with Claymorphism) + tactile press-down button micro-interactions`
- **Artifacts & Files Updated**:
  - Created [`aidlc-docs/inception/application-design/ui-design.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/application-design/ui-design.md) — Formal Claymorphism UI/UX Design Specification (3-layer shadow formulas, Light/Dark clay palettes, typography, and component specs).
  - Updated [`aidlc-docs/inception/requirements/requirements.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/requirements/requirements.md) — Added `FR-08` (Claymorphism UI Design System) and `NFR-05` (Claymorphism Visual Fidelity & Motion).
  - Updated [`aidlc-docs/inception/units/units.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/units/units.md) and [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md).
  - Appended Prompt 6 audit log entry to [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md).
- **Verification & Gate Status**: UI Design specification complete and validated; ready at **Gate 1** to begin Construction Phase (`UNIT-01` → `UNIT-04`).

---

## [2026-11-15T19:26:50-08:00] — Prompt 7: Initial Git Commit & Push
- **Phase / Stage**: `INCEPTION (Completed) / Version Control Checkpoint before Gate 1 Construction`
- **User Input**: `"First commit to git"`
- **Clarifications / Decisions**: Stage all extension scaffold files, AI-DLC steering instructions (`AGENTS.md`, `instructions/`), and Inception Phase artifacts (`aidlc-docs/`) and create the initial Git commit.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 7 audit log entry prior to committing.
- **Verification & Gate Status**: Verified `git status`, created initial commit, and pushed to remote repository; remains ready at **Gate 1 Sign-Off** to begin Construction (`UNIT-01` → `UNIT-04`).

---

## [2026-11-15T19:32:05-08:00] — Prompt 8: Approve Gate 1 & Implement `UNIT-01`
- **Phase / Stage**: `CONSTRUCTION / UNIT-01: Vocabulary Storage Schema, Claymorphism CSS Design System & Excel (.xlsx) Exporter`
- **User Input**: `"Approve gate 1 and start UNIT-01"`
- **Clarifications / Decisions**:
  - Approved **Gate 1 Sign-Off** transitioning the project from `INCEPTION` to `CONSTRUCTION`.
  - Executed `UNIT-01` implementation and build verification.
- **Artifacts & Files Updated**:
  - [`src/shared/storage.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/storage.ts) — Implemented `VocabItem`, `PageVocabGroup`, `normalizePageUrl`, URL-grouped CRUD helpers (`saveVocabItem`, `removeVocabItem`, `updateVocabItemMeaning`, `clearPageVocab`, `getVocabForPage`, `getAllVocabItems`), and translation/highlight settings.
  - [`src/shared/styles.css`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/styles.css) — Upgraded design system to **Soft Pastel Claymorphism + Dark Clay Mode** (3-layer clay shadows, `20px–24px` radii, `Plus Jakarta Sans` / `Nunito` typography, and tactile press-down button micro-interactions).
  - [`src/shared/excelExport.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/excelExport.ts) — Implemented standalone OpenXML `.xlsx` workbook generator and downloader (`exportVocabToExcel`, `buildExcelBlob`) with `Source Text` and `Translated Meaning` columns.
  - [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) & [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md) — Marked Gate 1 and `UNIT-01` as completed `[x]`.
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 8 audit entry.
- **Verification & Gate Status**: `npm run typecheck && npm run build` passed with 0 errors. Next unit in queue: **`UNIT-02` (Background Translation Service & Message Router)**.

---

## [2026-11-15T19:36:35-08:00] — Prompt 9: Implement `UNIT-02` (Background Translation Service & Message Router)
- **Phase / Stage**: `CONSTRUCTION / UNIT-02: Background Translation Service & Message Router`
- **User Input**: `"implement Unit-02"`
- **Clarifications / Decisions**: Executed `UNIT-02` implementation and build verification.
- **Artifacts & Files Updated**:
  - [`src/background/translator.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/background/translator.ts) — Implemented `translateText` supporting Free Google Translate + Free Dictionary API enrichment out-of-the-box, optional custom API keys (`gemini`, `openai`, `deepl`), and offline glossary fallback.
  - [`src/shared/messaging.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/messaging.ts) — Implemented `requestTranslation`, `scrollToVocabOnPage`, and normalized URL active tab queries.
  - [`src/background/index.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/background/index.ts) — Implemented `TRANSLATE_TEXT` message handler with auto-save to `vocabByUrl` and right-click context menu translation (`Translate & Highlight with Project X`).
  - [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) & [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md) — Marked `UNIT-02` as completed `[x]`.
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 9 audit entry.
- **Verification & Gate Status**: `npm run typecheck && npm run build` passed with 0 errors. Next unit in queue: **`UNIT-03` (Content Script — Shadow DOM Claymorphism Selection Popup, `CSS.highlights` Engine & Hover Tooltip)**.

---

## [2026-11-15T19:43:49-08:00] — Prompt 10: Commit & Push `UNIT-01` and `UNIT-02` to Git
- **Phase / Stage**: `CONSTRUCTION / Version Control Checkpoint after UNIT-01 & UNIT-02`
- **User Input**: `"commit and push to git"`
- **Clarifications / Decisions**: Commit and push completed `UNIT-01` (Vocabulary Storage, Claymorphism CSS Design System & `.xlsx` Exporter) and `UNIT-02` (Background Translation Service & Message Router) along with updated AI-DLC tracking artifacts to `origin/main`.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 10 audit log entry prior to committing.
- **Verification & Gate Status**: Committed and pushed to `origin/main`; next unit in queue remains **`UNIT-03` (Content Script — Shadow DOM Claymorphism Selection Popup, `CSS.highlights` Engine & Hover Tooltip)**.

---

## [2026-11-15T19:51:35-08:00] — Prompt 11: Implement `UNIT-03` (Content Script — Shadow DOM Claymorphism Popup, `CSS.highlights` Engine & Hover Tooltip)
- **Phase / Stage**: `CONSTRUCTION / UNIT-03: Content Script (CSS.highlights & Shadow DOM UI)`
- **User Input**: `"implement Unit-03"`
- **Clarifications / Decisions**: Executed `UNIT-03` implementation and build verification.
- **Artifacts & Files Updated**:
  - [`src/content/index.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/content/index.ts) — Implemented [`ContentHighlighterController`](file:///home/antigravity/phungvansyhb/Project_X/src/content/index.ts#L317-L796) and [`initContentHighlighter`](file:///home/antigravity/phungvansyhb/Project_X/src/content/index.ts#L800-L810):
    - Shadow DOM host (`#project-x-shadow-host`) with Soft Pastel Claymorphism + Dark Clay CSS variables and pop-in animations.
    - `CSS.highlights` (`::highlight(project-x-vocab)`) text-node scanner (`TreeWalker`) that highlights all occurrences of saved words for the current page URL and re-applies highlights automatically on page load and storage updates.
    - Selection listener (`mouseup`) supporting `auto`, `icon`, and `manual` modes, showing the Claymorphism translation popup with pronunciation (`speechSynthesis`) and auto-saving by URL.
    - `requestAnimationFrame`-throttled `mousemove` range hit-tester (`Range.getClientRects()`) that renders the Claymorphism hover meaning tooltip when hovering over any highlighted word on the page.
    - Smooth scroll-to-word support (`SCROLL_TO_VOCAB`).
  - [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) & [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md) — Marked `UNIT-03` as completed `[x]`.
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 11 audit entry.
- **Verification & Gate Status**: `npm run typecheck && npm run build` passed with 0 errors. Next unit in queue: **`UNIT-04` (Claymorphism Side Panel, Popup, Options Page & Cross-Browser Manifest Upgrade)**.

---

## [2026-11-15T19:55:25-08:00] — Prompt 12: Local Testing Guide & Self-Contained `content.js` Bundle Fix
- **Phase / Stage**: `CONSTRUCTION / Local Verification & Bundler Hardening`
- **User Input**: `"làm sao để test trên local?"`
- **Clarifications / Decisions**:
  - Provided step-by-step instructions for testing locally via two modes: (1) loading unpacked `dist/` in Chrome/Edge/Brave/Firefox and (2) running the interactive Vite Dev Workbench (`npm run dev`).
  - Enhanced `vite.config.ts` with `bundleExtensionScriptsPlugin()` so `dist/content.js` is bundled as a self-contained IIFE script (preventing `Cannot use import statement outside a module` in browser content scripts).
- **Artifacts & Files Updated**:
  - [`vite.config.ts`](file:///home/antigravity/phungvansyhb/Project_X/vite.config.ts) — Added `bundleExtensionScriptsPlugin()` to output self-contained `dist/content.js` (IIFE) and `dist/background.js` (ESM).
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 12 audit entry.
- **Verification & Gate Status**: Verified `npm run build` produces self-contained `dist/content.js` and `dist/background.js`. Ready for **`UNIT-04`**.

---

## [2026-11-15T19:58:12-08:00] — Prompt 13: Commit & Push `UNIT-03` and Bundler Updates to Git
- **Phase / Stage**: `CONSTRUCTION / Version Control Checkpoint after UNIT-03`
- **User Input**: `"Commit and push"`
- **Clarifications / Decisions**: Stage, commit, and push completed `UNIT-03` (`src/content/index.ts` Shadow DOM Claymorphism popup, `CSS.highlights` engine, and `mousemove` hover tooltip) plus `vite.config.ts` IIFE content script bundler and AI-DLC tracking updates to `origin/main`.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 13 audit entry prior to committing.
- **Verification & Gate Status**: Committed and pushed to `origin/main`; next unit in queue: **`UNIT-04` (Claymorphism Side Panel, Popup, Options Page & Cross-Browser Manifest Upgrade)**.

---

## [2026-11-15T20:05:30-08:00] — Prompt 14: Implement `UNIT-04` (Claymorphism Side Panel, Popup, Options Page, Dev Workbench & Cross-Browser Manifest)
- **Phase / Stage**: `CONSTRUCTION / UNIT-04 & Stage 2.5 Full Build Verification`
- **User Input**: `"proceed UNIT-04"`
- **Clarifications / Decisions**: Executed `UNIT-04` implementation and full production build verification.
- **Artifacts & Files Updated**:
  - [`src/sidepanel/SidePanelApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/sidepanel/SidePanelApp.tsx) — Upgraded to **Claymorphism** vocabulary companion displaying **This Page** vs. **All Pages** highlighted words, quick translate input, search bar, inline meaning editor, audio pronunciation (`🔊`), scroll-to-word (`🎯`), and **Export Excel (`.xlsx`)** button.
  - [`src/popup/PopupApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/popup/PopupApp.tsx) — Upgraded to **Claymorphism** toolbar popup listing current-page highlighted words with one-click **Export Excel (`.xlsx`)** and Side Panel / Options launchers.
  - [`src/options/OptionsApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/options/OptionsApp.tsx) — Added full **Translator & Highlight** settings (Target Language, Free Google Translate / Gemini / OpenAI / DeepL API key, Selection Mode: `auto` / `icon` / `manual`, `::highlight()` color palette), **Claymorphism Theme** settings, and **Storage & Excel** export.
  - [`src/dev/main.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/dev/main.tsx) — Added the **Interactive Reading & Highlight Simulator** connected to [`initContentHighlighter`](file:///home/antigravity/phungvansyhb/Project_X/src/content/index.ts#L800-L810) alongside the live Claymorphism Side Panel.
  - [`public/manifest.json`](file:///home/antigravity/phungvansyhb/Project_X/public/manifest.json) — Added `host_permissions: ["<all_urls>"]`, `sidebar_action`, and `browser_specific_settings.gecko` for Chrome, Edge, Brave, Firefox, and Safari compatibility.
  - [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) & [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md) — Marked `UNIT-04` and `Stage 2.5` as completed `[x]`.
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 14 audit entry.
- **Verification & Gate Status**: `npm run typecheck && npm run build` passed with 0 errors. All 4 Construction Units (`UNIT-01` → `UNIT-04`) are complete.

---

## [2026-11-15T20:07:24-08:00] — Prompt 15: Commit & Push `UNIT-04` and Completed Construction Phase to Git
- **Phase / Stage**: `OPERATIONS / Version Control Release Checkpoint after UNIT-04`
- **User Input**: `"let push"`
- **Clarifications / Decisions**: Stage, commit, and push `UNIT-04` (`src/sidepanel/SidePanelApp.tsx`, `src/popup/PopupApp.tsx`, `src/options/OptionsApp.tsx`, `src/dev/main.tsx`, `public/manifest.json`) and updated AI-DLC state/plan/audit docs to `origin/main`.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 15 audit entry prior to committing.
- **Verification & Gate Status**: Committed and pushed to `origin/main`. All Construction and Operations milestones complete.


---

## [2026-11-16T13:21:00+07:00] — Prompt 16: Debug & Fix Extension Manifest & Runtime Errors
- **Phase / Stage**: `OPERATIONS / Extension Debugging & Runtime Hardening`
- **User Input**: `"help me debug extensions error"`
- **Clarifications / Decisions**:
  - Audited `public/manifest.json`, `vite.config.ts`, `src/shared/storage.ts`, `src/background/index.ts`, `src/content/index.ts`, and generated `dist/` bundles for Chrome MV3 errors.
  - Identified and resolved 4 root causes of extension errors:
    1. **`ReferenceError: process is not defined` in `dist/background.js` & `dist/content.js`**: `src/shared/storage.ts` imported React hooks, pulling CJS `react` (with `process.env.NODE_ENV`) into both the Service Worker and Content Script bundles, while `vite.config.ts` `lib` builds did not define `process.env.NODE_ENV`.
    2. **Chrome MV3 Manifest Warning/Error (`sidebar_action` / `browser_specific_settings`)**: Removed Firefox-only keys from `public/manifest.json` and added `"tabs"` permission for reliable `tab.url` / `tab.title` access from Side Panel and Popup.
    3. **Context Menu Registration Race (`Unchecked runtime.lastError`)**: Serialized `setupContextMenu()` in `src/background/index.ts`, swallowed `runtime.lastError` safely, and added `runtime.onStartup` sync.
    4. **Content Script Listener & Sync Cleanup**: Fixed `return false` vs `return true` on synchronous vs async `onMessage` responses and scoped `BroadcastChannel` sync to non-extension fallback mode.
- **Artifacts & Files Updated**:
  - Created [`src/shared/storageHooks.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/shared/storageHooks.ts) — Extracted `useExtensionSettings` and `useThemeSync` React hooks away from [`src/shared/storage.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/shared/storage.ts).
  - Updated [`src/options/OptionsApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/options/OptionsApp.tsx), [`src/popup/PopupApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/popup/PopupApp.tsx), and [`src/sidepanel/SidePanelApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/sidepanel/SidePanelApp.tsx) to import hooks from `src/shared/storageHooks.ts`.
  - Updated [`vite.config.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/vite.config.ts) — Added `define: { 'process.env.NODE_ENV': JSON.stringify('production') }` to `content.js` and `background.js` library builds.
  - Updated [`public/manifest.json`](file:///c:/Users/63200467/Documents/codes/Project_X/public/manifest.json) — Removed Firefox-only `sidebar_action` and `browser_specific_settings`; added `"tabs"` permission.
  - Updated [`src/background/index.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/background/index.ts) and [`src/content/index.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/content/index.ts).
  - Updated [`aidlc-docs/aidlc-state.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/aidlc-state.md) and [`aidlc-docs/audit.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/audit.md).
- **Verification & Gate Status**:
  - `npm run typecheck` and `npm run build` passed with 0 errors.
  - Verified `dist/background.js` (14,600 bytes) and `dist/content.js` (29,577 bytes) contain zero `process` or `React` references.
  - Verified `dist/background.js` executes cleanly in a headless Service Worker `vm` sandbox (`SW_SMOKE_OK`).


---

## [2026-11-16T13:37:00+07:00] — Prompt 17: Theme-Aware Export Excel Buttons
- **Phase / Stage**: `OPERATIONS / UI Theme Consistency Polish`
- **User Input**: `"The color of Export Excel button should follow extension theme"`
- **Clarifications / Decisions**:
  - Replaced hardcoded emerald green (`btn-emerald`) on all **Export Excel** buttons with theme-reactive `btn-primary` (`--clay-accent-gradient` + `--clay-accent-shadow` synced via `data-theme` and `data-accent`).
  - Changed `Backup Raw JSON` in the Options Storage tab to `btn-secondary` so `Export All to Excel (.xlsx)` remains the primary themed CTA.
  - Added `:disabled` styling for `.btn` / `.clay-btn` and removed the unused `.btn-emerald` / `.clay-btn-emerald` class from `src/shared/styles.css`.
- **Artifacts & Files Updated**:
  - [`src/sidepanel/SidePanelApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/sidepanel/SidePanelApp.tsx) — Updated `Export Excel` button to `btn-primary`.
  - [`src/popup/PopupApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/popup/PopupApp.tsx) — Updated `Export Excel` button to `btn-primary`.
  - [`src/options/OptionsApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/options/OptionsApp.tsx) — Updated header `Export All Excel` and Storage tab `Export All to Excel (.xlsx)` buttons to `btn-primary`, and `Backup Raw JSON` to `btn-secondary`.
  - [`src/shared/styles.css`](file:///c:/Users/63200467/Documents/codes/Project_X/src/shared/styles.css) — Replaced `.btn-emerald` / `.clay-btn-emerald` with `.btn:disabled, .clay-btn:disabled` styling.
  - [`aidlc-docs/aidlc-state.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/aidlc-state.md) & [`aidlc-docs/audit.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/audit.md).
- **Verification & Gate Status**: `npm run typecheck` and `npm run build` passed with exit code `0`.


---

## [2026-11-16T13:45:00+07:00] — Prompt 18: Display IPA Phonetics on Hover Tooltip & Saved Vocabulary
- **Phase / Stage**: `OPERATIONS / Feature Enhancement — Hover IPA Display`
- **User Input**: `"when a text was translated, hover on it will also display ipa"`
- **Clarifications / Decisions**:
  - Added `phonetic?: string` to `VocabItem` in `src/shared/storage.ts` and persisted `result.phonetic` across all `saveVocabItem` flows (auto-save in background, context menu, manual `"Save & Highlight"` button, and Dev Workbench fallback).
  - Enhanced `src/background/translator.ts` (`fetchWordDictionaryMeta` & `lookupIpa`) to resolve IPA for single words, short phrases (up to 5 words), and offline glossary terms with in-memory caching and `AbortController` timeouts.
  - Added `FETCH_IPA` background message route and `requestIpa` helper so hovering previously saved words without stored IPA lazily fetches, displays, and backfills `phonetic` via `updateVocabItemPhonetic`.
  - Updated `showHoverTooltip` and `.px-source-wrap` / `.px-phonetic` layout in `src/content/index.ts`, plus `SidePanelApp.tsx` and `PopupApp.tsx` to display IPA cleanly.
- **Artifacts & Files Updated**:
  - [`src/shared/storage.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/shared/storage.ts)
  - [`src/background/translator.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/background/translator.ts)
  - [`src/background/index.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/background/index.ts)
  - [`src/shared/messaging.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/shared/messaging.ts)
  - [`src/content/index.ts`](file:///c:/Users/63200467/Documents/codes/Project_X/src/content/index.ts)
  - [`src/sidepanel/SidePanelApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/sidepanel/SidePanelApp.tsx)
  - [`src/popup/PopupApp.tsx`](file:///c:/Users/63200467/Documents/codes/Project_X/src/popup/PopupApp.tsx)
  - [`aidlc-docs/aidlc-state.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/aidlc-state.md) & [`aidlc-docs/audit.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/audit.md)
- **Verification & Gate Status**: `npm run typecheck`, `npm run build`, and Service Worker `vm` `FETCH_IPA` smoke test passed with exit code `0`.


---

## [2026-11-16T13:47:00+07:00] — Prompt 19: Commit & Push Extension Fixes, Theme Export Button, and Hover IPA
- **Phase / Stage**: `OPERATIONS / Version Control Checkpoint`
- **User Input**: `"commit and push"`
- **Clarifications / Decisions**: Stage, commit, and push extension runtime/manifest fixes, themed Export Excel buttons, hover IPA display, and updated AI-DLC tracking docs to `origin/main`.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/audit.md) — Appended Prompt 19 audit entry prior to committing.
- **Verification & Gate Status**: Staged and committed locally on `main`; `git push origin main` blocked by remote endpoint error (`fatal: https://github.com/phungvansyhb/Project_X.git/info/refs not valid: is this a git repository?`).


---

## [2026-11-16T13:49:00+07:00] — Prompt 20: Generate Git Patch File for Blocked Push
- **Phase / Stage**: `OPERATIONS / Offline Git Change Export`
- **User Input**: `"công ty tôi chặn push code , hãy tạo file git change"`
- **Clarifications / Decisions**: Generated a UTF-8 `git format-patch` file (`project-x-changes.patch`) from `origin/main..HEAD` so all committed changes can be transferred and applied on another machine via `git am project-x-changes.patch` or `git apply project-x-changes.patch`.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///c:/Users/63200467/Documents/codes/Project_X/aidlc-docs/audit.md) — Appended Prompt 20 audit entry.
  - [`project-x-changes.patch`](file:///c:/Users/63200467/Documents/codes/Project_X/project-x-changes.patch) — Generated Git patch file containing all changes ahead of `origin/main`.
- **Verification & Gate Status**: Verified patch applies cleanly (`git apply --stat` and `git apply --check` in a detached test worktree/index check).

---

## [2026-11-15T22:51:30-08:00] — Prompt 21: Apply Attached Patch (`project-x-changes.patch`)
- **Phase / Stage**: `OPERATIONS / Patch Integration & Build Verification`
- **User Input**: `"apply change from patch file"` (`file:///home/antigravity/project-x-changes.patch`)
- **Clarifications / Decisions**:
  - Applied `/home/antigravity/project-x-changes.patch` (`fix(extension): resolve MV3 runtime/manifest errors, theme Export Excel buttons, and display IPA on hover`) to `/home/antigravity/phungvansyhb/Project_X`.
- **Artifacts & Files Updated**:
  - Applied patch across 15 files:
    - Created [`src/shared/storageHooks.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/storageHooks.ts)
    - Updated [`public/manifest.json`](file:///home/antigravity/phungvansyhb/Project_X/public/manifest.json), [`vite.config.ts`](file:///home/antigravity/phungvansyhb/Project_X/vite.config.ts), [`src/background/index.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/background/index.ts), [`src/background/translator.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/background/translator.ts), [`src/content/index.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/content/index.ts), [`src/shared/messaging.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/messaging.ts), [`src/shared/storage.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/storage.ts), [`src/shared/styles.css`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/styles.css), [`src/sidepanel/SidePanelApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/sidepanel/SidePanelApp.tsx), [`src/popup/PopupApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/popup/PopupApp.tsx), [`src/options/OptionsApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/options/OptionsApp.tsx), and [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md).
  - Appended Prompt 21 audit entry to [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md).
- **Verification & Gate Status**: `git apply` succeeded cleanly and `npm run typecheck && npm run build` passed with exit code `0`.

---

## [2026-11-15T22:55:06-08:00] — Prompt 22: Commit & Push Applied Patch Changes to Git (Excluding Patch File)
- **Phase / Stage**: `OPERATIONS / Version Control Release Checkpoint`
- **User Input**: `"commit and push, do not include path file"`
- **Clarifications / Decisions**: Stage, commit, and push all applied changes (MV3 runtime/manifest fixes, theme-aware Export Excel buttons, IPA phonetics on hover & saved vocabulary, and AI-DLC state/audit updates) to `origin/main` while excluding `project-x-changes.patch`.
- **Artifacts & Files Updated**:
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Appended Prompt 22 audit entry prior to committing.
- **Verification & Gate Status**: Verified `git status` excludes `.patch` files; committed and pushed to `origin/main`.
