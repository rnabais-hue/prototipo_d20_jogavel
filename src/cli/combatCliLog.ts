import type { EncounterEvent } from '../rules/tacticalEncounter';

export type CombatCliLogEvent =
  | EncounterEvent
  | {
      type: 'check_resolved';
      roll: number;
      modifierTotal: number;
      total: number;
      target: number;
      success: boolean;
    }
  | {
      type: 'attack_hit' | 'attack_missed';
      total: number;
      defense: number;
    };

export function formatCombatCliEvent(
  event: CombatCliLogEvent,
  formatParticipant: (participantId: string) => string,
): string | undefined {
  switch (event.type) {
    case 'action_declared':
    case 'main_action_spent':
    case 'check_resolved':
      return undefined;
    case 'attack_hit':
      return `Attack hit with total ${event.total} vs ${event.defense}.`;
    case 'attack_missed':
      return `Attack missed with total ${event.total} vs ${event.defense}.`;
    case 'damage_applied':
      return `${formatParticipant(event.targetId)} takes ${event.amount} damage: ${event.previousLife} -> ${event.currentLife}.`;
    case 'participant_defeated':
      return `${formatParticipant(event.participantId)} is defeated.`;
    case 'turn_ended':
      return `Turn ended: ${formatParticipant(event.participantId)}.`;
    case 'turn_started':
      return `Turn started: ${formatParticipant(event.participantId)}.`;
    case 'turn_skipped':
      return `Turn skipped: ${formatParticipant(event.participantId)} (${event.reason}).`;
    case 'encounter_started':
      return undefined;
  }
}
