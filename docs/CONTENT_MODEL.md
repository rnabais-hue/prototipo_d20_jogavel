# Content Model

This document defines content boundaries for the **custom d20-inspired tactical RPG prototype**.

## Content Principle

All content must be original, generic, or placeholder. The project must not contain official IP, official names, official lore, official text, official rules text, official stat blocks, official characters, official places, official factions, or official art.

## Current MVP Content

The current MVP has no gameplay content model beyond the internal project label.

No characters, enemies, powers, items, locations, factions, story, encounters, or lore are part of the current MVP.

## Future Content Direction

When content is requested later, prefer:

- Small typed data structures.
- Original internal IDs.
- Plain custom names created for this prototype.
- Data that can be validated independently from Phaser.

## Content Layer

`src/content/` is reserved for custom content data and related types. It should avoid Phaser dependencies and should not orchestrate gameplay.

## Relationship to Rules

Rules may consume content-shaped data through simple types, but `src/rules/` should remain pure and deterministic.

## Forbidden Content

Do not add:

- Official names.
- Official lore.
- Official rules text.
- Official setting text.
- Official art.
- Copied stat blocks.
- Direct adaptations of protected characters, places, factions, or setting elements.

Use generic placeholders until original project content is explicitly requested.
