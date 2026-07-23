# Combat Grid Movement Design Cut v0

## Purpose

Start the **Combat Grid Movement** track for the custom d20-inspired tactical RPG prototype.

The goal is to evolve combat from an abstract 1v1 loop into a minimal grid-positioned tactical loop, while preserving the existing pure tactical core, combat session adapter, exploration handoff, and debug presentation boundaries.

This track should stay incremental. The first milestone should establish pure positioning contracts before any Phaser interaction is added.

Use the orchestrator/executor split:

- the orchestrator defines milestone scope, boundaries, acceptance criteria, and validation;
- executor agents implement bounded milestones;
- the orchestrator reviews deliveries and maintains track documents;
- direct orchestrator implementation is limited to tiny unblockers, review fixes, or explicit user requests.

## Source Contracts

Read first:

- `docs/COMBAT_VISUAL_FEEDBACK_CLOSEOUT_V1.md`
- `docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md`
- `docs/EXPLORATION_COMBAT_INTEGRATION_DESIGN_CUT_V0.md`
- `docs/TACTICAL_CORE_V0_CLOSEOUT.md`
- `docs/EXPLORATION_DEBUG_BASELINE.md`
- `docs/ARCHITECTURE.md`
- `src/combat/combatSession.ts`
- `src/combat/combatSession.test.ts`
- `src/movement/grid.ts`
- `src/movement/moveRange.ts`
- `src/exploration/orthogonalPathfinding.ts`
- `src/game/scenes/PrototypeScene.ts`
- `src/game/debug/DebugActorController.ts`
- `src/game/debug/debugCombatFloatingText.ts`
- `src/game/debug/debugCombatHpBar.ts`

Current combat surface:

- Combat session state lives in `src/combat/combatSession.ts`.
- Combat rules and attack/damage math live in pure `src/rules/`.
- Combat mode is entered from exploration by interacting with `poi-combat-1`.
- Combat input currently uses numeric debug controls.
- Visual feedback now exists for hit/miss/damage, HP bars, turn indicator, outcome banner, and cleanup of transient effects.
- Combat is still abstract: no combatant grid positions, no movement budget, no adjacency/range enforcement.

## Architecture Direction

Preferred direction:

```text
src/game/ PrototypeScene/debug presentation
  -> src/combat/ combat session + grid-position adapter state
  -> src/rules/ pure abstract combat math
  -> src/movement/ shared pure grid primitives
```

The first grid movement layer should live in `src/combat/`, not `src/rules/`, because the existing tactical core is intentionally abstract and does not own grid, range, adjacency, or tactical movement. It may import shared pure grid types/helpers from `src/movement/`.

Do not push Phaser, rendering, keyboard input, or UI concepts into `src/combat/`, `src/rules/`, `src/movement/`, or `src/exploration/`.

## Track Milestones

### 1. Combat Grid Movement Design Cut v0

Status: this document.

Scope:

- define target architecture;
- define milestone sequence;
- define boundaries;
- provide first executor prompt.

Acceptance:

- design cut exists in `docs/`;
- no runtime code is required for this milestone;
- next executor can start without rediscovering prior tracks.

### 2. Combat Positioning Model v0

Goal:

Add a pure combat positioning module that can track participant cells, occupied cells, movement budgets, and basic movement validation without changing attack behavior or Phaser presentation.

Expected implementation shape:

- add `src/combat/combatPositioning.ts` or equivalent;
- add focused tests under `src/combat/`;
- define a small state/read model for:
  - participant id to grid cell;
  - grid bounds;
  - optional blocked cells if needed for the first tests;
  - movement budget/range for the current actor;
  - occupied-cell lookup;
  - legal destination classification.
- expose pure helpers for:
  - create initial positioning from participant ids/cells;
  - read a participant cell;
  - move a participant if destination is legal;
  - reject outside-grid, occupied, blocked, and out-of-range destinations;
  - compute Manhattan distance or legal destinations if useful.

Non-goals:

