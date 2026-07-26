import type { GridCell } from '../../movement/grid';
import type { CombatSessionResolvedAttack, CombatSessionMovementResult } from '../../combat/combatSession';

export type CombatMoveEvent = {
  type: 'combatant_move';
  participantId: string;
  fromCell: GridCell;
  toCell: GridCell;
};

export type AttackAnticipationEvent = {
  type: 'attack_anticipation';
  attackerId: string;
  targetId: string;
  weaponId: string;
};

export type AttackHitEvent = {
  type: 'attack_hit';
  attackerId: string;
  targetId: string;
  damageAmount: number;
  isDefeated: boolean;
};

export type AttackMissEvent = {
  type: 'attack_miss';
  attackerId: string;
  targetId: string;
};

export type AttackRecoveryEvent = {
  type: 'attack_recovery';
  attackerId: string;
};

export type HealingAppliedEvent = {
  type: 'healing_applied';
  participantId: string;
  healingAmount: number;
};

export type CombatantDefeatedEvent = {
  type: 'combatant_defeated';
  participantId: string;
};

export type TurnChangedEvent = {
  type: 'turn_changed';
  activeParticipantId: string;
  displayName: string;
  isPlayerTurn: boolean;
};

export type CombatOutcomeEvent = {
  type: 'combat_outcome';
  status: 'victory' | 'defeat';
};

export type PresentationEvent =
  | CombatMoveEvent
  | AttackAnticipationEvent
  | AttackHitEvent
  | AttackMissEvent
  | AttackRecoveryEvent
  | HealingAppliedEvent
  | CombatantDefeatedEvent
  | TurnChangedEvent
  | CombatOutcomeEvent;

/**
 * Maps a successful movement result to a PresentationEvent.
 */
export function mapMovementToEvent(
  participantId: string,
  result: Extract<CombatSessionMovementResult, { ok: true }>
): CombatMoveEvent {
  return {
    type: 'combatant_move',
    participantId,
    fromCell: result.from,
    toCell: result.destination,
  };
}

/**
 * Maps an attack resolution to a sequence of PresentationEvents.
 */
export function mapAttackToEvents(
  attack: CombatSessionResolvedAttack,
  playerTeamId: string,
  isTargetDefeated: boolean
): PresentationEvent[] {
  const events: PresentationEvent[] = [];
  const attackerId = attack.attacker.participantId;
  const targetId = attack.target.participantId;
  const weaponId = attack.action.weapon.weaponId;

  // 1. Anticipation Event
  events.push({
    type: 'attack_anticipation',
    attackerId,
    targetId,
    weaponId,
  });

  const outcome = attack.result.outcome;
  const damageApplied = attack.result.damage.applied ? attack.result.damage.amount : 0;

  // 2. Hit or Miss Event
  if (outcome === 'hit') {
    events.push({
      type: 'attack_hit',
      attackerId,
      targetId,
      damageAmount: damageApplied,
      isDefeated: isTargetDefeated,
    });
  } else {
    events.push({
      type: 'attack_miss',
      attackerId,
      targetId,
    });
  }

  // 3. Recovery always follows contact and target reaction.
  events.push({
    type: 'attack_recovery',
    attackerId,
  });

  // 4. Defeat Event (if defeated)
  if (outcome === 'hit' && isTargetDefeated) {
    events.push({
      type: 'combatant_defeated',
      participantId: targetId,
    });
  }

  // 5. Outcome Event (if resolved)
  if (attack.outcome.status === 'resolved') {
    const isPlayerWin = attack.outcome.winningTeamId === playerTeamId;
    events.push({
      type: 'combat_outcome',
      status: isPlayerWin ? 'victory' : 'defeat',
    });
  }

  return events;
}
