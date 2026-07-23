# Combat CLI Skill and Level Mapping v0

## Purpose

Align the CLI harness vocabulary with the intended d20/T20-like playtest model before adding resources or abilities.

This milestone keeps the work in the CLI adapter. It does not move skill or character-sheet rules into `src/rules/` yet.

## Scope

The CLI resolved sheet now models:

- six attributes;
- character level;
- half-level modifier, rounded down;
- a generic melee skill displayed as `Luta`;
- trained skill bonus;
- basic attack check derived from a skill instead of a raw attack number.

## Attribute Keys

The CLI-side keys are:

- `strength`
- `dexterity`
- `constitution`
- `intelligence`
- `wisdom`
- `charisma`

These keys are local to `src/cli/` for now. The existing tactical core still has its earlier minimal participant attribute model and remains unchanged.

## Skill Calculation v0

A resolved skill modifier is calculated as:

```text
attribute modifier + floor(level / 2) + trained bonus
```

For the level 1 playable participant:

```text
Luta = strength 3 + floor(1 / 2) 0 + trained 2 = 5
```

The skill definition owns the attribute mapping:

```text
melee -> strength
```

The attack action points to the skill id. It does not hardcode `strength` directly.

## Boundary

Allowed in CLI:

- fixed prototype sheet data;
- resolving display sheet values;
- resolving skill totals for explicit core inputs;
- showing the calculation in terminal status text.

Still not allowed in CLI:

- official copied rule text;
- class/ancestry branching such as `if warrior`;
- special abilities;
- PM-spending abilities or resource rules beyond the later CLI-only Resource/PM v0 state model;
- initiative;
- grid or tactical position.

Still not allowed in `src/rules/` for this milestone:

- CLI dependencies;
- random rolls;
- terminal I/O;
- skill vocabulary or sheet presentation concerns.

## Resource/PM v0 Note

A later CLI adapter milestone adds generic resolved-sheet resources and session current values under `src/cli/`. That update does not change skill calculation, attack resolution, or the pure tactical core boundary.

## Validation Checklist

- `src/rules/` remains free of CLI/random dependencies.
- Attack uses the resolved action skill modifier.
- The resolved action modifier comes from the skill calculation.
- The skill calculation is covered by a focused CLI test.
- Typecheck, tests, build, and CLI smoke pass.
