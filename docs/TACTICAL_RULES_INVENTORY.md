# Tactical Rules Inventory

## Purpose

This document identifies rule concepts that are useful for a generic, simplified tactical engine. It is not a summary of any rulebook and does not define the final architecture. Its goal is to name the software contracts that future milestones may need.

## IP And Content Boundary

- Do not copy official text, tables, named options, setting lore, stat blocks, powers, spells, creatures, equipment lists, or descriptions.
- Do not reproduce protected names except unavoidable generic category labels.
- Treat the source material only as inspiration for abstract engine concepts.
- The project should define its own vocabulary, data, balance, and presentation.

## Core Resolution

- Most uncertain actions can be represented as `random roll + modifiers` compared with a target difficulty or opposing result.
- The engine should return a structured result: actor, attempted action, inputs, final total, target value, success state, and generated events.
- Natural extreme rolls, margins, critical hits, or degrees of success can remain extension points rather than mandatory MVP rules.
- Some trivial or pressure-free tasks may skip rolling, but that belongs outside the first tactical combat cut unless needed.

## Attributes And Derived Stats

- Base attributes: a small fixed set of numeric character qualities used by checks, attacks, defenses, resources, and derived values.
- Derived stats: values calculated from base data, archetype data, equipment, and active effects.
- Bonuses and penalties: additive modifiers from training, equipment, circumstances, conditions, and features.
- Defense: a target number or defensive value used by incoming attacks or hostile effects.
- Life: current and maximum durability, reduced by damage and restored by healing.
- Resources: spendable pools for special abilities, magic-like effects, exertion, or future class systems.
- Movement and size can become derived tactical stats once grid combat is included.

## Character Construction

- A character should be assembled from data blocks, not hardcoded branches.
- Ancestry: biological or cultural baseline data, expressed generically as modifiers, traits, size, movement, tags, and granted features.
- Archetype/class: tactical role data, such as life/resource growth, proficiencies, starting features, and available feature pools.
- Features/capabilities: reusable rules packages that grant modifiers, actions, reactions, passive traits, costs, or triggered effects.
- Equipment: data that grants attacks, defense, constraints, tags, and inventory state.
- Future choices should be represented as selected catalog entries, not by engine-specific assumptions about one character type.

## Catalog-Driven Data Model

- `ancestries`: generic lineage/background entries, even if the MVP has one human-like entry.
- `archetypes`: role packages, even if the MVP has one martial entry.
- `features`: passive and active capabilities, including basic proficiencies and simple combat traits.
- `equipment`: weapons, armor, shields, tools, and consumables represented through generic properties.
- `actions`: engine-level actions such as move, basic attack, wait, use item, and future special actions.
- `conditions`: named effect states with modifiers, restrictions, duration, and removal rules.
- `resources`: pools with maximum/current values, spend rules, and recovery rules.
- `spells/powers`: future generic effect definitions with costs, requirements, targeting, duration, and resistance.
- The MVP may contain a single row in several catalogs, but the core should consume catalog properties rather than checking for specific labels.

## Turn And Initiative

- Encounter: a time-bounded tactical scene containing participants and encounter state.
- Participants: actors with stats, side/faction, active effects, resources, and turn state.
- Teams/factions: used to identify allies, enemies, neutral actors, and victory conditions.
- Initiative: an ordering process at encounter start that determines turn sequence.
- Turn order: stable sequence for the encounter unless a rule later changes it.
- Active participant: the actor currently allowed to spend turn actions.
- Start/end of turn: future trigger points for effects, durations, recovery, damage over time, and cleanup.

## Action Economy

- Main action: the principal thing a participant does on its turn, such as an attack, special capability, or future spell-like effect.
- Movement action: repositioning or simple physical interaction with the battlefield.
- Full-turn action: a future category that consumes both main and movement capacity.
- Free/minor actions: low-cost actions that may be allowed only on the actor's turn and should have explicit limits if added.
- Reaction/response: an off-turn response to a trigger; useful later, but probably not required for the first MVP combat.
- The engine should track per-turn action capacity as data, not as one-off booleans tied to a specific class.