- no Phaser rendering;
- no pointer/keyboard combat movement input;
- no path preview;
- no attack range enforcement yet;
- no initiative;
- no terrain cost or A*;
- no changes to damage, turn order, resources, presets, or enemy automation.

Acceptance:

- tests cover initial placement, movement success, occupied rejection, out-of-bounds rejection, blocked rejection if included, and out-of-range rejection;
- `src/combat/` remains free of Phaser/browser/terminal APIs and console output;
- `src/rules/` remains untouched or still pure if touched;
- typecheck/test/build pass.

### 3. Combat Session Positioning Integration v0

Goal:

Attach the pure positioning model to `CombatSession` so a combat session can expose positions and update them, without changing attack resolution yet.

Expected behavior:

- session creation seeds deterministic debug positions for the current 1v1 preset;
- restart resets positions;
- session exposes read helpers for combatant positions;
- movement helpers fail if combat is resolved or if the active actor is not allowed to move;
- existing CLI and Phaser combat actions remain behaviorally equivalent unless explicitly adapted to display position read models.

Non-goals:

- no final movement UI;
- no enemy pathfinding;
- no attack range enforcement;
- no combat map authoring pipeline.

### 4. Phaser Debug Combat Grid View v0

Goal:

Render combatant positions on the existing debug grid while combat mode is active.

Expected behavior:

- show player and opponent markers in their combat cells;
- keep exploration actor state distinct from combatant positions;
- render reachable movement destinations for the active combatant if practical;
- do not allow movement input yet unless milestone 5 is included.

Non-goals:

- no final art;
- no camera mode redesign;
- no new scene transition;
- no path animation unless it is trivial and debug-only.

### 5. Debug Combat Movement Input v0

Goal:

Let the player move the active combatant in combat mode using a minimal debug input path.

Candidate controls:

- click a legal destination to preview/select;
- confirm with a numeric key or immediate move on click, depending on implementation simplicity;
- block movement if not player turn, actor defeated, destination occupied/out of range/outside grid, or combat resolved.

Expected behavior:

- movement consumes a per-turn movement allowance or a simple once-per-turn movement flag;
- ending/restarting/returning clears combat movement preview state;
- opponent can remain stationary in this milestone.

Non-goals:

- no enemy pathfinding;
- no multi-step animation requirement;
- no opportunity attacks/reactions;
- no terrain cost.

### 6. Attack Range Enforcement v0

Goal:

Use combat positions to enforce a minimal range rule for basic attack and primary ability.

Expected behavior:

- adjacent/range-1 basic attack is blocked when the target is too far;
- ability range can initially match basic attack unless a small explicit debug range is introduced;
- blocked actions produce debug feedback and do not consume action/resources;
- combat session/rules boundary remains clear.

Non-goals:

- no cover;
- no line of sight;
- no multiple targets;
- no official rules reproduction.

### 7. Track Closeout v1

Goal:

Close the Combat Grid Movement track with a documented audit.

Acceptance:

- final doc records scope completed, architecture, files, validation snapshot, non-goals, and next tracks;
- boundary scans confirm pure layers remain clean.

## Boundary Rules

### Allowed in `src/combat/`

- pure combat positioning state;
- participant id to cell mapping;
- grid bounds and movement budgets;
- movement validation/read models;
- adapter-level integration with `CombatSession`;
- range checks that consume session/positioning state and return structured errors.

### Not allowed in `src/combat/`

- Phaser imports;
- browser APIs;
- terminal APIs;
- direct rendering;
- console output;
- pointer/keyboard input;
- presentation text beyond stable error codes.

### Not allowed in `src/rules/`

- grid positions;
- movement budgets;
- combat preset ids;
- combat trigger ids;
- random rolls;
- Phaser/browser/terminal dependencies;
- presentation text.

### Allowed in `src/movement/`

- reusable pure grid math if truly generic;
- existing `GridCell`, bounds, distance, and range helpers.

### Not allowed in `src/movement/`

- combat session imports;
- participant ids as combat concepts;
- encounter preset ids;
- Phaser/browser APIs;
- tactical attack rules.

### Allowed in `src/game/`

