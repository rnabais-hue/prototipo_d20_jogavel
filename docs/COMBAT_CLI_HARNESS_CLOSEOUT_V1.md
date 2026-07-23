# Combat CLI Harness Closeout v1

## Purpose

This document closes the **Combat CLI Harness** track for the custom d20-inspired tactical RPG prototype.

The harness now provides a command-line manual playtest loop for the pure tactical core. It remains an adapter: terminal I/O, display text, random rolls, manual roll input, fixed CLI presets, session resources, and lightweight enemy automation live outside `src/rules/`.

## Scope Completed

- Executable launcher: `abrir-combate-cli.cmd`.
- Package script: `combat:cli`.
- CLI command loop under `src/cli/`.
- 1v1 encounter initialization from pure combat fixture.
- Resolved CLI sheets with six attributes.
- Level and skill mapping for `Luta`:
  - attribute modifier;
  - half level rounded down;
  - trained bonus.
- Basic attack command with automatic d20 roll.
- Manual d20 input for deterministic playtest.
- CLI-owned random dice adapter with injectable random source.
- CLI-owned generic resource state displayed as `PM`.
- Simple player ability with PM cost.
- Simple opponent script for enemy turns.
- Ergonomic `done` command that advances the player turn and auto-runs the opponent.
- Restart/reset support.
- Combat end/outcome presentation helpers.
- Compact combat log formatting.
- Active actor action menu.
- Multiple named encounter presets.

## Current CLI Commands

- `help`: show commands.
- `status`: show active preset, turn, life, resources, sheet essentials, and outcome.
- `actions`: show available actions for the active actor.
- `act`: alias for `actions`.
- `encounters`: list encounter presets.
- `presets`: alias for `encounters`.
- `attack [roll]`: resolve a basic attack with automatic or explicit d20 roll.
- `ability [roll]`: spend PM and resolve the primary ability.
- `power`: alias for `ability`.
- `done`: end the active turn, then auto-run the opponent if it becomes active.
- `enemy`: run the fixed opponent script if it is the opponent turn.
- `auto`: alias for `enemy`.
- `end`: end only the active turn.
- `restart [id]`: restart current preset or switch to an encounter preset id.
- `reset [id]`: alias for `restart`.
- `quit` / `q`: exit the harness.

## Current Encounter Presets

- `training-duel`: baseline 1v1 harness encounter.
- `quick-check`: shorter 1v1 encounter for fast hit, damage, and victory checks.

Useful playtest flow:

```text
encounters
restart quick-check
actions
attack 20
done
ability 15
status
restart
quit
```

## Main CLI Files

- `abrir-combate-cli.cmd`
- `src/cli/combatCli.ts`
- `src/cli/combatCliPresets.ts`
- `src/cli/combatCliActions.ts`
- `src/cli/combatCliDice.ts`
- `src/cli/combatCliResources.ts`
- `src/cli/combatCliEnemyScript.ts`
- `src/cli/combatCliRollInput.ts`
- `src/cli/combatCliOutcome.ts`
- `src/cli/combatCliLog.ts`
- `src/cli/nodeCliTypes.d.ts`

## Milestone Documents

- `docs/COMBAT_CLI_HARNESS_DESIGN_CUT_V0.md`
- `docs/COMBAT_CLI_SKILL_LEVEL_MAPPING_V0.md`
- `docs/COMBAT_CLI_DICE_ADAPTER_V0.md`
- `docs/COMBAT_CLI_RESOURCE_PM_V0.md`
- `docs/COMBAT_CLI_SIMPLE_ABILITY_V0.md`
- `docs/COMBAT_CLI_SIMPLE_ENEMY_SCRIPT_V0.md`
- `docs/COMBAT_CLI_LOOP_ERGONOMICS_V0.md`
- `docs/COMBAT_CLI_MANUAL_ROLL_INPUT_V0.md`
- `docs/COMBAT_CLI_REPLAY_RESTART_V0.md`
- `docs/COMBAT_CLI_END_UX_V0.md`
- `docs/COMBAT_CLI_COMPACT_LOG_V0.md`
- `docs/COMBAT_CLI_PLAYER_ACTION_MENU_V0.md`
- `docs/COMBAT_CLI_ENCOUNTER_PRESET_SELECTION_V0.md`

## Architectural Guarantees

- The tactical core remains under `src/rules/` and remains pure.
- The CLI does not manually mutate encounter internals; it calls core functions and stores returned state.
- Random d20 rolls are generated only in CLI adapter code.
- Manual rolls are validated in CLI adapter code before the core is called.
- Resources/PM exist only in CLI session state.
- Ability cost handling exists only in CLI session state.
- Enemy automation exists only in CLI adapter code.
- Encounter preset ids exist only in CLI adapter/preset code.
- The CLI uses generic/original prototype names and does not encode protected official lore, text, stat blocks, or art.

## Explicitly Out Of Scope

- Browser or Phaser combat UI.
- Exploration-to-combat transition.
- Grid, movement, range, adjacency, terrain, or positioning.
- Initiative rolls.
- Critical hits or natural roll special handling.
- Reactions, triggers, or interrupts.
- Multiple targets or target selection.
- More than two combatants.
- Complex conditions.
- Healing.
- Persistent save/replay logs.
- Full character creation.
- Full progression rules.
- Loading encounter presets from external content files.
- Official content or faithful reproduction of protected rules text/setting material.

## Validation Snapshot

Last validated snapshot for this closeout:

- Typecheck: passing.
- Test suite: passing.
- Test count: 29 test files, 218 tests.
- Build: passing.
- Build note: Vite reports the known non-blocking chunk size warning for the Phaser-containing bundle.
- CLI smoke: `encounters` displays both presets.
- CLI smoke: `restart quick-check` switches to the short preset.
- Boundary scan: `src/rules/` clean for CLI, preset, terminal, random, and PM/resource concerns.

Expected project commands:

```bash
npm run typecheck
npm run test
npm run build
```

In the current local Codex runtime, global package commands may be unavailable. Equivalent validated commands used the bundled Node runtime directly:

```text
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vitest\vitest.mjs run
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vite\bin\vite.js build
```

## Recommended Next Tracks

Choose one next track explicitly before implementation.

### Combat Core Expansion

Good when the next goal is to make combat rules richer before UI integration.

Candidate scopes:

- initiative;
- critical or natural roll handling;
- conditions;
- healing;
- expanded action/effect data model;
- defensive stat derivation;
- core-level resource model only if it has a stable rule purpose.

### Exploration-to-Combat Integration

Good when the next goal is to connect existing movement/exploration prototypes to combat start/end.

Candidate scopes:

- trigger encounter from exploration state;
- pass selected encounter preset into combat adapter;
- return outcome to exploration;
- scene/state handoff contract;
- no Phaser combat UI unless separately scoped.

### Tactical Positioning Layer

Good when the next goal is grid combat rather than abstract 1v1 combat.

Candidate scopes:

- combatant positions;
- adjacency;
- range checks;
- movement budget;
- targeting constraints;
- terrain only if needed by the first tests.

## Next Collaboration Protocol

For the next track, use a clearer orchestrator/executor split:

- the orchestrator defines milestone scope, boundaries, acceptance criteria, and validation;
- the user dispatches executor agents for implementation;
- the orchestrator reviews executor output, integrates decisions, and maintains the track documents;
- direct orchestrator implementation should be limited to tiny unblockers, review fixes, or explicit user requests.

This should reduce context pressure and keep long-running tracks easier to audit.
