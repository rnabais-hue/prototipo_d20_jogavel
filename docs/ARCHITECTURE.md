# Architecture

This project is a **custom d20-inspired tactical RPG prototype** with a layered architecture. The current MVP is intentionally minimal.

## Goals

- Keep gameplay rules pure and testable.
- Keep Phaser isolated to the game/presentation side.
- Keep content data separate from runtime orchestration.
- Allow future exploration, combat, movement, narrative, and UI modules without coupling them prematurely.

## Layers

### `src/rules/`

Pure deterministic rules and calculations.

Rules must not import Phaser, browser APIs, `src/game/`, `src/ui/`, or `src/narrative/`. Rules should be easy to test with Vitest in a Node environment.

### `src/content/`

The **content pack**: typed data only, no logic, no branching, no computation.

This is the single layer allowed to contain values specific to a target ruleset — attribute
keys, skill definitions, ancestries, archetypes, features, equipment, actions, encounter
presets. Everything here is data that the engine consumes by id.

Content must never be imported for its *specific values* by engine code. The engine consumes
the shape, never the value. See "Engine and Content Pack" below and the IP rule in `AGENTS.md`.

### `src/game/`

Phaser-specific app setup, scenes, rendering orchestration, and adapters between engine runtime and pure project modules.

This layer may depend on `rules`, `content`, and pure movement modules, but those modules must not depend back on it.

`src/game/debug/` contains Phaser debug presentation helpers and small debug controllers. These controllers may own temporary scene-level debug state and views, but deterministic movement transitions remain in `src/movement/`.

### `src/exploration/`

Exploration orchestration: map state, interest points, explorable entities, orthogonal
pathfinding, switch-controlled map state.

### `src/combat/`

Combat orchestration: session state, grid positioning, attack and weapon range, enemy scripting.
Composes the pure rules in `src/rules/` with the content pack.

### `src/movement/`

Pure movement foundation for grid math and actor movement state.

This layer currently contains deterministic grid conversion, grid bounds checks, minimal `ActorState`, movement intent, and logical movement completion. It must not import Phaser, browser APIs, `src/game/`, `src/ui/`, or `src/narrative/`.

Visual movement, animation, interpolation, pathfinding, collision, speed, and arrival presentation belong in later game/presentation work, not in the pure movement state.

### `src/narrative/`

Future narrative orchestration. Empty for the current MVP.

### `src/ui/`

Future UI components, presentation state, HUD, menus, and interaction surfaces. Empty for the current MVP.

## Dependency Direction

Preferred dependency direction:

```text
src/game/          -> src/rules/, src/content/, src/movement/
src/ui/            -> src/rules/, src/content/, src/movement/
src/exploration/   -> src/rules/, src/content/, src/movement/
src/combat/        -> src/rules/, src/content/, src/movement/
src/movement/      -> no Phaser, no UI, no narrative, no game layer
src/narrative/     -> src/rules/, src/content/
src/rules/         -> no Phaser, no UI, no narrative, no game layer
src/content/       -> simple data/types only
```

Avoid circular dependencies. If a future feature needs engine-specific behavior, keep it in `src/game/` or an adapter layer rather than in pure rules or movement modules.

## Engine and Content Pack

The codebase is split along a second axis, perpendicular to the layer stack:

- **Engine** — every directory except `src/content/`. Generic, ruleset-agnostic, publishable.
- **Content pack** — `src/content/`. Data expressing one specific ruleset.

### The two rules that enforce it

**1. Identifiers are `string` in the engine, enumerated in the content pack.**

The engine must not declare closed literal unions for content identifiers. `type SkillId =
'melee'` is a defect: it makes every new skill a code change with compiler fallout. The engine
declares `skillId: string`; the content pack declares which skills exist; validation happens at
catalog load against the declared set.

The same applies to attribute keys, ancestries, archetypes, features, equipment, actions,
abilities and resources.

**2. The engine never branches on a content id.**

No `if (skillId === 'melee')`, no `switch` over attribute names, no lookup table keyed by a
literal content id anywhere outside `src/content/`. Rules operate on the *shape* of the data —
"this action has an `attributeKey` and a `damageBase`" — never on which value it holds.

### The acceptance test

Adding a second playable archetype, a new skill, or a new ability must require **editing data
only**. If it requires editing a `.ts` file containing logic, the model has failed and the
failure is architectural, not cosmetic.

This split exists for two independent reasons that happen to demand the same design:
scalability of content, and keeping protected expression out of the engine.

## Context Compartments

This project is developed by rotating between AI models that share no memory. The repository is
the only memory. Making that work is an architectural concern, not a documentation concern: the
goal is that **no agent needs global knowledge to do local work**.

### Three tiers of context

**Core — always read.** `AGENTS.md`, this file, `tasks/README.md`. These must stay small enough
that reading them is never a burden. Target: under 15 KB combined. If the core grows past that,
something belongs in a compartment instead.

**Compartment — read only when entering.** Each meaningful directory under `src/` carries a
`CONTEXT.md` of at most 60 lines answering exactly five questions:

1. What is this directory responsible for?
2. What may it import, and what must it never import?
3. How do I do the most common task here, concretely?
4. Where is a representative example?
5. What here requires a human decision rather than an agent decision?

**Archive — read only when named.** Everything in `docs/` other than this file. Closeouts and
design cuts are historical record. They are never read by default; a task file points to one by
name when it is relevant.

### The diagnostic

An agent should be able to complete a task by reading: the core, the `CONTEXT.md` of each
compartment it touches, and its task file. Nothing else.

When that is not possible, the correct response is to **fix the compartment boundary**, not to
write more documentation. A directory that cannot be explained in 60 lines is a directory whose
responsibilities are tangled. The context budget is a design constraint that surfaces coupling.

Stack and validation commands are defined in `package.json` and `tasks/README.md`. They are not
duplicated here, so they cannot drift.
## Tactical Core

Pure tactical participant types and assembly helpers live in `src/rules/` and consume catalog
entries by id. The core covers encounter state, teams, runtime life, defeat, supplied turn
order, action declaration, explicit checks, attack resolution, damage and outcome reads.

Full scope and boundaries: `docs/TACTICAL_CORE_V0_CLOSEOUT.md` (archive — read when named).

