# Combat Visual Feedback Closeout v0

## Purpose

This document closes the **Combat Visual Feedback v0** track for the custom d20-inspired tactical RPG prototype.

The goal was to improve readability of the existing debug combat loop in Phaser without changing combat rules, adding tactical movement, or turning the prototype overlay into final UI. This track was implemented as a small presentation layer on top of the exploration-to-combat integration flow.

---

## Scope Completed

1. **Floating Combat Text**:
   - Created [debugCombatFloatingText.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatFloatingText.ts) to display vertical-floating and fading text values.
   - Spawns `-{damageApplied} HP` (red-orange, `#ff6b4a`) on hits, and `MISS` (gray-blue, `#8fb8de`) on misses.
   - Visual distinction between player actions (spawns at `x = width * 0.62`, `y = height * 0.35`) and opponent actions (spawns at `x = width * 0.38`, `y = height * 0.35`).
   - Automatically destroys the temporary text GameObjects upon tween completion (1200ms duration, `Cubic.easeOut`).
   - Returns a disposable handle (`{ destroy: () => void }`) enabling immediate cleanup if combat concludes or restarts before the tween naturally finishes.

2. **Graphical HP Bars**:
   - Created [debugCombatHpBar.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatHpBar.ts) to render progress-bar health indicators.
   - Shows combatant label name and numeric HP values (e.g. `Gargoyle Gladiator: 24/24 HP`).
   - Dynamically changes colors based on the current HP ratio: Green (`#4ade80`) for >60%, Yellow (`#facc15`) for 30-60%, and Red (`#ef4444`) for <30%.
   - Smoothly animates value transitions using 200ms Phaser tweens on ratio updates.
   - Placed at the top-left for the player (`x = 24`, `y = 28`) and top-right for the opponent (`x = width - 224`, `y = 28`).

3. **Hit/Miss Flash Overlay**:
   - Created [debugCombatFlash.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatFlash.ts) to provide screen overlay flashes.
   - **Player Hit**: Flashes the right half of the screen (the opponent's zone) green-yellow (`0xa3e635`, alpha `0.15`, duration `200`) to confirm a successful hit.
   - **Opponent Hit**: Flashes the left half of the screen (the player's zone) red (`0xef4444`, alpha `0.2`, duration `200`) to represent damage taken.
   - **Misses**: Triggers no flashes to preserve high contrast and punchy feedback on successful hits.
   - Returns a disposable handle (`{ destroy: () => void }`) enabling immediate cleanup of active flashes on reset or exit.

4. **Turn indicator & Outcome Banners**:
   - Created [debugCombatTurnIndicator.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatTurnIndicator.ts) to render a panel (`width / 2`, `y = 48`) showing who owns the active turn. Uses a color-coded status pip (Green for player, Red for opponent) and pulses on turn change.
   - Created [debugCombatOutcomeBanner.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatOutcomeBanner.ts) to display victory/defeat panels. Replaces text-only HUD logs with a large "VICTORY" (Gold) or "DEFEAT" (Red) banner that scales up and bounces into view (`Back.easeOut` easing) when combat resolves.

5. **UI Clutter Cleanup**:
   - Hid all 5 debug text HUD panels (`objective`, `interaction`, `entity`, `world`, and `move`) during combat mode by calling `.setVisible(false)` in [PrototypeScene.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/scenes/PrototypeScene.ts).
   - Prevents overlapping text with the combat log console and keeps the visual layout polished and clear.
   - Restores the visibility of debug HUD panels and resets layout spacing once combat concludes and the player returns to exploration mode.

---

## Core Files

* **Visual Helpers (Phaser Graphics/Tweens/Text)**:
  - [src/game/debug/debugCombatFloatingText.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatFloatingText.ts)
  - [src/game/debug/debugCombatHpBar.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatHpBar.ts)
  - [src/game/debug/debugCombatFlash.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatFlash.ts)
  - [src/game/debug/debugCombatTurnIndicator.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatTurnIndicator.ts)
  - [src/game/debug/debugCombatOutcomeBanner.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/debug/debugCombatOutcomeBanner.ts)
* **Game Presentation (Orchestration/Wiring)**:
  - [src/game/scenes/PrototypeScene.ts](file:///G:/Meu Drive/Ideias Ruins/Jogo Tormenta/prototipo_d20_jogavel/src/game/scenes/PrototypeScene.ts)

---

## Architectural Guarantees

- **No Bloating of PrototypeScene**: All visual presentation helpers were modularly extracted into separate files under `src/game/debug/`. The main scene file only gained thin wiring calls.
- **Purity of Core Rules & Adapters**: Core layers (`src/rules/`, `src/combat/`, `src/movement/`, and `src/exploration/`) remain completely pure and untouched. Zero Phaser or presentation concerns were introduced.
- **Clean Cleanup**: All created graphical objects, containers, HP bars, turn indicators, banners, and active transient feedback handles (floating texts, flashes) are registered and properly destroyed immediately when combat resets or returns to exploration, avoiding visual ghosting.

---

## Explicitly Out Of Scope

- **Combat Grid Movement**: Repositioning combatants, adjacency, flanking, range checks, movement budget, or cover on the grid.
- **Production UI Assets**: Game UI assets, sprites, audio/SFX, or custom fonts. All rendering uses Phaser primitives.
- **XP/Loot & Rules Changes**: No changes to combat math, presets, initiative rolls, or experience points.

---

## Validation Snapshot

- **Typecheck**: Passing cleanly.
- **Test Suite**: Passing (30 test files, 228 test cases).
- **Build**: Compiling successfully.
- **Boundary Scans**: Clean.

---

## Recommended Next Tracks

1. **Combat Grid Movement**: Introduce movement during combat mode. Allow characters to move on the grid spending action budgets, and implement range limit checks for basic attacks and special abilities.
2. **Initiative System**: Roll d20 for all participants at the start of combat, sorting them dynamically into the active turn order.
3. **Sound Effects (SFX)**: Integrate basic audio feedback for hits, misses, damage, and turn transitions.
