# Presentation Refinement v0

This document summarizes the changes, design decisions, test coverage, and validation details for Milestone 7: **Presentation Refinement v0**.

---

## 1. Purpose

The purpose of this milestone is to refine the existing presentation for consistency, readability, visual hierarchy, viewport adaptation, and clean transitions under both Normal and Debug presentation modes. Specifically, we resolve the issue where combat debug diagnostics crossed into the combat console area, making history and action prompts unreadable.

---

## 2. Viewport Matrix

The prototype supports and validates the following landscape viewports:
- **Normal Desktop (Primary)**: `800 x 450`
- **Smaller Landscape (Supported)**: `640 x 360`

*We explicitly do not support or claim phone portrait layout behavior due to horizontal spacing requirements for the grid and console layout.*

---

## 3. Problems Found (Before Refinement)

During Milestone 6 validation, the following presentation and layout issues were identified:
- **Console Overlap**: The debug HUD text blocks (especially `entity`, `world`, and `move`) were positioned using static coordinates or bottom offsets that caused them to overlap the combat console area, overwriting the combat history log and obscuring active menu prompts.
- **Grid Overlap**: The debug HUD text blocks were too wide (`280px`), causing them to collide with the combat grid.
- **Resize Deficiencies**: Toggling debug mode or resizing the browser window left HUD blocks, title labels, and legend containers at outdated positions or scales, leading to off-screen rendering or duplicate visual layers.
- **HP Bar Scale**: HP bars did not adapt their width on smaller viewports, stretching outside their clean layout bounds.

---

## 4. Layout and Positioning Decisions

We moved all layout coordinates calculations into the pure, Phaser-free layout helper in [combatLayoutHelper.ts](../src/game/debug/combatLayoutHelper.ts). The layout coordinates of all screen components (HP bars, turn indicator, grid, console offsets, debug HUD blocks, exploration legend, and footer caption) are computed dynamically from current viewport dimensions:

### Grid and Console Separation
- We maintain a strict vertical gap of at least `12px` (normal viewports) and `8px` (smaller viewports) between the bottom of the grid and the top of the console.

### HP Bars & Turn Indicator Placement
- HP bars are placed at the top corners, with their width and position scaling dynamically (`200` to `150` width) based on the pure layout calculations. Every HP-bar creation path (combat entry, reset, and resize) invokes a unified private helper method (`rebuildCombatHpBars`) to construct and render the HP bars with the correct width and position at instantiation.
- The turn indicator remains centered at the top (`y = 48` or `42`).

### Debug Diagnostics Placement & Degradation Policy
To prevent diagnostic blocks from overlapping the combat console or grid, we implement a **deterministic degradation policy** in combat debug mode:
1. **Normal Viewport (`Height >= 420px`)**:
   - All five blocks are shown.
   - We place `entity` and `world` on the left side (`x = padding`), stacked vertically above the console (`y` ends before `consoleY`).
   - We place `objective`, `interaction`, and `move` on the right side (`x = width - padding`, aligned right), stacked vertically above the console.
   - We use a compact font style (`11px` Arial, `4px` vertical padding, `2px` line spacing) and set the width dynamically based on the space between the screen edge and the grid, keeping it under `240px`.
2. **Smaller Viewport (`Height < 420px`)**:
   - We hide the redundant `objective` and `interaction` blocks (their contents are already visible to the player via HP bars, Turn Indicator, and console logs).
   - We reduce the font size of the remaining blocks (`entity`, `world`, `move`) to `9px`, and apply tighter padding (`3px`) and line spacing (`1px`), stacking them completely above the console.

---

## 5. Typography and Contrast Decisions

- **No Font Dependencies**: We fall back to native system Arial sans-serif typography.
- **Readability**: Reduced font sizes for HUD diagnostics blocks in combat (`11px`/`9px`) allow details to stay compact and readable.
- **Visual Hierarchy**: Action menu items in `CombatMenuView` use range-band colors (melee: bold amber, short: normal violet, long: italic steel-blue) to differentiate action types immediately.
- **Text Contrast**: A dark panel background (`#10141b` with `0.96` opacity) is used for the console and HUD blocks to guarantee high contrast with ivory (`#f4f0e8`), green (`#9fd8b5`), and red (`#ffb7b2`) text overlays.

---

## 6. Normal vs. Debug Behavior

- **Normal Mode**: Technical debug blocks, world dumps, legend container, and grid coordinate labels are hidden. Only essential player-facing elements (tactical grid, HP bars, turn indicators, action prompts, combat history log, outcome overlays) are visible.
- **Debug Mode**: Diagnostic panels, switch status logs, legend, and coordinates are revealed. Diagnostic blocks are positioned cleanly to the sides of the grid and completely above the console.

---

## 7. Resize and Transition Behavior

- **Resize**: Resizing the window re-calculates all positions immediately. HP bars are recreated via the unified rebuild helper to match their correct responsive width, and HUD blocks, the title text, and the exploration legend container are repositioned. Stale panels are destroyed, and active animations are not disrupted.
- **Transitions**: Transitioning between exploration and combat cleanly toggles the visibility state of all layout items. Resetting combat destroys active indicators and rebuilds HP bars via the rebuild helper and menu views correctly.

---

## 8. Automated Test Coverage

We added focused tests in [combatLayoutHelper.test.ts](../src/game/debug/combatLayoutHelper.test.ts):
- Verified coordinates, gaps, and sizes for standard viewport (`800x450`).
- Verified coordinates, gaps, and sizes for smaller viewport (`640x360`).
- Checked that HP bars widths scale correctly.
- Checked that the degradation policy (hiding objective/interaction and shrinking fonts) is applied on height `< 420px`.
- Verified that left and right diagnostic blocks do not overlap the grid or console boundaries.
- Verified that layout calculations are deterministic.

Run all tests via:
```bash
npm run test
```

---

## 9. Boundaries and Constraints

- **No Core Changes**: No changes were made to `src/rules/`, `src/combat/`, `src/movement/`, or `src/exploration/`. All rules, ranges, math, and timers are intact.
- **No Binary Assets**: No external raster image files or audio assets were introduced.
- **No Prohibited Patterns**: Verification scan confirmed `0` usages of `as any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` in `src/game/`.

