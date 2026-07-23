# Combat Grid Movement Closeout v1

## 1. Purpose and Status

- **Status**: The **Combat Grid Movement** track is officially **closed**.
- **Closeout Version**: v1
- **Date**: July 12, 2026
- **System Description**: This is a prototype/debug tactical combat surface that integrates 1v1 d20 combat mechanics with Manhattan grid-based positioning, movement allowances, and weapon range bands. It serves as an interactive debug and validation interface.

---

## 2. Delivered Scope

### Pure Combat Positioning & Validation
- **Pure Model**: Implemented in [combatPositioning.ts](../src/combat/combatPositioning.ts), a decoupled positioning layer that tracks participant coordinates, handles grid boundaries, and validates destination cells.
- **Rejection Reasons**: Pure movement validation rejects movement attempts with structured errors: `unknown_participant`, `outside_grid`, `occupied` (occupied by other participants), `blocked` (occupied by obstacles), and `out_of_range`.

### Combat Session Integration
- **Deterministic Placement**: On combat initiation, the player is spawned at `{ x: 2, y: 4 }` and the opponent (Gargoyle Gladiator) at `{ x: 6, y: 4 }` on a `10 x 8` grid bounds.
- **Turn Budgets**: Active participants are allocated a budget of up to **4 Manhattan cells** of movement per turn, tracked on the active turn's allowance.
- **Turn Transitions & Resets**: Movement allowance is fully refreshed on turn switches. Resetting combat (key `R`) restores all positions and movement budgets.

### Weapon Range Profiles & Attack Range Enforcement
- **Range Profiles**: Created weapon-owned range profiles with maximum distance constraints:
  - `melee` / `Training Blade` (`Practice Strike` action): range 1
  - `short` / `Training Crossbow` (`Crossbow Strike` action): range 4
  - `long` / `Training Bow` (`Bow Strike` action): range 9
- **Blocked Actions**: Enforces maximum range before attacking. Attempting an out-of-range attack halts execution, displays a blocked reason on the on-screen combat log panel (e.g., `[Attack blocked] Crossbow Strike: distance 5, range 4`), and does **not** consume actions, turns, or resources (PM).
- **Target Selection**: When in Attack selection mode, the current combat opponent is visually highlighted with a gold indicator.
- **Attack Availability Feedback**: Provides live availability checks (`READY` or `BLOCKED`) for all weapon actions in the combat submenu based on target distance and active turn availability.

### Presentation, Layout, & Visual Highlights
- **Phaser Debug Grid**: Implements a dedicated tactical grid display layer (`DebugCombatGridView`) layered above the exploration viewport when combat is active.
- **Reachable Highlights**: Highlights reachable cells in light blue during the player's movement phase (`main` menu mode).
- **Submenu Separation**: Hides movement highlights instantly when entering the `attacks` or `abilities` submenus, directing focus to targeting.
- **Responsive Layout**: Integrates a layout helper ([combatLayoutHelper.ts](../src/game/debug/combatLayoutHelper.ts)) to dynamically calculate cell size and console offsets, keeping grid elements, HP bars, turn indicators, outcome banners, and logs visually separated and scaled during resize.

---

## 3. Architecture Snapshot

The codebase maintains a strict hierarchical dependency model. UI and engine concepts remain completely decoupled from game rules and mechanics.

```text
src/game/  (owns Phaser presentation, input, layout, and view adapters)
   |
   +---> src/combat/ (positioning & session adapters, range checks)
   |        |
   |        +---> src/rules/ (abstract check/attack math, catalog data)
   |        |
   |        +---> src/movement/ (reusable grid primitives & coordinates)
   |
   +---> src/exploration/ (triggers, map state)
   |        |
   |        +---> src/movement/
   |
   +---> src/rules/
   |
   +---> src/movement/
```

- **`src/game/`**: Owns Phaser presentation, input handling, and grid/console layouts. May depend on combat, exploration, rules, and movement.
- **`src/combat/`**: Owns positioning state, session integration, range check adapters, and weapon ranges. Depends on rules, movement, content, and the CLI layer (retaining no dependency on Phaser/browser APIs).
- **`src/rules/`**: Remains abstract combat math (check resolutions, hit/miss calculations, damage pipeline).
- **`src/movement/`**: Contains reusable pure grid primitives (cell checks, Manhattan math).
- **`src/exploration/`**: Stays independent from combat-grid rendering and presentation, depending on `src/movement/` but not on `src/rules/`.

