# Combat CLI Compact Log v0

## Purpose

Reduce repeated technical event lines in the CLI combat log while preserving the information needed for manual playtest.

This is presentation-only work in the CLI harness. The tactical core event model remains unchanged.

## Scope

The CLI now suppresses low-level events that are already represented by higher-level lines:

- `action_declared`
- `main_action_spent`
- `check_resolved`

The log still shows:

- action name;
- roll, modifier, skill, and target defense;
- hit or miss;
- damage applied;
- defeated participants;
- turn transitions;
- outcome.

## Boundary

Allowed in CLI:

- filtering event display;
- formatting event text;
- mapping participant ids to CLI names.

Still not allowed in `src/rules/`:

- presentation filters;
- terminal text;
- compact-log concerns.

## Deferred

- configurable verbose/compact modes;
- persistent battle logs;
- structured replay export.
