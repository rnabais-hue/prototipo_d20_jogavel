# Content Pack (`src/content/`)

## 1. Responsibility
This directory is the **content pack**: typed data expressing one specific ruleset —
attribute keys, skill definitions, weapons, actions, abilities, resources and encounter
presets that the engine consumes by id. It is the only layer allowed to hold values
specific to a target system (`AGENTS.md` IP rule, decision 0047).

Content identifiers are open `string` values, never closed literal unions (decision 0048).
Which identifiers exist is declared here as data and checked at load time, so adding
content is a data edit and never an engine change.

## 2. Imports
- MAY import from `src/rules/` (pure helpers and the pack validator).
- MUST NEVER import from `src/game/`, `src/ui/`, `src/exploration/`, `src/movement/`,
  Phaser, or any browser API. The engine consumes this pack; this pack must not reach
  back into it.
- Known pending edge: `combatPresets.ts` still imports `getCombatWeaponRangeProfile` from
  `src/combat/combatWeaponRange.ts` because sheet-resolution logic still lives here. Moving
  that logic to the engine and cutting the edge is **task 06**, not this task.

## 3. Common tasks — edit data only, in `src/content/combatPresets.ts`
- **Add an attribute:** append its key to `COMBAT_ATTRIBUTE_KEYS`, then give every actor a
  value for it inside each `attributes: { ... }` block.
- **Add a skill:** append `{ id, displayName, attributeKey }` to `COMBAT_SKILL_DEFINITIONS`
  (its `attributeKey` must be a declared attribute key), then add `{ skillId, trained }` to
  each actor that trains it.
- **Add an ability:** append to an actor's `abilities: [ ... ]` an entry with `abilityId`,
  `label`, `cost: { resourceId, amount }` (the `resourceId` must exist in that actor's
  `resources`), and an `action` referencing an existing `weaponId` and `skillId`.
- Then run `pnpm test` (or `npm run test`). `validateCombatPack`
  (`src/rules/combatPackValidation.ts`) fails the load with a named reason if any
  referenced id is unknown or duplicated.

## 4. Representative example
`COMBAT_ACTORS.player` in `combatPresets.ts` is a full sheet: attributes, a resource, a
trained skill, three weapons, three actions and one ability. Copy its structure.

## 5. Requires a human decision, not an agent decision
- Introducing a new *concept* rather than a new instance — a new attribute axis, a new
  weapon range band, a new action `kind` — changes engine structure, not just data, and
  belongs in the engine.
- Any value that risks reproducing protected expression (real names, lore, verbatim rules
  text): the `AGENTS.md` IP rule governs and only the project owner may decide it.
- Reconciling this model with the parallel `tacticalCatalogs.ts` model: deferred to task 05.