---

## 4. Important Files

The principal files delivered and verified in this track are listed below:

| Responsibility | Implementation File | Test File |
| :--- | :--- | :--- |
| **Grid Math Primitives** | [grid.ts](../src/movement/grid.ts) | [grid.test.ts](../src/movement/grid.test.ts) |
| **Manhattan Range Helpers** | [moveRange.ts](../src/movement/moveRange.ts) | [moveRange.test.ts](../src/movement/moveRange.test.ts) |
| **Combat Positioning** | [combatPositioning.ts](../src/combat/combatPositioning.ts) | [combatPositioning.test.ts](../src/combat/combatPositioning.test.ts) |
| **Encounter Session** | [combatSession.ts](../src/combat/combatSession.ts) | [combatSession.test.ts](../src/combat/combatSession.test.ts) |
| **Attack Range Checks** | [combatAttackRange.ts](../src/combat/combatAttackRange.ts) | [combatAttackRange.test.ts](../src/combat/combatAttackRange.test.ts) |
| **Weapon Range Profile** | [combatWeaponRange.ts](../src/combat/combatWeaponRange.ts) | [combatWeaponRange.test.ts](../src/combat/combatWeaponRange.test.ts) |
| **Main Presentation** | [PrototypeScene.ts](../src/game/scenes/PrototypeScene.ts) | *N/A (Phaser integration)* |
| **Debug Combat Grid View** | [debugCombatGridView.ts](../src/game/debug/debugCombatGridView.ts) | *N/A (Graphics render)* |
| **Grid Projection Math** | [debugCombatGridProjection.ts](../src/game/debug/debugCombatGridProjection.ts) | [debugCombatGridProjection.test.ts](../src/game/debug/debugCombatGridProjection.test.ts) |
| **Attack Availability** | [debugCombatAttackAvailability.ts](../src/game/debug/debugCombatAttackAvailability.ts) | [debugCombatAttackAvailability.test.ts](../src/game/debug/debugCombatAttackAvailability.test.ts) |
| **Interaction Mode State** | [debugCombatInteractionMode.ts](../src/game/debug/debugCombatInteractionMode.ts) | [debugCombatInteractionMode.test.ts](../src/game/debug/debugCombatInteractionMode.test.ts) |
| **Layout Mathematics** | [combatLayoutHelper.ts](../src/game/debug/combatLayoutHelper.ts) | [combatLayoutHelper.test.ts](../src/game/debug/combatLayoutHelper.test.ts) |

---

## 5. User-Testable Behavior

### Manual Handoff Verification Checklist

1. **Entering Combat**: Navigate the explorer token to `{ x: 8, y: 4 }` (red-orange triangle). Press `F` to interact. Verify the viewport switches to the dark blue combat grid and overlays.
2. **Initial Placements**: Check that the player token (`P`) is at cell `{ x: 2, y: 4 }` and the opponent (`O`) is at cell `{ x: 6, y: 4 }` (distance of 4 cells).
3. **Legal Movement**: Click a cell within the highlighted light blue region (max distance 4, e.g., `{ x: 3, y: 4 }`). Verify the player token moves to it and the remaining movement budget updates.
4. **Illegal Movement Rejection**: Attempt to click an unhighlighted cell (distance > 4) or the opponent's cell. Verify a block message like `[Move blocked] occupied` or `[Move blocked] out_of_range` is displayed directly on the on-screen combat log panel.
5. **Melee Blocked at Distance 4**: Reset the combat state (key `R`) to return to the initial placements (distance 4). Press `1` to enter the Attacks menu. Notice that the weapon option associated with `Training Blade` (`Practice Strike`) is marked as `BLOCKED (distance 4)`. Press `1` to select it; verify that the attack is blocked, logged in the combat log panel on the screen, does not consume the action, and keeps the Attacks menu active.
6. **Training Crossbow Allowed at Distance 4**: Reset the combat state (key `R`) to ensure the player has their main action available. Open the Attacks menu (`1`). Notice that the `Training Crossbow` option (`Crossbow Strike`) is marked as `READY`. Select it by pressing `2`. Verify the attack executes (calculating hit/miss logs) and returns to the main combat menu, consuming the main action.
7. **Training Bow Allowed at Distance 4**: Reset the combat state (key `R`) to restore action availability. Open the Attacks menu (`1`). Notice that the `Training Bow` option (`Bow Strike`) is marked as `READY`. Select it by pressing `3`. Verify the attack executes, outputs a resolution log to the combat log panel, and returns to the main combat menu, consuming the main action.
8. **Training Blade Adjacent Attack**: Reset the combat state (key `R`). Click on cell `{ x: 5, y: 4 }` to move adjacent to the opponent (consuming 3 cells from the 4-cell move budget). Open the Attacks menu (`1`). Verify that the `Training Blade` option (`Practice Strike`) is now marked as `READY`. Select it by pressing `1`; verify the attack resolves and returns to the main combat menu, consuming the main action.
9. **Visual Highlights Toggle**: Verify that entering the Attacks (`1`) or Abilities (`2`) submenus hides the light blue reachable cell highlights, and returning (`0`) displays them again.
10. **Console Separation**: Resize the browser window. Confirm the grid remains centered and leaves a visible gap above the console log, keeping HP bars, turn indicators, grid lines, and logs fully separated.
11. **Outcome Return / Reset**: Reset combat by pressing `R` at any time (verifying positions reset) or return to exploration by pressing `3` on Victory.

