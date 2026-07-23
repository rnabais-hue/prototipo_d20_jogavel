import { describe, expect, it } from 'vitest';
import { createMinimalCombatEncounterFixture } from '../rules/combatFixtures';
import { endTurn } from '../rules/tacticalEncounter';
import { COMBAT_CLI_ACTORS } from './combatCliPresets';
import { getCombatCliEnemyScriptDecision } from './combatCliEnemyScript';

describe('getCombatCliEnemyScriptDecision', () => {
  it('does not run when the active participant is the player', () => {
    const fixture = createMinimalCombatEncounterFixture();

    expect(
      getCombatCliEnemyScriptDecision(
        fixture.encounter,
        COMBAT_CLI_ACTORS.opponent.participantId,
      ),
    ).toEqual({
      ok: false,
      reason: 'active_participant_is_not_enemy',
    });
  });

  it('runs when the fixed opponent is active and the encounter is ongoing', () => {
    const fixture = createMinimalCombatEncounterFixture();
    const turn = endTurn(fixture.encounter);

    expect(turn.ok).toBe(true);
    expect(
      getCombatCliEnemyScriptDecision(
        turn.ok ? turn.encounter : fixture.encounter,
        COMBAT_CLI_ACTORS.opponent.participantId,
      ),
    ).toEqual({
      ok: true,
    });
  });

  it('does not run after the encounter is resolved by opponent defeat', () => {
    const fixture = createMinimalCombatEncounterFixture({
      opponentLife: {
        current: 0,
        maximum: 8,
      },
    });

    expect(
      getCombatCliEnemyScriptDecision(
        fixture.encounter,
        COMBAT_CLI_ACTORS.opponent.participantId,
      ),
    ).toEqual({
      ok: false,
      reason: 'encounter_not_ongoing',
    });
  });
});