## Checks, Attacks And Defenses

- A check can be modeled as actor + stat source + modifiers + target difficulty.
- An opposed check can be modeled as two or more checks compared against each other.
- An attack can be modeled as actor, target, attack profile, roll/modifiers, target defense, hit result, and follow-up events.
- Defenses should be abstract enough to support fixed defense values, future saving throws, or opposed defenses.
- Result events should be explicit: hit, miss, damage applied, condition applied, resource spent, reaction offered, actor defeated.

## Damage, Healing And Defeat

- Track current and maximum life for each damageable participant.
- Damage reduces life after applicable modifiers, resistance-like reductions, or future vulnerabilities.
- Healing restores life up to a maximum unless a future effect explicitly says otherwise.
- Defeat/incapacitation begins when life reaches a threshold, most likely zero for the MVP.
- Death, bleeding, stabilization, severe injury, and nonlethal distinctions should remain future or out of scope unless the director wants them early.

## Conditions And Effects

- Conditions are temporary or persistent states that alter stats, actions, targeting, movement, perception, or defeat state.
- Effects are the rule objects that apply modifiers, conditions, damage, healing, movement, resource changes, or action grants.
- Each effect should know its source, target, duration, tags, stacking behavior, and removal condition.
- Duration may be instant, until end/start of turn, for a number of rounds, for the encounter, or until explicitly removed.
- Start-of-turn and end-of-turn triggers are useful future hooks for ongoing damage, recovery, and cleanup.
- Do not implement a complete condition list in v0.

## Resources

- The engine should support character resources with current, maximum, spend, and recovery rules.
- Recovery may later depend on rest, scene, encounter, day, or specific effects.
- MVP can omit special resources or include a single placeholder pool only if needed by the initial martial capability set.
- Resource rules should be generic enough for future powers, magic-like effects, stamina, morale, or class-specific pools.

## Magic And Powers As Future Systems

- Powers/capabilities are data packages that grant actions, modifiers, triggered effects, costs, or passive traits.
- Magic can be treated as a subset of actions/effects with requirements, cost, targeting, duration, tags, and resistance.
- Official spell or power lists should not be modeled now.
- The first implementation should prove the effect pipeline with simple non-magical capabilities before adding a larger ability system.

## MVP Candidate Cut

- One playable participant assembled through catalogs.
- One generic initial ancestry entry.
- One generic martial archetype entry.
- Fixed attributes.
- Simple starting equipment, likely one melee weapon and one defensive item.
- One basic offensive action.
- Initiative and stable turn order.
- Turn start, action spend, turn end.
- Life, damage, healing hook, and defeat at zero life.
- No real combat UI yet.
- No exploration integration for this milestone.
- No official names, official lists, or faithful balance targets.

## Explicitly Out Of Scope For v0

- Complete classes or archetypes.
- Character progression and leveling.
- Official powers.
- Official spells.
- Large official equipment catalogs.
- Official creatures or monster stat blocks.
- Full condition system.
- Faithful balance reproduction.
- Narrative setting, lore, pantheons, factions, or named content.
- Final combat UI.
- Complete grid tactics unless the director explicitly pulls positioning into the first combat slice.

## Open Questions For Director

- What is the initial action economy: one main action only, main plus movement, or a fuller action model from the start?
- Should critical hits or natural extreme rolls exist in the MVP, or wait until the attack pipeline is stable?
- Does the first combat need grid position, distance, adjacency, and movement, or can it begin as abstract participant-to-participant combat?
- Should a special resource exist in the first combat, or should resources remain reserved for later milestones?
- How close should derived stats be to the inspiration material versus a deliberately simpler custom formula set?
- Should defeat at zero life immediately remove an actor, mark it incapacitated, or create a recoverable downed state?
- Are reactions out of scope for v0, or should the engine reserve a minimal trigger queue now?
