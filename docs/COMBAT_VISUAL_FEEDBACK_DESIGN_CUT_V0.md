# Combat Visual Feedback Design Cut v0

## Purpose

Start the **Combat Visual Feedback v0** track for the custom d20-inspired tactical RPG prototype.

The goal is to improve readability of the existing debug combat loop in Phaser without changing combat rules, adding tactical movement, or turning the prototype overlay into final UI. This is a small presentation milestone on top of the closed exploration-to-combat integration flow.

Use the orchestrator/executor split:

- the orchestrator defines scope, boundaries, acceptance criteria, and review expectations;
- executor agents implement bounded visual feedback work;
- the orchestrator reviews deliveries and updates closeout documentation;
- direct orchestrator implementation is limited to tiny unblockers, review fixes, or explicit user requests.

## Source Contracts

Read first:

- `docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md`
- `docs/EXPLORATION_COMBAT_INTEGRATION_DESIGN_CUT_V0.md`
- `docs/EXPLORATION_DEBUG_BASELINE.md`
- `docs/COMBAT_CLI_HARNESS_CLOSEOUT_V1.md`
- `docs/TACTICAL_CORE_V0_CLOSEOUT.md`
- `docs/ARCHITECTURE.md`
- `src/game/scenes/PrototypeScene.ts`
- `src/game/debug/DebugActorController.ts`
- `src/game/debug/drawDebugActor.ts`
- `src/game/debug/drawDebugInterestPoints.ts`
- `src/game/debug/debugHud.ts`
- `src/combat/combatSession.ts`
- `src/cli/combatCliPresets.ts`

Current combat surface:

- `PrototypeScene` supports `mode: 'exploration' | 'combat'`.
- Interacting with `poi-combat-1` starts the `challenging-duel` combat session.
- Combat mode blocks exploration movement, `F` interaction, and camera movement.
- Numeric debug controls drive the fight:
  - `1`: attack/current action;
  - `2`: abilities submenu;
  - `3`: end turn, auto-run opponent, or return after victory;
  - `0`: back from abilities submenu;
  - `ESC`: return to exploration only after victory;
  - `R`: reset combat after defeat.
- The combat HUD and bottom console already expose action logs, outcome prompts, and HP state.

## Track Scope

Allowed visual feedback for v0:

- short-lived hit/miss/damage feedback near the abstract combatants or HUD/combat console;
- simple actor flash, tint, pulse, shake, or line/marker effects for attack resolution;
- clear distinction between player action feedback and opponent action feedback;
- defeat/victory/reset transient feedback;
- small helper/controller extraction under `src/game/debug/` if it keeps `PrototypeScene` from growing further;
- focused tests for pure formatting helpers if any are introduced.

Preferred implementation shape:

- keep Phaser-specific effects in `src/game/debug/`;
- keep combat result formatting either in a tiny game/debug formatter or local presentation helper;
- call visual feedback from existing combat input handlers after session results are returned;
- use existing combat session result objects instead of changing `src/combat/` contracts;
- make transient feedback self-clearing and ensure return-to-exploration/reset clears it.

Explicit non-goals:

- no Combat Grid Movement;
- no combatant repositioning, range, adjacency, cover, movement budget, or targeting UI;
- no changes to tactical rules, combat session behavior, damage math, turn order, encounter presets, or resource spending;
- no final UI redesign;
- no inventory, XP, loot, narrative branches, initiative, or new combat actions;
- no official/protected content, art, names, lore, or rules text.

## Boundary Rules

### Allowed in `src/game/`

- Phaser tweens, graphics, text, flashes, camera/screen feedback, and debug-only presentation controllers;
- formatting existing combat result data for on-screen debug readability;
- clearing transient visual state when combat resets or exits.

### Not allowed in `src/combat/`

- Phaser imports;
- browser APIs;
- terminal APIs;
- direct rendering;
- console output;
- visual feedback text or animation state.

### Not allowed in `src/rules/`

- Phaser, browser, terminal, random, preset ids, combat trigger ids, or presentation text;
- visual feedback concepts;
- any change to combat math for the sake of visuals.

### Not allowed in `src/movement/`

- combat session imports;
- preset ids;
- Phaser/browser APIs;
- combat visual feedback.

### Not allowed in `src/exploration/`

- Phaser/browser/terminal APIs;
- combat rendering or animation concepts.

## Acceptance Criteria

- Existing exploration-to-combat flow still works.
- Hit, miss, and damage are visibly distinguishable during player actions.
- Opponent actions produce visible feedback distinct from player actions.
- Victory return clears transient combat feedback.
- Defeat/reset feedback is visible and reset clears stale feedback.
- Combat mode remains abstract 1v1; no tactical movement starts.
- `PrototypeScene` does not absorb a large new visual subsystem inline; prefer small helpers/controllers in `src/game/debug/`.
- Typecheck, tests, and build pass.
- Boundary scans remain clean for `src/rules`, `src/combat`, `src/movement`, and `src/exploration`.

