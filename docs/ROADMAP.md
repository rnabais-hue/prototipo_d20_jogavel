# Roadmap

This roadmap is intentionally conservative for a **custom d20-inspired tactical RPG prototype**. It records possible future steps without making them current scope.

## Phase 0: Technical Foundation

Status: current foundation exists.

- Vite + TypeScript.
- Phaser scene boot.
- Vitest test runner.
- Layer folders.
- Project documentation.

## Phase 1: Pure Movement and Exploration Debug Baseline

Status: stable baseline closed.

Implemented pieces:

- Pure grid conversion and bounds checks.
- Debug grid visualization in Phaser.
- Static debug actor placeholder aligned to a grid cell.
- Debug click selection on valid grid cells.
- Pure `ActorState` with `idle` and `moving` statuses.
- Pure movement intent through `startActorMove`.
- Pure logical movement completion through `completeActorMove`.
- Separate debug visuals for selected cell and target cell.
- Debug-only 500ms linear placeholder interpolation from `currentCell` to `targetCell`.
- Debug visual arrival tied to automatic logical completion through `completeActorMove` when the interpolation finishes.
- Manual debug completion with Space that completes logical movement immediately and places the actor placeholder at the completed current cell.
- Pure placeholder exploration map with simple blocked destination cells.
- Pure valid movement destination checks that combine grid bounds, movement range, and walkability.
- Debug visualization for valid movement destinations, excluding blocked and out-of-range cells.
- Debug straight Manhattan path preview for selected cells.
- Debug camera pan, zoom, and reset controls.
- Fixed debug HUD, legend, and status text that remain readable while the camera moves.
- Windows review launcher through `abrir-prototipo.cmd`.
- Baseline closure documented in `docs/EXPLORATION_DEBUG_BASELINE.md`.

Important boundaries:

- Straight path preview is not pathfinding.
- Valid destinations are not pathfinding.
- Blocked cells are only destination validation, not route collision.
- The 500ms tween is debug presentation, not a final movement-speed system.

Possible future directions, only with separate scope:

- Pathfinding.
- Real playable exploration.
- Turns or combat.
- Entity or character systems.
- Real UI.

## Phase 2: Pure Tactical Core v0

Status: closed and documented in `docs/TACTICAL_CORE_V0_CLOSEOUT.md`.

Implemented pieces:

- Catalog-driven tactical participant assembly.
- Minimal original MVP tactical catalogs.
- Pure encounter state with teams, runtime life, simple defeat, supplied turn order, and active turn state.
- Defeat-aware encounter creation and turn advancement.
- Main-action declaration and spending.
- Explicit check resolution from caller-supplied rolls.
- Basic attack hit/miss resolution.
- Damage application and participant defeat events.
- Basic attack plus damage pipeline.
- Pure encounter outcome read model.
- Pure combat fixtures for tests/prototypes.
- Integrated pure smoke flow covering attack, damage, turn advancement, defeat, and resolved outcome.

Important boundaries:

- The tactical core is not a UI or visual harness.
- The tactical core is not integrated with exploration.
- The tactical core has no grid, position, range, adjacency, or tactical movement.
- The tactical core does not roll initiative internally.
- The tactical core does not include critical hits, reactions, healing, resources, complex conditions, AI, rewards, or automatic scene transitions.
- The tactical core does not emit automatic encounter-end or victory events.

Possible future directions, only with separate scope:

- Combat debug harness.
- Exploration-to-encounter transition.
- Grid/position tactical layer.
- Initiative roller.
- Original content expansion.
- Healing, conditions, resources, and richer action/effect data.

## Phase 3: Presentation Shell

Status: future only, not started.

Possible narrow additions:

- Better Phaser boot scene.
- Debug-only UI shell.
- Minimal loading/error handling.
- Combat debug harness for inspecting pure tactical state transitions.

## Phase 4: First Interactive Vertical Slice

Future only, when requested.

This phase would need a separate scope definition before implementation. It may eventually include real movement execution, grid interaction, or combat, but none of those should be expanded without a narrow task.

## Always Out Unless Explicitly Approved

- Official IP or official setting references.
- Official names or lore.
- Official rules text.
- Official art or copied assets.
- Broad system implementations without a narrow task.
- Combat, HP, damage, defense, enemies, or character systems.
- Narrative or lore content.

## Validation Commands

```bash
npm run test
npm run typecheck
npm run build
```



