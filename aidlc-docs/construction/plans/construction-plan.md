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

### [x] `UNIT-04`: Side Panel, Popup, Options Page & Dev Workbench
- **Files**: `src/sidepanel/SidePanelApp.tsx`, `src/popup/PopupApp.tsx`, `src/options/OptionsApp.tsx`, `src/dev/main.tsx`, `public/manifest.json`
- **Key Responsibilities**:
  - Side Panel & Popup display **Current Page Words** (filtered by active tab URL) and **All Pages Words**, with search, delete, scroll-to-highlight, and **Export Excel (`.xlsx`)**.
  - Options Page configures Target Language, Provider & API Key, Selection Mode, and Highlight Color.
  - Dev Workbench (`src/dev/main.tsx`) includes an interactive sample article so selecting text, `CSS.highlights`, hover tooltips, and Excel export can be tested directly in preview mode.

### [x] `UNIT-05`: Brand Identity Overhaul (**LingoGlow**) & Conversion-Focused Extension Introduction
- **Target Brand**: **LingoGlow — Instant Web Translator & Smart Vocab Highlighter** (`short_name`: `LingoGlow`)
- **Positioning**: Benefit-led, high-conversion copy centered on effortless reading, instant IPA + meaning on hover, and 1-click Excel (`.xlsx`) study deck export (zero jargon like `CSS ::highlight()` in user-facing store/UI copy).
- **Planned Scope**:
  1. **Extension Manifest, Package & HTML Entry Titles**:
     - [`public/manifest.json`](file:///home/antigravity/phungvansyhb/Project_X/public/manifest.json): Update `name` (`"LingoGlow — Instant Web Translator & Smart Vocab Highlighter"`), `short_name` (`"LingoGlow"`), `action.default_title` (`"LingoGlow — View Saved Words & Export"`), and `description` (≤132 chars, conversion-focused).
     - [`package.json`](file:///home/antigravity/phungvansyhb/Project_X/package.json): Update `name` (`"lingoglow-extension"`) and `description`.
     - [`index.html`](file:///home/antigravity/phungvansyhb/Project_X/index.html), [`popup.html`](file:///home/antigravity/phungvansyhb/Project_X/popup.html), [`sidepanel.html`](file:///home/antigravity/phungvansyhb/Project_X/sidepanel.html), [`options.html`](file:///home/antigravity/phungvansyhb/Project_X/options.html): Update `<title>` tags to **LingoGlow**.
  2. **README.md & Web Store Listing Copy**:
     - Rewrite [`README.md`](file:///home/antigravity/phungvansyhb/Project_X/README.md) from outdated template copy into a conversion-focused product showcase: value-first hero section, "How It Works in 3 Seconds" workflow, key differentiators (Instant Popup + IPA, Persistent Page Glow Highlights, Hover Meaning & Pronunciation, Side Panel Word Bank, 1-Click `.xlsx` Export, Optional Gemini/OpenAI/DeepL BYOK, 100% Local Privacy), cross-browser install CTA, and FAQ.
     - Create `aidlc-docs/operations/store-listing.md` containing ready-to-publish Chrome Web Store, Microsoft Edge Add-ons, Firefox AMO, and Safari copy (short hook, full feature pitch, permission rationale, and screenshot captions).
  3. **In-Extension UI Branding & Welcoming Microcopy** (preserving `STORAGE_KEY = 'project_x_settings'` for backward-compatible user data):
     - [`src/popup/PopupApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/popup/PopupApp.tsx) & [`src/sidepanel/SidePanelApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/sidepanel/SidePanelApp.tsx): Update brand headers/taglines (`LingoGlow`, `"Highlight • Hover IPA • Export .xlsx"`) and replace technical empty-state copy with inviting onboarding copy.
     - [`src/options/OptionsApp.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/options/OptionsApp.tsx): Update header title/subtitle, context menu label description, and exported settings JSON filename (`lingoglow-settings.json` / `lingoglow-all-vocabulary.xlsx`).
     - [`src/background/index.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/background/index.ts) & [`src/content/index.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/content/index.ts): Update context menu title (`"Translate & Glow with LingoGlow"`), launcher tooltip, and popup header badge while keeping internal DOM/CSS IDs safe.
     - [`src/shared/excelExport.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/excelExport.ts) & [`src/shared/storage.ts`](file:///home/antigravity/phungvansyhb/Project_X/src/shared/storage.ts): Update default Excel filename prefix (`lingoglow-vocabulary-*.xlsx`) and welcome note copy while preserving `STORAGE_KEY`.
     - [`src/dev/main.tsx`](file:///home/antigravity/phungvansyhb/Project_X/src/dev/main.tsx): Update simulator copy to showcase **LingoGlow**.
  4. **Visual Brand Assets — Claymorphism Logo, Extension Icons & Store Cover Images**:
     - Generate a custom 3D **Claymorphism LingoGlow** icon (**Glowing Highlighter + Speech Sparkle** on an indigo-violet squircle with golden-yellow highlight glow) and resize via Pillow into crisp transparent-corner `16×16`, `32×32`, `48×48`, and `128×128` PNGs in `public/icons/` (replacing the generic `"X"` icon).
     - Add a matching crisp `LingoGlowLogo` inline SVG mark in `PopupApp.tsx`, `SidePanelApp.tsx`, and `OptionsApp.tsx` headers.
     - Generate & size store/GitHub cover assets in `docs/assets/` (kept outside `public/` so `dist/` stays lean):
       - `docs/assets/lingoglow-cover-marquee.png` (`1400×560` — README hero cover & Chrome Web Store / Edge Marquee Promo Tile)
       - `docs/assets/lingoglow-promo-small.png` (`440×280` — Chrome Web Store Small Promo Tile)
     - Embed the hero cover banner in `README.md` and reference store asset specs in `aidlc-docs/operations/store-listing.md`.
- **Verification Gate**: Run `npm run typecheck && npm run build`, verify `dist/manifest.json`, `dist/icons/*.png` dimensions (`16/32/48/128`), `docs/assets/*.png` dimensions (`1400×560`, `440×280`), HTML titles, and built JS bundles with zero errors.

---

### [x] `UNIT-06`: Context-Aware Word Translation & Disambiguation Engine
- **Goal**: Dramatically increase word/phrase translation accuracy by extracting surrounding paragraph context from the DOM and passing it to all supported translation engines (Google Translate Free, Gemini, OpenAI, DeepL), while displaying part-of-speech, quick-switch alternative meanings in the popup, and saving the context sentence in the Side Panel.
- **Files to Create / Modify**:
  1. `src/shared/storage.ts` — Add optional `partOfSpeech`, `contextSentence`, `alternativeMeanings` to `VocabItem`; add `enableContextTranslation: boolean` (default `true`) to `ExtensionSettings`; update `saveVocabItem`.
  2. `src/content/contextExtractor.ts` *(new)* — Smart DOM context extractor: locates nearest semantic block (`p`, `li`, `blockquote`, `div`, etc.), computes exact selection offset to handle repeated words, splits sentences (abbreviation-aware), and returns `contextSentence` (≤240 chars) + `contextParagraph` (target sentence ±1 neighbor, ≤400 chars). Skips word-in-context mode for long selections (>8 words or >80 chars).
  3. `src/shared/messaging.ts` & `src/background/index.ts` — Pass `contextSentence` & `contextParagraph` in `TRANSLATE_TEXT`; add `GET_SELECTION_CONTEXT` message so right-click context menu also captures surrounding context.
  4. `src/background/translator.ts` — Upgrade all 4 engines:
     - **Gemini & OpenAI**: Structured JSON prompt with selected word, surrounding paragraph (~400 chars), and page title → returns `{ meaning, partOfSpeech, alternatives }`.
     - **DeepL**: Pass official non-billed `context` parameter to `/v2/translate`.
     - **Google Translate Free**: Request `dt=t&dt=bd&dt=at` for POS & candidate meanings + parallel bracketed-sentence contextual disambiguation (`«word»`) with safe validation, sentence-match heuristic fallback, and deduplicated `alternativeMeanings`.
  5. `src/content/index.ts` — Extract context on `mouseup`, show `partOfSpeech` + `Context` badge and 1-click `alternativeMeanings` chips in Shadow DOM popup (clicking a chip updates meaning & saved item), and show `partOfSpeech` in hover tooltip.
  6. `src/sidepanel/SidePanelApp.tsx` — Display `partOfSpeech` badge and saved `contextSentence` quote (with target word bolded) on vocab cards; include `contextSentence` in search filter.
  7. `src/options/OptionsApp.tsx` — Add **Context-Aware Translation** toggle in Translator & Highlight settings.
  8. `src/dev/main.tsx` — Add polysemous sample sentences to the interactive Dev Workbench article for testing.
- **Verification Gate**: `npm run typecheck && npm run build` passes with 0 errors; verify context extraction edge cases, Google/LLM response parsing, UI popup alternative-meaning switching, and Side Panel context display.


