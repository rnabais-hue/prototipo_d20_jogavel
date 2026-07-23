import { describe, expect, it } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import { buildTacticalParticipant, type TacticalParticipant } from './tacticalParticipant';
import {
  createTacticalEncounter,
  declareAction,
  endTurn,
  getActiveParticipant,
  getEncounterOutcome,
  hasParticipant,
  isEncounterResolved,
  isParticipantDefeated,
  isParticipantTurn,
  listParticipantsByTeam,
  type ParticipantLifeInput,
  type TacticalEncounter,
} from './tacticalEncounter';

describe('createTacticalEncounter', () => {
  it('creates an encounter with already built participants and runtime life', () => {
    const [first, second] = buildParticipants();

    const result = createTacticalEncounter({
      id: 'encounter-1',
      participants: [first, second],
      teamByParticipantId: {
        'participant-1': 'team-a',
        'participant-2': 'team-b',
      },
      lifeByParticipantId: {
        'participant-1': { maximum: 12 },
        'participant-2': { current: 4, maximum: 8 },
      },
      turnOrder: ['participant-2', 'participant-1'],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.participants).toEqual([
      {
        ...first,
        teamId: 'team-a',
        life: { current: 12, maximum: 12 },
        defeated: false,
      },
      {
        ...second,
        teamId: 'team-b',
        life: { current: 4, maximum: 8 },
        defeated: false,
      },
    ]);
    expect(result.events[0]).toEqual({
      type: 'encounter_started',
      encounterId: 'encounter-1',
      participantIds: ['participant-1', 'participant-2'],
      teamIds: ['team-a', 'team-b'],
      turnOrder: ['participant-2', 'participant-1'],
    });
  });

  it('marks a participant with zero current life as defeated on creation', () => {
    const [first, second] = buildParticipants();

    const result = createTacticalEncounter({
      id: 'encounter-1',
      participants: [first, second],
      teamByParticipantId: {
        'participant-1': 'team-a',
        'participant-2': 'team-b',
      },
      lifeByParticipantId: {
        'participant-1': { current: 0, maximum: 10 },
        'participant-2': { maximum: 8 },
      },
      turnOrder: ['participant-1', 'participant-2'],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.participants[0].life).toEqual({ current: 0, maximum: 10 });
    expect(result.encounter.participants[0].defeated).toBe(true);
    expect(isParticipantDefeated(result.encounter.participants[0])).toBe(true);
  });

  it('sets the first participant in the supplied order as active', () => {
    const [first, second] = buildParticipants();

    const result = createTacticalEncounter({
      id: 'encounter-1',
      participants: [first, second],
      teamByParticipantId: {
        'participant-1': 'team-a',
        'participant-2': 'team-b',
      },
      lifeByParticipantId: createLifeByParticipantId(),
      turnOrder: ['participant-2', 'participant-1'],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.activeTurn).toEqual({
      participantId: 'participant-2',
      turnOrderIndex: 0,
      roundNumber: 1,
      turnNumber: 1,
      mainActionAvailable: true,
    });
    expect(result.events[1]).toEqual({
      type: 'turn_started',
      encounterId: 'encounter-1',
      participantId: 'participant-2',
      turnOrderIndex: 0,
      roundNumber: 1,
      turnNumber: 1,
      mainActionAvailable: true,
    });
  });

  it('starts on the first non-defeated participant and keeps the supplied turn order', () => {
    const [first, second] = buildParticipants();

    const result = createTacticalEncounter({
      id: 'encounter-1',
      participants: [first, second],
      teamByParticipantId: {
        'participant-1': 'team-a',
        'participant-2': 'team-b',
      },
      lifeByParticipantId: {
        'participant-1': { current: 0, maximum: 12 },
        'participant-2': { maximum: 8 },
      },
      turnOrder: ['participant-1', 'participant-2'],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.turnOrder).toEqual(['participant-1', 'participant-2']);
    expect(result.encounter.activeTurn).toEqual({
      participantId: 'participant-2',
      turnOrderIndex: 1,
      roundNumber: 1,
      turnNumber: 2,
      mainActionAvailable: true,
    });
    expect(result.events).toEqual([
      {
        type: 'encounter_started',
        encounterId: 'encounter-1',
        participantIds: ['participant-1', 'participant-2'],
        teamIds: ['team-a', 'team-b'],
        turnOrder: ['participant-1', 'participant-2'],
      },
      {
        type: 'turn_skipped',
        encounterId: 'encounter-1',
        participantId: 'participant-1',
        reason: 'defeated',
        roundNumber: 1,
        turnNumber: 1,
      },
      {
        type: 'turn_started',
        encounterId: 'encounter-1',
        participantId: 'participant-2',
        turnOrderIndex: 1,
        roundNumber: 1,
        turnNumber: 2,
        mainActionAvailable: true,
      },
    ]);
    expect(result.events.map((event) => event.type)).not.toContain('encounter_ended');
    expect(result.events.map((event) => event.type)).not.toContain('victory_declared');
  });

  it('returns a structured error when all turn order participants are defeated', () => {
    const [first, second] = buildParticipants();

    expect(
      createTacticalEncounter({
        id: 'encounter-1',
        participants: [first, second],
        teamByParticipantId: {
          'participant-1': 'team-a',
          'participant-2': 'team-b',
        },
        lifeByParticipantId: {
          'participant-1': { current: 0, maximum: 12 },
          'participant-2': { current: 0, maximum: 8 },
        },
        turnOrder: ['participant-1', 'participant-2'],
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'no_active_participants',
      },
    });
  });

  it('returns a structured error for missing participant life', () => {
    const [first] = buildParticipants();

    expect(
      createTacticalEncounter({
        id: 'encounter-1',
        participants: [first],
        teamByParticipantId: {
          'participant-1': 'team-a',
        },
        lifeByParticipantId: {},
        turnOrder: ['participant-1'],
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'missing_participant_life',
        participantId: 'participant-1',
      },
    });
  });

  it('returns a structured error for invalid participant life', () => {
    const [first] = buildParticipants();

    expect(
      createTacticalEncounter({
        id: 'encounter-1',
        participants: [first],
        teamByParticipantId: {
          'participant-1': 'team-a',
        },
        lifeByParticipantId: {
          'participant-1': { current: 11, maximum: 10 },
        },
        turnOrder: ['participant-1'],
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'invalid_participant_life',
        participantId: 'participant-1',
        current: 11,
        maximum: 10,
      },
    });
  });

  it('returns a structured error for an unknown id in the turn order', () => {
    const [first] = buildParticipants();

    expect(
      createTacticalEncounter({
        id: 'encounter-1',
        participants: [first],
        teamByParticipantId: {
          'participant-1': 'team-a',
        },
        lifeByParticipantId: createLifeByParticipantId(),
        turnOrder: ['missing-participant'],
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'unknown_turn_order_participant',
        participantId: 'missing-participant',
      },
    });
  });

  it('returns a structured error for a duplicate participant in the turn order', () => {
    const [first, second] = buildParticipants();

    expect(
      createTacticalEncounter({
        id: 'encounter-1',
        participants: [first, second],
        teamByParticipantId: {
          'participant-1': 'team-a',
          'participant-2': 'team-b',
        },
        lifeByParticipantId: createLifeByParticipantId(),
        turnOrder: ['participant-1', 'participant-1'],
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'duplicate_turn_order_participant',
        participantId: 'participant-1',
      },
    });
  });

  it('returns a structured error for an empty encounter', () => {
    expect(
      createTacticalEncounter({
        id: 'encounter-1',
        participants: [],
        teamByParticipantId: {},
        lifeByParticipantId: {},
        turnOrder: [],
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'empty_encounter',
      },
    });
  });
});

describe('declareAction', () => {
  it('declares an available action for the active participant', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    const result = declareAction({
      encounter,
      participantId: 'participant-1',
      actionId: 'basic_strike',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.activeTurn).toEqual({
      ...encounter.activeTurn,
      mainActionAvailable: false,
    });
    expect(result.events).toEqual([
      {
        type: 'action_declared',
        encounterId: 'encounter-1',
        participantId: 'participant-1',
        actionId: 'basic_strike',
        roundNumber: 1,
        turnNumber: 1,
      },
      {
        type: 'main_action_spent',
        encounterId: 'encounter-1',
        participantId: 'participant-1',
        actionId: 'basic_strike',
        roundNumber: 1,
        turnNumber: 1,
        mainActionAvailable: false,
      },
    ]);
  });

  it('returns a structured error when the encounter state is missing', () => {
    expect(
      declareAction({
        encounter: undefined,
        participantId: 'participant-1',
        actionId: 'basic_strike',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'missing_encounter',
      },
    });
  });

  it('rejects a participant that does not exist', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    expect(
      declareAction({
        encounter,
        participantId: 'missing-participant',
        actionId: 'basic_strike',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'unknown_participant',
        participantId: 'missing-participant',
      },
    });
  });

  it('rejects a participant outside the active turn', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    expect(
      declareAction({
        encounter,
        participantId: 'participant-2',
        actionId: 'basic_strike',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'participant_not_active',
        participantId: 'participant-2',
        activeParticipantId: 'participant-1',
      },
    });
  });
  it('rejects a defeated active participant', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2'], {
      'participant-1': { current: 0, maximum: 12 },
      'participant-2': { maximum: 8 },
    });
    const encounterWithDefeatedActiveTurn: TacticalEncounter = {
      ...encounter,
      activeTurn: {
        participantId: 'participant-1',
        turnOrderIndex: 0,
        roundNumber: 1,
        turnNumber: 1,
        mainActionAvailable: true,
      },
    };

    expect(
      declareAction({
        encounter: encounterWithDefeatedActiveTurn,
        participantId: 'participant-1',
        actionId: 'basic_strike',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'participant_defeated',
        participantId: 'participant-1',
      },
    });
  });

  it('rejects an action that is not available to the participant', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    expect(
      declareAction({
        encounter,
        participantId: 'participant-1',
        actionId: 'unavailable_action',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'action_not_available',
        participantId: 'participant-1',
        actionId: 'unavailable_action',
      },
    });
  });

  it('rejects declaring an action when the main action was already spent', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);
    const declared = declareAction({
      encounter,
      participantId: 'participant-1',
      actionId: 'basic_strike',
    });

    if (!declared.ok) {
      throw new Error(declared.error.code);
    }

    expect(
      declareAction({
        encounter: declared.encounter,
        participantId: 'participant-1',
        actionId: 'basic_strike',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'main_action_unavailable',
        participantId: 'participant-1',
      },
    });
  });

  it('lets endTurn start the next turn with the main action available', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);
    const declared = declareAction({
      encounter,
      participantId: 'participant-1',
      actionId: 'basic_strike',
    });

    if (!declared.ok) {
      throw new Error(declared.error.code);
    }

    expect(requireEndedTurn(endTurn(declared.encounter)).activeTurn).toEqual({
      participantId: 'participant-2',
      turnOrderIndex: 1,
      roundNumber: 1,
      turnNumber: 2,
      mainActionAvailable: true,
    });
  });
});

