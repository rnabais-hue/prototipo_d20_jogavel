# Exploration-to-Combat Integration Design Cut v0

## Purpose

Start the **Exploration-to-Combat Integration** track for the custom d20-inspired tactical RPG prototype.

The goal is to connect the existing debug exploration/movement surface to the closed combat foundation without collapsing their responsibilities into one another. Exploration should be able to request combat, combat should run through a reusable session layer, and the game/debug presentation should orchestrate the handoff.

This track should use the orchestrator/executor split agreed after the Combat CLI Harness closeout:

- the orchestrator defines milestone scope, boundaries, acceptance criteria, and validation;
- executor agents implement bounded milestones;
- the orchestrator reviews deliveries and maintains track documents;
- direct orchestrator implementation is limited to tiny unblockers, review fixes, or explicit user requests.

## Source Contracts

Read first:

- `docs/EXPLORATION_DEBUG_BASELINE.md`
- `docs/COMBAT_CLI_HARNESS_CLOSEOUT_V1.md`
- `docs/TACTICAL_CORE_V0_CLOSEOUT.md`
- `docs/ARCHITECTURE.md`
- `src/game/scenes/PrototypeScene.ts`
- `src/exploration/interestPoint.ts`
- `src/game/debug/debugExplorationConfig.ts`
- `src/cli/combatCli.ts`
- `src/cli/combatCliPresets.ts`

Existing exploration/movement surface:

- `PrototypeScene` owns Phaser input and debug presentation.
- `DebugActorController` owns debug actor orchestration and uses pure exploration/movement helpers.
- `InterestPoint` currently supports `survey`, `switch`, and `exit_marker`.
- `handleInteract()` is the current point where an interaction result reaches the scene.
- Movement/pathfinding are pure under `src/movement/` and `src/exploration/`.

Existing combat surface:

- Pure tactical core lives under `src/rules/`.
- CLI combat harness lives under `src/cli/` and is an adapter.
- CLI presets define resolved combat sheets and named encounter presets.
- CLI session logic currently still sits mostly inside `combatCli.ts` and should be extracted before Phaser consumes combat.

## Architecture Direction

Preferred destination for this track:

```text
src/game/ PrototypeScene/debug presentation
  -> src/exploration/ pure exploration trigger/read models
  -> src/combat/ reusable combat session adapter/orchestration
  -> src/rules/ pure tactical core
```

The new `src/combat/` layer should be the reusable non-terminal combat orchestration layer. It may consume pure tactical rules and CLI-derived prototype presets if explicitly scoped, but it must not depend on `readline`, terminal prompts, Phaser, or browser APIs.

The CLI should eventually become a terminal adapter over the same combat session behavior, not the owner of reusable combat session logic.

## Track Milestones

### 1. Integration Design Cut v0

Status: this document.

Scope:

- define target architecture;
- define milestone sequence;
- define boundaries;
- provide first executor prompt.

Acceptance:

- design cut exists in `docs/`;
- no runtime code is required for this milestone;
- next executor can start without rediscovering the whole thread.

### 2. Combat Session Adapter Extraction v0

Goal:

Extract reusable combat session behavior from the CLI into `src/combat/` while keeping CLI behavior unchanged.

Expected implementation shape:

- add `src/combat/combatSession.ts` or similar;
- add focused tests under `src/combat/`;
- expose functions/types for:
  - create session from encounter preset id;
  - inspect active participant/sheets/resources/outcome;
  - resolve basic attack with automatic or explicit roll input supplied by caller;
  - resolve primary ability and resource spending;
  - advance turn / run simple opponent turn if explicitly requested;
  - restart current or selected preset.
- update `src/cli/combatCli.ts` to call the session adapter instead of owning all session rules.

Non-goals:

- no Phaser integration;
- no exploration trigger;
- no new combat rules;
- no final UI.

Acceptance:

