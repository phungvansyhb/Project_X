# AI-DLC Master Execution Plan (`execution-plan.md`)

- **Phase**: `INCEPTION`
- **Stage**: `Workflow Planning`
- **Gate Status**: `Awaiting Gate 1 Approval to execute Construction Units`

---

## 1. Adaptive Stage Selection Summary

| Phase | Stage | Execution Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **INCEPTION** | Workspace Detection | **Executed (Completed)** | Established existing Vite + React + TS MV3 baseline. |
| **INCEPTION** | Requirements Analysis | **Executed (Completed)** | Clarified translation engine, selection behavior, `CSS.highlights`, and Excel `.xlsx` columns. |
| **INCEPTION** | User Stories | **Executed (Completed)** | 6 core user stories (`US-01` to `US-06`) mapped to requirements. |
| **INCEPTION** | Application Design | **Executed (Completed)** | Defined Shadow DOM + `CSS.highlights` + `mousemove` range hit-testing architecture. |
| **INCEPTION** | Units Generation | **Executed (Completed)** | Split into 4 sequential Units (`UNIT-01` to `UNIT-04`). |
| **CONSTRUCTION** | Per-Unit Design & Code Gen | **Planned (Next)** | Execute `UNIT-01` → `UNIT-02` → `UNIT-03` → `UNIT-04`. |
| **CONSTRUCTION** | Build & Type Verification | **Planned (Next)** | Run `tsc -b && vite build` after Construction units. |
| **OPERATIONS** | Cross-Browser Packaging | **Planned** | Verify `dist/` bundle for Chrome, Edge, Brave, Firefox, and Safari. |

---

## 2. Construction Execution Sequence

1. **`UNIT-01`**: Build `src/shared/storage.ts` (URL-grouped vocabulary store + translation settings) and `src/shared/excelExport.ts` (native `.xlsx` generator with `Source Text` and `Translated Meaning`).
2. **`UNIT-02`**: Build `src/background/translator.ts`, `src/background/index.ts`, and `src/shared/messaging.ts` (Google Translate free endpoint + optional Gemini/OpenAI/DeepL API support).
3. **`UNIT-03`**: Build `src/content/index.ts` (Shadow DOM popup translator, `CSS.highlights` multi-occurrence text highlighter, and `mousemove` range hover meaning tooltip).
4. **`UNIT-04`**: Upgrade `SidePanelApp.tsx`, `PopupApp.tsx`, `OptionsApp.tsx`, `src/dev/main.tsx` (with interactive reading simulator), and `public/manifest.json`.
5. **Build & Test Gate**: Run `npm run build` and verify zero TypeScript or bundler errors.
