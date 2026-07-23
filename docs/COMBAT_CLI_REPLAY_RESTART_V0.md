# Combat CLI Replay/Restart v0

## Purpose

Make repeated manual playtests easier by allowing the fixed CLI encounter to restart without closing and reopening the terminal.

This is CLI harness ergonomics only. The pure tactical core remains unchanged.

## Scope

The CLI adds:

- `restart`: rebuild the fixed combat from the initial setup.
- `reset`: alias for `restart`.

Restart resets:

- tactical encounter state;
- participant life;
- active turn and round;
- current PM/resource values;
- CLI dice adapter instance.

## Boundary

Allowed in CLI:

- rebuilding the fixed fixture;
- resetting session-owned resource state;
- printing restart/status text.

Still not allowed in `src/rules/`:

- restart commands;
- CLI session state;
- terminal I/O;
- random/dice ownership.

## Deferred

- selecting encounters;
- save/load or replay logs;
- seeded deterministic sessions;
- multiple combat presets.
