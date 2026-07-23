# Exploration Debug Baseline

## Post-Baseline Evolution

- On June 21, 2026, the debug prototype started instantiating a minimal pure explorable entity model that the debug controller now consumes for exploration rendering and movement sync.
- On June 21, 2026, a pure orthogonal grid pathfinding helper was added in `src/exploration/orthogonalPathfinding.ts`.
- On June 21, 2026, the debug Phaser layer was updated to consume that pure helper for click validation, status feedback, and rendered path preview.
- On June 21, 2026, the debug valid-destination overlay was corrected to show only cells that are actually reachable by orthogonal pathfinding within the current range.
- On June 21, 2026, accepted debug movement started preserving and consuming the approved route as its movement basis, while still remaining a lightweight 500ms debug tween.
- On June 22, 2026, static debug interest points were added as a first pure exploration interaction surface with orthogonal adjacency inspection and a minimal `F`-key inspect action.
- On June 22, 2026, debug interest points evolved to support multiple placeholder kinds with distinct pure interaction results for survey, switch, and exit-marker cases.
- On June 22, 2026, the debug map started composing a small switch-controlled blocked segment through a pure effective-map helper so one `switch` can open or close a limited traversal lane.
- On June 23, 2026, the debug `exit_marker` gained a minimal pure local progression requirement and now waits for its linked `switch` to be on before it can activate.
- On June 23, 2026, the fixed debug HUD was reorganized into clearer grouped blocks for objective, interaction, entity, world, and move state, while still remaining prototype-only debug UI.
- On June 23, 2026, local completion started rendering an explicit debug-world completion mark directly on an activated `exit_marker`, so the route closure is visible on the map as well as in the HUD.
- The historical straight Manhattan preview remains part of the baseline history, but it is no longer the current integrated behavior in `PrototypeScene`.

This document closes the current exploration debug baseline. It records what exists now, which parts are pure rules, which parts are Phaser debug presentation, and which systems are still intentionally absent.

The baseline is stable for handoff. Future work should treat it as a documented prototype surface, not as a complete exploration or movement system.

## Current Surface

- `PrototypeScene` is the active Phaser prototype scene.
- `abrir-prototipo.cmd` is the Windows review launcher.
- The scene renders a placeholder square grid.
- A single minimal explorable entity starts on a fixed grid cell.
- Static debug interest points now render on fixed grid cells as placeholder markers.
- The debug map currently includes multiple placeholder point kinds: `survey`, `switch`, and `exit_marker`.
- Some placeholder cells are blocked.
- One small blocked segment now reacts to the debug `switch` and immediately redraws when the switch toggles.
- The debug `exit_marker` now has a minimal local activation condition and stays locked until its linked debug `switch` is on.
- Valid move destinations are visualized around the actor.
- Click selection now resolves through pure orthogonal pathfinding before movement is accepted.
- The path preview now shows the real orthogonal route returned by the pure helper.
- The highlighted debug destinations now represent only cells that are actually reachable by orthogonal pathfinding within range.
- Accepted debug movement now keeps the approved route as its movement basis instead of collapsing immediately to a destination-only command.
- Destination status text distinguishes blocked destination, no path, out-of-range, outside-grid, and actor-moving cases.
- Interaction status text now distinguishes `status: none`, `status: available (...)`, `status: locked (...)`, and kind-specific resolved states using human-readable point labels such as `exit marker`.
- Debug interaction results now report minimal distinct effects instead of collapsing every point into the same generic feedback.
- Debug HUD now shows one short local objective derived from pure point/exit state.
- An activated debug `exit_marker` now also shows a small in-world completion mark, still clearly prototype/debug rather than final production feedback.
- Debug HUD now separates objective, interaction, entity, world, and move feedback into fixed grouped text blocks for quicker scanning, with the move block acting as the transient action/status log.
- The debug legend now uses slightly clearer labels such as `reachable`, `point`, and `hud`.
- Debug camera supports pan, zoom, and reset.
- Debug HUD, legend, and status text stay fixed to the screen.
- Debug movement still uses a 500ms Phaser tween total.
- Movement completes automatically when the tween finishes.
- Space can complete the current movement manually.
- F interacts with one orthogonally adjacent debug interest point that is currently interactable; `switch` points remain re-interactable for repeated toggles.

## Pure Rules

The following behavior is pure and must remain free of Phaser, browser APIs, and presentation dependencies:

- `src/rules/`
  - Prototype label helper.
  - Interaction availability/status rule based on orthogonal adjacency.
  - Exit-marker activation requirement evaluation for debug local progression.
  - Local objective summary rule derived from existing interest-point and exit-gate state.
- `src/movement/`
  - Grid cell and bounds math.
  - World-to-grid and grid-to-world conversion.
  - Actor movement state.
  - Movement start and movement completion state transitions.
  - Manhattan distance and movement range checks.
  - Straight Manhattan debug path preview helper kept only as historical/debug utility.
- `src/exploration/`
  - Placeholder exploration map shape.
  - Minimal explorable entity contract used by the prototype debug scene.
  - Minimal interest-point contract with multiple debug kinds, a simple inspection state, and explicit interaction-result helpers.
  - Blocked-cell lookup.
  - Walkability check.
  - Move destination status classification.
  - Valid move destination enumeration.
  - Pure orthogonal pathfinding with explicit failure reasons and real walkable route output.
  - Pure enumeration of cells actually reachable by orthogonal pathfinding within range.
  - Pure effective-map composition for a tiny switch-controlled blocked-cell slice in the debug map.

## Phaser Debug Presentation

The following behavior belongs to Phaser presentation/debug code:

