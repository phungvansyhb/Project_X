# User Stories (`user-stories.md`)

- **Phase**: `INCEPTION`
- **Stage**: `User Stories`
- **Traceability**: Mapped to [`requirements.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/requirements/requirements.md)

---

## `US-01`: Instant Select-to-Translate & Auto-Highlight (`FR-01`, `FR-02`, `FR-03`, `FR-05`)
**As a** web reader learning vocabulary,
**I want** to select a word or phrase on any webpage and immediately see its translation while having it highlighted and saved automatically,
**So that** I can understand unfamiliar text without leaving my reading flow.

### Acceptance Criteria
- **Given** I am reading an article on any standard webpage and `autoTranslateOnSelect` is enabled,
- **When** I highlight/select a word or phrase with my mouse,
- **Then** a Shadow DOM popup appears near my selection displaying the translated meaning,
- **And** the selected word (plus all matching occurrences on the page) is highlighted via `::highlight(project-x-vocab)`,
- **And** the word and its meaning are automatically saved under the current page's URL in `storage.local`.

---

## `US-02`: Hover Highlighted Text to View Meaning (`FR-03`, `FR-04`)
**As a** reader reviewing a page with highlighted vocabulary,
**I want** to hover my cursor over any highlighted word on the page and see its translated meaning in a tooltip,
**So that** I can reinforce my memory whenever I encounter the word again.

### Acceptance Criteria
- **Given** one or more words are highlighted on the current webpage via `CSS.highlights`,
- **When** I move my mouse cursor over any highlighted word's bounding rect,
- **Then** a lightweight tooltip displays the **Source Text** and **Translated Meaning** (along with an option to remove the highlight),
- **And** moving the cursor away hides the tooltip smoothly.

---

## `US-03`: Automatic Re-Highlighting on Page Reload or Revisit (`FR-03`, `FR-05`)
**As a** returning reader,
**I want** the extension to automatically re-highlight all previously saved words when I reload or revisit the same webpage URL,
**So that** my study annotations persist across browser sessions.

### Acceptance Criteria
- **Given** I have previously saved highlighted words on `https://example.com/article`,
- **When** I reload or navigate back to `https://example.com/article`,
- **Then** the Content Script retrieves saved words for that URL from local storage, scans the page text nodes, and highlights all occurrences via `CSS.highlights`.

---

## `US-04`: View Current-Page & All-Pages Highlighted Words (`FR-06`)
**As a** user clicking the extension toolbar icon,
**I want** to see a list of all words highlighted on the current page (as well as across all visited pages),
**So that** I can review, search, edit, or delete saved vocabulary.

### Acceptance Criteria
- **Given** I click the extension icon to open the Side Panel or Popup,
- **When** the panel opens,
- **Then** the default **Current Page** view lists all words saved for the active tab's URL,
- **And** I can switch to the **All Pages** view to browse vocabulary grouped by webpage URL.

---

## `US-05`: Export Vocabulary to Excel (`.xlsx`) (`FR-07`)
**As a** language learner,
**I want** to export my saved words into an Excel (`.xlsx`) spreadsheet containing **Source Text** and **Translated Meaning**,
**So that** I can review them offline or import them into flashcard tools.

### Acceptance Criteria
- **Given** I have saved words on the current page or across multiple pages,
- **When** I click **Export Excel (.xlsx)** in the Side Panel, Popup, or Options Page,
- **Then** the browser downloads a valid `.xlsx` workbook with columns `Source Text` and `Translated Meaning`.

---

## `US-06`: Configure Target Language & Translation Provider (`FR-02`)
**As a** user with specific language or AI preferences,
**I want** to configure my target translation language, selection trigger mode, highlight color, and optional API key (Gemini / OpenAI / DeepL) in the Options Page,
**So that** the extension adapts to my workflow.
