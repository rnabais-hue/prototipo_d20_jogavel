import {
  getActiveParticipant,
  getEncounterOutcome,
  type TacticalEncounter,
} from '../rules/tacticalEncounter';

export type EnemyScriptDecision =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason:
        | 'encounter_not_ongoing'
        | 'no_active_participant'
        | 'active_participant_is_not_enemy'
        | 'enemy_defeated';
    };

export function getEnemyScriptDecision(
  encounter: TacticalEncounter,
  enemyParticipantId: string,
): EnemyScriptDecision {
  const outcome = getEncounterOutcome(encounter);
  if (outcome.status !== 'ongoing') {
    return {
      ok: false,
      reason: 'encounter_not_ongoing',
    };
  }

  const active = getActiveParticipant(encounter);
  if (!active) {
    return {
      ok: false,
      reason: 'no_active_participant',
    };
  }

  if (active.id !== enemyParticipantId) {
    return {
      ok: false,
      reason: 'active_participant_is_not_enemy',
    };
  }

  if (active.defeated) {
    return {
      ok: false,
      reason: 'enemy_defeated',
    };
  }

  return {
    ok: true,
  };
}
