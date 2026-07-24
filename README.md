# Custom d20-Inspired Tactical RPG Prototype

This is a local and private **custom d20-inspired tactical RPG prototype** built with TypeScript, Phaser, Vite, and Vitest.

The intellectual-property rule that governs every change lives in `AGENTS.md` and is not restated
here. Read it there before writing anything; it is the single source of truth for what may and
may not enter this repository, and duplicating it would only let the two copies drift apart.

## Current MVP Status

The prototype is playable end to end in the browser: explore a debug map, walk into a combat
trigger, fight a full turn-based encounter, and return to exploration on victory or restart on
defeat. Every item below is implemented; the file or closeout named next to it is the evidence.
Pure rules, combat and presentation helpers are unit tested; the Phaser scene itself is not, so
scene behaviour is stated from the code in `src/game/scenes/PrototypeScene.ts`.

### Exploration

- Debug exploration map on an 18x10 grid with static blocked cells and switch-controlled
  blockers (`src/game/debug/debugExplorationConfig.ts`, `src/exploration/switchControlledMap.ts`).
- Click-to-move driven by orthogonal pathfinding, with a path preview and a 4-cell move range
  (`src/exploration/orthogonalPathfinding.ts`, `src/game/scenes/PrototypeScene.ts`).
- Interest points of four kinds — survey, switch, exit marker and combat trigger — with pure
  interaction results (`src/exploration/interestPoint.ts`).
- Exit marker gated on switch state, plus a pure local-objective read model
  (`src/rules/exitActivation.ts`, `src/rules/localObjective.ts`).
- Baseline recorded in `docs/EXPLORATION_DEBUG_BASELINE.md`.

### Combat

- Pure tactical core: participants, encounters, supplied turn order, checks, basic attacks,
  damage, defeat, outcomes and an integrated smoke flow, all under `src/rules/`. Closed in
  `docs/TACTICAL_CORE_V0_CLOSEOUT.md`.
- Combat session orchestration over the content pack: preset loading, restart, turn advance and
  a scripted opponent (`src/combat/combatSession.ts`, `src/combat/enemyScript.ts`,
  `src/content/combatPresets.ts`).
- Grid positioning on a 10x8 arena, a 4-cell movement allowance per turn, and weapon range bands
  enforced before an attack is spent (`src/combat/combatPositioning.ts`,
  `src/combat/combatWeaponRange.ts`, `src/combat/combatAttackRange.ts`). Closed in
  `docs/COMBAT_GRID_MOVEMENT_CLOSEOUT_V1.md`.
- A generic resource pool spent by the primary ability (`src/combat/combatResources.ts`).
- Exploration-to-combat integration: interacting with a combat trigger point starts a session in
  the same scene, and resolving it returns to exploration. Closed in
  `docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md`.

### Presentation

- Combat visual feedback: HP bars, floating damage/miss text, hit flashes, turn indicator and
  victory/defeat banners (`src/game/debug/debugCombat*.ts`). Closed in
  `docs/COMBAT_VISUAL_FEEDBACK_CLOSEOUT_V1.md`.
- Typed asset catalog with deterministic code-native fallbacks, actor animations and a serialized
  motion queue (`src/game/visual/`). Closed in `docs/PLAYABLE_PRESENTATION_CLOSEOUT_V1.md`.
- Normal / debug presentation toggle that hides technical HUD blocks by default
  (`src/game/visual/presentationState.ts`, `docs/DEBUG_PRESENTATION_TOGGLE_V0.md`).

### Terminal harness

- A command-line manual playtest loop for the same combat session lives in `src/cli/` and runs
  through the `combat:cli` script. Closed in `docs/COMBAT_CLI_HARNESS_CLOSEOUT_V1.md`.

### Not implemented

- `src/narrative/` and `src/ui/` are empty: no narrative engine, dialogue, quests, inventory,
  save/load or audio.
- No character creation or progression; the playable sheet is a fixed content preset.
- Only the debug exploration map exists; there is no level or encounter authoring pipeline.
- Art is code-native placeholder work, not production art.

## Open For Review

On Windows, run:

```bat
abrir-prototipo.cmd
```

The launcher enters this project folder, starts Vite at `http://127.0.0.1:5173/`, and asks Vite to open the browser automatically. If startup fails, the command window stays open so the error can be read.

For the terminal combat harness, run `abrir-combate-cli.cmd` or the `combat:cli` script below.

## Exploration Controls

Registered in `src/game/scenes/PrototypeScene.ts` and `src/game/debug/DebugCameraController.ts`.

- Click a reachable grid cell: preview the orthogonal path and start debug movement.
- Space: complete the current debug movement immediately.
- F: interact with an adjacent interest point.
- WASD or arrow keys: pan the debug camera.
- Q / E: zoom out / zoom in.
- R: reset the debug camera.
- D: toggle debug presentation on or off.
- The debug HUD, legend, and status text stay fixed on screen while the map pans and zooms.

## Combat Controls

Combat is entered only by interacting with a combat trigger point; there is no hotkey for it.
Exploration click-to-move, Space and F are blocked while combat is active.

Main menu:

- 1: open the attacks submenu.
- 2: open the abilities submenu.
- 3: end the player turn, which runs the opponent turn automatically. Once victory is resolved,
  3 returns to exploration instead.
- Click a highlighted cell: move the active participant within the remaining allowance.

Attacks submenu:

- 1 / 2 / 3: resolve the melee, short-range or long-range weapon action.
- 0: back to the main menu.

Abilities submenu:

- 1: resolve the primary ability, spending its resource cost.
- 0: back to the main menu.

Any time:

- ESC: return to exploration once combat is resolved as a victory.
- R: restart the encounter.
- D: toggle debug presentation on or off.

## Commands

This project uses **pnpm**, pinned in `package.json` under `packageManager`. Enable it once per
machine with `corepack enable` (corepack ships with Node), then `pnpm install`. Node version is
declared in `.nvmrc` and `engines`; `nvm use` picks it up.

Use these validation commands before handing off changes:

```bash
pnpm test
pnpm typecheck
pnpm build
```

The same three run in CI on every pull request and on pushes to `master`
(`.github/workflows/ci.yml`), against a frozen lockfile.

For local development:

```bash
pnpm dev
```

For the terminal combat harness:

```bash
pnpm combat:cli
```

## Documentation

Read these first, in this order:

1. `AGENTS.md` — non-negotiable rules: IP, engine/content split, layering, scope discipline.
2. `docs/ARCHITECTURE.md` — layer boundaries and the three-tier context model.
3. `docs/DECISIONS.md` — numbered decision log; the last entries carry the current direction.
4. This file — the current implemented state.
5. `docs/MVP_SCOPE.md` — what is in scope and what is deliberately not.

Everything else in `docs/` is archive and is found by naming convention, not by reading the
folder:

- `*_DESIGN_CUT_V0.md` — the plan for one slice, written before the work.
- `*_CLOSEOUT_V*.md` — what that slice actually delivered, written after it. This is the
  authoritative record for a finished feature.
- `EXTERNAL_ART_*.md` and `public/assets/PROVENANCE.md` — the external art track and asset
  provenance.

`docs/` exceeds 250 KB. Reading it in full is neither expected nor desired: open an archive
document only when a task names it. `README.md` and `docs/MVP_SCOPE.md` are the current-state
documents and are updated at every closeout.
