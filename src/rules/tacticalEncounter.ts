import type { TacticalParticipant } from './tacticalParticipant';

export type TeamId = string;

export type ParticipantLife = {
  current: number;
  maximum: number;
};

export type ParticipantLifeInput = {
  current?: number;
  maximum: number;
};

export type EncounterParticipant = TacticalParticipant & {
  teamId: TeamId;
  life: ParticipantLife;
  defeated: boolean;
};

export type TurnOrder = readonly string[];

export type ActiveTurn = {
  participantId: string;
  turnOrderIndex: number;
  roundNumber: number;
  turnNumber: number;
  mainActionAvailable: boolean;
};

export type TacticalEncounter = {
  id: string;
  participants: readonly EncounterParticipant[];
  turnOrder: TurnOrder;
  activeTurn: ActiveTurn;
};

export type EncounterOutcome =
  | {
      status: 'ongoing';
      activeTeamIds: readonly TeamId[];
    }
  | {
      status: 'resolved';
      winningTeamId: TeamId;
    }
  | {
      status: 'no_active_participants';
    };

export type EncounterEvent =
  | {
      type: 'encounter_started';
      encounterId: string;
      participantIds: readonly string[];
      teamIds: readonly TeamId[];
      turnOrder: TurnOrder;
    }
  | {
      type: 'turn_started';
      encounterId: string;
      participantId: string;
      turnOrderIndex: number;
      roundNumber: number;
      turnNumber: number;
      mainActionAvailable: boolean;
    }
  | {
      type: 'turn_ended';
      encounterId: string;
      participantId: string;
      turnOrderIndex: number;
      roundNumber: number;
      turnNumber: number;
    }
  | {
      type: 'turn_skipped';
      encounterId: string;
      participantId: string;
      reason: 'defeated';
      roundNumber: number;
      turnNumber: number;
    }
  | {
      type: 'action_declared';
      encounterId: string;
      participantId: string;
      actionId: string;
      roundNumber: number;
      turnNumber: number;
    }
  | {
      type: 'main_action_spent';
      encounterId: string;
      participantId: string;
      actionId: string;
      roundNumber: number;
      turnNumber: number;
      mainActionAvailable: false;
    }
  | {
      type: 'damage_applied';
      encounterId: string;
      sourceId: string;
      targetId: string;
      amount: number;
      previousLife: number;
      currentLife: number;
    }
  | {
      type: 'participant_defeated';
      encounterId: string;
      participantId: string;
      sourceId: string;
    };

export type CreateEncounterInput = {
  id: string;
  participants: readonly TacticalParticipant[];
  teamByParticipantId: Readonly<Record<string, TeamId>>;
  lifeByParticipantId: Readonly<Record<string, ParticipantLifeInput>>;
  turnOrder: TurnOrder;
};

export type EncounterError =
  | {
      code: 'empty_encounter';
    }
  | {
      code: 'empty_turn_order';
    }
  | {
      code: 'duplicate_participant_id';
      participantId: string;
    }
  | {
      code: 'missing_participant_team';
      participantId: string;
    }
  | {
      code: 'missing_participant_life';
      participantId: string;
    }
  | {
      code: 'invalid_participant_life';
      participantId: string;
      current: number;
      maximum: number;
    }
  | {
      code: 'unknown_turn_order_participant';
      participantId: string;
    }
  | {
      code: 'duplicate_turn_order_participant';
      participantId: string;
    }
  | {
      code: 'no_active_participants';
    };

export type CreateEncounterResult =
  | {
      ok: true;
      encounter: TacticalEncounter;
      events: readonly EncounterEvent[];
    }
  | {
      ok: false;
      error: EncounterError;
    };

export type EncounterCommandResult = {
  encounter: TacticalEncounter;
  events: readonly EncounterEvent[];
};

export type DeclareActionInput = {
  encounter: TacticalEncounter | undefined;
  participantId: string;
  actionId: string;
};

