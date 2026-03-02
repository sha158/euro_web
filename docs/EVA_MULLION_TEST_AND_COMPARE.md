# EvA ERP Mullion Section – Test Steps & Comparison with euro_web

Use this guide to log in to EvA ERP, open the design canvas, test the **Mullion** side-panel component, and compare it with our project so we can close any gaps.

---

## 1. Log in and open the design canvas on EvA

1. Open **https://evaerp.cloud/** in your browser.
2. **Log in** with:
   - **Login ID:** `info@niupvc.com`
   - **Password:** `Password@1234`
   - Optionally check "Keep me logged in", then click **Login**.
3. Go to the **Quotes** section (from the main navigation).
4. In the quotes list, **search for "euro"**.
5. Open the **euro** quote from the results.
6. On the quote detail screen, open any design by clicking **"Edit design"**.
7. The **canvas CAD** opens. On the **side panel**, the first component is **Mullion**. Expand it and use it for the comparison below.

---

## 2. What our project (euro_web) has – Mullion section

### 2.1 Sidebar entry

- **First item** in the left nav strip: **Mullion** (icon: two vertical lines).
- Clicking it opens the Mullion panel (collapsible).

### 2.2 Mullion patterns we implement (from `MullionPalette.js`)

| # | Pattern ID           | Name            | Type / behaviour |
|---|----------------------|-----------------|------------------|
| 1 | `i-joint`            | I Joint          | Vertical 2-panel split |
| 2 | `h-joint`            | H Joint          | Horizontal 2-panel split |
| 3 | `multiple-i-joint`   | Multiple I Joint | Vertical multiple; **opens “number of mullions” modal** |
| 4 | `multiple-h-joint`   | Multiple H Joint | Horizontal multiple; **opens “number of mullions” modal** |
| 5 | `coupling`           | Coupling Mullion | Two panels with vertical coupler (F1 / F2) |
| 6 | `corner-90`          | Corner 90°       | L-shaped corner (90°) |
| 7 | `bay-135`            | Bay 135°         | Three-panel bay (angled sides, 135°) |
| 8 | `grid-georgian`      | Grid / Georgian  | 2×2 grid |
| 9 | `triple-i-joint`     | Triple I Joint   | Vertical 4-panel split |
|10 | `custom-mullion`     | Custom Mullion   | **Click-only**: toggles “custom mullion” mode; user draws a line on the frame (start → end), applied as diagonal split |

- **Drag & drop:** All except **Custom Mullion** are **draggable** onto a panel (or whole window) to apply that split pattern.
- **Custom Mullion** is **click-only**: click to toggle mode, then click start and end on the frame to draw a diagonal mullion.
- **Hint text:** “Drag & drop onto a panel to apply”.

### 2.3 Behaviour when applying

- **Whole window:** If no panel is selected, applying a pattern (e.g. from a modal or equivalent flow) applies to the whole window.
- **Selected panel:** If a panel is selected, pattern applies to that panel only.
- **Multiple I/H:** “Multiple I Joint” and “Multiple H Joint” open **MultipleMullionModal** (number of mullions, equalization type).
- **Custom mullion:** Two clicks on the frame create a **diagonal split** (split-diagonal) with angle shown; can be applied to a panel or whole frame.

### 2.4 Other related UI

- **Coupler** is a **separate** sidebar section (below Mullion): Vertical, Horizontal, Angular coupler – drag onto panel.
- **Design (Mesh & Add-ons)** includes sliding, mesh, add-ons (fan, louver, georgian, mesh, fixed, AC grill, grid).
- **Opening** mode: custom polygon for opening shape (separate from mullion).
- **Colour** and **Image Upload** are separate sections.

---

## 3. EvA vs euro_web – Mullion comparison checklist

Use this while you have EvA’s Mullion section open. For each row, note: **Same**, **Different**, or **Missing in ours**.

### 3.1 Layout and UX

| # | Check | EvA | euro_web | Your note |
|---|--------|-----|----------|-----------|
| 1 | Mullion is the first component in the side panel | ☐ | ✓ | |
| 2 | Mullion panel is collapsible (expand/collapse) | ☐ | ✓ | |
| 3 | Patterns shown as a grid of icons (not only a list) | ☐ | ✓ (4-column grid) | |
| 4 | Drag-and-drop from palette onto canvas/panel | ☐ | ✓ | |
| 5 | Any “apply to whole window” vs “apply to selected panel” | ☐ | ✓ | |
| 6 | Hint text like “Drag & drop onto a panel to apply” | ☐ | ✓ | |

