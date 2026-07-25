# Decisions

This log records architectural and project decisions for the **custom d20-inspired tactical RPG prototype**.

## 0001: Keep Rules Pure

Decision: `src/rules/` must not depend on Phaser, `src/game/`, `src/ui/`, `src/narrative/`, or browser-only APIs.

Reason: Pure rules are easier to test, reason about, and reuse across presentation layers.

## 0002: Keep MVP Scope Closed

Decision: The initial MVP is limited to the technical foundation, folder structure, minimal Phaser scene, Vitest setup, and documentation.

Reason: The project should grow in small, controlled steps and avoid accidental implementation of combat, movement, narrative, powers, or content systems.

## 0003: No Official IP

Decision: The project must not include official IP, official names, official lore, official texts, official rules text, official stat blocks, official characters, official places, official factions, or official art.

Reason: The prototype is custom and private, and should avoid depending on protected creative material.

## 0004: Phaser Belongs Outside Rules

Decision: Phaser-specific code belongs in `src/game/` or presentation adapters, not in `src/rules/`.

Reason: This preserves the direction of dependency and keeps rules testable in Vitest without browser or engine setup.

## 0005: Validate With Test, Typecheck, Build

Decision: Standard validation commands are:

```bash
npm run test
npm run typecheck
npm run build
```

Reason: These commands cover unit tests, TypeScript correctness, and production bundling.

## 0006: Start Movement With a Pure Invisible Grid

Decision: The initial movement foundation is a rectangular grid with square configurable cells, origin at pixel `0,0`, `worldToGrid` using `floor`, `gridToWorld` returning cell centers, and bounds validated in cell units.

Reason: This keeps movement math deterministic, testable, and independent from Phaser or visual gameplay features.

## 0007: Phaser Can Visualize the Grid

Decision: Phaser scenes may render debug grid visuals, but grid math stays in `src/movement/` and remains independent from Phaser.

Reason: The game layer can prove and inspect the technical foundation without moving deterministic movement calculations into presentation code.

## 0008: Clicked Grid Cells Are Debug Input Only

Decision: Phaser may listen for pointer clicks on the debug grid and visualize the clicked cell, but this input remains a scene-level debug tool and does not create movement, pathfinding, collision, or gameplay commands.

Reason: This keeps the grid foundation inspectable while preserving the MVP boundary and keeping deterministic grid math in pure movement code.

## 0009: Static Actor Placeholders Use Grid Cells

Decision: Phaser scenes may draw static actor placeholders positioned from fixed grid cells with `gridToWorld`, but actor state, movement, and gameplay entities do not exist yet.

Reason: This allows visual alignment checks on the debug grid without introducing movement, click-to-move, combat, or player character systems.

## 0010: Debug Rendering Lives Under Game Debug

Decision: Debug rendering helpers live under `src/game/debug/`, while movement math stays in `src/movement/`.

Reason: This keeps BootScene focused on scene orchestration without moving Phaser rendering concerns into the pure movement layer.

## 0011: Actor State Starts as Pure Movement State

Decision: Minimal actor state starts in `src/movement/` with an id, current grid cell, and only idle/moving movement statuses, without Phaser or visual integration.

Reason: The current actor model is positional movement state only, so it should remain pure and testable before any scene, animation, combat, or RPG character concepts are added.

## 0012: Actor Movement Intent Is Pure State

Decision: Starting actor movement is represented as a pure state transition from `idle` to `moving` with a `targetCell`, without visual movement, animation, pathfinding, or current-cell updates.

Reason: Movement intent can be tested independently before introducing Phaser presentation behavior or later movement execution systems.

## 0013: Debug Clicks Create Movement Intent Only

Decision: BootScene may keep an internal debug ActorState and pass valid clicked cells to the pure startActorMove transition, while the visual actor remains static at its debug start cell.

Reason: This connects Phaser input to pure movement intent without introducing visual movement, interpolation, arrival logic, pathfinding, or engine-specific movement state.

## 0014: Actor Movement Completion Is Pure State

Decision: Completing actor movement is represented by `completeActorMove`, a pure state transition from `moving` to `idle` that copies `targetCell` into `currentCell` and removes `targetCell` from the final idle state.

Reason: Logical arrival can be tested independently of Phaser, animation, pathfinding, timers, speed, collision, rendering, or visual actor movement. Visual movement and arrival presentation remain separate future game-layer work.

## 0015: Debug Completion May Snap the Actor Placeholder

Decision: BootScene may expose a debug input that calls `completeActorMove` and immediately redraws the actor placeholder at the completed `currentCell`.

