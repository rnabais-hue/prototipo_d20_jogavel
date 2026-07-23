# Combat CLI Player Action Menu v0

## Purpose

Make the CLI easier to play from the prompt by showing the currently active actor's available commands with their resolved combat data.

This is a presentation milestone for the CLI harness. It does not add new combat rules.

## Scope

The CLI now supports:

- `actions`;
- `act` as an alias;
- basic attack display with action name, skill modifier, damage base, and an explicit-roll example;
- ability display with cost, live PM availability, skill modifier, damage base, and an explicit-roll example;
- utility reminders for `done` and `status`.

Example player menu:

```text
Actions for Training Vanguard:
  attack [roll] - Practice Strike: Luta +5, damage base 4. Example: attack 15
  ability [roll] - Focused Drive: costs 2 PM (6/6 available), Luta +5, damage base 6. Example: ability 15
  done - end your turn, then auto-run the opponent if it becomes active.
  status - show current life, resources, sheet essentials, and outcome.
```

## Boundary

Allowed in CLI:

- formatting a human action menu;
- reading resolved CLI sheets;
- reading live CLI resources for display.

Still not allowed in `src/rules/`:

- terminal commands;
- player action menu concerns;
- PM/resource concepts;
- manual-roll examples.

## Deferred

- numbered action selection;
- target selection;
- multiple abilities;
- encounter preset-specific menus.
