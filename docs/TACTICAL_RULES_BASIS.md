# Tactical Rules Basis

## Purpose

This document turns the tactical rules inventory into design decisions for the future pure tactical engine v0. It is a prescriptive basis for the next implementation milestones, not a complete rules system and not a code plan for combat presentation.

The v0 direction is generic, small, and data-driven. The first implementation work should prove the data model before adding combat flow.

## Architectural Boundaries

- Pure rule calculations belong in `src/rules/` and/or `src/combat/` if a combat module is created.
- Original prototype content belongs in `src/content/`.
- Phaser, browser APIs, rendering, input, scenes, and debug presentation belong only in `src/game/`.
- Pure rules, combat, content, movement, and exploration modules must not import Phaser or browser-only APIs.
- Tactical commands should return updated state and structured events, not narrative text and not presentation instructions.
- Combat v0 must remain independent from exploration. No exploration-to-combat integration is part of this basis.

## IP And Vocabulary Boundary

- Do not copy official text, official tables, official stat blocks, official lists, official names, official lore, or official balance targets.
- Do not list official classes, ancestries, powers, spells, equipment, creatures, places, deities, factions, or setting terms.
- Use project-owned vocabulary and generic engine categories.
- Treat any inspiration only as high-level design pressure for a custom d20-style tactical engine.

## Design Principle: Catalog Minimum, Not Hardcoding

The MVP may start with a single entry in each catalog when that keeps implementation small. A one-entry catalog is acceptable; a core rule branch for that one entry is not.

The core must not check for a specific ancestry, archetype, item, weapon, or participant preset by name. Data should enter the engine through IDs, numeric properties, tags, granted capabilities, and generic effects. Fixtures and presets may exist outside the core to make tests and prototypes easy to assemble.

## v0 Rule Decisions

- Basic resolution is `roll + modifiers` compared against a target value.
- Resolution returns structured data: actor, target when relevant, action, inputs, total, target value, success state, state changes, and events.
- Critical hits, natural extreme roll handling, margins, and degrees of success are out of v0. Reserve concepts for future expansion.
- Reactions are out of v0. Reserve the concept, but do not emit reaction events or create a trigger queue yet.
- Combat v0 starts abstract, with no grid, position, adjacency, range bands, or tactical movement.
- Tactical movement is reserved for a later milestone and must not be coupled to the first combat model.
- Special resources are not required in the first cut. A generic optional or reserved resource field is allowed if it keeps future growth clean.
- Life, damage, healing, and defeat are simple: damage lowers life, healing restores life up to a maximum, and life at zero marks the participant as `defeated` or an equivalent simple state.
- A turn grants the active participant one simple main action. Movement does not exist in the v0 action economy.
- Events are structured machine-readable records, not prose narration.
- Minimal catalog content is allowed. Hardcoding a specific catalog option in the core is not allowed.

## v0 Domain Concepts

- **Encounter**: A pure tactical scene state containing participants, teams, turn order, active turn state, and an event history or emitted event batch.
- **Participant**: A tactical actor assembled from catalog data, current stats, team, status flags, optional resources, and granted action access.
- **Team/Faction**: A side identifier used to distinguish allies, enemies, neutral actors, and future victory logic.
- **TurnOrder**: The ordered participant sequence used to choose active turns. v0 may use fixed or precomputed ordering.
- **ActiveTurn**: The current participant's turn state, including whether the simple main action has been spent.
- **ActionCommand**: A structured request to perform an action, such as a basic offensive action against a target.
- **Check**: A roll-based resolution unit with a source participant, modifiers, target value, final total, and success boolean.
- **Defense**: A target value used by hostile checks. It should be generic enough to support future defense types.
- **Damage**: A structured life reduction with source, target, amount, and tags or type fields reserved for future rules.
- **Healing**: A structured life restoration with source, target, amount, and maximum-life clamping.
- **Defeat**: A simple state transition applied when life reaches zero.
- **Event**: A typed structured record produced by commands and rules to describe what happened without requiring UI or prose.

## Data Catalogs Reserved For MVP Growth

- **ancestries**: Generic origin or baseline packages. May start with one entry; must stay extensible and must not contain official content.
- **archetypes**: Generic tactical role packages. May start with one entry; must be consumed through properties, tags, and grants.
- **attribute presets**: Fixed initial attribute sets for test and MVP assembly. May start with one preset.
- **features/capabilities**: Reusable passive or active grants. May start empty or minimal; should be generic effect-oriented data.
- **equipment**: Weapons, defensive items, and future carried objects. May start with one simple weapon and one simple defensive item.
- **actions**: Available commands such as a basic offensive action. May start with one action.
- **conditions**: Temporary or persistent state labels. May start with only a defeated-like state or remain reserved.
- **resources**: Generic current/maximum pools. May remain reserved unless the first content slice needs a placeholder.

Each catalog should be defined as extensible data. None should carry official names, official prose, official lists, or official balance assumptions.

## MVP Content Shape

The first content slice should be deliberately plain:

- one generic initial ancestry-like entry;
- one generic martial archetype-like entry;
- one fixed attribute preset;
- one simple generic weapon;
- one simple generic defensive item, if needed;
- one basic offensive action;
- one generic test opponent, if needed.

All of this content should live outside the core and be assembled through data. The core should work the same way if these entries are replaced by different original entries later.

## Event Model Direction

Events should be typed records with predictable payloads. The v0 event vocabulary should cover:

- encounter started;
- turn started;
- action declared;
- check resolved;
- attack hit;
- attack missed;
- damage applied;
- healing applied;
- participant defeated;
- turn ended.

Do not include reaction events in v0. Reactions may be introduced later when off-turn triggers and response windows are designed.

## Explicitly Out Of Scope For v0

- Real combat UI.
- Phaser combat harness.
- Exploration-to-combat integration.
- Grid, position, adjacency, or range.
- Tactical movement.
- Reactions.
- Critical hits.
- Margins and degrees of success.
- Complete classes or complete archetype systems.
- Character progression.
- Magic systems.
- Power lists.
- Equipment lists.
- Official monsters or stat blocks.
- Complete conditions.
- Faithful balance reproduction.
- Official text, lore, names, places, deities, factions, or setting material.

## First Implementation Milestone Recommendation

Recommended next code milestone: **Data Model Skeleton v0**.

Scope:

- Pure types for minimal catalogs.
- Minimal MVP content in `src/content/`.
- Pure helpers that assemble a base participant from data.
- Tests proving the participant is assembled from catalog data, not from hardcoded checks for one specific option.
- No combat flow yet.
- No Phaser, UI, scene, exploration integration, grid, or tactical movement work.

This milestone should make later combat flow possible without committing the engine to a single character option or a copied rules structure.

## Open Questions

- Should the first turn order be fixed by fixture data, sorted from a simple roll, or supplied by the caller?
- Which names should the project use for its own generic attributes?
- Should the first `defeated` state be represented as a condition entry, a participant flag, or both?
- Should damage tags exist in the first data skeleton or wait until the first combat flow milestone?