export type DeclareActionError =
  | {
      code: 'missing_encounter';
    }
  | {
      code: 'unknown_participant';
      participantId: string;
    }
  | {
      code: 'participant_not_active';
      participantId: string;
      activeParticipantId: string;
    }
  | {
      code: 'action_not_available';
      participantId: string;
      actionId: string;
    }
  | {
      code: 'main_action_unavailable';
      participantId: string;
    }
  | {
      code: 'participant_defeated';
      participantId: string;
    };

export type DeclareActionResult =
  | {
      ok: true;
      encounter: TacticalEncounter;
      events: readonly EncounterEvent[];
    }
  | {
      ok: false;
      error: DeclareActionError;
    };

export type EndTurnError = {
  code: 'no_active_participants';
};

export type EndTurnResult =
  | {
      ok: true;
      encounter: TacticalEncounter;
      events: readonly EncounterEvent[];
    }
  | {
      ok: false;
      error: EndTurnError;
    };

export function createTacticalEncounter(
  input: CreateEncounterInput,
): CreateEncounterResult {
  if (input.participants.length === 0) {
    return {
      ok: false,
      error: {
        code: 'empty_encounter',
      },
    };
  }

  if (input.turnOrder.length === 0) {
    return {
      ok: false,
      error: {
        code: 'empty_turn_order',
      },
    };
  }

  const participantIds = new Set<string>();
  for (const participant of input.participants) {
    if (participantIds.has(participant.id)) {
      return {
        ok: false,
        error: {
          code: 'duplicate_participant_id',
          participantId: participant.id,
        },
      };
    }

    participantIds.add(participant.id);
  }

  const participants: EncounterParticipant[] = [];
  for (const participant of input.participants) {
    const teamId = input.teamByParticipantId[participant.id];
    if (!teamId) {
      return {
        ok: false,
        error: {
          code: 'missing_participant_team',
          participantId: participant.id,
        },
      };
    }

    const life = input.lifeByParticipantId[participant.id];
    if (!life) {
      return {
        ok: false,
        error: {
          code: 'missing_participant_life',
          participantId: participant.id,
        },
      };
    }

    const current = life.current ?? life.maximum;
    if (!isValidLife(current, life.maximum)) {
      return {
        ok: false,
        error: {
          code: 'invalid_participant_life',
          participantId: participant.id,
          current,
          maximum: life.maximum,
        },
      };
    }

    participants.push({
      ...participant,
      teamId,
      life: {
        current,
        maximum: life.maximum,
      },
      defeated: current === 0,
    });
  }

  const turnOrderIds = new Set<string>();
  for (const participantId of input.turnOrder) {
    if (turnOrderIds.has(participantId)) {
      return {
        ok: false,
        error: {
          code: 'duplicate_turn_order_participant',
          participantId,
        },
      };
    }

    turnOrderIds.add(participantId);

    if (!participantIds.has(participantId)) {
      return {
        ok: false,
        error: {
          code: 'unknown_turn_order_participant',
          participantId,
        },
      };
    }
  }

  const initialTurn = findInitialActiveTurn(input.id, input.turnOrder, participants);
  if (!initialTurn) {
    return {
      ok: false,
      error: {
        code: 'no_active_participants',
      },
    };
  }

  const activeTurn = initialTurn.activeTurn;
  const encounter: TacticalEncounter = {
    id: input.id,
    participants,
    turnOrder: [...input.turnOrder],
    activeTurn,
  };

  return {
    ok: true,
    encounter,
    events: [
      {
        type: 'encounter_started',
        encounterId: input.id,
        participantIds: participants.map((participant) => participant.id),
        teamIds: uniqueIds(participants.map((participant) => participant.teamId)),
        turnOrder: [...input.turnOrder],
      },
      ...initialTurn.skippedEvents,
      createTurnStartedEvent(input.id, activeTurn),
    ],
  };
}

