# Motion and Impact Feedback v0

This document outlines the architecture, update synchronization sequences, configurations, presentation events, and integrations for Milestone 5: **Motion and Impact Feedback v0**.

---

## 1. Rule-First Resolution and Decoupling

A strict architectural boundary is maintained:
*   **Rule-First Resolution**: Every action (movement, basic strike, Focused Drive ability, resources, opponent scripts, turn end, victory/defeat outcomes) resolves instantly and deterministically within the pure `CombatSession` layer.
*   **Decoupled Presentation**: No animation, tween, timer, screen flash, or visual effect blocks or determines game outcomes.
*   **Autoritative Synchronization**: The session resolves the post-action state. The presentation layer maps these resolved actions into sequenced visual cues and schedules playback, leaving the game rules entirely isolated from rendering timings.

---

## 2. Timing Mappings

Animation timings are brief, tactical, and immediately interruptible:

```
[Selection]     -->  100 ms
[Anticipation]  -->  100 ms
[Lunge]         -->  150 ms
[Hit/Miss]      -->  150 ms
[Movement]      -->  300 ms
[Defeat]        -->  300 ms
```

Timings are defined dynamically. If Reduced-Motion Mode is active, all durations snap to `0 ms` (snapping visually to final states instantly).

---

## 3. Corrected Update Order & Motion Preservation

To prevent state refreshes or hover-redraws from interrupting active motion, synchronization follows this order:

```
+-----------------------------------+
| 1. Resolve action in session      |
+-----------------------------------+
                  |
                  v
+-----------------------------------+
| 2. Sync state / update HUD first  |
|    (updateDebugText/gridView)     |
+-----------------------------------+
                  |
                  v
+-----------------------------------+
| 3. Queue / Play visual events     |
|    (motionCoordinator.play)       |
+-----------------------------------+
```

### Motion-Preserving Grid Updates
*   When `gridView.update()` runs, it refreshes indicators and checks layout dimensions.
*   Handles are updated via `snapToAuthoritativeState(world, options, forceSnap)`.
*   During normal hover or log updates, `forceSnap` is `false`. If there are active tweens running on a combatant container, its position `(x, y)`, `scale`, `alpha`, and `angle` are **not** overwritten. Only internal graphic assets (e.g. target outlines) are redrawn, preserving active animations.
*   During layout resizes or combat reset events, `forceSnap` is `true`. Any running tweens are cancelled instantly, and handles snap to their authoritative layout positions.

---

## 4. Sequencing & Invalidation Lifecycles

Visual animations are serialized in a FIFO queue managed by `MotionCoordinator`:
*   **Anticipation Windup**: squash and pullback.
*   **Impact Event**: recoil, target scale punch, target-local damage floating text (e.g., `-4 HP` in red/orange), half-screen color overlay flash, and HUD HP bar progression.
*   **Miss Slide**: lateral dodge slide perpendicular to the attack angle, target-local MISS floating text in pale blue.
*   **Crumple Sequence**: target rotate-fade-scale shrink.
*   **Outcome Panel**: victory or defeat panel overlay.

### Sequence Token Invalidation
Stops or resets must never leave the queue in a stuck state. Playback uses sequence IDs:
*   A counter (`currentSequenceId`) increments whenever a new playback sequence is started or cancelled.
*   Tween completion callbacks and timer events capture the `sequenceId` of their spawning sequence.
*   When a callback triggers, it checks if its captured `sequenceId` matches the coordinator's active `currentSequenceId`. If they do not match (due to cancellation, reset, or restart), the callback is ignored and does not advance the queue.
*   Tracked timers (`activeTimer` from moves) are cleanly disposed and nullified on cancellation.

---

## 5. Files and Structure

*   [motionConfig.ts](../src/game/visual/motionConfig.ts): Timings, toggle flag, and config access.
*   [presentationEvents.ts](../src/game/visual/presentationEvents.ts): Types for presentation events and action mappers.
*   [combatantViewHandle.ts](../src/game/visual/combatantViewHandle.ts): `PhaserCombatantViewHandle` container controller, tween handlers, and motion-preserving snap.
*   [motionCoordinator.ts](../src/game/visual/motionCoordinator.ts): Event queue sequencing, token invalidation, timer tracking, and visual callbacks.
*   [debugCombatGridView.ts](../src/game/debug/debugCombatGridView.ts): Persistent handles cache, move interpolation trigger, and resize snap.
*   [PrototypeScene.ts](../src/game/scenes/PrototypeScene.ts): Coordination loops, correct call ordering, and reset cleanups.

---

## 6. Verification and Testing

### Automated Test Count
The entire test suite is verified via Vitest:
*   **Passed Tests**: 376 tests
*   **Test Files**: 45 files
*   **Tests added**: Lifecycle tests for queue sequencing, synchronous reduced-motion execution, timer disposal, cancel reset, and invalidation of stale callbacks.

### Runtime Validation Scenarios
The following scenarios have been validated:
1.  **Player weapon hit**: plays windup, lunges, triggers recoil, flashes orange text, updates HP on impact.
2.  **Player weapon miss**: plays windup, target dodges laterally, flashes MISS.
3.  **Primary ability hit/miss**: Focused Drive animation behaves correctly.
4.  **Opponent action hit/miss**: Gargoyle strike lunges and reacts correctly.
5.  **Fatal hits (Player/Opponent)**: fatal damage triggers hit reaction, then immediately triggers crumple and outcome panels.
6.  **Movement interpolation**: move action tweens smooth path.
7.  **Cancellations**: pressing reset `R` during windup, lunge, or impact snaps all handles to baseline state instantly.
8.  **Resize**: resizing the browser during animation cancels active tweens and snaps all tokens.
9.  **Reduced-Motion mode**: snap-mode plays all sequences instantly, updating HP and console text synchronously.