Reason: This makes the pure completion state inspectable in Phaser while remaining distinct from animation, interpolation, timers, speed, pathfinding, collision, or real movement presentation. Smooth visual movement remains future game-layer work.

## 0016: Debug Actor Orchestration Lives in Game Debug

Decision: Debug actor state/render orchestration may live in a `src/game/debug` controller that owns Phaser debug views and delegates movement transitions to pure `src/movement` functions.

Reason: BootScene should stay focused on scene setup and input routing, while debug presentation state remains outside pure movement. `src/movement` continues to contain deterministic ActorState transitions without Phaser.

## 0017: Debug Visual Interpolation Stays in Game Debug

Decision: Linear debug visual interpolation of the actor placeholder lives in `src/game/debug/` and does not replace or mutate the pure movement state in `src/movement/`.

Reason: The placeholder can demonstrate visual travel from `currentCell` to `targetCell` while `ActorState` remains the logical source of truth. Logical completion still belongs to `completeActorMove`, currently triggered manually with Space in the debug scene.

## 0018: Debug Visual Arrival May Complete Pure Movement

Decision: The debug actor interpolation tween may call `completeActorMove` when visual movement finishes, then clear debug target presentation and notify the scene to refresh debug text.

Reason: This removes the temporary mismatch where the placeholder had visually arrived but the pure `ActorState` still reported `moving`, while keeping logical completion in `src/movement/` and visual timing in `src/game/debug/`.

## 0019: Debug Blocked Move Feedback Is Presentation Only

Decision: Debug click handling may report whether a valid move command was accepted or blocked, while the pure `startActorMove` rule remains responsible for rejecting movement commands during `moving`.

Reason: The scene should make blocked debug input explicit without adding command queues, changing targets during movement, restarting visual interpolation, or moving presentation concerns into `src/movement/`.

## 0020: Milestone 1B Uses a Prototype Exploration Scene

Decision: The first placeholder exploration surface uses `PrototypeScene` with its grid and actor constants in `src/game/debug/debugExplorationConfig.ts`.

Reason: The scene is still a hybrid prototype/debug surface rather than a full exploration scene, and the configuration belongs with Phaser debug presentation rather than pure `src/movement/` code.

## 0021: Simple Blocked Cells Stay Pure

Decision: Placeholder exploration blocked cells are represented by a pure `src/exploration/ExplorationMap` shape with `blockedCells`, `isCellBlocked`, and `isCellWalkable`, while Phaser only renders and routes debug input.

Reason: The prototype needs blocked destination feedback without pathfinding, collision, terrain costs, adjacency, or presentation concerns leaking into pure movement/exploration code.

## 0022: Debug Movement Range Is Pure Manhattan Distance

Decision: The milestone 2A movement range rule lives in `src/movement/` as pure Manhattan distance helpers, while the fixed debug range value and visualization live under `src/game/debug/`.

Reason: The prototype needs inspectable movement reach without introducing pathfinding, terrain costs, route collision, turns, combat, or Phaser dependencies in pure movement code.

## 0023: Valid Movement Destinations Are Destination Checks Only

Decision: Milestone 2B valid movement destinations live in pure `src/exploration/` and combine map bounds, walkability, and pure Manhattan range checks.

Reason: The prototype needs a reusable destination validator and debug visualization without introducing pathfinding, route connectivity, terrain costs, obstacle traversal, turns, combat, or Phaser dependencies in pure code.

## 0024: Movement Destination Failure Reasons Are Centralized

Decision: Movement destination classification is centralized in pure `getMoveDestinationStatus` under `src/exploration/`, returning a discriminated status for valid, outside-grid, blocked, and out-of-range destinations.

Reason: The scene should translate pure destination status into debug presentation messages without duplicating movement-destination rule ordering or reimplementing blocked/range checks in Phaser code.

## 0025: Straight Path Preview Is Not Pathfinding

Decision: Milestone 2D adds pure `getStraightManhattanPath` under `src/movement/` for debug preview only. It walks X first, then Y, excludes the origin, includes the destination, and does not inspect blocked cells, range, connectivity, or terrain.

Reason: Reviewers need to see a deterministic movement-line preview in the prototype without accidentally introducing real routing, obstacle avoidance, path costs, or movement validation into the MVP.

## 0026: Exploration Debug Baseline Is Closed

Decision: The exploration debug baseline is closed and stable as a documented prototype surface.

Reason: The project now has enough debug exploration behavior for review and handoff, while future systems such as pathfinding, collision, real exploration, turns, combat, entities, and real UI remain outside the current scope.

## 0027: Exit Marker Progression Stays Pure and Local

