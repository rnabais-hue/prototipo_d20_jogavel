# Content Pack (`src/content/`)

## 1. Responsibility
This directory is the **content pack**: typed data expressing one specific ruleset. It
holds one reconciled model with two views of the same pack (decision 0055): the fixed
combat sheets, skills, actors, abilities, weapons, resources and encounters in
`combatPresets.ts`, and the extensible catalog structure — ancestries, archetypes,
attribute presets, features, equipment, and action definitions — in `tacticalCatalogs.ts`,
consumed by `buildTacticalParticipant`. Both share one attribute vocabulary. It is the only
layer allowed to hold values specific to a target system (`AGENTS.md` IP rule, decision 0047).

Content identifiers are open `string` values, never closed literal unions (decision 0048).
Which identifiers exist is declared here as data and checked at load time, so adding
content is a data edit and never an engine change.

## 2. Imports
- MAY import from `src/rules/` (pure helpers and the pack validator).
- MUST NEVER import from `src/combat/`, `src/game/`, `src/ui/`, `src/exploration/`,
  `src/movement/`, Phaser, or any browser API. The engine consumes this pack; this pack
  must not reach back into it.
- Within the pack the dependency is one-directional: `combatPresets.ts` reads the catalogs
  to validate them; `tacticalCatalogs.ts` never imports `combatPresets.ts`.
- Sheet resolution is engine work and lives in `src/combat/combatSheet.ts` (decision 0054).

## 3. Common tasks — edit data only
- **Add or modify an attribute:** append its key to `COMBAT_ATTRIBUTE_KEYS` in
  `combatPresets.ts` (the one canonical declaration), give every combat actor a value for it
  in each `attributes: { ... }` block, and give every complete attribute preset in
  `tacticalCatalogs.ts` a value for it too.
- **Add a skill:** append `{ id, displayName, attributeKey }` to `COMBAT_SKILL_DEFINITIONS`
  (its `attributeKey` must be a declared key), then add `{ skillId, trained }` to each actor.
- **Add a combat ability / actor / encounter:** edit the actor's `abilities`, the
  `COMBAT_ACTORS` map, or `COMBAT_ENCOUNTER_PRESETS` in `combatPresets.ts`.
- **Add an ancestry, archetype, feature, or equipment entry:** append to the matching array
  in `tacticalCatalogs.ts`. Attribute modifiers use declared keys; complete presets carry
  all declared keys.
- **Connect equipment to an action by id:** add the action id to the equipment entry's
  `grantedActionIds` in `tacticalCatalogs.ts`; the action must exist in `actions`.
- Then run `pnpm test` (or `npm run test`). The single load-time gate in `combatPresets.ts`
  calls `validateContentPack` (`src/rules/combatPackValidation.ts`) over both views and fails
  the load with a named reason if any referenced id is unknown, missing, or duplicated.

## 4. Representative example
`COMBAT_ACTORS.player` in `combatPresets.ts` is a full combat sheet. `mvpTacticalCatalogs` in
`tacticalCatalogs.ts` is a full catalog set wired ancestry → archetype → equipment → action.

## 5. Requires a human decision, not an agent decision
- Introducing a new *concept* rather than a new instance — a new attribute axis, a new
  weapon range band, a new action `kind` — changes engine structure, not just data.
- Any value that risks reproducing protected expression (real names, lore, verbatim rules
  text): the `AGENTS.md` IP rule governs and only the project owner may decide it.