describe('endTurn', () => {
  it('advances to the next participant in the supplied order', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    const result = endTurn(encounter);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.activeTurn).toEqual({
      participantId: 'participant-2',
      turnOrderIndex: 1,
      roundNumber: 1,
      turnNumber: 2,
      mainActionAvailable: true,
    });
    expect(result.events).toEqual([
      {
        type: 'turn_ended',
        encounterId: 'encounter-1',
        participantId: 'participant-1',
        turnOrderIndex: 0,
        roundNumber: 1,
        turnNumber: 1,
      },
      {
        type: 'turn_started',
        encounterId: 'encounter-1',
        participantId: 'participant-2',
        turnOrderIndex: 1,
        roundNumber: 1,
        turnNumber: 2,
        mainActionAvailable: true,
      },
    ]);
  });

  it('wraps back to the first participant after the last one', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    const afterFirstTurn = requireEndedTurn(endTurn(encounter));
    const afterSecondTurn = endTurn(afterFirstTurn);

    expect(afterSecondTurn.ok).toBe(true);
    if (!afterSecondTurn.ok) {
      return;
    }

    expect(afterSecondTurn.encounter.activeTurn).toEqual({
      participantId: 'participant-1',
      turnOrderIndex: 0,
      roundNumber: 2,
      turnNumber: 3,
      mainActionAvailable: true,
    });
  });
  it('skips defeated participants and starts the next active turn', () => {
    const encounter = createReadyEncounter(
      ['participant-1', 'participant-2', 'participant-3'],
      {
        'participant-1': { maximum: 12 },
        'participant-2': { current: 0, maximum: 8 },
        'participant-3': { maximum: 10 },
      },
    );

    const result = endTurn(encounter);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.activeTurn).toEqual({
      participantId: 'participant-3',
      turnOrderIndex: 2,
      roundNumber: 1,
      turnNumber: 3,
      mainActionAvailable: true,
    });
    expect(result.events).toEqual([
      {
        type: 'turn_ended',
        encounterId: 'encounter-1',
        participantId: 'participant-1',
        turnOrderIndex: 0,
        roundNumber: 1,
        turnNumber: 1,
      },
      {
        type: 'turn_skipped',
        encounterId: 'encounter-1',
        participantId: 'participant-2',
        reason: 'defeated',
        roundNumber: 1,
        turnNumber: 2,
      },
      {
        type: 'turn_started',
        encounterId: 'encounter-1',
        participantId: 'participant-3',
        turnOrderIndex: 2,
        roundNumber: 1,
        turnNumber: 3,
        mainActionAvailable: true,
      },
    ]);
  });

  it('preserves defeated participants in the encounter and original turn order', () => {
    const encounter = createReadyEncounter(
      ['participant-1', 'participant-2', 'participant-3'],
      {
        'participant-1': { maximum: 12 },
        'participant-2': { current: 0, maximum: 8 },
        'participant-3': { maximum: 10 },
      },
    );

    const result = endTurn(encounter);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.turnOrder).toEqual([
      'participant-1',
      'participant-2',
      'participant-3',
    ]);
    expect(result.encounter.participants.map((participant) => participant.id)).toEqual([
      'participant-1',
      'participant-2',
      'participant-3',
    ]);
    expect(result.encounter.participants[1].defeated).toBe(true);
  });

  it('returns a structured error instead of looping when all participants are defeated', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);
    const allDefeatedEncounter: TacticalEncounter = {
      ...encounter,
      participants: encounter.participants.map((participant) => ({
        ...participant,
        life: {
          ...participant.life,
          current: 0,
        },
        defeated: true,
      })),
    };

    expect(endTurn(allDefeatedEncounter)).toEqual({
      ok: false,
      error: {
        code: 'no_active_participants',
      },
    });
  });

  it('does not emit victory or encounter end events when only defeated participants are skipped', () => {
    const encounter = createReadyEncounter(
      ['participant-1', 'participant-2', 'participant-3'],
      {
        'participant-1': { maximum: 12 },
        'participant-2': { current: 0, maximum: 8 },
        'participant-3': { maximum: 10 },
      },
    );

    const result = endTurn(encounter);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.events.map((event) => event.type)).toEqual([
      'turn_ended',
      'turn_skipped',
      'turn_started',
    ]);
  });
});

