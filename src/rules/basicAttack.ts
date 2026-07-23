import {
  resolveCheck,
  type CheckModifier,
  type CheckResolutionError,
  type CheckResult,
  type CheckResolvedEvent,
} from './checkResolution';
import {
  declareAction,
  type EncounterEvent,
  type TacticalEncounter,
} from './tacticalEncounter';
import type { ActionDefinition } from './tacticalParticipant';

export type BasicAttackInput = {
  encounter: TacticalEncounter | undefined;
  attackerId: string;
  targetId: string;
  actionId: string;
  roll: number;
  defense: number;
  modifiers?: readonly CheckModifier[];
  actionDefinitions: readonly ActionDefinition[];
  checkId?: string;
};

export type AttackOutcome = 'hit' | 'miss';

export type AttackResolvedEvent =
  | {
      type: 'attack_hit';
      encounterId: string;
      attackerId: string;
      targetId: string;
      actionId: string;
      checkId: string;
      total: number;
      defense: number;
      roundNumber: number;
      turnNumber: number;
    }
  | {
      type: 'attack_missed';
      encounterId: string;
      attackerId: string;
      targetId: string;
      actionId: string;
      checkId: string;
      total: number;
      defense: number;
      roundNumber: number;
      turnNumber: number;
    };

export type BasicAttackResolvedEvent =
  | EncounterEvent
  | CheckResolvedEvent
  | AttackResolvedEvent;

export type BasicAttackError =
  | {
      code: 'missing_encounter';
    }
  | {
      code: 'unknown_attacker';
      attackerId: string;
    }
  | {
      code: 'unknown_target';
      targetId: string;
    }
  | {
      code: 'attacker_not_active';
      attackerId: string;
      activeParticipantId: string;
    }
  | {
      code: 'attacker_defeated';
      attackerId: string;
    }
  | {
      code: 'action_not_available';
      attackerId: string;
      actionId: string;
    }
  | {
      code: 'action_not_offensive';
      actionId: string;
    }
  | {
      code: 'main_action_unavailable';
      attackerId: string;
    }
  | {
      code: 'invalid_check';
      error: CheckResolutionError;
    };

export type BasicAttackResult =
  | {
      ok: true;
      encounter: TacticalEncounter;
      outcome: AttackOutcome;
      check: CheckResult;
      events: readonly BasicAttackResolvedEvent[];
    }
  | {
      ok: false;
      error: BasicAttackError;
    };

export function resolveBasicAttack(input: BasicAttackInput): BasicAttackResult {
  const { encounter, attackerId, targetId, actionId } = input;
  if (!encounter) {
    return {
      ok: false,
      error: {
        code: 'missing_encounter',
      },
    };
  }

  const attacker = encounter.participants.find(
    (participant) => participant.id === attackerId,
  );
  if (!attacker) {
    return {
      ok: false,
      error: {
        code: 'unknown_attacker',
        attackerId,
      },
    };
  }

  if (encounter.activeTurn.participantId !== attackerId) {
    return {
      ok: false,
      error: {
        code: 'attacker_not_active',
        attackerId,
        activeParticipantId: encounter.activeTurn.participantId,
      },
    };
  }

  if (attacker.defeated) {
    return {
      ok: false,
      error: {
        code: 'attacker_defeated',
        attackerId,
      },
    };
  }

  const target = encounter.participants.find(
    (participant) => participant.id === targetId,
  );
  if (!target) {
    return {
      ok: false,
      error: {
        code: 'unknown_target',
        targetId,
      },
    };
  }

  if (!attacker.actionIds.includes(actionId)) {
    return {
      ok: false,
      error: {
        code: 'action_not_available',
        attackerId,
        actionId,
      },
    };
  }

  const action = input.actionDefinitions.find(
    (definition) => definition.id === actionId,
  );
  if (!action || !isOffensiveAction(action)) {
    return {
      ok: false,
      error: {
        code: 'action_not_offensive',
        actionId,
      },
    };
  }

  const check = resolveCheck({
    checkId: input.checkId ?? createBasicAttackCheckId(input),
    actorId: attackerId,
    roll: input.roll,
    target: input.defense,
    modifiers: input.modifiers,
  });
  if (!check.ok) {
    return {
      ok: false,
      error: {
        code: 'invalid_check',
        error: check.error,
      },
    };
  }

  const declared = declareAction({
    encounter,
    participantId: attackerId,
    actionId,
  });
  if (!declared.ok) {
    return {
      ok: false,
      error: mapDeclareActionError(declared.error, attackerId),
    };
  }

  const outcome: AttackOutcome = check.result.success ? 'hit' : 'miss';
  const attackEvent: AttackResolvedEvent = {
    type: check.result.success ? 'attack_hit' : 'attack_missed',
    encounterId: encounter.id,
    attackerId,
    targetId,
    actionId,
    checkId: check.result.checkId,
    total: check.result.total,
    defense: input.defense,
    roundNumber: encounter.activeTurn.roundNumber,
    turnNumber: encounter.activeTurn.turnNumber,
  };

  return {
    ok: true,
    encounter: declared.encounter,
    outcome,
    check: check.result,
    events: [...declared.events, check.result.event, attackEvent],
  };
}

function isOffensiveAction(action: ActionDefinition): boolean {
  return action.kind === 'offensive' || (action.tags ?? []).includes('offensive');
}

function createBasicAttackCheckId(input: BasicAttackInput): string {
  const turnNumber = input.encounter?.activeTurn.turnNumber ?? 'unknown';
  return `${input.attackerId}:${input.actionId}:${input.targetId}:turn-${turnNumber}`;
}

function mapDeclareActionError(
  error: Exclude<ReturnType<typeof declareAction>, { ok: true }>['error'],
  attackerId: string,
): BasicAttackError {
  switch (error.code) {
    case 'missing_encounter':
      return {
        code: 'missing_encounter',
      };
    case 'unknown_participant':
      return {
        code: 'unknown_attacker',
        attackerId: error.participantId,
      };
    case 'participant_not_active':
      return {
        code: 'attacker_not_active',
        attackerId: error.participantId,
        activeParticipantId: error.activeParticipantId,
      };
    case 'action_not_available':
      return {
        code: 'action_not_available',
        attackerId: error.participantId,
        actionId: error.actionId,
      };
    case 'main_action_unavailable':
      return {
        code: 'main_action_unavailable',
        attackerId,
      };
    case 'participant_defeated':
      return {
        code: 'attacker_defeated',
        attackerId: error.participantId,
      };
  }
}
