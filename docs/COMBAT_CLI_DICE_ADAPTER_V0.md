# Combat CLI Dice Adapter v0

## Purpose

Formalize dice rolling as CLI adapter infrastructure for the combat harness.

The tactical core continues to receive explicit roll numbers from callers. Randomness stays outside `src/rules/`.

## Scope

This milestone adds a small CLI dice module:

- `src/cli/combatCliDice.ts`

It provides:

- a `rollD20` helper that returns integer values from 1 through 20;
- an injectable random-source shape for deterministic tests;
- a `createCombatCliDice` adapter used by the CLI session.

## Boundary

Allowed in the CLI dice adapter:

- `Math.random` as the default random source;
- deterministic injected random functions in tests;
- d20 range mapping for CLI playtest rolls.

Still not allowed in `src/rules/`:

- randomness;
- CLI dependencies;
- terminal I/O;
- manual roll prompts;
- dice ownership or combat presentation concerns.

The combat core still resolves checks from caller-supplied `roll`, `modifier`, and target numbers.

## Current CLI Behavior

The `attack` command automatically rolls a d20 through the CLI dice adapter, then passes that numeric roll into the existing attack-plus-damage pipeline.

Attack output still shows:

- the d20 roll;
- the resolved action modifier;
- the target defense;
- hit or miss;
- damage events when applicable.

## Tests

Focused tests cover deterministic d20 range behavior:

- lower random boundary maps to 1;
- near-upper random boundary maps to 20;
- an injected random source is used by the adapter.

## Deferred

Manual roll entry remains deferred. It should be added only as CLI input validation and should still pass explicit roll numbers into the core.