- Phaser rendering of combat positions;
- debug input routing;
- debug movement previews;
- visual movement feedback;
- calls into `src/combat/` movement APIs.

## Validation Checklist For Every Executor Delivery

Run or report why unavailable:

```bash
npm run typecheck
npm run test
npm run build
```

In this local Codex runtime, equivalent direct Node commands may be needed:

```text
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vitest\vitest.mjs run
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vite\bin\vite.js build
```

Boundary scans:

```text
src/rules: no Phaser, browser APIs, terminal APIs, Math.random, preset ids, combat trigger ids, grid positioning, movement budgets, or presentation text
src/combat: no Phaser, browser APIs, terminal APIs, direct rendering, console output, pointer/keyboard input
src/movement: no combat session imports, encounter preset ids, Phaser/browser APIs
src/exploration: no Phaser/browser/terminal APIs, no combat movement/rendering concepts
```

Manual validation grows by milestone. For the first pure model milestone, automated tests are enough.

## First Executor Prompt: Combat Positioning Model v0

Use this prompt for the first executor agent:

```text
You are implementing milestone 2, Combat Positioning Model v0, for the TypeScript/Vite/Vitest project at:
G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel

Read first:
- docs/COMBAT_GRID_MOVEMENT_DESIGN_CUT_V0.md
- docs/COMBAT_VISUAL_FEEDBACK_CLOSEOUT_V1.md
- docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md
- docs/TACTICAL_CORE_V0_CLOSEOUT.md
- docs/ARCHITECTURE.md
- src/combat/combatSession.ts
- src/combat/combatSession.test.ts
- src/movement/grid.ts
- src/movement/moveRange.ts
- src/exploration/orthogonalPathfinding.ts

Task:
Add a pure combat positioning model that can track participant grid cells and validate simple combat movement. This is a pure model milestone only. Do not wire it into Phaser and do not change attack behavior yet.

Expected scope:
- Add `src/combat/combatPositioning.ts` or an equivalent small module.
- Add focused tests under `src/combat/`.
- Define a typed positioning state/read model with:
  - participant id to `GridCell`;
  - grid bounds;
  - optional blocked cells if useful;
  - movement range/budget input for validation.
- Expose helpers for:
  - creating positioning state from initial placements;
  - reading participant positions;
  - checking occupied cells;
  - validating a destination;
  - moving a participant when legal;
  - returning structured rejection reasons for outside grid, unknown participant, occupied destination, blocked destination if supported, and out of range.
- Use existing pure grid types/helpers from `src/movement/grid.ts` where appropriate.

Guardrails:
- Do not import Phaser, browser APIs, terminal APIs, or console output in `src/combat/`.
- Do not modify `src/rules/` for this milestone.
- Do not change combat attack/damage/session behavior yet.
- Do not add Phaser rendering or input.
- Do not add enemy pathfinding, terrain costs, cover, line of sight, reactions, or official/protected content.
- Keep the API small and prototype-friendly.

Validation:
- Run typecheck, tests, and build.
- Run boundary scans:
  - `src/rules`: no Phaser/browser/terminal APIs, Math.random, preset ids, combat trigger ids, grid positioning, movement budgets, or presentation text.
  - `src/combat`: no Phaser/browser/terminal APIs, direct rendering, console output, pointer/keyboard input.
  - `src/movement`: no combat session imports, encounter preset ids, Phaser/browser APIs.
  - `src/exploration`: no Phaser/browser/terminal APIs, no combat movement/rendering concepts.

Report:
- files changed;
- API introduced;
- test cases covered;
- validation results;
- what remains for session integration and Phaser debug rendering.
```

## Orchestrator Review Checklist For Milestone 2

- Is the positioning model pure and under `src/combat/`?
- Does it reuse `GridCell`/bounds concepts without moving combat concepts into `src/movement/`?
- Are rejection reasons structured and test-covered?
- Does movement update return new state or otherwise avoid accidental mutation unless explicitly documented?
- Did the executor avoid changing attack/session behavior?
- Did validation include typecheck, tests, build, and boundary scans?