- `src/game/scenes/PrototypeScene.ts`
  - Scene setup.
  - Pointer and keyboard input routing.
  - Debug status text.
  - Mapping pointer coordinates to pure grid cells.
  - Consumption of pure orthogonal pathfinding results for click feedback and debug acceptance.
  - Consumption of pure interaction status, exit-lock status, and pure interaction results for debug input handling and HUD feedback.
  - Consumption of the current effective debug map for pathfinding and redraw after switch interaction.
- `src/game/debug/`
  - Debug grid rendering.
  - Placeholder explorable-entity rendering.
  - Placeholder interest-point marker rendering with minimal per-kind variation.
  - A small debug-only completion overlay for activated `exit_marker` points.
  - Blocked-cell rendering.
  - Valid-destination rendering based on real reachable cells.
  - Selected-cell and target-cell rendering.
  - Path preview rendering from the pure orthogonal route.
  - Debug camera controller.
  - Debug legend.
  - Debug actor controller, including human-readable status formatting for debug HUD text.
  - Fixed grouped HUD composition for prototype/debug readability only, not final UI.
  - 500ms visual tween for debug movement along the accepted route.

## Controls

- Click a reachable grid cell: select it, preview the real route, and start debug movement.
- Click a blocked cell: show blocked destination feedback.
- Click a cell inside the grid but without a valid route: show no-path feedback.
- Click an out-of-range cell: show out-of-range feedback.
- Click outside the grid: clear selection and report outside-grid feedback.
- F: interact with one orthogonally adjacent debug interest point that is currently interactable.
- Space: complete the current debug movement immediately.
- WASD or arrow keys: pan the debug camera.
- Q / E: zoom out / zoom in.
- R: reset the debug camera.

## Expected Validation

Automated validation:

```bash
npm run test
npm run typecheck
npm run build
```

Manual review:

- Open the prototype with `abrir-prototipo.cmd`.
- Confirm the browser loads `PrototypeScene`.
- Confirm the grid, actor, blocked cells, valid destinations, debug interest points, HUD, legend, and status text are visible.
- Confirm different point kinds are present and visually distinguishable enough for debug use.
- Confirm a reachable click shows the routed preview and starts debug movement.
- Confirm highlighted destinations do not produce `no path` when clicked from the current actor cell.
- Confirm a geometrically near but unreachable click reports no path and does not start movement.
- Move the actor orthogonally adjacent to a debug interest point and confirm the HUD reports `status: available (...)`.
- Press F on each point kind and confirm the HUD reports a kind-specific result.
- Confirm the switch point updates its debug boolean state in the HUD.
- Confirm the switch also changes a small blocked lane, including the blocked-cell render, reachable-destination overlay, and path preview/pathfinding behavior.
- Confirm the exit marker stays unavailable before the required switch is on, then becomes activatable after the switch is turned on.
- Confirm the HUD objective starts by asking for the switch, then changes to the exit marker, then ends in local completion after the exit marker is activated.
- Confirm the activated `exit_marker` also changes to a visibly completed debug-world marker so HUD and world feedback stay aligned.
- Confirm Space completes an in-progress movement immediately.
- Confirm blocked destination, no path, out-of-range, outside-grid, actor-moving, locked-exit, and no-interaction feedback remain visible in the grouped debug HUD with the transient `status: ...` format.
- Confirm camera pan, zoom, and reset do not move fixed HUD text.

## Explicit Non-Goals

The current baseline does not implement:

- Terrain cost.
- A final movement execution system.
- Collision.
- Movement speed rules.
- Turn order.
- Combat.
- Enemies.
- A real character or entity system.
- A final entity system.
- A real exploration gameplay loop.
- Narrative systems.
- Final assets.
- Real game UI.
- Real narrative interaction.
- Inventory or item rewards.
- A real exploration map.
- Real puzzle logic or a reactive systemic map.

## Important Boundaries

- The previous straight Manhattan preview was the original debug behavior; the current integrated preview now comes from pure orthogonal pathfinding.
- Movement acceptance now depends on route reachability, not only on geometric destination validation.
- Debug interaction currently still uses a single minimal orthogonal-adjacency rule, but it now supports multiple placeholder point kinds with distinct debug-only results, including re-interactable `switch` points.
- The switch-controlled blocked cells are still a tiny debug simulation, not a general puzzle framework, not a full door system, and not a final systemic exploration map.
- The exit-marker requirement is still only a local debug progression gate. It is not a quest system, not real progression, not a map transition, and not a complete exploration loop.
- The local objective text is still only debug guidance derived from pure prototype state. It is not a quest system, not a journal, and not final UI.
- The grouped HUD is still a prototype debug overlay. It is not a final HUD, not a menu system, and not a production visual design pass.
- The legend labels and HUD spacing were only polished for debug readability. They are not a final visual language or production UI treatment.
- The in-world exit completion mark is also still debug-only placeholder feedback. It is not a final VFX pass, not a final icon treatment, and not production art direction.
- Survey, switch, and exit-marker outcomes are still prototype-only signals. They do not constitute real narrative, real puzzle logic, real progression, or a complete exploration loop.
- The debug interest points are placeholder exploration anchors only; they do not yet imply dialogue, loot, quest logic, or a final content model.
- The debug overlay now reflects real reachability, but it is still a prototype aid rather than final gameplay UI.
- The 500ms tween is still debug presentation only. It is not the final movement speed, timing, or movement execution system.
- The debug movement now consumes the accepted route by segments, but it is still not a final movement framework.
- Pure orthogonal pathfinding currently does not implement terrain cost or A*.
- The minimal explorable entity is only enough to anchor debug exploration. It is not a real player character and not a final entity architecture.
- Debug actor state still exists to inspect pure movement transitions and currently serves as movement state for that minimal entity.
- This milestone does not constitute real narrative, real UI, or complete exploration gameplay.
- Official IP, official lore, official text, official rules text, and official art remain prohibited.
