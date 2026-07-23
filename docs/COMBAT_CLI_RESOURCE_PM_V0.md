# Combat CLI Resource/PM v0

## Purpose

Add the first resource model to the command-line combat harness while keeping resources outside the pure tactical core.

This milestone is CLI adapter/runtime work. The resource is displayed as `PM` in the harness, but the implementation keeps the data generic through resource id, label, current value, and maximum value.

## Scope

The CLI resolved sheet now includes generic resources:

```text
id + label + current + maximum
```

The fixed 1v1 playtest presets initialize one resource for each participant:

- Training Vanguard: `PM 6/6`
- Practice Raider: `PM 4/4`

The CLI session owns current resource state separately from the tactical encounter. Status output reads current resource values from that session state.

## Runtime Helpers

`src/cli/combatCliResources.ts` owns small resource helpers for the harness:

- initialize resource state from resolved sheets;
- look up a participant resource;
- check whether a resource cost can be spent;
- spend a resource immutably, returning an insufficient-resource error when current value is too low.

These helpers are intentionally CLI-side only. They do not define tactical rules and are not imported by `src/rules/`.

## Current CLI Behavior

`status` shows life, PM, defeated state, and the existing resolved sheet essentials for both participants.

The later Simple Ability v0 milestone adds an `ability` command that spends PM from CLI session state before resolving through the existing attack plus damage pipeline. The `attack` command remains a basic attack and still passes explicit roll, modifier, defense, and damage values into the core.

## Boundary

Allowed in CLI:

- generic resource preset data;
- session-owned current resource values;
- CLI-only resource lookup and spend checks;
- display text such as `PM`.

Still not allowed in `src/rules/`:

- resources or PM state;
- resource costs;
- CLI runtime dependencies;
- randomness or terminal I/O.

## Tests

Focused CLI tests cover:

- resource state initializes current values from resolved sheet maximums;
- insufficient-resource checks fail without changing state.

## Deferred

- PM-spending ability commands;
- ability data and costs;
- resource recovery rules;
- moving resource rules into a future core domain model.
See also docs/COMBAT_CLI_SIMPLE_ABILITY_V0.md.
