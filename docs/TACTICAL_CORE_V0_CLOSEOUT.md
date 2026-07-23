# Tactical Core v0 Closeout

## Purpose

This document closes the **Pure Tactical Core v0** macro phase for the custom d20-inspired tactical RPG prototype.

The closeout records what the pure tactical engine now supports, what remains explicitly outside the phase, which files form the current core, which validations prove the contract, and which future tracks can build on this foundation.

## Scope Completed

- Catalog-driven participant assembly.
- Minimal MVP tactical catalogs.
- Encounter state.
- Teams/factions.
- Runtime life.
- Simple defeat at zero life.
- Caller-supplied turn order.
- Defeat-aware turn flow.
- Action declaration.
- Explicit check resolution.
- Basic attack hit/miss resolution.
- Damage application.
- Basic attack plus damage pipeline.
- Encounter outcome read model.
- Pure combat fixtures.
- Pure integrated combat smoke flow test.

## Core Files

- `src/rules/tacticalParticipant.ts`
- `src/content/tacticalCatalogs.ts`
- `src/rules/tacticalEncounter.ts`
- `src/rules/checkResolution.ts`
- `src/rules/basicAttack.ts`
- `src/rules/damage.ts`
- `src/rules/attackDamage.ts`
- `src/rules/combatFixtures.ts`
- `src/rules/combatSmokeFlow.test.ts`

## Architectural Guarantees

- The tactical core is pure TypeScript rules and data.
- The tactical core does not import Phaser.
- The tactical core does not depend on browser APIs.
- The tactical core does not depend on UI modules.
- The tactical core does not integrate with exploration.
- The tactical core does not include grid, position, range, adjacency, or tactical movement.
- The tactical core does not include official IP, official names, official lore, official text, official rules text, official stat blocks, official factions, or official art.
- Tactical commands return updated state and structured events.
- Rolls are explicit inputs supplied by the caller.
- Damage amounts, defenses, turn order, and fixture overrides are explicit inputs supplied by the caller or fixture.
- The outcome model is a pure read model and does not end encounters automatically.

## Validated Flow

The integrated smoke flow in `src/rules/combatSmokeFlow.test.ts` proves the current v0 contract:

1. Create a minimal encounter from the pure combat fixture.
2. Resolve participant A attacking participant B.
3. Apply damage on hit.
4. Confirm the encounter remains `ongoing` while both teams have active participants.
5. Advance the turn.
6. Resolve participant B acting with an explicit miss.
7. Advance the turn back to participant A.
8. Resolve participant A hitting participant B again.
9. Apply defeat when participant B reaches zero life.
10. Keep the defeated participant in the original turn order.
11. Read the final outcome as `resolved` with the player team as winner.
12. Confirm no automatic `encounter_ended` or `victory_declared` event is emitted.

## Explicitly Out Of Scope

- UI or visual combat harness.
- Exploration-to-combat integration.
- Grid, position, adjacency, range, terrain, or tactical movement.
- Rolled initiative.
- Critical hits.
- Natural extreme roll handling.
- Margins or degrees of success.
- Reactions or trigger queues.
- Special resources.
- Healing.
- Complex conditions.
- Magic or power systems.
- Complete classes or archetypes.
- Character progression.
- Real inventory or equipment rules.
- AI behavior.
- Automatic encounter end.
- Rewards, XP, loot, scene transition, or exploration return flow.
- Official content or faithful reproduction of any protected rule text or setting.

## Known Technical Notes

- The production build currently reports a large Phaser-containing bundle warning. This is known and non-blocking for the v0 tactical core closeout.
- `src/rules/combatFixtures.ts` is a test/prototype helper, not a game rule module.
- `src/rules/combatFixtures.ts` imports the minimal MVP catalog data to make tests concise. It should not grow into domain rule logic.
- The current fixture names are generic prototype identifiers, such as `player_actor`, `test_opponent`, `team_player`, and `team_opponent`.
- The smoke flow is an integrated contract test. It is not a visual harness and does not define final encounter presentation.

## Validation Snapshot

Last validated snapshot for this closeout:

- Test suite: passing.
- Test count: 21 test files, 186 tests.
- Typecheck: passing.
- Build: passing.
- Build note: Vite reports a non-blocking chunk size warning for the current bundle.

Validation commands expected by the project remain:

```bash
npm run test
npm run typecheck
npm run build
```

If global `npm` is unavailable in the local environment, run the equivalent local project binaries with the available Node runtime and record that substitution in the handoff.

## Recommended Next Tracks

These are possible future tracks only. Each should receive a separate explicit scope before implementation.

- Combat debug harness.
- Exploration-to-encounter transition.
- Grid/position tactical layer.
- Initiative roller.
- Content expansion with original project data.
- Healing, conditions, and resources.
- Action/effect data model.
- Defensive stat derivation.
- Encounter end orchestration.
- Rewards and scene transition flow.
