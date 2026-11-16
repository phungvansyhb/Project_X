# Operations Phase: Cross-Browser Packaging & Release (`release-and-packaging.md`)

- **Phase**: `OPERATIONS`
- **Target Browsers**: Chrome, Edge, Brave, Firefox, Safari

---

## 1. Build Pipeline
```bash
npm run typecheck
npm run build
```
Outputs production assets into `dist/`.

## 2. Browser Loading & Packaging Matrix

| Browser | Manifest Support | Loading Instructions |
| :--- | :--- | :--- |
| **Chrome / Edge / Brave** | Manifest V3 (`side_panel`, `service_worker`) | Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select `dist/`. |
| **Firefox** | Manifest V3 (`browser_specific_settings.gecko`, `sidebar_action`) | Open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, select `dist/manifest.json`. |
| **Safari** | Safari Web Extension Wrapper | Run `xcrun safari-web-extension-converter dist/` and build in Xcode. |
