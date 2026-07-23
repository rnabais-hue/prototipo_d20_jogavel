# MVP Rules

This document records rule-system boundaries for the **custom d20-inspired tactical RPG prototype**.

## Current Rule Scope

The current MVP has a small pure movement foundation, a minimal pure exploration-map proof point, and a tiny pure rules proof point. It does not implement combat, powers, characters, dice mechanics, conditions, inventory, progression, or narrative rules.

## Pure Rules Requirement

`src/rules/`, `src/movement/`, and `src/exploration/` must remain pure and testable.

They must not depend on:

- Phaser.
- `src/game/`.
- `src/ui/`.
- `src/narrative/`.
- Browser-only APIs.

Rules should be deterministic where possible and covered by Vitest when meaningful behavior is added.

## Current Movement Rules

`src/movement/` currently contains pure grid math and minimal actor movement state:

- `worldToGrid` converts world positions to grid cells using `floor` and a configurable cell size.
- `gridToWorld` converts grid cells to world-space cell centers.
- `isCellInsideGrid` validates a cell against rectangular grid bounds.
- `getManhattanDistance` returns pure orthogonal grid distance between two cells.
- `isCellWithinMoveRange` checks a cell against a fixed movement range using Manhattan distance only.
- `getStraightManhattanPath` returns a deterministic debug preview path from one cell to another, walking X first and then Y, excluding the origin and including the destination.
- `ActorState` stores an actor id, `currentCell`, and an `idle` or `moving` status.
- A `moving` actor also stores `targetCell`.
- `startActorMove` transitions an idle actor to moving with a target cell.
- `startActorMove` rejects new destinations while the actor is already moving.
- `completeActorMove` represents logical arrival by returning an idle actor whose `currentCell` is the previous `targetCell`.
- `completeActorMove` removes `targetCell` from the completed idle state and does not mutate the original actor state.

These are state transitions only. They do not render, animate, interpolate, or advance time.

Movement range currently does not pathfind, inspect routes, apply terrain costs, or account for blocked cells by itself.

The straight Manhattan path preview is not pathfinding. It does not inspect routes, avoid blocked cells, check connectivity, apply costs, or validate movement.

## Current Exploration Rules

`src/exploration/` currently contains a minimal pure placeholder map model and destination validation:

- `ExplorationMap` stores rectangular `bounds` and a list of blocked grid cells.
- `isCellBlocked` checks whether a cell is explicitly listed as blocked.
- `isCellWalkable` returns true only for cells inside the map bounds that are not blocked.
- `getMoveDestinationStatus` classifies movement destinations as valid, outside grid, blocked, or out of range in that semantic order.
- `isValidMoveDestination` delegates to `getMoveDestinationStatus` and returns true only for valid destinations.
- `getValidMoveDestinations` enumerates grid cells and returns only valid destinations for a source cell and range.
- These checks do not pathfind, inspect routes, check connectivity, apply terrain costs, or mutate input data.

## Current Debug Presentation

`PrototypeScene` can visualize the pure movement state for debugging:

- Clicking a valid walkable grid cell starts movement intent through `startActorMove`.
- The selected cell and accepted target cell are highlighted separately.
- A valid click accepted while the actor is idle starts a debug-only linear visual interpolation of the placeholder from `currentCell` to `targetCell` and reports `move accepted: x,y`.
- The debug interpolation duration is fixed at 500ms and lives under `src/game/debug/`.
- When the debug interpolation finishes, the controller calls `completeActorMove` automatically.
- Automatic completion changes the debug actor back to `idle`, updates `currentCell` to the previous `targetCell`, removes `targetCell`, clears the target highlight, updates the valid-destination highlight, and refreshes the debug text.
- Clicking a blocked grid cell while the actor is idle updates the selected-cell highlight, reports `move blocked: blocked cell`, does not call `startActorMove`, does not change `targetCell`, and does not start a tween.
- Clicking a cell outside the debug actor's Manhattan movement range while idle updates the selected-cell highlight, reports `move blocked: out of range`, does not call `startActorMove`, does not change `targetCell`, and does not start a tween.
- The debug scene highlights valid movement destinations for the current actor cell. This highlight excludes blocked cells and cells outside range, and remains separate from blocked, selected, and target cells.
- Clicking any cell inside the debug grid draws a straight Manhattan path preview from the actor's logical `currentCell` to the selected cell. This preview is presentation-only, walks X first and then Y, excludes the actor's origin cell, includes the selected destination cell, and remains separate from valid destinations, blocked cells, selected cells, and target cells.
- The path preview can be shown for blocked cells or cells outside range because it is a debug selection preview, not route validation or movement confirmation.
- Clicking while the actor is moving updates the selected-cell highlight, reports `move blocked: actor is moving`, does not change `targetCell`, and does not start a new visual movement.
- Clicking outside the grid clears the selected-cell highlight and path preview, leaves actor state unchanged, and reports `outside grid`.
- Pressing Space during movement completes immediately through `completeActorMove`, places the placeholder at the completed `currentCell`, clears the target highlight, and updates the valid-destination highlight.
- Pressing Space after automatic completion leaves the already idle actor unchanged.
- The debug camera lives in `src/game/debug/`, pans with WASD or arrow keys, zooms with Q/E, and resets with R.
- Debug pointer input uses Phaser world coordinates, so grid selection remains aligned after camera pan or zoom.

This debug interpolation, automatic completion, blocked-cell destination status, range status, valid-destination check, blocked-command feedback, and destination visualization are not pathfinding, collision, movement speed, command queues, sprite animation, real movement execution, or a definitive movement system.

## Not Implemented Yet

The project still does not have:

- Real movement timing or movement speed rules.
- Character sprite animation.
- Pathfinding.
- Collision.
- Real obstacle or collision systems.
- Command queues.
- A real map.
- Combat.
- HP, damage, defense, or conditions.
- Character creation.
- Powers or spells.
- Equipment or inventory rules.
- Encounter rules.

These require explicit future tasks.

## d20-Inspired Boundary

The project may be inspired by the general idea of d20-style tactical RPG play, but it must remain custom. Do not copy official rule text, official mechanics expression, official names, official stat blocks, official powers, official classes, official ancestry content, or official setting material.

## Validation Commands

```bash
npm run test
npm run typecheck
npm run build
```