### 3.2 Pattern set (names and presence)

| # | EvA pattern name / concept | In euro_web? | Your note |
|---|----------------------------|--------------|-----------|
| 7 | I Joint (vertical 2-panel) | ✓ `i-joint` | |
| 8 | H Joint (horizontal 2-panel) | ✓ `h-joint` | |
| 9 | Multiple I Joint (vertical, configurable count) | ✓ `multiple-i-joint` + modal | |
|10 | Multiple H Joint (horizontal, configurable count) | ✓ `multiple-h-joint` + modal | |
|11 | Coupling Mullion (two units with coupler) | ✓ `coupling` | |
|12 | Corner 90° (L-shape) | ✓ `corner-90` | |
|13 | Bay 135° (three-panel bay) | ✓ `bay-135` | |
|14 | Grid / Georgian (e.g. 2×2) | ✓ `grid-georgian` | |
|15 | Triple I Joint (e.g. 4 vertical panels) | ✓ `triple-i-joint` | |
|16 | Custom Mullion (draw line on frame → diagonal) | ✓ `custom-mullion` (click mode) | |
|17 | Any other mullion/divider type in EvA not listed above | ☐ | **List name:** __________ |

### 3.3 Config and modals

| # | Check | EvA | euro_web | Your note |
|---|--------|-----|----------|-----------|
|18 | “Multiple” mullion opens a modal for number of divisions | ☐ | ✓ (MultipleMullionModal) | |
|19 | Custom mullion: click to enable mode, then click start/end on frame | ☐ | ✓ | |
|20 | After custom mullion, angle or dimensions shown (e.g. in sidebar) | ☐ | ✓ (angle on canvas) | |

### 3.4 Canvas behaviour

| # | Check | EvA | euro_web | Your note |
|---|--------|-----|----------|-----------|
|21 | Corner type has dedicated 3D view (corner joint) | ☐ | ✓ | |
|22 | Bay type shows angled panels correctly | ☐ | ✓ | |
|23 | Coupling shows F1/F2 or similar frame labels | ☐ | ✓ (frameLabel F1/F2) | |
|24 | Dragging mullion to change split ratio (2-panel vertical/horizontal) | ☐ | ✓ | |
|25 | Deleting a split (collapse to single panel) | ☐ | ✓ | |

### 3.5 Naming and copy

| # | Check | EvA | euro_web | Your note |
|---|--------|-----|----------|-----------|
|26 | Section title: “Mullion” vs “Divider” vs other | EvA: _____ | “Mullion” | |
|27 | Same pattern labels (I Joint, H Joint, etc.) | ☐ | ✓ | |
|28 | Coupler in same section as Mullion or separate section | EvA: _____ | Separate “Coupler” section | |

---

## 4. Summary: what to report back

After testing EvA’s Mullion section:

1. **List any mullion/divider types** in EvA that we don’t have (row 17 and any others you find).
2. **Note UX differences** that matter (e.g. where EvA has a modal we don’t, or different apply rules).
3. **Note naming/layout differences** (e.g. “Divider” vs “Mullion”, or Coupler inside vs outside Mullion).
4. **Confirm** which of the above checklist items are **Same** so we can mark EvA mullion parity as done in `DESIGN_PLAYGROUND_EVA_GAP.md`.

If you paste your checklist answers (or a short summary) into the gap doc or here, we can add missing patterns or behaviour to the codebase next.

---

## 5. Quick reference – our pattern IDs and types

For implementation reference, our mullion pattern types and how they map to structure:

- `vertical` / `vertical-multiple` → `split-vertical` (with optional MultipleMullionModal).
- `horizontal` / `horizontal-multiple` → `split-horizontal`.
- `grid` → `split-vertical` of `split-horizontal` (rows/cols from pattern).
- `coupling` → `split-vertical` with `mullionType: 'coupler-vertical'`.
- `coupler` (from Coupler section) → `coupler-vertical` / `coupler-horizontal` / `coupler-angular`.
- `corner` → `mullionType: 'corner'`, L-shape.
- `bay` → `mullionType: 'bay'`, three panels.
- `custom-mullion` → user-drawn line → `split-diagonal`.

File references: `app/components/MullionPalette.js`, `app/quotes/[id]/design/page.js` (`handlePatternDrop`, `createPanelNode`, `handleMullionSelect`), `app/components/WindowCanvasKonva.js` (custom mullion mode).
