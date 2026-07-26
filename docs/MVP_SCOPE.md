# MVP Scope

This document defines the scope of the **custom d20-inspired tactical RPG prototype**: what the
MVP has absorbed, and what stays out until the project owner asks for it.

It is a current-state document. Together with `README.md` it is updated whenever a milestone is
closed, so that neither ever describes a project that no longer exists.

## Inside the Current MVP

Each item below is implemented, tested, and closed by the document named next to it. Where no
closeout is named, the source file is the reference.

### Foundation

- TypeScript project foundation, Vite app shell, Phaser scene, Vitest suite.
- Layer folder structure: `src/rules/`, `src/content/`, `src/game/`, `src/exploration/`,
  `src/combat/`, `src/movement/`, `src/cli/`, `src/narrative/`, `src/ui/`. The last two are
  still empty placeholders.
- Documentation for architecture, scope, workflow, content, narrative direction, rules, roadmap,
  and decisions.

### Movement and exploration

- Pure grid conversion, actor movement state, Manhattan move range and straight path preview
  (`src/movement/`).
- Grid interaction and click-to-move over orthogonal pathfinding, with path preview and blocked
  path feedback (`src/exploration/orthogonalPathfinding.ts`,
  `src/game/scenes/PrototypeScene.ts`).
- Exploration map with static blocked cells and switch-controlled blockers
  (`src/exploration/explorationMap.ts`, `src/exploration/switchControlledMap.ts`).
- Interest points — survey, switch, exit marker, combat trigger — with pure interaction results,
  a switch-gated exit, and a local objective read model (`src/exploration/interestPoint.ts`,
  `src/rules/exitActivation.ts`, `src/rules/localObjective.ts`).
  Baseline: `docs/EXPLORATION_DEBUG_BASELINE.md`.

### Combat

- Combat as a whole: encounters, turn flow, action declaration, checks, basic attacks, damage,
  defeat and outcome, all pure in `src/rules/`.
  Closeout: `docs/TACTICAL_CORE_V0_CLOSEOUT.md`.
- Turn order supplied by the caller, with defeated participants skipped
  (decisions 0029, 0035, 0036). Rolled initiative is still out of scope.
- Damage application and simple defeat as encounter state (decisions 0033, 0034).
- Enemies: a scripted opponent that acts automatically on its turn
  (`src/combat/enemyScript.ts`).
- Tactical grid positioning, per-turn movement allowance and weapon range bands.
  Closeout: `docs/COMBAT_GRID_MOVEMENT_CLOSEOUT_V1.md`.
- A single playable sheet with attributes, a trained skill, weapons, actions, one ability and a
  spendable resource pool, expressed as content data (`src/content/combatPresets.ts`,
  `src/combat/combatResources.ts`).
- Exploration-to-combat integration inside one Phaser scene, with a numeric action menu, combat
  log console, return on victory and restart on defeat.
  Closeout: `docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md`.
- Terminal harness for manual combat playtesting (`npm run combat:cli`).
  Closeout: `docs/COMBAT_CLI_HARNESS_CLOSEOUT_V1.md`.

### Presentation

- Combat visual feedback: HP bars, floating text, hit flashes, turn indicator, outcome banners.
  Closeout: `docs/COMBAT_VISUAL_FEEDBACK_CLOSEOUT_V1.md`.
- Asset catalog with code-native fallbacks, actor animations, motion queue, responsive layout,
  and a normal / debug presentation toggle.
  Closeout: `docs/PLAYABLE_PRESENTATION_CLOSEOUT_V1.md`.
- Combat-only modular pixel-art vertical slice at 640x360: integer-scaled rendering, a 16x16
  Tiled arena, synchronized body/main-hand animation layers, per-cell movement timing, and one
  profile-data weapon swap. Exploration presentation is unchanged.
  Closeout: `docs/COMBAT_VISUAL_DIRECTION_VERTICAL_SLICE_CLOSEOUT_V1.md`.

## Outside the Current MVP

Do not implement these unless the user explicitly asks:

- Rolled initiative and initiative order as a rule.
- Conditions, status effects, buffs and debuffs.
- Character creation, progression, levelling, or more than the single playable sheet.
- Classes, ancestries, feats, spell lists, or a general power system beyond the existing single
  ability with a resource cost.
- Inventory and equipment management. Weapons exist only as fixed content data on a sheet.
- Encounters or maps beyond the debug exploration map and the existing presets; no level or
  encounter authoring pipeline.
- Narrative engine, dialogue system, quest system.
- Save/load.
- Audio.
- Production-complete art, a general equipment system, and a paper-doll editor. The current
  combat art is a narrow CC0 vertical slice only.
- Lore, setting, factions, places, named characters, or worldbuilding.
- Official IP, official names, official lore, official texts, official rules text, or official
  art, under the rule in `AGENTS.md`.

## Scope Change Rule

A feature enters scope only when the user explicitly requests it. When adding a feature later,
keep it narrow, record the decision in `docs/DECISIONS.md`, preserve the architecture rule that
`src/rules/` remains pure, and move the feature from the list above into "Inside the Current
MVP" in the same piece of work.

## Validation Commands

```bash
npm run test
npm run typecheck
npm run build
```
