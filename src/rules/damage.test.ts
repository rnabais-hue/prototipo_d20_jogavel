import { describe, expect, it } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import { applyDamage } from './damage';
import { buildTacticalParticipant, type TacticalParticipant } from './tacticalParticipant';
import { createTacticalEncounter, type TacticalEncounter } from './tacticalEncounter';

describe('applyDamage', () => {
  it('applies damage by reducing target life', () => {
    const encounter = createReadyEncounter();

    const result = applyDamage({
      encounter,
      sourceId: 'actor-alpha',
      targetId: 'actor-beta',
      amount: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(findParticipant(result.encounter, 'actor-beta')?.life).toEqual({
      current: 7,
      maximum: 10,
    });
    expect(result.events).toEqual([
      {
        type: 'damage_applied',
        encounterId: 'encounter-1',
        sourceId: 'actor-alpha',
        targetId: 'actor-beta',
        amount: 3,
        previousLife: 10,
        currentLife: 7,
      },
    ]);
  });

  it('does not reduce life below zero', () => {
    const encounter = createReadyEncounter();

    const result = applyDamage({
      encounter,
      sourceId: 'actor-alpha',
      targetId: 'actor-beta',
      amount: 30,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(findParticipant(result.encounter, 'actor-beta')?.life.current).toBe(0);
  });

  it('marks the target as defeated when damage reaches zero life', () => {
    const encounter = createReadyEncounter();

    const result = applyDamage({
      encounter,
      sourceId: 'actor-alpha',
      targetId: 'actor-beta',
      amount: 10,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(findParticipant(result.encounter, 'actor-beta')?.defeated).toBe(true);
    expect(result.events).toEqual([
      {
        type: 'damage_applied',
        encounterId: 'encounter-1',
        sourceId: 'actor-alpha',
        targetId: 'actor-beta',
        amount: 10,
        previousLife: 10,
        currentLife: 0,
      },
      {
        type: 'participant_defeated',
        encounterId: 'encounter-1',
        participantId: 'actor-beta',
        sourceId: 'actor-alpha',
      },
    ]);
  });

  it('emits participant_defeated only on the first transition to defeated', () => {
    const firstDamage = applyDamage({
      encounter: createReadyEncounter(),
      sourceId: 'actor-alpha',
      targetId: 'actor-beta',
      amount: 10,
    });

    expect(firstDamage.ok).toBe(true);
    if (!firstDamage.ok) {
      return;
    }

    const secondDamage = applyDamage({
      encounter: firstDamage.encounter,
      sourceId: 'actor-alpha',
      targetId: 'actor-beta',
      amount: 1,
    });

    expect(secondDamage.ok).toBe(true);
    if (!secondDamage.ok) {
      return;
    }

    expect(secondDamage.events).toEqual([
      {
        type: 'damage_applied',
        encounterId: 'encounter-1',
        sourceId: 'actor-alpha',
        targetId: 'actor-beta',
        amount: 1,
        previousLife: 0,
        currentLife: 0,
      },
    ]);
  });

  it('rejects a missing encounter', () => {
    expect(
      applyDamage({
        encounter: undefined,
        sourceId: 'actor-alpha',
        targetId: 'actor-beta',
        amount: 1,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'missing_encounter',
      },
    });
  });

  it('rejects an unknown source', () => {
    expect(
      applyDamage({
        encounter: createReadyEncounter(),
        sourceId: 'missing-source',
        targetId: 'actor-beta',
        amount: 1,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'unknown_source',
        sourceId: 'missing-source',
      },
    });
  });

  it('rejects an unknown target', () => {
    expect(
      applyDamage({
        encounter: createReadyEncounter(),
        sourceId: 'actor-alpha',
        targetId: 'missing-target',
        amount: 1,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'unknown_target',
        targetId: 'missing-target',
      },
    });
  });

  it.each([0, -1, 1.5])('rejects invalid damage amount %s', (amount) => {
    expect(
      applyDamage({
        encounter: createReadyEncounter(),
        sourceId: 'actor-alpha',
        targetId: 'actor-beta',
        amount,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'invalid_damage_amount',
        amount,
      },
    });
  });

  it('does not alter action state, turn order, or participant catalog data', () => {
    const encounter = createReadyEncounter();

    const result = applyDamage({
      encounter,
      sourceId: 'actor-alpha',
      targetId: 'actor-beta',
      amount: 4,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.encounter.activeTurn).toEqual(encounter.activeTurn);
    expect(result.encounter.turnOrder).toEqual(encounter.turnOrder);
    expect(findParticipant(result.encounter, 'actor-alpha')).toEqual(
      findParticipant(encounter, 'actor-alpha'),
    );
    expect(findParticipant(result.encounter, 'actor-beta')).toEqual({
      ...findParticipant(encounter, 'actor-beta'),
      life: { current: 6, maximum: 10 },
    });
  });
});

function createReadyEncounter(): TacticalEncounter {
  const result = createTacticalEncounter({
    id: 'encounter-1',
    participants: [
      buildParticipant('actor-alpha', 'Actor Alpha'),
      buildParticipant('actor-beta', 'Actor Beta'),
    ],
    teamByParticipantId: {
      'actor-alpha': 'team-a',
      'actor-beta': 'team-b',
    },
    lifeByParticipantId: {
      'actor-alpha': { maximum: 12 },
      'actor-beta': { maximum: 10 },
    },
    turnOrder: ['actor-alpha', 'actor-beta'],
  });

  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.encounter;
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

function findParticipant(encounter: TacticalEncounter, participantId: string) {
  return encounter.participants.find((participant) => participant.id === participantId);
}

