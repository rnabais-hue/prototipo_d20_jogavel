# Debug Presentation Toggle v0

This document outlines the design, architecture, and behavior of the debug presentation toggle implemented in Milestone 6.

---

## 1. Purpose

The debug presentation toggle provides a keyboard control to switch between a clean normal presentation for the player and a diagnostic view for developer testing. 
*   **Normal Mode (Default)**: Hides technical HUD blocks, entity/switch state dumps, raw paths, and coordinates to offer an uncluttered, player-facing adventure visual.
*   **Debug Mode**: Exposes detailed internal variables, switch statuses, cell coordinates, and other technical diagnostics overlaying the game scene.

---

## 2. Keyboard Control

*   **Toggle Key**: **D**
*   **Availability**: Works in both **exploration** and **combat** modes.
*   **Interaction**: Pressing `D` toggles immediately without resetting gameplay sessions, interrupting active animations, or triggering combat/movement actions.
*   **Lifetime**: The selection is preserved dynamically across exploration/combat transitions within the scene's lifetime. No persistent storage (like `localStorage`) is used.

---

## 3. Visibility Classifications

Elements are explicitly classified into **Technical Diagnostics** (hidden in Normal, visible in Debug) and **Essential Player-Facing Feedback** (always visible).

### Technical Diagnostics (Hidden by Default)
*   **Raw Entity State**: Detailed actor state details (e.g. `actorState.status`, current cell, entity ID/label).
*   **World / Switch State Dumps**: Text logs showing switches and their active state flags.
*   **Cell Coordinates**: Coordinate labels suffix on the explorer token (`: x,y`).
*   **Raw Movement/Path Status**: Move HUD details like path steps remaining and selected target coordinates.
*   **Exploration Debug Legend**: The map legend showing shapes and colors.
*   **Placeholder/Debug Captions**: General debug footer texts (e.g., `'exploration placeholder / debug movement'`).
*   **Combat HUD State Panels**: Objective, interaction, entity, world, and move debug sections in combat mode.

### Essential Player-Facing Feedback (Always Retained)
*   **Objectives**: The main goal text showing what the player should do.
*   **Interaction Prompts**: Contextual feedback when interacting with Points of Interest (switches, survey nodes, exit gates).
*   **Player and Enemy Tokens**: Silhouettes, emblems, colors, and border outlines for actors.
*   **Terrain / Grid**: Grid lines, wall obstacles, checkered tiles, and tactical grid overlays.
*   **Visual Selection / Movement Helpers**: Reachable movement cell highlights (cyan inset overlays), path previews, targets (green crosshair), and hostile targets (coral reticles).
*   **HP Bars**: Health bars and numerical HP indicators.
*   **Turn Indicators**: Centered combat turn panels with pips showing the active participant.
*   **Action Prompts / Combat Menu**: Control choices (attacks, abilities, end turn) and weapon selection submenus.
*   **Combat Log History**: Action outcomes, hit/miss summaries, and rolls.
*   **Outcome Overlays**: Victory and defeat outcome banners.

---

## 4. Architecture and Ownership

```text
src/game/
  scenes/PrototypeScene.ts
  visual/
    presentationState.ts
    drawExplorationActor.ts
  debug/
    DebugActorController.ts
```

*   **`presentationState.ts`**: Pure TypeScript module that contains the type definitions, default state configuration, toggle function, and visibility policy mappings. It has no dependencies on Phaser, browser, or terminal APIs.
*   **`PrototypeScene.ts`**: Handles keyboard input (D key) and coordinates visibility updates across active views when the mode is switched.
*   **`drawExplorationActor.ts`**: Queries `getPresentationMode()` inside label rendering to determine whether to append cell coordinates.

---

## 5. Transition, Reset, and Resize Behavior

*   **Transitions**: Entering combat and returning to exploration queries the scene's active mode state and correctly hides or reveals elements.
*   **Resets**: Resetting combat preserves the presentation toggle state.
*   **Resize**: Recalculating positions during viewport resize keeps the active mode elements visibility intact.
*   **Animations**: Toggling debug presentation mode changes visibility properties but **does not** cancel, interrupt, or alter the timing of any active tween or motion sequence (lunging, dodge slide, damage floats, etc.).

---

## 6. Rules and Presentation Timing Boundaries

*   **Rule-First Integrity**: The presentation mode changes only what elements are rendered and their visibility parameters. No change has been introduced to the combat rules, pathfinding, movement ranges, action menus, damage formulas, or opponent scripts.
*   **Presentation Timing**: Playback rates, tween curves, and reaction delays remain exactly as configured in Milestone 5.

---

## 7. Tests and Validation

*   **Pure Tests**: Verified via `presentationState.test.ts` checking defaults, toggles, essential elements (always visible), and technical elements (conditionally visible).
*   **Validation Commands**:
    1.  `npm run typecheck` (Passed - no compiler errors)
    2.  `npm run test` (Passed - all 383 tests passing)
    3.  `npm run build` (Passed - successfully bundled dist assets)
*   **Forbidden Pattern Scan**: Scanned `src/game/` for `as any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable`. Result: 0 matches.
