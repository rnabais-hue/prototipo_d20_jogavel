# MVP Scope

This document defines the closed scope for the initial MVP of the **custom d20-inspired tactical RPG prototype**.

The MVP should remain small. New features are out of scope until explicitly requested.

## Inside the Current MVP

The current MVP includes only:

- TypeScript project foundation.
- Vite app shell.
- Phaser dependency and a minimal scene that opens in the browser.
- Vitest setup with at least one simple unit test.
- Layer folder structure:
  - `src/rules/`
  - `src/content/`
  - `src/game/`
  - `src/exploration/`
  - `src/combat/`
  - `src/movement/`
  - `src/narrative/`
  - `src/ui/`
- Documentation for architecture, scope, workflow, content, narrative direction, rules, roadmap, and decisions.

## Outside the Current MVP

Do not implement these in the current MVP:

- Combat.
- Initiative.
- Damage.
- Conditions.
- Enemies.
- Player character systems.
- Movement.
- Click-to-move.
- Grid or tile interaction.
- Powers, abilities, spells, feats, classes, or ancestry systems.
- Inventory or equipment.
- Narrative engine.
- Dialogue system.
- Quest system.
- Lore, setting, factions, places, named characters, or worldbuilding.
- Save/load.
- Audio.
- Complex assets.
- Official IP, official names, official lore, official texts, official rules text, or official art.

## Scope Change Rule

A feature enters scope only when the user explicitly requests it. When adding a feature later, keep it narrow, document the decision, and preserve the architecture rule that `src/rules/` remains pure.

## Validation Commands

```bash
npm run test
npm run typecheck
npm run build
```
