# Combat Visual Feedback Closeout v1

## Purpose

This document closes the **Combat Visual Feedback** track (v0/v1) for the custom d20-inspired tactical RPG prototype.

The goal was to improve readability of the existing debug combat loop in Phaser without changing combat rules, adding tactical movement, or turning the prototype overlay into final UI. This track was implemented as a small presentation layer on top of the exploration-to-combat integration flow.

---

## Scope Completed

1. **Floating Combat Text**:
   - Created `src/game/debug/debugCombatFloatingText.ts` to display vertical-floating and fading text values.
   - Spawns `-{damageApplied} HP` (red-orange, `#ff6b4a`) on hits, and `MISS` (gray-blue, `#8fb8de`) on misses.
   - Visual distinction between player actions (spawns at `x = width * 0.62`, `y = height * 0.35`) and opponent actions (spawns at `x = width * 0.38`, `y = height * 0.35`).
   - Automatically destroys the temporary text GameObjects upon tween completion (1200ms duration, `Cubic.easeOut`).
   - **Post-Review Transient Fix**: Modified to return a disposable handle (`{ destroy: () => void }`) that halts the active tween and destroys the target text object immediately, preventing visual leaks onto other modes.

2. **Graphical HP Bars**:
   - Created `src/game/debug/debugCombatHpBar.ts` to render progress-bar health indicators.
   - Shows combatant label name and numeric HP values (e.g. `Gargoyle Gladiator: 24/24 HP`).
   - Dynamically changes colors based on the current HP ratio: Green (`#4ade80`) for >60%, Yellow (`#facc15`) for 30-60%, and Red (`#ef4444`) for <30%.
   - Smoothly animates value transitions using 200ms Phaser tweens on ratio updates.
   - Placed at the top-left for the player (`x = 24`, `y = 28`) and top-right for the opponent (`x = width - 224`, `y = 28`).

3. **Hit/Miss Flash Overlay**:
   - Created `src/game/debug/debugCombatFlash.ts` to provide screen overlay flashes.
   - **Player Hit**: Flashes the right half of the screen (the opponent's zone) green-yellow (`0xa3e635`, alpha `0.15`, duration `200`) to confirm a successful hit.
   - **Opponent Hit**: Flashes the left half of the screen (the player's zone) red (`0xef4444`, alpha `0.2`, duration `200`) to represent damage taken.
   - **Misses**: Triggers no flashes to preserve high contrast and punchy feedback on successful hits.
   - **Post-Review Transient Fix**: Modified to return a disposable handle (`{ destroy: () => void }`) to immediately halt active graphic overlays and tweens on request.

4. **Turn indicator & Outcome Banners**:
   - Created `src/game/debug/debugCombatTurnIndicator.ts` to render a panel (`width / 2`, `y = 48`) showing who owns the active turn. Uses a color-coded status pip (Green for player, Red for opponent) and pulses on turn change.
   - Created `src/game/debug/debugCombatOutcomeBanner.ts` to display victory/defeat panels. Replaces text-only HUD logs with a large "VICTORY" (Gold) or "DEFEAT" (Red) banner that scales up and bounces into view (`Back.easeOut` easing) when combat resolves.

5. **UI Clutter Cleanup & HUD Spacing**:
   - Hid all 5 debug text HUD panels (`objective`, `interaction`, `entity`, `world`, and `move`) during combat mode by calling `.setVisible(false)` in `src/game/scenes/PrototypeScene.ts` to keep the layout polished and avoid screen overlaps.
   - Restores the visibility of debug HUD panels and resets layout spacing once combat concludes and the player returns to exploration mode.

---

## Transient Feedback Cleanup Architecture (V1 Review Fix)

During post-implementation review, a visual leak was resolved where floating text and screen flashes that were active during a turn transition would persist/ghost onto the exploration screen (after victory) or into a freshly restarted combat session (after defeat).

The following registry architecture was implemented to guarantee immediate visual cleanup:
- **Disposable Handles**: Both `spawnFloatingText()` and `flashOverlay()` return a handle structure:
  ```typescript
  export type DisposableHandle = {
    destroy: () => void;
  };
  ```
  The returned `destroy()` method stops the active Phaser tween and immediately destroys the target GameObject/Graphics if it is active.
- **Active Registry**: `PrototypeScene` maintains a private list `private transientFeedback: { destroy: () => void }[] = [];` to track all active visual handles.
- **Auto-Deregistration**: When spawning transient feedback, an `onComplete` callback is registered in the config. Once the tween finishes naturally, it triggers the callback which filters the completed handle out of `transientFeedback`.
- **Force Clears**: Both `handleCombatReturn()` and `handleCombatReset()` call `this.clearTransientFeedback()` at the very beginning of execution, immediately clearing all active visual elements before transitioning the scene or resetting the session state.

---

## Core Files

* **Visual Helpers (Phaser Graphics/Tweens/Text)**:
  - `src/game/debug/debugCombatFloatingText.ts`
  - `src/game/debug/debugCombatHpBar.ts`
  - `src/game/debug/debugCombatFlash.ts`
  - `src/game/debug/debugCombatTurnIndicator.ts`
  - `src/game/debug/debugCombatOutcomeBanner.ts`
* **Game Presentation (Orchestration/Wiring)**:
  - `src/game/scenes/PrototypeScene.ts`

---

## Architectural Guarantees

- **No Bloating of PrototypeScene**: All visual presentation helpers were modularly extracted into separate files under `src/game/debug/`. The main scene file only gained thin wiring calls.
- **Purity of Core Rules & Adapters**: Core layers (`src/rules/`, `src/combat/`, `src/movement/`, and `src/exploration/`) remain completely pure and untouched. Zero Phaser or presentation concerns were introduced.
- **Clean Cleanup**: All created HP bars, turn indicators, banners, and active transient feedback handles are registered and properly destroyed immediately when combat resets or returns to exploration, avoiding visual ghosting.

---

## Explicitly Out Of Scope

- **Combat Grid Movement**: Repositioning combatants, adjacency, flanking, range checks, movement budget, or cover on the grid.
- **Production UI Assets**: Game UI assets, sprites, audio/SFX, or custom fonts. All rendering uses Phaser primitives.
- **XP/Loot & Rules Changes**: No changes to combat math, presets, initiative rolls, or experience points.

---

## Validation Snapshot

- **Typecheck**: Passed cleanly.
- **Test Suite**: Passed all **228 tests** across 30 files.
- **Build**: Vite production build succeeded cleanly (with known Phaser bundle-size warning).
- **Boundary Scans**: Clean. Contains known false positives in tests (e.g. `src/rules/combatFixtures.test.ts` checking if `window` / `document` is `undefined` as a robust environment safety check).
*(Note: As this is a purely documentation change, validation scripts were not re-executed during the closeout promotion phase.)*

---

## Recommended Next Tracks

1. **Combat Grid Movement**: Introduce movement during combat mode. Allow characters to move on the grid spending action budgets, and implement range limit checks for basic attacks and special abilities.
2. **Initiative System**: Roll d20 for all participants at the start of combat, sorting them dynamically into the active turn order.
3. **Sound Effects (SFX)**: Integrate basic audio feedback for hits, misses, damage, and turn transitions.