Decision: The debug `exit_marker` activation requirement lives in a pure rule helper keyed by exit id, and the current prototype only supports a tiny local dependency on a linked `switch` being on.

Reason: The prototype gets a minimal progression gate that can be tested and surfaced in Phaser without introducing a general quest system, scene-specific special cases, map transitions, or non-local progression architecture.

## 0028: Tactical Participants Start From Extensible Catalogs

Decision: Minimal tactical participant assembly uses extensible catalogs in `src/content/` and pure types/helpers in `src/rules/`. The MVP may contain one entry per catalog, but the core must not hardcode a specific ancestry, archetype, feature, action, or equipment id.

Reason: Catalog-driven assembly keeps the first data model small while allowing original project content to replace or expand the MVP entries without changing core rule branches.

## 0029: Combat State Core v0 Uses Supplied Turn Order

Decision: Combat State Core v0 is pure state in `src/rules/` with a caller-supplied turn order, an abstract encounter without grid, movement, attacks, damage, or rolled initiative, and structured encounter/turn events.

Reason: The first combat state slice should prove encounter and turn flow without coupling to later resolution, positioning, UI, exploration, or presentation systems.

## 0030: Action Declaration v0 Only Spends Main Action

Decision: Action Declaration v0 only declares an available participant action and consumes the active turn's main action. It does not resolve attacks, damage, healing, rolls, targets, costs, resources, movement, reactions, or action effects. Available actions come from participant data through `TacticalParticipant.actionIds`.

Reason: The first action command should prove pure command validation, state transition, and structured events without introducing combat resolution or presentation coupling.

## 0031: Checks v0 Use Explicit Rolls

Decision: Generic check resolution receives the roll as input, adds structured integer modifiers, compares the total against an integer target, and returns a small structured result and event.

Reason: Checks must be deterministic and testable with no internal randomness. Criticals, natural roll handling, margins, degrees of success, attacks, damage, healing, and effect resolution remain outside checks v0.

## 0032: Basic Attack v0 Uses Explicit Checks

Decision: Basic Attack v0 resolves an offensive declared action through the generic check core using caller-supplied roll, defense, and structured modifiers. Hit or miss is returned as structured data and events, but no damage, life changes, defeat, criticals, margins, or internal randomness are applied.

Reason: The first attack flow should prove deterministic offensive resolution and event ordering while keeping combat effects and richer tactical rules outside this slice.

## 0033: Life And Defeat v0 Live In Encounter State

Decision: Runtime life and simple defeat live on `EncounterParticipant` as encounter state. Pure damage is applied through a separate `applyDamage` command that emits structured `damage_applied` and `participant_defeated` events.

Reason: Life changes are runtime combat state, not catalog/base participant data. Basic Attack v0 still resolves hit or miss only and does not apply damage automatically.


## 0034: Attack Damage Pipeline Is A Separate Command

Decision: Basic attack plus damage is resolved by a separate pure command that composes `resolveBasicAttack` and `applyDamage`. The isolated basic attack command continues to return only hit or miss without changing life. Damage is applied only on hit, never on miss, and invalid damage fails before the main action is consumed.

Reason: Keeping the composed attack-damage flow explicit preserves deterministic event ordering while avoiding automatic damage side effects in the basic attack rule.
## 0035: Defeated Participants Stay In Turn Order

Decision: Defeated participants remain in encounter state and in the original turn order, but they cannot declare actions and turn advancement skips them with structured `turn_skipped` events.

Reason: The turn order stays stable and predictable while defeated participants stop acting. Encounter end and victory logic remain reserved for a future milestone.

## 0036: Encounter Creation Starts On First Active Participant

Decision: Tactical encounter v0 starts on the first non-defeated participant found in the supplied turn order. Initial defeated participants remain in the original turn order and may emit `turn_skipped` events before the first `turn_started`. If every participant in the turn order is defeated, encounter creation returns `no_active_participants` as an invalid start state.

Reason: Encounter creation should not produce an active turn for a defeated participant, while still preserving stable turn order and leaving victory or encounter-end logic outside this scope.

## 0037: Encounter Outcome Is A Pure Read Model

Decision: Tactical encounter v0 exposes pure outcome helpers that group non-defeated participants by `teamId`. Multiple active teams mean `ongoing`, one active team means `resolved` with a `winningTeamId`, and zero active participants means `no_active_participants`.

Reason: Survival-by-team outcome is useful for callers without adding automatic encounter end, victory events, UI, exploration transitions, rewards, or special objective logic to the pure combat flow.

## 0038: Combat Fixtures Are Pure Test Helpers

