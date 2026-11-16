# Implementation Units (`units.md`)

- **Phase**: `INCEPTION`
- **Stage**: `Units Generation`

The implementation is decomposed into **4 cohesive Units (Bolts)** that build cleanly in dependency order.

---

## `UNIT-01`: Vocabulary Storage Schema, Claymorphism Design System & Native Excel (`.xlsx`) Exporter
- **Scope**:
  - Extend `src/shared/storage.ts` with `VocabItem`, `PageVocabGroup`, URL normalization (`normalizePageUrl`), reactive hooks (`useExtensionSettings`), and translation/highlight settings (`targetLang`, `translationProvider`, `apiKey`, `autoTranslateOnSelect`, `highlightColor`).
  - Upgrade `src/shared/styles.css` to the **Soft Pastel Claymorphism + Dark Clay** design standard ([`ui-design.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/application-design/ui-design.md)): 3D dual inner+outer clay shadows (`--clay-shadow-card`, `--clay-shadow-sm`, `--clay-shadow-inset`), `20px–24px` radii, `Plus Jakarta Sans` / `Nunito` rounded typography, and tactile press-down button micro-interactions.
  - Create `src/shared/excelExport.ts` to generate and download a real `.xlsx` Excel workbook containing **`Source Text`** and **`Translated Meaning`** columns.
- **Target Files**:
  - `src/shared/storage.ts`
  - `src/shared/styles.css`
  - `src/shared/excelExport.ts`
- **Dependencies**: None (Foundation Unit).

---

## `UNIT-02`: Background Translation Service & Message Router
- **Scope**:
  - Create `src/background/translator.ts` implementing:
    1. **Free Google Translate + Dictionary API** (default, zero-config).
    2. **Optional Custom API Providers** (Gemini, OpenAI, DeepL) using the user's configured API key in `ExtensionSettings`.
  - Update `src/shared/messaging.ts` and `src/background/index.ts` to handle `TRANSLATE_TEXT` requests from the Content Script, Side Panel, and Dev Workbench, plus right-click context menu translation.
- **Target Files**:
  - `src/background/translator.ts`
  - `src/background/index.ts`
  - `src/shared/messaging.ts`
- **Dependencies**: `UNIT-01`.

---

## `UNIT-03`: Content Script — Shadow DOM Claymorphism Selection Popup, `CSS.highlights` Engine & Hover Tooltip
- **Scope**:
  - Implement `src/content/index.ts` with:
    1. **Shadow DOM Claymorphism UI Host** (`#project-x-shadow-host`) styled with puffy 3D pastel/dark clay cards, inner specular highlights, and springy pop-in animations.
    2. **Text Selection Listener (`mouseup`)**: Detects selected text, requests translation via `TRANSLATE_TEXT`, renders the floating Claymorphism translation popup, and auto-saves + highlights the word for the current URL.
    3. **`CSS.highlights` (`::highlight(project-x-vocab)`) Engine**: Scans text nodes via `TreeWalker` on page load and on storage updates to highlight all occurrences of saved words for the current URL.
    4. **Hover Meaning Clay Tooltip (`mousemove` Range Hit-Tester)**: Detects cursor hover over any highlighted `Range` rect and renders the Claymorphism meaning tooltip with audio pronunciation (`speechSynthesis`) and remove-highlight button.
- **Target Files**:
  - `src/content/index.ts`
- **Dependencies**: `UNIT-01`, `UNIT-02`.

---

## `UNIT-04`: Claymorphism Side Panel, Popup, Options Page & Cross-Browser Manifest Upgrade
- **Scope**:
  - Redesign `src/sidepanel/SidePanelApp.tsx` and `src/popup/PopupApp.tsx` using the **Claymorphism** component library (recessed clay segmented tabs, puffy 3D vocabulary cards, tactile audio/scroll/delete buttons, and prominent 3D **Export to Excel (`.xlsx`)** button).
  - Redesign `src/options/OptionsApp.tsx` with Claymorphism cards to configure Target Language, Translation Provider (Free Google vs. Gemini/OpenAI/DeepL API key), Auto-Translate on Selection toggle, Highlight Color swatch, and Theme/Accent palette.
  - Upgrade `src/dev/main.tsx` so the interactive Dev Workbench includes a live reading simulator where selecting text shows the Claymorphism translation popup, applies `CSS.highlights`, shows the hover meaning tooltip, and syncs live with the Claymorphism Side Panel.
  - Update `public/manifest.json` with `<all_urls>` host permissions and cross-browser fields (Chrome, Edge, Brave, Firefox `gecko`, Safari).
- **Target Files**:
  - `src/sidepanel/SidePanelApp.tsx`
  - `src/popup/PopupApp.tsx`
  - `src/options/OptionsApp.tsx`
  - `src/dev/main.tsx`
  - `public/manifest.json`
- **Dependencies**: `UNIT-01`, `UNIT-02`, `UNIT-03`.
