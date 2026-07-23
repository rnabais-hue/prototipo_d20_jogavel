import { describe, expect, it, vi } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import {
  type BasicAttackWithDamageResult,
  resolveBasicAttackWithDamage,
} from './attackDamage';
import { createMinimalCombatEncounterFixture } from './combatFixtures';
import {
  endTurn,
  getEncounterOutcome,
  type EndTurnResult,
  type TacticalEncounter,
} from './tacticalEncounter';

describe('minimal tactical combat smoke flow', () => {
  it('resolves a deterministic two-participant combat loop through outcome', () => {
    const random = vi.spyOn(Math, 'random');

    try {
      const fixture = createMinimalCombatEncounterFixture({
        playerLife: { maximum: 12 },
        opponentLife: { maximum: 8 },
        turnOrder: ['player_actor', 'test_opponent'],
      });
      const { ids } = fixture;

      expect(fixture.encounter.turnOrder).toEqual([
        ids.playerId,
        ids.opponentId,
      ]);
      expect(fixture.encounter.activeTurn.participantId).toBe(ids.playerId);
      expect(getEncounterOutcome(fixture.encounter)).toEqual({
        status: 'ongoing',
        activeTeamIds: [ids.playerTeamId, ids.opponentTeamId],
      });

      const firstPlayerAttack = requireAttackResult(
        resolveBasicAttackWithDamage({
          encounter: fixture.encounter,
          attackerId: ids.playerId,
          targetId: ids.opponentId,
          actionId: ids.offensiveActionId,
          roll: 12,
          defense: 10,
          damageAmount: 3,
          actionDefinitions: mvpTacticalCatalogs.actions,
        }),
      );

      expect(firstPlayerAttack.events.map((event) => event.type)).toEqual([
        'action_declared',
        'main_action_spent',
        'check_resolved',
        'attack_hit',
        'damage_applied',
      ]);
      expect(findParticipant(firstPlayerAttack.encounter, ids.opponentId)?.life).toEqual({
        current: 5,
        maximum: 8,
      });
      expect(getEncounterOutcome(firstPlayerAttack.encounter)).toEqual({
        status: 'ongoing',
        activeTeamIds: [ids.playerTeamId, ids.opponentTeamId],
      });

      const opponentTurn = requireEndTurn(endTurn(firstPlayerAttack.encounter));
      expect(opponentTurn.events.map((event) => event.type)).toEqual([
        'turn_ended',
        'turn_started',
      ]);
      expect(opponentTurn.encounter.activeTurn.participantId).toBe(ids.opponentId);

      const opponentAttack = requireAttackResult(
        resolveBasicAttackWithDamage({
          encounter: opponentTurn.encounter,
          attackerId: ids.opponentId,
          targetId: ids.playerId,
          actionId: ids.offensiveActionId,
          roll: 4,
          defense: 10,
          damageAmount: 1,
          actionDefinitions: mvpTacticalCatalogs.actions,
        }),
      );

      expect(opponentAttack.events.map((event) => event.type)).toEqual([
        'action_declared',
        'main_action_spent',
        'check_resolved',
        'attack_missed',
      ]);
      expect(findParticipant(opponentAttack.encounter, ids.playerId)?.life).toEqual({
        current: 12,
        maximum: 12,
      });
      expect(getEncounterOutcome(opponentAttack.encounter)).toEqual({
        status: 'ongoing',
        activeTeamIds: [ids.playerTeamId, ids.opponentTeamId],
      });

      const secondPlayerTurn = requireEndTurn(endTurn(opponentAttack.encounter));
      expect(secondPlayerTurn.events.map((event) => event.type)).toEqual([
        'turn_ended',
        'turn_started',
      ]);
      expect(secondPlayerTurn.encounter.activeTurn.participantId).toBe(ids.playerId);

      const finalPlayerAttack = requireAttackResult(
        resolveBasicAttackWithDamage({
          encounter: secondPlayerTurn.encounter,
          attackerId: ids.playerId,
          targetId: ids.opponentId,
          actionId: ids.offensiveActionId,
          roll: 15,
          defense: 10,
          damageAmount: 5,
          actionDefinitions: mvpTacticalCatalogs.actions,
        }),
      );

      expect(finalPlayerAttack.events.map((event) => event.type)).toEqual([
        'action_declared',
        'main_action_spent',
        'check_resolved',
        'attack_hit',
        'damage_applied',
        'participant_defeated',
      ]);
      expect(finalPlayerAttack.encounter.turnOrder).toEqual([
        ids.playerId,
        ids.opponentId,
      ]);
      expect(findParticipant(finalPlayerAttack.encounter, ids.opponentId)).toMatchObject({
        defeated: true,
        life: {
          current: 0,
          maximum: 8,
        },
      });
      expect(getEncounterOutcome(finalPlayerAttack.encounter)).toEqual({
        status: 'resolved',
        winningTeamId: ids.playerTeamId,
      });

      const eventTypes = [
        ...fixture.events,
        ...firstPlayerAttack.events,
        ...opponentTurn.events,
        ...opponentAttack.events,
        ...secondPlayerTurn.events,
        ...finalPlayerAttack.events,
      ].map((event) => event.type);

      expect(eventTypes).not.toContain('encounter_ended');
      expect(eventTypes).not.toContain('victory_declared');
      expect(random).not.toHaveBeenCalled();
      expect(typeof window).toBe('undefined');
      expect(typeof document).toBe('undefined');
    } finally {
      random.mockRestore();
    }
  });
});

function requireAttackResult(
  result: BasicAttackWithDamageResult,
): Extract<BasicAttackWithDamageResult, { ok: true }> {
  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result;
}

function requireEndTurn(result: EndTurnResult): Extract<EndTurnResult, { ok: true }> {
  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result;
}

function findParticipant(encounter: TacticalEncounter, participantId: string) {
  return encounter.participants.find((participant) => participant.id === participantId);
}
