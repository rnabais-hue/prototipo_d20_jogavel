# Custom d20-Inspired Tactical RPG Prototype

This is a local and private **custom d20-inspired tactical RPG prototype** built with TypeScript, Phaser, Vite, and Vitest.

The project exists to grow a small, modular MVP foundation. It must not contain official IP, official names, official lore, official texts, official rules text, or official art from any existing game, setting, book, or franchise.

## Current MVP Status

The current project is a technical prototype foundation:

- Vite + TypeScript app shell.
- `PrototypeScene` opens in the browser.
- Pure grid conversion and actor movement state.
- Pure Manhattan movement range checks.
- Pure straight Manhattan path preview helper for debug presentation.
- Pure valid movement destination checks combining grid bounds, range, and walkability.
- Pure placeholder exploration map with simple blocked cells.
- Phaser debug visualization for grid, actor, valid movement destinations, selected cell, target cell, straight path preview, blocked cells, movement feedback, and a compact review legend.
- Pure Tactical Core v0 for abstract participants, encounters, turns, checks, basic attacks, damage, defeat, outcomes, fixtures, and smoke-flow validation.
- Phaser combat debug harness for stepping through the deterministic tactical smoke flow visually.

No exploration-to-combat integration, pathfinding, collision, powers, inventory, narrative system, or playable character system is implemented yet. The straight path preview is not pathfinding. The current exploration debug baseline is documented in `docs/EXPLORATION_DEBUG_BASELINE.md`.

## Open For Review

On Windows, run:

```bat
abrir-prototipo.cmd
```

The launcher enters this project folder, starts Vite at `http://127.0.0.1:5173/`, and asks Vite to open the browser automatically. If startup fails, the command window stays open so the error can be read.

## Combat Debug Controls

- 1: resolve the next planned combat action.
- Enter: end the active turn.
- R: reset the combat encounter.
- E: switch to exploration debug.

## Exploration Debug Controls

- C: switch to combat debug.
- Click a valid grid cell: select and start debug movement.
- Space: complete the current debug movement immediately.
- WASD or arrow keys: pan the debug camera.
- Q / E: zoom out / zoom in.
- R: reset the debug camera.
- The debug HUD, legend, and status text stay fixed on screen while the map pans and zooms.

## Commands

Use these validation commands before handing off changes:

```bash
npm run test
npm run typecheck
npm run build
```

For local development:

```bash
npm run dev
```

## Documentation

Project guidance lives in `docs/`:

- `docs/ARCHITECTURE.md`
- `docs/MVP_SCOPE.md`
- `docs/ROADMAP.md`
- `docs/EXPLORATION_DEBUG_BASELINE.md`
- `docs/CODEX_WORKFLOW.md`
- `docs/CONTENT_MODEL.md`
- `docs/NARRATIVE_ARCHITECTURE.md`
- `docs/MVP_RULES.md`
- `docs/DECISIONS.md`

Future agents should read `AGENTS.md` before making changes.