describe('encounter read helpers', () => {
  it('returns the active participant', () => {
    const encounter = createReadyEncounter(['participant-2', 'participant-1']);

    expect(getActiveParticipant(encounter)?.id).toBe('participant-2');
  });

  it('lists participants by team', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    expect(
      listParticipantsByTeam(encounter, 'team-a').map((participant) => participant.id),
    ).toEqual(['participant-1']);
  });

  it('checks participant existence and active turn ownership', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    expect(hasParticipant(encounter, 'participant-1')).toBe(true);
    expect(hasParticipant(encounter, 'missing-participant')).toBe(false);
    expect(isParticipantTurn(encounter, 'participant-1')).toBe(true);
    expect(isParticipantTurn(encounter, 'participant-2')).toBe(false);
  });

  it('reports an ongoing outcome when active participants remain on multiple teams', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    expect(getEncounterOutcome(encounter)).toEqual({
      status: 'ongoing',
      activeTeamIds: ['team-a', 'team-b'],
    });
    expect(isEncounterResolved(encounter)).toBe(false);
  });

  it('reports a resolved outcome with the only active team as winner', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2'], {
      'participant-1': { maximum: 12 },
      'participant-2': { current: 0, maximum: 8 },
    });

    expect(getEncounterOutcome(encounter)).toEqual({
      status: 'resolved',
      winningTeamId: 'team-a',
    });
    expect(isEncounterResolved(encounter)).toBe(true);
  });

  it('reports no_active_participants when no active participant remains', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);
    const allDefeatedEncounter: TacticalEncounter = {
      ...encounter,
      participants: encounter.participants.map((participant) => ({
        ...participant,
        life: {
          ...participant.life,
          current: 0,
        },
        defeated: true,
      })),
    };

    expect(getEncounterOutcome(allDefeatedEncounter)).toEqual({
      status: 'no_active_participants',
    });
    expect(isEncounterResolved(allDefeatedEncounter)).toBe(true);
  });

  it('reads the encounter outcome without mutating encounter state or emitting events', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);
    const beforeRead = structuredClone(encounter);

    const first = getEncounterOutcome(encounter);
    const second = getEncounterOutcome(encounter);

    expect(first).toEqual(second);
    expect(encounter).toEqual(beforeRead);
  });
});

