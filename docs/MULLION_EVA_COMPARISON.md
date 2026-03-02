# Mullion: This Project vs EvA ERP CAD Playground

Use this to compare **euro_web** design playground mullion behaviour with **EvA ERP CAD playground** and note any gaps.

---

## How to test in this project (euro_web)

1. **Open design screen**  
   Go to a quote → open design (e.g. `/quotes/euro/design` or Create design from a row).

2. **Open Mullion panel**  
   - Close the right “Edit” sidebar (so the left floating palette is visible).  
   - On the **left dark bar**, click the **first icon** (two vertical lines = **Mullion**).  
   - The white **Mullion** panel opens with a grid of patterns.

3. **Apply mullion patterns**  
   - **Drag and drop**: Drag any pattern from the Mullion panel onto the canvas (whole window or onto a selected panel).  
   - **Apply to whole window**: Drag onto the main window area.  
   - **Apply to a panel**: Click a panel to select it, then drag a pattern onto it.  
   - **Custom mullion**: Click the “Custom Mullion” icon (diagonal line in a frame). Then draw a line on the frame (start → end); it snaps to the frame and applies a diagonal split (T1).

4. **Multiple mullion**  
   - Drag **Multiple I Joint** or **Multiple H Joint** onto the canvas.  
   - A modal opens: **“Select Multiple Mullion Specifications”** with:  
     - **Select no of mullions** (2–10).  
     - **Type of Equalization** (mullion / sash / etc.).  
   - Confirm → structure updates with that number of divisions.

5. **Other categories**  
   - **Coupler** (second icon): Vertical / Horizontal coupling patterns.  
   - **Design** (diagonal window icon): Mesh sash, pleated mesh, sliding, add-ons (fan, louver, grid, etc.).  
   - **Opening**: Draw custom opening polygon.  
   - **Colour**: Frame finish inside/outside.  
   - **Image upload**: Background image.

---

## Mullion functionality in this project (summary)

| Feature | In this project |
|--------|-------------------|
| **Entry point** | Left bar → first icon “Mullion” → panel with pattern grid. |
| **Pattern list** | I Joint, H Joint, Multiple I/H (with config), Coupling, Corner 90°, Bay 135°, Grid/Georgian, Triple I (4-panel), Custom Mullion. |
| **Apply to** | Whole window or selected panel (drag onto canvas). |
| **Custom mullion** | Click “Custom Mullion” → draw line on frame → diagonal split (T1) with snap. |
| **Multiple mullion** | Modal: number of mullions (2–10), type of equalization → apply. |
| **Sliding / systems** | Under “Design” (mesh/add-ons panel): sliding categories + system select modal (VEKA, VITCO, etc.). |
| **Labels** | Mullion labels on canvas (M1, M2, T1, C, LC, F1/F2), frame labels. |
| **Edit after apply** | Split ratios (sidebar when panel selected), collapse split, diagonal 0–100%, sash direction; draggable mullion handle on 2-panel splits. |

---

## Checklist: compare with EvA ERP CAD playground

Open **EvA ERP** → go to their **CAD / design playground** → find **Mullion** (or equivalent: “Divider”, “Splits”, “Structure”). Then check:

- [ ] **Where does EvA put mullion?** (e.g. left sidebar, top toolbar, “Structure” tab.)
- [ ] **Same or different patterns?** (vertical/horizontal, multiple, coupling, corner, bay, grid, sliding, custom.)
- [ ] **How do you apply?** (click then click on window, drag-and-drop, menu “Apply to whole” vs “Apply to selection”.)
- [ ] **Multiple mullion:** Does EvA have a “number of divisions” or “equalization” step like our modal?
- [ ] **Custom mullion:** Can you draw a line on the frame to create a diagonal (or other) split? Any snap-to-frame?
- [ ] **After apply:** Can you change ratios, collapse a split, or move the mullion (drag)?
- [ ] **Naming / labels:** M1, M2, T1, etc. on canvas? Same or different?
- [ ] **Sliding / systems:** Separate from “Mullion” or combined? Brand/system selection like VEKA/VITCO?

---

## Result (fill after you check EvA)

- **Same functionality:**  
- **Missing here (in EvA but not in euro_web):**  
- **Different behaviour (describe):**  
- **Extra here (in euro_web but not in EvA):**  

---

*File: `docs/MULLION_EVA_COMPARISON.md`*