Decision: Minimal combat fixtures may live in pure rules test support code to assemble generic prototype encounters from catalogs, participants, teams, life, actions, and supplied turn order.

Reason: Fixtures are helpers for tests and prototypes only. They are not game rules, do not represent official content, and must not introduce combat flow, UI, Phaser integration, exploration integration, grid, movement, or protected IP.

## 0039: Combat Smoke Flow Is A Pure Contract Test

Decision: The minimal combat smoke flow is a pure integrated test that composes existing fixture, attack-damage, turn, and outcome helpers with explicit rolls and damage.

Reason: The smoke flow proves the v0 tactical contract without adding rules, replacing a future visual harness, introducing UI or Phaser integration, adding exploration coupling, or depending on official content.

## 0040: Pure Tactical Core v0 Is Closed

Decision: Pure Tactical Core v0 is closed as a testable rules core documented in `docs/TACTICAL_CORE_V0_CLOSEOUT.md`.

Reason: The project now has a deterministic abstract tactical foundation for participants, encounters, turns, checks, basic attacks, damage, defeat, outcomes, fixtures, and an integrated smoke flow without adding UI, Phaser integration, exploration coupling, grid movement, automatic encounter-end orchestration, or official content.

## 0041: Exploration Combat Trigger Contract v0 Is Pure

Decision: The exploration combat trigger point kind (`combat_trigger`) and its interaction result (`combat_triggered`) return a simple, structured encounter preset ID. The transition logic remains pure, deterministic, and free of presentation or execution side effects (like directly starting Phaser scenes, opening dialogs, or loading assets).

Reason: Keeping the transition contract pure ensures it is fully testable under Vitest, decoupled from Phaser, and easily integrated into any presentational layer or scene manager.

Review Note: Currently, `encounterPresetId` is defined as an optional field on `InterestPoint`. If the contract grows, we should refactor `InterestPoint` into a discriminated union by `kind` to enforce that `encounterPresetId` is only present/required when `kind` is `'combat_trigger'`.

## 0042: Phaser Scene Combat Mode Transition, Debug Hotkeys Removal, and HUD Layout

Decision: PrototypeScene supports a `mode` field ('exploration' | 'combat') and a `combatSession` field. Entering combat mode clears path previews, highlights the active participant's cell, and switches the debug HUD layout to display combat information. All exploration interactions (including grid movement pointer clicks, complete actions, and keyboard 'F' / interact triggers) are blocked in combat mode with clear HUD feedback ('status: blocked (combat mode)' and 'status: interaction blocked (combat mode)'). The manual debug hotkeys 'C' and 'E' have been removed, making the transition to combat purely triggered by gameplay events (like a `combat_triggered` interaction effect).

Reason: This keeps the gameplay flow clean and prevents visual/state inconsistency where exploration actions could be triggered while a combat encounter is active, ensuring that combat is enterable only through designated in-game triggers.

## 0043: Combat Debug Input, Freezing Camera, and Opponent Turn Loop v0

Decision: PrototypeScene registers keydown listeners for key `A` (basic attack), `P` (primary ability), and `D` (end turn). The camera panning update is disabled in `update()` when the scene is in combat mode. Advancing the player's turn with key `D` checks if the next active participant is the opponent, and if so, automatically triggers the opponent's action decision and resolution, updating the HUD with combat results or final resolution state (victory/defeat/no active participants) upon termination.

Reason: This provides a simple key-based debugging loop for testing combat mechanics in the visual scene, keeps the viewport focused on the action by locking the camera in combat mode, and automates enemy execution steps so the player only needs to control their own turn inputs.

## 0044: Combat Return and Reset Flows

Decision: PrototypeScene supports returning to exploration mode or resetting the combat session via keyboard inputs. Key `ESC` (keydown-ESC) triggers a return to exploration if the combat session is resolved as a Victory (winning team matches the player's team). Key `R` (keydown-R) triggers a combat session restart if the combat session is resolved as a Defeat (winning team does not match the player's team). Furthermore, key `D` (keydown-D) ends the player's turn but checks if victory was already resolved; if so, it automatically returns to exploration. The HUD displays helper prompts to return to exploration or restart combat depending on the resolution outcome.

Reason: This integrates the combat return and reset flows into the prototype scene, making the gameplay loop self-contained and easily testable without manual scene restarts or hotkey manipulation.

## 0045: Combat UI Refactoring and Action Console Log

