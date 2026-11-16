# Operations Phase Rules (`instructions/operations/operations-rules.md`)

## Purpose
The **Operations Phase** governs cross-browser packaging, manifest verification, store readiness, and ongoing maintenance of **Project X**.

---

## Stage 1: Cross-Browser Build & Packaging
- Verify `dist/` output contains all entry points declared in `public/manifest.json`:
  - `sidepanel.html`, `options.html`, `popup.html`
  - `background.js`, `content.js`
  - `icons/icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`
- Ensure compatibility targets documented in [`aidlc-docs/operations/release-and-packaging.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/operations/release-and-packaging.md):
  - **Chromium (Chrome, Edge, Brave)**: Unpacked `dist/` or zipped release.
  - **Firefox**: WebExtensions MV3 (`browser_specific_settings.gecko`, `sidebar_action` fallback).
  - **Safari**: `xcrun safari-web-extension-converter dist/`.

## Stage 2: Continuous Feedback Loop
- Any bug report, UX adjustment, or new feature request triggers a new scoped cycle recorded in `aidlc-docs/aidlc-state.md` and `aidlc-docs/audit.md`.
