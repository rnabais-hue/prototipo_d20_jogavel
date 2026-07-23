# Combat CLI Loop Ergonomics v0

## Purpose

Reduce repeated manual commands during 1v1 CLI playtest without adding combat rules to the core.

This milestone keeps loop automation in the CLI harness. The pure tactical core still only receives explicit commands and inputs.

## Scope

The CLI adds:

- `done`: ends the current turn and, if the fixed opponent becomes active, runs the simple enemy script automatically.

Existing commands remain:

- `attack`
- `ability`
- `enemy` / `auto`
- `end`
- `status`
- `help`
- `quit`

## Behavior

`done` is intended for the player turn:

1. End the current active turn through the existing core turn function.
2. If the encounter is no longer ongoing, print status and stop.
3. If the fixed opponent is now active, run the CLI enemy script.
4. The enemy script resolves the opponent basic attack and ends the opponent turn if the encounter is still ongoing.
5. Control returns to the player turn when possible.

`end` remains available as the lower-level command that only ends the current turn.

## Boundary

Allowed in CLI:

- command ergonomics;
- sequencing existing CLI commands;
- invoking the existing enemy script after turn end;
- terminal text.

Still not allowed in `src/rules/`:

- loop automation;
- enemy scripts;
- CLI commands;
- random rolls or terminal I/O.

## Deferred

- fully automatic player choices;
- multi-enemy automation;
- tactical AI;
- compact/combat-log display modes.