Decision: Refactored the combat user interface in `PrototypeScene` to use a dedicated visual Combat Log Console panel at the bottom center (X: 120, Y: height - 120, Width: 560, Height: 96) showing the last 4 combat messages. Removed the older direct keys (`A`, `P`, `D`) and registered numeric keybindings for player actions: key `1` triggers Basic Attack or the primary ability depending on the menu state, key `2` navigates to the Special Abilities submenu, key `3` ends the player's turn (or returns to exploration if victory is resolved), and key `0` returns to the main menu. Added dynamic visibility toggles and layout spacing for the console panel, history/prompts text, and exploration elements.

Reason: A standardized numeric menu-based navigation simplifies control management and supports submenu expansion. Logging roll details and combat status directly to a scroll-controlled bottom console improves feedback readability without cluttering the debug HUD or exploration canvas.

## 0046: Combat Visual Feedback v0 Presentation Layer

Decision: Implemented transient visual feedback (floating text, screen flashes, health bars, turn indicator, and victory/defeat outcome banners) using Phaser primitives and tweens. Extracted helper modules to `src/game/debug/` to keep `PrototypeScene.ts` thin. Hid debug HUD text panels during combat mode to eliminate overlay clutter, restoring them during exploration.

Reason: This provides immediate, readable hit/miss/damage visual confirmation without bloating the scene file, and keeps the screen clutter-free by hiding debug panels during combat while preserving pure rule boundaries.

## 0047: Mechanical Compatibility Through Engine And Content Pack Separation

Decision: The project targets mechanical compatibility with an existing published d20-derived tabletop system while sharing none of its protected expression. This is achieved structurally: the engine (every layer except `src/content/`) contains no term, identifier, constant or string specific to any published system and is publishable on its own, while `src/content/` holds ruleset-specific data and no logic. Verbatim rules text, setting content, names, trademarks and official art remain forbidden everywhere, including in `src/content/`. The repository stays private and non-commercial until the project owner decides otherwise in writing, recorded as its own decision.

Reason: The publisher's open license was read directly before this decision. It covers static text media and its section 2.2.1 expressly excludes applications and dynamic media, so it does not authorize distributing a video game; its section 2.3.1 places private non-commercial use among a small group outside the license's restrictions, which is where this project sits. Separating engine from content pack means protected expression never enters the publishable artifact, so the distribution question is contained in one directory instead of diffused across the codebase. The same separation is independently required for content scalability, so one design satisfies both constraints. This decision replaces the previous blanket prohibition on all official-system material with a narrower and stricter rule, and supersedes the corresponding section of `AGENTS.md`.

## 0048: Content Identifiers Are Strings In The Engine

Decision: The engine declares content identifiers as `string` and never as closed literal unions. The content pack enumerates which identifiers exist, and validation happens at catalog load against the declared set. The engine must never branch on a specific content id: no equality test, switch, or lookup table keyed by a literal content id may exist outside `src/content/`. Rules operate on the shape of data, never on which value it holds. The acceptance test is that adding an archetype, skill or ability requires editing data only.

Reason: Closed literal unions such as `type SkillId = 'melee'` turn every content addition into a code change with compiler fallout across all consumers, which is the opposite of the extensibility the project needs given an extensive body of source material. String identifiers with catalog-level validation keep the type system useful at the boundary while leaving the content set open. This also enforces decision 0047 mechanically, since an engine that cannot name a specific content id cannot embed system-specific expression.

## 0049: Context Is Compartmentalized In Three Tiers

Decision: Repository context is organized in three tiers. The core (`AGENTS.md`, `docs/ARCHITECTURE.md`, `tasks/README.md`) is always read and targets under 15 KB combined. Each meaningful directory under `src/` carries a `CONTEXT.md` of at most 60 lines, read only by agents working in that directory, answering what it is responsible for, what it may and may not import, how to perform the most common task, where a representative example is, and what requires a human decision. Everything else in `docs/` is archive, read only when a task file names it. An agent must be able to complete a task reading only the core, the `CONTEXT.md` of compartments it touches, and its task file.

Reason: The project is developed by rotating between AI models that share no memory, so the repository is the only memory and the cost of handoff is paid on every task. Undifferentiated documentation makes that cost grow without bound; `docs/` already exceeds 250 KB. Tiering bounds what must be read for local work. The 60-line budget is deliberately a design constraint rather than a style preference: a directory that cannot be explained within it has tangled responsibilities, so the budget surfaces coupling that tests do not catch.

## 0050: The Combat Layer No Longer Depends On The Terminal Harness

