# Narrative Architecture

This project is a **custom d20-inspired tactical RPG prototype**. Narrative systems are explicitly outside the current MVP.

## Current Status

`src/narrative/` exists as a reserved layer, but no narrative engine, story content, dialogue system, quest system, lore, or authored scenes are implemented.

## Narrative Boundary

Narrative must not be introduced incidentally while working on unrelated systems.

When narrative work is eventually requested, keep it separated from pure rules and from Phaser rendering. Narrative orchestration may live in `src/narrative/`, while rendering or interaction adapters belong in `src/game/` or `src/ui/`.

## Dependency Rule

`src/rules/` must not depend on `src/narrative/`.

Possible future dependency direction:

```text
src/narrative/ -> src/rules/, src/content/
src/game/      -> src/narrative/
src/ui/        -> src/narrative/
src/rules/     -> no narrative dependency
```

## IP Rule

Narrative content must be original. Do not add official IP, official names, official lore, official text, official setting material, official characters, official factions, or copied story material.

## Future Narrative Work

Before adding narrative features later, define:

- Scope.
- Data model.
- Ownership boundaries.
- Validation strategy.
- How content remains original and custom.

No narrative features are part of the current MVP.
