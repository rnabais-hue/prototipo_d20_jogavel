# Combat CLI Manual Roll Input v0

## Purpose

Allow deterministic manual combat playtests without moving randomness or dice ownership into the pure tactical core.

Automatic rolling remains the default. Manual rolls are optional CLI inputs that become explicit roll numbers passed into the existing core pipeline.

## Scope

The CLI now accepts an optional d20 roll for player-controlled attack commands:

```text
attack 15
ability 7
power 7
```

The roll must be an integer from `1` through `20`.

If no roll is provided, the CLI uses the existing dice adapter:

```text
attack
ability
```

## Boundary

Allowed in CLI:

- parsing optional roll input;
- validating the roll range;
- printing a readable error for invalid values;
- passing the explicit roll into the existing attack plus damage pipeline.

Still not allowed in `src/rules/`:

- command parsing;
- manual roll prompts;
- random rolling;
- terminal I/O.

## Current Behavior

- `attack [roll]` uses the provided roll or auto-rolls if omitted.
- `ability [roll]` validates the roll before spending PM.
- Invalid manual rolls do not spend PM and do not change encounter state.
- `enemy`, `auto`, and `done` continue to use the automatic CLI dice adapter.

## Deferred

- a persistent manual-roll mode;
- prompts that ask for a roll after command entry;
- seeded RNG or replay logs.
