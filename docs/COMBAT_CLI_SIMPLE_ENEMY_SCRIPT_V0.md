# Combat CLI Simple Enemy Script v0

## Purpose

Add a tiny CLI-side enemy script so manual playtesting no longer requires the user to fully operate both sides of the 1v1 combat.

This remains harness behavior. The pure tactical core does not gain AI, automation, randomness, command handling, or target-selection rules.

## Scope

The CLI adds two commands:

- `enemy`: run the fixed opponent script when the opponent is the active participant.
- `auto`: alias for `enemy`.

The script is intentionally narrow:

1. It only runs if the encounter is ongoing.
2. It only runs if the active participant is the fixed opponent.
3. It resolves the opponent's basic attack against the player through the existing attack plus damage pipeline.
4. If the encounter is still ongoing, it ends the opponent turn and returns control to the next active participant.

## Boundary

Allowed in CLI:

- checking whether the active participant is the fixed opponent;
- choosing the fixed 1v1 player target;
- rolling through the CLI dice adapter;
- passing explicit roll, modifier, defense, damage, attacker, and target inputs to the core;
- ending the scripted enemy turn through the existing core turn function.

Still not allowed in `src/rules/`:

- enemy scripts;
- AI;
- random rolls;
- terminal commands;
- CLI resource or ability concerns.

## Deferred

- player-turn automation;
- tactical AI;
- target selection beyond fixed 1v1;
- ability use by enemies;
- initiative or grid-aware behavior.
