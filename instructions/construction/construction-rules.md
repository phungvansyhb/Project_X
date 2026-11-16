# Construction Phase Rules (`instructions/construction/construction-rules.md`)

## Purpose
The **Construction Phase** determines **HOW** to build each approved Unit ("Bolt") and executes code generation, type-checking, and build verification iteratively per Unit.

---

## Per-Unit Execution Loop (Bolt Cadence)
For each Unit defined in [`aidlc-docs/inception/units/units.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/units/units.md):

### 1. Functional & NFR Design Check
- Verify data structures, TypeScript interfaces, error handling, and browser API fallbacks documented in [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md).
- Ensure DOM safety (use Shadow DOM for injected UI; use `CSS.highlights` with safe fallback so host page frameworks are never broken).

### 2. Code Generation
- Write clean, strictly typed TypeScript/React code inside `src/` and `public/`.
- Maintain cross-browser compatibility (`chrome.*` and `browser.*` namespaces plus `localStorage` dev workbench fallback).

### 3. Build & Test Verification
- Run `npm run typecheck` (`tsc --noEmit`) and `npm run build` (`tsc -b && vite build`) to verify zero compilation or bundling errors.
- Mark the completed Unit `[x]` in `aidlc-docs/aidlc-state.md` and `aidlc-docs/construction/plans/construction-plan.md`.
- Log the completed work in `aidlc-docs/audit.md`.
