# AI-DLC (AI-Driven Development Lifecycle) — Core Steering Instructions

This repository follows the standard **AI-Driven Development Lifecycle (AI-DLC)** methodology. All AI coding agents working in this repository MUST adhere to the workflow rules, phase gates, and artifact conventions defined below and in [`instructions/`](file:///home/antigravity/phungvansyhb/Project_X/instructions/core-workflow.md).

---

## 1. Critical AI-DLC Rules
1. **State & Session Continuity (`aidlc-docs/aidlc-state.md`)**:
   - Always read [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) at the start of a session or task to determine the active Phase (`INCEPTION`, `CONSTRUCTION`, or `OPERATIONS`), current Stage, and next unchecked work item.
   - Update `aidlc-docs/aidlc-state.md` whenever a stage or implementation unit changes status.
2. **Mandatory Append-Only Audit Trail (`aidlc-docs/audit.md`)**:
   - **Every time a prompt finishes**, you MUST append a timestamped entry (ISO 8601) to [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) recording the raw user request, clarified decisions/approvals, artifacts/code modified, and verification status.
   - Never overwrite or delete historical entries in `aidlc-docs/audit.md`.
3. **Human-in-the-Loop Approval Gates**:
   - Do not jump from **Inception** (WHAT & WHY) to **Construction** (HOW & Code Implementation) without validating requirements and plans with the user.
   - When requirements or architectural choices are ambiguous, ask structured multiple-choice questions before writing application code.
4. **Strict Separation of Artifacts and Application Code**:
   - All lifecycle documentation, requirements, user stories, architectural designs, unit decompositions, state tracking, and audit logs live strictly inside `aidlc-docs/`.
   - All steering rules and stage instructions live inside `instructions/` and root `AGENTS.md`.
   - Application source code lives strictly in the workspace root (`src/`, `public/`, `vite.config.ts`, etc.) and NEVER inside `aidlc-docs/`.

---

## 2. The Three-Phase AI-DLC Lifecycle

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: INCEPTION (What to Build & Why)                                │
│   1. Workspace Detection  → Greenfield / Brownfield context             │
│   2. Requirements Analysis → Functional & Non-Functional Requirements   │
│   3. User Stories          → Acceptance criteria & user journeys        │
│   4. Application Design    → Component boundaries & data contracts      │
│   5. Units Generation      → Independent work units (Bolts)             │
│   6. Workflow Planning     → Execution plan & Gate 1 Sign-Off           │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: CONSTRUCTION (How to Build It — Iterated per Unit / Bolt)      │
│   1. Functional Design     → Unit-level interfaces & edge cases         │
│   2. NFR & Security Design → Performance, DOM safety, CORS & permissions│
│   3. Code Generation       → Implementation in src/                     │
│   4. Build & Test          → TypeScript check, Vite build & verification│
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: OPERATIONS (Packaging, Release & Monitoring)                   │
│   1. Cross-Browser Bundle  → Chrome, Edge, Brave, Firefox, Safari       │
│   2. Release Verification  → Manifest validation & store packaging      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Map

- [`AGENTS.md`](file:///home/antigravity/phungvansyhb/Project_X/AGENTS.md) — Root AI-DLC entry point for all AI agents.
- [`instructions/`](file:///home/antigravity/phungvansyhb/Project_X/instructions/core-workflow.md) — Detailed AI-DLC stage steering rules:
  - [`instructions/core-workflow.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/core-workflow.md)
  - [`instructions/common/session-and-audit.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/common/session-and-audit.md)
  - [`instructions/inception/inception-rules.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/inception/inception-rules.md)
  - [`instructions/construction/construction-rules.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/construction/construction-rules.md)
  - [`instructions/operations/operations-rules.md`](file:///home/antigravity/phungvansyhb/Project_X/instructions/operations/operations-rules.md)
- [`aidlc-docs/`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) — Living project artifacts generated and maintained across the lifecycle:
  - [`aidlc-docs/aidlc-state.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/aidlc-state.md) — Active phase, stage checklist, and unit progress tracker.
  - [`aidlc-docs/audit.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/audit.md) — Append-only prompt and decision audit log (updated after every prompt).
  - [`aidlc-docs/inception/requirements/requirements.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/requirements/requirements.md)
  - [`aidlc-docs/inception/user-stories/user-stories.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/user-stories/user-stories.md)
  - [`aidlc-docs/inception/application-design/architecture.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/application-design/architecture.md)
  - [`aidlc-docs/inception/units/units.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/units/units.md)
  - [`aidlc-docs/inception/plans/execution-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/inception/plans/execution-plan.md)
  - [`aidlc-docs/construction/plans/construction-plan.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/construction/plans/construction-plan.md)
  - [`aidlc-docs/operations/release-and-packaging.md`](file:///home/antigravity/phungvansyhb/Project_X/aidlc-docs/operations/release-and-packaging.md)