## Validation Checklist

Run:

```bash
npm run typecheck
npm run test
npm run build
```

If local global package commands are unavailable, use the bundled Node equivalents already recorded in prior closeouts.

Boundary scans:

```text
src/rules: no Phaser, browser APIs, terminal APIs, Math.random, preset ids, combat trigger ids, or presentation text
src/combat: no Phaser, browser APIs, terminal APIs, direct rendering, or console output
src/movement: no combat session imports, preset ids, Phaser/browser APIs
src/exploration: no Phaser/browser/terminal APIs
```

Manual validation:

1. Open `abrir-prototipo.cmd`.
2. Move adjacent to the combat trigger.
3. Press `F`.
4. Use combat input to observe hit/miss/damage feedback.
5. End turn and confirm opponent feedback.
6. Resolve victory and confirm return clears transient feedback.
7. If defeated, confirm defeat/reset feedback.

## Executor Prompt: Combat Visual Feedback v0

Use this prompt for the executor agent:

```text
You are implementing Combat Visual Feedback v0 for the TypeScript/Vite/Vitest project at:
G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel

Read first:
- docs/COMBAT_VISUAL_FEEDBACK_DESIGN_CUT_V0.md
- docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md
- docs/EXPLORATION_COMBAT_INTEGRATION_DESIGN_CUT_V0.md
- docs/EXPLORATION_DEBUG_BASELINE.md
- docs/COMBAT_CLI_HARNESS_CLOSEOUT_V1.md
- docs/TACTICAL_CORE_V0_CLOSEOUT.md
- docs/ARCHITECTURE.md
- src/game/scenes/PrototypeScene.ts
- src/game/debug/DebugActorController.ts
- src/game/debug/drawDebugActor.ts
- src/game/debug/drawDebugInterestPoints.ts
- src/game/debug/debugHud.ts
- src/combat/combatSession.ts
- src/cli/combatCliPresets.ts

Task:
Improve visual readability of the existing debug combat loop without changing combat rules, combat session behavior, or adding tactical movement.

Expected scope:
- Add transient debug visual feedback for player hit, miss, and damage results.
- Add transient debug visual feedback for opponent actions that is visually distinct from player action feedback.
- Add clear victory/defeat/reset feedback where useful.
- Clear transient feedback when combat returns to exploration and when combat resets.
- Prefer extracting small Phaser-specific helpers/controllers under src/game/debug/ instead of growing PrototypeScene substantially.
- Keep all feedback debug/prototype quality; do not build final UI.

Guardrails:
- Do not implement Combat Grid Movement.
- Do not add combatant movement, range checks, adjacency, cover, targeting UI, or map-positioned combat actions.
- Do not change src/rules combat math or tactical contracts.
- Do not change src/combat behavior except tiny type-only integration if absolutely necessary; presentation should consume existing session results.
- Do not add Phaser/browser/terminal dependencies to pure layers.
- Do not add official/protected content, art, lore, names, or rules text.

Validation:
- Run typecheck, tests, and build.
- Run boundary scans for src/rules, src/combat, src/movement, and src/exploration:
  - src/rules: no Phaser, browser APIs, terminal APIs, Math.random, preset ids, combat trigger ids, or presentation text.
  - src/combat: no Phaser, browser APIs, terminal APIs, direct rendering, or console output.
  - src/movement: no combat session imports, preset ids, Phaser/browser APIs.
  - src/exploration: no Phaser/browser/terminal APIs.
- Manually validate:
  1. Open abrir-prototipo.cmd.
  2. Move adjacent to combat trigger.
  3. Press F.
  4. Use combat input to observe hit/miss/damage feedback.
  5. End turn and confirm opponent feedback.
  6. Resolve victory and confirm return clears transient feedback.
  7. If defeated, confirm defeat/reset feedback.

Report:
- files changed;
- what feedback was added and where;
- confirmation that no combat movement/rules changes were made;
- validation results;
- any remaining visual readability debt for a future track.
```

## Orchestrator Review Checklist

- Did the implementation stay in `src/game/` / `src/game/debug/`?
- Did `src/combat/`, `src/rules/`, `src/movement/`, and `src/exploration/` remain within their boundaries?
- Are player hit/miss/damage results visually readable without relying only on the text log?
- Is opponent feedback distinct enough to follow the turn exchange?
- Do victory return and reset clear transient effects?
- Did the executor avoid Combat Grid Movement and final UI scope creep?
- Did validation include typecheck, tests, build, boundary scans, and manual flow notes?