- CLI output remains behaviorally equivalent for existing commands;
- tests cover session creation, attack, ability spending, restart preset switch, and outcome reads;
- `src/rules/` remains clean from CLI/random/PM/preset concerns;
- typecheck/test/build pass.

### 3. Exploration Combat Trigger Contract v0

Goal:

Allow pure exploration/debug interaction data to express a request to start combat.

Expected implementation shape:

- extend the interest-point model or add a small companion module with a combat trigger contract;
- add a debug combat trigger point in `debugExplorationConfig`;
- interaction with that point returns a structured result containing `encounterPresetId`, initially `quick-check`;
- keep the result pure and presentation-agnostic.

Non-goals:

- no actual combat session start in Phaser yet;
- no combat UI;
- no map transition;
- no encounter loading from files.

Acceptance:

- tests prove the combat trigger result carries the preset id;
- existing survey/switch/exit behavior still passes;
- debug HUD can at least format the trigger as an interaction result if the scene is touched;
- typecheck/test/build pass.

### 4. Prototype Combat Handoff v0

Goal:

When the debug player interacts with the combat trigger, `PrototypeScene` creates a combat session and enters a minimal debug combat mode.

Expected implementation shape:

- add a scene-level mode/read model such as `exploration` vs `combat`;
- in combat mode, movement clicks are blocked or ignored with clear debug feedback;
- HUD displays the active encounter preset, active combatant, life, resources, outcome, and available actions;
- no final art/UI, only debug HUD text is required.

Non-goals:

- no tactical grid combat UI;
- no animated combat;
- no targeting UI beyond fixed 1v1;
- no return-to-exploration flow yet.

Acceptance:

- manual test can move to trigger, press `F`, and see combat debug state;
- state is sourced from `src/combat/` session adapter;
- movement/exploration state is not mutated by combat start except scene mode;
- typecheck/test/build pass.

### 5. Debug Combat Input v0

Goal:

Let the user drive the minimal combat session from the Phaser debug scene.

Candidate controls:

- `A`: basic attack using automatic roll;
- `P`: primary ability using automatic roll;
- `D`: done/end player turn and auto-run opponent if appropriate;
- `ESC` or another explicit key: leave combat only after resolved, if return flow is ready.

Non-goals:

- no manual d20 text entry in Phaser;
- no menus;
- no mouse targeting;
- no final UI.

Acceptance:

- player can resolve at least one full player action and opponent response from the debug scene;
- HUD updates after each action;
- resolved outcome is visible;
- typecheck/test/build pass.

### 6. Combat Return Flow v0

Goal:

When combat resolves, return a result to exploration and mark the trigger as resolved/inspected in debug state.

Expected behavior:

- victory marks the combat trigger complete and returns to exploration mode;
- loss can remain a debug terminal state or return with a visible loss marker, depending on design choice;
- movement resumes only after explicit return.

Non-goals:

- no rewards;
- no XP/loot;
- no narrative branch;
- no scene transition.

Acceptance:

- manual debug flow starts from exploration, enters combat, resolves combat, and returns to exploration;
- trigger does not immediately retrigger unless explicitly reset or designed to be repeatable;
- state transition is documented and covered by focused tests where pure logic exists.

### 7. Track Closeout v1

Goal:

Close the integration track with an audit similar to prior closeouts.

Acceptance:

- final doc records scope completed, architecture, files, validation snapshot, non-goals, and next tracks;
- boundary scan confirms pure layers remain clean.

## Boundary Rules

### Allowed in `src/combat/`

- reusable combat session state and helpers;
- adapter-level resources if still prototype-only;
- encounter preset selection;
- mapping session results to read models;
- deterministic APIs that accept caller-supplied rolls or injected dice.

### Not allowed in `src/combat/`

- Phaser imports;
- `readline`;
- direct terminal output;
- browser APIs;
- scene/HUD rendering;
- official content/IP.

### Not allowed in `src/rules/`

- exploration triggers;
- combat preset ids;
- CLI/session resources;
- random rolls;
- terminal, browser, or Phaser dependencies;
- presentation text.

