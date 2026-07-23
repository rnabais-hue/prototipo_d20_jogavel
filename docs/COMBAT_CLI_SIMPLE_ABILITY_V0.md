# Combat CLI Simple Ability v0

## Purpose

Add the first PM-spending ability to the command-line combat harness while keeping ability content, resources, dice, and command handling outside the pure tactical core.

This is a CLI adapter/content milestone. The core still receives explicit roll, modifier, defense, damage, action id, attacker id, and target id inputs.

## Scope

The fixed playable participant, Training Vanguard, now has one original generic ability:

- `Focused Drive`
- cost: `2 PM`
- check: the existing resolved melee skill data displayed as `Luta`
- damage: fixed CLI-side resolved damage base `6`

The fixed opponent has no CLI ability in this milestone.

## CLI Command

The harness adds:

- `ability`: spend PM, roll a d20, and resolve the active participant ability.
- `power`: alias for `ability`.

Existing commands remain available:

- `help`
- `status`
- `attack`
- `end`
- `quit`

`help` lists the new command. `status` shows the ability line for participants that have an ability and continues to show current/max PM.

## Runtime Behavior

When `ability` is used:

1. The CLI confirms the encounter is ongoing and finds the active participant and target.
2. The CLI finds the active participant's first CLI ability.
3. The CLI checks that the active participant still has a main action.
4. The CLI attempts to spend the ability cost from session-owned resource state.
5. If PM is insufficient, the CLI prints a readable error and does not change encounter or resource state.
6. If PM is available, PM is spent for the use and the normal core attack plus damage pipeline resolves the roll.
7. PM remains spent whether the attack hits or misses.
8. On success, `status` reflects the updated PM value.

The PM-on-use behavior is intentional for v0: the adapter spends the cost for the attempt before the attack result is known, keeping the command predictable and avoiding special refund rules.

## Boundary

Allowed in CLI:

- original ability preset data;
- PM cost data;
- session-owned resource spending;
- command text and aliases;
- dice rolling;
- choosing the fixed 1v1 target;
- mapping the resolved ability action into explicit core inputs.

Still not allowed in `src/rules/`:

- resources or PM;
- abilities or ability costs;
- CLI commands;
- randomness;
- terminal I/O;
- official copied content, names, lore, or rules text.

## Validation Checklist

- Ability data lives in `src/cli/`.
- Resource spend uses `spendCombatCliResource`.
- Insufficient PM leaves resource and encounter state unchanged.
- Core receives explicit roll/modifier/defense/damage values.
- Typecheck, tests, build, and a CLI smoke test pass.