Decision: `src/combat/` no longer imports from `src/cli/`. The combat sheet, attribute, skill, action, weapon, ability and encounter preset data moved from `src/cli/combatCliPresets.ts` to `src/content/combatPresets.ts`; combat resource runtime state moved from `src/cli/combatCliResources.ts` to `src/combat/combatResources.ts`; and the enemy behaviour decision moved from `src/cli/combatCliEnemyScript.ts` to `src/combat/enemyScript.ts`. Every symbol carried by those files dropped its `Cli` / `CLI_` segment and kept the rest of its name, and every consumer, including the terminal harness itself, was updated to import from the new locations. No re-export shim or alias was left behind in `src/cli/`. The dependency direction now in force between layers is `cli -> game -> combat / exploration / movement -> content -> rules`, and never the reverse. `src/rules/` remains pure and gained no import. One residual edge is carried over unchanged and not introduced here: `src/content/combatPresets.ts` still reads weapon range profiles from `src/combat/combatWeaponRange.ts`, which is the same edge the file had before the move and is left for the content model reconciliation tasks.

Reason: The terminal harness was written first and was the only consumer for a period, so it accidentally became the owner of the game's content data and of an orchestration decision that the Phaser scene relies on in production. That made the combat layer unable to exist without the harness, contradicted the layer ownership defined in `AGENTS.md` and `docs/ARCHITECTURE.md`, and left `src/content/` with a single file while ruleset-specific values lived in the engine's debug tooling. Moving the data to the content pack and the enemy decision to the combat layer restores the intended inward dependency direction, and it is a precondition for decisions 0047 and 0048: content values cannot be swapped out of a directory they do not live in. The change is a pure move and rename with no behavioural change, verified by the suite staying at exactly 56 files and 430 tests.

## 0052: The Toolchain Is Pinned To pnpm And A Node Range

Decision: The project standardizes on pnpm, declared in `package.json` under `packageManager` (`pnpm@9.15.4`, matching the existing `pnpm-lock.yaml` at lockfile version 9.0), with `corepack enable` as the activation mechanism. Supported Node versions are declared in `engines.node` as `^18.0.0 || ^20.0.0 || >=22.0.0`, mirroring exactly what the installed Vite 6 and Vitest 3 declare, and `.nvmrc` pins the major line to `26`, matching the origin development machine. Command invocations in the current-state and instruction documents (`README.md`, `AGENTS.md`, `docs/CODEX_WORKFLOW.md`) moved from `npm run` to `pnpm`. Historical documents under `docs/` keep their original `npm` commands unchanged, per decision 0051. Dependency versions and `pnpm-lock.yaml` were not modified.

Reason: The repository already carried `pnpm-lock.yaml`, but every script and document invoked npm, and npm ignores a pnpm lockfile and re-resolves from the `package.json` ranges. A fresh clone on another machine or in a cloud environment could therefore diverge from the known-good tree that produces 56 files and 430 passing tests. Standardizing on pnpm preserves that exact tree rather than discarding it, which migrating to npm would have required. The `engines` range was mirrored from the build tools rather than guessed so it inherits their correctness, including their deliberate exclusion of odd-numbered Node majors. The activation path was recorded as corepack because corepack ships with Node; it could not be executed and verified inside the development sandbox used to make this change, which lacks both pnpm and corepack, and that limitation is stated here rather than hidden.

## 0051: README And MVP_SCOPE Are The Current-State Documents

Decision: `README.md` and `docs/MVP_SCOPE.md` are the two documents that describe what the project currently is, and they are the only ones. `README.md` carries the implemented state, the controls actually registered in the scene, the command list, and the reading order for the rest of the repository; `docs/MVP_SCOPE.md` carries what is inside the MVP with a pointer to the closeout that closed each item, and what remains deliberately outside. Every closeout updates both in the same piece of work, and `AGENTS.md` now states this under Change Hygiene. Everything else in `docs/` is historical record: design cuts and closeouts are written once and never revised afterwards, so a stale statement in them is a fact about when they were written, not an error to correct. Statements of current state must be traceable to a file in `src/` or to a closeout, and where a document and the code disagree, the code is authoritative.

Reason: The current-state documents had fossilized. `README.md` denied an exploration-to-combat integration that had already been closed, listed hotkeys removed by decision 0042, described a single-key action resolution superseded by the numeric menu of decision 0045, omitted the `combat:cli` script, and enumerated nine files for a `docs/` directory that holds forty-five. `docs/MVP_SCOPE.md` listed combat, initiative, damage, enemies, character systems, movement, click-to-move and grid interaction as out of scope while all of them were implemented, tested and closed. Because the project is developed by rotating between models that share no memory, a false current-state document is worse than a missing one: it is read as fact by the next agent and propagates. Naming exactly two documents as current state, and binding their update to the closeout that changes the state, keeps the drift from reopening without adding a further document to a `docs/` tree that already exceeds 250 KB.


