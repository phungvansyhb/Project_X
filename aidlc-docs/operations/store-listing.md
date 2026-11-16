# Browser Extension Store Listing & Promotional Copy (`LingoGlow`)

Ready-to-publish copy and visual asset specifications for **Chrome Web Store**, **Microsoft Edge Add-ons**, **Firefox Add-ons (AMO)**, and **Apple Safari App Store**.

---

## 1. Store Metadata

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Store Title / Name** | `LingoGlow — Instant Web Translator & Smart Vocab Highlighter` | 60 chars (within Chrome 75-char limit) |
| **Short Name** | `LingoGlow` | Used in compact browser UI |
| **Short Description / Tagline** | `Select any text to translate & glow-highlight on the page. Hover for meaning + IPA pronunciation, and export word lists to Excel.` | 129 chars (within Chrome 132-char limit) |
| **Category** | `Productivity` / `Education` | |
| **Languages Supported** | All major web languages (`en`, `vi`, `ja`, `ko`, `zh-CN`, `fr`, `de`, `es`, etc.) | |

---

## 2. Store Visual Assets

| Asset | File Path | Exact Size | Purpose |
| :--- | :--- | :--- | :--- |
| **Store Icon** | `public/icons/icon-128.png` | `128 × 128` PNG (RGBA) | Chrome Web Store / Edge / Firefox extension icon |
| **Marquee Promo Tile / Hero Cover** | `docs/assets/lingoglow-cover-marquee.png` | `1400 × 560` PNG | Chrome Web Store featured marquee & GitHub README hero |
| **Small Promo Tile** | `docs/assets/lingoglow-promo-small.png` | `440 × 280` PNG | Chrome Web Store search & category tile |

---

## 3. Full Store Description (Copy & Paste)

```text
Read any webpage effortlessly. Highlight words that stick. Export your vocabulary to Excel in one click.

LingoGlow turns every article, documentation page, or blog post into an interactive language-learning workspace—without ever breaking your reading flow.

HOW IT WORKS IN 3 SECONDS:
1. SELECT ANY WORD OR PHRASE — A clean Claymorphism popup translates it instantly right where you're reading.
2. AUTOMATICALLY GLOW-HIGHLIGHT — Every occurrence of that word on the page lights up and stays saved to that page's URL.
3. HOVER FOR MEANING & IPA — Move your mouse over any highlighted word anytime to see its translation, IPA phonetic transcription, and listen to pronunciation.
4. EXPORT TO EXCEL (.XLSX) — Click the LingoGlow icon to review all saved words on the current page (or across your whole library) and export a clean .xlsx study deck in 1 click.

KEY FEATURES:
• Works Out of the Box — Zero sign-up or API key required. Instant translation + IPA phonetic lookup.
• Optional AI Providers (BYOK) — Connect your own Gemini, OpenAI, or DeepL API key in Settings whenever you want context-rich AI translations.
• Persistent Page Highlights — Revisit any article later and your saved vocabulary glows automatically across the page.
• Non-Destructive Highlight Engine — Built with the native browser Custom Highlight API so modern websites never glitch or break.
• URL-Organized Side Panel & Popup — Filter words by "This Page" or "All Pages", search, edit meanings inline, jump straight to any highlighted word, or pronounce it aloud.
• 1-Click Excel (.xlsx) Export — Generates a genuine Excel spreadsheet with Source Text and Translated Meaning columns—ready for Excel, Google Sheets, Anki, or Quizlet.
• Soft Pastel & Dark Clay Themes — Choose from 4 highlight colors (Sunny Yellow, Mint Emerald, Sky Blue, Coral Rose) and Light, Dark, or System themes.

100% PRIVATE & LOCAL:
No accounts, no tracking, no analytics. Your vocabulary lists, page URLs, and optional API keys stay strictly on your own device.
```

---

## 4. Recommended Screenshot Captions (for 1280×800 Store Screenshots)

1. **Screenshot 1 — Instant Translate & Glow**: *"Select any word to translate instantly and highlight every occurrence on the page."*
2. **Screenshot 2 — Hover Meaning + IPA**: *"Hover over any highlighted word to view its meaning, IPA phonetics, and audio pronunciation."*
3. **Screenshot 3 — Side Panel Word Bank**: *"Browse saved vocabulary for the current page or your entire reading history."*
4. **Screenshot 4 — 1-Click Excel Export**: *"Export clean .xlsx study spreadsheets in one click for effortless review."*
5. **Screenshot 5 — Themes & AI Providers**: *"Customize highlight colors, Light/Dark Clay themes, or add your own Gemini/OpenAI/DeepL key."*

---

## 5. Chrome Web Store Permission Justifications

- **`storage`**: Stores the user's saved vocabulary (grouped by page URL), theme preferences, highlight color, and optional user-supplied translation API key locally on the device.
- **`sidePanel`**: Displays the persistent LingoGlow vocabulary companion panel alongside the active webpage.
- **`tabs` & `activeTab`**: Reads the active tab's normalized URL and title so the Popup and Side Panel automatically filter saved words for the page the user is reading.
- **`contextMenus`**: Adds the optional *"Translate & Glow with LingoGlow"* entry to the browser right-click text selection menu.
- **`host_permissions` (`<all_urls>`)**: Enables the content script to render the selection translator popup, re-apply saved highlights, and show hover IPA tooltips on any webpage the user reads.
