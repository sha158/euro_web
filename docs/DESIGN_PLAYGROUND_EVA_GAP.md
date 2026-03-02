# Design Playground: Implemented vs To Do (to match EvA ERP)

Short checklist for the **design playground (CAD)** at `/quotes/[id]/design`. Use it to compare with EvA and tick what you still need.

---

## Implemented

### Canvas & view
- [x] 2D Konva canvas with window drawing (frame, glass, mullions, panels)
- [x] Inside / Outside view toggle
- [x] 3D view toggle (Three.js) for non-corner designs
- [x] Corner joint 3D (separate viewer when mullion type is corner)
- [x] Fit-to-container scaling and centering
- [x] Responsive stage (ResizeObserver)
- [x] Optional background image overlay
- [x] Custom opening polygon (clip shape) from Opening mode

### Structure & splits
- [x] Single glass panel (default)
- [x] Split vertical (2+ panels, equal or configurable divisions)
- [x] Split horizontal (2+ panels)
- [x] Split diagonal (two triangular panes, T1 mullion, angle annotations)
- [x] Sliding window (brand/system select: VEKA, VITCO; sash directions/labels)
- [x] L-joint, grid (2x2), coupling (vertical / horizontal / angular), corner (L), bay (3-panel)
- [x] Apply pattern to whole window or to selected panel
- [x] Multiple-mullion config (e.g. number of divisions) via modal

### Mullions & custom mullion
- [x] Mullion modal (pattern choice)
- [x] Multiple mullion modal (division count etc.)
- [x] Custom mullion mode: draw line on frame (start/end), snap to frame, preview, apply as diagonal split
- [x] Mullion labels (M1, M2, T1, C, LC, F1/F2) and frame labels

### Panels & add-ons
- [x] Panel selection (click) and visual feedback (selected / drag-over)
- [x] Add-ons per glass panel: Fan, Louver, Georgian, Mesh, Fixed, AC Grill, Grid
- [x] Fan specification modal (shape, diameter, position, include glass)
- [x] Louver type modal (fixed / movable)
- [x] Add-on badges and icons on canvas
- [x] Drag-and-drop patterns from sidebar onto panels (split patterns and add-ons)

### Dimensions & config
- [x] Overall width/height (mm) with double-click to edit on canvas
- [x] Feet input support (e.g. `3f`, `5.5ft`) for dimensions
- [x] Panel dimensions overlay (per-panel for vertical/horizontal splits); per-panel W×H in sidebar when split selected
- [x] Floor aperture (editable mm); indicator on canvas; in report
- [x] Dimension units: mm / ft-in / m in sidebar; used in BOM, report, per-panel display
- [x] Config form: ref, qty, name, location, floor, note, glass (searchable dropdown), frame finish (inside/outside), revision, product codes (system/glass)
- [x] Frame finish palette (MullionPalette) with inside/outside colors
- [x] BOM / Report: collapsible Report/BOM section (perimeter, area, hardware, glass list); Design report modal (Report button)

### Opening mode
- [x] Opening mode: draw custom polygon (click points, snap-to-close, L/A input)
- [x] Segment length and angle display; close shape and apply as opening clip
- [x] Opening workspace coordinates and cursor readout

### Persistence & navigation
- [x] Save to project (localStorage by quote key)
- [x] Save to catalog (templates in localStorage)
- [x] Duplicate design (adds copy to project and opens it)
- [x] Design versioning (revision in config and design record; shown in header)
- [x] Load design from URL: `?designId=`, `?templateId=`, `?presetW=`, `?presetH=`, `?presetName=`
- [x] Load from catalog template and from saved project design

### History & actions
- [x] Undo / Redo (capped history ~50)
- [x] Keyboard shortcuts: Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo
- [x] Clear design (reset to single glass, default size)
- [x] Back button to quote detail

### UI
- [x] Collapsible sidebar (config + pattern palette)
- [x] Toolbar: Inside/Outside, 3D, Undo, Redo, Clear
- [x] Apply button to apply config and close sidebar
- [x] Validation (required ref, qty > 0) and save status messages

---

## To do / verify against EvA

*(Check EvA’s design/CAD screen and add or remove items as needed.)*

### Structure & editing
- [x] **Edit split ratios** – Change panel proportions (e.g. 50/50 → 40/60) by dragging mullion or entering % (sidebar ratio inputs per panel; drag handle on 2-panel splits)
- [x] **Delete a split** – Collapse a split back to a single panel (with confirmation modal)
- [x] **Move mullion** – Drag mullion to change ratios on the canvas (2-panel vertical/horizontal splits only)
- [x] **Diagonal: edit angle** – Adjust diagonal line start/end (0–100% X/Y) in sidebar when a diagonal panel is selected
- [x] **Sliding: edit sash order/direction** – Change sash direction (left/right/fixed/both) in sidebar when a sliding sash panel is selected

### Dimensions & BOM
- [x] **Per-panel dimensions** – Computed width/height per panel in sidebar (split ratios); display in selected unit (mm / ft-in / m)
- [x] **Perimeter / linear meters** – Display in Report/BOM section and in Design report modal
- [x] **Floor aperture value** – Editable in sidebar (mm); passed to canvas overlay; shown in report
- [x] **Dimension units** – Switch mm / feet-inches / m in sidebar; used in BOM, report, and per-panel display
- [x] **BOM / cut list** – Report/BOM section (collapsible) and Design report modal: glass panes (W×H), perimeter (m), area (Sqmt), hardware count

### Canvas UX
- [x] **Zoom / pan** – Mouse wheel zoom (zoom-to-pointer) and drag to pan; Reset view button in canvas toolbar
- [x] **Ruler / grid** – Optional grid overlay and ruler (left/bottom ticks); toggles in design page header
- [x] **Full-screen canvas** – Full screen button in header; Exit full screen in header when active
- [x] **Export image** – Export current view as PNG (download) via canvas toolbar button
- [x] **Print** – Print button opens print-friendly window (design ref, dimensions, image) then print dialog

### Data & integration
- [x] **Copy / duplicate design** – Duplicate button duplicates current design into project (localStorage); opens the copy for editing
- [x] **Design versioning** – Revision field in config/sidebar; saved in design record and shown in header (Rev N)
- [x] **Link to product codes** – Product code (system) and Product code (glass) fields in sidebar and report; API mapping later
- [ ] **Server persistence** – Save/load designs and catalog from API instead of localStorage only (to be integrated later)

### EvA-specific
- [ ] **EvA pattern parity** – Any split/pattern types in EvA that are not yet in this list
- [ ] **EvA Mullion section parity** – Compare EvA’s Mullion side-panel (first component in design canvas) with our Mullion palette; use **docs/EVA_MULLION_TEST_AND_COMPARE.md** for step-by-step login, test steps, and checklist
- [ ] **EvA system catalog** – Match sliding (and other) systems/brands to EvA catalog
- [ ] **EvA pricing rules** – Align profile/glass/labour/extra rules with EvA
- [ ] **EvA labels/fields** – Match field names and labels (ref, location, floor, etc.) to EvA
- [x] **EvA reports** – Design report modal (Report button): ref, dimensions, qty, revision, floor aperture, product codes, BOM (perimeter, area, hardware, glass panes); dimension units respected

---

## How to use this list

1. Open EvA’s design/CAD screen and go through each **To do** item: tick when EvA has it and you want it in euro_web.
2. Add rows under **To do** for anything EvA has that’s missing above.
3. Prioritise the checked items and we can implement them one by one in the design playground.

File: `docs/DESIGN_PLAYGROUND_EVA_GAP.md`