## 0053: Combat Content Identifiers Are Strings Validated At Load

Decision: The combat content pack's identifier types stopped being closed literal unions. `CombatAttributeKey` and `CombatSkillId` are now `string`, `CombatAttributeSet` is `Record<string, number>`, and the weapon preset's `rangeBand` data field is `string`. The set of valid attribute keys is declared as data in `COMBAT_ATTRIBUTE_KEYS` in `src/content/combatPresets.ts`, alongside the existing `COMBAT_SKILL_DEFINITIONS`. A pure function `validateCombatPack` in `src/rules/combatPackValidation.ts` restores at the data boundary the guarantee the compiler previously gave: it returns a structured list of issues — unknown attribute key, unknown skill id, unknown weapon id, unknown resource id, and duplicate id within a collection — without throwing and without touching the console, in the same style as the other `src/rules/` read models. It is called once at pack load in `combatPresets.ts`, which throws a single legible error listing the issues if the pack is invalid, so a dangling reference fails loudly there instead of surfacing later as a silent NaN or undefined. The weapon range band (`CombatWeaponRangeBand = 'melee' | 'short' | 'long'`) stays a closed union in `src/combat/combatWeaponRange.ts`, and the content-to-combat resolution edge and the parallel `tacticalCatalogs.ts` model were left untouched.

Reason: Closed unions such as `type CombatSkillId = 'melee'` turned every content addition into a code change with compiler fallout across all consumers, the opposite of the extensibility decision 0048 requires and a channel through which system-specific expression could enter the engine (decision 0047). Making the identifiers `string` and validating references against the declared data set makes adding a skill, attribute or ability a data edit while keeping the failure mode explicit rather than silent. The range band is engine structure, not a content identifier: adding a band requires new engine logic (a distance profile and presentation), and its value is observable output verified by existing tests, so it remains closed and only the pack's `rangeBand` data field became `string`; the `isCombatWeaponRangeBand` guard already accepts `string` and still validates the value at resolution. Moving the sheet-resolution logic out of the content pack into the engine is a distinct relocation refactor with its own test-import fallout and is deferred to task 06; reconciling the two content models is task 05. The suite moved from 56 files and 430 tests to 57 files and 442 tests, the increase being solely the new validation tests; no existing test was altered.

## 0054: Sheet Resolution Left The Content Pack And The content -> combat Edge Is Closed

Decision: Combat sheet resolution moved out of the content pack into the engine. The new module `src/combat/combatSheet.ts` owns the `CombatResolved*` types, the `resolveCombatSheets` / `resolveCombatEncounterPreset` family and their private helpers, the eagerly evaluated `COMBAT_RESOLVED_SHEETS`, the `TRAINED_SKILL_BONUS` constant, and the `getCombatEncounterPreset` lookup. `src/content/combatPresets.ts` now holds only preset data and preset types, and no longer imports `src/combat/combatWeaponRange.ts`, so the residual `content -> combat` edge carried over by decision 0050 and descoped from decision 0053 is closed. The load-time `validateCombatPack` gate stays in `src/content/combatPresets.ts` unchanged: it is a guard over the pack's own data, `src/rules/` is an import the content pack is allowed to make, and keeping the gate in the pack module means the pack cannot be imported without being validated. Every consumer moved to the new import path, including the terminal harness and the combat session, and the test file `src/content/combatPresets.test.ts` moved to `src/combat/combatSheet.test.ts` because it exercises engine resolution rather than content data. Nothing else moved: the parallel `tacticalCatalogs.ts` model and the `AttributeKey` union in `src/rules/tacticalParticipant.ts` are task 05.

Reason: Decision 0047 defines `src/content/` as data only, and resolution logic living there both broke that rule and forced the content pack to reach back into combat orchestration for weapon range profiles, inverting the dependency direction stated in `docs/ARCHITECTURE.md`. Resolution is engine work: it reads the shape of a preset and computes derived values, and it must keep working when the pack is swapped for a different ruleset. Moving it is a pure relocation with no behavioural change; the pack is still validated before it is resolved, because the content module body still runs its gate before the engine module that imports it computes anything. The suite stayed at exactly 57 files and 442 tests, no assertion was edited, and the only test change was an import path plus the file directory. One acceptance criterion of the task file could not be met literally: `grep -rn "^import" src/content/*.ts | grep -v "from './"` still reports the `../rules/` imports (`COMBAT_FIXTURE_IDS`, `validateCombatPack`, and the `TacticalCatalogs` type in `tacticalCatalogs.ts`), which are explicitly permitted by `src/content/CONTEXT.md` and cannot be removed without work reserved for task 05. The criterion intent, that no import from an orchestration layer remains, is met: `src/content/` no longer imports from `src/combat/`.