export function declareAction(input: DeclareActionInput): DeclareActionResult {
  const { encounter, participantId, actionId } = input;
  if (!encounter) {
    return {
      ok: false,
      error: {
        code: 'missing_encounter',
      },
    };
  }

  const participant = getParticipantById(encounter, participantId);
  if (!participant) {
    return {
      ok: false,
      error: {
        code: 'unknown_participant',
        participantId,
      },
    };
  }

  if (encounter.activeTurn.participantId !== participantId) {
    return {
      ok: false,
      error: {
        code: 'participant_not_active',
        participantId,
        activeParticipantId: encounter.activeTurn.participantId,
      },
    };
  }

  if (participant.defeated) {
    return {
      ok: false,
      error: {
        code: 'participant_defeated',
        participantId,
      },
    };
  }

  if (!participant.actionIds.includes(actionId)) {
    return {
      ok: false,
      error: {
        code: 'action_not_available',
        participantId,
        actionId,
      },
    };
  }

  if (!encounter.activeTurn.mainActionAvailable) {
    return {
      ok: false,
      error: {
        code: 'main_action_unavailable',
        participantId,
      },
    };
  }

  const activeTurn: ActiveTurn = {
    ...encounter.activeTurn,
    mainActionAvailable: false,
  };
  const nextEncounter: TacticalEncounter = {
    ...encounter,
    activeTurn,
  };

  return {
    ok: true,
    encounter: nextEncounter,
    events: [
      {
        type: 'action_declared',
        encounterId: encounter.id,
        participantId,
        actionId,
        roundNumber: activeTurn.roundNumber,
        turnNumber: activeTurn.turnNumber,
      },
      {
        type: 'main_action_spent',
        encounterId: encounter.id,
        participantId,
        actionId,
        roundNumber: activeTurn.roundNumber,
        turnNumber: activeTurn.turnNumber,
        mainActionAvailable: false,
      },
    ],
  };
}

export function endTurn(encounter: TacticalEncounter): EndTurnResult {
  const endedTurn = encounter.activeTurn;
  const events: EncounterEvent[] = [
    {
      type: 'turn_ended',
      encounterId: encounter.id,
      participantId: endedTurn.participantId,
      turnOrderIndex: endedTurn.turnOrderIndex,
      roundNumber: endedTurn.roundNumber,
      turnNumber: endedTurn.turnNumber,
    },
  ];
  let nextTurnOrderIndex = endedTurn.turnOrderIndex;
  let roundNumber = endedTurn.roundNumber;
  let turnNumber = endedTurn.turnNumber;

  for (let checked = 0; checked < encounter.turnOrder.length; checked += 1) {
    nextTurnOrderIndex = (nextTurnOrderIndex + 1) % encounter.turnOrder.length;
    if (nextTurnOrderIndex === 0) {
      roundNumber += 1;
    }
    turnNumber += 1;

    const participantId = encounter.turnOrder[nextTurnOrderIndex];
    const participant = getParticipantById(encounter, participantId);
    if (participant && !participant.defeated) {
      break;
    }

    events.push({
      type: 'turn_skipped',
      encounterId: encounter.id,
      participantId,
      reason: 'defeated',
      roundNumber,
      turnNumber,
    });
  }

  const nextParticipantId = encounter.turnOrder[nextTurnOrderIndex];
  const nextParticipant = getParticipantById(encounter, nextParticipantId);
  if (!nextParticipant || nextParticipant.defeated) {
    return {
      ok: false,
      error: {
        code: 'no_active_participants',
      },
    };
  }

  const nextActiveTurn = createActiveTurn(
    nextParticipantId,
    nextTurnOrderIndex,
    roundNumber,
    turnNumber,
  );
  const nextEncounter: TacticalEncounter = {
    ...encounter,
    activeTurn: nextActiveTurn,
  };

  return {
    ok: true,
    encounter: nextEncounter,
    events: [...events, createTurnStartedEvent(encounter.id, nextActiveTurn)],
  };
}

