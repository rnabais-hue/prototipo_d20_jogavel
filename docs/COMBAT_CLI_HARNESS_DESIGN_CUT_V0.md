# Combat CLI Harness Design Cut v0

## Purpose

Define the first narrow architecture cut for a command-line combat harness that allows manual playtest of the existing Pure Tactical Core v0 before combat is integrated with exploration or Phaser.

The CLI is an adapter. It owns I/O, prompts, display text, random rolls, and fixture selection. It must not become a combat rules module.

## Source Contracts

The harness builds on the Pure Tactical Core v0 closed in `docs/TACTICAL_CORE_V0_CLOSEOUT.md`.

Core files that the harness may call include:

- `src/rules/combatFixtures.ts`
- `src/rules/tacticalEncounter.ts`
- `src/rules/attackDamage.ts`

The core remains pure and deterministic:

- rolls are explicit inputs;
- damage amounts are explicit inputs;
- defenses are explicit inputs;
- turn order is explicit input;
- outcome is read from the encounter state;
- no CLI, Node, readline, browser, Phaser, or random dependency may enter `src/rules/`.

## Location

Recommended location for v0 implementation:

- `src/cli/combatCli.ts` for the command loop and presentation adapter;
- `src/cli/combatCliPresets.ts` for CLI-only resolved presets if needed;
- optional `src/cli/combatCli.test.ts` for command/session helper tests if behavior grows beyond trivial I/O;
- package script such as `combat:cli` may be added only when there is an executable path.

Do not place the CLI under `src/rules/`, `src/game/`, or `src/game/debug/`.

## First Playtest Shape

The first harness is 1v1 only:

- one fixed playable participant;
- one fixed opponent;
- fixed turn order, player first unless explicitly changed by fixture data;
- basic attack only;
- no PM/resources;
- no special abilities;
- no initiative roll;
- no grid, movement, distance, range, or adjacency;
- no Phaser and no browser UI.

The initial participant data should reuse `createMinimalCombatEncounterFixture` where possible. If richer display values are needed, add CLI-side preset data rather than expanding the rule core.

## Commands v0

The first command set is intentionally small:

- `help`: list available commands.
- `status`: print round, turn, active participant, both participants' life, defeated flags, and current outcome.
- `attack`: active participant performs the basic attack against the opposing participant.
- `end`: end the current active turn.
- `quit`: exit the session.

Optional aliases are acceptable only if they do not complicate tests or docs, for example `q` for `quit`.

## Attack Resolution v0

Recommended v0 behavior:

- CLI rolls `d20` automatically for the active participant.
- CLI reads attack bonus, defense target, and damage from CLI preset data or fixture values.
- CLI passes explicit `roll`, `modifier`, `difficultyClass`, and `damageAmount` into core functions.
- CLI prints the roll, modifier, target defense, hit or miss, damage applied, life after damage, and defeat if emitted by core events.

Manual roll entry can be added later if useful for deterministic playtest, but it is not required for the first skeleton. If manual rolls are included, keep them as CLI input only and validate them before calling the core.

## Resolved Preset Shape

If the first implementation needs richer fixed actor data, use a data-driven CLI preset shape like this:

```ts
type CombatCliActorPreset = {
  participantId: string;
  displayName: string;
  teamId: string;
  lifeMaximum: number;
  attack: {
    actionId: string;
    label: string;
    checkModifier: number;
    targetDefense: number;
    damageAmount: number;
  };
};
```

This preset is not a rule engine. It is fixed playtest data that supplies explicit inputs to the existing core.

Avoid `if ancestry === ...`, `if archetype === ...`, class-specific branching, or official protected names. Use original/generic names such as `Training Vanguard`, `Practice Raider`, `basic_strike`, and `team_player`.

## Core vs Adapter Boundary

Allowed in CLI/adapters:

- `readline` or Node terminal I/O;
- command parsing;
- text formatting;
- random `d20` generation;
- fixed playtest presets;
- choosing attacker and target for the 1v1 scenario;
- mapping core events to readable terminal text;
- process exit behavior.

