import { describe, expect, it } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import { resolveBasicAttack } from './basicAttack';
import {
  buildTacticalParticipant,
  type ActionDefinition,
  type TacticalCatalogs,
  type TacticalParticipant,
} from './tacticalParticipant';
import {
  createTacticalEncounter,
  declareAction,
  type TacticalEncounter,
} from './tacticalEncounter';

describe('resolveBasicAttack', () => {
  it('hits when total equals defense', () => {
    const result = resolveBasicAttack(
      createAttackInput({
        roll: 10,
        defense: 12,
        modifiers: [{ sourceId: 'training', value: 2 }],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.outcome).toBe('hit');
    expect(result.check.total).toBe(12);
  });

  it('hits when total exceeds defense', () => {
    const result = resolveBasicAttack(createAttackInput({ roll: 15, defense: 12 }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.outcome).toBe('hit');
    expect(result.check.success).toBe(true);
  });

  it('misses when total is below defense', () => {
    const result = resolveBasicAttack(createAttackInput({ roll: 8, defense: 12 }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.outcome).toBe('miss');
    expect(result.check.success).toBe(false);
  });

  it('spends the main action', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    const result = resolveBasicAttack(createAttackInput({ encounter }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.activeTurn).toEqual({
      ...encounter.activeTurn,
      mainActionAvailable: false,
    });
  });

  it('emits structured events in resolution order', () => {
    const result = resolveBasicAttack(
      createAttackInput({
        roll: 11,
        defense: 10,
        modifiers: [{ sourceId: 'attribute', value: 1 }],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

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
      {
        type: 'check_resolved',
        checkId: 'attack-check-1',
        actorId: 'participant-1',
        roll: 11,
        modifiers: [{ sourceId: 'attribute', value: 1 }],
        modifierTotal: 1,
        total: 12,
        target: 10,
        success: true,
      },
      {
        type: 'attack_hit',
        encounterId: 'encounter-1',
        attackerId: 'participant-1',
        targetId: 'participant-2',
        actionId: 'basic_strike',
        checkId: 'attack-check-1',
        total: 12,
        defense: 10,
        roundNumber: 1,
        turnNumber: 1,
      },
    ]);
  });

  it('rejects a missing encounter', () => {
    expect(resolveBasicAttack(createAttackInput({ encounter: undefined }))).toEqual({
      ok: false,
      error: {
        code: 'missing_encounter',
      },
    });
  });

  it('rejects an unknown attacker', () => {
    expect(resolveBasicAttack(createAttackInput({ attackerId: 'missing' }))).toEqual({
      ok: false,
      error: {
        code: 'unknown_attacker',
        attackerId: 'missing',
      },
    });
  });

  it('rejects an unknown target', () => {
    expect(resolveBasicAttack(createAttackInput({ targetId: 'missing' }))).toEqual({
      ok: false,
      error: {
        code: 'unknown_target',
        targetId: 'missing',
      },
    });
  });

  it('rejects an attacker outside the active turn', () => {
    expect(
      resolveBasicAttack(createAttackInput({ attackerId: 'participant-2' })),
    ).toEqual({
      ok: false,
      error: {
        code: 'attacker_not_active',
        attackerId: 'participant-2',
        activeParticipantId: 'participant-1',
      },
    });
  });
  it('rejects a defeated attacker', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2'], {
      lifeByParticipantId: {
        'participant-1': { current: 0, maximum: 12 },
        'participant-2': { maximum: 8 },
      },
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

    expect(resolveBasicAttack(createAttackInput({ encounter: encounterWithDefeatedActiveTurn }))).toEqual({
      ok: false,
      error: {
        code: 'attacker_defeated',
        attackerId: 'participant-1',
      },
    });
  });

  it('rejects an unavailable action', () => {
    expect(resolveBasicAttack(createAttackInput({ actionId: 'missing_action' }))).toEqual({
      ok: false,
      error: {
        code: 'action_not_available',
        attackerId: 'participant-1',
        actionId: 'missing_action',
      },
    });
  });

  it('rejects a non-offensive action', () => {
    const guardStance = {
      id: 'guard_stance',
      name: 'Guard Stance',
      kind: 'utility' as const,
    };
    const encounter = createReadyEncounter(['participant-1', 'participant-2'], {
      participantOneActionIds: ['guard_stance'],
      extraActions: [guardStance],
    });

    expect(
      resolveBasicAttack(
        createAttackInput({
          encounter,
          actionId: 'guard_stance',
          actionDefinitions: [...mvpTacticalCatalogs.actions, guardStance],
        }),
      ),
    ).toEqual({
      ok: false,
      error: {
        code: 'action_not_offensive',
        actionId: 'guard_stance',
      },
    });
  });

  it('rejects an attack when the main action is already spent', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);
    const declared = declareAction({
      encounter,
      participantId: 'participant-1',
      actionId: 'basic_strike',
    });

    if (!declared.ok) {
      throw new Error(declared.error.code);
    }

    expect(resolveBasicAttack(createAttackInput({ encounter: declared.encounter }))).toEqual({
      ok: false,
      error: {
        code: 'main_action_unavailable',
        attackerId: 'participant-1',
      },
    });
  });

  it('returns an invalid check error for an invalid roll', () => {
    expect(resolveBasicAttack(createAttackInput({ roll: 0 }))).toEqual({
      ok: false,
      error: {
        code: 'invalid_check',
        error: {
          code: 'invalid_roll',
          roll: 0,
        },
      },
    });
  });

  it('does not alter participant data, status, or life', () => {
    const encounter = createReadyEncounter(['participant-1', 'participant-2']);

    const result = resolveBasicAttack(createAttackInput({ encounter }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.participants).toEqual(encounter.participants);
  });

  it('uses action data instead of a specific MVP action id', () => {
    const wideCut = {
      id: 'wide_cut',
      name: 'Wide Cut',
      kind: 'offensive' as const,
    };
    const encounter = createReadyEncounter(['participant-1', 'participant-2'], {
      participantOneActionIds: ['wide_cut'],
      extraActions: [wideCut],
    });

    const result = resolveBasicAttack(
      createAttackInput({
        encounter,
        actionId: 'wide_cut',
        actionDefinitions: [wideCut],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.events.map((event) => event.type)).toEqual([
      'action_declared',
      'main_action_spent',
      'check_resolved',
      'attack_hit',
    ]);
  });
});

type AttackInputOverrides = Partial<Parameters<typeof resolveBasicAttack>[0]>;

function createAttackInput(overrides: AttackInputOverrides = {}) {
  return {
    encounter: createReadyEncounter(['participant-1', 'participant-2']),
    attackerId: 'participant-1',
    targetId: 'participant-2',
    actionId: 'basic_strike',
    roll: 10,
    defense: 10,
    modifiers: [],
    actionDefinitions: mvpTacticalCatalogs.actions,
    checkId: 'attack-check-1',
    ...overrides,
  };
}

function createReadyEncounter(
  turnOrder: readonly string[],
  options: {
    participantOneActionIds?: readonly string[];
    extraActions?: readonly ActionDefinition[];
    lifeByParticipantId?: Readonly<Record<string, { current?: number; maximum: number }>>;
  } = {},
): TacticalEncounter {
  const [first, second] = buildParticipants(
    options.participantOneActionIds,
    options.extraActions,
  );
  const result = createTacticalEncounter({
    id: 'encounter-1',
    participants: [first, second],
    teamByParticipantId: {
      'participant-1': 'team-a',
      'participant-2': 'team-b',
    },
    lifeByParticipantId: options.lifeByParticipantId ?? {
      'participant-1': { maximum: 12 },
      'participant-2': { maximum: 8 },
    },
    turnOrder,
  });

  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.encounter;
}

function buildParticipants(
  participantOneActionIds?: readonly string[],
  extraActions: readonly ActionDefinition[] = [],
): readonly TacticalParticipant[] {
  return [
    buildParticipant('participant-1', 'Participant One', participantOneActionIds, extraActions),
    buildParticipant('participant-2', 'Participant Two', undefined, extraActions),
  ];
}

function buildParticipant(
  id: string,
  name: string,
  actionIds?: readonly string[],
  extraActions: readonly ActionDefinition[] = [],
): TacticalParticipant {
  const catalogs: TacticalCatalogs = {
    ...mvpTacticalCatalogs,
    actions: [...mvpTacticalCatalogs.actions, ...extraActions],
  };
  const result = buildTacticalParticipant(catalogs, {
    id,
    name,
    ancestryId: 'baseline_origin',
    archetypeId: 'martial_vanguard',
    attributePresetId: 'balanced_start',
    actionIds,
  });

  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.participant;
}



