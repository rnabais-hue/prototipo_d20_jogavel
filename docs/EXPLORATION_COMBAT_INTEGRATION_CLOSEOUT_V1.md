# Exploration-to-Combat Integration Closeout v1

## Purpose

This document closes the **Exploration-to-Combat Integration** macro phase for the custom d20-inspired tactical RPG prototype.

The closeout records what the integration flow now supports, what remains explicitly outside the phase, which files form the integration core, which validations prove the contract, and which future tracks can build on this foundation.

---

## Scope Completed

1.  **Combat Session Adapter Extraction:**
    *   Extracted all non-terminal combat session management rules from the terminal CLI into `src/combat/combatSession.ts`.
    *   Kept the CLI code and unit tests behaviorally equivalent while making the session fully reusable.
2.  **Exploration Combat Trigger Contract:**
    *   Added a new `'combat_trigger'` kind to the pure `InterestPoint` rules and a `'combat_triggered'` interaction effect carrying the combat preset ID.
    *   Defined a debug combat trigger point `poi-combat-1` in config at grid position `{ x: 8, y: 4 }`.
    *   Mapped and custom-rendered the trigger point as an orange-red triangle on the grid.
3.  **Local Roller Injection:**
    *   Injected a browser-safe, game-local d20 roller helper (`gameLocalRoller`) during combat session initialization in Phaser, preventing `'missing_automatic_roll'` errors while keeping randomness out of `src/rules/`.
4.  **Scene Mode Switching & Pointer/Action Blocking:**
    *   Introduced scene-level modes (`'exploration'` vs `'combat'`) to `PrototypeScene`.
    *   Blocked pointer click-to-move and Space bar autocompletion in combat mode, logging `status: blocked (combat mode)` on the HUD.
    *   Blocked keyboard `F` interactions in combat mode, logging `status: interaction blocked (combat mode)`.
5.  **Numeric Combat Inputs & Submenu System:**
    *   Replaced initial debug hotkeys with a unified numeric menu mapping:
        *   **Main Menu:**
            *   `1`: Strike (Basic Attack).
            *   `2`: Special Abilities Submenu.
            *   `3`: End Player Turn (also returns to exploration when Victory is resolved).
        *   **Abilities Submenu:**
            *   Displays available character abilities mapped `1` to `9`.
            *   `1`: Focused Drive (spends 2 PM, rolls d20 and applies damage).
            *   `0`: Returns to Main Menu.
6.  **Combat Log Console & Roll Math Logging:**
    *   Created a persistent scrolling Combat Log Console at the bottom center of the screen during combat (`x: 120`, `y: height - 120`, `width: 560`, `height: 96`).
    *   Displays the last 4 combat messages, automatically updated upon action resolution.
    *   Logs detailed check and modifier math explicitly:
        `[Hero/Gargoyle] Action rolls d20: [Roll] + Mod [Modifier] = Total vs Def [Defense] -> Hit/Miss (Dmg: X HP)`.
7.  **Automated Opponent Turn Loop:**
    *   Ending the player's turn with key `3` automatically advances the turn to the enemy, executes the opponent IA action script, logs its roll details and damage output to the bottom console history, and returns the turn back to the player.
8.  **Tuned Encounter Balance (Challenging Duel Preset):**
    *   Added the `opponentHero` actor (Gargoyle Gladiator) with **24 HP**, +5 check modifier, and Gladiator Strike (dealing 5 damage on hit).
    *   Created the `'challenging-duel'` preset and assigned it to the map trigger at `{ x: 8, y: 4 }` to provide a robust, multi-round combat test.
9.  **Victory Return & Defeat Reset Flows:**
    *   On Victory: pressing `3` or `ESC` exits combat mode, clears session state, and returns to exploration (trigger is marked `'inspected'` and crossed out).
    *   On Defeat: pressing `R` resets the log history, restores all HPs/PMs to maximum, and restarts the fight.
10. **Camera Freezing & HUD Overlap Fixes:**
    *   Paused WASD camera updates in combat mode to prevent viewport drift when using combat action keys.
    *   Arranged HUD panels dynamically: left side blocks (`entity` and `world`) stack dynamically based on content heights (`world.y = entity.y + entity.height + 8`), and are aligned to `x: 16` during combat when the legend is hidden.

---

## Core Files

*   **Rules & Exploration:**
    *   `src/exploration/interestPoint.ts` and `src/exploration/interestPoint.test.ts`
*   **Combat Layer:**
    *   `src/combat/combatSession.ts` and `src/combat/combatSession.test.ts`
    *   `src/cli/combatCliPresets.ts` and `src/cli/combatCliPresets.test.ts`
*   **Game Presentation:**
    *   `src/game/scenes/PrototypeScene.ts`
    *   `src/game/debug/debugExplorationConfig.ts`
    *   `src/game/debug/drawDebugInterestPoints.ts`
    *   `src/game/debug/drawDebugLegend.ts`
    *   `src/game/debug/DebugActorController.ts`
*   **Decisions Log:**
    *   `docs/DECISIONS.md` (Decisions 0041, 0042, 0043, 0044, 0045)

---

## Architectural Guarantees

*   **Purity of Core Rules:** `src/rules/`, `src/movement/`, and `src/exploration/` remain completely pure and free of Phaser, canvas, or browser-only APIs.
*   **Purity of Session Layer:** `src/combat/` avoids any console output, `readline` interfaces, process streams, or Phaser imports, operating entirely on pure data structures.
*   **Separation of Presentation:** All camera freezing, key binding, HUD formatting, and mouse blocking reside strictly within `src/game/` scenes and controllers.
*   **Exhaustive Checking:** Typecheck enforces that new interest point kinds and effects are mapped exhaustively in all switch statements.

---

## Explicitly Out Of Scope

*   **Combat Movement:** Moving on the grid during combat (spending movement actions, flanking, cover).
*   **Initiative Rolling:** Automatically rolling d20 for initiative before combat starts (turn order is currently predetermined by the encounter preset).
*   **Animated Visual Combat:** Characters moving or playing attack/hit animations, floating damage numbers, particle effects, or sound effects.
*   **Inventory & Loot Integration:** Earning XP, items, gold, or equipment upon victory.
*   **Dialog & Narrative Branches:** Triggering dialog boxes or narrative choices before or after combat starts/ends.

---

## Validation Snapshot

Last validated snapshot for this closeout:
*   **Test Suite:** Passing (30 test files, 228 test cases).
*   **Typecheck:** Passing.
*   **Build:** Passing (compiles and bundles to `dist/assets/index-*.js` cleanly).

---

## Recommended Next Tracks

1.  **Visual Feedback (VFX / SFX):** Add floating damage text, flash overlays on hit, simple tween animations, and basic sound effects during combat actions.
2.  **Combat Grid Movement:** Allow characters to move on the grid during combat, spending standard movement actions, enforcing range limit checks for basic attacks and abilities.
3.  **Initiative System:** Roll d20 for all participants at the start of combat, sorting them dynamically into the active turn order.
4.  **XP and Loot System:** Integrate item and XP rewards upon combat victory, updating the character sheet.
5.  **Refactoring InterestPoint Types:** Refactor `InterestPoint` to be a discriminated union based on `kind` to restrict the presence of `encounterPresetId` only to `'combat_trigger'` points.
