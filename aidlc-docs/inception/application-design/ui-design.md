# UI/UX Design Specification — Claymorphism Design Standard (`ui-design.md`)

- **Phase**: `INCEPTION`
- **Stage**: `Stage 1.4 — Application & UI Design`
- **Design System**: **Soft Pastel Claymorphism + Dark Clay Mode**
- **Status**: `Validated with User`

---

## 1. Clarified UI Design Decisions

| Dimension | User Selection | Specification Summary |
| :--- | :--- | :--- |
| **Target UI Surfaces** | **Side Panel, Toolbar Popup, and On-Page Shadow DOM Translation Popup & Hover Meaning Tooltip** (plus cohesive styling in Options) | All primary user-facing surfaces use 3D inflated clay cards, pill buttons, and recessed clay inputs. |
| **Visual Aesthetic** | **Soft Pastel Clay + Dark Clay Mode** | Cream/Cloud matte canvas (`#F4F1FA` / `#EEF2FF`), pastel surface cards (`#FFFFFF` / tinted pastel fills), generous `20px–24px` border-radius, and multi-layered 3D inner + outer shadows. |
| **Typography & Motion** | **Plus Jakarta Sans / Nunito + Tactile Press Micro-Interactions** | Rounded geometric typography (`'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif`) with springy hover lift (`translateY(-2px)`) and tactile press-in (`translateY(2px)`) shadow compression. |

---

## 2. Claymorphism Core CSS Formula

True **Claymorphism** is achieved by combining **three shadow layers** on rounded (`20px–24px`) surfaces:
1. **Outer Drop Shadow**: Soft ambient elevation floating above the background canvas.
2. **Top-Left Inner Highlight (`inset`)**: Specular light reflection giving the 3D inflated "puffy clay" dome effect.
3. **Bottom-Right Inner Bevel (`inset`)**: Darker shaded inner rim completing the 3D volume.

### 2.1 Light Mode — Soft Pastel Clay Tokens
```css
:root {
  --font-rounded: 'Plus Jakarta Sans', 'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Matte Cloud Canvas & Inflated Clay Surfaces */
  --clay-canvas: #f3f0fa;
  --clay-surface: #ffffff;
  --clay-surface-tinted: #f8f6ff;
  --clay-recessed: #ebe6f6;

  /* Typography */
  --clay-text-primary: #1e1b4b;
  --clay-text-secondary: #4c4975;
  --clay-text-muted: #7c78a3;

  /* 3D Clay Shadow Recipe (Outer Drop + Top-Left Inner Highlight + Bottom-Right Inner Shade) */
  --clay-shadow-card:
    0 12px 24px -6px rgba(99, 102, 241, 0.14),
    inset 0 4px 8px 0 rgba(255, 255, 255, 0.95),
    inset 0 -6px 12px 0 rgba(165, 158, 214, 0.28);

  --clay-shadow-sm:
    0 6px 14px -3px rgba(99, 102, 241, 0.14),
    inset 0 3px 5px 0 rgba(255, 255, 255, 0.9),
    inset 0 -4px 8px 0 rgba(165, 158, 214, 0.26);

  /* Pressed / Recessed Clay Input & Active Button State */
  --clay-shadow-inset:
    inset 0 4px 8px rgba(109, 102, 168, 0.22),
    inset 0 -2px 6px rgba(255, 255, 255, 0.85);

  /* Primary Accent Clay Button (Indigo / Violet Default) */
  --clay-accent-bg: linear-gradient(145deg, #818cf8 0%, #6366f1 100%);
  --clay-accent-shadow:
    0 10px 20px -4px rgba(99, 102, 241, 0.42),
    inset 0 4px 8px 0 rgba(255, 255, 255, 0.45),
    inset 0 -5px 10px 0 rgba(49, 46, 129, 0.38);

  /* Radii */
  --clay-radius-lg: 24px;
  --clay-radius-md: 20px;
  --clay-radius-sm: 14px;
  --clay-radius-pill: 999px;
}
```

### 2.2 Dark Mode — Dark Clay Tokens
```css
[data-theme='dark'] {
  --clay-canvas: #13111c;
  --clay-surface: #1e1b2e;
  --clay-surface-tinted: #252138;
  --clay-recessed: #171424;

  --clay-text-primary: #f5f3ff;
  --clay-text-secondary: #c4b5fd;
  --clay-text-muted: #8b83b0;

  --clay-shadow-card:
    0 14px 28px -6px rgba(0, 0, 0, 0.55),
    inset 0 3px 6px 0 rgba(255, 255, 255, 0.12),
    inset 0 -6px 12px 0 rgba(8, 6, 16, 0.65);

  --clay-shadow-sm:
    0 8px 16px -4px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px 0 rgba(255, 255, 255, 0.12),
    inset 0 -4px 8px 0 rgba(8, 6, 16, 0.6);

  --clay-shadow-inset:
    inset 0 4px 9px rgba(0, 0, 0, 0.65),
    inset 0 -2px 4px rgba(255, 255, 255, 0.06);
}
```

---

## 3. Surface-by-Surface Claymorphism Component Specs

### 3.1 On-Page Shadow DOM UI (`#project-x-shadow-host` in `src/content/index.ts`)
1. **Selection Translation Popup (`.clay-translate-popover`)**:
   - **Container**: `border-radius: 22px`, puffy pastel clay card (`var(--clay-shadow-card)`), `padding: 14px 16px`, backdrop blur + warm white/pastel surface.
   - **Header Row**: Source word pill badge + audio pronunciation clay icon button (`🔊`) + target language pill tag.
   - **Body**: Bold, high-contrast translated meaning in `Plus Jakarta Sans` (`15px`, `font-weight: 700`), plus status indicator (`✨ Highlighted & Saved`).
   - **Entrance Animation**: `cubic-bezier(0.34, 1.56, 0.64, 1)` pop-in scale (`0.92 → 1.0`).
2. **Hover Meaning Tooltip (`.clay-hover-tooltip`)**:
   - Appears when the user moves the cursor over any `::highlight(project-x-vocab)` range on the webpage.
   - Compact 3D clay bubble (`border-radius: 18px`) displaying:
     - **Source Text** + pronunciation button (`🔊`)
     - **Translated Meaning** (highlighted pastel badge)
     - **Remove Highlight (`×`)** tactile mini-button

### 3.2 Side Panel (`src/sidepanel/SidePanelApp.tsx`) & Toolbar Popup (`src/popup/PopupApp.tsx`)
1. **Header Bar**: Floating clay header card with puffy 3D logo badge, active page counter pill, and tactile **Options** & **Export Excel (`.xlsx`)** clay buttons.
2. **Segmented Pill Switcher**: Recessed clay track (`var(--clay-shadow-inset)`) with an inflated 3D clay active tab button switching between:
   - **Current Page (`N` words)**
   - **All Pages (`M` words)**
3. **Vocabulary Clay Cards**:
   - Each highlighted word renders as a tactile pastel clay card (`border-radius: 20px`) showing:
     - **Source Text** + audio pronunciation button
     - **Translated Meaning** (editable inline)
     - Quick actions: **Scroll to Word on Page** & **Delete Highlight**
4. **Floating Export Excel CTA**:
   - Full-width 3D Emerald/Indigo clay button (`Export to Excel (.xlsx)`) with tactile press-down animation.
