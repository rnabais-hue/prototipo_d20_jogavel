import { describe, expect, it, vi } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import { resolveBasicAttackWithDamage } from './attackDamage';
import {
  buildTacticalParticipant,
  type ActionDefinition,
  type TacticalCatalogs,
  type TacticalParticipant,
} from './tacticalParticipant';
import { createTacticalEncounter, type TacticalEncounter } from './tacticalEncounter';

describe('resolveBasicAttackWithDamage', () => {
  it('applies damage on a hit', () => {
    const encounter = createReadyEncounter();

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter,
        roll: 12,
        defense: 10,
        damageAmount: 3,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.outcome).toBe('hit');
    expect(result.result.damage).toEqual({ applied: true, amount: 3 });
    expect(findParticipant(result.encounter, 'participant-2')?.life).toEqual({
      current: 5,
      maximum: 8,
    });
  });

  it('does not apply damage on a miss but still spends the main action', () => {
    const encounter = createReadyEncounter();

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter,
        roll: 7,
        defense: 10,
        damageAmount: 3,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.outcome).toBe('miss');
    expect(result.result.damage).toEqual({ applied: false });
    expect(result.encounter.activeTurn).toEqual({
      ...encounter.activeTurn,
      mainActionAvailable: false,
    });
    expect(findParticipant(result.encounter, 'participant-2')?.life).toEqual({
      current: 8,
      maximum: 8,
    });
    expect(result.events.map((event) => event.type)).toEqual([
      'action_declared',
      'main_action_spent',
      'check_resolved',
      'attack_missed',
    ]);
  });

  it('emits participant_defeated when hit damage reduces life to zero', () => {
    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        roll: 15,
        defense: 10,
        damageAmount: 8,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(findParticipant(result.encounter, 'participant-2')?.defeated).toBe(true);
    expect(result.events.map((event) => event.type)).toEqual([
      'action_declared',
      'main_action_spent',
      'check_resolved',
      'attack_hit',
      'damage_applied',
      'participant_defeated',
    ]);
  });

  it.each([0, -1, 1.5])(
    'returns an error for invalid damage %s without spending the main action',
    (damageAmount) => {
      const encounter = createReadyEncounter();

      const result = resolveBasicAttackWithDamage(
        createAttackDamageInput({
          encounter,
          damageAmount,
        }),
      );

      expect(result).toEqual({
        ok: false,
        error: {
          code: 'invalid_damage_amount',
          amount: damageAmount,
        },
      });
      expect(encounter.activeTurn.mainActionAvailable).toBe(true);
      expect(findParticipant(encounter, 'participant-2')?.life.current).toBe(8);
    },
  );

  it('returns an attack_failed error for an invalid attack and does not apply damage', () => {
    const encounter = createReadyEncounter();

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter,
        attackerId: 'missing-attacker',
        damageAmount: 4,
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'attack_failed',
        error: {
          code: 'unknown_attacker',
          attackerId: 'missing-attacker',
        },
      },
    });
    expect(encounter.activeTurn.mainActionAvailable).toBe(true);
    expect(findParticipant(encounter, 'participant-2')?.life.current).toBe(8);
  });
  it('returns an attack_failed error for a defeated attacker and does not apply damage', () => {
    const encounter = createReadyEncounter({
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

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter: encounterWithDefeatedActiveTurn,
        damageAmount: 4,
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'attack_failed',
        error: {
          code: 'attacker_defeated',
          attackerId: 'participant-1',
        },
      },
    });
    expect(encounter.activeTurn.mainActionAvailable).toBe(true);
    expect(findParticipant(encounter, 'participant-2')?.life.current).toBe(8);
  });

  it('emits hit damage events in causal order', () => {
    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        roll: 11,
        defense: 10,
        modifiers: [{ sourceId: 'attribute', value: 1 }],
        damageAmount: 3,
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
      {
        type: 'damage_applied',
        encounterId: 'encounter-1',
        sourceId: 'participant-1',
        targetId: 'participant-2',
        amount: 3,
        previousLife: 8,
        currentLife: 5,
      },
    ]);
  });

  it('does not alter the attacker life', () => {
    const encounter = createReadyEncounter();

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter,
        roll: 14,
        defense: 10,
        damageAmount: 4,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(findParticipant(result.encounter, 'participant-1')?.life).toEqual(
      findParticipant(encounter, 'participant-1')?.life,
    );
  });

  it('does not alter turn order or advance the turn beyond spending the main action', () => {
    const encounter = createReadyEncounter();

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter,
        roll: 13,
        defense: 10,
        damageAmount: 2,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.turnOrder).toEqual(encounter.turnOrder);
    expect(result.encounter.activeTurn).toEqual({
      ...encounter.activeTurn,
      mainActionAvailable: false,
    });
  });

  it('uses action data instead of a specific MVP action id', () => {
    const preciseThrust = {
      id: 'precise_thrust',
      name: 'Precise Thrust',
      kind: 'offensive' as const,
    };
    const encounter = createReadyEncounter({
      participantOneActionIds: ['precise_thrust'],
      extraActions: [preciseThrust],
    });

    const result = resolveBasicAttackWithDamage(
      createAttackDamageInput({
        encounter,
        actionId: 'precise_thrust',
        actionDefinitions: [preciseThrust],
        roll: 12,
        defense: 10,
        damageAmount: 2,
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
      'damage_applied',
    ]);
  });

  it('is deterministic and does not roll randomly internally', () => {
    const random = vi.spyOn(Math, 'random');
    const input = createAttackDamageInput({
      encounter: createReadyEncounter(),
      roll: 12,
      defense: 10,
      damageAmount: 2,
    });

    const first = resolveBasicAttackWithDamage(input);
    const second = resolveBasicAttackWithDamage(input);

    expect(first).toEqual(second);
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
  });
});

type AttackDamageInputOverrides = Partial<
  Parameters<typeof resolveBasicAttackWithDamage>[0]
>;

function createAttackDamageInput(overrides: AttackDamageInputOverrides = {}) {
  return {
    encounter: createReadyEncounter(),
    attackerId: 'participant-1',
    targetId: 'participant-2',
    actionId: 'basic_strike',
    roll: 10,
    defense: 10,
    modifiers: [],
    damageAmount: 2,
    actionDefinitions: mvpTacticalCatalogs.actions,
    checkId: 'attack-check-1',
    ...overrides,
  };
}

function createReadyEncounter(
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
    turnOrder: ['participant-1', 'participant-2'],
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

function findParticipant(encounter: TacticalEncounter, participantId: string) {
  return encounter.participants.find((participant) => participant.id === participantId);
}