Not allowed in CLI/adapters:

- redefining hit/miss rules outside the core;
- mutating encounter state manually instead of using core functions;
- calculating defeat outside core state/events;
- adding class, ancestry, equipment, power, or official rule logic;
- importing Phaser or browser modules.

Not allowed in `src/rules/` for this track:

- `readline`, `process.stdin`, `process.stdout`, timers, terminal colors, random rolls, Phaser, browser APIs, or CLI command concepts.

## Implementation Milestone Prompt: CLI Skeleton v0

Use this prompt for the next implementer agent:

```text
You are implementing Combat CLI Harness v0 for the TypeScript/Vite/Vitest project at:
G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel

Read first:
- docs/TACTICAL_CORE_V0_CLOSEOUT.md
- docs/COMBAT_CLI_HARNESS_DESIGN_CUT_V0.md
- src/rules/combatFixtures.ts
- src/rules/tacticalEncounter.ts
- src/rules/attackDamage.ts

Task:
Create a narrow Node/TypeScript CLI harness for manual 1v1 combat playtest. The CLI is an adapter only. Do not put CLI or random behavior in src/rules/.

Expected scope:
- Add CLI code under src/cli/.
- Add an executable package script if needed, for example combat:cli.
- Start a fixed encounter using existing core fixture/data.
- Support commands: help, status, attack, end, quit.
- `attack` rolls d20 in the CLI, uses fixed generic preset values for modifier/defense/damage, calls the existing core attack+dmg pipeline, and prints readable results/events.
- Outcome is read from core state via `getEncounterOutcome`.
- No PM, no special abilities, no initiative, no grid, no Phaser, no official content/IP.

Validation:
- Run tests, typecheck, and build using the project's available package manager/runtime.
- Report any command substitution if npm is unavailable.

Guardrails:
- Do not add combat rules to CLI.
- Do not add CLI dependencies to src/rules/.
- Do not hardcode class/ancestry branches in the core.
- Keep content original and generic.
```

## Orchestrator Validation Checklist

For CLI Skeleton v0 delivery, validate:

- CLI code is outside `src/rules/` and outside Phaser presentation folders.
- No `readline`, `process.stdin`, `Math.random`, or terminal formatting imports appear in `src/rules/`.
- The CLI uses `createMinimalCombatEncounterFixture`, `declareAction` or attack pipeline functions, `endTurn`, and `getEncounterOutcome` rather than manually mutating state.
- Roll generation happens in CLI/adapted code only.
- Damage and defense values come from explicit fixture/preset data.
- Commands are limited to the v0 command list unless a small alias is justified.
- All names are generic/original and avoid protected official lore/text.
- Tests/typecheck/build are run after code changes.

## Resource/PM v0 Update

A later CLI adapter milestone added generic session-owned resources for the fixed 1v1 harness. The resource displays as `PM`, but the model is generic (`id`, `label`, `current`, `maximum`) and lives in `src/cli/`, not `src/rules/`.

`status` now prints current/max PM for both participants. No ability or PM-spending attack command exists yet; basic attacks still pass explicit roll, modifier, defense, and damage inputs to the pure tactical core.

See `docs/COMBAT_CLI_RESOURCE_PM_V0.md`.

## Deferred

Explicitly defer:

- resolved sheet derivation beyond fixed data presets;
- manual roll mode unless trivial;
- PM-spending abilities;
- abilities with costs;
- enemy AI beyond manual commands or a very small scripted later milestone;
- initiative;
- grid/position;
- integration with exploration or Phaser.

## Simple Ability v0 Update

A later CLI adapter milestone added one original generic PM-spending ability for the fixed playable participant. The `ability` command, with `power` as an alias, spends PM from CLI session resource state and then resolves through the existing core attack plus damage pipeline. PM is spent on use before the attack result is known, so misses still spend PM. Insufficient PM prints a readable error and leaves encounter and resource state unchanged.

See `docs/COMBAT_CLI_SIMPLE_ABILITY_V0.md`.