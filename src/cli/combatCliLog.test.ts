import { describe, expect, it } from 'vitest';
import { formatCombatCliEvent } from './combatCliLog';

const nameParticipant = (participantId: string): string =>
  participantId === 'player_actor' ? 'Training Vanguard' : 'Practice Raider';

describe('formatCombatCliEvent', () => {
  it('omits low-level action and check events', () => {
    expect(
      formatCombatCliEvent(
        {
          type: 'action_declared',
          encounterId: 'encounter',
          participantId: 'player_actor',
          actionId: 'basic_strike',
          roundNumber: 1,
          turnNumber: 1,
        },
        nameParticipant,
      ),
    ).toBeUndefined();

    expect(
      formatCombatCliEvent(
        {
          type: 'check_resolved',
          roll: 10,
          modifierTotal: 5,
          total: 15,
          target: 11,
          success: true,
        },
        nameParticipant,
      ),
    ).toBeUndefined();
  });

  it('keeps combat-facing attack and damage events', () => {
    expect(
      formatCombatCliEvent(
        {
          type: 'attack_hit',
          total: 15,
          defense: 11,
        },
        nameParticipant,
      ),
    ).toBe('Attack hit with total 15 vs 11.');

    expect(
      formatCombatCliEvent(
        {
          type: 'damage_applied',
          encounterId: 'encounter',
          sourceId: 'player_actor',
          targetId: 'test_opponent',
          amount: 4,
          previousLife: 8,
          currentLife: 4,
        },
        nameParticipant,
      ),
    ).toBe('Practice Raider takes 4 damage: 8 -> 4.');
  });
});