---

## 6. Validation Snapshot

A clean validation run was executed on the workspace prior to track closeout.

- **`npm run typecheck`**: **Passed** successfully.
- **`npm run test`**: **Passed** successfully.
  - **Test File Count**: 37 passed.
  - **Test Count**: 302 tests passed.
- **`npm run build`**: **Passed** successfully.
  - **Output Assets**: Compiled index HTML, CSS, and minified JS bundle.
  - **Non-blocking Warnings**: Bundler reported a standard chunk-size warning for the Phaser single-bundle size exceeding 500 kB (1562.70 kB actual).

---

## 7. Boundary Audit

An automated script and text search were run on the package boundaries to verify code encapsulation:

- **`src/rules/`**:
  - Contains zero Phaser imports.
  - Contains zero browser/terminal APIs (the test suite environment checks references to `window`/`document` to verify they are indeed `undefined`).
  - Contains zero calls to `Math.random`.
  - Excludes any gameplay preset IDs (`challenging-duel`, `poi-combat-1`).
  - Owns no grid positioning or movement budget states.
- **`src/combat/`**:
  - Decoupled from Phaser library imports.
  - Contains no browser or terminal references.
  - Operates strictly on mathematical positioning data; holds no keyboard/pointer listeners or rendering logic.
- **`src/movement/`**:
  - Independent of combat sessions, preset IDs, and Phaser.
- **`src/exploration/`**:
  - Stays free of Phaser, browser, or terminal APIs. Holds no combat-grid rendering or input logic.

---

## 8. Explicit Non-Goals and Deferred Work

The following mechanics are explicitly deferred to future tracks and remain out-of-scope for V1:
- **Cover**: No defensive benefits from surrounding tiles.
- **Line of Sight (LoS)**: Projectiles can travel through any cell.
- **Terrain Costs**: Diagonal moves are unavailable; all cardinal steps have a uniform cost of 1.
- **Opportunity Attacks & Reactions**: Moving away from adjacent cells does not trigger enemy actions.
- **Multiple Targets**: Attacks and abilities only resolve against a single opponent.
- **Enemy Pathfinding**: The opponent AI remains stationary and only strikes if the player is in range.
- **Authored Combat Maps**: The combat arena uses a default, unblocked prototype layout.
- **Production Combat Art / UI**: Graphics rely on color-coded circles, lines, and text.
- **Sequenced Animations**: Movement is instant without intermediate interpolation tweens.
- **Official Rule Reproductions**: Restricted to a custom, generic d20 prototype implementation.

---

## 9. Recommended Next Tracks

1. **Enemy Tactical Movement**: Implement simple AI pathfinding (A*) to let the opponent move toward the player when out of weapon range.
2. **Obstacles & Line of Sight**: Introduce blocked cells (terrain obstacles) that obstruct movement and block short/long range attacks.
3. **Encounter Map Pipelines**: Support parsing and loading custom tactical grid maps from scene trigger metadata.
4. **Production Combat UX**: Evolve debug indicators into rich Phaser sprites, tilemaps, dynamic health bars, and combat animations.