## 0055: The Unified Content Model Uses The Six-Attribute Set

Decision: When the two parallel content models are reconciled in task 05, the surviving attribute set is the six-key set currently declared in `src/content/combatPresets.ts` as `COMBAT_ATTRIBUTE_KEYS`. The four-key set expressed by `AttributeKey = 'force' | 'agility' | 'mind' | 'presence'` in `src/rules/tacticalParticipant.ts` and consumed by `src/content/tacticalCatalogs.ts` is absorbed into it, and that union becomes `string` like every other content identifier. Structure that the four-key model has and the six-key model lacks — ancestries, archetypes, features, and equipment granting actions by id — is preserved and carried into the unified model rather than discarded. The project owner confirmed the six-key choice explicitly.

Reason: The project targets mechanical compatibility with an existing d20-derived system per decision 0047, and the six-key set is the one that expresses it. Keeping two attribute vocabularies in one repository guarantees they drift, and the four-key set exists only because the pure tactical core was written before the combat model. The `AttributeKey` union is the last known violation of decision 0048 in the repository: a closed literal union of content identifiers living inside the engine, in the rules layer. Converting it closes that gap. The catalog structure of the four-key model is kept because it is what makes a playable character extensible beyond a single archetype, which is the scalability goal this whole track serves; the attribute vocabulary is what gets replaced, not the modelling of ancestry, archetype, feature and equipment.

## 0056: The Two Content Models Are Reconciled Into One Validated Pack

Decision: Task 05 reconciled the two parallel content models into one. `AttributeKey` in `src/rules/tacticalParticipant.ts` became `string`, `AttributeSet` a string-keyed numeric record, and `applyAttributeModifiers` now folds arbitrary declared keys without naming any, so no closed literal union of attribute identifiers remains in the engine (closing the last one identified by decision 0055). `COMBAT_ATTRIBUTE_KEYS` in `src/content/combatPresets.ts` stays the one and only attribute-key declaration; the four-key catalog data in `src/content/tacticalCatalogs.ts` and its affected rule tests were mechanically remapped to it as `force -> strength`, `agility -> dexterity`, `mind -> intelligence`, `presence -> charisma`, with `constitution` and `wisdom` filled in at `0` so every complete attribute preset carries all six declared keys. The remap is the only observable data change; combat actor numbers, labels, ranges, costs, defenses, actions and encounter composition in `COMBAT_ACTORS` are unchanged, and no participant `attributes` value is read by any check or damage rule, so nothing in combat behaviour moved. The richer catalog structure — ancestries, archetypes, attribute presets, features, equipment with slots and modifiers, equipment granting actions by id, and action definitions — is preserved, and `buildTacticalParticipant` keeps its precedence, de-duplication and structured missing-id failure. The load-time gate is unified: `validateContentPack` in `src/rules/combatPackValidation.ts` validates both the combat preset data and the catalog structure against one declared key set, reporting unknown attribute keys, presets missing a declared key, unknown feature / equipment / action references, and duplicate ids across every catalog collection; it is called once at pack load in `combatPresets.ts`, which throws one legible error. The dependency between the two content files is one-directional: `combatPresets.ts` reads `tacticalCatalogs.ts` to validate it, and the catalog module never imports back, so the eagerly evaluated gate has no import cycle.

Reason: Two attribute vocabularies in one repository drift, and neither model alone held both the fixed combat sheets and the extensible ancestry/archetype/feature/equipment structure the project needs; decision 0055 fixed the six-key set as the survivor and this task carried it out. Keeping `COMBAT_ATTRIBUTE_KEYS` as the single declaration and passing it to the validator as data means adding or changing an attribute stays a data edit and no engine identifier is hard-coded, honouring decisions 0047 and 0048. Placing one gate over both halves, rather than one validator per file, removes the possibility that the two models pass independent checks yet disagree with each other. The one-directional file dependency was chosen over a third gate module because it keeps the guarantee decision 0054 established — the combat pack is validated before `src/combat/combatSheet.ts` resolves it — while extending that same gate to cover the catalogs; a mutual import would have left one side `undefined` at eager load and disguised the cycle as invalid data. The suite moved from 57 files and 442 tests to 57 files and 452 tests, the increase being solely the new catalog and unified-pack validator cases; no existing test was altered beyond the authorized four-key-to-six-key rewrite.
