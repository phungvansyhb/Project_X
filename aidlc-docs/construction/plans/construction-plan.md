# Construction Phase Plan (`construction-plan.md`)

- **Phase**: `CONSTRUCTION`
- **Cadence**: `Per-Unit (Bolt) Execution`

---

## Unit Checklist & Functional Specifications

### [x] `UNIT-01`: Storage, Claymorphism Design System & Excel (`.xlsx`) Exporter
- **Files**: `src/shared/storage.ts`, `src/shared/styles.css`, `src/shared/excelExport.ts`
- **Key Interfaces**:
  - `VocabItem`: `{ id, sourceText, translatedText, targetLang, pageUrl, pageTitle, createdAt }`
  - `ExtensionSettings`: adds `targetLang`, `translationProvider` (`'google' | 'gemini' | 'openai' | 'deepl'`), `apiKey`, `autoTranslateOnSelect`, `highlightColor` (`'yellow' | 'emerald' | 'sky' | 'rose'`), `vocabByUrl`.
  - `src/shared/styles.css`: Implements Soft Pastel Claymorphism + Dark Clay tokens (`--clay-shadow-card`, `--clay-shadow-sm`, `--clay-shadow-inset`), `20px–24px` radii, `Plus Jakarta Sans` / `Nunito` typography, and tactile press-down micro-interactions per [`ui-design.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/application-design/ui-design.md).
  - `exportVocabToExcel(items: VocabItem[], filename?: string)`: Generates a valid `.xlsx` binary Blob (ZIP with OpenXML worksheet) with headers `Source Text` and `Translated Meaning` and triggers browser download.

### [x] `UNIT-02`: Background Translation Service & Messaging
- **Files**: `src/background/translator.ts`, `src/background/index.ts`, `src/shared/messaging.ts`
- **Key Functions**:
  - `translateText(text: string, targetLang: string, settings: ExtensionSettings): Promise<{ translatedText: string; detectedSourceLang?: string; provider: string }>`
  - Handles `TRANSLATE_TEXT`, `GET_ACTIVE_TAB_INFO`, and `SCROLL_TO_VOCAB` messages.

### [x] `UNIT-03`: Content Script (`CSS.highlights` & Shadow DOM UI)
- **Files**: `src/content/index.ts`
- **Key Responsibilities**:
  - Listen for `mouseup` text selection → call `TRANSLATE_TEXT` → show Shadow DOM translation popup → auto-save word for `normalizePageUrl(location.href)` → apply `CSS.highlights`.
  - Scan DOM text nodes with `TreeWalker` on load and on `storage.onChanged` to create `Range` objects for all occurrences of saved words on the current URL and register them into `CSS.highlights.set('project-x-vocab', highlight)`.
  - Listen for `mousemove` (throttled via `requestAnimationFrame`) → hit-test `Range.getClientRects()` → show Shadow DOM hover tooltip with meaning, pronunciation button, and delete button.

### [ ] `UNIT-04`: Side Panel, Popup, Options Page & Dev Workbench
- **Files**: `src/sidepanel/SidePanelApp.tsx`, `src/popup/PopupApp.tsx`, `src/options/OptionsApp.tsx`, `src/dev/main.tsx`, `public/manifest.json`
- **Key Responsibilities**:
  - Side Panel & Popup display **Current Page Words** (filtered by active tab URL) and **All Pages Words**, with search, delete, scroll-to-highlight, and **Export Excel (`.xlsx`)**.
  - Options Page configures Target Language, Provider & API Key, Selection Mode, and Highlight Color.
  - Dev Workbench (`src/dev/main.tsx`) includes an interactive sample article so selecting text, `CSS.highlights`, hover tooltips, and Excel export can be tested directly in preview mode.