### Not allowed in `src/movement/`

- combat outcome logic;
- tactical attack rules;
- Phaser/browser dependencies;
- encounter preset ids.

### Allowed in `src/game/`

- debug scene mode orchestration;
- Phaser input bindings;
- HUD formatting;
- calling pure exploration/combat adapters;
- placeholder debug presentation.

## Validation Checklist For Every Executor Delivery

Run or report why unavailable:

```bash
npm run typecheck
npm run test
npm run build
```

In the local Codex runtime, equivalent direct Node commands may be needed:

```text
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vitest\vitest.mjs run
C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vite\bin\vite.js build
```

Boundary scan suggestions:

```text
src/rules: no readline, process.stdin, Phaser, window, document, Math.random, COMBAT_CLI, quick-check, training-duel, PM
src/movement: no Phaser, window, document, combat session, encounter preset ids
src/combat: no readline, process.stdin, process.stdout, Phaser, window, document
```

Manual validation grows by milestone. For the first Phaser handoff milestone, expected manual flow is:

1. Open `abrir-prototipo.cmd`.
2. Move the debug actor adjacent to the combat trigger.
3. Press `F`.
4. Confirm combat debug mode appears in the HUD.
5. Confirm exploration movement is blocked or paused while combat mode is active.

## First Executor Prompt: Combat Session Adapter Extraction v0

Use this prompt for the first executor agent:

```text
You are implementing milestone 2, Combat Session Adapter Extraction v0, for the TypeScript/Vite/Vitest project at:
G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel

Read first:
- docs/EXPLORATION_COMBAT_INTEGRATION_DESIGN_CUT_V0.md
- docs/COMBAT_CLI_HARNESS_CLOSEOUT_V1.md
- docs/TACTICAL_CORE_V0_CLOSEOUT.md
- src/cli/combatCli.ts
- src/cli/combatCliPresets.ts
- src/cli/combatCliResources.ts
- src/cli/combatCliDice.ts
- src/cli/combatCliEnemyScript.ts
- src/cli/combatCliOutcome.ts
- src/cli/combatCliLog.ts

Task:
Extract reusable non-terminal combat session behavior into src/combat/ while keeping the CLI commands behaviorally equivalent.

Expected scope:
- Add src/combat/combatSession.ts or an equivalent small module.
- Add focused tests under src/combat/.
- The session adapter should create a session from an encounter preset id, expose current sheets/resources/outcome, resolve basic attacks, resolve the primary ability, advance turns, run or support the current simple opponent action, and restart current or selected presets.
- Keep random/roll decisions caller-controlled or injectable. Do not call Math.random inside src/rules/.
- Update src/cli/combatCli.ts to use the adapter where practical.

Guardrails:
- Do not add Phaser/browser/readline/terminal output to src/combat/.
- Do not add CLI, PM, preset ids, random, or presentation concerns to src/rules/.
- Do not change combat rules behavior.
- Do not implement exploration or Phaser handoff in this milestone.
- Keep names generic/original and avoid official protected content.

Validation:
- Run typecheck, tests, and build using available project/runtime commands.
- Smoke the CLI enough to confirm at least status/attack/restart quick-check still work.
- Run a boundary scan for src/rules and src/combat.

Report:
- files changed;
- behavioral equivalence notes;
- validation results;
- any deferred seams for the next milestone.
```

## Orchestrator Review Checklist For Milestone 2

- Is reusable session logic now outside `src/cli/combatCli.ts`?
- Does `src/combat/` avoid terminal, readline, Phaser, and browser APIs?
- Does `src/rules/` remain untouched or still pure if touched?
- Does the CLI still support existing commands and aliases?
- Are roll inputs explicit/injected at the adapter boundary?
- Are resources still adapter/session concerns, not core rules?
- Do tests cover the extracted session behavior directly?
- Did validation include typecheck, test suite, build, CLI smoke, and boundary scans?