export function getActiveParticipant(
  encounter: TacticalEncounter,
): EncounterParticipant | undefined {
  return getParticipantById(encounter, encounter.activeTurn.participantId);
}

export function listParticipantsByTeam(
  encounter: TacticalEncounter,
  teamId: TeamId,
): readonly EncounterParticipant[] {
  return encounter.participants.filter((participant) => participant.teamId === teamId);
}

export function hasParticipant(
  encounter: TacticalEncounter,
  participantId: string,
): boolean {
  return getParticipantById(encounter, participantId) !== undefined;
}

export function isParticipantTurn(
  encounter: TacticalEncounter,
  participantId: string,
): boolean {
  return encounter.activeTurn.participantId === participantId;
}

export function isParticipantDefeated(participant: EncounterParticipant): boolean {
  return participant.defeated;
}

export function getEncounterOutcome(encounter: TacticalEncounter): EncounterOutcome {
  const activeTeamIds = uniqueIds(
    encounter.participants
      .filter((participant) => !participant.defeated)
      .map((participant) => participant.teamId),
  );

  if (activeTeamIds.length === 0) {
    return {
      status: 'no_active_participants',
    };
  }

  if (activeTeamIds.length === 1) {
    return {
      status: 'resolved',
      winningTeamId: activeTeamIds[0],
    };
  }

  return {
    status: 'ongoing',
    activeTeamIds,
  };
}

export function isEncounterResolved(encounter: TacticalEncounter): boolean {
  return getEncounterOutcome(encounter).status !== 'ongoing';
}

function getParticipantById(
  encounter: TacticalEncounter,
  participantId: string,
): EncounterParticipant | undefined {
  return encounter.participants.find((participant) => participant.id === participantId);
}

function createActiveTurn(
  participantId: string,
  turnOrderIndex: number,
  roundNumber: number,
  turnNumber: number,
): ActiveTurn {
  return {
    participantId,
    turnOrderIndex,
    roundNumber,
    turnNumber,
    mainActionAvailable: true,
  };
}

function findInitialActiveTurn(
  encounterId: string,
  turnOrder: TurnOrder,
  participants: readonly EncounterParticipant[],
):
  | {
      activeTurn: ActiveTurn;
      skippedEvents: readonly EncounterEvent[];
    }
  | undefined {
  const skippedEvents: EncounterEvent[] = [];

  for (let turnOrderIndex = 0; turnOrderIndex < turnOrder.length; turnOrderIndex += 1) {
    const participantId = turnOrder[turnOrderIndex];
    const participant = participants.find((entry) => entry.id === participantId);
    const turnNumber = turnOrderIndex + 1;

    if (participant && !participant.defeated) {
      return {
        activeTurn: createActiveTurn(participantId, turnOrderIndex, 1, turnNumber),
        skippedEvents,
      };
    }

    skippedEvents.push({
      type: 'turn_skipped',
      encounterId,
      participantId,
      reason: 'defeated',
      roundNumber: 1,
      turnNumber,
    });
  }

  return undefined;
}

function createTurnStartedEvent(
  encounterId: string,
  activeTurn: ActiveTurn,
): EncounterEvent {
  return {
    type: 'turn_started',
    encounterId,
    participantId: activeTurn.participantId,
    turnOrderIndex: activeTurn.turnOrderIndex,
    roundNumber: activeTurn.roundNumber,
    turnNumber: activeTurn.turnNumber,
    mainActionAvailable: activeTurn.mainActionAvailable,
  };
}

function isValidLife(current: number, maximum: number): boolean {
  return (
    Number.isInteger(maximum) &&
    maximum > 0 &&
    Number.isInteger(current) &&
    current >= 0 &&
    current <= maximum
  );
}

function uniqueIds(ids: readonly string[]): readonly string[] {
  return [...new Set(ids)];
}