function requireEndedTurn(result: ReturnType<typeof endTurn>): TacticalEncounter {
  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.encounter;
}

function createReadyEncounter(
  turnOrder: readonly string[],
  lifeByParticipantId: Readonly<Record<string, ParticipantLifeInput>> =
    createLifeByParticipantId(),
): TacticalEncounter {
  const participants = turnOrder.map((participantId) =>
    buildParticipant(participantId, participantId),
  );
  const result = createTacticalEncounter({
    id: 'encounter-1',
    participants,
    teamByParticipantId: createTeamByParticipantId(turnOrder),
    lifeByParticipantId,
    turnOrder,
  });

  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.encounter;
}

function createTeamByParticipantId(
  participantIds: readonly string[],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    participantIds.map((participantId, index) => [
      participantId,
      index === 0 ? 'team-a' : 'team-b',
    ]),
  );
}

function createLifeByParticipantId() {
  return {
    'participant-1': { maximum: 12 },
    'participant-2': { maximum: 8 },
  };
}

function buildParticipants(): readonly TacticalParticipant[] {
  return [
    buildParticipant('participant-1', 'Participant One'),
    buildParticipant('participant-2', 'Participant Two'),
  ];
}

function buildParticipant(id: string, name: string): TacticalParticipant {
  const result = buildTacticalParticipant(mvpTacticalCatalogs, {
    id,
    name,
    ancestryId: 'baseline_origin',
    archetypeId: 'martial_vanguard',
    attributePresetId: 'balanced_start',
  });

  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.participant;
}

