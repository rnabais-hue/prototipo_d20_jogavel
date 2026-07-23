# Combat CLI End UX v0

## Purpose

Make resolved combat easier to understand during CLI playtests.

The core outcome model remains unchanged. This milestone only improves CLI presentation by mapping team ids to visible participant names and printing restart guidance when combat ends.

## Scope

The CLI now formats outcomes using combat harness sheet data:

- `ongoing (Training Vanguard vs Practice Raider)`
- `resolved, winner: Training Vanguard`

When combat resolves, the CLI prints a summary:

```text
Combat resolved: Training Vanguard wins. Type restart to play again.
```

## Boundary

Allowed in CLI:

- mapping team ids to fixed harness participant names;
- printing end-of-combat guidance;
- summarizing `getEncounterOutcome` read models.

Still not allowed in `src/rules/`:

- display names for CLI winners;
- terminal text;
- encounter restart guidance;
- automatic victory events.

## Deferred

- detailed battle logs;
- round-by-round summaries;
- rewards or exploration return;
- persisted replay files.
