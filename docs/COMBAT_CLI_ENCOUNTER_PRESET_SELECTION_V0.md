# Combat CLI Encounter Preset Selection v0

## Purpose

Let the CLI harness start from more than one named 1v1 encounter without hardcoding a single global resolved sheet list into the combat loop.

This keeps encounter selection in the CLI adapter. The tactical core remains preset-agnostic.

## Scope

The CLI now supports:

- `encounters` to list available presets;
- `presets` as an alias;
- `restart` to reset the current preset;
- `restart <id>` or `reset <id>` to switch presets and restart combat;
- active preset display in `status`.

Available presets:

- `training-duel`: baseline 1v1 harness encounter;
- `quick-check`: shorter 1v1 encounter for fast hit, damage, and victory checks.

## Boundary

Allowed in CLI:

- named encounter presets;
- resolving preset participants into CLI sheets;
- choosing which CLI sheets initialize the fixture;
- displaying the active preset.

Still not allowed in `src/rules/`:

- preset ids;
- terminal commands;
- CLI fixture selection;
- PM/resource display concerns.

## Usage

```text
encounters
restart quick-check
status
actions
```

## Deferred

- interactive preset picker;
- more than two combatants;
- target selection;
- loading encounter presets from data files;
- enemy scripts per preset beyond the current simple opponent turn.
